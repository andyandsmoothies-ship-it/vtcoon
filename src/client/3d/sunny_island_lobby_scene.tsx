// [TC-P3.1/MSS][IMP-21] SunnyIslandLobbyScene — Sảnh Chờ Sa Bàn Đảo Vịnh Nhiệt Đới Ngoài Trời
// Kích hoạt Bất Biến Một Thế Giới Đồng Nhất (Single Cohesive World Invariant) & Billboard chống lật chữ 100%
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Text, Billboard } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Group } from 'three';
import { useLobbyStore } from '../store/lobby_store';
import { type LobbySlot } from '../store/lobby_types';
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme';
import { AudioEngine } from '../audio/audio_engine';
import { CoastalIslandEnvironment } from './coastal_island_environment';
import { MiniatureCityDiorama } from './miniature_city_diorama';
import { LuxuryPawnModel } from './luxury_pawn_models';

export const SEAT_ANGLES_DEG = [125, 215, 305, 35] as const;

export function calculateSeatPosition(
  seatIndex: number,
  distance: number = 2.45
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

export function calculateAvatarBob(time: number, seatIndex: number): number {
  const safeTime = Number.isFinite(time) ? time : 0;
  const safeIdx = Number.isFinite(seatIndex) ? seatIndex : 0;
  return Math.sin(safeTime * 2.4 + safeIdx * 1.5) * 0.012;
}

export const SUNNY_LOBBY_CAMERA_CONFIG = {
  initialPosition: [5.0, 3.8, 6.2] as const,
  target: [0, 0.65, 0] as const,
  minDistance: 3.5,
  maxDistance: 13.5,
  minPolarAngle: Math.PI / 4.8,
  maxPolarAngle: Math.PI / 2.15,
} as const;

export const SUNNY_LOBBY_COLORS = {
  sandstone: '#FAF8F5',
  teakTrim: '#78350F',
  goldTrim: '#F59E0B',
  marblePedestal: '#FFFFFF',
  waterTurquoise: '#06B6D4',
  sunlight: '#FFFBEB',
  skyAmbient: '#E0F2FE',
  groundAmbient: '#FEF3C7',
} as const;

/**
 * Kỳ Đài Bến Cảng Du Thuyền Đảo Ngọc (Marina Waterfront Plaza)
 */
export function MarinaWaterfrontPlaza(): React.ReactElement {
  return (
    <group position={[0, 0, 0]}>
      {/* 1. Thềm đài tròn đá sa thạch trắng viền gỗ tếch tắm nắng */}
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[4.4, 4.6, 0.28, 48]} />
        <meshStandardMaterial color={SUNNY_LOBBY_COLORS.sandstone} roughness={0.22} metalness={0.06} />
      </mesh>

      {/* 2. Vành nẹp gỗ tếch ven bờ */}
      <mesh position={[0, 0.281, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.45, 4.6, 64]} />
        <meshStandardMaterial color={SUNNY_LOBBY_COLORS.teakTrim} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* 3. Vành nẹp đồng mạ vàng Champagne sang trọng */}
      <mesh position={[0, 0.282, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.25, 4.45, 64]} />
        <meshStandardMaterial color={SUNNY_LOBBY_COLORS.goldTrim} metalness={0.65} roughness={0.25} />
      </mesh>

      {/* 4. Vòng trang trí la bàn hàng hải */}
      <mesh position={[0, 0.283, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.08, 2.14, 48]} />
        <meshStandardMaterial color={SUNNY_LOBBY_COLORS.goldTrim} metalness={0.65} roughness={0.25} />
      </mesh>

      {/* 5. Tâm đài: Đài phun nước / Hồ tinh thể ngọc bích */}
      <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.9, 1.0, 0.12, 32]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.405, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.03, 32]} />
        <meshStandardMaterial
          color={SUNNY_LOBBY_COLORS.waterTurquoise}
          emissive={SUNNY_LOBBY_COLORS.waterTurquoise}
          emissiveIntensity={1.0}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 0.88, 32]} />
        <meshStandardMaterial color={SUNNY_LOBBY_COLORS.goldTrim} metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
  );
}

/**
 * 4 Bệ cẩm thạch đón nắng & Hiển thị linh vật cờ thượng lưu
 */
export function SunnyIslandLobbyPedestals({ slots }: { slots: readonly LobbySlot[] }): React.ReactElement {
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
        child.position.y = 0.38 + bob;
      });
    }
  });

  return (
    <group ref={charactersRef}>
      {fixedSlots.map((slot, idx) => {
        const pos = calculateSeatPosition(idx, 2.3);
        const rotY = calculateSeatRotationY(idx);
        const isOccupied = slot.isOccupied;
        const tokenColor = slot.tokenColor || PLAYER_TOKEN_PALETTE[idx % PLAYER_TOKEN_PALETTE.length] || '#38BDF8';

        return (
          <group key={slot.slotIndex} position={[pos[0], 0.28, pos[2]]} rotation={[0, rotY, 0]}>
            {/* Bệ đá cẩm thạch tròn tắm nắng viền vàng Champagne */}
            <mesh position={[0, 0.17, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.62, 0.7, 0.34, 32]} />
              <meshStandardMaterial color={SUNNY_LOBBY_COLORS.marblePedestal} roughness={0.18} metalness={0.05} />
            </mesh>
            <mesh position={[0, 0.34, 0]} castShadow>
              <cylinderGeometry args={[0.65, 0.65, 0.04, 32]} />
              <meshStandardMaterial color={SUNNY_LOBBY_COLORS.goldTrim} metalness={0.65} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.36, 0]}>
              <cylinderGeometry args={[0.54, 0.54, 0.02, 32]} />
              <meshStandardMaterial color="#0F172A" roughness={0.4} />
            </mesh>

            {/* Linh vật cờ thượng lưu hoặc Vị trí trống */}
            {isOccupied ? (
              <group position={[0, 0.37, 0]}>
                <LuxuryPawnModel slotIndex={idx} />

                {/* Bảng tên 3D dùng Billboard chống lộn ngược chữ ĐNOЯT 100% */}
                <group position={[0, 1.05, 0]}>
                  <Billboard follow lockX={false} lockY={false} lockZ={false}>
                    <RoundedBox args={[1.2, 0.28, 0.02]} radius={0.04} smoothness={3}>
                      <meshStandardMaterial color="#0F172A" transparent opacity={0.9} />
                    </RoundedBox>
                    <Text
                      position={[-0.04, 0.01, 0.02]}
                      fontSize={0.095}
                      color={tokenColor}
                      anchorX="center"
                      anchorY="middle"
                      maxWidth={0.9}
                    >
                      {slot.isHost ? '👑 ' : slot.isBot ? '🤖 ' : ''}{slot.playerName || `Người chơi ${idx + 1}`}
                    </Text>
                    <mesh position={[0.48, 0.01, 0.02]}>
                      <circleGeometry args={[0.035, 16]} />
                      <meshBasicMaterial color={slot.isReady ? '#10B981' : '#F59E0B'} />
                    </mesh>
                  </Billboard>
                </group>
              </group>
            ) : (
              <group position={[0, 0.37, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                  <ringGeometry args={[0.22, 0.34, 32]} />
                  <meshBasicMaterial color={SUNNY_LOBBY_COLORS.waterTurquoise} transparent opacity={0.65} />
                </mesh>
                <group position={[0, 0.46, 0]}>
                  <Billboard follow lockX={false} lockY={false} lockZ={false}>
                    <Text position={[0, 0, 0]} fontSize={0.095} color="#0284C7" anchorX="center" anchorY="middle">
                      VỊ TRÍ TRỐNG
                    </Text>
                  </Billboard>
                </group>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

/**
 * Điều khiển Camera điện ảnh toàn cảnh Vịnh Biển
 */
export function SunnyIslandCameraController(): React.ReactElement {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useEffect(() => {
    camera.position.set(
      SUNNY_LOBBY_CAMERA_CONFIG.initialPosition[0],
      SUNNY_LOBBY_CAMERA_CONFIG.initialPosition[1],
      SUNNY_LOBBY_CAMERA_CONFIG.initialPosition[2]
    );
    camera.lookAt(
      SUNNY_LOBBY_CAMERA_CONFIG.target[0],
      SUNNY_LOBBY_CAMERA_CONFIG.target[1],
      SUNNY_LOBBY_CAMERA_CONFIG.target[2]
    );
    if (controlsRef.current) {
      controlsRef.current.target.set(
        SUNNY_LOBBY_CAMERA_CONFIG.target[0],
        SUNNY_LOBBY_CAMERA_CONFIG.target[1],
        SUNNY_LOBBY_CAMERA_CONFIG.target[2]
      );
      controlsRef.current.update();
    }
  }, [camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      target={[SUNNY_LOBBY_CAMERA_CONFIG.target[0], SUNNY_LOBBY_CAMERA_CONFIG.target[1], SUNNY_LOBBY_CAMERA_CONFIG.target[2]]}
      autoRotate
      autoRotateSpeed={0.35}
      enableDamping
      dampingFactor={0.05}
      minDistance={SUNNY_LOBBY_CAMERA_CONFIG.minDistance}
      maxDistance={SUNNY_LOBBY_CAMERA_CONFIG.maxDistance}
      minPolarAngle={SUNNY_LOBBY_CAMERA_CONFIG.minPolarAngle}
      maxPolarAngle={SUNNY_LOBBY_CAMERA_CONFIG.maxPolarAngle}
    />
  );
}

/**
 * Root Coordinator Sảnh Chờ Sa Bàn Đảo Vịnh Nhiệt Đới (Sunny Island Metropolis)
 */
export function SunnyIslandLobbyScene(): React.ReactElement {
  const storeSlots = useLobbyStore((s) => s.slots);

  useEffect(() => {
    AudioEngine.startPenthouseOceanAmbient();
    return () => {
      AudioEngine.stopPenthouseOceanAmbient();
    };
  }, []);

  return (
    <group>
      <SunnyIslandCameraController />

      {/* Ánh sáng tự nhiên ngoài trời rực rỡ */}
      <directionalLight
        position={[12, 22, 10]}
        color={SUNNY_LOBBY_COLORS.sunlight}
        intensity={2.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <ambientLight color={SUNNY_LOBBY_COLORS.skyAmbient} intensity={1.05} />
      <hemisphereLight args={['#38BDF8', '#FEF3C7', 0.85]} />
      <pointLight position={[0, 4.0, 0]} color={SUNNY_LOBBY_COLORS.sunlight} intensity={1.4} distance={12} />

      {/* 1. Đại dương nhiệt đới vô cực, bãi cát vát nghiêng 15 độ, ca-nô & hải âu */}
      <CoastalIslandEnvironment />

      {/* 2. Đô thị sa bàn đồ chơi cao ốc Landmark, cầu Ba Son & Long Biên */}
      <MiniatureCityDiorama />

      {/* 3. Kỳ Đài Bến Cảng Du Thuyền Đảo Ngọc */}
      <MarinaWaterfrontPlaza />

      {/* 4. 4 Bệ cẩm thạch đón nắng & Linh vật cờ */}
      <SunnyIslandLobbyPedestals slots={storeSlots} />
    </group>
  );
}
