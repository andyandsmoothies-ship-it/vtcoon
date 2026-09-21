// [TC-160/MSS][UC-GAME-028] Station 1 RED Contract Test Suite:
// Triệt Tiêu Lỗi Kẹt Sàn Đấu Giá Ma (Ghost Auction Modal Loop) & Rà Soát Toàn Diện Vòng Đời Trạng Thái Kinh Doanh
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RoomManager } from '../../src/server/room_manager.js';
import { SessionManager, buildDeltaFromRoom } from '../../src/server/session_manager.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { TurnOrchestrator } from '../../src/server/network/turn_orchestrator.js';
import { TurnPhase, type Room } from '../../src/domain/room.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal.js';

// Declaration merging for planned IMP-160 contracts
declare module '../../src/server/room_manager.js' {
  interface RoomManager {
    settleAuction(roomCode: string): void;
  }
}

declare module '../../src/server/network/turn_orchestrator.js' {
  interface TurnOrchestrator {
    scheduleAuctionSettle(roomCode: string, auctionKey?: string): void;
  }
}

describe('[TC-160/MSS][UC-GAME-028] Ghost Auction Modal & Business Lifecycle Hardening Contract Suite', () => {
  let rooms: RoomManager;
  let sessions: SessionManager;
  let intentMutex: IntentMutex;
  let broadcaster: DeltaBroadcaster;
  let orchestrator: TurnOrchestrator;
  let broadcastLogs: Array<{ roomCode: string; payload: any }>;

  beforeEach(() => {
    rooms = new RoomManager(42);
    sessions = new SessionManager();
    intentMutex = new IntentMutex();
    broadcastLogs = [];
    broadcaster = new DeltaBroadcaster(rooms, sessions, (rc, payload) => {
      broadcastLogs.push({ roomCode: rc, payload });
    });
    orchestrator = new TurnOrchestrator({
      rooms,
      intentMutex,
      broadcaster,
      onGameOver: () => {},
      botTurnDelayMs: 100,
    });

    useGameStore.getState().resetGameState?.();
    useLobbyStore.setState({ myPlayerId: 'p1_hanoi' });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  // =========================================================================
  // FACET 1: SETTLE TIMER LIFECYCLE & CANCELLATION DEFENSE (SERVER ORCHESTRATION)
  // =========================================================================
  describe('Facet 1: Settle Timer Lifecycle & Cancellation Defense (Server Orchestration)', () => {
    it('[TC-160.01/MSS][UC-GAME-028] (Settle Timer Lifecycle) Đấu giá kết thúc bởi Người Thật: scheduleAuctionSettle thiết lập settleTimer 2.5s không bị hủy bởi intent trung gian; sau 2.5s lastAuctionResult biến mất và delta phát ra auction === null', async () => {
      vi.useFakeTimers();
      const room = rooms.createRoom('p1_hanoi');
      rooms.joinRoom(room.roomCode, 'p2_saigon');
      rooms.startGame(room.roomCode);

      // P1 từ chối mua ô 3 -> AuctionPhase
      room.players[0]!.position = 3;
      room.phase = TurnPhase.ActionPhase;
      rooms.handleDecline(room.roomCode, 'p1_hanoi');

      // P2 pass -> Phiên đấu giá đóng (phát mãi)
      rooms.handleAuctionPass(room.roomCode, 'p2_saigon');
      expect(rooms.getLastAuctionResult(room.roomCode)).toBeDefined();

      // Orchestrator lên lịch settle 2.5s
      orchestrator.scheduleAuctionSettle(room.roomCode);

      // Intent hoặc điều phối trung gian trong vòng 2.5s không được hủy timer settle
      await vi.advanceTimersByTimeAsync(1000);
      orchestrator.orchestrate(room.roomCode);

      // Tiến thêm 1.6s (tổng 2.6s > 2.5s)
      await vi.advanceTimersByTimeAsync(1600);

      // Điểm tiêu thụ 1: lastAuctionResult bị xóa bỏ triệt để
      expect(rooms.getLastAuctionResult(room.roomCode)).toBeUndefined();

      // Điểm tiêu thụ 2: Delta sau settle phát sóng auction === null
      const delta = rooms.createDelta(room.roomCode, 1);
      expect(delta?.auction).toBeNull();
    });

    it('[TC-160.02/MSS][UC-GAME-028] (Settle Timer Isolation) TurnOrchestrator.clearRoom() gọi thông thường không hủy nhầm auctionSettleTimers của phiên đang chờ settle', async () => {
      vi.useFakeTimers();
      const room = rooms.createRoom('p1_hanoi');
      rooms.joinRoom(room.roomCode, 'p2_saigon');
      rooms.startGame(room.roomCode);

      room.players[0]!.position = 3;
      room.phase = TurnPhase.ActionPhase;
      rooms.handleDecline(room.roomCode, 'p1_hanoi');
      rooms.handleAuctionPass(room.roomCode, 'p2_saigon');

      orchestrator.scheduleAuctionSettle(room.roomCode);

      // Lời gọi clearRoom thông thường (từ dọn dẹp phòng/turn loop) không được giết chết settleTimer
      orchestrator.clearRoom(room.roomCode);

      await vi.advanceTimersByTimeAsync(2600);

      expect(rooms.getLastAuctionResult(room.roomCode)).toBeUndefined();
      expect(rooms.createDelta(room.roomCode, 1)?.auction).toBeNull();
    });

    it('[TC-160.03/MSS][UC-GAME-028] (Cross-Auction Collateral Defense) Timer 2.5s của phiên A mang auctionKey khác không xóa nhầm kết quả của phiên B mới hơn', async () => {
      vi.useFakeTimers();
      const room = rooms.createRoom('p1_hanoi');
      rooms.joinRoom(room.roomCode, 'p2_saigon');
      rooms.startGame(room.roomCode);

      // Phiên A tại ô 3 hoàn tất, gắn settle key 'auction_key_A'
      room.players[0]!.position = 3;
      room.phase = TurnPhase.ActionPhase;
      rooms.handleDecline(room.roomCode, 'p1_hanoi');
      rooms.handleAuctionPass(room.roomCode, 'p2_saigon');
      orchestrator.scheduleAuctionSettle(room.roomCode, 'auction_key_A');

      // Trước khi timer A nổ, phiên B tại ô 5 diễn ra và kết thúc mới hơn
      room.lastAuctionResult = {
        cellIndex: 5,
        winnerId: 'p2_saigon',
        winningBid: 1500,
        finalPrice: 1500,
        isForeclosure: false,
      };

      // Timer của phiên A nổ sau 2.5s
      await vi.advanceTimersByTimeAsync(2600);

      // Bảo toàn kết quả phiên B: Không bị timer cũ của phiên A xóa sổ
      const currentRes = rooms.getLastAuctionResult(room.roomCode);
      expect(currentRes).toBeDefined();
      expect(currentRes?.cellIndex).toBe(5);
    });

    it('[TC-160.04/MSS][UC-GAME-028] (Headless Test Isolation) RoomManager.settleAuction hoạt động thuần đồng bộ, dọn dẹp sạch lastAuctionResult mà không kích hoạt unref timer', () => {
      const room = rooms.createRoom('p1_hanoi');
      rooms.joinRoom(room.roomCode, 'p2_saigon');
      rooms.startGame(room.roomCode);

      room.lastAuctionResult = {
        cellIndex: 3,
        winnerId: 'p1_hanoi',
        winningBid: 600,
        finalPrice: 600,
        isForeclosure: false,
      };

      // Gọi settleAuction đồng bộ
      rooms.settleAuction(room.roomCode);

      expect(rooms.getLastAuctionResult(room.roomCode)).toBeUndefined();
      expect(room.lastAuctionResult).toBeUndefined();
      expect(rooms.createDelta(room.roomCode, 1)?.auction).toBeNull();
    });
  });

  // =========================================================================
  // FACET 2: MULTI-TURN LEAK PREVENTION & PREMATURE CLEANUP DEFENSE
  // =========================================================================
  describe('Facet 2: Multi-Turn Leak Prevention & Premature Cleanup Defense', () => {
    it('[TC-160.05/MSS][UC-GAME-028] (Multi-Turn Leak Defense) Đấu giá kết thúc bởi Bot: handleEndTurn gọi ngay sau handleAuctionClose trong cùng tick không bóp chết lastAuctionResult', () => {
      const room = rooms.createRoom('p1_hanoi');
      const bot = rooms.addBot(room.roomCode, 'bot_saigon')!;
      rooms.startGame(room.roomCode);

      room.players[0]!.position = 3;
      room.phase = TurnPhase.ActionPhase;
      rooms.handleDecline(room.roomCode, 'p1_hanoi');

      // Đấu giá đóng bởi Bot
      rooms.handleAuctionClose(room.roomCode);
      expect(rooms.getLastAuctionResult(room.roomCode)).toBeDefined();

      // Bot gọi handleEndTurn ngay trong cùng tick
      rooms.handleEndTurn(room.roomCode, bot.id);

      // Delta phát đi ngay sau handleEndTurn vẫn phải bảo toàn lastAuctionResult cho client hiển thị banner
      const delta = rooms.createDelta(room.roomCode, 1);
      expect(delta?.auction).toBeDefined();
      expect(delta?.auction?.isConcluded).toBe(true);
    });

    it('[TC-160.06/MSS][UC-GAME-028] (Turn Boundary Cleanup) Khi người chơi tiếp theo gieo xúc xắc (handleRollDice), server tự động dọn dẹp lastAuctionResult tồn dư từ lượt trước', () => {
      const room = rooms.createRoom('p1_hanoi');
      rooms.joinRoom(room.roomCode, 'p2_saigon');
      rooms.startGame(room.roomCode);

      // Tồn dư kết quả đấu giá từ lượt trước
      room.lastAuctionResult = {
        cellIndex: 3,
        winnerId: 'p1_hanoi',
        winningBid: 600,
        finalPrice: 600,
        isForeclosure: false,
      };

      const curr = room.players[room.currentPlayerIndex]!;
      rooms.handleRollDice(room.roomCode, curr.id);

      // Khi gieo xúc xắc mới, tàn dư đấu giá phải bị dọn sạch
      expect(rooms.getLastAuctionResult(room.roomCode)).toBeUndefined();
      expect(room.lastAuctionResult).toBeUndefined();
    });

    it('[TC-160.07/MSS][UC-GAME-028] (State Cleanup Invariant) Khi gieo xúc xắc lượt mới (handleRollDice), server tự động dọn dẹp room.lastHoseResult = undefined', () => {
      const room = rooms.createRoom('p1_hanoi');
      rooms.joinRoom(room.roomCode, 'p2_saigon');
      rooms.startGame(room.roomCode);

      // Tồn dư kết quả chơi chứng khoán HOSE từ lượt trước
      room.lastHoseResult = {
        playerId: 'p1_hanoi',
        stake: 1000,
        roll: 4,
        multiplier: 1.2,
        payout: 1200,
        profit: 200,
        timestamp: Date.now(),
        diceSeq: 10,
      };

      const curr = room.players[room.currentPlayerIndex]!;
      rooms.handleRollDice(room.roomCode, curr.id);

      // Gieo xúc xắc mới xóa sổ sạch kết quả HOSE cũ
      expect(room.lastHoseResult).toBeUndefined();
    });

    it('[TC-160.08/MSS][UC-GAME-028] (Wire Protocol SSOT) buildDeltaFromRoom: Khi room.lastHoseResult là undefined, phát delta mang lastHoseResult: null để client dọn dẹp modal chứng khoán', () => {
      const room = rooms.createRoom('p1_hanoi');
      rooms.startGame(room.roomCode);

      room.lastHoseResult = undefined;

      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1, new Map());

      // Ràng buộc cứng: delta.lastHoseResult bắt buộc là null (không phải undefined bị drop khỏi JSON)
      expect('lastHoseResult' in delta).toBe(true);
      expect(delta.lastHoseResult).toBeNull();
    });
  });

  // =========================================================================
  // FACET 3: CLIENT IDEMPOTENT PROJECTION & RECONNECT SAFETY (APPLY_DELTA)
  // =========================================================================
  describe('Facet 3: Client Idempotent Projection & Reconnect Safety (apply_delta)', () => {
    it('[TC-160.09/MSS][UC-GAME-028] (Idempotent Projection) Khi nhận delta mang auction.isConcluded: true nếu phòng ở WaitingRoll hoặc ActionPhase, client KHÔNG mở lại AuctionModal', () => {
      useGameStore.setState({ activeModal: null, turnPhase: TurnPhase.WaitingRoll });

      const delta = {
        tick: 1,
        cells: [],
        turnPhase: TurnPhase.WaitingRoll,
        auction: {
          cellIndex: 3,
          currentBid: 500,
          startingBid: 300,
          highestBidderId: 'p1_hanoi',
          timeRemaining: 0,
          isConcluded: true,
        },
      } as any;

      applyDeltaToStore(delta, useGameStore);

      // Chặn bẫy mở lại sàn đấu giá ma khi lượt chơi đã chuyển sang đổ xúc xắc
      expect(useGameStore.getState().activeModal).not.toBe('auction');
    });

    it('[TC-160.10/MSS][UC-GAME-028] (Single-Open Invariant) Khi nhận delta auction.isConcluded: true trong PropertyManagement, client chỉ mở modal 1 lần; khi đã đóng không tự mở lại ở các delta sau', () => {
      useGameStore.setState({ activeModal: null, turnPhase: TurnPhase.PropertyManagement });

      const deltaConcluded = {
        tick: 1,
        cells: [],
        turnPhase: TurnPhase.PropertyManagement,
        auction: {
          cellIndex: 3,
          currentBid: 500,
          startingBid: 300,
          highestBidderId: 'p1_hanoi',
          timeRemaining: 0,
          isConcluded: true,
        },
      } as any;

      // Lần đầu nhận delta kết luận: mở modal
      applyDeltaToStore(deltaConcluded, useGameStore);
      expect(useGameStore.getState().activeModal).toBe('auction');

      // Người chơi bấm đóng modal
      useGameStore.getState().closeModal();
      expect(useGameStore.getState().activeModal).toBeNull();

      // Delta tiếp theo vẫn còn cờ isConcluded: true (trong 2.5s settle window)
      const deltaSubsequent = { ...deltaConcluded, tick: 2 };
      applyDeltaToStore(deltaSubsequent, useGameStore);

      // Bất biến: Không tự tiện mở lại modal đã đóng
      expect(useGameStore.getState().activeModal).toBeNull();
    });

    it('[TC-160.11/MSS][UC-GAME-028] (Modal Auto-Close) Khi delta.auction === null và state.activeModal === "auction", client tự động đóng modal', () => {
      useGameStore.getState().openModal('auction', {
        cellIndex: 3,
        currentBid: 500,
        isConcluded: true,
      } as any);

      expect(useGameStore.getState().activeModal).toBe('auction');

      const deltaClear = {
        tick: 3,
        cells: [],
        auction: null,
      } as any;

      applyDeltaToStore(deltaClear, useGameStore);

      // Khi server báo auction === null, modal đang treo kết luận phải tự động hạ màn
      expect(useGameStore.getState().activeModal).toBeNull();
    });

    it('[TC-160.12/MSS][UC-GAME-028] (HOSE Stale Cleanup) Khi delta.lastHoseResult === null, client xóa sạch trạng thái HOSE đang mở khỏi store', () => {
      useGameStore.getState().openModal('hose', {
        isReviewingResult: true,
        lastDiceRoll: 4,
        lastPayout: 1200,
        lastMultiplier: 1.2,
        lastProfit: 200,
        currentStake: 1000,
      } as any);

      expect(useGameStore.getState().activeModal).toBe('hose');

      const deltaClearHose = {
        tick: 4,
        cells: [],
        lastHoseResult: null,
      } as any;

      applyDeltaToStore(deltaClearHose, useGameStore);

      // Modal HOSE được đóng sạch sẽ khi server dọn dẹp kết quả
      expect(useGameStore.getState().activeModal).not.toBe('hose');
    });
  });

  // =========================================================================
  // FACET 4: INTERACTIVE ZOMBIE UI DEFENSE & AUTO-BID GUARD (AUCTIONMODAL)
  // =========================================================================
  describe('Facet 4: Interactive Zombie UI Defense & Auto-Bid Guard (AuctionModal)', () => {
    it('[TC-160.13/MSS][UC-GAME-028] (Zombie UI Defense) Khi isConcluded: true, Header badge trong AuctionModal hiển thị ĐÃ KẾT THÚC thay vì ĐANG MỞ', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: 'p2_saigon',
          timeRemaining: 0,
          isConcluded: true,
          isForeclosure: false,
        })
      );

      expect(html).toContain('ĐÃ KẾT THÚC');
      expect(html).not.toContain('ĐANG MỞ');
    });

    it('[TC-160.14/MSS][UC-GAME-028] (Zombie UI Defense) Khi isConcluded: true, cụm 3 nút nâng giá nhanh +100, +200, +500 bị vô hiệu hóa hoặc ẩn', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: 'p2_saigon',
          timeRemaining: 0,
          myId: 'p1_hanoi',
          myBalance: 10000,
          isConcluded: true,
        })
      );

      // Khi phiên đã kết thúc, các nút nâng giá phải bị ẩn hoặc vô hiệu hóa triệt để (không mang class cursor-pointer và phải có thuộc tính disabled)
      const bid100BtnMatch = html.match(/<button[^>]*>[\s\S]*?\+100 Tr\.[\s\S]*?<\/button>/);
      if (bid100BtnMatch) {
        expect(bid100BtnMatch[0]).toMatch(/\sdisabled([=>\s]|$)/);
        expect(bid100BtnMatch[0]).not.toContain('cursor-pointer');
      } else {
        expect(html).not.toContain('+100 Tr.');
      }
    });

    it('[TC-160.15/MSS][UC-GAME-028] (Footer Action Guard) Khi isConcluded: true, nút ở footer đổi thành Đóng / Xem Bàn Cờ, không còn nhãn Rút Lui / Bỏ Cuộc', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: 'p2_saigon',
          timeRemaining: 0,
          myId: 'p1_hanoi',
          isConcluded: true,
        })
      );

      expect(html).not.toContain('Rút Lui / Bỏ Cuộc');
      expect(html).toMatch(/Đóng \/ Xem Bàn Cờ|Đóng/);
    });

    it('[TC-160.16/MSS][UC-GAME-028] (Auto-Bid Guard) Khi isConcluded: true, nút Auto-Bid bị vô hiệu hóa (disabled) để ngăn ngừa đặt giá sau khi gõ búa', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: 'p2_saigon',
          timeRemaining: 0,
          myId: 'p1_hanoi',
          isConcluded: true,
        })
      );

      const autoBidBtnMatch = html.match(/<button[^>]*>[\s\S]*?AUTO-BID[\s\S]*?<\/button>/);
      expect(autoBidBtnMatch).not.toBeNull();
      expect(autoBidBtnMatch?.[0]).toMatch(/\sdisabled([=>\s]|$)/);
    });
  });
});
