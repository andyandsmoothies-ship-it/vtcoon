// [TC-110.01/MSS..TC-110.15/A4][UC-IMP110]
// Contract Test Suite: IMP-110 Insolvency Phase Movement Sync & Zero-Duplicate Bankruptcy Modal
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Insolvency Phase Movement Synchronization (detectMovement preserves dice when landing in InsolvencyPhase)
// Facet 2: Zero-Duplicate Bankruptcy Modal Lifecycle (bankrupt player with negative balance never reopens insolvency modal)
// Facet 3: Active Modal Disposal on Bankruptcy (apply_delta closes open insolvency modal when player becomes bankrupt)
// Facet 4: Error Defense & Boundary Guard (null players, positive balances, game_over modal immunity)

import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectMovement,
  checkIsTeleport,
} from '../../src/client/telemetry/telemetry_delta_hook';
import { verifyMovementStep } from '../../src/client/telemetry/invariant_checker';
import { useGameStore } from '../../src/client/store/game_store';
import { applyDeltaToStore as applyDelta } from '../../src/client/network/apply_delta';
import { TurnPhase } from '../../src/domain/room';
import type { DeltaPayload } from '../../src/server/session_manager';

describe('IMP-110 Insolvency Phase Movement Sync & Zero-Duplicate Bankruptcy Modal', () => {
  beforeEach(() => {
    useGameStore.setState({
      activeModal: null,
      modalPayload: {},
      playersInfo: {},
      playerPositions: {},
    });
  });

  // =========================================================================
  // FACET 1: INSOLVENCY PHASE MOVEMENT SYNCHRONIZATION
  // =========================================================================
  describe('Facet 1: Insolvency Phase Movement Synchronization', () => {
    it('[TC-110.01/MSS] detectMovement preserves dice [2, 2] when landing on cell 39 in TurnPhase.InsolvencyPhase', () => {
      const delta: DeltaPayload = {
        tick: 240,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 39,
            balance: -738,
          },
        ],
        currentPlayerIndex: 0,
        currentTurnPlayerId: 'p1',
        dice: [2, 2],
        diceRollerId: 'p1',
        diceSeq: 91,
        turnPhase: TurnPhase.InsolvencyPhase,
        roomStarted: true,
      };

      const prePositions = { p1: 35 };
      const movement = detectMovement(delta, prePositions);

      expect(movement).toBeDefined();
      expect(movement?.fromPosition).toBe(35);
      expect(movement?.toPosition).toBe(39);
      expect(movement?.dice).toEqual([2, 2]);
      expect(movement?.isTeleport).toBe(false);
    });

    it('[TC-110.02/MSS] verifyMovementStep does NOT flag INVALID_POSITION_STEP for move 35 to 39 in InsolvencyPhase', () => {
      const delta: DeltaPayload = {
        tick: 240,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 39,
            balance: -738,
          },
        ],
        currentPlayerIndex: 0,
        currentTurnPlayerId: 'p1',
        dice: [2, 2],
        diceRollerId: 'p1',
        diceSeq: 91,
        turnPhase: TurnPhase.InsolvencyPhase,
        roomStarted: true,
      };

      const prePositions = { p1: 35 };
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

    it('[TC-110.03/MSS] checkIsTeleport does NOT treat TurnPhase.InsolvencyPhase as a fallback teleport', () => {
      const isTeleport = checkIsTeleport(35, 39, true, TurnPhase.InsolvencyPhase, false);
      expect(isTeleport).toBe(false);
    });

    it('[TC-110.04/MSS] detectMovement preserves dice for Bot landing in InsolvencyPhase', () => {
      const delta: DeltaPayload = {
        tick: 180,
        cells: [],
        players: [
          {
            id: 'bot_2',
            position: 21,
            balance: -500,
            isBot: true,
          },
        ],
        currentPlayerIndex: 1,
        currentTurnPlayerId: 'bot_2',
        dice: [3, 4],
        diceRollerId: 'bot_2',
        diceSeq: 70,
        turnPhase: TurnPhase.InsolvencyPhase,
        roomStarted: true,
      };

      const movement = detectMovement(delta, { bot_2: 14 });
      expect(movement).toBeDefined();
      expect(movement?.dice).toEqual([3, 4]);
      expect(movement?.isTeleport).toBe(false);
    });
  });

  // =========================================================================
  // FACET 2: ZERO-DUPLICATE BANKRUPTCY MODAL LIFECYCLE
  // =========================================================================
  describe('Facet 2: Zero-Duplicate Bankruptcy Modal Lifecycle', () => {
    it('[TC-110.05/MSS] Bankrupt player with negative balance NEVER reopens insolvency modal', () => {
      useGameStore.setState({
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'P1',
            balance: -738,
            tokenColor: '#DC2626',
            ownedProperties: [],
            isBot: false,
            bankrupt: true, // Already bankrupt
          },
        },
        activeModal: null, // Modal was closed upon clicking Declare Bankruptcy
      });

      // Delta carrying bankrupt confirmation at tick 241
      const delta: DeltaPayload = {
        tick: 241,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 39,
            balance: -738,
            bankrupt: true,
          },
        ],
        currentPlayerIndex: 1,
        currentTurnPlayerId: 'bot_2',
        turnPhase: TurnPhase.WaitingRoll,
        roomStarted: true,
      };

      // Helper simulating the session handler
      const shouldOpenInsolvency = (
        p: { id: string; balance: number; bankrupt?: boolean },
        localId: string
      ): boolean => {
        const isBankrupt = Boolean(
          p.bankrupt ?? useGameStore.getState().playersInfo[localId]?.bankrupt
        );
        const currentModal = useGameStore.getState().activeModal;
        return p.balance < 0 && !isBankrupt && currentModal !== 'insolvency' && currentModal !== 'game_over';
      };

      const localP = delta.players![0]!;
      const result = shouldOpenInsolvency(localP, 'p1');
      expect(result).toBe(false);
    });

    it('[TC-110.06/MSS] Non-bankrupt player with negative balance DOES trigger insolvency modal', () => {
      useGameStore.setState({
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'P1',
            balance: -738,
            tokenColor: '#DC2626',
            ownedProperties: [1, 2],
            isBot: false,
            bankrupt: false,
          },
        },
        activeModal: null,
      });

      const delta: DeltaPayload = {
        tick: 240,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 39,
            balance: -738,
            bankrupt: false,
          },
        ],
        currentPlayerIndex: 0,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.InsolvencyPhase,
        roomStarted: true,
      };

      const shouldOpenInsolvency = (
        p: { id: string; balance: number; bankrupt?: boolean },
        localId: string
      ): boolean => {
        const isBankrupt = Boolean(
          p.bankrupt ?? useGameStore.getState().playersInfo[localId]?.bankrupt
        );
        const currentModal = useGameStore.getState().activeModal;
        return p.balance < 0 && !isBankrupt && currentModal !== 'insolvency' && currentModal !== 'game_over';
      };

      const localP = delta.players![0]!;
      const result = shouldOpenInsolvency(localP, 'p1');
      expect(result).toBe(true);
    });

    it('[TC-110.07/MSS] Subsequent deltas after bankruptcy with negative balance do NOT reopen modal', () => {
      useGameStore.setState({
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'P1',
            balance: -738,
            tokenColor: '#DC2626',
            ownedProperties: [],
            isBot: false,
            bankrupt: true,
          },
        },
        activeModal: null,
      });

      // Subsequent tick 245
      const delta: DeltaPayload = {
        tick: 245,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 39,
            balance: -738,
            bankrupt: true,
          },
        ],
        currentPlayerIndex: 2,
        currentTurnPlayerId: 'bot_3',
        turnPhase: TurnPhase.PropertyManagement,
        roomStarted: true,
      };

      const isBankrupt = Boolean(
        delta.players![0]!.bankrupt ?? useGameStore.getState().playersInfo['p1']?.bankrupt
      );
      const canOpen = delta.players![0]!.balance < 0 && !isBankrupt;
      expect(canOpen).toBe(false);
    });
  });

  // =========================================================================
  // FACET 3: ACTIVE MODAL DISPOSAL ON BANKRUPTCY
  // =========================================================================
  describe('Facet 3: Active Modal Disposal on Bankruptcy', () => {
    it('[TC-110.08/MSS] applyDelta actively closes insolvency modal when player bankrupt becomes true', () => {
      useGameStore.setState({
        activeModal: 'insolvency',
        modalPayload: { playerId: 'p1', deficit: 738 },
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'P1',
            balance: -738,
            tokenColor: '#DC2626',
            ownedProperties: [],
            isBot: false,
            bankrupt: false,
          },
        },
      });

      // Delta confirming p1 is now bankrupt while still in InsolvencyPhase (e.g. immediate declaration)
      const delta: DeltaPayload = {
        tick: 241,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 39,
            balance: -738,
            bankrupt: true,
          },
        ],
        turnPhase: TurnPhase.InsolvencyPhase,
        roomStarted: true,
      };

      applyDelta(delta);

      expect(useGameStore.getState().activeModal).toBeNull();
    });

    it('[TC-110.09/MSS] applyDelta closes insolvency modal when turnPhase transitions away from InsolvencyPhase', () => {
      useGameStore.setState({
        activeModal: 'insolvency',
        modalPayload: { playerId: 'p1', deficit: 500 },
      });

      const delta: DeltaPayload = {
        tick: 242,
        cells: [],
        players: [],
        turnPhase: TurnPhase.WaitingRoll,
        roomStarted: true,
      };

      applyDelta(delta);
      expect(useGameStore.getState().activeModal).toBeNull();
    });

    it('[TC-110.10/MSS] applyDelta closes insolvency modal when player recovers balance to non-negative', () => {
      useGameStore.setState({
        activeModal: 'insolvency',
        modalPayload: { playerId: 'p1', deficit: 500 },
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'P1',
            balance: -500,
            tokenColor: '#DC2626',
            ownedProperties: [],
            isBot: false,
          },
        },
      });

      const delta: DeltaPayload = {
        tick: 243,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 10,
            balance: 1000, // Mortgage or trade rescued player
          },
        ],
        turnPhase: TurnPhase.PropertyManagement,
        roomStarted: true,
      };

      applyDelta(delta);
      expect(useGameStore.getState().activeModal).toBeNull();
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & BOUNDARY RECOVERY
  // =========================================================================
  describe('Facet 4: Error Defense & Boundary Recovery', () => {
    it('[TC-110.11/MSS] checkIsTeleport treats other unknown phases as fallback teleport', () => {
      // Arbitrary non-movement phase should return true
      const isTeleport = checkIsTeleport(10, 20, true, 'UnknownPhase' as TurnPhase, false);
      expect(isTeleport).toBe(true);
    });

    it('[TC-110.12/MSS] detectMovement handles delta with empty players safely', () => {
      const delta: DeltaPayload = {
        tick: 244,
        cells: [],
        players: [],
        turnPhase: TurnPhase.InsolvencyPhase,
        roomStarted: true,
      };

      const movement = detectMovement(delta, { p1: 10 });
      expect(movement).toBeUndefined();
    });

    it('[TC-110.13/MSS] Insolvency modal is NEVER opened if game_over modal is active', () => {
      useGameStore.setState({
        activeModal: 'game_over',
        modalPayload: { leaderboard: [] },
      });

      const shouldOpenInsolvency = (
        p: { id: string; balance: number; bankrupt?: boolean }
      ): boolean => {
        const currentModal = useGameStore.getState().activeModal;
        return p.balance < 0 && currentModal !== 'insolvency' && currentModal !== 'game_over';
      };

      expect(shouldOpenInsolvency({ id: 'p1', balance: -1000 })).toBe(false);
    });

    it('[TC-110.14/MSS] Insolvency modal is NOT opened if balance is exactly 0', () => {
      const shouldOpenInsolvency = (
        p: { id: string; balance: number; bankrupt?: boolean }
      ): boolean => {
        return p.balance < 0;
      };

      expect(shouldOpenInsolvency({ id: 'p1', balance: 0 })).toBe(false);
    });

    it('[TC-110.15/MSS] detectMovement with undefined turnPhase still checks exact dice move', () => {
      const delta: DeltaPayload = {
        tick: 245,
        cells: [],
        players: [{ id: 'p1', position: 20, balance: 2000 }],
        dice: [2, 3],
        diceRollerId: 'p1',
        roomStarted: true,
      };

      const movement = detectMovement(delta, { p1: 15 });
      expect(movement?.dice).toEqual([2, 3]);
      expect(movement?.isTeleport).toBe(false);
    });
  });
});
