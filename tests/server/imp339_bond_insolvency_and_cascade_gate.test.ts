// [TC-339.01..12/MSS][UC-BOND][UC-CASCADE][UC-SYMMETRIC] Symmetric Bond Insolvency & Creditor Solvency Cascade Gate
// SSOT: .agents/plans/PLAN_IMP_339_SYMMETRIC_BOND_INSOLVENCY_AND_CASCADE_GATE.md
// Invariant References: docs/domain/gotchas/fsm_lifecycle.md (Gotcha #11, #12, #13, #14)

import { describe, it, expect, beforeEach } from 'vitest';
import { TurnPhase, createPlayer, createRoom, type Room, type Player } from '../../src/domain/room.js';
import type { PropertyRegistry, PropertyStateMap, PropertyState } from '../../src/domain/property_manager.js';
import { BondTrancheId } from '../../src/domain/bond_types.js';
import { handleIssueBond } from '../../src/server/bond_manager.js';
import {
  checkInsolvency,
  restorePostInsolvencyPhase,
  declareBankruptcy,
  advanceTurnAfterBankruptcy,
} from '../../src/server/insolvency_manager.js';
import { handleAuctionClose, type AuctionSession } from '../../src/server/auction_manager.js';
import { executeTurnRoll, advanceTurnToNextPlayer } from '../../src/server/turn_loop.js';

// Station 1 Domain Model Augmentation for IMP-339
declare module '../../src/domain/room.js' {
  interface Room {
    pendingInsolvencyQueue?: string[];
    preInsolvencyPhase?: TurnPhase;
  }
}

function createTestPlayer(id: string, balance: number = 1500): Player {
  const p = createPlayer(id);
  p.balance = balance;
  p.mortgagedProperties = [];
  return p;
}

function createTestRoom(players: Player[], currentIdx: number = 0): Room {
  const room = createRoom(players[0]?.id ?? 'p1', 'ROOM339');
  room.players = players;
  room.currentPlayerIndex = currentIdx;
  room.started = true;
  return room;
}

function setupEligibleBondPlayer(player: Player, reg: PropertyRegistry): void {
  // Deeds: cell 1 (600), cell 3 (600), cell 31 (3000), cell 32 (3000) -> sum 7200
  // cell 37 (3500), cell 39 (4000) -> netWorth >= 8000
  reg.set(1, player.id);
  reg.set(3, player.id);
  reg.set(31, player.id);
  reg.set(32, player.id);
  reg.set(37, player.id);
  reg.set(39, player.id);
}

describe('[IMP-339] Symmetric Bond Insolvency & Creditor Solvency Cascade Gate Contract Suite', () => {
  let reg: PropertyRegistry;
  let sm: PropertyStateMap;

  beforeEach(() => {
    reg = new Map<number, string>();
    sm = new Map<number, PropertyState>();
  });

  // =========================================================================
  // FACET 1: BOND ISSUANCE FSM SYMMETRY (TC-339.01 - TC-339.03)
  // =========================================================================
  it('[TC-339.01/MSS][UC-BOND/MSS] Given room in InsolvencyPhase with turn player p0 whose balance reaches positive after issuing bond, When handleIssueBond executes, Then delegates to restorePostInsolvencyPhase and transitions room.phase to PropertyManagement', () => {
    const p0 = createTestPlayer('p0', -500);
    const p1 = createTestPlayer('p1', 10000);
    const room = createTestRoom([p0, p1], 0);
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p0';

    setupEligibleBondPlayer(p0, reg);

    const res = handleIssueBond(room, 'p0', reg, sm, BondTrancheId.WORKING_CAPITAL);
    expect(res.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
    expect(room.preInsolvencyPhase).toBeUndefined();
    expect(room.pendingInsolvencyDebtorId).toBeUndefined();
  });

  it('[TC-339.02/A1][UC-BOND/A1] Given room in InsolvencyPhase with off-turn debtor p1 during turn of bot_2 with preInsolvencyPhase ActionPhase, When p1 issues bond restoring balance to positive, Then restorePostInsolvencyPhase restores room.phase back to ActionPhase', () => {
    const bot_2 = createTestPlayer('bot_2', 15000);
    const p1 = createTestPlayer('p1', -500);
    const room = createTestRoom([bot_2, p1], 0);
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';

    setupEligibleBondPlayer(p1, reg);

    const res = handleIssueBond(room, 'p1', reg, sm, BondTrancheId.WORKING_CAPITAL);
    expect(res.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.ActionPhase);
    expect(room.preInsolvencyPhase).toBeUndefined();
    expect(room.pendingInsolvencyDebtorId).toBeUndefined();
  });

  it('[TC-339.03/A2][UC-BOND/A2] Given multi-debtor queue [p1, p2] in InsolvencyPhase where p1 issues bond restoring solvency, When handleIssueBond completes, Then advances pendingInsolvencyDebtorId to p2 while preserving InsolvencyPhase', () => {
    const p0 = createTestPlayer('p0', 10000);
    const p1 = createTestPlayer('p1', -500);
    const p2 = createTestPlayer('p2', -800);
    const room = createTestRoom([p0, p1, p2], 0);
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p1', 'p2'];

    setupEligibleBondPlayer(p1, reg);

    const res = handleIssueBond(room, 'p1', reg, sm, BondTrancheId.WORKING_CAPITAL);
    expect(res.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    expect(room.pendingInsolvencyDebtorId).toBe('p2');
    expect(room.pendingInsolvencyQueue).toEqual([]);
  });

  // =========================================================================
  // FACET 2: TURN TRANSITION & SELF-HEALING SSOT (TC-339.04 - TC-339.05)
  // =========================================================================
  it('[TC-339.04a/MSS][UC-TURN/MSS] Given next player with negative balance at start of their turn, When turn loop advances to next player, Then checkInsolvency preserves preInsolvencyPhase as WaitingRoll', () => {
    const p0 = createTestPlayer('p0', 5000);
    const p1 = createTestPlayer('p1', -200);
    const room = createTestRoom([p0, p1], 0);

    advanceTurnToNextPlayer(room);
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    expect(room.preInsolvencyPhase).toBe(TurnPhase.WaitingRoll);
  });

  it('[TC-339.04b/A1][UC-TURN/A1] Given turn player insolvent at start of turn with preInsolvencyPhase WaitingRoll, When restoring solvency, Then room.phase restores to WaitingRoll and executeTurnRoll is permitted', () => {
    const p0 = createTestPlayer('p0', 5000);
    const p1 = createTestPlayer('p1', 500);
    const room = createTestRoom([p0, p1], 1);
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.WaitingRoll;
    room.pendingInsolvencyDebtorId = 'p1';

    restorePostInsolvencyPhase(room, 'p1');
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
    expect(room.preInsolvencyPhase).toBeUndefined();

    const rollRes = executeTurnRoll(room, p1, reg, sm, () => 0.5, () => 0.5, new Map(), room.roomCode);
    expect(rollRes).toBeDefined();
  });

  it('[TC-339.05/A2][UC-TURN/A2] Given turn player current with negative balance entering extra turn, When turn loop evaluates extra turns, Then checkInsolvency records preInsolvencyPhase WaitingRoll before entering InsolvencyPhase', () => {
    const p0 = createTestPlayer('p0', -300);
    p0.extraTurns = 1;
    const p1 = createTestPlayer('p1', 5000);
    const room = createTestRoom([p0, p1], 0);
    room.phase = TurnPhase.InsolvencyPhase; // Giả lập caller gán trước

    checkInsolvency(room);
    expect(room.preInsolvencyPhase).toBe(TurnPhase.WaitingRoll);
  });

  // =========================================================================
  // FACET 3: CREDITOR SOLVENCY CASCADE & GAME OVER TERMINAL (TC-339.06 - TC-339.08)
  // =========================================================================
  it('[TC-339.06/MSS][UC-CASCADE/MSS] Given debtor p1 declaring bankruptcy transferring assets to creditor p2 who has negative balance in multi-player match, When declareBankruptcy completes transfer, Then enqueues p2 into pendingInsolvencyQueue and preserves InsolvencyPhase', () => {
    const p0 = createTestPlayer('p0', 5000);
    const p1 = createTestPlayer('p1', -1000);
    const p2 = createTestPlayer('p2', -500);
    const room = createTestRoom([p0, p1, p2], 0);
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.ActionPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyCreditorId = 'p2';

    reg.set(1, 'p1');
    const res = declareBankruptcy(room, 'p1', reg, sm, 'p2');
    expect(res.gameOver).toBe(false);
    expect(p1.bankrupt).toBe(true);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    expect(room.pendingInsolvencyDebtorId).toBe('p2');
  });

  it('[TC-339.07/A1][UC-CASCADE/A1] Given debtor p1 declaring bankruptcy transferring assets to solvent creditor p2 whose balance remains positive, When declareBankruptcy completes transfer, Then does not enqueue p2 into pendingInsolvencyQueue', () => {
    const p1 = createTestPlayer('p1', -1000);
    const p2 = createTestPlayer('p2', 5000);
    const p3 = createTestPlayer('p3', 10000);
    const room = createTestRoom([p1, p2, p3], 0);
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyCreditorId = 'p2';

    const res = declareBankruptcy(room, 'p1', reg, sm, 'p2');
    expect(res.gameOver).toBe(false);
    expect(room.pendingInsolvencyQueue).toBeUndefined();
  });

  it('[TC-339.08/A2][UC-CASCADE/A2] Given match reaching game over where last debtor p1 declares bankruptcy to indebted creditor p2, When declareBankruptcy executes, Then does not enqueue p2 and resolves clean victory without insolvency trap', () => {
    const p1 = createTestPlayer('p1', -1000);
    const p2 = createTestPlayer('p2', -500); // Chủ nợ âm tiền nhưng là người sống sót duy nhất
    const room = createTestRoom([p1, p2], 0);
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyCreditorId = 'p2';

    const res = declareBankruptcy(room, 'p1', reg, sm, 'p2');
    expect(res.gameOver).toBe(true);
    expect(room.pendingInsolvencyDebtorId).toBeUndefined();
    expect(room.pendingInsolvencyQueue).toBeUndefined();
    expect(room.preInsolvencyPhase).toBeUndefined();
  });

  // =========================================================================
  // FACET 4: DEADLOCK & SYMMETRIC EXIT INVARIANTS (TC-339.09 - TC-339.12)
  // =========================================================================
  it('[TC-339.09/A1][UC-DEADLOCK/A1] Given multi-debtor queue [p0, p1] where turn player p0 is bankrupt and off-turn debtor p1 issues bond restoring solvency, When queue drains, Then advanceTurnAfterBankruptcy is invoked to prevent deadlock', () => {
    const p0 = createTestPlayer('p0', 0);
    p0.bankrupt = true;
    const p1 = createTestPlayer('p1', -500);
    const p2 = createTestPlayer('p2', 10000);
    const room = createTestRoom([p0, p1, p2], 0);
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p1'];

    setupEligibleBondPlayer(p1, reg);

    const res = handleIssueBond(room, 'p1', reg, sm, BondTrancheId.WORKING_CAPITAL);
    expect(res.success).toBe(true);
    // Khi queue cạn và p0 đang bankrupt, phải tự chuyển lượt sang p1 hoặc p2 sống sót
    expect(room.currentPlayerIndex).toBeGreaterThan(0);
    expect(room.players[room.currentPlayerIndex]?.bankrupt).toBeFalsy();
  });

  it('[TC-339.10/A1][UC-SYMMETRIC/A1] Given turn advancing after bankruptcy via advanceTurnAfterBankruptcy to player with negative balance, When turn transitions, Then enforces checkInsolvency and prevents illegal dice rolling', () => {
    const p0 = createTestPlayer('p0', 0);
    p0.bankrupt = true;
    const p1 = createTestPlayer('p1', -400);
    const p2 = createTestPlayer('p2', 5000);
    const room = createTestRoom([p0, p1, p2], 0);

    advanceTurnAfterBankruptcy(room);
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    expect(room.pendingInsolvencyDebtorId).toBe('p1');
  });

  it('[TC-339.11/A3][UC-CASCADE/A3] Given 2-player match where p2 is already queued in pendingInsolvencyQueue and p1 declares bankruptcy, When restorePostInsolvencyPhase runs, Then clears all transient insolvency fields and declares p2 game winner', () => {
    const p1 = createTestPlayer('p1', -1000);
    const p2 = createTestPlayer('p2', -200);
    const room = createTestRoom([p1, p2], 0);
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p2'];

    const res = declareBankruptcy(room, 'p1', reg, sm, 'p2');
    expect(res.gameOver).toBe(true);
    expect(room.pendingInsolvencyDebtorId).toBeUndefined();
    expect(room.pendingInsolvencyQueue).toBeUndefined();
  });

  it('[TC-339.12/A2][UC-SYMMETRIC/A2] Given auction settling fireSaleQueue where bankrupt turn player triggers turn advance and next player has negative balance, When settleAuction finishes, Then delegates to advanceTurnAfterBankruptcy and enters InsolvencyPhase', () => {
    const p0 = createTestPlayer('p0', 0);
    p0.bankrupt = true;
    const p1 = createTestPlayer('p1', -500);
    const p2 = createTestPlayer('p2', 5000);
    const room = createTestRoom([p0, p1, p2], 0);
    room.phase = TurnPhase.AuctionPhase;

    const auctions = new Map<string, AuctionSession>();
    const session: AuctionSession = {
      cellIndex: 5,
      declinedPlayerId: 'p0',
      highestBid: 0,
      highestBidder: undefined,
      currentBid: 0,
      endTime: Date.now() - 1000,
    };
    auctions.set(room.roomCode, session);

    handleAuctionClose(room, session, reg, auctions, room.roomCode, sm);

    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    expect(room.pendingInsolvencyDebtorId).toBe('p1');
  });

  it('[TC-339.13a/A3][UC-CASCADE/A3] Given off-turn debtor p1 with active bond declaring bankruptcy to indebted creditor p2 whose balance is negative, When declareBankruptcy executes, Then enters AuctionPhase and enqueues p2 into pendingInsolvencyQueue', () => {
    const p0 = createTestPlayer('p0', 5000);
    const p1 = createTestPlayer('p1', -1000);
    p1.bondContract = {
      principal: 2000,
      repayAmount: 2200,
      roundsLeft: 2,
      collateralCells: [1],
      isActive: true,
    };
    const p2 = createTestPlayer('p2', -500);
    const room = createTestRoom([p0, p1, p2], 0);
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.PropertyManagement;
    room.pendingInsolvencyDebtorId = 'p1';

    reg.set(1, 'p1');
    const auctions = new Map<string, AuctionSession>();

    declareBankruptcy(room, 'p1', reg, sm, 'p2', auctions, room.roomCode);

    expect(room.phase).toBe(TurnPhase.AuctionPhase);
    expect(room.pendingInsolvencyQueue).toEqual(['p2']);
  });

  it('[TC-339.13b/A3][UC-CASCADE/A3] Given collateral fire sale auction settling completely with indebted creditor queued, When handleAuctionClose completes, Then restores pending creditor into InsolvencyPhase without stealing turn', () => {
    const p0 = createTestPlayer('p0', 5000);
    const p1 = createTestPlayer('p1', -1000);
    p1.bondContract = {
      principal: 2000,
      repayAmount: 2200,
      roundsLeft: 2,
      collateralCells: [1],
      isActive: true,
    };
    const p2 = createTestPlayer('p2', -500);
    const room = createTestRoom([p0, p1, p2], 0);
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.PropertyManagement;
    room.pendingInsolvencyDebtorId = 'p1';

    reg.set(1, 'p1');
    const auctions = new Map<string, AuctionSession>();

    declareBankruptcy(room, 'p1', reg, sm, 'p2', auctions, room.roomCode);

    const session = auctions.get(room.roomCode)!;
    handleAuctionClose(room, session, reg, auctions, room.roomCode, sm);

    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    expect(room.pendingInsolvencyDebtorId).toBe('p2');
    expect(room.currentPlayerIndex).toBe(0);
  });

  it('[TC-339.13c/A4][UC-CASCADE/A4] Given 2-player match with active bond where debtor p1 bankrupts to indebted creditor p2, When fire sale auction settles, Then honors Terminal State Invariant and does not trap sole survivor in InsolvencyPhase', () => {
    const p1 = createTestPlayer('p1', -1000);
    p1.bondContract = {
      principal: 2000,
      repayAmount: 2200,
      roundsLeft: 2,
      collateralCells: [1],
      isActive: true,
    };
    const p2 = createTestPlayer('p2', -500);
    const room = createTestRoom([p1, p2], 0);
    room.phase = TurnPhase.InsolvencyPhase;
    room.preInsolvencyPhase = TurnPhase.PropertyManagement;
    room.pendingInsolvencyDebtorId = 'p1';
    room.pendingInsolvencyQueue = ['p2'];

    reg.set(1, 'p1');
    const auctions = new Map<string, AuctionSession>();

    declareBankruptcy(room, 'p1', reg, sm, 'p2', auctions, room.roomCode);

    const session = auctions.get(room.roomCode)!;
    handleAuctionClose(room, session, reg, auctions, room.roomCode, sm);

    expect(room.phase).not.toBe(TurnPhase.InsolvencyPhase);
    expect(room.pendingInsolvencyDebtorId).toBeUndefined();
    expect(room.pendingInsolvencyQueue).toBeUndefined();
  });
});

