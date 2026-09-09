// [UC-GAME-010/MSS][TD-NET-005] Room Cleanup Scheduler — Tự động dọn phòng bỏ hoang sau 10 phút
import type { RoomManager } from './room_manager.js';

export const DEFAULT_ABANDONED_TIMEOUT_MS = 10 * 60 * 1000; // 10 phút (600.000ms)
export const DEFAULT_CLEANUP_INTERVAL_MS  = 60 * 1000;      // Quét mỗi 1 phút (60.000ms)

export interface RoomCleanupSchedulerConfig {
  readonly roomManager: RoomManager;
  readonly timeoutMs?: number;
  readonly intervalMs?: number;
  readonly onCleanup?: (roomCode: string) => void;
}

export class RoomCleanupScheduler {
  private readonly roomManager: RoomManager;
  private readonly timeoutMs: number;
  private readonly intervalMs: number;
  private readonly onCleanup?: (roomCode: string) => void;
  private timer?: NodeJS.Timeout;

  constructor(config: RoomCleanupSchedulerConfig) {
    this.roomManager = config.roomManager;
    this.timeoutMs   = config.timeoutMs ?? DEFAULT_ABANDONED_TIMEOUT_MS;
    this.intervalMs  = config.intervalMs ?? DEFAULT_CLEANUP_INTERVAL_MS;
    this.onCleanup   = config.onCleanup;
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.sweep();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  sweep(now: number = Date.now()): string[] {
    const cleaned: string[] = [];
    for (const roomCode of this.roomManager.getAllRoomCodes()) {
      const lastActive = this.roomManager.getLastActivity(roomCode);
      const isAbandoned = lastActive === undefined || now - lastActive >= this.timeoutMs;
      if (isAbandoned) {
        console.warn(JSON.stringify({
          event: 'WARN_ROOM_TIMEOUT',
          correlationId: roomCode,
          timestamp: now,
          delta: { idleMs: lastActive !== undefined ? now - lastActive : this.timeoutMs },
        }));
        if (this.onCleanup) {
          this.onCleanup(roomCode);
        } else {
          this.roomManager.closeRoom(roomCode);
        }
        cleaned.push(roomCode);
      }
    }
    return cleaned;
  }
}
