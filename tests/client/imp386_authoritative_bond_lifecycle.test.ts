// [IMP-386] Living Contract Tests: Authoritative Bond Lifecycle Emission & Client Zero-Heuristic Financial Dispatch
// Station 1: Contract Specification & Call-Site Wiring Verification
// Covers Server Authoritative Emission (handleRepayBond & processBondTurnTransition),
// Client Direct Dispatch (extractBondEvents), Composite Netting Collision Defense,
// and Presentation Wiring (Activity Log & Floating Badge).

import { describe, it, expect } from 'vitest';
import { handleRepayBond, processBondTurnTransition } from '../../src/server/bond_manager.js';
import {
  type Room,
  type Player,
  TurnPhase,
} from '../../src/domain/room.js';
import { BondTrancheId } from '../../src/domain/bond_types.js';
import {
  SynthesizedGameEventType,
  type SynthesizedGameEvent,
  type BondRepaidEvent,
  type BondDefaultEvent,
} from '../../src/client/events/game_event_types.js';
import { extractBondEvents } from '../../src/client/events/game_event_bond_helpers.js';
import type { InternalBalanceDelta } from '../../src/client/events/game_event_financial_helpers.js';
import { synthesizeFinancialEvents } from '../../src/client/events/game_event_financial_synthesizer.js';
import {
  formatBondIssuedMessage,
  formatBondDefaultMessage,
} from '../../src/client/events/subscribers/activity_log_financial_formatter.js';
import { createBadgeEventSubscriber } from '../../src/client/events/subscribers/badge_event_subscriber.js';
import { createActivityLogSubscriber } from '../../src/client/events/subscribers/activity_log_subscriber.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { useGameStore, type GameState, type PlayerHudInfo, type FloatingTextItem } from '../../src/client/store/game_store.js';

function createMockRoom(): Room {
  const p1: Player = {
    id: 'p1',
    name: 'Player 1',
    balance: 10_000,
    position: 0,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    consecutiveDoubles: 0,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
    bankrupt: false,
    bondContract: {
      principal: 2_000,
      repayAmount: 2_200,
      roundsLeft: 2,
      collateralCells: [1, 3],
      trancheId: BondTrancheId.WORKING_CAPITAL,
      isActive: true,
    },
  };

  return {
    roomCode: 'TEST01',
    hostId: 'p1',
    players: [p1],
    currentPlayerIndex: 0,
    phase: TurnPhase.WaitingRoll,
    started: true,
    activeModifiers: [],
    marketDeck: [],
    marketDiscard: [],
    chanceDeck: [],
    chanceDiscard: [],
    permanentRentBonus: {},
    treasury: 50_000,
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
  overrides?: Omit<Partial<GameState>, 'playersInfo'> & {
    playersInfo?: Record<string, Partial<PlayerHudInfo>>;
  },
): GameState {
  const base = useGameStore.getState();
  const defaultPlayers: Record<string, PlayerHudInfo> = {
    p1: createMockPlayer({ id: 'p1', name: 'Player 1', balance: 5000, tokenColor: '#38BDF8' }),
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
    ...restOverrides,
    playersInfo,
  };
}

describe('IMP-386: Authoritative Bond Lifecycle Emission & Client Zero-Heuristic Financial Dispatch', () => {
  it('TC-386.01a [UC-BOND-ACTIVE-REPAY-EMISSION/MSS]: handleRepayBond returns success and clears bond contract', () => {
    const room = createMockRoom();
    const result = handleRepayBond(room, 'p1');

    expect(result.success).toBe(true);
    expect(room.players[0]!.bondContract).toBeNull();
  });

  it('TC-386.01b [UC-BOND-ACTIVE-REPAY-EMISSION/MSS]: handleRepayBond emits canonical BOND_REPAID event with correct principal and interest', () => {
    const room = createMockRoom();
    handleRepayBond(room, 'p1');

    const event = room.pendingDomainEvents?.find((e) => e.type === 'BOND_REPAID');
    expect(event).toBeDefined();
    expect(event?.playerId).toBe('p1');
    expect(event?.principal).toBe(2_000);
    expect(event?.interest).toBe(200);
  });

  it('TC-386.01c [UC-BOND-ACTIVE-REPAY-EMISSION/MSS]: handleRepayBond emits repayAmount and trancheId in domain event', () => {
    const room = createMockRoom();
    handleRepayBond(room, 'p1');

    const event = room.pendingDomainEvents?.find((e) => e.type === 'BOND_REPAID');
    expect(event?.repayAmount).toBe(2_200);
    expect(event?.trancheId).toBe(BondTrancheId.WORKING_CAPITAL);
  });

  it('TC-386.02a [UC-BOND-TURN-TRANSITION-REPAY-EMISSION/MSS]: processBondTurnTransition clears bond contract and pushes BOND_REPAID event', () => {
    const room = createMockRoom();
    room.players[0]!.bondContract = { ...room.players[0]!.bondContract!, roundsLeft: 1 };
    room.players[0]!.balance = 5_000;

    const registry = new Map();
    const stateMap = new Map();
    const auctions = new Map();
    processBondTurnTransition(room, room.players[0]!, registry, stateMap, auctions, 'TEST01');

    expect(room.players[0]!.bondContract).toBeNull();
    const event = room.pendingDomainEvents?.find((e) => e.type === 'BOND_REPAID');
    expect(event).toBeDefined();
    expect(event?.playerId).toBe('p1');
  });

  it('TC-386.02b [UC-BOND-TURN-TRANSITION-REPAY-EMISSION/MSS]: processBondTurnTransition emits correct financial amounts in BOND_REPAID event', () => {
    const room = createMockRoom();
    room.players[0]!.bondContract = { ...room.players[0]!.bondContract!, roundsLeft: 1 };
    room.players[0]!.balance = 5_000;

    const registry = new Map();
    const stateMap = new Map();
    const auctions = new Map();
    processBondTurnTransition(room, room.players[0]!, registry, stateMap, auctions, 'TEST01');

    const event = room.pendingDomainEvents?.find((e) => e.type === 'BOND_REPAID');
    expect(event?.principal).toBe(2_000);
    expect(event?.interest).toBe(200);
    expect(event?.repayAmount).toBe(2_200);
  });

  it('TC-386.03a [UC-BOND-DEFAULT-EMISSION/MSS]: processBondTurnTransition clears bond and seizes cash when insolvent at maturity', () => {
    const room = createMockRoom();
    room.players[0]!.bondContract = { ...room.players[0]!.bondContract!, roundsLeft: 1 };
    room.players[0]!.balance = 500; // Less than repayAmount 2200

    const registry = new Map();
    const stateMap = new Map();
    const auctions = new Map();
    processBondTurnTransition(room, room.players[0]!, registry, stateMap, auctions, 'TEST01');

    expect(room.players[0]!.bondContract).toBeNull();
    expect(room.players[0]!.balance).toBe(0); // 500 cash seized
  });

  it('TC-386.03b [UC-BOND-DEFAULT-EMISSION/MSS]: processBondTurnTransition emits BOND_DEFAULT with principal, repayAmount and cashSeized', () => {
    const room = createMockRoom();
    room.players[0]!.bondContract = { ...room.players[0]!.bondContract!, roundsLeft: 1 };
    room.players[0]!.balance = 500;

    const registry = new Map();
    const stateMap = new Map();
    const auctions = new Map();
    processBondTurnTransition(room, room.players[0]!, registry, stateMap, auctions, 'TEST01');

    const event = room.pendingDomainEvents?.find((e) => e.type === 'BOND_DEFAULT');
    expect(event).toBeDefined();
    expect(event?.principal).toBe(2_000);
    expect(event?.repayAmount).toBe(2_200);
    expect(event?.cashSeized).toBe(500);
  });

  it('TC-386.04a [UC-CLIENT-DIRECT-BOND-REPAID-DISPATCH/MSS]: extractBondEvents dispatches BOND_REPAID directly from domainEvents with principal and interest', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      domainEvents: [
        {
          type: 'BOND_REPAID',
          playerId: 'p1',
          principal: 2_000,
          interest: 200,
          repayAmount: 2_200,
          trancheId: BondTrancheId.WORKING_CAPITAL,
          timestamp: 1000,
        },
      ],
      players: [{ id: 'p1', balance: 7_800, position: 0, bondContract: null }],
    };

    const prevState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 10_000, bondContract: { principal: 2_000, repayAmount: 2_200, roundsLeft: 1, collateralCells: [1, 3], isActive: true } },
      },
    });

    const nextState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 7_800, bondContract: null },
      },
    });

    const payers: InternalBalanceDelta[] = [{ id: 'p1', diff: -2_200, cellIndex: 0, hasPassedGo: false, isSentToAudit: false }];
    const receivers: InternalBalanceDelta[] = [];

    const events = extractBondEvents(delta, prevState, nextState, payers, receivers, 1000);

    expect(events.length).toBe(1);
    const repaidEv = events[0] as BondRepaidEvent;
    expect(repaidEv.type).toBe(SynthesizedGameEventType.BOND_REPAID);
    expect(repaidEv.principal).toBe(2_000);
    expect(repaidEv.interest).toBe(200);
  });

  it('TC-386.04b [UC-CLIENT-DIRECT-BOND-REPAID-DISPATCH/MSS]: extractBondEvents preserves totalRepaid, trancheId and absorbs outflow', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      domainEvents: [
        {
          type: 'BOND_REPAID',
          playerId: 'p1',
          principal: 2_000,
          interest: 200,
          repayAmount: 2_200,
          trancheId: BondTrancheId.WORKING_CAPITAL,
          timestamp: 1000,
        },
      ],
      players: [{ id: 'p1', balance: 7_800, position: 0, bondContract: null }],
    };

    const prevState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 10_000, bondContract: { principal: 2_000, repayAmount: 2_200, roundsLeft: 1, collateralCells: [1, 3], isActive: true } },
      },
    });

    const nextState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 7_800, bondContract: null },
      },
    });

    const payers: InternalBalanceDelta[] = [{ id: 'p1', diff: -2_200, cellIndex: 0, hasPassedGo: false, isSentToAudit: false }];
    const receivers: InternalBalanceDelta[] = [];

    const events = extractBondEvents(delta, prevState, nextState, payers, receivers, 1000);
    const repaidEv = events[0] as BondRepaidEvent;

    expect(repaidEv.totalRepaid).toBe(2_200);
    expect(repaidEv.trancheId).toBe(BondTrancheId.WORKING_CAPITAL);
    expect(payers.length).toBe(0); // Outflow absorbed cleanly
  });

  it('TC-386.05a [UC-CLIENT-DIRECT-BOND-DEFAULT-DISPATCH/MSS]: extractBondEvents dispatches BOND_DEFAULT with principal and repayAmount', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      domainEvents: [
        {
          type: 'BOND_DEFAULT',
          playerId: 'p1',
          principal: 2_000,
          repayAmount: 2_200,
          cashSeized: 500,
          timestamp: 1000,
        },
      ],
      players: [{ id: 'p1', balance: 0, position: 0, bondContract: null }],
    };

    const prevState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 500, bondContract: { principal: 2_000, repayAmount: 2_200, roundsLeft: 1, collateralCells: [1, 3], isActive: true } },
      },
    });

    const nextState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 0, bondContract: null },
      },
    });

    const payers: InternalBalanceDelta[] = [{ id: 'p1', diff: -500, cellIndex: 0, hasPassedGo: false, isSentToAudit: false }];
    const receivers: InternalBalanceDelta[] = [];

    const events = extractBondEvents(delta, prevState, nextState, payers, receivers, 1000);

    expect(events.length).toBe(1);
    const defaultEv = events[0] as BondDefaultEvent;
    expect(defaultEv.type).toBe(SynthesizedGameEventType.BOND_DEFAULT);
    expect(defaultEv.principal).toBe(2_000);
    expect(defaultEv.repayAmount).toBe(2_200);
  });

  it('TC-386.05b [UC-CLIENT-DIRECT-BOND-DEFAULT-DISPATCH/MSS]: extractBondEvents absorbs cashSeized to prevent phantom tax', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      domainEvents: [
        {
          type: 'BOND_DEFAULT',
          playerId: 'p1',
          principal: 2_000,
          repayAmount: 2_200,
          cashSeized: 500,
          timestamp: 1000,
        },
      ],
      players: [{ id: 'p1', balance: 0, position: 0, bondContract: null }],
    };

    const prevState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 500, bondContract: { principal: 2_000, repayAmount: 2_200, roundsLeft: 1, collateralCells: [1, 3], isActive: true } },
      },
    });

    const nextState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 0, bondContract: null },
      },
    });

    const payers: InternalBalanceDelta[] = [{ id: 'p1', diff: -500, cellIndex: 0, hasPassedGo: false, isSentToAudit: false }];
    const receivers: InternalBalanceDelta[] = [];

    const events = extractBondEvents(delta, prevState, nextState, payers, receivers, 1000);
    const defaultEv = events[0] as BondDefaultEvent;

    expect(defaultEv.cashSeized).toBe(500);
    expect(payers.length).toBe(0); // Seized cash absorbed from payers!
  });

  it('TC-386.06 [UC-COMPOSITE-TRANSACTION-NETTING-COLLISION/MSS]: simultaneous GO crossing and bond default emits BOTH events with 0 phantom tax', () => {
    // Player crosses GO (+2000 salary) and defaults with 500 cash seized. Net delta is +1500.
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      domainEvents: [
        {
          type: 'BOND_DEFAULT',
          playerId: 'p1',
          principal: 2_000,
          repayAmount: 2_200,
          cashSeized: 500,
          timestamp: 1000,
        },
      ],
      players: [{ id: 'p1', balance: 2_000, position: 2, bondContract: null }],
    };

    const prevState = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        p1: { id: 'p1', balance: 500, bondContract: { principal: 2_000, repayAmount: 2_200, roundsLeft: 1, collateralCells: [1, 3], isActive: true } },
      },
    });

    const nextState = createMockGameState({
      playerPositions: { p1: 2 },
      playersInfo: {
        p1: { id: 'p1', balance: 2_000, bondContract: null },
      },
    });

    const events = synthesizeFinancialEvents(prevState, nextState, delta, { baseTimestamp: 1000 });

    const defaultEv = events.find((e: SynthesizedGameEvent) => e.type === SynthesizedGameEventType.BOND_DEFAULT);
    const goSalaryEv = events.find((e: SynthesizedGameEvent) => e.type === SynthesizedGameEventType.GO_SALARY);
    const taxEv = events.find((e: SynthesizedGameEvent) => e.type === SynthesizedGameEventType.FEE_PAID);

    expect(defaultEv).toBeDefined();
    expect(goSalaryEv).toBeDefined();
    expect(taxEv).toBeUndefined(); // ZERO phantom tax!
  });

  it('TC-386.07a [UC-ACTIVITY-LOG-FINANCIAL-FORMATTER/MSS]: formatBondIssuedMessage outputs accurate narrative with tranche and rate', () => {
    const issueMsg = formatBondIssuedMessage('Alice', 2_000, 3, 0.15, 'EXPANSION');
    expect(issueMsg).toContain('Alice');
    expect(issueMsg).toContain('Trái Phiếu [EXPANSION]');
    expect(issueMsg).toContain('15%');
  });

  it('TC-386.07b [UC-ACTIVITY-LOG-FINANCIAL-FORMATTER/MSS]: formatBondDefaultMessage outputs accurate narrative with seized cash', () => {
    const defaultMsg = formatBondDefaultMessage('Bob', 2_000, 2_200, 500);
    expect(defaultMsg).toContain('Bob vỡ nợ gói Trái Phiếu');
    expect(defaultMsg).toContain('tịch thu');
  });

  it('TC-386.08a [UC-BOND-ISSUANCE-PRESERVATION-AND-PRESENTATION-WIRE/MSS]: preserves BOND_ISSUED when repaying in same turn', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      domainEvents: [
        {
          type: 'BOND_REPAID',
          playerId: 'p1',
          principal: 2_000,
          repayAmount: 2_200,
          interest: 200,
          timestamp: 1000,
        },
      ],
      players: [
        {
          id: 'p1',
          balance: 8_000,
          position: 0,
          bondContract: {
            principal: 3_000,
            repayAmount: 3_600,
            roundsLeft: 3,
            collateralCells: [1, 3],
            isActive: true,
            trancheId: BondTrancheId.EXPANSION,
          },
        },
      ],
    };

    const prevState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', balance: 7_200, bondContract: { principal: 2_000, repayAmount: 2_200, roundsLeft: 1, collateralCells: [1, 3], isActive: true } },
      },
    });

    const nextState = createMockGameState({
      playersInfo: {
        p1: {
          id: 'p1',
          balance: 8_000,
          bondContract: { principal: 3_000, repayAmount: 3_600, roundsLeft: 3, collateralCells: [1, 3], isActive: true, trancheId: BondTrancheId.EXPANSION },
        },
      },
    });

    const payers: InternalBalanceDelta[] = [];
    const receivers: InternalBalanceDelta[] = [{ id: 'p1', diff: 3_000, cellIndex: undefined, hasPassedGo: false, isSentToAudit: false }];

    const events = extractBondEvents(delta, prevState, nextState, payers, receivers, 1000);
    const repaidEv = events.find((e) => e.type === SynthesizedGameEventType.BOND_REPAID);
    const issuedEv = events.find((e) => e.type === SynthesizedGameEventType.BOND_ISSUED);

    expect(repaidEv).toBeDefined();
    expect(issuedEv).toBeDefined(); // NOT skipped by continue!
  });

  it('TC-386.08b [UC-BOND-ISSUANCE-PRESERVATION-AND-PRESENTATION-WIRE/MSS]: schedules floating penalty badge for BOND_DEFAULT', () => {
    const defaultEvent: BondDefaultEvent = {
      type: SynthesizedGameEventType.BOND_DEFAULT,
      timestamp: 1000,
      playerId: 'p1',
      principal: 2_000,
      repayAmount: 2_200,
      cashSeized: 500,
    };

    const addedBadges: Array<Omit<FloatingTextItem, 'id' | 'timestamp'> & { id?: string }> = [];
    const origAdd = useGameStore.getState().addFloatingText;
    useGameStore.setState({
      addFloatingText: (item) => {
        addedBadges.push(item);
      },
    });

    const subscriber = createBadgeEventSubscriber(useGameStore);
    subscriber([defaultEvent], {
      delta: { tick: 100, cells: [] },
      prevState: createMockGameState(),
      nextState: createMockGameState(),
    });

    const defaultBadge = addedBadges.find((b) => b.actionType === 'bond');
    expect(defaultBadge).toBeDefined();
    expect(defaultBadge?.title).toBe('Vỡ Nợ Trái Phiếu Doanh Nghiệp');
    expect(defaultBadge?.type).toBe('penalty');

    useGameStore.setState({ addFloatingText: origAdd });
  });

  it('TC-386.08c [UC-BOND-ACTIVITY-LOG-WIRING/MSS]: dispatches financial activity log entry for BOND_DEFAULT via createActivityLogSubscriber', () => {
    useActivityStore.setState({ activityLogs: [] });
    const defaultEvent: BondDefaultEvent = {
      type: SynthesizedGameEventType.BOND_DEFAULT,
      timestamp: 1000,
      playerId: 'p1',
      principal: 2_000,
      repayAmount: 2_200,
      cashSeized: 500,
    };

    const subscriber = createActivityLogSubscriber(useActivityStore);
    subscriber([defaultEvent], {
      delta: { tick: 100, cells: [] },
      prevState: createMockGameState(),
      nextState: createMockGameState(),
    });

    const logs = useActivityStore.getState().activityLogs;
    const bondLog = logs.find((l) => l.type === 'bond' && l.playerId === 'p1');
    expect(bondLog).toBeDefined();
    expect(bondLog?.amount).toBe(-500);
    expect(bondLog?.message).toContain('vỡ nợ');
  });
});
