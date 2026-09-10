// [UI-S02/MSS] PawnAnimator — Kinetic Squash & Stretch pawn hop with parabolic arc trajectory
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, type Group } from 'three';
import type { Player } from '../../domain/room';
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme';
import { getEmoteDef } from '../../domain/emotes';
import { useGameStore, type PawnAnimationState } from '../store/game_store';
import { cellPosition } from './board_coords';
import {
  interpolatePawnPosition, BASE_PAWN_Y, HOP_DURATION, LANDING_DURATION,
  calculateKineticPawnScale, calculatePawnLandingImpact, getStepPitchVariation,
} from './pawn_path';
import { AudioEngine } from '../audio/audio_engine';
import { SoundEffect } from '../audio/audio_types';

export * from './pawn_path';

export const PLAYER_OFFSETS: readonly [number, number, number][] = [
  [-0.2, 0, -0.2], [0.2, 0, -0.2], [-0.2, 0, 0.2], [0.2, 0, 0.2],
] as const;

export function PawnMesh({ color }: { readonly color: string }): React.ReactElement {
  return (
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
  );
}

const emoteCanvasCache = new Map<string, CanvasTexture>();
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

export interface SingleHopProps {
  readonly fromCell: number;
  readonly toCell: number;
  readonly offset: readonly [number, number, number];
  readonly color: string;
  readonly onHopComplete: () => void;
  readonly emoteId?: string;
}

export function SingleHopPawn({ fromCell, toCell, offset, color, onHopComplete, emoteId }: SingleHopProps): React.ReactElement | null {
  const groupRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const soundPlayedRef = useRef(false);
  const completedRef = useRef(false);
  const onHopCompleteRef = useRef(onHopComplete);
  onHopCompleteRef.current = onHopComplete;

  useEffect(() => {
    if (fromCell === toCell && !completedRef.current) {
      completedRef.current = true;
      onHopCompleteRef.current();
    }
  }, [fromCell, toCell]);

  useFrame((_, delta) => {
    if (completedRef.current || !groupRef.current || fromCell === toCell) return;

    const dt = Math.min(delta, 0.1);
    elapsedRef.current += dt;
    const t = elapsedRef.current;

    if (t <= HOP_DURATION) {
      const jumpProgress = t / HOP_DURATION;
      const [x, y, z] = interpolatePawnPosition(fromCell, toCell, jumpProgress);
      const [sx, sy, sz] = calculateKineticPawnScale(jumpProgress, 0);
      const groundAdjustment = jumpProgress <= 0.10 ? -0.22 * (1 - sy) * (1 - jumpProgress / 0.10) : 0;
      groupRef.current.position.set(x + offset[0], y + groundAdjustment, z + offset[2]);
      groupRef.current.scale.set(sx, sy, sz);
    } else if (t <= HOP_DURATION + LANDING_DURATION) {
      if (!soundPlayedRef.current) {
        soundPlayedRef.current = true;
        const randomPitch = getStepPitchVariation();
        AudioEngine.playSfx(SoundEffect.PAWN_STEP, randomPitch);
      }

      const landingProgress = (t - HOP_DURATION) / LANDING_DURATION;
      const [x, y, z] = interpolatePawnPosition(fromCell, toCell, 1.0);
      const [sx, sy, sz] = calculatePawnLandingImpact(landingProgress);
      const groundAdjustment = -0.22 * (1 - sy);
      groupRef.current.position.set(x + offset[0], y + groundAdjustment, z + offset[2]);
      groupRef.current.scale.set(sx, sy, sz);
    } else {
      completedRef.current = true;
      const [x, y, z] = interpolatePawnPosition(fromCell, toCell, 1.0);
      groupRef.current.position.set(x + offset[0], y, z + offset[2]);
      groupRef.current.scale.set(1, 1, 1);
      onHopComplete();
    }
  });

  const [startX, startY, startZ] = interpolatePawnPosition(fromCell, toCell, 0);

  return (
    <group
      ref={groupRef}
      position={[startX + offset[0], startY, startZ + offset[2]]}
      scale={[1, 1, 1]}
    >
      <PawnMesh color={color} />
      {emoteId && <PawnEmoteBubble emoteId={emoteId} />}
    </group>
  );
}

export interface ActivePawnProps extends Pick<SingleHopProps, 'color' | 'offset' | 'emoteId'> {
  readonly player: Player;
  readonly animation: PawnAnimationState;
  readonly onComplete: (playerId: string) => void;
}

export function ActiveSpringPawn({ player, color, offset, animation, onComplete, emoteId }: ActivePawnProps): React.ReactElement | null {
  const [stepIndex, setStepIndex] = useState(0);
  const waypoints = animation.waypoints;

  // Khóa nhận diện hoạt cảnh duy nhất theo quỹ đạo di chuyển (tránh re-trigger khi currentIndex cập nhật từng bước)
  const animKey = `${animation.playerId}_${animation.fromCell}_${waypoints.join('-')}`;
  const prevAnimKeyRef = useRef(animKey);

  useEffect(() => {
    if (prevAnimKeyRef.current !== animKey) {
      prevAnimKeyRef.current = animKey;
      setStepIndex(0);
    }
  }, [animKey]);

  useEffect(() => {
    if (!waypoints || waypoints.length === 0) {
      onComplete(player.id);
      useGameStore.getState().clearActivePawnAnimation();
    }
  }, [waypoints, onComplete, player.id]);

  if (!waypoints || waypoints.length === 0 || stepIndex >= waypoints.length) {
    return null;
  }

  const fromCell = stepIndex === 0 ? animation.fromCell : (waypoints[stepIndex - 1] ?? animation.fromCell);
  const toCell = waypoints[stepIndex] ?? fromCell;

  const handleHopComplete = useCallback(() => {
    const nextIdx = stepIndex + 1;
    if (nextIdx < waypoints.length) {
      setStepIndex(nextIdx);
      const anim = useGameStore.getState().activePawnAnimation;
      if (anim && anim.playerId === player.id) {
        useGameStore.setState({
          activePawnAnimation: { ...anim, currentIndex: nextIdx },
        });
      }
    } else {
      onComplete(player.id);
      useGameStore.getState().clearActivePawnAnimation();
    }
  }, [stepIndex, waypoints, player.id, onComplete]);

  return (
    <SingleHopPawn
      key={stepIndex}
      fromCell={fromCell}
      toCell={toCell}
      offset={offset}
      color={color}
      onHopComplete={handleHopComplete}
      emoteId={emoteId}
    />
  );
}

export function PawnAnimator({ players = [] }: { readonly players?: readonly Player[] }): React.ReactElement {
  const activeAnimation = useGameStore((s) => s.activePawnAnimation);
  const playerPositions = useGameStore((s) => s.playerPositions);
  const completePawnMove = useGameStore((s) => s.completePawnMove);
  const activeEmotes = useGameStore((s) => s.activeEmotes);

  // [UI-S02/MSS] Đảm bảo dọn dẹp an toàn nếu hoạt ảnh rỗng không bao giờ kích hoạt ActiveSpringPawn
  useEffect(() => {
    if (activeAnimation?.isAnimating && (!activeAnimation.waypoints || activeAnimation.waypoints.length === 0)) {
      completePawnMove(activeAnimation.playerId);
      useGameStore.getState().clearActivePawnAnimation();
    }
  }, [activeAnimation, completePawnMove]);

  return (
    <group>
      {players.map((player, index) => {
        const color = PLAYER_TOKEN_PALETTE[index % PLAYER_TOKEN_PALETTE.length] ?? '#38BDF8';
        const offset = PLAYER_OFFSETS[index % PLAYER_OFFSETS.length] ?? [0, 0, 0];
        const isAnimating = activeAnimation != null && activeAnimation.playerId === player.id && activeAnimation.isAnimating;
        const currentPos = playerPositions[player.id] ?? player.position;
        const activeEmote = activeEmotes[player.id];

        if (isAnimating && activeAnimation.waypoints.length > 0) {
          const animKey = `${player.id}_${activeAnimation.fromCell}_${activeAnimation.waypoints.join('-')}`;
          return (
            <ActiveSpringPawn
              key={animKey}
              player={player}
              color={color}
              offset={offset}
              animation={activeAnimation}
              onComplete={completePawnMove}
              emoteId={activeEmote?.emoteId}
            />
          );
        }

        const [x, , z] = cellPosition(currentPos);
        return (
          <group key={player.id} position={[x + offset[0], BASE_PAWN_Y, z + offset[2]]}>
            <PawnMesh color={color} />
            {activeEmote && <PawnEmoteBubble emoteId={activeEmote.emoteId} />}
          </group>
        );
      })}
    </group>
  );
}
