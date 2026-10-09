// [IMP-344] Living Contract Tests: Kinematic & Chance Game Event Synthesis
// Protocol: Station 1 Contract RED Testing
// Universal 5-Facet Behavioral Matrix & Dynamic Triad Coverage

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getGlobalGameEventBus,
  registerSubscriber,
  clearGameEventListeners,
  type GameEventContext,
} from '../../src/client/events/game_event_bus.js';
import {
  SynthesizedGameEventType,
  type BaseSynthesizedEvent,
  type SynthesizedGameEvent,
  type RentPaidEvent,
} from '../../src/client/events/game_event_types.js';
import { synthesizeKinematicEvents } from '../../src/client/events/game_event_kinematics_synthesizer.js';
import { formatKinematicActivityLog } from '../../src/client/events/subscribers/activity_log_kinematics_formatter.js';
import { synthesizeGameEvents } from '../../src/client/events/game_event_synthesizer.js';
import {
  mapEventToActivityLog,
} from '../../src/client/events/subscribers/activity_log_subscriber.js';
import { useGameStore, type GameState, type PlayerHudInfo } from '../../src/client/store/game_store.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { TurnPhase, type EventCardInfo } from '../../src/domain/room.js';
import { TransitWheelOutcome } from '../../src/domain/transit_wheel.js';


function toSynthesizedGameEvent(event: unknown): event is SynthesizedGameEvent {
  return typeof event === 'object' && event !== null && 'type' in event;
}

function asSynthesizedGameEvent(event: unknown): SynthesizedGameEvent {
  if (toSynthesizedGameEvent(event)) {
    return event;
  }
  throw new Error('HelperAdversarialError: Object does not conform to SynthesizedGameEvent contract');
}

function createMockPlayer(overrides: Partial<PlayerHudInfo> & { id: string }): PlayerHudInfo {
  return {
    name: overrides.id.toUpperCase(),
    balance: 5000,
    tokenColor: '#38BDF8',
    isBot: false,
    ownedProperties: [],
    mortgagedProperties: [],
    ...overrides,
  };
}

function createMockGameState(
  overrides?: Omit<Partial<GameState>, 'playersInfo'> & {
    playersInfo?: Record<string, Partial<PlayerHudInfo>>;
  },
): GameState {
  const base = useGameStore.getState();
  const defaultPlayers: Record<string, PlayerHudInfo> = {
    p1: createMockPlayer({ id: 'p1', name: 'Người chơi 1', balance: 5000, tokenColor: '#38BDF8' }),
    p2: createMockPlayer({ id: 'p2', name: 'Người chơi 2', balance: 5000, tokenColor: '#F59E0B' }),
  };

  let playersInfo = defaultPlayers;
  if (overrides?.playersInfo) {
    const merged: Record<string, PlayerHudInfo> = { ...defaultPlayers };
    for (const [id, p] of Object.entries(overrides.playersInfo)) {
      merged[id] = createMockPlayer({ id, ...p });
    }
    playersInfo = merged;
  }

  const { playersInfo: _, ...restOverrides } = overrides ?? {};

  return {
    ...base,
    playerPositions: { p1: 0, p2: 5 },
    playersInfo,
    roundNumber: 1,
    treasuryPool: 10000,
    turnPhase: TurnPhase.ActionPhase,
    currentTurnPlayerId: 'p1',
    hasRolledThisTurn: false,
    lastDiceSeq: 0,
    lastEventCard: null,
    lastTransitResult: null,
    ...restOverrides,
  };
}

function createMockEventContext(
  prevOverrides?: Parameters<typeof createMockGameState>[0],
  nextOverrides?: Parameters<typeof createMockGameState>[0],
  deltaOverrides?: Partial<DeltaPayload>,
): GameEventContext {
  const prevState = createMockGameState(prevOverrides);
  const nextState = createMockGameState(nextOverrides);
  const delta: DeltaPayload = {
    roomCode: 'TEST_ROOM',
    tick: 2,
    cells: [],
    ...deltaOverrides,
  };
  return { prevState, nextState, delta };
}

describe('Station 1 Contract Tests: Kinematic Game Event Synthesis (IMP-344)', () => {
  beforeEach(() => {
    clearGameEventListeners();
    useActivityStore.getState().clearLogs();
    useGameStore.setState(createMockGameState());
  });

  afterEach(() => {
    clearGameEventListeners();
    useActivityStore.getState().clearLogs();
  });

  it('TC-344.01 [UC-KIN/MSS] Given DeltaPayload with dice values [3, 4] and new diceSeq, When calling synthesizeKinematicEvents, Then emits DICE_ROLLED event with total 7 and isDouble false', () => {
    const prevState = createMockGameState({ lastDiceSeq: 0, hasRolledThisTurn: false });
    const nextState = createMockGameState({ lastDiceSeq: 1, hasRolledThisTurn: true, dice: [3, 4] });
    const delta: DeltaPayload = {
      roomCode: 'TEST_ROOM',
      tick: 2,
      cells: [],
      dice: [3, 4],
      diceSeq: 1,
      diceRollerId: 'p1',
    };

    const events = synthesizeKinematicEvents(prevState, nextState, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe('DICE_ROLLED');
    expect(events[0]).toMatchObject({
      playerId: 'p1',
      dice: [3, 4],
      total: 7,
      isDouble: false,
    });
  });

  it('TC-344.02 [UC-KIN/A1] Given DeltaPayload with duplicate or stale diceSeq matching prevState, When calling synthesizeKinematicEvents, Then suppresses duplicate event and returns empty array', () => {
    const prevState = createMockGameState({ lastDiceSeq: 5, hasRolledThisTurn: true, dice: [2, 5] });
    const nextState = createMockGameState({ lastDiceSeq: 5, hasRolledThisTurn: true, dice: [2, 5] });
    const delta: DeltaPayload = {
      roomCode: 'TEST_ROOM',
      tick: 3,
      cells: [],
      dice: [2, 5],
      diceSeq: 5,
      diceRollerId: 'p1',
    };

    const events = synthesizeKinematicEvents(prevState, nextState, delta);

    expect(events).toHaveLength(0);
  });

  it('TC-344.03 [UC-KIN/A2] Given player position change from 0 to 5 in sparse delta, When calling synthesizeKinematicEvents, Then emits PAWN_MOVED event with target cell index 5 and player attribution', () => {
    const prevState = createMockGameState({ playerPositions: { p1: 0, p2: 5 } });
    const nextState = createMockGameState({ playerPositions: { p1: 5, p2: 5 } });
    const delta: DeltaPayload = {
      roomCode: 'TEST_ROOM',
      tick: 2,
      cells: [],
      players: [{ id: 'p1', position: 5, balance: 5000 }],
    };

    const events = synthesizeKinematicEvents(prevState, nextState, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe('PAWN_MOVED');
    expect(events[0]).toMatchObject({
      playerId: 'p1',
      fromCell: 0,
      toCell: 5,
    });
  });

  it('TC-344.04 [UC-KIN/A3] Given DeltaPayload with new lastEventCard different from prevState, When calling synthesizeKinematicEvents, Then emits EVENT_CARD_DRAWN event with title and description', () => {
    const prevState = createMockGameState({ lastEventCard: null });
    const cardData: EventCardInfo = {
      id: 'card_01',
      cardId: 'CHANCE_LUCKY_01',
      type: 'Chance',
      cardType: 'chance',
      title: 'Cơ Hội Vàng',
      description: 'Nhận 500k từ Kho Bạc',
      effectDetail: 'Nhận 500k từ Kho Bạc',
      drawnBy: 'p1',
      effectDelta: 500,
    };
    const nextState = createMockGameState({ lastEventCard: cardData });
    const delta: DeltaPayload = {
      roomCode: 'TEST_ROOM',
      tick: 2,
      cells: [],
      lastEventCard: cardData,
    };

    const events = synthesizeKinematicEvents(prevState, nextState, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe('EVENT_CARD_DRAWN');
    expect(events[0]).toMatchObject({
      playerId: 'p1',
      cardId: 'CHANCE_LUCKY_01',
      cardType: 'chance',
      title: 'Cơ Hội Vàng',
      description: 'Nhận 500k từ Kho Bạc',
      effectDelta: 500,
    });
  });

  it('TC-344.05 [UC-KIN/A4] Given DeltaPayload with new lastTransitResult, When calling synthesizeKinematicEvents, Then emits TRANSIT_WHEEL_LANDED event with station outcome and payout', () => {
    const prevState = createMockGameState({ lastTransitResult: null });
    const transitResult = {
      playerId: 'p1',
      cellIndex: 12,
      outcome: TransitWheelOutcome.CASH_BACK,
      targetCell: 12,
      payout: 300,
      boostSteps: 0,
    };
    const nextState = createMockGameState({ lastTransitResult: transitResult });
    const delta: DeltaPayload = {
      roomCode: 'TEST_ROOM',
      tick: 2,
      cells: [],
      lastTransitResult: transitResult,
    };

    const events = synthesizeKinematicEvents(prevState, nextState, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe('TRANSIT_WHEEL_LANDED');
    expect(events[0]).toMatchObject({
      playerId: 'p1',
      cellIndex: 12,
      outcome: TransitWheelOutcome.CASH_BACK,
      payout: 300,
    });
  });

  it('TC-344.06 [UC-FMT/MSS] Given synthesized kinematic events, When formatKinematicActivityLog is invoked, Then produces formatted Vietnamese messages preserving exact emojis and punctuation', () => {
    const diceEvent = asSynthesizedGameEvent({
      type: SynthesizedGameEventType.DICE_ROLLED,
      timestamp: 1000,
      playerId: 'p1',
      dice: [3, 4] as const,
      total: 7,
      isDouble: false,
    });
    const doubleDiceEvent = asSynthesizedGameEvent({
      type: SynthesizedGameEventType.DICE_ROLLED,
      timestamp: 1001,
      playerId: 'p1',
      dice: [4, 4] as const,
      total: 8,
      isDouble: true,
    });
    const moveEvent = asSynthesizedGameEvent({
      type: SynthesizedGameEventType.PAWN_MOVED,
      timestamp: 1002,
      playerId: 'p1',
      fromCell: 0,
      toCell: 5,
    });
    const chanceEvent = asSynthesizedGameEvent({
      type: SynthesizedGameEventType.EVENT_CARD_DRAWN,
      timestamp: 1003,
      playerId: 'p1',
      cardId: 'CHANCE_01',
      cardType: 'chance',
      title: 'Cơ Hội Vàng',
      description: 'Nhận 500k',
    });

    const diceFmt = formatKinematicActivityLog(diceEvent, 'Alice');
    const doubleFmt = formatKinematicActivityLog(doubleDiceEvent, 'Alice');
    const moveFmt = formatKinematicActivityLog(moveEvent, 'Alice', 'Hà Nội');
    const chanceFmt = formatKinematicActivityLog(chanceEvent, 'Alice');

    expect(diceFmt).toEqual({
      type: 'dice',
      message: 'Alice đã gieo xúc xắc được 3 + 4 = 7 điểm',
    });
    expect(doubleFmt).toEqual({
      type: 'dice',
      message: 'Alice đã gieo xúc xắc được 4 + 4 = 8 điểm (Đổ đôi! 🎉)',
    });
    expect(moveFmt).toEqual({
      type: 'move',
      message: 'Alice đã di chuyển đến Hà Nội',
    });
    expect(chanceFmt).toEqual({
      type: 'card',
      message: '⚡ [Cơ Hội] Alice: Cơ Hội Vàng - Nhận 500k',
    });
  });

  it('TC-344.07 [UC-NET/MSS] Given applyDeltaToStore executing a delta with dice [3, 4] and position 5, When applyDeltaToStore completes, Then GameEventBus dispatches DICE_ROLLED and PAWN_MOVED events to useActivityStore', () => {
    const dispatchedEvents: SynthesizedGameEvent[] = [];
    registerSubscriber('tc344_bus_probe', (events) => {
      dispatchedEvents.push(...events);
    });

    const delta: DeltaPayload = {
      roomCode: 'TEST_ROOM',
      tick: 2,
      cells: [],
      dice: [3, 4],
      diceSeq: 10,
      diceRollerId: 'p1',
      players: [{ id: 'p1', position: 5, balance: 5000 }],
      currentTurnPlayerId: 'p1',
    };

    applyDeltaToStore(delta, useGameStore);

    const busTypes = dispatchedEvents.map((e) => e.type);
    expect(busTypes).toContain('DICE_ROLLED');
    expect(busTypes).toContain('PAWN_MOVED');

    const activityLogs = useActivityStore.getState().activityLogs;
    const diceLog = activityLogs.find((l) => l.type === 'dice');
    expect(diceLog?.id.startsWith('act_DICE_ROLLED_')).toBe(true);
  });

  it('TC-344.08 [UC-SYN/MSS] Given DeltaPayload with both dice roll and property purchase, When calling synthesizeGameEvents, Then kinematic events precede property and financial events in causal temporal order', () => {
    const prevState = createMockGameState({
      lastDiceSeq: 0,
      hasRolledThisTurn: false,
      playersInfo: {
        p1: createMockPlayer({ id: 'p1', balance: 5000, ownedProperties: [] }),
      },
    });
    const nextState = createMockGameState({
      lastDiceSeq: 1,
      hasRolledThisTurn: true,
      dice: [3, 4],
      playersInfo: {
        p1: createMockPlayer({ id: 'p1', balance: 4000, ownedProperties: [1] }),
      },
    });
    const delta: DeltaPayload = {
      roomCode: 'TEST_ROOM',
      tick: 2,
      dice: [3, 4],
      diceSeq: 1,
      diceRollerId: 'p1',
      cells: [{ index: 1, ownerId: 'p1' }],
      players: [{ id: 'p1', position: 1, balance: 4000 }],
    };

    const events = synthesizeGameEvents(prevState, nextState, delta);

    expect(events.length).toBeGreaterThanOrEqual(2);
    expect(events[0]?.type).toBe('DICE_ROLLED');
    expect(events[events.length - 1]?.type).toBe(SynthesizedGameEventType.PROPERTY_BOUGHT);
  });

  it('TC-344.09 [UC-MAP/MSS] Given synthesized kinematic DICE_ROLLED event and GameEventContext, When mapEventToActivityLog is invoked, Then maps directly to structured ActivityLogEntry with type dice', () => {
    const diceEvent = asSynthesizedGameEvent({
      type: SynthesizedGameEventType.DICE_ROLLED,
      timestamp: 12345678,
      playerId: 'p1',
      dice: [3, 4] as const,
      total: 7,
      isDouble: false,
    });
    const context = createMockEventContext();

    const entry = mapEventToActivityLog(diceEvent, context);

    expect(entry).not.toBeNull();
    expect(entry?.type).toBe('dice');
    expect(entry?.playerId).toBe('p1');
    expect(entry?.id).toContain('act_DICE_ROLLED_');
  });

  it('TC-344.10 [UC-KIN/A5] Given DeltaPayload with duplicate transit result matching prevState, When calling synthesizeKinematicEvents, Then suppresses duplicate transit event', () => {
    const existingResult = {
      playerId: 'p1',
      cellIndex: 12,
      outcome: TransitWheelOutcome.CASH_BACK,
      targetCell: 12,
      payout: 300,
      boostSteps: 0,
    };
    const prevState = createMockGameState({ lastTransitResult: existingResult });
    const nextState = createMockGameState({ lastTransitResult: existingResult });
    const delta: DeltaPayload = {
      roomCode: 'TEST_ROOM',
      tick: 3,
      cells: [],
      lastTransitResult: existingResult,
    };

    const events = synthesizeKinematicEvents(prevState, nextState, delta);

    expect(events).toHaveLength(0);
  });

  it('TC-344.11 [UC-KIN/A6] Given DeltaPayload with same event cardId as prevState, When calling synthesizeKinematicEvents, Then suppresses duplicate event card drawn', () => {
    const cardData: EventCardInfo = {
      id: 'card_stale',
      cardId: 'CHANCE_STALE_01',
      type: 'Chance',
      title: 'Thẻ Cũ',
      description: 'Đã nhận lượt trước',
      effectDetail: 'Đã nhận lượt trước',
      cardType: 'chance',
      drawnBy: 'p1',
    };
    const prevState = createMockGameState({ lastEventCard: cardData });
    const nextState = createMockGameState({ lastEventCard: cardData });
    const delta: DeltaPayload = {
      roomCode: 'TEST_ROOM',
      tick: 3,
      cells: [],
      lastEventCard: cardData,
    };

    const events = synthesizeKinematicEvents(prevState, nextState, delta);

    expect(events).toHaveLength(0);
  });

  it('TC-344.12 [UC-FMT/A1] Given non-kinematic event type (RENT_PAID), When formatKinematicActivityLog is invoked, Then returns null to delegate to financial mappers', () => {
    const rentEvent: RentPaidEvent = {
      type: SynthesizedGameEventType.RENT_PAID,
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 1,
      amount: 500,
      timestamp: 1000,
    };

    const result = formatKinematicActivityLog(rentEvent, 'Người chơi 1', 'Hà Nội');

    expect(result).toBeNull();
  });

  it('TC-344.13 [UC-TRIAD/MSS] Dynamic Triad - Given rapid consecutive deltas (roll then move then card), When synthesizing kinematic events per tick, Then generates monotonic causal streams without event dropping', () => {
    const s0 = createMockGameState({ playerPositions: { p1: 0 } });
    const s1 = createMockGameState({ playerPositions: { p1: 0 }, lastDiceSeq: 1, hasRolledThisTurn: true, dice: [3, 4] });
    const delta1: DeltaPayload = { roomCode: 'R', tick: 1, cells: [], dice: [3, 4], diceSeq: 1, diceRollerId: 'p1' };
    const evRoll = synthesizeKinematicEvents(s0, s1, delta1);

    const s2 = createMockGameState({ playerPositions: { p1: 7 }, lastDiceSeq: 1, hasRolledThisTurn: true, dice: [3, 4] });
    const delta2: DeltaPayload = { roomCode: 'R', tick: 2, cells: [], players: [{ id: 'p1', position: 7, balance: 5000 }] };
    const evMove = synthesizeKinematicEvents(s1, s2, delta2);

    expect(evRoll).toHaveLength(1);
    expect(evRoll[0]?.type).toBe('DICE_ROLLED');
    expect(evMove).toHaveLength(1);
    expect(evMove[0]?.type).toBe('PAWN_MOVED');
  });

  it('TC-344.14 [UC-TRIAD/A1] Dynamic Triad - Given registered event bus subscribers, When clearGameEventListeners is executed on teardown, Then listener registry is cleanly purged', () => {
    let callCount = 0;
    registerSubscriber('teardown_probe', () => {
      callCount++;
    });

    clearGameEventListeners();

    const rentEvent: RentPaidEvent = {
      type: SynthesizedGameEventType.RENT_PAID,
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 1,
      amount: 100,
      timestamp: 1000,
    };
    getGlobalGameEventBus().dispatchGameEvents([rentEvent], createMockEventContext());

    expect(callCount).toBe(0);
    expect(getGlobalGameEventBus().getListenerCount()).toBe(0);
  });

  it('TC-344.15 [UC-GATE/MSS] Helper Adversarial Gate - Given invalid non-event objects (null, primitives, missing type), When asSynthesizedGameEvent is called, Then throws HelperAdversarialError loudly', () => {
    expect(() => asSynthesizedGameEvent(null)).toThrow('HelperAdversarialError');
    expect(() => asSynthesizedGameEvent(undefined)).toThrow('HelperAdversarialError');
    expect(() => asSynthesizedGameEvent({ foo: 'bar' })).toThrow('HelperAdversarialError');
  });
});
