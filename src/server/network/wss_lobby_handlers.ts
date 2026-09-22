// [UC-GAME-001/MSS][UC-GAME-002/MSS] WSS Lobby Handlers — Create, Join, Start, Leave Room handlers
import { WebSocket } from 'ws';
import type { RoomManager, RollResult } from '../room_manager.js';
import type { SessionManager } from '../session_manager.js';
import type { ReconnectManager } from './reconnect_manager.js';
import type { SocketRegistry } from './socket_registry.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
import type { AdminManager } from './admin_manager.js';
import type { WsClientMessage, WsServerMessage, ReasonCode } from './network_types.js';
import type { Room, Player } from '../../domain/room.js';
import type { IntentGuard } from '../security/intent_guard.js';
import type { PlayerIntent } from '../intent_dispatcher.js';

export const MAX_PLAYERS = 4;

/** [SECURITY] Hybrid socket ownership check — reject only if a different socket is still OPEN */
export function isSocketOwner(sockets: SocketRegistry, roomCode: string, playerId: string, socket: WebSocket): boolean {
  const bound = sockets.getPlayerSocket(roomCode, playerId);
  if (!bound || bound === socket) return true;
  return bound.readyState !== WebSocket.OPEN;
}

export interface WssLobbyContext {
  readonly rooms: RoomManager;
  readonly sessions: SessionManager;
  readonly reconnects: ReconnectManager;
  readonly sockets: SocketRegistry;
  readonly broadcaster: DeltaBroadcaster;
  readonly adminManager: AdminManager;
  sendSafe: (socket: WebSocket, msg: WsServerMessage) => void;
  broadcast: (roomCode: string, msg: WsServerMessage) => void;
  sendSessionInit: (socket: WebSocket, playerId: string, roomCode: string) => void;
  bindSocket: (roomCode: string, playerId: string, socket: WebSocket) => void;
  scheduleBotTurn: (roomCode: string) => void;
  closeRoom: (roomCode: string) => void;
}

export function handleCreateRoom(
  ctx: WssLobbyContext,
  socket: WebSocket,
  msg: Extract<WsClientMessage, { type: 'CREATE_ROOM' }>,
): void {
  if (msg.roomCode) {
    const upper = msg.roomCode.toUpperCase();
    const existing = ctx.rooms.getRoom(upper);
    if (existing && existing.hostId === msg.playerId) {
      ctx.closeRoom(upper);
    }
  }
  if (ctx.rooms.getRoomCount() >= (Number(process.env['MAX_CONCURRENT_ROOMS']) || 50)) {
    ctx.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_FULL' as ReasonCode });
    return;
  }
  const room = ctx.rooms.createRoom(msg.playerId, msg.roomCode);
  ctx.reconnects.cancelGracePeriod(room.roomCode, msg.playerId);
  ctx.sessions.addSession(msg.playerId);
  ctx.bindSocket(room.roomCode, msg.playerId, socket);
  ctx.adminManager.initRoomLog(room.roomCode, { hostId: msg.playerId, playerCount: 1 });
  ctx.adminManager.recordRoomEvent(room.roomCode, {
    source: 'PLAYER',
    action: 'CREATE_ROOM',
    payloadSummary: `Chủ phòng ${msg.playerId} đã tạo phòng`,
  });
  ctx.adminManager.broadcastRoomListToAdmins();
  ctx.sendSafe(socket, { type: 'ROOM_CREATED', roomCode: room.roomCode, playerId: msg.playerId });
  ctx.sendSessionInit(socket, msg.playerId, room.roomCode);
}

// Helper: xây dựng payload LOBBY_UPDATE từ room
function buildLobbyUpdatePayload(room: Room): Extract<WsServerMessage, { type: 'LOBBY_UPDATE' }> {
  return {
    type: 'LOBBY_UPDATE',
    roomCode: room.roomCode,
    players: room.players.map((p, idx) => ({
      id: p.id,
      isHost: p.id === room.hostId,
      slotIndex: idx,
      name: p.name,
    })),
  };
}

export function handleJoinRoom(
  ctx: WssLobbyContext,
  socket: WebSocket,
  msg: Extract<WsClientMessage, { type: 'JOIN_ROOM' }>,
): void {
  const room = ctx.rooms.getRoom(msg.roomCode);
  if (!room) return ctx.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' });
  if (room.started) return ctx.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_STARTED' });
  if (room.players.length >= MAX_PLAYERS) return ctx.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_FULL' });

  // Server Slot Assignment Tuyệt Đối (Zero Ambiguity)
  // Nếu playerId client gửi không bị trùng → dùng nguyên; nếu trùng → tìm slot trống ['p2','p3','p4']
  let assignedPlayerId: string;
  if (!room.players.some((p) => p.id === msg.playerId)) {
    assignedPlayerId = msg.playerId;
  } else {
    const candidateSlots = ['p2', 'p3', 'p4'];
    const freeSlot = candidateSlots.find((s) => !room.players.some((p) => p.id === s));
    if (!freeSlot) return ctx.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_FULL' });
    assignedPlayerId = freeSlot;
  }

  ctx.rooms.joinRoom(msg.roomCode, assignedPlayerId);
  ctx.reconnects.cancelGracePeriod(msg.roomCode, assignedPlayerId);
  ctx.sessions.addSession(assignedPlayerId);
  ctx.adminManager.recordRoomEvent(msg.roomCode, {
    source: 'PLAYER',
    action: 'JOIN_ROOM',
    payloadSummary: `Người chơi ${assignedPlayerId} đã vào phòng (${room.players.length} người)`,
  });
  ctx.adminManager.broadcastRoomListToAdmins();
  // Broadcast LOBBY_UPDATE đến tất cả socket HIỆN TẠI trong phòng (trước khi bindSocket guest)
  // Đảm bảo host nhận LOBBY_UPDATE từ join TRƯỚC khi guest socket được đăng ký
  ctx.broadcast(msg.roomCode, buildLobbyUpdatePayload(room));
  // Sau đó bind socket của guest và gửi ROOM_JOINED/SESSION_INIT cho guest
  ctx.bindSocket(msg.roomCode, assignedPlayerId, socket);
  ctx.sendSafe(socket, { type: 'ROOM_JOINED', roomCode: msg.roomCode, playerId: assignedPlayerId, playerCount: room.players.length });
  ctx.sendSessionInit(socket, assignedPlayerId, msg.roomCode);
  // Gửi LOBBY_UPDATE cho chính socket vừa vào để người chơi này đồng bộ danh sách slot sảnh chờ
  ctx.sendSafe(socket, buildLobbyUpdatePayload(room));
}

function validateStartGame(room: Room | undefined, playerId: string): ReasonCode | undefined {
  if (!room || !room.players.some((p) => p.id === playerId)) return 'ROOM_NOT_FOUND';
  if (room.hostId !== playerId) return 'NOT_HOST';
  if (room.started) return 'ROOM_STARTED';
  return undefined;
}

function unmarkHumanSockets(ctx: WssLobbyContext, room: Room, normRoomCode: string, hostPlayerId: string): void {
  const hostP = room.players.find((p) => p.id === hostPlayerId);
  if (hostP) hostP.isBot = false;
  ctx.reconnects.cancelGracePeriod(normRoomCode, hostPlayerId);
  for (const p of room.players) {
    if (ctx.sockets.getPlayerSocket(normRoomCode, p.id)) {
      p.isBot = false;
      ctx.reconnects.cancelGracePeriod(normRoomCode, p.id);
    }
  }
}

export function handleStartGame(
  ctx: WssLobbyContext,
  socket: WebSocket,
  msg: Extract<WsClientMessage, { type: 'START_GAME' }>,
): void {
  const room = ctx.rooms.getRoom(msg.roomCode);
  const rejectReason = validateStartGame(room, msg.playerId);
  if (rejectReason) {
    ctx.sendSafe(socket, { type: 'ERROR', reasonCode: rejectReason });
    return;
  }
  if (!isSocketOwner(ctx.sockets, msg.roomCode, msg.playerId, socket)) {
    ctx.sendSafe(socket, { type: 'ERROR', reasonCode: 'TOKEN_EXPIRED' });
    return;
  }
  const normRoomCode = room!.roomCode;
  unmarkHumanSockets(ctx, room!, normRoomCode, msg.playerId);
  if (!ctx.rooms.startGame(normRoomCode, msg.bots)) {
    ctx.sendSafe(socket, { type: 'ERROR', reasonCode: 'NOT_ENOUGH_PLAYERS' });
    return;
  }
  ctx.bindSocket(msg.roomCode, msg.playerId, socket);
  ctx.adminManager.recordRoomEvent(normRoomCode, {
    source: 'PLAYER',
    action: 'START_GAME',
    payloadSummary: `Ván đấu bắt đầu với ${room!.players.length} người chơi`,
  });
  ctx.broadcast(msg.roomCode, { type: 'ROOM_STARTED', roomCode: msg.roomCode });
  ctx.broadcaster.broadcastRoomDelta(msg.roomCode, { forceFull: true });
  ctx.scheduleBotTurn(msg.roomCode);
  ctx.adminManager.broadcastRoomListToAdmins();
}

export function handlePong(
  ctx: WssLobbyContext,
  msg: Extract<WsClientMessage, { type: 'PONG' }>,
): void {
  ctx.sessions.handlePong(msg.playerId);
  if (msg.roomCode) {
    ctx.reconnects.cancelGracePeriod(msg.roomCode, msg.playerId);
  }
}

export function handleEmote(
  ctx: WssLobbyContext,
  socket: WebSocket,
  msg: Extract<WsClientMessage, { type: 'EMOTE' }>,
): void {
  const room = ctx.rooms.getRoom(msg.roomCode);
  if (!room || !room.players.some((p) => p.id === msg.playerId)) {
    ctx.sendSafe(socket, { type: 'ERROR', reasonCode: 'ROOM_NOT_FOUND' });
    return;
  }
  if (!isSocketOwner(ctx.sockets, msg.roomCode, msg.playerId, socket)) {
    ctx.sendSafe(socket, { type: 'ERROR', reasonCode: 'TOKEN_EXPIRED' });
    return;
  }
  ctx.bindSocket(msg.roomCode, msg.playerId, socket);
  ctx.broadcast(msg.roomCode, {
    type: 'PLAYER_EMOTE',
    playerId: msg.playerId,
    emoteId: msg.emoteId,
    timestamp: Date.now(),
  });
}

export function handleResync(
  ctx: WssLobbyContext,
  socket: WebSocket,
  msg: Extract<WsClientMessage, { type: 'INTENT_REQUEST_RESYNC' }>,
): void {
  if (!msg.roomCode) return;
  if (!isSocketOwner(ctx.sockets, msg.roomCode, msg.playerId, socket)) {
    ctx.sendSafe(socket, { type: 'ERROR', reasonCode: 'TOKEN_EXPIRED' });
    return;
  }
  ctx.bindSocket(msg.roomCode, msg.playerId, socket);
  ctx.broadcaster.resyncClient(msg.roomCode, socket);
  if (ctx.rooms.getRoom(msg.roomCode)?.started) {
    ctx.scheduleBotTurn(msg.roomCode);
  }
}

export function handleLeaveRoom(
  ctx: WssLobbyContext,
  socket: WebSocket,
  msg: Extract<WsClientMessage, { type: 'LEAVE_ROOM' }>,
): void {
  const room = ctx.rooms.getRoom(msg.roomCode);
  if (!room) return;
  if (!isSocketOwner(ctx.sockets, msg.roomCode, msg.playerId, socket)) {
    ctx.sendSafe(socket, { type: 'ERROR', reasonCode: 'TOKEN_EXPIRED' });
    return;
  }
  ctx.sockets.unregister(socket);
  ctx.reconnects.cancelGracePeriod(msg.roomCode, msg.playerId);
  if (room.hostId === msg.playerId) {
    ctx.closeRoom(msg.roomCode);
  } else if (room.started) {
    ctx.broadcast(msg.roomCode, { type: 'PLAYER_BOT_TAKEOVER', playerId: msg.playerId });
    const p = room.players.find((pl) => pl.id === msg.playerId);
    if (p) p.bankrupt = true;
    ctx.broadcaster.broadcastRoomDelta(msg.roomCode);
    ctx.scheduleBotTurn(msg.roomCode);
  } else {
    const idx = room.players.findIndex((pl) => pl.id === msg.playerId);
    if (idx !== -1) room.players.splice(idx, 1);
    ctx.broadcast(msg.roomCode, buildLobbyUpdatePayload(room));
    ctx.adminManager.broadcastRoomListToAdmins();
  }
}

export function validateIntentRequest(
  room: Room | undefined,
  player: Player | undefined,
  msg: Extract<WsClientMessage, { type: 'INTENT' }>,
  intentGuard: IntentGuard,
): { valid: true } | { valid: false; reasonCode: ReasonCode; isRejection?: boolean } {
  if (!msg.roomCode || !msg.intent || typeof msg.intent.type !== 'string') {
    return { valid: false, reasonCode: 'INVALID_INTENT' };
  }
  if (!room || !player) {
    return { valid: false, reasonCode: 'ROOM_NOT_FOUND' };
  }
  if (player.isBot) {
    return { valid: false, reasonCode: 'TOKEN_EXPIRED' };
  }
  const guardRes = intentGuard.validate(room, msg.playerId, msg.intent);
  if (!guardRes.allowed) {
    return { valid: false, reasonCode: guardRes.reasonCode ?? 'OUT_OF_TURN', isRejection: true };
  }
  return { valid: true };
}

export function executeIntentAction(
  rooms: RoomManager,
  roomCode: string,
  playerId: string,
  intent: PlayerIntent,
): { success: boolean; reason?: string; rollResult?: RollResult } {
  if (intent.type === 'INTENT_ROLL') {
    const rollRes = rooms.handleRollDice(roomCode, playerId);
    return { success: rollRes !== undefined, reason: rollRes !== undefined ? undefined : 'CANNOT_ROLL', rollResult: rollRes };
  }
  return rooms.handlePlayerIntent(roomCode, playerId, intent);
}


