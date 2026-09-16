// [TC-PIPT01/MSS..TC-PIPT04/A4][UI-S01/MSS][BR-UI-002] Contract Test Suite:
// Pure Ivory Price Text & Zero Black Pill Invariant
//
// Phê duyệt thiết kế từ Người dùng:
// "In chữ giá tiền trực tiếp lên nền giấy ngà (chữ than đen #0F172A sắc nét, không có khối hộp đen), khi có chủ mới hiện khay 3D đổi màu người chơi"
//
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Boundary & Range (Chốt 1: In chữ giá trực tiếp lên nền giấy ngà cho 22 ô BĐS & 6 ô hạ tầng, ZERO roundRect ở chân ô đất)
// Facet 2: State Reactivity (Chốt 2: Zero Black Pill khi chưa mua & Chốt 3: Bảo tồn khay 3D đổi màu người chơi khi ĐÃ CÓ CHỦ)
// Facet 3: Resource Disposal & Cache Integrity (Tính tất định, không rò rỉ GPU, strokeRect viền 5px #0F172A bảo toàn)
// Facet 4: Error Defense & Invariant Preservation (Chốt 4: Bảo tồn Action Badges 2D trên ô phi tài sản, viền chân đế OwnerBaseTrim & ToyPropertyBuildings)

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
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
  LayeredDioramaTile,
} from '../../src/client/3d/board_tile';
import {
  TILE_METADATA_MAP,
  formatPriceLabel,
} from '../../src/client/3d/tile_texture_data';
import { BoardCell, CellType, ColorGroup } from '../../src/domain/board_config';

// Mock Drei components for headless SSR static rendering
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    Billboard: ({ children, follow = true, ...props }: any) =>
      React.createElement('billboard', { follow: String(follow), ...props }, children),
    RoundedBox: ({ children, ...props }: any) =>
      React.createElement('roundedbox', props, children),
    Image: ({ scale, ...props }: any) =>
      React.createElement('drei-image', {
        ...props,
        scale: Array.isArray(scale) ? scale.join(',') : scale,
      }),
  };
});

// Mock R3F fiber hook
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

interface RecordedRoundRect {
  x: number;
  y: number;
  w: number;
  h: number;
  radii?: number | number[];
  fillStyle: string;
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

const sampleCanThoCell: BoardCell = {
  index: 1,
  name: 'Cần Thơ (Cái Răng)',
  type: CellType.Property,
  colorGroup: ColorGroup.Nau,
};

const sampleRailroadCell: BoardCell = {
  index: 5,
  name: 'Long Thành',
  type: CellType.Railroad,
};

const sampleChanceCell: BoardCell = {
  index: 7,
  name: 'Cơ Hội',
  type: CellType.Chance,
};

describe('[TC-PIPT01/MSS..TC-PIPT04/A4][UI-S01/MSS][BR-UI-002] Pure Ivory Price Text & Zero Black Pill Contract Suite', () => {
  let originalDocument: any;
  let originalConsoleError: typeof console.error;
  let recordedRoundRects: RecordedRoundRect[] = [];
  let recordedFillTexts: RecordedFillText[] = [];
  let recordedStrokeRects: RecordedStrokeRect[] = [];
  let currentFont = '';
  let currentFillStyle = '';
  let currentStrokeStyle = '';
  let currentLineWidth = 1;

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
      measureText: vi.fn().mockReturnValue({ width: 100 }),
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
              text: String(text),
              x,
              y,
              font: currentFont,
              fillStyle: currentFillStyle,
            });
          };
        }
        if (prop === 'roundRect') {
          return (x: number, y: number, w: number, h: number, radii?: any) => {
            recordedRoundRects.push({
              x,
              y,
              w,
              h,
              radii,
              fillStyle: currentFillStyle,
            });
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
      getContext: vi.fn((type: string) => {
        if (type === '2d') return mockCtx;
        return null;
      }),
    };

    (globalThis as any).document = {
      createElement: (tag: string) => {
        if (tag.toLowerCase() === 'canvas') return mockCanvas;
        return {};
      },
    };
  });

  afterEach(() => {
    (globalThis as any).document = originalDocument;
    clearTileTextureCache();
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE — CHỐT 1: IN GIÁ TRỰC TIẾP LÊN NỀN GIẤY NGÀ
  // =========================================================================
  describe('Facet 1: Boundary & Range — [CHỐT 1] In chữ giá trực tiếp lên nền giấy ngà cho 22 ô BĐS & 6 ô hạ tầng', () => {
    it.each(ALL_22_PROPERTY_TILES)(
      '[TC-PIPT01.01/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Property tile %i calls fillText with formatted price in charcoal #0F172A',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const expectedPriceText = formatPriceLabel(TILE_METADATA_MAP[cellIndex]?.price);
        const priceItem = recordedFillTexts.find(
          (t) => t.text === expectedPriceText && Math.abs(t.y - 300) <= 20
        );
        expect(priceItem).toBeDefined();
        expect(priceItem?.fillStyle.toUpperCase()).toBe('#0F172A');
      }
    );

    it.each(ALL_22_PROPERTY_TILES)(
      '[TC-PIPT01.02/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Property tile %i renders price text centered horizontally at x=128',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const expectedPriceText = formatPriceLabel(TILE_METADATA_MAP[cellIndex]?.price);
        const priceItem = recordedFillTexts.find(
          (t) => t.text === expectedPriceText && Math.abs(t.y - 300) <= 20
        );
        expect(priceItem).toBeDefined();
        expect(priceItem?.x).toBe(128);
      }
    );

    it.each(ALL_22_PROPERTY_TILES)(
      '[TC-PIPT01.03/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Property tile %i does NOT render any roundRect shape in footer area (y >= 260)',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const footerBoxes = recordedRoundRects.filter((r) => r.y >= 260);
        expect(footerBoxes).toHaveLength(0);
      }
    );

    it.each(ALL_6_INFRASTRUCTURE_TILES)(
      '[TC-PIPT01.04/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Infrastructure tile %i calls fillText with formatted price in charcoal #0F172A',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const expectedPriceText = formatPriceLabel(TILE_METADATA_MAP[cellIndex]?.price);
        const priceItem = recordedFillTexts.find(
          (t) => t.text === expectedPriceText && Math.abs(t.y - 300) <= 20
        );
        expect(priceItem).toBeDefined();
        expect(priceItem?.fillStyle.toUpperCase()).toBe('#0F172A');
      }
    );

    it.each(ALL_6_INFRASTRUCTURE_TILES)(
      '[TC-PIPT01.05/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Infrastructure tile %i renders price text centered horizontally at x=128',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const expectedPriceText = formatPriceLabel(TILE_METADATA_MAP[cellIndex]?.price);
        const priceItem = recordedFillTexts.find(
          (t) => t.text === expectedPriceText && Math.abs(t.y - 300) <= 20
        );
        expect(priceItem).toBeDefined();
        expect(priceItem?.x).toBe(128);
      }
    );

    it.each(ALL_6_INFRASTRUCTURE_TILES)(
      '[TC-PIPT01.06/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Infrastructure tile %i does NOT render any roundRect shape in footer area (y >= 260)',
      (cellIndex) => {
        clearTileTextureCache();
        getTileTexture(cellIndex);
        const footerBoxes = recordedRoundRects.filter((r) => r.y >= 260);
        expect(footerBoxes).toHaveLength(0);
      }
    );
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY — CHỐT 2 & CHỐT 3: ZERO BLACK PILL & 3D RECOLOR
  // =========================================================================
  describe('Facet 2: State Reactivity — [CHỐT 2] Triệt tiêu khay hộp đen 3D khi chưa mua & [CHỐT 3] Khay 3D đổi màu khi có chủ', () => {
    // Chốt 2: Triệt tiêu 100% khay hộp đen 3D khi chưa mua (Zero Black Pill Invariant)
    it('[TC-PIPT02.01/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Khi ownerColor bị bỏ qua (unowned), OwnerPricePill KHÔNG render mesh màu than đen #090D1A', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1 })
      );
      expect(markup).not.toContain('color="#090D1A"');
    });

    it('[TC-PIPT02.02/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Khi ownerColor bị bỏ qua (unowned), OwnerPricePill KHÔNG render viền than sẫm #1E293B', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1 })
      );
      expect(markup).not.toContain('color="#1E293B"');
    });

    it('[TC-PIPT02.03/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Khi ownerColor bị bỏ qua (unowned), OwnerPricePill trả về null hoặc không chứa root group data-testid="owner-price-pill"', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1 })
      );
      expect(markup).not.toContain('data-testid="owner-price-pill"');
    });

    it('[TC-PIPT02.04/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Khi ownerColor là chuỗi rỗng (""), OwnerPricePill không render hộp đen #090D1A', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1, ownerColor: '' })
      );
      expect(markup).not.toContain('color="#090D1A"');
      expect(markup).not.toContain('data-testid="owner-price-pill"');
    });

    it('[TC-PIPT02.05/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Khi ô hạ tầng (cellIndex 5) chưa mua, OwnerPricePill không render hộp đen #090D1A hay viền #1E293B', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 5 })
      );
      expect(markup).not.toContain('color="#090D1A"');
      expect(markup).not.toContain('color="#1E293B"');
    });

    it('[TC-PIPT02.06/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Khi ô tiện ích (cellIndex 12) chưa mua, OwnerPricePill không render hộp đen #090D1A hay viền #1E293B', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 12 })
      );
      expect(markup).not.toContain('color="#090D1A"');
      expect(markup).not.toContain('color="#1E293B"');
    });

    it('[TC-PIPT02.07/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Khi ô cao cấp (cellIndex 39) chưa mua, OwnerPricePill không render hộp đen #090D1A', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 39 })
      );
      expect(markup).not.toContain('color="#090D1A"');
      expect(markup).not.toContain('data-testid="owner-price-pill"');
    });

    it('[TC-PIPT02.08/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] LayeredDioramaTile khi chưa mua không render bất kỳ khối hộp đen #090D1A nào ở khay giá', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: sampleCanThoCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
        })
      );
      expect(markup).not.toContain('color="#090D1A"');
      expect(markup).not.toContain('color="#1E293B"');
    });

    // Chốt 3: Bảo tồn khay 3D đổi màu khi ĐÃ CÓ CHỦ (Active Ownership Reactivity)
    it('[TC-PIPT02.09/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Người chơi 1 (P1, Đỏ #DC2626): OwnerPricePill render khay 3D mang màu #DC2626', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1, ownerColor: '#DC2626' })
      );
      expect(markup).toContain('data-testid="owner-price-pill"');
      expect(markup).toContain('color="#DC2626"');
    });

    it('[TC-PIPT02.10/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Người chơi 2 (P2, Xanh Lá #27AE60): OwnerPricePill render khay 3D mang màu #27AE60', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1, ownerColor: '#27AE60' })
      );
      expect(markup).toContain('data-testid="owner-price-pill"');
      expect(markup).toContain('color="#27AE60"');
    });

    it('[TC-PIPT02.11/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Người chơi 3 (P3, Cam #E67E22): OwnerPricePill render khay 3D mang màu #E67E22', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1, ownerColor: '#E67E22' })
      );
      expect(markup).toContain('data-testid="owner-price-pill"');
      expect(markup).toContain('color="#E67E22"');
    });

    it('[TC-PIPT02.12/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Người chơi 4 (P4, Lục Bảo #10B981): OwnerPricePill render khay 3D mang màu #10B981', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1, ownerColor: '#10B981' })
      );
      expect(markup).toContain('data-testid="owner-price-pill"');
      expect(markup).toContain('color="#10B981"');
    });

    it('[TC-PIPT02.13/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Khi ô đất có chủ, OwnerPricePill sở hữu khung viền kim loại vàng hoàng gia #F59E0B', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1, ownerColor: '#DC2626' })
      );
      expect(markup).toContain('color="#F59E0B"');
    });

    it('[TC-PIPT02.14/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Khi ô đất có chủ, OwnerPricePill chứa nhãn giá với data-testid="owner-price-label"', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1, ownerColor: '#DC2626' })
      );
      expect(markup).toContain('data-testid="owner-price-label"');
      expect(markup).toContain('data-price-label="600 Tr."');
    });

    it('[TC-PIPT02.15/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Dynamic price resolution khi có chủ: ô hạ tầng cellIndex 5 hiển thị nhãn 2.000 Tr.', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 5, ownerColor: '#27AE60' })
      );
      expect(markup).toContain('data-price-label="2.000 Tr."');
    });

    it('[TC-PIPT02.16/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Dynamic price resolution khi có chủ: ô tiện ích cellIndex 12 hiển thị nhãn 1.500 Tr.', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 12, ownerColor: '#E67E22' })
      );
      expect(markup).toContain('data-price-label="1.500 Tr."');
    });

    it('[TC-PIPT02.17/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Dynamic price resolution khi có chủ: ô cao cấp cellIndex 39 hiển thị nhãn 4.000 Tr.', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 39, ownerColor: '#10B981' })
      );
      expect(markup).toContain('data-price-label="4.000 Tr."');
    });

    it('[TC-PIPT02.18/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] OwnerPricePill tuân thủ thuộc tính priceLabel ghi đè khi được cung cấp', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, {
          cellIndex: 1,
          ownerColor: '#DC2626',
          priceLabel: 'VIP 9.999 Tr.',
        })
      );
      expect(markup).toContain('data-price-label="VIP 9.999 Tr."');
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & CACHE INTEGRITY
  // =========================================================================
  describe('Facet 3: Resource Disposal & Cache Integrity — Tính Tất Định & Quản Lý Bộ Nhớ GPU', () => {
    it('[TC-PIPT03.01/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] clearTileTextureCache giải phóng hoàn toàn bộ nhớ cache', () => {
      const t1 = getTileTexture(1);
      clearTileTextureCache();
      const t2 = getTileTexture(1);
      expect(t1).toBeDefined();
      expect(t2).toBeDefined();
      expect(t1).not.toBe(t2);
    });

    it('[TC-PIPT03.02/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] getTileTexture tái sử dụng texture từ cache (idempotency, zero GPU leak)', () => {
      const t1 = getTileTexture(1);
      const t2 = getTileTexture(1);
      expect(t1).toBe(t2);
    });

    it('[TC-PIPT03.03/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] Tính tất định khi render OwnerPricePill sinh markup hoàn toàn đồng nhất', () => {
      const m1 = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1, ownerColor: '#DC2626' })
      );
      const m2 = renderToStaticMarkup(
        React.createElement(OwnerPricePill, { cellIndex: 1, ownerColor: '#DC2626' })
      );
      expect(m1).toBe(m2);
    });

    it('[TC-PIPT03.04/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] Viền ngoài strokeRect 5px màu than #0F172A tại (2, 2, 252, 336) luôn được bảo toàn', () => {
      getTileTexture(1);
      const border = recordedStrokeRects.find(
        (r) => r.x === 2 && r.y === 2 && r.w === 252 && r.h === 336
      );
      expect(border).toBeDefined();
      expect(border?.lineWidth).toBe(5);
      expect(border?.strokeStyle).toBe('#0F172A');
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & INVARIANT PRESERVATION (CHỐT 4)
  // =========================================================================
  describe('Facet 4: Error Defense & Invariant Preservation — [CHỐT 4] Bảo tồn Action Badges & Viền Chân Đế', () => {
    it('[TC-PIPT04.01/MSS][UI-S01/MSS][BR-UI-002][Facet4-Preservation] Ô Cơ Hội (cellIndex 7) bảo tồn Action Badge cam #EA580C với nhãn "RÚT THẺ CƠ HỘI"', () => {
      getTileTexture(7);
      const badge = recordedRoundRects.find((r) => r.y === 274);
      expect(badge).toBeDefined();
      expect(badge?.fillStyle).toBe('#EA580C');
      const actionText = recordedFillTexts.find((t) => t.text === 'RÚT THẺ CƠ HỘI');
      expect(actionText).toBeDefined();
    });

    it('[TC-PIPT04.02/MSS][UI-S01/MSS][BR-UI-002][Facet4-Preservation] Ô Thị Trường (cellIndex 2) bảo tồn Action Badge xanh mòng két #0D9488 với nhãn "RÚT THẺ THỊ TRƯỜNG"', () => {
      getTileTexture(2);
      const badge = recordedRoundRects.find((r) => r.y === 274);
      expect(badge).toBeDefined();
      expect(badge?.fillStyle).toBe('#0D9488');
      const actionText = recordedFillTexts.find((t) => t.text === 'RÚT THẺ THỊ TRƯỜNG');
      expect(actionText).toBeDefined();
    });

    it('[TC-PIPT04.03/MSS][UI-S01/MSS][BR-UI-002][Facet4-Preservation] Ô Lệ Phí (cellIndex 4) bảo tồn Action Badge đỏ hồng #E11D48 với nhãn "NỘP 1.000 TR."', () => {
      getTileTexture(4);
      const badge = recordedRoundRects.find((r) => r.y === 274);
      expect(badge).toBeDefined();
      expect(badge?.fillStyle).toBe('#E11D48');
      const actionText = recordedFillTexts.find((t) => t.text === 'NỘP 1.000 TR.');
      expect(actionText).toBeDefined();
    });

    it('[TC-PIPT04.04/MSS][UI-S01/MSS][BR-UI-002][Facet4-Preservation] Ô HOSE (cellIndex 38) bảo tồn Action Badge xanh da trời #0284C7 với nhãn "1D6 ĐẶT CƯỢC"', () => {
      getTileTexture(38);
      const badge = recordedRoundRects.find((r) => r.y === 274);
      expect(badge).toBeDefined();
      expect(badge?.fillStyle).toBe('#0284C7');
      const actionText = recordedFillTexts.find((t) => t.text === '1D6 ĐẶT CƯỢC');
      expect(actionText).toBeDefined();
    });

    it('[TC-PIPT04.05/MSS][UI-S01/MSS][BR-UI-002][Facet4-Preservation] Ô phi tài sản (Cơ hội index 7) trong LayeredDioramaTile không render OwnerPricePill', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: sampleChanceCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
        })
      );
      expect(markup).not.toContain('data-testid="owner-price-pill"');
    });

    it('[TC-PIPT04.06/MSS][UI-S01/MSS][BR-UI-002][Facet4-ErrorDefense] OwnerPricePill với cellIndex vượt giới hạn (999) hoạt động an toàn không ném ngoại lệ', () => {
      expect(() =>
        renderToStaticMarkup(
          React.createElement(OwnerPricePill, { cellIndex: 999, ownerColor: '#DC2626' })
        )
      ).not.toThrow();
    });

    it('[TC-PIPT04.07/MSS][UI-S01/MSS][BR-UI-002][Facet4-ErrorDefense] OwnerPricePill với cellIndex âm (-1) hoạt động an toàn không ném ngoại lệ', () => {
      expect(() =>
        renderToStaticMarkup(
          React.createElement(OwnerPricePill, { cellIndex: -1 })
        )
      ).not.toThrow();
    });

    it('[TC-PIPT04.08/MSS][UI-S01/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn 100% viền chân đế ô đất OwnerBaseTrim mang màu người chơi khi có chủ', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: sampleCanThoCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#DC2626',
        })
      );
      expect(markup).toContain('data-testid="owner-base-trim"');
      expect(markup).toContain('color="#DC2626"');
    });

    it('[TC-PIPT04.09/MSS][UI-S01/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn các khối nhà đồ chơi ToyPropertyBuildings khi level >= 1', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: sampleCanThoCell,
          position: [0, 0, 0],
          currentLevel: 1,
          isCornerTile: false,
          ownerColor: '#DC2626',
        })
      );
      expect(markup).toContain('data-testid="toy-property-building"');
    });
  });
});
