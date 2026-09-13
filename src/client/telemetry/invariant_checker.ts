// [IMP-24/MSS] Invariant Watchdog Engine — Pure Invariant Verifiers
import { BOARD_CONFIG, CellType } from '../../domain/board_config.js';
import type { InvariantViolation } from './telemetry_types.js';

const PURCHASABLE_TYPES = new Set<CellType>([CellType.Property, CellType.Railroad, CellType.Utility]);

export const NON_PURCHASABLE_INDICES = new Set<number>(
  BOARD_CONFIG.filter((c) => !PURCHASABLE_TYPES.has(c.type)).map((c) => c.index)
);

export function verifyTreasuryConservation(params: {
  readonly preBalances: Record<string, number>;
  readonly postBalances: Record<string, number>;
  readonly preTreasury: number;
  readonly postTreasury: number;
  readonly tick: number;
  readonly expectedDelta?: number;
}): InvariantViolation | null {
  const preTotal = Object.values(params.preBalances).reduce((acc, v) => acc + v, 0) + params.preTreasury;
  const postTotal = Object.values(params.postBalances).reduce((acc, v) => acc + v, 0) + params.postTreasury;
  const actualDelta = postTotal - preTotal;
  const expected = params.expectedDelta ?? 0;

  if (actualDelta !== expected) {
    return {
      id: `viol_treasury_${params.tick}_${Date.now()}`,
      timestamp: Date.now(),
      tick: params.tick,
      type: 'TREASURY_INVARIANT_VIOLATED',
      severity: 'CRITICAL',
      message: `Thất thoát quỹ kho bạc hoặc tiền tệ: sai lệch ${actualDelta} Tr (kỳ vọng: ${expected} Tr).`,
      details: { preTotal, postTotal, actualDelta, expected },
    };
  }
  return null;
}

export function verifyMovementStep(params: {
  readonly fromPosition: number;
  readonly toPosition: number;
  readonly dice?: readonly [number, number];
  readonly tick: number;
  readonly isTeleport?: boolean;
}): InvariantViolation | null {
  if (params.fromPosition === params.toPosition || params.isTeleport || !params.dice) return null;
  const diceSum = params.dice[0] + params.dice[1];
  const expectedPosition = (params.fromPosition + diceSum) % 40;

  if (params.toPosition !== expectedPosition) {
    return {
      id: `viol_move_${params.tick}_${Date.now()}`,
      timestamp: Date.now(),
      tick: params.tick,
      type: 'INVALID_POSITION_STEP',
      severity: 'CRITICAL',
      message: `Quân cờ nhảy sai ô: từ ô ${params.fromPosition} tới ô ${params.toPosition} với xúc xắc tổng ${diceSum} (kỳ vọng ô ${expectedPosition}).`,
      details: { from: params.fromPosition, to: params.toPosition, diceSum, expected: expectedPosition },
    };
  }
  return null;
}

export function verifyNonNegativeBalance(params: {
  readonly players: ReadonlyArray<{
    readonly id: string;
    readonly balance: number;
    readonly bankrupt?: boolean;
    readonly overdraftRoundsLeft?: number;
  }>;
  readonly isInInsolvency?: boolean;
  readonly tick: number;
}): InvariantViolation | null {
  for (const p of params.players) {
    if (p.balance < 0) {
      const isExempt = Boolean(
        p.bankrupt || params.isInInsolvency || (p.overdraftRoundsLeft !== undefined && p.overdraftRoundsLeft > 0)
      );
      if (!isExempt) {
        return {
          id: `viol_balance_${params.tick}_${p.id}_${Date.now()}`,
          timestamp: Date.now(),
          tick: params.tick,
          type: 'NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY',
          severity: 'CRITICAL',
          message: `Người chơi ${p.id} có số dư âm (${p.balance} Tr) ngoài trạng thái vỡ nợ.`,
          details: { playerId: p.id, balance: p.balance },
        };
      }
    }
  }
  return null;
}

export function verifyPropertyOwnership(params: {
  readonly cells: ReadonlyArray<{ readonly index: number; readonly ownerId?: string | null; readonly level?: number }>;
  readonly tick: number;
}): InvariantViolation | null {
  for (const cell of params.cells) {
    if (NON_PURCHASABLE_INDICES.has(cell.index) && cell.ownerId) {
      return {
        id: `viol_prop_owner_${params.tick}_${cell.index}`,
        timestamp: Date.now(),
        tick: params.tick,
        type: 'PROPERTY_OWNERSHIP_CORRUPTED',
        severity: 'CRITICAL',
        message: `Ô đặc biệt không thể mua (ô ${cell.index}) bị gán chủ sở hữu: ${cell.ownerId}.`,
        details: { cellIndex: cell.index, ownerId: cell.ownerId },
      };
    }
    if (cell.level !== undefined) {
      const isInvalidLevel = cell.level < 0 || cell.level > 3 || !Number.isInteger(cell.level);
      const isNonPropertyLevel = !BOARD_CONFIG[cell.index] || BOARD_CONFIG[cell.index]?.type !== CellType.Property;
      if (isInvalidLevel || (isNonPropertyLevel && cell.level > 0)) {
        return {
          id: `viol_prop_level_${params.tick}_${cell.index}`,
          timestamp: Date.now(),
          tick: params.tick,
          type: 'PROPERTY_OWNERSHIP_CORRUPTED',
          severity: 'CRITICAL',
          message: `Cấp công trình ô ${cell.index} không hợp lệ (cấp ${cell.level}).`,
          details: { cellIndex: cell.index, level: cell.level },
        };
      }
    }
  }
  return null;
}

export function verifyAllInvariants(params: {
  readonly preBalances?: Record<string, number>;
  readonly postBalances?: Record<string, number>;
  readonly preTreasury?: number;
  readonly postTreasury?: number;
  readonly expectedMoneyDelta?: number | null;
  readonly movement?: { readonly fromPosition: number; readonly toPosition: number; readonly dice?: readonly [number, number]; readonly isTeleport?: boolean };
  readonly players?: ReadonlyArray<{ readonly id: string; readonly balance: number; readonly bankrupt?: boolean; readonly overdraftRoundsLeft?: number }>;
  readonly isInInsolvency?: boolean;
  readonly cells?: ReadonlyArray<{ readonly index: number; readonly ownerId?: string | null; readonly level?: number }>;
  readonly tick: number;
}): InvariantViolation[] {
  const violations: InvariantViolation[] = [];

  if (params.preBalances && params.postBalances && params.preTreasury !== undefined && params.postTreasury !== undefined) {
    if (params.expectedMoneyDelta !== null) {
      const v = verifyTreasuryConservation({
        preBalances: params.preBalances,
        postBalances: params.postBalances,
        preTreasury: params.preTreasury,
        postTreasury: params.postTreasury,
        tick: params.tick,
        expectedDelta: params.expectedMoneyDelta ?? undefined,
      });
      if (v) violations.push(v);
    }
  }

  if (params.movement) {
    const v = verifyMovementStep({
      fromPosition: params.movement.fromPosition,
      toPosition: params.movement.toPosition,
      dice: params.movement.dice,
      tick: params.tick,
      isTeleport: params.movement.isTeleport,
    });
    if (v) violations.push(v);
  }

  if (params.players) {
    const v = verifyNonNegativeBalance({
      players: params.players,
      isInInsolvency: params.isInInsolvency,
      tick: params.tick,
    });
    if (v) violations.push(v);
  }

  if (params.cells) {
    const v = verifyPropertyOwnership({
      cells: params.cells,
      tick: params.tick,
    });
    if (v) violations.push(v);
  }

  return violations;
}
