// [IMP-25/MSS] Admin Manager Type Definitions
import type { RoomManager } from '../room_manager.js';

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
} from '../../domain/protocol/index.js';

// [SECURITY] No default admin secret — must be configured via VTCOON_ADMIN_SECRET env var
export const MAX_ROOM_LOGS = 100;

export interface AdminManagerOptions {
  readonly roomManager: RoomManager;
  readonly secret?: string;
  readonly onTerminateRoom?: (roomCode: string, reason?: string) => void;
  readonly loggerDir?: string;
}
