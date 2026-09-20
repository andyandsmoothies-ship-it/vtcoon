// [TC-IMP140/MSS][UC-IMP140] Contract Test Suite:
// Làm Rõ Thẻ Xăng Dầu MC_FUEL_SURGE & Tinh Giản Sàn Đấu Giá Đa Nền Tảng (Mobile & Desktop)
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuctionDistrictCard } from '../../src/client/ui/modals/auction_district_card';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal';
import { getCardHeroStat } from '../../src/client/ui/modals/event_card_visuals';
import { MARKET_CARD_DETAILS } from '../../src/domain/event_card_metadata';
import { MarketCardId } from '../../src/domain/event_card_types';

// Realistic investor test fixtures adhering to Saigon / Hanoi investor themes
const MOCK_PLAYERS: Record<string, any> = {
  p1: {
    id: 'p1',
    name: 'Đại Gia Sài Gòn',
    tokenColor: '#c0392b',
    avatar: '🦁',
    balance: 5000,
    ownedProperties: [8, 9], // Sở hữu 2/3 ô Đông Nam Bộ (ô 6 đang đấu giá)
    mortgagedProperties: [],
  },
  p2: {
    id: 'p2',
    name: 'Tỷ Phú Hà Thành',
    tokenColor: '#2980b9',
    avatar: '🦅',
    balance: 6000,
    ownedProperties: [11, 13],
    mortgagedProperties: [],
  },
  p3: {
    id: 'p3',
    name: 'Công Tử Bạc Liêu',
    tokenColor: '#27ae60',
    avatar: '🐯',
    balance: 4000,
    ownedProperties: [],
    mortgagedProperties: [],
  },
};

describe('[IMP-140: Station 1 RED] Fuel Surge Clarification & Auction Polish', () => {
  // =========================================================================
  // FACET 1: DYNAMIC RESPONSIVE GRID CLASSES & BOUNDARIES
  // =========================================================================
  describe('Facet 1: Dynamic Responsive Grid Classes', () => {
    it('[TC-IMP140.01/MSS][UC-IMP140][Facet-1/Grid] Nhóm 2 ô (Nâu cell 1, 3) render container lưới có class grid-cols-2 và không có sm:grid-cols-3', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 1,
          currentBid: 500,
          playersInfo: MOCK_PLAYERS,
          myId: 'p1',
        })
      );
      expect(html).toContain('grid-cols-2');
      expect(html).not.toContain('sm:grid-cols-3');
    });

    it('[TC-IMP140.02/MSS][UC-IMP140][Facet-1/Grid] Nhóm 2 ô (Tím cell 37, 39) render container lưới có class grid-cols-2 và không có sm:grid-cols-3', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 37,
          currentBid: 2000,
          playersInfo: MOCK_PLAYERS,
          myId: 'p1',
        })
      );
      expect(html).toContain('grid-cols-2');
      expect(html).not.toContain('sm:grid-cols-3');
    });

    it('[TC-IMP140.03/MSS][UC-IMP140][Facet-1/Grid] Nhóm 2 ô Tiện ích (cell 12 EVN, cell 28 Viễn thông) render container có class grid-cols-2', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 12,
          currentBid: 800,
          playersInfo: MOCK_PLAYERS,
          myId: 'p1',
        })
      );
      expect(html).toContain('grid-cols-2');
      expect(html).not.toContain('sm:grid-cols-3');
    });

    it('[TC-IMP140.04/MSS][UC-IMP140][Facet-1/Grid] Nhóm 3 ô (Đông Nam Bộ cell 6) render container có class grid-cols-3 trên cả Mobile và Desktop', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 6,
          currentBid: 1000,
          playersInfo: MOCK_PLAYERS,
          myId: 'p1',
        })
      );
      expect(html).toContain('grid-cols-3');
      expect(html).not.toContain('sm:grid-cols-3');
      expect(html).not.toMatch(/grid\s+grid-cols-2/);
    });

    it('[TC-IMP140.05/MSS][UC-IMP140][Facet-1/Grid] Nhóm 3 ô (Hà Nội cell 31) render container có class grid-cols-3 đơn nhất không rớt ô', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 31,
          currentBid: 1500,
          playersInfo: MOCK_PLAYERS,
          myId: 'p1',
        })
      );
      expect(html).toContain('grid-cols-3');
      expect(html).not.toContain('sm:grid-cols-3');
    });

    it('[TC-IMP140.06/MSS][UC-IMP140][Facet-1/Grid] Nhóm 4 ô Hạ tầng (Ga/Cảng cell 5) render container có class grid-cols-2 sm:grid-cols-4', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 5,
          currentBid: 1200,
          playersInfo: MOCK_PLAYERS,
          myId: 'p1',
        })
      );
      expect(html).toContain('grid-cols-2');
      expect(html).toContain('sm:grid-cols-4');
    });

    it('[TC-IMP140.07/A1][UC-IMP140][Facet-1/Boundary] Fallback an toàn: cellIndex không hợp lệ hoặc ô không phải bất động sản trả về rỗng không crash', () => {
      const htmlInvalid = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, { cellIndex: -1, currentBid: 500 })
      );
      const htmlGo = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, { cellIndex: 0, currentBid: 500 })
      );
      expect(htmlInvalid).toBe('');
      expect(htmlGo).toBe('');
    });
  });

  // =========================================================================
  // FACET 2: FUEL SURGE SEMANTIC CLARIFICATION (MC_FUEL_SURGE)
  // =========================================================================
  describe('Facet 2: Fuel Surge Semantic Clarification', () => {
    it('[TC-IMP140.08/MSS][UC-IMP140][Facet-2/FuelSurge] Thẻ MC_FUEL_SURGE trong EventCardModal hiển thị Hero Stat -500 Tr. chứ không phải +500 Tr.', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FUEL_SURGE,
          description: 'Biến động giá xăng dầu: Nộp 500 Tr. phụ phí nhiên liệu và phụ thu cước ô hạ tầng.',
        })
      );
      expect(html).toContain('data-testid="event-hero-stat"');
      expect(html).toMatch(/data-testid="event-hero-stat"[\s\S]*?-500\s*Tr\./);
      expect(html).not.toMatch(/data-testid="event-hero-stat"[\s\S]*?\+500\s*Tr\./);
    });

    it('[TC-IMP140.09/MSS][UC-IMP140][Facet-2/FuelSurge] Nhãn Hero Stat của MC_FUEL_SURGE hiển thị PHỤ PHÍ NHIÊN LIỆU hoặc PHÍ NHIÊN LIỆU', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FUEL_SURGE,
          description: 'Biến động giá xăng dầu.',
        })
      );
      expect(html).toMatch(/data-testid="event-hero-stat"[\s\S]*?(?:PHỤ PHÍ NHIÊN LIỆU|PHÍ NHIÊN LIỆU)/i);
      expect(html).not.toMatch(/data-testid="event-hero-stat"[\s\S]*?PHỤ THU CƯỚC/);
    });

    it('[TC-IMP140.10/MSS][UC-IMP140][Facet-2/FuelSurge] Hero Stat của MC_FUEL_SURGE mang variant negative với styling rose/đỏ', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_FUEL_SURGE,
        })
      );
      expect(html).toMatch(/data-testid="event-hero-stat"[^>]*bg-rose-50/);
      expect(html).toMatch(/data-testid="event-hero-stat"[^>]*border-rose-400/);
    });

    it('[TC-IMP140.11/MSS][UC-IMP140][Facet-2/FuelSurge] Hàm getCardHeroStat trả về cấu hình negative và -500 Tr. cho MC_FUEL_SURGE', () => {
      const heroStat = getCardHeroStat(MarketCardId.MC_FUEL_SURGE);
      expect(heroStat.value).toBe('-500 Tr.');
      expect(heroStat.variant).toBe('negative');
      expect(heroStat.label).toMatch(/(?:PHỤ PHÍ NHIÊN LIỆU|PHÍ NHIÊN LIỆU)/i);
    });

    it('[TC-IMP140.12/MSS][UC-IMP140][Facet-2/FuelSurge] Metadata trong event_card_metadata.ts mô tả rõ nộp 500 Tr. phụ phí nhiên liệu và phụ thu cước 2 vòng', () => {
      const metadata = MARKET_CARD_DETAILS[MarketCardId.MC_FUEL_SURGE];
      expect(metadata.effectDetail).toMatch(/500\s*Tr\./);
      expect(metadata.effectDetail).toMatch(/(?:phụ phí nhiên liệu|nhiên liệu)/i);
      expect(metadata.duration).toContain('2 vòng');
    });
  });

  // =========================================================================
  // FACET 3: STREAMLINED AUCTION DISTRICT CARD & HEADER INTEGRATION
  // =========================================================================
  describe('Facet 3: Streamlined Auction District Card & Header Integration', () => {
    it('[TC-IMP140.13/MSS][UC-IMP140][Facet-3/Streamline] AuctionDistrictCard chứa data-testid="auction-strategic-hint" trực tiếp trong Header phân khu', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 6,
          currentBid: 1000,
          playersInfo: MOCK_PLAYERS,
          myId: 'p1',
        })
      );
      expect(html).toContain('data-testid="auction-strategic-hint"');
      const hintIndex = html.indexOf('data-testid="auction-strategic-hint"');
      const chipIndex = html.indexOf('data-testid="district-cell-chip-6"');
      expect(hintIndex).toBeLessThan(chipIndex);
    });

    it('[TC-IMP140.14/MSS][UC-IMP140][Facet-3/Streamline] Loại bỏ hoàn toàn thẻ p mô tả chiến thuật dài dòng chiếm 50px', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 6,
          currentBid: 1000,
          playersInfo: MOCK_PLAYERS,
          myId: 'p1',
        })
      );
      expect(html).not.toContain('Hoàn tất phân khu để kích hoạt x2');
      expect(html).not.toMatch(/<p[^>]*class="[^"]*leading-snug/);
    });

    it('[TC-IMP140.15/MSS][UC-IMP140][Facet-3/Streamline] Header phân khu có flex-wrap và gap-1.5 để chống tràn dòng trên màn hình nhỏ', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 6,
          currentBid: 1000,
          playersInfo: MOCK_PLAYERS,
          myId: 'p1',
        })
      );
      expect(html).toMatch(/class="[^"]*flex[^"]*flex-wrap[^"]*gap-1\.5[^"]*"/);
    });

    it('[TC-IMP140.16/MSS][UC-IMP140][Facet-3/Streamline] Bộ đếm X/N Ô CỦA BẠN có shrink-0 để không bị bóp méo khi thu hẹp màn hình', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 6,
          currentBid: 1000,
          playersInfo: MOCK_PLAYERS,
          myId: 'p1',
        })
      );
      expect(html).toMatch(/class="[^"]*shrink-0[^"]*"[^>]*>[^<]*Ô CỦA BẠN/);
    });

    it('[TC-IMP140.17/MSS][UC-IMP140][Facet-3/Streamline] Huy hiệu chiến lược có max-w-[140px] truncate sm:max-w-none', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 6,
          currentBid: 1000,
          playersInfo: MOCK_PLAYERS,
          myId: 'p1',
        })
      );
      expect(html).toMatch(/class="[^"]*max-w-\[140px\][^"]*truncate[^"]*sm:max-w-none[^"]*"/);
    });
  });

  // =========================================================================
  // FACET 4: PRESERVATION OF EXISTING CONTRACTS & MOBILE TYPOGRAPHY
  // =========================================================================
  describe('Facet 4: Preservation of Existing Contracts & Mobile Typography', () => {
    it('[TC-IMP140.18/MSS][UC-IMP140][Facet-4/Typography] Chip ô đất renderCellChip có min-w-0 chống co vỡ flex container', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 6,
          currentBid: 1000,
          playersInfo: MOCK_PLAYERS,
          myId: 'p1',
        })
      );
      expect(html).toMatch(/data-testid="district-cell-chip-6"[^>]*class="[^"]*min-w-0[^"]*"/);
    });

    it('[TC-IMP140.19/MSS][UC-IMP140][Facet-4/Typography] Chip ô đất renderCellChip sử dụng font chữ responsive text-[10px] sm:text-[11px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 6,
          currentBid: 1000,
          playersInfo: MOCK_PLAYERS,
          myId: 'p1',
        })
      );
      expect(html).toMatch(/data-testid="district-cell-chip-6"[^>]*class="[^"]*text-\[10px\][^"]*sm:text-\[11px\][^"]*"/);
    });

    it('[TC-IMP140.20/MSS][UC-IMP140][Facet-4/Contract] Tương thích ngược: Khi có cơ hội độc quyền, badge text vẫn chứa chuỗi ĐỘC QUYỀN', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 6,
          currentBid: 1000,
          playersInfo: MOCK_PLAYERS,
          myId: 'p1',
        })
      );
      expect(html).toContain('ĐỘC QUYỀN');
    });

    it('[TC-IMP140.21/MSS][UC-IMP140][Facet-4/Contract] Tương thích ngược: AuctionModal hiển thị đầy đủ data-testid="auction-district-intelligence"', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as React.ComponentType<any>, {
          cellIndex: 6,
          currentBid: 1200,
          highestBidderId: 'p2',
          myId: 'p1',
          timeRemaining: 12,
          playersInfo: MOCK_PLAYERS,
        })
      );
      expect(html).toContain('data-testid="auction-district-intelligence"');
      expect(html).toContain('data-testid="auction-strategic-hint"');
      expect(html).toContain('Đông Nam Bộ');
    });
  });
});
