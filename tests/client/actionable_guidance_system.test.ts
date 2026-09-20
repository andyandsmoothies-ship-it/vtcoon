// [TC-IMP134/MSS][UC-IMP134] Contract Test Suite: Actionable In-Game Guidance System & Contextual Notifications
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & Exhaustive Mapping Invariants): ReasonCode mappings, icons, tones, action hints, formatServerErrorMessage
// Facet 2 (Exclusive Chip Priority & Anti-Collision Invariant): resolveActionDockNotice priority hierarchy & mobile 45-char ceiling
// Facet 3 (Toast Two-Tier Rendering & Close Disposal): ServerToast alert role, positioning, close button, null/empty disposal
// Facet 4 (Error Defense & Input Sanitization): Null/undefined/empty string resilience, friendly defaults

import { describe, it, expect, beforeAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { formatServerErrorMessage, ServerToast } from '../../src/client/main';
import * as uiHelpers from '../../src/client/ui/ui_helpers';

// Dynamic import for actionable_notification module to ensure clean Business RED gating without ESM load crashes
let resolveActionableNotification: ((reasonCode: string) => any) | null = null;
let actionableNotificationImportError: Error | null = null;

beforeAll(async () => {
  try {
    // @ts-ignore
    const mod = await import('../../src/client/ui/actionable_notification');
    resolveActionableNotification = mod.resolveActionableNotification ?? mod.default ?? null;
  } catch (err: any) {
    actionableNotificationImportError = err;
    resolveActionableNotification = null;
  }
});

function getActionableNotification(reasonCode: string): any {
  expect(
    resolveActionableNotification,
    `[RED GATE] resolveActionableNotification is not yet implemented or exported in src/client/ui/actionable_notification.ts: ${actionableNotificationImportError?.message ?? 'Module missing'}`
  ).toBeTypeOf('function');
  return resolveActionableNotification!(reasonCode);
}

function getActionDockNotice(params: any): any {
  const fn = (uiHelpers as any).resolveActionDockNotice;
  expect(
    fn,
    '[RED GATE] resolveActionDockNotice is not yet implemented or exported in src/client/ui/ui_helpers.ts'
  ).toBeTypeOf('function');
  return fn(params);
}

describe('[IMP-134][Trạm 1] Actionable In-Game Guidance System Contract Tests', () => {

  // =========================================================================
  // FACET 1: BOUNDARY & EXHAUSTIVE MAPPING INVARIANTS (ReasonCode -> Actionable)
  // =========================================================================
  describe('Facet 1: Boundary & Exhaustive Mapping Invariants', () => {
    it('[TC-IMP134.01/MSS][UC-IMP134][Facet-1/Boundary] INVALID_PHASE ánh xạ icon ⏱️, title Giai Đoạn/Lượt, tone warning và có actionHint hướng dẫn', () => {
      const res = getActionableNotification('INVALID_PHASE');
      expect(res.icon).toBe('⏱️');
      expect(res.title).toMatch(/Giai Đoạn|Lượt/i);
      expect(res.tone).toBe('warning');
      expect(res.actionHint).toEqual(expect.stringMatching(/\S+/));
    });

    it('[TC-IMP134.02/MSS][UC-IMP134][Facet-1/Boundary] INSUFFICIENT_FUNDS ánh xạ icon 💰, title Ngân Sách/Số Dư, tone error và actionHint hướng dẫn thế chấp/bán nhà', () => {
      const res = getActionableNotification('INSUFFICIENT_FUNDS');
      expect(res.icon).toBe('💰');
      expect(res.title).toMatch(/Ngân Sách|Số Dư/i);
      expect(res.tone).toBe('error');
      expect(res.actionHint).toMatch(/thế chấp|bán nhà|hạ cấp/i);
    });

    it('[TC-IMP134.03/MSS][UC-IMP134][Facet-1/Boundary] InsufficientFunds biến thể camelCase ánh xạ tương thích icon 💰, tone error và actionHint', () => {
      const res = getActionableNotification('InsufficientFunds');
      expect(res.icon).toBe('💰');
      expect(res.title).toMatch(/Ngân Sách|Số Dư/i);
      expect(res.tone).toBe('error');
      expect(res.actionHint).toMatch(/thế chấp|bán nhà|hạ cấp/i);
    });

    it('[TC-IMP134.04/MSS][UC-IMP134][Facet-1/Boundary] CANNOT_ROLL ánh xạ icon 🎲, title chứa Xúc Xắc và tone info', () => {
      const res = getActionableNotification('CANNOT_ROLL');
      expect(res.icon).toBe('🎲');
      expect(res.title).toMatch(/Xúc Xắc/i);
      expect(res.tone).toBe('info');
    });

    it('[TC-IMP134.05/MSS][UC-IMP134][Facet-1/Boundary] MISSING_MONOPOLY ánh xạ icon 👑, title Độc Quyền/Bộ Màu và tone warning', () => {
      const res = getActionableNotification('MISSING_MONOPOLY');
      expect(res.icon).toBe('👑');
      expect(res.title).toMatch(/Độc Quyền|Bộ Màu/i);
      expect(res.tone).toBe('warning');
    });

    it('[TC-IMP134.06/MSS][UC-IMP134][Facet-1/Boundary] EVEN_BUILDING_VIOLATION ánh xạ icon 🏗️, title Đều Tay và tone warning', () => {
      const res = getActionableNotification('EVEN_BUILDING_VIOLATION');
      expect(res.icon).toBe('🏗️');
      expect(res.title).toMatch(/Đều Tay/i);
      expect(res.tone).toBe('warning');
    });

    it('[TC-IMP134.07/MSS][UC-IMP134][Facet-1/Boundary] EVEN_DOWNGRADE_VIOLATION ánh xạ icon 🔨, title Dỡ/Đều Tay và tone warning', () => {
      const res = getActionableNotification('EVEN_DOWNGRADE_VIOLATION');
      expect(res.icon).toBe('🔨');
      expect(res.title).toMatch(/Dỡ|Đều Tay/i);
      expect(res.tone).toBe('warning');
    });

    it('[TC-IMP134.08/MSS][UC-IMP134][Facet-1/Boundary] NOT_OWNER ánh xạ icon 🚫, title Chủ Sở Hữu và tone error', () => {
      const res = getActionableNotification('NOT_OWNER');
      expect(res.icon).toBe('🚫');
      expect(res.title).toMatch(/Chủ Sở Hữu/i);
      expect(res.tone).toBe('error');
    });

    it('[TC-IMP134.09/MSS][UC-IMP134][Facet-1/Boundary] MAX_LEVEL ánh xạ icon 🏢, title Tối Đa và tone info', () => {
      const res = getActionableNotification('MAX_LEVEL');
      expect(res.icon).toBe('🏢');
      expect(res.title).toMatch(/Tối Đa/i);
      expect(res.tone).toBe('info');
    });

    it('[TC-IMP134.10/MSS][UC-IMP134][Facet-1/Boundary] HAS_BUILDING ánh xạ icon 🏠, title Công Trình/Nhà và tone warning', () => {
      const res = getActionableNotification('HAS_BUILDING');
      expect(res.icon).toBe('🏠');
      expect(res.title).toMatch(/Công Trình|Nhà/i);
      expect(res.tone).toBe('warning');
    });

    it('[TC-IMP134.11/MSS][UC-IMP134][Facet-1/Boundary] ALREADY_MORTGAGED ánh xạ icon 🔒, title Thế Chấp và tone info', () => {
      const res = getActionableNotification('ALREADY_MORTGAGED');
      expect(res.icon).toBe('🔒');
      expect(res.title).toMatch(/Thế Chấp/i);
      expect(res.tone).toBe('info');
    });

    it('[TC-IMP134.12/MSS][UC-IMP134][Facet-1/Boundary] GROUP_MORTGAGED ánh xạ icon ⚠️, title Thế Chấp và tone warning', () => {
      const res = getActionableNotification('GROUP_MORTGAGED');
      expect(res.icon).toBe('⚠️');
      expect(res.title).toMatch(/Thế Chấp/i);
      expect(res.tone).toBe('warning');
    });

    it('[TC-IMP134.13/MSS][UC-IMP134][Facet-1/Boundary] ROOM_NOT_FOUND ánh xạ icon 🔍, title Phòng và tone error', () => {
      const res = getActionableNotification('ROOM_NOT_FOUND');
      expect(res.icon).toBe('🔍');
      expect(res.title).toMatch(/Phòng/i);
      expect(res.tone).toBe('error');
    });

    it('[TC-IMP134.14/MSS][UC-IMP134][Facet-1/Boundary] NOT_ENOUGH_PLAYERS ánh xạ icon 👥, title Người Chơi và tone info', () => {
      const res = getActionableNotification('NOT_ENOUGH_PLAYERS');
      expect(res.icon).toBe('👥');
      expect(res.title).toMatch(/Người Chơi/i);
      expect(res.tone).toBe('info');
    });

    it('[TC-IMP134.15/MSS][UC-IMP134][Facet-1/Boundary] NOT_HOST ánh xạ icon 👑, title Chủ Phòng và tone info', () => {
      const res = getActionableNotification('NOT_HOST');
      expect(res.icon).toBe('👑');
      expect(res.title).toMatch(/Chủ Phòng/i);
      expect(res.tone).toBe('info');
    });

    it('[TC-IMP134.16/MSS][UC-IMP134][Facet-1/Boundary] Mã lạ fallback icon ℹ️, title Thông Báo/Hướng Dẫn, tone info và tuyệt đối không chứa Lỗi máy chủ:', () => {
      const res = getActionableNotification('UNKNOWN_ARBITRARY_ANOMALY');
      expect(res.icon).toBe('ℹ️');
      expect(res.title).toMatch(/Thông Báo|Hướng Dẫn/i);
      expect(res.tone).toBe('info');
      expect(res.title).not.toContain('Lỗi máy chủ:');
    });

    it('[TC-IMP134.17/MSS][UC-IMP134][Facet-1/Boundary] formatServerErrorMessage(CANNOT_ROLL) khớp regex chưa tới lượt hoặc bước di chuyển và không chứa Lỗi máy chủ:', () => {
      const msg = formatServerErrorMessage('CANNOT_ROLL');
      expect(msg).toMatch(/Chưa tới lượt đổ xúc xắc|bước di chuyển/i);
      expect(msg).not.toContain('Lỗi máy chủ:');
    });

    it('[TC-IMP134.18/MSS][UC-IMP134][Facet-1/Boundary] formatServerErrorMessage(ROOM_NOT_FOUND) khớp regex phòng và không chứa Lỗi máy chủ:', () => {
      const msg = formatServerErrorMessage('ROOM_NOT_FOUND');
      expect(msg).toMatch(/phòng/i);
      expect(msg).not.toContain('Lỗi máy chủ:');
    });

    it('[TC-IMP134.19/MSS][UC-IMP134][Facet-1/Boundary] formatServerErrorMessage(NOT_ENOUGH_PLAYERS) khớp regex người chơi và không chứa Lỗi máy chủ:', () => {
      const msg = formatServerErrorMessage('NOT_ENOUGH_PLAYERS');
      expect(msg).toMatch(/người chơi/i);
      expect(msg).not.toContain('Lỗi máy chủ:');
    });

    it('[TC-IMP134.20/MSS][UC-IMP134][Facet-1/Boundary] formatServerErrorMessage(NOT_HOST) khớp regex chủ phòng và không chứa Lỗi máy chủ:', () => {
      const msg = formatServerErrorMessage('NOT_HOST');
      expect(msg).toMatch(/chủ phòng/i);
      expect(msg).not.toContain('Lỗi máy chủ:');
    });

    it('[TC-IMP134.21/MSS][UC-IMP134][Facet-1/Boundary] formatServerErrorMessage(EVEN_BUILDING_VIOLATION) khớp regex đều tay và không chứa Lỗi máy chủ:', () => {
      const msg = formatServerErrorMessage('EVEN_BUILDING_VIOLATION');
      expect(msg).toMatch(/đều tay/i);
      expect(msg).not.toContain('Lỗi máy chủ:');
    });

    it('[TC-IMP134.22/MSS][UC-IMP134][Facet-1/Boundary] formatServerErrorMessage(MISSING_MONOPOLY) khớp regex bộ màu và không chứa Lỗi máy chủ:', () => {
      const msg = formatServerErrorMessage('MISSING_MONOPOLY');
      expect(msg).toMatch(/bộ màu/i);
      expect(msg).not.toContain('Lỗi máy chủ:');
    });
  });

  // =========================================================================
  // FACET 2: EXCLUSIVE CHIP PRIORITY & ANTI-COLLISION INVARIANT
  // =========================================================================
  describe('Facet 2: Exclusive Chip Priority & Anti-Collision Invariant', () => {
    it('[TC-IMP134.23/MSS][UC-IMP134][Facet-2/Reactivity] isInsolvent: true trả về notice type insolvent, icon 🚨 và văn bản phân giải', () => {
      const notice = getActionDockNotice({
        isInsolvent: true,
        inAudit: false,
        isSkippedTurn: false,
        isMyTurn: true,
      });
      expect(notice).not.toBeNull();
      expect(notice.type).toBe('insolvent');
      expect(notice.icon).toBe('🚨');
    });

    it('[TC-IMP134.24/MSS][UC-IMP134][Facet-2/Reactivity] Priority 1: isInsolvent áp đảo tất cả cờ khác (inAudit, isSkippedTurn, botPacing)', () => {
      const notice = getActionDockNotice({
        isInsolvent: true,
        inAudit: true,
        isSkippedTurn: true,
        isMyTurn: false,
        botPacing: {
          botId: 'bot_1',
          botName: 'AI Shark',
          botOrder: 1,
          totalBots: 2,
          displayText: 'Lượt AI Shark',
        },
      });
      expect(notice?.type).toBe('insolvent');
      expect(notice?.icon).toBe('🚨');
    });

    it('[TC-IMP134.25/MSS][UC-IMP134][Facet-2/Reactivity] Priority 2: inAudit: true khi isInsolvent: false trả về notice type audit, icon ⚖️', () => {
      const notice = getActionDockNotice({
        isInsolvent: false,
        inAudit: true,
        isSkippedTurn: false,
        isMyTurn: true,
      });
      expect(notice?.type).toBe('audit');
      expect(notice?.icon).toBe('⚖️');
    });

    it('[TC-IMP134.26/MSS][UC-IMP134][Facet-2/Reactivity] Priority 2 Dominance: inAudit thắng isSkippedTurn và botPacing khi không bị vỡ nợ', () => {
      const notice = getActionDockNotice({
        isInsolvent: false,
        inAudit: true,
        isSkippedTurn: true,
        isMyTurn: false,
        botPacing: {
          botId: 'bot_2',
          botName: 'AI Whale',
          botOrder: 2,
          totalBots: 3,
          displayText: 'Lượt AI Whale',
        },
      });
      expect(notice?.type).toBe('audit');
      expect(notice?.icon).toBe('⚖️');
    });

    it('[TC-IMP134.27/MSS][UC-IMP134][Facet-2/Reactivity] Priority 3: isSkippedTurn: true khi inAudit & isInsolvent false trả về notice type skip_turn, icon 🌪️', () => {
      const notice = getActionDockNotice({
        isInsolvent: false,
        inAudit: false,
        isSkippedTurn: true,
        isMyTurn: true,
      });
      expect(notice?.type).toBe('skip_turn');
      expect(notice?.icon).toBe('🌪️');
    });

    it('[TC-IMP134.28/MSS][UC-IMP134][Facet-2/Reactivity] Priority 4: botPacing có dữ liệu và không phải lượt mình trả về notice type bot_pacing, icon 🤖', () => {
      const notice = getActionDockNotice({
        isInsolvent: false,
        inAudit: false,
        isSkippedTurn: false,
        isMyTurn: false,
        botPacing: {
          botId: 'bot_1',
          botName: 'AI Bot',
          botOrder: 1,
          totalBots: 2,
          displayText: 'Lượt AI Bot',
        },
      });
      expect(notice?.type).toBe('bot_pacing');
      expect(notice?.icon).toBe('🤖');
    });

    it('[TC-IMP134.29/MSS][UC-IMP134][Facet-2/Reactivity] Khi isMyTurn: true thì botPacing bị triệt tiêu không hiển thị', () => {
      const notice = getActionDockNotice({
        isInsolvent: false,
        inAudit: false,
        isSkippedTurn: false,
        isMyTurn: true,
        botPacing: {
          botId: 'bot_1',
          botName: 'AI Bot',
          botOrder: 1,
          totalBots: 2,
          displayText: 'Lượt AI Bot',
        },
      });
      expect(notice).toBeNull();
    });

    it('[TC-IMP134.30/MSS][UC-IMP134][Facet-2/Reactivity] Trả về null khi không có điều kiện nào thỏa mãn', () => {
      const notice = getActionDockNotice({
        isInsolvent: false,
        inAudit: false,
        isSkippedTurn: false,
        isMyTurn: true,
        botPacing: null,
      });
      expect(notice).toBeNull();
    });

    it('[TC-IMP134.31/MSS][UC-IMP134][Facet-2/Reactivity] Consumer-Side Invariant: mobileText của mọi loại notice không vượt quá 45 ký tự', () => {
      const insolventNotice = getActionDockNotice({ isInsolvent: true });
      const auditNotice = getActionDockNotice({ isInsolvent: false, inAudit: true });
      const skipNotice = getActionDockNotice({ isInsolvent: false, inAudit: false, isSkippedTurn: true });
      const botNotice = getActionDockNotice({
        isInsolvent: false,
        inAudit: false,
        isSkippedTurn: false,
        isMyTurn: false,
        botPacing: {
          botId: 'b1',
          botName: 'Tỷ Phú Tự Động',
          botOrder: 1,
          totalBots: 2,
          displayText: 'Lượt Tỷ Phú',
        },
      });

      expect(insolventNotice.mobileText.length).toBeLessThanOrEqual(45);
      expect(auditNotice.mobileText.length).toBeLessThanOrEqual(45);
      expect(skipNotice.mobileText.length).toBeLessThanOrEqual(45);
      expect(botNotice.mobileText.length).toBeLessThanOrEqual(45);
    });
  });

  // =========================================================================
  // FACET 3: TOAST TWO-TIER RENDERING & CLOSE DISPOSAL
  // =========================================================================
  describe('Facet 3: Toast Two-Tier Rendering & Close Disposal', () => {
    it('[TC-IMP134.32/MSS][UC-IMP134][Facet-3/Disposal] ServerToast render với role alert hỗ trợ accessibility', () => {
      const html = renderToStaticMarkup(
        React.createElement(ServerToast, { message: 'Chưa tới lượt đổ xúc xắc' })
      );
      expect(html).toContain('role="alert"');
    });

    it('[TC-IMP134.33/MSS][UC-IMP134][Facet-3/Disposal] ServerToast chứa class định vị an toàn top-18 hoặc top-20 hoặc mt-16 dưới TopBar', () => {
      const html = renderToStaticMarkup(
        React.createElement(ServerToast, { message: 'Thông báo định vị' })
      );
      expect(html).toMatch(/top-18|top-20|mt-16/);
    });

    it('[TC-IMP134.34/MSS][UC-IMP134][Facet-3/Disposal] ServerToast hiển thị nội dung thông báo rõ ràng tại điểm tiêu thụ', () => {
      const html = renderToStaticMarkup(
        React.createElement(ServerToast, { message: 'Quy tắc xây dựng đều tay' })
      );
      expect(html).toContain('Quy tắc xây dựng đều tay');
    });

    it('[TC-IMP134.35/MSS][UC-IMP134][Facet-3/Disposal] ServerToast chứa nút đóng button với aria-label="Đóng thông báo"', () => {
      const html = renderToStaticMarkup(
        React.createElement(ServerToast, { message: 'Thông báo có thể đóng' })
      );
      expect(html).toContain('<button');
      expect(html).toContain('aria-label="Đóng thông báo"');
    });

    it('[TC-IMP134.36/MSS][UC-IMP134][Facet-3/Disposal] ServerToast trả về rỗng khi message là null hoặc chuỗi rỗng', () => {
      const htmlNull = renderToStaticMarkup(
        React.createElement(ServerToast, { message: null })
      );
      const htmlEmpty = renderToStaticMarkup(
        React.createElement(ServerToast, { message: '' })
      );
      expect(htmlNull).toBe('');
      expect(htmlEmpty).toBe('');
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & INPUT SANITIZATION
  // =========================================================================
  describe('Facet 4: Error Defense & Input Sanitization', () => {
    it('[TC-IMP134.37/MSS][UC-IMP134][Facet-4/ErrorDefense] resolveActionableNotification xử lý chuỗi rỗng an toàn không ném exception', () => {
      const res = getActionableNotification('');
      expect(res).toBeDefined();
      expect(res.icon).toBe('ℹ️');
      expect(res.tone).toBe('info');
    });

    it('[TC-IMP134.38/MSS][UC-IMP134][Facet-4/ErrorDefense] resolveActionableNotification xử lý null/undefined an toàn với fallback', () => {
      const resNull = getActionableNotification(null as any);
      const resUndef = getActionableNotification(undefined as any);
      expect(resNull.icon).toBe('ℹ️');
      expect(resUndef.icon).toBe('ℹ️');
    });

    it('[TC-IMP134.39/MSS][UC-IMP134][Facet-4/ErrorDefense] formatServerErrorMessage chuỗi rỗng trả về thông báo mặc định thân thiện không kết thúc bằng dấu hai chấm trần', () => {
      const msg = formatServerErrorMessage('');
      expect(msg).toBeDefined();
      expect(msg.length).toBeGreaterThan(5);
      expect(msg).not.toMatch(/:\s*$/);
      expect(msg).not.toContain('Lỗi máy chủ:');
    });
  });
});
