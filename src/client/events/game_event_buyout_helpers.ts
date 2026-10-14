// [IMP-380] Game Event Buyout Helpers — Dedicated compulsory buyout M&A event synthesis
import type { GameState } from '../store/game_store.js';
import type { DeltaPayload } from '../../domain/protocol/index.js';
import {
  type CompulsoryBuyoutEvent,
  SynthesizedGameEventType,
} from './game_event_types.js';
import { PROPERTY_DEEDS } from '../../domain/property_data.js';
import {
  type InternalBalanceDelta,
  deductInflowFromDeltas,
} from './game_event_financial_helpers.js';

function applyBuyoutSettlement(
  buyerId: string,
  sellerId: string,
  cellIndex: number,
  cost: number,
  basePrice: number,
  premiumRatio: number,
  timestamp: number,
  prevState: GameState,
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
): CompulsoryBuyoutEvent {
  const buyerIdx = payers.findIndex((py) => py.id === buyerId);
  if (buyerIdx !== -1) {
    payers[buyerIdx]!.diff += cost;
    if (payers[buyerIdx]!.diff === 0) payers.splice(buyerIdx, 1);
  }
  if (sellerId) deductInflowFromDeltas(sellerId, cost, undefined, prevState.playersInfo[sellerId], payers, receivers);
  return {
    type: SynthesizedGameEventType.COMPULSORY_BUYOUT,
    timestamp,
    buyerId,
    sellerId,
    cellIndex,
    cost,
    basePrice,
    premiumRatio,
  };
}

export function extractCompulsoryBuyoutEvents(
  delta: DeltaPayload,
  prevState: GameState,
  nextState: GameState,
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
  timestamp: number,
): CompulsoryBuyoutEvent[] {
  if (prevState.pendingBuyout) {
    const s = prevState.pendingBuyout;
    const target = s.eligibleTargets?.find((t) => delta.cells?.some((c) => c.index === t.cellIndex && c.ownerId === s.buyerId)) ?? s;
    const cellTransferred = (delta.cells?.some((c) => c.index === target.cellIndex && c.ownerId === s.buyerId) ?? false) ||
      (nextState.playersInfo[s.buyerId]?.ownedProperties?.includes(target.cellIndex) ?? false);
    if (cellTransferred) {
      const basePrice = PROPERTY_DEEDS.get(target.cellIndex)?.price ?? s.basePrice ?? 1000;
      return [applyBuyoutSettlement(s.buyerId, target.sellerId, target.cellIndex, target.cost, basePrice, 1.3, timestamp, prevState, payers, receivers)];
    }
  }

  const isMaCard = delta.lastEventCard?.cardId === 'CC_MA_FORCE' || delta.lastEventCard?.id === 'CC_MA_FORCE';
  if (isMaCard) {
    const card = delta.lastEventCard!;
    const buyerId = card.drawnBy ?? card.playerId ?? '';
    const transferredCell = delta.cells?.find((c) => c.ownerId === buyerId);
    if (transferredCell && buyerId) {
      const basePrice = PROPERTY_DEEDS.get(transferredCell.index)?.price ?? 1000;
      const prevOwnerId = Object.keys(prevState.playersInfo).find((id) =>
        prevState.playersInfo[id]?.ownedProperties?.includes(transferredCell.index),
      ) ?? '';
      return [applyBuyoutSettlement(buyerId, prevOwnerId, transferredCell.index, Math.floor(basePrice * 1.2), basePrice, 1.2, timestamp, prevState, payers, receivers)];
    }
  }

  return [];
}
