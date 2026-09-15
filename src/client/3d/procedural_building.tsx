// [UI-S03/MSS][IMP-29.3] ProceduralBuilding — 3D Architecture (C0-C3) with SafeGLTFModel & Zero-Crash Fallback
import React, { useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import type { Mesh, Group } from 'three';
import { useSafeFrame } from './safe_frame';
import { useEnvironmentStore } from '../store/environment_store';
import { useVfxStore } from '../store/vfx_store';
import { calculateImpactDrop } from './construction_slam_vfx';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';
import { SurveyorPlotBoundary } from './surveyor_plot_boundary';

export interface ProceduralBuildingProps {
  readonly level: 0 | 1 | 2 | 3;
  readonly groupColor?: string;
  readonly cellIndex?: number;
  readonly showEmptyPlotBoundary?: boolean;
}

import {
  BUILDING_MODEL_URLS,
  getBuildingModelUrl,
  BUILDING_BASE_PLINTH_WIDTH,
} from './building_typology';

export { BUILDING_MODEL_URLS, BUILDING_BASE_PLINTH_WIDTH };

export interface BuildingLotTransform {
  readonly position: [number, number, number];
  readonly rotation: [number, number, number];
  readonly scale: [number, number, number];
  readonly baseWidth?: number;
}

const STANDARD_LOT_TRANSFORM: BuildingLotTransform = {
  position: [0, 0.16, -1.38],
  rotation: [0, 0, 0],
  scale: [0.975, 0.975, 0.975],
  baseWidth: BUILDING_BASE_PLINTH_WIDTH,
};

const CORNER_SPLAY_TRANSFORMS: Readonly<Record<number, BuildingLotTransform>> = {
  // Corner 0 (GO):
  1: { position: [-0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
  39: { position: [0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
  // Corner 10 (Audit):
  9: { position: [0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
  11: { position: [-0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
  // Corner 20 (Vacation):
  19: { position: [0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
  21: { position: [-0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
  // Corner 30 (Police):
  29: { position: [0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
  31: { position: [-0.24, 0.16, -1.38], rotation: [0, 0, 0], scale: [0.975, 0.975, 0.975], baseWidth: BUILDING_BASE_PLINTH_WIDTH },
};

export function getBuildingLotTransform(cellIndex?: number): BuildingLotTransform {
  if (cellIndex !== undefined && CORNER_SPLAY_TRANSFORMS[cellIndex]) {
    return CORNER_SPLAY_TRANSFORMS[cellIndex];
  }
  return STANDARD_LOT_TRANSFORM;
}

interface FallbackProps {
  readonly groupColor?: string;
  readonly isNight: boolean;
  readonly isSunset: boolean;
}

/**
 * Cấp 1 Fallback: Nhà Phố Đông Dương (Indochine Shophouse)
 */
function ShophouseFallback({ groupColor, isNight, isSunset }: FallbackProps): React.ReactElement {
  return (
    <group>
      <mesh receiveShadow position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.62, 0.52]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.35} />
      </mesh>
      <RoundedBox args={[0.58, 0.05, 0.48]} radius={0.012} smoothness={2} position={[0, 0.025, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#475569" roughness={0.7} envMapIntensity={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.52, 0.28, 0.42]} radius={0.015} smoothness={3} position={[0, 0.18, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#FEF3C7" roughness={0.45} envMapIntensity={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.15, 0.19, 0.02]} radius={0.004} smoothness={1} position={[-0.12, 0.14, 0.212]} castShadow receiveShadow>
        <meshStandardMaterial color="#451A03" roughness={0.5} />
      </RoundedBox>
      <RoundedBox args={[0.17, 0.15, 0.02]} radius={0.004} smoothness={1} position={[0.12, 0.14, 0.212]}>
        <meshPhysicalMaterial
          color="#FDE68A"
          roughness={0.04}
          ior={1.52}
          reflectivity={0.9}
          clearcoat={1.0}
          envMapIntensity={1.8}
          emissive="#F59E0B"
          emissiveIntensity={isNight ? 0.45 : isSunset ? 0.25 : 0.0}
        />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.07, 0.02]} radius={0.003} smoothness={1} position={[-0.12, 0.25, 0.212]}>
        <meshStandardMaterial
          color="#FDE68A"
          emissive="#FBBF24"
          emissiveIntensity={isNight ? 0.45 : isSunset ? 0.25 : 0.0}
        />
      </RoundedBox>
      <RoundedBox args={[0.55, 0.025, 0.45]} radius={0.005} smoothness={1} position={[0, 0.325, 0]} castShadow>
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.44, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0, 0.46, 0.22, 4]} />
        <meshStandardMaterial color="#B91C1C" roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.54, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.016, 0.016, 0.46, 8]} />
        <meshStandardMaterial color="#7F1D1D" roughness={0.4} />
      </mesh>
      <RoundedBox args={[0.36, 0.045, 0.02]} radius={0.008} smoothness={2} position={[0, 0.3, 0.22]} castShadow>
        <meshStandardMaterial
          color={groupColor}
          roughness={0.3}
          metalness={0.2}
          emissive={groupColor}
          emissiveIntensity={isNight ? 0.45 : isSunset ? 0.25 : 0.0}
          envMapIntensity={1.2}
        />
      </RoundedBox>
    </group>
  );
}

/**
 * Cấp 2 Fallback: Khối Cao Ốc Kính Sapphire Hiện Đại
 */
function ComplexFallback({ groupColor, isNight, isSunset }: FallbackProps): React.ReactElement {
  return (
    <group>
      <mesh position={[0, 0.002, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.66, 0.56]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.38} />
      </mesh>
      <RoundedBox args={[0.6, 0.16, 0.5]} radius={0.02} smoothness={3} position={[0, 0.08, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={groupColor} roughness={0.3} metalness={0.3} envMapIntensity={1.0} />
      </RoundedBox>
      <RoundedBox args={[0.3, 0.12, 0.02]} radius={0.006} smoothness={2} position={[0, 0.07, 0.252]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#0284C7"
          roughness={0.04}
          metalness={0.85}
          ior={1.52}
          reflectivity={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
          envMapIntensity={1.8}
          emissive="#38BDF8"
          emissiveIntensity={isNight ? 0.45 : isSunset ? 0.25 : 0.0}
        />
      </RoundedBox>
      <RoundedBox args={[0.34, 0.02, 0.07]} radius={0.005} smoothness={2} position={[0, 0.14, 0.28]} castShadow>
        <meshStandardMaterial color="#F8FAFC" roughness={0.2} metalness={0.5} envMapIntensity={1.2} />
      </RoundedBox>
      <RoundedBox args={[0.52, 0.52, 0.42]} radius={0.025} smoothness={4} position={[0, 0.42, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#0284C7"
          roughness={0.04}
          metalness={0.85}
          ior={1.52}
          reflectivity={0.95}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
          envMapIntensity={2.0}
        />
      </RoundedBox>
      <RoundedBox args={[0.44, 0.05, 0.01]} radius={0.004} smoothness={1} position={[0, 0.35, 0.212]}>
        <meshStandardMaterial
          color="#FEF08A"
          emissive="#FDE047"
          emissiveIntensity={isNight ? 0.45 : isSunset ? 0.25 : 0.0}
        />
      </RoundedBox>
      <RoundedBox args={[0.44, 0.05, 0.01]} radius={0.004} smoothness={1} position={[0, 0.49, 0.212]}>
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#00F5FF"
          emissiveIntensity={isNight ? 0.45 : isSunset ? 0.25 : 0.0}
        />
      </RoundedBox>
      {[0.28, 0.42, 0.56].map((ly, idx) => (
        <RoundedBox key={`louver-${idx}`} args={[0.54, 0.018, 0.44]} radius={0.004} smoothness={2} position={[0, ly, 0]} castShadow>
          <meshStandardMaterial color="#CBD5E1" roughness={0.2} metalness={0.75} envMapIntensity={1.6} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.53, 0.015, 0.43]} radius={0.003} smoothness={1} position={[0, 0.69, 0]}>
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#00F5FF"
          emissiveIntensity={isNight ? 0.45 : isSunset ? 0.25 : 0.0}
        />
      </RoundedBox>
      <RoundedBox args={[0.2, 0.1, 0.2]} radius={0.01} smoothness={2} position={[-0.08, 0.72, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#475569" roughness={0.5} envMapIntensity={0.8} />
      </RoundedBox>
      <mesh position={[0.1, 0.74, 0]} castShadow>
        <cylinderGeometry args={[0.007, 0.012, 0.18, 6]} />
        <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.2} envMapIntensity={1.8} />
      </mesh>
    </group>
  );
}

interface LandmarkFallbackProps extends Omit<FallbackProps, 'groupColor'> {
  readonly crownRef?: React.RefObject<Mesh | null>;
}

/**
 * Cấp 3 Fallback: Quần Thể Landmark Hoàng Kim
 */
function LandmarkFallback({ isNight, isSunset, crownRef }: LandmarkFallbackProps): React.ReactElement {
  return (
    <group>
      <mesh position={[0, 0.002, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.68, 0.56]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.42} />
      </mesh>
      <RoundedBox args={[0.62, 0.06, 0.5]} radius={0.015} smoothness={3} position={[0, 0.03, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.3} envMapIntensity={1.2} />
      </RoundedBox>
      <RoundedBox args={[0.24, 0.52, 0.36]} radius={0.02} smoothness={3} position={[-0.14, 0.32, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#FEF3C7" roughness={0.25} metalness={0.3} envMapIntensity={1.4} />
      </RoundedBox>
      <RoundedBox args={[0.18, 0.42, 0.01]} radius={0.005} smoothness={2} position={[-0.14, 0.32, 0.185]}>
        <meshPhysicalMaterial
          color="#0284C7"
          roughness={0.04}
          metalness={0.85}
          ior={1.52}
          reflectivity={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
          envMapIntensity={1.8}
          emissive="#38BDF8"
          emissiveIntensity={isNight ? 0.45 : isSunset ? 0.25 : 0.0}
        />
      </RoundedBox>
      <RoundedBox args={[0.22, 0.03, 0.34]} radius={0.008} smoothness={2} position={[-0.14, 0.6, 0]} castShadow>
        <meshStandardMaterial
          color="#F59E0B"
          roughness={0.1}
          metalness={0.95}
          envMapIntensity={2.0}
          emissive="#F59E0B"
          emissiveIntensity={isNight ? 0.45 : isSunset ? 0.25 : 0.0}
        />
      </RoundedBox>
      <RoundedBox args={[0.24, 0.72, 0.36]} radius={0.02} smoothness={3} position={[0.14, 0.42, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#FDE68A" roughness={0.2} metalness={0.4} envMapIntensity={1.5} />
      </RoundedBox>
      <RoundedBox args={[0.18, 0.58, 0.01]} radius={0.005} smoothness={2} position={[0.14, 0.42, 0.185]}>
        <meshPhysicalMaterial
          color="#0284C7"
          roughness={0.04}
          metalness={0.85}
          ior={1.52}
          reflectivity={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
          envMapIntensity={1.8}
          emissive="#38BDF8"
          emissiveIntensity={isNight ? 0.45 : isSunset ? 0.25 : 0.0}
        />
      </RoundedBox>
      <RoundedBox args={[0.1, 0.06, 0.16]} radius={0.008} smoothness={2} position={[0, 0.38, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#38BDF8"
          roughness={0.04}
          metalness={0.8}
          ior={1.52}
          clearcoat={1.0}
          envMapIntensity={2.0}
          emissive="#00F5FF"
          emissiveIntensity={isNight ? 0.45 : isSunset ? 0.25 : 0.0}
        />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.015, 0.18]} radius={0.004} smoothness={2} position={[0, 0.42, 0]} castShadow>
        <meshStandardMaterial
          color="#F59E0B"
          roughness={0.1}
          metalness={0.95}
          envMapIntensity={2.0}
          emissive="#F59E0B"
          emissiveIntensity={isNight ? 0.45 : 0.0}
        />
      </RoundedBox>
      <mesh position={[0.262, 0.42, 0.182]}>
        <boxGeometry args={[0.008, 0.68, 0.008]} />
        <meshStandardMaterial
          color="#F59E0B"
          emissive="#F59E0B"
          emissiveIntensity={isNight ? 0.45 : isSunset ? 0.25 : 0.0}
        />
      </mesh>
      <mesh ref={crownRef} position={[0.14, 0.84, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <cylinderGeometry args={[0, 0.18, 0.16, 4]} />
        <meshStandardMaterial
          color="#F59E0B"
          roughness={0.06}
          metalness={0.98}
          envMapIntensity={2.2}
          emissive="#F59E0B"
          emissiveIntensity={isNight ? 0.45 : isSunset ? 0.25 : 0.0}
        />
      </mesh>
      <mesh position={[0.14, 0.94, 0]} castShadow>
        <cylinderGeometry args={[0.005, 0.012, 0.12, 6]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.08} metalness={1.0} envMapIntensity={2.0} />
      </mesh>
    </group>
  );
}

/**
 * Component Hiển thị Công trình Kiến Trúc 3D C0-C3 nạp qua SafeGLTFModel
 */
export function ProceduralBuilding({
  level,
  groupColor = '#DC2626',
  cellIndex,
  showEmptyPlotBoundary = false,
}: ProceduralBuildingProps): React.ReactElement {
  const rootGroupRef = useRef<Group>(null);
  const crownRef = useRef<Mesh>(null);
  const wasSlammingRef = useRef<boolean>(false);
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';
  const activeSlam = useVfxStore((s) => (cellIndex !== undefined ? s.activeSlams[cellIndex] : undefined));
  const lotTransform = getBuildingLotTransform(cellIndex);

  useSafeFrame((_, delta) => {
    if (level === 3 && crownRef.current) {
      crownRef.current.rotation.y += delta * 0.8;
    }
    if (rootGroupRef.current) {
      if (activeSlam) {
        wasSlammingRef.current = true;
        const elapsed = Date.now() - activeSlam.startTime;
        const drop = calculateImpactDrop(elapsed, activeSlam.impactTimeMs);
        rootGroupRef.current.position.y = lotTransform.position[1] + drop.yOffset;
        rootGroupRef.current.scale.set(
          lotTransform.scale[0] * drop.scaleXZ,
          lotTransform.scale[1] * drop.scaleY,
          lotTransform.scale[2] * drop.scaleXZ
        );
      } else if (wasSlammingRef.current) {
        rootGroupRef.current.position.y = lotTransform.position[1];
        rootGroupRef.current.scale.set(...lotTransform.scale);
        wasSlammingRef.current = false;
      }
    }
  });

  if (level === 0) {
    return (
      <group
        ref={rootGroupRef}
        position={lotTransform.position}
        rotation={lotTransform.rotation}
        scale={lotTransform.scale}
      >
        {showEmptyPlotBoundary ? <SurveyorPlotBoundary groupColor={groupColor} /> : null}
      </group>
    );
  }

  const modelUrl =
    (cellIndex !== undefined ? getBuildingModelUrl(cellIndex, level) : null) ??
    BUILDING_MODEL_URLS[level];

  return (
    <group
      ref={rootGroupRef}
      position={lotTransform.position}
      rotation={lotTransform.rotation}
      scale={lotTransform.scale}
    >
      <SafeGLTFModel
        url={modelUrl}
        fallback={
          <>
            {level === 1 && <ShophouseFallback groupColor={groupColor} isNight={isNight} isSunset={isSunset} />}
            {level === 2 && <ComplexFallback groupColor={groupColor} isNight={isNight} isSunset={isSunset} />}
            {level === 3 && <LandmarkFallback isNight={isNight} isSunset={isSunset} crownRef={crownRef} />}
          </>
        }
        position={[0, 0, 0]}
        scale={[1, 1, 1]}
        castShadow
        receiveShadow
      />
    </group>
  );
}
