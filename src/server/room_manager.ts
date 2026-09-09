// [UC-GAME-001..003,005,007,008/MSS][UC-GAME-051..057/MSS] Room Manager & FSM Turn Loop
import {
  createRoom as domainCreateRoom, createPlayer, TurnPhase, ActionRejectReason,
} from '../domain/room';
import { decideBotIntent, BotPersonality, type BotConfig } from '../domain/bot/bot_engine';
import type { Room, Player } from '../domain/room';
import { mulberry32 } from '../domain/dice';
import {
  BuyResult,
  resolveRent, type PropertyRegistry, type PropertyStateMap, type PropertyState,
} from '../domain/property_manager';
import { BOARD_CONFIG } from '../domain/board_config';
import {
  createMarketDeck, createChanceDeck,
} from '../domain/event_card_engine';
import { handleTurnStart, handleBailOut, handleUseDiplomatic } from './audit_manager';
import {
  handleDecline, handleAuctionBid, handleAuctionPass, handleAuctionClose, type AuctionSession,
} from './auction_manager';
import {
  handleBuyProperty, handleUpgrade, handleUpgradeETC, handleUpgradeUtility,
  handleDowngrade, executeP2PTrade,
} from './property_actions';
import { handleHoseInvest, handleHoseSkip } from './hose_actions';
import { dispatchPlayerIntent, type PlayerIntent } from './intent_dispatcher';
import {
  mortgageProperty, redeemProperty, collectMortgageInterest,
} from './mortgage_manager';
import { checkInsolvency, liquidateAssets, declareBankruptcy, calculateRankings } from './insolvency_manager';
import { buildDeltaFromRoom, type DeltaPayload } from './session_manager';
import { executeTurnRoll, executeTurnEnd } from './turn_loop';
import type { DiceResult } from '../domain/dice';

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
  private readonly activeTimersMap = new Map<string, Set<NodeJS.Timeout>>();
  private readonly lastActivity = new Map<string, number>();
  private readonly closeHooks: Array<(roomCode: string, room: Room) => void> = [];

  get roomMap(): Map<string, Room> { return this.rooms; }
  get activeTimers(): Map<string, Set<NodeJS.Timeout>> { return this.activeTimersMap; }

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
    this.touchActivity(room.roomCode);
    return room;
  }

  joinRoom(roomCode: string, playerId: string): Room | undefined {
    const room = this.rooms.get(roomCode);
    if (!room || room.started) return undefined;
    room.players.push(createPlayer(playerId));
    this.touchActivity(roomCode);
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
    this.touchActivity(roomCode);
    return room;
  }

  private getActivePlayer(room: Room | undefined, playerId: string): Player | undefined {
    if (!room?.started) return undefined;
    const current = room.players[room.currentPlayerIndex];
    return current?.id === playerId ? current : undefined;
  }

  handleTurnStart(roomCode: string, playerId: string): { canRoll: boolean; reason?: string } {
    return handleTurnStart(this.rooms.get(roomCode), playerId);
  }
  handleBailOut(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    return handleBailOut(this.rooms.get(roomCode), playerId, Boolean(this.rolledThisTurn.get(roomCode)));
  }
  handleUseDiplomatic(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    const player = room?.players.find((p) => p.id === playerId);
    return (!room || !player) ? { success: false, reason: ActionRejectReason.INVALID_PLAYER } : handleUseDiplomatic(player, room.chanceDiscard);
  }

  handleRollDice(roomCode: string, playerId: string): RollResult | undefined {
    this.touchActivity(roomCode);
    const room = this.rooms.get(roomCode);
    const current = this.getActivePlayer(room, playerId);
    if (!current || !room) return undefined;
    const reg = this.registries.get(roomCode) ?? new Map();
    const sm = this.propertyStates.get(roomCode) ?? new Map();
    return executeTurnRoll(room, current, reg, sm, this.rng, this.deckRng, this.rolledThisTurn, roomCode);
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
    this.touchActivity(roomCode);
    return dispatchPlayerIntent(this, roomCode, playerId, intent);
  }

  // --- S05 Handlers ---

  handleMortgage(roomCode: string, playerId: string, cellIndex: number): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    const reg  = this.registries.get(roomCode);
    const sm   = this.propertyStates.get(roomCode);
    if (!room || !reg || !sm) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
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
    if (!room || !reg) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    return redeemProperty(room, playerId, cellIndex, reg);
  }

  handleDowngrade(roomCode: string, playerId: string, cellIndex: number): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode), reg = this.registries.get(roomCode), sm = this.propertyStates.get(roomCode);
    if (!room || !reg || !sm) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
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
    liquidateAssets(room, playerId, reg, sm, this.auctions, roomCode);
    return { success: true };
  }

  handleTradeOffer(
    roomCode: string, requesterId: string, sellerId: string, buyerId: string, cellIndex: number, price: number,
  ): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode);
    const reg  = this.registries.get(roomCode);
    const sm   = this.propertyStates.get(roomCode);
    if (!room || !reg || !sm) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    if (requesterId !== sellerId && requesterId !== buyerId) return { success: false, reason: ActionRejectReason.UNAUTHORIZED };
    return executeP2PTrade(room, sellerId, buyerId, cellIndex, price, reg, sm);
  }

  handleBankruptcy(roomCode: string, playerId: string): { gameOver: boolean; rankings?: Array<{ id: string; netWorth: number }> } {
    this.touchActivity(roomCode);
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
    this.touchActivity(roomCode);
    const room = this.rooms.get(roomCode);
    const current = this.getActivePlayer(room, playerId);
    if (!current || !room) return undefined;
    return executeTurnEnd(
      room,
      current,
      this.rolledThisTurn.get(roomCode) ?? false,
      continueDoubles ?? false,
      roomCode,
      this.rolledThisTurn,
      this.registries.get(roomCode),
      this.propertyStates.get(roomCode),
      this.auctions,
    );
  }

  // [UC-GAME-005/MSS][UC-GAME-008/MSS] Tự động chạy lượt Bot
  runBotTurn(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;
    const current = room.players[room.currentPlayerIndex];
    if (!current?.isBot) return;

    const config: BotConfig = {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.20,
    };

    let safetyCounter = 0;
    const MAX_INTENTS = 50;

    while (safetyCounter < MAX_INTENTS) {
      const active = room.players[room.currentPlayerIndex];
      if (!active || !active.isBot || active.id !== current.id) break;

      const intent = decideBotIntent(
        active, room,
        this.registries.get(roomCode) ?? new Map(),
        this.propertyStates.get(roomCode) ?? new Map(),
        config,
      );
      if (!intent) break;

      // INTENT_ROLL không qua dispatchPlayerIntent — gọi handleRollDice trực tiếp
      if (intent.type === 'INTENT_ROLL') {
        this.handleRollDice(roomCode, active.id);
        safetyCounter++;
        continue;
      }

      const result = this.handlePlayerIntent(roomCode, active.id, intent as PlayerIntent);
      if (!result.success) break;

      safetyCounter++;
    }
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

  createDelta(roomCode: string, tick: number): DeltaPayload | undefined {
    const room = this.rooms.get(roomCode);
    const reg  = this.registries.get(roomCode);
    const sm   = this.propertyStates.get(roomCode);
    if (!room || !reg || !sm) return undefined;
    return buildDeltaFromRoom(room, reg, sm, tick);
  }

  registerTimer(roomCode: string, timer: NodeJS.Timeout): void {
    let timers = this.activeTimersMap.get(roomCode);
    if (!timers) {
      timers = new Set();
      this.activeTimersMap.set(roomCode, timers);
    }
    timers.add(timer);
  }

  clearRoomTimers(roomCode: string): void {
    const timers = this.activeTimersMap.get(roomCode);
    if (timers) {
      for (const t of timers) {
        clearTimeout(t);
      }
      this.activeTimersMap.delete(roomCode);
    }
  }

  getActiveTimers(roomCode: string): Set<NodeJS.Timeout> | undefined {
    return this.activeTimersMap.get(roomCode);
  }

  touchActivity(roomCode: string, timestamp: number = Date.now()): void {
    if (this.rooms.has(roomCode)) {
      this.lastActivity.set(roomCode, timestamp);
    }
  }

  getLastActivity(roomCode: string): number | undefined {
    return this.lastActivity.get(roomCode);
  }

  getAllRoomCodes(): string[] {
    return Array.from(this.rooms.keys());
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  hasRoom(roomCode: string): boolean {
    return this.rooms.has(roomCode);
  }

  onCloseRoom(hook: (roomCode: string, room: Room) => void): () => void {
    this.closeHooks.push(hook);
    return () => {
      const idx = this.closeHooks.indexOf(hook);
      if (idx !== -1) this.closeHooks.splice(idx, 1);
    };
  }

  closeRoom(roomCode: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room) return false;
    this.rooms.delete(roomCode);
    this.clearRoomTimers(roomCode);
    for (const hook of this.closeHooks) {
      hook(roomCode, room);
    }
    this.registries.delete(roomCode);
    this.propertyStates.delete(roomCode);
    this.auctions.delete(roomCode);
    this.rolledThisTurn.delete(roomCode);
    this.lastActivity.delete(roomCode);
    return true;
  }
}
