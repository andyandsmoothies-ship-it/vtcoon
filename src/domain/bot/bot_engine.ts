// [UC-GAME-005/MSS][UC-GAME-008/MSS][UC-BOT-03/MSS][UC-BOT-04/MSS] Bot AI Engine — Multi-Factor Dynamic AI
// Domain-only module: KHONG import Server hay Client
import type { Player, Room, MarketModifier, CurrentAuctionState } from '../room';
import { TurnPhase } from '../room';
import { BOARD_CONFIG, CellType } from '../board_config';
import type { PropertyRegistry, PropertyStateMap } from '../property_data';
import { PROPERTY_DEEDS } from '../property_data';
import { hasMonopoly, checkEvenBuilding, calculateUpgradeCost } from '../property_upgrade';

import { BotPersonality, BotPosture, type BotIntent, type TileValuation, type BotConfig } from './bot_types';
import {
  evaluateBotPosture,
  calculateAmbushScore,
  findEligibleProactiveMortgage,
} from './bot_posture.js';
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
import {
  findMonopolyGap,
  calculateTradeOfferPrice,
  evaluateBotTradeAcceptance,
  findEligibleBotTrade,
} from './bot_trade.js';

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
  findMonopolyGap,
  calculateTradeOfferPrice,
  evaluateBotTradeAcceptance,
  findEligibleBotTrade,
};

import {
  getPriceAtPosition,
  getUpgradeCost,
  decidePassiveActionIntent,
  decideActionPhaseIntent,
  getBuildableGroups,
  canUpgradeCell,
  findEligibleUpgradeCell,
} from './bot_action_evaluator.js';

export {
  getPriceAtPosition,
  getUpgradeCost,
  decidePassiveActionIntent,
  decideActionPhaseIntent,
  getBuildableGroups,
  canUpgradeCell,
  findEligibleUpgradeCell,
};


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
      const currentRound = room.roundCount ?? room.round ?? 1;
      const posture = evaluateBotPosture(bot.id, room.players, registry, stateMap, currentRound);

      const upgradeCell = findEligibleUpgradeCell(bot, room, registry, stateMap, personality, posture);
      if (upgradeCell !== null) {
        return { type: 'INTENT_UPGRADE', cellIndex: upgradeCell };
      }

      const proactiveMortgage = findEligibleProactiveMortgage(bot, room, registry, stateMap);
      if (proactiveMortgage !== null) {
        const deed = PROPERTY_DEEDS.get(proactiveMortgage);
        const gain = Math.floor((deed?.price ?? 0) * 0.5);
        const hypotheticalBot = { ...bot, balance: bot.balance + gain };
        if (findEligibleUpgradeCell(hypotheticalBot, room, registry, stateMap, personality, posture) !== null) {
          return { type: 'INTENT_MORTGAGE', cellIndex: proactiveMortgage };
        }
      }

      const redeemCell = findEligibleRedeemCell(bot, room, registry, stateMap, personality);
      if (redeemCell !== null) {
        return { type: 'INTENT_REDEEM', cellIndex: redeemCell };
      }
      const tradeIntent = findEligibleBotTrade(bot, room, registry, stateMap, personality, currentRound);
      if (tradeIntent !== null) {
        bot.lastTradeOfferRound = currentRound;
        (room.lastTargetTradeOfferRound ??= {})[tradeIntent.sellerId] = currentRound;
        return tradeIntent;
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

