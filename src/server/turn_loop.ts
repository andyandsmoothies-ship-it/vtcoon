// [UC-GAME-001/MSS] Turn Loop — Pure Functions extracted from RoomManager
// Extracted from room_manager.ts — Slice 06 refactor (DEBT-S06-06)

import type { Room, Player } from '../domain/room';
import { checkPassedGo, GO_BONUS, BOARD_SIZE, TurnPhase } from '../domain/room';
import { rollDice } from '../domain/dice';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager';
import { handleLanding, LandingResult, calculateGoPropertyTax, PROPERTY_DEEDS } from '../domain/property_manager';
import { BOARD_CONFIG } from '../domain/board_config';
import { decayModifiers } from '../domain/event_card_engine';
import { processRollDoubles, handleAuditTurnTransition } from './audit_manager';
import { handleSpecialCell } from './special_cell_handler';
import { collectMortgageInterest } from './mortgage_manager';
import { checkInsolvency } from './insolvency_manager';
import type { RollResult } from './room_manager';
import type { AuctionSession } from './auction_manager';
import { ChanceCardId } from '../domain/event_card_types';

const turnStartedInAudit = new Map<string, boolean>();

// [DEBT-S06-01][DEBT-S06-02] Xử lý nợ định kỳ khi player vượt GO (TRƯỚC GO_BONUS)
function processPendingDebts(room: Room, player: Player): void {
  // CC_FREE_CREDIT: trích lãi 400 vào kho bạc
  if (player.hand.includes(ChanceCardId.CC_FREE_CREDIT)) {
    player.balance -= 400;
    room.treasury = (room.treasury ?? 0) + 400;
  }

  // CC_OVERDRAFT: đếm ngược, thu hồi 3.300 khi hết hạn
  if ((player.overdraftRoundsLeft ?? 0) > 0) {
    player.overdraftRoundsLeft! -= 1;
    if (player.overdraftRoundsLeft === 0) {
      player.balance -= 3_300;
      player.pendingDebts = player.pendingDebts.filter(
        (d) => d !== ChanceCardId.CC_OVERDRAFT,
      );
      if (player.balance < 0) checkInsolvency(room);
    }
  }
}

// [DEBT-S06-03] CC_SLOW_BUILD: kiểm tra và xử lý unbuiltRounds sau mỗi lượt
function processUnbuiltRounds(
  room: Room,
  current: Player,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  auctions: Map<string, AuctionSession>,
  roomCode: string,
): void {
  for (const [cellIndex, ownerId] of registry.entries()) {
    if (ownerId !== current.id) continue;
    const state = stateMap.get(cellIndex);
    if (!state || state.level !== 0 || state.unbuiltRounds === undefined) continue;

    const nextRounds = state.unbuiltRounds + 1;
    stateMap.set(cellIndex, { ...state, unbuiltRounds: nextRounds });

    if (nextRounds > 2) {
      // Thu hồi ô đất và mở auction 50%
      registry.delete(cellIndex);
      stateMap.set(cellIndex, { ...state, unbuiltRounds: 0 });
      const deed = PROPERTY_DEEDS.get(cellIndex);
      if (deed) {
        const startingBid = Math.floor(deed.price * 0.50);
        // declinedPlayerId = '' → tất cả players (kể cả cựu chủ P1) đều đủ điều kiện
        auctions.set(roomCode, {
          cellIndex,
          declinedPlayerId: '',
          highestBid: startingBid,
          passedPlayers: new Set<string>(),
        });
        room.phase = TurnPhase.AuctionPhase;
      }
    }
  }
}

export function executeTurnRoll(
  room: Room,
  current: Player,
  reg: PropertyRegistry,
  sm: PropertyStateMap,
  rng: () => number,
  deckRng: () => number,
  rolledThisTurn: Map<string, boolean>,
  roomCode: string,
): RollResult | undefined {
  if (current.skipNextTurn) {
    current.skipNextTurn = false;
    room.phase = TurnPhase.PropertyManagement;
    return undefined;
  }

  const canRoll = room.phase === TurnPhase.WaitingRoll ||
    (current.consecutiveDoubles > 0 && room.phase === TurnPhase.PropertyManagement);
  if (!canRoll) return undefined;

  let dice = rollDice(rng);
  if (current.doubleNextDice) {
    current.doubleNextDice = false;
    dice = { ...dice, total: (dice.die1 + dice.die2) * 2 };
  }
  const inAuditBeforeRoll = current.auditTurnsLeft > 0;
  rolledThisTurn.set(roomCode, true);
  room.lastDice = [dice.die1, dice.die2];
  turnStartedInAudit.set(roomCode, inAuditBeforeRoll);

  const rollCheck = processRollDoubles(room, current, dice);
  if (rollCheck.stopped) return rollCheck.result;

  const oldPos = current.position;
  const newPos = (oldPos + dice.total) % BOARD_SIZE;
  current.position = newPos;

  if (checkPassedGo(oldPos, newPos)) {
    processPendingDebts(room, current);   // [DEBT-S06-01][DEBT-S06-02] TRƯỚC GO_BONUS
    const goTax = calculateGoPropertyTax(current.id, reg, sm);
    current.balance += GO_BONUS - goTax;
    if (goTax > 0) {
      room.treasury = (room.treasury ?? 0) + goTax;
    }
    // UC-052: Thu lãi thế chấp khi vượt GO
    collectMortgageInterest(room, current.id);
  }

  const cell = BOARD_CONFIG[newPos];
  let rentCharged = 0;

  if (!cell || !handleSpecialCell(room, current, cell.type, reg, sm, deckRng)) {
    const landing = handleLanding(
      current, newPos, reg, room.players, sm, dice.total,
      room.activeModifiers, rng, room.chanceDiscard, room.permanentRentBonus,
    );
    room.phase = landing.result === LandingResult.Unowned ? TurnPhase.ActionPhase : TurnPhase.PropertyManagement;
    rentCharged = landing.rentAmount;
  }

  // UC-053: Kiem tra mat kha nang thanh toan neu so du am sau khi thu thue / lai / phi
  if (current.balance < 0) checkInsolvency(room);

  return {
    dice,
    player: { id: current.id, position: current.position, balance: current.balance },
    passedGo: checkPassedGo(oldPos, newPos),
    rentCharged,
  };
}

export function executeTurnEnd(
  room: Room,
  current: Player,
  rolledThisTurn: boolean,
  continueDoubles: boolean,
  roomCode: string,
  rolledThisTurnMap: Map<string, boolean>,
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
  auctions?: Map<string, AuctionSession>,
): Room | undefined {
  if (room.phase === TurnPhase.AuctionPhase || room.phase === TurnPhase.InsolvencyPhase) return undefined;
  if (!rolledThisTurn && room.phase === TurnPhase.WaitingRoll) return undefined;

  if (continueDoubles && current.consecutiveDoubles > 0 && !current.skipNextTurn) {
    if (current.extraTurns > 0) current.extraTurns -= 1;
    room.phase = TurnPhase.WaitingRoll;
    rolledThisTurnMap.set(roomCode, false);
    return room;
  }


  // [DEBT-S06-03] Kiểm tra unbuiltRounds TRƯỚC khi chuyển lượt
  if (registry && stateMap && auctions) {
    processUnbuiltRounds(room, current, registry, stateMap, auctions, roomCode);
    // Nếu auction được mở, dừng ngay (không chuyển lượt)
    // Cast needed: TS flow narrows room.phase to non-AuctionPhase above, but processUnbuiltRounds may mutate it
    if ((room.phase as string) === TurnPhase.AuctionPhase) {
      rolledThisTurnMap.set(roomCode, false);
      return room;
    }
  }

  current.consecutiveDoubles = 0;
  const wasInAudit = turnStartedInAudit.has(roomCode)
    ? turnStartedInAudit.get(roomCode)!
    : current.auditTurnsLeft > 0;
  turnStartedInAudit.delete(roomCode);
  if (wasInAudit) {
    handleAuditTurnTransition(room, current);
    if (current.balance < 0) {
      checkInsolvency(room);
      rolledThisTurnMap.set(roomCode, true);
      return room;
    }
  }
  if (current.extraTurns > 0) {
    current.extraTurns -= 1;
    if (current.skipNextTurn) {
      current.skipNextTurn = false;
      room.phase = TurnPhase.PropertyManagement;
    } else {
      room.phase = TurnPhase.WaitingRoll;
    }
    rolledThisTurnMap.set(roomCode, false);
    return room;
  }
  const total = room.players.length;
  let next = (room.currentPlayerIndex + 1) % total;
  let steps = 0;
  while (steps < total) {
    if (next === 0) {
      room.roundCount = (room.roundCount ?? 1) + 1;
      room.activeModifiers = decayModifiers(room.activeModifiers);
    }
    if (!room.players[next]?.bankrupt) break;
    next = (next + 1) % total;
    steps++;
  }
  room.currentPlayerIndex = next;

  const nextPlayer = room.players[room.currentPlayerIndex];
  if (nextPlayer?.skipNextTurn) {
    nextPlayer.skipNextTurn = false;
    room.phase = TurnPhase.PropertyManagement;
  } else {
    room.phase = TurnPhase.WaitingRoll;
  }
  rolledThisTurnMap.set(roomCode, false);
  return room;
}

