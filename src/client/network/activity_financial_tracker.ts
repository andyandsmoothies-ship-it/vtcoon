// [UI-S06/MSS] ActivityFinancialTracker — Balance diff matching, rent matching & financial event logs
import type { DeltaPayload } from '../../server/session_manager.js';
import type { GameState, PlayerHudInfo } from '../store/game_store.js';
import { type ActivityLogEntry } from '../store/activity_store.js';
import { PROPERTY_DEEDS } from '../../domain/property_data.js';
import { formatCurrency } from '../ui/ui_helpers.js';

export interface BalanceDelta {
  readonly id: string;
  readonly diff: number;
  readonly pInfo?: PlayerHudInfo;
}

export interface PropertyFinancialContext {
  readonly boughtCellIndices: readonly number[];
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
): {
  rentLogs: ActivityLogEntry[];
  handledPayerIds: Set<string>;
  handledReceiverIds: Set<string>;
} {
  const rentLogs: ActivityLogEntry[] = [];
  const handledPayerIds = new Set<string>();
  const handledReceiverIds = new Set<string>();

  for (const payer of payers) {
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
        amount: -rentAmount,
        ...(payer.pInfo?.tokenColor ? { playerTokenColor: payer.pInfo.tokenColor } : {}),
      });
      handledPayerIds.add(payer.id);
      handledReceiverIds.add(receiver.id);
    }
  }
  return { rentLogs, handledPayerIds, handledReceiverIds };
}

function processPayerFee(
  payer: BalanceDelta,
  context: PropertyFinancialContext,
): ActivityLogEntry | null {
  const absDiff = Math.abs(payer.diff);
  const isPurchase = context.boughtCellIndices.some((idx) => PROPERTY_DEEDS.get(idx)?.price === absDiff);
  if (isPurchase) return null;

  const isUpgrade = context.upgradedCells.some((u) => u.ownerId === payer.id && u.cost === absDiff);
  if (isUpgrade) return null;

  const isUnmortgage = context.unmortgagedCells.some(
    (um) => um.ownerId === payer.id && Math.abs(um.cost - absDiff) <= 50,
  );
  if (isUnmortgage) return null;

  const pName = getPlayerName(payer.pInfo, payer.id);
  return {
    id: `tax_${Date.now()}_${payer.id}`,
    timestamp: Date.now(),
    type: 'tax',
    message: `${pName} đã nộp phí / nộp thuế ${formatCurrency(absDiff)}`,
    playerId: payer.id,
    playerName: pName,
    amount: payer.diff,
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
): ActivityLogEntry[] {
  const logs: ActivityLogEntry[] = [];
  for (const payer of payers) {
    if (handledPayerIds.has(payer.id)) continue;
    const feeLog = processPayerFee(payer, context);
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
      if (diff < 0) payers.push({ id: p.id, diff, pInfo: prevP });
      else if (diff > 0) receivers.push({ id: p.id, diff, pInfo: nextState.playersInfo[p.id] ?? prevP });
    }
  }

  const { rentLogs, handledPayerIds, handledReceiverIds } = matchRentTransactions(payers, receivers);
  entries.push(...rentLogs);
  entries.push(...extractMiscellaneousBalances(payers, receivers, handledPayerIds, handledReceiverIds, context));
  return entries;
}
