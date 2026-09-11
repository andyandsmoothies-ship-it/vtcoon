// [UC-BOT-02/MSS][UC-BOT-02/A1][UC-BOT-02/A2][UC-BOT-02/A3][UC-BOT-02/A4][UC-BOT-02/A5]
// Valuation Engine — Dynamic Property Valuation & Pacing
// Domain-only module: does not import Server or Client
import type { Player, Room } from '../room';
import { BOARD_CONFIG } from '../board_config';
import {
  PROPERTY_DEEDS,
  isPurchasable,
  type PropertyRegistry,
  type PropertyStateMap,
} from '../property_data';
import {
  BotPersonality,
  type TileValuation,
} from './bot_types';
import { calculateThreatHorizon } from './threat_forecaster';

export const PACING_STAGE_MULTIPLIERS = Object.freeze({
  EARLY: 1.4, // Round 1..8: Expansion phase
  MID:   1.1, // Round 9..20: Color set completion phase
  LATE:  0.7, // Round 21..30+: Survival / cash preservation phase
});

export const MONOPOLY_MULTIPLIERS = Object.freeze({
  DEFAULT:             1.0,
  TWO_OF_THREE:        1.6,
  COMPLETE_STANDARD:   2.8,
  COMPLETE_AGGRESSIVE: 3.2,
});

export const DENIAL_MULTIPLIERS: Readonly<Record<BotPersonality, number>> = Object.freeze({
  [BotPersonality.Passive]:    1.3,
  [BotPersonality.Balanced]:   1.7,
  [BotPersonality.Aggressive]: 2.2,
});

export const DENIAL_MULTIPLIER_NONE = 1.0;
export const MIN_LIQUIDITY_MULTIPLIER = 0.25;

export const JITTER_BOUNDS = Object.freeze({
  MIN: -0.12,
  MAX:  0.12,
});

export function getPacingMultiplier(round?: number): number {
  const currentRound = typeof round === 'number' && round > 0 ? round : 1;
  if (currentRound <= 8) return PACING_STAGE_MULTIPLIERS.EARLY;
  if (currentRound <= 20) return PACING_STAGE_MULTIPLIERS.MID;
  return PACING_STAGE_MULTIPLIERS.LATE;
}

export function calculateMonopolyMultiplier(
  cellIndex: number,
  botId: string,
  registry?: PropertyRegistry,
  personality?: BotPersonality,
): number {
  const cell = BOARD_CONFIG[cellIndex];
  if (!cell?.colorGroup) return MONOPOLY_MULTIPLIERS.DEFAULT;

  const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
  const totalInGroup = groupCells.length;

  const botOwned = groupCells.filter(
    (c) => c.index !== cellIndex && registry?.get(c.index) === botId,
  ).length;

  if (botOwned + 1 === totalInGroup) {
    return personality === BotPersonality.Aggressive
      ? MONOPOLY_MULTIPLIERS.COMPLETE_AGGRESSIVE
      : MONOPOLY_MULTIPLIERS.COMPLETE_STANDARD;
  }

  if (totalInGroup === 3 && botOwned === 1) {
    return MONOPOLY_MULTIPLIERS.TWO_OF_THREE;
  }

  return MONOPOLY_MULTIPLIERS.DEFAULT;
}

export function calculateDenialMultiplier(
  cellIndex: number,
  botId: string,
  room?: Room,
  registry?: PropertyRegistry,
  personality?: BotPersonality,
): number {
  const cell = BOARD_CONFIG[cellIndex];
  if (!cell?.colorGroup || !room?.players) return DENIAL_MULTIPLIER_NONE;

  const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
  const totalInGroup = groupCells.length;

  let isDenialTarget = false;
  for (const opponent of room.players) {
    if (!opponent || opponent.id === botId || opponent.bankrupt) continue;
    if (registry?.get(cellIndex) === opponent.id) continue;

    const opponentOwned = groupCells.filter((c) => registry?.get(c.index) === opponent.id).length;
    if (opponentOwned === totalInGroup - 1) {
      isDenialTarget = true;
      break;
    }
  }

  if (!isDenialTarget) {
    return DENIAL_MULTIPLIER_NONE;
  }

  const resolvedPersonality = personality ?? BotPersonality.Balanced;
  return DENIAL_MULTIPLIERS[resolvedPersonality] ?? DENIAL_MULTIPLIERS[BotPersonality.Balanced];
}

export function calculateLiquidityMultiplier(remainingBalance: number, safetyBuffer: number): number {
  const safeBuffer = Number.isFinite(safetyBuffer) && safetyBuffer > 0 ? safetyBuffer : 1;
  const balance = Number.isFinite(remainingBalance) ? remainingBalance : 0;
  if (balance >= safeBuffer) {
    return 1.0;
  }
  const ratio = balance / safeBuffer;
  return Math.max(MIN_LIQUIDITY_MULTIPLIER, Number(ratio.toFixed(2)));
}

export function resolveJitter(manualJitter?: number): number {
  if (typeof manualJitter === 'number' && Number.isFinite(manualJitter)) {
    return manualJitter;
  }
  return Math.random() * (JITTER_BOUNDS.MAX - JITTER_BOUNDS.MIN) + JITTER_BOUNDS.MIN;
}

/**
 * [UC-BOT-02/MSS] Tinh toan dinh gia dong cho mot o bat dong san
 */
export function evaluateTileValuation(
  cellIndex: number,
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality?: BotPersonality,
  manualJitter?: number,
): TileValuation {
  const basePrice = PROPERTY_DEEDS.get(cellIndex)?.price ?? 0;
  const roundNumber = room?.round ?? room?.roundCount;
  if (basePrice <= 0 || !isPurchasable(cellIndex) || !bot) {
    return {
      cellIndex,
      estimatedValue: 0,
      basePrice: 0,
      monopolyScore: MONOPOLY_MULTIPLIERS.DEFAULT,
      denialScore: DENIAL_MULTIPLIER_NONE,
      pacingFactor: getPacingMultiplier(roundNumber),
      liquidityMultiplier: 1.0,
      jitterMultiplier: 1.0,
      strategicMultiplier: 1.0,
    };
  }

  const stageMultiplier = getPacingMultiplier(roundNumber);
  const monopolyMultiplier = calculateMonopolyMultiplier(cellIndex, bot.id, registry, personality);
  const denialMultiplier = calculateDenialMultiplier(cellIndex, bot.id, room, registry, personality);
  const strategicMultiplier = Math.max(monopolyMultiplier, denialMultiplier);

  const threat = calculateThreatHorizon(bot, room, registry, stateMap, personality);
  const safetyBuffer = Number.isFinite(threat?.safetyBuffer) ? threat.safetyBuffer : 300;
  const currentBalance = Number.isFinite(bot.balance) ? bot.balance : 0;
  const remaining = currentBalance - basePrice;
  const liquidityMultiplier = calculateLiquidityMultiplier(remaining, safetyBuffer);

  const jitter = resolveJitter(manualJitter);
  const jitterMultiplier = 1 + jitter;

  const rawEstimatedValue =
    basePrice * stageMultiplier * strategicMultiplier * liquidityMultiplier * jitterMultiplier;
  const estimatedValue = Number.isFinite(rawEstimatedValue)
    ? Math.max(0, Math.round(rawEstimatedValue))
    : 0;

  return {
    cellIndex,
    estimatedValue,
    basePrice,
    monopolyScore: monopolyMultiplier,
    denialScore: denialMultiplier,
    pacingFactor: stageMultiplier,
    liquidityMultiplier,
    jitterMultiplier,
    strategicMultiplier,
  };
}
