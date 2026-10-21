// [UI-S02/MSS] MiniatureCityDiorama — Unified Sculpted Tabletop Diorama Root Coordinator
// Assembles terrain, iconic bridges, modern stadium, marina, skyline & micro-life
import React, { useEffect, useRef } from 'react';
import { Color, type Group, InstancedMesh, Object3D } from 'three';
import { DioramaTerrain } from './diorama/diorama_terrain';
import { DioramaBridges } from './diorama/diorama_bridges';
import { DioramaCivicCenter } from './diorama/diorama_civic_center';
import { DioramaWaterfrontPark } from './diorama/diorama_waterfront_park';
import { DioramaContainerPort } from './diorama/diorama_container_port';
import { DioramaMarina } from './diorama/diorama_marina';
import { DioramaHarborCruiser } from './diorama/diorama_harbor_cruiser';
import { DioramaSkyline } from './diorama/diorama_skyline';
import { DioramaHeritageDistrict } from './diorama/diorama_heritage_district';
import { DioramaMicroLife } from './diorama/diorama_microlife';
import { DioramaTraffic } from './diorama/diorama_traffic';
import { DioramaShophouseBlocks } from './diorama/diorama_shophouse_blocks';
import { DioramaHighriseBlocks } from './diorama/diorama_highrise_blocks';
import { DioramaResidentialPool } from './diorama/diorama_residential_pool';
import { DioramaModelRailroad, DioramaWaterfrontStation, DioramaLandmarkNorthStation, DioramaTropicalFlora } from './diorama/diorama_railroad';
export { DioramaModelRailroad, DioramaWaterfrontStation, DioramaLandmarkNorthStation, DioramaTropicalFlora };
import { isMobileDevice } from './device_detect';
import { getCentralMonumentLODDescriptor } from './diorama/diorama_lod_helpers';
import { URBAN_TREES, getBatchedBoardRimGeometries, disposeDioramaStaticBlenderBatches } from './diorama/diorama_static_blender_batches';
import { DioramaChainReaction } from './diorama_chain_reaction';
import { createDongSonPlazaTexture } from './tabletop_texture_generator';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';
import { LivingTabletopDiorama } from './living_tabletop_diorama';
import { TABLETOP_DIORAMA_GLB_URL } from './living_tabletop_diorama_visuals';

export const SUNKEN_ARENA_MODEL_URL = '/models/board/sunken_velvet_dice_arena.glb';
export const BRIDGE_PLAZAS_MODEL_URL = '/models/board/bridge_landing_plazas.glb';
export const INDOCHINE_BIOME_MODEL_URL = '/models/board/indochine_botanical_biome.glb';
export const INDOCHINE_MASTER_LANDSCAPE_URL = '/models/board/indochine_master_landscape.glb';
export const TABLETOP_DIORAMA_MODEL_URL = TABLETOP_DIORAMA_GLB_URL;
export const DICE_ARENA_PLINTH_URL = '/models/board/dice_arena_plinth.glb';
export const LANDMARKS_CLUSTER_URL = '/models/board/landmarks_cluster.glb';
export const BOARD_TERRAIN_BASE_URL = '/models/board/board_terrain_base.glb';

export interface CentralMonumentPlazaProps {
  readonly isMobile?: boolean;
  readonly isDesktopLean?: boolean;
}

export function CentralMonumentPlaza({ isMobile = false, isDesktopLean = false }: CentralMonumentPlazaProps = {}): React.ReactElement {
  if (isDesktopLean) {
    const dongSonTexture = createDongSonPlazaTexture();
    return (
      <group position={[0, 0.02, 0]} data-testid="central-monument-plaza">
        <SafeGLTFModel url={SUNKEN_ARENA_MODEL_URL} position={[0, 0, 0]} receiveShadow forceFallback fallback={
            <>
              {/* 1. Đài bệ đá phiến hoa cương tròn neo vững chân đế sa bàn */}
              <mesh receiveShadow position={[0, 0.008, 0]}>
                <cylinderGeometry args={[1.52, 1.58, 0.015, 48]} />
                <meshStandardMaterial color="#334155" roughness={0.45} metalness={0.1} />
              </mesh>
              {/* 2. Đĩa Khảm Trống Đồng PBR phẳng lặng */}
              <mesh receiveShadow position={[0, 0.015, 0]}>
                <cylinderGeometry args={[1.38, 1.44, 0.03, 48]} />
                <meshStandardMaterial color={dongSonTexture ? '#FFFFFF' : '#8C6239'} metalness={0.85} roughness={0.24} map={dongSonTexture ?? undefined} />
              </mesh>
              {/* 3. Vành khuyên đồng thau bo viền ngoài (không che mặt đĩa) */}
              <mesh receiveShadow position={[0, 0.0305, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.38, 1.44, 48]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.2} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-2} />
              </mesh>
            </>
          }
        />
      </group>
    );
  }

  const desc = getCentralMonumentLODDescriptor(isMobile);
  if (desc.isMobile) {
    return (
      <group position={[0, 0.02, 0]} data-testid="central-monument-plaza">
        <mesh receiveShadow position={desc.plinth.position}>
          <cylinderGeometry args={[desc.plinth.radiusTop, desc.plinth.radiusBottom, desc.plinth.height, 24]} />
          <meshStandardMaterial color={desc.plinth.color} roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh receiveShadow position={desc.spire.position}>
          <cylinderGeometry args={[desc.spire.radiusTop, desc.spire.radiusBottom, desc.spire.height, 16]} />
          <meshStandardMaterial color={desc.spire.color} metalness={0.85} roughness={0.18} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[0, 0.02, 0]} data-testid="central-monument-plaza">
      {/* 1. Bệ đá cẩm thạch vòng ngoài */}
      <mesh receiveShadow position={[0, 0.01, 0]}>
        <cylinderGeometry args={[1.15, 1.25, 0.04, 32]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
      </mesh>

      {/* 2. Tầng đài phun nước bằng đá cẩm thạch trắng */}
      <mesh receiveShadow position={[0, 0.035, 0]}>
        <cylinderGeometry args={[0.95, 1.05, 0.03, 32]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
      </mesh>

      {/* 3. Lòng hồ nước biếc ngọc lam đài phun nước */}
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.015, 32]} />
        <meshStandardMaterial color="#0EA5E9" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* 4. Thềm đá cẩm thạch trung tâm */}
      <mesh receiveShadow position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.5, 0.55, 0.03, 32]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
      </mesh>

      {/* 5. Tượng đài trung tâm vươn cao */}
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.24, 16]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 0.26, 16]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.85} roughness={0.18} />
      </mesh>

      <mesh castShadow position={[0, 0.54, 0]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  );
}

export function DioramaBoardRim({ isMobile = false }: { readonly isMobile?: boolean } = {}): React.ReactElement {
  if (isMobile) {
    const { walnutRimGeom, brassTrimGeom } = getBatchedBoardRimGeometries();
    return (
      <group position={[0, -0.08, 0]} data-testid="diorama-board-rim">
        <mesh geometry={walnutRimGeom} receiveShadow>
          <meshStandardMaterial color="#78350F" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh geometry={brassTrimGeom} receiveShadow>
          <meshStandardMaterial color="#D97706" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
    );
  }
  return (
    <group position={[0, -0.08, 0]} data-testid="diorama-board-rim">
      {/* Khung viền 4 cạnh gỗ óc chó rỗng ruột ghép mộng chìm (butt-joint), 0% chồng lấn góc */}
      <mesh receiveShadow position={[0, 0, -8.9]}>
        <boxGeometry args={[17.2, 0.06, 0.6]} />
        <meshStandardMaterial color="#78350F" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh receiveShadow position={[0, 0, 8.9]}>
        <boxGeometry args={[17.2, 0.06, 0.6]} />
        <meshStandardMaterial color="#78350F" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh receiveShadow position={[-8.9, 0, 0]}>
        <boxGeometry args={[0.6, 0.06, 18.4]} />
        <meshStandardMaterial color="#78350F" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh receiveShadow position={[8.9, 0, 0]}>
        <boxGeometry args={[0.6, 0.06, 18.4]} />
        <meshStandardMaterial color="#78350F" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* Gờ viền trang trí bo cạnh hoàng kim đồng thau ghép mộng chìm flush mép ngoài [-9.22, +9.22] */}
      <mesh receiveShadow position={[0, 0.032, -9.145]}>
        <boxGeometry args={[18.44, 0.01, 0.15]} />
        <meshStandardMaterial color="#D97706" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh receiveShadow position={[0, 0.032, 9.145]}>
        <boxGeometry args={[18.44, 0.01, 0.15]} />
        <meshStandardMaterial color="#D97706" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh receiveShadow position={[-9.145, 0.032, 0]}>
        <boxGeometry args={[0.15, 0.01, 18.14]} />
        <meshStandardMaterial color="#D97706" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh receiveShadow position={[9.145, 0.032, 0]}>
        <boxGeometry args={[0.15, 0.01, 18.14]} />
        <meshStandardMaterial color="#D97706" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

export function DioramaPedestrianPromenades({ isMobile = false }: { readonly isMobile?: boolean } = {}): React.ReactElement {
  return (
    <group position={[0, 0, 0]} data-testid="diorama-pedestrian-promenades">
      {/* 1. Lối đi bộ lát đá hoa cương kết nối Quảng trường với Đại lộ & Phân khu Di sản */}
      {[-1.8, 1.8].map((px) => (
        <group key={`promenade-lane-${px}`} position={[px, 0.022, 0]}>
          <mesh receiveShadow position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.005, 4.2]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
          </mesh>
          <mesh receiveShadow position={[-0.26, 0, 0]}>
            <boxGeometry args={[0.04, 0.006, 4.2]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.4} />
          </mesh>
          <mesh receiveShadow position={[0.26, 0, 0]}>
            <boxGeometry args={[0.04, 0.006, 4.2]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* 2. Mảng tiểu cảnh bồn hoa và cây xanh công viên dọc hành lang đi bộ */}
      {!isMobile &&
        [-1.5, 1.5].map((pz) => (
          <group key={`park-planter-${pz}`} position={[-2.4, 0.025, pz]}>
            <mesh receiveShadow position={[0, 0.01, 0]}>
              <boxGeometry args={[0.4, 0.02, 0.8]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.4} />
            </mesh>
            <mesh receiveShadow position={[0, 0.022, 0]}>
              <boxGeometry args={[0.34, 0.008, 0.74]} />
              <meshStandardMaterial color="#F43F5E" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.045, 0]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial color="#10B981" roughness={0.7} />
            </mesh>
          </group>
        ))}

      {/* 3. Ghế đá / ghế gỗ nghỉ chân cho cư dân sa bàn dọc tuyến đi dạo */}
      {!isMobile &&
        [-1.0, 0, 1.0].map((bz) => (
          <group key={`promenade-bench-${bz}`} position={[-1.4, 0.025, bz]}>
            <mesh receiveShadow position={[0, 0.02, 0]}>
              <boxGeometry args={[0.12, 0.015, 0.35]} />
              <meshStandardMaterial color="#78350F" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.01, -0.12]}>
              <boxGeometry args={[0.10, 0.02, 0.03]} />
              <meshStandardMaterial color="#64748B" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.01, 0.12]}>
              <boxGeometry args={[0.10, 0.02, 0.03]} />
              <meshStandardMaterial color="#64748B" roughness={0.5} />
            </mesh>
          </group>
        ))}
    </group>
  );
}

export interface DioramaUrbanCanopyProps {
  readonly isMobile?: boolean;
  readonly isSereneTabletop?: boolean;
}

export function DioramaUrbanCanopy({ isMobile = false, isSereneTabletop = false }: DioramaUrbanCanopyProps = {}): React.ReactElement {
  const trunkRef = useRef<InstancedMesh>(null);
  const lowerCanopyRef = useRef<InstancedMesh>(null);
  const upperCanopyRef = useRef<InstancedMesh>(null);

  useEffect(() => {
    const dummy = new Object3D();
    const color = new Color();

    URBAN_TREES.forEach((tree, i) => {
      // 1. Thân cây gỗ tự nhiên
      dummy.position.set(tree.x, tree.height * 0.4, tree.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      trunkRef.current?.setMatrixAt(i, dummy.matrix);

      // 2. Tầng tán dưới
      dummy.position.set(tree.x, tree.height * 0.85, tree.z);
      const sLower = tree.radius / 0.15;
      dummy.scale.set(sLower, sLower, sLower);
      dummy.updateMatrix();
      lowerCanopyRef.current?.setMatrixAt(i, dummy.matrix);
      color.set(tree.color);
      lowerCanopyRef.current?.setColorAt(i, color);

      // 3. Tầng tán trên đan xen đa tầng
      dummy.position.set(tree.x, tree.height * 1.08, tree.z);
      const sUpper = (tree.radius * 0.75) / 0.11;
      dummy.scale.set(sUpper, sUpper, sUpper);
      dummy.updateMatrix();
      upperCanopyRef.current?.setMatrixAt(i, dummy.matrix);
      upperCanopyRef.current?.setColorAt(i, color);
    });

    if (trunkRef.current) trunkRef.current.instanceMatrix.needsUpdate = true;
    if (lowerCanopyRef.current) {
      lowerCanopyRef.current.instanceMatrix.needsUpdate = true;
      if (lowerCanopyRef.current.instanceColor) lowerCanopyRef.current.instanceColor.needsUpdate = true;
    }
    if (upperCanopyRef.current) {
      upperCanopyRef.current.instanceMatrix.needsUpdate = true;
      if (upperCanopyRef.current.instanceColor) upperCanopyRef.current.instanceColor.needsUpdate = true;
    }
  }, []);

  return (
    <group position={[0, 0.02, 0]} data-testid="diorama-urban-canopy">
      {isSereneTabletop ? (
        <SafeGLTFModel url={INDOCHINE_BIOME_MODEL_URL} position={[0, 0, 0]} castShadow={!isMobile} receiveShadow visible={false} forceFallback fallback={<></>} />
      ) : (
        <>
          <instancedMesh ref={trunkRef} args={[undefined, undefined, URBAN_TREES.length]} castShadow={!isMobile} receiveShadow>
            <cylinderGeometry args={[0.025, 0.04, 0.24, 8]} />
            <meshStandardMaterial color="#78350F" roughness={0.8} />
          </instancedMesh>
          <instancedMesh ref={lowerCanopyRef} args={[undefined, undefined, URBAN_TREES.length]} castShadow={!isMobile}>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#15803D" roughness={0.65} />
          </instancedMesh>
          <instancedMesh ref={upperCanopyRef} args={[undefined, undefined, URBAN_TREES.length]} castShadow={!isMobile}>
            <sphereGeometry args={[0.11, 10, 10]} />
            <meshStandardMaterial color="#15803D" roughness={0.6} />
          </instancedMesh>
        </>
      )}
    </group>
  );
}

export interface MiniatureCityDioramaProps {
  readonly isMobile?: boolean;
  readonly isVisible?: boolean;
  readonly isDesktopLean?: boolean;
}

export function MiniatureCityDiorama({ isMobile: propIsMobile, isVisible = true, isDesktopLean = false }: MiniatureCityDioramaProps = {}): React.ReactElement {
  const isMobile = propIsMobile ?? isMobileDevice();
  const isSerene = isDesktopLean || isMobile;
  const landmarkGroupRefs = useRef<Array<Group | null>>([]);
  return (
    <group position={[0, 0, 0]} data-testid="miniature-city-diorama">
      <DioramaBoardRim isMobile={isMobile} />
      <group name="ChainLandmark_metro-line-station" ref={(el) => { landmarkGroupRefs.current[1] = el; }}>
        {!isSerene && <DioramaModelRailroad isMobile={isMobile} isVisible={isVisible} />}
      </group>
      {!isSerene && <DioramaWaterfrontStation />}
      {!isSerene && <DioramaLandmarkNorthStation />}
      {!isSerene && <DioramaTropicalFlora />}
      <group visible={!isSerene}>
        <DioramaTerrain isSereneTabletop={isSerene} mossPalette={false} />
        <CentralMonumentPlaza isMobile={isMobile} isDesktopLean={isSerene} />
        <DioramaPedestrianPromenades isMobile={isMobile} />
      </group>
      <DioramaUrbanCanopy isMobile={isMobile} isSereneTabletop={isSerene} />
      {/* Sa bàn 3D Sống Động (Draco Compressed Blender 5.2.2 LTS + Action_Metro_Loop + Action_Cruisers_Bobbing) */}
      {isSerene && <LivingTabletopDiorama isMobile={isMobile} />}
      {/* Sa bàn Đông Dương Thượng Lưu (Master Landscape Sculpt & Modular Sub-Assemblies) */}
      {isDesktopLean && (
        <SafeGLTFModel url={INDOCHINE_MASTER_LANDSCAPE_URL} position={[0, 0, 0]} receiveShadow visible={false} forceFallback fallback={null} />
      )}
      {/* Bệ đá cẩm thạch ngà tiếp đất 4 mố cầu (Bridge Landing Plazas) */}
      <SafeGLTFModel url={BRIDGE_PLAZAS_MODEL_URL} position={[0, 0, 0]} receiveShadow forceFallback fallback={null} visible={!isSerene} />
      <group name="ChainLandmark_bason-bridge" ref={(el) => { landmarkGroupRefs.current[3] = el; }}>
        <group visible={!isSerene}>
          <DioramaBridges isMobile={isMobile} isVisible={isVisible} isDesktopLean={isSerene} />
        </group>
      </group>
      {!isSerene && <DioramaCivicCenter />}
      {!isSerene && <DioramaWaterfrontPark />}
      {!isSerene && <DioramaContainerPort isMobile={isMobile} isVisible={isVisible} />}
      {!isSerene && <DioramaMarina isMobile={isMobile} isVisible={isVisible} />}
      <group name="ChainLandmark_saigon-river-cruiser" ref={(el) => { landmarkGroupRefs.current[0] = el; }}>
        <group visible={!isSerene}>
          {!isMobile && <DioramaHarborCruiser isMobile={isMobile} isVisible={isVisible} isMoored={isDesktopLean} />}
        </group>
      </group>
      <group name="ChainLandmark_bitexco-tower" ref={(el) => { landmarkGroupRefs.current[2] = el; }}>
        <group visible={!isSerene}>
          <DioramaSkyline isMobile={isMobile} isVisible={isVisible} />
        </group>
      </group>
      {!isSerene && <DioramaHighriseBlocks />}
      {!isSerene && <DioramaResidentialPool />}
      <group name="ChainLandmark_notre-dame-cathedral" ref={(el) => { landmarkGroupRefs.current[4] = el; }}>
        <group visible={!isSerene}>
          <DioramaHeritageDistrict isMobile={isMobile} isDesktopLean={isSerene} />
        </group>
      </group>
      {!isSerene && <DioramaShophouseBlocks />}
      {!isSerene && <DioramaMicroLife isMobile={isMobile} isVisible={isVisible} />}
      {!isSerene && <DioramaTraffic isMobile={isMobile} isVisible={isVisible} />}
      {!isMobile && <DioramaChainReaction isMobile={isMobile} isVisible={isVisible} landmarkGroupRefs={landmarkGroupRefs} />}
    </group>
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    disposeDioramaStaticBlenderBatches();
  });
}
