// [UI-S02/MSS] DioramaContainerPort — Cat Lai container seaport, gantry cranes & colored intermodal container stacks
import React, { useRef } from 'react';
import { RoundedBox } from '@react-three/drei';
import type { Group, Mesh } from 'three';
import { useEnvironmentStore, calculateAviationStrobe } from '../../store/environment_store';
import { useSafeFrame } from '../safe_frame';
import { getBatchedMobileContainerPortGeometries } from './diorama_static_blender_batches';

// Cụm các container xếp chồng tại bãi cảng Cát Lái (chuẩn màu sơn công nghiệp hàng hải PBR)
interface ContainerBlockDef {
  readonly pos: [number, number, number];
  readonly size: [number, number, number];
  readonly color: string;
}

const CONTAINER_BLOCKS: readonly ContainerBlockDef[] = [
  // Hàng 1 (Tầng trệt)
  { pos: [-0.6, 0.08, -0.4], size: [0.3, 0.14, 0.65], color: '#0284C7' },
  { pos: [-0.6, 0.08, 0.35], size: [0.3, 0.14, 0.65], color: '#991B1B' },
  { pos: [-0.25, 0.08, -0.2], size: [0.3, 0.14, 0.65], color: '#15803D' },
  { pos: [-0.25, 0.08, 0.5], size: [0.3, 0.14, 0.65], color: '#C2410C' },
  { pos: [0.1, 0.08, -0.4], size: [0.3, 0.14, 0.65], color: '#D97706' },
  { pos: [0.1, 0.08, 0.35], size: [0.3, 0.14, 0.65], color: '#334155' },
  // Hàng 2 (Tầng 2 xếp chồng)
  { pos: [-0.6, 0.22, -0.1], size: [0.3, 0.14, 0.65], color: '#15803D' },
  { pos: [-0.25, 0.22, 0.2], size: [0.3, 0.14, 0.65], color: '#0284C7' },
  { pos: [0.1, 0.22, -0.2], size: [0.3, 0.14, 0.65], color: '#991B1B' },
  // Hàng 3 (Tầng 3 ngẫu nhiên)
  { pos: [-0.42, 0.36, 0.05], size: [0.3, 0.14, 0.65], color: '#D97706' },
];

export function DioramaContainerPort({
  isMobile = false,
  isVisible = true,
}: DioramaContainerPortProps = {}): React.ReactElement {
  const subscribedPhase = useEnvironmentStore((s) => s.phase);
  const phase = useEnvironmentStore.getState().phase ?? subscribedPhase;
  const isNight = phase === 'night';

  const boom1Ref = useRef<Group>(null);
  const hoist1Ref = useRef<Group>(null);
  const boom2Ref = useRef<Group>(null);
  const hoist2Ref = useRef<Group>(null);
  const beacon1Ref = useRef<Mesh>(null);
  const beacon2Ref = useRef<Mesh>(null);

  if (isMobile) {
    const { portStructuresVertexAoGeom, gantryCranesVertexAoGeom } = getBatchedMobileContainerPortGeometries();
    return (
      <group position={[4.8, 0.16, 4.5]} data-testid="diorama-container-port">
        <mesh position={[-0.85, 0.0925, 0]}>
          <boxGeometry args={[0.08, 0.025, 2.16]} />
          <meshBasicMaterial color="#FACC15" />
        </mesh>
        <mesh name="mobile-batched-port-hull" geometry={portStructuresVertexAoGeom} receiveShadow>
          <meshStandardMaterial vertexColors={true} roughness={0.65} metalness={0.35} />
        </mesh>
        <mesh name="mobile-batched-port-cranes" geometry={gantryCranesVertexAoGeom} receiveShadow>
          <meshStandardMaterial vertexColors={true} roughness={0.35} metalness={0.55} />
        </mesh>
        <mesh position={[-0.8, 1.06, -0.6]} visible={isNight}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
        <mesh position={[-0.8, 1.06, 0.6]} visible={isNight}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[4.8, 0.16, 4.5]} data-testid="diorama-container-port">
      <DioramaContainerPortFrameLoop
        isVisible={isVisible}
        isNight={isNight}
        boom1Ref={boom1Ref}
        hoist1Ref={hoist1Ref}
        boom2Ref={boom2Ref}
        hoist2Ref={hoist2Ref}
        beacon1Ref={beacon1Ref}
        beacon2Ref={beacon2Ref}
      />
      {/* 1. MẶT BẰNG CẦU CẢNG BÊ TÔNG */}
      <RoundedBox args={[1.8, 0.08, 2.2]} radius={0.016} smoothness={2} receiveShadow position={[0, 0.04, 0]}>
        <meshStandardMaterial color="#475569" roughness={0.7} envMapIntensity={0.6} />
      </RoundedBox>
      <mesh position={[-0.85, 0.082, 0]}>
        <boxGeometry args={[0.06, 0.005, 2.16]} />
        <meshBasicMaterial color="#FACC15" />
      </mesh>

      {/* 2. CẦN CẨU GIÀN CONTAINER KHỔNG LỒ (Gantry Crane 1 - Phía Bắc) */}
      <group position={[-0.8, 0.08, -0.6]}>
        <mesh castShadow position={[0, 0.45, -0.3]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#EA580C" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0.45, 0.3]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#EA580C" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh ref={beacon1Ref} position={[0, 0.98, 0]} visible={isNight}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
        <group ref={boom1Ref} position={[0, 0.92, 0]}>
          <mesh castShadow position={[-0.2, 0, 0]}>
            <boxGeometry args={[0.85, 0.09, 0.7]} />
            <meshStandardMaterial color="#EA580C" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0.05, -0.1, -0.2]}>
            <boxGeometry args={[0.12, 0.1, 0.14]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.2} emissive="#FEF08A" emissiveIntensity={isNight ? 1.0 : 0.0} />
          </mesh>
          <group ref={hoist1Ref} position={[-0.35, -0.27, 0]}>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.24, 4]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.18, 0.04, 0.35]} />
              <meshStandardMaterial color="#FACC15" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </group>
      </group>

      {/* CẦN CẨU GIÀN CONTAINER (Gantry Crane 2 - Phía Nam) */}
      <group position={[-0.8, 0.08, 0.6]}>
        <mesh castShadow position={[0, 0.45, -0.3]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0.45, 0.3]}>
          <boxGeometry args={[0.08, 0.9, 0.08]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh ref={beacon2Ref} position={[0, 0.98, 0]} visible={isNight}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshBasicMaterial color="#EF4444" />
        </mesh>
        <group ref={boom2Ref} position={[0, 0.92, 0]}>
          <mesh castShadow position={[-0.2, 0, 0]}>
            <boxGeometry args={[0.85, 0.09, 0.7]} />
            <meshStandardMaterial color="#F59E0B" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0.05, -0.1, 0.2]}>
            <boxGeometry args={[0.12, 0.1, 0.14]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.2} emissive="#FEF08A" emissiveIntensity={isNight ? 1.0 : 0.0} />
          </mesh>
          <group ref={hoist2Ref} position={[-0.35, -0.35, 0]}>
            <mesh position={[0, 0.16, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.32, 4]} />
              <meshStandardMaterial color="#334155" metalness={0.9} />
            </mesh>
            <mesh castShadow position={[0, 0, 0]}>
              <boxGeometry args={[0.26, 0.12, 0.55]} />
              <meshStandardMaterial color="#0284C7" roughness={0.4} />
            </mesh>
          </group>
        </group>
      </group>

      {/* 3. BÃI CONTAINER XẾP CHỒNG */}
      <group position={[0.2, 0.08, 0]}>
        <mesh receiveShadow position={[-0.25, 0.003, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.25, 1.7]} />
          <meshStandardMaterial color="#1E293B" roughness={0.9} />
        </mesh>
        {CONTAINER_BLOCKS.map((cb, idx) => (
          <group key={`container-${idx}`} position={cb.pos}>
            <RoundedBox args={cb.size} radius={0.008} smoothness={2} castShadow receiveShadow>
              <meshStandardMaterial color={cb.color} roughness={0.65} metalness={0.4} envMapIntensity={0.8} />
            </RoundedBox>
            <mesh position={[0, cb.size[1] / 2 + 0.002, 0]}>
              <boxGeometry args={[cb.size[0] * 0.94, 0.006, cb.size[2] * 0.94]} />
              <meshStandardMaterial color="#1E293B" roughness={0.7} metalness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
      {/* 4. XE ĐẦU KÉO CONTAINER CHỞ HÀNG */}
      <group position={[0.65, 0.11, -0.65]}>
        <RoundedBox args={[0.12, 0.12, 0.14]} radius={0.012} smoothness={2} castShadow position={[0, 0.06, -0.16]}>
          <meshStandardMaterial color="#D97706" roughness={0.4} metalness={0.3} />
        </RoundedBox>
        <mesh position={[0, 0.04, 0.1]}>
          <boxGeometry args={[0.12, 0.04, 0.36]} />
          <meshStandardMaterial color="#1E293B" roughness={0.7} />
        </mesh>
        <RoundedBox args={[0.14, 0.12, 0.34]} radius={0.008} smoothness={2} castShadow position={[0, 0.12, 0.1]}>
          <meshStandardMaterial color="#991B1B" roughness={0.65} metalness={0.4} />
        </RoundedBox>
      </group>
    </group>
  );
}

export interface DioramaContainerPortProps {
  readonly isMobile?: boolean;
  readonly isVisible?: boolean;
}

export interface DioramaContainerPortFrameLoopProps {
  readonly isVisible?: boolean;
  readonly isNight?: boolean;
  readonly boom1Ref: React.RefObject<Group | null>;
  readonly hoist1Ref: React.RefObject<Group | null>;
  readonly boom2Ref: React.RefObject<Group | null>;
  readonly hoist2Ref: React.RefObject<Group | null>;
  readonly beacon1Ref: React.RefObject<Mesh | null>;
  readonly beacon2Ref: React.RefObject<Mesh | null>;
}

export function DioramaContainerPortFrameLoop({
  isVisible = true,
  isNight = false,
  boom1Ref,
  hoist1Ref,
  boom2Ref,
  hoist2Ref,
  beacon1Ref,
  beacon2Ref,
}: DioramaContainerPortFrameLoopProps): null {
  const timeAccumRef = useRef<number>(0);

  useSafeFrame((_, delta) => {
    if (!isVisible) return;
    const clampedDelta = Math.min(delta, 0.1);
    timeAccumRef.current += clampedDelta;
    const t = timeAccumRef.current;

    if (boom1Ref.current) boom1Ref.current.rotation.y = Math.sin(t * 0.7) * 0.436;
    if (hoist1Ref.current) hoist1Ref.current.position.y = -0.27 + Math.sin(t * 1.5) * 0.08;
    if (boom2Ref.current) boom2Ref.current.rotation.y = Math.sin(t * 0.6 + 1.2) * 0.436;
    if (hoist2Ref.current) hoist2Ref.current.position.y = -0.32 + Math.cos(t * 1.3) * 0.07;

    const isStrobe = calculateAviationStrobe(t, 1.25);
    if (beacon1Ref.current) beacon1Ref.current.visible = isNight ? isStrobe : false;
    if (beacon2Ref.current) beacon2Ref.current.visible = isNight ? isStrobe : false;
  });

  return null;
}
