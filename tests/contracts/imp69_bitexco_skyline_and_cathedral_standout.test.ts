// [TC-69/MSS][IMP-69] Contract: Bitexco Skyline Centerpiece & Cathedral Standout Heritage Overhaul
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Cathedral Standout & Elimination of Central Post Office
// Facet 2: Bitexco Financial Landmark Centerpiece
// Facet 3: Exactly 10 High-Rise Towers Framing Bitexco
// Facet 4: Error Defense & Headless Safety

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  HIGHRISE_CONFIGS,
  DioramaHighriseBlocks,
} from '../../src/client/3d/diorama/diorama_highrise_blocks';
import {
  DioramaHeritageDistrict,
  LANDMARK_MODEL_URLS,
} from '../../src/client/3d/diorama/diorama_heritage_district';
import { DioramaSkyline } from '../../src/client/3d/diorama/diorama_skyline';
import {
  createHighriseFacadeTexture,
  clearFacadeTextureCache,
} from '../../src/client/3d/facade_texture_generator';

const BITEXCO_CENTER = { x: -4.5, z: -4.4 };

describe('[TC-69/MSS][IMP-69] Bitexco Skyline Centerpiece & Cathedral Standout Heritage Overhaul', () => {
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
  // FACET 1: CATHEDRAL STANDOUT & ELIMINATION OF CENTRAL POST OFFICE
  // =========================================================================
  describe('Facet 1: Cathedral Standout & Elimination of Central Post Office', () => {
    it('[TC-69.01/MSS][IMP-69] DioramaHeritageDistrict da loai bo hoan toan Buu dien Trung tam Sai Gon', () => {
      expect(heritageMarkup).not.toContain('data-testid="saigon-central-post-office"');
    });

    it('[TC-69.02/MSS][IMP-69] DioramaHeritageDistrict khong con chi tiet cua chop Indochine cua Buu dien', () => {
      expect(heritageMarkup).not.toContain('po-shutters');
    });

    it('[TC-69.03/MSS][IMP-69] DioramaHeritageDistrict bao toan Quang truong Cong xa Paris & Tuong Duc Me', () => {
      expect(heritageMarkup).toContain('data-testid="cong-xa-paris-plaza"');
      expect(heritageMarkup).toContain('#CBD5E1');
    });

    it('[TC-69.04/MSS][IMP-69] DioramaHeritageDistrict tich hop mo hinh hoac fallback Nha Tho Duc Ba', () => {
      expect(LANDMARK_MODEL_URLS.cathedral).toBe('/models/landmarks/landmark_cathedral.glb');
      expect(heritageMarkup).toContain('models/landmarks/landmark_cathedral.glb');
    });

    it('[TC-69.05/MSS][IMP-69] DioramaHeritageDistrict the hien cua so hoa hong & gian thanh duong gach do Nha Tho', () => {
      expect(heritageMarkup).toContain('#B45309');
      expect(heritageMarkup).toContain('#38BDF8');
    });
  });

  // =========================================================================
  // FACET 2: BITEXCO FINANCIAL LANDMARK CENTERPIECE
  // =========================================================================
  describe('Facet 2: Bitexco Financial Landmark Centerpiece', () => {
    it('[TC-69.06/MSS][IMP-69] Thap Bitexco dat tai trung tam phan khu tai chinh [-4.5, 0.16, -4.4]', () => {
      expect(skylineMarkup).toContain('-4.5,0.16,-4.4');
    });

    it('[TC-69.07/MSS][IMP-69] Thap Bitexco su dung vat lieu kinh sapphire phan quang (#0284C7)', () => {
      expect(skylineMarkup).toContain('#0284C7');
    });

    it('[TC-69.08/MSS][IMP-69] Thap Bitexco tich hop dai quan sat Saigon Skydeck (#38BDF8)', () => {
      expect(skylineMarkup).toContain('#38BDF8');
    });

    it('[TC-69.09/MSS][IMP-69] Thap Bitexco tich hop san do truc thang chia ra huong song (#E2E8F0 hoac #F59E0B)', () => {
      expect(skylineMarkup).toContain('#E2E8F0');
      expect(skylineMarkup).toContain('#F59E0B');
    });

    it('[TC-69.10/MSS][IMP-69] Thap Bitexco tich hop kim thu loi ma vang tren dinh', () => {
      expect(skylineMarkup).toContain('#F59E0B');
    });

    it('[TC-69.11/MSS][IMP-69] Thap Bitexco tich hop den canh bao hang khong do (#EF4444)', () => {
      expect(skylineMarkup).toContain('#EF4444');
    });
  });

  // =========================================================================
  // FACET 3: EXACTLY 10 HIGH-RISE TOWERS FRAMING BITEXCO
  // =========================================================================
  describe('Facet 3: Exactly 10 High-Rise Towers Framing Bitexco', () => {
    it('[TC-69.12/MSS][IMP-69] Cum cao oc tai chinh duoc tinh gon ve dung 10 toa nha', () => {
      expect(HIGHRISE_CONFIGS).toHaveLength(10);
    });

    it.each(HIGHRISE_CONFIGS.map((t) => [t.id, t.z]))(
      '[TC-69.13/MSS][IMP-69] Thap %s duy tri hanh lang lui sau z <= -2.4',
      (_id, z) => {
        expect(z).toBeLessThanOrEqual(-2.4);
      }
    );

    it.each(HIGHRISE_CONFIGS.map((t) => [t.id, t.height]))(
      '[TC-69.14/MSS][IMP-69] Thap %s co chieu cao giat cap trong khoang (0, 2.8]',
      (_id, height) => {
        expect(height).toBeGreaterThan(0);
        expect(height).toBeLessThanOrEqual(2.8);
      }
    );

    it.each(HIGHRISE_CONFIGS.map((t) => [t.id, t.x, t.z]))(
      '[TC-69.15/MSS][IMP-69] Thap %s duy tri khoang cach thong thoang >= 0.85m voi Thap Bitexco [-4.5, -4.4]',
      (_id, x, z) => {
        const distance = Math.hypot(x - BITEXCO_CENTER.x, z - BITEXCO_CENTER.z);
        expect(distance).toBeGreaterThanOrEqual(0.85);
      }
    );
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & HEADLESS SAFETY
  // =========================================================================
  describe('Facet 4: Error Defense & Headless Safety', () => {
    it('[TC-69.16/MSS][IMP-69] DioramaHeritageDistrict render doc lap trong Node.js headless khong throw', () => {
      expect(() => renderToStaticMarkup(React.createElement(DioramaHeritageDistrict))).not.toThrow();
    });

    it('[TC-69.17/MSS][IMP-69] DioramaHighriseBlocks render doc lap trong Node.js headless khong throw', () => {
      expect(() => renderToStaticMarkup(React.createElement(DioramaHighriseBlocks))).not.toThrow();
    });

    it('[TC-69.18/MSS][IMP-69] DioramaSkyline render doc lap trong Node.js headless khong throw', () => {
      expect(() => renderToStaticMarkup(React.createElement(DioramaSkyline))).not.toThrow();
    });

    it('[TC-69.19/MSS][IMP-69] createHighriseFacadeTexture hoat dong an toan trong headless fallback', () => {
      const tex = createHighriseFacadeTexture();
      expect(tex).toBeDefined();
      expect(tex.isTexture).toBe(true);
    });

    it('[TC-69.20/MSS][IMP-69] clearFacadeTextureCache giai phong bo nho khong gay loi', () => {
      expect(() => clearFacadeTextureCache()).not.toThrow();
    });
  });
});
