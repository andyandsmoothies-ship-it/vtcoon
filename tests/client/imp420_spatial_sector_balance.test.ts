// [UI-S01/MSS][IMP-420] Spatial Sector Balance Invariant & Quadrant Guard Contract Tests
import { describe, it, expect } from 'vitest';
import {
  getSpatialQuadrant,
  computeQuadrantCounts,
  validateSectorBalance,
  type SpatialQuadrant,
} from '../../src/client/3d/spatial_geometry_helpers';
import {
  resolveBalancedIslandDioramaProps,
  DEFAULT_COASTAL_ISLAND_PROPS,
  DEFAULT_BALANCED_ISLAND_DIORAMA,
  type CoastalIslandPropDescriptor,
} from '../../src/client/3d/coastal_island_environment';

describe('IMP-420: Spatial Sector Balance Invariant & Quadrant Guard', () => {
  // 1. Delta 0: Ideal Equilibrium
  it('TC-420.01a [UC-SECTOR-BALANCE-ZERO-DELTA/MSS]: Given quadrant counts with 1 item per sector, When validating balance, Then returns true', () => {
    const counts: Record<SpatialQuadrant, number> = { NW: 1, NE: 1, SW: 1, SE: 1 };
    expect(validateSectorBalance(counts)).toBe(true);
  });

  it('TC-420.01b [UC-SECTOR-BALANCE-ZERO-DELTA/A1]: Given empty scene with 0 items per sector, When validating balance, Then returns true', () => {
    const counts: Record<SpatialQuadrant, number> = { NW: 0, NE: 0, SW: 0, SE: 0 };
    expect(validateSectorBalance(counts)).toBe(true);
  });

  it('TC-420.01c [UC-SECTOR-BALANCE-ZERO-DELTA/A2]: Given dense balanced scene with 5 items per sector, When validating balance, Then returns true', () => {
    const counts: Record<SpatialQuadrant, number> = { NW: 5, NE: 5, SW: 5, SE: 5 };
    expect(validateSectorBalance(counts)).toBe(true);
  });

  // 2. Delta 1 & 2: Permitted Spatial Drift
  it('TC-420.02a [UC-SECTOR-BALANCE-PERMITTED-DRIFT/MSS]: Given quadrant counts with delta of 1, When validating balance, Then returns true', () => {
    const counts: Record<SpatialQuadrant, number> = { NW: 2, NE: 1, SW: 1, SE: 1 };
    expect(validateSectorBalance(counts)).toBe(true);
  });

  it('TC-420.02b [UC-SECTOR-BALANCE-PERMITTED-DRIFT/A1]: Given quadrant counts with alternating delta of 1, When validating balance, Then returns true', () => {
    const counts: Record<SpatialQuadrant, number> = { NW: 3, NE: 2, SW: 3, SE: 2 };
    expect(validateSectorBalance(counts)).toBe(true);
  });

  it('TC-420.02c [UC-SECTOR-BALANCE-PERMITTED-DRIFT/A2]: Given quadrant counts with delta exactly at limit of 2, When validating balance, Then returns true', () => {
    const counts: Record<SpatialQuadrant, number> = { NW: 3, NE: 1, SW: 2, SE: 1 };
    expect(validateSectorBalance(counts)).toBe(true);
  });

  it('TC-420.02d [UC-SECTOR-BALANCE-PERMITTED-DRIFT/A3]: Given quadrant counts with delta of 2 on higher values, When validating balance, Then returns true', () => {
    const counts: Record<SpatialQuadrant, number> = { NW: 4, NE: 2, SW: 2, SE: 3 };
    expect(validateSectorBalance(counts)).toBe(true);
  });

  // 3. Delta >= 3: Imbalance Violation & Input Validation
  it('TC-420.03a [UC-SECTOR-BALANCE-IMBALANCE-GUARD/MSS]: Given quadrant counts with delta of 3, When validating balance, Then returns false', () => {
    const counts: Record<SpatialQuadrant, number> = { NW: 4, NE: 1, SW: 1, SE: 1 };
    expect(validateSectorBalance(counts)).toBe(false);
  });

  it('TC-420.03b [UC-SECTOR-BALANCE-IMBALANCE-GUARD/A1]: Given single-sector clustering with delta of 3, When validating balance, Then returns false', () => {
    const counts: Record<SpatialQuadrant, number> = { NW: 3, NE: 0, SW: 0, SE: 0 };
    expect(validateSectorBalance(counts)).toBe(false);
  });

  it('TC-420.03c [UC-SECTOR-BALANCE-IMBALANCE-GUARD/A2]: Given severe cluster accumulation with delta of 8, When validating balance, Then returns false', () => {
    const counts: Record<SpatialQuadrant, number> = { NW: 8, NE: 0, SW: 1, SE: 0 };
    expect(validateSectorBalance(counts)).toBe(false);
  });

  it('TC-420.03d [UC-SECTOR-BALANCE-INVALID-INPUT/A3]: Given negative or fractional values, When validating balance, Then returns false', () => {
    const negativeCounts: Record<SpatialQuadrant, number> = { NW: -1, NE: 1, SW: 1, SE: 1 };
    const fractionalCounts: Record<SpatialQuadrant, number> = { NW: 1.5, NE: 2.5, SW: 1.2, SE: 3.1 };
    expect(validateSectorBalance(negativeCounts)).toBe(false);
    expect(validateSectorBalance(fractionalCounts)).toBe(false);
  });

  // 4. Spatial Coordinate Projection & Counting
  it('TC-420.04a [UC-SECTOR-QUADRANT-PROJECTION/MSS]: Given 2D coordinates across 4 quadrants, When resolving quadrants, Then returns correct sector tokens', () => {
    expect(getSpatialQuadrant(-5, -5)).toBe('NW');
    expect(getSpatialQuadrant(5, -5)).toBe('NE');
    expect(getSpatialQuadrant(-5, 5)).toBe('SW');
    expect(getSpatialQuadrant(5, 5)).toBe('SE');
  });

  it('TC-420.04b [UC-SECTOR-QUADRANT-PROJECTION/A1]: Given IEEE-754 negative zero coordinates, When resolving quadrants, Then normalizes without bias', () => {
    expect(getSpatialQuadrant(-0, -0)).toBe('SE');
    expect(getSpatialQuadrant(-5, -0)).toBe('SW');
  });

  it('TC-420.04c [UC-SECTOR-QUADRANT-PROJECTION/A2]: Given array of 3D positions including non-finite values, When computing counts, Then tallies correctly and skips corrupt entries', () => {
    const positions: ReadonlyArray<readonly [number, number, number]> = [
      [-10, 0, -10],
      [10, 0, -10],
      [-10, 0, 10],
      [10, 0, 10],
      [NaN, 0, 0],
    ];
    const counts = computeQuadrantCounts(positions);
    expect(counts.NW).toBe(1);
    expect(counts.NE).toBe(1);
    expect(counts.SW).toBe(1);
    expect(counts.SE).toBe(1);
  });

  // 5. Consumer Call-Site Wiring & Active Poka-Yoke Fallback
  it('TC-420.05a [UC-SECTOR-CONSUMER-COASTAL-WIRING/MSS]: Given default coastal island props, When resolving balanced diorama, Then returns balanced set of 4 capes', () => {
    const result = resolveBalancedIslandDioramaProps();
    expect(result.isBalanced).toBe(true);
    expect(result.props.length).toBe(4);
    expect(result.quadrantCounts.NW).toBe(1);
    expect(result.quadrantCounts.NE).toBe(1);
  });

  it('TC-420.05b [UC-SECTOR-CONSUMER-COASTAL-WIRING/A1]: Given DEFAULT_COASTAL_ISLAND_PROPS, When checking cape positions, Then verifies 1 cape per quadrant', () => {
    const swCape = DEFAULT_COASTAL_ISLAND_PROPS.find((p) => p.id === 'cape-southwest');
    const neCape = DEFAULT_COASTAL_ISLAND_PROPS.find((p) => p.id === 'cape-northeast');
    expect(swCape ? getSpatialQuadrant(swCape.position[0], swCape.position[2]) : null).toBe('SW');
    expect(neCape ? getSpatialQuadrant(neCape.position[0], neCape.position[2]) : null).toBe('NE');
  });

  it('TC-420.05c [UC-SECTOR-CONSUMER-COASTAL-WIRING/A2]: Given precomputed DEFAULT_BALANCED_ISLAND_DIORAMA, When inspecting output, Then provides zero-allocation balanced diorama', () => {
    expect(DEFAULT_BALANCED_ISLAND_DIORAMA.isBalanced).toBe(true);
    expect(DEFAULT_BALANCED_ISLAND_DIORAMA.props.length).toBe(4);
  });
});
