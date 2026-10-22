// [TC-442.01..TC-442.06][UI-S02/MSS] Contract Test Suite: Clean Tile Header Readability (IMP-442 Clean Typography)
import { describe, it, expect, vi } from 'vitest';
import {
  drawPropertyHeader,
  drawNonPropertyHeader,
} from '../../src/client/3d/tile_texture_drawers';
import { TILE_METADATA_MAP, type TileMetadata } from '../../src/client/3d/tile_texture_data';

interface TransformCall {
  method: 'translate' | 'rotate' | 'save' | 'restore';
  args: number[];
}

interface FillTextCall {
  text: string;
  x: number;
  y: number;
  font: string;
  fillStyle: string;
}

function createMockContext() {
  const transformCalls: TransformCall[] = [];
  const fillTextCalls: FillTextCall[] = [];
  let currentFont = '';
  let currentFillStyle = '';

  const mockCtx = {
    get font(): string {
      return currentFont;
    },
    set font(val: string) {
      currentFont = val;
    },
    get fillStyle(): string {
      return currentFillStyle;
    },
    set fillStyle(val: string) {
      currentFillStyle = val;
    },
    strokeStyle: '',
    lineWidth: 1,
    textAlign: '',
    textBaseline: '',
    save: vi.fn(() => {
      transformCalls.push({ method: 'save', args: [] });
    }),
    restore: vi.fn(() => {
      transformCalls.push({ method: 'restore', args: [] });
    }),
    translate: vi.fn((x: number, y: number) => {
      transformCalls.push({ method: 'translate', args: [x, y] });
    }),
    rotate: vi.fn((angle: number) => {
      transformCalls.push({ method: 'rotate', args: [angle] });
    }),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    strokeText: vi.fn(),
    fillText: vi.fn((text: string, x: number, y: number) => {
      fillTextCalls.push({
        text,
        x,
        y,
        font: currentFont,
        fillStyle: currentFillStyle,
      });
    }),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
  };

  const handler: ProxyHandler<object> = {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      return vi.fn();
    },
  };

  const ctx = new Proxy(mockCtx, handler) as CanvasRenderingContext2D;
  return { ctx, transformCalls, fillTextCalls };
}

function getRequiredMeta(cellIndex: number): TileMetadata {
  const meta = TILE_METADATA_MAP[cellIndex];
  if (!meta) {
    throw new Error(`Tile metadata for cell ${cellIndex} is undefined`);
  }
  return meta;
}

describe('[IMP-442] Clean Tile Text Readability Contract Suite', () => {
  describe('Facet 1: Property Tile Clean Header', () => {
    it('TC-442.01 [UC-CLEAN-PROP-TRANSFORM/MSS]: Given property cell 11 (Bình Thuận), When drawPropertyHeader executes, Then operates without unnecessary matrix rotation', () => {
      const { ctx, transformCalls } = createMockContext();
      const meta = getRequiredMeta(11);

      drawPropertyHeader(ctx, meta);

      const rotateCall = transformCalls.find((c) => c.method === 'rotate');
      expect(rotateCall).toBeUndefined();
    });

    it('TC-442.02 [UC-CLEAN-PROP-TEXT/MSS]: Given property cell 11, When drawPropertyHeader executes, Then renders only clean primary title at y=28 with 0 inverted micro-title', () => {
      const { ctx, fillTextCalls } = createMockContext();
      const meta = getRequiredMeta(11);

      drawPropertyHeader(ctx, meta);

      const invertedText = fillTextCalls.find(
        (c) => c.text === meta.title && c.x === 0 && c.y === 0
      );
      const primaryTitle = fillTextCalls.find(
        (c) => c.text === meta.title && c.x === 128 && c.y === 28
      );
      expect(invertedText).toBeUndefined();
      expect(primaryTitle).toBeDefined();
    });

    it('TC-442.03 [UC-CLEAN-PROP-CONTRAST/MSS]: Given dark banner cell 1 (Tràng Tiền), When drawPropertyHeader renders, Then primary title uses contrast color #FFFFFF', () => {
      const { ctx, fillTextCalls } = createMockContext();
      const meta = getRequiredMeta(1);

      drawPropertyHeader(ctx, meta);

      const primaryCall = fillTextCalls.find(
        (c) => c.text === meta.title && c.x === 128 && c.y === 28
      );
      expect(primaryCall?.fillStyle).toBe('#FFFFFF');
    });
  });

  describe('Facet 2: Non-Property Tile Clean Header', () => {
    it('TC-442.04 [UC-CLEAN-NONPROP-TRANSFORM/MSS]: Given railroad cell 5 (Long Thành), When drawNonPropertyHeader executes, Then operates without rotate transform', () => {
      const { ctx, transformCalls } = createMockContext();
      const meta = getRequiredMeta(5);

      drawNonPropertyHeader(ctx, meta, 5);

      const rotateCall = transformCalls.find((c) => c.method === 'rotate');
      expect(rotateCall).toBeUndefined();
    });

    it('TC-442.05 [UC-CLEAN-NONPROP-TEXT/MSS]: Given non-property cell 5, When drawNonPropertyHeader executes, Then renders primary title at y=30 with 0 inverted micro-title', () => {
      const { ctx, fillTextCalls } = createMockContext();
      const meta = getRequiredMeta(5);

      drawNonPropertyHeader(ctx, meta, 5);

      const invertedText = fillTextCalls.find(
        (c) => c.text === meta.title && c.x === 0 && c.y === 0
      );
      const primaryTitle = fillTextCalls.find(
        (c) => c.text === meta.title && c.x === 128 && c.y === 30
      );
      expect(invertedText).toBeUndefined();
      expect(primaryTitle).toBeDefined();
    });
  });

  describe('Facet 3: Transform Isolation & Matrix Hygiene', () => {
    it('TC-442.06 [UC-TRANSFORM-ISOLATION/MSS]: Given drawPropertyHeader, When rendered, Then matrix transforms remain completely unpolluted', () => {
      const { ctx, transformCalls } = createMockContext();
      const meta = getRequiredMeta(11);

      drawPropertyHeader(ctx, meta);

      const saveCount = transformCalls.filter((c) => c.method === 'save').length;
      const restoreCount = transformCalls.filter((c) => c.method === 'restore').length;
      expect(saveCount).toBe(restoreCount);
    });
  });
});
