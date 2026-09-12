import { describe, it, expect, vi } from 'vitest';
import {
  calculateParallaxTilt,
  createInitialParticles,
  updateParticles,
  calculateTheatricalAmbientIntensity,
  calculateUrgentAuraColor,
  calculateCardSpringRecoil,
  CARD_DIMENSIONS,
  AUCTION_COLORS,
  THEATRICAL_LIGHTING_CONFIG,
  Auction3DStage,
  generateAuctionDeedTexture,
} from '../../src/client/3d/auction_3d_stage';
import {
  SapphireLandmarkModel,
  SAPPHIRE_LANDMARK_COLORS,
  resolveLandmarkTheme,
} from '../../src/client/3d/sapphire_landmark_model';
import {
  AuctionGavel3D,
  calculateGavelRotation,
  calculateShockwaveProgress,
  GAVEL_COLORS,
} from '../../src/client/3d/auction_gavel_3d';
import { ColorGroup } from '../../src/domain/board_config';

describe('[TC-AUC3D.1/MSS] Thẻ Sổ Đỏ 3D — Kích Thước Tỷ Lệ Vàng (CARD_DIMENSIONS)', () => {
  it('Tỷ lệ thẻ bài đạt chuẩn thẻ bài sưu tầm quốc tế (Rộng 2.8 x Cao 3.9 x Dày 0.08)', () => {
    expect(CARD_DIMENSIONS.width).toBe(2.8);
    expect(CARD_DIMENSIONS.height).toBe(3.9);
    expect(CARD_DIMENSIONS.thickness).toBe(0.08);
    expect(CARD_DIMENSIONS.aspectRatio).toBeCloseTo(3.9 / 2.8, 2);
  });

  it('Bảng mã màu PBR đồng bộ chuẩn nhận diện Champagne Gold, Cyan Glow và Urgent Crimson', () => {
    expect(AUCTION_COLORS.goldBezel).toBe('#F59E0B');
    expect(AUCTION_COLORS.cyanGlow).toBe('#06B6D4');
    expect(AUCTION_COLORS.cyanLight).toBe('#22D3EE');
    expect(AUCTION_COLORS.urgentGlow).toBe('#F43F5E');
    expect(AUCTION_COLORS.urgentLight).toBe('#FDA4AF');
    expect(AUCTION_COLORS.pedestalBase).toBe('#0F172A');
    expect(AUCTION_COLORS.spotlightYellow).toBe('#FDE047');
  });

  it('THEATRICAL_LIGHTING_CONFIG thiết lập chính xác Spotlight vàng ấm hoàng gia và đèn ven Cyber-Cyan', () => {
    expect(THEATRICAL_LIGHTING_CONFIG.spotLight.position).toEqual([0, 10, 5]);
    expect(THEATRICAL_LIGHTING_CONFIG.spotLight.target).toEqual([0, 2.5, 0]);
    expect(THEATRICAL_LIGHTING_CONFIG.spotLight.angle).toBe(0.35);
    expect(THEATRICAL_LIGHTING_CONFIG.spotLight.penumbra).toBe(0.8);
    expect(THEATRICAL_LIGHTING_CONFIG.spotLight.intensity).toBe(5.0);
    expect(THEATRICAL_LIGHTING_CONFIG.spotLight.color).toBe('#FDE047');

    expect(THEATRICAL_LIGHTING_CONFIG.rimLight.position).toEqual([0, 0.4, 0]);
    expect(THEATRICAL_LIGHTING_CONFIG.rimLight.intensity).toBe(2.0);
    expect(THEATRICAL_LIGHTING_CONFIG.rimLight.color).toBe('#06B6D4');

    expect(THEATRICAL_LIGHTING_CONFIG.ambientDimming.darkAmbient).toBe(0.15);
    expect(THEATRICAL_LIGHTING_CONFIG.ambientDimming.baseAmbient).toBe(0.85);
  });
});

describe('[TC-AUC3D.2/MSS] Tính Toán Góc Nghiêng Parallax (calculateParallaxTilt)', () => {
  it('Con trỏ ở tâm (0, 0) trả về góc nghiêng cân bằng (rotX = 0, rotY = 0)', () => {
    const tilt = calculateParallaxTilt(0, 0);
    expect(tilt.rotX).toBe(0);
    expect(tilt.rotY).toBe(0);
  });

  it('Con trỏ góc trên-phải (1, 1) tính toán góc nghiêng âm trên trục X và dương trên trục Y', () => {
    const tilt = calculateParallaxTilt(1, 1);
    expect(tilt.rotX).toBeCloseTo(-0.25);
    expect(tilt.rotY).toBeCloseTo(0.35);
  });

  it('Con trỏ góc dưới-trái (-1, -1) tính toán góc nghiêng đảo chiều', () => {
    const tilt = calculateParallaxTilt(-1, -1);
    expect(tilt.rotX).toBeCloseTo(0.25);
    expect(tilt.rotY).toBeCloseTo(-0.35);
  });

  it('[Adversarial] Tọa độ vượt biên [-1, 1] được clamp an toàn', () => {
    const tiltOverflow = calculateParallaxTilt(3.5, -2.8);
    expect(tiltOverflow.rotX).toBeCloseTo(0.25);
    expect(tiltOverflow.rotY).toBeCloseTo(0.35);
  });

  it('[Adversarial] Kháng lỗi an toàn khi tọa độ là NaN hoặc Infinity', () => {
    const tiltNaN = calculateParallaxTilt(Number.NaN, Number.POSITIVE_INFINITY);
    expect(tiltNaN.rotX).toBe(0);
    expect(tiltNaN.rotY).toBe(0);
  });
});

describe('[TC-AUC3D.3/MSS] Hệ Thống Hạt Pháo Hoa Bụi Vàng (Gold Confetti Particles)', () => {
  it('createInitialParticles sinh đúng số lượng hạt theo tham số và xuất phát ở cao độ thẻ (y ~ 3.1)', () => {
    const particles = createInitialParticles(50);
    expect(particles).toHaveLength(50);
    for (const p of particles) {
      expect(p.life).toBeGreaterThan(0);
      expect(p.maxLife).toBeGreaterThan(0);
      expect(p.vy).toBeGreaterThan(0); // Vận tốc nảy hướng lên trên
      expect(p.y).toBeGreaterThan(2.5); // Quanh cao độ thẻ Y = 3.2
      expect(typeof p.color).toBe('string');
    }
  });

  it('updateParticles cập nhật tọa độ, áp dụng trọng lực vi mô và giảm dần tuổi thọ', () => {
    const initial = createInitialParticles(10);
    const updated = updateParticles(initial, 0.05);

    expect(updated.length).toBe(10);
    for (let i = 0; i < updated.length; i++) {
      const pOld = initial[i]!;
      const pNew = updated[i]!;
      expect(pNew.vy).toBeLessThan(pOld.vy);
      expect(pNew.life).toBeLessThan(pOld.life);
      expect(pNew.x).not.toBe(pOld.x);
    }
  });

  it('updateParticles tự động thanh lọc các hạt đã hết tuổi thọ (life <= 0)', () => {
    const deadParticles = [
      {
        id: 1,
        x: 0,
        y: 3.1,
        z: 0,
        vx: 1,
        vy: 1,
        vz: 1,
        size: 0.04,
        life: 0.02,
        maxLife: 1.0,
        color: '#F59E0B',
      },
    ];
    const result = updateParticles(deadParticles, 0.1);
    expect(result).toHaveLength(0);
  });

  it('[Adversarial] Delta âm hoặc NaN được clamp an toàn không làm hỏng dữ liệu hạt', () => {
    const particles = createInitialParticles(5);
    const safeResult = updateParticles(particles, -0.5);
    expect(safeResult).toHaveLength(5);
    expect(safeResult[0]?.life).toBe(particles[0]?.life);
  });

  it('[Adversarial] createInitialParticles với số lượng 0, âm hoặc NaN trả về mảng rỗng', () => {
    expect(createInitialParticles(0)).toEqual([]);
    expect(createInitialParticles(-10)).toEqual([]);
    expect(createInitialParticles(Number.NaN)).toEqual([]);
  });
});

describe('[TC-AUC3D.4/MSS] Điều Khiển Chiếu Sáng Kịch Tính (calculateTheatricalAmbientIntensity)', () => {
  it('Hạ tối 85% cường độ ánh sáng môi trường từ 0.85 xuống tiệm cận 0.15 khi đấu giá mở', () => {
    let current = 0.85;
    for (let i = 0; i < 30; i++) {
      current = calculateTheatricalAmbientIntensity(current, true, 0.033);
    }
    expect(current).toBeLessThan(0.25);
    expect(current).toBeGreaterThanOrEqual(0.15);
  });

  it('Hồi phục cường độ ánh sáng môi trường về 0.85 khi đấu giá kết thúc', () => {
    let current = 0.15;
    for (let i = 0; i < 30; i++) {
      current = calculateTheatricalAmbientIntensity(current, false, 0.033);
    }
    expect(current).toBeGreaterThan(0.75);
    expect(current).toBeLessThanOrEqual(0.85);
  });

  it('[Adversarial] An toàn với delta âm hoặc số không hợp lệ', () => {
    const res = calculateTheatricalAmbientIntensity(0.5, true, -0.1);
    expect(res).toBe(0.5);
  });
});

describe('[TC-AUC3D.5/MSS] Hào Quang Khẩn Cấp & Độ Nảy Thẻ Bài (IMP-14 Boost)', () => {
  it('calculateUrgentAuraColor trả về Cyan tĩnh khi timeRemaining > 5s', () => {
    const aura = calculateUrgentAuraColor(12, 1.5);
    expect(aura.color).toBe(AUCTION_COLORS.cyanGlow);
    expect(aura.emissiveIntensity).toBe(3.2);
  });

  it('calculateUrgentAuraColor chuyển sang sắc đỏ nhấp nháy khi timeRemaining <= 5s', () => {
    const aura = calculateUrgentAuraColor(3, 0.5);
    expect([AUCTION_COLORS.urgentGlow, AUCTION_COLORS.urgentLight]).toContain(aura.color);
    expect(aura.emissiveIntensity).toBeGreaterThan(4.0);
  });

  it('[Adversarial] calculateUrgentAuraColor kháng lỗi an toàn với số âm hoặc NaN', () => {
    const auraNeg = calculateUrgentAuraColor(-2, 1.0);
    expect(auraNeg.emissiveIntensity).toBeGreaterThan(3.5);
    const auraNaN = calculateUrgentAuraColor(Number.NaN, 1.0);
    expect(auraNaN.color).toBe(AUCTION_COLORS.cyanGlow);

    const auraElapsedNaN = calculateUrgentAuraColor(3, Number.NaN);
    expect(Number.isFinite(auraElapsedNaN.emissiveIntensity)).toBe(true);
    expect(auraElapsedNaN.emissiveIntensity).toBeGreaterThanOrEqual(4.2);

    const auraInf = calculateUrgentAuraColor(3, Number.POSITIVE_INFINITY);
    expect(Number.isFinite(auraInf.emissiveIntensity)).toBe(true);
  });

  it('calculateCardSpringRecoil tính toán độ nảy suy giảm đàn hồi trong 600ms', () => {
    expect(calculateCardSpringRecoil(0)).toBe(1.0);
    expect(calculateCardSpringRecoil(0.05)).not.toBe(1.0);
    expect(calculateCardSpringRecoil(1.0)).toBe(1.0); // Quá thời gian dao động
    expect(calculateCardSpringRecoil(-0.1)).toBe(1.0); // Input âm
  });
});

describe('[TC-AUC3D.6/MSS] Búa Vàng Đấu Giá 3D & Vòng Sóng Chấn Động (AuctionGavel3D)', () => {
  it('calculateGavelRotation mô phỏng chuẩn 4 pha: Lấy đà, Đập búa, Nảy đàn hồi, Thu hồi', () => {
    expect(calculateGavelRotation(0)).toBe(0);
    // Pha 1: Lấy đà (Progress 0.1) -> góc âm
    expect(calculateGavelRotation(0.1)).toBeLessThan(0);
    // Pha 2: Đập búa dứt khoát (Progress 0.4) -> góc dương cực đại
    expect(calculateGavelRotation(0.4)).toBeGreaterThan(0);
    // Pha 4: Hoàn tất -> trở về 0
    expect(calculateGavelRotation(1.0)).toBe(0);
  });

  it('[Continuity] calculateGavelRotation liên tục mượt mà qua các điểm chuyển pha (không có bước nhảy đột ngột)', () => {
    let prev = calculateGavelRotation(0);
    for (let i = 1; i <= 100; i++) {
      const p = i / 100;
      const curr = calculateGavelRotation(p);
      const delta = Math.abs(curr - prev);
      // Bước nhảy tối đa giữa 2 mẫu cách nhau 0.01 không được vượt quá 0.08 rad (khử hoàn toàn đứt gãy 0.3 rad)
      expect(delta).toBeLessThan(0.08);
      prev = curr;
    }
    // Pha 3 nảy đàn hồi (0.55) phải nhỏ hơn góc đập cực đại (0.45)
    expect(calculateGavelRotation(0.45)).toBeCloseTo(0.5, 2);
    expect(calculateGavelRotation(0.55)).toBeLessThan(calculateGavelRotation(0.45));
    expect(calculateGavelRotation(0.65)).toBeCloseTo(0.2, 2);
  });

  it('calculateShockwaveProgress khuếch đại scale và giảm dần opacity', () => {
    const swStart = calculateShockwaveProgress(0.1);
    const swMid = calculateShockwaveProgress(0.5);
    const swEnd = calculateShockwaveProgress(0.9);

    expect(swMid.scale).toBeGreaterThan(swStart.scale);
    expect(swEnd.scale).toBeGreaterThan(swMid.scale);
    expect(swMid.opacity).toBeLessThan(swStart.opacity);
    expect(swEnd.opacity).toBeLessThan(swMid.opacity);
  });

  it('[Adversarial] Búa vàng và vòng sóng kháng lỗi an toàn khi progress ngoài biên hoặc NaN', () => {
    expect(calculateGavelRotation(-1)).toBe(0);
    expect(calculateGavelRotation(2)).toBe(0);
    expect(calculateGavelRotation(Number.NaN)).toBe(0);

    const swSafe = calculateShockwaveProgress(Number.NaN);
    expect(swSafe.scale).toBe(0.2);
    expect(swSafe.opacity).toBe(0);
  });

  it('AuctionGavel3D và GAVEL_COLORS tuân thủ hợp đồng giao diện', () => {
    expect(typeof AuctionGavel3D).toBe('function');
    expect(GAVEL_COLORS.goldHead).toBe('#F59E0B');
    expect(GAVEL_COLORS.soundBlockStone).toBe('#090D1A');
  });
});

describe('[TC-AUC3D.7/MSS] Kiến Trúc Tháp Sapphire Đa Dạng Theo Phân Khu (District-Aware)', () => {
  it('resolveLandmarkTheme trả về cấu hình Pagoda cho nhóm Xanh Lá (Emerald)', () => {
    const theme = resolveLandmarkTheme(ColorGroup.XanhLa);
    expect(theme.crownType).toBe('pagoda');
    expect(theme.glassColor).toBe('#34D399');
  });

  it('resolveLandmarkTheme trả về cấu hình Marina cho nhóm Xanh Da Trời & Nâu', () => {
    const theme = resolveLandmarkTheme(ColorGroup.XanhDaTroi);
    expect(theme.crownType).toBe('marina');
    expect(theme.glassColor).toBe('#22D3EE');
  });

  it('resolveLandmarkTheme trả về cấu hình Crystal cho nhóm Đỏ, Cam, Hồng', () => {
    const theme = resolveLandmarkTheme(ColorGroup.Do);
    expect(theme.crownType).toBe('crystal');
    expect(theme.glassColor).toBe('#FB7185');
  });

  it('resolveLandmarkTheme mặc định trả về cấu hình Spire Hoàng Gia cho Vàng, Tím hoặc không xác định', () => {
    const theme = resolveLandmarkTheme(ColorGroup.Vang);
    expect(theme.crownType).toBe('spire');
    expect(theme.glassColor).toBe(SAPPHIRE_LANDMARK_COLORS.glassBlue);
  });
});

describe('[TC-AUC3D.8/MSS] Texture & Component Export Contract', () => {
  it('Auction3DStage và SapphireLandmarkModel được export dưới dạng React Functional Component', () => {
    expect(typeof Auction3DStage).toBe('function');
    expect(typeof SapphireLandmarkModel).toBe('function');
    expect(SAPPHIRE_LANDMARK_COLORS.glassBlue).toBe('#38BDF8');
    expect(SAPPHIRE_LANDMARK_COLORS.goldTrim).toBe('#F59E0B');
  });

  it('generateAuctionDeedTexture trả về null khi chạy trong môi trường không có DOM/document', () => {
    vi.stubGlobal('document', undefined);
    const tex = generateAuctionDeedTexture(1, 'Cần Thơ', '#B45309', 600, 650);
    expect(tex).toBeNull();
    vi.unstubAllGlobals();
  });

  it('generateAuctionDeedTexture vẽ thành công texture HiDPI khi có canvas 2D context hợp lệ', () => {
    const mockCtx = {
      scale: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      fillText: () => {},
      strokeText: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      stroke: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      roundRect: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: '',
      textBaseline: '',
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetY: 0,
    };
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: (type: string) => (type === '2d' ? mockCtx : null),
    };

    vi.stubGlobal('document', {
      createElement: (tag: string) => (tag === 'canvas' ? mockCanvas : {}),
    });

    const tex = generateAuctionDeedTexture(1, 'Nguyễn Huệ', '#F59E0B', 4000, 4200);
    expect(tex).not.toBeNull();
    expect(tex?.version).toBeGreaterThan(0);

    vi.unstubAllGlobals();
  });
});
