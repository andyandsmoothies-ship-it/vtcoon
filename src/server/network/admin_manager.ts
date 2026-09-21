// [IMP-25/MSS][IMP-28/MSS] Admin Manager — Hệ Thống Quản Trị Trung Tâm Đa Bàn Chơi
import type { WebSocket } from 'ws';
import type { RoomManager } from '../room_manager.js';
import type { Room } from '../../domain/room.js';
import { encodeMsg, type WsServerMessage, type WsClientMessage } from './network_types.js';
import { PersistentRoomLogger, type RoomLogMeta, type RoomFinishSummary } from '../logging/persistent_room_logger.js';
import {
  evaluateRoomHealth,
  buildRoomSummary,
  buildRoomDetail,
  buildDiagnosticDump,
} from './admin_inspector.js';
import { handleAdminMessage } from './admin_message_handler.js';

import {
  MAX_ROOM_LOGS,
  type RoomHealthStatus,
  type AdminPlayerSummary,
  type AdminRoomSummary,
  type AdminRoomDetail,
  type AdminRoomLogEntry,
  type AdminArchivedRoomSummary,
  type AdminManagerOptions,
} from './admin_types.js';

export {
  MAX_ROOM_LOGS,
  type RoomHealthStatus,
  type AdminRoomSummary,
  type AdminRoomDetail,
  type AdminRoomLogEntry,
  type AdminArchivedRoomSummary,
  type AdminManagerOptions,
};

export class AdminManager {
  private readonly rooms: RoomManager;
  private readonly secret: string;
  private readonly onTerminateRoom?: (roomCode: string, reason?: string) => void;
  private readonly authenticatedSockets = new Set<WebSocket>();
  private readonly subscribedRooms = new Map<WebSocket, string>();
  private readonly roomLogs = new Map<string, AdminRoomLogEntry[]>();
  private readonly roomViolations = new Map<string, Array<{ type: string; message: string; timestamp: number }>>();
  private readonly roomLogger: PersistentRoomLogger;

  constructor(options: AdminManagerOptions) {
    this.rooms = options.roomManager;
    const secret = options.secret ?? process.env['VTCOON_ADMIN_SECRET'];
    if (!secret) {
      if (process.env['NODE_ENV'] === 'production') {
        throw new Error('FATAL: VTCOON_ADMIN_SECRET must be configured in production mode');
      }
      console.warn(JSON.stringify({
        event: 'WARN_ADMIN_SECRET_MISSING',
        timestamp: Date.now(),
        delta: { hint: 'Set VTCOON_ADMIN_SECRET env var. Admin panel disabled.' },
      }));
    }
    this.secret = secret ?? '';
    this.onTerminateRoom = options.onTerminateRoom;
    this.roomLogger = new PersistentRoomLogger({ logDir: options.loggerDir });
  }

  get logger(): PersistentRoomLogger {
    return this.roomLogger;
  }

  get authenticatedCount(): number {
    return this.authenticatedSockets.size;
  }

  hasRoom(roomCode: string): boolean {
    return this.rooms.hasRoom(roomCode);
  }

  authenticate(socket: WebSocket, secret: string): boolean {
    if (!this.secret) return false;
    if (typeof secret === 'string' && secret.trim() === this.secret) {
      this.authenticatedSockets.add(socket);
      return true;
    }
    return false;
  }

  isAuthenticated(socket: WebSocket): boolean {
    return this.authenticatedSockets.has(socket);
  }

  handleDisconnect(socket: WebSocket): void {
    this.authenticatedSockets.delete(socket);
    this.subscribedRooms.delete(socket);
  }

  initRoomLog(roomCode: string, meta?: RoomLogMeta): string {
    return this.roomLogger.initRoomLog(roomCode, meta);
  }

  subscribeRoom(socket: WebSocket, rawRoomCode: string): {
    success: boolean;
    detail?: AdminRoomDetail;
    recentLogs?: AdminRoomLogEntry[];
    reason?: string;
  } {
    if (!this.isAuthenticated(socket)) {
      return { success: false, reason: 'ADMIN_UNAUTHORIZED' };
    }
    const roomCode = rawRoomCode.trim().toUpperCase();
    if (!this.rooms.hasRoom(roomCode)) {
      return { success: false, reason: 'ADMIN_ROOM_NOT_FOUND' };
    }
    this.subscribedRooms.set(socket, roomCode);
    const detail = this.getRoomDetail(roomCode);
    const fullLogs = this.roomLogger.getRoomFullLog(roomCode);
    const recentLogs = fullLogs.length > 0 ? fullLogs : this.getRecentLogs(roomCode);
    return { success: true, detail, recentLogs };
  }

  unsubscribeRoom(socket: WebSocket, rawRoomCode?: string): void {
    if (rawRoomCode) {
      const roomCode = rawRoomCode.trim().toUpperCase();
      if (this.subscribedRooms.get(socket) === roomCode) this.subscribedRooms.delete(socket);
    } else {
      this.subscribedRooms.delete(socket);
    }
  }

  recordRoomEvent(
    roomCode: string,
    entry: Omit<AdminRoomLogEntry, 'id' | 'roomCode' | 'timestamp'> & { timestamp?: number },
  ): AdminRoomLogEntry {
    const norm = roomCode.toUpperCase();
    const timestamp = entry.timestamp ?? Date.now();
    const id = `log_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
    const fullEntry: AdminRoomLogEntry = {
      id,
      roomCode: norm,
      timestamp,
      source: entry.source,
      action: entry.action,
      payloadSummary: entry.payloadSummary,
    };

    this.roomLogger.appendEvent(norm, fullEntry);

    let list = this.roomLogs.get(norm);
    if (!list) {
      list = [];
      this.roomLogs.set(norm, list);
    }
    list.push(fullEntry);
    if (list.length > MAX_ROOM_LOGS) list.shift();

    this.broadcastToRoomSubscribers(norm, { type: 'ADMIN_ROOM_LOG', roomCode: norm, log: fullEntry });
    return fullEntry;
  }

  recordRoomViolation(roomCode: string, type: string, message: string): void {
    const norm = roomCode.toUpperCase();
    const now = Date.now();
    let violations = this.roomViolations.get(norm);
    if (!violations) {
      violations = [];
      this.roomViolations.set(norm, violations);
    }
    violations.push({ type, message, timestamp: now });
    this.recordRoomEvent(norm, {
      source: 'SYSTEM',
      action: 'INVARIANT_VIOLATION',
      payloadSummary: `[${type}] ${message}`,
      timestamp: now,
    });
  }

  evaluateRoomHealth(room: Room): { status: RoomHealthStatus; warningReason?: string } {
    return evaluateRoomHealth(room, this.roomViolations.get(room.roomCode), this.rooms);
  }

  getRoomsSummary(): AdminRoomSummary[] {
    const result: AdminRoomSummary[] = [];
    for (const room of this.rooms.roomMap.values()) {
      result.push(buildRoomSummary(room, this.rooms, this.roomViolations.get(room.roomCode)));
    }
    return result;
  }

  getRoomDetail(rawRoomCode: string): AdminRoomDetail | undefined {
    const norm = rawRoomCode.toUpperCase();
    return buildRoomDetail(rawRoomCode, this.rooms, this.roomViolations.get(norm));
  }

  getRecentLogs(rawRoomCode: string): AdminRoomLogEntry[] {
    return this.roomLogs.get(rawRoomCode.toUpperCase()) ?? [];
  }

  getArchivedRoomsList(): AdminArchivedRoomSummary[] {
    return this.roomLogger.getArchivedRoomsList();
  }

  getRoomFullLog(roomCode: string, timestamp?: number): AdminRoomLogEntry[] {
    return this.roomLogger.getRoomFullLog(roomCode, timestamp);
  }

  handleRoomClosed(rawRoomCode: string, summary?: RoomFinishSummary): void {
    const norm = rawRoomCode.trim().toUpperCase();
    const existingRoom = this.rooms.getRoom(norm);
    const finalSummary: RoomFinishSummary = {
      status: summary?.status ?? 'TERMINATED',
      winner: summary?.winner,
      endTime: summary?.endTime ?? Date.now(),
      playerCount: summary?.playerCount ?? existingRoom?.players.length ?? 1,
    };
    this.roomLogger.finishRoomLog(norm, finalSummary);
    this.roomLogs.delete(norm);
    this.roomViolations.delete(norm);
    for (const [sock, target] of this.subscribedRooms.entries()) {
      if (target === norm) this.subscribedRooms.delete(sock);
    }
    this.broadcastRoomListToAdmins();
  }

  terminateRoom(rawRoomCode: string, reason: string = 'ADMIN_FORCE_TERMINATE'): boolean {
    const norm = rawRoomCode.toUpperCase();
    if (!this.rooms.hasRoom(norm)) return false;
    this.recordRoomEvent(norm, {
      source: 'SYSTEM',
      action: 'ADMIN_FORCE_TERMINATE',
      payloadSummary: `Quản trị viên cưỡng chế đóng bàn chơi: ${reason}`,
    });
    if (this.onTerminateRoom) {
      this.onTerminateRoom(norm, reason);
    } else {
      this.rooms.closeRoom(norm);
      this.handleRoomClosed(norm, { status: 'TERMINATED' });
    }
    return true;
  }

  getDiagnosticDump(rawRoomCode: string): Record<string, unknown> | undefined {
    const norm = rawRoomCode.toUpperCase();
    return buildDiagnosticDump(
      rawRoomCode,
      this.rooms,
      this.roomViolations.get(norm),
      this.getRecentLogs(rawRoomCode),
    );
  }

  handleClientMessage(
    socket: WebSocket,
    msg: WsClientMessage,
    sendSafe: (s: WebSocket, m: WsServerMessage) => void,
  ): boolean {
    return handleAdminMessage(this, socket, msg, sendSafe);
  }

  broadcastToAdmins(msg: WsServerMessage): void {
    const encoded = encodeMsg(msg);
    for (const sock of this.authenticatedSockets) {
      if (sock.readyState === 1 /* WebSocket.OPEN */) {
        try { sock.send(encoded); } catch { /* safe-ignore */ }
      }
    }
  }

  broadcastRoomListToAdmins(): void {
    this.broadcastToAdmins({ type: 'ADMIN_ROOM_LIST', rooms: this.getRoomsSummary() });
  }

  private broadcastToRoomSubscribers(roomCode: string, msg: WsServerMessage): void {
    const encoded = encodeMsg(msg);
    for (const [sock, targetCode] of this.subscribedRooms.entries()) {
      if (targetCode === roomCode && this.authenticatedSockets.has(sock)) {
        if (sock.readyState === 1 /* WebSocket.OPEN */) {
          try { sock.send(encoded); } catch { /* safe-ignore */ }
        }
      }
    }
  }
}
