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

function isDiceDuplicate(
  delta: DeltaPayload,
  playerId: string,
  d1: number,
  d2: number,
  prevState?: GameState,
  nextState?: GameState,
  activityStore: typeof useActivityStore = useActivityStore,
): boolean {
  if (delta.diceSeq !== undefined) {
    const currentSeq = activityStore.getState().lastDiceSeq;
    return currentSeq !== undefined && currentSeq >= delta.diceSeq;
  }
  if (delta.turnPhase === 'WaitingRoll') {
    const moved = delta.players?.some(
      (p) => p.id === playerId && prevState && prevState.playerPositions[p.id] !== p.position,
    );
    if (!moved) return true;
  }
  const prevP = playerId && prevState ? prevState.playersInfo[playerId] : undefined;
  const nextP = playerId && nextState ? nextState.playersInfo[playerId] : undefined;
  const doublesChanged = (prevP?.consecutiveDoubles ?? 0) !== (nextP?.consecutiveDoubles ?? 0);
  return Boolean(
    prevState &&
      !doublesChanged &&
      prevState.currentTurnPlayerId === playerId &&
      prevState.hasRolledThisTurn &&
      prevState.dice[0] === d1 &&
      prevState.dice[1] === d2,
  );
}

export function detectDiceActivity(
  delta: DeltaPayload,
  prevStateOrNextState: GameState,
  maybeNextState?: GameState,
  activityStore: typeof useActivityStore = useActivityStore,
): ActivityLogEntry | null {
  if (!delta.dice) return null;
  const [d1, d2] = delta.dice;
  if (d1 === 0 && d2 === 0) return null;

  const nextState = maybeNextState ?? prevStateOrNextState;
  const prevState = maybeNextState ? prevStateOrNextState : undefined;
  const playerId = delta.diceRollerId ?? delta.currentTurnPlayerId ?? nextState.currentTurnPlayerId ?? '';

  if (isDiceDuplicate(delta, playerId, d1, d2, prevState, nextState, activityStore)) {
    return null;
  }

  if (delta.diceSeq !== undefined) {
    activityStore.getState().setLastDiceSeq(delta.diceSeq);
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

export function resetAuctionActivityTracker(activityStore: typeof useActivityStore = useActivityStore): void {
  activityStore.getState().setLastAuctionBid(undefined);
}

export function detectAuctionActivities(
  delta: DeltaPayload,
  prevStateOrNextState: GameState,
  maybeNextState?: GameState,
  activityStore: typeof useActivityStore = useActivityStore,
): ActivityLogEntry[] {
  if (delta.auction === null) {
    const lastAuction = activityStore.getState().lastAuctionBid;
    activityStore.getState().setLastAuctionBid(undefined);
    if (lastAuction && lastAuction.highestBidderId) {
      const nextState = maybeNextState ?? prevStateOrNextState;
      const winner = nextState.playersInfo[lastAuction.highestBidderId];
      const winnerName = getPlayerName(winner, lastAuction.highestBidderId);
      return [
        {
          id: `auction_win_${Date.now()}_${lastAuction.cellIndex}_${lastAuction.currentBid}`,
          timestamp: Date.now(),
          type: 'auction',
          message: `🔨 [Đấu Giá] Búa gõ thành công! ${winnerName} đã trúng đấu giá ${getCellName(lastAuction.cellIndex)} với giá ${formatCurrency(lastAuction.currentBid)}!`,
          playerId: lastAuction.highestBidderId,
          playerName: winnerName,
          amount: -lastAuction.currentBid,
          cellIndex: lastAuction.cellIndex,
          ...(winner?.tokenColor ? { playerTokenColor: winner.tokenColor } : {}),
        },
      ];
    }
    return [];
  }
  if (!delta.auction || !delta.auction.highestBidderId) return [];

  const { cellIndex, currentBid, highestBidderId } = delta.auction;
  const lastAuction = activityStore.getState().lastAuctionBid;

  if (
    lastAuction &&
    lastAuction.cellIndex === cellIndex &&
    lastAuction.currentBid === currentBid &&
    lastAuction.highestBidderId === highestBidderId
  ) {
    return [];
  }

  activityStore.getState().setLastAuctionBid({ cellIndex, currentBid, highestBidderId });

  const nextState = maybeNextState ?? prevStateOrNextState;
  const bidder = nextState.playersInfo[highestBidderId];
  const bidderName = getPlayerName(bidder, highestBidderId);

  return [
    {
      id: `auction_${Date.now()}_${cellIndex}_${currentBid}`,
      timestamp: Date.now(),
      type: 'auction',
      message: `${bidderName} đã đặt giá ${formatCurrency(currentBid)} cho ${getCellName(cellIndex)}`,
      playerId: highestBidderId,
      playerName: bidderName,
      amount: -currentBid,
      cellIndex: cellIndex,
      ...(bidder?.tokenColor ? { playerTokenColor: bidder.tokenColor } : {}),
    },
  ];
}

let lastProcessedEventCardKey: string | null = null;

export function resetEventCardActivityTracker(): void {
  lastProcessedEventCardKey = null;
}

export function detectEventCardActivities(
  delta: DeltaPayload,
  prevStateOrNextState: GameState,
  maybeNextState?: GameState,
  activityStore: typeof useActivityStore = useActivityStore,
): ActivityLogEntry[] {
  if (!delta.lastEventCard) return [];
  const card = delta.lastEventCard;
  const cardId = card.id || card.cardId || `${card.type}_${card.title}`;
  const isMarket = card.type === 'Market' || card.cardType === 'market';
  const eventKey = `${cardId}_${card.drawnBy ?? ''}`;

  if (lastProcessedEventCardKey === eventKey) {
    return [];
  }
  lastProcessedEventCardKey = eventKey;

  const nextState = maybeNextState ?? prevStateOrNextState;
  const playerId = card.drawnBy ?? card.playerId ?? delta.currentTurnPlayerId ?? nextState.currentTurnPlayerId ?? '';
  const pInfo = playerId ? nextState.playersInfo[playerId] : undefined;
  const pName = getPlayerName(pInfo, playerId);

  const title = card.title;
  const description = card.description;

  const message = isMarket
    ? `🎴 [Thị Trường] ${title}: ${description}`
    : `⚡ [Cơ Hội] ${pName ? pName + ': ' : ''}${title} - ${description}`;

  return [
    {
      id: `card_${Date.now()}_${cardId}`,
      timestamp: Date.now(),
      type: 'card',
      message,
      ...(playerId ? { playerId } : {}),
      ...(pName ? { playerName: pName } : {}),
      ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
      ...(typeof card.effectDelta === 'number' ? { amount: card.effectDelta } : {}),
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
  const diceEntry = detectDiceActivity(delta, prevState, nextState, activityStore);
  if (diceEntry) activities.push(diceEntry);

  activities.push(...detectMoveActivities(delta, prevState, nextState));

  const { entries: propEntries, context } = detectPropertyAndLevelActivities(delta, prevState, nextState);
  activities.push(...propEntries);
  activities.push(...detectFinancialAndStatusActivities(delta, prevState, nextState, context));
  activities.push(...detectAuctionActivities(delta, prevState, nextState, activityStore));
  activities.push(...detectEventCardActivities(delta, prevState, nextState, activityStore));

  const store = activityStore.getState();
  for (const entry of activities) {
    store.addActivityLog(entry);
  }
}
