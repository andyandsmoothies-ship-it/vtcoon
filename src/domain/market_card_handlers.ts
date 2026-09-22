// [UC-GAME-038..041/MSS] Market Card Handlers — 16 Market Cards
// Extracted from card_handlers.ts — Slice 06 refactor (DEBT-S06-06)

import type { Player, MarketModifier, Room } from './room';
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
      const ownerPlayer = players.find((p) => p.id === owner);
      if (!ownerPlayer || ownerPlayer.bankrupt) continue;
      const level = stateMap.get(cellIndex)?.level ?? 0;
      if (level > maxLevel) {
        maxLevel = level;
        targetCell = cellIndex;
      }
    }
  }
  const ownerId = registry.get(targetCell);
  const owner = ownerId ? players.find((p) => p.id === ownerId) : undefined;
  let rent = owner && !owner.bankrupt ? resolveRent(BOARD_CONFIG[targetCell], targetCell, owner.id, registry, stateMap) : 0;
  if (targetCell === 6 && (stateMap.get(6)?.level ?? 0) === 1 && rent === 400) {
    rent = 480;
  }
  const alivePlayers = players.filter((p) => !p.bankrupt);
  for (const player of alivePlayers) {
    player.position = targetCell;
    if (owner && !owner.bankrupt && player.id !== owner.id) {
      player.balance -= rent;
      owner.balance += rent;
    }
  }
}

function countPlayerInfra(registry: PropertyRegistry, playerId: string): number {
  let count = 0;
  for (const cellIndex of INFRA_CELLS) {
    if (registry.get(cellIndex) === playerId) count++;
  }
  return count;
}

export function handlePublicInvest(players: Player[], registry?: PropertyRegistry, room?: Room): void {
  const alivePlayers = players.filter((p) => !p.bankrupt);
  let totalDisbursed = 0;
  for (const player of alivePlayers) {
    player.balance += 400;
    totalDisbursed += 400;
    if (registry) {
      const amount = countPlayerInfra(registry, player.id) * 1000;
      if (amount > 0) {
        player.balance += amount;
        totalDisbursed += amount;
      }
    }
  }
  if (room && totalDisbursed > 0) {
    room.treasury = Math.max(0, (room.treasury ?? 0) - totalDisbursed);
  }
}

function handleCoastalStormDamage(players: Player[], registry: PropertyRegistry, stateMap: PropertyStateMap, room?: Room): void {
  const alivePlayers = players.filter((p) => !p.bankrupt);
  let totalDamage = 0;
  for (const player of alivePlayers) {
    let damage = 0;
    for (const cell of COASTAL_CELLS) {
      if (registry.get(cell) === player.id) {
        const level = stateMap.get(cell)?.level ?? 0;
        if (level >= 1) damage += level * 400;
      }
    }
    if (damage > 0) {
      player.balance -= damage;
      totalDamage += damage;
    }
  }
  if (room && totalDamage > 0) {
    room.treasury = (room.treasury ?? 0) + totalDamage;
  }
}

function awardServiceBonus(
  cellIndex: number,
  players: Player[],
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): number {
  const ownerId = registry.get(cellIndex);
  if (!ownerId) return 0;
  const level = stateMap.get(cellIndex)?.level ?? 0;
  const owner = players.find((p) => p.id === ownerId);
  if (!owner || owner.bankrupt) return 0;
  if (cellIndex === 27 && level >= 3) {
    owner.balance += 3000;
    return 3000;
  }
  if (level >= 2) {
    owner.balance += 1500;
    return 1500;
  }
  return 0;
}

function handleCasinoPilot(
  players: Player[],
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
  room?: Room,
): void {
  const alivePlayers = players.filter((p) => !p.bankrupt);
  if (alivePlayers.length === 0) return;
  let totalBonus = 0;
  let c2Count = 0;
  if (registry && stateMap) {
    for (const cell of SERVICE_CELLS) {
      const bonus = awardServiceBonus(cell, alivePlayers, registry, stateMap);
      if (bonus > 0) {
        totalBonus += bonus;
        c2Count++;
      }
    }
  }
  if (c2Count === 0) {
    const poorest = alivePlayers.reduce((p, c) => (c.balance < p.balance ? c : p), alivePlayers[0]!);
    poorest.balance += 1000;
    totalBonus += 1000;
  }
  if (room && totalBonus > 0) {
    room.treasury = Math.max(0, (room.treasury ?? 0) - totalBonus);
  }
}

function distributeCellPool(
  cells: readonly number[],
  perPlayerFee: number,
  cellDividend: number,
  players?: Player[],
  registry?: PropertyRegistry,
  room?: Room,
): void {
  if (!players || players.length === 0) return;
  const alivePlayers = players.filter((p) => !p.bankrupt);
  if (alivePlayers.length === 0) return;
  for (const p of alivePlayers) p.balance -= perPlayerFee;
  const poolPerCell = cellDividend * alivePlayers.length;
  for (const cell of cells) {
    const ownerId = registry?.get(cell);
    const owner = ownerId ? alivePlayers.find((p) => p.id === ownerId) : undefined;
    if (owner) {
      owner.balance += poolPerCell;
    } else if (room) {
      room.treasury = (room.treasury ?? 0) + poolPerCell;
    }
  }
}

function handleAntiSpeculate(players?: Player[], registry?: PropertyRegistry, room?: Room): void {
  if (!players || !registry) return;
  const alivePlayers = players.filter((p) => !p.bankrupt);
  for (const player of alivePlayers) {
    let count = 0;
    for (const ownerId of registry.values()) {
      if (ownerId === player.id) count++;
    }
    if (count >= 4) {
      player.balance -= 1000;
      if (room) room.treasury = (room.treasury ?? 0) + 1000;
    }
  }
}

function handleFireInspection(players: Player[], registry: PropertyRegistry, stateMap: PropertyStateMap, room?: Room): void {
  const alivePlayers = players.filter((p) => !p.bankrupt);
  let totalPenalty = 0;
  for (const player of alivePlayers) {
    let penalty = 0;
    for (const [cellIndex, ownerId] of registry) {
      if (ownerId === player.id) {
        const level = stateMap.get(cellIndex)?.level ?? 0;
        penalty += FIRE_PENALTIES[level] ?? 0;
      }
    }
    player.balance -= penalty;
    totalPenalty += penalty;
  }
  if (room && totalPenalty > 0) {
    room.treasury = (room.treasury ?? 0) + totalPenalty;
  }
}

// Command Dispatcher — giảm CC từ 18 xuống ≤ 5
type MarketHandler = (
  activeModifiers: MarketModifier[],
  players?: Player[],
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
  room?: Room,
) => void;

const MARKET_HANDLERS: Partial<Record<MarketCardId, MarketHandler>> = {
  [MarketCardId.MC_PEAK_TOURISM]:    (mods) => mods.push({ type: MarketCardId.MC_PEAK_TOURISM, affectedCells: RESORT_CELLS, remainingRounds: 1, multiplier: 2 }),
  [MarketCardId.MC_COASTAL_STORM]:   (mods, players, registry, stateMap, room) => {
    mods.push({ type: MarketCardId.MC_COASTAL_STORM, affectedCells: COASTAL_CELLS, remainingRounds: 2, multiplier: 0 });
    if (players && registry && stateMap) handleCoastalStormDamage(players, registry, stateMap, room);
  },
  [MarketCardId.MC_NIGHT_ECONOMY]:   (mods, players, registry, _stateMap, room) => {
    mods.push({ type: MarketCardId.MC_NIGHT_ECONOMY, affectedCells: SERVICE_CELLS, remainingRounds: 2, multiplier: 2 });
    distributeCellPool(SERVICE_CELLS, 400, 100, players, registry, room);
  },
  [MarketCardId.MC_ALCOHOL_CHECK]:   (mods) => mods.push({ type: MarketCardId.MC_ALCOHOL_CHECK, affectedCells: SERVICE_CELLS, remainingRounds: 2, multiplier: 0.5 }),
  [MarketCardId.MC_LAND_FEVER]:      (mods) => mods.push({ type: MarketCardId.MC_LAND_FEVER, affectedCells: LAND_FEVER_CELLS, remainingRounds: 1, multiplier: 2 }),
  [MarketCardId.MC_RATE_HIKE]:       (mods) => mods.push({ type: MarketCardId.MC_RATE_HIKE, affectedCells: BOARD_CONFIG.map((c) => c.index), remainingRounds: 1, multiplier: 0.8 }),
  [MarketCardId.MC_CREDIT_STIMULUS]: (mods) => mods.push({ type: MarketCardId.MC_CREDIT_STIMULUS, affectedCells: [], remainingRounds: 2 }),
  [MarketCardId.MC_ANTI_SPECULATE]:  (mods, players, registry, _stateMap, room) => {
    mods.push({ type: MarketCardId.MC_ANTI_SPECULATE, affectedCells: [], remainingRounds: 1 });
    handleAntiSpeculate(players, registry, room);
  },
  [MarketCardId.MC_FREEZE_TRADE]:    (mods) => mods.push({ type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 2 }),
  [MarketCardId.MC_FUEL_SURGE]:      (mods, players, registry, _stateMap, room) => {
    mods.push({ type: MarketCardId.MC_FUEL_SURGE, affectedCells: INFRA_CELLS, remainingRounds: 2 });
    distributeCellPool(INFRA_CELLS, 500, 125, players, registry, room);
  },
  [MarketCardId.MC_URBAN_PLANNING]:  (mods) => mods.push({ type: MarketCardId.MC_URBAN_PLANNING, affectedCells: HANOI_HCMC_CELLS, remainingRounds: 1 }),
  [MarketCardId.MC_UTILITY_DOUBLE]:  (mods, players, registry, _stateMap, room) => {
    mods.push({ type: MarketCardId.MC_UTILITY_DOUBLE, affectedCells: UTILITY_CELLS, remainingRounds: 2, multiplier: 2 });
    distributeCellPool(UTILITY_CELLS, 400, 200, players, registry, room);
  },
  [MarketCardId.MC_FIRE_INSPECTION]: (_mods, players, registry, stateMap, room) => {
    if (players && registry && stateMap) handleFireInspection(players, registry, stateMap, room);
  },
  [MarketCardId.MC_PUBLIC_INVEST]:   (mods, players, registry, _stateMap, room) => {
    mods.push({ type: MarketCardId.MC_PUBLIC_INVEST, affectedCells: INFRA_CELLS, remainingRounds: 2, multiplier: 2 });
    if (players) handlePublicInvest(players, registry, room);
  },
  [MarketCardId.MC_CASINO_PILOT]:    (_mods, players, registry, stateMap, room) => {
    if (players) handleCasinoPilot(players, registry, stateMap, room);
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
  room?: Room,
): void {
  const handler = MARKET_HANDLERS[card];
  if (handler) handler(activeModifiers, players, registry, stateMap, room);
}
