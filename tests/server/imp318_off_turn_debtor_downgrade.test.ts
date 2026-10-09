// [TC-DOW-OTD.01..06/MSS][UC-DOW] Off-Turn Debtor Downgrade Contract Suite
// SSOT: .agents/plans/PLAN_IMP_318_OFF_TURN_DEBTOR_DOWNGRADE_FIX.md
// Invariant References: docs/domain/gotchas/fsm_lifecycle.md, docs/domain/gotchas/economy_treasury.md

import { describe, it, expect } from 'vitest';
import { TurnPhase, ActionRejectReason } from '../../src/domain/room.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { coordDowngrade } from '../../src/server/room_property_coordinator.js';
import { executeInsolvencyAfkRecovery } from '../../src/server/network/afk_recovery.js';

describe('[TC-DOW-OTD.01..06/MSS][UC-DOW] Off-Turn Debtor Downgrade Contract Suite', () => {
  it('[TC-DOW-OTD.01/MSS][UC-DOW/MSS] Given player p1 is in InsolvencyPhase as pendingInsolvencyDebtorId during bot_4 turn, When calling handleDowngrade on cell 19, Then successfully downgrades cell 19 from C3 to C2 and refunds building cost to p1 balance', () => {
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
    p1.balance = -2500;

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 19, {
      stepByStep: true,
      enforceEvenDowngrading: true,
    });

    expect(res.success).toBe(true);
    expect(sm.get(19)?.level).toBe(2);
    expect(p1.balance).toBe(-1500);
  });

  it('[TC-DOW-OTD.02/MSS][UC-DOW/MSS] Given player p1 has negative balance of -3406 with properties at C3 (cells 16, 18, 19), When executeInsolvencyAfkRecovery is invoked outside their turn, Then downgradeUntilSolvent successfully downgrades buildings until p1 balance >= 0, clearing insolvency state without bankruptcy', () => {
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
    p1.balance = -3406;

    const result = executeInsolvencyAfkRecovery(mgr, room.roomCode, 'p1');

    expect(result.rescued).toBe(true);
    expect(result.bankrupt).toBe(false);
    expect(p1.balance).toBeGreaterThanOrEqual(0);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('[TC-DOW-OTD.03/UC-DOW/A1] Given room in InsolvencyPhase with debtor p1, When a non-debtor player bot_2 attempts handleDowngrade, Then request is rejected with NOT_YOUR_TURN or INVALID_PHASE', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'bot_4');
    mgr.joinRoom(room.roomCode, 'bot_2');
    mgr.startGame(room.roomCode);
    const reg = mgr.getRegistry(room.roomCode)!;
    const sm = mgr.getPropertyStates(room.roomCode)!;

    room.currentPlayerIndex = 1;
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyCreditorId = 'bot_4';

    reg.set(19, 'p1');
    sm.set(19, { level: 3 });

    const res = mgr.handleDowngrade(room.roomCode, 'bot_2', 19, {
      stepByStep: true,
      enforceEvenDowngrading: true,
    });

    expect(res.success).toBe(false);
    expect(res.reason === ActionRejectReason.NOT_YOUR_TURN || res.reason === ActionRejectReason.INVALID_PHASE).toBe(true);
  });

  it('[TC-DOW-OTD.04/UC-DOW/A2] Given active turn player during normal PropertyManagement phase, When calling handleDowngrade, Then maintains standard single-step downgrade behavior preserving existing contracts', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'bot_4');
    mgr.startGame(room.roomCode);
    const reg = mgr.getRegistry(room.roomCode)!;
    const sm = mgr.getPropertyStates(room.roomCode)!;

    room.currentPlayerIndex = 0;
    room.phase = TurnPhase.PropertyManagement;

    reg.set(16, 'p1');
    sm.set(16, { level: 2 });
    reg.set(18, 'p1');
    sm.set(18, { level: 2 });
    reg.set(19, 'p1');
    sm.set(19, { level: 2 });

    const p1 = room.players[0]!;
    p1.balance = 5000;

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 19, {
      stepByStep: true,
      enforceEvenDowngrading: true,
    });

    expect(res.success).toBe(true);
    expect(sm.get(19)?.level).toBe(1);
    expect(p1.balance).toBe(5750);
  });

  it('[TC-DOW-OTD.05/UC-DOW/A3] Given undefined room context, When coordDowngrade is called, Then returns failure with INVALID_ROOM reason', () => {
    const res = coordDowngrade(undefined, 'p1', 19, 'NONEXISTENT_ROOM');

    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.INVALID_ROOM);
  });

  it('[TC-DOW-OTD.06/UC-DOW/MSS] Given player p1 in InsolvencyPhase as pendingInsolvencyDebtorId during bot_4 turn whose balance reaches >= 0 after single downgrade on cell 19, When calling handleDowngrade, Then clears pendingInsolvency flags and transitions phase to PropertyManagement', () => {
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

    const res = mgr.handleDowngrade(room.roomCode, 'p1', 19, {
      stepByStep: true,
      enforceEvenDowngrading: true,
    });

    expect(res.success).toBe(true);
    expect(p1.balance).toBe(500);
    expect(room.pendingInsolvencyDebtorId).toBeUndefined();
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });
});
