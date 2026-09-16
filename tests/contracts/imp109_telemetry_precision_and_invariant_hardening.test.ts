// [TC-109.01/MSS..TC-109.15/A4][UC-IMP109]
// Contract Test Suite: IMP-109 Telemetry Watchdog Precision & Invariant Hardening
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Dice Roller Attribution (detectMovement preserves dice when diceRollerId matches p.id even if currentTurnPlayerId advanced)
// Facet 2: Auction Closing Settlement (computeCellDelta accurately reconciles winning bid against actual buyer cash outflow)
// Facet 3: Animation Stall Threshold (MAX_ANIMATION_DURATION_MS relaxes to 15,000ms allowing 10.2s moves at 30 FPS)
// Facet 4: Error Defense & Boundary Guard (undefined diceRollerId fallback, invalid positions, null states)

import { describe, it, expect } from 'vitest';
import {
  detectMovement,
  computeExpectedDelta,
} from '../../src/client/telemetry/telemetry_delta_hook';
import {
  verifyMovementStep,
  verifyTreasuryConservation,
} from '../../src/client/telemetry/invariant_checker';
import {
  WATCHDOG_LIMITS,
  WatchdogMonitor,
} from '../../src/client/telemetry/watchdog_monitor';
import { TurnPhase } from '../../src/domain/room';
import type { DeltaPayload } from '../../src/server/session_manager';
import type { GameState } from '../../src/client/store/game_store';

describe('IMP-109 Telemetry Watchdog Precision & Invariant Hardening', () => {
  // =========================================================================
  // FACET 1: DICE ROLLER ATTRIBUTION IN ADVANCED TURN PHASES
  // =========================================================================
  describe('Facet 1: Dice Roller Attribution (detectMovement with diceRollerId)', () => {
    it('[TC-109.01/MSS] detectMovement preserves dice for p1 when diceRollerId is p1 even if currentTurnPlayerId is bot_2', () => {
      const delta: DeltaPayload = {
        tick: 207,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 16,
            balance: 1750,
          },
        ],
        currentPlayerIndex: 1,
        currentTurnPlayerId: 'bot_2',
        dice: [5, 4],
        diceRollerId: 'p1',
        diceSeq: 59,
        turnPhase: TurnPhase.WaitingRoll,
        roomStarted: true,
      };

      const prePositions = { p1: 7, bot_2: 10, bot_3: 35, bot_4: 38 };
      const movement = detectMovement(delta, prePositions);

      expect(movement).toBeDefined();
      expect(movement?.fromPosition).toBe(7);
      expect(movement?.toPosition).toBe(16);
      expect(movement?.dice).toEqual([5, 4]);
      expect(movement?.isTeleport).toBe(false);
    });

    it('[TC-109.02/MSS] verifyMovementStep does NOT flag INVALID_POSITION_STEP when dice matches move under diceRollerId', () => {
      const delta: DeltaPayload = {
        tick: 207,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 16,
            balance: 1750,
          },
        ],
        currentPlayerIndex: 1,
        currentTurnPlayerId: 'bot_2',
        dice: [5, 4],
        diceRollerId: 'p1',
        diceSeq: 59,
        turnPhase: TurnPhase.WaitingRoll,
        roomStarted: true,
      };

      const prePositions = { p1: 7, bot_2: 10, bot_3: 35, bot_4: 38 };
      const movement = detectMovement(delta, prePositions);

      const violation = verifyMovementStep({
        fromPosition: movement!.fromPosition,
        toPosition: movement!.toPosition,
        dice: movement!.dice,
        tick: delta.tick,
        isTeleport: movement!.isTeleport,
      });

      expect(violation).toBeNull();
    });

    it('[TC-109.03/MSS] detectMovement preserves dice for bot_4 when diceRollerId is bot_4 on tick 26 (from 12 to 18)', () => {
      const delta: DeltaPayload = {
        tick: 26,
        cells: [],
        players: [
          {
            id: 'bot_4',
            position: 18,
            balance: 14000,
          },
        ],
        currentPlayerIndex: 0,
        currentTurnPlayerId: 'p1',
        dice: [3, 3],
        diceRollerId: 'bot_4',
        diceSeq: 10,
        turnPhase: TurnPhase.WaitingRoll,
        roomStarted: true,
      };

      const prePositions = { p1: 0, bot_2: 0, bot_3: 0, bot_4: 12 };
      const movement = detectMovement(delta, prePositions);

      expect(movement).toBeDefined();
      expect(movement?.fromPosition).toBe(12);
      expect(movement?.toPosition).toBe(18);
      expect(movement?.dice).toEqual([3, 3]);
      expect(movement?.isTeleport).toBe(false);
    });

    it('[TC-109.04/MSS] detectMovement preserves dice for bot_2 on tick 95 (from 14 to 21, roll 3+4)', () => {
      const delta: DeltaPayload = {
        tick: 95,
        cells: [],
        players: [
          {
            id: 'bot_2',
            position: 21,
            balance: 12000,
          },
        ],
        currentPlayerIndex: 2,
        currentTurnPlayerId: 'bot_3',
        dice: [3, 4],
        diceRollerId: 'bot_2',
        diceSeq: 32,
        turnPhase: TurnPhase.WaitingRoll,
        roomStarted: true,
      };

      const prePositions = { p1: 10, bot_2: 14, bot_3: 5, bot_4: 8 };
      const movement = detectMovement(delta, prePositions);

      expect(movement).toBeDefined();
      expect(movement?.fromPosition).toBe(14);
      expect(movement?.toPosition).toBe(21);
      expect(movement?.dice).toEqual([3, 4]);
      expect(movement?.isTeleport).toBe(false);
    });
  });

  // =========================================================================
  // FACET 2: AUCTION CLOSING SETTLEMENT & RECONCILIATION
  // =========================================================================
  describe('Facet 2: Auction Closing Settlement & Cash Outflow', () => {
    it('[TC-109.05/MSS] computeExpectedDelta reconciles winning bid of 1650 Tr against buyer cash reduction', () => {
      const preState = {
        playersInfo: {
          p1: { id: 'p1', balance: 10000, ownedProperties: [] as number[], inAudit: false, isBot: false },
          bot_2: { id: 'bot_2', balance: 13000, ownedProperties: [] as number[], inAudit: false, isBot: true },
        },
        playerPositions: { p1: 6, bot_2: 0 },
        levelMap: {},
        treasuryPool: 12000,
        activeModal: null,
        auction: {
          cellIndex: 6,
          highestBid: 500, // Initial start bid
          highestBidder: 'p1',
        },
      } as unknown as GameState;

      // Delta where p1 wins auction for cell 6 at 1650 Tr (balance drops from 10000 to 8350)
      const delta: DeltaPayload = {
        tick: 3,
        cells: [{ index: 6, ownerId: 'p1', level: 0 }],
        players: [{ id: 'p1', position: 0, balance: 8350 }],
        auction: null, // Auction closed
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState);
      expect(expected).toBe(-1650);
    });

    it('[TC-109.06/MSS] verifyTreasuryConservation does NOT trigger violation when delta matches actual buyer cash outflow', () => {
      const preBalances = { p1: 10000, bot_2: 13000 };
      const postBalances = { p1: 8350, bot_2: 13000 }; // -1650 delta

      const violation = verifyTreasuryConservation({
        preBalances,
        postBalances,
        preTreasury: 12000,
        postTreasury: 12000,
        tick: 3,
        expectedDelta: -1650,
        roomStarted: true,
      });

      expect(violation).toBeNull();
    });

    it('[TC-109.07/MSS] computeExpectedDelta falls back to deed price when cell is bought directly outside auction', () => {
      const preState = {
        playersInfo: {
          p1: { id: 'p1', balance: 10000, ownedProperties: [] as number[], inAudit: false, isBot: false },
        },
        playerPositions: { p1: 6 },
        levelMap: {},
        treasuryPool: 12000,
        activeModal: null,
        auction: null,
      } as unknown as GameState;

      // Cell 6 price is 1000 Tr
      const delta: DeltaPayload = {
        tick: 4,
        cells: [{ index: 6, ownerId: 'p1', level: 0 }],
        players: [{ id: 'p1', position: 0, balance: 9000 }],
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState);
      expect(expected).toBe(-1000);
    });

    it('[TC-109.08/MSS] computeExpectedDelta absorbs auction fee if treasuryPool increased', () => {
      const preState = {
        playersInfo: {
          p1: { id: 'p1', balance: 10000, ownedProperties: [] as number[], inAudit: false, isBot: false },
        },
        playerPositions: { p1: 6 },
        levelMap: {},
        treasuryPool: 12000,
        activeModal: null,
        auction: { cellIndex: 6, highestBid: 1650, highestBidder: 'p1' },
      } as unknown as GameState;

      // Insolvent liquidation auction where proceeds go to Treasury
      const delta: DeltaPayload = {
        tick: 15,
        cells: [{ index: 6, ownerId: 'p1', level: 0 }],
        players: [{ id: 'p1', position: 0, balance: 8350 }],
        treasury: 13650, // +1650 absorbed
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState, undefined, 13650);
      // Net change across entire game is 0 because -1650 from p1 and +1650 to Treasury
      expect(expected).toBe(0);
    });
  });

  // =========================================================================
  // FACET 3: ANIMATION STALL THRESHOLD & DYNAMIC WORKLOAD OVERRIDE
  // =========================================================================
  describe('Facet 3: Animation Stall Threshold & Dynamic Workload Override', () => {
    it('[TC-109.09/MSS] WATCHDOG_LIMITS.MAX_ANIMATION_DURATION_MS is preserved at 10,000ms for default baseline', () => {
      expect(WATCHDOG_LIMITS.MAX_ANIMATION_DURATION_MS).toBe(10_000);
    });

    it('[TC-109.10/MSS] checkFsmAnimationStall does NOT flag stall for 10.225s when maxAllowedMs accounts for multi-waypoint hops', () => {
      const monitor = new WatchdogMonitor();
      const violation = monitor.checkFsmAnimationStall({
        isAnimating: true,
        animatingDurationMs: 10_225,
        tick: 0,
        maxAllowedMs: 12_000,
      });

      expect(violation).toBeNull();
    });

    it('[TC-109.11/MSS] checkFsmAnimationStall flags stall when duration exceeds maxAllowedMs workload limit', () => {
      const monitor = new WatchdogMonitor();
      const violation = monitor.checkFsmAnimationStall({
        isAnimating: true,
        animatingDurationMs: 15_500,
        tick: 0,
        maxAllowedMs: 12_000,
      });

      expect(violation).toBeDefined();
      expect(violation?.type).toBe('FSM_ANIMATION_STALLED');
      expect(violation?.severity).toBe('WARNING');
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & BOUNDARY RECOVERY
  // =========================================================================
  describe('Facet 4: Error Defense & Boundary Recovery', () => {
    it('[TC-109.12/MSS] detectMovement handles undefined diceRollerId gracefully falling back to isTurnPlayer', () => {
      const delta: DeltaPayload = {
        tick: 50,
        cells: [],
        players: [{ id: 'p1', position: 10, balance: 10000 }],
        currentTurnPlayerId: 'p1',
        dice: [2, 3],
        turnPhase: TurnPhase.ActionPhase,
        roomStarted: true,
      };

      const movement = detectMovement(delta, { p1: 5 });
      expect(movement?.dice).toEqual([2, 3]);
    });

    it('[TC-109.13/MSS] detectMovement discards dice if diceRollerId belongs to another player who did not move', () => {
      const delta: DeltaPayload = {
        tick: 51,
        cells: [],
        players: [{ id: 'p1', position: 10, balance: 10000 }],
        currentTurnPlayerId: 'p1',
        dice: [2, 3],
        diceRollerId: 'bot_2', // Roll belongs to bot_2, not p1
        turnPhase: TurnPhase.WaitingRoll,
        roomStarted: true,
      };

      const movement = detectMovement(delta, { p1: 5 });
      expect(movement?.dice).toBeUndefined();
    });

    it('[TC-109.14/MSS] verifyMovementStep flags INVALID_POSITION_STEP if pawn jumped without dice and not teleport', () => {
      const violation = verifyMovementStep({
        fromPosition: 0,
        toPosition: 15,
        dice: undefined,
        tick: 60,
        isTeleport: false,
      });

      expect(violation).toBeDefined();
      expect(violation?.type).toBe('INVALID_POSITION_STEP');
    });

    it('[TC-109.15/MSS] computeExpectedDelta returns null when delta contains unmodeled event or active modal insolvency', () => {
      const preState = {
        playersInfo: { p1: { id: 'p1', balance: 5000, ownedProperties: [] } },
        playerPositions: { p1: 2 },
        levelMap: {},
        treasuryPool: 10000,
        activeModal: 'insolvency',
      } as unknown as GameState;

      const delta: DeltaPayload = {
        tick: 70,
        cells: [],
        players: [{ id: 'p1', position: 2, balance: 4000 }],
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState);
      expect(expected).toBeNull();
    });
  });
});
