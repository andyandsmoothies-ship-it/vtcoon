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
  resolveSoftReturnDuration,
  CAMERA_CONFIG,
} from './camera_state_machine';
import {
  calculateSplineArcCameraState,
  resolveDynamicGamePhase,
  resolveOverviewConfigByPhase,
  resolveJailFlightProgress,
} from './cinematic_spline_flyby';
import { initSoftReturn, sampleSoftReturn, type SoftReturnState } from './camera_soft_return';
import { useCameraGestures, checkTargetOwnedByHuman, useDebugCameraGlobals } from './use_camera_gestures';
import { resolveActiveCameraDriver } from './camera_arbitration_engine';
import { CameraLocationBeacon } from './camera_location_beacon';
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

// checkTargetOwnedByHuman moved to use_camera_gestures.ts

export function AdaptiveCinematicCamera({
  isPreMatch = false,
}: AdaptiveCinematicCameraProps = {}): React.ReactElement {
  const { camera, scene, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const defaultCfg = CAMERA_CONFIG[isPreMatch ? 'pre_match' : 'overview'];
  const defaultPos: [number, number, number] = [defaultCfg.position[0], defaultCfg.position[1], defaultCfg.position[2]];
  const defaultTarget: [number, number, number] = [defaultCfg.target[0], defaultCfg.target[1], defaultCfg.target[2]];
  const camBaseRef = useRef<[number, number, number]>(defaultPos);
  const targetBaseRef = useRef<[number, number, number]>(defaultTarget);
  const isResettingRef = useRef<boolean>(true);
  const isManualOverviewResetRef = useRef<boolean>(false);
  const prevModeRef = useRef<string | null>(null);
  const prevHasUserCustomCameraRef = useRef<boolean>(false);
  const lastDestinationCellRef = useRef<number | null>(null);
  const gamePhaseRef = useRef<1 | 2 | 3>(1);
  const softReturnRef = useRef<SoftReturnState | null>(null);
  const prevTurnPlayerIdRef = useRef<string | null>(null);

  const flightStartTimeRef = useRef<number | null>(null);
  const currentOverviewPosRef = useRef<[number, number, number]>([defaultCfg.position[0], defaultCfg.position[1], defaultCfg.position[2]]);
  const currentOverviewTargetRef = useRef<[number, number, number]>([defaultCfg.target[0], defaultCfg.target[1], defaultCfg.target[2]]);

  const isRolling = useGameStore((s) => s.isRolling);
  const hasRolledThisTurn = useGameStore((s) => s.hasRolledThisTurn);
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const activeAnimation = useGameStore((s) => s.activePawnAnimation);

  const {
    onOrbitStart,
    onOrbitEnd,
    isUserInteractingRef,
    hasSkippedCurrentMoveRef,
    handleFrameSkip,
    arbitrationSession,
  } = useCameraGestures({
    camera,
    controlsRef,
    currentOverviewPosRef,
    currentOverviewTargetRef,
    isResettingRef,
    softReturnRef,
    isManualOverviewResetRef,
    camBaseRef,
    targetBaseRef,
    activeAnimation,
  });
  const playerPositions = useGameStore((s) => s.playerPositions);
  const activeModal = useGameStore((s) => s.activeModal);
  const modalPayload = useGameStore((s) => s.modalPayload);
  const cameraFocusCell = useGameStore((s) => s.cameraFocusCell);
  const hasUserCustomCamera = useGameStore((s) => s.hasUserCustomCamera);
  const activeScreenShake = useVfxStore((s) => s.activeScreenShake);
  const playersInfo = useGameStore((s) => s.playersInfo);
  const levelMap = useGameStore((s) => s.levelMap);
  const roundNumber = useGameStore((s) => s.roundNumber);
  const totalBuildings = React.useMemo(
    () => Object.values(levelMap ?? {}).reduce<number>((acc, lvl) => acc + (lvl ?? 0), 0),
    [levelMap]
  );

  const rollingPlayerId = currentTurnPlayerId ?? 'p1';
  const rollingPlayer = playersInfo[rollingPlayerId];
  const rollingPos = playerPositions[rollingPlayerId] ?? 0;
  const rollingBalance = rollingPlayer?.balance ?? 0;
  const highStakesResult = checkHighStakesRoll(
    rollingPos, rollingBalance, playersInfo, levelMap, rollingPlayerId
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

  useDebugCameraGlobals({
    scene,
    camera,
    controlsRef,
    defaultTarget,
    camBaseRef,
    targetBaseRef,
    currentOverviewPosRef,
    currentOverviewTargetRef,
    isResettingRef,
    isManualOverviewResetRef,
    softReturnRef,
    isUserInteractingRef,
  });

  useEffect(() => {
    const dom = gl?.domElement;
    if (!dom) return;
    const handleWheel = () => {
      if (softReturnRef.current) {
        softReturnRef.current = null;
        isResettingRef.current = false;
      }
    };
    dom.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      dom.removeEventListener('wheel', handleWheel);
    };
  }, [gl]);

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
    if (finalDestinationCell !== null && finalDestinationCell !== undefined && Number.isFinite(finalDestinationCell)) {
      lastDestinationCellRef.current = finalDestinationCell;
    }
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
    const effectiveDestCell = finalDestinationCell ?? targetCell ?? lastDestinationCellRef.current;
    const isTargetOwnedByHuman = effectiveDestCell !== null && effectiveDestCell !== undefined && Number.isFinite(effectiveDestCell)
      ? checkTargetOwnedByHuman(playersInfo, effectiveDestCell)
      : false;
    const effectivePhase = resolveDynamicGamePhase(roundNumber, totalBuildings, gamePhaseRef.current);
    gamePhaseRef.current = effectivePhase;

    const phaseOverview = resolveOverviewConfigByPhase(effectivePhase, CAMERA_CONFIG.overview);
    if (!isPreMatch) {
      currentOverviewPosRef.current = [phaseOverview.position[0], phaseOverview.position[1], phaseOverview.position[2]];
      currentOverviewTargetRef.current = [phaseOverview.target[0], phaseOverview.target[1], phaseOverview.target[2]];
    }

    const rollingPlayerPos = currentTurnPlayerId ? playerPositions[currentTurnPlayerId] : undefined;
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
      isTargetOwnedByHuman,
    });

    const cellCoords = targetCell !== null && targetCell !== undefined && Number.isFinite(targetCell) ? cellPosition(targetCell) : undefined;
    const cameraAspect = 'aspect' in camera ? (camera as PerspectiveCamera).aspect : undefined;

    const destCoords = finalDestinationCell !== null && finalDestinationCell !== undefined && Number.isFinite(finalDestinationCell)
      ? cellPosition(finalDestinationCell)
      : cellCoords;
    const skipTargetState = calculateTargetCameraState('tile_focus', destCoords, destCoords, {
      cinematicChase: false,
      cellIndex: finalDestinationCell ?? undefined,
      aspect: cameraAspect,
      isHighStakesRoll,
      isJailFlight,
    });

    const isTransientTurnCorner = Boolean(
      isPawnMoving &&
      targetCell !== null &&
      targetCell !== undefined &&
      targetCell % 10 === 0 &&
      finalDestinationCell !== targetCell
    );

    let targetState = isManualOverviewResetRef.current
      ? calculateTargetCameraState('overview', undefined, undefined, { gamePhase: gamePhaseRef.current })
      : calculateTargetCameraState(mode, cellCoords, cellCoords, {
          cinematicChase: shouldCinematic,
          cellIndex: targetCell ?? undefined,
          aspect: cameraAspect,
          isHighStakesRoll,
          isJailFlight,
          isTransientTurnCorner,
          enableNorthFraming: true,
          isRolling,
          isBotTurn,
          rollingPlayerPos,
          gamePhase: effectivePhase,
        });

    if (isJailFlight && isPawnMoving) {
      if (flightStartTimeRef.current === null) flightStartTimeRef.current = performance.now();
      const flightProgress = resolveJailFlightProgress(flightStartTimeRef.current, performance.now(), isBotTurn);
      targetState = calculateSplineArcCameraState({
        startCell: activeAnimation?.fromCell ?? 30,
        targetCell: effectiveDestCell ?? 10,
        progress: flightProgress,
        aspect: cameraAspect,
      });
    } else {
      flightStartTimeRef.current = null;
    }

    // [USER-BUG-02] Neu da skip luot nhay hien tai, giu chat targetState o o dich den cuoi cung tranh bi keo nguoc lai
    if (hasSkippedCurrentMoveRef.current) {
      targetState = skipTargetState;
    }

    if (mode !== prevModeRef.current) {
      if (
        mode === 'overview' &&
        prevModeRef.current &&
        prevModeRef.current !== 'overview' &&
        prevModeRef.current !== 'pre_match' &&
        !hasUserCustomCamera
      ) {
        const returnDuration = resolveSoftReturnDuration(isBotTurn || isAnimatingPawnBot);
        softReturnRef.current = initSoftReturn(
          camBaseRef.current,
          targetBaseRef.current,
          targetState.position,
          targetState.target,
          performance.now(),
          returnDuration
        );
      } else if (mode !== 'overview') {
        softReturnRef.current = null;
      }
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

    handleFrameSkip(skipTargetState);

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

    const hasTurnChanged = prevTurnPlayerIdRef.current !== null && prevTurnPlayerIdRef.current !== currentTurnPlayerId;
    prevTurnPlayerIdRef.current = currentTurnPlayerId;

    arbitrationSession.current.checkPreemption(
      activeModal,
      cameraFocusCell,
      isRolling,
      hasTurnChanged,
      !hasUserCustomCamera && isPawnMoving
    );

    if (controlsRef.current) {
      const isDragging = isUserInteractingRef.current;
      const isGracePeriodActive = arbitrationSession.current.isGracePeriodActive(performance.now());
      const isActionOngoing = isRolling || (!hasUserCustomCamera && isPawnMoving) || activeScreenShake !== null
        || (cameraFocusCell !== null)
        || (!hasUserCustomCamera && activeModal !== null);

      if (isActionOngoing && softReturnRef.current) {
        camBaseRef.current[0] = camera.position.x;
        camBaseRef.current[1] = camera.position.y;
        camBaseRef.current[2] = camera.position.z;
        if (controlsRef.current) {
          targetBaseRef.current[0] = controlsRef.current.target.x;
          targetBaseRef.current[1] = controlsRef.current.target.y;
          targetBaseRef.current[2] = controlsRef.current.target.z;
        }
        softReturnRef.current = null;
      }

      const activeDriver = resolveActiveCameraDriver(
        isDragging,
        isGracePeriodActive,
        softReturnRef.current !== null,
        isActionOngoing,
        isResettingRef.current
      );

      if (activeDriver === 'user') {
        camBaseRef.current[0] = camera.position.x;
        camBaseRef.current[1] = camera.position.y;
        camBaseRef.current[2] = camera.position.z;
        targetBaseRef.current[0] = controlsRef.current.target.x;
        targetBaseRef.current[1] = controlsRef.current.target.y;
        targetBaseRef.current[2] = controlsRef.current.target.z;
      } else if (activeDriver === 'soft_return' && softReturnRef.current) {
        const sample = sampleSoftReturn(softReturnRef.current, performance.now());
        camBaseRef.current[0] = sample.position[0];
        camBaseRef.current[1] = sample.position[1];
        camBaseRef.current[2] = sample.position[2];
        targetBaseRef.current[0] = sample.target[0];
        targetBaseRef.current[1] = sample.target[1];
        targetBaseRef.current[2] = sample.target[2];
        controlsRef.current.target.set(sample.target[0], sample.target[1], sample.target[2]);
        camera.position.set(sample.position[0] + shakeOffset[0], sample.position[1] + shakeOffset[1], sample.position[2] + shakeOffset[2]);
        controlsRef.current.minDistance = 14;
        controlsRef.current.update();
        if (sample.isFinished) {
          softReturnRef.current = null;
          isResettingRef.current = false;
          isManualOverviewResetRef.current = false;
        }
      } else if (activeDriver === 'director') {
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
    <>
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
        onStart={onOrbitStart}
        onEnd={onOrbitEnd}
      />
      <CameraLocationBeacon />
    </>
  );
}
