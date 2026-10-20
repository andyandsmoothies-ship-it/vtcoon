// [TC-451/MSS][IMP-451] Contract Test Suite: Desktop Viewport Ergonomics & Non-Occlusion Architecture
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): PlayerCard desktop collapse without sm:flex override, PlayerHudList md:w-56 sweet spot
// Facet 2 (State Reactivity): Active turn player property cluster expansion
// Facet 3 (Ergonomics & Non-Occlusion): Middle HudContainer overflow-hidden retention, FloatingBadge WCAG 2.2 AA close target
// Facet 4 (Text-Parity & Preservation): 100% narrative text structure preservation in frosted glassmorphic badge

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
} from '../../src/client/store/game_store.js';
import { PlayerCard } from '../../src/client/ui/player_card.js';
import { PlayerHudList } from '../../src/client/ui/player_hud_list.js';
import { HudContainer } from '../../src/client/ui/hud_container.js';
import { FloatingBadge } from '../../src/client/ui/floating_numbers.js';

const mockPlayer1: PlayerHudInfo = {
  id: 'p1',
  name: 'Chủ Tịch Hưng',
  balance: 15000,
  tokenColor: '#ef4444',
  ownedProperties: [1, 3],
  isBot: false,
};

const mockPlayer2: PlayerHudInfo = {
  id: 'p2',
  name: 'CEO Lan',
  balance: 12000,
  tokenColor: '#3b82f6',
  ownedProperties: [6, 8, 9],
  isBot: false,
};

describe('[IMP-451] Desktop Viewport Ergonomics & Non-Occlusion Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      playersInfo: { p1: mockPlayer1, p2: mockPlayer2 },
      currentTurnPlayerId: 'p1',
      isPlayerHudVisible: true,
      isPlayerHudCompact: false,
      levelMap: {},
      floatingTexts: [],
      activeModal: null,
    });
  });

  // ============================================================================
  // FACET 1: Boundary & Range (Desktop Smart Accordion & Width Sweet Spot)
  // ============================================================================
  describe('[IMP-451][Facet-1] Desktop Smart Accordion & Width Constraints', () => {
    it('[TC-451.01/MSS][UC-IMP451/MSS][Facet-1/Boundary] Given non-active player on desktop, When PlayerCard renders, Then property dots container contains hidden and does not contain sm:flex', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockPlayer2,
          isCurrentTurn: false,
          levelMap: {},
          slotIndex: 1,
        })
      );
      const clusterMatch = html.match(/<div[^>]*data-testid="player-property-clusters"[^>]*>/);
      expect(clusterMatch).not.toBeNull();
      expect(clusterMatch![0]).toContain('hidden');
      expect(clusterMatch![0]).not.toContain('sm:flex');
    });

    it('[TC-451.03/MSS][UC-IMP451/MSS][Facet-1/Boundary] Given desktop viewport, When PlayerHudList renders, Then container width is constrained by md:w-56 and contains overflow-y-auto', () => {
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));
      const asideMatch = html.match(/<aside[^>]*aria-label="Danh sách người chơi"[^>]*>/);
      expect(asideMatch).not.toBeNull();
      expect(asideMatch![0]).toContain('md:w-56');
      expect(asideMatch![0]).toContain('overflow-y-auto');
    });
  });

  // ============================================================================
  // FACET 2: State Reactivity (Active Turn Player Property Clusters)
  // ============================================================================
  describe('[IMP-451][Facet-2] Active Turn Player Property Cluster Expansion', () => {
    it('[TC-451.02/MSS][UC-IMP451/MSS][Facet-2/Reactivity] Given active turn player on desktop, When PlayerCard renders, Then property dots container contains flex without hidden', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockPlayer1,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
        })
      );
      const clusterMatch = html.match(/<div[^>]*data-testid="player-property-clusters"[^>]*>/);
      expect(clusterMatch).not.toBeNull();
      expect(clusterMatch![0]).not.toContain('hidden');
      expect(clusterMatch![0]).toContain('flex');
    });
  });

  // ============================================================================
  // FACET 3: Ergonomics & Non-Occlusion (Container Protection & Hit Targets)
  // ============================================================================
  describe('[IMP-451][Facet-3] Layout Containment & WCAG 2.2 AA Hit Target', () => {
    it('[TC-451.04/MSS][UC-IMP451/MSS][Facet-3/Ergonomics] Given middle hud container, When HudContainer renders, Then middle wrapper retains overflow-hidden preventing click interception on ActionDock', () => {
      const html = renderToStaticMarkup(React.createElement(HudContainer));
      expect(html).toContain('flex-1 flex justify-end items-start pointer-events-none my-2 overflow-hidden');
    });

    it('[TC-451.05/MSS][UC-IMP451/MSS][Facet-3/Ergonomics] Given active toasts on desktop, When FloatingBadge renders, Then close button maintains min-w-[24px] and min-h-[24px] with WCAG AA focus rings', () => {
      const toastItem: FloatingTextItem = {
        id: 'toast_rent_1',
        text: '-1.500 Tr',
        type: FloatingTextType.Penalty,
        playerId: 'p2',
        actionType: 'rent_pay',
        title: 'Trả thuê Bến Vân Đồn',
        targetPlayerId: 'p1',
        targetPlayerName: 'Chủ Tịch Hưng',
        timestamp: 1700000000000,
      };
      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: toastItem }));
      expect(html).toContain('min-w-[24px]');
      expect(html).toContain('min-h-[24px]');
      expect(html).toContain('focus-visible:ring-2');
      expect(html).toContain('aria-label="Đóng thông báo"');
    });

    it('[TC-451.07/MSS][UC-IMP451/MSS][Facet-3/Ergonomics] Given milestone banner toast, When rendered, Then close button maintains min-w-[24px] and min-h-[24px] and accessible label', () => {
      const milestoneItem: FloatingTextItem = {
        id: 'toast_ms_1',
        text: 'Cơ Hội: Nhận Thẻ',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'chance',
        title: 'Cơ Hội',
        timestamp: 1700000000000,
      };
      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: milestoneItem }));
      expect(html).toContain('min-w-[24px]');
      expect(html).toContain('min-h-[24px]');
      expect(html).toContain('aria-label="Đóng thông báo"');
    });
  });

  // ============================================================================
  // FACET 4: Text-Parity & Preservation (Zero Formula / Narrative Mutation)
  // ============================================================================
  describe('[IMP-451][Facet-4] Transaction Narrative Text Parity', () => {
    it('[TC-451.06/MSS][UC-IMP451/MSS][Facet-4/Text-Parity] Given transaction item, When FloatingBadge renders, Then 100% text structure and narrative content are preserved verbatim', () => {
      const toastItem: FloatingTextItem = {
        id: 'toast_tax_1',
        text: '-2.000 Tr',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'tax',
        title: 'Thuế Nhà Nước',
        formula: '10% giá trị tài sản ròng',
        timestamp: 1700000000000,
      };
      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: toastItem }));
      expect(html).toContain('10% giá trị tài sản ròng');
      expect(html).toContain('Thuế');
      expect(html).toContain('-2.000 Tr');
    });
  });
});
