// [UC-BOT-01/MSS][UC-BOT-01/A1][UC-BOT-01/A2][UC-BOT-01/A3] Threat Forecaster 2D6
// Domain-only module: KHONG import Server hay Client
import type { Player, Room } from '../room';
import { BOARD_SIZE } from '../room';
import { BOARD_CONFIG } from '../board_config';
import type { PropertyRegistry, PropertyStateMap } from '../property_data';
import { resolveRent, calculateRent, hasZeroRent } from '../property_rent';
import {
  BotPersonality,
  DEFAULT_PERSONALITY_WEIGHTS,
  DICE_2D6_PROBABILITIES,
  DICE_2D6_STEPS,
  type ThreatHorizon,
} from './bot_types';

/**
 * Tra ve so tien thue phai tra neu buoc vao o cua doi thu; 0 neu an toan.
 */
function getOpponentTileRent(
  cellIndex: number,
  botId: string,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  step: number,
): number {
  const ownerId = registry?.get(cellIndex);
  if (!ownerId || ownerId === botId) return 0;

  const owner = room?.players?.find((p) => p.id === ownerId);
  if (!owner || owner.bankrupt) return 0;

  const isMortgaged = Boolean(
    owner.mortgagedProperties?.includes(cellIndex) ||
    stateMap?.get(cellIndex)?.isMortgaged,
  );
  if (isMortgaged) return 0;

  if (hasZeroRent(cellIndex, room?.activeModifiers)) return 0;

  const cell = BOARD_CONFIG[cellIndex];
  if (!cell) return 0;

  let baseRent = resolveRent(cell, cellIndex, ownerId, registry, stateMap, step);
  if (baseRent <= 0) return 0;

  const bonusPct = room?.permanentRentBonus?.[cellIndex] ?? 0;
  if (bonusPct > 0) {
    baseRent = Math.floor(baseRent * (1 + bonusPct));
  }

  const rent = calculateRent(baseRent, cellIndex, room?.activeModifiers, stateMap);
  return Math.max(0, rent);
}

/**
 * Quet cac buoc tiep theo (2 den 12) theo xac suat 2d6 de tinh toan rui ro thiet hai tien thue
 * va sinh ra dem an toan tien mat (safetyBuffer).
 * [UC-BOT-01/MSS]
 */
export function calculateThreatHorizon(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality?: BotPersonality,
): ThreatHorizon {
  const resolvedPersonality = personality ?? BotPersonality.Balanced;
  const weights = DEFAULT_PERSONALITY_WEIGHTS[resolvedPersonality]
    ?? DEFAULT_PERSONALITY_WEIGHTS[BotPersonality.Balanced];
  const { riskMultiplier, minBuffer } = weights;

  if (!bot || bot.bankrupt) {
    return {
      expectedLoss: 0,
      maxSingleDanger: 0,
      dangerTilesCount: 0,
      safetyBuffer: minBuffer,
    };
  }

  let expectedLoss = 0;
  let maxSingleDanger = 0;
  let dangerTilesCount = 0;

  const botPos = Number.isFinite(bot.position)
    ? ((Math.trunc(bot.position) % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE
    : 0;

  for (const step of DICE_2D6_STEPS) {
    const targetIndex = (botPos + step) % BOARD_SIZE;
    const rent = getOpponentTileRent(targetIndex, bot.id, room, registry, stateMap, step);

    if (rent > 0) {
      const prob = DICE_2D6_PROBABILITIES[step] ?? 0;
      expectedLoss += prob * rent;
      if (rent > maxSingleDanger) {
        maxSingleDanger = rent;
      }
      dangerTilesCount++;
    }
  }

  const safetyBuffer = Math.max(minBuffer, Math.round(expectedLoss * riskMultiplier));

  return {
    expectedLoss,
    maxSingleDanger,
    dangerTilesCount,
    safetyBuffer,
  };
}
