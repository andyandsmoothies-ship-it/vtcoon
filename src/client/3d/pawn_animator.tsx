// [UI-S02/MSS] PawnAnimator — Kinetic Squash & Stretch pawn hop with parabolic arc trajectory
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, type Group } from 'three';
import type { Player } from '../../domain/room';
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme';
import { getEmoteDef } from '../../domain/emotes';
import { useGameStore, type PawnAnimationState } from '../store/game_store';
import { useVfxStore, type PawnReactionState } from '../store/vfx_store';
import { cellPosition } from './board_coords';
import {
  interpolatePawnPosition, BASE_PAWN_Y, HOP_DURATION, LANDING_DURATION,
  BOT_HOP_DURATION, BOT_LANDING_DURATION, DEFAULT_JUMP_ARC,
  JAIL_FLIGHT_ARC, JAIL_FLIGHT_DURATION, BOT_JAIL_FLIGHT_DURATION, JAIL_LANDING_DURATION,
  calculateKineticSquashStretch, calculatePawnLandingImpact, getStepPitchVariation,
  calculateVictorySpin, calculateSlumpRecoil,
} from './pawn_path';
import { AudioEngine } from '../audio/audio_engine';
import { SoundEffect } from '../audio/audio_types';
import { LuxuryPawnModel } from './luxury_pawn_models';

export * from './pawn_path';

export const PLAYER_OFFSETS: readonly [number, number, number][] = [
  [-0.2, 0, -0.2], [0.2, 0, -0.2], [-0.2, 0, 0.2], [0.2, 0, 0.2],
] as const;

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
  readonly slotIndex?: number;
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

export function SingleHopPawn({ fromCell, toCell, offset, color, onHopComplete, emoteId, slotIndex, isBot, isJailFlight }: SingleHopProps): React.ReactElement | null {
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

    const dt = Math.min(delta, 0.1);
    elapsedRef.current += dt;
    const t = elapsedRef.current;

    if (t <= hopDuration) {
      const jumpProgress = t / hopDuration;
      const [x, y, z] = interpolatePawnPosition(fromCell, toCell, jumpProgress, arcHeight);
      const [sx, sy, sz] = calculateKineticSquashStretch(jumpProgress, 0);
      const groundAdjustment = jumpProgress <= 0.10 ? -0.22 * (1 - sy) * (1 - jumpProgress / 0.10) : 0;
      groupRef.current.position.set(x + offset[0], y + groundAdjustment, z + offset[2]);
      groupRef.current.scale.set(sx, sy, sz);
    } else if (t <= hopDuration + landingDuration) {
      if (!soundPlayedRef.current) {
        soundPlayedRef.current = true;
        if (isJailFlight) {
          AudioEngine.playSfx(SoundEffect.TAX_PENALTY);
        } else {
          const randomPitch = getStepPitchVariation();
          AudioEngine.playSfx(SoundEffect.PAWN_STEP, randomPitch);
        }
      }

      const landingProgress = (t - hopDuration) / landingDuration;
      const [x, y, z] = interpolatePawnPosition(fromCell, toCell, 1.0, arcHeight);
      const [sx, sy, sz] = calculatePawnLandingImpact(landingProgress);
      const groundAdjustment = -0.22 * (1 - sy);
      groupRef.current.position.set(x + offset[0], y + groundAdjustment, z + offset[2]);
      groupRef.current.scale.set(sx, sy, sz);
    } else {
      completedRef.current = true;
      const [x, y, z] = interpolatePawnPosition(fromCell, toCell, 1.0, arcHeight);
      groupRef.current.position.set(x + offset[0], y, z + offset[2]);
      groupRef.current.scale.set(1, 1, 1);
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
        <LuxuryPawnModel slotIndex={slotIndex} playerColor={color} />
      ) : (
        <PawnMesh color={color} />
      )}
      {emoteId && <PawnEmoteBubble emoteId={emoteId} />}
    </group>
  );
}

export interface ActivePawnProps extends Pick<SingleHopProps, 'color' | 'offset' | 'emoteId' | 'slotIndex'> {
  readonly player: Player;
  readonly animation: PawnAnimationState;
  readonly onComplete: (playerId: string) => void;
  readonly isBot?: boolean;
}

export function ActiveSpringPawn({ player, color, offset, animation, onComplete, emoteId, slotIndex, isBot: isBotProp }: ActivePawnProps): React.ReactElement | null {
  const [stepIndex, setStepIndex] = useState(0);
  const waypoints = animation.waypoints;
  const isBot = isBotProp !== undefined ? isBotProp : Boolean(animation.isBot || player.isBot);

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
      slotIndex={slotIndex}
      isBot={isBot}
      isJailFlight={Boolean(animation.isJailFlight)}
    />
  );
}

function PawnReactionFrameUpdater({
  groupRef,
  offset,
  currentPos,
  reaction,
}: {
  readonly groupRef: React.RefObject<Group | null>;
  readonly offset: readonly [number, number, number];
  readonly currentPos: number;
  readonly reaction?: PawnReactionState;
}): null {
  const [x, , z] = cellPosition(currentPos);

  useFrame(() => {
    if (!groupRef.current) return;
    if (!reaction) {
      groupRef.current.position.set(x + offset[0], BASE_PAWN_Y, z + offset[2]);
      groupRef.current.rotation.set(0, 0, 0);
      groupRef.current.scale.set(1, 1, 1);
      return;
    }

    const elapsed = Date.now() - reaction.startTime;
    const progress = Math.max(0, Math.min(1, elapsed / reaction.durationMs));

    if (reaction.type === 'victory_spin') {
      const spin = calculateVictorySpin(progress);
      groupRef.current.position.set(x + offset[0], BASE_PAWN_Y + spin.heightOffset, z + offset[2]);
      groupRef.current.rotation.set(0, spin.rotationY, 0);
      groupRef.current.scale.set(1, 1, 1);
    } else if (reaction.type === 'slump_recoil') {
      const recoil = calculateSlumpRecoil(progress);
      groupRef.current.position.set(x + offset[0], BASE_PAWN_Y, z + offset[2]);
      groupRef.current.rotation.set(0, 0, 0);
      groupRef.current.scale.set(recoil.scaleXZ, recoil.scaleY, recoil.scaleXZ);
    }
  });

  return null;
}

function StaticPawnWithReaction({
  player,
  assignedSlot,
  color,
  offset,
  currentPos,
  activeEmote,
  reaction,
}: {
  readonly player: Player;
  readonly assignedSlot: number;
  readonly color: string;
  readonly offset: readonly [number, number, number];
  readonly currentPos: number;
  readonly activeEmote?: { emoteId: string };
  readonly reaction?: PawnReactionState;
}): React.ReactElement {
  const groupRef = useRef<Group>(null);
  const [x, , z] = cellPosition(currentPos);
  const isSSR = typeof window === 'undefined';

  return (
    <group
      ref={groupRef}
      key={player.id}
      position={[x + offset[0], BASE_PAWN_Y, z + offset[2]]}
      data-pawn-reaction={reaction?.type}
    >
      {!isSSR && (
        <PawnReactionFrameUpdater
          groupRef={groupRef}
          offset={offset}
          currentPos={currentPos}
          reaction={reaction}
        />
      )}
      <LuxuryPawnModel slotIndex={assignedSlot} playerColor={color} />
      {activeEmote && <PawnEmoteBubble emoteId={activeEmote.emoteId} />}
    </group>
  );
}

export function PawnAnimator({ players = [] }: { readonly players?: readonly Player[] }): React.ReactElement {
  const storeActiveAnimation = useGameStore((s) => s.activePawnAnimation);
  const storePendingPawnMove = useGameStore((s) => s.pendingPawnMove);
  const storePlayerPositions = useGameStore((s) => s.playerPositions);
  const storeVisualPositions = useGameStore((s) => s.visualPositions);
  const storeCompletePawnMove = useGameStore((s) => s.completePawnMove);
  const storeActiveEmotes = useGameStore((s) => s.activeEmotes);
  const storePlayersInfo = useGameStore((s) => s.playersInfo);
  const storeActivePawnReactions = useVfxStore((s) => s.activePawnReactions);

  const isSSR = typeof window === 'undefined';
  const activeAnimation = isSSR ? useGameStore.getState().activePawnAnimation : storeActiveAnimation;
  const pendingPawnMove = isSSR ? useGameStore.getState().pendingPawnMove : storePendingPawnMove;
  const playerPositions = isSSR ? useGameStore.getState().playerPositions : storePlayerPositions;
  const visualPositions = isSSR ? useGameStore.getState().visualPositions : storeVisualPositions;
  const completePawnMove = isSSR ? useGameStore.getState().completePawnMove : storeCompletePawnMove;
  const activeEmotes = isSSR ? useGameStore.getState().activeEmotes : storeActiveEmotes;
  const playersInfo = isSSR ? useGameStore.getState().playersInfo : storePlayersInfo;
  const activePawnReactions = isSSR ? useVfxStore.getState().activePawnReactions : storeActivePawnReactions;

  // [UI-S02/MSS] Đảm bảo dọn dẹp an toàn nếu hoạt ảnh rỗng không bao giờ kích hoạt ActiveSpringPawn
  useEffect(() => {
    if (activeAnimation?.isAnimating && (!activeAnimation.waypoints || activeAnimation.waypoints.length === 0)) {
      completePawnMove(activeAnimation.playerId);
    }
  }, [activeAnimation, completePawnMove]);

  return (
    <group>
      {players.map((player, index) => {
        const pInfo = playersInfo?.[player.id];
        const color = pInfo?.tokenColor ?? PLAYER_TOKEN_PALETTE[index % PLAYER_TOKEN_PALETTE.length] ?? '#38BDF8';
        const assignedSlot = pInfo?.pawnSlot !== undefined
          ? pInfo.pawnSlot
          : pInfo?.ownerSlot !== undefined
          ? pInfo.ownerSlot
          : index % 4;
        const offset = PLAYER_OFFSETS[index % PLAYER_OFFSETS.length] ?? [0, 0, 0];
        const isAnimating = activeAnimation != null && activeAnimation.playerId === player.id && activeAnimation.isAnimating;
        const isPendingMove = pendingPawnMove != null && pendingPawnMove.playerId === player.id;
        const currentPos = isPendingMove
          ? pendingPawnMove.fromCell
          : (visualPositions?.[player.id] ?? playerPositions[player.id] ?? player.position);
        const activeEmote = activeEmotes[player.id];
        const reaction = activePawnReactions?.[player.id];

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
              slotIndex={assignedSlot}
              isBot={Boolean(activeAnimation.isBot || player.isBot)}
            />
          );
        }

        return (
          <StaticPawnWithReaction
            key={player.id}
            player={player}
            assignedSlot={assignedSlot}
            color={color}
            offset={offset}
            currentPos={currentPos}
            activeEmote={activeEmote}
            reaction={reaction}
          />
        );
      })}
    </group>
  );
}
