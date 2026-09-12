// [UI-S04/MSS] SapphireLandmarkModel — 3D Miniature Landmark Model for Auction Card with District-Aware Architecture
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { ColorGroup } from '../../domain/board_config';

export interface SapphireLandmarkModelProps {
  readonly position?: [number, number, number];
  readonly scale?: number;
  readonly colorGroup?: string;
}

export const SAPPHIRE_LANDMARK_COLORS = {
  glassBlue: '#38BDF8',
  glassEmissive: '#0284C7',
  goldTrim: '#F59E0B',
  pedestalStone: '#0F172A',
} as const;

export interface LandmarkDistrictTheme {
  readonly glassColor: string;
  readonly glassEmissive: string;
  readonly trimColor: string;
  readonly crownType: 'spire' | 'pagoda' | 'marina' | 'crystal';
}

/**
 * Xác định chủ đề phong cách kiến trúc theo nhóm màu quy hoạch bất động sản
 */
export function resolveLandmarkTheme(colorGroup?: string): LandmarkDistrictTheme {
  switch (colorGroup) {
    case ColorGroup.XanhLa:
      return {
        glassColor: '#34D399',
        glassEmissive: '#059669',
        trimColor: '#FBBF24',
        crownType: 'pagoda',
      };
    case ColorGroup.XanhDaTroi:
    case ColorGroup.Nau:
      return {
        glassColor: '#22D3EE',
        glassEmissive: '#0891B2',
        trimColor: '#E2E8F0',
        crownType: 'marina',
      };
    case ColorGroup.Do:
    case ColorGroup.Cam:
    case ColorGroup.Hong:
      return {
        glassColor: '#FB7185',
        glassEmissive: '#E11D48',
        trimColor: '#F59E0B',
        crownType: 'crystal',
      };
    case ColorGroup.Vang:
    case ColorGroup.Tim:
    default:
      return {
        glassColor: SAPPHIRE_LANDMARK_COLORS.glassBlue,
        glassEmissive: SAPPHIRE_LANDMARK_COLORS.glassEmissive,
        trimColor: SAPPHIRE_LANDMARK_COLORS.goldTrim,
        crownType: 'spire',
      };
  }
}

function useSafeFrame(callback: Parameters<typeof useFrame>[0]): void {
  try {
    useFrame(callback);
  } catch {
    // Safe outside Canvas in headless test environment
  }
}

/**
 * Mô hình 3D thu nhỏ của Tòa tháp Landmark bằng kính PBR xoay nhẹ ở trọng tâm thẻ Sổ Đỏ
 * Tùy biến chất liệu và đỉnh tháp theo từng phân khu quy hoạch
 */
export function SapphireLandmarkModel({
  position = [0, 0, 0],
  scale = 1.0,
  colorGroup,
}: SapphireLandmarkModelProps): React.ReactElement {
  const groupRef = useRef<Group>(null);
  const theme = useMemo(() => resolveLandmarkTheme(colorGroup), [colorGroup]);

  useSafeFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.55;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* 1. Bệ đỡ chân tháp đá sẫm bọc chỉ mạ kim loại */}
      <mesh position={[0, -0.72, 0]}>
        <cylinderGeometry args={[0.34, 0.4, 0.08, 16]} />
        <meshPhysicalMaterial
          color={SAPPHIRE_LANDMARK_COLORS.pedestalStone}
          roughness={0.2}
          metalness={0.85}
          clearcoat={0.6}
        />
      </mesh>
      <mesh position={[0, -0.66, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 0.04, 16]} />
        <meshPhysicalMaterial
          color={theme.trimColor}
          roughness={0.12}
          metalness={0.95}
          clearcoat={1.0}
        />
      </mesh>

      {/* 2. Thân tháp chính bằng kính PBR nhiều mặt cắt */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.18, 0.26, 1.0, 6]} />
        <meshPhysicalMaterial
          color={theme.glassColor}
          emissive={theme.glassEmissive}
          emissiveIntensity={0.35}
          roughness={0.08}
          metalness={0.15}
          transmission={0.82}
          transparent
          opacity={0.88}
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.08}
        />
      </mesh>

      {/* 3. Bốn trụ tháp vệ tinh giật cấp tạo khối kiến trúc Landmark đồ sộ */}
      {([-0.18, 0.18] as const).map((x) =>
        ([-0.18, 0.18] as const).map((z) => (
          <mesh key={`${x}_${z}`} position={[x, -0.32, z]}>
            <boxGeometry args={[0.1, 0.65, 0.1]} />
            <meshPhysicalMaterial
              color={theme.glassColor}
              roughness={0.1}
              metalness={0.2}
              transmission={0.8}
              transparent
              opacity={0.85}
              clearcoat={0.8}
            />
          </mesh>
        ))
      )}

      {/* 4. Vành đai kết cấu kim loại phân tầng cao ốc */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.025, 16]} />
        <meshPhysicalMaterial
          color={theme.trimColor}
          roughness={0.14}
          metalness={0.95}
          clearcoat={1.0}
        />
      </mesh>

      {/* 5. Chóp tháp kiến trúc tùy biến theo CrownType */}
      {theme.crownType === 'pagoda' ? (
        <group position={[0, 0.52, 0]}>
          <mesh position={[0, -0.05, 0]}>
            <coneGeometry args={[0.24, 0.14, 4]} />
            <meshPhysicalMaterial color={theme.trimColor} metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <coneGeometry args={[0.16, 0.18, 4]} />
            <meshPhysicalMaterial color={theme.glassColor} transmission={0.8} transparent opacity={0.9} />
          </mesh>
        </group>
      ) : theme.crownType === 'marina' ? (
        <mesh position={[0, 0.54, 0]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.04, 0.19, 0.44, 4]} />
          <meshPhysicalMaterial
            color={theme.glassColor}
            emissive={theme.glassEmissive}
            emissiveIntensity={0.4}
            transmission={0.85}
            transparent
            opacity={0.9}
          />
        </mesh>
      ) : (
        <mesh position={[0, 0.52, 0]}>
          <coneGeometry args={[0.18, 0.38, 6]} />
          <meshPhysicalMaterial
            color={theme.glassColor}
            emissive={theme.glassEmissive}
            emissiveIntensity={0.45}
            roughness={0.06}
            metalness={0.1}
            transmission={0.85}
            transparent
            opacity={0.9}
            clearcoat={1.0}
          />
        </mesh>
      )}

      {/* 6. Kim thu lôi / Đỉnh tháp Spire mạ kim loại vươn thẳng kiêu hãnh */}
      <mesh position={[0, 0.82, 0]}>
        <cylinderGeometry args={[0.015, 0.022, 0.26, 8]} />
        <meshPhysicalMaterial
          color={theme.trimColor}
          roughness={0.1}
          metalness={0.98}
          clearcoat={1.0}
        />
      </mesh>
    </group>
  );
}
