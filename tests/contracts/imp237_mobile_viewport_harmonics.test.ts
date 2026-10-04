// [CONTRACT TEST] IMP-237: Mobile Viewport Harmonics, 3D Billboard Clamping & Viewport De-cluttering
// Traceability Tags: [TC-MVH-01/MSS..TC-MVH-16/MSS] & [UC-IMP237]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification
// Architecture: Mobile Viewport Harmonics, Billboard Clamping, Sticky Modal CTA & HUD Backdrop

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Server & Domain Config
import { MarketCardId } from '../../src/domain/event_card_types.js';
import { executeMarketCard } from '../../src/domain/market_card_handlers.js';
import type { MarketModifier } from '../../src/domain/event_card_types.js';
// Client Store & UI
import { useGameStore, type ModalPayloadMap, type PlayerHudInfo } from '../../src/client/store/game_store.js';
import { SafeHtml, TileEventFloatingBadge } from '../../src/client/3d/tile_event_aura.js';
import type { TileEventStatus } from '../../src/client/3d/tile_event_aura.js';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal.js';
import { HudContainer } from '../../src/client/ui/hud_container.js';
import { CameraResetPill } from '../../src/client/ui/camera_reset_pill.js';
import { MarketEventTicker } from '../../src/client/ui/market_event_ticker.js';
import { PlayerCard } from '../../src/client/ui/player_card.js';
import { PlayerHudList } from '../../src/client/ui/player_hud_list.js';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = (subscribe, getSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

interface VNodeProps {
  [key: string]: unknown;
  children?: unknown;
  onClick?: () => void;
}

interface VNode {
  props?: VNodeProps;
}

function isVNode(node: unknown): node is VNode {
  return typeof node === 'object' && node !== null && 'props' in node;
}

function findElementByProp(
  node: unknown,
  predicate: (props: VNodeProps) => boolean
): VNode | null {
  if (!node || typeof node !== 'object') return null;
  if (isVNode(node) && node.props && predicate(node.props)) {
    return node;
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElementByProp(child, predicate);
      if (found) return found;
    }
  }
  if (isVNode(node) && node.props?.children) {
    return findElementByProp(node.props.children, predicate);
  }
  return null;
}

function captureRenderedTree<P extends object>(
  Component: React.ComponentType<P>,
  props?: P
): React.ReactNode {
  let rendered: React.ReactNode = null;
  function SpyComponent(): React.ReactElement {
    const fn = Component as (p?: P) => React.ReactNode;
    rendered = fn(props);
    return React.createElement(React.Fragment, null, rendered);
  }
  renderToStaticMarkup(React.createElement(SpyComponent));
  return rendered;
}

interface CapturedHtmlProps {
  center?: boolean;
  distanceFactor?: number;
  pointerEvents?: string;
}

let capturedHtmlProps: CapturedHtmlProps = {};

vi.mock('@react-three/drei', () => ({
  Billboard: ({ children, ...props }: { children?: React.ReactNode }) =>
    React.createElement('billboard', props, children),
  Html: (props: {
    children?: React.ReactNode;
    center?: boolean;
    distanceFactor?: number;
    pointerEvents?: string;
  }) => {
    capturedHtmlProps = {
      center: props.center,
      distanceFactor: props.distanceFactor,
      pointerEvents: props.pointerEvents,
    };
    return React.createElement('drei-html', props, props.children);
  },
}));

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

interface ClickableProps {
  'data-testid'?: string;
  onClick?: () => void;
}

function isClickableElement(props: unknown): props is ClickableProps {
  return typeof props === 'object' && props !== null && 'onClick' in props;
}

describe('[TC-MVH-01/MSS..TC-MVH-16/MSS][UC-IMP237] Mobile Viewport Harmonics & 3D Billboard Contract Suite', () => {
  beforeEach(() => {
    capturedHtmlProps = {};

    useGameStore.setState({
      activeModifiers: [],
      hasUserCustomCamera: false,
      activeModal: null,
      modalPayload: null,
      isPlayerHudVisible: true,
      playersInfo: {},
      currentTurnPlayerId: 'p1',
      levelMap: {},
      spotlightedCellIndices: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: 3D Billboard Zoom & Typography Clamping (TC-MVH-01..03)
  // =========================================================================
  describe('Facet 1: 3D Billboard Zoom & Typography Clamping', () => {
    const mockStatus: TileEventStatus = {
      isActive: true,
      type: 'MC_LAND_FEVER',
      icon: '🔥',
      label: 'Sốt đất',
      color: '#EF4444',
      isBuff: true,
      remainingRounds: 2,
      isExpiringSoon: false,
      isSpotlighted: false,
    };

    it('[TC-MVH-01/MSS][UC-IMP237] TileEventFloatingBadge mang class whitespace-nowrap ngan chan hoan toan viec ngat dong chu doc', () => {
      const html = renderToStaticMarkup(
        React.createElement(TileEventFloatingBadge, { status: mockStatus, isMobile: false })
      );

      expect(html).toContain('whitespace-nowrap');
    });

    it('[TC-MVH-02/MSS][UC-IMP237] TileEventFloatingBadge ap dung max-w-[140px] truncate bao dam phu hieu khong vuot khung hinh', () => {
      const html = renderToStaticMarkup(
        React.createElement(TileEventFloatingBadge, { status: mockStatus, isMobile: false })
      );

      expect(html).toContain('max-w-[140px]');
      expect(html).toContain('truncate');
    });

    it('[TC-MVH-03/MSS][UC-IMP237] SafeHtml khong cau hinh distanceFactor={14} lam phong dai vo han khi camera zoom can canh', () => {
      Object.defineProperty(globalThis, 'window', {
        value: {},
        writable: true,
        configurable: true,
      });

      try {
        renderToStaticMarkup(
          React.createElement(SafeHtml, null, React.createElement('span', null, 'test-badge'))
        );

        expect(capturedHtmlProps.distanceFactor).toBeUndefined();
        expect(capturedHtmlProps.center).toBe(true);
        expect(capturedHtmlProps.pointerEvents).toBe('none');
      } finally {
        Object.defineProperty(globalThis, 'window', {
          value: undefined,
          writable: true,
          configurable: true,
        });
      }
    });
  });

  // =========================================================================
  // FACET 2: Event Modal Data Sanity & Sticky CTA Footer (TC-MVH-04..07)
  // =========================================================================
  describe('Facet 2: Event Modal Data Sanity & Sticky CTA Footer', () => {
    it('[TC-MVH-04/MSS][UC-IMP237] Bo xu ly MC_RATE_HIKE trong market_card_handlers day affectedCells: [] rong, loai tru 40 o dat thua', () => {
      const mods: MarketModifier[] = [];
      executeMarketCard(MarketCardId.MC_RATE_HIKE, mods);

      expect(mods).toHaveLength(1);
      expect(mods[0]?.affectedCells).toEqual([]);
    });

    it('[TC-MVH-05/MSS][UC-IMP237] Khi affectedCells: [], EventCardModal khong ket xuat khoi event-affected-cells-list va boc noi dung trong scroll-container', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardId: MarketCardId.MC_RATE_HIKE,
          cardType: 'market',
          title: 'Tăng Lãi Suất',
          description: 'Ngân hàng tăng lãi suất điều hành.',
          activeModifier: {
            type: MarketCardId.MC_RATE_HIKE,
            affectedCells: [],
            remainingRounds: 1,
          },
          onClose: vi.fn(),
        })
      );

      expect(html).not.toContain('data-testid="event-affected-cells-list"');
      expect(html).toContain('data-testid="event-card-scroll-container"');
    });

    it('[TC-MVH-06/MSS][UC-IMP237] Khi affectedCells co nhieu o, danh sach o dat gioi han toi da 12 o va hien thi chip +N o khac trong container cuon max-h-24', () => {
      const manyCells = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardId: MarketCardId.MC_LAND_FEVER,
          cardType: 'market',
          title: 'Sốt Đất',
          description: 'Giá đất tăng vọt.',
          activeModifier: {
            type: MarketCardId.MC_LAND_FEVER,
            affectedCells: manyCells,
            remainingRounds: 1,
          },
          onClose: vi.fn(),
        })
      );

      expect(html).toContain('+4 ô khác');
      expect(html).toContain('max-h-24');
    });

    it('[TC-MVH-07/MSS][UC-IMP237] Nut bam event-card-confirm-btn co class shrink-0 va container modal dung overflow-hidden bao dam nut bam khong bi day khoi man hinh', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardId: MarketCardId.MC_LAND_FEVER,
          cardType: 'market',
          title: 'Sốt Đất',
          description: 'Giá đất tăng vọt.',
          onClose: vi.fn(),
        })
      );

      expect(html).toMatch(/data-testid="event-card-confirm-btn"[^>]*shrink-0/);
      expect(html).toMatch(/data-testid="event-card-modal"[^>]*overflow-hidden/);
    });
  });

  // =========================================================================
  // FACET 3: De-collision of Bottom Camera Controls (TC-MVH-08..10)
  // =========================================================================
  describe('Facet 3: De-collision of Bottom Camera Controls', () => {
    it('[TC-MVH-08/MSS][UC-IMP237] Tren Mobile, container CameraResetPill mang class left-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] ne hoan toan truc giua', () => {
      const html = renderToStaticMarkup(React.createElement(HudContainer));

      expect(html).toContain('left-3');
      expect(html).toContain('bottom-[calc(5rem+env(safe-area-inset-bottom))]');
    });

    it('[TC-MVH-09/MSS][UC-IMP237] Tren Desktop (sm:), container mang class sm:left-1/2 sm:-translate-x-1/2 sm:bottom-32 bao ton tham my can giua', () => {
      const html = renderToStaticMarkup(React.createElement(HudContainer));

      expect(html).toContain('sm:left-1/2');
      expect(html).toContain('sm:-translate-x-1/2');
      expect(html).toContain('sm:bottom-32');
    });

    it('[TC-MVH-10/MSS][UC-IMP237] Nut CameraResetPill duy tri kich thuoc toi thieu dat chuan ngon tay min-h-[44px] va data-testid="camera-reset-pill-btn"', () => {
      useGameStore.setState({
        hasUserCustomCamera: true,
        activeModal: null,
      });
      const html = renderToStaticMarkup(React.createElement(CameraResetPill));

      expect(html).toContain('data-testid="camera-reset-pill-btn"');
      expect(html).toContain('min-h-[44px]');
    });
  });

  // =========================================================================
  // FACET 4: Mobile Event Ticker Density & Desktop Parity (TC-MVH-11..13)
  // =========================================================================
  describe('Facet 4: Mobile Event Ticker Density & Desktop Parity', () => {
    it('[TC-MVH-11/MSS][UC-IMP237] Khi co nhieu su kien thi truong, banner thu 2 mang class hidden sm:flex va the thu nhat hien thi badge +{active.length - 1} su kien', () => {
      useGameStore.setState({
        activeModifiers: [
          { type: MarketCardId.MC_LAND_FEVER, remainingRounds: 2, affectedCells: [1] },
          { type: MarketCardId.MC_ALCOHOL_CHECK, remainingRounds: 1, affectedCells: [3] },
        ],
      });
      const html = renderToStaticMarkup(React.createElement(MarketEventTicker));

      expect(html).toContain('hidden sm:flex');
      expect(html).toContain('+1 sự kiện');
    });

    it('[TC-MVH-12/MSS][UC-IMP237] MarketEventTicker tren Desktop (sm:) hien thi cac the su kien voi title va formula day du', () => {
      useGameStore.setState({
        activeModifiers: [
          { type: MarketCardId.MC_LAND_FEVER, remainingRounds: 2, affectedCells: [1] },
          { type: MarketCardId.MC_ALCOHOL_CHECK, remainingRounds: 1, affectedCells: [3] },
        ],
      });
      const html = renderToStaticMarkup(React.createElement(MarketEventTicker));

      expect(html).toContain('data-testid="market-ticker-item-MC_LAND_FEVER"');
      expect(html).toContain('data-testid="market-ticker-item-MC_ALCOHOL_CHECK"');
      expect(html).toContain('data-testid="market-ticker-effect-summary"');
    });

    it('[TC-MVH-13/MSS][UC-IMP237] Thao tac click vao banner su kien mo modal openModal("event", ...) voi du lieu chinh xac', () => {
      const testModifiers = [
        { type: MarketCardId.MC_LAND_FEVER, remainingRounds: 2, affectedCells: [1] },
      ];
      useGameStore.setState({
        activeModifiers: testModifiers,
        activeModal: null,
        modalPayload: null,
      });

      const vdom = captureRenderedTree(MarketEventTicker, { activeModifiers: testModifiers });
      const tickerItem = findElementByProp(
        vdom,
        (p) => p['data-testid'] === `market-ticker-item-${MarketCardId.MC_LAND_FEVER}`
      );

      tickerItem?.props?.onClick?.();

      const state = useGameStore.getState();
      expect(state.activeModal).toBe('event');
      const eventPayload = state.modalPayload as ModalPayloadMap['event'];
      expect(eventPayload?.cardId).toBe(MarketCardId.MC_LAND_FEVER);
    });
  });

  // =========================================================================
  // FACET 5: PlayerHudList Mobile Backdrop & Bankrupt Card Compactness (TC-MVH-14..16)
  // =========================================================================
  describe('Facet 5: PlayerHudList Mobile Backdrop & Bankrupt Card Compactness', () => {
    it('[TC-MVH-14/MSS][UC-IMP237] Khi player.bankrupt === true, PlayerCard khong ket xuat khoi player-property-clusters, thu gon chieu cao the', () => {
      const bankruptPlayer: PlayerHudInfo = {
        id: 'p_bankrupt',
        name: 'Đại Gia Phá Sản',
        balance: 0,
        tokenColor: '#EF4444',
        ownedProperties: [],
        mortgagedProperties: [],
        mortgageLoans: {},
        isBot: false,
        bankrupt: true,
      };
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: bankruptPlayer,
          isCurrentTurn: false,
          levelMap: {},
        })
      );

      expect(html).not.toContain('data-testid="player-property-clusters"');
      expect(html).toContain('Phá Sản');
    });

    it('[TC-MVH-15/MSS][UC-IMP237] Khi player.bankrupt === false, PlayerCard ket xuat day du 28 cham BDS qua 3 dong cluster', () => {
      const activePlayer: PlayerHudInfo = {
        id: 'p_active',
        name: 'Đại Gia Tích Cực',
        balance: 5000,
        tokenColor: '#38BDF8',
        ownedProperties: [1, 3],
        mortgagedProperties: [],
        mortgageLoans: {},
        isBot: false,
        bankrupt: false,
      };
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: activePlayer,
          isCurrentTurn: true,
          levelMap: {},
        })
      );

      expect(html).toContain('data-testid="player-property-clusters"');
      expect(html).toContain('data-testid="property-clusters-row-1"');
      expect(html).toContain('data-testid="property-clusters-row-2"');
      expect(html).toContain('data-testid="cluster-railroad"');
    });

    it('[TC-MVH-16/MSS][UC-IMP237] PlayerHudList khong ket xuat backdrop toan man hinh de tranh nuot click nut do xuc xac', () => {
      const testPlayer: PlayerHudInfo = {
        id: 'p1',
        name: 'Đại Gia Sài Thành',
        balance: 10000,
        tokenColor: '#38BDF8',
        ownedProperties: [],
        mortgagedProperties: [],
        mortgageLoans: {},
        isBot: false,
        bankrupt: false,
      };
      useGameStore.setState({
        playersInfo: { p1: testPlayer },
        isPlayerHudVisible: true,
      });

      const html = renderToStaticMarkup(React.createElement(PlayerHudList));
      const vdom = captureRenderedTree(PlayerHudList);
      const backdrop = findElementByProp(vdom, (p) => p['data-testid'] === 'player-hud-backdrop');

      expect(html).not.toContain('data-testid="player-hud-backdrop"');
      expect(backdrop).toBeNull();
    });
  });
});
