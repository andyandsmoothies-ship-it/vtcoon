// [CONTRACT TEST] IMP-441: Multi-Activity Pawn Direct Flight, Queue Continuity & Server Bot Pacing
// Traceability Tags: [TC-441.01a..e/MSS], [TC-441.02a..b/MSS], [TC-441.03a..c/A1], [TC-441.04a..e/MSS]
// Universal 5-Facet Behavioral Matrix & Anti-TIDD Clean Contract Suite

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import {
  computeHopFrame,
  SingleHopPawn,
  type SingleHopProps,
} from '../../src/client/3d/single_hop_pawn.js';
import { ActiveSpringPawn } from '../../src/client/3d/pawn_animator.js';
import {
  PawnHopTrajectory,
  type PawnHopTrajectoryProps,
} from '../../src/client/3d/pawn_hop_trajectory.js';
import { SoundEffect } from '../../src/client/audio/audio_types.js';
import { JAIL_FLIGHT_ARC } from '../../src/client/3d/pawn_path.js';
import { applyPlayerDeltas } from '../../src/client/network/apply_delta_players.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import type { DeltaPayload } from '../../src/domain/protocol/index.js';
import {
  resolveBotStepDelay,
  BOT_TRANSIT_OBSERVATION_DELAY_MS,
} from '../../src/server/network/turn_bot_timer_scheduler.js';
import { createRoom, TurnPhase, createPlayer } from '../../src/domain/room.js';
import { captureTree, findReactNode } from '../helpers/threejs_test_utils.js';
import '../helpers/r3f_test_harness.js';

describe('[CONTRACT] IMP-441: Multi-Activity Pawn Direct Flight, Queue Continuity & Server Bot Pacing', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: FLIGHT AUDIO AND ARC VARIANTS (computeHopFrame & ActiveSpringPawn)
  // =========================================================================
  describe('Facet 1: Flight Audio and Arc Variants (single_hop_pawn & pawn_animator)', () => {
    it('[TC-441.01a/MSS][UC-FLIGHT-AUDIO-AND-ARC-VARIANTS] computeHopFrame plays SoundEffect.CARD_DRAW on landing for flightType: event', () => {
      const res = computeHopFrame({
        elapsed: 0.55,
        delta: 0.02,
        hopDuration: 0.55,
        landingDuration: 0.12,
        arcHeight: 2.8,
        fromCell: 0,
        toCell: 6,
        offset: [0, 0, 0],
        soundPlayed: false,
        flightType: 'event',
      });

      expect(res.soundToPlay).toBe(SoundEffect.CARD_DRAW);
      expect(res.isComplete).toBe(false);
    });

    it('[TC-441.01b/MSS][UC-FLIGHT-AUDIO-AND-ARC-VARIANTS] computeHopFrame plays SoundEffect.CARD_DRAW on landing for flightType: transit', () => {
      const res = computeHopFrame({
        elapsed: 0.55,
        delta: 0.02,
        hopDuration: 0.55,
        landingDuration: 0.12,
        arcHeight: 2.8,
        fromCell: 0,
        toCell: 20,
        offset: [0, 0, 0],
        soundPlayed: false,
        flightType: 'transit',
      });

      expect(res.soundToPlay).toBe(SoundEffect.CARD_DRAW);
      expect(res.isComplete).toBe(false);
    });

    it('[TC-441.01c/MSS][UC-FLIGHT-AUDIO-AND-ARC-VARIANTS] computeHopFrame plays SoundEffect.TAX_PENALTY on landing for flightType: audit', () => {
      const res = computeHopFrame({
        elapsed: 0.55,
        delta: 0.02,
        hopDuration: 0.55,
        landingDuration: 0.12,
        arcHeight: 2.8,
        fromCell: 30,
        toCell: 10,
        offset: [0, 0, 0],
        soundPlayed: false,
        flightType: 'audit',
      });

      expect(res.soundToPlay).toBe(SoundEffect.TAX_PENALTY);
      expect(res.isComplete).toBe(false);
    });

    it('[TC-441.01d/MSS][UC-FLIGHT-AUDIO-AND-ARC-VARIANTS] computeHopFrame plays SoundEffect.PAWN_STEP on normal step hop (flightType: undefined)', () => {
      const res = computeHopFrame({
        elapsed: 0.25,
        delta: 0.02,
        hopDuration: 0.25,
        landingDuration: 0.06,
        arcHeight: 0.8,
        fromCell: 0,
        toCell: 1,
        offset: [0, 0, 0],
        soundPlayed: false,
      });

      expect(res.soundToPlay).toBe(SoundEffect.PAWN_STEP);
      expect(res.isComplete).toBe(false);
    });

    it('[TC-441.01e/MSS][UC-FLIGHT-AUDIO-AND-ARC-VARIANTS] ActiveSpringPawn forwards flightType and passes JAIL_FLIGHT_ARC to trajectory and SingleHopPawn', () => {
      const player = createPlayer('p1');
      const tree = captureTree(ActiveSpringPawn, {
        player,
        color: '#38BDF8',
        offset: [0, 0, 0],
        animation: {
          playerId: 'p1',
          fromCell: 0,
          waypoints: [6],
          currentIndex: 0,
          isAnimating: true,
          flightType: 'event',
        },
        onComplete: () => {},
        showTrajectory: true,
      });

      const singleHop = findReactNode<SingleHopProps>(tree, (n) => n.type === SingleHopPawn);
      const trajectory = findReactNode<PawnHopTrajectoryProps>(tree, (n) => n.type === PawnHopTrajectory);

      expect(singleHop?.props.flightType).toBe('event');
      expect(trajectory?.props.arcHeight).toBe(JAIL_FLIGHT_ARC);
    });
  });

  // =========================================================================
  // FACET 2: MEGA CONCERT AND TRANSIT DIRECT FLIGHT (applyPlayerDeltas)
  // =========================================================================
  describe('Facet 2: Mega Concert and Transit Direct Flight (apply_delta_players)', () => {
    it('[TC-441.02a/MSS][UC-MEGA-CONCERT-AND-TRANSIT-DIRECT-FLIGHT] applyPlayerDeltas with MC_MEGA_CONCERT queues direct flight with waypoints [6] and flightType event', () => {
      useGameStore.setState({
        playerPositions: { p1: 33, bot_2: 23, bot_3: 19, bot_4: 15 },
        visualPositions: { p1: 33, bot_2: 23, bot_3: 19, bot_4: 15 },
        playersInfo: {
          p1: { id: 'p1', name: 'P1', balance: 5000, tokenColor: '#DC2626', ownedProperties: [] },
          bot_2: { id: 'bot_2', name: 'Bot 2', balance: 5000, tokenColor: '#2563EB', ownedProperties: [], isBot: true },
          bot_3: { id: 'bot_3', name: 'Bot 3', balance: 5000, tokenColor: '#16A34A', ownedProperties: [], isBot: true },
          bot_4: { id: 'bot_4', name: 'Bot 4', balance: 5000, tokenColor: '#D97706', ownedProperties: [], isBot: true },
        },
        pawnAnimationQueue: [],
        activePawnAnimation: null,
        isRolling: false,
      });

      const delta: DeltaPayload = {
        tick: 62,
        cells: [],
        players: [
          { id: 'p1', position: 6, balance: 5000 },
          { id: 'bot_2', position: 6, balance: 5000, isBot: true },
          { id: 'bot_3', position: 6, balance: 5000, isBot: true },
          { id: 'bot_4', position: 6, balance: 5000, isBot: true },
        ],
        lastEventCard: {
          id: 'MC_MEGA_CONCERT',
          cardId: 'MC_MEGA_CONCERT',
          type: 'Market',
          title: 'Đại Nhạc Hội',
          description: 'Tất cả người chơi tụ hội về cell 6',
        },
      };

      const playersInfoMap = { ...useGameStore.getState().playersInfo };
      applyPlayerDeltas(delta, useGameStore.getState(), playersInfoMap, false);

      const state = useGameStore.getState();
      const activeAnim = state.activePawnAnimation;
      const queue = state.pawnAnimationQueue;

      expect(activeAnim?.flightType).toBe('event');
      expect(activeAnim?.waypoints).toEqual([6]);
      expect(queue.find((t) => t.playerId === 'bot_2')?.flightType).toBe('event');
      expect(queue.find((t) => t.playerId === 'bot_2')?.waypoints).toEqual([6]);
    });

    it('[TC-441.02b/MSS][UC-MEGA-CONCERT-AND-TRANSIT-DIRECT-FLIGHT] applyPlayerDeltas with SAFE_HAVEN transit result queues direct flight with flightType transit', () => {
      useGameStore.setState({
        playerPositions: { p1: 15 },
        visualPositions: { p1: 15 },
        playersInfo: {
          p1: { id: 'p1', name: 'P1', balance: 5000, tokenColor: '#DC2626', ownedProperties: [] },
        },
        pawnAnimationQueue: [],
        activePawnAnimation: null,
        isRolling: false,
      });

      const delta: DeltaPayload = {
        tick: 40,
        cells: [],
        players: [
          { id: 'p1', position: 20, balance: 5000 },
        ],
        lastTransitResult: {
          playerId: 'p1',
          cellIndex: 15,
          outcome: 'SAFE_HAVEN',
          targetCell: 20,
        },
      };

      const playersInfoMap = { ...useGameStore.getState().playersInfo };
      applyPlayerDeltas(delta, useGameStore.getState(), playersInfoMap, false);

      const activeAnim = useGameStore.getState().activePawnAnimation;
      expect(activeAnim?.flightType).toBe('transit');
      expect(activeAnim?.waypoints).toEqual([20]);
    });
  });

  // =========================================================================
  // FACET 3: IN-FLIGHT QUEUE TAIL CONTINUITY & MODAL DISMISSAL
  // =========================================================================
  describe('Facet 3: In-Flight Queue Tail Continuity & Modal Dismissal (apply_delta_players & game_store)', () => {
    it('[TC-441.03a/A1][UC-IN-FLIGHT-QUEUE-TAIL-CONTINUITY] subsequent delta chains fromCell from pendingPawnMove targetCell when pending move is staged', () => {
      useGameStore.setState({
        isRolling: true,
        playerPositions: { bot_4: 7 },
        visualPositions: { bot_4: 7 },
        pendingPawnMove: {
          playerId: 'bot_4',
          targetCell: 15,
          fromCell: 7,
          isBot: true,
        },
        pawnAnimationQueue: [],
        activePawnAnimation: null,
      });

      const delta: DeltaPayload = {
        tick: 62,
        cells: [],
        players: [
          { id: 'bot_4', position: 17, balance: 5000, isBot: true },
        ],
      };

      const playersInfoMap = { ...useGameStore.getState().playersInfo };
      applyPlayerDeltas(delta, useGameStore.getState(), playersInfoMap, false);

      const task = useGameStore.getState().pawnAnimationQueue.find((t) => t.playerId === 'bot_4');
      expect(task?.fromCell).toBe(15);
      expect(task?.waypoints).toEqual([16, 17]);
    });

    it('[TC-441.03b/A1][UC-IN-FLIGHT-QUEUE-TAIL-CONTINUITY] dispatchPawnMove enqueues second player move to pawnAnimationQueue without overwriting pendingPawnMove', () => {
      useGameStore.setState({
        isRolling: true,
        playerPositions: { p1: 5, p2: 0 },
        visualPositions: { p1: 5, p2: 0 },
        pendingPawnMove: {
          playerId: 'p1',
          targetCell: 12,
          fromCell: 5,
          isBot: false,
        },
        pawnAnimationQueue: [],
        activePawnAnimation: null,
      });

      const delta: DeltaPayload = {
        tick: 50,
        cells: [],
        players: [
          { id: 'p2', position: 8, balance: 5000, isBot: true },
        ],
      };

      const playersInfoMap = { ...useGameStore.getState().playersInfo };
      applyPlayerDeltas(delta, useGameStore.getState(), playersInfoMap, false);

      const state = useGameStore.getState();
      expect(state.pendingPawnMove?.playerId).toBe('p1');
      expect(state.pawnAnimationQueue.find((t) => t.playerId === 'p2')?.targetCell).toBe(8);
    });

    it('[TC-441.03c/A1][UC-IN-FLIGHT-QUEUE-TAIL-CONTINUITY] startPawnMove restores flightType transit from cached cleared pending move on transit wheel dismissal', () => {
      useGameStore.getState().setPendingPawnMove({
        playerId: 'p1',
        targetCell: 20,
        fromCell: 5,
        isBot: false,
        flightType: 'transit',
      });

      // TransitWheelModal dismissal pattern: setPendingPawnMove(null) followed by 5-arg startPawnMove
      useGameStore.getState().setPendingPawnMove(null);
      useGameStore.getState().startPawnMove('p1', 20, 5, false, false);

      const activeAnim = useGameStore.getState().activePawnAnimation;
      expect(activeAnim?.flightType).toBe('transit');
      expect(activeAnim?.waypoints).toEqual([20]);
    });
  });

  // =========================================================================
  // FACET 4: SERVER BOT MID-TURN PACING UNBLOCK (resolveBotStepDelay)
  // =========================================================================
  describe('Facet 4: Server Bot Mid-Turn Pacing Unblock (turn_bot_timer_scheduler)', () => {
    it('[TC-441.04a/MSS][UC-SERVER-BOT-MID-TURN-PACING-UNBLOCK] resolveBotStepDelay returns 2000ms when kinematicsServed: true and pendingTransitWheel is set', () => {
      const room = createRoom('ROOM_PACING_A', 'Host');
      room.phase = TurnPhase.PropertyManagement;
      room.pendingTransitWheel = { playerId: 'bot_4', cellIndex: 15, timestamp: Date.now() };

      const delay = resolveBotStepDelay(room, 1500, false, true);

      expect(delay).toBe(BOT_TRANSIT_OBSERVATION_DELAY_MS);
      expect(delay).toBe(2000);
    });

    it('[TC-441.04b/MSS][UC-SERVER-BOT-MID-TURN-PACING-UNBLOCK] resolveBotStepDelay returns 3900ms when kinematicsServed: true and lastTransitResult has boostSteps: 2', () => {
      const room = createRoom('ROOM_PACING_B', 'Host');
      room.phase = TurnPhase.PropertyManagement;
      room.lastTransitResult = {
        playerId: 'bot_4',
        cellIndex: 15,
        outcome: 'SPEED_BOOST',
        boostSteps: 2,
        targetCell: 17,
      };

      const delay = resolveBotStepDelay(room, 1500, false, true);

      expect(delay).toBe(3900);
    });

    it('[TC-441.04c/MSS][UC-SERVER-BOT-MID-TURN-PACING-UNBLOCK] resolveBotStepDelay returns 2500ms when kinematicsServed: true and lastEventCard is set without transit', () => {
      const room = createRoom('ROOM_PACING_C', 'Host');
      room.phase = TurnPhase.PropertyManagement;
      room.lastEventCard = {
        id: 'MC_MEGA_CONCERT',
        cardId: 'MC_MEGA_CONCERT',
        type: 'Market',
        title: 'Đại Nhạc Hội',
        description: 'Tất cả người chơi tụ hội về cell 6',
      };

      const delay = resolveBotStepDelay(room, 1500, false, true);

      expect(delay).toBe(2500);
    });

    it('[TC-441.04d/MSS][UC-SERVER-BOT-MID-TURN-PACING-UNBLOCK] resolveBotStepDelay returns 6400ms when kinematicsServed: true and both transit boost: 2 and event card are set', () => {
      const room = createRoom('ROOM_PACING_D', 'Host');
      room.phase = TurnPhase.PropertyManagement;
      room.lastTransitResult = {
        playerId: 'bot_4',
        cellIndex: 15,
        outcome: 'SPEED_BOOST',
        boostSteps: 2,
        targetCell: 17,
      };
      room.lastEventCard = {
        id: 'MC_MEGA_CONCERT',
        cardId: 'MC_MEGA_CONCERT',
        type: 'Market',
        title: 'Đại Nhạc Hội',
        description: 'Tất cả người chơi tụ hội về cell 6',
      };

      const delay = resolveBotStepDelay(room, 1500, false, true);

      expect(delay).toBe(6400);
    });

    it('[TC-441.04e/MSS][UC-SERVER-BOT-MID-TURN-PACING-UNBLOCK] resolveBotStepDelay returns baseDelayMs (1500ms) when kinematicsServed: true with only lastDice', () => {
      const room = createRoom('ROOM_PACING_E', 'Host');
      room.phase = TurnPhase.PropertyManagement;
      room.lastDice = [3, 5];

      const delay = resolveBotStepDelay(room, 1500, false, true);

      expect(delay).toBe(1500);
    });
  });
});
