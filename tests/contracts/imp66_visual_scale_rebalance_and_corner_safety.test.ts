// [TC-66/MSS][IMP-66] Contract Test Suite: Visual Scale Rebalance & Corner Safety
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Pawn Model Scale (50% reduction from 1.25x to 0.625x)
// Facet 2: Building Scale (50% increase from 0.65x to 0.975x) & Safe Z Coordinate (-1.38m)
// Facet 3: Corner Splay & Clearance Invariant (D >= 0.85m, clear corridor >= 0.35m, lateral offset >= 0.22m, rotation >= 0.24 rad)
// Facet 4: Error Defense & Fallback Resilience (undefined cell fallback & graceful non-NaN coordinates)

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LuxuryPawnModel } from '../../src/client/3d/luxury_pawn_models';
import { getBuildingLotTransform } from '../../src/client/3d/procedural_building';
import { getBuildingWorldPosition } from '../../src/client/3d/construction_slam_vfx';

describe('[TC-66/MSS][IMP-66] Visual Scale Rebalance & Corner Safety Contract Suite', () => {
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
  // FACET 1: PAWN MODEL SCALE (50% REDUCTION TO 0.625x)
  // =========================================================================
  it.each([0, 1, 2, 3])(
    '[TC-66.01/MSS][IMP-66] LuxuryPawnModel slot %i renders with reduced scale 0.625,0.625,0.625',
    (slotIndex) => {
      const markup = renderToStaticMarkup(React.createElement(LuxuryPawnModel, { slotIndex }));
      expect(markup).toContain('scale="0.625,0.625,0.625"');
      expect(markup).not.toContain('scale="1.25,1.25,1.25"');
    }
  );

  it.each([-1, 4, 99])(
    '[TC-66.02/MSS][IMP-66] LuxuryPawnModel edge slot %i safely renders with 0.625x scale',
    (slotIndex) => {
      const markup = renderToStaticMarkup(React.createElement(LuxuryPawnModel, { slotIndex }));
      expect(markup).toContain('scale="0.625,0.625,0.625"');
    }
  );

  // =========================================================================
  // FACET 2: BUILDING SCALE (50% INCREASE TO 0.975x) & SAFE Z COORDINATE
  // =========================================================================
  it.each([3, 6, 13, 16, 23, 26, 32])(
    '[TC-66.03/MSS][IMP-66] Mid-side property tile %i lot scale is uniform 0.975x',
    (cellIndex) => {
      const transform = getBuildingLotTransform(cellIndex);
      expect(transform.scale).toEqual([0.975, 0.975, 0.975]);
    }
  );

  it.each([3, 6, 13, 16, 23, 26, 32])(
    '[TC-66.04/MSS][IMP-66] Mid-side property tile %i lot position Z coordinate is -1.38m',
    (cellIndex) => {
      const transform = getBuildingLotTransform(cellIndex);
      expect(transform.position[2]).toBeCloseTo(-1.38, 2);
      expect(transform.position[2]).toBeLessThanOrEqual(-1.36);
    }
  );

  it.each([3, 6, 13, 16, 23, 26, 32])(
    '[TC-66.05/MSS][IMP-66] Mid-side property tile %i plinth inner edge is safely <= -1.08m outside card',
    (cellIndex) => {
      const transform = getBuildingLotTransform(cellIndex);
      const innerEdge = transform.position[2] + (0.55 * transform.scale[2]) / 2;
      expect(innerEdge).toBeCloseTo(-1.112, 3);
      expect(innerEdge).toBeLessThanOrEqual(-1.08);
    }
  );

  // =========================================================================
  // FACET 3: CORNER SPLAY & CLEARANCE INVARIANT (D >= 0.85m, CORRIDOR >= 0.35m)
  // =========================================================================
  it.each([
    [1, 39],
    [9, 11],
    [19, 21],
    [29, 31],
  ])(
    '[TC-66.06/MSS][IMP-66] Corner pair (%i, %i) Euclidean distance D >= 0.85m (target ~0.933m)',
    (cellA, cellB) => {
      const bldA = getBuildingWorldPosition(cellA);
      const bldB = getBuildingWorldPosition(cellB);
      const dist = Math.hypot(bldA[0] - bldB[0], bldA[2] - bldB[2]);
      expect(dist).toBeGreaterThanOrEqual(0.85);
      expect(dist).toBeCloseTo(0.933, 2);
    }
  );

  it.each([
    [1, 39],
    [9, 11],
    [19, 21],
    [29, 31],
  ])(
    '[TC-66.07/MSS][IMP-66] Corner pair (%i, %i) clear corridor >= 0.35m (target ~0.397m)',
    (cellA, cellB) => {
      const bldA = getBuildingWorldPosition(cellA);
      const bldB = getBuildingWorldPosition(cellB);
      const dist = Math.hypot(bldA[0] - bldB[0], bldA[2] - bldB[2]);
      const corridor = dist - 0.55 * 0.975;
      expect(corridor).toBeGreaterThanOrEqual(0.35);
      expect(corridor).toBeCloseTo(0.397, 2);
    }
  );

  it.each([1, 9, 11, 19, 21, 29, 31, 39])(
    '[TC-66.08/MSS][IMP-66] Corner-adjacent tile %i applies splay lateral offset >= 0.22m (target 0.24m)',
    (cellIndex) => {
      const transform = getBuildingLotTransform(cellIndex);
      expect(Math.abs(transform.position[0])).toBeGreaterThanOrEqual(0.22);
      expect(Math.abs(transform.position[0])).toBeCloseTo(0.24, 2);
    }
  );

  it.each([1, 9, 11, 19, 21, 29, 31, 39])(
    '[TC-66.09/MSS][IMP-66] Corner-adjacent tile %i applies straight corner rotation [0, 0, 0] (no Y-axis tilt)',
    (cellIndex) => {
      const transform = getBuildingLotTransform(cellIndex);
      expect(transform.rotation).toEqual([0, 0, 0]);
      expect(transform.rotation[1]).toBe(0);
    }
  );

  // =========================================================================
  // FACET 4: ERROR DEFENSE & FALLBACK RESILIENCE
  // =========================================================================
  it('[TC-66.10/MSS][IMP-66] getBuildingLotTransform(undefined) returns standard transform at Z = -1.38m with scale 0.975x', () => {
    const transform = getBuildingLotTransform(undefined);
    expect(transform.scale).toEqual([0.975, 0.975, 0.975]);
    expect(transform.position[2]).toBeCloseTo(-1.38, 2);
  });

  it.each([-5, 40, 999, NaN])(
    '[TC-66.11/MSS][IMP-66] getBuildingWorldPosition gracefully handles invalid cell %s without NaN coordinates',
    (cellIndex) => {
      const pos = getBuildingWorldPosition(cellIndex);
      expect(pos.every(Number.isFinite)).toBe(true);
    }
  );

  it.each([0, 10, 20, 30])(
    '[TC-66.12/MSS][IMP-66] Non-property corner tile %i world position coordinates are finite',
    (cellIndex) => {
      const pos = getBuildingWorldPosition(cellIndex);
      expect(pos.every(Number.isFinite)).toBe(true);
    }
  );
});
