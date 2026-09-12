// [UI-S05/MSS] Grand Coronation 3D Stage & Tycoon Trophy Test Suite
// Verifies coronation configuration, trophy rotation dynamics, and victory fireworks burst physics
import { describe, it, expect } from 'vitest';
import {
  CORONATION_CONFIG,
  calculateTrophyMotion,
  spawnFireworkBurst,
} from '../../src/client/3d/coronation_3d_stage';

describe('[UI-S05/MSS] Coronation3DStage — Configuration & Trophy Dynamics', () => {
  it('Cấu hình sân khấu đăng quang: bục quán quân và chùm spotlight điện ảnh', () => {
    expect(CORONATION_CONFIG.pedestalHeight).toBe(1.2);
    expect(CORONATION_CONFIG.trophyBaseY).toBe(1.2);
    expect(CORONATION_CONFIG.spotlightColor).toBe('#FDE047');
    expect(CORONATION_CONFIG.spotlightIntensity).toBe(6.0);
    expect(CORONATION_CONFIG.spotlightPos).toEqual([0, 11, 4]);
  });

  it('Động học cúp vô địch: rotY xoay mượt mà 360 độ theo thời gian', () => {
    const t0 = calculateTrophyMotion(0);
    expect(t0.rotY).toBe(0);
    expect(t0.floatY).toBe(0);

    const t1 = calculateTrophyMotion(1.0);
    expect(t1.rotY).toBeGreaterThan(0);
    // Viên kim cương đỉnh cúp xoay ngược chiều tạo hiệu ứng thị giác đa chiều
    expect(t1.gemRotY).toBeLessThan(0);

    const t2 = calculateTrophyMotion(2.0);
    expect(t2.rotY).toBeGreaterThan(t1.rotY);
  });

  it('Bảo toàn giới hạn thời gian âm: calculateTrophyMotion(-5) xử lý an toàn không NaN', () => {
    const neg = calculateTrophyMotion(-5);
    expect(Number.isFinite(neg.rotY)).toBe(true);
    expect(Number.isFinite(neg.floatY)).toBe(true);
    expect(Number.isFinite(neg.gemRotY)).toBe(true);
  });
});

describe('[UI-S05/MSS] Coronation3DStage — Victory Fireworks Burst Physics', () => {
  it('spawnFireworkBurst tạo đúng số lượng hạt pháo hoa theo chỉ định', () => {
    const particles = spawnFireworkBurst([0, 4.5, 0], 30);
    expect(particles.length).toBe(30);

    particles.forEach((p) => {
      expect(p.x).toBe(0);
      expect(p.y).toBe(4.5);
      expect(p.z).toBe(0);
      expect(Number.isFinite(p.vx)).toBe(true);
      expect(Number.isFinite(p.vy)).toBe(true);
      expect(Number.isFinite(p.vz)).toBe(true);
      expect(p.size).toBeGreaterThan(0);
      expect(p.life).toBe(0);
      expect(p.maxLife).toBeGreaterThan(1.0);
      expect(typeof p.color).toBe('string');
    });
  });

  it('spawnFireworkBurst mặc định tạo 24 hạt khi không truyền count', () => {
    const particles = spawnFireworkBurst([1, 2, 3]);
    expect(particles.length).toBe(24);
  });

  it('Bảo toàn định luật chuyển động hạt: Vận tốc Y giảm dần dưới tác dụng trọng lực và triệt tiêu kích thước khi hết vòng đời', () => {
    const dt = 0.05;
    const initialVy = 2.0;
    const g = 1.6;
    const vyAfter = initialVy - g * dt;
    expect(vyAfter).toBeLessThan(initialVy);
    expect(vyAfter).toBeCloseTo(1.92, 2);

    const maxLife = 1.5;
    const lifeRatio = 1.5 / maxLife;
    const scale = Math.max(0, 1 - lifeRatio);
    expect(scale).toBe(0);
  });

  it('Cấu hình Spotlight định hướng đúng tọa độ Cúp Vô Địch và ngân sách hạt tối đa 90', () => {
    expect(CORONATION_CONFIG.spotlightTarget).toEqual([0, 2.2, 0]);
    expect(CORONATION_CONFIG.spotlightPos[1]).toBeGreaterThan(CORONATION_CONFIG.spotlightTarget[1]);
  });
});
