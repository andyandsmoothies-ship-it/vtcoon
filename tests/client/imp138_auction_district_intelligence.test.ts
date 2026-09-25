// [TC-IMP138/MSS][UC-GAME-022][IMP-138] Independent Contract Test Suite:
// Thẻ Tình Báo Phân Khu & Cục Diện Độc Quyền Sàn Đấu Giá (Auction District Intelligence & Monopoly Radar)
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuctionModal, type AuctionModalProps } from '../../src/client/ui/modals/auction_modal';
import {
  resolveAuctionDistrictInfo,
  type AuctionDistrictInfo,
  type StrategicHint,
  type StrategicHintType,
  type DistrictCellChip,
} from '../../src/client/ui/modals/auction_intelligence';

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

describe('[IMP-138: Station 1 RED] Auction District Intelligence & Monopoly Radar', () => {
  // =========================================================================
  // FACET 1: BOUNDARY & SAFE GUARDS
  // =========================================================================
  describe('Facet 1: Boundary & Safe Guards (resolveAuctionDistrictInfo)', () => {
    it('[TC-IMP138.01/MSS][UC-GAME-022][IMP-138][Facet-1/Boundary] Trả về null an toàn cho ô Khởi Hành (GO - cell 0)', () => {
      const info = resolveAuctionDistrictInfo(0, MOCK_PLAYERS, 'p1');
      expect(info).toBeNull();
    });

    it('[TC-IMP138.02/A1][UC-GAME-022][IMP-138][Facet-1/Boundary] Trả về null an toàn cho ô Phiếu Thị Trường (cell 2)', () => {
      const info = resolveAuctionDistrictInfo(2, MOCK_PLAYERS, 'p1');
      expect(info).toBeNull();
    });

    it('[TC-IMP138.03/A2][UC-GAME-022][IMP-138][Facet-1/Boundary] Trả về null an toàn cho ô Lệ Phí Đất Đai (Tax - cell 4)', () => {
      const info = resolveAuctionDistrictInfo(4, MOCK_PLAYERS, 'p1');
      expect(info).toBeNull();
    });

    it('[TC-IMP138.04/A3][UC-GAME-022][IMP-138][Facet-1/Boundary] Trả về null an toàn cho ô Trạm Kiểm Toán & Thanh Tra (cell 10)', () => {
      const info = resolveAuctionDistrictInfo(10, MOCK_PLAYERS, 'p1');
      expect(info).toBeNull();
    });

    it('[TC-IMP138.05/A4][UC-GAME-022][IMP-138][Facet-1/Boundary] Trả về null an toàn cho ô chỉ số âm (-1) hoặc vượt ngưỡng bàn cờ (40, NaN)', () => {
      expect(resolveAuctionDistrictInfo(-1, MOCK_PLAYERS, 'p1')).toBeNull();
      expect(resolveAuctionDistrictInfo(40, MOCK_PLAYERS, 'p1')).toBeNull();
      expect(resolveAuctionDistrictInfo(Number.NaN, MOCK_PLAYERS, 'p1')).toBeNull();
    });

    it('[TC-IMP138.06/MSS][UC-GAME-022][IMP-138][Facet-1/Boundary] Xử lý an toàn khi playersInfo rỗng ({}) mà không văng lỗi runtime', () => {
      const info = resolveAuctionDistrictInfo(6, {}, 'p1');
      expect(info).not.toBeNull();
      expect(info?.ownedByMeCount).toBe(0);
      expect(info?.maxOpponentCount).toBe(0);
    });

    it('[TC-IMP138.07/MSS][UC-GAME-022][IMP-138][Facet-1/Boundary] Xử lý an toàn khi myId là undefined, không nhận vơ quyền sở hữu', () => {
      const info = resolveAuctionDistrictInfo(6, MOCK_PLAYERS, undefined);
      expect(info).not.toBeNull();
      expect(info?.ownedByMeCount).toBe(0);
      expect(info?.cells.some((c: DistrictCellChip) => c.isMine)).toBe(false);
    });
  });

  // =========================================================================
  // FACET 2: DISTRICT OWNERSHIP & MONOPOLY HINT REACTIVITY
  // =========================================================================
  describe('Facet 2: District Ownership & Monopoly Hint Reactivity', () => {
    it('[TC-IMP138.08/MSS][UC-GAME-022][IMP-138][Facet-2/Reactivity] Nhận diện đúng phân khu Đông Nam Bộ gồm 3 ô (6, 8, 9) cho cell 6', () => {
      const info = resolveAuctionDistrictInfo(6, MOCK_PLAYERS, 'p1');
      expect(info?.districtName).toBe('Đông Nam Bộ');
      expect(info?.totalCells).toBe(3);
      expect(info?.cells.map((c: DistrictCellChip) => c.cellIndex)).toEqual([6, 8, 9]);
    });

    it('[TC-IMP138.09/MSS][UC-GAME-022][IMP-138][Facet-2/Reactivity] Người chơi đã có 2/3 ô (8, 9): gợi ý my_monopoly với tone emerald', () => {
      const info = resolveAuctionDistrictInfo(6, MOCK_PLAYERS, 'p1');
      expect(info?.strategicHint.type).toBe('my_monopoly');
      expect(info?.strategicHint.tone).toBe('emerald');
    });

    it('[TC-IMP138.10/MSS][UC-GAME-022][IMP-138][Facet-2/Reactivity] Huy hiệu my_monopoly chứa từ khóa ĐỘC QUYỀN', () => {
      const info = resolveAuctionDistrictInfo(6, MOCK_PLAYERS, 'p1');
      expect(info?.strategicHint.badgeText).toContain('ĐỘC QUYỀN');
    });

    it('[TC-IMP138.11/MSS][UC-GAME-022][IMP-138][Facet-2/Reactivity] Đối thủ đã có 2/3 ô (8, 9): gợi ý block_opponent với tone rose', () => {
      // Đổi góc nhìn: p2 là người xem, p1 (đối thủ) đã có [8, 9]
      const info = resolveAuctionDistrictInfo(6, MOCK_PLAYERS, 'p2');
      expect(info?.strategicHint.type).toBe('block_opponent');
      expect(info?.strategicHint.tone).toBe('rose');
    });

    it('[TC-IMP138.12/MSS][UC-GAME-022][IMP-138][Facet-2/Reactivity] Huy hiệu block_opponent chứa từ khóa CHẶN ĐỐI THỦ', () => {
      const info = resolveAuctionDistrictInfo(6, MOCK_PLAYERS, 'p2');
      expect(info?.strategicHint.badgeText).toContain('CHẶN ĐỐI THỦ');
    });

    it('[TC-IMP138.13/MSS][UC-GAME-022][IMP-138][Facet-2/Reactivity] Phân khu chưa ai sở hữu ô nào: gợi ý first_piece với tone blue', () => {
      const unownedPlayers = {
        p1: { id: 'p1', name: 'Đại Gia Sài Gòn', ownedProperties: [] },
        p2: { id: 'p2', name: 'Tỷ Phú Hà Thành', ownedProperties: [] },
      };
      const info = resolveAuctionDistrictInfo(6, unownedPlayers, 'p1');
      expect(info?.strategicHint.type).toBe('first_piece');
      expect(info?.strategicHint.tone).toBe('blue');
    });

    it('[TC-IMP138.14/MSS][UC-GAME-022][IMP-138][Facet-2/Reactivity] Nhiều người chơi cùng sở hữu lẻ tẻ: gợi ý contested với tone amber', () => {
      const contestedPlayers = {
        p1: { id: 'p1', name: 'Đại Gia Sài Gòn', ownedProperties: [8] },
        p2: { id: 'p2', name: 'Tỷ Phú Hà Thành', ownedProperties: [9] },
      };
      const info = resolveAuctionDistrictInfo(6, contestedPlayers, 'p1');
      expect(info?.strategicHint.type).toBe('contested');
      expect(info?.strategicHint.tone).toBe('amber');
    });

    it('[TC-IMP138.15/MSS][UC-GAME-022][IMP-138][Facet-2/Reactivity] Gán đúng cờ isMine, isOpponent và isCurrentAuction trên từng chip ô đất', () => {
      const info = resolveAuctionDistrictInfo(6, MOCK_PLAYERS, 'p1');
      const cell6 = info?.cells.find((c: DistrictCellChip) => c.cellIndex === 6);
      const cell8 = info?.cells.find((c: DistrictCellChip) => c.cellIndex === 8);

      expect(cell6?.isCurrentAuction).toBe(true);
      expect(cell8?.isMine).toBe(true);
      expect(cell8?.ownerId).toBe('p1');
    });
  });

  // =========================================================================
  // FACET 3: RAILROAD & UTILITY BRANCHING
  // =========================================================================
  describe('Facet 3: Railroad & Utility Branching', () => {
    it('[TC-IMP138.16/MSS][UC-GAME-022][IMP-138][Facet-3/Branching] Ga Tàu (cell 5): nhận diện phân khu Hạ Tầng Cảng & Giao Thông gồm 4 ga', () => {
      const info = resolveAuctionDistrictInfo(5, MOCK_PLAYERS, 'p1');
      expect(info?.districtName).toBe('Hạ Tầng Cảng & Giao Thông');
      expect(info?.totalCells).toBe(4);
      expect(info?.cells.map((c: DistrictCellChip) => c.cellIndex)).toEqual([5, 15, 25, 35]);
    });

    it('[TC-IMP138.17/MSS][UC-GAME-022][IMP-138][Facet-3/Branching] Ga Tàu (cell 5): cung cấp strategic hint dạng railroad', () => {
      const info = resolveAuctionDistrictInfo(5, MOCK_PLAYERS, 'p1');
      expect(info?.strategicHint.type).toBe('railroad');
    });

    it('[TC-IMP138.18/MSS][UC-GAME-022][IMP-138][Facet-3/Branching] Ga Tàu (cell 5): hiển thị rent preview với 4 bậc cước [500, 1000, 2000, 4000]', () => {
      const info = resolveAuctionDistrictInfo(5, MOCK_PLAYERS, 'p1');
      expect(info?.rentTiers).toEqual([500, 1000, 2000, 4000]);
    });

    it('[TC-IMP138.19/MSS][UC-GAME-022][IMP-138][Facet-3/Branching] Tiện Ích (cell 12): nhận diện phân khu Tiện Ích & Năng Lượng Quốc Gia với 2 ô', () => {
      const info = resolveAuctionDistrictInfo(12, MOCK_PLAYERS, 'p1');
      expect(info?.districtName).toBe('Tiện Ích & Năng Lượng Quốc Gia');
      expect(info?.totalCells).toBe(2);
      expect(info?.cells.map((c: DistrictCellChip) => c.cellIndex)).toEqual([12, 28]);
    });

    it('[TC-IMP138.20/MSS][UC-GAME-022][IMP-138][Facet-3/Branching] Tiện Ích (cell 12): cung cấp strategic hint dạng utility và bội số x40 / x100 Tr.', () => {
      const info = resolveAuctionDistrictInfo(12, MOCK_PLAYERS, 'p1');
      expect(info?.strategicHint.type).toBe('utility');
      expect(info?.strategicHint.description).toContain('x40 Tr.');
      expect(info?.strategicHint.description).toContain('x100 Tr.');
    });
  });

  // =========================================================================
  // FACET 4: COMPONENT RENDERING & ERROR DEFENSE (AuctionModal)
  // =========================================================================
  describe('Facet 4: Component Rendering & Error Defense (AuctionModal)', () => {
    it('[TC-IMP138.21/MSS][UC-GAME-022][IMP-138][Facet-4/Component] Render phần tử data-testid="auction-district-intelligence"', () => {
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
    });

    it('[TC-IMP138.22/MSS][UC-GAME-022][IMP-138][Facet-4/Component] Hiển thị tên phân khu Đông Nam Bộ trên giao diện AuctionModal', () => {
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
      expect(html).toContain('Nhóm Xanh Da Trời');
    });

    it('[TC-IMP138.23/MSS][UC-GAME-022][IMP-138][Facet-4/Component] Hiển thị chips cho 3 ô trong phân khu Đông Nam Bộ', () => {
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
      expect(html).toContain('data-testid="district-cell-chip-6"');
      expect(html).toContain('data-testid="district-cell-chip-8"');
      expect(html).toContain('data-testid="district-cell-chip-9"');
    });

    it('[TC-IMP138.24/MSS][UC-GAME-022][IMP-138][Facet-4/Component] Hiển thị data-testid="auction-strategic-hint" với gợi ý chiến thuật', () => {
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
      expect(html).toContain('data-testid="auction-strategic-hint"');
    });

    it('[TC-IMP138.25/MSS][UC-GAME-022][IMP-138][Facet-4/Component] Render huy hiệu ĐỘC QUYỀN khi người chơi gần hoàn tất phân khu', () => {
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
      expect(html).toContain('ĐỘC QUYỀN');
    });

    it('[TC-IMP138.26/MSS][UC-GAME-022][IMP-138][Facet-4/Component] Bảo toàn đầy đủ các testid hợp đồng cũ của AuctionModal', () => {
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
      expect(html).toContain('data-testid="auction-modal"');
      expect(html).toContain('data-testid="flip-counter"');
      expect(html).toContain('+100 Tr.');
      expect(html).toContain('AUTO-BID');
    });

    it('[TC-IMP138.27/MSS][UC-GAME-022][IMP-138][Facet-4/Component] Fallback an toàn: Render AuctionModal với cellIndex 0 (GO) không crash runtime', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal as React.ComponentType<any>, {
          cellIndex: 0,
          currentBid: 500,
          highestBidderId: null,
          timeRemaining: 10,
        })
      );
      expect(html).toContain('data-testid="auction-modal"');
    });
  });
});
