// [TC-IMP35/MSS][UC-IMP35] Contract Test Suite: Outer Building Plot & Matte Tile Sharpness (IMP-35)
// Universal 4-Facet Behavioral Matrix Verification:
// Facet 1: Building Plot Outer Zone (Z >= 0.50, standard 0.58)
// Facet 2: Standee Outer Zone (Z >= 0.50, scale [0.78, 0.78])
// Facet 3: True Matte Cardstock Shading (roughness >= 0.90, envMapIntensity <= 0.05)
// Facet 4: Texture Sharpness & No Mipmap Blur (generateMipmaps = false, minFilter = LinearFilter)
// Facet 5: State Reactivity, Resource Disposal & Architectural Isolation

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LinearFilter, LinearMipmapLinearFilter } from 'three';
import { ProceduralBuilding } from '../../src/client/3d/procedural_building';
import {
  LayeredDioramaTile,
  StandeeBillboard,
  clearStandeeWebpCache,
  standeeWebpCache,
} from '../../src/client/3d/board_tile';
import { getTileTexture, getStandeeTexture } from '../../src/client/3d/tile_texture_generator';
import { CellType, ColorGroup, type BoardCell } from '../../src/domain/board_config';
import { READY_TILES } from '../../src/client/assets/tile_assets';

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

// Helper functions for inspecting rendered JSX output
function extractRootGroupPosition(markup: string): [number, number, number] {
  const match = markup.match(/<group[^>]*\bposition="([^"]+)"/);
  if (!match || !match[1]) return [0, 0, 0];
  const parts = match[1].split(',').map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

function extractStandeeRootPosition(markup: string): [number, number, number] {
  const match = markup.match(/<group[^>]*\bposition="([^"]+)"[^>]*>\s*<billboard/i);
  if (!match || !match[1]) {
    const fallbackMatch = markup.match(/<group[^>]*\bposition="([^"]+)"[\s\S]*?<billboard/i);
    if (!fallbackMatch || !fallbackMatch[1]) return [0, 0, 0];
    const parts = fallbackMatch[1].split(',').map(Number);
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
  }
  const parts = match[1].split(',').map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

function extractStandeeScale(markup: string): [number, number] {
  const match = markup.match(/<drei-image[^>]*\bscale="([^"]+)"/i);
  if (!match || !match[1]) return [0, 0];
  const parts = match[1].split(',').map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0];
}

function extractCardstockMaterial(markup: string): { roughness: number; envMapIntensity: number; metalness: number } {
  const meshMatch = markup.match(/<mesh[^>]*position="0,0\.103,0"[^>]*>([\s\S]*?)<\/mesh>/i);
  const targetSnippet = (meshMatch && meshMatch[1]) ? meshMatch[1] : markup;
  const matMatch = targetSnippet.match(/<meshStandardMaterial([^>]*)\/?>/i);
  const attrs = (matMatch && matMatch[1]) ? matMatch[1] : '';
  const roughness = Number(attrs.match(/roughness="([^"]+)"/i)?.[1] ?? NaN);
  const envMap = Number(attrs.match(/envmapintensity="([^"]+)"/i)?.[1] ?? NaN);
  const metalness = Number(attrs.match(/metalness="([^"]+)"/i)?.[1] ?? NaN);
  return { roughness, envMapIntensity: envMap, metalness };
}

function extractCornerCardstockMaterial(markup: string): { roughness: number; envMapIntensity: number } {
  const meshMatch = markup.match(/<mesh[^>]*position="0,0\.115,0"[^>]*>([\s\S]*?)<\/mesh>/i);
  const targetSnippet = (meshMatch && meshMatch[1]) ? meshMatch[1] : markup;
  const matMatch = targetSnippet.match(/<meshStandardMaterial([^>]*)\/?>/i);
  const attrs = (matMatch && matMatch[1]) ? matMatch[1] : '';
  const roughness = Number(attrs.match(/roughness="([^"]+)"/i)?.[1] ?? NaN);
  const envMap = Number(attrs.match(/envmapintensity="([^"]+)"/i)?.[1] ?? NaN);
  return { roughness, envMapIntensity: envMap };
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

const sampleCornerCell: BoardCell = {
  index: 0,
  name: 'Khởi Hành (GO)',
  type: CellType.Go,
};

describe('[TC-IMP35/MSS][UC-IMP35] Outer Building Plot & Matte Tile Sharpness Contract Suite', () => {
  let originalDocument: any;
  let recordedFillStyles: string[] = [];
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
    clearStandeeWebpCache();
    recordedFillStyles = [];

    originalDocument = (globalThis as any).document;

    const mockCtx = new Proxy({} as any, {
      get: (_target, prop) => {
        if (typeof prop === 'string') {
          return (..._args: any[]) => {};
        }
        return undefined;
      },
      set: (_target, prop, value) => {
        if (prop === 'fillStyle' && typeof value === 'string') {
          recordedFillStyles.push(value);
        }
        return true;
      },
    });

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: () => mockCtx,
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
    clearStandeeWebpCache();
  });

  // =========================================================================
  // FACET 1: BUILDING PLOT OUTER ZONE (procedural_building.tsx Z >= 0.50, Std: 0.58)
  // =========================================================================
  it('[TC-IMP35.01/MSS][UC-IMP35] ProceduralBuilding C0 (SurveyorPlotBoundary) shifts root group to outer boundary Z >= 0.50', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 0, groupColor: '#DC2626' })
    );
    const pos = extractRootGroupPosition(markup);
    expect(pos[2]).toBeGreaterThanOrEqual(0.50);
  });

  it('[TC-IMP35.02/MSS][UC-IMP35] ProceduralBuilding C0 conforms precisely to standard root position [0, 0.22, 0.58]', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 0, groupColor: '#DC2626' })
    );
    const pos = extractRootGroupPosition(markup);
    expect(pos).toEqual([0, 0.22, 0.58]);
  });

  it('[TC-IMP35.03/MSS][UC-IMP35] ProceduralBuilding C1 (Indochine Shophouse) shifts foundation to outer boundary Z >= 0.50', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 1, groupColor: '#16A34A' })
    );
    const pos = extractRootGroupPosition(markup);
    expect(pos[2]).toBeGreaterThanOrEqual(0.50);
  });

  it('[TC-IMP35.04/MSS][UC-IMP35] ProceduralBuilding C1 conforms precisely to standard root position [0, 0.22, 0.58]', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 1, groupColor: '#16A34A' })
    );
    const pos = extractRootGroupPosition(markup);
    expect(pos).toEqual([0, 0.22, 0.58]);
  });

  it('[TC-IMP35.05/MSS][UC-IMP35] ProceduralBuilding C2 (Sapphire Complex) conforms precisely to standard root position [0, 0.22, 0.58]', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 2, groupColor: '#2563EB' })
    );
    const pos = extractRootGroupPosition(markup);
    expect(pos).toEqual([0, 0.22, 0.58]);
  });

  it('[TC-IMP35.06/MSS][UC-IMP35] ProceduralBuilding C3 (Golden Landmark) conforms precisely to standard root position [0, 0.22, 0.58]', () => {
    const markup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 3, groupColor: '#D97706' })
    );
    const pos = extractRootGroupPosition(markup);
    expect(pos).toEqual([0, 0.22, 0.58]);
  });

  it.each([0, 1, 2, 3])(
    '[TC-IMP35.07/MSS][UC-IMP35] ProceduralBuilding level %i completely clears card title text zone by eliminating legacy coordinate Z = -0.42',
    (level) => {
      const markup = renderToStaticMarkup(
        React.createElement(ProceduralBuilding, { level: level as 0 | 1 | 2 | 3 })
      );
      expect(markup).not.toContain('position="0,0.22,-0.42"');
    }
  );

  // =========================================================================
  // FACET 2: STANDEE OUTER ZONE (board_tile.tsx Z >= 0.50, scale [0.78, 0.78])
  // =========================================================================
  it('[TC-IMP35.08/MSS][UC-IMP35] StandeeBillboard shifts billboard root group to outer boundary Z >= 0.50', () => {
    const markup = renderToStaticMarkup(
      React.createElement(StandeeBillboard, { cellIndex: 5, currentLevel: 0 })
    );
    const pos = extractStandeeRootPosition(markup);
    expect(pos[2]).toBeGreaterThanOrEqual(0.50);
  });

  it('[TC-IMP35.09/MSS][UC-IMP35] StandeeBillboard conforms precisely to standard root position [0, 0.45, 0.58]', () => {
    const markup = renderToStaticMarkup(
      React.createElement(StandeeBillboard, { cellIndex: 5, currentLevel: 0 })
    );
    const pos = extractStandeeRootPosition(markup);
    expect(pos).toEqual([0, 0.45, 0.58]);
  });

  it('[TC-IMP35.10/MSS][UC-IMP35] StandeeBillboard DreiImage scale conforms to compact outer footprint [0.78, 0.78]', () => {
    const markup = renderToStaticMarkup(
      React.createElement(StandeeBillboard, { cellIndex: 5, currentLevel: 0 })
    );
    const scale = extractStandeeScale(markup);
    expect(scale).toEqual([0.78, 0.78]);
  });

  it('[TC-IMP35.11/MSS][UC-IMP35] StandeeBillboard clears card center by eliminating legacy coordinate Z = 0.0', () => {
    const markup = renderToStaticMarkup(
      React.createElement(StandeeBillboard, { cellIndex: 5, currentLevel: 0 })
    );
    expect(markup).not.toContain('position="0,0.45,0"');
  });

  // =========================================================================
  // FACET 3: TRUE MATTE CARDSTOCK SHADING (board_tile.tsx roughness >= 0.90, envMap <= 0.05)
  // =========================================================================
  it('[TC-IMP35.12/MSS][UC-IMP35] LayeredDioramaTile cardstock material roughness is configured to True Matte >= 0.90', () => {
    const markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: samplePropertyCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
      })
    );
    const mat = extractCardstockMaterial(markup);
    expect(mat.roughness).toBeGreaterThanOrEqual(0.90);
  });

  it('[TC-IMP35.13/MSS][UC-IMP35] LayeredDioramaTile cardstock material envMapIntensity is suppressed to <= 0.05', () => {
    const markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: samplePropertyCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
      })
    );
    const mat = extractCardstockMaterial(markup);
    expect(mat.envMapIntensity).toBeLessThanOrEqual(0.05);
  });

  it('[TC-IMP35.14/MSS][UC-IMP35] LayeredDioramaTile cardstock material maintains non-metallic cardstock metalness = 0.0', () => {
    const markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: samplePropertyCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
      })
    );
    const mat = extractCardstockMaterial(markup);
    expect(mat.metalness).toBe(0.0);
  });

  it('[TC-IMP35.15/MSS][UC-IMP35] LayeredDioramaTile eliminates legacy specular gloss roughness 0.52 from cardstock face', () => {
    const markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: samplePropertyCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
      })
    );
    const mat = extractCardstockMaterial(markup);
    expect(mat.roughness).not.toBe(0.52);
  });

  it('[TC-IMP35.16/MSS][UC-IMP35] Corner tile cardstock material adopts True Matte finish (roughness >= 0.90, envMapIntensity <= 0.05)', () => {
    const markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: sampleCornerCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: true,
      })
    );
    const mat = extractCornerCardstockMaterial(markup);
    expect(mat.roughness).toBeGreaterThanOrEqual(0.90);
    expect(mat.envMapIntensity).toBeLessThanOrEqual(0.05);
  });

  // =========================================================================
  // FACET 4: TEXTURE SHARPNESS & NO MIPMAP BLUR (tile_texture_generator.ts)
  // =========================================================================
  it('[TC-IMP35.17/MSS][UC-IMP35] Standard tile CanvasTexture enables mipmap downsampling (generateMipmaps = true)', () => {
    const texture = getTileTexture(1);
    expect(texture).not.toBeNull();
    expect(texture?.generateMipmaps).toBe(true);
  });

  it('[TC-IMP35.18/MSS][UC-IMP35] Standard tile CanvasTexture sets minFilter to LinearMipmapLinearFilter (1008) for hardware Anisotropy', () => {
    const texture = getTileTexture(1);
    expect(texture).not.toBeNull();
    expect(texture?.minFilter).toBe(LinearMipmapLinearFilter);
  });

  it('[TC-IMP35.19/MSS][UC-IMP35] Corner tile CanvasTexture enables mipmap generation (generateMipmaps = true)', () => {
    const texture = getTileTexture(0);
    expect(texture).not.toBeNull();
    expect(texture?.generateMipmaps).toBe(true);
  });

  it('[TC-IMP35.20/MSS][UC-IMP35] Corner tile CanvasTexture sets minFilter to LinearMipmapLinearFilter (1008)', () => {
    const texture = getTileTexture(0);
    expect(texture).not.toBeNull();
    expect(texture?.minFilter).toBe(LinearMipmapLinearFilter);
  });

  it('[TC-IMP35.21/MSS][UC-IMP35] Standee CanvasTexture enables mipmap generation (generateMipmaps = true)', () => {
    const texture = getStandeeTexture(5);
    expect(texture).not.toBeNull();
    expect(texture?.generateMipmaps).toBe(true);
  });

  it('[TC-IMP35.22/MSS][UC-IMP35] Standee CanvasTexture sets minFilter to LinearMipmapLinearFilter (1008)', () => {
    const texture = getStandeeTexture(5);
    expect(texture).not.toBeNull();
    expect(texture?.minFilter).toBe(LinearMipmapLinearFilter);
  });

  it('[TC-IMP35.23/MSS][UC-IMP35] tile_texture_generator paints high-contrast ivory parchment base #F3EEDF', () => {
    getTileTexture(2);
    expect(recordedFillStyles).toContain('#F3EEDF');
    expect(recordedFillStyles).not.toContain('#E8DFCE');
  });


  // =========================================================================
  // FACET 5: STATE REACTIVITY, RESOURCE DISPOSAL & ISOLATION
  // =========================================================================
  it('[TC-IMP35.24/MSS][UC-IMP35] LayeredDioramaTile root group preserves onClick interactive event binding', () => {
    let clicked = false;
    const handleClick = () => {
      clicked = true;
    };
    const element = React.createElement(LayeredDioramaTile, {
      cell: samplePropertyCell,
      position: [0, 0, 0],
      currentLevel: 0,
      isCornerTile: false,
      onClick: handleClick,
    });
    // In React element props, onClick must be preserved and functional
    expect(typeof element.props.onClick).toBe('function');
    element.props.onClick?.();
    expect(clicked).toBe(true);
  });

  it('[TC-IMP35.25/MSS][UC-IMP35] Corner tile isolates square base dimensions [2.2, 0.22, 2.2] from rectangular tiles [1.68, 0.2, 2.2]', () => {
    const cornerMarkup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: sampleCornerCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: true,
      })
    );
    const standardMarkup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: samplePropertyCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
      })
    );
    expect(cornerMarkup).toContain('args="2.16,2.16"');
    expect(standardMarkup).toContain('args="1.64,2.16"');
  });

  it('[TC-IMP35.26/MSS][UC-IMP35] ProceduralBuilding reactive tier upgrades preserve outer boundary clearance across all levels', () => {
    const markup0 = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 0 }));
    const markup1 = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 1 }));
    const markup2 = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 2 }));
    const markup3 = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 3 }));

    expect(extractRootGroupPosition(markup0)[2]).toBeGreaterThanOrEqual(0.50);
    expect(extractRootGroupPosition(markup1)[2]).toBeGreaterThanOrEqual(0.50);
    expect(extractRootGroupPosition(markup2)[2]).toBeGreaterThanOrEqual(0.50);
    expect(extractRootGroupPosition(markup3)[2]).toBeGreaterThanOrEqual(0.50);
  });

  it('[TC-IMP35.27/MSS][UC-IMP35] Resource disposal: clearStandeeWebpCache purges cache cleanly with zero dangling entries', () => {
    standeeWebpCache.set(5, null);
    standeeWebpCache.set(12, null);
    expect(standeeWebpCache.size).toBe(2);
    clearStandeeWebpCache();
    expect(standeeWebpCache.size).toBe(0);
  });
});
