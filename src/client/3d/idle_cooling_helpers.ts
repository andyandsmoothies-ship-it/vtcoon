// [UI-S02/MSS][IMP-376] idle_cooling_helpers.ts — Pure helper logic for adaptive idle frameloop cooling
export type IdleCoolingMode = 'ACTIVE_60FPS' | 'IDLE_COOLING_30FPS' | 'SUSPENDED_BACKGROUND';

export const JITTER_SLACK_SEC = 0.002;

export const IDLE_COOLING_CONFIG = {
  activeTargetFps: 60,
  idleTargetFps: 30,
  activeIntervalSec: 1 / 60,
  idleIntervalSec: 1 / 30,
  gracePeriodMs: 1200,
} as const;

export interface MotionDetectionParams {
  readonly isRolling?: boolean;
  readonly isPawnAnimating?: boolean;
  readonly isCameraTransitioning?: boolean;
  readonly isUserInteracting?: boolean;
  readonly activeModal?: string | null;
  readonly hasActiveVfx?: boolean;
}

export function is3DModalActive(modal: string | null | undefined): boolean {
  if (!modal) return false;
  return modal === 'auction' || modal === 'event';
}

export function hasActiveDictionaryKeys(dict?: Record<string | number, unknown> | null): boolean {
  if (!dict) return false;
  for (const _ in dict) return true;
  return false;
}

export function isGameMotionActive(params: MotionDetectionParams): boolean {
  return Boolean(
    params.isRolling ||
    params.isPawnAnimating ||
    params.isCameraTransitioning ||
    params.isUserInteracting ||
    is3DModalActive(params.activeModal) ||
    params.hasActiveVfx
  );
}

export function calculateIdleGraceRemaining(
  lastMotionTimeMs: number,
  nowMs: number,
  gracePeriodMs = IDLE_COOLING_CONFIG.gracePeriodMs
): number {
  if (!Number.isFinite(lastMotionTimeMs) || !Number.isFinite(nowMs) || !Number.isFinite(gracePeriodMs)) {
    return 0;
  }
  const elapsed = nowMs - lastMotionTimeMs;
  if (elapsed < 0) return gracePeriodMs;
  const remaining = gracePeriodMs - elapsed;
  return remaining > 0 ? remaining : 0;
}

export interface IdleCoolingParams {
  readonly isMobile: boolean;
  readonly isMotionActive: boolean;
  readonly isDocumentHidden?: boolean;
  readonly remainingGraceMs: number;
}

export function calculateIdleCoolingMode(params: IdleCoolingParams): IdleCoolingMode {
  if (params.isDocumentHidden) {
    return 'SUSPENDED_BACKGROUND';
  }
  if (!params.isMobile) {
    return 'ACTIVE_60FPS';
  }
  if (params.isMotionActive || params.remainingGraceMs > 0) {
    return 'ACTIVE_60FPS';
  }
  return 'IDLE_COOLING_30FPS';
}

export interface FramePacingParams {
  readonly mode: IdleCoolingMode;
  readonly isMobile: boolean;
  readonly deltaSec: number;
  readonly accumulatedDeltaSec: number;
  readonly targetIdleFps?: number;
  readonly jitterSlackSec?: number;
}

export interface FramePacingResult {
  readonly shouldRender: boolean;
  readonly nextAccumulatedDeltaSec: number;
}

export function shouldRenderFrame(params: FramePacingParams): FramePacingResult {
  const {
    mode,
    isMobile,
    deltaSec,
    accumulatedDeltaSec,
    targetIdleFps = IDLE_COOLING_CONFIG.idleTargetFps,
    jitterSlackSec = JITTER_SLACK_SEC,
  } = params;

  if (mode === 'SUSPENDED_BACKGROUND') {
    return { shouldRender: false, nextAccumulatedDeltaSec: 0 };
  }

  const safeDelta = Number.isFinite(deltaSec) ? Math.max(0, deltaSec) : 0;
  const safeAccum = Number.isFinite(accumulatedDeltaSec) ? Math.max(0, accumulatedDeltaSec) : 0;
  const currentAccum = safeAccum + safeDelta;

  if (mode === 'ACTIVE_60FPS') {
    if (isMobile) {
      const activeInterval = IDLE_COOLING_CONFIG.activeIntervalSec;
      if (currentAccum >= activeInterval - jitterSlackSec) {
        const remainder = currentAccum - activeInterval;
        return {
          shouldRender: true,
          nextAccumulatedDeltaSec: remainder > 0 && remainder < activeInterval ? remainder : 0,
        };
      }
      return {
        shouldRender: false,
        nextAccumulatedDeltaSec: currentAccum,
      };
    }
    return { shouldRender: true, nextAccumulatedDeltaSec: 0 };
  }

  // IDLE_COOLING_30FPS
  const safeTargetFps = targetIdleFps > 0 ? targetIdleFps : 30;
  const targetInterval = 1 / safeTargetFps;

  if (currentAccum >= targetInterval - jitterSlackSec) {
    const remainder = currentAccum - targetInterval;
    return {
      shouldRender: true,
      nextAccumulatedDeltaSec: remainder > 0 && remainder < targetInterval ? remainder : 0,
    };
  }

  return {
    shouldRender: false,
    nextAccumulatedDeltaSec: currentAccum,
  };
}
