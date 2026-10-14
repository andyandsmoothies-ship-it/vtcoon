// [UI-S02/MSS][IMP-379] diorama_lod_helpers.ts — Pure Geometry & LOD Spatial Descriptors
// Pure View-Model Seam for Miniature City Diorama (Anti-TIDD, Zero-Slop)

export interface CentralMonumentLODDescriptor {
  readonly isMobile: boolean;
  readonly meshCount: number;
  readonly plinth: {
    readonly radiusTop: number;
    readonly radiusBottom: number;
    readonly height: number;
    readonly position: [number, number, number];
    readonly topElevation: number;
    readonly color: string;
  };
  readonly spire: {
    readonly radiusTop: number;
    readonly radiusBottom: number;
    readonly height: number;
    readonly position: [number, number, number];
    readonly bottomElevation: number;
    readonly color: string;
    readonly castShadow: boolean;
  };
  readonly embeddingDepth: number;
  readonly isCoplanar: boolean;
}

export function getCentralMonumentLODDescriptor(isMobile = false): CentralMonumentLODDescriptor {
  if (isMobile) {
    const plinthY = 0.02;
    const plinthHeight = 0.04;
    const plinthTop = plinthY + plinthHeight / 2; // 0.04m

    const spireY = 0.28;
    const spireHeight = 0.52;
    const spireBottom = spireY - spireHeight / 2; // 0.02m

    const embeddingDepth = Number((plinthTop - spireBottom).toFixed(4)); // 0.02m (20mm)
    const isCoplanar = Math.abs(plinthTop - spireBottom) < 0.001;

    return {
      isMobile: true,
      meshCount: 2,
      plinth: {
        radiusTop: 1.15,
        radiusBottom: 1.25,
        height: plinthHeight,
        position: [0, plinthY, 0],
        topElevation: plinthTop,
        color: '#0EA5E9',
      },
      spire: {
        radiusTop: 0.06,
        radiusBottom: 0.18,
        height: spireHeight,
        position: [0, spireY, 0],
        bottomElevation: spireBottom,
        color: '#F59E0B',
        castShadow: false, // Tối ưu GPU TBDR: tắt shadow pass cho LOD mobile
      },
      embeddingDepth,
      isCoplanar,
    };
  }

  return {
    isMobile: false,
    meshCount: 7,
    plinth: {
      radiusTop: 1.15,
      radiusBottom: 1.25,
      height: 0.04,
      position: [0, 0.01, 0],
      topElevation: 0.03,
      color: '#CBD5E1',
    },
    spire: {
      radiusTop: 0.08,
      radiusBottom: 0.14,
      height: 0.26,
      position: [0, 0.38, 0],
      bottomElevation: 0.25,
      color: '#F59E0B',
      castShadow: true,
    },
    embeddingDepth: 0.0,
    isCoplanar: false,
  };
}

import { Color, InstancedBufferAttribute, type InstancedMesh, Object3D } from 'three';

export interface MobileCitySilhouetteBox {
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly scale: readonly [number, number, number];
  readonly color: string;
  readonly bottomElevation: number;
}

const MOBILE_SILHOUETTE_SPECS: ReadonlyArray<{
  readonly id: string;
  readonly x: number;
  readonly z: number;
  readonly w: number;
  readonly h: number;
  readonly d: number;
  readonly color: string;
}> = [
  { id: 'sil-nw-1', x: -5.4, z: -5.8, w: 0.52, h: 2.2, d: 0.52, color: '#38BDF8' },
  { id: 'sil-nw-2', x: -4.5, z: -5.9, w: 0.50, h: 2.4, d: 0.50, color: '#0EA5E9' },
  { id: 'sil-nw-3', x: -3.4, z: -5.8, w: 0.50, h: 2.1, d: 0.50, color: '#0D9488' },
  { id: 'sil-nw-4', x: -5.6, z: -4.4, w: 0.48, h: 1.3, d: 0.48, color: '#38BDF8' },
  { id: 'sil-nw-5', x: -5.5, z: -3.2, w: 0.46, h: 1.1, d: 0.46, color: '#E2E8F0' },
  { id: 'sil-nw-6', x: -3.3, z: -4.4, w: 0.48, h: 1.2, d: 0.48, color: '#0D9488' },
  { id: 'sil-nw-7', x: -5.3, z: -2.2, w: 0.44, h: 0.9, d: 0.44, color: '#38BDF8' },
  { id: 'sil-nw-8', x: -4.2, z: -2.5, w: 0.46, h: 1.0, d: 0.46, color: '#0EA5E9' },
  { id: 'sil-sw-1', x: -5.6, z: 2.0, w: 0.46, h: 0.56, d: 0.80, color: '#FEF08A' },
  { id: 'sil-sw-2', x: -5.6, z: 3.65, w: 0.46, h: 0.62, d: 0.80, color: '#EA580C' },
  { id: 'sil-sw-3', x: -5.3, z: 5.35, w: 0.85, h: 0.54, d: 0.46, color: '#FEF08A' },
  { id: 'sil-sw-4', x: -4.1, z: 5.35, w: 0.85, h: 0.60, d: 0.46, color: '#EA580C' },
  { id: 'sil-sw-5', x: -2.9, z: 5.35, w: 0.85, h: 0.50, d: 0.46, color: '#FEF08A' },
  { id: 'sil-ne-1', x: 4.5, z: -4.5, w: 1.20, h: 0.72, d: 1.10, color: '#F8FAFC' },
  { id: 'sil-ne-2', x: 3.2, z: -4.2, w: 0.68, h: 0.88, d: 0.68, color: '#38BDF8' },
  { id: 'sil-ne-3', x: 4.4, z: -2.2, w: 0.82, h: 0.64, d: 0.74, color: '#E2E8F0' },
  { id: 'sil-se-1', x: 3.2, z: 2.6, w: 0.54, h: 0.52, d: 0.82, color: '#FEF08A' },
  { id: 'sil-se-2', x: 3.2, z: 4.2, w: 0.54, h: 0.56, d: 0.82, color: '#EA580C' },
];

const MOBILE_SILHOUETTE_DESCRIPTORS: ReadonlyArray<MobileCitySilhouetteBox> = MOBILE_SILHOUETTE_SPECS.map((s) => ({
  id: s.id,
  position: [s.x, Number((0.012 + s.h / 2).toFixed(4)), s.z],
  scale: [s.w, s.h, s.d],
  color: s.color,
  bottomElevation: 0.012,
}));

export function getMobileCitySilhouetteDescriptors(): ReadonlyArray<MobileCitySilhouetteBox> {
  return MOBILE_SILHOUETTE_DESCRIPTORS;
}

export function populateMobileCitySilhouetteInstancedMesh(
  mesh: InstancedMesh | null,
  descriptors: ReadonlyArray<MobileCitySilhouetteBox> = getMobileCitySilhouetteDescriptors()
): number {
  if (!mesh) return 0;
  if (!mesh.instanceColor) {
    mesh.instanceColor = new InstancedBufferAttribute(new Float32Array(descriptors.length * 3), 3);
  }
  const dummy = new Object3D();
  const color = new Color();
  descriptors.forEach((box, idx) => {
    dummy.position.set(box.position[0], box.position[1], box.position[2]);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(box.scale[0], box.scale[1], box.scale[2]);
    dummy.updateMatrix();
    mesh.setMatrixAt(idx, dummy.matrix);
    color.set(box.color);
    mesh.setColorAt(idx, color);
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true;
  }
  mesh.computeBoundingSphere();
  return descriptors.length;
}
