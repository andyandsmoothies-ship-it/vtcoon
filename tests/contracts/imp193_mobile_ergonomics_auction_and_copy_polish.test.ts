// [TC-193.01/MSS..TC-193.16/MSS][UC-IMP193] Mobile Ergonomics, Auction Refactor & Financial Copy Standardization Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Boundary & Range (ActionDock CTA, Secondary Buttons, PlayerCard Dot Spacing)
// Facet 2: Layout & Mobile Viewport Constraints (FloatingBadge Width, FloatingNumbersOverlay Container, AuctionModal Bounds)
// Facet 3: Component Surface & Domain Copy Tiers (AuctionDistrictCard Streamlining, Color Group Label, Line Clamp, Rent Bar Header)
// Facet 4: Reactive Event Streams & Pacing Invariants (Event Card 4800ms Duration, TurnOrchestrator Bot Delay Invariant)
// Facet 5: Cross-Coupling Blast Radius, Financial Terminology & Codebase Hygiene (Auction Win Synchronization, Financial Phrasing, Impeccable Anti-patterns, LOC Budgets)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';

import { ActionDock } from '../../src/client/ui/action_dock';
import { PlayerCard } from '../../src/client/ui/player_card';
import {
  FloatingBadge,
  FloatingNumbersOverlay,
  resolveFriendlyReason,
} from '../../src/client/ui/floating_numbers';
import { AuctionDistrictCard } from '../../src/client/ui/modals/auction_district_card';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import {
  trackDeltaActivities,
  resetEventCardActivityTracker,
} from '../../src/client/network/activity_tracker';
import { dispatchActivityFloatingBadges } from '../../src/client/network/activity_badge_dispatcher';
import { calculateBotStepDelay } from '../../src/server/network/turn_orchestrator';
import { lintContent } from '../../scripts/lint_ui.mjs';

import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
} from '../../src/client/store/game_store';
import { TurnPhase } from '../../src/domain/room';

describe('[TC-193.01/MSS..TC-193.16/MSS][UC-IMP193] Mobile Ergonomics, Auction Refactor & Financial Copy Standardization', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      activeModal: null,
      activeModifiers: [],
    });
  });

  // =========================================================================
  // FACET 1: Boundary & Range (ActionDock & PlayerCard Layout Bounds)
  // =========================================================================
  describe('Facet 1: Boundary & Range (ActionDock & PlayerCard Layout Bounds)', () => {
    it('[TC-193.01/MSS][UC-IMP193] ActionDock: Nút "Đổ" có padding ngang px-5 sm:px-6 và nhãn text có min-w-[28px] text-center', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActionDock, {
          isMyTurn: true,
          hasRolledThisTurn: false,
          canRollAgain: false,
          isPawnMoving: false,
        })
      );
      const rollBtn = html.match(/<button[^>]*data-testid="roll-dice-btn"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';
      const doSpan = rollBtn.match(/<span[^>]*>Đổ<\/span>/)?.[0] ?? '';

      expect(rollBtn).toContain('px-5 sm:px-6');
      expect(rollBtn).not.toContain('px-4.5');
      expect(doSpan).toContain('min-w-[28px]');
      expect(doSpan).toContain('text-center');
    });

    it('[TC-193.02/MSS][UC-IMP193] ActionDock: Cả 3 nút phụ (Quản Lý BĐS, Đàm Phán, Kết Thúc Lượt) dùng class sm:px-4 đồng bộ với Quy Hoạch', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActionDock, {
          isMyTurn: true,
          hasRolledThisTurn: false,
          canRollAgain: false,
          isPawnMoving: false,
        })
      );
      const managePropBtn = html.match(/<button[^>]*aria-label="Quản lý và nâng cấp bất động sản"[^>]*>/)?.[0] ?? '';
      const tradeBtn = html.match(/<button[^>]*aria-label="Đàm phán thương lượng"[^>]*>/)?.[0] ?? '';
      const endTurnBtn = html.match(/<button[^>]*aria-label="Kết thúc lượt"[^>]*>/)?.[0] ?? '';

      expect(managePropBtn + tradeBtn + endTurnBtn).not.toContain('sm:px-4.5');
      expect(managePropBtn).toContain('sm:px-4');
      expect(tradeBtn).toContain('sm:px-4');
      expect(endTurnBtn).toContain('sm:px-4');
    });

    it('[TC-193.03/MSS][UC-IMP193] PlayerCard: Dải 22 chấm BĐS dùng class w-1 h-1 và gap-[1px], thẻ root KHÔNG chứa overflow-hidden', () => {
      const mockPlayer: PlayerHudInfo = {
        id: 'p1',
        name: 'Đại Gia Hà Thành',
        balance: 15000,
        tokenColor: '#38BDF8',
        ownedProperties: [1, 3],
        isBot: false,
        bankrupt: false,
      };
      const html = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: mockPlayer,
          isCurrentTurn: true,
          levelMap: {},
        })
      );
      const rootDiv = html.match(/<div[^>]*data-testid="player-ribbon"[^>]*>/)?.[0] ?? '';
      const clusterDiv = html.match(/<div[^>]*data-testid="cluster-Nau"[^>]*>/)?.[0] ?? '';
      const dotSpan = html.match(/<span[^>]*data-testid="dot-cell-1"[^>]*>/)?.[0] ?? '';

      expect(rootDiv).not.toContain('overflow-hidden');
      expect(clusterDiv).toContain('gap-[1px]');
      expect(dotSpan).toContain('w-1 h-1');
    });
  });

  // =========================================================================
  // FACET 2: Layout & Mobile Viewport Constraints
  // =========================================================================
  describe('Facet 2: Layout & Mobile Viewport Constraints', () => {
    it('[TC-193.04/MSS][UC-IMP193] FloatingBadge: Container badge giới hạn max-w-[82vw] sm:max-w-[340px] trên mobile', () => {
      const item: FloatingTextItem = {
        id: 'ft_badge_test',
        text: '+500 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'salary',
        timestamp: Date.now(),
      };
      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item }));
      const badgeContainer = html.match(/<div[^>]*data-testid="contextual-transaction-badge"[^>]*>/)?.[0] ?? '';

      expect(badgeContainer).toContain('max-w-[82vw]');
      expect(badgeContainer).toContain('sm:max-w-[340px]');
      expect(badgeContainer).not.toContain('max-w-[92vw]');
      expect(badgeContainer).not.toContain('sm:max-w-none');
    });

    it('[TC-193.05/MSS][UC-IMP193] FloatingNumbersOverlay: Container bọc danh sách thông báo giới hạn max-w-[84vw] md:max-w-md', () => {
      useGameStore.setState({
        floatingTexts: [
          {
            id: 'ft_overlay_1',
            text: '+200 Tr.',
            type: FloatingTextType.Reward,
            playerId: 'p1',
            actionType: 'salary',
            timestamp: Date.now(),
          },
        ],
      });
      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const listContainer = html.match(/<div[^>]*class="[^"]*fixed[^"]*left-1\/2[^"]*"[^>]*>/)?.[0] ?? '';

      expect(listContainer).toContain('max-w-[84vw]');
      expect(listContainer).toContain('md:max-w-md');
      expect(listContainer).not.toContain('max-w-[92vw]');
    });

    it('[TC-193.10/MSS][UC-IMP193] AuctionModal: Nới rộng badgeMaxWidth lên "max-w-[180px] sm:max-w-none" và player name chip "max-w-[100px] sm:max-w-[160px]"', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 3,
          currentBid: 1200,
          startingBid: 1000,
          highestBidderId: 'p1',
          bidderName: 'Đại Gia Sài Thành',
          timeRemaining: 15,
          myId: 'p1',
          playersInfo: {
            p1: { id: 'p1', name: 'Đại Gia Sài Thành', balance: 10000, tokenColor: '#EF4444', ownedProperties: [] },
            p2: { id: 'p2', name: 'Tỷ Phú Hà Nội', balance: 8000, tokenColor: '#3B82F6', ownedProperties: [] },
          },
        })
      );

      expect(html).toContain('max-w-[180px]');
      expect(html).toContain('max-w-[100px] sm:max-w-[160px]');
      expect(html).not.toContain('max-w-[120px]');
    });
  });

  // =========================================================================
  // FACET 3: Component Surface & Domain Copy Tiers
  // =========================================================================
  describe('Facet 3: Component Surface & Domain Copy Tiers', () => {
    it('[TC-193.06/MSS][UC-IMP193] AuctionDistrictCard: Loại bỏ hoàn toàn chuỗi thừa "Ô CỦA BẠN"', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 3,
          currentBid: 1000,
          myId: 'p1',
          playersInfo: {
            p1: { id: 'p1', name: 'Đại Gia', balance: 10000, tokenColor: '#EF4444', ownedProperties: [1] },
          },
          levelMap: {},
        })
      );
      expect(html).not.toContain('Ô CỦA BẠN');
    });

    it('[TC-193.07/MSS][UC-IMP193] AuctionDistrictCard: Tên phân khu địa lý dài dòng được thay bằng nhãn màu "Nhóm ${colorName}"', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 3,
          currentBid: 1000,
          myId: 'p1',
          playersInfo: {
            p1: { id: 'p1', name: 'Đại Gia', balance: 10000, tokenColor: '#EF4444', ownedProperties: [] },
          },
          levelMap: {},
        })
      );
      expect(html).not.toContain('Đồng Bằng Sông Cửu Long');
      expect(html).toContain('Nhóm Nâu');
    });

    it('[TC-193.08/MSS][UC-IMP193] AuctionDistrictCard: Chip ô đất hỗ trợ tên hiển thị 2 dòng line-clamp-2 thay cho truncate block', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 3,
          currentBid: 1000,
          myId: 'p1',
          playersInfo: {
            p1: { id: 'p1', name: 'Đại Gia', balance: 10000, tokenColor: '#EF4444', ownedProperties: [] },
          },
          levelMap: {},
        })
      );
      expect(html).toContain('line-clamp-2');
      expect(html).not.toContain('truncate block');
    });

    it('[TC-193.09/MSS][UC-IMP193] AuctionDistrictCard: Thanh cước thuê hiển thị rõ tiêu đề ngữ cảnh "BIỂU PHÍ THUÊ Ô ĐẤU GIÁ"', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionDistrictCard, {
          cellIndex: 3,
          currentBid: 1000,
          myId: 'p1',
          playersInfo: {
            p1: { id: 'p1', name: 'Đại Gia', balance: 10000, tokenColor: '#EF4444', ownedProperties: [] },
          },
          levelMap: {},
        })
      );
      expect(html).toContain('BIỂU PHÍ THUÊ Ô ĐẤU GIÁ');
    });
  });

  // =========================================================================
  // FACET 4: Reactive Event Streams & Pacing Invariants
  // =========================================================================
  describe('Facet 4: Reactive Event Streams & Pacing Invariants', () => {
    it('[TC-193.11/MSS][UC-IMP193] activity_tracker.ts: Dispatch sự kiện thẻ Cơ Hội / Thị Trường phát sinh badge có durationMs: 4800', () => {
      resetEventCardActivityTracker();
      let capturedItem: any = null;
      const mockNextState: any = {
        currentTurnPlayerId: 'p1',
        playersInfo: { p1: { name: 'Player 1' } },
        addFloatingText: vi.fn((item) => {
          capturedItem = item;
        }),
      };
      const mockPrevState: any = { ...mockNextState };
      const delta: any = {
        lastEventCard: {
          id: 'CC_CASH_BONUS',
          type: 'Chance',
          title: 'Nhận Thưởng Cổ Tức',
          description: 'Nhận 200 Tr.',
          effectDelta: 200,
          drawnBy: 'p1',
        },
      };

      trackDeltaActivities(delta, mockPrevState, mockNextState);

      expect(mockNextState.addFloatingText).toHaveBeenCalled();
      expect(capturedItem?.durationMs).toBe(4800);
    });

    it('[TC-193.12/MSS][UC-IMP193] turn_orchestrator.ts: calculateBotStepDelay trả về >= 2500ms khi có lastEventCard và baseDelayMs > 500, giữ 500ms khi test nhanh', () => {
      const roomWithCard: any = {
        roomCode: 'RM_PACING',
        phase: TurnPhase.ActionPhase,
        lastDice: [0, 0],
        lastEventCard: { id: 'CC_TEST', title: 'Thị Trường' },
      };

      const delayNormal = calculateBotStepDelay(roomWithCard, 1500);
      const delayFast = calculateBotStepDelay(roomWithCard, 500);

      expect(delayNormal).toBeGreaterThanOrEqual(2500);
      expect(delayFast).toBe(500);
    });
  });

  // =========================================================================
  // FACET 5: Cross-Coupling Blast Radius, Financial Terminology & Codebase Hygiene
  // =========================================================================
  describe('Facet 5: Cross-Coupling Blast Radius, Financial Terminology & Codebase Hygiene', () => {
    it('[TC-193.13/MSS][UC-IMP193] activity_badge_dispatcher.ts & floating_numbers.tsx: Đồng bộ tiêu đề badge đấu giá "Thắng đấu giá" và "➔ Nộp Kho Bạc"', () => {
      let capturedItem: any = null;
      const mockState: any = {
        addFloatingText: vi.fn((item) => {
          capturedItem = item;
        }),
        playersInfo: { p1: { name: 'Đại Gia' } },
      };
      const auctionActivity: any = {
        id: 'auction_win_p1',
        type: 'auction',
        message: 'Đại Gia trúng đấu giá Bến Bạch Đằng',
        playerId: 'p1',
        cellIndex: 3,
        amount: -1200,
        timestamp: Date.now(),
      };
      dispatchActivityFloatingBadges([auctionActivity], mockState);

      const auctionItem: FloatingTextItem = {
        id: 'ft_auction_win',
        text: '-1200 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'auction_win',
        cellIndex: 3,
        timestamp: Date.now(),
      };
      const reason = resolveFriendlyReason(auctionItem);

      expect(capturedItem?.title).toContain('Thắng đấu giá');
      expect(capturedItem?.title).toContain('➔ Nộp Kho Bạc');
      expect(reason).toContain('Thắng đấu giá');
      expect(reason).toContain('➔ Nộp Kho Bạc');
    });

    it('[TC-193.14/MSS][UC-IMP193] floating_numbers.tsx: Formatters sinh văn bản chuẩn hóa súc tích phân định rõ dòng tiền', () => {
      const rentPayText = resolveFriendlyReason({
        id: 'ft_rent_pay',
        text: '-300 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'rent_pay',
        cellIndex: 3,
        targetPlayerName: 'Đại Gia',
        timestamp: Date.now(),
      });
      const rentReceiveText = resolveFriendlyReason({
        id: 'ft_rent_rec',
        text: '+300 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p2',
        actionType: 'rent_receive',
        cellIndex: 3,
        targetPlayerName: 'Con Nợ',
        timestamp: Date.now(),
      });
      const mortgageText = resolveFriendlyReason({
        id: 'ft_mortgage',
        text: '+600 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'p1',
        actionType: 'mortgage',
        cellIndex: 3,
        timestamp: Date.now(),
      });
      const unmortgageText = resolveFriendlyReason({
        id: 'ft_unmortgage',
        text: '-660 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'unmortgage',
        cellIndex: 3,
        timestamp: Date.now(),
      });
      const bailText = resolveFriendlyReason({
        id: 'ft_bail',
        text: '-500 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'bail',
        cellIndex: 10,
        timestamp: Date.now(),
      });
      const taxText = resolveFriendlyReason({
        id: 'ft_tax',
        text: '-150 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'p1',
        actionType: 'tax',
        title: 'Lệ Phí Đất Đai (Ô 04)',
        cellIndex: 4,
        timestamp: Date.now(),
      });

      expect([
        rentPayText,
        rentReceiveText,
        mortgageText,
        unmortgageText,
        bailText,
        taxText,
      ]).toEqual([
        'Trả thuê Bến Bạch Đằng cho Đại Gia',
        'Thu thuê Bến Bạch Đằng từ Con Nợ',
        'Thế chấp Bến Bạch Đằng ➔ Vay Ngân Hàng',
        'Giải chấp Bến Bạch Đằng (Phí 10% ➔ Kho Bạc)',
        'Bảo lãnh kiểm toán (Ô 10) ➔ Nộp Kho Bạc',
        'Nộp Lệ Phí Đất Đai (Ô 04) ➔ Kho Bạc',
      ]);
    });

    it('[TC-193.15/MSS][UC-IMP193] Kiểm tra 4 anti-patterns Impeccable trên các tệp UI mục tiêu (no border-accent-on-rounded, no bounce-easing, no gray-on-color, no gradient-text)', () => {
      const targetUiFiles = [
        'src/client/ui/action_dock.tsx',
        'src/client/ui/player_card.tsx',
        'src/client/ui/floating_numbers.tsx',
        'src/client/ui/modals/auction_modal.tsx',
        'src/client/ui/modals/auction_district_card.tsx',
      ];
      const violations = targetUiFiles.flatMap((filePath) => {
        const content = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
        return lintContent(content, filePath);
      });
      expect(violations).toEqual([]);
    });

    it('[TC-193.16/MSS][UC-IMP193] Ngân sách LOC: Tất cả 7 tệp mục tiêu nằm trong trần quy định', () => {
      const budgetMap: [string, number][] = [
        ['src/client/ui/action_dock.tsx', 400],
        ['src/client/ui/player_card.tsx', 250],
        ['src/client/ui/floating_numbers.tsx', 400],
        ['src/client/network/activity_badge_dispatcher.ts', 300],
        ['src/client/ui/modals/auction_modal.tsx', 450],
        ['src/client/ui/modals/auction_district_card.tsx', 220],
        ['src/server/network/turn_orchestrator.ts', 400],
      ];
      const overBudgetFiles = budgetMap.filter(([file, max]) => {
        const loc = fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8').split('\n').length;
        return loc > max;
      });
      expect(overBudgetFiles).toEqual([]);
    });
  });
});
