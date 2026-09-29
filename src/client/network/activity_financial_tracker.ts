// [UI-S06/MSS][IMP-225] ActivityFinancialTracker — Financial event dispatcher & M&A tracker
import type { DeltaPayload } from '../../server/session_manager.js';
import type { GameState } from '../store/game_store.js';
import { type ActivityLogEntry } from '../store/activity_store.js';
import { PROPERTY_DEEDS } from '../../domain/property_data.js';
import { BOARD_CONFIG } from '../../domain/board_config.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { checkPassedGo } from '../../domain/room.js';
import {
  extractPassedGoActivities,
  matchRentTransactions,
  processPayerFee,
  processReceiverReward,
  extractMiscellaneousBalances,
  getPlayerName,
  type BalanceDelta,
  type PropertyFinancialContext,
} from './activity_rent_matcher.js';

export {
  matchRentTransactions,
  processPayerFee,
  processReceiverReward,
  extractMiscellaneousBalances,
  getPlayerName,
  type BalanceDelta,
  type PropertyFinancialContext,
};

let lastProcessedHoseKey: string | null = null;
export function resetHoseActivityTracker(): void {
  lastProcessedHoseKey = null;
}

interface InitialPayersReceiversResult {
  readonly payers: BalanceDelta[];
  readonly receivers: BalanceDelta[];
  readonly bankruptLogs: ActivityLogEntry[];
}

function collectPayersAndReceivers(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
): InitialPayersReceiversResult {
  const payers: BalanceDelta[] = [];
  const receivers: BalanceDelta[] = [];
  const bankruptLogs: ActivityLogEntry[] = [];

  for (const p of delta.players ?? []) {
    const prevP = prevState.playersInfo[p.id];
    if (p.bankrupt === true && !prevP?.bankrupt) {
      const pName = getPlayerName(prevP, p.id);
      bankruptLogs.push({
        id: `bankrupt_${Date.now()}_${p.id}`,
        timestamp: Date.now(),
        type: 'bankrupt',
        message: `🚨 ${pName} đã tuyên bố PHÁ SẢN và rời khỏi ván đấu!`,
        playerId: p.id,
        playerName: pName,
        ...(prevP?.tokenColor ? { playerTokenColor: prevP.tokenColor } : {}),
      });
    }

    const prevPos = prevState.playerPositions?.[p.id];
    const newPos = nextState.playerPositions?.[p.id] ?? p.position;
    const isSentToAudit = Boolean(
      p.inAudit === true ||
      (p.auditTurnsLeft && p.auditTurnsLeft > 0) ||
      nextState.playersInfo[p.id]?.inAudit === true,
    );
    const hasPassedGo = !isSentToAudit && prevPos !== undefined && newPos !== undefined && prevPos !== newPos && checkPassedGo(prevPos, newPos);

    if (prevP && (prevP.balance !== p.balance || hasPassedGo)) {
      const diff = p.balance !== undefined ? p.balance - prevP.balance : 0;
      const playerPos =
        newPos ??
        (nextState.playersInfo[p.id] as { position?: number } | undefined)?.position ??
        prevState.playerPositions?.[p.id];
      if (diff < 0) payers.push({ id: p.id, diff, pInfo: prevP, cellIndex: playerPos });
      else if (diff > 0)
        receivers.push({ id: p.id, diff, pInfo: nextState.playersInfo[p.id] ?? prevP, cellIndex: playerPos });
      else if (hasPassedGo) {
        payers.push({ id: p.id, diff: 0, pInfo: prevP, cellIndex: playerPos });
      }
    }
  }

  return { payers, receivers, bankruptLogs };
}

function processMaBuyouts(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  context: PropertyFinancialContext,
  payers: readonly BalanceDelta[],
  receivers: readonly BalanceDelta[],
  handledPayerIds: Set<string>,
  handledReceiverIds: Set<string>,
): ActivityLogEntry[] {
  if (!context.buyoutCellIndices?.length || !delta.cells?.length) return [];
  const entries: ActivityLogEntry[] = [];
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
  return entries;
}

function processHoseActivityResult(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  handledPayerIds: Set<string>,
  handledReceiverIds: Set<string>,
): ActivityLogEntry[] {
  if (!delta.lastHoseResult) return [];
  const hr = delta.lastHoseResult;
  const hoseKey = `${hr.playerId}_${hr.timestamp}_${hr.roll}`;
  if (lastProcessedHoseKey === hoseKey) return [];
  lastProcessedHoseKey = hoseKey;

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

  handledPayerIds.add(hr.playerId);
  handledReceiverIds.add(hr.playerId);

  return [{
    id: `hose_${hr.timestamp}_${hr.playerId}`,
    timestamp: hr.timestamp,
    type: 'hose',
    message: `${icon} [HOSE] ${pName} đầu tư ${formatCurrency(hr.stake)} ➔ Khớp lệnh Mặt ${hr.roll} (${sign}): Thu về ${formatCurrency(hr.payout)} (${outcomeLabel})`,
    playerId: hr.playerId,
    playerName: pName,
    amount: hr.profit,
    ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
  }];
}

export function detectFinancialAndStatusActivities(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  contextOrBoughtIndices: PropertyFinancialContext | readonly number[],
): ActivityLogEntry[] {
  if (!delta.players || delta.players.length === 0) return [];
  const entries: ActivityLogEntry[] = [];
  const context: PropertyFinancialContext = Array.isArray(contextOrBoughtIndices)
    ? { boughtCellIndices: contextOrBoughtIndices, buyoutCellIndices: [], upgradedCells: [], mortgagedCells: [], unmortgagedCells: [] }
    : (contextOrBoughtIndices as PropertyFinancialContext);

  const collected = collectPayersAndReceivers(delta, prevState, nextState);
  entries.push(...collected.bankruptLogs);
  let payers = collected.payers;
  let receivers = collected.receivers;

  let handledReceiverIds = new Set<string>();
  const salaryResult = extractPassedGoActivities(delta, prevState, nextState, payers, receivers, handledReceiverIds);
  entries.push(...salaryResult.salaryLogs);
  payers = salaryResult.payers;
  receivers = salaryResult.receivers;
  handledReceiverIds = salaryResult.handledReceiverIds;

  const handledPayerIds = new Set<string>();
  entries.push(...processMaBuyouts(delta, prevState, nextState, context, payers, receivers, handledPayerIds, handledReceiverIds));

  if (context.boughtCellIndices && delta.cells) {
    for (const boughtIndex of context.boughtCellIndices) {
      const cellDelta = delta.cells.find((c) => c.index === boughtIndex);
      if (!cellDelta?.ownerId) continue;
      const prevOwnerId = Object.keys(prevState.playersInfo).find((id) =>
        prevState.playersInfo[id]?.ownedProperties.includes(boughtIndex),
      );
      if (prevOwnerId && prevOwnerId !== cellDelta.ownerId) {
        handledPayerIds.add(cellDelta.ownerId);
        handledReceiverIds.add(prevOwnerId);
      }
    }
  }

  const { rentLogs, handledPayerIds: rentPayers, handledReceiverIds: rentReceivers, remainingPayers } =
    matchRentTransactions(payers, receivers, handledPayerIds, handledReceiverIds, prevState, nextState, delta);
  entries.push(...rentLogs);
  for (const id of rentPayers) handledPayerIds.add(id);
  for (const id of rentReceivers) handledReceiverIds.add(id);
  if (remainingPayers) payers = [...remainingPayers];

  entries.push(...processHoseActivityResult(delta, prevState, nextState, handledPayerIds, handledReceiverIds));
  entries.push(...extractMiscellaneousBalances(payers, receivers, handledPayerIds, handledReceiverIds, context, delta, prevState));
  return entries;
}
