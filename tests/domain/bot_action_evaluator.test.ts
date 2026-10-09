// [IMP-302] Living Contract Tests: Bot Action Evaluator
import { describe, it, expect } from 'vitest';
import {
  getPriceAtPosition,
  getUpgradeCost,
  decidePassiveActionIntent,
  decideActionPhaseIntent,
  getBuildableGroups,
  canUpgradeCell,
  findEligibleUpgradeCell,
} from '../../src/domain/bot/bot_action_evaluator';
import { BotPersonality, BotPosture, type TileValuation } from '../../src/domain/bot/bot_types';
import { decideBotIntent } from '../../src/domain/bot/bot_engine';
import { createPlayer, createRoom, TurnPhase } from '../../src/domain/room';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data';
import { PROPERTY_DEEDS } from '../../src/domain/property_data';

describe('Station 1 Contract Tests: BotActionEvaluator', () => {
  it('TC-BAE-EVAL.01 [UC-BAE-EVAL/MSS] getPriceAtPosition returns 0 for non-property start cell', () => {
    const price = getPriceAtPosition(0);
    expect(price).toBe(0);
  });

  it('TC-BAE-EVAL.02 [UC-BAE-EVAL/MSS] getPriceAtPosition returns exact listed deed price for property cell', () => {
    const deedPrice = PROPERTY_DEEDS.get(1)?.price ?? 0;
    const price = getPriceAtPosition(1);
    expect(price).toBe(deedPrice);
    expect(price).toBeGreaterThan(0);
  });

  it('TC-BAE-EVAL.03 [UC-BAE-EVAL/MSS] getUpgradeCost returns valid cost for level 0 property', () => {
    const stateMap: PropertyStateMap = new Map();
    stateMap.set(1, { level: 0 });
    const cost = getUpgradeCost(1, stateMap);
    expect(cost).toBeGreaterThan(0);
  });

  it('TC-BAE-EVAL.04 [UC-BAE-EVAL/MSS] decidePassiveActionIntent declines when bot lacks cash for safety buffer', () => {
    const bot = createPlayer('bot-p1');
    bot.balance = 500;
    const valuation: TileValuation = { cellIndex: 1, basePrice: 400, estimatedValue: 400 };
    const intent = decidePassiveActionIntent(bot, 400, valuation, 200);
    expect(intent.type).toBe('INTENT_DECLINE');
  });

  it('TC-BAE-EVAL.05 [UC-BAE-EVAL/MSS] decidePassiveActionIntent buys railroad or utility when cash exceeds safety buffer', () => {
    const bot = createPlayer('bot-p2');
    bot.balance = 2200; // 2200 < 2000 * 1.25 = 2500, so only isInfraOrUtility allows buy
    bot.position = 5; // Railroad (Ben xe Mien Dong)
    const valuation: TileValuation = { cellIndex: 5, basePrice: 2000, estimatedValue: 2000 };
    const intent = decidePassiveActionIntent(bot, 2000, valuation, 100);
    expect(intent.type).toBe('INTENT_BUY');
  });

  it('TC-BAE-EVAL.06 [UC-BAE-EVAL/MSS] decidePassiveActionIntent declines when balance is below threshold multiplier', () => {
    const bot = createPlayer('bot-p3');
    bot.balance = 1200;
    bot.position = 1; // Standard property
    const valuation: TileValuation = { cellIndex: 1, basePrice: 1000, estimatedValue: 1000 };
    const intent = decidePassiveActionIntent(bot, 1000, valuation, 100, 1.5);
    expect(intent.type).toBe('INTENT_DECLINE');

    bot.balance = 3000;
    const zeroProbValuation: TileValuation = { cellIndex: 1, basePrice: 1000, estimatedValue: 1000, buyProbability: 0.0 };
    const buyIntent = decidePassiveActionIntent(bot, 1000, zeroProbValuation, 100);
    expect(buyIntent.type).toBe('INTENT_BUY');
  });

  it('TC-BAE-EVAL.07 [UC-BAE-EVAL/MSS] decideActionPhaseIntent declines when property price exceeds balance', () => {
    const room = createRoom('room-bae-7');
    const bot = createPlayer('bot-bae-7');
    bot.balance = 700; // 700 > 600 basePrice, but 700 < 600 * 1.5 = 900
    bot.position = 1; // Price is 600
    room.players = [bot];
    room.phase = TurnPhase.ActionPhase;
    const registry: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();

    const intent = decideActionPhaseIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.5,
    });
    expect(intent.type).toBe('INTENT_DECLINE');
  });

  it('TC-BAE-EVAL.08 [UC-BAE-EVAL/MSS] decideActionPhaseIntent delegates to passive rules for passive personality', () => {
    const room = createRoom('room-bae-8');
    const bot = createPlayer('bot-bae-8');
    bot.balance = 600;
    bot.position = 1;
    room.players = [bot];
    room.phase = TurnPhase.ActionPhase;
    const registry: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();

    const intent = decideActionPhaseIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 2.0,
    });
    expect(intent.type).toBe('INTENT_DECLINE');
  });

  it('TC-BAE-EVAL.09 [UC-BAE-EVAL/MSS] decideActionPhaseIntent declines when danger tiles exist and remaining cash is below safetyBuffer', () => {
    const room = createRoom('room-bae-9');
    const bot = createPlayer('bot-bae-9');
    const rival = createPlayer('rival-9');
    bot.balance = 700; // Remaining cash after 600 price = 100 < safetyBuffer
    bot.position = 1;
    rival.position = 10;
    room.players = [bot, rival];
    room.phase = TurnPhase.ActionPhase;
    const registry: PropertyRegistry = new Map();
    registry.set(3, rival.id); // rival owns tile 3 nearby
    const stateMap: PropertyStateMap = new Map();
    stateMap.set(3, { level: 2 }); // high rent hazard nearby

    const intent = decideActionPhaseIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Aggressive,
      balanceThresholdMultiplier: 1.0,
    });
    expect(intent.type).toBe('INTENT_DECLINE');
  });

  it('TC-BAE-EVAL.10 [UC-BAE-EVAL/MSS] decideActionPhaseIntent buys in competitive 2-player duel with abundant cash', () => {
    const room = createRoom('room-bae-10');
    room.started = true;
    const bot = createPlayer('bot-bae-10');
    const rival = createPlayer('rival-10');
    bot.balance = 20000;
    bot.position = 1;
    room.players = [bot, rival];
    room.phase = TurnPhase.ActionPhase;
    const registry: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();

    const intent = decideActionPhaseIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Aggressive,
      balanceThresholdMultiplier: 1.0,
    });
    expect(intent.type).toBe('INTENT_BUY');
  });

  it('TC-BAE-EVAL.11 [UC-BAE-EVAL/MSS] getBuildableGroups returns empty set when bot has no monopolies', () => {
    const registry: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();
    const groups = getBuildableGroups('bot-no-monopoly', undefined, registry, stateMap);
    expect(groups.size).toBe(0);
  });

  it('TC-BAE-EVAL.12 [UC-BAE-EVAL/MSS] getBuildableGroups excludes group if any property in it is mortgaged', () => {
    const botId = 'bot-mono-1';
    const registry: PropertyRegistry = new Map();
    registry.set(1, botId);
    registry.set(3, botId);
    const stateMap: PropertyStateMap = new Map();
    stateMap.set(1, { level: 0, isMortgaged: true }); // Cell 1 is mortgaged
    stateMap.set(3, { level: 0, isMortgaged: false });

    const groups = getBuildableGroups(botId, [1], registry, stateMap);
    expect(groups.has('BROWN')).toBe(false);
  });

  it('TC-BAE-EVAL.13 [UC-BAE-EVAL/MSS] canUpgradeCell returns false for Passive bot when balance < 3x upgradeCost', () => {
    const bot = createPlayer('bot-p13');
    bot.balance = 2000;
    const result = canUpgradeCell(1, bot, 200, 0, 1000, BotPersonality.Passive);
    expect(result).toBe(false);
  });

  it('TC-BAE-EVAL.14 [UC-BAE-EVAL/MSS] canUpgradeCell enforces safetyBuffer multiplier for Aggressive Leading bot', () => {
    const bot = createPlayer('bot-a14');
    bot.balance = 1000; // Remaining cash after 500 cost = 500, but safetyBuffer * 1.45 = 580
    const result = canUpgradeCell(1, bot, 400, 0, 500, BotPersonality.Aggressive, BotPosture.Leading);
    expect(result).toBe(false);
  });

  it('TC-BAE-EVAL.15 [UC-BAE-EVAL/MSS] findEligibleUpgradeCell picks cell with highest ambush score among buildable groups', () => {
    const room = createRoom('room-bae-15');
    const bot = createPlayer('bot-bae-15');
    const rival = createPlayer('rival-15');
    bot.balance = 30000;
    rival.position = 36; // Step to cell 3 is 7 (highest 2D6 prob 0.1666), step to cell 1 is 5 (0.1111)
    room.players = [bot, rival];

    const registry: PropertyRegistry = new Map();
    registry.set(1, bot.id);
    registry.set(3, bot.id); // Brown monopoly
    const stateMap: PropertyStateMap = new Map();
    stateMap.set(1, { level: 0 });
    stateMap.set(3, { level: 0 });

    const upgradeCell = findEligibleUpgradeCell(bot, room, registry, stateMap, BotPersonality.Balanced);
    expect(upgradeCell).toBe(3);

    const nullCell = findEligibleUpgradeCell(rival, room, registry, stateMap, BotPersonality.Balanced);
    expect(nullCell).toBeNull();
  });

  it('TC-BAE-EVAL.16 [UC-BAE-EVAL/MSS] decideBotIntent preserves identical behavioral contracts with bot_action_evaluator integrated', () => {
    const room = createRoom('room-bae-16');
    const bot = createPlayer('bot-bae-16');
    bot.balance = 25000;
    bot.position = 1;
    room.players = [bot];
    room.phase = TurnPhase.ActionPhase;

    const registry: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();

    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Aggressive,
      balanceThresholdMultiplier: 1.0,
    });
    expect(intent).not.toBeNull();
    expect(intent?.type).toBe('INTENT_BUY');
  });
});
