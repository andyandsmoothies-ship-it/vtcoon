// [UC-GAME-001..003,005,007,008/MSS][UC-GAME-051..057/MSS] Room Manager & FSM Turn Loop
import { ActionRejectReason, TurnPhase, type Room, type Player, type PendingBuyoutSession } from '../domain/room.js';
import { BotPersonality } from '../domain/bot/bot_engine.js';
import {
  resolveAuctionBots as coordResolveAuctionBots,
  runBotTurn as coordRunBotTurn,
  stepBotTurn as coordStepBotTurn,
  stepAuctionBot as coordStepAuctionBot,
} from './room_bot_coordinator.js';
import { mulberry32, type DiceResult } from '../domain/dice.js';
import {
  BuyResult,
  type PropertyRegistry,
  type PropertyStateMap,
  type PropertyState,
} from '../domain/property_manager.js';
import { handleTurnStart, handleBailOut, handleUseDiplomatic } from './audit_manager.js';
import { handleDecline, handleAuctionBid, handleAuctionPass, handleAuctionClose, type AuctionSession } from './auction_manager.js';
import { handleBuyProperty, handleUpgrade, handleUpgradeETC, handleUpgradeUtility } from './property_actions.js';
import { handleHoseInvest, handleHoseSkip } from './hose_actions.js';
import { handleIssueBond, handleRepayBond } from './bond_manager.js';
import { dispatchPlayerIntent, type PlayerIntent } from './intent_dispatcher.js';
import {
  coordMortgage, coordRedeem, coordDowngrade, coordLiquidate, coordTrade,
  coordRespondTradeOffer, coordBankruptcy, coordExecuteCompulsoryBuyout,
  coordDeclineCompulsoryBuyout, type RoomContext,
} from './room_property_coordinator.js';
import { pendingTradeManager, type PendingTradeSession } from './pending_trade_manager.js';
import { executeTurnRoll } from './turn_loop.js';
import {
  getActivePlayerFn, doCreateRoomSession, doHandleEndTurnSession, doJoinRoom,
  doStartGame, doAddBot, doRemoveBot, doSetBotPersonality, doGetBotPersonality, doOnCloseRoom,
} from './room_manager_lifecycle.js';
import { calcPropertyRent, calcRankings, buildRoomDelta } from './room_manager_queries.js';
import type { DeltaPayload } from './session_manager.js';
import type { RoomBotSpec } from './room_bot_manager.js';
import { GameRoomSession } from './game_room_session.js';
import { createSessionFieldProxy, createBotPersonalityMapFacade } from './session_proxy_facade.js';

export type { AuctionSession, PlayerIntent, PendingTradeSession, PendingBuyoutSession };

export interface AuctionResult {
  winnerId: string | null;
  winningBid: number;
  finalPrice?: number;
  isForeclosure?: boolean;
  cellIndex?: number;
}

export interface RollResult {
  readonly dice: DiceResult;
  readonly player: Readonly<{ id: string; position: number; balance: number }>;
  readonly passedGo: boolean;
  readonly rentCharged: number;
}

export class RoomManager {
  private readonly sessions = new Map<string, GameRoomSession>();
  private readonly rng: () => number;
  private readonly deckRng: () => number;
  private readonly closeHooks: Array<(roomCode: string, room: Room) => void> = [];

  // --- Dynamic Facade Maps cho call sites trong Test Suites (Full Map Protocol) ---
  readonly registries: Map<string, PropertyRegistry> = createSessionFieldProxy(this.sessions, 'registry');
  readonly propertyStates: Map<string, PropertyStateMap> = createSessionFieldProxy(this.sessions, 'propertyStates');
  readonly auctions: Map<string, AuctionSession> = createSessionFieldProxy(this.sessions, 'auction');
  readonly rolledThisTurn: Map<string, boolean> = createSessionFieldProxy(this.sessions, 'rolledThisTurn');
  readonly activeTimersMap: Map<string, Set<NodeJS.Timeout>> = createSessionFieldProxy(this.sessions, 'activeTimers');
  readonly lastAuctionResults: Map<string, AuctionResult> = createSessionFieldProxy(this.sessions, 'lastAuctionResult');
  readonly roomMap: Map<string, Room> = createSessionFieldProxy(this.sessions, 'room');
  get rooms(): Map<string, Room> { return this.roomMap; }
  readonly botPersonalities: Map<string, BotPersonality> = createBotPersonalityMapFacade(this.sessions);
  get auctionsMap(): Map<string, AuctionSession> { return this.auctions; }
  get rolledThisTurnMap(): Map<string, boolean> { return this.rolledThisTurn; }
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

  getSession(roomCode: string): GameRoomSession | undefined {
    if (!roomCode) return undefined;
    return this.sessions.get(roomCode) ?? this.sessions.get(roomCode.toUpperCase()) ?? this.sessions.get(roomCode.toLowerCase());
  }

  createRoom(hostId: string, customRoomCode?: string): Room {
    return doCreateRoomSession(this.sessions, this.deckRng, hostId, customRoomCode, (rc) => this.touchActivity(rc)).room;
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
    return handleTurnStart(this.getRoom(roomCode), playerId);
  }

  handleBailOut(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const s = this.getSession(roomCode);
    return handleBailOut(s?.room, playerId, Boolean(s?.rolledThisTurn), s?.registry, s?.propertyStates);
  }

  handleUseDiplomatic(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const room = this.getRoom(roomCode);
    const player = room?.players.find((p) => p.id === playerId);
    return (!room || !player) ? { success: false, reason: ActionRejectReason.INVALID_PLAYER } : handleUseDiplomatic(player, room.chanceDiscard);
  }

  handleRollDice(roomCode: string, playerId: string): RollResult | undefined {
    this.touchActivity(roomCode);
    this.clearLastAuctionResult(roomCode);
    const s = this.getSession(roomCode);
    if (!s) return undefined;
    s.room.lastAuctionResult = undefined;
    s.room.lastHoseResult = undefined;
    const current = this.getActivePlayer(s.room, playerId);
    return current ? executeTurnRoll(s.room, current, s.registry, s.propertyStates, this.rng, this.deckRng, this.rolledThisTurn, s.roomCode) : undefined;
  }

  handleBuyProperty(roomCode: string, playerId: string): { result: BuyResult } | undefined {
    const s = this.getSession(roomCode);
    return handleBuyProperty(s?.room, this.getActivePlayer(s?.room, playerId), s?.registry);
  }

  private syncAuction(roomCode: string): void {
    const s = this.getSession(roomCode);
    if (s) s.auction = s.auction;
  }

  getContext(roomCode: string): RoomContext | undefined {
    return this.getSession(roomCode)?.toContext();
  }

  handleDecline(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const s = this.getSession(roomCode);
    if (!s) return { success: false, reason: 'INVALID_ROOM' };
    const res = handleDecline(s.room, this.getActivePlayer(s.room, playerId), this.auctions, s.roomCode);
    this.syncAuction(roomCode);
    return res;
  }

  handleAuctionBid(roomCode: string, playerId: string, amount: number): { success: boolean; reason?: string } {
    const s = this.getSession(roomCode);
    if (!s) return { success: false, reason: 'INVALID_ROOM' };
    const res = handleAuctionBid(s.room, s.auction, playerId, amount, s.registry, this.auctions, s.roomCode, s.propertyStates);
    this.syncAuction(roomCode);
    if (s.room.lastAuctionResult) s.lastAuctionResult = s.room.lastAuctionResult;
    return res;
  }

  handleAuctionPass(roomCode: string, playerId: string): { success: boolean; reason?: string } {
    const s = this.getSession(roomCode);
    if (!s) return { success: false, reason: 'INVALID_ROOM' };
    const res = handleAuctionPass(s.room, s.auction, playerId, s.registry, this.auctions, s.roomCode, s.propertyStates);
    this.syncAuction(roomCode);
    if (s.room.lastAuctionResult) s.lastAuctionResult = s.room.lastAuctionResult;
    return res;
  }

  handleAuctionClose(roomCode: string): { winnerId?: string; winningBid: number; cellIndex: number; isForeclosure: boolean } {
    const s = this.getSession(roomCode);
    const session = s?.auction;
    const cellIndex = session?.cellIndex ?? 0;
    const res = handleAuctionClose(s?.room, session, s?.registry, this.auctions, s?.roomCode ?? roomCode, s?.propertyStates);
    this.syncAuction(roomCode);
    const result: AuctionResult = {
      cellIndex,
      winnerId: res.winnerId ?? null,
      winningBid: res.winningBid,
      finalPrice: res.winningBid,
      isForeclosure: !res.winnerId,
    };
    if (s) {
      s.lastAuctionResult = result;
      s.room.lastAuctionResult = result;
    }
    return res;
  }

  getLastAuctionResult(roomCode: string): AuctionResult | undefined {
    const s = this.getSession(roomCode);
    return s?.room.lastAuctionResult ?? s?.lastAuctionResult;
  }

  clearLastAuctionResult(roomCode: string): void {
    const s = this.getSession(roomCode);
    if (s) {
      s.lastAuctionResult = undefined;
      s.room.lastAuctionResult = undefined;
    }
  }

  settleAuction(roomCode: string): void {
    this.clearLastAuctionResult(roomCode);
  }

  getLastAuctionResultsMap(): Map<string, AuctionResult> {
    return this.lastAuctionResults;
  }

  stepAuctionBot(roomCode: string): { changed: boolean; finished: boolean } {
    const res = coordStepAuctionBot(this, roomCode);
    this.syncAuction(roomCode);
    return res;
  }

  getAuctionSession(roomCode: string): AuctionSession | undefined {
    return this.getSession(roomCode)?.auction;
  }

  handleUpgradeETC(roomCode: string, playerId: string) { const s = this.getSession(roomCode); return handleUpgradeETC(this.getActivePlayer(s?.room, playerId), s?.room.phase, s?.registry, s?.propertyStates, s?.room); }
  handleUpgradeUtility(roomCode: string, playerId: string, cellIndex: number) { const s = this.getSession(roomCode); return handleUpgradeUtility(this.getActivePlayer(s?.room, playerId), s?.room.phase, cellIndex, s?.registry, s?.propertyStates, s?.room); }
  handleUpgrade(roomCode: string, playerId: string, cellIndex: number) { const s = this.getSession(roomCode); return handleUpgrade(this.getActivePlayer(s?.room, playerId), s?.room.phase, cellIndex, s?.registry, s?.propertyStates, s?.room.activeModifiers, s?.room); }
  handleHoseInvest(roomCode: string, playerId: string, stake: number) { const s = this.getSession(roomCode); return handleHoseInvest(s?.room, this.getActivePlayer(s?.room, playerId), this.rng, stake); }
  handleHoseSkip(roomCode: string, playerId: string) { const s = this.getSession(roomCode); return handleHoseSkip(s?.room, this.getActivePlayer(s?.room, playerId)); }
  handlePlayerIntent(roomCode: string, playerId: string, intent: PlayerIntent) { this.touchActivity(roomCode); return dispatchPlayerIntent(this, roomCode, playerId, intent); }
  handleMortgage(roomCode: string, playerId: string, cellIndex: number) { return coordMortgage(this.getContext(roomCode), playerId, cellIndex); }
  handleRedeem(roomCode: string, playerId: string, cellIndex: number) { return coordRedeem(this.getContext(roomCode), playerId, cellIndex); }
  handleDowngrade(roomCode: string, playerId: string, cellIndex: number, options?: import('../domain/property_upgrade.js').DowngradeOptions) { const ctx = this.getContext(roomCode); return coordDowngrade(ctx, this.getActivePlayer(ctx?.room, playerId), cellIndex, roomCode, options); }
  handleLiquidate(roomCode: string, playerId: string) { return coordLiquidate(this.getContext(roomCode), playerId, this.auctions, roomCode); }
  handleRespondTradeOffer(roomCode: string, playerId: string, offerId: string, accept: boolean) { return coordRespondTradeOffer(this.getContext(roomCode), playerId, offerId, accept); }
  hasPendingTrade(roomCode: string): boolean { return pendingTradeManager.hasSession(roomCode); }
  getPendingTrade(roomCode: string): PendingTradeSession | undefined { return pendingTradeManager.getSession(roomCode); }
  hasPendingBuyout(roomCode: string): boolean { return Boolean(this.getRoom(roomCode)?.pendingBuyout); }
  getPendingBuyout(roomCode: string): PendingBuyoutSession | undefined { return this.getRoom(roomCode)?.pendingBuyout ?? undefined; }
  executeCompulsoryBuyout(roomCode: string, playerId: string, cellIndex: number) { this.touchActivity(roomCode); return coordExecuteCompulsoryBuyout(this.getContext(roomCode), playerId, cellIndex); }
  declineCompulsoryBuyout(roomCode: string, playerId: string) { this.touchActivity(roomCode); return coordDeclineCompulsoryBuyout(this.getContext(roomCode), playerId); }
  handleBankruptcy(roomCode: string, playerId: string, creditorId?: string) { this.touchActivity(roomCode); return coordBankruptcy(this.getContext(roomCode), playerId, creditorId, this.auctions, roomCode, this.rolledThisTurn); }

  handleTradeOffer(
    roomCode: string,
    arg2: string,
    arg3: string,
    arg4: string | number,
    arg5?: number,
    arg6?: number,
    arg7?: number,
  ): { success: boolean; reason?: string; pending?: boolean; offerId?: string } {
    const isNum = typeof arg4 === 'number';
    return coordTrade(this.getContext(roomCode), arg2, isNum ? arg2 : arg3, isNum ? arg3 : arg4, isNum ? arg4 : arg5!, (isNum ? arg5 : arg6) ?? 0, isNum ? arg6 : arg7);
  }

  checkPendingTradeTimeout(roomCode: string, currentTime?: number): { timeout: boolean; session?: PendingTradeSession } {
    const res = pendingTradeManager.checkTimeout(roomCode, currentTime);
    if (res.timeout && res.session) {
      const room = this.getRoom(roomCode);
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
      const room = this.getRoom(roomCode);
      if (room) room.pendingTradeOffer = null;
    }
    return cancelled;
  }

  checkPendingBuyoutTimeout(roomCode: string, currentTime?: number): { timeout: boolean; session?: PendingBuyoutSession } {
    const room = this.getRoom(roomCode);
    if (!room?.pendingBuyout) return { timeout: false };
    const now = currentTime ?? Date.now();
    if (now >= room.pendingBuyout.expiresAt) {
      const session = room.pendingBuyout;
      room.pendingBuyout = null;
      return { timeout: true, session };
    }
    return { timeout: false, session: room.pendingBuyout };
  }

  handleEndTurn(roomCode: string, playerId: string, continueDoubles?: boolean): Room | undefined {
    const session = this.getSession(roomCode);
    if (!session) return undefined;
    const current = this.getActivePlayer(session.room, playerId);
    if (!current) return undefined;
    if (!session.rolledThisTurn && session.room.phase === TurnPhase.WaitingRoll && (current.auditTurnsLeft ?? 0) <= 0) {
      return undefined;
    }
    if (session.room.pendingTradeOffer) {
      const p = session.room.pendingTradeOffer;
      if (p.sellerId === playerId || p.buyerId === playerId) {
        this.cancelPendingTrade(session.roomCode, playerId);
      }
    }
    const res = doHandleEndTurnSession(session, playerId, continueDoubles, this.deckRng, (rc) => this.touchActivity(rc));
    this.syncAuction(session.roomCode);
    return res;
  }

  resolveAuctionBots(roomCode: string): void { coordResolveAuctionBots(this, roomCode); }
  runBotTurn(roomCode: string): void { coordRunBotTurn(this, roomCode); }
  stepBotTurn(roomCode: string): boolean { return coordStepBotTurn(this, roomCode); }

  getRoom(roomCode: string): Room | undefined { return this.getSession(roomCode)?.room; }
  getRegistry(roomCode: string): PropertyRegistry | undefined { return this.getSession(roomCode)?.registry; }
  getPropertyStates(roomCode: string): PropertyStateMap | undefined { return this.getSession(roomCode)?.propertyStates; }
  getPropertyOwner(roomCode: string, cellIndex: number): string | undefined { return this.getSession(roomCode)?.registry.get(cellIndex); }
  getPropertyState(roomCode: string, cellIndex: number): PropertyState | undefined { return this.getSession(roomCode)?.propertyStates.get(cellIndex); }
  getPropertyRent(roomCode: string, cellIndex: number, diceTotal?: number): number { const s = this.getSession(roomCode); return calcPropertyRent(s?.registry, s?.propertyStates, cellIndex, diceTotal); }
  getRankings(roomCode: string): Array<{ id: string; netWorth: number }> { const ctx = this.getContext(roomCode); return ctx ? calcRankings(ctx.room, ctx.reg, ctx.sm) : []; }
  createDelta(roomCode: string, tick: number, timeRemaining?: number): DeltaPayload | undefined { const ctx = this.getContext(roomCode); return ctx ? buildRoomDelta(ctx.room, ctx.reg, ctx.sm, tick, this.auctions, timeRemaining, this.lastAuctionResults) : undefined; }
  registerTimer(roomCode: string, timer: NodeJS.Timeout): void { this.getSession(roomCode)?.registerTimer(timer); }
  clearRoomTimers(roomCode: string): void { this.getSession(roomCode)?.clearTimers(); }
  getActiveTimers(roomCode: string): Set<NodeJS.Timeout> | undefined { return this.getSession(roomCode)?.activeTimers; }
  touchActivity(roomCode: string, timestamp: number = Date.now()): void { this.getSession(roomCode)?.touchActivity(timestamp); }
  getLastActivity(roomCode: string): number | undefined { return this.getSession(roomCode)?.lastActivity; }
  getAllRoomCodes(): string[] { return Array.from(this.sessions.keys()); }
  getRoomCount(): number { return this.sessions.size; }
  hasRoom(roomCode: string): boolean { return Boolean(this.getSession(roomCode)); }
  onCloseRoom(hook: (roomCode: string, room: Room) => void): () => void { return doOnCloseRoom(this.closeHooks, hook); }

  closeRoom(roomCode: string): boolean {
    const session = this.getSession(roomCode);
    if (!session) return false;
    for (const hook of this.closeHooks) {
      try {
        hook(session.roomCode, session.room);
      } catch (err) {
        console.error('[RoomManager.closeRoom] Error executing closeHook:', err);
      }
    }
    pendingTradeManager.clearSession(session.roomCode);
    session.destroy();
    this.sessions.delete(session.roomCode);
    if (roomCode) {
      this.sessions.delete(roomCode);
      this.sessions.delete(roomCode.toUpperCase());
      this.sessions.delete(roomCode.toLowerCase());
    }
    return true;
  }

  handleIssueBond(rc: string, p: string) { const s = this.getSession(rc); return s ? handleIssueBond(s.room, p, s.registry, s.propertyStates) : { success: false, reason: 'INVALID_ROOM' }; }
  handleRepayBond(rc: string, p: string) { const s = this.getSession(rc); return s ? handleRepayBond(s.room, p) : { success: false, reason: 'INVALID_ROOM' }; }
}
