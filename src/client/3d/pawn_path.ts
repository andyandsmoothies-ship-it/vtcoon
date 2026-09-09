// [UI-S02/MSS] Pawn Path Math — Waypoints calculation & parabolic arc trajectory
// Pure TypeScript math, zero side-effects
import { cellPosition } from './board_coords';

export const BOARD_TOTAL_CELLS = 40 as const;
export const DEFAULT_JUMP_ARC = 0.8 as const;
export const BASE_PAWN_Y = 0.45 as const;

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
