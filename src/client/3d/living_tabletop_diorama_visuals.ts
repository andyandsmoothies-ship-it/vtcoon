// [UI-S02/MSS] living_tabletop_diorama_visuals.ts — Pure View-Model & Water Shimmer Seam for Living Tabletop Diorama
import * as THREE from 'three';

export const TABLETOP_DIORAMA_GLB_URL = '/models/board/tabletop_diorama.glb' as const;
export const ACTION_METRO_LOOP = 'Action_Metro_Loop' as const;
export const ACTION_CRUISERS_BOBBING = 'Action_Cruisers_Bobbing' as const;
export const WATER_NORMAL_SCROLL_SPEED = 0.015 as const;

export interface WaterShimmerSample {
  readonly roughness: number;
  readonly metalness: number;
  readonly nextOffsetX: number;
  readonly nextOffsetY: number;
}

/**
 * Identifies water meshes (Saigon River & Hoan Kiem Lake) while excluding stone curbs and granite promenades.
 */
export function isWaterMeshName(name: string): boolean {
  if (!name || name.includes('Curb') || name.includes('Promenade')) {
    return false;
  }
  return (
    name.includes('River_Water') ||
    name.includes('RiverWater') ||
    name.includes('HoanKiem') ||
    name.includes('CyanWater')
  );
}

/**
 * Computes subtle Specular Sun Glitter shimmer parameters for Saigon River and Hoan Kiem Lake materials.
 */
export function computeWaterShimmerSample(
  elapsedSec: number,
  deltaSec: number,
  currentOffsetX: number,
  currentOffsetY: number,
): WaterShimmerSample {
  const safeElapsed = Number.isFinite(elapsedSec) ? elapsedSec : 0;
  const safeDelta = Number.isFinite(deltaSec) && deltaSec > 0 ? Math.min(deltaSec, 0.1) : 0;
  const waveA = Math.sin(safeElapsed * 2.2);
  const waveB = Math.cos(safeElapsed * 3.4 + 0.8);

  const roughness = Math.max(0.08, Math.min(0.24, 0.14 + waveA * 0.035 + waveB * 0.015));
  const metalness = Math.max(0.02, Math.min(0.18, 0.08 + waveB * 0.03));
  const nextOffsetX = (currentOffsetX + safeDelta * WATER_NORMAL_SCROLL_SPEED) % 1.0;
  const nextOffsetY = (currentOffsetY + safeDelta * (WATER_NORMAL_SCROLL_SPEED * 0.6)) % 1.0;

  return {
    roughness,
    metalness,
    nextOffsetX,
    nextOffsetY,
  };
}

/**
 * Generates a lightweight 32x32 tileable procedural normal map for gentle water ripple caustics.
 */
export function createWaterRippleNormalTexture(): THREE.DataTexture {
  const size = 32;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    const v = (y / size) * Math.PI * 2.0;
    for (let x = 0; x < size; x++) {
      const u = (x / size) * Math.PI * 2.0;
      const nx = Math.sin(u * 2.0 + v) * 0.18 + Math.cos(u * 3.0 - v * 2.0) * 0.10;
      const ny = Math.cos(v * 2.0 - u) * 0.18 + Math.sin(v * 3.0 + u * 2.0) * 0.10;
      const idx = (y * size + x) * 4;
      data[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = 250;
      data[idx + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Traverses the loaded GLTF scene, applies Desktop/Mobile shadow rules, and collects water materials.
 */
export function configureTabletopSceneAndCollectWater(
  root: THREE.Object3D,
  isMobile: boolean,
  rippleNormalMap: THREE.Texture,
): THREE.MeshStandardMaterial[] {
  const waterMaterials: THREE.MeshStandardMaterial[] = [];
  const castShadow = !isMobile;

  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = castShadow;
      child.receiveShadow = true;
      const mat = child.material;
      if (isWaterMeshName(child.name) && mat instanceof THREE.MeshStandardMaterial) {
        if (!mat.normalMap) {
          mat.normalMap = rippleNormalMap;
          mat.normalScale.set(0.16, 0.16);
          mat.needsUpdate = true;
        }
        if (!waterMaterials.includes(mat)) {
          waterMaterials.push(mat);
        }
      }
    }
  });

  return waterMaterials;
}

/**
 * Steps water shimmer roughness/metalness and normal map UV scrolling per frame.
 */
export function stepWaterShimmerMaterials(
  materials: readonly THREE.MeshStandardMaterial[],
  elapsedSec: number,
  deltaSec: number,
): void {
  if (materials.length === 0) return;
  const firstMap = materials[0]?.normalMap;
  const sample = computeWaterShimmerSample(
    elapsedSec,
    deltaSec,
    firstMap?.offset.x ?? 0,
    firstMap?.offset.y ?? 0,
  );

  for (let i = 0; i < materials.length; i++) {
    const mat = materials[i];
    if (!mat) continue;
    mat.roughness = sample.roughness;
    mat.metalness = sample.metalness;
    if (mat.normalMap) {
      mat.normalMap.offset.set(sample.nextOffsetX, sample.nextOffsetY);
    }
  }
}
