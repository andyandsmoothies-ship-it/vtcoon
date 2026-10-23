// [UI-S01/MSS][UI-S04/MSS][IMP-293] Cinematic Spline Flyby & Macro Pacing
import type { TargetCameraState } from './camera_types';
import {
  calculateTileFocusCameraPosition,
  calculateResponsiveOverviewCameraState,
} from './camera_kinematic_helpers';
import { cellPosition } from './board_coords';

export interface SplineArcParams {
  readonly startCell: number;
  readonly targetCell: number;
  readonly progress: number;
  readonly aspect?: number;
}

export interface BaseCameraConfig {
  readonly position: readonly [number, number, number];
  readonly target: readonly [number, number, number];
  readonly fov: number;
  readonly speed: number;
}

export function resolveJailFlightDuration(isBot?: boolean): number {
  return isBot ? 570 : 670;
}

export function resolveThematicVehicleFlightDurationMs(
  isBot?: boolean,
  flightType?: 'audit' | 'transit' | 'event'
): number {
  if (flightType === 'audit') return isBot ? 2800 : 3800;
  return isBot ? 2400 : 3200;
}

export function resolveThematicVehicleFlightDuration(
  isBot?: boolean,
  flightType?: 'audit' | 'transit' | 'event'
): number {
  return resolveThematicVehicleFlightDurationMs(isBot, flightType);
}

export function resolveJailFlightProgress(flightStartTime: number | null, now: number, isBot?: boolean): number {
  if (flightStartTime === null || !Number.isFinite(flightStartTime)) return 0;
  const durationMs = resolveJailFlightDuration(isBot);
  const elapsed = now - flightStartTime;
  return Math.min(1, Math.max(0, elapsed / durationMs));
}

export function resolveThematicFlightProgress(
  flightStartTime: number | null,
  now: number,
  isBot?: boolean,
  flightType?: 'audit' | 'transit' | 'event'
): number {
  if (flightStartTime === null || !Number.isFinite(flightStartTime)) return 0;
  const durationMs = resolveThematicVehicleFlightDurationMs(isBot, flightType);
  const elapsed = now - flightStartTime;
  return Math.min(1, Math.max(0, elapsed / durationMs));
}

export function calculateSplineArcCameraState(params: SplineArcParams, aspect?: number): TargetCameraState {
  const t = Math.max(0, Math.min(1, Number.isFinite(params.progress) ? params.progress : 0));
  const effectiveAspect = params.aspect ?? aspect;
  const safeAspect = typeof effectiveAspect === 'number' && Number.isFinite(effectiveAspect) ? effectiveAspect : 1.77;
  const fov = safeAspect < 1.0 ? Math.min(46, Math.max(30, Math.round(30 / Math.max(0.60, safeAspect)))) : 30;

  const startPos = cellPosition(params.startCell);
  const destPos = cellPosition(params.targetCell);
  const startCamPos = calculateTileFocusCameraPosition(startPos);
  const destCamPos = calculateTileFocusCameraPosition(destPos);

  const baseCamX = (1 - t) * startCamPos[0] + t * destCamPos[0];
  const baseCamY = (1 - t) * startCamPos[1] + t * destCamPos[1];
  const baseCamZ = (1 - t) * startCamPos[2] + t * destCamPos[2];

  // Outward displacement: vector from start to dest in XZ
  const dx = destPos[0] - startPos[0];
  const dz = destPos[2] - startPos[2];
  const dist = Math.hypot(dx, dz);
  const isNorthArc = params.startCell >= 20 || params.targetCell >= 20;

  // Target peak Z for North or South seaward trajectory
  const targetPeakZ = isNorthArc ? -24.0 : 24.0;
  const midCamZ = (startCamPos[2] + destCamPos[2]) / 2;
  const deltaZ = targetPeakZ - midCamZ;
  const arcZ = baseCamZ + deltaZ * Math.sin(Math.PI * t);

  // Smooth arc on X as well (avoiding 1D flat interpolation)
  const outwardX = dist > 0.1 && dx !== 0 ? Math.sign(dx) * 4.0 * Math.sin(Math.PI * t) : 0;
  const posX = baseCamX + outwardX;

  // Scenic Dip: Only dip when the arc actually curves towards the South bay (arcZ > 0)
  const isSouthFlightArc = arcZ > 0;
  const dip = isSouthFlightArc ? 1.5 * Math.sin(Math.PI * t) : 0;

  // Altitude peak reaches 16.0m (or 14.5m with Scenic Dip)
  const midCamY = (startCamPos[1] + destCamPos[1]) / 2;
  const deltaY = 16.0 - midCamY;
  const posY = baseCamY + deltaY * Math.sin(Math.PI * t) - dip;

  // LookAt target tracks pawn 3D parabolic flight
  const targetX = (1 - t) * startPos[0] + t * destPos[0];
  const targetY = 0.2 + 2.2 * Math.sin(Math.PI * t);
  const targetZ = (1 - t) * startPos[2] + t * destPos[2];

  return {
    position: [posX, posY, arcZ],
    target: [targetX, targetY, targetZ],
    fov,
    speed: 4.5,
  };
}

function getPhaseTier(val: number): 1 | 2 | 3 {
  if (val > 8) return 3;
  if (val > 3) return 2;
  return 1;
}

export function resolveDynamicGamePhase(
  roundNumber: number,
  totalBuildings: number,
  previousPhase?: 1 | 2 | 3
): 1 | 2 | 3 {
  const rPhase = getPhaseTier(Number.isFinite(roundNumber) ? roundNumber : 1);
  const bPhase = getPhaseTier(Number.isFinite(totalBuildings) ? totalBuildings : 0);
  const prev = previousPhase ?? 1;
  const highest = Math.max(prev, rPhase, bPhase);
  if (highest >= 3) return 3;
  if (highest === 2) return 2;
  return 1;
}

export function resolveOverviewConfigByPhase(
  _phase: 1 | 2 | 3,
  baseConfig: BaseCameraConfig,
  aspect?: number
): TargetCameraState {
  return calculateResponsiveOverviewCameraState(aspect, baseConfig);
}
