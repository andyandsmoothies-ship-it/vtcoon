// [IMP-135][Station 1] RED Contract Test Suite: Audit Station Roll Doubles, Anti-Exploit & End Turn Pacing
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & State): isRollActionDisabled allows initial roll in audit to find doubles (hasRolledThisTurn: false)
// Facet 2 (Reactivity & Defense): isRollActionDisabled locks after single roll without doubles; handles rolling/moving/bankrupt guards
// Facet 3 (End Turn & Pacing): isEndTurnDisabled allows direct sentence serving (hasRolledThisTurn: false) & turn conclusion
// Facet 4 (Component Rendering & Error Defense): ActionDock DOM markup verification via renderToStaticMarkup with roll-dice-btn & bailout-btn

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  isRollActionDisabled,
  isEndTurnDisabled,
  resolveActionDockNotice,
} from '../../src/client/ui/ui_helpers';
import { ActionDock } from '../../src/client/ui/action_dock';
import { useGameStore } from '../../src/client/store/game_store';

// ============================================================================
// FACET 1: BOUNDARY & STATE — AUDIT INITIAL ROLL ALLOWED (4 ATOMIC TESTS)
// ============================================================================
describe('[IMP-135] Facet 1: Boundary & State — Audit Initial Roll Allowed', () => {
  it('[TC-IMP135.01/MSS][UC-AUDIT-ROLL] isRollActionDisabled trả về false khi inAudit: true và hasRolledThisTurn: false để tìm xúc xắc đôi', () => {
    const disabled = isRollActionDisabled({
      inAudit: true,
      hasRolledThisTurn: false,
      isMyTurn: true,
      isRolling: false,
      isPawnMoving: false,
      isBankrupt: false,
    });
    expect(disabled).toBe(false);
  });

  it('[TC-IMP135.02/MSS][UC-AUDIT-ROLL] isRollActionDisabled trả về false khi inAudit: true tại pha WaitingRoll đầu lượt', () => {
    const disabled = isRollActionDisabled({
      inAudit: true,
      hasRolledThisTurn: false,
      turnPhase: 'WaitingRoll',
      isMyTurn: true,
      isRolling: false,
      isPawnMoving: false,
      isBankrupt: false,
    });
    expect(disabled).toBe(false);
  });

  it('[TC-IMP135.03/MSS][UC-AUDIT-ROLL] isRollActionDisabled trả về false khi inAudit: true và hasRolledThisTurn là undefined (chưa gieo)', () => {
    const disabled = isRollActionDisabled({
      inAudit: true,
      hasRolledThisTurn: undefined,
      isMyTurn: true,
      isRolling: false,
      isPawnMoving: false,
      isBankrupt: false,
    });
    expect(disabled).toBe(false);
  });

  it('[TC-IMP135.04/MSS][UC-AUDIT-ROLL] isRollActionDisabled trả về false khi inAudit: true ngay cả khi người chơi không đủ tiền bảo lãnh (0 Tr.)', () => {
    const disabled = isRollActionDisabled({
      inAudit: true,
      hasRolledThisTurn: false,
      isMyTurn: true,
      isRolling: false,
      isPawnMoving: false,
      isBankrupt: false,
    });
    expect(disabled).toBe(false);
  });
});

// ============================================================================
// FACET 2: REACTIVITY & DEFENSE — SINGLE ROLL LOCK & DEFENSIVE GUARDS (8 ATOMIC TESTS)
// ============================================================================
describe('[IMP-135] Facet 2: Reactivity & Defense — Single Roll Lock & Exploitation Defense', () => {
  it('[TC-IMP135.05/MSS][UC-AUDIT-ROLL] isRollActionDisabled trả về true khi inAudit: true và hasRolledThisTurn: true (chống double-roll)', () => {
    const disabled = isRollActionDisabled({
      inAudit: true,
      hasRolledThisTurn: true,
      isMyTurn: true,
      isRolling: false,
      isPawnMoving: false,
      isBankrupt: false,
    });
    expect(disabled).toBe(true);
  });

  it('[TC-IMP135.06/MSS][UC-AUDIT-ROLL] isRollActionDisabled trả về true khi inAudit: true, đã gieo không đôi và phase chuyển sang PropertyManagement', () => {
    const disabled = isRollActionDisabled({
      inAudit: true,
      hasRolledThisTurn: true,
      turnPhase: 'PropertyManagement',
      canRollAgain: false,
      isMyTurn: true,
      isRolling: false,
      isPawnMoving: false,
      isBankrupt: false,
    });
    expect(disabled).toBe(true);
  });

  it('[TC-IMP135.07/MSS][UC-AUDIT-ROLL] isRollActionDisabled trả về false khi inAudit: true nhưng canRollAgain: true (được phóng thích do ra đôi)', () => {
    const disabled = isRollActionDisabled({
      inAudit: true,
      hasRolledThisTurn: true,
      canRollAgain: true,
      isMyTurn: true,
      isRolling: false,
      isPawnMoving: false,
      isBankrupt: false,
    });
    expect(disabled).toBe(false);
  });

  it('[TC-IMP135.08/MSS][UC-AUDIT-DEF] isRollActionDisabled trả về true khi inAudit: true nhưng isRolling: true (chống spam click khi đang gieo)', () => {
    const disabled = isRollActionDisabled({
      inAudit: true,
      hasRolledThisTurn: false,
      isRolling: true,
      isPawnMoving: false,
      isMyTurn: true,
    });
    expect(disabled).toBe(true);
  });

  it('[TC-IMP135.09/MSS][UC-AUDIT-DEF] isRollActionDisabled trả về true khi inAudit: true nhưng isPawnMoving: true (chống gieo khi quân cờ đang di chuyển)', () => {
    const disabled = isRollActionDisabled({
      inAudit: true,
      hasRolledThisTurn: false,
      isRolling: false,
      isPawnMoving: true,
      isMyTurn: true,
    });
    expect(disabled).toBe(true);
  });

  it('[TC-IMP135.10/MSS][UC-AUDIT-DEF] isRollActionDisabled trả về true khi inAudit: true nhưng isMyTurn: false (ngoài lượt của người chơi)', () => {
    const disabled = isRollActionDisabled({
      inAudit: true,
      hasRolledThisTurn: false,
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: false,
    });
    expect(disabled).toBe(true);
  });

  it('[TC-IMP135.11/MSS][UC-AUDIT-DEF] isRollActionDisabled trả về true khi inAudit: true nhưng isBankrupt: true (người chơi đã phá sản)', () => {
    const disabled = isRollActionDisabled({
      inAudit: true,
      hasRolledThisTurn: false,
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      isBankrupt: true,
    });
    expect(disabled).toBe(true);
  });

  it('[TC-IMP135.12/MSS][UC-AUDIT-DEF] isRollActionDisabled trả về true khi inAudit: true nhưng isRollPending: true (đang chờ debounce phản hồi)', () => {
    const disabled = isRollActionDisabled({
      inAudit: true,
      hasRolledThisTurn: false,
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      isRollPending: true,
    });
    expect(disabled).toBe(true);
  });
});

// ============================================================================
// FACET 3: END TURN & PACING — DIRECT SENTENCE SERVING & FSM TRANSITION (8 ATOMIC TESTS)
// ============================================================================
describe('[IMP-135] Facet 3: End Turn & Pacing — Direct Sentence Serving & End Turn Contract', () => {
  it('[TC-IMP135.13/MSS][UC-AUDIT-ENDTURN] isEndTurnDisabled trả về false khi inAudit: true, isMyTurn: true và hasRolledThisTurn: false (chấp hành án trực tiếp)', () => {
    const disabled = isEndTurnDisabled({
      inAudit: true,
      hasRolledThisTurn: false,
      isMyTurn: true,
      isRolling: false,
      isPawnMoving: false,
      isBankrupt: false,
      isInsolvent: false,
    });
    expect(disabled).toBe(false);
  });

  it('[TC-IMP135.14/MSS][UC-AUDIT-ENDTURN] isEndTurnDisabled trả về false khi inAudit: true, isMyTurn: true và hasRolledThisTurn: true (kết thúc lượt sau gieo hỏng)', () => {
    const disabled = isEndTurnDisabled({
      inAudit: true,
      hasRolledThisTurn: true,
      canRollAgain: false,
      isMyTurn: true,
      isRolling: false,
      isPawnMoving: false,
      isBankrupt: false,
      isInsolvent: false,
    });
    expect(disabled).toBe(false);
  });

  it('[TC-IMP135.15/MSS][UC-AUDIT-ENDTURN] isEndTurnDisabled trả về false khi inAudit: true tại pha PropertyManagement', () => {
    const disabled = isEndTurnDisabled({
      inAudit: true,
      turnPhase: 'PropertyManagement',
      hasRolledThisTurn: false,
      isMyTurn: true,
      isRolling: false,
      isPawnMoving: false,
      isBankrupt: false,
      isInsolvent: false,
    });
    expect(disabled).toBe(false);
  });

  it('[TC-IMP135.16/MSS][UC-AUDIT-ENDTURN] isEndTurnDisabled trả về true khi inAudit: true nhưng isMyTurn: false (chặn thao tác ngoài lượt)', () => {
    const disabled = isEndTurnDisabled({
      inAudit: true,
      hasRolledThisTurn: false,
      isMyTurn: false,
      isRolling: false,
      isPawnMoving: false,
    });
    expect(disabled).toBe(true);
  });

  it('[TC-IMP135.17/MSS][UC-AUDIT-ENDTURN] isEndTurnDisabled trả về true khi inAudit: true nhưng isRolling: true', () => {
    const disabled = isEndTurnDisabled({
      inAudit: true,
      hasRolledThisTurn: false,
      isMyTurn: true,
      isRolling: true,
      isPawnMoving: false,
    });
    expect(disabled).toBe(true);
  });

  it('[TC-IMP135.18/MSS][UC-AUDIT-ENDTURN] isEndTurnDisabled trả về true khi inAudit: true nhưng isPawnMoving: true', () => {
    const disabled = isEndTurnDisabled({
      inAudit: true,
      hasRolledThisTurn: false,
      isMyTurn: true,
      isRolling: false,
      isPawnMoving: true,
    });
    expect(disabled).toBe(true);
  });

  it('[TC-IMP135.19/MSS][UC-AUDIT-ENDTURN] isEndTurnDisabled trả về true khi inAudit: true nhưng isInsolvent: true (phải cứu nợ âm trước khi hết lượt)', () => {
    const disabled = isEndTurnDisabled({
      inAudit: true,
      hasRolledThisTurn: false,
      isMyTurn: true,
      isRolling: false,
      isPawnMoving: false,
      isInsolvent: true,
    });
    expect(disabled).toBe(true);
  });

  it('[TC-IMP135.20/MSS][UC-AUDIT-ENDTURN] isEndTurnDisabled trả về true khi inAudit: true nhưng canRollAgain: true (được ra đôi phải gieo tiếp lượt di chuyển)', () => {
    const disabled = isEndTurnDisabled({
      inAudit: true,
      hasRolledThisTurn: true,
      canRollAgain: true,
      isMyTurn: true,
      isRolling: false,
      isPawnMoving: false,
    });
    expect(disabled).toBe(true);
  });
});

// ============================================================================
// FACET 4: COMPONENT RENDERING & ERROR DEFENSE — ACTIONDOCK STATIC DOM (8 ATOMIC TESTS)
// ============================================================================
describe('[IMP-135] Facet 4: Component Rendering & Error Defense — ActionDock Static DOM', () => {
  beforeEach(() => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Thành (P1)',
          balance: 10_000,
          tokenColor: '#EF4444',
          ownedProperties: [],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: true,
          auditTurnsLeft: 2,
        },
      },
      isRolling: false,
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      hasRolledThisTurn: false,
      turnPhase: 'WaitingRoll',
      dice: [1, 2],
    });
  });

  it('[TC-IMP135.21/MSS][UC-AUDIT-DOM] Render ActionDock với inAudit: true và hasRolledThisTurn: false thì roll-dice-btn KHÔNG mang thuộc tính disabled', () => {
    useGameStore.setState({ hasRolledThisTurn: false });
    const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
    const rollBtnMatch = html.match(/<button[^>]*data-testid="roll-dice-btn"[^>]*>/);
    expect(rollBtnMatch).not.toBeNull();
    expect(rollBtnMatch![0]).not.toContain('disabled=""');
  });

  it('[TC-IMP135.22/MSS][UC-AUDIT-DOM] Render ActionDock với inAudit: true và hasRolledThisTurn: true thì roll-dice-btn CÓ thuộc tính disabled', () => {
    useGameStore.setState({ hasRolledThisTurn: true });
    const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
    const rollBtnMatch = html.match(/<button[^>]*data-testid="roll-dice-btn"[^>]*>/);
    expect(rollBtnMatch).not.toBeNull();
    expect(rollBtnMatch![0]).toContain('disabled=""');
  });

  it('[TC-IMP135.23/MSS][UC-AUDIT-DOM] Render ActionDock với inAudit: true và balance >= 500 Tr. thì nút bảo lãnh kiểm toán hiển thị và không bị disabled', () => {
    useGameStore.setState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'P1',
          balance: 10_000,
          tokenColor: '#EF4444',
          ownedProperties: [],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: true,
          auditTurnsLeft: 2,
        },
      },
    });
    const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
    const bailoutMatch = html.match(/<button[^>]*(data-testid="bailout-btn"|aria-label="Nộp 500)[^>]*>/);
    expect(bailoutMatch).not.toBeNull();
    expect(bailoutMatch![0]).not.toContain('disabled=""');
    expect(html).toContain('Bảo Lãnh (500)');
  });

  it('[TC-IMP135.24/MSS][UC-AUDIT-DOM] Render ActionDock với inAudit: true và balance < 500 Tr. thì nút bảo lãnh kiểm toán CÓ thuộc tính disabled', () => {
    useGameStore.setState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'P1',
          balance: 300,
          tokenColor: '#EF4444',
          ownedProperties: [],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: true,
          auditTurnsLeft: 2,
        },
      },
    });
    const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
    const bailoutMatch = html.match(/<button[^>]*(data-testid="bailout-btn"|aria-label="Nộp 500)[^>]*>/);
    expect(bailoutMatch).not.toBeNull();
    expect(bailoutMatch![0]).toContain('disabled=""');
  });

  it('[TC-IMP135.25/MSS][UC-AUDIT-DOM] Render ActionDock với inAudit: false KHÔNG hiển thị nút bảo lãnh kiểm toán', () => {
    useGameStore.setState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'P1',
          balance: 10_000,
          tokenColor: '#EF4444',
          ownedProperties: [],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: false,
        },
      },
    });
    const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
    expect(html).not.toContain('Bảo Lãnh (500 Tr.)');
    expect(html).not.toContain('data-testid="bailout-btn"');
  });

  it('[TC-IMP135.26/MSS][UC-AUDIT-DOM] Render ActionDock với inAudit: true nhưng isMyTurn: false KHÔNG hiển thị nút bảo lãnh kiểm toán', () => {
    const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p2', isMyTurn: false }));
    expect(html).not.toContain('Bảo Lãnh (500 Tr.)');
  });

  it('[TC-IMP135.27/MSS][UC-AUDIT-DOM] Render ActionDock với inAudit: true và hasRolledThisTurn: false thì nút kết thúc lượt KHÔNG bị disabled', () => {
    useGameStore.setState({ hasRolledThisTurn: false });
    const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
    const endTurnMatch = html.match(/<button[^>]*aria-label="Kết thúc lượt"[^>]*>/);
    expect(endTurnMatch).not.toBeNull();
    expect(endTurnMatch![0]).not.toContain('disabled=""');
  });

  it('[TC-IMP135.28/MSS][UC-AUDIT-DOM] Consumer-Side Execution: resolveActionDockNotice khi inAudit: true hiển thị rõ hướng dẫn 3 lựa chọn thoát trạm', () => {
    const notice = resolveActionDockNotice({
      isMyTurn: true,
      inAudit: true,
      auditTurnsLeft: 2,
      balance: 10_000,
    });
    expect(notice?.type).toBe('audit');
    expect(notice?.desktopText).toContain('Gieo đôi để tự do, nộp bảo lãnh hoặc chấp hành án');
  });
});
