// [UI-S02/MSS][IMP-364] shadow_cache_helpers.ts — Pure helper logic for static shadow map caching
import type { DirectionalLight, Vector3 } from 'three';

export interface ShadowUpdateParams {
  readonly isRolling?: boolean;
  readonly isPawnMoving?: boolean;
  readonly isSunMoving?: boolean;
  readonly isBuildingDirty?: boolean;
}

export function shouldUpdateShadows(params: ShadowUpdateParams): boolean {
  return Boolean(
    params.isRolling ||
    params.isPawnMoving ||
    params.isSunMoving ||
    params.isBuildingDirty
  );
}

export function isSunPositionMoving(
  currentPos: Vector3 | { x: number; y: number; z: number },
  targetPos: Vector3 | [number, number, number],
  thresholdSq = 1e-4
): boolean {
  const tx = Array.isArray(targetPos) ? targetPos[0] : targetPos.x;
  const ty = Array.isArray(targetPos) ? targetPos[1] : targetPos.y;
  const tz = Array.isArray(targetPos) ? targetPos[2] : targetPos.z;
  const dx = currentPos.x - tx;
  const dy = currentPos.y - ty;
  const dz = currentPos.z - tz;
  return (dx * dx + dy * dy + dz * dz) > thresholdSq;
}

export function calculateShadowGraceRemaining(
  lastMotionTimeMs: number,
  nowMs: number,
  gracePeriodMs = 800
): number {
  if (!Number.isFinite(lastMotionTimeMs) || !Number.isFinite(nowMs) || !Number.isFinite(gracePeriodMs)) {
    return 0;
  }
  const elapsed = nowMs - lastMotionTimeMs;
  if (elapsed < 0) return gracePeriodMs;
  const remaining = gracePeriodMs - elapsed;
  return remaining > 0 ? remaining : 0;
}

export function applyShadowAutoUpdate(
  light: DirectionalLight | null,
  activeUpdate: boolean
): boolean {
  if (!light || !light.shadow) return false;
  if (light.shadow.autoUpdate !== activeUpdate) {
    light.shadow.autoUpdate = activeUpdate;
    if (activeUpdate) {
      light.shadow.needsUpdate = true;
    }
  }
  return light.shadow.autoUpdate;
}
