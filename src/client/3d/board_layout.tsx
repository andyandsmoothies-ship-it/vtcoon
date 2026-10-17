// [UI-S01/MSS][IMP-30] GameBoard — 40-tile procedural board layout with terrain-flush Depth Layer Stack
import React, { useCallback, useMemo } from 'react';
import { BOARD_CONFIG, CellType } from '../../domain/board_config';
import { PROPERTY_DEEDS } from '../../domain/property_data';
import { TurnPhase } from '../../domain/room';
import { useGameStore } from '../store/game_store';
import type { PlayerHudInfo } from '../store/game_store_types';
import { useLobbyStore } from '../store/lobby_store';
import { cellPosition } from './board_coords';
import { tileRotation } from './board_layout_math.js';
export { tileRotation };
import { LayeredDioramaTile } from './board_tile';
import { detectPlayerMonopolies, isCellInMonopolyGroup } from './monopoly_plaza_math';
import { MonopolyPlazaFusion } from './monopoly_plaza_fusion';
import { LUXURY_PAWN_CONFIGS } from './luxury_pawn_models';
import { DiceTray } from './dice_tray';
import { InstancedBoardToyBuildings } from './instanced_toy_buildings';
import { BatchedBoardTiles } from './batched_board_tiles';
import { InstancedCellBordersAndTrays } from './instanced_cell_borders_and_trays';
import { MiniatureCityDiorama } from './miniature_city_diorama';
import { CoastalIslandEnvironment } from './coastal_island_environment';
import { CinematicLightingAccents } from './cinematic_effects';
import { ConstructionSlamVFX } from './construction_slam_vfx';
import {
  createWalnutTabletopTexture,
  createWalnutRoughnessTexture,
} from './tabletop_texture_generator';
import { isMobileHardware, isIOSPhone } from './device_detect';
import { useDiagnostic3DStore } from './diagnostic_3d_store';
import { Diagnostic3DPanel } from './diagnostic_3d_panel';
import { InstancedRegionalBuildingsPool } from './instanced_regional_buildings_pool';
import { resolveRenderTierProfile } from './procedural_mobile_blender_meshes';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';

export const BOARD_CHASSIS_MODEL_URL = '/models/board/board_chassis_walnut.glb';

// Depth Layer Stack triệt tiêu Z-Fighting (IMP-30 Terrain Flush & IMP-32 Executive Tabletop Master Plan)
export const WALNUT_TABLE_Y = -0.350;
export const LAGOON_WATER_Y = -0.150;
export const OCEAN_Y = -0.150;
export const SHORELINE_SAND_Y = -0.060;
export const RIVER_BED_Y = -0.060;
export const TERRAIN_BASE_Y = 0.000;
export const TILE_BORDER_Y = 0.012;
export const TILE_SURFACE_Y = 0.018;
export const PAWN_HALO_Y = 0.020;
export const STANDEE_BASE_Y = 0.025;

export const DEPTH_LAYER_STACK = {
  WALNUT_TABLE_Y,
  LAGOON_WATER_Y,
  OCEAN_Y,
  SHORELINE_SAND_Y,
  RIVER_BED_Y,
  TERRAIN_BASE_Y,
  TILE_BORDER_Y,
  TILE_SURFACE_Y,
  PAWN_HALO_Y,
  STANDEE_BASE_Y,
} as const;

const CORNER_INDICES = new Set([0, 10, 20, 30]);


export function computeOwnerMap(
  playersInfo: Record<string, PlayerHudInfo>
): Record<number, { ownerId: string; ownerName: string; tokenColor: string; ownerSlot: number; mascotIcon: string }> {
  const map: Record<number, { ownerId: string; ownerName: string; tokenColor: string; ownerSlot: number; mascotIcon: string }> = {};
  const playersList = Object.values(playersInfo ?? {});
  for (let pIdx = 0; pIdx < playersList.length; pIdx++) {
    const player = playersList[pIdx];
    if (!player) continue;
    const slot = player.ownerSlot ?? player.pawnSlot ?? (pIdx % LUXURY_PAWN_CONFIGS.length);
    const mascot = player.mascotIcon ?? LUXURY_PAWN_CONFIGS[slot]?.icon ?? '🏰';
    const tokenColor = player.tokenColor ?? '#DC2626';
    for (const cellIndex of player.ownedProperties ?? []) {
      map[cellIndex] = {
        ownerId: player.id,
        ownerName: player.name,
        tokenColor,
        ownerSlot: slot,
        mascotIcon: mascot,
      };
    }
  }
  return map;
}

export interface GameBoardProps {
  readonly isMobile?: boolean;
  readonly isIOS?: boolean;
  readonly renderToyBuildings?: boolean;
}

export function GameBoard(props: GameBoardProps): React.ReactElement;
export function GameBoard(): React.ReactElement;
export function GameBoard({
  isMobile: propIsMobile,
  isIOS: propIsIOS,
  renderToyBuildings = false,
}: GameBoardProps = {}): React.ReactElement {
  const storeLevelMap = useGameStore((s) => s.levelMap);
  const levelMap = Object.keys(storeLevelMap ?? {}).length > 0 ? storeLevelMap : (useGameStore.getState()?.levelMap ?? storeLevelMap);
  const openModal = useGameStore((s) => s.openModal);
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const playerPositions = useGameStore((s) => s.playerPositions);
  const storePlayersInfo = useGameStore((s) => s.playersInfo);
  const playersInfo = Object.keys(storePlayersInfo ?? {}).length > 0 ? storePlayersInfo : (useGameStore.getState()?.playersInfo ?? storePlayersInfo);
  const hasRolledThisTurn = useGameStore((s) => s.hasRolledThisTurn);
  const turnPhase = useGameStore((s) => s.turnPhase);
  const localPlayerId = useLobbyStore((s) => s.myPlayerId) || 'p1';
  const isHeatmapActive = useGameStore((s) => s.isHeatmapActive);
  const isMobile = propIsMobile ?? isMobileHardware();
  const isIOS = propIsIOS ?? isIOSPhone();
  const tierProfile = useMemo(() => {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    const deviceMemoryGb = nav && 'deviceMemory' in nav && typeof nav.deviceMemory === 'number' ? nav.deviceMemory : undefined;
    const hardwareConcurrency = nav && typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : undefined;
    return resolveRenderTierProfile({ isMobile, isIOS, deviceMemoryGb, hardwareConcurrency });
  }, [isMobile, isIOS]);

  const storeTableVisible = useDiagnostic3DStore((s) => s.isTableVisible);
  const isTableVisible = useDiagnostic3DStore.getState()?.isTableVisible ?? storeTableVisible;

  const storeCityVisible = useDiagnostic3DStore((s) => s.isCityVisible);
  const isCityVisible = useDiagnostic3DStore.getState()?.isCityVisible ?? storeCityVisible;

  const storeOceanVisible = useDiagnostic3DStore((s) => s.isOceanVisible);
  const isOceanVisible = useDiagnostic3DStore.getState()?.isOceanVisible ?? storeOceanVisible;

  const storeBoardVisible = useDiagnostic3DStore((s) => s.isBoardVisible);
  const isBoardVisible = useDiagnostic3DStore.getState()?.isBoardVisible ?? storeBoardVisible;

  const ownerInfoMap = useMemo(() => computeOwnerMap(playersInfo), [playersInfo]);
  const monopolyGroups = useMemo(() => detectPlayerMonopolies(playersInfo), [playersInfo]);
  const walnutDiffuse = useMemo(() => createWalnutTabletopTexture(), []);
  const walnutRoughness = useMemo(() => createWalnutRoughnessTexture(), []);

  const handleTileClick = useCallback(
    (cellIndex: number) => {
      const cell = BOARD_CONFIG[cellIndex];
      if (!cell || (cell.type !== CellType.Property && cell.type !== CellType.Railroad && cell.type !== CellType.Utility)) {
        return;
      }
      const isOwned = Object.values(playersInfo).some((p) => p.ownedProperties?.includes(cellIndex));
      const isMyTurn = currentTurnPlayerId === localPlayerId;
      const myPos = playerPositions[localPlayerId] ?? 0;
      const isStandingHere = myPos === cellIndex;
      const isBuyOpportunity = Boolean(
        isMyTurn &&
        isStandingHere &&
        !isOwned &&
        (turnPhase === TurnPhase.ActionPhase || (hasRolledThisTurn && turnPhase !== TurnPhase.AuctionPhase && turnPhase !== TurnPhase.InsolvencyPhase))
      );
      openModal('deed', { cellIndex, isBuyOpportunity });
    },
    [openModal, currentTurnPlayerId, localPlayerId, playerPositions, playersInfo, hasRolledThisTurn, turnPhase]
  );

  return (
    <group position={[0, 0, 0]} visible={isTableVisible ? undefined : false}>
      {/* Khung Bàn Gỗ Óc Chó Thượng Lưu (Walnut Tabletop) y = -0.350 */}
      <mesh receiveShadow visible={isTableVisible} position={[0, WALNUT_TABLE_Y, 0]}>
        <boxGeometry args={[19.2, 0.2, 19.2]} />
        <meshStandardMaterial
          map={walnutDiffuse}
          roughnessMap={walnutRoughness}
          color="#2B1D14"
          roughness={0.28}
          metalness={0.05}
        />
      </mesh>

      {/* Mẫu thử nghiệm Khung Bàn Cờ Gỗ Óc Chó Vát Cạnh & Chỉ Đồng Thau Giai đoạn 0 (Executive Board Chassis) */}
      {isTableVisible && (
        <SafeGLTFModel
          url={BOARD_CHASSIS_MODEL_URL}
          position={[0, 0, 0]}
          castShadow
          receiveShadow
          fallback={null}
        />
      )}

      {/* 0. Môi trường Bán đảo Đảo Ngọc nhiệt đới (Ẩn trong chế độ Serene Tabletop để đưa về mặt bàn gỗ VIP) */}
      <group visible={isOceanVisible && isMobile}>
        <CoastalIslandEnvironment
          isMobile={isMobile}
          streamlined={!tierProfile.enableOuterBaySanctuaries}
        />
      </group>

      {/* 0.02. Mặt Bàn Gỗ Óc Chó Thượng Lưu Phòng VIP (Executive VIP Salon Tabletop Plinth) */}
      {isTableVisible && !isMobile && (
        <mesh receiveShadow position={[0, WALNUT_TABLE_Y - 0.005, 0]}>
          <boxGeometry args={[48.0, 0.19, 48.0]} />
          <meshStandardMaterial color="#1C140D" roughness={0.35} metalness={0.05} />
        </mesh>
      )}

      {/* 0.05. Bảng Điều Khiển Chẩn Đoán 3D (Kích hoạt khi có ?debug=3d) */}
      <Diagnostic3DPanel />

      {/* 0.1. Điểm nhấn ánh sáng điện ảnh 3D (Hải đăng, Chóp Landmark C3, Sân vận động) */}
      <CinematicLightingAccents />

      {/* 0.2. Hiệu ứng Va Đập Xây Dựng, Sóng Xung Kích & Pháo Hoa Khánh Thành */}
      <ConstructionSlamVFX />

      {/* 2. Sa bàn đô thị thu nhỏ: Đảo tài chính, cầu vượt, sân vận động & bến du thuyền */}
      <group visible={isCityVisible}>
        <MiniatureCityDiorama isMobile={isMobile} isDesktopLean={!isMobile} isVisible={isCityVisible} />
      </group>

      {/* 3. Sàn diễn xúc xắc 3D thoáng đãng trên Đại Lộ Sài Gòn */}
      <DiceTray hasSunkenArena={!isMobile} />

      <group visible={isBoardVisible}>
        {/* 3.5. Cụm InstancedMesh nhà đồ chơi chỉ render khi yêu cầu tường minh (mặc định tắt để nhường cho ProceduralBuilding) */}
        {renderToyBuildings && <InstancedBoardToyBuildings levelMap={levelMap} />}

        {/* 3.6. Cụm InstancedCellBordersAndTrays: 28 viền chân đế ô đất và khay giá tiền O(1) */}
        <InstancedCellBordersAndTrays
          ownerInfoMap={ownerInfoMap}
          monopolyGroups={monopolyGroups}
          isHeatmapActive={isHeatmapActive}
        />

        {/* 3.8. Cụm BatchedBoardTiles gộp 40 bề mặt và đế ô cờ vào 3 draw calls (IMP-363) */}
        <BatchedBoardTiles
          isMobile={isMobile}
          onTileClick={handleTileClick}
        />

        {/* 3.9. Cụm InstancedRegionalBuildingsPool gom 22 công trình vùng miền C1-C2 trên Mobile (IMP-404) */}
        <InstancedRegionalBuildingsPool levelMap={levelMap} isMobile={isMobile} isIOS={isIOS} />

        {/* 4. 40 ô đất liền mạch khép kín tiếp giáp mặt nền phẳng (render động các lớp trang trí) */}
        {BOARD_CONFIG.map((cell) => {
          const cellLevel = (levelMap[cell.index] ?? 0) as 0 | 1 | 2 | 3;
          return (
            <LayeredDioramaTile
              key={cell.index}
              cell={cell}
              position={cellPosition(cell.index)}
              rotation={tileRotation(cell.index)}
              currentLevel={cellLevel}
              isCornerTile={CORNER_INDICES.has(cell.index)}
              enableStandee={false}
              ownerColor={ownerInfoMap[cell.index]?.tokenColor}
              ownerSlot={ownerInfoMap[cell.index]?.ownerSlot}
              mascotIcon={ownerInfoMap[cell.index]?.mascotIcon}
              onClick={undefined}
              isHeatmapActive={isHeatmapActive}
              isMonopolyGroup={isCellInMonopolyGroup(cell.index, monopolyGroups)}
              isMobile={isMobile}
              renderToyBuildings={false}
              renderBasePlinth={false}
              renderAtlasSurface={false}
              renderOwnerBorders={false}
              renderPricePillTray={false}
              renderPricePill={false}
              renderProceduralBuilding={tierProfile.buildingRenderMode !== 'INSTANCED_POOL_VERTEX_AO' || (cellLevel !== 1 && cellLevel !== 2)}
            />
          );
        })}

        {/* 5. Dải cờ hoa vỉa hè cho các cụm độc quyền Monopoly Plaza */}
        <MonopolyPlazaFusion
          monopolyGroups={monopolyGroups}
          isHeatmapActive={isHeatmapActive}
          isMobile={tierProfile.monopolyArchwayMode === 'INSTANCED_POOL_SINGLE_MAT'}
          enableMobileInstancedPool={tierProfile.monopolyArchwayMode === 'INSTANCED_POOL_SINGLE_MAT'}
        />
      </group>
    </group>
  );
}
