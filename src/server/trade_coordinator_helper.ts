// [UC-GAME-007/MSS][IMP-203] Trade Coordinator Bot Recipient & Rejection Handler
import { ActionRejectReason, type Player } from '../domain/room.js';
import {
  evaluateBotTradeDecision,
  recordTradeRejection,
} from '../domain/bot/bot_negotiation_brain.js';
import type { RoomContext } from './room_property_coordinator.js';

export function handleBotRecipientTrade(
  ctx: RoomContext,
  seller: Player,
  buyer: Player,
  cellIndex: number,
  price: number,
  offeredCellIndex?: number,
): { success: boolean; reason?: ActionRejectReason } {
  const decision = evaluateBotTradeDecision(
    { room: ctx.room, registry: ctx.reg, stateMap: ctx.sm, botPersonalities: ctx.botPersonalities },
    seller,
    buyer,
    cellIndex,
    price,
    offeredCellIndex,
  );

  if (!decision.accept) {
    if (buyer.isBot) {
      const round = ctx.room.roundCount ?? ctx.room.round ?? 1;
      recordTradeRejection(buyer, cellIndex, round, offeredCellIndex);
    }
    return { success: false, reason: ActionRejectReason.TRADE_REJECTED };
  }
  return { success: true };
}
