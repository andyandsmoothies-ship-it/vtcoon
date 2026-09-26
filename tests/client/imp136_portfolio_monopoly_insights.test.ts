// [IMP-136] Strategic Property Portfolio & Monopoly Insights Contract Suite
// Traceability: [UC-IMP136], [TC-IMP136.01..TC-IMP136.20], Gotcha #179
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal.js';
import {
  analyzePropertyMonopolyInsight,
  type MonopolyGroupInsight,
} from '../../src/client/ui/modals/portfolio_monopoly_analytics.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { TurnPhase } from '../../src/domain/room.js';

describe('[IMP-136] Strategic Property Portfolio & Monopoly Insights Contract Suite', () => {
  const mockPlayers = {
    p1: {
      id: 'p1',
      name: 'Hoàng Nam',
      balance: 10000,
      tokenColor: '#3B82F6',
      ownedProperties: [32, 34, 1], // Hà Nội (Cầu Giấy #32, Hoàn Kiếm #34), Cần Thơ (#1)
    },
    bot1: {
      id: 'bot1',
      name: 'Bot 1 (Aggressive)',
      balance: 8500,
      tokenColor: '#EF4444',
      isBot: true,
      ownedProperties: [31], // Hưng Yên #31 (Mảnh ghép còn thiếu của nhóm Xanh Lá)
    },
  };

  beforeEach(() => {
    useGameStore.setState({
      playersInfo: mockPlayers,
      currentTurnPlayerId: 'p1',
      turnPhase: TurnPhase.PropertyManagement,
      levelMap: {},
    });
  });

  // =========================================================================
  // FACET 1: Monopoly Analytics & Missing Piece Resolution
  // =========================================================================
  describe('FACET 1: Monopoly Analytics & Missing Piece Resolution', () => {
    it('[TC-IMP136.01] Phân tích nhóm Xanh Lá (#32, #34): nhận diện thiếu Hưng Yên #31 do bot1 sở hữu', () => {
      const insight = analyzePropertyMonopolyInsight({
        cellIndex: 32,
        ownedProperties: [32, 34],
        allPlayers: mockPlayers,
      });

      expect(insight.totalCells).toBe(3);
      expect(insight.ownedCount).toBe(2);
      expect(insight.isMonopoly).toBe(false);
      expect(insight.isNearMonopoly).toBe(true);
      expect(insight.missingPieces.length).toBe(1);

      const missing = insight.missingPieces[0]!;
      expect(missing.cellIndex).toBe(31);
      expect(missing.name).toContain('Hưng Yên');
      expect(missing.ownerId).toBe('bot1');
      expect(missing.ownerName).toBe('Bot 1 (Aggressive)');
      expect(missing.isVacant).toBe(false);
    });

    it('[TC-IMP136.02] Phân tích nhóm Cần Thơ (#1): nhận diện thiếu An Giang #3 là đất trống sàn F1', () => {
      const insight = analyzePropertyMonopolyInsight({
        cellIndex: 1,
        ownedProperties: [1],
        allPlayers: mockPlayers,
      });

      expect(insight.totalCells).toBe(2);
      expect(insight.ownedCount).toBe(1);
      expect(insight.isMonopoly).toBe(false);
      expect(insight.isNearMonopoly).toBe(true); // 1/2 đạt 50%
      expect(insight.missingPieces.length).toBe(1);

      const missing = insight.missingPieces[0]!;
      expect(missing.cellIndex).toBe(3);
      expect(missing.name).toContain('An Giang');
      expect(missing.ownerId).toBeNull();
      expect(missing.isVacant).toBe(true);
      expect(missing.price).toBe(600);
    });

    it('[TC-IMP136.03] Phân tích nhóm đã hoàn thành đủ bộ màu (Monopoly 100%): missingPieces rỗng', () => {
      const insight = analyzePropertyMonopolyInsight({
        cellIndex: 1,
        ownedProperties: [1, 3],
        allPlayers: mockPlayers,
      });

      expect(insight.isMonopoly).toBe(true);
      expect(insight.ownedCount).toBe(2);
      expect(insight.missingPieces.length).toBe(0);
    });

    it('[TC-IMP136.04] Phân tích nhóm chỉ có 1/3 ô: isNearMonopoly là false', () => {
      const insight = analyzePropertyMonopolyInsight({
        cellIndex: 11, // Bình Thuận [1/3]
        ownedProperties: [11],
        allPlayers: mockPlayers,
      });

      expect(insight.totalCells).toBe(3);
      expect(insight.ownedCount).toBe(1);
      expect(insight.isNearMonopoly).toBe(false);
      expect(insight.missingPieces.length).toBe(2);
    });
  });

  // =========================================================================
  // FACET 2: Portfolio UI Missing Piece Section & 1-Click Trade Bridge
  // =========================================================================
  describe('FACET 2: Portfolio UI Missing Piece Section & 1-Click Trade Bridge', () => {
    it('[TC-IMP136.05] Render khối mảnh ghép còn thiếu với nút [Đàm Phán] khi đối thủ sở hữu ô', () => {
      const markup = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [32, 34],
          propertyStates: {
            32: { level: 0, isMortgaged: false },
            34: { level: 0, isMortgaged: false },
          },
          currentBalance: 10000,
          isMyTurn: false,
          allPlayers: mockPlayers,
        })
      );

      expect(markup).toContain('data-testid="property-missing-pieces"');
      expect(markup).toContain('Hưng Yên');
      expect(markup).toContain('Bot 1 (Aggressive)');
      expect(markup).toContain('data-testid="quick-trade-btn-31"');
      expect(markup).toContain('Đàm Phán');
    });

    it('[TC-IMP136.06] Render ô còn thiếu là Đất Trống với nút [Xem Ô]', () => {
      const markup = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          propertyStates: {
            1: { level: 0, isMortgaged: false },
          },
          currentBalance: 5000,
          isMyTurn: false,
          allPlayers: mockPlayers,
        })
      );

      expect(markup).toContain('An Giang');
      expect(markup).toContain('Đất trống');
      expect(markup).toContain('data-testid="view-vacant-cell-btn-3"');
    });

    it('[TC-IMP136.07] Render huy hiệu Độc Quyền Trọn Bộ khi người chơi sở hữu trọn nhóm màu', () => {
      const markup = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1, 3],
          propertyStates: {
            1: { level: 0, isMortgaged: false },
            3: { level: 0, isMortgaged: false },
          },
          currentBalance: 5000,
          isMyTurn: false,
          allPlayers: mockPlayers,
        })
      );

      expect(markup).toContain('Độc Quyền Trọn Bộ');
      expect(markup).not.toContain('data-testid="property-missing-pieces"');
    });
  });

  // =========================================================================
  // FACET 3: Build Button Clarity Invariants (Zero Misleading "Chờ đến lượt")
  // =========================================================================
  describe('FACET 3: Build Button Clarity Invariants', () => {
    it('[TC-IMP136.08] Khi chưa đủ bộ màu: nút xây KHÔNG hiển thị "Chờ đến lượt xây dựng"', () => {
      const markup = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [32, 34], // 2/3 Hà Nội, chưa đủ bộ
          propertyStates: {
            32: { level: 0, isMortgaged: false },
            34: { level: 0, isMortgaged: false },
          },
          currentBalance: 5000,
          isMyTurn: false,
          turnPhase: 'PropertyManagement',
          allPlayers: mockPlayers,
        })
      );

      // Tuyệt đối không để chuỗi gây ngộ nhận "Chờ đến lượt xây dựng" khi chưa đủ bộ màu
      const item32Match = markup.match(/data-testid="property-portfolio-item-32"[\s\S]*?(?=data-testid="property-portfolio-item-34"|$)/);
      const cardHtml = item32Match ? item32Match[0] : markup;
      expect(cardHtml).not.toContain('Chờ đến lượt xây dựng');
      expect(cardHtml).toMatch(/Cần sở hữu trọn bộ màu|Cần đủ bộ 3\/3/i);
    });

    it('[TC-IMP136.09] Khi đã đủ bộ màu nhưng chưa đến lượt: bảo toàn contract TC-IMP133.18 chứa "Chờ đến lượt xây dựng"', () => {
      const markup = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1, 3], // Đã đủ bộ Nâu
          propertyStates: {
            1: { level: 0, isMortgaged: false },
            3: { level: 0, isMortgaged: false },
          },
          currentBalance: 5000,
          isMyTurn: false,
          turnPhase: 'PropertyManagement',
          allPlayers: mockPlayers,
        })
      );

      expect(markup).toContain('data-testid="property-quick-build-btn"');
      expect(markup).toContain('Chờ đến lượt xây dựng');
    });

    it('[TC-IMP136.10] Khi đã đủ bộ màu và đúng lượt: nút xây sáng rực màu amber và kích hoạt được', () => {
      const markup = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1, 3],
          propertyStates: {
            1: { level: 0, isMortgaged: false },
            3: { level: 0, isMortgaged: false },
          },
          currentBalance: 5000,
          isMyTurn: true,
          turnPhase: 'PropertyManagement',
          allPlayers: mockPlayers,
        })
      );

      expect(markup).toContain('bg-amber-400');
      expect(markup).toContain('🏗️ Xây C1');
      expect(markup).not.toContain('disabled');
    });
  });

  // =========================================================================
  // FACET 4: Responsive Filter Bar & "Sắp Đủ Bộ 🔥" Tab
  // =========================================================================
  describe('FACET 4: Responsive Filter Bar & "Sắp Đủ Bộ 🔥" Tab', () => {
    it('[TC-IMP136.11] Filter bar hiển thị tab "Sắp Đủ Bộ 🔥" bên cạnh 3 tab cũ', () => {
      const markup = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [32, 34, 11],
          propertyStates: {
            32: { level: 0, isMortgaged: false },
            34: { level: 0, isMortgaged: false },
            11: { level: 0, isMortgaged: false },
          },
          currentBalance: 5000,
          allPlayers: mockPlayers,
        })
      );

      expect(markup).toContain('Tất Cả');
      expect(markup).toContain('Sắp Đủ Bộ 🔥');
      expect(markup).toContain('Có Thể Xây');
      expect(markup).toContain('Đang Thế Chấp');
    });

    it('[TC-IMP136.12] Filter bar có lớp overflow-x-auto và whitespace-nowrap chống tràn mobile', () => {
      const markup = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          propertyStates: { 1: { level: 0, isMortgaged: false } },
          currentBalance: 5000,
          allPlayers: mockPlayers,
        })
      );

      expect(markup).toContain('overflow-x-auto');
      expect(markup).toContain('whitespace-nowrap');
    });
  });
});
