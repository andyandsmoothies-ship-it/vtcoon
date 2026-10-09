// [UC-GAME-001/MSS] Turn Loop — Pure Functions extracted from RoomManager
// Extracted from room_manager.ts — Slice 06 refactor (DEBT-S06-06)

import type { Room, Player } from '../domain/room';
import { checkPassedGo, calculateGoSalary, BOARD_SIZE, TurnPhase } from '../domain/room';
import { rollDice } from '../domain/dice';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager';
import { handleLanding, LandingResult, calculateGoPropertyTax, GO_PROPERTY_TAX_CAP } from '../domain/property_manager';
import { BOARD_CONFIG } from '../domain/board_config';
import { decayModifiers } from '../domain/event_card_engine';
import { processTreasuryStimulus } from '../domain/treasury_stimulus';
import { evaluateMacroCycle } from '../domain/macro_cycle_engine';
import {
  processRollDoubles,
  handleAuditTurnTransition,
  setTurnStartedInAudit,
  getTurnStartedInAudit,
  hasTurnStartedInAudit,
  deleteTurnStartedInAudit,
} from './audit_manager';
import { handleSpecialCell } from './special_cell_handler';
import { collectMortgageInterest } from './mortgage_manager';
import { checkInsolvency, liquidateAssets, declareBankruptcy } from './insolvency_manager';
import type { RollResult } from './room_manager';
import type { AuctionSession } from './auction_manager';
import { processBondTurnTransition } from './bond_manager';
import {
  isTradeFrozen,
  processPendingDebts,
  processGoElectricBilling,
  processUnbuiltRounds,
} from './turn_loop_maintenance.js';

export {
  isTradeFrozen,
  processPendingDebts,
  processGoElectricBilling,
  processUnbuiltRounds,
};

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
  room.lastEventCard = null;
  room.lastDiplomaticEvent = null;
  room.lastMaBuyout = undefined;
  room.passedGoSalary = undefined;
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
  room.lastDiceRollerId = current.id;
  room.diceSeq = (room.diceSeq ?? 0) + 1;
  setTurnStartedInAudit(roomCode, inAuditBeforeRoll);

  const rollCheck = processRollDoubles(room, current, dice);
  if (rollCheck.stopped) return rollCheck.result;

  const oldPos = current.position;
  const newPos = (oldPos + dice.total) % BOARD_SIZE;
  current.position = newPos;

  const passed = checkPassedGo(oldPos, newPos);
  let passedGoSalary = 0;
  if (passed) {
    processPendingDebts(room, current);   // [DEBT-S06-01][DEBT-S06-02] TRƯỚC GO_BONUS
    const rawGoTax = calculateGoPropertyTax(current.id, reg, sm);
    const goTax = Math.min(rawGoTax, GO_PROPERTY_TAX_CAP);
    const salary = calculateGoSalary(room.roundCount ?? 1);
    passedGoSalary = salary;
    current.balance += salary - goTax;
    if (goTax > 0) {
      room.treasury = (room.treasury ?? 0) + goTax;
    }
    // UC-052: Thu lãi thế chấp khi vượt GO
    collectMortgageInterest(room, current.id);
    // IMP-214: Thu hóa đơn tiền điện EVN
    processGoElectricBilling(room, current, reg, sm);
  }
  room.passedGoSalary = passed ? passedGoSalary : undefined;

  const cell = BOARD_CONFIG[newPos];
  let rentCharged = 0;

  if (!cell || !handleSpecialCell(room, current, cell.type, reg, sm, deckRng)) {
    const landing = handleLanding(
      current, newPos, reg, room.players, sm, dice.total,
      room.activeModifiers, rng, room.chanceDiscard, room.permanentRentBonus,
      room.roundCount,
      room,
    );
    if (landing.diplomaticCardUsed) {
      room.lastDiplomaticEvent = {
        playerId: current.id,
        landlordId: landing.landlordId ?? '',
        cellIndex: newPos,
        savedRent: landing.savedRentAmount ?? 0,
      };
    }
    const canEnterActionPhase = landing.result === LandingResult.Unowned && !isTradeFrozen(room);
    room.phase = canEnterActionPhase ? TurnPhase.ActionPhase : TurnPhase.PropertyManagement;
    rentCharged = landing.rentAmount;
    if ([5, 15, 25, 35].includes(newPos) && !current.hasSpunTransitThisTurn && !canEnterActionPhase && current.balance >= 0) {
      room.pendingTransitWheel = { playerId: current.id, cellIndex: newPos, timestamp: Date.now() };
    }
  }

  // UC-053 & IMP-285: Tự động xử lý tức thì cho bot ngoài lượt (ADV-02 Option A), xếp hàng cho người thật
  if (reg && sm) {
    const outOfTurnBots = room.players.filter((p) => p.balance < 0 && !p.bankrupt && p.isBot && p.id !== current.id);
    for (const bot of outOfTurnBots) {
      liquidateAssets(room, bot.id, reg, sm);
      if (bot.balance < 0) {
        declareBankruptcy(room, bot.id, reg, sm);
      }
    }
  }

  // Quét toàn bộ con nợ âm tiền sau khi tiếp đất / sự kiện / thuế
  const insolventPlayers = room.players.filter((p) => p.balance < 0 && !p.bankrupt);
  if (insolventPlayers.length > 0) {
    room.pendingInsolvencyQueue = insolventPlayers.map((p) => p.id);
    const firstDebtor = insolventPlayers[0]!;
    const landlordId = firstDebtor.id === current.id && reg ? reg.get(newPos) : undefined;
    checkInsolvency(room, landlordId, firstDebtor.id);
  }

  return {
    dice,
    player: { id: current.id, position: current.position, balance: current.balance },
    passedGo: passed,
    passedGoSalary,
    rentCharged,
  };
}

export function advanceRoundBoundary(room: Room, rng: () => number = Math.random): void {
  room.roundCount = (room.roundCount ?? 1) + 1;
  room.activeModifiers = decayModifiers(room.activeModifiers ?? []);
  evaluateMacroCycle(room, rng);
  processTreasuryStimulus(room);
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
  rng: () => number = Math.random,
): Room | undefined {
  // UC-053 & IMP-285: Tự động giải quyết tức thì cho bot ngoài lượt nếu có nợ treo (ADV-02 Option A)
  if (registry && stateMap) {
    const outOfTurnBots = room.players.filter((p) => p.balance < 0 && !p.bankrupt && p.isBot && p.id !== current.id);
    for (const bot of outOfTurnBots) {
      liquidateAssets(room, bot.id, registry, stateMap);
      if (bot.balance < 0) {
        declareBankruptcy(room, bot.id, registry, stateMap);
      }
    }
  }

  if (room.phase === TurnPhase.AuctionPhase || room.phase === TurnPhase.InsolvencyPhase || room.pendingBuyout) return undefined;
  const insolventDebtor = room.players.find((p) => p.balance < 0 && !p.bankrupt);
  if (insolventDebtor) {
    checkInsolvency(room, undefined, insolventDebtor.id);
    return undefined;
  }
  if (!rolledThisTurn && room.phase === TurnPhase.WaitingRoll && (current.auditTurnsLeft ?? 0) <= 0) return undefined;

  room.lastDiplomaticEvent = null;
  room.lastMaBuyout = undefined;
  room.pendingTransitWheel = null;
  room.lastTransitResult = null;
  current.hasSpunTransitThisTurn = false;
  if (continueDoubles && current.consecutiveDoubles > 0 && !current.skipNextTurn) {
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
  const wasInAudit = hasTurnStartedInAudit(roomCode)
    ? getTurnStartedInAudit(roomCode)!
    : current.auditTurnsLeft > 0;
  deleteTurnStartedInAudit(roomCode);
  if (wasInAudit) {
    handleAuditTurnTransition(room, current, registry, stateMap);
    if (current.balance < 0) {
      checkInsolvency(room);
      rolledThisTurnMap.set(roomCode, true);
      return room;
    }
  }
  if (current.extraTurns > 0) {
    current.extraTurns -= 1;
    if (current.skipNextTurn) current.skipNextTurn = false;
    if ((current.balance ?? 0) < 0) {
      room.phase = TurnPhase.InsolvencyPhase;
      checkInsolvency(room);
    } else {
      room.phase = TurnPhase.WaitingRoll;
    }
    rolledThisTurnMap.set(roomCode, false);
    room.lastEventCard = null;
    return room;
  }
  if (current.bondContract?.isActive && registry && stateMap) {
    processBondTurnTransition(room, current, registry, stateMap, auctions, roomCode);
    if ((room.phase as string) === TurnPhase.AuctionPhase) {
      rolledThisTurnMap.set(roomCode, false);
      return room;
    }
  }
  advanceTurnToNextPlayer(room, rng);
  rolledThisTurnMap.set(roomCode, false);
  return room;
}

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

