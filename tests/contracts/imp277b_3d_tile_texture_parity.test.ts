// [TC-277B.01/MSS..TC-277B.06/MSS][UC-IMP277B] 3D Tile Texture Data Parity Contract Test Suite
import { describe, it, expect } from 'vitest';
import { TILE_METADATA_MAP, formatPriceLabel } from '../../src/client/3d/tile_texture_data.js';
import { PROPERTY_DEEDS } from '../../src/domain/property_data.js';

describe('[IMP-277B] Đồng Bộ Nhãn Giá 2.000 Trên Mặt Sa Bàn 3D Cho Ô 12 (EVN) & Ô 28 (Viettel)', () => {
  // =========================================================================
  // FACET 1: TILE METADATA PRICING PARITY (TC-277B.01 .. 02)
  // =========================================================================
  describe('Facet 1: Tile Metadata Pricing Parity', () => {
    it('[TC-277B.01/MSS][UC-IMP277B] TILE_METADATA_MAP ô 12 (EVN) có price chính xác bằng 2000', () => {
      expect(TILE_METADATA_MAP[12]?.price).toBe(2000);
    });

    it('[TC-277B.02/MSS][UC-IMP277B] TILE_METADATA_MAP ô 28 (Viettel) có price chính xác bằng 2000', () => {
      expect(TILE_METADATA_MAP[28]?.price).toBe(2000);
    });
  });

  // =========================================================================
  // FACET 2: FORMATTED PRICE LABEL RENDERING (TC-277B.03 .. 04)
  // =========================================================================
  describe('Facet 2: Formatted Price Label Rendering', () => {
    it('[TC-277B.03/MSS][UC-IMP277B] formatPriceLabel cho ô 12 trả về chuỗi "2.000"', () => {
      expect(formatPriceLabel(TILE_METADATA_MAP[12]?.price)).toBe('2.000');
    });

    it('[TC-277B.04/MSS][UC-IMP277B] formatPriceLabel cho ô 28 trả về chuỗi "2.000"', () => {
      expect(formatPriceLabel(TILE_METADATA_MAP[28]?.price)).toBe('2.000');
    });
  });

  // =========================================================================
  // FACET 3: CATEGORY, BANNER COLOR & DOMAIN HARMONY (TC-277B.05 .. 06)
  // =========================================================================
  describe('Facet 3: Category, Banner Color & Domain Harmony', () => {
    it('[TC-277B.05/MSS][UC-IMP277B] Ô 12 và Ô 28 bảo toàn category "TIỆN ÍCH" và bannerColor "#2563EB"', () => {
      expect(TILE_METADATA_MAP[12]?.category).toBe('TIỆN ÍCH');
      expect(TILE_METADATA_MAP[12]?.bannerColor).toBe('#2563EB');
      expect(TILE_METADATA_MAP[28]?.category).toBe('TIỆN ÍCH');
      expect(TILE_METADATA_MAP[28]?.bannerColor).toBe('#2563EB');
    });

    it('[TC-277B.06/MSS][UC-IMP277B] Giá trên sa bàn 3D khớp 100% với SSOT trong PROPERTY_DEEDS (2000 === 2000)', () => {
      expect(TILE_METADATA_MAP[12]?.price).toBe(PROPERTY_DEEDS.get(12)?.price);
      expect(TILE_METADATA_MAP[28]?.price).toBe(PROPERTY_DEEDS.get(28)?.price);
    });
  });
});
