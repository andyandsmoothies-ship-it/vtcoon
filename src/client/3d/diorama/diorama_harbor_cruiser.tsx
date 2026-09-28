// [UI-S02/MSS][IMP-221] DioramaHarborCruiser — Scenic wooden boat cruising the marina bay
import React, { useRef } from 'react';
import type { Group, Mesh } from 'three';
import { useSafeFrame } from '../safe_frame';

export function calculateCruiserWake(time: number): number {
  if (!Number.isFinite(time)) return 1.0;
  return 1.0 + Math.sin(time * 5.0) * 0.12;
}

export function calculateCruiserTrajectory(time: number): { x: number; y: number; z: number; yaw: number } {
  if (!Number.isFinite(time)) return { x: -3.2, y: -0.01, z: 0.2, yaw: 0 };
  const speed = 0.16;
  const angle = time * speed;
  const rX = 2.8;
  const rZ = 2.2;
  const x = -3.2 + Math.cos(angle) * rX;
  const z = 0.2 + Math.sin(angle) * rZ;
  const y = -0.01 + Math.sin(time * 3.0) * 0.005;

  const dx = -Math.sin(angle) * rX;
  const dz = Math.cos(angle) * rZ;
  const yaw = Math.atan2(dx, dz);

  return { x, y, z, yaw };
}

export function DioramaHarborCruiser(): React.ReactElement {
  const boatRef = useRef<Group>(null);
  const wakeRef = useRef<Mesh>(null);

  useSafeFrame((state) => {
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
    <group ref={boatRef} position={[-3.2, -0.01, 0.2]} data-testid="diorama-harbor-cruiser">
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
      <mesh ref={wakeRef} position={[0, -0.005, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.35, 0.45]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
