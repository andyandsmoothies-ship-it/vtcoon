// [UI-S01/MSS] GameBoard — 40-tile procedural board layout with 4-side orientation
import React from 'react';
import { BOARD_CONFIG } from '../../domain/board_config';
import { useGameStore } from '../store/game_store';
import { cellPosition } from './board_coords';
import { LayeredDioramaTile } from './board_tile';
import { DiceTray } from './dice_tray';

const CORNER_INDICES = new Set([0, 10, 20, 30]);

function tileRotation(index: number): [number, number, number] {
  const side = Math.floor(index / 10);
  switch (side) {
    case 0: return [0, 0, 0];
    case 1: return [0, -Math.PI / 2, 0];
    case 2: return [0, Math.PI, 0];
    default: return [0, Math.PI / 2, 0];
  }
}

export function GameBoard(): React.ReactElement {
  const levelMap = useGameStore((s) => s.levelMap);

  return (
    <group>
      {/* 1. Center courtyard floor — Fits snugly within the inner border (15.75 x 15.75) */}
      <mesh receiveShadow position={[0, -0.04, 0]}>
        <boxGeometry args={[15.75, 0.08, 15.75]} />
        <meshStandardMaterial color="#1E293B" roughness={0.7} />
      </mesh>

      {/* 2. Central 3D Dice Tray with falling dice */}
      <DiceTray />

      {/* 3. Outer board foundation bevel (20.6 x 20.6) */}
      <mesh receiveShadow position={[0, -0.12, 0]}>
        <boxGeometry args={[20.6, 0.16, 20.6]} />
        <meshStandardMaterial color="#0F172A" roughness={0.85} />
      </mesh>

      {/* 4. All 40 tiles seamlessly closed in an unbroken square ring */}
      {BOARD_CONFIG.map((cell) => (
        <LayeredDioramaTile
          key={cell.index}
          cell={cell}
          position={cellPosition(cell.index)}
          rotation={tileRotation(cell.index)}
          currentLevel={(levelMap[cell.index] ?? 0) as 0 | 1 | 2 | 3}
          isCornerTile={CORNER_INDICES.has(cell.index)}
        />
      ))}
    </group>
  );
}
