// [UC-GAME-038..041/MSS] Market Card Handlers — 16 Market Cards
// Extracted from card_handlers.ts — Slice 06 refactor (DEBT-S06-06)

import type { Player, MarketModifier } from './room';
import type { PropertyRegistry, PropertyStateMap } from './property_data';
import { resolveRent } from './property_rent';
import { BOARD_CONFIG } from './board_config';
import {
  MarketCardId,
  RESORT_CELLS,
  COASTAL_CELLS,
  SERVICE_CELLS,
  INFRA_CELLS,
  UTILITY_CELLS,
  HANOI_HCMC_CELLS,
  LAND_FEVER_CELLS,
} from './event_card_types';

const FIRE_PENALTIES: Readonly<Record<number, number>> = { 1: 200, 2: 400, 3: 800 };

function handleMegaConcert(
  players: Player[],
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
): void {
  if (!registry || !stateMap) return;
  let targetCell: number = SERVICE_CELLS[0];
  let maxLevel = -1;
  for (const cellIndex of SERVICE_CELLS) {
    const owner = registry.get(cellIndex);
    if (owner !== undefined) {
      const level = stateMap.get(cellIndex)?.level ?? 0;
      if (level > maxLevel) {
        maxLevel = level;
        targetCell = cellIndex;
      }
    }
  }
  const ownerId = registry.get(targetCell);
  const owner = ownerId ? players.find((p) => p.id === ownerId) : undefined;
  const rent = owner ? resolveRent(BOARD_CONFIG[targetCell], targetCell, owner.id, registry, stateMap) : 0;
  for (const player of players) {
    player.position = targetCell;
    if (owner && player.id !== owner.id) {
      player.balance -= rent;
      owner.balance += rent;
    }
  }
}

function handlePublicInvest(players: Player[], registry?: PropertyRegistry): void {
  if (!registry) return;
  for (const player of players) {
    let infraCount = 0;
    for (const cellIndex of INFRA_CELLS) {
      if (registry.get(cellIndex) === player.id) infraCount++;
    }
    player.balance += infraCount * 1000;
  }
}

function handleCasinoPilot(players: Player[], registry?: PropertyRegistry, stateMap?: PropertyStateMap): void {
  if (!registry || !stateMap) return;
  const ownerId = registry.get(27);
  if (!ownerId) return;
  if ((stateMap.get(27)?.level ?? 0) >= 3) {
    const owner = players.find((p) => p.id === ownerId);
    if (owner) owner.balance += 2000;
  }
}

function handleFireInspection(players: Player[], registry: PropertyRegistry, stateMap: PropertyStateMap): void {
  for (const player of players) {
    let penalty = 0;
    for (const [cellIndex, ownerId] of registry) {
      if (ownerId === player.id) {
        const level = stateMap.get(cellIndex)?.level ?? 0;
        penalty += FIRE_PENALTIES[level] ?? 0;
      }
    }
    player.balance -= penalty;
  }
}

// Command Dispatcher — giảm CC từ 18 xuống ≤ 5
type MarketHandler = (
  activeModifiers: MarketModifier[],
  players?: Player[],
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
) => void;

const MARKET_HANDLERS: Partial<Record<MarketCardId, MarketHandler>> = {
  [MarketCardId.MC_PEAK_TOURISM]:    (mods) => mods.push({ type: MarketCardId.MC_PEAK_TOURISM, affectedCells: RESORT_CELLS, remainingRounds: 1, multiplier: 2 }),
  [MarketCardId.MC_COASTAL_STORM]:   (mods) => mods.push({ type: MarketCardId.MC_COASTAL_STORM, affectedCells: COASTAL_CELLS, remainingRounds: 1, multiplier: 0 }),
  [MarketCardId.MC_NIGHT_ECONOMY]:   (mods) => mods.push({ type: MarketCardId.MC_NIGHT_ECONOMY, affectedCells: SERVICE_CELLS, remainingRounds: 1, multiplier: 2 }),
  [MarketCardId.MC_ALCOHOL_CHECK]:   (mods) => mods.push({ type: MarketCardId.MC_ALCOHOL_CHECK, affectedCells: SERVICE_CELLS, remainingRounds: 2, multiplier: 0.5 }),
  [MarketCardId.MC_LAND_FEVER]:      (mods) => mods.push({ type: MarketCardId.MC_LAND_FEVER, affectedCells: LAND_FEVER_CELLS, remainingRounds: 1, multiplier: 2 }),
  [MarketCardId.MC_RATE_HIKE]:       (mods) => mods.push({ type: MarketCardId.MC_RATE_HIKE, affectedCells: BOARD_CONFIG.map((c) => c.index), remainingRounds: 1, multiplier: 0.8 }),
  [MarketCardId.MC_CREDIT_STIMULUS]: (mods) => mods.push({ type: MarketCardId.MC_CREDIT_STIMULUS, affectedCells: [], remainingRounds: 2 }),
  [MarketCardId.MC_ANTI_SPECULATE]:  (mods) => mods.push({ type: MarketCardId.MC_ANTI_SPECULATE, affectedCells: [], remainingRounds: 1 }),
  [MarketCardId.MC_FREEZE_TRADE]:    (mods) => mods.push({ type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 1 }),
  [MarketCardId.MC_FUEL_SURGE]:      (mods) => mods.push({ type: MarketCardId.MC_FUEL_SURGE, affectedCells: INFRA_CELLS, remainingRounds: 1 }),
  [MarketCardId.MC_URBAN_PLANNING]:  (mods) => mods.push({ type: MarketCardId.MC_URBAN_PLANNING, affectedCells: HANOI_HCMC_CELLS, remainingRounds: 1 }),
  [MarketCardId.MC_UTILITY_DOUBLE]:  (mods) => mods.push({ type: MarketCardId.MC_UTILITY_DOUBLE, affectedCells: UTILITY_CELLS, remainingRounds: 1, multiplier: 2 }),
  [MarketCardId.MC_FIRE_INSPECTION]: (_mods, players, registry, stateMap) => {
    if (players && registry && stateMap) handleFireInspection(players, registry, stateMap);
  },
  [MarketCardId.MC_PUBLIC_INVEST]:   (_mods, players, registry) => {
    if (players) handlePublicInvest(players, registry);
  },
  [MarketCardId.MC_CASINO_PILOT]:    (_mods, players, registry, stateMap) => {
    if (players) handleCasinoPilot(players, registry, stateMap);
  },
  [MarketCardId.MC_MEGA_CONCERT]:    (_mods, players, registry, stateMap) => {
    if (players) handleMegaConcert(players, registry, stateMap);
  },
};

export function executeMarketCard(
  card: MarketCardId,
  activeModifiers: MarketModifier[],
  players?: Player[],
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
): void {
  const handler = MARKET_HANDLERS[card];
  if (handler) handler(activeModifiers, players, registry, stateMap);
}
