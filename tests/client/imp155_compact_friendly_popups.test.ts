// [IMP-155: Trạm 1 RED] Compact & Friendly Notification Popups Overhaul
// Tests for clean event descriptions, short bot player names, compact layout, tap-to-dismiss, and ticker budget
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  MilestoneBanner,
  FloatingBadge,
  cleanEventDescription,
  formatShortPlayerName,
} from '../../src/client/ui/floating_numbers.js';
import { MarketEventTicker } from '../../src/client/ui/market_event_ticker.js';
import {
  useGameStore,
  FloatingTextType,
  EVENT_BANNER_DURATION_MS,
  type FloatingTextItem,
} from '../../src/client/store/game_store.js';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';

describe('[IMP-155: Trạm 1 RED] Compact & Friendly Notification Popups Overhaul', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      activeModal: null,
      activeModifiers: [],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Bot AI 3 (Aggressive)',
          tokenColor: '#ef4444',
          avatar: '🤖',
          balance: 15000,
          ownedProperties: [],
          mortgagedProperties: [],
        },
        p2: {
          id: 'p2',
          name: 'Đại Gia Sài Gòn (VIP)',
          tokenColor: '#3b82f6',
          avatar: '🦁',
          balance: 20000,
          ownedProperties: [],
          mortgagedProperties: [],
        },
      },
    });
  });

  // =========================================================================
  // Facet 1: Boundary & Formatting (cleanEventDescription & formatShortPlayerName)
  // =========================================================================
  describe('Facet 1: Boundary & Formatting (cleanEventDescription & formatShortPlayerName)', () => {
    it('[TC-155.01/MSS][UC-GAME-023][IMP-155][Facet-1/Boundary] cleanEventDescription bóc tách tiền tố lặp lại trước dấu hai chấm', () => {
      const raw = 'Quy hoạch trục đô thị mới: Tăng 20% giá trị khi thế chấp BĐS trung tâm Hà Nội & TP.HCM.';
      const cleaned = cleanEventDescription(raw);
      expect(cleaned).toBe('Tăng 20% giá trị khi thế chấp BĐS trung tâm Hà Nội & TP.HCM.');
    });

    it('[TC-155.02/MSS][UC-GAME-023][IMP-155][Facet-1/Boundary] cleanEventDescription giữ nguyên chuỗi không chứa dấu hai chấm', () => {
      const raw = 'Tăng 50% tiền thuê tại các ô BĐS Nghỉ Dưỡng';
      const cleaned = cleanEventDescription(raw);
      expect(cleaned).toBe(raw);
    });

    it('[TC-155.03/MSS][UC-GAME-023][IMP-155][Facet-1/Boundary] cleanEventDescription xử lý an toàn chuỗi rỗng hoặc undefined', () => {
      expect(cleanEventDescription('')).toBe('');
      expect(cleanEventDescription(undefined as unknown as string)).toBe('');
    });

    it('[TC-155.04/MSS][UC-GAME-023][IMP-155][Facet-1/Boundary] formatShortPlayerName rút gọn tên Bot AI loại bỏ phần tính cách trong ngoặc', () => {
      expect(formatShortPlayerName('Bot AI 3 (Aggressive)')).toBe('Bot AI 3');
      expect(formatShortPlayerName('Bot AI 1 (Cautious)')).toBe('Bot AI 1');
      expect(formatShortPlayerName('Bot AI 2 (Balanced)')).toBe('Bot AI 2');
    });

    it('[TC-155.05/MSS][UC-GAME-023][IMP-155][Facet-1/Boundary] formatShortPlayerName bảo tồn tên người chơi thật có dấu ngoặc đơn khác', () => {
      expect(formatShortPlayerName('Đại Gia Sài Gòn (VIP)')).toBe('Đại Gia Sài Gòn (VIP)');
      expect(formatShortPlayerName('Nguyễn Văn A')).toBe('Nguyễn Văn A');
    });
  });

  // =========================================================================
  // Facet 2: State Reactivity & Content Rendering (MilestoneBanner & FloatingBadge)
  // =========================================================================
  describe('Facet 2: State Reactivity & Content Rendering (MilestoneBanner & FloatingBadge)', () => {
    it('[TC-155.06/MSS][UC-GAME-023][IMP-155][Facet-2/Reactivity] MilestoneBanner thẻ Thị Trường loại bỏ tiền tố dài dòng khỏi mô tả hiển thị', () => {
      const item: FloatingTextItem = {
        id: 'ft_test_market',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'market',
        title: 'Phê Duyệt Quy Hoạch Đô Thị Đặc Biệt',
        text: 'Quy hoạch trục đô thị mới: Tăng 20% giá trị khi thế chấp BĐS Hà Nội & TP.HCM.',
        timestamp: Date.now(),
      };

      const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));
      expect(html).toContain('data-testid="event-card-notification-banner"');
      expect(html).toContain('data-testid="milestone-card-title"');
      expect(html).not.toContain('Quy hoạch trục đô thị mới:');
      expect(html).toContain('Tăng 20% giá trị khi thế chấp BĐS Hà Nội &amp; TP.HCM.');
    });

    it('[TC-155.07/MSS][UC-GAME-023][IMP-155][Facet-2/Reactivity] MilestoneBanner hiển thị tên Bot AI rút gọn không bị cắt cụt mid-word', () => {
      const item: FloatingTextItem = {
        id: 'ft_test_bot_name',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'market',
        title: 'Phê Duyệt Quy Hoạch',
        text: 'Tăng 20% giá trị thế chấp',
        timestamp: Date.now(),
      };

      const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));
      expect(html).toContain('Bot AI 3');
      expect(html).not.toContain('Bot AI 3 (Aggressi...');
    });

    it('[TC-155.08/MSS][UC-GAME-023][IMP-155][Facet-2/Reactivity] MilestoneBanner tiêu đề chứa class truncate và min-w-0 để chống tràn lề 360px', () => {
      const item: FloatingTextItem = {
        id: 'ft_test_trunc',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'chance',
        title: 'Thương Vụ Mua Bán Sáp Nhập Doanh Nghiệp M&A Bắt Buộc',
        text: 'Thôn tính BĐS đối thủ',
        timestamp: Date.now(),
      };

      const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));
      const titleMatch = html.match(/<span[^>]*data-testid="milestone-card-title"[^>]*class="([^"]*)"/)?.[1] ?? '';
      expect(titleMatch).toContain('truncate');
      expect(titleMatch).toContain('min-w-0');
    });

    it('[TC-155.09/MSS][UC-GAME-023][IMP-155][Facet-2/Reactivity] FloatingBadge sử dụng formatShortPlayerName cho người chơi hiển thị gọn gàng', () => {
      const item: FloatingTextItem = {
        id: 'ft_badge_rent',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'rent_pay',
        title: 'Tiền thuê Bến Vân Đồn',
        text: '-500 Tr.',
        targetPlayerName: 'Đại Gia Sài Gòn (VIP)',
        timestamp: Date.now(),
      };

      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(html).toContain('Bot AI 3');
      expect(html).not.toContain('Bot AI 3 (Aggressive)');
    });
  });

  // =========================================================================
  // Facet 3: Interaction, Touch & Tap-to-Dismiss (A11y & Disposal)
  // =========================================================================
  describe('Facet 3: Interaction, Touch & Tap-to-Dismiss (A11y & Disposal)', () => {
    it('[TC-155.10/MSS][UC-GAME-023][IMP-155][Facet-3/Disposal] MilestoneBanner kích hoạt pointer-events-auto và cursor-pointer cho phép chạm tắt', () => {
      const item: FloatingTextItem = {
        id: 'ft_tap_test',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'chance',
        title: 'Hoàn Thuế Doanh Nghiệp',
        text: '+1.000 Tr.',
        timestamp: Date.now(),
      };

      const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));
      expect(html).toContain('pointer-events-auto');
      expect(html).toContain('cursor-pointer');
    });

    it('[TC-155.11/MSS][UC-GAME-023][IMP-155][Facet-3/Disposal] MilestoneBanner chứa aria-label và tabIndex={0} cho chuẩn trợ năng WCAG AA', () => {
      const item: FloatingTextItem = {
        id: 'ft_a11y_test',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'market',
        title: 'Mùa Cao Điểm Du Lịch',
        text: 'Nhân đôi phí thuê',
        timestamp: Date.now(),
      };

      const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));
      expect(html).toContain('tabindex="0"');
      expect(html).toMatch(/aria-label="[^"]*đóng/i);
    });

    it('[TC-155.12/MSS][UC-GAME-023][IMP-155][Facet-3/Disposal] MilestoneBanner khi click gọi hàm removeFloatingText trong Zustand store', () => {
      const removeSpy = vi.fn();
      useGameStore.setState({ removeFloatingText: removeSpy });

      const item: FloatingTextItem = {
        id: 'ft_click_dismiss',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'chance',
        title: 'Phiếu Cơ Hội',
        text: '+500 Tr.',
        timestamp: Date.now(),
      };

      let vdom: any;
      function TestWrapper() {
        vdom = MilestoneBanner({ item });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));
      expect(vdom.props.onClick).toBeDefined();
      vdom.props.onClick();
      expect(removeSpy).toHaveBeenCalledWith('ft_click_dismiss');
    });

    it('[TC-155.13/MSS][UC-GAME-023][IMP-155][Facet-3/Disposal] MilestoneBanner khi nhấn phím Enter hoặc Space gọi hàm removeFloatingText', () => {
      const removeSpy = vi.fn();
      useGameStore.setState({ removeFloatingText: removeSpy });

      const item: FloatingTextItem = {
        id: 'ft_key_dismiss',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'chance',
        title: 'Phiếu Cơ Hội',
        text: '+500 Tr.',
        timestamp: Date.now(),
      };

      let vdom: any;
      function TestWrapper() {
        vdom = MilestoneBanner({ item });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));
      expect(vdom.props.onKeyDown).toBeDefined();
      vdom.props.onKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as React.KeyboardEvent);
      expect(removeSpy).toHaveBeenCalledWith('ft_key_dismiss');
    });
  });

  // =========================================================================
  // Facet 4: Layout Budget, Safe Areas & Error Defense
  // =========================================================================
  describe('Facet 4: Layout Budget, Safe Areas & Error Defense', () => {
    it('[TC-155.14/MSS][UC-GAME-023][IMP-155][Facet-4/LayoutBudget] MilestoneBanner mang class max-w-[88vw] hoặc max-w-[380px] thay vì 94vw', () => {
      const item: FloatingTextItem = {
        id: 'ft_width_test',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'market',
        title: 'Kích Hoạt Thị Trường',
        text: 'Nội dung ngắn',
        timestamp: Date.now(),
      };

      const html = renderToStaticMarkup(React.createElement(MilestoneBanner, { item }));
      expect(html).not.toContain('max-w-[94vw]');
      expect(html).toMatch(/max-w-\[(88vw|86vw|90vw|380px|360px)\]/);
    });

    it('[TC-155.15/MSS][UC-GAME-023][IMP-155][Facet-4/LayoutBudget] MarketEventTicker mang class max-w-[90vw] hoặc max-w-md gọn gàng trên mobile', () => {
      const html = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [
            {
              type: MarketCardId.MC_URBAN_PLANNING,
              remainingRounds: 1,
            },
          ],
        })
      );

      expect(html).not.toContain('max-w-[94vw]');
      expect(html).toMatch(/max-w-\[(90vw|88vw|md)\]/);
    });

    it('[TC-155.16/MSS][UC-GAME-023][IMP-155][Facet-4/ErrorDefense] EVENT_BANNER_DURATION_MS bảo toàn đúng 4500ms theo hợp đồng kiểm thử cũ', () => {
      expect(EVENT_BANNER_DURATION_MS).toBe(4500);
    });
  });
});
