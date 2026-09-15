// [UC-GAME-005/MSS][UC-GAME-008/MSS][UC-BOT-03/MSS][UC-BOT-04/MSS] Bot AI Engine — Multi-Factor Dynamic AI
// Domain-only module: KHONG import Server hay Client
import type { Player, Room, MarketModifier, CurrentAuctionState } from '../room';
import { TurnPhase } from '../room';
import { BOARD_CONFIG, CellType } from '../board_config';
import { MarketCardId } from '../event_card_engine';
import type { PropertyRegistry, PropertyStateMap } from '../property_data';
import { PROPERTY_DEEDS } from '../property_data';
import { hasMonopoly, checkEvenBuilding } from '../property_upgrade';

import { BotPersonality, type BotIntent, type TileValuation, type BotConfig, DEFAULT_MIN_SAFETY_BUFFER } from './bot_types';
import { calculateThreatHorizon } from './threat_forecaster';
import { evaluateTileValuation } from './valuation_engine';
import { resolveInsolvencyStep } from './solvency_solver';
import { findEligibleRedeemCell } from './bot_redeem';
import { decideAuditBailout } from './bot_audit';
import {
  calculateAuctionStep,
  calculateAuctionMaxBid,
  isPassiveAuctionAllowed,
  decideAuctionPhaseIntent,
} from './bot_auction';
import { sampleDecision, createDeterministicRng, getTurnSeed } from './bot_softmax';

export {
  BotPersonality,
  type BotIntent,
  type BotConfig,
  findEligibleRedeemCell,
  decideAuditBailout,
  calculateAuctionStep,
  calculateAuctionMaxBid,
  isPassiveAuctionAllowed,
  decideAuctionPhaseIntent,
};

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

function decidePassiveActionIntent(
  bot: Player,
  basePrice: number,
  valuation: TileValuation,
  safetyBuffer: number,
  balanceThresholdMultiplier?: number,
  config?: BotConfig,
  room?: Room,
  actionRng?: () => number,
): BotIntent {
  const cell = BOARD_CONFIG[bot.position];
  const isInfraOrUtility = cell?.type === CellType.Railroad || cell?.type === CellType.Utility;
  const isMonopolyOrStrategic = (valuation.monopolyScore ?? 1.0) >= 1.6 || (valuation.denialScore ?? 1.0) > 1.0;
  const isCheap = basePrice <= 1500;
  const hasCashFortress = bot.balance >= basePrice * 3;

  if (!isCheap && !isInfraOrUtility && !isMonopolyOrStrategic && !hasCashFortress) {
    return { type: 'INTENT_DECLINE' };
  }

  const effectiveThreshold = balanceThresholdMultiplier ?? 1.5;
  if (bot.balance < basePrice * effectiveThreshold || bot.balance - basePrice < safetyBuffer) {
    return { type: 'INTENT_DECLINE' };
  }

  if (config?.manualRoll !== undefined || config?.rng !== undefined || config?.seed !== undefined) {
    if (isMonopolyOrStrategic) return { type: 'INTENT_BUY' };
    const hasAbundantEarlyCash = config?.manualRoll === undefined && hasCashFortress && (room?.round ?? room?.roundCount ?? 1) <= 2;
    if (hasAbundantEarlyCash) return { type: 'INTENT_BUY' };
    const rng = actionRng ?? config.rng ?? createDeterministicRng(config.seed ?? (room ? getTurnSeed(bot, room, bot.position) : 42));
    const buy = sampleDecision(valuation.buyProbability ?? 0.8, rng, config.manualRoll);
    return buy ? { type: 'INTENT_BUY' } : { type: 'INTENT_DECLINE' };
  }

  return { type: 'INTENT_BUY' };
}

function decideActionPhaseIntent(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  config: BotConfig,
): BotIntent {
  const { personality, balanceThresholdMultiplier } = config;
  const actionRng = config.rng ?? (
    config.seed !== undefined
      ? createDeterministicRng(config.seed)
      : createDeterministicRng(getTurnSeed(bot, room, bot.position))
  );
  const valuation = evaluateTileValuation(
    bot.position,
    bot,
    room,
    registry,
    stateMap,
    personality,
    undefined,
    actionRng,
  );
  const basePrice = valuation.basePrice > 0 ? valuation.basePrice : getPriceAtPosition(bot.position);
  if (basePrice <= 0 || bot.balance < basePrice) {
    return { type: 'INTENT_DECLINE' };
  }

  const threat = calculateThreatHorizon(bot, room, registry, stateMap, personality);

  if (personality === BotPersonality.Passive) {
    return decidePassiveActionIntent(bot, basePrice, valuation, threat.safetyBuffer, balanceThresholdMultiplier, config, room, actionRng);
  }

  if (balanceThresholdMultiplier !== undefined && bot.balance < basePrice * balanceThresholdMultiplier) {
    return { type: 'INTENT_DECLINE' };
  }

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

  if (config.manualRoll !== undefined || config.rng !== undefined || config.seed !== undefined) {
    const isMonopolyOrStrategic = (valuation.monopolyScore ?? 1.0) >= 1.6 || (valuation.denialScore ?? 1.0) > 1.0;
    const hasAbundantEarlyCash = config.manualRoll === undefined && bot.balance >= basePrice * 4 && (room?.round ?? room?.roundCount ?? 1) <= 2;
    if (!isMonopolyOrStrategic && !hasAbundantEarlyCash) {
      const buy = sampleDecision(valuation.buyProbability ?? 0.8, actionRng, config.manualRoll);
      return buy ? { type: 'INTENT_BUY' } : { type: 'INTENT_DECLINE' };
    }
  }

  return { type: 'INTENT_BUY' };
}

function getBuildableGroups(
  botId: string,
  mortgagedProperties: readonly number[] | undefined,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): Set<string> {
  const isMortgaged = (idx: number) =>
    Boolean(mortgagedProperties?.includes(idx) || stateMap.get(idx)?.isMortgaged);

  const ownedGroups = new Set<string>();
  for (const cell of BOARD_CONFIG) {
    if (cell.colorGroup && hasMonopoly(botId, cell.index, registry, stateMap)) {
      const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
      const hasMortgaged = groupCells.some((c) => isMortgaged(c.index));
      if (!hasMortgaged) ownedGroups.add(cell.colorGroup);
    }
  }
  return ownedGroups;
}

function canUpgradeCell(
  cellIndex: number,
  bot: Player,
  safetyBuffer: number,
  dangerTilesCount: number,
  upgradeCost: number,
  personality: BotPersonality,
): boolean {
  if (personality === BotPersonality.Passive) {
    return bot.balance >= upgradeCost * 3 && dangerTilesCount === 0 && bot.balance - upgradeCost >= safetyBuffer;
  }
  return bot.balance - upgradeCost >= safetyBuffer;
}

function findEligibleUpgradeCell(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality: BotPersonality,
): number | null {
  const ownedGroups = getBuildableGroups(bot.id, bot.mortgagedProperties, registry, stateMap);
  if (ownedGroups.size === 0) return null;

  const threat = calculateThreatHorizon(bot, room, registry, stateMap, personality);
  const isMortgaged = (idx: number) =>
    Boolean(bot.mortgagedProperties?.includes(idx) || stateMap.get(idx)?.isMortgaged);

  for (const group of ownedGroups) {
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === group);
    for (const cell of groupCells) {
      if (isMortgaged(cell.index)) continue;
      const state = stateMap.get(cell.index) ?? { level: 0 };
      if (state.level >= 3 || !checkEvenBuilding(cell.index, stateMap).valid) continue;

      const upgradeCost = getUpgradeCost(cell.index, stateMap, room.activeModifiers);
      if (upgradeCost <= 0) continue;

      if (canUpgradeCell(cell.index, bot, threat.safetyBuffer, threat.dangerTilesCount, upgradeCost, personality)) {
        return cell.index;
      }
    }
  }
  return null;
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
  const { personality } = config;

  switch (room.phase) {
    case TurnPhase.WaitingRoll: {
      if (bot.auditTurnsLeft > 0) {
        const shouldBailout = decideAuditBailout(bot, room, registry, stateMap, personality);
        if (shouldBailout) {
          return { type: 'INTENT_BAIL_OUT' };
        }
      }
      return { type: 'INTENT_ROLL' };
    }

    case TurnPhase.ActionPhase:
      return decideActionPhaseIntent(bot, room, registry, stateMap, config);

    case TurnPhase.PropertyManagement: {
      const upgradeCell = findEligibleUpgradeCell(bot, room, registry, stateMap, personality);
      if (upgradeCell !== null) {
        return { type: 'INTENT_UPGRADE', cellIndex: upgradeCell };
      }
      const redeemCell = findEligibleRedeemCell(bot, room, registry, stateMap, personality);
      if (redeemCell !== null) {
        return { type: 'INTENT_REDEEM', cellIndex: redeemCell };
      }
      return { type: 'INTENT_END_TURN' };
    }

    case TurnPhase.AuctionPhase:
      return decideAuctionPhaseIntent(bot, room, registry, stateMap, personality, auction, config);

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

