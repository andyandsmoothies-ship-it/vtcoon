// [IMP-25/MSS] Admin Manager — Hệ Thống Quản Trị Trung Tâm Đa Bàn Chơi
import type { WebSocket } from 'ws';
import type { RoomManager } from '../room_manager.js';
import { TurnPhase, type Room, type Player } from '../../domain/room.js';
import { encodeMsg, type WsServerMessage, type WsClientMessage, type ReasonCode } from './network_types.js';

import {
  DEFAULT_ADMIN_SECRET,
  MAX_ROOM_LOGS,
  type RoomHealthStatus,
  type AdminPlayerSummary,
  type AdminRoomSummary,
  type AdminRoomDetail,
  type AdminRoomLogEntry,
  type AdminManagerOptions,
} from './admin_types.js';

export {
  DEFAULT_ADMIN_SECRET,
  MAX_ROOM_LOGS,
  type RoomHealthStatus,
  type AdminPlayerSummary,
  type AdminRoomSummary,
  type AdminRoomDetail,
  type AdminRoomLogEntry,
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

  constructor(options: AdminManagerOptions) {
    this.rooms = options.roomManager;
    this.secret = options.secret ?? process.env['VTCOON_ADMIN_SECRET'] ?? DEFAULT_ADMIN_SECRET;
    this.onTerminateRoom = options.onTerminateRoom;
  }

  get authenticatedCount(): number {
    return this.authenticatedSockets.size;
  }

  authenticate(socket: WebSocket, secret: string): boolean {
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

  subscribeRoom(socket: WebSocket, rawRoomCode: string): {
    success: boolean;
    detail?: AdminRoomDetail;
    recentLogs?: AdminRoomLogEntry[];
    reason?: string;
  } {
    if (!this.isAuthenticated(socket)) {
      return { success: false, reason: 'ADMIN_UNAUTHORIZED' };
    }
    const roomCode = rawRoomCode.toUpperCase();
    if (!this.rooms.hasRoom(roomCode)) {
      return { success: false, reason: 'ADMIN_ROOM_NOT_FOUND' };
    }
    this.subscribedRooms.set(socket, roomCode);
    const detail = this.getRoomDetail(roomCode);
    const recentLogs = this.getRecentLogs(roomCode);
    return { success: true, detail, recentLogs };
  }

  unsubscribeRoom(socket: WebSocket, rawRoomCode?: string): void {
    if (rawRoomCode) {
      const roomCode = rawRoomCode.toUpperCase();
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
    const norm = room.roomCode;
    const violations = this.roomViolations.get(norm);
    if (violations && violations.length > 0) {
      const latest = violations[violations.length - 1];
      return { status: 'CRITICAL', warningReason: `[${latest?.type}] ${latest?.message}` };
    }
    for (const p of room.players) {
      if (p.balance < 0 && !p.bankrupt && room.phase !== TurnPhase.InsolvencyPhase) {
        return { status: 'CRITICAL', warningReason: `Số dư âm ngoài vỡ nợ (Người chơi ${p.id}: ${p.balance} Tr)` };
      }
      if (p.consecutiveDoubles > 2) {
        return { status: 'WARNING', warningReason: `Đổ đôi liên tiếp > 2 lần (Người chơi ${p.id})` };
      }
    }
    const reg = this.rooms.getRegistry(norm);
    if (reg && reg.size > 28) {
      return { status: 'CRITICAL', warningReason: `Số lượng BĐS vượt trần quy định: ${reg.size}/28` };
    }
    if (room.started && !room.players.every((p) => p.bankrupt)) {
      const lastAct = this.rooms.getLastActivity(norm);
      if (lastAct && Date.now() - lastAct > 60_000) {
        return { status: 'WARNING', warningReason: `Bàn chơi không có thao tác > 60s (Nghi ngờ kẹt lượt)` };
      }
    }
    return { status: 'NORMAL' };
  }

  private mapPlayers(room: Room, norm: string): AdminPlayerSummary[] {
    const reg = this.rooms.getRegistry(norm);
    const rankings = this.rooms.getRankings(norm);
    const netWorthMap = new Map(rankings.map((r) => [r.id, r.netWorth]));
    return room.players.map((p: Player) => {
      let propCount = 0;
      if (reg) {
        for (const ownerId of reg.values()) {
          if (ownerId === p.id) propCount++;
        }
      }
      return {
        id: p.id,
        balance: p.balance,
        position: p.position,
        isBot: Boolean(p.isBot),
        bankrupt: Boolean(p.bankrupt),
        propertyCount: propCount,
        netWorth: netWorthMap.get(p.id) ?? p.balance,
      };
    });
  }

  getRoomsSummary(): AdminRoomSummary[] {
    const result: AdminRoomSummary[] = [];
    for (const room of this.rooms.roomMap.values()) {
      const norm = room.roomCode;
      const health = this.evaluateRoomHealth(room);
      result.push({
        roomCode: norm,
        hostId: room.hostId,
        started: room.started,
        phase: room.phase,
        round: room.round ?? 1,
        playerCount: room.players.length,
        players: this.mapPlayers(room, norm),
        treasuryPool: room.treasury,
        status: health.status,
        warningReason: health.warningReason,
        lastActivity: this.rooms.getLastActivity(norm) ?? Date.now(),
        activeTimersCount: this.rooms.getActiveTimers(norm)?.size ?? 0,
        hasAuction: Boolean(room.currentAuction),
      });
    }
    return result;
  }

  getRoomDetail(rawRoomCode: string): AdminRoomDetail | undefined {
    const room = this.rooms.getRoom(rawRoomCode);
    if (!room) return undefined;
    const norm = room.roomCode;
    const health = this.evaluateRoomHealth(room);
    const reg = this.rooms.getRegistry(norm);
    const sm = this.rooms.getPropertyStates(norm);
    const propertyStates: Record<number, { ownerId?: string; level: number; isMortgaged: boolean }> = {};

    if (reg || sm) {
      for (let i = 0; i < 40; i++) {
        const ownerId = reg?.get(i);
        const st = sm?.get(i);
        if (ownerId || st) {
          propertyStates[i] = { ownerId, level: st?.level ?? 0, isMortgaged: Boolean(st?.isMortgaged) };
        }
      }
    }

    return {
      roomCode: norm,
      hostId: room.hostId,
      started: room.started,
      phase: room.phase,
      round: room.round ?? 1,
      playerCount: room.players.length,
      players: this.mapPlayers(room, norm),
      treasuryPool: room.treasury,
      status: health.status,
      warningReason: health.warningReason,
      lastActivity: this.rooms.getLastActivity(norm) ?? Date.now(),
      activeTimersCount: this.rooms.getActiveTimers(norm)?.size ?? 0,
      hasAuction: Boolean(room.currentAuction),
      propertyStates,
      chanceDiscardCount: room.chanceDiscard?.length ?? 0,
      marketDiscardCount: room.marketDiscard?.length ?? 0,
    };
  }

  getRecentLogs(rawRoomCode: string): AdminRoomLogEntry[] {
    return this.roomLogs.get(rawRoomCode.toUpperCase()) ?? [];
  }

  handleRoomClosed(rawRoomCode: string): void {
    const norm = rawRoomCode.toUpperCase();
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
      this.handleRoomClosed(norm);
    }
    return true;
  }

  getDiagnosticDump(rawRoomCode: string): Record<string, unknown> | undefined {
    const detail = this.getRoomDetail(rawRoomCode);
    if (!detail) return undefined;
    return {
      exportedAt: Date.now(),
      roomCode: detail.roomCode,
      seed: 12345,
      metrics: {
        playerCount: detail.playerCount,
        round: detail.round,
        phase: detail.phase,
        treasuryPool: detail.treasuryPool,
        status: detail.status,
      },
      violations: this.roomViolations.get(detail.roomCode) ?? [],
      players: detail.players,
      propertyStates: detail.propertyStates,
      auditLogs: this.getRecentLogs(rawRoomCode),
    };
  }

  handleClientMessage(
    socket: WebSocket,
    msg: WsClientMessage,
    sendSafe: (s: WebSocket, m: WsServerMessage) => void,
  ): boolean {
    switch (msg.type) {
      case 'ADMIN_AUTH': {
        const ok = this.authenticate(socket, msg.secret);
        if (ok) {
          sendSafe(socket, { type: 'ADMIN_AUTH_SUCCESS', message: 'Xác thực Quản trị viên thành công' });
          sendSafe(socket, { type: 'ADMIN_ROOM_LIST', rooms: this.getRoomsSummary() });
        } else {
          sendSafe(socket, { type: 'ADMIN_AUTH_FAILED', reason: 'Sai mã bí mật quản trị (Secret Key)' });
        }
        return true;
      }
      case 'ADMIN_GET_ROOMS': {
        if (!this.isAuthenticated(socket)) {
          sendSafe(socket, { type: 'ERROR', reasonCode: 'ADMIN_UNAUTHORIZED' });
        } else {
          sendSafe(socket, { type: 'ADMIN_ROOM_LIST', rooms: this.getRoomsSummary() });
        }
        return true;
      }
      case 'ADMIN_SUBSCRIBE_ROOM': {
        const res = this.subscribeRoom(socket, msg.roomCode);
        if (!res.success) {
          sendSafe(socket, { type: 'ERROR', reasonCode: (res.reason as ReasonCode) ?? 'ADMIN_UNAUTHORIZED' });
        } else if (res.detail) {
          sendSafe(socket, {
            type: 'ADMIN_ROOM_DETAIL',
            roomCode: msg.roomCode.toUpperCase(),
            detail: res.detail,
            recentLogs: res.recentLogs ?? [],
          });
        }
        return true;
      }
      case 'ADMIN_UNSUBSCRIBE_ROOM': {
        this.unsubscribeRoom(socket, msg.roomCode);
        return true;
      }
      case 'ADMIN_TERMINATE_ROOM': {
        if (!this.isAuthenticated(socket)) {
          sendSafe(socket, { type: 'ERROR', reasonCode: 'ADMIN_UNAUTHORIZED' });
          return true;
        }
        const norm = msg.roomCode.toUpperCase();
        if (!this.rooms.hasRoom(norm)) {
          sendSafe(socket, { type: 'ADMIN_ERROR', reasonCode: 'ADMIN_ROOM_NOT_FOUND', message: 'Phòng không tồn tại' });
          return true;
        }
        sendSafe(socket, { type: 'ADMIN_ACTION_SUCCESS', action: 'TERMINATE_ROOM', roomCode: norm });
        this.terminateRoom(norm, msg.reason);
        return true;
      }
      default:
        return false;
    }
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
