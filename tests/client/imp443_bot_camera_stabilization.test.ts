// [UI-S01/MSS][TC-443/MSS][UC-CAM-BOT][UC-CAM-PACING][UC-CAM-STATE]
// IMP-443: Bot Turn Camera Stabilization & Anti-Whiplash Invariant Contract Suite
// Traceability:
//   - .agents/plans/PLAN_IMP_443_BOT_CAMERA_STABILIZATION.md
//   - .agents/audit/PLAN_CHALLENGE_IMP-443.md
//   - docs/domain/gotchas/3d_cinematics.md (Gotcha 15, Gotcha 63)
// Universal 5-Facet Behavioral Matrix:
//   Facet 1: Boundary & Range — Camera altitude Y >= 22.0m during bot roll & hop
//   Facet 2: State Reactivity & Pacing — Bot moves keep static overview unless landing on human tile
//   Facet 3: Resource & Motion Isolation — High-stakes safe landing prevents fallthrough to tile_focus
//   Facet 4: Error Defense & Invariants — Human pawn animation still activates pawn_chase
//   Facet 5: Cross-Coupling Blast Radius — High-stakes roll preserves tension camera during roll and hop

import { describe, it, expect } from 'vitest';
import {
  resolveCameraMode,
  calculateTargetCameraState,
  type CameraResolveParams,
  type TargetCameraStateOptions,
} from '../../src/client/3d/camera_state_machine';

describe('IMP-443: Bot Turn Camera Stabilization & Anti-Whiplash Contracts', () => {
  it('TC-443.01 [UC-CAM-BOT/MSS]: Given routine bot turn with isPawnAnimating: true and isTargetOwnedByHuman: false, When calling resolveCameraMode, Then returns "overview"', () => {
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
    expect(mode === 'overview').toBe(true);
  });

  it('TC-443.01b [UC-CAM-BOT/MOBILE]: Given routine bot turn on mobile viewport (isMobile: true or aspect < 1.0) with isPawnAnimating: true, When calling resolveCameraMode, Then returns "pawn_chase" to prevent frustum clipping', () => {
    const mobileParams: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: true,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      activeModal: null,
      isMobile: true,
    };
    expect(resolveCameraMode(mobileParams)).toBe('pawn_chase');

    const portraitParams: CameraResolveParams = {
      ...mobileParams,
      isMobile: false,
      aspect: 0.486,
    };
    expect(resolveCameraMode(portraitParams)).toBe('pawn_chase');
  });

  it('TC-443.01c [UC-CAM-BOT/MOBILE]: Given routine bot turn on mobile viewport when isPawnAnimating: false on unowned tile, When calling resolveCameraMode, Then returns "overview" to soft-return smoothly', () => {
    const mobileParams: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: false,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      activeModal: null,
      isMobile: true,
      aspect: 0.486,
    };
    expect(resolveCameraMode(mobileParams)).toBe('overview');
  });

  it('TC-443.02 [UC-CAM-BOT/A1]: Given bot turn landing on human property with isPawnAnimating: false and isTargetOwnedByHuman: true, When calling resolveCameraMode, Then returns "tile_focus"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: false,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: true,
      isHighStakesRoll: false,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('tile_focus');
    expect(mode === 'overview').toBe(false);
  });

  it('TC-443.03 [UC-CAM-BOT/A2]: Given bot turn with isRolling: true and isBotTurn: true, When calling calculateTargetCameraState in overview mode, Then returns static overview position Y >= 22.0m rather than river pan Y = 19.8m', () => {
    const options: TargetCameraStateOptions = {
      isRolling: true,
      isBotTurn: true,
      isHighStakesRoll: false,
    };
    const state = calculateTargetCameraState('overview', undefined, undefined, options);
    expect(state.position[1]).toBeGreaterThanOrEqual(22.0);
    expect(state.position[1]).toBeGreaterThan(20.0);
    expect(state.position).toEqual([24.6, 25.3, 24.6]);
  });

  it('TC-443.04 [UC-CAM-BOT/A3]: Given human turn with isPawnAnimating: true, When calling resolveCameraMode, Then returns "pawn_chase"', () => {
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
    expect(mode).toBeDefined();
  });

  it('TC-443.05 [UC-CAM-BOT/A4]: Given bot turn with isHighStakesRoll: true and isPawnAnimating: true, When calling resolveCameraMode, Then returns "pawn_chase"', () => {
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
    expect(Boolean(mode)).toBeTruthy();
  });

  it('TC-443.06 [UC-CAM-BOT/A5]: Given bot turn with isHighStakesRoll: true and isPawnAnimating: false landing on unowned tile, When calling resolveCameraMode, Then returns "overview"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: false,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: true,
      hasRolledThisTurn: true,
      hasTargetTile: true,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('overview');
  });

  it('TC-443.06b [UC-CAM-BOT/A5b]: Given bot turn with isHighStakesRoll: true, isPawnAnimating: false, and isPostHopSettling: true, When calling resolveCameraMode, Then returns "tile_focus" for settle buffer window', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: false,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: true,
      hasRolledThisTurn: true,
      hasTargetTile: true,
      isPostHopSettling: true,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('tile_focus');
  });

  it('TC-443.07 [UC-CAM-BOT/A6]: Given bot turn where isTargetOwnedByHuman is false and isPawnAnimating is false, When calling resolveCameraMode, Then returns "overview"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: false,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('overview');
  });

  it('TC-443.08 [UC-CAM-BOT/A7]: Given bot turn where only isBotTurn is true while isAnimatingPawnBot is false during hop, When calling resolveCameraMode, Then returns "overview"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: true,
      isBotTurn: true,
      isAnimatingPawnBot: false,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('overview');
  });

  it('TC-443.09 [UC-CAM-BOT/A8]: Given bot turn where only isAnimatingPawnBot is true while isBotTurn is false during hop, When calling resolveCameraMode, Then returns "overview"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: true,
      isBotTurn: false,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('overview');
  });

  it('TC-443.10 [UC-CAM-BOT/A9]: Given bot turn with activeModal auction, When calling resolveCameraMode, Then returns "auction_focus"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: false,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      activeModal: 'auction',
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('auction_focus');
  });

  it('TC-443.11 [UC-CAM-BOT/A10]: Given bot turn with activeModal buy_property, When calling resolveCameraMode, Then returns "tile_focus"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: false,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      activeModal: 'buy_property',
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('tile_focus');
  });

  it('TC-443.12 [UC-CAM-BOT/A11]: Given bot turn with activeModal null and isPawnAnimating false on unowned property, When calling resolveCameraMode, Then returns "overview"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: false,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('overview');
  });

  it('TC-443.13 [UC-CAM-BOT/A12]: Given human rolling dice in overview mode, When calling calculateTargetCameraState, Then returns river dice pan position Y = 19.8m', () => {
    const options: TargetCameraStateOptions = {
      isRolling: true,
      isBotTurn: false,
      isHighStakesRoll: false,
    };
    const state = calculateTargetCameraState('overview', undefined, undefined, options);
    expect(state.position[1]).toBe(19.8);
    expect(state.fov).toBe(28);
  });

  it('TC-443.14 [UC-CAM-BOT/A13]: Given bot landing on own property with isTargetOwnedByHuman false, When calling resolveCameraMode, Then returns "overview"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: false,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      hasRolledThisTurn: true,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('overview');
  });

  it('TC-443.15 [UC-CAM-BOT/A14]: Given human turn landing on unowned property with hasRolledThisTurn true, When calling resolveCameraMode, Then returns "tile_focus"', () => {
    const params: CameraResolveParams = {
      isRolling: false,
      isPawnAnimating: false,
      isBotTurn: false,
      isAnimatingPawnBot: false,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: false,
      hasRolledThisTurn: true,
      hasTargetTile: true,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('tile_focus');
  });

  it('TC-443.16 [UC-CAM-BOT/A15]: Given bot high-stakes roll with isRolling true and isHighStakesRoll true, When calling resolveCameraMode, Then returns "tension_roll"', () => {
    const params: CameraResolveParams = {
      isRolling: true,
      isPawnAnimating: false,
      isBotTurn: true,
      isAnimatingPawnBot: true,
      isTargetOwnedByHuman: false,
      isHighStakesRoll: true,
      activeModal: null,
    };
    const mode = resolveCameraMode(params);
    expect(mode).toBe('tension_roll');
  });
});
