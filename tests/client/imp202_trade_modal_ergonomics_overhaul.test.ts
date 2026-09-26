// [TC-202.01/MSS..TC-202.16/MSS][UC-IMP202]
// Contract Test Suite for IMP-202: Trade Modal Ergonomics Overhaul
// Enforces Universal 5-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it(), no static checklist tests)

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TradeModal } from '../../src/client/ui/modals/trade_modal';
import { TradePartnerStrip } from '../../src/client/ui/modals/trade/trade_partner_strip';
import { TradeColumn } from '../../src/client/ui/modals/trade/trade_column';
import { TradeDealHud } from '../../src/client/ui/modals/trade/trade_deal_hud';

describe('[IMP-202][Trạm 1 RED] Trade Modal Ergonomics Overhaul Contract', () => {
  // =========================================================================
  // FACET 1: Boundary & Range
  // =========================================================================
  describe('Facet 1: Boundary & Range', () => {
    it('[TC-202.01/MSS][UC-IMP202][Facet-1/Boundary] Nhãn Đối tác: trong TradePartnerStrip mang shrink-0 nằm ngoài vùng overflow-x-auto', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradePartnerStrip, {
          availablePartners: [
            { id: 'bot_1', name: 'Bot Shark', balance: 5000, isBot: true },
            { id: 'player_2', name: 'Người Chơi Nam', balance: 3500 },
          ],
          selectedPartnerId: 'bot_1',
          onSelectPartner: () => {},
        })
      );
      expect(html).toContain('Đối tác:');
      expect(html).not.toContain('Chọn đối tác:');
      expect(html).toMatch(/<span[^>]*shrink-0[^>]*>[^<]*Đối tác:[^<]*<\/span>\s*<div[^>]*overflow-x-auto/);
    });

    it('[TC-202.02/MSS][UC-IMP202][Facet-1/Boundary] Thẻ BĐS hiển thị tên tỉnh thành riêng và tên phân khu {subName} có truncate min-w-0', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Của Bạn',
          isMine: true,
          properties: [1], // Cần Thơ (Cái Răng)
          mortgagedProperties: [],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
        })
      );
      expect(html).toContain('Cần Thơ');
      expect(html).toContain('Cái Răng');
      expect(html).not.toContain('>Cần Thơ (Cái Răng)<');
      expect(html).toMatch(/<span[^>]*class="[^"]*(?:truncate|min-w-0)[^"]*"[^>]*>\s*\(?Cái Răng\)?\s*<\/span>/);
    });

    it('[TC-202.03/MSS][UC-IMP202][Facet-1/Boundary] Khay phím tắt tiền mặt có nút Tối đa và Xóa đạt touch target min-h-[44px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Của Bạn',
          isMine: true,
          properties: [1],
          mortgagedProperties: [],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 500,
          onCashChange: () => {},
          maxCash: 5000,
        })
      );
      expect(html).toMatch(/data-testid="cash-stepper-max"[^>]*class="[^"]*min-h-\[44px\]/);
      expect(html).toMatch(/data-testid="cash-stepper-clear"[^>]*class="[^"]*min-h-\[44px\]/);
      expect(html).toContain('Tối đa');
      expect(html).toContain('Xóa');
    });
  });

  // =========================================================================
  // FACET 2: State Reactivity (Empty vs Active)
  // =========================================================================
  describe('Facet 2: State Reactivity (Empty vs Active)', () => {
    it('[TC-202.04/MSS][UC-IMP202][Facet-2/Reactivity] Khi totalDealValue === 0, Cán cân hiển thị thanh trung tính 0 vs 0, không chia 50/50', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_1',
          myProperties: [1],
          targetProperties: [6],
          myBalance: 5000,
          targetBalance: 5000,
          initialOffered: [],
          initialRequested: [],
          initialCashOffer: 0,
          initialCashRequest: 0,
        })
      );
      expect(html).not.toContain('Bạn đưa: 50%');
      expect(html).not.toContain('Đối tác: 50%');
      expect(html).toContain('0 vs 0');
    });

    it('[TC-202.05/MSS][UC-IMP202][Facet-2/Reactivity] Khi totalDealValue === 0, Thước đo AI hiển thị Chờ đề xuất với điểm số 0% và icon ⏳', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_1',
          myProperties: [1],
          targetProperties: [6],
          myBalance: 5000,
          targetBalance: 5000,
          initialOffered: [],
          initialRequested: [],
          initialCashOffer: 0,
          initialCashRequest: 0,
        })
      );
      expect(html).toContain('Chờ đề xuất');
      expect(html).toContain('0%');
      expect(html).toContain('⏳');
    });

    it('[TC-202.06/MSS][UC-IMP202][Facet-2/Reactivity] Khi có tài sản hoặc tiền, Cán cân tính đúng % và AI cập nhật trạng thái đồng thuận', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_2',
          myProperties: [6], // Bình Dương Dĩ An giá gốc 1000 Tr.
          targetProperties: [12], // EVN Điện Lực giá gốc 1500 Tr.
          myBalance: 5000,
          targetBalance: 5000,
          initialOffered: [6],
          initialCashOffer: 2000, // Bạn đưa: 1000 + 2000 = 3000
          initialRequested: [12],  // Đối tác: 1500 + 0 = 1500 -> myPercent = 67%
          initialCashRequest: 0,
        })
      );
      expect(html).toContain('Bạn đưa: 67%');
      expect(html).toContain('Đối tác: 33%');
      expect(html).not.toContain('Chờ đề xuất');
      expect(html).toContain('data-testid="deal-cockpit"');
    });
  });

  // =========================================================================
  // FACET 3: Live Deal Summary on Tabs
  // =========================================================================
  describe('Facet 3: Live Deal Summary on Tabs', () => {
    it('[TC-202.07/MSS][UC-IMP202][Facet-3/LiveSummary] Tab mobile Bạn Đưa hiển thị tóm tắt thông minh (2 BĐS) khi chọn 2 BĐS', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_1',
          myProperties: [1, 3],
          targetProperties: [6],
          myBalance: 5000,
          initialOffered: [1, 3],
          initialCashOffer: 0,
        })
      );
      const tabButtonMatch = html.match(/<button[^>]*>[^<]*Bạn Đưa[\s\S]*?<\/button>/)?.[0] ?? '';
      expect(tabButtonMatch).toContain('2 BĐS');
    });

    it('[TC-202.08/MSS][UC-IMP202][Facet-3/LiveSummary] Tab mobile bao quát cả giao dịch thuần tiền mặt khi offered.length === 0 && cashOffer > 0', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_1',
          myProperties: [1],
          targetProperties: [6],
          myBalance: 5000,
          initialOffered: [],
          initialCashOffer: 500,
        })
      );
      const tabButtonMatch = html.match(/<button[^>]*>[^<]*Bạn Đưa[\s\S]*?<\/button>/)?.[0] ?? '';
      expect(tabButtonMatch).toMatch(/500|500 Tr\./);
    });
  });

  // =========================================================================
  // FACET 4: Impeccable Typography & Cockpit
  // =========================================================================
  describe('Facet 4: Impeccable Typography & Cockpit', () => {
    it('[TC-202.09/MSS][UC-IMP202][Facet-4/Typography] Nhãn trạng thái BĐS đạt sàn chữ >= 11px và loại bỏ text-[9px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Của Bạn',
          isMine: true,
          properties: [1, 3],
          mortgagedProperties: [3],
          selectedProperties: [1],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
        })
      );
      expect(html).toContain('✓ [ĐÃ CHỌN]');
      expect(html).toContain('Thế chấp');
      expect(html).not.toContain('text-[9px]');
      expect(html).toMatch(/text-(?:\[11px\]|\[12px\]|xs)/);
    });

    it('[TC-202.10/MSS][UC-IMP202][Facet-4/Cockpit] TradeDealHud gom AI + Cán cân + Thuế vào một container chung mang data-testid="deal-cockpit"', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeDealHud, {
          isBotPartner: true,
          botSentiment: {
            status: 'likely_accept',
            score: 85,
            message: 'Kèo thơm!',
            multiplier: 1.5,
          },
          effectiveTargetName: 'Bot Shark',
          myTotalValue: 3000,
          partnerTotalValue: 2000,
          myPercent: 60,
          taxAmount: 100,
          netReceived: 0,
          cashRequest: 0,
        })
      );
      expect(html).toContain('data-testid="deal-cockpit"');
      expect(html).toMatch(/data-testid="deal-cockpit"[\s\S]*data-testid="deal-balance-meter"/);
      expect(html).toMatch(/data-testid="deal-cockpit"[\s\S]*Thuế nộp Kho Bạc/);
    });
  });

  // =========================================================================
  // FACET 5: Ergonomics & Anti-Regression
  // =========================================================================
  describe('Facet 5: Ergonomics & Anti-Regression', () => {
    it('[TC-202.11/MSS][UC-IMP202][Facet-5/Ergonomics] Nút Hủy mang viền phẳng nhẹ, không mang shadow 3D nặng shadow-[0_4px_0_0_#64748b]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_2',
          myProperties: [1],
          targetProperties: [6],
          myBalance: 5000,
          onClose: () => {},
        })
      );
      expect(html).toContain('Hủy');
      expect(html).not.toContain('shadow-[0_4px_0_0_#64748b]');
    });

    it('[TC-202.12/MSS][UC-IMP202][Facet-5/Accessibility] Không còn nút ẩn sr-only trùng lặp trong DOM của TradeModal', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_2',
          myProperties: [1],
          targetProperties: [6],
          myBalance: 5000,
        })
      );
      expect(html).not.toMatch(/<button[^>]*class="[^"]*sr-only[^"]*"[^>]*>[^<]*Gửi Đề Xuất Đàm Phán/);
    });

    it('[TC-202.13/MSS][UC-IMP202][Facet-5/Integrity] Cột đối tác nhận đúng prop maxCash={effectiveTargetBalance}', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'player_2',
          targetBalance: 3200,
          myProperties: [1],
          targetProperties: [6],
          myBalance: 4800,
        })
      );
      expect(html).toContain('max="4800"');
      expect(html).toContain('max="3200"');
    });

    it('[TC-202.14/MSS][UC-IMP202][Facet-5/Integrity] Giao dịch Người - Người (Human vs Human) render deal cockpit không bị mảng trắng AI', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeDealHud, {
          isBotPartner: false,
          botSentiment: {
            status: 'likely_reject',
            score: 0,
            message: '',
          },
          effectiveTargetName: 'Người Chơi Nam',
          myTotalValue: 2000,
          partnerTotalValue: 2000,
          myPercent: 50,
          taxAmount: 0,
          netReceived: 0,
          cashRequest: 0,
        })
      );
      expect(html).toContain('data-testid="deal-cockpit"');
      expect(html).toContain('data-testid="deal-balance-meter"');
      expect(html).not.toContain('data-testid="bot-sentiment-meter"');
    });

    it('[TC-202.15/MSS][UC-IMP202][Facet-5/TouchErgonomics] Nút [+100] (data-testid="cash-stepper-increment") đạt chuẩn min-h-[44px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Của Bạn',
          isMine: true,
          properties: [1],
          mortgagedProperties: [],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
          maxCash: 5000,
        })
      );
      expect(html).toMatch(/data-testid="cash-stepper-increment"[^>]*class="[^"]*min-h-\[44px\]/);
      expect(html).toContain('+100');
      expect(html).not.toContain('shadow-[0_2px_0_0_#cbd5e1]');
    });

    it('[TC-202.16/MSS][UC-IMP202][Facet-5/Ergonomics] Stepper phân tầng 2 hàng rõ ràng với khay phím tắt chuyên biệt', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Của Bạn',
          isMine: true,
          properties: [1],
          mortgagedProperties: [],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
          maxCash: 5000,
        })
      );
      expect(html).toContain('data-testid="cash-stepper-shortcuts"');
      expect(html).toMatch(/data-testid="cash-stepper-shortcuts"[\s\S]*data-testid="cash-stepper-increment"/);
    });
  });
});
