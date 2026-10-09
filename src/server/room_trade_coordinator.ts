// [UC-GAME-051..057/MSS] Room Trade Coordinator
import { TurnPhase, ActionRejectReason, type Room } from '../domain/room.js';
import { executeP2PTrade } from './p2p_trade_actions.js';
import { PROPERTY_DEEDS } from '../domain/property_data.js';
import { pendingTradeManager } from './pending_trade_manager.js';
import { handleBotRecipientTrade } from './trade_coordinator_helper.js';
import type { RoomContext } from './room_property_coordinator.js';

export function isRoomQuiescentForTrade(room: Room): boolean {
  if (room.phase === TurnPhase.AuctionPhase || Boolean(room.currentAuction)) return false;
  if (room.phase === TurnPhase.InsolvencyPhase) return false;
  if (room.phase === TurnPhase.ActionPhase) return false;
  if (Boolean(room.pendingBuyout)) return false;
  return room.phase === TurnPhase.WaitingRoll || room.phase === TurnPhase.PropertyManagement;
}

export function isCellLockedInPendingTrade(room: Room, cellIndex: number): boolean {
  if (!room.pendingTradeOffer) return false;
  return room.pendingTradeOffer.cellIndex === cellIndex || room.pendingTradeOffer.offeredCellIndex === cellIndex;
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
    if ((propState?.level ?? 0) > 0 || Boolean(propState?.isETC) || Boolean(propState?.isUpgradedUtility)) {
      return { success: false, reason: ActionRejectReason.PROPERTY_HAS_BUILDING };
    }

    if (offeredCellIndex !== undefined) {
      if (ctx.reg.get(offeredCellIndex) !== buyerId) {
        return { success: false, reason: ActionRejectReason.NOT_OWNER };
      }
      const offState = ctx.sm.get(offeredCellIndex);
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
): { success: boolean; reason?: string; idempotent?: boolean } {
  if (!ctx) return { success: false, reason: ActionRejectReason.INVALID_ROOM };

  const session = pendingTradeManager.getSessionByOfferId(offerId);
  if (!session || session.roomCode !== ctx.room.roomCode) {
    const recent = pendingTradeManager.getRecentlyResolved(ctx.room.roomCode, playerId, offerId);
    if (recent) {
      if (recent.accept === accept) {
        return { success: true, idempotent: true };
      }
      return { success: false, reason: 'OFFER_ALREADY_RESOLVED' };
    }
    return { success: false, reason: 'INVALID_OFFER_ID' };
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
    pendingTradeManager.resolveSession(ctx.room.roomCode, offerId, true, playerId);
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
    pendingTradeManager.resolveSession(ctx.room.roomCode, offerId, false, playerId);
    ctx.room.pendingTradeOffer = null;
    return { success: true };
  }
}
