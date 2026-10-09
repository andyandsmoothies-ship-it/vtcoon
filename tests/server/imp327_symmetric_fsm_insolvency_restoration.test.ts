// [TC-327.01..08/MSS][UC-FSM][UC-QUEUE] Symmetric FSM Insolvency Restoration & Multi-Debtor Queue Harmonization
// SSOT: .agents/plans/PLAN_IMP_327_SYMMETRIC_FSM_INSOLVENCY_RESTORATION.md
// Invariant References: docs/domain/gotchas/fsm_lifecycle.md (Gotcha #11, #12, #13)

import { describe, it, expect } from 'vitest';
import { TurnPhase, createPlayer, createRoom, type Room, type Player } from '../../src/domain/room.js';
import type { PropertyRegistry, PropertyStateMap, PropertyState } from '../../src/domain/property_manager.js';
import {
  restorePostInsolvencyPhase,
  declareBankruptcy,
} from '../../src/server/insolvency_manager.js';
import {
  coordDowngrade,
  coordMortgage,
  type RoomContext,
} from '../../src/server/room_property_coordinator.js';

// Station 1 Domain Model Augmentation for IMP-327
declare module '../../src/domain/room.js' {
  interface Room {
    pendingInsolvencyQueue?: string[];
    preInsolvencyPhase?: TurnPhase;
  }
}

function createTestPlayer(id: string, balance: number = 1500): Player {
  const p = createPlayer(id);
  p.balance = balance;
  return p;
}

function createTestRoom(players: Player[], currentIdx: number = 0): Room {
  const room = createRoom(players[0]?.id ?? 'p1', 'ROOM327');
  room.players = players;
  room.currentPlayerIndex = currentIdx;
  room.started = true;
  return room;
}

function createTestContext(room: Room): RoomContext {
  const reg: PropertyRegistry = new Map<number, string>();
  const sm: PropertyStateMap = new Map<number, PropertyState>();
  return { room, reg, sm };
}

describe('[TC-327.01..08/MSS][UC-FSM][UC-QUEUE] Symmetric FSM Insolvency Restoration Contract Suite', () => {
  it('[TC-327.01/MSS][UC-FSM/MSS] Given room in InsolvencyPhase with off-turn debtor p1 during turn player bot_4 in ActionPhase, When restorePostInsolvencyPhase is executed after p1 solvency, Then room.phase restores back to ActionPhase and cleans up preInsolvencyPhase', () => {
    const p1 = createTestPlayer('p1', 500);
    const bot_4 = createTestPlayer('bot_4', 1500);
    const room = createTestRoom([p1, bot_4], 1);
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';

    restorePostInsolvencyPhase(room, 'p1');

    expect(room.phase).toBe(TurnPhase.ActionPhase);
    expect(room.preInsolvencyPhase).toBeUndefined();
    expect(room.pendingInsolvencyDebtorId).toBeUndefined();
  });

  it('[TC-327.02/A1][UC-FSM/A1] Given room in InsolvencyPhase with turn player p1, When restorePostInsolvencyPhase is executed after p1 solvency, Then room.phase transitions to PropertyManagement', () => {
    const p1 = createTestPlayer('p1', 500);
    const bot_4 = createTestPlayer('bot_4', 1500);
    const room = createTestRoom([p1, bot_4], 0);
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';

    restorePostInsolvencyPhase(room, 'p1');

    expect(room.phase).toBe(TurnPhase.PropertyManagement);
    expect(room.preInsolvencyPhase).toBeUndefined();
    expect(room.pendingInsolvencyDebtorId).toBeUndefined();
  });

  it('[TC-327.03/MSS][UC-QUEUE/MSS] Given room in InsolvencyPhase with multi-debtor queue [p1, p2], When p1 downgrades property to balance >= 0, Then room advances to next debtor p2 and preserves InsolvencyPhase', () => {
    const p1 = createTestPlayer('p1', -500);
    const p2 = createTestPlayer('p2', -300);
    const bot_4 = createTestPlayer('bot_4', 1500);
    const room = createTestRoom([p1, p2, bot_4], 2);
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p1', 'p2'];

    const ctx = createTestContext(room);
    ctx.reg.set(19, 'p1');
    ctx.sm.set(19, { level: 2 });

    const res = coordDowngrade(ctx, 'p1', 19, room.roomCode, { stepByStep: true });

    expect(res.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    expect(room.pendingInsolvencyDebtorId).toBe('p2');
  });

  it('[TC-327.04/A1][UC-QUEUE/A1] Given room in InsolvencyPhase with multi-debtor queue [p1, p2], When p1 mortgages property to balance >= 0 via coordMortgage, Then room advances to next debtor p2 and preserves InsolvencyPhase', () => {
    const p1 = createTestPlayer('p1', -200);
    const p2 = createTestPlayer('p2', -300);
    const bot_4 = createTestPlayer('bot_4', 1500);
    const room = createTestRoom([p1, p2, bot_4], 2);
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p1', 'p2'];

    const ctx = createTestContext(room);
    ctx.reg.set(1, 'p1');
    ctx.sm.set(1, { level: 0 });

    const res = coordMortgage(ctx, 'p1', 1);

    expect(res.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    expect(room.pendingInsolvencyDebtorId).toBe('p2');
  });

  it('[TC-327.05/MSS][UC-CREDITOR/MSS] Given multi-debtor queue with debtor p1 owing Alice and debtor p2 in debt to Bank, When p1 becomes solvent, Then room.pendingInsolvencyCreditorId is cleared to prevent creditor poisoning of p2', () => {
    const p1 = createTestPlayer('p1', 100);
    const p2 = createTestPlayer('p2', -300);
    const alice = createTestPlayer('alice', 1500);
    const room = createTestRoom([p1, p2, alice], 2);
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyCreditorId = 'alice';
    room.pendingInsolvencyQueue = ['p1', 'p2'];

    restorePostInsolvencyPhase(room, 'p1');

    expect(room.pendingInsolvencyDebtorId).toBe('p2');
    expect(room.pendingInsolvencyCreditorId).toBeUndefined();
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
  });

  it('[TC-327.06/MSS][UC-DEADLOCK/MSS] Given multi-debtor queue [p0, p1] where turn player p0 goes bankrupt and p1 remains, When p1 restores solvency and queue drains, Then advanceTurnAfterBankruptcy is automatically invoked to prevent deadlock', () => {
    const p0 = createTestPlayer('p0', 0);
    p0.bankrupt = true;
    const p1 = createTestPlayer('p1', 500);
    const p2 = createTestPlayer('p2', 1500);
    const room = createTestRoom([p0, p1, p2], 0);
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p1'];

    restorePostInsolvencyPhase(room, 'p1');

    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
    expect(room.pendingInsolvencyQueue).toBeUndefined();
  });

  it('[TC-327.07/MSS][UC-CASCADE/MSS] Given multi-debtor queue [p1, p2] where both debtors declare bankruptcy in succession, When cascade bankruptcy occurs, Then checks isRoomGameOver and empties queue cleanly without trapped states', () => {
    const p0 = createTestPlayer('p0', 1500);
    const p1 = createTestPlayer('p1', -500);
    const p2 = createTestPlayer('p2', -500);
    const room = createTestRoom([p0, p1, p2], 1);
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p1', 'p2'];

    const ctx = createTestContext(room);
    const res1 = declareBankruptcy(room, 'p1', ctx.reg, ctx.sm);
    expect(res1.gameOver).toBe(false);

    const res2 = declareBankruptcy(room, 'p2', ctx.reg, ctx.sm);
    expect(res2.gameOver).toBe(true);
    expect(room.pendingInsolvencyQueue).toBeUndefined();
  });

  it('[TC-327.08/MSS][UC-GHOST/MSS] Given multi-debtor queue with solvent or bankrupt ghost debtors, When restorePostInsolvencyPhase executes, Then skips ghost debtors until valid debtor or deletes pendingInsolvencyQueue when empty', () => {
    const p0 = createTestPlayer('p0', 100);
    const ghost_solvent = createTestPlayer('ghost_solvent', 500);
    const ghost_bankrupt = createTestPlayer('ghost_bankrupt', -500);
    ghost_bankrupt.bankrupt = true;
    const p_real = createTestPlayer('p_real', -400);
    const room = createTestRoom([p0, ghost_solvent, ghost_bankrupt, p_real], 0);
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = 'p0';
    room.pendingInsolvencyQueue = ['p0', 'ghost_solvent', 'ghost_bankrupt', 'p_real'];

    restorePostInsolvencyPhase(room, 'p0');

    expect(room.pendingInsolvencyDebtorId).toBe('p_real');
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);

    p_real.balance = 200;
    restorePostInsolvencyPhase(room, 'p_real');

    expect(room.pendingInsolvencyQueue).toBeUndefined();
  });
});
