// [UI-S03/MSS][IMP-203] Bespoke Landmark Fallback — Zero-Crash Procedural Standby
// Renders distinctive regional architectural procedural models for Level 3 landmarks.

import React from 'react';
import { RoundedBox } from '@react-three/drei';
import { getRegionalTypology, type RegionalTypology } from './building_typology';

export interface BespokeLandmarkFallbackProps {
  readonly cellIndex: number;
  readonly typology?: RegionalTypology;
  readonly isNight?: boolean;
  readonly isSunset?: boolean;
}

export function BespokeLandmarkFallback({
  cellIndex,
  typology,
  isNight = false,
  isSunset = false,
}: BespokeLandmarkFallbackProps): React.ReactElement {
  const effectiveTypology = typology ?? getRegionalTypology(cellIndex) ?? 'metropolis';
  const emissiveLevel = isNight ? 0.65 : isSunset ? 0.35 : 0.08;

  return (
    <group data-testid="bespoke-landmark-fallback">
      {/* Nền bóng tiếp xúc tĩnh */}
      <mesh position={[0, 0.002, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.68, 0.58]} />
        <meshBasicMaterial color="#0F172A" transparent opacity={0.42} />
      </mesh>

      {/* Chân đế đá nguyên khối */}
      <RoundedBox args={[0.56, 0.05, 0.54]} radius={0.012} smoothness={3} position={[0, 0.025, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.4} envMapIntensity={1.2} />
      </RoundedBox>

      {/* Biến thể kiến trúc theo 4 trường phái vùng miền */}
      {effectiveTypology === 'riverine' && (
        <RiverineLandmarkMesh emissiveLevel={emissiveLevel} />
      )}
      {effectiveTypology === 'resort' && (
        <ResortLandmarkMesh emissiveLevel={emissiveLevel} />
      )}
      {effectiveTypology === 'heritage' && (
        <HeritageLandmarkMesh emissiveLevel={emissiveLevel} />
      )}
      {effectiveTypology === 'metropolis' && (
        <MetropolisLandmarkMesh emissiveLevel={emissiveLevel} />
      )}
    </group>
  );
}

interface MeshTypologyProps {
  readonly emissiveLevel: number;
}

function RiverineLandmarkMesh({ emissiveLevel }: MeshTypologyProps): React.ReactElement {
  return (
    <group>
      {/* Sàn gỗ nổi trên sông */}
      <RoundedBox args={[0.50, 0.03, 0.48]} radius={0.008} smoothness={2} position={[0, 0.065, 0]} castShadow>
        <meshStandardMaterial color="#78350F" roughness={0.7} metalness={0.1} />
      </RoundedBox>
      {/* Thân điện thờ / dinh thự gỗ gõ đỏ */}
      <RoundedBox args={[0.42, 0.32, 0.38]} radius={0.015} smoothness={3} position={[0, 0.23, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#FEF3C7" roughness={0.4} metalness={0.2} />
      </RoundedBox>
      {/* Cửa sổ hoa văn mạ vàng dạ quang */}
      <RoundedBox args={[0.34, 0.12, 0.015]} radius={0.004} smoothness={1} position={[0, 0.22, 0.195]}>
        <meshPhysicalMaterial
          color="#FDE68A"
          roughness={0.08}
          clearcoat={1.0}
          emissive="#F59E0B"
          emissiveIntensity={emissiveLevel}
        />
      </RoundedBox>
      {/* Tầng mái đao cấp 1 cong vút */}
      <RoundedBox args={[0.48, 0.03, 0.44]} radius={0.006} smoothness={2} position={[0, 0.40, 0]} castShadow>
        <meshStandardMaterial color="#B91C1C" roughness={0.35} />
      </RoundedBox>
      {/* Cổ lầu tầng 2 */}
      <RoundedBox args={[0.30, 0.20, 0.28]} radius={0.01} smoothness={2} position={[0, 0.51, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#FEF3C7" roughness={0.4} />
      </RoundedBox>
      {/* Mái chóp ngói lưu ly đỉnh */}
      <mesh position={[0, 0.68, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <cylinderGeometry args={[0, 0.36, 0.18, 4]} />
        <meshStandardMaterial
          color="#DC2626"
          roughness={0.3}
          emissive="#F59E0B"
          emissiveIntensity={emissiveLevel * 0.4}
        />
      </mesh>
    </group>
  );
}

function ResortLandmarkMesh({ emissiveLevel }: MeshTypologyProps): React.ReactElement {
  return (
    <group>
      {/* Khối đế giật cấp phong cách Art Deco / Bờ Biển */}
      <RoundedBox args={[0.48, 0.18, 0.44]} radius={0.015} smoothness={3} position={[0, 0.14, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#F8FAFC" roughness={0.25} metalness={0.3} />
      </RoundedBox>
      {/* Tháp vòm tròn hải đăng / vỏ sò / búp sen */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.22, 0.40, 16]} />
        <meshPhysicalMaterial
          color="#0284C7"
          roughness={0.06}
          metalness={0.8}
          clearcoat={1.0}
          emissive="#38BDF8"
          emissiveIntensity={emissiveLevel}
        />
      </mesh>
      {/* Đai ban công vát biển */}
      <RoundedBox args={[0.42, 0.025, 0.40]} radius={0.006} smoothness={2} position={[0, 0.24, 0]} castShadow>
        <meshStandardMaterial color="#F59E0B" roughness={0.15} metalness={0.9} envMapIntensity={2.0} />
      </RoundedBox>
      {/* Thấu kính đèn biển đỉnh tháp phát quang */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.10, 0.12, 12]} />
        <meshPhysicalMaterial
          color="#FEF08A"
          roughness={0.04}
          ior={1.5}
          emissive="#FDE047"
          emissiveIntensity={emissiveLevel * 1.2}
        />
      </mesh>
      <mesh position={[0, 0.76, 0]} castShadow>
        <cylinderGeometry args={[0, 0.12, 0.10, 8]} />
        <meshStandardMaterial color="#1E293B" roughness={0.3} />
      </mesh>
    </group>
  );
}

function HeritageLandmarkMesh({ emissiveLevel }: MeshTypologyProps): React.ReactElement {
  return (
    <group>
      {/* Bệ đá Thanh Hoa tam cấp */}
      <RoundedBox args={[0.52, 0.06, 0.48]} radius={0.01} smoothness={2} position={[0, 0.08, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#475569" roughness={0.6} />
      </RoundedBox>
      {/* Lầu Ngũ Phụng / Ngọ Môn thân gạch ngói cổ */}
      <RoundedBox args={[0.44, 0.26, 0.38]} radius={0.012} smoothness={3} position={[0, 0.23, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#7F1D1D" roughness={0.5} metalness={0.2} />
      </RoundedBox>
      {/* Cửa võng cung đình thiếp vàng */}
      <RoundedBox args={[0.36, 0.14, 0.015]} radius={0.004} smoothness={1} position={[0, 0.20, 0.195]}>
        <meshStandardMaterial
          color="#F59E0B"
          metalness={0.9}
          roughness={0.2}
          emissive="#F59E0B"
          emissiveIntensity={emissiveLevel}
        />
      </RoundedBox>
      {/* Tầng mái hoàng lưu ly thứ nhất */}
      <RoundedBox args={[0.52, 0.035, 0.46]} radius={0.006} smoothness={2} position={[0, 0.38, 0]} castShadow>
        <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.6} />
      </RoundedBox>
      {/* Cổ diềm lầu thứ hai */}
      <RoundedBox args={[0.34, 0.18, 0.30]} radius={0.01} smoothness={2} position={[0, 0.48, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#7F1D1D" roughness={0.5} />
      </RoundedBox>
      {/* Mái đao hoàng cung đỉnh chóp */}
      <mesh position={[0, 0.63, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <cylinderGeometry args={[0, 0.44, 0.16, 4]} />
        <meshStandardMaterial
          color="#F59E0B"
          metalness={0.8}
          roughness={0.15}
          emissive="#F59E0B"
          emissiveIntensity={emissiveLevel * 0.5}
        />
      </mesh>
    </group>
  );
}

function MetropolisLandmarkMesh({ emissiveLevel }: MeshTypologyProps): React.ReactElement {
  return (
    <group>
      {/* Tháp đôi / Chọc trời búp sen hiện đại */}
      <RoundedBox args={[0.26, 0.58, 0.36]} radius={0.02} smoothness={3} position={[-0.11, 0.34, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#0284C7"
          roughness={0.04}
          metalness={0.85}
          ior={1.52}
          reflectivity={0.9}
          clearcoat={1.0}
          emissive="#38BDF8"
          emissiveIntensity={emissiveLevel}
        />
      </RoundedBox>
      <RoundedBox args={[0.26, 0.76, 0.36]} radius={0.02} smoothness={3} position={[0.11, 0.43, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#0369A1"
          roughness={0.04}
          metalness={0.85}
          ior={1.52}
          reflectivity={0.95}
          clearcoat={1.0}
          emissive="#38BDF8"
          emissiveIntensity={emissiveLevel}
        />
      </RoundedBox>
      {/* Cầu nối trên không Skybridge kính */}
      <RoundedBox args={[0.12, 0.06, 0.16]} radius={0.008} smoothness={2} position={[0, 0.42, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#38BDF8"
          roughness={0.04}
          metalness={0.8}
          clearcoat={1.0}
          emissive="#00F5FF"
          emissiveIntensity={emissiveLevel}
        />
      </RoundedBox>
      {/* Đai vát vàng vương giả */}
      <RoundedBox args={[0.24, 0.02, 0.34]} radius={0.005} smoothness={2} position={[0.11, 0.81, 0]} castShadow>
        <meshStandardMaterial
          color="#F59E0B"
          roughness={0.1}
          metalness={0.95}
          emissive="#F59E0B"
          emissiveIntensity={emissiveLevel}
        />
      </RoundedBox>
      {/* Trụ anten viễn thông đỉnh cao ốc */}
      <mesh position={[0.11, 0.94, 0]} castShadow>
        <cylinderGeometry args={[0.005, 0.012, 0.12, 6]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.08} metalness={1.0} envMapIntensity={2.0} />
      </mesh>
    </group>
  );
}
