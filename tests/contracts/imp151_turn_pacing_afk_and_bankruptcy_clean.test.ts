// [TC-151.01/MSS..TC-151.17/MSS][UC-IMP151]
// Contract Test Suite: IMP-151 Turn Pacing, AFK Protection, Bankruptcy Clean State & Telemetry Sync
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Boundary & Range (Turn Timeout & Watchdog Safety)
// Facet 2: State Reactivity (Bot Trade Invariants & Audit Immunity)
// Facet 3: Resource Disposal (Bankruptcy Balance & Debt Clean State, Conservation Invariant)
// Facet 4: 3D Visual, Telemetry & Error Defense (Pawn Visibility, Non-blocking Moves, Seed Hash & Finite TickRate)

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TurnPhase, type Player, type Room } from '../../src/domain/room.js';
import { BotPersonality } from '../../src/domain/bot/bot_types.js';
import { findEligibleBotTrade, findBotSwapTrade } from '../../src/domain/bot/bot_trade.js';
import { declareBankruptcy, calculateNetWorth } from '../../src/server/insolvency_manager.js';
import { TurnWatchdog } from '../../src/server/network/turn_watchdog.js';
import { TurnOrchestrator } from '../../src/server/network/turn_orchestrator.js';
import * as turnOrchestratorModule from '../../src/server/network/turn_orchestrator.js';
import * as telemetryDeltaHook from '../../src/client/telemetry/telemetry_delta_hook.js';
import { verifyTreasuryConservation, verifyAllInvariants } from '../../src/client/telemetry/invariant_checker.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';
import { hashSeed } from '../../src/domain/pawn_assignment.js';
import { PawnAnimator } from '../../src/client/3d/pawn_animator.js';
import { useGameStore, type GameState } from '../../src/client/store/game_store.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

// =============================================================================
// MOCKS FOR R3F AND DREI FOR HEADLESS TEST EXECUTION
// =============================================================================
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  Billboard: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('billboard', null, children),
}));

// --- Fixtures & Test Helpers ---
function createMockPlayer(overrides?: Partial<Player>): Player {
  return {
    id: overrides?.id ?? 'player_investor_01',
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
    roomCode: overrides?.roomCode ?? 'VT8888',
    hostId: players[0]?.id ?? 'player_investor_01',
    players,
    phase: overrides?.phase ?? TurnPhase.WaitingRoll,
    currentPlayerIndex: overrides?.currentPlayerIndex ?? 0,
    round: overrides?.round ?? 1,
    roundCount: overrides?.roundCount ?? 1,
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

describe('[CONTRACT] IMP-151: Turn Pacing, AFK Protection, Bankruptcy Clean State & Telemetry Sync', () => {
  beforeEach(() => {
    vi.useRealTimers();
    useTelemetryStore.getState().reset();
    useGameStore.setState({
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      pendingPawnMove: null,
      playerPositions: {},
      visualPositions: {},
      playersInfo: {},
    });
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (TURN TIMEOUT & WATCHDOG SAFETY)
  // =========================================================================
  describe('Facet 1: Boundary & Range (Timeout & Watchdog)', () => {
    it('[TC-151.01/MSS][UC-IMP151] Human WaitingRoll timeout đạt 45.000ms cho người chơi thật', () => {
      const humanWaitingRollMs =
        (turnOrchestratorModule as any).HUMAN_PHASE_TIMEOUTS_MS?.[TurnPhase.WaitingRoll] ??
        (turnOrchestratorModule as any).PHASE_TIMEOUTS_MS?.[TurnPhase.WaitingRoll];

      expect(humanWaitingRollMs).toBe(45_000);
    });

    it('[TC-151.02/MSS][UC-IMP151] TurnWatchdog.maxTurnStallMs cấu hình mặc định tối thiểu 90.000ms', () => {
      const mockRooms: any = { getRoom: vi.fn(), clearRoomTimers: vi.fn() };
      const mockMutex: any = { runExclusive: vi.fn() };
      const mockBroadcaster: any = { getCurrentTick: vi.fn().mockReturnValue(1) };

      const watchdog = new TurnWatchdog({
        rooms: mockRooms,
        intentMutex: mockMutex,
        broadcaster: mockBroadcaster,
        onGameOver: vi.fn(),
        onScheduleNextTurn: vi.fn(),
      });

      const actualMaxStallMs = (watchdog as any).maxTurnStallMs;
      expect(actualMaxStallMs).toBeGreaterThanOrEqual(90_000);
    });

    it('[TC-151.03/MSS][UC-IMP151] TurnWatchdog cập nhật lastProgressAt = Date.now() khi tracker.phase !== room.phase', async () => {
      const p1 = createMockPlayer({ id: 'player_investor_01' });
      const room = createMockRoom([p1], { phase: TurnPhase.WaitingRoll });
      const mockRooms: any = { getRoom: vi.fn().mockReturnValue(room) };
      const mockMutex: any = { runExclusive: vi.fn() };
      const mockBroadcaster: any = { getCurrentTick: vi.fn().mockReturnValue(10) };

      const watchdog = new TurnWatchdog({
        rooms: mockRooms,
        intentMutex: mockMutex,
        broadcaster: mockBroadcaster,
        onGameOver: vi.fn(),
        onScheduleNextTurn: vi.fn(),
        maxTurnStallMs: 90_000,
      });

      // Bắt đầu lượt ở WaitingRoll vào thời điểm t0
      const t0 = 1_000_000;
      vi.spyOn(Date, 'now').mockReturnValue(t0);
      watchdog.notifyTurnStart(room.roomCode);

      // Tại t0 + 50.000ms, phòng chuyển sang ActionPhase
      const t1 = t0 + 50_000;
      vi.spyOn(Date, 'now').mockReturnValue(t1);
      room.phase = TurnPhase.ActionPhase;

      const triggeredRecovery = await watchdog.checkRoom(room.roomCode);
      const tracker = (watchdog as any).roomTrackers.get(room.roomCode);

      expect(triggeredRecovery).toBe(false);
      expect(tracker?.lastProgressAt).toBe(t1);
    });

    it('[TC-151.04/A1][UC-IMP151] executeSafeAfkAction áp dụng đệm an toàn 15s hoặc không tự đổ xí ngầu khi wasInAudit === true', () => {
      const p1 = createMockPlayer({ id: 'player_investor_01', wasInAudit: true } as any);
      const room = createMockRoom([p1], { phase: TurnPhase.WaitingRoll });
      const mockRooms: any = {
        getRoom: vi.fn().mockReturnValue(room),
        handleRollDice: vi.fn(),
        handleEndTurn: vi.fn(),
        clearRoomTimers: vi.fn(),
      };
      const mockMutex: any = { runExclusive: vi.fn() };
      const mockBroadcaster: any = { broadcastRoomDelta: vi.fn() };

      const orchestrator = new TurnOrchestrator({
        rooms: mockRooms,
        intentMutex: mockMutex,
        broadcaster: mockBroadcaster,
        onGameOver: vi.fn(),
      });

      // Gọi AFK action khi vừa ra khỏi Trạm Kiểm Toán
      (orchestrator as any).executeSafeAfkAction(room.roomCode, TurnPhase.WaitingRoll, p1.id);

      // Khi wasInAudit === true, không được tự động đổ xí ngầu bất cẩn
      expect(mockRooms.handleRollDice).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY (BOT TRADE INVARIANTS & AUDIT IMMUNITY)
  // =========================================================================
  describe('Facet 2: Reactivity & Bot Intelligence', () => {
    it('[TC-151.05/MSS][UC-IMP151] findEligibleBotTrade trả về null khi targetOwner.inAudit === true', () => {
      const bot = createMockPlayer({ id: 'bot_tycoon_02', isBot: true });
      const human = createMockPlayer({ id: 'player_investor_01', inAudit: true });
      const room = createMockRoom([bot, human], { roundCount: 3 });

      const registry: PropertyRegistry = new Map([[6, human.id], [8, bot.id], [9, bot.id]]);
      const stateMap: PropertyStateMap = new Map([
        [6, { level: 0 }],
        [8, { level: 0 }],
        [9, { level: 0 }],
      ]);

      const offer = findEligibleBotTrade(bot, room, registry, stateMap, BotPersonality.Balanced, 3);
      expect(offer).toBeNull();
    });

    it('[TC-151.06/MSS][UC-IMP151] findEligibleBotTrade trả về null khi targetOwner.auditTurnsLeft > 0', () => {
      const bot = createMockPlayer({ id: 'bot_tycoon_02', isBot: true });
      const human = createMockPlayer({ id: 'player_investor_01', inAudit: false, auditTurnsLeft: 2 });
      const room = createMockRoom([bot, human], { roundCount: 4 });

      const registry: PropertyRegistry = new Map([[6, human.id], [8, bot.id], [9, bot.id]]);
      const stateMap: PropertyStateMap = new Map([
        [6, { level: 0 }],
        [8, { level: 0 }],
        [9, { level: 0 }],
      ]);

      const offer = findEligibleBotTrade(bot, room, registry, stateMap, BotPersonality.Aggressive, 4);
      expect(offer).toBeNull();
    });

    it('[TC-151.07/MSS][UC-IMP151] findBotSwapTrade trả về null khi targetOwner.inAudit === true hoặc targetOwner.auditTurnsLeft > 0', () => {
      const bot = createMockPlayer({ id: 'bot_tycoon_02', isBot: true });
      const human = createMockPlayer({ id: 'player_investor_01', inAudit: true, auditTurnsLeft: 1 });
      const room = createMockRoom([bot, human], { roundCount: 5 });

      const registry: PropertyRegistry = new Map([
        [6, human.id], [8, bot.id], [9, bot.id],
        [11, bot.id], [13, human.id], [14, human.id],
      ]);
      const stateMap: PropertyStateMap = new Map([
        [6, { level: 0 }], [8, { level: 0 }], [9, { level: 0 }],
        [11, { level: 0 }], [13, { level: 0 }], [14, { level: 0 }],
      ]);

      const swapOffer = findBotSwapTrade(bot, room, registry, stateMap, BotPersonality.Balanced, 5);
      expect(swapOffer).toBeNull();
    });

    it('[TC-151.08/MSS][UC-IMP151] Bot trade áp dụng cooldown tối thiểu 2 vòng kể cả khi currentRound >= 10', () => {
      const bot = createMockPlayer({
        id: 'bot_tycoon_02',
        isBot: true,
        lastTradeOfferRound: 11,
      });
      const human = createMockPlayer({ id: 'player_investor_01', inAudit: false, auditTurnsLeft: 0 });
      const room = createMockRoom([bot, human], { roundCount: 12 });

      const registry: PropertyRegistry = new Map([[6, human.id], [8, bot.id], [9, bot.id]]);
      const stateMap: PropertyStateMap = new Map([
        [6, { level: 0 }], [8, { level: 0 }], [9, { level: 0 }],
      ]);

      // Vòng 12 so với vòng 11 chỉ cách 1 vòng (< 2) -> bắt buộc bị chặn Cooldown
      const offer = findEligibleBotTrade(bot, room, registry, stateMap, BotPersonality.Balanced, 12);
      expect(offer).toBeNull();
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & INVARIANTS (BANKRUPTCY CLEAN STATE)
  // =========================================================================
  describe('Facet 3: Resource Disposal & Invariants (Bankruptcy Clean State)', () => {
    it('[TC-151.09/MSS][UC-IMP151] declareBankruptcy reset player.balance = 0 khi người chơi có số dư âm (-15) ở nhánh mặc định', () => {
      const bankruptPlayer = createMockPlayer({ id: 'player_bankrupt_01', balance: -15 });
      const survivor = createMockPlayer({ id: 'player_survivor_02', balance: 12_000 });
      const room = createMockRoom([bankruptPlayer, survivor]);
      const registry: PropertyRegistry = new Map([[1, bankruptPlayer.id]]);
      const stateMap: PropertyStateMap = new Map([[1, { level: 0 }]]);

      declareBankruptcy(room, bankruptPlayer.id, registry, stateMap);

      expect(bankruptPlayer.bankrupt).toBe(true);
      expect(bankruptPlayer.balance).toBe(0);
    });

    it('[TC-151.10/MSS][UC-IMP151] declareBankruptcy reset player.balance = 0 ở nhánh nợ BANK', () => {
      const bankruptPlayer = createMockPlayer({ id: 'player_bankrupt_01', balance: -500 });
      const survivor = createMockPlayer({ id: 'player_survivor_02', balance: 10_000 });
      const room = createMockRoom([bankruptPlayer, survivor], { treasury: 2_000 });
      const registry: PropertyRegistry = new Map([[3, bankruptPlayer.id]]);
      const stateMap: PropertyStateMap = new Map([[3, { level: 0 }]]);

      declareBankruptcy(room, bankruptPlayer.id, registry, stateMap, 'BANK');

      expect(bankruptPlayer.bankrupt).toBe(true);
      expect(bankruptPlayer.balance).toBe(0);
    });

    it('[TC-151.11/MSS][UC-IMP151] declareBankruptcy reset player.balance = 0 ở nhánh nợ P2P creditor', () => {
      const creditor = createMockPlayer({ id: 'player_creditor_01', balance: 8_000 });
      const debtor = createMockPlayer({ id: 'player_debtor_02', balance: -200 });
      const room = createMockRoom([creditor, debtor]);
      const registry: PropertyRegistry = new Map([[8, debtor.id]]);
      const stateMap: PropertyStateMap = new Map([[8, { level: 0 }]]);

      declareBankruptcy(room, debtor.id, registry, stateMap, creditor.id);

      expect(debtor.bankrupt).toBe(true);
      expect(debtor.balance).toBe(0);
    });

    it('[TC-151.12/MSS][UC-IMP151] declareBankruptcy dọn sạch mortgagedProperties và mortgageLoans', () => {
      const debtor = createMockPlayer({
        id: 'player_debtor_02',
        balance: -100,
        mortgagedProperties: [6, 8],
        mortgageLoans: { 6: 500, 8: 600 },
      });
      const survivor = createMockPlayer({ id: 'player_survivor_01', balance: 5_000 });
      const room = createMockRoom([debtor, survivor]);
      const registry: PropertyRegistry = new Map([[6, debtor.id], [8, debtor.id]]);
      const stateMap: PropertyStateMap = new Map([[6, { level: 0 }], [8, { level: 0 }]]);

      declareBankruptcy(room, debtor.id, registry, stateMap);

      expect(debtor.mortgagedProperties).toEqual([]);
      expect(debtor.mortgageLoans).toEqual({});
      expect(calculateNetWorth(debtor.id, registry, stateMap, room.players)).toBe(0);
    });

    it('[TC-151.13/MSS][UC-IMP151] isUnmodeledEvent nhận diện sự kiện xóa nợ do phá sản, ngăn chặn báo động đỏ vi phạm bảo toàn quỹ', () => {
      const delta: DeltaPayload = {
        tick: 85,
        cells: [],
        turnPhase: TurnPhase.WaitingRoll,
        players: [
          {
            id: 'player_bankrupt_01',
            balance: 0,
            bankrupt: true,
            position: 19,
          },
        ],
        roomStarted: true,
      };

      const preState = {
        playersInfo: {
          player_bankrupt_01: {
            id: 'player_bankrupt_01',
            balance: -15,
            position: 19,
            bankrupt: false,
          },
          player_survivor_02: {
            id: 'player_survivor_02',
            balance: 10_000,
            position: 0,
            bankrupt: false,
          },
        },
        treasuryPool: 3_000,
        activeModal: null,
      } as unknown as GameState;

      // Consumer assertion: computeExpectedDelta trả về null (sự kiện xóa nợ unmodeled do phá sản)
      const expectedDelta = telemetryDeltaHook.computeExpectedDelta(delta, preState);
      expect(expectedDelta).toBeNull();

      // Consumer assertion: Invariant Checker không phát sinh vi phạm TREASURY_INVARIANT_VIOLATED
      const violations = verifyAllInvariants({
        preBalances: { player_bankrupt_01: -15, player_survivor_02: 10_000 },
        postBalances: { player_bankrupt_01: 0, player_survivor_02: 10_000 },
        preTreasury: 3_000,
        postTreasury: 3_000,
        expectedMoneyDelta: expectedDelta,
        tick: 85,
        roomStarted: true,
      });

      const treasuryViolations = violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
      expect(treasuryViolations).toHaveLength(0);
    });
  });

  // =========================================================================
  // FACET 4: 3D VISUAL, TELEMETRY & ERROR DEFENSE
  // =========================================================================
  describe('Facet 4: 3D Visual, Telemetry & Error Defense', () => {
    it('[TC-151.14/MSS][UC-IMP151] PawnAnimator lọc bỏ hoặc ẩn hoàn toàn quân cờ của người chơi đã phá sản', () => {
      const alivePlayer = createMockPlayer({ id: 'player_alive_01', bankrupt: false });
      const deadPlayer = createMockPlayer({ id: 'player_dead_02', bankrupt: true });

      useGameStore.setState({
        playerPositions: { player_alive_01: 0, player_dead_02: 19 },
        visualPositions: { player_alive_01: 0, player_dead_02: 19 },
        playersInfo: {
          player_alive_01: alivePlayer as any,
          player_dead_02: deadPlayer as any,
        },
      });

      const markup = renderToStaticMarkup(
        React.createElement(PawnAnimator, { players: [alivePlayer, deadPlayer] })
      );

      // Khi người chơi phá sản bị ẩn, chỉ còn đúng 1 pawn-aura-pedestal hoặc pawn instance của alivePlayer
      const pedestalMatches = markup.match(/data-testid="pawn-aura-pedestal"/g) ?? [];
      expect(pedestalMatches.length).toBe(1);
    });

    it('[TC-151.15/MSS][UC-IMP151] Khi người chơi phá sản đang di chuyển, PawnAnimator giải phóng completePawnMove để không treo isBusy', () => {
      const bankruptMovingPlayer = createMockPlayer({ id: 'player_bankrupt_moving', bankrupt: true });

      useGameStore.setState({
        activePawnAnimation: {
          playerId: 'player_bankrupt_moving',
          fromCell: 10,
          waypoints: [11, 12, 13],
          currentIndex: 0,
          isAnimating: true,
          isBot: false,
        },
        playerPositions: { player_bankrupt_moving: 10 },
        visualPositions: { player_bankrupt_moving: 10 },
        playersInfo: {
          player_bankrupt_moving: bankruptMovingPlayer as any,
        },
      });

      // Render PawnAnimator chứa người chơi phá sản đang di chuyển
      renderToStaticMarkup(
        React.createElement(PawnAnimator, { players: [bankruptMovingPlayer] })
      );

      // Hệ thống / PawnAnimator phải chủ động hoàn tất và giải phóng cờ isBusy
      const activeAnim = useGameStore.getState().activePawnAnimation;
      expect(activeAnim).toBeNull();
    });

    it('[TC-151.16/MSS][UC-IMP151] setSessionMetadata tự động suy diễn seed tất định từ hashSeed(roomCode) khi seed bị khuyết', () => {
      const roomCode = 'VT8888';
      const expectedSeed = hashSeed(roomCode);

      // Gọi setSessionMetadata chỉ với roomCode, không truyền seed
      useTelemetryStore.getState().setSessionMetadata({
        roomCode,
      });

      const state = useTelemetryStore.getState();
      expect(state.roomCode).toBe('VT8888');
      expect(state.seed).toBe(expectedSeed);
    });

    it('[TC-151.17/MSS][UC-IMP151] Thuật toán đo tickRate xử lý an toàn không bị chia cho 0 khi delta time dt < 16ms', () => {
      const calculateTickRate = (telemetryDeltaHook as any).calculateTickRate;
      expect(typeof calculateTickRate).toBe('function');

      // Khi delta đến dồn dập (dt = 0ms hoặc dt = 5ms), tickRate phải là số hữu hạn >= 0
      const safeTickRateZero = calculateTickRate([0, 0, 0]);
      expect(Number.isFinite(safeTickRateZero)).toBe(true);
      expect(safeTickRateZero).toBeGreaterThanOrEqual(0);
    });
  });
});
