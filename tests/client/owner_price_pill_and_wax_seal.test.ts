// [TC-OPWS01/MSS..TC-OPWS04/A4][UI-S02/MSS][BR-UI-002] Contract Test Suite: Pure Color Owner Price Pill & Zero Land Marker (IMP-98)
// Traceability: docs/epics/networking/_epic_ledger.md § IMP-98 / Pure Color Distinction & Heritage Art Freedom
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Boundary & Range (Tọa độ khay giá Z [0.65, 0.75], X = 0 căn giữa, Y [0.11, 0.13], args width >= 1.3m, depth >= 0.01m, text position = [0, 0.008, 0])
// Facet 2: State Reactivity & Visual Hierarchy (Khay Giá đổi màu theo 4 người chơi P1=#DC2626, P2=#27AE60, P3=#E67E22, P4=#10B981, viền vàng #F59E0B, ZERO icon mascot trên pill, text 600 Tr. chữ trắng #FFFFFF)
// Facet 3: Resource Disposal & Lifecycle Stability (Tính tất định Idempotent Render, price canvas texture upload, cache texture)
// Facet 4: Error Defense & Preservation Invariants (Zero-Land-Marker, Zero-Wax-Seal, Zero-Flawed-Flagpole, Bảo tồn OwnerBaseTrim và ToyPropertyBuildings, Zero NaN)

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LayeredDioramaTile } from '../../src/client/3d/board_tile';
import { CellType, ColorGroup, type BoardCell } from '../../src/domain/board_config';
import { getPriceCanvasTexture } from '../../src/client/3d/owner_property_markers';

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

// Domain Test Fixtures
const sampleCanThoCell: BoardCell = {
  index: 1,
  name: 'Cần Thơ (Cái Răng)',
  type: CellType.Property,
  colorGroup: ColorGroup.Nau,
};

const sampleHanoiCell: BoardCell = {
  index: 34,
  name: 'Hà Nội (Hoàn Kiếm)',
  type: CellType.Property,
  colorGroup: ColorGroup.XanhLa,
};

const sampleRailroadCell: BoardCell = {
  index: 5,
  name: 'Bến Xe Miền Tây',
  type: CellType.Railroad,
};

const sampleChanceCell: BoardCell = {
  index: 7,
  name: 'Cơ Hội',
  type: CellType.Chance,
};

// Dynamic Component Resolvers for Station 1 RED -> Station 2 GREEN
export type OwnerPricePillComponentType = React.ComponentType<{
  price?: number;
  priceLabel?: string;
  ownerColor?: string;
  mascotIcon?: string;
  isPurchasable?: boolean;
  position?: [number, number, number];
}>;

let OwnerPricePill: OwnerPricePillComponentType | null = null;

try {
  const boardMod = await import('../../src/client/3d/board_tile');
  OwnerPricePill = (boardMod as any)?.OwnerPricePill ?? null;
} catch {
  OwnerPricePill = null;
}

if (!OwnerPricePill) {
  try {
    const pillMod = await import(/* @vite-ignore */ '../../src/client/3d/owner_price_pill');
    OwnerPricePill = pillMod?.OwnerPricePill ?? null;
  } catch {
    // Implementer will provide in Station 2
  }
}

// Extraction Helpers for rendered Three.js markup
function extractElementSection(markup: string, testId: string, windowSize = 800): string {
  const index = markup.indexOf(`data-testid="${testId}"`);
  if (index === -1) return '';
  return markup.slice(Math.max(0, index - 150), index + windowSize);
}

function extractTagAttributes(markup: string, testId: string): Record<string, string> {
  const index = markup.indexOf(`data-testid="${testId}"`);
  if (index === -1) return {};
  const tagStart = markup.lastIndexOf('<', index);
  const tagEnd = markup.indexOf('>', index);
  if (tagStart === -1 || tagEnd === -1) return {};
  const tagContent = markup.slice(tagStart, tagEnd);

  const attrs: Record<string, string> = {};
  const regex = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(tagContent)) !== null) {
    if (m[1] && m[2] !== undefined) {
      attrs[m[1]] = m[2];
    }
  }
  return attrs;
}

function extractPosition(markup: string, testId: string): [number, number, number] | null {
  const attrs = extractTagAttributes(markup, testId);
  if (!attrs.position) {
    const section = extractElementSection(markup, testId, 400);
    if (!section) return null;
    const match = section.match(/position="([^"]+)"/);
    if (!match || !match[1]) return null;
    const parts = match[1].split(',').map(Number);
    return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
  }
  const parts = attrs.position.split(',').map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

interface MockCanvasHarness {
  mockCanvas: any;
  mockCtx: any;
  fillTextSpy: any;
  fillRectSpy: any;
  restore: () => void;
}

function setupMockCanvas(): MockCanvasHarness {
  const fillTextSpy = vi.fn();
  const fillRectSpy = vi.fn();
  const fillSpy = vi.fn();
  const strokeSpy = vi.fn();
  const strokeTextSpy = vi.fn();
  const clearRectSpy = vi.fn();

  const baseCtx: any = {
    canvas: { width: 256, height: 64 },
    font: '',
    textAlign: '',
    textBaseline: '',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    fillText: fillTextSpy,
    fillRect: fillRectSpy,
    fill: fillSpy,
    stroke: strokeSpy,
    strokeText: strokeTextSpy,
    beginPath: vi.fn(),
    closePath: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    clearRect: clearRectSpy,
    measureText: vi.fn().mockReturnValue({ width: 100 }),
    roundRect: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
  };

  const mockCtx = new Proxy(baseCtx, {
    get(target, prop) {
      if (prop in target) return target[prop];
      return vi.fn();
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  });

  const mockCanvas = {
    width: 256,
    height: 64,
    getContext: vi.fn((type: string) => {
      if (type === '2d') return mockCtx;
      return null;
    }),
  };

  const originalDocument = (globalThis as any).document;
  (globalThis as any).document = {
    createElement: vi.fn((tag: string) => {
      if (tag.toLowerCase() === 'canvas') {
        return mockCanvas;
      }
      return {};
    }),
  };

  return {
    mockCanvas,
    mockCtx,
    fillTextSpy,
    fillRectSpy,
    restore: () => {
      if (originalDocument === undefined) {
        delete (globalThis as any).document;
      } else {
        (globalThis as any).document = originalDocument;
      }
    },
  };
}

describe('[TC-OPWS01/MSS..TC-OPWS04/A4][UI-S02/MSS][BR-UI-002] Pure Color Owner Price Pill & Zero Land Marker Contract Suite', () => {
  let originalConsoleError: typeof console.error;
  let canvasHarness: MockCanvasHarness;

  let ownedTileCanThoMarkup = '';
  let unownedTileCanThoMarkup = '';
  let ownedTileCatMarkup = '';
  let ownedTileHanoiMarkup = '';
  let ownedTileP4Markup = '';
  let ownedTileLevel1Markup = '';
  let chanceTileMarkup = '';
  let railroadTileMarkup = '';

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

    canvasHarness = setupMockCanvas();

    // P1: #DC2626 (Đỏ)
    ownedTileCanThoMarkup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: sampleCanThoCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
        ownerColor: '#DC2626',
        ownerSlot: 0,
        mascotIcon: '🐕',
      })
    );

    // Chưa mua
    unownedTileCanThoMarkup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: sampleCanThoCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
      })
    );

    // P2: #27AE60 (Xanh Lá)
    ownedTileCatMarkup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: sampleCanThoCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
        ownerColor: '#27AE60',
        ownerSlot: 1,
        mascotIcon: '🐈',
      })
    );

    // P3: #E67E22 (Cam)
    ownedTileHanoiMarkup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: sampleHanoiCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
        ownerColor: '#E67E22',
        ownerSlot: 2,
        mascotIcon: '🐎',
      })
    );

    // P4: #10B981 (Lục Bảo)
    ownedTileP4Markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: sampleCanThoCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
        ownerColor: '#10B981',
        ownerSlot: 3,
        mascotIcon: '🐘',
      })
    );

    // Level 1 có nhà đồ chơi
    ownedTileLevel1Markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: sampleCanThoCell,
        position: [0, 0, 0],
        currentLevel: 1,
        isCornerTile: false,
        ownerColor: '#DC2626',
        ownerSlot: 0,
        mascotIcon: '🐕',
      })
    );

    // Ô Cơ Hội
    chanceTileMarkup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: sampleChanceCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
        ownerColor: '#DC2626',
        ownerSlot: 0,
        mascotIcon: '🐕',
      })
    );

    // Ô Đường Sắt
    railroadTileMarkup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: sampleRailroadCell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
        ownerColor: '#DC2626',
        ownerSlot: 0,
        mascotIcon: '🐕',
      })
    );
  });

  afterAll(() => {
    console.error = originalConsoleError;
    canvasHarness.restore();
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (TỌA ĐỘ ĐÁY, CĂN GIỮA TUYỆT ĐỐI & KÍCH THƯỚC)
  // =========================================================================
  describe('Facet 1: Boundary & Range — Tọa Độ Khay Giá Đáy, Căn Giữa Tuyệt Đối & Kích Thước', () => {
    it('[TC-OPWS01.01/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] owner-price-pill có tọa độ Z nằm trong khoảng [0.65, 0.75] tại đáy ô đất', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-price-pill"');
      const pos = extractPosition(ownedTileCanThoMarkup, 'owner-price-pill');
      expect(pos).not.toBeNull();
      expect(pos![2]).toBeGreaterThanOrEqual(0.65);
      expect(pos![2]).toBeLessThanOrEqual(0.75);
    });

    it('[TC-OPWS01.02/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] owner-price-pill có bề rộng ngang args width >= 1.3m và độ dày >= 0.01m', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-price-pill"');
      const section = extractElementSection(ownedTileCanThoMarkup, 'owner-price-pill', 600);
      const argsMatch = section.match(/args="([^"]+)"/);
      expect(argsMatch).not.toBeNull();
      const args = (argsMatch?.[1] ?? '').split(',').map(Number);
      expect(args[0]).toBeGreaterThanOrEqual(1.3);
      expect(args[1] ?? args[2]).toBeGreaterThanOrEqual(0.01);
    });

    it('[TC-OPWS01.03/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] owner-price-pill có cao độ Y nằm trong khoảng [0.11, 0.13] nổi tinh tế trên mặt đế', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-price-pill"');
      const pos = extractPosition(ownedTileCanThoMarkup, 'owner-price-pill');
      expect(pos).not.toBeNull();
      expect(pos![1]).toBeGreaterThanOrEqual(0.11);
      expect(pos![1]).toBeLessThanOrEqual(0.13);
    });

    it('[TC-OPWS01.04/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] owner-price-pill được căn giữa ô đất với tọa độ X = 0 (symmetry invariant)', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-price-pill"');
      const pos = extractPosition(ownedTileCanThoMarkup, 'owner-price-pill');
      expect(pos).not.toBeNull();
      expect(pos![0]).toBe(0);
    });

    it('[TC-OPWS01.05/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] owner-price-label nhãn giá tiền khi có chủ được căn giữa tuyệt đối tại tọa độ X = 0 ([0, 0.008, 0])', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-price-label"');
      const pos = extractPosition(ownedTileCanThoMarkup, 'owner-price-label');
      expect(pos).not.toBeNull();
      expect(pos![0]).toBe(0);
      expect(pos![1]).toBeCloseTo(0.008, 3);
    });

    it('[TC-OPWS01.06/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] owner-price-label nhãn giá tiền khi chưa mua cũng được căn giữa tuyệt đối tại tọa độ X = 0 ([0, 0.008, 0])', () => {
      expect(unownedTileCanThoMarkup).toContain('data-testid="owner-price-label"');
      const pos = extractPosition(unownedTileCanThoMarkup, 'owner-price-label');
      expect(pos).not.toBeNull();
      expect(pos![0]).toBe(0);
      expect(pos![1]).toBeCloseTo(0.008, 3);
    });

    it('[TC-OPWS01.07/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Kích thước planeGeometry của nhãn giá tiền trên khay giá đạt chuẩn hiển thị (width >= 0.7m, height >= 0.15m)', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-price-label"');
      const section = extractElementSection(ownedTileCanThoMarkup, 'owner-price-label', 400);
      const geomMatch = section.match(/(?:planeGeometry|planegeometry|args)="([^"]+)"/i);
      expect(geomMatch).not.toBeNull();
      const args = (geomMatch?.[1] ?? '').split(',').map(Number);
      expect(args[0]).toBeGreaterThanOrEqual(0.7);
      expect(args[1]).toBeGreaterThanOrEqual(0.15);
    });

    it('[TC-OPWS01.08/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Khung viền kim loại vàng hoàng gia args bao bọc lớn hơn thân khay giá (width >= 1.4m, depth >= 0.32m)', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-price-pill"');
      const section = extractElementSection(ownedTileCanThoMarkup, 'owner-price-pill', 800);
      const matches = [...section.matchAll(/args="([^"]+)"/g)];
      expect(matches.length).toBeGreaterThanOrEqual(2);
      const borderArgs = (matches[1]?.[1] ?? '').split(',').map(Number);
      expect(borderArgs[0]).toBeGreaterThanOrEqual(1.4);
      expect(borderArgs[2] ?? borderArgs[1]).toBeGreaterThanOrEqual(0.32);
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY & VISUAL HIERARCHY (TÔ MÀU 4 NGƯỜI CHƠI & TRIỆT TIÊU ICON)
  // =========================================================================
  describe('Facet 2: State Reactivity & Visual Hierarchy — Tô Màu Thuần Túy 4 Người Chơi & Triệt Tiêu Biểu Tượng', () => {
    it('[TC-OPWS02.01/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Người chơi 1 (P1, Đỏ): owner-price-pill chuyển nền sang màu #DC2626', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-price-pill"');
      const pillSection = extractElementSection(ownedTileCanThoMarkup, 'owner-price-pill', 800);
      expect(pillSection).toContain('#DC2626');
    });

    it('[TC-OPWS02.02/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Người chơi 2 (P2, Xanh Lá): owner-price-pill chuyển nền sang màu #27AE60', () => {
      expect(ownedTileCatMarkup).toContain('data-testid="owner-price-pill"');
      const pillSection = extractElementSection(ownedTileCatMarkup, 'owner-price-pill', 800);
      expect(pillSection).toContain('#27AE60');
    });

    it('[TC-OPWS02.03/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Người chơi 3 (P3, Cam): owner-price-pill chuyển nền sang màu #E67E22', () => {
      expect(ownedTileHanoiMarkup).toContain('data-testid="owner-price-pill"');
      const pillSection = extractElementSection(ownedTileHanoiMarkup, 'owner-price-pill', 800);
      expect(pillSection).toContain('#E67E22');
    });

    it('[TC-OPWS02.04/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Người chơi 4 (P4, Lục Bảo): owner-price-pill chuyển nền sang màu #10B981', () => {
      expect(ownedTileP4Markup).toContain('data-testid="owner-price-pill"');
      const pillSection = extractElementSection(ownedTileP4Markup, 'owner-price-pill', 800);
      expect(pillSection).toContain('#10B981');
    });

    it('[TC-OPWS02.05/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Khi ô đất đã có chủ, owner-price-pill sở hữu viền kim loại vàng hoàng gia #F59E0B', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-price-pill"');
      const pillSection = extractElementSection(ownedTileCanThoMarkup, 'owner-price-pill', 800);
      expect(pillSection).toContain('#F59E0B');
    });

    it('[TC-OPWS02.06/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Triệt tiêu linh vật: Khi ô đất đã có chủ, owner-price-pill KHÔNG chứa thuộc tính data-mascot-icon', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-price-pill"');
      const pillSection = extractElementSection(ownedTileCanThoMarkup, 'owner-price-pill', 800);
      expect(pillSection).not.toContain('data-mascot-icon');
    });

    it('[TC-OPWS02.07/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Triệt tiêu linh vật: Khi ô đất đã có chủ, owner-price-pill KHÔNG chứa mesh PillMascotIcon', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-price-pill"');
      const pillSection = extractElementSection(ownedTileCanThoMarkup, 'owner-price-pill', 800);
      expect(pillSection).not.toContain('PillMascotIcon');
    });

    it('[TC-OPWS02.08/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Khi ô đất đã có chủ, nhãn giá tiền hiển thị chữ trắng #FFFFFF trên nền màu người chơi', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-price-label"');
      const labelSection = extractElementSection(ownedTileCanThoMarkup, 'owner-price-label', 500);
      expect(labelSection).toContain('#FFFFFF');
    });

    it('[TC-OPWS02.09/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Khi ô đất đã có chủ, owner-price-pill hiển thị đúng nhãn giá tiền bất động sản định dạng Tr.', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-price-pill"');
      const pillSection = extractElementSection(ownedTileCanThoMarkup, 'owner-price-pill', 800);
      const hasPrice = pillSection.includes('600') || pillSection.includes('600 Tr.');
      expect(hasPrice).toBe(true);
    });

    it('[TC-OPWS02.10/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Khi ô đất chưa mua, owner-price-pill giữ nguyên nền than đen #090D1A, số vàng #FBBF24 và viền than sẫm #1E293B', () => {
      expect(unownedTileCanThoMarkup).toContain('data-testid="owner-price-pill"');
      const pillSection = extractElementSection(unownedTileCanThoMarkup, 'owner-price-pill', 800);
      expect(pillSection).toContain('#090D1A');
      expect(pillSection).toContain('#FBBF24');
      expect(pillSection).toContain('#1E293B');
    });

    it('[TC-OPWS02.11/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Chuyển đổi chủ sở hữu giữa các lượt chơi cập nhật phản ứng màu nền tức thì và không tạo ra bất kỳ icon linh vật nào', () => {
      expect(ownedTileCatMarkup).toContain('data-testid="owner-price-pill"');
      const pillSection = extractElementSection(ownedTileCatMarkup, 'owner-price-pill', 800);
      expect(pillSection).toContain('#27AE60');
      expect(pillSection).not.toContain('data-mascot-icon');
      expect(pillSection).not.toContain('PillMascotIcon');
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & LIFECYCLE STABILITY (TÍNH TẤT ĐỊNH & CACHE)
  // =========================================================================
  describe('Facet 3: Resource Disposal & Lifecycle Stability — Idempotency & GPU Upload', () => {
    it('[TC-OPWS03.01/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] CanvasTexture tạo cho nhãn giá tiền được khởi tạo hợp lệ và sẵn sàng cho GPU upload (version >= 1)', () => {
      const tex = getPriceCanvasTexture('600 Tr.', '#FFFFFF');
      expect(tex).toBeDefined();
      expect(tex?.version).toBeGreaterThanOrEqual(1);
    });

    it('[TC-OPWS03.02/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] Render lặp lại LayeredDioramaTile là tất định (idempotent) với markup hoàn toàn đồng nhất', () => {
      const r1 = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: sampleCanThoCell,
          position: [0, 0, 0],
          currentLevel: 1,
          isCornerTile: false,
          ownerColor: '#DC2626',
          ownerSlot: 0,
          mascotIcon: '🐕',
        })
      );
      const r2 = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: sampleCanThoCell,
          position: [0, 0, 0],
          currentLevel: 1,
          isCornerTile: false,
          ownerColor: '#DC2626',
          ownerSlot: 0,
          mascotIcon: '🐕',
        })
      );
      expect(r1).toBe(r2);
      expect(r1.length).toBeGreaterThan(100);
    });

    it('[TC-OPWS03.03/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] Tái sử dụng cùng một texture instance từ cache cho cùng cặp text và color giá tiền', () => {
      const t1 = getPriceCanvasTexture('1.200 Tr.', '#FFFFFF');
      const t2 = getPriceCanvasTexture('1.200 Tr.', '#FFFFFF');
      expect(t1).toBe(t2);
    });

    it('[TC-OPWS03.04/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] Standalone component OwnerPricePill được định nghĩa và xuất khẩu hợp lệ', () => {
      expect(OwnerPricePill).toBeDefined();
      expect(OwnerPricePill).not.toBeNull();
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & PRESERVATION INVARIANTS (ZERO LAND MARKER & BẢO TỒN)
  // =========================================================================
  describe('Facet 4: Error Defense & Preservation Invariants — Zero Land Marker, Zero Wax Seal & Bảo Tồn 100%', () => {
    it('[TC-OPWS04.01/MSS][UI-S02/MSS][BR-UI-002][Facet4-ZeroLandMarker] Zero-Wax-Seal: Mặt ô cờ có chủ BẮT BUỘC KHÔNG chứa con dấu sáp data-testid="deed-wax-seal"', () => {
      expect(ownedTileCanThoMarkup).not.toContain('data-testid="deed-wax-seal"');
    });

    it('[TC-OPWS04.02/MSS][UI-S02/MSS][BR-UI-002][Facet4-ZeroLandMarker] Zero-Wax-Seal: Mặt ô cờ có chủ BẮT BUỘC KHÔNG chứa component hoặc group TactileDeedWaxSeal', () => {
      expect(ownedTileCanThoMarkup).not.toContain('TactileDeedWaxSeal');
    });

    it('[TC-OPWS04.03/MSS][UI-S02/MSS][BR-UI-002][Facet4-ZeroLandMarker] Zero-Land-Marker: Mặt ô cờ có chủ BẮT BUỘC KHÔNG chứa thực thể name="OwnershipMarkerInstances"', () => {
      expect(ownedTileCanThoMarkup).not.toContain('name="OwnershipMarkerInstances"');
    });

    it('[TC-OPWS04.04/MSS][UI-S02/MSS][BR-UI-002][Facet4-ZeroFlagpole] Zero-Flawed-Flagpole: Mặt ô cờ KHÔNG CÒN cọc cờ thẳng đứng name="FlagPole" che khuất tranh di sản', () => {
      expect(ownedTileCanThoMarkup).not.toContain('name="FlagPole"');
    });

    it('[TC-OPWS04.05/MSS][UI-S02/MSS][BR-UI-002][Facet4-ZeroFlagpole] Zero-Flawed-Flagpole: Mặt ô cờ KHÔNG CÒN lá cờ phướn name="FlagCloth"', () => {
      expect(ownedTileCanThoMarkup).not.toContain('name="FlagCloth"');
    });

    it('[TC-OPWS04.06/MSS][UI-S02/MSS][BR-UI-002][Facet4-ZeroFlagpole] Zero-Flawed-Flagpole: Mặt ô cờ KHÔNG CÒN biển cọc cắm data-testid="ownership-billboard-pin"', () => {
      expect(ownedTileCanThoMarkup).not.toContain('data-testid="ownership-billboard-pin"');
    });

    it('[TC-OPWS04.07/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn 100% viền chân đế ô đất OwnerBaseTrim (data-testid="owner-base-trim") mang màu người chơi ownerColor', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-base-trim"');
      const trimSection = extractElementSection(ownedTileCanThoMarkup, 'owner-base-trim', 400);
      expect(trimSection).toContain('#DC2626');
    });

    it('[TC-OPWS04.08/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn 100% viền chân đế ngoài OwnerBaseTrimBorder (data-testid="owner-base-trim-border")', () => {
      expect(ownedTileCanThoMarkup).toContain('data-testid="owner-base-trim-border"');
    });

    it('[TC-OPWS04.09/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn các khối nhà đồ chơi ToyPropertyBuildings (data-testid="toy-property-building", toy-house) khi level >= 1', () => {
      expect(ownedTileLevel1Markup).toContain('data-testid="toy-property-building"');
      expect(ownedTileLevel1Markup).toContain('data-testid="toy-house"');
    });

    it('[TC-OPWS04.10/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Ô đường sắt (Railroad index 5) khi có chủ: Không có wax seal trên tranh, chỉ tô màu khay giá và viền chân đế', () => {
      expect(railroadTileMarkup).not.toContain('data-testid="deed-wax-seal"');
      expect(railroadTileMarkup).toContain('data-testid="owner-price-pill"');
      expect(railroadTileMarkup).toContain('data-testid="owner-base-trim"');
    });

    it('[TC-OPWS04.11/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] Toàn bộ tọa độ, kích thước và góc xoay trên ô đất là số hữu hạn, zero NaN', () => {
      expect(ownedTileCanThoMarkup).not.toContain('NaN');
      expect(unownedTileCanThoMarkup).not.toContain('NaN');
      expect(ownedTileLevel1Markup).not.toContain('NaN');
    });

    it('[TC-OPWS04.12/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] Ô phi sở hữu (Cơ hội index 7) không render owner-price-pill mang màu người chơi và hoàn toàn không có wax seal', () => {
      expect(chanceTileMarkup).not.toContain('data-testid="deed-wax-seal"');
      const pillSection = extractElementSection(chanceTileMarkup, 'owner-price-pill', 500);
      expect(pillSection).not.toContain('#DC2626');
    });
  });
});
