// [UI-S02/MSS][IMP-363] BatchedBoardTiles — Merged Geometry Batching for 40 Board Tiles
import React, { useMemo } from 'react';
import {
  type BufferGeometry,
  Matrix4,
} from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { RoundedBoxGeometry } from 'three-stdlib';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BOARD_CONFIG } from '../../domain/board_config';
import { cellPosition } from './board_coords';
import { tileRotation } from './board_layout_math.js';
import { getTileAtlasGeometry, getBoardTileAtlas } from './tile_texture_atlas';
import { useTextureRevision } from './texture_revision';

const surfacesGeometryCache = new Map<string, BufferGeometry>();
const basesGeometryCache = new Map<string, { standardBases: BufferGeometry; cornerBases: BufferGeometry }>();

export function resolveCellFromBoardClick(x: number, z: number): number {
  const maxCoord = Math.max(Math.abs(x), Math.abs(z));
  // [ADV-02] Guard Ring: reject center diorama / dice tray void (< 7.6) and outside table (> 10.5)
  if (maxCoord < 7.6 || maxCoord > 10.5) return -1;

  let closestIndex = -1;
  let minDistanceSq = Infinity;

  for (let i = 0; i < 40; i++) {
    const [cx, , cz] = cellPosition(i);
    const distSq = (x - cx) * (x - cx) + (z - cz) * (z - cz);
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closestIndex = i;
    }
  }

  return closestIndex;
}

export function createBatchedTileSurfacesGeometry(isMobile?: boolean): BufferGeometry {
  const cacheKey = isMobile ? 'mobile' : 'desktop';
  const cached = surfacesGeometryCache.get(cacheKey);
  if (cached) return cached;

  const geometries: BufferGeometry[] = [];

  for (const cell of BOARD_CONFIG) {
    const isCorner = cell.index === 0 || cell.index === 10 || cell.index === 20 || cell.index === 30;
    const geom = getTileAtlasGeometry(cell.index, isCorner).clone();

    const [tx, ty, tz] = cellPosition(cell.index);
    const [, ry] = tileRotation(cell.index);
    const localY = isCorner ? 0.115 : 0.103;

    // [ADV-06] Local-to-World matrix multiplication order: T(pos) * R(rot) * T(localY) * R(-PI/2)
    const matrix = new Matrix4()
      .makeTranslation(tx, ty, tz)
      .multiply(new Matrix4().makeRotationY(ry))
      .multiply(new Matrix4().makeTranslation(0, localY, 0))
      .multiply(new Matrix4().makeRotationX(-Math.PI / 2));

    geom.applyMatrix4(matrix);
    geometries.push(geom);
  }

  const merged = mergeGeometries(geometries, false);
  merged.computeBoundingBox();
  merged.computeBoundingSphere();

  surfacesGeometryCache.set(cacheKey, merged);
  return merged;
}

export function createBatchedTileBasesGeometry(isMobile?: boolean): { standardBases: BufferGeometry; cornerBases: BufferGeometry } {
  const cacheKey = isMobile ? 'mobile' : 'desktop';
  const cached = basesGeometryCache.get(cacheKey);
  if (cached) return cached;

  const standardList: BufferGeometry[] = [];
  const cornerList: BufferGeometry[] = [];
  const smoothness = isMobile ? 1 : 2;

  for (const cell of BOARD_CONFIG) {
    const isCorner = cell.index === 0 || cell.index === 10 || cell.index === 20 || cell.index === 30;
    const [tx, ty, tz] = cellPosition(cell.index);
    const [, ry] = tileRotation(cell.index);

    const matrix = new Matrix4()
      .makeTranslation(tx, ty, tz)
      .multiply(new Matrix4().makeRotationY(ry));

    if (isCorner) {
      // [ADV-04] Corner tile base: 2.2 x 0.22 x 2.2 with radius 0.08
      const geom = new RoundedBoxGeometry(2.2, 0.22, 2.2, smoothness, 0.08);
      geom.applyMatrix4(matrix);
      cornerList.push(geom);
    } else {
      // [ADV-04] Standard tile base: 1.68 x 0.2 x 2.2 with radius 0.08
      const geom = new RoundedBoxGeometry(1.68, 0.2, 2.2, smoothness, 0.08);
      geom.applyMatrix4(matrix);
      standardList.push(geom);
    }
  }

  const standardBases = mergeGeometries(standardList, false);
  standardBases.computeBoundingBox();
  standardBases.computeBoundingSphere();

  const cornerBases = mergeGeometries(cornerList, false);
  cornerBases.computeBoundingBox();
  cornerBases.computeBoundingSphere();

  const result = { standardBases, cornerBases };
  basesGeometryCache.set(cacheKey, result);
  return result;
}

export interface BatchedBoardTilesProps {
  readonly isMobile?: boolean;
  readonly onTileClick?: (cellIndex: number) => void;
}

export function BatchedBoardTiles({
  isMobile = false,
  onTileClick,
}: BatchedBoardTilesProps): React.ReactElement {
  // [ADV-03] Reactively bind tileAtlas with useTextureRevision for WebGL context loss recovery
  const textureRevision = useTextureRevision();
  const tileAtlas = useMemo(() => getBoardTileAtlas(isMobile), [isMobile, textureRevision]);

  // [ADV-05] Module-cached merged geometries
  const surfacesGeom = useMemo(() => createBatchedTileSurfacesGeometry(isMobile), [isMobile]);
  const { standardBases, cornerBases } = useMemo(() => createBatchedTileBasesGeometry(isMobile), [isMobile]);

  // [ADV-01] Exclusive pointer event handling for board tile surfaces
  const handleSurfaceClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!onTileClick || !e.point) return;
    const cellIdx = resolveCellFromBoardClick(e.point.x, e.point.z);
    if (cellIdx >= 0) {
      onTileClick(cellIdx);
    }
  };

  return (
    <group data-testid="batched-board-tiles">
      {/* 1. Merged Surfaces (40 tiles -> 1 Draw Call) */}
      <mesh
        data-testid="batched-tile-surfaces"
        geometry={surfacesGeom}
        receiveShadow
        onClick={handleSurfaceClick}
      >
        {tileAtlas ? (
          <meshStandardMaterial map={tileAtlas} roughness={0.98} metalness={0.0} envMapIntensity={0.0} />
        ) : (
          <meshStandardMaterial color="#EDE5D8" roughness={0.35} metalness={0.06} />
        )}
      </mesh>

      {/* 2. Merged Standard Bases (36 tiles -> 1 Draw Call) */}
      <mesh
        data-testid="batched-standard-bases"
        geometry={standardBases}
        receiveShadow
      >
        <meshStandardMaterial color="#EDE5D8" roughness={0.35} metalness={0.06} envMapIntensity={1.0} />
      </mesh>

      {/* 3. Merged Corner Bases (4 tiles -> 1 Draw Call) */}
      <mesh
        data-testid="batched-corner-bases"
        geometry={cornerBases}
        receiveShadow
      >
        <meshStandardMaterial color="#1E293B" roughness={0.16} metalness={0.25} envMapIntensity={1.2} />
      </mesh>
    </group>
  );
}
