import React, { useMemo, useRef, useEffect } from 'react';
import { Billboard, Image as DreiImage, RoundedBox } from '@react-three/drei';
import { Texture, SRGBColorSpace, Color, type InstancedMesh } from 'three';
import { CellType, type BoardCell } from '../../domain/board_config';
import { COLOR_GROUP_HEX } from '../../domain/theme';
import { getTileTexture, getStandeeTexture } from './tile_texture_generator';
import { useTextureRevision } from './texture_revision';
import { isMobileHardware } from './device_detect';
import { READY_TILES, getTileAssetUrl } from '../assets/tile_assets';
import { ProceduralBuilding } from './procedural_building';
import { LUXURY_PAWN_CONFIGS } from './luxury_pawn_models';
import { ToyPropertyBuildings } from './toy_property_buildings';
import { getMascotCanvasTexture } from './mascot_canvas_texture';
import { OwnerPricePill, TactileDeedWaxSeal } from './owner_property_markers';
import { PROPERTY_DEEDS } from '../../domain/property_data';

export { ToyPropertyBuildings, OwnerPricePill, TactileDeedWaxSeal };

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
}: LayeredDioramaTileProps): React.ReactElement {
  const textureRevision = useTextureRevision();
  const isMobile = propIsMobile ?? isMobileHardware();
  const tileTexture = useMemo(() => getTileTexture(cell.index, isMobile), [cell.index, isMobile, textureRevision]);

  if (isCornerTile) {
    return (
      <group position={position} rotation={rotation} onClick={onClick}>
        {/* Corner tile — larger square base with polished stone PBR and rounded beveled edges */}
        <RoundedBox args={[2.2, 0.22, 2.2]} radius={0.08} smoothness={4} receiveShadow>
          <meshStandardMaterial color="#1E293B" roughness={0.16} metalness={0.25} envMapIntensity={1.2} />
        </RoundedBox>
        {/* Inner corner accent badge with texture */}
        <mesh position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[2.16, 2.16]} />
          {tileTexture ? (
            <meshStandardMaterial map={tileTexture} roughness={0.98} metalness={0.0} envMapIntensity={0.0} />
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
      {tileTexture ? (
        <mesh position={[0, 0.103, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.64, 2.16]} />
          <meshStandardMaterial map={tileTexture} roughness={0.98} metalness={0.0} envMapIntensity={0.0} />
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
          <ToyPropertyBuildings level={currentLevel} groupColor={groupColor} cellIndex={cell.index} />
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

export interface OwnershipMarkerInstancesProps {
  readonly ownerColor?: string;
  readonly position?: [number, number, number];
  readonly level?: number;
  readonly ownerSlot?: number;
  readonly mascotIcon?: string;
}

/**
 * Cọc Cờ Sở Hữu Vật Lý (Ownership Marker / 3D Totem Pillar)
 * Trụ cọc kim loại FlagPole (height >= 0.4m, Brass PBR: roughness 0.25, metalness 0.85)
 * Khiên linh vật MascotCrestShield hiển thị icon 🏰/⛵/🚗/🐎 & viền vàng
 * Lá cờ phướn FlagCloth (instancedMesh với setColorAt gán màu người chơi)
 * Vòng đai kim loại chỉ thị cấp độ (Tier Level Indicator Rings C1..C3)
 */
/**
 * Safe wrapper cho Billboard tránh crash khi render trong môi trường SSR/Node test không có Canvas
 */
export function SafeBillboard({
  follow = true,
  children,
  ...props
}: React.ComponentProps<typeof Billboard>): React.ReactElement {
  if (typeof window === 'undefined') {
    return React.createElement('billboard', { follow: String(follow), ...props }, children);
  }
  return (
    <Billboard follow={follow} {...props}>
      {children}
    </Billboard>
  );
}

export function OwnershipMarkerInstances({
  ownerColor = '#DC2626',
  position = [0.62, 0.11, 0.72],
  level = 0,
  ownerSlot,
  mascotIcon,
}: OwnershipMarkerInstancesProps): React.ReactElement {
  const clothRef = React.useRef<InstancedMesh>(null);

  React.useEffect(() => {
    if (clothRef.current) {
      clothRef.current.setColorAt(0, new Color(ownerColor));
      if (clothRef.current.instanceColor) {
        clothRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [ownerColor]);

  const clampedLevel = Math.min(3, Math.max(0, Math.floor(level ?? 0)));
  const resolvedMascotIcon =
    mascotIcon ||
    (ownerSlot !== undefined && ownerSlot >= 0 && ownerSlot < LUXURY_PAWN_CONFIGS.length
      ? (LUXURY_PAWN_CONFIGS[ownerSlot]?.icon ?? '🏰')
      : '🏰');
  const mascotTexture = getMascotCanvasTexture(resolvedMascotIcon);

  return (
    <group position={position} name="OwnershipMarkerInstances">
      {/* 1. Trụ cọc FlagPole (Totem Pillar) */}
      <instancedMesh args={[undefined, undefined, 1]} castShadow position={[0, 0.225, 0]} name="FlagPole">
        <cylinderGeometry args={[0.016, 0.022, 0.45, 12]} />
        <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.85} />
      </instancedMesh>

      {/* 2. Khiên gia huy linh vật người chơi (Mascot Crest Shield) */}
      <group name="MascotCrestShield" data-testid="mascot-crest-shield" position={[0, 0.38, 0]}>
        {/* Vành khiên mạ vàng */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.02, 16]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Mặt khiên màu chủ sở hữu */}
        <mesh position={[0, 0, 0.012]}>
          <cylinderGeometry args={[0.065, 0.065, 0.01, 16]} />
          <meshStandardMaterial color={ownerColor} roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Icon linh vật */}
        <mesh position={[0, 0, 0.02]} data-mascot-icon={resolvedMascotIcon} name={`MascotIcon_${resolvedMascotIcon}`}>
          <planeGeometry args={[0.08, 0.08]} />
          <meshBasicMaterial map={mascotTexture ?? undefined} transparent opacity={0.95} />
        </mesh>
      </group>

      {/* 3. Cờ phướn FlagCloth */}
      <instancedMesh ref={clothRef} args={[undefined, undefined, 1]} castShadow position={[0.10, 0.28, 0]} name="FlagCloth">
        <boxGeometry args={[0.18, 0.10, 0.01]} />
        <meshStandardMaterial color={ownerColor} roughness={0.65} metalness={0.1} />
      </instancedMesh>

      {/* 4. Huy Hiệu Ghim 2.5D Billboard (OwnershipBillboardPin) — Tự động xoay trực diện camera */}
      <SafeBillboard follow={true} position={[0, 0.52, 0]} name="OwnershipBillboardPin" data-testid="ownership-billboard-pin">
        {/* Viền ngoài than đen */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.26, 0.26]} />
          <meshBasicMaterial color="#0F172A" />
        </mesh>
        {/* Viền trong vàng kim loại */}
        <mesh position={[0, 0, 0.002]}>
          <planeGeometry args={[0.23, 0.23]} />
          <meshBasicMaterial color="#F59E0B" />
        </mesh>
        {/* Nền mang màu người chơi */}
        <mesh position={[0, 0, 0.004]}>
          <planeGeometry args={[0.20, 0.20]} />
          <meshBasicMaterial color={ownerColor} />
        </mesh>
        {/* Icon linh vật con vật */}
        <mesh position={[0, 0, 0.006]} data-mascot-icon={resolvedMascotIcon} name={`BillboardMascotIcon_${resolvedMascotIcon}`}>
          <planeGeometry args={[0.15, 0.15]} />
          <meshBasicMaterial map={mascotTexture ?? undefined} transparent opacity={0.98} />
        </mesh>
      </SafeBillboard>

      {/* 5. Vòng đai kim loại chỉ thị cấp độ (Tier Level Indicator Rings C1..C3) */}
      {clampedLevel > 0 && (
        <group name="TierIndicatorRings">
          {Array.from({ length: clampedLevel }).map((_, idx) => (
            <mesh key={idx} position={[0, 0.08 + idx * 0.035, 0]} name={`TierRing_${idx + 1}`}>
              <cylinderGeometry args={[0.022, 0.022, 0.014, 12]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.9} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
