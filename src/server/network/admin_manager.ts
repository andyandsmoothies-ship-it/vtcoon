import { WebSocket } from 'ws';
import { normalizeRoomCode, timingSafeStringCompare } from './admin_security.js';
import type { RoomManager } from '../room_manager.js';
import type { SessionManager } from '../session_manager.js';
import type { ReconnectManager } from './reconnect_manager.js';
import type { Room } from '../../domain/room.js';
import { encodeMsg, type WsServerMessage, type WsClientMessage } from './network_types.js';
import { PersistentRoomLogger, type RoomLogMeta, type RoomFinishSummary } from '../logging/persistent_room_logger.js';
import {
  evaluateRoomHealth,
  buildRoomSummary,
  buildRoomDetail,
  buildDiagnosticDump,
} from './admin_inspector.js';
import { handleAdminClientMessage } from './admin_message_handler.js';
import { collectServerVitals } from './admin_vitals.js';
import { syncAdminCloudLogs } from './admin_cloud_sync.js';
import { AdminEventStore } from './admin_event_store.js';

import {
  MAX_ROOM_LOGS,
  type RoomHealthStatus,
  type AdminPlayerSummary,
  type AdminRoomSummary,
  type AdminRoomDetail,
  type AdminRoomLogEntry,
  type AdminArchivedRoomSummary,
  type AdminManagerOptions,
  type ServerVitals,
} from './admin_types.js';

export {
  MAX_ROOM_LOGS,
  type RoomHealthStatus,
  type AdminRoomSummary,
  type AdminRoomDetail,
  type AdminRoomLogEntry,
  type AdminArchivedRoomSummary,
  type AdminManagerOptions,
  type ServerVitals,
};

export class AdminManager {
  private readonly rooms: RoomManager;
  private readonly secret: string;
  private readonly onTerminateRoom?: (roomCode: string, reason?: string) => void;
  private readonly authenticatedSockets = new Set<WebSocket>();
  private readonly subscribedRooms = new Map<WebSocket, string>();
  private readonly roomLogger: PersistentRoomLogger;
  private readonly eventStore: AdminEventStore;
  private isSyncingCloud = false;
  private timeRemainingProvider?: (roomCode: string) => number;
  private reconnectManager?: ReconnectManager;
  private sessionManager?: SessionManager;

  constructor(options: AdminManagerOptions) {
    this.rooms = options.roomManager;
    const rawSecret = options.secret ?? process.env['VTCOON_ADMIN_SECRET'] ?? process.env['ADMIN_SECRET'];
    const secret = typeof rawSecret === 'string' ? rawSecret.trim() : undefined;
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
    this.eventStore = new AdminEventStore(this.roomLogger);
  }

  get logger(): PersistentRoomLogger {
    return this.roomLogger;
  }

  get isSyncing(): boolean {
    return this.isSyncingCloud;
  }

  get authenticatedCount(): number {
    return this.authenticatedSockets.size;
  }

  setTimeRemainingProvider(p: (roomCode: string) => number): void {
    this.timeRemainingProvider = p;
  }

  setReconnectManager(r: ReconnectManager): void {
    this.reconnectManager = r;
  }

  setSessionManager(s: SessionManager): void {
    this.sessionManager = s;
  }

  getServerVitals = (): ServerVitals => {
    return collectServerVitals(this.rooms, this.roomLogger);
  };

  hasRoom(rawRoomCode: string): boolean {
    return this.rooms.hasRoom(normalizeRoomCode(rawRoomCode));
  }

  authenticate(socket: WebSocket, secret: string): boolean {
    if (!this.secret) return false;
    if (typeof secret === 'string' && timingSafeStringCompare(secret.trim(), this.secret)) {
      if (!this.authenticatedSockets.has(socket)) {
        this.authenticatedSockets.add(socket);
        try {
          socket.on('error', () => { this.handleDisconnect(socket); });
        } catch { /* safe-ignore */ }
      }
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
    const roomCode = normalizeRoomCode(rawRoomCode);
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
      const roomCode = normalizeRoomCode(rawRoomCode);
      if (this.subscribedRooms.get(socket) === roomCode) this.subscribedRooms.delete(socket);
    } else {
      this.subscribedRooms.delete(socket);
    }
  }

  recordRoomEvent(
    roomCode: string,
    entry: Omit<AdminRoomLogEntry, 'id' | 'roomCode' | 'timestamp'> & { timestamp?: number; playerId?: string },
  ): AdminRoomLogEntry {
    const fullEntry = this.eventStore.recordRoomEvent(roomCode, entry);
    this.broadcastToRoomSubscribers(fullEntry.roomCode, { type: 'ADMIN_ROOM_LOG', roomCode: fullEntry.roomCode, log: fullEntry });
    return fullEntry;
  }

  recordRoomViolation(roomCode: string, type: string, message: string): void {
    const norm = normalizeRoomCode(roomCode);
    this.eventStore.recordViolation(norm, type, message);
    this.recordRoomEvent(norm, {
      source: 'SYSTEM',
      action: 'INVARIANT_VIOLATION',
      payloadSummary: `[${type}] ${message}`,
    });
  }

  evaluateRoomHealth(room: Room): { status: RoomHealthStatus; warningReason?: string } {
    return evaluateRoomHealth(room, this.eventStore.getViolations(room.roomCode), this.rooms);
  }

  getRoomsSummary(): AdminRoomSummary[] {
    const result: AdminRoomSummary[] = [];
    const opts = {
      timeRemainingProvider: this.timeRemainingProvider,
      reconnectManager: this.reconnectManager,
    };
    for (const room of this.rooms.roomMap.values()) {
      result.push(buildRoomSummary(room, this.rooms, this.eventStore.getViolations(room.roomCode), opts));
    }
    return result;
  }

  getRoomDetail(rawRoomCode: string): AdminRoomDetail | undefined {
    const norm = normalizeRoomCode(rawRoomCode);
    const opts = {
      timeRemainingProvider: this.timeRemainingProvider,
      reconnectManager: this.reconnectManager,
    };
    return buildRoomDetail(norm, this.rooms, this.eventStore.getViolations(norm), opts);
  }

  getRecentLogs = (rawRoomCode: string, playerId?: string): AdminRoomLogEntry[] => {
    return this.eventStore.getRecentLogs(rawRoomCode, playerId);
  };

  getArchivedRoomsList(): AdminArchivedRoomSummary[] {
    return this.roomLogger.getArchivedRoomsList();
  }

  async getArchivedRoomsListAsync(): Promise<AdminArchivedRoomSummary[]> {
    if (this.roomLogger.getArchivedRoomsList().length === 0) {
      await this.roomLogger.syncCloudManifest();
    }
    return this.roomLogger.getArchivedRoomsList();
  }

  getRoomFullLog(roomCode: string, timestamp?: number): AdminRoomLogEntry[] {
    return this.roomLogger.getRoomFullLog(roomCode, timestamp);
  }

  async getRoomFullLogAsync(roomCode: string, timestamp?: number): Promise<AdminRoomLogEntry[]> {
    return this.roomLogger.getRoomFullLogAsync(roomCode, timestamp);
  }

  async syncCloudLogs(options?: { force?: boolean }): Promise<{
    success: boolean;
    uploadedCount?: number;
    bucket?: string;
    reason?: string;
    error?: string;
  }> {
    if (this.isSyncingCloud) {
      return { success: false, reason: 'ALREADY_SYNCING' };
    }
    this.isSyncingCloud = true;
    try {
      return await syncAdminCloudLogs(this.roomLogger);
    } finally {
      this.isSyncingCloud = false;
    }
  }

  handleRoomClosed(rawRoomCode: string, summary?: RoomFinishSummary): void {
    const norm = normalizeRoomCode(rawRoomCode);
    const existingRoom = this.rooms.getRoom(norm);
    const finalSummary: RoomFinishSummary = {
      status: summary?.status ?? 'TERMINATED',
      winner: summary?.winner,
      endTime: summary?.endTime ?? Date.now(),
      playerCount: summary?.playerCount ?? existingRoom?.players.length ?? 1,
    };
    this.roomLogger.finishRoomLog(norm, finalSummary);
    this.eventStore.clearRoom(norm);
    for (const [sock, target] of this.subscribedRooms.entries()) {
      if (target === norm) this.subscribedRooms.delete(sock);
    }
    this.broadcastRoomListToAdmins();
    this.broadcastArchivedRoomsToAdmins();
  }

  broadcastArchivedRoomsToAdmins(): void {
    this.broadcastToAdmins({
      type: 'ADMIN_ARCHIVED_ROOM_LIST',
      rooms: this.getArchivedRoomsList(),
    });
  }

  terminateRoom(rawRoomCode: string, reason: string = 'ADMIN_FORCE_TERMINATE'): boolean {
    const norm = normalizeRoomCode(rawRoomCode);
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
    const norm = normalizeRoomCode(rawRoomCode);
    return buildDiagnosticDump(
      norm,
      this.rooms,
      this.eventStore.getViolations(norm),
      this.getRecentLogs(norm),
    );
  }

  handleClientMessage(
    socket: WebSocket,
    msg: WsClientMessage,
    sendSafe: (s: WebSocket, m: WsServerMessage) => void,
  ): boolean | Promise<boolean> {
    return handleAdminClientMessage(this, socket, msg, sendSafe);
  }

  private sendAndPrune(sockets: Iterable<WebSocket>, encoded: string): void {
    const dead: WebSocket[] = [];
    for (const sock of sockets) {
      if (sock.readyState === WebSocket.OPEN) {
        try {
          sock.send(encoded, (err) => {
            if (err) this.handleDisconnect(sock);
          });
        } catch {
          dead.push(sock);
        }
      } else if (sock.readyState === WebSocket.CLOSING || sock.readyState === WebSocket.CLOSED) {
        dead.push(sock);
      }
    }
    for (const s of dead) { this.handleDisconnect(s); }
  }

  broadcastToAdmins(msg: WsServerMessage): void {
    this.sendAndPrune(this.authenticatedSockets, encodeMsg(msg));
  }

  broadcastRoomListToAdmins(): void {
    this.broadcastToAdmins({
      type: 'ADMIN_ROOM_LIST',
      rooms: this.getRoomsSummary(),
      vitals: this.getServerVitals(),
    });
  }

  private broadcastToRoomSubscribers(rawRoomCode: string, msg: WsServerMessage): void {
    const norm = normalizeRoomCode(rawRoomCode);
    const encoded = encodeMsg(msg);
    const targetSockets: WebSocket[] = [];
    for (const [sock, target] of this.subscribedRooms.entries()) {
      if (target === norm && this.authenticatedSockets.has(sock)) {
        targetSockets.push(sock);
      }
    }
    this.sendAndPrune(targetSockets, encoded);
  }
}
