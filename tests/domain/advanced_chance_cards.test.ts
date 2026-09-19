// [UC-GAME-058 / TC-05.7/MSS][TC-05.7/Adversarial] Advanced Chance Cards Verification
// Traceability: docs/requirements.md §V.2.6 & §V.2.17 | docs/plans/GAME-S05-credit-and-insolvency_plan.md Task 9 (DEBT-04)

import { describe, it, expect, beforeEach } from 'vitest';
import { createPlayer, createRoom, type Player, type Room, type MarketModifier } from '../../src/domain/room';
import { ChanceCardId, MarketCardId, INFRA_CELLS } from '../../src/domain/event_card_types';
import { executeChanceCard } from '../../src/domain/card_handlers';
import { drawChanceCard } from '../../src/domain/event_card_engine';
import {
  handleLanding,
  LandingResult,
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/domain/property_manager';

describe('[TC-05.7/MSS & Adversarial] Advanced Chance Cards (CC_PORT_EXCLUSIVE & CC_LAND_CHANGE)', () => {
  let p1: Player;
  let p2: Player;
  let p3: Player;
  let players: Player[];
  let modifiers: MarketModifier[];
  let registry: PropertyRegistry;
  let stateMap: PropertyStateMap;
  let permanentRentBonus: Record<number, number>;

  beforeEach(() => {
    p1 = createPlayer('p1');
    p2 = createPlayer('p2');
    p3 = createPlayer('p3');
    players = [p1, p2, p3];
    modifiers = [];
    registry = new Map();
    stateMap = new Map();
    permanentRentBonus = {};
  });

  describe('Thẻ CC_PORT_EXCLUSIVE (Hợp Tác Độc Quyền Cảng)', () => {
    it('[modifier] kích hoạt tạo modifier beneficiaryId, remainingRounds=2, multiplier=0.5 trên INFRA_CELLS', () => {
      executeChanceCard(ChanceCardId.CC_PORT_EXCLUSIVE, 'p1', players, modifiers);
      expect(modifiers.length).toBe(1);
      const mod = modifiers[0]!;
      expect(mod.beneficiaryId).toBe('p1');
      expect(mod.remainingRounds).toBe(2);
      expect(mod.multiplier).toBe(0.5);
      expect(mod.affectedCells).toEqual(INFRA_CELLS);
    });

    it('[money split] đối thủ dẫm ô Hạ tầng: trả 100% phí, chủ nhận 50%, beneficiary nhận 50%', () => {
      registry.set(5, 'p1'); // Ô 5 (Cảng Long Thành, phí 500)
      executeChanceCard(ChanceCardId.CC_PORT_EXCLUSIVE, 'p3', players, modifiers);
      const [p1B, p2B, p3B] = [p1.balance, p2.balance, p3.balance];

      const res = handleLanding(p2, 5, registry, players, stateMap, 7, modifiers);
      expect(res.result).toBe(LandingResult.RentPaid);
      expect(res.rentAmount).toBe(500);
      expect(p2.balance, 'P2 trả 100% phí = 500').toBe(p2B - 500);
      expect(p1.balance, 'P1 chủ nhận 50% = 250').toBe(p1B + 250);
      expect(p3.balance, 'P3 beneficiary nhận 50% = 250').toBe(p3B + 250);
    });

    it('[owner is beneficiary] chủ sở hữu tự rút thẻ: nhận 100% tiền thuê', () => {
      registry.set(5, 'p1');
      executeChanceCard(ChanceCardId.CC_PORT_EXCLUSIVE, 'p1', players, modifiers);
      const [p1B, p2B] = [p1.balance, p2.balance];

      const res = handleLanding(p2, 5, registry, players, stateMap, 7, modifiers);
      expect(res.rentAmount).toBe(500);
      expect(p2.balance).toBe(p2B - 500);
      expect(p1.balance, 'P1 nhận 100% = 500 (50% chủ + 50% beneficiary)').toBe(p1B + 500);
    });

    it('[beneficiary is payer] beneficiary dẫm ô đối thủ: đối thủ nhận 50%, beneficiary net trả 50%', () => {
      registry.set(5, 'p1');
      executeChanceCard(ChanceCardId.CC_PORT_EXCLUSIVE, 'p2', players, modifiers);
      const [p1B, p2B] = [p1.balance, p2.balance];

      const res = handleLanding(p2, 5, registry, players, stateMap, 7, modifiers);
      expect(res.rentAmount).toBe(500);
      expect(p1.balance).toBe(p1B + 250);
      expect(p2.balance).toBe(p2B - 250);
    });

    it('[combined MC_FUEL_SURGE] kết hợp tăng giá xăng +500: thu 1000, chia 500/500', () => {
      registry.set(5, 'p1');
      modifiers.push({ type: MarketCardId.MC_FUEL_SURGE, affectedCells: INFRA_CELLS, remainingRounds: 1 });
      executeChanceCard(ChanceCardId.CC_PORT_EXCLUSIVE, 'p3', players, modifiers);
      const [p1B, p2B, p3B] = [p1.balance, p2.balance, p3.balance];

      const res = handleLanding(p2, 5, registry, players, stateMap, 7, modifiers);
      expect(res.rentAmount, 'Tổng phí gồm 500 base + 500 fuel surge = 1000').toBe(1000);
      expect(p2.balance, 'Người trả trả đủ 1000').toBe(p2B - 1000);
      expect(p1.balance, 'Chủ sở hữu nhận 50% của 1000 = 500').toBe(p1B + 500);
      expect(p3.balance, 'Beneficiary nhận 50% của 1000 = 500').toBe(p3B + 500);
    });

    it('[bankrupt beneficiary] beneficiary bị phá sản: vô hiệu hóa chia tiền, chủ nhận 100%', () => {
      registry.set(5, 'p1');
      executeChanceCard(ChanceCardId.CC_PORT_EXCLUSIVE, 'p3', players, modifiers);
      p3.bankrupt = true;
      const [p1B, p2B, p3B] = [p1.balance, p2.balance, p3.balance];

      const res = handleLanding(p2, 5, registry, players, stateMap, 7, modifiers);
      expect(res.rentAmount).toBe(500);
      expect(p2.balance).toBe(p2B - 500);
      expect(p1.balance, 'Chủ nhận đủ 100% vì beneficiary đã phá sản').toBe(p1B + 500);
      expect(p3.balance, 'Beneficiary phá sản không được cộng tiền').toBe(p3B);
    });

    it('[expiration] thẻ hết hạn (remainingRounds=0): chủ nhận 100%, beneficiary 0%', () => {
      registry.set(5, 'p1');
      modifiers.push({
        type: ChanceCardId.CC_PORT_EXCLUSIVE as any,
        affectedCells: INFRA_CELLS,
        remainingRounds: 0,
        multiplier: 0.5,
        beneficiaryId: 'p3',
      });
      const [p1B, p2B, p3B] = [p1.balance, p2.balance, p3.balance];

      const res = handleLanding(p2, 5, registry, players, stateMap, 7, modifiers);
      expect(res.rentAmount).toBe(500);
      expect(p2.balance).toBe(p2B - 500);
      expect(p1.balance).toBe(p1B + 500);
      expect(p3.balance).toBe(p3B);
    });

    it('[own port] người chơi tự dừng chân tại cảng của mình: không thu phí', () => {
      registry.set(5, 'p1');
      modifiers.push({
        type: ChanceCardId.CC_PORT_EXCLUSIVE as any,
        affectedCells: INFRA_CELLS,
        remainingRounds: 2,
        multiplier: 0.5,
        beneficiaryId: 'p3',
      });
      const [p1B, p3B] = [p1.balance, p3.balance];

      const res = handleLanding(p1, 5, registry, players, stateMap, 7, modifiers);
      expect(res.result).toBe(LandingResult.OwnProperty);
      expect(res.rentAmount).toBe(0);
      expect(p1.balance).toBe(p1B);
      expect(p3.balance).toBe(p3B);
    });
  });

  describe('Thẻ CC_LAND_CHANGE (Quy Hoạch Lại Đất Đai)', () => {
    it('[MSS] nộp 500 Tr và nâng cấp thẳng 1 BĐS Cấp 0 đang sở hữu lên Cấp 1 (C1)', () => {
      registry.set(1, 'p1'); // Ô 1 (Cần Thơ, Cấp 0)
      const p1B = p1.balance;

      executeChanceCard(ChanceCardId.CC_LAND_CHANGE, 'p1', players, undefined, registry, stateMap);
      expect(p1.balance).toBe(p1B - 500);
      expect(stateMap.get(1)?.level).toBe(1);
    });

    it('[rent increase] đối thủ dẫm vào ô vừa được nâng cấp lên C1: trả tiền thuê C1', () => {
      registry.set(1, 'p1');
      stateMap.set(1, { level: 1 });
      const [p1B, p2B] = [p1.balance, p2.balance];

      const res = handleLanding(p2, 1, registry, players, stateMap, 7);
      expect(res.result).toBe(LandingResult.RentPaid);
      expect(res.rentAmount).toBe(210); // Cần Thơ C1 rent1 = 210 (35% của 600)
      expect(p2.balance).toBe(p2B - 210);
      expect(p1.balance).toBe(p1B + 210);
    });

    it('[no stack] chỉ nâng cấp 1 ô C0 đầu tiên, ô C0 còn lại giữ nguyên C0', () => {
      registry.set(1, 'p1');
      registry.set(3, 'p1');

      executeChanceCard(ChanceCardId.CC_LAND_CHANGE, 'p1', players, undefined, registry, stateMap);
      expect(stateMap.get(1)?.level, 'Ô 1 lên level 1').toBe(1);
      expect(stateMap.get(3)?.level ?? 0, 'Ô 3 giữ nguyên level 0').toBe(0);
    });

    it('[all assigned] nếu tất cả BĐS C0 đều đã lên C1: nhận 600 Tr hỗ trợ quy hoạch', () => {
      registry.set(1, 'p1');
      stateMap.set(1, { level: 1 });
      const p1B = p1.balance;

      executeChanceCard(ChanceCardId.CC_LAND_CHANGE, 'p1', players, undefined, registry, stateMap);
      expect(p1.balance).toBe(p1B + 600);
      expect(stateMap.get(1)?.level).toBe(1);
    });

    it('[no land owned] người rút không sở hữu đất C0: nhận 600 Tr hỗ trợ quy hoạch', () => {
      registry.set(1, 'p1');
      const p2B = p2.balance;

      executeChanceCard(ChanceCardId.CC_LAND_CHANGE, 'p2', players, undefined, registry, stateMap);
      expect(p2.balance).toBe(p2B + 600);
      expect(stateMap.get(1)?.level ?? 0).toBe(0);

      const res = handleLanding(p2, 1, registry, players, stateMap, 7);
      expect(res.rentAmount).toBe(60);
    });

    it('[upgraded property] bỏ qua BĐS đã xây dựng C1-C3, không nâng thêm', () => {
      registry.set(1, 'p1');
      stateMap.set(1, { level: 2 });
      const p1B = p1.balance;

      executeChanceCard(ChanceCardId.CC_LAND_CHANGE, 'p1', players, undefined, registry, stateMap);
      expect(p1.balance).toBe(p1B + 600);
      expect(stateMap.get(1)?.level).toBe(2);
    });

    it('[non-property] không nâng cấp cho Hạ tầng Railroad hoặc Utility', () => {
      registry.set(5, 'p1');
      registry.set(12, 'p1');
      const p1B = p1.balance;

      executeChanceCard(ChanceCardId.CC_LAND_CHANGE, 'p1', players, undefined, registry, stateMap);
      expect(p1.balance).toBe(p1B + 600);
    });

    it('[own property] chủ dừng chân tại ô mình sở hữu: không mất phí', () => {
      registry.set(1, 'p1');
      stateMap.set(1, { level: 1 });
      const p1B = p1.balance;

      const res = handleLanding(p1, 1, registry, players, stateMap, 7);
      expect(res.result).toBe(LandingResult.OwnProperty);
      expect(res.rentAmount).toBe(0);
      expect(p1.balance).toBe(p1B);
    });

    it('[integration drawChanceCard] rút CC_LAND_CHANGE tự động nâng cấp C0 lên C1 và trừ 500 Tr', () => {
      const room: Room = createRoom('p1');
      room.players = [p1, p2];
      room.chanceDeck = [ChanceCardId.CC_LAND_CHANGE];
      registry.set(1, 'p1');
      const p1B = p1.balance;

      drawChanceCard(room, p1, () => 0.5, registry, stateMap);
      expect(p1.balance).toBe(p1B - 500);
      expect(stateMap.get(1)?.level).toBe(1);
    });
  });
});
