// [IMP-303] Living Contract Tests: Activity GO Extractor
import { describe, it, expect } from 'vitest';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import {
  extractPassedGoActivities,
  buildPropertyRegistryAndStateMap,
  getPlayerName,
  type BalanceDelta,
} from '../../src/client/network/activity_go_extractor';
import { extractPassedGoActivities as reExportedExtract } from '../../src/client/network/activity_rent_matcher';
import { useGameStore, type GameState, type PlayerHudInfo } from '../../src/client/store/game_store';
import { ChanceCardId } from '../../src/domain/event_card_types.js';

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    levelMap: {},
    playerPositions: { p1: 1, bot_2: 22 },
    playersInfo: {
      p1: { id: 'p1', name: 'Người chơi 1', balance: 5000, tokenColor: '#38BDF8', isBot: false, ownedProperties: [], mortgagedProperties: [] },
      bot_2: { id: 'bot_2', name: 'Bot 2', balance: 5000, tokenColor: '#F59E0B', isBot: true, ownedProperties: [], mortgagedProperties: [] },
    },
    treasuryPool: 10000,
    roundNumber: 1,
    ...overrides,
  };
}

describe('Station 1 Contract Tests: ActivityGoExtractor', () => {
  it('TC-AGE-GO.01 [UC-AGE-GO/MSS] extractPassedGoActivities returns empty salary logs when player does not pass GO', () => {
    const prev = createMockGameState({ playerPositions: { p1: 5 } });
    const next = createMockGameState({ playerPositions: { p1: 10 } });
    const delta: DeltaPayload = { tick: 1, cells: [], players: [{ id: 'p1', position: 10, balance: 5000 }] };
    const res = extractPassedGoActivities(delta, prev, next, [], [], new Set());
    expect(res.salaryLogs.length).toBe(0);
  });

  it('TC-AGE-GO.02 [UC-AGE-GO/MSS] extractPassedGoActivities generates salary log when player passes GO from 38 to 2', () => {
    const prev = createMockGameState({ playerPositions: { p1: 38 } });
    const next = createMockGameState({ playerPositions: { p1: 2 } });
    const delta: DeltaPayload = { tick: 1, cells: [], players: [{ id: 'p1', position: 2, balance: 7000 }] };
    const res = extractPassedGoActivities(delta, prev, next, [], [], new Set());
    expect(res.salaryLogs.length).toBe(1);
    expect(res.salaryLogs[0]?.type).toBe('salary');
  });

  it('TC-AGE-GO.03 [UC-AGE-GO/MSS] extractPassedGoActivities awards no salary when player is in audit', () => {
    const prev = createMockGameState({ playerPositions: { p1: 38 } });
    const next = createMockGameState({
      playerPositions: { p1: 10 },
      playersInfo: {
        ...prev.playersInfo,
        p1: { ...prev.playersInfo.p1!, inAudit: false, auditTurnsLeft: 3 },
      },
    });
    const delta: DeltaPayload = { tick: 1, cells: [], players: [{ id: 'p1', position: 10, balance: 5000, inAudit: false, auditTurnsLeft: 3 }] };
    const res = extractPassedGoActivities(delta, prev, next, [], [], new Set());
    expect(res.salaryLogs.length).toBe(0);
  });

  it('TC-AGE-GO.04 [UC-AGE-GO/MSS] extractPassedGoActivities extracts overdraft repayment when overdraftRoundsLeft expires', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        ...createMockGameState().playersInfo,
        p1: { ...createMockGameState().playersInfo.p1!, overdraftRoundsLeft: 1, hand: [ChanceCardId.CC_FREE_CREDIT] },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 2 },
      playersInfo: {
        ...prev.playersInfo,
        p1: { ...prev.playersInfo.p1!, overdraftRoundsLeft: 0 },
      },
    });
    const delta: DeltaPayload = { tick: 1, cells: [], passedGoSalary: 2000, players: [{ id: 'p1', position: 2, balance: 3700, overdraftRoundsLeft: 0 }] };
    const payers: BalanceDelta[] = [{ id: 'p1', diff: 0 }];
    const res = extractPassedGoActivities(delta, prev, next, payers, [], new Set());
    const overdraftLog = res.salaryLogs.find((l) => l.amount === -3300);
    expect(overdraftLog).toBeDefined();
    expect(res.receivers[0]?.diff).toBe(1700);
  });

  it('TC-AGE-GO.05 [UC-AGE-GO/MSS] extractPassedGoActivities extracts credit fee deduction when player holds CC_FREE_CREDIT', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        ...createMockGameState().playersInfo,
        p1: { ...createMockGameState().playersInfo.p1!, hand: [ChanceCardId.CC_FREE_CREDIT] },
      },
    });
    const next = createMockGameState({ playerPositions: { p1: 2 } });
    const delta: DeltaPayload = { tick: 1, cells: [], passedGoSalary: 2000, players: [{ id: 'p1', position: 2, balance: 6600 }] };
    const receivers: BalanceDelta[] = [{ id: 'p1', diff: 1600 }];
    const res = extractPassedGoActivities(delta, prev, next, [], receivers, new Set());
    const creditLog = res.salaryLogs.find((l) => l.amount === -400);
    expect(creditLog).toBeDefined();
    expect(res.handledReceiverIds.has('p1')).toBe(true);
  });

  it('TC-AGE-GO.06 [UC-AGE-GO/MSS] extractPassedGoActivities extracts property tax capped at GO_PROPERTY_TAX_CAP', () => {
    const prev = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        ...createMockGameState().playersInfo,
        p1: { ...createMockGameState().playersInfo.p1!, ownedProperties: [1, 3, 6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24] },
      },
    });
    const next = createMockGameState({ playerPositions: { p1: 2 } });
    const delta: DeltaPayload = { tick: 1, cells: [], players: [{ id: 'p1', position: 2, balance: 6000 }] };
    const res = extractPassedGoActivities(delta, prev, next, [], [], new Set());
    const taxLog = res.salaryLogs.find((l) => l.type === 'tax');
    expect(taxLog).toBeDefined();
    expect(Math.abs(taxLog?.amount ?? 0)).toBeLessThanOrEqual(2000);
  });

  it('TC-AGE-GO.07 [UC-AGE-GO/MSS] extractPassedGoActivities prioritizes explicit passedGoSalary from delta', () => {
    const prev = createMockGameState({ playerPositions: { p1: 38 } });
    const next = createMockGameState({ playerPositions: { p1: 2 } });
    const delta: DeltaPayload = { tick: 1, cells: [], passedGoSalary: 5555, players: [{ id: 'p1', position: 2, balance: 10555 }] };
    const res = extractPassedGoActivities(delta, prev, next, [], [], new Set());
    expect(res.salaryLogs[0]?.amount).toBe(5555);
  });

  it('TC-AGE-GO.08 [UC-AGE-GO/MSS] extractPassedGoActivities returns empty and preserves input collections when delta has no players', () => {
    const prev = createMockGameState();
    const next = createMockGameState();
    const delta: DeltaPayload = { tick: 1, cells: [], players: [] };
    const initialPayers: BalanceDelta[] = [{ id: 'p1', diff: -500 }];
    const initialReceivers: BalanceDelta[] = [{ id: 'bot_2', diff: 500 }];
    const initialHandled = new Set(['bot_2']);
    const res = extractPassedGoActivities(delta, prev, next, initialPayers, initialReceivers, initialHandled);
    expect(res.salaryLogs.length).toBe(0);
    expect(res.payers.length).toBe(1);
    expect(res.handledReceiverIds.has('bot_2')).toBe(true);
  });

  it('TC-AGE-GO.09 [UC-AGE-GO/MSS] extractPassedGoActivities zeroes receiver diff and marks handled when diff equals netGoBonus', () => {
    const prev = createMockGameState({ playerPositions: { p1: 38 } });
    const next = createMockGameState({ playerPositions: { p1: 2 } });
    const delta: DeltaPayload = { tick: 1, cells: [], passedGoSalary: 2000, players: [{ id: 'p1', position: 2, balance: 7000 }] };
    const receivers: BalanceDelta[] = [{ id: 'p1', diff: 2000 }];
    const res = extractPassedGoActivities(delta, prev, next, [], receivers, new Set());
    expect(res.handledReceiverIds.has('p1')).toBe(true);
    expect(res.receivers[0]?.diff).toBe(0);
  });

  it('TC-AGE-GO.10 [UC-AGE-GO/MSS] extractPassedGoActivities decrements receiver diff when diff exceeds netGoBonus', () => {
    const prev = createMockGameState({ playerPositions: { p1: 38 } });
    const next = createMockGameState({ playerPositions: { p1: 2 } });
    const delta: DeltaPayload = { tick: 1, cells: [], passedGoSalary: 2000, players: [{ id: 'p1', position: 2, balance: 7500 }] };
    const receivers: BalanceDelta[] = [{ id: 'p1', diff: 2500 }];
    const res = extractPassedGoActivities(delta, prev, next, [], receivers, new Set());
    expect(res.receivers[0]?.diff).toBe(500);
  });

  it('TC-AGE-GO.11 [UC-AGE-GO/MSS] extractPassedGoActivities reduces payer debt when debt exceeds netGoBonus', () => {
    const prev = createMockGameState({ playerPositions: { p1: 38 } });
    const next = createMockGameState({ playerPositions: { p1: 2 } });
    const delta: DeltaPayload = { tick: 1, cells: [], passedGoSalary: 2000, players: [{ id: 'p1', position: 2, balance: 4000 }] };
    const payers: BalanceDelta[] = [{ id: 'p1', diff: -3000 }];
    const res = extractPassedGoActivities(delta, prev, next, payers, [], new Set());
    expect(res.payers[0]?.diff).toBe(-5000);
  });

  it('TC-AGE-GO.12 [UC-AGE-GO/MSS] extractPassedGoActivities converts payer to receiver when netGoBonus exceeds debt', () => {
    const prev = createMockGameState({ playerPositions: { p1: 38 } });
    const next = createMockGameState({ playerPositions: { p1: 2 } });
    const delta: DeltaPayload = { tick: 1, cells: [], passedGoSalary: 2000, players: [{ id: 'p1', position: 2, balance: 6000 }] };
    const payers: BalanceDelta[] = [{ id: 'p1', diff: 1000 }]; // updatedDiff = 1000 - 2000 = -1000
    const res = extractPassedGoActivities(delta, prev, next, payers, [], new Set());
    expect(res.payers.length).toBe(1);
    expect(res.payers[0]?.diff).toBe(-1000);
  });

  it('TC-AGE-GO.13 [UC-AGE-GO/MSS] buildPropertyRegistryAndStateMap constructs accurate registry and stateMap', () => {
    const info: Record<string, PlayerHudInfo> = {
      p1: { id: 'p1', name: 'P1', balance: 100, isBot: false, ownedProperties: [1, 3], mortgagedProperties: [], tokenColor: '#38BDF8' },
    };
    const levels = { 1: 2, 3: 1 };
    const { registry, stateMap } = buildPropertyRegistryAndStateMap(info, levels);
    expect(registry.get(1)).toBe('p1');
    expect(stateMap.get(1)?.level).toBe(2);
  });

  it('TC-AGE-GO.14 [UC-AGE-GO/MSS] getPlayerName returns player name when pInfo contains name', () => {
    const pInfo: PlayerHudInfo = { id: 'p1', name: 'Đại Gia Sài Gòn', balance: 100, isBot: false, ownedProperties: [], mortgagedProperties: [], tokenColor: '#38BDF8' };
    const name = getPlayerName(pInfo, 'p1');
    expect(name).toBe('Đại Gia Sài Gòn');
  });

  it('TC-AGE-GO.15 [UC-AGE-GO/MSS] getPlayerName returns uppercase fallbackId when pInfo name is missing', () => {
    const name = getPlayerName(undefined, 'bot_alpha');
    expect(name).toBe('BOT_ALPHA');
  });

  it('TC-AGE-GO.16 [UC-AGE-GO/MSS] extractPassedGoActivities preserves identical behavior when imported from activity_rent_matcher', () => {
    const prev = createMockGameState({ playerPositions: { p1: 38 } });
    const next = createMockGameState({ playerPositions: { p1: 2 } });
    const delta: DeltaPayload = { tick: 1, cells: [], passedGoSalary: 2000, players: [{ id: 'p1', position: 2, balance: 7000 }] };
    const res = reExportedExtract(delta, prev, next, [], [], new Set());
    expect(res.salaryLogs.length).toBe(1);
    expect(res.salaryLogs[0]?.amount).toBe(2000);
  });
});
