// [TC-198.01/MSS..TC-198.17/MSS][UC-IMP198] Desktop ActionDock Text Drop, Layout Synchronization & Collision Defense Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Boundary & Container Layout (HudContainer sm:max-w-none, sm:min-w-0, TelemetryBadge shrink-0, BotTradeStrip sm:max-w-md)
// Facet 2: Single-Line Text & Anti-Wrap Invariant (ActionDock whitespace-nowrap & shrink-0 on ManageProperty, Trade, Masterplan, EndTurn)
// Facet 3: Height Adaptability & Uniform Touch Target (sm:h-auto on secondary buttons, whitespace-nowrap on RollDice & AuditBailout)
// Facet 4: Mobile 360px Ergonomics & Observable DOM Collision Defense (44px min-touch bounds, notice-chip suppression when bot trade strip active)
// Facet 5: Codebase Craft & LOC Tier Compliance (Zero Impeccable anti-patterns, action_dock.tsx <= 400 LOC budget)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';

import { HudContainer } from '../../src/client/ui/hud_container';
import { ActionDock } from '../../src/client/ui/action_dock';
import { InlineBotTradeStrip } from '../../src/client/ui/modals/bot_trade_offer_strip';
import { useGameStore } from '../../src/client/store/game_store';
import { TurnPhase } from '../../src/domain/room';
import { lintContent } from '../../scripts/lint_ui.mjs';

describe('[TC-198.01/MSS..TC-198.17/MSS][UC-IMP198] Desktop ActionDock Text Drop and Responsive Button Layout', () => {
  beforeEach(() => {
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 25,
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Sài Thành',
          balance: 20000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: false,
        },
      },
      playerPositions: { p1: 0 },
      treasuryPool: 500,
      pendingTradeOffer: null,
      activeModal: null,
      activeModifiers: [],
    });
  });

  // =========================================================================
  // FACET 1: Boundary & Container Layout (HudContainer & BotTradeStrip)
  // =========================================================================
  describe('Facet 1: Boundary & Container Layout', () => {
    it('[TC-198.01/MSS][UC-IMP198] HudContainer: Khung bọc ActionDock ở footer không chứa class sm:max-w-md bóp nghẹt ActionDock', () => {
      const html = renderToStaticMarkup(React.createElement(HudContainer));
      const footerHtml = html.match(/<footer[^>]*>[\s\S]*?<\/footer>/)?.[0] ?? '';
      const dockWrapper = footerHtml.match(/<div[^>]*class="[^"]*flex\s+flex-col[^"]*"[^>]*>/)?.[0] ?? '';

      expect(dockWrapper).not.toContain('sm:max-w-md');
    });

    it('[TC-198.02/MSS][UC-IMP198] HudContainer: Khung bọc ActionDock ở footer khai báo sm:max-w-none và sm:min-w-0 để mở rộng tự nhiên', () => {
      const html = renderToStaticMarkup(React.createElement(HudContainer));
      const footerHtml = html.match(/<footer[^>]*>[\s\S]*?<\/footer>/)?.[0] ?? '';
      const dockWrapper = footerHtml.match(/<div[^>]*class="[^"]*flex\s+flex-col[^"]*"[^>]*>/)?.[0] ?? '';

      expect(dockWrapper).toContain('sm:max-w-none');
      expect(dockWrapper).toContain('sm:min-w-0');
    });

    it('[TC-198.03/MSS][UC-IMP198] HudContainer: Khối bọc TelemetryBadge trong footer khai báo shrink-0 bảo vệ toàn vẹn hiển thị', () => {
      const html = renderToStaticMarkup(React.createElement(HudContainer));
      const footerHtml = html.match(/<footer[^>]*>[\s\S]*?<\/footer>/)?.[0] ?? '';
      const badgeWrapper = footerHtml.match(/<div[^>]*class="[^"]*hidden\s+sm:block[^"]*"[^>]*>/)?.[0] ?? '';

      expect(badgeWrapper).toContain('shrink-0');
    });

    it('[TC-198.04/MSS][UC-IMP198] InlineBotTradeStrip: Container của strip đề xuất trade khai báo class sm:max-w-md độc lập', () => {
      useGameStore.setState({
        pendingTradeOffer: {
          offerId: 'offer_trade_facet1',
          cellIndex: 3,
          price: 2500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(InlineBotTradeStrip, { localPlayerId: 'p1' })
      );
      const stripContainer = html.match(/<div[^>]*data-testid="inline-bot-trade-strip"[^>]*>/)?.[0] ?? '';

      expect(stripContainer).toContain('sm:max-w-md');
    });
  });

  // =========================================================================
  // FACET 2: Single-Line Text & Anti-Wrap Invariant
  // =========================================================================
  describe('Facet 2: Single-Line Text & Anti-Wrap Invariant', () => {
    it('[TC-198.05/MSS][UC-IMP198] ActionDock: Nút Quản Lý BĐS render có whitespace-nowrap và shrink-0 chống bẻ dòng', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { isMyTurn: true }));
      const manageBtn = html.match(/<button[^>]*aria-label="Quản lý và nâng cấp bất động sản"[^>]*>/)?.[0] ?? '';

      expect(manageBtn).toContain('whitespace-nowrap');
      expect(manageBtn).toContain('shrink-0');
    });

    it('[TC-198.06/MSS][UC-IMP198] ActionDock: Nút Đàm Phán render có whitespace-nowrap và shrink-0 chống bẻ dòng', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { isMyTurn: true }));
      const tradeBtn = html.match(/<button[^>]*aria-label="Đàm phán thương lượng"[^>]*>/)?.[0] ?? '';

      expect(tradeBtn).toContain('whitespace-nowrap');
      expect(tradeBtn).toContain('shrink-0');
    });

    it('[TC-198.07/MSS][UC-IMP198] ActionDock: Nút Quy Hoạch render có whitespace-nowrap và shrink-0 chống bẻ dòng', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { isMyTurn: true }));
      const masterplanBtn = html.match(/<button[^>]*data-testid="heatmap-toggle-btn"[^>]*>/)?.[0] ?? '';

      expect(masterplanBtn).toContain('whitespace-nowrap');
      expect(masterplanBtn).toContain('shrink-0');
    });

    it('[TC-198.08/MSS][UC-IMP198] ActionDock: Nút Hết Lượt render có whitespace-nowrap và shrink-0 chống bẻ dòng', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { isMyTurn: true }));
      const endTurnBtn = html.match(/<button[^>]*aria-label="Kết thúc lượt"[^>]*>/)?.[0] ?? '';

      expect(endTurnBtn).toContain('whitespace-nowrap');
      expect(endTurnBtn).toContain('shrink-0');
    });
  });

  // =========================================================================
  // FACET 3: Height Adaptability & Uniform Touch Target
  // =========================================================================
  describe('Facet 3: Height Adaptability & Uniform Touch Target', () => {
    it('[TC-198.09/MSS][UC-IMP198] ActionDock: Nút Quản Lý BĐS render có sm:h-auto mở khóa chiều cao trên desktop', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { isMyTurn: true }));
      const manageBtn = html.match(/<button[^>]*aria-label="Quản lý và nâng cấp bất động sản"[^>]*>/)?.[0] ?? '';

      expect(manageBtn).toContain('sm:h-auto');
    });

    it('[TC-198.10/MSS][UC-IMP198] ActionDock: Nút Đàm Phán và Quy Hoạch render có sm:h-auto mở khóa chiều cao trên desktop', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { isMyTurn: true }));
      const tradeBtn = html.match(/<button[^>]*aria-label="Đàm phán thương lượng"[^>]*>/)?.[0] ?? '';
      const masterplanBtn = html.match(/<button[^>]*data-testid="heatmap-toggle-btn"[^>]*>/)?.[0] ?? '';

      expect(tradeBtn).toContain('sm:h-auto');
      expect(masterplanBtn).toContain('sm:h-auto');
    });

    it('[TC-198.11/MSS][UC-IMP198] ActionDock: Nút Hết Lượt render có sm:h-auto mở khóa chiều cao trên desktop', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { isMyTurn: true }));
      const endTurnBtn = html.match(/<button[^>]*aria-label="Kết thúc lượt"[^>]*>/)?.[0] ?? '';

      expect(endTurnBtn).toContain('sm:h-auto');
    });

    it('[TC-198.12/MSS][UC-IMP198] ActionDock: Nút Đổ Xúc Xắc render có whitespace-nowrap và shrink-0', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActionDock, { isMyTurn: true, hasRolledThisTurn: false })
      );
      const rollBtn = html.match(/<button[^>]*data-testid="roll-dice-btn"[^>]*>/)?.[0] ?? '';

      expect(rollBtn).toContain('shrink-0');
      expect(rollBtn).toContain('whitespace-nowrap');
    });

    it('[TC-198.17/MSS][UC-IMP198] ActionDock: Nút Bảo Lãnh Kiểm Toán khi inAudit = true render có whitespace-nowrap và shrink-0', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.WaitingRoll,
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Sài Thành',
            balance: 5000,
            tokenColor: '#38BDF8',
            ownedProperties: [],
            inAudit: true,
            auditTurnsLeft: 2,
            isBot: false,
            bankrupt: false,
          },
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(ActionDock, { isMyTurn: true, localPlayerId: 'p1' })
      );
      const bailBtn = html.match(/<button[^>]*aria-label="Nộp 500 bảo lãnh kiểm toán để rời trạm ngay"[^>]*>/)?.[0] ?? '';

      expect(bailBtn).toContain('shrink-0');
      expect(bailBtn).toContain('whitespace-nowrap');
    });
  });

  // =========================================================================
  // FACET 4: Mobile 360px Ergonomics & Observable DOM Collision Defense
  // =========================================================================
  describe('Facet 4: Mobile 360px Ergonomics & Observable DOM Collision Defense', () => {
    it('[TC-198.13/MSS][UC-IMP198] ActionDock: 4 nút phụ bảo toàn min-w-[44px], min-h-[44px] và nhãn chữ có hidden sm:inline cho mobile 360px', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { isMyTurn: true }));
      const manageBtn = html.match(/<button[^>]*aria-label="Quản lý và nâng cấp bất động sản"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';
      const tradeBtn = html.match(/<button[^>]*aria-label="Đàm phán thương lượng"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';

      expect(manageBtn).toContain('min-w-[44px]');
      expect(manageBtn).toContain('min-h-[44px]');
      expect(manageBtn).toContain('hidden sm:inline');
      expect(tradeBtn).toContain('hidden sm:inline');
    });

    it('[TC-198.14/MSS][UC-IMP198] ActionDock: Khi mock pendingTradeOffer gửi tới p1, DOM không chứa bot-pacing-chip hay notice-chip triệt tiêu đè lấn 183px', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'bot1',
        turnPhase: TurnPhase.WaitingRoll,
        playersInfo: {
          p1: { id: 'p1', name: 'Đại Gia', balance: 10000, isBot: false, tokenColor: '#38BDF8', ownedProperties: [] },
          bot1: { id: 'bot1', name: 'Bot Tỷ Phú', balance: 10000, isBot: true, tokenColor: '#F59E0B', ownedProperties: [] },
        },
        pendingTradeOffer: null,
      });

      // 1. Khi chưa có offer: chip bot-pacing hiển thị bình thường
      const htmlWithoutOffer = renderToStaticMarkup(
        React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: false })
      );
      expect(htmlWithoutOffer).toContain('data-testid="bot-pacing-chip"');

      // 2. Khi có pendingTradeOffer gửi đến p1: chip bị triệt tiêu khỏi DOM
      useGameStore.setState({
        pendingTradeOffer: {
          offerId: 'offer_anti_collision',
          cellIndex: 7,
          price: 3500,
          buyerId: 'bot1',
          sellerId: 'p1',
          expiresAt: Date.now() + 15000,
        },
      });

      const htmlWithOffer = renderToStaticMarkup(
        React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: false })
      );
      expect(htmlWithOffer).not.toContain('data-testid="bot-pacing-chip"');
      expect(htmlWithOffer).not.toContain('-notice-chip');
    });
  });

  // =========================================================================
  // FACET 5: Anti-patterns & LOC Tier Compliance
  // =========================================================================
  describe('Facet 5: Anti-patterns & LOC Tier Compliance', () => {
    it('[TC-198.15/MSS][UC-IMP198] Kiểm tra 4 anti-patterns Impeccable trên action_dock.tsx và hud_container.tsx', () => {
      const targetUiFiles = [
        'src/client/ui/action_dock.tsx',
        'src/client/ui/hud_container.tsx',
        'src/client/ui/modals/bot_trade_offer_strip.tsx',
      ];
      const violations = targetUiFiles.flatMap((filePath) => {
        const content = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
        return lintContent(content, filePath);
      });

      expect(violations).toEqual([]);
    });

    it('[TC-198.16/MSS][UC-IMP198] Ngân sách LOC: action_dock.tsx duy trì nghiêm ngặt trong trần <= 400 LOC', () => {
      const filePath = 'src/client/ui/action_dock.tsx';
      const loc = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8').split('\n').length;

      expect(loc).toBeLessThanOrEqual(400);
    });
  });
});
