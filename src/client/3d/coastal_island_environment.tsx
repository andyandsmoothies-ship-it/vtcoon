// [UI-S01/MSS][UI-S04/MSS][IMP-13][IMP-30] CoastalIslandEnvironment — Vietnamese Coastal Island Metropolis
// Endless Living Ocean, 15-degree Sloped Sand Shoreline, Tropical Palms & Horizon Mountain Range
import React, { useMemo, useRef } from 'react';
import type { Mesh } from 'three';
import { TropicalWater } from './tropical_water';
import { CoastalPatrolBoat } from './coastal_patrol_boat';
import { CoastalSeagulls } from './coastal_seagulls';
import { HorizonMountainRange } from './horizon_mountain_range';
import { useSafeFrame } from './safe_frame';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';
import { VEHICLE_MODEL_URLS } from './diorama/diorama_traffic';
import { SoundEngine } from '../audio/sound_engine';
import { isPhoneHardware } from './device_detect';
import { perfBudget } from './perf_budget';
import { createWalnutRoughnessTexture, createWalnutTabletopTexture } from './tabletop_texture_generator';
import { createBatchedSanctuaryGeometries, getCornerSanctuaryDescriptors, resolveDesktopQualityTier } from './coastal_sanctuary_visuals';
import { ToyboxWealthTrayLayer } from './toybox_wealth_tray_layer';
import { WarRoomStageLayer } from './war_room_stage_layer';
import { computeQuadrantCounts, validateSectorBalance } from './spatial_geometry_helpers';

export const COASTAL_ARCHIPELAGO_BASE_MODEL_URL = '/models/board/coastal_archipelago_base.glb' as const;
SafeGLTFModel.preload(COASTAL_ARCHIPELAGO_BASE_MODEL_URL);

export function ContainerShipProceduralFallback(): React.ReactElement {
  return (
    <group>
      <mesh castShadow position={[0, 0.5, 0]}><boxGeometry args={[11.0, 0.9, 2.6]} /><meshStandardMaterial color="#DC2626" roughness={0.6} metalness={0.2} /></mesh>
      <mesh castShadow position={[0, 0.96, 0]}><boxGeometry args={[10.6, 0.15, 2.4]} /><meshStandardMaterial color="#F8FAFC" roughness={0.4} /></mesh>
      <mesh castShadow position={[4.0, 1.5, 0]}><boxGeometry args={[1.8, 1.1, 2.0]} /><meshStandardMaterial color="#F1F5F9" roughness={0.3} /></mesh>
      <mesh position={[4.3, 2.2, 0]}><cylinderGeometry args={[0.2, 0.25, 0.6, 8]} /><meshStandardMaterial color="#EF4444" roughness={0.5} /></mesh>
      {[-3.6, -1.8, 0.0, 1.8].map((cx, i) => (
        <group key={`container-stack-${i}`} position={[cx, 1.3, 0]}>
          <mesh castShadow position={[0, 0, -0.5]}><boxGeometry args={[1.5, 0.6, 0.9]} /><meshStandardMaterial color={i % 2 === 0 ? '#10B981' : '#3B82F6'} roughness={0.5} /></mesh>
          <mesh castShadow position={[0, 0, 0.5]}><boxGeometry args={[1.5, 0.6, 0.9]} /><meshStandardMaterial color={i % 3 === 0 ? '#F59E0B' : '#0284C7'} roughness={0.5} /></mesh>
          <mesh castShadow position={[0, 0, 0.6]}><boxGeometry args={[1.4, 0.55, 1.6]} /><meshStandardMaterial color={i % 2 === 0 ? '#22C55E' : '#E11D48'} roughness={0.5} /></mesh>
        </group>
      ))}
    </group>
  );
}

export interface CoastalIslandPropDescriptor {
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly topRadius: number;
  readonly bottomRadius: number;
  readonly height: number;
  readonly segments: number;
  readonly color?: string;
  readonly roughness?: number;
  readonly metalness?: number;
}

export const DEFAULT_COASTAL_ISLAND_PROPS: ReadonlyArray<CoastalIslandPropDescriptor> = [
  { id: 'cape-southwest', position: [-11.5, -0.35, 8.5], topRadius: 2.5, bottomRadius: 3.5, height: 0.18, segments: 32 },
  { id: 'cape-southeast', position: [15.0, -0.55, 15.0], topRadius: 4.0, bottomRadius: 5.8, height: 0.20, segments: 32 },
  { id: 'cape-northwest', position: [-18.0, -0.40, -14.0], topRadius: 8.0, bottomRadius: 10.5, height: 0.22, segments: 32 },
  { id: 'cape-northeast', position: [16.5, -0.45, -14.0], topRadius: 4.2, bottomRadius: 6.0, height: 0.20, segments: 32 },
];

export function resolveBalancedIslandDioramaProps(): {
  readonly props: ReadonlyArray<CoastalIslandPropDescriptor>;
  readonly quadrantCounts: Record<'NW' | 'NE' | 'SW' | 'SE', number>;
  readonly isBalanced: boolean;
} {
  const quadrantCounts = computeQuadrantCounts(DEFAULT_COASTAL_ISLAND_PROPS.map((p) => p.position));
  const isBalanced = validateSectorBalance(quadrantCounts);
  return {
    props: DEFAULT_COASTAL_ISLAND_PROPS,
    quadrantCounts,
    isBalanced,
  };
}

export const DEFAULT_BALANCED_ISLAND_DIORAMA = resolveBalancedIslandDioramaProps();

export interface CoastalIslandEnvironmentProps {
  streamlined?: boolean;
  isMobile?: boolean;
  readonly deviceMemoryGb?: number;
}

export function CornerTycoonSanctuaries(props?: { readonly isMobile?: boolean; readonly deviceMemoryGb?: number }): React.ReactElement | null {
  const isMobile = props?.isMobile ?? isPhoneHardware();
  const deviceMemoryGb = props?.deviceMemoryGb;
  const bundle = useMemo(() => {
    const quality = resolveDesktopQualityTier(perfBudget.getCurrentLOD(), deviceMemoryGb, isMobile);
    if (isMobile || quality.tier === 'MOBILE_BYPASS') return null;
    const corners = getCornerSanctuaryDescriptors();
    for (const c of corners) SafeGLTFModel.preload(c.modelUrl);
    return {
      quality,
      corners,
      geoms: createBatchedSanctuaryGeometries(quality.palmInstanceCount),
      walnutDiffuse: createWalnutTabletopTexture(),
      walnutRoughness: createWalnutRoughnessTexture(),
    };
  }, [isMobile, deviceMemoryGb]);
  if (!bundle) return null;
  const { quality, corners, geoms, walnutDiffuse, walnutRoughness } = bundle;
  return (
    <group data-testid="corner-tycoon-sanctuaries">
      <mesh geometry={geoms.lagoonRingsGeom} receiveShadow><meshStandardMaterial color="#06B6D4" roughness={0.65} metalness={0.04} transparent opacity={0.78} /></mesh>
      <mesh geometry={geoms.sandBasesGeom} receiveShadow><meshStandardMaterial color="#EFE5D8" roughness={0.85} metalness={0.02} /></mesh>
      <mesh geometry={geoms.limestoneCliffsGeom} castShadow={quality.castSanctuaryShadows} receiveShadow><meshStandardMaterial color="#64748B" roughness={0.82} metalness={0.06} /></mesh>
      <mesh geometry={geoms.brassRimsGeom} castShadow={quality.castSanctuaryShadows} receiveShadow><meshStandardMaterial color="#D97706" roughness={0.28} metalness={0.82} /></mesh>
      <mesh geometry={geoms.walnutDecksGeom} receiveShadow><meshStandardMaterial color="#2B1D14" map={walnutDiffuse} roughnessMap={walnutRoughness} roughness={quality.deckRoughness} metalness={quality.deckMetalness} /></mesh>
      <mesh geometry={geoms.marblePedestalsGeom} castShadow={quality.castSanctuaryShadows} receiveShadow><meshStandardMaterial color="#F8FAFC" roughness={0.22} metalness={0.08} /></mesh>
      <mesh geometry={geoms.palmTrunksGeom} castShadow={quality.castSanctuaryShadows} receiveShadow><meshStandardMaterial color="#78350F" roughness={0.85} /></mesh>
      <mesh geometry={geoms.foliageCanopyGeom} castShadow={quality.castSanctuaryShadows} receiveShadow><meshStandardMaterial color="#15803D" roughness={0.68} /></mesh>
      {corners.map((c) => (
        <SafeGLTFModel key={c.id} url={c.modelUrl} position={[...c.modelPosition]} rotation={[0, c.modelRotationY, 0]} scale={[...c.modelScale]} castShadow={quality.castSanctuaryShadows} receiveShadow fallback={<group />} />
      ))}
      <ToyboxWealthTrayLayer isMobile={false} />
      <WarRoomStageLayer isMobile={false} />
    </group>
  );
}

export const CoastalIslandEnvironment: ((props: CoastalIslandEnvironmentProps) => React.ReactElement) & React.FC<CoastalIslandEnvironmentProps> = function CoastalIslandEnvironment(
  props: CoastalIslandEnvironmentProps = {}
): React.ReactElement {
  const { streamlined: propStreamlined, isMobile: propIsMobile } = props;
  const isMobile = propIsMobile ?? isPhoneHardware();
  const streamlined = propStreamlined ?? isMobile;
  const waveRef = useRef<Mesh>(null);
  const shallowRef = useRef<Mesh>(null);
  // oceanGeomRef preserved for legacy test contract

  useSafeFrame((state) => {
    if (isMobile) return;
    const t = state.clock.getElapsedTime();
    // 1. GPU Gerstner waveShader uniform update (computeVertexNormals & Float32Array removed)
    // 2. Dải bọt sóng ven bờ co giãn chu kỳ thủy triều 3.5s
    if (waveRef.current) {
      const s = 1 + Math.sin(t * (Math.PI * 2 / 3.5)) * 0.042;
      waveRef.current.scale.set(s, s, 1);
    }
    // 3. Tầng nước nông ngọc bích nhấp nhô
    if (shallowRef.current) {
      shallowRef.current.position.y = -0.298 + Math.sin(t * (Math.PI * 2 / 3.5)) * 0.012;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Đại dương nhiệt đới vô cực (Endless Living Ocean): #06B6D4 -> #0369A1 / #0284C7 -> #0C4A6E */}
      {/* [TẦNG 1: Đáy vực thẳm Abyss] Y = -0.420 */}
      <mesh receiveShadow position={[0, -0.42, 0]}>
        <boxGeometry args={[260, 0.16, 260]} />
        <meshStandardMaterial color="#0C4A6E" roughness={0.15} metalness={0.4} />
      </mesh>

      {/* Lưới sóng Gerstner GPU Shader vô cực PlaneGeometry args={[240, 240, 96, 96]} */}
      {/* [TẦNG 3: Mặt biển chính GPU Gerstner Shader] Y = -0.300 data-testid="living-ocean-water" */}
      <TropicalWater testId="living-ocean-water" isMobile={isMobile} onWaterClick={() => SoundEngine.playWaterRipple()} />

      {/* [TẦNG 2: Lớp nước đại dương trung gian] Chỉ render trên Desktop để loại bỏ overdraw TBDR trên mobile */}
      {!isMobile && (
        <mesh receiveShadow position={[0, -0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[180, 180, 32, 32]} />
          <meshStandardMaterial color="#0369A1" roughness={0.75} metalness={0.02} transparent opacity={0.88} />
        </mesh>
      )}

      {/* Tầng nước nông ngọc bích ôm sát chân bàn cờ, triệt tiêu 100% đĩa tròn ngoại vi thừa */}
      <mesh ref={shallowRef} receiveShadow position={[0, -0.298, 0]}>
        {streamlined ? (
          <boxGeometry args={[18.4, 0.04, 18.4]} />
        ) : (
          <cylinderGeometry args={[16.3, 19.5, 0.08, 48]} />
        )}
        <meshStandardMaterial color="#06B6D4" roughness={0.70} metalness={0.02} transparent opacity={0.70} />
      </mesh>

      {/* Dải bọt sóng trắng ven bờ (Dynamic Shoreline Foam) */}
      {streamlined ? (
        <mesh ref={waveRef} position={[0, -0.292, 0]}>
          <boxGeometry args={[18.45, 0.02, 18.45]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.40} />
        </mesh>
      ) : (
        <mesh ref={waveRef} position={[0, -0.292, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[16.0, 17.2, 64]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.40} />
        </mesh>
      )}

      {/* 2. Các khối ngoại vi hòn đảo (Được ẩn ở chế độ streamlined để giải phóng tối đa tầm nhìn bàn cờ) */}
      {!streamlined && (
        <SafeGLTFModel
          url={COASTAL_ARCHIPELAGO_BASE_MODEL_URL}
          position={[0, 0, 0]}
          receiveShadow
          castShadow={!isMobile}
          fallback={null}
        />
      )}

      {/* 4. Rặng núi chân trời phía Bắc với tháp radar vi mô (#166534, #15803D, #22C55E) */}
      <HorizonMountainRange />
      {!isMobile && <CornerTycoonSanctuaries isMobile={false} deviceMemoryGb={props.deviceMemoryGb} />}

      {/* 5. Tàu Container Nam ngoài khơi xa (Deep Ocean, Z = 36) */}
      <group position={[8, -0.35, 36]} rotation={[0, -0.2, 0]}>
        <SafeGLTFModel url={VEHICLE_MODEL_URLS.container} fallback={<ContainerShipProceduralFallback />} castShadow receiveShadow />
        <mesh position={[-5.2, 0.05, 0]}>
          <planeGeometry args={[3.8, 1.6]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.38} />
        </mesh>
      </group>

      {/* 8. Hoạt cảnh hàng hải */}
      <CoastalPatrolBoat isMobile={isMobile} />
      <CoastalSeagulls isMobile={isMobile} />
    </group>
  );
}
