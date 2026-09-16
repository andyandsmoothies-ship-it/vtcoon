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

const FACE_OFFSET = 0.292;
const PIP_GAP = 0.11;

const DIE_PIPS: readonly PipDef[] = [
  { pos: [0, FACE_OFFSET, 0], isRed: true }, // Face 1 (+Y)
  { pos: [-PIP_GAP, -FACE_OFFSET, -PIP_GAP] }, { pos: [-PIP_GAP, -FACE_OFFSET, 0] }, { pos: [-PIP_GAP, -FACE_OFFSET, PIP_GAP] }, // Face 6 (-Y)
  { pos: [PIP_GAP, -FACE_OFFSET, -PIP_GAP] }, { pos: [PIP_GAP, -FACE_OFFSET, 0] }, { pos: [PIP_GAP, -FACE_OFFSET, PIP_GAP] },
  { pos: [-PIP_GAP, -PIP_GAP, FACE_OFFSET] }, { pos: [PIP_GAP, PIP_GAP, FACE_OFFSET] }, // Face 2 (+Z)
  { pos: [-PIP_GAP, -PIP_GAP, -FACE_OFFSET] }, { pos: [PIP_GAP, PIP_GAP, -FACE_OFFSET] }, { pos: [-PIP_GAP, PIP_GAP, -FACE_OFFSET] }, // Face 5 (-Z)
  { pos: [PIP_GAP, -PIP_GAP, -FACE_OFFSET] }, { pos: [0, 0, -FACE_OFFSET] },
  { pos: [FACE_OFFSET, -PIP_GAP, -PIP_GAP] }, { pos: [FACE_OFFSET, 0, 0] }, { pos: [FACE_OFFSET, PIP_GAP, PIP_GAP] }, // Face 3 (+X)
  { pos: [-FACE_OFFSET, -PIP_GAP, -PIP_GAP] }, { pos: [-FACE_OFFSET, PIP_GAP, PIP_GAP] }, // Face 4 (-X)
  { pos: [-FACE_OFFSET, -PIP_GAP, PIP_GAP] }, { pos: [-FACE_OFFSET, PIP_GAP, -PIP_GAP] },
];

function SingleDie({
  face,
  targetX,
  isRolling,
  spinOffset,
  onRest,
  highlight,
  fadeOpacity = 1.0,
  diceSeq,
}: {
  readonly face: number;
  readonly targetX: number;
  readonly isRolling: boolean;
  readonly spinOffset: readonly [number, number, number];
  readonly onRest?: () => void;
  readonly highlight?: boolean;
  readonly fadeOpacity?: number;
  readonly diceSeq?: number;
}): React.ReactElement {
  const lastAnimatedSeqRef = useRef<number | undefined>(undefined);
  const prevRollingRef = useRef(false);

  let shouldReset = false;
  if (isRolling) {
    if (diceSeq !== undefined) {
      if (diceSeq !== lastAnimatedSeqRef.current) {
        shouldReset = true;
        lastAnimatedSeqRef.current = diceSeq;
      }
    } else if (!prevRollingRef.current) {
      shouldReset = true;
    }
  }
  prevRollingRef.current = isRolling;

  const targetRot = getDiceFaceRotation(clampDiceFace(face));

  const { t } = useSpring({
    from: { t: 0 },
    to: { t: 1 },
    reset: shouldReset,
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

  const isFadeActive = fadeOpacity < 1.0;

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
        <boxGeometry args={[0.58, 0.58, 0.58]} />
        <meshPhysicalMaterial
          color={highlight ? '#B91C1C' : '#DC2626'}
          roughness={0.18}
          metalness={0.05}
          transparent={isFadeActive}
          opacity={fadeOpacity}
          clearcoat={0.6}
          clearcoatRoughness={0.12}
        />
      </mesh>
      {DIE_PIPS.map((pip, idx) => (
        <mesh key={idx} position={pip.pos}>
          <sphereGeometry args={[pip.isRed ? 0.065 : 0.050, 12, 12]} />
          <meshStandardMaterial
            color={pip.isRed ? '#EF4444' : '#FFFFFF'}
            emissive={pip.isRed ? '#EF4444' : '#FFFFFF'}
            emissiveIntensity={0.25}
            roughness={0.15}
            transparent={isFadeActive}
            opacity={fadeOpacity}
          />
        </mesh>
      ))}
    </a.group>
  );
}

export function DiceTray(): React.ReactElement {
  const isSSR = typeof window === 'undefined';
  const ssrState = isSSR ? useGameStore.getState() : null;

  const diceStore = useGameStore((s) => s.dice);
  const isRollingStore = useGameStore((s) => s.isRolling);
  const setIsRolling = useGameStore((s) => s.setIsRolling);

  const dice = ssrState ? ssrState.dice : diceStore;
  const isRolling = ssrState ? ssrState.isRolling : isRollingStore;

  const prevRollingRef = useRef(false);
  const [fadeOpacity, setFadeOpacity] = useState(1.0);
  const [isVisible, setIsVisible] = useState(Boolean(isRolling));

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
      setFadeOpacity(1.0);
      AudioEngine.playSfx(SoundEffect.DICE_ROLL);
    } else if (!isRolling && prevRollingRef.current) {
      // Dừng quay -> chờ 1.5s rồi mờ dần trong 300ms
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

  const lastDiceSeqStore = useGameStore((s) => s.lastDiceSeq);
  const lastDiceSeq = ssrState ? ssrState.lastDiceSeq : lastDiceSeqStore;

  const isDoubles = dice[0] === dice[1];

  return (
    <group position={[0.0, 0.020, 0.0]} data-testid="dice-tray">
      {/* Sàn diễn xúc xắc phẳng trên sông Sài Gòn với hoa văn la bàn đồng thau */}
      <mesh receiveShadow position={[0, -0.01, 0]}>
        <boxGeometry args={[3.2, 0.015, 2.4]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.65} />
      </mesh>
      <mesh receiveShadow position={[0, -0.005, 0]}>
        <boxGeometry args={[3.0, 0.015, 2.2]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.55} />
      </mesh>
      {Boolean(isRolling || (isVisible && fadeOpacity > 0)) && (
        <>
          <mesh receiveShadow position={[0, 0.001, 0]}>
            <boxGeometry args={[2.8, 0.015, 2.0]} />
            <meshStandardMaterial color="#064E3B" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.45, 0.48, 32]} />
            <meshBasicMaterial color="#F59E0B" />
          </mesh>
        </>
      )}

      {/* 2 Xúc xắc 3D đỏ Ruby chỉ render khi đang quay hoặc mờ dần */}
      {Boolean(isRolling || (isVisible && fadeOpacity > 0)) && (
        <group>
          <SingleDie
            face={dice[0]}
            targetX={-0.65}
            isRolling={isRolling}
            spinOffset={spinOffsetsRef.current[0]}
            highlight={isDoubles}
            fadeOpacity={fadeOpacity}
            diceSeq={lastDiceSeq}
          />
          <SingleDie
            face={dice[1]}
            targetX={0.65}
            isRolling={isRolling}
            spinOffset={spinOffsetsRef.current[1]}
            highlight={isDoubles}
            fadeOpacity={fadeOpacity}
            diceSeq={lastDiceSeq}
            onRest={() => setIsRolling(false)}
          />
        </group>
      )}
    </group>
  );
}
