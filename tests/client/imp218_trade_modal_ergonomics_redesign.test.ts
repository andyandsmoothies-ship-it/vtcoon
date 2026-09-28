// [TC-218.01/MSS..TC-218.16/MSS][UC-IMP218]
// Contract Test Suite for IMP-218: Trade Modal Ergonomics Redesign
// Enforces Universal 5-Facet Behavioral Matrix & Detroit Style (1-4 asserts/test, zero loops in it(), no static checklist tests)

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TradeColumn } from '../../src/client/ui/modals/trade/trade_column';
import { TradePartnerStrip } from '../../src/client/ui/modals/trade/trade_partner_strip';
import * as TradePartnerStripModule from '../../src/client/ui/modals/trade/trade_partner_strip';

// Helper to access getPartnerGridColsClass even before Station 2 implementation
const getPartnerGridColsClass: ((count: number) => string) | undefined =
  (TradePartnerStripModule as { getPartnerGridColsClass?: (count: number) => string }).getPartnerGridColsClass;

describe('[IMP-218][Trạm 1 RED] Trade Modal Ergonomics Redesign Contract', () => {
  // =========================================================================
  // FACET 1: Boundary & Grid Adaptation (TC-218.01 - TC-218.04)
  // =========================================================================
  describe('Facet 1: Boundary & Grid Adaptation', () => {
    it('[TC-218.01/MSS][UC-IMP218][Facet-1/Boundary] Khi có 1 đối tác, getPartnerGridColsClass trả về grid-cols-1 và dải đối tác dùng grid-cols-1', () => {
      const colsClass = getPartnerGridColsClass ? getPartnerGridColsClass(1) : undefined;
      expect(colsClass).toBe('grid-cols-1');

      const html = renderToStaticMarkup(
        React.createElement(TradePartnerStrip, {
          availablePartners: [{ id: 'bot_1', name: 'Bot Shark', balance: 5000, isBot: true }],
          selectedPartnerId: 'bot_1',
          onSelectPartner: () => {},
        })
      );
      expect(html).toContain('grid-cols-1');
    });

    it('[TC-218.02/MSS][UC-IMP218][Facet-1/Boundary] Khi có 2 đối tác, getPartnerGridColsClass trả về grid-cols-2 và dải đối tác chia đều 2 cột', () => {
      const colsClass = getPartnerGridColsClass ? getPartnerGridColsClass(2) : undefined;
      expect(colsClass).toBe('grid-cols-2');

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
      expect(html).toContain('grid-cols-2');
    });

    it('[TC-218.03/MSS][UC-IMP218][Facet-1/Boundary] Khi có 3 đối tác, getPartnerGridColsClass trả về grid-cols-3 và dải đối tác chia đều 3 cột', () => {
      const colsClass = getPartnerGridColsClass ? getPartnerGridColsClass(3) : undefined;
      expect(colsClass).toBe('grid-cols-3');

      const html = renderToStaticMarkup(
        React.createElement(TradePartnerStrip, {
          availablePartners: [
            { id: 'bot_1', name: 'Bot Shark', balance: 5000, isBot: true },
            { id: 'player_2', name: 'Người Chơi Nam', balance: 3500 },
            { id: 'bot_3', name: 'Bot Thỏ', balance: 4200, isBot: true },
          ],
          selectedPartnerId: 'bot_1',
          onSelectPartner: () => {},
        })
      );
      expect(html).toContain('grid-cols-3');
    });

    it('[TC-218.04/MSS][UC-IMP218][Facet-1/Boundary] Khi có 4 đối tác, getPartnerGridColsClass trả về grid-cols-4 và dải đối tác chia đều 4 cột', () => {
      const colsClass = getPartnerGridColsClass ? getPartnerGridColsClass(4) : undefined;
      expect(colsClass).toBe('grid-cols-4');

      const html = renderToStaticMarkup(
        React.createElement(TradePartnerStrip, {
          availablePartners: [
            { id: 'bot_1', name: 'Bot Shark', balance: 5000, isBot: true },
            { id: 'player_2', name: 'Người Chơi Nam', balance: 3500 },
            { id: 'bot_3', name: 'Bot Thỏ', balance: 4200, isBot: true },
            { id: 'player_4', name: 'Người Chơi Mai', balance: 4800 },
          ],
          selectedPartnerId: 'bot_1',
          onSelectPartner: () => {},
        })
      );
      expect(html).toContain('grid-cols-4');
    });
  });

  // =========================================================================
  // FACET 2: Subtractive Parity & 4 Mốc Định Giá (TC-218.05 - TC-218.08)
  // =========================================================================
  describe('Facet 2: Subtractive Parity & 4 Mốc Định Giá', () => {
    it('[TC-218.05/MSS][UC-IMP218][Facet-2/SubtractiveParity] DOM Mua đất không chứa text 130% và không chứa biến reqPrice130', () => {
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
          requestedCount: 1,
          myBalance: 10000,
          reqPrice100: 1000,
          reqPrice120: 1200,
          reqPrice150: 1500,
          reqPrice200: 2000,
        } as any)
      );

      expect(html).not.toContain('130%');
      expect(html).not.toContain('reqPrice130');
    });

    it('[TC-218.06/MSS][UC-IMP218][Facet-2/PricingGrid] DOM Mua đất hiển thị đúng 4 nút: 100% Gốc, 120% Lãi nhẹ, 150% Hấp dẫn, 200% Ép bán', () => {
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
          requestedCount: 1,
          myBalance: 10000,
          reqPrice100: 1000,
          reqPrice120: 1200,
          reqPrice150: 1500,
          reqPrice200: 2000,
        } as any)
      );

      expect(html).toContain('100% Gốc');
      expect(html).toContain('120% Lãi nhẹ');
      expect(html).toContain('150% Hấp dẫn');
      expect(html).toContain('200% Ép bán');
    });

    it('[TC-218.07/MSS][UC-IMP218][Facet-2/PricingGrid] DOM Bán đất hiển thị đúng 4 nút: 70% Sàn, 100% Gốc, 120% Lãi chuẩn, 150% Thắng lớn', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Đối Tác',
          isMine: false,
          properties: [1],
          mortgagedProperties: [],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
          offeredCount: 1,
          effectiveTargetBalance: 10000,
          price70: 700,
          price100: 1000,
          price120: 1200,
          price150: 1500,
        } as any)
      );

      expect(html).toContain('70% Sàn');
      expect(html).toContain('100% Gốc');
      expect(html).toContain('120% Lãi chuẩn');
      expect(html).toContain('150% Thắng lớn');
    });

    it('[TC-218.08/MSS][UC-IMP218][Facet-2/GridStructure] Cụm nút gợi ý giá mua và bán đều nằm trong container lưới 2 cột grid-cols-2', () => {
      const htmlBuy = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Của Bạn',
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
          reqPrice120: 1200,
          reqPrice150: 1500,
          reqPrice200: 2000,
        } as any)
      );

      const htmlSell = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Đối Tác',
          isMine: false,
          properties: [1],
          mortgagedProperties: [],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
          offeredCount: 1,
          price70: 700,
          price100: 1000,
          price120: 1200,
          price150: 1500,
        } as any)
      );

      expect(htmlBuy).toMatch(/<div[^>]*class="[^"]*grid-cols-2[^"]*"[^>]*>/);
      expect(htmlSell).toMatch(/<div[^>]*class="[^"]*grid-cols-2[^"]*"[^>]*>/);
    });
  });

  // =========================================================================
  // FACET 3: Strategic Synergy Pinning (TC-218.09 - TC-218.11)
  // =========================================================================
  describe('Facet 3: Strategic Synergy Pinning', () => {
    it('[TC-218.09/MSS][UC-IMP218][Facet-3/SynergyPinning] Ô đất tạo synergy được gom vào container có tiêu đề ⭐ CƠ HỘI ĐỘC QUYỀN (WIN-WIN)', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Của Bạn',
          isMine: true,
          properties: [3, 6], // Ô 3 (Cần Thơ) tạo synergy với ô 1 của partner, ô 6 (Bình Dương) không synergy
          mortgagedProperties: [],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
          myProperties: [3, 6],
          targetProperties: [1],
        })
      );

      expect(html).toContain('⭐ CƠ HỘI ĐỘC QUYỀN (WIN-WIN)');
      expect(html).toMatch(/⭐ CƠ HỘI ĐỘC QUYỀN \(WIN-WIN\)[\s\S]*?(?:Cái Răng|Ô #3)/);
    });

    it('[TC-218.10/MSS][UC-IMP218][Facet-3/SynergyPinning] Các ô đất không tạo synergy được render trong container 📁 TÀI SẢN KHÁC (THEO BỘ MÀU)', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Của Bạn',
          isMine: true,
          properties: [3, 6],
          mortgagedProperties: [],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
          myProperties: [3, 6],
          targetProperties: [1],
        })
      );

      expect(html).toContain('📁 TÀI SẢN KHÁC (THEO BỘ MÀU)');
      expect(html).toMatch(/📁 TÀI SẢN KHÁC \(THEO BỘ MÀU\)[\s\S]*?(?:Dĩ An|Bình Dương|Ô #6)/);
    });

    it('[TC-218.11/MSS][UC-IMP218][Facet-3/SynergyPinning] Container ⭐ CƠ HỘI ĐỘC QUYỀN (WIN-WIN) được ghim xuất hiện trước container tài sản khác', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Của Bạn',
          isMine: true,
          properties: [3, 6],
          mortgagedProperties: [],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
          myProperties: [3, 6],
          targetProperties: [1],
        })
      );

      const synergyIdx = html.indexOf('⭐ CƠ HỘI ĐỘC QUYỀN (WIN-WIN)');
      const otherIdx = html.indexOf('📁 TÀI SẢN KHÁC (THEO BỘ MÀU)');
      expect(synergyIdx).toBeGreaterThan(-1);
      expect(otherIdx).toBeGreaterThan(synergyIdx);
    });
  });

  // =========================================================================
  // FACET 4: Sub-Banner Data Source (TC-218.12 - TC-218.13)
  // =========================================================================
  describe('Facet 4: Sub-Banner Data Source', () => {
    it('[TC-218.12/MSS][UC-IMP218][Facet-4/SubBanner] TradePartnerStrip nhận availablePartners có properties [11, 13] hiển thị ⚡ Cần 1 ô Nam Trung Bộ!', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradePartnerStrip, {
          availablePartners: [
            {
              id: 'bot_shark',
              name: 'Bot Shark',
              balance: 5000,
              isBot: true,
              properties: [11, 13],
            } as any,
          ],
          selectedPartnerId: 'bot_shark',
          onSelectPartner: () => {},
        })
      );

      expect(html).toContain('⚡ Cần 1 ô Nam Trung Bộ!');
    });

    it('[TC-218.13/MSS][UC-IMP218][Facet-4/SubBanner] TradePartnerStrip render Sub-Banner ngữ cảnh partner-sub-banner thể hiện nhu cầu và tính cách Bot', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradePartnerStrip, {
          availablePartners: [
            {
              id: 'bot_shark',
              name: 'Bot Shark',
              balance: 5000,
              isBot: true,
              personality: 'Aggressive',
              properties: [11, 13],
            } as any,
            {
              id: 'player_2',
              name: 'Người Chơi Nam',
              balance: 4000,
            } as any,
          ],
          selectedPartnerId: 'bot_shark',
          onSelectPartner: () => {},
        })
      );

      expect(html).toMatch(/data-testid="partner-sub-banner"/);
      expect(html).toContain('Táo bạo');
      expect(html).toContain('⚡ Cần 1 ô Nam Trung Bộ!');
    });
  });

  // =========================================================================
  // FACET 5: Tactile Ergonomics & Accessibility (TC-218.14 - TC-218.16)
  // =========================================================================
  describe('Facet 5: Tactile Ergonomics & Accessibility', () => {
    it('[TC-218.14/MSS][UC-IMP218][Facet-5/TactileErgonomics] Cả 4 nút gợi ý giá mua đều có min-h-[44px], shadow xúc giác shadow-[0_2px_0_0_#93c5fd] và active:translate-y-[2px]', () => {
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
          requestedCount: 1,
          myBalance: 10000,
          reqPrice100: 1000,
          reqPrice120: 1200,
          reqPrice150: 1500,
          reqPrice200: 2000,
        } as any)
      );

      const buttons = html.match(/min-h-\[44px\][^"]*shadow-\[0_2px_0_0_#93c5fd\][^"]*active:translate-y-\[2px\]/g) ?? [];
      expect(buttons.length).toBe(4);
      expect(html).toContain('120% Lãi nhẹ');
      expect(html).toContain('200% Ép bán');
    });

    it('[TC-218.15/MSS][UC-IMP218][Facet-5/TactileErgonomics] Cả 4 nút gợi ý giá bán đều có min-h-[44px], shadow xúc giác shadow-[0_2px_0_0_#fcd34d] và active:translate-y-[2px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeColumn, {
          title: 'Tài Sản Đối Tác',
          isMine: false,
          properties: [1],
          mortgagedProperties: [],
          selectedProperties: [],
          onToggleProperty: () => {},
          cashVal: 0,
          onCashChange: () => {},
          offeredCount: 1,
          effectiveTargetBalance: 10000,
          price70: 700,
          price100: 1000,
          price120: 1200,
          price150: 1500,
        } as any)
      );

      const buttons = html.match(/min-h-\[44px\][^"]*shadow-\[0_2px_0_0_#fcd34d\][^"]*active:translate-y-\[2px\]/g) ?? [];
      expect(buttons.length).toBe(4);
      expect(html).toContain('120% Lãi chuẩn');
      expect(html).toContain('150% Thắng lớn');
    });

    it('[TC-218.16/MSS][UC-IMP218][Facet-5/Accessibility] Nút đối tác trong dải TradePartnerStrip có min-h-[44px], focus-visible:ring-2 và triệt tiêu overflow-x-auto', () => {
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

      expect(html).toContain('min-h-[44px]');
      expect(html).toContain('focus-visible:ring-2');
      expect(html).not.toContain('overflow-x-auto');
    });
  });
});
