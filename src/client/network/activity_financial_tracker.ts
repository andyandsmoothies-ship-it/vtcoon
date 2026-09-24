// [UI-S06/MSS] ActivityFinancialTracker — Balance diff matching, rent matching & financial event logs
import type { DeltaPayload } from '../../server/session_manager.js';
import type { GameState, PlayerHudInfo } from '../store/game_store.js';
import { type ActivityLogEntry } from '../store/activity_store.js';
import { PROPERTY_DEEDS } from '../../domain/property_data.js';
import { BOARD_CONFIG } from '../../domain/board_config.js';
import { formatCurrency } from '../ui/ui_helpers.js';

export interface BalanceDelta {
  readonly id: string;
  readonly diff: number;
  readonly pInfo?: PlayerHudInfo;
  readonly cellIndex?: number;
}

export interface PropertyFinancialContext {
  readonly boughtCellIndices: readonly number[];
  readonly buyoutCellIndices?: readonly number[];
  readonly upgradedCells: ReadonlyArray<{ cellIndex: number; cost: number; ownerId: string }>;
  readonly mortgagedCells: ReadonlyArray<{ cellIndex: number; loan: number; ownerId: string }>;
  readonly unmortgagedCells: ReadonlyArray<{ cellIndex: number; cost: number; ownerId: string }>;
}

export function getPlayerName(pInfo?: PlayerHudInfo, fallbackId?: string): string {
  return pInfo?.name || (fallbackId ? fallbackId.toUpperCase() : 'Người chơi');
}

export function matchRentTransactions(
  payers: readonly BalanceDelta[],
  receivers: readonly BalanceDelta[],
  initialHandledPayers?: ReadonlySet<string>,
  initialHandledReceivers?: ReadonlySet<string>,
): {
  rentLogs: ActivityLogEntry[];
  handledPayerIds: Set<string>;
  handledReceiverIds: Set<string>;
} {
  const rentLogs: ActivityLogEntry[] = [];
  const handledPayerIds = new Set<string>(initialHandledPayers ?? []);
  const handledReceiverIds = new Set<string>(initialHandledReceivers ?? []);

  for (const payer of payers) {
    if (handledPayerIds.has(payer.id)) continue;
    const rentAmount = Math.abs(payer.diff);
    const receiver = receivers.find((r) => !handledReceiverIds.has(r.id) && r.diff === rentAmount);
    if (receiver) {
      const payerName = getPlayerName(payer.pInfo, payer.id);
      const receiverName = getPlayerName(receiver.pInfo, receiver.id);
      rentLogs.push({
        id: `rent_${Date.now()}_${payer.id}_${receiver.id}`,
        timestamp: Date.now(),
        type: 'rent',
        message: `${payerName} đã trả ${formatCurrency(rentAmount)} tiền thuê cho ${receiverName}`,
        playerId: payer.id,
        playerName: payerName,
        targetPlayerId: receiver.id,
        targetPlayerName: receiverName,
        amount: -rentAmount,
        ...(payer.cellIndex !== undefined ? { cellIndex: payer.cellIndex } : {}),
        ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
      });
      handledPayerIds.add(payer.id);
      handledReceiverIds.add(receiver.id);
    }
  }
  return { rentLogs, handledPayerIds, handledReceiverIds };
}

export function processPayerFee(
  payer: BalanceDelta,
  context: PropertyFinancialContext,
  delta?: DeltaPayload,
  prevState?: GameState,
): ActivityLogEntry | null {
  const absDiff = Math.abs(payer.diff);
  if (
    context.boughtCellIndices.length > 0 &&
    delta?.cells?.some((c) => c.ownerId === payer.id && context.boughtCellIndices.includes(c.index))
  ) {
    return null;
  }

  const isPurchase = context.boughtCellIndices.some((idx) => PROPERTY_DEEDS.get(idx)?.price === absDiff);
  if (isPurchase) return null;

  const isUpgrade = context.upgradedCells.some((u) => u.ownerId === payer.id && u.cost === absDiff);
  if (isUpgrade) return null;

  const isUnmortgage = context.unmortgagedCells.some(
    (um) => um.ownerId === payer.id && Math.abs(um.cost - absDiff) <= 50,
  );
  if (isUnmortgage) return null;

  const pName = getPlayerName(payer.pInfo, payer.id);

  // [IMP-79] Nhận diện Lệ Phí Đăng Ký Đất Đai (Ô 04)
  const deltaP = delta?.players?.find((p) => p.id === payer.id);
  const currentPos = deltaP?.position ?? prevState?.playerPositions[payer.id] ?? payer.cellIndex;
  if (currentPos === 4) {
    return {
      id: `tax_${Date.now()}_${payer.id}`,
      timestamp: Date.now(),
      type: 'tax',
      message: `🏛️ ${pName} đã nộp phí / nộp thuế ${formatCurrency(absDiff)} (Lệ Phí Đăng Ký Đất Đai)`,
      playerId: payer.id,
      playerName: pName,
      cellIndex: 4,
      amount: payer.diff,
      ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
    };
  }

  // [IMP-79] Nhận diện Tiền Bảo Lãnh Kiểm Toán (Ô 10)
  const prevP = prevState?.playersInfo[payer.id];
  const wasInAudit = Boolean(prevP?.inAudit || (prevP?.auditTurnsLeft && prevP.auditTurnsLeft > 0));
  if (wasInAudit && absDiff === 500) {
    return {
      id: `bail_${Date.now()}_${payer.id}`,
      timestamp: Date.now(),
      type: 'bail',
      message: `⚖️ ${pName} đã nộp phí / nộp thuế ${formatCurrency(absDiff)} (Bảo Lãnh Kiểm Toán để rời Trạm)`,
      playerId: payer.id,
      playerName: pName,
      cellIndex: 10,
      amount: payer.diff,
      ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
    };
  }

  return {
    id: `tax_${Date.now()}_${payer.id}`,
    timestamp: Date.now(),
    type: 'tax',
    message: `${pName} đã nộp phí / nộp thuế ${formatCurrency(absDiff)}`,
    playerId: payer.id,
    playerName: pName,
    amount: payer.diff,
    ...(payer.cellIndex !== undefined ? { cellIndex: payer.cellIndex } : {}),
    ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
  };
}

function processReceiverReward(
  receiver: BalanceDelta,
  context: PropertyFinancialContext,
): ActivityLogEntry | null {
  const isMortgageLoan = context.mortgagedCells.some(
    (m) => m.ownerId === receiver.id && m.loan === receiver.diff,
  );
  if (isMortgageLoan) return null;

  const rName = getPlayerName(receiver.pInfo, receiver.id);
  return {
    id: `reward_${Date.now()}_${receiver.id}`,
    timestamp: Date.now(),
    type: 'system',
    message: `${rName} đã nhận được ${formatCurrency(receiver.diff)} tiền thưởng`,
    playerId: receiver.id,
    playerName: rName,
    amount: receiver.diff,
    ...(receiver.pInfo?.tokenColor ? { playerTokenColor: receiver.pInfo.tokenColor } : {}),
  };
}

export function extractMiscellaneousBalances(
  payers: readonly BalanceDelta[],
  receivers: readonly BalanceDelta[],
  handledPayerIds: Set<string>,
  handledReceiverIds: Set<string>,
  context: PropertyFinancialContext,
  delta?: DeltaPayload,
  prevState?: GameState,
): ActivityLogEntry[] {
  const logs: ActivityLogEntry[] = [];
  for (const payer of payers) {
    if (handledPayerIds.has(payer.id)) continue;
    const feeLog = processPayerFee(payer, context, delta, prevState);
    if (feeLog) logs.push(feeLog);
  }
  for (const receiver of receivers) {
    if (handledReceiverIds.has(receiver.id)) continue;
    const rewardLog = processReceiverReward(receiver, context);
    if (rewardLog) logs.push(rewardLog);
  }
  return logs;
}

export function detectFinancialAndStatusActivities(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  contextOrBoughtIndices: PropertyFinancialContext | readonly number[],
): ActivityLogEntry[] {
  if (!delta.players || delta.players.length === 0) return [];
  const entries: ActivityLogEntry[] = [];
  const payers: BalanceDelta[] = [];
  const receivers: BalanceDelta[] = [];
  const context: PropertyFinancialContext = Array.isArray(contextOrBoughtIndices)
    ? {
        boughtCellIndices: contextOrBoughtIndices,
        buyoutCellIndices: [],
        upgradedCells: [],
        mortgagedCells: [],
        unmortgagedCells: [],
      }
    : (contextOrBoughtIndices as PropertyFinancialContext);

  for (const p of delta.players) {
    const prevP = prevState.playersInfo[p.id];
    if (p.bankrupt === true && !prevP?.bankrupt) {
      const pName = getPlayerName(prevP, p.id);
      entries.push({
        id: `bankrupt_${Date.now()}_${p.id}`,
        timestamp: Date.now(),
        type: 'bankrupt',
        message: `🚨 ${pName} đã tuyên bố PHÁ SẢN và rời khỏi ván đấu!`,
        playerId: p.id,
        playerName: pName,
        ...(prevP?.tokenColor ? { playerTokenColor: prevP.tokenColor } : {}),
      });
    }
    if (prevP && prevP.balance !== p.balance) {
      const diff = p.balance - prevP.balance;
      const playerPos = p.position ?? (nextState.playersInfo[p.id] as { position?: number } | undefined)?.position ?? nextState.playerPositions?.[p.id] ?? prevState.playerPositions?.[p.id];
      if (diff < 0) payers.push({ id: p.id, diff, pInfo: prevP, cellIndex: playerPos });
      else if (diff > 0) receivers.push({ id: p.id, diff, pInfo: nextState.playersInfo[p.id] ?? prevP, cellIndex: playerPos });
    }
  }

  const handledPayerIds = new Set<string>();
  const handledReceiverIds = new Set<string>();

  // [IMP-187] Xử lý M&A / Hoán đổi dự án (CC_MA_FORCE, CC_SWAP_PROJECT): tách riêng khỏi tiền thuê
  if (context.buyoutCellIndices && context.buyoutCellIndices.length > 0 && delta.cells && delta.cells.length > 0) {
    for (const buyoutIndex of context.buyoutCellIndices) {
      const cellDelta = delta.cells.find((c) => c.index === buyoutIndex);
      if (!cellDelta?.ownerId) continue;
      const buyerId = cellDelta.ownerId;
      const prevOwner = Object.values(prevState.playersInfo).find((p) => p.ownedProperties?.includes(buyoutIndex));
      const targetScopeId = (delta.lastEventCard as { targetScope?: string } | undefined)?.targetScope;
      const sellerId = prevOwner?.id ?? (targetScopeId && targetScopeId in prevState.playersInfo ? targetScopeId : undefined);

      const payer = payers.find((p) => p.id === buyerId && !handledPayerIds.has(p.id));
      const receiver = sellerId ? receivers.find((r) => r.id === sellerId && !handledReceiverIds.has(r.id)) : undefined;

      const buyerInfo = nextState.playersInfo[buyerId] ?? prevState.playersInfo[buyerId];
      const buyerName = getPlayerName(buyerInfo, buyerId);
      const sellerInfo = sellerId ? (nextState.playersInfo[sellerId] ?? prevState.playersInfo[sellerId]) : undefined;
      const sellerName = sellerId ? getPlayerName(sellerInfo, sellerId) : 'đối thủ';
      const cellName = BOARD_CONFIG[buyoutIndex]?.name ?? `Ô #${buyoutIndex}`;
      const amount = payer ? Math.abs(payer.diff) : (receiver ? receiver.diff : (PROPERTY_DEEDS.get(buyoutIndex)?.price ?? 0));

      entries.push({
        id: `ma_buyout_${Date.now()}_${buyoutIndex}_${buyerId}`,
        timestamp: Date.now(),
        type: 'card',
        message: `⚡ [M&A] ${buyerName} đã chi trả ${formatCurrency(amount)} thâu tóm ${cellName} từ ${sellerName}`,
        playerId: buyerId,
        playerName: buyerName,
        amount: -amount,
        cellIndex: buyoutIndex,
        ...(buyerInfo?.tokenColor ? { playerTokenColor: buyerInfo.tokenColor } : {}),
      });

      if (payer) handledPayerIds.add(payer.id);
      if (receiver) handledReceiverIds.add(receiver.id);
    }
  }

  const { rentLogs, handledPayerIds: rentPayers, handledReceiverIds: rentReceivers } = matchRentTransactions(
    payers,
    receivers,
    handledPayerIds,
    handledReceiverIds,
  );
  entries.push(...rentLogs);
  for (const id of rentPayers) handledPayerIds.add(id);
  for (const id of rentReceivers) handledReceiverIds.add(id);

  if (delta.lastHoseResult) {
    const hr = delta.lastHoseResult;
    const pInfo = nextState.playersInfo[hr.playerId] ?? prevState.playersInfo[hr.playerId];
    const pName = hr.playerName ?? getPlayerName(pInfo, hr.playerId);
    const multiplierPct = Math.round((hr.multiplier - 1) * 100);
    const sign = multiplierPct > 0 ? `+${multiplierPct}%` : multiplierPct < 0 ? `${multiplierPct}%` : 'Hòa vốn';
    const outcomeLabel =
      hr.profit > 0
        ? `Lãi +${formatCurrency(hr.profit)}`
        : hr.profit < 0
        ? `Lỗ -${formatCurrency(Math.abs(hr.profit))}`
        : 'Hòa vốn';
    const icon = hr.profit > 0 ? '📈' : hr.profit < 0 ? '📉' : '⚖️';

    entries.push({
      id: `hose_${hr.timestamp}_${hr.playerId}`,
      timestamp: hr.timestamp,
      type: 'system',
      message: `${icon} [HOSE] ${pName} đầu tư ${formatCurrency(hr.stake)} ➔ Khớp lệnh Mặt ${hr.roll} (${sign}): Thu về ${formatCurrency(hr.payout)} (${outcomeLabel})`,
      playerId: hr.playerId,
      playerName: pName,
      amount: hr.profit,
      ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
    });
    handledPayerIds.add(hr.playerId);
    handledReceiverIds.add(hr.playerId);
  }

  entries.push(...extractMiscellaneousBalances(payers, receivers, handledPayerIds, handledReceiverIds, context, delta, prevState));
  return entries;
}
