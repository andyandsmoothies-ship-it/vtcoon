// [IMP-330] Living Contract Tests: Game Event Narrative Synthesizer
// Protocol: Station 1 Contract RED Testing
// Universal 5-Facet Behavioral Matrix & Dynamic Triad Coverage

import { describe, it, expect } from 'vitest';
import { synthesizeFinancialEvents as synthesizeGameEvents } from '../../src/client/events/game_event_synthesizer.js';
import {
  SynthesizedGameEventType,
  type SynthesizerOptions,
} from '../../src/client/events/game_event_types.js';
import { useGameStore, type GameState } from '../../src/client/store/game_store.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { TELECOM_DATA_FEE } from '../../src/domain/property_rent.js';

import type { PlayerHudInfo } from '../../src/client/store/game_store.js';

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

describe('Station 1 Contract Tests: GameEventNarrativeSynthesizer (IMP-330)', () => {
  it('TC-330.01 [UC-SYNTH/MSS] Standard 1-to-1 rent payment returns typed RENT_PAID event', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 0, p2: 5 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, isBot: false },
        p2: { id: 'p2', name: 'Player 2', balance: 5000, isBot: false, ownedProperties: [1] },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 1, p2: 5 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 4500, isBot: false },
        p2: { id: 'p2', name: 'Player 2', balance: 5500, isBot: false, ownedProperties: [1] },
      },
    });
    const delta: DeltaPayload = {
      tick: 10,
      cells: [],
      players: [
        { id: 'p1', position: 1, balance: 4500 },
        { id: 'p2', position: 5, balance: 5500 },
      ],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.RENT_PAID);
    expect(events[0]).toMatchObject({
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 1,
      amount: 500,
    });
  });

  it('TC-330.02 [UC-SYNTH/A1] Passing GO with property tax and mortgage interest deductions returns structured GO_SALARY event', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Player 1',
          balance: 5000,
          isBot: false,
          ownedProperties: [1, 3, 6, 8],
          mortgagedProperties: [9],
          mortgageLoans: { 9: 1000 },
        },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 2 },
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Player 1',
          balance: 6350,
          isBot: false,
          ownedProperties: [1, 3, 6, 8],
          mortgagedProperties: [9],
        },
      },
    });
    const delta: DeltaPayload = {
      tick: 20,
      roundNumber: 1,
      passedGoSalary: 2000,
      cells: [],
      players: [{ id: 'p1', position: 2, balance: 6350 }],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.GO_SALARY);
    expect(events[0]).toMatchObject({
      playerId: 'p1',
      grossSalary: 2000,
      taxDeduction: 600,
      netAmount: 1350,
      deductions: {
        propertyTax: 600,
        mortgageInterest: 50,
      },
    });
  });

  it('TC-330.03 [UC-SYNTH/A2] Diplomatic waiver in delta.lastDiplomaticEvent returns DIPLOMATIC_WAIVER event', () => {
    const prev = createMockGameState();
    const next = createMockGameState();
    const delta: DeltaPayload = {
      tick: 30,
      cells: [],
      lastDiplomaticEvent: {
        playerId: 'p1',
        landlordId: 'p2',
        cellIndex: 6,
        savedRent: 1200,
      },
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.DIPLOMATIC_WAIVER);
    expect(events[0]).toMatchObject({
      payerId: 'p1',
      landlordId: 'p2',
      cellIndex: 6,
      waivedAmount: 1200,
    });
  });

  it('TC-330.04 [UC-SYNTH/A3] Multi-tenant port fee sharing returns PORT_SPLIT_RENT event', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 0, p2: 12, p3: 20 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, isBot: false },
        p2: { id: 'p2', name: 'Player 2', balance: 5000, isBot: false },
        p3: { id: 'p3', name: 'Player 3', balance: 5000, isBot: false },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 5, p2: 12, p3: 20 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 4000, isBot: false },
        p2: { id: 'p2', name: 'Player 2', balance: 5500, isBot: false },
        p3: { id: 'p3', name: 'Player 3', balance: 5500, isBot: false },
      },
    });
    const delta: DeltaPayload = {
      tick: 40,
      cells: [],
      players: [
        { id: 'p1', position: 5, balance: 4000 },
        { id: 'p2', position: 12, balance: 5500 },
        { id: 'p3', position: 20, balance: 5500 },
      ],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.PORT_SPLIT_RENT);
    expect(events[0]).toMatchObject({
      payerId: 'p1',
      receiverIds: ['p2', 'p3'],
      cellIndex: 5,
      totalAmount: 1000,
      amountPerReceiver: 500,
    });
  });

  it('TC-330.05 [UC-SYNTH/A4] Empty delta without balance or position shifts returns empty array', () => {
    const prev = createMockGameState();
    const next = createMockGameState();
    const delta: DeltaPayload = {
      tick: 50,
      cells: [],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events).toBeDefined();
    expect(events).toHaveLength(0);
    expect(Array.isArray(events)).toBe(true);
  });

  it('TC-330.06 [UC-SYNTH/A5] Insolvent debtor paying partial rent returns structured PARTIAL_RENT event with remainingDebt', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 0, p2: 5 },
      playersInfo: {
        p1: { id: 'p1', name: 'Debtor', balance: 200, isBot: false },
        p2: { id: 'p2', name: 'Landlord', balance: 5000, isBot: false, ownedProperties: [1] },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 1, p2: 5 },
      playersInfo: {
        p1: { id: 'p1', name: 'Debtor', balance: -300, isBot: false },
        p2: { id: 'p2', name: 'Landlord', balance: 5200, isBot: false, ownedProperties: [1] },
      },
    });
    const delta: DeltaPayload = {
      tick: 60,
      cells: [],
      players: [
        { id: 'p1', position: 1, balance: -300 },
        { id: 'p2', position: 5, balance: 5200 },
      ],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.PARTIAL_RENT);
    expect(events[0]).toMatchObject({
      payerId: 'p1',
      receiverId: 'p2',
      paidAmount: 200,
      remainingDebt: 300,
      cellIndex: 1,
    });
  });

  it('TC-330.07 [UC-SYNTH/A6] Subtractive Net-Delta Collision emits both GO_SALARY and RENT_PAID in causal order', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 38, p2: 10 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, isBot: false },
        p2: { id: 'p2', name: 'Player 2', balance: 5000, isBot: false, ownedProperties: [1] },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 1, p2: 10 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 4500, isBot: false },
        p2: { id: 'p2', name: 'Player 2', balance: 7500, isBot: false, ownedProperties: [1] },
      },
    });
    const delta: DeltaPayload = {
      tick: 70,
      roundNumber: 1,
      passedGoSalary: 2000,
      cells: [],
      players: [
        { id: 'p1', position: 1, balance: 4500 },
        { id: 'p2', position: 10, balance: 7500 },
      ],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events).toHaveLength(2);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.GO_SALARY);
    expect(events[1]?.type).toBe(SynthesizedGameEventType.RENT_PAID);
    expect(events[1]).toMatchObject({
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 1,
      amount: 2500,
    });
  });

  it('TC-330.08 [UC-SYNTH/A7] Government fee on Cell 4 Land Tax returns FEE_PAID with cellIndex attribution', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 0 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, isBot: false },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 4 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 4000, isBot: false },
      },
    });
    const delta: DeltaPayload = {
      tick: 80,
      cells: [],
      players: [{ id: 'p1', position: 4, balance: 4000 }],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.FEE_PAID);
    expect(events[0]).toMatchObject({
      payerId: 'p1',
      feeType: 'LAND_TAX',
      amount: 1000,
      cellIndex: 4,
    });
  });

  it('TC-330.09 [UC-SYNTH/A8] Subtractive Polarity Inversion flips player from receivers to payers emitting both GO_SALARY and RENT_PAID', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 38, p2: 10 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, isBot: false },
        p2: { id: 'p2', name: 'Player 2', balance: 5000, isBot: false, ownedProperties: [1] },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 1, p2: 10 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5500, isBot: false },
        p2: { id: 'p2', name: 'Player 2', balance: 6500, isBot: false, ownedProperties: [1] },
      },
    });
    const delta: DeltaPayload = {
      tick: 90,
      roundNumber: 1,
      passedGoSalary: 2000,
      cells: [],
      players: [
        { id: 'p1', position: 1, balance: 5500 },
        { id: 'p2', position: 10, balance: 6500 },
      ],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events).toHaveLength(2);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.GO_SALARY);
    expect(events[1]?.type).toBe(SynthesizedGameEventType.RENT_PAID);
    expect(events[1]).toMatchObject({
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 1,
      amount: 1500,
    });
  });

  it('TC-330.10 [UC-SYNTH/A9] Zero Net Shift Collision seeds player and emits both GO_SALARY and RENT_PAID without dropping', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 38, p2: 10 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, isBot: false },
        p2: { id: 'p2', name: 'Player 2', balance: 5000, isBot: false, ownedProperties: [1] },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 1, p2: 10 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, isBot: false },
        p2: { id: 'p2', name: 'Player 2', balance: 7000, isBot: false, ownedProperties: [1] },
      },
    });
    const delta: DeltaPayload = {
      tick: 100,
      roundNumber: 1,
      passedGoSalary: 2000,
      cells: [],
      players: [
        { id: 'p1', position: 1, balance: 5000 },
        { id: 'p2', position: 10, balance: 7000 },
      ],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events).toHaveLength(2);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.GO_SALARY);
    expect(events[1]?.type).toBe(SynthesizedGameEventType.RENT_PAID);
    expect(events[1]).toMatchObject({
      payerId: 'p1',
      receiverId: 'p2',
      cellIndex: 1,
      amount: 2000,
    });
  });

  it('TC-330.11 [UC-SYNTH/A10] Incarceration teleport from cell 30 to cell 10 suppresses phantom GO salary', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 30 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, isBot: false, inAudit: false },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 10 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, isBot: false, inAudit: true },
      },
    });
    const delta: DeltaPayload = {
      tick: 105,
      cells: [],
      players: [{ id: 'p1', position: 10, balance: 5000, inAudit: true, auditTurnsLeft: 3 }],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    const goEvents = events.filter((e) => e.type === SynthesizedGameEventType.GO_SALARY);
    expect(goEvents).toHaveLength(0);
    expect(events).toHaveLength(0);
  });

  it('TC-330.12 [UC-SYNTH/A11] Government fee for Cell 10 Bail payment returns FEE_PAID with BAIL feeType', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 10 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, isBot: false, inAudit: true, auditTurnsLeft: 1, auditCount: 1 },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 10 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 4500, isBot: false, inAudit: false, auditTurnsLeft: 0 },
      },
    });
    const delta: DeltaPayload = {
      tick: 110,
      cells: [],
      players: [{ id: 'p1', position: 10, balance: 4500 }],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.FEE_PAID);
    expect(events[0]).toMatchObject({
      payerId: 'p1',
      feeType: 'BAIL',
      amount: 500,
      cellIndex: 10,
    });
  });

  it('TC-330.13 [UC-SYNTH/A12] Telecom fee for Cell 28 Viettel returns FEE_PAID with receiver attribution', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 0, p2: 10 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, isBot: false },
        p2: { id: 'p2', name: 'Player 2', balance: 5000, isBot: false, ownedProperties: [28] },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 7, p2: 10 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 4850, isBot: false },
        p2: { id: 'p2', name: 'Player 2', balance: 5150, isBot: false, ownedProperties: [28] },
      },
    });
    const delta: DeltaPayload = {
      tick: 120,
      cells: [],
      players: [
        { id: 'p1', position: 7, balance: 4850 },
        { id: 'p2', position: 10, balance: 5150 },
      ],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.FEE_PAID);
    expect(events[0]).toMatchObject({
      payerId: 'p1',
      feeType: 'TELECOM_DATA',
      amount: TELECOM_DATA_FEE,
      receiverId: 'p2',
      cellIndex: 28,
    });
  });

  it('TC-330.14 [UC-SYNTH/A13] Dynamic Triad - Successive syntheses remain strictly pure and idempotent without cross-tick memory leak', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 0, p2: 5 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, isBot: false },
        p2: { id: 'p2', name: 'Player 2', balance: 5000, isBot: false, ownedProperties: [1] },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 1, p2: 5 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 4500, isBot: false },
        p2: { id: 'p2', name: 'Player 2', balance: 5500, isBot: false, ownedProperties: [1] },
      },
    });
    const delta: DeltaPayload = {
      tick: 130,
      cells: [],
      players: [
        { id: 'p1', position: 1, balance: 4500 },
        { id: 'p2', position: 5, balance: 5500 },
      ],
    };

    const firstRun = synthesizeGameEvents(prev, next, delta);
    const secondRun = synthesizeGameEvents(prev, next, delta);

    expect(firstRun).toHaveLength(1);
    expect(secondRun).toHaveLength(1);
    expect(firstRun[0]).toEqual(secondRun[0]);
  });

  it('TC-330.15 [UC-SYNTH/A14] Timestamp fallback precedence respects options.baseTimestamp over delta.tick', () => {
    const prev = createMockGameState();
    const next = createMockGameState();
    const delta: DeltaPayload = {
      tick: 999,
      cells: [],
      lastDiplomaticEvent: {
        playerId: 'p1',
        landlordId: 'p2',
        cellIndex: 6,
        savedRent: 500,
      },
    };
    const options: SynthesizerOptions = { baseTimestamp: 1728000000000 };

    const withExplicitTimestamp = synthesizeGameEvents(prev, next, delta, options);
    const withTickFallback = synthesizeGameEvents(prev, next, delta);

    expect(withExplicitTimestamp[0]?.timestamp).toBe(1728000000000);
    expect(withTickFallback[0]?.timestamp).toBe(999);
  });

  it('TC-330.16 [UC-SYNTH/A15] Causal order invariant guarantees GO_SALARY precedes FEE_PAID in complex tick', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 5000, isBot: false },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 4 },
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1', balance: 6000, isBot: false },
      },
    });
    const delta: DeltaPayload = {
      tick: 140,
      roundNumber: 1,
      passedGoSalary: 2000,
      cells: [],
      players: [{ id: 'p1', position: 4, balance: 6000 }],
    };

    const events = synthesizeGameEvents(prev, next, delta);

    expect(events).toHaveLength(2);
    expect(events[0]?.type).toBe(SynthesizedGameEventType.GO_SALARY);
    expect(events[1]?.type).toBe(SynthesizedGameEventType.FEE_PAID);
  });
});
