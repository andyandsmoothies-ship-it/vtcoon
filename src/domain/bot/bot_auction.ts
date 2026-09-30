// [UC-BOT-04/MSS][IMP-59/MSS] Bot AI Auction & Tactical Baiting / Trap Bids Engine
// Domain-only module: does not import Server or Client

import type { Player, Room, CurrentAuctionState } from '../room';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../property_data';
import { BOARD_CONFIG, CellType } from '../board_config';
import {
  BotPersonality,
  type BotIntent,
  type BotConfig,
  AUCTION_BAIT_PROBABILITY,
} from './bot_types';
import { calculateThreatHorizon } from './threat_forecaster';
import { evaluateTileValuation } from './valuation_engine';
import { getTurnSeed, createDeterministicRng } from './bot_softmax';

/**
 * Hanh lang nghi binh (Trap Corridor): 70% < gia thau <= 75% gia niem yet.
 */
export function isBaitCorridor(bid: number, basePrice: number): boolean {
  if (!Number.isFinite(bid) || !Number.isFinite(basePrice) || basePrice <= 0) return false;
  return bid > basePrice * 0.70 && bid <= basePrice * 0.75;
}

export function calculateAuctionStep(
  auction: CurrentAuctionState | undefined,
  personality: BotPersonality,
  balance: number,
): number {
  const highestBidder = auction?.highestBidderId ?? auction?.highestBidder;
  const minStep = auction?.bidIncrement ?? 50;
  if (personality === BotPersonality.Aggressive && balance > 10_000 && Boolean(highestBidder)) {
    return Math.max(minStep, 100);
  }
  return minStep;
}

export function calculateAuctionMaxBid(
  bot: Player,
  room: Room,
  personality: BotPersonality,
  valEstimated: number,
  safetyBuffer: number,
  denialScore = 1.0,
): number {
  let valMultiplier = 1.0;
  if (personality === BotPersonality.Aggressive) {
    valMultiplier = denialScore >= 2.0 ? 1.6 : 1.5;
  } else if (personality === BotPersonality.Balanced) {
    valMultiplier = 1.2;
  } else {
    valMultiplier = (denialScore >= 1.5 || valEstimated > 1500) ? 1.15 : 1.0;
  }

  const safeRatio = personality === BotPersonality.Aggressive
    ? 0.25
    : personality === BotPersonality.Balanced
    ? 0.6
    : 1.0;
  const effectiveBuffer = personality === BotPersonality.Passive
    ? Math.max(safetyBuffer, (room?.round ?? room?.roundCount ?? 1) * 100)
    : safetyBuffer;

  const round = room?.round ?? room?.roundCount ?? 1;
  const activePlayers = room?.players?.filter((p) => !p.bankrupt).length ?? 4;
  const isCompetitiveDuel = activePlayers <= 2;
  const maxSolventBid = Math.max(0, bot.balance - Math.round(effectiveBuffer * safeRatio));

  const pacingPenaltyRelaxed = (round > 20 && maxSolventBid >= valEstimated * 2)
    ? (isCompetitiveDuel ? 1.2 / 0.7 : 1.0 / 0.7)
    : 1.0;
  const adjustedValEstimated = Math.round(valEstimated * (isCompetitiveDuel ? Math.max(1.0, pacingPenaltyRelaxed) : pacingPenaltyRelaxed));

  return Math.min(
    Math.round(adjustedValEstimated * valMultiplier),
    maxSolventBid,
  );
}

export function isPassiveAuctionAllowed(
  auction: CurrentAuctionState,
  basePrice: number,
  monopolyScore: number,
  nextBid: number,
): boolean {
  if (monopolyScore >= 2.5) return true;
  const cell = BOARD_CONFIG[auction.cellIndex];
  const isInfraOrUtility = cell?.type === CellType.Railroad || cell?.type === CellType.Utility;
  const isMonopolyTarget = monopolyScore >= 1.6;

  const maxThreshold = isMonopolyTarget
    ? 1.50
    : isInfraOrUtility
    ? 1.35
    : 1.15;

  if ((auction.highestBid ?? 0) > basePrice * maxThreshold) return false;
  return nextBid <= basePrice * maxThreshold;
}

function decidePassiveAuctionIntent(
  cur: CurrentAuctionState,
  bot: Player,
  room: Room,
  basePrice: number,
  monopolyScore: number,
  nextBid: number,
  safetyBuffer: number,
  highestBidder?: string,
  config?: BotConfig,
): BotIntent | null {
  if (monopolyScore >= 2.5) return null; // Cho phep xet tiep gia tran monopoly

  // Kiem tra hanh lang nghi binh (Baiting / Trap Bids)
  if (isBaitCorridor(nextBid, basePrice) && Boolean(highestBidder) && highestBidder !== bot.id) {
    if (bot.balance - nextBid < safetyBuffer) {
      return { type: 'INTENT_AUCTION_PASS' };
    }
    const baitRoll = config?.manualRoll ?? (
      config?.rng ? config.rng() : createDeterministicRng(getTurnSeed(bot, room, nextBid))()
    );
    if (baitRoll < AUCTION_BAIT_PROBABILITY) {
      return { type: 'INTENT_BID', amount: nextBid, isBait: true };
    }
    return { type: 'INTENT_AUCTION_PASS' };
  }

  if (!isPassiveAuctionAllowed(cur, basePrice, monopolyScore, nextBid)) {
    return { type: 'INTENT_AUCTION_PASS' };
  }

  return null;
}

export function decideAuctionPhaseIntent(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality: BotPersonality,
  auction?: CurrentAuctionState,
  config?: BotConfig,
): BotIntent {
  const cur = auction ?? room.currentAuction;
  if (!cur || bot.bankrupt || cur.passedPlayers?.has(bot.id) || bot.id === cur.declinedPlayerId) {
    return { type: 'INTENT_AUCTION_PASS' };
  }
  const highestBidder = cur.highestBidderId ?? cur.highestBidder;
  if (highestBidder === bot.id) return { type: 'INTENT_AUCTION_PASS' };

  const auctionRng = config?.rng ?? (
    config?.seed !== undefined
      ? createDeterministicRng(config.seed)
      : createDeterministicRng(getTurnSeed(bot, room, cur.cellIndex))
  );
  const val = evaluateTileValuation(
    cur.cellIndex,
    bot,
    room,
    registry,
    stateMap,
    personality,
    undefined,
    auctionRng,
  );
  const basePrice = PROPERTY_DEEDS.get(cur.cellIndex)?.price ?? val.basePrice;
  const step = calculateAuctionStep(cur, personality, bot.balance);
  const nextBid = (cur.highestBid ?? 0) > 0 ? cur.highestBid! + step : (cur.startingBid ?? 50);

  const threat = calculateThreatHorizon(bot, room, registry, stateMap, personality);

  if (personality === BotPersonality.Passive) {
    const passiveIntent = decidePassiveAuctionIntent(
      cur,
      bot,
      room,
      basePrice,
      val.monopolyScore ?? 1.0,
      nextBid,
      threat.safetyBuffer,
      highestBidder,
      config,
    );
    if (passiveIntent) return passiveIntent;
  }

  const cellConfig = BOARD_CONFIG[cur.cellIndex];
  let isOpponentMonopolyTarget = false;
  if (cellConfig && room.players) {
    if (cellConfig.colorGroup) {
      const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cellConfig.colorGroup);
      const otherCells = groupCells.filter((c) => c.index !== cur.cellIndex);
      for (const opp of room.players) {
        if (!opp || opp.id === bot.id || opp.bankrupt) continue;
        if (otherCells.length > 0 && otherCells.every((c) => registry.get(c.index) === opp.id)) {
          isOpponentMonopolyTarget = true;
          break;
        }
      }
    } else if (cellConfig.type === CellType.Railroad) {
      const allRails = BOARD_CONFIG.filter((c) => c.type === CellType.Railroad && c.index !== cur.cellIndex);
      for (const opp of room.players) {
        if (!opp || opp.id === bot.id || opp.bankrupt) continue;
        if (allRails.filter((c) => registry.get(c.index) === opp.id).length >= 2) {
          isOpponentMonopolyTarget = true;
          break;
        }
      }
    }
  }

  if (isOpponentMonopolyTarget) {
    const isCompetitiveDuel = (room.players.filter((p) => !p.bankrupt).length) <= 2;
    const denialCapMultiplier = isCompetitiveDuel
      ? (personality === BotPersonality.Aggressive ? 2.8 : personality === BotPersonality.Balanced ? 2.2 : 1.7)
      : (personality === BotPersonality.Aggressive ? 2.0 : personality === BotPersonality.Balanced ? 1.6 : 1.4);

    const maxDenialBid = Math.round(basePrice * denialCapMultiplier);
    if ((cur.highestBid ?? 0) >= maxDenialBid) {
      return { type: 'INTENT_AUCTION_PASS' };
    }
    if (bot.balance >= nextBid + Math.round(threat.safetyBuffer * 0.4) && nextBid <= maxDenialBid) {
      return { type: 'INTENT_BID', amount: nextBid };
    }
    return { type: 'INTENT_AUCTION_PASS' };
  }

  const maxBid = calculateAuctionMaxBid(
    bot,
    room,
    personality,
    val.estimatedValue,
    threat.safetyBuffer,
    val.denialScore ?? 1.0,
  );

  if (nextBid <= maxBid && bot.balance >= nextBid) {
    return { type: 'INTENT_BID', amount: nextBid };
  }
  return { type: 'INTENT_AUCTION_PASS' };
}
