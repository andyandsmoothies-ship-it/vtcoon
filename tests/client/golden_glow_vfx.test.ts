// [UI-S05/MSS][TC-VFX01/MSS] Golden Glow & Micro-VFX Mathematical Functions Test Suite
import { describe, it, expect } from 'vitest';
import {
  calculateGoldenGlowScale,
  calculateGoldenGlowOpacity,
  calculateSparkPosition,
} from '../../src/client/3d/golden_glow_vfx';

describe('[TC-VFX01.1/MSS] calculateGoldenGlowScale — Harmonic Pulsing Scale', () => {
  it('Tra ve baseScale khi t = 0', () => {
    const scale = calculateGoldenGlowScale(0, { baseScale: 1.0, freq: 3.0, amplitude: 0.08 });
    expect(scale).toBeCloseTo(1.0, 5);
  });

  it('Dao dong trong gioi han [baseScale - amplitude, baseScale + amplitude]', () => {
    const base = 1.2;
    const amp = 0.15;
    for (let t = 0; t <= 10; t += 0.25) {
      const s = calculateGoldenGlowScale(t, { baseScale: base, amplitude: amp, freq: 2.0 });
      expect(s).toBeGreaterThanOrEqual(base - amp - 1e-6);
      expect(s).toBeLessThanOrEqual(base + amp + 1e-6);
    }
  });

  it('[Adversarial] An toan tuyet doi khi time la NaN, Infinity hoac khong hop le', () => {
    expect(calculateGoldenGlowScale(Number.NaN, { baseScale: 1.0 })).toBe(1.0);
    expect(calculateGoldenGlowScale(Number.POSITIVE_INFINITY, { baseScale: 1.0 })).toBe(1.0);
    expect(calculateGoldenGlowScale(Number.NEGATIVE_INFINITY, { baseScale: 1.0 })).toBe(1.0);
  });
});

describe('[TC-VFX01.2/MSS] calculateGoldenGlowOpacity — Opacity Clamp & Pulse', () => {
  it('Tra ve baseOpacity khi t = 0', () => {
    const op = calculateGoldenGlowOpacity(0, 0.6, 0.2);
    expect(op).toBeCloseTo(0.6, 5);
  });

  it('Luon duoc kep chat trong khoang an toan [0.1, 1.0]', () => {
    for (let t = 0; t <= 6; t += 0.1) {
      const op = calculateGoldenGlowOpacity(t, 0.8, 0.5);
      expect(op).toBeGreaterThanOrEqual(0.1);
      expect(op).toBeLessThanOrEqual(1.0);
    }
  });

  it('[Adversarial] Khang loi gia tri NaN va Infinity', () => {
    expect(calculateGoldenGlowOpacity(Number.NaN, 0.7)).toBe(0.7);
    expect(calculateGoldenGlowOpacity(Number.POSITIVE_INFINITY, 0.7)).toBe(0.7);
  });
});

describe('[TC-VFX01.3/MSS] calculateSparkPosition — Circular Orbit & Bouncing Height', () => {
  it('Bao toan ban kinh quy dao hinh tron (x^2 + z^2 == radius^2)', () => {
    const radius = 0.35;
    for (let i = 0; i < 5; i++) {
      const [x, , z] = calculateSparkPosition(1.5, i, 5, { radius });
      const distance = Math.sqrt(x * x + z * z);
      expect(distance).toBeCloseTo(radius, 4);
    }
  });

  it('Moi hat trong bo 5 hat co goc pha cach deu tren duong tron tai cung mot thoi diem', () => {
    const totalSparks = 5;
    const t = 2.0;
    const angles: number[] = [];
    for (let i = 0; i < totalSparks; i++) {
      const [x, , z] = calculateSparkPosition(t, i, totalSparks);
      let angle = Math.atan2(z, x);
      if (angle < 0) angle += 2 * Math.PI;
      angles.push(angle);
    }

    // Kiem tra cac hat khong bi trung toa do
    for (let i = 0; i < totalSparks; i++) {
      for (let j = i + 1; j < totalSparks; j++) {
        expect(angles[i]).not.toBeCloseTo(angles[j]!, 3);
      }
    }
  });

  it('Do cao Y luon >= baseHeight (hat nay len khong bao gio tut xuong duoi san)', () => {
    const baseHeight = 0.2;
    const hopHeight = 0.15;
    for (let t = 0; t <= 5; t += 0.1) {
      const [, y] = calculateSparkPosition(t, 0, 5, { baseHeight, hopHeight });
      expect(y).toBeGreaterThanOrEqual(baseHeight);
      expect(y).toBeLessThanOrEqual(baseHeight + hopHeight + 1e-6);
    }
  });

  it('[Adversarial] An toan khi time la NaN', () => {
    const pos = calculateSparkPosition(Number.NaN, 0, 5, { radius: 0.25, baseHeight: 0.1 });
    expect(pos).toHaveLength(3);
    expect(Number.isFinite(pos[0])).toBe(true);
    expect(pos[1]).toBe(0.1);
    expect(Number.isFinite(pos[2])).toBe(true);
  });
});
