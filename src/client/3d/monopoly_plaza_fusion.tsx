// [UI-S01/MSS][IMP-401][IMP-406] MonopolyPlazaFusion — Desktop Contiguous Marble Promenades (.glb) & Mobile Instanced Pool + Domino Shockwave
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Color, Euler, type Group, type InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three';
import { useVfxStore } from '../store/vfx_store';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';
import { useSafeFrame } from './safe_frame';
import { getMonopolyColorGroupCells, hasNewMonopolyGroup, type MonopolyGroupInfo } from './monopoly_plaza_math';
import {
  MAX_MONOPOLY_ARCHWAY_SLOTS, MAX_MONOPOLY_PROMENADE_SLOTS,
  computeMobileMonopolyArchwayPoolSlots, computeMobileMonopolyPromenadePoolSlots,
  disposeMobileMonopolyArchwayGeometries, getMobileMonopolyArchwayGeometry,
  getMobileMonopolyPromenadeSlotGeometry, resolveMobilePoolDominoSlam, type MobileMonopolyPoolSlotMatrix,
} from './monopoly_mobile_archway_visuals';
import {
  calculateDominoRippleTransform, createBatchedMonopolyPromenadeGeometries,
  disposeBatchedMonopolyPromenadeGeometries, getMonopolyBoulevardSegments,
  MONOPOLY_ARCHWAY_MODEL_URL, resolveNeighborDominoSlam,
} from './monopoly_plaza_visuals';

export interface MonopolyPlazaFusionProps {
  readonly monopolyGroups?: Record<string, MonopolyGroupInfo> | null;
  readonly isHeatmapActive?: boolean;
  readonly isMobile?: boolean;
  readonly enableMobileInstancedPool?: boolean;
}

const _posVec = new Vector3();
const _scaleVec = new Vector3();
const _quat = new Quaternion();
const _euler = new Euler(0, 0, 0, 'YXZ');
const _mat = new Matrix4();
const _color = new Color();

function applySlotsToInstancedMesh(
  mesh: InstancedMesh | null, slots: ReadonlyArray<MobileMonopolyPoolSlotMatrix>, withColor = false
): void {
  if (!mesh || typeof mesh.setMatrixAt !== 'function') return;
  for (const slot of slots) {
    _posVec.set(slot.position[0], slot.position[1], slot.position[2]);
    _euler.set(slot.pitchX, slot.rotationY, 0, 'YXZ');
    _quat.setFromEuler(_euler);
    _scaleVec.set(slot.scale[0], slot.scale[1], slot.scale[2]);
    mesh.setMatrixAt(slot.slotIndex, _mat.compose(_posVec, _quat, _scaleVec));
    if (withColor && typeof mesh.setColorAt === 'function') mesh.setColorAt(slot.slotIndex, _color.set(slot.ownerColor));
  }
  if (mesh.instanceMatrix) mesh.instanceMatrix.needsUpdate = true;
  if (withColor && mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  if (typeof mesh.computeBoundingSphere === 'function') mesh.computeBoundingSphere();
}

export function MonopolyPlazaFusion({
  monopolyGroups, isHeatmapActive = false, isMobile = false, enableMobileInstancedPool = false,
}: MonopolyPlazaFusionProps): React.ReactElement | null {
  const fusionGroupRef = useRef<Group>(null);
  const archwayInstancedRef = useRef<InstancedMesh | null>(null);
  const promenadeInstancedRef = useRef<InstancedMesh | null>(null);
  const wasRipplingRef = useRef<boolean>(false);
  const prevGroupsRef = useRef<Record<string, MonopolyGroupInfo> | null | undefined>(monopolyGroups);

  const bundle = useMemo(() => {
    if (isMobile || !monopolyGroups || Object.keys(monopolyGroups).length === 0) {
      return null;
    }
    const segments = getMonopolyBoulevardSegments(monopolyGroups);
    if (segments.length === 0) return null;
    const geometries = createBatchedMonopolyPromenadeGeometries(monopolyGroups, segments);
    SafeGLTFModel.preload(MONOPOLY_ARCHWAY_MODEL_URL);
    return { segments, geometries };
  }, [monopolyGroups, isMobile]);

  useEffect(() => {
    if ((!isMobile || enableMobileInstancedPool) && monopolyGroups && hasNewMonopolyGroup(prevGroupsRef.current, monopolyGroups)) {
      const prev = prevGroupsRef.current ?? {};
      for (const [key, group] of Object.entries(monopolyGroups)) {
        if (key in prev || !group) continue;
        const cells = group.cells && group.cells.length > 0 ? group.cells : getMonopolyColorGroupCells(group.colorGroup);
        const anchorCell = cells[0];
        if (typeof anchorCell === 'number') {
          useVfxStore.getState().triggerConstructionSlam(anchorCell, 1);
          break;
        }
      }
    }
    prevGroupsRef.current = monopolyGroups;
  }, [monopolyGroups, isMobile, enableMobileInstancedPool]);

  useEffect(() => () => {
    if (isMobile && enableMobileInstancedPool) disposeMobileMonopolyArchwayGeometries();
    else if (!isMobile) disposeBatchedMonopolyPromenadeGeometries();
  }, [isMobile, enableMobileInstancedPool]);

  useLayoutEffect(() => {
    if (!isMobile || !enableMobileInstancedPool || !monopolyGroups) return;
    const archSlots = computeMobileMonopolyArchwayPoolSlots(monopolyGroups, useVfxStore.getState()?.activeSlams);
    const promSlots = computeMobileMonopolyPromenadePoolSlots(monopolyGroups);
    applySlotsToInstancedMesh(archwayInstancedRef.current, archSlots, false);
    applySlotsToInstancedMesh(promenadeInstancedRef.current, promSlots, true);
  }, [isMobile, enableMobileInstancedPool, monopolyGroups]);

  useSafeFrame(() => {
    if (isMobile) {
      if (!enableMobileInstancedPool || !archwayInstancedRef.current || !monopolyGroups) return;
      const liveSlams = useVfxStore.getState()?.activeSlams;
      const nowMs = Date.now();
      let hasMobileHit = false;
      for (const groupKey in monopolyGroups) {
        const group = monopolyGroups[groupKey];
        if (!group) continue;
        const cells = group.cells && group.cells.length > 0 ? group.cells : getMonopolyColorGroupCells(group.colorGroup);
        for (const cellIdx of cells) {
          if (resolveMobilePoolDominoSlam(cellIdx, liveSlams, nowMs)) {
            hasMobileHit = true;
            break;
          }
        }
        if (hasMobileHit) break;
      }
      if (hasMobileHit) {
        const liveSlots = computeMobileMonopolyArchwayPoolSlots(monopolyGroups, liveSlams, nowMs);
        if (liveSlots.some((s) => s.active && (s.position[1] > 0.118 || s.pitchX !== 0))) {
          wasRipplingRef.current = true;
          applySlotsToInstancedMesh(archwayInstancedRef.current, liveSlots, false);
          return;
        }
      }
      if (wasRipplingRef.current) {
        const settledSlots = computeMobileMonopolyArchwayPoolSlots(monopolyGroups, null, nowMs);
        applySlotsToInstancedMesh(archwayInstancedRef.current, settledSlots, false);
        wasRipplingRef.current = false;
      }
      return;
    }

    if (!fusionGroupRef.current || !bundle) return;
    const liveSlams = useVfxStore.getState()?.activeSlams;
    let activeDomino: ReturnType<typeof resolveNeighborDominoSlam> = null;
    for (const seg of bundle.segments) {
      for (const cellIdx of seg.cells) {
        const hit = resolveNeighborDominoSlam(cellIdx, liveSlams, isMobile);
        if (hit && (!activeDomino || hit.distanceInCells < activeDomino.distanceInCells)) {
          activeDomino = hit;
        }
      }
    }
    if (activeDomino) {
      const elapsed = Date.now() - (activeDomino.slam.startTime + activeDomino.slam.impactTimeMs);
      const ripple = calculateDominoRippleTransform(activeDomino.distanceInCells, elapsed);
      if (!ripple.isSettled) {
        wasRipplingRef.current = true;
        fusionGroupRef.current.position.y = ripple.yOffset;
        fusionGroupRef.current.rotation.x = ripple.pitchRad;
        fusionGroupRef.current.scale.set(1, ripple.scaleY, 1);
        return;
      }
    }
    if (wasRipplingRef.current) {
      fusionGroupRef.current.position.y = 0;
      fusionGroupRef.current.rotation.x = 0;
      fusionGroupRef.current.scale.set(1, 1, 1);
      wasRipplingRef.current = false;
    }
  });

  if (isMobile) {
    if (!enableMobileInstancedPool || !monopolyGroups || Object.keys(monopolyGroups).length === 0) return null;
    const archwaySlots = computeMobileMonopolyArchwayPoolSlots(monopolyGroups, useVfxStore.getState()?.activeSlams);
    if (!archwaySlots.some((s) => s.active)) return null;
    const archwayGeom = getMobileMonopolyArchwayGeometry();
    const promenadeGeom = getMobileMonopolyPromenadeSlotGeometry();
    return (
      <group
        ref={fusionGroupRef}
        name="MobileInstancedMonopolyPlazaGroup"
        data-testid="mobile-instanced-monopoly-plaza"
        data-active-groups={archwaySlots.filter((s) => s.active).map((s) => s.colorGroup).join(',')}
      >
        <instancedMesh ref={archwayInstancedRef} args={[archwayGeom, undefined, MAX_MONOPOLY_ARCHWAY_SLOTS]} frustumCulled={false} data-testid="mobile-instanced-monopoly-archways">
          <meshStandardMaterial color="#FFFFFF" vertexColors={true} roughness={0.32} metalness={0.18} />
        </instancedMesh>
        <instancedMesh ref={promenadeInstancedRef} args={[promenadeGeom, undefined, MAX_MONOPOLY_PROMENADE_SLOTS]} frustumCulled={false} data-testid="mobile-instanced-monopoly-promenades">
          <meshStandardMaterial color="#FFFFFF" roughness={0.28} metalness={0.15} />
        </instancedMesh>
      </group>
    );
  }

  if (!bundle) return null;
  const { segments, geometries } = bundle;
  const garlandEmissive = isHeatmapActive ? 1.1 : 0.45;

  return (
    <group ref={fusionGroupRef} name="MonopolyPlazaFusionGroup">
      <mesh geometry={geometries.marblePromenadeGeom} receiveShadow>
        <meshStandardMaterial color="#F8FAFC" roughness={0.24} metalness={0.05} />
      </mesh>
      <mesh geometry={geometries.brassTrimGeom} castShadow receiveShadow>
        <meshStandardMaterial color="#D97706" roughness={0.2} metalness={0.9} />
      </mesh>
      <mesh geometry={geometries.streetlampsGeom} castShadow>
        <meshStandardMaterial color="#D97706" roughness={0.22} metalness={0.88} />
      </mesh>
      <mesh geometry={geometries.lampBulbsGeom}>
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={isHeatmapActive ? 1.2 : 0.65} roughness={0.15} metalness={0.2} />
      </mesh>
      {segments.map((seg) => (
        <group
          key={seg.id} name="InnerPlazaGarland" data-testid="inner-plaza-garland"
          data-color-group={seg.colorGroup} data-board-side={seg.boardSide}
          position={[...seg.worldPosition]} rotation={[0, seg.rotationY, 0]}
        >
          <mesh position={[0, 0.015, 0]}>
            <boxGeometry args={[seg.promenadeWidth * 0.92, 0.012, 0.028]} />
            <meshStandardMaterial color={seg.ownerColor} emissive={seg.ownerColor} emissiveIntensity={garlandEmissive} roughness={0.3} metalness={0.35} />
          </mesh>
        </group>
      ))}
      {segments
        .filter((seg) => seg.isPrimaryArchwaySegment)
        .map((seg) => (
          <SafeGLTFModel
            key={`arch-${seg.id}`} url={MONOPOLY_ARCHWAY_MODEL_URL}
            position={[...seg.archwayWorldPosition]} rotation={[0, seg.rotationY, 0]} scale={[...seg.archwayScale]}
            castShadow receiveShadow fallback={<group />}
          />
        ))}
    </group>
  );
}
