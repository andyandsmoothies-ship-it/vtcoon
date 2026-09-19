// [UI-S06/MSS] ActivityTracker — Event Extraction Facade from DeltaPayload & GameState transitions
import type { DeltaPayload } from '../../server/session_manager.js';
import { type GameState, FloatingTextType } from '../store/game_store.js';
import { useActivityStore, type ActivityLogEntry } from '../store/activity_store.js';
import { BOARD_SIZE } from '../../domain/room.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { AudioEngine } from '../audio/audio_engine.js';
import { SoundEffect } from '../audio/audio_types.js';
import { useVfxStore } from '../store/vfx_store.js';
import { SoundEngine } from '../audio/sound_engine.js';
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

function handleRentBadge(act: ActivityLogEntry, state: GameState): void {
  const parts = act.id.split('_');
  let receiverId: string | undefined;
  let receiverName: string | undefined;

  if (parts.length >= 4) {
    const candidateId = parts[parts.length - 1];
    if (candidateId) {
      receiverId = candidateId;
      receiverName = state.playersInfo[candidateId]?.name;
    }
  }

  if (!receiverName) {
    const match = act.message.match(/cho\s+(.+)$/);
    if (match) {
      receiverName = match[1]?.trim();
      if (!receiverId && receiverName) {
        receiverId = Object.keys(state.playersInfo).find(
          (id) => state.playersInfo[id]?.name === receiverName,
        );
      }
    }
  }

  const fallbackPayerId = parts.length >= 4 ? (parts[parts.length - 2] ?? '') : '';
  const payerId = act.playerId ?? fallbackPayerId;
  const payerName = act.playerName ?? (payerId ? state.playersInfo[payerId]?.name : '');
  const absAmount = Math.abs(act.amount ?? 0);
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS';

  if (payerId) {
    useVfxStore.getState().triggerPawnReaction(payerId, 'slump_recoil', 400);
    SoundEngine.playSlumpThud();
    state.addFloatingText({
      text: formatCurrency(-absAmount),
      type: FloatingTextType.Penalty,
      playerId: payerId,
      actionType: 'rent_pay',
      title: `Tiền thuê ${cellName}`,
      targetPlayerName: receiverName,
      cellIndex: act.cellIndex,
    });
  }

  if (receiverId) {
    useVfxStore.getState().triggerPawnReaction(receiverId, 'victory_spin', 600);
    SoundEngine.playVictoryChime();
    state.addFloatingText({
      text: `+${formatCurrency(absAmount)}`,
      type: FloatingTextType.Reward,
      playerId: receiverId,
      actionType: 'rent_receive',
      title: `Thu tiền thuê ${cellName}`,
      targetPlayerName: payerName,
      cellIndex: act.cellIndex,
    });
  }
}

function handleBuyBadge(act: ActivityLogEntry, state: GameState): void {
  const match = act.message.match(/đã mua\s+(.+?)(?:\s+với giá|$)/);
  const cellName = match?.[1]?.trim() || (act.cellIndex !== undefined ? getCellName(act.cellIndex) : '');
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
  state.addFloatingText({
    text: formatCurrency(amount),
    type: FloatingTextType.Penalty,
    playerId: act.playerId ?? '',
    actionType: 'buy',
    title: cellName ? `Mua ${cellName}` : 'Mua BĐS',
    cellIndex: act.cellIndex,
  });
}

function handleUpgradeBadge(act: ActivityLogEntry, state: GameState): void {
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : '';
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
  const levelMatch = act.message.match(/(C[1-3]|Nhà Phố|Khách Sạn|Biệt Thự)/i);
  const levelStr = levelMatch
    ? levelMatch[0]
    : (act.cellIndex !== undefined && state.levelMap[act.cellIndex]
        ? LEVEL_NAMES[state.levelMap[act.cellIndex] as 1 | 2 | 3]
        : '');
  const title = levelStr
    ? `Nâng cấp ${levelStr} ${cellName}`.trim()
    : (cellName ? `Nâng cấp ${cellName}` : 'Nâng cấp công trình');

  state.addFloatingText({
    text: formatCurrency(amount),
    type: FloatingTextType.Penalty,
    playerId: act.playerId ?? '',
    actionType: 'upgrade',
    title,
    cellIndex: act.cellIndex,
  });
}

function handleTaxBadge(act: ActivityLogEntry, state: GameState): void {
  if (act.id.startsWith('bail_') || act.message.includes('Bảo Lãnh')) {
    return;
  }
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
  const title = act.message.includes('Lệ Phí')
    ? 'Lệ Phí Đất Đai'
    : 'Thuế Đất Đai';

  state.addFloatingText({
    text: formatCurrency(amount),
    type: FloatingTextType.Penalty,
    playerId: act.playerId ?? '',
    actionType: 'tax',
    title,
    cellIndex: act.cellIndex,
  });
}

function handleAuctionBadge(act: ActivityLogEntry, state: GameState): void {
  const isWin =
    act.id.startsWith('auction_win') ||
    act.message.includes('trúng đấu giá') ||
    act.message.includes('Búa gõ');
  if (!isWin) return;

  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : '';
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
  state.addFloatingText({
    text: formatCurrency(amount),
    type: FloatingTextType.Penalty,
    playerId: act.playerId ?? '',
    actionType: 'auction_win',
    title: cellName ? `Đấu Giá ${cellName}` : 'Đấu Giá Thành Công',
    cellIndex: act.cellIndex,
  });
}

const BADGE_HANDLERS: Record<string, (act: ActivityLogEntry, state: GameState) => void> = {
  rent: handleRentBadge,
  buy: handleBuyBadge,
  upgrade: handleUpgradeBadge,
  tax: handleTaxBadge,
  auction: handleAuctionBadge,
};

export function dispatchActivityFloatingBadges(
  activities: readonly ActivityLogEntry[],
  state: GameState,
): void {
  if (typeof state?.addFloatingText !== 'function') return;
  for (const act of activities) {
    BADGE_HANDLERS[act.type]?.(act, state);
  }
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
  const cardEntries = detectEventCardActivities(delta, prevState, nextState, activityStore);
  activities.push(...cardEntries);

  const store = activityStore.getState();
  for (const entry of activities) {
    store.addActivityLog(entry);
  }

  dispatchActivityFloatingBadges(activities, nextState);

  if (cardEntries.length > 0 && delta.lastEventCard) {
    const card = delta.lastEventCard;
    const isMarket = card.type === 'Market' || card.cardType === 'market';
    const playerId =
      card.drawnBy ??
      card.playerId ??
      delta.currentTurnPlayerId ??
      nextState.currentTurnPlayerId ??
      '';
    const effectDelta = typeof card.effectDelta === 'number' ? card.effectDelta : undefined;
    const text = effectDelta !== undefined && effectDelta !== 0
      ? (effectDelta > 0 ? `+${formatCurrency(effectDelta)}` : formatCurrency(effectDelta))
      : (card.description || card.title);
    const isReward = effectDelta !== undefined ? effectDelta >= 0 : true;

    if (typeof nextState?.addFloatingText === 'function') {
      nextState.addFloatingText({
        text,
        type: isReward ? FloatingTextType.Reward : FloatingTextType.Penalty,
        playerId,
        actionType: isMarket ? 'market' : 'chance',
        title: card.title,
      });
    }

    try {
      AudioEngine.playSfx(SoundEffect.CARD_DRAW);
    } catch {
      // safe fallback
    }
  }
}
