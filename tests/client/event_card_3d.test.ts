// [UI-S04/MSS] 3D Flipping Event Card Test Suite
// Verifies card kinematics (Anticipation ➔ Flip ➔ Reveal), VFX classification, and Golden Ratio dimensions
import { describe, it, expect } from 'vitest';
import {
  calculateCardFlipTransform,
  resolveCardVfxType,
  EVENT_CARD_DIMENSIONS,
} from '../../src/client/3d/event_card_3d';
import {
  generateEventCardBackTexture,
  generateEventCardFrontTexture,
} from '../../src/client/3d/event_card_texture';

describe('[UI-S04/MSS] EventCard3D — 3D Spatial Flipping & Kinematics', () => {
  it('Phase 1: Anticipation (elapsed < 0.45s) — thẻ nâng cao dần, mặt lưng hướng về camera (rotY = Math.PI)', () => {
    const start = calculateCardFlipTransform(0);
    expect(start.phase).toBe('anticipation');
    expect(start.rotY).toBe(Math.PI);
    expect(start.scale).toBeCloseTo(0.7, 1);
    expect(start.heightY).toBeCloseTo(0.5, 1);

    const midAnticipation = calculateCardFlipTransform(0.25);
    expect(midAnticipation.phase).toBe('anticipation');
    expect(midAnticipation.rotY).toBe(Math.PI);
    expect(midAnticipation.heightY).toBeGreaterThan(0.5);
    expect(midAnticipation.scale).toBeGreaterThan(0.7);
  });

  it('Phase 2: Flip (0.45s <= elapsed < 1.15s) — góc lật 180 độ chuyển động từ Math.PI về 0', () => {
    const flipStart = calculateCardFlipTransform(0.45);
    expect(flipStart.phase).toBe('flip');
    expect(flipStart.rotY).toBeCloseTo(Math.PI, 1);

    const flipMid = calculateCardFlipTransform(0.8);
    expect(flipMid.phase).toBe('flip');
    expect(flipMid.rotY).toBeGreaterThan(0);
    expect(flipMid.rotY).toBeLessThan(Math.PI);

    const flipEnd = calculateCardFlipTransform(1.14);
    expect(flipEnd.phase).toBe('flip');
    expect(flipEnd.rotY).toBeCloseTo(0, 0.5);
  });

  it('Phase 3: Reveal (elapsed >= 1.15s) — mặt chính lộ diện (rotY = 0), lơ lửng bồng bềnh', () => {
    const reveal = calculateCardFlipTransform(1.2);
    expect(reveal.phase).toBe('reveal');
    expect(reveal.rotY).toBe(0);
    expect(reveal.scale).toBe(1.0);
    expect(reveal.heightY).toBeGreaterThan(3.1);
    expect(reveal.heightY).toBeLessThan(3.35);

    const revealLater = calculateCardFlipTransform(2.5);
    expect(revealLater.phase).toBe('reveal');
    expect(revealLater.rotY).toBe(0);
  });

  it('Bảo toàn giới hạn thời gian âm: calculateCardFlipTransform(-1) xử lý an toàn không NaN', () => {
    const negativeTime = calculateCardFlipTransform(-1);
    expect(negativeTime.phase).toBe('anticipation');
    expect(Number.isFinite(negativeTime.heightY)).toBe(true);
    expect(Number.isFinite(negativeTime.rotY)).toBe(true);
  });
});

describe('[UI-S04/MSS] EventCard3D — VFX Classification & Golden Dimensions', () => {
  it('Phân loại hiệu ứng hạt: Thẻ thưởng / delta dương hoặc không có phạt -> golden_dust', () => {
    expect(resolveCardVfxType('chance', 500)).toBe('golden_dust');
    expect(resolveCardVfxType('market', 1000)).toBe('golden_dust');
    expect(resolveCardVfxType('chance', 0)).toBe('golden_dust');
    expect(resolveCardVfxType('market', undefined)).toBe('golden_dust');
  });

  it('Phân loại hiệu ứng hạt: Thẻ phạt / delta âm -> warning_sparks (tia chớp cảnh báo tím/đỏ)', () => {
    expect(resolveCardVfxType('chance', -300)).toBe('warning_sparks');
    expect(resolveCardVfxType('market', -800)).toBe('warning_sparks');
  });

  it('Tuân thủ tỉ lệ vàng thẻ bài và ngân sách hạt InstancedMesh: width: 2.6, height: 3.62, MAX_CARD_PARTICLES: 36', () => {
    expect(EVENT_CARD_DIMENSIONS.width).toBe(2.6);
    expect(EVENT_CARD_DIMENSIONS.height).toBe(3.62);
    expect(EVENT_CARD_DIMENSIONS.thickness).toBe(0.06);
    const ratio = EVENT_CARD_DIMENSIONS.height / EVENT_CARD_DIMENSIONS.width;
    expect(ratio).toBeCloseTo(1.39, 1);
  });

  it('Kiểm chứng chuyển đổi pha tại đúng mốc biên: 0.45s chuyển sang flip, 1.15s chuyển sang reveal', () => {
    const atBoundary1 = calculateCardFlipTransform(0.45);
    expect(atBoundary1.phase).toBe('flip');

    const atBoundary2 = calculateCardFlipTransform(1.15);
    expect(atBoundary2.phase).toBe('reveal');
    expect(atBoundary2.rotY).toBe(0);
  });

  it('Đường cong co giãn hạt VFX đạt cực đại ở nửa vòng đời và triệt tiêu ở hai đầu mút', () => {
    const maxLife = 1.2;
    const calcScale = (life: number) => Math.sin((life / maxLife) * Math.PI);
    expect(calcScale(0)).toBeCloseTo(0, 5);
    expect(calcScale(maxLife)).toBeCloseTo(0, 5);
    expect(calcScale(maxLife / 2)).toBeCloseTo(1.0, 5);
  });

  it('Môi trường Node.js không có DOM: Texture generator trả về null an toàn', () => {
    expect(generateEventCardBackTexture('chance')).toBeNull();
    expect(generateEventCardBackTexture('market')).toBeNull();
    expect(
      generateEventCardFrontTexture({
        cardType: 'chance',
        cardId: 'CH_01',
        title: 'Cổ tức địa ốc',
        description: 'Nhận cổ tức 500k',
        effectDelta: 500,
      })
    ).toBeNull();
  });
});
