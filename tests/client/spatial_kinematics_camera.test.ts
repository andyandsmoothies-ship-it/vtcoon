// [UI-S01/MSS][UI-S04/MSS][TC-KIN/MSS][UC-IMP291] IMP-291: Spatial Kinematics Camera Contract Suite
// Traceability: docs/domain/gotchas/3d_cinematics.md (Gotcha 15), .agents/plans/PLAN_IMP_291_SPATIAL_KINEMATICS_CAMERA.md
// 5-Facet Universal Behavioral Matrix:
//   Facet 1: Boundary & Range — Standard Chase 4-Side Outer Orbit (TC-KIN.01a..01d, TC-KIN.02a..02b)
//   Facet 2: State Reactivity & Corner Banking — Dual-Vector Tangent Curve (TC-KIN.03a..03e)
//   Facet 3: Settle Invariants — Landing Settle Gate vs Whiplash Snap (TC-KIN.04a..04b)
//   Facet 4: North-Side Framing — Adaptive 20% Distance Contraction (TC-KIN.05a..05c)
//   Facet 5: Legacy Regression Invariants — 100% Backward Compatibility (TC-KIN.06a..06c)

import { describe, it, expect } from 'vitest';
import {
  calculateStreetChaseCameraState,
} from '../../src/client/3d/cinematic_chase_camera';
import {
  calculateChaseCameraPosition,
  calculateTargetCameraState,
} from '../../src/client/3d/camera_state_machine';

declare module '../../src/client/3d/cinematic_chase_camera' {
  interface StreetChaseParams {
    readonly isTransientTurnCorner?: boolean;
    readonly enableNorthFraming?: boolean;
  }
}

describe('[UC-IMP291] Spatial Kinematics Camera System Contract Suite', () => {
  it('[TC-KIN.01a/MSS] Standard chase o Canh Nam (Z > 0) dat camera o mep ngoai Z > 9', () => {
    const south = calculateChaseCameraPosition([0, 0, 6.0]);
    expect(south[2]).toBeGreaterThan(9);
  });

  it('[TC-KIN.01b/MSS] Standard chase o Canh Tay (X < 0) dat camera o mep ngoai X < -9', () => {
    const west = calculateChaseCameraPosition([-6.0, 0, 0]);
    expect(west[0]).toBeLessThan(-9);
  });

  it('[TC-KIN.01c/MSS] Standard chase o Canh Bac (Z < 0) dat camera o mep ngoai Z < -9', () => {
    const north = calculateChaseCameraPosition([0, 0, -6.0]);
    expect(north[2]).toBeLessThan(-9);
  });

  it('[TC-KIN.01d/MSS] Standard chase o Canh Dong (X > 0) dat camera o mep ngoai X > 9', () => {
    const east = calculateChaseCameraPosition([6.0, 0, 0]);
    expect(east[0]).toBeGreaterThan(9);
  });

  it('[TC-KIN.02a/A1] calculateChaseCameraPosition tai [0, 0, 0] giu dung [3.6, 4.2, 3.6]', () => {
    const pos = calculateChaseCameraPosition([0, 0, 0]);
    expect(pos).toEqual([3.6, 4.2, 3.6]);
  });

  it('[TC-KIN.02b/A1] calculateTargetCameraState standard chase tai [0, 0, 0] giu dung [3.6, 4.2, 3.6]', () => {
    const state = calculateTargetCameraState('pawn_chase', [0, 0, 0]);
    expect(state.position).toEqual([3.6, 4.2, 3.6]);
    expect(state.fov).toBeDefined();
  });

  it('[TC-KIN.03a/MSS] Transient Corner Banking tai o 10 (Tay-Nam) uon cong vi tri theo ban kinh C1', () => {
    const banked = calculateStreetChaseCameraState({
      pawnPosition: [-9, 0, 9],
      cellIndex: 10,
      isTransientTurnCorner: true,
    });
    const posRadius = Math.hypot(banked.position[0] - (-9), banked.position[2] - 9);
    expect(banked.position[0]).toBeLessThan(-6.5);
    expect(posRadius).toBeCloseTo(Math.hypot(3.0, 2.2), 1);
  });

  it('[TC-KIN.03b/MSS] Transient Corner Banking tai o 10 (Tay-Nam) uon cong target dong bo', () => {
    const banked = calculateStreetChaseCameraState({
      pawnPosition: [-9, 0, 9],
      cellIndex: 10,
      isTransientTurnCorner: true,
    });
    const tarRadius = Math.hypot(banked.target[0] - (-9), banked.target[2] - 9);
    expect(banked.target[0]).toBeGreaterThan(-9.8);
    expect(tarRadius).toBeCloseTo(Math.hypot(1.0, 0.5), 1);
  });

  it('[TC-KIN.03c/A2] Transient Corner Banking tai o 20 (Tay-Bac) huong ve mep ngoai goc am X am Z', () => {
    const banked = calculateStreetChaseCameraState({
      pawnPosition: [-9, 0, -9],
      cellIndex: 20,
      isTransientTurnCorner: true,
    });
    expect(banked.position[0]).toBeLessThan(-9);
    expect(banked.position[2]).toBeLessThan(-9);
  });

  it('[TC-KIN.03d/A3] Transient Corner Banking tai o 30 (Bac-Dong) huong ve mep ngoai duong X am Z', () => {
    const banked = calculateStreetChaseCameraState({
      pawnPosition: [9, 0, -9],
      cellIndex: 30,
      isTransientTurnCorner: true,
    });
    expect(banked.position[0]).toBeGreaterThan(9);
    expect(banked.position[2]).toBeLessThan(-9);
  });

  it('[TC-KIN.03e/A4] Transient Corner Banking tai o 0 (Dong-Nam) huong ve mep ngoai duong X duong Z', () => {
    const banked = calculateStreetChaseCameraState({
      pawnPosition: [9, 0, 9],
      cellIndex: 0,
      isTransientTurnCorner: true,
    });
    expect(banked.position[0]).toBeGreaterThan(9);
    expect(banked.position[2]).toBeGreaterThan(9);
  });

  it('[TC-KIN.04a/A1] Settle tai o 10 (isTransient = false) snap ve position mat tien tieu chuan', () => {
    const standard = calculateStreetChaseCameraState({
      pawnPosition: [-9, 0, 9],
      cellIndex: 10,
      isTransientTurnCorner: false,
    });
    expect(standard.position).toEqual([-6.0, 2.8, 11.2]);
  });

  it('[TC-KIN.04b/A1] Settle tai o 10 (isTransient = false) snap ve target mat tien tieu chuan', () => {
    const standard = calculateStreetChaseCameraState({
      pawnPosition: [-9, 0, 9],
      cellIndex: 10,
      isTransientTurnCorner: false,
    });
    expect(standard.target).toEqual([-10.0, 0.6, 8.5]);
  });

  it('[TC-KIN.05a/MSS] North-Side framing tai Z = -9 co lai 20% toa do position X', () => {
    const northFramed = calculateStreetChaseCameraState({
      pawnPosition: [0, 0, -9],
      cellIndex: 25,
      enableNorthFraming: true,
    });
    expect(northFramed.position[0]).toBeCloseTo(-2.4, 3);
  });

  it('[TC-KIN.05b/MSS] North-Side framing tai Z = -9 co lai 20% toa do position Y va Z', () => {
    const northFramed = calculateStreetChaseCameraState({
      pawnPosition: [0, 0, -9],
      cellIndex: 25,
      enableNorthFraming: true,
    });
    expect(northFramed.position[1]).toBeCloseTo(2.24, 3);
    expect(northFramed.position[2]).toBeCloseTo(-10.76, 3);
  });

  it('[TC-KIN.05c/MSS] North-Side framing tai Z = -9 co lai target tuong ung', () => {
    const northFramed = calculateStreetChaseCameraState({
      pawnPosition: [0, 0, -9],
      cellIndex: 25,
      enableNorthFraming: true,
    });
    expect(northFramed.target).toEqual([0.8, 0.6, -8.6]);
  });

  it('[TC-KIN.06a/A1] North-Side framing khi enableNorthFraming = false giu nguyen 100% TC-263.05', () => {
    const falseState = calculateStreetChaseCameraState({
      pawnPosition: [-2.0, 0.0, -6.0],
      cellIndex: 25,
      enableNorthFraming: false,
    });
    expect(falseState.position[2]).toBeCloseTo(-8.2, 3);
  });

  it('[TC-KIN.06b/A1] North-Side framing khi enableNorthFraming undefined giu nguyen 100% TC-263.05', () => {
    const defaultState = calculateStreetChaseCameraState({
      pawnPosition: [-2.0, 0.0, -6.0],
      cellIndex: 25,
    });
    expect(defaultState.position[2]).toBeCloseTo(-8.2, 3);
  });

  it('[TC-KIN.06c/A2] Camera state luon co fov hop le va duong', () => {
    const state = calculateStreetChaseCameraState({
      pawnPosition: [0, 0, 0],
    });
    expect(Number.isFinite(state.fov)).toBe(true);
    expect(state.fov > 0).toBeTruthy();
  });
});
