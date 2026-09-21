// [TC-IMP159/MSS][UC-IMP159] Station 1 Contract Tests:
// Clean Tactile Auction Redesign: Triệt tiêu lồng thẻ đa tầng, Thống nhất bục đấu giá, Danh sách người tham gia tinh gọn không border, Bảo tồn 100% hợp đồng kiểm thử
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import { AuctionDistrictCard } from '../../src/client/ui/modals/auction_district_card';

// Realistic investor test fixtures adhering to Saigon / Hanoi investor themes
const MOCK_PLAYERS: Record<string, any> = {
  p1: {
    id: 'p1',
    name: 'Đại Gia Sài Gòn',
    tokenColor: '#c0392b',
    avatar: '🦁',
    balance: 5000,
    ownedProperties: [27, 29],
    mortgagedProperties: [],
  },
  p2: {
    id: 'p2',
    name: 'Tỷ Phú Hà Thành',
    tokenColor: '#2980b9',
    avatar: '🦅',
    balance: 6000,
    ownedProperties: [],
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

describe('[UC-IMP159/MSS] Station 1 RED: Clean Tactile Auction Redesign Contract', () => {
  // =========================================================================
  // FACET 1: STRUCTURAL DE-NESTING & WHITESPACE HIERARCHY (KHỬ LỒNG THẺ)
  // =========================================================================
  describe('Facet 1: Structural De-Nesting & Whitespace Hierarchy (Khử lồng thẻ đa tầng)', () => {
    it('[TC-159.01/MSS][UC-IMP159] Root container của AuctionModal bảo tồn nền #FFFBEB và bóng xúc giác shadow-[0_4px_0_0_#b45309] (Hợp đồng imp61)', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
        })
      );
      expect(html).toContain('bg-[#FFFBEB]');
      expect(html).toContain('shadow-[0_4px_0_0_#b45309]');
    });

    it('[TC-159.02/MSS][UC-IMP159] Cánh trái và cánh phải được phân tách bằng khoảng trắng / đường phân cách thanh mảnh border-amber-900/10 hoặc divide-amber-900/10, không dùng các khối hộp con viền đậm lồng nhau', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
        })
      );
      expect(html).toMatch(/border-amber-900\/10|divide-amber-900\/10/);
    });

    it('[TC-159.03/MSS][UC-IMP159] Cánh trái hiển thị Hero Property Header gồm tên BĐS to rõ, subtitle, giá sàn/khởi điểm mà không bị lặp lại tên BĐS trong thẻ radar phân khu bên dưới', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
        })
      );
      expect(html).toContain('data-testid="auction-hero-header"');
      expect(html).toContain('Cần Thơ (Cái Răng)');
      expect(html).toContain('Giá khởi điểm:');
    });

    it('[TC-159.04/MSS][UC-IMP159] AuctionDistrictCard hòa vào bố cục chung không có các hộp phụ lồng nhau dày đặc', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 1,
          currentBid: 600,
          myId: 'p1',
          playersInfo: MOCK_PLAYERS,
        })
      );
      expect(html).toContain('data-testid="auction-district-intelligence"');
      expect(html).not.toContain('border-slate-300');
      expect(html).toMatch(/border-amber-900\/10|bg-transparent|bg-amber-50\/40/);
    });
  });

  // =========================================================================
  // FACET 2: UNIFIED CENTRAL PODIUM CONTRACT (THỐNG NHẤT BỤC ĐẤU GIÁ)
  // =========================================================================
  describe('Facet 2: Unified Central Podium Contract (Thống nhất bục đấu giá)', () => {
    it('[TC-159.05/MSS][UC-IMP159] Bục đấu giá hợp nhất chứa cả GIÁ THẦU HIỆN TẠI, bộ đếm THỜI GIAN CÒN LẠI:, data-testid="flip-counter", và nhãn DẪN ĐẦU: trong cùng 1 khối trực quan đồng nhất', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 1200,
          highestBidderId: 'p2',
          bidderName: 'Tỷ Phú Hà Thành',
          timeRemaining: 10,
        })
      );
      expect(html).toContain('data-testid="auction-unified-podium"');
      expect(html).toContain('GIÁ THẦU HIỆN TẠI');
      expect(html).toContain('THỜI GIAN CÒN LẠI:');
      expect(html).toContain('DẪN ĐẦU:');
    });

    it('[TC-159.06/MSS][UC-IMP159] Bục đấu giá hiển thị Chưa có ai khi highestBidderId === null', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
        })
      );
      expect(html).toContain('data-testid="auction-unified-podium"');
      expect(html).toContain('Chưa có ai');
      expect(html).toContain('DẪN ĐẦU:');
    });

    it('[TC-159.07/MSS][UC-IMP159] Bục đấu giá hiển thị tên người dẫn đầu kèm huy hiệu 👑 khi có highestBidderId', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 1200,
          highestBidderId: 'p2',
          bidderName: 'Tỷ Phú Hà Thành',
          timeRemaining: 10,
        })
      );
      expect(html).toContain('👑');
      expect(html).toContain('Tỷ Phú Hà Thành');
    });

    it('[TC-159.08/MSS][UC-IMP159] data-testid="flip-counter" hiển thị số tiền lớn, sắc nét định dạng ${amount} Tr. bằng font số đậm', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 1500,
          highestBidderId: null,
          timeRemaining: 15,
        })
      );
      expect(html).toContain('data-testid="flip-counter"');
      expect(html).toContain('1.500 Tr.');
      expect(html).toMatch(/font-(mono|black|bold)/);
    });
  });

  // =========================================================================
  // FACET 3: SLEEK PARTICIPANT STRIP & 360PX BUDGET (DANH SÁCH NGƯỜI THAM GIA TINH GỌN)
  // =========================================================================
  describe('Facet 3: Sleek Participant Strip & 360px Budget (Danh sách người tham gia tinh gọn không border)', () => {
    it('[TC-159.09/MSS][UC-IMP159] Header danh sách người tham gia hiển thị ĐẠI GIA THAM GIA và số dư ví của người chơi (Ví của bạn: ...)', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          myBalance: 5000,
        })
      );
      expect(html).toContain('ĐẠI GIA THAM GIA');
      expect(html).toContain('Ví của bạn:');
      expect(html).toContain('5.000 Tr.');
    });

    it('[TC-159.10/MSS][UC-IMP159] Danh sách người chơi hiển thị dạng hàng dọc tối giản không border thô cứng, có class truncate max-w-[120px] và min-w-0 để chống tràn màn hình trên mobile 360px', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          playersInfo: MOCK_PLAYERS,
        })
      );
      expect(html).toContain('max-w-[120px]');
      expect(html).toContain('min-w-0');
      expect(html).not.toContain('max-w-[140px]');
    });

    it('[TC-159.11/MSS][UC-IMP159] Người chơi thật (Bạn) được đánh dấu nổi bật nhận diện rõ ràng', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          myId: 'p1',
          playersInfo: MOCK_PLAYERS,
        })
      );
      expect(html).toMatch(/Đại Gia Sài Gòn.*(\(Bạn\)|<span[^>]*>Bạn<\/span>)/);
    });

    it('[TC-159.12/MSS][UC-IMP159] Người chơi đang dẫn đầu được gắn huy hiệu 👑 Dẫn đầu tinh tế ngay cạnh tên', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: 'p2',
          timeRemaining: 15,
          playersInfo: MOCK_PLAYERS,
        })
      );
      expect(html).toContain('👑 Dẫn đầu');
    });
  });

  // =========================================================================
  // FACET 4: ACTOR INVERSION, FORECLOSURE & CONTRACT DEFENSE
  // =========================================================================
  describe('Facet 4: Actor Inversion, Foreclosure & Contract Defense', () => {
    it('[TC-159.13/MSS][UC-IMP159] Khi người chơi đang dẫn đầu (isLeading = true), 3 nút đặt giá +100, +200, +500 bị ẩn và hiển thị thông báo Bạn đang dẫn đầu mức giá cao nhất!', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 1000,
          highestBidderId: 'p1',
          myId: 'p1',
          timeRemaining: 15,
        })
      );
      expect(html).toContain('Bạn đang dẫn đầu mức giá cao nhất!');
      expect(html).not.toContain('+100 Tr.');
      expect(html).not.toContain('+200 Tr.');
      expect(html).not.toContain('+500 Tr.');
    });

    it('[TC-159.14/MSS][UC-IMP159] Khi là phiên phát mãi cưỡng chế (isForeclosure = true), hiển thị badge data-testid="foreclosure-distressed-badge" và giá gốc gạch ngang (line-through)', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 420,
          highestBidderId: null,
          timeRemaining: 15,
          isForeclosure: true,
        })
      );
      expect(html).toContain('data-testid="foreclosure-distressed-badge"');
      expect(html).toContain('line-through');
      expect(html).toContain('PHÁT MÃI CƯỠNG CHẾ');
    });

    it('[TC-159.15/MSS][UC-IMP159] Khi người chơi là con nợ bị phát mãi tài sản (insolvencyPlayerId === myId), hiển thị thông điệp giải thích cấn trừ nợ và vô hiệu hóa đặt giá', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 420,
          highestBidderId: null,
          timeRemaining: 15,
          isForeclosure: true,
          insolvencyPlayerId: 'p_debtor',
          myId: 'p_debtor',
          isDeclinedPlayer: true,
        })
      );
      expect(html).toContain('cấn trừ nợ xấu');
      expect(html).toContain('Bạn không thể tự đấu giá');
      expect(html).not.toContain('+100 Tr.');
    });

    it('[TC-159.16/MSS][UC-IMP159] Các nút hành động bảo tồn touch target WCAG AA: min-h-[44px] và nút Đóng min-w-[44px] min-h-[44px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          onClose: () => {},
        })
      );
      expect(html).toContain('min-w-[44px] min-h-[44px]');
      expect(html).toContain('min-h-[44px]');
      expect(html).toContain('aria-label="Đóng sàn đấu giá"');
    });

    it('[TC-159.17/MSS][UC-IMP159] Khối bục đấu giá thống nhất không văng lỗi khi thiếu bidderName hay playersInfo rỗng (null dereference defense)', () => {
      expect(() => {
        renderToStaticMarkup(
          React.createElement(AuctionModal, {
            cellIndex: 1,
            currentBid: 600,
            highestBidderId: null,
            timeRemaining: 15,
            playersInfo: {},
          })
        );
      }).not.toThrow();
    });
  });
});
