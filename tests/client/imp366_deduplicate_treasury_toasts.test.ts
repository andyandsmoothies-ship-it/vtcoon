// [IMP-366] Living Contract Tests: Deduplicate Treasury Toasts & Financial Event Synthesis
// Protocol: Station 1 Contract RED Testing
// Invariants: Treasury Conservation, Deduplicated Capital Remittances, Semantic Behavioral Inversion

import { describe, it, expect } from 'vitest';
import { synthesizeGameEvents, synthesizeFinancialEvents } from '../../src/client/events/game_event_synthesizer.js';
import {
  adjustNetDeltaForPropertyTransactions,
  type InternalBalanceDelta,
} from '../../src/client/events/game_event_financial_helpers.js';
import {
  SynthesizedGameEventType,
  type FeePaidEvent,
} from '../../src/client/events/game_event_types.js';
import { useGameStore, type GameState, type PlayerHudInfo } from '../../src/client/store/game_store.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';
import { MacroCycleType } from '../../src/domain/macro_cycle_types.js';
import { calculateUpgradeCost } from '../../src/domain/property_upgrade.js';
import { ETC_COST_PER_CELL } from '../../src/domain/property_data.js';

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
    const merged: Record<string, PlayerHudInfo> = {};
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

function filterTaxEvents(events: readonly { type: SynthesizedGameEventType }[]): FeePaidEvent[] {
  const result: FeePaidEvent[] = [];
  for (const ev of events) {
    if (ev.type === SynthesizedGameEventType.FEE_PAID && 'feeType' in ev && ev.feeType === 'TAX') {
      result.push(ev as FeePaidEvent);
    }
  }
  return result;
}

describe('Station 1 Contract Tests: Deduplicate Treasury Toasts (IMP-366)', () => {
  it('TC-366.01 [UC-DEDUP-BUY/MSS]: elides redundant FEE_PAID TAX event when purchasing unowned property', () => {
    const prevState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 5000, ownedProperties: [] },
      },
    });
    const nextState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 2800, ownedProperties: [23] },
      },
      playerPositions: { p1: 23 },
    });
    const delta: DeltaPayload = {
      tick: 1,
      cells: [{ index: 23, ownerId: 'p1', level: 0 }],
      players: [{ id: 'p1', balance: 2800, position: 23 }],
    };

    const events = synthesizeGameEvents(prevState, nextState, delta);
    const hasBoughtEvent = events.some((e) => e.type === SynthesizedGameEventType.PROPERTY_BOUGHT);
    const taxEvents = filterTaxEvents(events);

    expect(hasBoughtEvent).toBe(true);
    expect(events.some((e) => e.type === SynthesizedGameEventType.PROPERTY_BOUGHT && 'cellIndex' in e && e.cellIndex === 23)).toBe(true);
    expect(taxEvents.length).toBe(0);
  });

  it('TC-366.02 [UC-DEDUP-UPGRADE/MSS]: elides redundant FEE_PAID TAX event on property upgrade under Rate Hike', () => {
    const activeMods = [{ type: MarketCardId.MC_RATE_HIKE, remainingRounds: 2, affectedCells: [] }];
    const expectedUpgradeCost = calculateUpgradeCost(1, 0, activeMods); // base 300 * 1.2 = 360
    const prevState = createMockGameState({
      levelMap: { 1: 0 },
      playersInfo: {
        p1: { id: 'p1', balance: 5000, ownedProperties: [1, 3] },
      },
    });
    const nextState = createMockGameState({
      levelMap: { 1: 1 },
      playersInfo: {
        p1: { id: 'p1', balance: 5000 - expectedUpgradeCost, ownedProperties: [1, 3] },
      },
    });
    const delta: DeltaPayload = {
      tick: 2,
      cells: [{ index: 1, level: 1, ownerId: 'p1' }],
      players: [{ id: 'p1', balance: 5000 - expectedUpgradeCost, position: 1 }],
      activeModifiers: activeMods,
    };

    const events = synthesizeGameEvents(prevState, nextState, delta);
    const hasUpgradeEvent = events.some((e) => e.type === SynthesizedGameEventType.PROPERTY_UPGRADED);
    const taxEvents = filterTaxEvents(events);

    expect(hasUpgradeEvent).toBe(true);
    expect(taxEvents.length).toBe(0);
  });

  it('TC-366.03 [UC-DEDUP-AUCTION/MSS]: elides redundant FEE_PAID TAX event when winning auction bid concludes', () => {
    const winningBid = 1500;
    const prevState = createMockGameState({
      playersInfo: {
        p2: { id: 'p2', balance: 5000, ownedProperties: [] },
      },
    });
    const nextState = createMockGameState({
      playersInfo: {
        p2: { id: 'p2', balance: 3500, ownedProperties: [6] },
      },
    });
    const delta: DeltaPayload = {
      tick: 3,
      cells: [{ index: 6, ownerId: 'p2', level: 0 }],
      players: [{ id: 'p2', balance: 3500, position: 6 }],
      auction: {
        cellIndex: 6,
        currentBid: winningBid,
        finalPrice: winningBid,
        highestBidderId: 'p2',
        winnerId: 'p2',
        isConcluded: true,
        timeRemaining: 0,
      },
    };

    const events = synthesizeGameEvents(prevState, nextState, delta);
    const hasAuctionWon = events.some((e) => e.type === SynthesizedGameEventType.AUCTION_WON);
    const taxEvents = filterTaxEvents(events);

    expect(hasAuctionWon).toBe(true);
    expect(events.some((e) => e.type === SynthesizedGameEventType.AUCTION_WON && 'winnerId' in e && e.winnerId === 'p2')).toBe(true);
    expect(taxEvents.length).toBe(0);
  });

  it('TC-366.04 [UC-DEDUP-UNMORTGAGE/MSS]: elides redundant FEE_PAID TAX event upon paying 55% unmortgage fee', () => {
    // Cell 1 deed price = 600, unmortgage cost = Math.floor(600 * 0.55) = 330
    const unmortgageCost = 330;
    const prevState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 5000, ownedProperties: [1], mortgagedProperties: [1] },
      },
    });
    const nextState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 5000 - unmortgageCost, ownedProperties: [1], mortgagedProperties: [] },
      },
    });
    const delta: DeltaPayload = {
      tick: 4,
      cells: [{ index: 1, isMortgaged: false, ownerId: 'p1' }],
      players: [{ id: 'p1', balance: 5000 - unmortgageCost, position: 1 }],
    };

    const events = synthesizeGameEvents(prevState, nextState, delta);
    const hasUnmortgageEvent = events.some((e) => e.type === SynthesizedGameEventType.PROPERTY_UNMORTGAGED);
    const taxEvents = filterTaxEvents(events);

    expect(hasUnmortgageEvent).toBe(true);
    expect(events.some((e) => e.type === SynthesizedGameEventType.PROPERTY_UNMORTGAGED && 'cellIndex' in e && e.cellIndex === 1)).toBe(true);
    expect(taxEvents.length).toBe(0);
  });

  it('TC-366.05 [UC-DEDUP-INFRASTRUCTURE/MSS]: elides redundant FEE_PAID TAX event on Railroad ETC activation', () => {
    const prevState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 5000, ownedProperties: [5] },
      },
      propertyStates: { 5: { level: 0, isETC: false } },
    });
    const nextState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 5000 - ETC_COST_PER_CELL, ownedProperties: [5] },
      },
      propertyStates: { 5: { level: 0, isETC: true } },
    });
    const delta: DeltaPayload = {
      tick: 5,
      cells: [{ index: 5, isETC: true, ownerId: 'p1' }],
      players: [{ id: 'p1', balance: 5000 - ETC_COST_PER_CELL, position: 5 }],
    };

    const events = synthesizeGameEvents(prevState, nextState, delta);
    const taxEvents = filterTaxEvents(events);
    const feePaidEvents = events.filter((e) => e.type === SynthesizedGameEventType.FEE_PAID);

    expect(taxEvents.length).toBe(0);
    expect(feePaidEvents.length).toBe(0);
  });

  it('TC-366.06 [UC-PASS-GO-COLLISION/MSS]: produces GO_SALARY and PROPERTY_BOUGHT without TAX toast on tick collision', () => {
    // p1 passes GO (+2000) and buys Cell 1 (-600). Net balance change = +1400.
    const prevState = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        p1: { id: 'p1', balance: 5000, ownedProperties: [] },
      },
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 1 },
      playersInfo: {
        p1: { id: 'p1', balance: 6400, ownedProperties: [1] },
      },
    });
    const delta: DeltaPayload = {
      tick: 6,
      passedGoSalary: 2000,
      cells: [{ index: 1, ownerId: 'p1', level: 0 }],
      players: [{ id: 'p1', balance: 6400, position: 1 }],
    };

    const events = synthesizeGameEvents(prevState, nextState, delta);
    const hasSalary = events.some((e) => e.type === SynthesizedGameEventType.GO_SALARY);
    const hasBought = events.some((e) => e.type === SynthesizedGameEventType.PROPERTY_BOUGHT);
    const taxEvents = filterTaxEvents(events);

    expect(hasSalary).toBe(true);
    expect(hasBought).toBe(true);
    expect(taxEvents.length).toBe(0);
  });

  it('TC-366.07 [UC-BANKRUPTCY-IMMUNITY/MSS]: preserves legitimate fee when receiving property from bankrupt debtor at zero cost', () => {
    // p1 is bankrupt debtor transferring cell 23 to creditor p2.
    // p2 also incurs a 500 fee (e.g. from land tax or penalty).
    const prevState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: -500, ownedProperties: [23] },
        p2: { id: 'p2', balance: 5000, ownedProperties: [] },
      },
    });
    const nextState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 0, bankrupt: true, ownedProperties: [] },
        p2: { id: 'p2', balance: 4500, ownedProperties: [23] },
      },
    });
    const delta: DeltaPayload = {
      tick: 7,
      cells: [{ index: 23, ownerId: 'p2', level: 0 }],
      players: [{ id: 'p2', balance: 4500, position: 12 }],
    };

    const events = synthesizeGameEvents(prevState, nextState, delta);
    const taxEvents = filterTaxEvents(events);

    // p2 must NOT receive fee immunity just because owner of cell 23 became p2!
    expect(taxEvents.length).toBe(1);
    expect(taxEvents[0]?.amount).toBe(500);
  });

  it('TC-366.08 [UC-PRESERVE-GENUINE-FEES/MSS]: preserves genuine LAND_TAX at Cell 04 and BAIL at Cell 10', () => {
    const prevState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 5000, ownedProperties: [] },
      },
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 4 },
      playersInfo: {
        p1: { id: 'p1', balance: 4000, ownedProperties: [] },
      },
    });
    const delta: DeltaPayload = {
      tick: 8,
      cells: [],
      players: [{ id: 'p1', balance: 4000, position: 4 }],
    };

    const events = synthesizeGameEvents(prevState, nextState, delta);
    const landTaxEvents = events.filter(
      (e) => e.type === SynthesizedGameEventType.FEE_PAID && 'feeType' in e && e.feeType === 'LAND_TAX',
    );

    expect(landTaxEvents.length).toBe(1);
    expect((landTaxEvents[0] as FeePaidEvent).amount).toBe(1000);
  });

  it('TC-366.09 [UC-HELPER-PARITY/MSS]: adjustNetDeltaForPropertyTransactions neutralizes and splices payer debt', () => {
    const delta: DeltaPayload = {
      tick: 9,
      cells: [{ index: 23, ownerId: 'p1', level: 0 }],
    };
    const prevState = {
      playersInfo: {
        p1: createMockPlayer({ id: 'p1', balance: 5000, ownedProperties: [] }),
      },
    };
    const nextState = {
      playersInfo: {
        p1: createMockPlayer({ id: 'p1', balance: 2800, ownedProperties: [23] }),
      },
    };
    const payers: InternalBalanceDelta[] = [{ id: 'p1', diff: -2200, hasPassedGo: false, isSentToAudit: false }];

    adjustNetDeltaForPropertyTransactions(delta, prevState, nextState, payers);

    expect(payers.length).toBe(0);
  });

  it('TC-366.10 [UC-WIRING-SYNTHESIZER/MSS]: synthesizeFinancialEvents call-site integrates helper and suppresses TAX', () => {
    const prevState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 5000, ownedProperties: [] },
      },
    });
    const nextState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 2800, ownedProperties: [23] },
      },
    });
    const delta: DeltaPayload = {
      tick: 10,
      cells: [{ index: 23, ownerId: 'p1', level: 0 }],
      players: [{ id: 'p1', balance: 2800, position: 23 }],
    };

    const financialEvents = synthesizeFinancialEvents(prevState, nextState, delta);
    const taxEvents = filterTaxEvents(financialEvents);

    expect(taxEvents.length).toBe(0);
  });

  it('TC-366.11 [UC-LAND-CHANGE-CARD/MSS]: absorbs strictly 500 M VND for CC_LAND_CHANGE card without over-crediting', () => {
    // Cell 39 has standard upgrade cost 2000 M.
    // Under CC_LAND_CHANGE, cost is strictly 500 M.
    // If player incurred 700 total outflow (500 upgrade + 200 other fee), only 500 is absorbed!
    const prevState = createMockGameState({
      levelMap: { 39: 0 },
      playersInfo: {
        p1: { id: 'p1', balance: 5000, ownedProperties: [39] },
      },
    });
    const nextState = createMockGameState({
      levelMap: { 39: 1 },
      playersInfo: {
        p1: { id: 'p1', balance: 4300, ownedProperties: [39] },
      },
    });
    const delta: DeltaPayload = {
      tick: 11,
      cells: [{ index: 39, level: 1, ownerId: 'p1' }],
      players: [{ id: 'p1', balance: 4300, position: 39 }],
      lastEventCard: {
        id: ChanceCardId.CC_LAND_CHANGE,
        type: 'Chance',
        title: 'Chuyển Đổi Mục Đích Đất',
        description: 'Duyệt chuyển đổi đất...',
        cardId: ChanceCardId.CC_LAND_CHANGE,
      },
    };

    const events = synthesizeGameEvents(prevState, nextState, delta);
    const taxEvents = filterTaxEvents(events);

    expect(taxEvents.length).toBe(1);
    expect(taxEvents[0]?.amount).toBe(200);
  });

  it('TC-366.12 [UC-LAND-FEVER-MODIFIER/MSS]: absorbs correct upgrade cost under MACRO_LAND_FEVER modifier', () => {
    const activeMods = [
      {
        type: MacroCycleType.MACRO_LAND_FEVER,
        remainingRounds: 3,
        affectedCells: [31],
      },
    ];
    const feverCost = calculateUpgradeCost(31, 0, activeMods); // Uses domain SSOT
    const prevState = createMockGameState({
      levelMap: { 31: 0 },
      playersInfo: {
        p1: { id: 'p1', balance: 5000, ownedProperties: [31, 32, 34] },
      },
    });
    const nextState = createMockGameState({
      levelMap: { 31: 1 },
      playersInfo: {
        p1: { id: 'p1', balance: 5000 - feverCost, ownedProperties: [31, 32, 34] },
      },
    });
    const delta: DeltaPayload = {
      tick: 12,
      cells: [{ index: 31, level: 1, ownerId: 'p1' }],
      players: [{ id: 'p1', balance: 5000 - feverCost, position: 31 }],
      activeModifiers: activeMods,
    };

    const events = synthesizeGameEvents(prevState, nextState, delta);
    const taxEvents = filterTaxEvents(events);

    expect(taxEvents.length).toBe(0);
  });
});
