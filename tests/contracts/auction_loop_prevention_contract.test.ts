// [IMP-48][CONTRACT] Universal 4-Facet Behavioral Contract: Auction Loop Prevention, Timeout Synchrony & Feed Dedup
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectAuctionActivities } from '../../src/client/network/activity_tracker.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { BotTurnScheduler } from '../../src/server/network/bot_turn_scheduler.js';
import { TurnTimeoutScheduler } from '../../src/server/network/turn_timeout_scheduler.js';

describe('[CONTRACT] IMP-48: Auction Loop Prevention & Activity Feed Dedup', () => {
  beforeEach(() => {
    useActivityStore.getState().clearLogs();
    useGameStore.getState().closeModal();
  });

  // --- FACET 1: BOUNDARY & DEDUPLICATION ---
  describe('Facet 1: Activity Feed Auction Deduplication (Zero False Re-emissions)', () => {
    it('[TC-AUCT-DEDUP-01] Không sinh log trùng khi nhận 2 delta cùng giá và cùng highestBidderId dù activeModal là null', () => {
      const delta1: DeltaPayload = {
        tick: 10,
        cells: [],
        auction: { cellIndex: 11, currentBid: 750, highestBidderId: 'bot_2', timeRemaining: 10 },
      };
      const state = useGameStore.getState();
      expect(state.activeModal).toBeNull();

      const entries1 = detectAuctionActivities(delta1, state);
      expect(entries1).toHaveLength(1);
      expect(entries1[0]!.amount).toBe(-750);

      // Delta 2 đến với cùng auction state nhưng activeModal vẫn là null
      const entries2 = detectAuctionActivities(delta1, state);
      expect(entries2).toHaveLength(0);
    });

    it('[TC-AUCT-DEDUP-02] Sinh đúng 1 log mới khi bước giá tăng lên từ cùng 1 người đặt giá', () => {
      const delta1: DeltaPayload = {
        tick: 10,
        cells: [],
        auction: { cellIndex: 11, currentBid: 750, highestBidderId: 'bot_2', timeRemaining: 10 },
      };
      const delta2: DeltaPayload = {
        tick: 11,
        cells: [],
        auction: { cellIndex: 11, currentBid: 850, highestBidderId: 'bot_2', timeRemaining: 9 },
      };
      const state = useGameStore.getState();

      detectAuctionActivities(delta1, state);
      const entries2 = detectAuctionActivities(delta2, state);

      expect(entries2).toHaveLength(1);
      expect(entries2[0]!.amount).toBe(-850);
    });

    it('[TC-AUCT-DEDUP-03] Sinh đúng 1 log mới khi người dẫn đầu thay đổi sang người khác', () => {
      const delta1: DeltaPayload = {
        tick: 10,
        cells: [],
        auction: { cellIndex: 11, currentBid: 750, highestBidderId: 'bot_2', timeRemaining: 10 },
      };
      const delta2: DeltaPayload = {
        tick: 11,
        cells: [],
        auction: { cellIndex: 11, currentBid: 850, highestBidderId: 'p1', timeRemaining: 9 },
      };
      const state = useGameStore.getState();

      detectAuctionActivities(delta1, state);
      const entries2 = detectAuctionActivities(delta2, state);

      expect(entries2).toHaveLength(1);
      expect(entries2[0]!.playerId).toBe('p1');
    });

    it('[TC-AUCT-DEDUP-04] Sinh đúng 1 log mới khi chuyển sang phiên đấu giá ô đất khác', () => {
      const delta1: DeltaPayload = {
        tick: 10,
        cells: [],
        auction: { cellIndex: 11, currentBid: 750, highestBidderId: 'bot_2', timeRemaining: 10 },
      };
      const delta2: DeltaPayload = {
        tick: 20,
        cells: [],
        auction: { cellIndex: 15, currentBid: 750, highestBidderId: 'bot_2', timeRemaining: 15 },
      };
      const state = useGameStore.getState();

      detectAuctionActivities(delta1, state);
      const entries2 = detectAuctionActivities(delta2, state);

      expect(entries2).toHaveLength(1);
      expect(entries2[0]!.cellIndex).toBe(15);
    });
  });

  // --- FACET 2: STATE REACTIVITY & ELIGIBLE AUCTION BOTS ---
  describe('Facet 2: Eligible Auction Bot Discrimination', () => {
    it('[TC-AUCT-ELIG-01] Bot đã là highestBidder không được coi là bot hợp lệ cần gọi scheduleBotTurn', () => {
      const rooms = new RoomManager(1234);
      const room = rooms.createRoom('p1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.addBot(room.roomCode, 'bot_3');
      rooms.startGame(room.roomCode);

      // bot_3 dẫm ô 11 và decline
      room.currentPlayerIndex = 2;
      room.players[2]!.position = 11;
      room.phase = TurnPhase.ActionPhase;
      rooms.handleDecline(room.roomCode, 'bot_3');
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      // bot_2 đặt giá 750 Tr -> bot_2 là highestBidder
      rooms.handleAuctionBid(room.roomCode, 'bot_2', 750);
      expect(room.currentAuction?.highestBidder).toBe('bot_2');

      // bot_3 là declinedPlayerId, bot_2 là highestBidder
      // Kiểm tra trong scheduler: không còn bot nào khác có thể bid
      const hasOtherBot = room.players.some(
        (p) =>
          p.isBot &&
          !p.bankrupt &&
          p.id !== room.currentAuction?.declinedPlayerId &&
          p.id !== room.currentAuction?.highestBidder &&
          !room.currentAuction?.passedPlayers?.has(p.id),
      );
      expect(hasOtherBot).toBe(false);
    });

    it('[TC-AUCT-ELIG-02] Bot chưa là highestBidder và chưa pass được coi là bot hợp lệ để bid', () => {
      const rooms = new RoomManager(1234);
      const room = rooms.createRoom('p1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.addBot(room.roomCode, 'bot_3');
      rooms.startGame(room.roomCode);

      room.currentPlayerIndex = 2;
      room.players[2]!.position = 11;
      room.phase = TurnPhase.ActionPhase;
      rooms.handleDecline(room.roomCode, 'bot_3');

      // Ban đầu chưa ai bid, bot_2 hợp lệ để bid
      const canBot2Bid = room.players.some(
        (p) =>
          p.isBot &&
          !p.bankrupt &&
          p.id !== room.currentAuction?.declinedPlayerId &&
          p.id !== room.currentAuction?.highestBidder &&
          !room.currentAuction?.passedPlayers?.has(p.id),
      );
      expect(canBot2Bid).toBe(true);
    });

    it('[TC-AUCT-ELIG-03] Bot đã pass không được coi là bot hợp lệ', () => {
      const rooms = new RoomManager(1234);
      const room = rooms.createRoom('p1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.addBot(room.roomCode, 'bot_3');
      rooms.startGame(room.roomCode);

      room.currentPlayerIndex = 0;
      room.players[0]!.position = 1;
      room.phase = TurnPhase.ActionPhase;
      rooms.handleDecline(room.roomCode, 'p1');

      rooms.handleAuctionPass(room.roomCode, 'bot_2');
      const canBot2Bid = room.players.some(
        (p) =>
          p.id === 'bot_2' &&
          p.isBot &&
          !p.bankrupt &&
          p.id !== room.currentAuction?.declinedPlayerId &&
          p.id !== room.currentAuction?.highestBidder &&
          !room.currentAuction?.passedPlayers?.has(p.id),
      );
      expect(canBot2Bid).toBe(false);
    });

    it('[TC-AUCT-ELIG-04] Người từ chối mua (declinedPlayerId) bị loại khỏi danh sách bot hợp lệ', () => {
      const rooms = new RoomManager(1234);
      const room = rooms.createRoom('p1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);

      room.currentPlayerIndex = 1;
      room.players[1]!.position = 1;
      room.phase = TurnPhase.ActionPhase;
      rooms.handleDecline(room.roomCode, 'bot_2');

      const isBot2Eligible = room.players.some(
        (p) =>
          p.isBot &&
          !p.bankrupt &&
          p.id !== room.currentAuction?.declinedPlayerId &&
          p.id !== room.currentAuction?.highestBidder &&
          !room.currentAuction?.passedPlayers?.has(p.id),
      );
      expect(isBot2Eligible).toBe(false);
    });
  });

  // --- FACET 3: RESOURCE DISPOSAL & TIMEOUT CLOSURE ---
  describe('Facet 3: Server Auction Timeout & Bot Turn Progression', () => {
    it('[TC-AUCT-TIMEO-01] Vào AuctionPhase từ lượt Bot bắt buộc thiết lập deadline timeout trên server', () => {
      const rooms = new RoomManager(1234);
      const room = rooms.createRoom('p1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);

      const intentMutex: any = { runExclusive: (_rc: any, fn: any) => fn() };
      const broadcaster: any = { broadcastRoomDelta: vi.fn(), setTimeRemainingProvider: vi.fn() };

      const timeoutScheduler = new TurnTimeoutScheduler({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: vi.fn(),
        onScheduleBotTurn: vi.fn(),
        defaultTimeoutMs: 15_000,
      });

      room.currentPlayerIndex = 1;
      room.players[1]!.position = 1;
      room.phase = TurnPhase.ActionPhase;
      rooms.handleDecline(room.roomCode, 'bot_2');
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      timeoutScheduler.scheduleTurnTimeout(room.roomCode);
      const remaining = timeoutScheduler.getTimeRemaining(room.roomCode);

      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(15);
      timeoutScheduler.clearTimeout(room.roomCode);
    });

    it('[TC-AUCT-TIMEO-02] Khi timeout 15s đấu giá kích hoạt, handleAuctionClose tự động đóng sàn', async () => {
      vi.useFakeTimers();
      try {
        const rooms = new RoomManager(1234);
        const room = rooms.createRoom('p1');
        rooms.addBot(room.roomCode, 'bot_2');
        rooms.startGame(room.roomCode);

        const intentMutex: any = { runExclusive: async (_rc: any, fn: any) => await fn() };
        const broadcaster: any = { broadcastRoomDelta: vi.fn(), setTimeRemainingProvider: vi.fn() };

        const timeoutScheduler = new TurnTimeoutScheduler({
          rooms,
          intentMutex,
          broadcaster,
          onGameOver: vi.fn(),
          onScheduleBotTurn: vi.fn(),
          defaultTimeoutMs: 15_000,
        });

        room.currentPlayerIndex = 0;
        room.players[0]!.position = 1;
        room.phase = TurnPhase.ActionPhase;
        rooms.handleDecline(room.roomCode, 'p1');
        rooms.handleAuctionBid(room.roomCode, 'bot_2', 150);

        timeoutScheduler.scheduleTurnTimeout(room.roomCode);
        expect(room.phase).toBe(TurnPhase.AuctionPhase);

        // Chạy hết 15s timeout
        await vi.advanceTimersByTimeAsync(15_100);

        expect(room.phase).not.toBe(TurnPhase.AuctionPhase);
        expect(room.currentAuction).toBeUndefined();
      } finally {
        vi.useRealTimers();
      }
    });

    it('[TC-AUCT-TIMEO-03] Khi phiên đấu giá đóng sau timeout, nếu lượt hiện tại là Bot thì tự động kết thúc lượt', async () => {
      vi.useFakeTimers();
      try {
        const rooms = new RoomManager(1234);
        const room = rooms.createRoom('p1');
        rooms.addBot(room.roomCode, 'bot_2');
        rooms.startGame(room.roomCode);

        // bot_2 là người chơi hiện tại (currentPlayerIndex = 1)
        room.currentPlayerIndex = 1;
        room.players[1]!.position = 1;
        room.phase = TurnPhase.ActionPhase;
        rooms.handleDecline(room.roomCode, 'bot_2');
        expect(room.phase).toBe(TurnPhase.AuctionPhase);

        const intentMutex: any = { runExclusive: async (_rc: any, fn: any) => await fn() };
        const broadcaster: any = { broadcastRoomDelta: vi.fn(), setTimeRemainingProvider: vi.fn() };

        let botScheduled = false;
        const timeoutScheduler = new TurnTimeoutScheduler({
          rooms,
          intentMutex,
          broadcaster,
          onGameOver: vi.fn(),
          onScheduleBotTurn: () => { botScheduled = true; },
          defaultTimeoutMs: 15_000,
        });

        timeoutScheduler.scheduleTurnTimeout(room.roomCode);
        await vi.advanceTimersByTimeAsync(15_100);

        // Sàn đóng, lượt chơi chuyển sang người kế tiếp (p1, index 0)
        expect(room.phase).not.toBe(TurnPhase.AuctionPhase);
        expect(room.currentPlayerIndex).toBe(0);
      } finally {
        vi.useRealTimers();
      }
    });

    it('[TC-AUCT-TIMEO-04] BotTurnScheduler không lặp lại vô hạn khi Bot duy nhất còn lại đã là highestBidder', async () => {
      vi.useFakeTimers();
      try {
        const rooms = new RoomManager(1234);
        const room = rooms.createRoom('p1');
        rooms.addBot(room.roomCode, 'bot_2');
        rooms.addBot(room.roomCode, 'bot_3');
        rooms.startGame(room.roomCode);

        // bot_3 dẫm ô 11 và decline
        room.currentPlayerIndex = 2;
        room.players[2]!.position = 11;
        room.phase = TurnPhase.ActionPhase;
        rooms.handleDecline(room.roomCode, 'bot_3');

        // bot_2 đặt giá 750 Tr -> bot_2 là highestBidder
        rooms.handleAuctionBid(room.roomCode, 'bot_2', 750);
        expect(room.currentAuction?.highestBidder).toBe('bot_2');

        const intentMutex: any = { runExclusive: async (_rc: any, fn: any) => await fn() };
        const broadcaster: any = { broadcastRoomDelta: vi.fn(), setTimeRemainingProvider: vi.fn() };

        let timeoutCalled = false;
        const botScheduler = new BotTurnScheduler({
          rooms,
          intentMutex,
          broadcaster,
          onGameOver: vi.fn(),
          onScheduleTurnTimeout: () => { timeoutCalled = true; },
          botTurnDelayMs: 100,
        });

        botScheduler.scheduleBotTurn(room.roomCode);
        await vi.advanceTimersByTimeAsync(150);

        // bot_2 đã là highestBidder nên không được tiếp tục loop bot turn, mà phải gọi timeout scheduler
        expect(timeoutCalled).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  // --- FACET 4: ERROR DEFENSE & MODAL SYNCHRONY ---
  describe('Facet 4: Error Defense & Delta Cleardown', () => {
    it('[TC-AUCT-DEF-01] Delta có auction: null reset sạch sẽ cache khử lặp đấu giá trong activity tracker', () => {
      const delta1: DeltaPayload = {
        tick: 10,
        cells: [],
        auction: { cellIndex: 11, currentBid: 750, highestBidderId: 'bot_2', timeRemaining: 10 },
      };
      const deltaNull: DeltaPayload = {
        tick: 15,
        cells: [],
        auction: null,
      };
      const state = useGameStore.getState();

      detectAuctionActivities(delta1, state);
      detectAuctionActivities(deltaNull, state);

      // Khi có phiên đấu giá mới ở ô khác hoặc cùng ô, log được phép ghi nhận lại
      const entriesNew = detectAuctionActivities(delta1, state);
      expect(entriesNew).toHaveLength(1);
    });

    it('[TC-AUCT-DEF-02] Delta không có trường auction không làm xóa cache khử lặp đấu giá', () => {
      const delta1: DeltaPayload = {
        tick: 10,
        cells: [],
        auction: { cellIndex: 11, currentBid: 750, highestBidderId: 'bot_2', timeRemaining: 10 },
      };
      const deltaUnrelated: DeltaPayload = {
        tick: 11,
        cells: [],
        players: [],
      };
      const state = useGameStore.getState();

      detectAuctionActivities(delta1, state);
      detectAuctionActivities(deltaUnrelated, state);

      // Delta 1 gửi lại vẫn bị chặn trùng lặp
      const entriesDup = detectAuctionActivities(delta1, state);
      expect(entriesDup).toHaveLength(0);
    });

    it('[TC-AUCT-DEF-03] Khi delta.auction thiếu highestBidderId thì không tạo activity log', () => {
      const deltaNoBidder: DeltaPayload = {
        tick: 10,
        cells: [],
        auction: { cellIndex: 11, currentBid: 700, highestBidderId: null, timeRemaining: 15 },
      };
      const state = useGameStore.getState();
      const entries = detectAuctionActivities(deltaNoBidder, state);
      expect(entries).toHaveLength(0);
    });

    it('[TC-AUCT-DEF-04] Activity Store lưu log không vượt quá dung lượng trần FIFO 50 sự kiện', () => {
      const store = useActivityStore.getState();
      for (let i = 0; i < 60; i++) {
        store.addActivityLog({
          id: `test_${i}`,
          timestamp: Date.now() + i,
          type: 'auction',
          message: `Đặt giá #${i}`,
          amount: -100,
        });
      }
      expect(useActivityStore.getState().activityLogs.length).toBeLessThanOrEqual(50);
    });
  });
});
