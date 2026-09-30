// [TC-234.01/MSS..TC-234.16/MSS][UC-GAME-020] Universal 5-Facet Contract Suite:
// IMP-234: Đồng Bộ Lương Vượt GO Động, Tách Bạch Phiếu Phạt Cơ Hội & Hiển Thị Đa Huy Hiệu Trên Mobile
// Reference: docs/plans/improvements/IMP-234-dynamic-go-salary-and-penalty-distinction_plan.md

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Server Domain & Network Imports
import { createRoom, type Room, type Player } from '../../src/domain/room.js';
import { executeTurnRoll } from '../../src/server/turn_loop.js';
import { RoomManager, type RollResult } from '../../src/server/room_manager.js';
import { SessionManager, type DeltaPayload } from '../../src/server/session_manager.js';
import { DeltaBroadcaster, buildSparseDelta } from '../../src/server/network/delta_broadcaster.js';
import { AdminManager } from '../../src/server/network/admin_manager.js';
import { SocketRegistry } from '../../src/server/network/socket_registry.js';
import { IntentGuard } from '../../src/server/security/intent_guard.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { handleIntentMsg, type IntentHandlerDeps } from '../../src/server/network/wss_intent_handler.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data.js';

// Client Domain, Network & UI Imports
import * as ActivityBadgeDispatcher from '../../src/client/network/activity_badge_dispatcher.js';
import {
  handleSalaryBadge,
  dispatchActivityFloatingBadges,
  clearPendingBadgeTimers,
} from '../../src/client/network/activity_badge_dispatcher.js';
import { executeCellLanding } from '../../src/client/offline_landing.js';
import {
  processPayerFee,
  matchRentTransactions,
  type BalanceDelta,
  type PropertyFinancialContext,
} from '../../src/client/network/activity_rent_matcher.js';
import { trackDeltaActivities } from '../../src/client/network/activity_tracker.js';
import { syncEventCard } from '../../src/client/network/apply_delta.js';
import { FloatingNumbersOverlay } from '../../src/client/ui/floating_numbers.js';
import { GameRulesModal } from '../../src/client/ui/modals/game_rules_modal.js';
import {
  useGameStore,
  type GameState,
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
} from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { useActivityStore, type ActivityLogEntry } from '../../src/client/store/activity_store.js';

const makeHud = (
  id: string, name: string, balance: number, color = '#F59E0B', isBot = true, owned: number[] = [],
): PlayerHudInfo => ({
  id, name, balance, tokenColor: color, ownedProperties: owned, mortgagedProperties: [], isBot,
});

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    levelMap: {},
    playerPositions: { 'bot-1': 0, 'bot_2': 0, p1: 0, p2: 0 },
    dice: [1, 1],
    playersInfo: {
      'bot-1': makeHud('bot-1', 'Bot AI 1', 10_000, '#F59E0B', true),
      bot_2: makeHud('bot_2', 'Bot AI 2', 10_000, '#EF4444', true),
      p1: makeHud('p1', 'Người Chơi 1', 10_000, '#38BDF8', false),
      p2: makeHud('p2', 'Chủ Đất Cần Thơ', 10_000, '#10B981', false, [1]),
    },
    currentTurnPlayerId: 'p1',
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
    lastEventCard: null,
    activeModifiers: [],
    ...overrides,
  } as unknown as GameState;
}

function mockDiceRng(die1: number, die2: number): () => number {
  let count = 0;
  return () => {
    count++;
    return count % 2 === 1 ? (die1 - 1) / 6 + 0.01 : (die2 - 1) / 6 + 0.01;
  };
}

import type { WebSocket as WsWebSocket } from 'ws';

function createMockWebSocket(): WsWebSocket {
  return {
    readyState: 1, // WebSocket.OPEN
    send: vi.fn(),
    close: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
  } as unknown as WsWebSocket; // Mock socket boundary for intentional headless event testing
}

describe('[TC-234/CONTRACT][UC-GAME-020] IMP-234: Dynamic GO Salary, Card Penalty Distinction & Mobile Badges', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearPendingBadgeTimers();
    useActivityStore.setState({
      activityLogs: [],
      isActivityFeedOpen: false,
      unreadCount: 0,
      activeFilter: 'all',
    });
    useGameStore.setState({
      floatingTexts: [],
      activePawnAnimation: null,
      pendingPawnMove: null,
      pawnAnimationQueue: [],
      isRolling: false,
      activeModal: null,
      lastEventCard: null,
      roundNumber: 1,
      currentTurnPlayerId: 'p1',
      activeModifiers: [],
      playersInfo: {
        p1: makeHud('p1', 'Người Chơi 1', 10_000, '#38BDF8', false),
        bot_2: makeHud('bot_2', 'Bot AI 2', 10_000, '#EF4444', true),
      },
    });
    useLobbyStore.setState({ myPlayerId: 'p1' });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: TÍNH TOÁN & ĐỒNG BỘ LƯƠNG GO ĐỘNG THEO VÒNG (TC-234.01..TC-234.04)
  // =========================================================================
  describe('Facet 1: Tính Toán & Đồng Bộ Lương GO Động Theo Vòng (Server & Client Sync)', () => {
    const createRollSetup = (roundCount: number) => {
      const room = createRoom(`host_round${roundCount}`);
      room.started = true;
      room.roundCount = roundCount;
      const player = room.players[0]!;
      player.position = 38;
      player.balance = 10_000;
      return {
        room, player,
        reg: new Map() as PropertyRegistry,
        sm: new Map() as PropertyStateMap,
        rolled: new Map<string, boolean>(),
        rng: mockDiceRng(2, 2),
        deckRng: () => 0.5,
      };
    };

    it('[TC-234.01/MSS][UC-GAME-020][Facet-1/Round1To20SalaryIs2000]: Vòng 15, khi gọi executeTurnRoll vượt qua GO, kết quả trả về có passedGo === true và passedGoSalary === 2000', () => {
      const { room, player, reg, sm, rng, deckRng, rolled } = createRollSetup(15);
      const rollResult = executeTurnRoll(room, player, reg, sm, rng, deckRng, rolled, room.roomCode);
      expect(rollResult?.passedGo).toBe(true);
      expect(rollResult?.passedGoSalary).toBe(2_000);
    });

    it('[TC-234.02/MSS][UC-GAME-020][Facet-1/Round21To30SalaryIs1500]: Vòng 25, khi gọi executeTurnRoll vượt qua GO, kết quả trả về có passedGoSalary === 1500', () => {
      const { room, player, reg, sm, rng, deckRng, rolled } = createRollSetup(25);
      const rollResult = executeTurnRoll(room, player, reg, sm, rng, deckRng, rolled, room.roomCode);
      expect(rollResult?.passedGo).toBe(true);
      expect(rollResult?.passedGoSalary).toBe(1_500);
    });

    it('[TC-234.03/MSS][UC-GAME-020][Facet-1/Round31PlusSalaryIs1000]: Vòng 35, khi gọi executeTurnRoll vượt qua GO, kết quả trả về có passedGoSalary === 1000', () => {
      const { room, player, reg, sm, rng, deckRng, rolled } = createRollSetup(35);
      const rollResult = executeTurnRoll(room, player, reg, sm, rng, deckRng, rolled, room.roomCode);
      expect(rollResult?.passedGo).toBe(true);
      expect(rollResult?.passedGoSalary).toBe(1_000);
    });

    it('[TC-234.04/MSS][UC-GAME-020][Facet-1/WssIntentSummaryDynamicText]: Khi roll.passedGo === true và roll.passedGoSalary === 1500, chuỗi tóm tắt wss intent chứa \'(Qua ô Bắt Đầu +1.500)\', không hardcode 2000', async () => {
      const roomManager = new RoomManager();
      const sessionManager = new SessionManager();
      const broadcaster = new DeltaBroadcaster(roomManager, sessionManager, () => {});
      const adminManager = new AdminManager({ roomManager, secret: 'test-admin-secret' });
      const sockets = new SocketRegistry();
      const mockWs = createMockWebSocket();

      const room = roomManager.createRoom('HOST_ALICE', 'Alice');
      roomManager.joinRoom(room.roomCode, 'PLAYER_BOB');
      roomManager.startGame(room.roomCode);
      sockets.bind(room.roomCode, 'HOST_ALICE', mockWs);

      const deps: IntentHandlerDeps = {
        rooms: roomManager,
        intentGuard: new IntentGuard(),
        intentMutex: new IntentMutex(),
        broadcaster,
        adminManager,
        sockets,
        sendSafe: vi.fn(),
        bindSocket: (rc, pid, s) => sockets.bind(rc, pid, s),
        scheduleBotTurn: vi.fn(),
        broadcastGameOver: vi.fn(),
      };

      vi.spyOn(roomManager, 'handleRollDice').mockReturnValue({
        dice: { total: 4, die1: 2, die2: 2, isDouble: true },
        player: { id: 'HOST_ALICE', position: 2, balance: 11_500 },
        passedGo: true,
        passedGoSalary: 1500,
        rentCharged: 2500,
      } as RollResult);

      await handleIntentMsg(deps, mockWs, {
        type: 'INTENT',
        playerId: 'HOST_ALICE',
        roomCode: room.roomCode,
        intent: { type: 'INTENT_ROLL' },
      });

      const logs = adminManager.getRecentLogs(room.roomCode);
      const rollLog = logs.find((l) => l.action === 'INTENT_ROLL');

      expect(rollLog?.payloadSummary).toContain('(Trả tiền thuê 2.500)');
      expect(rollLog?.payloadSummary).toContain('(Qua ô Bắt Đầu +1.500)');
      expect(rollLog?.payloadSummary).toContain('Số dư: 11.500');

      // Broadcaster Sparse Delta Pipeline Gate (Station 3 Wire Parity)
      const prevDelta: DeltaPayload = { tick: 1, cells: [] };
      const nextDelta: DeltaPayload = { tick: 2, cells: [], passedGoSalary: 1500 };
      const sparse = buildSparseDelta(prevDelta, nextDelta);
      expect(sparse.passedGoSalary).toBe(1500);
    });
  });

  // =========================================================================
  // FACET 2: ĐỊNH DẠNG HUY HIỆU LƯƠNG PHÍA CLIENT (TC-234.05..TC-234.07)
  // =========================================================================
  describe('Facet 2: Định Dạng Huy Hiệu Lương Phía Client (Dynamic Formula & Text)', () => {
    it('[TC-234.05/MSS][UC-GAME-020][Facet-2/SalaryBadgeFormatsDynamicFormula]: Khi act.amount === 1500, handleSalaryBadge gọi state.addFloatingText với formula: \'Hoàn thành 1 vòng sa bàn (+1.500 Tr.)\' và text: \'+1.500\'', () => {
      const mockAddFloatingText = vi.fn();
      const mockState = createMockGameState({ addFloatingText: mockAddFloatingText });
      useGameStore.setState({ pendingPawnMove: null, activePawnAnimation: null, pawnAnimationQueue: [] });

      handleSalaryBadge(
        {
          id: 'salary_act_1500',
          timestamp: Date.now(),
          type: 'salary',
          message: 'Hoàn thành 1 vòng',
          playerId: 'p1',
          amount: 1500,
        },
        mockState,
      );

      vi.runAllTimers();

      expect(mockAddFloatingText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: '+1.500',
          formula: 'Hoàn thành 1 vòng sa bàn (+1.500 Tr.)',
        }),
      );
    });

    it('[TC-234.06/MSS][UC-GAME-020][Facet-2/SalaryBadgeFormats1000Formula]: Khi act.amount === 1000, handleSalaryBadge gọi state.addFloatingText với formula: \'Hoàn thành 1 vòng sa bàn (+1.000 Tr.)\' và text: \'+1.000\'', () => {
      const mockAddFloatingText = vi.fn();
      const mockState = createMockGameState({ addFloatingText: mockAddFloatingText });
      useGameStore.setState({ pendingPawnMove: null, activePawnAnimation: null, pawnAnimationQueue: [] });

      handleSalaryBadge(
        {
          id: 'salary_act_1000',
          timestamp: Date.now(),
          type: 'salary',
          message: 'Hoàn thành 1 vòng',
          playerId: 'p1',
          amount: 1000,
        },
        mockState,
      );

      vi.runAllTimers();

      expect(mockAddFloatingText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: '+1.000',
          formula: 'Hoàn thành 1 vòng sa bàn (+1.000 Tr.)',
        }),
      );
    });

    it('[TC-234.07/MSS][UC-GAME-020][Facet-2/OfflineLandingDynamicSalary]: Khi ở vòng 25 (state.roundNumber = 25), executeCellLanding khi qua ô GO cộng đúng 1.500 tiền lương thay vì 2.000', () => {
      useGameStore.setState({
        roundNumber: 25,
        currentTurnPlayerId: 'p1',
        playersInfo: {
          p1: makeHud('p1', 'Người Chơi 1', 10_000, '#38BDF8', false),
        },
        floatingTexts: [],
      });

      executeCellLanding('p1', 0, 'p1', false);

      const p1 = useGameStore.getState().playersInfo['p1'];
      expect(p1?.balance).toBe(11_500);
    });
  });

  // =========================================================================
  // FACET 3: TÁCH BẠCH & ĐỊNH DANH PHIẾU PHẠT SỰ KIỆN (TC-234.08..TC-234.10)
  // =========================================================================
  describe('Facet 3: Tách Bạch & Định Danh Phiếu Phạt Sự Kiện (Card Penalty Distinction)', () => {
    it('[TC-234.08/MSS][UC-GAME-020][Facet-3/ChancePenaltyTitledAccurately]: Bot qua GO nhận 2.000, đồng thời bốc thẻ phạt chạy quá tốc độ 500 (delta.lastEventCard có drawnBy trùng bot và effectDelta === -500), processPayerFee trả về ActivityLogEntry có type === \'card\' và amount === -500, không gán nhãn thành tax', () => {
      const payer: BalanceDelta = {
        id: 'bot_2',
        diff: -500,
        cellIndex: 7,
        pInfo: makeHud('bot_2', 'Bot AI 2', 10_000),
      };
      const context: PropertyFinancialContext = {
        mortgagedCells: [],
        boughtCellIndices: [],
        upgradedCells: [],
        unmortgagedCells: [],
      };
      const delta: DeltaPayload = {
        tick: 20,
        cells: [],
        players: [{ id: 'bot_2', position: 7, balance: 9_500 }],
        currentTurnPlayerId: 'bot_2',
        lastEventCard: {
          id: 'cc_speeding',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'cc_speeding',
          title: 'Chạy quá tốc độ',
          description: 'Nộp phạt 500 Tr. vào Kho Bạc',
          effectDelta: -500,
          drawnBy: 'bot_2',
        },
      };

      const entry = processPayerFee(payer, context, delta);

      expect(entry).not.toBeNull();
      expect(entry?.type).toBe('card');
      expect(entry?.amount).toBe(-500);
      expect(entry?.message).toContain('Chạy quá tốc độ');
    });

    it('[TC-234.09/MSS][UC-GAME-020][Facet-3/CardPenaltyBadgeDisplaysTitle]: handleCardPenaltyBadge (hoặc badge dispatcher khi act.type === \'card\' và act.amount < 0) phát floating text mang title: \'Nộp Phạt: Chạy quá tốc độ ➔ Kho Bạc\' và actionType: \'chance\'', () => {
      const mockAddFloatingText = vi.fn();
      const mockState = createMockGameState({ addFloatingText: mockAddFloatingText });
      useGameStore.setState({ pendingPawnMove: null, activePawnAnimation: null, pawnAnimationQueue: [] });

      const cardAct: ActivityLogEntry = {
        id: 'card_penalty_101',
        timestamp: Date.now(),
        type: 'card',
        message: '🎟️ Bot AI 2 đã nộp phạt 500 (Chạy quá tốc độ)',
        playerId: 'bot_2',
        amount: -500,
        cellIndex: 7,
      };

      dispatchActivityFloatingBadges([cardAct], mockState);
      vi.runAllTimers();

      expect(mockAddFloatingText).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'chance',
          title: 'Nộp Phạt: Chạy quá tốc độ ➔ Kho Bạc',
        }),
      );
    });

    it('[TC-234.10/MSS][UC-GAME-020][Facet-3/ZeroDuplicateCardFloatingText]: Khi nhận delta chứa lastEventCard cho Bot, syncEventCard phát toast durationMs: 2500, và trackDeltaActivities không phát thêm floating text trùng lặp thứ 2 (durationMs: 4800)', () => {
      const mockAddFloatingText = vi.fn();
      const prevState = createMockGameState();
      const nextState = createMockGameState({ addFloatingText: mockAddFloatingText });

      const delta: DeltaPayload = {
        tick: 22,
        cells: [],
        currentTurnPlayerId: 'bot_2',
        lastEventCard: {
          id: 'cc_speeding',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'cc_speeding',
          title: 'Chạy quá tốc độ',
          description: 'Nộp phạt 500 Tr.',
          effectDelta: -500,
          drawnBy: 'bot_2',
        },
      };

      trackDeltaActivities(delta, prevState, nextState);

      expect(mockAddFloatingText).not.toHaveBeenCalledWith(
        expect.objectContaining({
          durationMs: 4800,
        }),
      );
    });
  });

  // =========================================================================
  // FACET 4: CÔNG THÁI HỌC & HIỂN THỊ ĐA HUY HIỆU TRÊN MOBILE (TC-234.11..TC-234.13)
  // =========================================================================
  describe('Facet 4: Công Thái Học & Hiển Thị Đa Huy Hiệu Trên Mobile (Mobile Responsive Visibility)', () => {
    it('[TC-234.11/MSS][UC-GAME-020][Facet-4/MobileRendersBothSalaryAndPenaltyBadges]: Khi không có milestone và floatingTexts có 2 mục (Lương + Phạt), cả 2 item đều không bị gán class \'hidden md:flex\' và đều hiển thị trên Mobile', () => {
      useGameStore.setState({
        floatingTexts: [
          {
            id: 'badge_sal_11',
            playerId: 'bot-1',
            text: '+2.000',
            type: FloatingTextType.Reward,
            actionType: 'salary',
            title: 'Lương Vượt Ô Bắt Đầu',
            timestamp: Date.now(),
          },
          {
            id: 'badge_tax_11',
            playerId: 'bot-1',
            text: '-500',
            type: FloatingTextType.Penalty,
            actionType: 'tax',
            title: 'Lệ Phí Đăng Ký Đất Đai',
            timestamp: Date.now() + 1,
          },
        ],
        activeModal: null,
      });

      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));

      expect(html).not.toContain('hidden md:flex');
    });

    it('[TC-234.12/MSS][UC-GAME-020][Facet-4/MobileRendersMilestoneAndLatestBadge]: Khi có milestone và floatingTexts có 2 regular items, item thứ 2 (gần nhất) không bị ẩn trên mobile, cùng hiển thị với milestone banner', () => {
      const milestoneItem: FloatingTextItem = {
        id: 'badge_chance_milestone', playerId: 'bot-1', text: 'Phạt tốc độ 500',
        type: FloatingTextType.Penalty, actionType: 'chance', title: 'Cơ Hội: Chạy Quá Tốc Độ', timestamp: Date.now(),
      };
      const regularSalItem: FloatingTextItem = {
        id: 'badge_regular_sal', playerId: 'bot-1', text: '+2.000',
        type: FloatingTextType.Reward, actionType: 'salary', title: 'Lương Vượt Ô Bắt Đầu', timestamp: Date.now() + 1,
      };
      const regularTaxItem: FloatingTextItem = {
        id: 'badge_regular_tax', playerId: 'bot-1', text: '-500',
        type: FloatingTextType.Penalty, actionType: 'tax', title: 'Lệ Phí Đăng Ký Đất Đai', timestamp: Date.now() + 2,
      };

      useGameStore.setState({
        floatingTexts: [milestoneItem, regularSalItem, regularTaxItem],
        activeModal: null,
      });

      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));

      expect(html).toContain('data-testid="milestone-banner-container"');
      const hiddenMatches = html.match(/hidden md:flex/g) || [];
      expect(hiddenMatches.length).toBe(1);
    });

    it('[TC-234.13/MSS][UC-GAME-020][Facet-4/SSRHeadlessRenderSafety]: Render SSR FloatingNumbersOverlay khi có đồng thời cả lương và phạt chạy 100% không lỗi', () => {
      useGameStore.setState({
        floatingTexts: [
          {
            id: 'sal_badge_ssr',
            playerId: 'p1',
            text: '+2.000 Tr.',
            type: FloatingTextType.Reward,
            actionType: 'salary',
            title: 'Lương Vượt Ô Bắt Đầu',
            formula: 'Hoàn thành 1 vòng sa bàn (+2.000 Tr.)',
            timestamp: Date.now(),
          },
          {
            id: 'pen_badge_ssr',
            playerId: 'p1',
            text: '-500 Tr.',
            type: FloatingTextType.Penalty,
            actionType: 'tax',
            title: 'Lệ Phí Đất Đai',
            timestamp: Date.now() + 1,
          },
        ],
        activeModal: null,
      });

      expect(() => {
        const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
        expect(html).toContain('vtcoon-floating-numbers');
        expect(html).toContain('data-testid="floating-numbers-overlay"');
      }).not.toThrow();
    });
  });

  // =========================================================================
  // FACET 5: ĐỘ BỀN VỮNG & BẢO TOÀN LUẬT CHƠI (TC-234.14..TC-234.16)
  // =========================================================================
  describe('Facet 5: Độ Bền Vững & Bảo Toàn Luật Chơi (Robustness & Regression Guard)', () => {
    it('[TC-234.14/MSS][UC-GAME-020][Facet-5/Imp205BotToastsPreserved]: Toàn bộ hành vi phát toast bot trong syncEventCard vẫn giữ nguyên durationMs: 2500 và type theo effectDelta', () => {
      useLobbyStore.setState({ myPlayerId: 'p1' });
      const mockAddFloatingText = vi.fn();
      const mockState = createMockGameState({ addFloatingText: mockAddFloatingText, lastEventCard: null });

      const delta: DeltaPayload = {
        roomCode: 'ROOM_234',
        tick: 1,
        cells: [],
        currentTurnPlayerId: 'bot_2',
        lastEventCard: {
          id: 'cc_lucky',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'cc_lucky',
          title: 'Hợp Đồng May Mắn',
          description: 'Nhận 500 Tr.',
          effectDelta: 500,
          drawnBy: 'bot_2',
        },
      };

      syncEventCard(delta, mockState);

      expect(mockAddFloatingText).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'chance',
          playerId: 'bot_2',
          durationMs: 2500,
          type: FloatingTextType.Bonus,
        }),
      );
    });

    it('[TC-234.15/MSS][UC-GAME-020][Facet-5/RentPayersSeparationRemainsIntact]: Giao dịch trả tiền thuê cho đối thủ trong matchRentTransactions tiếp tục hoạt động an toàn và không bị phân loại nhầm sang card penalty', () => {
      const payers: BalanceDelta[] = [
        {
          id: 'bot_1',
          diff: -800,
          cellIndex: 1,
          pInfo: makeHud('bot_1', 'Bot AI 1', 9_200),
        },
      ];
      const receivers: BalanceDelta[] = [
        {
          id: 'p2',
          diff: 800,
          pInfo: makeHud('p2', 'Chủ Đất', 10_800, '#10B981', false, [1]),
        },
      ];
      const prevState = createMockGameState({
        playersInfo: {
          'bot-1': makeHud('bot-1', 'Bot AI 1', 10_000),
          p2: makeHud('p2', 'Chủ Đất', 10_000, '#10B981', false, [1]),
        },
      });
      const delta: DeltaPayload = {
        tick: 1,
        cells: [{ index: 1, ownerId: 'p2' }],
      };

      const result = matchRentTransactions(payers, receivers, new Set(), new Set(), prevState, undefined, delta);

      expect(result.rentLogs).toHaveLength(1);
      expect(result.rentLogs[0]?.type).toBe('rent');
      expect(result.rentLogs[0]?.amount).toBe(-800);
      expect(result.rentLogs[0]?.type).not.toBe('card');
    });

    it('[TC-234.16/MSS][UC-GAME-020][Facet-5/GameRulesModalExplainsDynamicSalary]: Component GameRulesModal chứa văn bản giải thích rõ các mốc lương 2.000 / 1.500 / 1.000 Tr.', () => {
      const html = renderToStaticMarkup(
        React.createElement(GameRulesModal, {
          isOpen: true,
          onClose: vi.fn(),
          initialTab: 'core',
        }),
      );

      expect(html).toContain('2.000');
      expect(html).toContain('1.500');
      expect(html).toContain('1.000');
    });
  });
});
