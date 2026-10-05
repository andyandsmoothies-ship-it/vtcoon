// [TC-266.3/MSS][UC-IMP266.3] 3D LOD Mobile Toggling & Perf Budget Cleanliness Contract Suite
// Verifies dynamic seagull unmounting on mobile, wake foam stripping on patrol boat,
// zero split-brain degradation timers in perfBudget, and synchronized isMobile prop propagation.

import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock Drei components for headless AST inspection without WebGL context
vi.mock('@react-three/drei', () => ({
  ContactShadows: (props: { readonly frames?: number; [key: string]: unknown }) =>
    React.createElement('contact-shadows', props),
  OrbitControls: () => null,
  Environment: () => null,
}));

// Mock Fiber hooks and components
vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/fiber')>();
  return {
    ...actual,
    useFrame: () => {},
    useThree: () => ({
      camera: { position: { set: () => {} } },
      scene: {},
      gl: {
        info: { render: { calls: 0, triangles: 0 }, reset: () => {} },
      },
    }),
    Canvas: ({ children }: { readonly children?: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'r3f-canvas' }, children),
  };
});

import { CoastalPatrolBoat } from '../../src/client/3d/coastal_patrol_boat';
import { DioramaHarborCruiser } from '../../src/client/3d/diorama/diorama_harbor_cruiser';
import { CoastalIslandEnvironment, type CoastalIslandEnvironmentProps } from '../../src/client/3d/coastal_island_environment';
import { CoastalSeagulls } from '../../src/client/3d/coastal_seagulls';
import {
  PerfBudgetController,
  perfBudget,
} from '../../src/client/3d/perf_budget';
import {
  captureTree,
  findReactNode,
  findReactNodes,
  getNodeProps,
  getNodeType,
  type TestReactElement,
} from '../helpers/threejs_test_utils';

interface ExtendedDeviceContext {
  isMobile?: boolean;
  currentDpr?: number;
  degradedDurationMs?: number;
  optimalDurationMs?: number;
}

function recordFrameTimes(controller: PerfBudgetController, count: number, frameTimeMs: number): void {
  for (let i = 0; i < count; i++) {
    controller.recordFrameTime(frameTimeMs);
  }
}

function isWakeFoamMesh(node: TestReactElement): boolean {
  if (getNodeType(node) !== 'mesh') return false;
  const rot = node.props.rotation;
  if (Array.isArray(rot) && rot.length === 3) {
    const zRot = rot[2];
    if (typeof zRot === 'number') {
      return Math.abs(zRot - 0.35) < 0.01 || Math.abs(zRot + 0.35) < 0.01;
    }
  }
  return false;
}

describe('IMP-266.3: 3D LOD Mobile Toggling & Perf Budget Cleanliness Contract Suite', () => {
  it('TC-266.3.01 [UC-IMP266.3/MSS]: CoastalSeagulls unmounts and returns null when isMobile is true', () => {
    const tree = captureTree<{ readonly isMobile?: boolean }>(CoastalSeagulls, { isMobile: true });
    expect(tree).toBeNull();
  });

  it('TC-266.3.02 [UC-IMP266.3/MSS]: CoastalSeagulls renders full flock of 5 seagulls when isMobile is false', () => {
    const tree = captureTree<{ readonly isMobile?: boolean }>(CoastalSeagulls, { isMobile: false });
    const birdNodes = findReactNodes(tree?.props.children, (n) => {
      const scale = n.props.scale;
      return Array.isArray(scale) && scale[0] === 0.55;
    });
    expect(tree?.props.children).not.toBeNull();
    expect(birdNodes.length).toBe(5);
  });

  it('TC-266.3.03 [UC-IMP266.3/MSS]: CoastalPatrolBoat and DioramaHarborCruiser strip dynamic foam wake meshes when isMobile is true', () => {
    const boatTree = captureTree<{ readonly isMobile?: boolean }>(CoastalPatrolBoat, { isMobile: true });
    const cruiserTree = captureTree<{ readonly isMobile?: boolean }>(DioramaHarborCruiser, { isMobile: true });
    const boatWake = findReactNodes(boatTree, isWakeFoamMesh);
    const cruiserWake = findReactNodes(cruiserTree, (n) => getNodeType(n) === 'mesh' && (n.props.position as number[] | undefined)?.[2] === -0.45);
    expect(boatWake.length).toBe(0);
    expect(cruiserWake.length).toBe(0);
  });

  it('TC-266.3.04 [UC-IMP266.3/MSS]: CoastalPatrolBoat and DioramaHarborCruiser retain dynamic foam wake meshes when isMobile is false', () => {
    const boatTree = captureTree<{ readonly isMobile?: boolean }>(CoastalPatrolBoat, { isMobile: false });
    const cruiserTree = captureTree<{ readonly isMobile?: boolean }>(DioramaHarborCruiser, { isMobile: false });
    const boatWake = findReactNodes(boatTree, isWakeFoamMesh);
    const cruiserWake = findReactNodes(cruiserTree, (n) => getNodeType(n) === 'mesh' && (n.props.position as number[] | undefined)?.[2] === -0.45);
    expect(boatWake.length).toBe(2);
    expect(cruiserWake.length).toBe(1);
  });

  it('TC-266.3.05 [UC-IMP266.3/MSS]: perfBudget.getBudgetReport reads degradedDurationMs from deviceContext and avoids premature DPR drop', () => {
    perfBudget.reset();
    recordFrameTimes(perfBudget, 60, 25);
    const context: ExtendedDeviceContext = {
      isMobile: false,
      currentDpr: 1.5,
      degradedDurationMs: 500,
      optimalDurationMs: 2000,
    };
    const report = perfBudget.getBudgetReport(
      { render: { calls: 20, triangles: 1000 } },
      context
    );
    expect(report.averageFps).toBeLessThan(45);
    expect(report.recommendedDpr).toBe(1.5);
  });

  it('TC-266.3.06 [UC-IMP266.3/A1]: perfBudget.getBudgetReport defaults degradation duration to 0 and maintains DPR without deviceContext', () => {
    perfBudget.reset();
    recordFrameTimes(perfBudget, 60, 25);
    const report = perfBudget.getBudgetReport({ render: { calls: 20, triangles: 1000 } });
    expect(report.averageFps).toBeLessThan(45);
    expect(report.recommendedDpr).toBe(1.5);
  });

  it('TC-266.3.07 [UC-IMP266.3/A2]: perfBudget.calculateAdaptiveDpr steps down DPR when degraded duration reaches threshold', () => {
    const result = perfBudget.calculateAdaptiveDpr({
      isMobile: false,
      currentFps: 40,
      currentDpr: 1.5,
      degradedDurationMs: 1500,
      optimalDurationMs: 0,
    });
    expect(result.reason).toBe('STEP_DOWN');
    expect(result.shouldUpdate).toBe(true);
    expect(result.targetDpr).toBe(1.25);
  });

  it('TC-266.3.08 [UC-IMP266.3/A3]: CoastalIslandEnvironment synchronizes isMobile prop to seagulls and patrol boat', () => {
    const tree = captureTree<CoastalIslandEnvironmentProps>(CoastalIslandEnvironment, { isMobile: true });
    const patrolBoat = findReactNode(tree, (n) => n.type === CoastalPatrolBoat);
    const seagulls = findReactNode(tree, (n) => n.type === CoastalSeagulls);
    const boatProps = getNodeProps<{ readonly isMobile?: boolean }>(patrolBoat);
    const seagullsProps = getNodeProps<{ readonly isMobile?: boolean }>(seagulls);
    expect(boatProps.isMobile).toBe(true);
    expect(seagullsProps.isMobile).toBe(true);
  });
});
