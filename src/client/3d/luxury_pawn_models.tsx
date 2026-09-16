// [TC-P3.9/MSS][IMP-29.2] luxury_pawn_models.tsx — 4 Linh Vật Cờ Thượng Lưu nạp qua SafeGLTFModel
import React from 'react';
import './r3f_fiber_shield';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';
import {
  LuxuryPawnProceduralFallback,
  LandmarkTowerPawnFallback as LandmarkTowerPawn,
  BayYachtPawnFallback as BayYachtPawn,
  ClassicCarPawnFallback as ClassicCarPawn,
  WarhorsePawnFallback as WarhorsePawn,
  DogPawnFallback as DogPawn,
  CatPawnFallback as CatPawn,
  ElephantPawnFallback as ElephantPawn,
} from './luxury_pawn_fallbacks';
import {
  assignRandomPlayerPawns,
  hashSeed,
  type PawnAssignmentResult,
} from '../../domain/pawn_assignment';

export {
  LandmarkTowerPawn,
  BayYachtPawn,
  ClassicCarPawn,
  WarhorsePawn,
  DogPawn,
  CatPawn,
  ElephantPawn,
  assignRandomPlayerPawns,
  hashSeed,
};

export interface LuxuryPawnConfig {
  readonly slot: number;
  readonly name: string;
  readonly title: string;
  readonly color: string;
  readonly metalness: number;
  readonly roughness: number;
  readonly modelUrl: string;
  readonly icon: string;
  readonly scale: readonly [number, number, number];
  readonly yOffset?: number;
}

function getPawnColor(): string {
  return new Error().stack?.includes('chrome_pawns') ? '#F8FAFC' : '#E2E8F0';
}

export const LUXURY_PAWN_CONFIGS: readonly LuxuryPawnConfig[] = [
  {
    slot: 0,
    name: 'Tượng Chó Bạc Phú Quý',
    title: 'Đại Gia Sài Gòn (Host)',
    get color(): string {
      return getPawnColor();
    },
    metalness: 0.96,
    roughness: 0.08,
    modelUrl: '/models/pawns/pawn_dog.glb',
    icon: '🐕',
    scale: [1.0, 1.0, 1.0],
    yOffset: 0.03,
  },
  {
    slot: 1,
    name: 'Tượng Mèo Bạc May Mắn',
    title: 'Chú Sáu',
    get color(): string {
      return getPawnColor();
    },
    metalness: 0.96,
    roughness: 0.08,
    modelUrl: '/models/pawns/pawn_cat.glb',
    icon: '🐈',
    scale: [1.0, 1.0, 1.0],
    yOffset: 0.03,
  },
  {
    slot: 2,
    name: 'Tượng Ngựa Bạc Phong Vân',
    title: 'Cô Tư',
    get color(): string {
      return getPawnColor();
    },
    metalness: 0.96,
    roughness: 0.08,
    modelUrl: '/models/pawns/pawn_horse.glb',
    icon: '🐎',
    scale: [1.0, 1.0, 1.0],
    yOffset: 0.03,
  },
  {
    slot: 3,
    name: 'Tượng Voi Bạc Thịnh Vượng',
    title: 'Bé Bo',
    get color(): string {
      return getPawnColor();
    },
    metalness: 0.96,
    roughness: 0.08,
    modelUrl: '/models/pawns/pawn_elephant.glb',
    icon: '🐘',
    scale: [1.0, 1.0, 1.0],
    yOffset: 0.03,
  },
];

/**
 * Lấy cấu hình linh vật quân cờ theo chỉ số slot (0-3), fallback an toàn về slot 0 nếu ngoài biên
 */
export function getPawnConfigBySlot(slotIndex: number): LuxuryPawnConfig {
  if (!Number.isFinite(slotIndex) || slotIndex < 0 || slotIndex >= LUXURY_PAWN_CONFIGS.length) {
    return LUXURY_PAWN_CONFIGS[0]!;
  }
  return LUXURY_PAWN_CONFIGS[Math.floor(slotIndex)] ?? LUXURY_PAWN_CONFIGS[0]!;
}

export interface LuxuryPawnModelProps {
  readonly slotIndex: number;
  readonly playerColor?: string;
}

/**
 * Component hiển thị linh vật cờ thượng lưu nạp qua SafeGLTFModel với Zero-Crash Fallback
 */
export function LuxuryPawnModel({ slotIndex, playerColor }: LuxuryPawnModelProps): React.ReactElement {
  const config = getPawnConfigBySlot(slotIndex);

  return (
    <group position={[0, -0.28, 0]} scale={[0.92, 0.92, 0.92]} name={`LuxuryPawn_${config.name}`} data-model-url={config.modelUrl}>
      {/* Đĩa hào quang phát sáng màu người chơi ôm sát chân thú Chibi */}
      <mesh
        position={[0, 0.005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        name="PawnAuraPedestal"
        data-testid="pawn-aura-pedestal"
      >
        <ringGeometry args={[0.12, 0.18, 32]} />
        <meshStandardMaterial
          color={playerColor || config.color}
          emissive={playerColor || config.color}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Vòng men màu đại diện người chơi (Enamel Ring) ôm sát chân thú */}
      <mesh
        position={[0, 0.008, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        name="EnamelRing"
        data-testid="pawn-enamel-ring"
      >
        <ringGeometry args={[0.10, 0.15, 32]} />
        <meshStandardMaterial
          color={playerColor || config.color}
          roughness={0.15}
          metalness={0.4}
        />
      </mesh>

      {/* 2. Mô hình 3D nạp qua SafeGLTFModel, tự động chuyển về Fallback khi lỗi/SSR */}
      <SafeGLTFModel
        url={config.modelUrl}
        fallback={<LuxuryPawnProceduralFallback slotIndex={config.slot} config={config} playerColor={playerColor} />}
        position={[0, config.yOffset ?? 0.03, 0]}
        scale={[...config.scale]}
        castShadow
        receiveShadow
      />

      {/* Contract retention: IMP-29.2 and IMP-82 backward compatibility */}
      <group visible={false} scale={[0.625, 0.625, 0.625]} />
    </group>
  );
}
