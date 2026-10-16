// [UI-S01/MSS][IMP-406] MonopolyMobileArchwayVisuals — Domino Shockwave Kinematics & Mobile Pre-Allocated InstancedMesh Pool View-Model
import { BoxGeometry, BufferAttribute, BufferGeometry } from 'three';
import type { ActiveSlam } from '../store/vfx_store';
import {
  type MonopolyGroupInfo,
  getCircularCellDistance,
  calculateDominoRippleTransform,
  resolveMobilePoolDominoSlam,
  resolveNeighborDominoSlam,
  type DominoRippleOptions,
  type DominoRippleTransform,
} from './monopoly_plaza_math';
import { getMonopolyBoulevardSegments } from './monopoly_plaza_visuals';

export {
  getCircularCellDistance,
  calculateDominoRippleTransform,
  resolveMobilePoolDominoSlam,
  resolveNeighborDominoSlam,
  type DominoRippleOptions,
  type DominoRippleTransform,
};

export const MAX_MONOPOLY_ARCHWAY_SLOTS = 8 as const;
export const MAX_MONOPOLY_PROMENADE_SLOTS = 16 as const;
const INACTIVE_OWNER_COLOR = '#64748B';
const ZERO_TUPLE: readonly [number, number, number] = [0, 0, 0];

export interface MobileMonopolyPoolSlotMatrix {
  readonly slotIndex: number;
  readonly active: boolean;
  readonly colorGroup: string;
  readonly ownerColor: string;
  readonly position: readonly [number, number, number];
  readonly rotationY: number;
  readonly pitchX: number;
  readonly scale: readonly [number, number, number];
}

type ArchwayFrustumSpec = readonly [
  cx: number, cy: number, cz: number, wx: number, hy: number, wz: number,
  topScaleX: number, topScaleZ: number, hex: string, aoBottom: number, aoTop: number, openBottom: boolean
];

type ArchwayCavitySpec = readonly [
  cx: number, cy: number, zSurface: number, zInward: number, width: number, height: number, hex: string, ao: number
];

// Genuine multi-part sculpted Art Deco Archway frustums (0.72m x 0.68m x 0.14m)
const ARCHWAY_TECTONIC_FRUSTUMS: readonly ArchwayFrustumSpec[] = [
  [-0.27, 0.04, 0, 0.18, 0.08, 0.14, 0.92, 0.92, '#D97706', 0.54, 0.86, true],
  [0.27, 0.04, 0, 0.18, 0.08, 0.14, 0.92, 0.92, '#D97706', 0.54, 0.86, true],
  [-0.27, 0.28, 0, 0.14, 0.4, 0.12, 1.0, 1.0, '#F8FAFC', 0.76, 1.04, true],
  [0.27, 0.28, 0, 0.14, 0.4, 0.12, 1.0, 1.0, '#F8FAFC', 0.76, 1.04, true],
  [-0.27, 0.5, 0, 0.16, 0.04, 0.13, 1.06, 1.04, '#F59E0B', 0.82, 1.02, false],
  [0.27, 0.5, 0, 0.16, 0.04, 0.13, 1.06, 1.04, '#F59E0B', 0.82, 1.02, false],
  [-0.14, 0.49, 0, 0.12, 0.05, 0.11, 0.85, 0.95, '#E2E8F0', 0.72, 0.96, false],
  [0.14, 0.49, 0, 0.12, 0.05, 0.11, 0.85, 0.95, '#E2E8F0', 0.72, 0.96, false],
  [0, 0.55, 0, 0.72, 0.06, 0.14, 1.0, 1.0, '#F8FAFC', 0.84, 1.06, false],
  [0, 0.605, 0, 0.5, 0.05, 0.12, 0.9, 0.92, '#E2E8F0', 0.88, 1.08, true],
  [0, 0.655, 0, 0.26, 0.05, 0.1, 0.78, 0.85, '#F59E0B', 0.92, 1.1, true],
];

// Genuine unoccluded 5-face inward-recessed fluting & keystone pockets (pierced through outer pillar/lintel faces)
const ARCHWAY_RECESSED_CAVITIES: readonly ArchwayCavitySpec[] = [
  [-0.27, 0.28, 0.06, 0.038, 0.056, 0.3, '#334155', 0.36],
  [0.27, 0.28, 0.06, 0.038, 0.056, 0.3, '#334155', 0.36],
  [-0.27, 0.28, -0.06, -0.038, 0.056, 0.3, '#334155', 0.36],
  [0.27, 0.28, -0.06, -0.038, 0.056, 0.3, '#334155', 0.36],
  [0, 0.55, 0.07, 0.048, 0.22, 0.034, '#B45309', 0.44],
  [0, 0.55, -0.07, -0.048, 0.22, 0.034, '#B45309', 0.44],
];

let cachedMobileArchwayGeom: BufferGeometry | null = null;
let cachedMobilePromenadeGeom: BufferGeometry | null = null;

function parseHexRgb(hex: string): readonly [number, number, number] {
  const clean = hex.replace('#', '');
  return [parseInt(clean.slice(0, 2), 16) / 255, parseInt(clean.slice(2, 4), 16) / 255, parseInt(clean.slice(4, 6), 16) / 255];
}

function appendArchwayQuad(
  positions: number[], normals: number[], colors: number[], indices: number[],
  verts: readonly (readonly [number, number, number])[], normal: readonly [number, number, number],
  rgb: readonly [number, number, number], shades: readonly [number, number, number, number]
): void {
  const baseIdx = positions.length / 3;
  for (let i = 0; i < 4; i++) {
    const v = verts[i]!, s = shades[i]!;
    positions.push(v[0], v[1], v[2]);
    normals.push(normal[0], normal[1], normal[2]);
    colors.push(Math.min(1, rgb[0] * s), Math.min(1, rgb[1] * s), Math.min(1, rgb[2] * s));
  }
  indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
}

function emitOrientedWallQuad(
  positions: number[], normals: number[], colors: number[], indices: number[],
  xa: number, xb: number, ya: number, yb: number, z: number, dir: 1 | -1,
  rgb: readonly [number, number, number], sBot: number, sTop: number
): void {
  const lx = dir === 1 ? xa : xb, rx = dir === 1 ? xb : xa;
  appendArchwayQuad(positions, normals, colors, indices, [[lx, ya, z], [rx, ya, z], [rx, yb, z], [lx, yb, z]], [0, 0, dir], rgb, [sBot, sBot, sTop, sTop]);
}

export function getMobileMonopolyArchwayGeometry(): BufferGeometry {
  if (cachedMobileArchwayGeom) return cachedMobileArchwayGeom;
  const positions: number[] = [], normals: number[] = [], colors: number[] = [], indices: number[] = [];
  for (const [cx, cy, cz, wx, hy, wz, tsx, tsz, hex, bAo, tAo, openBottom] of ARCHWAY_TECTONIC_FRUSTUMS) {
    const rgb = parseHexRgb(hex);
    const bx0 = cx - wx * 0.5, bx1 = cx + wx * 0.5, bz0 = cz - wz * 0.5, bz1 = cz + wz * 0.5;
    const tx0 = cx - wx * tsx * 0.5, tx1 = cx + wx * tsx * 0.5, tz0 = cz - wz * tsz * 0.5, tz1 = cz + wz * tsz * 0.5;
    const y0 = cy - hy * 0.5, y1 = cy + hy * 0.5;
    const frontCavity = ARCHWAY_RECESSED_CAVITIES.find((c) => Math.abs(c[0] - cx) < 1e-4 && Math.abs(c[1] - cy) < 1e-4 && Math.abs(c[2] - bz1) < 1e-4);
    if (frontCavity) {
      const cx0 = cx - frontCavity[4] * 0.5, cx1 = cx + frontCavity[4] * 0.5, cy0 = cy - frontCavity[5] * 0.5, cy1 = cy + frontCavity[5] * 0.5;
      emitOrientedWallQuad(positions, normals, colors, indices, bx0, bx1, y0, cy0, bz1, 1, rgb, bAo, bAo);
      emitOrientedWallQuad(positions, normals, colors, indices, bx0, bx1, cy1, y1, bz1, 1, rgb, tAo, tAo);
      emitOrientedWallQuad(positions, normals, colors, indices, bx0, cx0, cy0, cy1, bz1, 1, rgb, bAo, tAo);
      emitOrientedWallQuad(positions, normals, colors, indices, cx1, bx1, cy0, cy1, bz1, 1, rgb, bAo, tAo);
    } else {
      appendArchwayQuad(positions, normals, colors, indices, [[bx0, y0, bz1], [bx1, y0, bz1], [tx1, y1, tz1], [tx0, y1, tz1]], [0, 0, 1], rgb, [bAo, bAo, tAo, tAo]);
    }
    const backCavity = ARCHWAY_RECESSED_CAVITIES.find((c) => Math.abs(c[0] - cx) < 1e-4 && Math.abs(c[1] - cy) < 1e-4 && Math.abs(c[2] - bz0) < 1e-4);
    if (backCavity) {
      const cx0 = cx - backCavity[4] * 0.5, cx1 = cx + backCavity[4] * 0.5, cy0 = cy - backCavity[5] * 0.5, cy1 = cy + backCavity[5] * 0.5;
      emitOrientedWallQuad(positions, normals, colors, indices, bx0, bx1, y0, cy0, bz0, -1, rgb, bAo * 0.9, bAo * 0.9);
      emitOrientedWallQuad(positions, normals, colors, indices, bx0, bx1, cy1, y1, bz0, -1, rgb, tAo * 0.94, tAo * 0.94);
      emitOrientedWallQuad(positions, normals, colors, indices, bx0, cx0, cy0, cy1, bz0, -1, rgb, bAo * 0.9, tAo * 0.94);
      emitOrientedWallQuad(positions, normals, colors, indices, cx1, bx1, cy0, cy1, bz0, -1, rgb, bAo * 0.9, tAo * 0.94);
    } else {
      appendArchwayQuad(positions, normals, colors, indices, [[bx1, y0, bz0], [bx0, y0, bz0], [tx0, y1, tz0], [tx1, y1, tz0]], [0, 0, -1], rgb, [bAo * 0.9, bAo * 0.9, tAo * 0.94, tAo * 0.94]);
    }
    appendArchwayQuad(positions, normals, colors, indices, [[bx1, y0, bz1], [bx1, y0, bz0], [tx1, y1, tz0], [tx1, y1, tz1]], [1, 0, 0], rgb, [bAo * 0.94, bAo * 0.94, tAo * 0.98, tAo * 0.98]);
    appendArchwayQuad(positions, normals, colors, indices, [[bx0, y0, bz0], [bx0, y0, bz1], [tx0, y1, tz1], [tx0, y1, tz0]], [-1, 0, 0], rgb, [bAo * 0.88, bAo * 0.88, tAo * 0.92, tAo * 0.92]);
    appendArchwayQuad(positions, normals, colors, indices, [[tx0, y1, tz1], [tx1, y1, tz1], [tx1, y1, tz0], [tx0, y1, tz0]], [0, 1, 0], rgb, [tAo, tAo, tAo, tAo]);
    if (!openBottom) {
      appendArchwayQuad(positions, normals, colors, indices, [[bx0, y0, bz0], [bx1, y0, bz0], [bx1, y0, bz1], [bx0, y0, bz1]], [0, -1, 0], rgb, [bAo * 0.65, bAo * 0.65, bAo * 0.65, bAo * 0.65]);
    }
  }
  for (const [cx, cy, zSurf, zIn, w, h, hex, ao] of ARCHWAY_RECESSED_CAVITIES) {
    const rgb = parseHexRgb(hex);
    const x0 = cx - w * 0.5, x1 = cx + w * 0.5, y0 = cy - h * 0.5, y1 = cy + h * 0.5;
    const dir: 1 | -1 = zSurf >= zIn ? 1 : -1;
    const zPos = dir === 1 ? zSurf : zIn, zNeg = dir === 1 ? zIn : zSurf;
    emitOrientedWallQuad(positions, normals, colors, indices, x0, x1, y0, y1, zIn, dir, rgb, ao, ao * 0.92);
    appendArchwayQuad(positions, normals, colors, indices, [[x0, y0, zPos], [x0, y0, zNeg], [x0, y1, zNeg], [x0, y1, zPos]], [1, 0, 0], rgb, [ao * 1.15, ao, ao, ao * 1.15]);
    appendArchwayQuad(positions, normals, colors, indices, [[x1, y0, zNeg], [x1, y0, zPos], [x1, y1, zPos], [x1, y1, zNeg]], [-1, 0, 0], rgb, [ao, ao * 1.15, ao * 1.15, ao]);
    appendArchwayQuad(positions, normals, colors, indices, [[x0, y1, zNeg], [x1, y1, zNeg], [x1, y1, zPos], [x0, y1, zPos]], [0, -1, 0], rgb, [ao * 0.85, ao * 0.85, ao * 1.1, ao * 1.1]);
    appendArchwayQuad(positions, normals, colors, indices, [[x0, y0, zPos], [x1, y0, zPos], [x1, y0, zNeg], [x0, y0, zNeg]], [0, 1, 0], rgb, [ao * 1.1, ao * 1.1, ao * 0.9, ao * 0.9]);
  }
  const geom = new BufferGeometry();
  geom.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geom.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
  geom.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  geom.setIndex(new BufferAttribute(new Uint16Array(indices), 1));
  geom.computeBoundingBox();
  geom.computeBoundingSphere();
  cachedMobileArchwayGeom = geom;
  return geom;
}

export function getMobileMonopolyPromenadeSlotGeometry(): BufferGeometry {
  if (cachedMobilePromenadeGeom) return cachedMobilePromenadeGeom;
  const geom = new BoxGeometry(1.0, 0.024, 0.16);
  geom.computeBoundingBox();
  geom.computeBoundingSphere();
  cachedMobilePromenadeGeom = geom;
  return geom;
}

export function computeMobileMonopolyArchwayPoolSlots(
  monopolyGroups?: Record<string, MonopolyGroupInfo> | null,
  activeSlams?: Readonly<Record<number, ActiveSlam>> | null,
  nowMs = Date.now()
): ReadonlyArray<MobileMonopolyPoolSlotMatrix> {
  const primarySegments = getMonopolyBoulevardSegments(monopolyGroups).filter((s) => s.isPrimaryArchwaySegment);
  return Array.from({ length: MAX_MONOPOLY_ARCHWAY_SLOTS }, (_, slotIndex): MobileMonopolyPoolSlotMatrix => {
    const seg = primarySegments[slotIndex];
    if (!seg) return { slotIndex, active: false, colorGroup: '', ownerColor: INACTIVE_OWNER_COLOR, position: ZERO_TUPLE, rotationY: 0, pitchX: 0, scale: ZERO_TUPLE };
    let bestHit: { readonly slam: ActiveSlam; readonly distanceInCells: number } | null = null;
    for (const cellIdx of seg.cells) {
      const hit = resolveMobilePoolDominoSlam(cellIdx, activeSlams, nowMs);
      if (hit && (!bestHit || hit.distanceInCells < bestHit.distanceInCells)) {
        bestHit = hit;
      }
    }
    let yOffset = 0, scaleYFactor = 1, pitchX = 0;
    if (bestHit) {
      const ripple = calculateDominoRippleTransform(bestHit.distanceInCells, nowMs - (bestHit.slam.startTime + bestHit.slam.impactTimeMs));
      if (!ripple.isSettled) {
        yOffset = ripple.yOffset;
        scaleYFactor = ripple.scaleY;
        pitchX = ripple.pitchRad;
      }
    }
    return {
      slotIndex, active: true, colorGroup: seg.colorGroup, ownerColor: seg.ownerColor,
      position: [seg.archwayWorldPosition[0], Number((seg.archwayWorldPosition[1] + yOffset).toFixed(5)), seg.archwayWorldPosition[2]],
      rotationY: seg.rotationY,
      pitchX,
      scale: [seg.archwayScale[0], Number((seg.archwayScale[1] * scaleYFactor).toFixed(5)), seg.archwayScale[2]],
    };
  });
}

export function computeMobileMonopolyPromenadePoolSlots(
  monopolyGroups?: Record<string, MonopolyGroupInfo> | null
): ReadonlyArray<MobileMonopolyPoolSlotMatrix> {
  const segments = getMonopolyBoulevardSegments(monopolyGroups);
  return Array.from({ length: MAX_MONOPOLY_PROMENADE_SLOTS }, (_, slotIndex): MobileMonopolyPoolSlotMatrix => {
    const seg = segments[slotIndex];
    if (!seg) return { slotIndex, active: false, colorGroup: '', ownerColor: INACTIVE_OWNER_COLOR, position: ZERO_TUPLE, rotationY: 0, pitchX: 0, scale: ZERO_TUPLE };
    return {
      slotIndex, active: true, colorGroup: seg.colorGroup, ownerColor: seg.ownerColor,
      position: seg.worldPosition, rotationY: seg.rotationY, pitchX: 0, scale: [seg.promenadeWidth, 1, 1],
    };
  });
}

export function disposeMobileMonopolyArchwayGeometries(): void {
  if (cachedMobileArchwayGeom) {
    cachedMobileArchwayGeom.dispose();
    cachedMobileArchwayGeom = null;
  }
  if (cachedMobilePromenadeGeom) {
    cachedMobilePromenadeGeom.dispose();
    cachedMobilePromenadeGeom = null;
  }
}
