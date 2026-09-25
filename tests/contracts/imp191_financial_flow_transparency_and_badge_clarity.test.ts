// [TC-191.01/MSS..TC-191.16/MSS][UC-IMP191] Financial Flow Transparency & Multi-Subject Badge Clarity Contract Suite
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import {
  useGameStore,
  FloatingTextType,
  type GameState,
  type FloatingTextItem,
  type PlayerHudInfo,
  type FloatingActionType,
} from '../../src/client/store/game_store.js';
import {
  useActivityStore,
  type ActivityLogEntry,
} from '../../src/client/store/activity_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import {
  matchRentTransactions,
  processPayerFee,
  type BalanceDelta,
  type PropertyFinancialContext,
} from '../../src/client/network/activity_financial_tracker.js';
import {
  dispatchActivityFloatingBadges,
} from '../../src/client/network/activity_badge_dispatcher.js';
import { applyPlayerDeltas } from '../../src/client/network/apply_delta_players.js';
import {
  resolveActionIcon,
  resolveFriendlyReason,
  FloatingNumbersOverlay,
} from '../../src/client/ui/floating_numbers.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

const emptyContext: PropertyFinancialContext = {
  boughtCellIndices: [],
  buyoutCellIndices: [],
  upgradedCells: [],
  mortgagedCells: [],
  unmortgagedCells: [],
};

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    playerPositions: { human_p1: 3, bot_1: 0, bot_2: 10 },
    playersInfo: {
      human_p1: {
        id: 'human_p1',
        name: 'Human Alpha',
        balance: 10000,
        tokenColor: '#38BDF8',
        ownedProperties: [],
        isBot: false,
      },
      bot_1: {
        id: 'bot_1',
        name: 'AI Alpha',
        balance: 10000,
        tokenColor: '#F59E0B',
        ownedProperties: [3],
        isBot: true,
      },
      bot_2: {
        id: 'bot_2',
        name: 'AI Beta',
        balance: 5000,
        tokenColor: '#10B981',
        ownedProperties: [],
        isBot: true,
      },
    },
    ...overrides,
  };
}

describe('[UC-IMP191] Financial Flow Transparency & Badge Clarity Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      activeModal: null,
      activeModifiers: [],
    });
    useActivityStore.setState({
      activityLogs: [],
      isActivityFeedOpen: false,
      unreadCount: 0,
      activeFilter: 'all',
    });
    useLobbyStore.setState({
      myPlayerId: 'human_p1',
    });
  });

  // =========================================================================
  // FACET 1: Boundary & Range (Data Contracts & DTOs)
  // =========================================================================
  describe('Facet 1: Boundary & Range (Data Contracts & DTOs)', () => {
    it('[TC-191.01/MSS][UC-IMP191] Interface BalanceDelta: Chấp nhận và bảo toàn thuộc tính cellIndex?: number', () => {
      const payerDelta: BalanceDelta & { cellIndex?: number } = {
        id: 'human_p1',
        diff: -200,
        cellIndex: 3,
        pInfo: { id: 'human_p1', name: 'Human Alpha', balance: 9800, tokenColor: '#38BDF8', ownedProperties: [] },
      };
      const receiverDelta: BalanceDelta & { cellIndex?: number } = {
        id: 'bot_1',
        diff: 200,
        cellIndex: 3,
        pInfo: { id: 'bot_1', name: 'AI Alpha', balance: 10200, tokenColor: '#F59E0B', ownedProperties: [3] },
      };

      const { rentLogs } = matchRentTransactions([payerDelta], [receiverDelta]);
      expect(rentLogs).toHaveLength(1);
      expect(rentLogs[0]?.cellIndex).toBe(3);
    });

    it('[TC-191.02/MSS][UC-IMP191] Interface ActivityLogEntry: addActivityLog chấp nhận và lưu trữ targetPlayerId và targetPlayerName', () => {
      useActivityStore.getState().addActivityLog({
        type: 'rent',
        message: 'Human Alpha đã trả 200 Tr. tiền thuê cho AI Alpha',
        playerId: 'human_p1',
        playerName: 'Human Alpha',
        targetPlayerId: 'bot_1',
        targetPlayerName: 'AI Alpha',
        amount: -200,
        cellIndex: 3,
      } as unknown as Parameters<ReturnType<typeof useActivityStore.getState>['addActivityLog']>[0]);

      const logs = useActivityStore.getState().activityLogs;
      const entry = logs[logs.length - 1];
      expect(entry).toBeDefined();
      expect(entry?.targetPlayerId).toBe('bot_1');
      expect(entry?.targetPlayerName).toBe('AI Alpha');
    });

    it('[TC-191.03/MSS][UC-IMP191] Type ActivityLogType: Hỗ trợ unmortgage và bail bên cạnh mortgage', () => {
      const bailPayer: BalanceDelta = {
        id: 'human_p1',
        diff: -500,
        pInfo: { id: 'human_p1', name: 'Human Alpha', balance: 9500, tokenColor: '#38BDF8', ownedProperties: [] },
      };
      const delta: DeltaPayload = {
        tick: 1,
        cells: [],
        players: [{ id: 'human_p1', position: 10, balance: 9500 }],
      };
      const prevState = createMockGameState({
        playersInfo: {
          human_p1: { id: 'human_p1', name: 'Human Alpha', balance: 10000, tokenColor: '#38BDF8', ownedProperties: [], inAudit: true, auditTurnsLeft: 2 },
        },
      });

      const bailLog = processPayerFee(bailPayer, emptyContext, delta, prevState);
      expect(bailLog).toBeDefined();
      expect(bailLog?.type as string).toBe('bail');
    });

    it('[TC-191.04/MSS][UC-IMP191] Type FloatingActionType: resolveActionIcon hỗ trợ mortgage (🏦), unmortgage (🔓), và bail (🚨)', () => {
      const mortgageIcon = resolveActionIcon('mortgage' as FloatingActionType);
      const unmortgageIcon = resolveActionIcon('unmortgage' as FloatingActionType);
      const bailIcon = resolveActionIcon('bail' as FloatingActionType);

      expect(mortgageIcon).toBe('🏦');
      expect(unmortgageIcon).toBe('🔓');
      expect(bailIcon).toBe('🚨');
    });
  });

  // =========================================================================
  // FACET 2: State Reactivity & Multi-Turn Teardown (Transaction Matching)
  // =========================================================================
  describe('Facet 2: State Reactivity & Multi-Turn Teardown (Transaction Matching)', () => {
    it('[TC-191.05/MSS][UC-IMP191] matchRentTransactions: Sinh rentLogs chứa đầy đủ targetPlayerId, targetPlayerName, cellIndex, amount', () => {
      const payer: BalanceDelta & { cellIndex?: number } = {
        id: 'human_p1',
        diff: -200,
        cellIndex: 3,
        pInfo: { id: 'human_p1', name: 'Human Alpha', balance: 9800, tokenColor: '#38BDF8', ownedProperties: [] },
      };
      const receiver: BalanceDelta & { cellIndex?: number } = {
        id: 'bot_1',
        diff: 200,
        cellIndex: 3,
        pInfo: { id: 'bot_1', name: 'AI Alpha', balance: 10200, tokenColor: '#F59E0B', ownedProperties: [3] },
      };

      const { rentLogs } = matchRentTransactions([payer], [receiver]);
      expect(rentLogs[0]?.targetPlayerId).toBe('bot_1');
      expect(rentLogs[0]?.targetPlayerName).toBe('AI Alpha');
      expect(rentLogs[0]?.cellIndex).toBe(3);
      expect(rentLogs[0]?.amount).toBe(-200);
    });

    it('[TC-191.06/MSS][UC-IMP191] processPayerFee: Sinh log type tax, cellIndex 4, message Lệ Phí Đăng Ký Đất Đai tại Ô 04', () => {
      const taxPayer: BalanceDelta = {
        id: 'human_p1',
        diff: -100,
        pInfo: { id: 'human_p1', name: 'Human Alpha', balance: 9900, tokenColor: '#38BDF8', ownedProperties: [] },
      };
      const delta: DeltaPayload = {
        tick: 2,
        cells: [],
        players: [{ id: 'human_p1', position: 4, balance: 9900 }],
      };

      const log = processPayerFee(taxPayer, emptyContext, delta);
      expect(log).toBeDefined();
      expect(log?.type).toBe('tax');
      expect(log?.cellIndex).toBe(4);
      expect(log?.message).toContain('Lệ Phí Đăng Ký Đất Đai');
    });

    it('[TC-191.07/MSS][UC-IMP191] processPayerFee: Sinh log type bail, cellIndex 10, message Bảo Lãnh Kiểm Toán khi nộp 500 Tr. rời Trạm', () => {
      const bailPayer: BalanceDelta = {
        id: 'human_p1',
        diff: -500,
        pInfo: { id: 'human_p1', name: 'Human Alpha', balance: 9500, tokenColor: '#38BDF8', ownedProperties: [] },
      };
      const delta: DeltaPayload = {
        tick: 3,
        cells: [],
        players: [{ id: 'human_p1', position: 10, balance: 9500 }],
      };
      const prevState = createMockGameState({
        playersInfo: {
          human_p1: { id: 'human_p1', name: 'Human Alpha', balance: 10000, tokenColor: '#38BDF8', ownedProperties: [], inAudit: true },
        },
      });

      const log = processPayerFee(bailPayer, emptyContext, delta, prevState);
      expect(log).toBeDefined();
      expect(log?.cellIndex).toBe(10);
      expect(log?.message).toContain('Bảo Lãnh Kiểm Toán');
    });
  });

  // =========================================================================
  // FACET 3: Resource Disposal & Anti-Spike Segregation (Dispatcher Routing)
  // =========================================================================
  describe('Facet 3: Resource Disposal & Anti-Spike Segregation (Dispatcher Routing)', () => {
    it('[TC-191.08/MSS][UC-IMP191] handleRentBadge: Đọc trực tiếp targetPlayerId và targetPlayerName, phát đúng 2 badge cho Bot ID dạng bot_1', () => {
      const mockAddFloatingText = vi.fn();
      const state = createMockGameState({ addFloatingText: mockAddFloatingText });

      const act: ActivityLogEntry = {
        id: 'rent_174000_human_p1_bot_1',
        timestamp: Date.now(),
        type: 'rent',
        message: 'Human Alpha đã trả 200 Tr. tiền thuê cho AI Alpha',
        playerId: 'human_p1',
        playerName: 'Human Alpha',
        targetPlayerId: 'bot_1',
        targetPlayerName: 'AI Alpha',
        amount: -200,
        cellIndex: 3,
      };

      dispatchActivityFloatingBadges([act], state);

      expect(mockAddFloatingText).toHaveBeenCalledWith(expect.objectContaining({
        playerId: 'human_p1',
        actionType: 'rent_pay',
        targetPlayerName: 'AI Alpha',
        cellIndex: 3,
      }));
      expect(mockAddFloatingText).toHaveBeenCalledWith(expect.objectContaining({
        playerId: 'bot_1',
        actionType: 'rent_receive',
        targetPlayerName: 'Human Alpha',
        cellIndex: 3,
      }));
    });

    it('[TC-191.09/MSS][UC-IMP191] handleRentBadge: Ghi cảnh báo warn và bail sớm nếu targetPlayerId hoặc targetPlayerName bị thiếu', () => {
      const mockAddFloatingText = vi.fn();
      const state = createMockGameState({ addFloatingText: mockAddFloatingText });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const actCorrupt: ActivityLogEntry = {
        id: 'rent_corrupt_test',
        timestamp: Date.now(),
        type: 'rent',
        message: 'Lỗi không có thông tin đối tác',
        playerId: 'human_p1',
        amount: -200,
        cellIndex: 3,
      };

      dispatchActivityFloatingBadges([actCorrupt], state);

      expect(warnSpy).toHaveBeenCalled();
      expect(mockAddFloatingText).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('[TC-191.13/MSS][UC-IMP191] apply_delta_players.ts Subtractive Audit: Không gọi notifyBalanceChange generic khi nộp bảo lãnh 500 Tr.', () => {
      const mockAddFloatingText = vi.fn();
      const state = createMockGameState({
        playerPositions: { human_p1: 10 },
        addFloatingText: mockAddFloatingText,
      });
      const playersInfoMap: Record<string, PlayerHudInfo> = {
        human_p1: { id: 'human_p1', name: 'Human Alpha', balance: 5000, tokenColor: '#38BDF8', ownedProperties: [] },
      };
      const delta: DeltaPayload = {
        tick: 4,
        cells: [],
        players: [{ id: 'human_p1', position: 10, balance: 4500 }],
      };

      applyPlayerDeltas(delta, state, playersInfoMap, false);
      expect(mockAddFloatingText).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // FACET 4: Error Defense & Treasury Clarity (State Treasury & Mortgage)
  // =========================================================================
  describe('Facet 4: Error Defense & Treasury Clarity (State Treasury & Mortgage)', () => {
    it('[TC-191.10/MSS][UC-IMP191] handleTaxBadge: Gán tiêu đề có hậu tố ➔ Vào Kho Bạc cho Lệ Phí Đất Đai Ô 04', () => {
      const mockAddFloatingText = vi.fn();
      const state = createMockGameState({ addFloatingText: mockAddFloatingText });

      const act: ActivityLogEntry = {
        id: 'tax_1',
        timestamp: Date.now(),
        type: 'tax',
        message: '🏛️ Human Alpha đã nộp phí / nộp thuế 100 Tr. (Lệ Phí Đăng Ký Đất Đai)',
        playerId: 'human_p1',
        cellIndex: 4,
        amount: -100,
      };

      dispatchActivityFloatingBadges([act], state);
      expect(mockAddFloatingText).toHaveBeenCalledWith(expect.objectContaining({
        actionType: 'tax',
        title: expect.stringContaining('➔ Vào Kho Bạc'),
        cellIndex: 4,
      }));
    });

    it('[TC-191.11/MSS][UC-IMP191] dispatchActivityFloatingBadges: Routing type bail phát badge actionType bail, tiêu đề chứa (Ô 10) ➔ Vào Kho Bạc', () => {
      const mockAddFloatingText = vi.fn();
      const state = createMockGameState({ addFloatingText: mockAddFloatingText });

      const act: ActivityLogEntry = {
        id: 'bail_1',
        timestamp: Date.now(),
        type: 'bail',
        message: '🚨 Human Alpha đã nộp bảo lãnh 500 Tr. để rời Trạm Kiểm Toán',
        playerId: 'human_p1',
        cellIndex: 10,
        amount: -500,
      };

      dispatchActivityFloatingBadges([act], state);
      expect(mockAddFloatingText).toHaveBeenCalledWith(expect.objectContaining({
        actionType: 'bail',
        title: expect.stringMatching(/Ô 10.*➔ Vào Kho Bạc/),
        cellIndex: 10,
      }));
    });

    it('[TC-191.12/MSS][UC-IMP191] dispatchActivityFloatingBadges: Xử lý mortgage và unmortgage với định danh nguồn tiền Ngân Hàng và Kho Bạc', () => {
      const mockAddFloatingText = vi.fn();
      const state = createMockGameState({ addFloatingText: mockAddFloatingText });

      const mortgageAct: ActivityLogEntry = {
        id: 'mortgage_1',
        timestamp: Date.now(),
        type: 'mortgage',
        message: 'Human Alpha đã thế chấp Bến Bạch Đằng vào ngân hàng',
        playerId: 'human_p1',
        cellIndex: 3,
        amount: 600,
      };
      const unmortgageAct: ActivityLogEntry = {
        id: 'unmortgage_1',
        timestamp: Date.now(),
        type: 'unmortgage',
        message: 'Human Alpha đã chuộc lại Bến Bạch Đằng vào ngân hàng',
        playerId: 'human_p1',
        cellIndex: 3,
        amount: -660,
      };

      dispatchActivityFloatingBadges([mortgageAct, unmortgageAct], state);

      expect(mockAddFloatingText).toHaveBeenCalledWith(expect.objectContaining({
        actionType: 'mortgage',
        title: expect.stringMatching(/Vay thế chấp.*từ Ngân Hàng/),
      }));
      expect(mockAddFloatingText).toHaveBeenCalledWith(expect.objectContaining({
        actionType: 'unmortgage',
        title: expect.stringMatching(/Giải chấp.*Phí 10%.*➔ Vào Kho Bạc/),
      }));
    });
  });

  // =========================================================================
  // FACET 5: Cross-Coupling Blast Radius & Mobile Responsive Layout
  // =========================================================================
  describe('Facet 5: Cross-Coupling Blast Radius & Mobile Responsive Layout', () => {
    it('[TC-191.14/MSS][UC-IMP191] floating_numbers.tsx: Formatters định dạng chuẩn xác chuỗi hiển thị kèm formatShortPlayerName', () => {
      const rentPayItem: FloatingTextItem = {
        id: 'ft_rent_pay',
        text: '-200 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'human_p1',
        actionType: 'rent_pay',
        cellIndex: 3,
        targetPlayerName: 'Nguyễn Văn Hoàng Long',
        timestamp: Date.now(),
      };
      const mortgageItem: FloatingTextItem = {
        id: 'ft_mortgage',
        text: '+600 Tr.',
        type: FloatingTextType.Reward,
        playerId: 'human_p1',
        actionType: 'mortgage',
        cellIndex: 3,
        timestamp: Date.now(),
      };
      const unmortgageItem: FloatingTextItem = {
        id: 'ft_unmortgage',
        text: '-660 Tr.',
        type: FloatingTextType.Penalty,
        playerId: 'human_p1',
        actionType: 'unmortgage',
        cellIndex: 3,
        timestamp: Date.now(),
      };

      const rentPayReason = resolveFriendlyReason(rentPayItem);
      const mortgageReason = resolveFriendlyReason(mortgageItem);
      const unmortgageReason = resolveFriendlyReason(unmortgageItem);

      expect(rentPayReason).toContain('Nguyễn V...');
      expect(mortgageReason).toContain('Vay thế chấp Bến Bạch Đằng từ Ngân Hàng');
      expect(unmortgageReason).toContain('Giải chấp Bến Bạch Đằng (Phí 10% ➔ Vào Kho Bạc)');
    });

    it('[TC-191.15/MSS][UC-IMP191] FloatingNumbersOverlay: Đảo thứ tự ưu tiên badge của myPlayerId lên vị trí hiển thị trên mobile viewport', () => {
      useLobbyStore.setState({ myPlayerId: 'human_p1' });
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [
          {
            id: 'ft_payer',
            text: '-200 Tr.',
            type: FloatingTextType.Penalty,
            playerId: 'human_p1',
            actionType: 'rent_pay',
            cellIndex: 3,
            targetPlayerName: 'AI Alpha',
            timestamp: Date.now(),
          },
          {
            id: 'ft_receiver',
            text: '+200 Tr.',
            type: FloatingTextType.Reward,
            playerId: 'bot_1',
            actionType: 'rent_receive',
            cellIndex: 3,
            targetPlayerName: 'Human Alpha',
            timestamp: Date.now(),
          },
        ],
      });

      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      // Vị trí hiển thị trên mobile (class flex đơn độc, không bị che bởi hidden md:flex)
      const mobileVisibleSegment = html.split('w-full flex justify-center flex')[1];
      expect(mobileVisibleSegment).toBeDefined();
      expect(mobileVisibleSegment).toContain('-200 Tr.');
    });

    it('[TC-191.16/MSS][UC-IMP191] Ngân sách LOC: Giữ tất cả 5 tệp trong hạn mức cho phép', () => {
      const root = path.resolve(__dirname, '../../');
      const financialTrackerLoc = fs.readFileSync(path.join(root, 'src/client/network/activity_financial_tracker.ts'), 'utf8').split('\n').length;
      const badgeDispatcherLoc = fs.readFileSync(path.join(root, 'src/client/network/activity_badge_dispatcher.ts'), 'utf8').split('\n').length;
      const floatingNumbersLoc = fs.readFileSync(path.join(root, 'src/client/ui/floating_numbers.tsx'), 'utf8').split('\n').length;
      const applyDeltaPlayersLoc = fs.readFileSync(path.join(root, 'src/client/network/apply_delta_players.ts'), 'utf8').split('\n').length;

      expect(financialTrackerLoc).toBeLessThanOrEqual(330);
      expect(badgeDispatcherLoc).toBeLessThanOrEqual(250);
      expect(floatingNumbersLoc).toBeLessThanOrEqual(390);
      expect(applyDeltaPlayersLoc).toBeLessThanOrEqual(270);
    });
  });
});
