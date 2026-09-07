import React from 'react';
import { Canvas } from '@react-three/fiber';
import { BOARD_CONFIG } from '../domain/board_config';
import type { BoardCell } from '../domain/board_config';
import type { Player } from '../domain/room';
import { BOARD_SURFACE, PLAYER_TOKEN_PALETTE } from '../domain/theme';

const CELL_SIZE = 1;
const GRID = 9; // khoảng cách từ tâm đến cạnh bàn (9 bước × CELL_SIZE)

export function cellPosition(index: number): [number, number, number] {
  const side = Math.floor(index / 10);
  const step = index % 10;
  switch (side) {
    case 0: return [GRID - step * CELL_SIZE, 0, GRID];
    case 1: return [-GRID, 0, GRID - step * CELL_SIZE];
    case 2: return [-GRID + step * CELL_SIZE, 0, -GRID];
    default: return [GRID, 0, -GRID + step * CELL_SIZE];
  }
}

function BoardCellMesh({ cell }: { cell: BoardCell }): React.ReactElement {
  const pos = cellPosition(cell.index);
  return (
    <mesh position={pos}>
      <boxGeometry args={[CELL_SIZE, 0.1, CELL_SIZE]} />
      <meshStandardMaterial color={BOARD_SURFACE} />
    </mesh>
  );
}

function TokenMesh({ player, index }: { player: Player; index: number }): React.ReactElement {
  const pos = cellPosition(player.position);
  return (
    <mesh position={[pos[0], 0.3, pos[2]]}>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshStandardMaterial color={PLAYER_TOKEN_PALETTE[index % PLAYER_TOKEN_PALETTE.length]} />
    </mesh>
  );
}

export function GameCanvas({ players = [] }: { players?: Player[] }): React.ReactElement {
  return (
    <Canvas camera={{ position: [0, 15, 15], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      {BOARD_CONFIG.map((cell) => (
        <BoardCellMesh key={cell.index} cell={cell} />
      ))}
      {players.map((p, i) => (
        <TokenMesh key={p.id} player={p} index={i} />
      ))}
    </Canvas>
  );
}
