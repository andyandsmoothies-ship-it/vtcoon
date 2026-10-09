// [IMP-334] Financial Synthesizer Helpers
// Pure deterministic helper functions for registry mapping, mortgage interest, and balance delta tracking
import type { PlayerHudInfo } from '../store/game_store.js';
import type { TradeResultInfo } from '../../server/session_manager.js';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../../domain/property_data.js';
import { MORTGAGE_DEFAULT_INTEREST_RATE, MORTGAGE_RATE_HIKE_INTEREST_RATE, MORTGAGE_LOAN_RATE } from '../../domain/mortgage_constants.js';

export interface InternalBalanceDelta {
  readonly id: string;
  diff: number;
  readonly cellIndex?: number;
  readonly prevP?: PlayerHudInfo;
  readonly hasPassedGo: boolean;
  readonly isSentToAudit: boolean;
}

export function buildRegistryAndStateMap(
  playersInfo: Record<string, PlayerHudInfo>,
  levelMap?: Record<number, number>,
): { registry: PropertyRegistry; stateMap: PropertyStateMap } {
  const registry: PropertyRegistry = new Map();
  const stateMap: PropertyStateMap = new Map();
  if (playersInfo) {
    for (const [id, info] of Object.entries(playersInfo)) {
      for (const cell of info?.ownedProperties ?? []) registry.set(cell, id);
    }
  }
  if (levelMap) {
    for (const [cellStr, lvl] of Object.entries(levelMap)) stateMap.set(Number(cellStr), { level: lvl });
  }
  return { registry, stateMap };
}

export function calculateMortgageInterest(
  prevP: PlayerHudInfo | undefined,
  activeMods: readonly { readonly type: string; readonly remainingRounds: number }[],
): number {
  const mortDebt = (prevP?.mortgagedProperties ?? []).reduce((sum, cell) => {
    const loan = prevP?.mortgageLoans?.[cell];
    if (loan !== undefined) return sum + loan;
    const deed = PROPERTY_DEEDS.get(cell);
    return sum + (deed ? Math.floor(deed.price * MORTGAGE_LOAN_RATE) : 0);
  }, 0);
  const isStimulus = activeMods.some((m) => m.type === 'MC_CREDIT_STIMULUS' && m.remainingRounds > 0);
  const isRateHike = activeMods.some((m) => m.type === 'MC_RATE_HIKE' && m.remainingRounds > 0);
  const mortRate = isStimulus ? 0 : (isRateHike ? MORTGAGE_RATE_HIKE_INTEREST_RATE : MORTGAGE_DEFAULT_INTEREST_RATE);
  return Math.floor(mortDebt * mortRate);
}

export function deductInflowFromDeltas(
  playerId: string,
  inflow: number,
  newPos: number | undefined,
  prevP: PlayerHudInfo | undefined,
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
): void {
  const recIdx = receivers.findIndex((r) => r.id === playerId);
  if (recIdx !== -1) {
    const curDiff = receivers[recIdx]!.diff;
    if (curDiff === inflow) {
      receivers.splice(recIdx, 1);
    } else if (curDiff > inflow) {
      receivers[recIdx]!.diff = curDiff - inflow;
    } else {
      const remaining = curDiff - inflow;
      const rec = receivers[recIdx]!;
      receivers.splice(recIdx, 1);
      payers.push({ id: playerId, diff: remaining, cellIndex: newPos ?? rec.cellIndex, prevP: prevP ?? rec.prevP, hasPassedGo: true, isSentToAudit: false });
    }
    return;
  }

  const payIdx = payers.findIndex((py) => py.id === playerId);
  if (payIdx !== -1) {
    const updated = payers[payIdx]!.diff - inflow;
    if (updated > 0) {
      receivers.push({ id: playerId, diff: updated, cellIndex: newPos, prevP, hasPassedGo: true, isSentToAudit: false });
      payers.splice(payIdx, 1);
    } else {
      payers[payIdx]!.diff = updated;
    }
  } else {
    payers.push({ id: playerId, diff: -inflow, cellIndex: newPos, prevP, hasPassedGo: true, isSentToAudit: false });
  }
}

export function adjustNetDeltaForTrade(
  trade: TradeResultInfo,
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
): void {
  const price = trade.price ?? 0;
  if (price <= 0) return;
  const netProceeds = price - (trade.taxAmount ?? 0);

  // 1. Seller received netProceeds: deduct inflow to reveal simultaneous rent/fee obligations
  deductInflowFromDeltas(trade.sellerId, netProceeds, undefined, undefined, payers, receivers);

  // 2. Buyer paid price: restore outflow towards 0
  const buyerPayIdx = payers.findIndex((p) => p.id === trade.buyerId);
  if (buyerPayIdx !== -1) {
    const newDiff = payers[buyerPayIdx]!.diff + price;
    if (newDiff === 0) {
      payers.splice(buyerPayIdx, 1);
    } else if (newDiff < 0) {
      payers[buyerPayIdx]!.diff = newDiff;
    } else {
      const buyer = payers[buyerPayIdx]!;
      payers.splice(buyerPayIdx, 1);
      receivers.push({ id: buyer.id, diff: newDiff, cellIndex: buyer.cellIndex, prevP: buyer.prevP, hasPassedGo: buyer.hasPassedGo, isSentToAudit: buyer.isSentToAudit });
    }
  }
}
