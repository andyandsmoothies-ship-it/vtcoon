// [TC-IMP75/MSS] Contract Test Suite for IMP-75: Property Portfolio, Title Deed Carousel, Trade UX & Telemetry
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import { TradeModal } from '../../src/client/ui/modals/trade_modal';
import { TurnPhase } from '../../src/domain/room';
import { verifyAllInvariants } from '../../src/client/telemetry/invariant_checker';
import { checkIsTeleport } from '../../src/client/telemetry/telemetry_delta_hook';

describe('[IMP-75: Trạm 1 RED] Property Portfolio, Title Deed Carousel, Trade UX & Telemetry Contracts', () => {

  // =========================================================================
  // Phân đoạn 1: PropertyPortfolioModal (Danh Mục Bất Động Sản)
  // =========================================================================
  describe('1. PropertyPortfolioModal Contract', () => {
    it('[TC-IMP75.01/MSS] Render danh mục BĐS đầy đủ danh sách ô sở hữu kèm tên và ruy-băng', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1, 6],
          propertyStates: {
            1: { ownerId: 'p1', level: 1, isMortgaged: false },
            6: { ownerId: 'p1', level: 0, isMortgaged: false },
          },
          currentBalance: 1500,
        })
      );
      expect(html).toContain('Cần Thơ');
      expect(html).toContain('Bình Dương');
      expect(html).toContain('DANH MỤC BẤT ĐỘNG SẢN');
    });

    it('[TC-IMP75.02/MSS] Hiển thị huy hiệu Đang thế chấp khi ô đất có isMortgaged = true', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [6],
          propertyStates: {
            6: { ownerId: 'p1', level: 0, isMortgaged: true },
          },
          currentBalance: 500,
        })
      );
      expect(html).toContain('Đã thế chấp');
      expect(html).toContain('Giải Chấp');
    });

    it('[TC-IMP75.03/MSS] Hiển thị đúng cấp công trình C0, C1, C2, C3 trên từng thẻ', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1, 3],
          propertyStates: {
            1: { ownerId: 'p1', level: 2, isMortgaged: false },
            3: { ownerId: 'p1', level: 0, isMortgaged: false },
          },
          currentBalance: 2000,
        })
      );
      expect(html).toContain('Khách Sạn');
      expect(html).toContain('Đất Nền');
    });

    it('[TC-IMP75.04/MSS] Nút thế chấp hiển thị đúng giá trị thế chấp niêm yết thu về', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [6], // Bình Dương giá 1000, thế chấp 500
          propertyStates: {
            6: { ownerId: 'p1', level: 0, isMortgaged: false },
          },
          currentBalance: 1000,
        })
      );
      expect(html).toContain('Thế Chấp (+500)');
    });

    it('[TC-IMP75.05/MSS] Hiển thị banner tiến trình cứu nợ khi có thâm hụt tài chính', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [6, 1],
          propertyStates: {
            6: { ownerId: 'p1', level: 0, isMortgaged: false },
            1: { ownerId: 'p1', level: 0, isMortgaged: false },
          },
          currentBalance: -3022,
          isInInsolvency: true,
        })
      );
      expect(html).toContain('Cần Giải Tỏa Thâm Hụt');
      expect(html).toContain('-3.022');
    });

    it('[TC-IMP75.06/MSS] Hiển thị trạng thái không có BĐS khi mảng ownedProperties rỗng', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [],
          currentBalance: 1000,
        })
      );
      expect(html).toContain('Chưa sở hữu bất động sản nào');
    });
  });

  // =========================================================================
  // Phân đoạn 2: TitleDeedModal Carousel Navigation
  // =========================================================================
  describe('2. TitleDeedModal Carousel Navigation Contract', () => {
    it('[TC-IMP75.07/MSS] Hiển thị thanh lật trang Carousel khi người chơi sở hữu nhiều BĐS', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedModal, {
          cellIndex: 6,
          isOwner: true,
          ownedProperties: [1, 6, 13],
        })
      );
      expect(html).toContain('title-deed-carousel');
      expect(html).toContain('2 / 3');
    });

    it('[TC-IMP75.08/MSS] Ẩn thanh lật trang Carousel khi chỉ sở hữu 1 BĐS hoặc không sở hữu', () => {
      const htmlSingle = renderToStaticMarkup(
        React.createElement(TitleDeedModal, {
          cellIndex: 6,
          isOwner: true,
          ownedProperties: [6],
        })
      );
      expect(htmlSingle).not.toContain('title-deed-carousel');

      const htmlNotOwner = renderToStaticMarkup(
        React.createElement(TitleDeedModal, {
          cellIndex: 6,
          isOwner: false,
          ownedProperties: [1, 13],
        })
      );
      expect(htmlNotOwner).not.toContain('title-deed-carousel');
    });

    it('[TC-IMP75.09/MSS] Carousel chứa nút chuyển trước và nút chuyển sau có nhãn rõ ràng', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedModal, {
          cellIndex: 1,
          isOwner: true,
          ownedProperties: [1, 6, 13],
        })
      );
      expect(html).toContain('aria-label="Sổ đỏ trước"');
      expect(html).toContain('aria-label="Sổ đỏ tiếp theo"');
    });
  });

  // =========================================================================
  // Phân đoạn 3: TradeModal Multi-Partner & Transparent P2P
  // =========================================================================
  describe('3. TradeModal Multi-Partner & Transparent P2P Contract', () => {
    const mockAvailablePartners = [
      { id: 'bot_3', name: 'Bot AI 3 (Aggressive)', balance: 4246, isBot: true },
      { id: 'bot_4', name: 'Bot AI 4 (Balanced)', balance: 1163, isBot: true },
    ];

    it('[TC-IMP75.10/MSS] Render danh sách tabs chọn đối tác với đầy đủ các đối thủ trong phòng', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_3',
          myProperties: [6],
          targetProperties: [27],
          myBalance: 2000,
          availablePartners: mockAvailablePartners,
        })
      );
      expect(html).toContain('Bot AI 3 (Aggressive)');
      expect(html).toContain('Bot AI 4 (Balanced)');
      expect(html).toContain('partner-selector-tab');
    });

    it('[TC-IMP75.11/MSS] Hiển thị chính xác số dư tiền mặt thực tế của đối tác được chọn', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_3',
          myProperties: [6],
          targetProperties: [27],
          myBalance: 2000,
          availablePartners: mockAvailablePartners,
          targetBalance: 4246,
        })
      );
      expect(html).toContain('4.246');
      expect(html).toContain('Tiền mặt đối tác');
    });

    it('[TC-IMP75.12/MSS] Hiển thị các nút gợi ý giá nhanh 70% Sàn, 100% Gốc, 120% Thị trường', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_3',
          myProperties: [6], // Bình Dương giá 1000
          targetProperties: [],
          myBalance: 2000,
          availablePartners: mockAvailablePartners,
          initialOffered: [6],
        })
      );
      expect(html).toContain('70% Sàn');
      expect(html).toContain('100% Gốc');
      expect(html).toContain('120%');
    });

    it('[TC-IMP75.13/MSS] Vô hiệu hóa và cảnh báo khi giá yêu cầu vượt quá tiền mặt đối tác', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_4',
          myProperties: [6],
          targetProperties: [],
          myBalance: 2000,
          availablePartners: mockAvailablePartners,
          targetBalance: 1163,
          initialOffered: [6],
          initialCashRequest: 2000, // Vượt quá 1163
        })
      );
      expect(html).toContain('Đối tác không đủ tiền mặt');
      expect(html).toContain('disabled');
    });

    it('[TC-IMP75.14/MSS] Hiển thị bảng tóm tắt thuế kho bạc 5% và số tiền thực nhận', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_3',
          myProperties: [6],
          targetProperties: [],
          myBalance: 2000,
          availablePartners: mockAvailablePartners,
          targetBalance: 4246,
          initialOffered: [6],
          initialCashRequest: 1000,
        })
      );
      expect(html).toContain('Thuế nộp Kho Bạc (5%)');
      expect(html).toContain('Thực nhận');
      expect(html).toContain('950');
    });

    it('[TC-IMP75.15/MSS] Giao diện không sử dụng các khối màu xanh đen tối và đỏ bầm', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot_3',
          myProperties: [6],
          targetProperties: [27],
          myBalance: 2000,
          availablePartners: mockAvailablePartners,
        })
      );
      expect(html).not.toContain('bg-slate-900 border-2 border-blue-500');
      expect(html).not.toContain('bg-red-900 border-2 border-rose-500');
    });
  });

  // =========================================================================
  // Phân đoạn 4: Telemetry Invariant & Teleport Detection
  // =========================================================================
  describe('4. Telemetry Invariant & Teleport Detection Contract', () => {
    it('[TC-IMP75.16/MSS] verifyAllInvariants không báo NEGATIVE_BALANCE khi isInInsolvency là true', () => {
      const violations = verifyAllInvariants({
        players: [{ id: 'p1', balance: -3022 }],
        isInInsolvency: true,
        tick: 235,
      });
      const balanceViol = violations.find((v) => v.type === 'NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY');
      expect(balanceViol).toBeUndefined();
    });

    it('[TC-IMP75.17/MSS] checkIsTeleport nhận diện di chuyển tới Trạm Kiểm Toán (ô 10) là hợp lệ', () => {
      // Nhảy từ ô 25 sang ô 10 do dẫm vào ô 30 chuyển thẳng về 10
      const isTeleportJail = checkIsTeleport(25, 10, true, TurnPhase.PropertyManagement);
      expect(isTeleportJail).toBe(true);
    });

    it('[TC-IMP75.18/MSS] checkIsTeleport nhận diện di chuyển từ ô sự kiện Khí Vận/Cơ Hội là hợp lệ', () => {
      // Ô 17 là ô Khí Vận dịch chuyển sang ô 27
      const isTeleportChance = checkIsTeleport(17, 27, true, TurnPhase.ActionPhase);
      expect(isTeleportChance).toBe(true);
    });
  });

});
