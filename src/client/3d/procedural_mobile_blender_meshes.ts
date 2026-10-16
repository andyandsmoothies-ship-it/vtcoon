// [UI-S03/MSS][IMP-404] Unified RenderTierProfile & Frame-0 Low-Poly Tectonics Baked-AO Building Archetypes
// Synchronized 1:1 with scripts/blender/build_mobile_regional_archetypes.py & public/models/buildings/mobile_archetypes_baked_ao.glb
import { BoxGeometry, BufferAttribute, BufferGeometry } from 'three';
import type { RegionalTypology } from './building_typology';

export const MOBILE_ARCHETYPES_GLB_URL = '/models/buildings/mobile_archetypes_baked_ao.glb' as const;
export type RenderTierId = 'IOS_WEBKIT_TBDR' | 'ANDROID_MOBILE' | 'DESKTOP_BALANCED' | 'DESKTOP_ULTRA';

export interface RenderTierCapabilitiesInput {
  readonly isMobile?: boolean; readonly isIOS?: boolean;
  readonly deviceMemoryGb?: number; readonly hardwareConcurrency?: number;
}

export interface RenderTierProfile {
  readonly tierId: RenderTierId; readonly maxDpr: number;
  readonly activeFpsCap: number; readonly idleFpsCap: number;
  readonly buildingRenderMode: 'INSTANCED_POOL_VERTEX_AO' | 'BLENDER_GLB_STANDARD' | 'BLENDER_GLB_PBR_SHADOW';
  readonly monopolyArchwayMode: 'INSTANCED_POOL_SINGLE_MAT' | 'GLB_INSTANCE' | 'GLB_INSTANCE_SHADOW';
  readonly enableOuterBaySanctuaries: boolean; readonly enableDominoShockwave: boolean;
  readonly minVerticalStepMm: number;
}

export interface QuantizedVertexColorMeshData {
  readonly positions: Float32Array; readonly normals: Float32Array;
  readonly colors: Float32Array; readonly indices: Uint16Array;
}

export interface TypologyAwningTransform {
  readonly yOffset: number; readonly zOffset: number; readonly scale: readonly [number, number, number];
}

interface TectonicFrustumSpec {
  readonly center: readonly [number, number, number]; readonly sizeBottom: readonly [number, number, number];
  readonly sizeTop?: readonly [number, number]; readonly color: string;
  readonly aoBottom: number; readonly aoTop: number; readonly openBottom?: boolean;
}

interface RecessedCavityBaySpec {
  readonly openingCenter: readonly [number, number, number]; readonly cavitySize: readonly [number, number, number];
  readonly color: string; readonly revealColor: string; readonly aoCavity: number;
}

interface ArchetypeTectonicRecipe {
  readonly frustums: readonly TectonicFrustumSpec[]; readonly cavities: readonly RecessedCavityBaySpec[];
}

const ULTRA_MIN_MEMORY_GB = 8;
const ULTRA_MIN_CORES = 8;

const RENDER_TIER_PROFILES: Readonly<Record<RenderTierId, RenderTierProfile>> = {
  IOS_WEBKIT_TBDR: {
    tierId: 'IOS_WEBKIT_TBDR', maxDpr: 0.82, activeFpsCap: 60, idleFpsCap: 30,
    buildingRenderMode: 'INSTANCED_POOL_VERTEX_AO', monopolyArchwayMode: 'INSTANCED_POOL_SINGLE_MAT',
    enableOuterBaySanctuaries: false, enableDominoShockwave: true, minVerticalStepMm: 20,
  },
  ANDROID_MOBILE: {
    tierId: 'ANDROID_MOBILE', maxDpr: 1.0, activeFpsCap: 60, idleFpsCap: 30,
    buildingRenderMode: 'INSTANCED_POOL_VERTEX_AO', monopolyArchwayMode: 'INSTANCED_POOL_SINGLE_MAT',
    enableOuterBaySanctuaries: false, enableDominoShockwave: true, minVerticalStepMm: 20,
  },
  DESKTOP_BALANCED: {
    tierId: 'DESKTOP_BALANCED', maxDpr: 1.25, activeFpsCap: 60, idleFpsCap: 30,
    buildingRenderMode: 'BLENDER_GLB_STANDARD', monopolyArchwayMode: 'GLB_INSTANCE',
    enableOuterBaySanctuaries: true, enableDominoShockwave: true, minVerticalStepMm: 20,
  },
  DESKTOP_ULTRA: {
    tierId: 'DESKTOP_ULTRA', maxDpr: 2.0, activeFpsCap: 60, idleFpsCap: 60,
    buildingRenderMode: 'BLENDER_GLB_PBR_SHADOW', monopolyArchwayMode: 'GLB_INSTANCE_SHADOW',
    enableOuterBaySanctuaries: true, enableDominoShockwave: true, minVerticalStepMm: 20,
  },
};

function parseHexRgb(hex: string): readonly [number, number, number] {
  const clean = hex.replace('#', '');
  return [parseInt(clean.slice(0, 2), 16) / 255, parseInt(clean.slice(2, 4), 16) / 255, parseInt(clean.slice(4, 6), 16) / 255];
}

function clampUnit(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function appendQuadFace(
  positions: number[], normals: number[], colors: number[], indices: number[],
  verts: readonly (readonly [number, number, number])[], normal: readonly [number, number, number],
  rgb: readonly [number, number, number], shades: readonly [number, number, number, number]
): void {
  const baseIdx = positions.length / 3;
  for (let i = 0; i < 4; i++) {
    const v = verts[i]!;
    const s = shades[i]!;
    positions.push(v[0], v[1], v[2]);
    normals.push(normal[0], normal[1], normal[2]);
    colors.push(clampUnit(rgb[0] * s), clampUnit(rgb[1] * s), clampUnit(rgb[2] * s));
  }
  indices.push(baseIdx, baseIdx + 1, baseIdx + 2, baseIdx, baseIdx + 2, baseIdx + 3);
}

function appendTectonicFrustum(positions: number[], normals: number[], colors: number[], indices: number[], spec: TectonicFrustumSpec): void {
  const [cx, cy, cz] = spec.center;
  const [wxB, hy, wzB] = spec.sizeBottom;
  const [wxT, wzT] = spec.sizeTop ?? [wxB, wzB];
  const rgb = parseHexRgb(spec.color);
  const bAo = spec.aoBottom, tAo = spec.aoTop;
  const y0 = cy - hy * 0.5, y1 = cy + hy * 0.5;
  const xb0 = cx - wxB * 0.5, xb1 = cx + wxB * 0.5, zb0 = cz - wzB * 0.5, zb1 = cz + wzB * 0.5;
  const xt0 = cx - wxT * 0.5, xt1 = cx + wxT * 0.5, zt0 = cz - wzT * 0.5, zt1 = cz + wzT * 0.5;

  appendQuadFace(positions, normals, colors, indices, [[xb0, y0, zb1], [xb1, y0, zb1], [xt1, y1, zt1], [xt0, y1, zt1]], [0, 0, 1], rgb, [bAo, bAo, tAo, tAo]);
  appendQuadFace(positions, normals, colors, indices, [[xb1, y0, zb0], [xb0, y0, zb0], [xt0, y1, zt0], [xt1, y1, zt0]], [0, 0, -1], rgb, [bAo * 0.92, bAo * 0.92, tAo * 0.95, tAo * 0.95]);
  appendQuadFace(positions, normals, colors, indices, [[xb1, y0, zb1], [xb1, y0, zb0], [xt1, y1, zt0], [xt1, y1, zt1]], [1, 0, 0], rgb, [bAo * 0.95, bAo * 0.95, tAo * 0.98, tAo * 0.98]);
  appendQuadFace(positions, normals, colors, indices, [[xb0, y0, zb0], [xb0, y0, zb1], [xt0, y1, zt1], [xt0, y1, zt0]], [-1, 0, 0], rgb, [bAo * 0.9, bAo * 0.9, tAo * 0.94, tAo * 0.94]);
  appendQuadFace(positions, normals, colors, indices, [[xt0, y1, zt1], [xt1, y1, zt1], [xt1, y1, zt0], [xt0, y1, zt0]], [0, 1, 0], rgb, [tAo * 1.06, tAo * 1.06, tAo * 1.06, tAo * 1.06]);
  if (!spec.openBottom) {
    appendQuadFace(positions, normals, colors, indices, [[xb0, y0, zb0], [xb1, y0, zb0], [xb1, y0, zb1], [xb0, y0, zb1]], [0, -1, 0], rgb, [bAo * 0.65, bAo * 0.65, bAo * 0.65, bAo * 0.65]);
  }
}

function appendRecessedCavityBay(positions: number[], normals: number[], colors: number[], indices: number[], spec: RecessedCavityBaySpec): void {
  const [cx, cy, wallZ] = spec.openingCenter;
  const [width, height, depth] = spec.cavitySize;
  const backRgb = parseHexRgb(spec.color);
  const revealRgb = parseHexRgb(spec.revealColor);
  const ao = spec.aoCavity;
  const x0 = cx - width * 0.5, x1 = cx + width * 0.5, y0 = cy - height * 0.5, y1 = cy + height * 0.5;
  const zf = wallZ, zb = wallZ - depth; // Recessed INWARD into the building facade

  appendQuadFace(positions, normals, colors, indices, [[x0, y0, zb], [x1, y0, zb], [x1, y1, zb], [x0, y1, zb]], [0, 0, 1], backRgb, [ao * 0.95, ao * 0.95, ao * 0.78, ao * 0.78]);
  appendQuadFace(positions, normals, colors, indices, [[x0, y1, zb], [x1, y1, zb], [x1, y1, zf], [x0, y1, zf]], [0, -1, 0], revealRgb, [ao * 0.65, ao * 0.65, ao * 0.82, ao * 0.82]);
  appendQuadFace(positions, normals, colors, indices, [[x0, y0, zf], [x1, y0, zf], [x1, y0, zb], [x0, y0, zb]], [0, 1, 0], revealRgb, [0.68, 0.68, 0.48, 0.48]);
  appendQuadFace(positions, normals, colors, indices, [[x0, y0, zf], [x0, y0, zb], [x0, y1, zb], [x0, y1, zf]], [1, 0, 0], revealRgb, [0.52, 0.34, 0.30, 0.48]);
  appendQuadFace(positions, normals, colors, indices, [[x1, y0, zb], [x1, y0, zf], [x1, y1, zf], [x1, y1, zb]], [-1, 0, 0], revealRgb, [0.34, 0.52, 0.48, 0.30]);
}

function buildSculptedArchetypeMesh(recipe: ArchetypeTectonicRecipe): QuantizedVertexColorMeshData {
  const positions: number[] = [], normals: number[] = [], colors: number[] = [], indices: number[] = [];
  for (const frustum of recipe.frustums) appendTectonicFrustum(positions, normals, colors, indices, frustum);
  for (const cavity of recipe.cavities) appendRecessedCavityBay(positions, normals, colors, indices, cavity);
  return {
    positions: new Float32Array(positions), normals: new Float32Array(normals),
    colors: new Float32Array(colors), indices: new Uint16Array(indices),
  };
}

export const MOBILE_BUILDING_BLENDER_MESHES: Readonly<
  Record<RegionalTypology, { readonly c1: QuantizedVertexColorMeshData; readonly c2: QuantizedVertexColorMeshData }>
> = {
  riverine: {
    c1: buildSculptedArchetypeMesh({
      frustums: [
        { center: [0, 0.035, 0], sizeBottom: [0.56, 0.07, 0.46], color: '#78350F', aoBottom: 0.45, aoTop: 0.85 },
        { center: [0, 0.19, 0], sizeBottom: [0.50, 0.24, 0.40], color: '#FDE68A', aoBottom: 0.72, aoTop: 1.05 },
        { center: [0, 0.32, 0], sizeBottom: [0.54, 0.025, 0.44], color: '#FEF3C7', aoBottom: 0.78, aoTop: 1.08 },
        { center: [0, 0.41, 0], sizeBottom: [0.58, 0.16, 0.48], sizeTop: [0.18, 0.10], color: '#C2410C', aoBottom: 0.75, aoTop: 1.06 },
        { center: [0, 0.50, 0], sizeBottom: [0.24, 0.03, 0.12], color: '#7C2D12', aoBottom: 0.85, aoTop: 1.10 },
      ],
      cavities: [
        { openingCenter: [-0.11, 0.14, 0.20], cavitySize: [0.13, 0.16, 0.038], color: '#451A03', revealColor: '#92400E', aoCavity: 0.28 },
        { openingCenter: [0.11, 0.16, 0.20], cavitySize: [0.14, 0.12, 0.036], color: '#78350F', revealColor: '#B45309', aoCavity: 0.32 },
      ],
    }),
    c2: buildSculptedArchetypeMesh({
      frustums: [
        { center: [0, 0.06, 0], sizeBottom: [0.58, 0.12, 0.48], color: '#78350F', aoBottom: 0.42, aoTop: 0.82, openBottom: true },
        { center: [0, 0.13, 0], sizeBottom: [0.60, 0.026, 0.50], color: '#FDE68A', aoBottom: 0.70, aoTop: 1.02, openBottom: true },
        { center: [0, 0.37, 0], sizeBottom: [0.50, 0.45, 0.40], color: '#D97706', aoBottom: 0.72, aoTop: 1.05, openBottom: true },
        { center: [0, 0.36, 0], sizeBottom: [0.54, 0.024, 0.44], color: '#FEF3C7', aoBottom: 0.76, aoTop: 1.06, openBottom: true },
        { center: [0, 0.66, 0], sizeBottom: [0.56, 0.14, 0.46], sizeTop: [0.16, 0.10], color: '#B91C1C', aoBottom: 0.78, aoTop: 1.08, openBottom: true },
      ],
      cavities: [
        { openingCenter: [0, 0.06, 0.24], cavitySize: [0.22, 0.10, 0.042], color: '#451A03', revealColor: '#78350F', aoCavity: 0.25 },
        { openingCenter: [-0.12, 0.26, 0.20], cavitySize: [0.13, 0.11, 0.038], color: '#451A03', revealColor: '#92400E', aoCavity: 0.28 },
        { openingCenter: [0.12, 0.26, 0.20], cavitySize: [0.13, 0.11, 0.038], color: '#451A03', revealColor: '#92400E', aoCavity: 0.28 },
        { openingCenter: [-0.12, 0.46, 0.20], cavitySize: [0.13, 0.11, 0.038], color: '#451A03', revealColor: '#92400E', aoCavity: 0.30 },
        { openingCenter: [0.12, 0.46, 0.20], cavitySize: [0.13, 0.11, 0.038], color: '#451A03', revealColor: '#92400E', aoCavity: 0.30 },
        { openingCenter: [0, 0.55, 0.20], cavitySize: [0.20, 0.06, 0.034], color: '#78350F', revealColor: '#FDE68A', aoCavity: 0.32 },
      ],
    }),
  },
  resort: {
    c1: buildSculptedArchetypeMesh({
      frustums: [
        { center: [0, 0.03, 0], sizeBottom: [0.58, 0.06, 0.48], color: '#CBD5E1', aoBottom: 0.48, aoTop: 0.88 },
        { center: [0, 0.18, 0], sizeBottom: [0.52, 0.24, 0.42], color: '#F8FAFC', aoBottom: 0.76, aoTop: 1.06, openBottom: true },
        { center: [0, 0.24, 0.222], sizeBottom: [0.48, 0.024, 0.055], color: '#E0F2FE', aoBottom: 0.70, aoTop: 1.04, openBottom: true },
        { center: [0, 0.325, 0], sizeBottom: [0.56, 0.045, 0.46], color: '#0284C7', aoBottom: 0.74, aoTop: 1.05, openBottom: true },
        { center: [-0.08, 0.375, -0.04], sizeBottom: [0.28, 0.055, 0.24], color: '#38BDF8', aoBottom: 0.80, aoTop: 1.08, openBottom: true },
        { center: [0.12, 0.365, 0.06], sizeBottom: [0.16, 0.035, 0.16], color: '#F1F5F9', aoBottom: 0.85, aoTop: 1.10, openBottom: true },
      ],
      cavities: [
        { openingCenter: [-0.12, 0.13, 0.21], cavitySize: [0.14, 0.16, 0.040], color: '#0369A1', revealColor: '#CBD5E1', aoCavity: 0.26 },
        { openingCenter: [0.12, 0.15, 0.21], cavitySize: [0.16, 0.13, 0.038], color: '#0284C7', revealColor: '#E2E8F0', aoCavity: 0.30 },
      ],
    }),
    c2: buildSculptedArchetypeMesh({
      frustums: [
        { center: [0, 0.065, 0], sizeBottom: [0.60, 0.13, 0.50], color: '#E2E8F0', aoBottom: 0.45, aoTop: 0.86 },
        { center: [0, 0.40, 0], sizeBottom: [0.48, 0.52, 0.38], sizeTop: [0.42, 0.34], color: '#06B6D4', aoBottom: 0.72, aoTop: 1.06, openBottom: true },
        { center: [0, 0.24, 0], sizeBottom: [0.54, 0.026, 0.44], color: '#F8FAFC', aoBottom: 0.76, aoTop: 1.08, openBottom: true },
        { center: [0, 0.38, 0], sizeBottom: [0.52, 0.026, 0.42], color: '#F8FAFC', aoBottom: 0.78, aoTop: 1.08, openBottom: true },
        { center: [0, 0.52, 0], sizeBottom: [0.50, 0.026, 0.40], color: '#F8FAFC', aoBottom: 0.80, aoTop: 1.10, openBottom: true },
        { center: [0, 0.71, 0], sizeBottom: [0.34, 0.09, 0.26], color: '#F8FAFC', aoBottom: 0.84, aoTop: 1.12, openBottom: true },
      ],
      cavities: [
        { openingCenter: [0, 0.06, 0.25], cavitySize: [0.26, 0.10, 0.044], color: '#0369A1', revealColor: '#CBD5E1', aoCavity: 0.25 },
        { openingCenter: [-0.11, 0.31, 0.19], cavitySize: [0.14, 0.09, 0.038], color: '#0C4A6E', revealColor: '#E0F2FE', aoCavity: 0.28 },
        { openingCenter: [0.11, 0.31, 0.19], cavitySize: [0.14, 0.09, 0.038], color: '#0C4A6E', revealColor: '#E0F2FE', aoCavity: 0.28 },
        { openingCenter: [-0.10, 0.45, 0.184], cavitySize: [0.13, 0.09, 0.038], color: '#0C4A6E', revealColor: '#E0F2FE', aoCavity: 0.30 },
        { openingCenter: [0.10, 0.45, 0.184], cavitySize: [0.13, 0.09, 0.038], color: '#0C4A6E', revealColor: '#E0F2FE', aoCavity: 0.30 },
      ],
    }),
  },
  heritage: {
    c1: buildSculptedArchetypeMesh({
      frustums: [
        { center: [0, 0.03, 0], sizeBottom: [0.58, 0.06, 0.48], color: '#475569', aoBottom: 0.42, aoTop: 0.82 },
        { center: [0, 0.175, 0], sizeBottom: [0.51, 0.23, 0.41], color: '#FEF08A', aoBottom: 0.72, aoTop: 1.04 },
        { center: [0, 0.305, 0], sizeBottom: [0.56, 0.03, 0.46], color: '#991B1B', aoBottom: 0.68, aoTop: 0.98, openBottom: true },
        { center: [0, 0.39, 0], sizeBottom: [0.60, 0.14, 0.50], sizeTop: [0.28, 0.20], color: '#D97706', aoBottom: 0.74, aoTop: 1.05, openBottom: true },
        { center: [0, 0.495, 0], sizeBottom: [0.30, 0.08, 0.22], sizeTop: [0.14, 0.08], color: '#B45309', aoBottom: 0.84, aoTop: 1.12, openBottom: true },
      ],
      cavities: [
        { openingCenter: [0, 0.13, 0.205], cavitySize: [0.15, 0.16, 0.042], color: '#7F1D1D', revealColor: '#92400E', aoCavity: 0.25 },
        { openingCenter: [-0.16, 0.16, 0.205], cavitySize: [0.09, 0.11, 0.036], color: '#451A03', revealColor: '#B45309', aoCavity: 0.28 },
        { openingCenter: [0.16, 0.16, 0.205], cavitySize: [0.09, 0.11, 0.036], color: '#451A03', revealColor: '#B45309', aoCavity: 0.28 },
      ],
    }),
    c2: buildSculptedArchetypeMesh({
      frustums: [
        { center: [0, 0.065, 0], sizeBottom: [0.60, 0.13, 0.50], color: '#475569', aoBottom: 0.40, aoTop: 0.80 },
        { center: [0, 0.36, 0], sizeBottom: [0.50, 0.46, 0.40], color: '#991B1B', aoBottom: 0.70, aoTop: 1.04 },
        { center: [0, 0.26, 0], sizeBottom: [0.58, 0.032, 0.48], sizeTop: [0.52, 0.42], color: '#D97706', aoBottom: 0.72, aoTop: 1.05, openBottom: true },
        { center: [0, 0.44, 0], sizeBottom: [0.56, 0.032, 0.46], sizeTop: [0.50, 0.40], color: '#D97706', aoBottom: 0.76, aoTop: 1.06, openBottom: true },
        { center: [0, 0.65, 0], sizeBottom: [0.56, 0.13, 0.46], sizeTop: [0.20, 0.14], color: '#F59E0B', aoBottom: 0.80, aoTop: 1.10, openBottom: true },
        { center: [0, 0.74, 0], sizeBottom: [0.22, 0.05, 0.12], color: '#FEF08A', aoBottom: 0.88, aoTop: 1.12, openBottom: true },
      ],
      cavities: [
        { openingCenter: [0, 0.06, 0.25], cavitySize: [0.22, 0.10, 0.044], color: '#451A03', revealColor: '#78350F', aoCavity: 0.24 },
        { openingCenter: [-0.12, 0.22, 0.20], cavitySize: [0.12, 0.10, 0.038], color: '#451A03', revealColor: '#B45309', aoCavity: 0.28 },
        { openingCenter: [0.12, 0.22, 0.20], cavitySize: [0.12, 0.10, 0.038], color: '#451A03', revealColor: '#B45309', aoCavity: 0.28 },
        { openingCenter: [-0.12, 0.37, 0.20], cavitySize: [0.12, 0.10, 0.038], color: '#451A03', revealColor: '#B45309', aoCavity: 0.30 },
        { openingCenter: [0.12, 0.37, 0.20], cavitySize: [0.12, 0.10, 0.038], color: '#451A03', revealColor: '#B45309', aoCavity: 0.30 },
      ],
    }),
  },
  metropolis: {
    c1: buildSculptedArchetypeMesh({
      frustums: [
        { center: [0, 0.028, 0], sizeBottom: [0.56, 0.056, 0.46], color: '#334155', aoBottom: 0.40, aoTop: 0.80 },
        { center: [0, 0.19, 0], sizeBottom: [0.52, 0.27, 0.42], color: '#FEF3C7', aoBottom: 0.74, aoTop: 1.05 },
        { center: [0, 0.34, 0], sizeBottom: [0.56, 0.03, 0.46], color: '#F8FAFC', aoBottom: 0.80, aoTop: 1.08 },
        { center: [0, 0.44, 0], sizeBottom: [0.54, 0.17, 0.44], sizeTop: [0.22, 0.16], color: '#B91C1C', aoBottom: 0.76, aoTop: 1.08, openBottom: true },
      ],
      cavities: [
        { openingCenter: [-0.12, 0.13, 0.21], cavitySize: [0.13, 0.17, 0.040], color: '#451A03', revealColor: '#D97706', aoCavity: 0.26 },
        { openingCenter: [0.12, 0.14, 0.21], cavitySize: [0.15, 0.14, 0.040], color: '#1E293B', revealColor: '#CBD5E1', aoCavity: 0.28 },
        { openingCenter: [-0.12, 0.26, 0.21], cavitySize: [0.12, 0.07, 0.034], color: '#92400E', revealColor: '#FEF3C7', aoCavity: 0.32 },
        { openingCenter: [0.12, 0.26, 0.21], cavitySize: [0.12, 0.07, 0.034], color: '#92400E', revealColor: '#FEF3C7', aoCavity: 0.32 },
      ],
    }),
    c2: buildSculptedArchetypeMesh({
      frustums: [
        { center: [0, 0.07, 0], sizeBottom: [0.60, 0.14, 0.50], color: '#334155', aoBottom: 0.40, aoTop: 0.82 },
        { center: [0, 0.41, 0], sizeBottom: [0.52, 0.54, 0.42], color: '#0284C7', aoBottom: 0.72, aoTop: 1.06 },
        { center: [0, 0.36, 0], sizeBottom: [0.55, 0.024, 0.45], color: '#CBD5E1', aoBottom: 0.76, aoTop: 1.08 },
        { center: [-0.06, 0.72, 0], sizeBottom: [0.28, 0.09, 0.24], color: '#475569', aoBottom: 0.80, aoTop: 1.08, openBottom: true },
        { center: [0.10, 0.77, 0], sizeBottom: [0.06, 0.16, 0.06], sizeTop: [0.02, 0.02], color: '#94A3B8', aoBottom: 0.86, aoTop: 1.12, openBottom: true },
      ],
      cavities: [
        { openingCenter: [0, 0.065, 0.25], cavitySize: [0.28, 0.11, 0.044], color: '#0F172A', revealColor: '#475569', aoCavity: 0.24 },
        { openingCenter: [-0.13, 0.21, 0.21], cavitySize: [0.14, 0.09, 0.040], color: '#082F49', revealColor: '#94A3B8', aoCavity: 0.26 },
        { openingCenter: [0.13, 0.21, 0.21], cavitySize: [0.14, 0.09, 0.040], color: '#082F49', revealColor: '#94A3B8', aoCavity: 0.26 },
        { openingCenter: [-0.13, 0.35, 0.21], cavitySize: [0.14, 0.09, 0.040], color: '#082F49', revealColor: '#94A3B8', aoCavity: 0.28 },
        { openingCenter: [0.13, 0.35, 0.21], cavitySize: [0.14, 0.09, 0.040], color: '#082F49', revealColor: '#94A3B8', aoCavity: 0.28 },
        { openingCenter: [0, 0.50, 0.21], cavitySize: [0.36, 0.09, 0.038], color: '#0C4A6E', revealColor: '#38BDF8', aoCavity: 0.30 },
      ],
    }),
  },
};

const TYPOLOGY_AWNING_TRANSFORMS: Readonly<Record<RegionalTypology, { readonly 1: TypologyAwningTransform; readonly 2: TypologyAwningTransform }>> = {
  riverine: { 1: { yOffset: 0.285, zOffset: 0.225, scale: [0.38, 0.045, 0.032] }, 2: { yOffset: 0.165, zOffset: 0.255, scale: [0.46, 0.055, 0.036] } },
  resort: { 1: { yOffset: 0.265, zOffset: 0.230, scale: [0.40, 0.045, 0.034] }, 2: { yOffset: 0.150, zOffset: 0.260, scale: [0.48, 0.055, 0.038] } },
  heritage: { 1: { yOffset: 0.250, zOffset: 0.225, scale: [0.36, 0.045, 0.032] }, 2: { yOffset: 0.140, zOffset: 0.255, scale: [0.44, 0.055, 0.036] } },
  metropolis: { 1: { yOffset: 0.295, zOffset: 0.228, scale: [0.38, 0.045, 0.032] }, 2: { yOffset: 0.175, zOffset: 0.258, scale: [0.46, 0.055, 0.036] } },
};

const archetypeGeometryCache = new Map<string, BufferGeometry>();
const awningGeometryCache = new Map<1 | 2, BufferGeometry>();

function isDesktopUltraCapable(input?: RenderTierCapabilitiesInput): boolean {
  const ramGb = input?.deviceMemoryGb ?? 0;
  const cores = input?.hardwareConcurrency ?? ULTRA_MIN_CORES;
  if (!Number.isFinite(ramGb) || ramGb < ULTRA_MIN_MEMORY_GB) return false;
  return Number.isFinite(cores) && cores >= ULTRA_MIN_CORES;
}

export function resolveRenderTierProfile(input?: RenderTierCapabilitiesInput): RenderTierProfile {
  if (input?.isMobile) return input.isIOS ? RENDER_TIER_PROFILES.IOS_WEBKIT_TBDR : RENDER_TIER_PROFILES.ANDROID_MOBILE;
  return isDesktopUltraCapable(input) ? RENDER_TIER_PROFILES.DESKTOP_ULTRA : RENDER_TIER_PROFILES.DESKTOP_BALANCED;
}

export function getMobileArchetypeGeometry(typology: RegionalTypology, level: 1 | 2): BufferGeometry {
  const key = `${typology}:${level}`;
  const cached = archetypeGeometryCache.get(key);
  if (cached) return cached;
  const entry = MOBILE_BUILDING_BLENDER_MESHES[typology] ?? MOBILE_BUILDING_BLENDER_MESHES.metropolis;
  const meshData = level === 2 ? entry.c2 : entry.c1;
  const geom = new BufferGeometry();
  geom.setAttribute('position', new BufferAttribute(meshData.positions, 3));
  geom.setAttribute('normal', new BufferAttribute(meshData.normals, 3));
  geom.setAttribute('color', new BufferAttribute(meshData.colors, 3));
  geom.setIndex(new BufferAttribute(meshData.indices, 1));
  geom.computeBoundingBox();
  archetypeGeometryCache.set(key, geom);
  return geom;
}

export function getMobileAwningBandGeometry(level: 1 | 2): BufferGeometry {
  const cached = awningGeometryCache.get(level);
  if (cached) return cached;
  const geom = new BoxGeometry(1, 1, 1);
  awningGeometryCache.set(level, geom);
  return geom;
}

export function getTypologyAwningTransform(
  typology: RegionalTypology, level: 1 | 2, minVerticalStepMm = RENDER_TIER_PROFILES.ANDROID_MOBILE.minVerticalStepMm
): TypologyAwningTransform {
  const entry = TYPOLOGY_AWNING_TRANSFORMS[typology] ?? TYPOLOGY_AWNING_TRANSFORMS.metropolis;
  const raw = entry[level];
  const minStepM = Math.max(0.02, minVerticalStepMm * 0.001);
  return {
    yOffset: raw.yOffset,
    zOffset: Math.max(raw.zOffset, minStepM),
    scale: [raw.scale[0], Math.max(raw.scale[1], minStepM), Math.max(raw.scale[2], minStepM)],
  };
}

export function disposeMobileArchetypeGeometries(): void {
  for (const geom of archetypeGeometryCache.values()) geom.dispose();
  archetypeGeometryCache.clear();
  for (const geom of awningGeometryCache.values()) geom.dispose();
  awningGeometryCache.clear();
}
