// [UI-S01/MSS] Zustand minimal store — levelMap + playerPositions
// Expanded in Slice UI-03 (HUD panel)
import { create } from 'zustand';

interface GameState {
  levelMap: Record<number, 0 | 1 | 2 | 3>;
  playerPositions: Record<string, number>;
  setLevelMap: (map: Record<number, 0 | 1 | 2 | 3>) => void;
  setPlayerPositions: (positions: Record<string, number>) => void;
}

export const useGameStore = create<GameState>((set) => ({
  levelMap: {},
  playerPositions: {},
  setLevelMap: (map) => set({ levelMap: map }),
  setPlayerPositions: (positions) => set({ playerPositions: positions }),
}));
