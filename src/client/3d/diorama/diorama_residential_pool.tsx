// [UI-S02/MSS][IMP-197] DioramaResidentialPool — Eastern Peninsula Residential Complex with Rooftop Infinity Pool & Helipad
import React from 'react';
import { useEnvironmentStore } from '../../store/environment_store';

export function DioramaResidentialPool(): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';

  return (
    <group data-testid="diorama-residential-pool" position={[3.2, 0.025, 0.5]}>
      {/* 1. Khối căn hộ màu vàng ấm */}
      <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.9, 1.1, 0.75]} />
        <meshStandardMaterial color="#FEF08A" roughness={0.35} metalness={0.15} />
      </mesh>

      {/* Ban công gỗ tự nhiên */}
      <mesh castShadow position={[0, 0.4, 0.4]}>
        <boxGeometry args={[0.7, 0.04, 0.12]} />
        <meshStandardMaterial color="#78350F" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.75, 0.4]}>
        <boxGeometry args={[0.7, 0.04, 0.12]} />
        <meshStandardMaterial color="#78350F" roughness={0.6} />
      </mesh>

      {/* Cửa sổ căn hộ tỏa ánh sáng vàng ấm ban đêm */}
      <mesh position={[0, 0.5, 0.385]}>
        <boxGeometry args={[0.6, 0.14, 0.02]} />
        <meshStandardMaterial
          color="#FEF08A"
          emissive="#FEF08A"
          emissiveIntensity={isNight ? 0.8 : 0.0}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.85, 0.385]}>
        <boxGeometry args={[0.6, 0.14, 0.02]} />
        <meshStandardMaterial
          color="#FEF08A"
          emissive="#FEF08A"
          emissiveIntensity={isNight ? 0.8 : 0.0}
          roughness={0.2}
        />
      </mesh>

      {/* 2. Hồ bơi vô cực sân thượng (Rooftop Infinity Pool) */}
      {/* Viền đá cẩm thạch trắng */}
      <mesh receiveShadow position={[0, 1.11, 0.04]}>
        <boxGeometry args={[0.78, 0.03, 0.52]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.25} />
      </mesh>

      {/* Lòng hồ bơi ngọc lam phản xạ dạ quang ban đêm */}
      <mesh data-testid="rooftop-pool" position={[0, 1.125, 0.04]}>
        <boxGeometry args={[0.68, 0.02, 0.42]} />
        <meshStandardMaterial
          color="#0EA5E9"
          emissive="#0284C7"
          emissiveIntensity={isNight ? 0.6 : isSunset ? 0.2 : 0.0}
          roughness={0.1}
          metalness={0.6}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* 3. Ghế tắm nắng & dù che resort nghỉ dưỡng */}
      <mesh castShadow data-testid="pool-sun-lounger" position={[-0.2, 1.14, -0.22]}>
        <boxGeometry args={[0.12, 0.03, 0.22]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
      </mesh>
      <mesh castShadow data-testid="pool-sun-lounger" position={[0.2, 1.14, -0.22]}>
        <boxGeometry args={[0.12, 0.03, 0.22]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
      </mesh>

      {/* Cột và tán dù resort */}
      <mesh position={[0, 1.21, -0.22]}>
        <cylinderGeometry args={[0.008, 0.008, 0.16, 6]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.7} />
      </mesh>
      <mesh data-testid="pool-resort-umbrella" position={[0, 1.29, -0.22]}>
        <coneGeometry args={[0.16, 0.07, 8]} />
        <meshStandardMaterial color="#EF4444" roughness={0.4} />
      </mesh>

      {/* 4. Khối nhà mái đỏ liền kề với sân đỗ trực thăng Helipad */}
      <mesh castShadow receiveShadow position={[-0.85, 0.45, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.7]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.4} />
      </mesh>
      <mesh castShadow position={[-0.85, 0.915, 0]}>
        <boxGeometry args={[0.72, 0.03, 0.72]} />
        <meshStandardMaterial color="#DC2626" roughness={0.4} />
      </mesh>

      {/* Đĩa tròn sân đỗ Helipad viền đỏ */}
      <mesh
        data-testid="residential-helipad"
        receiveShadow
        position={[-0.85, 0.935, 0]}
      >
        <cylinderGeometry args={[0.28, 0.28, 0.015, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>
      <mesh position={[-0.85, 0.945, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.27, 24]} />
        <meshBasicMaterial color="#DC2626" />
      </mesh>

      {/* Chữ [H] phản quang trên sân đỗ */}
      <mesh
        data-testid="helipad-h-mark"
        position={[-0.85, 0.95, 0]}
        data-helipad-symbol="[H]"
      >
        <boxGeometry args={[0.03, 0.008, 0.14]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={isNight ? 0.6 : 0.0}
        />
      </mesh>
      <mesh position={[-0.85, 0.95, 0]}>
        <boxGeometry args={[0.08, 0.008, 0.03]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={isNight ? 0.6 : 0.0}
        />
      </mesh>
    </group>
  );
}
