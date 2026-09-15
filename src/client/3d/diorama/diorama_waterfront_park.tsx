// [UI-S02/MSS][IMP-67] DioramaWaterfrontPark — Realistic Saigon Waterfront Park & Waterbus Pier
import React from 'react';
import { useEnvironmentStore } from '../../store/environment_store';

interface BenchProps {
  readonly position: [number, number, number];
  readonly rotationY?: number;
}

function ParkBench({ position, rotationY = 0 }: BenchProps): React.ReactElement {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Bench legs / frame */}
      <mesh position={[-0.08, 0.03, 0]} castShadow>
        <boxGeometry args={[0.015, 0.06, 0.04]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0.08, 0.03, 0]} castShadow>
        <boxGeometry args={[0.015, 0.06, 0.04]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Wooden slats for seat */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.2, 0.012, 0.05]} />
        <meshStandardMaterial color="#78350F" roughness={0.7} />
      </mesh>
      {/* Wooden slats for backrest */}
      <mesh position={[0, 0.085, -0.02]} castShadow>
        <boxGeometry args={[0.2, 0.05, 0.012]} />
        <meshStandardMaterial color="#78350F" roughness={0.7} />
      </mesh>
    </group>
  );
}

interface TreeProps {
  readonly position: [number, number, number];
  readonly scale?: number;
}

function TropicalParkTree({ position, scale = 1 }: TreeProps): React.ReactElement {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.035, 0.24, 6]} />
        <meshStandardMaterial color="#78350F" roughness={0.8} />
      </mesh>
      {/* Lower canopy tier */}
      <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.65} />
      </mesh>
      {/* Upper canopy tier */}
      <mesh position={[0, 0.36, 0]} castShadow>
        <sphereGeometry args={[0.12, 7, 7]} />
        <meshStandardMaterial color="#15803D" roughness={0.6} />
      </mesh>
    </group>
  );
}

export function DioramaWaterfrontPark(): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';

  return (
    <group position={[4.5, 0.16, -1.8]} data-testid="diorama-waterfront-park">
      {/* 1. MÓNG KÈ BỜ SÔNG & NỀN CÔNG VIÊN (Quay Wall & Foundation) */}
      <mesh receiveShadow position={[0, 0.025, 0]}>
        <boxGeometry args={[1.7, 0.05, 2.0]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.7} />
      </mesh>

      {/* Lan can bảo vệ bờ kè ven sông (Waterfront Balustrade) */}
      <mesh position={[-0.82, 0.07, 0]} castShadow>
        <boxGeometry args={[0.02, 0.06, 1.95]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 2. THẢM CỎ HOA VIÊN TỰ NHIÊN (Lush Green Lawns & Flowerbeds) */}
      {/* Thảm cỏ lớn phía Đông */}
      <mesh receiveShadow position={[0.25, 0.055, -0.3]}>
        <boxGeometry args={[0.9, 0.02, 1.2]} />
        <meshStandardMaterial color="#166534" roughness={0.75} />
      </mesh>
      {/* Thảm cỏ giật cấp phía Nam */}
      <mesh receiveShadow position={[0.2, 0.065, 0.55]}>
        <boxGeometry args={[0.8, 0.02, 0.5]} />
        <meshStandardMaterial color="#15803D" roughness={0.7} />
      </mesh>

      {/* Luống hoa cảnh quan đa sắc (Flowerbeds) */}
      <mesh receiveShadow position={[0.62, 0.075, -0.3]}>
        <boxGeometry args={[0.12, 0.025, 0.9]} />
        <meshStandardMaterial color="#E11D48" roughness={0.5} />
      </mesh>
      <mesh receiveShadow position={[0.45, 0.075, 0.55]}>
        <boxGeometry args={[0.25, 0.025, 0.1]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.5} />
      </mesh>

      {/* 3. ĐƯỜNG DẠO BỘ GRANITE (Granite Walking Promenade) */}
      {/* Trục dạo bộ chính ven bờ kè */}
      <mesh receiveShadow position={[-0.45, 0.052, 0]}>
        <boxGeometry args={[0.45, 0.015, 1.9]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.45} />
      </mesh>
      {/* Đường nhánh lát đá granite xám kết nối công viên */}
      <mesh receiveShadow position={[0.05, 0.054, -0.2]}>
        <boxGeometry args={[0.55, 0.015, 0.28]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.5} />
      </mesh>
      <mesh receiveShadow position={[0.05, 0.054, 0.45]}>
        <boxGeometry args={[0.55, 0.015, 0.24]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.45} />
      </mesh>

      {/* 4. HÀNG CÂY RỢP BÓNG & GHẾ ĐÁ CÔNG VIÊN (Trees & Benches) */}
      <TropicalParkTree position={[0.2, 0.06, -0.65]} scale={1.1} />
      <TropicalParkTree position={[0.55, 0.06, -0.7]} scale={0.9} />
      <TropicalParkTree position={[0.35, 0.06, 0.15]} scale={1.0} />
      <TropicalParkTree position={[0.5, 0.06, 0.7]} scale={1.05} />
      <TropicalParkTree position={[-0.15, 0.06, -0.75]} scale={0.85} />

      {/* Ghế đá ven lối dạo ngắm sông */}
      <ParkBench position={[-0.55, 0.055, -0.45]} rotationY={Math.PI / 2} />
      <ParkBench position={[-0.55, 0.055, 0.25]} rotationY={Math.PI / 2} />
      <ParkBench position={[0.1, 0.06, -0.45]} rotationY={0} />

      {/* 5. NHÀ GA TÀU THỦY SAIGON WATERBUS & CẦU CẢNG NỔI (Waterbus Pier & Pavilion) */}
      <group position={[-0.85, 0.04, 0.55]}>
        {/* Cầu cảng nổi đón khách (Floating Pontoon Pier Deck) */}
        <mesh receiveShadow position={[-0.2, -0.01, 0]}>
          <boxGeometry args={[0.38, 0.04, 0.55]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Cọc neo tàu thủy (Docking Bollards) */}
        <mesh position={[-0.34, 0.02, -0.22]}>
          <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        <mesh position={[-0.34, 0.02, 0.22]}>
          <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        {/* Cầu dẫn lên tàu (Gangway Ramp) */}
        <mesh receiveShadow position={[0.02, 0.015, 0]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.15, 0.012, 0.32]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.5} />
        </mesh>
        {/* Nhà chờ mái vòm xanh sapphire Saigon Waterbus (Passenger Pavilion) */}
        <mesh castShadow position={[0.18, 0.12, 0]}>
          <boxGeometry args={[0.22, 0.15, 0.38]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        {/* Mái che vát màu xanh đại dương thương hiệu Waterbus */}
        <mesh castShadow position={[0.18, 0.21, 0]}>
          <boxGeometry args={[0.26, 0.025, 0.44]} />
          <meshStandardMaterial
            color="#0284C7"
            roughness={0.2}
            metalness={0.6}
            emissive="#0284C7"
            emissiveIntensity={isNight ? 0.6 : isSunset ? 0.2 : 0.0}
          />
        </mesh>
        {/* Kính Low-E sảnh chờ vé */}
        <mesh position={[0.08, 0.11, 0]}>
          <boxGeometry args={[0.02, 0.09, 0.32]} />
          <meshPhysicalMaterial
            color="#0284C7"
            roughness={0.1}
            transmission={0.6}
            thickness={0.2}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>
    </group>
  );
}
