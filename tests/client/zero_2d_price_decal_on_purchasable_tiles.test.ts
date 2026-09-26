// [TC-IMP102/MSS][UI-S01/MSS][BR-UI-002] Contract Test Suite: Zero 2D Price Decal & Pure 3D Pill Alignment (IMP-102)
// Universal 4-Facet Behavioral Matrix Verification:
// Facet 1: Boundary & Range (Zero 2D price decal roundRect and fillText across 22 Property and 6 Infrastructure tiles)
// Facet 2: State Reactivity & 3D Pill SSOT (OwnerPricePill dynamic pricing, ownership recoloring, mascot reactivity)
// Facet 3: Resource Disposal & Canvas Hygiene (clearTileTextureCache, texture memoization, outer border preservation)
// Facet 4: Error Defense & Invariant Preservation (Action badges preservation on non-property action tiles)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  getTileTexture,
  clearTileTextureCache,
} from '../../src/client/3d/tile_texture_generator';
import {
  OwnerPricePill,
} from '../../src/client/3d/owner_property_markers';
import {
  TILE_METADATA_MAP,
  formatPriceLabel,
} from '../../src/client/3d/tile_texture_data';
import { PROPERTY_DEEDS } from '../../src/domain/property_data';

interface RecordedRoundRect {
  x: number;
  y: number;
  w: number;
  h: number;
  radii?: number | number[];
}

interface RecordedFillText {
  text: string;
  x: number;
  y: number;
  font: string;
  fillStyle: string;
}

interface RecordedStrokeRect {
  x: number;
  y: number;
  w: number;
  h: number;
  lineWidth: number;
  strokeStyle: string;
}

const ALL_22_PROPERTY_TILES = [
  1, 3, 6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26, 27, 29, 31, 32, 34, 37, 39,
] as const;

const ALL_6_INFRASTRUCTURE_TILES = [
  5, 12, 15, 25, 28, 35,
] as const;

const CHANCE_TILES = [7, 22, 36] as const;
const COMMUNITY_CHEST_TILES = [2, 17, 33] as const;
const TAX_ACTION_TILES = [4, 38] as const;

describe('[TC-IMP102/MSS][UI-S01/MSS][BR-UI-002] Zero 2D Price Decal & Pure 3D Pill Alignment Suite', () => {
  let originalDocument: any;
  let recordedRoundRects: RecordedRoundRect[] = [];
  let recordedFillTexts: RecordedFillText[] = [];
  let recordedStrokeRects: RecordedStrokeRect[] = [];
  let currentFont = '';
  let currentFillStyle = '';
  let currentStrokeStyle = '';
  let currentLineWidth = 1;

  beforeEach(() => {
    originalDocument = (globalThis as any).document;
    recordedRoundRects = [];
    recordedFillTexts = [];
    recordedStrokeRects = [];
    currentFont = '';
    currentFillStyle = '';
    currentStrokeStyle = '';
    currentLineWidth = 1;
    clearTileTextureCache();

    const targetCtx: Record<string | symbol, any> = {
      canvas: { width: 1024, height: 1360 },
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillRect: vi.fn(),
      rect: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      strokeText: vi.fn(),
    };

    const mockCtx = new Proxy(targetCtx, {
      get: (target, prop) => {
        if (prop === 'font') return currentFont;
        if (prop === 'fillStyle') return currentFillStyle;
        if (prop === 'strokeStyle') return currentStrokeStyle;
        if (prop === 'lineWidth') return currentLineWidth;
        if (prop === 'fillText') {
          return (text: string, x: number, y: number) => {
            recordedFillTexts.push({
              text,
              x,
              y,
              font: currentFont,
              fillStyle: currentFillStyle,
            });
          };
        }
        if (prop === 'roundRect') {
          return (x: number, y: number, w: number, h: number, radii?: any) => {
            recordedRoundRects.push({ x, y, w, h, radii });
          };
        }
        if (prop === 'strokeRect') {
          return (x: number, y: number, w: number, h: number) => {
            recordedStrokeRects.push({
              x,
              y,
              w,
              h,
              lineWidth: currentLineWidth,
              strokeStyle: currentStrokeStyle,
            });
          };
        }
        if (prop in target) return target[prop];
        if (typeof prop === 'string') return vi.fn();
        return undefined;
      },
      set: (target, prop, value) => {
        if (prop === 'font') currentFont = value;
        if (prop === 'fillStyle') currentFillStyle = value;
        if (prop === 'strokeStyle') currentStrokeStyle = value;
        if (prop === 'lineWidth') currentLineWidth = value;
        target[prop] = value;
        return true;
      },
    });

    const mockCanvas = {
      width: 1024,
      height: 1360,
      getContext: vi.fn(() => mockCtx),
    };

    (globalThis as any).document = {
      createElement: (tag: string) => {
        if (tag === 'canvas') return mockCanvas;
        return {};
      },
    };
  });

  afterEach(() => {
    (globalThis as any).document = originalDocument;
    clearTileTextureCache();
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE - ZERO 2D DECAL ON 28 PURCHASABLE TILES
  // =========================================================================

  describe('[CHỐT 1] Zero 2D Decal trên 22 ô Bất Động Sản', () => {
    it.each(ALL_22_PROPERTY_TILES)(
      '[TC-IMP102.01/MSS][UI-S01/MSS] Property tile %i does NOT render 2D price tray roundRect at y=274',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const priceTray = recordedRoundRects.find(
          (r) => r.y === 274 && r.w === 212 && r.h === 50
        );
        expect(priceTray).toBeUndefined();
      }
    );

    it.each(ALL_22_PROPERTY_TILES)(
      '[TC-IMP102.02/MSS][UI-S01/MSS] Property tile %i renders pure ivory price fillText directly at y=300 in charcoal #0F172A (IMP-104)',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const expectedPriceText = formatPriceLabel(TILE_METADATA_MAP[cellIndex]?.price);
        const priceText = recordedFillTexts.find(
          (t) => t.y === 300 && (expectedPriceText ? t.text === expectedPriceText : true)
        );
        expect(priceText).toBeDefined();
        expect(priceText?.fillStyle).toBe('#0F172A');
      }
    );
  });

  describe('[CHỐT 2] Zero 2D Decal trên 6 ô Hạ Tầng', () => {
    it.each(ALL_6_INFRASTRUCTURE_TILES)(
      '[TC-IMP102.03/MSS][UI-S01/MSS] Infrastructure tile %i does NOT render 2D price tray roundRect at y=274',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const priceTray = recordedRoundRects.find(
          (r) => r.y === 274 && r.w === 212 && r.h === 50
        );
        expect(priceTray).toBeUndefined();
      }
    );

    it.each(ALL_6_INFRASTRUCTURE_TILES)(
      '[TC-IMP102.04/MSS][UI-S01/MSS] Infrastructure tile %i renders pure ivory price fillText directly at y=300 in charcoal #0F172A (IMP-104)',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const expectedPriceText = formatPriceLabel(TILE_METADATA_MAP[cellIndex]?.price);
        const priceText = recordedFillTexts.find(
          (t) => t.y === 300 && (expectedPriceText ? t.text === expectedPriceText : true)
        );
        expect(priceText).toBeDefined();
        expect(priceText?.fillStyle).toBe('#0F172A');
      }
    );
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY - PURE 3D OWNER PRICE PILL (SSOT)
  // =========================================================================

  describe('[CHỐT 4] Bảo tồn và thẩm định 3D OwnerPricePill là SSOT duy nhất', () => {
    it('[TC-IMP102.05/MSS][BR-UI-002] OwnerPricePill renders 3D root group with data-testid="owner-price-pill"', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1, ownerColor: '#EF4444' })
      );
      expect(markup).toContain('data-testid="owner-price-pill"');
      expect(markup).toContain('name="OwnerPricePill"');
    });

    it('[TC-IMP102.06/MSS][BR-UI-002] OwnerPricePill renders price label mesh with data-testid="owner-price-label"', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1, ownerColor: '#EF4444' })
      );
      expect(markup).toContain('data-testid="owner-price-label"');
    });

    it('[TC-IMP102.07/MSS][BR-UI-002] OwnerPricePill dynamically resolves property deed price from cellIndex 1 (600)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1, ownerColor: '#EF4444' })
      );
      expect(markup).toContain('data-price-label="600"');
    });

    it('[TC-IMP102.08/MSS][BR-UI-002] OwnerPricePill dynamically resolves railroad deed price from cellIndex 5 (2.000)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 5, ownerColor: '#EF4444' })
      );
      expect(markup).toContain('data-price-label="2.000"');
    });

    it('[TC-IMP102.09/MSS][BR-UI-002] OwnerPricePill dynamically resolves utility deed price from cellIndex 12 (1.500)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 12, ownerColor: '#EF4444' })
      );
      expect(markup).toContain('data-price-label="1.500"');
    });

    it('[TC-IMP102.10/MSS][BR-UI-002] OwnerPricePill resolves highest value property from cellIndex 39 (4.000)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 39, ownerColor: '#EF4444' })
      );
      expect(markup).toContain('data-price-label="4.000"');
    });

    it('[TC-IMP102.11/MSS][BR-UI-002] OwnerPricePill does NOT render dark slate tone #090D1A when ownerColor is omitted', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1 })
      );
      expect(markup).not.toContain('color="#090D1A"');
    });

    it('[TC-IMP102.12/MSS][BR-UI-002] OwnerPricePill reacts to player ownership by adopting ownerColor #EF4444', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, {
          cellIndex: 1,
          ownerColor: '#EF4444',
        })
      );
      expect(markup).toContain('color="#EF4444"');
    });

    it('[TC-IMP102.13/MSS][BR-UI-002] OwnerPricePill renders owner mascot icon plane when owned with mascotIcon', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, {
          cellIndex: 1,
          ownerColor: '#10B981',
          mascotIcon: 'dragon',
        })
      );
      expect(markup).toContain('data-mascot-icon="dragon"');
      expect(markup).toContain('name="PillMascotIcon_dragon"');
    });

    it('[TC-IMP102.14/MSS][BR-UI-002] OwnerPricePill respects explicit priceLabel prop override when provided', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, {
          cellIndex: 1,
          ownerColor: '#EF4444',
          priceLabel: 'THUÊ 120 TR.',
        })
      );
      expect(markup).toContain('data-price-label="THUÊ 120 TR."');
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & CANVAS HYGIENE
  // =========================================================================

  describe('Canvas Texture Lifecycle & Border Preservation', () => {
    it('[TC-IMP102.15/MSS][UI-S01/MSS] Purchasable tile preserves 5px dark border strokeRect(2, 2, 252, 336)', () => {
      getTileTexture(1);
      const borderEntry = recordedStrokeRects.find(
        (r) => r.w === 252 && r.h === 336
      );
      expect(borderEntry).toBeDefined();
      expect(borderEntry?.lineWidth).toBe(5);
      expect(borderEntry?.strokeStyle).toBe('#0F172A');
    });

    it('[TC-IMP102.16/MSS][UI-S01/MSS] Infrastructure tile preserves 5px dark border strokeRect(2, 2, 252, 336)', () => {
      getTileTexture(5);
      const borderEntry = recordedStrokeRects.find(
        (r) => r.w === 252 && r.h === 336
      );
      expect(borderEntry).toBeDefined();
      expect(borderEntry?.lineWidth).toBe(5);
    });

    it('[TC-IMP102.17/MSS][UI-S01/MSS] clearTileTextureCache empties memoized textures without leaking state', () => {
      const tex1 = getTileTexture(1);
      clearTileTextureCache();
      const tex2 = getTileTexture(1);
      expect(tex1).not.toBeNull();
      expect(tex2).not.toBeNull();
      expect(tex1).not.toBe(tex2);
    });

    it('[TC-IMP102.18/MSS][UI-S01/MSS] getTileTexture returns null safely when document is undefined (Headless SSR)', () => {
      (globalThis as any).document = undefined;
      expect(getTileTexture(1)).toBeNull();
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & NON-PURCHASABLE ACTION BADGE PRESERVATION
  // =========================================================================

  describe('[CHỐT 3] Bảo tồn Action Badges 2D trên các ô phi tài sản', () => {
    it.each(CHANCE_TILES)(
      '[TC-IMP102.19/MSS][UI-S01/MSS] Chance tile %i STILL renders 2D action badge roundRect at y=274',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const actionBadge = recordedRoundRects.find(
          (r) => r.y === 274 && r.w === 216 && r.h === 50
        );
        expect(actionBadge).toBeDefined();
        expect(actionBadge?.radii).toBe(12);
      }
    );

    it.each(CHANCE_TILES)(
      '[TC-IMP102.20/MSS][UI-S01/MSS] Chance tile %i STILL renders action label "RÚT THẺ CƠ HỘI" at y=300',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const actionText = recordedFillTexts.find(
          (t) => t.y === 300 && t.text === 'RÚT THẺ CƠ HỘI'
        );
        expect(actionText).toBeDefined();
        expect(actionText?.fillStyle).toBe('#FFFFFF');
      }
    );

    it.each(COMMUNITY_CHEST_TILES)(
      '[TC-IMP102.21/MSS][UI-S01/MSS] Community Chest tile %i STILL renders 2D action badge roundRect at y=274',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const actionBadge = recordedRoundRects.find(
          (r) => r.y === 274 && r.w === 216 && r.h === 50
        );
        expect(actionBadge).toBeDefined();
      }
    );

    it.each(COMMUNITY_CHEST_TILES)(
      '[TC-IMP102.22/MSS][UI-S01/MSS] Community Chest tile %i STILL renders action label "RÚT THẺ THỊ TRƯỜNG" at y=300',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const actionText = recordedFillTexts.find(
          (t) => t.y === 300 && t.text === 'RÚT THẺ THỊ TRƯỜNG'
        );
        expect(actionText).toBeDefined();
        expect(actionText?.fillStyle).toBe('#FFFFFF');
      }
    );

    it.each(TAX_ACTION_TILES)(
      '[TC-IMP102.23/MSS][UI-S01/MSS] Tax/Financial tile %i STILL renders 2D action badge roundRect at y=274',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const actionBadge = recordedRoundRects.find(
          (r) => r.y === 274 && r.w === 216 && r.h === 50
        );
        expect(actionBadge).toBeDefined();
      }
    );

    it('[TC-IMP102.24/MSS][UI-S01/MSS] Tax tile 4 STILL renders action label "NỘP 1.000" at y=300', () => {
      clearTileTextureCache();
      getTileTexture(4);
      const actionText = recordedFillTexts.find(
        (t) => t.y === 300 && t.text === 'NỘP 1.000'
      );
      expect(actionText).toBeDefined();
      expect(actionText?.fillStyle).toBe('#FFFFFF');
    });

    it('[TC-IMP102.25/MSS][UI-S01/MSS] Financial tile 38 STILL renders action label "1D6 ĐẶT CƯỢC" at y=300', () => {
      clearTileTextureCache();
      getTileTexture(38);
      const actionText = recordedFillTexts.find(
        (t) => t.y === 300 && t.text === '1D6 ĐẶT CƯỢC'
      );
      expect(actionText).toBeDefined();
      expect(actionText?.fillStyle).toBe('#FFFFFF');
    });

    it('[TC-IMP102.26/MSS][BR-UI-002] Out-of-bounds cellIndex in OwnerPricePill renders cleanly without throwing', () => {
      expect(() => {
        renderToStaticMarkup(
          React.createElement(OwnerPricePill, { cellIndex: 999 })
        );
      }).not.toThrow();
    });
  });
});
