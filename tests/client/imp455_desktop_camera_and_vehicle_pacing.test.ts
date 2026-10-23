// [IMP-455] Desktop Bot Camera Unified Azimuth, Glide Transitions & Observable Vehicle Speed Calibration
import { describe, it, expect } from 'vitest';
import {
  THEMATIC_PLANE_DURATION,
  BOT_THEMATIC_PLANE_DURATION,
  THEMATIC_POLICE_DURATION,
  BOT_THEMATIC_POLICE_DURATION,
  resolveThematicVehicleHopDurationSec,
} from '../../src/client/3d/pawn_path';
import {
  resolveThematicVehicleFlightDurationMs,
} from '../../src/client/3d/cinematic_spline_flyby';
import { cellPosition } from '../../src/client/3d/board_coords';
import { resolveUnifiedDesktopChaseOffset } from '../../src/client/3d/cinematic_chase_camera';
import { resolveCameraMode, calculateChaseCameraPosition } from '../../src/client/3d/camera_state_machine';
import {
  sampleGlideSoftReturn,
  type SoftReturnState,
} from '../../src/client/3d/camera_soft_return';
import { computeHopFrame } from '../../src/client/3d/single_hop_pawn';

describe('[IMP-455] Desktop Bot Camera Unified Azimuth, Glide Transitions & Transport Pacing Contract Suite', () => {
  it('[TC-455.01/MSS][UC-VEHICLE-PACING-CALIBRATION/MSS] calibrates vehicle pacing constants and duration resolvers in seconds and milliseconds', () => {
    const planeDurationsSec = [
      THEMATIC_PLANE_DURATION,
      BOT_THEMATIC_PLANE_DURATION,
      resolveThematicVehicleHopDurationSec('transit', false),
      resolveThematicVehicleHopDurationSec('transit', true),
    ];
    const policeDurationsSec = [
      THEMATIC_POLICE_DURATION,
      BOT_THEMATIC_POLICE_DURATION,
      resolveThematicVehicleHopDurationSec('audit', false),
      resolveThematicVehicleHopDurationSec('audit', true),
    ];
    const vehicleDurationsMs = [
      resolveThematicVehicleFlightDurationMs(false, 'transit'),
      resolveThematicVehicleFlightDurationMs(true, 'transit'),
      resolveThematicVehicleFlightDurationMs(false, 'audit'),
      resolveThematicVehicleFlightDurationMs(true, 'audit'),
    ];

    expect(planeDurationsSec).toEqual([3.2, 2.4, 3.2, 2.4]);
    expect(policeDurationsSec).toEqual([3.8, 2.8, 3.8, 2.8]);
    expect(vehicleDurationsMs).toEqual([3200, 2400, 3800, 2800]);
  });

  it('[TC-455.02/MSS][UC-DESKTOP-UNIFIED-AZIMUTH/MSS] desktop unified azimuth offset maintains positive coordinates across all four perimeter edges', () => {
    const northOffset = resolveUnifiedDesktopChaseOffset(cellPosition(25), 1.77);
    const northPos = calculateChaseCameraPosition(cellPosition(25), undefined, 1.77);
    const expectedX = cellPosition(25)[0] + 3.6;
    const expectedZ = cellPosition(25)[2] + 3.6;

    expect(northOffset).toEqual([3.6, 4.2, 3.6]);
    expect(northPos[0]).toBeCloseTo(expectedX, 1);
    expect(northPos[2]).toBeCloseTo(expectedZ, 1);
  });

  it('[TC-455.03/MSS][UC-BOT-ANTI-EARLY-FOCUS/MSS] gates tile_focus behind isPostHopSettling to prevent early whiplash zoom before bot pawn moves', () => {
    const mode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      activeModal: null,
      isBotTurn: true,
      isTargetOwnedByHuman: true,
      isPostHopSettling: false,
      aspect: 1.77,
    });

    expect(mode).toBe('overview');
  });

  it('[TC-455.04/MSS][UC-BOT-POST-HOP-SETTLE-FOCUS/MSS] resolves to tile_focus when bot pawn completes hop and enters post-hop settle window', () => {
    const humanTileFocusMode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      activeModal: null,
      isBotTurn: true,
      isTargetOwnedByHuman: true,
      isPostHopSettling: true,
      aspect: 1.77,
    });
    const highStakesFocusMode = resolveCameraMode({
      isRolling: false,
      isPawnAnimating: false,
      activeModal: null,
      isBotTurn: true,
      isHighStakesRoll: true,
      isPostHopSettling: true,
      aspect: 1.77,
    });

    expect(humanTileFocusMode).toBe('tile_focus');
    expect(highStakesFocusMode).toBe('tile_focus');
  });

  it('[TC-455.05/MSS][UC-DESKTOP-GLIDE-NO-ORBIT/MSS] samples linear Cartesian glide on desktop without 180-degree spherical orbit swing', () => {
    const state: SoftReturnState = {
      startPos: [-10, 5, -10],
      startTarget: [0, 0, 0],
      destPos: [10, 5, 10],
      destTarget: [0, 0, 0],
      startTime: 1000,
      durationMs: 1000,
    };
    const sample = sampleGlideSoftReturn(state, 1500, true);

    const chordX = state.destPos[0] - state.startPos[0];
    const chordY = state.destPos[1] - state.startPos[1];
    const chordZ = state.destPos[2] - state.startPos[2];

    const actualX = sample.position[0] - state.startPos[0];
    const actualY = sample.position[1] - state.startPos[1];
    const actualZ = sample.position[2] - state.startPos[2];

    const dot = actualX * chordX + actualY * chordY + actualZ * chordZ;
    const magChord = Math.hypot(chordX, chordY, chordZ);
    const magActual = Math.hypot(actualX, actualY, actualZ);
    const cosTheta = Math.max(-1, Math.min(1, dot / (magChord * magActual)));
    const angleDeg = Math.acos(cosTheta) * (180 / Math.PI);

    expect(sample.isFinished).toBe(false);
    expect(angleDeg).toBeLessThanOrEqual(1.0);
  });

  it('[TC-455.06/MSS][UC-RELATIONAL-COVARIANCE/MSS] relational multi-point monotonicity: glide positions progress monotonically toward destination', () => {
    const state: SoftReturnState = {
      startPos: [5, 4, 5],
      startTarget: [0, 0, 0],
      destPos: [24.6, 25.3, 24.6],
      destTarget: [2.2, 0, 2.2],
      startTime: 1000,
      durationMs: 1000,
    };

    const sampleT1 = sampleGlideSoftReturn(state, 1200, true);
    const sampleT2 = sampleGlideSoftReturn(state, 1800, true);

    const distToDestT1 = Math.hypot(
      sampleT1.position[0] - state.destPos[0],
      sampleT1.position[1] - state.destPos[1],
      sampleT1.position[2] - state.destPos[2]
    );
    const distToDestT2 = Math.hypot(
      sampleT2.position[0] - state.destPos[0],
      sampleT2.position[1] - state.destPos[1],
      sampleT2.position[2] - state.destPos[2]
    );

    expect(sampleT1.position).not.toEqual(sampleT2.position);
    expect(distToDestT2).toBeLessThan(distToDestT1);
    expect(sampleT1.position[0]).toBeCloseTo(5 + (24.6 - 5) * (1 - Math.pow(1 - 0.2, 3)), 2);
    expect(sampleT2.position[0]).toBeCloseTo(5 + (24.6 - 5) * (1 - Math.pow(1 - 0.8, 3)), 2);
  });

  it('[TC-455.07/MSS][UC-SINGLE-HOP-CONSUMER-WIRING/MSS] computeHopFrame with flightType audit and transit consumes calibrated durations and remains incomplete at t=1.0s', () => {
    const auditDuration = resolveThematicVehicleHopDurationSec('audit', false);
    const transitDuration = resolveThematicVehicleHopDurationSec('transit', false);

    const auditFrame = computeHopFrame({
      elapsed: 0.95,
      delta: 0.05,
      hopDuration: auditDuration,
      landingDuration: 0.12,
      arcHeight: 2.8,
      fromCell: 30,
      toCell: 10,
      offset: [0, 0, 0],
      soundPlayed: false,
      flightType: 'audit',
    });
    const transitFrame = computeHopFrame({
      elapsed: 0.95,
      delta: 0.05,
      hopDuration: transitDuration,
      landingDuration: 0.12,
      arcHeight: 2.8,
      fromCell: 5,
      toCell: 15,
      offset: [0, 0, 0],
      soundPlayed: false,
      flightType: 'transit',
    });

    expect(auditDuration).toBe(3.8);
    expect(transitDuration).toBe(3.2);
    expect(auditFrame.isComplete).toBe(false);
    expect(transitFrame.isComplete).toBe(false);
  });
});
