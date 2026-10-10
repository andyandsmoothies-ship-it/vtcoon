// [UC-IMP357/MSS] Living Contract Suite: Android WebGL 3D Diagnostic HUD, Float Precision & Depth Buffer Stabilization
// Universal 5-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): Chebyshev shoreline dampening with wave displacement zero at perimeter
// Facet 2 (State Reactivity & Cycle Teardown): Store toggles invert state cleanly with ephemeral reset
// Facet 3 (Resource Disposal & Timer Isolation): modulo 20*PI phase bound preventing 16-bit float jitter
// Facet 4 (Error Defense & Terminal Invariants): Transient unmount group containment upholding R3F invariant
// Facet 5 (Cross-Coupling Blast Radius): GameBoard isolation toggles and Diagnostic3DPanel mounting

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { isValidElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ShaderMaterial } from 'three';
import { useDiagnostic3DStore } from '../../src/client/3d/diagnostic_3d_store';
import { Diagnostic3DPanel } from '../../src/client/3d/diagnostic_3d_panel';
import { TropicalWater } from '../../src/client/3d/tropical_water';
import { GameBoard } from '../../src/client/3d/board_layout';
import {
  calculateShoreDampening,
  calculateWaterWaveOffset,
} from '../../src/client/3d/shaders/tropical_water_material';

type FrameCb = (state: unknown, delta: number) => void;
let registeredFrameCallback: FrameCb | null = null;

function getFrameCallback(): FrameCb | null {
  return registeredFrameCallback;
}

vi.mock('@react-three/fiber', () => ({
  useFrame: (cb: FrameCb) => {
    registeredFrameCallback = cb;
  },
  useThree: () => ({
    gl: {
      getExtension: () => null,
      getParameter: () => 24,
      DEPTH_BITS: 3414,
    },
  }),
}));

type ElementWithChildren = ReactElement<{ children?: React.ReactNode; [key: string]: unknown }>;

function findNode(
  node: React.ReactNode,
  predicate: (n: ElementWithChildren) => boolean
): ElementWithChildren | null {
  if (!isValidElement<ElementWithChildren['props']>(node)) {
    return null;
  }
  if (predicate(node)) {
    return node;
  }
  const children = node.props.children;
  if (!children) return null;
  const childArray = React.Children.toArray(children);
  for (const child of childArray) {
    const found = findNode(child, predicate);
    if (found) return found;
  }
  return null;
}

function captureTree<P extends object>(
  Component: (props: P) => React.ReactElement | null,
  props: P
): ElementWithChildren | null {
  let captured: ElementWithChildren | null = null;
  function Spy(): React.ReactElement {
    const result = Component(props);
    if (isValidElement<ElementWithChildren['props']>(result)) {
      captured = result;
    }
    return React.createElement('div');
  }
  renderToStaticMarkup(React.createElement(Spy));
  return captured;
}

describe('[UC-IMP357/MSS] Android WebGL 3D Diagnostic & Depth Stabilization Contract Suite', () => {
  beforeEach(() => {
    useDiagnostic3DStore.setState({
      isDebugEnabled: false,
      isOpen: false,
      isOceanVisible: true,
      isTableVisible: true,
      isCityVisible: true,
      gpuRenderer: 'Detecting...',
      depthBits: 24,
    });
  });

  // =========================================================================
  // FACET 1: URL DIAGNOSTIC ACTIVATION & STATE REACTIVITY
  // =========================================================================
  describe('Facet 1: URL Diagnostic Activation & Reactive Toggles', () => {
    it('TC-357.01 [UC-DIAG-VISIBILITY/MSS]: Given URL with debug parameter ?debug=3d, When inspecting diagnostic store, Then isDebugEnabled is true', async () => {
      Object.defineProperty(globalThis, 'window', {
        value: {
          location: {
            search: '?debug=3d',
          },
        },
        writable: true,
        configurable: true,
      });
      vi.resetModules();
      const { useDiagnostic3DStore: isolatedStore } = await import('../../src/client/3d/diagnostic_3d_store');
      expect(isolatedStore.getState().isDebugEnabled).toBe(true);
    });

    it('TC-357.02 [UC-DIAG-TOGGLES/MSS]: Given active diagnostic store, When toggling ocean visibility via toggleOcean, Then isOceanVisible inverts state cleanly between true and false', () => {
      const initial = useDiagnostic3DStore.getState().isOceanVisible;
      useDiagnostic3DStore.getState().toggleOcean();
      expect(useDiagnostic3DStore.getState().isOceanVisible).toBe(!initial);
      useDiagnostic3DStore.getState().toggleOcean();
      expect(useDiagnostic3DStore.getState().isOceanVisible).toBe(initial);
    });

    it('TC-357.03 [UC-DIAG-TABLE-TOGGLE/MSS]: Given active diagnostic store, When toggling table visibility via toggleTable, Then isTableVisible inverts state cleanly', () => {
      const initial = useDiagnostic3DStore.getState().isTableVisible;
      useDiagnostic3DStore.getState().toggleTable();
      expect(useDiagnostic3DStore.getState().isTableVisible).toBe(!initial);
      useDiagnostic3DStore.getState().toggleTable();
      expect(useDiagnostic3DStore.getState().isTableVisible).toBe(initial);
    });
  });

  // =========================================================================
  // FACET 2: TROPICAL WATER SHADER PRECISION & TIME MODULO BOUND
  // =========================================================================
  describe('Facet 2: Tropical Water Shader Precision & Time Modulo Bound', () => {
    it('TC-357.04 [UC-WATER-HIGHP-PRECISION/MSS]: Given TropicalWater component rendered with isMobile true, When inspecting material properties via captureTree, Then configures precision highp on ShaderMaterial', () => {
      const tree = captureTree(TropicalWater, { isMobile: true });
      const mesh = findNode(tree, (n) => n.props['data-testid'] === 'living-ocean-water');
      const mat = mesh?.props.material;
      expect(mat instanceof ShaderMaterial).toBe(true);
      if (mat instanceof ShaderMaterial) {
        expect(mat.precision).toBe('highp');
      }
    });

    it('TC-357.05 [UC-WATER-TIME-BOUND/MSS]: Given water animation delta update, When advancing time, Then uTime wraps with modulo 20*PI preserving exact angular phase alignment', () => {
      registeredFrameCallback = null;
      const tree = captureTree(TropicalWater, { isMobile: false });
      const mesh = findNode(tree, (n) => n.props['data-testid'] === 'living-ocean-water');
      const mat = mesh?.props.material;
      const callback = getFrameCallback();
      expect(callback).not.toBeNull();
      expect(mat instanceof ShaderMaterial).toBe(true);
      if (mat instanceof ShaderMaterial && mat.uniforms.uTime) {
        mat.uniforms.uTime.value = Math.PI * 20.0 - 0.05;
        callback?.({}, 0.1);
        const finalTime = mat.uniforms.uTime.value;
        expect(typeof finalTime === 'number' ? finalTime : -1).toBeCloseTo(0.05, 3);
      }
    });

    it('TC-357.06 [UC-WATER-TRANSIENT-UNMOUNT/MSS]: Given isOceanVisible set to false, When rendering TropicalWater, Then returns invisible group container upholding R3F Transient Unmount Invariant', () => {
      useDiagnostic3DStore.setState({ isOceanVisible: false });
      const tree = captureTree(TropicalWater, {});
      expect(tree?.type).toBe('group');
      expect(tree?.props.visible).toBe(false);
    });
  });

  // =========================================================================
  // FACET 3: SCENE ISOLATION AFFORDANCE & WAVE CLEARANCE INVARIANT
  // =========================================================================
  describe('Facet 3: Scene Isolation Affordance & Wave Clearance Invariant', () => {
    it('TC-357.07 [UC-BOARD-ISOLATION-AFFORDANCE/MSS]: Given GameBoard rendered with isolation toggles, When mounting Diagnostic3DPanel, Then node visibility maps directly to diagnostic store', () => {
      useDiagnostic3DStore.setState({ isTableVisible: false, isOceanVisible: false });
      const tree = captureTree(GameBoard, {});
      const panelNode = findNode(tree, (n) => n.type === Diagnostic3DPanel);
      const tableMesh = findNode(tree, (n) => {
        const box = findNode(n, (c) => Array.isArray(c.props.args) && c.props.args[0] === 19.2);
        return Boolean(box);
      });
      expect(panelNode).not.toBeNull();
      expect(tableMesh?.props.visible).toBe(false);
    });

    it('TC-357.08 [UC-WAVE-CLEARANCE-INVARIANT/MSS]: Given TropicalWater baseline elevation at -0.300 and Chebyshev shore damping radius, When inspecting plinth region (|x| <= 9.6, |z| <= 9.6), Then wave displacement evaluates strictly to zero at board perimeter', () => {
      const tree = captureTree(TropicalWater, {});
      const mesh = findNode(tree, (n) => n.props['data-testid'] === 'living-ocean-water');
      const position = mesh?.props.position as [number, number, number] | undefined;
      const dampAtCorner = calculateShoreDampening(9.6, 9.6);
      const waveOffset = calculateWaterWaveOffset(9.6, 9.6, 12.34);
      const netDisplacement = waveOffset * dampAtCorner;
      expect(position?.[1]).toBe(-0.300);
      expect(Math.abs(netDisplacement)).toBe(0.0);
    });
  });

  // =========================================================================
  // FACET 4: HELPER ADVERSARIAL GATE
  // =========================================================================
  describe('Facet 4: Helper Adversarial Gate', () => {
    it('TC-357.09 [UC-HELPER-ADVERSARIAL/A1]: Given null or primitive React nodes, When evaluating findNode helper, Then returns null safely without throwing', () => {
      const nullResult = findNode(null, () => true);
      const stringResult = findNode('text-string-node', () => true);
      expect(nullResult).toBeNull();
      expect(stringResult).toBeNull();
    });

    it('TC-357.10 [UC-HELPER-ADVERSARIAL/A2]: Given nested React element hierarchy with multiple levels, When evaluating findNode with deep predicate, Then resolves target node correctly', () => {
      const deepTree = React.createElement(
        'div',
        { id: 'root' },
        React.createElement(
          'section',
          { id: 'middle' },
          React.createElement('span', { 'data-testid': 'deep-target' })
        )
      );
      const found = findNode(deepTree, (n) => n.props['data-testid'] === 'deep-target');
      expect(found).not.toBeNull();
      expect(found?.type).toBe('span');
    });
  });
});
