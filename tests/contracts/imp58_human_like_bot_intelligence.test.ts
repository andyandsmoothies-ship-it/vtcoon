// [UC-BOT-01..04/MSS][IMP-58/MSS] Contract Tests: Human-like Bot Intelligence (Phase 1)
// Architecture: 4-Facet Behavioral Matrix (Value Investing, Auto-Redemption, Stage-Aware Bailout, Determinism)
// Station 1: RED Contract Test

import { describe, it, expect } from 'vitest';
import { decideBotIntent, BotPersonality } from '../../src/domain/bot/bot_engine';
import { createPlayer, createRoom, TurnPhase, type Player } from '../../src/domain/room';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data';
import { RoomManager } from '../../src/server/room_manager';

function makeTestSetup(opts: {
  roomId?: string;
  botId?: string;
  balance?: number;
  position?: number;
  phase?: TurnPhase;
  auditTurnsLeft?: number;
  mortgagedProperties?: number[];
  mortgageLoans?: Record<number, number>;
  opponents?: Player[];
}) {
  const room = createRoom(opts.roomId ?? 'test_room');
  const bot = createPlayer(opts.botId ?? 'test_bot');
  bot.isBot = true;
  bot.balance = opts.balance ?? 5_000;
  bot.position = opts.position ?? 0;
  if (opts.auditTurnsLeft !== undefined) bot.auditTurnsLeft = opts.auditTurnsLeft;
  if (opts.mortgagedProperties) bot.mortgagedProperties = opts.mortgagedProperties;
  if (opts.mortgageLoans) bot.mortgageLoans = opts.mortgageLoans;
  room.players = [bot, ...(opts.opponents ?? [])];
  room.phase = opts.phase ?? TurnPhase.ActionPhase;
  return { room, bot };
}

function setupLateGameRegistry(
  opponentId: string,
  botId?: string,
  botRange?: readonly [number, number],
): PropertyRegistry {
  const registry: PropertyRegistry = new Map();
  for (let i = 0; i < 40; i++) {
    if (i === 10 || i === 0 || i === 20 || i === 30) continue;
    if (botId && botRange && i >= botRange[0] && i <= botRange[1]) {
      registry.set(i, botId);
    } else {
      registry.set(i, opponentId);
    }
  }
  return registry;
}

describe('[IMP-58] Facet 1: Bot Passive Value Investing & Upgrades', () => {
  it('[IMP58-F1-01] Bot Passive mua o Ha tang (Railroad / Cang HKQT Long Thanh) khi so du an toan', () => {
    const { room, bot } = makeTestSetup({ balance: 8_000, position: 5 });
    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.5,
    });
    expect(intent).not.toBeNull();
    expect(intent?.type).toBe('INTENT_BUY');
  });

  it('[IMP58-F1-02] Bot Passive mua o Tien ich (Utility / EVN) khi so du an toan', () => {
    const { room, bot } = makeTestSetup({ balance: 6_000, position: 12 });
    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.5,
    });
    expect(intent?.type).toBe('INTENT_BUY');
  });

  it('[IMP58-F1-03] Bot Passive mua o gia re (basePrice <= 1500 Tr., o Nau An Giang) khi so du an toan', () => {
    const { room, bot } = makeTestSetup({ balance: 5_000, position: 3 });
    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.5,
    });
    expect(intent?.type).toBe('INTENT_BUY');
  });

  it('[IMP58-F1-04] Bot Passive tu choi mua o dat do (basePrice > 1500 Tr.) khi chua co phao dai tien mat va khong tao monopoly', () => {
    const { room, bot } = makeTestSetup({ balance: 4_500, position: 39 });
    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.5,
    });
    expect(intent?.type).toBe('INTENT_DECLINE');
  });

  it('[IMP58-F1-05] Bot Passive mua o dat do khi da xay dung phao dai tien mat (> 3 lan gia goc)', () => {
    const { room, bot } = makeTestSetup({ balance: 25_000, position: 39 });
    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.5,
    });
    expect(intent?.type).toBe('INTENT_BUY');
  });

  it('[IMP58-F1-06] Bot Passive mua o dat giup hoan tat doc quyen (Monopoly Completion) du la o dat', () => {
    const { room, bot } = makeTestSetup({ balance: 8_000, position: 39 });
    const registry: PropertyRegistry = new Map([[37, bot.id]]);
    const intent = decideBotIntent(bot, room, registry, new Map(), {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.5,
    });
    expect(intent?.type).toBe('INTENT_BUY');
  });

  it('[IMP58-F1-07] Bot Passive tu choi mua o re neu so du sau mua vi pham safetyBuffer', () => {
    const { room, bot } = makeTestSetup({ balance: 700, position: 1 });
    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.5,
    });
    expect(intent?.type).toBe('INTENT_DECLINE');
  });

  it('[IMP58-F1-08] Bot Passive nang cap nha khi tien mat doi dao (vuot 3 lan chi phi xay dung)', () => {
    const { room, bot } = makeTestSetup({ balance: 15_000, phase: TurnPhase.PropertyManagement });
    const registry: PropertyRegistry = new Map([[1, bot.id], [3, bot.id]]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 0 }], [3, { level: 0 }]]);
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.5,
    });
    expect(intent?.type).toBe('INTENT_UPGRADE');
    expect(intent?.cellIndex).toBe(1);
  });

  it('[IMP58-F1-09] Bot Passive tu choi nang cap nha neu phia truoc 2-12 buoc co o doi thu nguy hiem', () => {
    const opponent = createPlayer('opp_1');
    opponent.balance = 10_000;
    const { room, bot } = makeTestSetup({
      balance: 2_000,
      phase: TurnPhase.PropertyManagement,
      opponents: [opponent],
    });
    const registry: PropertyRegistry = new Map([[1, bot.id], [3, bot.id], [6, opponent.id]]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 0 }], [3, { level: 0 }], [6, { level: 3 }]]);
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.5,
    });
    expect(intent?.type).not.toBe('INTENT_UPGRADE');
  });

  it('[IMP58-F1-10] Bot Passive tu choi nang cap nha neu so du khong du 3 lan chi phi xay dung', () => {
    const { room, bot } = makeTestSetup({ balance: 800, position: 20, phase: TurnPhase.PropertyManagement });
    const registry: PropertyRegistry = new Map([[1, bot.id], [3, bot.id]]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 0 }], [3, { level: 0 }]]);
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.5,
    });
    expect(intent?.type).not.toBe('INTENT_UPGRADE');
  });
});

describe('[IMP-58] Facet 2: Autonomous Mortgage Redemption (Chuoc Dat Tu Dong)', () => {
  it('[IMP58-F2-01] Bot co o dat the chap va du da tien mat -> phat sinh INTENT_REDEEM trong PropertyManagement', () => {
    const { room, bot } = makeTestSetup({
      balance: 5_000,
      position: 20,
      mortgagedProperties: [1],
      mortgageLoans: { 1: 300 },
      phase: TurnPhase.PropertyManagement,
    });
    const registry: PropertyRegistry = new Map([[1, bot.id]]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 0, isMortgaged: true }]]);
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.2,
    });
    expect(intent?.type).toBe('INTENT_REDEEM');
    expect(intent?.cellIndex).toBe(1);
  });

  it('[IMP58-F2-02] Uu tien chuoc o thuoc nhom doc quyen truoc o dat le', () => {
    const { room, bot } = makeTestSetup({
      balance: 6_000,
      position: 20,
      mortgagedProperties: [6, 1],
      phase: TurnPhase.PropertyManagement,
    });
    const registry: PropertyRegistry = new Map([[1, bot.id], [3, bot.id], [6, bot.id]]);
    const stateMap: PropertyStateMap = new Map([
      [1, { level: 0, isMortgaged: true }],
      [3, { level: 0, isMortgaged: false }],
      [6, { level: 0, isMortgaged: true }],
    ]);
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.2,
    });
    expect(intent?.type).toBe('INTENT_REDEEM');
    expect(intent?.cellIndex).toBe(1);
  });

  it('[IMP58-F2-03] Uu tien chuoc o co tien thue cao nhat giua cac o dat le', () => {
    const { room, bot } = makeTestSetup({
      balance: 8_000,
      position: 20,
      mortgagedProperties: [6, 11],
      phase: TurnPhase.PropertyManagement,
    });
    const registry: PropertyRegistry = new Map([[6, bot.id], [11, bot.id]]);
    const stateMap: PropertyStateMap = new Map([
      [6, { level: 0, isMortgaged: true }],
      [11, { level: 0, isMortgaged: true }],
    ]);
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.2,
    });
    expect(intent?.type).toBe('INTENT_REDEEM');
    expect(intent?.cellIndex).toBe(11);
  });

  it('[IMP58-F2-04] Bot tu choi chuoc dat neu so du sau chuoc vi pham safetyBuffer * 1.2', () => {
    const { room, bot } = makeTestSetup({
      balance: 500,
      position: 20,
      mortgagedProperties: [1],
      phase: TurnPhase.PropertyManagement,
    });
    const registry: PropertyRegistry = new Map([[1, bot.id]]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 0, isMortgaged: true }]]);
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.2,
    });
    expect(intent?.type).toBe('INTENT_END_TURN');
  });

  it('[IMP58-F2-05] Ca Bot Aggressive va Passive deu chuoc dat thanh cong khi du tien', () => {
    const { room, bot } = makeTestSetup({
      balance: 6_000,
      position: 20,
      mortgagedProperties: [1],
      phase: TurnPhase.PropertyManagement,
    });
    const registry: PropertyRegistry = new Map([[1, bot.id]]);
    const stateMap: PropertyStateMap = new Map([[1, { level: 0, isMortgaged: true }]]);
    const intentAgg = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Aggressive,
      balanceThresholdMultiplier: 1.0,
    });
    expect(intentAgg?.type).toBe('INTENT_REDEEM');
  });

  it('[IMP58-F2-06] Bot uu tien nang cap nha truoc khi chuoc neu co o nang cap hop le va du tien', () => {
    const { room, bot } = makeTestSetup({
      balance: 10_000,
      position: 20,
      mortgagedProperties: [6],
      phase: TurnPhase.PropertyManagement,
    });
    const registry: PropertyRegistry = new Map([[1, bot.id], [3, bot.id], [6, bot.id]]);
    const stateMap: PropertyStateMap = new Map([
      [1, { level: 0, isMortgaged: false }],
      [3, { level: 0, isMortgaged: false }],
      [6, { level: 0, isMortgaged: true }],
    ]);
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.2,
    });
    expect(intent?.type).toBe('INTENT_UPGRADE');
  });

  it('[IMP58-F2-07] Chuoc dat xong lap tuc dong bo stateMap.isMortgaged = false, tiep tuc luot khong bi chuoc lap lai', () => {
    const mgr = new RoomManager();
    const room = mgr.createRoom('p_host_redeem_chain');
    const bot = mgr.addBot(room.roomCode, 'bot_pas_chain', BotPersonality.Passive);
    room.started = true;
    bot!.balance = 15_000;
    bot!.position = 0;
    bot!.mortgagedProperties = [1];
    bot!.mortgageLoans = { 1: 300 };

    const registry = mgr.getRegistry(room.roomCode)!;
    registry.set(1, bot!.id);
    registry.set(3, bot!.id);
    const stateMap = mgr.getPropertyStates(room.roomCode)!;
    stateMap.set(1, { level: 0, isMortgaged: true });
    stateMap.set(3, { level: 0 });

    room.currentPlayerIndex = room.players.findIndex((p) => p.id === bot!.id);
    room.phase = TurnPhase.PropertyManagement;

    const res = mgr.handlePlayerIntent(room.roomCode, bot!.id, { type: 'INTENT_REDEEM', cellIndex: 1 });
    expect(res.success).toBe(true);
    expect(stateMap.get(1)?.isMortgaged).toBe(false);

    const nextIntent = decideBotIntent(bot!, room, registry, stateMap, {
      personality: BotPersonality.Passive,
      balanceThresholdMultiplier: 1.5,
    });
    expect(nextIntent?.type).toBe('INTENT_UPGRADE');
  });
});

describe('[IMP-58] Facet 3: Tactical Audit Bailout (Chien Luoc Ra Tu / Tru An)', () => {
  it('[IMP58-F3-01] Dau tran (unclaimedCount >= 8): Bot nop 500 Tr. bao lanh ngay (INTENT_BAIL_OUT)', () => {
    const { room, bot } = makeTestSetup({ balance: 5_000, position: 10, auditTurnsLeft: 3, phase: TurnPhase.WaitingRoll });
    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.2,
    });
    expect(intent?.type).toBe('INTENT_BAIL_OUT');
  });

  it('[IMP58-F3-02] Dau tran (unclaimedCount >= 8): Bot khong du tien (balance - 500 < minBuffer) -> roll xuc xac', () => {
    const { room, bot } = makeTestSetup({ balance: 600, position: 10, auditTurnsLeft: 3, phase: TurnPhase.WaitingRoll });
    const intent = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.2,
    });
    expect(intent?.type).toBe('INTENT_ROLL');
  });

  it('[IMP58-F3-03] Cuoi tran (unclaimedCount < 8): Phia truoc co nha doi thu nguy hiem -> o lai trong tu tru an', () => {
    const opponent = createPlayer('opp_19');
    const { room, bot } = makeTestSetup({
      balance: 5_000,
      position: 10,
      auditTurnsLeft: 2,
      phase: TurnPhase.WaitingRoll,
      opponents: [opponent],
    });
    const registry = setupLateGameRegistry(opponent.id);
    const stateMap: PropertyStateMap = new Map([[14, { level: 3 }]]);
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.2,
    });
    expect(intent?.type).toBe('INTENT_ROLL');
  });

  it('[IMP58-F3-04] Cuoi tran (unclaimedCount < 8): Phia truoc hoan toan an toan -> nop bao lanh ra ngoai', () => {
    const opponent = createPlayer('opp_20');
    const { room, bot } = makeTestSetup({
      balance: 8_000,
      position: 10,
      auditTurnsLeft: 2,
      phase: TurnPhase.WaitingRoll,
      opponents: [opponent],
    });
    const registry = setupLateGameRegistry(opponent.id, bot.id, [11, 22]);
    const intent = decideBotIntent(bot, room, registry, new Map(), {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.2,
    });
    expect(intent?.type).toBe('INTENT_BAIL_OUT');
  });

  it('[IMP58-F3-05] Ca 3 Bot personalities deu chu dong nop bao lanh dau tran', () => {
    const { room, bot } = makeTestSetup({ balance: 5_000, position: 10, auditTurnsLeft: 3, phase: TurnPhase.WaitingRoll });
    const intentAgg = decideBotIntent(bot, room, new Map(), new Map(), {
      personality: BotPersonality.Aggressive,
      balanceThresholdMultiplier: 1.0,
    });
    expect(intentAgg?.type).toBe('INTENT_BAIL_OUT');
  });

  it('[IMP58-F3-06] Dau tran (unclaimed >= 8) nhung phia truoc co nha nguy hiem -> tu choi bao lanh neu khong du minBuffer', () => {
    const opponent = createPlayer('opp_22');
    const { room, bot } = makeTestSetup({
      balance: 800,
      position: 10,
      auditTurnsLeft: 3,
      phase: TurnPhase.WaitingRoll,
      opponents: [opponent],
    });
    const registry: PropertyRegistry = new Map([[14, opponent.id]]);
    const stateMap: PropertyStateMap = new Map([[14, { level: 3 }]]);
    const intent = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.2,
    });
    expect(intent?.type).toBe('INTENT_ROLL');
  });
});

describe('[IMP-58] Facet 4: Determinism & Treasury Conservation Invariants', () => {
  it('[IMP58-F4-01] Bao lanh Tram Kiem Toan nop 500 Tr. chuyen vao Kho Bac (Treasury Conservation Invariant)', () => {
    const mgr = new RoomManager();
    const room = mgr.createRoom('p_host');
    room.treasury = 0;

    const bot = mgr.addBot(room.roomCode, 'bot_41', BotPersonality.Balanced);
    room.started = true;
    bot!.balance = 5_000;
    bot!.position = 10;
    bot!.auditTurnsLeft = 3;
    room.currentPlayerIndex = room.players.findIndex((p) => p.id === bot!.id);
    room.phase = TurnPhase.WaitingRoll;

    const res = mgr.handlePlayerIntent(room.roomCode, bot!.id, { type: 'INTENT_BAIL_OUT' });
    expect(res.success).toBe(true);
    expect(bot!.balance).toBe(4_500);
    expect(room.treasury).toBe(500);
    expect(bot!.auditTurnsLeft).toBe(0);
  });

  it('[IMP58-F4-02] Chuoc dat the chap chuyen 10% phi vao Kho Bac (Treasury Conservation Invariant)', () => {
    const mgr = new RoomManager();
    const room = mgr.createRoom('p_host_2');
    room.treasury = 0;

    const bot = mgr.addBot(room.roomCode, 'bot_42', BotPersonality.Balanced);
    room.started = true;
    bot!.balance = 5_000;
    bot!.position = 20;
    bot!.mortgagedProperties = [1];
    bot!.mortgageLoans = { 1: 300 };
    room.currentPlayerIndex = room.players.findIndex((p) => p.id === bot!.id);
    room.phase = TurnPhase.PropertyManagement;

    const registry = mgr.getRegistry(room.roomCode);
    registry?.set(1, bot!.id);
    const stateMap = mgr.getPropertyStates(room.roomCode);
    stateMap?.set(1, { level: 0, isMortgaged: true });

    const res = mgr.handlePlayerIntent(room.roomCode, bot!.id, { type: 'INTENT_REDEEM', cellIndex: 1 });
    expect(res.success).toBe(true);
    expect(bot!.balance).toBe(5_000 - 330);
    expect(room.treasury).toBe(30);
  });

  it('[IMP58-F4-03] 100% Deterministic: Cung input state luon cho cung mot intent trong Phase 1', () => {
    const { room, bot } = makeTestSetup({ balance: 5_000, position: 5, phase: TurnPhase.ActionPhase });
    const registry: PropertyRegistry = new Map();
    const stateMap: PropertyStateMap = new Map();

    const intent1 = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.2,
    });
    const intent2 = decideBotIntent(bot, room, registry, stateMap, {
      personality: BotPersonality.Balanced,
      balanceThresholdMultiplier: 1.2,
    });

    expect(intent1).toEqual(intent2);
  });
});
