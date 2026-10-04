// [TC-TEL-TW.01/MSS..TC-TEL-TW.15/Adversarial][UC-GAME-028]
// Contract Test Suite: Transit Wheel Second-Hop Telemetry Watchdog Defense
// Verifies that Transit Wheel outcomes (SPEED_BOOST, SAFE_HAVEN, PASS_GO_FLIGHT)
// from airport stations do NOT trigger false-positive INVALID_POSITION_STEP violations.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkIsTeleport,
  detectMovement,
  handleDeltaTelemetry,
} from '../../src/client/telemetry/telemetry_delta_hook.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { TurnPhase } from '../../src/domain/room.js';
import { TransitWheelOutcome } from '../../src/domain/transit_wheel.js';
import type { GameState, PlayerHudInfo } from '../../src/client/store/game_store_types.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

function createCleanTestState(params: {
  readonly p1Pos?: number;
  readonly botPos?: number;
  readonly botId?: string;
  readonly currentTurnPlayerId?: string;
}): GameState {
  const base = useGameStore.getState();
  const botId = params.botId ?? 'bot_4';
  const playersInfo: Record<string, PlayerHudInfo> = {
    p1: {
      id: 'p1',
      name: 'Player 1',
      balance: 15_000,
      tokenColor: '#ef4444',
      ownedProperties: [],
      mortgagedProperties: [],
      isBot: false,
    },
    [botId]: {
      id: botId,
      name: 'Bot Active',
      balance: 10_000,
      tokenColor: '#3b82f6',
      ownedProperties: [21],
      mortgagedProperties: [],
      isBot: true,
    },
  };

  return {
    ...base,
    playersInfo,
    playerPositions: {
      p1: params.p1Pos ?? 0,
      [botId]: params.botPos ?? 0,
    },
    visualPositions: {
      p1: params.p1Pos ?? 0,
      [botId]: params.botPos ?? 0,
    },
    currentTurnPlayerId: params.currentTurnPlayerId ?? botId,
    turnPhase: TurnPhase.PropertyManagement,
    roundNumber: 5,
    treasuryPool: 10_000,
  };
}

describe('Transit Wheel Second-Hop Telemetry Defense', () => {
  beforeEach(() => {
    useTelemetryStore.getState().clearViolations();
  });

  // =========================================================================
  // FACET 1: Pure Function Boundary (checkIsTeleport)
  // =========================================================================

  it('[TC-TEL-TW.01/MSS][UC-GAME-028] checkIsTeleport chấp nhận bước nhảy từ ga 5 tới ô 11 khi có hasTransitResult', () => {
    const result = checkIsTeleport(5, 11, true, TurnPhase.PropertyManagement, false, true);
    expect(result).toBe(true);
  });

  it('[TC-TEL-TW.02/MSS][UC-GAME-028] checkIsTeleport chấp nhận bước nhảy từ ga 35 tới ô 39 khi có hasTransitResult', () => {
    const result = checkIsTeleport(35, 39, true, TurnPhase.PropertyManagement, false, true);
    expect(result).toBe(true);
  });

  it('[TC-TEL-TW.03/MSS][UC-GAME-028] checkIsTeleport chấp nhận bước nhảy từ ga 15 tới ô an toàn 21 khi có hasTransitResult', () => {
    const result = checkIsTeleport(15, 21, true, TurnPhase.PropertyManagement, false, true);
    expect(result).toBe(true);
  });

  it('[TC-TEL-TW.04/MSS][UC-GAME-028] checkIsTeleport chấp nhận chuyến bay về ô Khởi Hành (ô 0) từ ga 25 khi có hasTransitResult', () => {
    const result = checkIsTeleport(25, 0, true, TurnPhase.PropertyManagement, false, true);
    expect(result).toBe(true);
  });

  it('[TC-TEL-TW.05/A1][UC-GAME-028] checkIsTeleport từ chối bước nhảy ga 5 tới ô 11 khi hasTransitResult là false', () => {
    const result = checkIsTeleport(5, 11, true, TurnPhase.PropertyManagement, false, false);
    expect(result).toBe(false);
  });

  it('[TC-TEL-TW.06/A1][UC-GAME-028] checkIsTeleport từ chối bước nhảy ga 35 tới ô 39 khi hasTransitResult là false', () => {
    const result = checkIsTeleport(35, 39, true, TurnPhase.PropertyManagement, false, false);
    expect(result).toBe(false);
  });

  // =========================================================================
  // FACET 2: Movement Detection Mapping (detectMovement)
  // =========================================================================

  it('[TC-TEL-TW.07/MSS][UC-GAME-028] detectMovement đánh dấu isTeleport true khi delta mang lastTransitResult khớp player ID di chuyển (ô 35 -> 39)', () => {
    const delta: DeltaPayload = {
      tick: 65,
      cells: [],
      currentTurnPlayerId: 'bot_4',
      diceRollerId: 'bot_4',
      dice: [3, 4],
      players: [{ id: 'bot_4', position: 39, balance: 10_000 }],
      lastTransitResult: {
        playerId: 'bot_4',
        cellIndex: 39,
        outcome: TransitWheelOutcome.SPEED_BOOST,
        targetCell: 39,
      },
      turnPhase: TurnPhase.PropertyManagement,
    };
    const prePositions = { bot_4: 35 };

    const movement = detectMovement(delta, prePositions);
    expect(movement?.isTeleport).toBe(true);
    expect(movement?.fromPosition).toBe(35);
    expect(movement?.toPosition).toBe(39);
  });

  it('[TC-TEL-TW.08/MSS][UC-GAME-028] detectMovement đánh dấu isTeleport true khi delta mang lastTransitResult khớp player ID di chuyển (ô 5 -> 11)', () => {
    const delta: DeltaPayload = {
      tick: 73,
      cells: [],
      currentTurnPlayerId: 'bot_3',
      diceRollerId: 'bot_3',
      dice: [5, 6],
      players: [{ id: 'bot_3', position: 11, balance: 10_000 }],
      lastTransitResult: {
        playerId: 'bot_3',
        cellIndex: 11,
        outcome: TransitWheelOutcome.SPEED_BOOST,
        targetCell: 11,
      },
      turnPhase: TurnPhase.PropertyManagement,
    };
    const prePositions = { bot_3: 5 };

    const movement = detectMovement(delta, prePositions);
    expect(movement?.isTeleport).toBe(true);
    expect(movement?.fromPosition).toBe(5);
    expect(movement?.toPosition).toBe(11);
  });

  it('[TC-TEL-TW.09/A1][UC-GAME-028] detectMovement giữ nguyên isTeleport false nếu lastTransitResult thuộc về người chơi khác', () => {
    const delta: DeltaPayload = {
      tick: 80,
      cells: [],
      currentTurnPlayerId: 'bot_4',
      diceRollerId: 'bot_4',
      dice: [3, 4],
      players: [{ id: 'bot_4', position: 39, balance: 10_000 }],
      lastTransitResult: {
        playerId: 'p1', // Thuộc về p1, không phải bot_4
        cellIndex: 39,
        outcome: TransitWheelOutcome.SPEED_BOOST,
        targetCell: 39,
      },
      turnPhase: TurnPhase.PropertyManagement,
    };
    const prePositions = { bot_4: 35 };

    const movement = detectMovement(delta, prePositions);
    expect(movement?.isTeleport).toBe(false);
  });

  // =========================================================================
  // FACET 3: Closed-Loop Invariant Integration (handleDeltaTelemetry)
  // =========================================================================

  it('[TC-TEL-TW.10/MSS][NET-S01/MSS][UC-GAME-028] handleDeltaTelemetry: Tái hiện Tick 65 (35 -> 39 với lastTransitResult) KHÔNG sinh INVALID_POSITION_STEP', () => {
    const pre = createCleanTestState({ botPos: 35, botId: 'bot_4' });
    const post = createCleanTestState({ botPos: 39, botId: 'bot_4' });

    const delta: DeltaPayload = {
      tick: 65,
      cells: [],
      currentTurnPlayerId: 'bot_4',
      diceRollerId: 'bot_4',
      dice: [3, 4], // Xúc xắc tổng 7 của đầu lượt
      players: [{ id: 'bot_4', position: 39, balance: 10_000 }],
      lastTransitResult: {
        playerId: 'bot_4',
        cellIndex: 39,
        outcome: TransitWheelOutcome.SPEED_BOOST,
        targetCell: 39,
      },
      turnPhase: TurnPhase.PropertyManagement,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore
      .getState()
      .violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
    expect(violations.length).toBe(0);
  });

  it('[TC-TEL-TW.11/MSS][NET-S01/MSS][UC-GAME-028] handleDeltaTelemetry: Tái hiện Tick 73 (5 -> 11 với lastTransitResult) KHÔNG sinh INVALID_POSITION_STEP', () => {
    const pre = createCleanTestState({ botPos: 5, botId: 'bot_3' });
    const post = createCleanTestState({ botPos: 11, botId: 'bot_3' });

    const delta: DeltaPayload = {
      tick: 73,
      cells: [],
      currentTurnPlayerId: 'bot_3',
      diceRollerId: 'bot_3',
      dice: [5, 6], // Xúc xắc tổng 11 của đầu lượt
      players: [{ id: 'bot_3', position: 11, balance: 10_000 }],
      lastTransitResult: {
        playerId: 'bot_3',
        cellIndex: 11,
        outcome: TransitWheelOutcome.SPEED_BOOST,
        targetCell: 11,
      },
      turnPhase: TurnPhase.PropertyManagement,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore
      .getState()
      .violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
    expect(violations.length).toBe(0);
  });

  it('[TC-TEL-TW.12/Adversarial][UC-GAME-028] handleDeltaTelemetry: Nhảy 5 -> 11 với xúc xắc 11 mà KHÔNG CÓ lastTransitResult PHẢI bị bắt vi phạm', () => {
    const pre = createCleanTestState({ botPos: 5, botId: 'bot_3' });
    const post = createCleanTestState({ botPos: 11, botId: 'bot_3' });

    const delta: DeltaPayload = {
      tick: 74,
      cells: [],
      currentTurnPlayerId: 'bot_3',
      diceRollerId: 'bot_3',
      dice: [5, 6], // 5 + 11 = 16 != 11
      players: [{ id: 'bot_3', position: 11, balance: 10_000 }],
      turnPhase: TurnPhase.PropertyManagement,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore
      .getState()
      .violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
    expect(violations.length).toBe(1);
    expect(violations[0]?.details?.expected).toBe(16);
  });

  it('[TC-TEL-TW.13/MSS][UC-GAME-028] handleDeltaTelemetry: SAFE_HAVEN từ ga 15 tới BĐS sở hữu 21 KHÔNG sinh INVALID_POSITION_STEP', () => {
    const pre = createCleanTestState({ botPos: 15, botId: 'bot_4' });
    const post = createCleanTestState({ botPos: 21, botId: 'bot_4' });

    const delta: DeltaPayload = {
      tick: 85,
      cells: [],
      currentTurnPlayerId: 'bot_4',
      diceRollerId: 'bot_4',
      dice: [1, 2],
      players: [{ id: 'bot_4', position: 21, balance: 10_000 }],
      lastTransitResult: {
        playerId: 'bot_4',
        cellIndex: 21,
        outcome: TransitWheelOutcome.SAFE_HAVEN,
        targetCell: 21,
      },
      turnPhase: TurnPhase.PropertyManagement,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore
      .getState()
      .violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
    expect(violations.length).toBe(0);
  });

  it('[TC-TEL-TW.14/MSS][UC-GAME-028] handleDeltaTelemetry: PASS_GO_FLIGHT từ ga 25 tới ô 0 KHÔNG sinh INVALID_POSITION_STEP', () => {
    const pre = createCleanTestState({ botPos: 25, botId: 'bot_4' });
    const post = createCleanTestState({ botPos: 0, botId: 'bot_4' });

    const delta: DeltaPayload = {
      tick: 90,
      cells: [],
      currentTurnPlayerId: 'bot_4',
      diceRollerId: 'bot_4',
      dice: [2, 3],
      players: [{ id: 'bot_4', position: 0, balance: 11_500 }],
      lastTransitResult: {
        playerId: 'bot_4',
        cellIndex: 0,
        outcome: TransitWheelOutcome.PASS_GO_FLIGHT,
        targetCell: 0,
        payout: 1500,
      },
      turnPhase: TurnPhase.PropertyManagement,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore
      .getState()
      .violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
    expect(violations.length).toBe(0);
  });

  it('[TC-TEL-TW.15/Adversarial][UC-GAME-028] handleDeltaTelemetry: Nhảy 35 -> 39 với xúc xắc 7 mà KHÔNG CÓ lastTransitResult PHẢI bị bắt vi phạm', () => {
    const pre = createCleanTestState({ botPos: 35, botId: 'bot_4' });
    const post = createCleanTestState({ botPos: 39, botId: 'bot_4' });

    const delta: DeltaPayload = {
      tick: 66,
      cells: [],
      currentTurnPlayerId: 'bot_4',
      diceRollerId: 'bot_4',
      dice: [3, 4], // (35 + 7) % 40 = 2 != 39
      players: [{ id: 'bot_4', position: 39, balance: 10_000 }],
      turnPhase: TurnPhase.PropertyManagement,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore
      .getState()
      .violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
    expect(violations.length).toBe(1);
    expect(violations[0]?.details?.expected).toBe(2);
  });
});
