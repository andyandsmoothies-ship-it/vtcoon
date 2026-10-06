// [TC-IMP268.01/MSS..TC-IMP268.08/MSS][UC-IMP268] Actionable Notification Exhaustiveness & Raw Code Elimination Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Critical Target Bug Characterization (TC-IMP268.01..02)
// Facet 2: 100% Domain Reason Coverage & Zero Leaked Variables (TC-IMP268.03..04)
// Facet 3: Auction Subsystem Reason Parity (TC-IMP268.05..06)
// Facet 4: Double Fallback Resilience & Unknown Code Safety (TC-IMP268.07)
// Facet 5: Blast Radius Parity & Existing Behavior Preservation (TC-IMP268.08)

import { describe, it, expect } from 'vitest';
import {
  formatServerErrorMessage,
  resolveActionableNotification,
} from '../../src/client/ui/actionable_notification.js';
import { ActionRejectReason } from '../../src/domain/action_reasons.js';

describe('[IMP-268] Actionable Notification Exhaustiveness & Raw Code Elimination', () => {
  // =========================================================================
  // Facet 1: Critical Target Bug Characterization (TRADE_ALREADY_PENDING)
  // =========================================================================
  it('[TC-IMP268.01/MSS][UC-IMP268] formatServerErrorMessage("TRADE_ALREADY_PENDING") tuyệt đối không để lộ biến thô trong ngoặc đơn và chứa nội dung đàm phán', () => {
    const message = formatServerErrorMessage('TRADE_ALREADY_PENDING');
    expect(message).not.toContain('(TRADE_ALREADY_PENDING)');
    expect(message).toContain('Đàm Phán Đang Diễn Ra');
    expect(message).toContain('👉');
  });

  it('[TC-IMP268.02/MSS][UC-IMP268] resolveActionableNotification("TRADE_ALREADY_PENDING") trả về icon bắt tay 🤝, tone warning và actionHint', () => {
    const notification = resolveActionableNotification('TRADE_ALREADY_PENDING');
    expect(notification.icon).toBe('🤝');
    expect(notification.title).toBe('Đàm Phán Đang Diễn Ra');
    expect(notification.tone).toBe('warning');
    expect(notification.actionHint).toContain('đàm phán');
  });

  // =========================================================================
  // Facet 2: 100% Domain Reason Coverage & Zero Leaked Variables
  // =========================================================================
  it('[TC-IMP268.03/MSS][UC-IMP268] GAME_NOT_STARTED và BOND_ALREADY_ACTIVE không để lộ biến thô và có tiêu đề tiếng Việt chuẩn xác', () => {
    const gameNotStartedMsg = formatServerErrorMessage(ActionRejectReason.GAME_NOT_STARTED);
    const bondActiveMsg = formatServerErrorMessage(ActionRejectReason.BOND_ALREADY_ACTIVE);
    expect(gameNotStartedMsg).not.toContain('(GAME_NOT_STARTED)');
    expect(gameNotStartedMsg).toContain('Chưa Bắt Đầu');
    expect(bondActiveMsg).not.toContain('(BOND_ALREADY_ACTIVE)');
    expect(bondActiveMsg).toContain('Trái Phiếu');
  });

  it('[TC-IMP268.04/MSS][UC-IMP268] NEED_2_RAILROADS và NOT_MORTGAGEABLE không để lộ biến thô và cung cấp hướng dẫn hành động', () => {
    const railroadsMsg = formatServerErrorMessage(ActionRejectReason.NEED_2_RAILROADS);
    const notMortMsg = formatServerErrorMessage(ActionRejectReason.NOT_MORTGAGEABLE);
    expect(railroadsMsg).not.toContain('(NEED_2_RAILROADS)');
    expect(railroadsMsg).toContain('Hạ Tầng');
    expect(notMortMsg).not.toContain('(NOT_MORTGAGEABLE)');
    expect(notMortMsg).toContain('Thế Chấp');
  });

  // =========================================================================
  // Facet 3: Auction Subsystem Reason Parity
  // =========================================================================
  it('[TC-IMP268.05/MSS][UC-IMP268] BID_TOO_LOW và ALREADY_HIGHEST_BIDDER phân giải thông báo rõ ràng không để lộ mã biến', () => {
    const bidTooLowMsg = formatServerErrorMessage('BID_TOO_LOW');
    const highestBidderMsg = formatServerErrorMessage('ALREADY_HIGHEST_BIDDER');
    expect(bidTooLowMsg).not.toContain('(BID_TOO_LOW)');
    expect(bidTooLowMsg).toContain('Giá Đấu');
    expect(highestBidderMsg).not.toContain('(ALREADY_HIGHEST_BIDDER)');
    expect(highestBidderMsg).toContain('Dẫn Đầu');
  });

  it('[TC-IMP268.06/MSS][UC-IMP268] PLAYER_ALREADY_PASSED và AUCTION_EXPIRED có icon và mô tả thân thiện', () => {
    const passedNotif = resolveActionableNotification('PLAYER_ALREADY_PASSED');
    const expiredNotif = resolveActionableNotification('AUCTION_EXPIRED');
    expect(passedNotif.title).toContain('Đã Bỏ Qua');
    expect(passedNotif.tone).toBe('info');
    expect(expiredNotif.title).toContain('Hết Thời Gian');
    expect(expiredNotif.tone).toBe('warning');
  });

  // =========================================================================
  // Facet 4: Double Fallback Resilience & Unknown Code Safety
  // =========================================================================
  it('[TC-IMP268.07/MSS][UC-IMP268] resolveActionableNotification tự động tận dụng từ điển vi.rejectReasons khi gặp mã chưa có trong map', () => {
    const fallbackNotif = resolveActionableNotification('SOME_FUTURE_REASON_CODE');
    expect(fallbackNotif).toBeDefined();
    expect(fallbackNotif.icon).toBe('ℹ️');
    expect(fallbackNotif.title).toBe('Hướng Dẫn Trò Chơi');
  });

  // =========================================================================
  // Facet 5: Blast Radius Parity & Existing Behavior Preservation
  // =========================================================================
  it('[TC-IMP268.08/MSS][UC-IMP268] formatServerErrorMessage giữ nguyên độ chính xác cho các mã cốt lõi đã có từ trước (INSUFFICIENT_FUNDS, NOT_YOUR_TURN)', () => {
    const fundsMsg = formatServerErrorMessage('INSUFFICIENT_FUNDS');
    const turnMsg = formatServerErrorMessage('NOT_YOUR_TURN');
    expect(fundsMsg).toContain('Ngân Sách');
    expect(fundsMsg).toContain('👉');
    expect(turnMsg).toContain('Chưa Tới Lượt Chơi');
    expect(turnMsg).toContain('👉');
  });
});
