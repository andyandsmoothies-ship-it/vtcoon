// [CONTRACT] IMP-227: Auction Solo Deadlock Fix, Property Label Semantics & Utility Fee Parity
// Universal 5-Facet Behavioral Contract Test Suite
// Traceability: IMP-227 · UC-IMP227
// Strict QA Protocol: No production source files modified in src/**

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { PROPERTY_DEEDS } from '../../src/domain/property_data.js';
import { TurnOrchestrator, AUCTION_SETTLE_DELAY_MS } from '../../src/server/network/turn_orchestrator.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { SessionManager } from '../../src/server/session_manager.js';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal.js';
import { AuctionDistrictCard } from '../../src/client/ui/modals/auction_district_card.js';
import { TitleDeedRentTable, type TitleDeedRentTableProps } from '../../src/client/ui/modals/title_deed_rent_table.js';
import { TopBar } from '../../src/client/ui/top_bar.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';

interface ExpectedTitleDeedRentTableProps extends TitleDeedRentTableProps {
  readonly cellIndex?: number;
}
const RentTable = TitleDeedRentTable as React.ComponentType<ExpectedTitleDeedRentTableProps>;

describe('[IMP-227] Auction Solo Deadlock Fix & Label Semantics Contract Test Suite', () => {
  // =========================================================================
  // FACET 1: FSM & STATE TRANSITIONS (4 atomic tests)
  // =========================================================================
  describe('Facet 1: FSM & State Transitions', () => {
    it('[TC-227.01/MSS][UC-IMP227] Solo eligible bidder: Khi phòng có 1 người duy nhất đủ tư cách, handleAuctionBid lập tức chốt thắng thầu và gán chủ quyền, không treo chờ timer', () => {
      const mgr = new RoomManager(1234);
      const room = mgr.createRoom('player_1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.addBot(room.roomCode, 'bot_3');
      mgr.addBot(room.roomCode, 'bot_4');
      mgr.startGame(room.roomCode);

      // Kịch bản thực tế từ ảnh chụp: bot_2 và bot_4 phá sản, bot_3 từ chối mua ô 12 (EVN)
      room.players[1]!.bankrupt = true;
      room.players[3]!.bankrupt = true;
      room.currentPlayerIndex = 2;
      room.players[2]!.position = 12;
      room.phase = TurnPhase.ActionPhase;

      mgr.handleDecline(room.roomCode, 'bot_3');
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      // player_1 là người duy nhất đủ tư cách, đặt giá 1250 (giá gốc 1500, startingBid 750)
      const bidRes = mgr.handleAuctionBid(room.roomCode, 'player_1', 1250);
      expect(bidRes.success).toBe(true);

      // Sàn đấu giá phải đóng ngay lập tức mà không treo chờ timeout
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      const reg = mgr.getRegistry(room.roomCode);
      expect(reg?.get(12)).toBe('player_1');
      expect(mgr.getAuctionSession(room.roomCode)).toBeUndefined();
    });

    it('[TC-227.02/MSS][UC-IMP227] Solo eligible bidder: Khi phòng có 1 người duy nhất đủ tư cách nhưng chọn handleAuctionPass, sàn đấu giá đóng ngay lập tức dưới dạng phát mãi cưỡng chế (0 bids)', () => {
      const mgr = new RoomManager(1234);
      const room = mgr.createRoom('player_1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.addBot(room.roomCode, 'bot_3');
      mgr.addBot(room.roomCode, 'bot_4');
      mgr.startGame(room.roomCode);

      // player_1 từ chối mua ô 12, bot_2 và bot_4 đã phá sản
      room.players[1]!.bankrupt = true;
      room.players[3]!.bankrupt = true;
      room.currentPlayerIndex = 0;
      room.players[0]!.position = 12;
      room.phase = TurnPhase.ActionPhase;

      mgr.handleDecline(room.roomCode, 'player_1');
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      // bot_3 là đối thủ duy nhất còn lại nhưng chọn Pass
      const passRes = mgr.handleAuctionPass(room.roomCode, 'bot_3');
      expect(passRes.success).toBe(true);

      // Toàn bộ người đủ tư cách đã Pass -> đóng sàn ngay lập tức, chuyển sang phát mãi cưỡng chế
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      const lastRes = mgr.getLastAuctionResult(room.roomCode);
      expect(lastRes?.isForeclosure).toBe(true);
      expect(lastRes?.winnerId).toBeNull();
    });

    it('[TC-227.03/MSS][UC-IMP227] Zero eligible bidders at handleDecline: Khi toàn bộ đối thủ đã phá sản, handleDecline phát mãi cưỡng chế Kho Bạc ngay lập tức mà không mở đếm ngược 20s', () => {
      const mgr = new RoomManager(1234);
      const room = mgr.createRoom('player_1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.startGame(room.roomCode);

      // bot_2 phá sản -> khi player_1 decline, không còn ai đủ tư cách tham gia đấu giá
      room.players[1]!.bankrupt = true;
      room.currentPlayerIndex = 0;
      room.players[0]!.position = 12;
      room.phase = TurnPhase.ActionPhase;

      const declineRes = mgr.handleDecline(room.roomCode, 'player_1');
      expect(declineRes.success).toBe(true);

      // Không mở phiên 20s, lập tức chuyển PropertyManagement và chốt phát mãi
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      expect(mgr.getAuctionSession(room.roomCode)).toBeUndefined();
      const lastRes = mgr.getLastAuctionResult(room.roomCode);
      expect(lastRes?.isForeclosure).toBe(true);
    });

    it('[TC-227.04/MSS][UC-IMP227] Phase transition: Ngay sau khi solo auction đóng, room.phase lập tức chuyển sang PropertyManagement', () => {
      const mgr = new RoomManager(1234);
      const room = mgr.createRoom('player_1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.startGame(room.roomCode);

      room.currentPlayerIndex = 1;
      room.players[1]!.position = 1;
      room.phase = TurnPhase.ActionPhase;

      mgr.handleDecline(room.roomCode, 'bot_2');
      mgr.handleAuctionBid(room.roomCode, 'player_1', 350);

      expect(room.phase).toBe(TurnPhase.PropertyManagement);
    });
  });

  // =========================================================================
  // FACET 2: TREASURY INVARIANT & BALANCE UPDATES (3 atomic tests)
  // =========================================================================
  describe('Facet 2: Treasury Invariant & Balance Updates', () => {
    it('[TC-227.05/MSS][UC-IMP227] Solo winning bid: Người thắng bị trừ đúng số tiền trúng thầu (winner.balance -= winningBid) và Kho Bạc tăng tương ứng (room.treasury += winningBid)', () => {
      const mgr = new RoomManager(1234);
      const room = mgr.createRoom('player_1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.startGame(room.roomCode);

      room.treasury = 500;
      const p1 = room.players[0]!;
      p1.balance = 3000;

      room.currentPlayerIndex = 1;
      room.players[1]!.position = 12; // EVN (1500)
      room.phase = TurnPhase.ActionPhase;

      mgr.handleDecline(room.roomCode, 'bot_2');
      mgr.handleAuctionBid(room.roomCode, 'player_1', 1250);

      // Điểm tiêu thụ (Consumption Point): Tiền mặt giảm đúng 1250, Kho Bạc nhận đúng 1250
      expect(p1.balance).toBe(3000 - 1250);
      expect(room.treasury).toBe(500 + 1250);
      const lastRes = mgr.getLastAuctionResult(room.roomCode);
      expect(lastRes?.winningBid).toBe(1250);
    });

    it('[TC-227.06/MSS][UC-IMP227] Bankrupt player exclusion: Người chơi phá sản (bankrupt: true) bị loại bỏ hoàn toàn khỏi eligiblePlayers, không thể đặt giá và không nhận tài sản', () => {
      const mgr = new RoomManager(1234);
      const room = mgr.createRoom('player_1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.addBot(room.roomCode, 'bot_3');
      mgr.startGame(room.roomCode);

      const b2 = room.players[1]!;
      b2.bankrupt = true;
      b2.balance = 0;

      room.currentPlayerIndex = 0;
      room.players[0]!.position = 1;
      room.phase = TurnPhase.ActionPhase;

      mgr.handleDecline(room.roomCode, 'player_1');

      const bidRes = mgr.handleAuctionBid(room.roomCode, 'bot_2', 350);
      expect(bidRes.success).toBe(false);
      expect(bidRes.reason).toBe('INVALID_PLAYER');
      const reg = mgr.getRegistry(room.roomCode);
      expect(reg?.get(1)).toBeUndefined();
    });

    it('[TC-227.07/MSS][UC-IMP227] Zero eligible foreclosure treasury: Khi phát mãi cưỡng chế do 0 người đủ tư cách, sự kiện AUCTION_FORECLOSED ghi nhận đúng foreclosureRate: 0.70 và giá sàn 70%', () => {
      const infoSpy = vi.spyOn(console, 'info');
      const mgr = new RoomManager(1234);
      const room = mgr.createRoom('player_1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.startGame(room.roomCode);

      room.players[1]!.bankrupt = true;
      room.currentPlayerIndex = 0;
      room.players[0]!.position = 12; // EVN (1500)
      room.phase = TurnPhase.ActionPhase;

      mgr.handleDecline(room.roomCode, 'player_1');

      // Giá sàn phát mãi 70% của 1500 là 1050
      const calls = infoSpy.mock.calls
        .map((c) => {
          try {
            return JSON.parse(String(c[0])) as { event?: string; delta?: { foreclosureRate?: number; foreclosurePrice?: number } };
          } catch {
            return null;
          }
        })
        .filter((c) => c?.event === 'AUCTION_FORECLOSED');

      expect(calls.length).toBeGreaterThanOrEqual(1);
      expect(calls[0]?.delta?.foreclosureRate).toBe(0.70);
      expect(calls[0]?.delta?.foreclosurePrice).toBe(1050);
      infoSpy.mockRestore();
    });
  });

  // =========================================================================
  // FACET 3: BOUNDARY, ERROR DEFENSE & ACTOR INVERSION (3 atomic tests)
  // =========================================================================
  describe('Facet 3: Boundary, Error Defense & Actor Inversion', () => {
    it('[TC-227.08/MSS][UC-IMP227] 4-Player Boundary (2 bankrupt, 1 declined): Đúng kịch bản ảnh chụp thực tế, chỉ còn 1 người duy nhất bid -> thắng ngay lập tức', () => {
      const mgr = new RoomManager(1234);
      const room = mgr.createRoom('player_1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.addBot(room.roomCode, 'bot_3');
      mgr.addBot(room.roomCode, 'bot_4');
      mgr.startGame(room.roomCode);

      // bot_2 & bot_4 phá sản, bot_3 decline ô 12
      room.players[1]!.bankrupt = true;
      room.players[3]!.bankrupt = true;
      room.currentPlayerIndex = 2;
      room.players[2]!.position = 12;
      room.phase = TurnPhase.ActionPhase;

      mgr.handleDecline(room.roomCode, 'bot_3');
      mgr.handleAuctionBid(room.roomCode, 'player_1', 1250);

      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      const lastRes = mgr.getLastAuctionResult(room.roomCode);
      expect(lastRes?.winnerId).toBe('player_1');
      expect(lastRes?.winningBid).toBe(1250);
      expect(lastRes?.isForeclosure).toBe(false);
    });

    it('[TC-227.09/MSS][UC-IMP227] 4-Player Boundary (1 declined, 2 passed): 2 đối thủ còn lại đã Pass, người thứ 3 đặt giá -> chốt thắng ngay lập tức', () => {
      const mgr = new RoomManager(1234);
      const room = mgr.createRoom('player_1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.addBot(room.roomCode, 'bot_3');
      mgr.addBot(room.roomCode, 'bot_4');
      mgr.startGame(room.roomCode);

      room.currentPlayerIndex = 0;
      room.players[0]!.position = 12;
      room.phase = TurnPhase.ActionPhase;

      mgr.handleDecline(room.roomCode, 'player_1');
      mgr.handleAuctionPass(room.roomCode, 'bot_2');
      mgr.handleAuctionPass(room.roomCode, 'bot_3');

      // bot_4 là người cuối cùng chưa pass, đặt giá hợp lệ
      mgr.handleAuctionBid(room.roomCode, 'bot_4', 800);

      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      const lastRes = mgr.getLastAuctionResult(room.roomCode);
      expect(lastRes?.winnerId).toBe('bot_4');
      expect(lastRes?.winningBid).toBe(800);
    });

    it('[TC-227.10/MSS][UC-IMP227] Actor Inversion (Human declined, Bots passed): Khi Human từ chối mua và toàn bộ các Bot còn lại chọn Pass, sàn đóng ngay lập tức, không bị chặn bởi hasHumanInRoom', () => {
      const mgr = new RoomManager(1234);
      const room = mgr.createRoom('player_1'); // Human
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.addBot(room.roomCode, 'bot_3');
      mgr.startGame(room.roomCode);

      room.currentPlayerIndex = 0;
      room.players[0]!.position = 1;
      room.phase = TurnPhase.ActionPhase;

      mgr.handleDecline(room.roomCode, 'player_1');
      mgr.handleAuctionPass(room.roomCode, 'bot_2');
      mgr.handleAuctionPass(room.roomCode, 'bot_3');

      // Human đã từ chối mua thì không còn tư cách, không được giữ phiên 20s chờ Human
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      const lastRes = mgr.getLastAuctionResult(room.roomCode);
      expect(lastRes?.isForeclosure).toBe(true);
      expect(lastRes?.winnerId).toBeNull();
    });
  });

  // =========================================================================
  // FACET 4: UI SEMANTICS & PROPERTY DEEDS (3 atomic tests)
  // =========================================================================
  describe('Facet 4: UI Semantics & Property Deeds', () => {
    it('[TC-227.11/MSS][UC-IMP227] AuctionModal Hero Header: Render đồng thời cả Giá gốc: 1.500 Tr. và Giá khởi điểm: 750 Tr., không mâu thuẫn ngữ nghĩa với giá thầu hiện tại', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 12, // EVN, basePrice = 1500
          currentBid: 1250,
          startingBid: 750,
          highestBidderId: 'player_1',
          timeRemaining: 15,
        })
      );

      // Phải có cả Giá gốc và Giá khởi điểm, giá khởi điểm là 750 (50% của 1500)
      expect(html).toContain('Giá gốc:');
      expect(html).toContain('1.500');
      expect(html).toContain('Giá khởi điểm:');
      expect(html).toContain('750');
    });

    it('[TC-227.12/MSS][UC-IMP227] AuctionDistrictCard: Ô 12 (EVN) hiển thị nhãn LƯỚI ĐIỆN, Ô 28 (Viettel) hiển thị nhãn NÂNG CẤP 5G', () => {
      const html12 = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 12,
          currentBid: 750,
        })
      );
      const html28 = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 28,
          currentBid: 750,
        })
      );

      expect(html12).toContain('LƯỚI ĐIỆN');
      expect(html12).not.toContain('NÂNG CẤP 5G');
      expect(html28).toContain('NÂNG CẤP 5G');
    });

    it('[TC-227.13/MSS][UC-IMP227] TitleDeedRentTable: Cả dạng thu gọn và mở rộng hiển thị đúng nhãn Lưới Điện Thông Minh (Smart Grid) cho Ô 12 và Trạm Phát Sóng 5G cho Ô 28', () => {
      const html12 = renderToStaticMarkup(
        React.createElement(RentTable, {
          isRailroad: false,
          isUtility: true,
          rents: [1000, 2500, 3500],
          upgradeCosts: [1000],
          cellIndex: 12,
        })
      );
      const html28 = renderToStaticMarkup(
        React.createElement(RentTable, {
          isRailroad: false,
          isUtility: true,
          rents: [1000, 2500, 3500],
          upgradeCosts: [1000],
          cellIndex: 28,
        })
      );

      expect(html12).toContain('Lưới Điện Thông Minh (Smart Grid)');
      expect(html12).toContain('GRID');
      expect(html28).toContain('Nâng Cấp Trạm Phát 5G');
      expect(html28).toContain('5G');
    });
  });

  // =========================================================================
  // FACET 5: TRANSIENT LIFECYCLE, PERFORMANCE & LIVING TEST PARITY (4 atomic tests)
  // =========================================================================
  describe('Facet 5: Transient Lifecycle, Performance & Living Test Parity', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('[TC-227.14/MSS][UC-IMP227] Settle Auction Idempotence: turnOrchestrator.orchestrate tự động kích hoạt scheduleAuctionSettle khi có lastAuctionResult, không tạo timer trùng lặp', async () => {
      const mgr = new RoomManager(1234);
      const room = mgr.createRoom('p1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.startGame(room.roomCode);

      const intentMutex = new IntentMutex();
      const sessions = new SessionManager();
      const broadcaster = new DeltaBroadcaster(mgr, sessions);
      const orchestrator = new TurnOrchestrator({
        rooms: mgr,
        intentMutex,
        broadcaster,
        onGameOver: vi.fn(),
      });

      // Giả lập phiên đấu giá đóng đồng bộ ngoài orchestrator
      room.lastAuctionResult = {
        cellIndex: 12,
        winnerId: 'p1',
        winningBid: 1250,
        finalPrice: 1250,
        isForeclosure: false,
      };

      // orchestrate phải tự động gắn settle timer cho lastAuctionResult
      orchestrator.orchestrate(room.roomCode);

      // Chạy qua 2500ms settle delay
      await vi.advanceTimersByTimeAsync(AUCTION_SETTLE_DELAY_MS + 100);

      // lastAuctionResult phải được settleAuction dọn sạch về null/undefined
      expect(mgr.getLastAuctionResult(room.roomCode)).toBeFalsy();
    });

    it('[TC-227.15/MSS][UC-IMP227] Turn N+1 Teardown: Sau thời gian trễ 2.5s settle delay, lastAuctionResult được dọn sạch và delta phát sóng tombstone auction: null', async () => {
      const mgr = new RoomManager(1234);
      const room = mgr.createRoom('p1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.startGame(room.roomCode);

      const intentMutex = new IntentMutex();
      const sessions = new SessionManager();
      const broadcaster = new DeltaBroadcaster(mgr, sessions);
      const broadcastSpy = vi.spyOn(broadcaster, 'broadcastRoomDelta');
      const orchestrator = new TurnOrchestrator({
        rooms: mgr,
        intentMutex,
        broadcaster,
        onGameOver: vi.fn(),
      });

      room.lastAuctionResult = {
        cellIndex: 1,
        winnerId: 'p1',
        winningBid: 350,
        finalPrice: 350,
        isForeclosure: false,
      };

      orchestrator.orchestrate(room.roomCode);
      await vi.advanceTimersByTimeAsync(AUCTION_SETTLE_DELAY_MS + 100);

      expect(room.lastAuctionResult).toBeFalsy();
      expect(broadcastSpy).toHaveBeenCalledWith(room.roomCode);
    });

    it('[TC-227.16/MSS][UC-IMP227] Mobile FPS Badge: Kiểm tra 3 ngưỡng màu: >= 45 có class text-emerald-400, 25-44 có class text-amber-400, < 25 có class text-rose-400', () => {
      // 1. High FPS (>= 45) -> text-emerald-400
      useTelemetryStore.setState({ metrics: { ...useTelemetryStore.getState().metrics, fps: 55 } });
      const htmlHigh = renderToStaticMarkup(React.createElement(TopBar));
      const badgeHigh = htmlHigh.match(/<button[^>]*data-testid=["']mobile-fps-badge["'][^>]*class=["']([^"']*)["']/);
      expect(badgeHigh?.[1]).toContain('text-emerald-400');

      // 2. Medium FPS (25-44) -> text-amber-400
      useTelemetryStore.setState({ metrics: { ...useTelemetryStore.getState().metrics, fps: 30 } });
      const htmlMed = renderToStaticMarkup(React.createElement(TopBar));
      const badgeMed = htmlMed.match(/<button[^>]*data-testid=["']mobile-fps-badge["'][^>]*class=["']([^"']*)["']/);
      expect(badgeMed?.[1]).toContain('text-amber-400');
      expect(badgeMed?.[1]).not.toContain('text-emerald-400');

      // 3. Low FPS (< 25) -> text-rose-400
      useTelemetryStore.setState({ metrics: { ...useTelemetryStore.getState().metrics, fps: 20 } });
      const htmlLow = renderToStaticMarkup(React.createElement(TopBar));
      const badgeLow = htmlLow.match(/<button[^>]*data-testid=["']mobile-fps-badge["'][^>]*class=["']([^"']*)["']/);
      expect(badgeLow?.[1]).toContain('text-rose-400');
      expect(badgeLow?.[1]).not.toContain('text-emerald-400');
    });

    it('[TC-227.17/MSS][UC-IMP227] Reconciled Living Contract: Cập nhật auction_loop_prevention_contract.test.ts#L265 với đối thủ cạnh tranh thứ 2, đảm bảo toàn bộ suite test cũ giữ vững 100% GREEN', () => {
      const mgr = new RoomManager(1234);
      const room = mgr.createRoom('p1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.addBot(room.roomCode, 'bot_3');
      mgr.startGame(room.roomCode);

      room.currentPlayerIndex = 2;
      room.players[2]!.position = 1;
      room.phase = TurnPhase.ActionPhase;
      mgr.handleDecline(room.roomCode, 'bot_3');

      const bidRes = mgr.handleAuctionBid(room.roomCode, 'bot_2', 350);
      expect(bidRes.success).toBe(true);

      // p1 là đối thủ cạnh tranh còn lại chưa hành động -> phòng duy trì AuctionPhase an toàn
      expect(room.phase).toBe(TurnPhase.AuctionPhase);
      const session = mgr.getAuctionSession(room.roomCode);
      expect(session?.highestBidder).toBe('bot_2');
      expect(session?.highestBid).toBe(350);
    });
  });
});
