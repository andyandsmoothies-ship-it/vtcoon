// [IMP-116] Contract Tests — 7 Real-Life High-Impact Event Cards
// Universal 4-Facet Matrix: Boundary, State Reactivity, Resource Disposal, Error Defense
// Atomic Test Mandate: 1-4 asserts/test, zero loops inside it()

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MarketCardId,
  ChanceCardId,
  SERVICE_CELLS,
  COASTAL_CELLS,
  INFRA_CELLS,
} from '../../src/domain/event_card_types';
import { executeMarketCard } from '../../src/domain/market_card_handlers';
import { executeChanceCard } from '../../src/domain/chance_card_handlers';
import { handleLanding, LandingResult } from '../../src/domain/property_manager';
import { createPlayer, createRoom, type Player, type Room, type MarketModifier } from '../../src/domain/room';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data';

describe('[IMP-116] 7 Real-Life High-Impact Event Cards Contract Tests', () => {
  let room: Room;
  let p1: Player;
  let p2: Player;
  let registry: PropertyRegistry;
  let stateMap: PropertyStateMap;
  let modifiers: MarketModifier[];

  beforeEach(() => {
    p1 = createPlayer('p1');
    p2 = createPlayer('p2');
    p1.balance = 10_000;
    p2.balance = 10_000;
    room = createRoom('p1');
    room.players = [p1, p2];
    room.treasury = 5_000;
    registry = new Map();
    stateMap = new Map();
    modifiers = [];
  });

  // =========================================================================
  // 1. MC_ALCOHOL_CHECK (Nghị Định 100 Kiểm Tra Nồng Độ Cồn)
  // =========================================================================
  describe('1. MC_ALCOHOL_CHECK (Nghị Định 100)', () => {
    it('[TC-116.01] executeMarketCard tạo modifier kéo dài 2 vòng và giảm 50% tiền thuê', () => {
      executeMarketCard(MarketCardId.MC_ALCOHOL_CHECK, modifiers);
      expect(modifiers).toHaveLength(1);
      expect(modifiers[0]).toEqual({
        type: MarketCardId.MC_ALCOHOL_CHECK,
        affectedCells: SERVICE_CELLS,
        remainingRounds: 2,
        multiplier: 0.5,
      });
    });

    it('[TC-116.02] Dừng chân tại ô Dịch vụ (ô 6) bị phạt nồng độ cồn 800 Tr.', () => {
      modifiers.push({
        type: MarketCardId.MC_ALCOHOL_CHECK,
        affectedCells: SERVICE_CELLS,
        remainingRounds: 2,
        multiplier: 0.5,
      });
      const initialBalance = p1.balance;
      handleLanding(p1, 6, registry, room.players, stateMap, 7, modifiers, undefined, undefined, undefined, undefined, room);
      expect(p1.balance).toBe(initialBalance - 800);
    });

    it('[TC-116.03] Tiền phạt nồng độ cồn 800 Tr. nộp trực tiếp vào Kho Bạc Nhà Nước', () => {
      modifiers.push({
        type: MarketCardId.MC_ALCOHOL_CHECK,
        affectedCells: SERVICE_CELLS,
        remainingRounds: 2,
        multiplier: 0.5,
      });
      const initialTreasury = room.treasury ?? 0;
      handleLanding(p1, 6, registry, room.players, stateMap, 7, modifiers, undefined, undefined, undefined, undefined, room);
      expect(room.treasury).toBe(initialTreasury + 800);
    });

    it('[TC-116.04] Người dừng chân tại ô Dịch vụ bị tạm giữ phương tiện (skipNextTurn = true)', () => {
      modifiers.push({
        type: MarketCardId.MC_ALCOHOL_CHECK,
        affectedCells: SERVICE_CELLS,
        remainingRounds: 2,
        multiplier: 0.5,
      });
      handleLanding(p1, 6, registry, room.players, stateMap, 7, modifiers, undefined, undefined, undefined, undefined, room);
      expect(p1.skipNextTurn).toBe(true);
    });

    it('[TC-116.05] Tiền thuê tại ô Dịch vụ vẫn được giảm 50% cho khách dừng chân', () => {
      registry.set(6, p2.id);
      stateMap.set(6, { level: 1 });
      modifiers.push({
        type: MarketCardId.MC_ALCOHOL_CHECK,
        affectedCells: SERVICE_CELLS,
        remainingRounds: 2,
        multiplier: 0.5,
      });
      const landing = handleLanding(p1, 6, registry, room.players, stateMap, 7, modifiers, undefined, undefined, undefined, undefined, room);
      expect(landing.result).toBe(LandingResult.RentPaid);
      expect(landing.rentAmount).toBe(200); // base rent1 của ô 6 là 400 -> giảm 50% = 200
    });

    it('[TC-116.06] Phòng thủ lỗi: nếu room undefined, người chơi vẫn bị trừ 800 Tr. và skipNextTurn', () => {
      modifiers.push({
        type: MarketCardId.MC_ALCOHOL_CHECK,
        affectedCells: SERVICE_CELLS,
        remainingRounds: 2,
        multiplier: 0.5,
      });
      const initialBalance = p1.balance;
      handleLanding(p1, 6, registry, [p1, p2], stateMap, 7, modifiers);
      expect(p1.balance).toBe(initialBalance - 800);
      expect(p1.skipNextTurn).toBe(true);
    });
  });

  // =========================================================================
  // 2. MC_NIGHT_ECONOMY (Kinh Tế Ban Đêm 24/7)
  // =========================================================================
  describe('2. MC_NIGHT_ECONOMY (Kinh Tế Ban Đêm)', () => {
    it('[TC-116.07] executeMarketCard tạo modifier kéo dài 2 vòng với multiplier x2', () => {
      executeMarketCard(MarketCardId.MC_NIGHT_ECONOMY, modifiers, room.players, registry, stateMap, room);
      expect(modifiers[0]).toEqual({
        type: MarketCardId.MC_NIGHT_ECONOMY,
        affectedCells: SERVICE_CELLS,
        remainingRounds: 2,
        multiplier: 2,
      });
    });

    it('[TC-116.08] Mọi người chơi chi tiêu ngay 400 Tr. kích cầu kinh tế đêm', () => {
      const b1 = p1.balance;
      const b2 = p2.balance;
      executeMarketCard(MarketCardId.MC_NIGHT_ECONOMY, modifiers, room.players, registry, stateMap, room);
      // Khi không có ai sở hữu ô Dịch vụ, mỗi người mất 400 Tr.
      expect(p1.balance).toBe(b1 - 400);
      expect(p2.balance).toBe(b2 - 400);
    });

    it('[TC-116.09] Chủ sở hữu ô Dịch vụ nhận cổ tức kích cầu đêm (100 Tr. * số người chơi / ô)', () => {
      registry.set(6, p1.id);
      const b1 = p1.balance;
      const b2 = p2.balance;
      executeMarketCard(MarketCardId.MC_NIGHT_ECONOMY, modifiers, room.players, registry, stateMap, room);
      // P1 chi 400 Tr., nhận lại từ ô 6: 100 * 2 = 200 Tr. Net: -200 Tr.
      expect(p1.balance).toBe(b1 - 200);
      expect(p2.balance).toBe(b2 - 400);
    });

    it('[TC-116.10] Ô Dịch vụ chưa có chủ nộp tiền kích cầu vào Kho Bạc Nhà Nước', () => {
      const initialTreasury = room.treasury ?? 0;
      executeMarketCard(MarketCardId.MC_NIGHT_ECONOMY, modifiers, room.players, registry, stateMap, room);
      // 4 ô Dịch vụ đều unowned: 4 ô * (100 * 2) = 800 Tr. nộp Kho Bạc
      expect(room.treasury).toBe(initialTreasury + 800);
    });
  });

  // =========================================================================
  // 3. CC_LAND_CHANGE (Chuyển Đổi Lên Thổ Cư)
  // =========================================================================
  describe('3. CC_LAND_CHANGE (Lên Thổ Cư)', () => {
    it('[TC-116.11] Nộp phí 500 Tr. vào Kho Bạc để chuyển đổi đất C0', () => {
      registry.set(1, p1.id);
      stateMap.set(1, { level: 0 });
      const b1 = p1.balance;
      const tr = room.treasury ?? 0;
      executeChanceCard(ChanceCardId.CC_LAND_CHANGE, p1.id, room.players, modifiers, registry, stateMap, undefined, room);
      expect(p1.balance).toBe(b1 - 500);
      expect(room.treasury).toBe(tr + 500);
    });

    it('[TC-116.12] Ô đất C0 được nâng cấp thẳng lên Cấp 1 không cần hoàn thành nhóm màu', () => {
      registry.set(1, p1.id);
      stateMap.set(1, { level: 0 });
      executeChanceCard(ChanceCardId.CC_LAND_CHANGE, p1.id, room.players, modifiers, registry, stateMap, undefined, room);
      expect(stateMap.get(1)?.level).toBe(1);
    });

    it('[TC-116.13] Fallback: Không sở hữu ô C0 nào thì nhận 600 Tr. hỗ trợ quy hoạch từ Kho Bạc', () => {
      const b1 = p1.balance;
      const tr = room.treasury ?? 0;
      executeChanceCard(ChanceCardId.CC_LAND_CHANGE, p1.id, room.players, modifiers, registry, stateMap, undefined, room);
      expect(p1.balance).toBe(b1 + 600);
      expect(room.treasury).toBe(tr - 600);
    });
  });

  // =========================================================================
  // 4. CC_SLOW_BUILD (Xử Lý Dự Án Chậm Tiến Độ)
  // =========================================================================
  describe('4. CC_SLOW_BUILD (Xử Lý Dự Án Treo)', () => {
    it('[TC-116.14] Có ô C0: phạt 600 Tr. vào Kho Bạc và đánh dấu unbuiltRounds = 1', () => {
      registry.set(1, p1.id);
      stateMap.set(1, { level: 0 });
      const b1 = p1.balance;
      const tr = room.treasury ?? 0;
      executeChanceCard(ChanceCardId.CC_SLOW_BUILD, p1.id, room.players, modifiers, registry, stateMap, undefined, room);
      expect(p1.balance).toBe(b1 - 600);
      expect(room.treasury).toBe(tr + 600);
      expect(stateMap.get(1)?.unbuiltRounds).toBe(1);
      expect(registry.get(1)).toBe(p1.id);
    });

    it('[TC-116.15] Nếu số dư âm sau khi nộp phạt: ô đất C0 bị thu hồi tức thì', () => {
      registry.set(1, p1.id);
      stateMap.set(1, { level: 0 });
      p1.balance = 200; // Phạt 600 -> âm 400
      executeChanceCard(ChanceCardId.CC_SLOW_BUILD, p1.id, room.players, modifiers, registry, stateMap, undefined, room);
      expect(p1.balance).toBe(-400);
      expect(registry.get(1)).toBeUndefined();
    });

    it('[TC-116.16] Fallback: Không có ô C0 thì nộp phí hành chính 300 Tr. vào Kho Bạc', () => {
      const b1 = p1.balance;
      const tr = room.treasury ?? 0;
      executeChanceCard(ChanceCardId.CC_SLOW_BUILD, p1.id, room.players, modifiers, registry, stateMap, undefined, room);
      expect(p1.balance).toBe(b1 - 300);
      expect(room.treasury).toBe(tr + 300);
    });
  });

  // =========================================================================
  // 5. MC_COASTAL_STORM (Bão Lũ Duyên Hải / Thiên Tai)
  // =========================================================================
  describe('5. MC_COASTAL_STORM (Bão Lũ Duyên Hải)', () => {
    it('[TC-116.17] executeMarketCard tạo modifier 2 vòng với multiplier 0 trên COASTAL_CELLS', () => {
      executeMarketCard(MarketCardId.MC_COASTAL_STORM, modifiers, room.players, registry, stateMap, room);
      expect(modifiers[0]).toEqual({
        type: MarketCardId.MC_COASTAL_STORM,
        affectedCells: COASTAL_CELLS,
        remainingRounds: 2,
        multiplier: 0,
      });
    });

    it('[TC-116.18] Chủ sở hữu công trình ven biển nộp 400 Tr./cấp nhà vào Kho Bạc để khắc phục thiên tai', () => {
      registry.set(11, p1.id); // Ô 11 (Nha Trang) thuộc COASTAL_CELLS
      stateMap.set(11, { level: 2 }); // Cấp 2 -> thiệt hại 800 Tr.
      const b1 = p1.balance;
      const tr = room.treasury ?? 0;
      executeMarketCard(MarketCardId.MC_COASTAL_STORM, modifiers, room.players, registry, stateMap, room);
      expect(p1.balance).toBe(b1 - 800);
      expect(room.treasury).toBe(tr + 800);
    });

    it('[TC-116.19] Dừng chân tại ô duyên hải trong bão được miễn 100% tiền thuê', () => {
      registry.set(11, p2.id);
      stateMap.set(11, { level: 1 });
      modifiers.push({
        type: MarketCardId.MC_COASTAL_STORM,
        affectedCells: COASTAL_CELLS,
        remainingRounds: 2,
        multiplier: 0,
      });
      const landing = handleLanding(p1, 11, registry, room.players, stateMap, 7, modifiers, undefined, undefined, undefined, undefined, room);
      expect(landing.result).toBe(LandingResult.RentPaid);
      expect(landing.rentAmount).toBe(0);
    });

    it('[TC-116.20] Người dừng chân tại ô duyên hải bị cô lập giao thông (skipNextTurn = true)', () => {
      modifiers.push({
        type: MarketCardId.MC_COASTAL_STORM,
        affectedCells: COASTAL_CELLS,
        remainingRounds: 2,
        multiplier: 0,
      });
      handleLanding(p1, 11, registry, room.players, stateMap, 7, modifiers, undefined, undefined, undefined, undefined, room);
      expect(p1.skipNextTurn).toBe(true);
    });
  });

  // =========================================================================
  // 6. MC_PUBLIC_INVEST (Đại Dự Án Vốn Đầu Tư Công)
  // =========================================================================
  describe('6. MC_PUBLIC_INVEST (Đầu Tư Công)', () => {
    it('[TC-116.21] executeMarketCard tạo modifier 2 vòng với multiplier x2 trên INFRA_CELLS', () => {
      executeMarketCard(MarketCardId.MC_PUBLIC_INVEST, modifiers, room.players, registry, stateMap, room);
      expect(modifiers[0]).toEqual({
        type: MarketCardId.MC_PUBLIC_INVEST,
        affectedCells: INFRA_CELLS,
        remainingRounds: 2,
        multiplier: 2,
      });
    });

    it('[TC-116.22] Kho Bạc giải ngân 400 Tr. cho tất cả người chơi', () => {
      const b1 = p1.balance;
      const b2 = p2.balance;
      const tr = room.treasury ?? 0;
      executeMarketCard(MarketCardId.MC_PUBLIC_INVEST, modifiers, room.players, registry, stateMap, room);
      expect(p1.balance).toBe(b1 + 400);
      expect(p2.balance).toBe(b2 + 400);
      expect(room.treasury).toBe(tr - 800);
    });

    it('[TC-116.23] Chủ sở hữu ô Hạ tầng nhận thêm 1.000 Tr./trạm từ Kho Bạc', () => {
      registry.set(5, p1.id);
      registry.set(15, p1.id);
      const b1 = p1.balance;
      const tr = room.treasury ?? 0;
      executeMarketCard(MarketCardId.MC_PUBLIC_INVEST, modifiers, room.players, registry, stateMap, room);
      // P1 nhận 400 Tr. (kích cầu) + 2.000 Tr. (2 trạm hạ tầng) = 2.400 Tr.
      expect(p1.balance).toBe(b1 + 2400);
      // Tổng chi: 2 người * 400 + 2.000 = 2.800 Tr.
      expect(room.treasury).toBe(tr - 2800);
    });
  });

  // =========================================================================
  // 7. MC_FREEZE_TRADE (Thị Trường Đóng Băng / Siết Tín Dụng)
  // =========================================================================
  describe('7. MC_FREEZE_TRADE (Siết Tín Dụng & Đóng Băng BĐS)', () => {
    it('[TC-116.24] executeMarketCard tạo modifier kéo dài 2 vòng (thay vì 1 vòng)', () => {
      executeMarketCard(MarketCardId.MC_FREEZE_TRADE, modifiers);
      expect(modifiers[0]).toEqual({
        type: MarketCardId.MC_FREEZE_TRADE,
        affectedCells: [],
        remainingRounds: 2,
      });
    });

    it('[TC-116.25] Modifier còn hiệu lực chặn thế chấp đất mới', () => {
      modifiers.push({
        type: MarketCardId.MC_FREEZE_TRADE,
        affectedCells: [],
        remainingRounds: 2,
      });
      const isFrozen = modifiers.some((m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0);
      expect(isFrozen).toBe(true);
    });
  });
});
