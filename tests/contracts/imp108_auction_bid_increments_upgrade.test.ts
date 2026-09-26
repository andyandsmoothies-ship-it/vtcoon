// [UC-GAME-022/MSS][BR-GAME-022][IMP-108] Contract Test Suite: Auction Bid Increments Upgrade (100 - 200 - 500 Tr.)
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { calculateAuctionIncrements } from '../../src/client/ui/modals/modal_helpers';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';

describe('[IMP-108] Auction Bid Increments Upgrade (100 - 200 - 500 Tr.) Contract Suite', () => {
  // =========================================================================
  // FACET 1: BOUNDARY, CLAMPING & NUMERIC INTEGRITY
  // =========================================================================
  describe('Facet 1: Boundary & Clamping (calculateAuctionIncrements)', () => {
    it('[TC-108.01/MSS][Facet1-Boundary] Sinh đúng 3 bước giá tăng dần [+100, +200, +500 Tr.] từ mức giá 0', () => {
      expect(calculateAuctionIncrements(0)).toEqual([100, 200, 500]);
    });

    it('[TC-108.02/MSS][Facet1-Boundary] Sinh đúng 3 bước giá [+100, +200, +500 Tr.] từ mức giá 600 Tr.', () => {
      expect(calculateAuctionIncrements(600)).toEqual([700, 800, 1100]);
    });

    it('[TC-108.03/MSS][Facet1-Boundary] Sinh đúng 3 bước giá từ mức giá thực tế 2.400 Tr. (Ảnh người dùng tải lên)', () => {
      expect(calculateAuctionIncrements(2400)).toEqual([2500, 2600, 2900]);
    });

    it('[TC-108.04/MSS][Facet1-Boundary] Giá trị số thực có phần lẻ thập phân (450.8) được làm tròn sàn xuống 450 trước khi tăng bước giá', () => {
      expect(calculateAuctionIncrements(450.8)).toEqual([550, 650, 950]);
    });

    it('[TC-108.05/MSS][Facet1-Adversarial] Giá âm được chuẩn hóa an toàn về 0', () => {
      expect(calculateAuctionIncrements(-500)).toEqual([100, 200, 500]);
    });

    it('[TC-108.06/MSS][Facet1-Adversarial] NaN và Infinity được chuẩn hóa an toàn về 0', () => {
      expect(calculateAuctionIncrements(Number.NaN)).toEqual([100, 200, 500]);
      expect(calculateAuctionIncrements(Number.POSITIVE_INFINITY)).toEqual([100, 200, 500]);
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY & UI BUTTON MARKUP
  // =========================================================================
  describe('Facet 2: State Reactivity & UI Button Markup', () => {
    it('[TC-108.07/MSS][Facet2-Reactivity] AuctionModal kết xuất nút nâng giá +100 Tr.', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 25,
          currentBid: 2400,
          highestBidderId: 'bot4',
          myId: 'p1',
          myBalance: 5000,
          timeRemaining: 10,
        })
      );
      expect(html).toContain('+100');
    });

    it('[TC-108.08/MSS][Facet2-Reactivity] AuctionModal kết xuất nút nâng giá +200', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 25,
          currentBid: 2400,
          highestBidderId: 'bot4',
          myId: 'p1',
          myBalance: 5000,
          timeRemaining: 10,
        })
      );
      expect(html).toContain('+200');
    });

    it('[TC-108.09/MSS][Facet2-Reactivity] AuctionModal kết xuất nút nâng giá +500', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 25,
          currentBid: 2400,
          highestBidderId: 'bot4',
          myId: 'p1',
          myBalance: 5000,
          timeRemaining: 10,
        })
      );
      expect(html).toContain('+500');
    });

    it('[TC-108.10/MSS][Facet2-Reactivity] AuctionModal triệt tiêu hoàn toàn nút cũ +50', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 25,
          currentBid: 2400,
          highestBidderId: 'bot4',
          myId: 'p1',
          myBalance: 5000,
          timeRemaining: 10,
        })
      );
      expect(html).not.toMatch(/>\+50</);
    });

    it('[TC-108.11/MSS][Facet2-Reactivity] Hiển thị chính xác giá thầu kỳ vọng tương ứng với mức giá hiện tại 2.400', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 25,
          currentBid: 2400,
          highestBidderId: 'bot4',
          myId: 'p1',
          myBalance: 5000,
          timeRemaining: 10,
        })
      );
      expect(html).toContain('(2.500)');
      expect(html).toContain('(2.600)');
      expect(html).toContain('(2.900)');
    });
  });

  // =========================================================================
  // FACET 3: AFFORDABILITY, DISABLED STATES & PERMISSIONS
  // =========================================================================
  describe('Facet 3: Affordability & Disabled States', () => {
    it('[TC-108.12/MSS][Facet3-Affordability] Khi ví chỉ đủ cho nấc 1 (2.550 Tr.), nấc 2 và 3 bị vô hiệu hóa', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 25,
          currentBid: 2400,
          highestBidderId: 'bot4',
          myId: 'p1',
          myBalance: 2550,
          timeRemaining: 10,
        })
      );
      // Nút +100 Tr. (2.500 Tr.) khả dụng
      expect(html).toContain('cursor-pointer');
      // Nút +200 Tr. (2.600 Tr.) và +500 Tr. (2.900 Tr.) bị khóa
      expect(html).toContain('cursor-not-allowed opacity-50');
    });

    it('[TC-108.13/MSS][Facet3-Affordability] Khi ví không đủ cho nấc tối thiểu 2.500 Tr. (chỉ có 2.450 Tr.), toàn bộ 3 nút bị khóa', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 25,
          currentBid: 2400,
          highestBidderId: 'bot4',
          myId: 'p1',
          myBalance: 2450,
          timeRemaining: 10,
        })
      );
      expect(html).not.toMatch(/bg-amber-500 hover:bg-amber-400/);
    });

    it('[TC-108.14/MSS][Facet3-Affordability] Khi người chơi đang dẫn đầu (isLeading), ẩn toàn bộ các nút nâng giá', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 25,
          currentBid: 2500,
          highestBidderId: 'p1',
          myId: 'p1',
          myBalance: 5000,
          timeRemaining: 10,
        })
      );
      expect(html).toContain('Bạn đang dẫn đầu mức giá cao nhất!');
      expect(html).not.toContain('+100');
      expect(html).not.toContain('+200');
      expect(html).not.toContain('+500');
    });
  });

  // =========================================================================
  // FACET 4: SYSTEM DEFENSE, ACCESSIBILITY & SSR HYGIENE
  // =========================================================================
  describe('Facet 4: Error Defense & Accessibility', () => {
    it('[TC-108.15/MSS][Facet4-Defense] Bước giá tối thiểu mới (+100) thỏa mãn điều kiện máy chủ Server (>= +50)', () => {
      const [firstIncrement] = calculateAuctionIncrements(2400);
      const serverMinIncrement = 50;
      expect(firstIncrement - 2400).toBeGreaterThanOrEqual(serverMinIncrement);
    });

    it('[TC-108.16/MSS][Facet4-A11y] Vùng live region aria-live chứa thông tin giá thầu hiện tại chuẩn xác', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 25,
          currentBid: 2400,
          highestBidderId: 'bot4',
          bidderName: 'Bot AI 4 (Aggressive)',
          timeRemaining: 5,
        })
      );
      expect(html).toContain('aria-live="polite"');
      expect(html).toContain('Giá thầu cao nhất hiện tại: 2.400');
      expect(html).toContain('người dẫn đầu: Bot AI 4 (Aggressive)');
    });

    it('[TC-108.17/MSS][Facet4-SSR] AuctionModal kết xuất SSR thuần không gây ra crash môi trường Server Headless', () => {
      expect(() => {
        renderToStaticMarkup(
          React.createElement(AuctionModal, {
            cellIndex: 0,
            currentBid: 0,
            highestBidderId: null,
            timeRemaining: 15,
          })
        );
      }).not.toThrow();
    });

    it('[TC-108.18/MSS][Facet4-Design] Các nút nâng giá giữ vững thiết kế xúc giác 3D với đổ bóng dập nổi shadow-[0_4px_0_0_#b45309]', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 25,
          currentBid: 2400,
          highestBidderId: 'bot4',
          myId: 'p1',
          myBalance: 5000,
          timeRemaining: 10,
        })
      );
      expect(html).toContain('shadow-[0_4px_0_0_#b45309]');
    });
  });
});
