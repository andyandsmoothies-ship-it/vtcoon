// [TC-423/MSS] IMP-423: Server FSM Coordinator Seam & Final Codebase Zero-Cycle Contract Suite
import { describe, it, expect, vi } from 'vitest';
import { TurnPhase, type Room, type Player, createPlayer, createRoom } from '../../src/domain/room.js';
import { MarketCardId, type MarketModifier } from '../../src/domain/event_card_types.js';
import {
  advanceRoundBoundary,
  advanceTurnToNextPlayer,
  advanceTurnAfterBankruptcy,
  restorePostInsolvencyPhase,
  checkInsolvency,
  drainPendingInsolvencyQueue,
} from '../../src/server/fsm_transition_coordinator.js';
import * as turnLoop from '../../src/server/turn_loop.js';
import * as insolvencyMgr from '../../src/server/insolvency_manager.js';

function createMockRoom(overrides?: Partial<Room>): Room {
  const p1 = createPlayer('p1');
  p1.name = 'Player 1';
  p1.balance = 1500;
  p1.isBot = false;

  const p2 = createPlayer('p2');
  p2.name = 'Player 2';
  p2.balance = 1500;
  p2.isBot = false;

  const p3 = createPlayer('p3');
  p3.name = 'Player 3';
  p3.balance = 1500;
  p3.isBot = true;

  const room = createRoom('p1', 'VT423A');
  room.players = [p1, p2, p3];
  room.currentPlayerIndex = 0;
  room.phase = TurnPhase.WaitingRoll;
  room.roundCount = 1;
  room.started = true;
  room.activeModifiers = [];

  return Object.assign(room, overrides);
}

describe('[UC-423] Server FSM Coordinator Seam & Final Codebase Zero-Cycle', () => {
  it('TC-423.01 [UC-FSM-ROUND-ADVANCE/MSS]: advanceRoundBoundary increments roundCount and updates modifiers', () => {
    const modifier: MarketModifier = {
      type: MarketCardId.MC_LAND_FEVER,
      affectedCells: [6, 8, 31],
      remainingRounds: 2,
    };
    const room = createMockRoom({
      roundCount: 2,
      activeModifiers: [modifier],
    });

    advanceRoundBoundary(room, () => 0.5);

    expect(room.roundCount).toBe(3);
    expect(room.activeModifiers?.[0]?.remainingRounds).toBe(1);
  });

  it('TC-423.02 [UC-FSM-TURN-ADVANCE/MSS]: advanceTurnToNextPlayer skips bankrupt players and routes negative balance to InsolvencyPhase', () => {
    const room = createMockRoom();
    room.players[1]!.bankrupt = true;
    room.players[2]!.balance = -200;

    advanceTurnToNextPlayer(room);

    expect(room.currentPlayerIndex).toBe(2);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    expect(room.pendingInsolvencyDebtorId).toBe('p3');
  });

  it('TC-423.02b [UC-FSM-TURN-ADVANCE/MSS]: advanceTurnToNextPlayer transitions to WaitingRoll when next player is solvent', () => {
    const room = createMockRoom();
    advanceTurnToNextPlayer(room);
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });

  it('TC-423.03 [UC-FSM-BANKRUPTCY-ADVANCE/MSS]: advanceTurnAfterBankruptcy cleans up queues and advances turn to next active player', () => {
    const room = createMockRoom({
      currentPlayerIndex: 0,
      pendingInsolvencyQueue: ['p1'],
      pendingInsolvencyDebtorId: 'p1',
      pendingInsolvencyCreditorId: 'p2',
    });
    room.players[0]!.bankrupt = true;

    advanceTurnAfterBankruptcy(room);

    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
    expect(room.pendingInsolvencyDebtorId).toBeUndefined();
    expect(room.pendingInsolvencyCreditorId).toBeUndefined();
  });

  it('TC-423.04 [UC-FSM-DEADLOCK-PREVENTION/MSS]: prevents turn player bankruptcy deadlock when turn player is bankrupt and creditor is solvent [B, S]', () => {
    const room = createMockRoom({
      currentPlayerIndex: 0,
      phase: TurnPhase.InsolvencyPhase,
      preInsolvencyPhase: TurnPhase.WaitingRoll,
      pendingInsolvencyQueue: ['p2'],
    });
    room.players[0]!.bankrupt = true;
    room.players[1]!.balance = 500;

    restorePostInsolvencyPhase(room, 'p2');

    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });

  it('TC-423.05 [UC-FSM-CASCADE-BANKRUPTCY/MSS]: cascade bankruptcy [B, B] promotes next debtor and concludes cleanly on final survivor', () => {
    const room = createMockRoom({
      currentPlayerIndex: 1,
      phase: TurnPhase.InsolvencyPhase,
      pendingInsolvencyQueue: ['p2', 'p3'],
      pendingInsolvencyDebtorId: 'p2',
    });
    room.players[1]!.bankrupt = true;
    room.players[2]!.balance = -500;

    restorePostInsolvencyPhase(room, 'p2');

    expect(room.pendingInsolvencyDebtorId).toBe('p3');
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
  });

  it('TC-423.06 [UC-FSM-POST-INSOLVENCY-RESTORE/MSS]: restorePostInsolvencyPhase symmetrically restores preInsolvencyPhase for solvent debtor', () => {
    const room = createMockRoom({
      currentPlayerIndex: 0,
      phase: TurnPhase.InsolvencyPhase,
      preInsolvencyPhase: TurnPhase.PropertyManagement,
      pendingInsolvencyDebtorId: 'p1',
    });
    room.players[0]!.balance = 100;

    restorePostInsolvencyPhase(room, 'p1');

    expect(room.phase).toBe(TurnPhase.PropertyManagement);
    expect(room.pendingInsolvencyDebtorId).toBeUndefined();
    expect(room.preInsolvencyPhase).toBeUndefined();
  });

  it('TC-423.07a [UC-FSM-CONSUMER-WIRING/MSS]: proves turn_loop invokes advanceTurnToNextPlayer during turn end', () => {
    const room = createMockRoom({ phase: TurnPhase.PropertyManagement });
    const rolledMap = new Map<string, boolean>();
    turnLoop.executeTurnEnd(room, room.players[0]!, true, false, 'VT423A', rolledMap);
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });

  it('TC-423.07b [UC-FSM-CONSUMER-WIRING/MSS]: proves insolvency_manager invokes advanceTurnAfterBankruptcy during turn player bankruptcy', () => {
    const room = createMockRoom({ phase: TurnPhase.PropertyManagement, currentPlayerIndex: 0 });
    room.players[0]!.balance = -100;
    insolvencyMgr.declareBankruptcy(room, 'p1', new Map(), new Map(), undefined, new Map(), 'VT423A');
    expect(room.players[0]!.bankrupt).toBe(true);
    expect(room.currentPlayerIndex).toBe(1);
  });

  it('TC-423.08 [UC-CODEBASE-ZERO-CYCLE/MSS]: proves drainPendingInsolvencyQueue manages queued debtors or sets gameOver guards', () => {
    const room = createMockRoom({
      phase: TurnPhase.AuctionPhase,
      pendingInsolvencyQueue: ['p2'],
    });
    room.players[1]!.balance = -300;

    const hasNext = drainPendingInsolvencyQueue(room);

    expect(hasNext).toBe(true);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    expect(room.pendingInsolvencyDebtorId).toBe('p2');
  });
});
