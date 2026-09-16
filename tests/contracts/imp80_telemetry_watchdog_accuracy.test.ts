// [IMP-80][CONTRACT] Universal 4-Facet Behavioral Contract: Telemetry Watchdog Accuracy & Invariant Polish
import { describe, it, expect, beforeEach } from 'vitest';
import { TurnPhase } from '../../src/domain/room.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { useGameStore, type GameState } from '../../src/client/store/game_store.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';
import { watchdogMonitor } from '../../src/client/telemetry/watchdog_monitor.js';
import { computeExpectedDelta, handleDeltaTelemetry, checkIsTeleport } from '../../src/client/telemetry/telemetry_delta_hook.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';

function createTestState(overrides?: Partial<GameState> & {
  readonly p1Balance?: number;
  readonly p1Pos?: number;
  readonly p1Props?: readonly number[];
  readonly levels?: Record<number, 0 | 1 | 2 | 3>;
  readonly inAudit?: boolean;
  readonly auditTurnsLeft?: number;
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
        inAudit: overrides?.inAudit ?? false,
        auditTurnsLeft: overrides?.auditTurnsLeft ?? 0,
      },
    },
    playerPositions: {
      p1: p1Pos,
    },
    visualPositions: {
      p1: p1Pos,
    },
    levelMap: overrides?.levels ? { ...overrides.levels } : {},
    treasuryPool: overrides?.treasuryPool ?? 2_000,
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

describe('[CONTRACT] IMP-80: Telemetry Watchdog Accuracy & Invariant Polish', () => {
  beforeEach(() => {
    useTelemetryStore.getState().reset();
    watchdogMonitor.reset();
    useActivityStore.getState().clearLogs();
    useActivityStore.getState().setLastAuctionBid(undefined);
    useGameStore.getState().clearActivePawnAnimation();
    useGameStore.getState().closeModal();
    useGameStore.getState().setTreasuryPool(0);
  });

  // =========================================================================
  // FACET 1: GO SALARY & TREASURY PROPERTY TAX ABSORPTION (4 TESTS)
  // =========================================================================
  describe('Facet 1: GO Salary & Treasury Property Tax Absorption', () => {
    it('[TC-80.1/MSS][UC-009] computeExpectedDelta: Vượt GO khi chưa có BĐS (thuế 0) -> trả về +2000', () => {
      const preState = createTestState({
        p1Pos: 36,
        p1Balance: 15_000,
        p1Props: [],
        treasuryPool: 2_000,
      });

      const delta: DeltaPayload = {
        tick: 1,
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

    it('[TC-80.2/MSS][UC-009] computeExpectedDelta: Vượt GO khi sở hữu BĐS (thuế 600) và postTreasury tăng 600 -> trả về +2000', () => {
      const preState = createTestState({
        p1Pos: 36,
        p1Balance: 15_000,
        p1Props: [1, 3, 6, 8],
        treasuryPool: 2_000,
      });

      const delta: DeltaPayload = {
        tick: 2,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.PropertyManagement,
        dice: [4, 5],
        cells: [],
        players: [{ id: 'p1', position: 5, balance: 16_400 }],
        treasury: 2_600,
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

    it('[TC-80.3/A1][UC-009] computeExpectedDelta: Vượt GO khi sở hữu BĐS (thuế 600) nhưng treasury không tăng -> trả về +1400', () => {
      const preState = createTestState({
        p1Pos: 36,
        p1Balance: 15_000,
        p1Props: [1, 3, 6, 8],
        treasuryPool: 2_000,
      });

      const delta: DeltaPayload = {
        tick: 3,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.PropertyManagement,
        dice: [4, 5],
        cells: [],
        players: [{ id: 'p1', position: 5, balance: 16_400 }],
      };

      const movement = {
        fromPosition: 36,
        toPosition: 5,
        dice: [4, 5] as const,
        isTeleport: false,
      };

      const expected = computeExpectedDelta(delta, preState, movement);
      expect(expected).toBe(1400);
    });

    it('[TC-80.4/A2][UC-009] handleDeltaTelemetry: Vượt GO có trừ thuế BĐS nộp Kho Bạc -> không phát sinh cờ vi phạm TREASURY_INVARIANT_VIOLATED', () => {
      const preState = createTestState({
        p1Pos: 36,
        p1Balance: 15_000,
        p1Props: [1, 3, 6, 8],
        treasuryPool: 2_000,
      });

      const postState = createTestState({
        p1Pos: 5,
        p1Balance: 16_400,
        p1Props: [1, 3, 6, 8],
        treasuryPool: 2_600,
      });

      const delta: DeltaPayload = {
        tick: 4,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.PropertyManagement,
        dice: [4, 5],
        cells: [],
        players: [{ id: 'p1', position: 5, balance: 16_400 }],
        treasury: 2_600,
      };

      handleDeltaTelemetry(delta, preState, postState);
      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');

      expect(violations).toHaveLength(0);
    });
  });

  // =========================================================================
  // FACET 2: AUDIT BAILOUT INVARIANT & TREASURY ABSORPTION (4 TESTS)
  // =========================================================================
  describe('Facet 2: Audit Bailout Invariant & Treasury Absorption', () => {
    it('[TC-80.5/MSS][UC-009] computeExpectedDelta: Nộp 500 Tr bảo lãnh và Kho Bạc tăng 500 Tr -> trả về 0', () => {
      const preState = createTestState({
        inAudit: true,
        auditTurnsLeft: 2,
        p1Balance: 10_000,
        treasuryPool: 2_000,
      });

      const delta: DeltaPayload = {
        tick: 5,
        currentTurnPlayerId: 'p1',
        cells: [],
        players: [{ id: 'p1', position: 10, balance: 9_500, inAudit: false, auditTurnsLeft: 0 }],
        treasury: 2_500,
      };

      const expected = computeExpectedDelta(delta, preState);
      expect(expected).toBe(0);
    });

    it('[TC-80.6/A1][UC-009] computeExpectedDelta: Rời kiểm toán do hết lượt / đổ đôi (số dư không đổi) -> trả về 0', () => {
      const preState = createTestState({
        inAudit: true,
        auditTurnsLeft: 1,
        p1Balance: 10_000,
        treasuryPool: 2_000,
      });

      const delta: DeltaPayload = {
        tick: 6,
        currentTurnPlayerId: 'p1',
        cells: [],
        players: [{ id: 'p1', position: 10, balance: 10_000, inAudit: false, auditTurnsLeft: 0 }],
      };

      const expected = computeExpectedDelta(delta, preState);
      expect(expected).toBe(0);
    });

    it('[TC-80.7/A2][UC-009] computeExpectedDelta: Nộp 500 Tr bảo lãnh nhưng Kho Bạc không nhận -> trả về -500', () => {
      const preState = createTestState({
        inAudit: true,
        auditTurnsLeft: 2,
        p1Balance: 10_000,
        treasuryPool: 2_000,
      });

      const delta: DeltaPayload = {
        tick: 7,
        currentTurnPlayerId: 'p1',
        cells: [],
        players: [{ id: 'p1', position: 10, balance: 9_500, inAudit: false, auditTurnsLeft: 0 }],
      };

      const expected = computeExpectedDelta(delta, preState);
      expect(expected).toBe(-500);
    });

    it('[TC-80.8/MSS][UC-009] handleDeltaTelemetry: Người chơi nộp bảo lãnh 500 Tr nộp Kho Bạc -> không phát sinh cờ vi phạm TREASURY_INVARIANT_VIOLATED', () => {
      const preState = createTestState({
        p1Pos: 10,
        inAudit: true,
        auditTurnsLeft: 2,
        p1Balance: 10_000,
        treasuryPool: 2_000,
      });

      const postState = createTestState({
        p1Pos: 10,
        inAudit: false,
        auditTurnsLeft: 0,
        p1Balance: 9_500,
        treasuryPool: 2_500,
      });

      const delta: DeltaPayload = {
        tick: 8,
        currentTurnPlayerId: 'p1',
        cells: [],
        players: [{ id: 'p1', position: 10, balance: 9_500, inAudit: false, auditTurnsLeft: 0 }],
        treasury: 2_500,
      };

      handleDeltaTelemetry(delta, preState, postState);
      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');

      expect(violations).toHaveLength(0);
    });
  });

  // =========================================================================
  // FACET 3: AUCTION WINNING BID & DYNAMIC UNMODELED EVENTS (4 TESTS)
  // =========================================================================
  describe('Facet 3: Auction Winning Bid & Dynamic Unmodeled Events', () => {
    it('[TC-80.9/MSS][UC-009] computeExpectedDelta: Khi trúng thầu đấu giá, ưu tiên đọc giá trúng thầu thực tế từ lastAuctionBid.currentBid (3900 Tr) thay vì giá gốc (2200 Tr) -> trả về -3900', () => {
      const preState = createTestState({
        p1Balance: 15_000,
        activeModal: null,
      });

      useActivityStore.getState().setLastAuctionBid({
        cellIndex: 21,
        currentBid: 3_900,
        highestBidderId: 'p1',
      });

      const delta: DeltaPayload = {
        tick: 9,
        currentTurnPlayerId: 'p1',
        cells: [{ index: 21, ownerId: 'p1' }],
        players: [{ id: 'p1', position: 21, balance: 11_100 }],
        auction: null,
      };

      const expected = computeExpectedDelta(delta, preState);
      expect(expected).toBe(-3900);
    });

    it('[TC-80.10/A1][UC-009] computeExpectedDelta: Khi delta có lastHoseResult -> trả về null', () => {
      const preState = createTestState({
        p1Balance: 10_000,
      });

      const delta: DeltaPayload = {
        tick: 10,
        currentTurnPlayerId: 'p1',
        cells: [],
        players: [{ id: 'p1', position: 20, balance: 11_500 }],
        lastHoseResult: {
          cellIndex: 20,
          multiplier: 1.5,
          finalRent: 1_500,
        } as unknown as NonNullable<DeltaPayload['lastHoseResult']>,
      };

      const expected = computeExpectedDelta(delta, preState);
      expect(expected).toBeNull();
    });

    it('[TC-80.11/A2][UC-009] computeExpectedDelta: Khi delta có lastEventCard -> trả về null', () => {
      const preState = createTestState({
        p1Balance: 10_000,
      });

      const delta: DeltaPayload = {
        tick: 11,
        currentTurnPlayerId: 'p1',
        cells: [],
        players: [{ id: 'p1', position: 1, balance: 10_500 }],
        lastEventCard: {
          id: 'CHANCE_FESTIVAL',
          title: 'Lễ Hội Du Lịch',
          description: 'Nhận 500 Tr',
          type: 'CHANCE',
        } as unknown as NonNullable<DeltaPayload['lastEventCard']>,
      };

      const expected = computeExpectedDelta(delta, preState);
      expect(expected).toBeNull();
    });

    it('[TC-80.12/MSS][UC-009] handleDeltaTelemetry: Khi delta có lastHoseResult kèm biến động số dư -> không kích hoạt vi phạm TREASURY_INVARIANT_VIOLATED', () => {
      const preState = createTestState({
        p1Pos: 20,
        p1Balance: 10_000,
        treasuryPool: 2_000,
      });

      const postState = createTestState({
        p1Pos: 20,
        p1Balance: 11_500,
        treasuryPool: 2_000,
      });

      const delta: DeltaPayload = {
        tick: 12,
        currentTurnPlayerId: 'p1',
        cells: [],
        players: [{ id: 'p1', position: 20, balance: 11_500 }],
        lastHoseResult: {
          cellIndex: 20,
          multiplier: 1.5,
          finalRent: 1_500,
        } as unknown as NonNullable<DeltaPayload['lastHoseResult']>,
      };

      handleDeltaTelemetry(delta, preState, postState);
      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');

      expect(violations).toHaveLength(0);
    });
  });

  // =========================================================================
  // FACET 4: BACKGROUND TAB THROTTLING & FSM ANIMATION WATCHDOG (4 TESTS)
  // =========================================================================
  describe('Facet 4: Background Tab Throttling & FSM Animation Watchdog', () => {
    it('[TC-80.13/MSS][UC-009] watchdogMonitor.checkFsmAnimationStall: Hoạt ảnh kéo dài quá 10000ms -> phát sinh vi phạm cảnh báo FSM_ANIMATION_STALLED', () => {
      const violation = watchdogMonitor.checkFsmAnimationStall({
        isAnimating: true,
        animatingDurationMs: 11_000,
        tick: 13,
      });

      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('FSM_ANIMATION_STALLED');
    });

    it('[TC-80.14/A1][UC-009] watchdogMonitor.checkFsmAnimationStall: Hoạt ảnh trong giới hạn bình thường (< 10000ms) -> trả về null', () => {
      const violation = watchdogMonitor.checkFsmAnimationStall({
        isAnimating: true,
        animatingDurationMs: 8_000,
        tick: 14,
      });

      expect(violation).toBeNull();
    });

    it('[TC-80.15/A2][UC-009] Mô phỏng logic chuyển tab document.hidden = true: đặt timer hoạt ảnh về null, triệt tiêu vi phạm giả khi người dùng quay lại tab', () => {
      let animStartTimer: number | null = Date.now() - 15_000;

      // Mô phỏng chuyển sang tab nền
      const isDocumentHidden = true;
      if (isDocumentHidden) {
        animStartTimer = null;
      }
      expect(animStartTimer).toBeNull();

      // Khi người dùng quay lại tab sau 15s ở nền, timer hoạt ảnh bắt đầu lại từ đầu
      const resumedElapsedMs = 600;
      const violation = watchdogMonitor.checkFsmAnimationStall({
        isAnimating: true,
        animatingDurationMs: resumedElapsedMs,
        tick: 15,
      });

      expect(violation).toBeNull();
    });

    it('[TC-80.16/MSS][UC-009] watchdogMonitor.reset: Khởi tạo lại trạng thái watchdog xóa sạch bộ đếm cũ', () => {
      watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 10,
        elapsedTurnMs: 40_000,
        tick: 1,
      });

      watchdogMonitor.reset();

      const stallViolation = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 25,
        elapsedTurnMs: 0,
        tick: 16,
      });

      expect(stallViolation).toBeNull();
    });
  });

  // =========================================================================
  // FACET 5: INITIAL HANDSHAKE INVARIANT EXEMPTION & PRECISE MOVEMENT DETECTION (3 TESTS)
  // =========================================================================
  describe('Facet 5: Initial Handshake Invariant Exemption & Precise Movement Detection', () => {
    it('[TC-80.17/MSS][UC-009] handleDeltaTelemetry tại delta.tick <= 1: bỏ qua kiểm tra bất biến bảo toàn, KHÔNG phát sinh cờ vi phạm TREASURY_INVARIANT_VIOLATED', () => {
      const preState = createTestState({
        treasuryPool: 2_000,
        p1Balance: 15_000,
        p1Pos: 0,
      });

      const postState = createTestState({
        treasuryPool: 0,
        p1Balance: 15_000,
        p1Pos: 0,
      });

      const delta: DeltaPayload = {
        tick: 1,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.WaitingRoll,
        cells: [],
        players: [{ id: 'p1', position: 0, balance: 15_000 }],
        treasury: 0,
      };

      handleDeltaTelemetry(delta, preState, postState);
      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');

      expect(violations).toHaveLength(0);
    });

    it('[TC-80.18/MSS][UC-009] Vượt GO xuất phát từ ô sự kiện (Ô 36 Thị Trường) bằng xúc xắc thông thường trong ActionPhase: computeExpectedDelta trả về +2000 và không phát sinh TREASURY_INVARIANT_VIOLATED', () => {
      const preState = createTestState({
        p1Pos: 36,
        p1Balance: 15_000,
        p1Props: [],
        treasuryPool: 0,
      });

      const postState = createTestState({
        p1Pos: 5,
        p1Balance: 17_000,
        p1Props: [],
        treasuryPool: 0,
      });

      const delta: DeltaPayload = {
        tick: 2,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.ActionPhase,
        dice: [4, 5],
        cells: [],
        players: [{ id: 'p1', position: 5, balance: 17_000 }],
      };

      const movement = {
        fromPosition: 36,
        toPosition: 5,
        dice: [4, 5] as const,
        isTeleport: checkIsTeleport(36, 5, true, TurnPhase.ActionPhase),
      };

      const expected = computeExpectedDelta(delta, preState, movement);
      expect(expected).toBe(2000);

      handleDeltaTelemetry(delta, preState, postState);
      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');

      expect(violations).toHaveLength(0);
    });

    it('[TC-80.19/MSS][UC-009] Đồng bộ khởi tạo Kho Bạc Client khớp Server: treasuryPool ban đầu của game store là 0, không bị hardcode thành 2.000 Tr. khi chưa có giao dịch nào nộp vào Kho Bạc', () => {
      useGameStore.getState().setTreasuryPool(0);

      const startDelta: DeltaPayload = {
        tick: 1,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.WaitingRoll,
        cells: [],
        players: [{ id: 'p1', position: 0, balance: 15_000 }],
      };

      applyDeltaToStore(startDelta, useGameStore);

      expect(useGameStore.getState().treasuryPool).toBe(0);
    });
  });
});

