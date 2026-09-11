import type { Player, Room } from '../room';
import { BOARD_CONFIG } from '../board_config';
import { MarketCardId } from '../event_card_engine';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../property_data';
import { hasMonopoly, checkEvenDowngrading } from '../property_upgrade';
import { resolveRent } from '../property_rent';
import type { BotIntent } from './bot_types';

/** Check whether market trade freeze modifier is currently active */
function isTradeFrozen(room?: Room): boolean {
  return (room?.activeModifiers ?? []).some(
    (m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0,
  );
}

/** Check whether a cell is currently mortgaged in player or stateMap */

function isCellMortgaged(cellIndex: number, bot: Player, stateMap: PropertyStateMap): boolean {
  return Boolean(bot.mortgagedProperties?.includes(cellIndex) || stateMap.get(cellIndex)?.isMortgaged);
}

/** Get all cells owned by the bot */
function getOwnedCells(botId: string, registry: PropertyRegistry): number[] {
  const owned: number[] = [];
  for (const [cellIndex, owner] of registry.entries()) {
    if (owner === botId) {
      owned.push(cellIndex);
    }
  }
  return owned;
}

/**
 * Step 1: Find buildings in non-monopoly color groups or partial sets (level > 0).
 * Downgrading recovers 50% build cost.
 */
function findNonMonopolyDowngradeCell(
  ownedCells: readonly number[],
  botId: string,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): number | null {
  const candidates: Array<{ cellIndex: number; level: number; rent: number }> = [];

  for (const cellIndex of ownedCells) {
    const state = stateMap.get(cellIndex);
    const level = state?.level ?? 0;
    if (level <= 0) continue;

    if (!hasMonopoly(botId, cellIndex, registry)) {
      if (checkEvenDowngrading(cellIndex, stateMap).valid) {
        const cell = BOARD_CONFIG[cellIndex];
        const rent = resolveRent(cell, cellIndex, botId, registry, stateMap);
        candidates.push({ cellIndex, level, rent });
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => (a.rent !== b.rent ? a.rent - b.rent : a.cellIndex - b.cellIndex));
  return candidates[0]!.cellIndex;
}

/**
 * Step 2: Find unbuilt single (non-monopoly) properties with lowest rent to mortgage.
 * Mortgaging receives 50% land price.
 */
function findSingleMortgageCell(
  ownedCells: readonly number[],
  bot: Player,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): number | null {
  const candidates: Array<{ cellIndex: number; rent: number; price: number }> = [];

  for (const cellIndex of ownedCells) {
    if (isCellMortgaged(cellIndex, bot, stateMap)) continue;

    const deed = PROPERTY_DEEDS.get(cellIndex);
    if (!deed) continue;

    const state = stateMap.get(cellIndex);
    if ((state?.level ?? 0) > 0 || state?.isETC || state?.isUpgradedUtility) continue;

    if (!hasMonopoly(bot.id, cellIndex, registry)) {
      const cell = BOARD_CONFIG[cellIndex];
      if (cell?.colorGroup) {
        const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
        if (groupCells.some((c) => (stateMap.get(c.index)?.level ?? 0) > 0)) continue;
      }
      const rent = resolveRent(cell, cellIndex, bot.id, registry, stateMap);
      candidates.push({ cellIndex, rent, price: deed.price });
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) =>
    a.rent !== b.rent ? a.rent - b.rent : a.price !== b.price ? a.price - b.price : a.cellIndex - b.cellIndex,
  );
  return candidates[0]!.cellIndex;
}

/**
 * Step 3: Find buildings in full monopoly groups adhering to Even-Downgrade.
 * Downgrades 1 level to recover 50% construction cost.
 */
function findMonopolyDowngradeCell(
  ownedCells: readonly number[],
  botId: string,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): number | null {
  const candidates: Array<{ cellIndex: number; price: number; level: number }> = [];

  for (const cellIndex of ownedCells) {
    const state = stateMap.get(cellIndex);
    const level = state?.level ?? 0;
    if (level <= 0) continue;

    if (hasMonopoly(botId, cellIndex, registry)) {
      if (checkEvenDowngrading(cellIndex, stateMap).valid) {
        const deed = PROPERTY_DEEDS.get(cellIndex);
        candidates.push({ cellIndex, price: deed?.price ?? 0, level });
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) =>
    a.price !== b.price ? a.price - b.price : b.level !== a.level ? b.level - a.level : a.cellIndex - b.cellIndex,
  );
  return candidates[0]!.cellIndex;
}

/**
 * Step 4: Mortgage remaining unbuilt properties that have not been mortgaged yet.
 */
function findRemainingMortgageCell(
  ownedCells: readonly number[],
  bot: Player,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): number | null {
  const candidates: Array<{ cellIndex: number; rent: number; price: number }> = [];

  for (const cellIndex of ownedCells) {
    if (isCellMortgaged(cellIndex, bot, stateMap)) continue;

    const deed = PROPERTY_DEEDS.get(cellIndex);
    if (!deed) continue;

    const state = stateMap.get(cellIndex);
    if ((state?.level ?? 0) > 0 || state?.isETC || state?.isUpgradedUtility) continue;

    const cell = BOARD_CONFIG[cellIndex];
    if (cell?.colorGroup) {
      const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
      if (groupCells.some((c) => (stateMap.get(c.index)?.level ?? 0) > 0)) continue;
    }
    const rent = resolveRent(cell, cellIndex, bot.id, registry, stateMap);
    candidates.push({ cellIndex, rent, price: deed.price });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) =>
    a.rent !== b.rent ? a.rent - b.rent : a.price !== b.price ? a.price - b.price : a.cellIndex - b.cellIndex,
  );
  return candidates[0]!.cellIndex;
}

/**
 * Executes decision tree to rescue negative cash flow when bot is in insolvency.
 * Returns optimal next intent in 5 priority steps.
 * [UC-BOT-03/MSS]
 */
export function resolveInsolvencyStep(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): BotIntent {
  if (bot.balance >= 0) {
    return { type: 'INTENT_END_TURN' };
  }

  const ownedCells = getOwnedCells(bot.id, registry);

  // Step 1: Downgrade buildings in non-monopoly groups
  const step1Cell = findNonMonopolyDowngradeCell(ownedCells, bot.id, registry, stateMap);
  if (step1Cell !== null) {
    return { type: 'INTENT_DOWNGRADE', cellIndex: step1Cell };
  }

  const tradeFrozen = isTradeFrozen(room);

  // Step 2: Mortgage unbuilt single (non-monopoly) properties with lowest rent (if not frozen)
  if (!tradeFrozen) {
    const step2Cell = findSingleMortgageCell(ownedCells, bot, registry, stateMap);
    if (step2Cell !== null) {
      return { type: 'INTENT_MORTGAGE', cellIndex: step2Cell };
    }
  }

  // Step 3: Downgrade buildings in monopoly groups adhering to Even-Downgrade
  const step3Cell = findMonopolyDowngradeCell(ownedCells, bot.id, registry, stateMap);
  if (step3Cell !== null) {
    return { type: 'INTENT_DOWNGRADE', cellIndex: step3Cell };
  }

  // Step 4: Mortgage remaining unbuilt properties (if not frozen)
  if (!tradeFrozen) {
    const step4Cell = findRemainingMortgageCell(ownedCells, bot, registry, stateMap);
    if (step4Cell !== null) {
      return { type: 'INTENT_MORTGAGE', cellIndex: step4Cell };
    }
  }

  // Step 5: Fully exhausted assets -> declare bankruptcy
  return { type: 'INTENT_BANKRUPTCY' };
}

