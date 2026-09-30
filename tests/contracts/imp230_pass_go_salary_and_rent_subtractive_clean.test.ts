// [TC-230.01/MSS..TC-230.16/MSS][UC-GAME-020] Universal 5-Facet Contract Suite:
// IMP-230 Khử Lệch Pha Dòng Tiền Vượt GO & Tách Bạch Huy Hiệu Đa Giao Dịch (Subtractive Clean)
// Architecture Reference: docs/plans/improvements/IMP-230-pass-go-salary-and-rent-subtractive-clean_plan.md

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { DeltaPayload } from '../../src/server/session_manager.js';
import {
  useGameStore,
  type GameState,
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
} from '../../src/client/store/game_store.js';
import {
  useActivityStore,
  type ActivityLogEntry,
} from '../../src/client/store/activity_store.js';
import {
  applyPlayerDeltas,
  notifyBalanceChange,
} from '../../src/client/network/apply_delta_players.js';
import { detectFinancialAndStatusActivities } from '../../src/client/network/activity_financial_tracker.js';
import * as ActivityBadgeDispatcher from '../../src/client/network/activity_badge_dispatcher.js';
import { FloatingBadge } from '../../src/client/ui/floating_numbers.js';
import { SoundEngine } from '../../src/client/audio/sound_engine.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';

const getPawnPassGoDelay: ((playerId?: string) => number) | undefined =
  (ActivityBadgeDispatcher as unknown as { getPawnPassGoDelay?: (playerId?: string) => number }).getPawnPassGoDelay;

const handleSalaryBadge: ((act: ActivityLogEntry, state: GameState) => void) | undefined =
  (ActivityBadgeDispatcher as unknown as { handleSalaryBadge?: (act: ActivityLogEntry, state: GameState) => void }).handleSalaryBadge;

const makeHud = (id: string, name: string, balance: number, color = '#F59E0B', isBot = true, owned: number[] = []): PlayerHudInfo => ({
  id, name, balance, tokenColor: color, ownedProperties: owned, mortgagedProperties: [], isBot,
});

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    levelMap: {},
    playerPositions: { 'bot-1': 0, 'p1': 0, 'p2': 0 },
    dice: [1, 1],
    playersInfo: {
      'bot-1': makeHud('bot-1', 'Bot AI 1', 10_000, '#F59E0B', true),
      'p1': makeHud('p1', 'Người Chơi 1', 10_000, '#38BDF8', false),
      'p2': makeHud('p2', 'Chủ Đất Cần Thơ', 10_000, '#10B981', false, [1]),
    },
    currentTurnPlayerId: 'bot-1',
    turnTimeRemaining: 60,
    treasuryPool: 2_000,
    roundNumber: 1,
    maxRounds: 30,
    activePawnAnimation: null,
    pendingPawnMove: null,
    pawnAnimationQueue: [],
    isRolling: false,
    addFloatingText: vi.fn(),
    closeModal: vi.fn(),
    activeModal: null,
    ...overrides,
  } as unknown as GameState;
}

describe('[CONTRACT] IMP-230: Pass GO Salary & Rent Subtractive Clean Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    ActivityBadgeDispatcher.clearPendingBadgeTimers();
    useActivityStore.setState({ activityLogs: [], isActivityFeedOpen: false, unreadCount: 0, activeFilter: 'all' });
    useGameStore.setState({ floatingTexts: [], activePawnAnimation: null, pendingPawnMove: null, pawnAnimationQueue: [], isRolling: false, activeModal: null });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: SUBTRACTIVE AUDIT & ZERO-GENERIC-SALARY BADGE (TC-230.01..TC-230.04)
  // =========================================================================
  describe('Facet 1: Subtractive Audit & Zero-Generic-Salary Badge in apply_delta_players.ts', () => {
    it('[TC-230.01/MSS][UC-GAME-020] applyPlayerDeltas khi qua GO nhận +2.000 và chịu phí -1.980 (Net diff = +20) -> TUYỆT ĐỐI KHÔNG gọi addFloatingText với +20 hoặc Lương Vượt GO', () => {
      const mockAddFloatingText = vi.fn();
      const state = createMockGameState({ playerPositions: { 'bot-1': 39 }, addFloatingText: mockAddFloatingText });
      const playersInfoMap: Record<string, PlayerHudInfo> = { 'bot-1': makeHud('bot-1', 'Bot AI 1', 10_000) };
      const delta: DeltaPayload = { tick: 1, cells: [], players: [{ id: 'bot-1', position: 1, balance: 10_020, isBot: true }] };

      applyPlayerDeltas(delta, state, playersInfoMap, false);

      expect(mockAddFloatingText).not.toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringMatching(/\+20(?:\s|$)/) }));
      expect(mockAddFloatingText).not.toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining('Lương Vượt GO') }));
    });

    it('[TC-230.02/MSS][UC-GAME-020] applyPlayerDeltas khi qua GO đơn thuần (+2.000) -> TUYỆT ĐỐI KHÔNG sinh badge generic, chuyển giao 100% cho activity_badge_dispatcher', () => {
      const mockAddFloatingText = vi.fn();
      const state = createMockGameState({ playerPositions: { 'bot-1': 38 }, addFloatingText: mockAddFloatingText });
      const playersInfoMap: Record<string, PlayerHudInfo> = { 'bot-1': makeHud('bot-1', 'Bot AI 1', 10_000) };
      const delta: DeltaPayload = { tick: 1, cells: [], players: [{ id: 'bot-1', position: 6, balance: 12_000, isBot: true }] };

      applyPlayerDeltas(delta, state, playersInfoMap, false);

      expect(mockAddFloatingText).not.toHaveBeenCalled();
    });

    it('[TC-230.03/MSS][UC-GAME-020] applyPlayerDeltas khi qua GO và chịu phí lớn hơn lương (Lương +2.000, Thuê -3.750 -> Net diff = -1.750) -> TUYỆT ĐỐI KHÔNG sinh badge generic -1.750', () => {
      const mockAddFloatingText = vi.fn();
      const state = createMockGameState({ playerPositions: { 'bot-1': 38 }, addFloatingText: mockAddFloatingText });
      const playersInfoMap: Record<string, PlayerHudInfo> = { 'bot-1': makeHud('bot-1', 'Bot AI 1', 10_000) };
      const delta: DeltaPayload = { tick: 1, cells: [], players: [{ id: 'bot-1', position: 6, balance: 8_250, isBot: true }] };

      applyPlayerDeltas(delta, state, playersInfoMap, false);

      expect(mockAddFloatingText).not.toHaveBeenCalled();
    });

    it('[TC-230.04/MSS][UC-GAME-020] applyPlayerDeltas bảo toàn duy nhất ngoại lệ isDebtRelief (balance < 0 -> balance >= 0) -> sinh đúng badge Thoát vỡ nợ thành công', () => {
      const mockAddFloatingText = vi.fn();
      const state = createMockGameState({ playerPositions: { 'p1': 5 }, addFloatingText: mockAddFloatingText, activeModal: 'insolvency', closeModal: vi.fn() });
      const playersInfoMap: Record<string, PlayerHudInfo> = {
        'p1': { ...makeHud('p1', 'Người Chơi 1', -500, '#38BDF8', false), bankrupt: false },
      };
      const delta: DeltaPayload = { tick: 1, cells: [], players: [{ id: 'p1', position: 5, balance: 200 }] };

      applyPlayerDeltas(delta, state, playersInfoMap, false);

      expect(mockAddFloatingText).toHaveBeenCalledWith(expect.objectContaining({
        actionType: 'debt_relief',
        title: 'Thoát vỡ nợ thành công! Hãy bấm Hết Lượt.',
        text: '+700',
      }));
      expect(state.closeModal).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // FACET 2: DUAL BADGE GENERATION & MULTI-TRANSACTION SEGREGATION (TC-230.05..TC-230.08)
  // =========================================================================
  describe('Facet 2: Dual Badge Generation & Multi-Transaction Segregation', () => {
    it('[TC-230.05/MSS][UC-GAME-020] Net diff +20 Tr. (Lương +2.000, Phạt -1.980) -> detectFinancialAndStatusActivities tạo đúng 2 entries: 1 salary (+2.000) và 1 rent/tax (-1.980)', () => {
      const prevState = createMockGameState({
        playerPositions: { 'bot-1': 39, 'p2': 1 },
        playersInfo: { 'bot-1': makeHud('bot-1', 'Bot AI 1', 10_000), 'p2': makeHud('p2', 'Chủ Đất Cần Thơ', 10_000, '#38BDF8', false, [1]) },
      });
      const nextState = createMockGameState({
        playerPositions: { 'bot-1': 1, 'p2': 1 },
        playersInfo: { 'bot-1': makeHud('bot-1', 'Bot AI 1', 10_020), 'p2': makeHud('p2', 'Chủ Đất Cần Thơ', 11_980, '#38BDF8', false, [1]) },
      });
      const delta: DeltaPayload = { tick: 1, cells: [], players: [{ id: 'bot-1', position: 1, balance: 10_020 }, { id: 'p2', position: 1, balance: 11_980 }] };

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const salaryLog = entries.find((e) => e.type === 'salary');
      const rentLog = entries.find((e) => e.type === 'rent');

      expect(salaryLog).toBeDefined();
      expect(salaryLog?.amount).toBe(2_000);
      expect(rentLog).toBeDefined();
      expect(rentLog?.amount).toBe(-1_980);
    });

    it('[TC-230.06/MSS][UC-GAME-020] Net diff +1.200 Tr. (Lương +2.000, Thuê -800) -> detectFinancialAndStatusActivities tạo đúng 2 entries: 1 salary (+2.000) và 1 rent (-800)', () => {
      const prevState = createMockGameState({
        playerPositions: { 'p1': 37, 'p2': 1 },
        playersInfo: { 'p1': makeHud('p1', 'Người Chơi 1', 10_000, '#38BDF8', false), 'p2': makeHud('p2', 'Chủ Đất Cần Thơ', 10_000, '#F59E0B', false, [1]) },
      });
      const nextState = createMockGameState({
        playerPositions: { 'p1': 1, 'p2': 1 },
        playersInfo: { 'p1': makeHud('p1', 'Người Chơi 1', 11_200, '#38BDF8', false), 'p2': makeHud('p2', 'Chủ Đất Cần Thơ', 10_800, '#F59E0B', false, [1]) },
      });
      const delta: DeltaPayload = { tick: 2, cells: [], players: [{ id: 'p1', position: 1, balance: 11_200 }, { id: 'p2', position: 1, balance: 10_800 }] };

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const salaryLog = entries.find((e) => e.type === 'salary');
      const rentLog = entries.find((e) => e.type === 'rent');

      expect(salaryLog).toBeDefined();
      expect(salaryLog?.amount).toBe(2_000);
      expect(rentLog).toBeDefined();
      expect(rentLog?.amount).toBe(-800);
    });

    it('[TC-230.07/MSS][UC-GAME-020] Net diff 0 Tr. (Lương +2.000, Thuê đúng -2.000) -> detectFinancialAndStatusActivities tạo đúng 2 entries: 1 salary (+2.000) và 1 rent (-2.000)', () => {
      const prevState = createMockGameState({
        playerPositions: { 'p1': 38, 'p2': 6 },
        playersInfo: { 'p1': makeHud('p1', 'Người Chơi 1', 10_000, '#38BDF8', false), 'p2': makeHud('p2', 'Chủ Đất Cần Thơ', 10_000, '#F59E0B', false, [6]) },
      });
      const nextState = createMockGameState({
        playerPositions: { 'p1': 6, 'p2': 6 },
        playersInfo: { 'p1': makeHud('p1', 'Người Chơi 1', 10_000, '#38BDF8', false), 'p2': makeHud('p2', 'Chủ Đất Cần Thơ', 12_000, '#F59E0B', false, [6]) },
      });
      const delta: DeltaPayload = { tick: 3, cells: [], players: [{ id: 'p1', position: 6, balance: 10_000 }, { id: 'p2', position: 6, balance: 12_000 }] };

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const salaryLog = entries.find((e) => e.type === 'salary');
      const rentLog = entries.find((e) => e.type === 'rent');

      expect(salaryLog).toBeDefined();
      expect(salaryLog?.amount).toBe(2_000);
      expect(rentLog).toBeDefined();
      expect(rentLog?.amount).toBe(-2_000);
    });

    it('[TC-230.08/MSS][UC-GAME-020] Net diff -1.750 Tr. (Lương +2.000, Thuê -3.750) -> detectFinancialAndStatusActivities tạo đúng 2 entries: 1 salary (+2.000) và 1 rent (-3.750)', () => {
      const prevState = createMockGameState({
        playerPositions: { 'p1': 38, 'p2': 6 },
        playersInfo: { 'p1': makeHud('p1', 'Người Chơi 1', 10_000, '#38BDF8', false), 'p2': makeHud('p2', 'Chủ Đất Cần Thơ', 10_000, '#F59E0B', false, [6]) },
      });
      const nextState = createMockGameState({
        playerPositions: { 'p1': 6, 'p2': 6 },
        playersInfo: { 'p1': makeHud('p1', 'Người Chơi 1', 8_250, '#38BDF8', false), 'p2': makeHud('p2', 'Chủ Đất Cần Thơ', 13_750, '#F59E0B', false, [6]) },
      });
      const delta: DeltaPayload = { tick: 4, cells: [], players: [{ id: 'p1', position: 6, balance: 8_250 }, { id: 'p2', position: 6, balance: 13_750 }] };

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const salaryLog = entries.find((e) => e.type === 'salary');
      const rentLog = entries.find((e) => e.type === 'rent');

      expect(salaryLog).toBeDefined();
      expect(salaryLog?.amount).toBe(2_000);
      expect(rentLog).toBeDefined();
      expect(rentLog?.amount).toBe(-3_750);
    });
  });

  // =========================================================================
  // FACET 3: CHRONOLOGICAL PAWN PACING & STAGGERED DELAY DISPATCH (TC-230.09..TC-230.12)
  // =========================================================================
  describe('Facet 3: Chronological Pawn Pacing & Staggered Delay Dispatch', () => {
    it('[TC-230.09/MSS][UC-GAME-020] getPawnPassGoDelay với pendingPawnMove từ ô 38 đến ô 6 (2 bước tới GO / 8 bước) -> passGoDelay < landingDelay', () => {
      useGameStore.setState({
        pendingPawnMove: { playerId: 'p1', fromCell: 38, targetCell: 6, isBot: false },
        activePawnAnimation: null,
        isRolling: false,
      });

      expect(getPawnPassGoDelay).toBeDefined();
      const passGoDelay = getPawnPassGoDelay!('p1');
      const landingDelay = ActivityBadgeDispatcher.getPawnLandingDelay('p1');

      expect(passGoDelay).toBe(460); // 2 steps * 230ms
      expect(landingDelay).toBe(1840); // 8 steps * 230ms
      expect(passGoDelay).toBeLessThan(landingDelay);
    });

    it('[TC-230.10/MSS][UC-GAME-020] getPawnPassGoDelay với activePawnAnimation (pendingPawnMove = null) -> tính đúng thời gian còn lại tới GO, không rơi vào fallback 0.5 * landingDelay', () => {
      useGameStore.setState({
        pendingPawnMove: null,
        activePawnAnimation: {
          playerId: 'p1', fromCell: 38, targetCell: 6,
          waypoints: [39, 0, 1, 2, 3, 4, 5, 6], currentIndex: 0,
          isBot: false, isAnimating: true,
        },
        isRolling: false,
      });

      expect(getPawnPassGoDelay).toBeDefined();
      const passGoDelay = getPawnPassGoDelay!('p1');
      const landingDelay = ActivityBadgeDispatcher.getPawnLandingDelay('p1');

      expect(passGoDelay).toBe(460); // 2 steps * 230ms
      expect(passGoDelay).not.toBe(Math.round(landingDelay * 0.5));
    });

    it('[TC-230.11/MSS][UC-GAME-020] getPawnPassGoDelay khi cờ đáp thẳng ô 0, khi nằm trong queue, và an toàn 0ms khi không có hoạt ảnh', () => {
      // 1. Cờ từ ô 38 đáp thẳng ô 0 -> passGoDelay === landingDelay
      useGameStore.setState({
        pendingPawnMove: { playerId: 'p1', fromCell: 38, targetCell: 0, isBot: false },
        activePawnAnimation: null,
        pawnAnimationQueue: [],
        isRolling: false,
      });
      expect(getPawnPassGoDelay).toBeDefined();
      const passGoDelay = getPawnPassGoDelay!('p1');
      const landingDelay = ActivityBadgeDispatcher.getPawnLandingDelay('p1');
      expect(passGoDelay).toBe(460); // 2 steps to 0
      expect(passGoDelay).toBe(landingDelay);

      // 2. [Phản biện 1] Hoạt ảnh nằm trong pawnAnimationQueue (Pha 3)
      useGameStore.setState({
        pendingPawnMove: null,
        activePawnAnimation: null,
        pawnAnimationQueue: [
          { playerId: 'p1', fromCell: 38, targetCell: 6, waypoints: [39, 0, 1, 2, 3, 4, 5, 6], isBot: false },
        ],
      });
      expect(getPawnPassGoDelay!('p1')).toBe(460);

      // 3. [Phản biện 1] Fallback an toàn: Không có hoạt ảnh hoặc không qua GO -> trả về 0 ms
      useGameStore.setState({ pendingPawnMove: null, activePawnAnimation: null, pawnAnimationQueue: [] });
      expect(getPawnPassGoDelay!('p1')).toBe(0);
    });

    it('[TC-230.12/MSS][UC-GAME-020] handleSalaryBadge đăng ký lịch phát tại getPawnPassGoDelay, phát chuông SoundEngine.playVictoryChime và hiển thị badge Lương', () => {
      const chimeSpy = vi.spyOn(SoundEngine, 'playVictoryChime').mockImplementation(() => {});
      const mockState = createMockGameState();

      useGameStore.setState({ pendingPawnMove: { playerId: 'p1', fromCell: 38, targetCell: 6, isBot: false } });

      expect(handleSalaryBadge).toBeDefined();
      handleSalaryBadge!({
        id: 'salary_act_1', timestamp: Date.now(), type: 'salary',
        message: 'Hoàn thành 1 vòng', playerId: 'p1', amount: 2000,
      }, mockState);

      // Before delay (at t = 459ms), not called yet
      vi.advanceTimersByTime(459);
      expect(chimeSpy).not.toHaveBeenCalled();
      expect(mockState.addFloatingText).not.toHaveBeenCalled();

      // At t = 460ms, called!
      vi.advanceTimersByTime(1);
      expect(chimeSpy).toHaveBeenCalledTimes(1);
      expect(mockState.addFloatingText).toHaveBeenCalledWith(expect.objectContaining({
        actionType: 'salary',
        title: 'Lương Vượt Ô Bắt Đầu',
        formula: 'Hoàn thành 1 vòng sa bàn (+2.000 Tr.)',
      }));
    });
  });

  // =========================================================================
  // FACET 4: FLOATINGNUMBERSOVERLAY & VISUAL PRESENTATION (TC-230.13..TC-230.14)
  // =========================================================================
  describe('Facet 4: FloatingNumbersOverlay & Visual Presentation', () => {
    it('[TC-230.13/MSS][UC-GAME-020] Khi nhận cả 2 badge (Lương +2.000 và Trả thuê -1.980), FloatingBadge kết xuất đúng công thức và dòng tiền của từng badge (không bị gộp nhầm thành +20)', () => {
      useGameStore.setState({
        playersInfo: {
          'p1': makeHud('p1', 'Người Chơi 1', 10_020, '#38BDF8', false),
          'p2': makeHud('p2', 'Chủ Đất Cần Thơ', 11_980, '#F59E0B', false, [1]),
        },
      });

      const salaryItem: FloatingTextItem = {
        id: 'badge_sal_1', playerId: 'p1', text: '+2.000 Tr.', type: FloatingTextType.Reward,
        actionType: 'salary', title: 'Lương Vượt Ô Bắt Đầu', formula: 'Hoàn thành 1 vòng sa bàn (+2.000 Tr.)', timestamp: Date.now(),
      };
      const rentItem: FloatingTextItem = {
        id: 'badge_rent_1', playerId: 'p1', text: '-1.980 Tr.', type: FloatingTextType.Penalty,
        actionType: 'rent_pay', title: 'Trả thuê Cần Thơ', targetPlayerId: 'p2', targetPlayerName: 'Chủ Đất Cần Thơ', cellIndex: 1, timestamp: Date.now(),
      };

      const salaryHtml = renderToStaticMarkup(React.createElement(FloatingBadge, { item: salaryItem }));
      const rentHtml = renderToStaticMarkup(React.createElement(FloatingBadge, { item: rentItem }));

      expect(salaryHtml).toContain('+2.000 Tr.');
      expect(salaryHtml).not.toContain('+20 Tr.');
      expect(rentHtml).toContain('-1.980 Tr.');
      expect(rentHtml).not.toContain('+20 Tr.');
    });

    it('[TC-230.14/MSS][UC-GAME-020] FloatingBadge cho salary hiển thị icon 🚩 theo transaction_narrative, danh mục LƯƠNG KHỞI HÀNH, và công thức Hoàn thành 1 vòng sa bàn (+2.000 Tr.)', () => {
      useGameStore.setState({ playersInfo: { 'p1': makeHud('p1', 'Người Chơi 1', 12_000, '#38BDF8', false) } });

      const salaryItem: FloatingTextItem = {
        id: 'badge_sal_2', playerId: 'p1', text: '+2.000 Tr.', type: FloatingTextType.Reward,
        actionType: 'salary', title: 'Lương Vượt Ô Bắt Đầu', formula: 'Hoàn thành 1 vòng sa bàn (+2.000 Tr.)', timestamp: Date.now(),
      };

      const salaryHtml = renderToStaticMarkup(React.createElement(FloatingBadge, { item: salaryItem }));

      expect(salaryHtml).toContain('🚩');
      expect(salaryHtml).toContain('LƯƠNG KHỞI HÀNH');
      expect(salaryHtml).toContain('Hoàn thành 1 vòng sa bàn (+2.000 Tr.)');
      expect(salaryHtml).toContain('data-testid="transaction-formula-line"');
    });
  });

  // =========================================================================
  // FACET 5: END-TO-END PIPELINE & ZERO MUTANT INTEGRITY (TC-230.15..TC-230.16)
  // =========================================================================
  describe('Facet 5: End-to-End Pipeline & Zero Mutant Integrity', () => {
    it('[TC-230.15/MSS][UC-GAME-020] Kịch bản thực tế người dùng báo cáo (Bot A từ ô 39 sang ô 1 Cần Thơ C3 độc quyền cước 1.980): applyDeltaToStore -> Floating texts và Activity logs hiển thị đủ cả 2 giao dịch độc lập, tuyệt đối không có dòng chữ nào Lương Vượt GO: +20', () => {
      useGameStore.setState({
        floatingTexts: [], playerPositions: { 'botA': 39, 'landlord': 1 }, levelMap: { 1: 3 },
        playersInfo: {
          'botA': makeHud('botA', 'Bot AI 1', 10_000, '#F59E0B', true),
          'landlord': makeHud('landlord', 'Đại Gia Miền Tây', 10_000, '#38BDF8', false, [1]),
        },
        activePawnAnimation: null, pendingPawnMove: null, pawnAnimationQueue: [], isRolling: false,
      });

      const delta: DeltaPayload = {
        tick: 10, cells: [],
        players: [{ id: 'botA', position: 1, balance: 10_020, isBot: true }, { id: 'landlord', position: 1, balance: 11_980 }],
      };

      applyDeltaToStore(delta, useGameStore);

      const immediateTexts = useGameStore.getState().floatingTexts;
      const falseSalaryBadge = immediateTexts.find((ft) => ft.text === '+20' || ft.text === '+20 Tr.' || ft.title === 'Lương Vượt GO');
      expect(falseSalaryBadge).toBeUndefined();

      vi.runAllTimers();

      const logs = useActivityStore.getState().activityLogs;
      const salaryLog = logs.find((l) => l.type === 'salary');
      const rentLog = logs.find((l) => l.type === 'rent');

      expect(salaryLog).toBeDefined();
      expect(salaryLog?.amount).toBe(2000);
      expect(rentLog).toBeDefined();
      expect(rentLog?.amount).toBe(-1980);
    });

    it('[TC-230.16/MSS][UC-GAME-020] Bảo toàn bảo lãnh kiểm toán, thuế đất và mua bán BĐS không bị ảnh hưởng bởi việc dọn dẹp syncPlayerBalanceDiff (notifyBalanceChange facade backwards compatibility)', () => {
      const mockAddFloatingText = vi.fn();
      const mockState = createMockGameState({ addFloatingText: mockAddFloatingText });

      notifyBalanceChange(mockState, 'p1', -500, 10000, 9500, { isBail: true, cellIndex: 10 });
      expect(mockAddFloatingText).toHaveBeenCalledWith(expect.objectContaining({ actionType: 'bail', title: 'Bảo Lãnh Kiểm Toán', text: '-500' }));

      notifyBalanceChange(mockState, 'p1', -200, 10000, 9800, { cellIndex: 4 });
      expect(mockAddFloatingText).toHaveBeenCalledWith(expect.objectContaining({ actionType: 'tax', title: 'Lệ Phí Đất Đai', text: '-200' }));

      notifyBalanceChange(mockState, 'p1', 1000, 5000, 6000, { actionType: 'stimulus', title: 'Trợ cấp' });
      expect(mockAddFloatingText).toHaveBeenCalledWith(expect.objectContaining({ actionType: 'stimulus', title: 'Trợ cấp', text: '+1.000' }));
    });
  });
});
