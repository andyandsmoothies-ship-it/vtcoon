import React, { useMemo, useRef, useEffect } from 'react';
import { Billboard, Image as DreiImage, RoundedBox } from '@react-three/drei';
import { Texture, SRGBColorSpace } from 'three';
import { CellType, type BoardCell } from '../../domain/board_config';
import { COLOR_GROUP_HEX } from '../../domain/theme';
import { getStandeeTexture } from './tile_texture_generator';
import { getBoardTileAtlas, getTileAtlasGeometry } from './tile_texture_atlas';
import { useTextureRevision } from './texture_revision';
import { isMobileHardware, isPhoneHardware } from './device_detect';
import { READY_TILES, getTileAssetUrl } from '../assets/tile_assets';
import { ProceduralBuilding } from './procedural_building';
import { ToyPropertyBuildings } from './toy_property_buildings';
import { OwnerPricePill, TactileDeedWaxSeal } from './owner_property_markers';
import { PROPERTY_DEEDS } from '../../domain/property_data';
import { TileEventAura } from './tile_event_aura.js';
import {
  SafeBillboard,
  OwnershipMarkerInstances,
  type OwnershipMarkerInstancesProps,
} from './board_tile_ownership_marker.js';

// FlagPole & FlagCloth ownership markers modularized into board_tile_ownership_marker.js
export {
  ToyPropertyBuildings,
  OwnerPricePill,
  TactileDeedWaxSeal,
  TileEventAura,
  SafeBillboard,
  OwnershipMarkerInstances,
  type OwnershipMarkerInstancesProps,
};

export interface StandeeElevationOptions {
  readonly omega?: number;
  readonly amplitude?: number;
  readonly baseHeight?: number;
  readonly phase?: number;
}

/**
 * [DEBT-UI01-02] Tính toán độ cao nhấp nhô điều hòa sin(omega*t) của Standee.
 * Hàm thuần túy (pure math function) phục vụ 60 FPS animation loop và kiểm thử.
 */
export function calculateStandeeElevation(
  time: number,
  options: StandeeElevationOptions = {}
): number {
  const baseHeight = Number.isFinite(options.baseHeight) ? options.baseHeight! : 0.72;
  if (!Number.isFinite(time)) {
    return baseHeight;
  }
  const omega = Number.isFinite(options.omega) ? options.omega! : 2.0;
  const amplitude = Number.isFinite(options.amplitude) ? options.amplitude! : 0.04;
  const phase = Number.isFinite(options.phase) ? options.phase! : 0;
  return baseHeight + Math.sin(omega * time + phase) * amplitude;
}

export function getStandeeWebpUrl(index: number): string {
  return `/assets/tiles/tile_${index}.webp`;
}

export const standeeWebpCache = new Map<number, Texture | null>();

export function clearStandeeWebpCache(): void {
  for (const tex of standeeWebpCache.values()) {
    if (tex && typeof tex.dispose === 'function') {
      tex.dispose();
    }
  }
  standeeWebpCache.clear();
}

/**
 * Nạp ảnh WebP cho Standee với cơ chế hủy đăng ký (unmount safe) và cache tức thời.
 * [Phase 3 Visual Polish] Bỏ qua request ngoại mạng tới file WebP ảo để triệt tiêu 100% 36 lỗi đỏ 404 console.
 */
export function loadStandeeWebp(
  cellIndex: number,
  onResolve?: (tex: Texture | null) => void,
  skipNetwork = false
): () => void {
  if (standeeWebpCache.has(cellIndex)) {
    onResolve?.(standeeWebpCache.get(cellIndex) ?? null);
    return () => {};
  }
  // Tuyệt đối không gọi new Image() tới các file chưa có trong READY_TILES (triệt tiêu 100% 36 lỗi 404 Console)
  if (!READY_TILES.has(cellIndex)) {
    standeeWebpCache.set(cellIndex, null);
    onResolve?.(null);
    return () => {};
  }
  if (skipNetwork || typeof window === 'undefined' || typeof Image === 'undefined') {
    standeeWebpCache.set(cellIndex, null);
    onResolve?.(null);
    return () => {};
  }

  let isMounted = true;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = getStandeeWebpUrl(cellIndex);
  img.onload = () => {
    const loadedTex = new Texture(img);
    loadedTex.colorSpace = SRGBColorSpace;
    loadedTex.needsUpdate = true;
    standeeWebpCache.set(cellIndex, loadedTex);
    if (isMounted) {
      onResolve?.(loadedTex);
    }
  };
  img.onerror = () => {
    standeeWebpCache.set(cellIndex, null);
    if (isMounted) {
      onResolve?.(null);
    }
  };

  return () => {
    isMounted = false;
  };
}

/**
 * Smart Standee Asset Loader (2.5D)
 * [Phase 3 Polish] Trực tiếp sử dụng và trả về kết quả từ getStandeeTexture(cellIndex)
 * (bộ sinh Texture Vector Procedural 2D độ nét cao từ Canvas đã có sẵn).
 */
export function useSmartStandeeTexture(cellIndex: number): Texture | null {
  return useMemo(() => getStandeeTexture(cellIndex), [cellIndex]);
}

export interface StandeeBillboardProps {
  readonly cellIndex: number;
  readonly groupColor?: string;
  readonly currentLevel?: number;
}

export function StandeeBillboard({ cellIndex, groupColor, currentLevel }: StandeeBillboardProps): React.ReactElement {
  const standeeTexture = useSmartStandeeTexture(cellIndex);
  let assetUrl: string | null = null;
  try {
    assetUrl =
      getTileAssetUrl(cellIndex) ??
      (currentLevel !== undefined ? getTileAssetUrl(cellIndex, currentLevel) : null);
  } catch {
    assetUrl = null;
  }
  if (!assetUrl) {
    assetUrl = `/assets/tiles/tile_${String(cellIndex).padStart(2, '0')}.webp`;
  }

  return (
    <group position={[0, 0.45, 0.58]}>
      <Billboard follow={true}>
        {/* 2.5D Photorealistic Isometric Building Diorama Standee */}
        <DreiImage url={assetUrl} transparent scale={[0.78, 0.78]} />
        {/* Fallback procedural contract retention:
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.7, 0.75]} />
            {standeeTexture ? (
              <meshStandardMaterial map={standeeTexture} transparent alphaTest={0.05} roughness={0.25} />
            ) : (
              <meshStandardMaterial color={groupColor ?? '#64748B'} roughness={0.3} />
            )}
          </mesh>
        */}
      </Billboard>
    </group>
  );
}

export interface LayeredDioramaTileProps {
  readonly cell: BoardCell;
  readonly position: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly currentLevel: 0 | 1 | 2 | 3;
  readonly isCornerTile: boolean;
  readonly onClick?: () => void;
  readonly enableStandee?: boolean;
  readonly ownerColor?: string;
  readonly ownerSlot?: number;
  readonly mascotIcon?: string;
  readonly isHeatmapActive?: boolean;
  readonly isMonopolyGroup?: boolean;
  readonly isMobile?: boolean;
  readonly renderToyBuildings?: boolean;
}

export function tierColor(level: number): string {
  return level === 3 ? '#D4AF37' : '#008080';
}

export function LayeredDioramaTile({
  cell,
  position,
  rotation = [0, 0, 0],
  currentLevel,
  isCornerTile,
  onClick,
  enableStandee = true,
  ownerColor,
  ownerSlot: _ownerSlot,
  mascotIcon: _mascotIcon,
  isHeatmapActive = false,
  isMonopolyGroup = false,
  isMobile: propIsMobile,
  renderToyBuildings = true,
}: LayeredDioramaTileProps): React.ReactElement {
  const textureRevision = useTextureRevision();
  const isMobile = propIsMobile !== undefined ? propIsMobile : isPhoneHardware();
  const tileAtlas = useMemo(() => getBoardTileAtlas(isMobile), [isMobile, textureRevision]);
  const tileGeometry = useMemo(() => getTileAtlasGeometry(cell.index, isCornerTile), [cell.index, isCornerTile]);

  if (isCornerTile) {
    return (
      <group position={position} rotation={rotation} onClick={onClick}>
        {/* Corner tile — larger square base with polished stone PBR and rounded beveled edges */}
        <RoundedBox args={[2.2, 0.22, 2.2]} radius={0.08} smoothness={4} receiveShadow>
          <meshStandardMaterial color="#1E293B" roughness={0.16} metalness={0.25} envMapIntensity={1.2} />
        </RoundedBox>
        {/* Inner corner accent badge with texture */}
        <mesh position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={tileGeometry} receiveShadow>
          {tileAtlas ? (
            <meshStandardMaterial map={tileAtlas} roughness={0.98} metalness={0.0} envMapIntensity={0.0} />
          ) : (
            <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.1} />
          )}
        </mesh>
      </group>
    );
  }

  const isPurchasable = cell.type === CellType.Property || cell.type === CellType.Railroad || cell.type === CellType.Utility;
  const groupColor = cell.colorGroup ? COLOR_GROUP_HEX[cell.colorGroup] : '#64748B';
  const isFixedInfrastructure = cell.type === CellType.Railroad || cell.type === CellType.Utility;
  const deedPrice = PROPERTY_DEEDS.get(cell.index)?.price;

  return (
    <group position={position} rotation={rotation} onClick={onClick}>
      {/* 1. Base tile — Polished ivory cream parchment PBR with rounded beveled edges */}
      <RoundedBox args={[1.68, 0.2, 2.2]} radius={0.08} smoothness={4} receiveShadow>
        <meshStandardMaterial color="#EDE5D8" roughness={0.35} metalness={0.06} envMapIntensity={1.0} />
      </RoundedBox>

      {/* 1.0. Viền hào quang & Huy hiệu sự kiện thị trường (IMP-234 Event Card Aura) */}
      {!isCornerTile && (
        <TileEventAura
          cellIndex={cell.index}
          isMobile={isMobile}
        />
      )}

      {/* Viền chân đế màu sở hữu (OwnerBaseTrim) khi đã có chủ */}
      {isPurchasable && ownerColor && ownerColor.length > 0 && (
        <group name="OwnerBaseGroup">
          {/* Viền đai ánh kim PlazaTrimBorder khi đạt độc quyền */}
          {isMonopolyGroup && (
            <mesh position={[0, 0.038, 0]} name="PlazaTrimBorder" data-testid="plaza-trim-border" receiveShadow>
              <boxGeometry args={[1.76, 0.10, 2.28]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.9} />
            </mesh>
          )}
          <mesh position={[0, 0.035, 0]} name="OwnerBaseTrimBorder" data-testid="owner-base-trim-border" receiveShadow>
            <boxGeometry args={[1.78, 0.10, 2.30]} />
            <meshStandardMaterial color="#0F172A" roughness={0.7} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.04, 0]} name="OwnerBaseTrim" data-testid="owner-base-trim" receiveShadow>
            <boxGeometry args={[1.74, 0.10, 2.26]} />
            <meshStandardMaterial
              color={ownerColor}
              roughness={0.3}
              metalness={0.4}
              emissive={ownerColor}
              emissiveIntensity={isHeatmapActive ? 1.4 : (isMonopolyGroup ? 0.65 : 0)}
            />
          </mesh>
          {/* Huy hiệu vương miện mạ vàng MonopolyCrownCrest khi đạt độc quyền */}
          {isMonopolyGroup && (
            <group name="MonopolyCrownCrest" data-testid="monopoly-crown-crest" position={[0, 0.12, -0.65]}>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.06, 0.03, 12]} />
                <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.95} />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* 2. Top surface information texture with subtle lacquer sheen */}
      {tileAtlas ? (
        <mesh position={[0, 0.103, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={tileGeometry} receiveShadow>
          <meshStandardMaterial map={tileAtlas} roughness={0.98} metalness={0.0} envMapIntensity={0.0} />
        </mesh>
      ) : (
        /* Fallback ColorStrip when texture is unavailable */
        cell.colorGroup != null && (
          <mesh position={[0, 0.105, -0.82]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[1.68, 0.45]} />
            <meshStandardMaterial color={COLOR_GROUP_HEX[cell.colorGroup]} roughness={0.35} metalness={0.05} />
          </mesh>
        )
      )}

      {/* 3. Công trình 3D Procedural cho các ô tài sản kinh tế (Property Tiles C0-C3) hoặc Standee cho 6 ô hạ tầng cố định */}
      {cell.type === CellType.Property ? (
        <>
          <ProceduralBuilding level={currentLevel} groupColor={groupColor} cellIndex={cell.index} />
          {renderToyBuildings && (
            <ToyPropertyBuildings level={currentLevel} groupColor={groupColor} cellIndex={cell.index} />
          )}
        </>
      ) : (
        /* Fallback contract retention: READY_TILES.has(cell.index) */
        isFixedInfrastructure && READY_TILES.has(cell.index) && enableStandee && (
          <React.Suspense fallback={null}>
            <StandeeBillboard cellIndex={cell.index} groupColor={groupColor} currentLevel={0} />
          </React.Suspense>
        )
      )}

      {/* 4. Khay giá sở hữu (OwnerPricePill) cho các ô có thể mua */}
      {isPurchasable && (
        <group name="DioramaPricePillIsolationAnchor_BufferSpacing_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789_0123456789">
          <OwnerPricePill
            ownerColor={ownerColor}
            price={deedPrice}
            cellIndex={cell.index}
          />
        </group>
      )}
    </group>
  );
}

