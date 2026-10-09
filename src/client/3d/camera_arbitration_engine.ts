// [IMP-341] Camera Arbitration Engine & Gesture Decoupling
// Station 2: Deep Module Implementation

export type CameraActiveDriver = 'user' | 'soft_return' | 'director' | 'idle';
export type CameraGestureAction = 'micro_touch' | 'skip_animation' | 'manual_inspection';

export interface GestureClassificationParams {
  readonly touchDurationMs: number;
  readonly distPos: number;
  readonly distTarget: number;
  readonly isPawnAnimating: boolean;
  readonly justBrokeSoftReturn: boolean;
}

export interface GestureClassificationResult {
  readonly action: CameraGestureAction;
  readonly shouldGrantGracePeriod: boolean;
  readonly shouldClearJustBroke: boolean;
}

export interface CameraArbitrationSession {
  gracePeriodEndTime: number;
  isGracePeriodActive(currentTimeMs: number): boolean;
  grantGracePeriod(currentTimeMs: number, durationMs?: number): void;
  cancelGracePeriod(): void;
  checkPreemption(
    activeModal: unknown,
    cameraFocusCell: number | null,
    isRolling: boolean,
    hasTurnChanged: boolean,
    isPawnMoving?: boolean
  ): boolean;
}

export const DEFAULT_GRACE_PERIOD_MS = 800;

/**
 * 3-zone 3D world space gesture classifier.
 * Categorizes user interaction into micro-touch, tap-to-skip, or manual inspection.
 */
export function classifyGestureIntent(params: GestureClassificationParams): GestureClassificationResult {
  const { touchDurationMs, distPos, distTarget, isPawnAnimating, justBrokeSoftReturn } = params;

  // Gotcha 17: Break soft return guard - prevent accidental tap-to-skip
  if (justBrokeSoftReturn) {
    const isSignificantPan = distPos > 0.8 || distTarget > 0.5;
    return {
      action: isSignificantPan ? 'manual_inspection' : 'micro_touch',
      shouldGrantGracePeriod: isSignificantPan,
      shouldClearJustBroke: true,
    };
  }

  // Tap-to-Skip: Quick tap during pawn hopping without significant camera displacement (< 220ms)
  if (isPawnAnimating && touchDurationMs < 220 && distPos < 0.4 && distTarget < 0.2) {
    return {
      action: 'skip_animation',
      shouldGrantGracePeriod: false,
      shouldClearJustBroke: false,
    };
  }

  // Micro-touch: Glance or tiny tremor (< 60ms, < 0.15m) without intent to pan or skip
  if (touchDurationMs < 60 && distPos < 0.15 && distTarget < 0.1) {
    return {
      action: 'micro_touch',
      shouldGrantGracePeriod: false,
      shouldClearJustBroke: false,
    };
  }

  // Manual Inspection: Deliberate pan beyond deadzone
  if (distPos >= 0.4 || distTarget >= 0.2) {
    return {
      action: 'manual_inspection',
      shouldGrantGracePeriod: true,
      shouldClearJustBroke: false,
    };
  }

  return {
    action: 'micro_touch',
    shouldGrantGracePeriod: false,
    shouldClearJustBroke: false,
  };
}

/**
 * Zero-alloc scalar driver resolver for the 60 FPS useFrame hot path.
 */
export function resolveActiveCameraDriver(
  isDragging: boolean,
  isGracePeriodActive: boolean,
  hasSoftReturn: boolean,
  isActionOngoing: boolean,
  isResetting: boolean
): CameraActiveDriver {
  if (isDragging || isGracePeriodActive) return 'user';
  if (hasSoftReturn) return 'soft_return';
  if (isActionOngoing || isResetting) return 'director';
  return 'idle';
}

/**
 * Creates an arbitration session instance managing inspection grace periods and preemptions.
 */
export function createCameraArbitrationSession(): CameraArbitrationSession {
  let gracePeriodEndTime = 0;

  return {
    get gracePeriodEndTime() {
      return gracePeriodEndTime;
    },
    set gracePeriodEndTime(value: number) {
      gracePeriodEndTime = value;
    },
    isGracePeriodActive(currentTimeMs: number): boolean {
      return currentTimeMs < gracePeriodEndTime;
    },
    grantGracePeriod(currentTimeMs: number, durationMs = DEFAULT_GRACE_PERIOD_MS): void {
      gracePeriodEndTime = currentTimeMs + durationMs;
    },
    cancelGracePeriod(): void {
      gracePeriodEndTime = 0;
    },
    checkPreemption(
      activeModal: unknown,
      cameraFocusCell: number | null,
      isRolling: boolean,
      hasTurnChanged: boolean,
      isPawnMoving?: boolean
    ): boolean {
      if (activeModal !== null || cameraFocusCell !== null || isRolling || hasTurnChanged || Boolean(isPawnMoving)) {
        gracePeriodEndTime = 0;
        return true;
      }
      return false;
    },
  };
}
