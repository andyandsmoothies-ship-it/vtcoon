// [UC-BOT-03/MSS][UC-BOT-03/A1][UC-BOT-03/A2][UC-BOT-03/A3][UC-BOT-03/A4][UC-BOT-03/A5]
// Solvency Solver & Dynamic Upgrade/Valuation Integration Tests
import { describe, it, expect, beforeEach } from 'vitest';
import { createPlayer, createRoom, TurnPhase, type Player, type Room } from '../../src/domain/room';
import { MarketCardId } from '../../src/domain/event_card_engine';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data';
import { BotPersonality, decideBotIntent } from '../../src/domain/bot/bot_engine';
import { resolveInsolvencyStep } from '../../src/domain/bot/solvency_solver';

describe('Solvency Solver & Bot Engine Integration', () => {
  let room: Room;
  let bot: Player;
  let opponent: Player;
  let registry: PropertyRegistry;
  let stateMap: PropertyStateMap;

  beforeEach(() => {
    room = createRoom('solv-1');
    room.round = 1;
    bot = Object.assign(createPlayer('bot-ai'), { isBot: true, position: 0 });
    opponent = Object.assign(createPlayer('player-opp'), { position: 0 });
    room.players = [bot, opponent];
    registry = new Map();
    stateMap = new Map();
  });

  // [UC-BOT-03/MSS] Solvency Rescue via Single Mortgage
  describe('[UC-BOT-03/MSS] Solvency Rescue via Single Mortgage', () => {
    it('bot bi am tien: the chap o dat don le -> so du duong -> thoat khoi pha san', () => {
      bot.balance = -200;
      registry.set(1, bot.id);
      registry.set(3, opponent.id); // Khong tron bo Mau Nau

      const intent = resolveInsolvencyStep(bot, room, registry, stateMap);
      expect(intent.type).toBe('INTENT_MORTGAGE');
      expect(intent.cellIndex).toBe(1);

      // Consumer Closed-Loop Verification: ap dung the chap nhan 50% gia dat (600 * 0.5 = 300)
      bot.balance += 300;
      bot.mortgagedProperties.push(1);
      stateMap.set(1, { level: 0, isMortgaged: true });

      expect(bot.balance).toBe(100);
      const nextIntent = resolveInsolvencyStep(bot, room, registry, stateMap);
      expect(nextIntent.type).toBe('INTENT_END_TURN');
    });

    it('chon o dat don le co tien thue thap nhat de the chap truoc', () => {
      bot.balance = -200;
      registry.set(1, bot.id); registry.set(6, bot.id); // Can Tho 60, Binh Duong 120
      registry.set(3, opponent.id); registry.set(8, opponent.id);

      const intent = resolveInsolvencyStep(bot, room, registry, stateMap);
      expect(intent.type).toBe('INTENT_MORTGAGE');
      expect(intent.cellIndex).toBe(1); // Uu tien the chap o co tien thue thap nhat (60 < 120)
    });

    it('Step 4: the chap o dat tron bo mau khi khong con nha de thoat no', () => {
      bot.balance = -200;
      registry.set(1, bot.id); registry.set(3, bot.id);
      stateMap.set(1, { level: 0 }); stateMap.set(3, { level: 0 });

      const intent = resolveInsolvencyStep(bot, room, registry, stateMap);
      expect(intent.type).toBe('INTENT_MORTGAGE');
      expect([1, 3].includes(intent.cellIndex as number)).toBe(true);
    });
  });

  // [UC-BOT-03/A1] Solvency Rescue via Downgrading Houses (Steps 1 & 3)
  describe('[UC-BOT-03/A1] Solvency Rescue via Downgrading Non-Monopoly House', () => {
    it('bot co nha C1 o o dat khong tron bo: ha cap nha -> thu hoi 50% chi phi xay -> thoat hiem', () => {
      bot.balance = -100;
      registry.set(1, bot.id); registry.set(3, opponent.id);
      stateMap.set(1, { level: 1 }); // Nha C1 (upgradeCost = 300)

      const intent = resolveInsolvencyStep(bot, room, registry, stateMap);
      expect(intent.type).toBe('INTENT_DOWNGRADE');
      expect(intent.cellIndex).toBe(1);

      // Consumer Closed-Loop: ha cap thu hoi 50% cua 300 = 150
      bot.balance += 150;
      stateMap.set(1, { level: 0 });

      expect(bot.balance).toBe(50);
      expect(resolveInsolvencyStep(bot, room, registry, stateMap).type).toBe('INTENT_END_TURN');
    });

    it('Step 3: ha cap nha o tron bo mau tuan thu Even-Downgrade (ha o cao hon truoc)', () => {
      bot.balance = -100;
      registry.set(1, bot.id);
      registry.set(3, bot.id);
      stateMap.set(1, { level: 1 });
      stateMap.set(3, { level: 2 }); // O 3 cao hon -> bat buoc phai ha o 3

      const intent = resolveInsolvencyStep(bot, room, registry, stateMap);
      expect(intent.type).toBe('INTENT_DOWNGRADE');
      expect(intent.cellIndex).toBe(3);
    });
  });

  // [UC-BOT-03/A2] Complete Insolvency Exhaustion -> Bankruptcy
  describe('[UC-BOT-03/A2] Complete Insolvency Exhaustion -> Bankruptcy', () => {
    it('bot da the chap het toan bo tai san ma van am no: phat INTENT_BANKRUPTCY', () => {
      bot.balance = -5000;
      registry.set(1, bot.id);
      bot.mortgagedProperties = [1];
      stateMap.set(1, { level: 0, isMortgaged: true });

      const intent = resolveInsolvencyStep(bot, room, registry, stateMap);
      expect(intent.type).toBe('INTENT_BANKRUPTCY');
    });

    it('bot khong so huu bat ky tai san nao khi am tien -> phat ngay INTENT_BANKRUPTCY', () => {
      bot.balance = -1000;
      const intent = resolveInsolvencyStep(bot, room, registry, stateMap);
      expect(intent.type).toBe('INTENT_BANKRUPTCY');
    });

    it('thi truong bi MC_FREEZE_TRADE khong the the chap -> phat INTENT_BANKRUPTCY', () => {
      bot.balance = -1000;
      registry.set(1, bot.id);
      room.activeModifiers = [{ type: MarketCardId.MC_FREEZE_TRADE, affectedCells: [], remainingRounds: 2 }];
      expect(resolveInsolvencyStep(bot, room, registry, stateMap).type).toBe('INTENT_BANKRUPTCY');
    });

    it('InsolvencyPhase trong bot_engine tich hop resolveInsolvencyStep', () => {
      bot.balance = -1000;
      room.phase = TurnPhase.InsolvencyPhase;
      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.2,
      });
      expect(intent?.type).toBe('INTENT_BANKRUPTCY');
    });
  });

  // [UC-BOT-03/A3] Autonomous Property Upgrades on Safe Horizon
  describe('[UC-BOT-03/A3] Autonomous Property Upgrades on Safe Horizon', () => {
    it('bot so huu tron bo mau Nau va du tien vuot safetyBuffer -> phat INTENT_UPGRADE', () => {
      bot.balance = 5000;
      registry.set(1, bot.id);
      registry.set(3, bot.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(3, { level: 0 });
      room.phase = TurnPhase.PropertyManagement;

      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.2,
      });

      expect(intent?.type).toBe('INTENT_UPGRADE');
      expect([1, 3].includes(intent?.cellIndex as number)).toBe(true);
    });

    it('tuan thu nguyen tac xay deu (Even-Building): nang cap o thap hon truoc', () => {
      bot.balance = 5000;
      registry.set(1, bot.id);
      registry.set(3, bot.id);
      stateMap.set(1, { level: 1 }); // O 1 da len C1
      stateMap.set(3, { level: 0 }); // O 3 con C0 -> bat buoc phai xay o 3
      room.phase = TurnPhase.PropertyManagement;

      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.2,
      });

      expect(intent?.type).toBe('INTENT_UPGRADE');
      expect(intent?.cellIndex).toBe(3);
    });

    it('khong nang cap khi trong nhom mau co bat ky o nao bi the chap', () => {
      bot.balance = 5000;
      registry.set(1, bot.id);
      registry.set(3, bot.id);
      bot.mortgagedProperties = [3];
      room.phase = TurnPhase.PropertyManagement;

      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.2,
      });
      expect(intent?.type).toBe('INTENT_END_TURN');
    });

    it('bot Passive khong bao gio nang cap nha trong PropertyManagement', () => {
      bot.balance = 20000;
      registry.set(1, bot.id);
      registry.set(3, bot.id);
      room.phase = TurnPhase.PropertyManagement;

      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Passive,
        balanceThresholdMultiplier: 1.5,
      });
      expect(intent?.type).toBe('INTENT_END_TURN');
    });
  });

  // [UC-BOT-03/A4] Cash Preservation against Opponent Threat Horizon
  describe('[UC-BOT-03/A4] Cash Preservation against Opponent Threat Horizon', () => {
    it('phia truoc co khach san C3 cua doi thu cach 7 buoc -> giu tien du phong, ket thuc luot', () => {
      // Bot o vi tri 17, cach 7 buoc la o 24 (Da Nang rent = 6000)
      // Balanced: expectedLoss = 1000, safetyBuffer = 1000
      bot.position = 17;
      bot.balance = 1100; // Chi con 1100
      registry.set(1, bot.id);
      registry.set(3, bot.id);
      registry.set(24, opponent.id);
      stateMap.set(24, { level: 3 });

      // O 1 chi phi nang cap la 300. 1100 - 300 = 800 < 1000 (safetyBuffer) -> Khong du an toan
      room.phase = TurnPhase.PropertyManagement;

      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.2,
      });

      expect(intent?.type).toBe('INTENT_END_TURN');
    });

    it('ActionPhase tu choi mua o dat moi khi phia truoc co bai min C3 khong du safetyBuffer', () => {
      bot.position = 17;
      bot.balance = 1500; // 1500 - 800 = 700 < 1000 (safetyBuffer)
      room.round = 1;
      room.phase = TurnPhase.ActionPhase;
      registry.set(24, opponent.id);
      stateMap.set(24, { level: 3 });

      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.2,
      });
      expect(intent?.type).toBe('INTENT_DECLINE');
    });
  });

  // [UC-BOT-03/A5] Valuation Engine ActionPhase Integration
  describe('[UC-BOT-03/A5] Valuation Engine ActionPhase Integration', () => {
    it('vong 1 mua dat khi dinh gia vuot gia niem yet va du tien mat', () => {
      bot.position = 6; // Binh Duong gia 1000
      bot.balance = 15000;
      room.round = 1;
      room.phase = TurnPhase.ActionPhase;

      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.2,
      });
      expect(intent?.type).toBe('INTENT_BUY');
    });

    it('tu choi mua khi bot khong du tien mat tra gia niem yet', () => {
      bot.position = 6;
      bot.balance = 500; // Nho hon 1000
      room.round = 1;
      room.phase = TurnPhase.ActionPhase;

      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.2,
      });
      expect(intent?.type).toBe('INTENT_DECLINE');
    });

    it('tu choi mua o dat le o giai doan cuoi (Round 25 Late Game) khi dinh gia thap hon gia niem yet', () => {
      bot.position = 6;
      bot.balance = 15000;
      room.round = 25; // Late game: pacingFactor = 0.7, khong du bo mau
      room.phase = TurnPhase.ActionPhase;

      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.2,
      });
      expect(intent?.type).toBe('INTENT_DECLINE');
    });

    it('bot Passive luon luon tu choi mua bat ke dinh gia cao hay thap', () => {
      bot.position = 6;
      bot.balance = 20000;
      room.round = 1;
      room.phase = TurnPhase.ActionPhase;

      const intent = decideBotIntent(bot, room, registry, stateMap, {
        personality: BotPersonality.Passive,
        balanceThresholdMultiplier: 1.5,
      });
      expect(intent?.type).toBe('INTENT_DECLINE');
    });
  });
});
