// [IMP-64] Extracted connection handling from WssServer
// ZERO LOGIC CHANGE — code moved verbatim from wss_server.ts
import { WebSocket } from 'ws';
import { SessionState } from '../session_manager.js';
import type { RoomManager } from '../room_manager.js';
import type { SessionManager } from '../session_manager.js';
import type { IntentMutex } from './intent_mutex.js';
import type { ReconnectManager } from './reconnect_manager.js';
import type { SocketRegistry } from './socket_registry.js';
import type { AdminManager } from './admin_manager.js';
import type { RateLimiter } from '../security/rate_limiter.js';
import type { EnvelopeValidator } from '../security/envelope_validator.js';
import type { WsServerMessage, WsClientMessage } from './network_types.js';

export interface ConnectionHandlerDeps {
  readonly rateLimiter: RateLimiter;
  readonly envelopeValidator: EnvelopeValidator;
  readonly sockets: SocketRegistry;
  readonly sessions: SessionManager;
  readonly reconnects: ReconnectManager;
  readonly adminManager: AdminManager;
  readonly rooms: RoomManager;
  sendSafe(socket: WebSocket, msg: WsServerMessage): void;
  route(socket: WebSocket, msg: WsClientMessage): Promise<void>;
}

export function attachConnectionHandlers(deps: ConnectionHandlerDeps, socket: WebSocket): void {
  socket.on('message', async (data) => {
    if (socket.readyState !== WebSocket.OPEN) return;
    try {
      const rateRes = deps.rateLimiter.checkLimit(socket);
      if (!rateRes.allowed) {
        deps.sendSafe(socket, { type: 'ERROR', reasonCode: rateRes.kick ? 'ABUSE_DETECTED' : 'RATE_LIMIT_EXCEEDED' });
        if (rateRes.kick) {
          socket.removeAllListeners('message');
          socket.close(1008, 'ABUSE_DETECTED');
        }
        return;
      }

      const validation = deps.envelopeValidator.parseAndValidate(data.toString());
      if (!validation.success) {
        if (validation.ignore) return;
        deps.sendSafe(socket, { type: 'ERROR', reasonCode: validation.reasonCode });
        return;
      }

      const info = deps.sockets.getPlayerInfo(socket);
      if (info) {
        deps.sessions.handlePong(info.playerId);
        deps.reconnects.cancelGracePeriod(info.roomCode, info.playerId);
      }

      await deps.route(socket, validation.message);
    } catch (err) {
      console.error('[WssServer] Error handling message:', err);
    }
  });

  socket.on('close', () => {
    deps.adminManager.handleDisconnect(socket);
    deps.rateLimiter.cleanup(socket);
    const info = deps.sockets.unregister(socket);
    if (info) {
      deps.reconnects.startGracePeriod(info.roomCode, info.playerId);
    }
  });
}

export function bindSocketTo(
  deps: Pick<ConnectionHandlerDeps, 'sockets' | 'reconnects' | 'sessions' | 'rooms'>,
  roomCode: string,
  playerId: string,
  socket: WebSocket,
): void {
  deps.sockets.bind(roomCode, playerId, socket);
  deps.reconnects.cancelGracePeriod(roomCode, playerId);
  const s = deps.sessions.getSession(playerId);
  if (s) {
    s.state = SessionState.Connected;
    s.lastPongAt = Date.now();
  }
  const room = deps.rooms.getRoom(roomCode);
  const p = room?.players.find((pl) => pl.id === playerId);
  if (room && !room.started && p) p.isBot = false;
}

export function sendSessionInitMsg(
  deps: { readonly reconnects: ReconnectManager; sendSafe(socket: WebSocket, msg: WsServerMessage): void },
  socket: WebSocket,
  playerId: string,
  roomCode: string,
): void {
  const token = deps.reconnects.generateToken(playerId, roomCode);
  deps.sendSafe(socket, { type: 'SESSION_INIT', playerId, reconnectToken: token, roomCode });
}
