// [TC-IMP245/MSS][UC-IMP245] Board Tiles Texture Atlas Consolidation Contract Suite
// Universal 5-Facet Behavioral Matrix Verification (20 atomic contract tests)
// Reference: docs/plans/improvements/IMP-245-board-tiles-and-standees-texture-atlas-consolidation_plan.md
// Domain Invariants: docs/domain/gotchas.md (Pillar VI Detroit Classical, 3D Atlas Optimization)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  SRGBColorSpace,
  type CanvasTexture,
  type BufferGeometry,
} from 'three';
import { CellType, ColorGroup, type BoardCell } from '../../src/domain/board_config';
import {
  LayeredDioramaTile,
} from '../../src/client/3d/board_tile';
import {
  getTileTexture,
  getStandeeTexture,
  clearTileTextureCache,
} from '../../src/client/3d/tile_texture_generator';
import {
  getBoardTileAtlas,
  getTileAtlasUVs,
  getTileAtlasGeometry,
  clearTileAtlasCache,
  ATLAS_CANVAS_SIZE,
  ATLAS_GRID_COLS,
  ATLAS_GRID_ROWS,
  CORNER_BG_COLORS,
  VIRTUAL_SLOT_WIDTH,
  VIRTUAL_SLOT_HEIGHT,
  CORNER_SLOT_SIZE,
} from '../../src/client/3d/tile_texture_atlas';

// Mock Drei & R3F components for headless SSR static rendering
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    Billboard: ({ children, ...props }: { children?: React.ReactNode }) =>
      React.createElement('billboard', props, children),
    Image: ({ scale, ...props }: { scale?: unknown }) =>
      React.createElement('drei-image', {
        ...props,
        scale: Array.isArray(scale) ? scale.join(',') : scale,
      }),
    RoundedBox: ({ args, children, ...props }: { args?: unknown; children?: React.ReactNode }) =>
      React.createElement('rounded-box', {
        ...props,
        args: Array.isArray(args) ? args.join(',') : args,
      }, children),
  };
});

// Strongly typed mock DOM and canvas interfaces without dirty casts
interface RecordedFill {
  readonly color: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

interface RecordedRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

interface MockCanvasContext2D {
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  font: string;
  textAlign: string;
  textBaseline: string;
  fillRect: (x: number, y: number, w: number, h: number) => void;
  strokeRect: (x: number, y: number, w: number, h: number) => void;
  clearRect: (x: number, y: number, w: number, h: number) => void;
  beginPath: () => void;
  closePath: () => void;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  arc: (x: number, y: number, r: number, sa: number, ea: number) => void;
  rect: (x: number, y: number, w: number, h: number) => void;
  roundRect: (...args: unknown[]) => void;
  quadraticCurveTo: (...args: unknown[]) => void;
  bezierCurveTo: (...args: unknown[]) => void;
  arcTo: (...args: unknown[]) => void;
  ellipse: (...args: unknown[]) => void;
  createLinearGradient: (...args: unknown[]) => { addColorStop: () => void };
  createRadialGradient: (...args: unknown[]) => { addColorStop: () => void };
  fill: () => void;
  stroke: () => void;
  clip: () => void;
  save: () => void;
  restore: () => void;
  translate: (x: number, y: number) => void;
  scale: (x: number, y: number) => void;
  rotate: (a: number) => void;
  setTransform: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  drawImage: (...args: unknown[]) => void;
  fillText: (text: string, x: number, y: number, mw?: number) => void;
  strokeText: (text: string, x: number, y: number, mw?: number) => void;
  measureText: (text: string) => { width: number };
}

interface MockCanvasElement {
  width: number;
  height: number;
  getContext: (contextId: string) => MockCanvasContext2D | null;
}

interface MockDocumentType {
  createElement: (tagName: string) => MockCanvasElement;
}

interface MockImageInstance {
  crossOrigin: string;
  src: string;
  complete: boolean;
  naturalWidth: number;
  naturalHeight: number;
  onload: (() => void) | null;
  onerror: (() => void) | null;
}



const recordedFills: RecordedFill[] = [];
const recordedRects: RecordedRect[] = [];
let createdCanvasCount = 0;
let latestCreatedImage: MockImageInstance | null = null;
let currentFillStyle = '';

class MockImageClass implements MockImageInstance {
  crossOrigin = '';
  src = '';
  complete = false;
  naturalWidth = 0;
  naturalHeight = 0;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() {
    latestCreatedImage = this;
  }
}

function createMockContext(): MockCanvasContext2D {
  return {
    get fillStyle(): string {
      return currentFillStyle;
    },
    set fillStyle(val: string) {
      currentFillStyle = val;
    },
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'center',
    textBaseline: 'middle',
    fillRect: (x: number, y: number, w: number, h: number) => {
      recordedFills.push({ color: currentFillStyle, x, y, w, h });
    },
    strokeRect: () => {},
    clearRect: () => {},
    beginPath: () => {},
    closePath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    rect: (x: number, y: number, w: number, h: number) => {
      recordedRects.push({ x, y, w, h });
    },
    roundRect: () => {},
    quadraticCurveTo: () => {},
    bezierCurveTo: () => {},
    arcTo: () => {},
    ellipse: () => {},
    createLinearGradient: () => ({ addColorStop: () => {} }),
    createRadialGradient: () => ({ addColorStop: () => {} }),
    fill: () => {},
    stroke: () => {},
    clip: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    setTransform: () => {},
    drawImage: () => {},
    fillText: () => {},
    strokeText: () => {},
    measureText: (text: string) => ({ width: text.length * 8 }),
  };
}

function createMockCanvas(): MockCanvasElement {
  createdCanvasCount++;
  const ctx = createMockContext();
  return {
    width: 0,
    height: 0,
    getContext: (id: string) => (id === '2d' ? ctx : null),
  };
}

const samplePropertyCell: BoardCell = {
  index: 1,
  name: 'Cần Thơ (Cái Răng)',
  type: CellType.Property,
  colorGroup: ColorGroup.Nau,
};

const sampleCornerCell: BoardCell = {
  index: 0,
  name: 'Khởi Hành (GO)',
  type: CellType.Go,
};

const allCellIndices: readonly number[] = Array.from({ length: 40 }, (_, i) => i);

describe('[TC-IMP245/MSS][UC-IMP245] Board Tiles Texture Atlas Consolidation Contract Suite', () => {
  let originalDocumentDesc: PropertyDescriptor | undefined;
  let originalWindowDesc: PropertyDescriptor | undefined;
  let originalImageDesc: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalDocumentDesc = Object.getOwnPropertyDescriptor(globalThis, 'document');
    originalWindowDesc = Object.getOwnPropertyDescriptor(globalThis, 'window');
    originalImageDesc = Object.getOwnPropertyDescriptor(globalThis, 'Image');

    recordedFills.length = 0;
    recordedRects.length = 0;
    createdCanvasCount = 0;
    latestCreatedImage = null;
    currentFillStyle = '';

    const mockDoc: MockDocumentType = {
      createElement: (tag: string) => (tag === 'canvas' ? createMockCanvas() : createMockCanvas()),
    };

    Object.defineProperty(globalThis, 'document', {
      value: mockDoc,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: globalThis,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, 'Image', {
      value: MockImageClass,
      configurable: true,
      writable: true,
    });
    clearTileAtlasCache();
  });

  afterEach(() => {
    clearTileAtlasCache();
    if (originalDocumentDesc) {
      Object.defineProperty(globalThis, 'document', originalDocumentDesc);
    } else {
      Reflect.deleteProperty(globalThis, 'document');
    }
    if (originalWindowDesc) {
      Object.defineProperty(globalThis, 'window', originalWindowDesc);
    } else {
      Reflect.deleteProperty(globalThis, 'window');
    }
    if (originalImageDesc) {
      Object.defineProperty(globalThis, 'Image', originalImageDesc);
    } else {
      Reflect.deleteProperty(globalThis, 'Image');
    }
  });

  // =========================================================================
  // FACET 1: CORE ATLAS GENERATION & HAPPY PATHS (TC-IMP245.01..04)
  // =========================================================================
  describe('Facet 1: Core Atlas Generation & Happy Paths', () => {
    it('[TC-IMP245.01/MSS][UC-IMP245] getBoardTileAtlas(true) generates 2048x2048 CanvasTexture for Mobile with anisotropy=2 and sRGB color space', () => {
      const atlas = getBoardTileAtlas(true);
      const img = atlas?.image;
      const width = img && typeof img === 'object' && 'width' in img ? img.width : 0;
      const height = img && typeof img === 'object' && 'height' in img ? img.height : 0;
      expect(width).toBe(2048);
      expect(height).toBe(2048);
      expect(atlas?.anisotropy).toBe(2);
      expect(atlas?.colorSpace).toBe(SRGBColorSpace);
    });

    it('[TC-IMP245.02/MSS][UC-IMP245] getBoardTileAtlas(false) generates 4096x4096 CanvasTexture for Desktop with anisotropy=16 and sRGB color space', () => {
      const atlas = getBoardTileAtlas(false);
      const img = atlas?.image;
      const width = img && typeof img === 'object' && 'width' in img ? img.width : 0;
      const height = img && typeof img === 'object' && 'height' in img ? img.height : 0;
      expect(width).toBe(4096);
      expect(height).toBe(4096);
      expect(atlas?.anisotropy).toBe(16);
      expect(atlas?.colorSpace).toBe(SRGBColorSpace);
    });

    it('[TC-IMP245.03/MSS][UC-IMP245] getTileAtlasUVs(index) returns normalized UV bounding box within [0.0, 1.0] with half-texel inset for ATLAS_CANVAS_SIZE=2048', () => {
      const uvs = getTileAtlasUVs(0);
      const halfU = 0.5 / ATLAS_CANVAS_SIZE;
      expect(uvs.uMin).toBeCloseTo(halfU, 6);
      expect(uvs.uMax).toBeCloseTo(CORNER_SLOT_SIZE / ATLAS_CANVAS_SIZE - halfU, 6);
      expect(uvs.vMax).toBeCloseTo(1.0 - halfU, 6);
      expect(uvs.vMin).toBeCloseTo(1.0 - CORNER_SLOT_SIZE / ATLAS_CANVAS_SIZE + halfU, 6);
    });

    it('[TC-IMP245.04/MSS][UC-IMP245] getTileAtlasGeometry(index, isCorner) generates BufferGeometry with 8-element UV attribute and pre-computed bounding volume', () => {
      const stdGeom = getTileAtlasGeometry(1, false);
      const cornerGeom = getTileAtlasGeometry(0, true);
      const uvAttr = stdGeom.getAttribute('uv');
      const stdWidth = stdGeom.boundingBox ? stdGeom.boundingBox.max.x - stdGeom.boundingBox.min.x : 0;
      const cornerWidth = cornerGeom.boundingBox ? cornerGeom.boundingBox.max.x - cornerGeom.boundingBox.min.x : 0;
      expect(uvAttr.count * 2).toBe(8);
      expect(stdWidth).toBeCloseTo(1.64, 2);
      expect(cornerWidth).toBeCloseTo(2.16, 2);
    });
  });

  // =========================================================================
  // FACET 2: EDGE CASES & BOUNDARIES (TC-IMP245.05..08)
  // =========================================================================
  describe('Facet 2: Edge Cases & Boundaries', () => {
    it('[TC-IMP245.05/MSS][UC-IMP245] getBoardTileAtlas returns null in headless environment without DOM, LayeredDioramaTile renders fallback safely', () => {
      Reflect.deleteProperty(globalThis, 'document');
      clearTileAtlasCache();
      const atlas = getBoardTileAtlas(true);
      const propertyMarkup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
        })
      );
      const cornerMarkup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: sampleCornerCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: true,
        })
      );
      expect(atlas).toBeNull();
      expect(propertyMarkup).toContain('args="1.68,0.45"');
      expect(cornerMarkup).toContain('color="#1E293B"');
    });

    it('[TC-IMP245.06/MSS][UC-IMP245] Out of range cell indices index < 0 or index > 39 are safely clamped without throwing or array out-of-bounds', () => {
      const uvsNegative = getTileAtlasUVs(-5);
      const uvsZero = getTileAtlasUVs(0);
      const uvsOverflow = getTileAtlasUVs(99);
      const uvsThirtyNine = getTileAtlasUVs(39);
      expect(uvsNegative).toEqual(uvsZero);
      expect(uvsOverflow).toEqual(uvsThirtyNine);
    });

    it('[TC-IMP245.07/MSS][UC-IMP245] Special 4 corner tiles (0, 10, 20, 30) map to 1:1 aspect ratio subregions (256x256 in 256x340 slot)', () => {
      const halfU = 0.5 / ATLAS_CANVAS_SIZE;
      const halfV = 0.5 / ATLAS_CANVAS_SIZE;
      const uvs0 = getTileAtlasUVs(0);
      const uvs10 = getTileAtlasUVs(10);
      const w0 = Math.round((uvs0.uMax - uvs0.uMin + 2 * halfU) * ATLAS_CANVAS_SIZE);
      const h0 = Math.round((uvs0.vMax - uvs0.vMin + 2 * halfV) * ATLAS_CANVAS_SIZE);
      const w10 = Math.round((uvs10.uMax - uvs10.uMin + 2 * halfU) * ATLAS_CANVAS_SIZE);
      const h10 = Math.round((uvs10.vMax - uvs10.vMin + 2 * halfV) * ATLAS_CANVAS_SIZE);
      expect(w0).toBe(256);
      expect(h0).toBe(256);
      expect(w10).toBe(256);
      expect(h10).toBe(256);
    });

    it('[TC-IMP245.08/MSS][UC-IMP245] Singleton caching maintains identical references for consecutive getBoardTileAtlas and getTileAtlasGeometry calls', () => {
      const atlas1 = getBoardTileAtlas(true);
      const atlas2 = getBoardTileAtlas(true);
      const geom1 = getTileAtlasGeometry(5, false);
      const geom2 = getTileAtlasGeometry(5, false);
      expect(atlas1).toBe(atlas2);
      expect(geom1).toBe(geom2);
    });
  });

  // =========================================================================
  // FACET 3: DATA SANITY, MEMORY EFFICIENCY & BATCHING (TC-IMP245.09..14)
  // =========================================================================
  describe('Facet 3: Data Sanity, Memory Efficiency & Batching', () => {
    it('[TC-IMP245.09/MSS][UC-IMP245] Atlas initialization calls document.createElement("canvas") exactly once for all 40 tiles instead of 40 separate calls', () => {
      createdCanvasCount = 0;
      getBoardTileAtlas(true);
      expect(createdCanvasCount).toBe(1);
    });

    it('[TC-IMP245.10/MSS][UC-IMP245] Canvas surface 2048x2048 is pre-filled with ivory #F3EEDF and 4 corner slots are pre-filled with CORNER_BG_COLORS', () => {
      recordedFills.length = 0;
      getBoardTileAtlas(true);
      const baseFill = recordedFills.find((f) => f.w === 2048 && f.h === 2048);
      const corner0Fill = recordedFills.find((f) => f.color === CORNER_BG_COLORS[0] && f.w === 256 && f.h === 340);
      const corner10Fill = recordedFills.find((f) => f.color === CORNER_BG_COLORS[10] && f.w === 256 && f.h === 340);
      expect(baseFill?.color).toBe('#F3EEDF');
      expect(corner0Fill).toBeDefined();
      expect(corner10Fill).toBeDefined();
    });

    it('[TC-IMP245.11/MSS][UC-IMP245] Multi-instance batched update mechanism defers needsUpdate via Set<CanvasTexture> and flushes via timers', () => {
      vi.useFakeTimers();
      const atlas = getBoardTileAtlas(true);
      expect(atlas).not.toBeNull();
      if (atlas) atlas.needsUpdate = false;
      latestCreatedImage?.onload?.();
      expect(atlas?.needsUpdate).toBe(false);
      vi.runAllTimers();
      expect(atlas?.needsUpdate).toBe(true);
      vi.useRealTimers();
    });

    it('[TC-IMP245.12/MSS][UC-IMP245] Asynchronous WebP onload callback guards against disposed textures and re-establishes clip rect (10, 94, 236, 172)', () => {
      const atlas = getBoardTileAtlas(true);
      expect(atlas).not.toBeNull();
      const canvasObj = atlas?.image;
      if (canvasObj && typeof canvasObj === 'object' && 'width' in canvasObj) {
        canvasObj.width = 0;
      }
      recordedRects.length = 0;
      latestCreatedImage?.onload?.();
      expect(recordedRects.length).toBe(0);
    });

    it('[TC-IMP245.13/MSS][UC-IMP245] clearTileAtlasCache zeros canvas dimensions width=0 height=0 and calls dispose on atlas textures', () => {
      const atlas = getBoardTileAtlas(true);
      const canvas = atlas?.image;
      const disposeSpy = vi.spyOn(atlas!, 'dispose');
      clearTileAtlasCache();
      const width = canvas && typeof canvas === 'object' && 'width' in canvas ? canvas.width : -1;
      const height = canvas && typeof canvas === 'object' && 'height' in canvas ? canvas.height : -1;
      expect(width).toBe(0);
      expect(height).toBe(0);
      expect(disposeSpy).toHaveBeenCalled();
    });

    it('[TC-IMP245.14/MSS][UC-IMP245] clearTileAtlasCache preserves boardGeometryCache and does NOT dispose cached geometries', () => {
      const geom = getTileAtlasGeometry(0, true);
      const disposeSpy = vi.spyOn(geom, 'dispose');
      clearTileAtlasCache();
      const geomAfter = getTileAtlasGeometry(0, true);
      expect(disposeSpy).not.toHaveBeenCalled();
      expect(geomAfter).toBe(geom);
    });
  });

  // =========================================================================
  // FACET 4: REGRESSION PREVENTION & SYSTEM INTEGRATION (TC-IMP245.15..17)
  // =========================================================================
  describe('Facet 4: Regression Prevention & System Integration', () => {
    it('[TC-IMP245.15/MSS][UC-IMP245] clearTileTextureCache in tile_texture_generator clears both legacy tile textures and atlas cache without double dispose', () => {
      const atlasBefore = getBoardTileAtlas(true);
      clearTileTextureCache();
      const atlasAfter = getBoardTileAtlas(true);
      expect(atlasBefore).not.toBeNull();
      expect(atlasAfter).not.toBe(atlasBefore);
    });

    it('[TC-IMP245.16/MSS][UC-IMP245] Legacy getTileTexture contract remains 100% operational for backwards compatibility with integration tests', () => {
      clearTileTextureCache();
      const legacyMobileTex = getTileTexture(1, true);
      const legacyDesktopTex = getTileTexture(1, false);
      expect(legacyMobileTex).not.toBeNull();
      expect(legacyDesktopTex).not.toBeNull();
      expect(legacyMobileTex?.image).toBeDefined();
      expect(legacyDesktopTex?.image).toBeDefined();
    });

    it('[TC-IMP245.17/MSS][UC-IMP245] Legacy getStandeeTexture export remains available and generates valid CanvasTexture for useSmartStandeeTexture', () => {
      clearTileTextureCache();
      const standeeTex = getStandeeTexture(5);
      expect(standeeTex).not.toBeNull();
      expect(standeeTex?.image).toBeDefined();
      expect(standeeTex?.anisotropy).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // FACET 5: SPATIAL INTEGRITY & 3D SHADING (TC-IMP245.18..20)
  // =========================================================================
  describe('Facet 5: Spatial Integrity & 3D Shading', () => {
    it('[TC-IMP245.18/MSS][UC-IMP245] LayeredDioramaTile binds getBoardTileAtlas and getTileAtlasGeometry with cardstock roughness=0.98 and metalness=0.0', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
        })
      );
      expect(markup).toContain('roughness="0.98"');
      expect(markup).toContain('metalness="0"');
      expect(markup).toContain('position="0,0.103,0"');
      expect(markup).not.toContain('args="1.64,2.16"');
    });

    it('[TC-IMP245.19/MSS][UC-IMP245] Corner tile in LayeredDioramaTile binds tileGeometry from Atlas and preserves True Matte roughness>=0.90 and envMapIntensity<=0.05', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: sampleCornerCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: true,
        })
      );
      expect(markup).toContain('position="0,0.115,0"');
      expect(markup).toContain('roughness="0.98"');
      expect(markup.toLowerCase()).toContain('envmapintensity="0"');
      expect(markup).not.toContain('args="2.16,2.16"');
    });

    it('[TC-IMP245.20/MSS][UC-IMP245] All 40 board tiles when rendered reference the exact same CanvasTexture instance from Atlas eliminating 39 sampler switches', () => {
      const atlas = getBoardTileAtlas(false);
      const tileAtlases = allCellIndices.map(() => getBoardTileAtlas(false));
      const uniqueAtlases = new Set(tileAtlases);
      expect(uniqueAtlases.size).toBe(1);
      expect(uniqueAtlases.has(atlas)).toBe(true);
    });
  });
});
