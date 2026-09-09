// [UI-S02/MSS] DiceTray — 3D Central dice tray & spring physics falling dice
import React, { useRef, useEffect } from 'react';
import { a, useSpring } from '@react-spring/three';
import { useGameStore } from '../store/game_store';
import {
  getDiceFaceRotation,
  calculateDiceElevation,
  calculateDiceRotationFactor,
  generateRandomDiceSpin,
  clampDiceFace,
} from './dice_math';
import { AudioEngine } from '../audio/audio_engine';
import { SoundEffect } from '../audio/audio_types';

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
  const targetRot = getDiceFaceRotation(clampDiceFace(face));

  const { t } = useSpring({
    from: { t: 0 },
    to: { t: 1 },
    reset: isRolling,
    immediate: !isRolling,
    config: { duration: 1400 },
    onRest: (result) => {
      if (isRolling && onRest && (!result || result.finished !== false)) {
        onRest();
      }
    },
  });

  const posY = t.to((val) => calculateDiceElevation(val));
  const rotX = t.to((val) => targetRot[0] + spinOffset[0] * calculateDiceRotationFactor(val));
  const rotY = t.to((val) => targetRot[1] + spinOffset[1] * calculateDiceRotationFactor(val));
  const rotZ = t.to((val) => targetRot[2] + spinOffset[2] * calculateDiceRotationFactor(val));

  return (
    <a.group
      position-x={targetX}
      position-y={posY}
      position-z={0}
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

  const prevRollingRef = useRef(false);
  const spinOffsetsRef = useRef<
    readonly [readonly [number, number, number], readonly [number, number, number]]
  >([
    [Math.PI * 6, Math.PI * 8, Math.PI * 6],
    [-Math.PI * 8, Math.PI * 6, -Math.PI * 8],
  ]);

  if (isRolling && !prevRollingRef.current) {
    spinOffsetsRef.current = [generateRandomDiceSpin(), generateRandomDiceSpin()];
  }

  useEffect(() => {
    if (isRolling && !prevRollingRef.current) {
      AudioEngine.playSfx(SoundEffect.DICE_ROLL);
    }
    prevRollingRef.current = isRolling;
  }, [isRolling]);

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
        spinOffset={spinOffsetsRef.current[0]}
        highlight={isDoubles}
      />
      <SingleDie
        face={dice[1]}
        targetX={0.6}
        isRolling={isRolling}
        spinOffset={spinOffsetsRef.current[1]}
        highlight={isDoubles}
        onRest={() => setIsRolling(false)}
      />
    </group>
  );
}
