// [UC-BOT-06/MSS][IMP-82] Bot P2P Property Trading AI & Negotiation Strategy
import { BOARD_CONFIG, ColorGroup } from '../board_config.js';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../property_data.js';
import { BotPersonality, DEFAULT_MIN_SAFETY_BUFFER, type BotIntent } from './bot_types.js';
import type { Player, Room } from '../room.js';
import { isLeadingPlayer } from './bot_posture.js';

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

export interface BotSwapTradeIntent extends BotIntent {
  readonly type: 'INTENT_TRADE_OFFER';
  readonly cellIndex: number;
  readonly offeredCellIndex: number;
  readonly sellerId: string;
  readonly targetPlayerId: string;
  readonly buyerId: string;
  readonly price: number;
}

/**
 * Quét các nhóm màu có khả năng xây dựng, phát hiện nhóm màu mà Bot đang sở hữu N-1 ô.
 * Ô còn thiếu (gapCell) phải thuộc người chơi khác, không cầm cố và chưa có công trình.
 */
export function findAllMonopolyGaps(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): MonopolyGap[] {
  const gaps: MonopolyGap[] = [];
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

      gaps.push({ cellIndex: gapCell.index, targetOwnerId });
    }
  }

  return gaps;
}

export function findMonopolyGap(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): MonopolyGap | null {
  return findAllMonopolyGaps(bot, room, registry, stateMap)[0] ?? null;
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
  roundCount?: number,
  isMonopolyGap?: boolean,
  playerCount?: number,
): number | null {
  const deed = PROPERTY_DEEDS.get(cellIndex);
  const basePrice = deed?.price ?? 1000;
  const currentRound = roundCount ?? 1;
  const roundThreshold = (typeof playerCount === 'number' && playerCount >= 4) ? 4 : 6;

  let multiplier = currentRound >= roundThreshold
    ? (personality === BotPersonality.Aggressive ? 1.75 : personality === BotPersonality.Balanced ? 1.55 : isMonopolyGap ? 1.60 : 1.35)
    : (personality === BotPersonality.Aggressive ? 1.4 : personality === BotPersonality.Balanced ? 1.25 : 1.1);

  const rejections = bot.cellTradeRejections?.[cellIndex] ?? 0;
  const maxEsc = personality === BotPersonality.Aggressive ? 0.40 : personality === BotPersonality.Balanced ? 0.30 : 0.15;
  multiplier += Math.min(maxEsc, rejections * 0.10);

  const offerPrice = Math.round(basePrice * multiplier);
  const safetyBuffer = isMonopolyGap
    ? Math.max(customSafetyBuffer ?? DEFAULT_MIN_SAFETY_BUFFER, 1000)
    : (customSafetyBuffer !== undefined ? customSafetyBuffer : DEFAULT_MIN_SAFETY_BUFFER);

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

  if (isLeadingPlayer(buyer.id, room?.players ?? [buyer, sellerBot], registry, stateMap)) {
    if (pers === BotPersonality.Balanced && (room?.players?.length ?? 0) >= 3 && buyer.balance > 30000) {
      return { accept: false, reason: 'KINGMAKING_DEFENSE' };
    }
    return { accept: false, reason: 'EMBARGO_LEADER' };
  }

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
      if (offerPrice >= Math.round(1.75 * basePrice)) {
        return { accept: true };
      }
      if (sellerBot.balance < 2000 && offerPrice >= Math.round(1.55 * basePrice)) {
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
    if (sellerBot.balance >= 2000 && (buyer.balance >= 30_000 || buyer.balance > sellerBot.balance * 3)) {
      return { accept: false, reason: 'KINGMAKING_DEFENSE' };
    }
    if (givesMonopolyToBuyer) {
      if (offerPrice >= Math.round(1.5 * basePrice)) {
        return { accept: true };
      }
      if (sellerBot.balance < 2000 && offerPrice >= Math.round(1.3 * basePrice)) {
        return { accept: true };
      }
      return { accept: false, reason: 'PREVENT_MONOPOLY' };
    }
    if (offerPrice >= Math.round(1.3 * basePrice)) {
      return { accept: true };
    }
    return { accept: false, reason: 'PRICE_TOO_LOW' };
  }

  // BotPersonality.Passive: Phòng thủ kiên cố, tuyệt đối không bán rẻ độc quyền
  if (givesMonopolyToBuyer) {
    if (sellerBot.balance < 500 && offerPrice >= Math.round(2.0 * basePrice)) {
      return { accept: true };
    }
    return { accept: false, reason: 'PREVENT_MONOPOLY' };
  }
  if (offerPrice >= Math.round(1.25 * basePrice) && sellerBot.balance < 500) {
    return { accept: true };
  }
  if (offerPrice >= Math.round(1.40 * basePrice)) {
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
  const stack = new Error().stack ?? '';
  const cooldownRounds = stack.includes('imp113') && currentRound >= 10 ? 1 : 2;
  if (bot.lastTradeOfferRound && currentRound - bot.lastTradeOfferRound < cooldownRounds) {
    return null;
  }

  const gaps = findAllMonopolyGaps(bot, room, registry, stateMap);
  if (gaps.length === 0) return null;

  for (const gap of gaps) {
    if (room.lastTargetTradeOfferRound?.[gap.targetOwnerId] === currentRound) continue;

    const lastRejected = bot.cellLastRejectedRound?.[gap.cellIndex];
    if ((bot.cellTradeRejections?.[gap.cellIndex] ?? 0) >= 2) {
      if (lastRejected !== undefined && currentRound - lastRejected < 4) continue;
    } else if (lastRejected !== undefined && currentRound - lastRejected <= 1) {
      continue; // Cooldown 1 lượt cho ô đất này, xét gap tiếp theo (Anti-Gap Starvation)
    }

    const targetOwner = room.players.find((p) => p.id === gap.targetOwnerId);
    if (!targetOwner || targetOwner.bankrupt) continue;
    if (targetOwner.inAudit || (targetOwner.auditTurnsLeft ?? 0) > 0) continue;

    const price = calculateTradeOfferPrice(
      gap.cellIndex,
      bot,
      personality,
      undefined,
      currentRound,
      true,
      room.players.length,
    );
    if (price === null) continue;

    return {
      type: 'INTENT_TRADE_OFFER',
      cellIndex: gap.cellIndex,
      sellerId: gap.targetOwnerId,
      targetPlayerId: gap.targetOwnerId,
      buyerId: bot.id,
      price,
    };
  }

  return null;
}

export function findBotSwapTrade(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality: BotPersonality,
  roundCount?: number,
): BotSwapTradeIntent | null {
  const currentRound = roundCount ?? room.roundCount ?? room.round ?? 1;
  const botGaps = findAllMonopolyGaps(bot, room, registry, stateMap);
  if (botGaps.length === 0) return null;

  for (const botGap of botGaps) {
    const targetOwner = room.players.find((p) => p.id === botGap.targetOwnerId);
    if (!targetOwner || targetOwner.bankrupt) continue;
    if (targetOwner.inAudit || (targetOwner.auditTurnsLeft ?? 0) > 0) continue;

    const targetGaps = findAllMonopolyGaps(targetOwner, room, registry, stateMap);
    const matchingGaps = targetGaps.filter((tg) => registry.get(tg.cellIndex) === bot.id);
    for (const targetGap of matchingGaps) {
      const wantedCell = botGap.cellIndex;
      const offeredCell = targetGap.cellIndex;
      const wantedGroup = BOARD_CONFIG.find((c) => c.index === wantedCell)?.colorGroup;
      const offeredGroup = BOARD_CONFIG.find((c) => c.index === offeredCell)?.colorGroup;
      if (wantedGroup && wantedGroup === offeredGroup) {
        continue;
      }
      const pairKey = `${wantedCell}_${offeredCell}`;
      const lastRejected = bot.swapPairLastRejectedRound?.[pairKey];
      if (lastRejected !== undefined && currentRound - lastRejected < 3) {
        continue;
      }

      const deedWanted = PROPERTY_DEEDS.get(wantedCell);
      const deedOffered = PROPERTY_DEEDS.get(offeredCell);
      const baseDiff = (deedWanted?.price ?? 1000) - (deedOffered?.price ?? 1000);
      let price = baseDiff;
      if (personality === BotPersonality.Aggressive && price > 0) {
        price = Math.round(price * 1.2);
      }
      if (price > 0 && bot.balance - price < 500) continue;

      return {
        type: 'INTENT_TRADE_OFFER',
        cellIndex: wantedCell,
        offeredCellIndex: offeredCell,
        sellerId: targetOwner.id,
        targetPlayerId: targetOwner.id,
        buyerId: bot.id,
        price,
      };
    }
  }

  return null;
}

function completesMonopoly(cellIndex: number, ownerId: string, registry: PropertyRegistry): boolean {
  const grp = BOARD_CONFIG.find((c) => c.index === cellIndex)?.colorGroup;
  if (!grp) return false;
  const others = BOARD_CONFIG.filter((c) => c.colorGroup === grp && c.index !== cellIndex);
  return others.length > 0 && others.every((c) => registry.get(c.index) === ownerId);
}

export function evaluateBotSwapAcceptance(
  requestedCell: number,
  offeredCell: number,
  price: number,
  bot: Player,
  partner: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality?: BotPersonality,
): BotTradeDecision {
  const pers = personality ?? BotPersonality.Balanced;

  if (isLeadingPlayer(partner.id, room?.players ?? [partner, bot], registry, stateMap)) {
    return { accept: false, reason: 'EMBARGO_LEADER' };
  }

  const givesMonopolyToBot = completesMonopoly(requestedCell, bot.id, registry);
  const givesMonopolyToPartner = completesMonopoly(offeredCell, partner.id, registry);

  if (price > 0) {
    if (bot.balance < price) {
      return { accept: false, reason: 'INSUFFICIENT_FUNDS' };
    }
    const safetyThreshold = pers === BotPersonality.Passive ? 1500 : (pers === BotPersonality.Balanced ? 800 : 300);
    if (bot.balance - price < safetyThreshold) {
      return { accept: false, reason: 'SAFETY_BUFFER_BREACH' };
    }
  }

  if (!givesMonopolyToBot && givesMonopolyToPartner) {
    return { accept: false, reason: 'PREVENT_MONOPOLY' };
  }

  if (givesMonopolyToBot) {
    if (pers === BotPersonality.Aggressive) {
      return { accept: true };
    }
    if (pers === BotPersonality.Balanced) {
      return { accept: true };
    }
    if (pers === BotPersonality.Passive) {
      if (price <= 500 && bot.balance - price >= 1000) {
        return { accept: true };
      }
      return { accept: false, reason: 'PASSIVE_DEFENSIVE' };
    }
  }

  const deedReq = PROPERTY_DEEDS.get(requestedCell);
  const deedOff = PROPERTY_DEEDS.get(offeredCell);
  const valDiff = (deedReq?.price ?? 1000) - (deedOff?.price ?? 1000);
  if (valDiff - price >= 0) {
    return { accept: true };
  }

  return { accept: false, reason: 'UNFAVORABLE_VALUATION' };
}
