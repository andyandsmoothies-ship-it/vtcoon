import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { type OrthographicCamera, type PerspectiveCamera } from 'three';
import { useGameStore } from '../store/game_store';
import { useVfxStore } from '../store/vfx_store';
import {
  resolveCameraMode,
  calculateTargetCameraState,
  calculateScreenShake,
  checkHighStakesRoll,
  CAMERA_CONFIG,
} from './camera_state_machine';
import {
  calculateCameraZoom,
  resolveCameraTargetCell,
} from './use_game_camera';
import { cellPosition } from './board_coords';
import { shouldTriggerCinematicCamera } from './cinematic_chase_camera';
import { SoundEngine } from '../audio/sound_engine';

export interface AdaptiveCinematicCameraProps {
  readonly isPreMatch?: boolean;
}

export function AdaptiveCinematicCamera({
  isPreMatch = false,
}: AdaptiveCinematicCameraProps = {}): React.ReactElement {
  const { camera, scene } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const defaultCfg = CAMERA_CONFIG[isPreMatch ? 'pre_match' : 'overview'];
  const defaultPos: [number, number, number] = [defaultCfg.position[0], defaultCfg.position[1], defaultCfg.position[2]];
  const defaultTarget: [number, number, number] = [defaultCfg.target[0], defaultCfg.target[1], defaultCfg.target[2]];
  const camBaseRef = useRef<[number, number, number]>(defaultPos);
  const targetBaseRef = useRef<[number, number, number]>(defaultTarget);
  const isUserInteractingRef = useRef<boolean>(false);
  const lastUserInteractionTimeRef = useRef<number>(0);
  const isResettingRef = useRef<boolean>(true);
  const isManualOverviewResetRef = useRef<boolean>(false);
  const prevModeRef = useRef<string | null>(null);
  const prevHasUserCustomCameraRef = useRef<boolean>(false);
  const isSkippingCameraAnimRef = useRef<boolean>(false);
  const hasSkippedCurrentMoveRef = useRef<boolean>(false);
  const lastSkipTimeRef = useRef<number>(0);

  const isRolling = useGameStore((s) => s.isRolling);
  const hasRolledThisTurn = useGameStore((s) => s.hasRolledThisTurn);
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const activeAnimation = useGameStore((s) => s.activePawnAnimation);
  const playerPositions = useGameStore((s) => s.playerPositions);
  const activeModal = useGameStore((s) => s.activeModal);
  const modalPayload = useGameStore((s) => s.modalPayload);
  const cameraFocusCell = useGameStore((s) => s.cameraFocusCell);
  const hasUserCustomCamera = useGameStore((s) => s.hasUserCustomCamera);
  const activeScreenShake = useVfxStore((s) => s.activeScreenShake);
  const playersInfo = useGameStore((s) => s.playersInfo);
  const levelMap = useGameStore((s) => s.levelMap);

  const rollingPlayerId = currentTurnPlayerId ?? 'p1';
  const rollingPlayer = playersInfo[rollingPlayerId];
  const rollingPos = playerPositions[rollingPlayerId] ?? 0;
  const rollingBalance = rollingPlayer?.balance ?? 0;
  const highStakesResult = checkHighStakesRoll(
    rollingPos,
    rollingBalance,
    playersInfo,
    levelMap,
    rollingPlayerId
  );
  const isHighStakesRoll = highStakesResult.isHighStakes;

  useEffect(() => {
    if (isRolling && isHighStakesRoll) {
      SoundEngine.playHeartbeatPulse();
    } else {
      SoundEngine.stopHeartbeatPulse();
    }
    return () => {
      SoundEngine.stopHeartbeatPulse();
    };
  }, [isRolling, isHighStakesRoll]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__threeScene = scene;
      window.__threeCamera = camera;
      window.__resetCameraToDefault = () => {
        isUserInteractingRef.current = false;
        lastUserInteractionTimeRef.current = 0;
        isResettingRef.current = true;
        isManualOverviewResetRef.current = true;
        camBaseRef.current = [camera.position.x, camera.position.y, camera.position.z];
        targetBaseRef.current = controlsRef.current
          ? [controlsRef.current.target.x, controlsRef.current.target.y, controlsRef.current.target.z]
          : defaultTarget;
        useGameStore.getState().setCameraFocusCell(null);
        useGameStore.getState().setHasUserCustomCamera?.(false);
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.__resetCameraToDefault;
        delete window.__threeScene;
        delete window.__threeCamera;
        delete window.__orbitControls;
      }
    };
  }, [scene, camera]);

  useFrame((_, delta) => {
    if (typeof window !== 'undefined' && window.__debugCameraManual) {
      return;
    }

    const isPawnMoving = activeAnimation?.isAnimating ?? false;
    if (!isPawnMoving) {
      hasSkippedCurrentMoveRef.current = false;
    }

    const currentTurnPlayer = currentTurnPlayerId ? playersInfo[currentTurnPlayerId] : undefined;
    const isBotTurn = Boolean(currentTurnPlayer?.isBot);
    const animatingPlayer = activeAnimation?.playerId ? playersInfo[activeAnimation.playerId] : undefined;
    const isAnimatingPawnBot = Boolean(animatingPlayer?.isBot);
    const targetCell = resolveCameraTargetCell(
      activeAnimation,
      currentTurnPlayerId,
      playerPositions,
      modalPayload as { cellIndex?: number } | null,
      cameraFocusCell
    );

    // [ADV-02] Neo su kien theo o dich den cuoi cung cua luot di thay vi o nhay trung gian
    const finalDestinationCell = activeAnimation?.waypoints?.length
      ? activeAnimation.waypoints[activeAnimation.waypoints.length - 1]
      : (activeAnimation?.targetCell ?? targetCell);
    const isJailFlight = Boolean(activeAnimation?.isJailFlight);
    const shouldCinematic = isPawnMoving
      ? shouldTriggerCinematicCamera({
          isHighStakesRoll,
          cellIndex: finalDestinationCell ?? undefined,
          isJailFlight,
        })
      : false;

    // [USER-BUG-01] Truyen isPawnAnimating: isPawnMoving de resolveCameraMode tra ve 'pawn_chase'
    // Sau do calculateTargetCameraState voi options.cinematicChase: false se tra ve 'overview' cho 80% luot thuong
    const hasTargetTile = (activeModal !== null || hasRolledThisTurn || cameraFocusCell !== null) && targetCell !== null && targetCell !== undefined && Number.isFinite(targetCell);
    const mode = resolveCameraMode({
      isRolling,
      isHighStakesRoll,
      isPawnAnimating: isPawnMoving,
      activeModal,
      hasRolledThisTurn,
      hasTargetTile,
      isPreMatch,
      isBotTurn,
      isAnimatingPawnBot,
    });

    const cellCoords = targetCell !== null && targetCell !== undefined && Number.isFinite(targetCell) ? cellPosition(targetCell) : undefined;
    const cameraAspect = 'aspect' in camera ? (camera as PerspectiveCamera).aspect : undefined;

    const destCoords = finalDestinationCell !== null && finalDestinationCell !== undefined && Number.isFinite(finalDestinationCell)
      ? cellPosition(finalDestinationCell)
      : cellCoords;
    const skipTargetState = calculateTargetCameraState(
      'tile_focus',
      destCoords,
      destCoords,
      {
        cinematicChase: false,
        cellIndex: finalDestinationCell ?? undefined,
        aspect: cameraAspect,
        isHighStakesRoll,
        isJailFlight,
      }
    );

    let targetState = isManualOverviewResetRef.current
      ? calculateTargetCameraState('overview', undefined, undefined)
      : calculateTargetCameraState(mode, cellCoords, cellCoords, {
          cinematicChase: shouldCinematic,
          cellIndex: targetCell ?? undefined,
          aspect: cameraAspect,
          isHighStakesRoll,
          isJailFlight,
        });

    // [USER-BUG-02] Neu da skip luot nhay hien tai, giu chat targetState o o dich den cuoi cung tranh bi keo nguoc lai
    if (hasSkippedCurrentMoveRef.current) {
      targetState = skipTargetState;
    }

    if (mode !== prevModeRef.current) {
      prevModeRef.current = mode;
      isResettingRef.current = true;
    }

    if (prevHasUserCustomCameraRef.current && !hasUserCustomCamera) {
      camBaseRef.current[0] = camera.position.x;
      camBaseRef.current[1] = camera.position.y;
      camBaseRef.current[2] = camera.position.z;
      if (controlsRef.current) {
        targetBaseRef.current[0] = controlsRef.current.target.x;
        targetBaseRef.current[1] = controlsRef.current.target.y;
        targetBaseRef.current[2] = controlsRef.current.target.z;
      }
      isResettingRef.current = true;
    }
    prevHasUserCustomCameraRef.current = hasUserCustomCamera;

    let shakeOffset: [number, number, number] = [0, 0, 0];
    if (activeScreenShake) {
      const elapsedSec = (Date.now() - activeScreenShake.startTime) / 1000;
      const durSec = activeScreenShake.durationMs / 1000;
      shakeOffset = calculateScreenShake(elapsedSec, durSec, activeScreenShake.intensity);
    }

    if (!Number.isFinite(camBaseRef.current[0]) || !Number.isFinite(camBaseRef.current[1]) || !Number.isFinite(camBaseRef.current[2])) {
      camBaseRef.current = defaultPos;
    }
    if (!Number.isFinite(targetBaseRef.current[0]) || !Number.isFinite(targetBaseRef.current[1]) || !Number.isFinite(targetBaseRef.current[2])) {
      targetBaseRef.current = defaultTarget;
    }

    // [ADV-03][USER-BUG-02] Co che cham de bo qua (Tap-to-Skip) tuc thi: snap thang ve o dich den cuoi cung va chot giu hasSkippedCurrentMoveRef
    if (isSkippingCameraAnimRef.current) {
      hasSkippedCurrentMoveRef.current = true;
      camBaseRef.current[0] = skipTargetState.position[0];
      camBaseRef.current[1] = skipTargetState.position[1];
      camBaseRef.current[2] = skipTargetState.position[2];
      targetBaseRef.current[0] = skipTargetState.target[0];
      targetBaseRef.current[1] = skipTargetState.target[1];
      targetBaseRef.current[2] = skipTargetState.target[2];
      camera.position.set(skipTargetState.position[0], skipTargetState.position[1], skipTargetState.position[2]);
      if (controlsRef.current) {
        controlsRef.current.target.set(skipTargetState.target[0], skipTargetState.target[1], skipTargetState.target[2]);
        controlsRef.current.update();
      }
      isResettingRef.current = false;
      isManualOverviewResetRef.current = false;
      isSkippingCameraAnimRef.current = false;
      isUserInteractingRef.current = false;
    }

    const dt = Math.min(delta, 0.1);
    const lerpFactor = 1 - Math.exp(-dt * targetState.speed);

    if ('isPerspectiveCamera' in camera && (camera as PerspectiveCamera).isPerspectiveCamera) {
      const perspCam = camera as PerspectiveCamera;
      perspCam.fov += (targetState.fov - perspCam.fov) * lerpFactor;
      if (Math.abs(targetState.fov - perspCam.fov) > 0.01) perspCam.updateProjectionMatrix();
    } else {
      const orthoCam = camera as OrthographicCamera;
      const isBigEvent = activeModal !== null || isPawnMoving;
      const targetZoom = calculateCameraZoom(isBigEvent, 35, 42);
      if (typeof orthoCam.zoom === 'number') {
        orthoCam.zoom += (targetZoom - orthoCam.zoom) * lerpFactor;
        orthoCam.updateProjectionMatrix();
      }
    }

    if (controlsRef.current) {
      const isDragging = isUserInteractingRef.current;
      const isActionOngoing = isRolling || isPawnMoving || activeScreenShake !== null
        || (cameraFocusCell !== null)
        || (!hasUserCustomCamera && activeModal !== null);

      if (isDragging) {
        camBaseRef.current[0] = camera.position.x;
        camBaseRef.current[1] = camera.position.y;
        camBaseRef.current[2] = camera.position.z;
        targetBaseRef.current[0] = controlsRef.current.target.x;
        targetBaseRef.current[1] = controlsRef.current.target.y;
        targetBaseRef.current[2] = controlsRef.current.target.z;
      } else if (isActionOngoing || isResettingRef.current) {
        targetBaseRef.current[0] += (targetState.target[0] - targetBaseRef.current[0]) * lerpFactor;
        targetBaseRef.current[1] += (targetState.target[1] - targetBaseRef.current[1]) * lerpFactor;
        targetBaseRef.current[2] += (targetState.target[2] - targetBaseRef.current[2]) * lerpFactor;

        camBaseRef.current[0] += (targetState.position[0] - camBaseRef.current[0]) * lerpFactor;
        camBaseRef.current[1] += (targetState.position[1] - camBaseRef.current[1]) * lerpFactor;
        camBaseRef.current[2] += (targetState.position[2] - camBaseRef.current[2]) * lerpFactor;

        controlsRef.current.target.set(targetBaseRef.current[0], targetBaseRef.current[1], targetBaseRef.current[2]);
        camera.position.set(camBaseRef.current[0] + shakeOffset[0], camBaseRef.current[1] + shakeOffset[1], camBaseRef.current[2] + shakeOffset[2]);

        controlsRef.current.minDistance = (mode === 'overview' || mode === 'pre_match') ? 14 : 3.8;
        controlsRef.current.update();

        if (
          Math.abs(camBaseRef.current[0] - targetState.position[0]) < 0.05 &&
          Math.abs(camBaseRef.current[1] - targetState.position[1]) < 0.05 &&
          Math.abs(camBaseRef.current[2] - targetState.position[2]) < 0.05
        ) {
          isResettingRef.current = false;
          isManualOverviewResetRef.current = false;
        }
      }
    }
  });

  return (
    <OrbitControls
      ref={(node) => {
        controlsRef.current = node;
        if (typeof window !== 'undefined') {
          if (node) window.__orbitControls = node;
          else delete window.__orbitControls;
        }
      }}
      enableRotate
      enablePan
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.25}
      minDistance={14}
      maxDistance={65}
      minZoom={20}
      maxZoom={65}
      onStart={() => {
        if (activeAnimation?.isAnimating) {
          isSkippingCameraAnimRef.current = true;
          lastSkipTimeRef.current = Date.now();
          isUserInteractingRef.current = false;
        } else {
          isUserInteractingRef.current = true;
          isManualOverviewResetRef.current = false;
        }
      }}
      onEnd={() => {
        // [ADV-03][USER-BUG-02] Khoa cuon trong cua so 600ms sau khi skip hoac khi dang skip de khong kich hoat nham custom camera
        if (activeAnimation?.isAnimating || isSkippingCameraAnimRef.current || hasSkippedCurrentMoveRef.current || (Date.now() - lastSkipTimeRef.current < 600)) {
          isUserInteractingRef.current = false;
          return;
        }
        isUserInteractingRef.current = false;
        lastUserInteractionTimeRef.current = Date.now();
        const distPos = Math.hypot(camera.position.x - defaultPos[0], camera.position.y - defaultPos[1], camera.position.z - defaultPos[2]);
        const distTarget = controlsRef.current
          ? Math.hypot(controlsRef.current.target.x - defaultTarget[0], controlsRef.current.target.y - defaultTarget[1], controlsRef.current.target.z - defaultTarget[2])
          : 0;
        if (distPos > 0.8 || distTarget > 0.5) {
          useGameStore.getState().setHasUserCustomCamera?.(true);
        }
      }}
    />
  );
}
