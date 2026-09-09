// [UI-S01/MSS][UI-S03/MSS] GameCanvas — Orthographic 3D viewport, R3F Canvas wrapper
// Re-exports cellPosition for backward-compat with tests/client/game_canvas.test.ts
export { cellPosition } from './3d/board_coords';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
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
      camera={{ position: [22, 22, 22], zoom: 41, near: -100, far: 200 }}
      style={{ width: '100vw', height: '100vh', display: 'block', background: '#0B1120' }}
    >
      <OrbitControls
        enableRotate={false}
        enablePan={true}
        enableZoom={true}
        minZoom={25}
        maxZoom={60}
      />
      {/* Hệ thống chiếu sáng 3 điểm PBR chân thực nội bộ */}
      <ambientLight intensity={0.7} />
      <hemisphereLight color="#E0F2FE" groundColor="#0F172A" intensity={0.5} />
      <directionalLight
        position={[20, 25, 20]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-bias={-0.0001}
      />
      {/* Bóng tiếp xúc mềm neo vững sa bàn */}
      <ContactShadows
        position={[0, -0.15, 0]}
        opacity={0.65}
        scale={42}
        blur={1.5}
        far={10}
      />
      <GameBoard />
      <PawnAnimator players={effectivePlayers} />
    </Canvas>
  );
}
