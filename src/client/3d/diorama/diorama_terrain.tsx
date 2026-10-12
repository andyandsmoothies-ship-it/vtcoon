// [UI-S02/MSS][IMP-31] DioramaTerrain — Flush Metropolis Landmass, Sunken Saigon River & Flat Boulevards
import React from 'react';
import { BatchedDioramaLandmasses } from './batched_diorama_terrain';

const RIVER_BED_Y = -0.035;
const TERRAIN_BASE_Y = 0.000;
const TILE_BORDER_Y = 0.015;
const TILE_SURFACE_Y = 0.020;

export function DioramaTerrain(): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. LÒNG SÔNG SÀI GÒN KHẮC SÂU (Sunken Saigon Riverbed: Y = -0.035)
          Cắt giữa 2 bán đảo Đông - Tây (X: [-0.9, 0.9]), rộng 1.8m,
          đi lọt qua khẩu độ thông thuyền Cầu Ba Son (Z = -3.8) & Long Biên (Z = 3.8)
         ======================================================== */}
      <group position={[0, 0, 0]}>
        {/* Đáy sông Sài Gòn trầm tích sẫm */}
        <mesh receiveShadow position={[0, RIVER_BED_Y - 0.015, 0]}>
          <boxGeometry args={[2.4, 0.03, 15.2]} />
          <meshStandardMaterial color="#0C4A6E" roughness={0.9} />
        </mesh>

        {/* Bề mặt nước ngọc bích sa bàn đồ chơi (Toy Diorama Water) */}
        <mesh receiveShadow position={[0, RIVER_BED_Y, 0]}>
          <boxGeometry args={[1.8, 0.008, 15.0]} />
          <meshStandardMaterial
            color="#0284C7"
            roughness={0.25}
            metalness={0.10}
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* Gờ sóng nước/bọt sóng dập dềnh */}
        <mesh position={[0, RIVER_BED_Y + 0.005, 0]} data-testid="diorama-river-waves">
          <boxGeometry args={[1.6, 0.002, 14.8]} />
          <meshStandardMaterial color="#E0F2FE" transparent opacity={0.35} roughness={0.2} />
        </mesh>

        {/* Bờ kè vát dốc Tây (Embankment slope from 0.000 down to -0.035) */}
        <mesh receiveShadow position={[-1.05, (TERRAIN_BASE_Y + RIVER_BED_Y) / 2, 0]} rotation={[0, 0, 0.16]}>
          <boxGeometry args={[0.35, 0.02, 15.0]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.65} metalness={0.1} />
        </mesh>

        {/* Bờ kè vát dốc Đông (Embankment slope from 0.000 down to -0.035) */}
        <mesh receiveShadow position={[1.05, (TERRAIN_BASE_Y + RIVER_BED_Y) / 2, 0]} rotation={[0, 0, -0.16]}>
          <boxGeometry args={[0.35, 0.02, 15.0]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.65} metalness={0.1} />
        </mesh>
      </group>

      {/* ========================================================
          2 & 3. BÁN ĐẢO TÂY & ĐÔNG: Khối nền, đại lộ, vỉa hè & vạch kẻ đường (Batched Merged Geometries)
         ======================================================== */}
      <BatchedDioramaLandmasses />
      <group data-testid="diorama-park-relief" position={[-2.7, 0, -2.5]}>
        <mesh receiveShadow position={[0, 0.035, 0]}>
          <boxGeometry args={[1.6, 0.025, 2.2]} />
          <meshStandardMaterial color="#64748B" roughness={0.6} metalness={0.15} />
        </mesh>
        <mesh receiveShadow position={[0, 0.05, 0]}>
          <boxGeometry args={[1.5, 0.01, 2.1]} />
          <meshStandardMaterial color="#15803D" roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}
