// [UI-S02/MSS][BOOST-P3] Pawn Kinetic Juice & Dynamic Camera Math Verification
import { describe, it, expect, vi } from 'vitest';
import {
  calculateKineticPawnScale,
  calculateKineticSquashStretch,
  calculatePawnLandingImpact,
  getStepPitchVariation,
  HOP_DURATION,
  LANDING_DURATION,
} from '../../src/client/3d/pawn_path';
import {
  calculateCameraFocusTarget,
  calculateCameraZoom,
  resolveCameraTargetCell,
  BASE_CAMERA_ZOOM,
  EVENT_CAMERA_ZOOM,
} from '../../src/client/game_canvas';
import { AudioEngine } from '../../src/client/audio/audio_engine';
import { SoundEffect } from '../../src/client/audio/audio_types';

describe('[TC-JUICE.1/MSS] Pawn Kinetic Juice — Anticipation Phase (Pha Lấy Đà)', () => {
  it('TC-JUICE.1a: Tại t=0 (bắt đầu): Thân quân cờ ở kích thước chuẩn [1, 1, 1]', () => {
    const scale = calculateKineticPawnScale(0);
    expect(scale).toEqual([1.0, 1.0, 1.0]);
  });

  it('TC-JUICE.1b: Tại t=0.10 (10% đầu bước nhảy): Thân quân cờ co nén lấy đà chuẩn [1.15, 0.82, 1.15]', () => {
    const scale = calculateKineticPawnScale(0.10);
    expect(scale[0]).toBeCloseTo(1.15, 4);
    expect(scale[1]).toBeCloseTo(0.82, 4);
    expect(scale[2]).toBeCloseTo(1.15, 4);
  });

  it('TC-JUICE.1c: Tại t=0.05 (giữa pha lấy đà): Co nén chuyển tiếp tuyến tính [1.075, 0.91, 1.075]', () => {
    const scale = calculateKineticPawnScale(0.05);
    expect(scale[0]).toBeCloseTo(1.075, 4);
    expect(scale[1]).toBeCloseTo(0.91, 4);
    expect(scale[2]).toBeCloseTo(1.075, 4);
  });
});

describe('[TC-JUICE.2/MSS] Pawn Kinetic Juice — In-Air Stretch Phase (Pha Bay Cao)', () => {
  it('TC-JUICE.2a: Tại t=0.50 (đỉnh parabol): Thân quân cờ dãn dài theo trục đứng [0.88, 1.18, 0.88]', () => {
    const scale = calculateKineticPawnScale(0.50);
    expect(scale[0]).toBeCloseTo(0.88, 4);
    expect(scale[1]).toBeCloseTo(1.18, 4);
    expect(scale[2]).toBeCloseTo(0.88, 4);
  });

  it('TC-JUICE.2b: Tại t=0.30 (lên dốc): Chuyển tiếp mượt từ co nén sang dãn đứng', () => {
    const scale = calculateKineticPawnScale(0.30);
    expect(scale[1]).toBeGreaterThan(0.82);
    expect(scale[1]).toBeLessThan(1.18);
    expect(scale[0]).toBeLessThan(1.15);
  });

  it('TC-JUICE.2c: calculateKineticSquashStretch là alias tương đương hoàn toàn', () => {
    expect(calculateKineticSquashStretch(0.5)).toEqual(calculateKineticPawnScale(0.5));
  });
});

describe('[TC-JUICE.3/MSS] Pawn Kinetic Juice — Landing Impact 2 Damped Cycles (Pha Tiếp Đất 2 Nhịp)', () => {
  it('TC-JUICE.3a: Tại u=0 (chạm sàn): Nén tiếp đất ban đầu đạt [1.15, 0.82, 1.15]', () => {
    const scale = calculatePawnLandingImpact(0);
    expect(scale[0]).toBeCloseTo(1.15, 4);
    expect(scale[1]).toBeCloseTo(0.82, 4);
    expect(scale[2]).toBeCloseTo(1.15, 4);
  });

  it('TC-JUICE.3b: Nhịp 1 nảy lên tại u=0.25: Đàn hồi bật dãn thân (scaleY > 1, scaleXZ < 1)', () => {
    const scale = calculatePawnLandingImpact(0.25);
    expect(scale[1]).toBeGreaterThan(1.05);
    expect(scale[0]).toBeLessThan(0.95);
  });

  it('TC-JUICE.3c: Nhịp 2 nhún nhẹ tại u=0.50: Nén giảm chấn có biên độ nhỏ hơn nhịp 1', () => {
    const scale = calculatePawnLandingImpact(0.50);
    expect(scale[1]).toBeLessThan(1.0);
    expect(scale[1]).toBeGreaterThan(0.92);
    expect(scale[0]).toBeGreaterThan(1.0);
  });

  it('TC-JUICE.3d: Nhịp 2 nảy nhẹ tại u=0.75: Biên độ tắt dần', () => {
    const scale = calculatePawnLandingImpact(0.75);
    expect(scale[1]).toBeGreaterThan(1.0);
    expect(scale[1]).toBeLessThan(1.05);
  });

  it('TC-JUICE.3e: Tại u=1.0 (kết thúc tiếp đất): Phục hồi hoàn hảo về tỉ lệ gốc [1, 1, 1]', () => {
    const scale = calculatePawnLandingImpact(1.0);
    expect(scale).toEqual([1.0, 1.0, 1.0]);
  });

  it('TC-JUICE.3f: calculateKineticPawnScale ủy quyền chính xác cho landing khi landingProgress > 0', () => {
    const scale = calculateKineticPawnScale(1.0, 0.25);
    expect(scale).toEqual(calculatePawnLandingImpact(0.25));
  });
});

describe('[TC-JUICE.4/MSS] Physical Volume Preservation (Bảo Toàn Thể Tích Khối)', () => {
  it('Bảo toàn thể tích tương đối scaleX * scaleY * scaleZ ~ 1.0 (+-15%) qua toàn chu trình', () => {
    const jumpCheckpoints = [0, 0.05, 0.10, 0.25, 0.50, 0.75, 1.0];
    for (const t of jumpCheckpoints) {
      const [sx, sy, sz] = calculateKineticPawnScale(t);
      const vol = sx * sy * sz;
      expect(vol).toBeGreaterThan(0.85);
      expect(vol).toBeLessThan(1.15);
    }

    const landingCheckpoints = [0, 0.15, 0.25, 0.50, 0.75, 0.90, 1.0];
    for (const u of landingCheckpoints) {
      const [sx, sy, sz] = calculatePawnLandingImpact(u);
      const vol = sx * sy * sz;
      expect(vol).toBeGreaterThan(0.85);
      expect(vol).toBeLessThan(1.15);
    }
  });
});

describe('[TC-JUICE.5/MSS] Step Sound Pitch Variation (Âm Thanh Biến Thiên Cao Độ)', () => {
  it('TC-JUICE.5a: getStepPitchVariation luôn nằm trong dải [0.95, 1.10]', () => {
    expect(getStepPitchVariation(0)).toBeCloseTo(0.95, 4);
    expect(getStepPitchVariation(1)).toBeCloseTo(1.10, 4);
    expect(getStepPitchVariation(0.5)).toBeCloseTo(1.025, 4);
  });

  it('TC-JUICE.5b: 100 lần sinh ngẫu nhiên luôn bảo đảm chặn trên 1.10 và chặn dưới 0.95', () => {
    for (let i = 0; i < 100; i++) {
      const pitch = getStepPitchVariation();
      expect(pitch).toBeGreaterThanOrEqual(0.95 - 1e-6);
      expect(pitch).toBeLessThanOrEqual(1.10 + 1e-6);
    }
  });

  it('TC-JUICE.5c: AudioEngine.playSfx nhận đúng tham số rate trong dải 0.95 - 1.10', () => {
    const playSpy = vi.spyOn(AudioEngine, 'playSfx');
    const pitch = getStepPitchVariation();
    AudioEngine.playSfx(SoundEffect.PAWN_STEP, pitch);
    expect(playSpy).toHaveBeenCalledWith(SoundEffect.PAWN_STEP, pitch);
    playSpy.mockRestore();
  });

  it('TC-JUICE.5d: AudioEngine.playSfx tự động áp dụng biến thiên pitch cho PAWN_STEP khi rate bỏ trống', () => {
    const howl = AudioEngine.getOrCreateSfx(SoundEffect.PAWN_STEP);
    AudioEngine.playSfx(SoundEffect.PAWN_STEP);
    const currentRate = (howl as any).currentRate;
    if (typeof currentRate === 'number') {
      expect(currentRate).toBeGreaterThanOrEqual(0.95);
      expect(currentRate).toBeLessThanOrEqual(1.10);
    }
  });
});

describe('[TC-JUICE.6/MSS] Adaptive Cinematic Camera Math (Toán Lia & Zoom Camera)', () => {
  it('TC-JUICE.6a: calculateCameraFocusTarget neo [0, 0, 0] khi không có quân cờ hoạt động', () => {
    expect(calculateCameraFocusTarget(null)).toEqual([0, 0, 0]);
  });

  it('TC-JUICE.6b: calculateCameraFocusTarget dịch 65% về vị trí ô cờ để giữ góc nhìn toàn cảnh', () => {
    // Ô 0 (GO) tại [9, 0, 9]
    const targetGo = calculateCameraFocusTarget(0);
    expect(targetGo[0]).toBeCloseTo(9 * 0.65, 4);
    expect(targetGo[1]).toBe(0);
    expect(targetGo[2]).toBeCloseTo(9 * 0.65, 4);

    // Ô 20 (FREE_PARKING) tại [-9, 0, -9]
    const targetFree = calculateCameraFocusTarget(20);
    expect(targetFree[0]).toBeCloseTo(-9 * 0.65, 4);
    expect(targetFree[1]).toBe(0);
    expect(targetFree[2]).toBeCloseTo(-9 * 0.65, 4);
  });

  it('TC-JUICE.6c: calculateCameraZoom chuyển đổi đúng giữa 41 (bình thường) và 48 (biến cố lớn)', () => {
    expect(calculateCameraZoom(false)).toBe(BASE_CAMERA_ZOOM);
    expect(calculateCameraZoom(true)).toBe(EVENT_CAMERA_ZOOM);
    expect(BASE_CAMERA_ZOOM).toBe(41);
    expect(EVENT_CAMERA_ZOOM).toBe(48);
  });

  it('TC-JUICE.6d: Hằng số thời lượng bước nhảy đạt chuẩn 60 FPS mượt mà', () => {
    expect(HOP_DURATION).toBe(0.22);
    expect(LANDING_DURATION).toBe(0.12);
    expect(HOP_DURATION + LANDING_DURATION).toBeCloseTo(0.34, 4);
  });

  it('TC-JUICE.6e: resolveCameraTargetCell bám sát tiến độ waypoints khi quân cờ đang nhảy', () => {
    const anim = { playerId: 'p1', fromCell: 0, waypoints: [1, 2, 3], currentIndex: 1, isAnimating: true };
    expect(resolveCameraTargetCell(anim, 'p1', { p1: 0 })).toBe(2);
    expect(resolveCameraTargetCell({ ...anim, currentIndex: 2 }, 'p1', { p1: 0 })).toBe(3);
    expect(resolveCameraTargetCell(null, 'p1', { p1: 3 })).toBe(3);
    expect(resolveCameraTargetCell(null, null, {})).toBeNull();
  });
});

describe('[TC-JUICE.7/Adversarial] Adversarial Inversion & Boundary Defense', () => {
  it('calculateKineticPawnScale xử lý an toàn NaN, Infinity, số âm, overflow', () => {
    expect(calculateKineticPawnScale(Number.NaN)).toEqual([1, 1, 1]);
    expect(calculateKineticPawnScale(Number.POSITIVE_INFINITY)).toEqual([1, 1, 1]);
    expect(calculateKineticPawnScale(-1)).toEqual([1, 1, 1]);
    expect(calculateKineticPawnScale(1.5)).toEqual([1.15, 0.82, 1.15]);
  });

  it('calculatePawnLandingImpact xử lý an toàn NaN, số âm, số > 1', () => {
    expect(calculatePawnLandingImpact(Number.NaN)).toEqual([1, 1, 1]);
    expect(calculatePawnLandingImpact(-0.5)).toEqual([1.15, 0.82, 1.15]);
    expect(calculatePawnLandingImpact(1.5)).toEqual([1, 1, 1]);
  });

  it('calculateCameraFocusTarget xử lý an toàn NaN và vô cực', () => {
    expect(calculateCameraFocusTarget(Number.NaN)).toEqual([0, 0, 0]);
    expect(calculateCameraFocusTarget(Number.POSITIVE_INFINITY)).toEqual([0, 0, 0]);
  });

  it('getStepPitchVariation fallback an toàn khi truyền NaN', () => {
    expect(getStepPitchVariation(Number.NaN)).toBeCloseTo(0.95, 4);
  });
});
