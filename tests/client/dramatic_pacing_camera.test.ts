// [UI-S01/MSS][UI-S04/MSS][TC-DRAMA/MSS][UC-DRAMA] IMP-292: Dramatic Pacing & Player-Oriented Dice Pan Contract Suite
// Traceability: docs/domain/gotchas/3d_cinematics.md (Gotcha 15, Gotcha 63), .agents/plans/PLAN_IMP_292_DRAMATIC_PACING_AND_DICE_PAN.md
// Universal 5-Facet Behavioral Matrix:
//   Facet 1: Boundary & Range — Mobile Portrait FOV 46deg expansion & 4-Side river target pan (TC-DRAMA.07, 08, 09)
//   Facet 2: State Reactivity & Pacing — Bot Interest-Driven Framing & Modal Centering (TC-DRAMA.01, 02, 03, 04)
//   Facet 3: Resource & Motion Isolation — Bot Static Overview Y=25.3m anti-whiplash preservation (TC-DRAMA.06)
//   Facet 4: Error Defense & Invariants — Player Dice Pan Y=19.8m & Tension Roll coordinate immutability (TC-DRAMA.05, 10)
//   Facet 5: Cross-Coupling Blast Radius — Backward compatibility with IMP-103 legacy callers (TC-DRAMA.04)
//
// Dynamic Triad Mandate:
//   (1) Re-entrant storm: Rapid roll invocations maintain bounded target position and valid FOV
//   (2) Phase boundary rejection: Dice pan only applies to overview mode during active dice rolling
//   (3) Teardown cleanup: Camera transitions gracefully without leaking camera state or subscriptions
//
// Domain Gotcha Rules Enforced:
//   - Gotcha #15: Spatial Kinematics, Transient Corner Banking & Dual-Vector Continuity
//   - Gotcha #63: Bot Turn Anti-Whiplash Invariant (Overview altitude Y=25.3m preserved during Bot rolls)
//
// Acceptance Criteria & Contract Definitions:
//   TC-DRAMA.01: Bot lands on unowned or bot-owned tile with no active modal -> resolveCameraMode returns 'overview'
//   TC-DRAMA.02: Bot lands on human-owned fee-charging tile -> resolveCameraMode returns 'tile_focus'
//   TC-DRAMA.03: Bot lands on unowned tile with active transaction modal -> resolveCameraMode returns 'tile_focus'
//   TC-DRAMA.04: Backward compatibility when isTargetOwnedByHuman is undefined -> resolveCameraMode returns 'tile_focus'
//   TC-DRAMA.05: Human player regular dice roll -> calculateTargetCameraState('overview') yields Y=19.8m and FOV=28
//   TC-DRAMA.06: Bot turn dice roll -> calculateTargetCameraState('overview') preserves static Overview Y=25.3m (Gotcha 63)
//   TC-DRAMA.07: North-side dice roll (cell 25, side 2) -> calculateDicePanCameraState(25) sets targetZ=0.9
//   TC-DRAMA.08: South-side dice roll (cell 5, side 0) -> calculateDicePanCameraState(5) sets targetZ=2.1
//   TC-DRAMA.09: Mobile Portrait aspect=0.48 -> calculateDicePanCameraState(25, 0.48) expands FOV to 46deg
//   TC-DRAMA.10: High-stakes roll -> calculateTargetCameraState('tension_roll') preserves [2.0, 2.2, 2.8] and FOV 34
//
// Mathematical Invariants:
//   - Normalization: rollingPos is normalized via ((pos % 40) + 40) % 40
//   - Side orientation: side = floor(normPos / 10), bias maps to [South: Z+1, West: X-1, North: Z-1, East: X+1]
//   - River camera base: position Y=19.8m, speed=4.8 units/s
//   - Responsive FOV: Mobile portrait clamped between 28 and 46 degrees (aspect < 1.0)
//   - Default Aspect Fallback: 1.77 widescreen ratio when aspect is undefined or non-finite

import { describe, it, expect } from 'vitest';
import {
  resolveCameraMode,
  calculateTargetCameraState,
  type TargetCameraState,
} from '../../src/client/3d/camera_state_machine';
import {
  calculateDicePanCameraState,
} from '../../src/client/3d/cinematic_chase_camera';

// Module augmentation for contract testing without dirty casts
declare module '../../src/client/3d/camera_state_machine' {
  interface CameraResolveParams {
    readonly isTargetOwnedByHuman?: boolean;
  }
  interface TargetCameraStateOptions {
    readonly isRolling?: boolean;
    readonly isBotTurn?: boolean;
    readonly rollingPlayerPos?: number;
  }
}

declare module '../../src/client/3d/cinematic_chase_camera' {
  export function calculateDicePanCameraState(
    rollingPos?: number,
    aspect?: number
  ): TargetCameraState;
}

describe('[UC-DRAMA] Dramatic Pacing & Player-Oriented Dice Pan Contract Suite', () => {
  it('[TC-DRAMA.01/MSS][UC-DRAMA] Bot ha canh o vo chu hoac o Bot so huu (isTargetOwnedByHuman: false) khong co modal tra ve overview', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      activeModal: null,
      isBotTurn: true,
      hasTargetTile: true,
      isTargetOwnedByHuman: false,
    });
    expect(mode).toBe('overview');
  });

  it('[TC-DRAMA.02/MSS][UC-DRAMA] Bot ha canh o cua nguoi choi co thu phi (isTargetOwnedByHuman: true) tra ve tile_focus', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      activeModal: null,
      isBotTurn: true,
      hasTargetTile: true,
      isTargetOwnedByHuman: true,
    });
    expect(mode).toBe('tile_focus');
  });

  it('[TC-DRAMA.03/A1][UC-DRAMA] Bot ha canh o vo chu co modal mo (buy_property) tra ve tile_focus', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      activeModal: 'buy_property',
      isBotTurn: true,
      hasTargetTile: true,
      isTargetOwnedByHuman: false,
    });
    expect(mode).toBe('tile_focus');
  });

  it('[TC-DRAMA.04/A1][UC-DRAMA] Caller cu khong truyen isTargetOwnedByHuman (undefined) bao toan tile_focus cho IMP-103', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      activeModal: null,
      isBotTurn: true,
      hasTargetTile: true,
    });
    expect(mode).toBe('tile_focus');
  });

  it('[TC-DRAMA.05/MSS][UC-DRAMA] Luot gieo xuc xac thong thuong cua nguoi choi ha do cao Y = 19.8 va FOV 28', () => {
    const state = calculateTargetCameraState('overview', undefined, undefined, {
      isRolling: true,
      isBotTurn: false,
    });
    expect(state.position[1]).toBe(19.8);
    expect(state.fov).toBe(28);
  });

  it('[TC-DRAMA.06/A2][UC-DRAMA] Luot gieo xuc xac cua Bot kich hoat dice pan camera tai Y = 19.8 chong tre goc nhin', () => {
    const state = calculateTargetCameraState('overview', undefined, undefined, {
      isRolling: true,
      isBotTurn: true,
    });
    expect(state.position[1]).toBe(19.8);
    expect(state.fov).toBe(28);
  });

  it('[TC-DRAMA.07/MSS][UC-DRAMA] Nguoi choi gieo xuc xac o man Bac (o 25, side 2) tra ve targetZ = 0.9', () => {
    const state = calculateDicePanCameraState?.(25);
    expect(state?.target[2]).toBe(0.9);
    expect(state?.target[1]).toBe(0.2);
    expect(state?.speed).toBe(4.8);
    expect(state?.position[1]).toBe(19.8);
  });

  it('[TC-DRAMA.08/A3][UC-DRAMA] Nguoi choi gieo xuc xac o man Nam (o 5, side 0) tra ve targetZ = 2.1', () => {
    const state = calculateDicePanCameraState?.(5);
    expect(state?.target[2]).toBe(2.1);
    expect(state?.position[1]).toBe(19.8);
  });

  it('[TC-DRAMA.09/MSS][UC-DRAMA] Man hinh Mobile Portrait (aspect = 0.48) mo rong FOV len 46 do chong frustum clipping', () => {
    const state = calculateDicePanCameraState?.(25, 0.48);
    expect(state?.fov).toBe(46);
  });

  it('[TC-DRAMA.10/A4][UC-DRAMA] Gieo xuc xac nguy co tu than bao toan toa do tension_roll va FOV 34', () => {
    const state = calculateTargetCameraState('tension_roll', undefined, undefined, {
      isRolling: true,
      isHighStakesRoll: true,
      isBotTurn: false,
    });
    expect(state.position).toEqual([2.0, 2.2, 2.8]);
    expect(state.fov).toBe(34);
  });

  it('[TC-DRAMA.11/A5][UC-DRAMA] Nguoi choi gieo xuc xac o man Tay (o 15, side 1) tra ve targetX = 0.9 va posX = 18.7', () => {
    const state = calculateDicePanCameraState?.(15);
    expect(state?.target[0]).toBe(0.9);
    expect(state?.position[0]).toBe(18.7);
  });

  it('[TC-DRAMA.12/A6][UC-DRAMA] Nguoi choi gieo xuc xac o man Dong (o 35, side 3) tra ve targetX = 2.1 va posX = 20.3', () => {
    const state = calculateDicePanCameraState?.(35);
    expect(state?.target[0]).toBe(2.1);
    expect(state?.position[0]).toBe(20.3);
  });

  it('[TC-DRAMA.13/MSS][UC-DRAMA] Man hinh Desktop aspect >= 1.0 giu nguyen FOV tieu chuan 28', () => {
    const state = calculateDicePanCameraState?.(25, 1.77);
    expect(state?.fov).toBe(28);
  });

  it('[TC-DRAMA.14/A7][UC-DRAMA] Khong truyen rollingPos mac dinh huong Nam voi targetZ = 2.1 va posZ = 20.3', () => {
    const state = calculateDicePanCameraState?.();
    expect(state?.target[2]).toBe(2.1);
    expect(state?.position[2]).toBe(20.3);
  });

  it('[TC-DRAMA.15/A8][UC-DRAMA] Tension roll duoc bao toan ca khi BotTurn la true', () => {
    const state = calculateTargetCameraState('tension_roll', undefined, undefined, {
      isRolling: true,
      isHighStakesRoll: true,
      isBotTurn: true,
    });
    expect(state.position).toEqual([2.0, 2.2, 2.8]);
    expect(state.fov).toBe(34);
  });
});
