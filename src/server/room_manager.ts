// [UC-GAME-001..003,005,007,008/MSS][UC-GAME-051..057/MSS] Room Manager & FSM Turn Loop
import {
  ActionRejectReason,
} from '../domain/room.js';
import { BotPersonality } from '../domain/bot/bot_engine.js';
import { resolveAuctionBots as coordResolveAuctionBots, runBotTurn as coordRunBotTurn, stepBotTurn as coordStepBotTurn, stepAuctionBot as coordStepAuctionBot } from './room_bot_coordinator.js';
import type { Room, Player, PendingBuyoutSession } from '../domain/room.js';
import { mulberry32 } from '../domain/dice.js';
import {
  BuyResult,
  type PropertyRegistry, type PropertyStateMap, type PropertyState,
} from '../domain/property_manager.js';
import { handleTurnStart, handleBailOut, handleUseDiplomatic } from './audit_manager.js';
import {
  handleDecline, handleAuctionBid, handleAuctionPass, handleAuctionClose, type AuctionSession,
} from './auction_manager.js';
import {
  handleBuyProperty, handleUpgrade, handleUpgradeETC, handleUpgradeUtility,
} from './property_actions.js';
import { handleHoseInvest, handleHoseSkip } from './hose_actions.js';
import { dispatchPlayerIntent, type PlayerIntent } from './intent_dispatcher.js';
import {
  coordMortgage, coordRedeem, coordDowngrade,
  coordLiquidate, coordTrade, coordRespondTradeOffer, coordBankruptcy,
  coordExecuteCompulsoryBuyout, coordDeclineCompulsoryBuyout,
} from './room_property_coordinator.js';
import { pendingTradeManager, type PendingTradeSession } from './pending_trade_manager.js';
import { executeTurnRoll } from './turn_loop.js';
import type { DiceResult } from '../domain/dice.js';
import {
  getActivePlayerFn, doCreateRoom, doJoinRoom, doStartGame, doAddBot, doRemoveBot,
  doSetBotPersonality, doGetBotPersonality, doHandleEndTurn, doCloseRoom, doOnCloseRoom,
  doRegisterTimer, doClearRoomTimers, doGetActiveTimers, doTouchActivity, doGetLastActivity,
  doGetAllRoomCodes, doGetRoomCount, doHasRoom,
} from './room_manager_lifecycle.js';
import { calcPropertyRent, calcRankings, buildRoomDelta } from './room_manager_queries.js';
import type { DeltaPayload } from './session_manager.js';
import type { RoomBotSpec } from './room_bot_manager.js';

export type { AuctionSession, PlayerIntent, PendingTradeSession, PendingBuyoutSession };

export interface AuctionResult {
  winnerId: string | null;
  winningBid: number;
  finalPrice?: number;
  isForeclosure?: boolean;
  cellIndex?: number;
}

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
  private readonly lastAuctionResults = new Map<string, AuctionResult>();

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
    return doCreateRoom(this.rooms, this.registries, this.propertyStates, this.rolledThisTurn, this.auctions, this.deckRng, hostId, customRoomCode, (rc) => this.touchActivity(rc));
  }

  joinRoom(roomCode: string, playerId: string): Room | undefined {
    return doJoinRoom(this.rooms, roomCode, playerId, (rc) => this.touchActivity(rc));
  }

  startGame(roomCode: string, bots?: ReadonlyArray<RoomBotSpec>): Room | undefined {
    return doStartGame(this.rooms, this.botPersonalities, roomCode, bots, (rc) => this.touchActivity(rc));
  }

  addBot(roomCode: string, botId?: string, personality?: BotPersonality): Player | undefined {
    return doAddBot(this.rooms, this.botPersonalities, roomCode, botId, personality, (rc) => this.touchActivity(rc));
  }

  removeBot(roomCode: string, botId: string): boolean {
    return doRemoveBot(this.rooms, this.botPersonalities, roomCode, botId, (rc) => this.touchActivity(rc));
  }

  setBotPersonality(roomCode: string, botId: string, personality: BotPersonality): void {
    doSetBotPersonality(this.botPersonalities, roomCode, botId, personality);
  }

  getBotPersonality(roomCode: string, botId: string): BotPersonality {
    return doGetBotPersonality(this.botPersonalities, roomCode, botId);
  }

  private getActivePlayer(room: Room | undefined, playerId: string): Player | undefined {
    return getActivePlayerFn(room, playerId);
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
    this.clearLastAuctionResult(roomCode);
    const room = this.rooms.get(roomCode);
    if (room) {
      room.lastAuctionResult = undefined;
      room.lastHoseResult = undefined;
    }
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

  getContext(roomCode: string): { room: Room; reg: PropertyRegistry; sm: PropertyStateMap; botPersonalities: Map<string, BotPersonality> } | undefined {
    const room = this.rooms.get(roomCode);
    const reg = this.registries.get(roomCode);
    const sm = this.propertyStates.get(roomCode);
    if (!room || !reg || !sm) return undefined;
    return { room, reg, sm, botPersonalities: this.botPersonalities };
  }

  handleDecline(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const res = handleDecline(this.rooms.get(roomCode), this.getActivePlayer(this.rooms.get(roomCode), playerId), this.auctions, roomCode);
    this.syncAuction(roomCode);
    return res;
  }

  handleAuctionBid(roomCode: string, playerId: string, amount: number): { success: boolean; reason?: string } {
    const res = handleAuctionBid(this.rooms.get(roomCode), this.auctions.get(roomCode), playerId, amount, this.registries.get(roomCode), this.auctions, roomCode);
    this.syncAuction(roomCode);
    const room = this.rooms.get(roomCode);
    if (room?.lastAuctionResult) {
      this.lastAuctionResults.set(roomCode, room.lastAuctionResult);
    }
    return res;
  }

  handleAuctionPass(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const res = handleAuctionPass(this.rooms.get(roomCode), this.auctions.get(roomCode), playerId, this.registries.get(roomCode), this.auctions, roomCode);
    this.syncAuction(roomCode);
    const room = this.rooms.get(roomCode);
    if (room?.lastAuctionResult) {
      this.lastAuctionResults.set(roomCode, room.lastAuctionResult);
    }
    return res;
  }

  handleAuctionClose(roomCode: string): { winnerId?: string; winningBid: number; cellIndex: number; isForeclosure: boolean } {
    const session = this.auctions.get(roomCode);
    const cellIndex = session?.cellIndex ?? 0;
    const res = handleAuctionClose(this.rooms.get(roomCode), session, this.registries.get(roomCode), this.auctions, roomCode);
    const room = this.rooms.get(roomCode);
    if (room) room.currentAuction = undefined;
    const result: AuctionResult = {
      cellIndex,
      winnerId: res.winnerId ?? null,
      winningBid: res.winningBid,
      finalPrice: res.winningBid,
      isForeclosure: !res.winnerId,
    };
    this.lastAuctionResults.set(roomCode, result);
    if (room) {
      room.lastAuctionResult = result;
    }
    return res;
  }

  getLastAuctionResult(roomCode: string): AuctionResult | undefined {
    return this.rooms.get(roomCode)?.lastAuctionResult ?? this.lastAuctionResults.get(roomCode) ?? undefined;
  }

  clearLastAuctionResult(roomCode: string): void {
    this.lastAuctionResults.delete(roomCode);
    const room = this.rooms.get(roomCode);
    if (room) {
      room.lastAuctionResult = undefined;
    }
  }

  settleAuction(roomCode: string): void {
    this.clearLastAuctionResult(roomCode);
    const room = this.rooms.get(roomCode);
    if (room) {
      room.lastAuctionResult = undefined;
    }
  }

  getLastAuctionResultsMap(): Map<string, AuctionResult> {
    return this.lastAuctionResults;
  }

  stepAuctionBot(roomCode: string): { changed: boolean; finished: boolean } {
    const res = coordStepAuctionBot(this, roomCode);
    this.syncAuction(roomCode);
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

  handleDowngrade(roomCode: string, playerId: string, cellIndex: number, options?: import('../domain/property_upgrade.js').DowngradeOptions): { success: boolean; reason?: string } {
    const ctx = this.getContext(roomCode);
    return coordDowngrade(ctx, this.getActivePlayer(ctx?.room, playerId), cellIndex, roomCode, options);
  }

  handleLiquidate(roomCode: string, playerId: string): { success: boolean } {
    return coordLiquidate(this.getContext(roomCode), playerId, this.auctions, roomCode);
  }

  handleTradeOffer(
    roomCode: string,
    arg2: string,
    arg3: string,
    arg4: string | number,
    arg5?: number,
    arg6?: number,
    arg7?: number,
  ): { success: boolean; reason?: string; pending?: boolean; offerId?: string } {
    let requesterId: string;
    let sellerId: string;
    let buyerId: string;
    let cellIndex: number;
    let price: number;
    let offeredCellIndex: number | undefined;

    if (typeof arg4 === 'number') {
      requesterId = arg2;
      sellerId = arg2;
      buyerId = arg3;
      cellIndex = arg4;
      price = arg5 ?? 0;
      offeredCellIndex = arg6;
    } else {
      requesterId = arg2;
      sellerId = arg3;
      buyerId = arg4;
      cellIndex = arg5!;
      price = arg6!;
      offeredCellIndex = arg7;
    }

    return coordTrade(this.getContext(roomCode), requesterId, sellerId, buyerId, cellIndex, price, offeredCellIndex);
  }

  handleRespondTradeOffer(
    roomCode: string,
    playerId: string,
    offerId: string,
    accept: boolean,
  ): { success: boolean; reason?: string } {
    return coordRespondTradeOffer(this.getContext(roomCode), playerId, offerId, accept);
  }

  hasPendingTrade(roomCode: string): boolean {
    return pendingTradeManager.hasSession(roomCode);
  }

  getPendingTrade(roomCode: string): PendingTradeSession | undefined {
    return pendingTradeManager.getSession(roomCode);
  }

  checkPendingTradeTimeout(roomCode: string, currentTime?: number): { timeout: boolean; session?: PendingTradeSession } {
    const res = pendingTradeManager.checkTimeout(roomCode, currentTime);
    if (res.timeout && res.session) {
      const room = this.rooms.get(roomCode);
      if (room) {
        room.pendingTradeOffer = null;
        const buyer = room.players.find((p) => p.id === res.session?.buyerId);
        if (buyer) {
          const round = room.roundCount ?? room.round ?? 1;
          buyer.lastTradeOfferRound = round;
          (buyer.cellTradeRejections ??= {})[res.session.cellIndex] = ((buyer.cellTradeRejections ??= {})[res.session.cellIndex] ?? 0) + 1;
          (buyer.cellLastRejectedRound ??= {})[res.session.cellIndex] = round;
        }
      }
    }
    return res;
  }

  cancelPendingTrade(roomCode: string, playerId?: string): boolean {
    const cancelled = pendingTradeManager.cancelSession(roomCode, playerId);
    if (cancelled) {
      const room = this.rooms.get(roomCode);
      if (room) {
        room.pendingTradeOffer = null;
      }
    }
    return cancelled;
  }

  hasPendingBuyout(roomCode: string): boolean {
    const room = this.rooms.get(roomCode);
    return Boolean(room?.pendingBuyout);
  }

  getPendingBuyout(roomCode: string): PendingBuyoutSession | undefined {
    const room = this.rooms.get(roomCode);
    return room?.pendingBuyout ?? undefined;
  }

  checkPendingBuyoutTimeout(
    roomCode: string,
    currentTime?: number,
  ): { timeout: boolean; session?: PendingBuyoutSession } {
    const room = this.rooms.get(roomCode);
    if (!room?.pendingBuyout) {
      return { timeout: false };
    }
    const now = currentTime ?? Date.now();
    if (now >= room.pendingBuyout.expiresAt) {
      const session = room.pendingBuyout;
      room.pendingBuyout = null;
      return { timeout: true, session };
    }
    return { timeout: false, session: room.pendingBuyout };
  }

  executeCompulsoryBuyout(
    roomCode: string,
    playerId: string,
    cellIndex: number,
  ): { success: boolean; reason?: string } {
    this.touchActivity(roomCode);
    return coordExecuteCompulsoryBuyout(this.getContext(roomCode), playerId, cellIndex);
  }

  declineCompulsoryBuyout(
    roomCode: string,
    playerId: string,
  ): { success: boolean; reason?: string } {
    this.touchActivity(roomCode);
    return coordDeclineCompulsoryBuyout(this.getContext(roomCode), playerId);
  }

  handleBankruptcy(roomCode: string, playerId: string, creditorId?: string): { gameOver: boolean; rankings?: Array<{ id: string; netWorth: number }> } {
    this.touchActivity(roomCode);
    return coordBankruptcy(this.getContext(roomCode), playerId, creditorId, this.auctions, roomCode, this.rolledThisTurn);
  }

  handleEndTurn(roomCode: string, playerId: string, continueDoubles?: boolean): Room | undefined {
    return doHandleEndTurn(this.rooms, this.rolledThisTurn, this.registries, this.propertyStates, this.auctions, (rc) => this.touchActivity(rc), roomCode, playerId, continueDoubles);
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
    return roomCode ? (this.rooms.get(roomCode) ?? this.rooms.get(roomCode.toUpperCase())) : undefined;
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
    return calcPropertyRent(this.registries.get(roomCode), this.propertyStates.get(roomCode), cellIndex, diceTotal);
  }

  getRankings(roomCode: string): Array<{ id: string; netWorth: number }> {
    const ctx = this.getContext(roomCode);
    return ctx ? calcRankings(ctx.room, ctx.reg, ctx.sm) : [];
  }

  createDelta(roomCode: string, tick: number, timeRemaining?: number): DeltaPayload | undefined {
    const ctx = this.getContext(roomCode);
    return ctx ? buildRoomDelta(ctx.room, ctx.reg, ctx.sm, tick, this.auctions, timeRemaining, this.lastAuctionResults) : undefined;
  }

  registerTimer(roomCode: string, timer: NodeJS.Timeout): void {
    doRegisterTimer(this.activeTimersMap, roomCode, timer);
  }

  clearRoomTimers(roomCode: string): void {
    doClearRoomTimers(this.activeTimersMap, roomCode);
  }

  getActiveTimers(roomCode: string): Set<NodeJS.Timeout> | undefined {
    return doGetActiveTimers(this.activeTimersMap, roomCode);
  }

  touchActivity(roomCode: string, timestamp: number = Date.now()): void {
    doTouchActivity(this.rooms, this.lastActivity, roomCode, timestamp);
  }

  getLastActivity(roomCode: string): number | undefined {
    return doGetLastActivity(this.lastActivity, roomCode);
  }

  getAllRoomCodes(): string[] {
    return doGetAllRoomCodes(this.rooms);
  }

  getRoomCount(): number {
    return doGetRoomCount(this.rooms);
  }

  hasRoom(roomCode: string): boolean {
    return doHasRoom(this.rooms, roomCode);
  }

  onCloseRoom(hook: (roomCode: string, room: Room) => void): () => void {
    return doOnCloseRoom(this.closeHooks, hook);
  }

  closeRoom(roomCode: string): boolean {
    this.lastAuctionResults.delete(roomCode);
    return doCloseRoom(this.rooms, this.registries, this.propertyStates, this.auctions, this.rolledThisTurn, this.activeTimersMap, this.lastActivity, this.closeHooks, this.botPersonalities, roomCode);
  }
}
