import { BOARD_CONFIG, CellType, type BoardCell } from '../../../domain/board_config';
import { PROPERTY_DEEDS } from '../../../domain/property_data';

export type StrategicHintType = 'complete_monopoly' | 'block_opponent' | 'first_piece' | 'progress_monopoly' | 'contested';

export interface GroupCellChip {
  cellIndex: number; name: string; isMine: boolean; isTarget: boolean; isOpponent: boolean; isVacant: boolean;
  ownerId?: string; ownerName?: string; ownerColor?: string;
}

export interface MonopolyRadarResult {
  strategicHint: StrategicHintType; badge: string; totalCells: number; ownedCount: number;
  opponentName?: string; isRailroad?: boolean; isUtility?: boolean; groupCells: GroupCellChip[];
}

export interface CashBufferSafetyResult {
  balanceAfterBuy: number; mortgageValue: number; canAfford: boolean;
  tone: 'emerald' | 'amber' | 'rose'; label: string; description: string;
}

export interface PurchaseDecisionInsight {
  cellIndex: number; radar: MonopolyRadarResult; cashBuffer: CashBufferSafetyResult;
}

function getGroupCells(target: BoardCell): readonly BoardCell[] {
  if (target.colorGroup) return BOARD_CONFIG.filter((c) => c.colorGroup === target.colorGroup);
  if (target.type === CellType.Railroad) return BOARD_CONFIG.filter((c) => c.type === CellType.Railroad);
  if (target.type === CellType.Utility) return BOARD_CONFIG.filter((c) => c.type === CellType.Utility);
  return [target];
}

function resolveHintAndBadge(owned: number, total: number, maxOpp: number, oppName?: string, isContested = false) {
  if (owned + 1 === total) return { strategicHint: 'complete_monopoly' as const, badge: '🎯 Độc Quyền' };
  if (maxOpp === total - 1) return { strategicHint: 'block_opponent' as const, badge: '🛡️ Chặn Đối Thủ', opponentName: oppName };
  if (isContested) return { strategicHint: 'contested' as const, badge: '⚔️ Tranh Chấp' };
  if (owned > 0) return { strategicHint: 'progress_monopoly' as const, badge: `🚀 Tiến Tới (${owned + 1}/${total})` };
  return { strategicHint: 'first_piece' as const, badge: '🧩 Khởi Đầu' };
}

export interface PurchaseDecisionPlayer {
  readonly id?: string;
  readonly ownedProperties?: readonly number[] | number[];
  readonly name?: string; readonly tokenColor?: string; readonly balance?: number; readonly isBot?: boolean;
}

export function resolveMonopolyRadar(params: {
  cellIndex: number;
  buyerId?: string;
  allPlayers?: Record<string, PurchaseDecisionPlayer>;
}): MonopolyRadarResult {
  const { cellIndex, buyerId, allPlayers } = params;
  const targetCell = BOARD_CONFIG[cellIndex];
  if (!targetCell) return { strategicHint: 'first_piece', badge: '🧩 Khởi Đầu', totalCells: 0, ownedCount: 0, groupCells: [] };

  const rawGroup = getGroupCells(targetCell);
  const opponentCounts: Record<string, { count: number; name: string }> = {};
  const groupCells: GroupCellChip[] = rawGroup.map((c) => {
    const ownerEntry = allPlayers ? Object.entries(allPlayers).find(([, p]) => p?.ownedProperties?.includes(c.index)) : undefined;
    const [ownerId, owner] = ownerEntry ?? [];
    const isMine = Boolean(buyerId && ownerId === buyerId);
    const isOpponent = Boolean(ownerId && ownerId !== buyerId);
    if (isOpponent && ownerId) {
      opponentCounts[ownerId] = { count: (opponentCounts[ownerId]?.count ?? 0) + 1, name: owner?.name ?? ownerId };
    }
    return { cellIndex: c.index, name: c.name, isMine, isTarget: c.index === cellIndex, isOpponent, isVacant: !ownerId, ownerId, ownerName: owner?.name, ownerColor: owner?.tokenColor };
  });

  const totalCells = groupCells.length;
  const ownedCount = groupCells.filter((c) => c.isMine).length;
  const opponentOwners = Object.keys(opponentCounts);
  let maxOpponentCount = 0;
  let maxOpponentName: string | undefined;
  for (const pid of opponentOwners) {
    const opp = opponentCounts[pid]!;
    if (opp.count > maxOpponentCount) {
      maxOpponentCount = opp.count;
      maxOpponentName = opp.name;
    }
  }

  const isContested = opponentOwners.length >= 2 || (ownedCount > 0 && opponentOwners.length >= 1);
  const hintInfo = resolveHintAndBadge(ownedCount, totalCells, maxOpponentCount, maxOpponentName, isContested);

  return {
    ...hintInfo,
    totalCells,
    ownedCount,
    isRailroad: targetCell.type === CellType.Railroad ? true : undefined,
    isUtility: targetCell.type === CellType.Utility ? true : undefined,
    groupCells,
  };
}

export function resolveCashBufferSafety(params: { buyerBalance: number; deedPrice: number }): CashBufferSafetyResult {
  const { buyerBalance, deedPrice } = params;
  const balanceAfterBuy = buyerBalance - deedPrice;
  const mortgageValue = Math.floor(deedPrice * 0.5);
  const canAfford = buyerBalance >= deedPrice && buyerBalance > 0;

  if (balanceAfterBuy >= 1500) {
    return { balanceAfterBuy, mortgageValue, canAfford, tone: 'emerald', label: 'Dư Dả', description: 'Đệm tiền mặt vững chắc, an toàn trước cước thuê đối thủ.' };
  }
  if (balanceAfterBuy >= 500) {
    return { balanceAfterBuy, mortgageValue, canAfford, tone: 'amber', label: 'Cẩn Trọng', description: 'Thanh khoản thu hẹp. Có thể cần thế chấp nếu dẫm ô phạt lớn.' };
  }
  return { balanceAfterBuy, mortgageValue, canAfford, tone: 'rose', label: 'Rủi Ro Cao', description: 'Cận kề rủi ro kiệt quệ tiền mặt. Cân nhắc kỹ trước khi mua!' };
}

export function resolvePurchaseDecisionInsight(params: {
  cellIndex: number;
  buyerId?: string;
  buyerBalance: number;
  allPlayers?: Record<string, PurchaseDecisionPlayer>;
}): PurchaseDecisionInsight {
  const { cellIndex, buyerId, buyerBalance, allPlayers } = params;
  const radar = resolveMonopolyRadar({ cellIndex, buyerId, allPlayers });
  const deedPrice = PROPERTY_DEEDS.get(cellIndex)?.price ?? 0;
  const cashBuffer = resolveCashBufferSafety({ buyerBalance, deedPrice });
  return { cellIndex, radar, cashBuffer };
}
