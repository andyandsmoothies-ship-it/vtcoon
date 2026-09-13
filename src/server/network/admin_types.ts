// [IMP-25/MSS] Admin Manager Type Definitions
import type { RoomManager } from '../room_manager.js';

export const DEFAULT_ADMIN_SECRET = 'vtcoon-admin-2026';
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
}

export interface AdminManagerOptions {
  readonly roomManager: RoomManager;
  readonly secret?: string;
  readonly onTerminateRoom?: (roomCode: string, reason?: string) => void;
}
