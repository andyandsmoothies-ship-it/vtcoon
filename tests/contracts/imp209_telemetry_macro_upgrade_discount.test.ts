// [TC-209.01/MSS..TC-209.06/A5][UC-IMP209]
// Contract Test Suite: IMP-209 Telemetry Macro Upgrade Discount Reconciliation
// Proves that when MacroCycleType.MACRO_LAND_FEVER (-25% building cost) is active,
// computeExpectedDelta and handleDeltaTelemetry accurately reconcile discounted building costs
// instead of spuriously flagging TREASURY_INVARIANT_VIOLATED.

import { describe, it, expect, beforeEach } from 'vitest';
import { handleDeltaTelemetry, computeExpectedDelta } from '../../src/client/telemetry/telemetry_delta_hook.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';
import { watchdogMonitor } from '../../src/client/telemetry/watchdog_monitor.js';
import type { GameState } from '../../src/client/store/game_store.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { MacroCycleType } from '../../src/domain/macro_cycle_types.js';
import { MarketCardId } from '../../src/domain/event_card_types.js';
import { ColorGroup } from '../../src/domain/board_config.js';
import type { MarketModifier } from '../../src/domain/room.js';

describe('IMP-209 Telemetry Macro Upgrade Discount Reconciliation', () => {
  beforeEach(() => {
    useTelemetryStore.getState().reset();
    watchdogMonitor.reset();
  });

  const macroModifiers: readonly MarketModifier[] = [
    {
      type: MacroCycleType.MACRO_LAND_FEVER,
      affectedCells: [1, 3, 37],
      remainingRounds: 2,
      multiplier: 2.5,
      colorGroup: ColorGroup.Nau,
    },
  ];

  const createMacroTestState = (overrides?: {
    readonly p1Balance?: number;
    readonly levels?: Record<number, number>;
    readonly treasuryPool?: number;
  }): GameState =>
    ({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Player 1',
          balance: overrides?.p1Balance ?? 15_000,
          tokenColor: '#ff0000',
          ownedProperties: [1, 3, 37],
          mortgagedProperties: [],
        },
      },
      playerPositions: { p1: 1 },
      levelMap: overrides?.levels ? { ...overrides.levels } : {},
      treasuryPool: overrides?.treasuryPool ?? 10_000,
      roundNumber: 20,
      activeModal: null,
      currentTurnPlayerId: 'p1',
      turnTimeRemaining: 30,
      activeModifiers: macroModifiers,
    } as unknown as GameState);

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (Cell 1: base 300, 450, 600 -> -25% discount)
  // =========================================================================
  it('[TC-209.01/MSS] computeExpectedDelta calculates -225 for Cell 1 upgrade 0->1 under MACRO_LAND_FEVER', () => {
    const pre = createMacroTestState({ levels: { 1: 0 } });
    const delta: DeltaPayload = {
      tick: 261,
      cells: [{ index: 1, level: 1, ownerId: 'p1' }],
      players: [{ id: 'p1', position: 1, balance: 14_775 }],
      activeModifiers: macroModifiers,
    };

    const expected = computeExpectedDelta(delta, pre);
    expect(expected).toBe(-225);
  });

  it('[TC-209.02/MSS] computeExpectedDelta calculates -337 for Cell 1 upgrade 1->2 under MACRO_LAND_FEVER', () => {
    const pre = createMacroTestState({ levels: { 1: 1 } });
    const delta: DeltaPayload = {
      tick: 263,
      cells: [{ index: 1, level: 2, ownerId: 'p1' }],
      players: [{ id: 'p1', position: 1, balance: 14_663 }],
      activeModifiers: macroModifiers,
    };

    const expected = computeExpectedDelta(delta, pre);
    expect(expected).toBe(-337);
  });

  it('[TC-209.03/MSS] computeExpectedDelta calculates -450 for Cell 1 upgrade 2->3 under MACRO_LAND_FEVER', () => {
    const pre = createMacroTestState({ levels: { 1: 2 } });
    const delta: DeltaPayload = {
      tick: 265,
      cells: [{ index: 1, level: 3, ownerId: 'p1' }],
      players: [{ id: 'p1', position: 1, balance: 14_550 }],
      activeModifiers: macroModifiers,
    };

    const expected = computeExpectedDelta(delta, pre);
    expect(expected).toBe(-450);
  });

  // =========================================================================
  // FACET 2: HIGH VALUE CELL (Cell 37: base 1750 -> -25% discount = 1312)
  // =========================================================================
  it('[TC-209.04/MSS] computeExpectedDelta calculates -1312 for Cell 37 upgrade 0->1 under MACRO_LAND_FEVER (Tick 134 Replay)', () => {
    const pre = createMacroTestState({ levels: { 37: 0 }, p1Balance: 15_000 });
    const delta: DeltaPayload = {
      tick: 134,
      cells: [{ index: 37, level: 1, ownerId: 'p1' }],
      players: [{ id: 'p1', position: 37, balance: 13_688 }],
      activeModifiers: macroModifiers,
    };

    const expected = computeExpectedDelta(delta, pre);
    expect(expected).toBe(-1312);
  });

  // =========================================================================
  // FACET 3: END-TO-END TELEMETRY HOOK (Room VTOAH2 Tick 266 Replay)
  // =========================================================================
  it('[TC-209.05/MSS] handleDeltaTelemetry produces 0 TREASURY_INVARIANT_VIOLATED when upgrading under MACRO_LAND_FEVER', () => {
    const pre = createMacroTestState({ levels: { 1: 2 }, p1Balance: 53_414 });
    const post = createMacroTestState({ levels: { 1: 3 }, p1Balance: 52_964 });

    const delta: DeltaPayload = {
      tick: 266,
      currentTurnPlayerId: 'p1',
      cells: [{ index: 1, level: 3, ownerId: 'p1' }],
      players: [{ id: 'p1', position: 1, balance: 52_964 }],
      activeModifiers: macroModifiers,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
    expect(violations.length).toBe(0);
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE (Cheating / Real Treasury Leak Caught)
  // =========================================================================
  it('[TC-209.06/A5] handleDeltaTelemetry FLAGS violation if actual expenditure diverges from expected discount', () => {
    const pre = createMacroTestState({ levels: { 1: 2 }, p1Balance: 53_414 });
    // Player actually only spent 100 Tr instead of 450 Tr (-350 Tr unexplained leak/cheat)
    const post = createMacroTestState({ levels: { 1: 3 }, p1Balance: 53_314 });

    const delta: DeltaPayload = {
      tick: 267,
      currentTurnPlayerId: 'p1',
      cells: [{ index: 1, level: 3, ownerId: 'p1' }],
      players: [{ id: 'p1', position: 1, balance: 53_314 }],
      activeModifiers: macroModifiers,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
    expect(violations.length).toBe(1);
    expect(violations[0]?.details.actualDelta).toBe(-100);
    expect(violations[0]?.details.expected).toBe(-450);
  });
});
