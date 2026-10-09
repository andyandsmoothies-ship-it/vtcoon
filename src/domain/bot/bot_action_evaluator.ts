// [IMP-302] Bot Action & Property Upgrade Valuation Engine
import type { Player, Room, MarketModifier } from '../room';
import { BOARD_CONFIG, CellType } from '../board_config';
import type { PropertyRegistry, PropertyStateMap } from '../property_data';
import { PROPERTY_DEEDS } from '../property_data';
import { hasMonopoly, checkEvenBuilding, calculateUpgradeCost } from '../property_upgrade';
import { BotPersonality, BotPosture, type BotIntent, type TileValuation, type BotConfig } from './bot_types';
import { calculateAmbushScore } from './bot_posture.js';
import { calculateThreatHorizon } from './threat_forecaster';
import { evaluateTileValuation } from './valuation_engine';
import { sampleDecision, createDeterministicRng, getTurnSeed } from './bot_softmax';

export function getPriceAtPosition(position: number): number {
  return PROPERTY_DEEDS.get(position)?.price ?? 0;
}

export function getUpgradeCost(
  cellIndex: number,
  stateMap: PropertyStateMap,
  modifiers?: readonly MarketModifier[],
): number {
  return calculateUpgradeCost(cellIndex, stateMap.get(cellIndex)?.level ?? 0, modifiers);
}

export function decidePassiveActionIntent(
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
  const hasSufficientCash = bot.balance - basePrice >= safetyBuffer;

  if (!hasSufficientCash) {
    return { type: 'INTENT_DECLINE' };
  }

  if (isInfraOrUtility || isMonopolyOrStrategic) {
    return { type: 'INTENT_BUY' };
  }

  const effectiveThreshold = balanceThresholdMultiplier ?? 1.25;
  if (bot.balance < basePrice * effectiveThreshold) {
    return { type: 'INTENT_DECLINE' };
  }

  if (config?.manualRoll !== undefined || config?.rng !== undefined || config?.seed !== undefined) {
    const rng = actionRng ?? config.rng ?? createDeterministicRng(config.seed ?? (room ? getTurnSeed(bot, room, bot.position) : 42));
    const buy = sampleDecision(valuation.buyProbability ?? 0.8, rng, config.manualRoll);
    return buy ? { type: 'INTENT_BUY' } : { type: 'INTENT_DECLINE' };
  }

  return { type: 'INTENT_BUY' };
}

export function decideActionPhaseIntent(
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

  const activePlayers = room?.players?.filter((p) => !p.bankrupt).length ?? 4;
  const isCompetitiveDuel = Boolean(room?.started && activePlayers <= 2);
  const hasAbundantCash = isCompetitiveDuel && config.manualRoll === undefined && bot.balance >= basePrice * 2.5 && bot.balance - basePrice >= threat.safetyBuffer;

  if (!hasAbundantCash && valuation.estimatedValue < valuation.basePrice) {
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
    if (!isMonopolyOrStrategic && !hasAbundantEarlyCash && !hasAbundantCash) {
      const buy = sampleDecision(valuation.buyProbability ?? 0.8, actionRng, config.manualRoll);
      return buy ? { type: 'INTENT_BUY' } : { type: 'INTENT_DECLINE' };
    }
  }

  return { type: 'INTENT_BUY' };
}

export function getBuildableGroups(
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

export function canUpgradeCell(
  cellIndex: number,
  bot: Player,
  safetyBuffer: number,
  dangerTilesCount: number,
  upgradeCost: number,
  personality: BotPersonality,
  posture?: BotPosture,
  round?: number,
): boolean {
  if (personality === BotPersonality.Passive) {
    if (bot.balance < upgradeCost * 3) return false;
    const isUnderdog = posture === BotPosture.Trailing || (round !== undefined && round >= 20);
    if (isUnderdog) {
      return bot.balance - upgradeCost >= safetyBuffer * 1.8;
    }
    if (dangerTilesCount > 0) {
      return bot.balance - upgradeCost >= safetyBuffer * 3 && bot.balance >= upgradeCost * 5;
    }
    return bot.balance - upgradeCost >= safetyBuffer * 1.2;
  }
  if (personality === BotPersonality.Aggressive && posture === BotPosture.Leading) {
    return bot.balance - upgradeCost >= safetyBuffer * 1.45;
  }
  return bot.balance - upgradeCost >= safetyBuffer;
}

export function findEligibleUpgradeCell(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality: BotPersonality,
  posture?: BotPosture,
): number | null {
  const ownedGroups = getBuildableGroups(bot.id, bot.mortgagedProperties, registry, stateMap);
  if (ownedGroups.size === 0) return null;

  const threat = calculateThreatHorizon(bot, room, registry, stateMap, personality);
  const isMortgaged = (idx: number) =>
    Boolean(bot.mortgagedProperties?.includes(idx) || stateMap.get(idx)?.isMortgaged);
  const currentRound = room.roundCount ?? room.round ?? 1;

  const candidates: Array<{ cellIndex: number; ambushScore: number }> = [];

  for (const group of ownedGroups) {
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === group);
    for (const cell of groupCells) {
      if (isMortgaged(cell.index)) continue;
      const state = stateMap.get(cell.index) ?? { level: 0 };
      if (state.level >= 3 || !checkEvenBuilding(cell.index, stateMap).valid) continue;

      const upgradeCost = getUpgradeCost(cell.index, stateMap, room.activeModifiers);
      if (upgradeCost <= 0) continue;

      if (canUpgradeCell(cell.index, bot, threat.safetyBuffer, threat.dangerTilesCount, upgradeCost, personality, posture, currentRound)) {
        const ambush = calculateAmbushScore(cell.index, room.players, bot.id);
        candidates.push({ cellIndex: cell.index, ambushScore: ambush });
      }
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.ambushScore - a.ambushScore);
  return candidates[0]!.cellIndex;
}
