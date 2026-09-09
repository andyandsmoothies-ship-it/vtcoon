// [UI-S01/MSS] Board coordinate math — pure TypeScript, no React/Three.js
// SSOT: src/client/game_canvas.tsx
// 40 tiles distributed evenly along a 2*GRID perimeter: 10 steps of size (2*GRID)/10 = 1.8

export const GRID = 9 as const; // distance from center to corner (perimeter is 18x18)
export const CELL_STEP = 1.8 as const; // (2 * GRID) / 10 = 1.8 units per cell
export const CELL_SIZE = CELL_STEP; // alias for backward-compatibility

export function cellPosition(index: number): [number, number, number] {
  const side = Math.floor(index / 10);
  const step = index % 10;
  switch (side) {
    case 0: return [GRID - step * CELL_STEP, 0, GRID];
    case 1: return [-GRID, 0, GRID - step * CELL_STEP];
    case 2: return [-GRID + step * CELL_STEP, 0, -GRID];
    default: return [GRID, 0, -GRID + step * CELL_STEP];
  }
}
