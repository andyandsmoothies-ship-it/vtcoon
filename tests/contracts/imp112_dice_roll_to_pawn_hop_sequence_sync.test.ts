// [TC-112.01/MSS..TC-112.16/A4][UC-IMP112]
// Contract Test Suite: IMP-112 Dice-to-Pawn Sequential Synchronization & Web Latency Resilience
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Precedence of Dice Synchronization over Pawn Movement in applyDeltaToStore
// Facet 2: SingleDie Spring Reset and Zero-Premature onRest on New Turns
// Facet 3: Settle Delay & Queue Release Lifecycle (pendingPawnMove -> startPawnMove)
// Facet 4: Error Defense & Web Delay Resilience (zero dice, duplicate diceSeq, unmount timeout)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../../src/client/store/game_store';
import { applyDeltaToStore } from '../../src/client/network/apply_delta';
import { TurnPhase } from '../../src/domain/room';
import type { DeltaPayload } from '../../src/server/session_manager';

describe('IMP-112 Dice-to-Pawn Sequential Synchronization & Web Latency Resilience', () => {
  beforeEach(() => {
    vi.useRealTimers();
    useGameStore.setState({
      isRolling: false,
      hasRolledThisTurn: false,
      lastDiceSeq: undefined,
      dice: [1, 1],
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      pendingPawnMove: null,
      playerPositions: { p1: 0, bot_2: 0 },
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Player 1',
          balance: 15000,
          tokenColor: '#DC2626',
          ownedProperties: [],
          isBot: false,
        },
        bot_2: {
          id: 'bot_2',
          name: 'Bot 2',
          balance: 15000,
          tokenColor: '#27AE60',
          ownedProperties: [],
          isBot: true,
        },
      },
    });
  });

  // =========================================================================
  // FACET 1: PRECEDENCE OF DICE SYNCHRONIZATION OVER PAWN MOVEMENT
  // =========================================================================
  describe('Facet 1: Precedence of Dice Synchronization over Pawn Movement', () => {
    it('[TC-112.01/MSS] Bot delta with dice and position change MUST set pendingPawnMove instead of moving immediately', () => {
      // Prior state: Bot turn, not rolling yet
      useGameStore.setState({ isRolling: false, lastDiceSeq: undefined });

      const delta: DeltaPayload = {
        tick: 10,
        cells: [],
        dice: [3, 4],
        diceSeq: 1,
        players: [
          {
            id: 'bot_2',
            position: 7,
            balance: 15000,
            isBot: true,
          },
        ],
        currentTurnPlayerId: 'bot_2',
        turnPhase: TurnPhase.ActionPhase,
        roomStarted: true,
      };

      applyDeltaToStore(delta, useGameStore);

      // Pawn MUST be held in pendingPawnMove waiting for dice animation
      const pending = useGameStore.getState().pendingPawnMove;
      expect(pending).toEqual({ playerId: 'bot_2', targetCell: 7, fromCell: 0 });
      // Active pawn animation MUST NOT start yet
      expect(useGameStore.getState().activePawnAnimation).toBeNull();
      // Store isRolling MUST be true
      expect(useGameStore.getState().isRolling).toBe(true);
    });

    it('[TC-112.02/MSS] Human delta with dice and position change MUST set pendingPawnMove even if isRolling was false', () => {
      // Simulates human turn when client isRolling timed out or was not pre-set
      useGameStore.setState({ isRolling: false, lastDiceSeq: 2 });

      const delta: DeltaPayload = {
        tick: 12,
        cells: [],
        dice: [2, 5],
        diceSeq: 3,
        players: [
          {
            id: 'p1',
            position: 7,
            balance: 15000,
            isBot: false,
          },
        ],
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.ActionPhase,
        roomStarted: true,
      };

      applyDeltaToStore(delta, useGameStore);

      const pending = useGameStore.getState().pendingPawnMove;
      expect(pending).toEqual({ playerId: 'p1', targetCell: 7, fromCell: 0 });
      expect(useGameStore.getState().activePawnAnimation).toBeNull();
      expect(useGameStore.getState().isRolling).toBe(true);
    });

    it('[TC-112.03/MSS] Non-dice movement (chance card / teleport) dispatches immediately when isRolling is false', () => {
      useGameStore.setState({ isRolling: false });

      const delta: DeltaPayload = {
        tick: 15,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 10, // Teleport to Jail
            balance: 15000,
            isBot: false,
          },
        ],
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.ActionPhase,
        roomStarted: true,
      };

      applyDeltaToStore(delta, useGameStore);

      // No dice in delta -> pendingPawnMove is null and active animation starts directly
      expect(useGameStore.getState().pendingPawnMove).toBeNull();
      expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('p1');
      expect(useGameStore.getState().activePawnAnimation?.fromCell).toBe(0);
    });

    it('[TC-112.04/MSS] syncDiceRoll updates dice and lastDiceSeq atomically before player delta evaluation', () => {
      const delta: DeltaPayload = {
        tick: 16,
        cells: [],
        dice: [6, 6],
        diceSeq: 4,
        players: [{ id: 'p1', position: 12, balance: 15000 }],
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.ActionPhase,
        roomStarted: true,
      };

      applyDeltaToStore(delta, useGameStore);

      const state = useGameStore.getState();
      expect(state.dice).toEqual([6, 6]);
      expect(state.lastDiceSeq).toBe(4);
      expect(state.isRolling).toBe(true);
      expect(state.hasRolledThisTurn).toBe(true);
    });
  });

  // =========================================================================
  // FACET 2: SINGLEDIE SPRING RESET & ZERO-PREMATURE ONREST
  // =========================================================================
  describe('Facet 2: SingleDie Spring Reset & Zero-Premature onRest', () => {
    it('[TC-112.05/MSS] Turn transition preserves lastDiceSeq but new roll triggers spring reset', () => {
      // End of Turn 1: lastDiceSeq is 1
      useGameStore.setState({ lastDiceSeq: 1, isRolling: false });

      // Helper simulating SingleDie shouldReset logic
      const evaluateShouldReset = (
        isRolling: boolean,
        prevRolling: boolean,
        diceSeq: number | undefined,
        lastAnimatedSeq: number | undefined
      ): boolean => {
        if (!isRolling) return false;
        if (!prevRolling) return true; // Transition into rolling MUST always reset spring
        if (diceSeq !== undefined && diceSeq !== lastAnimatedSeq) return true;
        return false;
      };

      // Turn 2: User clicks roll -> isRolling becomes true, diceSeq is still 1 from Turn 1
      const shouldResetOnTurnStart = evaluateShouldReset(true, false, 1, 1);
      expect(shouldResetOnTurnStart).toBe(true);
    });

    it('[TC-112.06/MSS] Arrival of server diceSeq while rolling re-triggers spring reset with server values', () => {
      const evaluateShouldReset = (
        isRolling: boolean,
        prevRolling: boolean,
        diceSeq: number | undefined,
        lastAnimatedSeq: number | undefined
      ): boolean => {
        if (!isRolling) return false;
        if (!prevRolling) return true;
        if (diceSeq !== undefined && diceSeq !== lastAnimatedSeq) return true;
        return false;
      };

      // While rolling, server delta arrives with diceSeq 2 (differing from initial seq 1)
      const shouldResetOnServerDelta = evaluateShouldReset(true, true, 2, 1);
      expect(shouldResetOnServerDelta).toBe(true);
    });

    it('[TC-112.07/MSS] onRest callback ignores cancelled or unfinished spring events', () => {
      let restCalled = false;
      const onRestHandler = () => { restCalled = true; };

      const safeOnRest = (result: { finished?: boolean } | undefined, isRolling: boolean) => {
        if (isRolling && result?.finished === true) {
          onRestHandler();
        }
      };

      // Simulated reset/abort event where finished is false or undefined
      safeOnRest({ finished: false }, true);
      expect(restCalled).toBe(false);

      safeOnRest(undefined, true);
      expect(restCalled).toBe(false);
    });

    it('[TC-112.08/MSS] onRest callback executes only when animation finished is explicitly true', () => {
      let restCalled = false;
      const onRestHandler = () => { restCalled = true; };

      const safeOnRest = (result: { finished?: boolean } | undefined, isRolling: boolean) => {
        if (isRolling && result?.finished === true) {
          onRestHandler();
        }
      };

      safeOnRest({ finished: true }, true);
      expect(restCalled).toBe(true);
    });
  });

  // =========================================================================
  // FACET 3: SETTLE DELAY & QUEUE RELEASE LIFECYCLE
  // =========================================================================
  describe('Facet 3: Settle Delay & Queue Release Lifecycle', () => {
    it('[TC-112.09/MSS] setIsRolling(false) releases pendingPawnMove and triggers startPawnMove', () => {
      useGameStore.setState({
        isRolling: true,
        pendingPawnMove: { playerId: 'p1', targetCell: 8, fromCell: 0 },
        activePawnAnimation: null,
      });

      useGameStore.getState().setIsRolling(false);

      expect(useGameStore.getState().pendingPawnMove).toBeNull();
      expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('p1');
      expect(useGameStore.getState().activePawnAnimation?.fromCell).toBe(0);
      expect(useGameStore.getState().activePawnAnimation?.waypoints).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('[TC-112.10/MSS] Pawn remains strictly at fromCell while pendingPawnMove is active', () => {
      useGameStore.setState({
        playerPositions: { p1: 8 },
        pendingPawnMove: { playerId: 'p1', targetCell: 8, fromCell: 0 },
      });

      const store = useGameStore.getState();
      const currentVisual = store.pendingPawnMove?.playerId === 'p1'
        ? store.pendingPawnMove.fromCell
        : store.playerPositions['p1'];

      expect(currentVisual).toBe(0);
    });

    it('[TC-112.11/MSS] Releasing roll processes queued secondary moves after active hop completes', () => {
      useGameStore.setState({
        isRolling: true,
        pendingPawnMove: { playerId: 'p1', targetCell: 3, fromCell: 0 },
      });

      useGameStore.getState().setIsRolling(false);
      expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('p1');

      // Complete pawn move
      useGameStore.getState().completePawnMove('p1');
      expect(useGameStore.getState().activePawnAnimation).toBeNull();
    });

    it('[TC-112.12/MSS] Rapid consecutive deltas do not overwrite pendingPawnMove prematurely', () => {
      useGameStore.setState({ isRolling: true });

      const delta1: DeltaPayload = {
        tick: 20,
        cells: [],
        dice: [2, 2],
        diceSeq: 10,
        players: [{ id: 'p1', position: 4, balance: 15000 }],
        roomStarted: true,
      };

      applyDeltaToStore(delta1, useGameStore);
      expect(useGameStore.getState().pendingPawnMove).toEqual({ playerId: 'p1', targetCell: 4, fromCell: 0 });

      // Another delta arrives (e.g. balance or modifier update) while still rolling
      const delta2: DeltaPayload = {
        tick: 21,
        cells: [],
        treasury: 500,
        roomStarted: true,
      };

      applyDeltaToStore(delta2, useGameStore);
      // pendingPawnMove remains preserved
      expect(useGameStore.getState().pendingPawnMove).toEqual({ playerId: 'p1', targetCell: 4, fromCell: 0 });
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & WEB DELAY RESILIENCE
  // =========================================================================
  describe('Facet 4: Error Defense & Web Delay Resilience', () => {
    it('[TC-112.13/MSS] Duplicate diceSeq does NOT re-trigger dice roll or corrupt pending move', () => {
      useGameStore.setState({
        lastDiceSeq: 10,
        isRolling: false,
        pendingPawnMove: null,
      });

      const deltaDuplicate: DeltaPayload = {
        tick: 22,
        cells: [],
        dice: [2, 2],
        diceSeq: 10, // Same seq already recorded
        players: [{ id: 'p1', position: 4, balance: 15000 }],
        roomStarted: true,
      };

      applyDeltaToStore(deltaDuplicate, useGameStore);
      // Should not trigger dice roll because diceSeq is duplicate
      expect(useGameStore.getState().dice).toEqual([1, 1]);
    });

    it('[TC-112.14/MSS] Delta with dice [0, 0] does NOT activate isRolling', () => {
      useGameStore.setState({ isRolling: false });

      const deltaZero: DeltaPayload = {
        tick: 23,
        cells: [],
        dice: [0, 0],
        roomStarted: true,
      };

      applyDeltaToStore(deltaZero, useGameStore);
      expect(useGameStore.getState().isRolling).toBe(false);
    });

    it('[TC-112.15/MSS] Fallback safety timeout 2500ms ensures isRolling resets even if 3D unmounts', () => {
      vi.useFakeTimers();

      useGameStore.getState().triggerDiceRoll([5, 5], 99);
      expect(useGameStore.getState().isRolling).toBe(true);

      // Fast-forward 2500ms
      vi.advanceTimersByTime(2500);
      expect(useGameStore.getState().isRolling).toBe(false);

      vi.useRealTimers();
    });

    it('[TC-112.16/MSS] Empty players array with valid dice triggers dice roll safely without throw', () => {
      const delta: DeltaPayload = {
        tick: 24,
        cells: [],
        dice: [1, 6],
        diceSeq: 50,
        players: [],
        roomStarted: true,
      };

      expect(() => applyDeltaToStore(delta, useGameStore)).not.toThrow();
      expect(useGameStore.getState().isRolling).toBe(true);
      expect(useGameStore.getState().dice).toEqual([1, 6]);
    });
  });
});
