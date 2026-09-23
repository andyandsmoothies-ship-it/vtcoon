// [TC-NET02.1/MSS][TC-NET02.2/MSS] Lobby Zustand Store — Quản lý sảnh chờ, slot người chơi & kiểm soát quyền Host
// Nguồn: docs/epics/networking/_epic_ledger.md § Slice NET-02
import { create } from 'zustand';
import { BotPersonality } from '../../domain/bot/bot_engine';
import { assignRandomPlayerPawns } from '../../domain/pawn_assignment';
import { generateRandomAnimalName } from '../../domain/name_generator';
import {
  MAX_LOBBY_SLOTS,
  ROOM_CODE_REGEX,
  type LobbySlot,
  type LobbyState,
  createEmptySlot,
  createDefaultSlots,
  getNextBotPersonality,
} from './lobby_types';
import { createNewRoomConfig } from '../offline_landing';

export * from './lobby_types';

export const useLobbyStore = create<LobbyState>((set, get) => ({
  roomCode: null,
  isJoining: false,
  myPlayerId: '',
  isHost: false,
  isReady: false,
  gameStarted: false,
  slots: createDefaultSlots(),
  errorReason: null,

  initLobby: (roomCode, playerId, isHost, playerName) => {
    const trimmedCode = roomCode.trim().toUpperCase();
    if (!ROOM_CODE_REGEX.test(trimmedCode)) {
      set({ errorReason: 'INVALID_ROOM_CODE' });
      return false;
    }
    const pid = playerId.trim();
    if (pid.length === 0) {
      set({ errorReason: 'INVALID_PLAYER_ID' });
      return false;
    }

    const assignments = assignRandomPlayerPawns(['slot_0', 'slot_1', 'slot_2', 'slot_3'], trimmedCode);
    const slots = createDefaultSlots().map((s, i) => {
      const assignment = assignments[i];
      const tokenColor = assignment?.tokenColor ?? s.tokenColor;
      const pawnSlot = assignment?.slotIndex;
      const mascotIcon = assignment?.mascotIcon;
      if (i === 0) {
        return isHost
          ? { ...s, playerId: pid, playerName: playerName ?? generateRandomAnimalName([], `${trimmedCode}_p1`), isHost: true, isReady: true, isOccupied: true, tokenColor, pawnSlot, mascotIcon }
          : { ...s, playerId: 'host_player', playerName: generateRandomAnimalName([], `${trimmedCode}_p1`), isHost: true, isReady: true, isOccupied: true, tokenColor, pawnSlot, mascotIcon };
      }
      if (i === 1 && !isHost) {
        return { ...s, playerId: pid, playerName: playerName ?? generateRandomAnimalName([], `${trimmedCode}_p2`), isHost: false, isReady: false, isOccupied: true, tokenColor, pawnSlot, mascotIcon };
      }
      return { ...s, tokenColor, pawnSlot, mascotIcon };
    });

    set({ roomCode: trimmedCode, isJoining: false, myPlayerId: pid, isHost, isReady: isHost, gameStarted: false, slots, errorReason: null });
    return true;
  },

  setRoomCode: (roomCode) => set({ roomCode }),

  toggleMyReady: () => {
    const { roomCode, myPlayerId, isHost, isReady, slots } = get();
    if (!roomCode || isHost) return;
    const nextReady = !isReady;
    set({ isReady: nextReady, slots: slots.map((s) => (s.playerId === myPlayerId ? { ...s, isReady: nextReady } : s)) });
  },

  setPlayerReady: (playerId, isReady) => {
    const { roomCode, slots, myPlayerId } = get();
    if (!roomCode) return { success: false, reasonCode: 'ROOM_NOT_FOUND' };
    const target = slots.find((s) => s.isOccupied && s.playerId === playerId);
    if (!target) return { success: false, reasonCode: 'INVALID_SLOT' };
    if (target.isHost) return { success: false, reasonCode: 'NOT_HOST' };
    if (target.isBot) return { success: false, reasonCode: 'SLOT_CONFLICT' };

    set({
      slots: slots.map((s) => (s.playerId === playerId ? { ...s, isReady } : s)),
      isReady: playerId === myPlayerId ? isReady : get().isReady,
    });
    return { success: true };
  },

  addGuestPlayer: (playerId, playerName) => {
    const { roomCode, slots } = get();
    if (!roomCode) return { success: false, reasonCode: 'ROOM_NOT_FOUND' };
    const cleanId = playerId.trim();
    if (cleanId.length === 0) return { success: false, reasonCode: 'INVALID_PLAYER_ID' };
    if (slots.some((s) => s.isOccupied && s.playerId === cleanId)) {
      return { success: false, reasonCode: 'PLAYER_ALREADY_IN_ROOM' };
    }

    const emptyIndex = slots.findIndex((s) => !s.isOccupied);
    if (emptyIndex === -1) return { success: false, reasonCode: 'ROOM_FULL' };

    const newSlot: LobbySlot = {
      ...slots[emptyIndex]!,
      playerId: cleanId,
      playerName,
      isHost: false,
      isReady: false,
      isBot: false,
      isOccupied: true,
    };
    set({ slots: slots.map((s, i) => (i === emptyIndex ? newSlot : s)) });
    return { success: true };
  },

  removePlayer: (playerId) => {
    const { roomCode, slots, myPlayerId } = get();
    if (!roomCode) return { success: false, reasonCode: 'ROOM_NOT_FOUND' };
    const target = slots.find((s) => s.isOccupied && s.playerId === playerId);
    if (!target) return { success: false, reasonCode: 'INVALID_SLOT' };
    if (target.isHost) return { success: false, reasonCode: 'CANNOT_REMOVE_HOST' };

    set({
      slots: slots.map((s, i) => (s.playerId === playerId ? createEmptySlot(i) : s)),
      isReady: playerId === myPlayerId ? false : get().isReady,
    });
    return { success: true };
  },

  toggleBotSlot: (slotIndex, personality) => {
    const { roomCode, slots, isHost } = get();
    if (!roomCode) return { success: false, reasonCode: 'ROOM_NOT_FOUND' };
    if (!isHost) return { success: false, reasonCode: 'NOT_HOST' };
    if (slotIndex < 1 || slotIndex >= MAX_LOBBY_SLOTS) return { success: false, reasonCode: 'INVALID_SLOT' };

    const current = slots[slotIndex];
    if (!current) return { success: false, reasonCode: 'INVALID_SLOT' };
    if (current.isOccupied && !current.isBot) return { success: false, reasonCode: 'SLOT_CONFLICT' };

    const p = personality ?? BotPersonality.Balanced;
    let updated: LobbySlot;
    if (current.isBot) {
      updated = personality && personality !== current.botPersonality
        ? { ...current, botPersonality: p, playerName: `Bot AI ${slotIndex + 1} (${p})` }
        : createEmptySlot(slotIndex);
    } else {
      updated = {
        ...current,
        playerId: `bot_${slotIndex + 1}`,
        playerName: `Bot AI ${slotIndex + 1} (${p})`,
        isBot: true,
        isReady: true,
        isHost: false,
        botPersonality: p,
        isOccupied: true,
      };
    }

    set({ slots: slots.map((s, i) => (i === slotIndex ? updated : s)) });
    return { success: true };
  },

  cycleBotPersonality: (slotIndex) => {
    const { roomCode, slots, isHost } = get();
    if (!roomCode) return { success: false, reasonCode: 'ROOM_NOT_FOUND' };
    if (!isHost) return { success: false, reasonCode: 'NOT_HOST' };
    if (slotIndex < 1 || slotIndex >= MAX_LOBBY_SLOTS) return { success: false, reasonCode: 'INVALID_SLOT' };

    const current = slots[slotIndex];
    if (!current || !current.isBot) return { success: false, reasonCode: 'SLOT_CONFLICT' };

    const nextP = getNextBotPersonality(current.botPersonality ?? BotPersonality.Balanced);
    const updated: LobbySlot = { ...current, botPersonality: nextP, playerName: `Bot AI ${slotIndex + 1} (${nextP})` };
    set({ slots: slots.map((s, i) => (i === slotIndex ? updated : s)) });
    return { success: true };
  },

  canStartGame: () => {
    const { roomCode, isHost, slots, gameStarted } = get();
    if (!roomCode) return { canStart: false, reasonCode: 'ROOM_NOT_FOUND' };
    if (gameStarted) return { canStart: false, reasonCode: 'ROOM_STARTED' };
    if (!isHost) return { canStart: false, reasonCode: 'NOT_HOST' };

    const occupied = slots.filter((s) => s.isOccupied);
    if (occupied.length < 2) return { canStart: false, reasonCode: 'NOT_ENOUGH_PLAYERS' };

    const unreadyGuest = slots.find((s) => s.isOccupied && !s.isHost && !s.isBot && !s.isReady);
    if (unreadyGuest) return { canStart: false, reasonCode: 'PLAYERS_NOT_READY' };

    return { canStart: true };
  },

  startGame: () => {
    const check = get().canStartGame();
    if (!check.canStart) return { success: false, reasonCode: check.reasonCode };
    set({ gameStarted: true });
    return { success: true };
  },

  setGameStarted: (gameStarted) => set({ gameStarted }),
  resetLobby: () =>
    set({ roomCode: null, isJoining: false, myPlayerId: '', isHost: false, isReady: false, gameStarted: false, slots: createDefaultSlots(), errorReason: null }),
  resetBotSlots: () =>
    set({ slots: get().slots.map((s, i) => (s.isBot ? createEmptySlot(i) : s)) }),

  confirmJoined: () => set({ isJoining: false }),

  setMyPlayerId: (myPlayerId) => set({ myPlayerId }),

  syncLobbySlots: (players) => {
    const { slots } = get();
    const updatedSlots = slots.map((slot, i) => {
      // Mapping slot index -> playerId: p1->0, p2->1, p3->2, p4->3
      const playerIdForSlot = `p${i + 1}`;
      const serverPlayer = players.find((p) => p.id === playerIdForSlot);
      if (serverPlayer) {
        // Người chơi thật từ server đè Bot AI cục bộ
        return {
          ...slot,
          playerId: serverPlayer.id,
          playerName: serverPlayer.name ?? slot.playerName,
          isHost: serverPlayer.isHost,
          isOccupied: true,
          isReady: true,
          isBot: false,
        };
      }
      // Slot không có người — giữ bot nếu có, hoặc empty
      return slot;
    });
    set({ slots: updatedSlots });
  },

  createCustomRoom: (isBotSolo?: boolean) => {
    const cfg = createNewRoomConfig(true);
    get().initLobby(cfg.roomCode, cfg.playerId, cfg.isHost, cfg.playerName);
    if (isBotSolo) {
      get().toggleBotSlot(1);
      get().toggleBotSlot(2);
      get().toggleBotSlot(3);
    }
    return { roomCode: cfg.roomCode, playerId: cfg.playerId };
  },

  joinCustomRoom: (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(cleanCode)) {
      return { success: false, reasonCode: 'INVALID_ROOM_CODE' };
    }
    get().initLobby(cleanCode, 'p2', false);
    set({ isJoining: true });
    if (typeof window !== 'undefined' && window.history) {
      window.history.replaceState({}, '', '?room=' + cleanCode);
    }
    return { success: true };
  },

  fillAllBotSlots: () => {
    const { slots, isHost } = get();
    if (!isHost) return;
    slots.forEach((s, idx) => {
      if (idx > 0 && !s.isOccupied) {
        get().toggleBotSlot(idx);
      }
    });
  },
}));

declare global {
  interface Window {
    __lobbyStore?: typeof useLobbyStore;
  }
}

if (typeof window !== 'undefined') {
  window.__lobbyStore = useLobbyStore;
}
