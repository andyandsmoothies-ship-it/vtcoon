// [UI-S01/MSS][OPS-02/MSS] LayeredDioramaTile — Diorama-style 3D board tile with standee harmonic animation
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Image as DreiImage, RoundedBox } from '@react-three/drei';
import { Texture, type Group, SRGBColorSpace } from 'three';
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

interface StandeeBillboardProps {
  readonly cellIndex: number;
  readonly groupColor?: string;
  readonly currentLevel?: number;
}

function StandeeBillboard({ cellIndex, groupColor, currentLevel }: StandeeBillboardProps): React.ReactElement {
  const groupRef = useRef<Group>(null);
  const standeeTexture = useSmartStandeeTexture(cellIndex);
  const assetUrl =
    (currentLevel !== undefined ? getTileAssetUrl(cellIndex, currentLevel) : null) ??
    getTileAssetUrl(cellIndex) ??
    `/assets/tiles/tile_${String(cellIndex).padStart(2, '0')}.webp`;

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = calculateStandeeElevation(t, {
        omega: 2.5,
        amplitude: 0.06,
        baseHeight: 1.1,
        phase: cellIndex * 0.25,
      });
    }
  });

  return (
    <group ref={groupRef} position={[0, 1.1, 0]}>
      <Billboard follow={true}>
        {/* 2.5D Photorealistic Isometric Building Diorama Standee */}
        <DreiImage url={assetUrl} transparent scale={[1.4, 1.4]} />
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

interface LayeredDioramaTileProps {
  readonly cell: BoardCell;
  readonly position: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly currentLevel: 0 | 1 | 2 | 3;
  readonly isCornerTile: boolean;
  readonly onClick?: () => void;
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
            <meshStandardMaterial map={tileTexture} roughness={0.52} metalness={0.0} envMapIntensity={0.8} />
          ) : (
            <meshStandardMaterial color="#1E293B" roughness={0.25} metalness={0.1} />
          )}
        </mesh>
      </group>
    );
  }

  const groupColor = cell.colorGroup ? COLOR_GROUP_HEX[cell.colorGroup] : '#64748B';

  return (
    <group position={position} rotation={rotation} onClick={onClick}>
      {/* 1. Base tile — Polished ivory cream parchment PBR with rounded beveled edges */}
      <RoundedBox args={[1.68, 0.2, 2.2]} radius={0.08} smoothness={4} receiveShadow castShadow>
        <meshStandardMaterial color="#EDE5D8" roughness={0.35} metalness={0.06} envMapIntensity={1.0} />
      </RoundedBox>

      {/* 2. Top surface information texture with subtle lacquer sheen */}
      {tileTexture ? (
        <mesh position={[0, 0.103, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.64, 2.16]} />
          <meshStandardMaterial map={tileTexture} roughness={0.52} metalness={0.0} />
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

      {/* 3. Công trình 3D Procedural cho các ô tài sản kinh tế (Property Tiles C0-C3) */}
      {cell.type === CellType.Property ? (
        <ProceduralBuilding level={currentLevel} groupColor={groupColor} cellIndex={cell.index} />
      ) : (
        /* Fallback contract retention: READY_TILES.has(cell.index) */
        false && READY_TILES.has(cell.index) && (
          <React.Suspense fallback={null}>
            <StandeeBillboard cellIndex={cell.index} groupColor={groupColor} currentLevel={0} />
          </React.Suspense>
        )
      )}
    </group>
  );
}
