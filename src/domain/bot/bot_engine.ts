// [UC-GAME-005/MSS][UC-GAME-008/MSS] Bot AI Engine -- 3 tinh cach
// Domain-only module: KHONG import Server hay Client
import type { Player, Room } from '../room';
import { TurnPhase } from '../room';
import type { PropertyRegistry, PropertyStateMap } from '../property_data';
import { PROPERTY_DEEDS } from '../property_data';

export enum BotPersonality {
  Passive    = 'Passive',
  Balanced   = 'Balanced',
  Aggressive = 'Aggressive',
}

export interface BotConfig {
  personality: BotPersonality;
  /** Balanced: 1.20, Aggressive: 1.00 */
  balanceThresholdMultiplier: number;
}

export interface BotIntent {
  type: string;
  [key: string]: unknown;
}

/** Tra ve gia niem yet cua o tai position; 0 neu khong phai o tai san. */
function getPriceAtPosition(position: number): number {
  return PROPERTY_DEEDS.get(position)?.price ?? 0;
}

/**
 * Quyet dinh intent tiep theo cho Bot dua tren phase hien tai cua room.
 * Tra ve null neu khong co hanh dong hop le (phase khong xac dinh).
 * [UC-GAME-005/MSS][UC-GAME-008/MSS]
 */
export function decideBotIntent(
  bot: Player,
  room: Room,
  _registry: PropertyRegistry,
  _stateMap: PropertyStateMap,
  config: BotConfig,
): BotIntent | null {
  const { personality, balanceThresholdMultiplier } = config;

  switch (room.phase) {
    case TurnPhase.WaitingRoll:
      return { type: 'INTENT_ROLL' };

    case TurnPhase.ActionPhase: {
      if (personality === BotPersonality.Passive) {
        return { type: 'INTENT_DECLINE' };
      }
      const price = getPriceAtPosition(bot.position);
      const canAfford = price > 0 && bot.balance >= price * balanceThresholdMultiplier;
      return canAfford ? { type: 'INTENT_BUY' } : { type: 'INTENT_DECLINE' };
    }

    case TurnPhase.PropertyManagement:
      // Slice 06: tat ca personalities ket thuc luot ngay.
      // Upgrade logic day du -> Slice 07.
      return { type: 'INTENT_END_TURN' };

    case TurnPhase.AuctionPhase:
      return { type: 'INTENT_AUCTION_PASS' };

    default:
      return null;
  }
}
