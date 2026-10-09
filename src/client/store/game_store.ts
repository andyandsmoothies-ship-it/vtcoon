// [UI-S01/MSS][UI-S02/MSS][UI-S03/MSS][UI-S04/MSS] Zustand Store — State, 3D animations, HUD, player turns & modals
import { create } from 'zustand';
import { EMOTE_DISPLAY_DURATION_MS } from '../../domain/emotes';
import { createPawnActions } from './game_store_pawn_actions.js';

export const FLOATING_TEXT_DURATION_MS = 2200;
export const EVENT_BANNER_DURATION_MS = 4500;
export const TRANSACTION_POPUP_DURATION_MS = 3600;
export const MAX_FLOATING_TEXTS = 6;

export * from './game_store_types.js';
import { type GameState, type FloatingTextItem, FloatingTextType, INITIAL_GAME_STATE } from './game_store_types.js';
import { clearPendingBadgeTimers } from '../network/activity_badge_dispatcher.js';

export const useGameStore = create<GameState>((set, get) => ({
  ...INITIAL_GAME_STATE,

  // IMP-133 Camera Sticky Focus & IMP-190 Custom Orbit Camera
  setCameraFocusCell: (cellIndex) => set({ cameraFocusCell: cellIndex }),
  setHasUserCustomCamera: (hasUserCustomCamera) => set({ hasUserCustomCamera }),
  resetGameState: () => {
    clearPendingBadgeTimers();
    set(INITIAL_GAME_STATE);
  },

  setLevelMap: (map) => set({ levelMap: map }),
  setPropertyStates: (propertyStates) => set({ propertyStates }),
  ...createPawnActions(set, get),

  setPlayersInfo: (players) => set({ playersInfo: players }),

  updatePlayerInfo: (playerId, partial) => {
    const { playersInfo } = get();
    const existing = playersInfo[playerId];
    if (!existing) return;
    const oldBalance = existing.balance;
    const newBalance = partial.balance !== undefined ? partial.balance : oldBalance;
    if (!partial.bankrupt && !existing.bankrupt && oldBalance !== undefined && oldBalance < 0 && newBalance >= 0) {
      const state = get();
      if (state.activeModal === 'insolvency') {
        state.closeModal();
      }
      state.addFloatingText({
        text: '🎉 Thoát vỡ nợ thành công! Hãy bấm Hết Lượt.',
        type: FloatingTextType.Reward,
        playerId,
      });
    }
    set({
      playersInfo: {
        ...playersInfo,
        [playerId]: { ...existing, ...partial },
      },
    });
  },

  setCurrentTurnPlayerId: (playerId) => {
    if (playerId === null) {
      set({ currentTurnPlayerId: null, hasRolledThisTurn: false });
      return;
    }
    const { playersInfo } = get();
    if (Object.keys(playersInfo).length > 0 && !playersInfo[playerId]) {
      return;
    }
    set({ currentTurnPlayerId: playerId, hasRolledThisTurn: false });
  },

  setTurnTimeRemaining: (seconds) => set({ turnTimeRemaining: Math.max(0, Math.floor(seconds)) }),
  decrementTurnTimer: () => set((state) => ({ turnTimeRemaining: Math.max(0, state.turnTimeRemaining - 1) })),
  setTurnPhase: (turnPhase) => set({ turnPhase }),
  setTreasuryPool: (amount) => set({ treasuryPool: Math.max(0, Math.floor(amount)) }),
  setRoundInfo: (round, maxRounds) =>
    set((state) => ({
      roundNumber: Math.max(1, round),
      maxRounds: maxRounds ?? state.maxRounds,
    })),
  setRoundNumber: (round) => set({ roundNumber: Math.max(1, round) }),
  setActiveModifiers: (modifiers) => set({ activeModifiers: modifiers ? [...modifiers] : [] }),
  toggleHeatmap: () => set((state) => ({ isHeatmapActive: !state.isHeatmapActive })),
  setHeatmapActive: (active) => set({ isHeatmapActive: active }),
  setSpotlightedCells: (cells) => set({ spotlightedCellIndices: cells }),
  togglePlayerHudVisibility: () => set((state) => ({ isPlayerHudVisible: !state.isPlayerHudVisible })),

  openModal: (type, payload) => set({ activeModal: type, modalPayload: payload }),
  closeModal: () =>
    set((state) => {
      const isAuction = state.activeModal === 'auction';
      const cellIndex = isAuction && state.modalPayload && 'cellIndex' in state.modalPayload
        ? (state.modalPayload as { cellIndex?: number }).cellIndex ?? null
        : null;
      return {
        activeModal: null,
        modalPayload: null,
        ...(cellIndex !== null ? { dismissedAuctionCellIndex: cellIndex } : {}),
      };
    }),
  setLastEventCard: (card) => set({ lastEventCard: card }),
  setPendingBuyout: (pendingBuyout) => set({ pendingBuyout }),
  setPendingTradeOffer: (pendingTradeOffer) => set({ pendingTradeOffer }),
  updateModalPayload: (patch) =>
    set((state) => ({
      modalPayload: state.modalPayload ? { ...state.modalPayload, ...patch } : state.modalPayload,
    })),
  dismissedAuctionCellIndex: null,
  setAuction: (auction) => set({ auction }),
  setDismissedAuctionCellIndex: (cellIndex) => set({ dismissedAuctionCellIndex: cellIndex }),
  dismissAuction: (cellIndex) =>
    set({ dismissedAuctionCellIndex: cellIndex, activeModal: null, modalPayload: null }),
  restoreAuction: () => {
    const current = get().auction;
    set({ dismissedAuctionCellIndex: null });
    if (current) {
      const remaining = current.deadline !== undefined
        ? Math.max(0, Math.ceil((current.deadline - Date.now()) / 1000))
        : (current.timeRemaining ?? 0);
      get().openModal('auction', { ...current, timeRemaining: remaining });
    }
  },

  triggerEmote: (playerId, emoteId) => {
    const timestamp = Date.now();
    set((state) => ({
      activeEmotes: {
        ...state.activeEmotes,
        [playerId]: { playerId, emoteId, timestamp },
      },
    }));
    if (typeof setTimeout !== 'undefined') {
      setTimeout(() => {
        const cur = get().activeEmotes[playerId];
        if (cur && cur.timestamp === timestamp) {
          get().clearEmote(playerId);
        }
      }, EMOTE_DISPLAY_DURATION_MS);
    }
  },

  clearEmote: (playerId) =>
    set((state) => {
      if (!state.activeEmotes[playerId]) return state;
      const next = { ...state.activeEmotes };
      delete next[playerId];
      return { activeEmotes: next };
    }),

  addFloatingText: (item) => {
    const id = item.id ?? `ft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const timestamp = Date.now();
    const isMilestone = Boolean(item.actionType && /^(chance|market|monopoly|debt_relief|bankrupt)$/.test(item.actionType));
    const duration = item.durationMs ?? (isMilestone ? EVENT_BANNER_DURATION_MS : TRANSACTION_POPUP_DURATION_MS);
    const newItem: FloatingTextItem = {
      id, text: item.text, type: item.type, playerId: item.playerId, timestamp, durationMs: duration,
      ...(item.actionType ? { actionType: item.actionType } : {}),
      ...(item.title ? { title: item.title } : {}),
      ...(item.cellIndex !== undefined ? { cellIndex: item.cellIndex } : {}),
      ...(item.targetPlayerName ? { targetPlayerName: item.targetPlayerName } : {}),
      ...(item.targetPlayerId ? { targetPlayerId: item.targetPlayerId } : {}),
      ...(item.formula ? { formula: item.formula } : {}),
      ...(item.bailKind ? { bailKind: item.bailKind } : {}),
      ...(item.groupId ? { groupId: item.groupId } : {}),
      ...(item.isBoardWide !== undefined ? { isBoardWide: item.isBoardWide } : {}),
    };
    set((state) => ({ floatingTexts: [...state.floatingTexts, newItem].slice(-MAX_FLOATING_TEXTS) }));
    if (typeof setTimeout !== 'undefined') setTimeout(() => { get().removeFloatingText(id); }, duration);
  },

  removeFloatingText: (id) =>
    set((state) => {
      const gId = state.floatingTexts.find((t) => t.id === id)?.groupId;
      return { floatingTexts: state.floatingTexts.filter((t) => t.id !== id && (!gId || t.groupId !== gId)) };
    }),

  clearExpiredFloatingTexts: (now = Date.now()) =>
    set((state) => ({
      floatingTexts: state.floatingTexts.filter(
        (t) => now - t.timestamp < (t.durationMs ?? FLOATING_TEXT_DURATION_MS),
      ),
    })),
}));

declare global {
  interface Window {
    __gameStore?: typeof useGameStore;
  }
}

if (typeof window !== 'undefined') {
  window.__gameStore = useGameStore;
}
