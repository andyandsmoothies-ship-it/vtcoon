// [UC-GAME-001..003,005,007,008/MSS][UC-GAME-051..057/MSS] Room Manager & FSM Turn Loop
import {
  createRoom as domainCreateRoom, createPlayer, TurnPhase, ActionRejectReason,
} from '../domain/room';
import { decideBotIntent, BotPersonality, type BotConfig } from '../domain/bot/bot_engine';
import { initRoomBots, addBotToRoom, removeBotFromRoom, getBotConfig, type RoomBotSpec } from './room_bot_manager.js';
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
  private readonly botPersonalities = new Map<string, BotPersonality>();

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

  handleDecline(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const res = handleDecline(this.rooms.get(roomCode), this.getActivePlayer(this.rooms.get(roomCode), playerId), this.auctions, roomCode);
    const room = this.rooms.get(roomCode);
    if (room) room.currentAuction = this.auctions.get(roomCode);
    return res;
  }

  handleAuctionBid(roomCode: string, playerId: string, amount: number): { success: boolean; reason?: string } {
    const res = handleAuctionBid(this.rooms.get(roomCode), this.auctions.get(roomCode), playerId, amount, this.registries.get(roomCode), this.auctions, roomCode);
    const room = this.rooms.get(roomCode);
    if (room) room.currentAuction = this.auctions.get(roomCode);
    return res;
  }

  handleAuctionPass(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const res = handleAuctionPass(this.rooms.get(roomCode), this.auctions.get(roomCode), playerId, this.registries.get(roomCode), this.auctions, roomCode);
    const room = this.rooms.get(roomCode);
    if (room) room.currentAuction = this.auctions.get(roomCode);
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

  handleDowngrade(roomCode: string, playerId: string, cellIndex: number, options?: import('../domain/property_upgrade').DowngradeOptions): { success: boolean; reason?: string } {
    const room = this.rooms.get(roomCode), reg = this.registries.get(roomCode), sm = this.propertyStates.get(roomCode);
    if (!room || !reg || !sm) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
    const player = this.getActivePlayer(room, playerId);
    const res = handleDowngrade(player, room.phase, cellIndex, reg, sm, roomCode, options);
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

  handleBankruptcy(roomCode: string, playerId: string, creditorId?: string): { gameOver: boolean; rankings?: Array<{ id: string; netWorth: number }> } {
    this.touchActivity(roomCode);
    const room = this.rooms.get(roomCode);
    const reg  = this.registries.get(roomCode);
    const sm   = this.propertyStates.get(roomCode);
    if (!room || !reg || !sm) return { gameOver: false };
    const isCurrent = room.players[room.currentPlayerIndex]?.id === playerId;
    const res = declareBankruptcy(room, playerId, reg, sm, creditorId, this.auctions, roomCode);
    if (isCurrent && room.phase !== TurnPhase.AuctionPhase) this.rolledThisTurn.set(roomCode, false);
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

  private resolveAuctionBots(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== TurnPhase.AuctionPhase) return;
    const auction = this.auctions.get(roomCode);
    if (!auction) return;

    const registry = this.registries.get(roomCode) ?? new Map();
    const stateMap = this.propertyStates.get(roomCode) ?? new Map();

    let auctionChanged = true;
    let iterations = 0;
    const MAX_AUCTION_ITERATIONS = 30;

    while (auctionChanged && iterations < MAX_AUCTION_ITERATIONS && room.phase === TurnPhase.AuctionPhase) {
      auctionChanged = false;
      iterations++;

      const eligible = room.players.filter(
        (p) => p.isBot && !p.bankrupt && p.id !== auction.declinedPlayerId && !auction.passedPlayers?.has(p.id),
      );
      if (eligible.length === 0) break;

      for (const bot of eligible) {
        if (room.phase !== TurnPhase.AuctionPhase) break;
        if (auction.passedPlayers?.has(bot.id)) continue;
        if (auction.highestBidder === bot.id) continue;

        const config = getBotConfig(this.getBotPersonality(roomCode, bot.id));
        const auctionForBot = {
          ...auction,
          bidIncrement: auction.highestBidder !== undefined ? 100 : 50,
        };
        const intent = decideBotIntent(bot, room, registry, stateMap, config, auctionForBot);

        if (intent?.type === 'INTENT_BID') {
          const amount = typeof intent.amount === 'number' ? intent.amount : 0;
          const res = this.handleAuctionBid(roomCode, bot.id, amount);
          if (res.success) {
            auctionChanged = true;
          } else {
            this.handleAuctionPass(roomCode, bot.id);
          }
        } else if (intent?.type === 'INTENT_AUCTION_PASS') {
          this.handleAuctionPass(roomCode, bot.id);
        }
      }
    }

    // Nếu chỉ còn highestBidder và mọi người chơi khác đều đã pass hoặc là declinedPlayer
    if (room.phase === TurnPhase.AuctionPhase && auction.highestBidder) {
      const remainingContenders = room.players.filter(
        (p) => !p.bankrupt && p.id !== auction.declinedPlayerId && p.id !== auction.highestBidder,
      );
      if (remainingContenders.length === 0 || remainingContenders.every((p) => auction.passedPlayers?.has(p.id))) {
        this.handleAuctionClose(roomCode);
      }
    }
  }

  // [UC-GAME-005/MSS][UC-GAME-008/MSS] Tự động chạy lượt Bot
  runBotTurn(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) return;

    // Nếu đang trong AuctionPhase: Các bot đủ điều kiện giải quyết đấu giá (Bid hoặc Pass)
    if ((this.rooms.get(roomCode)?.phase as TurnPhase) === TurnPhase.AuctionPhase) {
      this.resolveAuctionBots(roomCode);
      if ((this.rooms.get(roomCode)?.phase as TurnPhase) === TurnPhase.AuctionPhase) return;
    }

    const current = this.rooms.get(roomCode)?.players[this.rooms.get(roomCode)?.currentPlayerIndex ?? 0];
    if (!current?.isBot || current.bankrupt) return;

    const config = getBotConfig(this.getBotPersonality(roomCode, current.id));

    let safetyCounter = 0;
    const MAX_INTENTS = 50;

    while (safetyCounter < MAX_INTENTS) {
      const currentRoom = this.rooms.get(roomCode);
      if (!currentRoom) break;
      const active = currentRoom.players[currentRoom.currentPlayerIndex];
      if (!active || !active.isBot || active.id !== current.id) break;

      if ((currentRoom.phase as TurnPhase) === TurnPhase.AuctionPhase) {
        this.resolveAuctionBots(roomCode);
        if ((this.rooms.get(roomCode)?.phase as TurnPhase) === TurnPhase.AuctionPhase) break;
        safetyCounter++;
        continue;
      }

      const intent = decideBotIntent(
        active, currentRoom,
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
      if (!result.success) {
        if (intent.type === 'INTENT_BUY' || intent.type === 'INTENT_BUY_PROPERTY') {
          this.handleDecline(roomCode, active.id);
          this.resolveAuctionBots(roomCode);
          if ((this.rooms.get(roomCode)?.phase as TurnPhase) === TurnPhase.AuctionPhase) break;
          safetyCounter++;
          continue;
        }
        break;
      }

      if (intent.type === 'INTENT_DECLINE' && (this.rooms.get(roomCode)?.phase as TurnPhase) === TurnPhase.AuctionPhase) {
        this.resolveAuctionBots(roomCode);
        if ((this.rooms.get(roomCode)?.phase as TurnPhase) === TurnPhase.AuctionPhase) break;
      }

      safetyCounter++;
    }

    // Bảo vệ phòng vệ: Nếu Bot vẫn bị kẹt ở ActionPhase, cưỡng chế giải phóng lượt
    const roomEnd = this.rooms.get(roomCode);
    if (roomEnd && (roomEnd.phase as TurnPhase) === TurnPhase.ActionPhase) {
      this.handleDecline(roomCode, current.id);
      this.resolveAuctionBots(roomCode);
      if ((this.rooms.get(roomCode)?.phase as TurnPhase) !== TurnPhase.AuctionPhase) {
        this.handleEndTurn(roomCode, current.id);
      }
    }
  }

  getRoom(roomCode: string): Room | undefined { return this.rooms.get(roomCode) ?? this.rooms.get(roomCode.toUpperCase()); }
  getRegistry(roomCode: string): PropertyRegistry | undefined { return this.registries.get(roomCode); }
  getPropertyStates(roomCode: string): PropertyStateMap | undefined { return this.propertyStates.get(roomCode); }
  get auctionsMap(): Map<string, AuctionSession> { return this.auctions; }
  getPropertyOwner(roomCode: string, cellIndex: number): string | undefined { return this.registries.get(roomCode)?.get(cellIndex); }
  getPropertyState(roomCode: string, cellIndex: number): PropertyState | undefined { return this.propertyStates.get(roomCode)?.get(cellIndex); }
  getPropertyRent(roomCode: string, cellIndex: number, diceTotal?: number): number {
    const reg = this.registries.get(roomCode);
    const ownerId = reg?.get(cellIndex);
    if (!reg || !ownerId) return 0;
    return resolveRent(BOARD_CONFIG[cellIndex], cellIndex, ownerId, reg, this.propertyStates.get(roomCode), diceTotal);
  }

  getRankings(roomCode: string): Array<{ id: string; netWorth: number }> {
    const room = this.rooms.get(roomCode), reg = this.registries.get(roomCode), sm = this.propertyStates.get(roomCode);
    return (!room || !reg || !sm) ? [] : calculateRankings(room, reg, sm);
  }

  createDelta(roomCode: string, tick: number, timeRemaining?: number): DeltaPayload | undefined {
    const room = this.rooms.get(roomCode), reg = this.registries.get(roomCode), sm = this.propertyStates.get(roomCode);
    return (!room || !reg || !sm) ? undefined : buildDeltaFromRoom(room, reg, sm, tick, this.auctions, timeRemaining);
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
  getLastActivity(roomCode: string): number | undefined { return this.lastActivity.get(roomCode); }
  getAllRoomCodes(): string[] { return Array.from(this.rooms.keys()); }
  getRoomCount(): number { return this.rooms.size; }
  hasRoom(roomCode: string): boolean { return this.rooms.has(roomCode); }

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
