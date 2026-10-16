// [UI-S02/MSS][IMP-402] DioramaChainReaction — O(1) UnifiedToyboxHitPlane & 5-Stage Central Diorama Awakening
import React, { useEffect, useMemo, useRef } from 'react';
import type { Group, Mesh } from 'three';
import { SoundEngine } from '../audio/sound_engine';
import { useGameStore } from '../store/game_store';
import { isPhoneHardware } from './device_detect';
import { useSafeFrame } from './safe_frame';
import {
  CHAIN_REACTION_STAGE_SPECS,
  CHAIN_REACTION_TTL_MS,
  computeEconomicAwakeningSignature,
  createScratchChainReactionSnapshot,
  evaluateDioramaChainReaction,
} from './toybox_wealth_tray_visuals';

export interface DioramaChainReactionProps {
  readonly isMobile?: boolean;
  readonly isVisible?: boolean;
  readonly lastHoseTuple?: readonly [string | number | null | undefined, number | null | undefined];
  readonly landmarkGroupRefs?: React.MutableRefObject<Array<Group | null>>;
}

export interface DioramaChainReactionFrameLoopProps {
  readonly isVisible: boolean;
  readonly triggerStartMsRef: React.MutableRefObject<number | null>;
  readonly stageGroupRefs: React.MutableRefObject<Array<Group | null>>;
  readonly stageRingRefs: React.MutableRefObject<Array<Mesh | null>>;
  readonly landmarkGroupRefs?: React.MutableRefObject<Array<Group | null>>;
}

export function DioramaChainReactionFrameLoop({
  isVisible,
  triggerStartMsRef,
  stageGroupRefs,
  stageRingRefs,
  landmarkGroupRefs,
}: DioramaChainReactionFrameLoopProps): null {
  const scratchSnapshotRef = useRef(createScratchChainReactionSnapshot());

  useSafeFrame(() => {
    if (!isVisible || triggerStartMsRef.current === null) return;
    const elapsedMs = Date.now() - triggerStartMsRef.current;
    const snapshot = evaluateDioramaChainReaction(elapsedMs, CHAIN_REACTION_TTL_MS, scratchSnapshotRef.current);

    if (snapshot.isExpired) {
      for (let i = 0; i < CHAIN_REACTION_STAGE_SPECS.length; i++) {
        const spec = CHAIN_REACTION_STAGE_SPECS[i];
        const grp = stageGroupRefs.current[i];
        const ring = stageRingRefs.current[i];
        const landmark = landmarkGroupRefs?.current[i];
        if (grp && spec) {
          grp.position.y = spec.worldPosition[1];
        }
        if (ring) {
          ring.visible = false;
          ring.scale.set(1, 1, 1);
        }
        if (landmark) {
          landmark.position.y = 0;
          landmark.scale.set(1, 1, 1);
        }
      }
      triggerStartMsRef.current = null;
      return;
    }

    for (let i = 0; i < snapshot.stages.length; i++) {
      const st = snapshot.stages[i];
      const spec = CHAIN_REACTION_STAGE_SPECS[i];
      const grp = stageGroupRefs.current[i];
      const ring = stageRingRefs.current[i];
      const landmark = landmarkGroupRefs?.current[i];
      if (!st || !spec) continue;
      if (grp) {
        grp.position.y = spec.worldPosition[1] + st.yOffset;
      }
      if (ring) {
        ring.visible = st.isTriggered && st.intensity > 0.01;
        ring.scale.set(st.ringScale, st.ringScale, 1);
      }
      if (landmark) {
        landmark.position.y = st.yOffset;
        landmark.scale.set(1, Number((1 + st.yOffset * 0.75).toFixed(4)), 1);
      }
    }
  });
  return null;
}

export function DioramaChainReaction(props?: DioramaChainReactionProps): React.ReactElement | null {
  const isMobile = props?.isMobile ?? isPhoneHardware();
  const isVisible = props?.isVisible ?? true;
  const hookPlayersInfo = useGameStore((s) => s.playersInfo);
  const hookLevelMap = useGameStore((s) => s.levelMap);
  const hookActiveModal = useGameStore((s) => s.activeModal);
  const hookModalPayload = useGameStore((s) => s.modalPayload);
  const hookTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const hookFloatingTexts = useGameStore((s) => s.floatingTexts);
  const liveState = useGameStore.getState();
  const playersInfo = Object.keys(hookPlayersInfo).length > 0 ? hookPlayersInfo : liveState.playersInfo;
  const levelMap = Object.keys(hookLevelMap).length > 0 ? hookLevelMap : liveState.levelMap;
  const activeModal = hookActiveModal ?? liveState.activeModal;
  const modalPayload = hookModalPayload ?? liveState.modalPayload;
  const currentTurnPlayerId = hookTurnPlayerId ?? liveState.currentTurnPlayerId;
  const floatingTexts = hookFloatingTexts.length > 0 ? hookFloatingTexts : liveState.floatingTexts;

  const derivedHoseTuple = useMemo<readonly [string | number | null | undefined, number | null | undefined] | undefined>(() => {
    if (props?.lastHoseTuple) return props.lastHoseTuple;
    if (activeModal === 'hose' && modalPayload && 'lastPayout' in modalPayload) {
      return [currentTurnPlayerId ?? 'hose', modalPayload.lastPayout ?? 0];
    }
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      if (ft && ft.actionType === 'hose') {
        return [ft.playerId, ft.timestamp];
      }
    }
    return undefined;
  }, [props?.lastHoseTuple, activeModal, modalPayload, currentTurnPlayerId, floatingTexts]);

  const signature = useMemo(
    () => (isMobile ? '' : computeEconomicAwakeningSignature(playersInfo, levelMap, derivedHoseTuple)),
    [isMobile, playersInfo, levelMap, derivedHoseTuple]
  );

  const prevSigRef = useRef<string>(signature);
  const triggerStartMsRef = useRef<number | null>(null);
  const stageGroupRefs = useRef<Array<Group | null>>([]);
  const stageRingRefs = useRef<Array<Mesh | null>>([]);

  useEffect(() => {
    if (isMobile || !signature) return;
    if (prevSigRef.current && prevSigRef.current !== signature) {
      triggerStartMsRef.current = Date.now();
    }
    prevSigRef.current = signature;
  }, [isMobile, signature]);

  if (isMobile) return null;

  const handleHitPlaneClick = (e?: { stopPropagation?: () => void }): void => {
    e?.stopPropagation?.();
    triggerStartMsRef.current = Date.now();
    SoundEngine.playWaterRipple();
  };

  return (
    <group name="DioramaChainReaction" data-testid="diorama-chain-reaction">
      <DioramaChainReactionFrameLoop
        isVisible={isVisible}
        triggerStartMsRef={triggerStartMsRef}
        stageGroupRefs={stageGroupRefs}
        stageRingRefs={stageRingRefs}
        landmarkGroupRefs={props?.landmarkGroupRefs}
      />
      <mesh
        name="UnifiedToyboxHitPlane"
        data-testid="unified-toybox-hit-plane"
        position={[0, 0.025, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleHitPlaneClick}
      >
        <planeGeometry args={[14.4, 14.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {CHAIN_REACTION_STAGE_SPECS.map((spec, idx) => (
        <group
          key={spec.id}
          name={`ChainStage_${spec.id}`}
          position={[...spec.worldPosition]}
          ref={(el) => {
            stageGroupRefs.current[idx] = el;
          }}
        >
          <mesh
            visible={false}
            rotation={[-Math.PI / 2, 0, 0]}
            ref={(el) => {
              stageRingRefs.current[idx] = el;
            }}
          >
            <ringGeometry args={[spec.baseRadius * 0.78, spec.baseRadius, 24]} />
            <meshBasicMaterial color={spec.accentColor} transparent opacity={0.62} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
