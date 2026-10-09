// [UC-GAME-007/MSS][UC-GAME-051..057/MSS] Room Property & Insolvency Coordinator
import { TurnPhase, ActionRejectReason, type Room, type Player } from '../domain/room.js';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager.js';
import type { DowngradeOptions } from '../domain/property_upgrade.js';
import { mortgageProperty, redeemProperty } from './mortgage_manager.js';
import { handleDowngrade } from './property_actions.js';
import { liquidateAssets, declareBankruptcy } from './insolvency_manager.js';
import type { AuctionSession } from './auction_manager.js';
import { type BotPersonality } from '../domain/bot/bot_types.js';
import {
  isRoomQuiescentForTrade,
  isCellLockedInPendingTrade,
  coordTrade,
  coordTradeOffer,
  coordRespondTradeOffer,
} from './room_trade_coordinator.js';

export {
  isRoomQuiescentForTrade,
  isCellLockedInPendingTrade,
  coordTrade,
  coordTradeOffer,
  coordRespondTradeOffer,
};

export interface RoomContext {
  readonly room: Room;
  readonly reg: PropertyRegistry;
  readonly sm: PropertyStateMap;
  readonly botPersonalities?: Map<string, BotPersonality>;
}

export function coordMortgage(
  ctx: RoomContext | undefined,
  playerId: string,
  cellIndex: number,
): { success: boolean; reason?: string } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  if (isCellLockedInPendingTrade(ctx.room, cellIndex)) {
    return { success: false, reason: ActionRejectReason.ASSET_LOCKED };
  }
  const res = mortgageProperty(ctx.room, playerId, cellIndex, ctx.reg, ctx.sm);
  if (res.success && ctx.room.phase === TurnPhase.InsolvencyPhase) {
    const p = ctx.room.players.find((pl) => pl.id === playerId);
    if (p && p.balance >= 0) {
      delete ctx.room.pendingInsolvencyCreditorId;
      delete ctx.room.pendingInsolvencyDebtorId;
      ctx.room.phase = TurnPhase.PropertyManagement;
    }
  }
  return res;
}

export function coordRedeem(
  ctx: RoomContext | undefined,
  playerId: string,
  cellIndex: number,
): { success: boolean; reason?: string } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  if (isCellLockedInPendingTrade(ctx.room, cellIndex)) {
    return { success: false, reason: ActionRejectReason.ASSET_LOCKED };
  }
  return redeemProperty(ctx.room, playerId, cellIndex, ctx.reg, ctx.sm);
}

export function coordDowngrade(
  ctx: RoomContext | undefined,
  player: Player | undefined,
  cellIndex: number,
  roomCode: string,
  options?: DowngradeOptions,
): { success: boolean; reason?: string } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  const res = handleDowngrade(player, ctx.room.phase, cellIndex, ctx.reg, ctx.sm, roomCode, options, ctx.room);
  if (res.success && ctx.room.phase === TurnPhase.InsolvencyPhase && player && player.balance >= 0) {
    delete ctx.room.pendingInsolvencyCreditorId;
    delete ctx.room.pendingInsolvencyDebtorId;
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

export function coordBankruptcy(
  ctx: RoomContext | undefined,
  playerId: string,
  creditorId: string | undefined,
  auctions: Map<string, AuctionSession>,
  roomCode: string,
  rolledThisTurn: Map<string, boolean>,
): { gameOver: boolean; rankings?: Array<{ id: string; netWorth: number }> } {
  if (!ctx) return { gameOver: false };
  const p = ctx.room.players.find((pl) => pl.id === playerId);
  if (p) p.extraTurns = 0;
  const isCurrent = ctx.room.players[ctx.room.currentPlayerIndex]?.id === playerId;
  const res = declareBankruptcy(ctx.room, playerId, ctx.reg, ctx.sm, creditorId, auctions, roomCode);
  if (isCurrent && ctx.room.phase !== TurnPhase.AuctionPhase) {
    rolledThisTurn.set(roomCode, false);
  }
  return res;
}

export function coordExecuteCompulsoryBuyout(
  ctx: RoomContext | undefined,
  playerId: string,
  cellIndex: number,
): { success: boolean; reason?: string } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  const session = ctx.room.pendingBuyout;
  if (!session) return { success: false, reason: 'NO_PENDING_BUYOUT' };
  if (session.buyerId !== playerId) {
    return { success: false, reason: 'INVALID_BUYOUT_SESSION' };
  }

  // [IMP-231] Hỗ trợ ô đất được người chơi lựa chọn từ danh sách eligibleTargets
  const matchedTarget = session.eligibleTargets?.find((t) => t.cellIndex === cellIndex) ??
    (session.cellIndex === cellIndex ? { cellIndex: session.cellIndex, sellerId: session.sellerId, cost: session.cost } : undefined);
  if (!matchedTarget) {
    return { success: false, reason: 'INVALID_BUYOUT_SESSION' };
  }

  const targetSellerId = matchedTarget.sellerId;
  const targetCost = matchedTarget.cost;

  const buyer = ctx.room.players.find((p) => p.id === session.buyerId);
  const seller = ctx.room.players.find((p) => p.id === targetSellerId);
  if (!buyer || !seller) return { success: false, reason: 'PLAYER_NOT_FOUND' };
  if (seller.bondContract?.isActive && seller.bondContract.collateralCells.includes(cellIndex)) {
    return { success: false, reason: ActionRejectReason.BOND_COLLATERAL_LOCKED };
  }
  if (buyer.balance < targetCost) return { success: false, reason: 'INSUFFICIENT_FUNDS' };

  buyer.balance -= targetCost;
  seller.balance += targetCost;
  ctx.reg.set(cellIndex, buyer.id);
  ctx.room.pendingBuyout = null;
  ctx.room.phase = TurnPhase.PropertyManagement;
  return { success: true };
}

export function coordDeclineCompulsoryBuyout(
  ctx: RoomContext | undefined,
  playerId: string,
): { success: boolean; reason?: string } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  const session = ctx.room.pendingBuyout;
  if (!session) return { success: false, reason: 'NO_PENDING_BUYOUT' };
  if (session.buyerId !== playerId) {
    return { success: false, reason: 'INVALID_BUYOUT_SESSION' };
  }
  ctx.room.pendingBuyout = null;
  ctx.room.phase = TurnPhase.PropertyManagement;
  return { success: true };
}
