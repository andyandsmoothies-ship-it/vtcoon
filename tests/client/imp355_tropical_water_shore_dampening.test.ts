// [UC-DAMP/MSS][IMP-355] Contract Test Suite: Tropical Water Shore Dampening & Tabletop Wave Clipping Prevention
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Chebyshev Metric Math): calculateShoreDampening returns 0.0 at center, edges, and corners (<= 9.6m), 1.0 in open ocean (>= 12.0m)
// Facet 2 (Corner Protection Parity): Diagonal corner (9.6, 9.6) produces boxDist 9.6 -> 0.0 dampening, proving corner safety over radial metric
// Facet 3 (Vertex Shader Contract): TROPICAL_WATER_VERTEX_SHADER embeds Chebyshev metric and smoothstep dampening
// Facet 4 (Depth & Plinth Integrity): GameBoard preserves standard depthWrite and WALNUT_TABLE_Y -0.350 without material hacks

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  TROPICAL_WATER_VERTEX_SHADER,
  calculateDepthBlend,
  calculateWaterWaveOffset,
  createTropicalWaterUniforms,
  calculateFresnelFactor,
  lerpWaterColor,
} from '../../src/client/3d/shaders/tropical_water_material';
import { Color, Vector3 } from 'three';
import { GameBoard, WALNUT_TABLE_Y, DEPTH_LAYER_STACK } from '../../src/client/3d/board_layout';

// Safe dynamic accessor to verify calculateShoreDampening without compilation crash before Station 2
import * as shaderMod from '../../src/client/3d/shaders/tropical_water_material';

const getShoreDampeningFn = (): ((x: number, y: number, inner?: number, outer?: number) => number) | undefined => {
  return (shaderMod as Record<string, unknown>).calculateShoreDampening as
    | ((x: number, y: number, inner?: number, outer?: number) => number)
    | undefined;
};

describe('[UC-IMP355/MSS] Tropical Water Shore Dampening & Wave Clipping Prevention Contract Suite', () => {
  // =========================================================================
  // FACET 1: CHEBYSHEV METRIC MATH & BOUNDARY DAMPENING
  // =========================================================================
  describe('Facet 1: Chebyshev Metric Math & Boundary Dampening', () => {
    it('TC-355.01 [UC-DAMP/MSS]: Given coordinate at board origin 0 0, When evaluating calculateShoreDampening, Then returns exactly 0.0 dampening waves', () => {
      const fn = getShoreDampeningFn();
      expect(fn).toBeDefined();
      const val = fn ? fn(0, 0) : -1;
      expect(val).toBe(0.0);
    });

    it('TC-355.02 [UC-DAMP/A1]: Given coordinate at table edge 9.6 0, When evaluating calculateShoreDampening, Then returns exactly 0.0 preserving calm shoreline', () => {
      const fn = getShoreDampeningFn();
      expect(fn).toBeDefined();
      const val = fn ? fn(9.6, 0) : -1;
      expect(val).toBe(0.0);
    });

    it('TC-355.03 [UC-DAMP/A2]: Given coordinate at square table diagonal corner 9.6 9.6, When evaluating calculateShoreDampening, Then returns exactly 0.0 via Chebyshev box metric', () => {
      const fn = getShoreDampeningFn();
      expect(fn).toBeDefined();
      const val = fn ? fn(9.6, 9.6) : -1;
      expect(val).toBe(0.0);
    });

    it('TC-355.04 [UC-DAMP/A3]: Given coordinate in open ocean at 15.0 15.0, When evaluating calculateShoreDampening, Then returns exactly 1.0 full wave amplitude', () => {
      const fn = getShoreDampeningFn();
      expect(fn).toBeDefined();
      const val = fn ? fn(15.0, 15.0) : -1;
      expect(val).toBe(1.0);
    });

    it('TC-355.05 [UC-DAMP/A4]: Given intermediate coordinate at 10.8 0, When evaluating calculateShoreDampening, Then returns smoothstep transition between 0.0 and 1.0', () => {
      const fn = getShoreDampeningFn();
      expect(fn).toBeDefined();
      const val = fn ? fn(10.8, 0) : -1;
      expect(val).toBeGreaterThan(0.0);
      expect(val).toBeLessThan(1.0);
    });
  });

  // =========================================================================
  // FACET 2: VERTEX SHADER EMBEDDED CONTRACT
  // =========================================================================
  describe('Facet 2: Vertex Shader Embedded Contract', () => {
    it('TC-355.06 [UC-SHADER/MSS]: Given TROPICAL_WATER_VERTEX_SHADER definition, When inspecting shader source, Then contains boxDist Chebyshev metric and smoothstep shore dampening', () => {
      expect(TROPICAL_WATER_VERTEX_SHADER).toContain('boxDist = max(abs(');
      expect(TROPICAL_WATER_VERTEX_SHADER).toContain('smoothstep(9.6, 12.0, boxDist)');
      expect(TROPICAL_WATER_VERTEX_SHADER).toContain('* shoreDamp');
    });
  });

  // =========================================================================
  // FACET 3: DEPTH & PLINTH INTEGRITY (ANTI-REGRESSION)
  // =========================================================================
  describe('Facet 3: Depth & Plinth Integrity (Anti-Regression)', () => {
    it('TC-355.07 [UC-INTEGRITY/MSS]: Given GameBoard rendered in 3D viewport, When inspecting Walnut Tabletop meshStandardMaterial, Then preserves depthWrite true and WALNUT_TABLE_Y -0.350', () => {
      const html = renderToStaticMarkup(React.createElement(GameBoard));
      expect(html).not.toContain('depthwrite="false"');
      expect(WALNUT_TABLE_Y).toBe(-0.350);
      expect(DEPTH_LAYER_STACK.WALNUT_TABLE_Y).toBe(-0.350);
    });
  });

  // =========================================================================
  // FACET 4: PARITY CONTRACTS FOR EXPORTED SHADER UTILITIES
  // =========================================================================
  describe('Facet 4: Parity Contracts for Exported Shader Utilities', () => {
    it('TC-355.08 [UC-DEPTH-BLEND/MSS]: Given inner and outer distances, When evaluating calculateDepthBlend, Then returns normalized gradient between 0.0 and 1.0', () => {
      expect(calculateDepthBlend(5.0)).toBe(0.0);
      expect(calculateDepthBlend(39.8)).toBeCloseTo(0.5, 2);
      expect(calculateDepthBlend(80.0)).toBe(1.0);
    });

    it('TC-355.09 [UC-WAVE/MSS]: Given x y coordinates and elapsed time, When evaluating calculateWaterWaveOffset, Then returns harmonic wave displacement within amplitude bounds', () => {
      const offset = calculateWaterWaveOffset(0, 0, 0);
      expect(Math.abs(offset)).toBeLessThanOrEqual(0.055);
    });

    it('TC-355.10 [UC-UNIFORMS/MSS]: Given default environment initialization, When calling createTropicalWaterUniforms, Then instantiates valid uniform map', () => {
      const uniforms = createTropicalWaterUniforms();
      expect(uniforms.uTime).toBeDefined();
      expect(uniforms.uShallowColor).toBeDefined();
      expect(uniforms.uDeepColor).toBeDefined();
    });

    it('TC-355.11 [UC-FRESNEL/MSS]: Given view direction and normal vectors, When evaluating calculateFresnelFactor, Then returns valid optical reflectivity', () => {
      const viewDir = new Vector3(0, 1, 0);
      const normal = new Vector3(0, 1, 0);
      const factor = calculateFresnelFactor(viewDir, normal);
      expect(factor).toBe(0.0);
    });

    it('TC-355.12 [UC-COLOR-LERP/MSS]: Given source and target ocean colors, When calling lerpWaterColor, Then smoothly interpolates color channels', () => {
      const c1 = new Color('#000000');
      const c2 = new Color('#FFFFFF');
      const result = lerpWaterColor(c1, c2, 0.5);
      expect(result.r).toBeCloseTo(0.5, 2);
    });
  });
});
