// [TC-433/MSS][IMP-433] Living Contract Tests for Indochine Tabletop Phase 2:
// 40 Inlaid Ivory Marble Deeds, Brushed Brass Inlay & Fallback Parity
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BatchedBoardTiles,
} from '../../src/client/3d/batched_board_tiles';
import {
  drawTileHeader,
  drawFooter,
  INDOCHINE_TILE_THEME,
  type TileDrawerTheme,
} from '../../src/client/3d/tile_texture_drawers';
import {
  getBoardTileAtlas,
  clearTileAtlasCache,
} from '../../src/client/3d/tile_texture_atlas';
import {
  TILE_METADATA_MAP,
  type TileMetadata,
} from '../../src/client/3d/tile_texture_data';

interface RecordedFill {
  readonly style: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

interface RecordedStrokeRect {
  readonly style: string;
  readonly lineWidth: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

interface MockCanvasElement {
  width: number;
  height: number;
  getContext: (contextId: string) => CanvasRenderingContext2D | null;
}

interface MockDocument {
  createElement: (tagName: string) => MockCanvasElement;
}

type ThemedTileHeaderDrawer = (
  ctx: CanvasRenderingContext2D,
  meta: TileMetadata,
  index: number,
  theme?: TileDrawerTheme
) => void;

type ThemedFooterDrawer = (
  ctx: CanvasRenderingContext2D,
  meta: TileMetadata,
  index: number,
  theme?: TileDrawerTheme
) => void;

describe('IMP-433: Indochine Tabletop Phase 2 Contract Suite', () => {
  let originalDocumentDesc: PropertyDescriptor | undefined;
  const recordedFills: RecordedFill[] = [];
  const recordedStrokeRects: RecordedStrokeRect[] = [];
  const executeTileHeader: ThemedTileHeaderDrawer = drawTileHeader;
  const executeFooter: ThemedFooterDrawer = drawFooter;

  function createMockContext(): CanvasRenderingContext2D {
    let currentFillStyle = '';
    let currentStrokeStyle = '';
    let currentLineWidth = 1;
    let currentFont = '';

    const mockCtx = {
      canvas: { width: 2048, height: 2048 },
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      setTransform: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      drawImage: vi.fn(),
      rect: vi.fn(),
      arc: vi.fn(),
      roundRect: vi.fn(),
      clearRect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      measureText: vi.fn((text: string) => ({ width: text.length * 10 })),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      textAlign: 'center',
      textBaseline: 'middle',
      get fillStyle(): string {
        return currentFillStyle;
      },
      set fillStyle(val: string) {
        currentFillStyle = val;
      },
      get strokeStyle(): string {
        return currentStrokeStyle;
      },
      set strokeStyle(val: string) {
        currentStrokeStyle = val;
      },
      get lineWidth(): number {
        return currentLineWidth;
      },
      set lineWidth(val: number) {
        currentLineWidth = val;
      },
      get font(): string {
        return currentFont;
      },
      set font(val: string) {
        currentFont = val;
      },
      fillRect: (x: number, y: number, w: number, h: number) => {
        recordedFills.push({ style: currentFillStyle, x, y, w, h });
      },
      strokeRect: (x: number, y: number, w: number, h: number) => {
        recordedStrokeRects.push({ style: currentStrokeStyle, lineWidth: currentLineWidth, x, y, w, h });
      },
    };

    const handler: ProxyHandler<object> = {
      get(target, prop, receiver) {
        if (prop in target) {
          return Reflect.get(target, prop, receiver);
        }
        return vi.fn();
      },
    };

    return new Proxy(mockCtx, handler) as CanvasRenderingContext2D;
  }

  function createMockCanvas(): MockCanvasElement {
    const ctx = createMockContext();
    return {
      width: 0,
      height: 0,
      getContext: (id: string) => (id === '2d' ? ctx : null),
    };
  }

  beforeEach(() => {
    originalDocumentDesc = Object.getOwnPropertyDescriptor(globalThis, 'document');
    recordedFills.length = 0;
    recordedStrokeRects.length = 0;
    clearTileAtlasCache();

    const mockDoc: MockDocument = {
      createElement: () => createMockCanvas(),
    };

    Object.defineProperty(globalThis, 'document', {
      value: mockDoc,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    clearTileAtlasCache();
    if (originalDocumentDesc) {
      Object.defineProperty(globalThis, 'document', originalDocumentDesc);
    } else {
      Reflect.deleteProperty(globalThis, 'document');
    }
  });

  it('TC-433.01 [UC-IVORY-MARBLE-STANDARD-BASES-PBR/MSS] BatchedBoardTiles standard base material color contains #F5F3EF, roughness 0.28, metalness 0.08', () => {
    const markup = renderToStaticMarkup(
      React.createElement(BatchedBoardTiles, { isMobile: false })
    );
    expect(markup).toMatch(/data-testid="batched-standard-bases"[^>]*>[\s\S]*?color="#F5F3EF"/);
    expect(markup).toMatch(/data-testid="batched-standard-bases"[^>]*>[\s\S]*?roughness="0.28"/);
    expect(markup).toMatch(/data-testid="batched-standard-bases"[^>]*>[\s\S]*?metalness="0.08"/);
  });

  it('TC-433.02 [UC-IMPERIAL-DARK-CORNER-BASES-PBR/MSS] BatchedBoardTiles corner base material color contains #1C1612, roughness 0.22, metalness 0.20', () => {
    const markup = renderToStaticMarkup(
      React.createElement(BatchedBoardTiles, { isMobile: false })
    );
    expect(markup).toMatch(/data-testid="batched-corner-bases"[^>]*>[\s\S]*?color="#1C1612"/);
    expect(markup).toMatch(/data-testid="batched-corner-bases"[^>]*>[\s\S]*?roughness="0.22"/);
    expect(markup).toMatch(/data-testid="batched-corner-bases"[^>]*>[\s\S]*?metalness="0.2"/);
  });

  it('TC-433.03 [UC-IVORY-MARBLE-BACKGROUND-CANVAS/MSS] drawTileHeader with INDOCHINE_TILE_THEME fills background with #FDFBF7', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Missing 2d context');

    const meta = TILE_METADATA_MAP[1] ?? {
      title: 'CẦN THƠ',
      subtitle: 'Cái Răng',
      bannerColor: '#8B4513',
      category: 'BĐS ĐÔ THỊ',
      icon: 'boat',
    };

    executeTileHeader(ctx, meta, 1, INDOCHINE_TILE_THEME);

    expect(INDOCHINE_TILE_THEME.background).toBe('#FDFBF7');
    const bgFill = recordedFills.find((f) => f.w === 256 && f.h === 340);
    expect(bgFill?.style).toBe('#FDFBF7');
  });

  it('TC-433.04 [UC-ANTIQUE-BRASS-INLAY-BORDER-CANVAS/MSS] drawFooter with INDOCHINE_TILE_THEME strokes perimeter with antique brass #C5A059 and lineWidth 3.5', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Missing 2d context');

    const meta = TILE_METADATA_MAP[1] ?? {
      title: 'CẦN THƠ',
      subtitle: 'Cái Răng',
      bannerColor: '#8B4513',
      category: 'BĐS ĐÔ THỊ',
      icon: 'boat',
    };

    executeFooter(ctx, meta, 1, INDOCHINE_TILE_THEME);

    expect(INDOCHINE_TILE_THEME.borderColor).toBe('#C5A059');
    expect(INDOCHINE_TILE_THEME.borderWidth).toBe(3.5);
    const borderStroke = recordedStrokeRects.find((r) => r.w === 252 && r.h === 336);
    expect(borderStroke?.style).toBe('#C5A059');
    expect(borderStroke?.lineWidth).toBe(3.5);
  });

  it('TC-433.05 [UC-ATLAS-PREFILL-AND-FALLBACK-PARITY/MSS] getBoardTileAtlas canvas pre-fill uses #FDFBF7 and BatchedBoardTiles null-atlas fallback uses #F5F3EF', () => {
    // 1. Texture Atlas Pre-Fill Verification
    clearTileAtlasCache();
    getBoardTileAtlas(true);
    const baseFill = recordedFills.find((f) => f.w === 2048 && f.h === 2048);
    expect(baseFill?.style).toBe('#FDFBF7');

    // 2. Headless SSR Null-Atlas Fallback Verification
    Object.defineProperty(globalThis, 'document', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    clearTileAtlasCache();
    const fallbackMarkup = renderToStaticMarkup(
      React.createElement(BatchedBoardTiles, { isMobile: false })
    );
    expect(fallbackMarkup).toMatch(/data-testid="batched-tile-surfaces"[^>]*>\s*<meshStandardMaterial[^>]*color="#F5F3EF"/);
  });
});
