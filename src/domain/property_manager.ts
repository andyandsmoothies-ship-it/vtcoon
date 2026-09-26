// [UC-GAME-020/MSS][UC-GAME-027/MSS][UC-GAME-028/MSS] Property Manager — Slice 02
// Barrel re-export — bảo toàn 100% import paths cho 12 test files

import type { Player, MarketModifier, Room } from './room';
import { MarketCardId, ChanceCardId, COASTAL_CELLS, SERVICE_CELLS } from './event_card_engine';
import {
  PROPERTY_DEEDS, isPurchasable,
  type PropertyRegistry, type PropertyStateMap,
} from './property_data';
import {
  hasZeroRent, calculateRent, applyServiceBonus, tryUseDiplomaticCard, resolveRent,
} from './property_rent';
import { CellType, BOARD_CONFIG } from './board_config';

export * from './property_data';
export * from './property_rent';
export * from './property_upgrade';

export enum LandingResult {
  NotPurchasable = 'NotPurchasable',
  Unowned        = 'Unowned',
  OwnProperty    = 'OwnProperty',
  RentPaid       = 'RentPaid',
}

export enum BuyResult {
  Success           = 'Success',
  AlreadyOwned      = 'AlreadyOwned',
  InsufficientFunds = 'InsufficientFunds',
  NotPurchasable    = 'NotPurchasable',
  TradeFrozen       = 'TradeFrozen',
}

export function buyProperty(
  player: Player,
  cellIndex: number,
  registry: PropertyRegistry,
  modifiers?: readonly MarketModifier[],
): { result: BuyResult } {
  if (modifiers?.some((m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0)) {
    return { result: BuyResult.TradeFrozen };
  }
  if (!isPurchasable(cellIndex)) return { result: BuyResult.NotPurchasable };
  if (registry.has(cellIndex))   return { result: BuyResult.AlreadyOwned };
  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (deed === undefined)          return { result: BuyResult.NotPurchasable };
  if (player.balance < deed.price) return { result: BuyResult.InsufficientFunds };
  player.balance -= deed.price;
  registry.set(cellIndex, player.id);
  return { result: BuyResult.Success };
}

export interface LandingDetails {
  result: LandingResult;
  rentAmount: number;
  landlordId?: string;
  diplomaticCardUsed?: boolean;
  savedRentAmount?: number;
}

export function handleLanding(
  player: Player, cellIndex: number, registry: PropertyRegistry, players: Player[],
  stateMap?: PropertyStateMap, diceTotal?: number, modifiers?: readonly MarketModifier[], rng?: () => number,
  chanceDiscard?: ChanceCardId[], permanentRentBonus?: Readonly<Record<number, number>>,
  roundCount?: number,
  room?: Room,
): LandingDetails {
  if (!isPurchasable(cellIndex)) return { result: LandingResult.NotPurchasable, rentAmount: 0, landlordId: undefined, diplomaticCardUsed: false };

  // [IMP-116] Hiệu ứng dừng chân sự kiện: Nghị Định 100 nồng độ cồn & Bão duyên hải
  if (modifiers?.some((m) => m.type === MarketCardId.MC_ALCOHOL_CHECK && m.remainingRounds > 0 && (m.affectedCells ?? SERVICE_CELLS).includes(cellIndex))) {
    player.balance -= 800;
    if (room) room.treasury = (room.treasury ?? 0) + 800;
    player.skipNextTurn = true;
  }
  if (modifiers?.some((m) => m.type === MarketCardId.MC_COASTAL_STORM && m.remainingRounds > 0 && (m.affectedCells ?? COASTAL_CELLS).includes(cellIndex))) {
    player.skipNextTurn = true;
  }
  const ownerId = registry.get(cellIndex);
  if (ownerId === undefined) return { result: LandingResult.Unowned, rentAmount: 0, landlordId: undefined, diplomaticCardUsed: false };
  if (ownerId === player.id) return { result: LandingResult.OwnProperty, rentAmount: 0, landlordId: ownerId, diplomaticCardUsed: false };

  // [IMP-192A] Anti-camping guard: miễn thu tiền thuê khi chủ đất đang ở Trạm Kiểm Toán
  const owner = players.find((p) => p.id === ownerId);
  if (owner && ((owner.auditTurnsLeft ?? 0) > 0 || owner.inAudit)) {
    return { result: LandingResult.RentPaid, rentAmount: 0, landlordId: ownerId, diplomaticCardUsed: false };
  }

  // Guard thế chấp: ô đang thế chấp không thu phí thuê
  if (owner?.mortgagedProperties?.includes(cellIndex)) {
    return { result: LandingResult.RentPaid, rentAmount: 0, landlordId: ownerId, diplomaticCardUsed: false };
  }

  if (hasZeroRent(cellIndex, modifiers)) return { result: LandingResult.RentPaid, rentAmount: 0, landlordId: ownerId, diplomaticCardUsed: false };

  const cell = BOARD_CONFIG[cellIndex];
  let baseRent = resolveRent(cell, cellIndex, ownerId, registry, stateMap, diceTotal, undefined, roundCount);
  if (cell?.type === CellType.Utility && modifiers?.some((m) => m.type === MarketCardId.MC_UTILITY_DOUBLE && m.remainingRounds > 0)) {
    baseRent = (diceTotal ?? 7) * 100;
  }

  // Áp dụng permanentRentBonus (CC_LAND_CHANGE)
  const bonusPct = permanentRentBonus?.[cellIndex] ?? 0;
  if (bonusPct > 0) baseRent = Math.floor(baseRent * (1 + bonusPct));

  const potentialRent = calculateRent(baseRent, cellIndex, modifiers, stateMap);

  const isNormalProperty = cell?.type === CellType.Property;
  if (isNormalProperty && tryUseDiplomaticCard(player, cellIndex, stateMap, chanceDiscard)) {
    return { result: LandingResult.RentPaid, rentAmount: 0, landlordId: ownerId, diplomaticCardUsed: true, savedRentAmount: potentialRent };
  }

  let rentAmount = potentialRent;

  // CC_PORT_EXCLUSIVE: chia 50% phí cảng cho beneficiary; chủ nhận 50%; người trả = 100%
  const portMod = modifiers?.find(
    (m) => m.beneficiaryId !== undefined && m.remainingRounds > 0 &&
      (m.affectedCells as readonly number[]).includes(cellIndex),
  );
  const beneficiary = portMod?.beneficiaryId !== undefined
    ? players.find((p) => p.id === portMod.beneficiaryId)
    : undefined;

  if (beneficiary !== undefined && !beneficiary.bankrupt) {
    if (player.balance >= rentAmount) {
      const half = Math.floor(rentAmount * 0.5);
      player.balance -= rentAmount;
      if (owner !== undefined) owner.balance += (rentAmount - half);
      beneficiary.balance += half;
    } else {
      const actualPaid = Math.max(0, player.balance);
      const half = Math.floor(actualPaid * 0.5);
      player.balance -= rentAmount;
      if (owner !== undefined) owner.balance += (actualPaid - half);
      beneficiary.balance += half;
    }
    const surcharge = applyServiceBonus(cellIndex, stateMap, player, owner, rng);
    return { result: LandingResult.RentPaid, rentAmount: rentAmount + surcharge, landlordId: ownerId, diplomaticCardUsed: false };
  }

  if (player.balance >= rentAmount) {
    player.balance -= rentAmount;
    if (owner !== undefined) owner.balance += rentAmount;
  } else {
    const actualPaid = Math.max(0, player.balance);
    player.balance -= rentAmount;
    if (owner !== undefined) owner.balance += actualPaid;
  }
  const surcharge = applyServiceBonus(cellIndex, stateMap, player, owner, rng);
  rentAmount += surcharge;
  return { result: LandingResult.RentPaid, rentAmount, landlordId: ownerId, diplomaticCardUsed: false };
}
