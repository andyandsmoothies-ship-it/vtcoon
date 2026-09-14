// [UC-GAME-005/MSS][UC-GAME-008/MSS][UC-BOT-03/MSS][UC-BOT-04/MSS] Bot AI Engine — Multi-Factor Dynamic AI
// Domain-only module: KHONG import Server hay Client
import type { Player, Room, MarketModifier, CurrentAuctionState } from '../room';
import { TurnPhase } from '../room';
import { BOARD_CONFIG } from '../board_config';
import { MarketCardId } from '../event_card_engine';
import type { PropertyRegistry, PropertyStateMap } from '../property_data';
import { PROPERTY_DEEDS } from '../property_data';
import { hasMonopoly, checkEvenBuilding } from '../property_upgrade';

import { BotPersonality, type BotIntent } from './bot_types';
import { calculateThreatHorizon } from './threat_forecaster';
import { evaluateTileValuation } from './valuation_engine';
import { resolveInsolvencyStep } from './solvency_solver';

export { BotPersonality, type BotIntent };

export interface BotConfig {
  personality: BotPersonality;
  /** Balanced: 1.20, Aggressive: 1.00 */
  balanceThresholdMultiplier: number;
}

/** Tra ve gia niem yet cua o tai position; 0 neu khong phai o tai san. */
function getPriceAtPosition(position: number): number {
  return PROPERTY_DEEDS.get(position)?.price ?? 0;
}

/**
 * Tinh chi phi nang cap cho o dat cellIndex o cap tiep theo.
 */
export function getUpgradeCost(
  cellIndex: number,
  stateMap: PropertyStateMap,
  modifiers?: readonly MarketModifier[],
): number {
  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (!deed?.upgradeCosts) return 0;
  const level = stateMap.get(cellIndex)?.level ?? 0;
  if (level >= 3) return 0;
  let cost = deed.upgradeCosts[level] ?? 0;
  if (modifiers?.some((m) => m.type === MarketCardId.MC_CREDIT_STIMULUS && m.remainingRounds > 0)) {
    cost = Math.floor(cost * 0.8);
  }
  return cost;
}

function decideActionPhaseIntent(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality: BotPersonality,
  balanceThresholdMultiplier?: number,
): BotIntent {
  if (personality === BotPersonality.Passive) {
    return { type: 'INTENT_DECLINE' };
  }
  const valuation = evaluateTileValuation(
    bot.position,
    bot,
    room,
    registry,
    stateMap,
    personality,
  );
  const basePrice = valuation.basePrice > 0 ? valuation.basePrice : getPriceAtPosition(bot.position);
  if (basePrice <= 0 || bot.balance < basePrice) {
    return { type: 'INTENT_DECLINE' };
  }

  if (balanceThresholdMultiplier !== undefined && bot.balance < basePrice * balanceThresholdMultiplier) {
    return { type: 'INTENT_DECLINE' };
  }

  const threat = calculateThreatHorizon(bot, room, registry, stateMap, personality);
  if (threat.dangerTilesCount > 0 && bot.balance - basePrice < threat.safetyBuffer) {
    return { type: 'INTENT_DECLINE' };
  }

  if (valuation.estimatedValue < valuation.basePrice) {
    if (valuation.pacingFactor !== undefined && valuation.pacingFactor < 1.0) {
      return { type: 'INTENT_DECLINE' };
    }
    if (balanceThresholdMultiplier === undefined || bot.balance < basePrice * balanceThresholdMultiplier) {
      return { type: 'INTENT_DECLINE' };
    }
  }

  return { type: 'INTENT_BUY' };
}

function findEligibleUpgradeCell(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality: BotPersonality,
): number | null {
  const isMortgaged = (idx: number) =>
    Boolean(bot.mortgagedProperties?.includes(idx) || stateMap.get(idx)?.isMortgaged);

  const ownedGroups = new Set<string>();
  for (const cell of BOARD_CONFIG) {
    if (cell.colorGroup && hasMonopoly(bot.id, cell.index, registry, stateMap)) {
      const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
      const hasMortgaged = groupCells.some((c) => isMortgaged(c.index));
      if (!hasMortgaged) {
        ownedGroups.add(cell.colorGroup);
      }
    }
  }
  if (ownedGroups.size === 0) return null;

  const threat = calculateThreatHorizon(bot, room, registry, stateMap, personality);
  const safetyBuffer = threat.safetyBuffer;

  for (const group of ownedGroups) {
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === group);
    for (const cell of groupCells) {
      if (isMortgaged(cell.index)) continue;
      const state = stateMap.get(cell.index) ?? { level: 0 };
      if (state.level >= 3) continue;

      const ebCheck = checkEvenBuilding(cell.index, stateMap);
      if (!ebCheck.valid) continue;

      const upgradeCost = getUpgradeCost(cell.index, stateMap, room.activeModifiers);
      if (upgradeCost <= 0) continue;

      if (bot.balance - upgradeCost >= safetyBuffer) {
        return cell.index;
      }
    }
  }
  return null;
}

function calculateAuctionStep(
  auction: CurrentAuctionState,
  personality: BotPersonality,
  balance: number,
): number {
  const highestBidder = auction.highestBidderId ?? auction.highestBidder;
  const minStep = auction.bidIncrement ?? 50;
  if (personality === BotPersonality.Aggressive && balance > 10_000 && Boolean(highestBidder)) {
    return Math.max(minStep, 100);
  }
  return minStep;
}

function calculateAuctionMaxBid(
  bot: Player,
  room: Room,
  personality: BotPersonality,
  valEstimated: number,
  safetyBuffer: number,
): number {
  const valMultiplier = personality === BotPersonality.Aggressive ? 1.5 : 1.0;
  const safeRatio = personality === BotPersonality.Aggressive
    ? 0.25
    : personality === BotPersonality.Balanced
    ? 0.6
    : 1.0;
  const effectiveBuffer = personality === BotPersonality.Passive
    ? Math.max(safetyBuffer, (room.round ?? 1) * 100)
    : safetyBuffer;

  return Math.min(
    Math.round(valEstimated * valMultiplier),
    Math.max(0, bot.balance - Math.round(effectiveBuffer * safeRatio)),
  );
}

function isPassiveAuctionAllowed(
  auction: CurrentAuctionState,
  basePrice: number,
  monopolyScore: number,
  nextBid: number,
): boolean {
  if (monopolyScore >= 2.5) return true;
  if ((auction.highestBid ?? 0) > basePrice * 0.85) return false;
  return nextBid <= basePrice * 0.70;
}

function decideAuctionPhaseIntent(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality: BotPersonality,
  auction?: CurrentAuctionState,
): BotIntent {
  const cur = auction ?? room.currentAuction;
  if (!cur || bot.bankrupt || cur.passedPlayers?.has(bot.id) || bot.id === cur.declinedPlayerId) {
    return { type: 'INTENT_AUCTION_PASS' };
  }
  const highestBidder = cur.highestBidderId ?? cur.highestBidder;
  if (highestBidder === bot.id) return { type: 'INTENT_AUCTION_PASS' };

  const val = evaluateTileValuation(cur.cellIndex, bot, room, registry, stateMap, personality);
  const step = calculateAuctionStep(cur, personality, bot.balance);
  const nextBid = (cur.highestBid ?? 0) > 0 ? cur.highestBid! + step : (cur.startingBid ?? 50);

  if (personality === BotPersonality.Passive) {
    const basePrice = PROPERTY_DEEDS.get(cur.cellIndex)?.price ?? val.basePrice;
    if (!isPassiveAuctionAllowed(cur, basePrice, val.monopolyScore ?? 1.0, nextBid)) {
      return { type: 'INTENT_AUCTION_PASS' };
    }
  }

  const threat = calculateThreatHorizon(bot, room, registry, stateMap, personality);
  const maxBid = calculateAuctionMaxBid(bot, room, personality, val.estimatedValue, threat.safetyBuffer);

  if (nextBid <= maxBid && bot.balance >= nextBid) {
    return { type: 'INTENT_BID', amount: nextBid };
  }
  return { type: 'INTENT_AUCTION_PASS' };
}

function decideHosePhaseIntent(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality: BotPersonality,
): BotIntent {
  const threat = calculateThreatHorizon(bot, room, registry, stateMap, personality);
  const freeCash = bot.balance - threat.safetyBuffer;

  if (freeCash >= 4000) {
    const stake =
      personality === BotPersonality.Aggressive
        ? 3000
        : personality === BotPersonality.Balanced
        ? 2000
        : 1000;
    return { type: 'INTENT_INVEST', stake };
  }
  if (freeCash >= 2000) {
    const stake =
      personality === BotPersonality.Aggressive
        ? 2000
        : personality === BotPersonality.Balanced
        ? 1000
        : 500;
    return { type: 'INTENT_INVEST', stake };
  }
  if (freeCash >= 1000) {
    const stake = personality === BotPersonality.Aggressive ? 1000 : 500;
    return { type: 'INTENT_INVEST', stake };
  }
  return { type: 'INTENT_SKIP' };
}

/**
 * Quyet dinh intent tiep theo cho Bot dua tren phase hien tai cua room.
 * Tra ve null neu khong co hanh dong hop le (phase khong xac dinh).
 * [UC-GAME-005/MSS][UC-GAME-008/MSS][UC-BOT-03/MSS][UC-BOT-04/MSS]
 */
export function decideBotIntent(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  config: BotConfig,
  auction?: CurrentAuctionState,
): BotIntent | null {
  const { personality, balanceThresholdMultiplier } = config;

  switch (room.phase) {
    case TurnPhase.WaitingRoll:
      return { type: 'INTENT_ROLL' };

    case TurnPhase.ActionPhase:
      return decideActionPhaseIntent(bot, room, registry, stateMap, personality, balanceThresholdMultiplier);

    case TurnPhase.PropertyManagement: {
      if (personality === BotPersonality.Passive) {
        return { type: 'INTENT_END_TURN' };
      }
      const upgradeCell = findEligibleUpgradeCell(bot, room, registry, stateMap, personality);
      return upgradeCell !== null
        ? { type: 'INTENT_UPGRADE', cellIndex: upgradeCell }
        : { type: 'INTENT_END_TURN' };
    }

    case TurnPhase.AuctionPhase:
      return decideAuctionPhaseIntent(bot, room, registry, stateMap, personality, auction);

    case TurnPhase.HosePhase:
      return decideHosePhaseIntent(bot, room, registry, stateMap, personality);

    case TurnPhase.InsolvencyPhase:
    case TurnPhase.BankruptcyCheck:
      return resolveInsolvencyStep(bot, room, registry, stateMap);

    case TurnPhase.TurnEnd:
      return { type: 'INTENT_END_TURN' };

    default:
      return null;
  }
}

/**
 * Chuyển giao quyền điều khiển của người chơi sang Bot khi hết thời gian ân hạn.
 * [UC-GAME-008/MSS]
 */
export function takeover(room: Room, playerId: string): boolean {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return false;
  player.isBot = true;
  return true;
}

export const BotEngine = {
  decideIntent: decideBotIntent,
  takeover,
};

