// [TC-216.01/MSS..TC-216.16/MSS][UC-IMP216] Financial Notification Formula Transparency & Mobile Full-Width Badge Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Phân giải Công thức SSOT (Audit Jail & Bail - Tự nguyện vs Cưỡng chế vs Gieo đôi) ([TC-216.01] - [TC-216.04])
// Facet 2: Tiện ích & Hạ tầng (Điện EVN qua GO & Cước data Viettel) ([TC-216.05] - [TC-216.07])
// Facet 3: Thuế & Lệ phí Tài chính Vĩ mô (Ô 04 & Thuế vượt GO) ([TC-216.08] - [TC-216.10])
// Facet 4: Bất Động Sản Độc Quyền & Thẻ Đặc Quyền Ngoại Giao ([TC-216.11] - [TC-216.13])
// Facet 5: Công thái học Mobile Full-Width, Data Lifecycle & Cấu trúc 3 Tầng DOM ([TC-216.14] - [TC-216.16])

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  FloatingBadge,
  FloatingNumbersOverlay,
} from '../../src/client/ui/floating_numbers';
import {
  resolveTransactionNarrative,
} from '../../src/client/ui/transaction_narrative';
import * as propertyRentDomain from '../../src/domain/property_rent';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
} from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';

// ============================================================================
// REALISTIC MOCK FIXTURES
// ============================================================================
const mockPlayerPayer: PlayerHudInfo = {
  id: 'player-1',
  name: 'Đại Gia Sài Gòn',
  balance: 5000,
  tokenColor: '#3B82F6',
  ownedProperties: [3],
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

describe('[TC-216.01/MSS..TC-216.16/MSS][UC-IMP216] Financial Notification Formula Transparency & Mobile Full-Width Badge Contract Suite', () => {
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
  // FACET 1: Phân giải Công thức SSOT (Audit Jail & Bail - Tự nguyện vs Cưỡng chế vs Gieo đôi)
  // ===========================================================================
  describe('Facet 1: Phân giải Công thức SSOT (Audit Jail & Bail)', () => {
    it('[TC-216.01/MSS][UC-IMP216] Tự nguyện nộp bảo lãnh sớm (actionType: "bail"): Dòng 1 sinh công thức "Bảo lãnh sớm: 10% tài sản ròng (Sàn 500 Tr.)"', () => {
      const item: FloatingTextItem = {
        id: 'float-bail-early',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'bail',
        title: 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc',
        cellIndex: 10,
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrative.formula).toBe('Bảo lãnh sớm: 10% tài sản ròng (Sàn 500 Tr.)');
    });

    it('[TC-216.02/MSS][UC-IMP216] Hết 3 lượt cưỡng chế phạt (title chứa "Hết 3 lượt", "bắt buộc", hoặc bailKind: "forced"): Dòng 1 sinh "Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc"', () => {
      const item: FloatingTextItem = {
        id: 'float-bail-forced',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'bail',
        title: 'Cưỡng chế kiểm toán ➔ Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc',
        cellIndex: 10,
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrative.formula).toBe('Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc');

      // Xác minh bailKind: 'forced' độc lập với string sniffing trên title
      const itemKind: FloatingTextItem = {
        id: 'float-bail-forced-kind',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'bail',
        bailKind: 'forced',
        title: 'Kho Bạc Thu Phí',
        cellIndex: 10,
        timestamp: Date.now(),
      };
      const narrativeKind = resolveTransactionNarrative(itemKind, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrativeKind.formula).toBe('Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc');
    });

    it('[TC-216.03/MSS][UC-IMP216] Gieo xúc xắc đôi thoát kiểm toán (actionType: "audit_jail", text "0 Tr."): Dòng 1 sinh "Gieo xúc xắc đôi: Thoát kiểm toán miễn phí", số tiền "0 Tr."', () => {
      const item: FloatingTextItem = {
        id: 'float-audit-double',
        text: '0 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'player-1',
        actionType: 'audit_jail',
        title: 'Gieo xúc xắc đôi: Thoát kiểm toán',
        cellIndex: 10,
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrative.formula).toBe('Gieo xúc xắc đôi: Thoát kiểm toán miễn phí');
      expect(narrative.amountText).toBe('0 Tr.');
    });

    it('[TC-216.04/MSS][UC-IMP216] Tự động cập nhật theo hằng số SSOT: Chuỗi công thức nhập trực tiếp MIN_BAIL_AMOUNT từ src/domain/property_rent.ts', () => {
      const minBailAmount = propertyRentDomain.MIN_BAIL_AMOUNT;
      expect(minBailAmount).toBe(500);

      const item: FloatingTextItem = {
        id: 'float-bail-ssot',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'bail',
        title: 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc',
        cellIndex: 10,
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrative.formula).toBe(`Bảo lãnh sớm: 10% tài sản ròng (Sàn ${minBailAmount} Tr.)`);
    });
  });

  // ===========================================================================
  // FACET 2: Tiện ích & Hạ tầng (Điện EVN qua GO & Cước data Viettel)
  // ===========================================================================
  describe('Facet 2: Tiện ích & Hạ tầng (Điện EVN & Viettel Data)', () => {
    it('[TC-216.05/MSS][UC-IMP216] Tiền điện EVN khi đối thủ qua GO (actionType: "rent_pay", cellIndex 12 hoặc title chứa EVN): Dòng 1 sinh "Hóa đơn tiền điện EVN khi qua ô Khởi Hành"', () => {
      const item: FloatingTextItem = {
        id: 'float-evn-bill',
        text: '-200 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'rent_pay',
        cellIndex: 12,
        title: 'Hóa đơn tiền điện EVN khi qua ô Khởi Hành',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrative.formula).toBe('Hóa đơn tiền điện EVN khi qua ô Khởi Hành');
    });

    it('[TC-216.06/MSS][UC-IMP216] Cước data Viettel khi vào ô Thị Trường/Cơ Hội (cellIndex 28 hoặc title chứa Viettel/data): Dòng 1 sinh "Cước data viễn thông Viettel (150 Tr.)", khớp TELECOM_DATA_FEE', () => {
      const telecomFee = propertyRentDomain.TELECOM_DATA_FEE;
      expect(telecomFee).toBe(150);

      const item: FloatingTextItem = {
        id: 'float-viettel-data',
        text: '-150 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'rent_pay',
        cellIndex: 28,
        title: 'Cước data viễn thông Viettel (150 Tr.)',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrative.formula).toBe(`Cước data viễn thông Viettel (${telecomFee} Tr.)`);
    });

    it('[TC-216.07/MSS][UC-IMP216] Phân biệt tiền thuê BĐS thường vs Cước tiện ích hạ tầng: cellIndex khác không bị nhận nhầm thành cước Viettel', () => {
      const item: FloatingTextItem = {
        id: 'float-standard-rent',
        text: '-350 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'rent_pay',
        cellIndex: 3,
        title: 'Tiền thuê Bến Bạch Đằng',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrative.formula).toBe('Tiền thuê lưu trú tại Bến Bạch Đằng');
      expect(narrative.formula).not.toContain('Viettel');
      expect(narrative.formula).not.toContain('EVN');
    });
  });

  // ===========================================================================
  // FACET 3: Thuế & Lệ phí Tài chính Vĩ mô (Ô 04 & Thuế vượt GO)
  // ===========================================================================
  describe('Facet 3: Thuế & Lệ phí Tài chính Vĩ mô', () => {
    it('[TC-216.08/MSS][UC-IMP216] Lệ phí Đất đai (Ô 04): Dòng 1 sinh "Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)"', () => {
      const item: FloatingTextItem = {
        id: 'float-tax-cell4',
        text: '-400 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'tax',
        cellIndex: 4,
        title: 'Nộp Lệ Phí Đất Đai (Ô 04) ➔ Kho Bạc',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrative.formula).toBe('Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)');
    });

    it('[TC-216.09/MSS][UC-IMP216] Thuế tài sản vượt GO: Dòng 1 sinh Thuế tài sản qua GO (Tối đa 2.000 Tr.), đối chiếu với GO_PROPERTY_TAX_CAP', () => {
      const taxCapFormatted = (propertyRentDomain.GO_PROPERTY_TAX_CAP ?? 1000).toLocaleString('vi-VN');
      const item: FloatingTextItem = {
        id: 'float-tax-go',
        text: '-1.000 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'tax',
        title: 'Thuế tài sản qua GO ➔ Kho Bạc',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrative.formula).toBe(`Thuế tài sản qua GO (Tối đa ${taxCapFormatted} Tr.)`);
    });

    it('[TC-216.10/MSS][UC-IMP216] Lương qua ô Khởi Hành (actionType: "salary"): Dòng 1 sinh "Hoàn thành 1 vòng: Thưởng lương qua ô Khởi Hành"', () => {
      const item: FloatingTextItem = {
        id: 'float-salary',
        text: '+2.000 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'player-1',
        actionType: 'salary',
        title: 'Thưởng lương qua ô Khởi Hành',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrative.formula).toBe('Hoàn thành 1 vòng: Thưởng lương qua ô Khởi Hành');
    });
  });

  // ===========================================================================
  // FACET 4: Bất Động Sản Độc Quyền & Thẻ Đặc Quyền Ngoại Giao
  // ===========================================================================
  describe('Facet 4: Bất Động Sản Độc Quyền & Thẻ Ngoại Giao', () => {
    it('[TC-216.11/MSS][UC-IMP216] Tiền thuê BĐS có Độc Quyền (Monopoly x2): Dòng 1 sinh "Độc quyền nhóm màu (x2 tiền thuê): [Tên ô]"', () => {
      const item: FloatingTextItem = {
        id: 'float-rent-monopoly',
        text: '-600 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'rent_pay',
        cellIndex: 3,
        title: 'Độc quyền nhóm màu (x2 tiền thuê): Bến Bạch Đằng',
        timestamp: Date.now(),
      };
      const narrative = resolveTransactionNarrative(item, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(narrative.formula).toBe('Độc quyền nhóm màu (x2 tiền thuê): Bến Bạch Đằng');
    });

    it('[TC-216.12/MSS][UC-IMP216] Thẻ Ngoại Giao đối xứng 2 chiều: Khách thuê miễn 100% tiền thuê BĐS vs Chủ nhà hụt thu tiền thuê', () => {
      const tenantItem: FloatingTextItem = {
        id: 'float-diplo-tenant',
        text: '0 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'player-1',
        actionType: 'diplomatic',
        cellIndex: 3,
        title: 'Kích hoạt Thẻ Ngoại Giao',
        timestamp: Date.now(),
      };
      const tenantNarrative = resolveTransactionNarrative(tenantItem, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(tenantNarrative.formula).toBe('Đặc quyền ngoại giao: Miễn 100% tiền thuê BĐS');

      const landlordItem: FloatingTextItem = {
        id: 'float-diplo-landlord',
        text: '-0 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-2',
        actionType: 'diplomatic',
        cellIndex: 3,
        title: 'Khách dùng Thẻ Ngoại Giao - Hụt thu tiền thuê',
        timestamp: Date.now(),
      };
      const landlordNarrative = resolveTransactionNarrative(landlordItem, mockPlayerReceiver, mockPlayersInfo, 'player-1');
      expect(landlordNarrative.formula).toBe('Khách dùng Thẻ Ngoại Giao: Hụt thu tiền thuê');
    });

    it('[TC-216.13/MSS][UC-IMP216] Thế chấp & Giải chấp ngân hàng: Vay vốn tín dụng ngân hàng (50% giá trị đất) vs Chuộc lại đất thế chấp (Gốc + 10% phí Kho Bạc)', () => {
      const mortgageItem: FloatingTextItem = {
        id: 'float-mortgage',
        text: '+300 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'player-1',
        actionType: 'mortgage',
        cellIndex: 3,
        title: 'Thế chấp Bến Bạch Đằng ➔ Vay Ngân Hàng',
        timestamp: Date.now(),
      };
      const mortgageNarrative = resolveTransactionNarrative(mortgageItem, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(mortgageNarrative.formula).toBe('Vay vốn tín dụng ngân hàng (50% giá trị đất)');

      const unmortgageItem: FloatingTextItem = {
        id: 'float-unmortgage',
        text: '-330 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'unmortgage',
        cellIndex: 3,
        title: 'Giải chấp Bến Bạch Đằng (Phí 10% ➔ Kho Bạc)',
        timestamp: Date.now(),
      };
      const unmortgageNarrative = resolveTransactionNarrative(unmortgageItem, mockPlayerPayer, mockPlayersInfo, 'player-1');
      expect(unmortgageNarrative.formula).toBe('Chuộc lại đất thế chấp (Gốc + 10% phí Kho Bạc)');
    });
  });

  // ===========================================================================
  // FACET 5: Công thái học Mobile Full-Width, Data Lifecycle & Cấu trúc 3 Tầng DOM
  // ===========================================================================
  describe('Facet 5: Mobile Full-Width, Cấu trúc 3 Tầng & Data Lifecycle', () => {
    it('[TC-216.14/MSS][UC-IMP216] FloatingNumbersOverlay trên mobile render w-[calc(100vw-1.5rem)] và left-1/2 -translate-x-1/2, KHÔNG còn chứa max-w-[calc(100vw-11.5rem)]', () => {
      useGameStore.setState({
        floatingTexts: [
          {
            id: 'ft-overlay-test',
            text: '-200 Tr.',
            type: FloatingTextType.Penalty,
            playerId: 'player-1',
            actionType: 'rent_pay',
            cellIndex: 12,
            timestamp: Date.now(),
          },
        ],
        activeModal: null,
      });

      const markup = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(markup).toContain('w-[calc(100vw-1.5rem)]');
      expect(markup).toContain('left-1/2 -translate-x-1/2');
      expect(markup).not.toContain('max-w-[calc(100vw-11.5rem)]');
    });

    it('[TC-216.15/MSS][UC-IMP216] FloatingBadge render đúng cấu trúc 3 tầng: Header (category, icon, nút đóng), Dòng 1 (formula line), Dòng 2 (flow line)', () => {
      const item: FloatingTextItem = {
        id: 'ft-badge-3tier',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'player-1',
        actionType: 'bail',
        title: 'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc',
        timestamp: Date.now(),
      };

      const markup = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      expect(markup).toContain('aria-label="Đóng thông báo"');
      expect(markup).toContain('data-testid="transaction-formula-line"');
      expect(markup).toContain('data-testid="transaction-flow-line"');
      expect(markup).toContain('data-testid="contextual-transaction-badge"');
    });

    it('[TC-216.16/MSS][UC-IMP216] Data Lifecycle Invariant: Gọi state.addFloatingText({ formula, bailKind }) thì formula và bailKind được lưu trữ toàn vẹn trong Zustand game_store, không bị nuốt chửng', () => {
      useGameStore.setState({ floatingTexts: [] });

      useGameStore.getState().addFloatingText({
        text: '-500 Tr.',
        playerId: 'player-1',
        actionType: 'bail',
        bailKind: 'forced',
        formula: 'Bảo lãnh sớm: 10% tài sản ròng (Sàn 500 Tr.)',
      });

      const storedItem = useGameStore.getState().floatingTexts[0];
      expect(storedItem).toBeDefined();
      expect(storedItem?.formula).toBe('Bảo lãnh sớm: 10% tài sản ròng (Sàn 500 Tr.)');
      expect(storedItem?.bailKind).toBe('forced');
    });
  });
});
