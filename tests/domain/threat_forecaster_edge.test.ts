// [UC-BOT-01/A4][UC-BOT-01/A5][UC-BOT-01/A6][UC-BOT-01/A7] Threat Forecaster Edge & Robustness Tests
import { describe, it, expect, beforeEach } from 'vitest';
import { createPlayer, createRoom, type Player, type Room } from '../../src/domain/room';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data';
import {
  BotPersonality,
  DEFAULT_MIN_SAFETY_BUFFER,
  DEFAULT_PERSONALITY_WEIGHTS,
  DICE_2D6_COMBINATIONS,
  DICE_2D6_PROBABILITIES,
  DICE_2D6_STEPS,
  SolvencyActionType,
} from '../../src/domain/bot/bot_types';
import { calculateThreatHorizon } from '../../src/domain/bot/threat_forecaster';
import { MarketCardId } from '../../src/domain/event_card_engine';

describe('Threat Forecaster Edge Cases & Robustness', () => {
  let room: Room;
  let bot: Player;
  let opponent: Player;
  let registry: PropertyRegistry;
  let stateMap: PropertyStateMap;

  beforeEach(() => {
    room = createRoom('host-edge');
    bot = createPlayer('bot-ai');
    bot.isBot = true;
    bot.position = 0;

    opponent = createPlayer('player-opp');
    opponent.position = 0;

    room.players = [bot, opponent];
    registry = new Map();
    stateMap = new Map();
  });

  // [UC-BOT-01/A4] Railroad and Utility dynamic fee threats
  describe('[UC-BOT-01/A4] Railroad and Utility Threat Calculations', () => {
    it('o ha tang duong sat (o 5 Long Thanh) tinh tien thue dung theo bieu phi', () => {
      bot.position = 0; // buoc 5 toi o 5 (Cang HKQT Long Thanh)
      registry.set(5, opponent.id);

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);
      // Doi thu so huu 1 duong sat: phi = 500 Tr.
      // Buoc 5 co xac suat 4/36 = 1/9. Expected loss = 500 * (4/36)
      expect(horizon.maxSingleDanger).toBe(500);
      expect(horizon.dangerTilesCount).toBe(1);
      expect(horizon.expectedLoss).toBeCloseTo(500 * (4 / 36), 3);
    });

    it('doi thu so huu nhieu duong sat co ETC (1.5x fee) -> expectedLoss tang tuong ung', () => {
      bot.position = 0; // buoc 5 toi o 5
      registry.set(5, opponent.id);
      registry.set(15, opponent.id);
      stateMap.set(5, { level: 0, isETC: true });

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);
      // 2 duong sat: base = 1000, co ETC: 1000 * 1.5 = 1500 Tr.
      expect(horizon.maxSingleDanger).toBe(1500);
      expect(horizon.expectedLoss).toBeCloseTo(1500 * (4 / 36), 3);
    });

    it('o cong ich (Utility o 12 EVN) tinh tien thue bien thien theo so buoc 2d6', () => {
      bot.position = 8; // buoc 4 toi o 12 (EVN)
      registry.set(12, opponent.id);

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);
      // Doi thu co 1 utility, buoc 4: phi thue = 4 * 40 = 160 Tr.
      // P(4) = 3/36. Expected loss = 160 * (3/36)
      expect(horizon.maxSingleDanger).toBe(160);
      expect(horizon.dangerTilesCount).toBe(1);
      expect(horizon.expectedLoss).toBeCloseTo(160 * (3 / 36), 3);
    });

    it('o cong ich nang cap (isUpgradedUtility) nhan he so 150 Tr. * so buoc', () => {
      bot.position = 5; // buoc 7 toi o 12
      registry.set(12, opponent.id);
      stateMap.set(12, { level: 0, isUpgradedUtility: true });

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);
      // Buoc 7: phi thue = 7 * 150 = 1050 Tr. P(7) = 6/36.
      expect(horizon.maxSingleDanger).toBe(1050);
      expect(horizon.expectedLoss).toBeCloseTo(1050 * (6 / 36), 3);
    });
  });

  // [UC-BOT-01/A5] Monopoly unbuilt doubling & Permanent Rent Bonus
  describe('[UC-BOT-01/A5] Monopoly Doubling and Permanent Rent Bonus', () => {
    it('nhom mau tron bo o cap 0 nhan doi tien thue co ban (hasMonopoly: rent0 * 2)', () => {
      // Nhom Nau: o 1 va o 3. Bot o vi tri 39 (cach o 1 la 2 buoc, cach o 3 la 4 buoc)
      bot.position = 39;
      registry.set(1, opponent.id);
      registry.set(3, opponent.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(3, { level: 0 });

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);
      // O 1: rent0 = 60, monopoly -> 120. P(2) = 1/36.
      // O 3: rent0 = 60, monopoly -> 120. P(4) = 3/36.
      const expected = (1 / 36) * 120 + (3 / 36) * 120;
      expect(horizon.expectedLoss).toBeCloseTo(expected, 3);
      expect(horizon.maxSingleDanger).toBe(120);
      expect(horizon.dangerTilesCount).toBe(2);
    });

    it('ap dung thuong thue vinh vien permanentRentBonus (+50% tu CC_LAND_CHANGE)', () => {
      bot.position = 2; // buoc 7 toi o 9 (Ba Ria - Vung Tau, C1: rent1 = 360)
      registry.set(9, opponent.id);
      stateMap.set(9, { level: 1 });
      room.permanentRentBonus[9] = 0.5;

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);
      // 360 * 1.5 = 540 Tr. P(7) = 6/36 = 1/6. Expected loss = 90 Tr.
      expect(horizon.maxSingleDanger).toBe(540);
      expect(horizon.expectedLoss).toBe(90);
    });
  });

  // [UC-BOT-01/A6] Conflicting market modifiers & modular wrap-around
  describe('[UC-BOT-01/A6] Conflicting Modifiers and Boundary Wrapping', () => {
    it('MC_COASTAL_STORM (mien thue) thang the MC_PEAK_TOURISM (x2 thue)', () => {
      bot.position = 2; // buoc 7 toi o 9 (ven bien)
      registry.set(9, opponent.id);
      stateMap.set(9, { level: 3 }); // C3: 3000 Tr.

      room.activeModifiers = [
        { type: MarketCardId.MC_PEAK_TOURISM, affectedCells: [9], remainingRounds: 2, multiplier: 2 },
        { type: MarketCardId.MC_COASTAL_STORM, affectedCells: [9], remainingRounds: 1, multiplier: 0 },
      ];

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);
      expect(horizon.expectedLoss).toBe(0);
      expect(horizon.maxSingleDanger).toBe(0);
      expect(horizon.safetyBuffer).toBe(DEFAULT_MIN_SAFETY_BUFFER);
    });

    it('toa do am (negative position) wrap-around an toan quanh ban co 40 o', () => {
      bot.position = -3; // tuong duong o 37
      // Buoc 2: o 39 (C0: rent0 = 400). P(2) = 1/36.
      registry.set(39, opponent.id);
      stateMap.set(39, { level: 0 });

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);
      expect(horizon.dangerTilesCount).toBe(1);
      expect(horizon.maxSingleDanger).toBe(400);
      expect(horizon.expectedLoss).toBeCloseTo((1 / 36) * 400, 3);
    });

    it('toa do bot NaN duoc quy ve 0 an toan', () => {
      bot.position = NaN;
      registry.set(7, opponent.id); // Chance cell (not property)

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);
      expect(horizon.expectedLoss).toBe(0);
      expect(horizon.safetyBuffer).toBe(DEFAULT_MIN_SAFETY_BUFFER);
    });
  });

  // [UC-BOT-01/A7] Domain invariants & runtime immutability
  describe('[UC-BOT-01/A7] Invariants, Immutability and Bankrupt State', () => {
    it('bot bi pha san (bankrupt) -> tra ve loss = 0 va safetyBuffer san toi thieu', () => {
      bot.bankrupt = true;
      registry.set(7, opponent.id);

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);
      expect(horizon.expectedLoss).toBe(0);
      expect(horizon.maxSingleDanger).toBe(0);
      expect(horizon.safetyBuffer).toBe(DEFAULT_MIN_SAFETY_BUFFER);
    });

    it('cac bang hang so va trong so tinh cach duoc dong bang bat bien (Object.isFrozen)', () => {
      expect(Object.isFrozen(DICE_2D6_PROBABILITIES)).toBe(true);
      expect(Object.isFrozen(DICE_2D6_COMBINATIONS)).toBe(true);
      expect(Object.isFrozen(DICE_2D6_STEPS)).toBe(true);
      expect(Object.isFrozen(DEFAULT_PERSONALITY_WEIGHTS)).toBe(true);
      expect(Object.isFrozen(DEFAULT_PERSONALITY_WEIGHTS[BotPersonality.Passive])).toBe(true);
      expect(Object.isFrozen(DEFAULT_PERSONALITY_WEIGHTS[BotPersonality.Balanced])).toBe(true);
      expect(Object.isFrozen(DEFAULT_PERSONALITY_WEIGHTS[BotPersonality.Aggressive])).toBe(true);
    });

    it('SolvencyActionType enum chua day du cac intent hanh dong cuu no', () => {
      expect(SolvencyActionType.Downgrade).toBe('INTENT_DOWNGRADE');
      expect(SolvencyActionType.Mortgage).toBe('INTENT_MORTGAGE');
      expect(SolvencyActionType.Bankruptcy).toBe('INTENT_BANKRUPTCY');
    });
  });
});
