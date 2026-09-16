// [UC-BOT-01/MSS][UC-BOT-02/MSS][IMP-59/MSS] Bot AI Softmax Probability & Seeded Jitter Engine
// Domain-only module: does not import Server or Client

import { mulberry32 } from '../dice';
import type { Player, Room } from '../room';
import {
  BotPersonality,
  SOFTMAX_TEMPERATURE,
  PERSONALITY_BUY_BIAS,
} from './bot_types';
import { JITTER_BOUNDS } from './valuation_engine';

export function createDeterministicRng(seed: number): () => number {
  return mulberry32(seed);
}

/**
 * Tinh hash tat dinh cho luot di cua bot tu trang thai phong de dam bao tai lap 100%.
 */
export function getTurnSeed(bot?: Player, room?: Room, extra = 0): number {
  let h = 0x811c9dc5;
  const s = `${room?.roomCode ?? 'room'}:${bot?.id ?? 'bot'}:${room?.round ?? room?.roundCount ?? 1}:${room?.diceSeq ?? 0}:${bot?.position ?? 0}:${extra}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Tinh xac suat Softmax/Sigmoid tu utility va temperature.
 */
export function calculateSoftmaxProbability(utility: number, temperature: number): number {
  if (!Number.isFinite(utility)) {
    if (utility === Infinity) return 1.0;
    return 0.0;
  }
  const safeTemp = Math.max(0.1, Number.isFinite(temperature) ? temperature : 1.0);
  const z = utility / safeTemp;
  if (z > 20) return 1.0;
  if (z < -20) return 0.0;
  const prob = 1 / (1 + Math.exp(-z));
  return Number(prob.toFixed(4));
}

/**
 * Tinh xac suat mua dat (buyProbability) theo Softmax ket hop he so ban sac bot.
 */
export function calculateBuyProbability(
  estimatedValue: number,
  basePrice: number,
  personality: BotPersonality = BotPersonality.Balanced,
  valuePreference = 1.0,
): number {
  if (!Number.isFinite(basePrice) || !Number.isFinite(estimatedValue) || basePrice <= 0 || estimatedValue <= 0) {
    return 0;
  }
  const safePref = Number.isFinite(valuePreference) ? valuePreference : 1.0;
  const ratio = estimatedValue / basePrice;
  const temp = SOFTMAX_TEMPERATURE[personality] ?? 1.0;
  const bias = PERSONALITY_BUY_BIAS[personality] ?? 0;

  let baseUtility: number;
  if (personality === BotPersonality.Aggressive) {
    baseUtility = (ratio - 0.9) * 2.0 + bias;
  } else if (personality === BotPersonality.Passive) {
    baseUtility = (ratio - 1.2) * 2.0 + bias + (safePref - 1.0) * 1.5;
  } else {
    baseUtility = (ratio - 1.0) * 2.0 + bias;
  }

  return calculateSoftmaxProbability(baseUtility, temp);
}

/**
 * Giai phong do nhieu tam ly co seed (Seeded Jitter) trong gioi han [-0.12, 0.12].
 */
export function resolveSeededJitter(
  seedOrRng?: number | (() => number),
  manualJitter?: number,
): number {
  if (typeof manualJitter === 'number' && Number.isFinite(manualJitter)) {
    return manualJitter;
  }
  let roll: number;
  if (typeof seedOrRng === 'function') {
    roll = seedOrRng();
  } else if (typeof seedOrRng === 'number' && Number.isFinite(seedOrRng)) {
    roll = mulberry32(seedOrRng)();
  } else {
    roll = Math.random();
  }
  const safeRoll = Number.isFinite(roll) ? Math.min(1, Math.max(0, roll)) : 0.5;
  const jitter = safeRoll * (JITTER_BOUNDS.MAX - JITTER_BOUNDS.MIN) + JITTER_BOUNDS.MIN;
  return Number(jitter.toFixed(4));
}

/**
 * Lay mau quyet dinh theo xac suat. Neu co manualRoll thi uu tien so sanh manualRoll.
 */
export function sampleDecision(
  probability: number,
  rng?: () => number,
  manualRoll?: number,
): boolean {
  if (!Number.isFinite(probability) || probability <= 0) return false;
  if (probability >= 1.0) return true;
  const roll = typeof manualRoll === 'number' && Number.isFinite(manualRoll)
    ? manualRoll
    : (typeof rng === 'function' ? rng() : 0.5);
  return roll < probability;
}
