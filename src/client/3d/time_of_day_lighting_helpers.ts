// [UI-S01/MSS][UI-S04/MSS] TimeOfDayLighting Helpers — Pure Lighting Math & Atmosphere Update Logic
import { Color, Vector3, Fog, type DirectionalLight, type AmbientLight, type HemisphereLight, type Scene } from 'three';
import { TIME_OF_DAY_PRESETS } from '../store/environment_store';
import { calculateTheatricalAmbientIntensity } from './auction_3d_stage';
import {
  shouldUpdateShadows,
  isSunPositionMoving,
  calculateShadowGraceRemaining,
  applyShadowAutoUpdate,
} from './shadow_cache_helpers';

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

export function calculateMobileNightAmbientIntensity(
  phase: string,
  isMobile: boolean,
  baseAmbient: number
): number {
  if (isMobile && phase === 'night') {
    return Math.max(baseAmbient, 0.50);
  }
  return baseAmbient;
}

export function calculateTopDownFill(
  phase: 'day' | 'sunset' | 'night',
  isAuctionActive: boolean,
  isMobile: boolean = false
): { intensity: number; color: string } {
  switch (phase) {
    case 'day':
      return { intensity: isAuctionActive ? 0.05 : 0.25, color: '#F8FAFC' };
    case 'sunset':
      return { intensity: isAuctionActive ? 0.05 : 0.18, color: '#FEF3C7' };
    case 'night':
      return { intensity: isAuctionActive ? 0.05 : (isMobile ? 0.26 : 0.14), color: '#BAE6FD' };
  }
}

export function calculateBaseEnv(phase: 'day' | 'sunset' | 'night'): number {
  return phase === 'night' ? 0.28 : phase === 'sunset' ? 0.38 : 0.75;
}

export function calculateTargetExposure(phase: string, isAuctionActive: boolean): number {
  if (isAuctionActive) return 0.94;
  switch (phase) {
    case 'day': return 1.00;
    case 'sunset': return 1.06;
    case 'night': return 1.14;
    default: return 1.00;
  }
}

export function lerpExposure(current: number, target: number, rate: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(target) || !Number.isFinite(rate)) return current;
  return current + (target - current) * rate;
}

export function calculateFogTargets(
  phase: 'day' | 'sunset' | 'night',
  isAuctionActive: boolean,
  preset?: typeof TIME_OF_DAY_PRESETS['day']
): { near: number; far: number; color: string } {
  if (isAuctionActive) {
    return { near: 18.0, far: 55.0, color: '#0F172A' };
  }
  const resolvedPreset = preset ?? TIME_OF_DAY_PRESETS[phase] ?? TIME_OF_DAY_PRESETS.day;
  return { near: resolvedPreset.fogNear, far: resolvedPreset.fogFar, color: resolvedPreset.fogColor };
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
  if (!Number.isFinite(baseIntensity)) return 0;
  if (!Number.isFinite(timer) || !Number.isFinite(boost) || !Number.isFinite(duration)) return baseIntensity;
  if (timer < 0 || timer >= duration || duration <= 0) return baseIntensity;

  const progress = timer / duration;
  const decay = (1.0 - progress) * (1.0 - progress);
  return baseIntensity + boost * decay;
}

export function isThreeFog(fog: unknown): fog is Fog {
  return typeof fog === 'object' && fog !== null && 'isFog' in fog;
}

export function isThreeColor(bg: unknown): bg is Color {
  return typeof bg === 'object' && bg !== null && 'isColor' in bg;
}

export function calculateRimColor(phase: 'day' | 'sunset' | 'night'): string {
  return phase === 'night' ? '#38BDF8' : phase === 'sunset' ? '#EA580C' : '#F8FAFC';
}

export function updateDirectLights(
  sun: DirectionalLight | null,
  fill: DirectionalLight | null,
  rim: DirectionalLight | null,
  preset: typeof TIME_OF_DAY_PRESETS['day'],
  phase: 'day' | 'sunset' | 'night',
  isAuctionActive: boolean,
  lerpRate: number,
  tempVec: Vector3,
  tempColor: Color,
  flashBoost: number = 0,
): void {
  if (sun) {
    tempVec.set(preset.sunPosition[0], preset.sunPosition[1], preset.sunPosition[2]);
    sun.position.lerp(tempVec, lerpRate);
    tempColor.set(preset.sunColor);
    sun.color.lerp(tempColor, lerpRate);
    const targetSun = (isAuctionActive ? preset.sunIntensity * 0.15 : preset.sunIntensity) + flashBoost;
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
    const rimColor = calculateRimColor(phase);
    tempColor.set(rimColor);
    rim.color.lerp(tempColor, lerpRate);
    rim.intensity += (targetRim - rim.intensity) * lerpRate;
  }
}

export function updateDiffuseAndAtmosphere(
  ambient: AmbientLight | null,
  hemi: HemisphereLight | null,
  scene: (Scene & { environmentIntensity?: number }) | undefined,
  gl: { toneMappingExposure: number } | undefined,
  preset: typeof TIME_OF_DAY_PRESETS['day'],
  phase: 'day' | 'sunset' | 'night',
  isAuctionActive: boolean,
  dt: number,
  lerpRate: number,
  tempColor: Color,
  flashBoost: number = 0,
  isMobile: boolean = false,
): void {
  if (gl && typeof gl.toneMappingExposure === 'number') {
    const targetExposure = calculateTargetExposure(phase, isAuctionActive);
    gl.toneMappingExposure = lerpExposure(gl.toneMappingExposure, targetExposure, lerpRate);
  }

  if (ambient) {
    tempColor.set(preset.ambientColor);
    ambient.color.lerp(tempColor, lerpRate);
    const targetAmbient = calculateMobileNightAmbientIntensity(phase, isMobile, preset.ambientIntensity);
    ambient.intensity = calculateTheatricalAmbientIntensity(ambient.intensity, isAuctionActive, dt, targetAmbient, 0.15) + (isAuctionActive ? flashBoost * 0.3 : 0);
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
    const fogTargets = calculateFogTargets(phase, isAuctionActive, preset);
    if (!scene.fog || !isThreeFog(scene.fog)) {
      scene.fog = new Fog(fogTargets.color, fogTargets.near, fogTargets.far);
    } else {
      tempColor.set(fogTargets.color);
      if (scene.fog.color.getHexString() !== tempColor.getHexString()) {
        scene.fog.color.lerp(tempColor, lerpRate);
      }
      if (Math.abs(fogTargets.near - scene.fog.near) > 0.05) {
        scene.fog.near += (fogTargets.near - scene.fog.near) * lerpRate;
      }
      if (Math.abs(fogTargets.far - scene.fog.far) > 0.05) {
        scene.fog.far += (fogTargets.far - scene.fog.far) * lerpRate;
      }
    }
    const targetSkyColor = isAuctionActive ? fogTargets.color : preset.skyColor;
    if (!scene.background || !isThreeColor(scene.background)) {
      scene.background = new Color(targetSkyColor);
    } else {
      tempColor.set(targetSkyColor);
      if (scene.background.getHexString() !== tempColor.getHexString()) {
        scene.background.lerp(tempColor, lerpRate);
      }
    }
    const baseEnv = calculateBaseEnv(phase);
    const targetEnv = isAuctionActive ? 0.12 : baseEnv;
    if (typeof scene.environmentIntensity !== 'number') {
      scene.environmentIntensity = 1.0;
    }
    scene.environmentIntensity += (targetEnv - scene.environmentIntensity) * lerpRate;
  }
}

export interface LightingShadowCacheParams {
  readonly isRolling: boolean;
  readonly isPawnMoving: boolean;
  readonly isBuildingDirty: boolean;
  readonly targetSunPosition: [number, number, number];
  readonly lastMotionTimeMs: number;
  readonly nowMs: number;
  readonly gracePeriodMs?: number;
}

export function updateLightingShadowCache(
  sun: DirectionalLight | null,
  params: LightingShadowCacheParams
): {
  readonly lastMotionTimeMs: number;
  readonly autoUpdate: boolean;
  readonly needsShadows: boolean;
} {
  if (!sun) {
    return { lastMotionTimeMs: params.lastMotionTimeMs, autoUpdate: false, needsShadows: false };
  }
  const isSunMoving = isSunPositionMoving(sun.position, params.targetSunPosition);
  const needsShadows = shouldUpdateShadows({
    isRolling: params.isRolling,
    isPawnMoving: params.isPawnMoving,
    isSunMoving,
    isBuildingDirty: params.isBuildingDirty,
  });
  const updatedMotionTime = needsShadows ? params.nowMs : params.lastMotionTimeMs;
  const graceRemaining = calculateShadowGraceRemaining(
    updatedMotionTime,
    params.nowMs,
    params.gracePeriodMs ?? 800
  );
  const activeUpdate = needsShadows || graceRemaining > 0;
  const autoUpdate = applyShadowAutoUpdate(sun, activeUpdate);
  return {
    lastMotionTimeMs: updatedMotionTime,
    autoUpdate,
    needsShadows,
  };
}
