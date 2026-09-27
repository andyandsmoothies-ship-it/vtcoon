// [IMP-210] GameRoomSession Aggregate Root
// Encapsulates room state, registries, property states, auctions, timers, and bot personalities.
import type { Room, CurrentAuctionState } from '../domain/room.js';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager.js';
import type { AuctionSession } from './auction_manager.js';
import type { AuctionResult } from './room_manager.js';
import type { RoomContext } from './room_property_coordinator.js';
import { BotPersonality } from '../domain/bot/bot_engine.js';

export class RoomBotPersonalityMap extends Map<string, BotPersonality> {
  private readonly roomCode: string;

  constructor(roomCode: string) {
    super();
    this.roomCode = roomCode;
  }

  private normalizeKey(key: string): string {
    if (!key) return key;
    const prefix = `${this.roomCode.toUpperCase()}:`;
    if (key.toUpperCase().startsWith(prefix)) {
      return key.slice(prefix.length);
    }
    return key;
  }

  override get(key: string): BotPersonality | undefined {
    return super.get(this.normalizeKey(key)) ?? super.get(key);
  }

  override has(key: string): boolean {
    return super.has(this.normalizeKey(key)) || super.has(key);
  }

  override set(key: string, value: BotPersonality): this {
    super.set(this.normalizeKey(key), value);
    return this;
  }

  override delete(key: string): boolean {
    const k = this.normalizeKey(key);
    const d1 = super.delete(k);
    const d2 = super.delete(key);
    return d1 || d2;
  }
}

export class GameRoomSession {
  readonly roomCode: string;
  readonly room: Room;
  readonly registry: PropertyRegistry = new Map();
  readonly propertyStates: PropertyStateMap = new Map();
  private _auction?: AuctionSession;
  private _lastAuctionResult?: AuctionResult;
  private _rolledThisTurn?: boolean;
  readonly activeTimers: Set<NodeJS.Timeout> = new Set();
  lastActivity: number = Date.now();
  readonly botPersonalities: RoomBotPersonalityMap;

  constructor(room: Room) {
    this.roomCode = room.roomCode;
    this.room = room;
    this.botPersonalities = new RoomBotPersonalityMap(room.roomCode);
  }

  get rolledThisTurn(): boolean {
    return this._rolledThisTurn ?? false;
  }

  set rolledThisTurn(val: boolean | undefined) {
    this._rolledThisTurn = val;
  }

  get rawRolledThisTurn(): boolean | undefined {
    return this._rolledThisTurn;
  }

  get auction(): AuctionSession | undefined {
    return this._auction;
  }

  set auction(val: AuctionSession | undefined) {
    this._auction = val;
    this.room.currentAuction = val;
  }

  get lastAuctionResult(): AuctionResult | undefined {
    return this._lastAuctionResult ?? (this.room.lastAuctionResult || undefined);
  }

  set lastAuctionResult(val: AuctionResult | undefined) {
    this._lastAuctionResult = val;
    this.room.lastAuctionResult = val;
  }

  toContext(): RoomContext {
    return {
      room: this.room,
      reg: this.registry,
      sm: this.propertyStates,
      botPersonalities: this.botPersonalities,
    };
  }

  touchActivity(timestamp: number = Date.now()): void {
    this.lastActivity = timestamp;
  }

  registerTimer(timer: NodeJS.Timeout): void {
    this.activeTimers.add(timer);
  }

  clearTimers(): void {
    for (const timer of this.activeTimers) {
      clearTimeout(timer);
    }
    this.activeTimers.clear();
  }

  destroy(): void {
    this.clearTimers();
    this._auction = undefined;
    this.room.currentAuction = undefined;
    this.lastAuctionResult = undefined;
    this.room.lastAuctionResult = undefined;
    this.registry.clear();
    this.propertyStates.clear();
    this.botPersonalities.clear();
  }
}
