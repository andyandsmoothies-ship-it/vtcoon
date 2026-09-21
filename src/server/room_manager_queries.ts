// [IMP-64] Extracted pure query functions from RoomManager
// ZERO LOGIC CHANGE — code moved verbatim from room_manager.ts
import { resolveRent, type PropertyRegistry, type PropertyStateMap } from '../domain/property_manager.js';
import { BOARD_CONFIG } from '../domain/board_config.js';
import { calculateRankings } from './insolvency_manager.js';
import { buildDeltaFromRoom, type DeltaPayload } from './session_manager.js';
import type { Room } from '../domain/room.js';
import type { AuctionSession } from './auction_manager.js';

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
