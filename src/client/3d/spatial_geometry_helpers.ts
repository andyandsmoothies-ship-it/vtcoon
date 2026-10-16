// [UI-S01/MSS][IMP-407] 3D Spatial Geometry SSOT & Overview Frustum Projection Helpers
import { PerspectiveCamera, Vector3 } from 'three';
import { CAMERA_CONFIG } from './camera_state_machine';

export interface Box2D {
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
  readonly width: number;
  readonly depth: number;
}

export interface TransformedAABBSpec {
  readonly center: readonly [number, number, number] | readonly [number, number];
  readonly baseSize: { readonly width: number; readonly depth: number };
  readonly scale?: readonly [number, number, number] | readonly [number, number];
  readonly rotationY?: number;
}

export function computeTransformedAABB2D(spec: TransformedAABBSpec): Box2D {
  const cx = spec.center[0];
  const cz = spec.center.length === 3 ? spec.center[2] : spec.center[1];
  const sx = Math.abs(spec.scale ? spec.scale[0] : 1);
  const sz = Math.abs(spec.scale ? (spec.scale.length === 3 ? spec.scale[2] : spec.scale[1]) : 1);
  const halfW = (spec.baseSize.width * sx) * 0.5;
  const halfD = (spec.baseSize.depth * sz) * 0.5;
  const rotY = spec.rotationY ?? 0;
  const cosR = Math.abs(Math.cos(rotY));
  const sinR = Math.abs(Math.sin(rotY));
  const extX = halfW * cosR + halfD * sinR;
  const extZ = halfW * sinR + halfD * cosR;

  return {
    minX: cx - extX,
    maxX: cx + extX,
    minZ: cz - extZ,
    maxZ: cz + extZ,
    width: extX * 2,
    depth: extZ * 2,
  };
}

export function checkAABBCollision2D(boxA: Box2D, boxB: Box2D, clearanceM = 0): boolean {
  return (
    boxA.minX - clearanceM < boxB.maxX &&
    boxA.maxX + clearanceM > boxB.minX &&
    boxA.minZ - clearanceM < boxB.maxZ &&
    boxA.maxZ + clearanceM > boxB.minZ
  );
}

let cachedOverviewCamera: PerspectiveCamera | null = null;
let cachedOverviewAspect = 0;
const tempProjectVec = new Vector3();

export function projectToOverviewNdc(
  posOrX: readonly [number, number, number] | number,
  yOrAspect?: number,
  z?: number,
  aspect = 1.6
): readonly [number, number] {
  let x: number;
  let y: number;
  let zCoord: number;
  let activeAspect = 1.6;

  if (typeof posOrX === 'number') {
    x = posOrX;
    y = yOrAspect ?? 0;
    zCoord = z ?? 0;
    activeAspect = aspect;
  } else {
    [x, y, zCoord] = posOrX;
    activeAspect = typeof yOrAspect === 'number' ? yOrAspect : (typeof aspect === 'number' ? aspect : 1.6);
  }

  if (!cachedOverviewCamera) {
    cachedOverviewCamera = new PerspectiveCamera(CAMERA_CONFIG.overview.fov, activeAspect, 0.1, 200);
    cachedOverviewCamera.position.set(...CAMERA_CONFIG.overview.position);
    cachedOverviewCamera.lookAt(...CAMERA_CONFIG.overview.target);
    cachedOverviewCamera.updateMatrixWorld(true);
    cachedOverviewCamera.updateProjectionMatrix();
    cachedOverviewAspect = activeAspect;
  } else if (cachedOverviewAspect !== activeAspect) {
    cachedOverviewCamera.aspect = activeAspect;
    cachedOverviewCamera.updateProjectionMatrix();
    cachedOverviewAspect = activeAspect;
  }

  tempProjectVec.set(x, y, zCoord).project(cachedOverviewCamera);
  return [Number(tempProjectVec.x.toFixed(4)), Number(tempProjectVec.y.toFixed(4))];
}

export function isOverviewFrustumSafe(
  pos: readonly [number, number, number],
  aspect = 1.6,
  maxNdcX = 0.85,
  maxNdcY = 0.80
): boolean {
  const [ndcX, ndcY] = projectToOverviewNdc(pos, aspect);
  return Math.abs(ndcX) <= maxNdcX && Math.abs(ndcY) <= maxNdcY;
}

export type SpatialQuadrant = 'NW' | 'NE' | 'SW' | 'SE';

export function getSpatialQuadrant(x: number, z: number): SpatialQuadrant {
  const normX = Object.is(x, -0) ? 0 : x;
  const normZ = Object.is(z, -0) ? 0 : z;
  if (normX < 0) {
    return normZ < 0 ? 'NW' : 'SW';
  }
  return normZ < 0 ? 'NE' : 'SE';
}

export function computeQuadrantCounts(
  positions: ReadonlyArray<readonly [number, number, number] | readonly [number, number]>
): Record<SpatialQuadrant, number> {
  const counts: Record<SpatialQuadrant, number> = { NW: 0, NE: 0, SW: 0, SE: 0 };
  for (const pos of positions) {
    if (!pos || pos.length < 2) continue;
    const x = pos[0];
    const z = pos.length === 3 ? pos[2] : pos[1];
    if (typeof x !== 'number' || typeof z !== 'number' || x !== x || z !== z || x === Infinity || x === -Infinity || z === Infinity || z === -Infinity) {
      continue;
    }
    counts[getSpatialQuadrant(x, z)]++;
  }
  return counts;
}

export function validateSectorBalance(
  quadrantCounts: Record<'NW' | 'NE' | 'SW' | 'SE', number>
): boolean {
  if (!quadrantCounts || typeof quadrantCounts !== 'object') {
    return false;
  }
  const nw = quadrantCounts.NW;
  const ne = quadrantCounts.NE;
  const sw = quadrantCounts.SW;
  const se = quadrantCounts.SE;
  const vals = [nw, ne, sw, se];
  for (const v of vals) {
    if (typeof v !== 'number' || v !== v || v === Infinity || v === -Infinity || v < 0 || Math.floor(v) !== v) {
      return false;
    }
  }
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  return max - min <= 2;
}

