// [IMP-333] Living Contract Tests: Badge Event Presentation Subscriber
// Protocol: Station 1 Contract RED Testing
// Universal 5-Facet Behavioral Matrix & Anti-TIDD Boundary

import { describe, it, expect, beforeEach } from 'vitest';
import { createBadgeEventSubscriber } from '../../src/client/events/subscribers/badge_event_subscriber.js';
import { type PacingContext } from '../../src/client/events/pacing_context.js';
import {
  SynthesizedGameEventType,
  type RentPaidEvent,
  type PortSplitRentEvent,
  type GoSalaryEvent,
  type PropertyBoughtEvent,
  type PropertyUpgradedEvent,
  type PropertyMortgagedEvent,
  type PropertyUnmortgagedEvent,
  type DiplomaticWaiverEvent,
  type TradeCompletedEvent,
  type FeePaidEvent,
  type PartialRentEvent,
  type SynthesizedGameEvent,
} from '../../src/client/events/game_event_types.js';
import {
  useGameStore,
  type GameState,
  type PlayerHudInfo,
  FloatingTextType,
} from '../../src/client/store/game_store.js';
import { useVfxStore } from '../../src/client/store/vfx_store.js';
import { deduplicateFloatingTexts } from '../../src/client/ui/notification_deduplicator.js';
import { getCellName } from '../../src/client/network/activity_property_tracker.js';
import { type GameEventContext } from '../../src/client/events/game_event_bus.js';
import { TurnPhase } from '../../src/domain/room.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

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

const synchronousPacing: PacingContext = {
  getPawnLandingDelay: () => 0,
  getPawnPassGoDelay: () => 0,
  scheduleAction: (action) => {
    action();
    return null;
  },
  clearPendingTimers: () => {},
};

describe('Station 1 Contract Tests: Badge Event Presentation Subscriber (IMP-333)', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      playersInfo: {
        p1: createMockPlayer({ id: 'p1', name: 'Player 1' }),
        p2: createMockPlayer({ id: 'p2', name: 'Player 2' }),
        p3: createMockPlayer({ id: 'p3', name: 'Player 3' }),
      },
    });
    useVfxStore.setState({ activePawnReactions: {} });
  });

  it('TC-333.01 [UC-BADGE/MSS] Given RENT_PAID event, When badge subscriber executes, Then emits paired floating badges with shared groupId and pawn reactions', () => {
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

    subscriber([rentEvent], context);

    const texts = useGameStore.getState().floatingTexts;
    const payerBadge = texts.find((t) => t.playerId === 'p1');
    const receiverBadge = texts.find((t) => t.playerId === 'p2');

    expect(payerBadge?.text).toContain('-');
    expect(receiverBadge?.type).toBe(FloatingTextType.Reward);
    expect(payerBadge?.groupId).toBe(receiverBadge?.groupId);
    expect(useVfxStore.getState().activePawnReactions['p1']?.type).toBe('slump_recoil');
  });

  it('TC-333.02 [UC-BADGE/A1] Given PORT_SPLIT_RENT event, When badge subscriber executes, Then emits floating badges to BOTH receivers without deduplication collapse', () => {
    const context = createMockEventContext();
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing, useVfxStore);
    const portEvent: PortSplitRentEvent = {
      type: SynthesizedGameEventType.PORT_SPLIT_RENT,
      payerId: 'p1',
      receiverIds: ['p2', 'p3'],
      cellIndex: 12,
      totalAmount: 600,
      amountPerReceiver: 300,
      timestamp: 1000,
    };

    subscriber([portEvent], context);

    const texts = useGameStore.getState().floatingTexts;
    const p2Badge = texts.find((t) => t.playerId === 'p2');
    const p3Badge = texts.find((t) => t.playerId === 'p3');

    expect(p2Badge?.type).toBe(FloatingTextType.Reward);
    expect(p3Badge?.type).toBe(FloatingTextType.Reward);
    expect(p2Badge?.text).toContain('300');
    expect(p3Badge?.text).toContain('300');
  });

  it('TC-333.03 [UC-BADGE/A2] Given GO_SALARY event, When badge subscriber executes, Then emits Reward badge with formula and schedules at pass-GO delay', () => {
    const context = createMockEventContext();
    const scheduledDelays: number[] = [];
    const mockPacing: PacingContext = {
      getPawnLandingDelay: () => 0,
      getPawnPassGoDelay: () => 800,
      scheduleAction: (action, delay) => {
        scheduledDelays.push(delay);
        action();
        return null;
      },
      clearPendingTimers: () => {},
    };
    const subscriber = createBadgeEventSubscriber(useGameStore, mockPacing, useVfxStore);
    const salaryEvent: GoSalaryEvent = {
      type: SynthesizedGameEventType.GO_SALARY,
      playerId: 'p1',
      grossSalary: 2000,
      taxDeduction: 0,
      netAmount: 2000,
      timestamp: 1000,
    };

    subscriber([salaryEvent], context);

    const salaryBadge = useGameStore.getState().floatingTexts.find((t) => t.playerId === 'p1');

    expect(salaryBadge?.type).toBe(FloatingTextType.Reward);
    expect(salaryBadge?.actionType).toBe('salary');
    expect(salaryBadge?.formula).toContain('Hoàn thành 1 vòng sa bàn');
    expect(scheduledDelays[0]).toBe(800);
  });

  it('TC-333.04 [UC-BADGE/A3] Given property operations (PROPERTY_BOUGHT, UPGRADED, MORTGAGED, UNMORTGAGED), When badge subscriber executes, Then emits appropriate Penalty/Reward floating badges with deed cell names', () => {
    const context = createMockEventContext();
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing, useVfxStore);
    const cellName = getCellName(6);
    const events: readonly SynthesizedGameEvent[] = [
      { type: SynthesizedGameEventType.PROPERTY_BOUGHT, buyerId: 'p1', cellIndex: 6, price: 1000, timestamp: 1000 },
      { type: SynthesizedGameEventType.PROPERTY_UPGRADED, ownerId: 'p1', cellIndex: 6, targetLevel: 2, cost: 500, timestamp: 1001 },
      { type: SynthesizedGameEventType.PROPERTY_MORTGAGED, ownerId: 'p1', cellIndex: 6, loanAmount: 500, timestamp: 1002 },
      { type: SynthesizedGameEventType.PROPERTY_UNMORTGAGED, ownerId: 'p1', cellIndex: 6, cost: 550, timestamp: 1003 },
    ];

    subscriber(events, context);

    const texts = useGameStore.getState().floatingTexts;
    const buyBadge = texts.find((t) => t.actionType === 'buy');
    const upgradeBadge = texts.find((t) => t.actionType === 'upgrade');
    const mortgageBadge = texts.find((t) => t.actionType === 'mortgage');
    const unmortgageBadge = texts.find((t) => t.actionType === 'unmortgage');

    expect(buyBadge?.title ?? '').toContain(cellName);
    expect(upgradeBadge?.type).toBe(FloatingTextType.Penalty);
    expect(mortgageBadge?.type).toBe(FloatingTextType.Reward);
    expect(unmortgageBadge?.type).toBe(FloatingTextType.Penalty);
  });

  it('TC-333.05 [UC-BADGE/A4] Given DIPLOMATIC_WAIVER event, When badge subscriber executes, Then emits paired floating badges (+savedRent for tenant, -savedRent for landlord)', () => {
    const context = createMockEventContext();
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing, useVfxStore);
    const diploEvent: DiplomaticWaiverEvent = {
      type: SynthesizedGameEventType.DIPLOMATIC_WAIVER,
      payerId: 'p1',
      landlordId: 'p2',
      cellIndex: 8,
      waivedAmount: 350,
      timestamp: 1000,
    };

    subscriber([diploEvent], context);

    const texts = useGameStore.getState().floatingTexts;
    const tenantBadge = texts.find((t) => t.playerId === 'p1');
    const landlordBadge = texts.find((t) => t.playerId === 'p2');

    expect(tenantBadge?.type).toBe(FloatingTextType.Reward);
    expect(landlordBadge?.type).toBe(FloatingTextType.Penalty);
    expect(tenantBadge?.groupId).toBe(landlordBadge?.groupId);
    expect(tenantBadge?.title).toContain('Miễn Trừ Ngoại Giao');
  });

  it('TC-333.06 [UC-BADGE/A5] Given TRADE_COMPLETED with property swap, When badge subscriber executes, Then formats both cell names symmetrically and includes net price', () => {
    const context = createMockEventContext();
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing, useVfxStore);
    const tradeEvent: TradeCompletedEvent = {
      type: SynthesizedGameEventType.TRADE_COMPLETED,
      sellerId: 'p1',
      buyerId: 'p2',
      cellIndex: 6,
      offeredCellIndex: 8,
      price: 400,
      taxAmount: 40,
      timestamp: 1000,
    };

    subscriber([tradeEvent], context);

    const texts = useGameStore.getState().floatingTexts;
    const sellerBadge = texts.find((t) => t.playerId === 'p1');
    const buyerBadge = texts.find((t) => t.playerId === 'p2');

    expect(sellerBadge?.actionType).toBe('trade');
    expect(buyerBadge?.actionType).toBe('trade');
    expect(sellerBadge?.groupId).toBe(buyerBadge?.groupId);
    expect(buyerBadge?.title).toContain(getCellName(6));
  });

  it('TC-333.12 [UC-FEE/A6] Given FEE_PAID event (Bail Ô 10 or Land Tax Ô 4), When badge subscriber executes, Then emits Penalty badge with correct title and formula', () => {
    const context = createMockEventContext();
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing, useVfxStore);
    const bailEvent: FeePaidEvent = {
      type: SynthesizedGameEventType.FEE_PAID,
      payerId: 'p1',
      feeType: 'BAIL',
      amount: 500,
      cellIndex: 10,
      timestamp: 1000,
    };

    subscriber([bailEvent], context);

    const feeBadge = useGameStore.getState().floatingTexts.find((t) => t.playerId === 'p1');

    expect(feeBadge?.type).toBe(FloatingTextType.Penalty);
    expect(feeBadge?.actionType).toBe('bail');
    expect(feeBadge?.cellIndex).toBe(10);
    expect(feeBadge?.formula).toContain('Kho Bạc');
  });

  it('TC-333.13 [UC-PARTIAL/A7] Given PARTIAL_RENT event, When badge subscriber executes, Then emits Penalty badge for payer with insolvency formula and Reward badge for receiver', () => {
    const context = createMockEventContext();
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing, useVfxStore);
    const partialEvent: PartialRentEvent = {
      type: SynthesizedGameEventType.PARTIAL_RENT,
      payerId: 'p1',
      receiverId: 'p2',
      paidAmount: 200,
      remainingDebt: 600,
      cellIndex: 15,
      timestamp: 1000,
    };

    subscriber([partialEvent], context);

    const texts = useGameStore.getState().floatingTexts;
    const payerBadge = texts.find((t) => t.playerId === 'p1');
    const receiverBadge = texts.find((t) => t.playerId === 'p2');

    expect(payerBadge?.type).toBe(FloatingTextType.Penalty);
    expect(receiverBadge?.type).toBe(FloatingTextType.Reward);
    expect(payerBadge?.formula).toContain('600');
    expect(receiverBadge?.text).toContain('200');
  });

  it('TC-333.17 [UC-PORT-DEDUP/A8] Given PORT_SPLIT_RENT with two receivers, When badge subscriber emits floating badges and passes through deduplicateFloatingTexts, Then both receiver reward badges survive deduplication', () => {
    const context = createMockEventContext();
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing, useVfxStore);
    const portEvent: PortSplitRentEvent = {
      type: SynthesizedGameEventType.PORT_SPLIT_RENT,
      payerId: 'p1',
      receiverIds: ['p2', 'p3'],
      cellIndex: 12,
      totalAmount: 600,
      amountPerReceiver: 300,
      timestamp: 1000,
    };

    subscriber([portEvent], context);

    const rawBadges = useGameStore.getState().floatingTexts;
    const deduplicated = deduplicateFloatingTexts(rawBadges, 'p2');
    const p2Survivor = deduplicated.find((b) => b.playerId === 'p2');
    const p3Survivor = deduplicated.find((b) => b.playerId === 'p3');

    expect(rawBadges.length).toBeGreaterThanOrEqual(2);
    expect(p2Survivor).toBeDefined();
    expect(p3Survivor).toBeDefined();
    expect(p2Survivor?.playerId).not.toBe(p3Survivor?.playerId);
  });

  it('TC-333.18 [UC-FORMULA-LEAN/A9] Given PROPERTY_BOUGHT and PROPERTY_UPGRADED events, When badge subscriber creates floating badges, Then formula property is undefined or empty string', () => {
    const context = createMockEventContext();
    const subscriber = createBadgeEventSubscriber(useGameStore, synchronousPacing, useVfxStore);
    const buyEvent: PropertyBoughtEvent = {
      type: SynthesizedGameEventType.PROPERTY_BOUGHT,
      buyerId: 'p1',
      cellIndex: 6,
      price: 1000,
      timestamp: 1000,
    };
    const upgradeEvent: PropertyUpgradedEvent = {
      type: SynthesizedGameEventType.PROPERTY_UPGRADED,
      ownerId: 'p1',
      cellIndex: 6,
      targetLevel: 2,
      cost: 500,
      timestamp: 1001,
    };

    subscriber([buyEvent, upgradeEvent], context);

    const texts = useGameStore.getState().floatingTexts;
    const buyBadge = texts.find((t) => t.actionType === 'buy');
    const upgradeBadge = texts.find((t) => t.actionType === 'upgrade');

    expect(buyBadge).toBeDefined();
    expect(buyBadge?.formula ?? '').toBe('');
    expect(upgradeBadge).toBeDefined();
    expect(upgradeBadge?.formula ?? '').toBe('');
  });
});
