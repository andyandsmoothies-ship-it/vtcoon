// [TC-289.01..TC-289.08/MSS][UC-IMP289] Disambiguate Pass-GO Debts, Property Taxes & Financial Notifications Contract Suite
// Strict Iron Laws Conformance: Zero dirty casts, 1-4 asserts per test, living tests <= 600 LOC.
import { describe, it, expect, beforeEach } from 'vitest';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import {
  useGameStore,
  type GameState,
  type PlayerHudInfo,
  type FloatingTextItem,
  FloatingTextType,
} from '../../src/client/store/game_store.js';
import { ChanceCardId } from '../../src/domain/event_card_types.js';
import {
  extractPassedGoActivities,
  processPayerFee,
  type BalanceDelta,
  type PropertyFinancialContext,
} from '../../src/client/network/activity_rent_matcher.js';
import {
  handleTaxBadge,
  dispatchActivityFloatingBadges,
  clearPendingBadgeTimers,
} from '../../src/client/network/activity_badge_dispatcher.js';
import {
  resolveTransactionNarrative,
  type TransactionNarrative,
} from '../../src/client/ui/transaction_narrative.js';
import type { ActivityLogEntry } from '../../src/client/store/activity_store.js';

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    ...overrides,
  };
}

function createPlayerHudInfo(
  overrides: Partial<PlayerHudInfo> & { readonly id: string; readonly name: string }
): PlayerHudInfo {
  return {
    balance: 10_000,
    tokenColor: '#38BDF8',
    ownedProperties: [],
    mortgagedProperties: [],
    ...overrides,
  };
}

function createDelta(
  players: readonly {
    readonly id: string;
    readonly position: number;
    readonly balance: number;
    readonly overdraftRoundsLeft?: number;
    readonly hand?: readonly ChanceCardId[];
  }[],
  extra?: Partial<DeltaPayload>
): DeltaPayload {
  return {
    tick: 1,
    cells: [],
    players: players.map((p) => ({
      id: p.id,
      position: p.position,
      balance: p.balance,
      overdraftRoundsLeft: p.overdraftRoundsLeft,
      hand: p.hand,
    })),
    ...extra,
  };
}

const emptyContext: PropertyFinancialContext = {
  boughtCellIndices: [],
  buyoutCellIndices: [],
  upgradedCells: [],
  mortgagedCells: [],
  unmortgagedCells: [],
};

describe('[CONTRACT] IMP-289: Disambiguate Pass-GO Debts, Property Taxes & Financial Notifications', () => {
  beforeEach(() => {
    clearPendingBadgeTimers();
  });

  // --------------------------------------------------------------------------
  // TC-289.01 [UC-IMP289/MSS]: Pass GO with CC_OVERDRAFT expiration
  // --------------------------------------------------------------------------
  it('[TC-289.01/MSS][UC-IMP289] Pass GO with CC_OVERDRAFT expiration (-3300) and salary (+2000), extractPassedGoActivities generates two separate entries for salary (+2000) and overdraft repayment (-3300)', () => {
    const p1Prev = createPlayerHudInfo({ id: 'p1', name: 'Đại Gia', balance: 10_000, overdraftRoundsLeft: 1 });
    const p1Next = createPlayerHudInfo({ id: 'p1', name: 'Đại Gia', balance: 8_700, overdraftRoundsLeft: 0 });
    const prevState = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: { p1: p1Prev },
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 5 },
      playersInfo: { p1: p1Next },
    });
    const delta = createDelta([{ id: 'p1', position: 5, balance: 8_700, overdraftRoundsLeft: 0 }]);
    const initialPayers: readonly BalanceDelta[] = [{ id: 'p1', diff: -1_300, pInfo: p1Prev, cellIndex: 5 }];

    const result = extractPassedGoActivities(delta, prevState, nextState, initialPayers, [], new Set());
    const salaryLog = result.salaryLogs.find((l) => l.amount === 2_000);
    const overdraftLog = result.salaryLogs.find((l) => l.amount === -3_300);

    expect(salaryLog).toBeDefined();
    expect(salaryLog?.type).toBe('salary');
    expect(overdraftLog).toBeDefined();
    expect(overdraftLog?.message).toMatch(/thấu chi/i);
  });

  // --------------------------------------------------------------------------
  // TC-289.02 [UC-IMP289/MSS]: Pass GO holding CC_FREE_CREDIT
  // --------------------------------------------------------------------------
  it('[TC-289.02/MSS][UC-IMP289] Pass GO holding CC_FREE_CREDIT (-400), extractPassedGoActivities extracts interest deduction (-400) independently from salary', () => {
    const p1Prev = createPlayerHudInfo({ id: 'p1', name: 'Đại Gia', balance: 10_000, hand: [ChanceCardId.CC_FREE_CREDIT] });
    const p1Next = createPlayerHudInfo({ id: 'p1', name: 'Đại Gia', balance: 11_600, hand: [ChanceCardId.CC_FREE_CREDIT] });
    const prevState = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: { p1: p1Prev },
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 5 },
      playersInfo: { p1: p1Next },
    });
    const delta = createDelta([{ id: 'p1', position: 5, balance: 11_600, hand: [ChanceCardId.CC_FREE_CREDIT] }]);
    const initialReceivers: readonly BalanceDelta[] = [{ id: 'p1', diff: 1_600, pInfo: p1Next, cellIndex: 5 }];

    const result = extractPassedGoActivities(delta, prevState, nextState, [], initialReceivers, new Set());
    const salaryLog = result.salaryLogs.find((l) => l.amount === 2_000);
    const interestLog = result.salaryLogs.find((l) => l.amount === -400);

    expect(salaryLog).toBeDefined();
    expect(interestLog).toBeDefined();
    expect(interestLog?.message).toMatch(/lãi|tín dụng|CC_FREE_CREDIT/i);
  });

  // --------------------------------------------------------------------------
  // TC-289.03 [UC-IMP289/MSS]: Pass GO with properties subject to property tax
  // --------------------------------------------------------------------------
  it('[TC-289.03/MSS][UC-IMP289] Pass GO with buildings subject to property tax, extractPassedGoActivities extracts property tax with cellIndex: 0 and message containing "Thuế Tài Sản Qua GO"', () => {
    const p1Prev = createPlayerHudInfo({ id: 'p1', name: 'Đại Gia', balance: 10_000, ownedProperties: [1, 3, 6, 8] });
    const p1Next = createPlayerHudInfo({ id: 'p1', name: 'Đại Gia', balance: 11_400, ownedProperties: [1, 3, 6, 8] });
    const prevState = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: { p1: p1Prev },
      levelMap: {},
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 5 },
      playersInfo: { p1: p1Next },
      levelMap: {},
    });
    const delta = createDelta([{ id: 'p1', position: 5, balance: 11_400 }]);
    const initialReceivers: readonly BalanceDelta[] = [{ id: 'p1', diff: 1_400, pInfo: p1Next, cellIndex: 5 }];

    const result = extractPassedGoActivities(delta, prevState, nextState, [], initialReceivers, new Set());
    const taxLog = result.salaryLogs.find((l) => l.amount === -600);

    expect(taxLog).toBeDefined();
    expect(taxLog?.cellIndex).toBe(0);
    expect(taxLog?.message).toContain('Thuế Tài Sản Qua GO');
  });

  // --------------------------------------------------------------------------
  // TC-289.04 [UC-IMP289/MSS]: Multi-transaction composition on pass GO
  // --------------------------------------------------------------------------
  it('[TC-289.04/MSS][UC-IMP289] Multi-transaction composition on pass GO (Salary + Overdraft + Property Tax), sequential accounting decomposition extracts each without netting loss or drop into fallback tax', () => {
    const p1Prev = createPlayerHudInfo({ id: 'p1', name: 'Đại Gia', balance: 10_000, overdraftRoundsLeft: 1, ownedProperties: [1, 3, 6, 8] });
    const p1Next = createPlayerHudInfo({ id: 'p1', name: 'Đại Gia', balance: 8_100, overdraftRoundsLeft: 0, ownedProperties: [1, 3, 6, 8] });
    const prevState = createMockGameState({
      playerPositions: { p1: 38 },
      playersInfo: { p1: p1Prev },
      levelMap: {},
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 5 },
      playersInfo: { p1: p1Next },
      levelMap: {},
    });
    const delta = createDelta([{ id: 'p1', position: 5, balance: 8_100, overdraftRoundsLeft: 0 }]);
    const initialPayers: readonly BalanceDelta[] = [{ id: 'p1', diff: -1_900, pInfo: p1Prev, cellIndex: 5 }];

    const result = extractPassedGoActivities(delta, prevState, nextState, initialPayers, [], new Set());
    const salLog = result.salaryLogs.find((l) => l.amount === 2_000);
    const odLog = result.salaryLogs.find((l) => l.amount === -3_300);
    const taxLog = result.salaryLogs.find((l) => l.amount === -600);
    const p1RemainingPayer = result.payers.find((p) => p.id === 'p1');

    expect(salLog).toBeDefined();
    expect(odLog).toBeDefined();
    expect(taxLog).toBeDefined();
    expect(p1RemainingPayer ? p1RemainingPayer.diff : 0).toBe(0);
  });

  // --------------------------------------------------------------------------
  // TC-289.05 [UC-IMP289/MSS]: Land Fee Sole Attribution (Ô 04)
  // --------------------------------------------------------------------------
  it('[TC-289.05/MSS][UC-IMP289] Player lands on Cell 04 (currentPos === 4), processPayerFee assigns "Lệ Phí Đăng Ký Đất Đai" with cellIndex: 4', () => {
    const p1Info = createPlayerHudInfo({ id: 'p1', name: 'Đại Gia', balance: 5_000 });
    const payer4: BalanceDelta = { id: 'p1', diff: -500, pInfo: p1Info, cellIndex: 4 };
    const payerOther: BalanceDelta = { id: 'p1', diff: -500, pInfo: p1Info, cellIndex: 6 };
    const prevState = createMockGameState({ playerPositions: { p1: 4 }, playersInfo: { p1: p1Info } });
    const delta4 = createDelta([{ id: 'p1', position: 4, balance: 4_500 }]);
    const deltaOther = createDelta([{ id: 'p1', position: 6, balance: 4_500 }]);

    const res4 = processPayerFee(payer4, emptyContext, delta4, prevState);
    const resOther = processPayerFee(payerOther, emptyContext, deltaOther, prevState);

    expect(res4?.cellIndex).toBe(4);
    expect(res4?.message).toContain('Lệ Phí Đăng Ký Đất Đai');
    expect(resOther?.message).toContain('Khấu trừ tài chính phát sinh');
    expect(resOther?.message).not.toContain('Đất Đai');
  });

  // --------------------------------------------------------------------------
  // TC-289.06 [UC-IMP289/MSS]: Pass GO property tax activity passed to handleTaxBadge
  // --------------------------------------------------------------------------
  it('[TC-289.06/MSS][UC-IMP289] Pass GO property tax activity passed to handleTaxBadge produces floating text with title "Nộp Thuế Tài Sản Qua GO ➔ Kho Bạc" and DOES NOT contain "Đất Đai"', () => {
    const captured: { item?: Parameters<GameState['addFloatingText']>[0] } = {};
    const mockState = createMockGameState({
      addFloatingText: (item) => {
        captured.item = item;
      },
    });
    const act: ActivityLogEntry = {
      id: 'tax_prop_go_1',
      timestamp: Date.now(),
      type: 'tax',
      message: '🏛️ Đại Gia đã nộp thuế 1.000 Tr. (Thuế Tài Sản Qua GO)',
      playerId: 'p1',
      playerName: 'Đại Gia',
      cellIndex: 0,
      amount: -1_000,
    };

    handleTaxBadge(act, mockState);

    expect(captured.item).toBeDefined();
    expect(captured.item?.title).toBe('Nộp Thuế Tài Sản Qua GO ➔ Kho Bạc');
    expect(captured.item?.title).not.toContain('Đất Đai');
  });

  // --------------------------------------------------------------------------
  // TC-289.07 [UC-IMP289/MSS]: act.type === "system" with positive amount from Treasury stimulus
  // --------------------------------------------------------------------------
  it('[TC-289.07/MSS][UC-IMP289] act.type === "system" with positive amount from Treasury stimulus, dispatchActivityFloatingBadges calls state.addFloatingText with Reward type / stimulus action', () => {
    const captured: { item?: Parameters<GameState['addFloatingText']>[0] } = {};
    const mockState = createMockGameState({
      addFloatingText: (item) => {
        captured.item = item;
      },
    });
    const act: ActivityLogEntry = {
      id: 'stimulus_123',
      timestamp: Date.now(),
      type: 'system',
      message: '🏛️ [Kích Cầu Kho Bạc] Đại Gia đã nhận được 1.500 Tr. trợ cấp phục hồi kinh tế',
      playerId: 'p1',
      playerName: 'Đại Gia',
      amount: 1_500,
    };

    dispatchActivityFloatingBadges([act], mockState);

    expect(captured.item).toBeDefined();
    expect(captured.item?.type).toBe(FloatingTextType.Reward);
    expect(captured.item?.actionType).toBe('stimulus');
  });

  // --------------------------------------------------------------------------
  // TC-289.08 [UC-IMP289/MSS]: FloatingBadge narrative with title "Thuế Tài Sản Qua GO"
  // --------------------------------------------------------------------------
  it('[TC-289.08/MSS][UC-IMP289] FloatingBadge narrative with title "Thuế Tài Sản Qua GO" resolves formula "Thuế tài sản qua GO (Tối đa 1.000 Tr.)"', () => {
    const p1Info = createPlayerHudInfo({ id: 'p1', name: 'Đại Gia', balance: 5_000 });
    const item: FloatingTextItem = {
      id: 'ft_prop_tax_1',
      timestamp: Date.now(),
      text: '-1.000 Tr.',
      type: FloatingTextType.Penalty,
      playerId: 'p1',
      actionType: 'tax',
      title: 'Thuế Tài Sản Qua GO',
    };

    const narrative: TransactionNarrative = resolveTransactionNarrative(item, p1Info, { p1: p1Info }, 'p1');

    expect(narrative.formula).toBe('Thuế tài sản qua GO (Tối đa 1.000 Tr.)');
    expect(narrative.formula).not.toContain('2.000');
  });
});
