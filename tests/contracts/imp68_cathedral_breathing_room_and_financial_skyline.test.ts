// [TC-68/MSS][IMP-68] Contract: Cathedral Breathing Room & Northwest Financial Skyline Overhaul
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Cathedral Clearance & Cong Xa Paris Ensemble
// Facet 2: Elimination of Dark Blue Highrise Wash & Natural Material Palette
// Facet 3: Spatial Boundary & Count Invariants
// Facet 4: Error Defense & Headless Safety

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SHOPHOUSE_CONFIGS } from '../../src/client/3d/diorama/diorama_shophouse_blocks';
import {
  HIGHRISE_CONFIGS,
  DioramaHighriseBlocks,
} from '../../src/client/3d/diorama/diorama_highrise_blocks';
import { DioramaHeritageDistrict } from '../../src/client/3d/diorama/diorama_heritage_district';
import { DioramaSkyline } from '../../src/client/3d/diorama/diorama_skyline';
import {
  createHighriseFacadeTexture,
  createShophouseFacadeTexture,
  clearFacadeTextureCache,
} from '../../src/client/3d/facade_texture_generator';

const choLonShophouses = SHOPHOUSE_CONFIGS.filter((s) => s.id.startsWith('sh-cl'));
const marinaShophouses = SHOPHOUSE_CONFIGS.filter((s) => s.id.startsWith('sh-marina'));
const CATHEDRAL_WORLD_POS = { x: -4.3, z: 3.65 };

describe('[TC-68/MSS][IMP-68] Cathedral Breathing Room & Northwest Financial Skyline Overhaul', () => {
  let originalConsoleError: typeof console.error;
  let heritageMarkup = '';
  let highriseMarkup = '';
  let skylineMarkup = '';

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

    heritageMarkup = renderToStaticMarkup(React.createElement(DioramaHeritageDistrict));
    highriseMarkup = renderToStaticMarkup(React.createElement(DioramaHighriseBlocks));
    skylineMarkup = renderToStaticMarkup(React.createElement(DioramaSkyline));
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // =========================================================================
  // FACET 1: NHÀ THỜ ĐỨC BÀ CLEARANCE & CÔNG XÃ PARIS ENSEMBLE
  // =========================================================================
  describe('Facet 1: Nhà Thờ Đức Bà Clearance & Công Xã Paris Ensemble', () => {
    it.each(choLonShophouses.map((sh) => [sh.id, sh.x, sh.z]))(
      '[TC-68.01/MSS][IMP-68] Cho Lon shophouse %s duy tri khoang cach an toan >= 0.95m voi Nha Tho Duc Ba',
      (_id, x, z) => {
        const distance = Math.hypot(x - CATHEDRAL_WORLD_POS.x, z - CATHEDRAL_WORLD_POS.z);
        expect(distance).toBeGreaterThanOrEqual(0.95);
      }
    );

    it('[TC-68.02/MSS][IMP-68][IMP-69 Reconciled] DioramaHeritageDistrict da loai bo Buu dien khoi mat tien Nha tho de giai phong tam nhin', () => {
      expect(heritageMarkup).not.toContain('data-testid="saigon-central-post-office"');
    });

    it('[TC-68.03/MSS][IMP-68][IMP-69 Reconciled] DioramaHeritageDistrict the hien bang mau di san dac trung (#FDE047/#FEF3C7 & #B45309)', () => {
      const hasYellowWall = heritageMarkup.includes('#FDE047') || heritageMarkup.includes('#FEF3C7');
      const hasAccent = heritageMarkup.includes('#B45309');
      expect(hasYellowWall).toBe(true);
      expect(hasAccent).toBe(true);
    });

    it('[TC-68.04/MSS][IMP-68] DioramaHeritageDistrict tich hop Quang truong Cong xa Paris', () => {
      expect(heritageMarkup).toContain('data-testid="cong-xa-paris-plaza"');
    });

    it('[TC-68.05/MSS][IMP-68] DioramaSkyline da loai bo can biet thu vuon cu tai [-4.5, 0.025, 4.2]', () => {
      expect(skylineMarkup).not.toContain('-4.5,0.025,4.2');
      expect(skylineMarkup).not.toContain('[-4.5, 0.025, 4.2]');
    });
  });

  // =========================================================================
  // FACET 2: ELIMINATION OF DARK BLUE HIGHRISE WASH & NATURAL MATERIAL PALETTE
  // =========================================================================
  describe('Facet 2: Elimination of Dark Blue Highrise Wash & Natural Material Palette', () => {
    it('[TC-68.06/MSS][IMP-68] Than thap cao oc khong con bi phu mau xanh dam dac quanh (#0284C7)', () => {
      expect(highriseMarkup).not.toContain('color="#0284C7"');
    });

    it('[TC-68.07/MSS][IMP-68] Vat lieu than thap cao oc su dung tong trung tinh trang/bac (#FFFFFF hoac #F8FAFC)', () => {
      const hasNeutralTint =
        highriseMarkup.includes('color="#FFFFFF"') ||
        highriseMarkup.includes('color="#F8FAFC"') ||
        highriseMarkup.includes('#FFFFFF') ||
        highriseMarkup.includes('#F8FAFC');
      expect(hasNeutralTint).toBe(true);
    });

    it('[TC-68.08/MSS][IMP-68] Dinh hoac tang giat cap cao oc bo sung vuon chan may (#15803D) hoac kim loai champagne (#F59E0B)', () => {
      const hasCrownAccent = highriseMarkup.includes('#15803D') || highriseMarkup.includes('#F59E0B');
      expect(hasCrownAccent).toBe(true);
    });
  });

  // =========================================================================
  // FACET 3: SPATIAL BOUNDARY & COUNT INVARIANTS
  // =========================================================================
  describe('Facet 3: Spatial Boundary & Count Invariants', () => {
    it('[TC-68.09/MSS][IMP-68] Tong so shophouse bao toan dung 32 can (24 Cho Lon, 8 Marina)', () => {
      expect(SHOPHOUSE_CONFIGS).toHaveLength(32);
      expect(choLonShophouses).toHaveLength(24);
      expect(marinaShophouses).toHaveLength(8);
    });

    it('[TC-68.10/MSS][IMP-68][IMP-69 Reconciled] Cum cao oc tai chinh duoc tinh gon ve dung 10 thap giat cap bao quanh Bitexco', () => {
      expect(HIGHRISE_CONFIGS).toHaveLength(10);
    });

    it.each(HIGHRISE_CONFIGS.map((t) => [t.id, t.z, t.height]))(
      '[TC-68.11/MSS][IMP-68] Thap cao oc %s duy tri toa do z (%f <= -2.4) va chieu cao (%f in (0, 3.2])',
      (_id, z, height) => {
        expect(z).toBeLessThanOrEqual(-2.4);
        expect(height).toBeGreaterThan(0);
        expect(height).toBeLessThanOrEqual(3.2);
      }
    );

    it.each(choLonShophouses.map((sh) => [sh.id, sh.x, sh.z]))(
      '[TC-68.12/MSS][IMP-68] Shophouse Cho Lon %s (x: %f, z: %f) nam trong ranh gioi X in [-6.0, -3.0], Z in [1.5, 6.5]',
      (_id, x, z) => {
        expect(x).toBeGreaterThanOrEqual(-6.0);
        expect(x).toBeLessThanOrEqual(-3.0);
        expect(z).toBeGreaterThanOrEqual(1.5);
        expect(z).toBeLessThanOrEqual(6.5);
      }
    );
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & HEADLESS SAFETY
  // =========================================================================
  describe('Facet 4: Error Defense & Headless Safety', () => {
    it('[TC-68.13/MSS][IMP-68] DioramaHeritageDistrict render doc lap trong Node.js headless khong throw', () => {
      expect(() => renderToStaticMarkup(React.createElement(DioramaHeritageDistrict))).not.toThrow();
    });

    it('[TC-68.14/MSS][IMP-68] DioramaHighriseBlocks render doc lap trong Node.js headless khong throw', () => {
      expect(() => renderToStaticMarkup(React.createElement(DioramaHighriseBlocks))).not.toThrow();
    });

    it('[TC-68.15/MSS][IMP-68] createHighriseFacadeTexture hoat dong an toan trong headless fallback', () => {
      const tex = createHighriseFacadeTexture();
      expect(tex).toBeDefined();
      expect(tex.isTexture).toBe(true);
    });

    it('[TC-68.16/MSS][IMP-68] createShophouseFacadeTexture hoat dong an toan trong headless fallback', () => {
      const tex = createShophouseFacadeTexture();
      expect(tex).toBeDefined();
      expect(tex.isTexture).toBe(true);
    });

    it('[TC-68.17/MSS][IMP-68] clearFacadeTextureCache giai phong bo nho khong gay loi', () => {
      expect(() => clearFacadeTextureCache()).not.toThrow();
    });
  });
});
