// [UI-S03/MSS][IMP-410] Building Lot Transform Seam
// Pure geometric calculation of lot transforms across standard and corner splay lots.

import { BUILDING_BASE_PLINTH_WIDTH } from './building_typology';

export interface BuildingLotTransform {
  readonly position: [number, number, number];
  readonly rotation: [number, number, number];
  readonly scale: [number, number, number];
  readonly baseWidth?: number;
}

export const STANDARD_LOT_TRANSFORM: BuildingLotTransform = {
  position: [0, 0.16, -1.38],
  rotation: [0, 0, 0],
  scale: [0.975, 0.975, 0.975],
  baseWidth: BUILDING_BASE_PLINTH_WIDTH,
};

export const CORNER_SPLAY_TRANSFORMS: Readonly<Record<number, BuildingLotTransform>> = {
  1: { position: [-0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
  39: { position: [0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
  9: { position: [0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
  11: { position: [-0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
  19: { position: [0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
  21: { position: [-0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
  29: { position: [0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
  31: { position: [-0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
};

export function getBuildingLotTransform(cellIndex?: number): BuildingLotTransform {
  return (cellIndex !== undefined ? CORNER_SPLAY_TRANSFORMS[cellIndex] : undefined) ?? STANDARD_LOT_TRANSFORM;
}
