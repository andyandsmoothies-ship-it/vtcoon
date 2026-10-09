// @vitest-environment happy-dom
// [UI-S04/MSS][TC-RET/MSS][TC-BCN/MSS][TC-KIN/MSS] IMP-294: OrbitControls Soft Return & Free-Roam Lock Contract Suite
// Traceability: docs/domain/gotchas/3d_cinematics.md (Gotcha 15, Gotcha 63), .agents/plans/PLAN_IMP_294_SOFT_RETURN_AND_FREE_ROAM_LOCK.md
// Universal 5-Facet Behavioral Matrix:
//   Facet 1: Boundary & Range — Azimuthal Shortest-Arc Wrap & Polar Angle Clamp (TC-RET.05, TC-RET.07)
//   Facet 2: State Reactivity & Pacing — Spherical Slerp Interpolation & Cubic-Out Easing (TC-RET.01..04, TC-RET.06)
//   Facet 3: Settle & Resource Isolation — Zero GPU Churn Beacon Rendering & Break-on-Touch Handover (TC-RET.09, TC-BCN.01..02)
//   Facet 4: Error Defense & Invariants — NaN & Infinity Defense SSOT Fallback (TC-RET.08, TC-BCN.03)
//   Facet 5: Cross-Coupling Blast Radius — Side-Aware Orientation & Screen Shake Kinematic Parity (TC-KIN.01..03, TC-BCN.04)
//
// Dynamic Triad Mandate:
//   (1) Re-entrant storm: Rapid calls to sampleSoftReturn clamp monotonic progress safely without NaN
//   (2) Phase boundary rejection: shouldBreakOnTouch cleanly isolates interactive gesture from camera resets
//   (3) Unmount / teardown cleanup: Permanent beacon group node toggles visible without DOM mount/unmount churn

import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGameStore } from '../../src/client/store/game_store';
import { cellPosition } from '../../src/client/3d/board_coords';

import {
  initSoftReturn,
  sampleSoftReturn,
  shouldBreakOnTouch,
  type SoftReturnState,
} from '../../src/client/3d/camera_soft_return';

import {
  calculateBeaconPulseOpacity,
  resolveBeaconCoordinates,
  CameraLocationBeacon,
} from '../../src/client/3d/camera_location_beacon';

import {
  resolveSideAwareCameraOffset,
  calculateTileFocusCameraPosition,
  calculateScreenShake,
} from '../../src/client/3d/camera_kinematic_helpers';

// Mock R3F hook for headless testing
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

describe('[UC-RET] Spherical Slerp Orbit Return Contract Suite', () => {
  it('[TC-RET.01/MSS][UC-RET] Khoi tao trang thai soft return hop le voi thoi luong mac dinh 1200ms va tien do t = 0', () => {
    const startPos: [number, number, number] = [10, 15, 10];
    const startTarget: [number, number, number] = [0, 0, 0];
    const destPos: [number, number, number] = [24.6, 25.3, 24.6];
    const destTarget: [number, number, number] = [2.2, 0, 2.2];

    const state = initSoftReturn(startPos, startTarget, destPos, destTarget, 1000);

    expect(state.durationMs).toBe(1200);
    expect(state.startTime).toBe(1000);
    expect(state.startPos).toEqual([10, 15, 10]);
    expect(state.destPos).toEqual([24.6, 25.3, 24.6]);
  });

  it('[TC-RET.02/A1][UC-RET] sampleSoftReturn tai t = 0 tra ve vi tri va muc tieu khop chuan voi toa do xuat phat', () => {
    const state: SoftReturnState = initSoftReturn([10, 15, 10], [0, 0, 0], [24.6, 25.3, 24.6], [2.2, 0, 2.2], 1000, 1200);
    const sample = sampleSoftReturn(state, 1000);

    expect(sample.position[0]).toBeCloseTo(10, 1);
    expect(sample.position[1]).toBeCloseTo(15, 1);
    expect(sample.position[2]).toBeCloseTo(10, 1);
    expect(sample.isFinished).toBe(false);
  });

  it('[TC-RET.03/MSS][UC-RET] sampleSoftReturn khi vuot qua thoi luong (elapsed >= duration) tra ve dich den va isFinished = true', () => {
    const state: SoftReturnState = initSoftReturn([10, 15, 10], [0, 0, 0], [24.6, 25.3, 24.6], [2.2, 0, 2.2], 1000, 1200);
    const sample = sampleSoftReturn(state, 2500);

    expect(sample.position).toEqual([24.6, 25.3, 24.6]);
    expect(sample.target).toEqual([2.2, 0, 2.2]);
    expect(sample.isFinished).toBe(true);
  });

  it('[TC-RET.04/MSS][UC-RET] Camera quay nua vong doi xung qua tam bao ton ban kinh R khong sup do xuyen tam', () => {
    const state: SoftReturnState = initSoftReturn([20, 10, 0], [0, 0, 0], [-20, 10, 0], [0, 0, 0], 1000, 1200);
    const sample = sampleSoftReturn(state, 1600);
    const r0 = Math.hypot(20, 10, 0);
    const rMid = Math.hypot(sample.position[0] - sample.target[0], sample.position[1] - sample.target[1], sample.position[2] - sample.target[2]);

    expect(rMid).toBeGreaterThanOrEqual(r0 * 0.95);
    expect(sample.isFinished).toBe(false);
  });

  it('[TC-RET.05/A2][UC-RET] Goc phuong vi azimuthal cat qua ranh gioi +-pi di chuyen theo cung ngan nhat', () => {
    const startPos: [number, number, number] = [Math.cos(3.0) * 20, 10, Math.sin(3.0) * 20];
    const destPos: [number, number, number] = [Math.cos(-3.0) * 20, 10, Math.sin(-3.0) * 20];
    const state: SoftReturnState = initSoftReturn(startPos, [0, 0, 0], destPos, [0, 0, 0], 1000, 1200);
    const sample = sampleSoftReturn(state, 1600);

    expect(sample.position[0]).toBeLessThan(-15);
    expect(Math.abs(sample.position[2])).toBeLessThan(5);
  });

  it('[TC-RET.06/A3][UC-RET] Ham lam min Cubic-Out dat tien trinh gia toc u = 0.875 tai nua thoi luong tau = 0.5', () => {
    const state: SoftReturnState = initSoftReturn([0, 10, 0], [0, 0, 0], [0, 10, 0], [100, 0, 0], 1000, 1200);
    const sample = sampleSoftReturn(state, 1600);

    expect(sample.target[0]).toBeCloseTo(87.5, 1);
  });

  it('[TC-RET.07/A4][UC-RET] Goc cuc nghieng polar angle sat cuc dung xu ly muot ma tranh diem ky di gimbal lock', () => {
    const state: SoftReturnState = initSoftReturn([0.0001, 30, 0.0001], [0, 0, 0], [20, 15, 20], [0, 0, 0], 1000, 1200);
    const sample = sampleSoftReturn(state, 1600);

    expect(Number.isFinite(sample.position[0])).toBe(true);
    expect(Number.isFinite(sample.position[1])).toBe(true);
    expect(Number.isFinite(sample.position[2])).toBe(true);
  });

  it('[TC-RET.08/A5][UC-RET] Phong thu NaN va Infinite kich hoat fallback SSOT an toan [24.6, 25.3, 24.6]', () => {
    const state: SoftReturnState = initSoftReturn([NaN, NaN, NaN], [NaN, NaN, NaN], [NaN, NaN, NaN], [NaN, NaN, NaN], NaN, 1200);
    const sample = sampleSoftReturn(state, 1600);

    expect(sample.position).toEqual([24.6, 25.3, 24.6]);
    expect(sample.target).toEqual([2.2, 0.0, 2.2]);
    expect(sample.isFinished).toBe(false);
  });

  it('[TC-RET.09/MSS][UC-RET] shouldBreakOnTouch tra ve true khi nguoi choi cham man hinh trong luc camera dang reset', () => {
    expect(shouldBreakOnTouch(true, true)).toBe(true);
    expect(shouldBreakOnTouch(false, true)).toBe(false);
    expect(shouldBreakOnTouch(true, false)).toBe(false);
    expect(shouldBreakOnTouch(false, false)).toBe(false);
  });
});

function isGroupWithVisible(element: unknown): element is React.ReactElement<{ visible?: boolean }> {
  return React.isValidElement(element);
}

describe('[UC-BCN] Ngon Hai Dang 3.5m Dinh Vi Quan Co Contract Suite', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
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
    useGameStore.setState({
      hasUserCustomCamera: false,
      activePawnAnimation: null,
    });
  });

  it('[TC-BCN.01/MSS][UC-BCN] Dieu kien hien thi beacon bat visible = true khi hasUserCustomCamera va quan co dang nhay', () => {
    useGameStore.setState({
      hasUserCustomCamera: true,
      activePawnAnimation: {
        playerId: 'p1',
        fromCell: 0,
        targetCell: 5,
        currentIndex: 2,
        waypoints: [0, 1, 2, 3, 4, 5],
        isAnimating: true,
      },
    });

    let renderedElement: unknown = null;
    function BeaconCaptureHarness(): null {
      renderedElement = CameraLocationBeacon();
      return null;
    }

    act(() => {
      root?.render(React.createElement(BeaconCaptureHarness));
    });

    expect(isGroupWithVisible(renderedElement)).toBe(true);
    if (isGroupWithVisible(renderedElement)) {
      expect(renderedElement.props.visible).toBe(true);
    } else {
      expect.unreachable('renderedElement must be a valid group element');
    }
  });

  it('[TC-BCN.02/A1][UC-BCN] Camera mac dinh hoac quan co khong di chuyen thi beacon giu visible = false khong unmount', () => {
    useGameStore.setState({
      hasUserCustomCamera: false,
      activePawnAnimation: {
        playerId: 'p1',
        fromCell: 0,
        targetCell: 5,
        currentIndex: 0,
        waypoints: [0],
        isAnimating: false,
      },
    });

    let renderedElement: unknown = null;
    function BeaconCaptureHarness(): null {
      renderedElement = CameraLocationBeacon();
      return null;
    }

    act(() => {
      root?.render(React.createElement(BeaconCaptureHarness));
    });

    expect(isGroupWithVisible(renderedElement)).toBe(true);
    if (isGroupWithVisible(renderedElement)) {
      expect(renderedElement.props.visible).toBe(false);
    } else {
      expect.unreachable('renderedElement must be a valid group element');
    }
  });

  it('[TC-BCN.03/MSS][UC-BCN] calculateBeaconPulseOpacity bao ton phan tang do sang 0.75 > 0.55 > 0.45 va phong thu NaN', () => {
    const t = 1.2;
    const diamondOpacity = calculateBeaconPulseOpacity(t, 0.75);
    const cylinderOpacity = calculateBeaconPulseOpacity(t, 0.55);
    const ringOpacity = calculateBeaconPulseOpacity(t, 0.45);

    expect(diamondOpacity).toBeGreaterThan(cylinderOpacity);
    expect(cylinderOpacity).toBeGreaterThan(ringOpacity);
    expect(calculateBeaconPulseOpacity(NaN, 0.55)).toBe(0.55);
  });

  it('[TC-BCN.04/A2][UC-BCN] resolveBeaconCoordinates tra ve dung toa do 3D trung tam cua o co tuong ung', () => {
    const coords = resolveBeaconCoordinates([0, 1, 2, 3], 2, 3);
    const expected = cellPosition(2);

    expect(coords[0]).toBeCloseTo(expected[0], 3);
    expect(coords[1]).toBe(0);
    expect(coords[2]).toBeCloseTo(expected[2], 3);
  });
});

describe('[UC-KIN] Pure Kinematic Helpers Contract Suite', () => {
  it('[TC-KIN.01/MSS][UC-KIN] resolveSideAwareCameraOffset tren 4 canh ban co bao toan 100% huong nhin thuan mat chu', () => {
    const south = resolveSideAwareCameraOffset([0, 0, 9]);
    const north = resolveSideAwareCameraOffset([0, 0, -9]);
    const west = resolveSideAwareCameraOffset([-9, 0, 0]);
    const east = resolveSideAwareCameraOffset([9, 0, 0]);

    expect(south).toEqual([5.2, 6.4, 5.2]);
    expect(north).toEqual([-1.8, 6.4, -6.8]);
    expect(west).toEqual([-6.8, 6.4, 1.8]);
    expect(east).toEqual([6.8, 6.4, -1.8]);
  });

  it('[TC-KIN.02/A1][UC-KIN] calculateScreenShake bao toan phong bi suy giam bac hai va triet tieu ve 0 khi het thoi luong', () => {
    const mid = calculateScreenShake(0.1, 0.35, 0.25);
    const finished = calculateScreenShake(0.35, 0.35, 0.25);
    const outOfBounds = calculateScreenShake(-0.1, 0.35, 0.25);

    expect(Math.abs(mid[0])).toBeGreaterThan(0);
    expect(finished).toEqual([0, 0, 0]);
    expect(outOfBounds).toEqual([0, 0, 0]);
  });

  it('[TC-KIN.03/A2][UC-KIN] calculateTileFocusCameraPosition cong chinh xac toa do o dat va offset thich ung', () => {
    const tilePos: [number, number, number] = [0, 0, 9];
    const camPos = calculateTileFocusCameraPosition(tilePos);
    const customPos = calculateTileFocusCameraPosition([1, 2, 3], [10, 10, 10]);

    expect(camPos[0]).toBeCloseTo(5.2, 2);
    expect(camPos[2]).toBeCloseTo(14.2, 2);
    expect(customPos).toEqual([11, 12, 13]);
  });
});
