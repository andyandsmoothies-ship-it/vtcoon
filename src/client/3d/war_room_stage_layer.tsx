// [UI-S01/MSS][IMP-403] WarRoomStageLayer — Desktop War Room Gavel/Scale (.glb) & Tycoon Diplomacy Halos
import React, { useEffect, useMemo, useRef } from 'react';
import type { Group, Mesh } from 'three';
import type { PendingTradeOfferDelta } from '../../domain/protocol/index';
import { useGameStore, type ModalPayloadMap, type PlayerHudInfo } from '../store/game_store';
import { SafeGLTFModel } from './asset_loader/safe_gltf_model';
import { isPhoneHardware } from './device_detect';
import { useSafeFrame } from './safe_frame';
import {
  WAR_ROOM_MODEL_URLS,
  WAR_ROOM_TTL_MS,
  createDiplomacySpeechBubbleTexture,
  disposeDiplomacySpeechBubbleTextures,
  evaluateWarRoomAuctionGavel,
  evaluateWarRoomTradeScale,
  getTycoonDiplomacyHaloDescriptors,
  getWarRoomStageDescriptor,
} from './war_room_stage_visuals';

export interface WarRoomStageLayerProps {
  readonly isMobile?: boolean;
  readonly playersInfo?: Readonly<Record<string, PlayerHudInfo>> | null;
  readonly levelMap?: Record<number, 0 | 1 | 2 | 3>;
  readonly auction?: ModalPayloadMap['auction'] | null;
  readonly pendingTradeOffer?: PendingTradeOfferDelta | null;
  readonly showSpeechBubbles?: boolean;
}

export interface WarRoomStageFrameLoopProps {
  readonly auction: ModalPayloadMap['auction'] | null | undefined;
  readonly pendingTradeOffer: PendingTradeOfferDelta | null | undefined;
  readonly playersInfo: Readonly<Record<string, PlayerHudInfo>> | null | undefined;
  readonly levelMap: Record<number, 0 | 1 | 2 | 3> | undefined;
  readonly gavelGroupRef: React.MutableRefObject<Group | null>;
  readonly scaleGroupRef: React.MutableRefObject<Group | null>;
  readonly daisRingRef: React.MutableRefObject<Mesh | null>;
  readonly auctionStartMsRef: React.MutableRefObject<number | null>;
}

const STAGE_DESCRIPTOR = getWarRoomStageDescriptor();

export function WarRoomStageFrameLoop(props: WarRoomStageFrameLoopProps): null {
  const {
    auction,
    pendingTradeOffer,
    playersInfo,
    levelMap,
    gavelGroupRef,
    scaleGroupRef,
    daisRingRef,
    auctionStartMsRef,
  } = props;

  useSafeFrame(() => {
    const gavelGroup = gavelGroupRef.current;
    const daisRing = daisRingRef.current;
    const scaleGroup = scaleGroupRef.current;

    if (!auction || auctionStartMsRef.current === null) {
      if (gavelGroup) {
        gavelGroup.position.y = STAGE_DESCRIPTOR.gavelWorldPosition[1];
        gavelGroup.rotation.x = 0;
      }
      if (daisRing) {
        daisRing.scale.set(1, 1, 1);
      }
    } else {
      const elapsedMs = Math.max(0, Date.now() - auctionStartMsRef.current);
      const gavelState = evaluateWarRoomAuctionGavel(auction, elapsedMs, WAR_ROOM_TTL_MS);
      if (gavelState.isExpired || !gavelState.isActive) {
        auctionStartMsRef.current = null;
        if (gavelGroup) {
          gavelGroup.position.y = STAGE_DESCRIPTOR.gavelWorldPosition[1];
          gavelGroup.rotation.x = 0;
        }
        if (daisRing) {
          daisRing.scale.set(1, 1, 1);
        }
      } else {
        if (gavelGroup) {
          gavelGroup.position.y = STAGE_DESCRIPTOR.gavelWorldPosition[1] + gavelState.gavelYOffset;
          gavelGroup.rotation.x = gavelState.gavelStrikeAngleRad;
        }
        if (daisRing) {
          const s = gavelState.soundBlockPulseScale;
          daisRing.scale.set(s, 1, s);
        }
      }
    }

    if (scaleGroup) {
      if (!pendingTradeOffer) {
        scaleGroup.rotation.z = 0;
      } else {
        const scaleState = evaluateWarRoomTradeScale(pendingTradeOffer, playersInfo, levelMap);
        scaleGroup.rotation.z = scaleState.isActive ? scaleState.scaleTiltRad : 0;
      }
    }
  });

  return null;
}

export function WarRoomStageLayer(props?: WarRoomStageLayerProps): React.ReactElement | null {
  const isMobile = props?.isMobile ?? isPhoneHardware();
  const hookPlayersInfo = useGameStore((s) => s.playersInfo);
  const hookLevelMap = useGameStore((s) => s.levelMap);
  const hookModalType = useGameStore((s) => s.activeModal);
  const hookModalPayload = useGameStore((s) => s.modalPayload);
  const hookPendingTrade = useGameStore((s) => s.pendingTradeOffer);
  const liveState = useGameStore.getState();

  const storePlayersInfo =
    Object.keys(hookPlayersInfo).length > 0 ? hookPlayersInfo : liveState.playersInfo;
  const storeLevelMap =
    Object.keys(hookLevelMap).length > 0 ? hookLevelMap : liveState.levelMap;
  const effectivePlayers = props?.playersInfo ?? storePlayersInfo;
  const effectiveLevelMap = props?.levelMap ?? storeLevelMap;

  const storeAuction =
    (hookModalType === 'auction' ? (hookModalPayload as ModalPayloadMap['auction']) : null) ??
    (liveState.activeModal === 'auction' ? (liveState.modalPayload as ModalPayloadMap['auction']) : null);
  const effectiveAuction = props?.auction !== undefined ? props.auction : storeAuction;
  const effectiveTradeOffer =
    props?.pendingTradeOffer !== undefined
      ? props.pendingTradeOffer
      : (hookPendingTrade ?? liveState.pendingTradeOffer);

  const gavelGroupRef = useRef<Group | null>(null);
  const scaleGroupRef = useRef<Group | null>(null);
  const daisRingRef = useRef<Mesh | null>(null);
  const auctionStartMsRef = useRef<number | null>(null);
  const lastAuctionSigRef = useRef<string>('');

  const auctionSig = effectiveAuction
    ? `${effectiveAuction.cellIndex}:${effectiveAuction.currentBid}:${effectiveAuction.highestBidderId ?? ''}`
    : '';

  useEffect(() => {
    if (isMobile) return;
    if (!auctionSig) {
      lastAuctionSigRef.current = '';
      auctionStartMsRef.current = null;
      return;
    }
    if (auctionSig !== lastAuctionSigRef.current) {
      lastAuctionSigRef.current = auctionSig;
      auctionStartMsRef.current = Date.now();
    }
  }, [isMobile, auctionSig]);

  useEffect(() => {
    return () => {
      disposeDiplomacySpeechBubbleTextures();
    };
  }, []);

  const bundle = useMemo(() => {
    if (isMobile || !effectivePlayers || Object.keys(effectivePlayers).length === 0) {
      return null;
    }
    SafeGLTFModel.preload(WAR_ROOM_MODEL_URLS.gavel);
    SafeGLTFModel.preload(WAR_ROOM_MODEL_URLS.scale);
    const stage = getWarRoomStageDescriptor();
    const halos = getTycoonDiplomacyHaloDescriptors(effectivePlayers, effectiveLevelMap);
    return { stage, halos };
  }, [isMobile, effectivePlayers, effectiveLevelMap]);

  if (!bundle) return null;
  const { stage, halos } = bundle;
  const [dx, , dz] = stage.daisPosition;

  const showSpeechBubbles = Boolean(props?.showSpeechBubbles);

  return (
    <group name="WarRoomStageLayer" data-testid="war-room-stage-layer">
      {/* 4-Tier Stepped Indochine War Room Island Dais at [-3.8, -0.28, 11.6] */}
      <group name="WarRoomDais" data-testid="war-room-dais">
        <mesh position={[dx, -0.305, dz]} receiveShadow>
          <cylinderGeometry args={[stage.daisRadius * 0.94, stage.daisRadius, 0.04, 24]} />
          <meshStandardMaterial color="#06B6D4" roughness={0.65} metalness={0.04} transparent opacity={0.78} />
        </mesh>
        <mesh position={[dx, -0.28, dz]} receiveShadow>
          <cylinderGeometry args={[stage.sandRadius * 0.92, stage.sandRadius, 0.12, 24]} />
          <meshStandardMaterial color="#EFE5D8" roughness={0.85} metalness={0.02} />
        </mesh>
        <mesh position={[dx, -0.20, dz]} castShadow receiveShadow>
          <boxGeometry args={[stage.rimWidth, 0.08, stage.rimWidth]} />
          <meshStandardMaterial color="#D97706" roughness={0.24} metalness={0.85} />
        </mesh>
        <mesh position={[dx, -0.13, dz]} castShadow receiveShadow>
          <boxGeometry args={[stage.deckWidth, 0.10, stage.deckWidth]} />
          <meshStandardMaterial color="#2B1D14" roughness={0.26} metalness={0.12} />
        </mesh>
        <mesh position={[dx, -0.078, dz]} receiveShadow>
          <boxGeometry args={[stage.deckWidth * 0.88, 0.016, stage.deckWidth * 0.88]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.20} metalness={0.08} />
        </mesh>
        <mesh ref={daisRingRef} position={[dx, -0.072, dz]}>
          <cylinderGeometry args={[0.64, 0.68, 0.018, 24]} />
          <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.45} metalness={0.9} roughness={0.18} />
        </mesh>
      </group>

      {/* Blender 5.2 Sculpted Auction Gavel (.glb) & P2P Trade Balance Scale (.glb) */}
      <group
        ref={gavelGroupRef}
        name="WarRoomAuctionGavelGroup"
        position={[...stage.gavelWorldPosition]}
        rotation={[0, stage.gavelRotationY, 0]}
      >
        <SafeGLTFModel
          url={WAR_ROOM_MODEL_URLS.gavel}
          scale={[...stage.gavelScale]}
          castShadow
          receiveShadow
          fallback={<group />}
        />
      </group>
      <group
        ref={scaleGroupRef}
        name="WarRoomTradeScaleGroup"
        position={[...stage.scaleWorldPosition]}
        rotation={[0, stage.scaleRotationY, 0]}
      >
        <SafeGLTFModel
          url={WAR_ROOM_MODEL_URLS.scale}
          scale={[...stage.scaleModelScale]}
          castShadow
          receiveShadow
          fallback={<group />}
        />
      </group>

      {/* 4 Compact Sanctuary Diplomacy Halos (outerRadius = 0.46m) & Opt-In Vietnamese Speech Bubble Billboards */}
      {halos.map((h) => {
        if (!h.isVisible) return null;
        const bubbleTexture = showSpeechBubbles
          ? createDiplomacySpeechBubbleTexture(h.viSlogan, h.accentColor, h.tacticalMode)
          : null;
        return (
          <group key={h.id} name={`TycoonDiplomacyGroup_${h.playerId}`}>
            <mesh
              name={`TycoonDiplomacyHalo_${h.playerId}`}
              data-testid={`tycoon-diplomacy-halo-${h.playerId}`}
              position={[...h.worldPosition]}
            >
              <cylinderGeometry args={[h.outerRadius, h.outerRadius, 0.016, 24]} />
              <meshStandardMaterial
                color={h.accentColor}
                emissive={h.accentColor}
                emissiveIntensity={0.55}
                metalness={0.82}
                roughness={0.22}
              />
            </mesh>
            <group visible={showSpeechBubbles} position={[...h.bubbleWorldPosition]} rotation={[...h.bubbleRotation]}>
              <mesh position={[0, 0, -0.018]}>
                <boxGeometry args={[h.bubbleSize[0] + 0.06, h.bubbleSize[1] + 0.06, 0.024]} />
                <meshStandardMaterial
                  color={h.accentColor}
                  emissive={h.accentColor}
                  emissiveIntensity={0.35}
                  metalness={0.85}
                  roughness={0.20}
                />
              </mesh>
              <mesh
                name="DiplomacySpeechBubble"
                data-testid={`diplomacy-speech-bubble-${h.playerId}`}
                data-vi-slogan={h.viSlogan}
              >
                <planeGeometry args={[h.bubbleSize[0], h.bubbleSize[1]]} />
                <meshBasicMaterial map={bubbleTexture} />
              </mesh>
            </group>
          </group>
        );
      })}

      <WarRoomStageFrameLoop
        auction={effectiveAuction}
        pendingTradeOffer={effectiveTradeOffer}
        playersInfo={effectivePlayers}
        levelMap={effectiveLevelMap}
        gavelGroupRef={gavelGroupRef}
        scaleGroupRef={scaleGroupRef}
        daisRingRef={daisRingRef}
        auctionStartMsRef={auctionStartMsRef}
      />
    </group>
  );
}
