// [UC-GAME-001..003,005,007,008/MSS] Room Manager & FSM Turn Loop

import {
  createRoom as domainCreateRoom,
  createPlayer,
  checkPassedGo,
  GO_BONUS,
  BOARD_SIZE,
  TurnPhase,
} from '../domain/room';
import type { Room } from '../domain/room';
import { mulberry32, rollDice } from '../domain/dice';
import type { DiceResult } from '../domain/dice';

export interface RollResult {
  readonly dice:     DiceResult;
  readonly player:   Readonly<{ id: string; position: number; balance: number }>;
  readonly passedGo: boolean;
}

export class RoomManager {
  private readonly rooms = new Map<string, Room>();
  private readonly rng: () => number;

  constructor(seed?: number) {
    this.rng = mulberry32(seed ?? Date.now());
  }

  createRoom(hostId: string): Room {
    const room = domainCreateRoom(hostId);
    this.rooms.set(room.roomCode, room);
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

  handleRollDice(roomCode: string, playerId: string): RollResult | undefined {
    const room = this.rooms.get(roomCode);
    if (room === undefined || !room.started) return undefined;
    if (room.phase !== TurnPhase.WaitingRoll) return undefined;

    const current = room.players[room.currentPlayerIndex];
    if (current === undefined || current.id !== playerId) return undefined;

    const dice = rollDice(this.rng);
    const oldPos = current.position;
    const newPos = (oldPos + dice.total) % BOARD_SIZE;
    current.position = newPos;

    const passedGo = checkPassedGo(oldPos, newPos);
    if (passedGo) current.balance += GO_BONUS;

    room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
    room.phase = TurnPhase.WaitingRoll;

    return { dice, player: { id: current.id, position: current.position, balance: current.balance }, passedGo };
  }

  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode);
  }
}
