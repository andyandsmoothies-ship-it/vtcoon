// [UI-S03/MSS][IMP-29.3] ProceduralBuilding — 3D Architecture (C0-C3) with SafeGLTFModel & Zero-Crash Fallback
import React, { useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import type { Mesh, Group } from 'three';
import { useSafeFrame } from './safe_frame';
import { GoldenGlowVFX } from './golden_glow_vfx';
import { useEnvironmentStore } from '../store/environment_store';
import { useVfxStore } from '../store/vfx_store';
import { calculateImpactDrop } from './construction_slam_vfx';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';

export interface ProceduralBuildingProps {
  readonly level: 0 | 1 | 2 | 3;
  readonly groupColor?: string;
  readonly cellIndex?: number;
}

export const BUILDING_MODEL_URLS: Readonly<Record<1 | 2 | 3, string>> = {
  1: '/models/buildings/building_c1.glb',
  2: '/models/buildings/building_c2.glb',
  3: '/models/buildings/building_c3.glb',
} as const;

const BOUNDARY_PEG_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [-0.24, -0.19],
  [0.24, -0.19],
  [-0.24, 0.19],
  [0.24, 0.19],
];

interface FallbackProps {
  readonly groupColor?: string;
  readonly isNight: boolean;
  readonly isSunset: boolean;
}

/**
 * Cấp 0: Khu Đất Quy Hoạch Thu Nhỏ (Surveyor Plot Boundary)
 */
function SurveyorPlotBoundary({ groupColor }: { readonly groupColor: string }): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* Bệ sa thạch phẳng viền quanh ô đất */}
      <mesh position={[0, 0.008, 0]} receiveShadow>
        <boxGeometry args={[0.58, 0.016, 0.48]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
      </mesh>

      {/* 4 Cọc mốc chỉ giới bê tông cắm tại 4 góc ô đất (sơn sọc Đỏ - Trắng) */}
      {BOUNDARY_PEG_OFFSETS.map(([px, pz], i) => (
        <group key={`peg-${i}`} position={[px, 0.04, pz]}>
          <mesh castShadow receiveShadow position={[0, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.024, 0.08, 6]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.02, 0.022, 0.025, 6]} />
            <meshStandardMaterial color="#DC2626" roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Dây căng mốc chỉ giới mạ vàng đồng viền quanh 4 cọc */}
      <mesh position={[0, 0.065, -0.19]}>
        <boxGeometry args={[0.48, 0.006, 0.006]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.065, 0.19]}>
        <boxGeometry args={[0.48, 0.006, 0.006]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.24, 0.065, 0]}>
        <boxGeometry args={[0.006, 0.006, 0.38]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.24, 0.065, 0]}>
        <boxGeometry args={[0.006, 0.006, 0.38]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Biển cọc gỗ cắm tí hon: Bảng mốc quy hoạch thương mại */}
      <group position={[0, 0.07, 0.05]} rotation={[0.08, 0, 0]}>
        <mesh castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.01, 0.12, 6]} />
          <meshStandardMaterial color="#78350F" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.06, 0.008]} castShadow>
          <boxGeometry args={[0.2, 0.08, 0.015]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.085, 0.016]}>
          <boxGeometry args={[0.18, 0.015, 0.004]} />
          <meshStandardMaterial color={groupColor} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
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
          emissiveIntensity={isNight ? 2.8 : isSunset ? 0.7 : 0.25}
        />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.07, 0.02]} radius={0.003} smoothness={1} position={[-0.12, 0.25, 0.212]}>
        <meshStandardMaterial
          color="#FDE68A"
          emissive="#FBBF24"
          emissiveIntensity={isNight ? 2.6 : isSunset ? 0.6 : 0.1}
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
          emissiveIntensity={isNight ? 2.5 : isSunset ? 0.45 : 0.0}
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
          emissiveIntensity={isNight ? 2.6 : isSunset ? 0.45 : 0.0}
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
          emissiveIntensity={isNight ? 3.0 : isSunset ? 0.7 : 0.1}
        />
      </RoundedBox>
      <RoundedBox args={[0.44, 0.05, 0.01]} radius={0.004} smoothness={1} position={[0, 0.49, 0.212]}>
        <meshStandardMaterial
          color="#38BDF8"
          emissive="#00F5FF"
          emissiveIntensity={isNight ? 3.2 : isSunset ? 0.7 : 0.1}
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
          emissiveIntensity={isNight ? 3.5 : isSunset ? 0.8 : 0.0}
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
          emissiveIntensity={isNight ? 2.8 : isSunset ? 0.55 : 0.0}
        />
      </RoundedBox>
      <RoundedBox args={[0.22, 0.03, 0.34]} radius={0.008} smoothness={2} position={[-0.14, 0.6, 0]} castShadow>
        <meshStandardMaterial
          color="#F59E0B"
          roughness={0.1}
          metalness={0.95}
          envMapIntensity={2.0}
          emissive="#F59E0B"
          emissiveIntensity={isNight ? 2.8 : isSunset ? 0.55 : 0.0}
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
          emissiveIntensity={isNight ? 3.0 : isSunset ? 0.6 : 0.0}
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
          emissiveIntensity={isNight ? 3.2 : isSunset ? 0.7 : 0.1}
        />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.015, 0.18]} radius={0.004} smoothness={2} position={[0, 0.42, 0]} castShadow>
        <meshStandardMaterial
          color="#F59E0B"
          roughness={0.1}
          metalness={0.95}
          envMapIntensity={2.0}
          emissive="#F59E0B"
          emissiveIntensity={isNight ? 2.8 : 0.0}
        />
      </RoundedBox>
      <mesh position={[0.262, 0.42, 0.182]}>
        <boxGeometry args={[0.008, 0.68, 0.008]} />
        <meshStandardMaterial
          color="#F59E0B"
          emissive="#F59E0B"
          emissiveIntensity={isNight ? 3.5 : isSunset ? 0.8 : 0.0}
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
          emissiveIntensity={isNight ? 2.8 : isSunset ? 0.6 : 0.1}
        />
      </mesh>
      <mesh position={[0.14, 0.94, 0]} castShadow>
        <cylinderGeometry args={[0.005, 0.012, 0.12, 6]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.08} metalness={1.0} envMapIntensity={2.0} />
      </mesh>
      <GoldenGlowVFX position={[0.14, 0.88, 0]} />
    </group>
  );
}

/**
 * Component Hiển thị Công trình Kiến Trúc 3D C0-C3 nạp qua SafeGLTFModel
 */
export function ProceduralBuilding({
  level,
  groupColor = '#3B82F6',
  cellIndex,
}: ProceduralBuildingProps): React.ReactElement {
  const rootGroupRef = useRef<Group>(null);
  const crownRef = useRef<Mesh>(null);
  const wasSlammingRef = useRef<boolean>(false);
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';
  const activeSlam = useVfxStore((s) => (cellIndex !== undefined ? s.activeSlams[cellIndex] : undefined));

  useSafeFrame((_, delta) => {
    if (level === 3 && crownRef.current) {
      crownRef.current.rotation.y += delta * 0.8;
    }
    if (rootGroupRef.current) {
      if (activeSlam) {
        wasSlammingRef.current = true;
        const elapsed = Date.now() - activeSlam.startTime;
        const drop = calculateImpactDrop(elapsed, activeSlam.impactTimeMs);
        rootGroupRef.current.position.y = 0.22 + drop.yOffset;
        rootGroupRef.current.scale.set(drop.scaleXZ, drop.scaleY, drop.scaleXZ);
      } else if (wasSlammingRef.current) {
        rootGroupRef.current.position.y = 0.22;
        rootGroupRef.current.scale.set(1, 1, 1);
        wasSlammingRef.current = false;
      }
    }
  });

  if (level === 0) {
    return (
      <group ref={rootGroupRef} position={[0, 0.22, -0.42]}>
        <SurveyorPlotBoundary groupColor={groupColor} />
      </group>
    );
  }

  return (
    <group ref={rootGroupRef} position={[0, 0.22, -0.42]}>
      <SafeGLTFModel
        url={BUILDING_MODEL_URLS[level]}
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
