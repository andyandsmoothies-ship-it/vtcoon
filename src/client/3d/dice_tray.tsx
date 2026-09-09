// [UI-S02/MSS] DiceTray — 3D Central dice tray & spring physics falling dice
import React from 'react';
import { a, useSpring } from '@react-spring/three';
import { useGameStore } from '../store/game_store';
import { getDiceFaceRotation } from './dice_math';

interface PipDef {
  readonly pos: [number, number, number];
  readonly isRed?: boolean;
}

const DIE_PIPS: readonly PipDef[] = [
  { pos: [0, 0.252, 0], isRed: true }, // Face 1 (+Y)
  { pos: [-0.1, -0.252, -0.1] }, { pos: [-0.1, -0.252, 0] }, { pos: [-0.1, -0.252, 0.1] }, // Face 6 (-Y)
  { pos: [0.1, -0.252, -0.1] }, { pos: [0.1, -0.252, 0] }, { pos: [0.1, -0.252, 0.1] },
  { pos: [-0.1, -0.1, 0.252] }, { pos: [0.1, 0.1, 0.252] }, // Face 2 (+Z)
  { pos: [-0.1, -0.1, -0.252] }, { pos: [0.1, 0.1, -0.252] }, { pos: [-0.1, 0.1, -0.252] }, // Face 5 (-Z)
  { pos: [0.1, -0.1, -0.252] }, { pos: [0, 0, -0.252] },
  { pos: [0.252, -0.1, -0.1] }, { pos: [0.252, 0, 0] }, { pos: [0.252, 0.1, 0.1] }, // Face 3 (+X)
  { pos: [-0.252, -0.1, -0.1] }, { pos: [-0.252, 0.1, 0.1] }, // Face 4 (-X)
  { pos: [-0.252, -0.1, 0.1] }, { pos: [-0.252, 0.1, -0.1] },
];

function SingleDie({
  face,
  targetX,
  isRolling,
  spinOffset,
  onRest,
  highlight,
}: {
  readonly face: number;
  readonly targetX: number;
  readonly isRolling: boolean;
  readonly spinOffset: readonly [number, number, number];
  readonly onRest?: () => void;
  readonly highlight?: boolean;
}): React.ReactElement {
  const targetRot = getDiceFaceRotation(face);
  const spinRot: [number, number, number] = [
    targetRot[0] + spinOffset[0],
    targetRot[1] + spinOffset[1],
    targetRot[2] + spinOffset[2],
  ];

  const { posX, posY, posZ, rotX, rotY, rotZ } = useSpring({
    from: {
      posX: targetX,
      posY: 3.5,
      posZ: 0,
      rotX: spinRot[0],
      rotY: spinRot[1],
      rotZ: spinRot[2],
    },
    to: {
      posX: targetX,
      posY: 0.26,
      posZ: 0,
      rotX: targetRot[0],
      rotY: targetRot[1],
      rotZ: targetRot[2],
    },
    reset: isRolling,
    immediate: !isRolling,
    config: { tension: 170, friction: 14 },
    onRest: () => {
      if (isRolling && onRest) {
        onRest();
      }
    },
  });

  return (
    <a.group
      position-x={posX}
      position-y={posY}
      position-z={posZ}
      rotation-x={rotX}
      rotation-y={rotY}
      rotation-z={rotZ}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color={highlight ? '#FEF08A' : '#FFFDF0'}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
      {DIE_PIPS.map((pip, idx) => (
        <mesh key={idx} position={pip.pos}>
          <sphereGeometry args={[0.032, 8, 8]} />
          <meshBasicMaterial color={pip.isRed ? '#DC2626' : '#1E293B'} />
        </mesh>
      ))}
    </a.group>
  );
}

export function DiceTray(): React.ReactElement {
  const dice = useGameStore((s) => s.dice);
  const isRolling = useGameStore((s) => s.isRolling);
  const setIsRolling = useGameStore((s) => s.setIsRolling);

  const isDoubles = dice[0] === dice[1];
  const trimColor = isDoubles ? '#F59E0B' : '#78350F';

  return (
    <group position={[0, 0.05, 0]}>
      {/* Tray Floor (Green felt) */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[3.8, 0.08, 3.8]} />
        <meshStandardMaterial color="#14532D" roughness={0.8} />
      </mesh>

      {/* Tray Borders (Mahogany wood + Bronze rim) */}
      <mesh position={[0, 0.12, -1.9]} castShadow>
        <boxGeometry args={[4.0, 0.24, 0.2]} />
        <meshStandardMaterial color={trimColor} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.12, 1.9]} castShadow>
        <boxGeometry args={[4.0, 0.24, 0.2]} />
        <meshStandardMaterial color={trimColor} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[1.9, 0.12, 0]} castShadow>
        <boxGeometry args={[0.2, 0.24, 3.6]} />
        <meshStandardMaterial color={trimColor} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[-1.9, 0.12, 0]} castShadow>
        <boxGeometry args={[0.2, 0.24, 3.6]} />
        <meshStandardMaterial color={trimColor} roughness={0.4} metalness={0.3} />
      </mesh>

      {/* 2 Dice with independent tumble spins */}
      <SingleDie
        face={dice[0]}
        targetX={-0.6}
        isRolling={isRolling}
        spinOffset={[Math.PI * 4, Math.PI * 6, Math.PI * 2]}
        highlight={isDoubles}
      />
      <SingleDie
        face={dice[1]}
        targetX={0.6}
        isRolling={isRolling}
        spinOffset={[-Math.PI * 4, Math.PI * 8, -Math.PI * 4]}
        highlight={isDoubles}
        onRest={() => setIsRolling(false)}
      />
    </group>
  );
}
