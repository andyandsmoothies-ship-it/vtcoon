// [UI-S01/MSS][IMP-431] BitexcoTowerVisuals — Pure View-Model & AAA Parametric Geometry Builder
import { BufferGeometry, CylinderGeometry, LatheGeometry, Vector2 } from 'three';

let cachedLotusBudGeo: BufferGeometry | null = null;
let cachedLotusSheathGeo: BufferGeometry | null = null;
let cachedHelipadSaucerGeo: BufferGeometry | null = null;
let cachedCrescentCrownGeo: BufferGeometry | null = null;

/**
 * Computes continuous piecewise spline radius for the Bitexco lotus bud silhouette.
 * Profile: base flare (0.46) -> lotus waist (0.40 -> 0.35) -> neck (0.32) -> taper (0.24).
 */
export function computeBitexcoRadius(y: number): number {
  if (y <= 0.4) return 0.46 - (y / 0.4) * 0.06;
  if (y <= 1.2) return 0.40 - ((y - 0.4) / 0.8) * 0.05;
  if (y <= 1.8) return 0.35 - ((y - 1.2) / 0.6) * 0.03;
  return 0.32 - ((y - 1.8) / 0.65) * 0.08;
}

/**
 * Generates the double-curved aerodynamic lotus bud tower body geometry.
 * Anchored at ground level y = 0.0 to 2.45 without floating elevation.
 */
export function createBitexcoLotusBudGeometry(): BufferGeometry {
  if (!cachedLotusBudGeo) {
    const points: Vector2[] = [];
    const segmentsY = 24;
    for (let i = 0; i <= segmentsY; i++) {
      const y = (i / segmentsY) * 2.45;
      points.push(new Vector2(computeBitexcoRadius(y), y));
    }
    cachedLotusBudGeo = new LatheGeometry(points, 24);
  }
  return cachedLotusBudGeo;
}

/**
 * Generates the outer aerodynamic lotus sheath wrapping the tower body.
 * Radius offset R(y) + 0.025 prevents z-fighting; sweeps 1.6*PI azimuthally.
 */
export function createBitexcoLotusSheathGeometry(): BufferGeometry {
  if (!cachedLotusSheathGeo) {
    const points: Vector2[] = [];
    const segmentsY = 20;
    for (let i = 0; i <= segmentsY; i++) {
      const y = 0.1 + (i / segmentsY) * 1.95;
      points.push(new Vector2(computeBitexcoRadius(y) + 0.025, y));
    }
    cachedLotusSheathGeo = new LatheGeometry(points, 24, 0, Math.PI * 1.6);
  }
  return cachedLotusSheathGeo;
}

/**
 * Generates the aerodynamic petal saucer helipad with curved dish underbelly.
 * Strictly avoids circleGeometry to maintain mobile LOD culling safety.
 */
export function createBitexcoHelipadSaucerGeometry(): BufferGeometry {
  if (!cachedHelipadSaucerGeo) {
    const pts = [
      new Vector2(0.08, -0.06),
      new Vector2(0.20, -0.02),
      new Vector2(0.22, 0.0),
      new Vector2(0.0, 0.0),
    ];
    cachedHelipadSaucerGeo = new LatheGeometry(pts, 20);
  }
  return cachedHelipadSaucerGeo;
}

/**
 * Generates the canted crescent crown with vertex shear transformation.
 * Creates an asymmetrical elevation slope (delta y >= 0.18) matching real Bitexco crown.
 */
export function createBitexcoCrescentCrownGeometry(): BufferGeometry {
  if (!cachedCrescentCrownGeo) {
    const geo = new CylinderGeometry(0.18, 0.24, 0.35, 24, 1, true);
    const pos = geo.attributes.position;
    if (pos) {
      const tanAngle = Math.tan((32 * Math.PI) / 180);
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const z = pos.getZ(i);
        if (y > 0) {
          pos.setY(i, y + z * tanAngle);
        }
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }
    cachedCrescentCrownGeo = geo;
  }
  return cachedCrescentCrownGeo;
}

/**
 * Disposes all cached Bitexco parametric geometries to prevent WebGL VRAM leaks.
 */
export function disposeBitexcoGeometries(): void {
  cachedLotusBudGeo?.dispose();
  cachedLotusBudGeo = null;
  cachedLotusSheathGeo?.dispose();
  cachedLotusSheathGeo = null;
  cachedHelipadSaucerGeo?.dispose();
  cachedHelipadSaucerGeo = null;
  cachedCrescentCrownGeo?.dispose();
  cachedCrescentCrownGeo = null;
}
