// [CONTRACT TEST] IMP-284: Activity Feed Causal Timeline Ordering
// Traceability Tags: [TC-284.01/MSS] .. [TC-284.09/MSS], [TC-284.10/A1] & [UC-IMP284]
// SSOT Reference: docs/domain/gotchas/fsm_lifecycle.md, testing_traps.md, .agents/plans/PLAN_IMP_284_ACTIVITY_FEED_CAUSAL_ORDERING.md

import { describe, it, expect, beforeEach } from 'vitest';
import {
  trackDeltaActivities,
  resetTransitActivityTracker,
  resetEventCardActivityTracker,
  resetAuctionActivityTracker,
  resetHoseActivityTracker,
} from '../../src/client/network/activity_tracker.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import { useGameStore, type GameState, type PlayerHudInfo } from '../../src/client/store/game_store.js';
import { TransitWheelOutcome } from '../../src/domain/transit_wheel.js';
import type { DeltaPayload, PlayerDelta } from '../../src/server/session_manager.js';

function createMockPlayerHudInfo(overrides: Partial<PlayerHudInfo> & { id: string }): PlayerHudInfo {
  return {
    name: overrides.name ?? overrides.id.toUpperCase(),
    balance: 15_000,
    tokenColor: '#38BDF8',
    ownedProperties: [],
    ...overrides,
  };
}

function createMockPlayerDelta(overrides: Partial<PlayerDelta> & { id: string }): PlayerDelta {
  return {
    position: 0,
    balance: 15_000,
    ...overrides,
  };
}

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    playerPositions: { p1: 0 },
    playersInfo: {
      p1: createMockPlayerHudInfo({ id: 'p1', name: 'Người chơi 1' }),
    },
    ...overrides,
  };
}

function createMockDelta(overrides: Partial<DeltaPayload> = {}): DeltaPayload {
  return {
    tick: 1,
    cells: [],
    ...overrides,
  };
}

describe('IMP-284 Contract Tests: Activity Feed Causal Timeline Ordering', () => {
  beforeEach(() => {
    useActivityStore.setState({
      activityLogs: [],
      isActivityFeedOpen: false,
      unreadCount: 0,
      activeFilter: 'all',
      lastDiceSeq: undefined,
      lastAuctionBid: undefined,
    });
    resetTransitActivityTracker();
    resetEventCardActivityTracker();
    resetHoseActivityTracker();
    resetAuctionActivityTracker();
  });

  // [TC-284.01][UC-IMP284/MSS]
  it('[TC-284.01][UC-IMP284/MSS] Given PASS_GO_FLIGHT outcome and passedGoSalary, When trackDeltaActivities executes, Then transit log precedes move log', () => {
    const prevState = createMockGameState({
      playerPositions: { p1: 35 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000 }),
      },
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 0 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 17_000 }),
      },
    });
    const delta = createMockDelta({
      tick: 1,
      roundNumber: 1,
      passedGoSalary: 2_000,
      players: [createMockPlayerDelta({ id: 'p1', position: 0, balance: 17_000 })],
      lastTransitResult: {
        playerId: 'p1',
        cellIndex: 35,
        outcome: TransitWheelOutcome.PASS_GO_FLIGHT,
        targetCell: 0,
        payout: 2_000,
      },
    });

    trackDeltaActivities(delta, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;
    const transitIdx = logs.findIndex((l) => l.type === 'transit');
    const moveIdx = logs.findIndex((l) => l.type === 'move');

    expect(transitIdx).toBeGreaterThanOrEqual(0);
    expect(moveIdx).toBeGreaterThanOrEqual(0);
    expect(transitIdx < moveIdx).toBe(true);
    expect(logs[0]?.type).toBe('transit');
  });

  // [TC-284.02][UC-IMP284/MSS]
  it('[TC-284.02][UC-IMP284/MSS] Given PASS_GO_FLIGHT outcome and passedGoSalary, When trackDeltaActivities executes, Then transit log precedes salary log', () => {
    const prevState = createMockGameState({
      playerPositions: { p1: 35 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000 }),
      },
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 0 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 17_000 }),
      },
    });
    const delta = createMockDelta({
      tick: 2,
      roundNumber: 1,
      passedGoSalary: 2_000,
      players: [createMockPlayerDelta({ id: 'p1', position: 0, balance: 17_000 })],
      lastTransitResult: {
        playerId: 'p1',
        cellIndex: 35,
        outcome: TransitWheelOutcome.PASS_GO_FLIGHT,
        targetCell: 0,
        payout: 2_000,
      },
    });

    trackDeltaActivities(delta, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;
    const transitIdx = logs.findIndex((l) => l.type === 'transit');
    const salaryIdx = logs.findIndex((l) => l.type === 'salary');

    expect(transitIdx).toBeGreaterThanOrEqual(0);
    expect(salaryIdx).toBeGreaterThanOrEqual(0);
    expect(transitIdx < salaryIdx).toBe(true);
    expect(logs[0]?.type).toBe('transit');
  });

  // [TC-284.03][UC-IMP284/MSS]
  it('[TC-284.03][UC-IMP284/MSS] Given PASS_GO_FLIGHT outcome, When trackDeltaActivities executes, Then move log precedes salary log', () => {
    const prevState = createMockGameState({
      playerPositions: { p1: 35 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000 }),
      },
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 0 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 17_000 }),
      },
    });
    const delta = createMockDelta({
      tick: 3,
      roundNumber: 1,
      passedGoSalary: 2_000,
      players: [createMockPlayerDelta({ id: 'p1', position: 0, balance: 17_000 })],
      lastTransitResult: {
        playerId: 'p1',
        cellIndex: 35,
        outcome: TransitWheelOutcome.PASS_GO_FLIGHT,
        targetCell: 0,
        payout: 2_000,
      },
    });

    trackDeltaActivities(delta, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;
    const moveIdx = logs.findIndex((l) => l.type === 'move');
    const salaryIdx = logs.findIndex((l) => l.type === 'salary');

    expect(moveIdx).toBeGreaterThanOrEqual(0);
    expect(salaryIdx).toBeGreaterThanOrEqual(0);
    expect(moveIdx < salaryIdx).toBe(true);
    expect(logs.map((l) => l.type)).toEqual(['transit', 'move', 'salary']);
  });

  // [TC-284.04][UC-IMP284/MSS]
  it('[TC-284.04][UC-IMP284/MSS] Given NEXT_PORT outcome and destination cell move, When trackDeltaActivities executes, Then transit log precedes move log', () => {
    const prevState = createMockGameState({
      playerPositions: { p1: 5 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000 }),
      },
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 15 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000 }),
      },
    });
    const delta = createMockDelta({
      tick: 4,
      roundNumber: 1,
      players: [createMockPlayerDelta({ id: 'p1', position: 15 })],
      lastTransitResult: {
        playerId: 'p1',
        cellIndex: 5,
        outcome: 'NEXT_PORT',
        targetCell: 15,
      },
    });

    trackDeltaActivities(delta, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;
    const transitIdx = logs.findIndex((l) => l.type === 'transit');
    const moveIdx = logs.findIndex((l) => l.type === 'move');

    expect(transitIdx).toBeGreaterThanOrEqual(0);
    expect(moveIdx).toBeGreaterThanOrEqual(0);
    expect(transitIdx < moveIdx).toBe(true);
    expect(logs.map((l) => l.type)).toEqual(['transit', 'move']);
  });

  // [TC-284.05][UC-IMP284/MSS]
  it('[TC-284.05][UC-IMP284/MSS] Given SPEED_BOOST outcome and step forward move, When trackDeltaActivities executes, Then transit log precedes move log', () => {
    const prevState = createMockGameState({
      playerPositions: { p1: 15 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000 }),
      },
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 19 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000 }),
      },
    });
    const delta = createMockDelta({
      tick: 5,
      roundNumber: 1,
      players: [createMockPlayerDelta({ id: 'p1', position: 19 })],
      lastTransitResult: {
        playerId: 'p1',
        cellIndex: 15,
        outcome: TransitWheelOutcome.SPEED_BOOST,
        targetCell: 19,
        boostSteps: 4,
      },
    });

    trackDeltaActivities(delta, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;
    const transitIdx = logs.findIndex((l) => l.type === 'transit');
    const moveIdx = logs.findIndex((l) => l.type === 'move');

    expect(transitIdx).toBeGreaterThanOrEqual(0);
    expect(moveIdx).toBeGreaterThanOrEqual(0);
    expect(transitIdx < moveIdx).toBe(true);
    expect(logs.map((l) => l.type)).toEqual(['transit', 'move']);
  });

  // [TC-284.06][UC-IMP284/MSS]
  it('[TC-284.06][UC-IMP284/MSS] Given CASH_BACK outcome with treasury payout, When trackDeltaActivities executes, Then transit log precedes financial log', () => {
    const prevState = createMockGameState({
      treasuryPool: 2_000,
      playerPositions: { p1: 25 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000 }),
      },
    });
    const nextState = createMockGameState({
      treasuryPool: 1_700,
      playerPositions: { p1: 25 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_300 }),
      },
    });
    const delta = createMockDelta({
      tick: 6,
      roundNumber: 1,
      treasury: 1_700,
      players: [createMockPlayerDelta({ id: 'p1', position: 25, balance: 15_300 })],
      lastTransitResult: {
        playerId: 'p1',
        cellIndex: 25,
        outcome: TransitWheelOutcome.CASH_BACK,
        payout: 300,
      },
    });

    trackDeltaActivities(delta, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;
    const transitIdx = logs.findIndex((l) => l.type === 'transit');
    const finIdx = logs.findIndex(
      (l) => l.type === 'system' || (typeof l.amount === 'number' && l.amount > 0 && l.type !== 'transit'),
    );

    expect(transitIdx).toBeGreaterThanOrEqual(0);
    expect(finIdx).toBeGreaterThanOrEqual(0);
    expect(transitIdx).toBeLessThan(finIdx);
  });

  // [TC-284.07][UC-IMP284/MSS]
  it('[TC-284.07][UC-IMP284/MSS] Given Chance card flight and destination move, When trackDeltaActivities executes, Then card log precedes move log', () => {
    const prevState = createMockGameState({
      playerPositions: { p1: 7 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000 }),
      },
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 15 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000 }),
      },
    });
    const delta = createMockDelta({
      tick: 7,
      roundNumber: 1,
      players: [createMockPlayerDelta({ id: 'p1', position: 15 })],
      lastEventCard: {
        id: 'cc_flight',
        title: 'Chuyến Bay Bất Ngờ',
        description: 'Bay thẳng đến Cảng Hàng Không Quốc Tế',
        type: 'Chance',
        cardType: 'chance',
        drawnBy: 'p1',
      },
    });

    trackDeltaActivities(delta, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;
    const cardIdx = logs.findIndex((l) => l.type === 'card');
    const moveIdx = logs.findIndex((l) => l.type === 'move');

    expect(cardIdx).toBeGreaterThanOrEqual(0);
    expect(moveIdx).toBeGreaterThanOrEqual(0);
    expect(cardIdx).toBeLessThan(moveIdx);
  });

  // [TC-284.08][UC-IMP284/MSS]
  it('[TC-284.08][UC-IMP284/MSS] Given standard dice roll and landing, When trackDeltaActivities executes, Then dice log precedes move log', () => {
    const prevState = createMockGameState({
      playerPositions: { p1: 0 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000 }),
      },
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 7 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000 }),
      },
    });
    const delta = createMockDelta({
      tick: 8,
      dice: [3, 4],
      diceRollerId: 'p1',
      diceSeq: 1,
      players: [createMockPlayerDelta({ id: 'p1', position: 7 })],
    });

    trackDeltaActivities(delta, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;
    const diceIdx = logs.findIndex((l) => l.type === 'dice');
    const moveIdx = logs.findIndex((l) => l.type === 'move');

    expect(diceIdx).toBeGreaterThanOrEqual(0);
    expect(moveIdx).toBeGreaterThanOrEqual(0);
    expect(diceIdx).toBeLessThan(moveIdx);
  });

  // [TC-284.09][UC-IMP284/MSS]
  it('[TC-284.09][UC-IMP284/MSS] Given standard dice roll and property purchase, When trackDeltaActivities executes, Then move log precedes property purchase log', () => {
    const prevState = createMockGameState({
      playerPositions: { p1: 0 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000, ownedProperties: [] }),
      },
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 1 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 14_000, ownedProperties: [1] }),
      },
    });
    const delta = createMockDelta({
      tick: 9,
      players: [createMockPlayerDelta({ id: 'p1', position: 1, balance: 14_000 })],
      cells: [{ index: 1, ownerId: 'p1' }],
    });

    trackDeltaActivities(delta, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;
    const moveIdx = logs.findIndex((l) => l.type === 'move');
    const propIdx = logs.findIndex((l) => l.type === 'buy');

    expect(moveIdx).toBeGreaterThanOrEqual(0);
    expect(propIdx).toBeGreaterThanOrEqual(0);
    expect(moveIdx).toBeLessThan(propIdx);
  });

  // [TC-284.10][UC-IMP284/A1]
  it('[TC-284.10][UC-IMP284/A1] Given FLIGHT_DELAY outcome without movement, When trackDeltaActivities executes, Then transit log is recorded with zero spurious move log', () => {
    const prevState = createMockGameState({
      playerPositions: { p1: 5 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000 }),
      },
    });
    const nextState = createMockGameState({
      playerPositions: { p1: 5 },
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', balance: 15_000 }),
      },
    });
    const delta = createMockDelta({
      tick: 10,
      roundNumber: 1,
      players: [createMockPlayerDelta({ id: 'p1', position: 5 })],
      lastTransitResult: {
        playerId: 'p1',
        cellIndex: 5,
        outcome: TransitWheelOutcome.FLIGHT_DELAY,
      },
    });

    trackDeltaActivities(delta, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;
    const transitLogs = logs.filter((l) => l.type === 'transit');
    const moveLogs = logs.filter((l) => l.type === 'move');

    expect(transitLogs).toHaveLength(1);
    expect(moveLogs).toHaveLength(0);
    expect(transitLogs[0]?.message).toContain('bị hoãn');
  });
});
