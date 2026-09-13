// [UC-GAME-007/MSS][UC-GAME-051..057/MSS] Room Property & Insolvency Coordinator
import { TurnPhase, ActionRejectReason, type Room, type Player } from '../domain/room.js';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager.js';
import type { DowngradeOptions } from '../domain/property_upgrade.js';
import { mortgageProperty, redeemProperty } from './mortgage_manager.js';
import { handleDowngrade, executeP2PTrade } from './property_actions.js';
import { liquidateAssets, declareBankruptcy } from './insolvency_manager.js';
import type { AuctionSession } from './auction_manager.js';

export interface RoomContext {
  readonly room: Room;
  readonly reg: PropertyRegistry;
  readonly sm: PropertyStateMap;
}

export function coordMortgage(
  ctx: RoomContext | undefined,
  playerId: string,
  cellIndex: number,
): { success: boolean; reason?: string } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  const res = mortgageProperty(ctx.room, playerId, cellIndex, ctx.reg, ctx.sm);
  if (res.success && ctx.room.phase === TurnPhase.InsolvencyPhase) {
    const p = ctx.room.players.find((pl) => pl.id === playerId);
    if (p && p.balance >= 0) ctx.room.phase = TurnPhase.PropertyManagement;
  }
  return res;
}

export function coordRedeem(
  ctx: RoomContext | undefined,
  playerId: string,
  cellIndex: number,
): { success: boolean; reason?: string } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  return redeemProperty(ctx.room, playerId, cellIndex, ctx.reg);
}

export function coordDowngrade(
  ctx: RoomContext | undefined,
  player: Player | undefined,
  cellIndex: number,
  roomCode: string,
  options?: DowngradeOptions,
): { success: boolean; reason?: string } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  const res = handleDowngrade(player, ctx.room.phase, cellIndex, ctx.reg, ctx.sm, roomCode, options);
  if (res.success && ctx.room.phase === TurnPhase.InsolvencyPhase && player && player.balance >= 0) {
    ctx.room.phase = TurnPhase.PropertyManagement;
  }
  return res;
}

export function coordLiquidate(
  ctx: RoomContext | undefined,
  playerId: string,
  auctions: Map<string, AuctionSession>,
  roomCode: string,
): { success: boolean } {
  if (!ctx) return { success: false };
  liquidateAssets(ctx.room, playerId, ctx.reg, ctx.sm, auctions, roomCode);
  return { success: true };
}

export function coordTrade(
  ctx: RoomContext | undefined,
  requesterId: string,
  sellerId: string,
  buyerId: string,
  cellIndex: number,
  price: number,
): { success: boolean; reason?: string } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  if (requesterId !== sellerId && requesterId !== buyerId) {
    return { success: false, reason: ActionRejectReason.UNAUTHORIZED };
  }
  return executeP2PTrade(ctx.room, sellerId, buyerId, cellIndex, price, ctx.reg, ctx.sm);
}

export function coordBankruptcy(
  ctx: RoomContext | undefined,
  playerId: string,
  creditorId: string | undefined,
  auctions: Map<string, AuctionSession>,
  roomCode: string,
  rolledThisTurn: Map<string, boolean>,
): { gameOver: boolean; rankings?: Array<{ id: string; netWorth: number }> } {
  if (!ctx) return { gameOver: false };
  const isCurrent = ctx.room.players[ctx.room.currentPlayerIndex]?.id === playerId;
  const res = declareBankruptcy(ctx.room, playerId, ctx.reg, ctx.sm, creditorId, auctions, roomCode);
  if (isCurrent && ctx.room.phase !== TurnPhase.AuctionPhase) {
    rolledThisTurn.set(roomCode, false);
  }
  return res;
}
