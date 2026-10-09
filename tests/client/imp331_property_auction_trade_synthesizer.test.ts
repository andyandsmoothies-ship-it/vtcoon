// [IMP-331] Living Contract Tests: Property, Auction & Trade Event Synthesizer
// Protocol: Station 1 Contract RED Testing
// Universal 5-Facet Behavioral Matrix & Dynamic Triad Coverage

import { describe, it, expect } from 'vitest';
import { synthesizePropertyAndMarketEvents } from '../../src/client/events/game_event_property_synthesizer.js';
import { synthesizeGameEvents } from '../../src/client/events/game_event_synthesizer.js';
import {
  SynthesizedGameEventType,
} from '../../src/client/events/game_event_types.js';
import { useGameStore, type GameState, type PlayerHudInfo } from '../../src/client/store/game_store.js';
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

describe('Station 1 Contract Tests: Property, Auction & Trade Synthesizer (IMP-331)', () => {
  it('TC-331.01 [UC-PROP/MSS] Direct unowned property purchase -> PROPERTY_BOUGHT (cellIndex, buyerId, price)', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 1, p2: 5 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [] },
        p2: { id: 'p2', name: 'Player 2', balance: 5000, ownedProperties: [] },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 1, p2: 5 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 4400, ownedProperties: [1] },
        p2: { id: 'p2', name: 'Player 2', balance: 5000, ownedProperties: [] },
      },
    });
    const delta: DeltaPayload = {
      tick: 10,
      cells: [{ index: 1, ownerId: 'p1', level: 0 }],
      players: [{ id: 'p1', position: 1, balance: 4400 }],
    };

    const events = synthesizePropertyAndMarketEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.PROPERTY_BOUGHT);
    expect(events[0]).toMatchObject({
      cellIndex: 1,
      buyerId: 'p1',
      price: 600,
    });
  });

  it('TC-331.02 [UC-PROP/A1] Property upgrade from level 0 to 1/2/3 -> PROPERTY_UPGRADED (targetLevel, cost)', () => {
    const prevLevelMap: Record<number, 0 | 1 | 2 | 3> = { 1: 0 };
    const nextLevelMap: Record<number, 0 | 1 | 2 | 3> = { 1: 1 };
    const prev = createMockGameState({
      levelMap: prevLevelMap,
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [1] },
      },
    });
    const next = createMockGameState({
      levelMap: nextLevelMap,
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 4700, ownedProperties: [1] },
      },
    });
    const delta: DeltaPayload = {
      tick: 11,
      cells: [{ index: 1, ownerId: 'p1', level: 1 }],
      players: [{ id: 'p1', position: 1, balance: 4700 }],
    };

    const events = synthesizePropertyAndMarketEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.PROPERTY_UPGRADED);
    expect(events[0]).toMatchObject({
      cellIndex: 1,
      ownerId: 'p1',
      targetLevel: 1,
      cost: 300,
    });
  });

  it('TC-331.03 [UC-PROP/A2] Property mortgage -> PROPERTY_MORTGAGED (loanAmount = price / 2)', () => {
    const prev = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [1], mortgagedProperties: [] },
      },
    });
    const next = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5300, ownedProperties: [1], mortgagedProperties: [1] },
      },
    });
    const delta: DeltaPayload = {
      tick: 12,
      cells: [{ index: 1, ownerId: 'p1', isMortgaged: true }],
      players: [{ id: 'p1', position: 1, balance: 5300 }],
    };

    const events = synthesizePropertyAndMarketEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.PROPERTY_MORTGAGED);
    expect(events[0]).toMatchObject({
      cellIndex: 1,
      ownerId: 'p1',
      loanAmount: 300,
    });
  });

  it('TC-331.04 [UC-PROP/A3] Property redemption -> PROPERTY_UNMORTGAGED (cost = price * 0.55)', () => {
    const prev = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [1], mortgagedProperties: [1] },
      },
    });
    const next = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 4670, ownedProperties: [1], mortgagedProperties: [] },
      },
    });
    const delta: DeltaPayload = {
      tick: 13,
      cells: [{ index: 1, ownerId: 'p1', isMortgaged: false }],
      players: [{ id: 'p1', position: 1, balance: 4670 }],
    };

    const events = synthesizePropertyAndMarketEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.PROPERTY_UNMORTGAGED);
    expect(events[0]).toMatchObject({
      cellIndex: 1,
      ownerId: 'p1',
      cost: 330,
    });
  });

  it('TC-331.05 [UC-PROP/A4] Ownership transfer during auction/foreclosure suppresses ghost unmortgage', () => {
    const prev = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [1], mortgagedProperties: [1] },
        p2: { id: 'p2', name: 'Player 2', balance: 5000, ownedProperties: [] },
      },
    });
    const next = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [], mortgagedProperties: [] },
        p2: { id: 'p2', name: 'Player 2', balance: 4400, ownedProperties: [1], mortgagedProperties: [] },
      },
    });
    const delta: DeltaPayload = {
      tick: 14,
      cells: [{ index: 1, ownerId: 'p2', isMortgaged: false }],
      players: [
        { id: 'p1', position: 0, balance: 5000 },
        { id: 'p2', position: 1, balance: 4400 },
      ],
    };

    const events = synthesizePropertyAndMarketEvents(prev, next, delta);

    expect(events.filter((e) => e.type === SynthesizedGameEventType.PROPERTY_UNMORTGAGED)).toHaveLength(0);
    expect(events.filter((e) => e.type === SynthesizedGameEventType.PROPERTY_BOUGHT)).toHaveLength(1);
    expect(events[0]).toMatchObject({
      cellIndex: 1,
      buyerId: 'p2',
    });
  });

  it('TC-331.06 [UC-TRADE/MSS] P2P cash transfer trade -> TRADE_COMPLETED (sellerId, buyerId, cellIndex, price, taxAmount)', () => {
    const prev = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [1] },
        p2: { id: 'p2', name: 'Player 2', balance: 5000, ownedProperties: [] },
      },
    });
    const next = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5950, ownedProperties: [] },
        p2: { id: 'p2', name: 'Player 2', balance: 4000, ownedProperties: [1] },
      },
    });
    const delta: DeltaPayload = {
      tick: 15,
      cells: [{ index: 1, ownerId: 'p2', level: 0 }],
      lastTradeResult: {
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 1,
        price: 1000,
        taxAmount: 50,
        timestamp: 15000,
      },
    };

    const events = synthesizePropertyAndMarketEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.TRADE_COMPLETED);
    expect(events[0]).toMatchObject({
      sellerId: 'p1',
      buyerId: 'p2',
      cellIndex: 1,
      price: 1000,
      taxAmount: 50,
    });
  });

  it('TC-331.07 [UC-TRADE/A1] P2P property swap -> single cohesive TRADE_COMPLETED (cellIndex, offeredCellIndex)', () => {
    const prev = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [1] },
        p2: { id: 'p2', name: 'Player 2', balance: 5000, ownedProperties: [3] },
      },
    });
    const next = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5190, ownedProperties: [3] },
        p2: { id: 'p2', name: 'Player 2', balance: 4800, ownedProperties: [1] },
      },
    });
    const delta: DeltaPayload = {
      tick: 16,
      cells: [
        { index: 1, ownerId: 'p2', level: 0 },
        { index: 3, ownerId: 'p1', level: 0 },
      ],
      lastTradeResult: {
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 1,
        offeredCellIndex: 3,
        price: 200,
        taxAmount: 10,
        timestamp: 16000,
      },
    };

    const events = synthesizePropertyAndMarketEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.TRADE_COMPLETED);
    expect(events[0]).toMatchObject({
      sellerId: 'p1',
      buyerId: 'p2',
      cellIndex: 1,
      offeredCellIndex: 3,
      price: 200,
      taxAmount: 10,
    });
  });

  it('TC-331.08 [UC-AUCT/MSS] Concluded auction hammer fell in delta -> AUCTION_WON (winnerId, winningBid)', () => {
    const prev = createMockGameState({
      auction: {
        cellIndex: 6,
        currentBid: 1500,
        highestBidderId: 'p1',
        timeRemaining: 1,
      },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [] },
      },
    });
    const next = createMockGameState({
      auction: null,
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 3500, ownedProperties: [6] },
      },
    });
    const delta: DeltaPayload = {
      tick: 17,
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
    };

    const events = synthesizePropertyAndMarketEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.AUCTION_WON);
    expect(events[0]).toMatchObject({
      cellIndex: 6,
      winnerId: 'p1',
      winningBid: 1500,
    });
  });

  it('TC-331.09 [UC-AUCT/A1] Active auction higher bid -> AUCTION_BID_PLACED (bidderId, currentBid)', () => {
    const prev = createMockGameState({
      auction: {
        cellIndex: 6,
        currentBid: 500,
        highestBidderId: 'p1',
        timeRemaining: 20,
      },
    });
    const next = createMockGameState({
      auction: {
        cellIndex: 6,
        currentBid: 800,
        highestBidderId: 'p2',
        timeRemaining: 15,
      },
    });
    const delta: DeltaPayload = {
      tick: 18,
      cells: [],
      auction: {
        cellIndex: 6,
        currentBid: 800,
        highestBidderId: 'p2',
        timeRemaining: 15,
      },
    };

    const events = synthesizePropertyAndMarketEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.AUCTION_BID_PLACED);
    expect(events[0]).toMatchObject({
      cellIndex: 6,
      bidderId: 'p2',
      bidAmount: 800,
    });
  });

  it('TC-331.10 [UC-AUCT/A2] Unchanged auction state in delta deduplicates without emitting redundant bid events', () => {
    const prev = createMockGameState({
      auction: {
        cellIndex: 6,
        currentBid: 500,
        highestBidderId: 'p1',
        timeRemaining: 20,
      },
    });
    const mid = createMockGameState({
      auction: {
        cellIndex: 6,
        currentBid: 800,
        highestBidderId: 'p2',
        timeRemaining: 15,
      },
    });
    const next = createMockGameState({
      auction: {
        cellIndex: 6,
        currentBid: 800,
        highestBidderId: 'p2',
        timeRemaining: 14,
      },
    });
    const delta1: DeltaPayload = {
      tick: 19,
      cells: [],
      auction: {
        cellIndex: 6,
        currentBid: 800,
        highestBidderId: 'p2',
        timeRemaining: 15,
      },
    };
    const delta2: DeltaPayload = {
      tick: 20,
      cells: [],
      auction: {
        cellIndex: 6,
        currentBid: 800,
        highestBidderId: 'p2',
        timeRemaining: 14,
      },
    };

    const eventsTick1 = synthesizePropertyAndMarketEvents(prev, mid, delta1);
    const eventsTick2 = synthesizePropertyAndMarketEvents(mid, next, delta2);

    expect(eventsTick1).toHaveLength(1);
    expect(eventsTick2).toHaveLength(0);
  });

  it('TC-331.11 [UC-TRIAD/A3] Triad Net Positive: Trade cash inflow (+4750) while paying rent (-500) emits both TRADE_COMPLETED and RENT_PAID', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 0, p2: 0, p3: 0 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [8] },
        p2: { id: 'p2', name: 'Player 2', balance: 5000, ownedProperties: [5] },
        p3: { id: 'p3', name: 'Player 3', balance: 5000, ownedProperties: [] },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 5, p2: 0, p3: 0 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 9250, ownedProperties: [] },
        p2: { id: 'p2', name: 'Player 2', balance: 5500, ownedProperties: [5] },
        p3: { id: 'p3', name: 'Player 3', balance: 0, ownedProperties: [8] },
      },
    });
    const delta: DeltaPayload = {
      tick: 21,
      cells: [{ index: 8, ownerId: 'p3', level: 0 }],
      players: [
        { id: 'p1', position: 5, balance: 9250 },
        { id: 'p2', position: 0, balance: 5500 },
        { id: 'p3', position: 0, balance: 0 },
      ],
      lastTradeResult: {
        sellerId: 'p1',
        buyerId: 'p3',
        cellIndex: 8,
        price: 5000,
        taxAmount: 250,
        timestamp: 21000,
      },
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events.some((e) => e.type === SynthesizedGameEventType.TRADE_COMPLETED)).toBe(true);
    expect(events.some((e) => e.type === SynthesizedGameEventType.RENT_PAID)).toBe(true);
    expect(events.find((e) => e.type === SynthesizedGameEventType.RENT_PAID)).toMatchObject({
      payerId: 'p1',
      receiverId: 'p2',
      amount: 500,
    });
  });

  it('TC-331.12 [UC-TRIAD/A4] Triad Net Negative: Auction win (-3000) while receiving GO salary (+2000) emits both GO_SALARY and AUCTION_WON', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [] },
      },
      auction: {
        cellIndex: 6,
        currentBid: 3000,
        highestBidderId: 'p1',
        timeRemaining: 1,
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 2 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 4000, ownedProperties: [6] },
      },
      auction: null,
    });
    const delta: DeltaPayload = {
      tick: 22,
      cells: [{ index: 6, ownerId: 'p1', level: 0 }],
      players: [{ id: 'p1', position: 2, balance: 4000 }],
      auction: {
        cellIndex: 6,
        currentBid: 3000,
        highestBidderId: 'p1',
        timeRemaining: 0,
        isConcluded: true,
        winnerId: 'p1',
        finalPrice: 3000,
      },
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events.some((e) => e.type === SynthesizedGameEventType.GO_SALARY)).toBe(true);
    expect(events.some((e) => e.type === SynthesizedGameEventType.AUCTION_WON)).toBe(true);
    expect(events.find((e) => e.type === SynthesizedGameEventType.AUCTION_WON)).toMatchObject({
      cellIndex: 6,
      winnerId: 'p1',
      winningBid: 3000,
    });
  });

  it('TC-331.13 [UC-TRIAD/A5] Triad Zero Net Shift: Property buy (-2000) while receiving GO salary (+2000) emits both GO_SALARY and PROPERTY_BOUGHT', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [] },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 5 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [5] },
      },
    });
    const delta: DeltaPayload = {
      tick: 23,
      cells: [{ index: 5, ownerId: 'p1', level: 0 }],
      players: [{ id: 'p1', position: 5, balance: 5000 }],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events.some((e) => e.type === SynthesizedGameEventType.GO_SALARY)).toBe(true);
    expect(events.some((e) => e.type === SynthesizedGameEventType.PROPERTY_BOUGHT)).toBe(true);
    expect(events.find((e) => e.type === SynthesizedGameEventType.PROPERTY_BOUGHT)).toMatchObject({
      cellIndex: 5,
      buyerId: 'p1',
      price: 2000,
    });
  });

  it('TC-331.14 [UC-COMP/A6] Complex tick with salary and property purchase guarantees financial events precede property events', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [] },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 5 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, ownedProperties: [5] },
      },
    });
    const delta: DeltaPayload = {
      tick: 24,
      cells: [{ index: 5, ownerId: 'p1', level: 0 }],
      players: [{ id: 'p1', position: 5, balance: 5000 }],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    const salaryIndex = events.findIndex((e) => e.type === SynthesizedGameEventType.GO_SALARY);
    const propertyIndex = events.findIndex((e) => e.type === SynthesizedGameEventType.PROPERTY_BOUGHT);

    expect(salaryIndex).toBeGreaterThanOrEqual(0);
    expect(propertyIndex).toBeGreaterThanOrEqual(0);
    expect(salaryIndex).toBeLessThan(propertyIndex);
  });
});
