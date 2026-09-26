// [UI-S06/MSS][IMP-187][IMP-201] ActivityBadgeDispatcher — Floating badge triggers, audio & VFX synchronization
import { useGameStore, type GameState, FloatingTextType } from '../store/game_store.js';
import type { ActivityLogEntry } from '../store/activity_store.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { useVfxStore } from '../store/vfx_store.js';
import { SoundEngine } from '../audio/sound_engine.js';
import { getCellName, LEVEL_NAMES } from './activity_property_tracker.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import { HOP_DURATION, LANDING_DURATION, BOT_STEP_DURATION } from '../3d/pawn_path.js';

export const pendingBadgeTimers = new Set<ReturnType<typeof setTimeout>>();

export function clearPendingBadgeTimers(): void {
  for (const t of pendingBadgeTimers) clearTimeout(t);
  pendingBadgeTimers.clear();
}

export function getPawnLandingDelay(playerId?: string): number {
  if (!playerId) return 0;
  const state = useGameStore.getState();
  if (state.pendingPawnMove && state.pendingPawnMove.playerId === playerId) {
    const steps = Math.abs((state.pendingPawnMove.targetCell - (state.pendingPawnMove.fromCell ?? 0)) % 40);
    const stepMs = (state.pendingPawnMove.isBot ? BOT_STEP_DURATION : (HOP_DURATION + LANDING_DURATION)) * 1000;
    const diceDelay = state.isRolling ? 1200 : 0;
    return Math.round(diceDelay + steps * stepMs);
  }
  const anim = state.activePawnAnimation;
  if (!anim || anim.playerId !== playerId || !anim.waypoints?.length) return 0;
  const remainingSteps = Math.max(1, anim.waypoints.length - (anim.currentIndex ?? 0));
  const stepMs = (anim.isBot ? BOT_STEP_DURATION : (HOP_DURATION + LANDING_DURATION)) * 1000;
  return Math.round(remainingSteps * stepMs);
}

export function scheduleAction(action: () => void, delayMs: number): ReturnType<typeof setTimeout> | null {
  if (delayMs <= 0) {
    action();
    return null;
  }
  const timer = setTimeout(() => {
    pendingBadgeTimers.delete(timer);
    action();
  }, delayMs);
  pendingBadgeTimers.add(timer);
  return timer;
}

export function handleRentBadge(act: ActivityLogEntry, state: GameState): void {
  if (!act.targetPlayerId || !act.targetPlayerName) {
    console.warn('[ActivityBadgeDispatcher] Missing targetPlayerId or targetPlayerName in rent log:', act);
    return;
  }
  const payerId = act.playerId;
  const payerName = act.playerName ?? (payerId ? state.playersInfo[payerId]?.name : '');
  const receiverId = act.targetPlayerId;
  const receiverName = act.targetPlayerName;
  const absAmount = Math.abs(act.amount ?? 0);
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS';
  const delay = getPawnLandingDelay(payerId);

  scheduleAction(() => {
    if (payerId) {
      useVfxStore.getState().triggerPawnReaction(payerId, 'slump_recoil', 400);
      SoundEngine.playSlumpThud();
      state.addFloatingText({
        text: formatCurrency(-absAmount), type: FloatingTextType.Penalty, playerId: payerId,
        actionType: 'rent_pay', title: `Trả thuê ${cellName}`, targetPlayerId: receiverId,
        targetPlayerName: receiverName, cellIndex: act.cellIndex,
      });
    }
    if (receiverId) {
      useVfxStore.getState().triggerPawnReaction(receiverId, 'victory_spin', 600);
      SoundEngine.playVictoryChime();
      state.addFloatingText({
        text: `+${formatCurrency(absAmount)}`, type: FloatingTextType.Reward, playerId: receiverId,
        actionType: 'rent_receive', title: `Thu thuê ${cellName}`, targetPlayerId: payerId,
        targetPlayerName: payerName, cellIndex: act.cellIndex,
      });
    }
  }, delay);
}

export function handleBuyBadge(act: ActivityLogEntry, state: GameState): void {
  const match = act.message.match(/đã mua\s+(.+?)(?:\s+với giá|$)/);
  const cellName = match?.[1]?.trim() || (act.cellIndex !== undefined ? getCellName(act.cellIndex) : '');
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
  const delay = getPawnLandingDelay(act.playerId);
  scheduleAction(() => {
    state.addFloatingText({
      text: formatCurrency(amount), type: FloatingTextType.Penalty, playerId: act.playerId ?? '',
      actionType: 'buy', title: cellName ? `Mua ${cellName}` : 'Mua BĐS', cellIndex: act.cellIndex,
    });
  }, delay);
}

export function handleTaxBadge(act: ActivityLogEntry, state: GameState): void {
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
  const baseTitle = act.message.includes('Lệ Phí') ? 'Lệ Phí Đất Đai' : 'Thuế Đất Đai';
  const delay = getPawnLandingDelay(act.playerId);
  scheduleAction(() => {
    state.addFloatingText({
      text: formatCurrency(amount), type: FloatingTextType.Penalty, playerId: act.playerId ?? '',
      actionType: 'tax', title: `Nộp ${baseTitle} ➔ Kho Bạc`, cellIndex: act.cellIndex,
    });
  }, delay);
}

function handleUpgradeBadge(act: ActivityLogEntry, state: GameState): void {
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : '';
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
  const levelMatch = act.message.match(/(C[1-3]|Nhà Phố|Khách Sạn|Biệt Thự)/i);
  const levelStr = levelMatch ? levelMatch[0] : (act.cellIndex !== undefined && state.levelMap[act.cellIndex] ? LEVEL_NAMES[state.levelMap[act.cellIndex] as 1 | 2 | 3] : '');
  const title = levelStr ? `Nâng cấp ${levelStr} ${cellName}`.trim() : (cellName ? `Nâng cấp ${cellName}` : 'Nâng cấp công trình');
  state.addFloatingText({
    text: formatCurrency(amount), type: FloatingTextType.Penalty, playerId: act.playerId ?? '',
    actionType: 'upgrade', title, cellIndex: act.cellIndex,
  });
}

function handleBailBadge(act: ActivityLogEntry, state: GameState): void {
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : -500;
  state.addFloatingText({
    text: formatCurrency(amount), type: FloatingTextType.Penalty, playerId: act.playerId ?? '',
    actionType: 'bail', title: 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc', cellIndex: act.cellIndex ?? 10,
  });
}

function handleMortgageBadge(act: ActivityLogEntry, state: GameState): void {
  const cellName = act.cellIndex === 3 ? 'Bến Bạch Đằng' : (act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS');
  const amount = act.amount !== undefined ? Math.abs(act.amount) : 0;
  state.addFloatingText({
    text: `+${formatCurrency(amount)}`, type: FloatingTextType.Reward, playerId: act.playerId ?? '',
    actionType: 'mortgage', title: `Thế chấp ${cellName} ➔ Vay Ngân Hàng`, cellIndex: act.cellIndex,
  });
}

function handleUnmortgageBadge(act: ActivityLogEntry, state: GameState): void {
  const cellName = act.cellIndex === 3 ? 'Bến Bạch Đằng' : (act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS');
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
  state.addFloatingText({
    text: formatCurrency(amount), type: FloatingTextType.Penalty, playerId: act.playerId ?? '',
    actionType: 'unmortgage', title: `Giải chấp ${cellName} (Phí 10% ➔ Kho Bạc)`, cellIndex: act.cellIndex,
  });
}

function handleAuctionBadge(act: ActivityLogEntry, state: GameState): void {
  const isWin = act.id.startsWith('auction_win') || act.message.includes('trúng đấu giá') || act.message.includes('Búa gõ');
  if (!isWin) return;
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : '';
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
  state.addFloatingText({
    text: formatCurrency(amount), type: FloatingTextType.Penalty, playerId: act.playerId ?? '',
    actionType: 'auction_win', title: cellName ? `Thắng đấu giá ${cellName} ➔ Nộp Kho Bạc` : 'Thắng đấu giá BĐS ➔ Nộp Kho Bạc', cellIndex: act.cellIndex,
  });
}

function handleMaBuyoutBadge(act: ActivityLogEntry, state: GameState): void {
  const buyerId = act.playerId;
  const buyerInfo = buyerId ? state.playersInfo[buyerId] : undefined;
  const buyerName = act.playerName ?? (buyerInfo?.name || 'Người chơi');
  const absAmount = Math.abs(act.amount ?? 0);
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS';
  const match = act.message.match(/từ\s+(.+)$/);
  const sellerName = match ? match[1]?.trim() : undefined;
  const sellerId = sellerName ? Object.keys(state.playersInfo).find((id) => state.playersInfo[id]?.name === sellerName) : undefined;

  if (buyerId) {
    state.addFloatingText({
      text: formatCurrency(-absAmount), type: FloatingTextType.Penalty, playerId: buyerId,
      actionType: 'ma_buyout', title: `Thâu tóm ${cellName}`, targetPlayerName: sellerName, cellIndex: act.cellIndex,
    });
  }
  if (sellerId) {
    useVfxStore.getState().triggerPawnReaction(sellerId, 'slump_recoil', 400);
    SoundEngine.playSlumpThud();
    state.addFloatingText({
      text: `${buyerName} bồi hoàn +${formatCurrency(absAmount)}`, type: FloatingTextType.Reward, playerId: sellerId,
      actionType: 'ma_buyout', title: `⚠️ Bị thâu tóm: ${cellName}`, targetPlayerName: buyerName, cellIndex: act.cellIndex,
    });
  }
}

const BADGE_HANDLERS: Record<string, (act: ActivityLogEntry, state: GameState) => void> = {
  rent: handleRentBadge,
  buy: handleBuyBadge,
  upgrade: handleUpgradeBadge,
  tax: handleTaxBadge,
  bail: handleBailBadge,
  mortgage: handleMortgageBadge,
  unmortgage: handleUnmortgageBadge,
  auction: handleAuctionBadge,
  card: (act, state) => {
    if (act.id.startsWith('ma_buyout')) handleMaBuyoutBadge(act, state);
  },
};

export function handleDiplomaticEventBadge(
  ev: { playerId: string; landlordId: string; cellIndex: number; savedRent: number },
  state: GameState,
): void {
  if (typeof state?.addFloatingText !== 'function') return;
  const pName = state.playersInfo[ev.playerId]?.name || 'Khách thuê';
  const lName = state.playersInfo[ev.landlordId]?.name || 'Chủ đất';
  const amt = formatCurrency(ev.savedRent);
  if (ev.playerId) {
    state.addFloatingText({
      text: `+${amt} Tr.`, type: FloatingTextType.Reward, playerId: ev.playerId,
      actionType: 'diplomatic', title: 'Miễn Trừ Ngoại Giao', cellIndex: ev.cellIndex,
      targetPlayerId: ev.landlordId, targetPlayerName: lName,
    });
  }
  if (ev.landlordId) {
    state.addFloatingText({
      text: `-${amt} Tr.`, type: FloatingTextType.Penalty, playerId: ev.landlordId,
      actionType: 'diplomatic', title: `${pName} dùng Thẻ Ngoại Giao`, cellIndex: ev.cellIndex,
      targetPlayerId: ev.playerId, targetPlayerName: pName,
    });
  }
}

export function dispatchActivityFloatingBadges(
  activities: readonly ActivityLogEntry[],
  state: GameState,
  delta?: DeltaPayload,
): void {
  if (typeof state?.addFloatingText !== 'function') return;
  for (const act of activities) {
    BADGE_HANDLERS[act.type]?.(act, state);
  }
  if (delta?.lastDiplomaticEvent) {
    handleDiplomaticEventBadge(delta.lastDiplomaticEvent, state);
  }
}
