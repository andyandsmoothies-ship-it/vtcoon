// [UI-S01/MSS][OPS-02/MSS] LayeredDioramaTile — Diorama-style 3D board tile with standee harmonic animation
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import type { Group } from 'three';
import type { BoardCell } from '../../domain/board_config';
import { COLOR_GROUP_HEX } from '../../domain/theme';

export interface StandeeElevationOptions {
  readonly omega?: number;
  readonly amplitude?: number;
  readonly baseHeight?: number;
  readonly phase?: number;
}

/**
 * [DEBT-UI01-02] Tính toán độ cao nhấp nhô điều hòa sin(omega*t) của Standee.
 * Hàm thuần túy (pure math function) phục vụ 60 FPS animation loop và kiểm thử.
 */
export function calculateStandeeElevation(
  time: number,
  options: StandeeElevationOptions = {}
): number {
  const baseHeight = Number.isFinite(options.baseHeight) ? options.baseHeight! : 0.72;
  if (!Number.isFinite(time)) {
    return baseHeight;
  }
  const omega = Number.isFinite(options.omega) ? options.omega! : 2.0;
  const amplitude = Number.isFinite(options.amplitude) ? options.amplitude! : 0.04;
  const phase = Number.isFinite(options.phase) ? options.phase! : 0;
  return baseHeight + Math.sin(omega * time + phase) * amplitude;
}

interface StandeeBillboardProps {
  readonly cellIndex: number;
  readonly groupColor: string;
}

function StandeeBillboard({ cellIndex, groupColor }: StandeeBillboardProps): React.ReactElement {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = calculateStandeeElevation(t, {
        omega: 2.0,
        amplitude: 0.04,
        baseHeight: 0.72,
        phase: cellIndex * 0.25,
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.72, 0.05]}>
      <Billboard follow={true}>
        {/* Standee background plate */}
        <mesh castShadow>
          <planeGeometry args={[1.0, 1.05]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        {/* Standee graphic preview */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.9, 0.95]} />
          <meshStandardMaterial color={groupColor} roughness={0.3} />
        </mesh>
      </Billboard>
    </group>
  );
}

interface LayeredDioramaTileProps {
  readonly cell: BoardCell;
  readonly position: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly currentLevel: 0 | 1 | 2 | 3;
  readonly isCornerTile: boolean;
  readonly onClick?: () => void;
}

function tierColor(level: number): string {
  return level === 3 ? '#D4AF37' : '#008080';
}

export function LayeredDioramaTile({
  cell,
  position,
  rotation = [0, 0, 0],
  currentLevel,
  isCornerTile,
  onClick,
}: LayeredDioramaTileProps): React.ReactElement {
  if (isCornerTile) {
    return (
      <group position={position} rotation={rotation} onClick={onClick}>
        {/* Corner tile — larger square base */}
        <mesh receiveShadow castShadow>
          <boxGeometry args={[2.2, 0.22, 2.2]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Inner corner accent badge */}
        <mesh position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, 1.6]} />
          <meshBasicMaterial color="#1E293B" />
        </mesh>
      </group>
    );
  }

  const groupColor = cell.colorGroup ? COLOR_GROUP_HEX[cell.colorGroup] : '#64748B';

  return (
    <group position={position} rotation={rotation} onClick={onClick}>
      {/* 1. Base tile — Warm stone/parchment with subtle bevel */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[1.68, 0.2, 2.2]} />
        <meshStandardMaterial color="#E8E2D2" roughness={0.45} />
      </mesh>

      {/* 2. ColorStrip — Identifies region, flat on top surface facing center */}
      {cell.colorGroup != null && (
        <mesh position={[0, 0.105, -0.82]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.68, 0.45]} />
          <meshBasicMaterial color={COLOR_GROUP_HEX[cell.colorGroup]} />
        </mesh>
      )}

      {/* 3. Standee 2.5D Billboard — Harmonic bobbing sin(omega*t) at 60 FPS */}
      <StandeeBillboard cellIndex={cell.index} groupColor={groupColor} />

      {/* 4. Tier Markers — Cylinder indicators per upgrade level */}
      {Array.from({ length: currentLevel }, (_, i) => (
        <mesh key={i} position={[0.55, 0.22 + i * 0.14, 0.7]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.12, 12]} />
          <meshStandardMaterial color={tierColor(currentLevel)} metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}
