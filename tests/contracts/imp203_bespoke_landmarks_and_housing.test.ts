// [TC-203/MSS][UC-IMP203] Contract Test Suite: Chuẩn Hóa Nhà Cấp 1-2 & Kiến Trúc Tòa Nhà Landmark Độc Bản Cấp 3 Cho 22 Ô Đất
// Universal 5-Facet Behavioral Matrix:
// Facet 1: URL Resolution & Hierarchy SSOT (TC-203.01 - TC-203.05)
// Facet 2: Bounding Box & Spatial Clearance Invariants (TC-203.06 - TC-203.08)
// Facet 3: Persistent Tactile Anchors Invariant (3 Mỏ Neo Bất Biến Cấp 3) (TC-203.09 - TC-203.11)
// Facet 4: Landmark Registry & 22 Bespoke Architecture SSOT (TC-203.12 - TC-203.15)
// Facet 5: Zero-Crash Fallback & Headless Resilience (TC-203.16 - TC-203.20)

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  BUILDING_BASE_PLINTH_WIDTH,
  getBuildingModelUrl,
} from '../../src/client/3d/building_typology';
import { ProceduralBuilding } from '../../src/client/3d/procedural_building';
import {
  ToyPropertyBuildings,
  ToyHotelMesh,
} from '../../src/client/3d/toy_property_buildings';

vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    RoundedBox: ({ children, args, ...props }: any) =>
      React.createElement('rounded-box', { args: Array.isArray(args) ? args.join(',') : args, ...props }, children),
  };
});

// Safe dynamic loader for Landmark Registry module
async function loadLandmarkRegistryModule(): Promise<any> {
  try {
    return await import('../../src/client/3d/landmark_registry');
  } catch {
    try {
      return await import('../../src/client/3d/building_typology');
    } catch {
      return null;
    }
  }
}

// Safe dynamic loader for BespokeLandmarkFallback component
async function loadBespokeLandmarkFallbackComponent(): Promise<React.ComponentType<any> | null> {
  try {
    const mod = await import('../../src/client/3d/bespoke_landmark_fallback');
    return mod.BespokeLandmarkFallback ?? null;
  } catch {
    try {
      const mod = await import('../../src/client/3d/procedural_building');
      return (mod as any).BespokeLandmarkFallback ?? null;
    } catch {
      return null;
    }
  }
}

const BUYABLE_CELL_INDICES = [
  1, 3, 6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26, 27, 29, 31, 32, 34, 37, 39,
] as const;

describe('[TC-203/MSS][UC-IMP203] Chuẩn Hóa Nhà Cấp 1-2 & Kiến Trúc Tòa Nhà Landmark Độc Bản Cấp 3 Suite', () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // =========================================================================
  // FACET 1: URL RESOLUTION & HIERARCHY SSOT
  // =========================================================================
  describe('Facet 1: URL Resolution & Hierarchy SSOT', () => {
    it.each([1, 9, 18, 39] as const)(
      '[TC-203.01/MSS][UC-IMP203] getBuildingModelUrl(cell %i, 1) resolves standardized house C1 GLB URL',
      (cellIndex) => {
        const url = getBuildingModelUrl(cellIndex, 1);
        expect(url).toBe('/models/buildings/building_c1.glb');
      }
    );

    it.each([1, 9, 18, 39] as const)(
      '[TC-203.02/MSS][UC-IMP203] getBuildingModelUrl(cell %i, 2) resolves standardized house C2 GLB URL',
      (cellIndex) => {
        const url = getBuildingModelUrl(cellIndex, 2);
        expect(url).toBe('/models/buildings/building_c2.glb');
      }
    );

    it.each(BUYABLE_CELL_INDICES)(
      '[TC-203.03/MSS][UC-IMP203] getBuildingModelUrl(cell %i, 3) resolves bespoke landmark GLB URL /models/landmarks/bld_c3_cell_%i.glb',
      (cellIndex) => {
        const url = getBuildingModelUrl(cellIndex, 3);
        expect(url).toBe(`/models/landmarks/bld_c3_cell_${cellIndex}.glb`);
      }
    );

    it('[TC-203.04/MSS][UC-IMP203] getBuildingModelUrl(0, 1) for GO tile returns null', () => {
      const url = getBuildingModelUrl(0, 1);
      expect(url).toBeNull();
    });

    it('[TC-203.05/MSS][UC-IMP203] getBuildingModelUrl(10, 2) for Jail/Audit tile returns null', () => {
      const url = getBuildingModelUrl(10, 2);
      expect(url).toBeNull();
    });
  });

  // =========================================================================
  // FACET 2: BOUNDING BOX & SPATIAL CLEARANCE INVARIANTS
  // =========================================================================
  describe('Facet 2: Bounding Box & Spatial Clearance Invariants', () => {
    it('[TC-203.06/MSS][UC-IMP203] Standard building plinth width equals 0.55m and stays strictly within 0.60m ceiling', () => {
      expect(BUILDING_BASE_PLINTH_WIDTH).toBe(0.55);
      expect(BUILDING_BASE_PLINTH_WIDTH).toBeLessThan(0.60);
    });

    it('[TC-203.07/MSS][UC-IMP203] Spatial clearance between plinth boundary and ToyPropertyBuildings at Z=-0.80m is >= 0.25m', () => {
      const toyZ = -0.80;
      const plinthHalfZ = BUILDING_BASE_PLINTH_WIDTH / 2;
      const clearanceZ = Math.abs(toyZ) - plinthHalfZ;
      expect(clearanceZ).toBeCloseTo(0.525, 3);
      expect(clearanceZ).toBeGreaterThanOrEqual(0.25);
    });

    it('[TC-203.08/MSS][UC-IMP203] Spatial clearance between plinth boundary and FlagPole at X=0.62m is >= 0.15m', () => {
      const flagPoleX = 0.62;
      const plinthHalfX = BUILDING_BASE_PLINTH_WIDTH / 2;
      const clearanceX = flagPoleX - plinthHalfX;
      expect(clearanceX).toBeCloseTo(0.345, 3);
      expect(clearanceX).toBeGreaterThanOrEqual(0.15);
    });
  });

  // =========================================================================
  // FACET 3: PERSISTENT TACTILE ANCHORS INVARIANT (3 MỎ NEO BẤT BIẾN CẤP 3)
  // =========================================================================
  describe('Facet 3: Persistent Tactile Anchors Invariant', () => {
    it('[TC-203.09/MSS][UC-IMP203] Anchor 1: Level 3 ProceduralBuilding renders gold-plated base trim RoundedBox [0.57, 0.02, 0.57] with #F59E0B', () => {
      const html = renderToStaticMarkup(
        React.createElement(ProceduralBuilding, { level: 3, cellIndex: 1 })
      );
      expect(html).toContain('0.57,0.02,0.57');
      expect(html).toContain('#F59E0B');
    });

    it('[TC-203.10/MSS][UC-IMP203] Anchor 2: Level 3 ProceduralBuilding renders rotating jewel crown crownRef with #F59E0B at height Y >= 1.0m', () => {
      const html = renderToStaticMarkup(
        React.createElement(ProceduralBuilding, { level: 3, cellIndex: 1 })
      );
      const crownMatch =
        html.match(/data-testid="landmark-crown"[^>]*position="[^,]+,([^,]+),[^"]+"/i) ||
        html.match(/position="[^,]+,([^,]+),[^"]+"[^>]*>[\s\S]*?(?:cylindergeometry|crown)[\s\S]*?#F59E0B/i);
      const crownY = crownMatch ? parseFloat(crownMatch[1] ?? '0') : 0;
      expect(crownY).toBeGreaterThanOrEqual(1.0);
    });

    it('[TC-203.11/MSS][UC-IMP203] Anchor 3: ToyPropertyBuildings at level 3 renders Ruby Red #DC2626 ToyHotelMesh on tile color strip', () => {
      const html = renderToStaticMarkup(
        React.createElement(ToyPropertyBuildings, { level: 3 })
      );
      expect(html).toContain('data-testid="toy-hotel"');
      expect(html).toContain('#DC2626');
    });

    it('[TC-203.21/MSS][UC-IMP203] Level 3 ProceduralBuilding strictly positions root group at building lot transform position (Z <= -1.30m), never at tile center [0, 0, 0]', () => {
      const htmlCell1 = renderToStaticMarkup(
        React.createElement(ProceduralBuilding, { level: 3, cellIndex: 1 })
      );
      const htmlCell39 = renderToStaticMarkup(
        React.createElement(ProceduralBuilding, { level: 3, cellIndex: 39 })
      );
      const htmlCell18 = renderToStaticMarkup(
        React.createElement(ProceduralBuilding, { level: 3, cellIndex: 18 })
      );

      // Must have explicit position attribute matching lotTransform (not stripped or converted to position-x)
      expect(htmlCell1).toMatch(/<group[^>]*position="-0\.24,0\.16,-1\.38"/);
      expect(htmlCell39).toMatch(/<group[^>]*position="0\.24,0\.16,-1\.38"/);
      expect(htmlCell18).toMatch(/<group[^>]*position="0,0\.16,-1\.38"/);
    });
  });

  // =========================================================================
  // FACET 4: LANDMARK REGISTRY & 22 BESPOKE ARCHITECTURE SSOT
  // =========================================================================
  describe('Facet 4: Landmark Registry & 22 Bespoke Architecture SSOT', () => {
    it('[TC-203.12/MSS][UC-IMP203] LANDMARK_REGISTRY contains exactly all 22 buyable property cell indices', async () => {
      const mod = await loadLandmarkRegistryModule();
      const registry = mod?.LANDMARK_REGISTRY;
      expect(registry).toBeDefined();
      const keys = Object.keys(registry || {}).map(Number).sort((a, b) => a - b);
      expect(keys).toEqual([...BUYABLE_CELL_INDICES]);
    });

    it('[TC-203.13a/MSS][UC-IMP203] Cell 1 maps to Dinh Thự Cổ Bình Thủy (Cần Thơ)', async () => {
      const mod = await loadLandmarkRegistryModule();
      const entry = mod?.LANDMARK_REGISTRY?.[1];
      expect(entry).toBeDefined();
      expect(entry?.name).toContain('Bình Thủy');
    });

    it('[TC-203.13b/MSS][UC-IMP203] Cell 18 maps to Lầu Ngũ Phụng - Ngọ Môn (Huế)', async () => {
      const mod = await loadLandmarkRegistryModule();
      const entry = mod?.LANDMARK_REGISTRY?.[18];
      expect(entry).toBeDefined();
      expect(entry?.name).toContain('Ngọ Môn');
    });

    it('[TC-203.13c/MSS][UC-IMP203] Cell 39 maps to Tháp Bitexco Búp Sen (Quận 1)', async () => {
      const mod = await loadLandmarkRegistryModule();
      const entry = mod?.LANDMARK_REGISTRY?.[39];
      expect(entry).toBeDefined();
      expect(entry?.name).toContain('Bitexco');
    });

    it.each([1, 3, 6, 18, 27, 39] as const)(
      '[TC-203.14/MSS][UC-IMP203] Landmark registry entry for cell %i specifies name, typology, and /models/landmarks/bld_c3_cell_%i.glb',
      async (cellIndex) => {
        const mod = await loadLandmarkRegistryModule();
        const entry = mod?.LANDMARK_REGISTRY?.[cellIndex];
        expect(entry).toBeDefined();
        expect(entry?.modelUrl).toBe(`/models/landmarks/bld_c3_cell_${cellIndex}.glb`);
        expect(entry?.typology).toBeDefined();
      }
    );

    it('[TC-203.15a/MSS][UC-IMP203] getLandmarkInfo returns valid descriptor for registered property cell 1', async () => {
      const mod = await loadLandmarkRegistryModule();
      const info = mod?.getLandmarkInfo ? mod.getLandmarkInfo(1) : undefined;
      expect(info).toBeDefined();
      expect(info?.name).toContain('Bình Thủy');
    });

    it('[TC-203.15b/MSS][UC-IMP203] getLandmarkInfo returns undefined for non-property cell 0 (GO) and 10 (Jail)', async () => {
      const mod = await loadLandmarkRegistryModule();
      const info0 = mod?.getLandmarkInfo ? mod.getLandmarkInfo(0) : undefined;
      const info10 = mod?.getLandmarkInfo ? mod.getLandmarkInfo(10) : undefined;
      expect(info0).toBeUndefined();
      expect(info10).toBeUndefined();
    });
  });

  // =========================================================================
  // FACET 5: ZERO-CRASH FALLBACK & HEADLESS RESILIENCE
  // =========================================================================
  describe('Facet 5: Zero-Crash Fallback & Headless Resilience', () => {
    it('[TC-203.16/MSS][UC-IMP203] BespokeLandmarkFallback renders safely without crash for cell 1', async () => {
      const Fallback = await loadBespokeLandmarkFallbackComponent();
      expect(Fallback).toBeDefined();
      const html = renderToStaticMarkup(
        React.createElement(Fallback!, { cellIndex: 1, isNight: false, isSunset: false })
      );
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    it('[TC-203.17/MSS][UC-IMP203] BespokeLandmarkFallback renders safely without crash for cell 39', async () => {
      const Fallback = await loadBespokeLandmarkFallbackComponent();
      expect(Fallback).toBeDefined();
      const html = renderToStaticMarkup(
        React.createElement(Fallback!, { cellIndex: 39, isNight: false, isSunset: false })
      );
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    it('[TC-203.18/MSS][UC-IMP203] BespokeLandmarkFallback reacts to isNight=true with elevated emissive illumination', async () => {
      const Fallback = await loadBespokeLandmarkFallbackComponent();
      expect(Fallback).toBeDefined();
      const html = renderToStaticMarkup(
        React.createElement(Fallback!, { cellIndex: 1, isNight: true, isSunset: false })
      );
      expect(html).toMatch(/emissive/i);
    });

    it('[TC-203.19/MSS][UC-IMP203] BespokeLandmarkFallback reacts to isSunset=true with warm dusk emissive illumination', async () => {
      const Fallback = await loadBespokeLandmarkFallbackComponent();
      expect(Fallback).toBeDefined();
      const html = renderToStaticMarkup(
        React.createElement(Fallback!, { cellIndex: 1, isNight: false, isSunset: true })
      );
      expect(html).toMatch(/emissive/i);
    });

    it('[TC-203.20/MSS][UC-IMP203] SafeGLTFModel employs BespokeLandmarkFallback as procedural standby when level=3 GLTF is loading', () => {
      const html = renderToStaticMarkup(
        React.createElement(ProceduralBuilding, { level: 3, cellIndex: 1 })
      );
      expect(html).toMatch(/data-testid="bespoke-landmark-fallback"|data-testid="landmark-fallback-1"/);
    });
  });
});
