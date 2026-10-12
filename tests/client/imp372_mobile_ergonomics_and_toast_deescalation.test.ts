// [TC-372/MSS][IMP-372] Contract Test Suite: Mobile UI Ergonomics, Player Card Density & Floating Toast De-escalation
// Universal 5-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): Mobile HUD width w-44, max-w-[calc(100vw-6rem)], and bottom-[calc(8.5rem...)] clearance
// Facet 2 (State Reactivity & Turn Phase): Property cluster collapse for non-turn cards, preservation during active turn
// Facet 3 (Resource Disposal & Teardown): Null output on empty floating texts and collapsed HUD state
// Facet 4 (Error Defense & De-escalation): Preserving single regular toast under MilestoneBanner without mobile blackout
// Facet 5 (Cross-Coupling Blast Radius & Modal Isolation): Modal active suppression of regular toasts and milestone stack elevation

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
} from '../../src/client/store/game_store.js';
import { PlayerHudList } from '../../src/client/ui/player_hud_list.js';
import { PlayerNetWorthBadge } from '../../src/client/ui/player_net_worth_badge.js';
import { PlayerCard } from '../../src/client/ui/player_card.js';
import {
  MilestoneBanner,
  FloatingNumbersOverlay,
} from '../../src/client/ui/floating_numbers.js';

const mockPlayer: PlayerHudInfo = {
  id: 'p1',
  name: 'Đại Gia Hà Thành',
  balance: 15000,
  tokenColor: '#0EA5E9',
  ownedProperties: [1, 3, 6, 8],
  isBot: false,
};

describe('[IMP-372] Mobile UI Ergonomics, Player Card Density & Toast De-escalation', () => {
  beforeEach(() => {
    useGameStore.setState({
      playersInfo: { p1: mockPlayer },
      isPlayerHudVisible: true,
      currentTurnPlayerId: 'p1',
      levelMap: {},
      floatingTexts: [],
      activeModifiers: [],
      activeModal: null,
    });
  });

  // ============================================================================
  // FACET 1: Boundary & Range (HUD Width, NetWorth Mobile Collapse, Clearance)
  // ============================================================================
  describe('[IMP-372][Facet-1] Boundary & Mobile Viewport Geometry', () => {
    it('[TC-372.01/MSS][UC-HUD-WIDTH-MOBILE] PlayerHudList root aside uses w-44 and max-w-[calc(100vw-6rem)] to balance name column and 3D board view', () => {
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));
      const asideMatch = html.match(/<aside[^>]*aria-label="Danh sách người chơi"[^>]*>/);
      expect(asideMatch).not.toBeNull();
      expect(asideMatch![0]).toContain('w-44');
      expect(asideMatch![0]).toContain('max-w-[calc(100vw-6rem)]');
      expect(asideMatch![0]).not.toContain('w-40');
    });

    it('[TC-372.02/MSS][UC-NETWORTH-MOBILE-COLLAPSE] PlayerNetWorthBadge applies hidden sm:inline-flex on mobile while retaining data-testid="player-net-worth"', () => {
      const html = renderToStaticMarkup(React.createElement(PlayerNetWorthBadge, { netWorth: 25000 }));
      const badgeMatch = html.match(/<span[^>]*data-testid="player-net-worth"[^>]*>/);
      expect(badgeMatch).not.toBeNull();
      expect(badgeMatch![0]).toContain('hidden sm:inline-flex');
      expect(badgeMatch![0]).toContain('tabular-nums');
    });

    it('[TC-372.10/MSS][UC-BOTTOM-CLEARANCE] FloatingNumbersOverlay positions stack with 8.5rem bottom clearance on mobile to avoid ActionDock collision', () => {
      const regularToast: FloatingTextItem = {
        id: 'ft_reg_bottom',
        text: '+1.000 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'salary',
        title: 'Thưởng',
        timestamp: 1700000000000,
      };
      useGameStore.setState({
        floatingTexts: [regularToast],
        activeModifiers: [],
        activeModal: null,
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const stackMatch = html.match(/<div[^>]*class="[^"]*fixed\s+[^"]*left-1\/2[^"]*"[^>]*>/);
      expect(stackMatch).not.toBeNull();
      expect(stackMatch![0]).toContain('bottom-[calc(8.5rem+env(safe-area-inset-bottom))]');
      expect(stackMatch![0]).not.toContain('bottom-[calc(8rem+env(safe-area-inset-bottom))]');
    });
  });

  // ============================================================================
  // FACET 2: State Reactivity & Turn Phase (Property Dots Collapse)
  // ============================================================================
  describe('[IMP-372][Facet-2] Player Card Turn State Reactivity', () => {
    it('[TC-372.03/MSS][UC-CARD-NON-TURN-DOTS] PlayerCard collapses 28-dot property container on mobile via hidden sm:flex when isCurrentTurn is false', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockPlayer,
          isCurrentTurn: false,
          levelMap: {},
          slotIndex: 0,
        })
      );
      const clusterMatch = html.match(/<div[^>]*data-testid="player-property-clusters"[^>]*>/);
      expect(clusterMatch).not.toBeNull();
      expect(clusterMatch![0]).toContain('hidden sm:flex');
    });

    it('[TC-372.04/MSS][UC-CARD-TURN-DOTS] PlayerCard maintains property clusters container visibility with flex layout when isCurrentTurn is true', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockPlayer,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
        })
      );
      const clusterMatch = html.match(/<div[^>]*data-testid="player-property-clusters"[^>]*>/);
      expect(clusterMatch).not.toBeNull();
      expect(clusterMatch![0]).not.toContain('hidden sm:flex');
      expect(clusterMatch![0]).toContain('flex');
    });
  });

  // ============================================================================
  // FACET 3: Milestone Banner Capsule Compactness
  // ============================================================================
  describe('[IMP-372][Facet-3] Milestone Banner Capsule Layout', () => {
    it('[TC-372.05/MSS][UC-BANNER-HEADER-NOWRAP] MilestoneBanner header enforces flex-nowrap to prevent multiline wrap on mobile', () => {
      const milestoneItem: FloatingTextItem = {
        id: 'ft_ms_chance',
        text: 'Nhận Thẻ Miễn Trừ Ngoại Giao',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'chance',
        title: 'Cơ Hội: Thẻ Ngoại Giao',
        timestamp: 1700000000000,
      };
      const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item: milestoneItem }));
      const headerMatch = html.match(/<div[^>]*class="[^"]*min-w-0 flex-1[^"]*"[^>]*>/);
      expect(headerMatch).not.toBeNull();
      expect(headerMatch![0]).toContain('flex-nowrap');
      expect(headerMatch![0]).not.toContain('flex-wrap');
    });

    it('[TC-372.06/MSS][UC-BANNER-DESC-CLAMP] MilestoneBanner description clamps to 1 line on mobile via line-clamp-1 sm:line-clamp-2', () => {
      const milestoneItemWithDesc: FloatingTextItem = {
        id: 'ft_ms_transit',
        text: 'Quay trúng Bến Xe Miền Đông! Được quyền di chuyển tới bất kỳ ô nào trên bàn cờ trong lượt tiếp theo.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'transit',
        title: 'VÒNG XOAY VẬN TẢI',
        timestamp: 1700000000000,
      };
      const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item: milestoneItemWithDesc }));
      const descMatch = html.match(/<span[^>]*data-testid="milestone-card-desc"[^>]*>/);
      expect(descMatch).not.toBeNull();
      expect(descMatch![0]).toContain('line-clamp-1 sm:line-clamp-2');
    });

    it('[TC-372.07/MSS][UC-BANNER-CATEGORY-COLLAPSE] MilestoneBanner secondary category row is hidden on mobile via hidden sm:flex', () => {
      const milestoneItem: FloatingTextItem = {
        id: 'ft_ms_monopoly',
        text: 'Đã hoàn tất cụm độc quyền!',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'monopoly',
        title: 'ĐỘC QUYỀN KHU VỰC',
        timestamp: 1700000000000,
      };
      const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item: milestoneItem }));
      const categoryMatch = html.match(/<div[^>]*class="[^"]*uppercase tracking-wider[^"]*"[^>]*>/);
      expect(categoryMatch).not.toBeNull();
      expect(categoryMatch![0]).toContain('hidden sm:flex');
    });
  });

  // ============================================================================
  // FACET 4: Error Defense & Toast De-escalation (Single vs Multi Stack)
  // ============================================================================
  describe('[IMP-372][Facet-4] Toast Stack De-escalation & Blackout Defense', () => {
    it('[TC-372.08/MSS][UC-TOAST-PRESERVE-ONE] FloatingNumbersOverlay preserves single regular financial toast under MilestoneBanner without mobile blackout', () => {
      const milestoneItem: FloatingTextItem = {
        id: 'ft_ms_1',
        text: 'Sự kiện thị trường biến động',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'market',
        title: 'Cơn Bão Bờ Biển',
        timestamp: 1700000000001,
      };
      const regularToast: FloatingTextItem = {
        id: 'ft_reg_1',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'rent',
        title: 'Trả tiền thuê',
        timestamp: 1700000000002,
      };
      useGameStore.setState({
        floatingTexts: [milestoneItem, regularToast],
        activeModifiers: [],
        activeModal: null,
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const badgeWrapperMatch = html.match(/<div[^>]*class="[^"]*justify-start sm:justify-center[^"]*"[^>]*>/);
      expect(badgeWrapperMatch).not.toBeNull();
      expect(badgeWrapperMatch![0]).not.toContain('hidden md:flex');
      expect(badgeWrapperMatch![0]).toContain('w-full flex justify-start sm:justify-center');
    });

    it('[TC-372.09/MSS][UC-TOAST-OLDER-MULTI] FloatingNumbersOverlay with two regular toasts hides older toast on mobile while preserving newest', () => {
      const milestoneItem: FloatingTextItem = {
        id: 'ft_ms_multi',
        text: 'Sự kiện thị trường',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'market',
        title: 'Thị Trường Khởi Sắc',
        timestamp: 1700000000000,
      };
      const olderToast: FloatingTextItem = {
        id: 'ft_reg_old',
        text: '-200 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'tax',
        title: 'Thuế trước bạ',
        timestamp: 1700000000001,
      };
      const newerToast: FloatingTextItem = {
        id: 'ft_reg_new',
        text: '+1.500 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'salary',
        title: 'Lương khởi hành',
        timestamp: 1700000000002,
      };
      useGameStore.setState({
        floatingTexts: [milestoneItem, olderToast, newerToast],
        activeModifiers: [],
        activeModal: null,
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const allWrappers = html.match(/<div[^>]*class="[^"]*justify-start sm:justify-center[^"]*"[^>]*>/g);
      expect(allWrappers).not.toBeNull();
      expect(allWrappers?.length).toBe(2);
      expect(allWrappers![0]).toContain('hidden md:flex');
      expect(allWrappers![1]).not.toContain('hidden md:flex');
    });
  });

  // ============================================================================
  // FACET 5: Blast Radius, Modal Isolation & Teardown
  // ============================================================================
  describe('[IMP-372][Facet-5] Modal Isolation & Clean Teardown', () => {
    it('[TC-372.11/MSS][UC-MODAL-ISOLATION-CLEANUP] FloatingNumbersOverlay clears regular toasts during modal and positions milestone at top-14', () => {
      const milestoneItem: FloatingTextItem = {
        id: 'ft_ms_modal',
        text: 'Sự kiện thị trường',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'market',
        title: 'Thị Trường Khởi Sắc',
        timestamp: 1700000000000,
      };
      const regularToast: FloatingTextItem = {
        id: 'ft_reg_modal',
        text: '+500 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'salary',
        title: 'Lương',
        timestamp: 1700000000001,
      };
      useGameStore.setState({
        floatingTexts: [milestoneItem, regularToast],
        activeModifiers: [],
        activeModal: 'portfolio',
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('top-14');
      expect(html).not.toContain('floating-amount-pill');
    });

    it('[TC-372.12/MSS][UC-EMPTY-OVERLAY-TEARDOWN] FloatingNumbersOverlay returns null when floatingTexts array is empty', () => {
      useGameStore.setState({
        floatingTexts: [],
        activeModifiers: [],
        activeModal: null,
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toBe('');
    });
  });
});
