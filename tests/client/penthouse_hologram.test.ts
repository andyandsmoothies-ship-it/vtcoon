// [TC-P3.11/MSS][IMP-20] PenthouseHologram Test Suite — Thẩm Định Sa Bàn Diorama Mini & Hệ Thống Hologram
import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  HOLOGRAM_COLORS,
  calculateHologramBob,
  calculateRadarRingRotations,
  generateLaserNanoParticles,
  DIORAMA_SKYSCRAPERS,
  TownscaperMiniDiorama,
  CentralHologram,
} from '../../src/client/3d/penthouse_hologram';

describe('[TC-P3.11/MSS] Thẩm Định Bảng Màu & Tham Số Hologram (HOLOGRAM_COLORS)', () => {
  it('Chứa đầy đủ các mã màu ánh sáng phát quang chuẩn viễn tưởng', () => {
    expect(HOLOGRAM_COLORS.cyan).toBe('#06B6D4');
    expect(HOLOGRAM_COLORS.amber).toBe('#F59E0B');
    expect(HOLOGRAM_COLORS.emerald).toBe('#10B981');
    expect(HOLOGRAM_COLORS.sky).toBe('#38BDF8');
    expect(HOLOGRAM_COLORS.gold).toBe('#FBBF24');
  });
});

describe('[TC-P3.11/MSS] Dao Động Điều Hòa & Phòng Thủ Biên NaN/Infinity (calculateHologramBob)', () => {
  it('Dao động tuần hoàn bồng bềnh 1.68m ± 0.04m và góc quay liên tục rotY', () => {
    const bob0 = calculateHologramBob(0);
    expect(bob0.y).toBeCloseTo(1.68, 2);
    expect(bob0.rotY).toBe(0);

    const bobHalfPi = calculateHologramBob(Math.PI / (2 * 1.8));
    expect(bobHalfPi.y).toBeCloseTo(1.72, 2);
    expect(bobHalfPi.rotY).toBeGreaterThan(0);
  });

  it('[Adversarial] Kháng an toàn với NaN, Infinity và số âm', () => {
    const bobNaN = calculateHologramBob(Number.NaN);
    expect(bobNaN.y).toBeCloseTo(1.68, 2);
    expect(bobNaN.rotY).toBe(0);

    const bobInf = calculateHologramBob(Number.POSITIVE_INFINITY);
    expect(bobInf.y).toBeCloseTo(1.68, 2);
    expect(bobInf.rotY).toBe(0);

    const bobNeg = calculateHologramBob(-5);
    expect(Number.isFinite(bobNeg.y)).toBe(true);
    expect(Number.isFinite(bobNeg.rotY)).toBe(true);
    expect(bobNeg.y).toBeGreaterThanOrEqual(1.64);
    expect(bobNeg.y).toBeLessThanOrEqual(1.72);
  });
});

describe('[TC-P3.11/MSS] Hệ Thống Hạt Laser Nano (generateLaserNanoParticles)', () => {
  it('Sinh đúng 120 hạt bụi laser với 360 tọa độ [x, y, z] phân bố không gian', () => {
    const positions = generateLaserNanoParticles(120);
    expect(positions).toHaveLength(120 * 3);

    for (let i = 0; i < 120; i++) {
      const x = positions[i * 3]!;
      const y = positions[i * 3 + 1]!;
      const z = positions[i * 3 + 2]!;
      expect(Number.isFinite(x)).toBe(true);
      expect(Number.isFinite(y)).toBe(true);
      expect(Number.isFinite(z)).toBe(true);

      // Bán kính hạt phân bố xung quanh tâm sa bàn
      const radius = Math.hypot(x, z);
      expect(radius).toBeGreaterThanOrEqual(0.1);
      expect(radius).toBeLessThanOrEqual(0.75);

      // Chiều cao hạt dao động trong khoảng bồng bềnh
      expect(y).toBeGreaterThanOrEqual(-0.15);
      expect(y).toBeLessThanOrEqual(0.75);
    }
  });

  it('[Adversarial] generateLaserNanoParticles kháng an toàn với NaN và số âm', () => {
    const posNaN = generateLaserNanoParticles(Number.NaN);
    expect(posNaN).toHaveLength(120 * 3);

    const posNeg = generateLaserNanoParticles(-50);
    expect(posNeg).toHaveLength(120 * 3);
  });
});

describe('[TC-P3.11/MSS] Sa Bàn Townscaper Mini Diorama (DIORAMA_SKYSCRAPERS)', () => {
  it('Cụm cao ốc chọc trời vi mô có ít nhất 6 tòa tháp với chiều cao và màu sắc phân tầng', () => {
    expect(DIORAMA_SKYSCRAPERS.length).toBeGreaterThanOrEqual(6);

    for (const b of DIORAMA_SKYSCRAPERS) {
      expect(b.id).toBeDefined();
      expect(Number.isFinite(b.x)).toBe(true);
      expect(Number.isFinite(b.z)).toBe(true);
      expect(b.h).toBeGreaterThan(0.15);
      expect(b.h).toBeLessThan(0.6);
      expect(b.w).toBeGreaterThan(0.05);
      expect(b.d).toBeGreaterThan(0.05);
      expect(b.color).toBeDefined();
      expect(b.emissive).toBeDefined();
    }
  });

  it('TownscaperMiniDiorama kết xuất đầy đủ đĩa vịnh biển, cầu treo, 7 cao ốc và Landmark', () => {
    expect(typeof TownscaperMiniDiorama).toBe('function');
    const dioramaEl = TownscaperMiniDiorama();
    expect(React.isValidElement(dioramaEl)).toBe(true);
    expect(dioramaEl.type).toBe('group');

    type MeshProps = { position?: [number, number, number]; children?: React.ReactNode };
    const dioramaProps = dioramaEl.props as { children?: React.ReactNode };
    const children = React.Children.toArray(dioramaProps.children);
    expect(children.length).toBeGreaterThanOrEqual(4);

    // 1. Đĩa nước vịnh biển ngọc bích
    const bayMesh = children[0] as React.ReactElement<MeshProps>;
    expect(bayMesh.type).toBe('mesh');
    expect(bayMesh.props.position).toEqual([0, 0.026, 0]);

    // 2. Cầu treo dây văng mini
    const bridgeGroup = children[1] as React.ReactElement<{ children?: React.ReactNode }>;
    expect(bridgeGroup.type).toBe('group');

    // 3. Cụm cao ốc chọc trời vi mô (7 micro-skyscrapers)
    const skyscraperMeshes = children.slice(2, 2 + DIORAMA_SKYSCRAPERS.length);
    expect(skyscraperMeshes).toHaveLength(7);

    // 4. Tháp Landmark trung tâm
    const landmarkMesh = children[children.length - 1] as React.ReactElement<MeshProps>;
    expect(landmarkMesh.type).toBe('mesh');
    expect(landmarkMesh.props.position).toEqual([0, 0.24, 0]);

    expect(typeof CentralHologram).toBe('function');
  });
});

describe('[TC-P3.12/MSS] Thẩm Định Hệ Thống 3 Vòng Quét Radar Đồng Tâm Đa Chiều (calculateRadarRingRotations)', () => {
  it('calculateRadarRingRotations sinh góc xoay 3 chiều x, y, z độc lập tạo trường quét đa trục', () => {
    const rot0 = calculateRadarRingRotations(0);
    expect(rot0.ring1).toEqual([0, 0, 0]);
    expect(rot0.ring2).toEqual([0, 0, 0]);
    expect(rot0.ring3).toEqual([0, 0.15, 0]);

    const rot1 = calculateRadarRingRotations(2.0);
    // Vòng 1 quét phẳng quanh trục Z
    expect(rot1.ring1[2]).toBeCloseTo(2.0 * 0.65, 3);
    // Vòng 2 nghiêng trục X và quét ngược chiều Z
    expect(rot1.ring2[0]).not.toBe(0);
    expect(rot1.ring2[2]).toBeCloseTo(-2.0 * 0.48, 3);
    // Vòng 3 nghiêng trục Y và quét thuận chiều Z
    expect(rot1.ring3[1]).not.toBe(0);
    expect(rot1.ring3[2]).toBeCloseTo(2.0 * 0.32, 3);
  });

  it('[Adversarial] calculateRadarRingRotations an toàn trước NaN, Infinity và số âm', () => {
    const rotNaN = calculateRadarRingRotations(Number.NaN);
    expect(Number.isFinite(rotNaN.ring1[2])).toBe(true);
    expect(Number.isFinite(rotNaN.ring2[0])).toBe(true);
    expect(Number.isFinite(rotNaN.ring3[1])).toBe(true);

    const rotInf = calculateRadarRingRotations(Number.POSITIVE_INFINITY);
    expect(Number.isFinite(rotInf.ring1[2])).toBe(true);
    expect(Number.isFinite(rotInf.ring2[0])).toBe(true);
    expect(Number.isFinite(rotInf.ring3[1])).toBe(true);

    const rotNeg = calculateRadarRingRotations(-10);
    expect(Number.isFinite(rotNeg.ring1[2])).toBe(true);
    expect(Number.isFinite(rotNeg.ring2[2])).toBe(true);
    expect(Number.isFinite(rotNeg.ring3[2])).toBe(true);
  });
});
