// [UI-S01/MSS][UI-S04/MSS][TC-263/MSS][UC-IMP263] IMP-263: Event-Driven Semi-Cinematic Camera Contract Suite
// Traceability: docs/domain/gotchas.md, .agents/plans/PLAN_IMP_263_CINEMATIC_STREET_CHASE_CAMERA.md (Revision 8)
// 5-Facet Universal Behavioral Matrix:
//   Facet 1: Bien Do & Goc Nhin 4 Canh Ban Cua (TC-263.01..08)
//   Facet 2: Danh Gia Su Kien Bien Co Lon ~20% (TC-263.09..11)
//   Facet 3: FOV Thich Ung Dual-Viewport & Toa Do An Toan (TC-263.12..13)
//   Facet 4: Dong Bo Canh & Triet Tieu Whiplash Goc 90 Do (TC-263.14)
//   Facet 5: Tich Hop CameraStateMachine & Tuong Thich Nguoc (TC-263.15..16)

import { describe, it, expect } from 'vitest';
import {
  calculateStreetChaseCameraState,
  shouldTriggerCinematicCamera,
  calculateResponsiveStreetFov,
  resolvePawnTrackSide,
} from '../../src/client/3d/cinematic_chase_camera';
import {
  calculateTargetCameraState,
  CAMERA_CONFIG,
} from '../../src/client/3d/camera_state_machine';

describe('[UC-IMP263] Semi-Cinematic Chase Camera Contract Suite', () => {
  it('[TC-263.01/MSS] Side 0 (Nam, cellIndex 5) tra ve vi tri camera ban dien anh o [px + 3.0, py + 2.8, pz + 2.2]', () => {
    const pawnPosition: [number, number, number] = [4.0, 0.0, 6.0];
    const state = calculateStreetChaseCameraState({
      pawnPosition,
      cellIndex: 5,
    });
    expect(state.position[0]).toBeCloseTo(4.0 + 3.0, 3);
    expect(state.position[1]).toBeCloseTo(0.0 + 2.8, 3);
    expect(state.position[2]).toBeCloseTo(6.0 + 2.2, 3);
  });

  it('[TC-263.02/MSS] Side 0 (Nam, cellIndex 5) tra ve diem ngam don dau [px - 1.0, py + 0.6, pz - 0.5] va goc nghieng pitch ~24.5 den 25.0 do', () => {
    const pawnPosition: [number, number, number] = [0.0, 0.0, 0.0];
    const state = calculateStreetChaseCameraState({
      pawnPosition,
      cellIndex: 5,
    });
    expect(state.target).toEqual([-1.0, 0.6, -0.5]);
    const dx = state.target[0] - state.position[0];
    const dy = state.target[1] - state.position[1];
    const dz = state.target[2] - state.position[2];
    const pitchRad = Math.atan2(-dy, Math.hypot(dx, dz));
    const pitchDeg = (pitchRad * 180) / Math.PI;
    expect(pitchDeg).toBeGreaterThanOrEqual(24.5);
    expect(pitchDeg).toBeLessThanOrEqual(25.0);
  });

  it('[TC-263.03/MSS] Side 1 (Tay, cellIndex 15) tra ve vi tri camera ban dien anh o [px - 2.2, py + 2.8, pz + 3.0]', () => {
    const pawnPosition: [number, number, number] = [-6.0, 0.0, 2.0];
    const state = calculateStreetChaseCameraState({
      pawnPosition,
      cellIndex: 15,
    });
    expect(state.position[0]).toBeCloseTo(-6.0 - 2.2, 3);
    expect(state.position[1]).toBeCloseTo(0.0 + 2.8, 3);
    expect(state.position[2]).toBeCloseTo(2.0 + 3.0, 3);
  });

  it('[TC-263.04/MSS] Side 1 (Tay, cellIndex 15) tra ve diem ngam don dau o [px + 0.5, py + 0.6, pz - 1.0]', () => {
    const pawnPosition: [number, number, number] = [-6.0, 0.0, 2.0];
    const state = calculateStreetChaseCameraState({
      pawnPosition,
      cellIndex: 15,
    });
    expect(state.target[0]).toBeCloseTo(-6.0 + 0.5, 3);
    expect(state.target[1]).toBeCloseTo(0.0 + 0.6, 3);
    expect(state.target[2]).toBeCloseTo(2.0 - 1.0, 3);
  });

  it('[TC-263.05/MSS] Side 2 (Bac, cellIndex 25) tra ve vi tri camera ban dien anh o [px - 3.0, py + 2.8, pz - 2.2]', () => {
    const pawnPosition: [number, number, number] = [-2.0, 0.0, -6.0];
    const state = calculateStreetChaseCameraState({
      pawnPosition,
      cellIndex: 25,
    });
    expect(state.position[0]).toBeCloseTo(-2.0 - 3.0, 3);
    expect(state.position[1]).toBeCloseTo(0.0 + 2.8, 3);
    expect(state.position[2]).toBeCloseTo(-6.0 - 2.2, 3);
  });

  it('[TC-263.06/MSS] Side 2 (Bac, cellIndex 25) tra ve diem ngam don dau o [px + 1.0, py + 0.6, pz + 0.5]', () => {
    const pawnPosition: [number, number, number] = [-2.0, 0.0, -6.0];
    const state = calculateStreetChaseCameraState({
      pawnPosition,
      cellIndex: 25,
    });
    expect(state.target[0]).toBeCloseTo(-2.0 + 1.0, 3);
    expect(state.target[1]).toBeCloseTo(0.0 + 0.6, 3);
    expect(state.target[2]).toBeCloseTo(-6.0 + 0.5, 3);
  });

  it('[TC-263.07/MSS] Side 3 (Dong, cellIndex 35) tra ve vi tri camera ban dien anh o [px + 2.2, py + 2.8, pz - 3.0]', () => {
    const pawnPosition: [number, number, number] = [6.0, 0.0, -2.0];
    const state = calculateStreetChaseCameraState({
      pawnPosition,
      cellIndex: 35,
    });
    expect(state.position[0]).toBeCloseTo(6.0 + 2.2, 3);
    expect(state.position[1]).toBeCloseTo(0.0 + 2.8, 3);
    expect(state.position[2]).toBeCloseTo(-2.0 - 3.0, 3);
  });

  it('[TC-263.08/MSS] Side 3 (Dong, cellIndex 35) tra ve diem ngam don dau o [px - 0.5, py + 0.6, pz + 1.0]', () => {
    const pawnPosition: [number, number, number] = [6.0, 0.0, -2.0];
    const state = calculateStreetChaseCameraState({
      pawnPosition,
      cellIndex: 35,
    });
    expect(state.target[0]).toBeCloseTo(6.0 - 0.5, 3);
    expect(state.target[1]).toBeCloseTo(0.0 + 0.6, 3);
    expect(state.target[2]).toBeCloseTo(-2.0 + 1.0, 3);
  });

  it('[TC-263.09/MSS] shouldTriggerCinematicCamera tra ve true khi isHighStakesRoll mang gia tri true', () => {
    expect(shouldTriggerCinematicCamera({ isHighStakesRoll: true, cellIndex: 2 })).toBe(true);
    expect(shouldTriggerCinematicCamera({ isHighStakesRoll: true, cellIndex: 33 })).toBe(true);
  });

  it('[TC-263.10/MSS] shouldTriggerCinematicCamera tra ve true cho cac o hiem va false cho cac o binh thuong', () => {
    expect(shouldTriggerCinematicCamera({ cellIndex: 5 })).toBe(true);
    expect(shouldTriggerCinematicCamera({ cellIndex: 20 })).toBe(true);
    expect(shouldTriggerCinematicCamera({ cellIndex: 7 })).toBe(false);
    expect(shouldTriggerCinematicCamera({ cellIndex: 22 })).toBe(false);
  });

  it('[TC-263.11/MSS] shouldTriggerCinematicCamera tra ve false khi isJailFlight la true', () => {
    expect(shouldTriggerCinematicCamera({ isJailFlight: true, cellIndex: 10 })).toBe(false);
    expect(shouldTriggerCinematicCamera({ isJailFlight: true, isHighStakesRoll: true, cellIndex: 10 })).toBe(false);
  });

  it('[TC-263.12/A1] calculateResponsiveStreetFov duy tri 42 do tren desktop va mo rong toi da 68 do tren mobile portrait', () => {
    expect(calculateResponsiveStreetFov(16 / 9)).toBe(42);
    expect(calculateResponsiveStreetFov(1.0)).toBe(42);
    expect(calculateResponsiveStreetFov(360 / 740)).toBe(67);
    expect(calculateResponsiveStreetFov(0.35)).toBe(68);
  });

  it('[TC-263.13/A2] calculateStreetChaseCameraState phong ve toa do NaN va Infinity an toan', () => {
    const pawnPosition: [number, number, number] = [NaN, Infinity, -Infinity];
    const state = calculateStreetChaseCameraState({
      pawnPosition,
    });
    expect(state.position).toEqual([3.0, 2.8, 2.2]);
    expect(state.target).toEqual([-1.0, 0.6, -0.5]);
    expect(Number.isFinite(state.fov)).toBe(true);
    expect(Number.isFinite(state.speed)).toBe(true);
  });

  it('[TC-263.14/A3] resolvePawnTrackSide dong bo cac o goc 0, 10, 20, 30 voi toa do thuc te', () => {
    // O goc 10 nhung toa do nam o Canh 0 (Z duong lon hon X am)
    expect(resolvePawnTrackSide([-2.0, 0.0, 8.0], 10)).toBe(0);
    // O goc 20 nhung toa do nam o Canh 1 (X am lon hon Z am)
    expect(resolvePawnTrackSide([-8.0, 0.0, -2.0], 20)).toBe(1);
    // O goc 30 nhung toa do nam o Canh 2 (Z am lon hon X duong)
    expect(resolvePawnTrackSide([2.0, 0.0, -8.0], 30)).toBe(2);
    // O giua canh 15 tra ve Canh 1 bat ke toa do
    expect(resolvePawnTrackSide([0.0, 0.0, 0.0], 15)).toBe(1);
  });

  it('[TC-263.15/MSS] calculateTargetCameraState uy quyen cho calculateStreetChaseCameraState khi options.cinematicChase la true', () => {
    const state = calculateTargetCameraState('pawn_chase', [0.0, 0.0, 0.0], undefined, {
      cinematicChase: true,
      cellIndex: 5,
    });
    expect(state.position).toEqual([3.0, 2.8, 2.2]);
    expect(state.target).toEqual([-1.0, 0.6, -0.5]);
    expect(state.fov).toBe(42);
    expect(state.speed).toBe(5.8);
  });

  it('[TC-263.16/A4] calculateTargetCameraState duy tri standard chase camera khi cinematicChase la false va giu tuong thich cu khi options la undefined', () => {
    const disabledState = calculateTargetCameraState('pawn_chase', [0.0, 0.0, 0.0], undefined, {
      cinematicChase: false,
    });
    expect(disabledState.position).toEqual([3.6, 4.2, 3.6]);
    expect(disabledState.target).toEqual([0.0, 0.2, 0.0]);
    expect(disabledState.fov).toBe(CAMERA_CONFIG.pawn_chase.fov);
    expect(disabledState.speed).toBe(CAMERA_CONFIG.pawn_chase.speed);

    const legacyState = calculateTargetCameraState('pawn_chase', [0.0, 0.0, 0.0]);
    expect(legacyState.position).toEqual([3.6, 4.2, 3.6]);
    expect(legacyState.fov).toBe(CAMERA_CONFIG.pawn_chase.fov);
    expect(legacyState.speed).toBe(CAMERA_CONFIG.pawn_chase.speed);
  });
});
