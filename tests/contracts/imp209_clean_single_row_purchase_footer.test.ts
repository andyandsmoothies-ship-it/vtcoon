// [TC-209.01/MSS..TC-209.16/MSS][UC-IMP209]
// Contract Test Suite: Clean Single-Row Purchase Footer & Optical Header Polish (IMP-209)
// Universal 5-Facet Matrix:
// Facet 1: Single Row & Clean Layout Invariant (TC-209.01..TC-209.04b)
// Facet 2: Preserved Mua Identity & Disambiguation (TC-209.05..TC-209.08)
// Facet 3: Elimination of Batch Mortgage Anxiety (TC-209.09..TC-209.10)
// Facet 4: Freeze Trade State Integrity (TC-209.11..TC-209.12)
// Facet 5: Header Polish & ActionDock Notice Hygiene (TC-209.13..TC-209.16)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { TitleDeedActionFooter } from '../../src/client/ui/modals/title_deed_action_footer.js';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal.js';
import { ActionDock } from '../../src/client/ui/action_dock.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { TurnPhase } from '../../src/domain/room.js';

// Tree traversal helper for React vdom elements (defined outside it() to enforce zero loops inside test body)
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

describe('[TC-209.01/MSS..TC-209.16/MSS][UC-IMP209] Clean Single-Row Purchase Footer Contract Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
    useGameStore.setState({
      roundNumber: 1,
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      isRolling: false,
      dice: [1, 2],
      activeModal: null,
      activeModifiers: [],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 1000,
          tokenColor: '#EF4444',
          ownedProperties: [],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: false,
          auditTurnsLeft: 0,
          consecutiveDoubles: 0,
        } as any,
      },
    });
  });

  // =========================================================================
  // Facet 1: Single Row & Clean Layout Invariant (TC-209.01..TC-209.04b)
  // =========================================================================
  it('[TC-209.01/MSS][UC-IMP209] Footer khi có cơ hội mua (isBuyOpportunity = true) chỉ có đúng 1 hàng 2 nút bấm (grid-cols-2), tuyệt đối không có hàng thứ 3', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedActionFooter, {
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: true,
        deedPrice: 1200,
        isTradeFrozen: false,
      })
    );

    const buttonMatches = html.match(/<button/g) ?? [];
    expect(buttonMatches.length).toBe(2);
    expect(html).toContain('grid-cols-2');
    expect(html).not.toContain('✕ Đóng');
  });

  it('[TC-209.02/MSS][UC-IMP209] Footer tuyệt đối không còn render nút có nhãn ✕ Đóng hay Đóng Xoay Vốn ở cụm nút dưới đáy khi !isTradeFrozen', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedActionFooter, {
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: false,
        shortfall: 400,
        totalMortgageCapacity: 1000,
        deedPrice: 1200,
        isTradeFrozen: false,
      })
    );

    expect(html).not.toContain('✕ Đóng');
    expect(html).not.toContain('Đóng Xoay Vốn');
  });

  it('[TC-209.03/MSS][UC-IMP209] Footer render nút từ chối với nhãn chính thức ✕ Từ Chối Mua (thay thế hoàn toàn Bỏ Qua (Pass))', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedActionFooter, {
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: true,
        deedPrice: 1200,
        isTradeFrozen: false,
      })
    );

    expect(html).toContain('✕ Từ Chối Mua');
    expect(html).not.toContain('Bỏ Qua (Pass)');
    expect(html).not.toContain('Bỏ Qua');
  });

  it('[TC-209.04/MSS][UC-IMP209] Bấm nút ✕ Từ Chối Mua kích hoạt chính xác callback onPass (INTENT_DECLINE)', () => {
    const onPassSpy = vi.fn();
    let vdom: any;
    function TestFooter() {
      vdom = TitleDeedActionFooter({
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: true,
        deedPrice: 1200,
        isTradeFrozen: false,
        onPass: onPassSpy,
      });
      return vdom;
    }
    renderToStaticMarkup(React.createElement(TestFooter));
    const declineBtn = findVNode(vdom, (n) => n?.type === 'button' && (n.props?.children === '✕ Từ Chối Mua' || (typeof n.props?.children === 'string' && n.props.children.includes('Từ Chối Mua'))));

    expect(declineBtn).toBeTruthy();
    declineBtn?.props?.onClick?.();
    expect(onPassSpy).toHaveBeenCalledOnce();
  });

  it('[TC-209.04b/MSS][UC-IMP209] Bấm ✕ Từ Chối Mua bảo vệ nghiêm ngặt cách ly callback, onClose KHÔNG được gọi', () => {
    const onPassSpy = vi.fn();
    const onCloseSpy = vi.fn();
    let vdom: any;
    function TestFooter() {
      vdom = TitleDeedActionFooter({
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: true,
        deedPrice: 1200,
        isTradeFrozen: false,
        onPass: onPassSpy,
        onClose: onCloseSpy,
      });
      return vdom;
    }
    renderToStaticMarkup(React.createElement(TestFooter));
    const declineBtn = findVNode(vdom, (n) => n?.type === 'button' && (n.props?.children === '✕ Từ Chối Mua' || (typeof n.props?.children === 'string' && n.props.children.includes('Từ Chối Mua'))));

    expect(declineBtn).toBeTruthy();
    declineBtn?.props?.onClick?.();
    expect(onCloseSpy).toHaveBeenCalledTimes(0);
    expect(onPassSpy).toHaveBeenCalledTimes(1);
  });

  // =========================================================================
  // Facet 2: Preserved Mua Identity & Disambiguation (TC-209.05..TC-209.08)
  // =========================================================================
  it('[TC-209.05/MSS][UC-IMP209] Khi người chơi đủ tiền (canBuy = true), nút Mua mang nhãn Mua BĐS (1.200), có class bg-emerald-700 và active', () => {
    let vdom: any;
    function TestFooter() {
      vdom = TitleDeedActionFooter({
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: true,
        deedPrice: 1200,
        isTradeFrozen: false,
      });
      return vdom;
    }
    renderToStaticMarkup(React.createElement(TestFooter));
    const buyBtn = findVNode(vdom, (n) => n?.type === 'button' && typeof n.props?.children === 'string' && n.props.children.includes('Mua BĐS'));

    expect(buyBtn).toBeTruthy();
    expect(buyBtn?.props?.children).toBe('Mua BĐS (1.200)');
    expect(buyBtn?.props?.className).toContain('bg-emerald-700');
    expect(Boolean(buyBtn?.props?.disabled)).toBe(false);
  });

  it('[TC-209.06/MSS][UC-IMP209] Khi người chơi thiếu tiền (canBuy = false), nút Mua VẪN MANG NHÃN Mua BĐS (1.200) nhưng disabled, cursor-not-allowed, bg-slate-200', () => {
    let vdom: any;
    function TestFooter() {
      vdom = TitleDeedActionFooter({
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: false,
        shortfall: 400,
        totalMortgageCapacity: 1000,
        deedPrice: 1200,
        isTradeFrozen: false,
      });
      return vdom;
    }
    renderToStaticMarkup(React.createElement(TestFooter));
    const buyBtn = findVNode(vdom, (n) => n?.type === 'button' && typeof n.props?.children === 'string' && n.props.children.includes('Mua BĐS'));

    expect(buyBtn).toBeTruthy();
    expect(buyBtn?.props?.children).toBe('Mua BĐS (1.200)');
    expect(buyBtn?.props?.className).toContain('bg-slate-200');
    expect(buyBtn?.props?.className).toContain('cursor-not-allowed');
  });

  it('[TC-209.07/MSS][UC-IMP209] Khi thiếu tiền (canBuy = false), Footer render dòng text cảnh báo ⚠️ Số dư không đủ (Thiếu ...) với data-testid="insufficient-funds-notice"', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedActionFooter, {
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: false,
        shortfall: 400,
        deedPrice: 1200,
        isTradeFrozen: false,
      })
    );

    expect(html).toContain('data-testid="insufficient-funds-notice"');
    expect(html).toContain('⚠️ Số dư không đủ (Thiếu 400)');
  });

  it('[TC-209.08/MSS][UC-IMP209] Khi đủ tiền (canBuy = true), dòng text cảnh báo thiếu tiền hoàn toàn biến mất khỏi DOM', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedActionFooter, {
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: true,
        shortfall: 0,
        deedPrice: 1200,
        isTradeFrozen: false,
      })
    );

    expect(html).not.toContain('data-testid="insufficient-funds-notice"');
    expect(html).not.toContain('Số dư không đủ');
  });

  // =========================================================================
  // Facet 3: Elimination of Batch Mortgage Anxiety (TC-209.09..TC-209.10)
  // =========================================================================
  it('[TC-209.09/MSS][UC-IMP209] Footer tuyệt đối không còn render nút mang nhãn CẦM CỐ ĐỂ MUA hay hiển thị hạn mức vay gộp (+10.050)', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedActionFooter, {
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: false,
        canCoverWithMortgage: true,
        shortfall: 500,
        totalMortgageCapacity: 10050,
        deedPrice: 1200,
        isTradeFrozen: false,
      })
    );

    expect(html).not.toContain('CẦM CỐ ĐỂ MUA');
    expect(html).not.toContain('Cầm Cố Để Mua');
    expect(html).not.toContain('10.050');
  });

  it('[TC-209.10/MSS][UC-IMP209] Khi thiếu tiền và bị khóa, bấm vào nút Mua disabled không phát sinh bất kỳ callback hay intent nào', () => {
    const onBuySpy = vi.fn();
    const onPassSpy = vi.fn();
    const onOpenMortgageSpy = vi.fn();
    let vdom: any;
    function TestFooter() {
      vdom = TitleDeedActionFooter({
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: false,
        shortfall: 400,
        deedPrice: 1200,
        isTradeFrozen: false,
        onBuy: onBuySpy,
        onPass: onPassSpy,
        onOpenMortgage: onOpenMortgageSpy,
      });
      return vdom;
    }
    renderToStaticMarkup(React.createElement(TestFooter));
    const buyBtn = findVNode(vdom, (n) => n?.type === 'button' && typeof n.props?.children === 'string' && n.props.children.includes('Mua BĐS'));

    expect(buyBtn).toBeTruthy();
    expect(buyBtn?.props?.disabled).toBe(true);
    buyBtn?.props?.onClick?.();
    expect(onBuySpy).not.toHaveBeenCalled();
    expect(onOpenMortgageSpy).not.toHaveBeenCalled();
  });

  // =========================================================================
  // Facet 4: Freeze Trade State Integrity (TC-209.11..TC-209.12)
  // =========================================================================
  it('[TC-209.11/MSS][UC-IMP209] Khi isTradeFrozen = true, nút Mua mang nhãn ❄️ Đóng Băng (Cấm Mua) và bị disabled', () => {
    let vdom: any;
    function TestFooter() {
      vdom = TitleDeedActionFooter({
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: true,
        isTradeFrozen: true,
        deedPrice: 1200,
      });
      return vdom;
    }
    renderToStaticMarkup(React.createElement(TestFooter));
    const freezeBtn = findVNode(vdom, (n) => n?.type === 'button' && typeof n.props?.children === 'string' && n.props.children.includes('Đóng Băng'));

    expect(freezeBtn).toBeTruthy();
    expect(freezeBtn?.props?.children).toBe('❄️ Đóng Băng (Cấm Mua)');
    expect(freezeBtn?.props?.disabled).toBe(true);
  });

  it('[TC-209.12/MSS][UC-IMP209] Khi isTradeFrozen = true, nút từ chối đóng vai trò nút Đóng chiếm đúng 1 cột đối xứng và gọi onClose', () => {
    const onCloseSpy = vi.fn();
    let vdom: any;
    function TestFooter() {
      vdom = TitleDeedActionFooter({
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: true,
        isTradeFrozen: true,
        deedPrice: 1200,
        onClose: onCloseSpy,
      });
      return vdom;
    }
    renderToStaticMarkup(React.createElement(TestFooter));
    const closeBtn = findVNode(vdom, (n) => n?.type === 'button' && n.props?.children === '✕ Đóng');

    expect(closeBtn).toBeTruthy();
    expect(closeBtn?.props?.className).not.toContain('col-span-2');
    closeBtn?.props?.onClick?.();
    expect(onCloseSpy).toHaveBeenCalledOnce();
  });

  // =========================================================================
  // Facet 5: Header Polish & ActionDock Notice Hygiene (TC-209.13..TC-209.16)
  // =========================================================================
  it('[TC-209.13/MSS][UC-IMP209] Header Sổ Đỏ tiêu đề ô đất có padding cân đối px-12 sm:px-14 đối xứng 2 bên', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
        onClose: vi.fn(),
      })
    );

    expect(html).toContain('px-12 sm:px-14');
    expect(html).not.toContain('pr-12 sm:pr-14');
  });

  it('[TC-209.14/MSS][UC-IMP209] Nút [X] tròn trên header mang class mờ quang học bg-black/25 và touch target min-w-[44px] min-h-[44px]', () => {
    let vdom: any;
    function TestModal() {
      vdom = TitleDeedModal({
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
        onClose: vi.fn(),
      });
      return vdom;
    }
    renderToStaticMarkup(React.createElement(TestModal));
    const headerCloseBtn = findVNode(vdom, (n) => n?.type === 'button' && n.props?.['aria-label'] === 'Đóng Sổ Đỏ');

    expect(headerCloseBtn).toBeTruthy();
    expect(headerCloseBtn?.props?.className).toContain('bg-black/25');
    expect(headerCloseBtn?.props?.className).toContain('min-w-[44px]');
    expect(headerCloseBtn?.props?.className).not.toContain('bg-slate-900/80');
  });

  it('[TC-209.15/MSS][UC-IMP209] Khi activeModal !== null, ActionDock không render actionDockNotice (tránh đè lem nhem phía sau modal)', () => {
    useGameStore.setState({
      activeModal: 'deed',
      currentTurnPlayerId: 'p1',
      playerPositions: { p1: 1 },
      turnPhase: TurnPhase.ActionPhase,
      hasRolledThisTurn: true,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          position: 1,
          balance: 1000,
          ownedProperties: [],
          mortgagedProperties: [],
          bankrupt: false,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    expect(html).not.toContain('buy_opportunity-notice-chip');
    expect(html).not.toContain('Đứng tại');
  });

  it('[TC-209.16/MSS][UC-IMP209/IMP210] Khi activeModal === null và isStandingOnBuyable = true, ActionDock KHÔNG hiển thị notice chip Đứng tại ... (đã loại bỏ theo yêu cầu UX tối giản)', () => {
    useGameStore.setState({
      activeModal: null,
      currentTurnPlayerId: 'p1',
      playerPositions: { p1: 1 },
      turnPhase: TurnPhase.ActionPhase,
      hasRolledThisTurn: true,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          position: 1,
          balance: 1000,
          ownedProperties: [],
          mortgagedProperties: [],
          bankrupt: false,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    expect(html).not.toContain('buy_opportunity-notice-chip');
    expect(html).not.toContain('Đứng tại');
    expect(html).not.toContain('Bấm Mua Đất để chốt');
  });
});
