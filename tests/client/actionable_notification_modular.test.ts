// [IMP-297] Living Contract Test Suite: Actionable Notification Modular Architecture
// Covers gameplay dictionary, system dictionary, map facade, resolver & server message formatter.

import { describe, it, expect } from 'vitest';
import {
  resolveActionableNotification,
  formatServerErrorMessage,
  ACTIONABLE_NOTIFICATIONS_MAP as facadeMap,
  DEFAULT_FALLBACK_NOTIFICATION as facadeFallback,
} from '../../src/client/ui/actionable_notification.js';
import {
  ACTIONABLE_NOTIFICATIONS_MAP as directMap,
  DEFAULT_FALLBACK_NOTIFICATION as directFallback,
} from '../../src/client/ui/actionable_notification_map.js';
import { GAMEPLAY_NOTIFICATIONS_MAP } from '../../src/client/ui/actionable_notification_gameplay.js';
import { SYSTEM_NOTIFICATIONS_MAP } from '../../src/client/ui/actionable_notification_system.js';
import { vi } from '../../src/domain/i18n/vi.js';

describe('Actionable Notification Modular Architecture [IMP-297]', () => {
  it('[TC-NOTIF.01/MSS][UC-NOTIF/MSS] phan giai ma INSUFFICIENT_FUNDS day du icon, title, tone va actionHint', () => {
    const notif = resolveActionableNotification('INSUFFICIENT_FUNDS');
    expect(notif.icon).toBe('💰');
    expect(notif.title).toBe('Ngân Sách Không Đủ');
    expect(notif.tone).toBe('error');
    expect(notif.actionHint).toContain('thế chấp');
  });

  it('[TC-NOTIF.02/MSS][UC-NOTIF/MSS] phan giai ma EVEN_BUILDING_VIOLATION co title Quy Tac Xay Deu Tay va tone warning', () => {
    const notif = resolveActionableNotification('EVEN_BUILDING_VIOLATION');
    expect(notif.title).toBe('Quy Tắc Xây Đều Tay');
    expect(notif.tone).toBe('warning');
  });

  it('[TC-NOTIF.03/MSS][UC-NOTIF/MSS] phan giai ma legacy camelCase InsufficientFunds tra ve ket qua dong nhat', () => {
    const notif = resolveActionableNotification('InsufficientFunds');
    expect(notif.title).toBe('Ngân Sách Không Đủ');
    expect(notif.icon).toBe('💰');
  });

  it('[TC-NOTIF.04/MSS][UC-NOTIF/MSS] phan giai ma alias TradeFrozen tro ve cau hinh FREEZE_ACTIVE', () => {
    const notif = resolveActionableNotification('TradeFrozen');
    expect(notif.title).toBe('Thị Trường Đang Đóng Băng');
    expect(notif.tone).toBe('warning');
  });

  it('[TC-NOTIF.05/MSS][UC-NOTIF/MSS] phan giai ma alias highest_bidder cannot pass tro ve HIGHEST_BIDDER_CANNOT_PASS', () => {
    const notif = resolveActionableNotification('highest_bidder cannot pass');
    expect(notif.title).toBe('Đang Dẫn Đầu Đấu Giá');
    expect(notif.tone).toBe('info');
  });

  it('[TC-NOTIF.06/MSS][UC-NOTIF/MSS] tham so reasonCode null hoac undefined tra ve DEFAULT_FALLBACK_NOTIFICATION', () => {
    expect(resolveActionableNotification(null)).toBe(directFallback);
    expect(resolveActionableNotification(undefined)).toBe(directFallback);
  });

  it('[TC-NOTIF.07/MSS][UC-NOTIF/MSS] tham so reasonCode chuoi rong hoac khong hop le tra ve DEFAULT_FALLBACK_NOTIFICATION', () => {
    directMap[''] = { icon: '❌', title: 'MutantTrap', description: 'Trap', tone: 'error' };
    try {
      expect(resolveActionableNotification('')).toBe(directFallback);
      expect(formatServerErrorMessage('')).toBe(formatServerErrorMessage(null));
    } finally {
      delete directMap[''];
    }
  });

  it('[TC-NOTIF.08/MSS][UC-NOTIF/MSS] ma loi trong vi.rejectReasons nhung khong co trong map tinh tao thong bao fallback i18n', () => {
    (vi.rejectReasons as Record<string, string>)['MOCK_DYNAMIC_I18N_REASON'] = 'Hành vi thử nghiệm i18n';
    try {
      const notif = resolveActionableNotification('MOCK_DYNAMIC_I18N_REASON');
      expect(notif.icon).toBe('ℹ️');
      expect(notif.title).toBe('Hướng Dẫn Trò Chơi');
      expect(notif.description).toBe('Hành vi thử nghiệm i18n');
    } finally {
      delete (vi.rejectReasons as Record<string, string>)['MOCK_DYNAMIC_I18N_REASON'];
    }
  });

  it('[TC-NOTIF.09/MSS][UC-NOTIF/MSS] ma loi hoan toan xa la tra ve DEFAULT_FALLBACK_NOTIFICATION', () => {
    const notif = resolveActionableNotification('TOTALLY_NON_EXISTENT_UNKNOWN_CODE_999');
    expect(notif).toBe(directFallback);
  });

  it('[TC-NOTIF.10/MSS][UC-NOTIF/MSS] formatServerErrorMessage chua day du title, description va ky tu huong dan', () => {
    const msg = formatServerErrorMessage('INSUFFICIENT_FUNDS');
    expect(msg).toContain('Ngân Sách Không Đủ:');
    expect(msg).toContain('👉');
    expect(msg).toContain('thế chấp');
  });

  it('[TC-NOTIF.11/MSS][UC-NOTIF/MSS] thong bao khong co actionHint dinh dang chuoi khong chua ky tu huong dan', () => {
    directMap['TEMP_TEST_NO_HINT'] = {
      icon: 'ℹ️',
      title: 'Thông Báo Thử',
      description: 'Mô tả không có gợi ý',
      tone: 'info',
    };
    try {
      const msg = formatServerErrorMessage('TEMP_TEST_NO_HINT');
      expect(msg).toBe('Thông Báo Thử: Mô tả không có gợi ý');
      expect(msg).not.toContain('👉');
    } finally {
      delete directMap['TEMP_TEST_NO_HINT'];
    }
  });

  it('[TC-NOTIF.12/MSS][UC-NOTIF/MSS] formatServerErrorMessage voi reasonCode null tra ve thong bao mac dinh tong quat', () => {
    const msg = formatServerErrorMessage(null);
    expect(msg).toContain('Hướng dẫn trò chơi:');
    expect(msg).toContain('Thao tác tạm thời chưa thể thực hiện.');
  });

  it('[TC-NOTIF.13/MSS][UC-NOTIF/MSS] formatServerErrorMessage voi ma loi chua dang ky bao gom ma loi trong ngoac don', () => {
    const msg = formatServerErrorMessage('UNREGISTERED_SYSTEM_EXCEPTION');
    expect(msg).toContain('(UNREGISTERED_SYSTEM_EXCEPTION)');
  });

  it('[TC-NOTIF.14/MSS][UC-NOTIF/MSS] ACTIONABLE_NOTIFICATIONS_MAP hien dien day du cac khoa trang thai cot loi', () => {
    expect(directMap.GAME_NOT_STARTED).toBeDefined();
    expect(directMap.AUCTION_EXPIRED).toBeDefined();
    expect(directMap.BANKRUPT).toBeDefined();
    expect(directMap.BOND_ALREADY_ACTIVE).toBeDefined();
  });

  it('[TC-NOTIF.15/MSS][UC-NOTIF/MSS] moi entry trong map deu co du 4 thuoc tinh bat buoc qua ham every', () => {
    const entries = Object.values(directMap);
    const allValid = entries.length > 0 && entries.every(
      (entry) => Boolean(entry.icon && entry.title && entry.description && entry.tone)
    );
    expect(allValid).toBe(true);
  });

  it('[TC-NOTIF.16/MSS][UC-NOTIF/MSS] xuat ban dong nhat facade re-export giua hai module', () => {
    expect(directMap).toBe(facadeMap);
    expect(directFallback).toBe(facadeFallback);
  });
});
