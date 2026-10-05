// [TC-265/MSS][UC-IMP265] Dual-Platform 3D Performance & Mobile Thermal Invariant Contract Suite
// Universal 5-Facet Behavioral Matrix covering Desktop vs Mobile LOD, ContactShadows stripping,
// diorama micro-animation freezing, zero-allocation ring buffer, and adaptive DPR bounds.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { captureTree, findReactNode } from '../helpers/threejs_test_utils';

// Mock Drei components for headless AST and SSR traversal without WebGL context
vi.mock('@react-three/drei', () => ({
  ContactShadows: (props: { readonly frames?: number; [key: string]: unknown }) =>
    React.createElement('contact-shadows', props),
  OrbitControls: () => null,
  Environment: () => null,
}));

let lastRegisteredSafeFrameCallback: ((state: { clock: { elapsedTime: number; getElapsedTime: () => number } }, delta: number) => void) | null = null;
let registeredSafeFrameCallbacks: ((state: { clock: { elapsedTime: number; getElapsedTime: () => number } }, delta: number) => void)[] = [];

// Mock Fiber components and safe frame registration
vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/fiber')>();
  return {
    ...actual,
    useFrame: (cb: (state: { clock: { elapsedTime: number; getElapsedTime: () => number } }, delta: number) => void) => {
      lastRegisteredSafeFrameCallback = cb;
      registeredSafeFrameCallbacks.push(cb);
    },
    useThree: () => ({
      camera: { position: { set: () => {} } },
      scene: {},
      gl: {
        info: {
          render: { calls: 40, triangles: 50000 },
          reset: () => {},
        },
      },
    }),
    Canvas: ({ children }: { readonly children?: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'r3f-canvas' }, children),
  };
});

import { ContactShadows } from '@react-three/drei';
import { GameCanvas, type GameCanvasProps } from '../../src/client/game_canvas';
import { GameBoard, type GameBoardProps } from '../../src/client/3d/board_layout';
import { MiniatureCityDiorama, type MiniatureCityDioramaProps } from '../../src/client/3d/miniature_city_diorama';
import { DioramaTraffic } from '../../src/client/3d/diorama/diorama_traffic';
import { DioramaModelRailroad } from '../../src/client/3d/diorama/diorama_railroad';
import { DioramaMicroLife } from '../../src/client/3d/diorama/diorama_microlife';
import { DioramaHarborCruiser } from '../../src/client/3d/diorama/diorama_harbor_cruiser';
import { CoastalIslandEnvironment, type CoastalIslandEnvironmentProps } from '../../src/client/3d/coastal_island_environment';
import { CoastalPatrolBoat } from '../../src/client/3d/coastal_patrol_boat';
import { CoastalSeagulls } from '../../src/client/3d/coastal_seagulls';
import {
  PerfBudgetController,
  PERF_BUDGET_LIMITS,
  perfBudget,
} from '../../src/client/3d/perf_budget';
import { PerfTelemetryTracker } from '../../src/client/telemetry/perf_telemetry_tracker';



function triggerRegisteredSafeFrameCallbacks(
  state: { clock: { elapsedTime: number; getElapsedTime: () => number } },
  delta: number
): void {
  for (const cb of registeredSafeFrameCallbacks) {
    cb(state, delta);
  }
}

/**
 * Feeds sample frames to controller without loops in individual test cases.
 */
function feedFrameSamples(controller: PerfBudgetController, count: number, sampleMs: number): void {
  for (let i = 0; i < count; i++) {
    controller.recordFrameTime(sampleMs);
  }
}

describe('IMP-265: Dual-Platform 3D Performance & Mobile Thermal Invariant Contract Suite', () => {
  beforeEach(() => {
    vi.stubGlobal('window', globalThis);
    lastRegisteredSafeFrameCallback = null;
    registeredSafeFrameCallbacks = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // =========================================================================
  // FACET 1: ROOT & ENVIRONMENTAL PROP PROPAGATION (TC-265.01 - TC-265.06)
  // =========================================================================

  it('TC-265.01 [UC-IMP265/MSS]: GameCanvas renders ContactShadows when isMobile is false under simulated window environment (Desktop full fidelity)', () => {
    const tree = captureTree<GameCanvasProps>(GameCanvas, { isMobile: false });
    const shadowNode = findReactNode(tree, (n) => n.type === ContactShadows);
    expect(shadowNode).not.toBeNull();
    expect(shadowNode?.props?.frames).toBe(1);
  });

  it('TC-265.02 [UC-IMP265/MSS]: GameCanvas omits ContactShadows when isMobile is true under simulated window environment (Mobile fillrate & thermal protection)', () => {
    const tree = captureTree<GameCanvasProps>(GameCanvas, { isMobile: true });
    const shadowNode = findReactNode(tree, (n) => n.type === ContactShadows);
    expect(shadowNode).toBeNull();

    const lobbyTree = captureTree<GameCanvasProps>(GameCanvas, { isMobile: true, isLobby: true });
    const lobbyShadowNode = findReactNode(lobbyTree, (n) => n.type === ContactShadows);
    expect(lobbyShadowNode).toBeNull();
  });

  it('TC-265.03 [UC-IMP265/MSS]: GameBoard propagates isMobile prop to MiniatureCityDiorama and CoastalIslandEnvironment', () => {
    const tree = captureTree<GameBoardProps>(GameBoard, { isMobile: true });
    const dioramaNode = findReactNode(tree, (n) => n.type === MiniatureCityDiorama);
    const coastalNode = findReactNode(tree, (n) => n.type === CoastalIslandEnvironment);
    expect(coastalNode?.props?.isMobile).toBe(true);
    expect(dioramaNode?.props?.isMobile).toBe(true);
  });

  it('TC-265.04 [UC-IMP265/MSS]: MiniatureCityDiorama propagates isMobile prop to DioramaTraffic', () => {
    const tree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true });
    const trafficNode = findReactNode(tree, (n) => n.type === DioramaTraffic);
    expect(trafficNode?.props?.isMobile).toBe(true);
  });

  it('TC-265.05 [UC-IMP265/MSS]: MiniatureCityDiorama propagates isMobile prop to DioramaModelRailroad', () => {
    const tree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true });
    const railroadNode = findReactNode(tree, (n) => n.type === DioramaModelRailroad);
    expect(railroadNode?.props?.isMobile).toBe(true);
  });

  it('TC-265.06 [UC-IMP265/MSS]: MiniatureCityDiorama propagates isMobile prop to DioramaMicroLife', () => {
    const tree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true });
    const microLifeNode = findReactNode(tree, (n) => n.type === DioramaMicroLife);
    expect(microLifeNode?.props?.isMobile).toBe(true);
  });

  // =========================================================================
  // FACET 2: DIORAMA MOBILE LOD & MICRO-ANIMATION FREEZING (TC-265.07 - TC-265.12)
  // =========================================================================

  it('TC-265.07 [UC-IMP265/MSS]: MiniatureCityDiorama propagates isMobile prop to DioramaHarborCruiser, which renders static boat and freezes useSafeFrame', () => {
    const tree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true });
    const cruiserPropNode = findReactNode(tree, (n) => n.type === DioramaHarborCruiser);
    const boatEl = captureTree<{ readonly isMobile?: boolean }>(DioramaHarborCruiser, { isMobile: true });

    let clockAccessCount = 0;
    const mockState = {
      clock: {
        get elapsedTime() {
          clockAccessCount++;
          return 5.0;
        },
        getElapsedTime: () => {
          clockAccessCount++;
          return 5.0;
        },
      },
    };
    lastRegisteredSafeFrameCallback?.(mockState, 0.016);

    expect(cruiserPropNode?.props?.isMobile).toBe(true);
    expect(boatEl?.props?.position).toEqual([0, -0.032, 5.2]);
    expect(clockAccessCount).toBe(0);
  });

  it('TC-265.08 [UC-IMP265/MSS]: CoastalIslandEnvironment propagates isMobile prop to CoastalPatrolBoat, which renders static boat and freezes useSafeFrame', () => {
    const tree = captureTree<CoastalIslandEnvironmentProps>(CoastalIslandEnvironment, { isMobile: true });
    const boatPropNode = findReactNode(tree, (n) => n.type === CoastalPatrolBoat);
    const patrolBoatEl = captureTree<{ readonly isMobile?: boolean }>(CoastalPatrolBoat, { isMobile: true });

    let clockAccessCount = 0;
    const mockState = {
      clock: {
        get elapsedTime() {
          clockAccessCount++;
          return 5.0;
        },
        getElapsedTime: () => {
          clockAccessCount++;
          return 5.0;
        },
      },
    };
    lastRegisteredSafeFrameCallback?.(mockState, 0.016);

    expect(boatPropNode?.props?.isMobile).toBe(true);
    expect(patrolBoatEl?.props?.position).toEqual([-16, -0.30, 22]);
    expect(clockAccessCount).toBe(0);
  });

  it('TC-265.09 [UC-IMP265/MSS]: CoastalIslandEnvironment propagates isMobile prop to CoastalSeagulls, which unmounts on mobile and renders flock on desktop', () => {
    const tree = captureTree<CoastalIslandEnvironmentProps>(CoastalIslandEnvironment, { isMobile: true });
    const seagullsPropNode = findReactNode(tree, (n) => n.type === CoastalSeagulls);
    const gullsTree = captureTree<{ readonly isMobile?: boolean }>(CoastalSeagulls, { isMobile: true });
    const desktopTree = captureTree<{ readonly isMobile?: boolean }>(CoastalSeagulls, { isMobile: false });

    expect(seagullsPropNode?.props?.isMobile).toBe(true);
    expect(gullsTree).toBeNull();
    expect(desktopTree?.props.children).not.toBeNull();
  });

  it('TC-265.10 [UC-IMP265/MSS]: DioramaTraffic precomputes static track positions at t=0 in JSX and freezes useSafeFrame when isMobile is true', () => {
    const trafficEl = captureTree<{ readonly isMobile?: boolean }>(DioramaTraffic, { isMobile: true });
    const firstVehicle = findReactNode(trafficEl, (n) => Boolean(n.key && n.key.includes('bus-yellow')));

    let clockAccessCount = 0;
    const mockState = {
      clock: {
        get elapsedTime() {
          clockAccessCount++;
          return 5.0;
        },
        getElapsedTime: () => {
          clockAccessCount++;
          return 5.0;
        },
      },
    };
    lastRegisteredSafeFrameCallback?.(mockState, 0.016);

    expect(firstVehicle).not.toBeNull();
    expect(firstVehicle?.props?.position).toBeDefined();
    expect(clockAccessCount).toBe(0);
  });

  it('TC-265.11 [UC-IMP265/MSS]: DioramaModelRailroad positions carriages at elevated viaduct rail height (Y approx 0.488) at Waterfront Station in JSX and freezes useSafeFrame when isMobile is true', () => {
    const railroadTree = captureTree<{ readonly isMobile?: boolean }>(DioramaModelRailroad, { isMobile: true });
    const leadCab = findReactNode(railroadTree, (n) => Array.isArray(n.props?.position) && n.props.position[0] === -2.2);

    let clockAccessCount = 0;
    const mockState = {
      clock: {
        get elapsedTime() {
          clockAccessCount++;
          return 5.0;
        },
        getElapsedTime: () => {
          clockAccessCount++;
          return 5.0;
        },
      },
    };
    lastRegisteredSafeFrameCallback?.(mockState, 0.016);

    expect(leadCab?.props?.position?.[1]).toBeCloseTo(0.488, 3);
    expect(clockAccessCount).toBe(0);
  });

  it('TC-265.12 [UC-IMP265/MSS]: CoastalIslandEnvironment renders valid static markup with data-testid="living-ocean-water" and freezes ocean wave scaling when isMobile is true', () => {
    const markup = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { isMobile: true }));

    let clockAccessCount = 0;
    const mockState = {
      clock: {
        get elapsedTime() {
          clockAccessCount++;
          return 5.0;
        },
        getElapsedTime: () => {
          clockAccessCount++;
          return 5.0;
        },
      },
    };
    triggerRegisteredSafeFrameCallbacks(mockState, 0.016);

    expect(markup).toContain('data-testid="living-ocean-water"');
    expect(clockAccessCount).toBe(0);
  });

  // =========================================================================
  // FACET 3: ZERO-ALLOCATION RING BUFFER & SPIKE DEFENSE (TC-265.13 - TC-265.16)
  // =========================================================================

  it('TC-265.13 [UC-IMP265/MSS]: PerfBudgetController ring buffer records 60 samples without exceeding maxSamples length', () => {
    const controller = new PerfBudgetController();
    feedFrameSamples(controller, 60, 16.67);
    controller.recordFrameTime(33.33);
    expect(controller.getAverageFps()).toBe(59);
    feedFrameSamples(controller, 59, 33.33);
    expect(controller.getAverageFps()).toBe(30);
  });

  it('TC-265.14 [UC-IMP265/MSS]: PerfBudgetController ring buffer correctly computes average FPS over circular overwrite without non-null assertion bypass', () => {
    const controller = new PerfBudgetController();
    feedFrameSamples(controller, 60, 16.67);
    feedFrameSamples(controller, 30, 33.33);
    expect(controller.getAverageFps()).toBe(40);
  });

  it('TC-265.15 [UC-IMP265/A1]: PerfBudgetController reset clears frameTimes and resets frameIndex to 0', () => {
    const controller = new PerfBudgetController();
    feedFrameSamples(controller, 45, 20.0);
    controller.reset();
    expect(controller.getAverageFps()).toBe(PERF_BUDGET_LIMITS.targetFps);
    controller.recordFrameTime(20.0);
    expect(controller.getAverageFps()).toBe(50);
  });

  it('TC-265.16 [UC-IMP265/A2]: PerfBudgetController handles NaN, Infinity, negative values, and backgrounding pauses (> 1000ms, clamped at 250ms) without corrupting ring buffer', () => {
    const controller = new PerfBudgetController();
    feedFrameSamples(controller, 60, 16.67);
    controller.recordFrameTime(Number.NaN);
    controller.recordFrameTime(Number.POSITIVE_INFINITY);
    controller.recordFrameTime(-15);
    controller.recordFrameTime(1500);

    const clampedController = new PerfBudgetController();
    feedFrameSamples(clampedController, 60, 500);

    expect(controller.getAverageFps()).toBe(60);
    expect(clampedController.getAverageFps()).toBe(4);
  });

  // =========================================================================
  // FACET 4: TELEMETRY THROTTLE & ADAPTIVE DPR BOUNDS (TC-265.17 - TC-265.18)
  // =========================================================================

  it('TC-265.17 [UC-IMP265/A3]: Telemetry throttle interval is at least 500ms and consumes explicit isMobile prop', () => {
    const budgetSpy = vi.spyOn(perfBudget, 'getBudgetReport');
    budgetSpy.mockClear();
    const nowSpy = vi.spyOn(performance, 'now');

    const mockState = {
      clock: {
        get elapsedTime() { return 1.0; },
        getElapsedTime: () => 1.0,
      },
    };

    nowSpy.mockReturnValue(300);
    captureTree<{ readonly isMobile?: boolean }>(PerfTelemetryTracker, { isMobile: true });
    lastRegisteredSafeFrameCallback?.(mockState, 0.016);
    expect(budgetSpy).not.toHaveBeenCalled();

    nowSpy.mockReturnValue(550);
    lastRegisteredSafeFrameCallback?.(mockState, 0.016);
    expect(budgetSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ isMobile: true })
    );
  });

  it('TC-265.18 [UC-IMP265/A4]: calculateAdaptiveDpr enforces mobile DPR ceiling at 1.0 and steps down to 0.85 under sustained low FPS without oscillation', () => {
    const controller = new PerfBudgetController();

    const stepDownResult = controller.calculateAdaptiveDpr({
      isMobile: true,
      currentFps: 30,
      currentDpr: 1.0,
      degradedDurationMs: 1500,
      optimalDurationMs: 0,
    });

    const floorResult = controller.calculateAdaptiveDpr({
      isMobile: true,
      currentFps: 25,
      currentDpr: 0.85,
      degradedDurationMs: 3000,
      optimalDurationMs: 0,
    });

    const ceilingResult = controller.calculateAdaptiveDpr({
      isMobile: true,
      currentFps: 60,
      currentDpr: 1.0,
      degradedDurationMs: 0,
      optimalDurationMs: 5000,
    });

    expect(stepDownResult.targetDpr).toBe(0.85);
    expect(floorResult.shouldUpdate).toBe(false);
    expect(ceilingResult.targetDpr).toBe(1.0);
  });
});
