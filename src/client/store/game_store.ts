// [UI-S01/MSS][UI-S02/MSS][UI-S03/MSS] Zustand Store — State, 3D animations, HUD & player turns
import { create } from 'zustand';
import { clampDiceFace } from '../3d/dice_math';
import { calculatePathWaypoints, BOARD_TOTAL_CELLS } from '../3d/pawn_path';

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
  readonly bankrupt?: boolean;
}

export interface GameState {
  readonly levelMap: Record<number, 0 | 1 | 2 | 3>;
  readonly playerPositions: Record<string, number>;
  readonly dice: [number, number];
  readonly isRolling: boolean;
  readonly activePawnAnimation: PawnAnimationState | null;

  // UI-03 HUD Financial & Turn States
  readonly playersInfo: Record<string, PlayerHudInfo>;
  readonly currentTurnPlayerId: string | null;
  readonly turnTimeRemaining: number;
  readonly treasuryPool: number;
  readonly roundNumber: number;
  readonly maxRounds: number;

  setLevelMap: (map: Record<number, 0 | 1 | 2 | 3>) => void;
  setPlayerPositions: (positions: Record<string, number>) => void;
  setDice: (dice: [number, number]) => void;
  setIsRolling: (isRolling: boolean) => void;
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
}

export const useGameStore = create<GameState>((set, get) => ({
  levelMap: {},
  playerPositions: {},
  dice: [1, 1],
  isRolling: false,
  activePawnAnimation: null,

  playersInfo: {},
  currentTurnPlayerId: null,
  turnTimeRemaining: 60,
  treasuryPool: 0,
  roundNumber: 1,
  maxRounds: 30,

  setLevelMap: (map) => set({ levelMap: map }),
  setPlayerPositions: (positions) => set({ playerPositions: positions }),

  setDice: (dice) =>
    set({ dice: [clampDiceFace(dice[0]), clampDiceFace(dice[1])] }),

  setIsRolling: (isRolling) => set({ isRolling }),

  triggerDiceRoll: (dice) =>
    set({
      dice: [clampDiceFace(dice[0]), clampDiceFace(dice[1])],
      isRolling: true,
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
      set({ currentTurnPlayerId: null });
      return;
    }
    const { playersInfo } = get();
    if (Object.keys(playersInfo).length > 0 && !playersInfo[playerId]) {
      return;
    }
    set({ currentTurnPlayerId: playerId });
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
}));
