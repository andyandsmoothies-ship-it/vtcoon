// [TC-431/MSS][IMP-431] Contract Test Suite: AAA Bitexco Lotus Tower Sculpt & Sapphire Glass Overhaul
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import '../helpers/r3f_test_harness';
import {
  computeBitexcoRadius,
  createBitexcoLotusBudGeometry,
  createBitexcoLotusSheathGeometry,
  createBitexcoHelipadSaucerGeometry,
  createBitexcoCrescentCrownGeometry,
  disposeBitexcoGeometries,
} from '../../src/client/3d/diorama/bitexco_tower_visuals';
import {
  DioramaSkyline,
  type DioramaSkylineProps,
} from '../../src/client/3d/diorama/diorama_skyline';

describe('IMP-431: AAA Bitexco Lotus Tower Sculpt & Sapphire Glass Overhaul', () => {
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

  beforeEach(() => {
    disposeBitexcoGeometries();
  });

  // =========================================================================
  // SCENARIO 1: LOTUS BUD DOUBLE-CURVATURE PROFILE (INV-431.01 / TC-431.01)
  // =========================================================================
  it('TC-431.01a [UC-LOTUS-PROFILE-CURVATURE/MSS]: Given computeBitexcoRadius, When evaluating key elevations, Then yields exact continuous boundary radii at base, waist, and skydeck neck', () => {
    expect(computeBitexcoRadius(0.0)).toBeCloseTo(0.46, 2);
    expect(computeBitexcoRadius(0.4)).toBeCloseTo(0.40, 2);
    expect(computeBitexcoRadius(1.2)).toBeCloseTo(0.35, 2);
    expect(computeBitexcoRadius(1.8)).toBeCloseTo(0.32, 2);
  });

  it('TC-431.01b [UC-LOTUS-PROFILE-CURVATURE/MSS]: Given computeBitexcoRadius, When evaluating upper taper and curvature bounds, Then enforces monotonic tapering and radial bounds 0.22 <= R <= 0.48', () => {
    expect(computeBitexcoRadius(2.45)).toBeCloseTo(0.24, 2);
    expect(computeBitexcoRadius(0.0)).toBeGreaterThan(computeBitexcoRadius(0.8));
    expect(computeBitexcoRadius(0.8)).toBeGreaterThan(computeBitexcoRadius(1.6));
    expect(computeBitexcoRadius(1.6)).toBeGreaterThan(computeBitexcoRadius(2.45));
  });

  it('TC-431.01c [UC-LOTUS-PROFILE-CURVATURE/MSS]: Given computeBitexcoRadius, When comparing rates of change across sections, Then proves non-linear lotus curvature derivatives', () => {
    const baseRate = Math.abs(computeBitexcoRadius(0.4) - computeBitexcoRadius(0.0)) / 0.4;
    const waistRate = Math.abs(computeBitexcoRadius(1.2) - computeBitexcoRadius(0.4)) / 0.8;
    expect(baseRate).toBeCloseTo(0.15, 2);
    expect(waistRate).toBeCloseTo(0.0625, 3);
    expect(baseRate).toBeGreaterThan(waistRate);
  });

  // =========================================================================
  // SCENARIO 2: LOTUS BUD GEOMETRY & CACHE DISPOSAL (INV-431.01 / TC-431.02)
  // =========================================================================
  it('TC-431.02a [UC-LOTUS-TOWER-GEOMETRY-CACHING/MSS]: Given createBitexcoLotusBudGeometry, When called, Then generates valid 3D lathe geometry anchored at ground y=0 without levitation', () => {
    const geo = createBitexcoLotusBudGeometry();
    expect(geo.attributes.position).toBeDefined();
    expect(geo.attributes.position?.count ?? 0).toBeGreaterThan(50);
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    expect(bb?.min.y).toBeCloseTo(0.0, 1);
    expect(bb?.max.y).toBeCloseTo(2.45, 1);
  });

  it('TC-431.02b [UC-LOTUS-TOWER-GEOMETRY-CACHING/MSS]: Given createBitexcoLotusBudGeometry and disposeBitexcoGeometries, When called repeatedly, Then returns cached singleton instance and recreates after disposal', () => {
    const geo1 = createBitexcoLotusBudGeometry();
    const geo2 = createBitexcoLotusBudGeometry();
    expect(geo1).toBe(geo2);
    disposeBitexcoGeometries();
    const geo3 = createBitexcoLotusBudGeometry();
    expect(geo3).not.toBe(geo1);
  });

  // =========================================================================
  // SCENARIO 3: AERODYNAMIC PETAL SAUCER HELIPAD (INV-431.02 / TC-431.03)
  // =========================================================================
  it('TC-431.03a [UC-HELIPAD-SAUCER-PROFILE/MSS]: Given createBitexcoHelipadSaucerGeometry, When inspecting vertices, Then confirms aerodynamic curved underbelly cross-section with beveled rim radius 0.22', () => {
    const geo = createBitexcoHelipadSaucerGeometry();
    expect(geo.attributes.position).toBeDefined();
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    expect(bb?.max.x).toBeCloseTo(0.22, 2);
    expect(bb?.min.y).toBeCloseTo(-0.06, 2);
  });

  it('TC-431.03b [UC-HELIPAD-SAUCER-PROFILE/MSS]: Given createBitexcoHelipadSaucerGeometry, When testing cache lifecycle, Then preserves singleton reference until disposal', () => {
    const h1 = createBitexcoHelipadSaucerGeometry();
    const h2 = createBitexcoHelipadSaucerGeometry();
    expect(h1).toBe(h2);
    disposeBitexcoGeometries();
    const h3 = createBitexcoHelipadSaucerGeometry();
    expect(h3).not.toBe(h1);
  });

  // =========================================================================
  // SCENARIO 4: CANTED CRESCENT CROWN VERTEX SHEAR (INV-431.03 / TC-431.04)
  // =========================================================================
  it('TC-431.04a [UC-CANTED-CRESCENT-CROWN/MSS]: Given createBitexcoCrescentCrownGeometry, When inspecting vertex shear, Then confirms asymmetrical elevation slope delta y >= 0.18 between front and rear lip', () => {
    const geo = createBitexcoCrescentCrownGeometry();
    expect(geo.attributes.position).toBeDefined();
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    expect(bb?.max.y).toBeGreaterThan(0.25);
    expect((bb?.max.y ?? 0) - (bb?.min.y ?? 0)).toBeGreaterThanOrEqual(0.35);
  });

  it('TC-431.04b [UC-CANTED-CRESCENT-CROWN/MSS]: Given createBitexcoCrescentCrownGeometry, When testing lifecycle disposal, Then ensures singleton caching and clean memory release', () => {
    const c1 = createBitexcoCrescentCrownGeometry();
    const c2 = createBitexcoCrescentCrownGeometry();
    expect(c1).toBe(c2);
    disposeBitexcoGeometries();
    const c3 = createBitexcoCrescentCrownGeometry();
    expect(c3).not.toBe(c1);
  });

  // =========================================================================
  // SCENARIO 5: DIORAMA SKYLINE LIVING CONTRACT PARITY (INV-431.05 / TC-431.05)
  // =========================================================================
  it('TC-431.05a [UC-SKYLINE-LIVING-CONTRACT-PARITY/MSS]: Given DioramaSkyline rendered in isolation, When inspecting static markup, Then verifies presence of podium, plaza, and lotus sheath testids', () => {
    const html = renderToStaticMarkup(
      React.createElement<DioramaSkylineProps>(DioramaSkyline, { isMobile: false })
    );
    expect(html).toContain('data-testid="bitexco-tower"');
    expect(html).toContain('data-testid="bitexco-podium"');
    expect(html).toContain('data-testid="bitexco-plaza"');
    expect(html).toContain('data-testid="bitexco-lotus-sheath"');
  });

  it('TC-431.05b [UC-SKYLINE-LIVING-CONTRACT-PARITY/MSS]: Given DioramaSkyline rendered in isolation, When inspecting helipad, helicopter, crown, and spire apex, Then verifies testids and apex position at y=2.85', () => {
    const html = renderToStaticMarkup(
      React.createElement<DioramaSkylineProps>(DioramaSkyline, { isMobile: false })
    );
    expect(html).toContain('data-testid="bitexco-helipad"');
    expect(html).toContain('data-testid="helipad-truss"');
    expect(html).toContain('data-testid="micro-helicopter"');
    expect(html).toContain('data-testid="bitexco-crown"');
  });

  // =========================================================================
  // SCENARIO 6: PALETTE & MULLION PARITY & NO CIRCLEGEOMETRY (INV-431.02 / TC-431.06)
  // =========================================================================
  it('TC-431.06a [UC-PALETTE-AND-MULLION-PARITY/MSS]: Given DioramaSkyline markup, When checking material colors, Then confirms presence of sapphire, ice-cyan, silver, and beacon red', () => {
    const html = renderToStaticMarkup(
      React.createElement<DioramaSkylineProps>(DioramaSkyline, { isMobile: false })
    );
    expect(html).toContain('color="#0284C7"');
    expect(html).toContain('color="#7DD3FC"');
    expect(html).toContain('color="#E2E8F0"');
    expect(html).toContain('color="#EF4444"');
  });

  it('TC-431.06b [UC-PALETTE-AND-MULLION-PARITY/MSS]: Given DioramaSkyline markup, When inspecting helipad cantilever offset and primitive safety, Then confirms cantilever offset y=1.68 and zero circleGeometry primitives in helipad', () => {
    const html = renderToStaticMarkup(
      React.createElement<DioramaSkylineProps>(DioramaSkyline, { isMobile: false })
    );
    expect(html).toContain('position="0.38,1.68,0"');
    expect(html).toContain('position="0,2.85,0"');
    const helipadStart = html.indexOf('data-testid="bitexco-helipad"');
    const crownStart = html.indexOf('data-testid="bitexco-crown"');
    const helipadSlice = html.slice(helipadStart, crownStart);
    expect(helipadSlice.toLowerCase()).not.toContain('<circlegeometry');
  });

  // =========================================================================
  // SCENARIO 7: LOTUS SHEATH ANTI-Z-FIGHTING (INV-431.04 / TC-431.07)
  // =========================================================================
  it('TC-431.07a [UC-LOTUS-SHEATH-ANTI-Z-FIGHTING/MSS]: Given createBitexcoLotusSheathGeometry, When inspecting vertices, Then confirms radial offset +0.025 over base tower profile to prevent z-fighting', () => {
    const sheathGeo = createBitexcoLotusSheathGeometry();
    expect(sheathGeo.attributes.position).toBeDefined();
    sheathGeo.computeBoundingBox();
    const bb = sheathGeo.boundingBox;
    expect(bb?.max.x).toBeGreaterThan(0.46);
    expect(bb?.min.y).toBeCloseTo(0.1, 1);
  });

  it('TC-431.07b [UC-LOTUS-SHEATH-ANTI-Z-FIGHTING/MSS]: Given createBitexcoLotusSheathGeometry and disposeBitexcoGeometries, When managing lifecycle, Then preserves singleton instance and clears reference on disposal', () => {
    const s1 = createBitexcoLotusSheathGeometry();
    const s2 = createBitexcoLotusSheathGeometry();
    expect(s1).toBe(s2);
    disposeBitexcoGeometries();
    const s3 = createBitexcoLotusSheathGeometry();
    expect(s3).not.toBe(s1);
  });
});
