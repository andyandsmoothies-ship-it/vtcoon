// [IMP-338] Living Contract Suite: Ocean Overdraw Elimination & Proactive Thermal Pacing
// Rules: Detroit style, 1-4 asserts per it(), 0 loops in it(), Zero Dirty Casts, Seam Discipline
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi } from 'vitest';
import { CoastalIslandEnvironment } from '../../src/client/3d/coastal_island_environment';
import { TropicalWater } from '../../src/client/3d/tropical_water';
import { DPR_BOUNDS, PerfBudgetController } from '../../src/client/3d/perf_budget';
import type { ShaderMaterial, Color } from 'three';

type FrameCb = (state: unknown, delta: number) => void;
let registeredFrameCallback: FrameCb | null = null;

vi.mock('@react-three/fiber', () => ({
  useFrame: (cb: FrameCb) => {
    registeredFrameCallback = cb;
  },
}));

interface CapturedElement {
  type: unknown;
  props: Record<string, unknown>;
  key: string | null;
}

function isElementWithProps(val: unknown): val is CapturedElement {
  return typeof val === 'object' && val !== null && 'props' in val && typeof (val as { props: unknown }).props === 'object';
}

function findNode(
  node: CapturedElement | null,
  predicate: (n: CapturedElement) => boolean
): CapturedElement | null {
  if (!node) return null;
  if (predicate(node)) return node;
  const children = node.props.children;
  if (!children) return null;
  const list = Array.isArray(children) ? children : [children];
  let found: CapturedElement | null = null;
  list.forEach((child) => {
    if (!found && isElementWithProps(child)) {
      found = findNode(child, predicate);
    }
  });
  return found;
}

function captureTree<P extends object>(
  Component: (props: P) => React.ReactElement,
  props: P
): CapturedElement | null {
  let captured: CapturedElement | null = null;
  function Spy(): React.ReactElement {
    const result = Component(props);
    if (isElementWithProps(result)) {
      captured = result;
    }
    return React.createElement('div', null);
  }
  renderToStaticMarkup(React.createElement(Spy));
  return captured;
}

describe('Living Contract Suite: IMP-338 Ocean Overdraw Elimination & Proactive Thermal Pacing', () => {
  // =========================================================================
  // FACET 1: Ocean Overdraw Elimination in CoastalIslandEnvironment
  // =========================================================================
  describe('Facet 1: Ocean Overdraw Elimination (CoastalIslandEnvironment)', () => {
    it('TC-338.01 [UC-OCEAN/MSS]: Given CoastalIslandEnvironment rendered with isMobile true, When inspecting rendered child meshes, Then omits the middle ocean plane planeGeometry args={[180, 180, 32, 32]} to eliminate TBDR overdraw', () => {
      const tree = captureTree(CoastalIslandEnvironment, { isMobile: true });
      const middleMesh = findNode(tree, (n) => {
        const geom = findNode(n, (g) => {
          const args = g.props.args;
          return Array.isArray(args) && args[0] === 180 && args[1] === 180;
        });
        return Boolean(geom);
      });
      expect(middleMesh).toBeNull();
    });

    it('TC-338.02 [UC-OCEAN/A1]: Given CoastalIslandEnvironment rendered with isMobile false, When inspecting rendered child meshes, Then mounts the middle ocean plane planeGeometry args={[180, 180, 32, 32]} with color #0369A1 to preserve desktop visual fidelity', () => {
      const tree = captureTree(CoastalIslandEnvironment, { isMobile: false });
      const middleMesh = findNode(tree, (n) => {
        const geom = findNode(n, (g) => {
          const args = g.props.args;
          return Array.isArray(args) && args[0] === 180 && args[1] === 180;
        });
        return Boolean(geom);
      });
      expect(middleMesh).not.toBeNull();
      const material = findNode(middleMesh, (m) => m.props.color === '#0369A1');
      expect(material).not.toBeNull();
    });

    it('TC-338.03 [UC-OCEAN/A2]: Given CoastalIslandEnvironment rendered with default props, When inspecting rendered output, Then preserves Abyss box #0C4A6E and TropicalWater mesh', () => {
      const tree = captureTree(CoastalIslandEnvironment, {});
      const abyssMesh = findNode(tree, (n) => {
        const mat = findNode(n, (m) => m.props.color === '#0C4A6E');
        return Boolean(mat);
      });
      const waterNode = findNode(tree, (n) => n.props['data-testid'] === 'living-ocean-water' || n.props.testId === 'living-ocean-water');
      expect(abyssMesh).not.toBeNull();
      expect(waterNode).not.toBeNull();
    });
  });

  // =========================================================================
  // FACET 2: TropicalWater Shader Precision & Single-Layer Color Baking
  // =========================================================================
  describe('Facet 2: Single-Layer Ocean Color Baking & Material Precision (TropicalWater)', () => {
    it('TC-338.04 [UC-WATER/MSS]: Given TropicalWater rendered with isMobile true, When inspecting material properties via captureTree, Then configures precision highp on ShaderMaterial to prevent Android FP16 vertex jitter', () => {
      const tree = captureTree(TropicalWater, { isMobile: true });
      const mesh = findNode(tree, (n) => n.props['data-testid'] === 'living-ocean-water');
      const mat = mesh?.props.material as ShaderMaterial | undefined;
      const geom = mesh?.props.geometry as { parameters?: { widthSegments: number; heightSegments: number } } | undefined;
      expect(mat).toBeDefined();
      expect(mat?.precision).toBe('highp');
      expect([geom?.parameters?.widthSegments, geom?.parameters?.heightSegments]).toEqual([24, 24]);
    });

    it('TC-338.05 [UC-WATER/A1]: Given TropicalWater rendered with isMobile false, When inspecting material properties via captureTree, Then configures precision highp on ShaderMaterial for desktop fidelity', () => {
      const tree = captureTree(TropicalWater, { isMobile: false });
      const mesh = findNode(tree, (n) => n.props['data-testid'] === 'living-ocean-water');
      const mat = mesh?.props.material as ShaderMaterial | undefined;
      const geom = mesh?.props.geometry as { parameters?: { widthSegments: number; heightSegments: number } } | undefined;
      expect(mat).toBeDefined();
      expect(mat?.precision).toBe('highp');
      expect(geom?.parameters?.widthSegments).toBe(32);
    });

    it('TC-338.06 [UC-WATER/A2]: Given TropicalWater rendered with isMobile true in daytime phase, When evaluating initial deep ocean color, Then resolves #0369A1 synchronously on mount to eliminate color pop', () => {
      const tree = captureTree(TropicalWater, { isMobile: true });
      const mesh = findNode(tree, (n) => n.props['data-testid'] === 'living-ocean-water');
      const mat = mesh?.props.material as ShaderMaterial | undefined;
      const deepColor = mat?.uniforms?.uDeepColor?.value as Color | undefined;
      expect(deepColor).toBeDefined();
      expect(deepColor?.getHexString().toUpperCase()).toBe('0369A1');
    });

    it('TC-338.07 [UC-WATER/A3]: Given TropicalWater rendered with isMobile false in daytime phase, When evaluating target deep ocean color, Then resolves preset waterDeepColor #0284C7', () => {
      const tree = captureTree(TropicalWater, { isMobile: false });
      const mesh = findNode(tree, (n) => n.props['data-testid'] === 'living-ocean-water');
      const mat = mesh?.props.material as ShaderMaterial | undefined;
      const deepColor = mat?.uniforms?.uDeepColor?.value as Color | undefined;
      expect(deepColor).toBeDefined();
      expect(deepColor?.getHexString().toUpperCase()).toBe('0284C7');
    });

    it('TC-338.08 [UC-WATER/A4]: Given TropicalWater rendered with isMobile true, When inspecting vertexShader definition, Then contains uniform highp float uTime to prevent FP16 vertex wave stepping', () => {
      const tree = captureTree(TropicalWater, { isMobile: true });
      const mesh = findNode(tree, (n) => n.props['data-testid'] === 'living-ocean-water');
      const mat = mesh?.props.material as ShaderMaterial | undefined;
      expect(mat?.vertexShader).toContain('uniform highp float uTime;');
    });

    it('TC-338.09 [UC-WATER/A5]: Given TropicalWater rendered with isMobile true, When uTime nears 200*PI and frame advances, Then wraps modulo 200*PI to prevent FP16 degradation', () => {
      const tree = captureTree(TropicalWater, { isMobile: true });
      const mesh = findNode(tree, (n) => n.props['data-testid'] === 'living-ocean-water');
      const mat = mesh?.props.material as ShaderMaterial | undefined;
      expect(mat).toBeDefined();
      if (mat?.uniforms.uTime) {
        mat.uniforms.uTime.value = Math.PI * 200.0 - 0.05;
      }
      expect(registeredFrameCallback).not.toBeNull();
      registeredFrameCallback?.({}, 0.1);
      const finalTime = mat?.uniforms.uTime?.value as number;
      expect(finalTime).toBeLessThan(1.0);
      expect(finalTime).toBeGreaterThan(0.0);
    });
  });

  // =========================================================================
  // FACET 3: Proactive Thermal Pacing & Multi-Step Hysteresis (perf_budget.ts)
  // =========================================================================
  describe('Facet 3: Proactive Thermal Pacing & Multi-Step Hysteresis (perf_budget.ts)', () => {
    it('TC-338.10 [UC-PACING/MSS]: Given DPR_BOUNDS constant exported from perf_budget.ts, When inspecting MOBILE_MIN value, Then equals 0.75 for proactive thermal relief', () => {
      expect(DPR_BOUNDS.MOBILE_MIN).toBe(0.75);
    });

    it('TC-338.11 [UC-PACING/A1]: Given PerfBudgetController evaluated with isMobile true and degraded FPS from 1.0, When evaluating adaptive DPR calculation, Then steps down target DPR first to 0.85', () => {
      const controller = new PerfBudgetController();
      const result = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 35,
        currentDpr: 1.0,
        degradedDurationMs: 1500,
        optimalDurationMs: 0,
      });
      expect(result.shouldUpdate).toBe(true);
      expect(result.targetDpr).toBe(0.85);
      expect(result.reason).toBe('STEP_DOWN');
    });

    it('TC-338.12 [UC-PACING/A2]: Given PerfBudgetController evaluated with isMobile true and degraded FPS from 0.85, When evaluating adaptive DPR calculation, Then steps down target DPR to 0.75', () => {
      const controller = new PerfBudgetController();
      const result = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 35,
        currentDpr: 0.85,
        degradedDurationMs: 1500,
        optimalDurationMs: 0,
      });
      expect(result.shouldUpdate).toBe(true);
      expect(result.targetDpr).toBe(0.75);
      expect(result.reason).toBe('STEP_DOWN');
    });

    it('TC-338.13 [UC-PACING/A3]: Given PerfBudgetController evaluated with isMobile true and current DPR at 0.75, When evaluating adaptive DPR calculation with degraded FPS, Then clamps at 0.75 without dropping below mobile floor', () => {
      const controller = new PerfBudgetController();
      const result = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 25,
        currentDpr: 0.75,
        degradedDurationMs: 5000,
        optimalDurationMs: 0,
      });
      expect(result.shouldUpdate).toBe(false);
      expect(result.targetDpr).toBe(0.75);
      expect(result.reason).toBe('MAINTAIN');
    });

    it('TC-338.14 [UC-PACING/A4]: Given PerfBudgetController evaluated with isMobile true and recovering FPS from currentDpr 0.75, When optimalDurationMs is less than 6000ms, Then maintains 0.75 due to double damping hysteresis', () => {
      const controller = new PerfBudgetController();
      const result = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 58,
        currentDpr: 0.75,
        degradedDurationMs: 0,
        optimalDurationMs: 4500, // < 6000ms
      });
      expect(result.shouldUpdate).toBe(false);
      expect(result.targetDpr).toBe(0.75);
      expect(result.reason).toBe('MAINTAIN');
    });

    it('TC-338.15 [UC-PACING/A5]: Given PerfBudgetController evaluated with isMobile true and recovering FPS from currentDpr 0.75, When optimalDurationMs reaches 6000ms, Then steps up to 0.85', () => {
      const controller = new PerfBudgetController();
      const result = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 58,
        currentDpr: 0.75,
        degradedDurationMs: 0,
        optimalDurationMs: 6000,
      });
      expect(result.shouldUpdate).toBe(true);
      expect(result.targetDpr).toBe(0.85);
      expect(result.reason).toBe('STEP_UP');
    });

    it('TC-338.16 [UC-PACING/A6]: Given PerfBudgetController evaluated with isMobile true and isMotionActive true, When optimalDurationMs reaches 8000ms, Then maintains currentDpr without stepping up', () => {
      const controller = new PerfBudgetController();
      const result = controller.calculateAdaptiveDpr({
        isMobile: true,
        currentFps: 58,
        currentDpr: 0.75,
        isMotionActive: true,
        degradedDurationMs: 0,
        optimalDurationMs: 8000,
      });
      expect(result.shouldUpdate).toBe(false);
      expect(result.targetDpr).toBe(0.75);
      expect(result.reason).toBe('MAINTAIN');
    });
  });
});

