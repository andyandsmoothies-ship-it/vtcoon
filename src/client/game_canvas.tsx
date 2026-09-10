// [UI-S01/MSS][UI-S03/MSS] GameCanvas — Orthographic 3D viewport, R3F Canvas wrapper & Cinematic Camera
// Re-exports cellPosition for backward-compat with tests/client/game_canvas.test.ts
export { cellPosition } from './3d/board_coords';

import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { OrthographicCamera } from 'three';
import type { Player } from '../domain/room';
import { GameBoard } from './3d/board_layout';
import { PawnAnimator } from './3d/pawn_animator';
import { cellPosition } from './3d/board_coords';
import { useGameStore, type PawnAnimationState } from './store/game_store';

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
  playerPositions: Record<string, number>
): number | null {
  if (activeAnimation?.isAnimating && activeAnimation.waypoints.length > 0) {
    return activeAnimation.waypoints[activeAnimation.currentIndex] ?? activeAnimation.fromCell;
  }
  if (currentTurnPlayerId != null) {
    return playerPositions[currentTurnPlayerId] ?? 0;
  }
  return null;
}

export function AdaptiveCinematicCamera(): React.ReactElement {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const currentTurnPlayerId = useGameStore((s) => s.currentTurnPlayerId);
  const activeAnimation = useGameStore((s) => s.activePawnAnimation);
  const playerPositions = useGameStore((s) => s.playerPositions);
  const activeModal = useGameStore((s) => s.activeModal);

  useFrame((_, delta) => {
    const targetCell = resolveCameraTargetCell(activeAnimation, currentTurnPlayerId, playerPositions);
    const [tx, ty, tz] = calculateCameraFocusTarget(targetCell);
    const isBigEvent = activeModal !== null || (activeAnimation?.isAnimating ?? false);
    const targetZoom = calculateCameraZoom(isBigEvent);
    const dt = Math.min(delta, 0.1);
    const lerpFactor = 1 - Math.exp(-dt * 4);

    const orthoCam = camera as OrthographicCamera;
    if (typeof orthoCam.zoom === 'number') {
      orthoCam.zoom += (targetZoom - orthoCam.zoom) * lerpFactor;
      orthoCam.updateProjectionMatrix();
    }

    if (controlsRef.current) {
      const dx = (tx - controlsRef.current.target.x) * lerpFactor;
      const dy = (ty - controlsRef.current.target.y) * lerpFactor;
      const dz = (tz - controlsRef.current.target.z) * lerpFactor;
      controlsRef.current.target.x += dx;
      controlsRef.current.target.y += dy;
      controlsRef.current.target.z += dz;
      camera.position.x += dx;
      camera.position.y += dy;
      camera.position.z += dz;
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls ref={controlsRef} enableRotate={false} enablePan minZoom={25} maxZoom={60} />
  );
}

export function GameCanvas({ players = [] }: { players?: readonly Player[] }): React.ReactElement {
  const playersInfo = useGameStore((s) => s.playersInfo);
  const playerPositions = useGameStore((s) => s.playerPositions);

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
    <Canvas
      shadows
      orthographic
      camera={{ position: [22, 22, 22], zoom: 41, near: -100, far: 200 }}
      style={{ width: '100vw', height: '100vh', display: 'block', background: '#0B1120' }}
    >
      <AdaptiveCinematicCamera />
      <ambientLight intensity={0.7} />
      <hemisphereLight color="#E0F2FE" groundColor="#0F172A" intensity={0.5} />
      <directionalLight
        position={[20, 25, 20]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-bias={-0.0001}
      />
      <React.Suspense fallback={null}>
        <Environment preset="city" />
      </React.Suspense>
      <ContactShadows position={[0, -0.01, 0]} opacity={0.7} scale={40} blur={2} />
      <GameBoard />
      <PawnAnimator players={effectivePlayers} />
    </Canvas>
  );
}
