// [TC-63/MSS][IMP-63] Contract Test Suite: Top Building Outside Card & Restored Pristine Card Layout
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Building Placed at Top and OUTSIDE the Card (procedural_building.tsx Z = -1.58)
// Facet 2: Slam VFX Impact Offset Alignment (construction_slam_vfx.tsx offset = 1.58)
// Facet 3: Card Restored to Original Pristine State (banner = [0,0,256,56], title y = 28, sub y = 74)
// Facet 4: Full-Size Heritage Art & Original Price Tray (art = [10,94,236,172], tray = [22,274,212,50,12], price y = 300)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProceduralBuilding } from '../../src/client/3d/procedural_building';
import { getBuildingWorldPosition } from '../../src/client/3d/construction_slam_vfx';
import { cellPosition } from '../../src/client/3d/board_coords';
import { getTileTexture, clearTileTextureCache } from '../../src/client/3d/tile_texture_generator';
import { TILE_METADATA_MAP } from '../../src/client/3d/tile_texture_data';

vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    RoundedBox: ({ children, ...props }: any) => React.createElement('rounded-box', props, children),
  };
});

function extractRootGroupPosition(markup: string): [number, number, number] {
  const match = markup.match(/<group[^>]*\bposition="([^"]+)"/);
  if (!match || !match[1]) return [0, 0, 0];
  const parts = match[1].split(',').map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

interface RecordedText { text: string; x: number; y: number; }
interface RecordedRect { x: number; y: number; w: number; h: number; r?: number | number[]; }

describe('[TC-63/MSS][IMP-63] Top Building Outside Card & Pristine Card Layout Contract Suite', () => {
  let originalDocument: any;
  let recordedFillText: RecordedText[] = [];
  let recordedStrokeText: RecordedText[] = [];
  let recordedFillRect: RecordedRect[] = [];
  let recordedRects: RecordedRect[] = [];
  let recordedRoundRects: RecordedRect[] = [];

  beforeEach(() => {
    originalDocument = (globalThis as any).document;
    recordedFillText = [];
    recordedStrokeText = [];
    recordedFillRect = [];
    recordedRects = [];
    recordedRoundRects = [];
    clearTileTextureCache();

    const targetCtx: any = {
      canvas: { width: 1024, height: 1360 },
      save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), closePath: vi.fn(),
      clip: vi.fn(), fill: vi.fn(), stroke: vi.fn(), scale: vi.fn(),
      drawImage: vi.fn(), strokeRect: vi.fn(),
      fillRect: (x: number, y: number, w: number, h: number) => { recordedFillRect.push({ x, y, w, h }); },
      rect: (x: number, y: number, w: number, h: number) => { recordedRects.push({ x, y, w, h }); },
      roundRect: (x: number, y: number, w: number, h: number, r?: number | number[]) => { recordedRoundRects.push({ x, y, w, h, r }); },
      fillText: (text: string, x: number, y: number) => { recordedFillText.push({ text, x, y }); },
      strokeText: (text: string, x: number, y: number) => { recordedStrokeText.push({ text, x, y }); },
    };

    const mockCtx = new Proxy(targetCtx, {
      get: (target, prop) => {
        if (prop in target) return target[prop];
        if (typeof prop === 'string') return (..._args: any[]) => {};
        return undefined;
      },
    });

    (globalThis as any).document = {
      createElement: vi.fn((tag: string) => (tag === 'canvas' ? { width: 0, height: 0, getContext: vi.fn(() => mockCtx) } : {})),
    };
  });

  afterEach(() => {
    (globalThis as any).document = originalDocument;
    clearTileTextureCache();
  });

  // =========================================================================
  // FACET 1: BUILDING PLACED AT TOP AND OUTSIDE THE CARD (procedural_building.tsx)
  // Tile length 2.16 (Z: -1.08..+1.08). Card top edge at Z = -1.08. Building pos[2] <= -1.30 (target: -1.35).
  // =========================================================================
  it('[TC-63.01/MSS][IMP-63] ProceduralBuilding C0 plot root is placed completely OUTSIDE top edge (pos[2] <= -1.30)', () => {
    const markup = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 0 }));
    const pos = extractRootGroupPosition(markup);
    expect(pos[2]).toBeLessThanOrEqual(-1.30);
  });

  it('[TC-63.02/MSS][IMP-63] ProceduralBuilding C0 conforms precisely to target outside coordinate [0, 0.16, -1.38]', () => {
    const markup = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 0 }));
    const pos = extractRootGroupPosition(markup);
    expect(pos).toEqual([0, 0.16, -1.38]);
  });

  it('[TC-63.03/MSS][IMP-63] ProceduralBuilding C1 (Shophouse) conforms precisely to target outside coordinate [0, 0.16, -1.38]', () => {
    const markup = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 1 }));
    const pos = extractRootGroupPosition(markup);
    expect(pos).toEqual([0, 0.16, -1.38]);
  });

  it('[TC-63.04/MSS][IMP-63] ProceduralBuilding C2 (Complex) conforms precisely to target outside coordinate [0, 0.16, -1.38]', () => {
    const markup = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 2 }));
    const pos = extractRootGroupPosition(markup);
    expect(pos).toEqual([0, 0.16, -1.38]);
  });

  it('[TC-63.05/MSS][IMP-63] ProceduralBuilding C3 (Landmark) conforms precisely to target outside coordinate [0, 0.16, -1.38]', () => {
    const markup = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 3 }));
    const pos = extractRootGroupPosition(markup);
    expect(pos).toEqual([0, 0.16, -1.38]);
  });

  it.each([0, 1, 2, 3] as const)('[TC-63.06/MSS][IMP-63] ProceduralBuilding C%i aligns strictly with tile center on X axis (pos[0] === 0)', (lvl) => {
    const markup = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: lvl }));
    const pos = extractRootGroupPosition(markup);
    expect(pos[0]).toBe(0);
  });

  it.each([1, 2, 3] as const)('[TC-63.07/MSS][IMP-63] ProceduralBuilding C%i is placed completely outside card top edge (pos[2] <= -1.30)', (lvl) => {
    const markup = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: lvl }));
    const pos = extractRootGroupPosition(markup);
    expect(pos[2]).toBeLessThanOrEqual(-1.30);
  });

  // =========================================================================
  // FACET 2: SLAM VFX IMPACT OFFSET ALIGNMENT (construction_slam_vfx.tsx)
  // =========================================================================
  it('[TC-63.08/MSS][IMP-63] Slam VFX side 0 (South, cell 1) aligns impact position outside card top edge Z = cz - 1.38', () => {
    const [cx, , cz] = cellPosition(1);
    const pos = getBuildingWorldPosition(1);
    expect(pos[2]).toBeCloseTo(cz - 1.38, 4);
    expect(pos[0]).toBeCloseTo(cx - 0.24, 4);
  });

  it('[TC-63.09/MSS][IMP-63] Slam VFX side 1 (West, cell 11) aligns impact position outside card top edge X = cx + 1.38', () => {
    const [cx, , cz] = cellPosition(11);
    const pos = getBuildingWorldPosition(11);
    expect(pos[0]).toBeCloseTo(cx + 1.38, 4);
    expect(pos[2]).toBeCloseTo(cz - 0.24, 4);
  });

  it('[TC-63.10/MSS][IMP-63] Slam VFX side 2 (North, cell 21) aligns impact position outside card top edge Z = cz + 1.38', () => {
    const [cx, , cz] = cellPosition(21);
    const pos = getBuildingWorldPosition(21);
    expect(pos[2]).toBeCloseTo(cz + 1.38, 4);
    expect(pos[0]).toBeCloseTo(cx + 0.24, 4);
  });

  it('[TC-63.11/MSS][IMP-63] Slam VFX side 3 (East, cell 31) aligns impact position outside card top edge X = cx - 1.38', () => {
    const [cx, , cz] = cellPosition(31);
    const pos = getBuildingWorldPosition(31);
    expect(pos[0]).toBeCloseTo(cx - 1.38, 4);
    expect(pos[2]).toBeCloseTo(cz + 0.24, 4);
  });

  it.each([
    [3, 0],
    [13, 1],
    [23, 2],
    [33, 3],
  ] as const)('[TC-63.12/MSS][IMP-63] Slam VFX property cell %i on side %i maintains 1.38 outside offset', (cellIndex, side) => {
    const [cx, , cz] = cellPosition(cellIndex);
    const pos = getBuildingWorldPosition(cellIndex);
    if (side === 0) expect(pos[2]).toBeCloseTo(cz - 1.38, 4);
    else if (side === 1) expect(pos[0]).toBeCloseTo(cx + 1.38, 4);
    else if (side === 2) expect(pos[2]).toBeCloseTo(cz + 1.38, 4);
    else expect(pos[0]).toBeCloseTo(cx - 1.38, 4);
  });

  // =========================================================================
  // FACET 3: CARD RESTORED TO ORIGINAL PRISTINE STATE (tile_texture_generator.ts)
  // =========================================================================
  it('[TC-63.13/MSS][IMP-63] Top banner colored rect is restored to original pristine dimensions [0, 0, 256, 56]', () => {
    getTileTexture(1);
    const banner = recordedFillRect.find((r) => r.y === 0 && r.w === 256 && r.h !== 340);
    expect(banner).toEqual({ x: 0, y: 0, w: 256, h: 56 });
  });

  it('[TC-63.14/MSS][IMP-63] Card title baseline is restored to y = 28 inside pristine top banner [0..56]', () => {
    getTileTexture(1);
    const titleEntry = recordedFillText.find((t) => t.text === TILE_METADATA_MAP[1]?.title);
    expect(titleEntry?.y).toBe(28);
  });

  it('[TC-63.15/MSS][IMP-63] Card title stroke outline baseline is restored identically to y = 28', () => {
    getTileTexture(1);
    const strokeEntry = recordedStrokeText.find((t) => t.text === TILE_METADATA_MAP[1]?.title);
    expect(strokeEntry?.y).toBe(28);
  });

  it('[TC-63.16/MSS][IMP-63] Card subtitle baseline is restored to y = 74 in subtitle zone [56..90]', () => {
    getTileTexture(1);
    const subEntry = recordedFillText.find((t) => t.text === TILE_METADATA_MAP[1]?.subtitle);
    expect(subEntry?.y).toBe(74);
  });

  it.each([3, 6, 8, 9, 39])('[TC-63.17/MSS][IMP-63] Property tile %i consistently restores title baseline to pristine y = 28', (cellIndex) => {
    clearTileTextureCache();
    getTileTexture(cellIndex);
    const titleEntry = recordedFillText.find((t) => t.text === TILE_METADATA_MAP[cellIndex]?.title);
    expect(titleEntry?.y).toBe(28);
  });

  it.each([3, 6, 8, 9, 39])('[TC-63.18/MSS][IMP-63] Property tile %i consistently restores subtitle baseline to pristine y = 74', (cellIndex) => {
    clearTileTextureCache();
    getTileTexture(cellIndex);
    const subEntry = recordedFillText.find((t) => t.text === TILE_METADATA_MAP[cellIndex]?.subtitle);
    expect(subEntry?.y).toBe(74);
  });

  // =========================================================================
  // FACET 4: FULL-SIZE HERITAGE ART & ORIGINAL PRICE TRAY (tile_texture_generator.ts)
  // =========================================================================
  it('[TC-63.19/MSS][IMP-63] Heritage art clip boundary is restored to full-size rect [10, 94, 236, 172]', () => {
    getTileTexture(1);
    const artClip = recordedRects.find((r) => r.w === 236);
    expect(artClip).toEqual({ x: 10, y: 94, w: 236, h: 172 });
  });

  it('[TC-63.20/MSS][IMP-63] Heritage art clip height is expanded to 172px for pristine full-size visual', () => {
    getTileTexture(1);
    const artClip = recordedRects.find((r) => r.w === 236);
    expect(artClip?.h).toBe(172);
  });

  it('[TC-63.21/MSS][IMP-63] Price tray capsule roundRect is eliminated on property tile 1 under IMP-102', () => {
    getTileTexture(1);
    const priceTray = recordedRoundRects.find((r) => r.w === 212);
    expect(priceTray).toBeUndefined();
  });

  it('[TC-63.22/MSS][IMP-63] Price text is printed directly on ivory paper at y = 300 on property tile 1 under IMP-104', () => {
    getTileTexture(1);
    const priceEntry = recordedFillText.find((t) => t.text.includes('Tr.'));
    expect(priceEntry?.y).toBe(300);
    expect(priceEntry?.text).toBe('600 Tr.');
  });

  it.each([6, 9, 39])('[TC-63.23/MSS][IMP-63] Property tile %i consistently eliminates 2D price capsule at y = 274', (cellIndex) => {
    clearTileTextureCache();
    getTileTexture(cellIndex);
    const priceTray = recordedRoundRects.find((r) => r.w === 212);
    expect(priceTray).toBeUndefined();
  });

  it.each([6, 9, 39])('[TC-63.24/MSS][IMP-63] Property tile %i consistently prints price text directly on ivory paper at y = 300 under IMP-104', (cellIndex) => {
    clearTileTextureCache();
    getTileTexture(cellIndex);
    const priceEntry = recordedFillText.find((t) => t.text.includes('Tr.'));
    expect(priceEntry?.y).toBe(300);
  });

  it('[TC-63.25/MSS][IMP-63] Pristine card vertical layout invariant enforces non-overlapping order Banner < Subtitle < Art with clean footer', () => {
    getTileTexture(1);
    const banner = recordedFillRect.find((r) => r.y === 0 && r.w === 256 && r.h !== 340);
    const subEntry = recordedFillText.find((t) => t.text === TILE_METADATA_MAP[1]?.subtitle);
    const artClip = recordedRects.find((r) => r.w === 236);
    const priceTray = recordedRoundRects.find((r) => r.w === 212);
    expect(banner!.h).toBeLessThan(subEntry!.y);
    expect(subEntry!.y).toBeLessThan(artClip!.y);
    expect(artClip!.y + artClip!.h).toBeLessThanOrEqual(340);
    expect(priceTray).toBeUndefined();
  });
});
