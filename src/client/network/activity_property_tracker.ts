// [UI-S06/MSS] ActivityPropertyTracker — Property acquisition, upgrade & mortgage event detection
import type { DeltaPayload, CellDelta } from '../../server/session_manager.js';
import type { GameState } from '../store/game_store.js';
import { type ActivityLogEntry } from '../store/activity_store.js';
import { BOARD_CONFIG } from '../../domain/board_config.js';
import { PROPERTY_DEEDS } from '../../domain/property_data.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { getPlayerName, type PropertyFinancialContext } from './activity_financial_tracker.js';

export const LEVEL_NAMES: Record<1 | 2 | 3, string> = {
  1: 'C1 (Nhà Phố)',
  2: 'C2 (Biệt Thự)',
  3: 'C3 (Khách Sạn)',
};

export function getCellName(cellIndex: number): string {
  return BOARD_CONFIG[cellIndex]?.name ?? `Ô #${cellIndex}`;
}

export function detectCellTrade(cell: CellDelta, prevOwnerId: string | undefined, buyerName: string, buyerColor?: string): ActivityLogEntry {
  const cellName = getCellName(cell.index);
  const price = PROPERTY_DEEDS.get(cell.index)?.price;
  const isDirectBuy = !prevOwnerId;

  return {
    id: `buy_${Date.now()}_${cell.index}_${cell.ownerId}`,
    timestamp: Date.now(),
    type: 'buy',
    message: isDirectBuy
      ? `${buyerName} đã mua ${cellName}${price ? ` với giá ${formatCurrency(price)}` : ''}`
      : `${buyerName} đã nhận quyền sở hữu ${cellName}`,
    playerId: cell.ownerId ?? undefined,
    playerName: buyerName,
    ...(isDirectBuy && price ? { amount: -price } : {}),
    cellIndex: cell.index,
    ...(buyerColor ? { playerTokenColor: buyerColor } : {}),
  };
}

export function detectCellUpgrade(
  cell: CellDelta,
  targetLevel: 1 | 2 | 3,
  nextState: GameState,
  prevState: GameState,
): { entry: ActivityLogEntry; cost: number; ownerId: string } | null {
  const ownerId = cell.ownerId ?? Object.keys(nextState.playersInfo).find((id) =>
    nextState.playersInfo[id]?.ownedProperties.includes(cell.index),
  ) ?? Object.keys(prevState.playersInfo).find((id) =>
    prevState.playersInfo[id]?.ownedProperties.includes(cell.index),
  );
  const owner = ownerId ? (nextState.playersInfo[ownerId] ?? prevState.playersInfo[ownerId]) : undefined;
  const ownerName = getPlayerName(owner, ownerId);
  const deed = PROPERTY_DEEDS.get(cell.index);
  const cost = deed?.upgradeCosts?.[targetLevel - 1] ?? 0;

  return {
    entry: {
      id: `upgrade_${Date.now()}_${cell.index}_${targetLevel}`,
      timestamp: Date.now(),
      type: 'upgrade',
      message: `${ownerName} đã nâng cấp ${getCellName(cell.index)} lên ${LEVEL_NAMES[targetLevel]}`,
      ...(ownerId ? { playerId: ownerId } : {}),
      playerName: ownerName,
      ...(cost > 0 ? { amount: -cost } : {}),
      cellIndex: cell.index,
      ...(owner?.tokenColor ? { playerTokenColor: owner.tokenColor } : {}),
    },
    cost,
    ownerId: ownerId ?? '',
  };
}

export function detectCellMortgage(
  cell: CellDelta,
  wasMortgaged: boolean,
  nextState: GameState,
  prevState: GameState,
): { entry: ActivityLogEntry; isMortgaged: boolean; amount: number; ownerId: string } | null {
  if (cell.isMortgaged === undefined || cell.isMortgaged === wasMortgaged) return null;
  const ownerId = cell.ownerId ?? Object.keys(nextState.playersInfo).find((id) =>
    nextState.playersInfo[id]?.ownedProperties.includes(cell.index),
  );
  const owner = ownerId ? (nextState.playersInfo[ownerId] ?? prevState.playersInfo[ownerId]) : undefined;
  const ownerName = getPlayerName(owner, ownerId);
  const deed = PROPERTY_DEEDS.get(cell.index);
  const loan = deed ? Math.floor(deed.price / 2) : 0;
  const redeemCost = deed ? Math.floor(deed.price * 0.55) : 0;
  const amount = cell.isMortgaged ? loan : -redeemCost;

  return {
    entry: {
      id: `mortgage_${Date.now()}_${cell.index}`,
      timestamp: Date.now(),
      type: 'mortgage',
      message: `${ownerName} ${cell.isMortgaged ? 'đã thế chấp' : 'đã chuộc lại'} ${getCellName(cell.index)} vào ngân hàng`,
      ...(ownerId ? { playerId: ownerId } : {}),
      playerName: ownerName,
      amount,
      cellIndex: cell.index,
      ...(owner?.tokenColor ? { playerTokenColor: owner.tokenColor } : {}),
    },
    isMortgaged: cell.isMortgaged,
    amount: Math.abs(amount),
    ownerId: ownerId ?? '',
  };
}

function processCellOwnerDiff(
  cell: CellDelta,
  prevState: GameState,
  nextState: GameState,
  entries: ActivityLogEntry[],
  boughtCellIndices: number[],
): void {
  if (cell.ownerId === undefined) return;
  const prevOwnerId = Object.keys(prevState.playersInfo).find((id) =>
    prevState.playersInfo[id]?.ownedProperties.includes(cell.index),
  );
  if (cell.ownerId && cell.ownerId !== prevOwnerId) {
    const buyer = nextState.playersInfo[cell.ownerId] ?? prevState.playersInfo[cell.ownerId];
    entries.push(detectCellTrade(cell, prevOwnerId, getPlayerName(buyer, cell.ownerId), buyer?.tokenColor));
    boughtCellIndices.push(cell.index);
  }
}

function processCellLevelDiff(
  cell: CellDelta,
  prevState: GameState,
  nextState: GameState,
  entries: ActivityLogEntry[],
  upgradedCells: Array<{ cellIndex: number; cost: number; ownerId: string }>,
): void {
  if (cell.level === undefined) return;
  const oldLevel = prevState.levelMap[cell.index] ?? 0;
  const targetLevel = Math.max(0, Math.min(3, cell.level)) as 0 | 1 | 2 | 3;
  if (targetLevel > oldLevel && targetLevel >= 1) {
    const up = detectCellUpgrade(cell, targetLevel as 1 | 2 | 3, nextState, prevState);
    if (up) {
      entries.push(up.entry);
      upgradedCells.push({ cellIndex: cell.index, cost: up.cost, ownerId: up.ownerId });
    }
  }
}

function processCellMortgageDiff(
  cell: CellDelta,
  prevState: GameState,
  nextState: GameState,
  entries: ActivityLogEntry[],
  mortgagedCells: Array<{ cellIndex: number; loan: number; ownerId: string }>,
  unmortgagedCells: Array<{ cellIndex: number; cost: number; ownerId: string }>,
): void {
  if (cell.isMortgaged === undefined) return;
  const wasMortgaged = Object.values(prevState.playersInfo).some((p) =>
    p.mortgagedProperties?.includes(cell.index),
  );
  const mg = detectCellMortgage(cell, wasMortgaged, nextState, prevState);
  if (mg) {
    entries.push(mg.entry);
    if (mg.isMortgaged) {
      mortgagedCells.push({ cellIndex: cell.index, loan: mg.amount, ownerId: mg.ownerId });
    } else {
      unmortgagedCells.push({ cellIndex: cell.index, cost: mg.amount, ownerId: mg.ownerId });
    }
  }
}

export function detectPropertyAndLevelActivities(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
): { entries: ActivityLogEntry[]; context: PropertyFinancialContext; boughtCellIndices: number[] } {
  if (!delta.cells || delta.cells.length === 0) {
    return {
      entries: [],
      context: { boughtCellIndices: [], upgradedCells: [], mortgagedCells: [], unmortgagedCells: [] },
      boughtCellIndices: [],
    };
  }
  const entries: ActivityLogEntry[] = [];
  const boughtCellIndices: number[] = [];
  const upgradedCells: Array<{ cellIndex: number; cost: number; ownerId: string }> = [];
  const mortgagedCells: Array<{ cellIndex: number; loan: number; ownerId: string }> = [];
  const unmortgagedCells: Array<{ cellIndex: number; cost: number; ownerId: string }> = [];

  for (const cell of delta.cells) {
    processCellOwnerDiff(cell, prevState, nextState, entries, boughtCellIndices);
    processCellLevelDiff(cell, prevState, nextState, entries, upgradedCells);
    processCellMortgageDiff(cell, prevState, nextState, entries, mortgagedCells, unmortgagedCells);
  }

  return {
    entries,
    context: { boughtCellIndices, upgradedCells, mortgagedCells, unmortgagedCells },
    boughtCellIndices,
  };
}
