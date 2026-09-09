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

export const DICE_REST_Y = 0.26 as const;
export const DICE_PEAK_Y = 3.8 as const;
export const DICE_BOUNCE_1_Y = 0.8 as const;
export const DICE_BOUNCE_2_Y = 0.45 as const;

/**
 * Tính toán độ cao posY của xúc xắc theo chu trình tung nảy 3 giai đoạn:
 * - Giai đoạn 1 (0 -> 0.55 / ~0.8s): Phóng vút lên cao (posY: 3.8).
 * - Giai đoạn 2 (0.55 -> 0.85): Chạm sàn khay nỉ & nảy đàn hồi 2 nhịp (nhịp 1 lên 0.8, nhịp 2 lên 0.45).
 * - Giai đoạn 3 (0.85 -> 1.00): Khóa kết quả tĩnh tại mặt sàn nỉ (posY: 0.26).
 */
export function calculateDiceElevation(progress: number): number {
  if (!Number.isFinite(progress)) return DICE_REST_Y;
  const t = Math.max(0, Math.min(1, progress));

  if (t <= 0.55) {
    const u = t / 0.55;
    return DICE_REST_Y + (DICE_PEAK_Y - DICE_REST_Y) * 4 * u * (1 - u);
  }

  if (t <= 0.72) {
    const u = (t - 0.55) / 0.17;
    return DICE_REST_Y + (DICE_BOUNCE_1_Y - DICE_REST_Y) * 4 * u * (1 - u);
  }

  if (t < 0.85) {
    const u = (t - 0.72) / 0.13;
    return DICE_REST_Y + (DICE_BOUNCE_2_Y - DICE_REST_Y) * 4 * u * (1 - u);
  }

  return DICE_REST_Y;
}

/**
 * Tính hệ số suy giảm góc quay (1.0 -> 0.0) theo 3 giai đoạn:
 * - Giai đoạn 1 (0 -> 0.55): Quay tốc độ cao (tiêu tán 75% góc quay).
 * - Giai đoạn 2 (0.55 -> 0.85): Va đập nảy tiêu tán triệt để 25% còn lại.
 * - Giai đoạn 3 (0.85 -> 1.00): Triệt tiêu về 0, khóa chuẩn góc targetRot.
 */
export function calculateDiceRotationFactor(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  const t = Math.max(0, Math.min(1, progress));

  if (t <= 0.55) {
    const u = t / 0.55;
    return 1.0 - 0.75 * (u * u);
  }

  if (t < 0.85) {
    const u = Math.min(1, Math.max(0, (t - 0.55) / 0.30));
    return 0.25 * (1 - u) * (1 - u);
  }

  return 0;
}

/**
 * Sinh góc xoay ngẫu nhiên 3-4 vòng quanh cả 3 trục X, Y, Z
 */
export function generateRandomDiceSpin(): [number, number, number] {
  const getSpin = () => {
    const revs = 3 + Math.random();
    const sign = Math.random() < 0.5 ? 1 : -1;
    return sign * revs * 2 * Math.PI;
  };
  return [getSpin(), getSpin(), getSpin()];
}
