// [UI-S01/MSS][UI-S04/MSS][TC-354/MSS][UC-CAM-BOT][UC-CAM-PACING][UC-CAM-STATE]
// IMP-354: Bot Turn Camera Stabilization & Mobile Viewport Pacing Contract Suite
// Traceability:
//   - .agents/plans/PLAN_IMP_354_BOT_CAMERA_STABILIZATION.md
//   - .agents/audit/PLAN_CHALLENGE_IMP-354.md
//   - docs/domain/gotchas/3d_cinematics.md (Gotcha 15, Gotcha 63)
// Universal 5-Facet Behavioral Matrix:
//   Facet 1: Boundary & Range — Fast bot pacing duration 650ms vs standard 1200ms (TC-354.07, 08)
//   Facet 2: State Reactivity & Pacing — Bot movement preserves overview unless landing on human tile (TC-354.01, 02)
//   Facet 3: Resource & Motion Isolation — Preemption collision mitigation via bounded 650ms return (TC-354.07)
//   Facet 4: Error Defense & Invariants — Strict equality guard preserves undefined legacy callers (TC-354.05)
//   Facet 5: Cross-Coupling Blast Radius — High-stakes roll and auction modals retain dramatic focus (TC-354.03, 04)

import { describe, it, expect } from 'vitest';
import {
  resolveCameraMode,
  resolveSoftReturnDuration,
  calculateTargetCameraState,
  type CameraResolveParams,
  type TargetCameraStateOptions,
} from '../../src/client/3d/camera_state_machine';

describe('IMP-354: Bot Turn Camera Stabilization & Pacing Contracts', () => {
  it('TC-354.01 [UC-CAM-BOT/MSS]: Given Bot turn parameters where isPawnAnimating is true and isTargetOwnedByHuman is false and isHighStakesRoll is false, When calling resolveCameraMode, Then returns "overview"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: true,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('overview');
  });

  it('TC-354.01b [UC-CAM-BOT/A6]: Given isBotTurn true with isAnimatingPawnBot false, When calling resolveCameraMode, Then returns "overview"', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: true,
      isBotTurn: true,
      isAnimatingPawnBot: false,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      activeModal: null,
    });
    expect(mode).toBe('overview');
  });

  it('TC-354.01c [UC-CAM-BOT/A7]: Given isBotTurn false with isAnimatingPawnBot true, When calling resolveCameraMode, Then returns "overview"', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: true,
      isBotTurn: false,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      activeModal: null,
    });
    expect(mode).toBe('overview');
  });

  it('TC-354.02 [UC-CAM-BOT/A1]: Given Bot turn parameters where isPawnAnimating is true and isTargetOwnedByHuman is true, When calling resolveCameraMode, Then returns "pawn_chase"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: true,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: true,
      isHighStakesRoll: false,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('pawn_chase');
  });

  it('TC-354.03 [UC-CAM-BOT/A2]: Given Bot turn parameters where isPawnAnimating is true and isHighStakesRoll is true, When calling resolveCameraMode, Then returns "pawn_chase"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: true,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: true,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('pawn_chase');
  });

  it('TC-354.04 [UC-CAM-BOT/A3]: Given Bot turn parameters where activeModal is "auction", When calling resolveCameraMode, Then returns "auction_focus"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: true,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      activeModal: 'auction',
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('auction_focus');
  });

  it('TC-354.05 [UC-CAM-BOT/A4]: Given legacy caller where isTargetOwnedByHuman is undefined and isPawnAnimating is true for Bot, When calling resolveCameraMode, Then returns "pawn_chase" preserving IMP-103 backward compatibility', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: true,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: undefined,
      isHighStakesRoll: false,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('pawn_chase');
  });

  it('TC-354.06 [UC-CAM-BOT/A5]: Given human player turn parameters where isPawnAnimating is true, When calling resolveCameraMode, Then returns "pawn_chase"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: true,
      isBotTurn: false,
      isAnimatingPawnBot: false,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('pawn_chase');
  });

  it('TC-354.07 [UC-CAM-PACING/MSS]: Given soft return duration calculation for bot turn with isBot true, When calling resolveSoftReturnDuration, Then returns 650 avoiding preemption collision', () => {
    const duration = resolveSoftReturnDuration(true);
    expect(duration).toBe(650);
  });

  it('TC-354.08 [UC-CAM-PACING/A1]: Given soft return duration calculation for human manual reset with isBot false or undefined, When calling resolveSoftReturnDuration, Then returns 1200', () => {
    const durationFalse = resolveSoftReturnDuration(false);
    const durationUndefined = resolveSoftReturnDuration(undefined);
    expect(durationFalse).toBe(1200);
    expect(durationUndefined).toBe(1200);
  });

  it('TC-354.09 [UC-CAM-STATE/MSS]: Given overview mode with options, When calling calculateTargetCameraState, Then returns TargetCameraState with valid position and target', () => {
    const options: TargetCameraStateOptions = {
      isRolling: false,
      isBotTurn: true,
    };
    const state = calculateTargetCameraState('overview', undefined, undefined, options);
    expect(state.position).toEqual([24.6, 25.3, 24.6]);
    expect(state.target).toEqual([2.2, 0.0, 2.2]);
    expect(state.fov).toBe(24);
    expect(state.speed).toBe(3.2);
  });

  it('TC-354.10 [UC-CAM-BOT/A8]: Given Bot turn waiting to roll with no target tile, When calling resolveCameraMode, Then returns "overview"', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      isBotTurn: true,
      hasTargetTile: false,
      hasRolledThisTurn: false,
      activeModal: null,
    });
    expect(mode).toBe('overview');
  });

  it('TC-354.11 [UC-CAM-BOT/A9]: Given Bot landing on human property with hasRolledThisTurn true, When calling resolveCameraMode, Then returns "tile_focus"', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      isBotTurn: true,
      hasRolledThisTurn: true,
      isTargetOwnedByHuman: true,
      activeModal: null,
    });
    expect(mode).toBe('tile_focus');
  });

  it('TC-354.12 [UC-CAM-BOT/A10]: Given Bot landing on unowned property with hasRolledThisTurn true, When calling resolveCameraMode, Then returns "overview"', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      isBotTurn: true,
      hasRolledThisTurn: true,
      isTargetOwnedByHuman: false,
      activeModal: null,
    });
    expect(mode).toBe('overview');
  });

  it('TC-354.13 [UC-CAM-PACING/A2]: Given resolveSoftReturnDuration called repeatedly, Then returns deterministic numeric scalar', () => {
    expect(typeof resolveSoftReturnDuration(true)).toBe('number');
    expect(typeof resolveSoftReturnDuration(false)).toBe('number');
    expect(resolveSoftReturnDuration(true) < resolveSoftReturnDuration(false)).toBe(true);
  });

  it('TC-354.14 [UC-CAM-STATE/A1]: Given dice_roll mode, When calling calculateTargetCameraState, Then returns dice_roll camera state with fov 36 and speed 4.8', () => {
    const state = calculateTargetCameraState('dice_roll');
    expect(state.fov).toBe(36);
    expect(state.speed).toBe(4.8);
    expect(state.position[1]).toBe(2.8);
  });

  it('TC-354.15 [UC-CAM-STATE/A2]: Given tension_roll mode, When calling calculateTargetCameraState, Then returns tension_roll camera state with fov 34 and speed 6.0', () => {
    const state = calculateTargetCameraState('tension_roll');
    expect(state.fov).toBe(34);
    expect(state.speed).toBe(6.0);
    expect(state.position[1]).toBe(2.2);
  });
});
