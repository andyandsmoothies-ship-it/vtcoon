// [IMP-139] Popup De-collision & Modal Z-Index Hierarchy Contract Test Suite
// Station 1: RED Contract Tests
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Z-Index Hierarchy & Modal Isolation): ModalBackdrop z-50, TelemetryConsoleModal z-[60], FloatingNumbersOverlay z-30, Modal Active Nullification
// Facet 2 (Mobile De-collision): Safe dynamic top offsets with/without latestMilestone and activeMarketCount
// Facet 3 (Desktop De-collision): Desktop toast offset shifting under MilestoneBanner
// Facet 4 (Component Resilience & Error Defense): Null handling on empty list, solo milestone banner, and activeModal transition reactivity

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
} from '../../src/client/store/game_store.js';
import { FloatingNumbersOverlay } from '../../src/client/ui/floating_numbers.js';
import { ModalBackdrop } from '../../src/client/ui/modals/modal_backdrop.js';
import { TelemetryConsoleModal } from '../../src/client/ui/telemetry/telemetry_console_modal.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';
import { MarketCardId } from '../../src/domain/event_card_types.js';

describe('[IMP-139] Popup De-collision & Modal Z-Index Hierarchy Contract Suite', () => {
  const sampleRegularToast: FloatingTextItem = {
    id: 'ft_buy_dong_nai',
    text: '-1.000 Tr.',
    type: FloatingTextType.Penalty,
    playerId: 'p1',
    actionType: 'buy',
    title: 'Mua Đồng Nai',
    timestamp: 1789900000000,
  };

  const sampleMilestoneToast: FloatingTextItem = {
    id: 'ft_milestone_chance',
    text: '+500 Tr.',
    type: FloatingTextType.Reward,
    playerId: 'p1',
    actionType: 'chance',
    title: 'Cơ Hội: Thưởng Cổ Tức',
    timestamp: 1789900001000,
  };

  beforeEach(() => {
    useGameStore.setState({
      activeModal: null,
      floatingTexts: [],
      activeModifiers: [],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Gòn',
          balance: 15000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
        },
      },
    });
    useTelemetryStore.setState({
      isConsoleOpen: false,
    });
  });

  // ============================================================================
  // FACET 1: Z-Index Hierarchy & Modal Isolation
  // ============================================================================
  describe('Facet 1: Z-Index Hierarchy & Modal Isolation', () => {
    it('[TC-139.01/MSS][UC-IMP139][Facet-1/ZIndex] ModalBackdrop render với z-50 ở chế độ mặc định (center=false, fullScreen=false)', () => {
      const html = renderToStaticMarkup(
        React.createElement(
          ModalBackdrop,
          { center: false, fullScreen: false },
          React.createElement('div', null, 'Nội dung modal')
        )
      );
      expect(html).toContain('z-50');
      expect(html).not.toContain('z-30');
    });

    it('[TC-139.02/MSS][UC-IMP139][Facet-1/ZIndex] ModalBackdrop render với z-50 ở chế độ center=true', () => {
      const html = renderToStaticMarkup(
        React.createElement(
          ModalBackdrop,
          { center: true },
          React.createElement('div', null, 'Nội dung modal giữa màn hình')
        )
      );
      expect(html).toContain('z-50');
      expect(html).not.toContain('z-30');
    });

    it('[TC-139.03/MSS][UC-IMP139][Facet-1/ZIndex] ModalBackdrop render với z-50 ở chế độ fullScreen=true', () => {
      const html = renderToStaticMarkup(
        React.createElement(
          ModalBackdrop,
          { fullScreen: true },
          React.createElement('div', null, 'Nội dung toàn màn hình')
        )
      );
      expect(html).toContain('z-50');
      expect(html).not.toContain('z-30');
    });

    it('[TC-139.04/MSS][UC-IMP139][Facet-1/ZIndex] FloatingNumbersOverlay container chính chứa z-30', () => {
      useGameStore.setState({ floatingTexts: [sampleRegularToast] });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const asideMatch = html.match(/<aside[^>]*data-testid="floating-numbers-overlay"[^>]*>/);
      expect(asideMatch).not.toBeNull();
      expect(asideMatch![0]).toContain('z-30');
      expect(asideMatch![0]).not.toContain('z-40');
    });

    it('[TC-139.05/MSS][UC-IMP139][Facet-1/ZIndex] MilestoneBanner container wrapper chứa z-30', () => {
      useGameStore.setState({ floatingTexts: [sampleMilestoneToast] });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const milestoneWrapperMatch = html.match(/<div[^>]*class="[^"]*fixed top-(?:20|28|40) left-1\/2[^"]*"[^>]*>/);
      expect(milestoneWrapperMatch).not.toBeNull();
      expect(milestoneWrapperMatch![0]).toContain('z-30');
      expect(milestoneWrapperMatch![0]).not.toContain('z-50');
    });

    it('[TC-139.06/MSS][UC-IMP139][Facet-1/ZIndex] TelemetryConsoleModal render với z-[60]', () => {
      useTelemetryStore.setState({ isConsoleOpen: true });
      const html = renderToStaticMarkup(React.createElement(TelemetryConsoleModal));
      expect(html).toContain('z-[60]');
      expect(html).not.toContain('z-40');
    });

    it('[TC-139.07/MSS][UC-IMP139][Facet-1/Isolation] FloatingNumbersOverlay trả về null khi activeModal = deed', () => {
      useGameStore.setState({
        activeModal: 'deed',
        floatingTexts: [sampleRegularToast],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toBe('');
    });

    it('[TC-139.08/MSS][UC-IMP139][Facet-1/Isolation] FloatingNumbersOverlay trả về null khi activeModal = portfolio', () => {
      useGameStore.setState({
        activeModal: 'portfolio',
        floatingTexts: [sampleRegularToast],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toBe('');
    });

    it('[TC-139.09/MSS][UC-IMP139][Facet-1/Isolation] FloatingNumbersOverlay trả về null khi activeModal = auction', () => {
      useGameStore.setState({
        activeModal: 'auction',
        floatingTexts: [sampleRegularToast],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toBe('');
    });
  });

  // ============================================================================
  // FACET 2: Mobile De-collision
  // ============================================================================
  describe('Facet 2: Mobile De-collision', () => {
    it('[TC-139.10/MSS][UC-IMP139][Facet-2/Mobile] Khi có latestMilestone và activeMarketCount === 0, container có class top-20', () => {
      useGameStore.setState({
        activeModifiers: [],
        floatingTexts: [sampleMilestoneToast, sampleRegularToast],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const stackMatch = html.match(/<div[^>]*class="[^"]*(?:md:max-w-md|fixed\s+top-)[^"]*"[^>]*>/);
      expect(stackMatch).not.toBeNull();
      expect(stackMatch![0]).toContain('top-20');
      expect(stackMatch![0]).not.toContain('top-36');
    });

    it('[TC-139.11/MSS][UC-IMP139][Facet-2/Mobile] Khi có latestMilestone và activeMarketCount === 1, container giữ class top-[10.5rem]', () => {
      useGameStore.setState({
        activeModifiers: [
          { type: MarketCardId.MC_PEAK_TOURISM, remainingRounds: 1 },
        ],
        floatingTexts: [sampleMilestoneToast, sampleRegularToast],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const stackMatch = html.match(/<div[^>]*class="[^"]*(?:md:max-w-md|fixed\s+top-)[^"]*"[^>]*>/);
      expect(stackMatch).not.toBeNull();
      expect(stackMatch![0]).toContain('top-[10.5rem]');
    });

    it('[TC-139.12/MSS][UC-IMP139][Facet-2/Mobile] Khi có latestMilestone và activeMarketCount >= 2, container có class top-[15.5rem]', () => {
      useGameStore.setState({
        activeModifiers: [
          { type: MarketCardId.MC_PEAK_TOURISM, remainingRounds: 1 },
          { type: MarketCardId.MC_RATE_HIKE, remainingRounds: 2 },
        ],
        floatingTexts: [sampleMilestoneToast, sampleRegularToast],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const stackMatch = html.match(/<div[^>]*class="[^"]*(?:md:max-w-md|fixed\s+top-)[^"]*"[^>]*>/);
      expect(stackMatch).not.toBeNull();
      expect(stackMatch![0]).toContain('top-[15.5rem]');
    });

    it('[TC-139.13/MSS][UC-IMP139][Facet-2/Mobile] Khi không có latestMilestone, container hoàn nguyên top-20 (0 market) và top-[10.5rem] (1 market)', () => {
      useGameStore.setState({
        activeModifiers: [],
        floatingTexts: [sampleRegularToast],
      });
      const html0 = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const stackMatch0 = html0.match(/<div[^>]*class="[^"]*(?:md:max-w-md|fixed\s+top-)[^"]*"[^>]*>/);
      expect(stackMatch0![0]).toContain('top-20');

      useGameStore.setState({
        activeModifiers: [
          { type: MarketCardId.MC_PEAK_TOURISM, remainingRounds: 1 },
        ],
        floatingTexts: [sampleRegularToast],
      });
      const html1 = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const stackMatch1 = html1.match(/<div[^>]*class="[^"]*(?:md:max-w-md|fixed\s+top-)[^"]*"[^>]*>/);
      expect(stackMatch1![0]).toContain('top-[10.5rem]');
    });
  });

  // ============================================================================
  // FACET 3: Desktop De-collision
  // ============================================================================
  describe('Facet 3: Desktop De-collision', () => {
    it('[TC-139.14/MSS][UC-IMP139][Facet-3/Desktop] Khi có latestMilestone, container căn giữa và áp dụng gap-2 để không chèn đè MilestoneBanner', () => {
      useGameStore.setState({
        floatingTexts: [sampleMilestoneToast, sampleRegularToast],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const stackMatch = html.match(/<div[^>]*class="[^"]*(?:md:max-w-md|fixed\s+top-)[^"]*"[^>]*>/);
      expect(stackMatch).not.toBeNull();
      expect(stackMatch![0]).toContain('gap-2');
      expect(stackMatch![0]).toContain('left-1/2');
    });

    it('[TC-139.15/MSS][UC-IMP139][Facet-3/Desktop] Khi không có latestMilestone, container giữ nguyên top-20 (bảo toàn IMP-128 & IMP-169)', () => {
      useGameStore.setState({
        floatingTexts: [sampleRegularToast],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const stackMatch = html.match(/<div[^>]*class="[^"]*(?:md:max-w-md|fixed\s+top-)[^"]*"[^>]*>/);
      expect(stackMatch).not.toBeNull();
      expect(stackMatch![0]).toContain('top-20');
    });
  });

  // ============================================================================
  // FACET 4: Component Resilience & Error Defense
  // ============================================================================
  describe('Facet 4: Component Resilience & Error Defense', () => {
    it('[TC-139.16/MSS][UC-IMP139][Facet-4/Resilience] Khi floatingTexts rỗng, FloatingNumbersOverlay trả về null', () => {
      useGameStore.setState({ floatingTexts: [] });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toBe('');
    });

    it('[TC-139.17/MSS][UC-IMP139][Facet-4/Resilience] Khi chỉ có milestone toasts mà không có regular toasts, không văng lỗi', () => {
      useGameStore.setState({ floatingTexts: [sampleMilestoneToast] });
      let html = '';
      expect(() => {
        html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      }).not.toThrow();
      expect(html).toContain('Thưởng Cổ Tức');
    });

    it('[TC-139.18/MSS][UC-IMP139][Facet-4/Resilience] Khi activeModal chuyển từ deed về null, FloatingNumbersOverlay render lại bình thường', () => {
      useGameStore.setState({
        activeModal: 'deed',
        floatingTexts: [sampleRegularToast],
      });
      const htmlModalOpen = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(htmlModalOpen).toBe('');

      useGameStore.setState({ activeModal: null });
      const htmlModalClosed = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(htmlModalClosed).toContain('vtcoon-floating-numbers');
      expect(htmlModalClosed).toContain('-1.000 Tr.');
    });
  });
});
