// [IMP-332] Living Contract Tests: Game Event Bus & Activity Log Purification
// Protocol: Station 1 Contract RED Testing
// Universal 5-Facet Behavioral Matrix & Dynamic Triad Coverage

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  GameEventBus,
  getGlobalGameEventBus,
  registerSubscriber,
  dispatchGameEvents,
  clearGameEventListeners,
  type GameEventContext,
} from '../../src/client/events/game_event_bus.js';
import {
  createActivityLogSubscriber,
} from '../../src/client/events/subscribers/activity_log_subscriber.js';
import {
  SynthesizedGameEventType,
  type RentPaidEvent,
  type GoSalaryEvent,
  type FeePaidEvent,
  type PartialRentEvent,
  type PortSplitRentEvent,
  type PropertyBoughtEvent,
  type PropertyUpgradedEvent,
  type PropertyMortgagedEvent,
  type PropertyUnmortgagedEvent,
  type TradeCompletedEvent,
  type AuctionWonEvent,
  type AuctionBidPlacedEvent,
  type SynthesizedGameEvent,
} from '../../src/client/events/game_event_types.js';
import { useGameStore, type GameState, type PlayerHudInfo } from '../../src/client/store/game_store.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { purgeClientMatchSession } from '../../src/client/network/client_session_purger.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { TurnPhase } from '../../src/domain/room.js';

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
    p1: createMockPlayer({ id: 'p1', name: 'Player 1', balance: 5000, tokenColor: '#38BDF8' }),
    p2: createMockPlayer({ id: 'p2', name: 'Player 2', balance: 5000, tokenColor: '#F59E0B' }),
    p3: createMockPlayer({ id: 'p3', name: 'Player 3', balance: 5000, tokenColor: '#10B981' }),
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
    playerPositions: { p1: 0, p2: 5, p3: 10 },
    playersInfo,
    roundNumber: 1,
    treasuryPool: 10000,
    turnPhase: TurnPhase.ActionPhase,
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

describe('Station 1 Contract Tests: Game Event Bus & Activity Logs (IMP-332)', () => {
  beforeEach(() => {
    clearGameEventListeners();
    useActivityStore.getState().clearLogs();
    useGameStore.getState().resetGameState();
  });

  afterEach(() => {
    clearGameEventListeners();
    useActivityStore.getState().clearLogs();
  });

  it('TC-332.01 [UC-BUS/MSS] Given registered listeners on GameEventBus, When dispatchGameEvents is called, Then all listeners receive the synthesized events in registration order', () => {
    const bus = new GameEventBus();
    const order: string[] = [];
    const rentEvent: RentPaidEvent = {
      type: SynthesizedGameEventType.RENT_PAID,
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 1,
      amount: 200,
      timestamp: 1000,
    };
    const context = createMockEventContext();

    bus.registerSubscriber('sub_first', () => {
      order.push('sub_first');
    });
    bus.registerSubscriber('sub_second', () => {
      order.push('sub_second');
    });

    bus.dispatchGameEvents([rentEvent], context);

    expect(bus.getListenerCount()).toBe(2);
    expect(order).toEqual(['sub_first', 'sub_second']);
  });

  it('TC-332.02 [UC-BUS/A1] Given a faulty listener that throws an error, When dispatchGameEvents executes, Then the error is caught and remaining listeners execute without failure', () => {
    const bus = new GameEventBus();
    const executed: string[] = [];
    const rentEvent: RentPaidEvent = {
      type: SynthesizedGameEventType.RENT_PAID,
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 1,
      amount: 200,
      timestamp: 1000,
    };
    const context = createMockEventContext();

    bus.registerSubscriber('sub_crasher', () => {
      throw new Error('Fatal subscriber crash');
    });
    bus.registerSubscriber('sub_survivor', () => {
      executed.push('sub_survivor');
    });

    expect(() => bus.dispatchGameEvents([rentEvent], context)).not.toThrow();
    expect(executed).toEqual(['sub_survivor']);
  });

  it('TC-332.03 [UC-BUS/A2] Given an active subscription, When unsubscribe is called, Then the listener is detached and receives zero subsequent dispatches', () => {
    const bus = new GameEventBus();
    let dispatchCount = 0;
    const rentEvent: RentPaidEvent = {
      type: SynthesizedGameEventType.RENT_PAID,
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 1,
      amount: 200,
      timestamp: 1000,
    };
    const context = createMockEventContext();

    const unsubscribe = bus.registerSubscriber('sub_temp', () => {
      dispatchCount += 1;
    });

    bus.dispatchGameEvents([rentEvent], context);
    expect(dispatchCount).toBe(1);

    unsubscribe();
    bus.dispatchGameEvents([rentEvent], context);

    expect(dispatchCount).toBe(1);
    expect(bus.getListenerCount()).toBe(0);
  });

  it('TC-332.04 [UC-BUS/A3] Given multiple listeners registered via key, When duplicate key registers, Then replaces cleanly without HMR accumulation', () => {
    const bus = new GameEventBus();
    let v1Invoked = false;
    let v2Invoked = false;
    const rentEvent: RentPaidEvent = {
      type: SynthesizedGameEventType.RENT_PAID,
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 1,
      amount: 200,
      timestamp: 1000,
    };
    const context = createMockEventContext();

    bus.registerSubscriber('hmr_key', () => {
      v1Invoked = true;
    });
    bus.registerSubscriber('hmr_key', () => {
      v2Invoked = true;
    });

    bus.dispatchGameEvents([rentEvent], context);

    expect(bus.getListenerCount()).toBe(1);
    expect(v1Invoked).toBe(false);
    expect(v2Invoked).toBe(true);
  });

  it('TC-332.05 [UC-ACT/MSS] Given financial events (RENT_PAID, GO_SALARY, FEE_PAID, PARTIAL_RENT, PORT_SPLIT_RENT), When activity log subscriber processes them, Then appends formatted ActivityLogEntry items to useActivityStore', () => {
    const subscriber = createActivityLogSubscriber(useActivityStore);
    const context = createMockEventContext();

    const rentEvt: RentPaidEvent = {
      type: SynthesizedGameEventType.RENT_PAID,
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 1,
      amount: 200,
      timestamp: 1000,
    };
    const salaryEvt: GoSalaryEvent = {
      type: SynthesizedGameEventType.GO_SALARY,
      playerId: 'p1',
      grossSalary: 2000,
      taxDeduction: 100,
      netAmount: 1900,
      timestamp: 1001,
    };
    const feeEvt: FeePaidEvent = {
      type: SynthesizedGameEventType.FEE_PAID,
      payerId: 'p1',
      feeType: 'LAND_TAX',
      amount: 300,
      timestamp: 1002,
    };
    const partialRentEvt: PartialRentEvent = {
      type: SynthesizedGameEventType.PARTIAL_RENT,
      payerId: 'p1',
      receiverId: 'p2',
      paidAmount: 150,
      remainingDebt: 50,
      cellIndex: 1,
      timestamp: 1003,
    };
    const portSplitEvt: PortSplitRentEvent = {
      type: SynthesizedGameEventType.PORT_SPLIT_RENT,
      payerId: 'p1',
      receiverIds: ['p2', 'p3'],
      cellIndex: 5,
      totalAmount: 400,
      amountPerReceiver: 200,
      timestamp: 1004,
    };

    const events: SynthesizedGameEvent[] = [rentEvt, salaryEvt, feeEvt, partialRentEvt, portSplitEvt];
    subscriber(events, context);

    const logs = useActivityStore.getState().activityLogs;
    expect(logs).toHaveLength(5);
    expect(logs[0]?.type).toBe('rent');
    expect(logs[1]?.type).toBe('salary');
    expect(logs[2]?.amount).toBe(-300);
  });

  it('TC-332.06 [UC-ACT/A1] Given property events (PROPERTY_BOUGHT, UPGRADED, MORTGAGED, UNMORTGAGED), When activity log subscriber processes them, Then creates correct title deed and financial log entries', () => {
    const subscriber = createActivityLogSubscriber(useActivityStore);
    const context = createMockEventContext();

    const boughtEvt: PropertyBoughtEvent = {
      type: SynthesizedGameEventType.PROPERTY_BOUGHT,
      cellIndex: 3,
      buyerId: 'p1',
      price: 600,
      timestamp: 1000,
    };
    const upgradedEvt: PropertyUpgradedEvent = {
      type: SynthesizedGameEventType.PROPERTY_UPGRADED,
      cellIndex: 3,
      ownerId: 'p1',
      targetLevel: 2,
      cost: 300,
      timestamp: 1001,
    };
    const mortgagedEvt: PropertyMortgagedEvent = {
      type: SynthesizedGameEventType.PROPERTY_MORTGAGED,
      cellIndex: 3,
      ownerId: 'p1',
      loanAmount: 300,
      timestamp: 1002,
    };
    const unmortgagedEvt: PropertyUnmortgagedEvent = {
      type: SynthesizedGameEventType.PROPERTY_UNMORTGAGED,
      cellIndex: 3,
      ownerId: 'p1',
      cost: 330,
      timestamp: 1003,
    };

    const events: SynthesizedGameEvent[] = [boughtEvt, upgradedEvt, mortgagedEvt, unmortgagedEvt];
    subscriber(events, context);

    const logs = useActivityStore.getState().activityLogs;
    expect(logs).toHaveLength(4);
    expect(logs[0]?.type).toBe('buy');
    expect(logs[1]?.type).toBe('upgrade');
    expect(logs[2]?.type).toBe('mortgage');
  });

  it('TC-332.07 [UC-ACT/A2] Given market events (TRADE_COMPLETED, AUCTION_WON, AUCTION_BID_PLACED), When activity log subscriber processes them, Then records cohesive P2P swap or auction log entries', () => {
    const subscriber = createActivityLogSubscriber(useActivityStore);
    const context = createMockEventContext();

    const tradeEvt: TradeCompletedEvent = {
      type: SynthesizedGameEventType.TRADE_COMPLETED,
      sellerId: 'p2',
      buyerId: 'p1',
      cellIndex: 3,
      offeredCellIndex: 8,
      price: 200,
      taxAmount: 20,
      timestamp: 1000,
    };
    const auctionWonEvt: AuctionWonEvent = {
      type: SynthesizedGameEventType.AUCTION_WON,
      cellIndex: 3,
      winnerId: 'p1',
      winningBid: 750,
      timestamp: 1001,
    };
    const auctionBidEvt: AuctionBidPlacedEvent = {
      type: SynthesizedGameEventType.AUCTION_BID_PLACED,
      cellIndex: 3,
      bidderId: 'p1',
      bidAmount: 500,
      timestamp: 1002,
    };

    const events: SynthesizedGameEvent[] = [tradeEvt, auctionWonEvt, auctionBidEvt];
    subscriber(events, context);

    const logs = useActivityStore.getState().activityLogs;
    expect(logs).toHaveLength(3);
    expect(logs[0]?.type).toBe('trade');
    expect(logs[1]?.type).toBe('buy');
    expect(logs[2]?.type).toBe('auction');
  });

  it('TC-332.08 [UC-ISO/A4] Given a multi-event batch where event 1 throws during mapping, When subscriber processes the batch, Then event 2 is still processed (per-event isolation)', () => {
    const subscriber = createActivityLogSubscriber(useActivityStore);
    const context = createMockEventContext();

    const faultyEvent: SynthesizedGameEvent = {
      type: SynthesizedGameEventType.RENT_PAID,
      get payerId(): string {
        throw new Error('Poison pill in payerId getter');
      },
      receiverId: 'p2',
      cellIndex: 1,
      amount: 200,
      timestamp: 1000,
    };

    const healthyEvent: RentPaidEvent = {
      type: SynthesizedGameEventType.RENT_PAID,
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 1,
      amount: 200,
      timestamp: 1001,
    };

    expect(() => subscriber([faultyEvent, healthyEvent], context)).not.toThrow();
    const logs = useActivityStore.getState().activityLogs;
    expect(logs.some((l) => l.type === 'rent')).toBe(true);
  });

  it('TC-332.09 [UC-COLLIDE/A5] Given applyDeltaToStore receiving rent delta, When executed with suppressFinancialAndProperty, Then exactly 1 activity log entry is added to useActivityStore (zero duplicate logs)', () => {
    useGameStore.setState({
      playersInfo: {
        p1: createMockPlayer({ id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [] }),
        p2: createMockPlayer({ id: 'p2', name: 'Player 2', balance: 5000, ownedProperties: [1] }),
      },
      playerPositions: { p1: 1, p2: 5 },
      currentTurnPlayerId: 'p1',
    });

    const dispatched: SynthesizedGameEvent[] = [];
    registerSubscriber('collide_guard_probe', (events) => {
      dispatched.push(...events);
    });

    const delta: DeltaPayload = {
      roomCode: 'TEST_ROOM',
      tick: 3,
      cells: [],
      players: [
        { id: 'p1', position: 1, balance: 4800 },
        { id: 'p2', position: 5, balance: 5200 },
      ],
      currentTurnPlayerId: 'p1',
    };

    applyDeltaToStore(delta, useGameStore);

    const rentLogs = useActivityStore.getState().activityLogs.filter((l) => l.type === 'rent');
    expect(dispatched.some((e) => e.type === SynthesizedGameEventType.RENT_PAID)).toBe(true);
    expect(rentLogs).toHaveLength(1);
    expect(rentLogs[0]?.amount).toBe(-200);
  });

  it('TC-332.10 [UC-PURGE/A6] Given registered event bus listeners, When purgeClientMatchSession runs, Then listeners are cleared and re-initialized cleanly for the next match', () => {
    let customProbeCalled = false;
    registerSubscriber('custom_probe', () => {
      customProbeCalled = true;
    });
    expect(getGlobalGameEventBus().getListenerCount()).toBeGreaterThanOrEqual(1);

    purgeClientMatchSession();

    const rentEvent: RentPaidEvent = {
      type: SynthesizedGameEventType.RENT_PAID,
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 1,
      amount: 200,
      timestamp: 1000,
    };
    const context = createMockEventContext();

    dispatchGameEvents([rentEvent], context);

    expect(customProbeCalled).toBe(false);
    expect(useActivityStore.getState().activityLogs.some((l) => l.type === 'rent')).toBe(true);
    expect(getGlobalGameEventBus().getListenerCount()).toBeGreaterThanOrEqual(1);
  });


  it('TC-332.11 [UC-INT/A7] Given existing dice, transit, and card deltas, When applyDeltaToStore executes with suppressFinancialAndProperty, Then movement and non-financial activities are preserved 100% without regression', () => {
    useGameStore.setState({
      playersInfo: {
        p1: createMockPlayer({ id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [] }),
        p2: createMockPlayer({ id: 'p2', name: 'Player 2', balance: 5000, ownedProperties: [1] }),
      },
      playerPositions: { p1: 0, p2: 5 },
      currentTurnPlayerId: 'p1',
    });

    const receivedEvents: SynthesizedGameEvent[] = [];
    registerSubscriber('regression_probe', (events) => {
      receivedEvents.push(...events);
    });

    const delta: DeltaPayload = {
      roomCode: 'TEST_ROOM',
      tick: 4,
      cells: [],
      dice: [3, 4],
      diceSeq: 1,
      players: [
        { id: 'p1', position: 1, balance: 4800 },
        { id: 'p2', position: 5, balance: 5200 },
      ],
      currentTurnPlayerId: 'p1',
      lastEventCard: {
        id: 'CC_INVEST',
        type: 'Chance',
        title: 'Cơ hội đầu tư',
        description: 'Đầu tư sinh lời',
        effectDelta: 50,
      },
    };

    applyDeltaToStore(delta, useGameStore);

    const logs = useActivityStore.getState().activityLogs;
    expect(logs.some((l) => l.type === 'dice')).toBe(true);
    expect(logs.some((l) => l.type === 'move')).toBe(true);
    expect(logs.some((l) => l.type === 'card')).toBe(true);
    expect(receivedEvents.some((e) => e.type === SynthesizedGameEventType.RENT_PAID)).toBe(true);
  });
});
