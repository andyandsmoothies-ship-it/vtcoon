// [UC-GAME-001/MSS][UC-GAME-003/MSS][UC-GAME-004/MSS][UC-GAME-006/MSS][UC-GAME-007/MSS]
// WSS Server — chạy độc lập trên WebSocket port
import { WebSocketServer, WebSocket } from 'ws';
import { RoomManager } from '../room_manager.js';
import { SessionManager, SessionState, HEARTBEAT_INTERVAL_MS } from '../session_manager.js';
import { IntentMutex } from './intent_mutex.js';
import { DeltaBroadcaster } from './delta_broadcaster.js';
import { ReconnectManager } from './reconnect_manager.js';
import { encodeMsg } from './network_types.js';
import type { WsServerMessage, WsClientMessage, ReasonCode } from './network_types.js';

const MAX_PLAYERS = 6;

export interface WssServerConfig {
  readonly port: number;
  readonly roomManager?: RoomManager;
  readonly sessionManager?: SessionManager;
  readonly intentMutex?: IntentMutex;
  readonly reconnectManager?: ReconnectManager;
  readonly gracePeriodMs?: number;
}

export class WssServer {
  private readonly wss: WebSocketServer;
  private readonly rooms: RoomManager;
  private readonly sessions: SessionManager;
  private readonly intentMutex: IntentMutex;
  private readonly broadcaster: DeltaBroadcaster;
  private readonly reconnects: ReconnectManager;
  private readonly roomSockets = new Map<string, Set<WebSocket>>();
  private readonly socketPlayers = new Map<WebSocket, { playerId: string; roomCode: string }>();
  private readonly playerSockets = new Map<string, WebSocket>();
  private readonly heartbeatTimer: ReturnType<typeof setInterval>;

  constructor(config: WssServerConfig) {
    this.rooms       = config.roomManager ?? new RoomManager();
    this.sessions    = config.sessionManager ?? new SessionManager();
    this.intentMutex = config.intentMutex ?? new IntentMutex();
    this.broadcaster = new DeltaBroadcaster(this.rooms, this.sessions, (rc, msg) => this.broadcast(rc, msg));
    this.reconnects  = config.reconnectManager ?? new ReconnectManager({
      rooms: this.rooms,
      sessions: this.sessions,
      broadcaster: this.broadcaster,
      broadcast: (rc, msg) => this.broadcast(rc, msg),
      gracePeriodMs: config.gracePeriodMs,
    });
    this.wss         = new WebSocketServer({ port: config.port });

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

  getRoomManager(): RoomManager { return this.rooms; }
  getSessionManager(): SessionManager { return this.sessions; }
  getIntentMutex(): IntentMutex { return this.intentMutex; }
  getDeltaBroadcaster(): DeltaBroadcaster { return this.broadcaster; }
  getReconnectManager(): ReconnectManager { return this.reconnects; }

  private handleConnection(socket: WebSocket): void {
    socket.on('message', async (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed && typeof parsed === 'object' && typeof parsed.type === 'string') {
          await this.route(socket, parsed as WsClientMessage);
        }
      } catch (err) {
        console.error('[WssServer] Error handling message:', err);
      }
    });

    socket.on('close', () => {
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
        socket.send(encodeMsg({ type: 'ROOM_CREATED', roomCode: room.roomCode, playerId: msg.playerId }));
        const token = this.reconnects.generateToken(msg.playerId, room.roomCode);
        socket.send(encodeMsg({ type: 'SESSION_INIT', playerId: msg.playerId, reconnectToken: token, roomCode: room.roomCode }));
        break;
      }
      case 'JOIN_ROOM': {
        const joined = this.rooms.joinRoom(msg.roomCode, msg.playerId);
        if (!joined) {
          socket.send(encodeMsg({ type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' }));
          return;
        }
        if (joined.players.length > MAX_PLAYERS) {
          joined.players.pop();
          socket.send(encodeMsg({ type: 'ERROR', reasonCode: 'ROOM_FULL' }));
          return;
        }
        this.sessions.addSession(msg.playerId);
        this.bindSocket(msg.roomCode, msg.playerId, socket);
        socket.send(encodeMsg({ type: 'ROOM_JOINED', roomCode: msg.roomCode, playerId: msg.playerId, playerCount: joined.players.length }));
        const token = this.reconnects.generateToken(msg.playerId, msg.roomCode);
        socket.send(encodeMsg({ type: 'SESSION_INIT', playerId: msg.playerId, reconnectToken: token, roomCode: msg.roomCode }));
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
    }
  }

  private handleReconnect(socket: WebSocket, msg: { reconnectToken: string; roomCode?: string }): void {
    const verified = this.reconnects.verifyToken(msg.reconnectToken, msg.roomCode);
    if (!verified.success) {
      socket.send(encodeMsg({ type: 'ERROR', reasonCode: verified.reasonCode }));
      return;
    }
    const { record } = verified;
    const room = this.rooms.getRoom(record.roomCode);
    if (!room) {
      socket.send(encodeMsg({ type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' }));
      return;
    }
    const player = room.players.find((p) => p.id === record.playerId);
    if (!player || player.isBot) {
      socket.send(encodeMsg({ type: 'ERROR', reasonCode: 'TOKEN_EXPIRED' }));
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
      socket.send(encodeMsg({ type: 'ERROR', reasonCode: 'INVALID_INTENT' }));
      return;
    }
    const room = this.rooms.getRoom(msg.roomCode);
    if (!room) {
      socket.send(encodeMsg({ type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' }));
      return;
    }
    const player = room.players.find((p) => p.id === msg.playerId);
    if (!player || player.isBot) {
      socket.send(encodeMsg({ type: 'ERROR', reasonCode: 'TOKEN_EXPIRED' }));
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
        socket.send(encodeMsg({ type: 'ERROR', reasonCode: (reason as ReasonCode) || 'INTENT_REJECTED' }));
        return;
      }
      this.broadcaster.broadcastRoomDelta(msg.roomCode);
    });
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
    clearInterval(this.heartbeatTimer);
    this.reconnects.clear();
    return new Promise((resolve, reject) => {
      this.wss.close((err) => (err ? reject(err) : resolve()));
    });
  }
}
