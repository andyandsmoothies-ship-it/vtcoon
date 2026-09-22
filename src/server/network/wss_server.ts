// [UC-GAME-001/MSS][UC-GAME-003/MSS][UC-GAME-004/MSS][UC-GAME-006/MSS][UC-GAME-007/MSS]
// WSS Server — chạy độc lập trên WebSocket port
import http from 'node:http';
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
import { TurnOrchestrator } from './turn_orchestrator.js';
import { TurnWatchdog } from './turn_watchdog.js';
import { SocketRegistry } from './socket_registry.js';
import { encodeMsg } from './network_types.js';
import type { WsServerMessage, WsClientMessage, ReasonCode } from './network_types.js';
import { isRoomGameOver } from '../../domain/room.js';
import { AdminManager } from './admin_manager.js';
import type { RoomFinishSummary } from '../logging/persistent_room_logger.js';
import {
  handleCreateRoom,
  handleJoinRoom,
  handleStartGame,
  handleLeaveRoom,
  handlePong,
  handleEmote,
  handleResync,
  validateIntentRequest,
  executeIntentAction,
  type WssLobbyContext,
} from './wss_lobby_handlers.js';
import {
  attachConnectionHandlers, bindSocketTo, sendSessionInitMsg,
  type ConnectionHandlerDeps,
} from './wss_connection_handler.js';
import {
  handleIntentMsg, handleReconnectMsg, syncRoomAfterIntent,
  type IntentHandlerDeps, type ReconnectHandlerDeps,
} from './wss_intent_handler.js';

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
  private readonly turnOrchestrator: TurnOrchestrator;
  private readonly turnWatchdog: TurnWatchdog;
  private readonly botScheduler: BotTurnScheduler;
  private readonly turnTimeoutScheduler: TurnTimeoutScheduler;
  private readonly rateLimiter: RateLimiter;
  private readonly envelopeValidator: EnvelopeValidator;
  private readonly intentGuard: IntentGuard;
  private readonly adminManager: AdminManager;
  private readonly sockets = new SocketRegistry();
  private readonly closingRooms = new Set<string>();
  private readonly heartbeatTimer: ReturnType<typeof setInterval>;
  private isClosed = false;

  constructor(config: WssServerConfig) {
    this.rooms       = config.roomManager ?? new RoomManager();
    this.sessions    = config.sessionManager ?? new SessionManager();
    this.adminManager = config.adminManager ?? new AdminManager({
      roomManager: this.rooms,
      secret: config.adminSecret,
      onTerminateRoom: (rc) => this.closeRoom(rc),
      loggerDir: config.adminLoggerDir,
    });
    this.intentMutex = config.intentMutex ?? new IntentMutex();
    this.rateLimiter = config.rateLimiter ?? new RateLimiter(config.rateLimiterOptions);
    this.envelopeValidator = config.envelopeValidator ?? new EnvelopeValidator();
    this.intentGuard = config.intentGuard ?? new IntentGuard();
    this.broadcaster = new DeltaBroadcaster(this.rooms, this.sessions, (rc, msg) => this.broadcast(rc, msg));
    this.turnOrchestrator = new TurnOrchestrator({
      rooms: this.rooms,
      intentMutex: this.intentMutex,
      broadcaster: this.broadcaster,
      onGameOver: (rc) => this.broadcastGameOver(rc),
      botTurnDelayMs: config.botTurnDelayMs ?? 1500,
      defaultTimeoutMs: config.turnTimeoutMs,
    });
    this.turnWatchdog = new TurnWatchdog({
      rooms: this.rooms,
      intentMutex: this.intentMutex,
      broadcaster: this.broadcaster,
      onEmergencyRecovery: (rc, reason) => {
        this.adminManager.recordRoomEvent(rc, {
          source: 'SYSTEM',
          action: 'WATCHDOG_EMERGENCY_RECOVERY',
          payloadSummary: `Watchdog tự giải cứu lượt chơi: ${reason}`,
        });
      },
      onGameOver: (rc) => this.broadcastGameOver(rc),
      onScheduleNextTurn: (rc) => this.scheduleBotTurn(rc),
    });
    this.turnWatchdog.start();
    this.botScheduler = new BotTurnScheduler(this.turnOrchestrator);
    this.turnTimeoutScheduler = new TurnTimeoutScheduler(this.turnOrchestrator);
    this.broadcaster.setTimeRemainingProvider((rc) => this.turnOrchestrator.getTimeRemaining(rc));
    this.reconnects  = config.reconnectManager ?? new ReconnectManager({
      rooms: this.rooms, sessions: this.sessions, broadcaster: this.broadcaster,
      broadcast: (rc, msg) => this.broadcast(rc, msg), gracePeriodMs: config.gracePeriodMs,
      isSocketConnected: (rc, pid) => {
        const s = this.sockets.getPlayerSocket(rc, pid);
        return Boolean(s && s.readyState === WebSocket.OPEN);
      },
    });
    this.adminManager.setTimeRemainingProvider((rc) => this.turnOrchestrator.getTimeRemaining(rc));
    this.adminManager.setReconnectManager(this.reconnects);
    this.adminManager.setSessionManager(this.sessions);
    this.cleanupScheduler = new RoomCleanupScheduler({
      roomManager: this.rooms, timeoutMs: config.abandonedTimeoutMs,
      intervalMs: config.cleanupIntervalMs, onCleanup: (rc) => this.closeRoom(rc),
    });
    const allowedOrigins = process.env['ALLOWED_ORIGINS']?.split(',') ?? [];
    const wsOpts = {
      maxPayload: 64 * 1024,
      verifyClient: (info: { origin?: string; req: http.IncomingMessage }, cb: (res: boolean, code?: number, msg?: string) => void) => {
        if (process.env['NODE_ENV'] !== 'production' || allowedOrigins.length === 0) return cb(true);
        const origin = info.origin ?? (info.req.headers['origin'] as string | undefined) ?? '';
        if (!origin || allowedOrigins.includes(origin)) return cb(true);
        console.warn(JSON.stringify({ event: 'SECURITY_ORIGIN_REJECTED', timestamp: Date.now(), delta: { origin } }));
        cb(false, 403, 'Forbidden Origin');
      },
    };
    this.wss         = config.server ? new WebSocketServer({ ...wsOpts, server: config.server }) : new WebSocketServer({ ...wsOpts, port: config.port });

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
  getTurnOrchestrator(): TurnOrchestrator { return this.turnOrchestrator; }
  getTurnWatchdog(): TurnWatchdog { return this.turnWatchdog; }
  get orchestrator(): TurnOrchestrator { return this.turnOrchestrator; }
  get watchdog(): TurnWatchdog { return this.turnWatchdog; }
  getRateLimiter(): RateLimiter { return this.rateLimiter; }
  getEnvelopeValidator(): EnvelopeValidator { return this.envelopeValidator; }
  getIntentGuard(): IntentGuard { return this.intentGuard; }
  getAdminManager(): AdminManager { return this.adminManager; }
  get admin(): AdminManager { return this.adminManager; }
  getRoomSockets(roomCode: string): Set<WebSocket> | undefined { return this.sockets.getRoomSockets(roomCode); }
  get roomSockets(): Map<string, Set<WebSocket>> { return this.sockets.getRoomSocketsMap(); }

  sendSafe(socket: WebSocket, msg: WsServerMessage): void {
    if (socket.readyState === WebSocket.OPEN) socket.send(encodeMsg(msg));
  }

  private get connDeps(): ConnectionHandlerDeps {
    return {
      rateLimiter: this.rateLimiter,
      envelopeValidator: this.envelopeValidator,
      sockets: this.sockets,
      sessions: this.sessions,
      reconnects: this.reconnects,
      adminManager: this.adminManager,
      rooms: this.rooms,
      sendSafe: (s, m) => this.sendSafe(s, m),
      route: (s, m) => this.route(s, m),
    };
  }

  private get intentDeps(): ReconnectHandlerDeps {
    return {
      rooms: this.rooms,
      intentGuard: this.intentGuard,
      intentMutex: this.intentMutex,
      broadcaster: this.broadcaster,
      adminManager: this.adminManager,
      reconnects: this.reconnects,
      sessions: this.sessions,
      sockets: this.sockets,
      sendSafe: (s, m) => this.sendSafe(s, m),
      bindSocket: (rc, pid, s) => this.bindSocket(rc, pid, s),
      scheduleBotTurn: (rc) => this.scheduleBotTurn(rc),
      broadcastGameOver: (rc, lb) => this.broadcastGameOver(rc, lb),
      broadcast: (rc, m) => this.broadcast(rc, m),
    };
  }

  private handleConnection(socket: WebSocket): void {
    attachConnectionHandlers(this.connDeps, socket);
  }

  private bindSocket(roomCode: string, playerId: string, socket: WebSocket): void {
    bindSocketTo({ sockets: this.sockets, reconnects: this.reconnects, sessions: this.sessions, rooms: this.rooms }, roomCode, playerId, socket);
  }

  private sendSessionInit(socket: WebSocket, playerId: string, roomCode: string): void {
    sendSessionInitMsg({ reconnects: this.reconnects, sendSafe: (s, m) => this.sendSafe(s, m) }, socket, playerId, roomCode);
  }

  private get lobbyContext(): WssLobbyContext {
    return {
      rooms: this.rooms,
      sessions: this.sessions,
      reconnects: this.reconnects,
      sockets: this.sockets,
      broadcaster: this.broadcaster,
      adminManager: this.adminManager,
      sendSafe: (s, m) => this.sendSafe(s, m),
      broadcast: (rc, m) => this.broadcast(rc, m),
      sendSessionInit: (s, pid, rc) => this.sendSessionInit(s, pid, rc),
      bindSocket: (rc, pid, s) => this.bindSocket(rc, pid, s),
      scheduleBotTurn: (rc) => this.scheduleBotTurn(rc),
      closeRoom: (rc) => this.closeRoom(rc),
    };
  }

  private async route(socket: WebSocket, msg: WsClientMessage): Promise<void> {
    if (this.adminManager.handleClientMessage(socket, msg, (s, m) => this.sendSafe(s, m))) {
      return;
    }
    const ctx = this.lobbyContext;
    switch (msg.type) {
      case 'CREATE_ROOM':
        handleCreateRoom(ctx, socket, msg);
        break;
      case 'JOIN_ROOM':
        handleJoinRoom(ctx, socket, msg);
        break;
      case 'START_GAME':
        handleStartGame(ctx, socket, msg);
        break;
      case 'PONG':
        handlePong(ctx, msg);
        break;
      case 'RECONNECT':
        this.handleReconnect(socket, msg);
        break;
      case 'INTENT':
        await this.handleIntent(socket, msg);
        break;
      case 'INTENT_REQUEST_RESYNC':
        handleResync(ctx, socket, msg);
        break;
      case 'EMOTE':
        handleEmote(ctx, socket, msg);
        break;
      case 'LEAVE_ROOM':
        handleLeaveRoom(ctx, socket, msg);
        break;
    }
  }

  private handleReconnect(socket: WebSocket, msg: { reconnectToken: string; roomCode?: string }): void {
    handleReconnectMsg(this.intentDeps, socket, msg);
  }

  private async handleIntent(socket: WebSocket, msg: Extract<WsClientMessage, { type: 'INTENT' }>): Promise<void> {
    await handleIntentMsg(this.intentDeps, socket, msg);
  }

  private scheduleBotTurn(roomCode: string): void {
    this.turnOrchestrator.orchestrate(roomCode);
    this.turnWatchdog.notifyProgress(roomCode);
  }

  broadcastGameOver(roomCode: string, leaderboard?: Array<{ id: string; netWorth: number }>): void {
    const rankings = leaderboard ?? this.rooms.getRankings(roomCode);
    this.broadcast(roomCode, { type: 'GAME_OVER', roomCode, leaderboard: rankings });
    this.adminManager.recordRoomEvent(roomCode, {
      source: 'SYSTEM',
      action: 'GAME_OVER_SUMMARY',
      payloadSummary: `Ván đấu kết thúc. Người thắng: ${rankings[0]?.id ?? 'Không xác định'}`,
    });
    this.closeRoom(roomCode, { status: 'FINISHED', winner: rankings[0]?.id });
  }

  closeRoom(roomCode: string, summary?: RoomFinishSummary): void {
    if (this.closingRooms.has(roomCode)) return;
    this.closingRooms.add(roomCode);
    try {
      this.turnOrchestrator.clearRoom(roomCode);
      this.turnWatchdog.clearRoom(roomCode);
      this.sockets.clearRoomSockets(roomCode);
      this.reconnects.clearRoom(roomCode);
      const room = this.rooms.getRoom(roomCode);
      if (room) {
        for (const p of room.players) this.sessions.removeSession(p.id);
      }
      const playerCount = room?.players.length ?? 1;
      this.broadcaster.clearRoom(roomCode);
      this.intentMutex.clear(roomCode);
      this.rooms.closeRoom(roomCode);
      this.adminManager.handleRoomClosed(roomCode, {
        status: summary?.status ?? 'TERMINATED',
        winner: summary?.winner,
        endTime: summary?.endTime ?? Date.now(),
        playerCount: summary?.playerCount ?? playerCount,
      });
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
    if (this.isClosed) return Promise.resolve();
    this.isClosed = true;
    clearInterval(this.heartbeatTimer);
    this.cleanupScheduler.stop();
    this.turnWatchdog.stop();
    this.reconnects.clear();
    for (const rc of this.rooms.getAllRoomCodes()) this.rooms.clearRoomTimers(rc);
    for (const client of this.wss.clients) {
      try {
        client.close(1001, 'SERVER_SHUTDOWN');
      } catch {
        /* safe-ignore */
      }
    }
    return new Promise((resolve, reject) => {
      this.wss.close((err) => {
        if (err && (err.message?.includes('not running') || err.message?.includes('closed'))) {
          resolve();
        } else if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  get roomManager(): RoomManager { return this.rooms; }
}
