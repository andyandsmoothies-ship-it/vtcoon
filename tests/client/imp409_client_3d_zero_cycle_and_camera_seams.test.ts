// [UI-S01/MSS][UI-S04/MSS][IMP-409] Client-3D Zero-Cycle & Camera State Machine Pure Seams
import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  calculateTargetCameraState,
  CAMERA_CONFIG,
} from '../../src/client/3d/camera_state_machine';
import type {
  TargetCameraState,
  TargetCameraStateOptions,
} from '../../src/client/3d/camera_types';
import {
  calculateSplineArcCameraState,
} from '../../src/client/3d/cinematic_spline_flyby';
import {
  getCircularCellDistance,
  calculateDominoRippleTransform,
  resolveNeighborDominoSlam,
  resolveMobilePoolDominoSlam,
  type DominoRippleOptions,
  type DominoRippleTransform,
} from '../../src/client/3d/monopoly_plaza_math';
import type { ActiveSlam } from '../../src/client/store/vfx_store';

describe('IMP-409: Client-3D Zero-Cycle & Camera State Machine Pure Seams', () => {
  it('TC-409.01 [UC-CAMERA-TYPES-SEAM-AND-FSM-ORCHESTRATION/MSS]: calculates target camera state presets using camera_types seam', () => {
    const options: TargetCameraStateOptions = {
      isRolling: false,
      aspect: 1.6,
      cellIndex: 10,
    };
    const overviewState: TargetCameraState = calculateTargetCameraState('overview', undefined, undefined, options);
    const diceRollState: TargetCameraState = calculateTargetCameraState('dice_roll', undefined, undefined, options);

    expect(overviewState.fov).toBe(CAMERA_CONFIG.overview.fov);
    expect(diceRollState.fov).toBe(CAMERA_CONFIG.dice_roll.fov);
    expect(overviewState.position[0]).not.toBe(diceRollState.position[0]);
    expect(overviewState.position[1]).toBe(CAMERA_CONFIG.overview.position[1]);
  });

  it('TC-409.01b [UC-CAMERA-TYPES-SEAM-AND-FSM-ORCHESTRATION/MSS]: proves static AST decoupling of chase and spline cameras from camera_state_machine', () => {
    const chaseSource = fs.readFileSync(
      path.resolve(__dirname, '../../src/client/3d/cinematic_chase_camera.ts'),
      'utf-8'
    );
    const splineSource = fs.readFileSync(
      path.resolve(__dirname, '../../src/client/3d/cinematic_spline_flyby.ts'),
      'utf-8'
    );

    expect(chaseSource.includes("from './camera_state_machine'")).toBe(false);
    expect(splineSource.includes("from './camera_state_machine'")).toBe(false);
    expect(chaseSource.includes("from './camera_types'")).toBe(true);
    expect(splineSource.includes("from './camera_types'")).toBe(true);
  });

  it('TC-409.02 [UC-CINEMATIC-SPLINE-FLYBY-KINEMATIC-SEAM/MSS]: computes spline arc camera flight paths with relational covariance', () => {
    const stateStart = calculateSplineArcCameraState({ startCell: 10, targetCell: 30, progress: 0.0 }, 1.6);
    const stateMid = calculateSplineArcCameraState({ startCell: 10, targetCell: 30, progress: 0.5 }, 1.6);
    const stateNearEnd = calculateSplineArcCameraState({ startCell: 10, targetCell: 30, progress: 0.8 }, 1.6);

    expect(stateStart.position[1]).toBeGreaterThan(5.0);
    expect(stateMid.position[1]).toBeGreaterThan(0);
    expect(stateMid.position[0]).not.toBe(stateNearEnd.position[0]);
    expect(stateMid.position[2]).not.toBe(stateNearEnd.position[2]);
  });

  it('TC-409.03 [UC-DOMINO-RIPPLE-MATH-SSOT-AND-KINEMATICS/MSS]: evaluates domino ripple kinematics with relational covariance over distance and time', () => {
    const opts: DominoRippleOptions = { waveDelayPerCellMs: 60, ttlMs: 800 };
    const nearEarly: DominoRippleTransform = calculateDominoRippleTransform(1, 120, opts);
    const sameLocalFar: DominoRippleTransform = calculateDominoRippleTransform(3, 240, opts);
    const highDamp: DominoRippleTransform = calculateDominoRippleTransform(1, 400, { waveDelayPerCellMs: 60, ttlMs: 800, dampingRatio: 0.02 });

    expect(nearEarly.isSettled).toBe(false);
    expect(nearEarly.yOffset).toBeGreaterThan(0);
    expect(sameLocalFar.yOffset).toBeLessThan(nearEarly.yOffset);
    expect(highDamp.isSettled).toBe(true);
  });

  it('TC-409.03b [UC-DOMINO-RIPPLE-MATH-SSOT-AND-KINEMATICS/MSS]: resolves neighbor and mobile pool domino slam candidates from monopoly_plaza_math', () => {
    const fakeSlam: ActiveSlam = {
      id: 'slam_1',
      cellIndex: 5,
      level: 2,
      startTime: 1000,
      durationMs: 800,
      impactTimeMs: 200,
    };
    const activeSlams: Record<number, ActiveSlam> = { 5: fakeSlam };
    const resolvedDesktop = resolveNeighborDominoSlam(7, activeSlams, false, 1400);
    const resolvedMobile = resolveMobilePoolDominoSlam(7, activeSlams, 1400);

    expect(resolvedDesktop?.distanceInCells).toBe(2);
    expect(resolvedMobile?.distanceInCells).toBe(2);
    expect(resolveNeighborDominoSlam(7, activeSlams, true, 1400)).toBeNull();
    expect(resolveMobilePoolDominoSlam(7, activeSlams, 2200)).toBeNull();
  });

  it('TC-409.04 [UC-MONOPOLY-PLAZA-ACYCLIC-GRAPH-VERIFICATION/MSS]: verifies circular cell distance wrap-around calculation', () => {
    const wrapDistance = getCircularCellDistance(0, 39);
    const crossDistance = getCircularCellDistance(5, 15);
    const invalidDistance = getCircularCellDistance(-1, 50);

    expect(wrapDistance).toBe(1);
    expect(crossDistance).toBe(10);
    expect(invalidDistance).toBe(Infinity);
  });

  it('TC-409.04b [UC-MONOPOLY-PLAZA-ACYCLIC-GRAPH-VERIFICATION/MSS]: verifies monopoly plaza visuals and mobile archway AST decoupling', () => {
    const plazaSource = fs.readFileSync(
      path.resolve(__dirname, '../../src/client/3d/monopoly_plaza_visuals.ts'),
      'utf-8'
    );
    const mobileArchSource = fs.readFileSync(
      path.resolve(__dirname, '../../src/client/3d/monopoly_mobile_archway_visuals.ts'),
      'utf-8'
    );

    expect(plazaSource.includes("from './monopoly_mobile_archway_visuals'")).toBe(false);
    expect(plazaSource.includes("from './monopoly_plaza_math'")).toBe(true);
    expect(mobileArchSource.includes("from './monopoly_plaza_math'")).toBe(true);
  });
});
