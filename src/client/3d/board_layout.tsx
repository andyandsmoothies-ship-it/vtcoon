// [UI-S01/MSS][IMP-30] GameBoard — 40-tile procedural board layout with terrain-flush Depth Layer Stack
import React from 'react';
import { BOARD_CONFIG } from '../../domain/board_config';
import { useGameStore } from '../store/game_store';
import { cellPosition } from './board_coords';
import { LayeredDioramaTile } from './board_tile';
import { DiceTray } from './dice_tray';
import { MiniatureCityDiorama } from './miniature_city_diorama';
import { CoastalIslandEnvironment } from './coastal_island_environment';
import { CinematicLightingAccents } from './cinematic_effects';
import { ConstructionSlamVFX } from './construction_slam_vfx';

// Depth Layer Stack triệt tiêu Z-Fighting (IMP-30 Terrain Flush Invariant)
export const TERRAIN_BASE_Y = 0.000;
export const TILE_BORDER_Y = 0.015;
export const TILE_SURFACE_Y = 0.020;
export const STANDEE_BASE_Y = 0.025;
export const DEPTH_LAYER_STACK = {
  TERRAIN_BASE_Y,
  TILE_BORDER_Y,
  TILE_SURFACE_Y,
  STANDEE_BASE_Y,
} as const;

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
    <group position={[0, 0, 0]}>
      {/* 0. Môi trường Bán đảo Đảo Ngọc nhiệt đới (Vịnh biển, bãi cát, đồi núi & mây trời) */}
      <CoastalIslandEnvironment />

      {/* 0.1. Điểm nhấn ánh sáng điện ảnh 3D (Hải đăng, Chóp Landmark C3, Sân vận động) */}
      <CinematicLightingAccents />

      {/* 0.2. Hiệu ứng Va Đập Xây Dựng, Sóng Xung Kích & Pháo Hoa Khánh Thành */}
      <ConstructionSlamVFX />

      {/* 1. Nền hoa viên: Thảm cỏ xanh nhiệt đới trung tâm tại cao độ phẳng TERRAIN_BASE_Y */}
      <mesh receiveShadow position={[0, TERRAIN_BASE_Y, 0]}>
        <boxGeometry args={[15.75, 0.02, 15.75]} />
        <meshStandardMaterial color="#22C55E" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* 2. Sa bàn đô thị thu nhỏ: Đảo tài chính, cầu vượt, sân vận động & bến du thuyền */}
      <MiniatureCityDiorama />

      {/* 3. Sàn diễn xúc xắc 3D thoáng đãng trên Đại Lộ Sài Gòn */}
      <DiceTray />

      {/* 4. 40 ô đất liền mạch khép kín tiếp giáp mặt nền phẳng */}
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
