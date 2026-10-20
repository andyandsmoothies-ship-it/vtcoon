// [TEST-HARNESS][INFRA] Standardized React Three Fiber (R3F) & WebGL Test Seam
// Eliminates bespoke local mocking of useFrame/Canvas across test files and provides deterministic frame stepping.
import React from 'react';
import { vi } from 'vitest';
import type { Object3D } from 'three';

export type R3FFrameCallback = (state: MockR3FRootState, delta: number) => void;

export interface MockR3FGl {
  readonly getPixelRatio: () => number;
  readonly setPixelRatio?: (dpr: number) => void;
  readonly render?: (scene?: unknown, camera?: unknown) => void;
  readonly info?: {
    readonly render: {
      readonly calls: number;
      readonly triangles: number;
      readonly lines?: number;
      readonly points?: number;
    };
  };
  capabilities?: {
    logarithmicDepthBuffer?: boolean;
    [key: string]: unknown;
  };
}

export interface MockR3FClock {
  readonly getElapsedTime: () => number;
  readonly getDelta: () => number;
  elapsedTime: number;
}

export interface MockR3FRootState {
  gl: MockR3FGl;
  setDpr: (dpr: number) => void;
  clock: MockR3FClock;
  size: { width: number; height: number; top: number; left: number };
  viewport: { width: number; height: number; factor: number; distance: number; aspect: number };
  scene?: Object3D;
  camera?: unknown;
}

export interface R3FTestHarnessOptions {
  readonly initialPixelRatio?: number;
  readonly initialWidth?: number;
  readonly initialHeight?: number;
}

export class R3FTestHarness {
  private callbacks: Array<R3FFrameCallback> = [];
  private lastSetDpr: number | null = null;
  private currentElapsedTime = 0;
  private pixelRatio = 1.0;
  public renderCallCount = 0;

  public readonly state: MockR3FRootState;

  constructor(options: R3FTestHarnessOptions = {}) {
    this.pixelRatio = options.initialPixelRatio ?? 1.0;
    const width = options.initialWidth ?? 1280;
    const height = options.initialHeight ?? 720;

    this.state = {
      gl: {
        getPixelRatio: () => this.pixelRatio,
        setPixelRatio: (dpr: number) => {
          this.pixelRatio = dpr;
          this.lastSetDpr = dpr;
        },
        render: () => {
          this.renderCallCount++;
        },
        info: {
          render: {
            calls: 0,
            triangles: 0,
          },
        },
        capabilities: {
          logarithmicDepthBuffer: false,
        },
      },
      setDpr: (dpr: number) => {
        this.pixelRatio = dpr;
        this.lastSetDpr = dpr;
      },
      clock: {
        getElapsedTime: () => this.currentElapsedTime,
        getDelta: () => 0.016,
        elapsedTime: 0,
      },
      size: { width, height, top: 0, left: 0 },
      viewport: {
        width,
        height,
        factor: 1,
        distance: 10,
        aspect: width / (height > 0 ? height : 1),
      },
      camera: { position: { set: () => {} } },
    };
  }

  /**
   * Registers a frame callback (conforming to R3F's useFrame subscription contract).
   * Returns an unregister cleanup function.
   */
  public registerFrameCallback(cb: R3FFrameCallback): () => void {
    this.callbacks.push(cb);
    return () => {
      this.callbacks = this.callbacks.filter((item) => item !== cb);
    };
  }

  /**
   * Advances virtual clock by delta seconds (default 16.6ms / 60 FPS) and synchronously
   * triggers all registered useFrame callbacks with deterministic state.
   */
  public advanceFrame(delta = 0.016): void {
    this.currentElapsedTime += delta;
    this.state.clock.elapsedTime = this.currentElapsedTime;

    const snapshot = [...this.callbacks];
    for (const callback of snapshot) {
      callback(this.state, delta);
    }
  }

  /**
   * Returns the total number of currently registered useFrame subscribers.
   */
  public getSubscriberCount(): number {
    return this.callbacks.length;
  }

  /**
   * Returns the most recent DPR passed to setDpr() or gl.setPixelRatio().
   */
  public getLastSetDpr(): number | null {
    return this.lastSetDpr;
  }

  /**
   * Returns current elapsed simulation time in seconds.
   */
  public getElapsedTime(): number {
    return this.currentElapsedTime;
  }

  /**
   * Resets all registered callbacks and resets clock and DPR to clean initial state.
   */
  public reset(): void {
    this.callbacks = [];
    this.lastSetDpr = null;
    this.renderCallCount = 0;
    this.currentElapsedTime = 0;
    this.state.clock.elapsedTime = 0;
  }
}

/**
 * Global shared harness instance for standardized test file imports.
 */
export const sharedR3FHarness = new R3FTestHarness();

/**
 * Creates an isolated harness instance for independent test scopes.
 */
export function createR3FTestHarness(options?: R3FTestHarnessOptions): R3FTestHarness {
  return new R3FTestHarness(options);
}

/**
 * Standardized mock factory for vi.mock('@react-three/fiber').
 * Provides useFrame, useThree, and Canvas wired directly to R3FTestHarness.
 */
export function createR3FMock(harness: R3FTestHarness = sharedR3FHarness) {
  return {
    useFrame: (cb: R3FFrameCallback) => harness.registerFrameCallback(cb),
    useThree: () => harness.state,
    Canvas: ({ children }: { readonly children?: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'r3f-canvas' }, children),
  };
}

/**
 * Standardized graphics fixture seam: automatically bridges @react-three/fiber
 * across test suites that import r3f_test_harness.
 */
vi.mock('@react-three/fiber', () => ({
  useFrame: (cb: R3FFrameCallback) => sharedR3FHarness.registerFrameCallback(cb),
  useThree: () => sharedR3FHarness.state,
  Canvas: ({ children }: { readonly children?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'r3f-canvas' }, children),
}));
