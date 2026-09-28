// [CONTRACT TEST] IMP-217: Corporate Bond Tranches, Collateral Selection & End-to-End Pipeline Wiring
// Traceability Tags: [TC-217.01/MSS..TC-217.16/MSS] & [UC-IMP217]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { createRoom, createPlayer, TurnPhase, type Room, type Player } from '../../src/domain/room';
import { ActionRejectReason } from '../../src/domain/action_reasons';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../../src/domain/property_manager';
import { mortgageProperty } from '../../src/server/mortgage_manager';
import { executeP2PTrade } from '../../src/server/property_actions';
import { RoomManager } from '../../src/server/room_manager';
import { dispatchPlayerIntent, type PlayerIntent } from '../../src/server/intent_dispatcher';
import { useGameStore } from '../../src/client/store/game_store.js';
import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal';
import { BondIssuanceTab } from '../../src/client/ui/modals/bond_issuance_tab';
import { ModalHost } from '../../src/client/ui/modals/modal_host';

import * as bondTypesModule from '../../src/domain/bond_types';
import * as bondManagerModule from '../../src/server/bond_manager';

// Safe aliases allowing runtime inspection of newly introduced exports without syntax crashes
const BondTrancheId = (bondTypesModule as any).BondTrancheId ?? {
  WORKING_CAPITAL: 'WORKING_CAPITAL',
  EXPANSION: 'EXPANSION',
  ALL_IN: 'ALL_IN',
};

// Tree traversal helper for React vdom elements (defined outside it() to enforce zero loops in tests)
function findVNode(node: any, predicate: (n: any) => boolean): any {
  if (!node) return null;
  if (predicate(node)) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const res = findVNode(child, predicate);
      if (res) return res;
    }
  } else if (children) {
    return findVNode(children, predicate);
  }
  return null;
}

function createTestEnvironment(roomCode = 'ROOM_IMP217'): {
  room: Room;
  registry: PropertyRegistry;
  stateMap: PropertyStateMap;
  p1: Player;
  p2: Player;
} {
  const room = createRoom(roomCode, 'player_alpha');
  room.started = true;
  room.phase = TurnPhase.PropertyManagement;

  const p1 = createPlayer('player_alpha');
  p1.name = 'Chủ Tịch Alpha';
  p1.balance = 10_000;
  p1.position = 0;

  const p2 = createPlayer('player_beta');
  p2.name = 'Chủ Tịch Beta';
  p2.balance = 10_000;
  p2.position = 0;

  room.players = [p1, p2];
  room.currentPlayerIndex = 0;

  const registry: PropertyRegistry = new Map();
  const stateMap: PropertyStateMap = new Map();

  return { room, registry, stateMap, p1, p2 };
}

describe('[TC-217.01/MSS..TC-217.16/MSS][UC-IMP217] Corporate Bond Tranches, Collateral Selection & Pipeline Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      activeModal: null,
      currentTurnPlayerId: 'p1',
      levelMap: {},
      playersInfo: {},
    });
  });

  // =========================================================================
  // FACET 1: Định nghĩa & Khởi tạo 3 Gói Tranches ([TC-217.01] - [TC-217.04])
  // =========================================================================
  describe('Facet 1: Định nghĩa & Khởi tạo 3 Gói Tranches', () => {
    it('[TC-217.01/MSS][UC-IMP217] BOND_TRANCHES chứa đúng 3 gói WORKING_CAPITAL, EXPANSION, ALL_IN với các tham số tỷ lệ vay và lãi suất', () => {
      const tranches = (bondTypesModule as any).BOND_TRANCHES;
      expect(tranches).toBeDefined();
      expect(tranches?.[BondTrancheId.WORKING_CAPITAL]).toMatchObject({
        loanRatio: 0.20,
        durationRounds: 2,
        interestRate: 0.08,
        collateralRatio: 1.00,
      });
      expect(tranches?.[BondTrancheId.EXPANSION]).toMatchObject({
        loanRatio: 0.40,
        durationRounds: 3,
        interestRate: 0.15,
        collateralRatio: 1.20,
      });
      expect(tranches?.[BondTrancheId.ALL_IN]).toMatchObject({
        loanRatio: 0.60,
        durationRounds: 3,
        interestRate: 0.20,
        collateralRatio: 0.50,
      });
    });

    it('[TC-217.02/MSS][UC-IMP217] Khởi tạo hợp đồng WORKING_CAPITAL: vay 20% Net Worth, kỳ hạn 2 vòng, lãi 8%', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 3_800;
      registry.set(1, p1.id);
      registry.set(3, p1.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(3, { level: 0 });

      const result = (bondManagerModule as any).handleIssueBond(room, p1.id, registry, stateMap, BondTrancheId.WORKING_CAPITAL);
      expect(result?.success).toBe(true);
      expect(result?.bondContract?.principal).toBe(1_000);
      expect(result?.bondContract?.repayAmount).toBe(1_080);
      expect(result?.bondContract?.roundsLeft).toBe(2);
    });

    it('[TC-217.03/MSS][UC-IMP217] Khởi tạo hợp đồng EXPANSION: vay 40% Net Worth, kỳ hạn 3 vòng, lãi 15%', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 1_800;
      registry.set(1, p1.id);
      registry.set(3, p1.id);
      registry.set(6, p1.id);
      registry.set(8, p1.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(3, { level: 0 });
      stateMap.set(6, { level: 0 });
      stateMap.set(8, { level: 0 });

      const result = (bondManagerModule as any).handleIssueBond(room, p1.id, registry, stateMap, BondTrancheId.EXPANSION);
      expect(result?.success).toBe(true);
      expect(result?.bondContract?.principal).toBe(2_000);
      expect(result?.bondContract?.repayAmount).toBe(2_300);
      expect(result?.bondContract?.roundsLeft).toBe(3);
    });

    it('[TC-217.04/MSS][UC-IMP217] Khởi tạo hợp đồng ALL_IN: vay 60% Net Worth, kỳ hạn 3 vòng, lãi 20%', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 5_400;
      registry.set(6, p1.id);
      registry.set(8, p1.id);
      registry.set(9, p1.id);
      registry.set(11, p1.id);
      stateMap.set(6, { level: 0 });
      stateMap.set(8, { level: 0 });
      stateMap.set(9, { level: 0 });
      stateMap.set(11, { level: 0 });

      const result = (bondManagerModule as any).handleIssueBond(room, p1.id, registry, stateMap, BondTrancheId.ALL_IN);
      expect(result?.success).toBe(true);
      expect(result?.bondContract?.principal).toBe(6_000);
      expect(result?.bondContract?.repayAmount).toBe(7_200);
      expect(result?.bondContract?.roundsLeft).toBe(3);
    });
  });

  // =========================================================================
  // FACET 2: Thuật toán chọn tài sản bảo đảm tối ưu ([TC-217.05] - [TC-217.08])
  // =========================================================================
  describe('Facet 2: Thuật toán chọn tài sản bảo đảm tối ưu', () => {
    it('[TC-217.05/MSS][UC-IMP217] Gói 1 tự động chọn các ô đất rẻ nhất trước, không khóa các ô đắt đỏ', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 10_000;
      registry.set(1, p1.id);
      registry.set(3, p1.id);
      registry.set(37, p1.id);
      registry.set(39, p1.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(3, { level: 0 });
      stateMap.set(37, { level: 0 });
      stateMap.set(39, { level: 0 });

      const result = (bondManagerModule as any).handleIssueBond(room, p1.id, registry, stateMap, BondTrancheId.WORKING_CAPITAL);
      expect(result?.success).toBe(true);
      expect(result?.bondContract?.collateralCells).toEqual([1, 3, 37]);
      expect(result?.bondContract?.collateralCells).not.toContain(39);
    });

    it('[TC-217.06/MSS][UC-IMP217] Gói 2 tự động tích lũy đủ >= 120% giá trị khoản vay và >= 2 ô đất', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 2_500;
      registry.set(1, p1.id);
      registry.set(3, p1.id);
      registry.set(6, p1.id);
      registry.set(8, p1.id);
      registry.set(11, p1.id);
      registry.set(13, p1.id);
      registry.set(39, p1.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(3, { level: 0 });
      stateMap.set(6, { level: 0 });
      stateMap.set(8, { level: 0 });
      stateMap.set(11, { level: 0 });
      stateMap.set(13, { level: 0 });
      stateMap.set(39, { level: 0 });

      const result = (bondManagerModule as any).handleIssueBond(room, p1.id, registry, stateMap, BondTrancheId.EXPANSION);
      expect(result?.success).toBe(true);
      expect(result?.bondContract?.collateralCells).toEqual([1, 3, 6, 8, 11, 13]);
      expect(result?.bondContract?.collateralCells).not.toContain(39);
    });

    it('[TC-217.07/MSS][UC-IMP217] Gói 3 tự động khóa toàn bộ danh mục đất sạch chưa thế chấp', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 5_400;
      registry.set(1, p1.id);
      registry.set(6, p1.id);
      registry.set(8, p1.id);
      registry.set(9, p1.id);
      p1.mortgagedProperties = [1];
      stateMap.set(1, { level: 0 });
      stateMap.set(6, { level: 0 });
      stateMap.set(8, { level: 0 });
      stateMap.set(9, { level: 0 });

      const result = (bondManagerModule as any).handleIssueBond(room, p1.id, registry, stateMap, BondTrancheId.ALL_IN);
      expect(result?.success).toBe(true);
      expect(result?.bondContract?.collateralCells).toEqual(expect.arrayContaining([6, 8, 9]));
      expect(result?.bondContract?.collateralCells).not.toContain(1);
      expect((result?.bondContract as any)?.trancheId).toBe(BondTrancheId.ALL_IN);
    });

    it('[TC-217.08/MSS][UC-IMP217] Các ô đất ngoài danh mục bảo đảm vẫn được phép thế chấp hoặc chuyển nhượng P2P bình thường', () => {
      const { room, registry, stateMap, p1, p2 } = createTestEnvironment();
      p1.balance = 2_000;
      p2.balance = 2_000;
      registry.set(1, p1.id);
      registry.set(3, p1.id);
      registry.set(6, p1.id);
      registry.set(8, p1.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(3, { level: 0 });
      stateMap.set(6, { level: 0 });
      stateMap.set(8, { level: 0 });
      p1.bondContract = {
        principal: 1_000,
        repayAmount: 1_080,
        roundsLeft: 2,
        collateralCells: [1, 3],
        isActive: true,
      };

      const mortRes = mortgageProperty(room, p1.id, 6, registry, stateMap);
      expect(mortRes.success).toBe(true);
      expect(p1.mortgagedProperties).toContain(6);

      const tradeRes = executeP2PTrade(room, p1.id, p2.id, 8, 1_000, registry, stateMap);
      expect(tradeRes.success).toBe(true);
      expect(registry.get(8)).toBe(p2.id);
    });
  });

  // =========================================================================
  // FACET 3: Bảo toàn ngân quỹ, Vòng đời & Xử lý vỡ nợ ([TC-217.09] - [TC-217.11c])
  // =========================================================================
  describe('Facet 3: Bảo toàn ngân quỹ, Vòng đời & Xử lý vỡ nợ', () => {
    it('[TC-217.09/MSS][UC-IMP217] Gói 1 tất toán: Lãi 8% nộp đúng vào room.treasury (repayAmount - principal), không sinh tiền khống 20%', () => {
      const { room, p1 } = createTestEnvironment();
      room.treasury = 500;
      p1.balance = 2_000;
      p1.bondContract = {
        principal: 1_000,
        repayAmount: 1_080,
        roundsLeft: 2,
        collateralCells: [1, 3],
        isActive: true,
      };

      const res = (bondManagerModule as any).handleRepayBond(room, p1.id);
      expect(res.success).toBe(true);
      expect(p1.balance).toBe(920);
      expect(room.treasury).toBe(580);
      expect(p1.bondContract).toBeNull();
    });

    it('[TC-217.10/MSS][UC-IMP217] Gói 2 tất toán: Lãi 15% nộp đúng vào room.treasury', () => {
      const { room, p1 } = createTestEnvironment();
      room.treasury = 1_000;
      p1.balance = 3_000;
      p1.bondContract = {
        principal: 2_000,
        repayAmount: 2_300,
        roundsLeft: 3,
        collateralCells: [1, 3],
        isActive: true,
      };

      const res = (bondManagerModule as any).handleRepayBond(room, p1.id);
      expect(res.success).toBe(true);
      expect(p1.balance).toBe(700);
      expect(room.treasury).toBe(1_300);
      expect(p1.bondContract).toBeNull();
    });

    it('[TC-217.11/MSS][UC-IMP217] Khi vỡ nợ, chỉ các ô nằm trong collateralCells bị đưa vào fireSaleQueue, không tịch thu nhầm ô ngoài danh mục', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      room.treasury = 200;
      p1.balance = 0;
      registry.set(1, p1.id);
      registry.set(3, p1.id);
      registry.set(6, p1.id);
      stateMap.set(1, { level: 0 });
      stateMap.set(3, { level: 0 });
      stateMap.set(6, { level: 0 });
      p1.bondContract = {
        principal: 1_000,
        repayAmount: 1_080,
        roundsLeft: 1,
        collateralCells: [1, 3],
        isActive: true,
      };

      (bondManagerModule as any).processBondTurnTransition(room, p1, registry, stateMap);
      expect(registry.get(6)).toBe(p1.id);
      expect(registry.has(1)).toBe(false);
      expect(registry.has(3)).toBe(false);
      expect(room.fireSaleQueue).toEqual([3]);
    });

    it('[TC-217.11b/MSS][UC-IMP217] processBondTurnTransition: roundsLeft giảm đúng 1 đơn vị sau mỗi lượt của con nợ (ví dụ Gói 2: 3 -> 2 -> 1)', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      p1.balance = 500;
      p1.bondContract = {
        principal: 2_000,
        repayAmount: 2_300,
        roundsLeft: 3,
        collateralCells: [1, 3],
        isActive: true,
      };

      (bondManagerModule as any).processBondTurnTransition(room, p1, registry, stateMap);
      expect(p1.bondContract?.roundsLeft).toBe(2);

      (bondManagerModule as any).processBondTurnTransition(room, p1, registry, stateMap);
      expect(p1.bondContract?.roundsLeft).toBe(1);
      expect(p1.bondContract?.isActive).toBe(true);
      expect(p1.balance).toBe(500);
    });

    it('[TC-217.11c/MSS][UC-IMP217] processBondTurnTransition: Kích hoạt tất toán hoặc phát mãi chính xác tại mốc roundsLeft === 1, không trigger non khi roundsLeft > 1', () => {
      const { room, registry, stateMap, p1 } = createTestEnvironment();
      room.treasury = 500;
      p1.balance = 5_000;
      p1.bondContract = {
        principal: 2_000,
        repayAmount: 2_300,
        roundsLeft: 2,
        collateralCells: [1, 3],
        isActive: true,
      };

      (bondManagerModule as any).processBondTurnTransition(room, p1, registry, stateMap);
      expect(p1.bondContract?.roundsLeft).toBe(1);

      (bondManagerModule as any).processBondTurnTransition(room, p1, registry, stateMap);
      expect(p1.bondContract).toBeNull();
      expect(p1.balance).toBe(2_700);
      expect(room.treasury).toBe(800);
    });
  });

  // =========================================================================
  // FACET 4: Dây Nối Pipeline Từ Server Intent Đến Client Wire ([TC-217.12] - [TC-217.14])
  // =========================================================================
  describe('Facet 4: Dây Nối Pipeline Từ Server Intent Đến Client Wire', () => {
    it('[TC-217.12/MSS][UC-IMP217] INTENT_ISSUE_BOND truyền trancheId được server bóc tách và thực thi chính xác', () => {
      const roomMgr = new RoomManager();
      roomMgr.createRoom('p1', 'ROOM_INTENT_TEST');
      const session = roomMgr.getSession('ROOM_INTENT_TEST')!;
      const room = session.room;
      room.started = true;
      const p1 = room.players[0]!;
      p1.balance = 3_800;
      session.registry.set(1, p1.id);
      session.registry.set(3, p1.id);
      session.propertyStates.set(1, { level: 0 });
      session.propertyStates.set(3, { level: 0 });

      const res = dispatchPlayerIntent(roomMgr, 'ROOM_INTENT_TEST', 'p1', {
        type: 'INTENT_ISSUE_BOND',
        trancheId: BondTrancheId.WORKING_CAPITAL,
      } as any);

      expect(res.success).toBe(true);
      expect((p1.bondContract as any)?.trancheId).toBe(BondTrancheId.WORKING_CAPITAL);
      expect(p1.bondContract?.roundsLeft).toBe(2);
      expect(p1.bondContract?.principal).toBe(1_000);
    });

    it('[TC-217.13/MSS][UC-IMP217] modal_host.tsx tính toán và truyền đúng playerNetWorth thực tế (không còn bị undefined)', () => {
      useGameStore.setState({
        activeModal: 'portfolio',
        currentTurnPlayerId: 'p1',
        levelMap: { 1: 0, 3: 0 } as any,
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Hưng Thịnh',
            balance: 5_000,
            ownedProperties: [1, 3],
            mortgagedProperties: [],
            mortgageLoans: {},
            tokenColor: '#38BDF8',
            isBot: false,
            bankrupt: false,
          } as any,
        },
      });

      let vdom: any;
      function TestModalHost() {
        vdom = ModalHost({ onIntent: vi.fn(), localPlayerId: 'p1' });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestModalHost));

      const portfolioNode = findVNode(vdom, (n) => n?.type === PropertyPortfolioModal || n?.type?.name === 'PropertyPortfolioModal');
      expect(portfolioNode).toBeDefined();
      expect(portfolioNode?.props?.playerNetWorth).toBe(6_200);
      expect(portfolioNode?.props?.unmortgagedPropertiesCount).toBe(2);
    });

    it('[TC-217.14/MSS][UC-IMP217] PropertyPortfolioModal truyền toàn vẹn playerNetWorth, unmortgagedPropertiesCount xuống BondIssuanceTab', () => {
      let vdom: any;
      vi.spyOn(React, 'useState').mockImplementationOnce(() => ['bonds', vi.fn()] as any);
      function TestPortfolioWrapper() {
        vdom = PropertyPortfolioModal({
          ownedProperties: [1, 3],
          currentBalance: 5_000,
          playerNetWorth: 7_500,
          unmortgagedPropertiesCount: 3,
          onClose: vi.fn(),
        } as any);
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestPortfolioWrapper));
      vi.restoreAllMocks();

      const bondTabNode = findVNode(vdom, (n) => n?.type === BondIssuanceTab || n?.type?.name === 'BondIssuanceTab');
      expect(bondTabNode).toBeDefined();
      expect(bondTabNode?.props?.playerNetWorth).toBe(7_500);
      expect(bondTabNode?.props?.unmortgagedPropertiesCount).toBe(3);
    });
  });

  // =========================================================================
  // FACET 5: Công Thái Học & Trạng Thái Giao Diện 3 Gói (UI Affordance) ([TC-217.15] - [TC-217.16])
  // =========================================================================
  describe('Facet 5: Công Thái Học & Trạng Thái Giao Diện 3 Gói (UI Affordance)', () => {
    it('[TC-217.15/MSS][UC-IMP217] BondIssuanceTab render bố cục grid-cols-1 sm:grid-cols-3 an toàn trên mobile 360px', () => {
      const html = renderToStaticMarkup(
        React.createElement(BondIssuanceTab, {
          balance: 5_000,
          playerNetWorth: 5_000,
          unmortgagedPropertiesCount: 2,
          isMyTurn: true,
        } as any)
      );

      expect(html).toContain('grid-cols-1 sm:grid-cols-3');
      expect(html).toContain('Tín Dụng Lưu Động');
      expect(html).toContain('Đầu Tư Tăng Tốc');
      expect(html).toContain('Thâu Tóm Tất Tay');
    });

    it('[TC-217.16/MSS][UC-IMP217] Thẻ cảnh báo bond-blocked-notice biến mất khi người chơi đủ điều kiện, nút bấm active với touch target min-h-[46px]', () => {
      const onIssueBondSpy = vi.fn();
      let vdom: any;
      function TestBondTabWrapper() {
        vdom = BondIssuanceTab({
          balance: 5_000,
          playerNetWorth: 5_000,
          unmortgagedPropertiesCount: 2,
          isMyTurn: true,
          onIssueBond: onIssueBondSpy,
        } as any);
        return vdom;
      }
      const html = renderToStaticMarkup(React.createElement(TestBondTabWrapper));

      expect(html).not.toContain('data-testid="bond-blocked-notice"');
      expect(html).toContain('Gói đã chọn:');
      const issueBtnNode = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'issue-bond-btn');
      expect(issueBtnNode?.props?.className).toContain('min-h-[46px]');
      issueBtnNode?.props?.onClick?.();
      expect(onIssueBondSpy).toHaveBeenCalledWith(BondTrancheId.WORKING_CAPITAL);
    });
  });
});
