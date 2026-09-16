// [TC-84/MSS][IMP-84][UC-084] Contract Test Suite: Bitexco Waterfront Skyline Realism
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Tháp Bitexco Búp Sen Khí Động Học & Kính Băng Tuyết (TC-84.01 -> TC-84.04)
// Facet 2: Sân Đỗ Trực Thăng Cantilever & Trực Thăng Siêu Vi Mô (TC-84.05 -> TC-84.08)
// Facet 3: Tòa Nhà Di Sản Mái Ngói Terracotta & Bến Tàu Ven Sông (TC-84.09 -> TC-84.12)
// Facet 4: Quần Thể Cao Ốc Bao Quanh Bám Sát Ảnh Thực Tế & Bảo Toàn Quy Chuẩn (TC-84.13 -> TC-84.16)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DioramaSkyline } from '../../src/client/3d/diorama/diorama_skyline';
import {
  HIGHRISE_CONFIGS,
  DioramaHighriseBlocks,
} from '../../src/client/3d/diorama/diorama_highrise_blocks';

describe('[TC-84/MSS][IMP-84][UC-084] Bitexco Waterfront Skyline Realism Contract Suite', () => {
  let originalConsoleError: typeof console.error;
  let skylineMarkup = '';
  let highriseMarkup = '';

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) {
        return;
      }
      originalConsoleError(...args);
    };

    skylineMarkup = renderToStaticMarkup(React.createElement(DioramaSkyline));
    highriseMarkup = renderToStaticMarkup(React.createElement(DioramaHighriseBlocks));
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // =========================================================================
  // FACET 1: THÁP BITEXCO BÚP SEN KHÍ ĐỘNG HỌC & KÍNH BĂNG TUYẾT
  // =========================================================================
  describe('Facet 1: Tháp Bitexco Búp Sen Khí Động Học & Kính Băng Tuyết', () => {
    it('[TC-84.01/MSS][IMP-84] Bitexco tọa lạc đúng tọa độ trung tâm [-4.5, 0.16, -4.4] và đỉnh tháp đạt độ cao vươn nổi bật y >= 2.85', () => {
      expect(skylineMarkup).toContain('-4.5,0.16,-4.4');
      const hasSpireApex =
        skylineMarkup.includes('position="0,2.85,0"') ||
        skylineMarkup.includes('position="0,2.95,0"');
      expect(hasSpireApex).toBe(true);
    });

    it('[TC-84.02/MSS][IMP-84] Thân tháp có dáng búp sen cong khí động học với lớp vỏ cánh sen ôm lấy thân data-testid="bitexco-lotus-sheath"', () => {
      expect(skylineMarkup).toContain('data-testid="bitexco-lotus-sheath"');
    });

    it('[TC-84.03/MSS][IMP-84] Bề mặt tháp tích hợp bảng màu kính cyan / băng tuyết (#7DD3FC hoặc #BAE6FD hoặc #38BDF8) và viền bạc #E2E8F0', () => {
      const hasCyanIceGlass = /#7DD3FC|#BAE6FD|#38BDF8/i.test(skylineMarkup);
      const hasSilverTrim = /#E2E8F0/i.test(skylineMarkup);
      expect(hasCyanIceGlass).toBe(true);
      expect(hasSilverTrim).toBe(true);
    });

    it('[TC-84.04/MSS][IMP-84] Đỉnh tháp cắt vát chéo cánh sen hé nở data-testid="bitexco-crown" tích hợp kim thu lôi #F59E0B và đèn cảnh báo tĩnh không đỏ #EF4444', () => {
      expect(skylineMarkup).toContain('data-testid="bitexco-crown"');
      expect(skylineMarkup).toContain('#F59E0B');
      expect(skylineMarkup).toContain('#EF4444');
    });
  });

  // =========================================================================
  // FACET 2: SÂN ĐỖ TRỰC THĂNG CANTILEVER & TRỰC THĂNG SIÊU VI MÔ
  // =========================================================================
  describe('Facet 2: Sân Đỗ Trực Thăng Cantilever & Trực Thăng Siêu Vi Mô', () => {
    it('[TC-84.05/MSS][IMP-84] Sân đỗ trực thăng Helipad data-testid="bitexco-helipad" vươn ra hướng sông tại y trong khoảng [1.60, 1.75]', () => {
      expect(skylineMarkup).toContain('data-testid="bitexco-helipad"');
      const helipadTagMatch =
        skylineMarkup.match(/<[^>]*data-testid="bitexco-helipad"[^>]*>/i) ||
        skylineMarkup.match(/<[^>]*position="([^"]*)"[^>]*data-testid="bitexco-helipad"/i);
      const tagContent = helipadTagMatch ? helipadTagMatch[0] : '';
      const posMatch = tagContent.match(/position="([^"]+)"/);
      const coords = posMatch?.[1] ? posMatch[1].split(',').map(Number) : [0, 0, 0];
      const yPos = coords[1] ?? 0;
      expect(yPos).toBeGreaterThanOrEqual(1.60);
      expect(yPos).toBeLessThanOrEqual(1.75);
    });

    it('[TC-84.06/MSS][IMP-84] Sân trực thăng có kết cấu khung đỡ hình nón cụt / dầm giàn xiên data-testid="helipad-truss" bên dưới', () => {
      expect(skylineMarkup).toContain('data-testid="helipad-truss"');
    });

    it('[TC-84.07/MSS][IMP-84] Sân trực thăng có vòng tròn đỗ trực thăng phản quang #F59E0B', () => {
      expect(skylineMarkup).toContain('#F59E0B');
    });

    it('[TC-84.08/MSS][IMP-84] Trực thăng siêu vi mô data-testid="micro-helicopter" đậu trên bãi đỗ với thân máy bay và cánh quạt', () => {
      expect(skylineMarkup).toContain('data-testid="micro-helicopter"');
    });
  });

  // =========================================================================
  // FACET 3: TÒA NHÀ DI SẢN MÁI NGÓI TERRACOTTA & BẾN TÀU VEN SÔNG
  // =========================================================================
  describe('Facet 3: Tòa Nhà Di Sản Mái Ngói Terracotta & Bến Tàu Ven Sông', () => {
    it('[TC-84.09/MSS][IMP-84] Hiện diện tòa nhà di sản ven sông data-testid="colonial-waterfront-heritage" tại tiền cảnh Bitexco', () => {
      expect(skylineMarkup).toContain('data-testid="colonial-waterfront-heritage"');
    });

    it('[TC-84.10/MSS][IMP-84] Tòa di sản sử dụng mái ngói dốc 4 phía màu đỏ đất nung Terracotta (#C2410C hoặc #EA580C) và tường vàng kem Indochine (#FEF08A hoặc #FDE047)', () => {
      const hasTerracottaRoof = /#C2410C|#EA580C/i.test(skylineMarkup);
      const hasIndochineWall = /#FEF08A|#FDE047/i.test(skylineMarkup);
      expect(hasTerracottaRoof).toBe(true);
      expect(hasIndochineWall).toBe(true);
    });

    it('[TC-84.11/MSS][IMP-84] Tòa di sản tích hợp dãy cửa vòm cuốn cổ điển màu trắng sáng (#F8FAFC)', () => {
      expect(skylineMarkup).toContain('#F8FAFC');
    });

    it('[TC-84.12/MSS][IMP-84] Bờ kè tiền cảnh tích hợp bến tàu thủy buýt Saigon Waterbus data-testid="waterfront-waterbus"', () => {
      expect(skylineMarkup).toContain('data-testid="waterfront-waterbus"');
    });
  });

  // =========================================================================
  // FACET 4: QUẦN THỂ CAO ỐC BAO QUANH BÁM SÁT ẢNH THỰC TẾ & BẢO TOÀN QUY CHUẨN
  // =========================================================================
  describe('Facet 4: Quần Thể Cao Ốc Bao Quanh Bám Sát Ảnh Thực Tế & Bảo Toàn Quy Chuẩn', () => {
    it('[TC-84.13/MSS][IMP-84] Quần thể cao ốc duy trì đúng 10 tháp (HIGHRISE_CONFIGS.length === 10), khoảng cách >= 0.85m so với Bitexco', () => {
      expect(HIGHRISE_CONFIGS).toHaveLength(10);
      const distances = HIGHRISE_CONFIGS.map((tower) =>
        Math.hypot(tower.x - (-4.5), tower.z - (-4.4))
      );
      const minDistance = Math.min(...distances);
      expect(minDistance).toBeGreaterThanOrEqual(0.85);
    });

    it('[TC-84.14/MSS][IMP-84] Cánh phải tích hợp cao ốc phong cách Bitraco với mặt kính xanh ngọc bích ô vuông (#0D9488 hoặc #14B8A6) và khung trắng', () => {
      const hasEmeraldGlass = /#0D9488|#14B8A6/i.test(highriseMarkup);
      const hasWhiteFrame = /#FFFFFF|#F8FAFC/i.test(highriseMarkup);
      expect(hasEmeraldGlass).toBe(true);
      expect(hasWhiteFrame).toBe(true);
    });

    it('[TC-84.15/MSS][IMP-84] Cánh trái tích hợp cao ốc phong cách lam đứng chắn nắng xám trung tính (#94A3B8 hoặc #64748B)', () => {
      const hasNeutralLouver = /#94A3B8|#64748B/i.test(highriseMarkup);
      expect(hasNeutralLouver).toBe(true);
    });

    it('[TC-84.16/MSS][IMP-84] Cả hai component DioramaSkyline và DioramaHighriseBlocks render an toàn không throw trong headless SSR', () => {
      expect(skylineMarkup.length).toBeGreaterThan(0);
      expect(highriseMarkup.length).toBeGreaterThan(0);
    });
  });
});
