// [TC-P3.1/MSS] PenthouseLobbyScene — Sảnh Chờ 3D VIP Penthouse Lounge ngắm hoàng hôn vịnh biển
export { generateHologramScreenTexture, generateSunsetBackdropTexture } from './penthouse_texture_generator';
export { PenthouseEnclosure, PenthouseEnclosure as PenthouseArchitecture } from './penthouse_enclosure';
export { LuxuryPawnModel, LUXURY_PAWN_CONFIGS } from './luxury_pawn_models';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { AdditiveBlending, DoubleSide, type Group } from 'three';
import { useLobbyStore } from '../store/lobby_store';
import { type LobbySlot } from '../store/lobby_types';
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme';
import { AudioEngine } from '../audio/audio_engine';
import { generateHologramScreenTexture } from './penthouse_texture_generator';
import { PenthouseEnclosure } from './penthouse_enclosure';
import { LuxuryPawnModel } from './luxury_pawn_models';

export const PENTHOUSE_CAMERA_CONFIG = {
  initialPosition: [3.8, 3.2, 5.2] as const,
  target: [-0.2, 1.15, -0.3] as const,
  minDistance: 3.5,
  maxDistance: 9.5,
  minPolarAngle: Math.PI / 4.5,
  maxPolarAngle: Math.PI / 2.1,
} as const;

export const PENTHOUSE_DIMENSIONS = {
  tableRadius: 1.8,
  tableHeight: 0.95,
  carpetRadius: 3.4,
  chairDistance: 2.45,
  ceilingHeight: 4.8,
  roomRadius: 12,
} as const;

export const PENTHOUSE_COLORS = {
  marbleFloor: '#F8FAFC',
  carpet: '#1E293B',
  goldBezel: '#F59E0B',
  walnutTrim: '#3E2723',
  chairLeather: '#D4C5B9',
  chairLeg: '#1C1917',
  hologramCyan: '#06B6D4',
  hologramAmber: '#F59E0B',
  sunsetGlow: '#FB923C',
  wallMarble: '#F1F5F9',
  coveWarm: '#FDE047',
} as const;

export const SEAT_ANGLES_DEG = [125, 215, 305, 35] as const;

export function calculateSeatPosition(
  seatIndex: number,
  distance: number = PENTHOUSE_DIMENSIONS.chairDistance
): [number, number, number] {
  const safeIdx = Number.isFinite(seatIndex) ? Math.max(0, Math.min(3, Math.floor(seatIndex))) : 0;
  const angleDeg = SEAT_ANGLES_DEG[safeIdx] ?? SEAT_ANGLES_DEG[0];
  const rad = (angleDeg * Math.PI) / 180;
  return [Math.cos(rad) * distance, 0, Math.sin(rad) * distance];
}

export function calculateSeatRotationY(seatIndex: number): number {
  const safeIdx = Number.isFinite(seatIndex) ? Math.max(0, Math.min(3, Math.floor(seatIndex))) : 0;
  const angleDeg = SEAT_ANGLES_DEG[safeIdx] ?? SEAT_ANGLES_DEG[0];
  const rad = (angleDeg * Math.PI) / 180;
  return -rad - Math.PI / 2;
}

export function calculateHologramBob(time: number): { y: number; rotY: number } {
  const safeTime = Number.isFinite(time) ? time : 0;
  return {
    y: 1.68 + Math.sin(safeTime * 1.8) * 0.04,
    rotY: safeTime * 0.22,
  };
}

export function calculateAvatarBob(time: number, seatIndex: number): number {
  const safeTime = Number.isFinite(time) ? time : 0;
  const safeIdx = Number.isFinite(seatIndex) ? seatIndex : 0;
  return Math.sin(safeTime * 2.4 + safeIdx * 1.5) * 0.012;
}

const CHAIR_LEG_OFFSETS: readonly (readonly [number, number])[] = [
  [-0.22, -0.22],
  [0.22, -0.22],
  [-0.22, 0.22],
  [0.22, 0.22],
] as const;

export function PenthouseTable(): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* Trụ chân bàn tròn cẩm thạch bằng đồng mạ bóng */}
      <mesh position={[0, 0.47, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.72, 0.94, 32]} />
        <meshStandardMaterial color="#78350F" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Vành gỗ óc chó bo mép mặt bàn */}
      <mesh position={[0, 0.94, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[PENTHOUSE_DIMENSIONS.tableRadius, PENTHOUSE_DIMENSIONS.tableRadius, 0.06, 48]} />
        <meshStandardMaterial color={PENTHOUSE_COLORS.walnutTrim} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Khảm đá cẩm thạch trắng Carrara */}
      <mesh position={[0, 0.975, 0]} receiveShadow>
        <cylinderGeometry args={[PENTHOUSE_DIMENSIONS.tableRadius - 0.22, PENTHOUSE_DIMENSIONS.tableRadius - 0.22, 0.02, 48]} />
        <meshStandardMaterial color={PENTHOUSE_COLORS.marbleFloor} roughness={0.15} metalness={0.1} />
      </mesh>
      {/* Bệ máy chiếu ba chiều (Hologram Projector) tâm bàn */}
      <mesh position={[0, 0.985, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.015, 32]} />
        <meshStandardMaterial color="#0F172A" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.995, 0]}>
        <ringGeometry args={[0.44, 0.5, 32]} />
        <meshStandardMaterial color={PENTHOUSE_COLORS.hologramCyan} emissive={PENTHOUSE_COLORS.hologramCyan} emissiveIntensity={2.5} />
      </mesh>
    </group>
  );
}

export function CentralHologram(): React.ReactElement {
  const hologramRef = useRef<Group>(null);
  const hudScreenTexture = useMemo(() => generateHologramScreenTexture(), []);

  useEffect(() => {
    return () => {
      if (typeof hudScreenTexture?.dispose === 'function') {
        hudScreenTexture.dispose();
      }
    };
  }, [hudScreenTexture]);

  useFrame(({ clock }) => {
    if (hologramRef.current) {
      const bob = calculateHologramBob(clock.elapsedTime);
      hologramRef.current.position.y = bob.y;
      hologramRef.current.rotation.y = bob.rotY;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Chùm tia sáng máy chiếu ba chiều dạng nón phát quang */}
      <mesh position={[0, 1.75, 0]}>
        <cylinderGeometry args={[1.25, 0.48, 1.5, 32, 1, true]} />
        <meshBasicMaterial
          color={PENTHOUSE_COLORS.hologramCyan}
          transparent
          opacity={0.16}
          side={DoubleSide}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <pointLight position={[0, 1.8, 0]} color={PENTHOUSE_COLORS.hologramCyan} intensity={2.2} distance={4.5} />

      {/* Mô hình sa bàn thu nhỏ phát quang màu xanh Cyan Hologram lơ lửng bồng bềnh & tự động xoay 360 độ */}
      <group ref={hologramRef} position={[0, 1.68, 0]}>
        {/* Tấm nền sa bàn phát quang màu xanh Cyan Hologram */}
        <RoundedBox args={[1.35, 0.04, 1.35]} radius={0.03} smoothness={3}>
          <meshStandardMaterial
            color="#06B6D4"
            transparent
            opacity={0.8}
            emissive="#06B6D4"
            emissiveIntensity={1.8}
            roughness={0.15}
            metalness={0.85}
          />
        </RoundedBox>

        {/* Khung viền vành đai 40 ô cờ holographic phát quang */}
        <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.56, 0.64, 4]} />
          <meshStandardMaterial
            color="#38BDF8"
            transparent
            opacity={0.9}
            emissive="#06B6D4"
            emissiveIntensity={2.0}
          />
        </mesh>

        {/* 4 khối landmark góc sa bàn phát sáng */}
        {[-0.52, 0.52].map((x) =>
          [-0.52, 0.52].map((z) => (
            <mesh key={`corner-${x}-${z}`} position={[x, 0.05, z]}>
              <boxGeometry args={[0.12, 0.06, 0.12]} />
              <meshStandardMaterial
                color="#FBBF24"
                emissive="#F59E0B"
                emissiveIntensity={1.5}
                transparent
                opacity={0.85}
              />
            </mesh>
          ))
        )}

        {/* Tháp Landmark mini trung tâm */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.03, 0.08, 0.36, 8]} />
          <meshStandardMaterial
            color={PENTHOUSE_COLORS.hologramAmber}
            emissive={PENTHOUSE_COLORS.hologramAmber}
            emissiveIntensity={1.6}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Đĩa nước vịnh biển mini holographic */}
        <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.26, 24]} />
          <meshStandardMaterial
            color={PENTHOUSE_COLORS.hologramCyan}
            emissive={PENTHOUSE_COLORS.hologramCyan}
            emissiveIntensity={1.0}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* Màn hình HUD holographic nghiêng hiển thị sa bàn & thông số */}
      <group position={[0, 2.38, -0.65]} rotation={[-0.2, 0, 0]}>
        <RoundedBox args={[1.5, 0.94, 0.02]} radius={0.03} smoothness={3}>
          <meshStandardMaterial
            map={hudScreenTexture}
            transparent
            opacity={0.92}
            roughness={0.1}
            emissive="#06B6D4"
            emissiveIntensity={0.3}
          />
        </RoundedBox>
      </group>
    </group>
  );
}

export function PenthouseChairsAndPlayers({ slots }: { slots: readonly LobbySlot[] }): React.ReactElement {
  const charactersRef = useRef<Group>(null);

  const fixedSlots = useMemo(() => {
    return [0, 1, 2, 3].map((idx) => {
      const slot = slots.find((s) => s.slotIndex === idx) ?? slots[idx];
      if (slot) return slot;
      return {
        slotIndex: idx,
        playerId: null,
        playerName: `Vị trí ${idx + 1}`,
        tokenColor: PLAYER_TOKEN_PALETTE[idx % PLAYER_TOKEN_PALETTE.length] ?? '#38BDF8',
        isHost: false,
        isReady: false,
        isBot: false,
        isOccupied: false,
      };
    });
  }, [slots]);

  useFrame(({ clock }) => {
    if (charactersRef.current) {
      charactersRef.current.children.forEach((child, idx) => {
        const bob = calculateAvatarBob(clock.elapsedTime, idx);
        child.position.y = bob;
      });
    }
  });

  return (
    <group ref={charactersRef}>
      {fixedSlots.map((slot, idx) => {
        const pos = calculateSeatPosition(idx);
        const rotY = calculateSeatRotationY(idx);
        const isOccupied = slot.isOccupied;
        const tokenColor = slot.tokenColor || PLAYER_TOKEN_PALETTE[idx % PLAYER_TOKEN_PALETTE.length] || '#38BDF8';

        return (
          <group key={slot.slotIndex} position={pos} rotation={[0, rotY, 0]}>
            {/* 4 ghế da sang trọng quanh bàn */}
            <group position={[0, 0, 0]}>
              {CHAIR_LEG_OFFSETS.map((pair, i) => (
                <mesh key={i} position={[pair[0], 0.24, pair[1]]}>
                  <cylinderGeometry args={[0.024, 0.016, 0.48, 12]} />
                  <meshStandardMaterial color={PENTHOUSE_COLORS.chairLeg} roughness={0.4} />
                </mesh>
              ))}
              {/* Đệm ngồi bọc da cao cấp */}
              <RoundedBox args={[0.62, 0.12, 0.62]} radius={0.05} smoothness={3} position={[0, 0.48, 0]} castShadow>
                <meshStandardMaterial color={PENTHOUSE_COLORS.chairLeather} roughness={0.5} />
              </RoundedBox>
              {/* Lưng ghế cong ôm trọn thân người */}
              <mesh position={[0, 0.8, -0.26]}>
                <cylinderGeometry args={[0.34, 0.34, 0.52, 24, 1, true, -Math.PI / 2, Math.PI]} />
                <meshStandardMaterial color={PENTHOUSE_COLORS.chairLeather} roughness={0.5} side={DoubleSide} />
              </mesh>
            </group>

            {/* Linh vật cờ thượng lưu đại diện người chơi (Luxury Pawn) */}
            {isOccupied ? (
              <group position={[0, 0.52, 0]}>
                {/* Tượng linh vật mạ kim loại PBR tinh xảo */}
                <LuxuryPawnModel slotIndex={idx} />

                {/* Bảng tên 3D phát quang nổi lơ lửng trên linh vật */}
                <group position={[0, 0.85, 0]}>
                  <RoundedBox args={[1.05, 0.26, 0.02]} radius={0.04} smoothness={3}>
                    <meshStandardMaterial color="#0F172A" transparent opacity={0.88} />
                  </RoundedBox>
                  <Text position={[0, 0.02, 0.02]} fontSize={0.09} color={tokenColor} anchorX="center" anchorY="middle" maxWidth={0.95}>
                    {slot.isHost ? '👑 ' : slot.isBot ? '🤖 ' : ''}{slot.playerName || `Người chơi ${idx + 1}`}
                  </Text>
                  <mesh position={[0.44, 0.02, 0.02]}>
                    <circleGeometry args={[0.035, 16]} />
                    <meshBasicMaterial color={slot.isReady ? '#10B981' : '#F59E0B'} />
                  </mesh>
                </group>
              </group>
            ) : (
              /* Vị trí ghế trống mời kết nối */
              <group position={[0, 0.88, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.18, 0.24, 24]} />
                  <meshBasicMaterial color={PENTHOUSE_COLORS.hologramCyan} transparent opacity={0.35} />
                </mesh>
                <Text position={[0, 0.14, 0]} fontSize={0.08} color="#94A3B8" anchorX="center" anchorY="middle">
                  TRỐNG
                </Text>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

export function PenthouseCameraController(): React.ReactElement {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    camera.position.set(
      PENTHOUSE_CAMERA_CONFIG.initialPosition[0],
      PENTHOUSE_CAMERA_CONFIG.initialPosition[1],
      PENTHOUSE_CAMERA_CONFIG.initialPosition[2]
    );
    camera.lookAt(
      PENTHOUSE_CAMERA_CONFIG.target[0],
      PENTHOUSE_CAMERA_CONFIG.target[1],
      PENTHOUSE_CAMERA_CONFIG.target[2]
    );
    if (controlsRef.current) {
      controlsRef.current.target.set(
        PENTHOUSE_CAMERA_CONFIG.target[0],
        PENTHOUSE_CAMERA_CONFIG.target[1],
        PENTHOUSE_CAMERA_CONFIG.target[2]
      );
      controlsRef.current.update();
    }
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={[-0.2, 1.15, -0.3]}
      autoRotate
      autoRotateSpeed={0.35}
      enableDamping
      dampingFactor={0.05}
      minDistance={PENTHOUSE_CAMERA_CONFIG.minDistance}
      maxDistance={PENTHOUSE_CAMERA_CONFIG.maxDistance}
      minPolarAngle={PENTHOUSE_CAMERA_CONFIG.minPolarAngle}
      maxPolarAngle={PENTHOUSE_CAMERA_CONFIG.maxPolarAngle}
    />
  );
}

export function PenthouseLobbyScene(): React.ReactElement {
  const storeSlots = useLobbyStore((s) => s.slots);

  useEffect(() => {
    AudioEngine.startPenthouseOceanAmbient();
    return () => {
      AudioEngine.stopPenthouseOceanAmbient();
    };
  }, []);

  return (
    <group>
      <PenthouseCameraController />
      <directionalLight position={[-12, 8, -6]} color={PENTHOUSE_COLORS.sunsetGlow} intensity={2.2} castShadow />
      <ambientLight color="#FEF3C7" intensity={0.85} />
      <pointLight position={[0, 4.2, 0]} color="#FFFBEB" intensity={1.6} distance={8} />

      {/* Kiến trúc nội thất Penthouse (Vách kính cong 180 độ, nẹp nhôm xước than chì, sàn cẩm thạch Carrara MeshReflectorMaterial, trần giật cấp đèn cove) */}
      <PenthouseEnclosure />
      <PenthouseTable />
      <CentralHologram />
      <PenthouseChairsAndPlayers slots={storeSlots} />
    </group>
  );
}
