// [TC-126.01/MSS..TC-126.19/MSS][UC-126]
// Contract Test Suite: IMP-126 Pawn Jail Direct Flight (Cơ Chế Quân Cờ Tự Bay Vào Tù Lập Tức)
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Boundary & Static Math Invariants (Flight Arc, Durations, Waypoint Math)
// Facet 2: State Reactivity & Queueing Lifecycle (Delta Sync, Rolling Precedence, Queue Flow)
// Facet 3: Audio & Visual Parameters (Duration Selection, SoundEffect.TAX_PENALTY Landing Trigger)
// Facet 4: Defense & Regression Invariants (Normal Jail Visit, Idempotency, Normal Hops, Clean Postcondition)

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as pawnPathModule from '../../src/client/3d/pawn_path';
import { useGameStore } from '../../src/client/store/game_store';
import { applyDeltaToStore } from '../../src/client/network/apply_delta';
import { SingleHopPawn, ActiveSpringPawn } from '../../src/client/3d/pawn_animator';
import { AudioEngine } from '../../src/client/audio/audio_engine';
import { SoundEffect } from '../../src/client/audio/audio_types';
import type { DeltaPayload } from '../../src/server/session_manager';
import type { Player } from '../../src/domain/room';

// =============================================================================
// TYPE DEFINITIONS FOR IMP-126 CONTRACT TESTING
// =============================================================================

interface Imp126PawnPathExports {
  readonly JAIL_FLIGHT_ARC: number;
  readonly JAIL_FLIGHT_DURATION: number;
  readonly BOT_JAIL_FLIGHT_DURATION: number;
  readonly JAIL_LANDING_DURATION: number;
  calculateJailFlightWaypoints: (targetCell?: number) => number[];
}

const pawnPath = pawnPathModule as unknown as typeof pawnPathModule & Imp126PawnPathExports;

interface Imp126PendingPawnMove {
  readonly playerId: string;
  readonly targetCell: number;
  readonly fromCell: number;
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

interface Imp126PawnAnimationState {
  readonly playerId: string;
  readonly fromCell: number;
  readonly targetCell?: number;
  readonly waypoints: readonly number[];
  readonly currentIndex?: number;
  readonly isAnimating: boolean;
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

// =============================================================================
// MOCKS FOR R3F AND AUDIO FOR HEADLESS EXECUTION
// =============================================================================

let capturedFrameCallback: ((state: unknown, delta: number) => void) | null = null;

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((cb) => {
    capturedFrameCallback = cb;
  }),
}));

vi.mock('@react-three/drei', () => ({
  Billboard: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('billboard', null, children),
}));

describe('[IMP-126] Pawn Jail Direct Flight Contract Suite [UC-126]', () => {
  beforeEach(() => {
    vi.useRealTimers();
    capturedFrameCallback = null;

    useGameStore.setState({
      isRolling: false,
      hasRolledThisTurn: false,
      lastDiceSeq: undefined,
      dice: [1, 1],
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      pendingPawnMove: null,
      playerPositions: { p1: 26, bot_2: 30 },
      visualPositions: { p1: 26, bot_2: 30 },
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Player 1',
          balance: 15000,
          tokenColor: '#DC2626',
          ownedProperties: [],
          inAudit: false,
          auditTurnsLeft: 0,
          isBot: false,
        },
        bot_2: {
          id: 'bot_2',
          name: 'Bot 2',
          balance: 15000,
          tokenColor: '#27AE60',
          ownedProperties: [],
          inAudit: false,
          auditTurnsLeft: 0,
          isBot: true,
        },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: BOUNDARY & STATIC MATH INVARIANTS
  // =========================================================================
  describe('Facet 1: Boundary & Static Math Invariants', () => {
    it('[TC-126.01/MSS][UC-126] Pawn path exports required jail flight constants', () => {
      expect(pawnPath.JAIL_FLIGHT_ARC).toBe(2.8);
      expect(pawnPath.JAIL_FLIGHT_DURATION).toBe(0.55);
      expect(pawnPath.BOT_JAIL_FLIGHT_DURATION).toBe(0.45);
      expect(pawnPath.JAIL_LANDING_DURATION).toBe(0.12);
    });

    it('[TC-126.02/MSS][UC-126] calculateJailFlightWaypoints without arguments returns exactly [10]', () => {
      const waypoints = pawnPath.calculateJailFlightWaypoints();
      expect(waypoints).toEqual([10]);
      expect(waypoints).toHaveLength(1);
    });

    it('[TC-126.03/MSS][UC-126] calculateJailFlightWaypoints with targetCell 10 returns [10]', () => {
      const waypoints = pawnPath.calculateJailFlightWaypoints(10);
      expect(waypoints).toEqual([10]);
      expect(waypoints[0]).toBe(10);
    });

    it('[TC-126.04/MSS][UC-126] Parabolic apex with JAIL_FLIGHT_ARC is 2.8 and 3.5x DEFAULT_JUMP_ARC', () => {
      const jailApex = pawnPath.getParabolicHeight(0.5, pawnPath.JAIL_FLIGHT_ARC);
      const defaultApex = pawnPath.getParabolicHeight(0.5, pawnPath.DEFAULT_JUMP_ARC);

      expect(jailApex).toBe(2.8);
      expect(defaultApex).toBe(0.8);
      expect(Number((jailApex / defaultApex).toFixed(1))).toBe(3.5);
    });

    it('[TC-126.05/MSS][UC-126] Parabolic height at start (0) and end (1) boundaries are strictly 0', () => {
      const startHeight = pawnPath.getParabolicHeight(0, pawnPath.JAIL_FLIGHT_ARC);
      const endHeight = pawnPath.getParabolicHeight(1, pawnPath.JAIL_FLIGHT_ARC);

      expect(startHeight).toBe(0);
      expect(endHeight).toBe(0);
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY & QUEUEING LIFECYCLE
  // =========================================================================
  describe('Facet 2: State Reactivity & Queueing Lifecycle', () => {
    it('[TC-126.06/MSS][UC-126] Player delta to audit triggers active animation with isJailFlight: true', () => {
      const delta: DeltaPayload = {
        tick: 1,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 10,
            balance: 15000,
            inAudit: true,
            auditTurnsLeft: 3,
            isBot: false,
          },
        ],
        roomStarted: true,
      };

      applyDeltaToStore(delta, useGameStore);

      const anim = useGameStore.getState().activePawnAnimation as Imp126PawnAnimationState | null;
      expect(anim).not.toBeNull();
      expect(anim?.playerId).toBe('p1');
      expect(anim?.isJailFlight).toBe(true);
    });

    it('[TC-126.07/MSS][UC-126] Direct flight waypoints invariant: exactly [10], zero intermediate steps', () => {
      const delta: DeltaPayload = {
        tick: 2,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 10,
            balance: 15000,
            inAudit: true,
            auditTurnsLeft: 3,
            isBot: false,
          },
        ],
        roomStarted: true,
      };

      applyDeltaToStore(delta, useGameStore);

      const anim = useGameStore.getState().activePawnAnimation as Imp126PawnAnimationState | null;
      expect(anim?.waypoints).toEqual([10]);
      expect(anim?.waypoints).toHaveLength(1);
      expect(anim?.waypoints).not.toContain(27);
      expect(anim?.waypoints).not.toContain(0);
    });

    it('[TC-126.08/MSS][UC-126] When isRolling is true, pendingPawnMove preserves isJailFlight and isBot', () => {
      useGameStore.setState({ isRolling: true });

      const delta: DeltaPayload = {
        tick: 3,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 10,
            balance: 15000,
            inAudit: true,
            auditTurnsLeft: 3,
            isBot: false,
          },
        ],
        roomStarted: true,
      };

      applyDeltaToStore(delta, useGameStore);

      const pending = useGameStore.getState().pendingPawnMove as Imp126PendingPawnMove | null;
      expect(pending).not.toBeNull();
      expect(pending?.isJailFlight).toBe(true);
      expect(pending?.isBot).toBe(false);
      expect(pending?.targetCell).toBe(10);
    });

    it('[TC-126.09/MSS][UC-126] setIsRolling(false) releases pending direct flight into pawnAnimationQueue with waypoints [10]', () => {
      useGameStore.setState({
        isRolling: true,
        pendingPawnMove: {
          playerId: 'p1',
          targetCell: 10,
          fromCell: 26,
          isJailFlight: true,
          isBot: false,
        } as Imp126PendingPawnMove,
        activePawnAnimation: null,
        pawnAnimationQueue: [],
      });

      useGameStore.getState().setIsRolling(false);

      expect(useGameStore.getState().pendingPawnMove).toBeNull();
      const anim = useGameStore.getState().activePawnAnimation as Imp126PawnAnimationState | null;
      expect(anim?.isJailFlight).toBe(true);
      expect(anim?.waypoints).toEqual([10]);
    });

    it('[TC-126.10/MSS][UC-126] processPawnQueue transfers isJailFlight: true to activePawnAnimation', () => {
      useGameStore.setState({
        isRolling: false,
        activePawnAnimation: null,
        pawnAnimationQueue: [
          {
            playerId: 'p1',
            fromCell: 26,
            targetCell: 10,
            waypoints: [10],
            isJailFlight: true,
            isBot: false,
          } as any,
        ],
      });

      useGameStore.getState().processPawnQueue();

      const anim = useGameStore.getState().activePawnAnimation as Imp126PawnAnimationState | null;
      expect(anim?.playerId).toBe('p1');
      expect(anim?.isJailFlight).toBe(true);
      expect(anim?.waypoints).toEqual([10]);
    });

    it('[TC-126.11/MSS][UC-126] Bot delta preserves isBot: true and isJailFlight: true across the queue lifecycle', () => {
      useGameStore.setState({ isRolling: true });

      const delta: DeltaPayload = {
        tick: 4,
        cells: [],
        players: [
          {
            id: 'bot_2',
            position: 10,
            balance: 15000,
            inAudit: true,
            auditTurnsLeft: 3,
            isBot: true,
          },
        ],
        roomStarted: true,
      };

      applyDeltaToStore(delta, useGameStore);

      const pending = useGameStore.getState().pendingPawnMove as Imp126PendingPawnMove | null;
      expect(pending?.isBot).toBe(true);
      expect(pending?.isJailFlight).toBe(true);

      useGameStore.getState().setIsRolling(false);

      const anim = useGameStore.getState().activePawnAnimation as Imp126PawnAnimationState | null;
      expect(anim?.isBot).toBe(true);
      expect(anim?.isJailFlight).toBe(true);
    });
  });

  // =========================================================================
  // FACET 3: AUDIO & VISUAL PARAMETERS
  // =========================================================================
  describe('Facet 3: Audio & Visual Parameters', () => {
    it('[TC-126.12/MSS][UC-126] SingleHopPawn renders cleanly with isJailFlight prop', () => {
      let markup = '';
      expect(() => {
        markup = renderToStaticMarkup(
          React.createElement(SingleHopPawn, {
            fromCell: 26,
            toCell: 10,
            offset: [0, 0, 0],
            color: '#DC2626',
            onHopComplete: () => {},
            isJailFlight: true,
          } as any)
        );
      }).not.toThrow();

      expect(markup).toContain('cylinderGeometry');
    });

    it('[TC-126.13/MSS][UC-126] Player jail flight uses JAIL_FLIGHT_DURATION (0.55s) instead of normal hop (0.15s)', () => {
      const playSfxSpy = vi.spyOn(AudioEngine, 'playSfx').mockImplementation(() => {});

      const mockGroup = {
        position: { set: vi.fn() },
        scale: { set: vi.fn() },
      };

      const origUseRef = React.useRef;
      vi.spyOn(React, 'useRef').mockImplementation((initVal: any) => {
        if (initVal === null) return { current: mockGroup } as any;
        return origUseRef(initVal);
      });

      renderToStaticMarkup(
        React.createElement(SingleHopPawn, {
          fromCell: 26,
          toCell: 10,
          offset: [0, 0, 0],
          color: '#DC2626',
          onHopComplete: () => {},
          isJailFlight: true,
          isBot: false,
        } as any)
      );

      expect(capturedFrameCallback).not.toBeNull();

      // At t = 0.30s (3 steps of 0.1s dt), normal hop would have already landed (0.15s),
      // but jail flight (0.55s) is still in mid-air and has NOT played landing sound yet.
      capturedFrameCallback?.({}, 0.1);
      capturedFrameCallback?.({}, 0.1);
      capturedFrameCallback?.({}, 0.1);

      expect(playSfxSpy).not.toHaveBeenCalledWith(SoundEffect.TAX_PENALTY);

      // Advance past 0.55s to 0.60s (3 more steps of 0.1s) -> triggers landing sound
      capturedFrameCallback?.({}, 0.1);
      capturedFrameCallback?.({}, 0.1);
      capturedFrameCallback?.({}, 0.1);

      expect(playSfxSpy).toHaveBeenCalledWith(SoundEffect.TAX_PENALTY);
    });

    it('[TC-126.14/MSS][UC-126] Bot jail flight uses BOT_JAIL_FLIGHT_DURATION (0.45s) instead of normal bot hop (0.13s)', () => {
      const playSfxSpy = vi.spyOn(AudioEngine, 'playSfx').mockImplementation(() => {});

      const mockGroup = {
        position: { set: vi.fn() },
        scale: { set: vi.fn() },
      };

      const origUseRef = React.useRef;
      vi.spyOn(React, 'useRef').mockImplementation((initVal: any) => {
        if (initVal === null) return { current: mockGroup } as any;
        return origUseRef(initVal);
      });

      renderToStaticMarkup(
        React.createElement(SingleHopPawn, {
          fromCell: 30,
          toCell: 10,
          offset: [0, 0, 0],
          color: '#27AE60',
          onHopComplete: () => {},
          isJailFlight: true,
          isBot: true,
        } as any)
      );

      // At t = 0.50s (5 steps of 0.1s), bot flight (0.45s) has landed
      capturedFrameCallback?.({}, 0.1);
      capturedFrameCallback?.({}, 0.1);
      capturedFrameCallback?.({}, 0.1);
      capturedFrameCallback?.({}, 0.1);
      capturedFrameCallback?.({}, 0.1);

      expect(playSfxSpy).toHaveBeenCalledWith(SoundEffect.TAX_PENALTY);
    });

    it('[TC-126.15/MSS][UC-126] Landing with isJailFlight: true plays SoundEffect.TAX_PENALTY instead of PAWN_STEP', () => {
      const playSfxSpy = vi.spyOn(AudioEngine, 'playSfx').mockImplementation(() => {});

      const mockGroup = {
        position: { set: vi.fn() },
        scale: { set: vi.fn() },
      };

      const origUseRef = React.useRef;
      vi.spyOn(React, 'useRef').mockImplementation((initVal: any) => {
        if (initVal === null) return { current: mockGroup } as any;
        return origUseRef(initVal);
      });

      renderToStaticMarkup(
        React.createElement(SingleHopPawn, {
          fromCell: 26,
          toCell: 10,
          offset: [0, 0, 0],
          color: '#DC2626',
          onHopComplete: () => {},
          isJailFlight: true,
        } as any)
      );

      // Advance through flight and landing (7 steps of 0.1s = 0.70s unrolled)
      capturedFrameCallback?.({}, 0.1);
      capturedFrameCallback?.({}, 0.1);
      capturedFrameCallback?.({}, 0.1);
      capturedFrameCallback?.({}, 0.1);
      capturedFrameCallback?.({}, 0.1);
      capturedFrameCallback?.({}, 0.1);
      capturedFrameCallback?.({}, 0.1);

      expect(playSfxSpy).toHaveBeenCalledWith(SoundEffect.TAX_PENALTY);
      expect(playSfxSpy).not.toHaveBeenCalledWith(SoundEffect.PAWN_STEP);
    });
  });

  // =========================================================================
  // FACET 4: DEFENSE & REGRESSION INVARIANTS
  // =========================================================================
  describe('Facet 4: Defense & Regression Invariants', () => {
    it('[TC-126.16/MSS][UC-126] Normal visit to Cell 10 (inAudit: false) maintains sequential hops and falsy isJailFlight', () => {
      useGameStore.setState({
        playerPositions: { p1: 6 },
        visualPositions: { p1: 6 },
      });

      const delta: DeltaPayload = {
        tick: 5,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 10,
            balance: 15000,
            inAudit: false,
            auditTurnsLeft: 0,
            isBot: false,
          },
        ],
        roomStarted: true,
      };

      applyDeltaToStore(delta, useGameStore);

      const anim = useGameStore.getState().activePawnAnimation as Imp126PawnAnimationState | null;
      expect(anim?.waypoints).toEqual([7, 8, 9, 10]);
      expect(anim?.isJailFlight).toBeFalsy();
    });

    it('[TC-126.17/MSS][UC-126] Idempotency defense: player already in audit receiving next delta dispatches zero new flight tasks', () => {
      useGameStore.setState({
        playerPositions: { p1: 10 },
        visualPositions: { p1: 10 },
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Player 1',
            balance: 15000,
            tokenColor: '#DC2626',
            ownedProperties: [],
            inAudit: true,
            auditTurnsLeft: 3,
            isBot: false,
          },
        },
      });

      const delta: DeltaPayload = {
        tick: 6,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 10,
            balance: 15000,
            inAudit: true,
            auditTurnsLeft: 2,
            isBot: false,
          },
        ],
        roomStarted: true,
      };

      applyDeltaToStore(delta, useGameStore);

      expect(useGameStore.getState().activePawnAnimation).toBeNull();
      expect(useGameStore.getState().pawnAnimationQueue).toHaveLength(0);
      expect(useGameStore.getState().pendingPawnMove).toBeNull();
    });

    it('[TC-126.18/MSS][UC-126] Normal movement between arbitrary cells (5 -> 8) strictly preserves sequential path', () => {
      useGameStore.setState({
        playerPositions: { p1: 5 },
        visualPositions: { p1: 5 },
      });

      const delta: DeltaPayload = {
        tick: 7,
        cells: [],
        players: [
          {
            id: 'p1',
            position: 8,
            balance: 15000,
            inAudit: false,
            auditTurnsLeft: 0,
            isBot: false,
          },
        ],
        roomStarted: true,
      };

      applyDeltaToStore(delta, useGameStore);

      const anim = useGameStore.getState().activePawnAnimation as Imp126PawnAnimationState | null;
      expect(anim?.waypoints).toEqual([6, 7, 8]);
      expect(anim?.isJailFlight).toBeFalsy();
    });

    it('[TC-126.19/MSS][UC-126] Postcondition cleanup: completePawnMove stabilizes player position with zero dangling animation', () => {
      useGameStore.setState({
        activePawnAnimation: {
          playerId: 'p1',
          fromCell: 26,
          targetCell: 10,
          waypoints: [10],
          currentIndex: 0,
          isAnimating: true,
          isJailFlight: true,
        } as any,
        playerPositions: { p1: 26 },
      });

      useGameStore.getState().completePawnMove('p1');

      expect(useGameStore.getState().activePawnAnimation).toBeNull();
      expect(useGameStore.getState().playerPositions['p1']).toBe(10);
      expect(useGameStore.getState().pawnAnimationQueue).toHaveLength(0);
    });
  });
});
