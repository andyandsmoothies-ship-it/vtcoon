// [UC-GAME-038..041/MSS] Event Card Handlers — 16 Market Cards & 20 Chance Cards
// Traceability: docs/requirements.md §V (DANH MỤC CHI TIẾT CÁC THẺ SỰ KIỆN)

import type { Player, MarketModifier } from './room';
import type { PropertyRegistry, PropertyStateMap } from './property_manager';
import { PROPERTY_DEEDS, resolveRent } from './property_manager';
import { BOARD_CONFIG, CellType } from './board_config';
import {
  MarketCardId,
  ChanceCardId,
  RESORT_CELLS,
  COASTAL_CELLS,
  SERVICE_CELLS,
  INFRA_CELLS,
  UTILITY_CELLS,
  HANOI_HCMC_CELLS,
  LAND_FEVER_CELLS,
} from './event_card_types';

const FIRE_PENALTIES: Readonly<Record<number, number>> = { 1: 200, 2: 400, 3: 800 };
const DEBT_AMOUNTS: Readonly<Record<string, number>> = {
  [ChanceCardId.CC_OVERDRAFT]: 3000,
  [ChanceCardId.CC_FREE_CREDIT]: 2000,
};

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

export function executeMarketCard(
  card: MarketCardId,
  activeModifiers: MarketModifier[],
  players?: Player[],
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
): void {
  switch (card) {
    case MarketCardId.MC_PEAK_TOURISM:
      activeModifiers.push({ type: card, affectedCells: RESORT_CELLS, remainingRounds: 1, multiplier: 2 });
      break;
    case MarketCardId.MC_COASTAL_STORM:
      activeModifiers.push({ type: card, affectedCells: COASTAL_CELLS, remainingRounds: 1, multiplier: 0 });
      break;
    case MarketCardId.MC_NIGHT_ECONOMY:
      activeModifiers.push({ type: card, affectedCells: SERVICE_CELLS, remainingRounds: 1, multiplier: 2 });
      break;
    case MarketCardId.MC_ALCOHOL_CHECK:
      activeModifiers.push({ type: card, affectedCells: SERVICE_CELLS, remainingRounds: 2, multiplier: 0.5 });
      break;
    case MarketCardId.MC_LAND_FEVER:
      activeModifiers.push({ type: card, affectedCells: LAND_FEVER_CELLS, remainingRounds: 1, multiplier: 2 });
      break;
    case MarketCardId.MC_RATE_HIKE:
      activeModifiers.push({ type: card, affectedCells: BOARD_CONFIG.map((c) => c.index), remainingRounds: 1, multiplier: 0.8 });
      break;
    case MarketCardId.MC_CREDIT_STIMULUS:
      activeModifiers.push({ type: card, affectedCells: [], remainingRounds: 2 });
      break;
    case MarketCardId.MC_ANTI_SPECULATE:
      activeModifiers.push({ type: card, affectedCells: [], remainingRounds: 1 });
      break;
    case MarketCardId.MC_FREEZE_TRADE:
      activeModifiers.push({ type: card, affectedCells: [], remainingRounds: 1 });
      break;
    case MarketCardId.MC_FUEL_SURGE:
      activeModifiers.push({ type: card, affectedCells: INFRA_CELLS, remainingRounds: 1 });
      break;
    case MarketCardId.MC_URBAN_PLANNING:
      activeModifiers.push({ type: card, affectedCells: HANOI_HCMC_CELLS, remainingRounds: 1 });
      break;
    case MarketCardId.MC_UTILITY_DOUBLE:
      activeModifiers.push({ type: card, affectedCells: UTILITY_CELLS, remainingRounds: 1, multiplier: 2 });
      break;
    case MarketCardId.MC_FIRE_INSPECTION:
      if (players && registry && stateMap) handleFireInspection(players, registry, stateMap);
      break;
    case MarketCardId.MC_PUBLIC_INVEST:
      if (players) handlePublicInvest(players, registry);
      break;
    case MarketCardId.MC_CASINO_PILOT:
      if (players) handleCasinoPilot(players, registry, stateMap);
      break;
    case MarketCardId.MC_MEGA_CONCERT:
      if (players) handleMegaConcert(players, registry, stateMap);
      break;
  }
}

function handleTaxAudit(player: Player, registry?: PropertyRegistry, stateMap?: PropertyStateMap): void {
  if (!registry) return;
  let unbuiltCount = 0;
  for (const [cellIndex, ownerId] of registry) {
    if (ownerId === player.id) {
      const isProperty = BOARD_CONFIG[cellIndex]?.type === CellType.Property;
      if (isProperty && (stateMap?.get(cellIndex)?.level ?? 0) === 0) unbuiltCount++;
    }
  }
  player.balance -= unbuiltCount * 200;
}

function handleContractPenalty(player: Player, players: Player[]): void {
  player.balance -= 1000;
  const opponents = players.filter((p) => p.id !== player.id);
  if (opponents.length === 0) return;
  let poorest = opponents[0]!;
  for (let i = 1; i < opponents.length; i++) {
    if (opponents[i]!.balance < poorest.balance) poorest = opponents[i]!;
  }
  poorest.balance += 1000;
}

function handleFranchise(player: Player, players: Player[]): void {
  for (const p of players) {
    if (p.id !== player.id) {
      p.balance -= 300;
      player.balance += 300;
    }
  }
}

function handleLandReclaim(player: Player, registry?: PropertyRegistry, stateMap?: PropertyStateMap): void {
  if (!registry) return;
  for (const [cellIndex, ownerId] of registry) {
    if (ownerId === player.id) {
      const isProperty = BOARD_CONFIG[cellIndex]?.type === CellType.Property;
      const level = stateMap?.get(cellIndex)?.level ?? 0;
      if (isProperty && level === 0) {
        const price = PROPERTY_DEEDS.get(cellIndex)?.price ?? 0;
        registry.delete(cellIndex);
        player.balance += Math.floor(price * 1.5);
        return;
      }
    }
  }
}

function handleMaForce(player: Player, players: Player[], registry?: PropertyRegistry, stateMap?: PropertyStateMap): void {
  if (!registry) return;
  const opponents = players.filter((p) => p.id !== player.id && p.balance < player.balance);
  for (const opp of opponents) {
    for (const [cellIndex, ownerId] of registry) {
      if (ownerId === opp.id) {
        const isProperty = BOARD_CONFIG[cellIndex]?.type === CellType.Property;
        const level = stateMap?.get(cellIndex)?.level ?? 0;
        if (isProperty && level === 0) {
          const deed = PROPERTY_DEEDS.get(cellIndex);
          const cost = deed ? Math.floor(deed.price * 1.2) : 0;
          if (player.balance >= cost) {
            player.balance -= cost;
            opp.balance += cost;
            registry.set(cellIndex, player.id);
            return;
          }
        }
      }
    }
  }
}

function handleSwapProject(player: Player, registry?: PropertyRegistry, stateMap?: PropertyStateMap): void {
  if (!registry) return;
  for (const [cell1, owner1] of registry) {
    if (owner1 === player.id && (stateMap?.get(cell1)?.level ?? 0) === 0) {
      const colorGroup = BOARD_CONFIG[cell1]?.colorGroup;
      if (!colorGroup) continue;
      for (const [cell2, owner2] of registry) {
        if (cell1 !== cell2 && owner2 !== player.id && BOARD_CONFIG[cell2]?.colorGroup === colorGroup) {
          if ((stateMap?.get(cell2)?.level ?? 0) === 0) {
            registry.set(cell1, owner2);
            registry.set(cell2, player.id);
            return;
          }
        }
      }
    }
  }
}

export function executeChanceCard(
  card: ChanceCardId,
  playerId: string,
  players: Player[],
  activeModifiers?: MarketModifier[],
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
): Record<string, never> {
  const player = players.find((p) => p.id === playerId);
  if (!player) return {};

  switch (card) {
    case ChanceCardId.CC_STOCK_PROFIT:
      player.balance += 2500;
      break;
    case ChanceCardId.CC_DIPLOMATIC:
      player.hand.push(card);
      break;
    case ChanceCardId.CC_TAX_AUDIT:
      handleTaxAudit(player, registry, stateMap);
      break;
    case ChanceCardId.CC_OVERDRAFT:
    case ChanceCardId.CC_FREE_CREDIT: {
      const amt = DEBT_AMOUNTS[card];
      if (amt !== undefined) {
        player.balance += amt;
        player.pendingDebts.push(card);
      }
      break;
    }
    case ChanceCardId.CC_PLATE_AUCTION:
      player.balance -= 500;
      player.extraTurns += 1;
      player.consecutiveDoubles += 1;
      break;
    case ChanceCardId.CC_CONTRACT_PENALTY:
      handleContractPenalty(player, players);
      break;
    case ChanceCardId.CC_LAND_CHANGE:
      player.balance -= 800;
      break;
    case ChanceCardId.CC_BUILD_HALT:
      if (registry && activeModifiers) {
        const owned = Array.from(registry.entries()).find(([c, o]) => o === player.id && BOARD_CONFIG[c]?.type === CellType.Property);
        if (owned) activeModifiers.push({ type: MarketCardId.MC_COASTAL_STORM, affectedCells: [owned[0]], remainingRounds: 2, multiplier: 0 });
      }
      break;
    case ChanceCardId.CC_MA_FORCE:
      handleMaForce(player, players, registry, stateMap);
      break;
    case ChanceCardId.CC_COPYRIGHT:
      player.balance -= 400;
      break;
    case ChanceCardId.CC_JUNK_STOCK:
      player.balance -= 1500;
      break;
    case ChanceCardId.CC_FRANCHISE:
      handleFranchise(player, players);
      break;
    case ChanceCardId.CC_LAND_RECLAIM:
      handleLandReclaim(player, registry, stateMap);
      break;
    case ChanceCardId.CC_VENUE_INCIDENT:
      if (registry) {
        const ownsService = Array.from(registry.entries()).some(
          ([c, o]) => o === player.id && (SERVICE_CELLS as readonly number[]).includes(c),
        );
        if (ownsService) player.balance -= 800;
      }
      break;
    case ChanceCardId.CC_CONCERT_SPONSOR:
      player.balance -= 600;
      player.doubleNextDice = true;
      break;
    case ChanceCardId.CC_PORT_EXCLUSIVE:
      if (activeModifiers) activeModifiers.push({ type: card as unknown as MarketCardId, affectedCells: INFRA_CELLS, remainingRounds: 2, multiplier: 0.5 });
      break;
    case ChanceCardId.CC_SLOW_BUILD:
      if (registry) {
        const unbuilt = Array.from(registry.entries()).find(([c, o]) => o === player.id && BOARD_CONFIG[c]?.type === CellType.Property && (stateMap?.get(c)?.level ?? 0) === 0);
        if (unbuilt) registry.delete(unbuilt[0]);
      }
      break;
    case ChanceCardId.CC_MEDIA_CRISIS:
      if (registry && activeModifiers) {
        const sCell = Array.from(registry.entries()).find(([c, o]) => o === player.id && (SERVICE_CELLS as readonly number[]).includes(c));
        if (sCell) activeModifiers.push({ type: MarketCardId.MC_COASTAL_STORM, affectedCells: [sCell[0]], remainingRounds: 1, multiplier: 0 });
      }
      break;
    case ChanceCardId.CC_SWAP_PROJECT:
      handleSwapProject(player, registry, stateMap);
      break;
  }
  return {};
}
