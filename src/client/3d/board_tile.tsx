import React, { useMemo, useRef, useEffect } from 'react';
import { Billboard, Image as DreiImage, RoundedBox } from '@react-three/drei';
import { Texture, SRGBColorSpace, Color, type InstancedMesh } from 'three';
import { CellType, type BoardCell } from '../../domain/board_config';
import { COLOR_GROUP_HEX } from '../../domain/theme';
import { getTileTexture, getStandeeTexture } from './tile_texture_generator';
import { READY_TILES, getTileAssetUrl } from '../assets/tile_assets';
import { ProceduralBuilding } from './procedural_building';

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
}: LayeredDioramaTileProps): React.ReactElement {
  const tileTexture = useMemo(() => getTileTexture(cell.index), [cell.index]);

  if (isCornerTile) {
    return (
      <group position={position} rotation={rotation} onClick={onClick}>
        {/* Corner tile — larger square base with polished stone PBR and rounded beveled edges */}
        <RoundedBox args={[2.2, 0.22, 2.2]} radius={0.08} smoothness={4} receiveShadow castShadow>
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

  return (
    <group position={position} rotation={rotation} onClick={onClick}>
      {/* 1. Base tile — Polished ivory cream parchment PBR with rounded beveled edges */}
      <RoundedBox args={[1.68, 0.2, 2.2]} radius={0.08} smoothness={4} receiveShadow castShadow>
        <meshStandardMaterial color="#EDE5D8" roughness={0.35} metalness={0.06} envMapIntensity={1.0} />
      </RoundedBox>

      {/* Viền chân đế màu sở hữu (OwnerBaseTrim) khi đã có chủ */}
      {isPurchasable && ownerColor && ownerColor.length > 0 && (
        <mesh position={[0, 0.01, 0]} name="OwnerBaseTrim" data-testid="owner-base-trim" receiveShadow>
          <boxGeometry args={[1.72, 0.04, 2.24]} />
          <meshStandardMaterial color={ownerColor} roughness={0.3} metalness={0.4} />
        </mesh>
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
        <ProceduralBuilding level={currentLevel} groupColor={groupColor} cellIndex={cell.index} />
      ) : (
        /* Fallback contract retention: READY_TILES.has(cell.index) */
        isFixedInfrastructure && READY_TILES.has(cell.index) && enableStandee && (
          <React.Suspense fallback={null}>
            <StandeeBillboard cellIndex={cell.index} groupColor={groupColor} currentLevel={0} />
          </React.Suspense>
        )
      )}

      {/* 4. Cọc cờ sở hữu vật lý (Ownership Marker) gắn kết trên ô đất khi đã có chủ */}
      {isPurchasable && (ownerColor && ownerColor.length > 0 ? (
        <OwnershipMarkerInstances ownerColor={ownerColor} level={cell.type === CellType.Property ? currentLevel : 0} />
      ) : (cell.type === CellType.Property && currentLevel > 0) ? (
        <OwnershipMarkerInstances ownerColor={groupColor} level={currentLevel} />
      ) : null)}
    </group>
  );
}

export interface OwnershipMarkerInstancesProps {
  readonly ownerColor?: string;
  readonly position?: [number, number, number];
  readonly level?: number;
}

/**
 * Cọc Cờ Sở Hữu Vật Lý (Ownership Marker / Flag Pole)
 * Cột cờ kim loại FlagPole (cylinderGeometry, Brass PBR: roughness 0.25, metalness 0.85)
 * Lá cờ vải FlagCloth (instancedMesh với setColorAt gán màu người chơi)
 * Vòng đai kim loại chỉ thị cấp độ (Tier Level Indicator Rings C0..C3)
 */
export function OwnershipMarkerInstances({
  ownerColor = '#DC2626',
  position = [0.62, 0.11, 0.72],
  level = 0,
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

  return (
    <group position={position} name="OwnershipMarkerInstances">
      {/* 1. Cột cờ kim loại FlagPole Brass PBR (InstancedMesh) */}
      <instancedMesh args={[undefined, undefined, 1]} castShadow position={[0, 0.15, 0]} name="FlagPole">
        <cylinderGeometry args={[0.012, 0.016, 0.3, 12]} />
        <meshStandardMaterial color="#D97706" roughness={0.25} metalness={0.85} />
      </instancedMesh>
      {/* 2. Lá cờ vải FlagCloth (InstancedMesh với setColorAt đổi màu người chơi) */}
      <instancedMesh ref={clothRef} args={[undefined, undefined, 1]} castShadow position={[0.075, 0.24, 0]} name="FlagCloth">
        <boxGeometry args={[0.14, 0.08, 0.01]} />
        <meshStandardMaterial color={ownerColor} roughness={0.65} metalness={0.1} />
      </instancedMesh>
      {/* 3. Vòng đai kim loại chỉ thị cấp độ (Tier Level Indicator Rings C0..C3) */}
      {clampedLevel > 0 && (
        <group name="TierIndicatorRings">
          {Array.from({ length: clampedLevel }).map((_, idx) => (
            <mesh key={idx} position={[0, 0.08 + idx * 0.035, 0]} castShadow name={`TierRing_${idx + 1}`}>
              <cylinderGeometry args={[0.022, 0.022, 0.014, 12]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.9} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
