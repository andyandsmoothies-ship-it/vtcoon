// [UI-S04/MSS][UI-S05/MSS] ConstructionSlamVFX — Impact Drop, Shockwave Ring & Confetti Celebration
import React, { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { useVfxStore, type ActiveSlam } from '../store/vfx_store';
import { useSafeFrame } from './safe_frame';
import {
  type ImpactDropResult,
  getBuildingWorldPosition,
  calculateImpactDrop,
} from './construction_slam_math';

export {
  type ImpactDropResult,
  getBuildingWorldPosition,
  calculateImpactDrop,
};

export interface ShockwaveResult {
  readonly radius: number;
  readonly opacity: number;
  readonly thickness: number;
}

/**
 * Tính toán sóng xung kích vành khăn (Shockwave Ring Expansion)
 */
export function calculateShockwave(
  elapsedMs: number,
  impactDelayMs: number = 380,
  durationMs: number = 650,
  maxRadius: number = 2.2
): ShockwaveResult {
  if (!Number.isFinite(elapsedMs) || elapsedMs < impactDelayMs) {
    return { radius: 0, opacity: 0, thickness: 0 };
  }
  const localElapsed = elapsedMs - impactDelayMs;
  if (localElapsed >= durationMs) {
    return { radius: maxRadius, opacity: 0, thickness: 0 };
  }
  const p = localElapsed / durationMs;
  const expansion = 1 - Math.pow(1 - p, 2);
  const radius = 0.2 + expansion * (maxRadius - 0.2);
  const opacity = (1 - p) * 0.95;
  const thickness = Math.max(0.02, 0.16 * (1 - p));
  return { radius, opacity, thickness };
}

export interface ConfettiResult {
  readonly position: [number, number, number];
  readonly rotation: [number, number, number];
  readonly opacity: number;
  readonly scale: number;
}

export const CONFETTI_COLORS = [
  '#FDE047', // Vàng hoàng kim sáng
  '#F59E0B', // Vàng hổ phách
  '#FEF3C7', // Vàng champagne kem
  '#D97706', // Vàng đồng đậm
  '#EF4444', // Đỏ ruby khánh thành
  '#10B981', // Xanh ngọc lục bảo
] as const;

/**
 * Tính toán quỹ đạo hạt pháo hoa hoàng kim / bụi vàng bung tỏa ăn mừng
 */
export function calculateConfettiParticle(
  elapsedMs: number,
  index: number,
  total: number = 24,
  impactDelayMs: number = 380,
  durationMs: number = 1100
): ConfettiResult {
  if (!Number.isFinite(elapsedMs) || elapsedMs < impactDelayMs) {
    return { position: [0, 0, 0], rotation: [0, 0, 0], opacity: 0, scale: 0 };
  }
  const localElapsedMs = elapsedMs - impactDelayMs;
  if (localElapsedMs >= durationMs) {
    return { position: [0, 0, 0], rotation: [0, 0, 0], opacity: 0, scale: 0 };
  }
  const tSec = localElapsedMs / 1000;
  const goldenAngle = 2.399963;
  const angle = index * goldenAngle;
  const speed = 1.6 + ((index * 13) % 10) * 0.15;
  const upwardV = 3.6 + ((index * 7) % 10) * 0.2;
  const gravity = 6.4;

  const x = Math.cos(angle) * speed * tSec;
  const z = Math.sin(angle) * speed * tSec;
  const y = Math.max(0.04, upwardV * tSec - 0.5 * gravity * tSec * tSec);

  const p = localElapsedMs / durationMs;
  const opacity = Math.max(0, 1 - p);
  const scale = Math.max(0, (1 - p * 0.6) * 0.085);

  return {
    position: [x, y, z],
    rotation: [tSec * 7 + index, tSec * 9 + index * 2, tSec * 6],
    opacity,
    scale,
  };
}

export interface SingleSlamVFXProps {
  readonly slam: ActiveSlam;
}

export function SingleSlamVFX({ slam }: SingleSlamVFXProps): React.ReactElement {
  const shockwaveRef = useRef<Mesh>(null);
  const particlesGroupRef = useRef<Group>(null);
  const particleRefs = useRef<(Mesh | null)[]>([]);

  const centerPos = getBuildingWorldPosition(slam.cellIndex);
  const shockwaveColor = slam.level === 3 ? '#F59E0B' : slam.level === 2 ? '#38BDF8' : '#F97316';
  const particleCount = slam.level === 3 ? 24 : 14;

  useSafeFrame(() => {
    const elapsed = Date.now() - slam.startTime;

    // 1. Cập nhật sóng xung kích vành khăn
    if (shockwaveRef.current) {
      const sw = calculateShockwave(elapsed, slam.impactTimeMs, 650, slam.level === 3 ? 2.4 : 1.8);
      shockwaveRef.current.scale.set(sw.radius, sw.radius, 1);
      const mat = shockwaveRef.current.material as { opacity?: number };
      if (mat && typeof mat.opacity === 'number') {
        mat.opacity = sw.opacity;
      }
    }

    // 2. Cập nhật các hạt pháo hoa / bụi vàng
    for (let i = 0; i < particleCount; i++) {
      const pMesh = particleRefs.current[i];
      if (pMesh) {
        const cp = calculateConfettiParticle(elapsed, i, particleCount, slam.impactTimeMs, 1100);
        pMesh.position.set(cp.position[0], cp.position[1], cp.position[2]);
        pMesh.rotation.set(cp.rotation[0], cp.rotation[1], cp.rotation[2]);
        pMesh.scale.set(cp.scale, cp.scale, cp.scale);
        const mat = pMesh.material as { opacity?: number };
        if (mat && typeof mat.opacity === 'number') {
          mat.opacity = cp.opacity;
        }
      }
    }
  });

  return (
    <group position={[centerPos[0], 0.12, centerPos[2]]}>
      {/* Sóng xung kích vành khăn phát sáng mở rộng */}
      <mesh ref={shockwaveRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.75, 1.0, 32]} />
        <meshBasicMaterial color={shockwaveColor} transparent opacity={0.9} depthWrite={false} />
      </mesh>

      {/* Chùm pháo hoa hoàng kim / bụi vàng bung tỏa */}
      <group ref={particlesGroupRef} position={[0, 0.15, 0]}>
        {Array.from({ length: particleCount }, (_, idx) => (
          <mesh
            key={idx}
            ref={(el) => {
              particleRefs.current[idx] = el;
            }}
          >
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial
              color={CONFETTI_COLORS[idx % CONFETTI_COLORS.length]}
              transparent
              opacity={1}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export interface ConstructionSlamVFXProps {
  readonly slams?: readonly ActiveSlam[];
}

/**
 * 3D Component quản lý toàn bộ hiệu ứng Va Đập Xây Dựng & Pháo Hoa Khánh Thành
 */
export function ConstructionSlamVFX({ slams }: ConstructionSlamVFXProps = {}): React.ReactElement {
  const storeSlams = useVfxStore((s) => s.activeSlams);
  const slamsList = slams ?? Object.values(storeSlams);

  if (slamsList.length === 0) {
    return <group />;
  }

  return (
    <group position={[0, 0, 0]}>
      {slamsList.map((slam) => (
        <SingleSlamVFX key={slam.id} slam={slam} />
      ))}
    </group>
  );
}
