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

export interface DioramaHarborCruiserProps {
  readonly isMobile?: boolean;
  readonly isVisible?: boolean;
  readonly isMoored?: boolean;
}

export function DioramaHarborCruiser({
  isMobile = false,
  isVisible = true,
  isMoored = false,
}: DioramaHarborCruiserProps = {}): React.ReactElement {
  const boatRef = useRef<Group>(null);
  const wakeRef = useRef<Mesh>(null);
  const initialZ = isMoored ? 2.2 : 5.2;

  return (
    <group ref={boatRef} position={[0, -0.032, initialZ]} data-testid="diorama-harbor-cruiser">
      {!isMobile && (
        <DioramaHarborCruiserFrameLoop
          isVisible={isVisible}
          boatRef={boatRef}
          wakeRef={wakeRef}
          isMoored={isMoored}
        />
      )}
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

export interface DioramaHarborCruiserFrameLoopProps {
  readonly isVisible?: boolean;
  readonly boatRef: React.RefObject<Group | null>;
  readonly wakeRef?: React.RefObject<Mesh | null>;
  readonly isMoored?: boolean;
}

export function DioramaHarborCruiserFrameLoop({
  isVisible = true,
  boatRef,
  wakeRef,
  isMoored = false,
}: DioramaHarborCruiserFrameLoopProps): null {
  const timeAccumRef = useRef<number>(0);

  useSafeFrame((_, delta) => {
    if (!isVisible) {
      return;
    }

    // Enforce ADV-03: Clamped delta spike on tab focus or modal dismissal
    const clampedDelta = Math.min(delta, 0.1);
    timeAccumRef.current += clampedDelta;
    const t = timeAccumRef.current;

    if (boatRef.current) {
      if (isMoored) {
        const y = -0.032 + Math.sin(t * 2.8) * 0.003;
        boatRef.current.position.set(0, y, 2.2);
        boatRef.current.rotation.set(0, Math.PI / 2, Math.sin(t * 2.8) * 0.015);
      } else {
        const traj = calculateCruiserTrajectory(t);
        boatRef.current.position.set(traj.x, traj.y, traj.z);
        boatRef.current.rotation.y = traj.yaw;
        boatRef.current.rotation.z = Math.sin(t * 2.8) * 0.02;
      }
    }
    if (wakeRef?.current) {
      if (isMoored) {
        wakeRef.current.scale.set(0, 0, 0);
      } else {
        const s = calculateCruiserWake(t);
        wakeRef.current.scale.set(s, 1, s);
      }
    }
  });

  return null;
}


