// [IMP-331] Property, Auction & Trade Event Synthesizer
// Pure, deterministic domain module for synthesizing property ownership, upgrade, trade, and auction events
import type { GameState } from '../store/game_store.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import {
  type SynthesizedGameEvent,
  type SynthesizerOptions,
  SynthesizedGameEventType,
  type TradeCompletedEvent,
  type AuctionWonEvent,
  type AuctionBidPlacedEvent,
  type PropertyBoughtEvent,
  type PropertyUpgradedEvent,
  type PropertyMortgagedEvent,
  type PropertyUnmortgagedEvent,
} from './game_event_types.js';
import { PROPERTY_DEEDS } from '../../domain/property_data.js';
import { calculateUpgradeCost } from '../../domain/property_upgrade.js';

function extractTradeEvents(
  delta: DeltaPayload,
  timestamp: number,
  handledTradeCells: Set<number>,
): TradeCompletedEvent[] {
  if (!delta.lastTradeResult) return [];
  const trade = delta.lastTradeResult;
  handledTradeCells.add(trade.cellIndex);
  if (trade.offeredCellIndex !== undefined) {
    handledTradeCells.add(trade.offeredCellIndex);
  }
  return [{
    type: SynthesizedGameEventType.TRADE_COMPLETED,
    timestamp: trade.timestamp ?? timestamp,
    sellerId: trade.sellerId,
    buyerId: trade.buyerId,
    cellIndex: trade.cellIndex,
    ...(trade.offeredCellIndex !== undefined ? { offeredCellIndex: trade.offeredCellIndex } : {}),
    price: trade.price,
    taxAmount: trade.taxAmount ?? 0,
  }];
}

function extractAuctionEvents(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  timestamp: number,
  handledAuctionCells: Set<number>,
): Array<AuctionWonEvent | AuctionBidPlacedEvent> {
  const events: Array<AuctionWonEvent | AuctionBidPlacedEvent> = [];
  const isAuctionConcluded = Boolean(delta.auction?.isConcluded || delta.auction?.winnerId !== undefined);

  if (isAuctionConcluded && delta.auction) {
    const cellIndex = delta.auction.cellIndex ?? prevState.auction?.cellIndex ?? 0;
    const winnerId = delta.auction.winnerId ?? delta.auction.highestBidderId ?? '';
    const winningBid = delta.auction.finalPrice ?? delta.auction.currentBid ?? 0;
    if (winnerId) {
      handledAuctionCells.add(cellIndex);
      events.push({
        type: SynthesizedGameEventType.AUCTION_WON,
        timestamp,
        cellIndex,
        winnerId,
        winningBid,
      });
    }
  } else if (delta.auction === null && prevState.auction?.highestBidderId && nextState.auction === null) {
    const cellIndex = prevState.auction.cellIndex;
    const winnerId = prevState.auction.highestBidderId;
    const winningBid = prevState.auction.currentBid ?? 0;
    handledAuctionCells.add(cellIndex);
    events.push({
      type: SynthesizedGameEventType.AUCTION_WON,
      timestamp,
      cellIndex,
      winnerId,
      winningBid,
    });
  } else if (delta.auction && !isAuctionConcluded) {
    const { cellIndex, currentBid, highestBidderId } = delta.auction;
    const prevAuct = prevState.auction;
    const isNewBid = Boolean(
      highestBidderId &&
      (!prevAuct ||
        prevAuct.cellIndex !== cellIndex ||
        currentBid > (prevAuct.currentBid ?? 0) ||
        highestBidderId !== prevAuct.highestBidderId),
    );
    if (isNewBid && highestBidderId) {
      events.push({
        type: SynthesizedGameEventType.AUCTION_BID_PLACED,
        timestamp,
        cellIndex,
        bidderId: highestBidderId,
        bidAmount: currentBid,
      });
    }
  }

  return events;
}

function extractCellEvents(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  timestamp: number,
  handledAuctionCells: Set<number>,
  handledTradeCells: Set<number>,
): Array<PropertyBoughtEvent | PropertyUpgradedEvent | PropertyMortgagedEvent | PropertyUnmortgagedEvent> {
  const events: Array<PropertyBoughtEvent | PropertyUpgradedEvent | PropertyMortgagedEvent | PropertyUnmortgagedEvent> = [];

  for (const cell of delta.cells ?? []) {
    const prevOwnerId = Object.keys(prevState.playersInfo).find((id) =>
      prevState.playersInfo[id]?.ownedProperties?.includes(cell.index),
    );

    // Upgrade detection
    const prevLevel = prevState.levelMap?.[cell.index] ?? 0;
    if (cell.level !== undefined && cell.level > prevLevel) {
      const targetLevel = cell.level as 1 | 2 | 3;
      const ownerId = cell.ownerId ?? Object.keys(nextState.playersInfo).find((id) =>
        nextState.playersInfo[id]?.ownedProperties?.includes(cell.index),
      ) ?? prevOwnerId ?? '';
      const cost = calculateUpgradeCost(cell.index, targetLevel - 1, nextState.activeModifiers);
      events.push({
        type: SynthesizedGameEventType.PROPERTY_UPGRADED,
        timestamp,
        cellIndex: cell.index,
        ownerId,
        targetLevel,
        cost,
      });
    }

    // Mortgage / Unmortgage detection
    const wasMortgaged = prevOwnerId
      ? (prevState.playersInfo[prevOwnerId]?.mortgagedProperties?.includes(cell.index) ?? false)
      : false;
    if (cell.isMortgaged !== undefined && cell.isMortgaged !== wasMortgaged) {
      if (cell.isMortgaged) {
        const ownerId = cell.ownerId ?? prevOwnerId ?? '';
        const deed = PROPERTY_DEEDS.get(cell.index);
        const loanAmount = deed ? Math.floor(deed.price / 2) : 0;
        events.push({
          type: SynthesizedGameEventType.PROPERTY_MORTGAGED,
          timestamp,
          cellIndex: cell.index,
          ownerId,
          loanAmount,
        });
      } else {
        const currentOwnerId = cell.ownerId ?? Object.keys(nextState.playersInfo).find((id) =>
          nextState.playersInfo[id]?.ownedProperties?.includes(cell.index),
        );
        const isOwnerChanged = prevOwnerId !== undefined && currentOwnerId !== undefined && prevOwnerId !== currentOwnerId;
        if (!isOwnerChanged && currentOwnerId) {
          const deed = PROPERTY_DEEDS.get(cell.index);
          const cost = deed ? Math.floor(deed.price * 0.55) : 0;
          events.push({
            type: SynthesizedGameEventType.PROPERTY_UNMORTGAGED,
            timestamp,
            cellIndex: cell.index,
            ownerId: currentOwnerId,
            cost,
          });
        }
      }
    }

    // Direct / Transfer purchase detection
    const isOwnerTransferred = cell.ownerId !== undefined && cell.ownerId !== prevOwnerId;
    const isSuppressedByAuction = handledAuctionCells.has(cell.index);
    const isSuppressedByTrade = handledTradeCells.has(cell.index);
    const isBuyoutCard = delta.lastEventCard?.cardId === 'CC_MA_FORCE' || delta.lastEventCard?.cardId === 'CC_SWAP_PROJECT';

    if (isOwnerTransferred && !isSuppressedByAuction && !isSuppressedByTrade && !isBuyoutCard && cell.ownerId) {
      const price = PROPERTY_DEEDS.get(cell.index)?.price ?? 0;
      events.push({
        type: SynthesizedGameEventType.PROPERTY_BOUGHT,
        timestamp,
        cellIndex: cell.index,
        buyerId: cell.ownerId,
        price,
      });
    }
  }

  return events;
}

export function synthesizePropertyAndMarketEvents(
  prevState: GameState,
  nextState: GameState,
  delta: DeltaPayload,
  options?: SynthesizerOptions,
): readonly SynthesizedGameEvent[] {
  const timestamp = options?.baseTimestamp ?? delta.tick ?? 0;
  const handledAuctionCells = new Set<number>();
  const handledTradeCells = new Set<number>();

  const tradeEvents = extractTradeEvents(delta, timestamp, handledTradeCells);
  const auctionEvents = extractAuctionEvents(delta, prevState, nextState, timestamp, handledAuctionCells);
  const cellEvents = extractCellEvents(delta, prevState, nextState, timestamp, handledAuctionCells, handledTradeCells);

  return [...tradeEvents, ...auctionEvents, ...cellEvents];
}
