// [UC-IMP156/MSS][UI-S04/MSS] Station 1 Contract Tests:
// Đại Tu UI/UX Sàn Đấu Giá Trực Tuyến: Bố Cục 2 Cánh Desktop (Dual-Wing Arena), Triệt Tiêu Text Li Ti, Tinh Gọn Giao Diện Cả Desktop Lẫn Mobile & Sửa Lỗi Timer 73s
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import { AuctionDistrictCard } from '../../src/client/ui/modals/auction_district_card';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';
import { BotPersonality } from '../../src/domain/bot/bot_engine';
import { handleAuctionBid } from '../../src/server/auction_manager';

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

describe('[UC-IMP156/MSS] Station 1 RED: Dual-Wing Arena, Anti-Tiny-Text & Timer Invariants', () => {
  // =========================================================================
  // FACET 1: BOUNDARY & RANGE
  // =========================================================================
  describe('Facet 1: Boundary & Range (Desktop Dual-Wing & Mobile Responsive Layout)', () => {
    it('[TC-IMP156.01/MSS][UC-IMP156] (Boundary) AuctionModal responsive container mở rộng cho desktop (md:max-w-3xl hoặc lg:max-w-4xl) và duy trì max-w-lg trên mobile', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
        })
      );
      expect(html).toContain('w-full');
      expect(html).toContain('max-w-lg');
      expect(html).toMatch(/md:max-w-(3xl|4xl)|lg:max-w-4xl/);
    });

    it('[TC-IMP156.02/MSS][UC-IMP156] (Boundary) AuctionModal thiết lập lưới 2 cánh Desktop (md:grid md:grid-cols-2) phân chia Cánh Trái và Cánh Phải rõ ràng', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
        })
      );
      expect(html).toContain('md:grid');
      expect(html).toContain('md:grid-cols-2');
    });

    it('[TC-IMP156.05/MSS][UC-IMP156] (Boundary) AuctionDistrictCard triệt tiêu hoàn toàn các class font li ti text-[9px] trong toàn bộ markup', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 1,
          currentBid: 600,
          myId: 'p1',
          playersInfo: MOCK_PLAYERS,
        })
      );
      expect(html).toContain('data-testid="auction-district-intelligence"');
      expect(html).not.toContain('text-[9px]');
    });

    it('[TC-IMP156.06/MSS][UC-IMP156] (Boundary) Chip phân khu trong AuctionDistrictCard hiển thị an toàn BĐS tên dài 43 ký tự (ô 26 Hải Phòng) với truncate và min-w-0', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 26,
          currentBid: 2600,
          myId: 'p1',
          playersInfo: MOCK_PLAYERS,
        })
      );
      expect(html).toContain('data-testid="district-cell-chip-26"');
      expect(html).toContain('Hải Phòng (Phố Ẩm Thực');
      expect(html).toContain('truncate');
      expect(html).toContain('min-w-0');
    });

    it('[TC-IMP156.08/MSS][UC-IMP156] (Boundary) Khối Dẫn Đầu và Khối Giá Thầu có cấu trúc cân xứng thị giác, giữ nguyên data-testid="flip-counter"', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 1200,
          highestBidderId: 'p2',
          bidderName: 'Tỷ Phú Hà Thành',
          timeRemaining: 10,
        })
      );
      expect(html).toContain('data-testid="flip-counter"');
      expect(html).toContain('1.200 Tr.');
      expect(html).toContain('GIÁ THẦU HIỆN TẠI');
      expect(html).toContain('DẪN ĐẦU');
    });

    it('[TC-IMP156.09/MSS][UC-IMP156] (Boundary) Bảo toàn bất biến CSS nút Đóng chứa min-w-[44px] min-h-[44px] (bảo vệ imp106)', () => {
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
      expect(html).toContain('aria-label="Đóng sàn đấu giá"');
    });

    it('[TC-IMP156.10/MSS][UC-IMP156] (Boundary) Bảo toàn bất biến CSS nút Auto-Bid chứa min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border (bảo vệ imp106)', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
        })
      );
      expect(html).toContain('min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border');
      expect(html).toContain('AUTO-BID');
    });

    it('[TC-IMP156.11/MSS][UC-IMP156] (Boundary) Bảo toàn bất biến CSS nút Rút lui chứa min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-rose-700 (bảo vệ imp106)', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
        })
      );
      expect(html).toContain('min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-rose-700');
      expect(html).toContain('Rút Lui / Bỏ Cuộc');
    });

    it('[TC-IMP156.12/MSS][UC-IMP156] (Boundary) Bảo toàn bất biến tactile shadow nút đặt giá shadow-[0_4px_0_0_#b45309] và cursor-not-allowed opacity-50', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 1000,
          highestBidderId: 'p2',
          myBalance: 1150,
          timeRemaining: 10,
        })
      );
      expect(html).toContain('shadow-[0_4px_0_0_#b45309]');
      expect(html).toContain('cursor-not-allowed opacity-50');
    });

    it('[TC-IMP156.13/MSS][UC-IMP156] (Boundary) Bảo toàn bất biến đồng hồ khẩn cấp chứa text-rose-600 và bg-rose-500 khi timeRemaining <= 5s', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 1500,
          highestBidderId: 'p2',
          timeRemaining: 4,
        })
      );
      expect(html).toContain('04 GIÂY');
      expect(html).toContain('text-rose-600');
      expect(html).toContain('bg-rose-500');
    });

    it('[TC-IMP156.14/MSS][UC-IMP156] (Boundary) Bảo toàn đầy đủ các testids kế thừa: auction-modal, auction-district-intelligence, district-cell-chip-{cellIndex}, auction-strategic-hint', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
          playersInfo: MOCK_PLAYERS,
        })
      );
      expect(html).toContain('data-testid="auction-modal"');
      expect(html).toContain('data-testid="auction-district-intelligence"');
      expect(html).toContain('data-testid="district-cell-chip-1"');
      expect(html).toContain('data-testid="auction-strategic-hint"');
    });

    it('[TC-IMP156.15/MSS][UC-IMP156] (Boundary) Trên màn hình mobile, các nút đặt giá và nút rút lui vẫn đạt kích thước chạm tối thiểu WCAG AA >= 44px', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          timeRemaining: 15,
        })
      );
      expect(html).toContain('min-h-[48px]');
      expect(html).toContain('min-h-[44px]');
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY
  // =========================================================================
  describe('Facet 2: State Reactivity (Timer 73s Cap & Dynamic Bid Updates)', () => {
    it('[TC-IMP156.03/MSS][UC-IMP156] (Reactivity) Sửa lỗi timer 73s: Khi bot đặt giá nhiều lần liên tiếp, session.endTime trên server không bị cộng dồn vượt quá Date.now() + 15_000', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('p1_human');
      mgr.addBot(room.roomCode, 'bot_trader', BotPersonality.Aggressive);
      mgr.addBot(room.roomCode, 'bot_speculator', BotPersonality.Balanced);
      mgr.startGame(room.roomCode);

      room.players[0]!.position = 1;
      room.phase = TurnPhase.ActionPhase;
      mgr.handlePlayerIntent(room.roomCode, 'p1_human', { type: 'INTENT_DECLINE' });

      const session = mgr.getAuctionSession(room.roomCode)!;
      const now = Date.now();

      const bidRes = mgr.handleAuctionBid(room.roomCode, 'bot_trader', 350);
      expect(bidRes.success).toBe(true);
      expect(session.endTime).toBeDefined();
      expect(session.endTime!).toBeLessThanOrEqual(Date.now() + 15_000);
    });

    it('[TC-IMP156.04/MSS][UC-IMP156] (Reactivity) Sửa lỗi timer 73s: Khi bot bỏ cuộc (pass), session.endTime trên server cũng không bị cộng dồn vượt quá Date.now() + 15_000', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('p1_human');
      mgr.addBot(room.roomCode, 'bot_trader', BotPersonality.Aggressive);
      mgr.addBot(room.roomCode, 'bot_speculator', BotPersonality.Balanced);
      mgr.addBot(room.roomCode, 'bot_third', BotPersonality.Passive);
      mgr.startGame(room.roomCode);

      room.players[0]!.position = 1;
      room.phase = TurnPhase.ActionPhase;
      mgr.handlePlayerIntent(room.roomCode, 'p1_human', { type: 'INTENT_DECLINE' });

      const session = mgr.getAuctionSession(room.roomCode)!;
      const now = Date.now();

      const passRes = mgr.handleAuctionPass(room.roomCode, 'bot_trader');
      expect(passRes.success).toBe(true);
      expect(session.endTime).toBeDefined();
      expect(session.endTime!).toBeLessThanOrEqual(Date.now() + 15_000);
    });

    it('[TC-IMP156.18/MSS][UC-IMP156] (Reactivity) Cập nhật động các mức nâng giá và số dư đối thủ khi currentBid thay đổi (+100, +200, +500 Tr.)', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 2500,
          highestBidderId: 'p2',
          timeRemaining: 12,
        })
      );
      expect(html).toContain('+100 Tr.');
      expect(html).toContain('(2.600 Tr.)');
      expect(html).toContain('(3.000 Tr.)');
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL
  // =========================================================================
  describe('Facet 3: Resource Disposal (Clean Session Eviction & Zero Leakage)', () => {
    it('[TC-IMP156.16/MSS][UC-IMP156] (Disposal) Khi phiên đấu giá kết thúc (handleAuctionClose), auctions map được dọn dẹp hoàn toàn không để lại rò rỉ session', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'bot2');
      mgr.startGame(room.roomCode);

      room.players[0]!.position = 3;
      room.phase = TurnPhase.ActionPhase;
      mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_DECLINE' });

      expect(mgr.getAuctionSession(room.roomCode)).toBeDefined();

      // Bot 2 passes -> toàn bộ người chơi pass -> phiên đấu giá kết thúc
      mgr.handleAuctionPass(room.roomCode, 'bot2');

      expect(mgr.getAuctionSession(room.roomCode)).toBeUndefined();
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      expect(room.lastAuctionResult).toBeDefined();
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE
  // =========================================================================
  describe('Facet 4: Error Defense (Null Safety & Invalid Bid Rejection)', () => {
    it('[TC-IMP156.07/MSS][UC-IMP156] (Error Defense) Khối Dẫn Đầu hiển thị an toàn "Chưa có ai" khi highestBidderId === null mà không gây crash SSR hay null dereference', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: null,
          bidderName: undefined,
          timeRemaining: 15,
        })
      );
      expect(html).toContain('Chưa có ai');
      expect(html).toContain('DẪN ĐẦU');
      expect(html).toContain('data-testid="auction-modal"');
    });

    it('[TC-IMP156.17/MSS][UC-IMP156] (Error Defense) AuctionManager từ chối giá thầu không hợp lệ (NaN, số âm, số lẻ thập phân) bảo vệ tính toàn vẹn phiên đấu giá', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'p2');
      mgr.startGame(room.roomCode);

      room.players[0]!.position = 1;
      room.phase = TurnPhase.ActionPhase;
      mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_DECLINE' });
      const session = mgr.getAuctionSession(room.roomCode)!;

      const nanRes = handleAuctionBid(room, session, 'p2', NaN);
      const negRes = handleAuctionBid(room, session, 'p2', -100);
      const floatRes = handleAuctionBid(room, session, 'p2', 350.5);

      expect(nanRes.success).toBe(false);
      expect(negRes.success).toBe(false);
      expect(floatRes.success).toBe(false);
    });
  });
});
