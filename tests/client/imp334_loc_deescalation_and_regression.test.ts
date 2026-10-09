// [IMP-334] Living Contract Tests: LOC De-escalation & Helper Extraction
// Protocol: Station 1 Contract RED Testing
// Universal 5-Facet Behavioral Matrix & Anti-TIDD Boundary

import { describe, it, expect, beforeEach } from 'vitest';
import {
  handlePropertyBadges,
  handleMarketBadges,
} from '../../src/client/events/subscribers/property_market_badge_handler.js';
import {
  buildRegistryAndStateMap,
  calculateMortgageInterest,
} from '../../src/client/events/game_event_financial_helpers.js';
import { createBadgeEventSubscriber } from '../../src/client/events/subscribers/badge_event_subscriber.js';
import {
  SynthesizedGameEventType,
  type PropertyBoughtEvent,
  type PropertyUpgradedEvent,
  type PropertyMortgagedEvent,
  type PropertyUnmortgagedEvent,
  type TradeCompletedEvent,
  type AuctionWonEvent,
  type RentPaidEvent,
  type SynthesizedGameEvent,
} from '../../src/client/events/game_event_types.js';
import {
  useGameStore,
  type GameState,
  type PlayerHudInfo,
  FloatingTextType,
} from '../../src/client/store/game_store.js';
import { useVfxStore } from '../../src/client/store/vfx_store.js';
import { type GameEventContext } from '../../src/client/events/game_event_bus.js';
import { type PacingContext } from '../../src/client/events/pacing_context.js';
import { TurnPhase } from '../../src/domain/room.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { getCellName } from '../../src/client/network/activity_property_tracker.js';

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

const synchronousPacing: PacingContext = {
  getPawnLandingDelay: () => 0,
  getPawnPassGoDelay: () => 0,
  scheduleAction: (action) => {
    action();
    return null;
  },
  clearPendingTimers: () => {},
};

describe('Station 1 Contract Tests: LOC De-escalation & Helper Extraction (IMP-334)', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      playersInfo: {
        p1: createMockPlayer({ id: 'p1', name: 'Player 1' }),
        p2: createMockPlayer({ id: 'p2', name: 'Player 2' }),
      },
    });
    useVfxStore.setState({ activePawnReactions: {} });
  });

  // TC-334.01 [UC-DEESC/MSS]: Property and Market Badge Handlers
  it('TC-334.01a [UC-DEESC/MSS] Given PROPERTY_BOUGHT event, When dispatched via handlePropertyBadges, Then emits Penalty badge with cell name and undefined formula', () => {
    const event: PropertyBoughtEvent = {
      type: SynthesizedGameEventType.PROPERTY_BOUGHT,
      buyerId: 'p1',
      cellIndex: 6,
      price: 1000,
      timestamp: 1000,
    };

    handlePropertyBadges(event, useGameStore.getState(), synchronousPacing);

    const texts = useGameStore.getState().floatingTexts;
    expect(texts[0]?.actionType).toBe('buy');
    expect(texts[0]?.type).toBe(FloatingTextType.Penalty);
    expect(texts[0]?.formula).toBeUndefined();
    expect(texts[0]?.title).toContain(getCellName(6));
  });

  it('TC-334.01b [UC-DEESC/MSS] Given PROPERTY_UPGRADED event, When dispatched via handlePropertyBadges, Then emits Penalty badge with cost and undefined formula', () => {
    const event: PropertyUpgradedEvent = {
      type: SynthesizedGameEventType.PROPERTY_UPGRADED,
      ownerId: 'p1',
      cellIndex: 6,
      targetLevel: 2,
      cost: 500,
      timestamp: 1001,
    };

    handlePropertyBadges(event, useGameStore.getState(), synchronousPacing);

    const texts = useGameStore.getState().floatingTexts;
    expect(texts[0]?.actionType).toBe('upgrade');
    expect(texts[0]?.type).toBe(FloatingTextType.Penalty);
    expect(texts[0]?.formula).toBeUndefined();
    expect(texts[0]?.title).toContain(getCellName(6));
  });

  it('TC-334.01c [UC-DEESC/MSS] Given PROPERTY_MORTGAGED event, When dispatched via handlePropertyBadges, Then emits Reward badge with loan amount', () => {
    const event: PropertyMortgagedEvent = {
      type: SynthesizedGameEventType.PROPERTY_MORTGAGED,
      ownerId: 'p1',
      cellIndex: 6,
      loanAmount: 500,
      timestamp: 1002,
    };

    handlePropertyBadges(event, useGameStore.getState(), synchronousPacing);

    const texts = useGameStore.getState().floatingTexts;
    expect(texts[0]?.actionType).toBe('mortgage');
    expect(texts[0]?.type).toBe(FloatingTextType.Reward);
    expect(texts[0]?.text).toBe('+500');
    expect(texts[0]?.title).toContain('Thế chấp');
  });

  it('TC-334.01d [UC-DEESC/MSS] Given PROPERTY_UNMORTGAGED event, When dispatched via handlePropertyBadges, Then emits Penalty badge with redemption cost', () => {
    const event: PropertyUnmortgagedEvent = {
      type: SynthesizedGameEventType.PROPERTY_UNMORTGAGED,
      ownerId: 'p1',
      cellIndex: 6,
      cost: 550,
      timestamp: 1003,
    };

    handlePropertyBadges(event, useGameStore.getState(), synchronousPacing);

    const texts = useGameStore.getState().floatingTexts;
    expect(texts[0]?.actionType).toBe('unmortgage');
    expect(texts[0]?.type).toBe(FloatingTextType.Penalty);
    expect(texts[0]?.title).toContain('Giải chấp');
    expect(texts[0]?.text).toContain('550');
  });

  it('TC-334.01e [UC-DEESC/MSS] Given TRADE_COMPLETED event, When dispatched via handleMarketBadges, Then emits paired badges for buyer and seller with shared groupId', () => {
    const event: TradeCompletedEvent = {
      type: SynthesizedGameEventType.TRADE_COMPLETED,
      sellerId: 'p1',
      buyerId: 'p2',
      cellIndex: 6,
      price: 400,
      taxAmount: 40,
      timestamp: 1000,
    };
    const context = createMockEventContext();

    handleMarketBadges(event, context, useGameStore.getState(), useVfxStore);

    const texts = useGameStore.getState().floatingTexts;
    const buyerBadge = texts.find((t) => t.playerId === 'p2');
    const sellerBadge = texts.find((t) => t.playerId === 'p1');
    expect(buyerBadge?.actionType).toBe('trade');
    expect(buyerBadge?.title).toContain('Chuyển nhượng');
    expect(buyerBadge?.type).toBe(FloatingTextType.Reward);
    expect(sellerBadge?.groupId).toBe(buyerBadge?.groupId);
  });

  it('TC-334.01f [UC-DEESC/MSS] Given AUCTION_WON event, When dispatched via handleMarketBadges, Then emits auction win badge and triggers pawn victory reaction', () => {
    const event: AuctionWonEvent = {
      type: SynthesizedGameEventType.AUCTION_WON,
      winnerId: 'p1',
      cellIndex: 6,
      winningBid: 1200,
      timestamp: 1000,
    };
    const context = createMockEventContext();

    handleMarketBadges(event, context, useGameStore.getState(), useVfxStore);

    const texts = useGameStore.getState().floatingTexts;
    expect(texts[0]?.actionType).toBe('auction_win');
    expect(texts[0]?.type).toBe(FloatingTextType.Penalty);
    expect(texts[0]?.text).toContain('1.200');
    expect(useVfxStore.getState().activePawnReactions['p1']?.type).toBe('victory_spin');
  });

  // TC-334.02 [UC-DEESC/A1]: Financial Synthesizer Helpers
  it('TC-334.02a [UC-DEESC/A1] Given players with owned properties and board level map, When processed via buildRegistryAndStateMap, Then maps ownership and building levels correctly', () => {
    const playersInfo: Record<string, PlayerHudInfo> = {
      p1: createMockPlayer({ id: 'p1', ownedProperties: [6, 8] }),
      p2: createMockPlayer({ id: 'p2', ownedProperties: [11] }),
    };

    const { registry, stateMap } = buildRegistryAndStateMap(playersInfo, { 6: 2, 8: 1 });

    expect(registry.get(6)).toBe('p1');
    expect(registry.get(11)).toBe('p2');
    expect(stateMap.get(6)?.level).toBe(2);
    expect(stateMap.get(8)?.level).toBe(1);
  });

  it('TC-334.02b [UC-DEESC/A1] Given mortgaged property with recorded loan, When processed via calculateMortgageInterest under default market, Then computes 5% default interest rate', () => {
    const player = createMockPlayer({
      id: 'p1',
      mortgagedProperties: [6],
      mortgageLoans: { 6: 1000 },
    });

    const interest = calculateMortgageInterest(player, []);

    expect(interest).toBe(50);
  });

  it('TC-334.02c [UC-DEESC/A1] Given mortgaged property under MC_CREDIT_STIMULUS modifier, When processed via calculateMortgageInterest, Then suppresses interest to zero', () => {
    const player = createMockPlayer({
      id: 'p1',
      mortgagedProperties: [6],
      mortgageLoans: { 6: 1000 },
    });

    const interest = calculateMortgageInterest(player, [{ type: 'MC_CREDIT_STIMULUS', remainingRounds: 2 }]);

    expect(interest).toBe(0);
  });

  it('TC-334.02d [UC-DEESC/A1] Given mortgaged property under MC_RATE_HIKE modifier, When processed via calculateMortgageInterest, Then calculates 10% interest rate', () => {
    const player = createMockPlayer({
      id: 'p1',
      mortgagedProperties: [6],
      mortgageLoans: { 6: 1000 },
    });

    const interest = calculateMortgageInterest(player, [{ type: 'MC_RATE_HIKE', remainingRounds: 1 }]);

    expect(interest).toBe(100);
  });

  // TC-334.03 [UC-DEESC/A2]: Full Badge Event Subscriber Coordination
  it('TC-334.03a [UC-DEESC/A2] Given multi-event batch with rent, property bought, and auction won, When dispatched to badge subscriber, Then coordinates all badges seamlessly without dropouts', () => {
    const context = createMockEventContext();
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing, useVfxStore);
    const rentEvent: RentPaidEvent = {
      type: SynthesizedGameEventType.RENT_PAID,
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 6,
      amount: 500,
      timestamp: 1000,
    };
    const buyEvent: PropertyBoughtEvent = {
      type: SynthesizedGameEventType.PROPERTY_BOUGHT,
      buyerId: 'p1',
      cellIndex: 8,
      price: 1000,
      timestamp: 1001,
    };
    const auctionEvent: AuctionWonEvent = {
      type: SynthesizedGameEventType.AUCTION_WON,
      winnerId: 'p2',
      cellIndex: 9,
      winningBid: 1200,
      timestamp: 1002,
    };
    const events: readonly SynthesizedGameEvent[] = [rentEvent, buyEvent, auctionEvent];

    subscriber(events, context);

    const texts = useGameStore.getState().floatingTexts;
    expect(texts.some((t) => t.actionType === 'rent_pay')).toBe(true);
    expect(texts.some((t) => t.actionType === 'buy')).toBe(true);
    expect(texts.some((t) => t.actionType === 'auction_win')).toBe(true);
    expect(texts.length).toBeGreaterThanOrEqual(4);
  });

  it('TC-334.03b [UC-DEESC/A2] Given empty event batch, When dispatched to badge subscriber, Then leaves floating texts unmodified', () => {
    const context = createMockEventContext();
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing, useVfxStore);

    subscriber([], context);

    const texts = useGameStore.getState().floatingTexts;
    expect(texts.length).toBe(0);
  });

  // TC-334.04 [UC-REGRESS/A3]: Regression Parity & Invariant Fallbacks
  it('TC-334.04a [UC-REGRESS/A3] Given unrecorded mortgage loans, When calculating mortgage interest, Then falls back to 50% deed price loan rate', () => {
    const player = createMockPlayer({
      id: 'p1',
      mortgagedProperties: [6], // Cell 6 price = 1000, 50% loan = 500, 5% interest = 25
      mortgageLoans: {},
    });

    const interest = calculateMortgageInterest(player, []);

    expect(interest).toBe(25);
  });

  it('TC-334.04b [UC-REGRESS/A3] Given empty player info, When building registry and state map, Then safely returns empty maps without throwing', () => {
    const { registry, stateMap } = buildRegistryAndStateMap({});

    expect(registry.size).toBe(0);
    expect(stateMap.size).toBe(0);
  });
});
