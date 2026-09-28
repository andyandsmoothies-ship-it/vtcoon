// [TC-215.01/MSS..TC-215.16/MSS][UC-IMP215] Cross-Platform UI/UX & Browser Hardening Contract Tests
// Universal 5-Facet Behavioral Matrix:
// Facet 1: iOS Safari Auto-Zoom Immunity (Input Font-Size >= 16px) (TC-215.01..TC-215.04)
// Facet 2: Dynamic Viewport & Screen Bounds Protection (dvh & Clamping) (TC-215.05..TC-215.08)
// Facet 3: Typography & Multi-Line Clamping Integrity (Zero Truncate Conflicts) (TC-215.09..TC-215.12)
// Facet 4: Mobile Ergonomics & Cross-Browser Scrollbar Preservation (TC-215.13..TC-215.15)
// Facet 5: Specification Evolution & Direct Component Bounds Verification (TC-215.16)

import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { WelcomeHubModal } from '../../src/client/ui/lobby/welcome_hub_modal.js';
import { TradeColumn } from '../../src/client/ui/modals/trade/trade_column.js';
import { MasterplanModal } from '../../src/client/ui/modals/masterplan_modal.js';
import { ActivityFeedSidebar } from '../../src/client/ui/activity_feed_sidebar.js';
import { MarketEventTicker } from '../../src/client/ui/market_event_ticker.js';
import { AuctionDistrictCard } from '../../src/client/ui/modals/auction_district_card.js';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal.js';
import { GameOverModal } from '../../src/client/ui/modals/game_over_modal.js';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal.js';
import { TradeModal } from '../../src/client/ui/modals/trade_modal.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';

describe('[IMP-215] Cross-Platform UI/UX & Browser Hardening Contract Tests', () => {
  afterAll(() => {
    React.useSyncExternalStore = origUseSyncExternalStore;
  });

  beforeEach(() => {
    useLobbyStore.setState({ isJoining: false });
    useActivityStore.setState({ isActivityFeedOpen: true, activityLogs: [] });
    useGameStore.setState({
      activeModifiers: [],
      playersInfo: {
        p1: { id: 'p1', name: 'Người Chơi', balance: 5000, color: '#F59E0B' } as any,
        p2: { id: 'p2', name: 'Đối Thủ', balance: 5000, color: '#3B82F6' } as any,
      },
    });
  });

  // =========================================================================
  // Facet 1: iOS Safari Auto-Zoom Immunity (Input Font-Size >= 16px)
  // =========================================================================
  describe('Facet 1: iOS Safari Auto-Zoom Immunity (Input Font-Size >= 16px)', () => {
    it('[TC-215.01/MSS][UC-IMP215] WelcomeHubModal: Ô nhập mã phòng (placeholder="VTxxxx") chứa class text-base trên thiết bị di động', () => {
      const html = renderToStaticMarkup(React.createElement(WelcomeHubModal));
      const inputMatch = html.match(/<input[^>]*data-testid="join-room-input"[^>]*>/);
      expect(inputMatch?.[0]).toBeDefined();
      expect(inputMatch?.[0]).toContain('text-base');
    });

    it('[TC-215.02/MSS][UC-IMP215] WelcomeHubModal: Ô nhập mã phòng chứa class sm:text-sm để giữ kích thước hài hòa trên Desktop', () => {
      const html = renderToStaticMarkup(React.createElement(WelcomeHubModal));
      const inputMatch = html.match(/<input[^>]*data-testid="join-room-input"[^>]*>/);
      expect(inputMatch?.[0]).toBeDefined();
      expect(inputMatch?.[0]).toContain('sm:text-sm');
    });

    it('[TC-215.03/MSS][UC-IMP215] TradeColumn: Ô nhập số tiền mặt chuyển nhượng chứa class text-base chống auto-zoom trên mobile', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Đề xuất chuyển nhượng',
          isMine: true,
          properties: [],
          mortgagedProperties: [],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
        })
      );
      const inputMatch = html.match(/<input[^>]*type="number"[^>]*>/);
      expect(inputMatch?.[0]).toBeDefined();
      expect(inputMatch?.[0]).toContain('text-base');
    });

    it('[TC-215.04/MSS][UC-IMP215] TradeColumn: Ô nhập số tiền mặt chứa class sm:text-xs để bảo toàn kích thước nhỏ gọn trên Desktop', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Đề xuất chuyển nhượng',
          isMine: true,
          properties: [],
          mortgagedProperties: [],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
        })
      );
      const inputMatch = html.match(/<input[^>]*type="number"[^>]*>/);
      expect(inputMatch?.[0]).toBeDefined();
      expect(inputMatch?.[0]).toContain('sm:text-xs');
    });
  });

  // =========================================================================
  // Facet 2: Dynamic Viewport & Screen Bounds Protection (dvh & Clamping)
  // =========================================================================
  describe('Facet 2: Dynamic Viewport & Screen Bounds Protection (dvh & Clamping)', () => {
    it('[TC-215.05/MSS][UC-IMP215] MasterplanModal: Sử dụng h-[88dvh] và max-h-[92dvh], không chứa 88vh đơn lẻ', () => {
      const html = renderToStaticMarkup(React.createElement(MasterplanModal));
      const modalMatch = html.match(/<div[^>]*data-testid="masterplan-modal"[^>]*>/);
      expect(modalMatch?.[0]).toBeDefined();
      expect(modalMatch?.[0]).toContain('h-[88dvh]');
      expect(modalMatch?.[0]).toContain('max-h-[92dvh]');
      expect(modalMatch?.[0]).not.toContain('88vh');
    });

    it('[TC-215.06/MSS][UC-IMP215] MasterplanModal: Chứa min-h-0 sm:min-h-[480px], khẳng định không còn chứa min-h-[520px] gây tràn đáy di động', () => {
      const html = renderToStaticMarkup(React.createElement(MasterplanModal));
      const modalMatch = html.match(/<div[^>]*data-testid="masterplan-modal"[^>]*>/);
      expect(modalMatch?.[0]).toBeDefined();
      expect(modalMatch?.[0]).toContain('min-h-0 sm:min-h-[480px]');
      expect(modalMatch?.[0]).not.toContain('min-h-[520px]');
    });

    it('[TC-215.07/MSS][UC-IMP215] ActivityFeedSidebar: Chứa class w-[85vw] max-w-xs, đảm bảo chừa tối thiểu 15vw cho backdrop trên mobile 360px', () => {
      const html = renderToStaticMarkup(React.createElement(ActivityFeedSidebar, { isOpen: true }));
      const sidebarMatch = html.match(/<aside[^>]*data-testid="activity-feed-sidebar"[^>]*>/);
      expect(sidebarMatch?.[0]).toBeDefined();
      expect(sidebarMatch?.[0]).toContain('w-[85vw] max-w-xs');
    });

    it('[TC-215.08/MSS][UC-IMP215] ActivityFeedSidebar: Chứa class h-[100dvh], đồng bộ chuẩn xác với thanh địa chỉ động của Safari iOS', () => {
      const html = renderToStaticMarkup(React.createElement(ActivityFeedSidebar, { isOpen: true }));
      const sidebarMatch = html.match(/<aside[^>]*data-testid="activity-feed-sidebar"[^>]*>/);
      expect(sidebarMatch?.[0]).toBeDefined();
      expect(sidebarMatch?.[0]).toContain('h-[100dvh]');
      expect(sidebarMatch?.[0]).not.toMatch(/\bh-full\b/);
    });
  });

  // =========================================================================
  // Facet 3: Typography & Multi-Line Clamping Integrity (Zero Truncate Conflicts)
  // =========================================================================
  describe('Facet 3: Typography & Multi-Line Clamping Integrity (Zero Truncate Conflicts)', () => {
    it('[TC-215.09/MSS][UC-IMP215] MarketEventTicker: Thẻ tóm tắt tác động (market-ticker-effect-summary) KHÔNG còn chứa class truncate', () => {
      const html = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [{ type: 'MC_FREEZE_TRADE', remainingRounds: 2 }],
        })
      );
      const summaryMatch = html.match(/<span[^>]*data-testid="market-ticker-effect-summary"[^>]*>/);
      expect(summaryMatch?.[0]).toBeDefined();
      expect(summaryMatch?.[0]).not.toContain('truncate');
    });

    it('[TC-215.10/MSS][UC-IMP215] MarketEventTicker: Thẻ tóm tắt tác động chứa line-clamp-2 break-words cho phép ngắt 2 dòng tự nhiên', () => {
      const html = renderToStaticMarkup(
        React.createElement(MarketEventTicker, {
          activeModifiers: [{ type: 'MC_FREEZE_TRADE', remainingRounds: 2 }],
        })
      );
      const summaryMatch = html.match(/<span[^>]*data-testid="market-ticker-effect-summary"[^>]*>/);
      expect(summaryMatch?.[0]).toBeDefined();
      expect(summaryMatch?.[0]).toContain('line-clamp-2 break-words');
    });

    it('[TC-215.11/MSS][UC-IMP215] AuctionDistrictCard: Tiêu đề ô đất KHÔNG còn chứa thuộc tính truncate đi kèm với line-clamp-2, chứa break-words', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 1,
          currentBid: 600,
        })
      );
      const titleSpanMatch = html.match(/<span[^>]*title="Cần Thơ \(Cái Răng\)"[^>]*>/);
      expect(titleSpanMatch?.[0]).toBeDefined();
      expect(titleSpanMatch?.[0]).not.toContain('truncate');
      expect(titleSpanMatch?.[0]).toContain('break-words');
    });

    it('[TC-215.12/MSS][UC-IMP215] AuctionModal: Dòng phụ thông tin giá sàn đấu giá chứa line-clamp-1 sm:whitespace-nowrap, không bị ép cứng truncate whitespace-nowrap', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          startingBid: 420,
          highestBidderId: null,
          timeRemaining: 15,
        })
      );
      const subPriceMatch = html.match(/<p[^>]*class="[^"]*text-slate-600[^"]*"[^>]*>/);
      expect(subPriceMatch?.[0]).toBeDefined();
      expect(subPriceMatch?.[0]).toContain('line-clamp-1 sm:whitespace-nowrap');
      expect(subPriceMatch?.[0]).not.toContain('truncate whitespace-nowrap');
    });
  });

  // =========================================================================
  // Facet 4: Mobile Ergonomics & Cross-Browser Scrollbar Preservation
  // =========================================================================
  describe('Facet 4: Mobile Ergonomics & Cross-Browser Scrollbar Preservation', () => {
    it('[TC-215.13/MSS][UC-IMP215] GameOverModal: Chứa padding đáp ứng p-3.5 sm:p-6, giải phóng thêm 20px không gian trên mobile 360px', () => {
      const html = renderToStaticMarkup(React.createElement(GameOverModal, { onClose: () => {} }));
      const modalMatch = html.match(/<div[^>]*data-testid="game-over-modal"[^>]*>/);
      expect(modalMatch?.[0]).toBeDefined();
      expect(modalMatch?.[0]).toContain('p-3.5 sm:p-6');
      expect(modalMatch?.[0]).not.toMatch(/\bp-6\b(?!\s*text)/);
    });

    it('[TC-215.14/MSS][UC-IMP215] TitleDeedModal: Vùng nội dung cuộn (title-deed-modal) bảo toàn trọn vẹn bộ 4 utility class khử thanh cuộn đa trình duyệt: scrollbar-none, [scrollbar-width:none], [-ms-overflow-style:none], và [&::-webkit-scrollbar]:hidden', () => {
      const html = renderToStaticMarkup(React.createElement(TitleDeedModal, { cellIndex: 1, onClose: () => {} }));
      const normalizedHtml = html.replace(/&amp;/g, '&');
      const scrollMatch = normalizedHtml.match(/<div[^>]*class="[^"]*scrollbar-none[^"]*"[^>]*>/);
      expect(scrollMatch?.[0]).toBeDefined();
      expect(scrollMatch?.[0]).toContain('[scrollbar-width:none]');
      expect(scrollMatch?.[0]).toContain('[-ms-overflow-style:none]');
      expect(scrollMatch?.[0]).toContain('[&::-webkit-scrollbar]:hidden');
    });

    it('[TC-215.15/MSS][UC-IMP215] GameOverModal: Toàn bộ các nút tab chuyển đổi (Bảng Xếp Hạng, Báo Cáo FinTech, Tài Sản & Danh Mục) đều đạt touch target tối thiểu min-h-[44px] trong vùng đệm co giãn p-3.5 sm:p-6', () => {
      const html = renderToStaticMarkup(React.createElement(GameOverModal, { onClose: () => {} }));
      const modalMatch = html.match(/<div[^>]*data-testid="game-over-modal"[^>]*>/);
      expect(modalMatch?.[0]).toContain('p-3.5 sm:p-6');
      const leaderboardBtn = html.match(/<button[^>]*>B\u1ea3ng X\u1ebfp H\u1ea1ng<\/button>/);
      const fintechBtn = html.match(/<button[^>]*>B\u00e1o C\u00e1o FinTech<\/button>/);
      const portfolioBtn = html.match(/<button[^>]*>(?:Danh M\u1ee5c S\u1ed5 \u0110\u1ecf|T\u00e0i S\u1ea3n &amp; Danh M\u1ee5c)<\/button>/);
      expect(leaderboardBtn?.[0]).toContain('min-h-[44px]');
      expect(fintechBtn?.[0]).toContain('min-h-[44px]');
      expect(portfolioBtn?.[0]).toContain('min-h-[44px]');
    });
  });

  // =========================================================================
  // Facet 5: Specification Evolution & Direct Component Bounds Verification
  // =========================================================================
  describe('Facet 5: Specification Evolution & Direct Component Bounds Verification', () => {
    it('[TC-215.16/MSS][UC-IMP215] TradeModal: Render HTML trực tiếp chứa class kích thước mở rộng đáp ứng max-w-md md:max-w-2xl lg:max-w-4xl', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          myProperties: [1],
          targetProperties: [3],
          myBalance: 5000,
          onClose: () => {},
        })
      );
      const modalMatch = html.match(/<div[^>]*data-testid="trade-modal"[^>]*>/);
      expect(modalMatch?.[0]).toBeDefined();
      expect(modalMatch?.[0]).toContain('max-w-md md:max-w-2xl lg:max-w-4xl');
    });
  });
});
