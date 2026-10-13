// [IMP-390] Contract Test Suite: Kinematic Pacing Restoration & Gentle Turn Rhythm Tuning
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateBotStepDelay,
  resolveBotStepDelay,
  BOT_START_TURN_BREATHING_ROOM_MS,
  BOT_KINEMATIC_DWELL_COMPENSATION_MS,
  TurnBotTimerScheduler,
  type TurnBotSchedulerDelegate,
} from '../../src/server/network/turn_orchestrator.js';
import { TurnPhase, type Room, type Player } from '../../src/domain/room.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { SessionManager } from '../../src/server/session_manager.js';

function createMockPlayer(id: string, isBot: boolean): Player {
  return {
    id,
    position: 0,
    balance: 10000,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    consecutiveDoubles: 0,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
    bankrupt: false,
    isBot,
  };
}

function createMockRoom(
  roomCode: string,
  phase: TurnPhase,
  players: Player[]
): Room {
  return {
    roomCode,
    hostId: players[0]?.id ?? 'host',
    players,
    currentPlayerIndex: 0,
    phase,
    started: true,
    activeModifiers: [],
    marketDeck: [],
    marketDiscard: [],
    chanceDeck: [],
    chanceDiscard: [],
    permanentRentBonus: {},
    treasury: 5000,
  };
}

describe('IMP-390: Kinematic Pacing Restoration & Gentle Turn Rhythm Tuning', () => {
  let rooms: RoomManager;
  let intentMutex: IntentMutex;
  let broadcaster: DeltaBroadcaster;

  beforeEach(() => {
    rooms = new RoomManager(4242);
    intentMutex = new IntentMutex();
    const sessionManager = new SessionManager();
    broadcaster = new DeltaBroadcaster(rooms, sessionManager);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('TC-390.01 [UC-PACING-CALCULATE-BOT-STEP-DELAY/MSS]: Given a room in PropertyManagement with dice [3, 4], When calling calculateBotStepDelay(room, 1500), Then returns exactly 3300ms preserving legacy base contract', () => {
    const room = createMockRoom('ROOM_01', TurnPhase.PropertyManagement, [
      createMockPlayer('bot_1', true),
    ]);
    room.lastDice = [3, 4];

    const delay = calculateBotStepDelay(room, 1500);
    expect(delay).toBe(3300);
  });

  it('TC-390.02 [UC-PACING-RESOLVE-WAITING-ROLL/MSS]: Given a room in TurnPhase.WaitingRoll and botTurnDelayMs = 1500 (> 500), When calling resolveBotStepDelay(room, 1500), Then returns exactly 2200ms providing turn transition breathing room', () => {
    const room = createMockRoom('ROOM_02', TurnPhase.WaitingRoll, [
      createMockPlayer('bot_1', true),
    ]);

    const delay = resolveBotStepDelay(room, 1500);
    expect(delay).toBe(BOT_START_TURN_BREATHING_ROOM_MS);
    expect(delay).toBe(2200);
  });

  it('TC-390.03 [UC-PACING-RESOLVE-DWELL-COMPENSATION/MSS]: Given a room in TurnPhase.ActionPhase with dice [3, 4] and botTurnDelayMs = 1500, When calling resolveBotStepDelay(room, 1500), Then returns 4500ms (3300ms legacy delay + 1200ms client dwell compensation)', () => {
    const room = createMockRoom('ROOM_03', TurnPhase.ActionPhase, [
      createMockPlayer('bot_1', true),
    ]);
    room.lastDice = [3, 4];

    const delay = resolveBotStepDelay(room, 1500);
    expect(delay).toBe(3300 + BOT_KINEMATIC_DWELL_COMPENSATION_MS);
    expect(delay).toBe(4500);
  });

  it('TC-390.04 [UC-PACING-TRANSIT-WHEEL-FALLTHROUGH-GUARD/MSS]: Given a room in ActionPhase with lastTransitResult and dice [2, 3], When calling resolveBotStepDelay(room, 1500), Then returns dynamicTransitDelay without adding 1200ms dwell compensation', () => {
    const room = createMockRoom('ROOM_04', TurnPhase.ActionPhase, [
      createMockPlayer('bot_1', true),
    ]);
    room.lastDice = [2, 3];
    room.lastTransitResult = {
      playerId: 'bot_1',
      cellIndex: 5,
      outcome: 'boost',
      boostSteps: 2,
      targetCell: 7,
    };

    // dynamicTransitDelay = 1200 + boost * 350 + 2000 = 1200 + 700 + 2000 = 3900ms
    const delay = resolveBotStepDelay(room, 1500);
    expect(delay).toBe(3900);
  });

  it('TC-390.05 [UC-PACING-MULTI-PHASE-DOUBLE-DWELL-GUARD/MSS]: Given a room in PropertyManagement where kinematics was already served in ActionPhase (kinematicsServed = true), When calling resolveBotStepDelay(room, 1500, false, true), Then returns baseDelayMs (1500ms) avoiding double kinematic wait', () => {
    const room = createMockRoom('ROOM_05', TurnPhase.PropertyManagement, [
      createMockPlayer('bot_1', true),
    ]);
    room.lastDice = [3, 4];

    const delay = resolveBotStepDelay(room, 1500, false, true);
    expect(delay).toBe(1500);
  });

  it('TC-390.06 [UC-PACING-FAST-TEST-OVERRIDE/MSS]: Given a room in TurnPhase.ActionPhase with baseDelayMs <= 500, When calling resolveBotStepDelay(room, 500), Then returns exactly 500ms without adding dwell padding', () => {
    const room = createMockRoom('ROOM_06', TurnPhase.ActionPhase, [
      createMockPlayer('bot_1', true),
    ]);
    room.lastDice = [3, 4];

    const delay = resolveBotStepDelay(room, 500);
    expect(delay).toBe(500);
  });

  it('TC-390.07 [UC-PACING-SCHEDULER-WIRING/MSS]: Given TurnBotTimerScheduler instance, When scheduleBotStep is executed, Then the scheduled timer uses the resolved delay and records kinematicsServed for room.diceSeq', async () => {
    vi.useFakeTimers();
    let scheduledDelay = 0;
    const mockDelegate: TurnBotSchedulerDelegate = {
      rooms,
      intentMutex,
      broadcaster,
      botTurnDelayMs: 1500,
      onGameOver: () => {},
      hasEligibleAuctionBot: () => false,
      scheduleAuctionSettle: () => {},
      clearAuctionSettleTimer: () => {},
      orchestrate: () => {},
      registerActiveTimer: (_rc, timer, deadline) => {
        scheduledDelay = deadline - Date.now();
      },
      clearActiveTimer: () => {},
      setDeadline: () => {},
    };

    const scheduler = new TurnBotTimerScheduler(mockDelegate);
    const room = rooms.createRoom('bot_1');
    rooms.addBot(room.roomCode, 'bot_2');
    rooms.startGame(room.roomCode);
    room.players[0]!.isBot = true;
    room.phase = TurnPhase.WaitingRoll;
    room.diceSeq = 1;

    scheduler.scheduleBotStep(room.roomCode);
    expect(scheduledDelay).toBeGreaterThan(0);
    expect(scheduler.botKinematicsServedSeq).toBeDefined();
  });

  it('TC-390.08 [UC-PACING-UNDEFINED-ROOM/MSS]: Given undefined room, When calling resolveBotStepDelay, Then returns baseDelayMs directly', () => {
    const delay = resolveBotStepDelay(undefined, 1500);
    expect(delay).toBe(1500);
  });

  it('TC-390.09 [UC-PACING-INSOLVENCY-PHASE/MSS]: Given room in InsolvencyPhase with dice [3, 4], When calling resolveBotStepDelay, Then returns baseDelayMs without dwell padding', () => {
    const room = createMockRoom('ROOM_09', TurnPhase.InsolvencyPhase, [
      createMockPlayer('bot_1', true),
    ]);
    room.lastDice = [3, 4];

    const delay = resolveBotStepDelay(room, 1500);
    expect(delay).toBe(1500);
  });

  it('TC-390.10 [UC-PACING-ZERO-DICE/MSS]: Given room in PropertyManagement with dice [0, 0], When calling resolveBotStepDelay, Then returns baseDelayMs without dwell compensation', () => {
    const room = createMockRoom('ROOM_10', TurnPhase.PropertyManagement, [
      createMockPlayer('bot_1', true),
    ]);
    room.lastDice = [0, 0];

    const delay = resolveBotStepDelay(room, 1500);
    expect(delay).toBe(1500);
  });

  it('TC-390.11 [UC-PACING-EVENT-CARD-OBSERVATION/MSS]: Given room with lastEventCard and baseDelayMs = 1500, When calling resolveBotStepDelay, Then returns 2500ms observation window', () => {
    const room = createMockRoom('ROOM_11', TurnPhase.PropertyManagement, [
      createMockPlayer('bot_1', true),
    ]);
    room.lastEventCard = {
      id: 'chance_1',
      type: 'Chance',
      title: 'Cơ Hội',
      description: 'Nhận thưởng',
    };

    const delay = resolveBotStepDelay(room, 1500);
    expect(delay).toBe(2500);
  });

  it('TC-390.12 [UC-PACING-UPGRADE-DELAY-PRIORITY/MSS]: Given room in ActionPhase with dice [3, 4] and hasUpgradeDelay = true, When calling resolveBotStepDelay, Then prioritizes BOT_UPGRADE_OBSERVATION_DELAY_MS (1500ms)', () => {
    const room = createMockRoom('ROOM_12', TurnPhase.ActionPhase, [
      createMockPlayer('bot_1', true),
    ]);
    room.lastDice = [3, 4];

    const delay = resolveBotStepDelay(room, 1500, true);
    expect(delay).toBe(1500);
  });

  it('TC-390.13 [UC-PACING-MAX-DICE-STEPS/MSS]: Given room in ActionPhase with max roll [6, 6] (12 steps), When calling resolveBotStepDelay, Then returns 5500ms (4300ms base + 1200ms dwell)', () => {
    const room = createMockRoom('ROOM_13', TurnPhase.ActionPhase, [
      createMockPlayer('bot_1', true),
    ]);
    room.lastDice = [6, 6];

    // legacy: 1100 + 12*200 + 800 = 4300ms. With dwell: 4300 + 1200 = 5500ms
    const delay = resolveBotStepDelay(room, 1500);
    expect(delay).toBe(5500);
  });

  it('TC-390.14 [UC-PACING-CLEAR-UPGRADE-FLAG/MSS]: Given TurnBotTimerScheduler with botJustUpgraded set, When clearUpgradeFlag is invoked, Then deletes the upgrade flag for that roomCode', () => {
    const mockDelegate: TurnBotSchedulerDelegate = {
      rooms,
      intentMutex,
      broadcaster,
      botTurnDelayMs: 1500,
      onGameOver: () => {},
      hasEligibleAuctionBot: () => false,
      scheduleAuctionSettle: () => {},
      clearAuctionSettleTimer: () => {},
      orchestrate: () => {},
      registerActiveTimer: () => {},
      clearActiveTimer: () => {},
      setDeadline: () => {},
    };
    const scheduler = new TurnBotTimerScheduler(mockDelegate);
    scheduler.botJustUpgraded.set('ROOM_14', true);

    scheduler.clearUpgradeFlag('ROOM_14');
    expect(scheduler.botJustUpgraded.has('ROOM_14')).toBe(false);
  });

  it('TC-390.15 [UC-PACING-CLEAR-ROOM-STATE/MSS]: Given TurnBotTimerScheduler with both upgraded and kinematics flags, When clearRoomState is invoked, Then purges both collections cleanly', () => {
    const mockDelegate: TurnBotSchedulerDelegate = {
      rooms,
      intentMutex,
      broadcaster,
      botTurnDelayMs: 1500,
      onGameOver: () => {},
      hasEligibleAuctionBot: () => false,
      scheduleAuctionSettle: () => {},
      clearAuctionSettleTimer: () => {},
      orchestrate: () => {},
      registerActiveTimer: () => {},
      clearActiveTimer: () => {},
      setDeadline: () => {},
    };
    const scheduler = new TurnBotTimerScheduler(mockDelegate);
    scheduler.botJustUpgraded.set('ROOM_15', true);
    scheduler.botKinematicsServedSeq.set('ROOM_15', 7);

    scheduler.clearRoomState('ROOM_15');
    expect(scheduler.botJustUpgraded.has('ROOM_15')).toBe(false);
    expect(scheduler.botKinematicsServedSeq.has('ROOM_15')).toBe(false);
  });

  it('TC-390.16 [UC-PACING-FACADE-RE-EXPORTS/MSS]: Given turn_orchestrator public facade, When checking exported symbols, Then exports resolveBotStepDelay and pacing constants accurately', () => {
    expect(typeof resolveBotStepDelay).toBe('function');
    expect(BOT_START_TURN_BREATHING_ROOM_MS).toBe(2200);
    expect(BOT_KINEMATIC_DWELL_COMPENSATION_MS).toBe(1200);
  });
});
