// [TC-IMP55/MSS][UC-GAME-008][UC-GAME-016] Contract Test Suite: Bot Pacing, Camera Lock & Landing Settlement
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Dynamic Server Delay & Boundary Calculation (calculateBotStepDelay)
// Facet 2: Camera Mode Stability & Opponent Bot Protection (resolveCameraMode)
// Facet 3: Client Movement Queue & Dice Synchronization (applyDeltaToStore)
// Facet 4: Server Turn Orchestration Pacing Invariant (TurnOrchestrator)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Room } from '../../src/domain/room.js';
import { TurnPhase } from '../../src/domain/room.js';
import * as turnOrchestratorModule from '../../src/server/network/turn_orchestrator.js';
import { TurnOrchestrator } from '../../src/server/network/turn_orchestrator.js';
import { resolveCameraMode, type CameraResolveParams } from '../../src/client/3d/camera_state_machine.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { SessionManager } from '../../src/server/session_manager.js';

// Dynamic resolver for calculateBotStepDelay (to be exported in Trạm 2)
const calculateBotStepDelay: (room: Room, baseDelayMs: number) => number =
  (turnOrchestratorModule as unknown as { calculateBotStepDelay: (room: Room, baseDelayMs: number) => number }).calculateBotStepDelay;

function createTestRoom(phase: TurnPhase, lastDice?: readonly [number, number]): Room {
  return {
    roomCode: 'PACE55',
    hostId: 'bot_player',
    players: [
      {
        id: 'bot_player',
        position: 0,
        balance: 15000,
        skipNextTurn: false,
        auditTurnsLeft: 0,
        consecutiveDoubles: 0,
        hand: [],
        pendingDebts: [],
        extraTurns: 0,
        doubleNextDice: false,
        mortgagedProperties: [],
        bankrupt: false,
        isBot: true,
      },
    ],
    currentPlayerIndex: 0,
    phase,
    started: true,
    activeModifiers: [],
    marketDeck: [],
    marketDiscard: [],
    chanceDeck: [],
    chanceDiscard: [],
    permanentRentBonus: {},
    treasury: 2000,
    lastDice,
  };
}

describe('[TC-IMP55/MSS] Bot Pacing & Camera Lock Contract Test Suite', () => {
  // ===========================================================================
  // FACET 1: Dynamic Server Delay & Boundary Calculation
  // ===========================================================================
  describe('[Facet 1: Dynamic Server Delay & Boundary Calculation]', () => {
    it('[TC-IMP55.01/MSS][UC-GAME-008] calculateBotStepDelay tinh dung 3300ms voi dice [3, 4] trong PropertyManagement', () => {
      const room = createTestRoom(TurnPhase.PropertyManagement, [3, 4]);
      const delay = calculateBotStepDelay(room, 1500);
      expect(delay).toBe(3300);
    });

    it('[TC-IMP55.02/MSS][UC-GAME-008] calculateBotStepDelay tinh dung 2300ms voi dice [1, 1] bien toi thieu trong PropertyManagement', () => {
      const room = createTestRoom(TurnPhase.PropertyManagement, [1, 1]);
      const delay = calculateBotStepDelay(room, 1500);
      expect(delay).toBe(2300);
    });

    it('[TC-IMP55.03/MSS][UC-GAME-008] calculateBotStepDelay tinh dung 4300ms voi dice [6, 6] bien toi da trong PropertyManagement', () => {
      const room = createTestRoom(TurnPhase.PropertyManagement, [6, 6]);
      const delay = calculateBotStepDelay(room, 1500);
      expect(delay).toBe(4300);
    });

    it('[TC-IMP55.04/MSS][UC-GAME-008] calculateBotStepDelay tra ve baseDelayMs khi phong o WaitingRoll', () => {
      const room = createTestRoom(TurnPhase.WaitingRoll, [3, 4]);
      const delay = calculateBotStepDelay(room, 1500);
      expect(delay).toBe(1500);
    });

    it('[TC-IMP55.05/MSS][UC-GAME-008] calculateBotStepDelay tra ve baseDelayMs khi lastDice la [0, 0]', () => {
      const room = createTestRoom(TurnPhase.PropertyManagement, [0, 0]);
      const delay = calculateBotStepDelay(room, 1500);
      expect(delay).toBe(1500);
    });

    it('[TC-IMP55.06/MSS][UC-GAME-008] calculateBotStepDelay tra ve baseDelayMs khi lastDice la undefined', () => {
      const room = createTestRoom(TurnPhase.PropertyManagement, undefined);
      const delay = calculateBotStepDelay(room, 1500);
      expect(delay).toBe(1500);
    });

    it('[TC-IMP55.07/MSS][UC-GAME-008] calculateBotStepDelay lay Math.max khi baseDelayMs lon hon dynamicDelay', () => {
      const room = createTestRoom(TurnPhase.PropertyManagement, [3, 4]);
      const delay = calculateBotStepDelay(room, 5000);
      expect(delay).toBe(5000);
    });

    it.each([
      [[1, 2], 2500],
      [[2, 5], 3300],
      [[4, 6], 3900],
      [[5, 5], 3900],
      [[3, 6], 3700],
    ] as const)(
      '[TC-IMP55.08/MSS][UC-GAME-008] calculateBotStepDelay bang tham so: dice %j -> delay %ims',
      (dice, expectedDelay) => {
        const room = createTestRoom(TurnPhase.PropertyManagement, dice);
        expect(calculateBotStepDelay(room, 1500)).toBe(expectedDelay);
      }
    );
  });

  // ===========================================================================
  // FACET 2: Camera Mode Stability & Opponent Bot Protection
  // ===========================================================================
  describe('[Facet 2: Camera Mode Stability & Opponent Bot Protection]', () => {
    it('[TC-IMP55.09/MSS][UC-GAME-016] resolveCameraMode tra ve overview khi isBotTurn la true', () => {
      const mode = resolveCameraMode({
        isRolling: false,
        isPawnAnimating: false,
        activeModal: null,
        isBotTurn: true,
      });
      expect(mode).toBe('overview');
    });

    it('[TC-IMP55.10/MSS][UC-GAME-016] resolveCameraMode tra ve overview khi isBotTurn la false nhung isAnimatingPawnBot la true', () => {
      const params: CameraResolveParams & { isAnimatingPawnBot?: boolean } = {
        isRolling: false,
        isPawnAnimating: true,
        activeModal: null,
        isBotTurn: false,
        isAnimatingPawnBot: true,
      };
      const mode = resolveCameraMode(params);
      expect(mode).toBe('overview');
    });

    it('[TC-IMP55.11/MSS][UC-GAME-016] resolveCameraMode tra ve pawn_chase khi quan co Human dang nhay', () => {
      const params: CameraResolveParams & { isAnimatingPawnBot?: boolean } = {
        isRolling: false,
        isPawnAnimating: true,
        activeModal: null,
        isBotTurn: false,
        isAnimatingPawnBot: false,
      };
      const mode = resolveCameraMode(params);
      expect(mode).toBe('pawn_chase');
    });

    it('[TC-IMP55.12/MSS][UC-GAME-016] resolveCameraMode tra ve auction_focus khi mo modal auction', () => {
      const mode = resolveCameraMode({
        isRolling: false,
        isPawnAnimating: false,
        activeModal: 'auction',
        isBotTurn: false,
      });
      expect(mode).toBe('auction_focus');
    });

    it('[TC-IMP55.13/MSS][UC-GAME-016] resolveCameraMode tra ve overview khi activeModal la game_over', () => {
      const mode = resolveCameraMode({
        isRolling: false,
        isPawnAnimating: false,
        activeModal: 'game_over',
        isBotTurn: false,
      });
      expect(mode).toBe('overview');
    });

    it('[TC-IMP55.14/MSS][UC-GAME-016] resolveCameraMode tra ve overview khi isRolling la true', () => {
      const mode = resolveCameraMode({
        isRolling: true,
        isPawnAnimating: false,
        activeModal: null,
        isBotTurn: false,
      });
      expect(mode).toBe('overview');
    });

    it.each([
      [{ isRolling: false, isPawnAnimating: true, activeModal: null, isBotTurn: true, isAnimatingPawnBot: true }, 'overview'],
      [{ isRolling: false, isPawnAnimating: true, activeModal: null, isBotTurn: true, isAnimatingPawnBot: false }, 'overview'],
      [{ isRolling: false, isPawnAnimating: true, activeModal: null, isBotTurn: false, isAnimatingPawnBot: true }, 'overview'],
      [{ isRolling: false, isPawnAnimating: true, activeModal: null, isBotTurn: false, isAnimatingPawnBot: false }, 'pawn_chase'],
    ] as const)(
      '[TC-IMP55.15/MSS][UC-GAME-016] resolveCameraMode bang tham so bao ve Bot: %j -> %s',
      (params, expectedMode) => {
        expect(resolveCameraMode(params as any)).toBe(expectedMode);
      }
    );
  });

  // ===========================================================================
  // FACET 3: Client Movement Queue & Dice Synchronization
  // ===========================================================================
  describe('[Facet 3: Client Movement Queue & Dice Synchronization]', () => {
    beforeEach(() => {
      useGameStore.setState({
        playerPositions: { p1: 0, bot_2: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Player 1', balance: 15000, tokenColor: '#38BDF8', ownedProperties: [], isBot: false },
          bot_2: { id: 'bot_2', name: 'Bot AI 2', balance: 15000, tokenColor: '#F59E0B', ownedProperties: [], isBot: true },
        },
        currentTurnPlayerId: 'bot_2',
        isRolling: false,
        hasRolledThisTurn: false,
        activePawnAnimation: null,
        pawnAnimationQueue: [],
        pendingPawnMove: null,
      });
    });

    it('[TC-IMP55.16/MSS][UC-GAME-016] applyDeltaToStore giu quan co Bot vao pendingPawnMove khi isRolling la true', () => {
      useGameStore.setState({ isRolling: true });

      applyDeltaToStore(
        {
          tick: 1,
          cells: [],
          players: [{ id: 'bot_2', position: 5, balance: 15000, isBot: true }],
        },
        useGameStore
      );

      const pending = useGameStore.getState().pendingPawnMove;
      expect(pending).toEqual({ playerId: 'bot_2', targetCell: 5, fromCell: 0 });
      expect(useGameStore.getState().activePawnAnimation).toBeNull();
    });

    it('[TC-IMP55.17/MSS][UC-GAME-016] applyDeltaToStore giu quan co Human vao pendingPawnMove khi isRolling la true', () => {
      useGameStore.setState({ isRolling: true });

      applyDeltaToStore(
        {
          tick: 1,
          cells: [],
          players: [{ id: 'p1', position: 4, balance: 15000, isBot: false }],
        },
        useGameStore
      );

      const pending = useGameStore.getState().pendingPawnMove;
      expect(pending).toEqual({ playerId: 'p1', targetCell: 4, fromCell: 0 });
      expect(useGameStore.getState().activePawnAnimation).toBeNull();
    });

    it('[TC-IMP55.18/MSS][UC-GAME-016] setIsRolling(false) giai phong pendingPawnMove cua Bot va khoi chay animation', () => {
      useGameStore.setState({
        isRolling: true,
        pendingPawnMove: { playerId: 'bot_2', targetCell: 5, fromCell: 0 },
      });

      useGameStore.getState().setIsRolling(false);

      expect(useGameStore.getState().pendingPawnMove).toBeNull();
      expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('bot_2');
      expect(useGameStore.getState().activePawnAnimation?.waypoints).toEqual([1, 2, 3, 4, 5]);
    });

    it('[TC-IMP55.19/MSS][UC-GAME-016] applyDeltaToStore kich hoat di chuyen Bot ngay khi isRolling la false', () => {
      useGameStore.setState({ isRolling: false });

      applyDeltaToStore(
        {
          tick: 1,
          cells: [],
          players: [{ id: 'bot_2', position: 6, balance: 15000, isBot: true }],
        },
        useGameStore
      );

      expect(useGameStore.getState().pendingPawnMove).toBeNull();
      expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('bot_2');
    });

    it('[TC-IMP55.20/MSS][UC-GAME-016] applyDeltaToStore kich hoat di chuyen Human ngay khi isRolling la false', () => {
      useGameStore.setState({ isRolling: false });

      applyDeltaToStore(
        {
          tick: 1,
          cells: [],
          players: [{ id: 'p1', position: 3, balance: 15000, isBot: false }],
        },
        useGameStore
      );

      expect(useGameStore.getState().pendingPawnMove).toBeNull();
      expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('p1');
    });
  });

  // ===========================================================================
  // FACET 4: Server Turn Orchestration Pacing Invariant
  // ===========================================================================
  describe('[Facet 4: Server Turn Orchestration Pacing Invariant]', () => {
    let rooms: RoomManager;
    let sessions: SessionManager;
    let intentMutex: IntentMutex;
    let broadcaster: DeltaBroadcaster;

    beforeEach(() => {
      rooms = new RoomManager(9999);
      sessions = new SessionManager();
      intentMutex = new IntentMutex();
      broadcaster = new DeltaBroadcaster(rooms, sessions, () => {});
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('[TC-IMP55.21/MSS][UC-GAME-008] TurnOrchestrator hoan buoc tiep theo cua Bot it nhat 3300ms khi dice [3, 4] trong PropertyManagement', async () => {
      vi.useFakeTimers();
      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: () => {},
        botTurnDelayMs: 1500,
      });

      const room = rooms.createRoom('bot_1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);

      room.players[0]!.isBot = true;
      room.phase = TurnPhase.PropertyManagement;
      room.lastDice = [3, 4];

      const stepSpy = vi.spyOn(rooms, 'stepBotTurn');
      orchestrator.orchestrate(room.roomCode);

      // Truoc 3300ms (tai t = 2000ms): Bot chua duoc phep thuc hien buoc ke tiep
      await vi.advanceTimersByTimeAsync(2000);
      expect(stepSpy).not.toHaveBeenCalled();

      // Sau 3400ms: Bot da hoan tat do tre va thuc hien buoc di
      await vi.advanceTimersByTimeAsync(1400);
      expect(stepSpy).toHaveBeenCalled();

      orchestrator.clearRoom(room.roomCode);
    });

    it('[TC-IMP55.22/MSS][UC-GAME-008] TurnOrchestrator hoan buoc tiep theo cua Bot it nhat 2300ms khi dice [1, 1] trong PropertyManagement', async () => {
      vi.useFakeTimers();
      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: () => {},
        botTurnDelayMs: 1500,
      });

      const room = rooms.createRoom('bot_1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);

      room.players[0]!.isBot = true;
      room.phase = TurnPhase.PropertyManagement;
      room.lastDice = [1, 1];

      const stepSpy = vi.spyOn(rooms, 'stepBotTurn');
      orchestrator.orchestrate(room.roomCode);

      // Truoc 2300ms (tai t = 1800ms): chua chay
      await vi.advanceTimersByTimeAsync(1800);
      expect(stepSpy).not.toHaveBeenCalled();

      // Sau 2400ms: da chay
      await vi.advanceTimersByTimeAsync(600);
      expect(stepSpy).toHaveBeenCalled();

      orchestrator.clearRoom(room.roomCode);
    });

    it('[TC-IMP55.23/MSS][UC-GAME-008] TurnOrchestrator giu baseDelayMs (1500ms) cho Bot o WaitingRoll', async () => {
      vi.useFakeTimers();
      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: () => {},
        botTurnDelayMs: 1500,
      });

      const room = rooms.createRoom('bot_1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);

      room.players[0]!.isBot = true;
      room.phase = TurnPhase.WaitingRoll;

      const stepSpy = vi.spyOn(rooms, 'stepBotTurn');
      orchestrator.orchestrate(room.roomCode);

      // Tai t = 1000ms: chua chay
      await vi.advanceTimersByTimeAsync(1000);
      expect(stepSpy).not.toHaveBeenCalled();

      // Tai t = 1600ms: da chay vi baseDelay la 1500ms
      await vi.advanceTimersByTimeAsync(600);
      expect(stepSpy).toHaveBeenCalled();

      orchestrator.clearRoom(room.roomCode);
    });

    it('[TC-IMP55.24/MSS][UC-GAME-008] TurnOrchestrator kich hoat timeout cho nguoi choi Human voi thoi luong pha', () => {
      const orchestrator = new TurnOrchestrator({
        rooms,
        intentMutex,
        broadcaster,
        onGameOver: () => {},
      });

      const room = rooms.createRoom('human_1');
      rooms.addBot(room.roomCode, 'bot_2');
      rooms.startGame(room.roomCode);

      room.players[0]!.isBot = false;
      room.phase = TurnPhase.PropertyManagement;

      orchestrator.orchestrate(room.roomCode);
      expect(orchestrator.getTimeRemaining(room.roomCode)).toBeGreaterThanOrEqual(19);

      orchestrator.clearRoom(room.roomCode);
    });
  });
});
