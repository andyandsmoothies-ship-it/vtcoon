// [IMP-306] Game Store Pawn Actions Slice
import { clampDiceFace } from '../3d/dice_math.js';
import { calculatePathWaypoints, BOARD_TOTAL_CELLS } from '../3d/pawn_path.js';
import type { GameState, PawnMoveTask, PendingPawnMove } from './game_store_types.js';

type StoreSet = (partial: Partial<GameState> | ((state: GameState) => Partial<GameState>)) => void;
type StoreGet = () => GameState;

function createPositionActions(set: StoreSet, get: StoreGet) {
  return {
    setPlayerPositions: (positions: Record<string, number>): void => {
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

    setVisualPositions: (positions: Record<string, number>): void => set({ visualPositions: positions }),

    setPendingPawnMove: (move: PendingPawnMove | null): void => set({ pendingPawnMove: move }),
  };
}

function createDiceActions(set: StoreSet, get: StoreGet) {
  return {
    setDice: (dice: readonly [number, number]): void =>
      set({ dice: [clampDiceFace(dice[0]), clampDiceFace(dice[1])] }),

    setHasRolledThisTurn: (hasRolled: boolean): void => set({ hasRolledThisTurn: hasRolled }),

    setLastDiceSeq: (lastDiceSeq: number | undefined): void => set({ lastDiceSeq }),

    setIsRolling: (isRolling: boolean): void => {
      set({ isRolling, ...(isRolling ? { cameraFocusCell: null, hasUserCustomCamera: false } : {}) });
      if (!isRolling) {
        const pending = get().pendingPawnMove;
        if (pending && get().activeModal !== 'transit_wheel') {
          set({ pendingPawnMove: null });
          get().startPawnMove(pending.playerId, pending.targetCell, pending.fromCell, pending.isBot, pending.isJailFlight);
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

    triggerDiceRoll: (dice: readonly [number, number], diceSeq?: number): void => {
      const state = get();
      if (diceSeq !== undefined && state.lastDiceSeq !== undefined && diceSeq <= state.lastDiceSeq) {
        return;
      }
      set({
        dice: [clampDiceFace(dice[0]), clampDiceFace(dice[1])],
        isRolling: true,
        hasRolledThisTurn: true,
        cameraFocusCell: null,
        hasUserCustomCamera: false,
        ...(diceSeq !== undefined ? { lastDiceSeq: diceSeq } : {}),
      });
      setTimeout(() => {
        if (get().isRolling) {
          get().setIsRolling(false);
        }
      }, 2500);
    },
  };
}

function createQueueActions(set: StoreSet, get: StoreGet) {
  return {
    enqueuePawnMove: (task: PawnMoveTask): void => {
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

    processPawnQueue: (): void => {
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
          ...(nextTask.isJailFlight ? { isJailFlight: true } : {}),
        },
      });

      const timeoutMs = Math.max(10000, nextTask.waypoints.length * 1500 + 8000);
      setTimeout(() => {
        const anim = get().activePawnAnimation;
        if (anim && anim.playerId === nextTask.playerId && anim.isAnimating) {
          get().completePawnMove(nextTask.playerId);
        }
      }, timeoutMs);
    },
  };
}

function createPawnTransitionActions(set: StoreSet, get: StoreGet) {
  return {
    startPawnMove: (
      playerId: string,
      targetCell: number,
      fromCell?: number,
      isBot?: boolean,
      isJailFlight?: boolean,
    ): void => {
      const state = get();
      if (!Number.isInteger(targetCell) || targetCell < 0 || targetCell >= BOARD_TOTAL_CELLS) {
        return;
      }
      const isBusy = Boolean(state.activePawnAnimation?.isAnimating) || (state.pawnAnimationQueue?.length ?? 0) > 0;
      const currentPos = fromCell ?? (isBusy ? state.visualPositions?.[playerId] : undefined) ?? state.playerPositions?.[playerId] ?? state.visualPositions?.[playerId] ?? 0;
      if (currentPos === targetCell) {
        return;
      }
      const waypoints = isJailFlight ? [targetCell] : calculatePathWaypoints(currentPos, targetCell);
      if (waypoints.length === 0) {
        return;
      }
      get().enqueuePawnMove({
        playerId,
        fromCell: currentPos,
        targetCell,
        waypoints,
        isBot,
        ...(isJailFlight ? { isJailFlight: true } : {}),
      });
    },

    completePawnMove: (playerId: string): void => {
      const state = get();
      const anim = state.activePawnAnimation;
      if (anim && anim.playerId !== playerId) {
        return;
      }
      const finalPos =
        anim && anim.playerId === playerId && anim.waypoints.length > 0
          ? anim.waypoints[anim.waypoints.length - 1]!
          : (state.playerPositions[playerId] ?? 0);

      const currentStorePos = state.playerPositions[playerId];
      const animTarget = anim?.waypoints && anim.waypoints.length > 0 ? anim.waypoints[anim.waypoints.length - 1]! : anim?.fromCell;
      const shouldUpdatePlayerPosition =
        currentStorePos === undefined ||
        currentStorePos === animTarget ||
        (anim?.fromCell !== undefined && currentStorePos === anim.fromCell);

      set({
        playerPositions: shouldUpdatePlayerPosition
          ? {
              ...state.playerPositions,
              [playerId]: finalPos,
            }
          : state.playerPositions,
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

    clearActivePawnAnimation: (): void => {
      set({
        activePawnAnimation: null,
        pendingPawnMove: null,
        pawnAnimationQueue: [],
        visualPositions: { ...get().playerPositions },
      });
    },
  };
}

export function createPawnActions(set: StoreSet, get: StoreGet) {
  return {
    ...createPositionActions(set, get),
    ...createDiceActions(set, get),
    ...createQueueActions(set, get),
    ...createPawnTransitionActions(set, get),
  };
}
