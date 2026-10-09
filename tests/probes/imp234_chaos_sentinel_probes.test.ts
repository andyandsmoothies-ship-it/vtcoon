// [CHAOS-SENTINEL][STATION-4] Physical Adversarial Boundary & Mutation Sentinel Probe Suite
// Feature: IMP-234 (Đồng Bộ Lương Vượt GO Động, Tách Bạch Phiếu Phạt Cơ Hội & Hiển Thị Đa Huy Hiệu Trên Mobile)
//
// Rules enforced:
// 1. READ-ONLY on src/** (Zero modifications to src/**).
// 2. Real production imports only (BANNED: Inline mock mutants). Assert observable public behavior.
// 3. Probe floor >= 14 tests.
// 4. Closed-loop 5-station verification.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Domain & Server Imports
import {
  createRoom,
  calculateGoSalary,
  TurnPhase,
  type Room,
  type Player,
} from '../../src/domain/room.js';
import { executeTurnRoll } from '../../src/server/turn_loop.js';
import { RoomManager, type RollResult } from '../../src/server/room_manager.js';
import {
  SessionManager,
  buildDeltaFromRoom,
  type DeltaPayload,
} from '../../src/server/session_manager.js';
import {
  DeltaBroadcaster,
  buildSparseDelta,
} from '../../src/server/network/delta_broadcaster.js';
import { AdminManager } from '../../src/server/network/admin_manager.js';
import { SocketRegistry } from '../../src/server/network/socket_registry.js';
import { IntentGuard } from '../../src/server/security/intent_guard.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import {
  handleIntentMsg,
  type IntentHandlerDeps,
} from '../../src/server/network/wss_intent_handler.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data.js';

// Client Imports
import {
  handleSalaryBadge,
  handleCardPenaltyBadge,
  dispatchActivityFloatingBadges,
  clearPendingBadgeTimers,
  getPawnPassGoDelay,
  getPawnLandingDelay,
} from '../../src/client/network/activity_badge_dispatcher.js';
import {
  processPayerFee,
  extractPassedGoActivities,
  type BalanceDelta,
  type PropertyFinancialContext,
} from '../../src/client/network/activity_rent_matcher.js';
import { FloatingNumbersOverlay } from '../../src/client/ui/floating_numbers.js';
import {
  useGameStore,
  type GameState,
  FloatingTextType,
  type FloatingTextItem,
  type PlayerHudInfo,
} from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { useActivityStore, type ActivityLogEntry } from '../../src/client/store/activity_store.js';
import type { WebSocket as WsWebSocket } from 'ws';

function makeHud(
  id: string,
  name: string,
  balance: number,
  color = '#F59E0B',
  isBot = true,
  owned: number[] = [],
): PlayerHudInfo {
  return {
    id,
    name,
    balance,
    tokenColor: color,
    ownedProperties: owned,
    mortgagedProperties: [],
    isBot,
  };
}

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    levelMap: {},
    playerPositions: { 'bot-1': 0, bot_2: 0, p1: 0, p2: 0 },
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

function createMockWebSocket(): WsWebSocket {
  return {
    readyState: 1,
    send: vi.fn(),
    close: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    once: vi.fn(),
  } as unknown as WsWebSocket;
}

describe('IMP-234: Chaos-Sentinel Physical Adversarial Boundary & Mutation Sentinel Suite', () => {
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

  // ==========================================================================
  // PROBE 1: Wire-to-Core Closed-Loop Parity Probe (5-Station Data Pipeline)
  // ==========================================================================
  describe('Probe 1: Wire-to-Core Closed-Loop Parity Probe', () => {
    it('[PROBE-1.1][Station-1/ServerAuthoritative] Server executeTurnRoll authoritatively calculates passedGoSalary from roundCount and updates Room state', () => {
      const room = createRoom('host_s1');
      room.started = true;
      room.roundCount = 25; // Round 25 -> 1.500 Tr.
      const player = room.players[0]!;
      player.position = 38;
      player.balance = 10_000;

      const reg = new Map() as PropertyRegistry;
      const sm = new Map() as PropertyStateMap;
      const rolled = new Map<string, boolean>();
      const rng = mockDiceRng(2, 2); // 4 steps -> lands on 2, passes GO

      const rollResult = executeTurnRoll(room, player, reg, sm, rng, () => 0.5, rolled, room.roomCode);

      expect(rollResult?.passedGo).toBe(true);
      expect(rollResult?.passedGoSalary).toBe(1_500);
      expect(room.passedGoSalary).toBe(1_500);
      // 10.000 + 1.500 (salary) - 400 (EVN electric billing) = 11.100
      expect(player.balance).toBe(11_100);
    });

    it('[PROBE-1.2][Station-2/DTO_WireProtocol] buildDeltaFromRoom embeds passedGoSalary into DeltaPayload matching authoritative server state', () => {
      const room = createRoom('host_s2');
      room.started = true;
      room.roundCount = 25;
      room.passedGoSalary = 1_500;

      const reg = new Map() as PropertyRegistry;
      const sm = new Map() as PropertyStateMap;
      const delta = buildDeltaFromRoom(room, reg, sm, 1);

      expect(delta.passedGoSalary).toBe(1_500);
      expect(delta.roundNumber).toBe(25);
    });

    it('[PROBE-1.3][Station-3/NetworkBroadcaster] buildSparseDelta and broadcaster faithfully preserve passedGoSalary without omission', () => {
      const prevDelta: DeltaPayload = { tick: 1, cells: [] };
      const nextDelta: DeltaPayload = { tick: 2, cells: [], passedGoSalary: 1_500 };

      const sparse = buildSparseDelta(prevDelta, nextDelta);
      expect(sparse.passedGoSalary).toBe(1_500);

      // Verify that SessionManager broadcaster stores and preserves the payload
      const sm = new SessionManager();
      sm.broadcastDelta({ ...sparse, roomCode: 'ROOM_SPARSE' });
      expect(sm.getLastDelta()?.passedGoSalary).toBe(1_500);
    });

    it('[PROBE-1.4][Station-4/ClientMatcherParser] extractPassedGoActivities prioritizes delta.passedGoSalary and processPayerFee precisely classifies card penalty', () => {
      // 1. extractPassedGoActivities
      const prevState = createMockGameState({
        roundNumber: 10,
        playerPositions: { 'bot-1': 38 },
      });
      const nextState = createMockGameState({
        roundNumber: 25,
        playerPositions: { 'bot-1': 2 },
      });
      const delta: DeltaPayload = {
        tick: 5,
        cells: [],
        roundNumber: 25,
        passedGoSalary: 1_500,
        players: [{ id: 'bot-1', position: 2, balance: 11_500 }],
      };

      const extracted = extractPassedGoActivities(delta, prevState, nextState, [], [], new Set());
      expect(extracted.salaryLogs).toHaveLength(1);
      expect(extracted.salaryLogs[0]?.amount).toBe(1_500);
      expect(extracted.salaryLogs[0]?.type).toBe('salary');

      // 2. processPayerFee for card penalty
      const payer: BalanceDelta = {
        id: 'bot-1',
        diff: -500,
        cellIndex: 7,
        pInfo: makeHud('bot-1', 'Bot AI 1', 11_000),
      };
      const context: PropertyFinancialContext = {
        mortgagedCells: [],
        boughtCellIndices: [],
        upgradedCells: [],
        unmortgagedCells: [],
      };
      const deltaWithCard: DeltaPayload = {
        ...delta,
        lastEventCard: {
          id: 'card_fine_1',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'card_fine_1',
          title: 'Phạt Tốc Độ Cao Tốc',
          description: 'Nộp phạt 500 Tr. vào Kho Bạc',
          effectDelta: -500,
          drawnBy: 'bot-1',
        },
      };

      const feeEntry = processPayerFee(payer, context, deltaWithCard);
      expect(feeEntry).not.toBeNull();
      expect(feeEntry?.type).toBe('card');
      expect(feeEntry?.amount).toBe(-500);
      expect(feeEntry?.message).toContain('Phạt Tốc Độ Cao Tốc');
    });

    it('[PROBE-1.5][Station-5/ClientStoreAndUI] handleSalaryBadge formats dynamic formula and handleCardPenaltyBadge renders card title', () => {
      const mockAddFloatingText = vi.fn();
      const mockState = createMockGameState({ addFloatingText: mockAddFloatingText });

      // Salary badge
      handleSalaryBadge(
        {
          id: 'sal_act_dynamic',
          timestamp: Date.now(),
          type: 'salary',
          message: 'Lương Vượt GO',
          playerId: 'p1',
          amount: 1_500,
        },
        mockState,
      );
      vi.runAllTimers();

      expect(mockAddFloatingText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: '+1.500',
          formula: 'Hoàn thành 1 vòng sa bàn (+1.500 Tr.)',
          actionType: 'salary',
        }),
      );

      mockAddFloatingText.mockClear();

      // Card penalty badge
      handleCardPenaltyBadge(
        {
          id: 'pen_act_card',
          timestamp: Date.now(),
          type: 'card',
          message: '🎟️ Người Chơi 1 đã nộp phạt 500 (Nộp Phạt Môi Trường)',
          playerId: 'p1',
          amount: -500,
          cellIndex: 7,
        },
        mockState,
      );
      vi.runAllTimers();

      expect(mockAddFloatingText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: '-500',
          title: 'Nộp Phạt: Nộp Phạt Môi Trường ➔ Kho Bạc',
          actionType: 'chance',
        }),
      );
    });

    it('[PROBE-1.6][ClosedLoop-EndToEnd] Full 5-Station Data Pipeline verification: Server -> Wire -> Matcher -> UI Floating Overlay', () => {
      // Station 1: Turn loop execution at round 25
      const room = createRoom('host_e2e');
      room.started = true;
      room.roundCount = 25;
      const player = room.players[0]!;
      player.position = 38;
      player.balance = 10_000;

      const reg = new Map() as PropertyRegistry;
      const sm = new Map() as PropertyStateMap;
      const rolled = new Map<string, boolean>();
      const rng = mockDiceRng(2, 2); // passes GO to pos 2

      const rollResult = executeTurnRoll(room, player, reg, sm, rng, () => 0.5, rolled, room.roomCode);
      expect(rollResult?.passedGoSalary).toBe(1_500);

      // Station 2 & 3: Wire Delta creation & serialization
      const rawDelta = buildDeltaFromRoom(room, reg, sm, 1);
      const sparseDelta = buildSparseDelta({ tick: 0, cells: [] }, rawDelta);
      expect(sparseDelta.passedGoSalary).toBe(1_500);

      // Station 4: Client Matcher extract salary
      const prevState = createMockGameState({
        roundNumber: 24,
        playerPositions: { [player.id]: 38 },
      });
      const nextState = createMockGameState({
        roundNumber: 25,
        playerPositions: { [player.id]: 2 },
      });
      const matchRes = extractPassedGoActivities(sparseDelta, prevState, nextState, [], [], new Set());
      expect(matchRes.salaryLogs[0]?.amount).toBe(1_500);

      // Station 5: Dispatch to UI Store
      const mockAddFloatingText = vi.fn();
      const clientState = createMockGameState({ addFloatingText: mockAddFloatingText });
      dispatchActivityFloatingBadges(matchRes.salaryLogs, clientState);
      vi.runAllTimers();

      expect(mockAddFloatingText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: '+1.500',
          formula: 'Hoàn thành 1 vòng sa bàn (+1.500 Tr.)',
        }),
      );

      // Render FloatingNumbersOverlay on mobile with Salary + Penalty badge
      useGameStore.setState({
        floatingTexts: [
          {
            id: 'badge_sal_e2e',
            playerId: player.id,
            text: '+1.500',
            type: FloatingTextType.Reward,
            actionType: 'salary',
            title: 'Lương Vượt Ô Bắt Đầu',
            formula: 'Hoàn thành 1 vòng sa bàn (+1.500 Tr.)',
            timestamp: Date.now(),
          },
          {
            id: 'badge_pen_e2e',
            playerId: player.id,
            text: '-500',
            type: FloatingTextType.Penalty,
            actionType: 'chance',
            title: 'Nộp Phạt: Phạt Tốc Độ ➔ Kho Bạc',
            timestamp: Date.now() + 1,
          },
        ],
        activeModal: null,
      });

      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      // Under IMP-253, regular badge is hidden on mobile (hidden md:flex) when milestone banner is active
      expect(html).toContain('hidden md:flex');
      expect(html).toContain('+1.500');
      expect(html).toContain('-500');
    });
  });

  // ==========================================================================
  // PROBE 2: Ephemeral Dynamic Boundary Probe (Edge Values & Timing Skew)
  // ==========================================================================
  describe('Probe 2: Ephemeral Dynamic Boundary Probe', () => {
    it('[PROBE-2.1][Boundary-RoundCountSalarySteps] calculateGoSalary maps strict domain ranges: 1..20 -> 2.000, 21..30 -> 1.500, 31..100 -> 1.000', () => {
      // Tier 1: 1..20 -> 2.000
      expect(calculateGoSalary(1)).toBe(2_000);
      expect(calculateGoSalary(10)).toBe(2_000);
      expect(calculateGoSalary(20)).toBe(2_000);

      // Tier 2: 21..30 -> 1.500
      expect(calculateGoSalary(21)).toBe(1_500);
      expect(calculateGoSalary(25)).toBe(1_500);
      expect(calculateGoSalary(30)).toBe(1_500);

      // Tier 3: 31+ -> 1.000
      expect(calculateGoSalary(31)).toBe(1_000);
      expect(calculateGoSalary(40)).toBe(1_000);
      expect(calculateGoSalary(100)).toBe(1_000);
    });

    it('[PROBE-2.2][Boundary-RoundCountFallbacks] calculateGoSalary handles falsy/abnormal inputs (0, -5, NaN, undefined) falling back to 2.000', () => {
      expect(calculateGoSalary(0)).toBe(2_000);
      expect(calculateGoSalary(-5)).toBe(2_000);
      expect(calculateGoSalary(NaN)).toBe(2_000);
      expect(calculateGoSalary(undefined)).toBe(2_000);
      expect(calculateGoSalary(null as any)).toBe(2_000);
    });

    it('[PROBE-2.3][Boundary-EffectDeltaMatching] processPayerFee requires absolute match between card.effectDelta and payer.diff', () => {
      const payer: BalanceDelta = {
        id: 'bot_2',
        diff: -500,
        cellIndex: 5,
        pInfo: makeHud('bot_2', 'Bot 2', 5_000),
      };
      const context: PropertyFinancialContext = {
        mortgagedCells: [],
        boughtCellIndices: [],
        upgradedCells: [],
        unmortgagedCells: [],
      };

      // Mismatched delta (-300 vs -500)
      const deltaMismatched: DeltaPayload = {
        tick: 1,
        cells: [],
        lastEventCard: {
          id: 'card_300',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'card_300',
          title: 'Phạt Nhẹ',
          description: 'Nộp phạt 300 Tr.',
          effectDelta: -300,
          drawnBy: 'bot_2',
        },
      };
      const entryMismatched = processPayerFee(payer, context, deltaMismatched);
      expect(entryMismatched?.type).not.toBe('card');

      // Matched delta (-500 vs -500)
      const deltaMatched: DeltaPayload = {
        tick: 2,
        cells: [],
        lastEventCard: {
          id: 'card_500',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'card_500',
          title: 'Phạt Chuẩn',
          description: 'Nộp phạt 500 Tr.',
          effectDelta: -500,
          drawnBy: 'bot_2',
        },
      };
      const entryMatched = processPayerFee(payer, context, deltaMatched);
      expect(entryMatched?.type).toBe('card');
      expect(entryMatched?.amount).toBe(-500);
    });

    it('[PROBE-2.4][Boundary-DrawnByStrictIsolation] processPayerFee strictly verifies card is drawn by payer (drawnBy === payer.id || playerId === payer.id)', () => {
      const payer: BalanceDelta = {
        id: 'bot_1',
        diff: -500,
        cellIndex: 5,
        pInfo: makeHud('bot_1', 'Bot 1', 5_000),
      };
      const context: PropertyFinancialContext = {
        mortgagedCells: [],
        boughtCellIndices: [],
        upgradedCells: [],
        unmortgagedCells: [],
      };

      // Card drawn by bot_2, not bot_1
      const deltaOtherDrawn: DeltaPayload = {
        tick: 1,
        cells: [],
        lastEventCard: {
          id: 'card_other',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'card_other',
          title: 'Phạt Người Khác',
          description: 'Nộp phạt 500 Tr.',
          effectDelta: -500,
          drawnBy: 'bot_2',
        },
      };
      const resOther = processPayerFee(payer, context, deltaOtherDrawn);
      expect(resOther?.type).not.toBe('card');

      // Card drawn by payer with playerId fallback
      const deltaPlayerIdFallback: DeltaPayload = {
        tick: 2,
        cells: [],
        lastEventCard: {
          id: 'card_self',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'card_self',
          title: 'Phạt Tự Thân',
          description: 'Nộp phạt 500 Tr.',
          effectDelta: -500,
          playerId: 'bot_1',
        },
      };
      const resSelf = processPayerFee(payer, context, deltaPlayerIdFallback);
      expect(resSelf?.type).toBe('card');
      expect(resSelf?.amount).toBe(-500);
    });

    it('[PROBE-2.5][Boundary-MobileDisplayCountPermutations] FloatingNumbersOverlay handles displayItems length 0, 1, 2, 3 across milestone states', () => {
      // 1. Length 0
      useGameStore.setState({ floatingTexts: [], activeModal: null });
      const html0 = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html0).not.toContain('vtcoon-floating-badge');

      // 2. Length 1 without milestone
      const item1: FloatingTextItem = {
        id: 'item_1', playerId: 'p1', text: '+2.000', type: FloatingTextType.Reward,
        actionType: 'salary', title: 'Lương', timestamp: Date.now(),
      };
      useGameStore.setState({ floatingTexts: [item1], activeModal: null });
      const html1 = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html1).not.toContain('hidden md:flex');

      // 3. Length 3 without milestone: overlay limits displayItems to recent 2, neither is hidden on mobile
      const item2: FloatingTextItem = {
        id: 'item_2', playerId: 'p1', text: '-500', type: FloatingTextType.Penalty,
        actionType: 'tax', title: 'Thuế', timestamp: Date.now() + 1,
      };
      const item3: FloatingTextItem = {
        id: 'item_3', playerId: 'p1', text: '+1.500', type: FloatingTextType.Reward,
        actionType: 'salary', title: 'Lương 2', timestamp: Date.now() + 2,
      };
      useGameStore.setState({ floatingTexts: [item1, item2, item3], activeModal: null });
      const html3NoMilestone = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html3NoMilestone).not.toContain('hidden md:flex');

      // 4. Length 3 with milestone: overlay limits to recent 2, older of the two is hidden on mobile (total <= 2 items on mobile)
      const milestoneItem: FloatingTextItem = {
        id: 'milestone_1', playerId: 'p1', text: 'Cơ hội lớn', type: FloatingTextType.Reward,
        actionType: 'chance', title: 'Cơ Hội', timestamp: Date.now(),
      };
      useGameStore.setState({
        floatingTexts: [milestoneItem, item1, item2, item3],
        activeModal: null,
      });
      const html3WithMilestone = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      const hiddenMatches = html3WithMilestone.match(/hidden md:flex/g) || [];
      expect(hiddenMatches.length).toBe(1); // older item hidden, newest visible alongside milestone banner
      expect(html3WithMilestone).toContain('data-testid="milestone-banner-container"');
    });

    it('[PROBE-2.6][Boundary-TimingDelaysAndClockSkew] getPawnPassGoDelay and getPawnLandingDelay execute safely under null/active pawn animations', () => {
      // Without pawn animation
      useGameStore.setState({ activePawnAnimation: null });
      expect(getPawnPassGoDelay('p1')).toBe(0);
      expect(getPawnLandingDelay('p1')).toBe(0);

      // With pawn animation for another player
      useGameStore.setState({
        activePawnAnimation: {
          playerId: 'p2',
          fromCell: 0,
          waypoints: [1, 2, 3, 4, 5],
          currentIndex: 0,
          isAnimating: true,
        },
      });
      expect(getPawnPassGoDelay('p1')).toBe(0);
      expect(getPawnLandingDelay('p1')).toBe(0);

      // With pawn animation for current player
      useGameStore.setState({
        activePawnAnimation: {
          playerId: 'p1',
          fromCell: 38,
          waypoints: [39, 0, 1, 2],
          currentIndex: 0,
          isAnimating: true,
        },
      });
      expect(getPawnPassGoDelay('p1')).toBeGreaterThanOrEqual(0);
      expect(getPawnLandingDelay('p1')).toBeGreaterThanOrEqual(0);
    });
  });

  // ==========================================================================
  // PROBE 3: Targeted Mutation Sensitivity Probe (Floor >= 14 Tests)
  // Banned: Inline mock mutants. Import and test real production exports!
  // ==========================================================================
  describe('Probe 3: Targeted Mutation Sensitivity Probe (Mutants A-G Sensitivity)', () => {
    // ------------------------------------------------------------------------
    // MUTANT A: Server executeTurnRoll omits passedGoSalary or returns undefined
    // ------------------------------------------------------------------------
    it('[PROBE-3.1][MUTANT-A1] Server executeTurnRoll must define passedGoSalary = 1500 at round 25 (traps server omission)', () => {
      const room = createRoom('mutant_a1');
      room.started = true;
      room.roundCount = 25;
      const player = room.players[0]!;
      player.position = 38;
      player.balance = 10_000;

      const rollResult = executeTurnRoll(
        room,
        player,
        new Map() as PropertyRegistry,
        new Map() as PropertyStateMap,
        mockDiceRng(2, 2),
        () => 0.5,
        new Map<string, boolean>(),
        room.roomCode,
      );

      // Observable behavior assertion: MUST NOT be undefined or 2000
      expect(rollResult?.passedGoSalary).toBeDefined();
      expect(typeof rollResult?.passedGoSalary).toBe('number');
      expect(rollResult?.passedGoSalary).toBe(1_500);
    });

    it('[PROBE-3.2][MUTANT-A2] Server executeTurnRoll must define passedGoSalary = 1000 at round 35 (traps hardcoded 2000)', () => {
      const room = createRoom('mutant_a2');
      room.started = true;
      room.roundCount = 35;
      const player = room.players[0]!;
      player.position = 38;
      player.balance = 10_000;

      const rollResult = executeTurnRoll(
        room,
        player,
        new Map() as PropertyRegistry,
        new Map() as PropertyStateMap,
        mockDiceRng(2, 2),
        () => 0.5,
        new Map<string, boolean>(),
        room.roomCode,
      );

      expect(rollResult?.passedGoSalary).toBe(1_000);
      expect(rollResult?.passedGoSalary).not.toBe(2_000);
    });

    it('[PROBE-3.3][MUTANT-A3] Server executeTurnRoll updates room.passedGoSalary state synchronously', () => {
      const room = createRoom('mutant_a3');
      room.started = true;
      room.roundCount = 25;
      const player = room.players[0]!;
      player.position = 38;

      executeTurnRoll(
        room,
        player,
        new Map() as PropertyRegistry,
        new Map() as PropertyStateMap,
        mockDiceRng(2, 2),
        () => 0.5,
        new Map<string, boolean>(),
        room.roomCode,
      );

      expect(room.passedGoSalary).toBe(1_500);
    });

    it('[PROBE-3.4][MUTANT-A4] Server executeTurnRoll sets passedGoSalary = 0 and room.passedGoSalary = undefined when not passing GO', () => {
      const room = createRoom('mutant_a4');
      room.started = true;
      room.roundCount = 25;
      const player = room.players[0]!;
      player.position = 2; // from pos 2 to pos 6, does not pass GO

      const rollResult = executeTurnRoll(
        room,
        player,
        new Map() as PropertyRegistry,
        new Map() as PropertyStateMap,
        mockDiceRng(2, 2),
        () => 0.5,
        new Map<string, boolean>(),
        room.roomCode,
      );

      expect(rollResult?.passedGo).toBe(false);
      expect(rollResult?.passedGoSalary).toBe(0);
      expect(room.passedGoSalary).toBeUndefined();
    });

    // ------------------------------------------------------------------------
    // MUTANT B: buildSparseDelta or buildDeltaFromRoom drops passedGoSalary
    // ------------------------------------------------------------------------
    it('[PROBE-3.5][MUTANT-B1] buildSparseDelta strictly includes passedGoSalary when present in next delta', () => {
      const prevDelta: DeltaPayload = { tick: 1, cells: [] };
      const nextDelta: DeltaPayload = { tick: 2, cells: [], passedGoSalary: 1_500 };

      const sparse = buildSparseDelta(prevDelta, nextDelta);
      expect(sparse.passedGoSalary).toBe(1_500);
    });

    it('[PROBE-3.6][MUTANT-B2] buildSparseDelta preserves passedGoSalary = 1000 across round transitions', () => {
      const prevDelta: DeltaPayload = { tick: 10, cells: [], passedGoSalary: 1_500 };
      const nextDelta: DeltaPayload = { tick: 11, cells: [], passedGoSalary: 1_000 };

      const sparse = buildSparseDelta(prevDelta, nextDelta);
      expect(sparse.passedGoSalary).toBe(1_000);
    });

    it('[PROBE-3.7][MUTANT-B3] buildDeltaFromRoom includes passedGoSalary when room has salary defined', () => {
      const room = createRoom('mutant_b3');
      room.passedGoSalary = 1_500;

      const delta = buildDeltaFromRoom(
        room,
        new Map() as PropertyRegistry,
        new Map() as PropertyStateMap,
        1,
      );

      expect(delta.passedGoSalary).toBe(1_500);
    });

    // ------------------------------------------------------------------------
    // MUTANT C: handleSalaryBadge hardcodes '+2.000 Tr.' formula
    // ------------------------------------------------------------------------
    it('[PROBE-3.8][MUTANT-C1] handleSalaryBadge formats dynamic formula and text for 1500 (traps hardcode 2000)', () => {
      const mockAddFloatingText = vi.fn();
      const mockState = createMockGameState({ addFloatingText: mockAddFloatingText });

      handleSalaryBadge(
        {
          id: 'sal_1500',
          timestamp: Date.now(),
          type: 'salary',
          message: 'Vượt GO',
          playerId: 'p1',
          amount: 1_500,
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
      // Observable behavior: must not contain 2.000
      const callArg = mockAddFloatingText.mock.calls[0]![0];
      expect(callArg.formula).not.toContain('2.000');
    });

    it('[PROBE-3.9][MUTANT-C2] handleSalaryBadge formats dynamic formula and text for 1000', () => {
      const mockAddFloatingText = vi.fn();
      const mockState = createMockGameState({ addFloatingText: mockAddFloatingText });

      handleSalaryBadge(
        {
          id: 'sal_1000',
          timestamp: Date.now(),
          type: 'salary',
          message: 'Vượt GO',
          playerId: 'p1',
          amount: 1_000,
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

    it('[PROBE-3.10][MUTANT-C3] handleSalaryBadge falls back to 2000 when act.amount is undefined', () => {
      const mockAddFloatingText = vi.fn();
      const mockState = createMockGameState({ addFloatingText: mockAddFloatingText });

      handleSalaryBadge(
        {
          id: 'sal_fallback',
          timestamp: Date.now(),
          type: 'salary',
          message: 'Vượt GO',
          playerId: 'p1',
          amount: undefined,
        },
        mockState,
      );
      vi.runAllTimers();

      expect(mockAddFloatingText).toHaveBeenCalledWith(
        expect.objectContaining({
          text: '+2.000',
          formula: 'Hoàn thành 1 vòng sa bàn (+2.000 Tr.)',
        }),
      );
    });

    // ------------------------------------------------------------------------
    // MUTANT D: processPayerFee classifies card penalty as 'tax'
    // ------------------------------------------------------------------------
    it('[PROBE-3.11][MUTANT-D1] processPayerFee identifies negative effectDelta card as type "card", never "tax"', () => {
      const payer: BalanceDelta = {
        id: 'bot_2',
        diff: -500,
        cellIndex: 7,
        pInfo: makeHud('bot_2', 'Bot 2', 5_000),
      };
      const context: PropertyFinancialContext = {
        mortgagedCells: [],
        boughtCellIndices: [],
        upgradedCells: [],
        unmortgagedCells: [],
      };
      const delta: DeltaPayload = {
        tick: 1,
        cells: [],
        lastEventCard: {
          id: 'cc_penalty',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'cc_penalty',
          title: 'Phạt Tốc Độ',
          description: 'Nộp phạt 500 Tr.',
          effectDelta: -500,
          drawnBy: 'bot_2',
        },
      };

      const result = processPayerFee(payer, context, delta);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('card');
      expect(result?.type).not.toBe('tax');
      expect(result?.amount).toBe(-500);
    });

    it('[PROBE-3.12][MUTANT-D2] processPayerFee incorporates custom card title into message format', () => {
      const payer: BalanceDelta = {
        id: 'bot_2',
        diff: -750,
        cellIndex: 7,
        pInfo: makeHud('bot_2', 'Bot 2', 5_000),
      };
      const context: PropertyFinancialContext = {
        mortgagedCells: [],
        boughtCellIndices: [],
        upgradedCells: [],
        unmortgagedCells: [],
      };
      const delta: DeltaPayload = {
        tick: 1,
        cells: [],
        lastEventCard: {
          id: 'cc_special',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'cc_special',
          title: 'Quyên Góp Quỹ Khẩn Cấp',
          description: 'Nộp quỹ 750 Tr.',
          effectDelta: -750,
          drawnBy: 'bot_2',
        },
      };

      const result = processPayerFee(payer, context, delta);

      expect(result?.message).toContain('Quyên Góp Quỹ Khẩn Cấp');
      expect(result?.message).toContain('750');
    });

    // ------------------------------------------------------------------------
    // MUTANT E: processPayerFee fails to check card.drawnBy (cross-player contamination)
    // ------------------------------------------------------------------------
    it('[PROBE-3.13][MUTANT-E1] processPayerFee rejects card penalty when drawnBy belongs to another player', () => {
      const payer: BalanceDelta = {
        id: 'bot_1',
        diff: -500,
        cellIndex: 7,
        pInfo: makeHud('bot_1', 'Bot 1', 5_000),
      };
      const context: PropertyFinancialContext = {
        mortgagedCells: [],
        boughtCellIndices: [],
        upgradedCells: [],
        unmortgagedCells: [],
      };
      // Card drawn by bot_2
      const delta: DeltaPayload = {
        tick: 1,
        cells: [],
        lastEventCard: {
          id: 'cc_speeding',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'cc_speeding',
          title: 'Chạy Quá Tốc Độ',
          description: 'Nộp phạt 500 Tr.',
          effectDelta: -500,
          drawnBy: 'bot_2',
        },
      };

      const result = processPayerFee(payer, context, delta);

      // Must NOT be attributed to bot_1 as a card penalty
      expect(result?.type).not.toBe('card');
    });

    it('[PROBE-3.14][MUTANT-E2] processPayerFee rejects card penalty when effectDelta magnitude diverges from diff', () => {
      const payer: BalanceDelta = {
        id: 'bot_1',
        diff: -500,
        cellIndex: 7,
        pInfo: makeHud('bot_1', 'Bot 1', 5_000),
      };
      const context: PropertyFinancialContext = {
        mortgagedCells: [],
        boughtCellIndices: [],
        upgradedCells: [],
        unmortgagedCells: [],
      };
      // Card penalty is -300, but payer was deducted -500
      const delta: DeltaPayload = {
        tick: 1,
        cells: [],
        lastEventCard: {
          id: 'cc_speeding',
          type: 'Chance',
          cardType: 'chance',
          cardId: 'cc_speeding',
          title: 'Chạy Quá Tốc Độ',
          description: 'Nộp phạt 300 Tr.',
          effectDelta: -300,
          drawnBy: 'bot_1',
        },
      };

      const result = processPayerFee(payer, context, delta);

      // Invariant check: Math.abs(card.effectDelta) === absDiff must hold
      expect(result?.type).not.toBe('card');
    });

    // ------------------------------------------------------------------------
    // MUTANT F: FloatingNumbersOverlay uses old 'hidden md:flex' logic hiding salary
    // ------------------------------------------------------------------------
    it('[PROBE-3.15][MUTANT-F1] FloatingNumbersOverlay displays both salary and tax badges on mobile when latestMilestone is null', () => {
      useGameStore.setState({
        floatingTexts: [
          {
            id: 'badge_sal',
            playerId: 'bot-1',
            text: '+2.000',
            type: FloatingTextType.Reward,
            actionType: 'salary',
            title: 'Lương Vượt GO',
            timestamp: Date.now(),
          },
          {
            id: 'badge_tax',
            playerId: 'bot-1',
            text: '-500',
            type: FloatingTextType.Penalty,
            actionType: 'tax',
            title: 'Lệ Phí Đất',
            timestamp: Date.now() + 1,
          },
        ],
        activeModal: null,
      });

      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));

      // Mutant check: Old buggy code would add 'hidden md:flex' to idx 0 (salary)
      expect(html).not.toContain('hidden md:flex');
      expect(html).toContain('+2.000');
      expect(html).toContain('-500');
    });

    it('[PROBE-3.16][MUTANT-F2] FloatingNumbersOverlay hides only older badges when milestone is present, keeping newest badge visible on mobile', () => {
      const milestoneItem: FloatingTextItem = {
        id: 'ms_1',
        playerId: 'bot-1',
        text: 'Cơ Hội',
        type: FloatingTextType.Penalty,
        actionType: 'chance',
        title: 'Cơ Hội: Phạt Tốc Độ',
        timestamp: Date.now(),
      };
      const olderSalBadge: FloatingTextItem = {
        id: 'b_sal',
        playerId: 'bot-1',
        text: '+2.000',
        type: FloatingTextType.Reward,
        actionType: 'salary',
        title: 'Lương Vượt GO',
        timestamp: Date.now() + 1,
      };
      const newestTaxBadge: FloatingTextItem = {
        id: 'b_tax',
        playerId: 'bot-1',
        text: '-500',
        type: FloatingTextType.Penalty,
        actionType: 'tax',
        title: 'Lệ Phí',
        timestamp: Date.now() + 2,
      };

      useGameStore.setState({
        floatingTexts: [milestoneItem, olderSalBadge, newestTaxBadge],
        activeModal: null,
      });

      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));

      // Older badge (olderSalBadge) is hidden on mobile: exactly 1 'hidden md:flex'
      const hiddenMatches = html.match(/hidden md:flex/g) || [];
      expect(hiddenMatches.length).toBe(1);

      // Milestone banner container is present
      expect(html).toContain('data-testid="milestone-banner-container"');
    });

    // ------------------------------------------------------------------------
    // MUTANT G: wss_intent_handler reverts to toLocaleString or hardcodes 2000
    // ------------------------------------------------------------------------
    it('[PROBE-3.17][MUTANT-G1] wss_intent_handler records dynamic salary "+1.500" cleanly at round 25', async () => {
      const roomManager = new RoomManager();
      const sessionManager = new SessionManager();
      const broadcaster = new DeltaBroadcaster(roomManager, sessionManager, () => {});
      const adminManager = new AdminManager({ roomManager, secret: 'test-secret' });
      const sockets = new SocketRegistry();
      const mockWs = createMockWebSocket();

      const room = roomManager.createRoom('HOST_MUTANT_G1', 'Alice');
      roomManager.joinRoom(room.roomCode, 'BOB');
      roomManager.startGame(room.roomCode);
      sockets.bind(room.roomCode, 'HOST_MUTANT_G1', mockWs);

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
        player: { id: 'HOST_MUTANT_G1', position: 2, balance: 11_500 },
        passedGo: true,
        passedGoSalary: 1_500,
        rentCharged: 0,
      } as RollResult);

      await handleIntentMsg(deps, mockWs, {
        type: 'INTENT',
        playerId: 'HOST_MUTANT_G1',
        roomCode: room.roomCode,
        intent: { type: 'INTENT_ROLL' },
      });

      const logs = adminManager.getRecentLogs(room.roomCode);
      const rollLog = logs.find((l) => l.action === 'INTENT_ROLL');

      expect(rollLog?.payloadSummary).toContain('(Qua ô Bắt Đầu +1.500)');
      expect(rollLog?.payloadSummary).not.toContain('+2.000');
    });

    it('[PROBE-3.18][MUTANT-G2] wss_intent_handler records dynamic salary "+1.000" cleanly at round 35', async () => {
      const roomManager = new RoomManager();
      const sessionManager = new SessionManager();
      const broadcaster = new DeltaBroadcaster(roomManager, sessionManager, () => {});
      const adminManager = new AdminManager({ roomManager, secret: 'test-secret' });
      const sockets = new SocketRegistry();
      const mockWs = createMockWebSocket();

      const room = roomManager.createRoom('HOST_MUTANT_G2', 'Bob');
      roomManager.joinRoom(room.roomCode, 'CHARLIE');
      roomManager.startGame(room.roomCode);
      sockets.bind(room.roomCode, 'HOST_MUTANT_G2', mockWs);

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
        player: { id: 'HOST_MUTANT_G2', position: 2, balance: 11_000 },
        passedGo: true,
        passedGoSalary: 1_000,
        rentCharged: 0,
      } as RollResult);

      await handleIntentMsg(deps, mockWs, {
        type: 'INTENT',
        playerId: 'HOST_MUTANT_G2',
        roomCode: room.roomCode,
        intent: { type: 'INTENT_ROLL' },
      });

      const logs = adminManager.getRecentLogs(room.roomCode);
      const rollLog = logs.find((l) => l.action === 'INTENT_ROLL');

      expect(rollLog?.payloadSummary).toContain('(Qua ô Bắt Đầu +1.000)');
      expect(rollLog?.payloadSummary).not.toContain('+2.000');
    });
  });
});
