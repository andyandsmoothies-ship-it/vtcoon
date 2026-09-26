// [TC-202.01/MSS..TC-202.18/MSS][UC-IMP202] Contract Test Suite: Mobile UI Ergonomics, Shadow Modernization & Visual Polish
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Shadow Modernization & Subtlety (TC-202.01..TC-202.05)
// Facet 2: In-Turn Badge LƯỢT Containment (TC-202.06..TC-202.08)
// Facet 3: TopBar Mobile Bot Pacing Clarity (TC-202.09..TC-202.11)
// Facet 4: Bot Pacing String Localization (Turn & Auction) (TC-202.12..TC-202.14)
// Facet 5: HUD Collapse Toggle & Spacing (TC-202.15..TC-202.18)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { MilestoneBanner, FloatingBadge } from '../../src/client/ui/floating_numbers.js';
import { ActionDock } from '../../src/client/ui/action_dock.js';
import { PlayerCard } from '../../src/client/ui/player_card.js';
import { TopBar } from '../../src/client/ui/top_bar.js';
import { PlayerHudList } from '../../src/client/ui/player_hud_list.js';
import { resolveBotPacingStatus } from '../../src/client/ui/ui_helpers.js';
import { useGameStore, type FloatingTextItem, type PlayerHudInfo } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { useAudioStore } from '../../src/client/store/audio_store.js';
import { useEnvironmentStore } from '../../src/client/store/environment_store.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import { TurnPhase } from '../../src/domain/room.js';

describe('[TC-202.01/MSS..TC-202.18/MSS][UC-IMP202] Mobile UI Ergonomics, Shadow Modernization & Visual Polish Contract', () => {
  beforeEach(() => {
    useGameStore.getInitialState = useGameStore.getState;
    useLobbyStore.getInitialState = useLobbyStore.getState;
    useAudioStore.getInitialState = useAudioStore.getState;
    useActivityStore.getInitialState = useActivityStore.getState;
    useEnvironmentStore.getInitialState = useEnvironmentStore.getState;
    useTelemetryStore.getInitialState = useTelemetryStore.getState;

    useLobbyStore.setState({ myPlayerId: 'p1' });
    useAudioStore.setState({ isMuted: false });
    useActivityStore.setState({ unreadCount: 0, isActivityFeedOpen: false });
    useTelemetryStore.setState({ metrics: { fps: 60 } as any });

    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 20,
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      isRolling: false,
      dice: [1, 2],
      turnPhase: TurnPhase.WaitingRoll,
      activeModal: null,
      activeModifiers: [],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 15000,
          tokenColor: '#ef4444',
          ownedProperties: [],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: false,
        } as PlayerHudInfo,
        bot_1: {
          id: 'bot_1',
          name: 'Bot AI 1 (Aggressive)',
          balance: 12000,
          tokenColor: '#3b82f6',
          ownedProperties: [],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: true,
          bankrupt: false,
          inAudit: false,
        } as PlayerHudInfo,
      },
    });
  });

  // =========================================================================
  // FACET 1: Shadow Modernization & Subtlety (TC-202.01 - 05)
  // =========================================================================
  describe('Facet 1: Shadow Modernization & Subtlety', () => {
    it('[TC-202.01/MSS][UC-IMP202] MilestoneBanner (thị trường/cơ hội) không còn chứa shadow-[0_4px_0_0_#06b6d4] hay shadow-[0_4px_0_0_#d97706]', () => {
      const marketItem: FloatingTextItem = {
        id: 'ft_market_1',
        playerId: 'p1',
        text: 'Thị trường tăng giá đất',
        title: 'Sự Kiện Thị Trường',
        actionType: 'market',
        timestamp: Date.now(),
      };
      const chanceItem: FloatingTextItem = {
        id: 'ft_chance_1',
        playerId: 'p1',
        text: 'Nhận thưởng dự án',
        title: 'Thẻ Cơ Hội',
        actionType: 'chance',
        timestamp: Date.now(),
      };

      const marketHtml = renderToStaticMarkup(React.createElement(MilestoneBanner, { item: marketItem }));
      const chanceHtml = renderToStaticMarkup(React.createElement(MilestoneBanner, { item: chanceItem }));

      expect(marketHtml).not.toContain('shadow-[0_4px_0_0_#06b6d4]');
      expect(chanceHtml).not.toContain('shadow-[0_4px_0_0_#d97706]');
    });

    it('[TC-202.02/MSS][UC-IMP202] FloatingBadge không còn chứa shadow-[0_3px_0_0_#0f172a]', () => {
      const rentItem: FloatingTextItem = {
        id: 'ft_rent_1',
        playerId: 'p1',
        text: '-500 Tr',
        title: 'Trả tiền thuê',
        actionType: 'rent',
        timestamp: Date.now(),
      };

      const badgeHtml = renderToStaticMarkup(React.createElement(FloatingBadge, { item: rentItem }));

      expect(badgeHtml).not.toContain('shadow-[0_3px_0_0_#0f172a]');
      expect(badgeHtml).toContain('border-slate-300');
    });

    it('[TC-202.03/MSS][UC-IMP202] ActionDock nav container không còn chứa shadow-[0_4px_0_0_#0f172a]', () => {
      const dockHtml = renderToStaticMarkup(
        React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
      );
      const navMatch = dockHtml.match(/<nav[^>]*aria-label="Thanh điều khiển tác vụ"[^>]*>/)?.[0] ?? dockHtml;

      expect(navMatch).not.toContain('shadow-[0_4px_0_0_#0f172a]');
    });

    it('[TC-202.04/MSS][UC-IMP202] Các nút con trong ActionDock không còn chứa shadow-[0_4px_0_0_#0f172a]', () => {
      const dockHtml = renderToStaticMarkup(
        React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true, hasRolledThisTurn: true })
      );

      const manageBtnMatch = dockHtml.match(/<button[^>]*aria-label="Quản lý và nâng cấp bất động sản"[^>]*>/)?.[0] ?? '';
      const tradeBtnMatch = dockHtml.match(/<button[^>]*aria-label="Đàm phán thương lượng"[^>]*>/)?.[0] ?? '';
      const endTurnBtnMatch = dockHtml.match(/<button[^>]*aria-label="Kết thúc lượt"[^>]*>/)?.[0] ?? '';

      expect(manageBtnMatch).not.toContain('shadow-[0_4px_0_0_#0f172a]');
      expect(tradeBtnMatch).not.toContain('shadow-[0_4px_0_0_#0f172a]');
      expect(endTurnBtnMatch).not.toContain('shadow-[0_4px_0_0_#0f172a]');
    });

    it('[TC-202.05/MSS][UC-IMP202] Nút Bảo Lãnh khi inAudit = true không còn chứa shadow-[0_4px_0_0_#0f172a]', () => {
      useGameStore.setState({
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Hưng',
            balance: 5000,
            tokenColor: '#ef4444',
            ownedProperties: [],
            mortgagedProperties: [],
            mortgageLoans: {},
            isBot: false,
            bankrupt: false,
            inAudit: true,
            auditTurnsLeft: 2,
          } as PlayerHudInfo,
        },
      });

      const dockHtml = renderToStaticMarkup(
        React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
      );
      const bailoutBtnMatch = dockHtml.match(/<button[^>]*aria-label="Nộp 500 bảo lãnh kiểm toán để rời trạm ngay"[^>]*>/)?.[0] ?? '';

      expect(bailoutBtnMatch).not.toContain('shadow-[0_4px_0_0_#0f172a]');
    });
  });

  // =========================================================================
  // FACET 2: In-Turn Badge LƯỢT Containment (TC-202.06 - 08)
  // =========================================================================
  describe('Facet 2: In-Turn Badge LƯỢT Containment', () => {
    const testPlayer: PlayerHudInfo = {
      id: 'p1',
      name: 'Chủ Tịch Hưng',
      balance: 15000,
      tokenColor: '#ef4444',
      ownedProperties: [],
      mortgagedProperties: [],
      mortgageLoans: {},
      isBot: false,
      bankrupt: false,
      inAudit: false,
    };

    it('[TC-202.06/MSS][UC-IMP202] PlayerCard khi isCurrentTurn: true render huy hiệu LƯỢT', () => {
      const cardHtml = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: testPlayer,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
        })
      );

      expect(cardHtml).toContain('LƯỢT');
    });

    it('[TC-202.07/MSS][UC-IMP202] PlayerCard không còn chứa class margin âm -top-2.5', () => {
      const cardHtml = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: testPlayer,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
        })
      );

      expect(cardHtml).not.toContain('-top-2.5');
    });

    it('[TC-202.08/MSS][UC-IMP202] Huy hiệu LƯỢT chứa class absolute top-1.5 right-2 và cỡ chữ chuẩn text-[10px]', () => {
      const cardHtml = renderToStaticMarkup(
        React.createElement(PlayerCard, {
          player: testPlayer,
          isCurrentTurn: true,
          levelMap: {},
          slotIndex: 0,
        })
      );
      const badgeMatch = cardHtml.match(/<span[^>]*>[^<]*LƯỢT[^<]*<\/span>/)?.[0] ?? '';

      expect(badgeMatch).toContain('top-1.5');
      expect(badgeMatch).toContain('right-2');
      expect(badgeMatch).toContain('text-[10px]');
    });
  });

  // =========================================================================
  // FACET 3: TopBar Mobile Bot Pacing Clarity (TC-202.09 - 11)
  // =========================================================================
  describe('Facet 3: TopBar Mobile Bot Pacing Clarity', () => {
    beforeEach(() => {
      useGameStore.setState({
        currentTurnPlayerId: 'bot_1',
        turnTimeRemaining: 15,
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Hưng',
            balance: 15000,
            isBot: false,
          } as PlayerHudInfo,
          bot_1: {
            id: 'bot_1',
            name: 'Bot AI 1',
            balance: 12000,
            isBot: true,
          } as PlayerHudInfo,
        },
      });
    });

    it('[TC-202.09/MSS][UC-IMP202] TopBar khi isBotTurn: true trên mobile không render đồng thời cả 2 emoji ⏱️ và 🤖 dính nhau', () => {
      const topBarHtml = renderToStaticMarkup(React.createElement(TopBar));
      const timerSection = topBarHtml.match(/<div[^>]*role="timer"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';

      expect(timerSection).not.toMatch(/⏱️[\s\S]*?<span[^>]*class="[^"]*sm:hidden[^"]*"[^>]*>🤖/);
    });

    it('[TC-202.10/MSS][UC-IMP202] TopBar bảo toàn chuỗi 🤖 Đang tính... trên desktop (hidden sm:inline)', () => {
      const topBarHtml = renderToStaticMarkup(React.createElement(TopBar));
      const timerSection = topBarHtml.match(/<div[^>]*role="timer"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';

      expect(timerSection).toContain('hidden sm:inline');
      expect(timerSection).toContain('🤖 Đang tính...');
    });

    it('[TC-202.11/MSS][UC-IMP202] TopBar render chữ Đang tính trên mobile khi là lượt bot', () => {
      const topBarHtml = renderToStaticMarkup(React.createElement(TopBar));
      const timerSection = topBarHtml.match(/<div[^>]*role="timer"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
      const mobileSpanContent = timerSection.match(/<span[^>]*class="[^"]*sm:hidden[^"]*"[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? '';

      expect(mobileSpanContent).toContain('Đang tính');
    });
  });

  // =========================================================================
  // FACET 4: Bot Pacing String Localization (Turn & Auction) (TC-202.12 - 14)
  // =========================================================================
  describe('Facet 4: Bot Pacing String Localization (Turn & Auction)', () => {
    it('[TC-202.12/MSS][UC-IMP202] resolveBotPacingStatus khi nhận bot có tên Bot AI 4 (Passive) tự động lọc bỏ (Passive), trả về Lượt Bot AI 4...', () => {
      const players = {
        p1: { id: 'p1', name: 'Chủ Tịch Hưng', isBot: false },
        bot_4: { id: 'bot_4', name: 'Bot AI 4 (Passive)', isBot: true },
      };

      const status = resolveBotPacingStatus('bot_4', 'p1', players, TurnPhase.WaitingRoll);

      expect(status?.displayText).toContain('Lượt Bot AI 4...');
      expect(status?.displayText).not.toContain('(Passive)');
      expect(status?.botName).toBe('Bot AI 4');
    });

    it('[TC-202.13/MSS][UC-IMP202] resolveBotPacingStatus với Bot AI 1 (Aggressive) trả về Lượt Bot AI 1...', () => {
      const players = {
        p1: { id: 'p1', name: 'Chủ Tịch Hưng', isBot: false },
        bot_1: { id: 'bot_1', name: 'Bot AI 1 (Aggressive)', isBot: true },
      };

      const status = resolveBotPacingStatus('bot_1', 'p1', players, TurnPhase.WaitingRoll);

      expect(status?.displayText).toContain('Lượt Bot AI 1...');
      expect(status?.displayText).not.toContain('(Aggressive)');
      expect(status?.botName).toBe('Bot AI 1');
    });

    it('[TC-202.14/MSS][UC-IMP202] resolveBotPacingStatus trong AuctionPhase với activeBot.name = Bot AI 4 (Passive) trả về 🤖 Đang đấu giá... (Bot AI 4)', () => {
      const players = {
        p1: { id: 'p1', name: 'Chủ Tịch Hưng', isBot: false },
        bot_4: { id: 'bot_4', name: 'Bot AI 4 (Passive)', isBot: true },
      };

      const status = resolveBotPacingStatus('bot_4', 'p1', players, TurnPhase.AuctionPhase);

      expect(status?.displayText).toBe('🤖 Đang đấu giá... (Bot AI 4)');
      expect(status?.botName).toBe('Bot AI 4');
    });
  });

  // =========================================================================
  // FACET 5: HUD Collapse Toggle & Spacing (TC-202.15 - 18)
  // =========================================================================
  describe('Facet 5: HUD Collapse Toggle & Spacing', () => {
    it('[TC-202.15a/MSS][UC-IMP202] Nút toggle-player-hud-btn render nhãn có chữ trực quan 👥 Ẩn khi danh sách mở', () => {
      const listHtml = renderToStaticMarkup(React.createElement(PlayerHudList));
      const toggleBtnMatch = listHtml.match(/<button[^>]*data-testid="toggle-player-hud-btn"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';

      expect(toggleBtnMatch).toContain('👥 Ẩn');
    });

    it('[TC-202.15b/MSS][UC-IMP202] Nút toggle-player-hud-btn render nhãn có chữ trực quan 👥 Hiện khi danh sách đóng', () => {
      const listHtml = renderToStaticMarkup(
        React.createElement(PlayerHudList as React.ComponentType<{ initialCollapsed?: boolean }>, {
          initialCollapsed: true,
        })
      );
      const toggleBtnMatch = listHtml.match(/<button[^>]*data-testid="toggle-player-hud-btn"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';

      expect(toggleBtnMatch).toContain('👥 Hiện');
    });

    it('[TC-202.16/MSS][UC-IMP202] Container danh sách thẻ người chơi áp dụng gap-2', () => {
      const listHtml = renderToStaticMarkup(React.createElement(PlayerHudList));
      const cardContainerMatch = listHtml.match(/<div[^>]*class="[^"]*flex flex-col[^"]*"[^>]*>/)?.[0] ?? '';

      expect(cardContainerMatch).toContain('gap-2');
      expect(cardContainerMatch).not.toContain('gap-1.5');
    });

    it('[TC-202.17/MSS][UC-IMP202] Nút đổ xúc xắc khi disabled mang các class tương phản sáng rõ (bg-slate-100 text-slate-400)', () => {
      const dockHtml = renderToStaticMarkup(
        React.createElement(ActionDock, {
          localPlayerId: 'p1',
          isMyTurn: false,
        })
      );
      const rollBtnMatch = dockHtml.match(/<button[^>]*data-testid="roll-dice-btn"[^>]*>/)?.[0] ?? '';

      expect(rollBtnMatch).toContain('bg-slate-100');
      expect(rollBtnMatch).toContain('text-slate-400');
    });

    it('[TC-202.18/MSS][UC-IMP202] Khung nav của ActionDock áp dụng backdrop-blur-sm và shadow-lg shadow-slate-900/10', () => {
      const dockHtml = renderToStaticMarkup(
        React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
      );
      const navMatch = dockHtml.match(/<nav[^>]*aria-label="Thanh điều khiển tác vụ"[^>]*>/)?.[0] ?? dockHtml;

      expect(navMatch).toContain('backdrop-blur-sm');
      expect(navMatch).toContain('shadow-slate-900/10');
      expect(navMatch).toContain('shadow-lg');
    });
  });
});
