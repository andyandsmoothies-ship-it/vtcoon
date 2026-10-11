// [UI-S02/MSS][IMP-363] BatchedBoardTiles — Merged Geometry Batching for 40 Board Tiles
import React from 'react';
import type { BufferGeometry } from 'three';

export function createBatchedTileSurfacesGeometry(_isMobile?: boolean): BufferGeometry {
  throw new Error('Not implemented');
}

export function createBatchedTileBasesGeometry(_isMobile?: boolean): { standardBases: BufferGeometry; cornerBases: BufferGeometry } {
  throw new Error('Not implemented');
}

export function resolveCellFromBoardClick(_x: number, _z: number): number {
  throw new Error('Not implemented');
}

export interface BatchedBoardTilesProps {
  readonly isMobile?: boolean;
  readonly onTileClick?: (cellIndex: number) => void;
}

export function BatchedBoardTiles(_props: BatchedBoardTilesProps): React.ReactElement | null {
  return null;
}
