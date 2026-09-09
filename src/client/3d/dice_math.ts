// [UI-S02/MSS] Dice Math — Euler rotation mapping & face validation
// Pure TypeScript math, zero side-effects
export type DiceFace = 1 | 2 | 3 | 4 | 5 | 6;

export const DICE_FACES: readonly DiceFace[] = [1, 2, 3, 4, 5, 6] as const;

export function isValidDiceFace(val: number): val is DiceFace {
  return Number.isInteger(val) && val >= 1 && val <= 6;
}

export function clampDiceFace(val: number): DiceFace {
  const rounded = Math.round(val);
  if (rounded <= 1) return 1;
  if (rounded >= 6) return 6;
  return rounded as DiceFace;
}

const ROTATION_MAP: Record<DiceFace, [number, number, number]> = {
  1: [0, 0, 0],
  6: [Math.PI, 0, 0],
  2: [-Math.PI / 2, 0, 0],
  5: [Math.PI / 2, 0, 0],
  3: [0, 0, Math.PI / 2],
  4: [0, 0, -Math.PI / 2],
};

export function getDiceFaceRotation(face: number): [number, number, number] {
  if (!isValidDiceFace(face)) {
    throw new Error(`Invalid dice face: ${face}. Must be an integer between 1 and 6.`);
  }
  return [...ROTATION_MAP[face]];
}
