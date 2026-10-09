import React from 'react';
import { Billboard } from '@react-three/drei';
import { Color, type InstancedMesh } from 'three';
import { LUXURY_PAWN_CONFIGS } from './luxury_pawn_models.js';
import { getMascotCanvasTexture } from './mascot_canvas_texture.js';

export interface OwnershipMarkerInstancesProps {
  readonly ownerColor?: string;
  readonly position?: [number, number, number];
  readonly level?: number;
  readonly ownerSlot?: number;
  readonly mascotIcon?: string;
}

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

/**
 * Cọc Cờ Sở Hữu Vật Lý (Ownership Marker / 3D Totem Pillar)
 * Trụ cọc kim loại FlagPole (height >= 0.4m, Brass PBR: roughness 0.25, metalness 0.85)
 * Khiên linh vật MascotCrestShield hiển thị icon 🏰/⛵/🚗/🐎 & viền vàng
 * Lá cờ phướn FlagCloth (instancedMesh với setColorAt gán màu người chơi)
 * Vòng đai kim loại chỉ thị cấp độ (Tier Level Indicator Rings C1..C3)
 */
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
