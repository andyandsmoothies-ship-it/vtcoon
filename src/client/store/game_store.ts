// [UI-S01/MSS][UI-S02/MSS][UI-S03/MSS][UI-S04/MSS] Zustand Store — State, 3D animations, HUD, player turns & modals
import { create } from 'zustand';
import { clampDiceFace } from '../3d/dice_math';
import { calculatePathWaypoints, BOARD_TOTAL_CELLS } from '../3d/pawn_path';
import { EMOTE_DISPLAY_DURATION_MS } from '../../domain/emotes';

export const FLOATING_TEXT_DURATION_MS = 2000;

export interface PawnAnimationState {
  readonly playerId: string;
  readonly fromCell: number;
  readonly waypoints: readonly number[];
  readonly currentIndex: number;
  readonly isAnimating: boolean;
}

export interface PlayerHudInfo {
  readonly id: string;
  readonly name: string;
  readonly balance: number;
  readonly tokenColor: string;
  readonly ownedProperties: readonly number[];
  readonly mortgagedProperties?: readonly number[];
  readonly mortgageLoans?: Record<number, number>;
  readonly inAudit?: boolean;
  readonly auditTurnsLeft?: number;
  readonly skipNextTurn?: boolean;
  readonly consecutiveDoubles?: number;
  readonly bankrupt?: boolean;
  readonly isBot?: boolean;
  readonly overdraftRoundsLeft?: number;
}

export interface ActiveEmote {
  readonly playerId: string;
  readonly emoteId: string;
  readonly timestamp: number;
}

export enum FloatingTextType {
  Reward = 'reward',
  Penalty = 'penalty',
}

export interface FloatingTextItem {
  readonly id: string;
  readonly text: string;
  readonly type: FloatingTextType;
  readonly playerId: string;
  readonly timestamp: number;
}

export type ActiveModalType = 'deed' | 'auction' | 'trade' | 'event' | 'hose' | 'insolvency' | 'game_over' | null;

export interface ModalPayloadMap {
  deed: { cellIndex: number; canBuy?: boolean };
  auction: {
    cellIndex: number;
    currentBid: number;
    highestBidderId: string | null;
    timeRemaining: number;
    hasPassed?: boolean;
    declinedPlayerId?: string;
  };
  trade: {
    targetPlayerId: string;
    offeredProperties: number[];
    requestedProperties: number[];
    cashOffer: number;
    cashRequest: number;
  };
  event: {
    cardType: 'chance' | 'market';
    cardId: string;
    title: string;
    description: string;
    effectDelta?: number;
  };
  hose: {
    minStake?: number;
    maxStake?: number;
    currentStake?: number;
    lastDiceRoll?: number;
    lastPayout?: number;
  };
  insolvency: {
    playerId: string;
    deficit: number;
  };
  game_over: {
    leaderboard: ReadonlyArray<{ readonly id: string; readonly netWorth: number }>;
  };
}

export interface GameState {
  readonly levelMap: Record<number, 0 | 1 | 2 | 3>;
  readonly playerPositions: Record<string, number>;
  readonly dice: [number, number];
  readonly isRolling: boolean;
  readonly hasRolledThisTurn: boolean;
  readonly activePawnAnimation: PawnAnimationState | null;

  // UI-03 HUD Financial & Turn States
  readonly playersInfo: Record<string, PlayerHudInfo>;
  readonly currentTurnPlayerId: string | null;
  readonly turnTimeRemaining: number;
  readonly treasuryPool: number;
  readonly roundNumber: number;
  readonly maxRounds: number;

  // UI-04 Business Modals State
  readonly activeModal: ActiveModalType;
  readonly modalPayload: ModalPayloadMap[keyof ModalPayloadMap] | null;

  // UI-05 Social Emotes & Micro-VFX
  readonly activeEmotes: Record<string, ActiveEmote>;
  readonly floatingTexts: readonly FloatingTextItem[];

  setLevelMap: (map: Record<number, 0 | 1 | 2 | 3>) => void;
  setPlayerPositions: (positions: Record<string, number>) => void;
  setDice: (dice: [number, number]) => void;
  setIsRolling: (isRolling: boolean) => void;
  setHasRolledThisTurn: (hasRolled: boolean) => void;
  triggerDiceRoll: (dice: [number, number]) => void;
  startPawnMove: (playerId: string, targetCell: number, fromCell?: number) => void;
  completePawnMove: (playerId: string) => void;

  // UI-03 HUD Actions
  setPlayersInfo: (players: Record<string, PlayerHudInfo>) => void;
  updatePlayerInfo: (playerId: string, partial: Partial<PlayerHudInfo>) => void;
  setCurrentTurnPlayerId: (playerId: string | null) => void;
  setTurnTimeRemaining: (seconds: number) => void;
  decrementTurnTimer: () => void;
  setTreasuryPool: (amount: number) => void;
  setRoundInfo: (round: number, maxRounds?: number) => void;

  // UI-04 Business Modals Actions
  openModal: <T extends keyof ModalPayloadMap>(type: T, payload: ModalPayloadMap[T]) => void;
  closeModal: () => void;
  updateModalPayload: <T extends keyof ModalPayloadMap>(patch: Partial<ModalPayloadMap[T]>) => void;

  // UI-05 Social Emotes & Micro-VFX Actions
  triggerEmote: (playerId: string, emoteId: string) => void;
  clearEmote: (playerId: string) => void;
  addFloatingText: (item: Omit<FloatingTextItem, 'id' | 'timestamp'> & { id?: string }) => void;
  removeFloatingText: (id: string) => void;
  clearExpiredFloatingTexts: (now?: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  levelMap: {},
  playerPositions: {},
  dice: [1, 1],
  isRolling: false,
  hasRolledThisTurn: false,
  activePawnAnimation: null,

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
  setPlayerPositions: (positions) => set({ playerPositions: positions }),

  setDice: (dice) =>
    set({ dice: [clampDiceFace(dice[0]), clampDiceFace(dice[1])] }),

  setIsRolling: (isRolling) => set({ isRolling }),

  setHasRolledThisTurn: (hasRolled) => set({ hasRolledThisTurn: hasRolled }),

  triggerDiceRoll: (dice) =>
    set({
      dice: [clampDiceFace(dice[0]), clampDiceFace(dice[1])],
      isRolling: true,
      hasRolledThisTurn: true,
    }),

  startPawnMove: (playerId, targetCell, fromCell) => {
    const state = get();
    if (state.activePawnAnimation?.isAnimating) {
      return;
    }
    if (
      !Number.isInteger(targetCell) ||
      targetCell < 0 ||
      targetCell >= BOARD_TOTAL_CELLS
    ) {
      return;
    }
    const currentPos = fromCell ?? state.playerPositions[playerId] ?? 0;
    if (currentPos === targetCell) {
      return;
    }
    const waypoints = calculatePathWaypoints(currentPos, targetCell);
    if (waypoints.length === 0) {
      return;
    }
    set({
      activePawnAnimation: {
        playerId,
        fromCell: currentPos,
        waypoints,
        currentIndex: 0,
        isAnimating: true,
      },
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
      activePawnAnimation: null,
    });
  },

  setPlayersInfo: (players) => set({ playersInfo: players }),

  updatePlayerInfo: (playerId, partial) => {
    const { playersInfo } = get();
    const existing = playersInfo[playerId];
    if (!existing) return;
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
      floatingTexts: [...state.floatingTexts, newItem],
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
