// [IMP-334] Financial Synthesizer Helpers
// Pure deterministic helper functions for registry mapping, mortgage interest, and balance delta tracking
import type { PlayerHudInfo } from '../store/game_store.js';
import type { TradeResultInfo } from '../../server/session_manager.js';
import {
  PROPERTY_DEEDS,
  type PropertyRegistry,
  type PropertyStateMap,
  ETC_COST_PER_CELL,
  UTILITY_UPGRADE_COST,
} from '../../domain/property_data.js';
import { calculateUpgradeCost, type UpgradeCostModifier } from '../../domain/property_upgrade.js';
import type { DeltaPayload } from '../../server/session_manager.js';
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

export function adjustNetDeltaForPropertyTransactions(
  delta: DeltaPayload,
  prevState: {
    readonly playersInfo: Record<string, PlayerHudInfo>;
    readonly levelMap?: Record<number, number>;
    readonly propertyStates?: Record<number, { readonly isETC?: boolean; readonly isUpgradedUtility?: boolean }>;
    readonly activeModifiers?: readonly UpgradeCostModifier[];
    readonly auction?: { readonly cellIndex?: number; readonly highestBidderId?: string | null; readonly currentBid?: number } | null;
  },
  nextState: {
    readonly playersInfo: Record<string, PlayerHudInfo>;
    readonly activeModifiers?: readonly UpgradeCostModifier[];
    readonly auction?: unknown;
  },
  payers: InternalBalanceDelta[],
): void {
  // 1. Auction settlement deduction
  if (delta.auction && (delta.auction.isConcluded || delta.auction.winnerId !== undefined)) {
    const winnerId = delta.auction.winnerId ?? delta.auction.highestBidderId;
    const winningBid = delta.auction.finalPrice ?? delta.auction.currentBid ?? 0;
    if (winnerId && winningBid > 0) {
      const idx = payers.findIndex((p) => p.id === winnerId);
      if (idx !== -1) {
        payers[idx]!.diff += winningBid;
        if (payers[idx]!.diff >= 0) payers[idx]!.diff = 0;
      }
    }
  } else if (delta.auction === null && prevState.auction?.highestBidderId && nextState.auction === null) {
    const winnerId = prevState.auction.highestBidderId;
    const winningBid = prevState.auction.currentBid ?? 0;
    if (winnerId && winningBid > 0) {
      const idx = payers.findIndex((p) => p.id === winnerId);
      if (idx !== -1) {
        payers[idx]!.diff += winningBid;
        if (payers[idx]!.diff >= 0) payers[idx]!.diff = 0;
      }
    }
  }

  const activeMods: readonly UpgradeCostModifier[] = delta.activeModifiers ?? nextState.activeModifiers ?? prevState.activeModifiers ?? [];

  // 2. Cell transactions deduction (Purchase, Upgrade, ETC, Utility, Unmortgage)
  for (const cell of delta.cells ?? []) {
    const prevOwnerId = Object.keys(prevState.playersInfo).find((id) =>
      prevState.playersInfo[id]?.ownedProperties?.includes(cell.index),
    );

    // 2a. Direct purchase from bank (prevOwnerId must be undefined and Boolean(cell.ownerId) truthy to prevent null trap & liquidation misattribution)
    const isDirectBankPurchase = prevOwnerId === undefined && Boolean(cell.ownerId);
    const isAuction = Boolean(delta.auction?.cellIndex === cell.index || prevState.auction?.cellIndex === cell.index);
    const isTrade = Boolean(delta.lastTradeResult?.cellIndex === cell.index || delta.lastTradeResult?.offeredCellIndex === cell.index);
    const isBuyoutCard = delta.lastEventCard?.cardId === 'CC_MA_FORCE' || delta.lastEventCard?.cardId === 'CC_SWAP_PROJECT';

    if (isDirectBankPurchase && !isAuction && !isTrade && !isBuyoutCard && cell.ownerId) {
      const price = PROPERTY_DEEDS.get(cell.index)?.price ?? 0;
      if (price > 0) {
        const idx = payers.findIndex((p) => p.id === cell.ownerId);
        if (idx !== -1) {
          payers[idx]!.diff += price;
          if (payers[idx]!.diff >= 0) payers[idx]!.diff = 0;
        }
      }
    }

    // 2b. Building upgrades with macroeconomic policy awareness & CC_LAND_CHANGE card discount handling
    const prevLevel = prevState.levelMap?.[cell.index] ?? 0;
    if (cell.level !== undefined && cell.level > prevLevel) {
      const ownerId = cell.ownerId ?? prevOwnerId ?? '';
      const isLandChangeCard = delta.lastEventCard?.cardId === 'CC_LAND_CHANGE' || delta.lastEventCard?.id === 'CC_LAND_CHANGE';
      let totalUpgradeCost = 0;
      for (let lvl = prevLevel; lvl < cell.level; lvl++) {
        totalUpgradeCost += (isLandChangeCard && lvl === 0)
          ? 500
          : calculateUpgradeCost(cell.index, lvl, activeMods);
      }
      if (ownerId && totalUpgradeCost > 0) {
        const idx = payers.findIndex((p) => p.id === ownerId);
        if (idx !== -1) {
          payers[idx]!.diff += totalUpgradeCost;
          if (payers[idx]!.diff >= 0) payers[idx]!.diff = 0;
        }
      }
    }

    // 2c. Railroad ETC upgrade
    const wasETC = Boolean(prevState.propertyStates?.[cell.index]?.isETC);
    if (cell.isETC === true && !wasETC) {
      const ownerId = cell.ownerId ?? prevOwnerId ?? '';
      if (ownerId && ETC_COST_PER_CELL > 0) {
        const idx = payers.findIndex((p) => p.id === ownerId);
        if (idx !== -1) {
          payers[idx]!.diff += ETC_COST_PER_CELL;
          if (payers[idx]!.diff >= 0) payers[idx]!.diff = 0;
        }
      }
    }

    // 2d. Utility upgrade (Smart Grid / 5G)
    const wasUpgradedUtil = Boolean(prevState.propertyStates?.[cell.index]?.isUpgradedUtility);
    if (cell.isUpgradedUtility === true && !wasUpgradedUtil) {
      const ownerId = cell.ownerId ?? prevOwnerId ?? '';
      if (ownerId && UTILITY_UPGRADE_COST > 0) {
        const idx = payers.findIndex((p) => p.id === ownerId);
        if (idx !== -1) {
          payers[idx]!.diff += UTILITY_UPGRADE_COST;
          if (payers[idx]!.diff >= 0) payers[idx]!.diff = 0;
        }
      }
    }

    // 2e. Unmortgage fee
    const wasMortgaged = prevOwnerId
      ? (prevState.playersInfo[prevOwnerId]?.mortgagedProperties?.includes(cell.index) ?? false)
      : false;
    if (cell.isMortgaged === false && wasMortgaged) {
      const ownerId = cell.ownerId ?? prevOwnerId ?? '';
      const deed = PROPERTY_DEEDS.get(cell.index);
      const cost = deed ? Math.floor(deed.price * 0.55) : 0;
      if (ownerId && cost > 0) {
        const idx = payers.findIndex((p) => p.id === ownerId);
        if (idx !== -1) {
          payers[idx]!.diff += cost;
          if (payers[idx]!.diff >= 0) payers[idx]!.diff = 0;
        }
      }
    }
  }

  // 3. Clean up neutralized payers
  for (let i = payers.length - 1; i >= 0; i--) {
    if (payers[i]!.diff === 0) {
      payers.splice(i, 1);
    }
  }
}
