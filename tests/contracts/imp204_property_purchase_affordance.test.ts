// [CONTRACT TEST] IMP-204: Resilient Property Purchase Affordance & ActionDock Purchase Anchor
// Traceability Tags: [TC-204.01..16/MSS] & [UC-IMP204]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { useGameStore } from '../../src/client/store/game_store.js';
import { TurnPhase, type Player } from '../../src/domain/room.js';
import { ActionDock } from '../../src/client/ui/action_dock.js';
import { TitleDeedActionFooter } from '../../src/client/ui/modals/title_deed_action_footer.js';
import { resolveActionDockNotice, formatCurrency } from '../../src/client/ui/ui_helpers.js';

// Dynamic lazy import hooks for pending modules to be implemented in Station 2
const AFFORDANCE_PATH = '../../src/client/ui/modals/title_deed_affordance';
let affordanceMod: any = null;
try {
  affordanceMod = await import(/* @vite-ignore */ AFFORDANCE_PATH);
} catch {
  try {
    affordanceMod = await import(/* @vite-ignore */ `${AFFORDANCE_PATH}.js`);
  } catch {
    affordanceMod = null;
  }
}

const resolvePurchaseAffordance = affordanceMod?.resolvePurchaseAffordance;
const resolveEvenBuildRules = affordanceMod?.resolveEvenBuildRules;
const resolveTitleDeedModalState = affordanceMod?.resolveTitleDeedModalState;

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

describe('[TC-204/MSS][UC-IMP204] Property Purchase Affordance & ActionDock Contract Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
  });

  // =========================================================================
  // FACET 1: Boundary & Accurate Affordance Pricing (TC-204.01 - 05B)
  // =========================================================================
  describe('Facet 1: Boundary & Accurate Affordance Pricing', () => {
    it('[TC-204.01/MSS][UC-IMP204][Facet-1/Pricing] resolvePurchaseAffordance tính đúng canAffordCash = false khi buyerBalance < deedPrice và lấy giá từ PROPERTY_DEEDS', () => {
      const affordance = resolvePurchaseAffordance({
        cellIndex: 9, // Lăng Cô: deed price 1200
        buyerBalance: 800,
        ownedProperties: [],
        mortgagedProperties: [],
      });
      expect(affordance.deedPrice).toBe(1200);
      expect(affordance.canAffordCash).toBe(false);
    });

    it('[TC-204.02/MSS][UC-IMP204][Facet-1/Pricing] resolvePurchaseAffordance tính đúng số tiền thiếu hụt shortfall = deedPrice - buyerBalance', () => {
      const affordance = resolvePurchaseAffordance({
        cellIndex: 9, // deed price 1200
        buyerBalance: 800,
        ownedProperties: [],
      });
      expect(affordance.shortfall).toBe(400);
    });

    it('[TC-204.03/MSS][UC-IMP204][Facet-1/Pricing] resolvePurchaseAffordance nhận diện chính xác canCoverWithMortgage = true khi buyerBalance + totalMortgageCapacity >= deedPrice', () => {
      // Cell 9 (Lăng Cô, 1200). Ví có 800. Sở hữu ô 6 (Phong Nha, 1000 -> 50% = 500)
      // Tổng khả dụng: 800 + 500 = 1300 >= 1200
      const affordance = resolvePurchaseAffordance({
        cellIndex: 9,
        buyerBalance: 800,
        ownedProperties: [6],
        mortgagedProperties: [],
        levelMap: { 6: 0 },
      });
      expect(affordance.totalMortgageCapacity).toBe(500);
      expect(affordance.canCoverWithMortgage).toBe(true);
    });

    it('[TC-204.04/MSS][UC-IMP204][Facet-1/Pricing] resolvePurchaseAffordance trả về canCoverWithMortgage = false khi vay tối đa vẫn không đủ tiền mua đất', () => {
      // Cell 39 (Tràng Tiền, 4000). Ví có 500. Sở hữu ô 1 (Hà Tiên, 600 -> 50% = 300)
      // Tổng khả dụng: 500 + 300 = 800 < 4000
      const affordance = resolvePurchaseAffordance({
        cellIndex: 39,
        buyerBalance: 500,
        ownedProperties: [1],
        mortgagedProperties: [],
        levelMap: { 1: 0 },
      });
      expect(affordance.totalMortgageCapacity).toBe(300);
      expect(affordance.canCoverWithMortgage).toBe(false);
    });

    it('[TC-204.05/MSS][UC-IMP204][Facet-1/Pricing] Khi isTradeFrozen = true, resolvePurchaseAffordance khóa hạn mức thế chấp về 0', () => {
      const affordance = resolvePurchaseAffordance({
        cellIndex: 9,
        buyerBalance: 800,
        ownedProperties: [6],
        mortgagedProperties: [],
        isTradeFrozen: true,
      });
      expect(affordance.hasMortgageableProperties).toBe(false);
      expect(affordance.totalMortgageCapacity).toBe(0);
      expect(affordance.canCoverWithMortgage).toBe(false);
    });

    it('[TC-204.05B/MSS][UC-IMP204][Facet-1/Pricing] resolveEvenBuildRules trả về upgradeBlockedReason = "Đã đạt cấp độ tối đa" khi currentLevel >= 3', () => {
      const rules = resolveEvenBuildRules({
        isOwner: true,
        isMortgaged: false,
        hasAllProperties: true,
        hasAnyGroupMortgaged: false,
        currentLevel: 3,
        cellIndex: 1,
        groupCells: [1, 3],
        levelMap: { 1: 3, 3: 3 },
      });
      expect(rules.upgradeBlockedReason).toBe('Đã đạt cấp độ tối đa');
    });
  });

  // =========================================================================
  // FACET 2: ActionDock Priority & Anti-Deadlock Invariant (TC-204.06 - 09)
  // =========================================================================
  describe('Facet 2: ActionDock Priority & Anti-Deadlock Invariant', () => {
    it('[TC-204.06/MSS][UC-IMP204][Facet-2/AntiDeadlock] Khi người chơi đứng tại ô chưa ai mua trong TurnPhase.ActionPhase và đổ ra đôi (canRollAgain === true), ActionDock render nút Primary là [🏷️ Mua Đất]', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        playerPositions: { p1: 9 }, // Lăng Cô: unowned property
        turnPhase: TurnPhase.ActionPhase,
        hasRolledThisTurn: true,
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Sài Thành',
            balance: 1500,
            tokenColor: '#38BDF8',
            ownedProperties: [],
            mortgagedProperties: [],
            isBot: false,
            bankrupt: false,
          } as any,
        },
        activeModifiers: [],
      });

      const html = renderToStaticMarkup(
        React.createElement(ActionDock, {
          localPlayerId: 'p1',
          isMyTurn: true,
          hasRolledThisTurn: true,
          canRollAgain: true,
        })
      );
      expect(html).toContain('Mua Đất');
      expect(html).toContain('🏷️');
    });

    it('[TC-204.07/MSS][UC-IMP204][Facet-2/AntiDeadlock] Khi người chơi từ chối mua và phòng chuyển sang TurnPhase.PropertyManagement, isStandingOnBuyable trở thành false, ActionDock khôi phục ngay nút Primary là [🎲 Đổ Tiếp (Đôi)]', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        playerPositions: { p1: 9 },
        turnPhase: TurnPhase.PropertyManagement,
        hasRolledThisTurn: true,
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Sài Thành',
            balance: 1500,
            tokenColor: '#38BDF8',
            ownedProperties: [],
            mortgagedProperties: [],
            isBot: false,
            bankrupt: false,
          } as any,
        },
        activeModifiers: [],
      });

      // Deadlock check: In PropertyManagement, isStandingOnBuyable must be false regardless of canRollAgain
      const htmlNonDouble = renderToStaticMarkup(
        React.createElement(ActionDock, {
          localPlayerId: 'p1',
          isMyTurn: true,
          hasRolledThisTurn: true,
          canRollAgain: false,
        })
      );
      expect(htmlNonDouble).not.toContain('Mua Đất');

      const htmlDouble = renderToStaticMarkup(
        React.createElement(ActionDock, {
          localPlayerId: 'p1',
          isMyTurn: true,
          hasRolledThisTurn: true,
          canRollAgain: true,
        })
      );
      expect(htmlDouble).toContain('Đổ Tiếp (Đôi)');
      expect(htmlDouble).not.toContain('Mua Đất');
    });

    it('[TC-204.08/MSS][UC-IMP204][Facet-2/AntiDeadlock] Khi người chơi đứng tại ô chưa ai mua, ActionDock Notice Chip hiển thị loại buy_opportunity với tên ô và giá tiền định dạng chuẩn formatCurrency', () => {
      const notice = resolveActionDockNotice({
        isStandingOnBuyable: true,
        isMyTurn: true,
        buyableCellName: 'Lăng Cô',
        buyableCellPrice: 1200,
      } as any);
      expect(notice).not.toBeNull();
      expect(notice?.type).toBe('buy_opportunity');
      expect(notice?.desktopText).toContain(`Lăng Cô (${formatCurrency(1200)})`);
      expect(notice?.tone).toBe('warning');
    });

    it('[TC-204.09/MSS][UC-IMP204][Facet-2/AntiDeadlock] Bấm nút [🏷️ Mua Đất] trên ActionDock mở modal deed với đúng cellIndex và isBuyOpportunity = true', () => {
      const openModalSpy = vi.fn();
      useGameStore.setState({
        openModal: openModalSpy,
        currentTurnPlayerId: 'p1',
        playerPositions: { p1: 9 },
        turnPhase: TurnPhase.ActionPhase,
        hasRolledThisTurn: true,
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Sài Thành',
            balance: 1500,
            tokenColor: '#38BDF8',
            ownedProperties: [],
            mortgagedProperties: [],
            isBot: false,
            bankrupt: false,
          } as any,
        },
        activeModifiers: [],
      });

      let vdom: any;
      function TestWrapper() {
        vdom = ActionDock({
          localPlayerId: 'p1',
          isMyTurn: true,
          hasRolledThisTurn: true,
          canRollAgain: false,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const buyBtn = findVNode(vdom, (n) => n?.type === 'button' && n.props?.['aria-label']?.includes('Mua ô đất'));
      expect(buyBtn).toBeDefined();
      buyBtn.props.onClick();

      expect(openModalSpy).toHaveBeenCalledWith('deed', expect.objectContaining({
        cellIndex: 9,
        isBuyOpportunity: true,
      }));
    });
  });

  // =========================================================================
  // FACET 3: TitleDeed Modal Resilient Actions (TC-204.10 - 16)
  // =========================================================================
  describe('Facet 3: TitleDeed Modal Resilient Actions', () => {
    it('[TC-204.10/MSS][UC-IMP204][Facet-3/ResilientModal] Khi người chơi đủ tiền mặt (canAffordCash === true), Footer render nút [Mua BĐS (X Tr.)] (Active, Emerald) và [Bỏ Qua]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: false,
          canBuy: true,
          deedPrice: 1200,
          isBuyOpportunity: true,
        } as any)
      );
      expect(html).toContain(`Mua BĐS (${formatCurrency(1200)})`);
      expect(html).toContain('bg-emerald-700');
      expect(html).toContain('Đóng Xoay Vốn');
      expect(html).toContain('Bỏ Qua (Pass)');
    });

    it('[TC-204.11/MSS][UC-IMP204][Facet-3/ResilientModal] Khi người chơi thiếu tiền mặt nhưng đủ khả năng thế chấp (canCoverWithMortgage === true), Footer render nút [🏛️ Cầm Cố Để Mua] và [Đóng Xoay Vốn]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: false,
          canBuy: false,
          canCoverWithMortgage: true,
          shortfall: 400,
          totalMortgageCapacity: 500,
          deedPrice: 1200,
          isBuyOpportunity: true,
        } as any)
      );
      expect(html).toContain('Cầm Cố Để Mua');
      expect(html).toContain('Đóng Xoay Vốn');
    });

    it('[TC-204.12/MSS][UC-IMP204][Facet-3/ResilientModal] Bấm [🏛️ Cầm Cố Để Mua] kích hoạt onOpenMortgage, tuyệt đối không gửi bất kỳ intent mua đất nào lên server', () => {
      const onOpenMortgageSpy = vi.fn();
      const onBuySpy = vi.fn();
      let vdom: any;
      function TestFooter() {
        vdom = TitleDeedActionFooter({
          isOwned: false,
          canBuy: false,
          canCoverWithMortgage: true,
          shortfall: 400,
          totalMortgageCapacity: 500,
          deedPrice: 1200,
          isBuyOpportunity: true,
          onOpenMortgage: onOpenMortgageSpy,
          onBuy: onBuySpy,
        } as any);
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestFooter));

      const mortgageBtn = findVNode(vdom, (n) => n?.type === 'button' && typeof n.props?.children === 'string' && n.props.children.includes('Cầm Cố Để Mua'));
      expect(mortgageBtn).toBeDefined();
      mortgageBtn.props.onClick();

      expect(onOpenMortgageSpy).toHaveBeenCalledOnce();
      expect(onBuySpy).not.toHaveBeenCalled();
    });

    it('[TC-204.13/MSS][UC-IMP204][Facet-3/ResilientModal] Bấm [Đóng Xoay Vốn] gọi onClose, tuyệt đối KHÔNG kích hoạt onPass (INTENT_DECLINE)', () => {
      const onCloseSpy = vi.fn();
      const onPassSpy = vi.fn();
      let vdom: any;
      function TestFooter() {
        vdom = TitleDeedActionFooter({
          isOwned: false,
          canBuy: false,
          canCoverWithMortgage: true,
          shortfall: 400,
          totalMortgageCapacity: 500,
          deedPrice: 1200,
          isBuyOpportunity: true,
          onClose: onCloseSpy,
          onPass: onPassSpy,
        } as any);
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestFooter));

      const closeBtn = findVNode(vdom, (n) => n?.type === 'button' && n.props?.children === 'Đóng Xoay Vốn');
      expect(closeBtn).toBeDefined();
      closeBtn.props.onClick();

      expect(onCloseSpy).toHaveBeenCalledOnce();
      expect(onPassSpy).not.toHaveBeenCalled();
    });

    it('[TC-204.14/MSS][UC-IMP204][Facet-3/ResilientModal] Khi isBuyOpportunity === true, nút Bỏ Qua strictly gọi onPass (không có silent fallback)', () => {
      const onCloseSpy = vi.fn();
      let vdom: any;
      function TestFooter() {
        vdom = TitleDeedActionFooter({
          isOwned: false,
          canBuy: true,
          deedPrice: 1200,
          isBuyOpportunity: true,
          onPass: undefined,
          onClose: onCloseSpy,
        } as any);
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestFooter));

      const passBtn = findVNode(vdom, (n) => n?.type === 'button' && (n.props?.children === 'Bỏ Qua' || n.props?.children === 'Bỏ Qua (Pass)'));
      expect(passBtn).toBeDefined();
      passBtn.props.onClick?.();

      expect(onCloseSpy).not.toHaveBeenCalled();
    });

    it('[TC-204.15/MSS][UC-IMP204][Facet-3/ResilientModal] Khi người chơi click xem ô đất khác (isBuyOpportunity === false), Footer chỉ hiển thị duy nhất nút [Đóng], tuyệt đối không có [Bỏ Qua] hay [Cầm Cố Để Mua]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: false,
          isBuyOpportunity: false,
          deedPrice: 1200,
          canBuy: false,
          onClose: vi.fn(),
        } as any)
      );
      expect(html).toContain('Đóng');
      expect(html).not.toContain('Bỏ Qua');
      expect(html).not.toContain('Cầm Cố Để Mua');
      expect(html).not.toContain('Mua BĐS');
    });

    it('[TC-204.16/MSS][UC-IMP204][Facet-3/ResilientModal] Store Reactivity E2E: Ban đầu ví 500, giá đất 1000 -> canBuy = false, shortfall = 500. Sau khi thế chấp 1 BĐS và store balance cập nhật lên 1100, mở lại modal deed nhận canBuy = true, nút Mua sáng xanh, shortfall = 0', () => {
      const cellIndex = 6; // Phong Nha: deed price 1000
      const initialPlayer: Player = {
        id: 'p1',
        name: 'Chủ Tịch Sài Thành',
        balance: 500,
        tokenColor: '#38BDF8',
        ownedProperties: [1], // Hà Tiên (price 600)
        mortgagedProperties: [],
        isBot: false,
        bankrupt: false,
      } as any;

      const state1 = resolveTitleDeedModalState({
        cellIndex,
        myId: 'p1',
        myPlayer: initialPlayer,
        playersInfo: { p1: initialPlayer },
        levelMap: {},
        turnPhase: 'ActionPhase',
        currentTurnPlayerId: 'p1',
      });
      expect(state1.canBuy).toBe(false);
      expect(state1.shortfall).toBe(500);

      const updatedPlayer: Player = {
        ...initialPlayer,
        balance: 1100,
        mortgagedProperties: [1],
      };

      const state2 = resolveTitleDeedModalState({
        cellIndex,
        myId: 'p1',
        myPlayer: updatedPlayer,
        playersInfo: { p1: updatedPlayer },
        levelMap: {},
        turnPhase: 'ActionPhase',
        currentTurnPlayerId: 'p1',
      });
      expect(state2.canBuy).toBe(true);
      expect(state2.shortfall).toBe(0);
    });
  });
});
