// [UC-BOT-06/MSS][IMP-82] Bot P2P Property Trading AI & Negotiation Strategy
import { BOARD_CONFIG, ColorGroup } from '../board_config.js';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../property_data.js';
import { BotPersonality, DEFAULT_MIN_SAFETY_BUFFER, type BotIntent } from './bot_types.js';
import type { Player, Room } from '../room.js';

export interface MonopolyGap {
  readonly cellIndex: number;
  readonly targetOwnerId: string;
}

export interface BotTradeDecision {
  readonly accept: boolean;
  readonly reason?: string;
}

export interface BotTradeIntent extends BotIntent {
  readonly type: 'INTENT_TRADE_OFFER';
  readonly cellIndex: number;
  readonly sellerId: string;
  readonly targetPlayerId: string;
  readonly buyerId: string;
  readonly price: number;
}

/**
 * Quét các nhóm màu có khả năng xây dựng, phát hiện nhóm màu mà Bot đang sở hữu N-1 ô.
 * Ô còn thiếu (gapCell) phải thuộc người chơi khác, không cầm cố và chưa có công trình.
 */
export function findMonopolyGap(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): MonopolyGap | null {
  for (const group of Object.values(ColorGroup)) {
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === group);
    const totalCount = groupCells.length;
    if (totalCount < 2) continue;

    const botOwned = groupCells.filter((c) => registry.get(c.index) === bot.id);
    if (botOwned.length === totalCount - 1) {
      const gapCell = groupCells.find((c) => registry.get(c.index) !== bot.id);
      if (!gapCell) continue;

      const targetOwnerId = registry.get(gapCell.index);
      if (!targetOwnerId || targetOwnerId === bot.id) continue;

      const targetOwner = room.players.find((p) => p.id === targetOwnerId);
      if (!targetOwner || targetOwner.bankrupt) continue;

      const state = stateMap.get(gapCell.index);
      if ((state?.level ?? 0) > 0) continue; // Ô đất đã có công trình, không thể giao dịch

      const isMortgaged = Boolean(
        state?.isMortgaged || targetOwner.mortgagedProperties?.includes(gapCell.index),
      );
      if (isMortgaged) continue; // Ô đất đang bị cầm cố

      return { cellIndex: gapCell.index, targetOwnerId };
    }
  }

  return null;
}

/**
 * Tính toán mức giá Bot sẵn sàng trả để mua ô đất hoàn thiện độc quyền.
 * Tuân thủ ngân sách đệm an toàn safetyBuffer.
 */
export function calculateTradeOfferPrice(
  cellIndex: number,
  bot: Player,
  personality: BotPersonality,
  customSafetyBuffer?: number,
): number | null {
  const deed = PROPERTY_DEEDS.get(cellIndex);
  const basePrice = deed?.price ?? 1000;

  let multiplier = 1.25;
  if (personality === BotPersonality.Aggressive) {
    multiplier = 1.4;
  } else if (personality === BotPersonality.Balanced) {
    multiplier = 1.25;
  } else if (personality === BotPersonality.Passive) {
    multiplier = 1.1;
  }

  const offerPrice = Math.round(basePrice * multiplier);
  const safetyBuffer = customSafetyBuffer !== undefined ? customSafetyBuffer : DEFAULT_MIN_SAFETY_BUFFER;

  if (bot.balance - offerPrice < safetyBuffer) {
    return null;
  }

  return offerPrice;
}

/**
 * Thẩm định từ phía người bán khi nhận đề xuất mua đất từ người chơi khác.
 * Áp dụng phòng thủ chặn độc quyền (Prevent Monopoly) và chống Kingmaking.
 */
export function evaluateBotTradeAcceptance(
  cellIndex: number,
  offerPrice: number,
  sellerBot: Player,
  buyer: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality?: BotPersonality,
): BotTradeDecision {
  const cellConfig = BOARD_CONFIG.find((c) => c.index === cellIndex);
  const deed = PROPERTY_DEEDS.get(cellIndex);
  const basePrice = deed?.price ?? 1000;
  const pers = personality ?? BotPersonality.Balanced;

  let givesMonopolyToBuyer = false;
  if (cellConfig?.colorGroup) {
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cellConfig.colorGroup);
    const otherCells = groupCells.filter((c) => c.index !== cellIndex);
    if (otherCells.length > 0 && otherCells.every((c) => registry.get(c.index) === buyer.id)) {
      givesMonopolyToBuyer = true;
    }
  }

  if (pers === BotPersonality.Aggressive) {
    if (givesMonopolyToBuyer) {
      if (offerPrice >= Math.round(2.5 * basePrice) && sellerBot.balance < 500) {
        return { accept: true };
      }
      return { accept: false, reason: 'PREVENT_MONOPOLY' };
    }
    if (offerPrice >= Math.round(1.3 * basePrice)) {
      return { accept: true };
    }
    return { accept: false, reason: 'PRICE_TOO_LOW' };
  }

  if (pers === BotPersonality.Balanced) {
    if (buyer.balance >= 30_000 || buyer.balance > sellerBot.balance * 3) {
      return { accept: false, reason: 'KINGMAKING_DEFENSE' };
    }
    if (givesMonopolyToBuyer) {
      if (offerPrice >= Math.round(1.8 * basePrice)) {
        return { accept: true };
      }
      return { accept: false, reason: 'PREVENT_MONOPOLY' };
    }
    if (offerPrice >= Math.round(1.3 * basePrice)) {
      return { accept: true };
    }
    return { accept: false, reason: 'PRICE_TOO_LOW' };
  }

  // BotPersonality.Passive
  if (offerPrice >= Math.round(1.25 * basePrice) && sellerBot.balance < 500) {
    return { accept: true };
  }
  if (!givesMonopolyToBuyer && offerPrice >= Math.round(1.25 * basePrice)) {
    return { accept: true };
  }
  if (offerPrice >= Math.round(1.4 * basePrice)) {
    return { accept: true };
  }
  return { accept: false, reason: 'PRICE_TOO_LOW' };
}

/**
 * Điều phối đề xuất đàm phán hợp lệ cho Bot trong lượt đi, áp dụng Cooldown.
 */
export function findEligibleBotTrade(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality: BotPersonality,
  roundCount?: number,
): BotTradeIntent | null {
  const currentRound = roundCount ?? room.roundCount ?? room.round ?? 1;
  if (bot.lastTradeOfferRound && currentRound - bot.lastTradeOfferRound < 2) {
    return null;
  }

  const gap = findMonopolyGap(bot, room, registry, stateMap);
  if (!gap) return null;

  const targetOwner = room.players.find((p) => p.id === gap.targetOwnerId);
  if (!targetOwner || targetOwner.bankrupt) return null;

  const price = calculateTradeOfferPrice(gap.cellIndex, bot, personality);
  if (price === null) return null;

  return {
    type: 'INTENT_TRADE_OFFER',
    cellIndex: gap.cellIndex,
    sellerId: gap.targetOwnerId,
    targetPlayerId: gap.targetOwnerId,
    buyerId: bot.id,
    price,
  };
}
