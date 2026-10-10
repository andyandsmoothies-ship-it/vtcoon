// [IMP-347] Bot Negotiation Brain — Pure Domain Heuristics & Rejection Memory
import type { Player, Room } from '../room.js';
import type { PropertyRegistry, PropertyStateMap } from '../property_data.js';
import { BotPersonality } from './bot_types.js';
import { PROPERTY_DEEDS } from '../property_data.js';
import { BOARD_CONFIG, CellType } from '../board_config.js';
import { evaluateBotTradeAcceptance } from './bot_trade.js';
import { evaluateBotSwapAcceptance } from './bot_hybrid_trade.js';

export interface BotNegotiationContext {
  readonly room: Room;
  readonly registry: PropertyRegistry;
  readonly stateMap: PropertyStateMap;
  readonly botPersonalities?: Map<string, BotPersonality>;
}

export interface BotNegotiationDecision {
  readonly accept: boolean;
  readonly reason?: string;
}

function checkGivesMonopolyToBuyer(cellIndex: number, buyerId: string, registry: PropertyRegistry): boolean {
  const cellConfig = BOARD_CONFIG.find((c) => c.index === cellIndex);
  if (cellConfig?.colorGroup) {
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cellConfig.colorGroup);
    const otherCells = groupCells.filter((c) => c.index !== cellIndex);
    return otherCells.length > 0 && otherCells.every((c) => registry.get(c.index) === buyerId);
  } else if (cellConfig?.type === CellType.Railroad) {
    const allRails = BOARD_CONFIG.filter((c) => c.type === CellType.Railroad && c.index !== cellIndex);
    return allRails.filter((c) => registry.get(c.index) === buyerId).length >= 2;
  }
  return false;
}

export function evaluateBotTradeDecision(
  context: BotNegotiationContext,
  seller: Player,
  buyer: Player,
  cellIndex: number,
  price: number,
  offeredCellIndex?: number,
): BotNegotiationDecision {
  const botPers = context.botPersonalities?.get(`${context.room.roomCode}:${seller.id}`)
    ?? context.botPersonalities?.get(seller.id)
    ?? BotPersonality.Balanced;

  let decision = offeredCellIndex !== undefined
    ? evaluateBotSwapAcceptance(offeredCellIndex, cellIndex, -price, seller, buyer, context.room, context.registry, context.stateMap, botPers)
    : evaluateBotTradeAcceptance(cellIndex, price, seller, buyer, context.room, context.registry, context.stateMap, botPers);

  // [ADV-01 Net Equity Floor]: Chặn bẫy thâu tóm độc quyền bất cân xứng trong Swap trade
  if (offeredCellIndex !== undefined && decision.accept) {
    const deedOffered = PROPERTY_DEEDS.get(cellIndex);
    const baseOffered = deedOffered?.price ?? 1000;
    const deedReceived = PROPERTY_DEEDS.get(offeredCellIndex);
    const baseReceived = deedReceived?.price ?? 1000;
    const cashPaidByBot = -price;
    const totalValueReceived = baseReceived - cashPaidByBot;
    if (totalValueReceived < Math.round(baseOffered * 0.65)) {
      return { accept: false, reason: 'UNFAVORABLE_VALUATION' };
    }
  }

  // [ADV-03 Kingmaking Defense]: Chặn bot nghèo bán tháo độc quyền cho đối thủ áp đảo
  if (decision.accept) {
    const givesMonopoly = checkGivesMonopolyToBuyer(cellIndex, buyer.id, context.registry);
    if (givesMonopoly && (buyer.balance >= 30_000 || buyer.balance > seller.balance * 3)) {
      return { accept: false, reason: 'KINGMAKING_DEFENSE' };
    }
  }

  // [ADV-02 Whitelist Parity 1.60x]: CHỈ áp dụng cho Cash-only trade và CHỈ KHI lý do từ chối là PRICE_TOO_LOW (chặn triệt để PREVENT_MONOPOLY / EMBARGO_LEADER / KINGMAKING_DEFENSE)
  if (!decision.accept && buyer.isBot && offeredCellIndex === undefined) {
    if (decision.reason === 'PRICE_TOO_LOW') {
      const baseTarget = PROPERTY_DEEDS.get(cellIndex)?.price ?? 1000;
      if (price >= Math.round(1.60 * baseTarget)) {
        decision = { accept: true };
      }
    }
  }

  return decision;
}

export function recordTradeRejection(
  buyer: Player,
  cellIndex: number,
  round: number,
  offeredCellIndex?: number,
): void {
  buyer.lastTradeOfferRound = round;
  (buyer.cellTradeRejections ??= {})[cellIndex] = ((buyer.cellTradeRejections ??= {})[cellIndex] ?? 0) + 1;
  (buyer.cellLastRejectedRound ??= {})[cellIndex] = round;
  if (offeredCellIndex !== undefined) {
    (buyer.swapPairLastRejectedRound ??= {})[`${cellIndex}_${offeredCellIndex}`] = round;
  }
}

export function clearTradeRejectionForCell(players: Player[], cellIndex: number): void {
  for (const p of players) {
    if (p.cellTradeRejections) delete p.cellTradeRejections[cellIndex];
    if (p.cellLastRejectedRound) delete p.cellLastRejectedRound[cellIndex];
  }
}
