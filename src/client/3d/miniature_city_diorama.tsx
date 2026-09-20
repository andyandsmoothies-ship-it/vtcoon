// [UI-S02/MSS] MiniatureCityDiorama — Unified Sculpted Tabletop Diorama Root Coordinator
// Assembles terrain, iconic bridges, modern stadium, marina, skyline & micro-life
import React from 'react';
import { DioramaTerrain } from './diorama/diorama_terrain';
import { DioramaBridges } from './diorama/diorama_bridges';
import { DioramaCivicCenter } from './diorama/diorama_civic_center';
import { DioramaWaterfrontPark } from './diorama/diorama_waterfront_park';
import { DioramaContainerPort } from './diorama/diorama_container_port';
import { DioramaMarina } from './diorama/diorama_marina';
import { DioramaSkyline } from './diorama/diorama_skyline';
import { DioramaHeritageDistrict } from './diorama/diorama_heritage_district';
import { DioramaMicroLife } from './diorama/diorama_microlife';
import { DioramaTraffic } from './diorama/diorama_traffic';
import { DioramaShophouseBlocks } from './diorama/diorama_shophouse_blocks';
import { DioramaHighriseBlocks } from './diorama/diorama_highrise_blocks';
import {
  DioramaModelRailroad,
  DioramaWaterfrontStation,
  DioramaLandmarkNorthStation,
  DioramaTropicalFlora,
} from './diorama/diorama_railroad';

export {
  DioramaModelRailroad,
  DioramaWaterfrontStation,
  DioramaLandmarkNorthStation,
  DioramaTropicalFlora,
} from './diorama/diorama_railroad';

export function CentralMonumentPlaza(): React.ReactElement {
  return (
    <group position={[0, 0.02, 0]} data-testid="central-monument-plaza">
      {/* 1. Bệ đá cẩm thạch vòng ngoài */}
      <mesh receiveShadow position={[0, 0.01, 0]}>
        <cylinderGeometry args={[1.15, 1.25, 0.04, 32]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
      </mesh>

      {/* 2. Tầng đài phun nước bằng đá cẩm thạch trắng */}
      <mesh receiveShadow position={[0, 0.035, 0]}>
        <cylinderGeometry args={[0.95, 1.05, 0.03, 32]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
      </mesh>

      {/* 3. Lòng hồ nước biếc ngọc lam đài phun nước */}
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.015, 32]} />
        <meshStandardMaterial color="#0EA5E9" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* 4. Thềm đá cẩm thạch trung tâm */}
      <mesh receiveShadow position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.5, 0.55, 0.03, 32]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
      </mesh>

      {/* 5. Tượng đài trung tâm vươn cao */}
      {/* Bệ tượng đài */}
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.24, 16]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Thân tượng đài mạ vàng/đồng */}
      <mesh castShadow receiveShadow position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 0.26, 16]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.85} roughness={0.18} />
      </mesh>

      {/* Đỉnh tượng hoàng kim */}
      <mesh castShadow position={[0, 0.54, 0]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  );
}

export function DioramaBoardRim(): React.ReactElement {
  return (
    <group position={[0, -0.08, 0]} data-testid="diorama-board-rim">
      {/* Khung viền ngoài gỗ óc chó ôm trọn chu vi bàn cờ */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[18.4, 0.06, 18.4]} />
        <meshStandardMaterial color="#78350F" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Gờ viền trang trí bo cạnh hoàng kim đồng thau */}
      <mesh receiveShadow position={[0, 0.032, 0]}>
        <boxGeometry args={[18.44, 0.01, 18.44]} />
        <meshStandardMaterial color="#D97706" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

export function DioramaPedestrianPromenades(): React.ReactElement {
  return (
    <group position={[0, 0, 0]} data-testid="diorama-pedestrian-promenades">
      {/* 1. Lối đi bộ lát đá hoa cương kết nối Quảng trường với Đại lộ & Phân khu Di sản */}
      {[-1.8, 1.8].map((px) => (
        <group key={`promenade-lane-${px}`} position={[px, 0.022, 0]}>
          <mesh receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.005, 4.2]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
          </mesh>
          <mesh receiveShadow position={[-0.26, 0, 0]}>
            <boxGeometry args={[0.04, 0.006, 4.2]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.4} />
          </mesh>
          <mesh receiveShadow position={[0.26, 0, 0]}>
            <boxGeometry args={[0.04, 0.006, 4.2]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* 2. Mảng tiểu cảnh bồn hoa và cây xanh công viên dọc hành lang đi bộ */}
      {[-1.5, 1.5].map((pz) => (
        <group key={`park-planter-${pz}`} position={[-2.4, 0.025, pz]}>
          <mesh receiveShadow position={[0, 0.01, 0]}>
            <boxGeometry args={[0.4, 0.02, 0.8]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.4} />
          </mesh>
          <mesh receiveShadow position={[0, 0.022, 0]}>
            <boxGeometry args={[0.34, 0.008, 0.74]} />
            <meshStandardMaterial color="#F43F5E" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.045, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#10B981" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 3. Ghế đá / ghế gỗ nghỉ chân cho cư dân sa bàn dọc tuyến đi dạo */}
      {[-1.0, 0, 1.0].map((bz) => (
        <group key={`promenade-bench-${bz}`} position={[-1.4, 0.025, bz]}>
          <mesh receiveShadow position={[0, 0.02, 0]}>
            <boxGeometry args={[0.12, 0.015, 0.35]} />
            <meshStandardMaterial color="#78350F" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.01, -0.12]}>
            <boxGeometry args={[0.10, 0.02, 0.03]} />
            <meshStandardMaterial color="#64748B" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.01, 0.12]}>
            <boxGeometry args={[0.10, 0.02, 0.03]} />
            <meshStandardMaterial color="#64748B" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}



const URBAN_TREES = [
  // Dọc bờ kênh sông Sài Gòn (Bán đảo Tây, X = -1.35)
  { x: -1.35, z: -3.8, color: '#15803D', height: 0.28, radius: 0.14 },
  { x: -1.35, z: -2.3, color: '#22C55E', height: 0.32, radius: 0.16 },
  { x: -1.35, z: -0.8, color: '#F59E0B', height: 0.26, radius: 0.13 },
  { x: -1.35, z: 0.8, color: '#10B981', height: 0.30, radius: 0.15 },
  { x: -1.35, z: 2.3, color: '#15803D', height: 0.34, radius: 0.17 },
  { x: -1.35, z: 3.8, color: '#22C55E', height: 0.29, radius: 0.14 },

  // Dọc bờ kênh sông Sài Gòn (Bán đảo Đông, X = 1.35)
  { x: 1.35, z: -3.8, color: '#22C55E', height: 0.30, radius: 0.15 },
  { x: 1.35, z: -2.3, color: '#10B981', height: 0.33, radius: 0.16 },
  { x: 1.35, z: -0.8, color: '#15803D', height: 0.27, radius: 0.14 },
  { x: 1.35, z: 0.8, color: '#F59E0B', height: 0.31, radius: 0.15 },
  { x: 1.35, z: 2.3, color: '#22C55E', height: 0.28, radius: 0.14 },
  { x: 1.35, z: 3.8, color: '#15803D', height: 0.35, radius: 0.17 },

  // Phân khu shophouse Chợ Lớn (Tây Nam, X in [-4.8, -3.8])
  { x: -4.8, z: 2.2, color: '#15803D', height: 0.28, radius: 0.14 },
  { x: -3.8, z: 2.8, color: '#F59E0B', height: 0.26, radius: 0.13 },
  { x: -4.8, z: 4.2, color: '#22C55E', height: 0.32, radius: 0.16 },
  { x: -3.8, z: 5.0, color: '#10B981', height: 0.30, radius: 0.15 },

  // Phân khu shophouse bến du thuyền & ẩm thực (Đông Nam, X = 3.6)
  { x: 3.6, z: 3.2, color: '#F59E0B', height: 0.29, radius: 0.15 },
  { x: 3.6, z: 4.4, color: '#15803D', height: 0.33, radius: 0.16 },
  { x: 3.6, z: 5.4, color: '#22C55E', height: 0.27, radius: 0.14 },
];

export function DioramaUrbanCanopy(): React.ReactElement {
  return (
    <group position={[0, 0.02, 0]} data-testid="diorama-urban-canopy">
      {URBAN_TREES.map((tree, i) => (
        <group key={`urban-tree-${i}`} position={[tree.x, 0, tree.z]}>
          {/* Thân cây gỗ tự nhiên */}
          <mesh castShadow receiveShadow position={[0, tree.height * 0.4, 0]}>
            <cylinderGeometry args={[0.025, 0.04, tree.height * 0.8, 8]} />
            <meshStandardMaterial color="#78350F" roughness={0.8} />
          </mesh>
          {/* Tầng tán dưới */}
          <mesh castShadow position={[0, tree.height * 0.85, 0]}>
            <sphereGeometry args={[tree.radius, 12, 12]} />
            <meshStandardMaterial color={tree.color} roughness={0.65} />
          </mesh>
          {/* Tầng tán trên đan xen đa tầng */}
          <mesh castShadow position={[0, tree.height * 1.08, 0]}>
            <sphereGeometry args={[tree.radius * 0.75, 10, 10]} />
            <meshStandardMaterial color={tree.color} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function MiniatureCityDiorama(): React.ReactElement {
  return (
    <group position={[0, 0, 0]} data-testid="miniature-city-diorama">
      {/* 0. Khung viền gỗ óc chó & gờ kim loại bao quanh bàn cờ */}
      <DioramaBoardRim />
      {/* 0.1. Tuyến đường sắt đô thị mô hình & đoàn tàu mini */}
      <DioramaModelRailroad />
      {/* 0.2. Ke ga xe lửa bến sông ven tuyến đường sắt */}
      <DioramaWaterfrontStation />
      {/* 0.25. Ke ga xe lửa Landmark Metro bờ Bắc */}
      <DioramaLandmarkNorthStation />
      {/* 0.3. Dải luống hoa và bụi cây cảnh nhiệt đới ven bờ kênh */}
      <DioramaTropicalFlora />
      {/* 1. Bán đảo đôi liền khối & Bậc thềm kết nối quảng trường trung tâm */}
      <DioramaTerrain />
      {/* 1.1. Quảng trường Tượng đài Biểu tượng Trung tâm */}
      <CentralMonumentPlaza />
      {/* 1.2. Tuyến hành lang đi bộ lát đá hoa cương & tiểu cảnh công viên */}
      <DioramaPedestrianPromenades />
      {/* 1.3. Tán cây xanh cảnh quan đô thị nhiệt đới đa tầng */}
      <DioramaUrbanCanopy />
      {/* 2. Cầu Ba Son (Bắc) và Cầu Long Biên (Nam) nối liền hai bờ sông */}
      <DioramaBridges />
      {/* 3. Trung tâm Văn hóa Triển lãm & Công viên Cảnh quan Bờ sông */}
      <DioramaCivicCenter />
      <DioramaWaterfrontPark />
      {/* 4. Cảng Container Cát Lái & Bến du thuyền (Đông Nam) */}
      <DioramaContainerPort />
      <DioramaMarina />
      {/* 5. Cụm cao ốc tài chính Landmark Skyline & Tháp cao ốc nén */}
      <DioramaSkyline />
      <DioramaHighriseBlocks />
      {/* 5.1. Khu di sản văn hóa Chợ Lớn & Shophouse phố cổ */}
      <DioramaHeritageDistrict />
      <DioramaShophouseBlocks />
      {/* 6. Nhịp sống đô thị vi mô & Giao thông tự hành */}
      <DioramaMicroLife />
      <DioramaTraffic />
    </group>
  );
}

