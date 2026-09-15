// [UC-GAME-001..003,005,007,008/MSS][UC-GAME-051..057/MSS] Room Manager & FSM Turn Loop
import {
  createRoom as domainCreateRoom, createPlayer, TurnPhase, ActionRejectReason,
  getInitialBalanceForPlayerCount,
} from '../domain/room';
import { BotPersonality } from '../domain/bot/bot_engine';
import { initRoomBots, addBotToRoom, removeBotFromRoom, type RoomBotSpec } from './room_bot_manager.js';
import { resolveAuctionBots as coordResolveAuctionBots, runBotTurn as coordRunBotTurn, stepBotTurn as coordStepBotTurn } from './room_bot_coordinator.js';
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
} from './property_actions';
import { handleHoseInvest, handleHoseSkip } from './hose_actions';
import { dispatchPlayerIntent, type PlayerIntent } from './intent_dispatcher';
import { calculateRankings } from './insolvency_manager';
import {
  coordMortgage, coordRedeem, coordDowngrade,
  coordLiquidate, coordTrade, coordBankruptcy,
} from './room_property_coordinator.js';
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
  private readonly botPersonalities = new Map<string, BotPersonality>();

  get roomMap(): Map<string, Room> { return this.rooms; }
  get activeTimers(): Map<string, Set<NodeJS.Timeout>> { return this.activeTimersMap; }
  getRng(): () => number { return this.rng; }

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

  createRoom(hostId: string, customRoomCode?: string): Room {
    const upperCode = customRoomCode?.toUpperCase();
    const existing = upperCode ? this.rooms.get(upperCode) : undefined;
    const canUseCustom = upperCode && (!existing || existing.hostId === hostId);
    const code = canUseCustom ? upperCode : undefined;
    const room = domainCreateRoom(hostId, code);
    room.marketDeck = createMarketDeck(this.deckRng);
    room.chanceDeck = createChanceDeck(this.deckRng);
    this.rooms.set(room.roomCode, room);
    this.registries.set(room.roomCode, new Map());
    this.propertyStates.set(room.roomCode, new Map());
    this.rolledThisTurn.delete(room.roomCode);
    this.auctions.delete(room.roomCode);
    this.touchActivity(room.roomCode);
    return room;
  }

  joinRoom(roomCode: string, playerId: string): Room | undefined {
    const room = this.rooms.get(roomCode) ?? this.rooms.get(roomCode.toUpperCase());
    if (!room || room.started) return undefined;
    room.players.push(createPlayer(playerId));
    this.touchActivity(room.roomCode);
    return room;
  }

  startGame(roomCode: string, bots?: ReadonlyArray<RoomBotSpec>): Room | undefined {
    const room = this.rooms.get(roomCode) ?? this.rooms.get(roomCode.toUpperCase());
    if (!room || room.started) return undefined;
    initRoomBots(room, bots, this.botPersonalities, room.roomCode);
    if (room.players.length < 2) return undefined;
    // Đảm bảo Host của phòng luôn luôn có isBot = false khi bắt đầu ván đấu (trừ khi được cấu hình rõ ràng là Bot trong simulation)
    const hostPlayer = room.players.find((p) => p.id === room.hostId);
    if (hostPlayer && !this.botPersonalities.has(`${room.roomCode}:${room.hostId}`) && !this.botPersonalities.has(`${roomCode}:${room.hostId}`)) {
      hostPlayer.isBot = false;
    }
    room.started = true;
    const initialBalance = getInitialBalanceForPlayerCount(room.players.length);
    for (const player of room.players) {
      player.balance = initialBalance;
    }
    room.currentPlayerIndex = 0;
    const first = room.players[0];
    room.phase = first?.skipNextTurn ? TurnPhase.PropertyManagement : TurnPhase.WaitingRoll;
    if (first?.skipNextTurn) first.skipNextTurn = false;
    this.touchActivity(room.roomCode);
    return room;
  }

  addBot(roomCode: string, botId?: string, personality?: BotPersonality): Player | undefined {
    this.touchActivity(roomCode);
    return addBotToRoom(this.rooms.get(roomCode), roomCode, botId, personality, this.botPersonalities);
  }
  removeBot(roomCode: string, botId: string): boolean {
    this.touchActivity(roomCode);
    return removeBotFromRoom(this.rooms.get(roomCode), roomCode, botId, this.botPersonalities);
  }
  setBotPersonality(roomCode: string, botId: string, personality: BotPersonality): void {
    this.botPersonalities.set(`${roomCode}:${botId}`, personality);
  }
  getBotPersonality(roomCode: string, botId: string): BotPersonality {
    return this.botPersonalities.get(`${roomCode}:${botId}`) ?? BotPersonality.Balanced;
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

  private syncAuction(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (room) room.currentAuction = this.auctions.get(roomCode);
  }

  private getContext(roomCode: string): { room: Room; reg: PropertyRegistry; sm: PropertyStateMap } | undefined {
    const room = this.rooms.get(roomCode);
    const reg = this.registries.get(roomCode);
    const sm = this.propertyStates.get(roomCode);
    if (!room || !reg || !sm) return undefined;
    return { room, reg, sm };
  }

  handleDecline(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const res = handleDecline(this.rooms.get(roomCode), this.getActivePlayer(this.rooms.get(roomCode), playerId), this.auctions, roomCode);
    this.syncAuction(roomCode);
    return res;
  }

  handleAuctionBid(roomCode: string, playerId: string, amount: number): { success: boolean; reason?: string } {
    const res = handleAuctionBid(this.rooms.get(roomCode), this.auctions.get(roomCode), playerId, amount, this.registries.get(roomCode), this.auctions, roomCode);
    this.syncAuction(roomCode);
    return res;
  }

  handleAuctionPass(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const res = handleAuctionPass(this.rooms.get(roomCode), this.auctions.get(roomCode), playerId, this.registries.get(roomCode), this.auctions, roomCode);
    this.syncAuction(roomCode);
    return res;
  }

  handleAuctionClose(roomCode: string): { winnerId?: string; winningBid: number } {
    const res = handleAuctionClose(this.rooms.get(roomCode), this.auctions.get(roomCode), this.registries.get(roomCode), this.auctions, roomCode);
    const room = this.rooms.get(roomCode);
    if (room) room.currentAuction = undefined;
    return res;
  }
  getAuctionSession(roomCode: string) { return this.auctions.get(roomCode); }

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
    return coordMortgage(this.getContext(roomCode), playerId, cellIndex);
  }

  handleRedeem(roomCode: string, playerId: string, cellIndex: number): { success: boolean; reason?: string } {
    return coordRedeem(this.getContext(roomCode), playerId, cellIndex);
  }

  handleDowngrade(roomCode: string, playerId: string, cellIndex: number, options?: import('../domain/property_upgrade').DowngradeOptions): { success: boolean; reason?: string } {
    const ctx = this.getContext(roomCode);
    return coordDowngrade(ctx, this.getActivePlayer(ctx?.room, playerId), cellIndex, roomCode, options);
  }

  handleLiquidate(roomCode: string, playerId: string): { success: boolean } {
    return coordLiquidate(this.getContext(roomCode), playerId, this.auctions, roomCode);
  }

  handleTradeOffer(
    roomCode: string, requesterId: string, sellerId: string, buyerId: string, cellIndex: number, price: number,
  ): { success: boolean; reason?: string } {
    return coordTrade(this.getContext(roomCode), requesterId, sellerId, buyerId, cellIndex, price);
  }

  handleBankruptcy(roomCode: string, playerId: string, creditorId?: string): { gameOver: boolean; rankings?: Array<{ id: string; netWorth: number }> } {
    this.touchActivity(roomCode);
    return coordBankruptcy(this.getContext(roomCode), playerId, creditorId, this.auctions, roomCode, this.rolledThisTurn);
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

  resolveAuctionBots(roomCode: string): void {
    coordResolveAuctionBots(this, roomCode);
  }

  // [UC-GAME-005/MSS][UC-GAME-008/MSS] Tự động chạy lượt Bot
  runBotTurn(roomCode: string): void {
    coordRunBotTurn(this, roomCode);
  }

  // [UC-GAME-005/MSS] Chạy từng bước lượt Bot có phân nhịp
  stepBotTurn(roomCode: string): boolean {
    return coordStepBotTurn(this, roomCode);
  }

  getRoom(roomCode: string): Room | undefined {
    return this.rooms.get(roomCode) ?? this.rooms.get(roomCode.toUpperCase());
  }

  getRegistry(roomCode: string): PropertyRegistry | undefined {
    return this.registries.get(roomCode);
  }

  getPropertyStates(roomCode: string): PropertyStateMap | undefined {
    return this.propertyStates.get(roomCode);
  }

  get auctionsMap(): Map<string, AuctionSession> {
    return this.auctions;
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
    return resolveRent(BOARD_CONFIG[cellIndex], cellIndex, ownerId, reg, this.propertyStates.get(roomCode), diceTotal);
  }

  getRankings(roomCode: string): Array<{ id: string; netWorth: number }> {
    const ctx = this.getContext(roomCode);
    return ctx ? calculateRankings(ctx.room, ctx.reg, ctx.sm) : [];
  }

  createDelta(roomCode: string, tick: number, timeRemaining?: number): DeltaPayload | undefined {
    const ctx = this.getContext(roomCode);
    return ctx ? buildDeltaFromRoom(ctx.room, ctx.reg, ctx.sm, tick, this.auctions, timeRemaining) : undefined;
  }

  registerTimer(roomCode: string, timer: NodeJS.Timeout): void {
    let timers = this.activeTimersMap.get(roomCode);
    if (!timers) this.activeTimersMap.set(roomCode, (timers = new Set()));
    timers.add(timer);
  }

  clearRoomTimers(roomCode: string): void {
    const timers = this.activeTimersMap.get(roomCode);
    if (timers) {
      for (const t of timers) clearTimeout(t);
      this.activeTimersMap.delete(roomCode);
    }
  }

  getActiveTimers(roomCode: string): Set<NodeJS.Timeout> | undefined {
    return this.activeTimersMap.get(roomCode);
  }

  touchActivity(roomCode: string, timestamp: number = Date.now()): void {
    if (this.rooms.has(roomCode)) this.lastActivity.set(roomCode, timestamp);
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
    for (const hook of this.closeHooks) hook(roomCode, room);
    for (const k of Array.from(this.botPersonalities.keys())) {
      if (k.startsWith(`${roomCode}:`)) this.botPersonalities.delete(k);
    }
    this.registries.delete(roomCode);
    this.propertyStates.delete(roomCode);
    this.auctions.delete(roomCode);
    this.rolledThisTurn.delete(roomCode);
    this.lastActivity.delete(roomCode);
    return true;
  }
}
