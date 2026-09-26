import type { Room, EventCardInfo, HoseResultInfo, MarketModifier, PendingBuyoutSession, BondContract } from '../domain/room';
import { BOARD_SIZE, TurnPhase } from '../domain/room';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager';
import type { AuctionSession } from './auction_manager';
import { pendingTradeManager } from './pending_trade_manager.js';
import type { ChanceCardId } from '../domain/event_card_engine.js';

export const HEARTBEAT_INTERVAL_MS = 5_000;
export const GRACE_PERIOD_MS       = 60_000;

export enum SessionState {
  Connected    = 'Connected',
  GracePeriod  = 'GracePeriod',
  Disconnected = 'Disconnected',
}

export interface Session {
  readonly id: string;
  state:       SessionState;
  lastPongAt:  number;
}

export interface CellDelta {
  readonly index: number; readonly ownerId?: string | null; readonly level?: number;
  readonly isETC?: boolean; readonly isMortgaged?: boolean; readonly unbuiltRounds?: number;
}

export interface DiplomaticEventDelta {
  readonly playerId: string; readonly landlordId: string; readonly cellIndex: number; readonly savedRent: number;
}

export interface PlayerDelta {
  readonly id: string; readonly position: number; readonly balance: number;
  readonly bankrupt?: boolean; readonly isBot?: boolean; readonly overdraftRoundsLeft?: number;
  readonly inAudit?: boolean; readonly auditTurnsLeft?: number; readonly skipNextTurn?: boolean;
  readonly consecutiveDoubles?: number; readonly extraTurns?: number;
  readonly bondContract?: BondContract | null; readonly hand?: readonly ChanceCardId[];
}

export interface AuctionPayload {
  readonly cellIndex: number;
  readonly currentBid: number;
  readonly highestBidderId: string | null;
  readonly timeRemaining: number;
  readonly declinedPlayerId?: string;
  readonly hasPassed?: boolean;
  readonly passedPlayerIds?: readonly string[];
  readonly insolvencyPlayerId?: string;
  readonly isForeclosure?: boolean;
  readonly startingBid?: number;
  readonly isFireSale?: boolean;
  isConcluded?: boolean;
  winnerId?: string | null;
  finalPrice?: number;
}

export type AuctionDelta = AuctionPayload;

export interface PendingTradeOfferDelta {
  readonly offerId: string;
  readonly cellIndex: number;
  readonly price: number;
  readonly buyerId: string;
  readonly sellerId: string;
  readonly expiresAt: number;
  readonly offeredCellIndex?: number;
  readonly requesterId?: string;
  readonly targetPlayerId?: string;
}

export interface DeltaPayload {
  readonly roomCode?:            string;
  readonly tick:                 number;
  readonly cells:                ReadonlyArray<CellDelta>;
  readonly players?:             ReadonlyArray<PlayerDelta>;
  readonly currentPlayerIndex?:  number;
  readonly currentTurnPlayerId?: string;
  readonly dice?:                readonly [number, number];
  readonly diceRollerId?:        string;
  readonly diceSeq?:             number;
  readonly auction?:             AuctionPayload | null;
  readonly pendingTradeOffer?:   PendingTradeOfferDelta | null;
  readonly pendingBuyout?:       PendingBuyoutSession | null;
  readonly roomStarted?:         boolean;
  readonly turnPhase?:           TurnPhase;
  readonly timeRemaining?:       number;
  readonly lastEventCard?:       EventCardInfo | null;
  readonly lastHoseResult?:      HoseResultInfo | null;
  readonly roundNumber?:         number;
  readonly treasury?:            number;
  readonly activeModifiers?:     ReadonlyArray<MarketModifier>;
  readonly lastDiplomaticEvent?:  DiplomaticEventDelta | null;
}

function buildAuctionDelta(
  room: Room,
  auctions?: Map<string, AuctionSession>,
  lastAuctionResults?: Map<string, { cellIndex: number; winnerId?: string | null; winningBid: number; isForeclosure?: boolean; finalPrice?: number }>,
): AuctionPayload | null | undefined {
  if (room.phase === TurnPhase.AuctionPhase && auctions) {
    const session = auctions.get(room.roomCode);
    if (session) {
      const timeRemaining = session.endTime
        ? Math.max(0, Math.ceil((session.endTime - Date.now()) / 1000))
        : 0;
      return {
        cellIndex: session.cellIndex,
        currentBid: session.highestBid,
        startingBid: session.startingBid,
        highestBidderId: session.highestBidder ?? null,
        timeRemaining,
        declinedPlayerId: session.declinedPlayerId,
        ...(session.passedPlayers && session.passedPlayers.size > 0
          ? { passedPlayerIds: Array.from(session.passedPlayers) }
          : {}),
        ...(session.insolvencyPlayerId ? {
          insolvencyPlayerId: session.insolvencyPlayerId,
          isForeclosure: true,
        } : {}),
        isFireSale: session.isFireSale ?? false,
      };
    }
  } else {
    const lastRes = room.lastAuctionResult ?? lastAuctionResults?.get(room.roomCode);
    if (lastRes) {
      return {
        cellIndex: lastRes.cellIndex ?? 0,
        currentBid: lastRes.winningBid,
        startingBid: lastRes.winningBid,
        highestBidderId: lastRes.winnerId ?? null,
        timeRemaining: 0,
        isConcluded: true,
        winnerId: lastRes.winnerId ?? null,
        finalPrice: lastRes.finalPrice ?? lastRes.winningBid,
        ...(lastRes.isForeclosure ? { isForeclosure: true } : {}),
      };
    } else if (auctions) {
      return null;
    }
  }
  return undefined;
}

export function buildDeltaFromRoom(
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  tick: number,
  auctions?: Map<string, AuctionSession>,
  timeRemaining?: number,
  lastAuctionResults?: Map<string, { cellIndex: number; winnerId?: string | null; winningBid: number; isForeclosure?: boolean; finalPrice?: number }>,
): DeltaPayload {
  const mortgagedSet = new Set<number>();
  for (const player of room.players) {
    for (const cellIndex of player.mortgagedProperties ?? []) {
      mortgagedSet.add(cellIndex);
    }
  }

  const cells: CellDelta[] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const state = stateMap.get(i);
    cells.push({
      index: i,
      ownerId: registry.get(i) ?? null,
      ...(state?.level !== undefined ? { level: state.level } : {}),
      ...(state?.isETC ? { isETC: true } : {}),
      ...(mortgagedSet.has(i) ? { isMortgaged: true } : {}),
      ...(state?.unbuiltRounds ? { unbuiltRounds: state.unbuiltRounds } : {}),
    });
  }

  const players: PlayerDelta[] = room.players.map((p) => ({
    id: p.id,
    position: p.position,
    balance: p.balance,
    bondContract: p.bondContract ?? null,
    hand: p.hand ?? [],
    ...(p.bankrupt ? { bankrupt: true } : {}),
    ...(p.isBot ? { isBot: true } : {}),
    ...(p.overdraftRoundsLeft ? { overdraftRoundsLeft: p.overdraftRoundsLeft } : {}),
    ...(p.auditTurnsLeft > 0 ? { inAudit: true } : { inAudit: false }),
    ...(p.auditTurnsLeft !== undefined ? { auditTurnsLeft: p.auditTurnsLeft } : {}),
    ...(p.skipNextTurn !== undefined ? { skipNextTurn: p.skipNextTurn } : {}),
    ...(p.consecutiveDoubles !== undefined ? { consecutiveDoubles: p.consecutiveDoubles } : {}),
    ...(p.extraTurns !== undefined ? { extraTurns: p.extraTurns } : {}),
  }));

  const auction = buildAuctionDelta(room, auctions, lastAuctionResults);

  let pendingTradeOffer: PendingTradeOfferDelta | null | undefined = undefined;
  const pendingSession = pendingTradeManager.getSession(room.roomCode);
  if (pendingSession && pendingSession.status === 'pending') {
    pendingTradeOffer = {
      offerId: pendingSession.offerId,
      cellIndex: pendingSession.cellIndex,
      price: pendingSession.price,
      buyerId: pendingSession.buyerId,
      sellerId: pendingSession.sellerId,
      expiresAt: pendingSession.expiresAt,
      ...(pendingSession.offeredCellIndex !== undefined ? { offeredCellIndex: pendingSession.offeredCellIndex } : {}),
      ...(pendingSession.targetPlayerId !== undefined ? { targetPlayerId: pendingSession.targetPlayerId } : {}),
      ...(room.pendingTradeOffer?.requesterId !== undefined ? { requesterId: room.pendingTradeOffer.requesterId } : {}),
    };
  } else if (room.pendingTradeOffer) {
    pendingTradeOffer = room.pendingTradeOffer;
  } else {
    pendingTradeOffer = null;
  }

  let pendingBuyout: PendingBuyoutSession | null | undefined = undefined;
  if (room.pendingBuyout) {
    pendingBuyout = { ...room.pendingBuyout };
  } else if (room.pendingBuyout === null) {
    pendingBuyout = null;
  }

  const currentTurnPlayer = room.players[room.currentPlayerIndex];
  return buildDeltaPayload({
    tick,
    cells,
    players,
    currentPlayerIndex: room.currentPlayerIndex,
    currentTurnPlayerId: currentTurnPlayer?.id,
    dice: room.lastDice,
    ...(room.lastDiceRollerId !== undefined ? { diceRollerId: room.lastDiceRollerId } : {}),
    ...(room.diceSeq !== undefined ? { diceSeq: room.diceSeq } : {}),
    roomStarted: room.started,
    turnPhase: room.phase,
    ...(timeRemaining !== undefined ? { timeRemaining } : {}),
    ...(auction !== undefined ? { auction } : {}),
    ...(pendingTradeOffer !== undefined ? { pendingTradeOffer } : {}),
    ...(pendingBuyout !== undefined ? { pendingBuyout } : {}),
    ...(room.lastEventCard !== undefined ? { lastEventCard: room.lastEventCard } : {}),
    lastHoseResult: room.lastHoseResult ?? null,
    roundNumber: Math.max(room.roundCount ?? 1, room.round ?? 1),
    treasury: room.treasury ?? 0,
    ...(room.activeModifiers !== undefined ? { activeModifiers: room.activeModifiers.map((m) => ({ ...m })) } : {}),
    lastDiplomaticEvent: room.lastDiplomaticEvent ?? null,
  });
}

export interface DeltaPayloadOptions {
  tick: number;
  cells: ReadonlyArray<CellDelta>;
  players?: ReadonlyArray<PlayerDelta>;
  currentPlayerIndex?: number;
  currentTurnPlayerId?: string;
  dice?: readonly [number, number];
  diceRollerId?: string;
  diceSeq?: number;
  auction?: AuctionPayload | null;
  pendingTradeOffer?: PendingTradeOfferDelta | null;
  pendingBuyout?: PendingBuyoutSession | null;
  roomStarted?: boolean;
  turnPhase?: TurnPhase;
  timeRemaining?: number;
  lastEventCard?: EventCardInfo | null;
  lastHoseResult?: HoseResultInfo | null;
  roundNumber?: number;
  treasury?: number;
  activeModifiers?: ReadonlyArray<MarketModifier>;
  lastDiplomaticEvent?: DiplomaticEventDelta | null;
}

export function buildDeltaPayload(options: DeltaPayloadOptions): DeltaPayload;
export function buildDeltaPayload(options: {
  tick: number;
  room: Room;
  registry: PropertyRegistry;
  stateMap: PropertyStateMap;
  auctions?: Map<string, AuctionSession>;
}): DeltaPayload;
export function buildDeltaPayload(
  tick: number,
  cells?: ReadonlyArray<CellDelta>,
  players?: ReadonlyArray<PlayerDelta>,
): DeltaPayload;
export function buildDeltaPayload(
  tickOrOptions:
    | number
    | DeltaPayloadOptions
    | { tick: number; room: Room; registry: PropertyRegistry; stateMap: PropertyStateMap; auctions?: Map<string, AuctionSession>; lastAuctionResults?: Map<string, { cellIndex: number; winnerId?: string | null; winningBid: number; isForeclosure?: boolean; finalPrice?: number }> },
  cells?: ReadonlyArray<CellDelta>,
  players?: ReadonlyArray<PlayerDelta>,
): DeltaPayload {
  if (typeof tickOrOptions === 'object') {
    if ('room' in tickOrOptions) {
      return buildDeltaFromRoom(
        tickOrOptions.room,
        tickOrOptions.registry,
        tickOrOptions.stateMap,
        tickOrOptions.tick,
        tickOrOptions.auctions,
        undefined,
        tickOrOptions.lastAuctionResults,
      );
    }
    return {
      tick: tickOrOptions.tick,
      cells: tickOrOptions.cells.map((c) => ({ ...c })),
      ...(tickOrOptions.players !== undefined ? { players: tickOrOptions.players.map((p) => ({ ...p })) } : {}),
      ...(tickOrOptions.currentPlayerIndex !== undefined ? { currentPlayerIndex: tickOrOptions.currentPlayerIndex } : {}),
      ...(tickOrOptions.currentTurnPlayerId !== undefined ? { currentTurnPlayerId: tickOrOptions.currentTurnPlayerId } : {}),
      ...(tickOrOptions.dice !== undefined ? { dice: tickOrOptions.dice } : {}),
      ...(tickOrOptions.diceRollerId !== undefined ? { diceRollerId: tickOrOptions.diceRollerId } : {}),
      ...(tickOrOptions.diceSeq !== undefined ? { diceSeq: tickOrOptions.diceSeq } : {}),
      ...(tickOrOptions.auction !== undefined ? { auction: tickOrOptions.auction } : {}),
      ...(tickOrOptions.pendingTradeOffer !== undefined ? { pendingTradeOffer: tickOrOptions.pendingTradeOffer } : {}),
      ...(tickOrOptions.pendingBuyout !== undefined ? { pendingBuyout: tickOrOptions.pendingBuyout } : {}),
      ...(tickOrOptions.roomStarted !== undefined ? { roomStarted: tickOrOptions.roomStarted } : {}),
      ...(tickOrOptions.turnPhase !== undefined ? { turnPhase: tickOrOptions.turnPhase } : {}),
      ...(tickOrOptions.timeRemaining !== undefined ? { timeRemaining: tickOrOptions.timeRemaining } : {}),
      ...(tickOrOptions.lastEventCard !== undefined ? { lastEventCard: tickOrOptions.lastEventCard } : {}),
      ...(tickOrOptions.lastHoseResult !== undefined ? { lastHoseResult: tickOrOptions.lastHoseResult } : {}),
      ...(tickOrOptions.roundNumber !== undefined ? { roundNumber: tickOrOptions.roundNumber } : {}),
      ...(tickOrOptions.treasury !== undefined ? { treasury: tickOrOptions.treasury } : {}),
      ...(tickOrOptions.activeModifiers !== undefined ? { activeModifiers: tickOrOptions.activeModifiers.map((m) => ({ ...m })) } : {}),
      ...(tickOrOptions.lastDiplomaticEvent !== undefined ? { lastDiplomaticEvent: tickOrOptions.lastDiplomaticEvent } : {}),
    };
  }
  return {
    tick: tickOrOptions,
    cells: (cells ?? []).map((c) => ({ ...c })),
    ...(players !== undefined ? { players: players.map((p) => ({ ...p })) } : {}),
  };
}


export class SessionManager {
  private readonly sessions = new Map<string, Session>();
  private lastDelta: DeltaPayload | undefined = undefined;

  addSession(id: string): Session {
    const session: Session = {
      id,
      state:      SessionState.Connected,
      lastPongAt: Date.now(),
    };
    this.sessions.set(id, session);
    return session;
  }

  removeSession(id: string): void {
    this.sessions.delete(id);
  }

  handlePong(id: string): void {
    const session = this.sessions.get(id);
    if (session === undefined) return;
    session.state      = SessionState.Connected;
    session.lastPongAt = Date.now();
  }

  checkHeartbeats(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      const elapsed = now - session.lastPongAt;
      if (elapsed > GRACE_PERIOD_MS) {
        session.state = SessionState.Disconnected;
        this.sessions.delete(id);
      } else if (elapsed > HEARTBEAT_INTERVAL_MS) {
        session.state = SessionState.GracePeriod;
      }
    }
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  broadcastDelta(payload: DeltaPayload): void {
    this.lastDelta = {
      tick: payload.tick,
      cells: payload.cells.map((c) => ({ ...c })),
      ...(payload.players !== undefined ? { players: payload.players.map((p) => ({ ...p })) } : {}),
      ...(payload.currentPlayerIndex !== undefined ? { currentPlayerIndex: payload.currentPlayerIndex } : {}),
      ...(payload.currentTurnPlayerId !== undefined ? { currentTurnPlayerId: payload.currentTurnPlayerId } : {}),
      ...(payload.dice !== undefined ? { dice: payload.dice } : {}),
      ...(payload.diceRollerId !== undefined ? { diceRollerId: payload.diceRollerId } : {}),
      ...(payload.diceSeq !== undefined ? { diceSeq: payload.diceSeq } : {}),
      ...(payload.auction !== undefined ? { auction: payload.auction } : {}),
      ...(payload.roomStarted !== undefined ? { roomStarted: payload.roomStarted } : {}),
      ...(payload.turnPhase !== undefined ? { turnPhase: payload.turnPhase } : {}),
      ...(payload.timeRemaining !== undefined ? { timeRemaining: payload.timeRemaining } : {}),
      ...(payload.lastEventCard !== undefined ? { lastEventCard: payload.lastEventCard } : {}),
      ...(payload.lastHoseResult !== undefined ? { lastHoseResult: payload.lastHoseResult } : {}),
      ...(payload.roundNumber !== undefined ? { roundNumber: payload.roundNumber } : {}),
      ...(payload.treasury !== undefined ? { treasury: payload.treasury } : {}),
      ...(payload.activeModifiers !== undefined ? { activeModifiers: payload.activeModifiers } : {}),
      ...(payload.pendingBuyout !== undefined ? { pendingBuyout: payload.pendingBuyout } : {}),
      ...(payload.pendingTradeOffer !== undefined ? { pendingTradeOffer: payload.pendingTradeOffer } : {}),
      ...(payload.lastDiplomaticEvent !== undefined ? { lastDiplomaticEvent: payload.lastDiplomaticEvent } : {}),
    };
  }

  getLastDelta(): DeltaPayload | undefined { return this.lastDelta; }
}
