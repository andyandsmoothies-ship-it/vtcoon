// @vitest-environment happy-dom
// [UI-S01/MSS][UI-S04/MSS][IMP-446] Board Overview Camera Tuning & Deep-Round Auto-Zoom Suppression Contract Suite
// Traceability: docs/domain/gotchas/3d_cinematics.md (Gotcha 15, Gotcha 63), .agents/plans/PLAN_IMP_446_BOARD_OVERVIEW_CAMERA_TUNING.md
// Universal 5-Facet Behavioral Matrix & Anti-TIDD Clean Contract Suite

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerspectiveCamera, Scene, Vector3 } from 'three';
import '../helpers/r3f_test_harness.js';
import { sharedR3FHarness } from '../helpers/r3f_test_harness.js';
import {
  CAMERA_CONFIG,
  type TargetCameraState,
} from '../../src/client/3d/camera_state_machine';
import {
  calculateResponsiveOverviewFov,
  calculateResponsiveOverviewCameraState,
} from '../../src/client/3d/camera_kinematic_helpers';
import {
  resolveOverviewConfigByPhase,
} from '../../src/client/3d/cinematic_spline_flyby';
import { AdaptiveCinematicCamera } from '../../src/client/3d/adaptive_cinematic_camera';
import { useGameStore } from '../../src/client/store/game_store';

interface MockControlsHandle {
  minDistance: number;
  maxDistance: number;
  target: { x: number; y: number; z: number; set: (x: number, y: number, z: number) => void };
  update: () => void;
}

const mockControls: MockControlsHandle = {
  minDistance: 14,
  maxDistance: 65,
  target: {
    x: 2.2,
    y: 0.0,
    z: 2.2,
    set(x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
    },
  },
  update: vi.fn(),
};

vi.mock('@react-three/drei', () => ({
  OrbitControls: React.forwardRef<MockControlsHandle>((_props, ref) => {
    React.useImperativeHandle(ref, () => mockControls);
    return null;
  }),
}));

vi.mock('../../src/client/3d/camera_location_beacon', () => ({
  CameraLocationBeacon: () => null,
}));

describe('[IMP-446] Board Overview Camera Tuning & Responsive Framing Contract Suite', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    useGameStore.setState({
      hasUserCustomCamera: false,
      cameraFocusCell: null,
      isRolling: false,
      hasRolledThisTurn: false,
      currentTurnPlayerId: 'player1',
      activePawnAnimation: null,
      activeModal: null,
      roundNumber: 1,
      levelMap: {},
    });

    const testCamera = new PerspectiveCamera(24, 1.77, 0.1, 100);
    testCamera.position.set(24.6, 25.3, 24.6);
    testCamera.lookAt(2.2, 0.0, 2.2);

    sharedR3FHarness.reset();
    sharedR3FHarness.state.camera = testCamera;
    sharedR3FHarness.state.scene = new Scene();
    mockControls.minDistance = 14;
    mockControls.target.x = 2.2;
    mockControls.target.y = 0.0;
    mockControls.target.z = 2.2;
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
    }
    if (container) {
      container.remove();
      container = null;
      root = null;
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: UNIFIED OVERVIEW ELEVATION (INV-446.01 / TC-446.01)
  // =========================================================================
  it('[TC-446.01/MSS][UC-UNIFIED-OVERVIEW-ELEVATION] resolveOverviewConfigByPhase in Phase 3 preserves Y = 25.3m, target [2.2, 0, 2.2], and speed 3.2', () => {
    const config = resolveOverviewConfigByPhase(3, CAMERA_CONFIG.overview);

    expect(config.position[1]).toBe(25.3);
    expect(config.target).toEqual([2.2, 0.0, 2.2]);
    expect(config.speed).toBe(3.2);
  });

  it('[TC-446.01b/A1][UC-UNIFIED-OVERVIEW-PHASE2] resolveOverviewConfigByPhase in Phase 2 preserves Y = 25.3m, target [2.2, 0, 2.2], and speed 3.2', () => {
    const config = resolveOverviewConfigByPhase(2, CAMERA_CONFIG.overview);

    expect(config.position[1]).toBe(25.3);
    expect(config.target).toEqual([2.2, 0.0, 2.2]);
    expect(config.speed).toBe(3.2);
  });

  // =========================================================================
  // FACET 2: RESPONSIVE MOBILE PORTRAIT FRAMING & NDC (INV-446.04 / TC-446.02)
  // =========================================================================
  it('[TC-446.02a/MSS][UC-RESPONSIVE-MOBILE-OVERVIEW-FOV-Y] calculateResponsiveOverviewCameraState on aspect 0.48 returns calibrated FOV in [44, 46] and elevation Y <= 30.0m', () => {
    const state = calculateResponsiveOverviewCameraState(0.48, CAMERA_CONFIG.overview);

    expect(state.fov).toBeGreaterThanOrEqual(44);
    expect(state.fov).toBeLessThanOrEqual(46);
    expect(state.position[1]).toBeLessThanOrEqual(30.0);
    expect(state.position[1]).toBeGreaterThan(25.3);
  });

  it('[TC-446.02b/A2][UC-RESPONSIVE-MOBILE-OVERVIEW-NDC] calculateResponsiveOverviewCameraState on aspect 0.48 projects lateral flank corners within |NDC| <= 1.28', () => {
    const state = calculateResponsiveOverviewCameraState(0.48, CAMERA_CONFIG.overview);
    const camera = new PerspectiveCamera(state.fov, 0.48, 0.1, 100);
    camera.position.set(state.position[0], state.position[1], state.position[2]);
    camera.lookAt(state.target[0], state.target[1], state.target[2]);
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();

    const cell10 = new Vector3(-9, 0, 9);
    cell10.project(camera);
    const cell30 = new Vector3(9, 0, -9);
    cell30.project(camera);

    expect(Math.abs(cell10.x)).toBeLessThanOrEqual(1.28);
    expect(Math.abs(cell30.x)).toBeLessThanOrEqual(1.28);
  });

  // =========================================================================
  // FACET 3: TARGET-RELATIVE PITCH ANGLE INVARIANCE (INV-446.04 / TC-446.03)
  // =========================================================================
  it('[TC-446.03/MSS][UC-TARGET-RELATIVE-PITCH-INVARIANCE] calculateResponsiveOverviewCameraState preserves 38.6 deg pitch angle between landscape and portrait', () => {
    const landscapeState = calculateResponsiveOverviewCameraState(1.77, CAMERA_CONFIG.overview);
    const portraitState = calculateResponsiveOverviewCameraState(0.48, CAMERA_CONFIG.overview);

    const dxL = landscapeState.position[0] - landscapeState.target[0];
    const dzL = landscapeState.position[2] - landscapeState.target[2];
    const dyL = landscapeState.position[1] - landscapeState.target[1];
    const landscapePitch = (Math.atan2(dyL, Math.hypot(dxL, dzL)) * 180) / Math.PI;

    const dxP = portraitState.position[0] - portraitState.target[0];
    const dzP = portraitState.position[2] - portraitState.target[2];
    const dyP = portraitState.position[1] - portraitState.target[1];
    const portraitPitch = (Math.atan2(dyP, Math.hypot(dxP, dzP)) * 180) / Math.PI;

    expect(portraitState.position[1]).toBeGreaterThan(landscapeState.position[1]);
    expect(landscapePitch).toBeCloseTo(38.6, 1);
    expect(portraitPitch).toBeCloseTo(38.6, 1);
    expect(Math.abs(portraitPitch - landscapePitch)).toBeLessThan(0.1);
  });

  // =========================================================================
  // FACET 4: CALL-SITE WIRING & MANUAL MODE INTEGRATION (INV-446.03 / TC-446.04)
  // =========================================================================
  it('[TC-446.04a/MSS][UC-CALL-SITE-WIRING-MANUAL-MODE] AdaptiveCinematicCamera wires manualMode overview so minDistance remains 14m after reset trigger', () => {
    useGameStore.setState({ activeModal: 'transit_wheel' });
    act(() => {
      root?.render(React.createElement(AdaptiveCinematicCamera, null));
    });
    sharedR3FHarness.advanceFrame(0.016);

    window.__resetCameraToDefault?.();

    act(() => {
      vi.advanceTimersByTime(1500);
      sharedR3FHarness.advanceFrame(0.016);
    });

    expect(mockControls.minDistance).toBe(14);
  });

  it('[TC-446.04b/A3][UC-CALL-SITE-WIRING-POST-SOFT-RETURN-STABILITY] AdaptiveCinematicCamera sustains 14m overview distance post-soft-return without premature collapse', () => {
    useGameStore.setState({ activeModal: 'transit_wheel' });
    act(() => {
      root?.render(React.createElement(AdaptiveCinematicCamera, null));
    });
    sharedR3FHarness.advanceFrame(0.016);

    window.__resetCameraToDefault?.();

    act(() => {
      vi.advanceTimersByTime(3000);
      sharedR3FHarness.advanceFrame(0.016);
    });

    expect(mockControls.minDistance).toBe(14);
  });

  // =========================================================================
  // FACET 5: DEAD MAN\'S SWITCH & EPHEMERAL TTL (INV-446.03 / TC-446.05)
  // =========================================================================
  it('[TC-446.05a/MSS][UC-CALL-SITE-WIRING-DEAD-MANS-SWITCH-TTL] AdaptiveCinematicCamera releases manual overview lock after 12s idle watchdog expires', () => {
    useGameStore.setState({ activeModal: 'transit_wheel' });
    act(() => {
      root?.render(React.createElement(AdaptiveCinematicCamera, null));
    });
    sharedR3FHarness.advanceFrame(0.016);

    window.__resetCameraToDefault?.();

    act(() => {
      vi.advanceTimersByTime(5000);
      sharedR3FHarness.advanceFrame(0.016);
    });
    expect(mockControls.minDistance).toBe(14);

    act(() => {
      vi.advanceTimersByTime(8000); // 5000 + 8000 = 13000ms > 12000ms TTL
      sharedR3FHarness.advanceFrame(0.016);
    });
    expect(mockControls.minDistance).toBe(3.8);
  });

  it('[TC-446.05b/A4][UC-CALL-SITE-WIRING-TURN-CHANGE-RELEASE] AdaptiveCinematicCamera releases manual overview lock deterministically on turn change', () => {
    useGameStore.setState({ activeModal: 'transit_wheel' });
    act(() => {
      root?.render(React.createElement(AdaptiveCinematicCamera, null));
    });
    sharedR3FHarness.advanceFrame(0.016);

    window.__resetCameraToDefault?.();

    act(() => {
      vi.advanceTimersByTime(2000);
      sharedR3FHarness.advanceFrame(0.016);
    });
    expect(mockControls.minDistance).toBe(14);

    act(() => {
      useGameStore.setState({ currentTurnPlayerId: 'player2', activeModal: null, cameraFocusCell: 5 });
      sharedR3FHarness.advanceFrame(0.016);
    });
    expect(mockControls.minDistance).toBe(3.8);
  });

  // =========================================================================
  // FACET 6: RELATIONAL COVARIANCE ACROSS VIEWPORT RATIOS (INV-446.04 / TC-446.06)
  // =========================================================================
  it('[TC-446.06/MSS][UC-RELATIONAL-COVARIANCE] calculateResponsiveOverviewCameraState exhibits non-constant covariance between aspect 1.77 and 0.48', () => {
    const landscapeState = calculateResponsiveOverviewCameraState(1.77, CAMERA_CONFIG.overview);
    const portraitState = calculateResponsiveOverviewCameraState(0.48, CAMERA_CONFIG.overview);

    expect(portraitState.fov).not.toBe(landscapeState.fov);
    expect(portraitState.position[1]).not.toBe(landscapeState.position[1]);
    expect(Number.isFinite(portraitState.position[1])).toBe(true);
    expect(Number.isFinite(portraitState.fov)).toBe(true);
  });
});
