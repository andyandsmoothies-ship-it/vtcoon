// [TC-325.01..08/MSS][UC-TREAS-DEACT]
// Contract Test Suite: IMP-325 Deactivate Treasury Public Stimulus in Domain & Server Loop
// Station 1: Red Contract Tests (Strict Separation of Duties — Zero modifications to src/)

import { describe, it, expect } from 'vitest';
import * as treasuryModule from '../../src/domain/treasury_stimulus.js';
import { processTreasuryStimulus } from '../../src/domain/treasury_stimulus.js';
import { advanceRoundBoundary } from '../../src/server/turn_loop.js';
import { createPlayer, createRoom, type Player, type Room } from '../../src/domain/room.js';

function setupRoom(treasury = 50_000): { room: Room; p1: Player; p2: Player; p3: Player; p4: Player } {
  const room = createRoom('host_user');
  room.started = true;
  room.roundCount = 5;
  room.treasury = treasury;

  const p1 = createPlayer('player_alpha');
  p1.balance = 1_000;
  p1.bankrupt = false;

  const p2 = createPlayer('player_beta');
  p2.balance = 2_000;
  p2.bankrupt = false;

  const p3 = createPlayer('player_gamma');
  p3.balance = 10_000;
  p3.bankrupt = false;

  const p4 = createPlayer('player_delta');
  p4.balance = 20_000;
  p4.bankrupt = false;

  room.players = [p1, p2, p3, p4];
  return { room, p1, p2, p3, p4 };
}

describe('[CONTRACT-TEST] IMP-325: Deactivate Treasury Public Stimulus in Domain & Server Loop', () => {
  it('[TC-325.01/MSS][UC-TREAS-DEACT] Given ENABLE_TREASURY_STIMULUS imported from domain, When inspected, Then equals false confirming deactivation', () => {
    const toggle = (treasuryModule as Record<string, unknown>).ENABLE_TREASURY_STIMULUS;
    expect(toggle).toBe(false);
  });

  it('[TC-325.02/MSS][UC-TREAS-DEACT] Given room at round boundary with treasury 50,000 and poor players, When advanceRoundBoundary is executed, Then treasury balance remains exactly 50,000 without deduction', () => {
    const { room } = setupRoom(50_000);
    const deterministicRng = () => 0.5;

    advanceRoundBoundary(room, deterministicRng);

    expect(room.treasury).toBe(50_000);
  });

  it('[TC-325.03/MSS][UC-TREAS-DEACT] Given room at round boundary with active players, When advanceRoundBoundary is executed, Then poorest player balance remains strictly unchanged', () => {
    const { room, p1 } = setupRoom(50_000);
    const deterministicRng = () => 0.5;

    advanceRoundBoundary(room, deterministicRng);

    expect(p1.balance).toBe(1_000);
  });

  it('[TC-325.04/MSS][UC-TREAS-DEACT] Given room at round boundary with active players, When advanceRoundBoundary is executed, Then second poorest player balance remains strictly unchanged', () => {
    const { room, p2 } = setupRoom(50_000);
    const deterministicRng = () => 0.5;

    advanceRoundBoundary(room, deterministicRng);

    expect(p2.balance).toBe(2_000);
  });

  it('[TC-325.05/MSS][UC-TREAS-DEACT] Given room at round boundary with exact threshold treasury 10,000, When advanceRoundBoundary is executed, Then treasury is not deducted', () => {
    const { room } = setupRoom(10_000);
    const deterministicRng = () => 0.5;

    advanceRoundBoundary(room, deterministicRng);

    expect(room.treasury).toBe(10_000);
  });

  it('[TC-325.06/MSS][UC-TREAS-DEACT] Given room undergoing multiple successive round boundaries, When advanceRoundBoundary is invoked repeatedly, Then treasury remains preserved across all ticks', () => {
    const { room } = setupRoom(50_000);
    const deterministicRng = () => 0.5;

    advanceRoundBoundary(room, deterministicRng);
    advanceRoundBoundary(room, deterministicRng);

    expect(room.treasury).toBe(50_000);
  });

  it('[TC-325.07/MSS][UC-TREAS-DEACT] Given room at round boundary, When advanceRoundBoundary is executed, Then roundCount increments normally while preserving treasury', () => {
    const { room } = setupRoom(50_000);
    const deterministicRng = () => 0.5;

    advanceRoundBoundary(room, deterministicRng);

    expect(room.roundCount).toBe(6);
    expect(room.treasury).toBe(50_000);
  });

  it('[TC-325.08/A1][UC-TREAS-DEACT] Given processTreasuryStimulus invoked directly in isolation, When room has sufficient treasury, Then underlying calculation logic executes properly', () => {
    const { room } = setupRoom(50_000);

    const result = processTreasuryStimulus(room);

    expect(result).not.toBeNull();
    expect(result?.activated).toBe(true);
    expect(result?.amount).toBe(10_000);
    expect(result?.recipients).toHaveLength(2);
  });

  it('[TC-325.09/MSS][UC-TREAS-DEACT] Given ENABLE_TREASURY_STIMULUS toggle export, When checked for definition, Then it is defined and boolean', () => {
    const toggle = treasuryModule.ENABLE_TREASURY_STIMULUS;
    expect(toggle).toBeDefined();
    expect(toggle).toBe(false);
  });

  it('[TC-325.10/A2][UC-TREAS-DEACT] Given processTreasuryStimulus result, When recipient amounts are inspected, Then amount is strictly positive and bounded', () => {
    const { room } = setupRoom(50_000);
    const result = processTreasuryStimulus(room);

    expect(result?.recipients[0]?.amount).toBeGreaterThan(0);
    expect(result?.recipients[0]?.amount).toBeLessThan(10_000);
    expect(result?.recipients[0]?.playerId).toBe('player_alpha');
  });

  it('[TC-325.11/A3][UC-TREAS-DEACT] Given processTreasuryStimulus result, When recipient list is evaluated, Then exactly targets poorest players', () => {
    const { room, p1, p2, p3, p4 } = setupRoom(50_000);
    room.players = [p4, p3, p2, p1];
    const result = processTreasuryStimulus(room);

    const ids = result?.recipients.map((r) => r.playerId);
    expect(ids).toEqual(['player_alpha', 'player_beta']);
  });

  it('[TC-325.12/A4][UC-TREAS-DEACT] Given processTreasuryStimulus executed, When room treasury is deducted, Then treasury balance decreases deterministically', () => {
    const { room } = setupRoom(50_000);
    processTreasuryStimulus(room);

    expect(room.treasury).toBe(40_000);
    expect(room.treasury).toBeLessThan(50_000);
    expect(room.treasury).toBeGreaterThan(0);
  });

  it('[TC-325.13/A5][UC-TREAS-DEACT] Given room with treasury below threshold (5,000), When processTreasuryStimulus is evaluated, Then returns strictly null', () => {
    const { room } = setupRoom(5_000);
    const result = processTreasuryStimulus(room);

    expect(result).toBeNull();
  });
});
