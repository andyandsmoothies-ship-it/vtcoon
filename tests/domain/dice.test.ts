// [TC-01.3/MSS] Deterministic 2D6 PRNG — Acceptance Test Contracts
// Traceability: UC-GAME-005/MSS (Đổ Xúc Xắc 2D6 Bằng PRNG Máy Chủ)

import { describe, test, expect } from 'vitest';
import { mulberry32, rollDice } from '../../src/domain/dice';

describe('[UC-GAME-005/MSS] mulberry32 — Deterministic PRNG', () => {
  test('sinh số trong khoảng [0, 1)', () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const n = rng();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  test('cùng seed cho chuỗi số hoàn toàn giống nhau (deterministic)', () => {
    const rng1 = mulberry32(999);
    const rng2 = mulberry32(999);
    for (let i = 0; i < 10; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  test('seed khác nhau cho chuỗi số khác nhau', () => {
    const a = mulberry32(1)();
    const b = mulberry32(2)();
    expect(a).not.toBe(b);
  });
});

describe('[UC-GAME-005/MSS] rollDice — 2D6 Tung Xúc Xắc', () => {
  test('mỗi viên xúc xắc nằm trong [1..6]', () => {
    const rng = mulberry32(42);
    const result = rollDice(rng);
    expect(result.die1).toBeGreaterThanOrEqual(1);
    expect(result.die1).toBeLessThanOrEqual(6);
    expect(result.die2).toBeGreaterThanOrEqual(1);
    expect(result.die2).toBeLessThanOrEqual(6);
  });

  test('total = die1 + die2, nằm trong [2..12]', () => {
    const rng = mulberry32(42);
    const result = rollDice(rng);
    expect(result.total).toBe(result.die1 + result.die2);
    expect(result.total).toBeGreaterThanOrEqual(2);
    expect(result.total).toBeLessThanOrEqual(12);
  });

  test('cùng seed cho kết quả giống nhau hoàn toàn (deterministic)', () => {
    const a = rollDice(mulberry32(77));
    const b = rollDice(mulberry32(77));
    expect(a).toEqual(b);
  });

  test('phân phối hợp lý trên 360 lần tung — không bao giờ ngoài [2..12]', () => {
    const rng = mulberry32(12345);
    for (let i = 0; i < 360; i++) {
      const r = rollDice(rng);
      expect(r.die1).toBeGreaterThanOrEqual(1);
      expect(r.die1).toBeLessThanOrEqual(6);
      expect(r.die2).toBeGreaterThanOrEqual(1);
      expect(r.die2).toBeLessThanOrEqual(6);
      expect(r.total).toBe(r.die1 + r.die2);
    }
  });
});
