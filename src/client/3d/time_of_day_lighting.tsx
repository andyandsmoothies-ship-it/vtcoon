// [UI-S01/MSS][UI-S04/MSS] TimeOfDayLighting — Dynamic Day-Sunset-Night Lighting & Atmosphere Coordinator
import React, { useRef, useMemo } from 'react';
import { Color, Vector3, Fog, type DirectionalLight, type AmbientLight, type HemisphereLight, type Scene } from 'three';
import { useSafeFrame } from './safe_frame';
import {
  useEnvironmentStore,
  TIME_OF_DAY_PRESETS,
  AUTO_CYCLE_DURATION_SECONDS,
  calculatePhaseFromProgress,
} from '../store/environment_store';
import { useGameStore } from '../store/game_store';
import { calculateTheatricalAmbientIntensity } from './auction_3d_stage';
import { resolveShadowMapSize } from '../ui/ui_helpers';


export function calculateBaseFill(phase: 'day' | 'sunset' | 'night'): number {
  switch (phase) {
    case 'day': return 0.12;
    case 'sunset': return 0.35;
    case 'night': return 0.22;
  }
}

export function calculateBaseRim(phase: 'day' | 'sunset' | 'night'): number {
  switch (phase) {
    case 'day': return 0.12;
    case 'sunset': return 0.40;
    case 'night': return 0.25;
  }
}

export function calculateTopDownFill(phase: 'day' | 'sunset' | 'night', isAuctionActive: boolean): { intensity: number; color: string } {
  switch (phase) {
    case 'day':
      return { intensity: isAuctionActive ? 0.05 : 0.25, color: '#F8FAFC' };
    case 'sunset':
      return { intensity: isAuctionActive ? 0.05 : 0.18, color: '#FEF3C7' };
    case 'night':
      return { intensity: isAuctionActive ? 0.05 : 0.14, color: '#BAE6FD' };
  }
}

export function calculateBaseEnv(phase: 'day' | 'sunset' | 'night'): number {
  return phase === 'night' ? 0.28 : phase === 'sunset' ? 0.38 : 0.75;
}

function isThreeFog(fog: unknown): fog is Fog {
  return typeof fog === 'object' && fog !== null && 'isFog' in fog;
}

function isThreeColor(bg: unknown): bg is Color {
  return typeof bg === 'object' && bg !== null && 'isColor' in bg;
}

function updateDirectLights(
  sun: DirectionalLight | null,
  fill: DirectionalLight | null,
  rim: DirectionalLight | null,
  preset: typeof TIME_OF_DAY_PRESETS['day'],
  phase: 'day' | 'sunset' | 'night',
  isAuctionActive: boolean,
  lerpRate: number,
  tempVec: Vector3,
  tempColor: Color,
): void {
  if (sun) {
    tempVec.set(preset.sunPosition[0], preset.sunPosition[1], preset.sunPosition[2]);
    sun.position.lerp(tempVec, lerpRate);
    tempColor.set(preset.sunColor);
    sun.color.lerp(tempColor, lerpRate);
    const targetSun = isAuctionActive ? preset.sunIntensity * 0.15 : preset.sunIntensity;
    sun.intensity += (targetSun - sun.intensity) * lerpRate;
  }
  if (fill) {
    const baseFill = calculateBaseFill(phase);
    const targetFill = isAuctionActive ? baseFill * 0.15 : baseFill;
    const fillColor = phase === 'night' ? '#38BDF8' : phase === 'sunset' ? '#FDBA74' : '#CCFBF1';
    tempColor.set(fillColor);
    fill.color.lerp(tempColor, lerpRate);
    fill.intensity += (targetFill - fill.intensity) * lerpRate;
  }
  if (rim) {
    const baseRim = calculateBaseRim(phase);
    const targetRim = isAuctionActive ? baseRim * 0.15 : baseRim;
    const rimColor = phase === 'night' ? '#38BDF8' : phase === 'sunset' ? '#EA580C' : '#F8FAFC';
    tempColor.set(rimColor);
    rim.color.lerp(tempColor, lerpRate);
    rim.intensity += (targetRim - rim.intensity) * lerpRate;
  }
}

function updateDiffuseAndAtmosphere(
  ambient: AmbientLight | null,
  hemi: HemisphereLight | null,
  scene: (Scene & { environmentIntensity?: number }) | undefined,
  preset: typeof TIME_OF_DAY_PRESETS['day'],
  phase: 'day' | 'sunset' | 'night',
  isAuctionActive: boolean,
  dt: number,
  lerpRate: number,
  tempColor: Color,
): void {
  if (ambient) {
    tempColor.set(preset.ambientColor);
    ambient.color.lerp(tempColor, lerpRate);
    ambient.intensity = calculateTheatricalAmbientIntensity(ambient.intensity, isAuctionActive, dt, preset.ambientIntensity, 0.15);
  }
  if (hemi) {
    tempColor.set(preset.hemiSkyColor);
    hemi.color.lerp(tempColor, lerpRate);
    tempColor.set(preset.hemiGroundColor);
    hemi.groundColor.lerp(tempColor, lerpRate);
    const targetHemi = isAuctionActive ? preset.hemiIntensity * 0.15 : preset.hemiIntensity;
    hemi.intensity += (targetHemi - hemi.intensity) * lerpRate;
  }
  if (scene) {
    if (!scene.fog || !isThreeFog(scene.fog)) {
      scene.fog = new Fog(preset.fogColor, preset.fogNear, preset.fogFar);
    } else {
      tempColor.set(preset.fogColor);
      scene.fog.color.lerp(tempColor, lerpRate);
      scene.fog.near += (preset.fogNear - scene.fog.near) * lerpRate;
      scene.fog.far += (preset.fogFar - scene.fog.far) * lerpRate;
    }
    if (!scene.background || !isThreeColor(scene.background)) {
      scene.background = new Color(preset.skyColor);
    } else {
      tempColor.set(preset.skyColor);
      scene.background.lerp(tempColor, lerpRate);
    }
    const baseEnv = phase === 'night' ? 0.28 : phase === 'sunset' ? 0.38 : 0.75;
    const targetEnv = isAuctionActive ? 0.12 : baseEnv;
    if (typeof scene.environmentIntensity !== 'number') {
      scene.environmentIntensity = 1.0;
    }
    scene.environmentIntensity += (targetEnv - scene.environmentIntensity) * lerpRate;
  }
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

  const shadowMapSize = resolveShadowMapSize(isMobile);

  const sunRef = useRef<DirectionalLight>(null);
  const fillRef = useRef<DirectionalLight>(null);
  const rimRef = useRef<DirectionalLight>(null);
  const ambientRef = useRef<AmbientLight>(null);
  const hemiRef = useRef<HemisphereLight>(null);
  const topDownRef = useRef<DirectionalLight>(null);

  const preset = TIME_OF_DAY_PRESETS[phase];
  const initialPreset = useMemo(() => TIME_OF_DAY_PRESETS[useEnvironmentStore.getState().phase], []);
  const initialTopDown = useMemo(() => calculateTopDownFill(useEnvironmentStore.getState().phase, false), []);

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
    updateDirectLights(sunRef.current, fillRef.current, rimRef.current, preset, phase, isAuctionActive, lerpRate, tempVec, tempColor);
    updateDiffuseAndAtmosphere(ambientRef.current, hemiRef.current, state.scene, preset, phase, isAuctionActive, dt, lerpRate, tempColor);
    if (topDownRef.current) {
      const topDownTarget = calculateTopDownFill(phase, isAuctionActive);
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
      <ambientLight ref={ambientRef} color={initialPreset.ambientColor} intensity={initialPreset.ambientIntensity} />

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
