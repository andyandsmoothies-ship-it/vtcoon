// [UI-S03/MSS][IMP-404] InstancedRegionalBuildingsPool — Zero-GC Mobile Building Hulls & Channel-Split Awning Pool
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { BOARD_CONFIG, CellType, type BoardCell } from '../../domain/board_config';
import { COLOR_GROUP_HEX } from '../../domain/theme';
import { useGameStore } from '../store/game_store';
import { useVfxStore, type ActiveSlam } from '../store/vfx_store';
import { tileRotation } from './board_coords';
import { getRegionalTypology, type RegionalTypology } from './building_typology';
import { calculateImpactDrop, getBuildingWorldPosition } from './construction_slam_vfx';
import { getBuildingLotTransform } from './procedural_building';
import {
  MOBILE_ARCHETYPES_GLB_URL,
  disposeMobileArchetypeGeometries,
  getMobileArchetypeGeometry,
  getMobileAwningBandGeometry,
  getTypologyAwningTransform,
  resolveRenderTierProfile,
} from './procedural_mobile_blender_meshes';
import { useSafeFrame } from './safe_frame';

export interface RegionalBuildingPoolDescriptor {
  readonly slotIndex: number;
  readonly cellIndex: number;
  readonly typology: RegionalTypology;
  readonly level: 0 | 1 | 2 | 3;
  readonly groupColor: string;
  readonly worldPosition: readonly [number, number, number];
  readonly awningWorldPosition: readonly [number, number, number];
  readonly awningScale: readonly [number, number, number];
  readonly rotationY: number;
  readonly scale: readonly [number, number, number];
}

export interface InstancedRegionalBuildingsPoolProps {
  readonly levelMap?: Readonly<Record<number, number>>;
  readonly isMobile?: boolean;
  readonly isIOS?: boolean;
}

interface BodyPoolBucket {
  readonly typology: RegionalTypology;
  readonly level: 1 | 2;
  readonly ref: React.RefObject<THREE.InstancedMesh | null>;
}

const PROPERTY_CELLS: readonly BoardCell[] = BOARD_CONFIG.filter((c) => c.type === CellType.Property);
const POOL_CAPACITY = PROPERTY_CELLS.length; // 22
const ZERO_SCALE: readonly [number, number, number] = [0, 0, 0];

const _posVec = new THREE.Vector3();
const _scaleVec = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler(0, 0, 0, 'XYZ');
const _scratchMat = new THREE.Matrix4();
const _zeroMat = new THREE.Matrix4().makeScale(0, 0, 0);
const _scratchColor = new THREE.Color();

function clampBuildingLevel(rawLevel: number | undefined): 0 | 1 | 2 | 3 {
  if (rawLevel === 1 || rawLevel === 2 || rawLevel === 3) return rawLevel;
  return 0;
}

function resolveSlamTransform(
  baseY: number,
  baseScale: readonly [number, number, number],
  slam: ActiveSlam | undefined,
  nowMs: number | undefined
): { readonly worldY: number; readonly scale: readonly [number, number, number] } {
  if (!slam) {
    return { worldY: baseY, scale: [baseScale[0], baseScale[1], baseScale[2]] };
  }
  const elapsed = (nowMs ?? Date.now()) - slam.startTime;
  const drop = calculateImpactDrop(elapsed, slam.impactTimeMs);
  return {
    worldY: baseY + drop.yOffset,
    scale: [baseScale[0] * drop.scaleXZ, baseScale[1] * drop.scaleY, baseScale[2] * drop.scaleXZ],
  };
}

function buildCellDescriptor(
  cell: BoardCell,
  slotIndex: number,
  levelMap?: Readonly<Record<number, number>>,
  activeSlams?: Readonly<Record<number, ActiveSlam>> | null,
  nowMs?: number,
  minVerticalStepMm = 20
): RegionalBuildingPoolDescriptor {
  const cellIndex = cell.index;
  const typology = getRegionalTypology(cellIndex) ?? 'metropolis';
  const groupColor = cell.colorGroup ? COLOR_GROUP_HEX[cell.colorGroup] : '#64748B';
  const level = clampBuildingLevel(levelMap?.[cellIndex]);
  const [wx, , wz] = getBuildingWorldPosition(cellIndex);
  const lot = getBuildingLotTransform(cellIndex);
  const rotationY = tileRotation(cellIndex)[1] + lot.rotation[1];

  if (level !== 1 && level !== 2) {
    const basePos: readonly [number, number, number] = [wx, lot.position[1], wz];
    return {
      slotIndex,
      cellIndex,
      typology,
      level,
      groupColor,
      worldPosition: basePos,
      awningWorldPosition: basePos,
      awningScale: ZERO_SCALE,
      rotationY,
      scale: ZERO_SCALE,
    };
  }

  const { worldY, scale } = resolveSlamTransform(lot.position[1], lot.scale, activeSlams?.[cellIndex], nowMs);
  const awningTr = getTypologyAwningTransform(typology, level, minVerticalStepMm);
  const awningZ = awningTr.zOffset * scale[2];
  return {
    slotIndex,
    cellIndex,
    typology,
    level,
    groupColor,
    worldPosition: [wx, worldY, wz],
    awningWorldPosition: [
      wx + awningZ * Math.sin(rotationY),
      worldY + awningTr.yOffset * scale[1],
      wz + awningZ * Math.cos(rotationY),
    ],
    awningScale: [awningTr.scale[0] * scale[0], awningTr.scale[1] * scale[1], awningTr.scale[2] * scale[2]],
    rotationY,
    scale,
  };
}

export function computeRegionalBuildingPoolDescriptors(
  levelMap?: Readonly<Record<number, number>>,
  activeSlams?: Readonly<Record<number, ActiveSlam>> | null,
  nowMs?: number,
  minVerticalStepMm = 20
): ReadonlyArray<RegionalBuildingPoolDescriptor> {
  return PROPERTY_CELLS.map((cell, slotIndex) =>
    buildCellDescriptor(cell, slotIndex, levelMap, activeSlams, nowMs, minVerticalStepMm)
  );
}

function composeTransformMatrix(
  pos: readonly [number, number, number],
  rotY: number,
  scale: readonly [number, number, number]
): THREE.Matrix4 {
  _posVec.set(pos[0], pos[1], pos[2]);
  _euler.set(0, rotY, 0, 'XYZ');
  _quat.setFromEuler(_euler);
  _scaleVec.set(scale[0], scale[1], scale[2]);
  return _scratchMat.compose(_posVec, _quat, _scaleVec);
}

function updateBodyBucketMesh(
  bucket: BodyPoolBucket,
  descriptors: ReadonlyArray<RegionalBuildingPoolDescriptor>
): void {
  const mesh = bucket.ref.current;
  if (!mesh || typeof mesh.setMatrixAt !== 'function') return;
  for (const desc of descriptors) {
    const matches = desc.typology === bucket.typology && desc.level === bucket.level;
    const mat = matches ? composeTransformMatrix(desc.worldPosition, desc.rotationY, desc.scale) : _zeroMat;
    mesh.setMatrixAt(desc.slotIndex, mat);
  }
  if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
}

function updateAwningBucketMesh(
  mesh: THREE.InstancedMesh | null,
  targetLevel: 1 | 2,
  descriptors: ReadonlyArray<RegionalBuildingPoolDescriptor>
): void {
  if (!mesh || typeof mesh.setMatrixAt !== 'function') return;
  for (const desc of descriptors) {
    const matches = desc.level === targetLevel;
    const mat = matches
      ? composeTransformMatrix(desc.awningWorldPosition, desc.rotationY, desc.awningScale)
      : _zeroMat;
    mesh.setMatrixAt(desc.slotIndex, mat);
    if (typeof mesh.setColorAt === 'function') {
      mesh.setColorAt(desc.slotIndex, _scratchColor.set(desc.groupColor));
    }
  }
  if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

function applyPoolDescriptors(
  buckets: readonly BodyPoolBucket[],
  awningC1: THREE.InstancedMesh | null,
  awningC2: THREE.InstancedMesh | null,
  descriptors: ReadonlyArray<RegionalBuildingPoolDescriptor>
): void {
  for (const bucket of buckets) {
    updateBodyBucketMesh(bucket, descriptors);
  }
  updateAwningBucketMesh(awningC1, 1, descriptors);
  updateAwningBucketMesh(awningC2, 2, descriptors);
}

function hasAnyActiveSlam(slams?: Readonly<Record<number, ActiveSlam>> | null): boolean {
  if (!slams) return false;
  for (const key in slams) {
    if (Object.prototype.hasOwnProperty.call(slams, key)) return true;
  }
  return false;
}

export function InstancedRegionalBuildingsPool({
  levelMap: propLevelMap,
  isMobile = false,
  isIOS = false,
}: InstancedRegionalBuildingsPoolProps): React.ReactElement | null {
  const tierProfile = resolveRenderTierProfile({ isMobile, isIOS });
  const isPoolActive = tierProfile.buildingRenderMode === 'INSTANCED_POOL_VERTEX_AO';
  const storeLevelMap = useGameStore((s) => s.levelMap);
  const activeSlams = useVfxStore((s) => s.activeSlams);
  const resolvedLevelMap = propLevelMap ?? storeLevelMap;
  const wasSlammingRef = useRef<boolean>(false);

  const riverineC1Ref = useRef<THREE.InstancedMesh | null>(null);
  const riverineC2Ref = useRef<THREE.InstancedMesh | null>(null);
  const resortC1Ref = useRef<THREE.InstancedMesh | null>(null);
  const resortC2Ref = useRef<THREE.InstancedMesh | null>(null);
  const heritageC1Ref = useRef<THREE.InstancedMesh | null>(null);
  const heritageC2Ref = useRef<THREE.InstancedMesh | null>(null);
  const metropolisC1Ref = useRef<THREE.InstancedMesh | null>(null);
  const metropolisC2Ref = useRef<THREE.InstancedMesh | null>(null);
  const awningC1Ref = useRef<THREE.InstancedMesh | null>(null);
  const awningC2Ref = useRef<THREE.InstancedMesh | null>(null);

  const bodyBuckets: readonly BodyPoolBucket[] = [
    { typology: 'riverine', level: 1, ref: riverineC1Ref },
    { typology: 'riverine', level: 2, ref: riverineC2Ref },
    { typology: 'resort', level: 1, ref: resortC1Ref },
    { typology: 'resort', level: 2, ref: resortC2Ref },
    { typology: 'heritage', level: 1, ref: heritageC1Ref },
    { typology: 'heritage', level: 2, ref: heritageC2Ref },
    { typology: 'metropolis', level: 1, ref: metropolisC1Ref },
    { typology: 'metropolis', level: 2, ref: metropolisC2Ref },
  ];

  useLayoutEffect(() => {
    if (!isPoolActive) return;
    const descriptors = computeRegionalBuildingPoolDescriptors(
      resolvedLevelMap,
      activeSlams,
       undefined,
      tierProfile.minVerticalStepMm
    );
    applyPoolDescriptors(bodyBuckets, awningC1Ref.current, awningC2Ref.current, descriptors);
  }, [isPoolActive, resolvedLevelMap, activeSlams, tierProfile.minVerticalStepMm]);

  useSafeFrame(() => {
    if (!isPoolActive || tierProfile.activeFpsCap <= 0) return;
    const liveSlams = useVfxStore.getState()?.activeSlams;
    const hasSlams = hasAnyActiveSlam(liveSlams);
    if (!hasSlams && !wasSlammingRef.current) return;
    wasSlammingRef.current = hasSlams;
    const liveDescriptors = computeRegionalBuildingPoolDescriptors(
      resolvedLevelMap,
      hasSlams ? liveSlams : null,
      Date.now(),
      tierProfile.minVerticalStepMm
    );
    applyPoolDescriptors(bodyBuckets, awningC1Ref.current, awningC2Ref.current, liveDescriptors);
  });

  useEffect(() => {
    if (!isPoolActive) return undefined;
    return () => disposeMobileArchetypeGeometries();
  }, [isPoolActive]);

  if (!isPoolActive) {
    return null;
  }

  return (
    <group
      data-testid="instanced-regional-buildings-pool"
      data-tier={tierProfile.tierId}
      data-max-dpr={tierProfile.maxDpr}
      data-fps-cap={`${tierProfile.activeFpsCap}:${tierProfile.idleFpsCap}`}
      data-archetype-glb={MOBILE_ARCHETYPES_GLB_URL}
    >
      {bodyBuckets.map((bucket) => (
        <instancedMesh
          key={`${bucket.typology}-${bucket.level}`}
          ref={bucket.ref}
          args={[getMobileArchetypeGeometry(bucket.typology, bucket.level), undefined, POOL_CAPACITY]}
          frustumCulled={false}
        >
          <meshStandardMaterial vertexColors={true} roughness={0.42} metalness={0.12} />
        </instancedMesh>
      ))}
      <instancedMesh
        ref={awningC1Ref}
        args={[getMobileAwningBandGeometry(1), undefined, POOL_CAPACITY]}
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={0.3} metalness={0.2} />
      </instancedMesh>
      <instancedMesh
        ref={awningC2Ref}
        args={[getMobileAwningBandGeometry(2), undefined, POOL_CAPACITY]}
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={0.3} metalness={0.2} />
      </instancedMesh>
    </group>
  );
}
