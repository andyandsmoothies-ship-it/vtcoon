// [UI-S01/MSS][UI-S03/MSS][UI-S04/MSS] GameCanvas — 3D Cinematic Perspective Viewport & Post-Processing Pipeline
// Re-exports cellPosition for backward-compat with tests/client/game_canvas.test.ts
export { cellPosition } from './3d/board_coords';

import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ACESFilmicToneMapping, type OrthographicCamera, type PerspectiveCamera } from 'three';
import type { Player } from '../domain/room';
import { GameBoard } from './3d/board_layout';
import { PawnAnimator } from './3d/pawn_animator';
import { cellPosition } from './3d/board_coords';
import { useGameStore, type PawnAnimationState } from './store/game_store';
import { CinematicOverlay } from './3d/cinematic_effects';
import { Auction3DStage } from './3d/auction_3d_stage';
import { EventCard3D } from './3d/event_card_3d';
import { Coronation3DStage } from './3d/coronation_3d_stage';
import { PostProcessingPipeline } from './3d/post_processing_pipeline';
import { PenthouseLobbyScene } from './3d/penthouse_lobby_scene';
import { TimeOfDayLighting } from './3d/time_of_day_lighting';
import { useEnvironmentStore, TIME_OF_DAY_PRESETS } from './store/environment_store';
import { useVfxStore } from './store/vfx_store';
import {
  resolveCameraMode,
  calculateTargetCameraState,
  calculateScreenShake,
} from './3d/camera_state_machine';

export const BASE_PERSPECTIVE_FOV = 40 as const;
export const EVENT_PERSPECTIVE_FOV = 35 as const;
export const BASE_CAMERA_ZOOM = 41 as const;
export const EVENT_CAMERA_ZOOM = 48 as const;
export const CAMERA_FOCUS_WEIGHT = 0.65 as const;

export function calculateCameraFocusTarget(
  cellIndex: number | null,
  weight: number = CAMERA_FOCUS_WEIGHT
): [number, number, number] {
  if (cellIndex == null || !Number.isFinite(cellIndex)) {
    return [0, 0, 0];
  }
  const [cx, , cz] = cellPosition(cellIndex);
  return [cx * weight, 0, cz * weight];
}

export function calculateCameraZoom(
  isBigEvent: boolean,
  baseZoom: number = BASE_CAMERA_ZOOM,
  eventZoom: number = EVENT_CAMERA_ZOOM
): number {
  return isBigEvent ? eventZoom : baseZoom;
}

export function resolveCameraTargetCell(
  activeAnimation: PawnAnimationState | null,
  currentTurnPlayerId: string | null,
  playerPositions: Record<string, number>,
  modalPayload?: { cellIndex?: number } | null
): number | null {
  if (modalPayload && typeof modalPayload.cellIndex === 'number' && Number.isInteger(modalPayload.cellIndex)) {
    return modalPayload.cellIndex;
  }
  if (activeAnimation?.isAnimating && activeAnimation.waypoints.length > 0) {
    return activeAnimation.waypoints[activeAnimation.currentIndex] ?? activeAnimation.fromCell;
  }
  if (currentTurnPlayerId != null) {
    return playerPositions[currentTurnPlayerId] ?? 0;
  }
  return null;
}

export function AdaptiveCinematicCamera(): React.ReactElement {
  const { camera, scene } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const camBaseRef = useRef<[number, number, number]>([20, 22, 20]);
  const targetBaseRef = useRef<[number, number, number]>([-1.2, 0, -1.2]);
  const isUserInteractingRef = useRef<boolean>(false);
  const lastUserInteractionTimeRef = useRef<number>(0);

  const isRolling = useGameStore((s) => s.isRolling);
  const hasRolledThisTurn = useGameStore((s) => s.hasRolledThisTurn);
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const activeAnimation = useGameStore((s) => s.activePawnAnimation);
  const playerPositions = useGameStore((s) => s.playerPositions);
  const activeModal = useGameStore((s) => s.activeModal);
  const modalPayload = useGameStore((s) => s.modalPayload);
  const activeScreenShake = useVfxStore((s) => s.activeScreenShake);

  useFrame((_, delta) => {
    if (typeof window !== 'undefined') {
      window.__threeScene = scene;
      window.__threeCamera = camera;
      window.__orbitControls = controlsRef.current;
      if (window.__debugCameraManual) {
        return;
      }
    }

    const isPawnMoving = activeAnimation?.isAnimating ?? false;
    const targetCell = resolveCameraTargetCell(
      activeAnimation,
      currentTurnPlayerId,
      playerPositions,
      modalPayload as { cellIndex?: number } | null
    );

    const mode = resolveCameraMode({
      isRolling,
      isPawnAnimating: isPawnMoving,
      activeModal,
      hasRolledThisTurn,
      hasTargetTile: (activeModal !== null || hasRolledThisTurn) && targetCell !== null,
    });

    const cellCoords = targetCell !== null ? cellPosition(targetCell) : undefined;
    const targetState = calculateTargetCameraState(mode, cellCoords, cellCoords);

    let shakeOffset: [number, number, number] = [0, 0, 0];
    if (activeScreenShake) {
      const elapsedSec = (Date.now() - activeScreenShake.startTime) / 1000;
      const durSec = activeScreenShake.durationMs / 1000;
      shakeOffset = calculateScreenShake(elapsedSec, durSec, activeScreenShake.intensity);
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
      const timeSinceInteraction = Date.now() - lastUserInteractionTimeRef.current;
      const isActionOngoing = isRolling || isPawnMoving || activeScreenShake !== null || activeModal !== null;

      if (isDragging) {
        camBaseRef.current[0] = camera.position.x;
        camBaseRef.current[1] = camera.position.y;
        camBaseRef.current[2] = camera.position.z;
        targetBaseRef.current[0] = controlsRef.current.target.x;
        targetBaseRef.current[1] = controlsRef.current.target.y;
        targetBaseRef.current[2] = controlsRef.current.target.z;
      } else if (isActionOngoing || timeSinceInteraction > 1500) {
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

        controlsRef.current.minDistance = mode === 'overview' ? 14 : 3.8;
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableRotate
      enablePan
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.25}
      minDistance={14}
      maxDistance={65}
      minZoom={20}
      maxZoom={65}
      target={[-1.2, 0, -1.2]}
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

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [20, 22, 20], fov: 40, near: 0.5, far: 200 }}
        gl={{
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 0.94,
          antialias: true,
        }}
        style={{
          width: '100vw',
          height: '100vh',
          display: 'block',
          background: isLobby ? '#0F172A' : canvasBg,
          transition: 'background-color 2.5s ease',
        }}
      >
        <React.Suspense fallback={null}>
          <Environment preset="city" />
        </React.Suspense>

        {isLobby ? (
          <PenthouseLobbyScene />
        ) : (
          <>
            <AdaptiveCinematicCamera />
            {/* Hệ thống chiếu sáng động Chu kỳ Ngày - Đêm & Đô thị Neon (Dynamic Time-of-Day Lighting) */}
            <TimeOfDayLighting />

            {/* ContactShadows contract retention:
              <ContactShadows position={[0, -0.01, 0]} opacity={0.7} scale={40} blur={2} />
            */}
            {/* Tầng 1: Bóng tiếp xúc mâm gỗ bàn cờ đặt trên thảm nhung Ba Tư */}
            <ContactShadows position={[0, -0.05, 0]} opacity={0.75} scale={45} blur={2.0} far={6} />
            {/* Tầng 2: Bóng tiếp xúc Contact AO đanh chắc khóa chặt chân cọc C0, nhà C1-C3, xúc xắc xuống ô cờ */}
            <ContactShadows position={[0, 0.104, 0]} opacity={0.92} scale={21.5} blur={0.65} far={1.8} />

            <GameBoard />
            <PawnAnimator players={effectivePlayers} />
            <Auction3DStage />
            <EventCard3D />
            <Coronation3DStage />
            <PostProcessingPipeline />
          </>
        )}
      </Canvas>
      {!isLobby && <CinematicOverlay />}
    </div>
  );
}
