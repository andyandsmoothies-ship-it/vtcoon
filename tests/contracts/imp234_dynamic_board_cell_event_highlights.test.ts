// [TC-234.01/MSS..TC-234.16/MSS][UC-IMP234] Universal 5-Facet Contract Suite:
// IMP-234: Khử Điểm Mù Tác Động Thẻ Sự Kiện (Viền Hào Quang 3D, Huy Hiệu Đếm Lùi Số Vòng & Ticker Spotlight)
// Reference: docs/plans/improvements/IMP-234-dynamic-board-cell-event-highlights_plan.md
// Domain Invariants: docs/domain/gotchas.md (Pillar V, VI Detroit Classical, Pillar VII)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Server & Domain Config
import { CellType, type BoardCell } from '../../src/domain/board_config.js';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';

// Client Store & UI
import { useGameStore } from '../../src/client/store/game_store.js';
import { MarketEventTicker } from '../../src/client/ui/market_event_ticker.js';
import { LayeredDioramaTile } from '../../src/client/3d/board_tile.js';
import * as boardTileExports from '../../src/client/3d/board_tile.js';

// Mock Drei & R3F components for headless SSR static rendering
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

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

// ============================================================================
// DYNAMIC IMPORT HARNESS (Station 1 RED Contract Gate)
// Dynamically resolves Station 2 tile_event_aura module to assert clean Business RED
// ============================================================================
const TILE_EVENT_AURA_PATH = '../../src/client/3d/tile_event_aura';

let tileEventAuraMod: any = null;
try {
  tileEventAuraMod = await import(/* @vite-ignore */ TILE_EVENT_AURA_PATH);
} catch {
  try {
    tileEventAuraMod = await import(/* @vite-ignore */ `${TILE_EVENT_AURA_PATH}.js`);
  } catch {
    tileEventAuraMod = null;
  }
}

export interface TileEventStatus {
  readonly isActive: boolean;
  readonly type?: string;
  readonly icon?: string;
  readonly label?: string;
  readonly color?: string;
  readonly isBuff?: boolean;
  readonly remainingRounds?: number;
  readonly isExpiringSoon?: boolean;
  readonly isSpotlighted?: boolean;
}

export const resolveTileEventStatus: (
  cellIndex: number,
  activeModifiers?: ReadonlyArray<any>,
  spotlightedCells?: ReadonlyArray<number> | null
) => TileEventStatus =
  tileEventAuraMod?.resolveTileEventStatus ??
  (() => {
    throw new TypeError(
      'resolveTileEventStatus is not implemented (Station 1 RED: src/client/3d/tile_event_aura.tsx pending)'
    );
  });

export const TileEventAuraRim: React.ComponentType<any> =
  tileEventAuraMod?.TileEventAuraRim ??
  (() => {
    throw new TypeError(
      'TileEventAuraRim is not implemented (Station 1 RED: src/client/3d/tile_event_aura.tsx pending)'
    );
  });

export const TileEventFloatingBadge: React.ComponentType<any> =
  tileEventAuraMod?.TileEventFloatingBadge ??
  (() => {
    throw new TypeError(
      'TileEventFloatingBadge is not implemented (Station 1 RED: src/client/3d/tile_event_aura.tsx pending)'
    );
  });

export const TileEventAura: React.ComponentType<any> =
  tileEventAuraMod?.TileEventAura ??
  (() => {
    throw new TypeError(
      'TileEventAura is not implemented (Station 1 RED: src/client/3d/tile_event_aura.tsx pending)'
    );
  });

// ============================================================================
// HELPER UTILITIES FOR HEADLESS VDOM & AST TRAVERSAL
// ============================================================================
function findElementByProp(node: any, predicate: (props: any) => boolean): any {
  if (!node || typeof node !== 'object') return null;
  if (node.props && predicate(node.props)) return node;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElementByProp(child, predicate);
      if (found) return found;
    }
  }
  if (node.props && node.props.children) {
    return findElementByProp(node.props.children, predicate);
  }
  return null;
}

function captureRenderedTree<P = Record<string, unknown>>(
  Component: React.ComponentType<P>,
  props?: P
): any {
  let rendered: any = null;
  function SpyComponent() {
    rendered = (Component as React.FC<P>)((props ?? {}) as P);
    return rendered as unknown as React.ReactElement;
  }
  renderToStaticMarkup(React.createElement(SpyComponent));
  return rendered;
}

describe('[TC-234.01/MSS..TC-234.16/MSS][UC-IMP234] Dynamic Board Cell Event Highlights Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      activeModifiers: [],
      spotlightedCellIndices: null,
      activeModal: null,
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // FACET 1: Event Status Resolution & Multiplier Mapping (TC-234.01..TC-234.04)
  // ===========================================================================
  describe('Facet 1: Event Status Resolution & Multiplier Mapping', () => {
    it('[TC-234.01/MSS][UC-IMP234] resolveTileEventStatus khi có modifier MC_NIGHT_ECONOMY (affectedCells: [6, 8, 26, 27], rounds: 2) -> trả về isActive: true, icon 🌙, label x2 Thuê, color #F59E0B', () => {
      const modifiers = [
        { type: MarketCardId.MC_NIGHT_ECONOMY, remainingRounds: 2, affectedCells: [6, 8, 26, 27] },
      ];
      const status = resolveTileEventStatus(6, modifiers);

      expect(status.isActive).toBe(true);
      expect(status.icon).toBe('🌙');
      expect(status.label).toBe('x2 Thuê');
      expect(status.color).toBe('#F59E0B');
    });

    it('[TC-234.02/MSS][UC-IMP234] resolveTileEventStatus khi có modifier MC_LAND_FEVER (affectedCells: [6, 8, 31], rounds: 1) -> trả về isActive: true, icon 🔥, label x2 Thuê theo SSOT, isExpiringSoon: true', () => {
      const modifiers = [
        { type: MarketCardId.MC_LAND_FEVER, remainingRounds: 1, affectedCells: [6, 8, 31] },
      ];
      const status = resolveTileEventStatus(8, modifiers);

      expect(status.isActive).toBe(true);
      expect(status.icon).toBe('🔥');
      expect(status.label).toBe('x2 Thuê');
      expect(status.isExpiringSoon).toBe(true);
    });

    it('[TC-234.03/MSS][UC-IMP234] resolveTileEventStatus khi có modifier MC_ALCOHOL_CHECK -> trả về isBuff: false, color #EF4444, label -50%', () => {
      const modifiers = [
        { type: MarketCardId.MC_ALCOHOL_CHECK, remainingRounds: 2, affectedCells: [6, 8] },
      ];
      const status = resolveTileEventStatus(6, modifiers);

      expect(status.isActive).toBe(true);
      expect(status.isBuff).toBe(false);
      expect(status.color).toBe('#EF4444');
      expect(status.label).toBe('-50%');
    });

    it('[TC-234.04/MSS][UC-IMP234] resolveTileEventStatus khi ô không nằm trong affectedCells -> trả về isActive: false', () => {
      const modifiers = [
        { type: MarketCardId.MC_NIGHT_ECONOMY, remainingRounds: 2, affectedCells: [6, 8, 26, 27] },
      ];
      const status = resolveTileEventStatus(12, modifiers);

      expect(status.isActive).toBe(false);
    });
  });

  // ===========================================================================
  // FACET 2: Responsive Mobile & Desktop Layout Adaptation (TC-234.05..TC-234.08)
  // ===========================================================================
  describe('Facet 2: Responsive Mobile & Desktop Layout Adaptation', () => {
    it('[TC-234.05/MSS][UC-IMP234] TileEventFloatingBadge khi isMobile === true kết xuất với scale tăng cường 1.18 và format rút gọn (🔥 +50% • 2V)', () => {
      const status: TileEventStatus = {
        isActive: true,
        type: MarketCardId.MC_LAND_FEVER,
        icon: '🔥',
        label: '+50%',
        color: '#F59E0B',
        remainingRounds: 2,
        isExpiringSoon: false,
      };
      const html = renderToStaticMarkup(
        React.createElement(TileEventFloatingBadge, { status, isMobile: true })
      );

      expect(html).toContain('1.18');
      expect(html).toContain('🔥 +50% • 2V');
    });

    it('[TC-234.06/MSS][UC-IMP234] TileEventFloatingBadge khi isMobile === false kết xuất với scale chuẩn 1.0', () => {
      const status: TileEventStatus = {
        isActive: true,
        type: MarketCardId.MC_LAND_FEVER,
        icon: '🔥',
        label: '+50%',
        color: '#F59E0B',
        remainingRounds: 2,
        isExpiringSoon: false,
      };
      const html = renderToStaticMarkup(
        React.createElement(TileEventFloatingBadge, { status, isMobile: false })
      );

      expect(html).not.toContain('1.18');
      expect(html).toMatch(/scale="1(?:,1,1)?"|scale=\[1,\s*1,\s*1\]/);
    });

    it('[TC-234.07/MSS][UC-IMP234] Nhãn đếm vòng khi remainingRounds === 1 mang cờ isExpiringSoon = true để kích hoạt nhấp nháy cảnh báo', () => {
      const status = resolveTileEventStatus(8, [
        { type: MarketCardId.MC_LAND_FEVER, remainingRounds: 1, affectedCells: [8] },
      ]);
      expect(status.isExpiringSoon).toBe(true);

      const html = renderToStaticMarkup(
        React.createElement(TileEventFloatingBadge, { status, isMobile: false })
      );
      expect(html).toContain('animate-pulse');
    });

    it('[TC-234.08/MSS][UC-IMP234] Kích thước cảm ứng của banner sự kiện trên mobile trong MarketEventTicker duy trì touch target min-h-[44px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [
            { type: MarketCardId.MC_NIGHT_ECONOMY, remainingRounds: 2, affectedCells: [6, 8] },
          ],
        })
      );

      expect(html).toContain('min-h-[44px]');
      expect(html).toContain('market-event-ticker');
    });
  });

  // ===========================================================================
  // FACET 3: Aura Rim Geometry & Depth Layer Stack Compliance (TC-234.09..TC-234.11)
  // ===========================================================================
  describe('Facet 3: Aura Rim Geometry & Depth Layer Stack Compliance', () => {
    it('[TC-234.09/MSS][UC-IMP234] TileEventAuraRim kết xuất tại cao độ Y = 0.042m, kích thước [1.82, 0.08, 2.34] bao ngoài OwnerBaseTrimBorder (1.78x2.30), triệt tiêu Z-fighting', () => {
      const tree = captureRenderedTree(TileEventAuraRim, {
        color: '#F59E0B',
        isSpotlighted: false,
      });

      const meshNode = findElementByProp(
        tree,
        (p: any) => p.name === 'TileEventAuraRim' || p['data-testid'] === 'tile-event-aura-rim' || Array.isArray(p.position)
      );
      expect(meshNode?.props?.position?.[1]).toBeCloseTo(0.042, 3);

      const boxGeom = findElementByProp(tree, (p: any) => Array.isArray(p.args) && p.args.length === 3);
      expect(boxGeom?.props?.args).toEqual([1.82, 0.08, 2.34]);
    });

    it('[TC-234.10/MSS][UC-IMP234] Toàn bộ mesh viền hào quang và huy hiệu 3D đều mang thuộc tính castShadow={false}', () => {
      const treeRim = captureRenderedTree(TileEventAuraRim, { color: '#F59E0B' });
      const meshRim = findElementByProp(
        treeRim,
        (p: any) => p.castShadow !== undefined || p.receiveShadow !== undefined
      );

      expect(meshRim?.props?.castShadow).toBe(false);
      expect(meshRim?.props?.receiveShadow).toBe(true);
    });

    it('[TC-234.11/MSS][UC-IMP234] Ô góc sa bàn (isCornerTile === true) tuyệt đối không render TileEventAura', () => {
      expect((boardTileExports as any).TileEventAura).toBeDefined();

      const cornerVdom = captureRenderedTree(LayeredDioramaTile, {
        cell: { index: 0, name: 'Khởi Hành', type: CellType.Go } as BoardCell,
        position: [0, 0, 0],
        isCornerTile: true,
        currentLevel: 0,
      });

      const cornerAura = findElementByProp(
        cornerVdom,
        (p: any) => p['data-testid'] === 'tile-event-aura' || p.name === 'TileEventAura'
      );
      expect(cornerAura).toBeNull();
    });
  });

  // ===========================================================================
  // FACET 4: Ticker Spotlight Linking & State Lifecycles (TC-234.12..TC-234.14)
  // ===========================================================================
  describe('Facet 4: Ticker Spotlight Linking & State Lifecycles', () => {
    it('[TC-234.12/MSS][UC-IMP234] Gọi setSpotlightedCells([6, 8]) cập nhật đúng spotlightedCellIndices trong Zustand store (useGameStore)', () => {
      const store = useGameStore.getState();
      expect(typeof (store as any).setSpotlightedCells).toBe('function');

      (store as any).setSpotlightedCells([6, 8]);
      expect(useGameStore.getState().spotlightedCellIndices).toEqual([6, 8]);
    });

    it('[TC-234.13/MSS][UC-IMP234] resolveTileEventStatus đánh dấu isSpotlighted = true khi cellIndex nằm trong spotlightedCellIndices', () => {
      const modifiers = [
        { type: MarketCardId.MC_NIGHT_ECONOMY, remainingRounds: 2, affectedCells: [6, 8] },
      ];

      const statusActive = resolveTileEventStatus(6, modifiers, [6, 8]);
      expect(statusActive.isSpotlighted).toBe(true);

      const statusInactive = resolveTileEventStatus(6, modifiers, [8, 9]);
      expect(statusInactive.isSpotlighted).toBe(false);
    });

    it('[TC-234.14/MSS][UC-IMP234] Click vào ticker item kích hoạt setSpotlightedCells với mảng affectedCells tương ứng và tự động clear sau 3000ms', () => {
      vi.useFakeTimers();
      const testModifiers = [
        { type: MarketCardId.MC_NIGHT_ECONOMY, remainingRounds: 2, affectedCells: [6, 8, 26, 27] },
      ];
      useGameStore.setState({ activeModifiers: testModifiers as any });

      const vdom = captureRenderedTree(MarketEventTicker, { activeModifiers: testModifiers });
      const tickerItem = findElementByProp(
        vdom,
        (p: any) => p['data-testid'] === `market-ticker-item-${MarketCardId.MC_NIGHT_ECONOMY}`
      );

      expect(typeof (useGameStore.getState() as any).setSpotlightedCells).toBe('function');
      tickerItem?.props?.onClick?.();
      expect(useGameStore.getState().spotlightedCellIndices).toEqual([6, 8, 26, 27]);

      vi.advanceTimersByTime(3000);
      expect(useGameStore.getState().spotlightedCellIndices).toBeNull();

      vi.useRealTimers();
    });
  });

  // ===========================================================================
  // FACET 5: Turn N+1 Expiry Teardown & Behavioral Idempotency (TC-234.15..TC-234.16)
  // ===========================================================================
  describe('Facet 5: Turn N+1 Expiry Teardown & Behavioral Idempotency', () => {
    it('[TC-234.15/MSS][UC-IMP234] Khi remainingRounds === 0 hoặc modifier bị gỡ khỏi store, resolveTileEventStatus lập tức trả về isActive: false, không để lại ghost visual', () => {
      const statusZero = resolveTileEventStatus(6, [
        { type: MarketCardId.MC_NIGHT_ECONOMY, remainingRounds: 0, affectedCells: [6, 8] },
      ]);
      expect(statusZero.isActive).toBe(false);

      const statusEmpty = resolveTileEventStatus(6, []);
      expect(statusEmpty.isActive).toBe(false);
    });

    it('[TC-234.16/MSS][UC-IMP234] Gọi resolveTileEventStatus 2 lần liên tiếp với cùng inputs trả về kết quả đẳng cấu (idempotent); và khi remainingRounds === 0, hàm trả về isActive: false ngay cả khi cellIndex vẫn nằm trong affectedCells', () => {
      const inputModifiers = [
        { type: MarketCardId.MC_NIGHT_ECONOMY, remainingRounds: 2, affectedCells: [6, 8] },
      ];
      const first = resolveTileEventStatus(6, inputModifiers, [6]);
      const second = resolveTileEventStatus(6, inputModifiers, [6]);

      expect(first).toEqual(second);

      const expiredInAffected = resolveTileEventStatus(
        6,
        [{ type: MarketCardId.MC_NIGHT_ECONOMY, remainingRounds: 0, affectedCells: [6, 8] }],
        [6]
      );
      expect(expiredInAffected.isActive).toBe(false);
    });
  });
});
