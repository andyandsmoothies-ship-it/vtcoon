// [UI-S04/MSS] Auction3DStage — Dark Spotlight Arena Boost & 3D Collector Card with Tactile Gavel
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { AdditiveBlending, Object3D, type Group, type SpotLight, type PointLight, type MeshStandardMaterial } from 'three';
import { useGameStore, type ModalPayloadMap } from '../store/game_store';
import { getDeedDisplayInfo } from '../ui/modals/modal_helpers';
import { COLOR_GROUP_HEX } from '../../domain/theme';
import { AudioEngine } from '../audio/audio_engine';
import { SapphireLandmarkModel } from './sapphire_landmark_model';
import { generateAuctionDeedTexture } from './auction_deed_texture';
import { AuctionGavel3D } from './auction_gavel_3d';

export { generateAuctionDeedTexture } from './auction_deed_texture';

export const CARD_DIMENSIONS = {
  width: 2.8,
  height: 3.9,
  thickness: 0.08,
  aspectRatio: 3.9 / 2.8,
} as const;

export const AUCTION_COLORS = {
  goldBezel: '#F59E0B',
  goldParticleA: '#FBBF24',
  goldParticleB: '#FEF08A',
  goldParticleC: '#D97706',
  cyanGlow: '#06B6D4',
  cyanLight: '#22D3EE',
  urgentGlow: '#F43F5E',
  urgentLight: '#FDA4AF',
  pedestalBase: '#0F172A',
  spotlightYellow: '#FDE047',
} as const;

export const THEATRICAL_LIGHTING_CONFIG = {
  spotLight: {
    position: [0, 10, 5] as const,
    target: [0, 2.5, 0] as const,
    angle: 0.35,
    penumbra: 0.8,
    intensity: 5.0,
    color: '#FDE047',
  },
  rimLight: {
    position: [0, 0.4, 0] as const,
    intensity: 2.0,
    color: '#06B6D4',
    distance: 8.0,
  },
  ambientDimming: {
    baseAmbient: 0.85,
    darkAmbient: 0.15,
    reductionRatio: 0.85,
  },
} as const;

export interface GoldParticle {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

/**
 * Tính toán độ rọi môi trường sân khấu đấu giá kịch tính
 * Nội suy mượt mà giảm 85% cường độ ánh sáng nền khi phiên đấu giá diễn ra
 */
export function calculateTheatricalAmbientIntensity(
  currentIntensity: number,
  isAuctionActive: boolean,
  delta: number,
  baseAmbient: number = 0.85,
  targetDarkAmbient: number = 0.15
): number {
  const safeDt = Math.min(Math.max(delta, 0), 0.1);
  const target = isAuctionActive ? targetDarkAmbient : baseAmbient;
  const lerpFactor = 1 - Math.exp(-safeDt * 3.5);
  const next = currentIntensity + (target - currentIntensity) * lerpFactor;
  return Number.isFinite(next) ? Math.max(0, next) : target;
}

/**
 * Tính toán góc nghiêng Parallax cho Thẻ Sổ Đỏ dựa trên tọa độ con trỏ [-1, 1]
 */
export function calculateParallaxTilt(
  pointerX: number,
  pointerY: number
): { rotX: number; rotY: number } {
  const safeX = Number.isFinite(pointerX) ? Math.max(-1, Math.min(1, pointerX)) : 0;
  const safeY = Number.isFinite(pointerY) ? Math.max(-1, Math.min(1, pointerY)) : 0;
  const rx = -safeY * 0.25;
  const ry = safeX * 0.35;
  return {
    rotX: rx === 0 ? 0 : rx,
    rotY: ry === 0 ? 0 : ry,
  };
}

/**
 * Tính toán màu sắc và cường độ phát quang của vòng tròn bục nâng
 * Bình thường: Xanh Cyan êm đềm; Khi timeRemaining <= 5s: Đỏ rực nhấp nháy 8Hz
 */
export function calculateUrgentAuraColor(
  timeRemaining: number,
  elapsedTime: number
): { color: string; emissiveIntensity: number } {
  if (!Number.isFinite(timeRemaining) || timeRemaining > 5) {
    return { color: AUCTION_COLORS.cyanGlow, emissiveIntensity: 3.2 };
  }
  const safeTime = Math.max(0, timeRemaining);
  const safeElapsed = Number.isFinite(elapsedTime) ? elapsedTime : 0;
  const pulse = Math.sin(safeElapsed * (8.0 + (5 - safeTime) * 1.5));
  const intensity = 4.2 + Math.max(0, pulse) * 3.5;
  const color = pulse > 0 ? AUCTION_COLORS.urgentGlow : AUCTION_COLORS.urgentLight;
  return { color, emissiveIntensity: Number.isFinite(intensity) ? intensity : 4.2 };
}

/**
 * Tính toán độ nảy đàn hồi (Spring Recoil) của Thẻ Sổ Đỏ khi nhận cú gõ búa bước giá mới
 */
export function calculateCardSpringRecoil(elapsedSinceStrike: number): number {
  if (!Number.isFinite(elapsedSinceStrike) || elapsedSinceStrike < 0 || elapsedSinceStrike > 0.6) {
    return 1.0;
  }
  const envelope = Math.exp(-elapsedSinceStrike * 8.0);
  const oscillation = Math.sin(elapsedSinceStrike * 28.0);
  return 1.0 + 0.08 * envelope * oscillation;
}

/**
 * Khởi tạo chùm hạt pháo hoa bụi vàng nổ tung khi có bước giá mới
 */
export function createInitialParticles(count: number = 72): GoldParticle[] {
  const safeCount = Number.isFinite(count) && count > 0 ? Math.min(Math.floor(count), 200) : 0;
  if (safeCount === 0) return [];
  const colors = [
    AUCTION_COLORS.goldParticleA,
    AUCTION_COLORS.goldParticleB,
    AUCTION_COLORS.goldParticleC,
  ];
  return Array.from({ length: safeCount }, (_, i) => {
    const angle = (i / safeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const speed = 1.6 + Math.random() * 2.8;
    const maxLife = 1.0 + Math.random() * 0.8;
    return {
      id: i,
      x: (Math.random() - 0.5) * 0.5,
      y: 3.1 + (Math.random() - 0.5) * 0.5,
      z: (Math.random() - 0.5) * 0.5,
      vx: Math.cos(angle) * speed,
      vy: 2.2 + Math.random() * 2.5,
      vz: Math.sin(angle) * speed,
      size: 0.035 + Math.random() * 0.045,
      life: maxLife,
      maxLife,
      color: colors[i % colors.length] ?? AUCTION_COLORS.goldParticleA,
    };
  });
}

/**
 * Cập nhật tọa độ và trọng lực vi mô cho chùm hạt
 */
export function updateParticles(particles: GoldParticle[], delta: number): GoldParticle[] {
  const safeDt = Math.min(Math.max(delta, 0), 0.1);
  return particles
    .map((p) => {
      const nextLife = p.life - safeDt;
      return {
        ...p,
        x: p.x + p.vx * safeDt,
        y: p.y + p.vy * safeDt,
        z: p.z + p.vz * safeDt,
        vy: p.vy - 4.2 * safeDt,
        life: Math.max(0, nextLife),
      };
    })
    .filter((p) => p.life > 0);
}

export interface Auction3DStageProps {
  readonly cellIndex?: number;
  readonly currentBid?: number;
  readonly highestBidderId?: string | null;
  readonly timeRemaining?: number;
  readonly forceVisible?: boolean;
}

export interface AuctionAnimationRefs {
  readonly cardGroupRef: React.RefObject<Group | null>;
  readonly pedestalRef: React.RefObject<Group | null>;
  readonly spotLightRef: React.RefObject<SpotLight | null>;
  readonly rimLightRef: React.RefObject<PointLight | null>;
  readonly auraMaterialRef: React.RefObject<MeshStandardMaterial | null>;
  readonly strikeTimerRef: React.MutableRefObject<number>;
}

/**
 * Hook điều khiển chuyển động Parallax Tilt, bục nâng xoay, hào quang khẩn cấp và hạt vàng 60 FPS
 * Cập nhật trực tiếp WebGL uniforms/refs — triệt tiêu 100% hiện tượng re-render React ở 60 FPS
 */
export function useAuctionCardAnimation(
  isAuctionOpen: boolean,
  refs: AuctionAnimationRefs,
  setParticles: React.Dispatch<React.SetStateAction<GoldParticle[]>>,
  timeRemaining: number
): void {
  useFrame((state, delta) => {
    if (!isAuctionOpen) return;

    // 1. Xoay nhẹ bục nâng phát sáng
    if (refs.pedestalRef.current) {
      refs.pedestalRef.current.rotation.y += delta * 0.35;
    }

    // 2. Cập nhật hào quang khẩn cấp và nhịp thở spotlight trực tiếp trên Three.js instances
    const aura = calculateUrgentAuraColor(timeRemaining, state.clock.elapsedTime);
    if (refs.rimLightRef.current) {
      refs.rimLightRef.current.color.set(aura.color);
    }
    if (refs.auraMaterialRef.current) {
      refs.auraMaterialRef.current.color.set(aura.color);
      refs.auraMaterialRef.current.emissive.set(aura.color);
      refs.auraMaterialRef.current.emissiveIntensity = aura.emissiveIntensity;
    }
    if (refs.spotLightRef.current && timeRemaining <= 5) {
      const pulse = Math.sin(state.clock.elapsedTime * 8.0) * 0.6;
      refs.spotLightRef.current.intensity = THEATRICAL_LIGHTING_CONFIG.spotLight.intensity + pulse;
    }

    // 3. Nghiêng thẻ Sổ Đỏ theo vị trí con trỏ chuột (Parallax Tilt) & nhấp nhô bồng bềnh & nảy đàn hồi
    if (refs.cardGroupRef.current) {
      const tilt = calculateParallaxTilt(state.pointer.x, state.pointer.y);
      const targetY = 3.2 + Math.sin(state.clock.elapsedTime * 2.2) * 0.08;
      const targetRotX = -0.15 + tilt.rotX;
      const targetRotY = 0.12 + tilt.rotY;

      refs.strikeTimerRef.current += delta;
      const recoilScale = calculateCardSpringRecoil(refs.strikeTimerRef.current);
      refs.cardGroupRef.current.scale.set(recoilScale, recoilScale, recoilScale);

      refs.cardGroupRef.current.rotation.y += (targetRotY - refs.cardGroupRef.current.rotation.y) * 0.08;
      refs.cardGroupRef.current.rotation.x += (targetRotX - refs.cardGroupRef.current.rotation.x) * 0.08;
      refs.cardGroupRef.current.position.y += (targetY - refs.cardGroupRef.current.position.y) * 0.1;
    }

    // 4. Cập nhật vị trí hạt bụi vàng
    setParticles((prev) => (prev.length > 0 ? updateParticles(prev, delta) : prev));
  });
}

export function Auction3DStage({
  cellIndex: propCellIndex,
  currentBid: propCurrentBid,
  highestBidderId: propHighestBidderId,
  timeRemaining: propTimeRemaining,
  forceVisible = false,
}: Auction3DStageProps): React.ReactElement | null {
  const activeModal = useGameStore((s) => s.activeModal);
  const modalPayload = useGameStore((s) => s.modalPayload);

  const isAuctionOpen = forceVisible || activeModal === 'auction';
  const auctionPayload = modalPayload as ModalPayloadMap['auction'] | null;

  const cellIndex = propCellIndex ?? auctionPayload?.cellIndex ?? 1;
  const currentBid = propCurrentBid ?? auctionPayload?.currentBid ?? 600;
  const timeRemaining = propTimeRemaining ?? auctionPayload?.timeRemaining ?? 15;

  const deed = useMemo(() => getDeedDisplayInfo(cellIndex), [cellIndex]);
  const ribbonColor = deed?.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#F59E0B';
  const propertyName = deed?.name ?? `Ô Đất #${cellIndex}`;
  const basePrice = deed?.price ?? 600;

  const cardGroupRef = useRef<Group>(null);
  const pedestalRef = useRef<Group>(null);
  const spotLightRef = useRef<SpotLight>(null);
  const rimLightRef = useRef<PointLight>(null);
  const auraMaterialRef = useRef<MeshStandardMaterial>(null);
  const prevBidRef = useRef<number>(currentBid);
  const strikeTimerRef = useRef<number>(1.0);

  const [gavelTrigger, setGavelTrigger] = useState<number>(0);
  const [particles, setParticles] = useState<GoldParticle[]>([]);

  // Đối tượng đích cho Spotlight điện ảnh rọi vàng hoàng gia
  const spotLightTarget = useMemo(() => {
    const obj = new Object3D();
    obj.position.set(
      THEATRICAL_LIGHTING_CONFIG.spotLight.target[0],
      THEATRICAL_LIGHTING_CONFIG.spotLight.target[1],
      THEATRICAL_LIGHTING_CONFIG.spotLight.target[2]
    );
    return obj;
  }, []);

  // Chỉ tạo Texture khi sàn mở và dọn dẹp bộ nhớ GPU khi unmount/cập nhật
  const deedTexture = useMemo(() => {
    if (!isAuctionOpen) return null;
    return generateAuctionDeedTexture(cellIndex, propertyName, ribbonColor, basePrice, currentBid);
  }, [isAuctionOpen, cellIndex, propertyName, ribbonColor, basePrice, currentBid]);

  useEffect(() => {
    return () => {
      deedTexture?.dispose();
    };
  }, [deedTexture]);

  // Kích hoạt Búa Vàng 3D, pháo hoa bụi vàng và tiếng búa gõ đanh thép khi mức giá thầu tăng
  useEffect(() => {
    if (currentBid > prevBidRef.current) {
      setParticles(createInitialParticles(72));
      setGavelTrigger((prev) => prev + 1);
      strikeTimerRef.current = 0;
      AudioEngine.playTactileAuctionGavel();
    }
    prevBidRef.current = currentBid;
  }, [currentBid]);

  useAuctionCardAnimation(
    isAuctionOpen,
    {
      cardGroupRef,
      pedestalRef,
      spotLightRef,
      rimLightRef,
      auraMaterialRef,
      strikeTimerRef,
    },
    setParticles,
    timeRemaining
  );

  if (!isAuctionOpen) {
    return null;
  }

  return (
    <group position={[0, 0, 0]}>
      {/* 0. Hệ thống Chiếu sáng Sân khấu Điện ảnh (Theatrical Spotlight Arena) */}
      <primitive object={spotLightTarget} />
      <spotLight
        ref={spotLightRef}
        position={THEATRICAL_LIGHTING_CONFIG.spotLight.position}
        target={spotLightTarget}
        angle={THEATRICAL_LIGHTING_CONFIG.spotLight.angle}
        penumbra={THEATRICAL_LIGHTING_CONFIG.spotLight.penumbra}
        intensity={THEATRICAL_LIGHTING_CONFIG.spotLight.intensity}
        color={THEATRICAL_LIGHTING_CONFIG.spotLight.color}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0005}
      />

      {/* Đèn ven Cyber-Luxury xanh cyan dưới chân bục */}
      <pointLight
        ref={rimLightRef}
        position={THEATRICAL_LIGHTING_CONFIG.rimLight.position}
        color={AUCTION_COLORS.cyanGlow}
        intensity={THEATRICAL_LIGHTING_CONFIG.rimLight.intensity}
        distance={THEATRICAL_LIGHTING_CONFIG.rimLight.distance}
      />

      {/* 1. Bục nâng phát sáng xoay nhẹ (Glowing Rotating Pedestal) */}
      <group ref={pedestalRef} position={[0, 0.08, 0]}>
        {/* Mâm đế đá sẫm vát tròn */}
        <mesh receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[2.5, 2.7, 0.22, 36]} />
          <meshStandardMaterial
            color={AUCTION_COLORS.pedestalBase}
            roughness={0.25}
            metalness={0.8}
            envMapIntensity={1.4}
          />
        </mesh>
        {/* Vành nẹp kim loại vàng Champagne */}
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[2.52, 2.52, 0.04, 36]} />
          <meshStandardMaterial
            color={AUCTION_COLORS.goldBezel}
            roughness={0.12}
            metalness={0.95}
            envMapIntensity={2.0}
          />
        </mesh>
        {/* Vòng phát sáng bục nâng (Aura Ring Emitter: Cyan -> Urgent Crimson) */}
        <mesh position={[0, 0.132, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 2.2, 36]} />
          <meshStandardMaterial
            ref={auraMaterialRef}
            color={AUCTION_COLORS.cyanGlow}
            emissive={AUCTION_COLORS.cyanGlow}
            emissiveIntensity={3.2}
            roughness={0.1}
          />
        </mesh>

        {/* 1.1 Búa Vàng Đấu Giá Hoàng Gia 3D & Vòng Sóng Chấn Động trên bục nâng */}
        <AuctionGavel3D
          position={[1.5, 0.14, 0.8]}
          scale={0.9}
          triggerStrike={gavelTrigger}
        />
      </group>

      {/* 2. Thẻ Sổ Đỏ Holographic 3D (3D Collector Card) */}
      <group ref={cardGroupRef} position={[0, 3.2, 0]} rotation={[-0.15, 0.12, 0]}>
        {/* Khung thẻ bo tròn mép vát mạ vàng Champagne */}
        <RoundedBox
          args={[CARD_DIMENSIONS.width, CARD_DIMENSIONS.height, CARD_DIMENSIONS.thickness]}
          radius={0.08}
          smoothness={4}
          castShadow
        >
          <meshPhysicalMaterial
            color={AUCTION_COLORS.goldBezel}
            roughness={0.12}
            metalness={0.95}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            envMapIntensity={2.5}
          />
        </RoundedBox>

        {/* Mặt trước thẻ bài: Canvas Texture HiDPI */}
        {deedTexture && (
          <mesh position={[0, 0, CARD_DIMENSIONS.thickness / 2 + 0.002]}>
            <planeGeometry args={[CARD_DIMENSIONS.width - 0.1, CARD_DIMENSIONS.height - 0.1]} />
            <meshPhysicalMaterial
              map={deedTexture}
              roughness={0.18}
              metalness={0.35}
              clearcoat={0.8}
              envMapIntensity={1.8}
            />
          </mesh>
        )}

        {/* Mô hình 3D Landmark tùy biến theo phân khu quy hoạch ở trọng tâm thẻ */}
        <SapphireLandmarkModel
          position={[0, 0.05, CARD_DIMENSIONS.thickness / 2 + 0.06]}
          scale={1.05}
          colorGroup={deed?.colorGroup}
        />

        {/* Mặt sau thẻ bài: Biểu trưng VTCOON mạ vàng */}
        <mesh
          position={[0, 0, -CARD_DIMENSIONS.thickness / 2 - 0.002]}
          rotation={[0, Math.PI, 0]}
        >
          <planeGeometry args={[CARD_DIMENSIONS.width - 0.1, CARD_DIMENSIONS.height - 0.1]} />
          <meshPhysicalMaterial
            color="#0B1120"
            roughness={0.25}
            metalness={0.8}
            clearcoat={0.6}
          />
        </mesh>

        {/* Lớp màng tán sắc Holographic phản quang lóng lánh */}
        <mesh position={[0, 0, CARD_DIMENSIONS.thickness / 2 + 0.01]}>
          <planeGeometry args={[CARD_DIMENSIONS.width - 0.08, CARD_DIMENSIONS.height - 0.08]} />
          <meshPhysicalMaterial
            color="#A5F3FC"
            transparent
            opacity={0.18}
            roughness={0.06}
            metalness={0.85}
            clearcoat={1.0}
            blending={AdditiveBlending}
          />
        </mesh>
      </group>

      {/* 3. Chùm hạt pháo hoa bụi vàng nổ tung khi có bước giá mới */}
      {particles.map((p) => (
        <mesh key={p.id} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial
            color={p.color}
            transparent
            opacity={Math.min(1, p.life / (p.maxLife * 0.6))}
          />
        </mesh>
      ))}
    </group>
  );
}
