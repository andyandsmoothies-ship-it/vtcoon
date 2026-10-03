import {
  BOARD_SIZE,
  TurnPhase,
  type Room,
  type PendingBuyoutSession,
} from '../domain/room.js';
import type { AuctionSession } from './auction_manager.js';
import { pendingTradeManager, type PendingTradeManager } from './pending_trade_manager.js';
import type {
  CellDelta,
  PlayerDelta,
  AuctionPayload,
  PendingTradeOfferDelta,
  DeltaPayload,
  DeltaPayloadOptions,
  PropertyRegistry,
  PropertyStateMap,
} from './delta_types.js';

export * from './delta_types.js';

export function buildAuctionDelta(
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

function buildCellsDelta(
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  mortgagedSet: ReadonlySet<number>,
): CellDelta[] {
  const cells: CellDelta[] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const state = stateMap.get(i);
    cells.push({
      index: i,
      ownerId: registry.get(i) ?? null,
      level: (state?.level ?? 0) as 0 | 1 | 2 | 3,
      ...(state?.isETC ? { isETC: true } : {}),
      ...(state?.isUpgradedUtility ? { isUpgradedUtility: true } : {}),
      ...(mortgagedSet.has(i) ? { isMortgaged: true } : {}),
      ...(state?.unbuiltRounds ? { unbuiltRounds: state.unbuiltRounds } : {}),
    });
  }
  return cells;
}

function buildPlayersDelta(
  players: readonly Room['players'][number][],
): PlayerDelta[] {
  return players.map((p) => ({
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
    ...(p.auditCount !== undefined ? { auditCount: p.auditCount } : {}),
    ...(p.skipNextTurn !== undefined ? { skipNextTurn: p.skipNextTurn } : {}),
    ...(p.consecutiveDoubles !== undefined ? { consecutiveDoubles: p.consecutiveDoubles } : {}),
    ...(p.extraTurns !== undefined ? { extraTurns: p.extraTurns } : {}),
  }));
}

function buildPendingTradeOfferDelta(
  room: Room,
  tradeManager: PendingTradeManager,
): PendingTradeOfferDelta | null | undefined {
  const pendingSession = tradeManager.getSession(room.roomCode);
  if (pendingSession && pendingSession.status === 'pending') {
    return {
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
  }
  if (room.pendingTradeOffer) {
    return room.pendingTradeOffer;
  }
  return null;
}

function buildPendingBuyoutDelta(room: Room): PendingBuyoutSession | null | undefined {
  if (room.pendingBuyout) {
    return { ...room.pendingBuyout };
  }
  if (room.pendingBuyout === null) {
    return null;
  }
  return undefined;
}

export function buildDeltaFromRoom(
  room: Room,
  registry: PropertyRegistry = new Map(),
  stateMap: PropertyStateMap = new Map(),
  tick: number = 0,
  auctions?: Map<string, AuctionSession>,
  timeRemaining?: number,
  lastAuctionResults?: Map<string, { cellIndex: number; winnerId?: string | null; winningBid: number; isForeclosure?: boolean; finalPrice?: number }>,
  tradeManager: PendingTradeManager = pendingTradeManager,
): DeltaPayload {
  const mortgagedSet = new Set<number>();
  for (const player of room.players) {
    for (const cellIndex of player.mortgagedProperties ?? []) {
      mortgagedSet.add(cellIndex);
    }
  }

  const cells = buildCellsDelta(registry, stateMap, mortgagedSet);
  const players = buildPlayersDelta(room.players);
  const auction = buildAuctionDelta(room, auctions, lastAuctionResults);
  const pendingTradeOffer = buildPendingTradeOfferDelta(room, tradeManager);
  const pendingBuyout = buildPendingBuyoutDelta(room);

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
    ...(room.passedGoSalary !== undefined ? { passedGoSalary: room.passedGoSalary } : {}),
    pendingTransitWheel: room.pendingTransitWheel ?? null,
    lastTransitResult: room.lastTransitResult ?? null,
  });
}

export function buildDeltaPayload(options: DeltaPayloadOptions): DeltaPayload;
export function buildDeltaPayload(options: {
  tick: number;
  room: Room;
  registry: PropertyRegistry;
  stateMap: PropertyStateMap;
  auctions?: Map<string, AuctionSession>;
  lastAuctionResults?: Map<string, { cellIndex: number; winnerId?: string | null; winningBid: number; isForeclosure?: boolean; finalPrice?: number }>;
  tradeManager?: PendingTradeManager;
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
    | { tick: number; room: Room; registry: PropertyRegistry; stateMap: PropertyStateMap; auctions?: Map<string, AuctionSession>; lastAuctionResults?: Map<string, { cellIndex: number; winnerId?: string | null; winningBid: number; isForeclosure?: boolean; finalPrice?: number }>; tradeManager?: PendingTradeManager },
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
        tickOrOptions.tradeManager,
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
      ...(tickOrOptions.passedGoSalary !== undefined ? { passedGoSalary: tickOrOptions.passedGoSalary } : {}),
      ...(tickOrOptions.pendingTransitWheel !== undefined ? { pendingTransitWheel: tickOrOptions.pendingTransitWheel } : {}),
      ...(tickOrOptions.lastTransitResult !== undefined ? { lastTransitResult: tickOrOptions.lastTransitResult } : {}),
    };
  }
  return {
    tick: tickOrOptions,
    cells: (cells ?? []).map((c) => ({ ...c })),
    ...(players !== undefined ? { players: players.map((p) => ({ ...p })) } : {}),
  };
}
