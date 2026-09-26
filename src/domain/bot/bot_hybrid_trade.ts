// [UC-BOT-06/MSS][IMP-203] Bot Hybrid Property Trading AI & Strategic Bilateral Valuation
import { BOARD_CONFIG, ColorGroup, CellType } from '../board_config.js';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../property_data.js';
import { BotPersonality, DEFAULT_MIN_SAFETY_BUFFER } from './bot_types.js';
import type { Player, Room } from '../room.js';
import { isLeadingPlayer } from './bot_posture.js';
import type { BotSwapTradeIntent, BotTradeDecision } from './bot_trade.js';
import { findAllMonopolyGaps, type MonopolyGap } from './bot_monopoly_utils.js';

export function completesMonopoly(cellIndex: number, ownerId: string, registry: PropertyRegistry): boolean {
  const grp = BOARD_CONFIG.find((c) => c.index === cellIndex)?.colorGroup;
  if (!grp) return false;
  const others = BOARD_CONFIG.filter((c) => c.colorGroup === grp && c.index !== cellIndex);
  return others.length > 0 && others.every((c) => registry.get(c.index) === ownerId);
}

function isMonopolyGroup(cellIndex: number, ownerId: string, registry: PropertyRegistry): boolean {
  const grp = BOARD_CONFIG.find((c) => c.index === cellIndex)?.colorGroup;
  if (!grp) return false;
  const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === grp);
  return groupCells.length > 0 && groupCells.every((c) => registry.get(c.index) === ownerId);
}

export function findSurplusProperties(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  wantedCellIndex?: number,
): number[] {
  const wantedGroup = wantedCellIndex !== undefined
    ? BOARD_CONFIG.find((c) => c.index === wantedCellIndex)?.colorGroup
    : undefined;

  const surplus: number[] = [];
  for (const cell of BOARD_CONFIG) {
    if (cell.type !== CellType.Property || !cell.colorGroup) continue;
    if (registry.get(cell.index) !== bot.id) continue;
    if (wantedGroup && cell.colorGroup === wantedGroup) continue;

    const state = stateMap.get(cell.index);
    if ((state?.level ?? 0) > 0) continue;
    if (Boolean(state?.isMortgaged || bot.mortgagedProperties?.includes(cell.index))) continue;
    if (bot.bondContract?.isActive && bot.bondContract.collateralCells.includes(cell.index)) continue;

    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
    const botOwned = groupCells.filter((c) => registry.get(c.index) === bot.id);
    if (botOwned.length >= groupCells.length) continue; // Không bao giờ bán độc quyền của chính mình
    if (groupCells.length >= 2 && botOwned.length >= groupCells.length - 1) continue; // Không bán ô chờ độc quyền

    surplus.push(cell.index);
  }

  // Ưu tiên ô thuộc nhóm màu mà đối thủ đã chặn độc quyền của Bot
  return surplus.sort((a, b) => {
    const grpA = BOARD_CONFIG.find((c) => c.index === a)?.colorGroup;
    const grpB = BOARD_CONFIG.find((c) => c.index === b)?.colorGroup;
    const blockedA = BOARD_CONFIG.some((c) => c.colorGroup === grpA && registry.get(c.index) !== undefined && registry.get(c.index) !== bot.id);
    const blockedB = BOARD_CONFIG.some((c) => c.colorGroup === grpB && registry.get(c.index) !== undefined && registry.get(c.index) !== bot.id);
    if (blockedA && !blockedB) return -1;
    if (!blockedA && blockedB) return 1;
    return (PROPERTY_DEEDS.get(a)?.price ?? 1000) - (PROPERTY_DEEDS.get(b)?.price ?? 1000);
  });
}

/**
 * Tính toán tiền bù cho gói đề xuất Hybrid:
 * @param partnerGetsMonopoly - True nếu ô đất đem đổi giúp đối tác mở khóa điều kiện xây nhà (C1-C3).
 */
export function calculateHybridTradeOfferPrice(
  wantedCell: number,
  offeredCell: number,
  bot: Player,
  personality: BotPersonality,
  partnerGetsMonopoly: boolean,
  roundCount?: number,
  customSafetyBuffer?: number,
): number | null {
  const deedWanted = PROPERTY_DEEDS.get(wantedCell);
  const deedOffered = PROPERTY_DEEDS.get(offeredCell);
  const priceW = deedWanted?.price ?? 1000;
  const priceO = deedOffered?.price ?? 1000;
  const baseDiff = priceW - priceO;

  let cashSweetener = 0;

  if (partnerGetsMonopoly) {
    // [TRƯỜNG HỢP 1: ĐỐI TÁC ĐỦ ĐIỀU KIỆN XÂY NHÀ - WIN-WIN]
    if (baseDiff > 0) {
      cashSweetener = baseDiff; // Bù đúng phần chênh lệch giá gốc, không cần thưởng thêm premium
    } else {
      cashSweetener = 0; // Đổi ngang tiền = 0 nếu ô đất của Bot đắt hơn hoặc bằng
    }
  } else {
    // [TRƯỜNG HỢP 2: ĐỐI TÁC CHƯA ĐỦ ĐIỀU KIỆN XÂY NHÀ]
    const premiumRate = personality === BotPersonality.Aggressive ? 0.35 : personality === BotPersonality.Balanced ? 0.25 : 0.15;
    const rejections = bot.cellTradeRejections?.[wantedCell] ?? 0;
    const esc = Math.min(0.30, rejections * 0.10);

    if (baseDiff > 0) {
      cashSweetener = Math.round(baseDiff + priceW * (premiumRate + esc));
    } else {
      // Đất Bot đem đổi đắt hơn: Tùy tính cách mà lì xì thêm hoặc đổi ngang
      if (personality === BotPersonality.Aggressive) {
        cashSweetener = Math.max(100, Math.round(priceW * 0.15));
      } else if (personality === BotPersonality.Balanced) {
        cashSweetener = Math.max(100, Math.round(priceW * 0.08));
      } else {
        cashSweetener = 0; // Passive đổi ngang 0 đồng
      }
    }
  }

  if (cashSweetener > 0) {
    const safetyBuffer = Math.max(customSafetyBuffer ?? DEFAULT_MIN_SAFETY_BUFFER, 500);
    if (bot.balance - cashSweetener < safetyBuffer) {
      return null;
    }
  }

  return cashSweetener;
}

export function findEligibleBotHybridTrade(
  bot: Player,
  gap: MonopolyGap,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality: BotPersonality,
  currentRound: number,
): BotSwapTradeIntent | null {
  const surplusCells = findSurplusProperties(bot, room, registry, stateMap, gap.cellIndex);
  if (surplusCells.length === 0) return null;

  const targetOwner = room.players.find((p) => p.id === gap.targetOwnerId);
  if (!targetOwner || targetOwner.bankrupt) return null;

  const isTargetLeader = isLeadingPlayer(targetOwner.id, room.players, registry, stateMap);

  for (const surplusCell of surplusCells) {
    const partnerGetsMonopoly = completesMonopoly(surplusCell, targetOwner.id, registry);

    // Leader Embargo: Tuyệt đối không đưa ô đất giúp người đang dẫn đầu hoàn tất độc quyền
    if (isTargetLeader && partnerGetsMonopoly) {
      continue;
    }

    const pairKey = `${gap.cellIndex}_${surplusCell}`;
    const lastRejected = bot.swapPairLastRejectedRound?.[pairKey];
    if (lastRejected !== undefined && currentRound - lastRejected < 3) continue;

    const price = calculateHybridTradeOfferPrice(gap.cellIndex, surplusCell, bot, personality, partnerGetsMonopoly, currentRound);
    if (price === null) continue;

    return {
      type: 'INTENT_TRADE_OFFER',
      cellIndex: gap.cellIndex,
      offeredCellIndex: surplusCell,
      sellerId: gap.targetOwnerId,
      targetPlayerId: gap.targetOwnerId,
      buyerId: bot.id,
      price,
    };
  }
  return null;
}

/**
 * Legacy Contract Interface phục vụ test IMP-146.
 */
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

    // Leader Embargo Guard
    if (isLeadingPlayer(targetOwner.id, room.players, registry, stateMap)) continue;

    const targetGaps = findAllMonopolyGaps(targetOwner, room, registry, stateMap);
    const matchingGaps = targetGaps.filter((tg) => registry.get(tg.cellIndex) === bot.id);
    for (const targetGap of matchingGaps) {
      const wantedCell = botGap.cellIndex;
      const offeredCell = targetGap.cellIndex;
      const wantedGroup = BOARD_CONFIG.find((c) => c.index === wantedCell)?.colorGroup;
      const offeredGroup = BOARD_CONFIG.find((c) => c.index === offeredCell)?.colorGroup;
      if (wantedGroup && wantedGroup === offeredGroup) continue;

      const pairKey = `${wantedCell}_${offeredCell}`;
      const lastRejected = bot.swapPairLastRejectedRound?.[pairKey];
      if (lastRejected !== undefined && currentRound - lastRejected < 3) continue;

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

/**
 * Thẩm định đề xuất đổi đất từ góc nhìn của Bot nhận đề xuất.
 * @param requestedCell - Ô đất Bot sẽ NHẬN (từ đối tác)
 * @param offeredCell - Ô đất Bot sẽ NHƯỢNG (đối tác muốn lấy)
 * @param cashPaidByBot - Số tiền Bot phải trả (dương nếu Bot bù tiền, âm/0 nếu Bot nhận tiền)
 */
export function evaluateBotSwapAcceptance(
  requestedCell: number,
  offeredCell: number,
  cashPaidByBot: number,
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

  // Không bao giờ nhượng ô đất thuộc nhóm màu độc quyền của chính Bot
  if (isMonopolyGroup(offeredCell, bot.id, registry)) {
    return { accept: false, reason: 'PREVENT_MONOPOLY' };
  }

  // Nếu Bot là bên phải bù tiền (cashPaidByBot > 0)
  if (cashPaidByBot > 0) {
    if (bot.balance < cashPaidByBot) return { accept: false, reason: 'INSUFFICIENT_FUNDS' };
    const safetyThreshold = pers === BotPersonality.Passive ? 1500 : pers === BotPersonality.Balanced ? 800 : 300;
    if (bot.balance - cashPaidByBot < safetyThreshold) return { accept: false, reason: 'SAFETY_BUFFER_BREACH' };
  }

  const givesMonopolyToBot = completesMonopoly(requestedCell, bot.id, registry);
  const givesMonopolyToPartner = completesMonopoly(offeredCell, partner.id, registry);

  if (givesMonopolyToBot) {
    if (pers === BotPersonality.Aggressive || pers === BotPersonality.Balanced) return { accept: true };
    if (pers === BotPersonality.Passive) {
      if (cashPaidByBot <= 500 && bot.balance - cashPaidByBot >= 1000) return { accept: true };
      return { accept: false, reason: 'PASSIVE_DEFENSIVE' };
    }
  }

  const deedReq = PROPERTY_DEEDS.get(requestedCell);
  const deedOff = PROPERTY_DEEDS.get(offeredCell);
  const basePriceOff = deedOff?.price ?? 1000;
  // Giá trị thực Bot nhận được = Giá trị ô đất nhận - Số tiền Bot phải trả (nếu Bot nhận tiền thì cashPaidByBot âm -> trừ đi số âm là cộng tiền)
  const totalValueReceived = (deedReq?.price ?? 1000) - cashPaidByBot;

  if (!givesMonopolyToBot && givesMonopolyToPartner) {
    // Đền bù độc quyền linh hoạt theo tính cách
    if (pers === BotPersonality.Aggressive && totalValueReceived >= Math.round(1.75 * basePriceOff)) return { accept: true };
    if (pers === BotPersonality.Balanced && totalValueReceived >= Math.round(1.50 * basePriceOff)) return { accept: true };
    if (pers === BotPersonality.Passive && bot.balance < 500 && totalValueReceived >= Math.round(2.00 * basePriceOff)) return { accept: true };
    return { accept: false, reason: 'PREVENT_MONOPOLY' };
  }

  if (totalValueReceived - basePriceOff >= 0) {
    return { accept: true };
  }
  return { accept: false, reason: 'UNFAVORABLE_VALUATION' };
}
