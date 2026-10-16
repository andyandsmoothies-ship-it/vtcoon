// [UI-S02/MSS][IMP-405] Diorama Static Blender Batches, Saigon Cathedral Realism & Mobile Draw-Call Diet
import { BufferAttribute, BufferGeometry } from 'three';

export interface UrbanTreeConfig {
  readonly x: number;
  readonly z: number;
  readonly color: string;
  readonly height: number;
  readonly radius: number;
}
export interface BatchedBoardRimGeometries {
  readonly walnutRimGeom: BufferGeometry;
  readonly brassTrimGeom: BufferGeometry;
}
export interface BatchedMobileContainerPortGeometries {
  readonly portStructuresVertexAoGeom: BufferGeometry;
  readonly gantryCranesVertexAoGeom: BufferGeometry;
}
export interface BatchedMobileHeritageGeometries {
  readonly cathedralBodyVertexAoGeom: BufferGeometry;
  readonly cathedralAccentsGeom: BufferGeometry;
  readonly parisStatueAndPedestalGeom: BufferGeometry;
  readonly parisStreetlampsGeom: BufferGeometry;
}
interface TectonicFrustumSpec {
  readonly center: readonly [number, number, number];
  readonly sizeBottom: readonly [number, number, number];
  readonly sizeTop?: readonly [number, number];
  readonly color: string;
  readonly aoBottom: number;
  readonly aoTop: number;
  readonly openBottom?: boolean;
}
interface RecessedCavitySpec {
  readonly openingCenter: readonly [number, number, number];
  readonly cavitySize: readonly [number, number, number];
  readonly color: string;
  readonly revealColor: string;
  readonly aoCavity: number;
}

export const URBAN_TREES: ReadonlyArray<UrbanTreeConfig> = [
  { x: -1.35, z: -3.8, color: '#15803D', height: 0.28, radius: 0.14 }, { x: -1.35, z: -2.3, color: '#22C55E', height: 0.32, radius: 0.16 },
  { x: -1.35, z: -0.8, color: '#F59E0B', height: 0.26, radius: 0.13 }, { x: -1.35, z: 0.8, color: '#10B981', height: 0.30, radius: 0.15 },
  { x: -1.35, z: 2.3, color: '#15803D', height: 0.34, radius: 0.17 }, { x: -1.35, z: 3.8, color: '#22C55E', height: 0.29, radius: 0.14 },
  { x: 1.35, z: -3.8, color: '#22C55E', height: 0.30, radius: 0.15 }, { x: 1.35, z: -2.3, color: '#10B981', height: 0.33, radius: 0.16 },
  { x: 1.35, z: -0.8, color: '#15803D', height: 0.27, radius: 0.14 }, { x: 1.35, z: 0.8, color: '#F59E0B', height: 0.31, radius: 0.15 },
  { x: 1.35, z: 2.3, color: '#22C55E', height: 0.28, radius: 0.14 }, { x: 1.35, z: 3.8, color: '#15803D', height: 0.35, radius: 0.17 },
  { x: -5.15, z: 2.2, color: '#15803D', height: 0.28, radius: 0.14 }, { x: -3.55, z: 2.8, color: '#F59E0B', height: 0.26, radius: 0.13 },
  { x: -5.15, z: 4.2, color: '#22C55E', height: 0.32, radius: 0.16 }, { x: -3.55, z: 5.0, color: '#10B981', height: 0.30, radius: 0.15 },
  { x: 3.6, z: 3.2, color: '#F59E0B', height: 0.29, radius: 0.15 }, { x: 3.6, z: 4.4, color: '#15803D', height: 0.33, radius: 0.16 },
];

const PORT_CONTAINERS: ReadonlyArray<{ readonly pos: readonly [number, number, number]; readonly color: string }> = [
  { pos: [-0.4, 0.16, -0.4], color: '#0284C7' }, { pos: [-0.4, 0.16, 0.35], color: '#991B1B' },
  { pos: [-0.05, 0.16, -0.2], color: '#15803D' }, { pos: [-0.05, 0.16, 0.5], color: '#C2410C' },
  { pos: [0.3, 0.16, -0.4], color: '#D97706' }, { pos: [0.3, 0.16, 0.35], color: '#334155' },
  { pos: [-0.4, 0.30, -0.1], color: '#15803D' }, { pos: [-0.05, 0.30, 0.2], color: '#0284C7' },
  { pos: [0.3, 0.30, -0.2], color: '#991B1B' }, { pos: [-0.22, 0.44, 0.05], color: '#D97706' },
];

function parseHexRgb(hex: string): readonly [number, number, number] {
  const clean = hex.replace('#', '');
  return [parseInt(clean.slice(0, 2), 16) / 255, parseInt(clean.slice(2, 4), 16) / 255, parseInt(clean.slice(4, 6), 16) / 255];
}
function clamp01(val: number): number {
  return Math.max(0, Math.min(1, val));
}

function appendQuad(
  positions: number[], normals: number[], colors: number[], indices: number[],
  verts: readonly (readonly [number, number, number])[], normal: readonly [number, number, number],
  rgb: readonly [number, number, number], shades: readonly [number, number, number, number]
): void {
  const baseIdx = positions.length / 3;
  for (let i = 0; i < 4; i++) {
    const v = verts[i]!, s = shades[i]!;
    positions.push(v[0], v[1], v[2]);
    normals.push(normal[0], normal[1], normal[2]);
    colors.push(clamp01(rgb[0] * s), clamp01(rgb[1] * s), clamp01(rgb[2] * s));
  }
  indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
}

function appendFrustum(positions: number[], normals: number[], colors: number[], indices: number[], spec: TectonicFrustumSpec): void {
  const [cx, cy, cz] = spec.center, [wxB, hy, wzB] = spec.sizeBottom, [wxT, wzT] = spec.sizeTop ?? [wxB, wzB];
  const rgb = parseHexRgb(spec.color), bAo = spec.aoBottom, tAo = spec.aoTop, y0 = cy - hy * 0.5, y1 = cy + hy * 0.5;
  const xb0 = cx - wxB * 0.5, xb1 = cx + wxB * 0.5, zb0 = cz - wzB * 0.5, zb1 = cz + wzB * 0.5;
  const xt0 = cx - wxT * 0.5, xt1 = cx + wxT * 0.5, zt0 = cz - wzT * 0.5, zt1 = cz + wzT * 0.5;
  appendQuad(positions, normals, colors, indices, [[xb0, y0, zb1], [xb1, y0, zb1], [xt1, y1, zt1], [xt0, y1, zt1]], [0, 0, 1], rgb, [bAo, bAo, tAo, tAo]);
  appendQuad(positions, normals, colors, indices, [[xb1, y0, zb0], [xb0, y0, zb0], [xt0, y1, zt0], [xt1, y1, zt0]], [0, 0, -1], rgb, [bAo * 0.92, bAo * 0.92, tAo * 0.95, tAo * 0.95]);
  appendQuad(positions, normals, colors, indices, [[xb1, y0, zb1], [xb1, y0, zb0], [xt1, y1, zt0], [xt1, y1, zt1]], [1, 0, 0], rgb, [bAo * 0.95, bAo * 0.95, tAo * 0.98, tAo * 0.98]);
  appendQuad(positions, normals, colors, indices, [[xb0, y0, zb0], [xb0, y0, zb1], [xt0, y1, zt1], [xt0, y1, zt0]], [-1, 0, 0], rgb, [bAo * 0.9, bAo * 0.9, tAo * 0.94, tAo * 0.94]);
  appendQuad(positions, normals, colors, indices, [[xt0, y1, zt1], [xt1, y1, zt1], [xt1, y1, zt0], [xt0, y1, zt0]], [0, 1, 0], rgb, [tAo * 1.06, tAo * 1.06, tAo * 1.06, tAo * 1.06]);
  if (!spec.openBottom) {
    appendQuad(positions, normals, colors, indices, [[xb0, y0, zb0], [xb1, y0, zb0], [xb1, y0, zb1], [xb0, y0, zb1]], [0, -1, 0], rgb, [bAo * 0.65, bAo * 0.65, bAo * 0.65, bAo * 0.65]);
  }
}

function appendRecessedCavity(positions: number[], normals: number[], colors: number[], indices: number[], spec: RecessedCavitySpec): void {
  const [cx, cy, wallZ] = spec.openingCenter, [width, height, depth] = spec.cavitySize;
  const backRgb = parseHexRgb(spec.color), revealRgb = parseHexRgb(spec.revealColor), ao = spec.aoCavity;
  const x0 = cx - width * 0.5, x1 = cx + width * 0.5, y0 = cy - height * 0.5, y1 = cy + height * 0.5, zf = wallZ, zb = wallZ + depth;
  appendQuad(positions, normals, colors, indices, [[x1, y0, zb], [x0, y0, zb], [x0, y1, zb], [x1, y1, zb]], [0, 0, -1], backRgb, [ao * 0.95, ao * 0.95, ao * 0.78, ao * 0.78]);
  appendQuad(positions, normals, colors, indices, [[x1, y1, zb], [x0, y1, zb], [x0, y1, zf], [x1, y1, zf]], [0, -1, 0], revealRgb, [ao * 0.65, ao * 0.65, ao * 0.82, ao * 0.82]);
  appendQuad(positions, normals, colors, indices, [[x1, y0, zf], [x0, y0, zf], [x0, y0, zb], [x1, y0, zb]], [0, 1, 0], revealRgb, [0.68, 0.68, 0.48, 0.48]);
  appendQuad(positions, normals, colors, indices, [[x0, y0, zb], [x0, y0, zf], [x0, y1, zf], [x0, y1, zb]], [1, 0, 0], revealRgb, [0.34, 0.52, 0.48, 0.30]);
  appendQuad(positions, normals, colors, indices, [[x1, y0, zf], [x1, y0, zb], [x1, y1, zb], [x1, y1, zf]], [-1, 0, 0], revealRgb, [0.52, 0.34, 0.30, 0.48]);
}

function buildGeomFromSpecs(frustums: readonly TectonicFrustumSpec[], cavities: readonly RecessedCavitySpec[], withColor = true): BufferGeometry {
  const positions: number[] = [], normals: number[] = [], colors: number[] = [], indices: number[] = [];
  for (const f of frustums) appendFrustum(positions, normals, colors, indices, f);
  for (const c of cavities) appendRecessedCavity(positions, normals, colors, indices, c);
  const geom = new BufferGeometry();
  geom.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  geom.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3));
  if (withColor) geom.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3));
  geom.setIndex(new BufferAttribute(new Uint16Array(indices), 1));
  geom.computeBoundingBox();
  return geom;
}

let cachedBoardRimGeoms: BatchedBoardRimGeometries | null = null;
let cachedPortGeoms: BatchedMobileContainerPortGeometries | null = null;
let cachedHeritageGeoms: BatchedMobileHeritageGeometries | null = null;

export function getBatchedBoardRimGeometries(): BatchedBoardRimGeometries {
  if (cachedBoardRimGeoms) return cachedBoardRimGeoms;
  const walnutRimGeom = buildGeomFromSpecs([
    { center: [0, 0, -8.9], sizeBottom: [17.2, 0.06, 0.6], color: '#78350F', aoBottom: 0.75, aoTop: 1.0 },
    { center: [0, 0, 8.9], sizeBottom: [17.2, 0.06, 0.6], color: '#78350F', aoBottom: 0.75, aoTop: 1.0 },
    { center: [-8.9, 0, 0], sizeBottom: [0.6, 0.06, 18.4], color: '#78350F', aoBottom: 0.75, aoTop: 1.0 },
    { center: [8.9, 0, 0], sizeBottom: [0.6, 0.06, 18.4], color: '#78350F', aoBottom: 0.75, aoTop: 1.0 },
  ], [], false);
  const brassTrimGeom = buildGeomFromSpecs([
    { center: [0, 0.032, -9.145], sizeBottom: [18.44, 0.01, 0.15], color: '#D97706', aoBottom: 0.85, aoTop: 1.05 },
    { center: [0, 0.032, 9.145], sizeBottom: [18.44, 0.01, 0.15], color: '#D97706', aoBottom: 0.85, aoTop: 1.05 },
    { center: [-9.145, 0.032, 0], sizeBottom: [0.15, 0.01, 18.14], color: '#D97706', aoBottom: 0.85, aoTop: 1.05 },
    { center: [9.145, 0.032, 0], sizeBottom: [0.15, 0.01, 18.14], color: '#D97706', aoBottom: 0.85, aoTop: 1.05 },
  ], [], false);
  cachedBoardRimGeoms = { walnutRimGeom, brassTrimGeom };
  return cachedBoardRimGeoms;
}

export function getBatchedMobileContainerPortGeometries(): BatchedMobileContainerPortGeometries {
  if (cachedPortGeoms) return cachedPortGeoms;
  const portFrustums: TectonicFrustumSpec[] = [
    { center: [0, 0.04, 0], sizeBottom: [1.8, 0.08, 2.2], color: '#475569', aoBottom: 0.45, aoTop: 0.92 },
    { center: [0.65, 0.17, -0.81], sizeBottom: [0.12, 0.12, 0.14], color: '#F8FAFC', aoBottom: 0.88, aoTop: 1.12, openBottom: true },
    { center: [0.65, 0.15, -0.55], sizeBottom: [0.12, 0.04, 0.36], color: '#1E293B', aoBottom: 0.55, aoTop: 0.85, openBottom: true },
    { center: [0.65, 0.23, -0.55], sizeBottom: [0.14, 0.12, 0.34], color: '#991B1B', aoBottom: 0.72, aoTop: 1.04, openBottom: true },
  ];
  const portCavities: RecessedCavitySpec[] = [];
  for (const cb of PORT_CONTAINERS) {
    portFrustums.push({ center: cb.pos, sizeBottom: [0.3, 0.14, 0.65], color: cb.color, aoBottom: 0.68, aoTop: 1.04, openBottom: true });
    portFrustums.push({ center: [cb.pos[0], cb.pos[1] + 0.072, cb.pos[2]], sizeBottom: [0.28, 0.006, 0.61], color: '#1E293B', aoBottom: 0.72, aoTop: 0.94, openBottom: true });
    portCavities.push({ openingCenter: [cb.pos[0], cb.pos[1], cb.pos[2] - 0.325], cavitySize: [0.18, 0.09, 0.032], color: '#0F172A', revealColor: cb.color, aoCavity: 0.24 });
  }
  const craneFrustums: TectonicFrustumSpec[] = [], craneCavities: RecessedCavitySpec[] = [];
  for (const [cz, col] of [[-0.6, '#EA580C'], [0.6, '#F59E0B']] as const) {
    craneFrustums.push(
      { center: [-0.8, 0.53, cz - 0.3], sizeBottom: [0.08, 0.9, 0.08], color: col, aoBottom: 0.52, aoTop: 1.02, openBottom: true },
      { center: [-0.8, 0.53, cz + 0.3], sizeBottom: [0.08, 0.9, 0.08], color: col, aoBottom: 0.52, aoTop: 1.02, openBottom: true },
      { center: [-1.0, 1.00, cz], sizeBottom: [0.85, 0.09, 0.7], color: col, aoBottom: 0.76, aoTop: 1.08, openBottom: true },
      { center: [-0.75, 0.90, cz - 0.2], sizeBottom: [0.12, 0.10, 0.14], color: '#F8FAFC', aoBottom: 0.92, aoTop: 1.14, openBottom: true },
      { center: [-1.15, 0.73, cz], sizeBottom: [0.22, 0.06, 0.38], color: '#FACC15', aoBottom: 0.75, aoTop: 1.06, openBottom: true }
    );
    craneCavities.push({ openingCenter: [-1.15, 0.73, cz - 0.19], cavitySize: [0.14, 0.04, 0.035], color: '#0F172A', revealColor: '#334155', aoCavity: 0.22 });
  }
  cachedPortGeoms = {
    portStructuresVertexAoGeom: buildGeomFromSpecs(portFrustums, portCavities, true),
    gantryCranesVertexAoGeom: buildGeomFromSpecs(craneFrustums, craneCavities, true),
  };
  return cachedPortGeoms;
}

export function getBatchedMobileHeritageGeometries(): BatchedMobileHeritageGeometries {
  if (cachedHeritageGeoms) return cachedHeritageGeoms;
  const bodyFrustums: TectonicFrustumSpec[] = [
    { center: [0, 0.025, 0], sizeBottom: [0.68, 0.05, 0.76], sizeTop: [0.66, 0.74], color: '#CBD5E1', aoBottom: 0.48, aoTop: 0.92 },
    { center: [0, 0.25, 0.04], sizeBottom: [0.38, 0.40, 0.56], color: '#B45309', aoBottom: 0.68, aoTop: 1.04, openBottom: true },
    { center: [0, 0.24, 0.12], sizeBottom: [0.64, 0.36, 0.20], color: '#B45309', aoBottom: 0.66, aoTop: 1.02, openBottom: true },
    { center: [0, 0.52, 0.04], sizeBottom: [0.38, 0.14, 0.56], sizeTop: [0.04, 0.52], color: '#78350F', aoBottom: 0.76, aoTop: 1.06, openBottom: true },
    { center: [0, 0.21, 0.28], sizeBottom: [0.28, 0.32, 0.18], sizeTop: [0.22, 0.14], color: '#B45309', aoBottom: 0.66, aoTop: 1.02, openBottom: true },
    { center: [-0.21, 0.46, -0.25], sizeBottom: [0.20, 0.82, 0.20], sizeTop: [0.176, 0.176], color: '#B45309', aoBottom: 0.66, aoTop: 1.06, openBottom: true },
    { center: [0.21, 0.46, -0.25], sizeBottom: [0.20, 0.82, 0.20], sizeTop: [0.176, 0.176], color: '#B45309', aoBottom: 0.66, aoTop: 1.06, openBottom: true },
    { center: [-0.21, 0.87, -0.25], sizeBottom: [0.21, 0.02, 0.21], color: '#F8FAFC', aoBottom: 0.92, aoTop: 1.14, openBottom: true },
    { center: [0.21, 0.87, -0.25], sizeBottom: [0.21, 0.02, 0.21], color: '#F8FAFC', aoBottom: 0.92, aoTop: 1.14, openBottom: true },
    { center: [-0.21, 1.15, -0.25], sizeBottom: [0.15, 0.54, 0.15], sizeTop: [0.014, 0.014], color: '#334155', aoBottom: 0.74, aoTop: 1.08, openBottom: true },
    { center: [0.21, 1.15, -0.25], sizeBottom: [0.15, 0.54, 0.15], sizeTop: [0.014, 0.014], color: '#334155', aoBottom: 0.74, aoTop: 1.08, openBottom: true },
  ];
  const bodyCavities: RecessedCavitySpec[] = [
    { openingCenter: [0, 0.145, -0.31], cavitySize: [0.095, 0.15, 0.036], color: '#451A03', revealColor: '#F8FAFC', aoCavity: 0.22 },
    { openingCenter: [-0.21, 0.135, -0.35], cavitySize: [0.068, 0.13, 0.032], color: '#451A03', revealColor: '#F8FAFC', aoCavity: 0.24 },
    { openingCenter: [0.21, 0.135, -0.35], cavitySize: [0.068, 0.13, 0.032], color: '#451A03', revealColor: '#F8FAFC', aoCavity: 0.24 },
    { openingCenter: [-0.21, 0.76, -0.35], cavitySize: [0.06, 0.14, 0.028], color: '#0F172A', revealColor: '#F8FAFC', aoCavity: 0.22 },
    { openingCenter: [0.21, 0.76, -0.35], cavitySize: [0.06, 0.14, 0.028], color: '#0F172A', revealColor: '#F8FAFC', aoCavity: 0.22 },
  ];
  const accentsGeom = buildGeomFromSpecs([
    { center: [0, 0.35, -0.25], sizeBottom: [0.14, 0.14, 0.024], color: '#0284C7', aoBottom: 0.9, aoTop: 1.1 },
    { center: [-0.21, 1.37, -0.25], sizeBottom: [0.014, 0.10, 0.014], color: '#F59E0B', aoBottom: 0.95, aoTop: 1.1 },
    { center: [-0.21, 1.39, -0.25], sizeBottom: [0.056, 0.014, 0.014], color: '#F59E0B', aoBottom: 0.95, aoTop: 1.1 },
    { center: [0.21, 1.37, -0.25], sizeBottom: [0.014, 0.10, 0.014], color: '#F59E0B', aoBottom: 0.95, aoTop: 1.1 },
    { center: [0.21, 1.39, -0.25], sizeBottom: [0.056, 0.014, 0.014], color: '#F59E0B', aoBottom: 0.95, aoTop: 1.1 },
  ], [], true);
  const statueGeom = buildGeomFromSpecs([
    { center: [0, 0.085, 0], sizeBottom: [0.10, 0.09, 0.10], color: '#CBD5E1', aoBottom: 0.75, aoTop: 1.0 },
    { center: [0, 0.18, 0], sizeBottom: [0.06, 0.11, 0.06], sizeTop: [0.04, 0.04], color: '#F8FAFC', aoBottom: 0.85, aoTop: 1.05, openBottom: true },
    { center: [0, 0.24, 0], sizeBottom: [0.044, 0.044, 0.044], color: '#F8FAFC', aoBottom: 0.95, aoTop: 1.1, openBottom: true },
  ], [], true);
  const lampSpecs: TectonicFrustumSpec[] = [];
  for (const [lx, lz] of [[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]] as const) {
    lampSpecs.push(
      { center: [lx, 0.104, lz], sizeBottom: [0.018, 0.16, 0.018], sizeTop: [0.012, 0.012], color: '#334155', aoBottom: 0.7, aoTop: 0.95, openBottom: true },
      { center: [lx, 0.194, lz], sizeBottom: [0.032, 0.032, 0.032], color: '#FDE047', aoBottom: 0.95, aoTop: 1.1, openBottom: true }
    );
  }
  cachedHeritageGeoms = {
    cathedralBodyVertexAoGeom: buildGeomFromSpecs(bodyFrustums, bodyCavities, true),
    cathedralAccentsGeom: accentsGeom,
    parisStatueAndPedestalGeom: statueGeom,
    parisStreetlampsGeom: buildGeomFromSpecs(lampSpecs, [], true),
  };
  return cachedHeritageGeoms;
}

export function disposeDioramaStaticBlenderBatches(): void {
  if (cachedBoardRimGeoms) {
    cachedBoardRimGeoms.walnutRimGeom.dispose();
    cachedBoardRimGeoms.brassTrimGeom.dispose();
    cachedBoardRimGeoms = null;
  }
  if (cachedPortGeoms) {
    cachedPortGeoms.portStructuresVertexAoGeom.dispose();
    cachedPortGeoms.gantryCranesVertexAoGeom.dispose();
    cachedPortGeoms = null;
  }
  if (cachedHeritageGeoms) {
    cachedHeritageGeoms.cathedralBodyVertexAoGeom.dispose();
    cachedHeritageGeoms.cathedralAccentsGeom.dispose();
    cachedHeritageGeoms.parisStatueAndPedestalGeom.dispose();
    cachedHeritageGeoms.parisStreetlampsGeom.dispose();
    cachedHeritageGeoms = null;
  }
}
