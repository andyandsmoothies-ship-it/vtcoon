// [UC-GAME-056/MSS] P2P Property Trading & Asset Swap Action Handlers
import type { Room, Player } from '../domain/room.js';
import type { PropertyRegistry, PropertyStateMap, PropertyState } from '../domain/property_data.js';
import { PROPERTY_DEEDS, P2P_TAX_RATE, P2P_ANTI_SPECULATE_TAX } from '../domain/property_data.js';
import { MarketCardId } from '../domain/event_card_types.js';
import { ActionRejectReason } from '../domain/action_reasons.js';

type P2PTradeValidation =
  | {
      valid: false;
      reason: ActionRejectReason;
      taxRate?: undefined;
      totalCost?: undefined;
      taxAmount?: undefined;
      sellerNet?: undefined;
      buyer?: undefined;
      seller?: undefined;
    }
  | {
      valid: true;
      reason?: undefined;
      taxRate: number;
      totalCost: number;
      taxAmount: number;
      sellerNet: number;
      buyer: Player;
      seller: Player;
    };

function calcP2PTax(room: Room, price: number): { taxRate: number; totalCost: number; taxAmount: number; sellerNet: number } {
  const antiSpeculate = (room.activeModifiers ?? []).some(
    (m) => m.type === MarketCardId.MC_ANTI_SPECULATE && m.remainingRounds > 0,
  );
  const taxRate = antiSpeculate ? P2P_ANTI_SPECULATE_TAX : P2P_TAX_RATE;
  const absPrice = Math.abs(price);
  const taxAmount = Math.round(absPrice * taxRate);
  return {
    taxRate,
    totalCost: absPrice,
    taxAmount,
    sellerNet: absPrice - taxAmount,
  };
}

function isTradeFrozen(room: Room): boolean {
  return (room.activeModifiers ?? []).some(
    (m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0,
  );
}

function isInvalidPrice(price: number, isSwap = false): boolean {
  if (isSwap) {
    return !Number.isInteger(price);
  }
  return !Number.isInteger(price) || price <= 0;
}

function checkTradeBasics(room: Room, sellerId: string, buyerId: string, price: number, isSwap = false): ActionRejectReason | undefined {
  if (!room.started) return ActionRejectReason.GAME_NOT_STARTED;
  if (sellerId === buyerId) return ActionRejectReason.INVALID_TRADE;
  if (isInvalidPrice(price, isSwap)) return ActionRejectReason.INVALID_PRICE;
  if (isTradeFrozen(room)) return ActionRejectReason.FREEZE_ACTIVE;
  return undefined;
}

function hasBuildingOrUpgrade(state?: PropertyState): boolean {
  return (state?.level ?? 0) > 0 || Boolean(state?.isETC) || Boolean(state?.isUpgradedUtility);
}

function transferMortgageDebt(from: Player, to: Player, cell: number, state?: PropertyState): void {
  if (!state?.isMortgaged && !from.mortgagedProperties?.includes(cell)) return;
  const loan = from.mortgageLoans?.[cell] ?? Math.floor((PROPERTY_DEEDS.get(cell)?.price ?? 0) * 0.5);
  from.mortgagedProperties = (from.mortgagedProperties ?? []).filter((c) => c !== cell);
  if (from.mortgageLoans) delete from.mortgageLoans[cell];
  (to.mortgagedProperties ??= []).push(cell);
  (to.mortgageLoans ??= {})[cell] = loan;
}

function checkTradeProperty(
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  cellIndex: number,
  sellerId: string,
  price: number,
  isSwap = false,
): ActionRejectReason | undefined {
  if (registry.get(cellIndex) !== sellerId) return ActionRejectReason.NOT_OWNER;
  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (!deed) return ActionRejectReason.NOT_PURCHASABLE;
  if (hasBuildingOrUpgrade(stateMap.get(cellIndex))) return ActionRejectReason.PROPERTY_HAS_BUILDING;
  if (!isSwap) {
    const isMort = Boolean(stateMap?.get(cellIndex)?.isMortgaged);
    const floorRate = isMort ? 0.35 : 0.70;
    const floorPrice = Math.max(100, Math.floor(deed.price * floorRate));
    if (price < floorPrice) {
      return ActionRejectReason.PRICE_BELOW_FLOOR;
    }
  }
  return undefined;
}

function checkPartyStatus(buyer?: Player, seller?: Player): ActionRejectReason | undefined {
  if (!buyer || !seller) return ActionRejectReason.PLAYER_NOT_FOUND;
  if (buyer.bankrupt || seller.bankrupt) return ActionRejectReason.PLAYER_BANKRUPT;
  return undefined;
}

function checkTradeParties(
  room: Room,
  sellerId: string,
  buyerId: string,
  cellIndex: number,
  price: number,
  offeredCellIndex?: number,
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
): P2PTradeValidation {
  const buyer = room.players.find((p) => p.id === buyerId);
  const seller = room.players.find((p) => p.id === sellerId);
  const partyErr = checkPartyStatus(buyer, seller);
  if (partyErr) return { valid: false, reason: partyErr };

  if (buyer!.balance < 0) {
    return { valid: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }
  if (seller!.balance < 0 && price <= 0) {
    return { valid: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }

  if (seller!.bondContract?.isActive && seller!.bondContract.collateralCells.includes(cellIndex)) {
    return { valid: false, reason: ActionRejectReason.BOND_COLLATERAL_LOCKED };
  }

  if (offeredCellIndex !== undefined) {
    if (registry && registry.get(offeredCellIndex) !== buyerId) {
      return { valid: false, reason: ActionRejectReason.NOT_OWNER };
    }
    const offeredDeed = PROPERTY_DEEDS.get(offeredCellIndex);
    if (!offeredDeed) {
      return { valid: false, reason: ActionRejectReason.NOT_PURCHASABLE };
    }
    if (stateMap && hasBuildingOrUpgrade(stateMap.get(offeredCellIndex))) {
      return { valid: false, reason: ActionRejectReason.PROPERTY_HAS_BUILDING };
    }
    if (buyer!.bondContract?.isActive && buyer!.bondContract.collateralCells.includes(offeredCellIndex)) {
      return { valid: false, reason: ActionRejectReason.BOND_COLLATERAL_LOCKED };
    }
  }

  const { taxRate, totalCost, taxAmount, sellerNet } = calcP2PTax(room, price);
  if (price > 0 && buyer!.balance < totalCost) {
    return { valid: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }
  if (price < 0 && seller!.balance < totalCost) {
    return { valid: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }

  return { valid: true, taxRate, totalCost, taxAmount, sellerNet, buyer: buyer!, seller: seller! };
}

export function validateP2PTrade(
  room: Room,
  sellerId: string,
  buyerId: string,
  cellIndex: number,
  price: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  offeredCellIndex?: number,
): P2PTradeValidation {
  const isSwap = offeredCellIndex !== undefined;
  const basicErr = checkTradeBasics(room, sellerId, buyerId, price, isSwap);
  if (basicErr) return { valid: false, reason: basicErr };

  const propErr = checkTradeProperty(registry, stateMap, cellIndex, sellerId, price, isSwap);
  if (propErr) return { valid: false, reason: propErr };

  return checkTradeParties(room, sellerId, buyerId, cellIndex, price, offeredCellIndex, registry, stateMap);
}

export function executeP2PTrade(
  room: Room,
  sellerId: string,
  buyerId: string,
  cellIndex: number,
  price: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  offeredCellIndex?: number,
): { success: boolean; reason?: ActionRejectReason } {
  const v = validateP2PTrade(room, sellerId, buyerId, cellIndex, price, registry, stateMap, offeredCellIndex);
  if (!v.valid) return { success: false, reason: v.reason };

  if (price > 0) {
    v.buyer.balance -= v.totalCost;
    v.seller.balance += v.sellerNet;
    room.treasury = (room.treasury ?? 0) + v.taxAmount;
  } else if (price < 0) {
    v.seller.balance -= v.totalCost;
    v.buyer.balance += v.sellerNet;
    room.treasury = (room.treasury ?? 0) + v.taxAmount;
  }

  registry.set(cellIndex, buyerId);
  delete v.buyer.cellTradeRejections?.[cellIndex];
  delete v.buyer.cellLastRejectedRound?.[cellIndex];

  if (offeredCellIndex !== undefined) {
    registry.set(offeredCellIndex, sellerId);
    delete v.seller.cellTradeRejections?.[offeredCellIndex];
    delete v.seller.cellLastRejectedRound?.[offeredCellIndex];
  }

  transferMortgageDebt(v.seller, v.buyer, cellIndex, stateMap.get(cellIndex));
  if (offeredCellIndex !== undefined) {
    transferMortgageDebt(v.buyer, v.seller, offeredCellIndex, stateMap.get(offeredCellIndex));
  }

  room.lastTradeResult = {
    sellerId,
    buyerId,
    cellIndex,
    price,
    taxAmount: v.taxAmount,
    timestamp: Date.now(),
    ...(offeredCellIndex !== undefined ? { offeredCellIndex } : {}),
  };

  console.info(JSON.stringify({
    event: offeredCellIndex !== undefined ? 'P2P_TRADE_SWAP' : 'P2P_TRADE',
    correlationId: room.roomCode,
    timestamp: Date.now(),
    delta: { sellerId, buyerId, cellIndex, offeredCellIndex, price, taxAmount: v.taxAmount },
  }));
  return { success: true };
}
