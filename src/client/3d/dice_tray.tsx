// [UI-S02/MSS][IMP-30] DiceTray — Transient Ruby PBR Falling Dice on Saigon Boulevard Runway
import React, { useRef, useEffect, useState } from 'react';
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
  fadeOpacity = 0.88,
}: {
  readonly face: number;
  readonly targetX: number;
  readonly isRolling: boolean;
  readonly spinOffset: readonly [number, number, number];
  readonly onRest?: () => void;
  readonly highlight?: boolean;
  readonly fadeOpacity?: number;
}): React.ReactElement {
  const targetRot = getDiceFaceRotation(clampDiceFace(face));

  const { t } = useSpring({
    from: { t: 0 },
    to: { t: 1 },
    reset: isRolling,
    immediate: !isRolling,
    config: { duration: 1100 },
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
        <meshPhysicalMaterial
          color={highlight ? '#EF4444' : '#DC2626'}
          roughness={0.12}
          metalness={0.10}
          transparent={true}
          opacity={fadeOpacity}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
        />
      </mesh>
      {DIE_PIPS.map((pip, idx) => (
        <mesh key={idx} position={pip.pos}>
          <sphereGeometry args={[0.038, 12, 12]} />
          <meshStandardMaterial
            color={pip.isRed ? '#EF4444' : '#FFFFFF'}
            roughness={0.15}
            transparent={true}
            opacity={fadeOpacity}
          />
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
  const [fadeOpacity, setFadeOpacity] = useState(0.88);
  const [isVisible, setIsVisible] = useState(true);

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
    if (isRolling) {
      setIsVisible(true);
      setFadeOpacity(0.88);
      AudioEngine.playSfx(SoundEffect.DICE_ROLL);
    } else if (!isRolling && prevRollingRef.current) {
      // Dừng quay -> chờ 1.5s rồi mờ dần trong 300ms (Phương án A)
      const timer = setTimeout(() => {
        setFadeOpacity(0);
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 300);
        return () => clearTimeout(hideTimer);
      }, 1500);
      return () => clearTimeout(timer);
    }
    prevRollingRef.current = isRolling;
  }, [isRolling]);

  const isDoubles = dice[0] === dice[1];

  return (
    <group position={[0.0, 0.020, 3.8]} data-testid="dice-tray">
      {/* Sàn diễn xúc xắc phẳng trên Đại Lộ Sài Gòn với hoa văn la bàn đồng thau */}
      <mesh receiveShadow position={[0, -0.01, 0]}>
        <boxGeometry args={[3.2, 0.015, 2.4]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.65} />
      </mesh>
      <mesh receiveShadow position={[0, -0.005, 0]}>
        <boxGeometry args={[3.0, 0.015, 2.2]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.55} />
      </mesh>
      <mesh receiveShadow position={[0, 0.001, 0]}>
        <boxGeometry args={[2.8, 0.015, 2.0]} />
        <meshStandardMaterial color="#064E3B" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.45, 0.48, 32]} />
        <meshBasicMaterial color="#F59E0B" />
      </mesh>

      {/* 2 Xúc xắc 3D đỏ Ruby trong suốt với chuyển động vật lý đàn hồi */}
      <group visible={isVisible}>
        <SingleDie
          face={dice[0]}
          targetX={-0.6}
          isRolling={isRolling}
          spinOffset={spinOffsetsRef.current[0]}
          highlight={isDoubles}
          fadeOpacity={fadeOpacity}
        />
        <SingleDie
          face={dice[1]}
          targetX={0.6}
          isRolling={isRolling}
          spinOffset={spinOffsetsRef.current[1]}
          highlight={isDoubles}
          fadeOpacity={fadeOpacity}
          onRest={() => setIsRolling(false)}
        />
      </group>
    </group>
  );
}
