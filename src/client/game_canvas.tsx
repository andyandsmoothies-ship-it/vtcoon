// [UI-S01/MSS][UI-S03/MSS] GameCanvas — Orthographic 3D viewport, R3F Canvas wrapper
// Re-exports cellPosition for backward-compat with tests/client/game_canvas.test.ts
export { cellPosition } from './3d/board_coords';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Player } from '../domain/room';
import { GameBoard } from './3d/board_layout';
import { PawnAnimator } from './3d/pawn_animator';
import { useGameStore } from './store/game_store';

export function GameCanvas({ players = [] }: { players?: readonly Player[] }): React.ReactElement {
  const playersInfo = useGameStore((s) => s.playersInfo);
  const playerPositions = useGameStore((s) => s.playerPositions);

  const effectivePlayers: readonly Player[] = players.length > 0
    ? players
    : Object.values(playersInfo).map((p) => ({
        id: p.id,
        position: playerPositions[p.id] ?? 0,
        balance: p.balance,
        skipNextTurn: false,
        auditTurnsLeft: 0,
        consecutiveDoubles: 0,
        hand: [],
        pendingDebts: [],
        extraTurns: 0,
        doubleNextDice: false,
        mortgagedProperties: [],
        bankrupt: Boolean(p.bankrupt),
      }));

  return (
    <Canvas
      shadows
      orthographic
      camera={{ position: [22, 22, 22], zoom: 35, near: -100, far: 200 }}
      style={{ width: '100vw', height: '100vh', display: 'block', background: '#0B1120' }}
    >
      <OrbitControls
        enableRotate={false}
        enablePan={true}
        enableZoom={true}
        minZoom={18}
        maxZoom={55}
      />
      <ambientLight intensity={0.95} />
      <directionalLight
        position={[15, 30, 20]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-15, 20, -15]} intensity={0.6} />
      <GameBoard />
      <PawnAnimator players={effectivePlayers} />
    </Canvas>
  );
}
