// [TC-205.01/MSS..TC-205.16/MSS][UC-IMP205] Bot Event Card Toast Notification & TopBar Scoreboard Toggle Ergonomics Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Bot Chance & Market Toasts (TC-205.01..TC-205.06b)
// Facet 2: TopBar Scoreboard Toggle & Button Ergonomics (TC-205.07..TC-205.10)
// Facet 3: PlayerHudList Cleanup & Subtractive Refactoring (TC-205.11..TC-205.14)
// Facet 4: Pawn Landing Handler Generalization & Actor Guard (TC-205.15..TC-205.16)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { TopBar } from '../../src/client/ui/top_bar';
import { PlayerHudList } from '../../src/client/ui/player_hud_list';
import {
  useGameStore,
  type GameState,
} from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import { useAudioStore } from '../../src/client/store/audio_store';
import { useActivityStore } from '../../src/client/store/activity_store';
import { useEnvironmentStore } from '../../src/client/store/environment_store';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store';
import { executeCellLanding } from '../../src/client/offline_landing';
import * as applyDeltaModule from '../../src/client/network/apply_delta';
import { applyDelta } from '../../src/client/network/apply_delta';
import type { DeltaPayload } from '../../src/server/session_manager';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types';

function extractTagByTestId(html: string, testId: string): string {
  const regex = new RegExp(`<[^>]*data-testid=["']${testId}["'][^>]*>`, 'i');
  const match = html.match(regex);
  return match ? match[0] : '';
}

const dispatchEventCardDelta = (delta: DeltaPayload, state: GameState = useGameStore.getState()) => {
  if (typeof (applyDeltaModule as any).syncEventCard === 'function') {
    (applyDeltaModule as any).syncEventCard(delta, state);
  } else {
    applyDelta(delta);
  }
};

describe('[TC-205.01/MSS..TC-205.16/MSS][UC-IMP205] Bot Card Toast & HUD Toggle Ergonomics Contract', () => {
  beforeEach(() => {
    useGameStore.getInitialState = useGameStore.getState;
    useLobbyStore.getInitialState = useLobbyStore.getState;
    useAudioStore.getInitialState = useAudioStore.getState;
    useActivityStore.getInitialState = useActivityStore.getState;
    useEnvironmentStore.getInitialState = useEnvironmentStore.getState;
    useTelemetryStore.getInitialState = useTelemetryStore.getState;

    useGameStore.getState().resetGameState();
    useActivityStore.setState({
      activityLogs: [],
      unreadCount: 0,
      isActivityFeedOpen: false,
    });
    useLobbyStore.setState({
      myPlayerId: 'p1',
    });
    useEnvironmentStore.setState({
      phase: 'day',
      mode: 'auto',
    });
    useTelemetryStore.setState({
      isConsoleOpen: false,
    });
    useAudioStore.setState({
      isMuted: false,
    });
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 30,
      currentTurnPlayerId: 'p1',
      floatingTexts: [],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Andy Tycoon',
          balance: 15000,
          tokenColor: '#ef4444',
          isBankrupt: false,
          isBot: false,
          ownedProperties: [],
        } as PlayerHudInfo,
        bot_2: {
          id: 'bot_2',
          name: 'Bob Tycoon',
          balance: 12000,
          tokenColor: '#3b82f6',
          isBankrupt: false,
          isBot: true,
          ownedProperties: [],
        } as PlayerHudInfo,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // =========================================================================
  // FACET 1: Bot Chance & Market Toasts (TC-205.01..TC-205.06b)
  // =========================================================================
  describe('Facet 1: Bot Chance & Market Toasts', () => {
    it('[TC-205.01/MSS][UC-IMP205] syncEventCard khi nhận delta.lastEventCard cho Bot phát sinh FloatingTextItem mang actionType: chance với durationMs: 2500', () => {
      const botChanceDelta: DeltaPayload = {
        roomCode: 'VT_205',
        tick: 12,
        cells: [],
        currentTurnPlayerId: 'bot_2',
        lastEventCard: {
          id: 'card_lucky_contract',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'cc_lucky_contract',
          title: 'TRÚNG THẦU DỰ ÁN',
          description: 'Nhận thưởng 500 Tr. từ ngân sách thành phố',
          effectDelta: 500,
          drawnBy: 'bot_2',
        },
      };

      dispatchEventCardDelta(botChanceDelta);

      const items = useGameStore.getState().floatingTexts;
      const banner = items.find((t) => t.actionType === 'chance');

      expect(banner).toBeDefined();
      expect(banner?.playerId).toBe('bot_2');
      expect(banner?.durationMs).toBe(2500);
      expect(banner?.title).toBe('TRÚNG THẦU DỰ ÁN');
    });

    it('[TC-205.02/MSS][UC-IMP205] syncEventCard khi nhận thẻ Market cho Bot phát sinh FloatingTextItem mang actionType: market với playerId lấy từ delta.currentTurnPlayerId', () => {
      const botMarketDelta: DeltaPayload = {
        roomCode: 'VT_205',
        tick: 13,
        cells: [],
        currentTurnPlayerId: 'bot_2',
        lastEventCard: {
          id: 'card_real_estate_boom',
          type: 'Market',
          cardType: 'market',
          cardId: 'mc_real_estate_boom',
          title: 'BÙNG NỔ ĐỊA ỐC',
          description: 'Giá trị tiền thuê toàn bản đồ tăng 20%',
        },
      };

      dispatchEventCardDelta(botMarketDelta);

      const items = useGameStore.getState().floatingTexts;
      const banner = items.find((t) => t.actionType === 'market');

      expect(banner).toBeDefined();
      expect(banner?.playerId).toBe('bot_2');
      expect(banner?.durationMs).toBe(2500);
      expect(banner?.title).toBe('BÙNG NỔ ĐỊA ỐC');
    });

    it('[TC-205.03/MSS][UC-IMP205] syncEventCard không phát banner trùng lặp nếu cardId không thay đổi giữa 2 delta liên tiếp', () => {
      const botCardDelta: DeltaPayload = {
        roomCode: 'VT_205',
        tick: 14,
        cells: [],
        currentTurnPlayerId: 'bot_2',
        lastEventCard: {
          id: 'card_stimulus_01',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'cc_stimulus_01',
          title: 'GÓI KÍCH CẦU',
          description: 'Nhận hỗ trợ lãi suất 300 Tr.',
          drawnBy: 'bot_2',
        },
      };

      dispatchEventCardDelta(botCardDelta);
      const countFirstEmit = useGameStore.getState().floatingTexts.length;

      // Resync delta with exact same cardId
      dispatchEventCardDelta({
        ...botCardDelta,
        tick: 15,
      });
      const countSecondEmit = useGameStore.getState().floatingTexts.length;

      expect(countFirstEmit).toBe(1);
      expect(countSecondEmit).toBe(1);
      expect(useGameStore.getState().floatingTexts[0]?.durationMs).toBe(2500);
    });

    it('[TC-205.04/MSS][UC-IMP205] syncEventCard không phát FloatingTextItem dạng banner cho người chơi cục bộ (turnPlayerId === myPid)', () => {
      const botDelta: DeltaPayload = {
        roomCode: 'VT_205',
        tick: 16,
        cells: [],
        currentTurnPlayerId: 'bot_2',
        lastEventCard: {
          id: 'card_bot_card_test',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'cc_bot_card_test',
          title: 'THẺ CỦA BOT',
          description: 'Bot nhận thưởng',
          drawnBy: 'bot_2',
        },
      };
      dispatchEventCardDelta(botDelta);
      expect(useGameStore.getState().floatingTexts).toHaveLength(1);

      const localDelta: DeltaPayload = {
        roomCode: 'VT_205',
        tick: 17,
        cells: [],
        currentTurnPlayerId: 'p1', // local human player
        lastEventCard: {
          id: 'card_local_card_test',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'cc_local_card_test',
          title: 'THẺ NGƯỜI CHƠI THẬT',
          description: 'Người chơi nhận thưởng',
          drawnBy: 'p1',
        },
      };
      dispatchEventCardDelta(localDelta);

      const banners = useGameStore.getState().floatingTexts.filter(
        (t) => t.actionType === 'chance' || t.actionType === 'market'
      );
      expect(banners).toHaveLength(1);
      expect(banners[0]?.playerId).toBe('bot_2');
    });

    it('[TC-205.05/MSS][UC-IMP205] executeCellLanding trong chế độ offline (!isConnected) khi Bot hạ cánh ô Cơ Hội phát MilestoneBanner', () => {
      // Cell 7 is Chance ('Phiếu Cơ Hội')
      executeCellLanding('bot_2', 7, 'bot_2', false);

      const items = useGameStore.getState().floatingTexts;
      const banner = items.find((t) => t.actionType === 'chance');

      expect(banner).toBeDefined();
      expect(banner?.playerId).toBe('bot_2');
      expect(banner?.durationMs).toBe(2500);
    });

    it('[TC-205.06/MSS][UC-IMP205] executeCellLanding trong chế độ offline (!isConnected) khi Bot hạ cánh ô Thị Trường phát MilestoneBanner', () => {
      // Cell 2 is Market ('Phiếu Thị Trường')
      executeCellLanding('bot_2', 2, 'bot_2', false);

      const items = useGameStore.getState().floatingTexts;
      const banner = items.find((t) => t.actionType === 'market');

      expect(banner).toBeDefined();
      expect(banner?.playerId).toBe('bot_2');
      expect(banner?.durationMs).toBe(2500);
    });

    it('[TC-205.06b/A1][UC-IMP205] executeCellLanding trong chế độ online (isConnected === true) KHÔNG phát addFloatingText để tránh bắn đúp với syncEventCard', () => {
      // Offline emits toast banner
      executeCellLanding('bot_2', 7, 'bot_2', false);
      expect(useGameStore.getState().floatingTexts).toHaveLength(1);

      // In online mode (isConnected === true), offline_landing must NOT emit floatingText
      executeCellLanding('bot_2', 7, 'bot_2', true);
      expect(useGameStore.getState().floatingTexts).toHaveLength(1);
      expect(useGameStore.getState().activeModal).toBeNull();
    });
  });

  // =========================================================================
  // FACET 2: TopBar Scoreboard Toggle & Button Ergonomics (TC-205.07..TC-205.10)
  // =========================================================================
  describe('Facet 2: TopBar Scoreboard Toggle & Button Ergonomics', () => {
    it('[TC-205.07/MSS][UC-IMP205] TopBar render nút toggle-hud-topbar-btn trong cụm hud-utilities-cluster với touch target min-w-[36px] min-h-[36px]', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));
      const btn = extractTagByTestId(html, 'toggle-hud-topbar-btn');

      expect(html).toContain('data-testid="toggle-hud-topbar-btn"');
      expect(btn).toMatch(/min-w-\[36px\]/);
      expect(btn).toMatch(/min-h-\[36px\]/);
    });

    it('[TC-205.08/MSS][UC-IMP205] Bấm toggle-hud-topbar-btn kích hoạt togglePlayerHudVisibility đảo trạng thái isPlayerHudVisible', () => {
      const store = useGameStore.getState() as any;

      expect(store.isPlayerHudVisible).toBe(true);
      store.togglePlayerHudVisibility();
      expect(useGameStore.getState().isPlayerHudVisible).toBe(false);
      store.togglePlayerHudVisibility();
      expect(useGameStore.getState().isPlayerHudVisible).toBe(true);
    });

    it('[TC-205.09/MSS][UC-IMP205] Nhãn aria-label và title của nút trên TopBar phản ánh chính xác trạng thái Ẩn/Hiện Bảng Điểm', () => {
      useGameStore.setState({ isPlayerHudVisible: true } as any);
      const htmlOpen = renderToStaticMarkup(React.createElement(TopBar));
      const btnOpen = extractTagByTestId(htmlOpen, 'toggle-hud-topbar-btn');

      useGameStore.setState({ isPlayerHudVisible: false } as any);
      const htmlClosed = renderToStaticMarkup(React.createElement(TopBar));
      const btnClosed = extractTagByTestId(htmlClosed, 'toggle-hud-topbar-btn');

      expect(btnOpen).toMatch(/aria-label=".*(Ẩn|Thu gọn).*Bảng Điểm.*"/i);
      expect(btnClosed).toMatch(/aria-label=".*(Hiện|Mở).*Bảng Điểm.*"/i);
    });

    it('[TC-205.10/MSS][UC-IMP205] Chữ Bảng Điểm ẩn trên màn hình hẹp (hidden sm:inline) để chống tràn TopBar 360px', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));

      expect(html).toMatch(/<span[^>]*class="[^"]*hidden sm:inline[^"]*"[^>]*>\s*Bảng Điểm\s*<\/span>/);
    });
  });

  // =========================================================================
  // FACET 3: PlayerHudList Cleanup & Subtractive Refactoring (TC-205.11..TC-205.14)
  // =========================================================================
  describe('Facet 3: PlayerHudList Cleanup & Subtractive Refactoring', () => {
    it('[TC-205.11/MSS][UC-IMP205] PlayerHudList hoàn toàn không còn render nút toggle-player-hud-btn hay bất kỳ nút fixed nào ở sườn phải', () => {
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));

      expect(html).not.toContain('data-testid="toggle-player-hud-btn"');
      expect(html).not.toContain('fixed');
    });

    it('[TC-205.12/MSS][UC-IMP205] PlayerHudList không còn mang padding dư thừa pt-28', () => {
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));

      expect(html).not.toContain('pt-28');
    });

    it('[TC-205.13/MSS][UC-IMP205] Khi isPlayerHudVisible === false, PlayerHudList render null (không tồn tại trong DOM)', () => {
      useGameStore.setState({ isPlayerHudVisible: false } as any);
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));

      expect(html).toBe('');
    });

    it('[TC-205.14/MSS][UC-IMP205] Khi isPlayerHudVisible === true, PlayerHudList hiển thị đầy đủ thẻ các người chơi', () => {
      useGameStore.setState({ isPlayerHudVisible: true } as any);
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));

      expect(html).toContain('Thông tin Andy Tycoon');
      expect(html).toContain('Thông tin Bob Tycoon');
      expect(html).toContain('data-testid="player-ribbon"');
      expect(html).not.toContain('data-testid="toggle-player-hud-btn"');
    });
  });

  // =========================================================================
  // FACET 4: Pawn Landing Handler Generalization & Actor Guard (TC-205.15..TC-205.16)
  // =========================================================================
  describe('Facet 4: Pawn Landing Handler Generalization & Actor Guard', () => {
    it('[TC-205.15/MSS][UC-IMP205] Trong offline_landing.ts, khi Bot đến lượt đi và hạ cánh ô BĐS chưa ai mua, isLocal là false, không mở TitleDeedModal', () => {
      useLobbyStore.setState({ myPlayerId: 'p1' });
      useGameStore.setState({
        activeModal: null,
        currentTurnPlayerId: 'bot_2',
        playersInfo: {
          p1: { id: 'p1', name: 'Andy Tycoon', isBot: false, balance: 15000, ownedProperties: [] } as any,
          bot_2: { id: 'bot_2', name: 'Bob Tycoon', isBot: true, balance: 15000, ownedProperties: [] } as any,
        },
      });

      // Bot lands on unowned property cell 1
      executeCellLanding('bot_2', 1, 'bot_2', false);

      expect(useGameStore.getState().activeModal).toBeNull();
    });

    it('[TC-205.16/MSS][UC-IMP205] Trong offline_landing.ts, khi Human đến lượt đi và hạ cánh ô BĐS chưa ai mua, isLocal là true, mở TitleDeedModal', () => {
      useLobbyStore.setState({ myPlayerId: 'p1' });
      useGameStore.setState({
        activeModal: null,
        currentTurnPlayerId: 'p1',
        playersInfo: {
          p1: { id: 'p1', name: 'Andy Tycoon', isBot: false, balance: 15000, ownedProperties: [] } as any,
          bot_2: { id: 'bot_2', name: 'Bob Tycoon', isBot: true, balance: 15000, ownedProperties: [] } as any,
        },
      });

      // Human lands on unowned property cell 1
      executeCellLanding('p1', 1, 'p1', false);

      expect(useGameStore.getState().activeModal).toBe('deed');
      expect(useGameStore.getState().modalPayload).toMatchObject({
        cellIndex: 1,
        isBuyOpportunity: true,
      });
    });
  });
});
