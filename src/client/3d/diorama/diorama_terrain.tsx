// [UI-S02/MSS][IMP-31] DioramaTerrain — Flush Metropolis Landmass, Sunken Saigon River & Flat Boulevards
import React from 'react';

const RIVER_BED_Y = -0.050;
const TERRAIN_BASE_Y = 0.000;
const TILE_BORDER_Y = 0.015;
const TILE_SURFACE_Y = 0.020;

export function DioramaTerrain(): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. LÒNG SÔNG SÀI GÒN KHẮC SÂU (Sunken Saigon Riverbed: Y = -0.050)
          Cắt giữa 2 bán đảo Đông - Tây (X: [-0.9, 0.9]), rộng 1.8m,
          đi lọt qua khẩu độ thông thuyền Cầu Ba Son (Z = -3.8) & Long Biên (Z = 3.8)
         ======================================================== */}
      <group position={[0, 0, 0]}>
        {/* Đáy sông Sài Gòn trầm tích sẫm */}
        <mesh receiveShadow position={[0, RIVER_BED_Y - 0.02, 0]}>
          <boxGeometry args={[2.4, 0.04, 15.2]} />
          <meshStandardMaterial color="#0C4A6E" roughness={0.9} />
        </mesh>

        {/* Bề mặt nước ngọc bích sa bàn đồ chơi (Toy Diorama Matte Water — triệt tiêu phản quang chói gương) */}
        <mesh receiveShadow position={[0, RIVER_BED_Y, 0]}>
          <boxGeometry args={[1.8, 0.008, 15.0]} />
          <meshStandardMaterial
            color="#0284C7"
            roughness={0.80}
            metalness={0.02}
            transparent
            opacity={0.88}
          />
        </mesh>


        {/* Bờ kè vát dốc Tây (Embankment slope from 0.000 down to -0.050) */}
        <mesh receiveShadow position={[-1.05, (TERRAIN_BASE_Y + RIVER_BED_Y) / 2, 0]} rotation={[0, 0, 0.16]}>
          <boxGeometry args={[0.35, 0.02, 15.0]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.65} metalness={0.1} />
        </mesh>

        {/* Bờ kè vát dốc Đông (Embankment slope from 0.000 down to -0.050) */}
        <mesh receiveShadow position={[1.05, (TERRAIN_BASE_Y + RIVER_BED_Y) / 2, 0]} rotation={[0, 0, -0.16]}>
          <boxGeometry args={[0.35, 0.02, 15.0]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.65} metalness={0.1} />
        </mesh>
      </group>

      {/* ========================================================
          2. BÁN ĐẢO PHÍA TÂY (West Peninsula: X ~ -4.5)
          Mặt nền phẳng y = 0.000, Đại lộ Grand West Boulevard phẳng y = 0.020
         ======================================================== */}
      <group position={[-4.5, 0, 0]}>
        {/* Tầng móng đất liền thổ phẳng (TERRAIN_BASE_Y = 0.000) */}
        <mesh receiveShadow position={[0, TERRAIN_BASE_Y - 0.02, 0]}>
          <boxGeometry args={[4.2, 0.04, 12.2]} />
          <meshStandardMaterial color="#D4C5A3" roughness={0.78} />
        </mesh>

        {/* Thảm cỏ xanh rêu đô thị phẳng */}
        <mesh receiveShadow position={[0, TERRAIN_BASE_Y, 0]}>
          <boxGeometry args={[3.8, 0.01, 11.8]} />
          <meshStandardMaterial color="#2D5A27" roughness={0.85} />
        </mesh>

        {/* Đại lộ Trục Tây (Grand West Boulevard): Nhựa đường bóng mịn hạ phẳng y = 0.020 (TILE_SURFACE_Y) */}
        <mesh receiveShadow position={[-0.3, TILE_SURFACE_Y, 0]}>
          <boxGeometry args={[0.7, 0.005, 11.6]} />
          <meshStandardMaterial color="#1E293B" roughness={0.16} metalness={0.25} />
        </mesh>

        {/* Vỉa hè lát đá hoa cương hai bên đại lộ hạ về y = 0.015 (TILE_BORDER_Y) */}
        <mesh receiveShadow position={[-0.72, TILE_BORDER_Y, 0]}>
          <boxGeometry args={[0.14, 0.005, 11.6]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh receiveShadow position={[0.12, TILE_BORDER_Y, 0]}>
          <boxGeometry args={[0.14, 0.005, 11.6]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Vạch kẻ phân làn trắng gián đoạn tại y = 0.022 (chống z-fighting với mặt đường 0.020) */}
        {[-4.5, -3.0, -1.5, 0, 1.5, 3.0, 4.5].map((pz) => (
          <mesh key={`west-lane-${pz}`} position={[-0.3, 0.022, pz]}>
            <boxGeometry args={[0.04, 0.002, 0.5]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.25} />
          </mesh>
        ))}

        {/* Vạch kẻ người đi bộ qua đường tại các giao lộ (Zebra Crossings: y = 0.022) */}
        {[-3.75, -0.75, 0.75, 3.75].map((cz) => (
          <group key={`zebra-${cz}`} position={[-0.3, 0.022, cz]}>
            {[-0.24, -0.12, 0, 0.12, 0.24].map((ox, sIdx) => (
              <mesh key={`stripe-${sIdx}`} position={[ox, 0, 0]}>
                <boxGeometry args={[0.07, 0.002, 0.28]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* ========================================================
          3. BÁN ĐẢO PHÍA ĐÔNG (East Peninsula: X ~ 4.5)
          Mặt nền phẳng y = 0.000, Tuyến dạo ven vịnh phẳng y = 0.020
         ======================================================== */}
      <group position={[4.5, 0, 0]}>
        {/* Tầng móng đất liền thổ phẳng (TERRAIN_BASE_Y = 0.000) */}
        <mesh receiveShadow position={[0, TERRAIN_BASE_Y - 0.02, 0]}>
          <boxGeometry args={[4.2, 0.04, 12.2]} />
          <meshStandardMaterial color="#D4C5A3" roughness={0.78} />
        </mesh>

        {/* Thảm cỏ xanh rêu đô thị phẳng */}
        <mesh receiveShadow position={[0, TERRAIN_BASE_Y, 0]}>
          <boxGeometry args={[3.8, 0.01, 11.8]} />
          <meshStandardMaterial color="#2D5A27" roughness={0.85} />
        </mesh>

        {/* Tuyến dạo ven vịnh (Coastal Promenade) lát đá sa mộc sẫm tại y = 0.020 (TILE_SURFACE_Y) */}
        <mesh receiveShadow position={[0.3, TILE_SURFACE_Y, 0]}>
          <boxGeometry args={[0.7, 0.005, 11.6]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.18} />
        </mesh>

        {/* Vỉa hè đi dạo hai bên tại y = 0.015 (TILE_BORDER_Y) */}
        <mesh receiveShadow position={[-0.12, TILE_BORDER_Y, 0]}>
          <boxGeometry args={[0.14, 0.005, 11.6]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.35} />
        </mesh>
        <mesh receiveShadow position={[0.72, TILE_BORDER_Y, 0]}>
          <boxGeometry args={[0.14, 0.005, 11.6]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.35} />
        </mesh>

        {/* Vạch kẻ người đi bộ tại các đầu cầu (y = 0.022) */}
        {[-3.75, 3.75].map((cz) => (
          <group key={`east-zebra-${cz}`} position={[0.3, 0.022, cz]}>
            {[-0.24, -0.12, 0, 0.12, 0.24].map((ox, sIdx) => (
              <mesh key={`east-stripe-${sIdx}`} position={[ox, 0, 0]}>
                <boxGeometry args={[0.07, 0.002, 0.28]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}
