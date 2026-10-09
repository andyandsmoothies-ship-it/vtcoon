// [IMP-311] Single Hop Pawn & Emote Bubble Presentation Primitives
import React, { useEffect, useMemo, useRef } from 'react';
import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, type Group } from 'three';
import { getEmoteDef } from '../../domain/emotes.js';
import {
  interpolatePawnPosition, DEFAULT_JUMP_ARC, JAIL_FLIGHT_ARC,
  JAIL_FLIGHT_DURATION, BOT_JAIL_FLIGHT_DURATION, JAIL_LANDING_DURATION,
  HOP_DURATION, LANDING_DURATION, BOT_HOP_DURATION, BOT_LANDING_DURATION,
  calculateKineticSquashStretch, calculatePawnLandingImpact, getStepPitchVariation,
} from './pawn_path.js';
import { AudioEngine } from '../audio/audio_engine.js';
import { SoundEffect } from '../audio/audio_types.js';
import { LuxuryPawnModel } from './luxury_pawn_models.js';

export function PawnMesh({ color }: { readonly color: string }): React.ReactElement {
  return (
    <group scale={[0.625, 0.625, 0.625]}>
      <group castShadow>
        <mesh position={[0, -0.18, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.25, 0.08, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.3} />
        </mesh>
        <mesh position={[0, -0.02, 0]} castShadow>
          <coneGeometry args={[0.18, 0.26, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.16, 0]} castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export const emoteCanvasCache = new Map<string, CanvasTexture>();

export function clearEmoteCanvasCache(): void {
  for (const tex of emoteCanvasCache.values()) {
    if (tex && typeof tex.dispose === 'function') tex.dispose();
  }
  emoteCanvasCache.clear();
}

function getEmoteBillboardTexture(icon: string): CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const cached = emoteCanvasCache.get(icon);
  if (cached) return cached;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(64, 64, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.font = '54px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 64, 68);
    const tex = new CanvasTexture(canvas);
    emoteCanvasCache.set(icon, tex);
    return tex;
  } catch {
    return null;
  }
}

export function PawnEmoteBubble({ emoteId }: { readonly emoteId: string }): React.ReactElement | null {
  const emote = getEmoteDef(emoteId);
  const texture = useMemo(() => (emote ? getEmoteBillboardTexture(emote.icon) : null), [emote]);
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = 0.65 + Math.sin(t * 4) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.65, 0]}>
      <Billboard follow={true}>
        <mesh>
          <planeGeometry args={[0.65, 0.65]} />
          {texture
            ? <meshBasicMaterial map={texture} transparent depthWrite={false} />
            : <meshBasicMaterial color="#F59E0B" />}
        </mesh>
      </Billboard>
    </group>
  );
}

export interface HopFrameParams {
  readonly elapsed: number;
  readonly delta: number;
  readonly hopDuration: number;
  readonly landingDuration: number;
  readonly arcHeight: number;
  readonly fromCell: number;
  readonly toCell: number;
  readonly offset: readonly [number, number, number];
  readonly soundPlayed: boolean;
  readonly isJailFlight?: boolean;
}

export interface HopFrameResult {
  readonly elapsed: number;
  readonly position: readonly [number, number, number];
  readonly scale: readonly [number, number, number];
  readonly soundToPlay?: SoundEffect;
  readonly pitch?: number;
  readonly isComplete: boolean;
}

export function computeHopFrame(params: HopFrameParams): HopFrameResult {
  const dt = Math.min(params.delta, 0.1);
  const t = params.elapsed + dt;

  if (t <= params.hopDuration) {
    const jumpProgress = t / params.hopDuration;
    const [x, y, z] = interpolatePawnPosition(params.fromCell, params.toCell, jumpProgress, params.arcHeight);
    const [sx, sy, sz] = calculateKineticSquashStretch(jumpProgress, 0);
    const groundAdjustment = jumpProgress <= 0.10 ? -0.22 * (1 - sy) * (1 - jumpProgress / 0.10) : 0;
    return {
      elapsed: t,
      position: [x + params.offset[0], y + groundAdjustment, z + params.offset[2]],
      scale: [sx, sy, sz],
      isComplete: false,
    };
  }

  if (t <= params.hopDuration + params.landingDuration) {
    let soundToPlay: SoundEffect | undefined;
    let pitch: number | undefined;
    if (!params.soundPlayed) {
      if (params.isJailFlight) {
        soundToPlay = SoundEffect.TAX_PENALTY;
      } else {
        soundToPlay = SoundEffect.PAWN_STEP;
        pitch = getStepPitchVariation();
      }
    }

    const landingProgress = (t - params.hopDuration) / params.landingDuration;
    const [x, y, z] = interpolatePawnPosition(params.fromCell, params.toCell, 1.0, params.arcHeight);
    const [sx, sy, sz] = calculatePawnLandingImpact(landingProgress);
    const groundAdjustment = -0.22 * (1 - sy);
    return {
      elapsed: t,
      position: [x + params.offset[0], y + groundAdjustment, z + params.offset[2]],
      scale: [sx, sy, sz],
      soundToPlay,
      pitch,
      isComplete: false,
    };
  }

  const [x, y, z] = interpolatePawnPosition(params.fromCell, params.toCell, 1.0, params.arcHeight);
  return {
    elapsed: t,
    position: [x + params.offset[0], y, z + params.offset[2]],
    scale: [1, 1, 1],
    isComplete: true,
  };
}

export interface SingleHopProps {
  readonly fromCell: number;
  readonly toCell: number;
  readonly offset: readonly [number, number, number];
  readonly color: string;
  readonly onHopComplete: () => void;
  readonly emoteId?: string;
  readonly slotIndex?: number;
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

export function SingleHopPawn({
  fromCell,
  toCell,
  offset,
  color,
  onHopComplete,
  emoteId,
  slotIndex,
  isBot,
  isJailFlight,
}: SingleHopProps): React.ReactElement | null {
  const groupRef = React.useRef<Group>(null);
  const elapsedRef = React.useRef(0);
  const soundPlayedRef = React.useRef(false);
  const completedRef = React.useRef(false);
  const onHopCompleteRef = React.useRef(onHopComplete);
  onHopCompleteRef.current = onHopComplete;

  const hopDuration = isJailFlight
    ? (isBot ? BOT_JAIL_FLIGHT_DURATION : JAIL_FLIGHT_DURATION)
    : (isBot ? BOT_HOP_DURATION : HOP_DURATION);
  const landingDuration = isJailFlight
    ? JAIL_LANDING_DURATION
    : (isBot ? BOT_LANDING_DURATION : LANDING_DURATION);
  const arcHeight = isJailFlight ? JAIL_FLIGHT_ARC : DEFAULT_JUMP_ARC;

  useEffect(() => {
    if (fromCell === toCell && !completedRef.current) {
      completedRef.current = true;
      onHopCompleteRef.current();
    }
  }, [fromCell, toCell]);

  useFrame((_, delta) => {
    if (completedRef.current || !groupRef.current || fromCell === toCell) return;

    const res = computeHopFrame({
      elapsed: elapsedRef.current,
      delta,
      hopDuration,
      landingDuration,
      arcHeight,
      fromCell,
      toCell,
      offset,
      soundPlayed: soundPlayedRef.current,
      isJailFlight,
    });

    elapsedRef.current = res.elapsed;

    if (res.soundToPlay && !soundPlayedRef.current) {
      soundPlayedRef.current = true;
      if (res.pitch !== undefined) {
        AudioEngine.playSfx(res.soundToPlay, res.pitch);
      } else {
        AudioEngine.playSfx(res.soundToPlay);
      }
    }

    groupRef.current.position.set(res.position[0], res.position[1], res.position[2]);
    groupRef.current.scale.set(res.scale[0], res.scale[1], res.scale[2]);

    if (res.isComplete) {
      completedRef.current = true;
      onHopComplete();
    }
  });

  const [startX, startY, startZ] = interpolatePawnPosition(fromCell, toCell, 0, arcHeight);

  return (
    <group
      ref={groupRef}
      position={[startX + offset[0], startY, startZ + offset[2]]}
      scale={[1, 1, 1]}
    >
      {slotIndex !== undefined ? (
        <LuxuryPawnModel slotIndex={slotIndex} playerColor={color} forceFallback={true} />
      ) : (
        <PawnMesh color={color} />
      )}
      {emoteId && <PawnEmoteBubble emoteId={emoteId} />}
    </group>
  );
}
