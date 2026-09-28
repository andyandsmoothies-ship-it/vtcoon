// [TC-216.01/MSS..TC-216.16/MSS][UC-IMP216]
// Contract Test Suite: IMP-216 Telemetry Invariant Watchdog Hardening & Multi-Event Deficit Defense
// Proves telemetry conservation, watchdog ergonomics, off-turn bot activity, and special event exemptions.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  computeExpectedDelta,
  handleDeltaTelemetry,
  checkIsTeleport,
  isUnmodeledEvent,
} from '../../src/client/telemetry/telemetry_delta_hook.js';
import {
  verifyTreasuryConservation,
  verifyMovementStep,
} from '../../src/client/telemetry/invariant_checker.js';
import {
  watchdogMonitor,
  WATCHDOG_LIMITS,
} from '../../src/client/telemetry/watchdog_monitor.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';
import { TurnPhase } from '../../src/domain/room.js';
import { ChanceCardId } from '../../src/domain/event_card_types.js';
import { BondTrancheId } from '../../src/domain/bond_types.js';
import type { GameState, PlayerHudInfo } from '../../src/client/store/game_store.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

function createTestState(overrides?: {
  readonly p1Balance?: number;
  readonly p2Balance?: number;
  readonly p1Pos?: number;
  readonly p1Props?: readonly number[];
  readonly p1OverdraftRounds?: number;
  readonly p1InAudit?: boolean;
  readonly p1AuditTurns?: number;
  readonly p1IsBot?: boolean;
  readonly p2IsBot?: boolean;
  readonly treasuryPool?: number;
  readonly roundNumber?: number;
  readonly turnPhase?: TurnPhase;
  readonly turnTimeRemaining?: number;
  readonly currentTurnPlayerId?: string;
  readonly activeModal?: string | null;
  readonly modalPayload?: unknown;
  readonly auction?: {
    readonly cellIndex: number;
    readonly highestBid: number;
    readonly highestBidder: string;
    readonly currentBid?: number;
    readonly highestBidderId?: string | null;
  } | null;
}): GameState {
  const p1Balance = overrides?.p1Balance ?? 15_000;
  const p2Balance = overrides?.p2Balance ?? 10_000;
  const p1Pos = overrides?.p1Pos ?? 0;
  const p1Props = overrides?.p1Props ? [...overrides.p1Props] : [];

  const playersInfo: Record<string, PlayerHudInfo> = {
    p1: {
      id: 'p1',
      name: 'Player 1',
      balance: p1Balance,
      tokenColor: '#ef4444',
      ownedProperties: p1Props,
      mortgagedProperties: [],
      isBot: overrides?.p1IsBot ?? false,
      overdraftRoundsLeft: overrides?.p1OverdraftRounds,
      inAudit: overrides?.p1InAudit,
      auditTurnsLeft: overrides?.p1AuditTurns,
    },
    p2: {
      id: 'p2',
      name: 'Player 2',
      balance: p2Balance,
      tokenColor: '#3b82f6',
      ownedProperties: [],
      mortgagedProperties: [],
      isBot: overrides?.p2IsBot ?? false,
    },
  };

  return {
    playersInfo,
    playerPositions: { p1: p1Pos, p2: 0 },
    visualPositions: { p1: p1Pos, p2: 0 },
    levelMap: {},
    treasuryPool: overrides?.treasuryPool ?? 2_000,
    currentTurnPlayerId: overrides?.currentTurnPlayerId ?? 'p1',
    turnTimeRemaining: overrides?.turnTimeRemaining ?? 30,
    turnPhase: overrides?.turnPhase ?? TurnPhase.WaitingRoll,
    roundNumber: overrides?.roundNumber ?? 1,
    maxRounds: 30,
    activeModal: overrides?.activeModal ?? (overrides?.auction ? 'auction' : null),
    modalPayload: overrides?.modalPayload ?? (overrides?.auction ? {
      cellIndex: overrides.auction.cellIndex,
      currentBid: overrides.auction.highestBid ?? overrides.auction.currentBid,
      highestBidderId: overrides.auction.highestBidder ?? overrides.auction.highestBidderId,
      timeRemaining: 0,
    } : null),
    auction: overrides?.auction ?? null,
    dice: [1, 1],
    isRolling: false,
    hasRolledThisTurn: false,
    activePawnAnimation: null,
    pawnAnimationQueue: [],
    pendingPawnMove: null,
    lastLandedPawn: null,
    lastEventCard: null,
    activeEmotes: {},
    floatingTexts: [],
    activeModifiers: [],
  } as unknown as GameState;
}

function simulateCountdownTicks(botId: string, count: number, baseTick: number): void {
  for (let i = 0; i < count; i++) {
    const pre = createTestState({
      currentTurnPlayerId: botId,
      turnTimeRemaining: 30 - i,
      p1IsBot: true,
    });
    const post = createTestState({
      currentTurnPlayerId: botId,
      turnTimeRemaining: 29 - i,
      p1IsBot: true,
    });
    const delta: DeltaPayload = {
      tick: baseTick + i,
      cells: [],
      currentTurnPlayerId: botId,
      roomStarted: true,
    };
    handleDeltaTelemetry(delta, pre, post);
  }
}

function simulateAuctionBidBurst(botId: string, burstCount: number, baseTick: number): void {
  for (let i = 0; i < burstCount; i++) {
    const pre = createTestState({
      currentTurnPlayerId: 'p1',
      p1IsBot: false,
      p2IsBot: true,
      auction: { cellIndex: 11, highestBid: 1000 + i * 100, highestBidder: botId },
    });
    const post = createTestState({
      currentTurnPlayerId: 'p1',
      p1IsBot: false,
      p2IsBot: true,
      auction: { cellIndex: 11, highestBid: 1000 + (i + 1) * 100, highestBidder: botId },
    });
    const delta: DeltaPayload = {
      tick: baseTick + i,
      cells: [],
      currentTurnPlayerId: 'p1',
      auction: {
        cellIndex: 11,
        highestBidderId: botId,
        currentBid: 1000 + (i + 1) * 100,
        timeRemaining: 15,
      },
      roomStarted: true,
    };
    handleDeltaTelemetry(delta, pre, post);
  }
}

describe('IMP-216: Telemetry Invariant Watchdog Hardening & Multi-Event Deficit Defense', () => {
  beforeEach(() => {
    useTelemetryStore.getState().reset();
    watchdogMonitor.reset();
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (Biên & Phạm vi tài chính)
  // =========================================================================
  describe('Facet 1: Boundary & Range', () => {
    it('[TC-216.01/MSS][UC-IMP216] computeExpectedDelta returns 0 for auction purchase instead of subtracting bid amount', () => {
      const preState = createTestState({
        p1Balance: 15_000,
        auction: { cellIndex: 11, highestBid: 1800, highestBidder: 'p1' },
        activeModal: 'auction',
        modalPayload: { cellIndex: 11, highestBid: 1800, highestBidderId: 'p1' },
      });
      const delta: DeltaPayload = {
        tick: 101,
        cells: [{ index: 11, ownerId: 'p1', level: 0 }],
        players: [{ id: 'p1', position: 11, balance: 13_200 }],
        treasury: 11_800,
        auction: null,
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState);
      expect(expected).toBe(0);
    });

    it('[TC-216.02/MSS][UC-IMP216] computeExpectedDelta returns exactly -deed.price for direct property purchase from Bank', () => {
      const preState = createTestState({
        p1Balance: 15_000,
        auction: null,
        activeModal: null,
      });
      const delta: DeltaPayload = {
        tick: 102,
        cells: [{ index: 1, ownerId: 'p1', level: 0 }],
        players: [{ id: 'p1', position: 1, balance: 14_400 }],
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState);
      expect(expected).toBe(-600);
    });

    it('[TC-216.03/MSS][UC-IMP216] computeExpectedDelta reflects +3000 when opening new overdraft facility', () => {
      const preState = createTestState({
        p1Balance: 500,
        p1OverdraftRounds: 0,
      });
      const delta: DeltaPayload = {
        tick: 103,
        cells: [],
        players: [{ id: 'p1', position: 0, balance: 3_500, overdraftRoundsLeft: 3 }],
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState);
      expect(expected).toBe(3_000);
    });

    it('[TC-216.04/MSS][UC-IMP216] computeExpectedDelta reflects -3300 overdraft clawback when overdraft expires passing GO', () => {
      const preState = createTestState({
        p1Balance: 5_000,
        p1Pos: 38,
        p1OverdraftRounds: 1,
        roundNumber: 1,
      });
      const movement = {
        fromPosition: 38,
        toPosition: 1,
        dice: [1, 2] as const,
        isTeleport: false,
      };
      const delta: DeltaPayload = {
        tick: 104,
        cells: [],
        roundNumber: 1,
        players: [{ id: 'p1', position: 1, balance: 3_700, overdraftRoundsLeft: 0 }],
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState, movement);
      expect(expected).toBe(-1_300);
    });
  });

  // =========================================================================
  // FACET 2: MULTI-EVENT COLLISION & TREASURY INVARIANT
  // =========================================================================
  describe('Facet 2: Multi-Event Collision & Treasury Invariant', () => {
    it('[TC-216.05/MSS][UC-IMP216] auction completion concurrent with treasury stimulus does not violate conservation', () => {
      const preState = createTestState({
        p1Balance: 15_000,
        p2Balance: 500,
        treasuryPool: 2_000,
        roundNumber: 1,
        auction: { cellIndex: 11, highestBid: 1800, highestBidder: 'p1' },
        activeModal: 'auction',
      });
      const delta: DeltaPayload = {
        tick: 576,
        roundNumber: 2,
        cells: [{ index: 11, ownerId: 'p1', level: 0 }],
        players: [
          { id: 'p1', position: 11, balance: 13_200 },
          { id: 'p2', position: 5, balance: 1_000 },
        ],
        treasury: 3_300,
        auction: null,
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState);
      const violation = verifyTreasuryConservation({
        preBalances: { p1: 15_000, p2: 500 },
        postBalances: { p1: 13_200, p2: 1_000 },
        preTreasury: 2_000,
        postTreasury: 3_300,
        tick: 576,
        expectedDelta: expected ?? 0,
        roomStarted: true,
      });

      expect(expected).toBe(0);
      expect(violation).toBeNull();
    });

    it('[TC-216.06/MSS][UC-IMP216] foreclosure auction preserves closed system without treasury invariant violation', () => {
      const preState = createTestState({
        p1Balance: 10_000,
        p2Balance: -200,
        treasuryPool: 2_000,
        auction: { cellIndex: 11, highestBid: 1000, highestBidder: 'p1' },
        activeModal: 'auction',
      });
      const delta: DeltaPayload = {
        tick: 577,
        cells: [{ index: 11, ownerId: 'p1', level: 0 }],
        players: [
          { id: 'p1', position: 11, balance: 9_000 },
          { id: 'p2', position: 10, balance: 100 },
        ],
        treasury: 2_700,
        auction: null,
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState);
      const violation = verifyTreasuryConservation({
        preBalances: { p1: 10_000, p2: -200 },
        postBalances: { p1: 9_000, p2: 100 },
        preTreasury: 2_000,
        postTreasury: 2_700,
        tick: 577,
        expectedDelta: expected ?? 0,
        roomStarted: true,
      });

      expect(expected).toBe(0);
      expect(violation).toBeNull();
    });

    it('[TC-216.07/MSS][UC-IMP216] passing GO with property tax and overdraft payoff reconciles net system delta', () => {
      const preState = createTestState({
        p1Balance: 5_000,
        p1Pos: 38,
        p1Props: [1],
        p1OverdraftRounds: 1,
        roundNumber: 1,
      });
      const movement = {
        fromPosition: 38,
        toPosition: 2,
        dice: [2, 2] as const,
        isTeleport: false,
      };
      const delta: DeltaPayload = {
        tick: 578,
        cells: [],
        roundNumber: 1,
        players: [{ id: 'p1', position: 2, balance: 3_700, overdraftRoundsLeft: 0 }],
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState, movement);
      expect(expected).toBe(-1_300);
    });
  });

  // =========================================================================
  // FACET 3: WATCHDOG PACING & GUARD PARAMETERS
  // =========================================================================
  describe('Facet 3: Watchdog Pacing & Guard Parameters', () => {
    it('[TC-216.08/MSS][UC-IMP216] turnTimeRemaining <= -5 during AuctionPhase does not trigger TURN_STALLED', () => {
      const preState = createTestState({
        turnPhase: TurnPhase.AuctionPhase,
        turnTimeRemaining: 10,
        currentTurnPlayerId: 'p1',
      });
      const postState = createTestState({
        turnPhase: TurnPhase.AuctionPhase,
        turnTimeRemaining: -6,
        currentTurnPlayerId: 'p1',
      });
      const delta: DeltaPayload = {
        tick: 601,
        cells: [],
        turnPhase: TurnPhase.AuctionPhase,
        roomStarted: true,
      };

      handleDeltaTelemetry(delta, preState, postState);
      const stallViolations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TURN_STALLED');

      expect(stallViolations).toHaveLength(0);
    });

    it('[TC-216.09/MSS][UC-IMP216] turnTimeRemaining <= -5 in ActionPhase triggers TURN_STALLED', () => {
      const preState = createTestState({
        turnPhase: TurnPhase.ActionPhase,
        turnTimeRemaining: 10,
        currentTurnPlayerId: 'p1',
      });
      const postState = createTestState({
        turnPhase: TurnPhase.ActionPhase,
        turnTimeRemaining: -6,
        currentTurnPlayerId: 'p1',
      });
      const delta: DeltaPayload = {
        tick: 602,
        cells: [],
        turnPhase: TurnPhase.ActionPhase,
        roomStarted: true,
      };

      handleDeltaTelemetry(delta, preState, postState);
      const stallViolations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TURN_STALLED');

      expect(stallViolations.length).toBeGreaterThan(0);
      expect(stallViolations[0]?.type).toBe('TURN_STALLED');
    });

    it('[TC-216.10/MSS][UC-IMP216] auction stalling beyond 90,000ms with zero progress triggers TURN_STALLED', () => {
      const violation = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 0,
        elapsedTurnMs: 91_000,
        tick: 603,
        isInAuction: true,
        hasProgress: false,
      });

      expect(violation).toBeDefined();
      expect(violation?.type).toBe('TURN_STALLED');
      expect(violation?.severity).toBe('WARNING');
    });
  });

  // =========================================================================
  // FACET 4: BOT ACTION FREQUENCY VS NETWORK TICKS
  // =========================================================================
  describe('Facet 4: Bot Action Frequency vs Network Ticks', () => {
    it('[TC-216.11/MSS][UC-IMP216] countdown network ticks without bot gameplay actions do not trigger BOT_INFINITE_LOOP', () => {
      simulateCountdownTicks('p1', 10, 700);

      const botViolations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'BOT_INFINITE_LOOP');

      expect(botViolations).toHaveLength(0);
    });

    it('[TC-216.12/MSS][UC-IMP216] off-turn bot burst bidding in auction triggers BOT_INFINITE_LOOP using dynamic limits', () => {
      const burstCount = WATCHDOG_LIMITS.BOT_BURST_MAX_ACTIONS + 1;
      simulateAuctionBidBurst('p2', burstCount, 800);

      const botViolations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'BOT_INFINITE_LOOP');

      expect(botViolations.length).toBeGreaterThan(0);
      expect(botViolations[0]?.type).toBe('BOT_INFINITE_LOOP');
    });
  });

  // =========================================================================
  // FACET 5: STATE TRANSITIONS & SPECIAL MECHANICS
  // =========================================================================
  describe('Facet 5: State Transitions & Special Mechanics', () => {
    it('[TC-216.13/MSS][UC-IMP216] audit bail payment > 500M with undefined auditTurnsLeft is treated as closed transfer', () => {
      const preState = createTestState({
        p1Balance: 15_000,
        p1InAudit: true,
        p1AuditTurns: 2,
        p1Pos: 10,
        treasuryPool: 10_000,
      });
      const postState = createTestState({
        p1Balance: 13_000,
        p1InAudit: false,
        p1AuditTurns: 0,
        p1Pos: 10,
        treasuryPool: 12_000,
      });
      const delta: DeltaPayload = {
        tick: 850,
        cells: [],
        treasury: 12_000,
        players: [{ id: 'p1', position: 10, balance: 13_000, inAudit: false, auditTurnsLeft: undefined }],
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState);
      handleDeltaTelemetry(delta, preState, postState);
      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');

      expect(expected).toBe(0);
      expect(violations).toHaveLength(0);
    });

    it('[TC-216.14/MSS][UC-IMP216] corporate bond issuance or repayment is recognized as unmodeled event exempting check', () => {
      const preState = createTestState({
        p1Balance: 5_000,
        p1Pos: 1,
      });
      const delta: DeltaPayload = {
        tick: 860,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 1,
            balance: 8_000,
            bondContract: {
              trancheId: BondTrancheId.ALL_IN,
              principal: 3_000,
              repayAmount: 3_600,
              roundsLeft: 3,
              collateralCells: [1, 3],
              isActive: true,
            },
          },
        ],
        roomStarted: true,
      };

      const isUnmodeled = isUnmodeledEvent ? isUnmodeledEvent(delta, preState) : false;
      const expected = computeExpectedDelta(delta, preState);

      expect(isUnmodeled).toBe(true);
      expect(expected).toBeNull();
    });

    it('[TC-216.15/MSS][UC-IMP216] event card MC_MARKET_TOUR teleporting 4 players simultaneously reports no INVALID_POSITION_STEP', () => {
      const isTeleportP4 = checkIsTeleport(15, 20, false, undefined, true);
      const violation = verifyMovementStep({
        fromPosition: 15,
        toPosition: 20,
        tick: 870,
        isTeleport: isTeleportP4,
        roomStarted: true,
      });

      expect(isTeleportP4).toBe(true);
      expect(violation).toBeNull();
    });

    it('[TC-216.16/MSS][UC-IMP216] dividend event card modifying balance on property tile is recognized and exempt from invariant check', () => {
      const preState = createTestState({
        p1Balance: 15_000,
        p1Pos: 1,
      });
      const postState = createTestState({
        p1Balance: 16_000,
        p1Pos: 1,
      });
      const delta: DeltaPayload = {
        tick: 880,
        cells: [],
        lastEventCard: {
          id: ChanceCardId.CC_STOCK_PROFIT,
          type: 'Chance',
          title: 'Cổ tức',
          description: 'Cổ tức',
        },
        players: [{ id: 'p1', position: 1, balance: 16_000 }],
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState);
      handleDeltaTelemetry(delta, preState, postState);
      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');

      expect(expected).toBeNull();
      expect(violations).toHaveLength(0);
    });
  });
});
