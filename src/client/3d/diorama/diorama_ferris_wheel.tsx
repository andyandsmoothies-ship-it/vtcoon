// [UI-S02/MSS] DioramaFerrisWheel — Rotating theme park Ferris wheel for Northeast Entertainment Hub
import React, { useRef } from 'react';
import type { Group } from 'three';
import { useEnvironmentStore } from '../../store/environment_store';
import { useSafeFrame } from '../safe_frame';

const GONDOLA_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
] as const;

export function DioramaFerrisWheel(): React.ReactElement {
  const wheelRef = useRef<Group>(null);
  const phase = useEnvironmentStore((s) => s.phase);
  const isNight = phase === 'night';
  const isSunset = phase === 'sunset';

  // Gentle continuous rotation at ~0.25 rad/s
  useSafeFrame((_, delta) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.x += delta * 0.25;
    }
  });

  const spokeCount = 8;
  const wheelRadius = 1.05;

  return (
    <group position={[4.5, 0.16, -1.8]} scale={0.76} data-testid="diorama-ferris-wheel">
      {/* 1. MÓNG BÊ TÔNG & SÀN ĐÓN KHÁCH (Boarding Plaza & Deck) */}
      <mesh receiveShadow position={[0, 0.04, 0]}>
        <boxGeometry args={[1.5, 0.08, 1.8]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
      </mesh>
      {/* Sàn gỗ đón khách có mái che */}
      <mesh receiveShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[1.3, 0.04, 1.5]} />
        <meshStandardMaterial color="#92400E" roughness={0.7} />
      </mesh>
      {/* Quầy vé tí hon phong cách Carnival */}
      <group position={[0.55, 0.18, 0.6]}>
        <mesh castShadow position={[0, 0.08, 0]}>
          <boxGeometry args={[0.22, 0.16, 0.2]} />
          <meshStandardMaterial color="#DC2626" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.16, 0.08, 4]} />
          <meshStandardMaterial color="#FBBF24" roughness={0.3} />
        </mesh>
      </group>

      {/* 2. CHÂN TRỤ CHỮ A (Dual A-Frame Steel Truss Supports) */}
      {/* Chân đỡ phía Tây */}
      <group position={[-0.22, 0.72, 0]}>
        <mesh castShadow position={[0, 0, -0.42]} rotation={[0.42, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.03, 1.45, 6]} />
          <meshStandardMaterial color="#F8FAFC" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0, 0.42]} rotation={[-0.42, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.03, 1.45, 6]} />
          <meshStandardMaterial color="#F8FAFC" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Thanh giằng ngang */}
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[0.03, 0.03, 0.65]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Chân đỡ phía Đông */}
      <group position={[0.22, 0.72, 0]}>
        <mesh castShadow position={[0, 0, -0.42]} rotation={[0.42, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.03, 1.45, 6]} />
          <meshStandardMaterial color="#F8FAFC" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh castShadow position={[0, 0, 0.42]} rotation={[-0.42, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.03, 1.45, 6]} />
          <meshStandardMaterial color="#F8FAFC" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Thanh giằng ngang */}
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[0.03, 0.03, 0.65]} />
          <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Trục quay trung tâm (Center Axle) mạ vàng */}
      <mesh position={[0, 1.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.52, 12]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* 3. VÒNG QUAY XOAY ĐỘNG (Rotating Wheel Structure) */}
      <group ref={wheelRef} position={[0, 1.35, 0]}>
        {/* Vòng thép ngoài cùng (Outer Rim) với dải LED Neon xanh ngọc trong đêm */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[wheelRadius, 0.022, 8, 24]} />
          <meshStandardMaterial
            color="#F8FAFC"
            metalness={0.6}
            roughness={0.25}
            emissive="#00F5FF"
            emissiveIntensity={isNight ? 2.8 : isSunset ? 0.6 : 0.0}
          />
        </mesh>
        {/* Vòng thép trong (Inner Rim) viền vàng hổ phách */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[wheelRadius * 0.65, 0.016, 6, 24]} />
          <meshStandardMaterial
            color="#F59E0B"
            metalness={0.8}
            roughness={0.2}
            emissive="#F59E0B"
            emissiveIntensity={isNight ? 2.6 : isSunset ? 0.5 : 0.0}
          />
        </mesh>

        {/* 8 Nan hoa và 8 Cabin hành khách sắc màu phát quang */}
        {Array.from({ length: spokeCount }).map((_, i) => {
          const angle = (i * 2 * Math.PI) / spokeCount;
          const cy = Math.sin(angle) * wheelRadius;
          const cz = Math.cos(angle) * wheelRadius;
          const color = GONDOLA_COLORS[i % GONDOLA_COLORS.length];

          return (
            <group key={`ferris-spoke-${i}`}>
              {/* Nan hoa thép (Spoke Strut) */}
              <mesh
                position={[0, Math.sin(angle) * (wheelRadius / 2), Math.cos(angle) * (wheelRadius / 2)]}
                rotation={[angle, 0, 0]}
              >
                <cylinderGeometry args={[0.01, 0.01, wheelRadius, 4]} />
                <meshStandardMaterial color="#E2E8F0" metalness={0.7} roughness={0.3} />
              </mesh>

              {/* Cabin hành khách (Passenger Gondola) phát quang neon rực rỡ */}
              <group position={[0, cy, cz]}>
                {/* Trục treo cabin */}
                <mesh position={[0, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.008, 0.008, 0.16, 4]} />
                  <meshStandardMaterial color="#64748B" metalness={0.8} />
                </mesh>
                {/* Thân cabin màu sắc rực rỡ phát quang */}
                <mesh castShadow position={[0, -0.05, 0]}>
                  <boxGeometry args={[0.16, 0.12, 0.16]} />
                  <meshStandardMaterial
                    color={color}
                    roughness={0.35}
                    emissive={color}
                    emissiveIntensity={isNight ? 2.8 : isSunset ? 0.6 : 0.0}
                  />
                </mesh>
                {/* Mái vòm cabin màu trắng sứ viền sáng */}
                <mesh position={[0, 0.02, 0]}>
                  <coneGeometry args={[0.12, 0.06, 4]} />
                  <meshStandardMaterial
                    color="#F8FAFC"
                    roughness={0.2}
                    emissive="#FEF08A"
                    emissiveIntensity={isNight ? 2.5 : 0.0}
                  />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
}
