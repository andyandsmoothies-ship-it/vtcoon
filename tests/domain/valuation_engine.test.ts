// [UC-BOT-02/MSS][UC-BOT-02/A1][UC-BOT-02/A2][UC-BOT-02/A3][UC-BOT-02/A4][UC-BOT-02/A5] Valuation Engine Tests
import { describe, it, expect, beforeEach } from 'vitest';
import { createPlayer, createRoom, type Player, type Room } from '../../src/domain/room';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data';
import { BotPersonality } from '../../src/domain/bot/bot_types';
import {
  evaluateTileValuation,
  getPacingMultiplier,
  calculateMonopolyMultiplier,
  calculateDenialMultiplier,
  calculateLiquidityMultiplier,
  PACING_STAGE_MULTIPLIERS,
  MONOPOLY_MULTIPLIERS,
  DENIAL_MULTIPLIERS,
} from '../../src/domain/bot/valuation_engine';

describe('Valuation Engine — Dynamic Property Valuation', () => {
  let room: Room;
  let bot: Player;
  let opponent: Player;
  let registry: PropertyRegistry;
  let stateMap: PropertyStateMap;

  beforeEach(() => {
    room = createRoom('host-1');
    room.round = 1;
    bot = createPlayer('bot-ai');
    bot.isBot = true;
    bot.balance = 15000;
    bot.position = 0;

    opponent = createPlayer('player-opp');
    opponent.balance = 15000;
    opponent.position = 0;

    room.players = [bot, opponent];
    registry = new Map();
    stateMap = new Map();
  });

  // ============================================================
  // [UC-BOT-02/MSS] Dinh gia co ban o dat nen o vong 1 (Early Expansion x1.4)
  // ============================================================
  describe('[UC-BOT-02/MSS] Base Valuation & Pacing Factor', () => {
    it('o dat Can Tho (o 1, gia 600) o vong 1 phan anh dung he so banh truong x1.4', () => {
      room.round = 1;
      const valuation = evaluateTileValuation(1, bot, room, registry, stateMap, BotPersonality.Balanced, 0);

      expect(valuation.cellIndex).toBe(1);
      expect(valuation.basePrice).toBe(600);
      expect(valuation.pacingFactor).toBe(1.4);
      expect(valuation.monopolyScore).toBe(1.0);
      expect(valuation.denialScore).toBe(1.0);
      expect(valuation.liquidityMultiplier).toBe(1.0);
      expect(valuation.jitterMultiplier).toBe(1.0);
      // 600 * 1.4 * 1.0 * 1.0 * 1.0 = 840
      expect(valuation.estimatedValue).toBe(840);
    });

    it('he so giai doan (pacingFactor) thay doi dung theo 3 chang vong dau', () => {
      expect(getPacingMultiplier(1)).toBe(PACING_STAGE_MULTIPLIERS.EARLY);
      expect(getPacingMultiplier(8)).toBe(PACING_STAGE_MULTIPLIERS.EARLY);
      expect(getPacingMultiplier(9)).toBe(PACING_STAGE_MULTIPLIERS.MID);
      expect(getPacingMultiplier(20)).toBe(PACING_STAGE_MULTIPLIERS.MID);
      expect(getPacingMultiplier(21)).toBe(PACING_STAGE_MULTIPLIERS.LATE);
      expect(getPacingMultiplier(30)).toBe(PACING_STAGE_MULTIPLIERS.LATE);
      expect(getPacingMultiplier(undefined)).toBe(PACING_STAGE_MULTIPLIERS.EARLY);
    });

    it('cung o dat o vong 15 (Mid x1.1) va vong 25 (Late x0.7) co gia tri giam dan', () => {
      room.round = 15;
      const midVal = evaluateTileValuation(1, bot, room, registry, stateMap, BotPersonality.Balanced, 0);
      expect(midVal.pacingFactor).toBe(1.1);
      // 600 * 1.1 = 660
      expect(midVal.estimatedValue).toBe(660);

      room.round = 25;
      const lateVal = evaluateTileValuation(1, bot, room, registry, stateMap, BotPersonality.Balanced, 0);
      expect(lateVal.pacingFactor).toBe(0.7);
      // 600 * 0.7 = 420
      expect(lateVal.estimatedValue).toBe(420);
    });
  });

  // ============================================================
  // [UC-BOT-02/A1] O dat hoan tat tron bo mau (Monopoly Value x2.8 - x3.2)
  // ============================================================
  describe('[UC-BOT-02/A1] Monopoly Value Escalation', () => {
    it('o cuoi cung hoan tat bo mau 2 o (Nau: o 1 va 3) duoc x2.8 (Balanced)', () => {
      registry.set(1, bot.id);
      room.round = 1;

      const val = evaluateTileValuation(3, bot, room, registry, stateMap, BotPersonality.Balanced, 0);
      expect(val.monopolyScore).toBe(MONOPOLY_MULTIPLIERS.COMPLETE_STANDARD);
      // 600 * 1.4 * 2.8 = 2352
      expect(val.estimatedValue).toBe(2352);
    });

    it('Bot Aggressive dinh gia o hoan tat bo mau len x3.2', () => {
      registry.set(1, bot.id);
      room.round = 1;

      const val = evaluateTileValuation(3, bot, room, registry, stateMap, BotPersonality.Aggressive, 0);
      expect(val.monopolyScore).toBe(MONOPOLY_MULTIPLIERS.COMPLETE_AGGRESSIVE);
      // 600 * 1.4 * 3.2 = 2688
      expect(val.estimatedValue).toBe(2688);
    });

    it('o thu 2 trong nhom 3 o (Hong: 11, 13, 14) duoc he so x1.6', () => {
      registry.set(11, bot.id);
      const mult = calculateMonopolyMultiplier(13, bot.id, registry, BotPersonality.Balanced);
      expect(mult).toBe(MONOPOLY_MULTIPLIERS.TWO_OF_THREE);

      const val = evaluateTileValuation(13, bot, room, registry, stateMap, BotPersonality.Balanced, 0);
      expect(val.monopolyScore).toBe(1.6);
      // basePrice cua o 13 la 1400. 1400 * 1.4 * 1.6 = 3136
      expect(val.estimatedValue).toBe(3136);
    });

    it('khi bot so huu ca 2 o truoc (11 va 13), o 14 tro thanh o hoan tat bo mau x2.8', () => {
      registry.set(11, bot.id);
      registry.set(13, bot.id);
      const mult = calculateMonopolyMultiplier(14, bot.id, registry, BotPersonality.Balanced);
      expect(mult).toBe(MONOPOLY_MULTIPLIERS.COMPLETE_STANDARD);
    });
  });

  // ============================================================
  // [UC-BOT-02/A2] O dat chan doi thu doc quyen (Denial / Hate-Drafting)
  // ============================================================
  describe('[UC-BOT-02/A2] Opponent Denial / Hate-Drafting Value', () => {
    it('doi thu chi thieu 1 o de doc quyen Nau -> Aggressive dinh gia chan x2.2 (>2.0)', () => {
      registry.set(1, opponent.id); // Opponent giu 1/2 o Nau
      const mult = calculateDenialMultiplier(3, bot.id, room, registry, BotPersonality.Aggressive);
      expect(mult).toBe(DENIAL_MULTIPLIERS[BotPersonality.Aggressive]);
      expect(mult).toBeGreaterThan(2.0);

      const val = evaluateTileValuation(3, bot, room, registry, stateMap, BotPersonality.Aggressive, 0);
      expect(val.denialScore).toBe(2.2);
      expect(val.strategicMultiplier).toBe(2.2);
      // 600 * 1.4 * 2.2 = 1848
      expect(val.estimatedValue).toBe(1848);
    });

    it('he so chan doi thu phan biet ro ret theo 3 tinh cach: Aggressive (2.2) > Balanced (1.7) > Passive (1.3)', () => {
      registry.set(1, opponent.id);

      const multAgg = calculateDenialMultiplier(3, bot.id, room, registry, BotPersonality.Aggressive);
      const multBal = calculateDenialMultiplier(3, bot.id, room, registry, BotPersonality.Balanced);
      const multPas = calculateDenialMultiplier(3, bot.id, room, registry, BotPersonality.Passive);

      expect(multAgg).toBe(2.2);
      expect(multBal).toBe(1.7);
      expect(multPas).toBe(1.3);
      expect(multAgg).toBeGreaterThan(multBal);
      expect(multBal).toBeGreaterThan(multPas);
    });

    it('doi thu da bi pha san thi khong kich hoat diem danh chan (denialMultiplier = 1.0)', () => {
      registry.set(1, opponent.id);
      opponent.bankrupt = true;

      const mult = calculateDenialMultiplier(3, bot.id, room, registry, BotPersonality.Aggressive);
      expect(mult).toBe(1.0);

      const val = evaluateTileValuation(3, bot, room, registry, stateMap, BotPersonality.Aggressive, 0);
      expect(val.denialScore).toBe(1.0);
    });
  });

  // ============================================================
  // [UC-BOT-02/A3] Diem phat thanh khoan (Liquidity Penalty)
  // ============================================================
  describe('[UC-BOT-02/A3] Liquidity Penalty on Tight Cash', () => {
    it('khi mua lam so du sut giam duoi safetyBuffer, liquidityMultiplier keo tut dinh gia', () => {
      // Bot o vi tri 2, cach 7 buoc la o 9 co C3 (rent = 3000) -> safetyBuffer = 500
      bot.position = 2;
      registry.set(9, opponent.id);
      stateMap.set(9, { level: 3 });

      // Bot mua o 6 (Binh Duong, gia 1000). Bot co 1200 -> con lai 200 (< 500)
      bot.balance = 1200;
      const val = evaluateTileValuation(6, bot, room, registry, stateMap, BotPersonality.Balanced, 0);

      // ratio = 200 / 500 = 0.4
      expect(val.liquidityMultiplier).toBe(0.4);
      // 1000 * 1.4 * 1.0 * 0.4 * 1.0 = 560
      expect(val.estimatedValue).toBe(560);
      // So sanh neu du tien: 1000 * 1.4 = 1400
      expect(val.estimatedValue).toBeLessThan(1400 * 0.5);
    });

    it('khi so du sau mua bi am hoac rat thap, liquidityMultiplier bi chan o muc san 0.25', () => {
      expect(calculateLiquidityMultiplier(-500, 500)).toBe(0.25);
      expect(calculateLiquidityMultiplier(50, 500)).toBe(0.25);
      expect(calculateLiquidityMultiplier(500, 500)).toBe(1.0);
      expect(calculateLiquidityMultiplier(1000, 500)).toBe(1.0);
    });
  });

  // ============================================================
  // [UC-BOT-02/A4] Kiem tra phuong sai ngau hung (Jitter ±12%)
  // ============================================================
  describe('[UC-BOT-02/A4] Stochastic & Manual Jitter Variation', () => {
    it('manualJitter bien thien dung ty le sai so', () => {
      const valNeg = evaluateTileValuation(1, bot, room, registry, stateMap, BotPersonality.Balanced, -0.12);
      const valZero = evaluateTileValuation(1, bot, room, registry, stateMap, BotPersonality.Balanced, 0);
      const valPos = evaluateTileValuation(1, bot, room, registry, stateMap, BotPersonality.Balanced, 0.12);

      expect(valNeg.jitterMultiplier).toBe(0.88);
      expect(valZero.jitterMultiplier).toBe(1.0);
      expect(valPos.jitterMultiplier).toBe(1.12);

      // 600 * 1.4 * 0.88 = 739.2 -> 739
      expect(valNeg.estimatedValue).toBe(739);
      expect(valZero.estimatedValue).toBe(840);
      // 600 * 1.4 * 1.12 = 940.8 -> 941
      expect(valPos.estimatedValue).toBe(941);
    });

    it('khi khong truyen manualJitter, gia tri dinh gia ngau nhien bien thien trong bien do ±12%', () => {
      const results: number[] = [];
      for (let i = 0; i < 20; i++) {
        const val = evaluateTileValuation(1, bot, room, registry, stateMap, BotPersonality.Balanced);
        results.push(val.estimatedValue);
        // Base = 840. Min = round(840 * 0.88) = 739, Max = round(840 * 1.12) = 941
        expect(val.estimatedValue).toBeGreaterThanOrEqual(739);
        expect(val.estimatedValue).toBeLessThanOrEqual(941);
      }
      // Dam bao khong bi co dinh rap khuon (co it nhat 2 gia tri khac nhau)
      const uniqueValues = new Set(results);
      expect(uniqueValues.size).toBeGreaterThan(1);
    });
  });

  // ============================================================
  // [UC-BOT-02/A5] O khong phai bat dong san tra ve 0
  // ============================================================
  describe('[UC-BOT-02/A5] Non-Purchasable Special Tiles', () => {
    it('o Khoi Hanh (GO, o 0) tra ve estimatedValue = 0', () => {
      const val = evaluateTileValuation(0, bot, room, registry, stateMap);
      expect(val.estimatedValue).toBe(0);
      expect(val.basePrice).toBe(0);
    });

    it('cac o dac biet (Phieu Thi Truong 2, Co Hoi 7, Tram Kiem Toan 10, Nghi Duong 20) tra ve 0', () => {
      for (const cellIndex of [2, 4, 7, 10, 17, 20, 22, 30, 33, 36, 38]) {
        const val = evaluateTileValuation(cellIndex, bot, room, registry, stateMap);
        expect(val.estimatedValue, `O ${cellIndex} khong phai BĐS phai co gia 0`).toBe(0);
        expect(val.basePrice).toBe(0);
      }
    });

    it('[Adversarial] Chi so o nam ngoai ban co (-1, 40, 999) an toan tra ve 0', () => {
      expect(evaluateTileValuation(-1, bot, room, registry, stateMap).estimatedValue).toBe(0);
      expect(evaluateTileValuation(40, bot, room, registry, stateMap).estimatedValue).toBe(0);
      expect(evaluateTileValuation(999, bot, room, registry, stateMap).estimatedValue).toBe(0);
    });

    it('o Ha Tang Giao Thong (Cang Long Thanh 5) va Tien Ich (Dien Luc EVN 12) dinh gia dung gia co ban', () => {
      // Cang Long Thanh (o 5, gia 2000) o vong 1: 2000 * 1.4 = 2800
      const railVal = evaluateTileValuation(5, bot, room, registry, stateMap, BotPersonality.Balanced, 0);
      expect(railVal.basePrice).toBe(2000);
      expect(railVal.estimatedValue).toBe(2800);

      // Dien Luc EVN (o 12, gia 1500) o vong 1: 1500 * 1.4 = 2100
      const utilVal = evaluateTileValuation(12, bot, room, registry, stateMap, BotPersonality.Balanced, 0);
      expect(utilVal.basePrice).toBe(1500);
      expect(utilVal.estimatedValue).toBe(2100);
    });

    it('[Adversarial] Phong ve du lieu NaN va undefined khong lam he thong bi crash hoac tra ve NaN', () => {
      expect(calculateLiquidityMultiplier(NaN, 500)).toBe(0.25);
      bot.balance = NaN;
      const valNaN = evaluateTileValuation(1, bot, room, registry, stateMap, BotPersonality.Balanced, 0);
      expect(Number.isFinite(valNaN.estimatedValue)).toBe(true);
      expect(valNaN.estimatedValue).toBeGreaterThan(0);

      // Registry undefined khong throw ma tra ve multiplier mac dinh
      expect(calculateMonopolyMultiplier(1, bot.id, undefined)).toBe(1.0);
      expect(calculateDenialMultiplier(1, bot.id, room, undefined)).toBe(1.0);
    });
  });
});
