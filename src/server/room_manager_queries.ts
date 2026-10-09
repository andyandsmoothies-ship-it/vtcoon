// [IMP-64] Extracted pure query functions from RoomManager
// ZERO LOGIC CHANGE — code moved verbatim from room_manager.ts & insolvency_manager.ts
import { resolveRent, PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../domain/property_manager.js';
import { BOARD_CONFIG } from '../domain/board_config.js';
import { buildDeltaFromRoom, type DeltaPayload } from './session_manager.js';
import type { Room } from '../domain/room.js';
import type { AuctionSession } from './auction_manager.js';

export const LEVEL_MULTIPLIER: Record<number, number> = { 0: 1, 1: 1.5, 2: 2.5, 3: 4 };

export function calcPropertyRent(
  reg: PropertyRegistry | undefined,
  propertyStates: PropertyStateMap | undefined,
  cellIndex: number,
  diceTotal?: number,
): number {
  const ownerId = reg?.get(cellIndex);
  if (!reg || !ownerId) return 0;
  return resolveRent(BOARD_CONFIG[cellIndex], cellIndex, ownerId, reg, propertyStates, diceTotal);
}

// --- UC-GAME-055: Quyết Toán Net Worth ---
export function calculateNetWorth(
  playerId: string,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  players: Room['players'],
): number {
  const player = players.find((p) => p.id === playerId);
  if (!player) return 0;

  let worth = player.balance;
  const MORTGAGE_RATE = 0.5;

  for (const [cellIndex, owner] of registry) {
    if (owner !== playerId) continue;
    const deed = PROPERTY_DEEDS.get(cellIndex);
    if (!deed) continue;
    const level = stateMap.get(cellIndex)?.level ?? 0;
    const mult = LEVEL_MULTIPLIER[level] ?? 1;
    worth += Math.floor(deed.price * mult);

    if (player.mortgagedProperties?.includes(cellIndex)) {
      const loan = player.mortgageLoans?.[cellIndex] ?? Math.floor(deed.price * MORTGAGE_RATE);
      worth -= loan;
    }
  }
  return worth;
}

export function calculateRankings(
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): Array<{ id: string; netWorth: number }> {
  return room.players
    .map((p) => ({ id: p.id, netWorth: calculateNetWorth(p.id, registry, stateMap, room.players), bankrupt: Boolean(p.bankrupt) }))
    .sort((a, b) => (b.netWorth !== a.netWorth ? b.netWorth - a.netWorth : (a.bankrupt ? 1 : 0) - (b.bankrupt ? 1 : 0)))
    .map(({ id, netWorth }) => ({ id, netWorth }));
}

export function calcRankings(
  room: Room,
  reg: PropertyRegistry,
  sm: PropertyStateMap,
): Array<{ id: string; netWorth: number }> {
  return calculateRankings(room, reg, sm);
}

export function buildRoomDelta(
  room: Room,
  reg: PropertyRegistry,
  sm: PropertyStateMap,
  tick: number,
  auctions: Map<string, AuctionSession>,
  timeRemaining?: number,
  lastAuctionResults?: Map<string, any>,
): DeltaPayload {
  return buildDeltaFromRoom(room, reg, sm, tick, auctions, timeRemaining, lastAuctionResults);
}
