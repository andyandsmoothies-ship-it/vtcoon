// [IMP-25/MSS][IMP-28/MSS] Admin WebSocket Message Dispatcher & Handlers
import type { WebSocket } from 'ws';
import type { WsClientMessage, WsServerMessage, ReasonCode } from './network_types.js';
import type { AdminManager } from './admin_manager.js';

export function handleAdminMessage(
  admin: AdminManager,
  socket: WebSocket,
  msg: WsClientMessage,
  sendSafe: (s: WebSocket, m: WsServerMessage) => void,
): boolean {
  switch (msg.type) {
    case 'ADMIN_AUTH':
      return handleAuth(admin, socket, msg.secret, sendSafe);
    case 'ADMIN_GET_ROOMS':
      return handleGetRooms(admin, socket, sendSafe);
    case 'ADMIN_GET_ARCHIVED_ROOMS':
      return handleGetArchivedRooms(admin, socket, sendSafe);
    case 'ADMIN_GET_ARCHIVED_LOGS':
      return handleGetArchivedLogs(admin, socket, msg.roomCode, msg.timestamp, sendSafe);
    case 'ADMIN_SUBSCRIBE_ROOM':
      return handleSubscribe(admin, socket, msg.roomCode, sendSafe);
    case 'ADMIN_UNSUBSCRIBE_ROOM':
      admin.unsubscribeRoom(socket, msg.roomCode);
      return true;
    case 'ADMIN_TERMINATE_ROOM':
      return handleTerminate(admin, socket, msg.roomCode, msg.reason, sendSafe);
    default:
      return false;
  }
}

function handleAuth(
  admin: AdminManager,
  socket: WebSocket,
  secret: string,
  sendSafe: (s: WebSocket, m: WsServerMessage) => void,
): boolean {
  const ok = admin.authenticate(socket, secret);
  if (ok) {
    sendSafe(socket, { type: 'ADMIN_AUTH_SUCCESS', message: 'Xác thực Quản trị viên thành công' });
    sendSafe(socket, { type: 'ADMIN_ROOM_LIST', rooms: admin.getRoomsSummary() });
  } else {
    sendSafe(socket, { type: 'ADMIN_AUTH_FAILED', reason: 'Sai mã bí mật quản trị (Secret Key)' });
  }
  return true;
}

function dispatchAuth(
  admin: AdminManager,
  socket: WebSocket,
  sendSafe: (s: WebSocket, m: WsServerMessage) => void,
  factory: () => WsServerMessage,
): boolean {
  if (!admin.isAuthenticated(socket)) {
    sendSafe(socket, { type: 'ERROR', reasonCode: 'ADMIN_UNAUTHORIZED' });
  } else {
    sendSafe(socket, factory());
  }
  return true;
}

function handleGetRooms(
  admin: AdminManager,
  socket: WebSocket,
  sendSafe: (s: WebSocket, m: WsServerMessage) => void,
): boolean {
  return dispatchAuth(admin, socket, sendSafe, () => ({
    type: 'ADMIN_ROOM_LIST',
    rooms: admin.getRoomsSummary(),
  }));
}

function handleGetArchivedRooms(
  admin: AdminManager,
  socket: WebSocket,
  sendSafe: (s: WebSocket, m: WsServerMessage) => void,
): boolean {
  return dispatchAuth(admin, socket, sendSafe, () => ({
    type: 'ADMIN_ARCHIVED_ROOM_LIST',
    rooms: admin.getArchivedRoomsList(),
  }));
}

function handleGetArchivedLogs(
  admin: AdminManager,
  socket: WebSocket,
  roomCode: string,
  timestamp: number | undefined,
  sendSafe: (s: WebSocket, m: WsServerMessage) => void,
): boolean {
  const norm = roomCode.trim().toUpperCase();
  return dispatchAuth(admin, socket, sendSafe, () => ({
    type: 'ADMIN_ARCHIVED_LOG_DATA',
    roomCode: norm,
    logs: admin.getRoomFullLog(norm, timestamp),
  }));
}

function handleSubscribe(
  admin: AdminManager,
  socket: WebSocket,
  rawRoomCode: string,
  sendSafe: (s: WebSocket, m: WsServerMessage) => void,
): boolean {
  const res = admin.subscribeRoom(socket, rawRoomCode);
  if (!res.success) {
    sendSafe(socket, { type: 'ERROR', reasonCode: (res.reason as ReasonCode) ?? 'ADMIN_UNAUTHORIZED' });
  } else if (res.detail) {
    sendSafe(socket, {
      type: 'ADMIN_ROOM_DETAIL',
      roomCode: rawRoomCode.toUpperCase(),
      detail: res.detail,
      recentLogs: res.recentLogs ?? [],
    });
  }
  return true;
}

function handleTerminate(
  admin: AdminManager,
  socket: WebSocket,
  rawRoomCode: string,
  reason: string | undefined,
  sendSafe: (s: WebSocket, m: WsServerMessage) => void,
): boolean {
  if (!admin.isAuthenticated(socket)) {
    sendSafe(socket, { type: 'ERROR', reasonCode: 'ADMIN_UNAUTHORIZED' });
    return true;
  }
  const norm = rawRoomCode.toUpperCase();
  if (!admin.hasRoom(norm)) {
    sendSafe(socket, { type: 'ADMIN_ERROR', reasonCode: 'ADMIN_ROOM_NOT_FOUND', message: 'Phòng không tồn tại' });
    return true;
  }
  sendSafe(socket, { type: 'ADMIN_ACTION_SUCCESS', action: 'TERMINATE_ROOM', roomCode: norm });
  admin.terminateRoom(norm, reason);
  return true;
}
