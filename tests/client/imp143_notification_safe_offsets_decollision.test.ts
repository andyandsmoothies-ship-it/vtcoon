// [IMP-143][Trạm 1] Contract Test Suite: Triệt Tiêu Chồng Đè Pop-up Bằng Hệ Thống Tọa Độ Đa Tầng Định Lượng Chính Xác Dưới MarketEventTicker
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): Milestone Banner dynamic safe top offsets across activeMarketCount boundaries (0, 1, >= 2)
// Facet 2 (State Reactivity): Mobile Toast safe decollision offsets reacting to latestMilestone presence & active market event count
// Facet 3 (Desktop Toast Offsets Decollision): Desktop Toast safe decollision coordinates under MarketEventTicker & MilestoneBanner
// Facet 4 (Component Resilience, Modal Isolation & Error Defense): Modal isolation unmount, null release, invariant classes & milestone types

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
} from '../../src/client/store/game_store.js';
import { FloatingNumbersOverlay } from '../../src/client/ui/floating_numbers.js';
import { MarketCardId } from '../../src/domain/event_card_types.js';

function extractMilestoneContainer(html: string): string {
  const match = html.match(/<div[^>]*data-testid="milestone-banner-container"[^>]*>/);
  return match ? match[0] : '';
}

function extractStackContainer(html: string): string {
  const match = html.match(/<div[^>]*class="[^"]*(?:left-1\/2|sm:left-1\/2)[^"]*gap-2[^"]*"[^>]*>/);
  return match ? match[0] : '';
}

function extractMobileContainer(html: string): string {
  return extractStackContainer(html);
}

function extractDesktopContainer(html: string): string {
  return extractStackContainer(html);
}

function extractOverlay(html: string): string {
  const match = html.match(/<aside[^>]*data-testid="floating-numbers-overlay"[^>]*>/);
  return match ? match[0] : '';
}

const BASE_REGULAR_TOAST: FloatingTextItem = {
  id: 'ft_reg_1',
  text: '+2.000 Tr.',
  type: FloatingTextType.Reward,
  playerId: 'p1',
  actionType: 'salary',
  title: 'Thưởng qua ô Khởi Hành',
  timestamp: 1700000000000,
};

const BASE_MILESTONE_ITEM: FloatingTextItem = {
  id: 'ft_ms_1',
  text: 'Sự kiện thị trường biến động',
  type: FloatingTextType.Reward,
  playerId: 'p1',
  actionType: 'market',
  title: 'Cơn Bão Bờ Biển',
  timestamp: 1700000000001,
};

describe('[IMP-143] Tọa Độ Đa Tầng Định Lượng Chính Xác Dưới MarketEventTicker', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [BASE_REGULAR_TOAST],
      activeModifiers: [],
      activeModal: null,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Hà Thành',
          balance: 28000,
          tokenColor: '#0ea5e9',
          ownedProperties: [],
        },
      },
    });
  });

  // ============================================================================
  // FACET 1: Boundary & Milestone Banner Offsets
  // ============================================================================
  describe('[IMP-143][Facet-1] Milestone Banner Dynamic Safe Top Offsets', () => {
    it('[TC-IMP143.01/MSS][UC-IMP143][Facet-1/Boundary] activeMarketCount === 0: unified stack container có class top-20', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM],
        activeModifiers: [],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractStackContainer(html);
      expect(container).toContain('top-20');
      expect(container).not.toContain('top-[10.5rem]');
    });

    it('[TC-IMP143.02/MSS][UC-IMP143][Facet-1/Boundary] activeMarketCount === 1: unified stack container có class top-28 sm:top-24 (IMP-195)', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM],
        activeModifiers: [{ type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 2 }],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractStackContainer(html);
      expect(container).toContain('top-28 sm:top-24');
    });

    it('[TC-IMP143.03/MSS][UC-IMP143][Facet-1/Boundary] activeMarketCount >= 2: unified stack container có class top-28 sm:top-24 (IMP-195)', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM],
        activeModifiers: [
          { type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 2 },
          { type: MarketCardId.MC_COASTAL_STORM, remainingRounds: 1 },
        ],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractStackContainer(html);
      expect(container).toContain('top-28 sm:top-24');
    });
  });

  // ============================================================================
  // FACET 2: Reactivity & Mobile Toast Decollision
  // ============================================================================
  describe('[IMP-143][Facet-2] Mobile Toast Decollision Coordinates', () => {
    it('[TC-IMP143.04/MSS][UC-IMP143][Facet-2/Reactivity] Có latestMilestone và activeMarketCount === 0: mobile container có class top-20 và gap-2 (không còn top-[11.5rem])', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM, BASE_REGULAR_TOAST],
        activeModifiers: [],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractMobileContainer(html);
      expect(container).toContain('top-20');
      expect(container).toContain('gap-2');
      expect(container).not.toContain('top-[11.5rem]');
    });

    it('[TC-IMP143.05/MSS][UC-IMP143][Facet-2/Reactivity] Có latestMilestone và activeMarketCount === 1: mobile container có class top-28 sm:top-24 và gap-2 (IMP-195)', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM, BASE_REGULAR_TOAST],
        activeModifiers: [{ type: MarketCardId.MC_ANTI_SPECULATE, remainingRounds: 2 }],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractMobileContainer(html);
      expect(container).toContain('top-28 sm:top-24');
      expect(container).toContain('gap-2');
    });

    it('[TC-IMP143.06/MSS][UC-IMP143][Facet-2/Reactivity] Có latestMilestone và activeMarketCount >= 2: mobile container có class top-28 sm:top-24 và gap-2 (IMP-195)', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM, BASE_REGULAR_TOAST],
        activeModifiers: [
          { type: MarketCardId.MC_ANTI_SPECULATE, remainingRounds: 2 },
          { type: MarketCardId.MC_CREDIT_STIMULUS, remainingRounds: 1 },
        ],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractMobileContainer(html);
      expect(container).toContain('top-28 sm:top-24');
      expect(container).toContain('gap-2');
    });

    it('[TC-IMP143.07/MSS][UC-IMP143][Facet-2/Reactivity] Không có latestMilestone và activeMarketCount === 0: mobile container có class top-20 và gap-2', () => {
      useGameStore.setState({
        floatingTexts: [BASE_REGULAR_TOAST],
        activeModifiers: [],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractMobileContainer(html);
      expect(container).toContain('top-20');
      expect(container).toContain('gap-2');
    });

    it('[TC-IMP143.08/MSS][UC-IMP143][Facet-2/Reactivity] Không có latestMilestone và activeMarketCount === 1: mobile container có class top-28 sm:top-24 và gap-2 (IMP-195)', () => {
      useGameStore.setState({
        floatingTexts: [BASE_REGULAR_TOAST],
        activeModifiers: [{ type: MarketCardId.MC_ANTI_SPECULATE, remainingRounds: 2 }],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractMobileContainer(html);
      expect(container).toContain('top-28 sm:top-24');
      expect(container).toContain('gap-2');
    });

    it('[TC-IMP143.09/MSS][UC-IMP143][Facet-2/Reactivity] Không có latestMilestone và activeMarketCount >= 2: mobile container có class top-28 sm:top-24 và gap-2 (IMP-195)', () => {
      useGameStore.setState({
        floatingTexts: [BASE_REGULAR_TOAST],
        activeModifiers: [
          { type: MarketCardId.MC_ANTI_SPECULATE, remainingRounds: 2 },
          { type: MarketCardId.MC_RATE_HIKE, remainingRounds: 1 },
        ],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractMobileContainer(html);
      expect(container).toContain('top-28 sm:top-24');
      expect(container).toContain('gap-2');
    });
  });

  // ============================================================================
  // FACET 3: Desktop Toast Offsets Decollision
  // ============================================================================
  describe('[IMP-143][Facet-3] Desktop Toast Offsets Decollision', () => {
    it('[TC-IMP143.10/MSS][UC-IMP143][Facet-3/Boundary] Có latestMilestone và activeMarketCount === 0: desktop container có class top-20 và gap-2', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM, BASE_REGULAR_TOAST],
        activeModifiers: [],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractDesktopContainer(html);
      expect(container).toContain('top-20');
      expect(container).toContain('gap-2');
    });

    it('[TC-IMP143.11/MSS][UC-IMP143][Facet-3/Boundary] Có latestMilestone và activeMarketCount === 1: desktop container có class top-28 sm:top-24 và gap-2 (IMP-195)', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM, BASE_REGULAR_TOAST],
        activeModifiers: [{ type: MarketCardId.MC_PUBLIC_INVEST, remainingRounds: 2 }],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractDesktopContainer(html);
      expect(container).toContain('top-28 sm:top-24');
      expect(container).toContain('gap-2');
    });

    it('[TC-IMP143.12/MSS][UC-IMP143][Facet-3/Boundary] Có latestMilestone và activeMarketCount >= 2: desktop container có class top-28 sm:top-24 và gap-2 (IMP-195)', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM, BASE_REGULAR_TOAST],
        activeModifiers: [
          { type: MarketCardId.MC_PUBLIC_INVEST, remainingRounds: 2 },
          { type: MarketCardId.MC_LAND_FEVER, remainingRounds: 1 },
        ],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractDesktopContainer(html);
      expect(container).toContain('top-28 sm:top-24');
      expect(container).toContain('gap-2');
    });

    it('[TC-IMP143.13/MSS][UC-IMP143][Facet-3/Boundary] Không có latestMilestone và activeMarketCount === 0: desktop container bảo toàn top-20 và gap-2', () => {
      useGameStore.setState({
        floatingTexts: [BASE_REGULAR_TOAST],
        activeModifiers: [],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractDesktopContainer(html);
      expect(container).toContain('top-20');
      expect(container).toContain('gap-2');
    });

    it('[TC-IMP143.14/MSS][UC-IMP143][Facet-3/Boundary] Không có latestMilestone và activeMarketCount === 1: desktop container có class top-28 sm:top-24 và gap-2 (IMP-195)', () => {
      useGameStore.setState({
        floatingTexts: [BASE_REGULAR_TOAST],
        activeModifiers: [{ type: MarketCardId.MC_PUBLIC_INVEST, remainingRounds: 2 }],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractDesktopContainer(html);
      expect(container).toContain('top-28 sm:top-24');
      expect(container).toContain('gap-2');
    });

    it('[TC-IMP143.15/MSS][UC-IMP143][Facet-3/Boundary] Không có latestMilestone và activeMarketCount >= 2: desktop container có class top-28 sm:top-24 và gap-2 (IMP-195)', () => {
      useGameStore.setState({
        floatingTexts: [BASE_REGULAR_TOAST],
        activeModifiers: [
          { type: MarketCardId.MC_PUBLIC_INVEST, remainingRounds: 2 },
          { type: MarketCardId.MC_FREEZE_TRADE, remainingRounds: 1 },
        ],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const container = extractDesktopContainer(html);
      expect(container).toContain('top-28 sm:top-24');
      expect(container).toContain('gap-2');
    });
  });

  // ============================================================================
  // FACET 4: Component Resilience, Modal Isolation & Error Defense
  // ============================================================================
  describe('[IMP-143][Facet-4] Component Resilience, Modal Isolation & Error Defense', () => {
    it('[TC-IMP143.16/MSS][UC-IMP143][Facet-4/Disposal] Khi floatingTexts rỗng: FloatingNumbersOverlay giải phóng DOM trả về null', () => {
      useGameStore.setState({
        floatingTexts: [],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toBe('');
    });

    it('[TC-IMP143.17/A1][UC-IMP143][Facet-4/ErrorDefense] Khi activeModal === auction: FloatingNumbersOverlay cô lập modal và trả về null', () => {
      useGameStore.setState({
        floatingTexts: [BASE_REGULAR_TOAST],
        activeModal: 'auction',
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toBe('');
    });

    it('[TC-IMP143.18/A2][UC-IMP143][Facet-4/ErrorDefense] Khi activeModal === deed: FloatingNumbersOverlay cô lập modal và trả về null', () => {
      useGameStore.setState({
        floatingTexts: [BASE_REGULAR_TOAST],
        activeModal: 'deed',
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toBe('');
    });

    it('[TC-IMP143.19/A3][UC-IMP143][Facet-4/ErrorDefense] Khi activeModal === portfolio: FloatingNumbersOverlay cô lập modal và trả về null', () => {
      useGameStore.setState({
        floatingTexts: [BASE_REGULAR_TOAST],
        activeModal: 'portfolio',
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toBe('');
    });

    it('[TC-IMP143.20/MSS][UC-IMP143][Facet-4/Boundary] Overlay duy trì z-30 và các container con căn giữa left-1/2 -translate-x-1/2', () => {
      useGameStore.setState({
        floatingTexts: [BASE_MILESTONE_ITEM, BASE_REGULAR_TOAST],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const overlay = extractOverlay(html);
      const mobile = extractMobileContainer(html);
      const desktop = extractDesktopContainer(html);
      const milestone = extractMilestoneContainer(html);

      expect(overlay).toContain('z-30');
      expect(mobile).toContain('left-1/2');
      expect(desktop).toContain('left-1/2');
      expect(mobile).toContain('-translate-x-1/2');
      expect(milestone).toContain('data-testid="milestone-banner-container"');
    });

    it('[TC-IMP143.21/MSS][UC-IMP143][Facet-4/Reactivity] Milestone actionType = chance: nhận diện chuẩn xác milestone banner', () => {
      useGameStore.setState({
        floatingTexts: [
          {
            id: 'ft_chance_1',
            text: '+1.500 Tr.',
            type: FloatingTextType.Reward,
            playerId: 'p1',
            actionType: 'chance',
            title: 'Cơ Hội: Nhận Cổ Tức',
            timestamp: 1700000000002,
          },
        ],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('data-testid="milestone-banner-container"');
      expect(html).toContain('data-testid="event-card-notification-banner"');
    });

    it('[TC-IMP143.22/MSS][UC-IMP143][Facet-4/Reactivity] Milestone actionType = market: nhận diện chuẩn xác milestone banner', () => {
      useGameStore.setState({
        floatingTexts: [
          {
            id: 'ft_market_1',
            text: 'Tất cả BĐS miền Trung được nâng cấp miễn phí',
            type: FloatingTextType.Reward,
            playerId: 'p1',
            actionType: 'market',
            title: 'Gói Kích Thích Du Lịch',
            timestamp: 1700000000003,
          },
        ],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('data-testid="milestone-banner-container"');
      expect(html).toContain('data-testid="event-card-notification-banner"');
    });

    it('[TC-IMP143.23/MSS][UC-IMP143][Facet-4/Reactivity] Milestone actionType = monopoly: nhận diện chuẩn xác milestone banner', () => {
      useGameStore.setState({
        floatingTexts: [
          {
            id: 'ft_monopoly_1',
            text: 'Đã hoàn tất độc quyền nhóm màu Đỏ!',
            type: FloatingTextType.Reward,
            playerId: 'p1',
            actionType: 'monopoly',
            title: 'Độc Quyền Nhóm Đất',
            timestamp: 1700000000004,
          },
        ],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('data-testid="milestone-banner-container"');
      expect(html).toContain('data-testid="milestone-celebration-banner"');
    });

    it('[TC-IMP143.24/MSS][UC-IMP143][Facet-4/Reactivity] Milestone actionType = debt_relief: nhận diện chuẩn xác milestone banner', () => {
      useGameStore.setState({
        floatingTexts: [
          {
            id: 'ft_debt_relief_1',
            text: 'Thoát vỡ nợ thành công!',
            type: FloatingTextType.Reward,
            playerId: 'p1',
            actionType: 'debt_relief',
            title: 'Tái Cấu Trúc Nợ Thành Công',
            timestamp: 1700000000005,
          },
        ],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('data-testid="milestone-banner-container"');
      expect(html).toContain('data-testid="milestone-celebration-banner"');
    });
  });
});
