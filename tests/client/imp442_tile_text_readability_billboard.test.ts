// [TC-442.01..TC-442.06][UI-S02/MSS] Contract Test Suite: Bilateral Tile Text Readability (IMP-442)
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

describe('[IMP-442] Bilateral Tile Text Readability Contract Suite', () => {
  describe('Facet 1: Property Tile Bilateral Dual-Direction Header', () => {
    it('TC-442.01 [UC-BILATERAL-PROP-TRANSFORM/MSS]: Given property cell 11 (Bình Thuận), When drawPropertyHeader executes, Then applies atomic translate(128, 10) and rotate(PI)', () => {
      const { ctx, transformCalls } = createMockContext();
      const meta = getRequiredMeta(11);

      drawPropertyHeader(ctx, meta);

      const translateCall = transformCalls.find(
        (c) => c.method === 'translate' && c.args[0] === 128 && c.args[1] === 10
      );
      const rotateCall = transformCalls.find(
        (c) => c.method === 'rotate' && c.args[0] !== undefined && Math.abs(c.args[0] - Math.PI) < 0.001
      );
      expect(translateCall).toBeDefined();
      expect(rotateCall).toBeDefined();
    });

    it('TC-442.02 [UC-BILATERAL-PROP-TEXT/MSS]: Given property cell 11, When drawPropertyHeader executes, Then renders inverted micro-title and preserves forward title at y=28', () => {
      const { ctx, fillTextCalls } = createMockContext();
      const meta = getRequiredMeta(11);

      drawPropertyHeader(ctx, meta);

      const invertedText = fillTextCalls.find(
        (c) => c.text === meta.title && c.x === 0 && c.y === 0
      );
      const primaryTitle = fillTextCalls.find(
        (c) => c.text === meta.title && c.x === 128 && c.y === 28
      );
      expect(invertedText).toBeDefined();
      expect(invertedText?.font).toContain('11px');
      expect(primaryTitle).toBeDefined();
    });

    it('TC-442.03 [UC-BILATERAL-PROP-CONTRAST/MSS]: Given dark banner cell 1 (Tràng Tiền), When drawPropertyHeader renders, Then inverted title uses contrast color #FFFFFF', () => {
      const { ctx, fillTextCalls } = createMockContext();
      const meta = getRequiredMeta(1);

      drawPropertyHeader(ctx, meta);

      const invertedCall = fillTextCalls.find(
        (c) => c.text === meta.title && c.x === 0 && c.y === 0
      );
      expect(invertedCall?.fillStyle).toBe('#FFFFFF');
    });
  });

  describe('Facet 2: Non-Property Tile Bilateral Dual-Direction Header', () => {
    it('TC-442.04 [UC-BILATERAL-NONPROP-TRANSFORM/MSS]: Given railroad cell 5 (Long Thành), When drawNonPropertyHeader executes, Then applies atomic translate(128, 10) and rotate(PI)', () => {
      const { ctx, transformCalls } = createMockContext();
      const meta = getRequiredMeta(5);

      drawNonPropertyHeader(ctx, meta, 5);

      const translateCall = transformCalls.find(
        (c) => c.method === 'translate' && c.args[0] === 128 && c.args[1] === 10
      );
      const rotateCall = transformCalls.find(
        (c) => c.method === 'rotate' && c.args[0] !== undefined && Math.abs(c.args[0] - Math.PI) < 0.001
      );
      expect(translateCall).toBeDefined();
      expect(rotateCall).toBeDefined();
    });

    it('TC-442.05 [UC-BILATERAL-NONPROP-TEXT/MSS]: Given non-property cell 5, When drawNonPropertyHeader executes, Then renders inverted micro-title with #64748B and preserves forward title at y=30', () => {
      const { ctx, fillTextCalls } = createMockContext();
      const meta = getRequiredMeta(5);

      drawNonPropertyHeader(ctx, meta, 5);

      const invertedText = fillTextCalls.find(
        (c) => c.text === meta.title && c.x === 0 && c.y === 0
      );
      const primaryTitle = fillTextCalls.find(
        (c) => c.text === meta.title && c.x === 128 && c.y === 30
      );
      expect(invertedText).toBeDefined();
      expect(invertedText?.fillStyle).toBe('#64748B');
      expect(primaryTitle).toBeDefined();
    });
  });

  describe('Facet 3: Transform Isolation & Matrix Hygiene', () => {
    it('TC-442.06 [UC-TRANSFORM-ISOLATION/MSS]: Given drawPropertyHeader, When rendered, Then save and restore calls are strictly balanced', () => {
      const { ctx, transformCalls } = createMockContext();
      const meta = getRequiredMeta(11);

      drawPropertyHeader(ctx, meta);

      const saveCount = transformCalls.filter((c) => c.method === 'save').length;
      const restoreCount = transformCalls.filter((c) => c.method === 'restore').length;
      expect(saveCount).toBeGreaterThanOrEqual(1);
      expect(saveCount).toBe(restoreCount);
    });
  });
});
