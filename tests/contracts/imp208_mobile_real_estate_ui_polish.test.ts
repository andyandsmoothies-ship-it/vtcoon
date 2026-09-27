// [TC-208P.01/MSS..TC-208P.16/MSS][UC-IMP208] Contract Test Suite: Mobile Real Estate UI Polish & Ergonomics Upgrade
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Boundary & Range (TC-208P.01..TC-208P.03)
// Facet 2: Touch Targets & Accessibility (TC-208P.04..TC-208P.06)
// Facet 3: Responsive Truncation & Overflow Defense (TC-208P.07..TC-208P.10)
// Facet 4: Tactile Depth & Feedback (TC-208P.11..TC-208P.12)
// Facet 5: Grid Alignment & Invariant State Transitions (TC-208P.13..TC-208P.16)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { PurchaseDecisionCard } from '../../src/client/ui/modals/purchase_decision_card.js';
import { TitleDeedRentTable } from '../../src/client/ui/modals/title_deed_rent_table.js';
import { PortfolioTabHeader } from '../../src/client/ui/modals/portfolio_tab_header.js';
import { TradePartnerStrip } from '../../src/client/ui/modals/trade/trade_partner_strip.js';
import { TradeModal } from '../../src/client/ui/modals/trade_modal.js';
import { TradeSentimentMeter } from '../../src/client/ui/modals/trade_sentiment_meter.js';
import { TradeColumn } from '../../src/client/ui/modals/trade/trade_column.js';
import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal.js';
import { useGameStore, type PlayerHudInfo } from '../../src/client/store/game_store.js';

describe('[TC-208P.01/MSS..TC-208P.16/MSS][UC-IMP208] Mobile Real Estate UI Polish & Ergonomics Contract', () => {
  beforeEach(() => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      levelMap: { 1: 1, 3: 0 },
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 15000,
          tokenColor: '#ef4444',
          ownedProperties: [1],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: false,
        } as PlayerHudInfo,
        bot_alpha: {
          id: 'bot_alpha',
          name: 'Bot Alpha (Aggressive)',
          balance: 12000,
          tokenColor: '#3b82f6',
          ownedProperties: [3],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: true,
          bankrupt: false,
          inAudit: false,
        } as PlayerHudInfo,
      },
    });
  });

  // =========================================================================
  // FACET 1: Boundary & Range (TC-208P.01 - 03)
  // =========================================================================
  describe('Facet 1: Boundary & Range (Typography Floor >= 11px)', () => {
    it('[TC-208P.01/MSS][UC-IMP208] PurchaseDecisionCard không còn bất kỳ class nào < 11px ở radar badge, cell chips, building level, freeze banner, cash buffer', () => {
      const htmlNormal = renderToStaticMarkup(
        React.createElement(PurchaseDecisionCard, {
          cellIndex: 1,
          deedPrice: 1000,
          buyerBalance: 5000,
          buyerId: 'p1',
          allPlayers: {
            p1: { id: 'p1', name: 'Chủ Tịch Hưng', balance: 5000, ownedProperties: [1], isBot: false },
          },
          levelMap: { 1: 1, 3: 0 },
          isTradeFrozen: false,
        })
      );

      const htmlFrozen = renderToStaticMarkup(
        React.createElement(PurchaseDecisionCard, {
          cellIndex: 1,
          deedPrice: 1000,
          buyerBalance: 5000,
          buyerId: 'p1',
          isTradeFrozen: true,
        })
      );

      expect(htmlNormal).not.toMatch(/text-\[(?:8|8\.5|9|9\.5|10)px\]/);
      expect(htmlFrozen).not.toMatch(/text-\[(?:8|8\.5|9|9\.5|10)px\]/);
      expect(htmlNormal).toContain('text-[11px]');
    });

    it('[TC-208P.02/MSS][UC-IMP208] TitleDeedRentTable nhãn độc quyền x2 ĐỘC QUYỀN và x1.5 ĐỘC QUYỀN đạt text-[11px] font-black', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          isRailroad: false,
          isUtility: false,
          rents: [100, 200, 400, 800],
          upgradeCosts: [500, 500, 500],
          hasMonopoly: true,
          compact: false,
        })
      );

      expect(html).toContain('text-[11px] font-black text-emerald-700 tracking-tight">x2 ĐỘC QUYỀN</span>');
      expect(html).toContain('text-[11px] font-black text-amber-700 tracking-tight">x1.5 ĐỘC QUYỀN</span>');
    });

    it('[TC-208P.03/MSS][UC-IMP208] TitleDeedRentTable các chip phân cấp (1 Ô, 2 Ô, 5G, C0-C3) và nhãn mini-bar đạt text-[11px] font-black hoặc text-[11px] sm:text-xs', () => {
      const htmlUtility = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          isRailroad: false,
          isUtility: true,
          rents: [1000, 2500, 3500],
          upgradeCosts: [],
          compact: false,
        })
      );

      const htmlCompact = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          isRailroad: false,
          isUtility: false,
          rents: [100, 200, 400, 800],
          upgradeCosts: [500, 500, 500],
          compact: true,
        })
      );

      expect(htmlUtility).toContain('text-[11px] font-black px-1.5 py-0.5 rounded border shrink-0 bg-slate-100 text-slate-900 border-slate-300">1 Ô</span>');
      expect(htmlUtility).toContain('text-[11px] font-black px-1.5 py-0.5 rounded border shrink-0 bg-amber-200 text-amber-900 border-amber-400">5G</span>');
      expect(htmlCompact).toContain('text-[11px] sm:text-xs text-slate-500 block font-semibold">C0 (ĐẤT)</span>');
    });
  });

  // =========================================================================
  // FACET 2: Touch Targets & Accessibility (TC-208P.04 - 06)
  // =========================================================================
  describe('Facet 2: Touch Targets & Accessibility (Floor >= 44px & Focus Ring)', () => {
    it('[TC-208P.04/MSS][UC-IMP208] PortfolioTabHeader các tab Bất Động Sản & Trái Phiếu đều có min-h-[44px] và focus-visible:ring-2', () => {
      const html = renderToStaticMarkup(
        React.createElement(PortfolioTabHeader, {
          activeTab: 'properties',
          onTabChange: () => {},
          hasBond: true,
        })
      );

      expect(html).toMatch(/min-h-\[44px\][^>]*>🏢 Bất Động Sản/);
      expect(html).toMatch(/focus-visible:ring-2[^>]*>🏢 Bất Động Sản/);
      expect(html).toMatch(/min-h-\[44px\][^>]*>📜 Trái Phiếu/);
      expect(html).toMatch(/focus-visible:ring-2[^>]*>📜 Trái Phiếu/);
    });

    it('[TC-208P.05/MSS][UC-IMP208] TradePartnerStrip tab chọn đối tác có min-h-[44px] và focus-visible:ring-2', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradePartnerStrip, {
          availablePartners: [
            { id: 'bot_alpha', name: 'Bot Alpha', balance: 12000, isBot: true },
          ],
          selectedPartnerId: 'bot_alpha',
          onSelectPartner: () => {},
        })
      );

      expect(html).toContain('min-h-[44px]');
      expect(html).toContain('focus-visible:ring-2');
      expect(html).toContain('focus-visible:ring-amber-400');
    });

    it('[TC-208P.06/MSS][UC-IMP208] TradeModal segmented tab mobile đạt min-h-[44px] và focus-visible:ring-2', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_alpha',
          myProperties: [1],
          targetProperties: [3],
          myBalance: 10000,
          targetBalance: 10000,
          availablePartners: [
            { id: 'bot_alpha', name: 'Bot Alpha', balance: 10000, isBot: true },
          ],
        })
      );

      expect(html).toContain('data-testid="trade-mobile-segmented-tabs"');
      expect(html).toMatch(/min-h-\[44px\][^>]*focus-visible:ring-2/);
    });
  });

  // =========================================================================
  // FACET 3: Responsive Truncation & Overflow Defense (TC-208P.07 - 10)
  // =========================================================================
  describe('Facet 3: Responsive Truncation & Overflow Defense', () => {
    it('[TC-208P.07/MSS][UC-IMP208] TradeSentimentMeter chứa truncate min-w-0 và min-w-0 flex-1 tại tiêu đề bên trái', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeSentimentMeter, {
          sentiment: { status: 'likely_accept', score: 85, message: 'Rất khả thi', hint: '' },
          partnerName: 'Bot Alpha Vượt Giới Hạn Tên Dài Nhất Màn Hình',
        })
      );

      expect(html).toContain('min-w-0 flex-1');
      expect(html).toMatch(/class="[^"]*truncate min-w-0[^"]*"[^>]*>Tâm Lý Đồng Thuận AI/);
    });

    it('[TC-208P.08/MSS][UC-IMP208] TradeSentimentMeter tiêu đề có thuộc tính title đầy đủ', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeSentimentMeter, {
          sentiment: { status: 'borderline', score: 50, message: 'Cân nhắc', hint: '' },
          partnerName: 'Đối Thủ Siêu Hạng',
        })
      );

      expect(html).toContain('title="Tâm Lý Đồng Thuận AI (Đối Thủ Siêu Hạng)"');
    });

    it('[TC-208P.09/MSS][UC-IMP208] TradeModal tab deal hiển thị dạng súc tích (1 • 5.000 Tr.) khi cả BĐS và tiền mặt > 0, nhưng bảo toàn (2 BĐS) khi tiền mặt = 0', () => {
      const htmlWithCashAndProperty = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_alpha',
          myProperties: [1, 3],
          targetProperties: [5],
          myBalance: 15000,
          targetBalance: 15000,
          initialOffered: [1],
          initialCashOffer: 5000,
          availablePartners: [
            { id: 'bot_alpha', name: 'Bot Alpha', balance: 15000, isBot: true },
          ],
        })
      );

      const htmlPropertiesOnly = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_alpha',
          myProperties: [1, 3],
          targetProperties: [5],
          myBalance: 15000,
          targetBalance: 15000,
          initialOffered: [1, 3],
          initialCashOffer: 0,
          availablePartners: [
            { id: 'bot_alpha', name: 'Bot Alpha', balance: 15000, isBot: true },
          ],
        })
      );

      const htmlCashOnly = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_alpha',
          myProperties: [1, 3],
          targetProperties: [5],
          myBalance: 15000,
          targetBalance: 15000,
          initialOffered: [],
          initialCashOffer: 5000,
          availablePartners: [
            { id: 'bot_alpha', name: 'Bot Alpha', balance: 15000, isBot: true },
          ],
        })
      );

      expect(htmlWithCashAndProperty).toContain('Bạn Đưa (1 • 5.000)');
      expect(htmlWithCashAndProperty).not.toContain('Tr.');
      expect(htmlPropertiesOnly).toContain('Bạn Đưa (2 BĐS)');
      expect(htmlCashOnly).toContain('Bạn Đưa (5.000)');
      expect(htmlCashOnly).not.toContain('Tr.');
    });

    it('[TC-208P.10/MSS][UC-IMP208] TradeModal tab deal có span mang class truncate', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_alpha',
          myProperties: [1],
          targetProperties: [3],
          myBalance: 10000,
          targetBalance: 10000,
          availablePartners: [
            { id: 'bot_alpha', name: 'Bot Alpha', balance: 10000, isBot: true },
          ],
        })
      );

      expect(html).toMatch(/<button[^>]*>\s*<span class="truncate">Bạn Đưa/);
      expect(html).toMatch(/<button[^>]*>\s*<span class="truncate">Đối Tác/);
    });
  });

  // =========================================================================
  // FACET 4: Tactile Depth & Feedback (TC-208P.11 - 12)
  // =========================================================================
  describe('Facet 4: Tactile Depth & Feedback (3D Shadows & Micro-interactions)', () => {
    it('[TC-208P.11/MSS][UC-IMP208] TradeColumn gợi ý giá bán chứa shadow xúc giác shadow-[0_2px_0_0_#fcd34d] và active:translate-y-[2px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Đối Tác',
          isMine: false,
          properties: [3],
          mortgagedProperties: [],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
          offeredCount: 1,
          partnerCanAfford: true,
          price70: 700,
          price100: 1000,
          price120: 1200,
        })
      );

      expect(html).toContain('shadow-[0_2px_0_0_#fcd34d]');
      expect(html).toContain('active:translate-y-[2px]');
    });

    it('[TC-208P.12/MSS][UC-IMP208] TradeColumn gợi ý giá mua chứa shadow xúc giác shadow-[0_2px_0_0_#93c5fd] và active:translate-y-[2px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Bạn Đề Xuất',
          isMine: true,
          properties: [1],
          mortgagedProperties: [],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
          requestedCount: 1,
          myBalance: 10000,
          reqPrice100: 1000,
          reqPrice130: 1300,
          reqPrice150: 1500,
        })
      );

      expect(html).toContain('shadow-[0_2px_0_0_#93c5fd]');
      expect(html).toContain('active:translate-y-[2px]');
    });
  });

  // =========================================================================
  // FACET 5: Grid Alignment & Invariant State Transitions (TC-208P.13 - 16)
  // =========================================================================
  describe('Facet 5: Grid Alignment & Invariant State Transitions', () => {
    it('[TC-208P.13/MSS][UC-IMP208] PropertyPortfolioModal khi có công trình (level > 0), nút Thế Chấp có col-span-2, Hạ Cấp có col-span-1, Sổ Đỏ có col-span-1', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          propertyStates: { 1: { ownerId: 'p1', level: 1, isMortgaged: false } },
          currentBalance: 10000,
          onMortgage: () => {},
          onDowngrade: () => {},
          onSelectDeed: () => {},
        })
      );

      expect(html).toMatch(/data-testid="mortgage-btn-1"[^>]*class="[^"]*col-span-2/);
      expect(html).toMatch(/data-testid="downgrade-btn-1"[^>]*class="[^"]*col-span-1/);
      expect(html).toMatch(/class="[^"]*col-span-1[^"]*"[^>]*>Sổ Đỏ ↗/);
    });

    it('[TC-208P.14/MSS][UC-IMP208] PropertyPortfolioModal khi không có công trình (level === 0), nút Sổ Đỏ mở rộng thành col-span-2', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          propertyStates: { 1: { ownerId: 'p1', level: 0, isMortgaged: false } },
          currentBalance: 10000,
          onMortgage: () => {},
          onDowngrade: () => {},
          onSelectDeed: () => {},
        })
      );

      expect(html).toMatch(/class="[^"]*col-span-2[^"]*"[^>]*>Sổ Đỏ ↗/);
      expect(html).not.toMatch(/class="[^"]*col-span-1[^"]*"[^>]*>Sổ Đỏ ↗/);
    });

    it('[TC-208P.15/MSS][UC-IMP208] PropertyPortfolioModal khi đã thế chấp (isMort === true), nút Giải Chấp có col-span-2', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          propertyStates: { 1: { ownerId: 'p1', level: 0, isMortgaged: true } },
          currentBalance: 10000,
          onRedeem: () => {},
          onSelectDeed: () => {},
        })
      );

      expect(html).toMatch(/data-testid="redeem-btn-1"[^>]*class="[^"]*col-span-2/);
    });

    it('[TC-208P.16/MSS][UC-IMP208] Tất cả các nút hành động trong PropertyPortfolioModal đều đạt min-h-[44px] và container sử dụng grid-cols-2', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          propertyStates: { 1: { ownerId: 'p1', level: 1, isMortgaged: false } },
          currentBalance: 10000,
          onMortgage: () => {},
          onDowngrade: () => {},
          onSelectDeed: () => {},
        })
      );

      expect(html).toContain('grid grid-cols-2 gap-1.5 text-xs');
      expect(html).toMatch(/data-testid="mortgage-btn-1"[^>]*min-h-\[44px\]/);
      expect(html).toMatch(/data-testid="downgrade-btn-1"[^>]*min-h-\[44px\]/);
      expect(html).toMatch(/min-h-\[44px\][^>]*>Sổ Đỏ ↗/);
    });
  });
});
