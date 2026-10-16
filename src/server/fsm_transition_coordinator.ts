// [IMP-423] Server FSM Transition Coordinator Seam
import { TurnPhase, type Room, type Player, isRoomGameOver } from '../domain/room.js';
import { decayModifiers } from '../domain/event_card_engine.js';
import { evaluateMacroCycle } from '../domain/macro_cycle_engine.js';
import { processTreasuryStimulus, ENABLE_TREASURY_STIMULUS } from '../domain/treasury_stimulus.js';

// --- Round Boundary Transition ---
export function advanceRoundBoundary(room: Room, rng: () => number = Math.random): void {
  room.roundCount = (room.roundCount ?? 1) + 1;
  room.activeModifiers = decayModifiers(room.activeModifiers ?? []);
  evaluateMacroCycle(room, rng);
  if (ENABLE_TREASURY_STIMULUS) {
    processTreasuryStimulus(room);
  }
}

// --- Check Insolvency & Transition to InsolvencyPhase ---
export function checkInsolvency(room: Room, creditorId?: string, debtorId?: string): void {
  const player = debtorId ? room.players.find((p) => p.id === debtorId) : room.players[room.currentPlayerIndex];
  if (!player || player.balance >= 0) return;

  room.pendingInsolvencyDebtorId = player.id;
  if (creditorId && creditorId !== player.id) {
    room.pendingInsolvencyCreditorId = creditorId;
  }
  if (room.phase !== TurnPhase.InsolvencyPhase) {
    room.preInsolvencyPhase = room.phase;
  } else if (!room.preInsolvencyPhase) {
    room.preInsolvencyPhase = TurnPhase.WaitingRoll;
  }
  room.phase = TurnPhase.InsolvencyPhase;

  console.info(JSON.stringify({
    event: 'INSOLVENCY_TRIGGERED',
    correlationId: room.roomCode,
    timestamp: Date.now(),
    delta: { playerId: player.id, balance: player.balance, creditorId: room.pendingInsolvencyCreditorId },
  }));
}

// --- Multi-Debtor Queue Management ---
export function drainPendingInsolvencyQueue(room: Room): boolean {
  if (isRoomGameOver(room)) {
    delete room.pendingInsolvencyQueue;
    delete room.pendingInsolvencyDebtorId;
    delete room.pendingInsolvencyCreditorId;
    return false;
  }
  if (room.pendingInsolvencyQueue && room.pendingInsolvencyQueue.length > 0) {
    while (room.pendingInsolvencyQueue.length > 0) {
      const nextId = room.pendingInsolvencyQueue.shift()!;
      const candidate = room.players.find((p) => p.id === nextId);
      if (candidate && candidate.balance < 0 && !candidate.bankrupt) {
        if (!room.preInsolvencyPhase) {
          room.preInsolvencyPhase = TurnPhase.PropertyManagement;
        }
        room.phase = TurnPhase.InsolvencyPhase;
        room.pendingInsolvencyDebtorId = candidate.id;
        delete room.pendingInsolvencyCreditorId;
        return true;
      }
    }
    delete room.pendingInsolvencyQueue;
  }
  return false;
}

function isAuthorizedInsolvencyActor(room: Room, playerId: string): boolean {
  if (room.phase !== TurnPhase.InsolvencyPhase) return false;
  const currentDebtor = room.pendingInsolvencyDebtorId ?? room.players[room.currentPlayerIndex]?.id;
  if (playerId === currentDebtor) return true;
  return Boolean(room.pendingInsolvencyQueue?.includes(playerId));
}

function findNextInsolventDebtor(room: Room): Player | undefined {
  while (room.pendingInsolvencyQueue?.length) {
    const nextId = room.pendingInsolvencyQueue.shift();
    const candidate = room.players.find((p) => p.id === nextId);
    if (candidate && candidate.balance < 0 && !candidate.bankrupt) return candidate;
  }
  return undefined;
}

function finalizeInsolvencyPhase(room: Room, playerId: string, rng: () => number): void {
  delete room.pendingInsolvencyDebtorId;
  delete room.pendingInsolvencyCreditorId;
  delete room.pendingInsolvencyQueue;

  if (room.players[room.currentPlayerIndex]?.bankrupt) {
    delete room.preInsolvencyPhase;
    advanceTurnAfterBankruptcy(room, rng);
    return;
  }

  const isTurnPlayer = room.players[room.currentPlayerIndex]?.id === playerId;
  room.phase = isTurnPlayer
    ? (room.preInsolvencyPhase === TurnPhase.WaitingRoll ? TurnPhase.WaitingRoll : TurnPhase.PropertyManagement)
    : (room.preInsolvencyPhase ?? TurnPhase.PropertyManagement);
  delete room.preInsolvencyPhase;
}

// --- Restore Post-Insolvency Phase ---
export function restorePostInsolvencyPhase(room: Room, playerId: string, rng: () => number = Math.random): void {
  if (isRoomGameOver(room)) {
    delete room.pendingInsolvencyDebtorId;
    delete room.pendingInsolvencyCreditorId;
    delete room.pendingInsolvencyQueue;
    room.phase = room.preInsolvencyPhase ?? TurnPhase.PropertyManagement;
    delete room.preInsolvencyPhase;
    return;
  }

  if (!isAuthorizedInsolvencyActor(room, playerId)) return;

  if (room.pendingInsolvencyQueue) {
    const qIdx = room.pendingInsolvencyQueue.indexOf(playerId);
    if (qIdx !== -1) room.pendingInsolvencyQueue.splice(qIdx, 1);

    const nextDebtor = findNextInsolventDebtor(room);
    if (nextDebtor) {
      room.pendingInsolvencyDebtorId = nextDebtor.id;
      delete room.pendingInsolvencyCreditorId;
      return;
    }
  }

  finalizeInsolvencyPhase(room, playerId, rng);
}

// --- Advance Turn To Next Player ---
export function advanceTurnToNextPlayer(room: Room, rng: () => number = Math.random): void {
  delete room.pendingInsolvencyCreditorId;
  delete room.pendingInsolvencyDebtorId;
  delete room.pendingInsolvencyQueue;
  const total = room.players.length;
  let next = (room.currentPlayerIndex + 1) % total;
  let steps = 0;
  while (steps < total) {
    if (next === 0) {
      advanceRoundBoundary(room, rng);
    }
    if (!room.players[next]?.bankrupt) break;
    next = (next + 1) % total;
    steps++;
  }
  room.currentPlayerIndex = next;

  const nextPlayer = room.players[room.currentPlayerIndex];
  if ((nextPlayer?.balance ?? 0) < 0) {
    room.phase = TurnPhase.InsolvencyPhase;
    checkInsolvency(room);
  } else if (nextPlayer?.skipNextTurn) {
    nextPlayer.skipNextTurn = false;
    room.phase = TurnPhase.PropertyManagement;
  } else {
    room.phase = TurnPhase.WaitingRoll;
  }
  room.lastEventCard = null;
}

// --- Advance Turn After Bankruptcy ---
export function advanceTurnAfterBankruptcy(room: Room, rng: () => number = Math.random): void {
  delete room.pendingInsolvencyDebtorId;
  delete room.pendingInsolvencyCreditorId;
  delete room.pendingInsolvencyQueue;
  delete room.preInsolvencyPhase;

  if (isRoomGameOver(room)) {
    return;
  }

  const total = room.players.length;
  let next    = (room.currentPlayerIndex + 1) % total;
  let steps   = 0;
  while (steps < total) {
    if (next === 0) {
      advanceRoundBoundary(room, rng);
    }
    if (!room.players[next]?.bankrupt) break;
    next = (next + 1) % total;
    steps++;
  }
  room.currentPlayerIndex = next;
  const nextPlayer = room.players[next];
  if ((nextPlayer?.balance ?? 0) < 0) {
    room.phase = TurnPhase.WaitingRoll;
    checkInsolvency(room);
  } else if (nextPlayer?.skipNextTurn) {
    nextPlayer.skipNextTurn = false;
    room.phase = TurnPhase.PropertyManagement;
  } else {
    room.phase = TurnPhase.WaitingRoll;
  }
}
