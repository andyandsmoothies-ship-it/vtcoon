// [TC-225.01/MSS..TC-225.16/MSS][UC-IMP225]
// Actionable In-Game Feedback & Deep Contextual Messages System Contract Test Suite (IMP-225)
//
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Server Intent Rejection Wire & Format Message ([TC-225.01] - [TC-225.04])
// Facet 2: Chống Ô Nhiễm Lỗi Của Bot & Throttle Anti-Spam ([TC-225.05] - [TC-225.07])
// Facet 3: Gợi Ý Trực Quan Nút Thế Chấp & Dỡ Nhà ([TC-225.08] - [TC-225.10])
// Facet 4: Checklist Điều Kiện Phát Hành Trái Phiếu Đồng Bộ ([TC-225.11] - [TC-225.13])
// Facet 5: Phòng Vệ Ngoại Lệ & Hợp Đồng Giao Diện ([TC-225.14] - [TC-225.16])

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { formatServerErrorMessage } from '../../src/client/ui/actionable_notification.js';
import { handleWsMessage, resetWsErrorThrottle, type WsMessageHandlerContext } from '../../src/client/network/ws_message_handler.js';
import { resolvePropertyCardActionState } from '../../src/client/ui/modals/portfolio_monopoly_analytics.js';
import { PropertyCardActions } from '../../src/client/ui/modals/property_card_actions.js';
import { BondIssuanceTab } from '../../src/client/ui/modals/bond_issuance_tab.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { ActionRejectReason } from '../../src/domain/action_reasons.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

describe('[TC-225.01/MSS..TC-225.16/MSS][UC-IMP225] Actionable In-Game Feedback & Deep Contextual Messages System', () => {
  beforeEach(() => {
    resetWsErrorThrottle?.();
  });

  // =========================================================================
  // Facet 1: Server Intent Rejection Wire & Format Message ([TC-225.01] - [TC-225.04])
  // =========================================================================
  it('[TC-225.01/MSS][UC-IMP225] formatServerErrorMessage("HAS_BUILDING") trả về chuỗi chứa đầy đủ tiêu đề, mô tả và hướng dẫn hành động (actionHint)', () => {
    const msg = formatServerErrorMessage('HAS_BUILDING');
    expect(msg).toContain('Bất Động Sản Đang Có Công Trình');
    expect(msg).toContain('Không thể thế chấp hoặc giao dịch khi vẫn còn công trình xây dựng');
    expect(msg).toContain('👉');
    expect(msg).toContain('Hãy hạ cấp dỡ nhà trước khi thế chấp tài sản');
  });

  it('[TC-225.02/MSS][UC-IMP225] formatServerErrorMessage("BOND_NOT_ELIGIBLE") trả về hướng dẫn chi tiết về Net Worth 3.000 và 2 BĐS sạch', () => {
    const msg = formatServerErrorMessage('BOND_NOT_ELIGIBLE');
    expect(msg).toContain('Chưa Đủ Điều Kiện Phát Hành Trái Phiếu');
    expect(msg).toContain('3.000 Net Worth');
    expect(msg).toContain('2 bất động sản chưa thế chấp');
    expect(msg).toContain('👉');
  });

  it('[TC-225.03/MSS][UC-IMP225] formatServerErrorMessage("ALREADY_MORTGAGED") trả về thông báo BĐS đã thế chấp và hướng dẫn chuộc lại', () => {
    const msg = formatServerErrorMessage('ALREADY_MORTGAGED');
    expect(msg).toContain('Tài Sản Đã Được Thế Chấp');
    expect(msg).toContain('Ô đất này hiện đang ở trạng thái thế chấp');
    expect(msg).toContain('Chuộc lại thế chấp để khôi phục quyền thu tiền thuê');
    expect(msg).toContain('👉');
  });

  it('[TC-225.04/MSS][UC-IMP225] formatServerErrorMessage("NOT_YOUR_TURN") và "INVALID_PHASE" trả về hướng dẫn giai đoạn lượt chơi rõ ràng', () => {
    const notYourTurnMsg = formatServerErrorMessage('NOT_YOUR_TURN');
    const invalidPhaseMsg = formatServerErrorMessage('INVALID_PHASE');
    expect(notYourTurnMsg).toContain('Chưa Tới Lượt Chơi');
    expect(notYourTurnMsg).toContain('👉');
    expect(invalidPhaseMsg).toContain('Chưa Đúng Giai Đoạn Lượt Chơi');
    expect(invalidPhaseMsg).toContain('👉');
  });

  // =========================================================================
  // Facet 2: Chống Ô Nhiễm Lỗi Của Bot & Throttle Anti-Spam ([TC-225.05] - [TC-225.07])
  // =========================================================================
  it('[TC-225.05/MSS][UC-IMP225] handleWsMessage với { type: "INTENT_REJECTED", reasonCode: "HAS_BUILDING", playerId: "bot_1" } khi myPlayerId = "p1" -> Không kích hoạt ctx.onError', () => {
    const onError = vi.fn();
    const ctx: WsMessageHandlerContext = {
      roomCode: 'VTJ4U5',
      playerId: 'p1',
      socket: { send: vi.fn() },
      onError,
    };
    useLobbyStore.setState({ myPlayerId: 'p1' });

    const msg: WsServerMessage = {
      type: 'INTENT_REJECTED',
      reasonCode: ActionRejectReason.HAS_BUILDING,
      playerId: 'bot_1',
    };
    handleWsMessage(msg, ctx);

    expect(onError).not.toHaveBeenCalled();
  });

  it('[TC-225.06/MSS][UC-IMP225] handleWsMessage với { type: "ERROR", reasonCode: "ROOM_NOT_FOUND" } hoặc { type: "INTENT_REJECTED", reasonCode: "HAS_BUILDING", playerId: "p1" } khi myPlayerId = "p1" -> Kích hoạt ctx.onError', () => {
    const onError = vi.fn();
    const ctx: WsMessageHandlerContext = {
      roomCode: 'VTJ4U5',
      playerId: 'p1',
      socket: { send: vi.fn() },
      onError,
    };
    useLobbyStore.setState({ myPlayerId: 'p1' });

    const errorMsg: WsServerMessage = {
      type: 'ERROR',
      reasonCode: 'ROOM_NOT_FOUND',
    };
    handleWsMessage(errorMsg, ctx);
    expect(onError).toHaveBeenCalledWith('ROOM_NOT_FOUND');

    const intentRejectedMsg: WsServerMessage = {
      type: 'INTENT_REJECTED',
      reasonCode: ActionRejectReason.HAS_BUILDING,
      playerId: 'p1',
    };
    handleWsMessage(intentRejectedMsg, ctx);
    expect(onError).toHaveBeenCalledWith('HAS_BUILDING');
  });

  it('[TC-225.07/MSS][UC-IMP225] Gọi handleWsMessage liên tục với cùng reasonCode trong vòng 1500ms -> Chỉ kích hoạt ctx.onError 1 lần (Throttle Anti-Spam)', () => {
    const onError = vi.fn();
    const ctx: WsMessageHandlerContext = {
      roomCode: 'VTJ4U5',
      playerId: 'p1',
      socket: { send: vi.fn() },
      onError,
    };
    useLobbyStore.setState({ myPlayerId: 'p1' });

    const throttleMsg: WsServerMessage = {
      type: 'INTENT_REJECTED',
      reasonCode: ActionRejectReason.INSUFFICIENT_FUNDS,
      playerId: 'p1',
    };
    handleWsMessage(throttleMsg, ctx);
    handleWsMessage(throttleMsg, ctx);

    expect(onError).toHaveBeenCalledTimes(1);
  });

  // =========================================================================
  // Facet 3: Gợi Ý Trực Quan Nút Thế Chấp & Dỡ Nhà ([TC-225.08] - [TC-225.10])
  // =========================================================================
  it('[TC-225.08/MSS][UC-IMP225] Ô đất cấp C1–C3 -> resolvePropertyCardActionState trả về mortgageButtonLabel: "Cần Hạ Cấp" (bảo toàn IMP-208) và mortgageSubHint: "Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp"', () => {
    const state = resolvePropertyCardActionState({
      cellIndex: 6,
      level: 1,
      isMortgaged: false,
      isTradeFrozen: false,
      isLiquidityFrozen: false,
    });

    expect(state.canMortgage).toBe(false);
    expect(state.mortgageButtonLabel).toBe('Cần Hạ Cấp');
    expect(state.mortgageSubHint).toBe('Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp');
  });

  it('[TC-225.09/MSS][UC-IMP225] Ô đất đã thế chấp -> Trả về canMortgage: false, mortgageButtonLabel: "Đã Thế Chấp", mortgageBlockedReason: "Bất động sản đã được thế chấp"', () => {
    const state = resolvePropertyCardActionState({
      cellIndex: 6,
      level: 0,
      isMortgaged: true,
      isTradeFrozen: false,
      isLiquidityFrozen: false,
    });

    expect(state.canMortgage).toBe(false);
    expect(state.mortgageButtonLabel).toBe('Đã Thế Chấp');
    expect(state.mortgageBlockedReason).toBe('Bất động sản đã được thế chấp');
    expect(state.mortgageSubHint).toBe('Cần chuộc nợ để khôi phục quyền thế chấp');
  });

  it('[TC-225.10/MSS][UC-IMP225] Ô đất vi phạm quy tắc dỡ nhà đều tay (Even Downgrading) -> Trả về canDowngrade: false và downgradeBlockedReason giải thích rõ ô nào cần dỡ trước', () => {
    const state = resolvePropertyCardActionState({
      cellIndex: 6,
      level: 1,
      isMortgaged: false,
      isTradeFrozen: false,
      isLiquidityFrozen: false,
      levelMap: { 6: 1, 8: 2, 9: 1 },
      ownedProperties: [6, 8, 9],
    });

    expect(state.canDowngrade).toBe(false);
    expect(state.downgradeBlockedReason).toBe('Cần hạ cấp các ô có cấp độ cao hơn trước');
  });

  // =========================================================================
  // Facet 4: Checklist Điều Kiện Phát Hành Trái Phiếu Đồng Bộ ([TC-225.11] - [TC-225.13])
  // =========================================================================
  it('[TC-225.11/MSS][UC-IMP225] Render BondIssuanceTab với playerNetWorth = 2450 (< 3000) -> Checklist hiển thị trạng thái thiếu Net Worth (❌), chứa text "Tài sản ròng (Net Worth) ≥ 3.000"', () => {
    const html = renderToStaticMarkup(
      React.createElement(BondIssuanceTab, {
        balance: 1000,
        isMyTurn: true,
        playerNetWorth: 2450,
        unmortgagedPropertiesCount: 3,
      })
    );

    expect(html).toContain('Tài sản ròng (Net Worth) ≥ 3.000');
    expect(html).toContain('❌');
    expect(html).toContain('2.450');
  });

  it('[TC-225.12/MSS][UC-IMP225] Render BondIssuanceTab với unmortgagedPropertiesCount = 1 (< 2) -> Checklist hiển thị thiếu BĐS sạch (❌), chứa text "BĐS sạch chưa thế chấp ≥ 2 ô"', () => {
    const html = renderToStaticMarkup(
      React.createElement(BondIssuanceTab, {
        balance: 1000,
        isMyTurn: true,
        playerNetWorth: 5000,
        unmortgagedPropertiesCount: 1,
      })
    );

    expect(html).toContain('BĐS sạch chưa thế chấp ≥ 2 ô');
    expect(html).toContain('1 / 2');
    expect(html).toContain('❌');
  });

  it('[TC-225.13/MSS][UC-IMP225] Render BondIssuanceTab với playerNetWorth = 5000, unmortgagedPropertiesCount = 3, isInInsolvency = true -> Tất cả 3 tiêu chí đạt (✔️), nút phát hành enabled (issue-bond-btn không disabled)', () => {
    const html = renderToStaticMarkup(
      React.createElement(BondIssuanceTab, {
        balance: -300,
        isMyTurn: false,
        playerNetWorth: 5000,
        unmortgagedPropertiesCount: 3,
        isInInsolvency: true,
      })
    );

    expect(html).toContain('Trong lượt hoặc giải cứu nợ');
    expect(html).toContain('✔️');
    expect(html).not.toContain('❌');
    expect(html).not.toMatch(/data-testid="issue-bond-btn"[^>]*disabled=""/);
  });

  // =========================================================================
  // Facet 5: Phòng Vệ Ngoại Lệ & Hợp Đồng Giao Diện ([TC-225.14] - [TC-225.16])
  // =========================================================================
  it('[TC-225.14/MSS][UC-IMP225] Gọi formatServerErrorMessage với mã lỗi lạ hoặc null/undefined -> Fallback an toàn về thông báo chung, không ném ngoại lệ', () => {
    expect(formatServerErrorMessage(null)).toContain('Hướng dẫn trò chơi: Thao tác tạm thời chưa thể thực hiện');
    const unknownMsg = formatServerErrorMessage('UNKNOWN_REASON_CODE_999');
    expect(unknownMsg).toContain('Hướng dẫn trò chơi: Thao tác tạm thời chưa thể thực hiện');
    expect(unknownMsg).toContain('UNKNOWN_REASON_CODE_999');
  });

  it('[TC-225.15/MSS][UC-IMP225] Render PropertyCardActions khi actionState.canMortgage === false -> Hiển thị text cảnh báo chứa actionState.mortgageSubHint ?? actionState.mortgageBlockedReason, bảo toàn nhãn "Sổ Đỏ ↗"', () => {
    expect(PropertyCardActions).toBeTruthy();
    const html = renderToStaticMarkup(
      React.createElement(PropertyCardActions, {
        cellIndex: 6,
        level: 1,
        isMort: false,
        mortgageVal: 500,
        redeemCost: 550,
        currentBalance: 1000,
        actionState: {
          canMortgage: false,
          mortgageBlockedReason: 'Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp',
          mortgageButtonLabel: 'Cần Hạ Cấp',
          mortgageSubHint: 'Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp',
          canDowngrade: true,
        },
        onSelectDeed: vi.fn(),
      })
    );

    expect(html).toContain('Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp');
    expect(html).toContain('Sổ Đỏ ↗');
  });

  it('[TC-225.16/MSS][UC-IMP225] Thẻ <button> của nút Thế Chấp sở hữu class col-span-2 và nút Hạ Cấp sở hữu class col-span-1 khi level > 0 && !isMort && onDowngrade (bảo vệ hợp đồng regex của IMP-208)', () => {
    expect(PropertyCardActions).toBeTruthy();
    const html = renderToStaticMarkup(
      React.createElement(PropertyCardActions, {
        cellIndex: 6,
        level: 1,
        isMort: false,
        mortgageVal: 500,
        redeemCost: 550,
        currentBalance: 1000,
        actionState: {
          canMortgage: false,
          mortgageBlockedReason: 'Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp',
          mortgageButtonLabel: 'Cần Hạ Cấp',
          mortgageSubHint: 'Phải hạ cấp hết nhà về Cấp 0 trước khi thế chấp',
          canDowngrade: true,
        },
        onDowngrade: vi.fn(),
        onSelectDeed: vi.fn(),
      })
    );

    expect(html).toMatch(/<button[^>]*data-testid="mortgage-btn-6"[^>]*class="[^"]*col-span-2/);
    expect(html).toMatch(/<button[^>]*data-testid="downgrade-btn-6"[^>]*class="[^"]*col-span-1/);
  });
});
