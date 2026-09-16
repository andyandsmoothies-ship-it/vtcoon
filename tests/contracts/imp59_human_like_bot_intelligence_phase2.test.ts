// [UC-BOT-01..04/MSS][IMP-59/MSS] Contract Tests: Human-like Bot Intelligence (Phase 2)
// Architecture: 4-Facet Behavioral Matrix (Softmax Distribution, Seeded Jitter, Auction Baiting, Safety Invariants)

import { describe, it, expect } from 'vitest';
import { decideBotIntent, BotPersonality } from '../../src/domain/bot/bot_engine';
import {
  calculateSoftmaxProbability,
  calculateBuyProbability,
  resolveSeededJitter,
  sampleDecision,
  getTurnSeed,
  createDeterministicRng,
} from '../../src/domain/bot/bot_softmax';
import { isBaitCorridor, calculateAuctionStep, calculateAuctionMaxBid } from '../../src/domain/bot/bot_auction';
import { evaluateTileValuation, calculateValuePreferenceMultiplier } from '../../src/domain/bot/valuation_engine';
import { SOFTMAX_TEMPERATURE, PERSONALITY_BUY_BIAS, AUCTION_BAIT_PROBABILITY } from '../../src/domain/bot/bot_types';
import { createPlayer, createRoom, TurnPhase, type Player, type CurrentAuctionState } from '../../src/domain/room';
import { getBotConfig } from '../../src/server/room_bot_manager';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data';

function makeTestSetup(opts: { roomId?: string; botId?: string; balance?: number; position?: number; phase?: TurnPhase; opponents?: Player[] }) {
  const room = createRoom(opts.roomId ?? 'test_room');
  const bot = createPlayer(opts.botId ?? 'test_bot');
  bot.isBot = true;
  bot.balance = opts.balance ?? 5_000;
  bot.position = opts.position ?? 0;
  room.players = [bot, ...(opts.opponents ?? [])];
  room.phase = opts.phase ?? TurnPhase.ActionPhase;
  return { room, bot };
}

describe('[IMP-59] Facet 1: Softmax Probability Distribution & Temperature Matrix', () => {
  it('[IMP59-F1-01] Aggressive bot co buyProbability cao hon Balanced va Passive voi cung tile dinh gia tieu chuan', () => {
    const probAgg = calculateBuyProbability(2_000, 2_000, BotPersonality.Aggressive);
    const probBal = calculateBuyProbability(2_000, 2_000, BotPersonality.Balanced);
    const probPas = calculateBuyProbability(2_000, 2_000, BotPersonality.Passive);
    expect(probAgg).toBeGreaterThan(probBal);
    expect(probBal).toBeGreaterThan(probPas);
  });

  it('[IMP59-F1-02] Softmax buyProbability bien thien muot ma theo ty suat gia tri (sigmoidal non-binary)', () => {
    const probLow = calculateBuyProbability(1_000, 2_000, BotPersonality.Balanced);
    const probMid = calculateBuyProbability(2_000, 2_000, BotPersonality.Balanced);
    const probHigh = calculateBuyProbability(3_000, 2_000, BotPersonality.Balanced);
    expect(probLow).toBeLessThan(probMid);
    expect(probMid).toBeLessThan(probHigh);
    expect(probHigh).toBeLessThanOrEqual(1.0);
  });

  it('[IMP59-F1-03] Bot Passive uu tien Ha tang (Railroad / Utility) voi he so gia tri preference cao hon dat thuong', () => {
    const prefInfra = calculateValuePreferenceMultiplier(5, BotPersonality.Passive);
    const prefUtil = calculateValuePreferenceMultiplier(12, BotPersonality.Passive);
    const prefLuxury = calculateValuePreferenceMultiplier(39, BotPersonality.Passive);
    expect(prefInfra).toBeGreaterThan(1.0);
    expect(prefUtil).toBeGreaterThan(1.0);
    expect(prefLuxury).toBeLessThan(1.0);
  });

  it('[IMP59-F1-04] Bot Passive co he so preference dat re (<= 1500 Tr.) vuot troi so voi dat dat do', () => {
    const prefCheap = calculateValuePreferenceMultiplier(1, BotPersonality.Passive);
    const prefExpensive = calculateValuePreferenceMultiplier(37, BotPersonality.Passive);
    expect(prefCheap).toBeGreaterThanOrEqual(1.2);
    expect(prefExpensive).toBeLessThanOrEqual(0.85);
  });

  it('[IMP59-F1-05] Bang nhiet do SOFTMAX_TEMPERATURE va bias dong bo voi kien truc he thong', () => {
    expect(SOFTMAX_TEMPERATURE[BotPersonality.Passive]).toBe(0.8);
    expect(SOFTMAX_TEMPERATURE[BotPersonality.Balanced]).toBe(1.0);
    expect(SOFTMAX_TEMPERATURE[BotPersonality.Aggressive]).toBe(1.4);
    expect(PERSONALITY_BUY_BIAS[BotPersonality.Aggressive]).toBeGreaterThan(PERSONALITY_BUY_BIAS[BotPersonality.Balanced]);
  });

  it('[IMP59-F1-06] Softmax va buyProbability an toan mien nhiem voi gia tri NaN va Infinity', () => {
    expect(calculateSoftmaxProbability(NaN, 1.0)).toBe(0);
    expect(calculateSoftmaxProbability(Infinity, 1.0)).toBe(1.0);
    expect(calculateSoftmaxProbability(-Infinity, 1.0)).toBe(0);
    expect(calculateBuyProbability(NaN, 1_000)).toBe(0);
  });
});

describe('[IMP-59] Facet 2: Seeded Jitter & Reproducibility Matrix', () => {
  it('[IMP59-F2-01] Seeded Jitter tat dinh: cung seed tao ra cung he so jitter trong khoang [-0.12, 0.12]', () => {
    const jitter1 = resolveSeededJitter(12345);
    const jitter2 = resolveSeededJitter(12345);
    expect(jitter1).toBe(jitter2);
    expect(jitter1).toBeGreaterThanOrEqual(-0.12);
    expect(jitter1).toBeLessThanOrEqual(0.12);
  });

  it('[IMP59-F2-02] Cac seed khac nhau sinh ra jitter khac nhau nhung deu nam trong gioi han [-0.12, 0.12]', () => {
    const jA = resolveSeededJitter(11111);
    const jB = resolveSeededJitter(99999);
    expect(jA).not.toBe(jB);
    expect(jA).toBeGreaterThanOrEqual(-0.12);
    expect(jB).toBeLessThanOrEqual(0.12);
  });

  it('[IMP59-F2-03] Dynamic turn seed sinh ra intent tai lap 100% khi cung trang thai phong va bot', () => {
    const { room, bot } = makeTestSetup({ balance: 5_000, position: 5, phase: TurnPhase.ActionPhase });
    const seed1 = getTurnSeed(bot, room);
    const seed2 = getTurnSeed(bot, room);
    expect(seed1).toBe(seed2);
    expect(typeof seed1).toBe('number');
  });

  it('[IMP59-F2-04] Dinh gia kem jitter khong bao gio tra ve estimatedValue am', () => {
    const { room, bot } = makeTestSetup({ balance: 5_000, position: 1 });
    const val = evaluateTileValuation(1, bot, room, new Map(), new Map(), BotPersonality.Balanced, -0.12);
    expect(val.estimatedValue).toBeGreaterThan(0);
    expect(Number.isFinite(val.estimatedValue)).toBe(true);
  });

  it('[IMP59-F2-05] Truyen manualRoll hoac custom rng trong BotConfig quyet dinh ket qua tai bien xac suat', () => {
    const { room, bot } = makeTestSetup({ balance: 5_000, position: 6, phase: TurnPhase.ActionPhase });
    const intentBuy = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Balanced, balanceThresholdMultiplier: 1.2, manualRoll: 0.01,
    });
    const intentDecline = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Balanced, balanceThresholdMultiplier: 1.2, manualRoll: 0.999,
    });
    expect(intentBuy?.type).toBe('INTENT_BUY');
    expect(intentDecline?.type).toBe('INTENT_DECLINE');
  });

  it('[IMP59-F2-06] Seeded random jitter voi custom rng hoan toan tai lap 100%', () => {
    const rng = createDeterministicRng(777);
    const j1 = resolveSeededJitter(rng);
    const rng2 = createDeterministicRng(777);
    const j2 = resolveSeededJitter(rng2);
    expect(j1).toBe(j2);
    expect(j1).toBeGreaterThanOrEqual(-0.12);
    expect(j1).toBeLessThanOrEqual(0.12);
  });
});

describe('[IMP-59] Facet 3: Auction Baiting & Tactical Bluffing (Nghi Binh / Trap Bids)', () => {
  it('[IMP59-F3-01] isBaitCorridor xac dinh dung hanh lang gia nghi binh 70% den 75% gia goc', () => {
    const basePrice = 1_000;
    expect(isBaitCorridor(650, basePrice)).toBe(false);
    expect(isBaitCorridor(700, basePrice)).toBe(false); // Bien duoi <= 70% la san sale thuong
    expect(isBaitCorridor(720, basePrice)).toBe(true);
    expect(isBaitCorridor(750, basePrice)).toBe(true);  // Bien tren dung 75%
    expect(isBaitCorridor(751, basePrice)).toBe(false); // Vuot 75%
  });

  it('[IMP59-F3-02] Bot Passive tham gia nghi binh kích gia trong hanh lang 70%-75% khi co doi thu tranh mua', () => {
    const { room, bot } = makeTestSetup({ balance: 10_000, phase: TurnPhase.AuctionPhase });
    const opp = createPlayer('opp_auc');
    room.players.push(opp);
    const auction: CurrentAuctionState = {
      cellIndex: 6, declinedPlayerId: 'p_declined', highestBid: 700, highestBidder: opp.id, bidIncrement: 50,
    };
    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Passive, balanceThresholdMultiplier: 1.5, manualRoll: 0.1,
    }, auction);
    expect(intent?.type).toBe('INTENT_BID');
    expect(intent?.amount).toBe(750);
  });

  it('[IMP59-F3-03] Bot Passive bat ngo bam Pass khi gia dau vuot qua 115% gia goc (khong tiep tuc om hang) [IMP-115]', () => {
    const { room, bot } = makeTestSetup({ balance: 10_000, phase: TurnPhase.AuctionPhase });
    const opp = createPlayer('opp_auc');
    room.players.push(opp);
    const auction: CurrentAuctionState = {
      cellIndex: 6, declinedPlayerId: 'p_declined', highestBid: 1200, highestBidder: opp.id, bidIncrement: 50,
    };
    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Passive, balanceThresholdMultiplier: 1.5,
    }, auction);
    expect(intent?.type).toBe('INTENT_AUCTION_PASS');
  });

  it('[IMP59-F3-04] Bot Passive tu choi nghi binh neu so du khong bao toan safetyBuffer', () => {
    const { room, bot } = makeTestSetup({ balance: 800, phase: TurnPhase.AuctionPhase });
    const opp = createPlayer('opp_auc');
    room.players.push(opp);
    const auction: CurrentAuctionState = {
      cellIndex: 6, declinedPlayerId: 'p_declined', highestBid: 700, highestBidder: opp.id, bidIncrement: 50,
    };
    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Passive, balanceThresholdMultiplier: 1.5, manualRoll: 0.1,
    }, auction);
    expect(intent?.type).toBe('INTENT_AUCTION_PASS');
  });

  it('[IMP59-F3-05] Bot Aggressive nang gia quyet liet (+100 Tr.) khi so du doi dao', () => {
    const auction: CurrentAuctionState = {
      cellIndex: 6, declinedPlayerId: 'p_declined', highestBid: 500, highestBidder: 'opp_1', bidIncrement: 50,
    };
    const step = calculateAuctionStep(auction, BotPersonality.Aggressive, 12_000);
    expect(step).toBe(100);
  });

  it('[IMP59-F3-06] Bot Balanced gioi han tran gia dau khong vuot qua 120% dinh gia chien luoc', () => {
    const { room, bot } = makeTestSetup({ balance: 10_000, phase: TurnPhase.AuctionPhase });
    const maxBid = calculateAuctionMaxBid(bot, room, BotPersonality.Balanced, 1_000, 300);
    expect(maxBid).toBeLessThanOrEqual(1_200);
    expect(AUCTION_BAIT_PROBABILITY).toBe(0.6);
  });

  it('[IMP59-F3-07] calculateAuctionMaxBid dong bo roundCount va khong loi khi room khong co san round', () => {
    const roomWithCount = createRoom('test_rc');
    delete (roomWithCount as { round?: number }).round;
    roomWithCount.roundCount = 15;
    const botP = createPlayer('bot_rc');
    botP.balance = 10_000;
    const maxBid = calculateAuctionMaxBid(botP, roomWithCount, BotPersonality.Passive, 1_000, 300);
    expect(maxBid).toBeLessThanOrEqual(1_000);
    expect(maxBid).toBeGreaterThan(0);
  });
});

describe('[IMP-59] Facet 4: Safety Invariants & Non-Regression', () => {
  it('[IMP59-F4-01] Khong du tien (balance < basePrice) luon phat sinh INTENT_DECLINE bat ke Softmax', () => {
    const { room, bot } = makeTestSetup({ balance: 500, position: 6, phase: TurnPhase.ActionPhase });
    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Aggressive, balanceThresholdMultiplier: 1.0, manualRoll: 0.001,
    });
    expect(intent?.type).toBe('INTENT_DECLINE');
  });

  it('[IMP59-F4-02] Nguy co vo no phia truoc (dangerTilesCount > 0, thieu safetyBuffer) ep buoc DECLINE', () => {
    const opp = createPlayer('opp_hazard');
    const { room, bot } = makeTestSetup({
      balance: 1_200, position: 6, phase: TurnPhase.ActionPhase, opponents: [opp],
    });
    const registry: PropertyRegistry = new Map([[8, opp.id]]);
    const stateMap: PropertyStateMap = new Map([[8, { level: 3 }]]);
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Balanced, balanceThresholdMultiplier: 1.2, manualRoll: 0.001,
    });
    expect(intent?.type).toBe('INTENT_DECLINE');
  });

  it('[IMP59-F4-03] Bot Passive van mua thanh cong o dat giup tao doc quyen bat ke ty suat gia', () => {
    const { room, bot } = makeTestSetup({ balance: 15_000, position: 3, phase: TurnPhase.ActionPhase });
    const registry: PropertyRegistry = new Map([[1, bot.id]]);
    const intent = decideBotIntent(bot, room, registry, new Map(), {
      personality: BotPersonality.Passive, balanceThresholdMultiplier: 1.5,
    });
    expect(intent?.type).toBe('INTENT_BUY');
  });

  it('[IMP59-F4-04] Seeded random RNG tao ra chuoi so hop le trong khoang [0, 1)', () => {
    const rng = createDeterministicRng(42);
    const v1 = rng();
    const v2 = rng();
    expect(v1).toBeGreaterThanOrEqual(0);
    expect(v1).toBeLessThan(1);
    expect(v2).toBeGreaterThanOrEqual(0);
    expect(v2).toBeLessThan(1);
    expect(v1).not.toBe(v2);
  });

  it('[IMP59-F4-05] getBotConfig truyen rng kich hoat Softmax decision flow hoan chinh', () => {
    const cfg = getBotConfig(BotPersonality.Aggressive, createDeterministicRng(99));
    expect(cfg.rng).toBeDefined();
    expect(typeof cfg.rng).toBe('function');
  });

  it('[IMP59-F4-06] sampleDecision va resolveSeededJitter xu ly an toan khi gap dau vao bat thuong', () => {
    expect(sampleDecision(NaN, () => 0.1)).toBe(false);
    expect(sampleDecision(-0.5, () => 0.1)).toBe(false);
    const jitter = resolveSeededJitter(() => NaN);
    expect(jitter).toBeGreaterThanOrEqual(-0.12);
    expect(jitter).toBeLessThanOrEqual(0.12);
  });
});
