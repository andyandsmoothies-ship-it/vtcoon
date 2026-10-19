/**
 * [VIEW-MODEL SEAM] transit_wheel_visuals.ts
 * Pure trigonometric calculations, SVG path generation, and sector presentation DTOs for Transit Wheel.
 * 
 * DESIGN TRADE-OFF (Casino Roulette Radial Typography):
 * Text and icons are rotated along each spoke radially without 180-deg flip.
 * - ADVANTAGE: Any sector that lands at the winning 12 o'clock needle is 100% vertically upright and crisp.
 * - TRADE-OFF: At initial rest, sectors on the lower half (e.g. 20% Cash Back at 234°, 10% Flight at 288°)
 *   appear inverted to the stationary player before the wheel spins. This strictly adheres to international
 *   Casino roulette wheel standards prioritizing winning-stop readability.
 */
import { TRANSIT_WHEEL_CONFIGS, type TransitWheelConfig, TransitWheelOutcome } from '../../../domain/index.js';

export interface TransitWheelSectorAngle {
  readonly outcome: TransitWheelOutcome;
  readonly weight: number;
  readonly color: string;
  readonly icon: string;
  readonly startDeg: number;
  readonly endDeg: number;
  readonly midDeg: number;
  readonly spanDeg: number;
  readonly pathData: string;
  readonly iconY: number;
  readonly textY: number;
  readonly iconSize: number;
  readonly fontSize: number;
  readonly isNarrow: boolean;
  readonly isCollapsed: boolean;
}

const WHEEL_FULL_SPINS_DEG = 1800;

function buildSectorPath(
  startDeg: number,
  endDeg: number,
  spanDeg: number,
  radius: number,
  cx: number,
  cy: number,
): string {
  if (spanDeg <= 0.01) return '';
  if (spanDeg >= 359.99) {
    return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius} A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius} Z`;
  }
  const startRad = (startDeg * Math.PI) / 180;
  const endRad = (endDeg * Math.PI) / 180;
  const x1 = cx + radius * Math.sin(startRad);
  const y1 = cy - radius * Math.cos(startRad);
  const x2 = cx + radius * Math.sin(endRad);
  const y2 = cy - radius * Math.cos(endRad);
  const largeArc = spanDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

export function getTransitWheelSectorAngles(
  configs: readonly TransitWheelConfig[] = TRANSIT_WHEEL_CONFIGS,
  radius: number = 95,
  cx: number = 100,
  cy: number = 100,
): readonly TransitWheelSectorAngle[] {
  const totalWeight = configs.reduce((sum, c) => sum + (c.weight > 0 ? c.weight : 0), 0) || 100;
  let currentAngle = 0;
  return configs.map((cfg, idx) => {
    const safeWeight = Math.max(0, cfg.weight);
    const rawSpan = Number(((safeWeight / totalWeight) * 360).toFixed(4));
    const startDeg = Number(currentAngle.toFixed(4));
    let endDeg = Number((currentAngle + rawSpan).toFixed(4));
    if (idx === configs.length - 1 && Math.abs(endDeg - 360) < 0.05) {
      endDeg = 360;
    }
    const spanDeg = Number((endDeg - startDeg).toFixed(4));
    const midDeg = Number((startDeg + spanDeg / 2).toFixed(4));
    currentAngle = endDeg;

    // [BOUNDARY HEURISTIC] isNarrow threshold (45 deg):
    // Tailored for the current 5-tier distribution (35%=126°, 20%=72°, 20%=72°, 10%=36°, 15%=54°).
    // At 10% (36°): chord width is ~30px, requiring compact icon (16px) and font (10px) shifted to Y=32/54.
    // At 15% (54°): chord width is ~41.4px, leaving ~6px total buffer with 22px icon + 22.5px text.
    // NOTE: If game economy adds sectors in the 12%-14% range (43°-50°), upgrade this to a dynamic chord interpolation.
    const isNarrow = spanDeg < 45;
    const isCollapsed = spanDeg <= 0.01;
    const pathData = buildSectorPath(startDeg, endDeg, spanDeg, radius, cx, cy);

    return {
      outcome: cfg.outcome,
      weight: cfg.weight,
      color: cfg.color,
      icon: cfg.icon,
      startDeg,
      endDeg,
      midDeg,
      spanDeg,
      pathData,
      iconY: isNarrow ? 32 : 36,
      textY: isNarrow ? 54 : 56,
      iconSize: isNarrow ? 16 : 22,
      fontSize: isNarrow ? 10 : 12,
      isNarrow,
      isCollapsed,
    };
  });
}

export function getProportionalWheelTargetDeg(
  outcomeIndex: number,
  configs: readonly TransitWheelConfig[] = TRANSIT_WHEEL_CONFIGS,
): number {
  const sectors = getTransitWheelSectorAngles(configs);
  const targetSector = sectors[outcomeIndex] ?? sectors[0];
  const midDeg = targetSector?.midDeg ?? 0;
  return WHEEL_FULL_SPINS_DEG + (360 - midDeg);
}
