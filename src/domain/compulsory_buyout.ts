// [UC-IMP145] Compulsory Buyout Domain Logic (130% Compensation & Self-Determination)
import type { Player, Room } from './room.js';
import type { PropertyRegistry, PropertyStateMap } from './property_data.js';
import { PROPERTY_DEEDS } from './property_data.js';
import { BOARD_CONFIG } from './board_config.js';
import { hasMonopoly } from './property_upgrade.js';

export function calculateCompulsoryBuyoutCost(cellIndexOrPrice: number): number {
  const basePrice =
    cellIndexOrPrice < 40
      ? (PROPERTY_DEEDS.get(cellIndexOrPrice)?.price ?? 1000)
      : cellIndexOrPrice;
  return Math.floor(basePrice * 1.3);
}

export function isEligibleForCompulsoryBuyout(
  cellIndex: number,
  ownerId: string,
  registry: PropertyRegistry,
  stateMap?: PropertyStateMap,
  room?: Room,
  players?: Player[],
): boolean {
  const config = BOARD_CONFIG[cellIndex];
  if (!config?.colorGroup) return false;

  const state = stateMap?.get(cellIndex);
  if ((state?.level ?? 0) > 0) return false;
  if (state?.isMortgaged) return false;

  const owner = room?.players.find((p) => p.id === ownerId) ?? players?.find((p) => p.id === ownerId);
  if (owner?.bankrupt) return false;
  if (owner?.mortgagedProperties?.includes(cellIndex)) return false;

  if (hasMonopoly(ownerId, cellIndex, registry)) return false;

  return true;
}
