// [UI-S01/MSS][UI-S02/MSS] Zustand Store — LevelMap, player positions, dice physics & pawn movement
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

export interface GameState {
  readonly levelMap: Record<number, 0 | 1 | 2 | 3>;
  readonly playerPositions: Record<string, number>;
  readonly dice: [number, number];
  readonly isRolling: boolean;
  readonly activePawnAnimation: PawnAnimationState | null;

  setLevelMap: (map: Record<number, 0 | 1 | 2 | 3>) => void;
  setPlayerPositions: (positions: Record<string, number>) => void;
  setDice: (dice: [number, number]) => void;
  setIsRolling: (isRolling: boolean) => void;
  triggerDiceRoll: (dice: [number, number]) => void;
  startPawnMove: (playerId: string, targetCell: number, fromCell?: number) => void;
  completePawnMove: (playerId: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  levelMap: {},
  playerPositions: {},
  dice: [1, 1],
  isRolling: false,
  activePawnAnimation: null,

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
}));
