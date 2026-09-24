// [UI-S06/MSS][IMP-187] ActivityBadgeDispatcher — Floating badge triggers, audio & VFX synchronization
import { type GameState, FloatingTextType } from '../store/game_store.js';
import type { ActivityLogEntry } from '../store/activity_store.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { useVfxStore } from '../store/vfx_store.js';
import { SoundEngine } from '../audio/sound_engine.js';
import { getCellName, LEVEL_NAMES } from './activity_property_tracker.js';

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

// [IMP-187] Badge xử lý M&A / Hoán Đổi Dự Án — Dập tắt Actor Inversion cho nạn nhân
function handleMaBuyoutBadge(act: ActivityLogEntry, state: GameState): void {
  const buyerId = act.playerId;
  const buyerInfo = buyerId ? state.playersInfo[buyerId] : undefined;
  const buyerName = act.playerName ?? (buyerInfo?.name || 'Người chơi');
  const absAmount = Math.abs(act.amount ?? 0);
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS';

  const match = act.message.match(/từ\s+(.+)$/);
  const sellerName = match ? match[1]?.trim() : undefined;
  const sellerId = sellerName
    ? Object.keys(state.playersInfo).find((id) => state.playersInfo[id]?.name === sellerName)
    : undefined;

  // 1. Phía bên mua: Thông báo thâu tóm tài sản
  if (buyerId) {
    state.addFloatingText({
      text: formatCurrency(-absAmount),
      type: FloatingTextType.Penalty,
      playerId: buyerId,
      actionType: 'ma_buyout',
      title: `Thâu tóm ${cellName}`,
      targetPlayerName: sellerName,
      cellIndex: act.cellIndex,
    });
  }

  // 2. Phía bên bán / Nạn nhân bị thâu tóm: Cảnh báo 2 dòng, triệt tiêu hoàn toàn victory_spin & chuông ăn mừng!
  if (sellerId) {
    useVfxStore.getState().triggerPawnReaction(sellerId, 'slump_recoil', 400);
    SoundEngine.playSlumpThud();
    state.addFloatingText({
      text: `${buyerName} bồi hoàn +${formatCurrency(absAmount)}`,
      type: FloatingTextType.Reward,
      playerId: sellerId,
      actionType: 'ma_buyout',
      title: `⚠️ Bị thâu tóm: ${cellName}`,
      targetPlayerName: buyerName,
      cellIndex: act.cellIndex,
    });
  }
}

const BADGE_HANDLERS: Record<string, (act: ActivityLogEntry, state: GameState) => void> = {
  rent: handleRentBadge,
  buy: handleBuyBadge,
  upgrade: handleUpgradeBadge,
  tax: handleTaxBadge,
  auction: handleAuctionBadge,
  card: (act, state) => {
    if (act.id.startsWith('ma_buyout')) {
      handleMaBuyoutBadge(act, state);
    }
  },
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
