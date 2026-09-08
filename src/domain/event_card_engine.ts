// [UC-GAME-038..041/MSS] Event Card Engine — Enums, Constants & Deck
import type { Player, MarketModifier, Room } from './room';
import { TurnPhase } from './room';
import type { PropertyRegistry, PropertyStateMap } from './property_manager';
import { executeMarketCard, executeChanceCard } from './card_handlers';
import {
  MarketCardId, ChanceCardId, HOSE_OUTCOMES,
} from './event_card_types';

export {
  MarketCardId,
  ChanceCardId,
  RESORT_CELLS,
  COASTAL_CELLS,
  SERVICE_CELLS,
  INFRA_CELLS,
  UTILITY_CELLS,
  UTILITY_CELLS_ECE,
  HANOI_HCMC_CELLS,
  LAND_FEVER_CELLS,
  HOSE_OUTCOMES,
} from './event_card_types';

export function shuffle<T>(deck: T[], rng: () => number): T[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export const createMarketDeck = (rng: () => number): MarketCardId[] => shuffle(Object.values(MarketCardId), rng);
export const createChanceDeck = (rng: () => number): ChanceCardId[] => shuffle(Object.values(ChanceCardId), rng);
export const resolveHoseInvestment = (stake: number, face: number): number =>
  Math.floor(stake * (HOSE_OUTCOMES[face] ?? 0));

export function applyMarketCard(
  card: MarketCardId,
  activeModifiers: MarketModifier[],
  players?: Player[],
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
): void {
  executeMarketCard(card, activeModifiers, players, registry, stateMap);
}

export function applyChanceCard(
  card: ChanceCardId,
  playerId: string,
  players: Player[],
  activeModifiers?: MarketModifier[],
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
): Record<string, never> {
  return executeChanceCard(card, playerId, players, activeModifiers, registry, stateMap);
}

export function drawMarketCard(room: Room, reg: PropertyRegistry, sm: PropertyStateMap, rng: () => number): void {
  if (room.marketDeck.length === 0 && room.marketDiscard.length > 0) {
    room.marketDeck = shuffle(room.marketDiscard.splice(0), rng);
  }
  const card = room.marketDeck.shift();
  if (card) {
    applyMarketCard(card, room.activeModifiers, room.players, reg, sm);
    room.marketDiscard.push(card);
  }
  room.phase = TurnPhase.PropertyManagement;
}

export function drawChanceCard(room: Room, current: Player, rng: () => number, reg?: PropertyRegistry, sm?: PropertyStateMap): void {
  if (room.chanceDeck.length === 0 && room.chanceDiscard.length > 0) {
    room.chanceDeck = shuffle(room.chanceDiscard.splice(0), rng);
  }
  const card = room.chanceDeck.shift();
  if (card) {
    applyChanceCard(card, current.id, room.players, room.activeModifiers, reg, sm);
    if (card !== ChanceCardId.CC_DIPLOMATIC) room.chanceDiscard.push(card);
  }
  room.phase = TurnPhase.PropertyManagement;
}

export function decayModifiers(modifiers: MarketModifier[]): MarketModifier[] {
  return modifiers
    .map((m) => ({ ...m, remainingRounds: m.remainingRounds - 1 }))
    .filter((m) => m.remainingRounds > 0);
}
