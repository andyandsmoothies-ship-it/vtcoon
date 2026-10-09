// [TC-320.01..06/MSS][UC-FSM][UC-COORD] FSM Restoration & Deep Property Coordinator Contract Suite
// SSOT: .agents/plans/PLAN_IMP_320_FSM_RESTORATION_AND_DEEP_COORDINATOR.md
// Invariant References: docs/domain/gotchas/fsm_lifecycle.md, docs/domain/gotchas/deep_modules.md

import { describe, it, expect } from 'vitest';
import { TurnPhase, ActionRejectReason } from '../../src/domain/room.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { checkInsolvency } from '../../src/server/insolvency_manager.js';
import { coordDowngrade, type RoomContext } from '../../src/server/room_property_coordinator.js';
import type { DowngradeOptions } from '../../src/domain/property_upgrade.js';

// Station 1 Domain Model Augmentation for IMP-320
declare module '../../src/domain/room.js' {
  interface Room {
    preInsolvencyPhase?: TurnPhase;
  }
}

type CoordDowngradeFn = (
  ctx: RoomContext | undefined,
  playerId: string,
  cellIndex: number,
  roomCode: string,
  options?: DowngradeOptions,
) => { success: boolean; reason?: string };

const callCoordDowngrade: CoordDowngradeFn = (ctx, playerId, cellIndex, roomCode, options) => {
  return (coordDowngrade as Function)(ctx, playerId, cellIndex, roomCode, options);
};

describe('[TC-320.01..06/MSS][UC-FSM][UC-COORD] FSM Restoration & Deep Property Coordinator Contract Suite', () => {
  it('[TC-320.01/MSS][UC-FSM/MSS] Given turn player bot_4 is in ActionPhase and out-of-turn debtor p1 enters InsolvencyPhase, When p1 downgrades property to balance >= 0, Then room.phase is restored back to ActionPhase preserving bot_4 turn integrity', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'bot_4');
    mgr.startGame(room.roomCode);
    const reg = mgr.getRegistry(room.roomCode)!;
    const sm = mgr.getPropertyStates(room.roomCode)!;

    room.currentPlayerIndex = 1;
    room.phase = TurnPhase.ActionPhase;

    reg.set(16, 'p1');
    sm.set(16, { level: 3 });
    reg.set(18, 'p1');
    sm.set(18, { level: 3 });
    reg.set(19, 'p1');
    sm.set(19, { level: 3 });

    const p1 = room.players.find((p) => p.id === 'p1')!;
    p1.balance = -500;

    checkInsolvency(room, 'bot_4', 'p1');

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 19, {
      stepByStep: true,
      enforceEvenDowngrading: true,
    });

    expect(res.success).toBe(true);
    expect(p1.balance).toBeGreaterThanOrEqual(0);
    expect(room.phase).toBe(TurnPhase.ActionPhase);
    expect(room.currentPlayerIndex).toBe(1);
  });

  it('[TC-320.02/MSS][UC-FSM/MSS] Given turn player p1 is in InsolvencyPhase during their own turn, When p1 downgrades property to balance >= 0, Then room.phase transitions to PropertyManagement', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'bot_4');
    mgr.startGame(room.roomCode);
    const reg = mgr.getRegistry(room.roomCode)!;
    const sm = mgr.getPropertyStates(room.roomCode)!;

    room.currentPlayerIndex = 0;
    room.phase = TurnPhase.ActionPhase;

    reg.set(16, 'p1');
    sm.set(16, { level: 3 });
    reg.set(18, 'p1');
    sm.set(18, { level: 3 });
    reg.set(19, 'p1');
    sm.set(19, { level: 3 });

    const p1 = room.players.find((p) => p.id === 'p1')!;
    p1.balance = -500;

    checkInsolvency(room, 'bot_4', 'p1');

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 19, {
      stepByStep: true,
      enforceEvenDowngrading: true,
    });

    expect(res.success).toBe(true);
    expect(p1.balance).toBeGreaterThanOrEqual(0);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
    expect(room.currentPlayerIndex).toBe(0);
  });

  it('[TC-320.03/A1][UC-FSM/A1] Given out-of-turn debtor p1 in InsolvencyPhase during bot_4 turn, When p1 downgrades property to balance >= 0, Then room.preInsolvencyPhase is cleaned up', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'bot_4');
    mgr.startGame(room.roomCode);
    const reg = mgr.getRegistry(room.roomCode)!;
    const sm = mgr.getPropertyStates(room.roomCode)!;

    room.currentPlayerIndex = 1;
    room.phase = TurnPhase.ActionPhase;

    reg.set(16, 'p1');
    sm.set(16, { level: 3 });
    reg.set(18, 'p1');
    sm.set(18, { level: 3 });
    reg.set(19, 'p1');
    sm.set(19, { level: 3 });

    const p1 = room.players.find((p) => p.id === 'p1')!;
    p1.balance = -500;

    checkInsolvency(room, 'bot_4', 'p1');

    expect(room.preInsolvencyPhase).toBe(TurnPhase.ActionPhase);

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 19, {
      stepByStep: true,
      enforceEvenDowngrading: true,
    });

    expect(res.success).toBe(true);
    expect(room.preInsolvencyPhase).toBeUndefined();
  });

  it('[TC-320.04/MSS][UC-COORD/MSS] Given room in InsolvencyPhase with out-of-turn debtor p1, When coordDowngrade is called directly with playerId \'p1\', Then internally resolves debtor and downgrades successfully', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'bot_4');
    mgr.startGame(room.roomCode);
    const reg = mgr.getRegistry(room.roomCode)!;
    const sm = mgr.getPropertyStates(room.roomCode)!;

    room.currentPlayerIndex = 1;
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyCreditorId = 'bot_4';

    reg.set(16, 'p1');
    sm.set(16, { level: 3 });
    reg.set(18, 'p1');
    sm.set(18, { level: 3 });
    reg.set(19, 'p1');
    sm.set(19, { level: 3 });

    const p1 = room.players.find((p) => p.id === 'p1')!;
    p1.balance = -500;

    const ctx = mgr.getContext(room.roomCode);
    const res = callCoordDowngrade(ctx, 'p1', 19, room.roomCode, {
      stepByStep: true,
      enforceEvenDowngrading: true,
    });

    expect(res.success).toBe(true);
    expect(sm.get(19)?.level).toBe(2);
    expect(p1.balance).toBe(500);
  });

  it('[TC-320.05/A2][UC-COORD/A2] Given coordDowngrade called, When non-existent playerId \'non_existent\' is passed, Then returns failure with PLAYER_NOT_FOUND reason', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'bot_4');
    mgr.startGame(room.roomCode);

    const ctx = mgr.getContext(room.roomCode);
    const res = callCoordDowngrade(ctx, 'non_existent', 19, room.roomCode);

    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.PLAYER_NOT_FOUND);
  });

  it('[TC-320.06/A3][UC-COORD/A3] Given undefined room context, When coordDowngrade is called with playerId \'p1\', Then returns failure with INVALID_ROOM reason', () => {
    const res = callCoordDowngrade(undefined, 'p1', 19, 'NONEXISTENT_ROOM');

    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.INVALID_ROOM);
  });

  it('[TC-320.07/MSS][UC-FSM/MORT] Given turn player bot_4 is in ActionPhase and out-of-turn debtor p1 enters InsolvencyPhase, When p1 mortgages property to balance >= 0, Then room.phase is restored back to ActionPhase preserving bot_4 turn integrity', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'bot_4');
    mgr.startGame(room.roomCode);
    const reg = mgr.getRegistry(room.roomCode)!;
    const sm = mgr.getPropertyStates(room.roomCode)!;

    room.currentPlayerIndex = 1;
    room.phase = TurnPhase.ActionPhase;

    reg.set(1, 'p1');
    sm.set(1, { level: 0 });

    const p1 = room.players.find((p) => p.id === 'p1')!;
    p1.balance = -200;

    checkInsolvency(room, 'bot_4', 'p1');

    const res = mgr.handleMortgage(room.roomCode, 'p1', 1);

    expect(res.success).toBe(true);
    expect(p1.balance).toBeGreaterThanOrEqual(0);
    expect(room.phase).toBe(TurnPhase.ActionPhase);
    expect(room.currentPlayerIndex).toBe(1);
  });

  it('[TC-320.08/MSS][UC-FSM/BANKRUPT] Given turn player bot_4 is in ActionPhase and out-of-turn debtor p1 enters InsolvencyPhase, When p1 declares bankruptcy, Then room.phase is restored back to ActionPhase preserving bot_4 turn integrity', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'bot_4');
    mgr.joinRoom(room.roomCode, 'bot_3');
    mgr.startGame(room.roomCode);
    const reg = mgr.getRegistry(room.roomCode)!;
    const sm = mgr.getPropertyStates(room.roomCode)!;

    room.currentPlayerIndex = 1;
    room.phase = TurnPhase.ActionPhase;

    const p1 = room.players.find((p) => p.id === 'p1')!;
    p1.balance = -5000;

    checkInsolvency(room, 'bot_4', 'p1');

    const res = mgr.handleBankruptcy(room.roomCode, 'p1');

    expect(res.gameOver).toBe(false);
    expect(p1.bankrupt).toBe(true);
    expect(room.phase).toBe(TurnPhase.ActionPhase);
    expect(room.currentPlayerIndex).toBe(1);
  });
});
