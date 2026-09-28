// [TC-215.01/MSS..TC-215.16/MSS][UC-IMP215]
// Contract Test Suite: IMP-215 Turn Timer SSOT Deadline and TopBar Zero Freeze
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Server Bot Deadline & Monotonic TimeRemaining ([TC-215.01] - [TC-215.04])
// Facet 2: Client Delta Non-Zero Fallback Guard ([TC-215.05] - [TC-215.08])
// Facet 3: TopBar Rendering & Non-Freeze Contract ([TC-215.09] - [TC-215.11])
// Facet 4: AFK Recovery & Audit Grace Buffer ([TC-215.12] - [TC-215.14])
// Facet 5: Multi-Turn Lifecycle Handoff ([TC-215.15] - [TC-215.16])

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TurnPhase, type Player, type Room } from '../../src/domain/room.js';
import { TurnOrchestrator } from '../../src/server/network/turn_orchestrator.js';
import { executeSafeAfkAction } from '../../src/server/network/afk_recovery.js';
import { applyDelta } from '../../src/client/network/apply_delta.js';
import { TopBar } from '../../src/client/ui/top_bar.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

// --- Fixtures & Domain Test Helpers ---
function createMockPlayer(overrides?: Partial<Player>): Player {
  return {
    id: overrides?.id ?? 'player_alpha',
    name: overrides?.name ?? 'Nguyễn Văn Phát',
    balance: overrides?.balance ?? 15_000,
    position: overrides?.position ?? 0,
    isBot: overrides?.isBot ?? false,
    bankrupt: overrides?.bankrupt ?? false,
    inAudit: overrides?.inAudit ?? false,
    auditTurnsLeft: overrides?.auditTurnsLeft ?? 0,
    overdraftRoundsLeft: overrides?.overdraftRoundsLeft ?? 0,
    skipNextTurn: overrides?.skipNextTurn ?? false,
    consecutiveDoubles: overrides?.consecutiveDoubles ?? 0,
    hand: overrides?.hand ?? [],
    pendingDebts: overrides?.pendingDebts ?? [],
    extraTurns: overrides?.extraTurns ?? 0,
    doubleNextDice: overrides?.doubleNextDice ?? false,
    mortgagedProperties: overrides?.mortgagedProperties ?? [],
    ...overrides,
  };
}

function createMockRoom(players: Player[], overrides?: Partial<Room>): Room {
  return {
    roomCode: overrides?.roomCode ?? 'ROOM_IMP215',
    hostId: players[0]?.id ?? 'player_alpha',
    players,
    phase: overrides?.phase ?? TurnPhase.WaitingRoll,
    currentPlayerIndex: overrides?.currentPlayerIndex ?? 0,
    round: overrides?.round ?? 12,
    roundCount: overrides?.roundCount ?? 12,
    started: overrides?.started ?? true,
    activeModifiers: overrides?.activeModifiers ?? [],
    treasury: overrides?.treasury ?? 5_000,
    marketDeck: overrides?.marketDeck ?? [],
    marketDiscard: overrides?.marketDiscard ?? [],
    chanceDeck: overrides?.chanceDeck ?? [],
    chanceDiscard: overrides?.chanceDiscard ?? [],
    permanentRentBonus: overrides?.permanentRentBonus ?? {},
    ...overrides,
  };
}

describe('[CONTRACT] IMP-215: Turn Timer SSOT Deadline and TopBar Zero Freeze', () => {
  beforeEach(() => {
    vi.useRealTimers();
    useTelemetryStore.getState().reset();
    useLobbyStore.setState({ myPlayerId: 'player_alpha' });
    useGameStore.setState({
      roundNumber: 12,
      maxRounds: 40,
      currentTurnPlayerId: 'player_alpha',
      turnTimeRemaining: 45,
      turnPhase: TurnPhase.WaitingRoll,
      lastDiceSeq: 0,
      auction: null,
      pendingTradeOffer: null,
      pendingBuyout: null,
      playersInfo: {
        player_alpha: {
          id: 'player_alpha',
          name: 'Nguyễn Văn Phát',
          balance: 15_000,
          position: 0,
          isBot: false,
          bankrupt: false,
        } as any,
        bot_ai_4: {
          id: 'bot_ai_4',
          name: 'Bot AI 4',
          balance: 12_000,
          position: 6,
          isBot: true,
          bankrupt: false,
        } as any,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // =========================================================================
  // FACET 1: Server Bot Deadline & Monotonic TimeRemaining ([TC-215.01] - [TC-215.04])
  // =========================================================================
  describe('Facet 1: Server Bot Deadline & Monotonic TimeRemaining', () => {
    it('[TC-215.01/MSS][UC-IMP215] orchestrate() khi current.isBot === true thiết lập deadline hợp lệ trong deadlines (> 0)', () => {
      const bot = createMockPlayer({ id: 'bot_ai_4', isBot: true });
      const room = createMockRoom([bot], { phase: TurnPhase.WaitingRoll, currentPlayerIndex: 0 });
      const mockRooms: any = {
        getRoom: vi.fn().mockReturnValue(room),
        clearRoomTimers: vi.fn(),
        registerTimer: vi.fn(),
      };
      const orchestrator = new TurnOrchestrator({
        rooms: mockRooms,
        intentMutex: { runExclusive: vi.fn() } as any,
        broadcaster: { broadcastRoomDelta: vi.fn() } as any,
        onGameOver: vi.fn(),
      });

      orchestrator.orchestrate(room.roomCode);

      // SSOT Invariant 1: Bot turn must establish positive timeRemaining (25s)
      expect(orchestrator.getTimeRemaining(room.roomCode)).toBe(25);
    });

    it('[TC-215.02/MSS][UC-IMP215] getTimeRemaining() trả về >= 1 (25s - 35s) trong lượt Bot khi ở ActionPhase', () => {
      const bot = createMockPlayer({ id: 'bot_ai_4', isBot: true });
      const room = createMockRoom([bot], { phase: TurnPhase.ActionPhase, currentPlayerIndex: 0 });
      const mockRooms: any = {
        getRoom: vi.fn().mockReturnValue(room),
        clearRoomTimers: vi.fn(),
        registerTimer: vi.fn(),
      };
      const orchestrator = new TurnOrchestrator({
        rooms: mockRooms,
        intentMutex: { runExclusive: vi.fn() } as any,
        broadcaster: { broadcastRoomDelta: vi.fn() } as any,
        onGameOver: vi.fn(),
      });

      orchestrator.orchestrate(room.roomCode);

      // In ActionPhase, Bot deadline is 35s
      expect(orchestrator.getTimeRemaining(room.roomCode)).toBe(35);
    });

    it('[TC-215.03/MSS][UC-IMP215] Sau khi Bot bước 1 bước, orchestrate chạy trước broadcastRoomDelta bảo đảm delta phát ra chứa timeRemaining > 0', async () => {
      vi.useFakeTimers();
      const bot = createMockPlayer({ id: 'bot_ai_4', isBot: true });
      const room = createMockRoom([bot], { phase: TurnPhase.WaitingRoll, currentPlayerIndex: 0 });
      let timeRemainingAtBroadcast: number | undefined;

      const mockBroadcaster: any = {
        broadcastRoomDelta: vi.fn().mockImplementation((rc: string) => {
          timeRemainingAtBroadcast = orchestrator.getTimeRemaining(rc);
        }),
      };
      const mockRooms: any = {
        getRoom: vi.fn().mockReturnValue(room),
        clearRoomTimers: vi.fn(),
        registerTimer: vi.fn(),
        stepBotTurn: vi.fn().mockImplementation(() => {
          room.phase = TurnPhase.PropertyManagement;
        }),
      };
      const orchestrator = new TurnOrchestrator({
        rooms: mockRooms,
        intentMutex: {
          runExclusive: vi.fn().mockImplementation(async (_rc, fn) => fn()),
        } as any,
        broadcaster: mockBroadcaster,
        onGameOver: vi.fn(),
        botTurnDelayMs: 500,
      });

      orchestrator.orchestrate(room.roomCode);
      await vi.advanceTimersByTimeAsync(600);

      // At point of broadcast, timeRemaining must already be computed and positive
      expect(mockBroadcaster.broadcastRoomDelta).toHaveBeenCalledWith(room.roomCode);
      expect(timeRemainingAtBroadcast).toBeGreaterThan(0);
    });

    it('[TC-215.03B/MSS][UC-IMP215] Khi Bot đấu giá xong (stepAuctionBot.finished === true), deadline tạm cho giai đoạn settle được thiết lập trước broadcastRoomDelta (timeRemaining >= 2)', async () => {
      vi.useFakeTimers();
      const bot = createMockPlayer({ id: 'bot_ai_4', isBot: true });
      const room = createMockRoom([bot], {
        phase: TurnPhase.AuctionPhase,
        currentPlayerIndex: 0,
        currentAuction: { propertyIndex: 1, currentBid: 500, passedPlayers: new Set() } as any,
      });
      let timeRemainingAtBroadcast: number | undefined;

      const mockBroadcaster: any = {
        broadcastRoomDelta: vi.fn().mockImplementation((rc: string) => {
          timeRemainingAtBroadcast = orchestrator.getTimeRemaining(rc);
        }),
      };
      const mockRooms: any = {
        getRoom: vi.fn().mockReturnValue(room),
        clearRoomTimers: vi.fn(),
        registerTimer: vi.fn(),
        getAuctionSession: vi.fn().mockReturnValue(room.currentAuction),
        getLastAuctionResult: vi.fn().mockReturnValue(undefined),
        settleAuction: vi.fn(),
        stepAuctionBot: vi.fn().mockReturnValue({ changed: true, finished: true }),
      };
      const orchestrator = new TurnOrchestrator({
        rooms: mockRooms,
        intentMutex: {
          runExclusive: vi.fn().mockImplementation(async (_rc, fn) => fn()),
        } as any,
        broadcaster: mockBroadcaster,
        onGameOver: vi.fn(),
        botTurnDelayMs: 500,
      });

      orchestrator.orchestrate(room.roomCode);
      await vi.advanceTimersByTimeAsync(600);

      expect(mockBroadcaster.broadcastRoomDelta).toHaveBeenCalledWith(room.roomCode);
      // Invariant: timeRemaining at auction-finished broadcast MUST be positive (~3s for settle phase), NEVER 0
      expect(timeRemainingAtBroadcast).toBeGreaterThanOrEqual(2);
    });

    it('[TC-215.04/MSS][UC-IMP215] Thứ tự thực thi bảo đảm orchestrate được gọi trước broadcastRoomDelta trong chu kỳ Bot', async () => {
      vi.useFakeTimers();
      const bot = createMockPlayer({ id: 'bot_ai_4', isBot: true });
      const room = createMockRoom([bot], { phase: TurnPhase.WaitingRoll, currentPlayerIndex: 0 });
      const callSequence: string[] = [];

      const mockBroadcaster: any = {
        broadcastRoomDelta: vi.fn().mockImplementation(() => {
          callSequence.push('broadcastRoomDelta');
        }),
      };
      const mockRooms: any = {
        getRoom: vi.fn().mockReturnValue(room),
        clearRoomTimers: vi.fn(),
        registerTimer: vi.fn(),
        stepBotTurn: vi.fn(),
      };
      const orchestrator = new TurnOrchestrator({
        rooms: mockRooms,
        intentMutex: {
          runExclusive: vi.fn().mockImplementation(async (_rc, fn) => fn()),
        } as any,
        broadcaster: mockBroadcaster,
        onGameOver: vi.fn(),
        botTurnDelayMs: 500,
      });

      const orchestrateSpy = vi.spyOn(orchestrator, 'orchestrate');
      orchestrator.orchestrate(room.roomCode);
      callSequence.length = 0; // Clear initial call

      orchestrateSpy.mockImplementation(() => {
        callSequence.push('orchestrate');
      });

      await vi.advanceTimersByTimeAsync(600);

      // Must be: ['orchestrate', 'broadcastRoomDelta']
      expect(callSequence).toEqual(['orchestrate', 'broadcastRoomDelta']);
    });
  });

  // =========================================================================
  // FACET 2: Client Delta Non-Zero Fallback Guard ([TC-215.05] - [TC-215.08])
  // =========================================================================
  describe('Facet 2: Client Delta Non-Zero Fallback Guard', () => {
    it('[TC-215.05/MSS][UC-IMP215] syncTurnAndTimer khi đổi lượt người chơi mà delta.timeRemaining === 0 -> fallback về 60s', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'player_alpha',
        turnTimeRemaining: 15,
      });

      applyDelta({
        roomCode: 'ROOM_IMP215',
        tick: 10,
        currentTurnPlayerId: 'bot_ai_4',
        timeRemaining: 0,
      } as DeltaPayload);

      expect(useGameStore.getState().currentTurnPlayerId).toBe('bot_ai_4');
      expect(useGameStore.getState().turnTimeRemaining).toBe(60);
    });

    it('[TC-215.06/MSS][UC-IMP215] syncTurnAndTimer khi đổi lượt với delta.timeRemaining === 25 -> gán chính xác 25s', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'player_alpha',
        turnTimeRemaining: 15,
      });

      applyDelta({
        roomCode: 'ROOM_IMP215',
        tick: 11,
        currentTurnPlayerId: 'bot_ai_4',
        timeRemaining: 25,
      } as DeltaPayload);

      expect(useGameStore.getState().currentTurnPlayerId).toBe('bot_ai_4');
      expect(useGameStore.getState().turnTimeRemaining).toBe(25);
    });

    it('[TC-215.07/MSS][UC-IMP215] syncTurnAndTimer khi nhận delta giữa lượt với delta.timeRemaining === 0 -> KHÔNG ghi đè về 0, bảo toàn số giây đang đếm lùi', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'bot_ai_4',
        turnTimeRemaining: 24,
        turnPhase: TurnPhase.ActionPhase,
        lastDiceSeq: 5,
      });

      // Mid-turn event delta (e.g. rent payment +200) sending timeRemaining: 0
      applyDelta({
        roomCode: 'ROOM_IMP215',
        tick: 12,
        currentTurnPlayerId: 'bot_ai_4',
        timeRemaining: 0,
        turnPhase: TurnPhase.ActionPhase,
        diceSeq: 5,
      } as DeltaPayload);

      // Must protect countdown: do NOT overwrite with 0!
      expect(useGameStore.getState().turnTimeRemaining).toBe(24);
    });

    it('[TC-215.08/MSS][UC-IMP215] syncTurnAndTimer khi nhận delta giữa lượt với delta.timeRemaining > 0 và <= thời gian hiện tại -> cập nhật đồng bộ chính xác', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'bot_ai_4',
        turnTimeRemaining: 24,
        turnPhase: TurnPhase.ActionPhase,
        lastDiceSeq: 5,
      });

      applyDelta({
        roomCode: 'ROOM_IMP215',
        tick: 13,
        currentTurnPlayerId: 'bot_ai_4',
        timeRemaining: 22,
        turnPhase: TurnPhase.ActionPhase,
        diceSeq: 5,
      } as DeltaPayload);

      expect(useGameStore.getState().turnTimeRemaining).toBe(22);
    });
  });

  // =========================================================================
  // FACET 3: TopBar Rendering & Non-Freeze Contract ([TC-215.09] - [TC-215.11])
  // =========================================================================
  describe('Facet 3: TopBar Rendering & Non-Freeze Contract', () => {
    it('[TC-215.09/MSS][UC-IMP215] Khi lượt Bot với turnTimeRemaining = 25, TopBar hiển thị 00:25, font text-emerald-700 font-bold', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'bot_ai_4',
        turnTimeRemaining: 25,
      });

      const html = renderToStaticMarkup(React.createElement(TopBar));

      expect(html).toContain('00:25');
      expect(html).toContain('text-emerald-700 font-bold');
      expect(html).not.toContain('text-rose-600');
    });

    it('[TC-215.10/MSS][UC-IMP215] Tuyệt đối không hiển thị 00:00 ở đầu hoặc giữa lượt Bot khi nhận delta chuyển lượt', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'player_alpha',
        turnTimeRemaining: 30,
      });

      // Receive turn change delta with 0 timeRemaining
      applyDelta({
        roomCode: 'ROOM_IMP215',
        tick: 20,
        currentTurnPlayerId: 'bot_ai_4',
        timeRemaining: 0,
      } as DeltaPayload);

      const html = renderToStaticMarkup(React.createElement(TopBar));

      expect(html).not.toContain('00:00');
      expect(html).not.toContain('text-rose-600 font-extrabold animate-pulse');
    });

    it('[TC-215.11/MSS][UC-IMP215] Khi turnTimeRemaining <= 10, class cảnh báo nhấp nháy đỏ kích hoạt; khi > 10 hiển thị màu xanh chuẩn', () => {
      useGameStore.setState({ turnTimeRemaining: 10 });
      const html10 = renderToStaticMarkup(React.createElement(TopBar));
      expect(html10).toContain('text-rose-600 font-extrabold animate-pulse');

      useGameStore.setState({ turnTimeRemaining: 11 });
      const html11 = renderToStaticMarkup(React.createElement(TopBar));
      expect(html11).not.toContain('text-rose-600 font-extrabold animate-pulse');
      expect(html11).toContain('text-emerald-700 font-bold');
    });
  });

  // =========================================================================
  // FACET 4: AFK Recovery & Audit Grace Buffer ([TC-215.12] - [TC-215.14])
  // =========================================================================
  describe('Facet 4: AFK Recovery & Audit Grace Buffer', () => {
    it('[TC-215.12/MSS][UC-IMP215] executeSafeAfkAction gạt cờ wasInAudit = false và không gọi handleRollDice (bảo toàn contract TC-151.04)', () => {
      const p1 = createMockPlayer({ id: 'player_audit_01', wasInAudit: true });
      const room = createMockRoom([p1], { phase: TurnPhase.WaitingRoll });
      const mockRooms: any = {
        getRoom: vi.fn().mockReturnValue(room),
        handleRollDice: vi.fn(),
        handleEndTurn: vi.fn(),
        clearRoomTimers: vi.fn(),
      };

      expect(typeof executeSafeAfkAction).toBe('function');

      executeSafeAfkAction(mockRooms, room.roomCode, TurnPhase.WaitingRoll, p1.id);

      expect(p1.wasInAudit).toBe(false);
      expect(mockRooms.handleRollDice).not.toHaveBeenCalled();
    });

    it('[TC-215.13/MSS][UC-IMP215] Phương thức ủy quyền orchestrator.executeSafeAfkAction hoạt động tương thích ngược 100% với call-sites của imp60/imp151', () => {
      const p1 = createMockPlayer({ id: 'player_prop_01' });
      const room = createMockRoom([p1], { phase: TurnPhase.PropertyManagement });
      const mockRooms: any = {
        getRoom: vi.fn().mockReturnValue(room),
        handleEndTurn: vi.fn(),
        clearRoomTimers: vi.fn(),
      };
      const orchestrator = new TurnOrchestrator({
        rooms: mockRooms,
        intentMutex: { runExclusive: vi.fn() } as any,
        broadcaster: { broadcastRoomDelta: vi.fn() } as any,
        onGameOver: vi.fn(),
      });

      orchestrator.executeSafeAfkAction(room.roomCode, TurnPhase.PropertyManagement, p1.id);

      expect(mockRooms.handleEndTurn).toHaveBeenCalledWith(room.roomCode, p1.id);
    });

    it('[TC-215.14/MSS][UC-IMP215] AFK ở TurnPhase.WaitingRoll bình thường tự động gieo xúc xắc và chuyển lượt an toàn', () => {
      const p1 = createMockPlayer({ id: 'player_normal_01', wasInAudit: false });
      const room = createMockRoom([p1], { phase: TurnPhase.WaitingRoll });
      const mockRooms: any = {
        getRoom: vi.fn().mockReturnValue(room),
        handleRollDice: vi.fn().mockImplementation(() => {
          room.phase = TurnPhase.PropertyManagement;
        }),
        handleEndTurn: vi.fn(),
        clearRoomTimers: vi.fn(),
      };
      const orchestrator = new TurnOrchestrator({
        rooms: mockRooms,
        intentMutex: { runExclusive: vi.fn() } as any,
        broadcaster: { broadcastRoomDelta: vi.fn() } as any,
        onGameOver: vi.fn(),
      });

      orchestrator.executeSafeAfkAction(room.roomCode, TurnPhase.WaitingRoll, p1.id);

      expect(mockRooms.handleRollDice).toHaveBeenCalledWith(room.roomCode, p1.id);
      expect(mockRooms.handleEndTurn).toHaveBeenCalledWith(room.roomCode, p1.id);
    });
  });

  // =========================================================================
  // FACET 5: Multi-Turn Lifecycle Handoff ([TC-215.15] - [TC-215.16])
  // =========================================================================
  describe('Facet 5: Multi-Turn Lifecycle Handoff', () => {
    it('[TC-215.15/MSS][UC-IMP215] Kiểm tra vòng đời chuyển giao lượt từ Bot sang Bot bảo toàn deadline nguyên dương (25s)', () => {
      const bot1 = createMockPlayer({ id: 'bot_01', isBot: true });
      const bot2 = createMockPlayer({ id: 'bot_02', isBot: true });
      const room = createMockRoom([bot1, bot2], {
        phase: TurnPhase.WaitingRoll,
        currentPlayerIndex: 0,
        started: true,
      });
      const mockRooms: any = {
        getRoom: vi.fn().mockReturnValue(room),
        clearRoomTimers: vi.fn(),
        registerTimer: vi.fn(),
      };
      const orchestrator = new TurnOrchestrator({
        rooms: mockRooms,
        intentMutex: { runExclusive: vi.fn() } as any,
        broadcaster: { broadcastRoomDelta: vi.fn() } as any,
        onGameOver: vi.fn(),
      });

      // First bot turn
      orchestrator.orchestrate(room.roomCode);

      // Advance turn to second bot
      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.WaitingRoll;
      orchestrator.orchestrate(room.roomCode);

      expect(orchestrator.getTimeRemaining(room.roomCode)).toBe(25);
    });

    it('[TC-215.16/MSS][UC-IMP215] Kiểm tra vòng đời chuyển giao lượt từ Bot sang Người chơi thật bảo toàn deadline 45s', () => {
      const bot = createMockPlayer({ id: 'bot_01', isBot: true });
      const human = createMockPlayer({ id: 'player_human_01', isBot: false });
      const room = createMockRoom([bot, human], {
        phase: TurnPhase.WaitingRoll,
        currentPlayerIndex: 0,
        started: true,
      });
      const mockRooms: any = {
        getRoom: vi.fn().mockReturnValue(room),
        clearRoomTimers: vi.fn(),
        registerTimer: vi.fn(),
      };
      const orchestrator = new TurnOrchestrator({
        rooms: mockRooms,
        intentMutex: { runExclusive: vi.fn() } as any,
        broadcaster: { broadcastRoomDelta: vi.fn() } as any,
        onGameOver: vi.fn(),
      });

      // Bot turn
      orchestrator.orchestrate(room.roomCode);

      // Advance turn to human
      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.WaitingRoll;
      orchestrator.orchestrate(room.roomCode);

      // Human in WaitingRoll gets 45s
      expect(orchestrator.getTimeRemaining(room.roomCode)).toBe(45);
    });
  });
});
