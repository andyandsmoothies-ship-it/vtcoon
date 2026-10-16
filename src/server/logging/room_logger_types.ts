// [IMP-423] Room Logger Types Seam
import type { ArchivedRoomStatus } from '../../domain/protocol/index.js';

export interface RoomLogMeta {
  readonly hostId?: string;
  readonly playerCount?: number;
  readonly timestamp?: number;
}

export interface RoomFinishSummary {
  readonly status?: ArchivedRoomStatus;
  readonly winner?: string;
  readonly endTime?: number;
  readonly playerCount?: number;
}
