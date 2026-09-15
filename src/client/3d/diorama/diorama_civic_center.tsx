// [UI-S02/MSS][IMP-67] DioramaCivicCenter — Contemporary Exhibition & Cultural Civic Center
import React from 'react';
import { useEnvironmentStore } from '../../store/environment_store';

export function DioramaCivicCenter(): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';

  return (
    <group position={[4.5, 0.16, -4.5]} data-testid="diorama-civic-center">
      {/* 1. KHỐI ĐẾ GIẬT CẤP ĐÁ TRAVERTINE & TITANIUM (Stepped Clad Podium) */}
      {/* Tầng đế chính (Base Podium Slab) */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[2.2, 0.1, 1.8]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>

      {/* Tầng 2 ốp đá titanium trắng bạc (Titanium Cladding Terrace) */}
      <mesh castShadow receiveShadow position={[0.1, 0.15, -0.1]}>
        <boxGeometry args={[1.8, 0.1, 1.4]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.35} metalness={0.5} />
      </mesh>

      {/* Khối bảo tàng cánh Đông giật cấp */}
      <mesh castShadow receiveShadow position={[0.55, 0.28, -0.15]}>
        <boxGeometry args={[0.7, 0.16, 0.9]} />
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </mesh>

      {/* 2. ĐẠI SẢNH KÍNH LOW-E SAPPHIRE (Low-E Architectural Glass Atrium) */}
      <mesh castShadow receiveShadow position={[-0.25, 0.32, 0]}>
        <boxGeometry args={[0.9, 0.26, 0.85]} />
        <meshPhysicalMaterial
          color="#0284C7"
          roughness={0.05}
          metalness={0.85}
          reflectivity={0.9}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          emissive="#0284C7"
          emissiveIntensity={isNight ? 0.35 : isSunset ? 0.15 : 0.0}
        />
      </mesh>

      {/* Giàn lam chắn nắng titan vát góc trên sảnh kính (Sunshade Louvers) */}
      {[-0.3, -0.1, 0.1, 0.3].map((lz) => (
        <mesh key={`louver-${lz}`} position={[-0.25, 0.46, lz]}>
          <boxGeometry args={[0.92, 0.015, 0.04]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* 3. VƯỜN TREO SINH THÁI TRÊN MÁI (Terraced Rooftop Gardens) */}
      {/* Vườn thảm cỏ xanh trên mái khối Đông */}
      <mesh receiveShadow position={[0.55, 0.365, -0.15]}>
        <boxGeometry args={[0.62, 0.015, 0.82]} />
        <meshStandardMaterial color="#15803D" roughness={0.7} />
      </mesh>
      {/* Vườn thảm cỏ tầng giật cấp phía Bắc */}
      <mesh receiveShadow position={[0.1, 0.205, -0.62]}>
        <boxGeometry args={[1.7, 0.012, 0.28]} />
        <meshStandardMaterial color="#15803D" roughness={0.7} />
      </mesh>

      {/* Cây cảnh cắt tỉa hình khối trên sân thượng (Topiary Cubes) */}
      <mesh position={[0.7, 0.4, -0.35]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshStandardMaterial color="#166534" roughness={0.6} />
      </mesh>
      <mesh position={[0.4, 0.4, 0.05]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshStandardMaterial color="#166534" roughness={0.6} />
      </mesh>

      {/* 4. SẢNH ĐÓN MÁI VƯƠN VÀ HỒ NƯỚC SOI BÓNG (Canopy & Reflecting Pool) */}
      {/* Mái đón vươn dài (Cantilevered Entrance Canopy) */}
      <group position={[-0.25, 0.22, 0.65]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.02, 0.45]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Trần ốp nhôm trắng sứ có đèn rọi âm trần */}
        <mesh position={[0, -0.011, 0]}>
          <boxGeometry args={[0.66, 0.002, 0.41]} />
          <meshStandardMaterial
            color="#F8FAFC"
            emissive="#FEF08A"
            emissiveIntensity={isNight ? 1.2 : isSunset ? 0.3 : 0.0}
          />
        </mesh>
        {/* 2 Cột trụ thép thanh mảnh */}
        <mesh position={[-0.3, -0.11, 0.18]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.3, -0.11, 0.18]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Hồ nước soi bóng cảnh quan trước sảnh (Reflecting Pool) */}
      <group position={[0.55, 0.055, 0.55]}>
        {/* Thành hồ đá cẩm thạch */}
        <mesh receiveShadow position={[0, 0.02, 0]}>
          <boxGeometry args={[0.7, 0.04, 0.45]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.4} />
        </mesh>
        {/* Mặt nước hồ trong xanh phản chiếu */}
        <mesh position={[0, 0.042, 0]}>
          <boxGeometry args={[0.62, 0.005, 0.37]} />
          <meshStandardMaterial
            color="#0284C7"
            roughness={0.08}
            metalness={0.8}
            emissive="#0284C7"
            emissiveIntensity={isNight ? 0.4 : isSunset ? 0.15 : 0.0}
          />
        </mesh>
      </group>

      {/* Điêu khắc nghệ thuật đương đại ngoài trời (Sculpture Plaza) */}
      <group position={[-0.8, 0.12, 0.5]}>
        <mesh castShadow position={[0, 0.06, 0]} rotation={[0.4, 0.5, 0.2]}>
          <octahedronGeometry args={[0.09, 0]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh receiveShadow position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.02, 16]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
