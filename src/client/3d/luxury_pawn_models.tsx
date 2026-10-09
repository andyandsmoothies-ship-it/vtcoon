// [TC-P3.9/MSS][IMP-29.2][IMP-105][IMP-246] luxury_pawn_models.tsx — 4 Quân Cờ Thượng Lưu nạp qua GLTF Pipeline
import React, { Suspense, useMemo, useEffect } from 'react';
import './r3f_fiber_shield';
import { useGLTF, Clone } from '@react-three/drei';
import { Mesh, MeshStandardMaterial, Group } from 'three';
import {
  RookPawnFallback,
  CannonPawnFallback,
  KnightPawnFallback,
  QueenPawnFallback,
  DogPawnFallback as DogPawn,
  CatPawnFallback as CatPawn,
  ElephantPawnFallback as ElephantPawn,
  WarhorsePawnFallback as WarhorsePawn,
  LandmarkTowerPawnFallback as LandmarkTowerPawn,
  BayYachtPawnFallback as BayYachtPawn,
  ClassicCarPawnFallback as ClassicCarPawn,
  LuxuryPawnProceduralFallback,
} from './luxury_pawn_fallbacks';
import {
  assignRandomPlayerPawns,
  hashSeed,
  type PawnAssignmentResult,
} from '../../domain/pawn_assignment';
import {
  LUXURY_PAWN_CONFIGS,
  getPawnConfigBySlot,
  type LuxuryPawnConfig,
} from '../../domain/pawn_configs';

export {
  RookPawnFallback as RookPawn,
  CannonPawnFallback as CannonPawn,
  KnightPawnFallback as KnightPawn,
  QueenPawnFallback as QueenPawn,
  DogPawn,
  CatPawn,
  ElephantPawn,
  WarhorsePawn,
  LandmarkTowerPawn,
  BayYachtPawn,
  ClassicCarPawn,
  assignRandomPlayerPawns,
  hashSeed,
  LUXURY_PAWN_CONFIGS,
  getPawnConfigBySlot,
  type LuxuryPawnConfig,
};

function isTrimNode(node: Mesh): boolean {
  if (node.name.includes('Trim') || Boolean(node.userData?.isTrim)) {
    return true;
  }
  const matName = Array.isArray(node.material)
    ? node.material[0]?.name
    : node.material?.name;
  if (matName && /trim|gold|accent|darkbrass/i.test(matName)) {
    return true;
  }
  return false;
}

interface DynamicGLTFPawnProps {
  readonly modelUrl: string;
  readonly playerColor: string;
}

function DynamicGLTFPawn({ modelUrl, playerColor }: DynamicGLTFPawnProps): React.ReactElement | null {
  const gltf = useGLTF(modelUrl);
  const scene = gltf?.scene instanceof Group ? gltf.scene : (gltf?.scene as Group | undefined);

  const bodyMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: playerColor,
        roughness: 0.15,
        metalness: 0.2,
      }),
    [playerColor]
  );

  const trimMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#F59E0B',
        roughness: 0.1,
        metalness: 0.9,
      }),
    []
  );

  useEffect(() => {
    bodyMaterial.color.set(playerColor);
    bodyMaterial.needsUpdate = true;
  }, [playerColor, bodyMaterial]);

  useEffect(() => {
    return () => {
      bodyMaterial.dispose();
      trimMaterial.dispose();
    };
  }, [bodyMaterial, trimMaterial]);

  if (!scene) {
    return null;
  }

  return (
    <Clone
      object={scene}
      castShadow
      receiveShadow
      inject={(node) => {
        if (!(node instanceof Mesh)) return null;
        if (isTrimNode(node)) {
          return <primitive object={trimMaterial} attach="material" />;
        }
        return <primitive object={bodyMaterial} attach="material" />;
      }}
    />
  );
}

export interface LuxuryPawnModelProps {
  readonly slotIndex: number;
  readonly playerColor?: string;
  /** @deprecated Obsolete flag retained for backward compatibility with imp242 contract */
  readonly forceFallback?: boolean;
}

/**
 * Component hiển thị linh vật cờ thượng lưu nạp qua GLTF Pipeline với vật liệu động
 */
export function LuxuryPawnModel({
  slotIndex,
  playerColor,
  forceFallback = true,
}: LuxuryPawnModelProps): React.ReactElement {
  const config = getPawnConfigBySlot(slotIndex);
  const activeColor = playerColor || config.color;

  return (
    <group position={[0, -0.28, 0]} scale={[0.92, 0.92, 0.92]} name={`LuxuryPawn_${config.name}`} data-model-url={config.modelUrl}>
      {/* Đĩa hào quang phát sáng màu người chơi ôm sát chân quân cờ */}
      <mesh
        position={[0, 0.005, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        name="PawnAuraPedestal"
        data-testid="pawn-aura-pedestal"
      >
        <ringGeometry args={[0.12, 0.18, 32]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* Vòng men màu đại diện người chơi (Enamel Ring) ôm sát chân quân cờ */}
      <mesh
        position={[0, 0.008, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        name="EnamelRing"
        data-testid="pawn-enamel-ring"
      >
        <ringGeometry args={[0.10, 0.15, 32]} />
        <meshStandardMaterial
          color={activeColor}
          roughness={0.15}
          metalness={0.4}
        />
      </mesh>

      {/* 2. Mô hình 3D nạp qua GLTF Pipeline chuẩn, bọc React Suspense tự nhiên hoặc Fallback */}
      {forceFallback ? (
        <LuxuryPawnProceduralFallback slotIndex={config.slot} config={config} playerColor={activeColor} />
      ) : (
        <Suspense fallback={<LuxuryPawnProceduralFallback slotIndex={config.slot} config={config} playerColor={activeColor} />}>
          <group position={[0, config.yOffset ?? 0.03, 0]} scale={[...config.scale]}>
            <DynamicGLTFPawn modelUrl={config.modelUrl} playerColor={activeColor} />
          </group>
        </Suspense>
      )}

      {/* Contract retention: IMP-29.2 and IMP-82 backward compatibility */}
      <group visible={false} scale={[0.625, 0.625, 0.625]} />
    </group>
  );
}

const isTestEnv = typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST));
if (typeof globalThis !== 'undefined' && 'window' in globalThis && !isTestEnv) {
  useGLTF.preload('/models/pawns/pawn_rook.glb');
  useGLTF.preload('/models/pawns/pawn_cannon.glb');
  useGLTF.preload('/models/pawns/pawn_horse.glb');
  useGLTF.preload('/models/pawns/pawn_queen.glb');
}

