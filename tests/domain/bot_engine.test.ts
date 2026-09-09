// [TC-06.8a/MSS][TC-06.8b/MSS][TC-06.8c/MSS] Bot AI Engine — 3 Personality Decision Tests
// [UC-GAME-005/MSS][UC-GAME-008/MSS]
// Traceability: GAME-S06 TASK 5 · bot_engine.ts [NEW]
//
// NOTE: src/domain/bot/bot_engine.ts DOES NOT EXIST YET.
// These tests MUST FAIL with: Cannot find module '../../src/domain/bot/bot_engine'
// That is the expected RED phase for TDD.

import { describe, it, expect } from 'vitest';
// Bot engine chua ton tai — test se FAIL do import error (module not found)
import { decideBotIntent, BotPersonality } from '../../src/domain/bot/bot_engine';
import { createPlayer, createRoom, TurnPhase } from '../../src/domain/room';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data';

// ============================================================
// TC-06.8a — Bot THU DONG (PASSIVE)
// Spec: Khong bao gio emit INTENT_BUY hoac INTENT_UPGRADE.
// Luong: WaitingRoll -> INTENT_ROLL | ActionPhase -> INTENT_DECLINE | PropertyManagement -> INTENT_END_TURN
// [UC-GAME-005/MSS][UC-GAME-008/MSS]
// ============================================================
describe('TC-06.8a Bot PASSIVE — chi ROLL -> DECLINE -> END_TURN', () => {
  it('[TC-06.8a-1] PASSIVE khong bao gio tra ve INTENT_BUY du balance du da', () => {
    // Arrange: Bot PASSIVE voi balance 20.000 (du mua bat ky o nao tren ban co)
    const room = createRoom('host-1');
    const bot = createPlayer('bot-passive-1');
    bot.isBot = true;
    bot.balance = 20_000;
    bot.position = 6; // O Xanh Da Troi gia 1.000 Tr.
    room.players = [bot];
    room.phase = TurnPhase.ActionPhase;

    const registry: PropertyRegistry = new Map(); // O 6 chua co chu
    const stateMap: PropertyStateMap = new Map();

    // Act
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.20,
    });

    // Assert — Consumer-side: phai khong phai INTENT_BUY hoac INTENT_UPGRADE
    expect(intent).not.toBeNull();
    expect(intent?.type).not.toBe('INTENT_BUY');
    expect(intent?.type).not.toBe('INTENT_UPGRADE');
  });

  it('[TC-06.8a-2] PASSIVE phase=ActionPhase tra ve INTENT_DECLINE (bo qua mua dat)', () => {
    const room = createRoom('host-2');
    const bot = createPlayer('bot-passive-2');
    bot.isBot = true;
    bot.balance = 15_000;
    bot.position = 6;
    room.phase = TurnPhase.ActionPhase;
    room.players = [bot];

    const registry: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();

    // Act
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.20,
    });

    // Assert — Consumer: Bot PASSIVE phai tu choi mua (INTENT_DECLINE)
    expect(intent?.type).toBe('INTENT_DECLINE');
  });

  it('[TC-06.8a-3] PASSIVE phase=WaitingRoll tra ve INTENT_ROLL (tung xuc xac)', () => {
    const room = createRoom('host-3');
    const bot = createPlayer('bot-passive-3');
    bot.isBot = true;
    bot.balance = 15_000;
    room.phase = TurnPhase.WaitingRoll;
    room.players = [bot];

    // Act
    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.20,
    });

    // Assert — Consumer: Bot PASSIVE phai tung xuc xac khi den luot
    expect(intent?.type).toBe('INTENT_ROLL');
  });

  it('[TC-06.8a-4] PASSIVE phase=PropertyManagement tra ve INTENT_END_TURN (ket thuc luot)', () => {
    const room = createRoom('host-4');
    const bot = createPlayer('bot-passive-4');
    bot.isBot = true;
    bot.balance = 15_000;
    room.phase = TurnPhase.PropertyManagement;
    room.players = [bot];

    // Act
    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.20,
    });

    // Assert — Consumer: Bot PASSIVE phai ket thuc luot ngay (khong nang cap)
    expect(intent?.type).toBe('INTENT_END_TURN');
  });
});

// ============================================================
// TC-06.8b — Bot CAN BANG (BALANCED)
// Spec: Mua neu balance >= price x 1.20 (dem 20% an toan).
// O vi tri 6 (Xanh Da Troi — Dich vu): price = 1.000 Tr.
// Nguong mua: balance >= 1.000 x 1.20 = 1.200 Tr.
// [UC-GAME-005/MSS]
// ============================================================
describe('TC-06.8b Bot BALANCED — mua neu balance >= price * 1.20', () => {
  it('[TC-06.8b-1] balance = 1.200 (dung nguong 120% gia 1.000): tra ve INTENT_BUY', () => {
    // Arrange: O 6 gia 1.000 Tr. -> nguong = 1.000 x 1.20 = 1.200 Tr.
    const room = createRoom('host-5');
    const bot = createPlayer('bot-balanced-1');
    bot.isBot = true;
    bot.balance = 1_200; // Dung nguong 120% gia 1.000
    bot.position = 6;    // O Xanh Da Troi — Dich vu, price = 1.000 Tr.
    room.phase = TurnPhase.ActionPhase;
    room.players = [bot];

    const registry: PropertyRegistry = new Map(); // O 6 chua co chu
    const stateMap: PropertyStateMap = new Map();

    // Act
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.20,
    });

    // Assert — Consumer: balance du nguong -> phai mua (INTENT_BUY)
    expect(intent?.type).toBe('INTENT_BUY');
  });

  it('[TC-06.8b-2] balance = 1.199 (duoi nguong 120% gia 1.000): tra ve INTENT_DECLINE', () => {
    // Arrange: balance 1.199 < 1.000 x 1.20 = 1.200
    const room = createRoom('host-6');
    const bot = createPlayer('bot-balanced-2');
    bot.isBot = true;
    bot.balance = 1_199; // Duoi nguong 1 don vi
    bot.position = 6;    // O gia 1.000 Tr.
    room.phase = TurnPhase.ActionPhase;
    room.players = [bot];

    const registry: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();

    // Act
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.20,
    });

    // Assert — Consumer: balance duoi nguong -> phai tu choi (INTENT_DECLINE)
    expect(intent?.type).toBe('INTENT_DECLINE');
  });

  it('[TC-06.8b-3] [Adversarial] Nguong 1.20 != 1.00: balance=1.000 phai la DECLINE khong phai BUY', () => {
    // Adversarial: Neu nham nguong -> dung 1.00 thi balance=1.000 se BUY (sai spec BALANCED).
    // Test nay xac nhan voi nguong dung 1.20, balance=1.000 < 1.000x1.20=1.200 -> DECLINE.
    // Neu implementer dung threshold=1.00 nham -> test se RED vi BUY != DECLINE.
    const room = createRoom('host-7');
    const bot = createPlayer('bot-balanced-3');
    bot.isBot = true;
    bot.balance = 1_000; // Dung gia 1.000 nhung duoi nguong BALANCED (1.200)
    bot.position = 6;    // O gia 1.000 Tr.
    room.phase = TurnPhase.ActionPhase;
    room.players = [bot];

    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.20,
    });

    // Assert — balance 1.000 < price x 1.20 = 1.200 -> phai la DECLINE (khong phai BUY)
    expect(intent?.type).toBe('INTENT_DECLINE');
  });
});

// ============================================================
// TC-06.8c — Bot QUYET DOAN (AGGRESSIVE)
// Spec: Mua ngay khi balance >= price x 1.00 (khong dem an toan).
// O vi tri 6 (Xanh Da Troi — Dich vu): price = 1.000 Tr.
// Nguong mua: balance >= 1.000 x 1.00 = 1.000 Tr.
// [UC-GAME-008/MSS]
// ============================================================
describe('TC-06.8c Bot AGGRESSIVE — mua ngay, nang cap toi da', () => {
  it('[TC-06.8c-1] AGGRESSIVE phase=ActionPhase balance=1.000 (dung gia): tra ve INTENT_BUY', () => {
    // Arrange: AGGRESSIVE nguong 1.00 -> balance = price la du
    const room = createRoom('host-8');
    const bot = createPlayer('bot-aggressive-1');
    bot.isBot = true;
    bot.balance = 1_000; // Dung gia o 6 (1.000 Tr.) — nguong AGGRESSIVE = 1.00
    bot.position = 6;    // O Xanh Da Troi — Dich vu, price = 1.000 Tr.
    room.phase = TurnPhase.ActionPhase;
    room.players = [bot];

    const registry: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();

    // Act
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Aggressive,
      balanceThresholdMultiplier: 1.00,
    });

    // Assert — Consumer: balance du voi nguong AGGRESSIVE -> phai mua (INTENT_BUY)
    expect(intent?.type).toBe('INTENT_BUY');
  });

  it('[TC-06.8c-2] AGGRESSIVE phase=ActionPhase balance=500 (thieu tien so voi gia 1.000): tra ve INTENT_DECLINE', () => {
    // Arrange: balance 500 < price 1.000 -> ngay AGGRESSIVE cung khong mua duoc
    const room = createRoom('host-9');
    const bot = createPlayer('bot-aggressive-2');
    bot.isBot = true;
    bot.balance = 500;   // Chi 500 Tr. — thieu tien (gia 1.000 Tr.)
    bot.position = 6;    // O gia 1.000 Tr.
    room.phase = TurnPhase.ActionPhase;
    room.players = [bot];

    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Aggressive,
      balanceThresholdMultiplier: 1.00,
    });

    // Assert — Consumer: balance khong du -> DECLINE du AGGRESSIVE
    expect(intent?.type).toBe('INTENT_DECLINE');
  });

  it('[TC-06.8c-3] AGGRESSIVE khac BALANCED: balance=1.000 o 6 -> AGGRESSIVE mua, BALANCED khong mua', () => {
    // Adversarial: xac nhan su khac biet threshold giua BALANCED (1.20) va AGGRESSIVE (1.00)
    // balance=1.000, price=1.000:
    //   BALANCED:   1.000 < 1.000x1.20=1.200 -> DECLINE
    //   AGGRESSIVE: 1.000 >= 1.000x1.00=1.000 -> BUY
    const roomAgg = createRoom('host-10');
    const botAgg = createPlayer('bot-aggressive-3');
    botAgg.isBot = true;
    botAgg.balance = 1_000;
    botAgg.position = 6;
    roomAgg.phase = TurnPhase.ActionPhase;
    roomAgg.players = [botAgg];

    const roomBal = createRoom('host-11');
    const botBal = createPlayer('bot-balanced-4');
    botBal.isBot = true;
    botBal.balance = 1_000;
    botBal.position = 6;
    roomBal.phase = TurnPhase.ActionPhase;
    roomBal.players = [botBal];

    const intentAgg = decideBotIntent(botAgg, roomAgg, new Map(), new Map(), {
      personality: BotPersonality.Aggressive,
      balanceThresholdMultiplier: 1.00,
    });
    const intentBal = decideBotIntent(botBal, roomBal, new Map(), new Map(), {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.20,
    });

    // AGGRESSIVE: balance=1.000 >= price x 1.00=1.000 -> BUY
    expect(intentAgg?.type).toBe('INTENT_BUY');
    // BALANCED: balance=1.000 < price x 1.20=1.200 -> DECLINE
    expect(intentBal?.type).toBe('INTENT_DECLINE');
  });
});
