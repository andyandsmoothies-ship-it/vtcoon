// [TC-IMP149/MSS][UC-GAME-028][IMP-149] Independent Contract Test Suite:
// Hoàn Thiện Nhận Diện Đấu Giá Phát Mãi Cưỡng Chế 70% (Foreclosure Auction UI & Distressed Asset Radar)
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import { ModalHost } from '../../src/client/ui/modals/modal_host';
import { useGameStore } from '../../src/client/store/game_store';
import { buildDeltaFromRoom } from '../../src/server/session_manager';
import { TurnPhase, type Room } from '../../src/domain/room';
import type { AuctionSession } from '../../src/server/auction_manager';
import { AuctionDistrictCard } from '../../src/client/ui/modals/auction_district_card';
import { liquidateAssets } from '../../src/server/insolvency_manager';
import { executeTurnEnd } from '../../src/server/turn_loop';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../../src/domain/property_manager';

describe('[IMP-149: Station 1 RED] Foreclosure Auction UI & Distressed Asset Radar Contract', () => {
  beforeEach(() => {
    // Tránh rò rỉ state giữa các test case
    useGameStore.setState({
      activeModal: null,
      modalPayload: null,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Gòn',
          tokenColor: '#c0392b',
          avatar: '🦁',
          balance: 5000,
          ownedProperties: [],
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
      },
      levelMap: {},
    });
  });

  // =========================================================================
  // FACET 1: SERVER DELTA & SESSION INVARIANTS
  // =========================================================================
  describe('Facet 1: Server Delta & Session Invariants (buildDeltaFromRoom)', () => {
    it('[TC-149.01/MSS][UC-GAME-028][IMP-149][Facet-1/ServerDelta] buildDeltaFromRoom đưa isForeclosure: true và insolvencyPlayerId vào delta.auction khi session.insolvencyPlayerId tồn tại', () => {
      const room: Room = {
        roomCode: 'FC01',
        phase: TurnPhase.AuctionPhase,
        started: true,
        players: [
          { id: 'p_debtor', position: 1, balance: -300 },
          { id: 'p_bidder', position: 1, balance: 5000 },
        ],
        currentPlayerIndex: 0,
      } as unknown as Room;

      const auctions = new Map<string, AuctionSession>();
      auctions.set('FC01', {
        cellIndex: 1,
        declinedPlayerId: 'p_debtor',
        highestBid: 700,
        highestBidder: 'p_bidder',
        passedPlayers: new Set<string>(),
        insolvencyPlayerId: 'p_debtor',
        endTime: Date.now() + 15_000,
      });

      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1, auctions);

      expect((delta.auction as any)?.isForeclosure).toBe(true);
      expect((delta.auction as any)?.insolvencyPlayerId).toBe('p_debtor');
    });

    it('[TC-149.02/MSS][UC-GAME-028][IMP-149][Facet-1/ServerDelta] buildDeltaFromRoom KHÔNG đặt isForeclosure khi session.insolvencyPlayerId undefined (đấu giá thường)', () => {
      const room: Room = {
        roomCode: 'NORM01',
        phase: TurnPhase.AuctionPhase,
        started: true,
        players: [
          { id: 'p1', position: 1, balance: 5000 },
          { id: 'p2', position: 1, balance: 6000 },
        ],
        currentPlayerIndex: 0,
      } as unknown as Room;

      const auctions = new Map<string, AuctionSession>();
      auctions.set('NORM01', {
        cellIndex: 1,
        declinedPlayerId: 'p1',
        highestBid: 500,
        passedPlayers: new Set<string>(),
        endTime: Date.now() + 15_000,
      });

      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1, auctions);

      expect((delta.auction as any)?.isForeclosure).toBeFalsy();
      expect((delta.auction as any)?.insolvencyPlayerId).toBeUndefined();
    });

    it('[TC-149.03/MSS][UC-GAME-028][IMP-149][Facet-1/ServerDelta] buildDeltaFromRoom trả về isForeclosure kiểu boolean hợp lệ khi có insolvencyPlayerId', () => {
      const room: Room = {
        roomCode: 'FC02',
        phase: TurnPhase.AuctionPhase,
        started: true,
        players: [
          { id: 'p_debtor', position: 39, balance: -1000 },
          { id: 'p_bidder', position: 39, balance: 8000 },
        ],
        currentPlayerIndex: 0,
      } as unknown as Room;

      const auctions = new Map<string, AuctionSession>();
      auctions.set('FC02', {
        cellIndex: 39,
        declinedPlayerId: 'p_debtor',
        highestBid: 2800,
        passedPlayers: new Set<string>(),
        insolvencyPlayerId: 'p_debtor',
        endTime: Date.now() + 15_000,
      });

      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1, auctions);

      expect(typeof (delta.auction as any)?.isForeclosure).toBe('boolean');
      expect((delta.auction as any)?.isForeclosure).toBe(true);
    });

    it('[TC-149.04/MSS][UC-GAME-028][IMP-149][Facet-1/ServerDelta] buildDeltaFromRoom giữ nguyên các trường auction chuẩn (currentBid, cellIndex, timeRemaining) khi có isForeclosure', () => {
      const room: Room = {
        roomCode: 'FC03',
        phase: TurnPhase.AuctionPhase,
        started: true,
        players: [
          { id: 'p_debtor', position: 1, balance: -200 },
          { id: 'p_bidder', position: 1, balance: 5000 },
        ],
        currentPlayerIndex: 0,
      } as unknown as Room;

      const auctions = new Map<string, AuctionSession>();
      auctions.set('FC03', {
        cellIndex: 1,
        declinedPlayerId: 'p_debtor',
        highestBid: 700,
        highestBidder: 'p_bidder',
        passedPlayers: new Set<string>(),
        insolvencyPlayerId: 'p_debtor',
        endTime: Date.now() + 12_000,
      });

      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1, auctions);

      expect(delta.auction?.cellIndex).toBe(1);
      expect(delta.auction?.currentBid).toBe(700);
      expect(delta.auction?.highestBidderId).toBe('p_bidder');
      expect(delta.auction?.timeRemaining).toBeGreaterThanOrEqual(10);
    });
  });

  // =========================================================================
  // FACET 2: UI FORECLOSURE BADGE & DISCOUNT DISPLAY
  // =========================================================================
  describe('Facet 2: UI Foreclosure Badge & Discount Display (AuctionModal)', () => {
    it('[TC-149.05/MSS][UC-GAME-028][IMP-149][Facet-2/UIBadge] AuctionModal khi isForeclosure = true render nhãn PHÁT MÃI CƯỠNG CHẾ (-30%)', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 700,
          highestBidderId: null,
          timeRemaining: 15,
          isForeclosure: true,
        } as any)
      );

      expect(html).toContain('PHÁT MÃI CƯỠNG CHẾ (-30%)');
    });

    it('[TC-149.06/MSS][UC-GAME-028][IMP-149][Facet-2/UIBadge] AuctionModal khi isForeclosure = true có class styling cảnh báo bg-rose-100 hoặc border-rose-400 và animate-pulse', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 700,
          highestBidderId: null,
          timeRemaining: 15,
          isForeclosure: true,
        } as any)
      );

      expect(html).toMatch(/bg-rose-100|border-rose-400/);
      expect(html).toContain('animate-pulse');
    });

    it('[TC-149.07/MSS][UC-GAME-028][IMP-149][Facet-2/UIBadge] AuctionModal khi isForeclosure = true render banner cảnh báo TÀI SẢN PHÁT MẠI THANH LÝ NỢ', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 700,
          highestBidderId: null,
          timeRemaining: 15,
          isForeclosure: true,
        } as any)
      );

      expect(html).toContain('TÀI SẢN PHÁT MẠI THANH LÝ NỢ');
    });

    it('[TC-149.08/MSS][UC-GAME-028][IMP-149][Facet-2/UIBadge] AuctionModal khi isForeclosure = true hiển thị giá gốc bị gạch ngang (line-through)', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 700,
          highestBidderId: null,
          timeRemaining: 15,
          isForeclosure: true,
        } as any)
      );

      expect(html).toContain('line-through');
    });

    it('[TC-149.09/MSS][UC-GAME-028][IMP-149][Facet-2/UIBadge] AuctionModal khi isForeclosure = true hiển thị giá sàn phát mãi chiết khấu 30% ((-30%))', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 700,
          highestBidderId: null,
          timeRemaining: 15,
          isForeclosure: true,
        } as any)
      );

      expect(html).toContain('(-30%)');
    });

    it('[TC-149.10/MSS][UC-GAME-028][IMP-149][Facet-2/UIBadge] AuctionModal khi isForeclosure = false hoặc undefined không chứa nhãn phát mãi cưỡng chế và không chứa line-through', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 500,
          highestBidderId: null,
          timeRemaining: 15,
          isForeclosure: false,
        } as any)
      );

      expect(html).not.toContain('PHÁT MÃI CƯỠNG CHẾ');
      expect(html).not.toContain('line-through');
    });
  });

  // =========================================================================
  // FACET 3: CONCLUSION & WINNER FEEDBACK
  // =========================================================================
  describe('Facet 3: Conclusion & Winner Feedback (AuctionModal)', () => {
    it('[TC-149.11/MSS][UC-GAME-028][IMP-149][Facet-3/Conclusion] AuctionModal khi isConcluded = true và isForeclosure = true hiển thị thông điệp đã trúng đấu giá giải cứu', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 700,
          highestBidderId: 'p2',
          bidderName: 'Tỷ Phú Hà Thành',
          timeRemaining: 0,
          isConcluded: true,
          isForeclosure: true,
          finalPrice: 750,
        } as any)
      );

      expect(html).toContain('đã trúng đấu giá giải cứu');
    });

    it('[TC-149.12/MSS][UC-GAME-028][IMP-149][Facet-3/Conclusion] AuctionModal khi isConcluded = true và isForeclosure = false giữ thông điệp trúng đấu giá thông thường', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 500,
          highestBidderId: 'p2',
          bidderName: 'Tỷ Phú Hà Thành',
          timeRemaining: 0,
          isConcluded: true,
          isForeclosure: false,
          finalPrice: 650,
        } as any)
      );

      expect(html).toContain('đã trúng đấu giá');
      expect(html).not.toContain('giải cứu');
    });

    it('[TC-149.13/MSS][UC-GAME-028][IMP-149][Facet-3/Conclusion] AuctionModal hiển thị đúng giá trúng thầu finalPrice trong phiên phát mãi', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 700,
          highestBidderId: 'p2',
          bidderName: 'Tỷ Phú Hà Thành',
          timeRemaining: 0,
          isConcluded: true,
          isForeclosure: true,
          finalPrice: 850,
        } as any)
      );

      expect(html).toContain('850');
    });
  });

  // =========================================================================
  // FACET 4: MODALHOST INTEGRATION & ERROR DEFENSE
  // =========================================================================
  describe('Facet 4: ModalHost Integration & Error Defense (ModalHost & Fallbacks)', () => {
    it('[TC-149.14/MSS][UC-GAME-028][IMP-149][Facet-4/ModalHost] ModalHost render AuctionModal với isForeclosure = true khi modalPayload mang isForeclosure: true', () => {
      const payload = {
        cellIndex: 1,
        currentBid: 700,
        highestBidderId: null,
        timeRemaining: 15,
        isForeclosure: true,
      };

      useGameStore.setState({
        activeModal: 'auction',
        modalPayload: payload as any,
      });

      const html = renderToStaticMarkup(
        React.createElement(ModalHost, {
          activeModal: 'auction',
          modalPayload: payload as any,
        })
      );

      expect(html).toContain('PHÁT MÃI CƯỠNG CHẾ (-30%)');
      expect(html).toContain('TÀI SẢN PHÁT MẠI THANH LÝ NỢ');
    });

    it('[TC-149.15/MSS][UC-GAME-028][IMP-149][Facet-4/ModalHost] ModalHost render AuctionModal bình thường khi modalPayload không có isForeclosure', () => {
      const payload = {
        cellIndex: 1,
        currentBid: 500,
        highestBidderId: null,
        timeRemaining: 15,
      };

      useGameStore.setState({
        activeModal: 'auction',
        modalPayload: payload as any,
      });

      const html = renderToStaticMarkup(
        React.createElement(ModalHost, {
          activeModal: 'auction',
          modalPayload: payload as any,
        })
      );

      expect(html).not.toContain('PHÁT MÃI CƯỠNG CHẾ');
      expect(html).not.toContain('TÀI SẢN PHÁT MẠI THANH LÝ NỢ');
    });

    it('[TC-149.16/MSS][UC-GAME-028][IMP-149][Facet-4/ErrorDefense] AuctionModal không văng lỗi khi insolvencyPlayerId không có trong playersInfo', () => {
      expect(() => {
        renderToStaticMarkup(
          React.createElement(AuctionModal, {
            cellIndex: 1,
            currentBid: 700,
            highestBidderId: null,
            timeRemaining: 15,
            isForeclosure: true,
            insolvencyPlayerId: 'p_non_existent',
            playersInfo: {},
          } as any)
        );
      }).not.toThrow();
    });
  });

  // =========================================================================
  // IMP-149 V3: 4 NEW REQUIREMENTS & CONTRACT SPECIFICATIONS (TC-149.17 - TC-149.24)
  // =========================================================================
  describe('IMP-149 V3: Server State, Debtor Invariants & Distressed Badging', () => {
    it('[TC-149.17/MSS][UC-GAME-028][IMP-149][ServerState] liquidateAssets in insolvency_manager.ts MUST store startingBid: Math.floor(deed.price * 0.70) in auctions.set()', () => {
      const roomCode = 'ROOM_FC_17';
      const room: Room = {
        roomCode,
        phase: TurnPhase.InsolvencyPhase,
        started: true,
        players: [
          { id: 'p_debtor', position: 1, balance: -500 },
          { id: 'p_creditor', position: 1, balance: 5000 },
        ],
        currentPlayerIndex: 0,
      } as unknown as Room;

      const registry: PropertyRegistry = new Map([[1, 'p_debtor']]);
      const stateMap: PropertyStateMap = new Map();
      const auctions = new Map<string, AuctionSession>();

      const deed = PROPERTY_DEEDS.get(1)!;
      const expectedStartingBid = Math.floor(deed.price * 0.70);

      liquidateAssets(room, 'p_debtor', registry, stateMap, auctions, roomCode);

      const session = auctions.get(roomCode);
      expect(session?.startingBid).toBe(expectedStartingBid);
    });

    it('[TC-149.18/MSS][UC-GAME-028][IMP-149][ServerState] turn_loop.ts (unbuilt reclamation) MUST store startingBid: Math.floor(deed.price * 0.50) in auctions.set()', () => {
      const roomCode = 'ROOM_RECLAM_18';
      const debtorPlayer = { id: 'p_owner', position: 1, balance: 1000 };
      const room: Room = {
        roomCode,
        phase: TurnPhase.PropertyManagement,
        started: true,
        players: [debtorPlayer],
        currentPlayerIndex: 0,
      } as unknown as Room;

      const registry: PropertyRegistry = new Map([[1, 'p_owner']]);
      const stateMap: PropertyStateMap = new Map([[1, { level: 0, unbuiltRounds: 2 }]]);
      const auctions = new Map<string, AuctionSession>();
      const rolledThisTurnMap = new Map<string, boolean>();

      const deed = PROPERTY_DEEDS.get(1)!;
      const expectedStartingBid = Math.floor(deed.price * 0.50);

      executeTurnEnd(
        room,
        debtorPlayer as any,
        true,
        false,
        roomCode,
        rolledThisTurnMap,
        registry,
        stateMap,
        auctions,
      );

      const session = auctions.get(roomCode);
      expect(session?.startingBid).toBe(expectedStartingBid);
    });

    it('[TC-149.19/MSS][UC-GAME-028][IMP-149][ServerDelta] buildDeltaFromRoom in session_manager.ts forwards startingBid into delta.auction', () => {
      const roomCode = 'ROOM_DELTA_19';
      const room: Room = {
        roomCode,
        phase: TurnPhase.AuctionPhase,
        started: true,
        players: [
          { id: 'p_debtor', position: 1, balance: -300 },
          { id: 'p_bidder', position: 1, balance: 5000 },
        ],
        currentPlayerIndex: 0,
      } as unknown as Room;

      const auctions = new Map<string, AuctionSession>();
      auctions.set(roomCode, {
        cellIndex: 1,
        declinedPlayerId: 'p_debtor',
        highestBid: 420,
        startingBid: 420,
        passedPlayers: new Set<string>(),
        insolvencyPlayerId: 'p_debtor',
        endTime: Date.now() + 15_000,
      });

      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1, auctions);

      expect((delta.auction as any)?.startingBid).toBe(420);
    });

    it('[TC-149.20/MSS][UC-GAME-028][IMP-149][DebtorMessage] AuctionModal when isDeclinedPlayer === true AND isForeclosure === true renders foreclosure debtor notice and DOES NOT render declined message', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 420,
          highestBidderId: null,
          timeRemaining: 15,
          isDeclinedPlayer: true,
          isForeclosure: true,
        } as any)
      );

      expect(html).toContain('Tài sản của bạn đang được phát mãi cưỡng chế để cấn trừ nợ xấu. Bạn không thể tự đấu giá tài sản của chính mình.');
      expect(html).not.toContain('Bạn đã từ chối mua ô đất này');
    });

    it('[TC-149.21/MSS][UC-GAME-028][IMP-149][DebtorBanner] AuctionModal when isForeclosure === true and insolvencyPlayerId is provided renders debtor name in banner', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 420,
          highestBidderId: null,
          timeRemaining: 15,
          isForeclosure: true,
          insolvencyPlayerId: 'p_debtor',
          playersInfo: {
            p_debtor: {
              id: 'p_debtor',
              name: 'Đại Gia Phá Sản',
              balance: -1500,
            },
          },
        } as any)
      );

      expect(html).toContain('TÀI SẢN PHÁT MẠI THANH LÝ NỢ • Đại Gia Phá Sản');
    });

    it('[TC-149.22/MSS][UC-GAME-028][IMP-149][DebtorHammer] AuctionModal when isConcluded === true AND isForeclosure === true AND myId === insolvencyPlayerId renders debtor debt deduction notice', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 450,
          highestBidderId: 'p_rescuer',
          bidderName: 'Bạch Thủ Phú',
          timeRemaining: 0,
          isConcluded: true,
          isForeclosure: true,
          insolvencyPlayerId: 'p_debtor',
          myId: 'p_debtor',
          finalPrice: 450,
        } as any)
      );

      expect(html).toContain('Khoản tiền này đã được cấn trừ vào nợ của bạn!');
    });

    it('[TC-149.23/MSS][UC-GAME-028][IMP-149][DistrictCardBadge] AuctionDistrictCard when isForeclosure === true renders distressed badge/tag -30%', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 1,
          currentBid: 420,
          myId: 'p1',
          isForeclosure: true,
        } as any)
      );

      expect(html).toContain('data-testid="foreclosure-distressed-badge"');
      expect(html).toContain('-30%');
    });

    it('[TC-149.24/MSS][UC-GAME-028][IMP-149][StartingBidUI] AuctionModal uses server startingBid for floor price display without duplicating or miscalculating', () => {
      // Cell 1 deed.price is 600 -> default 70% would be 420
      // Providing explicit server startingBid: 400 must be rendered instead of 420
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 450,
          startingBid: 400,
          highestBidderId: null,
          timeRemaining: 15,
          isForeclosure: true,
        } as any)
      );

      expect(html).toContain('400');
      expect(html).not.toContain('420');
    });
  });
});
