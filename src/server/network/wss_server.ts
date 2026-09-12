// [UC-GAME-001/MSS][UC-GAME-003/MSS][UC-GAME-004/MSS][UC-GAME-006/MSS][UC-GAME-007/MSS]
// WSS Server — chạy độc lập trên WebSocket port
import { WebSocketServer, WebSocket } from 'ws';
import { RoomManager } from '../room_manager.js';
import { SessionManager, SessionState, HEARTBEAT_INTERVAL_MS } from '../session_manager.js';
import { RoomCleanupScheduler } from '../room_cleanup_scheduler.js';
import { IntentMutex } from './intent_mutex.js';
import { DeltaBroadcaster } from './delta_broadcaster.js';
import { ReconnectManager } from './reconnect_manager.js';
import { RateLimiter, type RateLimiterOptions } from '../security/rate_limiter.js';
import { EnvelopeValidator } from '../security/envelope_validator.js';
import { IntentGuard } from '../security/intent_guard.js';
import { BotTurnScheduler } from './bot_turn_scheduler.js';
import { TurnTimeoutScheduler } from './turn_timeout_scheduler.js';
import { SocketRegistry } from './socket_registry.js';
import { encodeMsg } from './network_types.js';
import type { WsServerMessage, WsClientMessage, ReasonCode } from './network_types.js';
import { isRoomGameOver } from '../../domain/room.js';

const MAX_PLAYERS = 4;

import type { WssServerConfig } from './wss_server_config.js';
export type { WssServerConfig };

export class WssServer {
  private readonly wss: WebSocketServer;
  private readonly rooms: RoomManager;
  private readonly sessions: SessionManager;
  private readonly intentMutex: IntentMutex;
  private readonly broadcaster: DeltaBroadcaster;
  private readonly reconnects: ReconnectManager;
  private readonly cleanupScheduler: RoomCleanupScheduler;
  private readonly botScheduler: BotTurnScheduler;
  private readonly turnTimeoutScheduler: TurnTimeoutScheduler;
  private readonly rateLimiter: RateLimiter;
  private readonly envelopeValidator: EnvelopeValidator;
  private readonly intentGuard: IntentGuard;
  private readonly sockets = new SocketRegistry();
  private readonly closingRooms = new Set<string>();
  private readonly heartbeatTimer: ReturnType<typeof setInterval>;
  private isClosed = false;

  constructor(config: WssServerConfig) {
    this.rooms       = config.roomManager ?? new RoomManager();
    this.sessions    = config.sessionManager ?? new SessionManager();
    this.intentMutex = config.intentMutex ?? new IntentMutex();
    this.rateLimiter = config.rateLimiter ?? new RateLimiter(config.rateLimiterOptions);
    this.envelopeValidator = config.envelopeValidator ?? new EnvelopeValidator();
    this.intentGuard = config.intentGuard ?? new IntentGuard();
    this.broadcaster = new DeltaBroadcaster(this.rooms, this.sessions, (rc, msg) => this.broadcast(rc, msg));
    this.botScheduler = new BotTurnScheduler({
      rooms: this.rooms, intentMutex: this.intentMutex, broadcaster: this.broadcaster,
      onGameOver: (rc) => this.broadcastGameOver(rc),
      onScheduleTurnTimeout: (rc) => this.turnTimeoutScheduler.scheduleTurnTimeout(rc),
    });
    this.turnTimeoutScheduler = new TurnTimeoutScheduler({
      rooms: this.rooms, intentMutex: this.intentMutex, broadcaster: this.broadcaster,
      onGameOver: (rc) => this.broadcastGameOver(rc),
      onScheduleBotTurn: (rc) => this.scheduleBotTurn(rc),
      defaultTimeoutMs: config.turnTimeoutMs,
    });
    this.broadcaster.setTimeRemainingProvider((rc) => this.turnTimeoutScheduler.getTimeRemaining(rc));
    this.reconnects  = config.reconnectManager ?? new ReconnectManager({
      rooms: this.rooms, sessions: this.sessions, broadcaster: this.broadcaster,
      broadcast: (rc, msg) => this.broadcast(rc, msg), gracePeriodMs: config.gracePeriodMs,
      isSocketConnected: (rc, pid) => {
        const s = this.sockets.getPlayerSocket(rc, pid);
        return Boolean(s && s.readyState === WebSocket.OPEN);
      },
    });
    this.cleanupScheduler = new RoomCleanupScheduler({
      roomManager: this.rooms, timeoutMs: config.abandonedTimeoutMs,
      intervalMs: config.cleanupIntervalMs, onCleanup: (rc) => this.closeRoom(rc),
    });
    this.wss         = new WebSocketServer({ port: config.port });

    this.cleanupScheduler.start();
    this.rooms.onCloseRoom((rc) => this.closeRoom(rc));
    this.wss.on('connection', (socket) => this.handleConnection(socket));
    this.heartbeatTimer = setInterval(() => {
      for (const [s, info] of this.sockets.getAllBoundSockets()) this.sendSafe(s, { type: 'PING', roomCode: info.roomCode });
      this.sessions.checkHeartbeats();
      for (const [sock, info] of this.sockets.getAllBoundSockets()) {
        const s = this.sessions.getSession(info.playerId);
        if (s && s.state === SessionState.GracePeriod) {
          if (sock.readyState === WebSocket.OPEN) {
            const elapsed = Date.now() - s.lastPongAt;
            if (elapsed > 2 * HEARTBEAT_INTERVAL_MS) {
              try {
                sock.close(1001, 'HEARTBEAT_TIMEOUT');
              } catch {
                /* safe-ignore */
              }
            }
          } else if (!this.reconnects.isPlayerInGrace(info.roomCode, info.playerId)) {
            this.reconnects.startGracePeriod(info.roomCode, info.playerId);
          }
        }
      }
    }, HEARTBEAT_INTERVAL_MS);
  }

  get isRunning(): boolean { return !this.isClosed; }
  getRoomManager(): RoomManager { return this.rooms; }
  getSessionManager(): SessionManager { return this.sessions; }
  getIntentMutex(): IntentMutex { return this.intentMutex; }
  getDeltaBroadcaster(): DeltaBroadcaster { return this.broadcaster; }
  getReconnectManager(): ReconnectManager { return this.reconnects; }
  getCleanupScheduler(): RoomCleanupScheduler { return this.cleanupScheduler; }
  getRateLimiter(): RateLimiter { return this.rateLimiter; }
  getEnvelopeValidator(): EnvelopeValidator { return this.envelopeValidator; }
  getIntentGuard(): IntentGuard { return this.intentGuard; }
  getRoomSockets(roomCode: string): Set<WebSocket> | undefined { return this.sockets.getRoomSockets(roomCode); }
  get roomSockets(): Map<string, Set<WebSocket>> { return this.sockets.getRoomSocketsMap(); }

  sendSafe(socket: WebSocket, msg: WsServerMessage): void {
    if (socket.readyState === WebSocket.OPEN) socket.send(encodeMsg(msg));
  }

  private handleConnection(socket: WebSocket): void {
    socket.on('message', async (data) => {
      if (socket.readyState !== WebSocket.OPEN) return;
      try {
        const rateRes = this.rateLimiter.checkLimit(socket);
        if (!rateRes.allowed) {
          this.sendSafe(socket, { type: 'ERROR', reasonCode: rateRes.kick ? 'ABUSE_DETECTED' : 'RATE_LIMIT_EXCEEDED' });
          if (rateRes.kick) {
            socket.removeAllListeners('message');
            socket.close(1008, 'ABUSE_DETECTED');
          }
          return;
        }

        const validation = this.envelopeValidator.parseAndValidate(data.toString());
        if (!validation.success) {
          if (validation.ignore) return;
          this.sendSafe(socket, { type: 'ERROR', reasonCode: validation.reasonCode });
          return;
        }

        const info = this.sockets.getPlayerInfo(socket);
        if (info) {
          this.sessions.handlePong(info.playerId);
          this.reconnects.cancelGracePeriod(info.roomCode, info.playerId);
        }

        await this.route(socket, validation.message);
      } catch (err) {
        console.error('[WssServer] Error handling message:', err);
      }
    });

    socket.on('close', () => {
      this.rateLimiter.cleanup(socket);
      const info = this.sockets.unregister(socket);
      if (info) {
        this.reconnects.startGracePeriod(info.roomCode, info.playerId);
      }
    });
  }

  private bindSocket(roomCode: string, playerId: string, socket: WebSocket): void {
    this.sockets.bind(roomCode, playerId, socket);
    this.reconnects.cancelGracePeriod(roomCode, playerId);
    const s = this.sessions.getSession(playerId);
    if (s) {
      s.state = SessionState.Connected;
      s.lastPongAt = Date.now();
    }
    const room = this.rooms.getRoom(roomCode);
    const p = room?.players.find((pl) => pl.id === playerId);
    if (room && !room.started && p) p.isBot = false;
  }

  private sendSessionInit(socket: WebSocket, playerId: string, roomCode: string): void {
    const token = this.reconnects.generateToken(playerId, roomCode);
    this.sendSafe(socket, { type: 'SESSION_INIT', playerId, reconnectToken: token, roomCode });
  }

  private handleStartGame(socket: WebSocket, msg: Extract<WsClientMessage, { type: 'START_GAME' }>): void {
    const room = this.rooms.getRoom(msg.roomCode);
    if (!room || !room.players.some((p) => p.id === msg.playerId)) {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' });
      return;
    }
    if (room.hostId !== msg.playerId) {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'NOT_HOST' });
      return;
    }
    if (room.started) {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_STARTED' });
      return;
    }
    const normRoomCode = room.roomCode;
    const hostP = room.players.find((p) => p.id === msg.playerId);
    if (hostP) hostP.isBot = false;
    this.reconnects.cancelGracePeriod(normRoomCode, msg.playerId);
    for (const p of room.players) {
      if (this.sockets.getPlayerSocket(normRoomCode, p.id)) {
        p.isBot = false;
        this.reconnects.cancelGracePeriod(normRoomCode, p.id);
      }
    }
    if (!this.rooms.startGame(normRoomCode, msg.bots)) {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'NOT_ENOUGH_PLAYERS' });
      return;
    }
    this.bindSocket(msg.roomCode, msg.playerId, socket);
    this.broadcast(msg.roomCode, { type: 'ROOM_STARTED', roomCode: msg.roomCode });
    this.broadcaster.broadcastRoomDelta(msg.roomCode, { forceFull: true });
    this.scheduleBotTurn(msg.roomCode);
  }

  private async route(socket: WebSocket, msg: WsClientMessage): Promise<void> {
    switch (msg.type) {
      case 'CREATE_ROOM': {
        if (msg.roomCode) {
          const upper = msg.roomCode.toUpperCase();
          const existing = this.rooms.getRoom(upper);
          if (existing && existing.hostId === msg.playerId) {
            this.closeRoom(upper);
          }
        }
        const room = this.rooms.createRoom(msg.playerId, msg.roomCode);
        this.reconnects.cancelGracePeriod(room.roomCode, msg.playerId);
        this.sessions.addSession(msg.playerId);
        this.bindSocket(room.roomCode, msg.playerId, socket);
        this.sendSafe(socket, { type: 'ROOM_CREATED', roomCode: room.roomCode, playerId: msg.playerId });
        this.sendSessionInit(socket, msg.playerId, room.roomCode);
        break;
      }
      case 'JOIN_ROOM': {
        const joined = this.rooms.joinRoom(msg.roomCode, msg.playerId);
        if (!joined) return this.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' });
        if (joined.players.length > MAX_PLAYERS) {
          joined.players.pop();
          return this.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_FULL' });
        }
        this.reconnects.cancelGracePeriod(msg.roomCode, msg.playerId);
        this.sessions.addSession(msg.playerId);
        this.bindSocket(msg.roomCode, msg.playerId, socket);
        this.sendSafe(socket, { type: 'ROOM_JOINED', roomCode: msg.roomCode, playerId: msg.playerId, playerCount: joined.players.length });
        this.sendSessionInit(socket, msg.playerId, msg.roomCode);
        break;
      }
      case 'START_GAME': this.handleStartGame(socket, msg); break;
      case 'PONG':
        this.sessions.handlePong(msg.playerId);
        if (msg.roomCode) this.reconnects.cancelGracePeriod(msg.roomCode, msg.playerId);
        break;
      case 'RECONNECT': this.handleReconnect(socket, msg); break;
      case 'INTENT': await this.handleIntent(socket, msg); break;
      case 'INTENT_REQUEST_RESYNC':
        if (msg.roomCode) {
          this.bindSocket(msg.roomCode, msg.playerId, socket);
          this.broadcaster.resyncClient(msg.roomCode, socket);
          if (this.rooms.getRoom(msg.roomCode)?.started) this.scheduleBotTurn(msg.roomCode);
        }
        break;
      case 'EMOTE': this.handleEmote(socket, msg); break;
      case 'LEAVE_ROOM': this.handleLeaveRoom(socket, msg); break;
    }
  }

  private handleLeaveRoom(socket: WebSocket, msg: Extract<WsClientMessage, { type: 'LEAVE_ROOM' }>): void {
    const room = this.rooms.getRoom(msg.roomCode);
    if (!room) return;
    this.sockets.unregister(socket);
    this.reconnects.cancelGracePeriod(msg.roomCode, msg.playerId);
    if (room.hostId === msg.playerId) {
      this.closeRoom(msg.roomCode);
    } else if (room.started) {
      this.broadcast(msg.roomCode, { type: 'PLAYER_BOT_TAKEOVER', playerId: msg.playerId });
      const p = room.players.find((pl) => pl.id === msg.playerId);
      if (p) p.bankrupt = true;
      this.broadcaster.broadcastRoomDelta(msg.roomCode);
      this.scheduleBotTurn(msg.roomCode);
    } else {
      const idx = room.players.findIndex((pl) => pl.id === msg.playerId);
      if (idx !== -1) room.players.splice(idx, 1);
      this.broadcaster.broadcastRoomDelta(msg.roomCode);
    }
  }

  private handleEmote(socket: WebSocket, msg: Extract<WsClientMessage, { type: 'EMOTE' }>): void {
    const room = this.rooms.getRoom(msg.roomCode);
    if (!room || !room.players.some((p) => p.id === msg.playerId)) {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' });
      return;
    }
    this.bindSocket(msg.roomCode, msg.playerId, socket);
    this.broadcast(msg.roomCode, { type: 'PLAYER_EMOTE', playerId: msg.playerId, emoteId: msg.emoteId, timestamp: Date.now() });
  }

  private handleReconnect(socket: WebSocket, msg: { reconnectToken: string; roomCode?: string }): void {
    const verified = this.reconnects.verifyToken(msg.reconnectToken, msg.roomCode);
    if (!verified.success) {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: verified.reasonCode });
      return;
    }
    const { record } = verified;
    const room = this.rooms.getRoom(record.roomCode);
    if (!room) {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' });
      return;
    }
    const player = room.players.find((p) => p.id === record.playerId);
    if (!player || player.isBot) {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'TOKEN_EXPIRED' });
      return;
    }

    this.reconnects.cancelGracePeriod(record.roomCode, record.playerId);
    const session = this.sessions.getSession(record.playerId) ?? this.sessions.addSession(record.playerId);
    session.state = SessionState.Connected;
    session.lastPongAt = Date.now();

    this.sockets.replacePlayerSocket(record.roomCode, record.playerId, socket);

    this.broadcast(record.roomCode, { type: 'PLAYER_RECONNECTED', playerId: record.playerId });
    this.broadcaster.resyncClient(record.roomCode, socket);
    if (room.started) {
      this.sendSafe(socket, { type: 'ROOM_STARTED', roomCode: record.roomCode });
      this.scheduleBotTurn(record.roomCode);
    }
  }

  private async handleIntent(socket: WebSocket, msg: Extract<WsClientMessage, { type: 'INTENT' }>): Promise<void> {
    if (!msg.roomCode || !msg.intent || typeof msg.intent.type !== 'string') {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'INVALID_INTENT' });
      return;
    }
    const room = this.rooms.getRoom(msg.roomCode);
    const player = room?.players.find((p) => p.id === msg.playerId);
    if (!room || !player) {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' });
      return;
    }
    if (player.isBot) {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'TOKEN_EXPIRED' });
      return;
    }

    const guardRes = this.intentGuard.validate(room, msg.playerId, msg.intent);
    if (!guardRes.allowed) {
      this.sendSafe(socket, { type: 'INTENT_REJECTED', reasonCode: guardRes.reasonCode ?? 'OUT_OF_TURN', playerId: msg.playerId });
      return;
    }

    this.bindSocket(msg.roomCode, msg.playerId, socket);

    await this.intentMutex.runExclusive(msg.roomCode, async () => {
      let success = false;
      let reason: string | undefined;
      if (msg.intent.type === 'INTENT_ROLL') {
        const rollRes = this.rooms.handleRollDice(msg.roomCode, msg.playerId);
        success = rollRes !== undefined;
        reason = success ? undefined : 'CANNOT_ROLL';
      } else {
        const res = this.rooms.handlePlayerIntent(msg.roomCode, msg.playerId, msg.intent);
        success = res.success;
        reason = res.reason;
      }
      if (!success) {
        this.sendSafe(socket, { type: 'ERROR', reasonCode: (reason as ReasonCode) || 'INTENT_REJECTED' });
        return;
      }

      const roomAfter = this.rooms.getRoom(msg.roomCode);
      if (roomAfter && isRoomGameOver(roomAfter)) {
        this.broadcastGameOver(msg.roomCode);
      } else {
        this.broadcaster.broadcastRoomDelta(msg.roomCode);
        this.scheduleBotTurn(msg.roomCode);
      }
    });
  }

  private scheduleBotTurn(roomCode: string): void {
    this.botScheduler.scheduleBotTurn(roomCode);
    this.turnTimeoutScheduler.scheduleTurnTimeout(roomCode);
  }

  broadcastGameOver(roomCode: string, leaderboard?: Array<{ id: string; netWorth: number }>): void {
    const rankings = leaderboard ?? this.rooms.getRankings(roomCode);
    this.broadcast(roomCode, { type: 'GAME_OVER', roomCode, leaderboard: rankings });
    this.closeRoom(roomCode);
  }

  closeRoom(roomCode: string): void {
    if (this.closingRooms.has(roomCode)) return;
    this.closingRooms.add(roomCode);
    try {
      this.turnTimeoutScheduler.clearTimeout(roomCode);
      this.sockets.clearRoomSockets(roomCode);
      this.reconnects.clearRoom(roomCode);
      const room = this.rooms.getRoom(roomCode);
      if (room) {
        for (const p of room.players) this.sessions.removeSession(p.id);
      }
      this.broadcaster.clearRoom(roomCode);
      this.intentMutex.clear(roomCode);
      this.rooms.closeRoom(roomCode);
    } finally {
      this.closingRooms.delete(roomCode);
    }
  }

  broadcast(roomCode: string, msg: WsServerMessage): void {
    const sockets = this.sockets.getRoomSockets(roomCode);
    if (!sockets) return;
    const encoded = encodeMsg(msg);
    for (const s of sockets) if (s.readyState === WebSocket.OPEN) s.send(encoded);
  }

  close(): Promise<void> {
    this.isClosed = true;
    clearInterval(this.heartbeatTimer);
    this.cleanupScheduler.stop();
    this.reconnects.clear();
    for (const rc of this.rooms.getAllRoomCodes()) this.rooms.clearRoomTimers(rc);
    return new Promise((resolve, reject) => {
      this.wss.close((err) => (err ? reject(err) : resolve()));
    });
  }

  get roomManager(): RoomManager { return this.rooms; }
}
