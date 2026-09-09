// [UI-S02/MSS] PawnAnimator — Spring-driven pawn hop with parabolic arc trajectory
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { a, useSpring } from '@react-spring/three';
import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, type Group } from 'three';
import type { Player } from '../../domain/room';
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme';
import { getEmoteDef } from '../../domain/emotes';
import { useGameStore, type PawnAnimationState } from '../store/game_store';
import { cellPosition } from './board_coords';
import { interpolatePawnPosition, BASE_PAWN_Y } from './pawn_path';

export const PLAYER_OFFSETS: readonly [number, number, number][] = [
  [-0.2, 0, -0.2],
  [0.2, 0, -0.2],
  [-0.2, 0, 0.2],
  [0.2, 0, 0.2],
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
          {texture ? (
            <meshBasicMaterial map={texture} transparent depthWrite={false} />
          ) : (
            <meshBasicMaterial color="#F59E0B" />
          )}
        </mesh>
      </Billboard>
    </group>
  );
}

interface SingleHopProps {
  readonly fromCell: number;
  readonly toCell: number;
  readonly offset: readonly [number, number, number];
  readonly color: string;
  readonly onHopComplete: () => void;
  readonly emoteId?: string;
}

function SingleHopPawn({ fromCell, toCell, offset, color, onHopComplete, emoteId }: SingleHopProps): React.ReactElement {
  const { t } = useSpring({
    from: { t: 0 },
    to: { t: 1 },
    config: { tension: 170, friction: 12 },
    onRest: onHopComplete,
  });

  const posX = t.to((val) => interpolatePawnPosition(fromCell, toCell, val)[0] + offset[0]);
  const posY = t.to((val) => interpolatePawnPosition(fromCell, toCell, val)[1]);
  const posZ = t.to((val) => interpolatePawnPosition(fromCell, toCell, val)[2] + offset[2]);

  return (
    <a.group position-x={posX} position-y={posY} position-z={posZ}>
      <PawnMesh color={color} />
      {emoteId && <PawnEmoteBubble emoteId={emoteId} />}
    </a.group>
  );
}

interface ActivePawnProps {
  readonly player: Player;
  readonly color: string;
  readonly offset: readonly [number, number, number];
  readonly animation: PawnAnimationState;
  readonly onComplete: (playerId: string) => void;
  readonly emoteId?: string;
}

function ActiveSpringPawn({ player, color, offset, animation, onComplete, emoteId }: ActivePawnProps): React.ReactElement {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setStepIndex(0);
  }, [animation]);

  const waypoints = animation.waypoints;
  const fromCell = stepIndex === 0 ? animation.fromCell : (waypoints[stepIndex - 1] ?? animation.fromCell);
  const toCell = waypoints[stepIndex] ?? fromCell;

  const handleHopComplete = () => {
    if (stepIndex + 1 < waypoints.length) {
      setStepIndex((idx) => idx + 1);
    } else {
      onComplete(player.id);
    }
  };

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

  return (
    <group>
      {players.map((player, index) => {
        const color = PLAYER_TOKEN_PALETTE[index % PLAYER_TOKEN_PALETTE.length] ?? '#38BDF8';
        const offset = PLAYER_OFFSETS[index % PLAYER_OFFSETS.length] ?? [0, 0, 0];
        const isAnimating = activeAnimation != null && activeAnimation.playerId === player.id && activeAnimation.isAnimating;
        const currentPos = playerPositions[player.id] ?? player.position;
        const activeEmote = activeEmotes[player.id];

        if (isAnimating && activeAnimation.waypoints.length > 0) {
          return (
            <ActiveSpringPawn
              key={player.id}
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
