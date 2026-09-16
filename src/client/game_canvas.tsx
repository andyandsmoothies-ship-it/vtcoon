// [UI-S01/MSS][UI-S03/MSS][UI-S04/MSS] GameCanvas — 3D Cinematic Perspective Viewport & Post-Processing Pipeline
// Re-exports cellPosition for backward-compat with tests/client/game_canvas.test.ts
export { cellPosition } from './3d/board_coords';
export {
  BASE_PERSPECTIVE_FOV,
  EVENT_PERSPECTIVE_FOV,
  BASE_CAMERA_ZOOM,
  EVENT_CAMERA_ZOOM,
  CAMERA_FOCUS_WEIGHT,
  calculateCameraFocusTarget,
  calculateCameraZoom,
  resolveCameraTargetCell,
} from './3d/use_game_camera';

import React, { useRef, useEffect } from 'react';
import './3d/r3f_fiber_shield';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ACESFilmicToneMapping, type OrthographicCamera, type PerspectiveCamera } from 'three';
import type { Player } from '../domain/room';
import { GameBoard } from './3d/board_layout';
import { PawnAnimator } from './3d/pawn_animator';
import { cellPosition } from './3d/board_coords';
import { useGameStore } from './store/game_store';
import { CinematicOverlay } from './3d/cinematic_effects';
import { EventCard3D } from './3d/event_card_3d';
import { Coronation3DStage } from './3d/coronation_3d_stage';
import { PostProcessingPipeline } from './3d/post_processing_pipeline';
import { PenthouseLobbyScene } from './3d/penthouse_lobby_scene';
import { SunnyIslandLobbyScene } from './3d/sunny_island_lobby_scene';
import { TimeOfDayLighting } from './3d/time_of_day_lighting';
import { useEnvironmentStore, TIME_OF_DAY_PRESETS } from './store/environment_store';
import { useVfxStore } from './store/vfx_store';
import {
  resolveCameraMode,
  calculateTargetCameraState,
  calculateScreenShake,
} from './3d/camera_state_machine';
import {
  calculateCameraZoom,
  resolveCameraTargetCell,
} from './3d/use_game_camera';
import { PerfTelemetryTracker } from './telemetry/perf_telemetry_tracker';

export interface AdaptiveCinematicCameraProps {
  readonly isPreMatch?: boolean;
}

export function AdaptiveCinematicCamera({
  isPreMatch = false,
}: AdaptiveCinematicCameraProps = {}): React.ReactElement {
  const { camera, scene } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const camBaseRef = useRef<[number, number, number]>([30.0, 33.0, 30.0]);
  const targetBaseRef = useRef<[number, number, number]>([1.5, 0.0, 1.5]);
  const isUserInteractingRef = useRef<boolean>(false);
  const lastUserInteractionTimeRef = useRef<number>(0);
  const isResettingRef = useRef<boolean>(false);

  const isRolling = useGameStore((s) => s.isRolling);
  const hasRolledThisTurn = useGameStore((s) => s.hasRolledThisTurn);
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const activeAnimation = useGameStore((s) => s.activePawnAnimation);
  const playerPositions = useGameStore((s) => s.playerPositions);
  const activeModal = useGameStore((s) => s.activeModal);
  const modalPayload = useGameStore((s) => s.modalPayload);
  const activeScreenShake = useVfxStore((s) => s.activeScreenShake);
  const playersInfo = useGameStore((s) => s.playersInfo);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__threeScene = scene;
      window.__threeCamera = camera;
      window.__resetCameraToDefault = () => {
        isUserInteractingRef.current = false;
        lastUserInteractionTimeRef.current = 0;
        isResettingRef.current = true;
        camBaseRef.current = [30.0, 33.0, 30.0];
        targetBaseRef.current = [1.5, 0.0, 1.5];
        if (controlsRef.current) {
          controlsRef.current.target.set(1.5, 0.0, 1.5);
        }
        camera.position.set(30.0, 33.0, 30.0);
        controlsRef.current?.update();
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.__resetCameraToDefault;
      }
    };
  }, [scene, camera]);

  useFrame((_, delta) => {
    if (typeof window !== 'undefined' && window.__debugCameraManual) {
      return;
    }

    const isPawnMoving = activeAnimation?.isAnimating ?? false;
    const currentTurnPlayer = currentTurnPlayerId ? playersInfo[currentTurnPlayerId] : undefined;
    const isBotTurn = Boolean(currentTurnPlayer?.isBot);
    const animatingPlayer = activeAnimation?.playerId ? playersInfo[activeAnimation.playerId] : undefined;
    const isAnimatingPawnBot = Boolean(animatingPlayer?.isBot);
    const targetCell = resolveCameraTargetCell(
      activeAnimation,
      currentTurnPlayerId,
      playerPositions,
      modalPayload as { cellIndex?: number } | null
    );

    const hasTargetTile = (activeModal !== null || hasRolledThisTurn) && targetCell !== null && targetCell !== undefined && Number.isFinite(targetCell);
    const mode = resolveCameraMode({
      isRolling,
      isPawnAnimating: isPawnMoving,
      activeModal,
      hasRolledThisTurn,
      hasTargetTile,
      isPreMatch,
      isBotTurn,
      isAnimatingPawnBot,
    });

    const cellCoords = targetCell !== null && targetCell !== undefined && Number.isFinite(targetCell) ? cellPosition(targetCell) : undefined;
    const targetState = calculateTargetCameraState(mode, cellCoords, cellCoords);

    let shakeOffset: [number, number, number] = [0, 0, 0];
    if (activeScreenShake) {
      const elapsedSec = (Date.now() - activeScreenShake.startTime) / 1000;
      const durSec = activeScreenShake.durationMs / 1000;
      shakeOffset = calculateScreenShake(elapsedSec, durSec, activeScreenShake.intensity);
    }

    if (!Number.isFinite(camBaseRef.current[0]) || !Number.isFinite(camBaseRef.current[1]) || !Number.isFinite(camBaseRef.current[2])) {
      camBaseRef.current = [30.0, 33.0, 30.0];
    }
    if (!Number.isFinite(targetBaseRef.current[0]) || !Number.isFinite(targetBaseRef.current[1]) || !Number.isFinite(targetBaseRef.current[2])) {
      targetBaseRef.current = [1.5, 0.0, 1.5];
    }

    const dt = Math.min(delta, 0.1);
    const lerpFactor = 1 - Math.exp(-dt * targetState.speed);

    if ('isPerspectiveCamera' in camera && (camera as PerspectiveCamera).isPerspectiveCamera) {
      const perspCam = camera as PerspectiveCamera;
      perspCam.fov += (targetState.fov - perspCam.fov) * lerpFactor;
      perspCam.updateProjectionMatrix();
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
      const isActionOngoing = isRolling || isPawnMoving || activeScreenShake !== null || activeModal !== null;

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

        controlsRef.current.target.set(
          targetBaseRef.current[0],
          targetBaseRef.current[1],
          targetBaseRef.current[2]
        );

        camera.position.set(
          camBaseRef.current[0] + shakeOffset[0],
          camBaseRef.current[1] + shakeOffset[1],
          camBaseRef.current[2] + shakeOffset[2]
        );

        controlsRef.current.minDistance = (mode === 'overview' || mode === 'pre_match') ? 14 : 3.8;
        controlsRef.current.update();

        if (
          Math.abs(camBaseRef.current[0] - targetState.position[0]) < 0.05 &&
          Math.abs(camBaseRef.current[1] - targetState.position[1]) < 0.05 &&
          Math.abs(camBaseRef.current[2] - targetState.position[2]) < 0.05
        ) {
          isResettingRef.current = false;
        }
      }
    }
  });

  return (
    <OrbitControls
      ref={(node) => {
        controlsRef.current = node;
        if (typeof window !== 'undefined') {
          window.__orbitControls = node;
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
      target={[1.5, 0.0, 1.5]}
      onStart={() => {
        isUserInteractingRef.current = true;
      }}
      onEnd={() => {
        isUserInteractingRef.current = false;
        lastUserInteractionTimeRef.current = Date.now();
      }}
    />
  );
}

export interface GameCanvasProps {
  readonly players?: readonly Player[];
  readonly isLobby?: boolean;
}

export function GameCanvas({
  players = [],
  isLobby = false,
}: GameCanvasProps): React.ReactElement {
  const playersInfo = useGameStore((s) => s.playersInfo);
  const playerPositions = useGameStore((s) => s.playerPositions);
  const timeOfDayPhase = useEnvironmentStore((s) => s.phase);
  const canvasBg = TIME_OF_DAY_PRESETS[timeOfDayPhase].skyColor;

  const effectivePlayers: readonly Player[] = players.length > 0
    ? players
    : Object.values(playersInfo).map((p) => ({
        id: p.id,
        position: playerPositions[p.id] ?? 0,
        balance: p.balance,
        skipNextTurn: false,
        auditTurnsLeft: 0,
        consecutiveDoubles: 0,
        hand: [],
        pendingDebts: [],
        extraTurns: 0,
        doubleNextDice: false,
        mortgagedProperties: [],
        bankrupt: Boolean(p.bankrupt),
      }));

  const isSSR = typeof window === 'undefined';

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Canvas
        shadows="soft"
        dpr={[1, 1.5]}
        camera={{ position: [30.0, 33.0, 30.0], fov: 24, near: 0.5, far: 300 }}
        gl={{
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.08,
          antialias: true,
        }}
        onCreated={({ gl }) => {
          if (gl?.info) {
            gl.info.autoReset = false;
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          background: canvasBg,
          transition: 'background-color 2.5s ease',
        }}
      >
        {!isSSR && (
          <>
            <React.Suspense fallback={null}>
              <Environment preset="city" />
            </React.Suspense>
            <PerfTelemetryTracker />

            {isLobby ? (
              <>
                {/* Tabletop-first Stage 1: Render GameBoard trực tiếp trên sa bàn đảo ngọc thay thế SunnyIslandLobbyScene */}
                <AdaptiveCinematicCamera isPreMatch={true} />
                <TimeOfDayLighting />
                {/* Bóng tiếp xúc mâm gỗ bàn cờ đặt trên thảm nhung Ba Tư */}
                <ContactShadows frames={1} position={[0, -0.05, 0]} opacity={0.75} scale={45} blur={2.0} far={6} />
                <GameBoard />
                <PawnAnimator players={effectivePlayers} />
                <PostProcessingPipeline />
              </>
            ) : (
              <>
                <AdaptiveCinematicCamera />
                {/* Hệ thống chiếu sáng động Chu kỳ Ngày - Đêm & Đô thị Neon (Dynamic Time-of-Day Lighting) */}
                <TimeOfDayLighting />

                {/* ContactShadows contract retention:
                  <ContactShadows frames={1} position={[0, -0.01, 0]} opacity={0.7} scale={40} blur={2} />
                */}
                {/* Bóng tiếp xúc mâm gỗ bàn cờ đặt trên thảm nhung Ba Tư */}
                <ContactShadows frames={1} position={[0, -0.05, 0]} opacity={0.75} scale={45} blur={2.0} far={6} />

                <GameBoard />
                <PawnAnimator players={effectivePlayers} />
                <EventCard3D />
                <Coronation3DStage />
                <PostProcessingPipeline />
              </>
            )}
          </>
        )}
      </Canvas>
      <CinematicOverlay />
    </div>
  );
}
