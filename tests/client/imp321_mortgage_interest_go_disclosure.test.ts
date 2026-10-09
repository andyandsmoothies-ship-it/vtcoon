// [TC-321.01..TC-321.06][UC-MORT-GO] Causal Disclosure for Mortgage Interest on Passing GO Contract Suite
import { describe, it, expect, beforeEach } from 'vitest';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import {
  extractPassedGoActivities,
  type BalanceDelta,
} from '../../src/client/network/activity_go_extractor';
import {
  handleTaxBadge,
  clearPendingBadgeTimers,
} from '../../src/client/network/activity_badge_dispatcher';
import { resolveFormulaText } from '../../src/client/ui/transaction_formula';
import {
  useGameStore,
  type GameState,
  type FloatingTextItem,
  FloatingTextType,
} from '../../src/client/store/game_store';
import { type ActivityLogEntry } from '../../src/client/store/activity_store';
import { MarketCardId } from '../../src/domain/event_card_types.js';

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    levelMap: {},
    playerPositions: { p1: 1, bot_2: 22 },
    playersInfo: {
      p1: {
        id: 'p1',
        name: 'Người chơi 1',
        balance: 5000,
        tokenColor: '#38BDF8',
        isBot: false,
        ownedProperties: [1],
        mortgagedProperties: [],
      },
      bot_2: {
        id: 'bot_2',
        name: 'Bot 2',
        balance: 5000,
        tokenColor: '#F59E0B',
        isBot: true,
        ownedProperties: [],
        mortgagedProperties: [],
      },
    },
    treasuryPool: 10000,
    roundNumber: 1,
    ...overrides,
  };
}

describe('Station 1 Contract Suite: IMP-321 Mortgage Interest GO Disclosure', () => {
  beforeEach(() => {
    clearPendingBadgeTimers();
  });

  it('TC-321.01 [UC-MORT-GO/MSS]: Given player p1 with mortgaged cell 1 passing GO, When extractPassedGoActivities runs, Then logs structured mortgage interest deduction of 5% debt and includes it in totalGoDeductions', () => {
    const base = createMockGameState();
    const prev = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        ...base.playersInfo,
        p1: {
          ...base.playersInfo.p1!,
          ownedProperties: [1],
          mortgagedProperties: [1],
        },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 2 },
      playersInfo: { ...prev.playersInfo },
    });
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      passedGoSalary: 2000,
      players: [{ id: 'p1', position: 2, balance: 6985 }],
    };
    const initialReceivers: BalanceDelta[] = [{ id: 'p1', diff: 1985 }];

    const res = extractPassedGoActivities(delta, prev, next, [], initialReceivers, new Set());
    const mortLog = res.salaryLogs.find((l) => l.message.includes('lãi thế chấp'));

    expect(mortLog).toBeDefined();
    expect(mortLog?.amount).toBe(-15);
    expect(mortLog?.message).toBe('🏦 Người chơi 1 đã nộp 15 lãi thế chấp qua GO (5% nợ)');
    expect(res.handledReceiverIds.has('p1')).toBe(true);
  });

  it('TC-321.02 [UC-MORT-GO/MSS]: Given active MC_RATE_HIKE modifier, When player passes GO with mortgaged property, Then calculates 10% mortgage interest deduction with rate hike disclosure', () => {
    const base = createMockGameState();
    const prev = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        ...base.playersInfo,
        p1: {
          ...base.playersInfo.p1!,
          ownedProperties: [1],
          mortgagedProperties: [1],
        },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 2 },
      playersInfo: { ...prev.playersInfo },
    });
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      passedGoSalary: 2000,
      activeModifiers: [
        { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 2 },
      ],
      players: [{ id: 'p1', position: 2, balance: 6970 }],
    };
    const initialReceivers: BalanceDelta[] = [{ id: 'p1', diff: 1970 }];

    const res = extractPassedGoActivities(delta, prev, next, [], initialReceivers, new Set());
    const mortLog = res.salaryLogs.find((l) => l.message.includes('lãi thế chấp'));

    expect(mortLog).toBeDefined();
    expect(mortLog?.amount).toBe(-30);
    expect(mortLog?.message).toBe('🏦 Người chơi 1 đã nộp 30 lãi thế chấp qua GO (10% nợ)');
    expect(res.handledReceiverIds.has('p1')).toBe(true);
  });

  it('TC-321.03 [UC-MORT-GO/A1]: Given player with 0 mortgaged properties, When passing GO, Then generates zero mortgage interest logs', () => {
    const base = createMockGameState();
    const prev = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        ...base.playersInfo,
        p1: {
          ...base.playersInfo.p1!,
          ownedProperties: [1],
          mortgagedProperties: [],
        },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 2 },
      playersInfo: { ...prev.playersInfo },
    });
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      passedGoSalary: 2000,
      players: [{ id: 'p1', position: 2, balance: 7000 }],
    };

    const res = extractPassedGoActivities(delta, prev, next, [], [{ id: 'p1', diff: 2000 }], new Set());
    const mortLogs = res.salaryLogs.filter((l) => l.message.includes('lãi thế chấp'));

    expect(mortLogs.length).toBe(0);
    expect(res.salaryLogs.length).toBe(1);
    expect(res.salaryLogs[0]?.type).toBe('salary');
  });

  it('TC-321.04 [UC-MORT-GO/A2]: Given player with custom mortgageLoan override, When passing GO, Then calculates interest strictly against recorded loan principal', () => {
    const base = createMockGameState();
    const prev = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        ...base.playersInfo,
        p1: {
          ...base.playersInfo.p1!,
          ownedProperties: [1],
          mortgagedProperties: [1],
          mortgageLoans: { 1: 500 },
        },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 2 },
      playersInfo: { ...prev.playersInfo },
    });
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      passedGoSalary: 2000,
      players: [{ id: 'p1', position: 2, balance: 6975 }],
    };
    const initialReceivers: BalanceDelta[] = [{ id: 'p1', diff: 1975 }];

    const res = extractPassedGoActivities(delta, prev, next, [], initialReceivers, new Set());
    const mortLog = res.salaryLogs.find((l) => l.message.includes('lãi thế chấp'));

    expect(mortLog).toBeDefined();
    expect(mortLog?.amount).toBe(-25);
    expect(mortLog?.message).toBe('🏦 Người chơi 1 đã nộp 25 lãi thế chấp qua GO (5% nợ)');
    expect(res.handledReceiverIds.has('p1')).toBe(true);
  });

  it('TC-321.05 [UC-MORT-GO/MSS]: Given active MC_CREDIT_STIMULUS modifier, When player passes GO with mortgaged property, Then exempts interest to 0% matching server SSOT', () => {
    const base = createMockGameState();
    const prev = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: {
        ...base.playersInfo,
        p1: {
          ...base.playersInfo.p1!,
          ownedProperties: [1],
          mortgagedProperties: [1],
        },
      },
    });
    const next = createMockGameState({
      playerPositions: { p1: 2 },
      playersInfo: { ...prev.playersInfo },
    });
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      passedGoSalary: 2000,
      activeModifiers: [
        { type: MarketCardId.MC_CREDIT_STIMULUS, affectedCells: [], remainingRounds: 1 },
      ],
      players: [{ id: 'p1', position: 2, balance: 7000 }],
    };

    const res = extractPassedGoActivities(delta, prev, next, [], [{ id: 'p1', diff: 2000 }], new Set());
    const mortLogs = res.salaryLogs.filter((l) => l.message.includes('lãi thế chấp'));

    expect(mortLogs.length).toBe(0);
    expect(res.handledReceiverIds.has('p1')).toBe(true);
    expect(res.receivers[0]?.diff).toBe(0);
  });

  it('TC-321.06 [UC-MORT-GO/MSS]: Given mortgage interest activity log, When handleTaxBadge dispatches and resolveFormulaText evaluates, Then floating text receives title "Nộp Lãi Thế Chấp Qua GO ➔ Kho Bạc" and resolves formula "Lãi vay thế chấp qua GO (5%-10% nợ)"', () => {
    type FloatingInput = Parameters<GameState['addFloatingText']>[0];
    let capturedFloatingText: FloatingInput | undefined;
    const mockState: GameState = {
      ...createMockGameState(),
      addFloatingText: (item: FloatingInput) => {
        capturedFloatingText = item;
      },
    };

    const act: ActivityLogEntry = {
      id: 'mort_interest_123_p1',
      timestamp: 1000,
      type: 'tax',
      message: '🏦 Người chơi 1 đã nộp 15 lãi thế chấp qua GO (5% nợ)',
      amount: -15,
      cellIndex: 0,
      playerId: 'p1',
      playerName: 'Người chơi 1',
    };

    handleTaxBadge(act, mockState);

    expect(capturedFloatingText).toBeDefined();
    expect(capturedFloatingText?.title).toBe('Nộp Lãi Thế Chấp Qua GO ➔ Kho Bạc');
    const dummyItem: FloatingTextItem = {
      id: capturedFloatingText?.id ?? 'temp_id',
      timestamp: 1000,
      playerId: capturedFloatingText?.playerId ?? 'p1',
      text: capturedFloatingText?.text ?? '',
      type: capturedFloatingText?.type ?? FloatingTextType.Penalty,
      title: capturedFloatingText?.title,
      actionType: capturedFloatingText?.actionType,
      cellIndex: capturedFloatingText?.cellIndex,
    };
    const formula = resolveFormulaText(dummyItem, '', false);
    expect(formula).toBe('Lãi vay thế chấp qua GO (5%-10% nợ)');
    expect(capturedFloatingText?.cellIndex).toBe(0);
  });
});
