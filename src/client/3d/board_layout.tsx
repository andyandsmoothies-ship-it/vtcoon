// [UI-S01/MSS] GameBoard — 40-tile procedural board layout with 4-side orientation & center oasis
import React from 'react';
import { RoundedBox } from '@react-three/drei';
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

      {/* 0. Khung kè đá phiến sẫm viền bàn cờ nổi 3D bo vát bóng bẩy (Dark Slate Promenade Rim: 21.4 x 21.4) */}
      <RoundedBox
        args={[21.4, 0.24, 21.4]}
        radius={0.08}
        smoothness={4}
        receiveShadow
        castShadow
        position={[0, -0.16, 0]}
      >
        <meshStandardMaterial color="#1E293B" roughness={0.2} metalness={0.25} envMapIntensity={1.2} />
      </RoundedBox>
      {/* Dải nẹp kim loại mạ vàng Champagne bao quanh viền ngoài của 40 ô cờ */}
      <RoundedBox
        args={[20.72, 0.04, 20.72]}
        radius={0.02}
        smoothness={2}
        position={[0, -0.045, 0]}
      >
        <meshStandardMaterial color="#F59E0B" roughness={0.08} metalness={0.95} envMapIntensity={1.8} />
      </RoundedBox>
      {/* Dải nẹp kim loại mạ vàng Champagne viền trong ngăn cách mép trong 40 ô cờ */}
      <mesh position={[0, -0.045, 0]}>
        <boxGeometry args={[15.88, 0.042, 15.88]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.08} metalness={0.95} envMapIntensity={1.8} />
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
