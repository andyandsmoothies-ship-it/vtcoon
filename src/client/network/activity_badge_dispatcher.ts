// [UI-S06/MSS][IMP-187][IMP-201][IMP-225] ActivityBadgeDispatcher — Floating badge triggers, audio & VFX synchronization
import { useGameStore, type GameState, FloatingTextType } from '../store/game_store.js';
import type { ActivityLogEntry } from '../store/activity_store.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { useVfxStore } from '../store/vfx_store.js';
import { SoundEngine } from '../audio/sound_engine.js';
import { getCellName, LEVEL_NAMES } from './activity_property_tracker.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import { HOP_DURATION, LANDING_DURATION, BOT_STEP_DURATION } from '../3d/pawn_path.js';
import { MIN_BAIL_AMOUNT } from '../../domain/property_rent.js';
import { checkPassedGo } from '../../domain/room.js';

export const pendingBadgeTimers = new Set<ReturnType<typeof setTimeout>>();

export function clearPendingBadgeTimers(): void {
  for (const t of pendingBadgeTimers) clearTimeout(t);
  pendingBadgeTimers.clear();
}

function getAnimLead(anim: GameState['activePawnAnimation']): number {
  if (!anim || !anim.waypoints?.length) return 0;
  const steps = Math.max(1, anim.waypoints.length - (anim.currentIndex ?? 0));
  const ms = (anim.isBot ? BOT_STEP_DURATION : (HOP_DURATION + LANDING_DURATION)) * 1000;
  return Math.round(steps * ms);
}

export function getPawnLandingDelay(playerId?: string): number {
  if (!playerId) return 0;
  const state = useGameStore.getState();
  if (state.pendingPawnMove && state.pendingPawnMove.playerId === playerId) {
    const rawDiff = (state.pendingPawnMove.targetCell - (state.pendingPawnMove.fromCell ?? 0)) % 40;
    const steps = ((rawDiff % 40) + 40) % 40;
    const stepMs = (state.pendingPawnMove.isBot ? BOT_STEP_DURATION : (HOP_DURATION + LANDING_DURATION)) * 1000;
    return Math.round((state.isRolling ? 1200 : 0) + steps * stepMs);
  }
  const anim = state.activePawnAnimation;
  const activeRemainingMs = getAnimLead(anim);
  if (anim && anim.playerId === playerId && anim.waypoints?.length) return activeRemainingMs;

  const queued = state.pawnAnimationQueue?.find((t) => t.playerId === playerId);
  if (queued) {
    const steps = (((queued.targetCell - (queued.fromCell ?? 0)) % 40) + 40) % 40;
    const stepMs = (queued.isBot ? BOT_STEP_DURATION : (HOP_DURATION + LANDING_DURATION)) * 1000;
    return Math.round(activeRemainingMs + steps * stepMs);
  }
  return 0;
}

export function getPawnPassGoDelay(playerId?: string): number {
  if (!playerId) return 0;
  const state = useGameStore.getState(), rollLead = state.isRolling ? 1200 : 0;
  if (state.pendingPawnMove && state.pendingPawnMove.playerId === playerId) {
    const fromCell = state.pendingPawnMove.fromCell ?? 0;
    if (checkPassedGo(fromCell, state.pendingPawnMove.targetCell)) {
      const stepMs = (state.pendingPawnMove.isBot ? BOT_STEP_DURATION : (HOP_DURATION + LANDING_DURATION)) * 1000;
      return Math.round(rollLead + ((40 - fromCell) % 40) * stepMs);
    }
  }
  const anim = state.activePawnAnimation, activeRemainingMs = getAnimLead(anim);
  if (anim && anim.playerId === playerId && anim.waypoints?.length) {
    const fromCell = anim.fromCell, targetCell = anim.targetCell ?? anim.waypoints[anim.waypoints.length - 1] ?? 0;
    if (checkPassedGo(fromCell, targetCell)) {
      const stepMs = (anim.isBot ? BOT_STEP_DURATION : (HOP_DURATION + LANDING_DURATION)) * 1000;
      return Math.round(Math.max(0, ((40 - fromCell) % 40) - (anim.currentIndex ?? 0)) * stepMs);
    }
  }
  const queued = state.pawnAnimationQueue?.find((t) => t.playerId === playerId);
  if (queued && checkPassedGo(queued.fromCell ?? 0, queued.targetCell)) {
    const stepMs = (queued.isBot ? BOT_STEP_DURATION : (HOP_DURATION + LANDING_DURATION)) * 1000;
    return Math.round(activeRemainingMs + ((40 - (queued.fromCell ?? 0)) % 40) * stepMs);
  }
  return 0;
}

export function scheduleAction(action: () => void, delayMs: number): ReturnType<typeof setTimeout> | null {
  if (delayMs <= 0) { action(); return null; }
  const timer = setTimeout(() => { pendingBadgeTimers.delete(timer); action(); }, delayMs);
  pendingBadgeTimers.add(timer);
  return timer;
}

export function handleRentBadge(act: ActivityLogEntry, state: GameState): void {
  if (!act.targetPlayerId || !act.targetPlayerName) {
    console.warn('[ActivityBadgeDispatcher] Missing targetPlayerId or targetPlayerName in rent log:', act);
    return;
  }
  const payerId = act.playerId, payerName = act.playerName ?? (payerId ? state.playersInfo[payerId]?.name : '');
  const receiverId = act.targetPlayerId, receiverName = act.targetPlayerName, absAmount = Math.abs(act.amount ?? 0);
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS', groupId = `rent_${act.id}_${payerId}_${receiverId}`;
  scheduleAction(() => {
    if (payerId) {
      useVfxStore.getState().triggerPawnReaction(payerId, 'slump_recoil', 400);
      SoundEngine.playSlumpThud();
      state.addFloatingText({ text: formatCurrency(-absAmount), type: FloatingTextType.Penalty, playerId: payerId, actionType: 'rent_pay', title: `Trả thuê ${cellName}`, targetPlayerId: receiverId, targetPlayerName: receiverName, cellIndex: act.cellIndex, groupId });
    }
    if (receiverId) {
      useVfxStore.getState().triggerPawnReaction(receiverId, 'victory_spin', 600);
      SoundEngine.playVictoryChime();
      state.addFloatingText({ text: `+${formatCurrency(absAmount)}`, type: FloatingTextType.Reward, playerId: receiverId, actionType: 'rent_receive', title: `Thu thuê ${cellName}`, targetPlayerId: payerId, targetPlayerName: payerName, cellIndex: act.cellIndex, groupId });
    }
  }, getPawnLandingDelay(payerId));
}

export function handleBuyBadge(act: ActivityLogEntry, state: GameState): void {
  const match = act.message.match(/đã mua\s+(.+?)(?:\s+với giá|$)/);
  const cellName = match?.[1]?.trim() || (act.cellIndex !== undefined ? getCellName(act.cellIndex) : '');
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
  scheduleAction(() => {
    state.addFloatingText({ text: formatCurrency(amount), type: FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'buy', title: cellName ? `Mua ${cellName}` : 'Mua BĐS', cellIndex: act.cellIndex });
  }, getPawnLandingDelay(act.playerId));
}

export function handleTaxBadge(act: ActivityLogEntry, state: GameState): void {
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
  if (amount === 0) return;
  const isCell4 = act.cellIndex === 4, isPropTax = act.message.includes('Tài Sản'), isMortInterest = act.message.includes('lãi thế chấp');
  const baseTitle = isCell4 ? 'Lệ Phí Đất Đai' : (isMortInterest ? 'Lãi Thế Chấp Qua GO' : (isPropTax ? 'Thuế Tài Sản Qua GO' : 'Thuế Nhà Nước'));
  const cellIndex = isCell4 ? 4 : ((isPropTax || isMortInterest) ? 0 : act.cellIndex);
  const delay = (isPropTax || isMortInterest) ? getPawnPassGoDelay(act.playerId) : getPawnLandingDelay(act.playerId);
  scheduleAction(() => {
    state.addFloatingText({ text: formatCurrency(amount), type: FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'tax', title: `Nộp ${baseTitle} ➔ Kho Bạc`, cellIndex });
  }, delay);
}

export function handleSalaryBadge(act: ActivityLogEntry, state: GameState): void {
  scheduleAction(() => {
    SoundEngine.playVictoryChime();
    const salaryAmt = act.amount ?? 2000;
    state.addFloatingText({ text: `+${formatCurrency(salaryAmt)}`, type: FloatingTextType.Reward, playerId: act.playerId ?? '', actionType: 'salary', title: 'Lương Vượt Ô Bắt Đầu', formula: `Hoàn thành 1 vòng sa bàn (+${formatCurrency(salaryAmt)} Tr.)` });
  }, getPawnPassGoDelay(act.playerId));
}

function handleUpgradeBadge(act: ActivityLogEntry, state: GameState): void {
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : '';
  const levelMatch = act.message.match(/(C[1-3]|Nhà Phố|Khách Sạn|Biệt Thự)/i);
  const levelStr = levelMatch ? levelMatch[0] : (act.cellIndex !== undefined && state.levelMap[act.cellIndex] ? LEVEL_NAMES[state.levelMap[act.cellIndex] as 1 | 2 | 3] : '');
  state.addFloatingText({ text: formatCurrency(act.amount !== undefined ? -Math.abs(act.amount) : 0), type: FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'upgrade', title: levelStr ? `Nâng cấp ${levelStr} ${cellName}`.trim() : (cellName ? `Nâng cấp ${cellName}` : 'Nâng cấp công trình'), cellIndex: act.cellIndex });
}

function handleBailBadge(act: ActivityLogEntry, state: GameState): void {
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : -MIN_BAIL_AMOUNT;
  const isTimeout = act.message.includes('Hết 3 lượt') || act.message.includes('bắt buộc');
  const formula = isTimeout ? 'Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc' : (Math.abs(amount) > MIN_BAIL_AMOUNT ? `Bảo lãnh tái phạm: Khung ${formatCurrency(Math.abs(amount))} Tr. ➔ Kho Bạc` : `Bảo lãnh chuẩn: Khung ${formatCurrency(MIN_BAIL_AMOUNT)} Tr. ➔ Kho Bạc`);
  state.addFloatingText({ text: formatCurrency(amount), type: FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'bail', title: isTimeout ? 'Cưỡng chế kiểm toán ➔ Nộp Kho Bạc' : 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc', cellIndex: act.cellIndex ?? 10, formula, bailKind: isTimeout ? 'forced' : 'voluntary' });
}

function handleMortgageBadge(act: ActivityLogEntry, state: GameState): void {
  const cellName = act.cellIndex === 3 ? 'Bến Bạch Đằng' : (act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS');
  state.addFloatingText({ text: `+${formatCurrency(act.amount !== undefined ? Math.abs(act.amount) : 0)}`, type: FloatingTextType.Reward, playerId: act.playerId ?? '', actionType: 'mortgage', title: `Thế chấp ${cellName} ➔ Vay Ngân Hàng`, cellIndex: act.cellIndex });
}

function handleUnmortgageBadge(act: ActivityLogEntry, state: GameState): void {
  const cellName = act.cellIndex === 3 ? 'Bến Bạch Đằng' : (act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS');
  state.addFloatingText({ text: formatCurrency(act.amount !== undefined ? -Math.abs(act.amount) : 0), type: FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'unmortgage', title: `Giải chấp ${cellName} (Phí 10% ➔ Kho Bạc)`, cellIndex: act.cellIndex });
}

function handleAuctionBadge(act: ActivityLogEntry, state: GameState): void {
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : '';
  if (act.id.startsWith('decline_auction') || act.message.includes('bỏ qua')) {
    state.addFloatingText({ text: cellName, type: FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'decline_auction', title: act.message, cellIndex: act.cellIndex, formula: 'Từ chối mua quyền sử dụng đất' });
    return;
  }
  if (!act.id.startsWith('auction_win') && !act.message.includes('trúng đấu giá') && !act.message.includes('Búa gõ')) return;
  state.addFloatingText({ text: formatCurrency(act.amount !== undefined ? -Math.abs(act.amount) : 0), type: FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'auction_win', title: cellName ? `Thắng đấu giá ${cellName} ➔ Nộp Kho Bạc` : 'Thắng đấu giá BĐS ➔ Nộp Kho Bạc', cellIndex: act.cellIndex });
}

export function handleTradeBadge(act: ActivityLogEntry, state: GameState): void {
  const cell = act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS', bId = act.playerId ?? '', sId = act.targetPlayerId, groupId = `trade_${act.id}`;
  const bName = act.playerName || (bId ? state.playersInfo[bId]?.name : 'Người chơi'), sName = act.targetPlayerName || (sId ? state.playersInfo[sId]?.name : 'đối tác');
  if (bId) state.addFloatingText({ text: cell, type: FloatingTextType.Reward, playerId: bId, actionType: 'trade', title: `${bName} nhận ${cell} từ ${sName}`, targetPlayerId: sId, targetPlayerName: sName, cellIndex: act.cellIndex, formula: 'Chuyển nhượng quyền sở hữu P2P', groupId });
  if (sId) state.addFloatingText({ text: cell, type: FloatingTextType.Penalty, playerId: sId, actionType: 'trade', title: `${sName} nhượng ${cell} cho ${bName}`, targetPlayerId: bId, targetPlayerName: bName, cellIndex: act.cellIndex, formula: 'Chuyển nhượng quyền sở hữu P2P', groupId });
}

export function handleHoseBadge(act: ActivityLogEntry, state: GameState, delta?: DeltaPayload): void {
  const profit = act.amount ?? 0, hr = delta?.lastHoseResult;
  state.addFloatingText({ text: `${profit >= 0 ? '+' : ''}${formatCurrency(profit)}`, type: profit >= 0 ? FloatingTextType.Reward : FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'hose', title: act.message, formula: hr ? `Khớp lệnh sàn HOSE: Mặt ${hr.roll}` : 'Giao dịch sàn chứng khoán HOSE' });
}

function handleMaBuyoutBadge(act: ActivityLogEntry, state: GameState): void {
  const buyerId = act.playerId, absAmount = Math.abs(act.amount ?? 0), buyerName = act.playerName ?? (buyerId ? state.playersInfo[buyerId]?.name : 'Người chơi');
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS', match = act.message.match(/từ\s+(.+)$/), sellerName = match ? match[1]?.trim() : undefined;
  const sellerId = sellerName ? Object.keys(state.playersInfo).find((id) => state.playersInfo[id]?.name === sellerName) : undefined, groupId = `ma_${act.id}`;
  if (buyerId) state.addFloatingText({ text: formatCurrency(-absAmount), type: FloatingTextType.Penalty, playerId: buyerId, actionType: 'ma_buyout', title: `Thâu tóm ${cellName}`, targetPlayerId: sellerId, targetPlayerName: sellerName, cellIndex: act.cellIndex, groupId });
  if (sellerId) {
    useVfxStore.getState().triggerPawnReaction(sellerId, 'slump_recoil', 400);
    SoundEngine.playSlumpThud();
    state.addFloatingText({ text: `+${formatCurrency(absAmount)}`, type: FloatingTextType.Reward, playerId: sellerId, actionType: 'ma_buyout', title: `⚠️ Bị thâu tóm: ${cellName}`, targetPlayerId: buyerId, targetPlayerName: buyerName, cellIndex: act.cellIndex, groupId });
  }
}

export function handleCardPenaltyBadge(act: ActivityLogEntry, state: GameState): void {
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
  if (amount === 0) return;
  const match = act.message.match(/\((.+?)\)/), cardTitle = match ? match[1] : 'Phiếu Sự Kiện';
  scheduleAction(() => {
    state.addFloatingText({ text: formatCurrency(amount), type: FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'chance', title: `Nộp Phạt: ${cardTitle} ➔ Kho Bạc`, cellIndex: act.cellIndex });
  }, getPawnLandingDelay(act.playerId));
}

export function handleTransitBadge(act: ActivityLogEntry, state: GameState, _delta?: DeltaPayload): void {
  const isDelay = act.message.includes('bị hoãn');
  state.addFloatingText({ text: act.message, type: isDelay ? FloatingTextType.Penalty : FloatingTextType.Bonus, playerId: act.playerId ?? '', actionType: 'transit', title: 'VÒNG XOAY VẬN TẢI', cellIndex: act.cellIndex, durationMs: 4000 });
}

const BADGE_HANDLERS: Record<string, (act: ActivityLogEntry, state: GameState, delta?: DeltaPayload) => void> = {
  rent: handleRentBadge, buy: handleBuyBadge, upgrade: handleUpgradeBadge, tax: handleTaxBadge, bail: handleBailBadge,
  salary: handleSalaryBadge, mortgage: handleMortgageBadge, unmortgage: handleUnmortgageBadge,
  auction: handleAuctionBadge, trade: handleTradeBadge, hose: handleHoseBadge, transit: handleTransitBadge,
  card: (act, state) => {
    if (act.id.startsWith('ma_buyout')) handleMaBuyoutBadge(act, state);
    else if (act.amount && act.amount < 0) handleCardPenaltyBadge(act, state);
  },
  system: (act, state) => {
    if (act.amount && act.amount > 0) {
      state.addFloatingText({ text: `+${formatCurrency(act.amount)}`, type: FloatingTextType.Reward, playerId: act.playerId ?? '', actionType: 'stimulus', title: act.message.includes('Kích Cầu') ? 'Trợ Cấp Kích Cầu Kho Bạc' : 'Tiền Thưởng Hệ Thống' });
    } else if (act.amount && act.amount < 0) {
      if (act.targetPlayerId) handleRentBadge(act, state);
      else state.addFloatingText({ text: formatCurrency(act.amount), type: FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'tax', title: act.message, cellIndex: act.cellIndex });
    }
  },
};

export function handleDiplomaticEventBadge(
  ev: { playerId: string; landlordId: string; cellIndex: number; savedRent: number },
  state: GameState,
): void {
  if (typeof state?.addFloatingText !== 'function') return;
  const pName = state.playersInfo[ev.playerId]?.name || 'Khách thuê', lName = state.playersInfo[ev.landlordId]?.name || 'Chủ đất', amt = formatCurrency(ev.savedRent), groupId = `diplo_${ev.cellIndex}_${ev.playerId}_${ev.landlordId}_${Date.now()}`;
  if (ev.playerId) state.addFloatingText({ text: `${amt} Tr.`, type: FloatingTextType.Reward, playerId: ev.playerId, actionType: 'diplomatic', title: 'Miễn Trừ Ngoại Giao', cellIndex: ev.cellIndex, targetPlayerId: ev.landlordId, targetPlayerName: lName, groupId });
  if (ev.landlordId) state.addFloatingText({ text: `-${amt} Tr.`, type: FloatingTextType.Penalty, playerId: ev.landlordId, actionType: 'diplomatic', title: `${pName} dùng Thẻ Ngoại Giao`, cellIndex: ev.cellIndex, targetPlayerId: ev.playerId, targetPlayerName: pName, groupId });
}

export function dispatchActivityFloatingBadges(activities: readonly ActivityLogEntry[], state: GameState, delta?: DeltaPayload): void {
  if (typeof state?.addFloatingText !== 'function') return;
  for (const act of activities) {
    if (act.amount !== undefined && Math.abs(act.amount) <= 0 && act.type !== 'trade' && act.type !== 'card' && act.type !== 'transit') continue;
    BADGE_HANDLERS[act.type]?.(act, state, delta);
  }
  if (delta?.lastDiplomaticEvent) handleDiplomaticEventBadge(delta.lastDiplomaticEvent, state);
}

