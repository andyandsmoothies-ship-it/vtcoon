// [UI-S06/MSS] ActivityTracker — Event Extraction Facade from DeltaPayload & GameState transitions
import type { DeltaPayload } from '../../server/session_manager.js';
import { type GameState, FloatingTextType } from '../store/game_store.js';
import { useLobbyStore } from '../store/lobby_store.js';
import { useActivityStore, type ActivityLogEntry } from '../store/activity_store.js';
import { BOARD_SIZE } from '../../domain/room.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { resolvePunchyEventSummary } from '../ui/event_card_punchy_summaries.js';
import { AudioEngine } from '../audio/audio_engine.js';
import { SoundEffect } from '../audio/audio_types.js';
import { ChanceCardId } from '../../domain/event_card_types.js';
import { dispatchActivityFloatingBadges } from './activity_badge_dispatcher.js';
export { dispatchActivityFloatingBadges };

const INVESTMENT_OR_FEE_CARDS: ReadonlySet<string> = new Set([
  ChanceCardId.CC_LAND_CHANGE,
  ChanceCardId.CC_MA_FORCE,
  ChanceCardId.CC_CONCERT_SPONSOR,
  ChanceCardId.CC_PLATE_AUCTION,
  ChanceCardId.CC_SWAP_PROJECT,
]);
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

import {
  detectAuctionActivities,
  resetAuctionActivityTracker,
} from './activity_auction_tracker.js';
export { detectAuctionActivities, resetAuctionActivityTracker };

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
  if (!delta.lastEventCard) {
    if (delta.lastEventCard === null) {
      lastProcessedEventCardKey = null;
    }
    return [];
  }
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

export interface TrackDeltaActivitiesOptions {
  readonly suppressFinancialAndProperty?: boolean;
  readonly suppressKinematicLogging?: boolean;
}

export function trackDeltaActivities(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  activityStore: typeof useActivityStore = useActivityStore,
  options?: TrackDeltaActivitiesOptions,
): void {
  if (Boolean(delta.cells && delta.cells.length === BOARD_SIZE)) return;

  const activities: ActivityLogEntry[] = [];
  const diceEntry = detectDiceActivity(delta, prevState, nextState, activityStore);
  if (diceEntry) activities.push(diceEntry);

  // [IMP-187][IMP-284] Causal Timeline Ordering:
  // 1. Nguyên nhân kích hoạt: Vòng xoay vận tải & Thẻ sự kiện/cơ hội
  const transitEntries = detectTransitActivities(delta, prevState, nextState, activityStore);
  activities.push(...transitEntries);

  const cardEntries = detectEventCardActivities(delta, prevState, nextState, activityStore);
  activities.push(...cardEntries);

  // 2. Hệ quả động học: Quân cờ di chuyển theo xúc xắc hoặc hiệu ứng vòng xoay/thẻ bay
  activities.push(...detectMoveActivities(delta, prevState, nextState));

  // 3. Hệ quả giao dịch & tài chính: Chuyển giao BĐS, Dòng tiền (lương/thuế/tiền thuê), Đấu giá
  // [IMP-333] Khi suppressFinancialAndProperty=true, toàn bộ logging và badge của nhóm này đã do GameEventBus đảm nhiệm.
  if (!options?.suppressFinancialAndProperty) {
    const { entries: propEntries, context } = detectPropertyAndLevelActivities(delta, prevState, nextState);
    const financialEntries = detectFinancialAndStatusActivities(delta, prevState, nextState, context);
    const auctionEntries = detectAuctionActivities(delta, prevState, nextState, activityStore);
    activities.push(...propEntries, ...financialEntries, ...auctionEntries);
  }

  const store = activityStore.getState();
  for (const entry of activities) {
    if (
      options?.suppressKinematicLogging &&
      (entry.type === 'dice' || entry.type === 'move' || entry.type === 'card' || entry.type === 'transit')
    ) {
      continue;
    }
    store.addActivityLog(entry);
  }

  // Floating badges: Giao việc phát huy hiệu cho dispatchActivityFloatingBadges với mảng activities đã lọc
  dispatchActivityFloatingBadges(activities, nextState, delta);


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
    const punchySummary = resolvePunchyEventSummary(card.id || card.cardId, card.description || card.title);
    const cardKey = card.id || card.cardId || '';
    const isInvestment = INVESTMENT_OR_FEE_CARDS.has(cardKey);
    const isReward = isInvestment || (effectDelta !== undefined ? effectDelta >= 0 : true);

    const myPid = useLobbyStore.getState().myPlayerId || 'p1';
    const isBotCard = Boolean(playerId && playerId !== myPid);

    if (!isBotCard && typeof nextState?.addFloatingText === 'function') {
      nextState.addFloatingText({
        text: punchySummary,
        type: isReward ? FloatingTextType.Reward : FloatingTextType.Penalty,
        playerId,
        actionType: isMarket ? 'market' : 'chance',
        title: card.title,
        durationMs: 4800,
      });
    }

    try {
      AudioEngine.playSfx(SoundEffect.CARD_DRAW);
    } catch {
      // safe fallback
    }
  }
}

import { detectTransitActivities, resetTransitActivityTracker } from './activity_transit_tracker.js';
export { detectTransitActivities, resetTransitActivityTracker };
export { resetHoseActivityTracker } from './activity_financial_tracker.js';

