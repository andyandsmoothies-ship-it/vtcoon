// [TC-MCH01/MSS][UI-S02/MSS][UC-MCH-01][UC-MCH-02][UC-MCH-03] Contract Test Suite: Mobile Compact HUD & Tactile Retropoly Modals
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): Mobile responsive hidden classes (hidden sm:flex), touch targets (min-h-[38px], min-h-[40px], min-h-[44px]), safe area padding (pb-8 sm:pb-3)
// Facet 2 (State Reactivity): Dynamic cash colors (text-emerald-700 vs text-rose-700), single-row compact cards, solid tactile bank postal borders, 1s quick impact summary (event-impact-summary)
// Facet 3 (Resource Disposal): Zero dangling state, empty property list clean state, omission of inactive delta badges and color dot stripes
// Facet 4 (Error Defense): Core testids persistence (player-ribbon, player-pawn-badge), micro badges (BOT, ⚖️, LƯỢT), disabled redemption buttons on deficit

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { PlayerCard } from '../../src/client/ui/player_card';
import { formatShortPlayerName } from '../../src/client/ui/ui_helpers';
import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal';
import { InsolvencyBanner } from '../../src/client/ui/modals/insolvency_banner';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal';
import { useGameStore, type PlayerHudInfo } from '../../src/client/store/game_store';

describe('[TC-MCH01/MSS][UI-S02/MSS] Mobile Compact HUD & Tactile Retropoly Modals Contract Suite', () => {
  beforeEach(() => {
    useGameStore.getInitialState = useGameStore.getState;
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 30,
      currentTurnPlayerId: 'p1',
      playersInfo: {},
      treasuryPool: 2500,
      isRolling: false,
      hasRolledThisTurn: false,
      activeEmotes: {},
      levelMap: {},
      playerPositions: {},
    });
  });

  // =========================================================================
  // GÓI 1: THẺ NGƯỜI CHƠI SIÊU TINH GỌN TRÊN MOBILE (PlayerCard)
  // =========================================================================

  describe('Gói 1: Thẻ Người Chơi Siêu Tinh Gọn Trên Mobile (PlayerCard)', () => {
    const mockActivePlayer: PlayerHudInfo = {
      id: 'p1',
      name: 'Chủ Tịch Hưng',
      balance: 15000,
      tokenColor: '#ef4444',
      ownedProperties: [1, 3],
      mortgagedProperties: [],
      mortgageLoans: {},
      isBot: false,
      bankrupt: false,
      inAudit: false,
    };

    it('[TC-MCH01.01/MSS][UC-MCH-01] PlayerCard hides net worth block on small mobile screens with hidden sm:flex or hidden sm:block (Chốt 1.1)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockActivePlayer,
          isCurrentTurn: true,
          levelMap: { 1: 1, 3: 0 },
          slotIndex: 0,
        })
      );
      // Khối Tài sản ròng phải được ẩn trên mobile (chứa hidden sm:flex hoặc hidden sm:block)
      const hasResponsiveHidden =
        html.includes('hidden sm:flex') || html.includes('hidden sm:block');
      expect(hasResponsiveHidden).toBe(true);
    });

    it('[TC-MCH01.02/MSS][UC-MCH-01] PlayerCard renders positive cash directly in bold emerald green text-emerald-700 font-black (Chốt 1.2)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockActivePlayer,
          isCurrentTurn: false,
          levelMap: {},
          slotIndex: 0,
        })
      );
      expect(html).toContain('text-emerald-700');
      expect(html).toContain('font-black');
      expect(html).toContain('15.000');
    });

    it('[TC-MCH01.03/MSS][UC-MCH-01] PlayerCard renders overdraft negative cash in bold rose red text-rose-700 font-black (Chốt 1.2)', () => {
      const overdraftPlayer: PlayerHudInfo = {
        ...mockActivePlayer,
        balance: -2500,
        overdraftRoundsLeft: 2,
      };
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: overdraftPlayer,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
        })
      );
      expect(html).toContain('text-rose-700');
      expect(html).toContain('font-black');
      expect(html).toContain('-2.500');
    });

    it('[TC-MCH01.04/MSS][UC-MCH-01] PlayerCard renders compact property group color dots stripe with border and padding (Chốt 1.3)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockActivePlayer,
          isCurrentTurn: false,
          levelMap: {},
          slotIndex: 0,
        })
      );
      expect(html).toContain('BĐS:');
      expect(html).toContain('rounded-full');
      expect(html).toContain('border-t border-slate-300');
    });

    it('[TC-MCH01.05/MSS][UC-MCH-01] PlayerCard preserves core testids data-testid="player-ribbon" and player-pawn-badge (Chốt 1.4)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockActivePlayer,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
        })
      );
      expect(html).toContain('data-testid="player-ribbon"');
      expect(html).toContain('data-testid="player-pawn-badge-p1"');
    });

    it('[TC-MCH01.06/MSS][UC-MCH-01] PlayerCard renders micro badge BOT when player is artificial intelligence bot (Chốt 1.4)', () => {
      const botPlayer: PlayerHudInfo = {
        ...mockActivePlayer,
        id: 'bot_1',
        name: 'CEO Lan',
        isBot: true,
      };
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: botPlayer,
          isCurrentTurn: false,
          levelMap: {},
          slotIndex: 1,
        })
      );
      expect(html).toContain('BOT');
      expect(html).toContain('bg-cyan-100 text-cyan-900');
    });

    it('[TC-MCH01.07/MSS][UC-MCH-01] PlayerCard renders micro badge ⚖️ when player is detained in audit station (Chốt 1.4)', () => {
      const auditPlayer: PlayerHudInfo = {
        ...mockActivePlayer,
        inAudit: true,
      };
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: auditPlayer,
          isCurrentTurn: false,
          levelMap: {},
          slotIndex: 0,
        })
      );
      expect(html).toContain('⚖️');
      expect(html).toContain('aria-label="Kiểm Toán"');
    });

    it('[TC-MCH01.08/MSS][UC-MCH-01] PlayerCard renders animated micro badge LƯỢT when isCurrentTurn is active (Chốt 1.4)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockActivePlayer,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
        })
      );
      expect(html).toContain('LƯỢT');
      expect(html).toContain('animate-pulse');
    });

    it('[TC-MCH01.08A/MSS][UC-MCH-01] formatShortPlayerName strips bot personality suffixes while preserving human names', () => {
      expect(formatShortPlayerName('Bot AI 2 (Balanced)')).toBe('Bot AI 2');
      expect(formatShortPlayerName('Bot AI 3 (Aggressive)')).toBe('Bot AI 3');
      expect(formatShortPlayerName('Bot AI 4 (Cautious)')).toBe('Bot AI 4');
      expect(formatShortPlayerName('Bot AI 1 (Passive)')).toBe('Bot AI 1');
      expect(formatShortPlayerName('Dapper Panda')).toBe('Dapper Panda');
      expect(formatShortPlayerName('Chủ Tịch Hưng')).toBe('Chủ Tịch Hưng');
      expect(formatShortPlayerName('')).toBe('');
    });

    it('[TC-MCH01.08B/MSS][UC-MCH-01] PlayerCard displays short display name and sets title attribute for full name accessibility', () => {
      const botPlayer: PlayerHudInfo = {
        ...mockActivePlayer,
        id: 'bot_2',
        name: 'Bot AI 2 (Balanced)',
        isBot: true,
      };
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: botPlayer,
          isCurrentTurn: false,
          levelMap: {},
          slotIndex: 1,
        })
      );
      // Display text contains cleaned name
      expect(html).toContain('Bot AI 2');
      // Full name is preserved in title attribute for accessibility
      expect(html).toContain('title="Bot AI 2 (Balanced)"');
    });

    it('[TC-MCH01.08C/MSS][UC-MCH-01] PlayerCard uses compact responsive font and top turn pill clearance', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockActivePlayer,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
        })
      );
      expect(html).toContain('text-xs sm:text-sm font-bold');
      expect(html).toContain('absolute top-1.5 right-2');
    });
  });

  // =========================================================================
  // GÓI 2: TÁI CẤU TRÚC DANH MỤC BẤT ĐỘNG SẢN COMPACT & SAFE AREA
  // =========================================================================

  describe('Gói 2: Tái Cấu Trúc Danh Mục Bất Động Sản Compact & Safe Area (PropertyPortfolioModal)', () => {
    it('[TC-MCH01.09/MSS][UC-MCH-02] PropertyPortfolioModal footer incorporates safe area bottom clearance pb-8 sm:pb-3 (Chốt 2.1)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1, 6],
          propertyStates: {
            1: { ownerId: 'p1', level: 1, isMortgaged: false },
            6: { ownerId: 'p1', level: 0, isMortgaged: false },
          },
          currentBalance: 3000,
          onClose: () => {},
        })
      );
      const footerMatch = html.match(/<footer[^>]*class="([^"]*)"[^>]*>/)?.[1] ?? '';
      const hasSafeAreaPadding =
        footerMatch.includes('pb-8 sm:pb-3') ||
        footerMatch.includes('safe-area-bottom') ||
        footerMatch.includes('pb-8');
      expect(hasSafeAreaPadding).toBe(true);
    });

    it('[TC-MCH01.10/MSS][UC-MCH-02] PropertyPortfolioModal renders property rows with data-testid="property-portfolio-item-${cellIndex}" (Chốt 2.3)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1, 6],
          propertyStates: {
            1: { ownerId: 'p1', level: 1, isMortgaged: false },
            6: { ownerId: 'p1', level: 0, isMortgaged: true },
          },
          currentBalance: 1200,
        })
      );
      expect(html).toContain('data-testid="property-portfolio-item-1"');
      expect(html).toContain('data-testid="property-portfolio-item-6"');
    });

    it('[TC-MCH01.11/MSS][UC-MCH-02] PropertyPortfolioModal property item provides single-row compact layout elements (Chốt 2.2)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          propertyStates: {
            1: { ownerId: 'p1', level: 1, isMortgaged: false },
          },
          currentBalance: 5000,
        })
      );
      // Phải chứa chấm màu, tên BĐS và cấp công trình
      expect(html).toContain('Cần Thơ');
      expect(html).toContain('Nhà Phố C1');
      expect(html).toContain('Thế Chấp');
    });

    it('[TC-MCH01.12/MSS][UC-MCH-02] PropertyPortfolioModal Mortgage button satisfies minimum touch height min-h-[38px] or min-h-[40px] (Chốt 2.4)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          propertyStates: {
            1: { ownerId: 'p1', level: 0, isMortgaged: false },
          },
          currentBalance: 2000,
          onMortgage: () => {},
        })
      );
      const mortgageBtnMatch = html.match(/<button[^>]*>Thế Chấp[^<]*<\/button>/)?.[0] ?? '';
      const hasSufficientHeight =
        mortgageBtnMatch.includes('min-h-[40px]') ||
        mortgageBtnMatch.includes('min-h-[38px]');
      expect(hasSufficientHeight).toBe(true);
    });

    it('[TC-MCH01.13/MSS][UC-MCH-02] PropertyPortfolioModal Redeem button satisfies minimum touch height min-h-[38px] or min-h-[40px] (Chốt 2.4)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [6],
          propertyStates: {
            6: { ownerId: 'p1', level: 0, isMortgaged: true },
          },
          currentBalance: 5000,
          onRedeem: () => {},
        })
      );
      const redeemBtnMatch = html.match(/<button[^>]*>Giải Chấp[^<]*<\/button>/)?.[0] ?? '';
      const hasSufficientHeight =
        redeemBtnMatch.includes('min-h-[40px]') ||
        redeemBtnMatch.includes('min-h-[38px]');
      expect(hasSufficientHeight).toBe(true);
    });

    it('[TC-MCH01.14/MSS][UC-MCH-02] PropertyPortfolioModal disables Redeem button with disabled attribute when balance is insufficient (Facet 4)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [6],
          propertyStates: {
            6: { ownerId: 'p1', level: 0, isMortgaged: true },
          },
          currentBalance: 100, // Giá chuộc là ~550 Tr., số dư 100 Tr. không đủ
          onRedeem: () => {},
        })
      );
      const redeemBtnMatch = html.match(/<button[^>]*>Giải Chấp[^<]*<\/button>/)?.[0] ?? '';
      expect(redeemBtnMatch).toContain('disabled');
      expect(redeemBtnMatch).toContain('disabled:opacity-50');
    });

    it('[TC-MCH01.15/MSS][UC-MCH-02] PropertyPortfolioModal cleanly displays empty state when player owns zero properties (Facet 3)', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [],
          propertyStates: {},
          currentBalance: 1500,
        })
      );
      expect(html).toContain('Chưa sở hữu bất động sản nào');
      expect(html).not.toContain('Thế Chấp');
      expect(html).not.toContain('Giải Chấp');
    });
  });

  // =========================================================================
  // GÓI 3: THẺ BÀI RETROPOLY XÚC GIÁC & TỔNG QUAN HIỆU ỨNG 1 GIÂY
  // =========================================================================

  describe('Gói 3: Thẻ Bài Retropoly Xúc Giác & Tổng Quan Hiệu Ứng 1 Giây (InsolvencyBanner & EventCardModal)', () => {
    it('[TC-MCH01.16/MSS][UC-MCH-03] InsolvencyBanner completely eliminates coarse dashed border and does not contain border-dashed (Chốt 3.1)', () => {
      const html = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, {
          playerId: 'p1',
          playerName: 'Chủ Tịch Hưng',
          deficit: 4500,
        })
      );
      expect(html).not.toContain('border-dashed');
    });

    it('[TC-MCH01.17/MSS][UC-MCH-03] InsolvencyBanner uses solid tactile bank postal border border-2 or border-4 with border-red-500 or border-red-600 (Chốt 3.1)', () => {
      const html = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, {
          playerId: 'p1',
          playerName: 'Chủ Tịch Hưng',
          deficit: 4500,
        })
      );
      const hasSolidRedBorder =
        (html.includes('border-2') || html.includes('border-4')) &&
        (html.includes('border-red-500') || html.includes('border-red-600'));
      expect(hasSolidRedBorder).toBe(true);
    });

    it('[TC-MCH01.18/MSS][UC-MCH-03] InsolvencyBanner magnifies deficit number to headline size text-2xl or text-3xl instead of text-lg (Chốt 3.1)', () => {
      const html = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, {
          playerId: 'p1',
          playerName: 'Chủ Tịch Hưng',
          deficit: 4500,
        })
      );
      const hasLargeDeficitText =
        html.includes('text-2xl') || html.includes('text-3xl');
      expect(hasLargeDeficitText).toBe(true);
      expect(html).not.toContain('text-lg font-black text-rose-700');
    });

    it('[TC-MCH01.19/MSS][UC-MCH-03] InsolvencyBanner Property Management button satisfies min-h-[44px] and tactile shadow (Chốt 3.1)', () => {
      const html = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, {
          playerId: 'p1',
          playerName: 'Chủ Tịch Hưng',
          deficit: 4500,
          onManageProperties: () => {},
        })
      );
      const btnMatch = html.match(/<button[^>]*>Quản Lý BĐS \/ Thế Chấp<\/button>/)?.[0] ?? '';
      expect(btnMatch).toContain('min-h-[44px]');
      expect(btnMatch).toContain('shadow-[0_4px_0_0_#b45309]');
    });

    it('[TC-MCH01.20/MSS][UC-MCH-03] InsolvencyBanner Declare Bankruptcy button satisfies min-h-[44px] and tactile shadow (Chốt 3.1)', () => {
      const html = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, {
          playerId: 'p1',
          playerName: 'Chủ Tịch Hưng',
          deficit: 4500,
          onDeclareBankruptcy: () => {},
        })
      );
      const btnMatch = html.match(/<button[^>]*>Tuyên Bố Phá Sản[^<]*<\/button>/)?.[0] ?? '';
      expect(btnMatch).toContain('min-h-[44px]');
      expect(btnMatch).toContain('shadow-[0_4px_0_0_#fda4af]');
    });

    it('[TC-MCH01.21/MSS][UC-MCH-03] EventCardModal marks dense SSOT specs table with data-testid="event-specs-table" and hidden sm:flex (Chốt 3.2)', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: 'MC_RATE_HIKE',
          description: 'Ngân hàng Trung Ương tăng lãi suất điều hành thêm 5%.',
        })
      );
      expect(html).toContain('data-testid="event-specs-table"');
      const tableMatch = html.match(/<div[^>]*data-testid="event-specs-table"[^>]*>/)?.[0] ?? '';
      expect(tableMatch).toContain('hidden sm:flex');
    });

    it('[TC-MCH01.22/MSS][UC-MCH-03] EventCardModal renders 1-second quick impact summary on mobile with data-testid="event-impact-summary" (Chốt 3.2)', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: 'MC_RATE_HIKE',
          description: 'Ngân hàng Trung Ương tăng lãi suất điều hành thêm 5%.',
        })
      );
      expect(html).toContain('data-testid="event-impact-summary"');
      const summaryMatch = html.match(/<div[^>]*data-testid="event-impact-summary"[^>]*>/)?.[0] ?? '';
      const isVisibleOnMobileOnly =
        summaryMatch.includes('sm:hidden') || summaryMatch.includes('block sm:hidden');
      expect(isVisibleOnMobileOnly).toBe(true);
    });

    it('[TC-MCH01.23/MSS][UC-MCH-03] EventCardModal 1-second quick impact summary displays concise scope and duration badges (Chốt 3.2)', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: 'MC_RATE_HIKE',
          description: 'Ngân hàng Trung Ương tăng lãi suất điều hành thêm 5%.',
        })
      );
      // Bóc tách phần HTML bên trong event-impact-summary
      const summarySection = html.slice(html.indexOf('data-testid="event-impact-summary"'));
      expect(summarySection).toContain('Toàn bộ thị trường');
      expect(summarySection).toContain('1 vòng chơi');
    });

    it('[TC-MCH01.24/MSS][UC-MCH-03] EventCardModal cleanly omits cash delta badge when effectDelta is undefined (Facet 3)', () => {
      const html = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'chance',
          cardId: 'CC_TAX_AUDIT',
          description: 'Kiểm toán đột xuất toàn diện tài sản.',
          effectDelta: undefined,
        })
      );
      expect(html).not.toContain('Thu Nhập:');
      expect(html).not.toContain('Khoản Chi:');
    });
  });
});
