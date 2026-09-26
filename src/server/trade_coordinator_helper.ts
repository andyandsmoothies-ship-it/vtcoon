// [UC-GAME-007/MSS][IMP-203] Trade Coordinator Bot Recipient & Rejection Handler
import { ActionRejectReason, type Room, type Player } from '../domain/room.js';
import { BotPersonality } from '../domain/bot/bot_types.js';
import { PROPERTY_DEEDS } from '../domain/property_data.js';
import { evaluateBotTradeAcceptance } from '../domain/bot/bot_trade.js';
import { evaluateBotSwapAcceptance } from '../domain/bot/bot_hybrid_trade.js';
import type { RoomContext } from './room_property_coordinator.js';

export function handleBotRecipientTrade(
  ctx: RoomContext,
  seller: Player,
  buyer: Player,
  cellIndex: number,
  price: number,
  offeredCellIndex?: number,
): { success: boolean; reason?: ActionRejectReason } {
  const botPers = ctx.botPersonalities?.get(`${ctx.room.roomCode}:${seller.id}`)
    ?? ctx.botPersonalities?.get(seller.id)
    ?? BotPersonality.Balanced;

  // Khi buyer trả price cho seller Bot, số tiền Bot phải trả là -price
  let decision = offeredCellIndex !== undefined
    ? evaluateBotSwapAcceptance(offeredCellIndex, cellIndex, -price, seller, buyer, ctx.room, ctx.reg, ctx.sm, botPers)
    : evaluateBotTradeAcceptance(cellIndex, price, seller, buyer, ctx.room, ctx.reg, ctx.sm, botPers);

  // Bot-to-Bot parity threshold (>= 1.60x)
  if (!decision.accept && buyer.isBot) {
    const totalOffered = (offeredCellIndex !== undefined ? (PROPERTY_DEEDS.get(offeredCellIndex)?.price ?? 0) : 0) + price;
    const baseTarget = PROPERTY_DEEDS.get(cellIndex)?.price ?? 1000;
    if (totalOffered >= Math.round(1.60 * baseTarget)) {
      decision = { accept: true };
    }
  }

  if (!decision.accept) {
    if (buyer.isBot) {
      const round = ctx.room.roundCount ?? ctx.room.round ?? 1;
      buyer.lastTradeOfferRound = round;
      (buyer.cellTradeRejections ??= {})[cellIndex] = ((buyer.cellTradeRejections ??= {})[cellIndex] ?? 0) + 1;
      (buyer.cellLastRejectedRound ??= {})[cellIndex] = round;
      if (offeredCellIndex !== undefined) {
        (buyer.swapPairLastRejectedRound ??= {})[`${cellIndex}_${offeredCellIndex}`] = round;
      }
    }
    return { success: false, reason: ActionRejectReason.TRADE_REJECTED };
  }
  return { success: true };
}
