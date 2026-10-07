// [UI-S06/MSS] ActivityPropertyTracker — Property acquisition, upgrade & mortgage event detection
import type { DeltaPayload, CellDelta, TradeResultInfo } from '../../server/session_manager.js';
import type { GameState } from '../store/game_store.js';
import { type ActivityLogEntry } from '../store/activity_store.js';
import { BOARD_CONFIG } from '../../domain/board_config.js';
import { PROPERTY_DEEDS } from '../../domain/property_data.js';
import { calculateUpgradeCost } from '../../domain/property_upgrade.js';
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

export function detectCellTrade(
  cell: CellDelta,
  prevOwnerId: string | undefined,
  buyerName: string,
  buyerColor?: string,
  winningBid?: number,
  prevOwnerName?: string,
  tradeResult?: TradeResultInfo | null,
): ActivityLogEntry {
  const cellName = getCellName(cell.index);
  const price = PROPERTY_DEEDS.get(cell.index)?.price;
  const isDirectBuy = !prevOwnerId;

  let message: string;
  let amount: number | undefined;
  let type: 'buy' | 'auction' | 'trade' = 'buy';
  let targetPlayerId = prevOwnerId;
  let targetPlayerName = prevOwnerName;
  let finalPlayerId = cell.ownerId ?? undefined;
  let finalPlayerName = buyerName;

  if (winningBid !== undefined) {
    message = `${buyerName} đã thắng đấu giá ${cellName} với giá ${formatCurrency(winningBid)}`;
    amount = -winningBid;
    type = 'buy';
  } else if (isDirectBuy) {
    message = `${buyerName} đã mua ${cellName}${price ? ` với giá ${formatCurrency(price)}` : ''}`;
    if (price) amount = -price;
    type = 'buy';
  } else if (tradeResult) {
    type = 'trade';
    finalPlayerId = tradeResult.buyerId;
    targetPlayerId = tradeResult.sellerId;
    const sellerStr = prevOwnerName ?? 'đối thủ';
    if (tradeResult.offeredCellIndex !== undefined) {
      const cell1Name = getCellName(tradeResult.cellIndex);
      const cell2Name = getCellName(tradeResult.offeredCellIndex);
      if (tradeResult.price > 0) {
        const taxStr = tradeResult.taxAmount > 0 ? `, Thuế kho bạc: ${formatCurrency(tradeResult.taxAmount)}` : '';
        message = `🤝 [Hoán Đổi] ${buyerName} và ${sellerStr} đã hoán đổi ${cell1Name} ⇄ ${cell2Name} (kèm bù ${formatCurrency(tradeResult.price)}${taxStr})`;
        amount = -tradeResult.price;
      } else {
        message = `🤝 [Hoán Đổi] ${buyerName} và ${sellerStr} đã hoán đổi quyền sở hữu ${cell1Name} ⇄ ${cell2Name}`;
      }
    } else {
      const taxStr = tradeResult.taxAmount > 0 ? ` (Thuế kho bạc: ${formatCurrency(tradeResult.taxAmount)})` : '';
      message = `🤝 [Chuyển Nhượng] ${buyerName} đã mua ${cellName} từ ${sellerStr} với giá ${formatCurrency(tradeResult.price)}${taxStr}`;
      if (tradeResult.price > 0) {
        amount = -tradeResult.price;
      }
    }
  } else {
    const sellerStr = prevOwnerName ? ` từ ${prevOwnerName}` : '';
    message = `${buyerName} đã nhận chuyển nhượng ${cellName}${sellerStr}`;
    type = 'trade';
  }

  return {
    id: `${type}_${Date.now()}_${cell.index}_${cell.ownerId}`,
    timestamp: Date.now(),
    type,
    message,
    playerId: finalPlayerId,
    playerName: finalPlayerName,
    ...(targetPlayerId ? { targetPlayerId, targetPlayerName } : {}),
    ...(amount !== undefined ? { amount } : {}),
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
  const cost = calculateUpgradeCost(cell.index, targetLevel - 1, nextState.activeModifiers);

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
  isOwnerChanged: boolean = false,
): { entry: ActivityLogEntry; isMortgaged: boolean; amount: number; ownerId: string } | null {
  if (cell.isMortgaged === undefined || cell.isMortgaged === wasMortgaged) return null;
  const ownerId = cell.ownerId ?? Object.keys(nextState.playersInfo).find((id) =>
    nextState.playersInfo[id]?.ownedProperties.includes(cell.index),
  );
  // Bỏ qua giải chấp ma khi BĐS vô chủ hoặc được bàn giao sạch nợ cho chủ mới từ đấu giá
  if (!cell.isMortgaged && (!ownerId || isOwnerChanged)) return null;
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
      type: cell.isMortgaged ? 'mortgage' : 'unmortgage',
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
  buyoutCellIndices: number[],
  delta: DeltaPayload,
  handledTradeCellIndices?: Set<number>,
): void {
  if (cell.ownerId === undefined) return;
  const prevOwnerId = Object.keys(prevState.playersInfo).find((id) =>
    prevState.playersInfo[id]?.ownedProperties.includes(cell.index),
  );
  if (cell.ownerId && cell.ownerId !== prevOwnerId) {
    const cardId = delta.lastEventCard?.id?.toLowerCase() ?? '';
    const effectType = delta.lastEventCard?.effectType?.toLowerCase() ?? '';
    const action = delta.lastEventCard?.action?.toLowerCase() ?? '';
    const isBuyout = cardId.includes('ma_force') || effectType === 'ma_force' || action === 'ma_force' ||
                     cardId.includes('swap_project') || effectType === 'swap_project' || action === 'swap_project';

    if (isBuyout) {
      buyoutCellIndices.push(cell.index);
      return;
    }

    if (handledTradeCellIndices?.has(cell.index)) {
      boughtCellIndices.push(cell.index);
      return;
    }

    const tradeResult = delta.lastTradeResult;
    const isMatchingTrade = tradeResult && (
      tradeResult.cellIndex === cell.index ||
      tradeResult.offeredCellIndex === cell.index
    );

    if (isMatchingTrade && tradeResult) {
      if (tradeResult.offeredCellIndex !== undefined) {
        handledTradeCellIndices?.add(tradeResult.cellIndex);
        handledTradeCellIndices?.add(tradeResult.offeredCellIndex);
      } else {
        handledTradeCellIndices?.add(tradeResult.cellIndex);
      }
      const buyer = nextState.playersInfo[tradeResult.buyerId] ?? prevState.playersInfo[tradeResult.buyerId];
      const prevOwner = nextState.playersInfo[tradeResult.sellerId] ?? prevState.playersInfo[tradeResult.sellerId];
      const buyerName = getPlayerName(buyer, tradeResult.buyerId);
      const prevOwnerName = prevOwner ? getPlayerName(prevOwner, tradeResult.sellerId) : undefined;

      entries.push(
        detectCellTrade(
          cell,
          tradeResult.sellerId,
          buyerName,
          buyer?.tokenColor,
          undefined,
          prevOwnerName,
          tradeResult,
        ),
      );
      boughtCellIndices.push(cell.index);
      return;
    }

    const buyer = nextState.playersInfo[cell.ownerId] ?? prevState.playersInfo[cell.ownerId];
    const prevOwner = prevOwnerId ? (prevState.playersInfo[prevOwnerId] ?? nextState.playersInfo[prevOwnerId]) : undefined;
    const prevOwnerName = prevOwner ? getPlayerName(prevOwner, prevOwnerId) : undefined;
    const modalAuction =
      prevState.activeModal === 'auction' && prevState.modalPayload && 'cellIndex' in prevState.modalPayload
        ? (prevState.modalPayload as { cellIndex?: number; currentBid?: number; highestBid?: number })
        : undefined;
    const auction = prevState.auction ?? modalAuction;
    const isAuctionForThisCell = auction?.cellIndex === cell.index;
    const winningBid = isAuctionForThisCell ? (auction.highestBid ?? auction.currentBid) : undefined;

    entries.push(detectCellTrade(cell, prevOwnerId, getPlayerName(buyer, cell.ownerId), buyer?.tokenColor, winningBid, prevOwnerName));
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
  const prevOwnerId = Object.keys(prevState.playersInfo).find((id) =>
    prevState.playersInfo[id]?.ownedProperties.includes(cell.index),
  );
  const isOwnerChanged = cell.ownerId !== undefined && cell.ownerId !== prevOwnerId;
  const mg = detectCellMortgage(cell, wasMortgaged, nextState, prevState, isOwnerChanged);
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
      context: { boughtCellIndices: [], buyoutCellIndices: [], upgradedCells: [], mortgagedCells: [], unmortgagedCells: [] },
      boughtCellIndices: [],
    };
  }
  const entries: ActivityLogEntry[] = [];
  const boughtCellIndices: number[] = [];
  const buyoutCellIndices: number[] = [];
  const upgradedCells: Array<{ cellIndex: number; cost: number; ownerId: string }> = [];
  const mortgagedCells: Array<{ cellIndex: number; loan: number; ownerId: string }> = [];
  const unmortgagedCells: Array<{ cellIndex: number; cost: number; ownerId: string }> = [];
  const handledTradeCellIndices = new Set<number>();

  for (const cell of delta.cells) {
    processCellOwnerDiff(cell, prevState, nextState, entries, boughtCellIndices, buyoutCellIndices, delta, handledTradeCellIndices);
    processCellLevelDiff(cell, prevState, nextState, entries, upgradedCells);
    processCellMortgageDiff(cell, prevState, nextState, entries, mortgagedCells, unmortgagedCells);
  }

  return {
    entries,
    context: { boughtCellIndices, buyoutCellIndices, upgradedCells, mortgagedCells, unmortgagedCells },
    boughtCellIndices,
  };
}
