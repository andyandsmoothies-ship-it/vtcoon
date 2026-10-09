// [IMP-294] Camera Kinematic Helpers — Pure 3D Spatial & Orientation Math
export function resolveSideAwareCameraOffset(
  tileCoords: readonly [number, number, number],
  baseOffset: readonly [number, number, number] = [5.2, 6.4, 5.2]
): [number, number, number] {
  const tx = Number.isFinite(tileCoords[0]) ? tileCoords[0] : 0;
  const tz = Number.isFinite(tileCoords[2]) ? tileCoords[2] : 0;
  const height = Number.isFinite(baseOffset[1]) ? baseOffset[1] : 6.4;
  const absX = Math.abs(tx);
  const absZ = Math.abs(tz);
  if (absZ >= absX) {
    if (tz < 0) return [-1.8, height, -6.8];
    return [Number.isFinite(baseOffset[0]) ? baseOffset[0] : 5.2, height, Number.isFinite(baseOffset[2]) ? baseOffset[2] : 5.2];
  } else {
    if (tx < 0) return [-6.8, height, 1.8];
    return [6.8, height, -1.8];
  }
}

export function calculateTileFocusCameraPosition(
  tileCoords: readonly [number, number, number],
  offset?: readonly [number, number, number]
): [number, number, number] {
  const tx = Number.isFinite(tileCoords[0]) ? tileCoords[0] : 0;
  const ty = Number.isFinite(tileCoords[1]) ? tileCoords[1] : 0;
  const tz = Number.isFinite(tileCoords[2]) ? tileCoords[2] : 0;
  const finalOffset = offset ?? resolveSideAwareCameraOffset(tileCoords);
  return [tx + finalOffset[0], ty + finalOffset[1], tz + finalOffset[2]];
}

export function calculateScreenShake(
  elapsedSeconds: number,
  durationSeconds: number = 0.35,
  amplitude: number = 0.25,
  frequency: number = 42
): [number, number, number] {
  if (!Number.isFinite(elapsedSeconds) || !Number.isFinite(durationSeconds) || !Number.isFinite(amplitude) || !Number.isFinite(frequency) || elapsedSeconds < 0 || elapsedSeconds >= durationSeconds) {
    return [0, 0, 0];
  }
  const progress = elapsedSeconds / durationSeconds;
  const decay = (1 - progress) * (1 - progress);
  const sx = Math.sin(elapsedSeconds * frequency) * amplitude * decay;
  const sy = Math.cos(elapsedSeconds * (frequency * 1.25)) * (amplitude * 0.7) * decay;
  const sz = Math.sin(elapsedSeconds * (frequency * 0.85) + 1.2) * (amplitude * 0.9) * decay;
  return [sx, sy, sz];
}

export function dampValue(current: number, target: number, speed: number, dt: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target)) return Number.isFinite(target) ? target : 0;
  const safeDt = Math.max(0, Math.min(dt, 0.1));
  const factor = 1 - Math.exp(-safeDt * speed);
  return current + (target - current) * factor;
}

export function calculateResponsiveCameraDistance(aspect: number, baseDistance = 32): number {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1.77;
  const safeBase = Number.isFinite(baseDistance) && baseDistance > 0 ? baseDistance : 32;
  if (safeAspect < 1.77) return safeBase * Math.max(1.0, 1.77 / Math.max(safeAspect, 0.75));
  return safeBase;
}
