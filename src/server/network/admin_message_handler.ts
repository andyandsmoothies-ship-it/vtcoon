// [IMP-25/MSS][IMP-28/MSS] Admin WebSocket Message Dispatcher & Handlers
import type { WebSocket } from 'ws';
import type { WsClientMessage, WsServerMessage, ReasonCode } from './network_types.js';
import type { AdminManager } from './admin_manager.js';

export function handleAdminClientMessage(
  admin: AdminManager,
  socket: WebSocket,
  msg: WsClientMessage,
  sendSafe: (s: WebSocket, m: WsServerMessage) => void,
): boolean | Promise<boolean> {
  switch (msg.type) {
    case 'ADMIN_AUTH':
      return handleAuth(admin, socket, msg.secret, sendSafe);
    case 'ADMIN_GET_ROOMS':
      return handleGetRooms(admin, socket, sendSafe);
    case 'ADMIN_GET_ARCHIVED_ROOMS':
    case 'ADMIN_GET_ARCHIVED_ROOMLIST' as any:
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

export const handleAdminMessage = handleAdminClientMessage;
export const handleClientMessage = handleAdminClientMessage;

function handleAuth(
  admin: AdminManager,
  socket: WebSocket,
  secret: string,
  sendSafe: (s: WebSocket, m: WsServerMessage) => void,
): boolean {
  const ok = admin.authenticate(socket, secret);
  if (ok) {
    sendSafe(socket, { type: 'ADMIN_AUTH_SUCCESS', message: 'Xác thực Quản trị viên thành công' });
    sendSafe(socket, { type: 'ADMIN_ROOM_LIST', rooms: admin.getRoomsSummary(), vitals: admin.getServerVitals() });
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

async function dispatchAuthAsync(
  admin: AdminManager,
  socket: WebSocket,
  sendSafe: (s: WebSocket, m: WsServerMessage) => void,
  factory: () => Promise<WsServerMessage>,
): Promise<boolean> {
  if (!admin.isAuthenticated(socket)) {
    sendSafe(socket, { type: 'ERROR', reasonCode: 'ADMIN_UNAUTHORIZED' });
  } else {
    const msg = await factory();
    sendSafe(socket, msg);
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
    vitals: admin.getServerVitals(),
  }));
}

async function handleGetArchivedRooms(
  admin: AdminManager,
  socket: WebSocket,
  sendSafe: (s: WebSocket, m: WsServerMessage) => void,
): Promise<boolean> {
  return dispatchAuthAsync(admin, socket, sendSafe, async () => {
    const rooms = typeof admin.getArchivedRoomsListAsync === 'function'
      ? await admin.getArchivedRoomsListAsync()
      : admin.getArchivedRoomsList();
    return {
      type: 'ADMIN_ARCHIVED_ROOM_LIST',
      rooms,
    };
  });
}

async function handleGetArchivedLogs(
  admin: AdminManager,
  socket: WebSocket,
  roomCode: string,
  timestamp: number | undefined,
  sendSafe: (s: WebSocket, m: WsServerMessage) => void,
): Promise<boolean> {
  const norm = roomCode.trim().toUpperCase();
  return dispatchAuthAsync(admin, socket, sendSafe, async () => {
    const logs = typeof admin.getRoomFullLogAsync === 'function'
      ? await admin.getRoomFullLogAsync(norm, timestamp)
      : admin.getRoomFullLog(norm, timestamp);
    return {
      type: 'ADMIN_ARCHIVED_LOG_DATA',
      roomCode: norm,
      logs,
    };
  });
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
