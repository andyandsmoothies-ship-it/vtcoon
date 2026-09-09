// [UC-GAME-027/MSS][UC-GAME-028/MSS] Property Upgrade — Upgrade / downgrade logic
// Extracted from property_manager.ts — Slice 06 refactor (DEBT-S06-05)

import type { Player, MarketModifier } from './room';
import { CellType, BOARD_CONFIG } from './board_config';
import { MarketCardId } from './event_card_engine';
import {
  PROPERTY_DEEDS, RAILROAD_CELLS, ETC_COST_PER_CELL, UTILITY_UPGRADE_COST,
  type PropertyRegistry, type PropertyStateMap,
} from './property_data';
import { ActionRejectReason } from './action_reasons';

export function hasMonopoly(playerId: string, cellIndex: number, registry: PropertyRegistry): boolean {
  const cell = BOARD_CONFIG[cellIndex];
  if (!cell?.colorGroup) return false;
  const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
  return groupCells.every((c) => registry.get(c.index) === playerId);
}

export function upgradeProperty(
  player: Player, cellIndex: number, registry: PropertyRegistry, stateMap: PropertyStateMap,
  modifiers?: readonly MarketModifier[],
): { success: boolean; reason?: string } {
  if (registry.get(cellIndex) !== player.id) return { success: false, reason: ActionRejectReason.NOT_OWNER };
  if (!hasMonopoly(player.id, cellIndex, registry)) return { success: false, reason: ActionRejectReason.MISSING_MONOPOLY };
  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (!deed?.upgradeCosts) return { success: false, reason: ActionRejectReason.NOT_UPGRADEABLE };
  const state = stateMap.get(cellIndex) ?? { level: 0 };
  if (state.level >= 3) return { success: false, reason: ActionRejectReason.MAX_LEVEL };
  let cost = deed.upgradeCosts[state.level]!;
  if (modifiers?.some((m) => m.type === MarketCardId.MC_CREDIT_STIMULUS && m.remainingRounds > 0)) {
    cost = Math.floor(cost * 0.8);
  }
  if (player.balance < cost) return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  player.balance -= cost;
  stateMap.set(cellIndex, { ...state, level: state.level + 1 });
  return { success: true };
}

export function downgradeProperty(cellIndex: number, stateMap: PropertyStateMap): { refund: number } {
  const state = stateMap.get(cellIndex);
  if (!state || state.level === 0) return { refund: 0 };
  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (!deed?.upgradeCosts) return { refund: 0 };
  let totalCost = 0;
  for (let i = 0; i < state.level; i++) totalCost += deed.upgradeCosts[i]!;
  const refund = Math.floor(totalCost * 0.5);
  stateMap.set(cellIndex, { ...state, level: 0 });
  return { refund };
}

export function upgradeETC(
  player: Player, registry: PropertyRegistry, stateMap: PropertyStateMap,
): { success: boolean; reason?: string } {
  const owned = RAILROAD_CELLS.filter((c) => registry.get(c) === player.id);
  if (owned.length < 2) return { success: false, reason: ActionRejectReason.NEED_2_RAILROADS };
  const totalCost = ETC_COST_PER_CELL * owned.length;
  if (player.balance < totalCost) return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  player.balance -= totalCost;
  for (const c of owned) {
    const s = stateMap.get(c) ?? { level: 0 };
    stateMap.set(c, { ...s, isETC: true });
  }
  return { success: true };
}

export function upgradeUtilityFull(
  player: Player, cellIndex: number, registry: PropertyRegistry, stateMap: PropertyStateMap,
): { success: boolean; reason?: string } {
  if (registry.get(cellIndex) !== player.id) return { success: false, reason: ActionRejectReason.NOT_OWNER };
  const cell = BOARD_CONFIG[cellIndex];
  if (!cell || cell.type !== CellType.Utility) return { success: false, reason: ActionRejectReason.NOT_UTILITY };
  if (player.balance < UTILITY_UPGRADE_COST) return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  player.balance -= UTILITY_UPGRADE_COST;
  const s = stateMap.get(cellIndex) ?? { level: 0 };
  stateMap.set(cellIndex, { ...s, isUpgradedUtility: true });
  return { success: true };
}
