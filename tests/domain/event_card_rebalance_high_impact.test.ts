// [TC-IMP111.01..40/MSS][UC-038][UC-039][GAME-S04/MSS]
// Contract Test Suite: IMP-111 High-Impact Event Card Rebalancing
// Strict QA Contract: Immutable SSOT Specification for 11 Rebalanced Event Cards across Groups A, B, and C.
// Enforces Universal 4-Facet Behavioral Matrix & Point-of-Consumption Assertions.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createPlayer,
  createRoom,
  type Player,
  type Room,
  type MarketModifier,
} from '../../src/domain/room.js';
import {
  MarketCardId,
  ChanceCardId,
  SERVICE_CELLS,
  INFRA_CELLS,
  UTILITY_CELLS,
} from '../../src/domain/event_card_types.js';
import { executeMarketCard, executeChanceCard } from '../../src/domain/card_handlers.js';
import {
  getMarketCardInfo,
  getChanceCardInfo,
  MARKET_CARD_DETAILS,
  CHANCE_CARD_DETAILS,
} from '../../src/domain/event_card_metadata.js';
import {
  handleLanding,
  LandingResult,
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/domain/property_manager.js';
import { executeP2PTrade } from '../../src/server/property_actions.js';

// Type-safe runner for executeChanceCard with optional 8th room argument
const runChanceCard = executeChanceCard as (
  card: ChanceCardId,
  playerId: string,
  players: Player[],
  activeModifiers?: MarketModifier[],
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
  permanentRentBonus?: Record<number, number>,
  room?: Room,
) => Record<string, never>;

describe('[CONTRACT-TEST] IMP-111: Event Card Rebalance & High-Impact Overhaul', () => {
  let room: Room;
  let p1: Player;
  let p2: Player;
  let p3: Player;
  let p4: Player;
  let registry: PropertyRegistry;
  let stateMap: PropertyStateMap;
  let modifiers: MarketModifier[];

  beforeEach(() => {
    room = createRoom('player-alpha');
    p1 = room.players[0]!;
    p1.balance = 15_000;
    p2 = createPlayer('player-beta');
    p2.balance = 15_000;
    p3 = createPlayer('player-gamma');
    p3.balance = 12_000;
    p4 = createPlayer('player-delta');
    p4.balance = 8_000;
    room.players = [p1, p2, p3, p4];
    room.treasury = 10_000;
    room.activeModifiers = [];
    modifiers = room.activeModifiers;
    registry = new Map();
    stateMap = new Map();
  });

  // ===========================================================================
  // FACET 1: Boundary & Range (Nhóm A - Tăng Lực Các Con Số Quá Nhỏ)
  // ===========================================================================
  describe('Facet 1: Boundary & Range — Group A Enhanced Numeric Scaling', () => {
    // --- Chốt A1: CC_COPYRIGHT (-1.200 Tr.) ---
    it('[TC-IMP111.01/MSS][UC-039] CC_COPYRIGHT: Metadata effectDelta phải là -1200 và effectDetail mô tả 1.200 Tr.', () => {
      const meta = getChanceCardInfo(ChanceCardId.CC_COPYRIGHT);
      const detail = CHANCE_CARD_DETAILS[ChanceCardId.CC_COPYRIGHT];
      expect(meta.effectDelta).toBe(-1200);
      expect(detail.effectDelta).toBe(-1200);
      expect(meta.effectDetail).toMatch(/1[\.,]?200/);
      expect(meta.destination).toMatch(/Kho Bạc/i);
    });

    it('[TC-IMP111.02/MSS][UC-039] CC_COPYRIGHT: Khấu trừ đúng 1.200 Tr. khỏi số dư người rút thẻ', () => {
      const startBal = p1.balance;
      runChanceCard(ChanceCardId.CC_COPYRIGHT, p1.id, room.players, modifiers, registry, stateMap, {}, room);
      expect(p1.balance).toBe(startBal - 1200);
    });

    // --- Chốt A2: CC_FRANCHISE (800 Tr. / đối thủ) ---
    it('[TC-IMP111.03/MSS][UC-039] CC_FRANCHISE: Metadata effectDetail phải nêu rõ thu phí 800 Tr. từ mỗi đối thủ', () => {
      const meta = getChanceCardInfo(ChanceCardId.CC_FRANCHISE);
      expect(meta.effectDetail).toMatch(/800/);
    });

    it('[TC-IMP111.04/MSS][UC-039] CC_FRANCHISE: Bàn 4 người (3 đối thủ) trừ mỗi đối thủ 800 Tr. và cộng 2.400 Tr. cho người rút', () => {
      const [b1, b2, b3, b4] = [p1.balance, p2.balance, p3.balance, p4.balance];
      runChanceCard(ChanceCardId.CC_FRANCHISE, p1.id, room.players, modifiers, registry, stateMap, {}, room);
      expect(p2.balance).toBe(b2 - 800);
      expect(p3.balance).toBe(b3 - 800);
      expect(p4.balance).toBe(b4 - 800);
      expect(p1.balance).toBe(b1 + 2400);
    });

    it('[TC-IMP111.05/MSS][UC-039] CC_FRANCHISE: Bàn 2 người (1 đối thủ) trừ đúng 800 Tr. và người rút nhận đúng 800 Tr.', () => {
      const twoPlayers = [p1, p2];
      const [b1, b2] = [p1.balance, p2.balance];
      runChanceCard(ChanceCardId.CC_FRANCHISE, p1.id, twoPlayers, modifiers, registry, stateMap, {}, room);
      expect(p2.balance).toBe(b2 - 800);
      expect(p1.balance).toBe(b1 + 800);
    });

    // --- Chốt A3: CC_TAX_AUDIT (500 Tr. / ô đất Cấp 0) ---
    it('[TC-IMP111.06/MSS][UC-039] CC_TAX_AUDIT: Metadata effectDetail phải xác nhận mức phạt 500 Tr. cho mỗi ô Cấp 0', () => {
      const meta = getChanceCardInfo(ChanceCardId.CC_TAX_AUDIT);
      expect(meta.effectDetail).toMatch(/500/);
      expect(meta.destination).toMatch(/Kho Bạc/i);
    });

    it('[TC-IMP111.07/MSS][UC-039] CC_TAX_AUDIT: Sở hữu 3 ô đất trống Cấp 0 bị phạt đúng 1.500 Tr. (3 x 500)', () => {
      registry.set(1, p1.id);
      registry.set(3, p1.id);
      registry.set(6, p1.id);
      const startBal = p1.balance;
      runChanceCard(ChanceCardId.CC_TAX_AUDIT, p1.id, room.players, modifiers, registry, stateMap, {}, room);
      expect(p1.balance).toBe(startBal - 1500);
    });

    it('[TC-IMP111.08/MSS][UC-039] CC_TAX_AUDIT: Sở hữu 0 ô đất trống Cấp 0 (đều đã xây C1+ hoặc không có đất) thì phạt 0 Tr.', () => {
      registry.set(1, p1.id);
      stateMap.set(1, { level: 1 });
      registry.set(3, p1.id);
      stateMap.set(3, { level: 2 });
      const startBal = p1.balance;
      runChanceCard(ChanceCardId.CC_TAX_AUDIT, p1.id, room.players, modifiers, registry, stateMap, {}, room);
      expect(p1.balance).toBe(startBal);
    });

    it('[TC-IMP111.09/MSS][UC-039] CC_TAX_AUDIT: Ô Hạ Tầng (5) và Tiện Ích (12) không bị tính là đất trống đô thị', () => {
      registry.set(5, p1.id);
      registry.set(12, p1.id);
      const startBal = p1.balance;
      runChanceCard(ChanceCardId.CC_TAX_AUDIT, p1.id, room.players, modifiers, registry, stateMap, {}, room);
      expect(p1.balance).toBe(startBal);
    });
  });

  // ===========================================================================
  // FACET 2: State Reactivity & No-Op Elimination (Nhóm B)
  // ===========================================================================
  describe('Facet 2: State Reactivity — Group B No-Op Elimination & Direct Actions', () => {
    // --- Chốt B1: MC_CASINO_PILOT ---
    it('[TC-IMP111.10/MSS][UC-038] MC_CASINO_PILOT: Metadata mô tả thưởng 1.500 Tr. cho C2+, 3.000 Tr. cho ô 27 C3 và gói kích cầu 1.000 Tr.', () => {
      const meta = getMarketCardInfo(MarketCardId.MC_CASINO_PILOT);
      expect(meta.effectDetail).toMatch(/1[\.,]?500/);
      expect(meta.effectDetail).toMatch(/3[\.,]?000/);
      expect(meta.effectDetail).toMatch(/1[\.,]?000/);
    });

    it('[TC-IMP111.11/MSS][UC-038] MC_CASINO_PILOT: Chủ sở hữu ô Dịch Vụ 6 đạt Cấp 2 nhận ngay 1.500 Tr. cổ tức', () => {
      registry.set(6, p1.id);
      stateMap.set(6, { level: 2 });
      const startBal = p1.balance;
      executeMarketCard(MarketCardId.MC_CASINO_PILOT, modifiers, room.players, registry, stateMap, room);
      expect(p1.balance).toBe(startBal + 1500);
    });

    it('[TC-IMP111.12/MSS][UC-038] MC_CASINO_PILOT: Chủ sở hữu ô 27 (Phú Quốc) đạt Cấp 3 nhận mức thưởng kịch trần 3.000 Tr.', () => {
      registry.set(27, p2.id);
      stateMap.set(27, { level: 3 });
      const startBal = p2.balance;
      executeMarketCard(MarketCardId.MC_CASINO_PILOT, modifiers, room.players, registry, stateMap, room);
      expect(p2.balance).toBe(startBal + 3000);
    });

    it('[TC-IMP111.13/MSS][UC-038] MC_CASINO_PILOT: Sở hữu đồng thời 2 ô Dịch Vụ C2 (ô 8 và ô 26) nhận tổng cộng 3.000 Tr. (1.500 x 2)', () => {
      registry.set(8, p1.id);
      stateMap.set(8, { level: 2 });
      registry.set(26, p1.id);
      stateMap.set(26, { level: 2 });
      const startBal = p1.balance;
      executeMarketCard(MarketCardId.MC_CASINO_PILOT, modifiers, room.players, registry, stateMap, room);
      expect(p1.balance).toBe(startBal + 3000);
    });

    it('[TC-IMP111.14/MSS][UC-038] MC_CASINO_PILOT: Fallback kích hoạt — khi không có ô Dịch Vụ nào đạt C2+, người nghèo nhất nhận 1.000 Tr.', () => {
      // P4 là người có số dư thấp nhất bàn cờ (8.000 Tr.)
      const [b1, b2, b3, b4] = [p1.balance, p2.balance, p3.balance, p4.balance];
      executeMarketCard(MarketCardId.MC_CASINO_PILOT, modifiers, room.players, registry, stateMap, room);
      expect(p4.balance).toBe(b4 + 1000);
      expect(p1.balance).toBe(b1);
      expect(p2.balance).toBe(b2);
      expect(p3.balance).toBe(b3);
    });

    // --- Chốt B2: CC_VENUE_INCIDENT ---
    it('[TC-IMP111.15/MSS][UC-039] CC_VENUE_INCIDENT: Metadata nêu rõ phạt 1.200 Tr. nếu có ô Dịch Vụ và 600 Tr. nếu không có ô Dịch Vụ', () => {
      const meta = getChanceCardInfo(ChanceCardId.CC_VENUE_INCIDENT);
      expect(meta.effectDetail).toMatch(/1[\.,]?200/);
      expect(meta.effectDetail).toMatch(/600/);
    });

    it('[TC-IMP111.16/MSS][UC-039] CC_VENUE_INCIDENT: Người chơi sở hữu ô Dịch Vụ (ô 8) bị phạt 1.200 Tr.', () => {
      registry.set(8, p1.id);
      const startBal = p1.balance;
      runChanceCard(ChanceCardId.CC_VENUE_INCIDENT, p1.id, room.players, modifiers, registry, stateMap, {}, room);
      expect(p1.balance).toBe(startBal - 1200);
    });

    it('[TC-IMP111.17/MSS][UC-039] CC_VENUE_INCIDENT: Người chơi KHÔNG sở hữu ô Dịch Vụ nào vẫn bị phạt 600 Tr. bảo an (Triệt tiêu No-op)', () => {
      registry.set(1, p1.id); // Ô 1 là BĐS thông thường, không phải Dịch Vụ
      const startBal = p1.balance;
      runChanceCard(ChanceCardId.CC_VENUE_INCIDENT, p1.id, room.players, modifiers, registry, stateMap, {}, room);
      expect(p1.balance).toBe(startBal - 600);
    });

    // --- Chốt B3: MC_ANTI_SPECULATE ---
    it('[TC-IMP111.18/MSS][UC-038] MC_ANTI_SPECULATE: Metadata nêu rõ tăng thuế P2P lên 20% và phạt ngay 1.000 Tr. cho người sở hữu từ 4 ô đất', () => {
      const meta = getMarketCardInfo(MarketCardId.MC_ANTI_SPECULATE);
      expect(meta.effectDetail).toMatch(/20%/);
      expect(meta.effectDetail).toMatch(/1[\.,]?000/);
    });

    it('[TC-IMP111.19/MSS][UC-038] MC_ANTI_SPECULATE: Người chơi sở hữu từ 4 ô đất trở lên lập tức bị phạt nộp 1.000 Tr. thuế tài sản', () => {
      registry.set(1, p1.id);
      registry.set(3, p1.id);
      registry.set(6, p1.id);
      registry.set(8, p1.id);
      const startBal = p1.balance;
      executeMarketCard(MarketCardId.MC_ANTI_SPECULATE, modifiers, room.players, registry, stateMap, room);
      expect(p1.balance).toBe(startBal - 1000);
    });

    it('[TC-IMP111.20/MSS][UC-038] MC_ANTI_SPECULATE: Người chơi sở hữu ít hơn 4 ô đất (3 ô) không bị phạt nộp thuế tài sản tức thì', () => {
      registry.set(1, p2.id);
      registry.set(3, p2.id);
      registry.set(6, p2.id);
      const startBal = p2.balance;
      executeMarketCard(MarketCardId.MC_ANTI_SPECULATE, modifiers, room.players, registry, stateMap, room);
      expect(p2.balance).toBe(startBal);
    });

    it('[TC-IMP111.21/MSS][UC-038] MC_ANTI_SPECULATE: Kích hoạt modifier MC_ANTI_SPECULATE với thời hạn 1 vòng', () => {
      executeMarketCard(MarketCardId.MC_ANTI_SPECULATE, modifiers, room.players, registry, stateMap, room);
      const mod = modifiers.find((m) => m.type === MarketCardId.MC_ANTI_SPECULATE);
      expect(mod).toBeDefined();
      expect(mod?.remainingRounds).toBe(1);
    });

    // --- Chốt B4: CC_SWAP_PROJECT ---
    it('[TC-IMP111.22/MSS][UC-039] CC_SWAP_PROJECT: Mua lại ô C0 của đối thủ đền bù 130%', () => {
      registry.set(1, p1.id); // Ô 1: Nhóm Nâu, Cấp 0
      registry.set(6, p2.id); // Ô 6: Nhóm Đỏ/Dịch vụ, Cấp 0 (Khác màu)
      stateMap.set(1, { level: 0 });
      stateMap.set(6, { level: 0 });

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, modifiers, registry, stateMap, {});
      expect(registry.get(1)).toBe(p1.id);
      expect(registry.get(6)).toBe(p1.id);
    });

    it('[TC-IMP111.23/MSS][UC-039] CC_SWAP_PROJECT: Từ chối mua lại nếu ô đất đối thủ đã nâng cấp lên Cấp 1 trở lên (chỉ mua lại C0)', () => {
      registry.set(1, p1.id);
      registry.set(6, p2.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(6, { level: 1 }); // Đã xây C1 -> Không được hoán đổi

      runChanceCard(ChanceCardId.CC_SWAP_PROJECT, p1.id, room.players, modifiers, registry, stateMap, {});
      expect(registry.get(1)).toBe(p1.id);
      expect(registry.get(6)).toBe(p2.id);
    });
  });

  // ===========================================================================
  // FACET 3: Resource Disposal & Cash Flow Conservation (Nhóm C)
  // ===========================================================================
  describe('Facet 3: Resource Disposal & Invariant Conservation — Group C Cash Flow', () => {
    // --- Chốt C1: MC_UTILITY_DOUBLE ---
    it('[TC-IMP111.24/MSS][UC-038] MC_UTILITY_DOUBLE: Metadata mô tả nhân đôi phí tiện ích trong 2 vòng và nộp 400 Tr. cước tức thì', () => {
      const meta = getMarketCardInfo(MarketCardId.MC_UTILITY_DOUBLE);
      expect(meta.duration).toMatch(/2\s*vòng/i);
      expect(meta.effectDetail).toMatch(/400/);
    });

    it('[TC-IMP111.25/MSS][UC-038] MC_UTILITY_DOUBLE: Kích hoạt modifier với remainingRounds = 2 và multiplier = 2 trên UTILITY_CELLS', () => {
      executeMarketCard(MarketCardId.MC_UTILITY_DOUBLE, modifiers, room.players, registry, stateMap, room);
      const mod = modifiers.find((m) => m.type === MarketCardId.MC_UTILITY_DOUBLE);
      expect(mod?.remainingRounds).toBe(2);
      expect(mod?.multiplier).toBe(2);
      expect(mod?.affectedCells).toEqual(UTILITY_CELLS);
    });

    it('[TC-IMP111.26/MSS][UC-038] MC_UTILITY_DOUBLE: Hiệu ứng tức thì — mọi người chơi nộp 400 Tr.; chưa ai sở hữu ô 12 & 28 thì nộp đủ vào Kho Bạc', () => {
      const initialTreasury = room.treasury;
      const startBals = room.players.map((p) => p.balance);
      executeMarketCard(MarketCardId.MC_UTILITY_DOUBLE, modifiers, room.players, registry, stateMap, room);

      // 4 người chơi x 400 Tr. = 1.600 Tr. vào Kho Bạc
      expect(p1.balance).toBe(startBals[0]! - 400);
      expect(p2.balance).toBe(startBals[1]! - 400);
      expect(room.treasury).toBe(initialTreasury + 1600);
    });

    it('[TC-IMP111.27/MSS][UC-038] MC_UTILITY_DOUBLE: Hiệu ứng tức thì — P1 sở hữu ô 12 (EVN), P1 nhận 200 Tr./người và Kho Bạc nhận 200 Tr./người', () => {
      registry.set(12, p1.id);
      const initialTreasury = room.treasury;
      const [b1, b2, b3, b4] = [p1.balance, p2.balance, p3.balance, p4.balance];
      executeMarketCard(MarketCardId.MC_UTILITY_DOUBLE, modifiers, room.players, registry, stateMap, room);

      // Mỗi người nộp 400 Tr. P1 nhận 200 x 4 = 800 Tr., nhưng P1 cũng nộp 400 Tr. -> Net delta của P1 = +400 Tr.
      // Kho Bạc nhận 200 x 4 = 800 Tr.
      expect(p1.balance).toBe(b1 - 400 + 800);
      expect(p2.balance).toBe(b2 - 400);
      expect(room.treasury).toBe(initialTreasury + 800);
    });

    it('[TC-IMP111.28/MSS][UC-038] MC_UTILITY_DOUBLE: Đẳng thức bảo toàn dòng tiền — Tổng tiền trừ từ người chơi = Tổng tiền chủ sở hữu nhận + Kho Bạc nhận', () => {
      registry.set(12, p1.id);
      registry.set(28, p2.id);
      const totalStartCash = room.players.reduce((acc, p) => acc + p.balance, 0) + room.treasury;
      executeMarketCard(MarketCardId.MC_UTILITY_DOUBLE, modifiers, room.players, registry, stateMap, room);
      const totalEndCash = room.players.reduce((acc, p) => acc + p.balance, 0) + room.treasury;
      expect(totalEndCash).toBe(totalStartCash);
    });

    // --- Chốt C2: MC_FUEL_SURGE ---
    it('[TC-IMP111.29/MSS][UC-038] MC_FUEL_SURGE: Metadata mô tả phụ thu cước trong 2 vòng và nộp 500 Tr. phụ phí nhiên liệu tức thì', () => {
      const meta = getMarketCardInfo(MarketCardId.MC_FUEL_SURGE);
      expect(meta.duration).toMatch(/2\s*vòng/i);
      expect(meta.effectDetail).toMatch(/500/);
    });

    it('[TC-IMP111.30/MSS][UC-038] MC_FUEL_SURGE: Kích hoạt modifier với remainingRounds = 2 trên INFRA_CELLS', () => {
      executeMarketCard(MarketCardId.MC_FUEL_SURGE, modifiers, room.players, registry, stateMap, room);
      const mod = modifiers.find((m) => m.type === MarketCardId.MC_FUEL_SURGE);
      expect(mod?.remainingRounds).toBe(2);
      expect(mod?.affectedCells).toEqual(INFRA_CELLS);
    });

    it('[TC-IMP111.31/MSS][UC-038] MC_FUEL_SURGE: Hiệu ứng tức thì — mỗi người nộp 500 Tr. (125 Tr./ô hạ tầng); P1 sở hữu 2 ô nhận 250 Tr./người, Kho Bạc nhận 250 Tr./người', () => {
      registry.set(5, p1.id);
      registry.set(15, p1.id);
      const initialTreasury = room.treasury;
      const [b1, b2] = [p1.balance, p2.balance];
      executeMarketCard(MarketCardId.MC_FUEL_SURGE, modifiers, room.players, registry, stateMap, room);

      // 4 người chơi x 500 Tr. = 2.000 Tr. P1 sở hữu 2/4 ô hạ tầng -> nhận 50% = 1.000 Tr. (net: -500 + 1000 = +500 Tr.)
      // Kho Bạc nhận 50% còn lại = 1.000 Tr.
      expect(p1.balance).toBe(b1 - 500 + 1000);
      expect(p2.balance).toBe(b2 - 500);
      expect(room.treasury).toBe(initialTreasury + 1000);
    });

    it('[TC-IMP111.32/MSS][UC-038] MC_FUEL_SURGE: Đẳng thức bảo toàn dòng tiền — Tổng tiền người chơi và Kho Bạc trước và sau hoàn toàn không đổi', () => {
      registry.set(5, p1.id);
      registry.set(15, p2.id);
      registry.set(25, p3.id);
      const totalStart = room.players.reduce((acc, p) => acc + p.balance, 0) + room.treasury;
      executeMarketCard(MarketCardId.MC_FUEL_SURGE, modifiers, room.players, registry, stateMap, room);
      const totalEnd = room.players.reduce((acc, p) => acc + p.balance, 0) + room.treasury;
      expect(totalEnd).toBe(totalStart);
    });

    // --- Chốt C3: CC_PORT_EXCLUSIVE ---
    it('[TC-IMP111.33/MSS][UC-039] CC_PORT_EXCLUSIVE: Người rút nhận ngay 1.000 Tr. cổ tức logistics giải ngân từ Kho Bạc', () => {
      const startBal = p1.balance;
      const startTreasury = room.treasury;
      runChanceCard(ChanceCardId.CC_PORT_EXCLUSIVE, p1.id, room.players, modifiers, registry, stateMap, {}, room);
      expect(p1.balance).toBe(startBal + 1000);
      expect(room.treasury).toBe(startTreasury - 1000);
    });

    it('[TC-IMP111.34/MSS][UC-039] CC_PORT_EXCLUSIVE: Tạo modifier với remainingRounds = 2, multiplier = 0.5 và beneficiaryId là người rút', () => {
      runChanceCard(ChanceCardId.CC_PORT_EXCLUSIVE, p1.id, room.players, modifiers, registry, stateMap, {}, room);
      expect(modifiers[0]).toEqual({
        type: ChanceCardId.CC_PORT_EXCLUSIVE,
        affectedCells: INFRA_CELLS,
        remainingRounds: 2,
        multiplier: 0.5,
        beneficiaryId: p1.id,
      });
    });

    // --- Chốt C4: CC_BUILD_HALT & CC_MEDIA_CRISIS ---
    it('[TC-IMP111.35/MSS][UC-039] CC_BUILD_HALT: Phạt ngay chủ sở hữu 800 Tr. nộp Kho Bạc và phong tỏa 1 ô đất trong 2 vòng', () => {
      registry.set(1, p1.id);
      const startBal = p1.balance;
      const startTreasury = room.treasury;
      runChanceCard(ChanceCardId.CC_BUILD_HALT, p1.id, room.players, modifiers, registry, stateMap, {}, room);
      expect(p1.balance).toBe(startBal - 800);
      expect(room.treasury).toBe(startTreasury + 800);
      const mod = modifiers.find((m) => m.type === MarketCardId.MC_COASTAL_STORM && m.affectedCells.includes(1));
      expect(mod?.remainingRounds).toBe(2);
      expect(mod?.multiplier).toBe(0);
    });

    it('[TC-IMP111.36/MSS][UC-039] CC_MEDIA_CRISIS: Phạt ngay chủ sở hữu 800 Tr. nộp Kho Bạc và phong tỏa ô Dịch Vụ trong 2 vòng (thay vì 1 vòng)', () => {
      registry.set(6, p1.id); // Ô 6 Dịch vụ
      const startBal = p1.balance;
      const startTreasury = room.treasury;
      runChanceCard(ChanceCardId.CC_MEDIA_CRISIS, p1.id, room.players, modifiers, registry, stateMap, {}, room);
      expect(p1.balance).toBe(startBal - 800);
      expect(room.treasury).toBe(startTreasury + 800);
      const mod = modifiers.find((m) => m.type === MarketCardId.MC_COASTAL_STORM && m.affectedCells.includes(6));
      expect(mod?.remainingRounds).toBe(2);
      expect(mod?.multiplier).toBe(0);
    });
  });

  // ===========================================================================
  // FACET 4: Error Defense & Point-of-Consumption Execution
  // ===========================================================================
  describe('Facet 4: Error Defense & Consumer Execution at Point of Effect', () => {
    it('[TC-IMP111.37/MSS][UC-038] Consumer Assertion: MC_ANTI_SPECULATE áp dụng thuế 20% khi thực hiện giao dịch P2P', () => {
      registry.set(1, p1.id); // P1 bán ô 1 giá 1.000 Tr. cho P2
      room.started = true;
      executeMarketCard(MarketCardId.MC_ANTI_SPECULATE, modifiers, room.players, registry, stateMap, room);

      const treasuryBefore = room.treasury;
      const p1Before = p1.balance;
      const res = executeP2PTrade(room, p1.id, p2.id, 1, 1000, registry, stateMap);
      expect(res.success).toBe(true);
      // Thuế 20% của 1.000 Tr. là 200 Tr. nộp Kho Bạc; người bán nhận 800 Tr.
      expect(room.treasury).toBe(treasuryBefore + 200);
      expect(p1.balance).toBe(p1Before + 800);
    });

    it('[TC-IMP111.38/MSS][UC-038] Consumer Assertion: MC_UTILITY_DOUBLE nhân đôi phí tiện ích khi đối thủ dừng chân tại ô EVN (12)', () => {
      registry.set(12, p1.id);
      executeMarketCard(MarketCardId.MC_UTILITY_DOUBLE, modifiers, room.players, registry, stateMap, room);

      // Điểm xúc xắc 8: Tiện ích cơ bản = 8 x 100 = 800 Tr. x 2 (modifier) = 1.600 Tr.
      const res = handleLanding(p2, 12, registry, room.players, stateMap, 8, modifiers);
      expect(res.result).toBe(LandingResult.RentPaid);
      expect(res.rentAmount).toBe(1600);
    });

    it('[TC-IMP111.39/MSS][UC-038] Consumer Assertion: MC_FUEL_SURGE cộng đúng 500 Tr. phụ phí vận tải khi dừng chân tại Cảng Long Thành (5)', () => {
      registry.set(5, p1.id);
      executeMarketCard(MarketCardId.MC_FUEL_SURGE, modifiers, room.players, registry, stateMap, room);

      // Base fee ô 5 là 500 Tr. + 500 Tr. fuel surge = 1.000 Tr.
      const res = handleLanding(p2, 5, registry, room.players, stateMap, 7, modifiers);
      expect(res.result).toBe(LandingResult.RentPaid);
      expect(res.rentAmount).toBe(1000);
    });

    it('[TC-IMP111.40a/MSS][UC-039] Consumer Assertion: CC_PORT_EXCLUSIVE tính đúng tiền thuê Cảng khi đối thủ dừng chân', () => {
      registry.set(5, p1.id); // P1 sở hữu ô 5
      runChanceCard(ChanceCardId.CC_PORT_EXCLUSIVE, p3.id, room.players, modifiers, registry, stateMap, {}, room); // P3 rút thẻ

      const res = handleLanding(p2, 5, registry, room.players, stateMap, 7, modifiers);
      expect(res.result).toBe(LandingResult.RentPaid);
      expect(res.rentAmount).toBe(500);
    });

    it('[TC-IMP111.40b/MSS][UC-039] Consumer Assertion: CC_PORT_EXCLUSIVE chia 50% tiền thuê Cảng cho người rút thẻ và 50% cho chủ ô', () => {
      registry.set(5, p1.id); // P1 sở hữu ô 5
      runChanceCard(ChanceCardId.CC_PORT_EXCLUSIVE, p3.id, room.players, modifiers, registry, stateMap, {}, room); // P3 rút thẻ

      const [p1B, p2B, p3B] = [p1.balance, p2.balance, p3.balance];
      handleLanding(p2, 5, registry, room.players, stateMap, 7, modifiers);
      expect(p2.balance).toBe(p2B - 500);
      expect(p1.balance).toBe(p1B + 250); // Chủ nhận 50%
      expect(p3.balance).toBe(p3B + 250); // Beneficiary nhận 50%
    });
  });
});
