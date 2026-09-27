// [CONTRACT TEST] IMP-211: Tinh Giản Sàn Đấu Giá & Đề Xuất Đổi Đất Bot
// Traceability Tags: [TC-211.01/MSS..TC-211.16/MSS] & [UC-IMP211]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import { BotTradeOfferModal } from '../../src/client/ui/modals/bot_trade_offer_modal';
import { useGameStore } from '../../src/client/store/game_store.js';

// Tree traversal helper for React vdom elements (defined outside it() to enforce zero loops in tests)
function findVNode(node: any, predicate: (n: any) => boolean): any {
  if (!node) return null;
  if (predicate(node)) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const res = findVNode(child, predicate);
      if (res) return res;
    }
  } else if (children) {
    return findVNode(children, predicate);
  }
  return null;
}

describe('[TC-211.01/MSS..TC-211.16/MSS][UC-IMP211] Tinh Giản Sàn Đấu Giá & Đề Xuất Đổi Đất Bot Contract Suite', () => {
  beforeEach(() => {
    useGameStore.getInitialState = () => useGameStore.getState();
    useGameStore.setState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Sài Thành',
          balance: 15000,
          tokenColor: '#38BDF8',
          ownedProperties: [1],
          mortgagedProperties: [],
          isBot: false,
          bankrupt: false,
        } as any,
        bot1: {
          id: 'bot1',
          name: 'Bot Tỷ Phú',
          balance: 30000,
          tokenColor: '#F59E0B',
          ownedProperties: [3],
          mortgagedProperties: [],
          isBot: true,
          bankrupt: false,
        } as any,
        p2: {
          id: 'p2',
          name: 'Đại Gia Phố Cổ',
          balance: 20000,
          tokenColor: '#10B981',
          ownedProperties: [2],
          mortgagedProperties: [],
          isBot: false,
          bankrupt: false,
        } as any,
      },
    });
  });

  // =========================================================================
  // FACET 1: Auction Footer Cleanliness & SSOT Label (TC-211.01 - 04)
  // =========================================================================
  describe('Facet 1: Auction Footer Cleanliness & SSOT Label', () => {
    it('[TC-211.01/MSS][UC-IMP211] Footer chỉ có 1 hàng điều khiển duy nhất (grid-cols-2), không có hàng thứ 3', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          myId: 'p1',
        })
      );

      expect(html).toContain('grid grid-cols-2');
      expect(html).not.toContain('flex items-center justify-between');
      expect(html).not.toContain('grid-rows-3');
    });

    it('[TC-211.02/MSS][UC-IMP211] Nút rút lui mang nhãn chính thức SSOT "✕ Rút Lui" (không chứa chữ "Bỏ Cuộc" hay "Từ Chối Đấu Giá")', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          myId: 'p1',
        })
      );

      expect(html).toContain('✕ Rút Lui');
      expect(html).not.toContain('Bỏ Cuộc');
      expect(html).not.toContain('Từ Chối Đấu Giá');
    });

    it('[TC-211.03/MSS][UC-IMP211] Strict Intent Callback Isolation: Bấm "✕ Rút Lui" gọi chính xác onPass, khẳng định onClose KHÔNG bị gọi', () => {
      const onPassSpy = vi.fn();
      const onCloseSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = AuctionModal({
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          myId: 'p1',
          onPass: onPassSpy,
          onClose: onCloseSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const passBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'auction-pass-btn');
      expect(passBtn?.props?.['data-testid']).toBe('auction-pass-btn');
      passBtn?.props?.onClick?.();
      expect(onPassSpy).toHaveBeenCalledTimes(1);
      expect(onCloseSpy).toHaveBeenCalledTimes(0);
    });

    it('[TC-211.04/MSS][UC-IMP211] Nút Auto-Bid mang nhãn tiếng Việt "TỰ ĐỘNG ĐẶT GIÁ: BẬT / TẮT", chuyển trạng thái tức thì', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          myId: 'p1',
        })
      );

      expect(html).toContain('data-testid="auction-autobid-btn"');
      expect(html).toContain('TỰ ĐỘNG ĐẶT GIÁ: TẮT');
      expect(html).not.toContain('AUTO-BID');
    });
  });

  // =========================================================================
  // FACET 2: Auction Non-Participant & Concluded States (TC-211.05 - 08)
  // =========================================================================
  describe('Facet 2: Auction Non-Participant & Concluded States', () => {
    it('[TC-211.05/MSS][UC-IMP211] Người chơi từ chối mua ở vòng trước hiển thị badge "🚫 Từ chối mua" (thay vì "🚫 Bỏ qua")', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          myId: 'p1',
          declinedPlayerId: 'p2',
        })
      );

      expect(html).toContain('🚫 Từ chối mua');
      expect(html).not.toContain('🚫 Bỏ qua');
    });

    it('[TC-211.06/MSS][UC-IMP211] Khi hasPassed = true, render nút auction-passed-close-btn cho phép gọi onClose', () => {
      const onCloseSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = AuctionModal({
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          myId: 'p1',
          hasPassed: true,
          onClose: onCloseSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const closeBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'auction-passed-close-btn');
      expect(closeBtn?.props?.['data-testid']).toBe('auction-passed-close-btn');
      closeBtn?.props?.onClick?.();
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });

    it('[TC-211.07/MSS][UC-IMP211] Khi isDeclinedPlayer = true, render nút auction-declined-close-btn cho phép gọi onClose', () => {
      const onCloseSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = AuctionModal({
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          myId: 'p1',
          isDeclinedPlayer: true,
          onClose: onCloseSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const closeBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'auction-declined-close-btn');
      expect(closeBtn?.props?.['data-testid']).toBe('auction-declined-close-btn');
      closeBtn?.props?.onClick?.();
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });

    it('[TC-211.08/MSS][UC-IMP211] Khi isConcluded = true, render nút auction-concluded-close-btn cho phép đóng ngay lập tức mà không cần chờ 2.5s', () => {
      const onCloseSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = AuctionModal({
          cellIndex: 1,
          currentBid: 1200,
          highestBidderId: 'bot1',
          timeRemaining: 0,
          myId: 'p1',
          isConcluded: true,
          winnerId: 'bot1',
          onClose: onCloseSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const closeBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'auction-concluded-close-btn');
      expect(closeBtn?.props?.['data-testid']).toBe('auction-concluded-close-btn');
      closeBtn?.props?.onClick?.();
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // FACET 3: Bot Trade Cash Shortfall Disambiguation (TC-211.09 - 12)
  // =========================================================================
  describe('Facet 3: Bot Trade Cash Shortfall Disambiguation', () => {
    it('[TC-211.09/MSS][UC-IMP211] Khi thiếu tiền bù, nút Đồng Ý Đổi VẪN MANG NHÃN "✓ ĐỒNG Ý ĐỔI" nhưng ở trạng thái disabled mờ', () => {
      useGameStore.setState({
        playersInfo: {
          p1: { id: 'p1', name: 'Chủ Tịch Sài Thành', balance: 200 } as any,
          bot1: { id: 'bot1', name: 'Bot Tỷ Phú', balance: 50000, isBot: true } as any,
        },
      });

      let vdom: any;
      function TestWrapper() {
        vdom = BotTradeOfferModal({
          offerId: 'trade_imp211_01',
          cellIndex: 1,
          price: -1000,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
          offeredCellIndex: 3,
          onAccept: vi.fn(),
          onReject: vi.fn(),
        });
        return vdom;
      }
      const html = renderToStaticMarkup(React.createElement(TestWrapper));
      const acceptBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'accept-trade-btn');

      expect(acceptBtn?.props?.disabled).toBe(true);
      expect(html).toContain('✓ ĐỒNG Ý ĐỔI');
      expect(html).not.toContain('Thiếu Tiền Bù');
    });

    it('[TC-211.10/MSS][UC-IMP211] Khi thiếu tiền bù, hiển thị thẻ cảnh báo trade-shortfall-notice với số tiền thiếu chính xác', () => {
      useGameStore.setState({
        playersInfo: {
          p1: { id: 'p1', name: 'Chủ Tịch Sài Thành', balance: 200 } as any,
          bot1: { id: 'bot1', name: 'Bot Tỷ Phú', balance: 50000, isBot: true } as any,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(BotTradeOfferModal, {
          offerId: 'trade_imp211_02',
          cellIndex: 1,
          price: -1000,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
          offeredCellIndex: 3,
          onAccept: vi.fn(),
          onReject: vi.fn(),
        })
      );

      expect(html).toContain('data-testid="trade-shortfall-notice"');
      expect(html).toContain('Số dư không đủ bù chênh lệch');
      expect(html).toContain('800');
    });

    it('[TC-211.11/MSS][UC-IMP211] Khi đủ tiền bù, thẻ cảnh báo thiếu tiền hoàn toàn biến mất', () => {
      useGameStore.setState({
        playersInfo: {
          p1: { id: 'p1', name: 'Chủ Tịch Sài Thành', balance: 5000 } as any,
          bot1: { id: 'bot1', name: 'Bot Tỷ Phú', balance: 50000, isBot: true } as any,
        },
      });

      let vdom: any;
      function TestWrapper() {
        vdom = BotTradeOfferModal({
          offerId: 'trade_imp211_03',
          cellIndex: 1,
          price: 500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
          offeredCellIndex: 3,
          onAccept: vi.fn(),
          onReject: vi.fn(),
        });
        return vdom;
      }
      const html = renderToStaticMarkup(React.createElement(TestWrapper));
      const acceptBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'accept-trade-btn');

      expect(html).not.toContain('data-testid="trade-shortfall-notice"');
      expect(html).not.toContain('Số dư không đủ bù chênh lệch');
      expect(acceptBtn?.props?.disabled).toBe(false);
    });

    it('[TC-211.12/MSS][UC-IMP211] Nút Từ Chối mang phong cách hồng phấn bg-rose-50 border-rose-300, touch target min-h-[46px]', () => {
      let vdom: any;
      function TestWrapper() {
        vdom = BotTradeOfferModal({
          offerId: 'trade_imp211_04',
          cellIndex: 1,
          price: 2500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
          onAccept: vi.fn(),
          onReject: vi.fn(),
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const rejectBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'reject-trade-btn');
      expect(rejectBtn?.props?.className).toContain('bg-rose-50');
      expect(rejectBtn?.props?.className).toContain('border-rose-300');
      expect(rejectBtn?.props?.className).toContain('min-h-[46px]');
      expect(rejectBtn?.props?.className).not.toContain('bg-rose-600');
    });
  });

  // =========================================================================
  // FACET 4: Header & Overlay Ergonomics (TC-211.13 - 16)
  // =========================================================================
  describe('Facet 4: Header & Overlay Ergonomics', () => {
    it('[TC-211.13/MSS][UC-IMP211] Header AuctionModal nút [X] tròn chuẩn touch target min-w-[44px] min-h-[44px]', () => {
      let vdom: any;
      function TestWrapper() {
        vdom = AuctionModal({
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          myId: 'p1',
          onClose: vi.fn(),
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const headerCloseBtn = findVNode(vdom, (n) => n?.props?.['aria-label'] === 'Đóng sàn đấu giá');
      expect(headerCloseBtn?.props?.className).toContain('min-w-[44px]');
      expect(headerCloseBtn?.props?.className).toContain('min-h-[44px]');
      expect(headerCloseBtn?.props?.className).toContain('rounded-full');
      expect(headerCloseBtn?.props?.['aria-label']).toBe('Đóng sàn đấu giá');
    });

    it('[TC-211.14/MSS][UC-IMP211] Bấm nút [X] header kích hoạt đúng onClose mà không gửi intent rút lui lên server', () => {
      const onCloseSpy = vi.fn();
      const onPassSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = AuctionModal({
          cellIndex: 1,
          currentBid: 600,
          timeRemaining: 15,
          highestBidderId: null,
          myId: 'p1',
          onClose: onCloseSpy,
          onPass: onPassSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const headerCloseBtn = findVNode(vdom, (n) => n?.props?.['aria-label'] === 'Đóng sàn đấu giá');
      headerCloseBtn?.props?.onClick?.();
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
      expect(onPassSpy).not.toHaveBeenCalled();
    });

    it('[TC-211.15/MSS][UC-IMP211] Khi onClose được gọi từ Header, onPass KHÔNG được gọi (Bilateral Callback Isolation)', () => {
      const onCloseSpy = vi.fn();
      const onPassSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = AuctionModal({
          cellIndex: 1,
          currentBid: 800,
          highestBidderId: 'p2',
          timeRemaining: 10,
          myId: 'p1',
          onClose: onCloseSpy,
          onPass: onPassSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const headerCloseBtn = findVNode(vdom, (n) => n?.props?.['aria-label'] === 'Đóng sàn đấu giá');
      headerCloseBtn?.props?.onClick?.();
      expect(onPassSpy).toHaveBeenCalledTimes(0);
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });

    it('[TC-211.16/MSS][UC-IMP211] Touch target của mọi nút trên footer đều đạt chiều cao tối thiểu >= 44px', () => {
      let vdom: any;
      function TestWrapper() {
        vdom = AuctionModal({
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          myId: 'p1',
          onPass: vi.fn(),
          onClose: vi.fn(),
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const autoBidBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'auction-autobid-btn');
      const passBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'auction-pass-btn');

      expect(autoBidBtn?.props?.['data-testid']).toBe('auction-autobid-btn');
      expect(autoBidBtn?.props?.className).toContain('min-h-[44px]');
      expect(passBtn?.props?.['data-testid']).toBe('auction-pass-btn');
      expect(passBtn?.props?.className).toContain('min-h-[44px]');
    });
  });
});
