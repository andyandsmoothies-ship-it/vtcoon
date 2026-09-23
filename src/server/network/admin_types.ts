// [IMP-25/MSS] Admin Manager Type Definitions
import type { RoomManager } from '../room_manager.js';

// [SECURITY] No default admin secret — must be configured via VTCOON_ADMIN_SECRET env var
export const MAX_ROOM_LOGS = 100;

export type RoomHealthStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface AdminPlayerSummary {
  readonly id: string;
  readonly balance: number;
  readonly position: number;
  readonly isBot: boolean;
  readonly bankrupt: boolean;
  readonly propertyCount: number;
  readonly netWorth: number;
  readonly isConnected?: boolean;
  readonly inGracePeriod?: boolean;
  readonly graceSecondsLeft?: number;
}

export interface AdminRoomSummary {
  readonly roomCode: string;
  readonly hostId: string;
  readonly started: boolean;
  readonly phase: string;
  readonly round: number;
  readonly playerCount: number;
  readonly players: readonly AdminPlayerSummary[];
  readonly treasuryPool: number;
  readonly status: RoomHealthStatus;
  readonly warningReason?: string;
  readonly lastActivity: number;
  readonly activeTimersCount: number;
  readonly hasAuction: boolean;
  readonly currentTurnPlayerId?: string;
  readonly currentTurnStepName?: string;
  readonly turnSecondsLeft?: number;
}

export interface CloudStorageVitals {
  readonly configured: boolean;
  readonly provider: 'supabase';
  readonly bucket: string;
  readonly keyType: 'JWT' | 'OPAQUE' | 'NONE';
  readonly uploadedCount?: number;
}

export interface ServerVitals {
  readonly memoryRssMb: number;
  readonly memoryHeapUsedMb: number;
  readonly uptimeSeconds: number;
  readonly totalRooms: number;
  readonly liveRooms: number;
  readonly lobbyRooms: number;
  readonly storageStatus?: CloudStorageVitals;
}

export interface AdminRoomDetail extends AdminRoomSummary {
  readonly propertyStates: Record<number, { ownerId?: string; level: number; isMortgaged: boolean }>;
  readonly chanceDiscardCount: number;
  readonly marketDiscardCount: number;
}

export interface AdminRoomLogEntry {
  readonly id: string;
  readonly roomCode: string;
  readonly timestamp: number;
  readonly source: 'SERVER' | 'PLAYER' | 'BOT' | 'SYSTEM';
  readonly action: string;
  readonly payloadSummary: string;
  readonly playerId?: string;
}

export type ArchivedRoomStatus = 'ACTIVE' | 'FINISHED' | 'TERMINATED';

export interface AdminArchivedRoomSummary {
  readonly roomCode: string;
  readonly startTime: number;
  readonly endTime?: number;
  readonly playerCount: number;
  readonly winner?: string;
  readonly logFilePath: string;
  readonly status: ArchivedRoomStatus;
  readonly totalEvents: number;
  readonly fileSizeBytes?: number;
}

export interface AdminManagerOptions {
  readonly roomManager: RoomManager;
  readonly secret?: string;
  readonly onTerminateRoom?: (roomCode: string, reason?: string) => void;
  readonly loggerDir?: string;
}
