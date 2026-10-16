// [UI-S01/MSS][IMP-418] Board Layout Math Seam — Pure tile rotation math
// Zero dependencies, leaf module to break circular dependency between board layout & batching components

export function tileRotation(index: number): [number, number, number] {
  if (typeof index !== 'number' || Number.isNaN(index) || index < 0 || index > 39) {
    return [0, 0, 0];
  }
  if (index === 0) {
    return [0, Math.PI / 4, 0];
  }
  const side = Math.floor(index / 10);
  switch (side) {
    case 0: return [0, 0, 0];
    case 1: return [0, -Math.PI / 2, 0];
    case 2: return [0, Math.PI, 0];
    default: return [0, Math.PI / 2, 0];
  }
}
