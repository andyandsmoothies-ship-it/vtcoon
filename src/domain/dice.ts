// [UC-GAME-005/MSS] Deterministic 2D6 PRNG — Dice Service

export interface DiceResult {
  readonly die1:  number;
  readonly die2:  number;
  readonly total: number;
}

/**
 * Mulberry32 — PRNG xác định theo seed.
 * Trả hàm sinh số trong khoảng [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

function dieRoll(rng: () => number): number {
  return Math.floor(rng() * 6) + 1;
}

/**
 * Tung 2 xúc xắc 6 mặt bằng RNG đã cho.
 * Mỗi viên ∈ [1..6], total ∈ [2..12].
 */
export function rollDice(rng: () => number): DiceResult {
  const die1 = dieRoll(rng);
  const die2 = dieRoll(rng);
  return { die1, die2, total: die1 + die2 };
}
