// [TC-223.01/MSS..TC-223.16/MSS][UC-IMP223] Auction Theatrical FX Contract Suite
// Universal 5-Facet Behavioral Matrix & Detroit Style
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import {
  calculateBidFlashIntensity,
  TimeOfDayLighting,
} from '../../src/client/3d/time_of_day_lighting';
import {
  calculateDynamicBloomThreshold,
  calculateDynamicVignetteDarkness,
  PostProcessingPipeline,
  DEFAULT_PIPELINE_CONFIG,
} from '../../src/client/3d/post_processing_pipeline';
import { CinematicOverlay } from '../../src/client/3d/cinematic_effects';

describe('[TC-223/MSS][UC-IMP223] Auction Theatrical FX — Contract Suite', () => {
  // =========================================================================
  // Facet 1: Bid Flash Impulse & Mathematical Quadratic Decay (4 tests)
  // =========================================================================
  describe('Facet 1: Bid Flash Impulse & Mathematical Quadratic Decay', () => {
    it('[TC-223.01/MSS][UC-IMP223][Facet-1/BidFlashPeak] calculateBidFlashIntensity(0.28, 0, 1.5, 0.35) trả về chính xác giá trị đỉnh 1.78', () => {
      // Tại t = 0, xung flash đạt đỉnh: base (0.28) + boost (1.5) * (1 - 0)^2 = 1.78
      const peak = calculateBidFlashIntensity(0.28, 0, 1.5, 0.35);
      expect(peak).toBeCloseTo(1.78, 4);
    });

    it('[TC-223.02/MSS][UC-IMP223][Facet-1/BidFlashQuadraticDecay] Tại t = 0.105 (progress = 0.3), calculateBidFlashIntensity(0.28, 0.105, 1.5, 0.35) phân rã bậc hai (1 - 0.3)^2 = 0.49, trả về chính xác 1.015 (chống bug linear 1.33)', () => {
      // Progress = 0.105 / 0.35 = 0.30 -> decay = (1 - 0.3)^2 = 0.49
      // Cường độ = 0.28 + 1.5 * 0.49 = 1.015
      const intensity = calculateBidFlashIntensity(0.28, 0.105, 1.5, 0.35);
      expect(intensity).toBeCloseTo(1.015, 4);
      // Chặn đứng nguy cơ bug-codification nếu implementer dùng hàm tuyến tính (0.28 + 1.5 * 0.7 = 1.33)
      expect(intensity).not.toBeCloseTo(1.33, 2);
    });

    it('[TC-223.03/MSS][UC-IMP223][Facet-1/BidFlashExpiry] Khi t >= 0.35, calculateBidFlashIntensity(0.28, 0.35, 1.5, 0.35) hoàn trả chính xác giá trị gốc baseIntensity (0.28), triệt tiêu hoàn toàn xung flash', () => {
      // Tại đúng ngưỡng hết hạn duration = 0.35s
      expect(calculateBidFlashIntensity(0.28, 0.35, 1.5, 0.35)).toBe(0.28);
      // Sau khi đã vượt ngưỡng duration (ví dụ t = 0.50s)
      expect(calculateBidFlashIntensity(0.28, 0.50, 1.5, 0.35)).toBe(0.28);
    });

    it('[TC-223.04/MSS][UC-IMP223][Facet-1/BidFlashZeroBase] Khi gọi với base = 0 (lấy gia số), calculateBidFlashIntensity(0, 0, 1.5, 0.35) trả về 1.5, và tại t >= 0.35 trả về 0', () => {
      // Dùng để tính toán trực tiếp delta boost cộng dồn vào light intensity trong frame loop
      expect(calculateBidFlashIntensity(0, 0, 1.5, 0.35)).toBeCloseTo(1.5, 4);
      expect(calculateBidFlashIntensity(0, 0.35, 1.5, 0.35)).toBe(0);
      expect(calculateBidFlashIntensity(0, 1.0, 1.5, 0.35)).toBe(0);
    });
  });

  // =========================================================================
  // Facet 2: Dynamic Bloom Thresholding (3 tests)
  // =========================================================================
  describe('Facet 2: Dynamic Bloom Thresholding', () => {
    it('[TC-223.05/MSS][UC-IMP223][Facet-2/StandardBloomThreshold] Khi isAuctionActive = false, calculateDynamicBloomThreshold(false) trả về ngưỡng tiêu chuẩn 2.5', () => {
      // Trạng thái bình thường ngoài đấu giá: ngưỡng 2.5 chống lóa mặt bàn cờ
      const threshold = calculateDynamicBloomThreshold(false);
      expect(threshold).toBe(2.5);
    });

    it('[TC-223.06/MSS][UC-IMP223][Facet-2/TheatricalBloomThreshold] Khi isAuctionActive = true, calculateDynamicBloomThreshold(true) hạ ngưỡng xuống mức lộng lẫy 1.2', () => {
      // Trạng thái đấu giá sàn kịch nghệ: hạ ngưỡng xuống 1.2 tỏa hào quang vàng kim
      const threshold = calculateDynamicBloomThreshold(true);
      expect(threshold).toBe(1.2);
    });

    it('[TC-223.07/MSS][UC-IMP223][Facet-2/CustomBloomThreshold] calculateDynamicBloomThreshold(true, 3.0, 1.0) tôn trọng tham số tùy biến, trả về 1.0 khi true và 3.0 khi false', () => {
      expect(calculateDynamicBloomThreshold(true, 3.0, 1.0)).toBe(1.0);
      expect(calculateDynamicBloomThreshold(false, 3.0, 1.0)).toBe(3.0);
    });
  });

  // =========================================================================
  // Facet 3: Contextual Vignette Darkness (3 tests)
  // =========================================================================
  describe('Facet 3: Contextual Vignette Darkness', () => {
    it('[TC-223.08/MSS][UC-IMP223][Facet-3/StandardVignetteDarkness] Khi isAuctionActive = false, calculateDynamicVignetteDarkness(false) trả về độ tối nhẹ 0.15', () => {
      // Chế độ sa bàn bình thường: độ tối viền quang học 0.15
      const darkness = calculateDynamicVignetteDarkness(false);
      expect(darkness).toBe(0.15);
    });

    it('[TC-223.09/MSS][UC-IMP223][Facet-3/TheatricalVignetteDarkness] Khi isAuctionActive = true, calculateDynamicVignetteDarkness(true) tăng độ tối viền lên 0.35 để tập trung thị giác', () => {
      // Chế độ đấu giá: tăng độ tối viền lên 0.35 tạo visual tunneling
      const darkness = calculateDynamicVignetteDarkness(true);
      expect(darkness).toBe(0.35);
    });

    it('[TC-223.10/MSS][UC-IMP223][Facet-3/VignetteRangeClamping] calculateDynamicVignetteDarkness luôn kẹp chặt trong đoạn [0.0, 1.0] ngay cả khi truyền tham số vượt ngưỡng (ví dụ 1.5 -> clamp 1.0, -0.5 -> clamp 0.0)', () => {
      // Vượt biên trên -> clamp 1.0
      expect(calculateDynamicVignetteDarkness(true, 0.15, 1.5)).toBe(1.0);
      expect(calculateDynamicVignetteDarkness(false, 2.0, 0.35)).toBe(1.0);
      // Vượt biên dưới -> clamp 0.0
      expect(calculateDynamicVignetteDarkness(true, 0.15, -0.5)).toBe(0.0);
      expect(calculateDynamicVignetteDarkness(false, -1.0, 0.35)).toBe(0.0);
    });
  });

  // =========================================================================
  // Facet 4: Defensive Guards & Frame Loop Stability (3 tests)
  // =========================================================================
  describe('Facet 4: Defensive Guards & Frame Loop Stability', () => {
    it('[TC-223.11/MSS][UC-IMP223][Facet-4/BidFlashDefensiveGuards] Khi nhận NaN, Infinity hoặc timer < 0, calculateBidFlashIntensity phòng vệ trả về an toàn baseIntensity', () => {
      expect(calculateBidFlashIntensity(0.28, Number.NaN, 1.5, 0.35)).toBe(0.28);
      expect(calculateBidFlashIntensity(0.28, Infinity, 1.5, 0.35)).toBe(0.28);
      expect(calculateBidFlashIntensity(0.28, -0.1, 1.5, 0.35)).toBe(0.28);
      expect(calculateBidFlashIntensity(Number.NaN, 0, 1.5, 0.35)).toBe(0);
    });

    it('[TC-223.12/MSS][UC-IMP223][Facet-4/ThresholdDefensiveGuards] calculateDynamicBloomThreshold và calculateDynamicVignetteDarkness phòng vệ khi nhận NaN, trả về default hợp lệ (2.5 và 0.15)', () => {
      expect(calculateDynamicBloomThreshold(true, Number.NaN, Number.NaN)).toBe(2.5);
      expect(calculateDynamicBloomThreshold(false, Number.NaN, 1.2)).toBe(2.5);
      expect(calculateDynamicVignetteDarkness(true, Number.NaN, Number.NaN)).toBe(0.15);
      expect(calculateDynamicVignetteDarkness(false, Number.NaN, 0.35)).toBe(0.15);
    });

    it('[TC-223.13/MSS][UC-IMP223][Facet-4/ZeroNegativeIntensity] Cường độ xung flash không bao giờ sinh ra số âm khi duration <= 0', () => {
      expect(calculateBidFlashIntensity(0.28, 0, 1.5, 0)).toBe(0.28);
      expect(calculateBidFlashIntensity(0.28, 0.1, 1.5, -0.35)).toBe(0.28);
      expect(calculateBidFlashIntensity(0, 0, 1.5, 0)).toBe(0);
      expect(calculateBidFlashIntensity(0, 0, 1.5, -1.0)).toBe(0);
    });
  });

  // =========================================================================
  // Facet 5: Backward Compatibility & Resource Integrity (3 tests)
  // =========================================================================
  describe('Facet 5: Backward Compatibility & Resource Integrity', () => {
    it('[TC-223.14/MSS][UC-IMP223][Facet-5/PostProcessingDefaultIntegrity] PostProcessingPipeline duy trì 100% cấu hình mặc định (bloomThreshold 2.5, vignetteDarkness 0.15) khi không truyền isAuctionActive', () => {
      expect(DEFAULT_PIPELINE_CONFIG.bloomThreshold).toBe(2.5);
      expect(DEFAULT_PIPELINE_CONFIG.vignetteDarkness).toBe(0.15);
      const element = PostProcessingPipeline({});
      expect(element).not.toBeNull();
    });

    it('[TC-223.15/MSS][UC-IMP223][Facet-5/CinematicOverlayDualLayerSSR] renderToStaticMarkup(<CinematicOverlay />) kết xuất HTML chứa cả 2 lớp gradient tối góc và các lớp phủ macro mà không ném ngoại lệ', () => {
      let html = '';
      expect(() => {
        html = renderToStaticMarkup(React.createElement(CinematicOverlay));
      }).not.toThrow();
      // Lớp 1A: Lens Vignette Tiêu chuẩn (xanh cyan)
      expect(html).toContain('rgba(12, 74, 110, 0.32)');
      // Lớp 1B: Lens Vignette Đấu Giá Kịch Nghệ Tím Than (tập trung thị giác)
      expect(html).toContain('rgba(15, 23, 42, 0.70)');
      // Lớp chuyển tiếp mượt mà 60 FPS
      expect(html).toContain('transition-opacity');
    });

    it('[TC-223.16/MSS][UC-IMP223][Facet-5/TimeOfDayLightingBidFlashSignature] TimeOfDayLighting duy trì trọn vẹn data-testid="time-of-day-lighting" và export đầy đủ calculateBidFlashIntensity', () => {
      expect(typeof calculateBidFlashIntensity).toBe('function');
      const lightingPath = path.resolve(process.cwd(), 'src/client/3d/time_of_day_lighting.tsx');
      const lightingSource = fs.readFileSync(lightingPath, 'utf-8');
      expect(lightingSource).toContain('data-testid="time-of-day-lighting"');
      expect(lightingSource).toContain('export function calculateBidFlashIntensity');
    });
  });
});
