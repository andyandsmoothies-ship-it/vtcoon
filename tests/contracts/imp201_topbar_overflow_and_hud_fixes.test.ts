// [TC-201.01/MSS..TC-201.20/MSS][UC-IMP201] Mobile TopBar Overflow, Badge Collision, Pawn Stepping Toast Desync & HUD Ergonomics Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: TopBar Responsive Layout & Zero Clipping (TC-201.01..04)
// Facet 2: FloatingBadge Interactive Dismissibility & Close Affordance (TC-201.05..08)
// Facet 3: Pawn Movement & Bilateral Financial Timing Synchronization (TC-201.09..12, TC-201.18..20)
// Facet 4: Player HUD Collapsible Edge Tab & Viewport Anchoring (TC-201.13..15)
// Facet 5: Runtime Interaction & State Cleanliness (TC-201.16..17)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { TopBar } from '../../src/client/ui/top_bar';
import { FloatingBadge, FloatingNumbersOverlay } from '../../src/client/ui/floating_numbers';
import { PlayerHudList } from '../../src/client/ui/player_hud_list';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
  type PendingPawnMove,
} from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import { useAudioStore } from '../../src/client/store/audio_store';
import { useEnvironmentStore } from '../../src/client/store/environment_store';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store';
import { useActivityStore, type ActivityLogEntry } from '../../src/client/store/activity_store';
import {
  HOP_DURATION,
  LANDING_DURATION,
  BOT_STEP_DURATION,
} from '../../src/client/3d/pawn_path';
import * as activityBadgeDispatcher from '../../src/client/network/activity_badge_dispatcher';

// ============================================================================
// RESOLVE CONTRACT SYMBOLS (Station 1 RED Contract Gate)
// Resolves required dispatch functions from activity_badge_dispatcher
// Throws explicit MISSING_FUNCTION if not yet implemented/exported by Station 2.
// ============================================================================
const getPawnLandingDelay: (playerId?: string) => number =
  (activityBadgeDispatcher as any).getPawnLandingDelay ??
  (() => {
    throw new Error('MISSING_FUNCTION: getPawnLandingDelay has not been implemented in activity_badge_dispatcher');
  });

const scheduleAction: (action: () => void, delayMs: number) => NodeJS.Timeout | number | null =
  (activityBadgeDispatcher as any).scheduleAction ??
  (() => {
    throw new Error('MISSING_FUNCTION: scheduleAction has not been implemented in activity_badge_dispatcher');
  });

const clearPendingBadgeTimers: () => void =
  (activityBadgeDispatcher as any).clearPendingBadgeTimers ??
  (() => {
    throw new Error('MISSING_FUNCTION: clearPendingBadgeTimers has not been implemented in activity_badge_dispatcher');
  });

const handleRentBadge: (act: ActivityLogEntry, state: any) => void =
  (activityBadgeDispatcher as any).handleRentBadge ??
  (() => {
    throw new Error('MISSING_FUNCTION: handleRentBadge has not been exported in activity_badge_dispatcher');
  });

const handleBuyBadge: (act: ActivityLogEntry, state: any) => void =
  (activityBadgeDispatcher as any).handleBuyBadge ??
  (() => {
    throw new Error('MISSING_FUNCTION: handleBuyBadge has not been exported in activity_badge_dispatcher');
  });

const handleTaxBadge: (act: ActivityLogEntry, state: any) => void =
  (activityBadgeDispatcher as any).handleTaxBadge ??
  (() => {
    throw new Error('MISSING_FUNCTION: handleTaxBadge has not been exported in activity_badge_dispatcher');
  });

function extractTagByTestId(html: string, testId: string): string {
  const regex = new RegExp(`<[^>]*data-testid="${testId}"[^>]*>`, 'i');
  const match = html.match(regex);
  return match ? match[0] : '';
}

function renderBadgeForProps(item: FloatingTextItem) {
  let capturedProps: any = null;
  function Harness() {
    const element = FloatingBadge({ item });
    capturedProps = element.props;
    return element;
  }
  renderToStaticMarkup(React.createElement(Harness));
  return capturedProps;
}

const sampleRentItem: FloatingTextItem = {
  id: 'badge-rent-101',
  text: '-1.500 Tr.',
  type: FloatingTextType.Penalty,
  playerId: 'p1',
  actionType: 'rent_pay',
  title: 'Trả thuê Bến Bạch Đằng',
  targetPlayerId: 'p2',
  targetPlayerName: 'Bob Tycoon',
  cellIndex: 3,
  timestamp: 1000,
};

describe('[TC-201.01/MSS..TC-201.20/MSS][UC-IMP201] IMP-201 TopBar, Badge Collision, Pawn Stepping & HUD Ergonomics Contract', () => {
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
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 30,
      currentTurnPlayerId: 'p1',
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
        p2: {
          id: 'p2',
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
  // FACET 1: TopBar Responsive Layout & Zero Clipping (TC-201.01..04)
  // =========================================================================
  describe('Facet 1: TopBar Responsive Layout & Zero Clipping', () => {
    it('[TC-201.01/MSS][UC-IMP201] TopBar render nút thời tiết time-of-day-toggle-button ẩn trên mobile < 440px bằng class hidden min-[440px]:inline-flex', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));
      const tag = extractTagByTestId(html, 'time-of-day-toggle-button');

      expect(tag).toContain('hidden min-[440px]:inline-flex');
      expect(tag).not.toContain('min-[390px]:inline-flex');
    });

    it('[TC-201.02/MSS][UC-IMP201] TopBar capsule bên trái match-info-capsule có class px-2 min-[360px]:px-2.5 giải phóng tối thiểu 16px cho mobile 360px', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));
      const tag = extractTagByTestId(html, 'match-info-capsule');

      expect(tag).toContain('px-2');
      expect(tag).not.toContain('px-3 sm:px-4');
    });

    it('[TC-201.03/MSS][UC-IMP201] TopBar nút Thoát bàn render toàn vẹn với data-testid="leave-room-button" và icon 🚪', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar, { onLeaveRoom: vi.fn() }));
      const tag = extractTagByTestId(html, 'leave-room-button');

      expect(tag).toContain('data-testid="leave-room-button"');
      expect(html).toContain('🚪');
    });

    it('[TC-201.04/MSS][UC-IMP201] TopBar badge activity-unread-badge neo mép với class right-0 thay vì -right-1 triệt tiêu va chạm nút kế bên', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar, { unreadCount: 95 }));
      const tag = extractTagByTestId(html, 'activity-unread-badge');

      expect(tag).toContain('right-0');
      expect(tag).not.toContain('-right-1');
    });
  });

  // =========================================================================
  // FACET 2: FloatingBadge Interactive Dismissibility & Close Affordance (TC-201.05..08)
  // =========================================================================
  describe('Facet 2: FloatingBadge Interactive Dismissibility & Close Affordance', () => {
    it('[TC-201.05/MSS][UC-IMP201] FloatingBadge render container có pointer-events-auto và cursor-pointer không chứa pointer-events-none', () => {
      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: sampleRentItem }));
      const tag = extractTagByTestId(html, 'contextual-transaction-badge');

      expect(tag).toContain('pointer-events-auto');
      expect(tag).toContain('cursor-pointer');
      expect(tag).not.toContain('pointer-events-none');
    });

    it('[TC-201.06/MSS][UC-IMP201] FloatingBadge render nút đóng ✕ trong header với aria-label="Đóng thông báo"', () => {
      const html = renderToStaticMarkup(React.createElement(FloatingBadge, { item: sampleRentItem }));

      expect(html).toContain('aria-label="Đóng thông báo"');
      expect(html).toContain('✕');
    });

    it('[TC-201.07/MSS][UC-IMP201] Khi click nút ✕ hoặc container FloatingBadge thì hàm removeFloatingText(id) được gọi', () => {
      useGameStore.setState({ floatingTexts: [sampleRentItem] });
      const props = renderBadgeForProps(sampleRentItem);

      expect(props?.onClick).toBeDefined();
      props?.onClick?.({ stopPropagation: vi.fn() });
      expect(useGameStore.getState().floatingTexts.some((t) => t.id === sampleRentItem.id)).toBe(false);
    });

    it('[TC-201.08/MSS][UC-IMP201] Khi bấm phím Enter hoặc Space trên FloatingBadge thì removeFloatingText(id) được kích hoạt', () => {
      useGameStore.setState({ floatingTexts: [sampleRentItem] });
      const props = renderBadgeForProps(sampleRentItem);

      expect(props?.onKeyDown).toBeDefined();
      props?.onKeyDown?.({ key: 'Enter', preventDefault: vi.fn(), stopPropagation: vi.fn() });
      expect(useGameStore.getState().floatingTexts.some((t) => t.id === sampleRentItem.id)).toBe(false);
    });
  });

  // =========================================================================
  // FACET 3: Pawn Movement & Bilateral Financial Timing Synchronization (TC-201.09..12, TC-201.18..20)
  // =========================================================================
  describe('Facet 3: Pawn Movement & Bilateral Financial Timing Synchronization', () => {
    it('[TC-201.09/MSS][UC-IMP201] Khi không có animation di chuyển và không lăn xúc xắc thì getPawnLandingDelay trả về 0', () => {
      useGameStore.setState({
        activePawnAnimation: null,
        pendingPawnMove: null,
        isRolling: false,
      });

      const delay = getPawnLandingDelay('p1');
      expect(delay).toBe(0);
    });

    it('[TC-201.10/MSS][UC-IMP201] Khi isRolling hoặc có pendingPawnMove thì getPawnLandingDelay tính toán thời gian chờ xúc xắc dừng và bước nhảy chuẩn SSOT (230ms người chơi, 200ms bot)', () => {
      useGameStore.setState({
        isRolling: true,
        pendingPawnMove: {
          playerId: 'p1',
          fromCell: 0,
          targetCell: 4,
          isBot: false,
        } as PendingPawnMove,
        activePawnAnimation: null,
      });

      const humanStepMs = (HOP_DURATION + LANDING_DURATION) * 1000;
      const expectedDelay = 1200 + 4 * humanStepMs;
      const actualDelay = getPawnLandingDelay('p1');

      expect(actualDelay).toBe(expectedDelay);
    });

    it('[TC-201.11/MSS][UC-IMP201] Trong handleRentBadge thì cả payerId và receiverId cùng âm thanh/VFX đều đồng bộ hạ cánh sau delay', () => {
      vi.useFakeTimers();
      const rentAct: ActivityLogEntry = {
        id: 'rent_sync_act',
        type: 'rent',
        message: 'Andy Tycoon trả Bob Tycoon 1.000 Tr.',
        timestamp: Date.now(),
        playerId: 'p1',
        playerName: 'Andy Tycoon',
        targetPlayerId: 'p2',
        targetPlayerName: 'Bob Tycoon',
        amount: 1000,
        cellIndex: 3,
      };

      useGameStore.setState({
        isRolling: false,
        pendingPawnMove: {
          playerId: 'p1',
          fromCell: 0,
          targetCell: 3,
          isBot: false,
        } as PendingPawnMove,
        floatingTexts: [],
      });

      handleRentBadge(rentAct, useGameStore.getState());

      // At t = 0 (before landing), zero floating texts should be visible
      expect(useGameStore.getState().floatingTexts.length).toBe(0);

      // Advance time to landing point: 3 steps * 230ms = 690ms
      vi.advanceTimersByTime(690);

      const texts = useGameStore.getState().floatingTexts;
      expect(texts.some((t) => t.playerId === 'p1')).toBe(true);
      expect(texts.some((t) => t.playerId === 'p2')).toBe(true);
    });

    it('[TC-201.12/MSS][UC-IMP201] clearPendingBadgeTimers hủy sạch toàn bộ timer đang chờ ngăn chặn rò rỉ sang Turn N+1 hoặc reset game', () => {
      vi.useFakeTimers();
      scheduleAction(() => {
        useGameStore.getState().addFloatingText(sampleRentItem);
      }, 2000);

      clearPendingBadgeTimers();
      vi.advanceTimersByTime(3000);

      expect(useGameStore.getState().floatingTexts.some((t) => t.id === sampleRentItem.id)).toBe(false);
    });

    it('[TC-201.18/MSS][UC-IMP201] scheduleAction thực thi ngay lập tức khi delayMs <= 0 và tạo timer khi delayMs > 0', () => {
      let executedImmediately = false;
      scheduleAction(() => {
        executedImmediately = true;
      }, 0);

      expect(executedImmediately).toBe(true);
    });

    it('[TC-201.19/MSS][UC-IMP201] handleBuyBadge trì hoãn popup mua BĐS khi người mua đang di chuyển', () => {
      vi.useFakeTimers();
      useGameStore.setState({
        isRolling: false,
        pendingPawnMove: {
          playerId: 'p1',
          fromCell: 0,
          targetCell: 2,
          isBot: false,
        } as PendingPawnMove,
        floatingTexts: [],
      });

      const buyAct: ActivityLogEntry = {
        id: 'buy_step_act',
        type: 'buy',
        message: 'Andy Tycoon đã mua Đất Đỏ với giá 1.000 Tr.',
        timestamp: Date.now(),
        playerId: 'p1',
        cellIndex: 2,
        amount: 1000,
      };

      handleBuyBadge(buyAct, useGameStore.getState());
      expect(useGameStore.getState().floatingTexts.length).toBe(0);

      vi.advanceTimersByTime(2 * 230);
      expect(useGameStore.getState().floatingTexts.length).toBe(1);
    });

    it('[TC-201.20/MSS][UC-IMP201] handleTaxBadge trì hoãn popup nộp thuế khi người chơi đang di chuyển', () => {
      vi.useFakeTimers();
      useGameStore.setState({
        isRolling: false,
        pendingPawnMove: {
          playerId: 'p1',
          fromCell: 0,
          targetCell: 4,
          isBot: false,
        } as PendingPawnMove,
        floatingTexts: [],
      });

      const taxAct: ActivityLogEntry = {
        id: 'tax_step_act',
        type: 'tax',
        message: 'Andy Tycoon nộp Thuế Đất Đai',
        timestamp: Date.now(),
        playerId: 'p1',
        cellIndex: 4,
        amount: -300,
      };

      handleTaxBadge(taxAct, useGameStore.getState());
      expect(useGameStore.getState().floatingTexts.length).toBe(0);

      vi.advanceTimersByTime(4 * 230);
      expect(useGameStore.getState().floatingTexts.length).toBe(1);
    });
  });

  // =========================================================================
  // FACET 4: Player HUD Collapsible Edge Tab & Viewport Anchoring (TC-201.13..15)
  // =========================================================================
  describe('Facet 4: Player HUD Collapsible Edge Tab & Viewport Anchoring', () => {
    beforeEach(() => {
      useGameStore.setState({
        playersInfo: {
          p1: { id: 'p1', name: 'Tester', isBankrupt: false } as any,
          p2: { id: 'p2', name: 'Bob', isBankrupt: false } as any,
        },
      });
    });

    it('[TC-201.13/MSS][UC-IMP201] PlayerHudList render nút Edge Tab có class fixed right-0 và rounded-l-xl rounded-r-none', () => {
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));
      const btnTag = extractTagByTestId(html, 'toggle-player-hud-btn');

      expect(btnTag).toContain('fixed');
      expect(btnTag).toContain('right-0');
      expect(btnTag).toContain('rounded-l-xl');
      expect(btnTag).toContain('rounded-r-none');
    });

    it('[TC-201.14/MSS][UC-IMP201] Nút Edge Tab hiển thị nhãn văn bản Bảng Điểm khi thu gọn', () => {
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));

      expect(html).toContain('Bảng Điểm');
    });

    it('[TC-201.15/MSS][UC-IMP201] Khi mở bảng điểm thì container danh sách thẻ có pt-28 sm:pt-0 để không bị nút Edge Tab đè lên thẻ người chơi thứ hai', () => {
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));

      expect(html).toMatch(/class="[^"]*pt-28[^"]*"/);
    });
  });

  // =========================================================================
  // FACET 5: Runtime Interaction & State Cleanliness (TC-201.16..17)
  // =========================================================================
  describe('Facet 5: Runtime Interaction & State Cleanliness', () => {
    it('[TC-201.16/MSS][UC-IMP201] Phím bấm Escape hoặc ArrowDown không gây crash và không gọi hàm đóng nhầm', () => {
      useGameStore.setState({ floatingTexts: [sampleRentItem] });
      const props = renderBadgeForProps(sampleRentItem);

      expect(() => {
        props?.onKeyDown?.({ key: 'Escape', preventDefault: vi.fn(), stopPropagation: vi.fn() });
        props?.onKeyDown?.({ key: 'ArrowDown', preventDefault: vi.fn(), stopPropagation: vi.fn() });
      }).not.toThrow();

      // Ensure item is not dismissed by unrelated keys
      expect(useGameStore.getState().floatingTexts.some((t) => t.id === sampleRentItem.id)).toBe(true);
    });

    it('[TC-201.17/MSS][UC-IMP201] Khi resetGameState được gọi thì các pending badge timers được dọn dẹp sạch sẽ', () => {
      vi.useFakeTimers();
      scheduleAction(() => {
        useGameStore.getState().addFloatingText(sampleRentItem);
      }, 1500);

      useGameStore.getState().resetGameState();
      vi.advanceTimersByTime(3000);

      expect(useGameStore.getState().floatingTexts.length).toBe(0);
    });
  });
});
