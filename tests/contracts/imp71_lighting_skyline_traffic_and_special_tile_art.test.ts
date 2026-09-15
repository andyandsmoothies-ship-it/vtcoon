// [TC-71/MSS][IMP-71] Contract Test Suite: Daytime Lighting, Bitexco Skyline, Traffic Reduction & Special Tile Art
// Facet 1: Daytime Lighting Glare Mitigation & Typography Contrast
// Facet 2: Architectural Skyline Diversity & Bitexco Plaza
// Facet 3: 50% Micro-Traffic Reduction & Roadway Decoupling
// Facet 4: Special Tile Art & 4 Corners Artwork Support

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TIME_OF_DAY_PRESETS } from '../../src/client/store/environment_store';
import { DioramaSkyline } from '../../src/client/3d/diorama/diorama_skyline';
import {
  HIGHRISE_CONFIGS,
  DioramaHighriseBlocks,
} from '../../src/client/3d/diorama/diorama_highrise_blocks';
import { MICRO_VEHICLES } from '../../src/client/3d/diorama/diorama_traffic';
import { DioramaMicroLife } from '../../src/client/3d/diorama/diorama_microlife';
import {
  hasTileArt,
  getTileTexture,
  getBannerTextColor,
  clearTileTextureCache,
} from '../../src/client/3d/tile_texture_generator';

describe('[TC-71/MSS][IMP-71] Lighting, Skyline, Traffic & Special Tile Art Contract Suite', () => {
  let originalConsoleError: typeof console.error;
  let originalDocument: unknown;
  let skylineMarkup = '';
  let highriseMarkup = '';
  let microLifeMarkup = '';

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (msg.includes('is using incorrect casing') || msg.includes('does not recognize the')) return;
      originalConsoleError(...args);
    };

    skylineMarkup = renderToStaticMarkup(React.createElement(DioramaSkyline));
    highriseMarkup = renderToStaticMarkup(React.createElement(DioramaHighriseBlocks));
    microLifeMarkup = renderToStaticMarkup(React.createElement(DioramaMicroLife));
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    clearTileTextureCache();
    originalDocument = (globalThis as Record<string, unknown>).document;

    const mockCtx = new Proxy(
      { fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: '', textBaseline: '' } as Record<string, unknown>,
      {
        get: (target, prop) => {
          if (prop in target) return target[prop as string];
          if (typeof prop === 'string') return (..._args: unknown[]) => {};
          return undefined;
        },
        set: (target, prop, value) => {
          target[prop as string] = value;
          return true;
        },
      }
    );

    const mockCanvas = { width: 0, height: 0, getContext: vi.fn(() => mockCtx) };
    (globalThis as Record<string, unknown>).document = {
      createElement: (tag: string) => (tag === 'canvas' ? mockCanvas : {}),
    };
  });

  afterEach(() => {
    (globalThis as Record<string, unknown>).document = originalDocument;
    clearTileTextureCache();
  });

  // =========================================================================
  // FACET 1: DAYTIME LIGHTING GLARE MITIGATION & TYPOGRAPHY CONTRAST
  // =========================================================================
  describe('Facet 1: Daytime Lighting Glare Mitigation & Typography Contrast', () => {
    it('[TC-71.01/MSS][IMP-71] TIME_OF_DAY_PRESETS.day.sunIntensity reduces to <= 0.80 for glare-free readability', () => {
      expect(TIME_OF_DAY_PRESETS.day.sunIntensity).toBeLessThanOrEqual(0.80);
    });

    it('[TC-71.02/MSS][IMP-71] TIME_OF_DAY_PRESETS.day.ambientColor transitions to cool soothing #F0F9FF', () => {
      expect(TIME_OF_DAY_PRESETS.day.ambientColor.toUpperCase()).toBe('#F0F9FF');
    });

    it('[TC-71.03/MSS][IMP-71] TIME_OF_DAY_PRESETS.day.ambientIntensity maintains balanced illumination <= 0.20', () => {
      expect(TIME_OF_DAY_PRESETS.day.ambientIntensity).toBeLessThanOrEqual(0.20);
      expect(TIME_OF_DAY_PRESETS.day.ambientIntensity).toBeGreaterThanOrEqual(0.15);
    });

    it('[TC-71.04/MSS][IMP-71] TIME_OF_DAY_PRESETS.day.hemiIntensity maintains soft sky fill <= 0.14', () => {
      expect(TIME_OF_DAY_PRESETS.day.hemiIntensity).toBeLessThanOrEqual(0.14);
    });

    it('[TC-71.05/MSS][IMP-71] getBannerTextColor selects dark charcoal on bright ivory background', () => {
      expect(getBannerTextColor('#FFFDF5')).toBe('#090D1A');
    });

    it('[TC-71.06/MSS][IMP-71] getBannerTextColor selects crisp white on deep blue background', () => {
      expect(getBannerTextColor('#0284C7')).toBe('#FFFFFF');
    });
  });

  // =========================================================================
  // FACET 2: ARCHITECTURAL SKYLINE DIVERSITY & BITEXCO PLAZA
  // =========================================================================
  describe('Facet 2: Architectural Skyline Diversity & Bitexco Plaza', () => {
    it('[TC-71.07/MSS][IMP-71] DioramaSkyline renders Bitexco commercial podium at ground base', () => {
      expect(skylineMarkup).toContain('data-testid="bitexco-podium"');
    });

    it('[TC-71.08/MSS][IMP-71] DioramaSkyline renders pedestrian Bitexco Plaza with stone pavement', () => {
      expect(skylineMarkup).toContain('data-testid="bitexco-plaza"');
    });

    it('[TC-71.09/MSS][IMP-71] DioramaHighriseBlocks incorporates prismatic typology geometry', () => {
      expect(highriseMarkup).toContain('data-testid="highrise-prismatic"');
    });

    it('[TC-71.10/MSS][IMP-71] DioramaHighriseBlocks incorporates stepped terrace sky-garden typology', () => {
      expect(highriseMarkup).toContain('data-testid="highrise-stepped"');
    });

    it('[TC-71.11/MSS][IMP-71] DioramaHighriseBlocks incorporates curved riverfront facade typology', () => {
      expect(highriseMarkup).toContain('data-testid="highrise-curved"');
    });

    it('[TC-71.12/MSS][IMP-71] DioramaHighriseBlocks incorporates crowned Art Deco typology', () => {
      expect(highriseMarkup).toContain('data-testid="highrise-crowned"');
    });
  });

  // =========================================================================
  // FACET 3: 50% MICRO-TRAFFIC REDUCTION & ROADWAY DECOUPLING
  // =========================================================================
  describe('Facet 3: 50% Micro-Traffic Reduction & Roadway Decoupling', () => {
    it('[TC-71.13/MSS][IMP-71] MICRO_VEHICLES fleet is cut down to at most 4 vehicles', () => {
      expect(MICRO_VEHICLES.length).toBeLessThanOrEqual(4);
    });

    it('[TC-71.14/MSS][IMP-71] MICRO_VEHICLES outer boulevard track is limited to at most 2 vehicles', () => {
      const outerCount = MICRO_VEHICLES.filter((v) => v.track === 'outer').length;
      expect(outerCount).toBeLessThanOrEqual(2);
    });

    it('[TC-71.15/MSS][IMP-71] MICRO_VEHICLES inner boulevard track is limited to at most 2 vehicles', () => {
      const innerCount = MICRO_VEHICLES.filter((v) => v.track === 'inner').length;
      expect(innerCount).toBeLessThanOrEqual(2);
    });

    it('[TC-71.16/MSS][IMP-71] MICRO_VEHICLES outer track vehicles maintain distinct offset spacing >= 0.20', () => {
      const outer = MICRO_VEHICLES.filter((v) => v.track === 'outer');
      const first = outer[0];
      const second = outer[1];
      const minGap = first && second ? Math.abs(first.offset - second.offset) : 1.0;
      expect(minGap).toBeGreaterThanOrEqual(0.20);
    });

    it('[TC-71.17/MSS][IMP-71] DioramaMicroLife removes parked sports car #DC2626 to declutter sidewalks', () => {
      expect(microLifeMarkup).not.toContain('#DC2626');
    });

    it('[TC-71.18/MSS][IMP-71] DioramaMicroLife removes parked green car #16A34A to widen pedestrian corridor', () => {
      expect(microLifeMarkup).not.toContain('#16A34A');
    });
  });

  // =========================================================================
  // FACET 4: SPECIAL TILE ART & 4 CORNERS ARTWORK SUPPORT
  // =========================================================================
  describe('Facet 4: Special Tile Art & 4 Corners Artwork Support', () => {
    it.each([0, 2, 4, 7, 10, 20, 30, 38])(
      '[TC-71.19/MSS][IMP-71] hasTileArt(%i) returns true for special or corner tile',
      (idx) => {
        expect(hasTileArt(idx)).toBe(true);
      }
    );

    it.each([0, 2, 4, 7, 10, 20, 30, 38])(
      '[TC-71.20/MSS][IMP-71] getTileTexture(%i) creates valid CanvasTexture for special or corner tile',
      (idx) => {
        clearTileTextureCache();
        const tex = getTileTexture(idx);
        expect(tex).not.toBeNull();
      }
    );
  });
});
