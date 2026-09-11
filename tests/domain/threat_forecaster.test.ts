// [UC-BOT-01/MSS][UC-BOT-01/A1][UC-BOT-01/A2][UC-BOT-01/A3] Threat Forecaster Tests
import { describe, it, expect, beforeEach } from 'vitest';
import { createPlayer, createRoom, type Player, type Room } from '../../src/domain/room';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data';
import {
  BotPersonality,
  DICE_2D6_COMBINATIONS,
  DICE_2D6_PROBABILITIES,
  DICE_2D6_STEPS,
  DEFAULT_MIN_SAFETY_BUFFER,
  DEFAULT_PERSONALITY_WEIGHTS,
} from '../../src/domain/bot/bot_types';
import { calculateThreatHorizon } from '../../src/domain/bot/threat_forecaster';
import { MarketCardId } from '../../src/domain/event_card_engine';

describe('Threat Forecaster 2D6 & Safety Buffer', () => {
  let room: Room;
  let bot: Player;
  let opponent: Player;
  let registry: PropertyRegistry;
  let stateMap: PropertyStateMap;

  beforeEach(() => {
    room = createRoom('host-1');
    bot = createPlayer('bot-ai');
    bot.isBot = true;
    bot.position = 0;

    opponent = createPlayer('player-opp');
    opponent.position = 0;

    room.players = [bot, opponent];
    registry = new Map();
    stateMap = new Map();
  });

  // ============================================================
  // [UC-BOT-01/MSS] Kiem thu phan phoi xac suat 2d6 chuan xac 100%
  // ============================================================
  describe('[UC-BOT-01/MSS] 2D6 Probability Distribution Exactness', () => {
    it('tong so to hop 2d6 phai dung bang 36', () => {
      const totalCombinations = Object.values(DICE_2D6_COMBINATIONS).reduce((acc, c) => acc + c, 0);
      expect(totalCombinations, 'Tong so to hop 2d6 phai la 36').toBe(36);
    });

    it('tong xac suat tat ca cac buoc 2..12 phai bang 1.0 (100%)', () => {
      const sumProbabilities = Object.values(DICE_2D6_PROBABILITIES).reduce((acc, p) => acc + p, 0);
      expect(sumProbabilities, 'Tong xac suat phai xap xi 1.0').toBeCloseTo(1.0, 5);
      expect(Number(sumProbabilities.toFixed(6)), 'Tong xac suat lam tron 6 chu so phai dung 1.0').toBe(1.0);
    });

    it('xac suat tung buoc phai trung khop chinh xac theo bang ly thuyet', () => {
      expect(DICE_2D6_PROBABILITIES[2]).toBeCloseTo(1 / 36, 5);
      expect(DICE_2D6_PROBABILITIES[3]).toBeCloseTo(2 / 36, 5);
      expect(DICE_2D6_PROBABILITIES[4]).toBeCloseTo(3 / 36, 5);
      expect(DICE_2D6_PROBABILITIES[5]).toBeCloseTo(4 / 36, 5);
      expect(DICE_2D6_PROBABILITIES[6]).toBeCloseTo(5 / 36, 5);
      expect(DICE_2D6_PROBABILITIES[7]).toBeCloseTo(6 / 36, 5);
      expect(DICE_2D6_PROBABILITIES[8]).toBeCloseTo(5 / 36, 5);
      expect(DICE_2D6_PROBABILITIES[9]).toBeCloseTo(4 / 36, 5);
      expect(DICE_2D6_PROBABILITIES[10]).toBeCloseTo(3 / 36, 5);
      expect(DICE_2D6_PROBABILITIES[11]).toBeCloseTo(2 / 36, 5);
      expect(DICE_2D6_PROBABILITIES[12]).toBeCloseTo(1 / 36, 5);
    });

    it('tinh doi xung cua phan phoi 2d6 quanh truc 7', () => {
      expect(DICE_2D6_PROBABILITIES[2]).toBe(DICE_2D6_PROBABILITIES[12]);
      expect(DICE_2D6_PROBABILITIES[3]).toBe(DICE_2D6_PROBABILITIES[11]);
      expect(DICE_2D6_PROBABILITIES[4]).toBe(DICE_2D6_PROBABILITIES[10]);
      expect(DICE_2D6_PROBABILITIES[5]).toBe(DICE_2D6_PROBABILITIES[9]);
      expect(DICE_2D6_PROBABILITIES[6]).toBe(DICE_2D6_PROBABILITIES[8]);
      expect(DICE_2D6_PROBABILITIES[7]).toBeGreaterThan(DICE_2D6_PROBABILITIES[6]!);
    });

    it('[Adversarial] Buoc 1 hoac buoc 13 khong the xuat hien tren 2d6', () => {
      expect(DICE_2D6_PROBABILITIES[1]).toBeUndefined();
      expect(DICE_2D6_PROBABILITIES[13]).toBeUndefined();
      expect(DICE_2D6_STEPS.includes(1 as unknown as typeof DICE_2D6_STEPS[number])).toBe(false);
      expect(DICE_2D6_STEPS.includes(13 as unknown as typeof DICE_2D6_STEPS[number])).toBe(false);
    });
  });

  // ============================================================
  // [UC-BOT-01/A1] Phia truoc an toan -> safetyBuffer giu o san toi thieu
  // ============================================================
  describe('[UC-BOT-01/A1] Safe Horizon Baseline', () => {
    it('phia truoc toan dat trong (chua co chu) -> safetyBuffer dat muc san toi thieu 300 Tr.', () => {
      bot.position = 0;
      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);

      expect(horizon.expectedLoss, 'Expected loss tren dat trong phai bang 0').toBe(0);
      expect(horizon.maxSingleDanger, 'Khong co moi nguy hiem nao').toBe(0);
      expect(horizon.dangerTilesCount, 'So o nguy hiem phai bang 0').toBe(0);
      expect(horizon.safetyBuffer, 'Safety buffer phai o muc toi thieu').toBe(DEFAULT_MIN_SAFETY_BUFFER);
    });

    it('phia truoc toan la dat cua chinh Bot -> safetyBuffer van o muc san 300 Tr.', () => {
      bot.position = 0;
      registry.set(1, bot.id);
      registry.set(3, bot.id);
      registry.set(6, bot.id);
      registry.set(8, bot.id);
      stateMap.set(8, { level: 3 });

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);

      expect(horizon.expectedLoss, 'Dat cua bot khong tinh loss').toBe(0);
      expect(horizon.maxSingleDanger).toBe(0);
      expect(horizon.dangerTilesCount).toBe(0);
      expect(horizon.safetyBuffer).toBe(DEFAULT_MIN_SAFETY_BUFFER);
    });

    it('o phia truoc co chu nhung doi thu da bi pha san -> khong tinh tien thue', () => {
      bot.position = 0;
      registry.set(8, opponent.id);
      stateMap.set(8, { level: 3 });
      opponent.bankrupt = true;

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);

      expect(horizon.expectedLoss, 'Doi thu pha san khong the thu tien thue').toBe(0);
      expect(horizon.dangerTilesCount).toBe(0);
      expect(horizon.safetyBuffer).toBe(DEFAULT_MIN_SAFETY_BUFFER);
    });

    it('o phia truoc dang bi the chap -> tien thue bang 0, safetyBuffer giu o muc san', () => {
      bot.position = 0;
      registry.set(8, opponent.id);
      stateMap.set(8, { level: 0, isMortgaged: true });
      opponent.mortgagedProperties = [8];

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);

      expect(horizon.expectedLoss, 'O the chap tien thue bang 0').toBe(0);
      expect(horizon.dangerTilesCount).toBe(0);
      expect(horizon.safetyBuffer).toBe(DEFAULT_MIN_SAFETY_BUFFER);
    });

    it('hieu ung thi truong mien tien thue (MC_COASTAL_STORM) -> safetyBuffer o muc san', () => {
      bot.position = 2;
      registry.set(9, opponent.id); // Ba Ria Vung Tau (o 9 la ven bien)
      stateMap.set(9, { level: 3 });

      room.activeModifiers = [{
        type: MarketCardId.MC_COASTAL_STORM,
        affectedCells: [9],
        remainingRounds: 2,
        multiplier: 0,
      }];

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap);

      expect(horizon.expectedLoss, 'Bao ven bien mien thue -> expectedLoss phai bang 0').toBe(0);
      expect(horizon.safetyBuffer).toBe(DEFAULT_MIN_SAFETY_BUFFER);
    });
  });

  // ============================================================
  // [UC-BOT-01/A2] Phia truoc co khach san C3 cua doi thu cach 7 buoc
  // ============================================================
  describe('[UC-BOT-01/A2] Dangerous Horizon with Opponent C3 Hotel', () => {
    it('co khach san C3 tai o cach 7 buoc -> safetyBuffer tang vot ty le thuan', () => {
      // Bot o vi tri 2, cach 7 buoc la o 9 (Ba Ria - Vung Tau)
      // O 9: rent3 = 3.000 Tr.
      bot.position = 2;
      registry.set(9, opponent.id);
      stateMap.set(9, { level: 3 });

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap, BotPersonality.Balanced);

      // Xac suat buoc 7 la 6/36 = 1/6.
      // Expected Loss = 3.000 * (6/36) = 500 Tr.
      expect(horizon.expectedLoss, 'Expected loss cua o 9 cap 3 phai bang 500 Tr.').toBe(500);
      expect(horizon.maxSingleDanger, 'Max single danger phai la 3.000 Tr.').toBe(3000);
      expect(horizon.dangerTilesCount, 'So o nguy hiem phai la 1').toBe(1);
      // Balanced: riskMultiplier = 1.0 -> safetyBuffer = max(300, 500 * 1.0) = 500 Tr.
      expect(horizon.safetyBuffer, 'Safety buffer phai tang len 500 Tr.').toBe(500);
    });

    it('co khach san C3 co tien thue cuc cao (o 24 Da Nang rent=6.000 Tr.) -> safetyBuffer tang len 1.000 Tr.', () => {
      // Bot o vi tri 17, cach 7 buoc la o 24 (Da Nang)
      // O 24: rent3 = 6.000 Tr.
      bot.position = 17;
      registry.set(24, opponent.id);
      stateMap.set(24, { level: 3 });

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap, BotPersonality.Balanced);

      // P(7) = 6/36 = 1/6. Expected loss = 6000 * (1/6) = 1000.
      expect(horizon.expectedLoss).toBe(1000);
      expect(horizon.maxSingleDanger).toBe(6000);
      expect(horizon.safetyBuffer).toBe(1000);
    });

    it('nhieu o nguy hiem trong tam quet 2d6 -> expectedLoss tich luy tat ca cac o', () => {
      // Bot o vi tri 1
      // Buoc 5: o 6 (Binh Duong, C1: rent1 = 400). P = 4/36.
      // Buoc 7: o 8 (Dong Nai, C2: rent2 = 1000). P = 6/36.
      // Buoc 8: o 9 (Vung Tau, C3: rent3 = 3000). P = 5/36.
      bot.position = 1;
      registry.set(6, opponent.id);
      stateMap.set(6, { level: 1 });
      registry.set(8, opponent.id);
      stateMap.set(8, { level: 2 });
      registry.set(9, opponent.id);
      stateMap.set(9, { level: 3 });

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap, BotPersonality.Balanced);

      const expectedCalc = (4 / 36) * 400 + (6 / 36) * 1000 + (5 / 36) * 3000;
      expect(horizon.expectedLoss).toBeCloseTo(expectedCalc, 2);
      expect(horizon.dangerTilesCount).toBe(3);
      expect(horizon.maxSingleDanger).toBe(3000);
      expect(horizon.safetyBuffer).toBe(Math.max(DEFAULT_MIN_SAFETY_BUFFER, Math.round(expectedCalc * 1.0)));
    });

    it('quet vuot qua vach xuat phat (wrap-around 40 o) chinh xac', () => {
      // Bot o vi tri 35
      // Buoc 4: 39 (Tim, C0: rent0 = 400)
      // Buoc 6: (35 + 6) % 40 = 1 (Can Tho, C1: rent1 = 210)
      bot.position = 35;
      registry.set(39, opponent.id);
      stateMap.set(39, { level: 0 });
      registry.set(1, opponent.id);
      stateMap.set(1, { level: 1 });

      const horizon = calculateThreatHorizon(bot, room, registry, stateMap, BotPersonality.Balanced);

      const expectedCalc = (3 / 36) * 400 + (5 / 36) * 210;
      expect(horizon.expectedLoss).toBeCloseTo(expectedCalc, 2);
      expect(horizon.dangerTilesCount).toBe(2);
      expect(horizon.maxSingleDanger).toBe(400);
    });
  });

  // ============================================================
  // [UC-BOT-01/A3] Tinh cach Bot: Aggressive chap nhan rui ro, Passive can trong
  // ============================================================
  describe('[UC-BOT-01/A3] Personality Risk Tolerance Comparison', () => {
    it('cung 1 moi nguy: Aggressive co dem nho nhat, Passive co dem lon nhat', () => {
      // Bot o 17, o 24 co C3 rent = 6.000 Tr. (cach 7 buoc). Expected loss = 1.000 Tr.
      bot.position = 17;
      registry.set(24, opponent.id);
      stateMap.set(24, { level: 3 });

      const horizonAgg = calculateThreatHorizon(bot, room, registry, stateMap, BotPersonality.Aggressive);
      const horizonBal = calculateThreatHorizon(bot, room, registry, stateMap, BotPersonality.Balanced);
      const horizonPas = calculateThreatHorizon(bot, room, registry, stateMap, BotPersonality.Passive);

      // Expected Loss la rui ro khach quan, phai giong nhau 100%
      expect(horizonAgg.expectedLoss).toBe(1000);
      expect(horizonBal.expectedLoss).toBe(1000);
      expect(horizonPas.expectedLoss).toBe(1000);

      // Aggressive: 1000 * 0.6 = 600 Tr.
      // Balanced:   1000 * 1.0 = 1000 Tr.
      // Passive:    1000 * 1.5 = 1500 Tr.
      expect(horizonAgg.safetyBuffer).toBe(600);
      expect(horizonBal.safetyBuffer).toBe(1000);
      expect(horizonPas.safetyBuffer).toBe(1500);

      // So sanh thu tu: Aggressive < Balanced < Passive
      expect(horizonAgg.safetyBuffer).toBeLessThan(horizonBal.safetyBuffer);
      expect(horizonBal.safetyBuffer).toBeLessThan(horizonPas.safetyBuffer);

      // Multipliers kiem tra theo SSOT weights
      expect(DEFAULT_PERSONALITY_WEIGHTS[BotPersonality.Aggressive].riskMultiplier).toBe(0.6);
      expect(DEFAULT_PERSONALITY_WEIGHTS[BotPersonality.Balanced].riskMultiplier).toBe(1.0);
      expect(DEFAULT_PERSONALITY_WEIGHTS[BotPersonality.Passive].riskMultiplier).toBe(1.5);
    });

    it('khi personality khong duoc truyen vao, mac dinh su dung Balanced (1.0)', () => {
      bot.position = 17;
      registry.set(24, opponent.id);
      stateMap.set(24, { level: 3 });

      const horizonDefault = calculateThreatHorizon(bot, room, registry, stateMap);
      const horizonBalanced = calculateThreatHorizon(bot, room, registry, stateMap, BotPersonality.Balanced);

      expect(horizonDefault.safetyBuffer).toBe(horizonBalanced.safetyBuffer);
      expect(horizonDefault.safetyBuffer).toBe(1000);
    });
  });
});
