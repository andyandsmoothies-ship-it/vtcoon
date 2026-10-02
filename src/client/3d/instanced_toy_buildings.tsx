// [UI-S02/MSS][IMP-PERF-THREEJS-INSTANCING] Centralized Instanced Mesh Batching for Houses & Hotels
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { BOARD_CONFIG, CellType } from '../../domain/board_config';
import { cellPosition } from './board_coords';
import { tileRotation } from './board_layout';
import { useGameStore } from '../store/game_store';

export const PROPERTY_CELL_INDICES: readonly number[] = BOARD_CONFIG
  .filter((c) => c.type === CellType.Property)
  .map((c) => c.index);

export const MAX_HOUSES_PER_TILE = 2;
export const TOTAL_HOUSE_INSTANCES = PROPERTY_CELL_INDICES.length * MAX_HOUSES_PER_TILE; // 44
export const TOTAL_HOTEL_INSTANCES = PROPERTY_CELL_INDICES.length; // 22

// 1. Geometries tĩnh đã bake sẵn offset & rotation (Zero transform overhead per frame)
export const HOUSE_BODY_GEOM = new THREE.BoxGeometry(0.22, 0.10, 0.16).translate(0, 0.05, 0);
export const HOUSE_ROOF_GEOM = new THREE.CylinderGeometry(0.07, 0.07, 0.22, 3)
  .rotateZ(Math.PI / 2)
  .translate(0, 0.13, 0);
export const HOUSE_CHIMNEY_GEOM = new THREE.BoxGeometry(0.035, 0.06, 0.035).translate(0.06, 0.16, 0.04);
export const HOUSE_WINDOW_GEOM = new THREE.BoxGeometry(0.12, 0.05, 0.008).translate(0, 0.05, 0.082);

export const HOTEL_BODY_GEOM = new THREE.BoxGeometry(0.46, 0.16, 0.20).translate(0, 0.08, 0);
export const HOTEL_TOWER_GEOM = new THREE.CylinderGeometry(0.07, 0.14, 0.10, 4)
  .rotateY(Math.PI / 4)
  .translate(0, 0.20, 0);
export const HOTEL_TRIM_GEOM = new THREE.BoxGeometry(0.47, 0.015, 0.21).translate(0, 0.165, 0);
export const HOTEL_WINDOW_GEOM = new THREE.BoxGeometry(0.38, 0.06, 0.008).translate(0, 0.08, 0.102);

// Reusable scratch matrices (Zero GC allocation in frame/update)
const _tileMat = new THREE.Matrix4();
const _localMat = new THREE.Matrix4();
const _euler = new THREE.Euler(0, 0, 0, 'XYZ');

export function composeToyWorldMatrix(
  cellIndex: number,
  localX: number,
  localY: number,
  localZ: number,
  targetMatrix: THREE.Matrix4 = new THREE.Matrix4()
): THREE.Matrix4 {
  const [tx, ty, tz] = cellPosition(cellIndex);
  const [rx, ry, rz] = tileRotation(cellIndex);

  _euler.set(rx, ry, rz, 'XYZ');
  _tileMat.makeRotationFromEuler(_euler);
  _tileMat.setPosition(tx, ty, tz);

  _localMat.makeTranslation(localX, localY, localZ);
  targetMatrix.multiplyMatrices(_tileMat, _localMat);
  return targetMatrix;
}

export function calculateHouseInstanceMatrix(
  cellIndex: number,
  slot: 0 | 1,
  level: number,
  targetMatrix: THREE.Matrix4 = new THREE.Matrix4()
): THREE.Matrix4 {
  if (!Number.isFinite(level) || level <= 0 || (level === 1 && slot !== 0) || level >= 3) {
    targetMatrix.makeScale(0, 0, 0);
    return targetMatrix;
  }
  const localX = level === 2 ? (slot === 0 ? -0.18 : 0.18) : 0;
  return composeToyWorldMatrix(cellIndex, localX, 0.125, -0.80, targetMatrix);
}

export function calculateHotelInstanceMatrix(
  cellIndex: number,
  level: number,
  targetMatrix: THREE.Matrix4 = new THREE.Matrix4()
): THREE.Matrix4 {
  if (!Number.isFinite(level) || level < 3) {
    targetMatrix.makeScale(0, 0, 0);
    return targetMatrix;
  }
  return composeToyWorldMatrix(cellIndex, 0, 0.125, -0.80, targetMatrix);
}

export interface InstancedBoardToyBuildingsProps {
  readonly levelMap?: Record<number, number>;
}

export function InstancedBoardToyBuildings({
  levelMap: propLevelMap,
}: InstancedBoardToyBuildingsProps): React.ReactElement {
  const storeLevelMap = useGameStore((s) => s.levelMap);
  const levelMap = propLevelMap ?? storeLevelMap ?? {};

  const houseBodyRef = useRef<THREE.InstancedMesh>(null);
  const houseRoofRef = useRef<THREE.InstancedMesh>(null);
  const houseChimneyRef = useRef<THREE.InstancedMesh>(null);
  const houseWindowRef = useRef<THREE.InstancedMesh>(null);

  const hotelBodyRef = useRef<THREE.InstancedMesh>(null);
  const hotelTowerRef = useRef<THREE.InstancedMesh>(null);
  const hotelTrimRef = useRef<THREE.InstancedMesh>(null);
  const hotelWindowRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const tempMatrix = new THREE.Matrix4();

    PROPERTY_CELL_INDICES.forEach((cellIndex, pIdx) => {
      const level = levelMap[cellIndex] ?? 0;

      // House Slot 0 & 1
      for (let slot = 0; slot < MAX_HOUSES_PER_TILE; slot++) {
        const instanceIdx = pIdx * MAX_HOUSES_PER_TILE + slot;
        const houseSlot: 0 | 1 = slot === 0 ? 0 : 1;
        calculateHouseInstanceMatrix(cellIndex, houseSlot, level, tempMatrix);
        houseBodyRef.current?.setMatrixAt(instanceIdx, tempMatrix);
        houseRoofRef.current?.setMatrixAt(instanceIdx, tempMatrix);
        houseChimneyRef.current?.setMatrixAt(instanceIdx, tempMatrix);
        houseWindowRef.current?.setMatrixAt(instanceIdx, tempMatrix);
      }

      // Hotel Slot
      calculateHotelInstanceMatrix(cellIndex, level, tempMatrix);
      hotelBodyRef.current?.setMatrixAt(pIdx, tempMatrix);
      hotelTowerRef.current?.setMatrixAt(pIdx, tempMatrix);
      hotelTrimRef.current?.setMatrixAt(pIdx, tempMatrix);
      hotelWindowRef.current?.setMatrixAt(pIdx, tempMatrix);
    });

    if (houseBodyRef.current) houseBodyRef.current.instanceMatrix.needsUpdate = true;
    if (houseRoofRef.current) houseRoofRef.current.instanceMatrix.needsUpdate = true;
    if (houseChimneyRef.current) houseChimneyRef.current.instanceMatrix.needsUpdate = true;
    if (houseWindowRef.current) houseWindowRef.current.instanceMatrix.needsUpdate = true;

    if (hotelBodyRef.current) hotelBodyRef.current.instanceMatrix.needsUpdate = true;
    if (hotelTowerRef.current) hotelTowerRef.current.instanceMatrix.needsUpdate = true;
    if (hotelTrimRef.current) hotelTrimRef.current.instanceMatrix.needsUpdate = true;
    if (hotelWindowRef.current) hotelWindowRef.current.instanceMatrix.needsUpdate = true;
  }, [levelMap]);

  return (
    <group data-testid="instanced-board-toy-buildings">
      {/* 
        frustumCulled={false}: InstancedMesh bounding sphere chưa được recomputed
        sau setMatrixAt (Three.js limitation). Tắt culling để tránh instances
        biến mất bất ngờ. ROI của fix < 0.1ms (tiết kiệm < 8 draw calls), deferred intentionally.
        Ref: Tech Debt Ledger (IMP-242).
      */}
      {/* 4 Cụm Nhà Xanh Lục Bảo */}
      <instancedMesh ref={houseBodyRef} args={[HOUSE_BODY_GEOM, undefined, TOTAL_HOUSE_INSTANCES]} castShadow castshadow="true" receiveShadow frustumCulled={false} frustumculled="false">
        <meshStandardMaterial color="#10B981" roughness={0.15} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={houseRoofRef} args={[HOUSE_ROOF_GEOM, undefined, TOTAL_HOUSE_INSTANCES]} castShadow castshadow="true" frustumCulled={false} frustumculled="false">
        <meshStandardMaterial color="#10B981" roughness={0.15} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={houseChimneyRef} args={[HOUSE_CHIMNEY_GEOM, undefined, TOTAL_HOUSE_INSTANCES]} frustumCulled={false} frustumculled="false">
        <meshStandardMaterial color="#059669" roughness={0.25} metalness={0.05} />
      </instancedMesh>
      <instancedMesh ref={houseWindowRef} args={[HOUSE_WINDOW_GEOM, undefined, TOTAL_HOUSE_INSTANCES]} frustumCulled={false} frustumculled="false">
        <meshStandardMaterial color="#34D399" roughness={0.2} metalness={0.1} />
      </instancedMesh>

      {/* 4 Cụm Khách Sạn Đỏ Ruby */}
      <instancedMesh ref={hotelBodyRef} args={[HOTEL_BODY_GEOM, undefined, TOTAL_HOTEL_INSTANCES]} castShadow castshadow="true" receiveShadow frustumCulled={false} frustumculled="false">
        <meshStandardMaterial color="#DC2626" roughness={0.15} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={hotelTowerRef} args={[HOTEL_TOWER_GEOM, undefined, TOTAL_HOTEL_INSTANCES]} castShadow castshadow="true" frustumCulled={false} frustumculled="false">
        <meshStandardMaterial color="#DC2626" roughness={0.15} metalness={0.1} />
      </instancedMesh>
      <instancedMesh ref={hotelTrimRef} args={[HOTEL_TRIM_GEOM, undefined, TOTAL_HOTEL_INSTANCES]} frustumCulled={false} frustumculled="false">
        <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.85} />
      </instancedMesh>
      <instancedMesh ref={hotelWindowRef} args={[HOTEL_WINDOW_GEOM, undefined, TOTAL_HOTEL_INSTANCES]} frustumCulled={false} frustumculled="false">
        <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.6} />
      </instancedMesh>
    </group>
  );
}
