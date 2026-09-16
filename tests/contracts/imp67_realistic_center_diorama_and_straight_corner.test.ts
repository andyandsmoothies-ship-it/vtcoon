// [TC-67/MSS][IMP-67] Contract Test Suite: Straight Corner Alignment & Realistic Center Diorama
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Straight Corner Invariant (Không Nghiêng Góc 90 Độ)
// Facet 2: Elimination of Amusement Park & Carnival Elements
// Facet 3: Realistic Waterfront Park & Contemporary Civic Center
// Facet 4: Error Defense, SSR Safety & Fallbacks

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getBuildingLotTransform } from '../../src/client/3d/procedural_building';
import { getBuildingWorldPosition } from '../../src/client/3d/construction_slam_vfx';
import { MiniatureCityDiorama } from '../../src/client/3d/miniature_city_diorama';
import { DioramaSkyline } from '../../src/client/3d/diorama/diorama_skyline';

type AnyComponent = React.ComponentType<Record<string, unknown>>;

describe('[TC-67/MSS][IMP-67] Straight Corner Alignment & Realistic Center Diorama', () => {
  let originalConsoleError: typeof console.error;
  let miniatureMarkup = '';
  let skylineMarkup = '';
  let DioramaWaterfrontPark: AnyComponent | null = null;
  let DioramaCivicCenter: AnyComponent | null = null;

  beforeAll(async () => {
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

    miniatureMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    skylineMarkup = renderToStaticMarkup(React.createElement(DioramaSkyline));

    try {
      const parkMod = await import('../../src/client/3d/diorama/diorama_waterfront_park');
      DioramaWaterfrontPark = parkMod.DioramaWaterfrontPark;
    } catch {
      DioramaWaterfrontPark = null;
    }

    try {
      const civicMod = await import('../../src/client/3d/diorama/diorama_civic_center');
      DioramaCivicCenter = civicMod.DioramaCivicCenter;
    } catch {
      DioramaCivicCenter = null;
    }
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // =========================================================================
  // FACET 1: STRAIGHT CORNER INVARIANT (KHÔNG NGHIÊNG GÓC 90 ĐỘ)
  // =========================================================================
  it.each([1, 9, 11, 19, 21, 29, 31, 39])(
    '[TC-67.01/MSS][IMP-67] Corner tile %i transform rotation strictly equals [0, 0, 0] (no Y-axis tilt)',
    (cellIndex) => {
      const transform = getBuildingLotTransform(cellIndex);
      expect(transform.rotation).toEqual([0, 0, 0]);
      expect(transform.rotation[1]).toBe(0);
    }
  );

  it.each([1, 9, 11, 19, 21, 29, 31, 39])(
    '[TC-67.02/MSS][IMP-67] Corner tile %i maintains lateral offset |position[0]| between 0.20m and 0.25m',
    (cellIndex) => {
      const transform = getBuildingLotTransform(cellIndex);
      const absLateralOffset = Math.abs(transform.position[0]);
      expect(absLateralOffset).toBeGreaterThanOrEqual(0.2);
      expect(absLateralOffset).toBeLessThanOrEqual(0.25);
    }
  );

  it.each([1, 9, 11, 19, 21, 29, 31, 39])(
    '[TC-67.03/MSS][IMP-67] Corner tile %i has safe depth position[2] of -1.38m',
    (cellIndex) => {
      const transform = getBuildingLotTransform(cellIndex);
      expect(transform.position[2]).toBeCloseTo(-1.38, 2);
    }
  );

  it('[TC-67.04/MSS][IMP-67] Corner pair (1, 39) orthogonal clearance between X edges >= 0.08m without overlap', () => {
    const pos1 = getBuildingWorldPosition(1);
    const pos39 = getBuildingWorldPosition(39);
    const xClearance = Math.abs(pos39[0] - pos1[0]) - 0.55 * 0.975;
    expect(xClearance).toBeGreaterThanOrEqual(0.08);
  });

  it.each([
    [1, 39],
    [9, 11],
    [19, 21],
    [29, 31],
  ])(
    '[TC-67.05/MSS][IMP-67] Corner pair (%i, %i) maintains clear corridor >= 0.35m',
    (cellA, cellB) => {
      const posA = getBuildingWorldPosition(cellA);
      const posB = getBuildingWorldPosition(cellB);
      const dist = Math.hypot(posA[0] - posB[0], posA[2] - posB[2]);
      const corridor = dist - 0.55 * 0.975;
      expect(corridor).toBeGreaterThanOrEqual(0.35);
    }
  );

  // =========================================================================
  // FACET 2: ELIMINATION OF AMUSEMENT PARK & CARNIVAL ELEMENTS
  // =========================================================================
  it('[TC-67.06/MSS][IMP-67] MiniatureCityDiorama eliminates amusement park ferris wheel testid', () => {
    expect(miniatureMarkup).not.toContain('data-testid="diorama-ferris-wheel"');
  });

  it('[TC-67.07/MSS][IMP-67] MiniatureCityDiorama eliminates ferris wheel rainbow cabin palette (#8B5CF6)', () => {
    // #EC4899 is legitimately used by Shophouse Donut sign, while ferris wheel rainbow palette (#8B5CF6) is eliminated
    expect(miniatureMarkup).not.toContain('data-testid="diorama-ferris-wheel"');
    expect(miniatureMarkup).not.toContain('#8B5CF6');
  });

  it('[TC-67.08/MSS][IMP-67] MiniatureCityDiorama eliminates toy stadium in favor of contemporary civic architecture', () => {
    expect(miniatureMarkup).not.toContain('data-testid="diorama-stadium"');
  });

  it('[TC-67.09/MSS][IMP-67] DioramaSkyline eliminates nightclub laser disco scanning cone', () => {
    expect(skylineMarkup).not.toContain('0.006,0.035,2.4,6,1,true');
  });

  // =========================================================================
  // FACET 3: REALISTIC WATERFRONT PARK & CONTEMPORARY CIVIC CENTER
  // =========================================================================
  it('[TC-67.10/MSS][IMP-67] DioramaWaterfrontPark component is exported and defined', () => {
    expect(DioramaWaterfrontPark).toBeDefined();
    expect(typeof DioramaWaterfrontPark).toBe('function');
  });

  it('[TC-67.11/MSS][IMP-67] DioramaCivicCenter component is exported and defined', () => {
    expect(DioramaCivicCenter).toBeDefined();
    expect(typeof DioramaCivicCenter).toBe('function');
  });

  it('[TC-67.12/MSS][IMP-67] MiniatureCityDiorama incorporates DioramaWaterfrontPark with testid', () => {
    expect(miniatureMarkup).toContain('data-testid="diorama-waterfront-park"');
  });

  it('[TC-67.13/MSS][IMP-67] MiniatureCityDiorama incorporates DioramaCivicCenter with testid', () => {
    expect(miniatureMarkup).toContain('data-testid="diorama-civic-center"');
  });

  it('[TC-67.14/MSS][IMP-67] DioramaWaterfrontPark features lush green lawn parkland (#166534 or #15803D)', () => {
    const parkMarkup = DioramaWaterfrontPark
      ? renderToStaticMarkup(React.createElement(DioramaWaterfrontPark))
      : '';
    const hasGreenLawn = parkMarkup.includes('#166534') || parkMarkup.includes('#15803D');
    expect(hasGreenLawn).toBe(true);
  });

  it('[TC-67.15/MSS][IMP-67] DioramaWaterfrontPark features granite promenade pathways (#CBD5E1 or #94A3B8)', () => {
    const parkMarkup = DioramaWaterfrontPark
      ? renderToStaticMarkup(React.createElement(DioramaWaterfrontPark))
      : '';
    const hasGranite = parkMarkup.includes('#CBD5E1') || parkMarkup.includes('#94A3B8');
    expect(hasGranite).toBe(true);
  });

  it('[TC-67.16/MSS][IMP-67] DioramaCivicCenter features modern Low-E architectural glass (#0284C7)', () => {
    const civicMarkup = DioramaCivicCenter
      ? renderToStaticMarkup(React.createElement(DioramaCivicCenter))
      : '';
    expect(civicMarkup).toContain('#0284C7');
  });

  it('[TC-67.17/MSS][IMP-67] DioramaCivicCenter features contemporary slate and titanium stone cladding (#334155 or #E2E8F0)', () => {
    const civicMarkup = DioramaCivicCenter
      ? renderToStaticMarkup(React.createElement(DioramaCivicCenter))
      : '';
    const hasModernCladding = civicMarkup.includes('#334155') || civicMarkup.includes('#E2E8F0');
    expect(hasModernCladding).toBe(true);
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE, SSR SAFETY & FALLBACKS
  // =========================================================================
  it('[TC-67.18/MSS][IMP-67] getBuildingLotTransform(undefined) returns default lot transform with rotation [0, 0, 0]', () => {
    const transform = getBuildingLotTransform(undefined);
    expect(transform.rotation).toEqual([0, 0, 0]);
    expect(transform.scale).toEqual([0.975, 0.975, 0.975]);
  });

  it.each([-1, 40, 100])(
    '[TC-67.19/MSS][IMP-67] getBuildingLotTransform with out-of-bound cell %i defaults to rotation [0, 0, 0]',
    (cellIndex) => {
      const transform = getBuildingLotTransform(cellIndex);
      expect(transform.rotation).toEqual([0, 0, 0]);
    }
  );

  it('[TC-67.20/MSS][IMP-67] DioramaWaterfrontPark renders safely in Node.js headless environment without throwing', () => {
    expect(() => {
      if (!DioramaWaterfrontPark) throw new Error('DioramaWaterfrontPark not implemented');
      renderToStaticMarkup(React.createElement(DioramaWaterfrontPark));
    }).not.toThrow();
  });

  it('[TC-67.21/MSS][IMP-67] DioramaCivicCenter renders safely in Node.js headless environment without throwing', () => {
    expect(() => {
      if (!DioramaCivicCenter) throw new Error('DioramaCivicCenter not implemented');
      renderToStaticMarkup(React.createElement(DioramaCivicCenter));
    }).not.toThrow();
  });

  it.each([0, 10, 20, 30])(
    '[TC-67.22/MSS][IMP-67] Non-property corner tile %i world coordinates remain finite numbers',
    (cornerCell) => {
      const pos = getBuildingWorldPosition(cornerCell);
      expect(pos.every(Number.isFinite)).toBe(true);
    }
  );
});
