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
import { encodeMsg } from './network_types.js';
import type { WsServerMessage, WsClientMessage, ReasonCode } from './network_types.js';

const MAX_PLAYERS = 6;

export interface WssServerConfig {
  readonly port: number;
  readonly roomManager?: RoomManager;
  readonly sessionManager?: SessionManager;
  readonly intentMutex?: IntentMutex;
  readonly reconnectManager?: ReconnectManager;
  readonly rateLimiter?: RateLimiter;
  readonly envelopeValidator?: EnvelopeValidator;
  readonly intentGuard?: IntentGuard;
  readonly rateLimiterOptions?: RateLimiterOptions;
  readonly gracePeriodMs?: number;
  readonly abandonedTimeoutMs?: number;
  readonly cleanupIntervalMs?: number;
}

export class WssServer {
  private readonly wss: WebSocketServer;
  private readonly rooms: RoomManager;
  private readonly sessions: SessionManager;
  private readonly intentMutex: IntentMutex;
  private readonly broadcaster: DeltaBroadcaster;
  private readonly reconnects: ReconnectManager;
  private readonly cleanupScheduler: RoomCleanupScheduler;
  private readonly rateLimiter: RateLimiter;
  private readonly envelopeValidator: EnvelopeValidator;
  private readonly intentGuard: IntentGuard;
  private readonly roomSockets = new Map<string, Set<WebSocket>>();
  private readonly socketPlayers = new Map<WebSocket, { playerId: string; roomCode: string }>();
  private readonly playerSockets = new Map<string, WebSocket>();
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
    this.reconnects  = config.reconnectManager ?? new ReconnectManager({
      rooms: this.rooms,
      sessions: this.sessions,
      broadcaster: this.broadcaster,
      broadcast: (rc, msg) => this.broadcast(rc, msg),
      gracePeriodMs: config.gracePeriodMs,
    });
    this.cleanupScheduler = new RoomCleanupScheduler({
      roomManager: this.rooms,
      timeoutMs: config.abandonedTimeoutMs,
      intervalMs: config.cleanupIntervalMs,
      onCleanup: (rc) => this.closeRoom(rc),
    });
    this.wss         = new WebSocketServer({ port: config.port });

    this.cleanupScheduler.start();
    this.rooms.onCloseRoom((rc) => this.closeRoom(rc));
    this.wss.on('connection', (socket) => this.handleConnection(socket));
    this.heartbeatTimer = setInterval(() => {
      this.sessions.checkHeartbeats();
      for (const [, info] of this.socketPlayers.entries()) {
        const s = this.sessions.getSession(info.playerId);
        if (s && s.state === SessionState.GracePeriod && !this.reconnects.isPlayerInGrace(info.roomCode, info.playerId)) {
          this.reconnects.startGracePeriod(info.roomCode, info.playerId);
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
  getRoomSockets(roomCode: string): Set<WebSocket> | undefined { return this.roomSockets.get(roomCode); }

  sendSafe(socket: WebSocket, msg: WsServerMessage): void {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(encodeMsg(msg));
    }
  }

  private handleConnection(socket: WebSocket): void {
    socket.on('message', async (data) => {
      if (socket.readyState !== WebSocket.OPEN) return;
      try {
        const rateRes = this.rateLimiter.checkLimit(socket);
        if (!rateRes.allowed) {
          if (rateRes.kick) {
            this.sendSafe(socket, { type: 'ERROR', reasonCode: 'ABUSE_DETECTED' });
            socket.removeAllListeners('message');
            socket.close(1008, 'ABUSE_DETECTED');
            return;
          }
          this.sendSafe(socket, { type: 'ERROR', reasonCode: 'RATE_LIMIT_EXCEEDED' });
          return;
        }

        const validation = this.envelopeValidator.parseAndValidate(data.toString());
        if (!validation.success) {
          if (validation.ignore) return;
          this.sendSafe(socket, { type: 'ERROR', reasonCode: validation.reasonCode });
          return;
        }

        await this.route(socket, validation.message);
      } catch (err) {
        console.error('[WssServer] Error handling message:', err);
      }
    });

    socket.on('close', () => {
      this.rateLimiter.cleanup(socket);
      const info = this.socketPlayers.get(socket);
      this.socketPlayers.delete(socket);
      this.unregisterSocket(socket);
      if (info) {
        const key = `${info.roomCode}:${info.playerId}`;
        if (this.playerSockets.get(key) === socket) {
          this.playerSockets.delete(key);
          this.reconnects.startGracePeriod(info.roomCode, info.playerId);
        }
      }
    });
  }

  private bindSocket(roomCode: string, playerId: string, socket: WebSocket): void {
    let group = this.roomSockets.get(roomCode);
    if (!group) {
      group = new Set();
      this.roomSockets.set(roomCode, group);
    }
    group.add(socket);
    this.socketPlayers.set(socket, { playerId, roomCode });
    this.playerSockets.set(`${roomCode}:${playerId}`, socket);
  }

  private async route(socket: WebSocket, msg: WsClientMessage): Promise<void> {
    switch (msg.type) {
      case 'CREATE_ROOM': {
        const room = this.rooms.createRoom(msg.playerId);
        this.sessions.addSession(msg.playerId);
        this.bindSocket(room.roomCode, msg.playerId, socket);
        this.sendSafe(socket, { type: 'ROOM_CREATED', roomCode: room.roomCode, playerId: msg.playerId });
        const token = this.reconnects.generateToken(msg.playerId, room.roomCode);
        this.sendSafe(socket, { type: 'SESSION_INIT', playerId: msg.playerId, reconnectToken: token, roomCode: room.roomCode });
        break;
      }
      case 'JOIN_ROOM': {
        const joined = this.rooms.joinRoom(msg.roomCode, msg.playerId);
        if (!joined) {
          this.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' });
          return;
        }
        if (joined.players.length > MAX_PLAYERS) {
          joined.players.pop();
          this.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_FULL' });
          return;
        }
        this.sessions.addSession(msg.playerId);
        this.bindSocket(msg.roomCode, msg.playerId, socket);
        this.sendSafe(socket, { type: 'ROOM_JOINED', roomCode: msg.roomCode, playerId: msg.playerId, playerCount: joined.players.length });
        const token = this.reconnects.generateToken(msg.playerId, msg.roomCode);
        this.sendSafe(socket, { type: 'SESSION_INIT', playerId: msg.playerId, reconnectToken: token, roomCode: msg.roomCode });
        break;
      }
      case 'PONG':
        this.sessions.handlePong(msg.playerId);
        break;
      case 'RECONNECT':
        this.handleReconnect(socket, msg);
        break;
      case 'INTENT':
        await this.handleIntent(socket, msg);
        break;
      case 'INTENT_REQUEST_RESYNC':
        if (msg.roomCode) {
          this.bindSocket(msg.roomCode, msg.playerId, socket);
          this.broadcaster.resyncClient(msg.roomCode, socket);
        }
        break;
      case 'EMOTE':
        this.handleEmote(socket, msg);
        break;
    }
  }

  private handleEmote(socket: WebSocket, msg: Extract<WsClientMessage, { type: 'EMOTE' }>): void {
    const room = this.rooms.getRoom(msg.roomCode);
    if (!room || !room.players.some((p) => p.id === msg.playerId)) {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' });
      return;
    }
    this.bindSocket(msg.roomCode, msg.playerId, socket);
    this.broadcast(msg.roomCode, {
      type: 'PLAYER_EMOTE',
      playerId: msg.playerId,
      emoteId: msg.emoteId,
      timestamp: Date.now(),
    });
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

    const existingKey = `${record.roomCode}:${record.playerId}`;
    const existingSocket = this.playerSockets.get(existingKey);
    if (existingSocket && existingSocket !== socket) {
      this.unregisterSocket(existingSocket);
      this.socketPlayers.delete(existingSocket);
      try {
        existingSocket.close(1000, 'SUPERSEDED_BY_RECONNECT');
      } catch {}
    }

    this.bindSocket(record.roomCode, record.playerId, socket);
    this.broadcast(record.roomCode, { type: 'PLAYER_RECONNECTED', playerId: record.playerId });
    this.broadcaster.resyncClient(record.roomCode, socket);
  }

  private async handleIntent(socket: WebSocket, msg: Extract<WsClientMessage, { type: 'INTENT' }>): Promise<void> {
    if (!msg.roomCode || !msg.intent || typeof msg.intent.type !== 'string') {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'INVALID_INTENT' });
      return;
    }
    const room = this.rooms.getRoom(msg.roomCode);
    if (!room) {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' });
      return;
    }
    const player = room.players.find((p) => p.id === msg.playerId);
    if (!player) {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' });
      return;
    }
    if (player.isBot) {
      this.sendSafe(socket, { type: 'ERROR', reasonCode: 'TOKEN_EXPIRED' });
      return;
    }

    const guardRes = this.intentGuard.validate(room, msg.playerId, msg.intent);
    if (!guardRes.allowed) {
      this.sendSafe(socket, {
        type: 'INTENT_REJECTED',
        reasonCode: guardRes.reasonCode ?? 'OUT_OF_TURN',
        playerId: msg.playerId,
      });
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
      if (roomAfter && roomAfter.started && roomAfter.players.filter((p) => !p.bankrupt).length <= 1) {
        this.broadcastGameOver(msg.roomCode);
      } else {
        this.broadcaster.broadcastRoomDelta(msg.roomCode);
      }
    });
  }

  broadcastGameOver(roomCode: string, leaderboard?: Array<{ id: string; netWorth: number }>): void {
    const rankings = leaderboard ?? this.rooms.getRankings(roomCode);
    const msg: WsServerMessage = {
      type: 'GAME_OVER',
      roomCode,
      leaderboard: rankings,
    };
    this.broadcast(roomCode, msg);
    this.closeRoom(roomCode);
  }

  closeRoom(roomCode: string): void {
    if (this.closingRooms.has(roomCode)) return;
    this.closingRooms.add(roomCode);
    try {
      const sockets = this.roomSockets.get(roomCode);
      if (sockets) {
        for (const s of sockets) {
          s.removeAllListeners();
          s.on('error', () => {});
          this.socketPlayers.delete(s);
          try {
            s.close(1000, 'ROOM_CLOSED');
          } catch {}
        }
        this.roomSockets.delete(roomCode);
      }
      const prefix = `${roomCode}:`;
      for (const key of Array.from(this.playerSockets.keys())) {
        if (key.startsWith(prefix)) {
          this.playerSockets.delete(key);
        }
      }
      this.reconnects.clearRoom(roomCode);
      const room = this.rooms.getRoom(roomCode);
      if (room) {
        for (const p of room.players) {
          this.sessions.removeSession(p.id);
        }
      }
      this.broadcaster.clearRoom(roomCode);
      this.intentMutex.clear(roomCode);
      this.rooms.closeRoom(roomCode);
    } finally {
      this.closingRooms.delete(roomCode);
    }
  }

  broadcast(roomCode: string, msg: WsServerMessage): void {
    const sockets = this.roomSockets.get(roomCode);
    if (!sockets) return;
    const encoded = encodeMsg(msg);
    for (const s of sockets) {
      if (s.readyState === WebSocket.OPEN) s.send(encoded);
    }
  }

  private unregisterSocket(socket: WebSocket): void {
    for (const [roomCode, group] of this.roomSockets.entries()) {
      if (group.has(socket)) {
        group.delete(socket);
        if (group.size === 0) this.roomSockets.delete(roomCode);
      }
    }
  }

  close(): Promise<void> {
    this.isClosed = true;
    clearInterval(this.heartbeatTimer);
    this.cleanupScheduler.stop();
    this.reconnects.clear();
    return new Promise((resolve, reject) => {
      this.wss.close((err) => (err ? reject(err) : resolve()));
    });
  }
}
