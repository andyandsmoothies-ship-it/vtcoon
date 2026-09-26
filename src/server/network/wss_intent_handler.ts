// [IMP-64] Extracted intent & reconnect handling from WssServer
// ZERO LOGIC CHANGE — code moved verbatim from wss_server.ts
import { WebSocket } from 'ws';
import { SessionState } from '../session_manager.js';
import { isRoomGameOver } from '../../domain/room.js';
import { validateIntentRequest, executeIntentAction, isSocketOwner } from './wss_lobby_handlers.js';
import type { RoomManager, RollResult } from '../room_manager.js';
import type { SessionManager } from '../session_manager.js';
import type { IntentMutex } from './intent_mutex.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
import type { ReconnectManager } from './reconnect_manager.js';
import type { SocketRegistry } from './socket_registry.js';
import type { AdminManager } from './admin_manager.js';
import type { IntentGuard } from '../security/intent_guard.js';
import type { WsServerMessage, WsClientMessage, ReasonCode } from './network_types.js';

export interface IntentHandlerDeps {
  readonly rooms: RoomManager;
  readonly intentGuard: IntentGuard;
  readonly intentMutex: IntentMutex;
  readonly broadcaster: DeltaBroadcaster;
  readonly adminManager: AdminManager;
  readonly sockets: SocketRegistry;
  sendSafe(socket: WebSocket, msg: WsServerMessage): void;
  bindSocket(rc: string, pid: string, socket: WebSocket): void;
  scheduleBotTurn(rc: string): void;
  broadcastGameOver(rc: string, lb?: Array<{ id: string; netWorth: number }>): void;
}

export interface ReconnectHandlerDeps extends IntentHandlerDeps {
  readonly reconnects: ReconnectManager;
  readonly sessions: SessionManager;
  readonly sockets: SocketRegistry;
  broadcast(rc: string, msg: WsServerMessage): void;
}

export function syncRoomAfterIntent(
  deps: Pick<IntentHandlerDeps, 'rooms' | 'broadcaster' | 'broadcastGameOver' | 'scheduleBotTurn'>,
  roomCode: string,
): void {
  const roomAfter = deps.rooms.getRoom(roomCode);
  if (roomAfter && isRoomGameOver(roomAfter)) {
    deps.broadcastGameOver(roomCode);
  } else {
    deps.scheduleBotTurn(roomCode);
    deps.broadcaster.broadcastRoomDelta(roomCode);
  }
}

export async function handleIntentMsg(
  deps: IntentHandlerDeps,
  socket: WebSocket,
  msg: Extract<WsClientMessage, { type: 'INTENT' }>,
): Promise<void> {
  if (!isSocketOwner(deps.sockets, msg.roomCode, msg.playerId, socket)) {
    console.warn(JSON.stringify({
      event: 'SECURITY_IMPERSONATION_ATTEMPT',
      timestamp: Date.now(),
      delta: { roomCode: msg.roomCode, claimedPlayerId: msg.playerId },
    }));
    deps.sendSafe(socket, { type: 'ERROR', reasonCode: 'TOKEN_EXPIRED' });
    return;
  }

  const room = deps.rooms.getRoom(msg.roomCode);
  const player = room?.players.find((p) => p.id === msg.playerId);
  const validation = validateIntentRequest(room, player, msg, deps.intentGuard);
  if (!validation.valid) {
    if (validation.isRejection) {
      deps.sendSafe(socket, { type: 'INTENT_REJECTED', reasonCode: validation.reasonCode, playerId: msg.playerId });
    } else {
      deps.sendSafe(socket, { type: 'ERROR', reasonCode: validation.reasonCode });
    }
    return;
  }

  deps.bindSocket(msg.roomCode, msg.playerId, socket);
  await deps.intentMutex.runExclusive(msg.roomCode, async () => {
    const res = executeIntentAction(deps.rooms, msg.roomCode, msg.playerId, msg.intent);
    if (!res.success) {
      deps.sendSafe(socket, { type: 'ERROR', reasonCode: (res.reason as ReasonCode) || 'INTENT_REJECTED' });
      deps.broadcaster.broadcastRoomDelta(msg.roomCode);
      return;
    }
    const roll = res.rollResult;
    let payloadSummary = `Người chơi ${msg.playerId}: ${msg.intent.type}`;
    if (roll) {
      const d1 = roll.dice.dice?.[0] ?? roll.dice.die1;
      const d2 = roll.dice.dice?.[1] ?? roll.dice.die2;
      payloadSummary = `Người chơi ${msg.playerId}: Gieo xúc xắc [${d1}, ${d2}] -> Đến ô ${roll.player.position}`;
      if (roll.rentCharged > 0) payloadSummary += ` (Trả tiền thuê ${roll.rentCharged.toLocaleString('vi-VN')})`;
      if (roll.passedGo) payloadSummary += ' (Qua ô Bắt Đầu +2.000)';
      payloadSummary += ` | Số dư: ${roll.player.balance.toLocaleString('vi-VN')}`;
    }
    deps.adminManager.recordRoomEvent(msg.roomCode, {
      source: player?.isBot ? 'BOT' : 'PLAYER',
      action: msg.intent.type,
      payloadSummary,
      playerId: msg.playerId,
    });
    syncRoomAfterIntent(deps, msg.roomCode);
  });
}

export function handleReconnectMsg(
  deps: ReconnectHandlerDeps,
  socket: WebSocket,
  msg: { reconnectToken: string; roomCode?: string },
): void {
  const verified = deps.reconnects.verifyToken(msg.reconnectToken, msg.roomCode);
  if (!verified.success) {
    deps.sendSafe(socket, { type: 'ERROR', reasonCode: verified.reasonCode });
    return;
  }
  const { record } = verified;
  const room = deps.rooms.getRoom(record.roomCode);
  if (!room) {
    deps.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' });
    return;
  }
  const player = room.players.find((p) => p.id === record.playerId);
  if (!player || player.isBot) {
    deps.sendSafe(socket, { type: 'ERROR', reasonCode: 'TOKEN_EXPIRED' });
    return;
  }

  deps.reconnects.cancelGracePeriod(record.roomCode, record.playerId);
  const session = deps.sessions.getSession(record.playerId) ?? deps.sessions.addSession(record.playerId);
  session.state = SessionState.Connected;
  session.lastPongAt = Date.now();

  deps.sockets.replacePlayerSocket(record.roomCode, record.playerId, socket);

  deps.broadcast(record.roomCode, { type: 'PLAYER_RECONNECTED', playerId: record.playerId });
  deps.broadcaster.resyncClient(record.roomCode, socket);
  if (room.started) {
    deps.sendSafe(socket, { type: 'ROOM_STARTED', roomCode: record.roomCode });
    deps.scheduleBotTurn(record.roomCode);
  }
}
