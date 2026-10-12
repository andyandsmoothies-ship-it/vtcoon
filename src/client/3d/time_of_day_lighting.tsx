// [UI-S01/MSS][UI-S04/MSS] TimeOfDayLighting — Dynamic Day-Sunset-Night Lighting & Atmosphere Coordinator
import React, { useRef, useMemo } from 'react';
import { Color, Vector3, type DirectionalLight, type AmbientLight, type HemisphereLight } from 'three';
import { useSafeFrame } from './safe_frame';
import {
  useEnvironmentStore,
  TIME_OF_DAY_PRESETS,
  AUTO_CYCLE_DURATION_SECONDS,
  calculatePhaseFromProgress,
} from '../store/environment_store';
import { useGameStore } from '../store/game_store';
import { useDiagnostic3DStore } from './diagnostic_3d_store';
import { resolveShadowMapSize } from '../ui/ui_helpers';
import {
  calculateBaseFill,
  calculateBaseRim,
  calculateMobileNightAmbientIntensity,
  calculateTopDownFill,
  calculateTargetExposure,
  lerpExposure,
  calculateFogTargets,
  calculateBidFlashIntensity as calculateBidFlashIntensityHelper,
  updateDirectLights,
  updateDiffuseAndAtmosphere,
  updateLightingShadowCache,
  type LightingShadowCacheParams,
} from './time_of_day_lighting_helpers';

// Re-export pure helpers for seamless backward compatibility across test suites
export {
  calculateBaseFill,
  calculateBaseRim,
  calculateMobileNightAmbientIntensity,
  calculateTopDownFill,
  calculateTargetExposure,
  lerpExposure,
  calculateFogTargets,
  updateLightingShadowCache,
  type LightingShadowCacheParams,
};

/**
 * Base environmentIntensity regulator preserved across day, sunset, and night phases.
 */
export function calculateBaseEnv(phase: 'day' | 'sunset' | 'night'): number {
  return phase === 'night' ? 0.28 : phase === 'sunset' ? 0.38 : 0.75;
}

/**
 * Preservation of IMP-80/IMP-196 daytime and twilight rim light color formula.
 */
export function calculateRimColor(phase: 'day' | 'sunset' | 'night'): string {
  return phase === 'night' ? '#38BDF8' : phase === 'sunset' ? '#EA580C' : '#F8FAFC';
}

/**
 * Tính toán cường độ xung ánh sáng phản hồi khi có lượt trả giá mới (Bid Flash).
 * Xung ánh sáng bùng nổ tại t=0 và phân rã mượt mà theo hàm bậc hai (1 - t/duration)^2.
 */
export function calculateBidFlashIntensity(
  baseIntensity: number,
  timer: number,
  boost: number = 1.5,
  duration: number = 0.35
): number {
  return calculateBidFlashIntensityHelper(baseIntensity, timer, boost, duration);
}

export interface TimeOfDayLightingProps {
  readonly isMobile?: boolean;
}

export function TimeOfDayLighting({ isMobile = false }: TimeOfDayLightingProps = {}): React.ReactElement {
  const phase = useEnvironmentStore((s) => s.phase);
  const isAuto = useEnvironmentStore((s) => s.isAuto);
  const setPhase = useEnvironmentStore((s) => s.setPhase);
  const activeModal = useGameStore((s) => s.activeModal);
  const isAuctionActive = activeModal === 'auction';
  const currentBid = useGameStore((s) => s.auction?.currentBid ?? 0);
  const isRolling = useGameStore((s) => s.isRolling);
  const isPawnMoving = useGameStore((s) => Boolean(s.activePawnAnimation?.isAnimating));
  const levelMap = useGameStore((s) => s.levelMap);
  const prevBidRef = useRef<number>(currentBid);
  const bidFlashTimerRef = useRef<number>(1.0);
  const prevLevelMapRef = useRef(levelMap);
  const lastMotionTimeRef = useRef<number>(performance.now());
  const isShadowsEnabled = useDiagnostic3DStore((s) => s.isShadowsEnabled);

  const shadowMapSize = resolveShadowMapSize(isMobile);

  const sunRef = useRef<DirectionalLight>(null);
  const fillRef = useRef<DirectionalLight>(null);
  const rimRef = useRef<DirectionalLight>(null);
  const ambientRef = useRef<AmbientLight>(null);
  const hemiRef = useRef<HemisphereLight>(null);
  const topDownRef = useRef<DirectionalLight>(null);

  const preset = TIME_OF_DAY_PRESETS[phase];
  const initialPreset = useMemo(() => TIME_OF_DAY_PRESETS[useEnvironmentStore.getState().phase], []);
  const initialAmbientIntensity = useMemo(
    () => calculateMobileNightAmbientIntensity(useEnvironmentStore.getState().phase, isMobile, initialPreset.ambientIntensity),
    [isMobile, initialPreset.ambientIntensity]
  );
  const initialTopDown = useMemo(() => calculateTopDownFill(useEnvironmentStore.getState().phase, false, isMobile), [isMobile]);

  // Temporary Three.js math objects for GC-free smooth lerp
  const tempColor = useMemo(() => new Color(), []);
  const tempVec = useMemo(() => new Vector3(), []);

  useSafeFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (isAuto) {
      const progress = (t % AUTO_CYCLE_DURATION_SECONDS) / AUTO_CYCLE_DURATION_SECONDS;
      const computedPhase = calculatePhaseFromProgress(progress);
      if (computedPhase !== phase) {
        setPhase(computedPhase);
      }
    }
    const dt = Math.min(delta, 0.1);
    const lerpRate = 1 - Math.exp(-dt * 3.0);

    if (isAuctionActive && currentBid > prevBidRef.current) {
      bidFlashTimerRef.current = 0;
    }
    prevBidRef.current = currentBid;
    bidFlashTimerRef.current += dt;

    const flashBoost = isAuctionActive ? calculateBidFlashIntensity(0, bidFlashTimerRef.current, 1.2, 0.35) : 0;

    updateDirectLights(sunRef.current, fillRef.current, rimRef.current, preset, phase, isAuctionActive, lerpRate, tempVec, tempColor, flashBoost);
    if (sunRef.current?.shadow) {
      if (!isShadowsEnabled || isMobile) {
        sunRef.current.shadow.autoUpdate = false;
      } else {
        const isBuildingDirty = prevLevelMapRef.current !== levelMap;
        prevLevelMapRef.current = levelMap;
        const cacheState = updateLightingShadowCache(sunRef.current, {
          isRolling,
          isPawnMoving,
          isBuildingDirty,
          targetSunPosition: preset.sunPosition,
          lastMotionTimeMs: lastMotionTimeRef.current,
          nowMs: performance.now(),
          gracePeriodMs: 800,
        });
        lastMotionTimeRef.current = cacheState.lastMotionTimeMs;
      }
    }
    updateDiffuseAndAtmosphere(ambientRef.current, hemiRef.current, state.scene, state.gl, preset, phase, isAuctionActive, dt, lerpRate, tempColor, flashBoost, isMobile);
    if (topDownRef.current) {
      const topDownTarget = calculateTopDownFill(phase, isAuctionActive, isMobile);
      tempColor.set(topDownTarget.color);
      topDownRef.current.color.lerp(tempColor, lerpRate);
      topDownRef.current.intensity += (topDownTarget.intensity - topDownRef.current.intensity) * lerpRate;
    }
  });

  return (
    <>
      {/* 1. Bầu trời động (Dynamic Sky Dome Color) */}
      <color attach="background" args={[initialPreset.skyColor]} />

      {/* 2. Sương mù chân trời khí quyển (Dynamic Atmospheric Fog) */}
      <fog attach="fog" args={[initialPreset.fogColor, initialPreset.fogNear, initialPreset.fogFar]} />

      <group data-testid="time-of-day-lighting">
        {/* 3. Ánh sáng tán xạ không gian (Ambient Light) */}
        <ambientLight ref={ambientRef} color={initialPreset.ambientColor} intensity={initialAmbientIntensity} />

        {/* 4. Ánh sáng vòm trời & phản xạ mặt đất (Hemisphere Light) */}
        <hemisphereLight
          ref={hemiRef}
          color={initialPreset.hemiSkyColor}
          groundColor={initialPreset.hemiGroundColor}
          intensity={initialPreset.hemiIntensity}
        />

        {/* 5. Nguồn sáng chính: Mặt trời nhiệt đới / Mặt trăng ánh bạc (Directional Light với Shadow Mapping) */}
        <directionalLight
          ref={sunRef}
          position={initialPreset.sunPosition}
          color={initialPreset.sunColor}
          intensity={initialPreset.sunIntensity}
          castShadow={!isMobile}
          shadow-mapSize-width={shadowMapSize}
          shadow-mapSize-height={shadowMapSize}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
          shadow-camera-near={0.5}
          shadow-camera-far={95}
          shadow-bias={-0.00005}
          shadow-normalBias={0.003}
        />

        {/* 6. Fill Light: Ánh phản chiếu từ vịnh biển ngọc bích */}
        <directionalLight
          ref={fillRef}
          position={[20, 16, -18]}
          color="#CCFBF1"
          intensity={0.12}
        />

        {/* 7. Rim Light: Ánh nắng viền trên chóp tháp và ngọn sóng */}
        <directionalLight
          ref={rimRef}
          position={[-10, 18, -24]}
          color="#F8FAFC"
          intensity={0.12}
        />

        {/* 8. Balanced Top-down Fill Light: Khử triệt để bóng tối sầm mọi thời điểm */}
        <directionalLight
          ref={topDownRef}
          position={[0, 30, 0]}
          intensity={initialTopDown.intensity}
          color={initialTopDown.color}
        />
      </group>
    </>
  );
}
