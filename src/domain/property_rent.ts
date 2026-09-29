// [UC-GAME-020/MSS][UC-GAME-027/MSS] Property Rent — Rent calculation & resolution
// Extracted from property_manager.ts — Slice 06 refactor (DEBT-S06-05)

import type { Player, MarketModifier } from './room';
import { CellType, BOARD_CONFIG } from './board_config';
import { MarketCardId, ChanceCardId, COASTAL_CELLS, SERVICE_CELLS } from './event_card_engine';
import {
  PROPERTY_DEEDS, RAILROAD_CELLS, RAILROAD_FEES, UTILITY_CELLS,
  type PropertyRegistry, type PropertyStateMap,
} from './property_data';
import { hasMonopoly } from './property_upgrade';

const SERVICE_C2_SURCHARGE = 200;
export const GO_PROPERTY_TAX_CAP = 1_000;
// [IMP-216][IMP-226] SSOT Constants for Special Fees & Escalating Bail
export const TELECOM_DATA_FEE = 150;
export const MIN_BAIL_AMOUNT = 500;
export const ESCALATING_BAIL_TIERS = [500, 1_000, 2_000] as const;
export const MAX_BAIL_AMOUNT = 2_000;

/**
 * [IMP-226] Tính phí bảo lãnh / tiền phạt kiểm toán theo khung chế tài tái phạm:
 * - Lần 1: 500 Tr. VNĐ (chuẩn lệ phí hành chính, 25% lương GO)
 * - Lần 2: 1.000 Tr. VNĐ (răn đe tái phạm)
 * - Lần 3+: 2.000 Tr. VNĐ (khung phạt tối đa)
 */
export function calculateBailAmount(auditCount: number = 1): number {
  const normalized = Math.max(1, Math.floor(Number.isFinite(auditCount) ? auditCount : 1));
  const index = normalized - 1;
  return ESCALATING_BAIL_TIERS[index] ?? MAX_BAIL_AMOUNT;
}

// Deprecated alias for backward compatibility
export const BAIL_NET_WORTH_RATIO = 0.10;

/** @see docs/domain/gotchas.md#1-market-modifiers-lifecycle--scope-slice-04 */
export function hasZeroRent(cellIndex: number, modifiers?: readonly MarketModifier[]): boolean {
  return Boolean(modifiers?.some((m) => m.remainingRounds > 0 &&
    (m.type === MarketCardId.MC_COASTAL_STORM || m.multiplier === 0) && (m.affectedCells ?? COASTAL_CELLS).includes(cellIndex)));
}

export function calculateRent(
  baseRent: number,
  cellIndex: number,
  modifiers?: readonly MarketModifier[],
  stateMap?: PropertyStateMap,
): number {
  let rent = baseRent;
  for (const m of modifiers ?? []) {
    if (m.remainingRounds > 0 && (m.affectedCells ?? []).includes(cellIndex)) {
      if (m.type === MarketCardId.MC_NIGHT_ECONOMY && (stateMap?.get(cellIndex)?.level ?? 0) < 1) {
        continue;
      }
      const mult = m.beneficiaryId !== undefined
        ? undefined
        : (m.multiplier ?? (m.type === MarketCardId.MC_PEAK_TOURISM || m.type === MarketCardId.MC_UTILITY_DOUBLE ? 2 : undefined));
      if (mult !== undefined) {
        rent = Math.floor(rent * mult);
      }
      if (m.type === MarketCardId.MC_FUEL_SURGE) {
        rent += 500;
      }
    }
  }
  return rent;
}

function applyC2Surcharge(player: Player, owner: Player | undefined, rng: () => number): number {
  const face = Math.floor(rng() * 6) + 1;
  if (face % 2 === 0) {
    const actualPaid = Math.max(0, player.balance);
    player.balance -= SERVICE_C2_SURCHARGE;
    if (owner !== undefined) owner.balance += Math.min(SERVICE_C2_SURCHARGE, actualPaid);
    return SERVICE_C2_SURCHARGE;
  }
  return 0;
}

export function applyServiceBonus(
  cellIndex: number, stateMap: PropertyStateMap | undefined, player: Player, owner?: Player, rng?: () => number,
): number {
  if (!(SERVICE_CELLS as readonly number[]).includes(cellIndex)) return 0;
  const lvl = stateMap?.get(cellIndex)?.level;
  if (lvl === 3) {
    player.skipNextTurn = true;
    return 0;
  }
  if (lvl === 2 && rng) return applyC2Surcharge(player, owner, rng);
  return 0;
}

export function tryUseDiplomaticCard(
  player: Player, cellIndex: number, _stateMap?: PropertyStateMap, chanceDiscard?: ChanceCardId[],
): boolean {
  if (BOARD_CONFIG[cellIndex]?.type !== CellType.Property) return false;
  const idx = player.hand.indexOf(ChanceCardId.CC_DIPLOMATIC);
  if (idx === -1) return false;
  player.hand.splice(idx, 1);
  chanceDiscard?.push(ChanceCardId.CC_DIPLOMATIC);
  return true;
}

export function resolveRent(
  cell: (typeof BOARD_CONFIG)[number] | undefined,
  cellIndex: number, ownerId: string,
  registry: PropertyRegistry, stateMap?: PropertyStateMap, diceTotal?: number,
  modifiers?: readonly MarketModifier[],
  roundCount?: number,
): number {
  if (!cell) return 0;
  let rent = 0;
  if (cell.type === CellType.Railroad) {
    rent = calcRailroadFee(ownerId, registry, stateMap);
  } else if (cell.type === CellType.Utility) {
    rent = calcUtilityFee(ownerId, diceTotal ?? 7, registry, stateMap, cellIndex);
  } else {
    const deed = PROPERTY_DEEDS.get(cellIndex);
    if (!deed) return 0;
    const lvl = stateMap?.get(cellIndex)?.level ?? 0;
    if (lvl === 3 && deed.rent3 !== undefined) {
      rent = hasMonopoly(ownerId, cellIndex, registry, stateMap) ? Math.floor(deed.rent3 * 1.5) : deed.rent3;
    }
    else if (lvl === 2 && deed.rent2 !== undefined) rent = deed.rent2;
    else if (lvl === 1 && deed.rent1 !== undefined) rent = deed.rent1;
    else {
      const base0 = deed.rent0;
      rent = hasMonopoly(ownerId, cellIndex, registry, stateMap) ? base0 * 2 : base0;
    }
    if (cell.type === CellType.Property && typeof roundCount === 'number' && roundCount > 0) {
      if (roundCount >= 30) {
        rent = Math.floor(rent * 1.5);
      } else if (roundCount >= 20) {
        rent = Math.floor(rent * 1.2);
      }
    }
  }
  if (modifiers && modifiers.length > 0) {
    rent = calculateRent(rent, cellIndex, modifiers, stateMap);
  }
  return rent;
}

export function calcRailroadFee(ownerId: string, registry: PropertyRegistry, stateMap?: PropertyStateMap): number {
  const count = RAILROAD_CELLS.filter((c) => registry.get(c) === ownerId).length;
  const base = RAILROAD_FEES[count] ?? 0;
  const hasETC = RAILROAD_CELLS.some((c) => registry.get(c) === ownerId && stateMap?.get(c)?.isETC);
  return hasETC ? Math.floor(base * 1.5) : base;
}

export const UTILITY_FEE_SINGLE = 1_000;
export const UTILITY_FEE_DOUBLE = 2_500;
export const UTILITY_FEE_UPGRADED = 3_500;

export function calcUtilityFee(
  ownerId: string, _diceTotal: number, registry: PropertyRegistry,
  stateMap?: PropertyStateMap, cellIndex?: number,
): number {
  if (cellIndex !== undefined && stateMap?.get(cellIndex)?.isUpgradedUtility) {
    return UTILITY_FEE_UPGRADED;
  }
  const count = UTILITY_CELLS.filter((c) => registry.get(c) === ownerId).length;
  return count >= 2 ? UTILITY_FEE_DOUBLE : UTILITY_FEE_SINGLE;
}

export const ELECTRIC_RATE_C1 = 100;
export const ELECTRIC_RATE_C2 = 200;
export const ELECTRIC_RATE_C3 = 300;

export function calculateElectricBill(
  playerId: string,
  registry: PropertyRegistry,
  stateMap?: PropertyStateMap,
): number {
  let totalBill = 0;
  for (const [cellIndex, owner] of registry) {
    if (owner === playerId) {
      const lvl = stateMap?.get(cellIndex)?.level ?? 0;
      if (lvl === 1) totalBill += ELECTRIC_RATE_C1;
      else if (lvl === 2) totalBill += ELECTRIC_RATE_C2;
      else if (lvl === 3) totalBill += ELECTRIC_RATE_C3;
    }
  }
  return totalBill;
}

export function calculateGoPropertyTax(
  playerId: string, registry?: PropertyRegistry, stateMap?: PropertyStateMap,
): number {
  if (!registry) return 0;
  let ownedCount = 0;
  let c2c3Count = 0;
  for (const [cell, owner] of registry) {
    if (owner === playerId) {
      ownedCount++;
      const lvl = stateMap?.get(cell)?.level ?? 0;
      if (lvl === 2 || lvl === 3) c2c3Count++;
    }
  }
  if (ownedCount >= 7) return 400 * ownedCount + 300 * c2c3Count;
  if (ownedCount >= 4) return 150 * ownedCount;
  return 0;
}
