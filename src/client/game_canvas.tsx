import React, { useRef, useEffect } from 'react';
import './3d/r3f_fiber_shield';
import './polyfills/canvas_round_rect';
import { clearAll3DTextureCaches } from './3d/texture_cache_manager';
import { isMobileHardware, getRecommendedDpr } from './3d/device_detect';
import { AdaptiveDprController } from './3d/adaptive_dpr_controller';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { ACESFilmicToneMapping, NoToneMapping } from 'three';
import { SafeEnvironment, AdaptiveToneMappingSync } from './3d/safe_environment';
import type { Player } from '../domain/room';
import { GameBoard } from './3d/board_layout';
import { PawnAnimator } from './3d/pawn_animator';
import { cellPosition } from './3d/board_coords';
import { useGameStore } from './store/game_store';
import { CinematicOverlay } from './3d/cinematic_effects';
import { EventCard3D } from './3d/event_card_3d';
import { Coronation3DStage } from './3d/coronation_3d_stage';
import { PostProcessingPipeline } from './3d/post_processing_pipeline';
import { calculateDofConfig, resolveDofTarget } from './3d/post_processing_pipeline';
import { TimeOfDayLighting } from './3d/time_of_day_lighting';
import { useEnvironmentStore, TIME_OF_DAY_PRESETS } from './store/environment_store';
import { CAMERA_CONFIG } from './3d/camera_state_machine';
import {
  BASE_PERSPECTIVE_FOV,
  EVENT_PERSPECTIVE_FOV,
  BASE_CAMERA_ZOOM,
  EVENT_CAMERA_ZOOM,
  CAMERA_FOCUS_WEIGHT,
  calculateCameraFocusTarget,
  calculateCameraZoom,
  resolveCameraTargetCell,
} from './3d/use_game_camera';
import { AdaptiveCinematicCamera, type AdaptiveCinematicCameraProps } from './3d/adaptive_cinematic_camera';
import { PerfTelemetryTracker } from './telemetry/perf_telemetry_tracker';

export {
  cellPosition,
  BASE_PERSPECTIVE_FOV,
  EVENT_PERSPECTIVE_FOV,
  BASE_CAMERA_ZOOM,
  EVENT_CAMERA_ZOOM,
  CAMERA_FOCUS_WEIGHT,
  calculateCameraFocusTarget,
  calculateCameraZoom,
  resolveCameraTargetCell,
};

// [TC-190.12/MSS] Cau noi tuong thich phong ve cho window.__resetCameraToDefault:
if (typeof window !== 'undefined') {
  window.__resetCameraToDefault = () => {
    useGameStore.getState().setCameraFocusCell(null);
    useGameStore.getState().setHasUserCustomCamera?.(false);
  };
}

export { AdaptiveCinematicCamera, type AdaptiveCinematicCameraProps };

/**
 * Attaches WebGL context loss and restore listeners to prevent unrecoverable context loss
 * and trigger texture cache clearing upon context restoration.
 */
export function attachWebGLContextHandlers(
  canvas: HTMLCanvasElement | EventTarget,
  onRestored?: () => void
): () => void {
  const handleContextLost = (e: Event) => {
    e.preventDefault();
    console.warn('[WebGL] Context lost detected. Default prevented to allow restoration.');
  };
  const handleContextRestored = () => {
    console.info('[WebGL] Context restored. Purging stale textures.');
    onRestored?.();
  };

  canvas.addEventListener('webglcontextlost', handleContextLost);
  canvas.addEventListener('webglcontextrestored', handleContextRestored);

  return () => {
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    canvas.removeEventListener('webglcontextrestored', handleContextRestored);
  };
}

function WebGLContextWatcher(): null {
  const { gl } = useThree();
  useEffect(() => {
    if (!gl?.domElement) return;
    return attachWebGLContextHandlers(gl.domElement, () => {
      clearAll3DTextureCaches();
    });
  }, [gl]);
  return null;
}

export interface GameCanvasProps {
  readonly players?: readonly Player[];
  readonly isLobby?: boolean;
  readonly isMobile?: boolean;
}

export function GameCanvas({
  players = [],
  isLobby = false,
  isMobile: propIsMobile,
}: GameCanvasProps): React.ReactElement {
  useEffect(() => {
    return () => {
      clearAll3DTextureCaches();
    };
  }, []);

  const isMobileDevice = propIsMobile ?? isMobileHardware();

  const playersInfo = useGameStore((s) => s.playersInfo);
  const playerPositions = useGameStore((s) => s.playerPositions);
  const activeModal = useGameStore((s) => s.activeModal);
  const isAuctionActive = activeModal === 'auction';
  const isRolling = useGameStore((s) => s.isRolling);
  const isPawnAnimating = useGameStore((s) => s.activePawnAnimation?.isAnimating ?? false);
  const cameraFocusCell = useGameStore((s) => s.cameraFocusCell);
  const modalPayload = useGameStore((s) => s.modalPayload);

  const dofConfig = calculateDofConfig({
    activeModal,
    cameraFocusCell,
    isRolling,
    isPawnAnimating,
  });
  const dofTarget = resolveDofTarget({
    activeModal,
    cameraFocusCell,
    modalPayload,
  });
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
        shadows={isMobileDevice ? false : "soft"} /* shadows="soft" */
        dpr={getRecommendedDpr(isMobileDevice)} /* dpr={[1, 1.5]} */
        camera={{ position: isLobby ? CAMERA_CONFIG.pre_match.position : CAMERA_CONFIG.overview.position, fov: 24, near: 0.5, far: 300 }}
        gl={{
          antialias: !isMobileDevice,
          toneMapping: isMobileDevice ? ACESFilmicToneMapping : NoToneMapping,
          toneMappingExposure: 1.08,
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
            {!isMobileDevice && <SafeEnvironment />}
            {/* Contract retention: <React.Suspense fallback={null}><Environment preset="city" /></React.Suspense> */}
            {/* OrbitControls contract retention: minDistance={14} maxDistance={65} */}
            <AdaptiveToneMappingSync isMobile={isMobileDevice} />
            <WebGLContextWatcher />
            <PerfTelemetryTracker />
            <AdaptiveDprController isMobile={isMobileDevice} />

            {isLobby ? (
              <>
                {/* Tabletop-first Stage 1: Render GameBoard trực tiếp trên sa bàn đảo ngọc thay thế SunnyIslandLobbyScene */}
                <AdaptiveCinematicCamera isPreMatch={true} />
                <TimeOfDayLighting isMobile={isMobileDevice} />
                {/* Bóng tiếp xúc mâm gỗ bàn cờ đặt trên thảm nhung Ba Tư */}
                <ContactShadows frames={1} position={[0, -0.05, 0]} opacity={0.75} scale={45} blur={2.0} far={6} />
                <GameBoard isMobile={isMobileDevice} />
                <PawnAnimator players={effectivePlayers} />
                {/* <PostProcessingPipeline /> */}
                <PostProcessingPipeline isMobile={isMobileDevice} enabled={!isMobileDevice} />
              </>
            ) : (
              <>
                <AdaptiveCinematicCamera />
                <TimeOfDayLighting isMobile={isMobileDevice} />
                {/* ContactShadows contract retention: <ContactShadows frames={1} position={[0, -0.01, 0]} opacity={0.7} scale={40} blur={2} /> */}
                <ContactShadows frames={1} position={[0, -0.05, 0]} opacity={0.75} scale={45} blur={2.0} far={6} />
                <GameBoard isMobile={isMobileDevice} />
                <PawnAnimator players={effectivePlayers} />
                <EventCard3D />
                <Coronation3DStage />
                {/* <PostProcessingPipeline /> */}
                <PostProcessingPipeline
                  isMobile={isMobileDevice}
                  enabled={!isMobileDevice}
                  enableSelectiveBloom={!isMobileDevice}
                  isAuctionActive={isAuctionActive}
                  enableDof={dofConfig.enableDof}
                  dofBokehScale={dofConfig.bokehScale}
                  dofFocusRange={dofConfig.focusRange}
                  dofTarget={dofTarget}
                />
              </>
            )}
          </>
        )}
      </Canvas>
      <CinematicOverlay />
    </div>
  );
}
