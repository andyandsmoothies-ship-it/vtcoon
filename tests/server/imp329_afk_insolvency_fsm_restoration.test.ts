// [TC-329.01..08/MSS][UC-AFK][UC-FSM] Harmonize AFK Insolvency Recovery with Symmetric FSM Phase Restoration
// SSOT: .agents/plans/PLAN_IMP_329_AFK_INSOLVENCY_FSM_HARMONIZATION.md
// Invariant References: docs/domain/gotchas/fsm_lifecycle.md (Gotcha #11, #12, #13)

import { describe, it, expect } from 'vitest';
import { TurnPhase } from '../../src/domain/room.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { executeInsolvencyAfkRecovery } from '../../src/server/network/afk_recovery.js';

declare module '../../src/domain/room.js' {
  interface Room {
    pendingInsolvencyQueue?: string[];
    preInsolvencyPhase?: TurnPhase;
  }
}

function setupTestRoom(playerCount: number = 3): { mgr: RoomManager; roomCode: string } {
  const mgr = new RoomManager(42);
  const room = mgr.createRoom('p0', 'ROOM_329');
  for (let i = 1; i < playerCount; i++) {
    mgr.joinRoom(room.roomCode, `p${i}`);
  }
  mgr.startGame(room.roomCode);
  return { mgr, roomCode: room.roomCode };
}

describe('[IMP-329] AFK Insolvency FSM Phase Restoration Contract Suite', () => {
  it('[TC-329.01/MSS][UC-AFK/MSS] Given room in InsolvencyPhase where off-turn player has balance >= 0, When executeInsolvencyAfkRecovery is invoked, Then calls restorePostInsolvencyPhase restoring preInsolvencyPhase and returns rescued: true', () => {
    const { mgr, roomCode } = setupTestRoom(3);
    const room = mgr.getRoom(roomCode)!;
    const p1 = room.players.find((p) => p.id === 'p1')!;

    room.currentPlayerIndex = 0; // Turn player is p0
    p1.balance = 500;
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';

    const result = executeInsolvencyAfkRecovery(mgr, roomCode, 'p1');

    expect(result.rescued).toBe(true);
    expect(result.bankrupt).toBe(false);
    expect(room.phase).toBe(TurnPhase.ActionPhase);
  });

  it('[TC-329.02/A1][UC-AFK/A1] Given room in InsolvencyPhase with multi-debtor queue [p1, p2], When p1 is rescued via AFK downgrades, Then advances to next debtor p2 and preserves InsolvencyPhase', () => {
    const { mgr, roomCode } = setupTestRoom(3);
    const room = mgr.getRoom(roomCode)!;
    const reg = mgr.getRegistry(roomCode)!;
    const sm = mgr.getPropertyStates(roomCode)!;
    const p1 = room.players.find((p) => p.id === 'p1')!;
    const p2 = room.players.find((p) => p.id === 'p2')!;

    room.currentPlayerIndex = 0;
    reg.set(16, 'p1');
    sm.set(16, { level: 1 });
    p1.balance = -300;
    p2.balance = -200;

    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p1', 'p2'];

    const result = executeInsolvencyAfkRecovery(mgr, roomCode, 'p1');

    expect(result.rescued).toBe(true);
    expect(p1.balance).toBeGreaterThanOrEqual(0);
    expect(room.pendingInsolvencyDebtorId).toBe('p2');
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
  });

  it('[TC-329.03/A2][UC-AFK/A2] Given room in InsolvencyPhase with multi-debtor queue [p1, p2], When p1 is rescued via AFK mortgages, Then advances to next debtor p2 and preserves InsolvencyPhase', () => {
    const { mgr, roomCode } = setupTestRoom(3);
    const room = mgr.getRoom(roomCode)!;
    const reg = mgr.getRegistry(roomCode)!;
    const p1 = room.players.find((p) => p.id === 'p1')!;
    const p2 = room.players.find((p) => p.id === 'p2')!;

    room.currentPlayerIndex = 0;
    reg.set(1, 'p1'); // Cell 1: price 600, loan 300
    p1.balance = -200;
    p2.balance = -300;

    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p1', 'p2'];

    const result = executeInsolvencyAfkRecovery(mgr, roomCode, 'p1');

    expect(result.rescued).toBe(true);
    expect(p1.balance).toBe(100);
    expect(room.pendingInsolvencyDebtorId).toBe('p2');
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
  });

  it('[TC-329.04/A3][UC-AFK/A3] Given multi-debtor queue [p0, p1] where turn player p0 is bankrupt and off-turn debtor p1 is rescued via AFK, When queue drains, Then advanceTurnAfterBankruptcy is invoked to prevent deadlock', () => {
    const { mgr, roomCode } = setupTestRoom(3);
    const room = mgr.getRoom(roomCode)!;
    const reg = mgr.getRegistry(roomCode)!;
    const p0 = room.players.find((p) => p.id === 'p0')!;
    const p1 = room.players.find((p) => p.id === 'p1')!;

    room.currentPlayerIndex = 0;
    p0.bankrupt = true;

    reg.set(1, 'p1'); // Cell 1: price 600, loan 300
    p1.balance = -200;

    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p1'];

    const result = executeInsolvencyAfkRecovery(mgr, roomCode, 'p1');

    expect(result.rescued).toBe(true);
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
    expect(room.pendingInsolvencyQueue).toBeUndefined();
  });

  it('[TC-329.05/A4][UC-AFK/A4] Given multi-debtor queue with debtor p1 owing Alice and debtor p2 in debt to Bank, When p1 is rescued via AFK, Then room.pendingInsolvencyCreditorId is cleared to prevent creditor poisoning of p2', () => {
    const { mgr, roomCode } = setupTestRoom(3);
    const room = mgr.getRoom(roomCode)!;
    const p1 = room.players.find((p) => p.id === 'p1')!;
    const p2 = room.players.find((p) => p.id === 'p2')!;

    room.currentPlayerIndex = 0;
    p1.balance = 100;
    p2.balance = -300;

    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyCreditorId = 'p0';
    room.pendingInsolvencyQueue = ['p1', 'p2'];

    const result = executeInsolvencyAfkRecovery(mgr, roomCode, 'p1');

    expect(result.rescued).toBe(true);
    expect(room.pendingInsolvencyDebtorId).toBe('p2');
    expect(room.pendingInsolvencyCreditorId).toBeUndefined();
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
  });

  it('[TC-329.06/A5][UC-AFK/A5] Given single debtor p1 rescued via AFK, When queue drains, Then all transient fields are cleanly deleted', () => {
    const { mgr, roomCode } = setupTestRoom(3);
    const room = mgr.getRoom(roomCode)!;
    const p1 = room.players.find((p) => p.id === 'p1')!;

    room.currentPlayerIndex = 0;
    p1.balance = 500; // Solvent off-turn debtor

    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyCreditorId = 'p0';
    room.pendingInsolvencyQueue = ['p1'];

    const result = executeInsolvencyAfkRecovery(mgr, roomCode, 'p1');

    expect(result.rescued).toBe(true);
    expect(room.pendingInsolvencyQueue).toBeUndefined();
    expect(room.pendingInsolvencyDebtorId).toBeUndefined();
    expect(room.pendingInsolvencyCreditorId).toBeUndefined();
  });

  it('[TC-329.07/A6][UC-AFK/A6] Given multi-debtor queue with off-turn debtor converted to isBot: true following disconnect takeover, When AFK recovery runs for that debtor, Then resolves solvency and advances to next debtor deterministically', () => {
    const { mgr, roomCode } = setupTestRoom(3);
    const room = mgr.getRoom(roomCode)!;
    const reg = mgr.getRegistry(roomCode)!;
    const p1 = room.players.find((p) => p.id === 'p1')!;
    const p2 = room.players.find((p) => p.id === 'p2')!;

    room.currentPlayerIndex = 0;
    p1.isBot = true; // Off-turn player converted to bot after disconnect
    reg.set(1, 'p1'); // Cell 1: price 600, loan 300
    p1.balance = -200;
    p2.balance = -300;

    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p1', 'p2'];

    const result = executeInsolvencyAfkRecovery(mgr, roomCode, 'p1');

    expect(result.rescued).toBe(true);
    expect(p1.isBot).toBe(true);
    expect(room.pendingInsolvencyDebtorId).toBe('p2');
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
  });

  it('[TC-329.08/A7][UC-AFK/A7] Given room in InsolvencyPhase where unauthorized player p2 is passed to executeInsolvencyAfkRecovery, When executeInsolvencyAfkRecovery is invoked, Then returns rescued: false without mutating room state', () => {
    const { mgr, roomCode } = setupTestRoom(3);
    const room = mgr.getRoom(roomCode)!;
    const p2 = room.players.find((p) => p.id === 'p2')!;

    room.currentPlayerIndex = 0;
    p2.balance = 500; // Solvent, but not the authorized debtor!

    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p1'];

    const result = executeInsolvencyAfkRecovery(mgr, roomCode, 'p2');

    expect(result.rescued).toBe(false);
    expect(result.bankrupt).toBe(false);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    expect(room.pendingInsolvencyDebtorId).toBe('p1');
  });
});
