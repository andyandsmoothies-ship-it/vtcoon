// [TC-P3.9/MSS][IMP-29.2] luxury_pawn_models.tsx — 4 Linh Vật Cờ Thượng Lưu nạp qua SafeGLTFModel
import React from 'react';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';
import {
  LuxuryPawnProceduralFallback,
  LandmarkTowerPawnFallback as LandmarkTowerPawn,
  BayYachtPawnFallback as BayYachtPawn,
  ClassicCarPawnFallback as ClassicCarPawn,
  WarhorsePawnFallback as WarhorsePawn,
} from './luxury_pawn_fallbacks';

export { LandmarkTowerPawn, BayYachtPawn, ClassicCarPawn, WarhorsePawn };

export interface LuxuryPawnConfig {
  readonly slot: number;
  readonly name: string;
  readonly title: string;
  readonly color: string;
  readonly metalness: number;
  readonly roughness: number;
  readonly modelUrl: string;
}

export const LUXURY_PAWN_CONFIGS: readonly LuxuryPawnConfig[] = [
  {
    slot: 0,
    name: 'Tượng Tháp Landmark Hoàng Gia',
    title: 'Đại Gia Sài Gòn (Host)',
    color: '#F59E0B',
    metalness: 0.95,
    roughness: 0.12,
    modelUrl: '/models/pawns/pawn_tower.glb',
  },
  {
    slot: 1,
    name: 'Tượng Du Thuyền Vịnh Biển',
    title: 'Chú Sáu',
    color: '#E2E8F0',
    metalness: 0.9,
    roughness: 0.15,
    modelUrl: '/models/pawns/pawn_yacht.glb',
  },
  {
    slot: 2,
    name: 'Tượng Xe Cổ Cổ Điển',
    title: 'Cô Tư',
    color: '#B45309',
    metalness: 0.85,
    roughness: 0.18,
    modelUrl: '/models/pawns/pawn_car.glb',
  },
  {
    slot: 3,
    name: 'Tượng Ngựa Chiến Kỳ Hạm',
    title: 'Bé Bo',
    color: '#1E3A8A',
    metalness: 0.9,
    roughness: 0.14,
    modelUrl: '/models/pawns/pawn_horse.glb',
  },
] as const;

/**
 * Component hiển thị linh vật cờ thượng lưu nạp qua SafeGLTFModel với Zero-Crash Fallback
 */
export function LuxuryPawnModel({ slotIndex }: { readonly slotIndex: number }): React.ReactElement {
  const normalized = Number.isFinite(slotIndex) ? Math.floor(slotIndex) : 0;
  const safeIdx = Math.max(0, Math.min(3, normalized));
  const config = LUXURY_PAWN_CONFIGS[safeIdx] ?? LUXURY_PAWN_CONFIGS[0]!;

  return (
    <group position={[0, -0.28, 0]} scale={[0.625, 0.625, 0.625]}>
      {/* 1. Bệ cờ mạ kim loại có rãnh viền ánh vàng tiếp xúc mặt ô bàn cờ */}
      <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.25, 0.03, 32]} />
        <meshStandardMaterial
          color={config.color}
          metalness={0.85}
          roughness={0.18}
          emissive={config.color}
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Vòng kim loại sáng bóng định vị chân tượng */}
      <mesh position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.17, 0.21, 32]} />
        <meshBasicMaterial color="#FEF08A" />
      </mesh>

      {/* 2. Mô hình 3D nạp qua SafeGLTFModel, tự động chuyển về Fallback khi lỗi/SSR */}
      <SafeGLTFModel
        url={config.modelUrl}
        fallback={<LuxuryPawnProceduralFallback slotIndex={safeIdx} config={config} />}
        position={[0, 0.03, 0]}
        scale={[1, 1, 1]}
        castShadow
        receiveShadow
      />
    </group>
  );
}
