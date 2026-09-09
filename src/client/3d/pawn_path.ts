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
