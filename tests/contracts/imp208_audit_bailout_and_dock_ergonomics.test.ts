// [TC-208.01/MSS..TC-208.16/MSS][UC-IMP208]
// Contract Test Suite: Audit Bailout, Dice De-Collision & Mobile Dock Ergonomics (IMP-208)
// Universal 5-Facet Matrix:
// Facet 1: Decollision & Flex Layout Flow (TC-208.01..TC-208.03)
// Facet 2: Audit Notice State Synchronization & Actor Inversion Defense (TC-208.04..TC-208.06)
// Facet 3: Compact Bailout Button & Mobile 360px Fit (TC-208.07..TC-208.09)
// Facet 4: ActionDock End Turn Callout & Affordance (TC-208.10..TC-208.12)
// Facet 5: TitleDeed Close Label Ergonomics (TC-208.13..TC-208.16)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { ActionDock } from '../../src/client/ui/action_dock.js';
import { resolveActionDockNotice } from '../../src/client/ui/ui_helpers.js';
import { TitleDeedActionFooter } from '../../src/client/ui/modals/title_deed_action_footer.js';
import { resolveTitleDeedModalState } from '../../src/client/ui/modals/title_deed_affordance.js';
import { TurnPhase } from '../../src/domain/room.js';
import { useGameStore } from '../../src/client/store/game_store.js';

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

describe('[TC-208.01/MSS..TC-208.16/MSS][UC-IMP208] Audit Bailout & Dock Ergonomics Suite', () => {
  beforeEach(() => {
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
  // Facet 1: Decollision & Flex Layout Flow (Khử đè chữ)
  // =========================================================================
  it('[TC-208.01/MSS][UC-IMP208/IMP210] ActionDock không render audit-notice-chip theo yêu cầu tối giản UX IMP-210, wrapper cha bảo toàn layout flex gap-1.5', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 1000,
          inAudit: true,
          auditTurnsLeft: 3,
          bankrupt: false,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    expect(html).not.toContain('data-testid="audit-notice-chip"');
    expect(html).toContain('gap-1.5');
  });

  it('[TC-208.02/MSS][UC-IMP208/IMP210] ActionDock triệt tiêu hoàn toàn actionDockNotice khỏi DOM khi inAudit = true', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 1000,
          inAudit: true,
          auditTurnsLeft: 3,
          bankrupt: false,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    expect(html).not.toContain('data-testid="audit-notice-chip"');
    expect(html).not.toContain('-notice-chip');
  });

  it('[TC-208.03/MSS][UC-IMP208] ActionDock outer container mang class relative flex flex-col items-center gap-1.5', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 1000,
          inAudit: false,
          bankrupt: false,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    expect(html).toContain('relative flex flex-col items-center gap-1.5');
  });

  // =========================================================================
  // Facet 2: Audit Notice State Synchronization & Actor Inversion Defense
  // =========================================================================
  it('[TC-208.04/MSS][UC-IMP208] Khi inAudit = true, isMyTurn = true và hasRolledThisTurn = false: resolveActionDockNotice trả về mobileText là Ô 10 (còn 3 lượt): Gieo đôi hoặc bảo lãnh', () => {
    const notice = resolveActionDockNotice({
      isMyTurn: true,
      inAudit: true,
      auditTurnsLeft: 3,
      hasRolledThisTurn: false,
    });

    expect(notice?.type).toBe('audit');
    expect(notice?.mobileText).toBe('Ô 10 (còn 3 lượt): Gieo đôi hoặc bảo lãnh');
  });

  it('[TC-208.05/MSS][UC-IMP208] Khi inAudit = true, isMyTurn = true và hasRolledThisTurn = true: resolveActionDockNotice trả về mobileText là Không ra đôi: Nộp bảo lãnh hoặc Xong lượt', () => {
    const notice = resolveActionDockNotice({
      isMyTurn: true,
      inAudit: true,
      auditTurnsLeft: 3,
      hasRolledThisTurn: true,
    });

    expect(notice?.type).toBe('audit');
    expect(notice?.mobileText).toBe('Không ra đôi: Nộp bảo lãnh hoặc Xong lượt');
  });

  it('[TC-208.06/MSS][UC-IMP208] Khi inAudit = true nhưng isMyTurn = false và có botPacing: resolveActionDockNotice trả về notice type bot_pacing thay vì audit (Actor Inversion Defense)', () => {
    const notice = resolveActionDockNotice({
      isMyTurn: false,
      inAudit: true,
      auditTurnsLeft: 2,
      botPacing: { displayText: 'Bot đang tính toán...', isBotTurn: true } as any,
    });

    expect(notice?.type).toBe('bot_pacing');
    expect(notice?.mobileText).toBe('Bot đang tính toán...');
  });

  // =========================================================================
  // Facet 3: Compact Bailout Button & Mobile 360px Fit (Thu gọn nút Bảo Lãnh)
  // =========================================================================
  it('[TC-208.07/MSS][UC-IMP208] Nút Bảo Lãnh trong ActionDock không còn chứa badge ${turns} lượt bên trong nút', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 1000,
          inAudit: true,
          auditTurnsLeft: 3,
          bankrupt: false,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );
    const bailoutMatch = html.match(/<button[^>]*aria-label="[^"]*bảo lãnh[^"]*"[^>]*>[\s\S]*?<\/button>/i);

    expect(bailoutMatch).not.toBeNull();
    expect(bailoutMatch![0]).not.toContain('3 lượt');
    expect(bailoutMatch![0]).not.toContain('lượt');
  });

  it('[TC-208.08/MSS][UC-IMP208] Nút Bảo Lãnh hiển thị icon ⚖️ và nhãn Bảo Lãnh (500)', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 1000,
          inAudit: true,
          auditTurnsLeft: 3,
          bankrupt: false,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );
    const bailoutMatch = html.match(/<button[^>]*aria-label="[^"]*bảo lãnh[^"]*"[^>]*>[\s\S]*?<\/button>/i);

    expect(bailoutMatch).not.toBeNull();
    expect(bailoutMatch![0]).toContain('⚖️');
    expect(bailoutMatch![0]).toContain('Bảo Lãnh (500)');
  });

  it('[TC-208.09/MSS][UC-IMP208] Nút Bảo Lãnh bị disabled khi balance < 500', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 350,
          inAudit: true,
          auditTurnsLeft: 2,
          bankrupt: false,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );
    const bailoutMatch = html.match(/<button[^>]*aria-label="[^"]*bảo lãnh[^"]*"[^>]*>[\s\S]*?<\/button>/i);

    expect(bailoutMatch).not.toBeNull();
    expect(bailoutMatch![0]).toContain('disabled=""');
    expect(bailoutMatch![0]).toContain('cursor-not-allowed');
  });

  // =========================================================================
  // Facet 4: ActionDock End Turn Callout & Affordance (Trợ lực nút Kết Thúc Lượt)
  // =========================================================================
  it('[TC-208.10/MSS][UC-IMP208] Khi inAudit = true, hasRolledThisTurn = true và canRollAgain = false: Nút Kết Thúc Lượt có class hiệu ứng animate-pulse và viền sáng ring-emerald-400', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: true,
      dice: [1, 2],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 1000,
          inAudit: true,
          auditTurnsLeft: 2,
          bankrupt: false,
          consecutiveDoubles: 0,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, {
        localPlayerId: 'p1',
        isMyTurn: true,
        hasRolledThisTurn: true,
        canRollAgain: false,
      })
    );
    const endTurnMatch = html.match(/<button[^>]*aria-label="Kết thúc lượt"[^>]*>[\s\S]*?<\/button>/i);

    expect(endTurnMatch).not.toBeNull();
    expect(endTurnMatch![0]).toContain('animate-pulse');
    expect(endTurnMatch![0]).toContain('ring-emerald-400');
  });

  it('[TC-208.11/MSS][UC-IMP208] Nút gieo xúc xắc bị disabled khi đã đổ trong tù (hasRolledThisTurn = true)', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: true,
      dice: [1, 2],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 1000,
          inAudit: true,
          auditTurnsLeft: 2,
          bankrupt: false,
          consecutiveDoubles: 0,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, {
        localPlayerId: 'p1',
        isMyTurn: true,
        hasRolledThisTurn: true,
        canRollAgain: false,
      })
    );
    const rollMatch = html.match(/<button[^>]*data-testid="roll-dice-btn"[^>]*>[\s\S]*?<\/button>/i);

    expect(rollMatch).not.toBeNull();
    expect(rollMatch![0]).toContain('disabled=""');
    expect(rollMatch![0]).toContain('cursor-not-allowed');
  });

  it('[TC-208.12/MSS][UC-IMP208] Nút Kết Thúc Lượt đạt chuẩn touch target WCAG min-h-[44px]', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 1000,
          inAudit: false,
          bankrupt: false,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );
    const endTurnMatch = html.match(/<button[^>]*aria-label="Kết thúc lượt"[^>]*>[\s\S]*?<\/button>/i);

    expect(endTurnMatch).not.toBeNull();
    expect(endTurnMatch![0]).toContain('min-h-[44px]');
  });

  // =========================================================================
  // Facet 5: TitleDeed Close Label Ergonomics (Ngữ cảnh hóa nút Sổ Đỏ)
  // =========================================================================
  it('[TC-208.13/MSS][UC-IMP208] Khi canBuy = true, TitleDeedActionFooter không còn nút Đóng ở footer (chỉ còn nút Header [X])', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedActionFooter, {
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: true,
        deedPrice: 1000,
      })
    );

    expect(html).not.toContain('✕ Đóng');
    expect(html).not.toContain('Đóng Xoay Vốn');
  });

  it('[TC-208.14/MSS][UC-IMP208] Khi canBuy = false, TitleDeedActionFooter không còn nút Đóng ở footer (chỉ còn nút Header [X])', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedActionFooter, {
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: false,
        shortfall: 200,
        totalMortgageCapacity: 500,
        deedPrice: 1000,
      })
    );

    expect(html).not.toContain('✕ Đóng');
    expect(html).not.toContain('Đóng Xoay Vốn');
  });

  it('[TC-208.15/MSS][UC-IMP208] Khi isTradeFrozen = true, TitleDeedActionFooter render nút phụ với nhãn ✕ Đóng (col-span-1 đối xứng)', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedActionFooter, {
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: true,
        isTradeFrozen: true,
        deedPrice: 1000,
      })
    );

    expect(html).toContain('✕ Đóng');
    expect(html).not.toContain('col-span-2');
    expect(html).not.toContain('Đóng Xoay Vốn');
  });

  it('[TC-208.16/MSS][UC-IMP208] Khi isTradeFrozen = true, bấm ✕ Đóng gọi onClose và không kích hoạt onPass', () => {
    const onCloseSpy = vi.fn();
    const onPassSpy = vi.fn();
    let vdom: any;

    function TestFooter() {
      vdom = TitleDeedActionFooter({
        isOwned: false,
        isBuyOpportunity: true,
        canBuy: true,
        isTradeFrozen: true,
        deedPrice: 1000,
        onClose: onCloseSpy,
        onPass: onPassSpy,
      });
      return vdom;
    }

    renderToStaticMarkup(React.createElement(TestFooter));
    const closeBtn = findVNode(vdom, (n) => n?.type === 'button' && n.props?.children === '✕ Đóng');

    expect(closeBtn).toBeDefined();
    closeBtn?.props?.onClick?.();
    expect(onCloseSpy).toHaveBeenCalledOnce();
    expect(onPassSpy).not.toHaveBeenCalled();
  });

  // =========================================================================
  // Facet 6: Reopening Purchase Affordance & Utility Property Support
  // =========================================================================
  it('[TC-208.17/MSS][UC-IMP208] resolveTitleDeedModalState: Đang đứng tại ô chưa ai mua trong ActionPhase, dù canBuyOverride = false thì isBuyOpportunity vẫn phải bằng true', () => {
    const deedState = resolveTitleDeedModalState({
      cellIndex: 9,
      canBuyOverride: false,
      myId: 'p1',
      myPlayer: {
        id: 'p1',
        name: 'Chủ Tịch Hưng',
        position: 9,
        balance: 200,
        ownedProperties: [],
        mortgagedProperties: [],
      } as any,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          position: 9,
          balance: 200,
          ownedProperties: [],
          mortgagedProperties: [],
        } as any,
      },
      turnPhase: 'ActionPhase',
      currentTurnPlayerId: 'p1',
      levelMap: {},
    });

    expect(deedState.isBuyOpportunity).toBe(true);
    expect(deedState.canBuy).toBe(false);
  });

  it('[TC-208.18/MSS][UC-IMP208] ActionDock: Khi turnPhase === TurnPhase.ActionPhase, nút Mua Đất hiển thị dù hasRolledThisTurn chưa set trên client', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      playerPositions: { p1: 9 },
      turnPhase: TurnPhase.ActionPhase,
      hasRolledThisTurn: false,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 1000,
          ownedProperties: [],
          mortgagedProperties: [],
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    expect(html).toContain('Mua Đất');
  });

  it('[TC-208.19/MSS][UC-IMP208] ActionDock: Khi người chơi đứng tại ô dịch vụ CellType.Utility (Ô 12 EVN) chưa ai mua, nút Mua Đất hiển thị', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      playerPositions: { p1: 12 },
      turnPhase: TurnPhase.ActionPhase,
      hasRolledThisTurn: true,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 2000,
          ownedProperties: [],
          mortgagedProperties: [],
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    expect(html).toContain('Mua Đất');
  });

  it('[TC-208.20/MSS][UC-IMP208] resolveActionDockNotice: Khi isStandingOnBuyable = true, chip thông báo không chứa cụm từ xoay vốn và mang nhãn sở hữu', () => {
    const notice = resolveActionDockNotice({
      isMyTurn: true,
      isStandingOnBuyable: true,
      buyableCellName: 'Hà Tiên',
      buyableCellPrice: 600,
    });

    expect(notice).not.toBeNull();
    expect(notice?.desktopText).not.toContain('xoay vốn');
    expect(notice?.desktopText).toContain('để sở hữu');
  });
});

