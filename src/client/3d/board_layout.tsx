// [UI-S01/MSS] GameBoard — 40-tile procedural board layout with 4-side orientation & center oasis
import React from 'react';
import { BOARD_CONFIG } from '../../domain/board_config';
import { useGameStore } from '../store/game_store';
import { cellPosition } from './board_coords';
import { LayeredDioramaTile } from './board_tile';
import { DiceTray } from './dice_tray';
import { CenterpieceWater } from './centerpiece_water';
import { MiniatureCityDiorama } from './miniature_city_diorama';
import { CoastalIslandEnvironment } from './coastal_island_environment';
import { CinematicLightingAccents } from './cinematic_effects';
import { ConstructionSlamVFX } from './construction_slam_vfx';

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

      {/* 0. Khung kè đá phiến sẫm viền bàn cờ nổi 3D bo vát (Dark Slate Promenade Rim: 21.4 x 21.4) */}
      <mesh receiveShadow castShadow position={[0, -0.06, 0]}>
        <boxGeometry args={[21.4, 0.24, 21.4]} />
        <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.15} />
      </mesh>
      {/* Đường chỉ kim loại khảm vàng hổ phách ngăn cách khung đá và mép ô cờ */}
      <mesh position={[0, -0.01, 0]}>
        <boxGeometry args={[20.72, 0.04, 20.72]} />
        <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* 1. Nền hoa viên: Thảm cỏ xanh nhiệt đới trung tâm */}
      <mesh receiveShadow position={[0, -0.02, 0]}>
        <boxGeometry args={[15.75, 0.04, 15.75]} />
        <meshStandardMaterial color="#22C55E" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* 2. Cảnh quan trung tâm: Hồ nước nhân tạo & Bờ kè đá sa thạch */}
      <CenterpieceWater />

      {/* 2.1. Sa bàn đô thị thu nhỏ: Đảo tài chính, cầu vượt, sân vận động & bến du thuyền */}
      <MiniatureCityDiorama />

      {/* 3. Khay xúc xắc 3D trung tâm nằm giữa lòng hồ */}
      <DiceTray />

      {/* 4. Móng sa bàn giật cấp ngoài cùng (20.6 x 20.6) */}
      <mesh receiveShadow position={[0, -0.12, 0]}>
        <boxGeometry args={[20.6, 0.16, 20.6]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
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
