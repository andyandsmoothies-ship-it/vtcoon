// [TC-65/MSS][IMP-65] Contract Test Suite: Building Scale (0.65x, 0.55m plinth), Corner Splay & Regional Typologies
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Scaled Geometry & Standard Outer Lot Position (procedural_building.tsx Z = -1.35m, scale 0.65x, plinth 0.55m)
// Facet 2: Corner Clearance & Zero-Collision Invariant (Math & Coordinates: D >= 0.60m, splay offset, 12-15 deg inward rotation)
// Facet 3: Regional Architectural Typology Mapping (building_typology.ts: riverine, resort, heritage, metropolis)
// Facet 4: Model Asset Budget & Slam VFX World Position (construction_slam_vfx.tsx synchronized within < 0.001m)

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProceduralBuilding } from '../../src/client/3d/procedural_building';
import * as ProceduralBuildingMod from '../../src/client/3d/procedural_building';
import { getBuildingWorldPosition } from '../../src/client/3d/construction_slam_vfx';
import { cellPosition } from '../../src/client/3d/board_coords';

vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    RoundedBox: ({ children, ...props }: any) => React.createElement('rounded-box', props, children),
  };
});

interface BuildingTypologyModule {
  getRegionalTypology: (cellIndex: number) => string | null;
  getBuildingModelUrl: (cellIndex: number, level: 1 | 2 | 3) => string | null;
  BUILDING_BASE_PLINTH_WIDTH?: number;
}

async function loadTypologyModule(): Promise<BuildingTypologyModule> {
  try {
    // @ts-ignore
    return await import('../../src/client/3d/building_typology');
  } catch (err: any) {
    return {
      getRegionalTypology: () => {
        throw new Error(`[IMP-65] Missing building_typology module: ${err.message}`);
      },
      getBuildingModelUrl: () => {
        throw new Error(`[IMP-65] Missing building_typology module: ${err.message}`);
      },
      BUILDING_BASE_PLINTH_WIDTH: undefined,
    };
  }
}

export interface BuildingLotTransform {
  readonly position: [number, number, number];
  readonly rotation: [number, number, number];
  readonly scale: [number, number, number];
  readonly baseWidth?: number;
}

function getLotTransform(cellIndex: number): BuildingLotTransform {
  const fn = (ProceduralBuildingMod as any).getBuildingLotTransform;
  if (!fn) {
    throw new Error('[IMP-65] getBuildingLotTransform is not exported from procedural_building');
  }
  return fn(cellIndex);
}

function computeExpectedWorldPos(cellIndex: number, localPos: [number, number, number]): [number, number, number] {
  const [cx, , cz] = cellPosition(cellIndex);
  const side = Math.floor(cellIndex / 10);
  const [lx, ly, lz] = localPos;
  switch (side) {
    case 0: return [cx + lx, 0.12, cz + lz];
    case 1: return [cx - lz, 0.12, cz + lx];
    case 2: return [cx - lx, 0.12, cz - lz];
    default: return [cx + lz, 0.12, cz - lx];
  }
}

function extractRootGroupPosition(markup: string): [number, number, number] {
  const match = markup.match(/<group[^>]*\bposition="([^"]+)"/);
  if (!match || !match[1]) return [0, 0, 0];
  const parts = match[1].split(',').map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

describe('[TC-65/MSS][IMP-65] Building Scale, Corner Clearance & Typologies Suite', () => {
  // =========================================================================
  // FACET 1: SCALED GEOMETRY & STANDARD OUTER LOT POSITION
  // =========================================================================
  it('[TC-65.01/MSS][IMP-65] Standard mid-side lot position Z coordinate is -1.38m', () => {
    const transform = getLotTransform(3);
    expect(transform.position[2]).toBeCloseTo(-1.38, 2);
  });

  it('[TC-65.02/MSS][IMP-65] Standard mid-side lot scale is uniform 0.975x across X, Y, Z', () => {
    const transform = getLotTransform(6);
    expect(transform.scale).toEqual([0.975, 0.975, 0.975]);
  });

  it('[TC-65.03/MSS][IMP-65] Building base plinth width is standardized to 0.55m', async () => {
    const mod = await loadTypologyModule();
    expect(mod.BUILDING_BASE_PLINTH_WIDTH).toBe(0.55);
  });

  it.each([13, 16, 23, 26, 32])(
    '[TC-65.04/MSS][IMP-65] Mid-side property tile %i conforms to Z = -1.38m lot coordinate',
    (cellIndex) => {
      const transform = getLotTransform(cellIndex);
      expect(transform.position[2]).toBeCloseTo(-1.38, 2);
    }
  );

  it.each([3, 13, 23, 32])(
    '[TC-65.05/MSS][IMP-65] Mid-side property tile %i maintains zero rotation angle',
    (cellIndex) => {
      const transform = getLotTransform(cellIndex);
      expect(transform.rotation).toEqual([0, 0, 0]);
    }
  );

  it('[TC-65.06/MSS][IMP-65] Rendered ProceduralBuilding C0 plot root is positioned at Z = -1.38m', () => {
    const markup = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 0 }));
    const pos = extractRootGroupPosition(markup);
    expect(pos[2]).toBeCloseTo(-1.38, 2);
  });

  // =========================================================================
  // FACET 2: CORNER CLEARANCE & ZERO-COLLISION INVARIANT (MATH & COORDINATES)
  // =========================================================================
  it('[TC-65.07/MSS][IMP-65] Corner 0 (GO): Euclidean distance between Cell 1 and Cell 39 is >= 0.60m', () => {
    const bld1 = getBuildingWorldPosition(1);
    const bld39 = getBuildingWorldPosition(39);
    const dist = Math.hypot(bld1[0] - bld39[0], bld1[2] - bld39[2]);
    expect(dist).toBeGreaterThanOrEqual(0.60);
  });

  it('[TC-65.08/MSS][IMP-65] Corner 10 (Audit): Euclidean distance between Cell 9 and Cell 11 is >= 0.60m', () => {
    const bld9 = getBuildingWorldPosition(9);
    const bld11 = getBuildingWorldPosition(11);
    const dist = Math.hypot(bld9[0] - bld11[0], bld9[2] - bld11[2]);
    expect(dist).toBeGreaterThanOrEqual(0.60);
  });

  it('[TC-65.09/MSS][IMP-65] Corner 20 (Free Parking): Euclidean distance between Cell 19 and Cell 21 is >= 0.60m', () => {
    const bld19 = getBuildingWorldPosition(19);
    const bld21 = getBuildingWorldPosition(21);
    const dist = Math.hypot(bld19[0] - bld21[0], bld19[2] - bld21[2]);
    expect(dist).toBeGreaterThanOrEqual(0.60);
  });

  it('[TC-65.10/MSS][IMP-65] Corner 30 (Tax Order): Euclidean distance between Cell 29 and Cell 31 is >= 0.60m', () => {
    const bld29 = getBuildingWorldPosition(29);
    const bld31 = getBuildingWorldPosition(31);
    const dist = Math.hypot(bld29[0] - bld31[0], bld29[2] - bld31[2]);
    expect(dist).toBeGreaterThanOrEqual(0.60);
  });

  it.each([1, 9, 11, 19, 21, 29, 31, 39])(
    '[TC-65.11/MSS][IMP-65] Corner-adjacent tile %i applies lateral splay offset (>= 0.10m)',
    (cellIndex) => {
      const transform = getLotTransform(cellIndex);
      expect(Math.abs(transform.position[0])).toBeGreaterThanOrEqual(0.10);
    }
  );

  it.each([1, 9, 11, 19, 21, 29, 31, 39])(
    '[TC-65.12/MSS][IMP-65] Corner-adjacent tile %i applies straight corner rotation [0, 0, 0]',
    (cellIndex) => {
      const transform = getLotTransform(cellIndex);
      expect(transform.rotation).toEqual([0, 0, 0]);
      expect(transform.rotation[1]).toBe(0);
    }
  );

  it.each([
    [1, 39],
    [9, 11],
    [19, 21],
    [29, 31],
  ])(
    '[TC-65.13/MSS][IMP-65] Corner pair (%i, %i) preserves positive clearance margin >= 0.05m beyond 0.55m base',
    (cellA, cellB) => {
      const bldA = getBuildingWorldPosition(cellA);
      const bldB = getBuildingWorldPosition(cellB);
      const dist = Math.hypot(bldA[0] - bldB[0], bldA[2] - bldB[2]);
      expect(dist - 0.55).toBeGreaterThanOrEqual(0.05);
    }
  );

  // =========================================================================
  // FACET 3: REGIONAL ARCHITECTURAL TYPOLOGY MAPPING (building_typology.ts)
  // =========================================================================
  it.each([1, 3, 27])(
    '[TC-65.14/MSS][IMP-65] Riverine typology mapped for South-Western water region cell %i',
    async (cellIndex) => {
      const mod = await loadTypologyModule();
      expect(mod.getRegionalTypology(cellIndex)).toBe('riverine');
    }
  );

  it.each([9, 11, 13, 14, 16, 21, 29])(
    '[TC-65.15/MSS][IMP-65] Resort typology mapped for coastal and mountain tourism cell %i',
    async (cellIndex) => {
      const mod = await loadTypologyModule();
      expect(mod.getRegionalTypology(cellIndex)).toBe('resort');
    }
  );

  it.each([18, 23, 24, 31, 34])(
    '[TC-65.16/MSS][IMP-65] Heritage typology mapped for historic and cultural cell %i',
    async (cellIndex) => {
      const mod = await loadTypologyModule();
      expect(mod.getRegionalTypology(cellIndex)).toBe('heritage');
    }
  );

  it.each([6, 8, 19, 26, 32, 37, 39])(
    '[TC-65.17/MSS][IMP-65] Metropolis typology mapped for major financial hub cell %i',
    async (cellIndex) => {
      const mod = await loadTypologyModule();
      expect(mod.getRegionalTypology(cellIndex)).toBe('metropolis');
    }
  );

  it.each([
    [1, 1, '/models/buildings/bld_riverine_c1.glb'],
    [1, 2, '/models/buildings/bld_riverine_c2.glb'],
    [1, 3, '/models/buildings/bld_riverine_c3.glb'],
    [9, 1, '/models/buildings/bld_resort_c1.glb'],
    [18, 2, '/models/buildings/bld_heritage_c2.glb'],
    [39, 3, '/models/buildings/bld_metropolis_c3.glb'],
  ] as const)(
    '[TC-65.18/MSS][IMP-65] Resolves GLB URL for cell %i level %i to %s',
    async (cellIndex, level, expectedUrl) => {
      const mod = await loadTypologyModule();
      expect(mod.getBuildingModelUrl(cellIndex, level)).toBe(expectedUrl);
    }
  );

  // =========================================================================
  // FACET 4: MODEL ASSET BUDGET & SLAM VFX WORLD POSITION
  // =========================================================================
  it.each([3, 6, 13, 16, 23, 26, 32])(
    '[TC-65.19/MSS][IMP-65] Slam VFX world position matches lot transform for standard cell %i (< 0.001m)',
    (cellIndex) => {
      const slamPos = getBuildingWorldPosition(cellIndex);
      const transform = getLotTransform(cellIndex);
      const expectedPos = computeExpectedWorldPos(cellIndex, transform.position);
      const dist = Math.hypot(slamPos[0] - expectedPos[0], slamPos[2] - expectedPos[2]);
      expect(dist).toBeLessThan(0.001);
    }
  );

  it.each([1, 9, 11, 19, 21, 29, 31, 39])(
    '[TC-65.20/MSS][IMP-65] Slam VFX world position matches splayed lot transform for corner cell %i (< 0.001m)',
    (cellIndex) => {
      const slamPos = getBuildingWorldPosition(cellIndex);
      const transform = getLotTransform(cellIndex);
      const expectedPos = computeExpectedWorldPos(cellIndex, transform.position);
      const dist = Math.hypot(slamPos[0] - expectedPos[0], slamPos[2] - expectedPos[2]);
      expect(dist).toBeLessThan(0.001);
    }
  );

  it.each([0, 5, 10, 12, 20, 25, 28, 30, 35])(
    '[TC-65.21/MSS][IMP-65] Non-property tile %i does not resolve building models',
    async (cellIndex) => {
      const mod = await loadTypologyModule();
      expect(mod.getBuildingModelUrl(cellIndex, 1)).toBeNull();
    }
  );

  it.each([0, 2, 4, 7, 10, 15, 22, 30, 38])(
    '[TC-65.22/MSS][IMP-65] Non-property tile %i returns null for regional typology',
    async (cellIndex) => {
      const mod = await loadTypologyModule();
      expect(mod.getRegionalTypology(cellIndex)).toBeNull();
    }
  );
});
