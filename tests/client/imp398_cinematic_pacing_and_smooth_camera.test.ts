// [TC-398/MSS][UC-PAWN-PACING-AND-CAMERA] Contract Test Suite: Cinematic Pacing & Smooth Camera Restoration
// Universal 5-Facet Behavioral Matrix Verification:
// Facet 1: Boundary & Range (Pawn hop duration 0.22s, bot hop 0.18s, step duration sums 0.30s and 0.26s)
// Facet 2: State Reactivity & Cycle Teardown (Camera chase speed transitions across human 3.2, bot 3.8 desktop, bot 5.2 mobile)
// Facet 3: Resource Disposal & Timer Isolation (Bot soft-return overview delay 950ms vs human 1200ms)
// Facet 4: Error Defense & Terminal Invariants (Pacing config SSOT stepMs 300, botStepMs 260)
// Facet 5: Cross-Coupling Blast Radius (End-to-end getPawnLandingDelay wiring parity with pacing SSOT)

import { describe, it, expect } from 'vitest';
import {
  HOP_DURATION,
  LANDING_DURATION,
  BOT_HOP_DURATION,
  BOT_LANDING_DURATION,
  BOT_STEP_DURATION,
} from '../../src/client/3d/pawn_path.js';
import {
  CAMERA_CONFIG,
  calculateTargetCameraState,
  resolveSoftReturnDuration,
} from '../../src/client/3d/camera_state_machine.js';
import {
  DEFAULT_PACING_CONFIG,
  DEFAULT_HUMAN_STEP_MS,
  DEFAULT_BOT_STEP_MS,
  DEFAULT_ROLL_LEAD_MS,
  getPawnLandingDelay,
  getPawnPassGoDelay,
} from '../../src/client/events/pacing_context.js';
import { useGameStore, type GameState } from '../../src/client/store/game_store.js';

describe('[TC-398/MSS] Cinematic Pacing & Smooth Camera Restoration Suite', () => {
  // === Facet 1: Boundary & Range (Pawn Hop Durations) ===

  it('[TC-398.01/MSS][UC-PAWN-HOP-DURATION/MSS] returns exactly 0.19s for HOP_DURATION', () => {
    expect(HOP_DURATION).toBe(0.19);
  });

  it('[TC-398.02/MSS][UC-PAWN-STEP-DURATION/MSS] returns exactly 0.26s when summing HOP_DURATION and LANDING_DURATION', () => {
    const totalHumanStep = Number((HOP_DURATION + LANDING_DURATION).toFixed(2));
    expect(totalHumanStep).toBe(0.26);
  });

  it('[TC-398.03a/MSS][UC-PAWN-BOT-STEP-DURATION/MSS] returns exactly 0.16s for BOT_HOP_DURATION', () => {
    expect(BOT_HOP_DURATION).toBe(0.16);
  });

  it('[TC-398.03b/MSS][UC-PAWN-BOT-STEP-DURATION/MSS] returns exactly 0.22s for BOT_STEP_DURATION and validates bot landing duration', () => {
    expect(BOT_STEP_DURATION).toBe(0.22);
    expect(BOT_LANDING_DURATION).toBe(0.06);
    expect(BOT_HOP_DURATION + BOT_LANDING_DURATION).toBeCloseTo(0.22);
  });

  // === Facet 2: State Reactivity & Camera Speed Calibration ===

  it('[TC-398.04/MSS][UC-CAM-CHASE-SPEED/MSS] returns exactly 3.2 for CAMERA_CONFIG.pawn_chase.speed and 38 for fov', () => {
    expect(CAMERA_CONFIG.pawn_chase.speed).toBe(3.2);
    expect(CAMERA_CONFIG.pawn_chase.fov).toBe(38);
  });

  it('[TC-398.05a/MSS][UC-CAM-BOT-CHASE-SPEED/MSS] returns exactly 3.8 for bot pawn chase speed on desktop or landscape viewport', () => {
    const cameraState = calculateTargetCameraState('pawn_chase', [10, 0, 10], undefined, {
      isBotTurn: true,
    });
    expect(cameraState.speed).toBe(3.8);
  });

  it('[TC-398.05b/MSS][UC-CAM-BOT-CHASE-SPEED/MSS] returns exactly 5.2 for bot pawn chase speed on mobile portrait viewport (aspect < 1.0)', () => {
    const cameraState = calculateTargetCameraState('pawn_chase', [10, 0, 10], undefined, {
      isBotTurn: true,
      aspect: 0.56,
    });
    expect(cameraState.speed).toBe(5.2);
  });

  it('[TC-398.06/MSS][UC-CAM-CINEMATIC-STREET-SPEED/MSS] returns exactly 3.8 for calculateTargetCameraState with cinematicChase enabled on desktop, and 5.2 for bot on mobile portrait', () => {
    const cameraState = calculateTargetCameraState('pawn_chase', [5, 0, 5], undefined, {
      cinematicChase: true,
      cellIndex: 5,
    });
    expect(cameraState.speed).toBe(3.8);

    const mobileBotState = calculateTargetCameraState('pawn_chase', [5, 0, 5], undefined, {
      cinematicChase: true,
      cellIndex: 5,
      isBotTurn: true,
      aspect: 0.56,
    });
    expect(mobileBotState.speed).toBe(5.2);

    const mobileHumanState = calculateTargetCameraState('pawn_chase', [5, 0, 5], undefined, {
      cinematicChase: true,
      cellIndex: 5,
      isBotTurn: false,
      aspect: 0.56,
    });
    expect(mobileHumanState.speed).toBe(3.8);
  });

  // === Facet 3: Resource Disposal & Soft Return Grace Duration ===

  it('[TC-398.07a/MSS][UC-CAM-BOT-SOFT-RETURN/MSS] returns exactly 950ms for resolveSoftReturnDuration when isBot is true', () => {
    expect(resolveSoftReturnDuration(true)).toBe(950);
  });

  it('[TC-398.07b/MSS][UC-CAM-BOT-SOFT-RETURN/MSS] returns exactly 1200ms for resolveSoftReturnDuration for human players (isBot is false)', () => {
    expect(resolveSoftReturnDuration(false)).toBe(1200);
  });

  // === Facet 4 & 5: Error Defense, Terminal Invariants & SSOT Pacing Wiring ===

  it('[TC-398.08a/MSS][UC-PACING-CONTEXT-SSOT/MSS] returns exactly 260ms for DEFAULT_PACING_CONFIG.stepMs and DEFAULT_HUMAN_STEP_MS', () => {
    expect(DEFAULT_PACING_CONFIG.stepMs).toBe(260);
    expect(DEFAULT_HUMAN_STEP_MS).toBe(260);
  });

  it('[TC-398.08b/MSS][UC-PACING-CONTEXT-SSOT/MSS] returns exactly 220ms for DEFAULT_PACING_CONFIG.botStepMs, DEFAULT_BOT_STEP_MS, and verifies rollLeadMs', () => {
    expect(DEFAULT_PACING_CONFIG.botStepMs).toBe(220);
    expect(DEFAULT_BOT_STEP_MS).toBe(220);
    expect(DEFAULT_PACING_CONFIG.rollLeadMs).toBe(1350);
    expect(DEFAULT_ROLL_LEAD_MS).toBe(1350);
  });

  it('[TC-398.09/MSS][UC-PACING-CONTEXT-DELAY/MSS] derives pawn landing delay matching SSOT step timing for both human (260ms) and bot (220ms)', () => {
    const baseState = useGameStore.getState();

    const humanState: GameState = {
      ...baseState,
      isRolling: false,
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      pendingPawnMove: {
        playerId: 'p1',
        fromCell: 0,
        targetCell: 3,
        isBot: false,
      },
    };
    const humanDelay = getPawnLandingDelay('p1', humanState);
    expect(humanDelay).toBe(780);

    const botState: GameState = {
      ...baseState,
      isRolling: false,
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      pendingPawnMove: {
        playerId: 'bot1',
        fromCell: 0,
        targetCell: 3,
        isBot: true,
      },
    };
    const botDelay = getPawnLandingDelay('bot1', botState);
    expect(botDelay).toBe(660);
  });

  it('[TC-398.10/MSS][UC-PACING-CONTEXT-PASSGO/MSS] derives pawn pass GO delay using SSOT step timing (260ms human, 220ms bot)', () => {
    const baseState = useGameStore.getState();

    const humanState: GameState = {
      ...baseState,
      isRolling: false,
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      pendingPawnMove: {
        playerId: 'p1',
        fromCell: 38,
        targetCell: 6,
        isBot: false,
      },
    };
    const humanPassGoDelay = getPawnPassGoDelay('p1', humanState);
    expect(humanPassGoDelay).toBe(520);

    const botState: GameState = {
      ...baseState,
      isRolling: false,
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      pendingPawnMove: {
        playerId: 'bot1',
        fromCell: 38,
        targetCell: 6,
        isBot: true,
      },
    };
    const botPassGoDelay = getPawnPassGoDelay('bot1', botState);
    expect(botPassGoDelay).toBe(440);
  });

  it('[TC-398.11/MSS][UC-CAMERA-CHASE-LEGACY/MSS] maintains speed 3.2 on legacy fallback without options', () => {
    const state = calculateTargetCameraState('pawn_chase', [0, 0, 0]);
    expect(state.speed).toBe(3.2);
  });
});
