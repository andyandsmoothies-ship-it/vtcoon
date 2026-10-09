// [TC-319.01..TC-319.22][UC-CAUSAL] Layout-Safe Causal Disclosures & Notification Clarity Contract Suite
import { describe, it, expect } from 'vitest';
import { resolveFormulaText } from '../../src/client/ui/transaction_formula.js';
import {
  processReceiverReward,
  type PropertyFinancialContext,
  type BalanceDelta,
} from '../../src/client/network/activity_rent_matcher.js';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type GameState,
} from '../../src/client/store/game_store.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    levelMap: {},
    playerPositions: { p1: 1, bot_2: 22, bot_3: 10, bot_4: 28 },
    playersInfo: {
      p1: { id: 'p1', name: 'Người chơi 1', balance: 3940, tokenColor: '#38BDF8', isBot: false, ownedProperties: [], mortgagedProperties: [] },
      bot_2: { id: 'bot_2', name: 'Bot 2', balance: 3312, tokenColor: '#F59E0B', isBot: true, ownedProperties: [], mortgagedProperties: [] },
      bot_3: { id: 'bot_3', name: 'Bot 3', balance: 5135, tokenColor: '#10B981', isBot: true, ownedProperties: [], mortgagedProperties: [] },
      bot_4: { id: 'bot_4', name: 'Bot 4', balance: 3598, tokenColor: '#EC4899', isBot: true, ownedProperties: [], mortgagedProperties: [] },
    },
    treasuryPool: 10000,
    roundNumber: 17,
    ...overrides,
  };
}

describe('[IMP-319][UC-CAUSAL] Layout-Safe Causal Disclosures & Notification Clarity Contract Suite', () => {
  it('[TC-319.01/MSS][UC-CAUSAL] Given stimulus item with actionType stimulus, When resolveFormulaText is called, Then returns compact causal text', () => {
    const item: FloatingTextItem = {
      id: 'stimulus_toast_1',
      text: '+1.184 Tr.',
      playerId: 'bot_4',
      timestamp: 1000,
      actionType: 'stimulus',
      type: FloatingTextType.Reward,
    };
    const formula = resolveFormulaText(item, '', true);
    expect(formula).toBe('Quỹ Kho Bạc ≥10k Tr. ➔ 20% hộ nghèo');
    expect(formula.length).toBeGreaterThan(0);
  });

  it('[TC-319.02/MSS][UC-CAUSAL] Given rent payment of 9750 on cell 26 with rent3 of 6500, When resolveFormulaText is called, Then returns formula C3 (6.500 Tr.) × Độc quyền 1.5x: Hải Phòng', () => {
    const item: FloatingTextItem = {
      id: 'rent_pay_c3_monopoly',
      text: '-9.750 Tr.',
      playerId: 'p1',
      timestamp: 1000,
      actionType: 'rent_pay',
      type: FloatingTextType.Penalty,
      cellIndex: 26,
    };
    const formula = resolveFormulaText(item, 'Hải Phòng', false);
    expect(formula).toBe('C3 (6.500 Tr.) × Độc quyền 1.5x: Hải Phòng');
    expect(formula.length).toBeGreaterThan(0);
  });

  it('[TC-319.03/A1][UC-CAUSAL] Given rent payment of 624 on unbuilt cell 26 with rent0 of 312, When resolveFormulaText is called, Then returns formula C0 (312 Tr.) × Độc quyền 2x: Hải Phòng', () => {
    const item: FloatingTextItem = {
      id: 'rent_pay_c0_monopoly',
      text: '-624 Tr.',
      playerId: 'p1',
      timestamp: 1000,
      actionType: 'rent_pay',
      type: FloatingTextType.Penalty,
      cellIndex: 26,
    };
    const formula = resolveFormulaText(item, 'Hải Phòng', false);
    expect(formula).toBe('C0 (312 Tr.) × Độc quyền 2x: Hải Phòng');
    expect(formula.length).toBeGreaterThan(0);
  });

  it('[TC-319.04/A2][UC-CAUSAL] Given rent payment of 6500 on cell 26 matching base rent3, When resolveFormulaText is called, Then returns formula Công trình C3 (6.500 Tr.): Hải Phòng', () => {
    const item: FloatingTextItem = {
      id: 'rent_pay_c3_base',
      text: '-6.500 Tr.',
      playerId: 'p1',
      timestamp: 1000,
      actionType: 'rent_pay',
      type: FloatingTextType.Penalty,
      cellIndex: 26,
    };
    const formula = resolveFormulaText(item, 'Hải Phòng', false);
    expect(formula).toBe('Công trình C3 (6.500 Tr.): Hải Phòng');
    expect(formula.length).toBeGreaterThan(0);
  });

  it('[TC-319.05/A3][UC-CAUSAL] Given rent payment on EVN cell 12, When resolveFormulaText is called, Then preserves EVN utility formula without regressions', () => {
    const item: FloatingTextItem = {
      id: 'rent_pay_evn',
      text: '-1.000 Tr.',
      playerId: 'p1',
      timestamp: 1000,
      actionType: 'rent_pay',
      type: FloatingTextType.Penalty,
      cellIndex: 12,
    };
    const formula = resolveFormulaText(item, 'EVN', false);
    expect(formula).toBe('Hóa đơn tiền điện EVN khi qua ô Khởi Hành');
    expect(formula.length).toBeGreaterThan(0);
  });

  it('[TC-319.06/A4][UC-CAUSAL] Given rent payment on Viettel cell 28, When resolveFormulaText is called, Then preserves Viettel telecom formula without regressions', () => {
    const item: FloatingTextItem = {
      id: 'rent_pay_viettel',
      text: '-150 Tr.',
      playerId: 'p1',
      timestamp: 1000,
      actionType: 'rent_pay',
      type: FloatingTextType.Penalty,
      cellIndex: 28,
    };
    const formula = resolveFormulaText(item, 'Viettel', false);
    expect(formula).toBe('Cước data viễn thông Viettel (150 Tr.)');
    expect(formula.includes('Viettel')).toBe(true);
  });

  it('[TC-319.07/MSS][UC-CAUSAL] Given treasury disbursal event in activity rent matcher, When processReceiverReward runs, Then message includes compact causal attribution (Quỹ ≥10k Tr. ➔ Hộ nghèo nhất)', () => {
    const receiver: BalanceDelta = {
      id: 'bot_4',
      diff: 1184,
      cellIndex: 0,
      pInfo: {
        id: 'bot_4',
        name: 'Bot 4',
        balance: 3598,
        isBot: true,
        tokenColor: '#EC4899',
        ownedProperties: [],
      },
    };
    const context: PropertyFinancialContext = {
      boughtCellIndices: [],
      buyoutCellIndices: [],
      upgradedCells: [],
      mortgagedCells: [],
      unmortgagedCells: [],
    };
    const delta: DeltaPayload = {
      tick: 10,
      cells: [],
      players: [{ id: 'bot_4', position: 0, balance: 4782 }],
      treasury: 8816,
    };
    const prevState = createMockGameState({
      treasuryPool: 10000,
    });
    const result = processReceiverReward(receiver, context, delta, prevState);
    expect(result).not.toBeNull();
    expect(result?.message).toBe('🏛️ [Kích Cầu Kho Bạc] Bot 4 đã nhận được 1.184 trợ cấp (Quỹ ≥10k Tr. ➔ 20% hộ nghèo)');
    expect(result?.message.includes('Kích Cầu')).toBe(true);
  });

  it('[TC-319.08/A5][UC-CAUSAL] Given rent payment on cell 16 matching rent1, When resolveFormulaText is called, Then returns formula for level 1', () => {
    const item: FloatingTextItem = {
      id: 'rent_c1',
      text: '-540 Tr.',
      playerId: 'p1',
      timestamp: 1000,
      actionType: 'rent_pay',
      type: FloatingTextType.Penalty,
      cellIndex: 16,
    };
    const formula = resolveFormulaText(item, 'Nha Trang', false);
    expect(formula).toBe('Công trình C1 (540 Tr.): Nha Trang');
    expect(formula.includes('Nha Trang')).toBe(true);
  });

  it('[TC-319.09/A6][UC-CAUSAL] Given rent payment on cell 16 matching rent2, When resolveFormulaText is called, Then returns formula for level 2', () => {
    const item: FloatingTextItem = {
      id: 'rent_c2',
      text: '-1.440 Tr.',
      playerId: 'p1',
      timestamp: 1000,
      actionType: 'rent_pay',
      type: FloatingTextType.Penalty,
      cellIndex: 16,
    };
    const formula = resolveFormulaText(item, 'Nha Trang', false);
    expect(formula).toBe('Công trình C2 (1.440 Tr.): Nha Trang');
    expect(formula.includes('C2')).toBe(true);
  });

  it('[TC-319.10/A7][UC-CAUSAL] Given rent payment on cell 16 matching rent0 without monopoly, When resolveFormulaText is called, Then returns formula for unbuilt land', () => {
    const item: FloatingTextItem = {
      id: 'rent_c0',
      text: '-180 Tr.',
      playerId: 'p1',
      timestamp: 1000,
      actionType: 'rent_pay',
      type: FloatingTextType.Penalty,
      cellIndex: 16,
    };
    const formula = resolveFormulaText(item, 'Nha Trang', false);
    expect(formula).toBe('Đất trống C0 (180 Tr.): Nha Trang');
    expect(formula.includes('C0')).toBe(true);
  });

  it('[TC-319.11/A8][UC-CAUSAL] Given salary event item, When resolveFormulaText is called, Then returns salary formula', () => {
    const item: FloatingTextItem = {
      id: 'sal_1',
      text: '+2.000 Tr.',
      playerId: 'p1',
      timestamp: 1000,
      actionType: 'salary',
      type: FloatingTextType.Reward,
    };
    const formula = resolveFormulaText(item, '', true);
    expect(formula).toBe('Hoàn thành 1 vòng: Thưởng lương qua ô Khởi Hành');
  });

  it('[TC-319.12/A9][UC-CAUSAL] Given mortgage and unmortgage events, When resolveFormulaText is called, Then returns credit formulas', () => {
    const mItem: FloatingTextItem = { id: 'm1', text: '+1.000 Tr.', playerId: 'p1', timestamp: 1000, actionType: 'mortgage', type: FloatingTextType.Reward };
    const uItem: FloatingTextItem = { id: 'u1', text: '-1.100 Tr.', playerId: 'p1', timestamp: 1000, actionType: 'unmortgage', type: FloatingTextType.Penalty };
    expect(resolveFormulaText(mItem, '', true)).toBe('Vay vốn tín dụng ngân hàng (50% giá trị đất)');
    expect(resolveFormulaText(uItem, '', false)).toBe('Chuộc lại đất thế chấp (Gốc + 10% phí Kho Bạc)');
  });

  it('[TC-319.13/A10][UC-CAUSAL] Given tax at cell 4 or property tax, When resolveFormulaText is called, Then returns respective tax formulas', () => {
    const taxCell4: FloatingTextItem = { id: 't1', text: '-200 Tr.', playerId: 'p1', timestamp: 1000, actionType: 'tax', type: FloatingTextType.Penalty, cellIndex: 4 };
    const propTax: FloatingTextItem = { id: 't2', text: '-500 Tr.', playerId: 'p1', timestamp: 1000, actionType: 'tax', type: FloatingTextType.Penalty, title: 'Thuế tài sản qua GO' };
    expect(resolveFormulaText(taxCell4, '', false)).toBe('Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)');
    expect(resolveFormulaText(propTax, '', false)).toContain('Thuế tài sản qua GO');
  });

  it('[TC-319.14/A11][UC-CAUSAL] Given diplomatic card events, When resolveFormulaText is called, Then returns diplomatic formulas', () => {
    const landlordHutThu: FloatingTextItem = { id: 'd1', text: '-500 Tr.', playerId: 'bot_2', timestamp: 1000, actionType: 'diplomatic', type: FloatingTextType.Penalty, title: 'Hụt thu tiền thuê' };
    const guestMienPhi: FloatingTextItem = { id: 'd2', text: '+500 Tr.', playerId: 'p1', timestamp: 1000, actionType: 'diplomatic', type: FloatingTextType.Reward, title: 'Miễn Trừ Ngoại Giao' };
    expect(resolveFormulaText(landlordHutThu, '', false)).toBe('Khách dùng Thẻ Ngoại Giao: Hụt thu tiền thuê');
    expect(resolveFormulaText(guestMienPhi, '', true)).toBe('Đặc quyền ngoại giao: Miễn 100% tiền thuê BĐS');
  });

  it('[TC-319.15/A12][UC-CAUSAL] Given bail and audit jail events, When resolveFormulaText is called, Then returns legal restraint formulas', () => {
    const forcedBail: FloatingTextItem = { id: 'b1', text: '-500 Tr.', playerId: 'p1', timestamp: 1000, actionType: 'bail', type: FloatingTextType.Penalty, bailKind: 'forced' };
    const doubleJail: FloatingTextItem = { id: 'j1', text: '+0 Tr.', playerId: 'p1', timestamp: 1000, actionType: 'audit_jail', type: FloatingTextType.Reward, bailKind: 'doubles' };
    expect(resolveFormulaText(forcedBail, '', false)).toBe('Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc');
    expect(resolveFormulaText(doubleJail, '', true)).toBe('Gieo xúc xắc đôi: Thoát kiểm toán miễn phí');
  });

  it('[TC-319.16/A13][UC-CAUSAL] Given hose stock market events, When resolveFormulaText is called, Then returns market investment formulas', () => {
    const hoseReward: FloatingTextItem = { id: 'h1', text: '+500 Tr.', playerId: 'p1', timestamp: 1000, actionType: 'hose', type: FloatingTextType.Reward };
    const hosePenalty: FloatingTextItem = { id: 'h2', text: '-500 Tr.', playerId: 'p1', timestamp: 1000, actionType: 'hose', type: FloatingTextType.Penalty };
    expect(resolveFormulaText(hoseReward, '', true)).toBe('Chi trả cổ tức từ sàn HOSE');
    expect(resolveFormulaText(hosePenalty, '', false)).toBe('Đầu tư mua chứng khoán HOSE');
  });

  it('[TC-319.17/A14][UC-CAUSAL] Given item with explicit formula string or undefined, When resolveFormulaText is called, Then handles explicit override cleanly', () => {
    const itemExplicit: FloatingTextItem = { id: 'ex1', text: '+100 Tr.', playerId: 'p1', timestamp: 1000, formula: '  Công thức tùy biến  ' };
    const itemUndefined: FloatingTextItem = { id: 'ex2', text: '+100 Tr.', playerId: 'p1', timestamp: 1000, formula: undefined };
    expect(resolveFormulaText(itemExplicit, '', true)).toBe('Công thức tùy biến');
    expect(resolveFormulaText(itemUndefined, '', true)).toBe('Biến động tài chính theo quy định');
  });
});
