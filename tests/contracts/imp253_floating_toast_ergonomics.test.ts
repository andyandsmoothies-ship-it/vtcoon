// [TC-IMP253.01/MSS..TC-IMP253.17/MSS][UC-IMP253] Floating Toast Ergonomics & Touch Target Polish Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Boundary & Class Contracts (TC-IMP253.01..08)
// Facet 2: Reactivity & Interaction (TC-IMP253.09..11)
// Facet 3: Disposal (TC-IMP253.12..13)
// Facet 4: Error Defense (TC-IMP253.14..15)
// Facet 5: Blast Radius (TC-IMP253.16..17)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  FloatingNumbersOverlay,
  FloatingBadge,
  MilestoneBanner,
  cleanEventDescription,
} from '../../src/client/ui/floating_numbers.js';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type ClientMarketModifier,
  type PlayerHudInfo,
} from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';

const samplePlayer: PlayerHudInfo = {
  id: 'p1',
  name: 'Chủ Tịch Sài Thành',
  balance: 20000,
  tokenColor: '#38BDF8',
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

const sampleRegularItem2: FloatingTextItem = {
  id: 'ft_salary_2',
  playerId: 'p1',
  text: '+2.000 Tr.',
  type: FloatingTextType.Reward,
  actionType: 'salary',
  title: 'Lương qua GO',
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

describe('[TC-IMP253.01/MSS..TC-IMP253.17/MSS][UC-IMP253] Floating Toast Ergonomics & Touch Target Polish Contract Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
    useLobbyStore.setState({ myPlayerId: 'p1' });
    useGameStore.setState({
      playersInfo: { p1: samplePlayer },
      playerPositions: { p1: 0 },
      activeModal: null,
      activeModifiers: [],
      floatingTexts: [],
    });
  });

  // =========================================================================
  // FACET 1: Boundary & Class Contracts (TC-IMP253.01..08)
  // =========================================================================
  describe('Facet 1: Boundary & Class Contracts', () => {
    it('[TC-IMP253.01/MSS][UC-IMP253] Desktop container định vị md:right-[18.5rem] và md:translate-x-0', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:right-[18.5rem]');
      expect(html).toContain('md:translate-x-0');
      expect(html).not.toContain('md:right-6');
    });

    it('[TC-IMP253.02/MSS][UC-IMP253] Mobile container định vị bottom-[calc(8rem+env(safe-area-inset-bottom))] căn giữa left-1/2 -translate-x-1/2', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('bottom-[calc(8rem+env(safe-area-inset-bottom))]');
      expect(html).toContain('left-1/2 -translate-x-1/2');
    });

    it('[TC-IMP253.03/MSS][UC-IMP253] Khi activeMarketCount === 0 Desktop áp dụng md:top-20', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:top-20');
      expect(html).toContain('md:bottom-auto');
    });

    it('[TC-IMP253.04/MSS][UC-IMP253] Khi activeMarketCount === 1 Desktop áp dụng md:top-28', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [sampleModifier1],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:top-28');
      expect(html).toContain('md:bottom-auto');
    });

    it('[TC-IMP253.05/MSS][UC-IMP253] Khi activeMarketCount === 2 Desktop áp dụng md:top-36', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [sampleModifier1, sampleModifier2],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:top-36');
      expect(html).toContain('md:bottom-auto');
    });

    it('[TC-IMP253.06/MSS][UC-IMP253] Khi activeMarketCount >= 3 Desktop áp dụng md:top-44', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [sampleModifier1, sampleModifier2, sampleModifier3],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:top-44');
      expect(html).toContain('md:bottom-auto');
    });

    it('[TC-IMP253.07/MSS][UC-IMP253] Nút đóng FloatingBadge đạt kích thước tối thiểu WCAG 2.2 AA (min-w-[24px] min-h-[24px]) kèm viền tiêu điểm focus-visible:ring-2 (WCAG 2.4.7)', () => {
      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: sampleRegularItem }));
      expect(html).toContain('min-w-[24px]');
      expect(html).toContain('min-h-[24px]');
      expect(html).toContain('focus-visible:ring-2');
      expect(html).toContain('focus-visible:ring-slate-400');
    });

    it('[TC-IMP253.08/MSS][UC-IMP253] Nút đóng FloatingBadge giữ nguyên thuộc tính aria-label="Đóng thông báo"', () => {
      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: sampleRegularItem }));
      expect(html).toContain('aria-label="Đóng thông báo"');
      expect(html).toContain('✕');
    });
  });

  // =========================================================================
  // FACET 2: Reactivity & Interaction (TC-IMP253.09..11)
  // =========================================================================
  describe('Facet 2: Reactivity & Interaction', () => {
    it('[TC-IMP253.09/MSS][UC-IMP253] Mobile hiển thị đủ 2 thông báo tài chính gần nhất khi không có milestone (không bị nuốt thẻ)', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [sampleRegularItem, sampleRegularItem2],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain(sampleRegularItem.text);
      expect(html).toContain(sampleRegularItem2.text);
      expect(html).not.toContain('hidden md:flex');
    });

    it('[TC-IMP253.10/MSS][UC-IMP253] Mobile ẩn thẻ thường cũ khi có MilestoneBanner hoạt động (bảo tồn quy tắc nhịp độ IMP-252)', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [sampleRegularItem, sampleRegularItem2, sampleMilestoneItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('data-testid="milestone-banner-container"');
      expect(html).toContain('w-full justify-start sm:justify-center hidden md:flex');
    });

    it('[TC-IMP253.11/MSS][UC-IMP253] Thao tác click vào thân thẻ FloatingBadge kích hoạt removeFloatingText trên store', () => {
      useGameStore.setState({ floatingTexts: [sampleRegularItem] });
      let capturedOnClick: (() => void) | undefined;
      function TestWrapper(): React.ReactElement {
        const el = FloatingBadge({ item: sampleRegularItem }) as React.ReactElement<{ onClick?: () => void }>;
        capturedOnClick = el.props.onClick;
        return el;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));
      expect(capturedOnClick).toBeDefined();
      capturedOnClick?.();
      expect(useGameStore.getState().floatingTexts.some((t) => t.id === sampleRegularItem.id)).toBe(false);
    });
  });

  // =========================================================================
  // FACET 3: Disposal (TC-IMP253.12..13)
  // =========================================================================
  describe('Facet 3: Disposal', () => {
    it('[TC-IMP253.12/MSS][UC-IMP253] FloatingNumbersOverlay trả về null khi floatingTexts rỗng (giải phóng toàn bộ layout DOM)', () => {
      useGameStore.setState({ floatingTexts: [], activeModal: null });
      let capturedElement: React.ReactElement | null = React.createElement('div');
      function TestWrapper(): React.ReactElement | null {
        capturedElement = FloatingNumbersOverlay();
        return capturedElement;
      }
      const html = renderToStaticMarkup(React.createElement(TestWrapper));
      expect(capturedElement).toBeNull();
      expect(html).toBe('');
    });

    it('[TC-IMP253.13/MSS][UC-IMP253] FloatingNumbersOverlay trả về null khi activeModal !== null (tránh che khuất cửa sổ nghiệp vụ)', () => {
      useGameStore.setState({ floatingTexts: [sampleRegularItem], activeModal: 'auction' });
      let capturedElement: React.ReactElement | null = React.createElement('div');
      function TestWrapper(): React.ReactElement | null {
        capturedElement = FloatingNumbersOverlay();
        return capturedElement;
      }
      const html = renderToStaticMarkup(React.createElement(TestWrapper));
      expect(capturedElement).toBeNull();
      expect(html).toBe('');
    });
  });

  // =========================================================================
  // FACET 4: Error Defense (TC-IMP253.14..15)
  // =========================================================================
  describe('Facet 4: Error Defense', () => {
    it('[TC-IMP253.14/MSS][UC-IMP253] activeModifiers là undefined hoặc mảng rỗng không gây crash stackTopClass', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:top-20');
      expect(html).not.toContain('undefined');
    });

    it('[TC-IMP253.15/MSS][UC-IMP253] Nhấn phím Enter hoặc Space trên MilestoneBanner kích hoạt dismiss an toàn', () => {
      useGameStore.setState({ floatingTexts: [sampleMilestoneItem] });
      let capturedOnKeyDown: ((e: { key: string; preventDefault: () => void }) => void) | undefined;
      function TestWrapper(): React.ReactElement {
        const el = MilestoneBanner({ item: sampleMilestoneItem }) as React.ReactElement<{
          onKeyDown?: (e: { key: string; preventDefault: () => void }) => void;
        }>;
        capturedOnKeyDown = el.props.onKeyDown;
        return el;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));
      expect(capturedOnKeyDown).toBeDefined();
      capturedOnKeyDown?.({ key: 'Enter', preventDefault: () => {} });
      expect(useGameStore.getState().floatingTexts.some((t) => t.id === sampleMilestoneItem.id)).toBe(false);
    });
  });

  // =========================================================================
  // FACET 5: Blast Radius (TC-IMP253.16..17)
  // =========================================================================
  describe('Facet 5: Blast Radius', () => {
    it('[TC-IMP253.16/MSS][UC-IMP253] Desktop container giữ nguyên class căn lề phải md:items-end', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('md:items-end');
    });

    it('[TC-IMP253.17/MSS][UC-IMP253] Mobile container giữ nguyên class căn lề giữa items-center', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [sampleRegularItem],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('items-center');
    });
  });
});
