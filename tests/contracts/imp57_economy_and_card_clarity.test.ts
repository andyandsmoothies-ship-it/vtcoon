// [TC-57.1/MSS..TC-57.4/MSS][UC-001][UC-038][UC-039][UC-040][UC-BOT-03][UC-BOT-04]
// Contract & Economic Boundaries Test Suite — IMP-57 Economy & Card Clarity
// Strict QA Contract: Immutable SSOT Specification for Economy, Bot AI Liquidity Buffer, HOSE Outcomes & Card Clarity Metadata

import { describe, it, expect } from 'vitest';
import {
  TurnPhase,
  createRoom,
  createPlayer,
  type Room,
  type Player,
} from '../../src/domain/room.js';
import { CellType, BOARD_CONFIG } from '../../src/domain/board_config.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data.js';
import { handleSpecialCell } from '../../src/server/special_cell_handler.js';
import { executeTurnRoll } from '../../src/server/turn_loop.js';
import {
  MarketCardId,
  ChanceCardId,
  HOSE_OUTCOMES,
} from '../../src/domain/event_card_types.js';
import { resolveHoseInvestment } from '../../src/domain/event_card_engine.js';
import {
  getMarketCardInfo,
  getChanceCardInfo,
  MARKET_CARD_DETAILS,
  CHANCE_CARD_DETAILS,
} from '../../src/domain/event_card_metadata.js';
import * as BotEngineModule from '../../src/domain/bot/bot_engine.js';
import { BotPersonality, decideBotIntent } from '../../src/domain/bot/bot_engine.js';

// --- Helpers for Facet 4 Metadata Extraction ---
function getMarketMeta(cardId: MarketCardId) {
  const info = getMarketCardInfo(cardId) as any;
  const detail = (MARKET_CARD_DETAILS as any)?.[cardId] as any;
  return {
    targetScope: info?.targetScope ?? detail?.targetScope,
    effectDetail: info?.effectDetail ?? detail?.effectDetail,
    duration: info?.duration ?? detail?.duration,
    destination: info?.destination ?? detail?.destination,
  };
}

function getChanceMeta(cardId: ChanceCardId) {
  const info = getChanceCardInfo(cardId) as any;
  const detail = (CHANCE_CARD_DETAILS as any)?.[cardId] as any;
  return {
    targetScope: info?.targetScope ?? detail?.targetScope,
    effectDetail: info?.effectDetail ?? detail?.effectDetail,
    duration: info?.duration ?? detail?.duration,
    destination: info?.destination ?? detail?.destination,
  };
}

const ALL_MARKET_CARDS = [
  MarketCardId.MC_NIGHT_ECONOMY,
  MarketCardId.MC_MEGA_CONCERT,
  MarketCardId.MC_ALCOHOL_CHECK,
  MarketCardId.MC_CASINO_PILOT,
  MarketCardId.MC_RATE_HIKE,
  MarketCardId.MC_CREDIT_STIMULUS,
  MarketCardId.MC_LAND_FEVER,
  MarketCardId.MC_FIRE_INSPECTION,
  MarketCardId.MC_PUBLIC_INVEST,
  MarketCardId.MC_ANTI_SPECULATE,
  MarketCardId.MC_PEAK_TOURISM,
  MarketCardId.MC_FREEZE_TRADE,
  MarketCardId.MC_FUEL_SURGE,
  MarketCardId.MC_URBAN_PLANNING,
  MarketCardId.MC_UTILITY_DOUBLE,
  MarketCardId.MC_COASTAL_STORM,
] as const;

const ALL_CHANCE_CARDS = [
  ChanceCardId.CC_PLATE_AUCTION,
  ChanceCardId.CC_TAX_AUDIT,
  ChanceCardId.CC_STOCK_PROFIT,
  ChanceCardId.CC_DIPLOMATIC,
  ChanceCardId.CC_CONTRACT_PENALTY,
  ChanceCardId.CC_LAND_CHANGE,
  ChanceCardId.CC_BUILD_HALT,
  ChanceCardId.CC_MA_FORCE,
  ChanceCardId.CC_COPYRIGHT,
  ChanceCardId.CC_OVERDRAFT,
  ChanceCardId.CC_JUNK_STOCK,
  ChanceCardId.CC_FRANCHISE,
  ChanceCardId.CC_LAND_RECLAIM,
  ChanceCardId.CC_VENUE_INCIDENT,
  ChanceCardId.CC_CONCERT_SPONSOR,
  ChanceCardId.CC_FREE_CREDIT,
  ChanceCardId.CC_PORT_EXCLUSIVE,
  ChanceCardId.CC_SLOW_BUILD,
  ChanceCardId.CC_MEDIA_CRISIS,
  ChanceCardId.CC_SWAP_PROJECT,
] as const;

describe('[CONTRACT-TEST] IMP-57: Universal 4-Facet Economy & Card Clarity Invariants', () => {

  // ===========================================================================
  // FACET 1: Safe Zone at Cell 20 (FreeParking / Nghỉ Dưỡng Miễn Phí) — SSOT §II
  // ===========================================================================
  describe('Facet 1: Safe Zone at Cell 20 FreeParking (Zero Cash Flow)', () => {
    it('[TC-57.1a/MSS][UC-001] Ô 20 khi dừng chân: Số dư người chơi được bảo toàn không đổi (0 Tr.)', () => {
      const room = createRoom('host-p1');
      const player = room.players[0]!;
      player.balance = 4000;
      room.treasury = 3000;
      player.position = 20;

      const reg: PropertyRegistry = new Map();
      const sm: PropertyStateMap = new Map();

      const handled = handleSpecialCell(room, player, CellType.FreeParking, reg, sm, () => 0.5);
      expect(handled).toBe(true);
      expect(player.balance).toBe(4000);
    });

    it('[TC-57.1b/MSS][UC-001] Ô 20 khi dừng chân: room.treasury được bảo toàn không bị thất thoát', () => {
      const room = createRoom('host-p1');
      const player = room.players[0]!;
      player.balance = 4000;
      room.treasury = 3000;
      player.position = 20;

      const reg: PropertyRegistry = new Map();
      const sm: PropertyStateMap = new Map();

      handleSpecialCell(room, player, CellType.FreeParking, reg, sm, () => 0.5);
      expect(room.treasury).toBe(3000);
    });

    it('[TC-57.1c/MSS][UC-001] Ô 20 chuyển FSM về TurnPhase.PropertyManagement', () => {
      const room = createRoom('host-p1');
      const player = room.players[0]!;
      player.balance = 4000;
      room.treasury = 3000;
      player.position = 20;
      room.phase = TurnPhase.WaitingRoll;

      const reg: PropertyRegistry = new Map();
      const sm: PropertyStateMap = new Map();

      handleSpecialCell(room, player, CellType.FreeParking, reg, sm, () => 0.5);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
    });

    it('[TC-57.1d/MSS][UC-001] E2E Turn Loop: Tung xúc xắc dẫm đúng Ô 20 an toàn không đổi số dư và về PropertyManagement', () => {
      const room = createRoom('host-p1');
      const player = room.players[0]!;
      player.balance = 2000;
      player.position = 17; // Phiếu Thị Trường
      room.treasury = 1500;
      room.phase = TurnPhase.WaitingRoll;

      const reg: PropertyRegistry = new Map();
      const sm: PropertyStateMap = new Map();
      const rolledMap = new Map<string, boolean>();

      // Mock xúc xắc: die1 = 1 (rng 0.05), die2 = 2 (rng 0.20) -> tổng = 3 -> 17 + 3 = 20 (Nghỉ Dưỡng Miễn Phí)
      let callCount = 0;
      const deterministicRng = () => {
        callCount++;
        return callCount === 1 ? 0.05 : 0.20;
      };

      executeTurnRoll(room, player, reg, sm, deterministicRng, () => 0.5, rolledMap, room.roomCode);

      expect(player.position).toBe(20);
      expect(player.balance).toBe(2000); // Không đổi
      expect(room.treasury).toBe(1500); // Bảo toàn
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
    });
  });

  // ===========================================================================
  // FACET 2: Bot AI Personality Preservation & Threat Horizon 2D6
  // ===========================================================================
  describe('Facet 2: Bot AI Personality Preservation & Threat Horizon 2D6', () => {
    it('[TC-57.2a/MSS][UC-BOT-03] Bot Balanced với balance = 1.200 dẫm ô 1.000 Tr. (đủ ngưỡng 120%): trả về INTENT_BUY', () => {
      const room = createRoom('host-p1');
      const bot = createPlayer('bot-1');
      bot.isBot = true;
      bot.balance = 1200;
      bot.position = 6; // Bình Dương: giá 1.000 Tr.
      room.players = [createPlayer('host-p1'), bot];
      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.ActionPhase;

      const reg: PropertyRegistry = new Map();
      const sm: PropertyStateMap = new Map();

      const intent = decideBotIntent(bot, room, reg, sm, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.20,
      });

      expect(intent?.type).toBe('INTENT_BUY');
    });

    it('[TC-57.2b/MSS][UC-BOT-03] Bot Aggressive với balance = 1.000 dẫm ô 1.000 Tr. (đủ ngưỡng 100%): trả về INTENT_BUY', () => {
      const room = createRoom('host-p1');
      const bot = createPlayer('bot-1');
      bot.isBot = true;
      bot.balance = 1000;
      bot.position = 6; // Bình Dương: giá 1.000 Tr.
      room.players = [createPlayer('host-p1'), bot];
      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.ActionPhase;

      const reg: PropertyRegistry = new Map();
      const sm: PropertyStateMap = new Map();

      const intent = decideBotIntent(bot, room, reg, sm, {
        personality: BotPersonality.Aggressive,
        balanceThresholdMultiplier: 1.00,
      });

      expect(intent?.type).toBe('INTENT_BUY');
    });

    it('[TC-57.2c/MSS][UC-BOT-03] Bot Balanced với balance = 1.000 dẫm ô 1.000 Tr. (dưới ngưỡng 120% = 1.200): trả về INTENT_DECLINE', () => {
      const room = createRoom('host-p1');
      const bot = createPlayer('bot-1');
      bot.isBot = true;
      bot.balance = 1000;
      bot.position = 6; // Bình Dương: giá 1.000 Tr.
      room.players = [createPlayer('host-p1'), bot];
      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.ActionPhase;

      const reg: PropertyRegistry = new Map();
      const sm: PropertyStateMap = new Map();

      const intent = decideBotIntent(bot, room, reg, sm, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.20,
      });

      expect(intent?.type).toBe('INTENT_DECLINE');
    });

    it('[TC-57.2d/MSS][UC-BOT-03] Bot từ chối mua khi phía trước có ô nguy hiểm (dangerTilesCount > 0) và số dư sau mua < safetyBuffer', () => {
      const room = createRoom('host-p1');
      const bot = createPlayer('bot-1');
      bot.isBot = true;
      bot.balance = 1300;
      bot.position = 6; // Đang ở ô 6 (giá 1.000)
      const opp = createPlayer('host-p1');
      opp.position = 0;
      room.players = [opp, bot];
      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.ActionPhase;

      // Giả lập ô 13 (cách ô 6 là 7 bước) thuộc sở hữu đối thủ, có nhà C3 tiền thuê cao 1.000 Tr.
      const reg: PropertyRegistry = new Map([[13, opp.id]]);
      const sm: PropertyStateMap = new Map([[13, { level: 3 }]]);

      const intent = decideBotIntent(bot, room, reg, sm, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.0,
      });

      expect(intent?.type).toBe('INTENT_DECLINE');
    });

    it('[TC-57.2e/MSS][UC-BOT-03] Bot có 6.000 Tr. khi dẫm ô 4.000 Tr. qua decideBotIntent trong ActionPhase -> INTENT_BUY', () => {
      const room = createRoom('host-p1');
      const bot = createPlayer('bot-1');
      bot.isBot = true;
      bot.balance = 6000;
      bot.position = 39; // Ô 39 Phú Quốc: giá 4.000 Tr.
      room.players = [createPlayer('host-p1'), bot];
      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.ActionPhase;

      const reg: PropertyRegistry = new Map();
      const sm: PropertyStateMap = new Map();

      const intent = decideBotIntent(bot, room, reg, sm, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.0,
      });

      expect(intent?.type).toBe('INTENT_BUY');
    });

    it('[TC-57.2f/MSS][UC-BOT-04] Bot nâng cấp nhà: từ chối nâng cấp nếu số dư sau nâng cấp < safetyBuffer (trả về INTENT_END_TURN)', () => {
      const room = createRoom('host-p1');
      const bot = createPlayer('bot-1');
      bot.isBot = true;
      // Bot sở hữu độc quyền nhóm Nâu (Ô 1 Cần Thơ, Ô 3 An Giang). Chi phí nâng cấp Cần Thơ cấp 1 là 300 Tr.
      // Với số dư 500 Tr.: sau khi nâng cấp 500 - 300 = 200 < 300 Tr. (safetyBuffer tối thiểu)
      bot.balance = 500;
      bot.position = 1;
      room.players = [createPlayer('host-p1'), bot];
      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.PropertyManagement;

      const reg: PropertyRegistry = new Map([[1, bot.id], [3, bot.id]]);
      const sm: PropertyStateMap = new Map([
        [1, { level: 0 }],
        [3, { level: 0 }],
      ]);

      const intent = decideBotIntent(bot, room, reg, sm, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.0,
      });

      expect(intent?.type).toBe('INTENT_END_TURN');
    });

    it('[TC-57.2g/MSS][UC-BOT-04] Bot nâng cấp nhà: đồng ý nâng cấp khi số dư sau nâng cấp >= safetyBuffer (trả về INTENT_UPGRADE)', () => {
      const room = createRoom('host-p1');
      const bot = createPlayer('bot-1');
      bot.isBot = true;
      // Với số dư 1.000 Tr.: sau khi nâng cấp 1000 - 300 = 700 >= 300 Tr. (safetyBuffer)
      bot.balance = 1000;
      bot.position = 1;
      room.players = [createPlayer('host-p1'), bot];
      room.currentPlayerIndex = 1;
      room.phase = TurnPhase.PropertyManagement;

      const reg: PropertyRegistry = new Map([[1, bot.id], [3, bot.id]]);
      const sm: PropertyStateMap = new Map([
        [1, { level: 0 }],
        [3, { level: 0 }],
      ]);

      const intent = decideBotIntent(bot, room, reg, sm, {
        personality: BotPersonality.Balanced,
        balanceThresholdMultiplier: 1.0,
      });

      expect(intent?.type).toBe('INTENT_UPGRADE');
      expect((intent as any)?.cellIndex).toBe(1);
    });
  });

  // ===========================================================================
  // FACET 3: Sàn HOSE chuẩn SSOT docs/requirements.md §IV.3
  // ===========================================================================
  describe('Facet 3: Sàn HOSE chuẩn SSOT docs/requirements.md §IV.3', () => {
    it('[TC-57.3a/MSS][UC-040] HOSE_OUTCOMES[1] phải là 0.50 (giảm sàn cắt lỗ 50%) & đầu tư 1.000 Tr. thu về 500 Tr.', () => {
      expect(HOSE_OUTCOMES[1]).toBe(0.50);
      expect(resolveHoseInvestment(1000, 1)).toBe(500);
    });

    it('[TC-57.3b/MSS][UC-040] HOSE_OUTCOMES[2] phải là 0.75 (điều chỉnh giảm 25%) & đầu tư 1.000 Tr. thu về 750 Tr.', () => {
      expect(HOSE_OUTCOMES[2]).toBe(0.75);
      expect(resolveHoseInvestment(1000, 2)).toBe(750);
    });

    it('[TC-57.3c/MSS][UC-040] HOSE_OUTCOMES[3] phải là 1.00 (hòa vốn) & đầu tư 1.000 Tr. thu về 1.000 Tr.', () => {
      expect(HOSE_OUTCOMES[3]).toBe(1.00);
      expect(resolveHoseInvestment(1000, 3)).toBe(1000);
    });

    it('[TC-57.3d/MSS][UC-040] HOSE_OUTCOMES[4] phải là 1.20 (tăng +20%) & đầu tư 1.000 Tr. thu về 1.200 Tr.', () => {
      expect(HOSE_OUTCOMES[4]).toBe(1.20);
      expect(resolveHoseInvestment(1000, 4)).toBe(1200);
    });

    it('[TC-57.3e/MSS][UC-040] HOSE_OUTCOMES[5] phải là 1.50 (tăng +50%) & đầu tư 1.000 Tr. thu về 1.500 Tr.', () => {
      expect(HOSE_OUTCOMES[5]).toBe(1.50);
      expect(resolveHoseInvestment(1000, 5)).toBe(1500);
    });

    it('[TC-57.3f/MSS][UC-040] HOSE_OUTCOMES[6] phải là 2.00 (tăng trần +100%) & đầu tư 1.000 Tr. thu về 2.000 Tr.', () => {
      expect(HOSE_OUTCOMES[6]).toBe(2.00);
      expect(resolveHoseInvestment(1000, 6)).toBe(2000);
    });

    it('[TC-57.3g/MSS][UC-040] Kỳ vọng toán học xúc xắc HOSE dương: (0.5+0.75+1.0+1.2+1.5+2.0)/6 > 1.15', () => {
      const sum = [1, 2, 3, 4, 5, 6].reduce((acc, face) => acc + (HOSE_OUTCOMES[face] ?? 0), 0);
      const ev = sum / 6;
      expect(ev).toBeGreaterThan(1.15);
    });
  });

  // ===========================================================================
  // FACET 4: Metadata 36 Thẻ Bài Đầy Đủ 4 Thông Số Minh Bạch
  // ===========================================================================
  describe('Facet 4.1: Metadata 16 Thẻ Thị Trường (Market Cards) Minh Bạch', () => {
    it.each(ALL_MARKET_CARDS)(
      '[TC-57.4a/MSS][UC-038] Market Card %s phải có 4 thông số: targetScope, effectDetail, duration, destination',
      (cardId) => {
        const meta = getMarketMeta(cardId);
        expect(meta.targetScope).toEqual(expect.stringMatching(/\S+/));
        expect(meta.effectDetail).toEqual(expect.stringMatching(/\S+/));
        expect(meta.duration).toEqual(expect.stringMatching(/\S+/));
        expect(meta.destination).toEqual(expect.stringMatching(/\S+/));
      },
    );
  });

  describe('Facet 4.2: Metadata 20 Thẻ Cơ Hội (Chance Cards) Minh Bạch', () => {
    it.each(ALL_CHANCE_CARDS)(
      '[TC-57.4b/MSS][UC-039] Chance Card %s phải có 4 thông số: targetScope, effectDetail, duration, destination',
      (cardId) => {
        const meta = getChanceMeta(cardId);
        expect(meta.targetScope).toEqual(expect.stringMatching(/\S+/));
        expect(meta.effectDetail).toEqual(expect.stringMatching(/\S+/));
        expect(meta.duration).toEqual(expect.stringMatching(/\S+/));
        expect(meta.destination).toEqual(expect.stringMatching(/\S+/));
      },
    );
  });

  describe('Facet 4.3: Nội dung đặc thù của các thẻ chiến lược', () => {
    it('[TC-57.4c/MSS][UC-038] MC_LAND_FEVER: targetScope phải chứa Bình Dương, Đồng Nai và Hưng Yên', () => {
      const meta = getMarketMeta(MarketCardId.MC_LAND_FEVER);
      expect(meta.targetScope).toContain('Bình Dương');
      expect(meta.targetScope).toContain('Đồng Nai');
      expect(meta.targetScope).toContain('Hưng Yên');
    });

    it('[TC-57.4d/MSS][UC-038] MC_CASINO_PILOT: targetScope phải chứa Kiên Giang hoặc Phú Quốc', () => {
      const meta = getMarketMeta(MarketCardId.MC_CASINO_PILOT);
      const containsTarget = Boolean(
        meta.targetScope?.includes('Kiên Giang') || meta.targetScope?.includes('Phú Quốc'),
      );
      expect(containsTarget).toBe(true);
    });

    it('[TC-57.4e/MSS][UC-039] CC_FREE_CREDIT: effectDetail hoặc destination ghi rõ nộp lãi 400 Tr. khi qua ô GO', () => {
      const meta = getChanceMeta(ChanceCardId.CC_FREE_CREDIT);
      const text = `${meta.effectDetail ?? ''} ${meta.destination ?? ''}`;
      expect(text).toMatch(/400/);
      expect(text.toLowerCase()).toMatch(/lãi/);
      expect(text).toMatch(/GO|Khởi Hành/i);
    });

    it('[TC-57.4f/MSS][UC-039] CC_OVERDRAFT: effectDetail hoặc destination ghi rõ hoàn trả 3.300 Tr. sau 3 vòng', () => {
      const meta = getChanceMeta(ChanceCardId.CC_OVERDRAFT);
      const text = `${meta.effectDetail ?? ''} ${meta.destination ?? ''}`;
      expect(text).toMatch(/3[\.,]?300/);
      expect(text.toLowerCase()).toMatch(/hoàn trả|trả/);
      expect(text).toMatch(/3\s*vòng/i);
    });

    it('[TC-57.4g/MSS][UC-038] MC_FIRE_INSPECTION: Phạt C1: 200 Tr., C2: 400 Tr., C3: 800 Tr., Đất trống Cấp 0 miễn phạt', () => {
      const meta = getMarketMeta(MarketCardId.MC_FIRE_INSPECTION);
      expect(meta.effectDetail).toMatch(/200.*C1/i);
      expect(meta.effectDetail).toMatch(/400.*C2/i);
      expect(meta.effectDetail).toMatch(/800.*C3/i);
      expect(meta.effectDetail).toMatch(/Miễn phạt/i);
    });

    it('[TC-57.4h/MSS][UC-038] MC_PUBLIC_INVEST: Chi trả 1.000 Tr. cho mỗi ô Hạ tầng giao thông sở hữu', () => {
      const meta = getMarketMeta(MarketCardId.MC_PUBLIC_INVEST);
      expect(meta.effectDetail).toMatch(/1[\.,]?000/);
      expect(meta.targetScope).toMatch(/Hạ tầng giao thông/i);
    });

    it('[TC-57.4i/MSS][UC-038] MC_ALCOHOL_CHECK: Kéo dài 2 vòng chơi và giảm 50% tiền thuê ô Dịch vụ', () => {
      const meta = getMarketMeta(MarketCardId.MC_ALCOHOL_CHECK);
      expect(meta.duration).toMatch(/2\s*vòng/i);
      expect(meta.effectDetail).toMatch(/50%/);
      expect(meta.targetScope).toMatch(/Dịch vụ/i);
    });

    it('[TC-57.4j/MSS][UC-039] CC_CONTRACT_PENALTY: Nộp phạt 1.000 Tr. chuyển cho người nghèo nhất', () => {
      const meta = getChanceMeta(ChanceCardId.CC_CONTRACT_PENALTY);
      const text = `${meta.effectDetail ?? ''} ${meta.destination ?? ''}`;
      expect(text).toMatch(/1[\.,]?000/);
      expect(text.toLowerCase()).toMatch(/nghèo nhất/);
    });

    it('[TC-57.4k/MSS][UC-039] CC_TAX_AUDIT: Nộp phạt 200 Tr. cho mỗi ô đất trống Cấp 0 chưa xây dựng', () => {
      const meta = getChanceMeta(ChanceCardId.CC_TAX_AUDIT);
      expect(meta.effectDetail).toMatch(/200/);
      expect(meta.effectDetail).toMatch(/Cấp 0/i);
      expect(meta.destination).toMatch(/Kho Bạc/i);
    });
  });
});
