// [TC-358/MSS][UC-CAM-BOT-LEAD] Contract Test Suite: Bot Camera Catch-Up Boost, Kinematic Velocity Parity & Mobile Portrait Framing
// Universal 5-Facet Behavioral Matrix Verification:
// Facet 1: Boundary & Range (Optical trigonometric FOV bounds [35, 45] for focus and [38, 48] for chase)
// Facet 2: State Reactivity & Cycle Teardown (Bot roll pre-pan activation and dice pan transitions)
// Facet 3: Resource Disposal & Timer Isolation (Catch-up boost speed 7.2 vs human 5.2 overcoming 13.85m/s bot hop)
// Facet 4: Error Defense & Terminal Invariants (Finite coordinate safety and desktop landscape baseline preservation)
// Facet 5: Cross-Coupling Blast Radius (Mobile portrait screen-space landmark clearance Y >= 7.8m and target Y = 0.85m)

import { describe, it, expect } from 'vitest';

import {
  calculateTargetCameraState,
  calculateTileFocusCameraPosition,
  calculateChaseCameraPosition,
  resolveSideAwareCameraOffset,
  CAMERA_CONFIG,
} from '../../src/client/3d/camera_state_machine';
import {
  calculateResponsiveFocusFov,
  calculateResponsiveChaseFov,
} from '../../src/client/3d/camera_kinematic_helpers';
import {
  calculateDicePanCameraState,
  resolveStandardChaseOffset,
} from '../../src/client/3d/cinematic_chase_camera';

declare module '../../src/client/3d/camera_kinematic_helpers' {
  export function resolveSideAwareCameraOffset(
    tileCoords: readonly [number, number, number],
    baseOffset?: readonly [number, number, number],
    aspect?: number
  ): [number, number, number];

  export function calculateTileFocusCameraPosition(
    tileCoords: readonly [number, number, number],
    offset?: readonly [number, number, number],
    aspect?: number
  ): [number, number, number];
}

declare module '../../src/client/3d/camera_state_machine' {
  export function resolveSideAwareCameraOffset(
    tileCoords: readonly [number, number, number],
    baseOffset?: readonly [number, number, number],
    aspect?: number
  ): [number, number, number];

  export function calculateTileFocusCameraPosition(
    tileCoords: readonly [number, number, number],
    offset?: readonly [number, number, number],
    aspect?: number
  ): [number, number, number];

  export function calculateChaseCameraPosition(
    pawnCoords: readonly [number, number, number],
    offset?: readonly [number, number, number],
    aspect?: number
  ): [number, number, number];
}

declare module '../../src/client/3d/cinematic_chase_camera' {
  export function resolveStandardChaseOffset(
    pawnCoords: readonly [number, number, number],
    aspect?: number
  ): readonly [number, number, number];
}

describe('[IMP-358] Bot Camera Lead, Kinematic Boost & Mobile Framing Contract Suite', () => {
  it('[TC-358.01/MSS][UC-CAM-BOT-PAN] Given Bot turn with isRolling: true, When calling calculateTargetCameraState, Then returns calculateDicePanCameraState without blocking on isBotTurn', () => {
    const state = calculateTargetCameraState('overview', undefined, undefined, {
      isRolling: true,
      isBotTurn: true,
    });
    expect(state.position[1]).toBe(19.8);
    expect(state.fov).toBe(28);
    expect(state.speed).toBe(4.8);
  });

  it('[TC-358.02/MSS][UC-CAM-BOT-SPEED-PARITY] Given Bot turn in pawn_chase mode, When calling calculateTargetCameraState, Then returns catch-up boost speed 7.2 overcoming 13.85m/s bot hop velocity', () => {
    const state = calculateTargetCameraState('pawn_chase', [0, 0, 0], [0, 0, 0], {
      isBotTurn: true,
    });
    expect(state.speed).toBe(7.2);
  });

  it('[TC-358.03/MSS][UC-CAM-BOT-FOCUS-SPEED] Given Bot turn in tile_focus mode, When calling calculateTargetCameraState, Then returns speed: 4.0 matching CAMERA_CONFIG.tile_focus.speed', () => {
    const state = calculateTargetCameraState('tile_focus', undefined, [0, 0, 0], {
      isBotTurn: true,
    });
    expect(state.speed).toBe(4.0);
  });

  it('[TC-358.04/MSS][UC-CAM-MOBILE-CHASE-FOV] Given mobile portrait aspect ratio (aspect = 0.5), When calculating pawn_chase camera state, Then FOV expands from 38 to 48 restoring horizontal corner coverage', () => {
    const state = calculateTargetCameraState('pawn_chase', [0, 0, 0], [0, 0, 0], {
      aspect: 0.5,
    });
    expect(state.fov).toBe(48);
  });

  it('[TC-358.05/MSS][UC-CAM-MOBILE-FOCUS-FOV] Given mobile portrait aspect ratio (aspect = 0.5), When calculating tile_focus camera state, Then FOV expands from 35 to 45 preventing corner clipping', () => {
    const state = calculateTargetCameraState('tile_focus', undefined, [0, 0, 0], {
      aspect: 0.5,
    });
    expect(state.fov).toBe(45);
  });

  it('[TC-358.06/MSS][UC-CAM-MOBILE-ELEVATION] Given mobile portrait aspect ratio (aspect = 0.5), When calling calculateTileFocusCameraPosition with aspect as 3rd argument, Then camera height is elevated (height >= 7.8m vs 6.4m baseline) clearing top HUD backdrop-blur panels', () => {
    const position = calculateTileFocusCameraPosition([0, 0, 0], undefined, 0.5);
    expect(position[1]).toBeGreaterThanOrEqual(7.8);
  });

  it('[TC-358.07/MSS][UC-CAM-DESKTOP-PARITY] Given desktop landscape aspect ratio (aspect = 1.77), When calling calculateTileFocusCameraPosition and calculateChaseCameraPosition, Then preserves exact baseline positions and FOVs', () => {
    const tilePos = calculateTileFocusCameraPosition([0, 0, 0], undefined, 1.77);
    const chasePos = calculateChaseCameraPosition([0, 0, 0], undefined, 1.77);
    const focusFov = calculateResponsiveFocusFov(1.77);
    const chaseFov = calculateResponsiveChaseFov(1.77);
    expect(tilePos[1]).toBe(6.4);
    expect(chasePos[1]).toBe(4.2);
    expect(focusFov).toBe(35);
    expect(chaseFov).toBe(38);
  });

  it('[TC-358.08/MSS][UC-CAM-PREPAN-LEAD] Given player at quadrant side 1, When calling calculateDicePanCameraState, Then position bias shifts towards player sector leading the viewer into the action', () => {
    const state = calculateDicePanCameraState(15, 1.77);
    expect(state.position[0]).toBeLessThan(19.5);
    expect(state.position[1]).toBe(19.8);
    expect(state.target[0]).toBeLessThan(1.5);
  });

  it('[TC-358.09/MSS][UC-CAM-BOT-SPEED] Given Bot turn in pawn_chase mode, When calling calculateTargetCameraState, Then uses restored speed 7.2 to eliminate camera lag behind pawn', () => {
    const state = calculateTargetCameraState('pawn_chase', [5, 0, 5], [5, 0, 5], {
      isBotTurn: true,
    });
    expect(state.speed).toBe(7.2);
  });

  it('[TC-358.10/MSS][UC-CAM-BOT-DICE-PAN] Given Bot turn with isRolling true, When calling calculateTargetCameraState, Then returns dice pan position with Y=19.8 and FOV=28 eliminating bot camera freeze', () => {
    const state = calculateTargetCameraState('overview', undefined, undefined, {
      isRolling: true,
      isBotTurn: true,
      rollingPlayerPos: 0,
      aspect: 1.77,
    });
    expect(state.position[1]).toBe(19.8);
    expect(state.fov).toBe(28);
  });

  it('[TC-358.11/MSS][UC-CAM-SCREEN-FRAMING] Given mobile portrait aspect ratio (aspect = 0.5), When calculating tile_focus target, Then target Y is elevated to 0.85m centering 3D landmarks in clear viewport', () => {
    const state = calculateTargetCameraState('tile_focus', undefined, [3, 0, 3], {
      aspect: 0.5,
    });
    expect(state.target[1]).toBe(0.85);
  });

  it('[TC-358.12/MSS][UC-CAM-SIDE-OFFSET] Given tile at South side and mobile aspect 0.5, When calling resolveSideAwareCameraOffset with aspect, Then applies height multiplier 1.25 elevating camera above 7.8m', () => {
    const offset = resolveSideAwareCameraOffset([0, 0, 5.2], undefined, 0.5);
    expect(offset[1]).toBeGreaterThanOrEqual(7.8);
  });

  it('[TC-358.13/MSS][UC-CAM-FOCUS-FOV-MATH] Given mobile aspect ratio 0.5, When calling calculateResponsiveFocusFov, Then evaluates optical trigonometry returning 45 degrees', () => {
    const fov = calculateResponsiveFocusFov(0.5);
    expect(fov).toBe(45);
  });

  it('[TC-358.14/MSS][UC-CAM-CHASE-FOV-MATH] Given mobile aspect ratio 0.5, When calling calculateResponsiveChaseFov, Then evaluates optical trigonometry returning 48 degrees', () => {
    const fov = calculateResponsiveChaseFov(0.5);
    expect(fov).toBe(48);
  });

  it('[TC-358.15/MSS][UC-CAM-STANDARD-CHASE-OFFSET] Given pawn at origin and mobile aspect 0.5, When calling resolveStandardChaseOffset with aspect, Then scales elevation to 5.25m and horizontal offset to 4.1m', () => {
    const offset = resolveStandardChaseOffset([0, 0, 0], 0.5);
    expect(offset[1]).toBeGreaterThanOrEqual(5.25);
    expect(offset[0]).toBeGreaterThanOrEqual(4.1);
  });
});
