import React from 'react';
import { Canvas } from '@react-three/fiber';
import { BOARD_CONFIG } from '../domain/board_config';
import type { BoardCell } from '../domain/board_config';

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
      <meshStandardMaterial color="#2a2a3e" />
    </mesh>
  );
}

export function GameCanvas(): React.ReactElement {
  return (
    <Canvas camera={{ position: [0, 15, 15], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      {BOARD_CONFIG.map((cell) => (
        <BoardCellMesh key={cell.index} cell={cell} />
      ))}
    </Canvas>
  );
}
