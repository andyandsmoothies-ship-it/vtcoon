// [TC-IMP184/MSS][UC-GAME-028] Station 1 RED Contract Test Suite:
// Khắc Phục Báo Động Ảo Lương GO & Sửa Lỗi Khóa Đấu Giá BĐS (Auction Premature Timeout & Dual-Timer Desync)
// Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { BotPersonality } from '../../src/domain/bot/bot_engine.js';
import {
  TurnOrchestrator,
  AUCTION_BOT_STEP_DELAY_MS,
  PHASE_TIMEOUTS_MS,
} from '../../src/server/network/turn_orchestrator.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { SessionManager, type DeltaPayload } from '../../src/server/session_manager.js';
import { runBotTurn } from '../../src/server/room_bot_coordinator.js';
import {
  verifyMovementStep,
  verifyTreasuryConservation,
} from '../../src/client/telemetry/invariant_checker.js';
import {
  detectMovement,
  computeExpectedDelta,
} from '../../src/client/telemetry/telemetry_delta_hook.js';
import type { GameState } from '../../src/client/store/game_store.js';

describe('TICKET IMP-184: Auction Human Window & Telemetry GO Salary Calibration', () => {
  let mgr: RoomManager;
  let sessions: SessionManager;
  let intentMutex: IntentMutex;
  let broadcaster: DeltaBroadcaster;
  let orchestrator: TurnOrchestrator;
  let broadcastLogs: Array<{ roomCode: string; payload: unknown }>;

  beforeEach(() => {
    mgr = new RoomManager(42);
    sessions = new SessionManager();
    intentMutex = new IntentMutex();
    broadcastLogs = [];
    broadcaster = new DeltaBroadcaster(mgr, sessions, (rc, payload) => {
      broadcastLogs.push({ roomCode: rc, payload });
    });
    orchestrator = new TurnOrchestrator({
      rooms: mgr,
      intentMutex,
      broadcaster,
      onGameOver: () => {},
      botTurnDelayMs: 100,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (Auction Bot Step Non-Termination & Loop Safety)
  // =========================================================================
  describe('Facet 1: Boundary (Auction Bot Step Non-Termination & Loop Safety)', () => {
    it('[TC-IMP184.01/MSS][UC-GAME-028] (Boundary) stepAuctionBot: Khi bot nâng giá và các bot khác đã pass nhưng người chơi thật CHƯA PASS, stepAuctionBot trả về finished: false', () => {
      const room = mgr.createRoom('p_declined');
      mgr.joinRoom(room.roomCode, 'p1_human');
      mgr.addBot(room.roomCode, 'bot_alpha', BotPersonality.Aggressive);
      mgr.addBot(room.roomCode, 'bot_beta', BotPersonality.Passive);
      mgr.startGame(room.roomCode);

      // p_declined từ chối mua ô 3 (giá 600, khởi điểm 300) -> AuctionPhase
      room.players[0]!.position = 3;
      room.phase = TurnPhase.ActionPhase;
      mgr.handlePlayerIntent(room.roomCode, 'p_declined', { type: 'INTENT_DECLINE' });

      // bot_beta pass
      mgr.handleAuctionPass(room.roomCode, 'bot_beta');
      // bot_alpha bid 400 -> bot_alpha là highestBidder
      mgr.handleAuctionBid(room.roomCode, 'bot_alpha', 400);

      // p1_human CHƯA PASS. Gọi stepAuctionBot kiểm tra vòng kết thúc
      const stepRes = mgr.stepAuctionBot(room.roomCode);

      // Không được trả về finished: true khi người chơi thật còn cơ hội bid/pass
      expect(stepRes.finished).toBe(false);
      expect(mgr.getRoom(room.roomCode)?.phase).toBe(TurnPhase.AuctionPhase);
    });

    it('[TC-IMP184.02/MSS][UC-GAME-028] (Boundary) stepAuctionBot: Khi không còn bot ứng cử (eligibleBots.length === 0), nhưng người chơi thật vẫn chưa pass, stepAuctionBot trả về { changed: false, finished: false }', () => {
      const room = mgr.createRoom('p_declined');
      mgr.joinRoom(room.roomCode, 'p1_human');
      mgr.addBot(room.roomCode, 'bot_solo', BotPersonality.Passive);
      mgr.startGame(room.roomCode);

      room.players[0]!.position = 3;
      room.phase = TurnPhase.ActionPhase;
      mgr.handlePlayerIntent(room.roomCode, 'p_declined', { type: 'INTENT_DECLINE' });

      // Bot duy nhất pass -> eligibleBots.length === 0
      mgr.handleAuctionPass(room.roomCode, 'bot_solo');

      // Người chơi thật p1_human chưa pass
      const stepRes = mgr.stepAuctionBot(room.roomCode);

      expect(stepRes.changed).toBe(false);
      expect(stepRes.finished).toBe(false);
      expect(mgr.getRoom(room.roomCode)?.phase).toBe(TurnPhase.AuctionPhase);
    });

    it('[TC-IMP184.03/MSS][UC-GAME-028] (Boundary) stepAuctionBot: Chỉ khi TẤT CẢ đối thủ còn lại (bao gồm người chơi thật) đã pass, stepAuctionBot mới gọi handleAuctionClose và trả về { changed: false, finished: true }', () => {
      const room = mgr.createRoom('p_declined');
      mgr.joinRoom(room.roomCode, 'p1_human');
      mgr.addBot(room.roomCode, 'bot_solo', BotPersonality.Passive);
      mgr.startGame(room.roomCode);

      room.players[0]!.position = 3;
      room.phase = TurnPhase.ActionPhase;
      mgr.handlePlayerIntent(room.roomCode, 'p_declined', { type: 'INTENT_DECLINE' });

      // Cả bot và human đều pass
      mgr.handleAuctionPass(room.roomCode, 'bot_solo');
      mgr.handleAuctionPass(room.roomCode, 'p1_human');

      const stepRes = mgr.stepAuctionBot(room.roomCode);

      expect(stepRes.finished).toBe(true);
      expect(stepRes.changed).toBe(false);
      expect(mgr.getRoom(room.roomCode)?.phase).toBe(TurnPhase.PropertyManagement);
    });

    it('[TC-IMP184.04/Adversarial][UC-GAME-028] (Boundary) runBotTurn / isAuctionPhaseStuck loop safety: Khi stepAuctionBot trả về { changed: false, finished: false }, vòng lặp không bị treo vô hạn', () => {
      const room = mgr.createRoom('bot_host');
      mgr.joinRoom(room.roomCode, 'p1_human');
      mgr.startGame(room.roomCode);

      room.players[0]!.position = 3;
      room.phase = TurnPhase.ActionPhase;
      mgr.handlePlayerIntent(room.roomCode, 'bot_host', { type: 'INTENT_DECLINE' });

      // Spy stepAuctionBot mô phỏng trạng thái chưa xong và không thay đổi
      let callCount = 0;
      vi.spyOn(mgr, 'stepAuctionBot').mockImplementation(() => {
        callCount++;
        if (callCount > 35) {
          return { changed: false, finished: true };
        }
        return { changed: false, finished: false };
      });

      // runBotTurn phải tự ngắt vòng lặp an toàn sau tối đa 1 bước nếu không có thay đổi
      runBotTurn(mgr, room.roomCode);

      expect(callCount).toBeLessThanOrEqual(1);
    });
  });

  // =========================================================================
  // FACET 2: REACTIVITY (Turn Orchestrator Pacing & Dual-Timer Synchronization)
  // =========================================================================
  describe('Facet 2: Reactivity (Turn Orchestrator Pacing & Dual-Timer Synchronization)', () => {
    it('[TC-IMP184.05/MSS][UC-GAME-028] (Reactivity) Orchestrator Timer cấp cho người chơi: Khi chỉ còn người chơi thật tham gia đấu giá, Orchestrator cấp đủ 20.000ms (deadline >= 19.000ms), không bị đè bởi 1.000ms', () => {
      const room = mgr.createRoom('p1_human');
      mgr.addBot(room.roomCode, 'bot_1', BotPersonality.Passive);
      mgr.startGame(room.roomCode);

      room.players[0]!.position = 3;
      room.phase = TurnPhase.ActionPhase;
      mgr.handlePlayerIntent(room.roomCode, 'p1_human', { type: 'INTENT_DECLINE' });

      // Bot pass -> chỉ còn human chưa quyết định
      mgr.handleAuctionPass(room.roomCode, 'bot_1');

      // Orchestrator điều phối nhịp đấu giá
      orchestrator.orchestrate(room.roomCode, AUCTION_BOT_STEP_DELAY_MS);

      // Deadline cấp cho người chơi phải đủ thời lượng của TurnPhase.AuctionPhase (20.000ms)
      const remainingSeconds = orchestrator.getTimeRemaining(room.roomCode);
      expect(remainingSeconds).toBeGreaterThanOrEqual(19);
    });

    it('[TC-IMP184.06/MSS][UC-GAME-028] (Reactivity) Bid ở giây thứ 17-19: session.endTime = Date.now() + 20_000, lệnh bid ở Date.now() + 17_000 được chấp nhận thành công, không bị ném AUCTION_EXPIRED', () => {
      vi.useFakeTimers();
      const room = mgr.createRoom('p1_human');
      mgr.joinRoom(room.roomCode, 'p2_human');
      mgr.startGame(room.roomCode);

      room.players[0]!.position = 3; // Ô Hàng Than giá 600, khởi điểm 300
      room.phase = TurnPhase.ActionPhase;
      mgr.handlePlayerIntent(room.roomCode, 'p1_human', { type: 'INTENT_DECLINE' });

      // Tua thời gian 17 giây (trong cửa sổ 20 giây chuẩn)
      vi.advanceTimersByTime(17_000);

      // Người chơi P2 đặt giá 400 Tr
      const bidRes = mgr.handleAuctionBid(room.roomCode, 'p2_human', 400);

      expect(bidRes.success).toBe(true);
      expect(bidRes.reason).toBeUndefined();
      expect(mgr.getAuctionSession(room.roomCode)?.highestBid).toBe(400);
    });

    it('[TC-IMP184.07/MSS][UC-GAME-028] (Reactivity) Pass ở giây thứ 17-19: Người chơi gửi INTENT_AUCTION_PASS ở thời điểm Date.now() + 17_000 được chấp nhận hợp lệ', () => {
      vi.useFakeTimers();
      const room = mgr.createRoom('p1_human');
      mgr.joinRoom(room.roomCode, 'p2_human');
      mgr.startGame(room.roomCode);

      room.players[0]!.position = 3;
      room.phase = TurnPhase.ActionPhase;
      mgr.handlePlayerIntent(room.roomCode, 'p1_human', { type: 'INTENT_DECLINE' });

      vi.advanceTimersByTime(17_000);

      const passRes = mgr.handleAuctionPass(room.roomCode, 'p2_human');

      expect(passRes.success).toBe(true);
      expect(passRes.reason).toBeUndefined();
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
    });

    it('[TC-IMP184.08/MSS][UC-GAME-028] (Reactivity) Bankrupt Entity Exclusion in Auction: Người chơi bị phá sản không được coi là đối thủ chưa pass; khi toàn bộ đối thủ còn sống đã pass, phiên tự đóng ngay lập tức', () => {
      const room = mgr.createRoom('p_declined');
      mgr.joinRoom(room.roomCode, 'p1_human');
      mgr.joinRoom(room.roomCode, 'p2_bankrupt');
      mgr.addBot(room.roomCode, 'bot_1', BotPersonality.Passive);
      mgr.startGame(room.roomCode);

      // Đánh dấu p2_bankrupt đã phá sản
      const p2 = room.players.find((p) => p.id === 'p2_bankrupt')!;
      p2.bankrupt = true;

      room.players[0]!.position = 3;
      room.phase = TurnPhase.ActionPhase;
      mgr.handlePlayerIntent(room.roomCode, 'p_declined', { type: 'INTENT_DECLINE' });

      // bot_1 pass trước
      mgr.handleAuctionPass(room.roomCode, 'bot_1');

      // p1_human bid 400 Tr. Vì p2 đã phá sản, p1 là người sống duy nhất chưa pass -> Phiên đóng ngay
      const bidRes = mgr.handleAuctionBid(room.roomCode, 'p1_human', 400);

      expect(bidRes.success).toBe(true);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      expect(room.lastAuctionResult?.winnerId).toBe('p1_human');
    });

    it('[TC-IMP184.17/Adversarial][UC-GAME-028] (Reactivity) Anti-Sniping Window: Khi người chơi bid ở giây cuối (còn lại <= 3s trong window 20s), session.endTime được gia hạn thêm +3.000ms', () => {
      vi.useFakeTimers();
      const room = mgr.createRoom('p_declined');
      mgr.joinRoom(room.roomCode, 'p1_human');
      mgr.joinRoom(room.roomCode, 'p2_human');
      mgr.startGame(room.roomCode);

      room.players[0]!.position = 3;
      room.phase = TurnPhase.ActionPhase;
      mgr.handlePlayerIntent(room.roomCode, 'p_declined', { type: 'INTENT_DECLINE' });

      // Tua 18s (window 20s -> còn 2s <= 3s)
      vi.advanceTimersByTime(18_000);
      const sessionBefore = mgr.getAuctionSession(room.roomCode);
      const oldEndTime = sessionBefore?.endTime ?? 0;

      mgr.handleAuctionBid(room.roomCode, 'p1_human', 400);

      const sessionAfter = mgr.getAuctionSession(room.roomCode);
      expect(sessionAfter?.endTime).toBeGreaterThanOrEqual(oldEndTime + 3_000);
    });
  });

  // =========================================================================
  // FACET 3: DISPOSAL (Settle & Property Transfer)
  // =========================================================================
  describe('Facet 3: Disposal (Settle & Property Transfer)', () => {
    it('[TC-IMP184.09/MSS][UC-GAME-028] (Disposal) Auction Settle Transfer: Khi giải quyết đấu giá, trừ tiền đúng giá thầu cao nhất của người thắng, chuyển quyền sở hữu ô đất, và phát delta đồng bộ', () => {
      const room = mgr.createRoom('p_declined');
      mgr.joinRoom(room.roomCode, 'p1_winner');
      mgr.startGame(room.roomCode);

      const pWinner = room.players.find((p) => p.id === 'p1_winner')!;
      pWinner.balance = 10_000;

      room.players[0]!.position = 3; // Ô Hàng Than (giá 600, khởi điểm 300)
      room.phase = TurnPhase.ActionPhase;
      mgr.handlePlayerIntent(room.roomCode, 'p_declined', { type: 'INTENT_DECLINE' });

      // p1_winner đặt giá 500 Tr
      mgr.handleAuctionBid(room.roomCode, 'p1_winner', 500);

      // Đóng đấu giá & settle
      mgr.handleAuctionClose(room.roomCode);
      mgr.settleAuction(room.roomCode);
      broadcaster.broadcastRoomDelta(room.roomCode);

      // Điểm tiêu thụ 1: Số dư người thắng bị trừ chính xác 500 Tr (10.000 - 500 = 9.500 Tr)
      expect(pWinner.balance).toBe(9_500);

      // Điểm tiêu thụ 2: Registry cập nhật quyền sở hữu ô đất cho người thắng
      expect(mgr.getRegistry(room.roomCode)?.get(3)).toBe('p1_winner');

      // Điểm tiêu thụ 3: Delta đồng bộ phát ra ghi nhận ô 3 thuộc sở hữu của p1_winner
      const latestMsg = broadcastLogs[broadcastLogs.length - 1]?.payload as { delta?: DeltaPayload; cells?: Array<{ index: number; ownerId?: string | null }> };
      const deltaCells = latestMsg.delta?.cells ?? latestMsg.cells;
      expect(deltaCells?.find((c) => c.index === 3)?.ownerId).toBe('p1_winner');
    });

    it('[TC-IMP184.10/MSS][UC-GAME-028] (Disposal) Clear Auction Settle Timer: Khi phiên đấu giá bị hủy hoặc phòng bị xóa/clear, timer giải quyết đấu giá được dọn dẹp sạch sẽ không rò rỉ', () => {
      const room = mgr.createRoom('p1_human');
      mgr.startGame(room.roomCode);

      orchestrator.scheduleAuctionSettle(room.roomCode);

      const settleTimers = (orchestrator as unknown as { auctionSettleTimers: Map<string, unknown> }).auctionSettleTimers;
      expect(settleTimers.has(room.roomCode)).toBe(true);

      // Dọn dẹp phòng triệt để khi kết thúc / destroy
      orchestrator.destroyRoom(room.roomCode);

      // settleTimer phải được dọn dẹp triệt để không rò rỉ bộ nhớ
      expect(settleTimers.has(room.roomCode)).toBe(false);
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & TELEMETRY CALIBRATION (GO Salary & Movement)
  // =========================================================================
  describe('Facet 4: Error Defense & Telemetry Calibration (GO Salary & Movement)', () => {
    it('[TC-IMP184.11/MSS][UC-GAME-028] (Error Defense) InvariantChecker doubleNextDice: verifyMovementStep chấp nhận bước đi nhân đôi toPos === (fromPos + diceSum * 2) % 40 mà không phát sinh INVALID_POSITION_STEP', () => {
      // Ô 36 di chuyển đôi [3, 3] (sum = 6, x2 = 12): (36 + 12) % 40 = 8 (Đồng Nai)
      const violation = verifyMovementStep({
        fromPosition: 36,
        toPosition: 8,
        dice: [3, 3],
        tick: 10,
        roomStarted: true,
      });

      expect(violation).toBeNull();
    });

    it('[TC-IMP184.12/Adversarial][UC-GAME-028] (Error Defense) InvariantChecker invalid step: verifyMovementStep vẫn phát hiện và báo lỗi khi toPos không khớp cả (from + diceSum) % 40 lẫn (from + diceSum * 2) % 40', () => {
      // Ô 36 với xúc xắc [3, 3] đi tới ô 9 (không khớp ô 2 hay ô 8)
      const violation = verifyMovementStep({
        fromPosition: 36,
        toPosition: 9,
        dice: [3, 3],
        tick: 10,
        roomStarted: true,
      });

      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('INVALID_POSITION_STEP');
      expect(violation?.severity).toBe('CRITICAL');
    });

    it('[TC-IMP184.13/MSS][UC-GAME-028] (Error Defense) Telemetry GO Salary x2 Move: Khi quân cờ di chuyển x2 từ ô 36 đến ô 8 Đồng Nai (xúc xắc [3, 3]), telemetry tính đúng tiền lương GO +2.000 Tr, so sánh với actualDelta = +2000 không vi phạm TREASURY_INVARIANT_VIOLATED', () => {
      const delta: DeltaPayload = {
        tick: 50,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 8,
            balance: 12_000,
          },
        ],
        currentPlayerIndex: 0,
        currentTurnPlayerId: 'p1',
        dice: [3, 3],
        diceRollerId: 'p1',
        diceSeq: 15,
        turnPhase: TurnPhase.ActionPhase,
        roomStarted: true,
      };

      const preState = {
        playersInfo: {
          p1: { id: 'p1', balance: 10_000, ownedProperties: [] as number[], inAudit: false, isBot: false },
        },
        playerPositions: { p1: 36 },
        levelMap: {},
        treasuryPool: 10_000,
        activeModal: null,
        auction: null,
        roundNumber: 1,
      } as unknown as GameState;

      const movement = detectMovement(delta, { p1: 36 });
      const expectedDelta = computeExpectedDelta(delta, preState, movement, 10_000);

      // Di chuyển qua GO được cộng 2.000 Tr tiền lương
      expect(expectedDelta).toBe(2000);

      const violation = verifyTreasuryConservation({
        preBalances: { p1: 10_000 },
        postBalances: { p1: 12_000 },
        preTreasury: 10_000,
        postTreasury: 10_000,
        tick: delta.tick,
        expectedDelta: expectedDelta ?? undefined,
        roomStarted: true,
      });

      expect(violation).toBeNull();
    });

    it('[TC-IMP184.14/MSS][UC-GAME-028] (Error Defense) Telemetry Visiting Jail Via GO: Khi quân cờ di chuyển x2 từ ô 28 đến ô 10 (thăm tù tự do, inAudit: false), lương GO +2.000 Tr vẫn được tính vào expectedMoneyDelta', () => {
      // Từ ô 28 với xúc xắc [5, 6] (sum = 11, x2 = 22): (28 + 22) % 40 = 10. Vượt GO hợp lệ, thăm tù tự do.
      const delta: DeltaPayload = {
        tick: 55,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 10,
            balance: 12_000,
            inAudit: false,
          },
        ],
        currentPlayerIndex: 0,
        currentTurnPlayerId: 'p1',
        dice: [5, 6],
        diceRollerId: 'p1',
        diceSeq: 16,
        turnPhase: TurnPhase.ActionPhase,
        roomStarted: true,
      };

      const preState = {
        playersInfo: {
          p1: { id: 'p1', balance: 10_000, ownedProperties: [] as number[], inAudit: false, isBot: false },
        },
        playerPositions: { p1: 28 },
        levelMap: {},
        treasuryPool: 10_000,
        activeModal: null,
        auction: null,
        roundNumber: 1,
      } as unknown as GameState;

      const movement = detectMovement(delta, { p1: 28 });
      const expectedDelta = computeExpectedDelta(delta, preState, movement, 10_000);

      expect(expectedDelta).toBe(2000);
    });

    it('[TC-IMP184.15/Adversarial][UC-GAME-028] (Error Defense) Telemetry Sent To Jail No GO: Khi quân cờ bị tống giam vào tù (inAudit: true, từ ô 30 đi ô 10), không được tính lương GO (expected GO = 0)', () => {
      // Bị tống giam từ ô 30 sang ô 10 với cờ inAudit: true
      const delta: DeltaPayload = {
        tick: 60,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 10,
            balance: 10_000,
            inAudit: true,
          },
        ],
        currentPlayerIndex: 0,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.PropertyManagement,
        roomStarted: true,
      };

      const preState = {
        playersInfo: {
          p1: { id: 'p1', balance: 10_000, ownedProperties: [] as number[], inAudit: false, isBot: false },
        },
        playerPositions: { p1: 30 },
        levelMap: {},
        treasuryPool: 10_000,
        activeModal: null,
        auction: null,
        roundNumber: 1,
      } as unknown as GameState;

      const movement = detectMovement(delta, { p1: 30 });
      const expectedDelta = computeExpectedDelta(delta, preState, movement, 10_000);

      // Đi tù không được nhận lương GO
      expect(expectedDelta).toBe(0);
    });

    it('[TC-IMP184.16/MSS][UC-GAME-028] (Error Defense) Telemetry Normal Pass GO: Di chuyển thông thường qua ô GO (từ ô 35 đến ô 1 với xúc xắc [3, 3]) ghi nhận không teleport và tính đúng lương GO +2.000 Tr', () => {
      // (35 + 6) % 40 = 1 (Bình Thạnh - Property)
      const delta: DeltaPayload = {
        tick: 65,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 1,
            balance: 12_000,
          },
        ],
        currentPlayerIndex: 0,
        currentTurnPlayerId: 'p1',
        dice: [3, 3],
        diceRollerId: 'p1',
        diceSeq: 17,
        turnPhase: TurnPhase.ActionPhase,
        roomStarted: true,
      };

      const preState = {
        playersInfo: {
          p1: { id: 'p1', balance: 10_000, ownedProperties: [] as number[], inAudit: false, isBot: false },
        },
        playerPositions: { p1: 35 },
        levelMap: {},
        treasuryPool: 10_000,
        activeModal: null,
        auction: null,
        roundNumber: 1,
      } as unknown as GameState;

      const movement = detectMovement(delta, { p1: 35 });
      expect(movement?.isTeleport).toBe(false);

      const expectedDelta = computeExpectedDelta(delta, preState, movement, 10_000);
      expect(expectedDelta).toBe(2000);
    });
  });
});
