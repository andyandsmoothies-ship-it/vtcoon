// [UI-S02/MSS] PawnAnimator — Spring-driven pawn hop with parabolic arc trajectory
import React, { useState, useEffect } from 'react';
import { a, useSpring } from '@react-spring/three';
import type { Player } from '../../domain/room';
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme';
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

interface SingleHopProps {
  readonly fromCell: number;
  readonly toCell: number;
  readonly offset: readonly [number, number, number];
  readonly color: string;
  readonly onHopComplete: () => void;
}

function SingleHopPawn({ fromCell, toCell, offset, color, onHopComplete }: SingleHopProps): React.ReactElement {
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
    </a.group>
  );
}

interface ActivePawnProps {
  readonly player: Player;
  readonly color: string;
  readonly offset: readonly [number, number, number];
  readonly animation: PawnAnimationState;
  readonly onComplete: (playerId: string) => void;
}

function ActiveSpringPawn({ player, color, offset, animation, onComplete }: ActivePawnProps): React.ReactElement {
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
    />
  );
}

export function PawnAnimator({ players = [] }: { readonly players?: readonly Player[] }): React.ReactElement {
  const activeAnimation = useGameStore((s) => s.activePawnAnimation);
  const playerPositions = useGameStore((s) => s.playerPositions);
  const completePawnMove = useGameStore((s) => s.completePawnMove);

  return (
    <group>
      {players.map((player, index) => {
        const color = PLAYER_TOKEN_PALETTE[index % PLAYER_TOKEN_PALETTE.length] ?? '#38BDF8';
        const offset = PLAYER_OFFSETS[index % PLAYER_OFFSETS.length] ?? [0, 0, 0];
        const isAnimating = activeAnimation != null && activeAnimation.playerId === player.id && activeAnimation.isAnimating;
        const currentPos = playerPositions[player.id] ?? player.position;

        if (isAnimating && activeAnimation.waypoints.length > 0) {
          return (
            <ActiveSpringPawn
              key={player.id}
              player={player}
              color={color}
              offset={offset}
              animation={activeAnimation}
              onComplete={completePawnMove}
            />
          );
        }

        const [x, , z] = cellPosition(currentPos);
        return (
          <group key={player.id} position={[x + offset[0], BASE_PAWN_Y, z + offset[2]]}>
            <PawnMesh color={color} />
          </group>
        );
      })}
    </group>
  );
}
