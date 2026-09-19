// [UI-S01/MSS][IMP-30] GameBoard — 40-tile procedural board layout with terrain-flush Depth Layer Stack
import React, { useCallback, useMemo } from 'react';
import { BOARD_CONFIG, CellType } from '../../domain/board_config';
import { useGameStore } from '../store/game_store';
import type { PlayerHudInfo } from '../store/game_store_types';
import { useLobbyStore } from '../store/lobby_store';
import { cellPosition } from './board_coords';
import { LayeredDioramaTile } from './board_tile';
import { detectPlayerMonopolies, isCellInMonopolyGroup } from './monopoly_plaza_math';
import { MonopolyPlazaFusion } from './monopoly_plaza_fusion';
import { LUXURY_PAWN_CONFIGS } from './luxury_pawn_models';
import { DiceTray } from './dice_tray';
import { MiniatureCityDiorama } from './miniature_city_diorama';
import { CoastalIslandEnvironment } from './coastal_island_environment';
import { CinematicLightingAccents } from './cinematic_effects';
import { ConstructionSlamVFX } from './construction_slam_vfx';
import {
  createWalnutTabletopTexture,
  createWalnutRoughnessTexture,
} from './tabletop_texture_generator';

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

export function tileRotation(index: number): [number, number, number] {
  if (typeof index !== 'number' || Number.isNaN(index) || index < 0 || index > 39) {
    return [0, 0, 0];
  }
  if (index === 0) {
    return [0, Math.PI / 4, 0];
  }
  const side = Math.floor(index / 10);
  switch (side) {
    case 0: return [0, 0, 0];
    case 1: return [0, -Math.PI / 2, 0];
    case 2: return [0, Math.PI, 0];
    default: return [0, Math.PI / 2, 0];
  }
}

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

export function GameBoard(): React.ReactElement {
  const storeLevelMap = useGameStore((s) => s.levelMap);
  const levelMap = Object.keys(storeLevelMap ?? {}).length > 0 ? storeLevelMap : (useGameStore.getState()?.levelMap ?? storeLevelMap);
  const openModal = useGameStore((s) => s.openModal);
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const playerPositions = useGameStore((s) => s.playerPositions);
  const storePlayersInfo = useGameStore((s) => s.playersInfo);
  const playersInfo = Object.keys(storePlayersInfo ?? {}).length > 0 ? storePlayersInfo : (useGameStore.getState()?.playersInfo ?? storePlayersInfo);
  const hasRolledThisTurn = useGameStore((s) => s.hasRolledThisTurn);
  const localPlayerId = useLobbyStore((s) => s.myPlayerId) || 'p1';
  const isHeatmapActive = useGameStore((s) => s.isHeatmapActive);

  const ownerInfoMap = useMemo(() => computeOwnerMap(playersInfo), [playersInfo]);
  const monopolyGroups = useMemo(() => detectPlayerMonopolies(playersInfo), [playersInfo]);
  const walnutDiffuse = useMemo(() => createWalnutTabletopTexture(), []);
  const walnutRoughness = useMemo(() => createWalnutRoughnessTexture(), []);

  const handleTileClick = useCallback(
    (cellIndex: number) => {
      const cell = BOARD_CONFIG[cellIndex];
      if (!cell || (cell.type !== CellType.Property && cell.type !== CellType.Railroad)) {
        return;
      }
      const isOwned = Object.values(playersInfo).some((p) => p.ownedProperties?.includes(cellIndex));
      const isMyTurn = currentTurnPlayerId === localPlayerId;
      const myPos = playerPositions[localPlayerId] ?? 0;
      const isStandingHere = myPos === cellIndex;
      const myBalance = playersInfo[localPlayerId]?.balance ?? 0;
      const canBuy = Boolean(isMyTurn && isStandingHere && !isOwned && hasRolledThisTurn && myBalance >= 600);
      openModal('deed', { cellIndex, canBuy });
    },
    [openModal, currentTurnPlayerId, localPlayerId, playerPositions, playersInfo, hasRolledThisTurn]
  );

  return (
    <group position={[0, 0, 0]}>
      {/* Khung Bàn Gỗ Óc Chó Thượng Lưu (Walnut Tabletop) y = -0.350 */}
      <mesh receiveShadow position={[0, WALNUT_TABLE_Y, 0]}>
        <boxGeometry args={[19.2, 0.2, 19.2]} />
        <meshStandardMaterial
          map={walnutDiffuse}
          roughnessMap={walnutRoughness}
          color="#2B1D14"
          roughness={0.28}
          metalness={0.05}
        />
      </mesh>

      {/* 0. Môi trường Bán đảo Đảo Ngọc nhiệt đới (Vịnh biển, bãi cát, đồi núi & mây trời) */}
      <CoastalIslandEnvironment />

      {/* 0.1. Điểm nhấn ánh sáng điện ảnh 3D (Hải đăng, Chóp Landmark C3, Sân vận động) */}
      <CinematicLightingAccents />

      {/* 0.2. Hiệu ứng Va Đập Xây Dựng, Sóng Xung Kích & Pháo Hoa Khánh Thành */}
      <ConstructionSlamVFX />

      {/* 2. Sa bàn đô thị thu nhỏ: Đảo tài chính, cầu vượt, sân vận động & bến du thuyền */}
      <MiniatureCityDiorama />

      {/* 3. Sàn diễn xúc xắc 3D thoáng đãng trên Đại Lộ Sài Gòn */}
      <DiceTray />

      {/* 4. 40 ô đất liền mạch khép kín tiếp giáp mặt nền phẳng */}
      {BOARD_CONFIG.map((cell) => (
        <LayeredDioramaTile
          key={cell.index}
          cell={cell}
          position={cellPosition(cell.index)}
          rotation={tileRotation(cell.index)}
          currentLevel={(levelMap[cell.index] ?? 0) as 0 | 1 | 2 | 3}
          isCornerTile={CORNER_INDICES.has(cell.index)}
          enableStandee={false}
          ownerColor={ownerInfoMap[cell.index]?.tokenColor}
          ownerSlot={ownerInfoMap[cell.index]?.ownerSlot}
          mascotIcon={ownerInfoMap[cell.index]?.mascotIcon}
          onClick={() => handleTileClick(cell.index)}
          isHeatmapActive={isHeatmapActive}
          isMonopolyGroup={isCellInMonopolyGroup(cell.index, monopolyGroups)}
        />
      ))}

      {/* 5. Dải cờ hoa vỉa hè cho các cụm độc quyền Monopoly Plaza */}
      <MonopolyPlazaFusion monopolyGroups={monopolyGroups} isHeatmapActive={isHeatmapActive} />
    </group>
  );
}
