// [TC-229.01/MSS..TC-229.18/MSS][UC-IMP229] Lean Flow Financial Notifications & Conditional Formula Rendering Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Formula Suppression for Direct Actions ([TC-229.01] - [TC-229.06])
// Facet 2: Formula Preservation for Complex Actions ([TC-229.07] - [TC-229.11])
// Facet 3: Natural Flow, Anti-Duplication & Robust Regex Scraping ([TC-229.12] - [TC-229.14])
// Facet 4: Mobile Ergonomics & Styling Preservation ([TC-229.15] - [TC-229.16])
// Facet 5: Zero Regression Gate ([TC-229.17] - [TC-229.18])

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { FloatingBadge } from '../../src/client/ui/floating_numbers';
import { resolveFormulaText } from '../../src/client/ui/transaction_formula';
import { resolveTransactionNarrative } from '../../src/client/ui/transaction_narrative';
import * as propertyRentDomain from '../../src/domain/property_rent';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
} from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';

// ============================================================================
// REALISTIC MOCK FIXTURES (REAL DOMAIN ENTITIES)
// ============================================================================
const mockPlayerPayer: PlayerHudInfo = {
  id: 'player-1',
  name: 'Đại Gia Sài Gòn',
  balance: 5000,
  tokenColor: '#3B82F6',
  ownedProperties: [3, 39],
  isBankrupt: false,
};

const mockPlayerReceiver: PlayerHudInfo = {
  id: 'player-2',
  name: 'Tỷ Phú Hà Thành',
  balance: 8000,
  tokenColor: '#EF4444',
  ownedProperties: [12, 28],
  isBankrupt: false,
};

const mockPlayersInfo: Record<string, PlayerHudInfo> = {
  'player-1': mockPlayerPayer,
  'player-2': mockPlayerReceiver,
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('[TC-229.01/MSS..TC-229.18/MSS][UC-IMP229] Lean Flow Financial Notifications & Conditional Formula Rendering Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      playersInfo: mockPlayersInfo,
      activeModal: null,
    });
    useLobbyStore.setState({
      myPlayerId: 'player-1',
    });
  });

  // ===========================================================================
  // FACET 1: Formula Suppression for Direct Actions ([TC-229.01] - [TC-229.06])
  // ===========================================================================
  describe('Facet 1: Formula Suppression for Direct Actions', () => {
    it('[TC-229.01/MSS][UC-IMP229] resolveFormulaText với actionType: "buy" bắt buộc trả về chuỗi rỗng', () => {
      const item: FloatingTextItem = {
        id: 'ft-buy-direct',
        text: '-4.000 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'buy',
        cellIndex: 39,
        title: 'Mua TP.HCM (Quận 1 - Nguyễn Huệ)',
        timestamp: Date.now(),
      };
      const formula = resolveFormulaText(item, 'TP.HCM (Quận 1 - Nguyễn Huệ)', false);
      expect(formula).toBe('');
    });

    it('[TC-229.02/MSS][UC-IMP229] resolveFormulaText với actionType: "upgrade" bắt buộc trả về chuỗi rỗng', () => {
      const item: FloatingTextItem = {
        id: 'ft-upgrade-direct',
        text: '-600 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'upgrade',
        cellIndex: 3,
        title: 'Nâng cấp nhà Bến Bạch Đằng (C1)',
        timestamp: Date.now(),
      };
      const formula = resolveFormulaText(item, 'Bến Bạch Đằng', false);
      expect(formula).toBe('');
    });

    it('[TC-229.03/MSS][UC-IMP229] resolveFormulaText khi caller truyền item.formula: "" hoặc null (tombstone) bắt buộc trả về chuỗi rỗng và không rơi vào switch-case default hay gây runtime crash', () => {
      const itemEmpty: FloatingTextItem = {
        id: 'ft-explicit-empty-formula',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'bail',
        formula: '',
        cellIndex: 10,
        title: 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc',
        timestamp: Date.now(),
      };
      const formulaEmpty = resolveFormulaText(itemEmpty, 'Trạm Kiểm Toán', false);
      expect(formulaEmpty).toBe('');

      // Phòng vệ delta tombstone gửi null
      const itemNull: FloatingTextItem = {
        ...itemEmpty,
        id: 'ft-explicit-null-formula',
        formula: null as unknown as string,
      };
      const formulaNull = resolveFormulaText(itemNull, 'Trạm Kiểm Toán', false);
      expect(formulaNull).toBe('');
    });

    it('[TC-229.04/MSS][UC-IMP229] Render FloatingBadge cho actionType: "buy" không hiển thị dòng transaction-formula-line', () => {
      const item: FloatingTextItem = {
        id: 'ft-badge-buy',
        text: '-4.000 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'buy',
        cellIndex: 39,
        title: 'Mua TP.HCM (Quận 1 - Nguyễn Huệ)',
        timestamp: Date.now(),
      };
      const markup = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(markup).not.toContain('data-testid="transaction-formula-line"');
    });

    it('[TC-229.05/MSS][UC-IMP229] Render FloatingBadge cho actionType: "upgrade" không hiển thị dòng transaction-formula-line', () => {
      const item: FloatingTextItem = {
        id: 'ft-badge-upgrade',
        text: '-600 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'upgrade',
        cellIndex: 3,
        title: 'Nâng cấp nhà Bến Bạch Đằng (C1)',
        timestamp: Date.now(),
      };
      const markup = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(markup).not.toContain('data-testid="transaction-formula-line"');
    });

    it('[TC-229.06/MSS][UC-IMP229] Render FloatingBadge với formula chứa toàn khoảng trắng ("   ") không hiển thị dòng transaction-formula-line', () => {
      const item: FloatingTextItem = {
        id: 'ft-badge-whitespace-formula',
        text: '-400 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'tax',
        formula: '   ',
        cellIndex: 4,
        title: 'Nộp Lệ Phí Đất Đai (Ô 04)',
        timestamp: Date.now(),
      };
      const markup = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(markup).not.toContain('data-testid="transaction-formula-line"');
    });
  });

  // ===========================================================================
  // FACET 2: Formula Preservation for Complex Actions ([TC-229.07] - [TC-229.11])
  // ===========================================================================
  describe('Facet 2: Formula Preservation for Complex Actions', () => {
    it('[TC-229.07/MSS][UC-IMP229] actionType: "tax" Ô 04 bảo tồn công thức "Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)"', () => {
      const item: FloatingTextItem = {
        id: 'ft-tax-cell4',
        text: '-400 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'tax',
        cellIndex: 4,
        title: 'Nộp Lệ Phí Đất Đai (Ô 04) ➔ Kho Bạc',
        timestamp: Date.now(),
      };
      const formula = resolveFormulaText(item, 'Lệ Phí Đất Đai', false);
      expect(formula).toBe('Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)');
    });

    it('[TC-229.08/MSS][UC-IMP229] actionType: "rent_pay" có title chứa "Độc quyền" bảo tồn công thức x2 tiền thuê', () => {
      const item: FloatingTextItem = {
        id: 'ft-rent-monopoly',
        text: '-600 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'rent_pay',
        cellIndex: 3,
        title: 'Độc quyền nhóm màu (x2 tiền thuê): Bến Bạch Đằng',
        timestamp: Date.now(),
      };
      const formula = resolveFormulaText(item, 'Bến Bạch Đằng', false);
      expect(formula).toBe('Độc quyền nhóm màu (x2 tiền thuê): Bến Bạch Đằng');
    });

    it('[TC-229.09/MSS][UC-IMP229] actionType: "bail" bảo tồn công thức bảo lãnh kiểm toán chuẩn xác với MIN_BAIL_AMOUNT SSOT', () => {
      const item: FloatingTextItem = {
        id: 'ft-bail-formula',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'bail',
        cellIndex: 10,
        title: 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc',
        timestamp: Date.now(),
      };
      const formula = resolveFormulaText(item, 'Trạm Kiểm Toán', false);
      expect(formula).toBe(`Bảo lãnh sớm: 10% tài sản ròng (Sàn ${propertyRentDomain.MIN_BAIL_AMOUNT} Tr.)`);
    });

    it('[TC-229.10/MSS][UC-IMP229] actionType: "mortgage" bảo tồn công thức vay vốn tín dụng ngân hàng 50% giá trị đất', () => {
      const item: FloatingTextItem = {
        id: 'ft-mortgage-formula',
        text: '+300 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'player-1',
        actionType: 'mortgage',
        cellIndex: 3,
        title: 'Thế chấp Bến Bạch Đằng ➔ Vay Ngân Hàng',
        timestamp: Date.now(),
      };
      const formula = resolveFormulaText(item, 'Bến Bạch Đằng', true);
      expect(formula).toBe('Vay vốn tín dụng ngân hàng (50% giá trị đất)');
    });

    it('[TC-229.11/MSS][UC-IMP229] Render FloatingBadge cho các giao dịch có công thức phức tạp (tax, bail, mortgage) bắt buộc hiển thị transaction-formula-line', () => {
      const taxItem: FloatingTextItem = {
        id: 'ft-badge-tax',
        text: '-400 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'tax',
        cellIndex: 4,
        title: 'Nộp Lệ Phí Đất Đai (Ô 04) ➔ Kho Bạc',
        timestamp: Date.now(),
      };
      const bailItem: FloatingTextItem = {
        id: 'ft-badge-bail',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'bail',
        cellIndex: 10,
        title: 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc',
        timestamp: Date.now(),
      };
      const mortgageItem: FloatingTextItem = {
        id: 'ft-badge-mortgage',
        text: '+300 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'player-1',
        actionType: 'mortgage',
        cellIndex: 3,
        title: 'Thế chấp Bến Bạch Đằng ➔ Vay Ngân Hàng',
        timestamp: Date.now(),
      };

      const taxMarkup = renderToStaticMarkup(React.createElement(FloatingBadge, { item: taxItem }));
      const bailMarkup = renderToStaticMarkup(React.createElement(FloatingBadge, { item: bailItem }));
      const mortgageMarkup = renderToStaticMarkup(React.createElement(FloatingBadge, { item: mortgageItem }));

      expect(taxMarkup).toContain('data-testid="transaction-formula-line"');
      expect(bailMarkup).toContain('data-testid="transaction-formula-line"');
      expect(mortgageMarkup).toContain('data-testid="transaction-formula-line"');
    });
  });

  // ===========================================================================
  // FACET 3: Natural Flow, Anti-Duplication & Robust Regex Scraping ([TC-229.12] - [TC-229.14])
  // ===========================================================================
  describe('Facet 3: Natural Flow, Anti-Duplication & Robust Regex Scraping', () => {
    it('[TC-229.12/MSS][UC-IMP229] actionType: "buy" sinh câu dòng tiền tự nhiên "mua sở hữu [Tên Ô]" và tuyệt đối không chứa đuôi "từ Ngân Hàng"', () => {
      const item: FloatingTextItem = {
        id: 'ft-buy-natural-target',
        text: '-4.000 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'buy',
        cellIndex: 39,
        title: 'Mua TP.HCM (Quận 1 - Nguyễn Huệ)',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrative.target).toBe('mua sở hữu TP.HCM (Quận 1 - Nguyễn Huệ)');
      expect(narrative.target).not.toContain('từ Ngân Hàng');
    });

    it('[TC-229.13/MSS][UC-IMP229] Regex bóc tách item.title phòng vệ triệt tiêu hoàn toàn lỗi lặp từ ngữ "sở hữu sở hữu" hoặc "mua sở hữu Mua"', () => {
      // Nhánh 1: Title đầu vào đã có "Mua sở hữu", cellIndex undefined
      const itemWithPrefix: FloatingTextItem = {
        id: 'ft-buy-regex-a',
        text: '-600 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'buy',
        title: 'Mua sở hữu Bến Bạch Đằng',
        timestamp: Date.now(),
      };
      const narrativeWithPrefix = resolveTransactionNarrative(itemWithPrefix, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrativeWithPrefix.target).toBe('mua sở hữu Bến Bạch Đằng');
      expect(narrativeWithPrefix.target).not.toContain('sở hữu sở hữu');

      // Nhánh 2: Title chỉ là "Mua", cellIndex undefined
      const itemBareMua: FloatingTextItem = {
        id: 'ft-buy-regex-b',
        text: '-600 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'buy',
        title: 'Mua',
        timestamp: Date.now(),
      };
      const narrativeBareMua = resolveTransactionNarrative(itemBareMua, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrativeBareMua.target).toBe('mua sở hữu BĐS');
      expect(narrativeBareMua.target).not.toContain('mua sở hữu Mua');
    });

    it('[TC-229.14/MSS][UC-IMP229] Nội dung văn bản hiển thị của FloatingBadge khi mua đất chỉ chứa tên ô đất duy nhất 1 lần và bảo tồn tooltip title', () => {
      const cellName = 'TP.HCM (Quận 1 - Nguyễn Huệ)';
      const item: FloatingTextItem = {
        id: 'ft-buy-single-cell-name',
        text: '-4.000 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'buy',
        cellIndex: 39,
        title: `Mua ${cellName}`,
        timestamp: Date.now(),
      };

      const markup = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));

      // Trích xuất textContent thuần túy hiển thị ra giao diện (loại bỏ toàn bộ HTML tags và attributes)
      const visibleText = markup.replace(/<[^>]*>/g, ' ');
      const escapedCellName = escapeRegExp(cellName);
      const occurrences = (visibleText.match(new RegExp(escapedCellName, 'g')) || []).length;

      expect(occurrences).toBe(1);
      expect(markup).not.toContain('data-testid="transaction-formula-line"');
      expect(markup).toContain(`title="${item.title}"`);
    });
  });

  // ===========================================================================
  // FACET 4: Mobile Ergonomics & Styling Preservation ([TC-229.15] - [TC-229.16])
  // ===========================================================================
  describe('Facet 4: Mobile Ergonomics & Styling Preservation', () => {
    it('[TC-229.15/MSS][UC-IMP229] Khi không có dòng công thức, thẻ thông báo bảo toàn styling nền, bo góc rounded-2xl, border-slate-300 và nút đóng ✕', () => {
      const item: FloatingTextItem = {
        id: 'ft-style-preservation',
        text: '-4.000 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'buy',
        cellIndex: 39,
        title: 'Mua TP.HCM (Quận 1 - Nguyễn Huệ)',
        timestamp: Date.now(),
      };

      const markup = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));

      expect(markup).toContain('rounded-2xl');
      expect(markup).toContain('border-slate-300');
      expect(markup).toContain('px-3 sm:px-4');
      expect(markup).toContain('aria-label="Đóng thông báo"');
    });

    it('[TC-229.16/MSS][UC-IMP229] Thuộc tính trợ năng aria-label trên badge duy trì định dạng chuẩn "${category}: nhấn để đóng"', () => {
      const item: FloatingTextItem = {
        id: 'ft-a11y-label',
        text: '-4.000 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'buy',
        cellIndex: 39,
        title: 'Mua TP.HCM (Quận 1 - Nguyễn Huệ)',
        timestamp: Date.now(),
      };

      const markup = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(markup).toContain('aria-label="MUA ĐẤT ĐẦU TƯ: nhấn để đóng"');
    });
  });

  // ===========================================================================
  // FACET 5: Zero Regression Gate ([TC-229.17] - [TC-229.18])
  // ===========================================================================
  describe('Facet 5: Zero Regression Gate', () => {
    it('[TC-229.17/MSS][UC-IMP229] Bảo toàn hợp đồng TC-194.09: actionType: "buy" sinh category MUA ĐẤT ĐẦU TƯ, icon 🏷️, verb thanh toán, target chứa "mua"', () => {
      const item: FloatingTextItem = {
        id: 'ft-regression-194-09',
        text: '-600 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'buy',
        cellIndex: 3,
        title: 'Mua Bến Bạch Đằng',
        timestamp: Date.now(),
      };

      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrative.category).toBe('MUA ĐẤT ĐẦU TƯ');
      expect(narrative.icon).toBe('🏷️');
      expect(narrative.verb).toBe('thanh toán');
      expect(narrative.target).toContain('mua');
    });

    it('[TC-229.18/MSS][UC-IMP229] resolveFormulaText bảo tồn nguyên vẹn công thức của salary ("Hoàn thành 1 vòng: Thưởng lương qua ô Khởi Hành")', () => {
      const item: FloatingTextItem = {
        id: 'ft-regression-salary',
        text: '+2.000 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'player-1',
        actionType: 'salary',
        title: 'Thưởng lương qua ô Khởi Hành',
        timestamp: Date.now(),
      };

      const formula = resolveFormulaText(item, 'Khởi Hành', true);
      expect(formula).toBe('Hoàn thành 1 vòng: Thưởng lương qua ô Khởi Hành');

      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrative.formula).toBe('Hoàn thành 1 vòng: Thưởng lương qua ô Khởi Hành');
    });
  });
});
