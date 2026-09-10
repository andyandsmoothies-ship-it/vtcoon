// [UC-GAME-020/MSS][UC-GAME-027/MSS] Property Rent — Rent calculation & resolution
// Extracted from property_manager.ts — Slice 06 refactor (DEBT-S06-05)

import type { Player, MarketModifier } from './room';
import { CellType, BOARD_CONFIG } from './board_config';
import { MarketCardId, ChanceCardId, COASTAL_CELLS, SERVICE_CELLS } from './event_card_engine';
import {
  PROPERTY_DEEDS, RAILROAD_CELLS, RAILROAD_FEES, UTILITY_CELLS,
  type PropertyRegistry, type PropertyStateMap,
} from './property_data';

export const SERVICE_C2_SURCHARGE = 200;

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
        : (m.multiplier ?? (m.type === MarketCardId.MC_PEAK_TOURISM ? 2 : undefined));
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

export function applyC2Surcharge(player: Player, owner: Player | undefined, rng: () => number): number {
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
): number {
  if (!cell) return 0;
  if (cell.type === CellType.Railroad) return calcRailroadFee(ownerId, registry, stateMap);
  if (cell.type === CellType.Utility) return calcUtilityFee(ownerId, diceTotal ?? 7, registry, stateMap, cellIndex);
  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (!deed) return 0;
  const lvl = stateMap?.get(cellIndex)?.level ?? 0;
  if (lvl === 3 && deed.rent3 !== undefined) return deed.rent3;
  if (lvl === 2 && deed.rent2 !== undefined) return deed.rent2;
  if (lvl === 1 && deed.rent1 !== undefined) return deed.rent1;
  return deed.rent0;
}

export function calcRailroadFee(ownerId: string, registry: PropertyRegistry, stateMap?: PropertyStateMap): number {
  const count = RAILROAD_CELLS.filter((c) => registry.get(c) === ownerId).length;
  const base = RAILROAD_FEES[count] ?? 0;
  const hasETC = RAILROAD_CELLS.some((c) => registry.get(c) === ownerId && stateMap?.get(c)?.isETC);
  return hasETC ? Math.floor(base * 1.5) : base;
}

export function calcUtilityFee(
  ownerId: string, diceTotal: number, registry: PropertyRegistry,
  stateMap?: PropertyStateMap, cellIndex?: number,
): number {
  if (cellIndex !== undefined && stateMap?.get(cellIndex)?.isUpgradedUtility) return diceTotal * 150;
  const count = UTILITY_CELLS.filter((c) => registry.get(c) === ownerId).length;
  return count >= 2 ? diceTotal * 100 : diceTotal * 40;
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
