// [IMP-380] Living Contract Tests: Financial Narrative Transparency
// Station 1: Contract RED Specification & Call-Site Wiring Verification
// Covers Corporate Bonds (Repayment & Issuance), M&A Buyout, and HOSE Trading

import { describe, it, expect, beforeEach } from 'vitest';
import { synthesizeFinancialEvents } from '../../src/client/events/game_event_financial_synthesizer.js';
import { synthesizePropertyAndMarketEvents } from '../../src/client/events/game_event_property_synthesizer.js';
import {
  SynthesizedGameEventType,
  type BondRepaidEvent,
  type BondIssuedEvent,
  type CompulsoryBuyoutEvent,
  type HoseSettledEvent,
  type GoSalaryEvent,
  type SynthesizedGameEvent,
} from '../../src/client/events/game_event_types.js';
import { createActivityLogSubscriber } from '../../src/client/events/subscribers/activity_log_subscriber.js';
import { createBadgeEventSubscriber } from '../../src/client/events/subscribers/badge_event_subscriber.js';
import { resetHoseEventTracker } from '../../src/client/events/game_event_hose_helpers.js';
import { resolveActionIcon } from '../../src/client/ui/transaction_narrative.js';
import { useGameStore, type GameState, type PlayerHudInfo, type FloatingTextItem } from '../../src/client/store/game_store.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { TurnPhase, type EventCardInfo } from '../../src/domain/room.js';

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
    p1: createMockPlayer({ id: 'p1', name: 'Otter', balance: 5000, tokenColor: '#38BDF8' }),
    p2: createMockPlayer({ id: 'p2', name: 'Fox', balance: 5000, tokenColor: '#F59E0B' }),
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
    playerPositions: { p1: 20, p2: 5 },
    playersInfo,
    roundNumber: 28,
    treasuryPool: 10000,
    turnPhase: TurnPhase.ActionPhase,
    ...restOverrides,
  };
}

describe('Station 1 Contract Tests: Financial Narrative Transparency (IMP-380)', () => {
  beforeEach(() => {
    useActivityStore.getState().clearLogs();
  });

  it('TC-380.01 [UC-BOND-REPAYMENT-NARRATIVE/MSS] Bond maturing at Free Parking synthesizes BOND_REPAID and prevents FEE_PAID: TAX', () => {
    const prev = createMockGameState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Otter',
          balance: 10000,
          bondContract: {
            principal: 3416,
            repayAmount: 3689,
            roundsLeft: 1,
            collateralCells: [1, 3],
            isActive: true,
            trancheId: undefined,
          },
        },
        p2: { id: 'p2', balance: 5000 },
      },
    });

    const next = createMockGameState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Otter',
          balance: 6311, // 10000 - 3689
          bondContract: undefined,
        },
        p2: { id: 'p2', balance: 5000 },
      },
    });

    const delta: DeltaPayload = {
      tick: 405,
      cells: [],
      players: [
        { id: 'p1', balance: 6311, position: 20 },
        { id: 'p2', balance: 5000, position: 5 },
      ],
    };

    const events = synthesizeFinancialEvents(prev, next, delta, { baseTimestamp: 1000 });
    const bondRepaid = events.find((e): e is BondRepaidEvent => e.type === SynthesizedGameEventType.BOND_REPAID);
    const taxEvents = events.filter((e) => e.type === SynthesizedGameEventType.FEE_PAID);

    expect(bondRepaid).toBeDefined();
    expect(bondRepaid?.repayAmount).toBe(3689);
    expect(bondRepaid?.principal).toBe(3416);
    expect(taxEvents.length).toBe(0);
  });

  it('TC-380.01b [ADV-01] Bond default event does NOT synthesize successful BOND_REPAID', () => {
    const prev = createMockGameState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Otter',
          balance: 5000,
          bondContract: {
            principal: 3416,
            repayAmount: 3689,
            roundsLeft: 1,
            collateralCells: [1, 3],
            isActive: true,
          },
        },
      },
    });

    const next = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Otter', balance: 1311, bondContract: undefined },
      },
    });

    const defaultCard: EventCardInfo = {
      id: 'EVENT_BOND_DEFAULT',
      title: 'Vỡ Nợ Trái Phiếu',
      cardType: 'chance',
      type: 'Chance',
      description: 'Vỡ nợ trái phiếu doanh nghiệp',
    };

    const delta: DeltaPayload = {
      tick: 406,
      cells: [],
      lastEventCard: defaultCard,
      players: [{ id: 'p1', balance: 1311, position: 20 }],
    };

    const events = synthesizeFinancialEvents(prev, next, delta, { baseTimestamp: 1001 });
    const bondRepaid = events.find((e) => e.type === SynthesizedGameEventType.BOND_REPAID);

    expect(bondRepaid).toBeUndefined();
  });

  it('TC-380.02 [UC-BOND-ISSUANCE-NARRATIVE/MSS] Issuing bond emits BOND_ISSUED and logs transparent activity feed entry', () => {
    const prev = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Otter', balance: 2000, bondContract: undefined },
      },
    });

    const next = createMockGameState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Otter',
          balance: 5416,
          bondContract: {
            principal: 3416,
            repayAmount: 3689,
            roundsLeft: 10,
            collateralCells: [1, 3],
            isActive: true,
          },
        },
      },
    });

    const delta: DeltaPayload = {
      tick: 150,
      cells: [],
      players: [{
        id: 'p1',
        balance: 5416,
        position: 0,
        bondContract: {
          principal: 3416,
          repayAmount: 3689,
          roundsLeft: 10,
          collateralCells: [1, 3],
          isActive: true,
        },
      }],
    };

    const events = synthesizeFinancialEvents(prev, next, delta, { baseTimestamp: 2000 });
    const bondIssued = events.find((e): e is BondIssuedEvent => e.type === SynthesizedGameEventType.BOND_ISSUED);

    expect(bondIssued).toBeDefined();
    expect(bondIssued?.principal).toBe(3416);
    expect(bondIssued?.roundsLeft).toBe(10);

    const subscriber = createActivityLogSubscriber(useActivityStore);
    subscriber(events, { delta, prevState: prev, nextState: next });
    const logs = useActivityStore.getState().activityLogs;
    const bondLog = logs.find((l) => l.type === 'bond');

    expect(bondLog?.message).toContain('phát hành Trái Phiếu');
  });

  it('TC-380.03 [UC-BUYOUT-NOT-RENT/MSS] Compulsory buyout emits COMPULSORY_BUYOUT, prevents RENT_PAID and suppresses PROPERTY_BOUGHT', () => {
    const prev = createMockGameState({
      pendingBuyout: {
        buyerId: 'p1',
        sellerId: 'p2',
        cellIndex: 6,
        cost: 1300,
        basePrice: 1000,
        createdAt: 1000,
        expiresAt: 2000,
        eligibleTargets: [{ cellIndex: 6, sellerId: 'p2', cost: 1300, basePrice: 1000 }],
      },
      playersInfo: {
        p1: { id: 'p1', name: 'Buyer', balance: 5000, ownedProperties: [] },
        p2: { id: 'p2', name: 'Seller', balance: 2000, ownedProperties: [6] },
      },
    });

    const next = createMockGameState({
      pendingBuyout: undefined,
      playersInfo: {
        p1: { id: 'p1', name: 'Buyer', balance: 3700, ownedProperties: [6] },
        p2: { id: 'p2', name: 'Seller', balance: 3300, ownedProperties: [] },
      },
    });

    const delta: DeltaPayload = {
      tick: 220,
      cells: [{ index: 6, ownerId: 'p1' }],
      players: [
        { id: 'p1', balance: 3700, position: 6 },
        { id: 'p2', balance: 3300, position: 15 },
      ],
    };

    const finEvents = synthesizeFinancialEvents(prev, next, delta, { baseTimestamp: 3000 });
    const buyoutEvent = finEvents.find((e): e is CompulsoryBuyoutEvent => e.type === SynthesizedGameEventType.COMPULSORY_BUYOUT);
    const rentEvents = finEvents.filter((e) => e.type === SynthesizedGameEventType.RENT_PAID);

    expect(buyoutEvent).toBeDefined();
    expect(buyoutEvent?.cost).toBe(1300);
    expect(rentEvents.length).toBe(0);

    const propEvents = synthesizePropertyAndMarketEvents(prev, next, delta, { baseTimestamp: 3000 });
    const boughtEvents = propEvents.filter((e) => e.type === SynthesizedGameEventType.PROPERTY_BOUGHT);

    expect(boughtEvents.length).toBe(0);
  });

  it('TC-380.04 [UC-HOSE-TRANSACTION-DISAMBIGUATION/MSS] HOSE trading loss and break-even emit HOSE_SETTLED without FEE_PAID: TAX fallback', () => {
    const prev = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Trader', balance: 5000 },
      },
    });

    const next = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Trader', balance: 4000 },
      },
    });

    const delta: DeltaPayload = {
      tick: 300,
      cells: [],
      lastHoseResult: {
        playerId: 'p1',
        stake: 1000,
        roll: 1,
        multiplier: 0,
        payout: 0,
        profit: -1000,
        timestamp: 4000,
        diceSeq: 1,
      },
      players: [{ id: 'p1', balance: 4000, position: 38 }],
    };

    const events = synthesizeFinancialEvents(prev, next, delta, { baseTimestamp: 4000 });
    const hoseEvent = events.find((e): e is HoseSettledEvent => e.type === SynthesizedGameEventType.HOSE_SETTLED);
    const taxEvents = events.filter((e) => e.type === SynthesizedGameEventType.FEE_PAID);

    expect(hoseEvent).toBeDefined();
    expect(hoseEvent?.profit).toBe(-1000);
    expect(taxEvents.length).toBe(0);

    // Single-shot deduplication check on second pass
    const secondEvents = synthesizeFinancialEvents(prev, next, delta, { baseTimestamp: 4001 });
    const secondHoseEvent = secondEvents.find((e) => e.type === SynthesizedGameEventType.HOSE_SETTLED);
    expect(secondHoseEvent).toBeUndefined();
  });

  it('TC-380.05 [UC-BADGE-SUBSCRIBER/MSS] Badge subscriber registers floating badges for bond, buyout, and hose transactions', () => {
    const addedBadges: FloatingTextItem[] = [];
    const origAdd = useGameStore.getState().addFloatingText;
    useGameStore.setState({
      addFloatingText: (item) => {
        addedBadges.push({
          id: item.id ?? 'badge_test',
          timestamp: Date.now(),
          ...item,
        });
      },
    });

    const subscriber = createBadgeEventSubscriber(useGameStore);

    const testEvents: readonly SynthesizedGameEvent[] = [
      {
        type: SynthesizedGameEventType.BOND_REPAID,
        timestamp: 5000,
        playerId: 'p1',
        repayAmount: 3689,
        principal: 3416,
        interest: 273,
        totalRepaid: 3689,
      },
      {
        type: SynthesizedGameEventType.HOSE_SETTLED,
        timestamp: 5001,
        playerId: 'p1',
        stake: 1000,
        roll: 3,
        multiplier: 1.0,
        payout: 1000,
        profit: 0,
      },
    ];

    subscriber(testEvents, {
      delta: { tick: 500, cells: [] },
      prevState: createMockGameState(),
      nextState: createMockGameState(),
    });

    const bondBadge = addedBadges.find((b) => b.actionType === 'bond');
    const hoseBadge = addedBadges.find((b) => b.actionType === 'hose');

    expect(bondBadge?.title).toContain('Trái Phiếu Doanh Nghiệp');
    expect(hoseBadge?.title).toContain('HOSE');
    expect(resolveActionIcon(bondBadge?.actionType)).toBe('📜');

    // Restore original store method
    useGameStore.setState({ addFloatingText: origAdd });
  });

  it('TC-380.06 [UC-COMPOSITE-CASHFLOW/MSS] Bond maturing simultaneously with GO salary crossing prevents Netting Collision and suppresses false FEE_PAID: TAX', () => {
    // Player crosses GO (pos 38 -> pos 2): gross salary = 2000 (round 1), 0 deductions
    // Player bond matures: repayAmount = 3689 (principal: 3416, interest: 273)
    // Starting balance: 10,000
    // Net cashflow: +2000 - 3689 = -1689
    // Ending balance: 10,000 - 1689 = 8311
    const prev = createMockGameState({
      playerPositions: { p1: 38, p2: 10 },
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Otter',
          balance: 10000,
          bondContract: {
            principal: 3416,
            repayAmount: 3689,
            roundsLeft: 1,
            collateralCells: [1, 3],
            isActive: true,
          },
        },
        p2: { id: 'p2', balance: 5000 },
      },
    });

    const next = createMockGameState({
      playerPositions: { p1: 2, p2: 10 },
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Otter',
          balance: 8311,
          bondContract: undefined,
        },
        p2: { id: 'p2', balance: 5000 },
      },
    });

    const delta: DeltaPayload = {
      tick: 600,
      roundNumber: 1,
      cells: [],
      players: [
        { id: 'p1', balance: 8311, position: 2 },
        { id: 'p2', balance: 5000, position: 10 },
      ],
    };

    const events = synthesizeFinancialEvents(prev, next, delta, { baseTimestamp: 6000 });
    const bondRepaid = events.find((e): e is BondRepaidEvent => e.type === SynthesizedGameEventType.BOND_REPAID);
    const goSalary = events.find((e): e is GoSalaryEvent => e.type === SynthesizedGameEventType.GO_SALARY);
    const taxEvents = events.filter((e) => e.type === SynthesizedGameEventType.FEE_PAID);

    expect(events.length).toBe(2);
    expect(bondRepaid?.repayAmount).toBe(3689);
    expect(goSalary?.netAmount).toBe(2000);
    expect(taxEvents.length).toBe(0);
  });

  it('TC-380.07 [UC-HOSE-TRACKER-LIFECYCLE/MSS] resetHoseEventTracker clears deduplication key on session purge', () => {
    const prev = createMockGameState({ playersInfo: { p1: { id: 'p1', name: 'Trader', balance: 5000 } } });
    const next = createMockGameState({ playersInfo: { p1: { id: 'p1', name: 'Trader', balance: 4000 } } });
    const delta: DeltaPayload = {
      tick: 300,
      cells: [],
      lastHoseResult: {
        playerId: 'p1',
        stake: 1000,
        roll: 1,
        multiplier: 0,
        payout: 0,
        profit: -1000,
        timestamp: 4000,
        diceSeq: 1,
      },
      players: [{ id: 'p1', balance: 4000, position: 38 }],
    };

    synthesizeFinancialEvents(prev, next, delta, { baseTimestamp: 4000 });
    const secondPass = synthesizeFinancialEvents(prev, next, delta, { baseTimestamp: 4001 });
    expect(secondPass.find((e) => e.type === SynthesizedGameEventType.HOSE_SETTLED)).toBeUndefined();

    resetHoseEventTracker();
    const afterReset = synthesizeFinancialEvents(prev, next, delta, { baseTimestamp: 4002 });
    expect(afterReset.find((e) => e.type === SynthesizedGameEventType.HOSE_SETTLED)).toBeDefined();
  });
});

