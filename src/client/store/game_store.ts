// [UI-S01/MSS][UI-S02/MSS][UI-S03/MSS][UI-S04/MSS] Zustand Store — State, 3D animations, HUD, player turns & modals
import { create } from 'zustand';
import { clampDiceFace } from '../3d/dice_math';
import { calculatePathWaypoints, BOARD_TOTAL_CELLS } from '../3d/pawn_path';
import { EMOTE_DISPLAY_DURATION_MS } from '../../domain/emotes';

export const FLOATING_TEXT_DURATION_MS = 2000;
export const MAX_FLOATING_TEXTS = 15;

export * from './game_store_types.js';
import { type GameState, type FloatingTextItem, FloatingTextType } from './game_store_types.js';

export const useGameStore = create<GameState>((set, get) => ({
  levelMap: {},
  playerPositions: {},
  visualPositions: {},
  dice: [1, 1],
  isRolling: false,
  hasRolledThisTurn: false,
  activePawnAnimation: null,
  pawnAnimationQueue: [],
  pendingPawnMove: null,
  lastLandedPawn: null,

  playersInfo: {},
  currentTurnPlayerId: null,
  turnTimeRemaining: 60,
  treasuryPool: 0,
  roundNumber: 1,
  maxRounds: 30,

  activeModal: null,
  modalPayload: null,

  activeEmotes: {},
  floatingTexts: [],

  setLevelMap: (map) => set({ levelMap: map }),
  setPlayerPositions: (positions) => {
    const state = get();
    const isBusy = Boolean(state.activePawnAnimation?.isAnimating) || (state.pawnAnimationQueue?.length ?? 0) > 0;
    const visualPositions = isBusy ? { ...state.visualPositions } : { ...positions };
    if (isBusy) {
      for (const [id, pos] of Object.entries(positions)) {
        if (visualPositions[id] === undefined) {
          visualPositions[id] = pos;
        }
      }
    }
    set({ playerPositions: positions, visualPositions });
  },
  setVisualPositions: (positions) => set({ visualPositions: positions }),

  setDice: (dice) =>
    set({ dice: [clampDiceFace(dice[0]), clampDiceFace(dice[1])] }),

  setPendingPawnMove: (move) => set({ pendingPawnMove: move }),

  enqueuePawnMove: (task) => {
    const state = get();
    if (!Number.isInteger(task.targetCell) || task.targetCell < 0 || task.targetCell >= BOARD_TOTAL_CELLS) {
      return;
    }
    if (task.fromCell === task.targetCell) {
      return;
    }
    const currentQueue = state.pawnAnimationQueue ?? [];
    set({ pawnAnimationQueue: [...currentQueue, task] });
    if (!state.activePawnAnimation?.isAnimating && !state.isRolling) {
      get().processPawnQueue();
    }
  },

  processPawnQueue: () => {
    const state = get();
    if (state.activePawnAnimation?.isAnimating || state.isRolling) {
      return;
    }
    const queue = state.pawnAnimationQueue;
    if (!queue || queue.length === 0) {
      return;
    }
    const [nextTask, ...remaining] = queue;
    if (!nextTask) return;

    set({
      pawnAnimationQueue: remaining,
      activePawnAnimation: {
        playerId: nextTask.playerId,
        fromCell: nextTask.fromCell,
        waypoints: nextTask.waypoints,
        currentIndex: 0,
        isAnimating: true,
        isBot: nextTask.isBot,
      },
    });

    const isBot = Boolean(nextTask.isBot);
    const stepDuration = isBot ? 200 : 340;
    const timeoutMs = Math.max(2000, nextTask.waypoints.length * stepDuration + 500);
    setTimeout(() => {
      const anim = get().activePawnAnimation;
      if (anim && anim.playerId === nextTask.playerId && anim.isAnimating) {
        get().completePawnMove(nextTask.playerId);
      }
    }, timeoutMs);
  },

  setIsRolling: (isRolling) => {
    set({ isRolling });
    if (!isRolling) {
      const pending = get().pendingPawnMove;
      if (pending) {
        set({ pendingPawnMove: null });
        get().startPawnMove(pending.playerId, pending.targetCell, pending.fromCell);
      }
      get().processPawnQueue();
    } else {
      setTimeout(() => {
        if (get().isRolling) {
          get().setIsRolling(false);
        }
      }, 2500);
    }
  },

  setHasRolledThisTurn: (hasRolled) => set({ hasRolledThisTurn: hasRolled }),

  triggerDiceRoll: (dice) => {
    set({
      dice: [clampDiceFace(dice[0]), clampDiceFace(dice[1])],
      isRolling: true,
      hasRolledThisTurn: true,
    });
    setTimeout(() => {
      if (get().isRolling) {
        get().setIsRolling(false);
      }
    }, 2500);
  },

  startPawnMove: (playerId, targetCell, fromCell, isBot) => {
    const state = get();
    if (
      !Number.isInteger(targetCell) ||
      targetCell < 0 ||
      targetCell >= BOARD_TOTAL_CELLS
    ) {
      return;
    }
    const isBusy = Boolean(state.activePawnAnimation?.isAnimating) || (state.pawnAnimationQueue?.length ?? 0) > 0;
    const currentPos = fromCell ?? (isBusy ? state.visualPositions?.[playerId] : undefined) ?? state.playerPositions?.[playerId] ?? state.visualPositions?.[playerId] ?? 0;
    if (currentPos === targetCell) {
      return;
    }
    const waypoints = calculatePathWaypoints(currentPos, targetCell);
    if (waypoints.length === 0) {
      return;
    }
    get().enqueuePawnMove({
      playerId,
      fromCell: currentPos,
      targetCell,
      waypoints,
      isBot,
    });
  },

  completePawnMove: (playerId) => {
    const state = get();
    const anim = state.activePawnAnimation;
    if (anim && anim.playerId !== playerId) {
      return;
    }
    const finalPos =
      anim && anim.playerId === playerId && anim.waypoints.length > 0
        ? anim.waypoints[anim.waypoints.length - 1]!
        : (state.playerPositions[playerId] ?? 0);

    set({
      playerPositions: {
        ...state.playerPositions,
        [playerId]: finalPos,
      },
      visualPositions: {
        ...state.visualPositions,
        [playerId]: finalPos,
      },
      activePawnAnimation: null,
      lastLandedPawn: {
        playerId,
        cellIndex: finalPos,
        timestamp: Date.now(),
      },
    });
    get().processPawnQueue();
  },

  clearActivePawnAnimation: () => {
    set({
      activePawnAnimation: null,
      pendingPawnMove: null,
      pawnAnimationQueue: [],
      visualPositions: { ...get().playerPositions },
    });
  },

  setPlayersInfo: (players) => set({ playersInfo: players }),

  updatePlayerInfo: (playerId, partial) => {
    const { playersInfo } = get();
    const existing = playersInfo[playerId];
    if (!existing) return;
    const oldBalance = existing.balance;
    const newBalance = partial.balance !== undefined ? partial.balance : oldBalance;
    if (oldBalance !== undefined && oldBalance < 0 && newBalance >= 0) {
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

  setTurnTimeRemaining: (seconds) =>
    set({ turnTimeRemaining: Math.max(0, Math.floor(seconds)) }),

  decrementTurnTimer: () =>
    set((state) => ({
      turnTimeRemaining: Math.max(0, state.turnTimeRemaining - 1),
    })),

  setTreasuryPool: (amount) =>
    set({ treasuryPool: Math.max(0, Math.floor(amount)) }),

  setRoundInfo: (round, maxRounds) =>
    set((state) => ({
      roundNumber: Math.max(1, round),
      maxRounds: maxRounds ?? state.maxRounds,
    })),

  openModal: (type, payload) => set({ activeModal: type, modalPayload: payload }),
  closeModal: () => set({ activeModal: null, modalPayload: null }),
  updateModalPayload: (patch) =>
    set((state) => ({
      modalPayload: state.modalPayload ? { ...state.modalPayload, ...patch } : state.modalPayload,
    })),

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
    const newItem: FloatingTextItem = {
      id,
      text: item.text,
      type: item.type,
      playerId: item.playerId,
      timestamp,
    };
    set((state) => ({
      floatingTexts: [...state.floatingTexts, newItem].slice(-MAX_FLOATING_TEXTS),
    }));
    if (typeof setTimeout !== 'undefined') {
      setTimeout(() => {
        get().removeFloatingText(id);
      }, FLOATING_TEXT_DURATION_MS);
    }
  },

  removeFloatingText: (id) =>
    set((state) => ({
      floatingTexts: state.floatingTexts.filter((t) => t.id !== id),
    })),

  clearExpiredFloatingTexts: (now = Date.now()) =>
    set((state) => ({
      floatingTexts: state.floatingTexts.filter((t) => now - t.timestamp < FLOATING_TEXT_DURATION_MS),
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

