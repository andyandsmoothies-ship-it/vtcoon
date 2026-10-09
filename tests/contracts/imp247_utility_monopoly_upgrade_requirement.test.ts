import { describe, it, expect } from 'vitest';
import { createRoom, createPlayer, TurnPhase } from '../../src/domain/room';
import { ActionRejectReason } from '../../src/domain/action_reasons';
import { UTILITY_CELLS, type PropertyRegistry, type PropertyStateMap } from '../../src/domain/property_data';
import { upgradeUtilityFull, hasMonopoly, checkEvenBuilding } from '../../src/domain/property_upgrade';
import { resolveTitleDeedModalState } from '../../src/client/ui/modals/title_deed_affordance';
import { calcUtilityFee } from '../../src/domain/property_rent';
import { handleUpgradeUtility } from '../../src/server/property_actions';
import { validateP2PTrade } from '../../src/server/p2p_trade_actions';

// Clean typed fallback for ActionRejectReason.NEED_ALL_UTILITIES prior to Station 2 Task 1
const EXPECTED_NEED_ALL_UTILITIES: string =
  (ActionRejectReason as { readonly NEED_ALL_UTILITIES?: string }).NEED_ALL_UTILITIES ?? 'NEED_ALL_UTILITIES';

describe('[TC-IMP247/CONTRACT][UC-IMP247] Utility Monopoly Upgrade Requirement & Exploit Defense Suite', () => {
  describe('Facet 1: Domain Upgrade Preconditions (TC-IMP247.01 - TC-IMP247.04)', () => {
    it('[TC-IMP247.01/MSS][UC-IMP247] upgradeUtilityFull trả về NEED_ALL_UTILITIES khi chỉ sở hữu Ô 12', () => {
      const p = createPlayer('p1');
      p.balance = 5000;
      const reg: PropertyRegistry = new Map([[12, p.id]]);
      const sm: PropertyStateMap = new Map();
      const res = upgradeUtilityFull(p, 12, reg, sm);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(EXPECTED_NEED_ALL_UTILITIES);
    });

    it('[TC-IMP247.02/MSS][UC-IMP247] upgradeUtilityFull trả về NEED_ALL_UTILITIES khi chỉ sở hữu Ô 28', () => {
      const p = createPlayer('p1');
      p.balance = 5000;
      const reg: PropertyRegistry = new Map([[28, p.id]]);
      const sm: PropertyStateMap = new Map();
      const res = upgradeUtilityFull(p, 28, reg, sm);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(EXPECTED_NEED_ALL_UTILITIES);
    });

    it('[TC-IMP247.03/MSS][UC-IMP247] upgradeUtilityFull thành công trên Ô 12 khi sở hữu đủ cả 2 ô không thế chấp', () => {
      const p = createPlayer('p1');
      p.balance = 5000;
      const reg: PropertyRegistry = new Map([[12, p.id], [28, p.id]]);
      const sm: PropertyStateMap = new Map();
      const res = upgradeUtilityFull(p, 12, reg, sm);
      expect(res.success).toBe(true);
      expect(p.balance).toBe(4000);
      expect(sm.get(12)?.isUpgradedUtility).toBe(true);
      expect(sm.get(28)?.isUpgradedUtility).toBeUndefined();
    });

    it('[TC-IMP247.04/MSS][UC-IMP247] upgradeUtilityFull thành công độc lập trên Ô 28 sau khi Ô 12 đã nâng cấp', () => {
      const p = createPlayer('p1');
      p.balance = 5000;
      const reg: PropertyRegistry = new Map([[12, p.id], [28, p.id]]);
      const sm: PropertyStateMap = new Map([[12, { level: 0, isUpgradedUtility: true }]]);
      const res = upgradeUtilityFull(p, 28, reg, sm);
      expect(res.success).toBe(true);
      expect(p.balance).toBe(4000);
      expect(sm.get(28)?.isUpgradedUtility).toBe(true);
    });
  });

  describe('Facet 2: Mortgage Invariants (TC-IMP247.05 - TC-IMP247.07)', () => {
    it('[TC-IMP247.05/A1][UC-IMP247] upgradeUtilityFull từ chối với GROUP_MORTGAGED khi Ô 28 bị thế chấp', () => {
      const p = createPlayer('p1');
      p.balance = 5000;
      const reg: PropertyRegistry = new Map([[12, p.id], [28, p.id]]);
      const sm: PropertyStateMap = new Map([[28, { level: 0, isMortgaged: true }]]);
      const res = upgradeUtilityFull(p, 12, reg, sm);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.GROUP_MORTGAGED);
    });

    it('[TC-IMP247.06/A1][UC-IMP247] upgradeUtilityFull từ chối với GROUP_MORTGAGED khi chính Ô 12 bị thế chấp', () => {
      const p = createPlayer('p1');
      p.balance = 5000;
      const reg: PropertyRegistry = new Map([[12, p.id], [28, p.id]]);
      const sm: PropertyStateMap = new Map([[12, { level: 0, isMortgaged: true }]]);
      const res = upgradeUtilityFull(p, 12, reg, sm);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.GROUP_MORTGAGED);
    });

    it('[TC-IMP247.07/A1][UC-IMP247] Mở khóa nâng cấp sau khi chuộc thế chấp tiện ích', () => {
      const p = createPlayer('p1');
      p.balance = 5000;
      const reg: PropertyRegistry = new Map([[12, p.id], [28, p.id]]);
      const sm: PropertyStateMap = new Map([[28, { level: 0, isMortgaged: true }]]);
      sm.set(28, { level: 0, isMortgaged: false });
      const res = upgradeUtilityFull(p, 12, reg, sm);
      expect(res.success).toBe(true);
    });
  });

  describe('Facet 3: Boundary & Re-Upgrade Guards (TC-IMP247.08 - TC-IMP247.11)', () => {
    it('[TC-IMP247.08/A2][UC-IMP247] upgradeUtilityFull từ chối NOT_OWNER khi không sở hữu ô', () => {
      const p = createPlayer('p1');
      const reg: PropertyRegistry = new Map([[12, 'p2'], [28, 'p2']]);
      const sm: PropertyStateMap = new Map();
      const res = upgradeUtilityFull(p, 12, reg, sm);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.NOT_OWNER);
    });

    it('[TC-IMP247.09/A2][UC-IMP247] upgradeUtilityFull từ chối INSUFFICIENT_FUNDS khi số dư < 1000', () => {
      const p = createPlayer('p1');
      p.balance = 999;
      const reg: PropertyRegistry = new Map([[12, p.id], [28, p.id]]);
      const sm: PropertyStateMap = new Map();
      const res = upgradeUtilityFull(p, 12, reg, sm);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
    });

    it('[TC-IMP247.10/A2][UC-IMP247] upgradeUtilityFull trả về MAX_LEVEL trước khi check thế chấp nếu ô đã nâng cấp', () => {
      const p = createPlayer('p1');
      p.balance = 5000;
      const reg: PropertyRegistry = new Map([[12, p.id], [28, p.id]]);
      const sm: PropertyStateMap = new Map([
        [12, { level: 0, isUpgradedUtility: true }],
        [28, { level: 0, isMortgaged: true }],
      ]);
      const res = upgradeUtilityFull(p, 12, reg, sm);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.MAX_LEVEL);
    });

    it('[TC-IMP247.11/A2][UC-IMP247] upgradeUtilityFull từ chối NOT_UTILITY khi ô không phải Tiện ích', () => {
      const p = createPlayer('p1');
      p.balance = 5000;
      const reg: PropertyRegistry = new Map([[5, p.id]]);
      const sm: PropertyStateMap = new Map();
      const res = upgradeUtilityFull(p, 5, reg, sm);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.NOT_UTILITY);
    });
  });

  describe('Facet 4: Client Affordance & UI Tooltips (TC-IMP247.12 - TC-IMP247.15)', () => {
    it('[TC-IMP247.12/A3][UC-IMP247] Affordance báo Cần sở hữu trọn bộ cả 2 Tiện ích khi sở hữu 1 ô', () => {
      const state = resolveTitleDeedModalState({
        cellIndex: 12,
        myId: 'p1',
        myPlayer: { id: 'p1', name: 'Tester', balance: 5000, ownedProperties: [12] },
        playersInfo: { p1: { id: 'p1', name: 'Tester', balance: 5000, ownedProperties: [12] } },
      });
      expect(state.upgradeBlockedReason).toBe('Cần sở hữu trọn bộ cả 2 Tiện ích (EVN & Viettel) để nâng cấp');
    });

    it('[TC-IMP247.13/A3][UC-IMP247] Affordance báo Không thể nâng cấp khi có Tiện ích đang bị thế chấp (fallback owner)', () => {
      const state = resolveTitleDeedModalState({
        cellIndex: 12,
        myId: 'p1',
        playersInfo: { p1: { id: 'p1', name: 'Tester', balance: 5000, ownedProperties: [12, 28], mortgagedProperties: [28] } },
      });
      expect(state.upgradeBlockedReason).toBe('Không thể nâng cấp khi có Tiện ích đang bị thế chấp');
    });

    it('[TC-IMP247.14/A3][UC-IMP247] Affordance mở khóa hoàn toàn khi sở hữu 2 ô sạch và đủ tiền', () => {
      const state = resolveTitleDeedModalState({
        cellIndex: 12,
        myId: 'p1',
        myPlayer: { id: 'p1', name: 'Tester', balance: 5000, ownedProperties: [12, 28] },
        playersInfo: { p1: { id: 'p1', name: 'Tester', balance: 5000, ownedProperties: [12, 28] } },
      });
      expect(state.upgradeBlockedReason).toBeUndefined();
    });

    it('[TC-IMP247.15/A3][UC-IMP247] Affordance báo Đã nâng cấp tối đa khi isUpgradedUtility === true', () => {
      const state = resolveTitleDeedModalState({
        cellIndex: 12,
        myId: 'p1',
        propertyStates: { 12: { isUpgradedUtility: true } },
        myPlayer: { id: 'p1', name: 'Tester', balance: 5000, ownedProperties: [12, 28] },
        playersInfo: { p1: { id: 'p1', name: 'Tester', balance: 5000, ownedProperties: [12, 28] } },
      });
      expect(state.upgradeBlockedReason).toBe('Đã nâng cấp tối đa (Smart Grid / 5G)');
    });
  });

  describe('Facet 5: Exploit Defense & Concurrency Locks (TC-IMP247.16 - TC-IMP247.18)', () => {
    it('[TC-IMP247.16/A4][UC-IMP247] validateP2PTrade cho phép giao dịch tiện ích sạch và chặn tiện ích đã nâng cấp', () => {
      const room = createRoom('seller');
      room.started = true;
      const seller = room.players[0]!;
      seller.balance = 5000;
      const buyer = createPlayer('buyer');
      buyer.balance = 5000;
      room.players.push(buyer);

      const reg: PropertyRegistry = new Map([[12, 'seller']]);
      const sm: PropertyStateMap = new Map();

      const validTrade = validateP2PTrade(room, 'seller', 'buyer', 12, 1500, reg, sm);
      expect(validTrade.valid).toBe(true);

      sm.set(12, { level: 0, isUpgradedUtility: true });
      const invalidTrade = validateP2PTrade(room, 'seller', 'buyer', 12, 1500, reg, sm);
      expect(invalidTrade.valid).toBe(false);
      expect(invalidTrade.reason).toBe(ActionRejectReason.PROPERTY_HAS_BUILDING);
    });

    it('[TC-IMP247.17/A4][UC-IMP247] handleUpgradeUtility khóa ASSET_LOCKED khi ô đối tác trong bộ tiện ích đang trong phiên đàm phán pendingTradeOffer', () => {
      const p = createPlayer('p1');
      const reg: PropertyRegistry = new Map([[12, p.id], [28, p.id]]);
      const sm: PropertyStateMap = new Map();
      const room = createRoom('p1');
      room.phase = TurnPhase.PropertyManagement;
      room.pendingTradeOffer = {
        offerId: 'trade_1',
        cellIndex: 28,
        sellerId: p.id,
        buyerId: 'p2',
        requesterId: p.id,
        targetPlayerId: 'p2',
        price: 2000,
        expiresAt: Date.now() + 15000,
      };
      const res = handleUpgradeUtility(p, room.phase, 12, reg, sm, room);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.ASSET_LOCKED);
    });

    it('[TC-IMP247.18/A4][UC-IMP247] calcUtilityFee hạ về 1.000 Tr. nếu mất độc quyền hoặc ô đối tác thế chấp dù đã nâng cấp', () => {
      const reg: PropertyRegistry = new Map([[12, 'p1'], [28, 'p2']]);
      const sm: PropertyStateMap = new Map([[12, { level: 0, isUpgradedUtility: true }]]);
      const feeBrokenMonopoly = calcUtilityFee('p1', 7, reg, sm, 12);
      expect(feeBrokenMonopoly).toBe(1000);

      reg.set(28, 'p1');
      const feeCleanMonopoly = calcUtilityFee('p1', 7, reg, sm, 12);
      expect(feeCleanMonopoly).toBe(3500);

      sm.set(28, { level: 0, isMortgaged: true });
      const feeMortgagedSibling = calcUtilityFee('p1', 7, reg, sm, 12);
      expect(feeMortgagedSibling).toBe(1000);
    });
  });

  describe('Facet 6: Property Upgrade Domain Invariants & Sentinel Defense (TC-IMP247.19 - TC-IMP247.21)', () => {
    it('[TC-IMP247.19/CHAOS] hasMonopoly xác nhận độc quyền màu nâu và phát hiện đột biến nhóm màu', () => {
      const reg: PropertyRegistry = new Map([[1, 'p1'], [3, 'p1']]);
      expect(hasMonopoly('p1', 1, reg)).toBe(true);
    });

    it('[TC-IMP247.20/CHAOS] checkEvenBuilding cho phép xây dựng ô ban đầu cấp 0', () => {
      const sm: PropertyStateMap = new Map([[1, { level: 0 }]]);
      expect(checkEvenBuilding(1, sm).valid).toBe(true);
    });

    it('[TC-IMP247.21/CHAOS] checkEvenBuilding chặn vi phạm xây đều khi ô đối tác tụt lại', () => {
      const sm: PropertyStateMap = new Map([[1, { level: 1 }], [3, { level: 0 }]]);
      const res = checkEvenBuilding(1, sm);
      expect(res.valid).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.EVEN_BUILDING_VIOLATION);
    });
  });
});

