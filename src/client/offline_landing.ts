// [UI-S03/MSS] offline_landing.ts — Fallback landing handlers and initial lobby configuration
import { BOARD_CONFIG, CellType } from '../domain/board_config';
import { AudioEngine } from './audio/audio_engine';
import { SoundEffect } from './audio/audio_types';
import { useGameStore, FloatingTextType } from './store/game_store';
import { useVfxStore } from './store/vfx_store';
import { SoundEngine } from './audio/sound_engine';
import { generateRandomAnimalName } from '../domain/name_generator';

export const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;

export function generateRandomRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'VT';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getInitialLobbyConfig(search?: string): {
  roomCode: string;
  playerId: string;
  isHost: boolean;
  playerName: string;
} {
  // Admin guard: không chạy replaceState cho Admin URL
  const loc = typeof window !== 'undefined' ? window.location : null;
  const searchStr = search ?? loc?.search ?? '';
  const hash = (loc as { hash?: string } | null)?.hash ?? '';
  if (searchStr.includes('admin=true') || hash.includes('admin') || hash.includes('/admin')) {
    return { roomCode: 'VTADMN', playerId: 'admin', isHost: false, playerName: 'Admin' };
  }

  const params = typeof window !== 'undefined' ? new URLSearchParams(searchStr || window.location.search) : null;
  const roomParam = params?.get('room');
  if (roomParam && /^[A-Z0-9]{6}$/i.test(roomParam)) {
    const code = roomParam.toUpperCase();
    const isStoredHost = typeof window !== 'undefined' && window.sessionStorage?.getItem(`vtcoon_host_${code}`) === 'true';
    const isHost = isStoredHost || params?.get('host') === 'true';
    const targetPid = isHost ? 'p1' : 'p2';
    return {
      roomCode: code,
      playerId: targetPid,
      isHost,
      playerName: generateRandomAnimalName([], `${code}_${targetPid}`),
    };
  }

  // Sinh mã mới và lưu flag host
  const randomCode = generateRandomRoomCode();
  if (typeof window !== 'undefined') {
    window.sessionStorage?.setItem(`vtcoon_host_${randomCode}`, 'true');
    window.history.replaceState(null, '', `?room=${randomCode}`);
  }
  return {
    roomCode: randomCode,
    playerId: 'p1',
    isHost: true,
    playerName: generateRandomAnimalName([], `${randomCode}_p1`),
  };
}

export function executeCellLanding(
  activeId: string,
  targetCell: number,
  currentTurnPlayerId: string | null,
  isConnected: boolean
): void {
  const tile = BOARD_CONFIG[targetCell];
  if (!tile) return;

  try {
    AudioEngine.handlePawnLanded(targetCell);
  } catch {
    /* safe-ignore: audio may be uninitialized or muted in headless environment */
  }

  const state = useGameStore.getState();
  const activePlayer = state.playersInfo[activeId];
  const isLocal = activeId === (currentTurnPlayerId ?? 'p1');

  if (tile.type === CellType.Property || tile.type === CellType.Railroad || tile.type === CellType.Utility) {
    const ownerEntry = Object.entries(state.playersInfo).find(([_, p]) =>
      p.ownedProperties?.includes(targetCell)
    );
    if (!ownerEntry) {
      if (isLocal) {
        state.openModal('deed', { cellIndex: targetCell, canBuy: (activePlayer?.balance ?? 0) >= 600 });
      }
    } else if (ownerEntry[0] !== activeId) {
      AudioEngine.playSfx(SoundEffect.TAX_PENALTY);
      // [IMP-125-P2] Kích hoạt hoạt cảnh biểu cảm quân cờ & âm thanh xúc giác
      useVfxStore.getState().triggerPawnReaction(ownerEntry[0], 'victory_spin', 600);
      useVfxStore.getState().triggerPawnReaction(activeId, 'slump_recoil', 400);
      SoundEngine.playVictoryChime();
      SoundEngine.playSlumpThud();

      if (!isConnected) {
        state.addFloatingText({
          text: '-500 Tr.',
          type: FloatingTextType.Penalty,
          playerId: activeId,
          actionType: 'rent_pay',
          title: `Tiền thuê ${tile.name}`,
        });
      }
    }
  } else if (tile.type === CellType.Chance) {
    if (isLocal) {
      const card = state.lastEventCard?.cardType === 'chance' ? state.lastEventCard : null;
      state.openModal('event', {
        cardType: 'chance',
        cardId: card?.cardId ?? `chance_${targetCell}`,
        title: card?.title ?? 'PHIẾU CƠ HỘI',
        description: card?.description ?? 'Cơ hội phát triển kinh doanh và mở rộng mạng lưới địa ốc.',
        ...(card?.effectDelta !== undefined ? { effectDelta: card.effectDelta } : {}),
      });
    }
  } else if (tile.type === CellType.Market) {
    if (isLocal) {
      const card = state.lastEventCard?.cardType === 'market' ? state.lastEventCard : null;
      state.openModal('event', {
        cardType: 'market',
        cardId: card?.cardId ?? `market_${targetCell}`,
        title: card?.title ?? 'PHIẾU THỊ TRƯỜNG',
        description: card?.description ?? 'Biến động chính sách vĩ mô và dòng vốn đầu tư toàn quốc.',
        ...(card?.effectDelta !== undefined ? { effectDelta: card.effectDelta } : {}),
      });
    }
  } else if (tile.type === CellType.Hose) {
    if (isLocal) {
      state.openModal('hose', { currentStake: 500 });
    }
  } else if (tile.type === CellType.Tax || tile.type === CellType.TaxOrder) {
    AudioEngine.playSfx(SoundEffect.TAX_PENALTY);
    if (!isConnected) {
      state.addFloatingText({
        text: '-1.000 Tr.',
        type: FloatingTextType.Penalty,
        playerId: activeId,
        actionType: 'tax',
        title: tile.name,
      });
    }
  } else if (tile.type === CellType.Go) {
    AudioEngine.playSfx(SoundEffect.BUY_PROPERTY);
    if (!isConnected) {
      state.addFloatingText({
        text: '+2.000 Tr.',
        type: FloatingTextType.Reward,
        playerId: activeId,
        actionType: 'salary',
        title: 'Lương Vượt GO',
      });
      const p = state.playersInfo[activeId];
      if (p) {
        state.updatePlayerInfo(activeId, { balance: p.balance + 2000 });
      }
    }
  }

  if (activePlayer && activePlayer.balance < 0 && isLocal) {
    state.openModal('insolvency', { playerId: activeId, deficit: -activePlayer.balance });
  }
}
