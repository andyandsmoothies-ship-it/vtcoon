// [UI-S02/MSS][IMP-221] DioramaHarborCruiser — Scenic wooden boat cruising the marina bay
import React, { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { useSafeFrame } from '../safe_frame';

export function calculateCruiserWake(time: number): number {
  if (!Number.isFinite(time)) return 1.0;
  return 1.0 + Math.sin(time * 5.0) * 0.12;
}

export function calculateCruiserTrajectory(time: number): { x: number; y: number; z: number; yaw: number } {
  if (!Number.isFinite(time)) return { x: 0, y: -0.032, z: 5.2, yaw: Math.PI / 2 };
  const speed = 0.12;
  const angle = time * speed;
  const x = Math.sin(angle * 2.0) * 0.32;
  const z = Math.cos(angle) * 5.2;
  const y = -0.032 + Math.sin(time * 2.8) * 0.003;

  const dx = 2.0 * 0.32 * Math.cos(angle * 2.0);
  const dz = -5.2 * Math.sin(angle);
  const yaw = Math.atan2(dx, dz);

  return { x, y, z, yaw };
}

export function DioramaHarborCruiser({ isMobile = false }: { readonly isMobile?: boolean } = {}): React.ReactElement {
  const boatRef = useRef<Group>(null);
  const wakeRef = useRef<Mesh>(null);

  useSafeFrame((state) => {
    if (isMobile) return;
    const t = state.clock.elapsedTime;
    if (boatRef.current) {
      const traj = calculateCruiserTrajectory(t);
      boatRef.current.position.set(traj.x, traj.y, traj.z);
      boatRef.current.rotation.y = traj.yaw;
      boatRef.current.rotation.z = Math.sin(t * 2.8) * 0.02;
    }
    if (wakeRef.current) {
      const s = calculateCruiserWake(t);
      wakeRef.current.scale.set(s, 1, s);
    }
  });

  return (
    <group ref={boatRef} position={[0, -0.032, 5.2]} data-testid="diorama-harbor-cruiser">
      {/* Zero castShadow theo chuẩn [TC-221.15] */}
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[0.26, 0.05, 0.72]} />
        <meshStandardMaterial color="#78350F" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.045, 0.42]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.2, 0.05, 0.2]} />
        <meshStandardMaterial color="#78350F" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.09, -0.04]}>
        <cylinderGeometry args={[0.13, 0.13, 0.38, 8, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#FEF3C7" roughness={0.4} />
      </mesh>
      {!isMobile && (
        <mesh ref={wakeRef} position={[0, -0.005, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.35, 0.45]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
}
