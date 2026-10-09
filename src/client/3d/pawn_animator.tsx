// [UI-S02/MSS] PawnAnimator — Kinetic Squash & Stretch pawn hop with parabolic arc trajectory
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import type { Player } from '../../domain/room';
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme';
import { useGameStore, type PawnAnimationState } from '../store/game_store';
import { useVfxStore, type PawnReactionState } from '../store/vfx_store';
import { cellPosition } from './board_coords';
import {
  BASE_PAWN_Y, DEFAULT_JUMP_ARC, JAIL_FLIGHT_ARC,
  calculateVictorySpin, calculateSlumpRecoil,
} from './pawn_path';
import { LuxuryPawnModel } from './luxury_pawn_models';
import { PawnHopTrajectory } from './pawn_hop_trajectory';
import {
  SingleHopPawn,
  type SingleHopProps,
  PawnMesh,
  PawnEmoteBubble,
  clearEmoteCanvasCache,
  emoteCanvasCache,
} from './single_hop_pawn.js';

export * from './pawn_path';
export {
  SingleHopPawn,
  type SingleHopProps,
  PawnMesh,
  PawnEmoteBubble,
  clearEmoteCanvasCache,
  emoteCanvasCache,
};

export const PLAYER_OFFSETS: readonly [number, number, number][] = [
  [-0.2, 0, -0.2], [0.2, 0, -0.2], [-0.2, 0, 0.2], [0.2, 0, 0.2],
] as const;

// [IMP-311] SingleHopPawn, PawnMesh, PawnEmoteBubble, and cache primitives extracted to ./single_hop_pawn.js

export interface ActivePawnProps extends Pick<SingleHopProps, 'color' | 'offset' | 'emoteId' | 'slotIndex'> {
  readonly player: Player;
  readonly animation: PawnAnimationState;
  readonly onComplete: (playerId: string) => void;
  readonly isBot?: boolean;
  readonly showTrajectory?: boolean;
}

export function ActiveSpringPawn({
  player,
  color,
  offset,
  animation,
  onComplete,
  emoteId,
  slotIndex,
  isBot: isBotProp,
  showTrajectory = false,
}: ActivePawnProps): React.ReactElement | null {
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
    <>
      <PawnHopTrajectory
        fromCell={fromCell}
        toCell={toCell}
        offset={offset}
        color={color}
        arcHeight={Boolean(animation.isJailFlight) ? JAIL_FLIGHT_ARC : DEFAULT_JUMP_ARC}
        visible={showTrajectory}
      />
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
    </>
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
      <LuxuryPawnModel slotIndex={assignedSlot} playerColor={color} forceFallback={true} />
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

  // Nếu activeAnimation có playerId thuộc người chơi phá sản, giải phóng completePawnMove ngay trong thân hàm render
  if (
    activeAnimation &&
    players.some((p) => p.id === activeAnimation.playerId && p.bankrupt)
  ) {
    completePawnMove(activeAnimation.playerId);
  }

  // [UI-S02/MSS] Đảm bảo dọn dẹp an toàn nếu hoạt ảnh rỗng không bao giờ kích hoạt ActiveSpringPawn
  useEffect(() => {
    if (activeAnimation?.isAnimating && (!activeAnimation.waypoints || activeAnimation.waypoints.length === 0)) {
      completePawnMove(activeAnimation.playerId);
    }
    if (activeAnimation && players.some((p) => p.id === activeAnimation.playerId && p.bankrupt)) {
      completePawnMove(activeAnimation.playerId);
    }
  }, [activeAnimation, completePawnMove, players]);

  const activePlayers = players.filter((p) => !p.bankrupt);

  return (
    <group>
      {activePlayers.map((player, index) => {
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
