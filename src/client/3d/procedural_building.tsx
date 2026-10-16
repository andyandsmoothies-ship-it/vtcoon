// [UI-S03/MSS][IMP-29.3][IMP-404] ProceduralBuilding — 3D Architecture (C0-C3) with SafeGLTFModel & Blender Baked-AO Mobile LOD
import React, { useRef } from 'react';
import type { Group } from 'three';
import { useSafeFrame } from './safe_frame';
import { useEnvironmentStore } from '../store/environment_store';
import { useVfxStore, type ActiveSlam } from '../store/vfx_store';
import { calculateImpactDrop } from './construction_slam_math';
import {
  type BuildingLotTransform,
  STANDARD_LOT_TRANSFORM,
  CORNER_SPLAY_TRANSFORMS,
  getBuildingLotTransform,
} from './building_lot_transform';
import { calculateDominoRippleTransform, resolveNeighborDominoSlam } from './monopoly_plaza_visuals';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';
import { SurveyorPlotBoundary } from './surveyor_plot_boundary';
import { BespokeLandmarkFallback } from './bespoke_landmark_fallback';
import {
  BUILDING_MODEL_URLS, getBuildingModelUrl, BUILDING_BASE_PLINTH_WIDTH,
  getRegionalTypology, getRegionalFallbackPalette, type RegionalTypology,
} from './building_typology';
import {
  getMobileArchetypeGeometry, getMobileAwningBandGeometry, getTypologyAwningTransform, resolveRenderTierProfile,
} from './procedural_mobile_blender_meshes';

function RoundedBox(props: {
  readonly args?: [number, number, number]; readonly radius?: number; readonly smoothness?: number;
  readonly position?: [number, number, number]; readonly rotation?: [number, number, number];
  readonly castShadow?: boolean; readonly receiveShadow?: boolean; readonly children?: React.ReactNode; readonly 'data-testid'?: string;
}): React.ReactElement {
  return (
    <mesh position={props.position} rotation={props.rotation} castShadow={props.castShadow} receiveShadow={props.receiveShadow} data-testid={props['data-testid']}>
      <boxGeometry args={props.args} />
      {props.children}
    </mesh>
  );
}

export function shouldBypassPlotFrame(level: number, hasActiveSlam: boolean, wasSlamming: boolean): boolean {
  return level !== 3 && !hasActiveSlam && !wasSlamming;
}

export interface ProceduralBuildingProps {
  readonly level: 0 | 1 | 2 | 3; readonly groupColor?: string; readonly cellIndex?: number;
  readonly showEmptyPlotBoundary?: boolean; readonly isMobile?: boolean;
}

export { BUILDING_MODEL_URLS, BUILDING_BASE_PLINTH_WIDTH, BespokeLandmarkFallback };

const FALLBACK_BOX_HEIGHTS: Readonly<Record<1 | 2 | 3, number>> = { 1: 0.34, 2: 0.56, 3: 0.82 };

export function DefaultBuildingBoxFallback({ groupColor = '#64748B', level = 1 }: { readonly groupColor?: string; readonly level?: 1 | 2 | 3 }): React.ReactElement {
  const height = FALLBACK_BOX_HEIGHTS[level] ?? 0.34;
  return (
    <mesh position={[0, height * 0.5, 0]}>
      <boxGeometry args={[0.52, height, 0.42]} />
      <meshStandardMaterial color={groupColor} roughness={0.5} />
    </mesh>
  );
}

export {
  type BuildingLotTransform,
  STANDARD_LOT_TRANSFORM,
  CORNER_SPLAY_TRANSFORMS,
  getBuildingLotTransform,
};

interface FallbackProps {
  readonly groupColor?: string; readonly typology?: RegionalTypology;
  readonly isNight: boolean; readonly isSunset: boolean; readonly isMobile?: boolean;
}

function ShophouseFallback({ groupColor, typology = 'metropolis', isNight, isSunset, isMobile }: FallbackProps): React.ReactElement {
  const glow = isNight ? 0.45 : isSunset ? 0.25 : 0.0;
  const palette = getRegionalFallbackPalette(typology);
  if (isMobile) {
    const geom = getMobileArchetypeGeometry(palette.typology, 1);
    if ((geom.getAttribute('position')?.count ?? 0) === 0) return <DefaultBuildingBoxFallback groupColor={groupColor} level={1} />;
    const awning = getTypologyAwningTransform(palette.typology, 1);
    return (
      <group data-testid="shophouse-mobile-lod" data-typology={palette.typology}>
        <mesh geometry={geom}>
          <meshStandardMaterial vertexColors={true} roughness={0.42} metalness={0.12} />
        </mesh>
        <mesh geometry={getMobileAwningBandGeometry(1)} position={[0, awning.yOffset, awning.zOffset]} scale={awning.scale}>
          <meshStandardMaterial color={groupColor} roughness={0.3} emissive={groupColor} emissiveIntensity={glow} />
        </mesh>
      </group>
    );
  }
  return (
    <group data-typology={palette.typology}>
      <RoundedBox args={[0.58, 0.05, 0.48]} radius={0.012} smoothness={2} position={[0, 0.025, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.c1BaseColor} roughness={0.7} envMapIntensity={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.52, 0.28, 0.42]} radius={0.015} smoothness={3} position={[0, 0.18, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.c1BodyColor} roughness={0.45} envMapIntensity={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.15, 0.19, 0.02]} radius={0.004} smoothness={1} position={[-0.12, 0.14, 0.212]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.c1DoorColor} roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.17, 0.15, 0.02]} radius={0.004} smoothness={1} position={[0.12, 0.14, 0.212]}>
        <meshPhysicalMaterial color="#FDE68A" roughness={0.04} ior={1.52} reflectivity={0.9} clearcoat={1.0} envMapIntensity={1.8} emissive={palette.c1WindowGlowColor} emissiveIntensity={glow} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.07, 0.02]} radius={0.003} smoothness={1} position={[-0.12, 0.25, 0.212]}>
        <meshStandardMaterial color="#FDE68A" emissive="#FBBF24" emissiveIntensity={glow} />
      </RoundedBox>
      <RoundedBox args={[0.55, 0.025, 0.45]} radius={0.005} smoothness={1} position={[0, 0.325, 0]} castShadow>
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
      </RoundedBox>
      {palette.typology === 'resort' ? (
        <RoundedBox args={[0.58, 0.05, 0.48]} radius={0.01} smoothness={2} position={[0, 0.37, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={palette.c1RoofColor} roughness={0.28} />
        </RoundedBox>
      ) : (
        <mesh position={[0, 0.44, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[palette.typology === 'heritage' ? 0.06 : palette.typology === 'riverine' ? 0.04 : 0, 0.46, 0.22, 4]} />
          <meshStandardMaterial color={palette.c1RoofColor} roughness={0.38} />
        </mesh>
      )}
      <mesh position={[0, 0.54, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 0.46, 8]} />
        <meshStandardMaterial color="#7F1D1D" roughness={0.4} />
      </mesh>
      <RoundedBox args={[0.36, 0.045, 0.02]} radius={0.008} smoothness={2} position={[0, 0.3, 0.22]} castShadow>
        <meshStandardMaterial color={groupColor} roughness={0.3} metalness={0.2} emissive={groupColor} emissiveIntensity={glow} envMapIntensity={1.2} />
      </RoundedBox>
    </group>
  );
}

function ComplexFallback({ groupColor, typology = 'metropolis', isNight, isSunset, isMobile }: FallbackProps): React.ReactElement {
  const glow = isNight ? 0.45 : isSunset ? 0.25 : 0.0;
  const palette = getRegionalFallbackPalette(typology);
  if (isMobile) {
    const geom = getMobileArchetypeGeometry(palette.typology, 2);
    if ((geom.getAttribute('position')?.count ?? 0) === 0) return <DefaultBuildingBoxFallback groupColor={groupColor} level={2} />;
    const awning = getTypologyAwningTransform(palette.typology, 2);
    return (
      <group data-testid="complex-mobile-lod" data-typology={palette.typology}>
        <mesh geometry={geom}>
          <meshStandardMaterial vertexColors={true} roughness={0.35} metalness={0.18} />
        </mesh>
        <mesh geometry={getMobileAwningBandGeometry(2)} position={[0, awning.yOffset, awning.zOffset]} scale={awning.scale}>
          <meshStandardMaterial color={groupColor} roughness={0.3} metalness={0.2} emissive={groupColor} emissiveIntensity={glow * 0.4} />
        </mesh>
      </group>
    );
  }
  return (
    <group data-typology={palette.typology}>
      <RoundedBox args={[0.6, 0.16, 0.5]} radius={0.02} smoothness={3} position={[0, 0.08, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={groupColor} roughness={0.3} metalness={0.3} envMapIntensity={1.0} />
      </RoundedBox>
      <RoundedBox args={[0.3, 0.12, 0.02]} radius={0.006} smoothness={2} position={[0, 0.07, 0.252]} castShadow receiveShadow>
        <meshPhysicalMaterial color={palette.c2BodyColor} roughness={0.04} metalness={0.85} ior={1.52} reflectivity={0.9} clearcoat={1.0} clearcoatRoughness={0.02} envMapIntensity={1.8} emissive="#38BDF8" emissiveIntensity={glow} />
      </RoundedBox>
      <RoundedBox args={[0.34, 0.02, 0.07]} radius={0.005} smoothness={2} position={[0, 0.14, 0.28]} castShadow>
        <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.5} envMapIntensity={1.2} />
      </RoundedBox>
      <RoundedBox args={[0.52, 0.52, 0.42]} radius={0.025} smoothness={4} position={[0, 0.42, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={palette.c2BodyColor} roughness={0.04} metalness={0.85} ior={1.52} reflectivity={0.95} clearcoat={1.0} clearcoatRoughness={0.02} envMapIntensity={2.0} />
      </RoundedBox>
      <RoundedBox args={[0.44, 0.05, 0.01]} radius={0.004} smoothness={1} position={[0, 0.35, 0.212]}>
        <meshStandardMaterial color="#FEF08A" emissive="#FDE047" emissiveIntensity={glow} />
      </RoundedBox>
      <RoundedBox args={[0.44, 0.05, 0.01]} radius={0.004} smoothness={1} position={[0, 0.49, 0.212]}>
        <meshStandardMaterial color="#38BDF8" emissive="#00F5FF" emissiveIntensity={glow} />
      </RoundedBox>
      {[0.28, 0.42, 0.56].map((ly, idx) => (
        <RoundedBox key={`louver-${idx}`} args={[0.54, 0.018, 0.44]} radius={0.004} smoothness={2} position={[0, ly, 0]} castShadow>
          <meshStandardMaterial color={palette.c2AccentColor} roughness={0.2} metalness={0.75} envMapIntensity={1.6} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.53, 0.015, 0.43]} radius={0.003} smoothness={1} position={[0, 0.69, 0]}>
        <meshStandardMaterial color="#38BDF8" emissive="#00F5FF" emissiveIntensity={glow} />
      </RoundedBox>
      <RoundedBox args={[0.2, 0.1, 0.2]} radius={0.01} smoothness={2} position={[-0.08, 0.72, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={palette.c2CrownColor} roughness={0.5} envMapIntensity={0.8} />
      </RoundedBox>
      <mesh position={[0.1, 0.74, 0]} castShadow>
        <cylinderGeometry args={[0.007, 0.012, 0.18, 6]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.2} envMapIntensity={1.8} />
      </mesh>
    </group>
  );
}

function resetRootGroupTransform(rootGroup: Group, lotTransform: BuildingLotTransform, wasSlammingRef: { current: boolean }): void {
  if (!wasSlammingRef.current) return;
  rootGroup.position.y = lotTransform.position[1];
  rootGroup.scale.set(...lotTransform.scale);
  rootGroup.rotation.x = lotTransform.rotation[0];
  wasSlammingRef.current = false;
}

function updateRootGroupSlamOrRipple(
  rootGroup: Group, lotTransform: BuildingLotTransform, activeSlam: ActiveSlam | undefined,
  liveNeighborDomino: ReturnType<typeof resolveNeighborDominoSlam>, wasSlammingRef: { current: boolean }
): void {
  if (activeSlam) {
    wasSlammingRef.current = true;
    const drop = calculateImpactDrop(Date.now() - activeSlam.startTime, activeSlam.impactTimeMs);
    rootGroup.position.y = lotTransform.position[1] + drop.yOffset;
    rootGroup.scale.set(lotTransform.scale[0] * drop.scaleXZ, lotTransform.scale[1] * drop.scaleY, lotTransform.scale[2] * drop.scaleXZ);
    rootGroup.rotation.x = lotTransform.rotation[0];
    return;
  }
  if (liveNeighborDomino) {
    const elapsedSinceImpact = Date.now() - (liveNeighborDomino.slam.startTime + liveNeighborDomino.slam.impactTimeMs);
    const ripple = calculateDominoRippleTransform(liveNeighborDomino.distanceInCells, elapsedSinceImpact);
    if (!ripple.isSettled) {
      wasSlammingRef.current = true;
      rootGroup.position.y = lotTransform.position[1] + ripple.yOffset;
      rootGroup.scale.set(lotTransform.scale[0], lotTransform.scale[1] * ripple.scaleY, lotTransform.scale[2]);
      rootGroup.rotation.x = lotTransform.rotation[0] + ripple.pitchRad;
      return;
    }
  }
  resetRootGroupTransform(rootGroup, lotTransform, wasSlammingRef);
}

export function ProceduralBuilding({
  level, groupColor = '#DC2626', cellIndex, showEmptyPlotBoundary = false, isMobile = false,
}: ProceduralBuildingProps): React.ReactElement {
  const rootGroupRef = useRef<Group>(null);
  const crownRef = useRef<Group>(null);
  const wasSlammingRef = useRef<boolean>(false);
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';
  const tierProfile = resolveRenderTierProfile({ isMobile });
  const allowDomino = tierProfile.enableDominoShockwave && !isMobile;
  const enableShadows = tierProfile.buildingRenderMode !== 'INSTANCED_POOL_VERTEX_AO';
  const activeSlam = useVfxStore((s) => (cellIndex !== undefined ? s.activeSlams[cellIndex] : undefined));
  const activeSlams = useVfxStore((s) => (allowDomino ? s.activeSlams : undefined));
  const lotTransform = getBuildingLotTransform(cellIndex);

  useSafeFrame((_, delta) => {
    const liveSlams = allowDomino ? (useVfxStore.getState()?.activeSlams ?? activeSlams) : undefined;
    const liveNeighborDomino = resolveNeighborDominoSlam(cellIndex, liveSlams, !allowDomino);
    if (shouldBypassPlotFrame(level, Boolean(activeSlam || liveNeighborDomino), wasSlammingRef.current)) return;
    if (level === 3 && crownRef.current) crownRef.current.rotation.y += delta * 0.8;
    if (rootGroupRef.current) updateRootGroupSlamOrRipple(rootGroupRef.current, lotTransform, activeSlam, liveNeighborDomino, wasSlammingRef);
  });

  if (level === 0) {
    return <group ref={rootGroupRef} position={lotTransform.position} rotation={lotTransform.rotation} scale={lotTransform.scale}>{showEmptyPlotBoundary ? <SurveyorPlotBoundary groupColor={groupColor} /> : null}</group>;
  }
  const resolvedTypology = getRegionalTypology(cellIndex ?? 0) ?? 'metropolis';
  const modelUrl = (cellIndex !== undefined ? getBuildingModelUrl(cellIndex, level) : null) ?? BUILDING_MODEL_URLS[level];
  const fallbackContent = !modelUrl ? <DefaultBuildingBoxFallback groupColor={groupColor} level={level} />
    : level === 1 ? ShophouseFallback({ groupColor, typology: resolvedTypology, isNight, isSunset, isMobile })
    : level === 2 ? ComplexFallback({ groupColor, typology: resolvedTypology, isNight, isSunset, isMobile })
    : <BespokeLandmarkFallback cellIndex={cellIndex ?? 0} typology={resolvedTypology} isNight={isNight} isSunset={isSunset} />;

  return (
    <group ref={rootGroupRef} position={lotTransform.position} rotation={lotTransform.rotation} scale={lotTransform.scale}>
      {level === 3 && (
        <>
          <group ref={crownRef} data-testid="landmark-crown" position={[0, 1.05, 0]}>
            <RoundedBox args={[0.12, 0.12, 0.12]} radius={0.025} smoothness={4} rotation={[Math.PI / 4, Math.PI / 4, 0]} castShadow data-testid="landmark-crown-jewel">
              <meshPhysicalMaterial color="#F59E0B" metalness={0.98} roughness={0.08} clearcoat={1.0} envMapIntensity={2.5} emissive="#F59E0B" emissiveIntensity={isNight ? 0.6 : 0.25} />
            </RoundedBox>
          </group>
          <RoundedBox args={[0.57, 0.02, 0.57]} radius={0.012} smoothness={3} position={[0, 0.01, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.15} envMapIntensity={2.0} />
          </RoundedBox>
        </>
      )}
      <SafeGLTFModel url={modelUrl} forceFallback={isMobile ? true : undefined} fallback={isMobile ? null : (fallbackContent ?? <DefaultBuildingBoxFallback groupColor={groupColor} level={level} />)} position={[0, 0, 0]} scale={[1, 1, 1]} castShadow={enableShadows} receiveShadow={enableShadows} />
      {isMobile && (fallbackContent ?? <DefaultBuildingBoxFallback groupColor={groupColor} level={level} />)}
    </group>
  );
}
