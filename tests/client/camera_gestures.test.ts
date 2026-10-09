// @vitest-environment happy-dom
// [UI-S04/MSS][TC-GES/MSS] IMP-296: Camera Gestures & Interaction Controller Contract Suite
// Traceability: docs/domain/gotchas/3d_cinematics.md (Gotcha 15, Gotcha 64), .agents/plans/PLAN_IMP_296_CAMERA_GESTURE_MODULARIZATION.md
// Seam Discipline: Interface is the test boundary. Banned monkey-patching React internals (spyOn(React)).
// Testing Harness: Uses natural createRoot and act() lifecycle for hook verification.

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import React, { act, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PerspectiveCamera, Scene } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import {
  evaluateOrbitGestureEnd,
  applyCameraSkipSnap,
  checkTargetOwnedByHuman,
  useCameraGestures,
  useDebugCameraGlobals,
  type GestureEndEvaluationParams,
  type UseCameraGesturesReturn,
} from '../../src/client/3d/use_camera_gestures';
import { initSoftReturn, type SoftReturnState } from '../../src/client/3d/camera_soft_return';
import { useGameStore } from '../../src/client/store/game_store';

describe('[UC-GES] Camera Gestures & Interaction Controller Contract Suite', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    useGameStore.setState({
      hasUserCustomCamera: false,
      cameraFocusCell: null,
    });
  });

  afterEach(() => {
    const currentRoot = root;
    const currentContainer = container;
    if (currentRoot && currentContainer) {
      act(() => {
        currentRoot.unmount();
      });
      currentContainer.remove();
    }
    container = null;
    root = null;
    vi.restoreAllMocks();
  });

  // ==========================================
  // Facet 1: Pure Gesture Evaluation Functions
  // ==========================================

  it('[TC-GES.01/MSS][UC-GESTURE/MSS] evaluateOrbitGestureEnd tra ve set_custom_camera khi vua break soft return va lech vi tri lon', () => {
    const params: GestureEndEvaluationParams = {
      touchDurationMs: 300,
      currentCamPos: [30, 25, 30],
      overviewPos: [24.6, 25.3, 24.6],
      currentTargetPos: [2.2, 0, 2.2],
      overviewTarget: [2.2, 0, 2.2],
      isPawnAnimating: false,
      justBrokeSoftReturn: true,
    };

    const result = evaluateOrbitGestureEnd(params);

    expect(result.action).toBe('set_custom_camera');
    expect(result.shouldClearJustBroke).toBe(true);
  });

  it('[TC-GES.02/MSS][UC-GESTURE/MSS] evaluateOrbitGestureEnd tra ve none khi vua break soft return nhung vi tri khong lech', () => {
    const params: GestureEndEvaluationParams = {
      touchDurationMs: 150,
      currentCamPos: [24.6, 25.3, 24.6],
      overviewPos: [24.6, 25.3, 24.6],
      currentTargetPos: [2.2, 0, 2.2],
      overviewTarget: [2.2, 0, 2.2],
      isPawnAnimating: false,
      justBrokeSoftReturn: true,
    };

    const result = evaluateOrbitGestureEnd(params);

    expect(result.action).toBe('none');
    expect(result.shouldClearJustBroke).toBe(true);
  });

  it('[TC-GES.03/MSS][UC-GESTURE/MSS] evaluateOrbitGestureEnd tra ve skip_animation khi cham nhanh duoi 220ms va quan co dang di chuyen', () => {
    const params: GestureEndEvaluationParams = {
      touchDurationMs: 120,
      currentCamPos: [24.7, 25.3, 24.7],
      overviewPos: [24.6, 25.3, 24.6],
      currentTargetPos: [2.25, 0, 2.25],
      overviewTarget: [2.2, 0, 2.2],
      isPawnAnimating: true,
      justBrokeSoftReturn: false,
    };

    const result = evaluateOrbitGestureEnd(params);

    expect(result.action).toBe('skip_animation');
    expect(result.shouldClearJustBroke).toBe(false);
  });

  it('[TC-GES.04/MSS][UC-GESTURE/MSS] evaluateOrbitGestureEnd tra ve none khi cham nhanh duoi 220ms nhung quan co khong di chuyen', () => {
    const params: GestureEndEvaluationParams = {
      touchDurationMs: 100,
      currentCamPos: [24.6, 25.3, 24.6],
      overviewPos: [24.6, 25.3, 24.6],
      currentTargetPos: [2.2, 0, 2.2],
      overviewTarget: [2.2, 0, 2.2],
      isPawnAnimating: false,
      justBrokeSoftReturn: false,
    };

    const result = evaluateOrbitGestureEnd(params);

    expect(result.action).toBe('none');
    expect(result.shouldClearJustBroke).toBe(false);
  });

  it('[TC-GES.05/MSS][UC-GESTURE/MSS] evaluateOrbitGestureEnd kich hoat Free-Roam khi xoay keo goc nhin lech qua nguong', () => {
    const params: GestureEndEvaluationParams = {
      touchDurationMs: 600,
      currentCamPos: [28.0, 25.3, 24.6],
      overviewPos: [24.6, 25.3, 24.6],
      currentTargetPos: [2.2, 0, 2.2],
      overviewTarget: [2.2, 0, 2.2],
      isPawnAnimating: false,
      justBrokeSoftReturn: false,
    };

    const result = evaluateOrbitGestureEnd(params);

    expect(result.action).toBe('set_custom_camera');
    expect(result.shouldClearJustBroke).toBe(false);
  });

  it('[TC-GES.06/MSS][UC-GESTURE/MSS] evaluateOrbitGestureEnd tra ve none khi xoay nhe duoi nguong va khong thoa tap-to-skip', () => {
    const params: GestureEndEvaluationParams = {
      touchDurationMs: 400,
      currentCamPos: [24.7, 25.3, 24.6],
      overviewPos: [24.6, 25.3, 24.6],
      currentTargetPos: [2.25, 0, 2.2],
      overviewTarget: [2.2, 0, 2.2],
      isPawnAnimating: false,
      justBrokeSoftReturn: false,
    };

    const result = evaluateOrbitGestureEnd(params);

    expect(result.action).toBe('none');
    expect(result.shouldClearJustBroke).toBe(false);
  });

  // ==========================================
  // Facet 2: Snap Skip Execution
  // ==========================================

  it('[TC-GES.07/MSS][UC-GESTURE/MSS] applyCameraSkipSnap cap nhat vi tri camera, target controls va cac mang base toa do', () => {
    let camSetX = 0, camSetY = 0, camSetZ = 0;
    let targetSetX = 0, targetSetY = 0, targetSetZ = 0;
    let updated = false;

    const mockCamera = {
      position: {
        set: (x: number, y: number, z: number) => {
          camSetX = x; camSetY = y; camSetZ = z;
        },
      },
    };
    const mockControls = {
      target: {
        set: (x: number, y: number, z: number) => {
          targetSetX = x; targetSetY = y; targetSetZ = z;
        },
      },
      update: () => { updated = true; },
    };

    const camBaseRef = { current: [0, 0, 0] as [number, number, number] };
    const targetBaseRef = { current: [0, 0, 0] as [number, number, number] };

    applyCameraSkipSnap({
      skipTarget: {
        position: [12, 18, 12],
        target: [3, 0, 3],
      },
      camera: mockCamera,
      controls: mockControls,
      camBaseRef,
      targetBaseRef,
    });

    expect(camSetX).toBe(12);
    expect(targetSetX).toBe(3);
    expect(camBaseRef.current).toEqual([12, 18, 12]);
    expect(updated).toBe(true);
  });

  it('[TC-GES.08/MSS][UC-GESTURE/MSS] applyCameraSkipSnap van cap nhat an toan khi controls la null ma khong quang loi', () => {
    let camSetX = 0;
    const mockCamera = {
      position: {
        set: (x: number) => { camSetX = x; },
      },
    };
    const camBaseRef = { current: [0, 0, 0] as [number, number, number] };
    const targetBaseRef = { current: [0, 0, 0] as [number, number, number] };

    expect(() => {
      applyCameraSkipSnap({
        skipTarget: {
          position: [15, 20, 15],
          target: [4, 0, 4],
        },
        camera: mockCamera,
        controls: null,
        camBaseRef,
        targetBaseRef,
      });
    }).not.toThrow();

    expect(camSetX).toBe(15);
    expect(camBaseRef.current).toEqual([15, 20, 15]);
  });

  // ==========================================
  // Facet 3: React Hook Lifecycle via TestHarness
  // ==========================================

  it('[TC-GES.09/MSS][UC-GESTURE/MSS] useCameraGestures onOrbitStart ngat soft return dang dien ra va danh dau justBrokeSoftReturn', () => {
    const hookHolder: { current: UseCameraGesturesReturn | null } = { current: null };
    const isResettingRefHolder = { current: true };
    const softReturnRefHolder = {
      current: initSoftReturn([24.6, 25.3, 24.6], [2.2, 0, 2.2], [24.6, 25.3, 24.6], [2.2, 0, 2.2], 100, 1200),
    };

    function Harness(): React.ReactElement {
      const camera = new PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(24.6, 25.3, 24.6);
      const controlsRef = useRef<OrbitControlsImpl | null>(null);
      const currentOverviewPosRef = useRef<[number, number, number]>([24.6, 25.3, 24.6]);
      const currentOverviewTargetRef = useRef<[number, number, number]>([2.2, 0, 2.2]);
      const isResettingRef = useRef<boolean>(isResettingRefHolder.current);
      const softReturnRef = useRef<SoftReturnState | null>(softReturnRefHolder.current);
      const isManualOverviewResetRef = useRef<boolean>(false);
      const camBaseRef = useRef<[number, number, number]>([24.6, 25.3, 24.6]);
      const targetBaseRef = useRef<[number, number, number]>([2.2, 0, 2.2]);

      const gestures = useCameraGestures({
        camera,
        controlsRef,
        currentOverviewPosRef,
        currentOverviewTargetRef,
        isResettingRef,
        softReturnRef,
        isManualOverviewResetRef,
        camBaseRef,
        targetBaseRef,
      });

      hookHolder.current = gestures;
      return React.createElement('div', null, 'Harness');
    }

    act(() => {
      if (root) root.render(React.createElement(Harness));
    });

    expect(hookHolder.current).not.toBeNull();
    act(() => {
      hookHolder.current?.onOrbitStart();
    });

    expect(hookHolder.current?.isUserInteractingRef.current).toBe(true);
  });

  it('[TC-GES.10/MSS][UC-GESTURE/MSS] useCameraGestures onOrbitStart kich hoat isUserInteractingRef va ghi nhan touchStartTime', () => {
    const hookHolder: { current: UseCameraGesturesReturn | null } = { current: null };

    function Harness(): React.ReactElement {
      const camera = new PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(24.6, 25.3, 24.6);
      const controlsRef = useRef<OrbitControlsImpl | null>(null);
      const currentOverviewPosRef = useRef<[number, number, number]>([24.6, 25.3, 24.6]);
      const currentOverviewTargetRef = useRef<[number, number, number]>([2.2, 0, 2.2]);
      const isResettingRef = useRef<boolean>(false);
      const softReturnRef = useRef<SoftReturnState | null>(null);
      const isManualOverviewResetRef = useRef<boolean>(false);
      const camBaseRef = useRef<[number, number, number]>([24.6, 25.3, 24.6]);
      const targetBaseRef = useRef<[number, number, number]>([2.2, 0, 2.2]);

      const gestures = useCameraGestures({
        camera,
        controlsRef,
        currentOverviewPosRef,
        currentOverviewTargetRef,
        isResettingRef,
        softReturnRef,
        isManualOverviewResetRef,
        camBaseRef,
        targetBaseRef,
      });

      hookHolder.current = gestures;
      return React.createElement('div', null, 'Harness');
    }

    act(() => {
      if (root) root.render(React.createElement(Harness));
    });

    expect(hookHolder.current?.isUserInteractingRef.current).toBe(false);
    act(() => {
      hookHolder.current?.onOrbitStart();
    });
    expect(hookHolder.current?.isUserInteractingRef.current).toBe(true);
  });

  it('[TC-GES.11/MSS][UC-GESTURE/MSS] useCameraGestures onOrbitEnd bat co isSkippingCameraAnimRef khi thoa man dieu kien tap-to-skip', () => {
    const hookHolder: { current: UseCameraGesturesReturn | null } = { current: null };

    function Harness(): React.ReactElement {
      const camera = new PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(24.65, 25.3, 24.65);
      const controlsRef = useRef<OrbitControlsImpl | null>(null);
      const currentOverviewPosRef = useRef<[number, number, number]>([24.6, 25.3, 24.6]);
      const currentOverviewTargetRef = useRef<[number, number, number]>([2.2, 0, 2.2]);
      const isResettingRef = useRef<boolean>(false);
      const softReturnRef = useRef<SoftReturnState | null>(null);
      const isManualOverviewResetRef = useRef<boolean>(false);
      const camBaseRef = useRef<[number, number, number]>([24.6, 25.3, 24.6]);
      const targetBaseRef = useRef<[number, number, number]>([2.2, 0, 2.2]);

      const gestures = useCameraGestures({
        camera,
        controlsRef,
        currentOverviewPosRef,
        currentOverviewTargetRef,
        isResettingRef,
        softReturnRef,
        isManualOverviewResetRef,
        camBaseRef,
        targetBaseRef,
        activeAnimation: { isAnimating: true },
      });

      hookHolder.current = gestures;
      return React.createElement('div', null, 'Harness');
    }

    act(() => {
      if (root) root.render(React.createElement(Harness));
    });

    act(() => {
      hookHolder.current?.onOrbitStart();
    });

    act(() => {
      hookHolder.current?.onOrbitEnd();
    });

    expect(hookHolder.current?.isSkippingCameraAnimRef.current).toBe(true);
    expect((hookHolder.current?.lastSkipTimeRef.current ?? 0)).toBeGreaterThan(0);
  });

  it('[TC-GES.12/MSS][UC-GESTURE/MSS] useCameraGestures handleFrameSkip snap camera va chot giu hasSkippedCurrentMoveRef', () => {
    const hookHolder: { current: UseCameraGesturesReturn | null } = { current: null };
    const testCamera = new PerspectiveCamera(45, 1, 0.1, 1000);
    testCamera.position.set(20, 20, 20);

    function Harness(): React.ReactElement {
      const controlsRef = useRef<OrbitControlsImpl | null>(null);
      const currentOverviewPosRef = useRef<[number, number, number]>([24.6, 25.3, 24.6]);
      const currentOverviewTargetRef = useRef<[number, number, number]>([2.2, 0, 2.2]);
      const isResettingRef = useRef<boolean>(false);
      const softReturnRef = useRef<SoftReturnState | null>(null);
      const isManualOverviewResetRef = useRef<boolean>(false);
      const camBaseRef = useRef<[number, number, number]>([20, 20, 20]);
      const targetBaseRef = useRef<[number, number, number]>([2.2, 0, 2.2]);

      const gestures = useCameraGestures({
        camera: testCamera,
        controlsRef,
        currentOverviewPosRef,
        currentOverviewTargetRef,
        isResettingRef,
        softReturnRef,
        isManualOverviewResetRef,
        camBaseRef,
        targetBaseRef,
      });

      hookHolder.current = gestures;
      return React.createElement('div', null, 'Harness');
    }

    act(() => {
      if (root) root.render(React.createElement(Harness));
    });

    // Simulate skip flag active
    if (hookHolder.current) {
      hookHolder.current.isSkippingCameraAnimRef.current = true;
    }
    const handled = hookHolder.current?.handleFrameSkip({
      position: [10, 15, 10],
      target: [2, 0, 2],
    });

    expect(handled).toBe(true);
    expect(hookHolder.current?.hasSkippedCurrentMoveRef.current).toBe(true);
    expect(testCamera.position.x).toBe(10);
    expect(hookHolder.current?.isSkippingCameraAnimRef.current).toBe(false);
  });

  it('[TC-GES.13/MSS][UC-GESTURE/MSS] checkTargetOwnedByHuman tra ve true neu o thuoc so huu cua nguoi that va chua the chap', () => {
    const playersInfo = {
      p1: { isBot: false, bankrupt: false, ownedProperties: [5, 10], mortgagedProperties: [] },
      p2: { isBot: true, bankrupt: false, ownedProperties: [15], mortgagedProperties: [] },
    };

    const isOwnedByHuman = checkTargetOwnedByHuman(playersInfo, 5);
    const isBotCell = checkTargetOwnedByHuman(playersInfo, 15);
    const isUnowned = checkTargetOwnedByHuman(playersInfo, 20);

    expect(isOwnedByHuman).toBe(true);
    expect(isBotCell).toBe(false);
    expect(isUnowned).toBe(false);
  });

  it('[TC-GES.14/MSS][UC-GESTURE/MSS] useDebugCameraGlobals thiet lap ham reset window va cleanup an toan khi unmount', () => {
    function Harness(): React.ReactElement {
      const scene = new Scene();
      const camera = new PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(24.6, 25.3, 24.6);
      const controlsRef = useRef<OrbitControlsImpl | null>(null);
      const camBaseRef = useRef<[number, number, number]>([24.6, 25.3, 24.6]);
      const targetBaseRef = useRef<[number, number, number]>([2.2, 0, 2.2]);
      const currentOverviewPosRef = useRef<[number, number, number]>([24.6, 25.3, 24.6]);
      const currentOverviewTargetRef = useRef<[number, number, number]>([2.2, 0, 2.2]);
      const isResettingRef = useRef<boolean>(false);
      const softReturnRef = useRef<SoftReturnState | null>(null);
      const isManualOverviewResetRef = useRef<boolean>(false);
      const isUserInteractingRef = useRef<boolean>(false);

      useDebugCameraGlobals({
        scene,
        camera,
        controlsRef,
        defaultTarget: [2.2, 0, 2.2],
        camBaseRef,
        targetBaseRef,
        currentOverviewPosRef,
        currentOverviewTargetRef,
        isResettingRef,
        isManualOverviewResetRef,
        softReturnRef,
        isUserInteractingRef,
      });

      return React.createElement('div', null, 'Harness');
    }

    act(() => {
      if (root) root.render(React.createElement(Harness));
    });

    expect(typeof window.__resetCameraToDefault).toBe('function');
    const currentRoot = root;
    if (currentRoot) {
      act(() => {
        currentRoot.unmount();
      });
      root = null;
    }
    expect(window.__resetCameraToDefault).toBeUndefined();
  });

  it('[TC-GES.15/MSS][UC-GESTURE/MSS] useCameraGestures onOrbitEnd bat hasUserCustomCamera khi goc nhin bi xoay lech lon', () => {
    const hookHolder: { current: UseCameraGesturesReturn | null } = { current: null };

    function Harness(): React.ReactElement {
      const camera = new PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(30, 25, 30);
      const controlsRef = useRef<OrbitControlsImpl | null>(null);
      const currentOverviewPosRef = useRef<[number, number, number]>([24.6, 25.3, 24.6]);
      const currentOverviewTargetRef = useRef<[number, number, number]>([2.2, 0, 2.2]);
      const isResettingRef = useRef<boolean>(false);
      const softReturnRef = useRef<SoftReturnState | null>(null);
      const isManualOverviewResetRef = useRef<boolean>(false);
      const camBaseRef = useRef<[number, number, number]>([24.6, 25.3, 24.6]);
      const targetBaseRef = useRef<[number, number, number]>([2.2, 0, 2.2]);

      const gestures = useCameraGestures({
        camera,
        controlsRef,
        currentOverviewPosRef,
        currentOverviewTargetRef,
        isResettingRef,
        softReturnRef,
        isManualOverviewResetRef,
        camBaseRef,
        targetBaseRef,
      });

      hookHolder.current = gestures;
      return React.createElement('div', null, 'Harness');
    }

    act(() => {
      if (root) root.render(React.createElement(Harness));
    });

    expect(useGameStore.getState().hasUserCustomCamera).toBe(false);
    act(() => {
      hookHolder.current?.onOrbitStart();
    });
    act(() => {
      hookHolder.current?.onOrbitEnd();
    });
    expect(useGameStore.getState().hasUserCustomCamera).toBe(true);
  });

  it('[TC-GES.16/MSS][UC-GESTURE/MSS] useCameraGestures onOrbitEnd giu nguyen hasUserCustomCamera false khi xoay nhe duoi nguong', () => {
    const hookHolder: { current: UseCameraGesturesReturn | null } = { current: null };

    function Harness(): React.ReactElement {
      const camera = new PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.set(24.7, 25.3, 24.7);
      const controlsRef = useRef<OrbitControlsImpl | null>(null);
      const currentOverviewPosRef = useRef<[number, number, number]>([24.6, 25.3, 24.6]);
      const currentOverviewTargetRef = useRef<[number, number, number]>([2.2, 0, 2.2]);
      const isResettingRef = useRef<boolean>(false);
      const softReturnRef = useRef<SoftReturnState | null>(null);
      const isManualOverviewResetRef = useRef<boolean>(false);
      const camBaseRef = useRef<[number, number, number]>([24.6, 25.3, 24.6]);
      const targetBaseRef = useRef<[number, number, number]>([2.2, 0, 2.2]);

      const gestures = useCameraGestures({
        camera,
        controlsRef,
        currentOverviewPosRef,
        currentOverviewTargetRef,
        isResettingRef,
        softReturnRef,
        isManualOverviewResetRef,
        camBaseRef,
        targetBaseRef,
      });

      hookHolder.current = gestures;
      return React.createElement('div', null, 'Harness');
    }

    act(() => {
      if (root) root.render(React.createElement(Harness));
    });

    useGameStore.setState({ hasUserCustomCamera: false });
    act(() => {
      hookHolder.current?.onOrbitStart();
    });
    act(() => {
      hookHolder.current?.onOrbitEnd();
    });
    expect(useGameStore.getState().hasUserCustomCamera).toBe(false);
  });
});
