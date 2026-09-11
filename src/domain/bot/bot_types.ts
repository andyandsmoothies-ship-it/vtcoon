// [UC-BOT-01/MSS] Bot AI Domain Types, Probabilities, and Weights
// Domain-only module: does not import Server or Client

export enum BotPersonality {
  Passive    = 'Passive',
  Balanced   = 'Balanced',
  Aggressive = 'Aggressive',
}

/** Number of combinations for each sum in 2d6 dice rolls */
export const DICE_2D6_COMBINATIONS: Readonly<Record<number, number>> = Object.freeze({
  2:  1,
  3:  2,
  4:  3,
  5:  4,
  6:  5,
  7:  6,
  8:  5,
  9:  4,
  10: 3,
  11: 2,
  12: 1,
});

export const TOTAL_2D6_COMBINATIONS = 36;

/** Exact 2d6 probability distribution table for steps 2 to 12 */
export const DICE_2D6_PROBABILITIES: Readonly<Record<number, number>> = Object.freeze({
  2:  1 / 36,
  3:  2 / 36,
  4:  3 / 36,
  5:  4 / 36,
  6:  5 / 36,
  7:  6 / 36,
  8:  5 / 36,
  9:  4 / 36,
  10: 3 / 36,
  11: 2 / 36,
  12: 1 / 36,
});

export const DICE_2D6_STEPS = Object.freeze([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const);

export const DEFAULT_MIN_SAFETY_BUFFER = 300;

export interface ThreatHorizon {
  readonly expectedLoss: number;
  readonly maxSingleDanger: number;
  readonly dangerTilesCount: number;
  readonly safetyBuffer: number;
}

export interface PersonalityWeights {
  readonly riskMultiplier: number;
  readonly minBuffer: number;
  readonly monopolyWeight?: number;
  readonly denialWeight?: number;
  readonly pacingMultiplier?: number;
}

export const DEFAULT_PERSONALITY_WEIGHTS: Readonly<Record<BotPersonality, PersonalityWeights>> = Object.freeze({
  [BotPersonality.Passive]: Object.freeze({
    riskMultiplier: 1.5,
    minBuffer: DEFAULT_MIN_SAFETY_BUFFER,
    monopolyWeight: 1.2,
    denialWeight: 1.3,
    pacingMultiplier: 0.8,
  }),
  [BotPersonality.Balanced]: Object.freeze({
    riskMultiplier: 1.0,
    minBuffer: DEFAULT_MIN_SAFETY_BUFFER,
    monopolyWeight: 1.8,
    denialWeight: 1.7,
    pacingMultiplier: 1.0,
  }),
  [BotPersonality.Aggressive]: Object.freeze({
    riskMultiplier: 0.6,
    minBuffer: DEFAULT_MIN_SAFETY_BUFFER,
    monopolyWeight: 2.5,
    denialWeight: 2.2,
    pacingMultiplier: 1.3,
  }),
});

export interface TileValuation {
  readonly cellIndex: number;
  readonly estimatedValue: number;
  readonly basePrice: number;
  readonly monopolyScore?: number;
  readonly denialScore?: number;
  readonly pacingFactor?: number;
  readonly liquidityMultiplier?: number;
  readonly jitterMultiplier?: number;
  readonly strategicMultiplier?: number;
}

export enum SolvencyActionType {
  Downgrade  = 'INTENT_DOWNGRADE',
  Mortgage   = 'INTENT_MORTGAGE',
  Bankruptcy = 'INTENT_BANKRUPTCY',
}

export interface SolvencyAction {
  readonly type: SolvencyActionType;
  readonly cellIndex?: number;
}

export interface BotIntent {
  type: string;
  [key: string]: unknown;
}

export type { CurrentAuctionState } from '../room';

