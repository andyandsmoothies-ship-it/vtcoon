// [IMP-423] Admin Manager Types & Interface Seam
import type { WebSocket } from 'ws';
import type { RoomManager } from '../room_manager.js';
import type {
  RoomHealthStatus,
  AdminPlayerSummary,
  AdminRoomSummary,
  CloudStorageVitals,
  ServerVitals,
  AdminRoomDetail,
  AdminRoomLogEntry,
  ArchivedRoomStatus,
  AdminArchivedRoomSummary,
} from '../../domain/protocol/index.js';

export type {
  RoomHealthStatus,
  AdminPlayerSummary,
  AdminRoomSummary,
  CloudStorageVitals,
  ServerVitals,
  AdminRoomDetail,
  AdminRoomLogEntry,
  ArchivedRoomStatus,
  AdminArchivedRoomSummary,
};

export { MAX_ROOM_LOGS } from './admin_event_store.js';

export interface AdminManagerOptions {
  readonly roomManager: RoomManager;
  readonly secret?: string;
  readonly onTerminateRoom?: (roomCode: string, reason?: string) => void;
  readonly loggerDir?: string;
}

export interface IAdminManager {
  authenticate(socket: WebSocket, secret: string): boolean;
  isAuthenticated(socket: WebSocket): boolean;
  getRoomsSummary(): AdminRoomSummary[];
  getArchivedRoomsList(): AdminArchivedRoomSummary[];
  getArchivedRoomsListAsync?(): Promise<AdminArchivedRoomSummary[]>;
  getArchivedLogs?(roomCode: string, timestamp?: number): AdminRoomLogEntry[];
  getRoomFullLog(roomCode: string, timestamp?: number): AdminRoomLogEntry[];
  getRoomFullLogAsync?(roomCode: string, timestamp?: number): Promise<AdminRoomLogEntry[]>;
  hasRoom(roomCode: string): boolean;
  subscribeRoom(socket: WebSocket, roomCode: string): { success: boolean; detail?: AdminRoomDetail; recentLogs?: AdminRoomLogEntry[]; reason?: string };
  unsubscribeRoom(socket: WebSocket, roomCode?: string): void;
  getRoomDetail(roomCode: string): AdminRoomDetail | null | undefined;
  getDiagnosticDump(roomCode: string): Record<string, unknown> | undefined;
  terminateRoom(roomCode: string, reason?: string): boolean;
  getServerVitals(): ServerVitals;
  getAuditEvents?(limit?: number): unknown[];
  syncCloudLogs(options?: { force?: boolean }): Promise<{ success: boolean; uploadedCount?: number; bucket?: string; reason?: string; error?: string; syncedCount?: number }>;
}
