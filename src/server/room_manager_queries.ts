// [IMP-64] Extracted pure query functions from RoomManager
// ZERO LOGIC CHANGE — code moved verbatim from room_manager.ts & insolvency_manager.ts
import { BOARD_CONFIG, resolveRent, LEVEL_MULTIPLIER, calculateCellNetWorth, type Room, type PropertyRegistry, type PropertyStateMap } from '../domain/index.js';
import { buildDeltaFromRoom, type DeltaPayload } from './session_manager.js';
import type { AuctionSession } from './auction_manager.js';

export { LEVEL_MULTIPLIER };

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

  for (const [cellIndex, owner] of registry) {
    if (owner !== playerId) continue;
    const level = stateMap.get(cellIndex)?.level ?? 0;
    const isMortgaged = Boolean(
      player.mortgagedProperties?.includes(cellIndex) || stateMap.get(cellIndex)?.isMortgaged,
    );
    worth += calculateCellNetWorth(cellIndex, level, isMortgaged, player.mortgageLoans?.[cellIndex]);
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
