// [UI-S02/MSS] Pawn Path Math — Waypoints calculation & parabolic arc trajectory
// Pure TypeScript math, zero side-effects
import { cellPosition } from './board_coords';

export const BOARD_TOTAL_CELLS = 40 as const;
export const DEFAULT_JUMP_ARC = 0.8 as const;
export const BASE_PAWN_Y = 0.45 as const;
export const HOP_DURATION = 0.22 as const;
export const LANDING_DURATION = 0.12 as const;

export function calculatePathWaypoints(fromIndex: number, toIndex: number): number[] {
  if (
    !Number.isInteger(fromIndex) ||
    !Number.isInteger(toIndex) ||
    fromIndex < 0 ||
    fromIndex >= BOARD_TOTAL_CELLS ||
    toIndex < 0 ||
    toIndex >= BOARD_TOTAL_CELLS
  ) {
    throw new Error(
      `Invalid cell index: from=${fromIndex}, to=${toIndex}. Must be integers between 0 and 39.`
    );
  }

  if (fromIndex === toIndex) {
    return [];
  }

  let steps = (toIndex - fromIndex) % BOARD_TOTAL_CELLS;
  if (steps <= 0) {
    steps += BOARD_TOTAL_CELLS;
  }

  const waypoints: number[] = [];
  for (let i = 1; i <= steps; i++) {
    waypoints.push((fromIndex + i) % BOARD_TOTAL_CELLS);
  }
  return waypoints;
}

export function getParabolicHeight(progress: number, maxArc: number = DEFAULT_JUMP_ARC): number {
  const t = Math.max(0, Math.min(1, progress));
  return 4 * maxArc * t * (1 - t);
}

export function interpolatePawnPosition(
  fromIndex: number,
  toIndex: number,
  progress: number,
  arcHeight: number = DEFAULT_JUMP_ARC,
  baseY: number = BASE_PAWN_Y
): [number, number, number] {
  const p0 = cellPosition(fromIndex);
  const p1 = cellPosition(toIndex);
  const t = Math.max(0, Math.min(1, progress));

  const x = p0[0] + (p1[0] - p0[0]) * t;
  const y = baseY + (p1[1] - p0[1]) * t + getParabolicHeight(t, arcHeight);
  const z = p0[2] + (p1[2] - p0[2]) * t;

  return [x, y, z];
}

/**
 * Tính toán tỷ lệ co dãn [scaleX, scaleY, scaleZ] theo nguyên lý Squash & Stretch:
 * - [0% -> 15%]: Co nén lấy đà (Squash) --> scaleY: 0.85, scaleXZ: 1.08.
 * - [15% -> 70%]: Kéo dài thân trên không trung theo hướng bay (Stretch) --> scaleY: 1.25, scaleXZ: 0.90.
 * - [70% -> 90%]: Rơi xuống gia tốc.
 * - [90% -> 100%]: Tiếp đất nhún giảm chấn (Squash) --> scaleY: 0.80, scaleXZ: 1.15.
 * - Sau khi tiếp đất 0.1s (isRecovered=true): Hồi phục hình dạng tự nhiên [1, 1, 1].
 */
export function getPawnSquashStretch(
  progress: number,
  isRecovered = false
): [number, number, number] {
  if (isRecovered || !Number.isFinite(progress)) {
    return [1, 1, 1];
  }

  const t = Math.max(0, Math.min(1, progress));
  let scaleY = 1.0;
  let scaleXZ = 1.0;

  if (t <= 0.15) {
    const p = t / 0.15;
    scaleY = 1.0 - 0.15 * p;
    scaleXZ = 1.0 + 0.08 * p;
  } else if (t <= 0.70) {
    const p = (t - 0.15) / 0.55;
    scaleY = 0.85 + 0.40 * p;
    scaleXZ = 1.08 - 0.18 * p;
  } else if (t <= 0.90) {
    const p = (t - 0.70) / 0.20;
    scaleY = 1.25 - 0.25 * p;
    scaleXZ = 0.90 + 0.10 * p;
  } else {
    const p = (t - 0.90) / 0.10;
    scaleY = 1.00 - 0.20 * p;
    scaleXZ = 1.00 + 0.15 * p;
  }

  return [scaleXZ, scaleY, scaleXZ];
}

/**
 * Biến thiên cao độ ngẫu nhiên nhẹ (pitch từ 0.95 đến 1.10) cho âm thanh bước nhảy
 */
export function getStepPitchVariation(randomVal: number = Math.random()): number {
  const r = Math.max(0, Math.min(1, Number.isFinite(randomVal) ? randomVal : 0));
  return 0.95 + r * 0.15;
}

/**
 * Tính toán tỷ lệ co dãn [scaleX, scaleY, scaleZ] theo nguyên lý Squash & Stretch động lực học:
 * - Pha lấy đà (Anticipation): Co nén thân quân cờ xuống [1.15, 0.82, 1.15] trong 10% đầu bước nhảy.
 * - Pha bay cao (In-air Stretch): Thân quân cờ dãn dài theo trục đứng [0.88, 1.18, 0.88] khi đạt đỉnh vòng cung parabol.
 * - Pha rơi tiếp đất: Nén dần về [1.15, 0.82, 1.15] khi chạm sàn.
 */
export function calculateKineticPawnScale(
  jumpProgress: number,
  landingProgress: number = 0
): [number, number, number] {
  if (!Number.isFinite(jumpProgress)) {
    return [1, 1, 1];
  }

  if (landingProgress > 0) {
    return calculatePawnLandingImpact(landingProgress);
  }

  const t = Math.max(0, Math.min(1, jumpProgress));

  // Pha 1: Lấy đà (0 -> 10%): [1, 1, 1] -> [1.15, 0.82, 1.15]
  if (t <= 0.10) {
    const p = t / 0.10;
    const sy = 1.0 - 0.18 * p;
    const sxz = 1.0 + 0.15 * p;
    return [sxz, sy, sxz];
  }

  // Pha 2: Bay cao lên đỉnh parabol (10% -> 50%): [1.15, 0.82, 1.15] -> [0.88, 1.18, 0.88]
  if (t <= 0.50) {
    const p = (t - 0.10) / 0.40;
    const sy = 0.82 + 0.36 * p;
    const sxz = 1.15 - 0.27 * p;
    return [sxz, sy, sxz];
  }

  // Pha 3: Rơi xuống chạm sàn (50% -> 100%): [0.88, 1.18, 0.88] -> [1.15, 0.82, 1.15]
  const p = (t - 0.50) / 0.50;
  const sy = 1.18 - 0.36 * p;
  const sxz = 0.88 + 0.27 * p;
  return [sxz, sy, sxz];
}

export const calculateKineticSquashStretch = calculateKineticPawnScale;

/**
 * Pha tiếp đất (Landing Impact): Nhún đàn hồi 2 nhịp giảm chấn trước khi phục hồi về tỉ lệ gốc [1, 1, 1].
 * Sử dụng dao động điều hòa suy giảm 2 chu kỳ: delta = -0.18 * (1 - u)^2 * cos(4 * PI * u)
 */
export function calculatePawnLandingImpact(landingProgress: number): [number, number, number] {
  if (!Number.isFinite(landingProgress) || landingProgress >= 1.0) {
    return [1, 1, 1];
  }
  if (landingProgress <= 0) {
    return [1.15, 0.82, 1.15];
  }

  const u = Math.max(0, Math.min(1, landingProgress));
  const envelope = (1 - u) * (1 - u);
  const oscillation = Math.cos(4 * Math.PI * u);
  const deltaY = -0.18 * envelope * oscillation;
  const deltaXZ = 0.15 * envelope * oscillation;

  return [1.0 + deltaXZ, 1.0 + deltaY, 1.0 + deltaXZ];
}
