// [IMP-54][CONTRACT] Universal 4-Facet Behavioral Contract: Telemetry Watchdog Precision, FSM Animation Auto-Recovery & Auction Activity Integrity
import { describe, it, expect, beforeEach } from 'vitest';
import { TurnPhase } from '../../src/domain/room.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { useGameStore, type GameState } from '../../src/client/store/game_store.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';
import { watchdogMonitor } from '../../src/client/telemetry/watchdog_monitor.js';
import * as telemetryHook from '../../src/client/telemetry/telemetry_delta_hook.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import { detectPropertyAndLevelActivities } from '../../src/client/network/activity_property_tracker.js';
import { detectFinancialAndStatusActivities } from '../../src/client/network/activity_financial_tracker.js';
import { trackDeltaActivities } from '../../src/client/network/activity_tracker.js';

// Resolve hook functions & contract tokens (supporting named and namespace exports)
const computeExpectedDelta = telemetryHook.computeExpectedDelta;
const handleDeltaTelemetry = telemetryHook.handleDeltaTelemetry;
const AIRPORT_CELLS = (telemetryHook as Record<string, unknown>).AIRPORT_CELLS as Set<number> | undefined;
const checkIsTeleport = (telemetryHook as Record<string, unknown>).checkIsTeleport as
  | ((fromPos: number, toPos: number, isTurnPlayer: boolean, phase?: TurnPhase) => boolean)
  | undefined;

function createTestState(overrides?: Partial<GameState> & {
  readonly p1Balance?: number;
  readonly p1Pos?: number;
  readonly p1Props?: readonly number[];
  readonly levels?: Record<number, 0 | 1 | 2 | 3>;
  readonly auction?: {
    readonly cellIndex: number;
    readonly highestBid: number;
    readonly highestBidder: string;
    readonly currentBid?: number;
    readonly highestBidderId?: string | null;
  };
}): GameState {
  const p1Balance = overrides?.p1Balance ?? 15_000;
  const p1Pos = overrides?.p1Pos ?? 0;
  const p1Props = overrides?.p1Props ? [...overrides.p1Props] : [];

  return {
    playersInfo: {
      p1: {
        id: 'p1',
        name: 'Người chơi 1',
        balance: p1Balance,
        tokenColor: '#ef4444',
        ownedProperties: p1Props,
        mortgagedProperties: [],
        isBot: false,
      },
    },
    playerPositions: {
      p1: p1Pos,
    },
    visualPositions: {
      p1: p1Pos,
    },
    levelMap: overrides?.levels ? { ...overrides.levels } : {},
    treasuryPool: 2_000,
    currentTurnPlayerId: 'p1',
    turnTimeRemaining: 30,
    activeModal: overrides?.activeModal ?? (overrides?.auction ? 'auction' : null),
    modalPayload: overrides?.modalPayload ?? (overrides?.auction ? {
      cellIndex: overrides.auction.cellIndex,
      currentBid: overrides.auction.highestBid ?? overrides.auction.currentBid,
      highestBidderId: overrides.auction.highestBidder ?? overrides.auction.highestBidderId,
      timeRemaining: 0,
    } : null),
    dice: [1, 1],
    isRolling: false,
    hasRolledThisTurn: false,
    activePawnAnimation: null,
    pawnAnimationQueue: [],
    pendingPawnMove: null,
    lastLandedPawn: null,
    roundNumber: 1,
    maxRounds: 30,
    lastEventCard: null,
    activeEmotes: {},
    floatingTexts: [],
    ...(overrides?.auction ? { auction: overrides.auction } : {}),
    ...overrides,
  } as unknown as GameState;
}

describe('[CONTRACT] IMP-54: Telemetry Watchdog Precision & Auction Activity Integrity', () => {
  beforeEach(() => {
    useTelemetryStore.getState().reset();
    watchdogMonitor.reset();
    useActivityStore.getState().clearLogs();
    useGameStore.getState().clearActivePawnAnimation();
    useGameStore.getState().closeModal();
  });

  // =========================================================================
  // FACET 1: BOUNDARY & WEBGL METRIC RESET INVARIANT
  // =========================================================================
  describe('Facet 1: Boundary & WebGL Metric Reset Invariant', () => {
    it('[TC-54.1/MSS][UC-009] AIRPORT_CELLS phải được export từ telemetry_delta_hook', () => {
      expect(AIRPORT_CELLS).toBeDefined();
    });

    it('[TC-54.2/MSS][UC-009] AIRPORT_CELLS phải có kích thước chính xác là 4 ô hạ tầng', () => {
      expect(AIRPORT_CELLS?.size).toBe(4);
    });

    it.each([5, 15, 25, 35])('[TC-54.3/A1][UC-009] AIRPORT_CELLS phải chứa ô hạ tầng %i', (cellIndex) => {
      expect(AIRPORT_CELLS?.has(cellIndex)).toBe(true);
    });

    it('[TC-54.4/A2][UC-009] AIRPORT_CELLS TUYỆT ĐỐI KHÔNG chứa ô 22 (ô Phiếu Cơ Hội)', () => {
      expect(AIRPORT_CELLS?.has(22)).toBe(false);
    });

    it('[TC-54.5/MSS][UC-009] checkIsTeleport phải được export từ telemetry_delta_hook', () => {
      expect(checkIsTeleport).toBeDefined();
    });

    it('[TC-54.6/A3][UC-009] checkIsTeleport: khi phase là PropertyManagement và di chuyển thông thường (36 sang 5), KHÔNG được coi là teleport', () => {
      const isTeleport = checkIsTeleport?.(36, 5, true, TurnPhase.PropertyManagement);
      expect(isTeleport).toBe(false);
    });

    it('[TC-54.7/A4][UC-009] checkIsTeleport: khi không phải người chơi lượt hiện tại (isTurnPlayer = false), phải coi là teleport', () => {
      const isTeleport = checkIsTeleport?.(10, 15, false, TurnPhase.PropertyManagement);
      expect(isTeleport).toBe(true);
    });

    it('[TC-54.8/A5][UC-009] checkIsTeleport: khi nhảy giữa hai ô sân bay hợp lệ (5 sang 25), phải coi là teleport', () => {
      const isTeleport = checkIsTeleport?.(5, 25, true, TurnPhase.WaitingRoll);
      expect(isTeleport).toBe(true);
    });
  });

  // =========================================================================
  // FACET 2: AUTO-RECOVERY & STATE REACTIVITY
  // =========================================================================
  describe('Facet 2: Auto-Recovery & State Reactivity (FSM Animation Stall)', () => {
    it('[TC-54.9/MSS][UC-009] Khi animatingDurationMs > 10000, hàm phục hồi tự động kích hoạt clearActivePawnAnimation đưa activePawnAnimation về null', () => {
      useGameStore.setState({
        activePawnAnimation: {
          playerId: 'p1',
          fromCell: 0,
          targetCell: 5,
          waypoints: [1, 2, 3, 4, 5],
          isAnimating: true,
        },
      });

      const recoverFn =
        watchdogMonitor.recoverFsmAnimationStall?.bind(watchdogMonitor) ??
        watchdogMonitor.checkFsmAnimationStall?.bind(watchdogMonitor);

      recoverFn?.({
        isAnimating: true,
        animatingDurationMs: 12_000,
        tick: 1,
      });

      expect(useGameStore.getState().activePawnAnimation).toBeNull();
    });

    it('[TC-54.10/A1][UC-009] Sau khi tự giải cứu FSM stall, pawnAnimationQueue phải được làm sạch hoàn toàn', () => {
      useGameStore.setState({
        activePawnAnimation: {
          playerId: 'p1',
          fromCell: 0,
          targetCell: 5,
          waypoints: [1, 2, 3, 4, 5],
          isAnimating: true,
        },
        pawnAnimationQueue: [
          { playerId: 'p1', fromCell: 5, targetCell: 8, waypoints: [6, 7, 8], isBot: false },
        ],
      });

      const recoverFn =
        watchdogMonitor.recoverFsmAnimationStall?.bind(watchdogMonitor) ??
        watchdogMonitor.checkFsmAnimationStall?.bind(watchdogMonitor);

      recoverFn?.({
        isAnimating: true,
        animatingDurationMs: 10_500,
        tick: 2,
      });

      expect(useGameStore.getState().pawnAnimationQueue).toEqual([]);
    });

    it('[TC-54.11/A2][UC-009] Khi animatingDurationMs <= 10000 (hoạt ảnh 5000ms), activePawnAnimation KHÔNG bị xóa', () => {
      useGameStore.setState({
        activePawnAnimation: {
          playerId: 'p1',
          fromCell: 0,
          targetCell: 5,
          waypoints: [1, 2, 3, 4, 5],
          isAnimating: true,
        },
      });

      watchdogMonitor.checkFsmAnimationStall({
        isAnimating: true,
        animatingDurationMs: 5_000,
        tick: 3,
      });

      expect(useGameStore.getState().activePawnAnimation).not.toBeNull();
    });

    it('[TC-54.12/A3][UC-009] Sau khi đã tự giải cứu, activePawnAnimation bằng null và lần kiểm tra tiếp theo không tiếp tục tăng durationMs', () => {
      useGameStore.setState({
        activePawnAnimation: {
          playerId: 'p1',
          fromCell: 0,
          targetCell: 5,
          waypoints: [1, 2, 3, 4, 5],
          isAnimating: true,
        },
      });

      const recoverFn =
        watchdogMonitor.recoverFsmAnimationStall?.bind(watchdogMonitor) ??
        watchdogMonitor.checkFsmAnimationStall?.bind(watchdogMonitor);

      recoverFn?.({
        isAnimating: true,
        animatingDurationMs: 11_000,
        tick: 4,
      });

      expect(useGameStore.getState().activePawnAnimation).toBeNull();

      const subsequentCheck = watchdogMonitor.checkFsmAnimationStall({
        isAnimating: false,
        animatingDurationMs: 0,
        tick: 5,
      });
      expect(subsequentCheck).toBeNull();
    });
  });

  // =========================================================================
  // FACET 3: TREASURY INVARIANT PRECISION
  // =========================================================================
  describe('Facet 3: Treasury Invariant Precision', () => {
    it('[TC-54.13/MSS][UC-009] computeExpectedDelta: khi ô 18 mua qua đấu giá 3250 Tr, kỳ vọng biến động tiền là -3250 thay vì giá gốc -1800', () => {
      const preState = createTestState({
        p1Balance: 15_000,
        auction: { cellIndex: 18, highestBid: 3250, highestBidder: 'p1', currentBid: 3250, highestBidderId: 'p1' },
      });

      const delta: DeltaPayload = {
        tick: 20,
        currentTurnPlayerId: 'p1',
        cells: [{ index: 18, ownerId: 'p1' }],
        players: [{ id: 'p1', position: 18, balance: 11_750 }],
        auction: null,
      };

      const expected = computeExpectedDelta(delta, preState);
      expect(expected).toBe(-3250);
    });

    it('[TC-54.14/A1][UC-009] computeExpectedDelta: khi ô 35 mua qua đấu giá 5000 Tr, kỳ vọng biến động tiền là -5000 thay vì giá gốc -2000', () => {
      const preState = createTestState({
        p1Balance: 15_000,
        auction: { cellIndex: 35, highestBid: 5000, highestBidder: 'p1', currentBid: 5000, highestBidderId: 'p1' },
      });

      const delta: DeltaPayload = {
        tick: 21,
        currentTurnPlayerId: 'p1',
        cells: [{ index: 35, ownerId: 'p1' }],
        players: [{ id: 'p1', position: 35, balance: 10_000 }],
        auction: null,
      };

      const expected = computeExpectedDelta(delta, preState);
      expect(expected).toBe(-5000);
    });

    it('[TC-54.15/MSS][UC-009] computeExpectedDelta: khi người chơi vượt ô GO hạ cánh tại ô 5 trong phase PropertyManagement với xúc xắc tổng 9, tính đúng tiền lương GO +2000', () => {
      const preState = createTestState({
        p1Pos: 36,
        p1Balance: 15_000,
      });

      const delta: DeltaPayload = {
        tick: 22,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.PropertyManagement,
        dice: [4, 5],
        cells: [],
        players: [{ id: 'p1', position: 5, balance: 17_000 }],
      };

      const movement = {
        fromPosition: 36,
        toPosition: 5,
        dice: [4, 5] as const,
        isTeleport: false,
      };

      const expected = computeExpectedDelta(delta, preState, movement);
      expect(expected).toBe(2000);
    });

    it('[TC-54.16/A2][UC-009] handleDeltaTelemetry: không phát cờ vi phạm TREASURY_INVARIANT_VIOLATED khi số dư giảm đúng bằng giá thắng đấu giá (-3250)', () => {
      const preState = createTestState({
        p1Balance: 15_000,
        auction: { cellIndex: 18, highestBid: 3250, highestBidder: 'p1', currentBid: 3250, highestBidderId: 'p1' },
      });

      const postState = createTestState({
        p1Balance: 11_750,
        p1Props: [18],
        activeModal: null,
      });

      const delta: DeltaPayload = {
        tick: 23,
        currentTurnPlayerId: 'p1',
        cells: [{ index: 18, ownerId: 'p1' }],
        players: [{ id: 'p1', position: 18, balance: 11_750 }],
        auction: null,
      };

      handleDeltaTelemetry(delta, preState, postState);
      const treasuryViolations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');

      expect(treasuryViolations).toHaveLength(0);
    });

    it('[TC-54.17/A3][UC-009] handleDeltaTelemetry: không phát cờ vi phạm INVALID_POSITION_STEP khi di chuyển vượt GO (36 sang 5) trong phase PropertyManagement', () => {
      const preState = createTestState({
        p1Pos: 36,
        p1Balance: 15_000,
      });

      const postState = createTestState({
        p1Pos: 5,
        p1Balance: 17_000,
      });

      const delta: DeltaPayload = {
        tick: 24,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.PropertyManagement,
        dice: [4, 5],
        cells: [],
        players: [{ id: 'p1', position: 5, balance: 17_000 }],
      };

      handleDeltaTelemetry(delta, preState, postState);
      const stepViolations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'INVALID_POSITION_STEP');

      expect(stepViolations).toHaveLength(0);
    });
  });

  // =========================================================================
  // FACET 4: ACTIVITY LOG DEDUP & AUCTION ACCURACY
  // =========================================================================
  describe('Facet 4: Activity Log Dedup & Auction Accuracy', () => {
    it('[TC-54.18/MSS][UC-009] detectPropertyAndLevelActivities: khi thắng đấu giá ô 18 với giá 3250 Tr, tạo log type "buy" với amount -3250', () => {
      const prevState = createTestState({
        p1Balance: 15_000,
        auction: { cellIndex: 18, highestBid: 3250, highestBidder: 'p1', currentBid: 3250, highestBidderId: 'p1' },
      });

      const nextState = createTestState({
        p1Balance: 11_750,
        p1Props: [18],
        activeModal: null,
      });

      const delta: DeltaPayload = {
        tick: 30,
        currentTurnPlayerId: 'p1',
        cells: [{ index: 18, ownerId: 'p1' }],
        players: [{ id: 'p1', position: 18, balance: 11_750 }],
        auction: null,
      };

      const { entries } = detectPropertyAndLevelActivities(delta, prevState, nextState);
      const buyEntry = entries.find((e) => e.type === 'buy');

      expect(buyEntry).toBeDefined();
      expect(buyEntry?.amount).toBe(-3250);
    });

    it('[TC-54.19/A1][UC-009] detectPropertyAndLevelActivities: khi thắng đấu giá ô 18, message phải chứa cụm từ "đã thắng đấu giá"', () => {
      const prevState = createTestState({
        p1Balance: 15_000,
        auction: { cellIndex: 18, highestBid: 3250, highestBidder: 'p1', currentBid: 3250, highestBidderId: 'p1' },
      });

      const nextState = createTestState({
        p1Balance: 11_750,
        p1Props: [18],
        activeModal: null,
      });

      const delta: DeltaPayload = {
        tick: 31,
        currentTurnPlayerId: 'p1',
        cells: [{ index: 18, ownerId: 'p1' }],
        players: [{ id: 'p1', position: 18, balance: 11_750 }],
        auction: null,
      };

      const { entries } = detectPropertyAndLevelActivities(delta, prevState, nextState);
      const buyEntry = entries.find((e) => e.type === 'buy');

      expect(buyEntry?.message).toContain('đã thắng đấu giá');
    });

    it('[TC-54.20/A2][UC-009] detectFinancialAndStatusActivities: không sinh thêm log nộp phí/thuế (type "tax") cho khoản tiền thắng đấu giá 3250 Tr', () => {
      const prevState = createTestState({
        p1Balance: 15_000,
        auction: { cellIndex: 18, highestBid: 3250, highestBidder: 'p1', currentBid: 3250, highestBidderId: 'p1' },
      });

      const nextState = createTestState({
        p1Balance: 11_750,
        p1Props: [18],
        activeModal: null,
      });

      const delta: DeltaPayload = {
        tick: 32,
        currentTurnPlayerId: 'p1',
        cells: [{ index: 18, ownerId: 'p1' }],
        players: [{ id: 'p1', position: 18, balance: 11_750 }],
        auction: null,
      };

      const { context } = detectPropertyAndLevelActivities(delta, prevState, nextState);
      const finEntries = detectFinancialAndStatusActivities(delta, prevState, nextState, context);
      const taxEntries = finEntries.filter((e) => e.type === 'tax');

      expect(taxEntries).toHaveLength(0);
    });

    it('[TC-54.21/A3][UC-009] trackDeltaActivities: trong toàn bộ feed chỉ ghi nhận đúng 1 log mua đấu giá và 0 log thuế trong cùng tick thắng đấu giá', () => {
      const prevState = createTestState({
        p1Balance: 15_000,
        auction: { cellIndex: 18, highestBid: 3250, highestBidder: 'p1', currentBid: 3250, highestBidderId: 'p1' },
      });

      const nextState = createTestState({
        p1Balance: 11_750,
        p1Props: [18],
        activeModal: null,
      });

      const delta: DeltaPayload = {
        tick: 33,
        currentTurnPlayerId: 'p1',
        cells: [{ index: 18, ownerId: 'p1' }],
        players: [{ id: 'p1', position: 18, balance: 11_750 }],
        auction: null,
      };

      trackDeltaActivities(delta, prevState, nextState, useActivityStore);
      const logs = useActivityStore.getState().activityLogs;

      const buyLogs = logs.filter((l) => l.type === 'buy');
      const taxLogs = logs.filter((l) => l.type === 'tax');

      expect(buyLogs).toHaveLength(1);
      expect(taxLogs).toHaveLength(0);
    });
  });
});
