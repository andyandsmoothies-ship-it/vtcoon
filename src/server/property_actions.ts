// [UC-GAME-020,027/MSS][UC-GAME-056/MSS][UC-GAME-057/MSS] Property Actions — Buy, Upgrades, Trade, Downgrade
import type { Room, Player, MarketModifier } from '../domain/room';
import { TurnPhase } from '../domain/room';
import {
  buyProperty, BuyResult, upgradeProperty, upgradeETC, upgradeUtilityFull,
  downgradeProperty,
  type PropertyRegistry, type PropertyStateMap, type PropertyState,
} from '../domain/property_manager';
import { MarketCardId } from '../domain/event_card_types';
import { PROPERTY_DEEDS } from '../domain/property_manager';
import { ActionRejectReason } from '../domain/action_reasons';

export function handleBuyProperty(
  room: Room | undefined,
  current: Player | undefined,
  registry: PropertyRegistry | undefined,
): { result: BuyResult } | undefined {
  if (!room || !current || !registry) return undefined;
  if (room.phase !== TurnPhase.ActionPhase) return undefined;
  const res = buyProperty(current, current.position, registry, room.activeModifiers);
  if (res.result === BuyResult.Success) room.phase = TurnPhase.PropertyManagement;
  return res;
}

export function handleUpgradeETC(
  current: Player | undefined,
  phase: TurnPhase | undefined,
  registry: PropertyRegistry | undefined,
  stateMap: PropertyStateMap | undefined,
): { success: boolean; reason?: string } {
  if (!current || phase !== TurnPhase.PropertyManagement) return { success: false, reason: ActionRejectReason.INVALID_PHASE };
  if (!registry || !stateMap) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  return upgradeETC(current, registry, stateMap);
}

export function handleUpgradeUtility(
  current: Player | undefined,
  phase: TurnPhase | undefined,
  cellIndex: number,
  registry: PropertyRegistry | undefined,
  stateMap: PropertyStateMap | undefined,
): { success: boolean; reason?: string } {
  if (!current || phase !== TurnPhase.PropertyManagement) return { success: false, reason: ActionRejectReason.INVALID_PHASE };
  if (!registry || !stateMap) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  return upgradeUtilityFull(current, cellIndex, registry, stateMap);
}

export function handleUpgrade(
  current: Player | undefined,
  phase: TurnPhase | undefined,
  cellIndex: number,
  registry: PropertyRegistry | undefined,
  stateMap: PropertyStateMap | undefined,
  modifiers?: readonly MarketModifier[],
): { success: boolean; reason?: string } {
  if (!current || phase !== TurnPhase.PropertyManagement) return { success: false, reason: ActionRejectReason.INVALID_PHASE };
  if (!registry || !stateMap) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  return upgradeProperty(current, cellIndex, registry, stateMap, modifiers);
}

// --- DEBT-02: INTENT_DOWNGRADE (UC-GAME-057) ---

function isDowngradePhaseValid(phase?: TurnPhase): boolean {
  return phase === TurnPhase.PropertyManagement || phase === TurnPhase.InsolvencyPhase;
}

function checkDowngradeContext(
  current?: Player,
  phase?: TurnPhase,
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
): ActionRejectReason | undefined {
  if (!current || !isDowngradePhaseValid(phase)) return ActionRejectReason.INVALID_PHASE;
  if (!registry || !stateMap) return ActionRejectReason.INVALID_ROOM;
  return undefined;
}

function checkDowngradeTarget(
  playerId: string,
  cellIndex: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): ActionRejectReason | undefined {
  if (registry.get(cellIndex) !== playerId) return ActionRejectReason.NOT_OWNER;
  const deed = PROPERTY_DEEDS.get(cellIndex);
  const state = stateMap.get(cellIndex);
  const hasUpgrade = Boolean(deed?.upgradeCosts && state && state.level >= 1);
  if (!hasUpgrade) return ActionRejectReason.NOT_UPGRADEABLE;
  return undefined;
}

export type DowngradeValidation =
  | { valid: false; reason: ActionRejectReason }
  | {
      valid: true;
      reason?: undefined;
      current: Player;
      stateMap: PropertyStateMap;
    };

export function validateDowngrade(
  current: Player | undefined,
  phase: TurnPhase | undefined,
  cellIndex: number,
  registry: PropertyRegistry | undefined,
  stateMap: PropertyStateMap | undefined,
): DowngradeValidation {
  const ctxReason = checkDowngradeContext(current, phase, registry, stateMap);
  if (ctxReason) return { valid: false, reason: ctxReason };

  const targetReason = checkDowngradeTarget(current!.id, cellIndex, registry!, stateMap!);
  if (targetReason) return { valid: false, reason: targetReason };

  return { valid: true, current: current!, stateMap: stateMap! };
}

export function handleDowngrade(
  current: Player | undefined,
  phase: TurnPhase | undefined,
  cellIndex: number,
  registry: PropertyRegistry | undefined,
  stateMap: PropertyStateMap | undefined,
  roomCode?: string,
): { success: boolean; reason?: ActionRejectReason } {
  const v = validateDowngrade(current, phase, cellIndex, registry, stateMap);
  if (!v.valid) return { success: false, reason: v.reason };

  const { refund } = downgradeProperty(cellIndex, v.stateMap);
  v.current.balance += refund;
  console.info(JSON.stringify({
    event: 'DOWNGRADE_PROPERTY', correlationId: roomCode ?? v.current.id,
    timestamp: Date.now(), delta: { cellIndex, refund, playerId: v.current.id },
  }));
  return { success: true };
}

// --- DEBT-01: P2P Trading (UC-GAME-056) ---

const P2P_TAX_RATE          = 0.05;
const P2P_ANTI_SPECULATE_TAX = 0.20;

export type P2PTradeValidation =
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
  const taxAmount = Math.floor(price * taxRate);
  return {
    taxRate,
    totalCost: price,
    taxAmount,
    sellerNet: price - taxAmount,
  };
}

function isTradeFrozen(room: Room): boolean {
  return (room.activeModifiers ?? []).some(
    (m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0,
  );
}

function isInvalidPrice(price: number): boolean {
  return !Number.isInteger(price) || price <= 0;
}

function checkTradeBasics(room: Room, sellerId: string, buyerId: string, price: number): ActionRejectReason | undefined {
  if (!room.started) return ActionRejectReason.GAME_NOT_STARTED;
  if (sellerId === buyerId) return ActionRejectReason.INVALID_TRADE;
  if (isInvalidPrice(price)) return ActionRejectReason.INVALID_PRICE;
  if (isTradeFrozen(room)) return ActionRejectReason.FREEZE_ACTIVE;
  return undefined;
}

function hasBuildingOrUpgrade(state?: PropertyState): boolean {
  return (state?.level ?? 0) > 0 || Boolean(state?.isETC) || Boolean(state?.isUpgradedUtility);
}

function checkTradeProperty(
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  cellIndex: number,
  sellerId: string,
): ActionRejectReason | undefined {
  if (registry.get(cellIndex) !== sellerId) return ActionRejectReason.NOT_OWNER;
  if (!PROPERTY_DEEDS.has(cellIndex)) return ActionRejectReason.NOT_PURCHASABLE;
  if (hasBuildingOrUpgrade(stateMap.get(cellIndex))) return ActionRejectReason.PROPERTY_HAS_BUILDING;
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
): P2PTradeValidation {
  const buyer = room.players.find((p) => p.id === buyerId);
  const seller = room.players.find((p) => p.id === sellerId);
  const partyErr = checkPartyStatus(buyer, seller);
  if (partyErr) return { valid: false, reason: partyErr };

  if (seller!.mortgagedProperties?.includes(cellIndex)) {
    return { valid: false, reason: ActionRejectReason.PROPERTY_MORTGAGED };
  }

  const { taxRate, totalCost, taxAmount, sellerNet } = calcP2PTax(room, price);
  if (buyer!.balance < totalCost) return { valid: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };

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
): P2PTradeValidation {
  const basicErr = checkTradeBasics(room, sellerId, buyerId, price);
  if (basicErr) return { valid: false, reason: basicErr };

  const propErr = checkTradeProperty(registry, stateMap, cellIndex, sellerId);
  if (propErr) return { valid: false, reason: propErr };

  return checkTradeParties(room, sellerId, buyerId, cellIndex, price);
}

export function executeP2PTrade(
  room: Room,
  sellerId: string,
  buyerId: string,
  cellIndex: number,
  price: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): { success: boolean; reason?: ActionRejectReason } {
  const v = validateP2PTrade(room, sellerId, buyerId, cellIndex, price, registry, stateMap);
  if (!v.valid) return { success: false, reason: v.reason };

  v.buyer.balance -= v.totalCost;
  v.seller.balance += v.sellerNet;
  room.treasury += v.taxAmount;
  registry.set(cellIndex, buyerId);

  console.info(JSON.stringify({
    event: 'P2P_TRADE', correlationId: room.roomCode,
    timestamp: Date.now(), delta: { sellerId, buyerId, cellIndex, price, taxAmount: v.taxAmount },
  }));
  return { success: true };
}
