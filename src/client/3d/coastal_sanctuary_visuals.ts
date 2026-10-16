// [UI-S01/MSS][IMP-399] CoastalSanctuaryVisuals — Pure View-Model, 4-Quadrant Frustum NDC & Blender 5.2 Displaced Geometry Builder
import { BoxGeometry, type BufferGeometry, CylinderGeometry, LatheGeometry, Matrix4, PerspectiveCamera, Vector2, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CAMERA_CONFIG } from './camera_state_machine';
import {
  BLENDER_KARST_SHRUB,
  BLENDER_KARST_SPIRE_A,
  BLENDER_KARST_SPIRE_B,
  BLENDER_RINGED_PALM_TRUNK,
  BLENDER_VFOLD_PALM_FROND,
  createBlenderArchetypeGeometry,
} from './coastal_sanctuary_blender_meshes';
import { LODLevel } from './perf_budget';

export interface DesktopQualityTierSpec {
  readonly tier: 'MOBILE_BYPASS' | 'DESKTOP_BALANCED' | 'DESKTOP_ULTRA';
  readonly deckMetalness: number;
  readonly deckRoughness: number;
  readonly castSanctuaryShadows: boolean;
  readonly palmInstanceCount: number;
}

export interface CornerSanctuaryDescriptor {
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly ndcX: number;
  readonly ndcY: number;
  readonly lagoonRadius: number;
  readonly baseRadius: number;
  readonly lagoonWidth: number;
  readonly baseWidth: number;
  readonly rimWidth: number;
  readonly deckWidth: number;
  readonly pedestalWidth: number;
  readonly baseBottomY: number;
  readonly baseTopY: number;
  readonly rimBottomY: number;
  readonly rimTopY: number;
  readonly deckBottomY: number;
  readonly deckTopY: number;
  readonly pedestalBottomY: number;
  readonly pedestalTopY: number;
  readonly modelUrl: string;
  readonly modelPosition: readonly [number, number, number];
  readonly modelScale: readonly [number, number, number];
  readonly modelRotationY: number;
}

export interface BayIsletDescriptor {
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly ndcX: number;
  readonly ndcY: number;
  readonly lagoonRadius: number;
  readonly scale: readonly [number, number, number];
  readonly bottomElevation: number;
  readonly rockTopElevation: number;
  readonly topElevation: number;
}

export interface SanctuaryPalmTransform {
  readonly position: readonly [number, number, number];
  readonly surfaceTopY: number;
  readonly trunkBottomY: number;
  readonly scale: number;
  readonly tiltX: number;
  readonly tiltZ: number;
  readonly rotationY: number;
}

export interface BatchedSanctuaryGeometries {
  readonly lagoonRingsGeom: BufferGeometry;
  readonly sandBasesGeom: BufferGeometry;
  readonly limestoneCliffsGeom: BufferGeometry;
  readonly brassRimsGeom: BufferGeometry;
  readonly walnutDecksGeom: BufferGeometry;
  readonly marblePedestalsGeom: BufferGeometry;
  readonly palmTrunksGeom: BufferGeometry;
  readonly foliageCanopyGeom: BufferGeometry;
}

const OVERVIEW_ASPECT = 1.6;
const geometryCache = new Map<number, BatchedSanctuaryGeometries>();
let cachedOverviewCamera: PerspectiveCamera | null = null;

function getOverviewCamera(): PerspectiveCamera {
  if (!cachedOverviewCamera) {
    cachedOverviewCamera = new PerspectiveCamera(CAMERA_CONFIG.overview.fov, OVERVIEW_ASPECT, 0.1, 200);
    cachedOverviewCamera.position.set(
      CAMERA_CONFIG.overview.position[0],
      CAMERA_CONFIG.overview.position[1],
      CAMERA_CONFIG.overview.position[2]
    );
    cachedOverviewCamera.lookAt(
      CAMERA_CONFIG.overview.target[0],
      CAMERA_CONFIG.overview.target[1],
      CAMERA_CONFIG.overview.target[2]
    );
    cachedOverviewCamera.updateMatrixWorld(true);
    cachedOverviewCamera.updateProjectionMatrix();
  }
  return cachedOverviewCamera;
}

function projectToOverviewNdc(pos: readonly [number, number, number]): readonly [number, number] {
  const cam = getOverviewCamera();
  const projected = new Vector3(pos[0], pos[1], pos[2]).project(cam);
  return [Number(projected.x.toFixed(4)), Number(projected.y.toFixed(4))];
}

export function resolveDesktopQualityTier(
  lodLevel: LODLevel = LODLevel.HIGH,
  deviceMemoryGb?: number,
  isMobile: boolean = false
): DesktopQualityTierSpec {
  if (isMobile) {
    return { tier: 'MOBILE_BYPASS', deckMetalness: 0, deckRoughness: 1, castSanctuaryShadows: false, palmInstanceCount: 0 };
  }
  const navMem =
    typeof navigator !== 'undefined' && 'deviceMemory' in navigator
      ? Number((navigator as { deviceMemory?: unknown }).deviceMemory)
      : 8;
  const effectiveRam = deviceMemoryGb === undefined ? (Number.isFinite(navMem) && navMem > 0 ? navMem : 8) : deviceMemoryGb;
  const isUltra = lodLevel === LODLevel.HIGH && effectiveRam >= 8;
  if (isUltra) {
    return { tier: 'DESKTOP_ULTRA', deckMetalness: 0.12, deckRoughness: 0.22, castSanctuaryShadows: true, palmInstanceCount: 20 };
  }
  return { tier: 'DESKTOP_BALANCED', deckMetalness: 0.05, deckRoughness: 0.35, castSanctuaryShadows: false, palmInstanceCount: 16 };
}

// Balanced 4-Quadrant Coastal Distribution around the +-10.15m Diamond Board:
// - Upper-Left (West Flank): Horse [-12.4, 1.6] & Citadel Tower [-12.3, 6.2]
// - Upper-Right (North Flank): Superyacht [-0.5, -12.0]
// - Lower-Left (South-West Flank): Vintage Roadster [-1.2, 12.6]
const SANCTUARY_SPECS: ReadonlyArray<{
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly modelUrl: string;
  readonly modelScale: readonly [number, number, number];
  readonly modelRotationY: number;
}> = [
  { id: 'sanctuary-west-north', position: [-12.4, -0.28, 1.6], modelUrl: '/models/pawns/pawn_horse.glb', modelScale: [1.75, 1.75, 1.75], modelRotationY: 0.65 },
  { id: 'sanctuary-west-south', position: [-12.3, -0.28, 6.2], modelUrl: '/models/pawns/pawn_tower.glb', modelScale: [1.55, 1.55, 1.55], modelRotationY: 0.55 },
  { id: 'sanctuary-north-east', position: [-0.5, -0.28, -12.0], modelUrl: '/models/pawns/pawn_yacht.glb', modelScale: [1.5, 1.5, 1.5], modelRotationY: 0.72 },
  { id: 'sanctuary-southwest', position: [-1.2, -0.28, 12.6], modelUrl: '/models/pawns/pawn_car.glb', modelScale: [1.68, 1.68, 1.68], modelRotationY: -0.82 },
];

export function getCornerSanctuaryDescriptors(): ReadonlyArray<CornerSanctuaryDescriptor> {
  return SANCTUARY_SPECS.map((spec) => {
    const [ndcX, ndcY] = projectToOverviewNdc(spec.position);
    return {
      id: spec.id,
      position: spec.position,
      ndcX,
      ndcY,
      lagoonRadius: 1.38,
      baseRadius: 1.24,
      lagoonWidth: 2.76,
      baseWidth: 2.48,
      rimWidth: 1.88,
      deckWidth: 1.72,
      pedestalWidth: 1.24,
      baseBottomY: -0.34,
      baseTopY: -0.22,
      rimBottomY: -0.24,
      rimTopY: -0.17,
      deckBottomY: -0.19,
      deckTopY: -0.11,
      pedestalBottomY: -0.13,
      pedestalTopY: 0.08,
      modelUrl: spec.modelUrl,
      modelPosition: [spec.position[0], 0.08, spec.position[2]],
      modelScale: spec.modelScale,
      modelRotationY: spec.modelRotationY,
    };
  });
}

// 4 Ha Long Bay Karst Islets distributed across all 4 ocean quadrants (Upper-Left, Upper-Right, Lower-Left, Lower-Right)
const ISLET_SPECS: ReadonlyArray<Omit<BayIsletDescriptor, 'ndcX' | 'ndcY'>> = [
  { id: 'islet-west-far', position: [-16.2, -0.28, 2.8], lagoonRadius: 0.96, scale: [1.02, 0.92, 0.98], bottomElevation: -0.34, rockTopElevation: 0.34, topElevation: 0.44 },
  { id: 'islet-northeast', position: [2.25, -0.28, -18.85], lagoonRadius: 0.92, scale: [0.94, 0.84, 0.92], bottomElevation: -0.34, rockTopElevation: 0.24, topElevation: 0.34 },
  { id: 'islet-southwest', position: [2.2, -0.28, 12.5], lagoonRadius: 0.94, scale: [0.96, 0.88, 0.94], bottomElevation: -0.34, rockTopElevation: 0.28, topElevation: 0.38 },
  { id: 'islet-southeast', position: [12.6, -0.28, 0.4], lagoonRadius: 0.9, scale: [0.92, 0.84, 0.9], bottomElevation: -0.34, rockTopElevation: 0.25, topElevation: 0.35 },
];

// Palm offsets sit on the outer ivory sand ring (radius ~1.03m > rimWidth*0.5 = 0.94m), framing the flanks while keeping the +X/+Z camera-facing deck apron open for Phase 3 wealth trays
const PALM_OFFSETS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [0.98, -0.32, 0.62, 0.13, 0.45],
  [0.28, -0.98, 0.66, 0.14, 1.35],
  [-0.32, 0.98, 0.64, 0.12, 2.25],
  [-0.98, 0.28, 0.6, 0.12, 3.15],
];

export function getBayArchipelagoDescriptors(palmCount: number = 20): {
  readonly islets: ReadonlyArray<BayIsletDescriptor>;
  readonly palms: ReadonlyArray<SanctuaryPalmTransform>;
} {
  const islets: BayIsletDescriptor[] = ISLET_SPECS.map((s) => {
    const [ndcX, ndcY] = projectToOverviewNdc(s.position);
    return { ...s, ndcX, ndcY };
  });
  const palms: SanctuaryPalmTransform[] = [];
  for (const spec of SANCTUARY_SPECS) {
    for (const [ox, oz, scale, tilt, rotY] of PALM_OFFSETS) {
      palms.push({
        position: [spec.position[0] + ox, -0.22, spec.position[2] + oz],
        surfaceTopY: -0.22,
        trunkBottomY: -0.26,
        scale,
        tiltX: tilt,
        tiltZ: tilt * 0.75,
        rotationY: rotY,
      });
    }
  }
  ISLET_SPECS.forEach((isl, i) => {
    palms.push({
      position: [isl.position[0] + 0.42 * isl.scale[0], -0.23, isl.position[2] + 0.46 * isl.scale[2]],
      surfaceTopY: -0.23,
      trunkBottomY: -0.27,
      scale: (0.64 + (i % 2) * 0.05) * isl.scale[1],
      tiltX: 0.14,
      tiltZ: 0.11,
      rotationY: 0.8 + i * 1.1,
    });
  });
  return { islets, palms: palms.slice(0, Math.max(0, palmCount)) };
}

function translateGeom(geom: BufferGeometry, x: number, y: number, z: number): BufferGeometry {
  geom.applyMatrix4(new Matrix4().makeTranslation(x, y, z));
  return geom;
}

function mergeAndDispose(parts: BufferGeometry[]): BufferGeometry {
  if (parts.length === 0) return new BoxGeometry(0.001, 0.001, 0.001);
  const merged = mergeGeometries(parts, false);
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  for (const part of parts) part.dispose();
  return merged;
}

function buildMarblePedestalLathe(c: CornerSanctuaryDescriptor): BufferGeometry {
  const h = c.pedestalTopY - c.pedestalBottomY;
  const r = c.pedestalWidth * 0.5;
  const profile = [
    new Vector2(0, 0),
    new Vector2(r, 0),
    new Vector2(r, h * 0.24),
    new Vector2(r * 0.84, h * 0.4),
    new Vector2(r * 0.74, h * 0.66),
    new Vector2(r * 0.94, h * 0.86),
    new Vector2(r * 0.92, h),
    new Vector2(0, h),
  ];
  return translateGeom(new LatheGeometry(profile, 20), c.position[0], c.pedestalBottomY, c.position[2]);
}

function appendIsletKarstPeaks(cliffOut: BufferGeometry[], canopyOut: BufferGeometry[], isl: BayIsletDescriptor): void {
  const [ix, , iz] = isl.position;
  const fullH = (isl.rockTopElevation - isl.bottomElevation) * isl.scale[1];
  const orientYaw = isl.ndcX * 0.25 + isl.ndcY * 0.15;
  const formations = [
    { arch: BLENDER_KARST_SPIRE_A, ox: -0.15 * isl.scale[0], oz: -0.13 * isl.scale[2], sx: isl.scale[0], sz: isl.scale[2], h: fullH, yaw: orientYaw, tz: 0.07, tx: -0.05 },
    { arch: BLENDER_KARST_SPIRE_B, ox: 0.18 * isl.scale[0], oz: -0.17 * isl.scale[2], sx: isl.scale[2] * 0.86, sz: isl.scale[0] * 0.86, h: fullH * 0.82, yaw: orientYaw + 1.4, tz: -0.09, tx: 0.06 },
    { arch: BLENDER_KARST_SPIRE_A, ox: -0.25 * isl.scale[0], oz: 0.14 * isl.scale[2], sx: isl.scale[0] * 0.76, sz: isl.scale[2] * 0.76, h: fullH * 0.68, yaw: orientYaw + 2.7, tz: 0.08, tx: 0.07 },
  ];
  for (const f of formations) {
    const spire = createBlenderArchetypeGeometry(f.arch);
    spire.scale(f.sx, f.h, f.sz);
    spire.rotateY(f.yaw);
    spire.rotateZ(f.tz);
    spire.rotateX(f.tx);
    cliffOut.push(translateGeom(spire, ix + f.ox, isl.bottomElevation, iz + f.oz));
  }
  const capScaleY = Math.max(0.45, ((isl.topElevation - isl.rockTopElevation) / 0.1) * isl.scale[1]);
  const crestCap = createBlenderArchetypeGeometry(BLENDER_KARST_SHRUB);
  crestCap.scale(isl.scale[0] * 0.95, capScaleY, isl.scale[2] * 0.95);
  crestCap.rotateY(orientYaw);
  canopyOut.push(translateGeom(crestCap, ix - 0.15 * isl.scale[0], isl.bottomElevation + fullH * 0.94, iz - 0.13 * isl.scale[2]));

  const saddleShrub = createBlenderArchetypeGeometry(BLENDER_KARST_SHRUB);
  saddleShrub.scale(isl.scale[2] * 0.88, capScaleY * 0.85, isl.scale[0] * 0.88);
  saddleShrub.rotateY(orientYaw + 1.2);
  canopyOut.push(translateGeom(saddleShrub, ix + 0.17 * isl.scale[0], isl.bottomElevation + fullH * 0.76, iz - 0.16 * isl.scale[2]));
}

function appendCurvedPalmAndCanopy(trunksOut: BufferGeometry[], canopiesOut: BufferGeometry[], palm: SanctuaryPalmTransform): void {
  const embedDepth = Math.max(0.02, palm.surfaceTopY - palm.trunkBottomY);
  const trunkH = 0.78 * palm.scale + embedDepth;
  const tiltPitch = -(palm.tiltX + palm.tiltZ * 0.5) * 0.42;

  const trunk = createBlenderArchetypeGeometry(BLENDER_RINGED_PALM_TRUNK);
  trunk.scale(palm.scale, trunkH, palm.scale);
  trunk.rotateZ(tiltPitch);
  trunk.rotateY(palm.rotationY);
  trunksOut.push(translateGeom(trunk, palm.position[0], palm.position[1] - embedDepth, palm.position[2]));

  const crownLocalX = 0.098 * palm.scale;
  const crownLocalY = trunkH;
  for (let f = 0; f < 6; f++) {
    const frond = createBlenderArchetypeGeometry(BLENDER_VFOLD_PALM_FROND);
    frond.scale(palm.scale, palm.scale, palm.scale);
    frond.rotateY((f * Math.PI) / 3);
    frond.translate(crownLocalX, crownLocalY, 0);
    frond.rotateZ(tiltPitch);
    frond.rotateY(palm.rotationY);
    canopiesOut.push(translateGeom(frond, palm.position[0], palm.position[1] - embedDepth, palm.position[2]));
  }
}

export function createBatchedSanctuaryGeometries(
  palmCount: number = 20,
  corners?: ReadonlyArray<CornerSanctuaryDescriptor>,
  archipelago?: { readonly islets: ReadonlyArray<BayIsletDescriptor>; readonly palms: ReadonlyArray<SanctuaryPalmTransform> }
): BatchedSanctuaryGeometries {
  const isDefaultCall = corners === undefined && archipelago === undefined;
  const cached = isDefaultCall ? geometryCache.get(palmCount) : undefined;
  if (cached) return cached;

  const activeCorners = corners ?? getCornerSanctuaryDescriptors();
  const activeArch = archipelago ?? getBayArchipelagoDescriptors(palmCount);
  const lagoonParts: BufferGeometry[] = [];
  const sandParts: BufferGeometry[] = [];
  const cliffParts: BufferGeometry[] = [];
  const rimParts: BufferGeometry[] = [];
  const deckParts: BufferGeometry[] = [];
  const pedestalParts: BufferGeometry[] = [];
  const trunkParts: BufferGeometry[] = [];
  const canopyParts: BufferGeometry[] = [];

  for (const c of activeCorners) {
    if (Math.abs(c.ndcX) > 0.99 || Math.abs(c.ndcY) > 0.99) continue;
    const [cx, , cz] = c.position;
    const lagoonR = Math.min(c.lagoonRadius, c.lagoonWidth * 0.5);
    const baseR = Math.min(c.baseRadius, c.baseWidth * 0.5);
    lagoonParts.push(translateGeom(new CylinderGeometry(lagoonR * 0.94, lagoonR, 0.04, 24), cx, -0.305, cz));
    const sandH = c.baseTopY - c.baseBottomY;
    sandParts.push(translateGeom(new CylinderGeometry(baseR * 0.92, baseR, sandH, 24), cx, c.baseBottomY + sandH * 0.5, cz));
    const rimH = c.rimTopY - c.rimBottomY;
    rimParts.push(translateGeom(new BoxGeometry(c.rimWidth, rimH, c.rimWidth), cx, c.rimBottomY + rimH * 0.5, cz));
    const deckH = c.deckTopY - c.deckBottomY;
    deckParts.push(translateGeom(new BoxGeometry(c.deckWidth, deckH, c.deckWidth), cx, c.deckBottomY + deckH * 0.5, cz));
    pedestalParts.push(buildMarblePedestalLathe(c));
    const outcrop = createBlenderArchetypeGeometry(BLENDER_KARST_SPIRE_B);
    outcrop.scale(0.58, 0.24, 0.58);
    outcrop.rotateY(c.ndcX * 0.3 + c.ndcY * 0.2);
    cliffParts.push(translateGeom(outcrop, cx - 0.68, c.baseTopY - 0.02, cz - 0.82));
  }

  for (const isl of activeArch.islets) {
    if (Math.abs(isl.ndcX) > 0.99 || Math.abs(isl.ndcY) > 0.99) continue;
    const [ix, , iz] = isl.position;
    lagoonParts.push(translateGeom(new CylinderGeometry(isl.lagoonRadius * 0.92, isl.lagoonRadius, 0.04, 20), ix, -0.305, iz));
    sandParts.push(translateGeom(new CylinderGeometry(isl.lagoonRadius * 0.72, isl.lagoonRadius * 0.86, 0.13, 18), ix, -0.275, iz));
    appendIsletKarstPeaks(cliffParts, canopyParts, isl);
  }

  for (const palm of activeArch.palms) {
    appendCurvedPalmAndCanopy(trunkParts, canopyParts, palm);
  }

  const batch: BatchedSanctuaryGeometries = {
    lagoonRingsGeom: mergeAndDispose(lagoonParts),
    sandBasesGeom: mergeAndDispose(sandParts),
    limestoneCliffsGeom: mergeAndDispose(cliffParts),
    brassRimsGeom: mergeAndDispose(rimParts),
    walnutDecksGeom: mergeAndDispose(deckParts),
    marblePedestalsGeom: mergeAndDispose(pedestalParts),
    palmTrunksGeom: mergeAndDispose(trunkParts),
    foliageCanopyGeom: mergeAndDispose(canopyParts),
  };

  if (isDefaultCall) geometryCache.set(palmCount, batch);
  return batch;
}

export function disposeBatchedSanctuaryGeometries(): void {
  for (const batch of geometryCache.values()) {
    batch.lagoonRingsGeom.dispose();
    batch.sandBasesGeom.dispose();
    batch.limestoneCliffsGeom.dispose();
    batch.brassRimsGeom.dispose();
    batch.walnutDecksGeom.dispose();
    batch.marblePedestalsGeom.dispose();
    batch.palmTrunksGeom.dispose();
    batch.foliageCanopyGeom.dispose();
  }
  geometryCache.clear();
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => disposeBatchedSanctuaryGeometries());
}
