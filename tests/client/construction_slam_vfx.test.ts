// [UI-S04/MSS][UI-S05/MSS][TC-VFX02/MSS] Construction Slam, Shockwave & Confetti Celebration Test Suite
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  calculateImpactDrop,
  calculateShockwave,
  calculateConfettiParticle,
  getBuildingWorldPosition,
  ConstructionSlamVFX,
  SingleSlamVFX,
  CONFETTI_COLORS,
} from '../../src/client/3d/construction_slam_vfx';
import { useVfxStore } from '../../src/client/store/vfx_store';

describe('[TC-VFX02.0/MSS] getBuildingWorldPosition — 4-Side Board Footprint Alignment', () => {
  it('tinh dung toa do cong trinh cho Canh 0 (phai sang trai, lech -Z)', () => {
    const pos = getBuildingWorldPosition(5);
    expect(pos[0]).toBeCloseTo(0);
    expect(pos[1]).toBe(0.12);
    expect(pos[2]).toBeCloseTo(9 - 0.42);
  });

  it('tinh dung toa do cong trinh cho Canh 1 (duoi len tren, lech +X)', () => {
    const pos = getBuildingWorldPosition(15);
    expect(pos[0]).toBeCloseTo(-9 + 0.42);
    expect(pos[1]).toBe(0.12);
    expect(pos[2]).toBeCloseTo(0);
  });

  it('tinh dung toa do cong trinh cho Canh 2 (trai sang phai, lech +Z)', () => {
    const pos = getBuildingWorldPosition(25);
    expect(pos[0]).toBeCloseTo(0);
    expect(pos[1]).toBe(0.12);
    expect(pos[2]).toBeCloseTo(-9 + 0.42);
  });

  it('tinh dung toa do cong trinh cho Canh 3 (tren xuong duoi, lech -X)', () => {
    const pos = getBuildingWorldPosition(35);
    expect(pos[0]).toBeCloseTo(9 - 0.42);
    expect(pos[1]).toBe(0.12);
    expect(pos[2]).toBeCloseTo(0);
  });
});

describe('[TC-VFX02.1/MSS] calculateImpactDrop — Gravity Drop, Impact Squash & Elastic Rebound', () => {
  it('Tra ve do cao ban dau khi elapsedMs < 0', () => {
    const res = calculateImpactDrop(-50, 380, 3.6);
    expect(res.yOffset).toBe(3.6);
    expect(res.hasHitGround).toBe(false);
    expect(res.scaleY).toBe(1.0);
    expect(res.scaleXZ).toBe(1.0);
  });

  it('Gia toc roi tu do theo ham bac hai (y = H * (1 - (t/T)^2)) trong thoi gian roi', () => {
    const H = 4.0;
    const T = 400;
    // Tai nua thoi gian roi (t = 200ms), do cao con lai la 75%
    const mid = calculateImpactDrop(200, T, H);
    expect(mid.yOffset).toBeCloseTo(H * 0.75, 2);
    expect(mid.hasHitGround).toBe(false);

    // Tai diem tiep dat (t = 400ms), do cao bang 0
    const hit = calculateImpactDrop(400, T, H);
    expect(hit.yOffset).toBe(0);
    expect(hit.hasHitGround).toBe(true);
  });

  it('Pha va dap nen (Impact Squash) lam giam chieu cao Y va phinh chieu ngang XZ', () => {
    // Trong khoang [380, 460]ms
    const squash = calculateImpactDrop(410, 380, 3.6);
    expect(squash.yOffset).toBe(0);
    expect(squash.scaleY).toBeLessThan(1.0);
    expect(squash.scaleXZ).toBeGreaterThan(1.0);
    expect(squash.hasHitGround).toBe(true);
  });

  it('Chuyen tiep lien tuc khong gay giat popping tai thoi diem tiep dat (t = dropDurationMs)', () => {
    const atHit = calculateImpactDrop(380, 380, 3.6);
    expect(atHit.yOffset).toBe(0);
    expect(atHit.hasHitGround).toBe(true);
    expect(atHit.scaleY).toBeCloseTo(1.0, 2);
    expect(atHit.scaleXZ).toBeCloseTo(1.0, 2);
  });

  it('Pha dan hoi nhay nhe (Elastic Rebound) co scaleY > 1.0 truoc khi on dinh', () => {
    // Trong khoang [460, 580]ms
    const rebound = calculateImpactDrop(500, 380, 3.6);
    expect(rebound.yOffset).toBe(0);
    expect(rebound.scaleY).toBeGreaterThan(1.0);
    expect(rebound.scaleXZ).toBeLessThan(1.0);
  });

  it('On dinh hoan toan ve scale [1, 1, 1] va do cao y = 0 sau khi chu ky ket thuc', () => {
    const settled = calculateImpactDrop(800, 380, 3.6);
    expect(settled.yOffset).toBe(0);
    expect(settled.scaleY).toBe(1.0);
    expect(settled.scaleXZ).toBe(1.0);
    expect(settled.hasHitGround).toBe(true);
  });

  it('[Adversarial] An toan tuyet doi khi elapsedMs la NaN', () => {
    const safe = calculateImpactDrop(Number.NaN);
    expect(safe.yOffset).toBe(0);
    expect(safe.scaleY).toBe(1.0);
    expect(safe.scaleXZ).toBe(1.0);
  });
});

describe('[TC-VFX02.2/MSS] calculateShockwave — Shockwave Ring Expansion', () => {
  it('Tra ve radius = 0 va opacity = 0 truoc thoi diem tiep dat', () => {
    const pre = calculateShockwave(200, 380, 650);
    expect(pre.radius).toBe(0);
    expect(pre.opacity).toBe(0);
    expect(pre.thickness).toBe(0);
  });

  it('Song xung kich bung toa mo rong ban kinh theo duong cong Ease-Out sau tiep dat', () => {
    const early = calculateShockwave(480, 380, 650, 2.5);
    const later = calculateShockwave(680, 380, 650, 2.5);

    expect(early.radius).toBeGreaterThan(0.2);
    expect(later.radius).toBeGreaterThan(early.radius);
    expect(later.opacity).toBeLessThan(early.opacity);
  });

  it('Do mo (opacity) giam dan ve 0 khi song xung kich bien mat', () => {
    const end = calculateShockwave(380 + 650, 380, 650, 2.5);
    expect(end.opacity).toBe(0);
  });
});

describe('[TC-VFX02.3/MSS] calculateConfettiParticle — Celebration Particles Dispersal', () => {
  it('Tra ve scale = 0 va opacity = 0 truoc khi cong trinh tiep dat', () => {
    const pre = calculateConfettiParticle(100, 0, 24, 380, 1100);
    expect(pre.scale).toBe(0);
    expect(pre.opacity).toBe(0);
  });

  it('Cac hat bay bung toa theo quy dao parabol co luc nang ban dau va trong luc roi', () => {
    const particle = calculateConfettiParticle(380 + 250, 3, 24, 380, 1100);
    expect(particle.position[1]).toBeGreaterThan(0); // Y > 0
    expect(particle.scale).toBeGreaterThan(0);
    expect(particle.opacity).toBeGreaterThan(0);
  });

  it('Tap hop bang mau confetti khanh thanh phu hop chu de Hoang Kim', () => {
    expect(CONFETTI_COLORS).toContain('#FDE047');
    expect(CONFETTI_COLORS).toContain('#F59E0B');
    expect(CONFETTI_COLORS).toContain('#EF4444');
  });
});

describe('[TC-VFX02.4/MSS] VFXStore — Slam Triggers & Screen Shake Coordination', () => {
  beforeEach(() => {
    useVfxStore.getState().clearAllSlams();
    useVfxStore.getState().clearScreenShake();
  });

  it('triggerConstructionSlam tao dung ban ghi ActiveSlam cho o dat chi dinh', () => {
    useVfxStore.getState().triggerConstructionSlam(21, 3);
    const slams = useVfxStore.getState().activeSlams;
    expect(slams[21]).toBeDefined();
    expect(slams[21]?.cellIndex).toBe(21);
    expect(slams[21]?.level).toBe(3);
  });

  it('removeSlam loai bo chinh xac slam cua o dat', () => {
    useVfxStore.getState().triggerConstructionSlam(5, 2);
    expect(useVfxStore.getState().activeSlams[5]).toBeDefined();

    useVfxStore.getState().removeSlam(5);
    expect(useVfxStore.getState().activeSlams[5]).toBeUndefined();
  });

  it('triggerScreenShake thiet lap dung cuong do va thoi luong rung', () => {
    useVfxStore.getState().triggerScreenShake(0.35, 380);
    const shake = useVfxStore.getState().activeScreenShake;
    expect(shake).not.toBeNull();
    expect(shake?.intensity).toBe(0.35);
    expect(shake?.durationMs).toBe(380);

    useVfxStore.getState().clearScreenShake();
    expect(useVfxStore.getState().activeScreenShake).toBeNull();
  });

  it('SingleSlamVFX va ConstructionSlamVFX render an toan ngoai Canvas khong gay quang loi', () => {
    useVfxStore.getState().triggerConstructionSlam(10, 3);
    const slam = useVfxStore.getState().activeSlams[10];
    expect(slam).toBeDefined();
    expect(() => {
      const htmlSingle = renderToStaticMarkup(React.createElement(SingleSlamVFX, { slam: slam! }));
      expect(htmlSingle).toContain('ringGeometry');
      expect(htmlSingle).toContain('octahedronGeometry');

      const htmlGlobal = renderToStaticMarkup(React.createElement(ConstructionSlamVFX));
      expect(htmlGlobal).toBeDefined();
    }).not.toThrow();
  });
});
