import React, { useMemo } from 'react';
import { CanvasTexture } from 'three';
import { getMascotCanvasTexture } from './mascot_canvas_texture';
import { PROPERTY_DEEDS } from '../../domain/property_data';
import { formatPriceLabel, TILE_METADATA_MAP } from './tile_texture_data';

export interface OwnerPricePillProps {
  readonly ownerColor?: string;
  readonly mascotIcon?: string;
  readonly price?: number;
  readonly priceLabel?: string;
  readonly cellIndex?: number;
  readonly isPurchasable?: boolean;
  readonly position?: [number, number, number];
}

const priceTextureCache = new Map<string, CanvasTexture>();

export function getPriceCanvasTexture(text: string, color: string): CanvasTexture | null {
  if (typeof document === 'undefined' || !text) return null;
  const key = `${text}_${color}`;
  const cached = priceTextureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, 256, 64);
  ctx.fillStyle = color;
  ctx.font = '900 34px "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  priceTextureCache.set(key, texture);
  return texture;
}

export function OwnerPricePill({
  ownerColor,
  mascotIcon,
  price,
  priceLabel,
  cellIndex,
  isPurchasable: _isPurchasable = true,
  position = [0, 0.115, 0.70],
}: OwnerPricePillProps): React.ReactElement | null {
  const hasOwner = Boolean(ownerColor && ownerColor.length > 0);
  if (!hasOwner) {
    return null;
  }
  const resolvedPrice =
    price ??
    (cellIndex !== undefined
      ? PROPERTY_DEEDS.get(cellIndex)?.price ?? TILE_METADATA_MAP[cellIndex]?.price
      : undefined);
  const resolvedPriceText = priceLabel ?? formatPriceLabel(resolvedPrice);

  const mascotTexture = useMemo(
    () => (hasOwner && mascotIcon ? getMascotCanvasTexture(mascotIcon) : null),
    [hasOwner, mascotIcon]
  );

  const priceColor = hasOwner ? '#FFFFFF' : '#FBBF24';
  const priceTexture = useMemo(
    () => getPriceCanvasTexture(resolvedPriceText, priceColor),
    [resolvedPriceText, priceColor]
  );

  return (
    <group
      data-testid="owner-price-pill"
      position={position}
      name="OwnerPricePill"
    >
      {/* 1. Nền chính: Mang màu ownerColor khi có chủ, than đen #090D1A khi chưa mua */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[1.38, 0.012, 0.30]} />
        <meshStandardMaterial
          color={hasOwner ? ownerColor : '#090D1A'}
          roughness={0.35}
          metalness={hasOwner ? 0.25 : 0.1}
        />
      </mesh>

      {/* 2. Viền ngoài: Kim loại vàng hoàng kim #F59E0B khi có chủ, viền than sẫm #1E293B khi chưa mua */}
      <mesh position={[0, -0.001, 0]} receiveShadow>
        <boxGeometry args={[1.42, 0.010, 0.34]} />
        <meshStandardMaterial
          color={hasOwner ? '#F59E0B' : '#1E293B'}
          roughness={0.3}
          metalness={hasOwner ? 0.85 : 0.1}
        />
      </mesh>

      {/* 3. Plane icon con vật bên trái khi có chủ */}
      {hasOwner && mascotIcon && (
        <mesh
          position={[-0.45, 0.008, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          data-mascot-icon={mascotIcon}
          name={`PillMascotIcon_${mascotIcon}`}
        >
          <planeGeometry args={[0.18, 0.18]} />
          <meshBasicMaterial
            map={mascotTexture ?? undefined}
            transparent
            opacity={0.98}
          />
        </mesh>
      )}

      {/* 4. Nhãn giá tiền bất động sản */}
      <mesh
        position={[hasOwner && mascotIcon ? 0.10 : 0, 0.008, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        data-testid="owner-price-label"
        data-price-label={resolvedPriceText}
        name={`PriceText_${resolvedPriceText}`}
      >
        <planeGeometry args={[0.72, 0.18]} />
        <meshBasicMaterial
          map={priceTexture ?? undefined}
          color={priceColor}
          transparent
          opacity={0.98}
        />
      </mesh>
    </group>
  );
}

export interface TactileDeedWaxSealProps {
  readonly ownerColor?: string;
  readonly mascotIcon?: string;
  readonly level?: number;
  readonly position?: [number, number, number];
  readonly rotation?: [number, number, number];
}

export function TactileDeedWaxSeal({
  ownerColor = '#DC2626',
  mascotIcon = '🏰',
  level = 0,
  position = [0.42, 0.125, 0.12],
  rotation = [-Math.PI / 2, 0, -0.20],
}: TactileDeedWaxSealProps): React.ReactElement {
  const mascotTexture = useMemo(
    () => (mascotIcon ? getMascotCanvasTexture(mascotIcon, ownerColor) : null),
    [mascotIcon, ownerColor]
  );

  return (
    <group
      data-testid="deed-wax-seal"
      data-mascot-icon={mascotIcon}
      position={position}
      rotation={rotation}
      name="TactileDeedWaxSeal"
    >
      {/* 1. Vành ngoài dập răng cưa sáp mang ownerColor */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.015, 24]} />
        <meshStandardMaterial color={ownerColor} roughness={0.4} metalness={0.15} />
      </mesh>

      {/* 2. Vành đai trong kim loại vàng hoàng kim #F59E0B */}
      <mesh position={[0, 0, 0.001]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.016, 24]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.85} />
      </mesh>

      {/* 3. Mặt triện trung tâm mang ownerColor */}
      <mesh position={[0, 0, 0.002]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[0.10, 0.10, 0.018, 24]} />
        <meshStandardMaterial color={ownerColor} roughness={0.35} metalness={0.2} />
      </mesh>

      {/* 4. Plane icon linh vật dập nổi */}
      <mesh
        position={[0, 0, 0.012]}
        data-mascot-icon={mascotIcon}
        name={`WaxSealMascot_${mascotIcon}`}
      >
        <planeGeometry args={[0.14, 0.14]} />
        <meshBasicMaterial
          map={mascotTexture ?? undefined}
          transparent
          opacity={0.98}
        />
      </mesh>
    </group>
  );
}
