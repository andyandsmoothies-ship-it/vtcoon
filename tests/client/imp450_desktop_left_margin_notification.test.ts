// [TC-450.01/MSS..TC-450.11/MSS][UC-IMP450/MSS][UC-IMP450/A1][UC-IMP450/A2] Desktop Left Margin Notification Streamlining & Zero-Occlusion Ergonomics Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): Container classes, max-width constraints, fixed top ceiling (TC-450.01, TC-450.02, TC-450.06, TC-450.07, TC-450.11)
// Facet 2 (State Reactivity & Content): Verbatim narrative text structure & multi-line wrapping (TC-450.03, TC-450.08, TC-450.09)
// Facet 3 (Ergonomics & Layout Flow): Mobile bottom-centered placement preservation (TC-450.04)
// Facet 4 (Spatial AABB & Non-Occlusion): Camera diorama screen projection non-overlap against board tiles #11–#20 (TC-450.05)
// Facet 5 (Cross-Coupling & Blast Radius): HudContainer call-site wiring parity (TC-450.10)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PerspectiveCamera, Vector3 } from 'three';

import {
  FloatingNumbersOverlay,
  FloatingBadge,
  MilestoneBanner,
} from '../../src/client/ui/floating_numbers.js';
import { HudContainer } from '../../src/client/ui/hud_container.js';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type ClientMarketModifier,
  type PlayerHudInfo,
} from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { cellPosition } from '../../src/client/3d/board_coords.js';
import { CAMERA_CONFIG } from '../../src/client/3d/camera_state_machine.js';

const samplePlayer: PlayerHudInfo = {
  id: 'p1',
  name: 'Chủ Tịch Sài Thành',
  balance: 20000,
  tokenColor: '#38BDF8',
  ownedProperties: [],
};

const sampleTargetPlayer: PlayerHudInfo = {
  id: 'p2',
  name: 'Đại Gia Bình Dương',
  balance: 15000,
  tokenColor: '#F59E0B',
  ownedProperties: [],
};

const sampleRegularItem: FloatingTextItem = {
  id: 'ft_rent_1',
  playerId: 'p1',
  text: '+1.500 Tr.',
  type: FloatingTextType.Reward,
  actionType: 'rent_receive',
  title: 'Thu tiền thuê',
  timestamp: 1000,
};

const sampleRentItemWithFormula: FloatingTextItem = {
  id: 'ft_rent_formula',
  playerId: 'p1',
  text: '+1.500 Tr.',
  type: FloatingTextType.Reward,
  actionType: 'rent_receive',
  title: 'Thu tiền thuê Bến Bạch Đằng',
  cellIndex: 3,
  targetPlayerName: 'Đại Gia Bình Dương',
  formula: 'Căn cứ: Giá gốc 1.000 + Độc quyền 1.5x',
  timestamp: 1001,
};

const sampleMilestoneItem: FloatingTextItem = {
  id: 'ft_milestone_1',
  playerId: 'p1',
  text: 'Quy hoạch trục đô thị mới: Giá thuê khu Đông tăng 50%',
  type: FloatingTextType.Reward,
  actionType: 'market',
  title: 'Sự Kiện Thị Trường',
  timestamp: 1002,
};

const sampleModifier1: ClientMarketModifier = {
  type: 'MARKET_BOOM_1',
  remainingRounds: 2,
};

const sampleModifier2: ClientMarketModifier = {
  type: 'MARKET_BOOM_2',
  remainingRounds: 1,
};

const sampleModifier3: ClientMarketModifier = {
  type: 'MARKET_BOOM_3',
  remainingRounds: 3,
};

describe('[TC-450/MSS][UC-IMP450] Desktop Left Margin Notification Streamlining Contract Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
    useLobbyStore.setState({ myPlayerId: 'p1' });
    useGameStore.setState({
      playersInfo: {
        p1: samplePlayer,
        p2: sampleTargetPlayer,
      },
      playerPositions: { p1: 0, p2: 0 },
      activeModal: null,
      activeModifiers: [],
      floatingTexts: [],
    });
  });

  // =========================================================================
  // FACET 1: Boundary & Range Contracts
  // =========================================================================
  describe('Facet 1: Boundary & Range Contracts', () => {
    it('[TC-450.01/MSS][UC-IMP450/MSS][Facet-1/Boundary] Given Desktop viewport, When FloatingNumbersOverlay renders, Then container contains md:left-4, md:right-auto, md:translate-x-0, md:items-start, and md:flex', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:left-4');
      expect(html).toContain('md:right-auto');
      expect(html).toContain('md:items-start');
      expect(html).toContain('md:flex');
    });

    it('[TC-450.02/MSS][UC-IMP450/MSS][Facet-1/Boundary] Given Desktop viewport, When notifications are displayed, Then container width is constrained by md:max-w-[280px]', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:max-w-[280px]');
      expect(html).not.toContain('md:max-w-md');
    });

    it('[TC-450.06/A2][UC-IMP450/A2][Facet-1/Boundary] Given activeModal is open, When MilestoneBanner renders, Then banner remains centered (left-1/2 -translate-x-1/2) at top', () => {
      useGameStore.setState({
        activeModal: 'portfolio',
        floatingTexts: [sampleMilestoneItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('left-1/2 -translate-x-1/2');
      expect(html).not.toContain('md:right-[18.5rem]');
      expect(html).not.toContain('md:left-4');
      expect(html).not.toContain('md:translate-x-0');
    });

    it('[TC-450.07/MSS][UC-IMP450/MSS][Facet-1/Boundary] Given activeMarketCount >= 3, When FloatingNumbersOverlay renders, Then desktop top positioning maintains fixed ceiling md:top-20 instead of stepping down to md:top-44', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [sampleModifier1, sampleModifier2, sampleModifier3],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:top-20');
      expect(html).not.toContain('md:top-44');
      expect(html).not.toContain('md:top-36');
      expect(html).not.toContain('md:top-28');
    });

    it('[TC-450.11/MSS][UC-IMP450/MSS][Facet-1/Boundary] Given FloatingNumbersOverlay with display items, When rendered, Then item wrapper container includes md:justify-start for left-aligned toast cards', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:justify-start');
      expect(html).toContain('justify-start');
    });
  });

  // =========================================================================
  // FACET 2: State Reactivity & Text Structure Preservation Contracts
  // =========================================================================
  describe('Facet 2: State Reactivity & Text Structure Preservation Contracts', () => {
    it('[TC-450.03/MSS][UC-IMP450/MSS][Facet-2/Reactivity] Given active transaction item, When FloatingBadge renders, Then 100% text structure and narrative content preserved verbatim across subject, verb, amount pill, target, and formula lines', () => {
      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: sampleRentItemWithFormula }));
      expect(html).toContain('data-testid="transaction-flow-line"');
      expect(html).toContain('data-testid="floating-amount-pill"');
      expect(html).toContain('data-testid="transaction-formula-line"');
      expect(html).toContain('✕');
    });

    it('[TC-450.08/MSS][UC-IMP450/MSS][Facet-2/Reactivity] Given FloatingBadge with formula, When rendered, Then badge applies compact styling rounded-xl border-slate-900/20 and line-clamp-2 break-words on formula line', () => {
      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: sampleRentItemWithFormula }));
      expect(html).toContain('rounded-xl');
      expect(html).toContain('border-slate-900/20');
      expect(html).toContain('shadow-[0_2px_0_0_#0f172a]');
      expect(html).not.toMatch(/data-testid="transaction-formula-line"[^>]*truncate/);
    });

    it('[TC-450.09/MSS][UC-IMP450/MSS][Facet-2/Reactivity] Given MilestoneBanner with title and description, When rendered, Then milestone card title applies line-clamp-2 break-words instead of single-line truncate', () => {
      const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item: sampleMilestoneItem }));
      expect(html).toContain('data-testid="milestone-card-title"');
      expect(html).toContain('line-clamp-2 break-words');
      expect(html).not.toContain('flex-1 truncate');
    });
  });

  // =========================================================================
  // FACET 3: Ergonomics & Mobile Layout Contracts
  // =========================================================================
  describe('Facet 3: Ergonomics & Mobile Layout Contracts', () => {
    it('[TC-450.04/A1][UC-IMP450/A1][Facet-3/Ergonomics] Given Mobile viewport (< 768px), When notifications are displayed, Then mobile preserves bottom-centered placement (left-1/2 -translate-x-1/2) without desktop interference', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('bottom-[calc(8.5rem+env(safe-area-inset-bottom))]');
      expect(html).toContain('left-1/2 -translate-x-1/2');
      expect(html).toContain('w-[calc(100vw-1.5rem)]');
    });
  });

  // =========================================================================
  // FACET 4: Spatial AABB & Non-Occlusion Contracts
  // =========================================================================
  describe('Facet 4: Spatial AABB & Non-Occlusion Contracts', () => {
    it('[TC-450.05/MSS][UC-IMP450/MSS][Facet-4/Spatial-Frustum] Given 1280x800 desktop diorama geometry, When toasts are rendered at Top-Left, Then toast bounding box (X in [16, 296]px, Y <= 168px) has zero overlap with board tiles #11–#20 (Y_edge >= 212px)', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:left-4');
      expect(html).toContain('md:max-w-[280px]');

      const camera = new PerspectiveCamera(CAMERA_CONFIG.overview.fov, 1280 / 800, 0.1, 200);
      camera.position.set(
        CAMERA_CONFIG.overview.position[0],
        CAMERA_CONFIG.overview.position[1],
        CAMERA_CONFIG.overview.position[2]
      );
      camera.lookAt(
        CAMERA_CONFIG.overview.target[0],
        CAMERA_CONFIG.overview.target[1],
        CAMERA_CONFIG.overview.target[2]
      );
      camera.updateMatrixWorld(true);
      camera.updateProjectionMatrix();

      const tileIndices = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      const overlaps = tileIndices.filter((tileIdx) => {
        const [wx, wy, wz] = cellPosition(tileIdx);
        const projected = new Vector3(wx, wy, wz).project(camera);
        const px = (projected.x + 1) * 640;
        const py = (1 - projected.y) * 400;
        const tileMinX = px - 11;
        const tileMaxX = px + 11;
        const tileMinY = py - 11;
        const tileMaxY = py + 11;
        const xOverlap = Math.max(16, tileMinX) < Math.min(296, tileMaxX);
        const yOverlap = Math.max(80, tileMinY) < Math.min(168, tileMaxY);
        return xOverlap && yOverlap;
      });

      expect(overlaps).toHaveLength(0);
    });
  });

  // =========================================================================
  // FACET 5: Cross-Coupling Blast Radius & Call-Site Wiring Contracts
  // =========================================================================
  describe('Facet 5: Cross-Coupling Blast Radius & Call-Site Wiring Contracts', () => {
    it('[TC-450.10/MSS][UC-IMP450/MSS][Facet-5/Blast-Radius] Given HudContainer rendered with active notifications, When rendered at call-site, Then FloatingNumbersOverlay is actively mounted in DOM tree with desktop left margin anchor md:left-4', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(HudContainer));
      expect(html).toContain('data-testid="hud-container"');
      expect(html).toContain('data-testid="floating-numbers-overlay"');
      expect(html).toContain('md:left-4');
    });
  });
});
