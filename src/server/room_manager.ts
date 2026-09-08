// [UC-GAME-001..003,005,007,008/MSS] Room Manager & FSM Turn Loop

import {
  createRoom as domainCreateRoom, createPlayer, checkPassedGo,
  GO_BONUS, BOARD_SIZE, TurnPhase,
} from '../domain/room';
import type { Room, Player } from '../domain/room';
import { mulberry32, rollDice } from '../domain/dice';
import type { DiceResult } from '../domain/dice';
import {
  handleLanding, buyProperty, LandingResult, BuyResult,
  upgradeProperty, upgradeETC, upgradeUtilityFull, PROPERTY_DEEDS,
  resolveRent, type PropertyRegistry, type PropertyStateMap, type PropertyState,
} from '../domain/property_manager';
import { BOARD_CONFIG } from '../domain/board_config';

export interface RollResult {
  readonly dice:         DiceResult;
  readonly player:       Readonly<{ id: string; position: number; balance: number }>;
  readonly passedGo:     boolean;
  readonly rentCharged:  number;
}

export type PlayerIntent =
  | { type: 'INTENT_BUY' } | { type: 'INTENT_DECLINE' }
  | { type: 'INTENT_BID'; amount: number }
  | { type: 'INTENT_UPGRADE'; cellIndex: number }
  | { type: 'INTENT_UPGRADE_ETC' }
  | { type: 'INTENT_UPGRADE_UTILITY'; cellIndex: number }
  | { type: 'INTENT_END_TURN' };

export interface AuctionSession {
  readonly cellIndex: number;
  highestBid: number;
  highestBidder?: string;
}

export class RoomManager {
  private readonly rooms = new Map<string, Room>();
  private readonly rng: () => number;
  private readonly registries = new Map<string, PropertyRegistry>();
  private readonly propertyStates = new Map<string, PropertyStateMap>();
  private readonly auctions = new Map<string, AuctionSession>();

  constructor(seed?: number) {
    this.rng = mulberry32(seed ?? Date.now());
  }

  createRoom(hostId: string): Room {
    const room = domainCreateRoom(hostId);
    this.rooms.set(room.roomCode, room);
    this.registries.set(room.roomCode, new Map());
    this.propertyStates.set(room.roomCode, new Map());
    return room;
  }

  joinRoom(roomCode: string, playerId: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (room === undefined || room.started) return undefined;
    room.players.push(createPlayer(playerId));
    return room;
  }

  startGame(roomCode: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (room === undefined || room.players.length < 2) return undefined;
    room.started = true;
    room.phase = TurnPhase.WaitingRoll;
    room.currentPlayerIndex = 0;
    return room;
  }

  private getActivePlayer(room: Room | undefined, playerId: string): Player | undefined {
    if (!room?.started) return undefined;
    const current = room.players[room.currentPlayerIndex];
    return current?.id === playerId ? current : undefined;
  }

  handleRollDice(roomCode: string, playerId: string): RollResult | undefined {
    const room = this.rooms.get(roomCode);
    const current = this.getActivePlayer(room, playerId);
    if (!current || !room || room.phase !== TurnPhase.WaitingRoll) return undefined;

    const dice = rollDice(this.rng);
    const oldPos = current.position;
    const newPos = (oldPos + dice.total) % BOARD_SIZE;
    current.position = newPos;

    const passedGo = checkPassedGo(oldPos, newPos);
    if (passedGo) current.balance += GO_BONUS;

    const reg = this.registries.get(roomCode) ?? new Map();
    const stateMap = this.propertyStates.get(roomCode) ?? new Map();
    const landing = handleLanding(current, newPos, reg, room.players, stateMap, dice.total);

    room.phase = landing.result === LandingResult.Unowned
      ? TurnPhase.ActionPhase
      : TurnPhase.PropertyManagement;

    return { dice, player: { id: current.id, position: current.position, balance: current.balance }, passedGo, rentCharged: landing.rentAmount };
  }

  handleBuyProperty(roomCode: string, playerId: string): { result: BuyResult } | undefined {
    const room = this.rooms.get(roomCode);
    const current = this.getActivePlayer(room, playerId);
    if (!current || !room || room.phase !== TurnPhase.ActionPhase) return undefined;
    const reg = this.registries.get(roomCode);
    if (!reg) return undefined;
    const res = buyProperty(current, current.position, reg);
    if (res.result === BuyResult.Success) room.phase = TurnPhase.PropertyManagement;
    return res;
  }

  private handleDecline(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    const current = this.getActivePlayer(room, playerId);
    if (!current || room?.phase !== TurnPhase.ActionPhase) return { success: false, reason: 'INVALID_PHASE' };
    const deed = PROPERTY_DEEDS.get(current.position);
    if (!deed) return { success: false, reason: 'NOT_PURCHASABLE' };
    this.auctions.set(roomCode, { cellIndex: current.position, highestBid: Math.floor(deed.price * 0.5) });
    room.phase = TurnPhase.AuctionPhase;
    return { success: true };
  }

  private handleUpgradeETC(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    const current = this.getActivePlayer(room, playerId);
    if (!current || room?.phase !== TurnPhase.PropertyManagement) return { success: false, reason: 'INVALID_PHASE' };
    const reg = this.registries.get(roomCode);
    const sm = this.propertyStates.get(roomCode);
    if (!reg || !sm) return { success: false, reason: 'INVALID_ROOM' };
    return upgradeETC(current, reg, sm);
  }

  private handleUpgradeUtility(roomCode: string, playerId: string, cellIndex: number): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    const current = this.getActivePlayer(room, playerId);
    if (!current || room?.phase !== TurnPhase.PropertyManagement) return { success: false, reason: 'INVALID_PHASE' };
    const reg = this.registries.get(roomCode);
    const sm = this.propertyStates.get(roomCode);
    if (!reg || !sm) return { success: false, reason: 'INVALID_ROOM' };
    return upgradeUtilityFull(current, cellIndex, reg, sm);
  }

  handlePlayerIntent(roomCode: string, playerId: string, intent: PlayerIntent): { success: boolean; reason?: string } {
    if (intent.type === 'INTENT_BUY') {
      const res = this.handleBuyProperty(roomCode, playerId);
      return { success: res?.result === BuyResult.Success, reason: res?.result };
    }
    if (intent.type === 'INTENT_DECLINE') return this.handleDecline(roomCode, playerId);
    if (intent.type === 'INTENT_BID') return this.handleAuctionBid(roomCode, playerId, intent.amount);
    if (intent.type === 'INTENT_UPGRADE') return this.handleUpgrade(roomCode, playerId, intent.cellIndex);
    if (intent.type === 'INTENT_UPGRADE_ETC') return this.handleUpgradeETC(roomCode, playerId);
    if (intent.type === 'INTENT_UPGRADE_UTILITY') return this.handleUpgradeUtility(roomCode, playerId, intent.cellIndex);
    if (intent.type === 'INTENT_END_TURN') {
      const r = this.handleEndTurn(roomCode, playerId);
      return { success: r !== undefined, reason: r ? undefined : 'INVALID_PHASE' };
    }
    return { success: false, reason: 'INVALID_INTENT' };
  }

  handleAuctionBid(roomCode: string, playerId: string, amount: number): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    const session = this.auctions.get(roomCode);
    if (!room?.started || room.phase !== TurnPhase.AuctionPhase || !session) return { success: false, reason: 'INVALID_PHASE' };
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) return { success: false, reason: 'BID_TOO_LOW' };
    const player = room.players.find((p) => p.id === playerId);
    if (!player) return { success: false, reason: 'PLAYER_NOT_FOUND' };
    if (session.highestBidder === playerId) return { success: false, reason: 'ALREADY_HIGHEST_BIDDER' };
    if (player.balance < amount) return { success: false, reason: 'INSUFFICIENT_FUNDS' };
    const minBid = session.highestBidder !== undefined ? session.highestBid + 100 : session.highestBid;
    if (amount < minBid) return { success: false, reason: 'BID_TOO_LOW' };
    session.highestBid = amount;
    session.highestBidder = playerId;
    return { success: true };
  }

  handleAuctionClose(roomCode: string): { winnerId?: string; winningBid: number } {
    const room = this.rooms.get(roomCode);
    const session = this.auctions.get(roomCode);
    if (!room?.started || room.phase !== TurnPhase.AuctionPhase || !session) return { winnerId: undefined, winningBid: 0 };
    let winnerId: string | undefined;
    let winningBid = 0;
    if (session.highestBidder) {
      const winner = room.players.find((p) => p.id === session.highestBidder);
      if (winner && winner.balance >= session.highestBid) {
        winner.balance -= session.highestBid;
        this.registries.get(roomCode)?.set(session.cellIndex, winner.id);
        winnerId = session.highestBidder;
        winningBid = session.highestBid;
      }
    }
    room.phase = TurnPhase.PropertyManagement;
    this.auctions.delete(roomCode);
    return { winnerId, winningBid };
  }

  handleUpgrade(roomCode: string, playerId: string, cellIndex: number): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    const current = this.getActivePlayer(room, playerId);
    if (!current || room?.phase !== TurnPhase.PropertyManagement) return { success: false, reason: 'INVALID_PHASE' };
    const reg = this.registries.get(roomCode);
    const sm = this.propertyStates.get(roomCode);
    if (!reg || !sm) return { success: false, reason: 'INVALID_ROOM' };
    return upgradeProperty(current, cellIndex, reg, sm);
  }

  handleEndTurn(roomCode: string, playerId: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    const current = this.getActivePlayer(room, playerId);
    if (!current || !room) return undefined;
    if (room.phase === TurnPhase.WaitingRoll || room.phase === TurnPhase.AuctionPhase) return undefined;
    room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
    room.phase = TurnPhase.WaitingRoll;
    return room;
  }

  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode);
  }

  getPropertyOwner(roomCode: string, cellIndex: number): string | undefined {
    return this.registries.get(roomCode)?.get(cellIndex);
  }

  getPropertyState(roomCode: string, cellIndex: number): PropertyState | undefined {
    return this.propertyStates.get(roomCode)?.get(cellIndex);
  }

  getPropertyRent(roomCode: string, cellIndex: number, diceTotal?: number): number {
    const reg = this.registries.get(roomCode);
    const ownerId = reg?.get(cellIndex);
    if (!reg || !ownerId) return 0;
    const cell = BOARD_CONFIG[cellIndex];
    const sm = this.propertyStates.get(roomCode);
    return resolveRent(cell, cellIndex, ownerId, reg, sm, diceTotal);
  }
}
