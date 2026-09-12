// [UI-S04/MSS] AuctionGavel3D — Tactile Ceremonial 3D Golden Gavel & Shockwave Ring on Auction Pedestal
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, type Group, type Mesh } from 'three';

export interface AuctionGavel3DProps {
  readonly position?: [number, number, number];
  readonly scale?: number;
  readonly triggerStrike?: number; // Thay đổi giá trị để kích hoạt cú gõ búa
}

export const GAVEL_COLORS = {
  goldHead: '#F59E0B',
  goldRing: '#FEF08A',
  handleDark: '#78350F',
  handleGold: '#D97706',
  soundBlockStone: '#090D1A',
  shockwaveGlow: '#FDE047',
} as const;

function useSafeFrame(callback: Parameters<typeof useFrame>[0]): void {
  try {
    useFrame(callback);
  } catch {
    // Safe outside Canvas in headless test environment
  }
}

/**
 * Tính toán góc quay gõ búa dựa trên tiến trình hoạt ảnh [0, 1]
 * Chu kỳ 400ms: Nâng búa lấy đà -> Đập mạnh xuống đế -> Nảy nhẹ -> Trở về nghỉ
 * Đảm bảo tính liên tục toán học (C0 continuous) trên toàn miền giá trị
 */
export function calculateGavelRotation(progress: number): number {
  if (!Number.isFinite(progress) || progress <= 0 || progress >= 1) {
    return 0;
  }
  if (progress < 0.2) {
    // Giai đoạn 1: Nâng búa lấy đà (Anticipation) -> vươn tới -0.45 rad
    const p = progress / 0.2;
    return -0.45 * Math.sin((p * Math.PI) / 2);
  } else if (progress < 0.45) {
    // Giai đoạn 2: Đập dứt khoát xuống mặt đế gõ (Strike) -> đạt +0.5 rad
    const p = (progress - 0.2) / 0.25;
    return -0.45 + 0.95 * (p * p);
  } else if (progress < 0.65) {
    // Giai đoạn 3: Độ nảy đàn hồi (Rebound bounce) liên tục từ +0.5 rad về +0.2 rad
    const p = (progress - 0.45) / 0.2;
    return 0.5 - 0.3 * p - 0.25 * Math.sin(p * Math.PI);
  } else {
    // Giai đoạn 4: Thu búa êm dịu từ +0.2 rad về vị trí cân bằng 0 rad
    const p = (progress - 0.65) / 0.35;
    return 0.2 * (1 - p);
  }
}

/**
 * Tính toán độ giãn nở và độ trong suốt của vòng sóng chấn động
 */
export function calculateShockwaveProgress(progress: number): { scale: number; opacity: number } {
  if (!Number.isFinite(progress) || progress <= 0 || progress >= 1) {
    return { scale: 0.2, opacity: 0 };
  }
  const safeP = Math.max(0, Math.min(1, progress));
  const scale = 0.4 + safeP * 2.2;
  const opacity = Math.max(0, (1 - safeP) * (1 - safeP));
  return { scale, opacity };
}

export function AuctionGavel3D({
  position = [1.5, 0.22, 0.8],
  scale = 0.85,
  triggerStrike = 0,
}: AuctionGavel3DProps): React.ReactElement {
  const gavelArmRef = useRef<Group>(null);
  const shockwaveRef = useRef<Mesh>(null);
  const strikeProgressRef = useRef<number>(1);
  const shockwaveProgressRef = useRef<number>(1);
  const prevTriggerRef = useRef<number>(triggerStrike);

  useEffect(() => {
    if (triggerStrike > 0 && triggerStrike !== prevTriggerRef.current) {
      strikeProgressRef.current = 0;
      shockwaveProgressRef.current = 0;
    }
    prevTriggerRef.current = triggerStrike;
  }, [triggerStrike]);

  useSafeFrame((_, delta) => {
    const dt = Math.min(Math.max(delta, 0), 0.1);

    // 1. Cập nhật hoạt ảnh gõ búa (zero React re-renders)
    if (strikeProgressRef.current < 1) {
      strikeProgressRef.current = Math.min(1, strikeProgressRef.current + dt * 2.5); // 400ms duration
      if (gavelArmRef.current) {
        gavelArmRef.current.rotation.x = calculateGavelRotation(strikeProgressRef.current);
      }
    }

    // 2. Cập nhật vòng sóng chấn động lan tỏa trên mặt bục (zero React re-renders)
    if (shockwaveProgressRef.current < 1) {
      shockwaveProgressRef.current = Math.min(1, shockwaveProgressRef.current + dt * 2.0); // 500ms duration
      if (shockwaveRef.current) {
        const { scale: swScale, opacity: swOpacity } = calculateShockwaveProgress(shockwaveProgressRef.current);
        shockwaveRef.current.scale.set(swScale, swScale, 1);
        const mat = shockwaveRef.current.material;
        if (mat && 'opacity' in mat) {
          mat.opacity = swOpacity;
        }
      }
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Đế gõ âm học (Acoustic Strike Block) bằng đá Obsidian viền vàng */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.06, 16]} />
        <meshPhysicalMaterial
          color={GAVEL_COLORS.soundBlockStone}
          roughness={0.2}
          metalness={0.8}
          clearcoat={0.8}
        />
      </mesh>
      <mesh position={[0, 0.065, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.015, 16]} />
        <meshPhysicalMaterial
          color={GAVEL_COLORS.goldHead}
          roughness={0.12}
          metalness={0.95}
          clearcoat={1.0}
        />
      </mesh>

      {/* 2. Vòng sóng chấn động (Shockwave Ring) tỏa ra từ điểm gõ */}
      <mesh
        ref={shockwaveRef}
        position={[0, 0.075, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[0.4, 0.4, 1]}
      >
        <ringGeometry args={[0.2, 0.32, 24]} />
        <meshBasicMaterial
          color={GAVEL_COLORS.shockwaveGlow}
          transparent
          opacity={0}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* 3. Búa Vàng Hoàng Gia (Pivoting Ceremonial Gavel) */}
      <group ref={gavelArmRef} position={[0, 0.16, 0.24]}>
        {/* Cán búa (Gavel Handle) phối gỗ mun và kim loại mạ vàng */}
        <mesh position={[0, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.032, 0.46, 12]} />
          <meshPhysicalMaterial
            color={GAVEL_COLORS.handleDark}
            roughness={0.35}
            metalness={0.4}
            clearcoat={0.5}
          />
        </mesh>
        <mesh position={[0, 0, 0.41]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.036, 0.036, 0.04, 12]} />
          <meshPhysicalMaterial
            color={GAVEL_COLORS.handleGold}
            roughness={0.15}
            metalness={0.95}
            clearcoat={1.0}
          />
        </mesh>

        {/* Đầu búa (Gavel Head) hình trụ vát mép mạ vàng Champagne */}
        <group position={[0, 0, -0.05]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.28, 16]} />
            <meshPhysicalMaterial
              color={GAVEL_COLORS.goldHead}
              roughness={0.12}
              metalness={0.95}
              clearcoat={1.0}
              envMapIntensity={2.0}
            />
          </mesh>
          {/* Hai vành nẹp trang trí đầu búa */}
          {([-0.11, 0.11] as const).map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.075, 0.075, 0.025, 16]} />
              <meshPhysicalMaterial
                color={GAVEL_COLORS.goldRing}
                roughness={0.1}
                metalness={0.98}
                clearcoat={1.0}
              />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
