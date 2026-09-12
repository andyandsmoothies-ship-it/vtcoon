// [UI-S06/MSS] ActivityTracker — Event Extraction Facade from DeltaPayload & GameState transitions
import type { DeltaPayload } from '../../server/session_manager.js';
import type { GameState } from '../store/game_store.js';
import { useActivityStore, type ActivityLogEntry } from '../store/activity_store.js';
import { BOARD_SIZE } from '../../domain/room.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import {
  getPlayerName,
  detectFinancialAndStatusActivities,
  type PropertyFinancialContext,
} from './activity_financial_tracker.js';
import {
  LEVEL_NAMES,
  getCellName,
  detectPropertyAndLevelActivities,
  detectCellTrade,
  detectCellUpgrade,
  detectCellMortgage,
} from './activity_property_tracker.js';

export {
  getPlayerName,
  detectFinancialAndStatusActivities,
  LEVEL_NAMES,
  getCellName,
  detectPropertyAndLevelActivities,
  detectCellTrade,
  detectCellUpgrade,
  detectCellMortgage,
};

export function detectDiceActivity(
  delta: DeltaPayload,
  prevStateOrNextState: GameState,
  maybeNextState?: GameState,
): ActivityLogEntry | null {
  if (!delta.dice) return null;
  const [d1, d2] = delta.dice;
  if (d1 === 0 && d2 === 0) return null;

  const nextState = maybeNextState ?? prevStateOrNextState;
  const prevState = maybeNextState ? prevStateOrNextState : undefined;

  const playerId = delta.currentTurnPlayerId ?? nextState.currentTurnPlayerId ?? '';
  const prevP = playerId && prevState ? prevState.playersInfo[playerId] : undefined;
  const nextP = playerId ? nextState.playersInfo[playerId] : undefined;
  const doublesChanged = (prevP?.consecutiveDoubles ?? 0) !== (nextP?.consecutiveDoubles ?? 0);

  if (
    prevState &&
    !doublesChanged &&
    prevState.currentTurnPlayerId === playerId &&
    prevState.hasRolledThisTurn &&
    prevState.dice[0] === d1 &&
    prevState.dice[1] === d2
  ) {
    return null;
  }

  const pInfo = playerId ? nextState.playersInfo[playerId] : undefined;
  const pName = getPlayerName(pInfo, playerId);
  const total = d1 + d2;
  const isDouble = d1 === d2;

  return {
    id: `dice_${Date.now()}_${d1}_${d2}`,
    timestamp: Date.now(),
    type: 'dice',
    message: `${pName} đã gieo xúc xắc được ${d1} + ${d2} = ${total} điểm${isDouble ? ' (Đổ đôi! 🎉)' : ''}`,
    ...(playerId ? { playerId } : {}),
    playerName: pName,
    ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
  };
}

export function detectMoveActivities(delta: DeltaPayload, prevState: GameState, nextState: GameState): ActivityLogEntry[] {
  if (!delta.players || delta.players.length === 0) return [];
  const entries: ActivityLogEntry[] = [];

  for (const p of delta.players) {
    const prevPos = prevState.playerPositions[p.id];
    if (prevPos !== undefined && prevPos !== p.position) {
      const pInfo = nextState.playersInfo[p.id] ?? prevState.playersInfo[p.id];
      const pName = getPlayerName(pInfo, p.id);
      entries.push({
        id: `move_${Date.now()}_${p.id}_${p.position}`,
        timestamp: Date.now(),
        type: 'move',
        message: `${pName} đã di chuyển đến ${getCellName(p.position)}`,
        playerId: p.id,
        playerName: pName,
        cellIndex: p.position,
        ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
      });
    }
  }
  return entries;
}

export function detectAuctionActivities(
  delta: DeltaPayload,
  prevStateOrNextState: GameState,
  maybeNextState?: GameState,
): ActivityLogEntry[] {
  if (!delta.auction || !delta.auction.highestBidderId) return [];

  const nextState = maybeNextState ?? prevStateOrNextState;
  const prevState = maybeNextState ? prevStateOrNextState : undefined;

  const prevAuction =
    prevState && prevState.activeModal === 'auction'
      ? (prevState.modalPayload as { highestBidderId?: string | null; currentBid?: number } | undefined)
      : undefined;

  if (
    prevAuction &&
    prevAuction.highestBidderId === delta.auction.highestBidderId &&
    prevAuction.currentBid === delta.auction.currentBid
  ) {
    return [];
  }

  const bidder = nextState.playersInfo[delta.auction.highestBidderId];
  const bidderName = getPlayerName(bidder, delta.auction.highestBidderId);

  return [
    {
      id: `auction_${Date.now()}_${delta.auction.cellIndex}_${delta.auction.currentBid}`,
      timestamp: Date.now(),
      type: 'auction',
      message: `${bidderName} đã đặt giá ${formatCurrency(delta.auction.currentBid)} cho ${getCellName(delta.auction.cellIndex)}`,
      playerId: delta.auction.highestBidderId,
      playerName: bidderName,
      amount: -delta.auction.currentBid,
      cellIndex: delta.auction.cellIndex,
      ...(bidder?.tokenColor ? { playerTokenColor: bidder.tokenColor } : {}),
    },
  ];
}

export function trackDeltaActivities(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  activityStore: typeof useActivityStore = useActivityStore,
): void {
  if (Boolean(delta.cells && delta.cells.length === BOARD_SIZE)) return;

  const activities: ActivityLogEntry[] = [];
  const diceEntry = detectDiceActivity(delta, prevState, nextState);
  if (diceEntry) activities.push(diceEntry);

  activities.push(...detectMoveActivities(delta, prevState, nextState));

  const { entries: propEntries, context } = detectPropertyAndLevelActivities(delta, prevState, nextState);
  activities.push(...propEntries);
  activities.push(...detectFinancialAndStatusActivities(delta, prevState, nextState, context));
  activities.push(...detectAuctionActivities(delta, prevState, nextState));

  const store = activityStore.getState();
  for (const entry of activities) {
    store.addActivityLog(entry);
  }
}
