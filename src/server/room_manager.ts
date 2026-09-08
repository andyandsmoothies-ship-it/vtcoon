// [UC-GAME-001..003,005,007,008/MSS][UC-GAME-051..057/MSS] Room Manager & FSM Turn Loop
import {
  createRoom as domainCreateRoom, createPlayer, checkPassedGo, GO_BONUS, BOARD_SIZE, TurnPhase,
} from '../domain/room';
import type { Room, Player } from '../domain/room';
import { mulberry32, rollDice } from '../domain/dice';
import type { DiceResult } from '../domain/dice';
import {
  handleLanding, LandingResult, BuyResult,
  resolveRent, calculateGoPropertyTax, type PropertyRegistry, type PropertyStateMap, type PropertyState,
} from '../domain/property_manager';
import { BOARD_CONFIG, CellType } from '../domain/board_config';
import {
  createMarketDeck, createChanceDeck, decayModifiers,
} from '../domain/event_card_engine';
import { sendToAudit, handleTurnStart, handleBailOut, handleUseDiplomatic, processRollDoubles } from './audit_manager';
import {
  handleDecline, handleAuctionBid, handleAuctionPass, handleAuctionClose, type AuctionSession,
} from './auction_manager';
import {
  handleBuyProperty, handleUpgrade, handleUpgradeETC, handleUpgradeUtility,
  handleDowngrade, executeP2PTrade,
} from './property_actions';
import { handleHoseInvest, handleHoseSkip } from './hose_actions';
import { dispatchPlayerIntent, type PlayerIntent } from './intent_dispatcher';
import { handleSpecialCell } from './special_cell_handler';
import {
  mortgageProperty, redeemProperty, collectMortgageInterest,
} from './mortgage_manager';
import { checkInsolvency, liquidateAssets, declareBankruptcy, calculateRankings } from './insolvency_manager';

export type { AuctionSession, PlayerIntent };

export interface RollResult {
  readonly dice:        DiceResult;
  readonly player:      Readonly<{ id: string; position: number; balance: number }>;
  readonly passedGo:    boolean;
  readonly rentCharged: number;
}

export class RoomManager {
  private readonly rooms = new Map<string, Room>();
  private readonly rng: () => number;
  private readonly deckRng: () => number;
  private readonly registries = new Map<string, PropertyRegistry>();
  private readonly propertyStates = new Map<string, PropertyStateMap>();
  private readonly auctions = new Map<string, AuctionSession>();
  private readonly rolledThisTurn = new Map<string, boolean>();

  constructor(seed?: number | (() => number)) {
    if (typeof seed === 'function') {
      this.rng = seed;
      this.deckRng = seed;
    } else {
      const s = seed ?? Date.now();
      this.rng = mulberry32(s);
      this.deckRng = mulberry32((s ^ 0x9e3779b9) | 0);
    }
  }

  createRoom(hostId: string): Room {
    const room = domainCreateRoom(hostId);
    room.marketDeck = createMarketDeck(this.deckRng);
    room.chanceDeck = createChanceDeck(this.deckRng);
    this.rooms.set(room.roomCode, room);
    this.registries.set(room.roomCode, new Map());
    this.propertyStates.set(room.roomCode, new Map());
    return room;
  }

  joinRoom(roomCode: string, playerId: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (!room || room.started) return undefined;
    room.players.push(createPlayer(playerId));
    return room;
  }

  startGame(roomCode: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (!room || room.players.length < 2) return undefined;
    room.started = true;
    room.currentPlayerIndex = 0;
    const first = room.players[0];
    room.phase = first?.skipNextTurn ? TurnPhase.PropertyManagement : TurnPhase.WaitingRoll;
    if (first?.skipNextTurn) first.skipNextTurn = false;
    return room;
  }

  private getActivePlayer(room: Room | undefined, playerId: string): Player | undefined {
    if (!room?.started) return undefined;
    const current = room.players[room.currentPlayerIndex];
    return current?.id === playerId ? current : undefined;
  }

  sendToAudit(room: Room, playerId: string): void { sendToAudit(room, playerId); }
  handleTurnStart(roomCode: string, playerId: string): { canRoll: boolean; reason?: string } {
    return handleTurnStart(this.rooms.get(roomCode), playerId);
  }
  handleBailOut(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    return handleBailOut(this.rooms.get(roomCode), playerId, Boolean(this.rolledThisTurn.get(roomCode)));
  }
  handleUseDiplomatic(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    const player = room?.players.find((p) => p.id === playerId);
    return (!room || !player) ? { success: false, reason: 'INVALID_PLAYER' } : handleUseDiplomatic(player, room.chanceDiscard);
  }

  handleRollDice(roomCode: string, playerId: string): RollResult | undefined {
    const room = this.rooms.get(roomCode);
    const current = this.getActivePlayer(room, playerId);
    if (!current || !room) return undefined;
    if (current.skipNextTurn) return undefined;

    const canRoll = room.phase === TurnPhase.WaitingRoll ||
      (current.consecutiveDoubles > 0 && room.phase === TurnPhase.PropertyManagement);
    if (!canRoll) return undefined;

    let dice = rollDice(this.rng);
    if (current.doubleNextDice) {
      current.doubleNextDice = false;
      dice = { ...dice, total: (dice.die1 + dice.die2) * 2 };
    }
    this.rolledThisTurn.set(roomCode, true);

    const rollCheck = processRollDoubles(room, current, dice);
    if (rollCheck.stopped) return rollCheck.result;

    const oldPos = current.position;
    const newPos = (oldPos + dice.total) % BOARD_SIZE;
    current.position = newPos;

    const reg = this.registries.get(roomCode) ?? new Map();
    const sm = this.propertyStates.get(roomCode) ?? new Map();
    if (checkPassedGo(oldPos, newPos)) {
      current.balance += GO_BONUS - calculateGoPropertyTax(current.id, reg, sm);
      // UC-052: Thu lãi thế chấp khi vượt GO
      collectMortgageInterest(room, current.id);
    }

    const cell = BOARD_CONFIG[newPos];
    let rentCharged = 0;

    if (!cell || !handleSpecialCell(room, current, cell.type, reg, sm, this.deckRng)) {
      const landing = handleLanding(
        current, newPos, reg, room.players, sm, dice.total,
        room.activeModifiers, this.rng, room.chanceDiscard, room.permanentRentBonus,
      );
      room.phase = landing.result === LandingResult.Unowned ? TurnPhase.ActionPhase : TurnPhase.PropertyManagement;
      rentCharged = landing.rentAmount;
    }

    // UC-053: Kiem tra mat kha nang thanh toan neu so du am sau khi thu thue / lai / phi
    if (current.balance < 0) checkInsolvency(room);

    return { dice, player: { id: current.id, position: current.position, balance: current.balance }, passedGo: checkPassedGo(oldPos, newPos), rentCharged };
  }


  handleBuyProperty(roomCode: string, playerId: string): { result: BuyResult } | undefined {
    return handleBuyProperty(this.rooms.get(roomCode), this.getActivePlayer(this.rooms.get(roomCode), playerId), this.registries.get(roomCode));
  }

  handleDecline(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    return handleDecline(this.rooms.get(roomCode), this.getActivePlayer(this.rooms.get(roomCode), playerId), this.auctions, roomCode);
  }

  handleAuctionBid(roomCode: string, playerId: string, amount: number): { success: boolean; reason?: string } {
    return handleAuctionBid(this.rooms.get(roomCode), this.auctions.get(roomCode), playerId, amount, this.registries.get(roomCode), this.auctions, roomCode);
  }

  handleAuctionPass(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    return handleAuctionPass(this.rooms.get(roomCode), this.auctions.get(roomCode), playerId, this.registries.get(roomCode), this.auctions, roomCode);
  }

  handleAuctionClose(roomCode: string): { winnerId?: string; winningBid: number } {
    return handleAuctionClose(this.rooms.get(roomCode), this.auctions.get(roomCode), this.registries.get(roomCode), this.auctions, roomCode);
  }

  handleUpgradeETC(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    return handleUpgradeETC(this.getActivePlayer(room, playerId), room?.phase, this.registries.get(roomCode), this.propertyStates.get(roomCode));
  }

  handleUpgradeUtility(roomCode: string, playerId: string, cellIndex: number): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    return handleUpgradeUtility(this.getActivePlayer(room, playerId), room?.phase, cellIndex, this.registries.get(roomCode), this.propertyStates.get(roomCode));
  }

  handleUpgrade(roomCode: string, playerId: string, cellIndex: number): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    return handleUpgrade(this.getActivePlayer(room, playerId), room?.phase, cellIndex, this.registries.get(roomCode), this.propertyStates.get(roomCode), room?.activeModifiers);
  }

  handleHoseInvest(roomCode: string, playerId: string, stake: number): { success: boolean; reason?: string } {
    return handleHoseInvest(this.rooms.get(roomCode), this.getActivePlayer(this.rooms.get(roomCode), playerId), this.rng, stake);
  }

  handleHoseSkip(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    return handleHoseSkip(this.rooms.get(roomCode), this.getActivePlayer(this.rooms.get(roomCode), playerId));
  }

  handlePlayerIntent(roomCode: string, playerId: string, intent: PlayerIntent): { success: boolean; reason?: string } {
    return dispatchPlayerIntent(this, roomCode, playerId, intent);
  }

  // --- S05 Handlers ---

  handleMortgage(roomCode: string, playerId: string, cellIndex: number): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    const reg  = this.registries.get(roomCode);
    const sm   = this.propertyStates.get(roomCode);
    if (!room || !reg || !sm) return { success: false, reason: 'INVALID_ROOM' };
    const res = mortgageProperty(room, playerId, cellIndex, reg, sm);
    if (res.success && room.phase === TurnPhase.InsolvencyPhase) {
      const p = room.players.find((pl) => pl.id === playerId);
      if (p && p.balance >= 0) room.phase = TurnPhase.PropertyManagement;
    }
    return res;
  }

  handleRedeem(roomCode: string, playerId: string, cellIndex: number): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    const reg  = this.registries.get(roomCode);
    if (!room || !reg) return { success: false, reason: 'INVALID_ROOM' };
    return redeemProperty(room, playerId, cellIndex, reg);
  }

  handleDowngrade(roomCode: string, playerId: string, cellIndex: number): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode), reg = this.registries.get(roomCode), sm = this.propertyStates.get(roomCode);
    if (!room || !reg || !sm) return { success: false, reason: 'INVALID_ROOM' };
    const player = this.getActivePlayer(room, playerId);
    const res = handleDowngrade(player, room.phase, cellIndex, reg, sm, roomCode);
    if (res.success && room.phase === TurnPhase.InsolvencyPhase && player && player.balance >= 0) {
      room.phase = TurnPhase.PropertyManagement;
    }
    return res;
  }

  handleLiquidate(roomCode: string, playerId: string): { success: boolean } {
    const room = this.rooms.get(roomCode), reg = this.registries.get(roomCode), sm = this.propertyStates.get(roomCode);
    if (!room || !reg || !sm) return { success: false };
    liquidateAssets(room, playerId, reg, sm);
    return { success: true };
  }

  handleTradeOffer(
    roomCode: string, requesterId: string, sellerId: string, buyerId: string, cellIndex: number, price: number,
  ): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    const reg  = this.registries.get(roomCode);
    const sm   = this.propertyStates.get(roomCode);
    if (!room || !reg || !sm) return { success: false, reason: 'INVALID_ROOM' };
    if (requesterId !== sellerId && requesterId !== buyerId) return { success: false, reason: 'UNAUTHORIZED' };
    return executeP2PTrade(room, sellerId, buyerId, cellIndex, price, reg, sm);
  }

  handleBankruptcy(roomCode: string, playerId: string): { gameOver: boolean; rankings?: Array<{ id: string; netWorth: number }> } {
    const room = this.rooms.get(roomCode);
    const reg  = this.registries.get(roomCode);
    const sm   = this.propertyStates.get(roomCode);
    if (!room || !reg || !sm) return { gameOver: false };
    const isCurrent = room.players[room.currentPlayerIndex]?.id === playerId;
    const res = declareBankruptcy(room, playerId, reg, sm);
    if (isCurrent) this.rolledThisTurn.set(roomCode, false);
    return res;
  }

  handleEndTurn(roomCode: string, playerId: string, continueDoubles?: boolean): Room | undefined {
    const room = this.rooms.get(roomCode);
    const current = this.getActivePlayer(room, playerId);
    if (!current || !room) return undefined;
    if (room.phase === TurnPhase.AuctionPhase || room.phase === TurnPhase.InsolvencyPhase) return undefined;
    if (!this.rolledThisTurn.get(roomCode) && room.phase === TurnPhase.WaitingRoll) return undefined;

    if (continueDoubles && current.consecutiveDoubles > 0) {
      room.phase = TurnPhase.WaitingRoll;
      this.rolledThisTurn.set(roomCode, false);
      return room;
    }

    current.consecutiveDoubles = 0;
    if (current.auditTurnsLeft > 0) current.auditTurnsLeft -= 1;
    if (current.extraTurns > 0) {
      current.extraTurns -= 1;
      room.phase = TurnPhase.WaitingRoll;
      this.rolledThisTurn.set(roomCode, false);
      return room;
    }
    const total = room.players.length;
    let next = (room.currentPlayerIndex + 1) % total;
    let steps = 0;
    while (steps < total) {
      if (next === 0) room.activeModifiers = decayModifiers(room.activeModifiers);
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
    this.rolledThisTurn.set(roomCode, false);
    return room;
  }

  getRoom(roomCode: string): Room | undefined { return this.rooms.get(roomCode); }
  getPropertyOwner(roomCode: string, cellIndex: number): string | undefined { return this.registries.get(roomCode)?.get(cellIndex); }
  getPropertyState(roomCode: string, cellIndex: number): PropertyState | undefined { return this.propertyStates.get(roomCode)?.get(cellIndex); }
  getPropertyRent(roomCode: string, cellIndex: number, diceTotal?: number): number {
    const reg = this.registries.get(roomCode);
    const ownerId = reg?.get(cellIndex);
    if (!reg || !ownerId) return 0;
    return resolveRent(BOARD_CONFIG[cellIndex], cellIndex, ownerId, reg, this.propertyStates.get(roomCode), diceTotal);
  }

  getRankings(roomCode: string): Array<{ id: string; netWorth: number }> {
    const room = this.rooms.get(roomCode);
    const reg  = this.registries.get(roomCode);
    const sm   = this.propertyStates.get(roomCode);
    if (!room || !reg || !sm) return [];
    return calculateRankings(room, reg, sm);
  }
}
