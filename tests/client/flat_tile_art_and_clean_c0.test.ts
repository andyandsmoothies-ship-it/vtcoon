// [TC-IMP36/MSS][UC-IMP36] Contract Test Suite: Flat Tile Art & Clean C0 Plot (IMP-36)
// Universal 4-Facet Behavioral Matrix Verification:
// Facet 1: Art Placement & Anti-Overlap Zoning (tile_texture_generator.ts)
// Facet 2: Clean C0 Plot - No Fence (procedural_building.tsx)
// Facet 3: No Standee on Board (board_tile.tsx & board_layout.tsx)
// Facet 4: State Reactivity & Upgrade Progression (levels 1, 2, 3)
// Facet 5: Headless SSR Resilience & Isolation

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProceduralBuilding } from '../../src/client/3d/procedural_building';
import { LayeredDioramaTile } from '../../src/client/3d/board_tile';
import { GameBoard } from '../../src/client/3d/board_layout';
import * as tileTextureGen from '../../src/client/3d/tile_texture_generator';
import { CellType, ColorGroup, type BoardCell } from '../../src/domain/board_config';
import { ALL_28_STAND_TILES, READY_TILES } from '../../src/client/assets/tile_assets';

// Safely obtain hasTileArt export from module
const hasTileArt = (tileTextureGen as { hasTileArt?: (index: number) => boolean }).hasTileArt;

// Mock Drei components that depend on R3F Canvas context
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    Billboard: ({ children, ...props }: any) => React.createElement('billboard', props, children),
    Image: ({ scale, ...props }: any) =>
      React.createElement('drei-image', {
        ...props,
        scale: Array.isArray(scale) ? scale.join(',') : scale,
      }),
  };
});

interface RecordedFillText {
  text: string;
  x: number;
  y: number;
}

interface RecordedRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface RecordedRoundRect {
  x: number;
  y: number;
  w: number;
  h: number;
  radii?: number | number[];
}

const samplePropertyCell: BoardCell = {
  index: 1,
  name: 'Cần Thơ (Cái Răng)',
  type: CellType.Property,
  colorGroup: ColorGroup.Nau,
};

const sampleRailroadCell: BoardCell = {
  index: 5,
  name: 'Bến Xe Miền Tây',
  type: CellType.Railroad,
};

const sampleUtilityCell: BoardCell = {
  index: 12,
  name: 'Tổng Công Ty Điện Lực (EVN)',
  type: CellType.Utility,
};

function extractRootGroupPosition(markup: string): [number, number, number] {
  const match = markup.match(/<group[^>]*\bposition="([^"]+)"/);
  if (!match || !match[1]) return [0, 0, 0];
  const parts = match[1].split(',').map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

describe('[TC-IMP36/MSS][UC-IMP36] Flat Tile Art & Clean C0 Plot Contract Suite', () => {
  let originalDocument: any;
  let recordedFillText: RecordedFillText[] = [];
  let recordedRects: RecordedRect[] = [];
  let recordedRoundRects: RecordedRoundRect[] = [];
  let recordedClips = 0;
  let originalConsoleError: typeof console.error;

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
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    READY_TILES.clear();
    recordedFillText = [];
    recordedRects = [];
    recordedRoundRects = [];
    recordedClips = 0;

    originalDocument = (globalThis as any).document;

    const mockCtx = new Proxy(
      {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        font: '',
        textAlign: '',
        textBaseline: '',
      } as any,
      {
        get: (target, prop) => {
          if (prop === 'fillText') {
            return (text: string, x: number, y: number) => {
              recordedFillText.push({ text, x, y });
            };
          }
          if (prop === 'roundRect') {
            return (x: number, y: number, w: number, h: number, radii?: any) => {
              recordedRoundRects.push({ x, y, w, h, radii });
            };
          }
          if (prop === 'rect') {
            return (x: number, y: number, w: number, h: number) => {
              recordedRects.push({ x, y, w, h });
            };
          }
          if (prop === 'clip') {
            return () => {
              recordedClips++;
            };
          }
          if (prop in target) {
            return target[prop];
          }
          if (typeof prop === 'string') {
            return (..._args: any[]) => {};
          }
          return undefined;
        },
        set: (target, prop, value) => {
          target[prop] = value;
          return true;
        },
      }
    );

    const mockCanvas = {
      width: 0,
      height: 0,
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
    READY_TILES.clear();
  });

  // =========================================================================
  // FACET 1: ART PLACEMENT & ANTI-OVERLAP ZONING (tile_texture_generator.ts)
  // =========================================================================

  it('[TC-IMP36.01/MSS][UC-IMP36] Upper text tier: Title text baseline is positioned at y = 28 within unobstructed zone [16..40]', () => {
    tileTextureGen.getTileTexture(1);
    const titleEntry = recordedFillText.find((t) => t.y === 28);
    expect(titleEntry).toBeDefined();
    expect(titleEntry!.y).toBeGreaterThanOrEqual(16);
    expect(titleEntry!.y).toBeLessThanOrEqual(40);
  });

  it('[TC-IMP36.02/MSS][UC-IMP36] Upper text tier: Subtitle text baseline is positioned at y = 74 within text zone [60..85]', () => {
    tileTextureGen.getTileTexture(3);
    const subtitleEntry = recordedFillText.find((t) => t.y === 74);
    expect(subtitleEntry).toBeDefined();
    expect(subtitleEntry!.y).toBeGreaterThanOrEqual(60);
    expect(subtitleEntry!.y).toBeLessThanOrEqual(85);
  });

  it('[TC-IMP36.03/MSS][UC-IMP36] Bottom price tier: 2D price tray capsule is eliminated on property tiles (e.g. cell 6)', () => {
    tileTextureGen.getTileTexture(6);
    const priceTray = recordedRoundRects.find(
      (r) => r.x === 22 && r.y === 274 && r.w === 212 && r.h === 50
    );
    expect(priceTray).toBeUndefined();
  });

  it('[TC-IMP36.04/MSS][UC-IMP36] Bottom price tier: 2D price text is printed directly on ivory paper at y = 300 in charcoal #0F172A (IMP-104)', () => {
    tileTextureGen.getTileTexture(8);
    const priceText = recordedFillText.find((t) => t.y === 300);
    expect(priceText).toBeDefined();
    expect(priceText?.text).toBe('1.000');
  });

  it('[TC-IMP36.05/MSS][UC-IMP36] Heritage art tier: Safe clipping boundary rect(10, 94, 236, 172) expands art to middle zone [90..270]', () => {
    tileTextureGen.getTileTexture(9);
    const artClip = recordedRects.find(
      (r) => r.x === 10 && r.y >= 90 && r.y <= 98 && r.w === 236
    );
    expect(artClip).toBeDefined();
    expect(recordedClips).toBeGreaterThan(0);
  });

  it('[TC-IMP36.06/MSS][UC-IMP36] Heritage art tier: Expanded art height is clamped to 172 units with zero overlap into text (< 90) or price (> 274)', () => {
    tileTextureGen.getTileTexture(11);
    const artClip = recordedRects.find((r) => r.y >= 90 && r.y <= 98);
    expect(artClip).toBeDefined();
    expect(artClip!.h).toBeLessThanOrEqual(172);
    expect(artClip!.y + artClip!.h).toBeLessThanOrEqual(274);
  });

  it.each([1, 5, 12, 15, 25, 28, 35, 39])(
    '[TC-IMP36.07/MSS][UC-IMP36] hasTileArt(%i) returns true for stand tile in ALL_28_STAND_TILES',
    (tileIndex) => {
      expect(hasTileArt?.(tileIndex)).toBe(true);
    }
  );

  it.each([0, 2, 4, 10, 20, 30])(
    '[TC-IMP36.08/MSS][UC-IMP36] hasTileArt(%i) returns true for special/corner tile with art (IMP-71)',
    (tileIndex) => {
      expect(hasTileArt?.(tileIndex)).toBe(true);
    }
  );

  it.each([-1, 40, 99])(
    '[TC-IMP36.08b/MSS][UC-IMP36] hasTileArt(%i) returns false for invalid tile index',
    (tileIndex) => {
      expect(hasTileArt?.(tileIndex)).toBe(false);
    }
  );

  // =========================================================================
  // FACET 2: CLEAN C0 PLOT - NO FENCE (procedural_building.tsx)
  // =========================================================================

  it('[TC-IMP36.09/MSS][UC-IMP36] Clean C0 plot: ProceduralBuilding level 0 defaults to clean plot without boundary pegs or ropes', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 0, groupColor: '#DC2626' })
    );
    expect(markup).not.toContain('args="0.018,0.024,0.08,6"');
    expect(markup).not.toContain('args="0.48,0.006,0.006"');
  });

  it('[TC-IMP36.10/MSS][UC-IMP36] Clean C0 plot: ProceduralBuilding level 0 with showEmptyPlotBoundary=false renders zero fence meshes', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding as any, {
        level: 0,
        groupColor: '#DC2626',
        showEmptyPlotBoundary: false,
      })
    );
    expect(markup).not.toContain('args="0.58,0.016,0.48"');
    expect(markup).not.toContain('args="0.18,0.12,0.012"');
  });

  it('[TC-IMP36.11/MSS][UC-IMP36] Clean C0 plot: ProceduralBuilding level 0 maintains standard root position [0, 0.16, -1.38]', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 0, groupColor: '#DC2626' })
    );
    const pos = extractRootGroupPosition(markup);
    expect(pos).toEqual([0, 0.16, -1.38]);
  });

  it('[TC-IMP36.12/MSS][UC-IMP36] Clean C0 plot: ProceduralBuilding level 0 with showEmptyPlotBoundary=true conditionally renders surveyor boundary', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding as any, {
        level: 0,
        groupColor: '#DC2626',
        showEmptyPlotBoundary: true,
      })
    );
    expect(markup).toContain('args="0.018,0.024,0.08,6"');
  });

  // =========================================================================
  // FACET 3: NO STANDEE ON BOARD (board_tile.tsx & board_layout.tsx)
  // =========================================================================

  it('[TC-IMP36.13/MSS][UC-IMP36] LayeredDioramaTile with enableStandee=false suppresses StandeeBillboard on railroad tiles (cell 5)', () => {
    READY_TILES.add(5);
    const markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile as any, {
        cell: sampleRailroadCell,
        position: [0, 0, 0],
        currentLevel: 0,
        enableStandee: false,
      })
    );
    expect(markup).not.toContain('<billboard');
  });

  it('[TC-IMP36.14/MSS][UC-IMP36] LayeredDioramaTile with enableStandee=false suppresses StandeeBillboard on utility tiles (cell 12)', () => {
    READY_TILES.add(12);
    const sampleUtilityCell: BoardCell = {
      index: 12,
      name: 'Tổng Công Ty Điện Lực (EVN)',
      type: CellType.Utility,
    };
    const markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile as any, {
        cell: sampleUtilityCell,
        position: [0, 0, 0],
        currentLevel: 0,
        enableStandee: false,
      })
    );
    expect(markup).not.toContain('<billboard');
  });

  it('[TC-IMP36.15/MSS][UC-IMP36] LayeredDioramaTile with enableStandee=true preserves StandeeBillboard for standalone inspection', () => {
    READY_TILES.add(5);
    const markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile as any, {
        cell: sampleRailroadCell,
        position: [0, 0, 0],
        currentLevel: 0,
        enableStandee: true,
      })
    );
    expect(markup).toContain('<billboard');
  });

  it('[TC-IMP36.16/MSS][UC-IMP36] GameBoard layout configures enableStandee=false across board tiles to eliminate 3D standees', () => {
    READY_TILES.add(5);
    READY_TILES.add(12);
    const markup = renderToStaticMarkup(React.createElement(GameBoard));
    expect(markup).not.toContain('<billboard');
  });

  // =========================================================================
  // FACET 4: STATE REACTIVITY & UPGRADE PROGRESSION (levels 1, 2, 3)
  // =========================================================================

  it('[TC-IMP36.17/MSS][UC-IMP36] ProceduralBuilding level 1 renders C1 Indochine Shophouse architecture at [0, 0.16, -1.38]', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 1, groupColor: '#16A34A' })
    );
    const pos = extractRootGroupPosition(markup);
    expect(pos).toEqual([0, 0.16, -1.38]);
    expect(markup).toContain('args="0,0.46,0.22,4"'); // Indochine tiled hip roof
  });

  it('[TC-IMP36.18/MSS][UC-IMP36] ProceduralBuilding level 2 renders C2 Sapphire Complex architecture at [0, 0.16, -1.38]', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 2, groupColor: '#2563EB' })
    );
    const pos = extractRootGroupPosition(markup);
    expect(pos).toEqual([0, 0.16, -1.38]);
    expect(markup).toContain('color="#0284C7"'); // Sapphire glass facade
  });

  it('[TC-IMP36.19/MSS][UC-IMP36] ProceduralBuilding level 3 renders C3 Landmark Skyscraper architecture at [0, 0.16, -1.38]', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 3, groupColor: '#D97706' })
    );
    const pos = extractRootGroupPosition(markup);
    expect(pos).toEqual([0, 0.16, -1.38]);
    expect(markup).toContain('args="0.005,0.012,0.12,6"'); // Spire needle tip
  });

  it('[TC-IMP36.20/MSS][UC-IMP36] Reactive upgrade: transitioning level 0 to level 1 replaces empty plot with building at [0, 0.16, -1.38]', () => {
    const markupC0 = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 0, groupColor: '#16A34A' })
    );
    const markupC1 = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 1, groupColor: '#16A34A' })
    );
    expect(extractRootGroupPosition(markupC0)).toEqual([0, 0.16, -1.38]);
    expect(extractRootGroupPosition(markupC1)).toEqual([0, 0.16, -1.38]);
    expect(markupC1).toContain('args="0,0.46,0.22,4"');
  });

  // =========================================================================
  // FACET 5: HEADLESS SSR RESILIENCE & CACHE ISOLATION
  // =========================================================================

  it('[TC-IMP36.21/MSS][UC-IMP36] Headless Node/SSR resilience: getTileTexture returns safely without crashing when document is undefined', () => {
    (globalThis as any).document = undefined;
    expect(() => tileTextureGen.getTileTexture(999)).not.toThrow();
    expect(tileTextureGen.getTileTexture(999)).toBeNull();
  });

  it('[TC-IMP36.22/MSS][UC-IMP36] Headless Node/SSR resilience: getStandeeTexture returns safely without crashing when document is undefined', () => {
    (globalThis as any).document = undefined;
    expect(() => tileTextureGen.getStandeeTexture(999)).not.toThrow();
    expect(tileTextureGen.getStandeeTexture(999)).toBeNull();
  });

  it('[TC-IMP36.23/MSS][UC-IMP36] Cache integrity: getTileTexture returns cached CanvasTexture reference on subsequent calls', () => {
    const tex1 = tileTextureGen.getTileTexture(1);
    const tex2 = tileTextureGen.getTileTexture(1);
    expect(tex1).not.toBeNull();
    expect(tex1).toBe(tex2);
  });
});
