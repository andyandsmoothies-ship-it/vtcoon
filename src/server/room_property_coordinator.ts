// [UC-GAME-007/MSS][UC-GAME-051..057/MSS] Room Property & Insolvency Coordinator
import { TurnPhase, ActionRejectReason, type Room, type Player } from '../domain/room.js';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager.js';
import type { DowngradeOptions } from '../domain/property_upgrade.js';
import { mortgageProperty, redeemProperty } from './mortgage_manager.js';
import { handleDowngrade, executeP2PTrade } from './property_actions.js';
import { liquidateAssets, declareBankruptcy } from './insolvency_manager.js';
import type { AuctionSession } from './auction_manager.js';
import { type BotPersonality } from '../domain/bot/bot_types.js';
import { PROPERTY_DEEDS } from '../domain/property_data.js';
import { pendingTradeManager } from './pending_trade_manager.js';
import { handleBotRecipientTrade } from './trade_coordinator_helper.js';

export interface RoomContext {
  readonly room: Room;
  readonly reg: PropertyRegistry;
  readonly sm: PropertyStateMap;
  readonly botPersonalities?: Map<string, BotPersonality>;
}

export function isRoomQuiescentForTrade(room: Room): boolean {
  if (room.phase === TurnPhase.AuctionPhase || Boolean(room.currentAuction)) return false;
  if (room.phase === TurnPhase.InsolvencyPhase) return false;
  if (room.phase === TurnPhase.ActionPhase) return false;
  if (Boolean(room.pendingBuyout)) return false;
  return room.phase === TurnPhase.WaitingRoll || room.phase === TurnPhase.PropertyManagement;
}

function isCellLockedInPendingTrade(room: Room, cellIndex: number): boolean {
  if (!room.pendingTradeOffer) return false;
  return room.pendingTradeOffer.cellIndex === cellIndex || room.pendingTradeOffer.offeredCellIndex === cellIndex;
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
  offeredCellIndex?: number,
): { success: boolean; reason?: string; pending?: boolean; offerId?: string } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  if (!isRoomQuiescentForTrade(ctx.room)) {
    return { success: false, reason: ActionRejectReason.INVALID_PHASE };
  }
  if (ctx.room.pendingTradeOffer) {
    return { success: false, reason: ActionRejectReason.TRADE_ALREADY_PENDING };
  }
  if (requesterId !== sellerId && requesterId !== buyerId) {
    return { success: false, reason: ActionRejectReason.UNAUTHORIZED };
  }
  const seller = ctx.room.players.find((p) => p.id === sellerId);
  const buyer = ctx.room.players.find((p) => p.id === buyerId);
  if (!seller || !buyer) {
    return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  }

  if (
    (seller.bondContract?.isActive && seller.bondContract.collateralCells.includes(cellIndex)) ||
    (offeredCellIndex !== undefined && buyer.bondContract?.isActive && buyer.bondContract.collateralCells.includes(offeredCellIndex))
  ) {
    return { success: false, reason: ActionRejectReason.BOND_COLLATERAL_LOCKED };
  }

  if (buyer.balance < 0 || (price > 0 && buyer.balance < price)) {
    return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }
  if (seller.balance < 0 && price <= 0) {
    return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }

  const requester = requesterId === sellerId ? seller : buyer;
  const targetPlayer = requesterId === sellerId ? buyer : seller;
  const shouldOpenModal = Boolean(requester?.isBot && !targetPlayer?.isBot);

  if (shouldOpenModal) {
    if (ctx.reg.get(cellIndex) !== sellerId) {
      return { success: false, reason: ActionRejectReason.NOT_OWNER };
    }
    const propState = ctx.sm.get(cellIndex);
    if (propState?.isMortgaged || seller.mortgagedProperties?.includes(cellIndex)) {
      return { success: false, reason: ActionRejectReason.PROPERTY_MORTGAGED };
    }
    if ((propState?.level ?? 0) > 0 || Boolean(propState?.isETC) || Boolean(propState?.isUpgradedUtility)) {
      return { success: false, reason: ActionRejectReason.PROPERTY_HAS_BUILDING };
    }

    if (offeredCellIndex !== undefined) {
      if (ctx.reg.get(offeredCellIndex) !== buyerId) {
        return { success: false, reason: ActionRejectReason.NOT_OWNER };
      }
      const offState = ctx.sm.get(offeredCellIndex);
      if (offState?.isMortgaged || buyer.mortgagedProperties?.includes(offeredCellIndex)) {
        return { success: false, reason: ActionRejectReason.PROPERTY_MORTGAGED };
      }
      if ((offState?.level ?? 0) > 0 || Boolean(offState?.isETC) || Boolean(offState?.isUpgradedUtility)) {
        return { success: false, reason: ActionRejectReason.PROPERTY_HAS_BUILDING };
      }
    }

    if (price > 0 && buyer.balance < price) {
      return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
    }
    if (price < 0 && seller.balance < Math.abs(price)) {
      return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
    }

    const targetPlayerId = requesterId === sellerId ? buyerId : sellerId;
    const basePrice = PROPERTY_DEEDS.get(cellIndex)?.price ?? price;
    const session = pendingTradeManager.createSession(
      ctx.room.roomCode,
      buyerId,
      sellerId,
      cellIndex,
      price,
      basePrice,
      15_000,
      offeredCellIndex,
      targetPlayerId,
    );
    (ctx.room.lastTargetTradeOfferRound ??= {})[sellerId] = ctx.room.roundCount ?? ctx.room.round ?? 1;

    ctx.room.pendingTradeOffer = {
      offerId: session.offerId,
      cellIndex: session.cellIndex,
      price: session.price,
      buyerId: session.buyerId,
      sellerId: session.sellerId,
      requesterId,
      targetPlayerId,
      expiresAt: session.expiresAt,
      ...(offeredCellIndex !== undefined ? { offeredCellIndex } : {}),
    };

    return { success: true, pending: true, offerId: session.offerId };
  }

  if (seller?.isBot && buyer) {
    const botRes = handleBotRecipientTrade(ctx, seller, buyer, cellIndex, price, offeredCellIndex);
    if (!botRes.success) return botRes;
  }
  return executeP2PTrade(ctx.room, sellerId, buyerId, cellIndex, price, ctx.reg, ctx.sm, offeredCellIndex);
}

export const coordTradeOffer = coordTrade;

export function coordRespondTradeOffer(
  ctx: RoomContext | undefined,
  playerId: string,
  offerId: string,
  accept: boolean,
): { success: boolean; reason?: string } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };

  const session = pendingTradeManager.getSessionByOfferId(offerId);
  if (!session || session.roomCode !== ctx.room.roomCode) {
    return { success: false, reason: 'INVALID_OFFER_ID' };
  }

  if (session.status !== 'pending') {
    return { success: false, reason: 'OFFER_ALREADY_RESOLVED' };
  }

  const pendingInfo = ctx.room.pendingTradeOffer;
  if (pendingInfo?.targetPlayerId) {
    if (playerId !== pendingInfo.targetPlayerId) {
      return { success: false, reason: ActionRejectReason.UNAUTHORIZED };
    }
  } else if (session.targetPlayerId) {
    if (playerId !== session.targetPlayerId) {
      return { success: false, reason: ActionRejectReason.UNAUTHORIZED };
    }
  } else if (playerId !== session.sellerId && playerId !== session.buyerId) {
    return { success: false, reason: ActionRejectReason.UNAUTHORIZED };
  }

  if (Date.now() > session.expiresAt) {
    session.status = 'timeout';
    pendingTradeManager.clearSession(ctx.room.roomCode);
    ctx.room.pendingTradeOffer = null;
    return { success: false, reason: 'INVALID_OFFER_ID' };
  }

  const buyer = ctx.room.players.find((p) => p.id === session.buyerId);
  const seller = ctx.room.players.find((p) => p.id === session.sellerId);
  if (!buyer || !seller) {
    return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  }

  if (buyer.bankrupt || seller.bankrupt) {
    return { success: false, reason: ActionRejectReason.PLAYER_BANKRUPT };
  }

  if (accept) {
    if (session.price > 0 && buyer.balance < session.price) {
      return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
    }
    if (session.price < 0 && seller.balance < Math.abs(session.price)) {
      return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
    }

    if (session.offeredCellIndex !== undefined) {
      const res = executeP2PTrade(
        ctx.room,
        session.sellerId,
        session.buyerId,
        session.cellIndex,
        session.price,
        ctx.reg,
        ctx.sm,
        session.offeredCellIndex,
      );
      if (!res.success) {
        return { success: false, reason: res.reason };
      }
      buyer.lastTradeOfferRound = ctx.room.roundCount ?? ctx.room.round ?? 1;
      delete buyer.cellTradeRejections?.[session.cellIndex];
      delete buyer.cellLastRejectedRound?.[session.cellIndex];
      pendingTradeManager.resolveSession(ctx.room.roomCode, offerId, true);
      ctx.room.pendingTradeOffer = null;
      return { success: true };
    }

    // Atomic re-validation for normal 1-way trade
    if (buyer.balance < session.price) {
      return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
    }
    if (ctx.reg.get(session.cellIndex) !== session.sellerId) {
      return { success: false, reason: 'INVALID_OWNERSHIP' };
    }
    const propState = ctx.sm.get(session.cellIndex);
    if (propState?.isMortgaged || (propState?.level ?? 0) > 0) {
      return { success: false, reason: 'INVALID_PROPERTY_STATE' };
    }

    const price = session.price;
    const tax = Math.round(price * 0.05);
    const netReceived = price - tax;

    buyer.balance -= price;
    seller.balance += netReceived;
    ctx.room.treasury = (ctx.room.treasury ?? 0) + tax;
    ctx.reg.set(session.cellIndex, buyer.id);

    buyer.lastTradeOfferRound = ctx.room.roundCount ?? ctx.room.round ?? 1;
    delete buyer.cellTradeRejections?.[session.cellIndex];
    delete buyer.cellLastRejectedRound?.[session.cellIndex];
    pendingTradeManager.resolveSession(ctx.room.roomCode, offerId, true);
    ctx.room.pendingTradeOffer = null;
    return { success: true };
  } else {
    const round = ctx.room.roundCount ?? ctx.room.round ?? 1;
    buyer.lastTradeOfferRound = round;
    (buyer.cellTradeRejections ??= {})[session.cellIndex] = ((buyer.cellTradeRejections ??= {})[session.cellIndex] ?? 0) + 1;
    (buyer.cellLastRejectedRound ??= {})[session.cellIndex] = round;
    if (buyer.isBot && session.offeredCellIndex !== undefined) {
      (buyer.swapPairLastRejectedRound ??= {})[`${session.cellIndex}_${session.offeredCellIndex}`] = round;
    }
    pendingTradeManager.resolveSession(ctx.room.roomCode, offerId, false);
    ctx.room.pendingTradeOffer = null;
    return { success: true };
  }
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
  if (session.buyerId !== playerId || session.cellIndex !== cellIndex) {
    return { success: false, reason: 'INVALID_BUYOUT_SESSION' };
  }
  const buyer = ctx.room.players.find((p) => p.id === session.buyerId);
  const seller = ctx.room.players.find((p) => p.id === session.sellerId);
  if (!buyer || !seller) return { success: false, reason: 'PLAYER_NOT_FOUND' };
  if (seller.bondContract?.isActive && seller.bondContract.collateralCells.includes(cellIndex)) {
    return { success: false, reason: ActionRejectReason.BOND_COLLATERAL_LOCKED };
  }
  if (buyer.balance < session.cost) return { success: false, reason: 'INSUFFICIENT_FUNDS' };

  buyer.balance -= session.cost;
  seller.balance += session.cost;
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
