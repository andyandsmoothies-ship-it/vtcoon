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
