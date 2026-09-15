// [IMP-50][UC-GAME-008/MSS] TurnOrchestrator & TurnWatchdog Contract Tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { SessionManager } from '../../src/server/session_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { TurnOrchestrator } from '../../src/server/network/turn_orchestrator.js';
import { TurnWatchdog } from '../../src/server/network/turn_watchdog.js';
import { BotTurnScheduler } from '../../src/server/network/bot_turn_scheduler.js';
import { TurnTimeoutScheduler } from '../../src/server/network/turn_timeout_scheduler.js';

describe('[IMP-50] Unified TurnOrchestrator & TurnWatchdog Contracts', () => {
  let rooms: RoomManager;
  let sessions: SessionManager;
  let intentMutex: IntentMutex;
  let broadcaster: DeltaBroadcaster;
  let broadcastCalls: Array<{ rc: string; msg: any }>;
  let gameOverCalls: string[];

  beforeEach(() => {
    rooms = new RoomManager(1234);
    sessions = new SessionManager();
    intentMutex = new IntentMutex();
    broadcastCalls = [];
    gameOverCalls = [];
    broadcaster = new DeltaBroadcaster(rooms, sessions, (rc, msg) => {
      broadcastCalls.push({ rc, msg });
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Trụ Cột 1: TurnOrchestrator', () => {
    it('Lập lịch lượt chơi cho Bot khi người chơi hiện tại là Bot AI', async () => {
      vi.useFakeTimers();
      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: (rc) => gameOverCalls.push(rc),
        botTurnDelayMs: 200,
      });

      const room = rooms.createRoom('bot_1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);
      room.players[0]!.isBot = true;

      orchestrator.orchestrate(room.roomCode);

      // Trước 200ms: chưa đổ xúc xắc
      expect(room.players[0]!.position).toBe(0);

      // Tua 250ms
      await vi.advanceTimersByTimeAsync(250);

      // Sau 250ms: bot_1 đã thực hiện lượt chơi (gieo xúc xắc / di chuyển)
      expect(room.players[0]!.position).toBeGreaterThanOrEqual(0);
      expect(broadcastCalls.length).toBeGreaterThan(0);
      orchestrator.clearRoom(room.roomCode);
      vi.useRealTimers();
    });

    it('Lập lịch Timeout cho Human khi người chơi hiện tại là Người (Human)', async () => {
      vi.useFakeTimers();
      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: (rc) => gameOverCalls.push(rc),
        defaultTimeoutMs: 15_000,
      });

      const room = rooms.createRoom('p1_human');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);

      room.phase = TurnPhase.WaitingRoll;
      orchestrator.orchestrate(room.roomCode, 15_000);

      const remaining = orchestrator.getTimeRemaining(room.roomCode);
      expect(remaining).toBeGreaterThan(10);

      // Tua 16_000ms để hết hạn AFK
      await vi.advanceTimersByTimeAsync(16_000);

      // Máy chủ tự động đổ xúc xắc giải cứu lượt
      expect(room.phase !== TurnPhase.WaitingRoll || room.currentPlayerIndex !== 0).toBe(true);
      orchestrator.clearRoom(room.roomCode);
      vi.useRealTimers();
    });

    it('Trong AuctionPhase: nếu có Bot hợp lệ thì ưu tiên lượt Bot, nếu hết Bot thì kích hoạt timeout 15s', async () => {
      vi.useFakeTimers();
      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: (rc) => gameOverCalls.push(rc),
        botTurnDelayMs: 100,
      });

      const room = rooms.createRoom('p1_human');
      rooms.joinRoom(room.roomCode, 'p2_human');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);

      room.players[0]!.position = 1;
      room.phase = TurnPhase.ActionPhase;
      rooms.handleDecline(room.roomCode, 'p1_human');
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      // bot_2 chưa bid/pass -> orchestrate sẽ kích hoạt bot bid
      orchestrator.orchestrate(room.roomCode);
      await vi.advanceTimersByTimeAsync(150);

      // bot_2 đã tham gia hoặc pass
      expect(room.currentAuction?.highestBidder === 'bot_2' || Boolean(room.currentAuction?.passedPlayers?.has('bot_2'))).toBe(true);

      // Bây giờ bot_2 là highestBidder -> không còn bot nào khác cần bid -> orchestrate chạy timeout 20s (AuctionPhase normalized)
      orchestrator.orchestrate(room.roomCode);
      const remaining = orchestrator.getTimeRemaining(room.roomCode);
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(20);

      orchestrator.clearRoom(room.roomCode);
      vi.useRealTimers();
    });

    it('Tự động gọi handleEndTurn cho Bot sau khi phiên đấu giá đóng nếu lượt hiện tại là Bot', async () => {
      vi.useFakeTimers();
      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: (rc) => gameOverCalls.push(rc),
      });

      const room = rooms.createRoom('p1_human');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);

      // Chuyển lượt sang bot_2
      room.currentPlayerIndex = 1;
      room.players[1]!.position = 1;
      room.phase = TurnPhase.ActionPhase;
      rooms.handleDecline(room.roomCode, 'bot_2');
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      // Cả 2 đều pass hoặc hết giờ đóng phiên
      orchestrator.orchestrate(room.roomCode, 15_000);
      await vi.advanceTimersByTimeAsync(16_000);

      // Đấu giá đã đóng, và vì lượt là của bot_2 nên bot_2 tự động kết thúc lượt -> chuyển sang p1
      expect(room.phase).not.toBe(TurnPhase.AuctionPhase);
      expect(room.currentPlayerIndex).toBe(0);

      orchestrator.clearRoom(room.roomCode);
      vi.useRealTimers();
    });

    it('Khởi tạo Adapter BotTurnScheduler và TurnTimeoutScheduler dùng chung thể hiện TurnOrchestrator duy nhất', () => {
      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: vi.fn(),
      });

      const botAdapter = new BotTurnScheduler(orchestrator);
      const timeoutAdapter = new TurnTimeoutScheduler(orchestrator);

      expect((botAdapter as any).orchestrator).toBe(orchestrator);
      expect((timeoutAdapter as any).orchestrator).toBe(orchestrator);
    });
  });

  describe('Trụ Cột 4: TurnWatchdog Fail-Safe Auto-Recovery', () => {
    it('Phát hiện và tự động giải cứu khi lượt chơi bị treo quá 45 giây', async () => {
      vi.useFakeTimers();
      const emergencyCalls: string[] = [];
      const nextTurnCalls: string[] = [];

      const watchdog = new TurnWatchdog({
        rooms,
        intentMutex,
        broadcaster,
        maxTurnStallMs: 45_000,
        checkIntervalMs: 5_000,
        onEmergencyRecovery: (rc, reason) => emergencyCalls.push(`${rc}:${reason}`),
        onGameOver: (rc) => gameOverCalls.push(rc),
        onScheduleNextTurn: (rc) => nextTurnCalls.push(rc),
      });

      const room = rooms.createRoom('p1_human');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);
      room.phase = TurnPhase.PropertyManagement;

      watchdog.start();
      watchdog.notifyTurnStart(room.roomCode);

      // Tua 30s: chưa chạm 45s
      await vi.advanceTimersByTimeAsync(30_000);
      expect(emergencyCalls.length).toBe(0);

      // Tua thêm 20s (tổng 50s > 45s)
      await vi.advanceTimersByTimeAsync(20_000);

      // Watchdog đã phát hiện và cưỡng chế kết thúc lượt tại PropertyManagement
      expect(emergencyCalls.length).toBe(1);
      expect(room.currentPlayerIndex).toBe(1);
      expect(room.phase).toBe(TurnPhase.WaitingRoll);
      expect(nextTurnCalls.length).toBeGreaterThan(0);

      watchdog.stop();
      vi.useRealTimers();
    });

    it('Tự động đóng sàn đấu giá phát mãi khi phiên đấu giá bị kẹt quá 45 giây', async () => {
      vi.useFakeTimers();
      const emergencyCalls: string[] = [];

      const watchdog = new TurnWatchdog({
        rooms,
        intentMutex,
        broadcaster,
        maxTurnStallMs: 45_000,
        checkIntervalMs: 5_000,
        onEmergencyRecovery: (rc, reason) => emergencyCalls.push(`${rc}:${reason}`),
        onGameOver: (rc) => gameOverCalls.push(rc),
        onScheduleNextTurn: vi.fn(),
      });

      const room = rooms.createRoom('p1_human');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);

      room.players[0]!.position = 1;
      room.phase = TurnPhase.ActionPhase;
      rooms.handleDecline(room.roomCode, 'p1_human');
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      watchdog.start();
      watchdog.notifyTurnStart(room.roomCode);

      // Giả lập kẹt 50 giây trong AuctionPhase
      await vi.advanceTimersByTimeAsync(50_000);

      // Đấu giá đã bị đóng cưỡng chế
      expect(emergencyCalls.length).toBe(1);
      expect(room.phase).not.toBe(TurnPhase.AuctionPhase);
      expect(room.currentAuction).toBeUndefined();

      watchdog.stop();
      vi.useRealTimers();
    });

    it('Tự động cưỡng chế chuyển lượt dứt điểm khi bị kẹt ở WaitingRoll quá 45 giây', async () => {
      vi.useFakeTimers();
      const emergencyCalls: string[] = [];

      const watchdog = new TurnWatchdog({
        rooms,
        intentMutex,
        broadcaster,
        maxTurnStallMs: 45_000,
        checkIntervalMs: 5_000,
        onEmergencyRecovery: (rc, reason) => emergencyCalls.push(`${rc}:${reason}`),
        onGameOver: vi.fn(),
        onScheduleNextTurn: vi.fn(),
      });

      const room = rooms.createRoom('p1_human');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);
      room.phase = TurnPhase.WaitingRoll;

      watchdog.start();
      watchdog.notifyTurnStart(room.roomCode);

      await vi.advanceTimersByTimeAsync(50_000);

      // Đã giải cứu dứt điểm: lượt chuyển sang bot_2 (index 1)
      expect(emergencyCalls.length).toBe(1);
      expect(room.currentPlayerIndex).toBe(1);
      expect(room.phase).toBe(TurnPhase.WaitingRoll);

      watchdog.stop();
      vi.useRealTimers();
    });
  });
});
