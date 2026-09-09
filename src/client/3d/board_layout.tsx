// [UI-S01/MSS] GameBoard — 40-tile procedural board layout with 4-side orientation & center oasis
import React from 'react';
import { BOARD_CONFIG } from '../../domain/board_config';
import { useGameStore } from '../store/game_store';
import { cellPosition } from './board_coords';
import { LayeredDioramaTile } from './board_tile';
import { DiceTray } from './dice_tray';

const CORNER_INDICES = new Set([0, 10, 20, 30]);

export function tileRotation(index: number): [number, number, number] {
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
      {/* 1. Nền hoa viên dập nổi: Sân trung tâm lát gạch hoa cương viền đồng tương phản */}
      <mesh receiveShadow position={[0, -0.042, 0]}>
        <boxGeometry args={[15.85, 0.076, 15.85]} />
        <meshStandardMaterial color="#B45309" roughness={0.35} metalness={0.8} />
      </mesh>
      <mesh receiveShadow position={[0, -0.04, 0]}>
        <boxGeometry args={[15.75, 0.08, 15.75]} />
        <meshStandardMaterial color="#1E293B" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* 2. Cảnh quan trung tâm: Hồ nước nhân tạo & Bờ kè đá hoa cương */}
      <group position={[0, -0.02, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[7.2, 7.2, 0.12, 64]} />
          <meshStandardMaterial
            color="#0284c7"
            roughness={0.12}
            metalness={0.75}
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh receiveShadow castShadow rotation={[Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <torusGeometry args={[7.2, 0.18, 16, 64]} />
          <meshStandardMaterial color="#475569" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>

      {/* 3. Khay xúc xắc 3D trung tâm nằm giữa lòng hồ */}
      <DiceTray />

      {/* 4. Móng sa bàn giật cấp ngoài cùng (20.6 x 20.6) */}
      <mesh receiveShadow position={[0, -0.12, 0]}>
        <boxGeometry args={[20.6, 0.16, 20.6]} />
        <meshStandardMaterial color="#0F172A" roughness={0.85} />
      </mesh>

      {/* 5. 40 ô đất liền mạch khép kín */}
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
