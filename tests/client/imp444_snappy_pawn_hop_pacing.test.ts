// [IMP-444] Snappy Pawn Hop Pacing & Dead Air Dwell Reduction Contract Tests
import { describe, it, expect } from 'vitest';
import {
  HOP_DURATION,
  LANDING_DURATION,
  BOT_HOP_DURATION,
  BOT_LANDING_DURATION,
  BOT_STEP_DURATION,
  calculateKineticSquashStretch,
  calculatePawnLandingImpact,
} from '../../src/client/3d/pawn_path';
import {
  DEFAULT_HUMAN_STEP_MS,
  DEFAULT_BOT_STEP_MS,
  DEFAULT_ROLL_LEAD_MS,
  DEFAULT_PACING_CONFIG,
  getPawnLandingDelay,
  getPawnPassGoDelay,
} from '../../src/client/events/pacing_context';
import { useGameStore, type GameState } from '../../src/client/store/game_store';

describe('[CONTRACT-TEST][IMP-444] Snappy Pawn Hop Pacing & Kinematic Timing Suite', () => {
  // =========================================================================
  // FACET 1: Human Hop & Step Kinematics
  // =========================================================================

  it('[TC-444.01/MSS][UC-PACE-HUMAN/MSS] Given human pawn hop timing, When inspecting HOP_DURATION, Then returns exactly 0.19s', () => {
    expect(HOP_DURATION).toBe(0.19);
  });

  it('[TC-444.02/MSS][UC-PACE-HUMAN/MSS] Given human pawn landing timing, When inspecting LANDING_DURATION, Then returns exactly 0.07s', () => {
    expect(LANDING_DURATION).toBe(0.07);
  });

  it('[TC-444.03/MSS][UC-PACE-HUMAN/MSS] Given human pawn step, When summing HOP_DURATION and LANDING_DURATION, Then yields exactly 0.26s', () => {
    const totalStep = Number((HOP_DURATION + LANDING_DURATION).toFixed(2));
    expect(totalStep).toBe(0.26);
  });

  // =========================================================================
  // FACET 2: Bot Hop & Step Kinematics
  // =========================================================================

  it('[TC-444.04/MSS][UC-PACE-BOT/MSS] Given bot pawn hop timing, When inspecting BOT_HOP_DURATION, Then returns exactly 0.16s', () => {
    expect(BOT_HOP_DURATION).toBe(0.16);
  });

  it('[TC-444.05/MSS][UC-PACE-BOT/MSS] Given bot pawn landing timing, When inspecting BOT_LANDING_DURATION, Then returns exactly 0.06s', () => {
    expect(BOT_LANDING_DURATION).toBe(0.06);
  });

  it('[TC-444.06/MSS][UC-PACE-BOT/MSS] Given bot pawn step timing, When inspecting BOT_STEP_DURATION, Then returns exactly 0.22s', () => {
    expect(BOT_STEP_DURATION).toBe(0.22);
  });

  it('[TC-444.07/MSS][UC-PACE-BOT/MSS] Given bot pawn step, When summing BOT_HOP_DURATION and BOT_LANDING_DURATION, Then matches BOT_STEP_DURATION at 0.22s', () => {
    const totalBotStep = Number((BOT_HOP_DURATION + BOT_LANDING_DURATION).toFixed(2));
    expect(totalBotStep).toBe(0.22);
  });

  it('[TC-444.08/MSS][UC-PACE-RELATIONAL/MSS] Given human and bot step durations, When comparing them, Then bot step is strictly faster than human step', () => {
    const humanStep = HOP_DURATION + LANDING_DURATION;
    const botStep = BOT_STEP_DURATION;
    expect(botStep).toBeLessThan(humanStep);
    expect(humanStep - botStep).toBeCloseTo(0.04, 2);
  });

  // =========================================================================
  // FACET 3: Pacing Context SSOT Alignment
  // =========================================================================

  it('[TC-444.09/MSS][UC-PACE-CONTEXT/MSS] Given pacing context constants, When reading DEFAULT_HUMAN_STEP_MS, Then returns exactly 260ms', () => {
    expect(DEFAULT_HUMAN_STEP_MS).toBe(260);
  });

  it('[TC-444.10/MSS][UC-PACE-CONTEXT/MSS] Given pacing context constants, When reading DEFAULT_BOT_STEP_MS, Then returns exactly 220ms', () => {
    expect(DEFAULT_BOT_STEP_MS).toBe(220);
  });

  it('[TC-444.11/MSS][UC-PACE-CONTEXT/MSS] Given pacing context constants, When reading DEFAULT_ROLL_LEAD_MS, Then returns exactly 1350ms', () => {
    expect(DEFAULT_ROLL_LEAD_MS).toBe(1350);
  });

  it('[TC-444.12/MSS][UC-PACE-CONTEXT/MSS] Given DEFAULT_PACING_CONFIG, When evaluating fields, Then matches canonical timing values', () => {
    expect(DEFAULT_PACING_CONFIG.stepMs).toBe(260);
    expect(DEFAULT_PACING_CONFIG.botStepMs).toBe(220);
    expect(DEFAULT_PACING_CONFIG.rollLeadMs).toBe(1350);
  });

  // =========================================================================
  // FACET 4: Event Bus Delays & Physics Deformation Integrity
  // =========================================================================

  it('[TC-444.13/MSS][UC-PACE-CONTEXT/MSS] Given rolling human player with 4 pending steps, When computing landing delay, Then returns 2390ms', () => {
    const baseState = useGameStore.getState();
    const mockState: GameState = {
      ...baseState,
      isRolling: true,
      pendingPawnMove: {
        playerId: 'p1',
        fromCell: 0,
        targetCell: 4,
        isBot: false,
      },
    };

    const delay = getPawnLandingDelay('p1', mockState);
    // 1350ms (roll lead) + 4 * 260ms = 2390ms
    expect(delay).toBe(2390);
  });

  it('[TC-444.14/MSS][UC-PACE-CONTEXT/MSS] Given rolling bot player with 4 pending steps, When computing landing delay, Then returns 2230ms', () => {
    const baseState = useGameStore.getState();
    const mockState: GameState = {
      ...baseState,
      isRolling: true,
      pendingPawnMove: {
        playerId: 'bot1',
        fromCell: 0,
        targetCell: 4,
        isBot: true,
      },
    };

    const delay = getPawnLandingDelay('bot1', mockState);
    // 1350ms (roll lead) + 4 * 220ms = 2230ms
    expect(delay).toBe(2230);
  });

  it('[TC-444.15/MSS][UC-PACE-SQUASH/MSS] Given kinetic squash-stretch, When evaluating progress at 0% and 50%, Then returns valid deformation scales', () => {
    const startScale = calculateKineticSquashStretch(0);
    const midScale = calculateKineticSquashStretch(0.5);

    expect(startScale).toEqual([1, 1, 1]);
    expect(midScale[1]).toBeCloseTo(1.18, 2);
  });

  it('[TC-444.16/MSS][UC-PACE-LANDING-IMPACT/MSS] Given landing impact, When landing progress completes (>= 1.0), Then restores scale to [1, 1, 1]', () => {
    const finishedScale = calculatePawnLandingImpact(1.0);
    expect(finishedScale).toEqual([1, 1, 1]);
  });
});
