// [IMP-24/MSS] Watchdog Monitor — Stall & Infinite Loop Detection
import type { InvariantViolation } from './telemetry_types.js';
import { useGameStore } from '../store/game_store.js';

export const WATCHDOG_LIMITS = {
  MAX_TURN_STALL_MS: 45_000,
  BOT_BURST_WINDOW_MS: 300,
  BOT_BURST_MAX_ACTIONS: 8,
  MAX_ANIMATION_DURATION_MS: 10_000,
} as const;

interface CheckTurnStallParams {
  readonly currentTurnPlayerId: string | null;
  readonly timeRemaining: number;
  readonly elapsedTurnMs?: number;
  readonly tick: number;
  readonly isInAuction?: boolean;
  readonly turnPhase?: string;
  readonly hasProgress?: boolean;
}

export class WatchdogMonitor {
  private botActionHistory: Map<string, number[]> = new Map();
  private lastTurnPlayerId: string | null = null;
  private lastPhase: string | null = null;
  private turnStartTimeMs: number = Date.now();

  /**
   * Giám sát tình trạng kẹt lượt chơi (> 45 giây hoặc timer âm)
   */
  public checkTurnStall(params: CheckTurnStallParams): InvariantViolation | null {
    if (!params.currentTurnPlayerId) {
      this.lastTurnPlayerId = null;
      this.lastPhase = null;
      return null;
    }

    const now = Date.now();
    if (this.lastTurnPlayerId !== params.currentTurnPlayerId) {
      this.lastTurnPlayerId = params.currentTurnPlayerId;
      this.lastPhase = params.turnPhase ?? null;
      this.turnStartTimeMs = now;
    } else if (params.turnPhase && this.lastPhase !== params.turnPhase) {
      this.lastPhase = params.turnPhase;
      this.turnStartTimeMs = now;
    } else if (params.hasProgress === true) {
      this.turnStartTimeMs = now;
    }

    if (params.elapsedTurnMs !== undefined) {
      if (!Number.isFinite(params.elapsedTurnMs) || params.elapsedTurnMs <= 0) {
        return null;
      }
    }

    if (params.timeRemaining > 0) {
      return null;
    }

    const elapsed = params.elapsedTurnMs ?? Math.max(0, now - this.turnStartTimeMs);
    const stallThreshold = params.isInAuction ? 90_000 : WATCHDOG_LIMITS.MAX_TURN_STALL_MS;
    const isTimeStalled = params.isInAuction ? false : params.timeRemaining <= -5;
    const isElapsedStalled = params.timeRemaining <= 0 && elapsed >= stallThreshold;
    const isStalled = isTimeStalled || isElapsedStalled;

    if (isStalled) {
      return {
        id: `watchdog_stall_${params.tick}_${params.currentTurnPlayerId}_${now}`,
        timestamp: now,
        tick: params.tick,
        type: 'TURN_STALLED',
        severity: 'WARNING',
        message: `Lượt chơi của ${params.currentTurnPlayerId} bị treo quá ${Math.round(elapsed / 1000)}s mà không chuyển trạng thái.`,
        details: {
          playerId: params.currentTurnPlayerId,
          elapsedMs: elapsed,
          timeRemaining: params.timeRemaining,
        },
      };
    }
    return null;
  }

  /**
   * Giám sát tình trạng Bot lặp vô tận (> 8 hành động / 300ms)
   */
  public recordBotAction(
    botId: string,
    timestamp: number = Date.now(),
    tick: number = 0
  ): InvariantViolation | null {
    const history = this.botActionHistory.get(botId) ?? [];
    const windowStart = timestamp - WATCHDOG_LIMITS.BOT_BURST_WINDOW_MS;
    const recent = history.filter((t) => t >= windowStart);
    recent.push(timestamp);
    this.botActionHistory.set(botId, recent);

    if (recent.length > WATCHDOG_LIMITS.BOT_BURST_MAX_ACTIONS) {
      return {
        id: `watchdog_bot_loop_${tick}_${botId}_${timestamp}`,
        timestamp,
        tick,
        type: 'BOT_INFINITE_LOOP',
        severity: 'CRITICAL',
        message: `Bot ${botId} bị kẹt vòng lặp phát sinh thao tác dồn dập (${recent.length} thao tác / ${WATCHDOG_LIMITS.BOT_BURST_WINDOW_MS}ms).`,
        details: {
          botId,
          actionCount: recent.length,
          windowMs: WATCHDOG_LIMITS.BOT_BURST_WINDOW_MS,
        },
      };
    }
    return null;
  }

  /**
   * Giám sát kẹt hoạt ảnh quân cờ / chuyển động 3D FSM
   */
  public checkFsmAnimationStall(params: {
    readonly isAnimating: boolean;
    readonly animatingDurationMs: number;
    readonly tick: number;
    readonly maxAllowedMs?: number;
  }): InvariantViolation | null {
    const limit = params.maxAllowedMs ?? WATCHDOG_LIMITS.MAX_ANIMATION_DURATION_MS;
    if (params.isAnimating && params.animatingDurationMs > limit) {
      useGameStore.getState().clearActivePawnAnimation();
      return {
        id: `watchdog_fsm_anim_${params.tick}_${Date.now()}`,
        timestamp: Date.now(),
        tick: params.tick,
        type: 'FSM_ANIMATION_STALLED',
        severity: 'WARNING',
        message: `Hoạt ảnh FSM đang diễn ra quá thời hạn cho phép (${Math.round(params.animatingDurationMs / 1000)}s).`,
        details: { durationMs: params.animatingDurationMs },
      };
    }
    return null;
  }

  public recoverFsmAnimationStall(params: {
    readonly isAnimating: boolean;
    readonly animatingDurationMs: number;
    readonly tick: number;
    readonly maxAllowedMs?: number;
  }): InvariantViolation | null {
    const limit = params.maxAllowedMs ?? WATCHDOG_LIMITS.MAX_ANIMATION_DURATION_MS;
    if (params.isAnimating && params.animatingDurationMs > limit) {
      useGameStore.getState().clearActivePawnAnimation();
      return this.checkFsmAnimationStall(params);
    }
    return null;
  }

  public reset(): void {
    this.botActionHistory.clear();
    this.lastTurnPlayerId = null;
    this.lastPhase = null;
    this.turnStartTimeMs = Date.now();
  }
}

export const watchdogMonitor = new WatchdogMonitor();
