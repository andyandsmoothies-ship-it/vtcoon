// [UI-S04/MSS] Auction3DStage — Dark Spotlight Arena Boost & 3D Collector Card with Tactile Gavel
// [IMP-64] Constants/particles extracted to auction_particle_engine.ts; animation hook extracted to use_auction_card_animation.ts
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { AdditiveBlending, Object3D, type Group, type SpotLight, type PointLight, type MeshStandardMaterial } from 'three';
import { useGameStore, type ModalPayloadMap } from '../store/game_store';
import { getDeedDisplayInfo } from '../ui/modals/modal_helpers';
import { COLOR_GROUP_HEX } from '../../domain/theme';
import { AudioEngine } from '../audio/audio_engine';
import { SapphireLandmarkModel } from './sapphire_landmark_model';
import { generateAuctionDeedTexture } from './auction_deed_texture';
import { AuctionGavel3D } from './auction_gavel_3d';
import {
  CARD_DIMENSIONS, AUCTION_COLORS, THEATRICAL_LIGHTING_CONFIG,
  createInitialParticles, type GoldParticle,
} from './auction_particle_engine.js';
import { useAuctionCardAnimation, type AuctionAnimationRefs } from './use_auction_card_animation.js';

export { generateAuctionDeedTexture } from './auction_deed_texture';
export {
  CARD_DIMENSIONS, AUCTION_COLORS, THEATRICAL_LIGHTING_CONFIG,
  calculateTheatricalAmbientIntensity, calculateParallaxTilt, calculateUrgentAuraColor,
  calculateCardSpringRecoil, createInitialParticles, updateParticles,
} from './auction_particle_engine.js';
export { useAuctionCardAnimation } from './use_auction_card_animation.js';

export interface Auction3DStageProps {
  readonly cellIndex?: number;
  readonly currentBid?: number;
  readonly highestBidderId?: string | null;
  readonly timeRemaining?: number;
  readonly forceVisible?: boolean;
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
