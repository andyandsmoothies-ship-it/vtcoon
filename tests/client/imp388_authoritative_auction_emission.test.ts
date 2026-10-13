// [IMP-388] Living Contract Tests: Server Authoritative Auction Settlement & Bid Emission Pipeline
// Station 1: Contract RED Specification & Call-Site Wiring Verification
// Covers Server Authoritative Emission (handleAuctionBid & handleAuctionClose),
// Client Direct Dispatch (extractAuctionEvents), Capital Deduction Defense (restoreDeltaOutflow),
// Composite Netting Collision Defense, Presentation Wiring, and Multi-Tick Stale Result Immunity.

import { describe, it, expect, beforeEach } from 'vitest';
import { handleAuctionBid, handleAuctionClose } from '../../src/server/auction_manager.js';
import {
  type Room,
  type Player,
  TurnPhase,
  type ServerDomainEvent,
  type AuctionWonServerEvent,
  type AuctionBidServerEvent,
} from '../../src/domain/room.js';
import type { AuctionSession } from '../../src/server/auction_manager.js';
import type { PropertyRegistry } from '../../src/domain/property_data.js';
import {
  SynthesizedGameEventType,
  type AuctionWonEvent,
  type AuctionBidPlacedEvent,
  type SynthesizedGameEvent,
} from '../../src/client/events/game_event_types.js';
import { synthesizePropertyAndMarketEvents } from '../../src/client/events/game_event_property_synthesizer.js';
import {
  type InternalBalanceDelta,
  adjustNetDeltaForPropertyTransactions,
} from '../../src/client/events/game_event_financial_helpers.js';
import { synthesizeFinancialEvents } from '../../src/client/events/game_event_financial_synthesizer.js';
import { createBadgeEventSubscriber } from '../../src/client/events/subscribers/badge_event_subscriber.js';
import { createActivityLogSubscriber } from '../../src/client/events/subscribers/activity_log_subscriber.js';
import { useGameStore, type GameState, type PlayerHudInfo, type FloatingTextItem } from '../../src/client/store/game_store.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

function createMockRoom(): Room {
  const p1: Player = {
    id: 'p1',
    name: 'Player 1',
    balance: 10_000,
    position: 0,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    auditCount: 0,
    consecutiveDoubles: 0,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
    bankrupt: false,
    mortgageLoans: {},
    isBot: false,
    overdraftRoundsLeft: 0,
    lastTradeOfferRound: 0,
    hasSpunTransitThisTurn: false,
  };

  const p2: Player = {
    id: 'p2',
    name: 'Player 2',
    balance: 8_000,
    position: 0,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    auditCount: 0,
    consecutiveDoubles: 0,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
    bankrupt: false,
    mortgageLoans: {},
    isBot: false,
    overdraftRoundsLeft: 0,
    lastTradeOfferRound: 0,
    hasSpunTransitThisTurn: false,
  };

  const p3: Player = {
    id: 'p3',
    name: 'Player 3',
    balance: 8_000,
    position: 0,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    auditCount: 0,
    consecutiveDoubles: 0,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
    bankrupt: false,
    mortgageLoans: {},
    isBot: false,
    overdraftRoundsLeft: 0,
    lastTradeOfferRound: 0,
    hasSpunTransitThisTurn: false,
  };

  return {
    roomCode: 'AUCT_TEST',
    hostId: 'p1',
    players: [p1, p2, p3],
    currentPlayerIndex: 0,
    phase: TurnPhase.AuctionPhase,
    started: true,
    activeModifiers: [],
    marketDeck: [],
    marketDiscard: [],
    chanceDeck: [],
    chanceDiscard: [],
    permanentRentBonus: {},
    treasury: 10_000,
    roundCount: 1,
    pendingDomainEvents: [],
  };
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
  playersInfo: Record<string, Partial<PlayerHudInfo>>,
  auction?: GameState['auction'],
  playerPositions?: Record<string, number>,
): GameState {
  const defaultPlayers: Record<string, PlayerHudInfo> = {};
  for (const [id, p] of Object.entries(playersInfo)) {
    defaultPlayers[id] = createMockPlayer({ id, ...p });
  }

  return {
    ...useGameStore.getState(),
    playersInfo: defaultPlayers,
    auction: auction ?? null,
    ...(playerPositions ? { playerPositions } : {}),
  };
}

function createMockDelta(overrides?: Partial<DeltaPayload>): DeltaPayload {
  return {
    tick: 100,
    cells: [],
    ...overrides,
  };
}

describe('IMP-388: Server Authoritative Auction Settlement & Bid Emission Pipeline', () => {
  beforeEach(() => {
    useActivityStore.setState({ activityLogs: [] });
    useGameStore.setState({ floatingTexts: [] });
  });

  it('TC-388.01 [UC-AUCTION-BID-SERVER-EMISSION/MSS] handleAuctionBid pushes AUCTION_BID_PLACED to room.pendingDomainEvents', () => {
    const room = createMockRoom();
    const session: AuctionSession = {
      cellIndex: 6,
      declinedPlayerId: 'p1',
      currentBid: 500,
      highestBid: 500,
      highestBidder: 'p1',
      isFireSale: false,
    };

    const res = handleAuctionBid(room, session, 'p2', 600);

    expect(res.success).toBe(true);
    expect(room.pendingDomainEvents).toHaveLength(1);
    expect(room.pendingDomainEvents?.[0]).toMatchObject({
      type: 'AUCTION_BID_PLACED',
      playerId: 'p2',
      cellIndex: 6,
      bidAmount: 600,
    });
  });

  it('TC-388.02 [UC-AUCTION-CLOSE-WINNER-SERVER-EMISSION/MSS] handleAuctionClose pushes AUCTION_WON to room.pendingDomainEvents', () => {
    const room = createMockRoom();
    const registry: PropertyRegistry = new Map();
    const session: AuctionSession = {
      cellIndex: 6,
      declinedPlayerId: 'p1',
      currentBid: 1500,
      highestBid: 1500,
      highestBidder: 'p2',
      isFireSale: true,
    };

    const result = handleAuctionClose(room, session, registry);

    expect(result.winnerId).toBe('p2');
    expect(room.pendingDomainEvents).toHaveLength(1);
    expect(room.pendingDomainEvents?.[0]).toMatchObject({
      type: 'AUCTION_WON',
      playerId: 'p2',
      cellIndex: 6,
      winningBid: 1500,
      isForeclosure: true,
    });
  });

  it('TC-388.03 [UC-AUCTION-CLOSE-NO-BID-ZERO-EMISSION/MSS] handleAuctionClose with no bids emits 0 AUCTION_WON', () => {
    const room = createMockRoom();
    const registry: PropertyRegistry = new Map();
    const session: AuctionSession = {
      cellIndex: 6,
      declinedPlayerId: 'p1',
      currentBid: 0,
      highestBid: 0,
      highestBidder: undefined,
      isFireSale: false,
    };

    const result = handleAuctionClose(room, session, registry);

    expect(result.winnerId).toBeUndefined();
    const wonEvents = (room.pendingDomainEvents ?? []).filter((e) => e.type === 'AUCTION_WON');
    expect(wonEvents).toHaveLength(0);
  });

  it('TC-388.04 [UC-CLIENT-DIRECT-AUCTION-BID-DISPATCH/MSS] extractAuctionEvents directly synthesizes AuctionBidPlacedEvent', () => {
    const prev = createMockGameState({ p1: { balance: 5000 }, p2: { balance: 5000 } });
    const next = createMockGameState({ p1: { balance: 5000 }, p2: { balance: 5000 } });
    const delta = createMockDelta({
      domainEvents: [
        {
          type: 'AUCTION_BID_PLACED',
          playerId: 'p2',
          cellIndex: 6,
          bidAmount: 800,
          timestamp: 12000,
        },
      ],
    });

    const events = synthesizePropertyAndMarketEvents(prev, next, delta, { baseTimestamp: 12000 });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: SynthesizedGameEventType.AUCTION_BID_PLACED,
      bidderId: 'p2',
      cellIndex: 6,
      bidAmount: 800,
      timestamp: 12000,
    });
  });

  it('TC-388.05 [UC-CLIENT-DIRECT-AUCTION-WON-DISPATCH/MSS] extractAuctionEvents synthesizes AuctionWonEvent and marks handled cell', () => {
    const prev = createMockGameState({
      p1: { balance: 5000, ownedProperties: [] },
    });
    const next = createMockGameState({
      p1: { balance: 3500, ownedProperties: [6] },
    });
    const delta = createMockDelta({
      cells: [{ index: 6, ownerId: 'p1', level: 0 }],
      domainEvents: [
        {
          type: 'AUCTION_WON',
          playerId: 'p1',
          cellIndex: 6,
          winningBid: 1500,
          isForeclosure: false,
          timestamp: 15000,
        },
      ],
    });

    const events = synthesizePropertyAndMarketEvents(prev, next, delta, { baseTimestamp: 15000 });

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.AUCTION_WON);
    expect(events[0]).toMatchObject({
      winnerId: 'p1',
      cellIndex: 6,
      winningBid: 1500,
      timestamp: 15000,
    });
  });

  it('TC-388.06 [UC-AUCTION-WIN-CAPITAL-DEDUCTION-DEFENSE/MSS] adjustNetDeltaForPropertyTransactions absorbs winningBid via restoreDeltaOutflow', () => {
    const prev = createMockGameState({ p1: { balance: 5000 } });
    const next = createMockGameState({ p1: { balance: 3500 } });
    const delta = createMockDelta({
      domainEvents: [
        {
          type: 'AUCTION_WON',
          playerId: 'p1',
          cellIndex: 6,
          winningBid: 1500,
          timestamp: 16000,
        },
      ],
    });

    const payers: InternalBalanceDelta[] = [
      { id: 'p1', diff: -1500, hasPassedGo: false, isSentToAudit: false },
    ];
    const receivers: InternalBalanceDelta[] = [];

    adjustNetDeltaForPropertyTransactions(delta, prev, next, payers, receivers);

    expect(payers).toHaveLength(0);
  });

  it('TC-388.07 [UC-AUCTION-WIN-NATIVE-PRESENTATION-WIRE/MSS] activity log and badge subscribers dispatch Vietnamese narrative and floating badge', () => {
    const prev = createMockGameState({ p1: { balance: 5000 } });
    const next = createMockGameState({ p1: { balance: 3500, ownedProperties: [6] } });
    const delta = createMockDelta({
      cells: [{ index: 6, ownerId: 'p1', level: 0 }],
      domainEvents: [
        {
          type: 'AUCTION_WON',
          playerId: 'p1',
          cellIndex: 6,
          winningBid: 1500,
          timestamp: 17000,
        },
      ],
    });

    const events = synthesizePropertyAndMarketEvents(prev, next, delta, { baseTimestamp: 17000 });
    const badgeSub = createBadgeEventSubscriber(useGameStore);
    const logSub = createActivityLogSubscriber(useActivityStore);

    badgeSub(events, { delta, prevState: prev, nextState: next });
    logSub(events, { delta, prevState: prev, nextState: next });

    const logs = useActivityStore.getState().activityLogs;
    const floating = useGameStore.getState().floatingTexts;

    expect(logs.some((l) => l.message.includes('Búa gõ thành công!') && l.message.includes('1.500'))).toBe(true);
    expect(floating.some((f: FloatingTextItem) => f.actionType === 'auction_win' && f.title?.includes('Thắng đấu giá'))).toBe(true);
  });

  it('TC-388.08 [UC-AUCTION-FALLBACK-LEGACY-DELTA-COMPATIBILITY/MSS] legacy DeltaPayload without domainEvents seamlessly synthesizes AUCTION_WON', () => {
    const prev = createMockGameState(
      { p1: { balance: 5000, ownedProperties: [] } },
      { cellIndex: 6, highestBidderId: 'p1', currentBid: 1200, isConcluded: false },
    );
    const next = createMockGameState(
      { p1: { balance: 3800, ownedProperties: [6] } },
      null,
    );
    const delta = createMockDelta({
      cells: [{ index: 6, ownerId: 'p1', level: 0 }],
      auction: {
        cellIndex: 6,
        currentBid: 1200,
        highestBidderId: 'p1',
        timeRemaining: 0,
        isConcluded: true,
        winnerId: 'p1',
        finalPrice: 1200,
      },
    });

    const events = synthesizePropertyAndMarketEvents(prev, next, delta, { baseTimestamp: 18000 });

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.AUCTION_WON);
    expect(events[0]).toMatchObject({
      cellIndex: 6,
      winnerId: 'p1',
      winningBid: 1200,
    });
  });

  it('TC-388.09 [UC-AUCTION-COMPOSITE-BIDIRECTIONAL-NETTING/MSS] player winning auction and crossing GO collects salary without phantom tax', () => {
    const prev = createMockGameState(
      { p1: { id: 'p1', balance: 5000, ownedProperties: [] } },
      null,
      { p1: 38 },
    );
    const next = createMockGameState(
      { p1: { id: 'p1', balance: 5500, ownedProperties: [6] } },
      null,
      { p1: 2 },
    );
    // P1 moved from pos 38 to 2 (passed GO -> salary +2000), won auction -1500 => net balance delta +500
    const delta = createMockDelta({
      cells: [{ index: 6, ownerId: 'p1', level: 0 }],
      players: [{ id: 'p1', position: 2, balance: 5500 }],
      domainEvents: [
        {
          type: 'AUCTION_WON',
          playerId: 'p1',
          cellIndex: 6,
          winningBid: 1500,
          timestamp: 19000,
        },
      ],
    });

    const finEvents = synthesizeFinancialEvents(prev, next, delta, { baseTimestamp: 19000 });
    const propEvents = synthesizePropertyAndMarketEvents(prev, next, delta, { baseTimestamp: 19000 });

    const taxEvents = finEvents.filter((e) => e.type === SynthesizedGameEventType.FEE_PAID);
    const salaryEvents = finEvents.filter((e) => e.type === SynthesizedGameEventType.GO_SALARY);
    const auctionEvents = propEvents.filter((e) => e.type === SynthesizedGameEventType.AUCTION_WON);

    expect(taxEvents).toHaveLength(0);
    expect(salaryEvents).toHaveLength(1);
    expect(auctionEvents).toHaveLength(1);
  });

  it('TC-388.10 [UC-AUCTION-MULTI-TICK-STALE-RESULT-IMMUNITY/MSS] lingering delta.auction on Tick 2 produces 0 duplicate AUCTION_WON', () => {
    // Tick 1: Auction concludes with domainEvents and delta.auction
    const prev1 = createMockGameState(
      { p1: { balance: 5000, ownedProperties: [] } },
      { cellIndex: 6, highestBidderId: 'p1', currentBid: 1500, isConcluded: false },
    );
    const midState = createMockGameState(
      { p1: { balance: 3500, ownedProperties: [6] } },
      { cellIndex: 6, highestBidderId: 'p1', currentBid: 1500, isConcluded: true },
    );
    const delta1 = createMockDelta({
      cells: [{ index: 6, ownerId: 'p1', level: 0 }],
      auction: {
        cellIndex: 6,
        currentBid: 1500,
        highestBidderId: 'p1',
        timeRemaining: 0,
        isConcluded: true,
        winnerId: 'p1',
        finalPrice: 1500,
      },
      domainEvents: [
        {
          type: 'AUCTION_WON',
          playerId: 'p1',
          cellIndex: 6,
          winningBid: 1500,
          timestamp: 20000,
        },
      ],
    });

    const eventsTick1 = synthesizePropertyAndMarketEvents(prev1, midState, delta1, { baseTimestamp: 20000 });
    expect(eventsTick1).toHaveLength(1);

    // Tick 2: server cleared pendingDomainEvents (domainEvents: undefined), but delta.auction still lingers as isConcluded
    const nextState2 = createMockGameState(
      { p1: { balance: 3500, ownedProperties: [6] } },
      { cellIndex: 6, highestBidderId: 'p1', currentBid: 1500, isConcluded: true },
    );
    const delta2 = createMockDelta({
      auction: {
        cellIndex: 6,
        currentBid: 1500,
        highestBidderId: 'p1',
        timeRemaining: 0,
        isConcluded: true,
        winnerId: 'p1',
        finalPrice: 1500,
      },
      domainEvents: undefined,
    });

    const eventsTick2 = synthesizePropertyAndMarketEvents(midState, nextState2, delta2, { baseTimestamp: 21000 });
    expect(eventsTick2).toHaveLength(0);
  });
});
