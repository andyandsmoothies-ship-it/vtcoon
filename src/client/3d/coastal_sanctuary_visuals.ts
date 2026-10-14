// [UI-S01/MSS][IMP-399] coastal_sanctuary_visuals.ts — Pure View-Model & Batched Geometry Builder
import {
  BoxGeometry,
  type BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Matrix4,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { LODLevel } from './perf_budget';

export interface DesktopQualityTierSpec {
  readonly tier: 'MOBILE_TBDR' | 'DESKTOP_BALANCED' | 'DESKTOP_ULTRA';
  readonly usePhysicalClearcoat: boolean;
  readonly castSanctuaryShadows: boolean;
  readonly palmInstanceCount: number;
  readonly deckRoughness: number;
}

export interface CornerSanctuaryDescriptor {
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly baseBottomY: number;
  readonly baseTopY: number;
  readonly deckBottomY: number;
  readonly deckTopY: number;
  readonly rimBottomY: number;
  readonly rimTopY: number;
}

export interface BayIsletDescriptor {
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly scale: readonly [number, number, number];
  readonly bottomElevation: number;
  readonly topElevation: number;
  readonly color: string;
}

export interface SanctuaryPalmTransform {
  readonly position: readonly [number, number, number];
  readonly surfaceTopY: number;
  readonly trunkBottomY: number;
  readonly scale: number;
  readonly rotationY: number;
}

export interface BatchedSanctuaryGeometries {
  readonly sandBasesGeom: BufferGeometry;
  readonly walnutDecksGeom: BufferGeometry;
  readonly brassRimsGeom: BufferGeometry;
  readonly isletsAndCrownsGeom: BufferGeometry;
  readonly palmTrunksGeom: BufferGeometry;
}

const CORNER_SANCTUARY_DESCRIPTORS: ReadonlyArray<CornerSanctuaryDescriptor> = [
  {
    id: 'sanctuary-nw',
    position: [-12.2, -0.28, -12.2],
    baseBottomY: -0.38,
    baseTopY: -0.22,
    deckBottomY: -0.24,
    deckTopY: -0.14,
    rimBottomY: -0.16,
    rimTopY: -0.12,
  },
  {
    id: 'sanctuary-ne',
    position: [12.2, -0.28, -12.2],
    baseBottomY: -0.38,
    baseTopY: -0.22,
    deckBottomY: -0.24,
    deckTopY: -0.14,
    rimBottomY: -0.16,
    rimTopY: -0.12,
  },
  {
    id: 'sanctuary-sw',
    position: [-12.2, -0.28, 12.2],
    baseBottomY: -0.38,
    baseTopY: -0.22,
    deckBottomY: -0.24,
    deckTopY: -0.14,
    rimBottomY: -0.16,
    rimTopY: -0.12,
  },
  {
    id: 'sanctuary-se',
    position: [12.2, -0.28, 12.2],
    baseBottomY: -0.38,
    baseTopY: -0.22,
    deckBottomY: -0.24,
    deckTopY: -0.14,
    rimBottomY: -0.16,
    rimTopY: -0.12,
  },
];

const BAY_ISLET_DESCRIPTORS: ReadonlyArray<BayIsletDescriptor> = [
  {
    id: 'islet-nw',
    position: [-16.5, -0.27, -15.8],
    scale: [3.2, 0.22, 2.8],
    bottomElevation: -0.38,
    topElevation: -0.16,
    color: '#15803D',
  },
  {
    id: 'islet-ne',
    position: [16.5, -0.27, -15.8],
    scale: [3.0, 0.22, 2.6],
    bottomElevation: -0.38,
    topElevation: -0.16,
    color: '#15803D',
  },
  {
    id: 'islet-sw',
    position: [-16.8, -0.27, 15.6],
    scale: [3.4, 0.22, 3.0],
    bottomElevation: -0.38,
    topElevation: -0.16,
    color: '#15803D',
  },
  {
    id: 'islet-se',
    position: [16.8, -0.27, 15.6],
    scale: [3.1, 0.22, 2.7],
    bottomElevation: -0.38,
    topElevation: -0.16,
    color: '#15803D',
  },
];

const SANCTUARY_PALM_ANCHORS: ReadonlyArray<{
  readonly x: number;
  readonly z: number;
  readonly surfaceTopY: number;
  readonly scale: number;
  readonly rotationY: number;
}> = [
  { x: -13.1, z: -13.1, surfaceTopY: -0.14, scale: 1.0, rotationY: 0.4 },
  { x: 13.1, z: -13.1, surfaceTopY: -0.14, scale: 1.05, rotationY: 1.2 },
  { x: -13.1, z: 13.1, surfaceTopY: -0.14, scale: 0.95, rotationY: 2.1 },
  { x: 13.1, z: 13.1, surfaceTopY: -0.14, scale: 1.0, rotationY: 2.9 },
  { x: -11.4, z: -13.2, surfaceTopY: -0.14, scale: 0.88, rotationY: 0.8 },
  { x: 11.4, z: -13.2, surfaceTopY: -0.14, scale: 0.92, rotationY: 1.7 },
  { x: -11.4, z: 13.2, surfaceTopY: -0.14, scale: 0.9, rotationY: 2.5 },
  { x: 11.4, z: 13.2, surfaceTopY: -0.14, scale: 0.86, rotationY: 0.2 },
  { x: -13.2, z: -11.4, surfaceTopY: -0.14, scale: 0.94, rotationY: 1.5 },
  { x: 13.2, z: -11.4, surfaceTopY: -0.14, scale: 0.9, rotationY: 2.3 },
  { x: -13.2, z: 11.4, surfaceTopY: -0.14, scale: 0.96, rotationY: 0.6 },
  { x: 13.2, z: 11.4, surfaceTopY: -0.14, scale: 0.92, rotationY: 1.9 },
  { x: -16.2, z: -15.6, surfaceTopY: -0.16, scale: 1.1, rotationY: 0.5 },
  { x: 16.2, z: -15.6, surfaceTopY: -0.16, scale: 1.08, rotationY: 1.4 },
  { x: -16.5, z: 15.4, surfaceTopY: -0.16, scale: 1.12, rotationY: 2.2 },
  { x: 16.5, z: 15.4, surfaceTopY: -0.16, scale: 1.06, rotationY: 3.0 },
  { x: -16.9, z: -16.1, surfaceTopY: -0.16, scale: 0.92, rotationY: 1.1 },
  { x: 16.9, z: -16.1, surfaceTopY: -0.16, scale: 0.94, rotationY: 2.0 },
  { x: -17.1, z: 15.9, surfaceTopY: -0.16, scale: 0.95, rotationY: 2.8 },
  { x: 17.1, z: 15.9, surfaceTopY: -0.16, scale: 0.9, rotationY: 0.3 },
];

export function resolveDesktopQualityTier(
  lodLevel?: LODLevel,
  deviceMemoryGb?: number,
  isMobile?: boolean
): DesktopQualityTierSpec {
  if (isMobile === true) {
    return {
      tier: 'MOBILE_TBDR',
      usePhysicalClearcoat: false,
      castSanctuaryShadows: false,
      palmInstanceCount: 12,
      deckRoughness: 0.45,
    };
  }
  const navMem =
    typeof navigator !== 'undefined' && 'deviceMemory' in navigator
      ? Number(Reflect.get(navigator, 'deviceMemory'))
      : 8;
  const rawMemory = deviceMemoryGb ?? (Number.isFinite(navMem) && navMem > 0 ? navMem : 8);
  if ((lodLevel ?? LODLevel.HIGH) !== LODLevel.HIGH || !Number.isFinite(rawMemory) || rawMemory < 8) {
    return {
      tier: 'DESKTOP_BALANCED',
      usePhysicalClearcoat: false,
      castSanctuaryShadows: false,
      palmInstanceCount: 16,
      deckRoughness: 0.35,
    };
  }
  return {
    tier: 'DESKTOP_ULTRA',
    usePhysicalClearcoat: true,
    castSanctuaryShadows: true,
    palmInstanceCount: 20,
    deckRoughness: 0.25,
  };
}

export function getCornerSanctuaryDescriptors(): ReadonlyArray<CornerSanctuaryDescriptor> {
  return CORNER_SANCTUARY_DESCRIPTORS;
}

export function getBayArchipelagoDescriptors(palmCount = 20): {
  readonly islets: ReadonlyArray<BayIsletDescriptor>;
  readonly palms: ReadonlyArray<SanctuaryPalmTransform>;
} {
  const clampedCount = Math.max(1, Math.min(SANCTUARY_PALM_ANCHORS.length, palmCount));
  const palms: SanctuaryPalmTransform[] = SANCTUARY_PALM_ANCHORS.slice(0, clampedCount).map((anchor) => {
    const trunkBottomY = Number((anchor.surfaceTopY - 0.02).toFixed(4));
    return {
      position: [anchor.x, Number((trunkBottomY + 0.35 * anchor.scale).toFixed(4)), anchor.z],
      surfaceTopY: anchor.surfaceTopY,
      trunkBottomY,
      scale: anchor.scale,
      rotationY: anchor.rotationY,
    };
  });
  return { islets: BAY_ISLET_DESCRIPTORS, palms };
}

function translateAndReturn(geom: BufferGeometry, x: number, y: number, z: number): BufferGeometry {
  geom.applyMatrix4(new Matrix4().makeTranslation(x, y, z));
  return geom;
}

function mergeAndDisposeParts(parts: BufferGeometry[]): BufferGeometry {
  const merged = mergeGeometries(parts, false);
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  parts.forEach((g) => g.dispose());
  return merged;
}

export function createBatchedSanctuaryGeometries(
  palmCount = 20,
  corners: ReadonlyArray<CornerSanctuaryDescriptor> = getCornerSanctuaryDescriptors(),
  archipelago = getBayArchipelagoDescriptors(palmCount)
): BatchedSanctuaryGeometries {
  const sandParts = corners.map((c) =>
    translateAndReturn(
      new CylinderGeometry(2.6, 3.2, c.baseTopY - c.baseBottomY, 16),
      c.position[0],
      (c.baseBottomY + c.baseTopY) / 2,
      c.position[2]
    )
  );
  const deckParts = corners.map((c) =>
    translateAndReturn(
      new BoxGeometry(3.2, c.deckTopY - c.deckBottomY, 3.2),
      c.position[0],
      (c.deckBottomY + c.deckTopY) / 2,
      c.position[2]
    )
  );
  const rimParts = corners.map((c) =>
    translateAndReturn(
      new BoxGeometry(3.36, c.rimTopY - c.rimBottomY, 3.36),
      c.position[0],
      (c.rimBottomY + c.rimTopY) / 2,
      c.position[2]
    )
  );
  const isletAndCrownParts: BufferGeometry[] = [
    ...archipelago.islets.map((isl) =>
      translateAndReturn(
        new CylinderGeometry(isl.scale[0] * 0.45, isl.scale[0] * 0.55, isl.topElevation - isl.bottomElevation, 12),
        isl.position[0],
        (isl.bottomElevation + isl.topElevation) / 2,
        isl.position[2]
      )
    ),
    ...archipelago.palms.map((p) =>
      translateAndReturn(
        new ConeGeometry(0.45 * p.scale, 0.28 * p.scale, 6),
        p.position[0],
        p.trunkBottomY + 0.72 * p.scale,
        p.position[2]
      )
    ),
  ];
  const trunkParts = archipelago.palms.map((p) =>
    translateAndReturn(
      new CylinderGeometry(0.04 * p.scale, 0.07 * p.scale, 0.7 * p.scale, 6),
      p.position[0],
      p.trunkBottomY + 0.35 * p.scale,
      p.position[2]
    )
  );

  return {
    sandBasesGeom: mergeAndDisposeParts(sandParts),
    walnutDecksGeom: mergeAndDisposeParts(deckParts),
    brassRimsGeom: mergeAndDisposeParts(rimParts),
    isletsAndCrownsGeom: mergeAndDisposeParts(isletAndCrownParts),
    palmTrunksGeom: mergeAndDisposeParts(trunkParts),
  };
}
