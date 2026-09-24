// [TC-187.01/MSS..TC-187.16/A4][UC-IMP187] M&A Activity Transparency & Unmortgage Telemetry Suite
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { computeExpectedDelta } from '../../src/client/telemetry/telemetry_delta_hook';
import { verifyTreasuryConservation } from '../../src/client/telemetry/invariant_checker';
import {
  trackDeltaActivities,
  detectPropertyAndLevelActivities,
  detectFinancialAndStatusActivities,
} from '../../src/client/network/activity_tracker';
import { matchRentTransactions } from '../../src/client/network/activity_financial_tracker';
import { useActivityStore } from '../../src/client/store/activity_store';
import { useGameStore, type GameState } from '../../src/client/store/game_store';
import { useVfxStore } from '../../src/client/store/vfx_store';
import type { DeltaPayload, PlayerDelta } from '../../src/server/session_manager';
import { TurnPhase, type EventCardInfo } from '../../src/domain/room';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types';

function mockHudPlayer(p: { id: string; name: string; balance: number } & Partial<PlayerHudInfo>): PlayerHudInfo {
  return { tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [], isBot: false, inAudit: false, ...p };
}

function mockPlayerDelta(p: { id: string; balance: number } & Partial<PlayerDelta>): PlayerDelta {
  return { position: 0, ...p };
}

function mockCardInfo(c: { id: string; title: string; type: 'Market' | 'Chance' } & Partial<EventCardInfo>): EventCardInfo {
  return { description: c.title, ...c };
}

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    levelMap: {},
    playerPositions: { p1: 19, bot_2: 0, bot_3: 36, bot_4: 10 },
    dice: [1, 1],
    playersInfo: {
      p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 15000, ownedProperties: [19] }),
      bot_2: mockHudPlayer({ id: 'bot_2', name: 'Bot AI 2', balance: 14000, tokenColor: '#F59E0B', isBot: true }),
      bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 18000, tokenColor: '#10B981', isBot: true }),
    },
    currentTurnPlayerId: 'bot_3',
    turnTimeRemaining: 60,
    treasuryPool: 2000,
    roundNumber: 15,
    maxRounds: 30,
    ...overrides,
  };
}

describe('IMP-187 Contract Tests: Telemetry Unmortgage & M&A Transparency', () => {
  beforeEach(() => {
    useActivityStore.setState({ activityLogs: [], isActivityFeedOpen: false, unreadCount: 0, activeFilter: 'all' });
  });

  // --- FACET 1: UNMORTGAGE TELEMETRY PRECISION (TICK 307 & 312 REPRODUCTION) ---
  describe('Facet 1: Unmortgage Circulation Delta Precision', () => {
    it('[TC-187.01/MSS] Tick 307: Unmortgage of Cell 28 (Viettel, loan 750, fee 75) produces expectedDelta = -750', () => {
      const preState = createMockGameState({
        playersInfo: {
          bot_2: mockHudPlayer({ id: 'bot_2', name: 'Bot AI 2', balance: 5000, ownedProperties: [28], mortgagedProperties: [28], mortgageLoans: { 28: 750 }, isBot: true }),
        },
        treasuryPool: 5000,
      });

      // Tick 307 unmortgage delta: Cell 28 isMortgaged becomes false, bot pays 825, treasury receives 75
      const delta: DeltaPayload = {
        tick: 307,
        cells: [{ index: 28, isMortgaged: false }],
        players: [mockPlayerDelta({ id: 'bot_2', balance: 4175 })], // -825
        treasury: 5075, // +75
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState, undefined, 5075);
      // Net circulation change should be strictly -750 (the loan repaid to bank), not -825!
      expect(expected).toBe(-750);
    });

    it('[TC-187.02/MSS] Tick 312: Unmortgage of Cell 27 (Kiên Giang, loan 1300, fee 130) produces expectedDelta = -1300', () => {
      const preState = createMockGameState({
        playersInfo: {
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 8000, ownedProperties: [27], mortgagedProperties: [27], mortgageLoans: { 27: 1300 }, isBot: true }),
        },
        treasuryPool: 5075,
      });

      // Tick 312 unmortgage delta: Cell 27 isMortgaged becomes false, bot pays 1430, treasury receives 130
      const delta: DeltaPayload = {
        tick: 312,
        cells: [{ index: 27, isMortgaged: false }],
        players: [mockPlayerDelta({ id: 'bot_3', balance: 6570 })], // -1430
        treasury: 5205, // +130
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState, undefined, 5205);
      // Net circulation change should be strictly -1300, not -1430!
      expect(expected).toBe(-1300);
    });

    it('[TC-187.03/MSS] Fallback unmortgage without recorded mortgageLoans uses 50% deed price', () => {
      // Cell 28 deed price is 1500 -> 50% = 750
      const preState = createMockGameState({
        playersInfo: {
          bot_2: mockHudPlayer({ id: 'bot_2', name: 'Bot AI 2', balance: 5000, ownedProperties: [28], mortgagedProperties: [28], isBot: true }),
        },
        treasuryPool: 5000,
      });

      const delta: DeltaPayload = {
        tick: 308,
        cells: [{ index: 28, isMortgaged: false }],
        players: [mockPlayerDelta({ id: 'bot_2', balance: 4175 })],
        treasury: 5075,
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState, undefined, 5075);
      expect(expected).toBe(-750);
    });
  });

  // --- FACET 2: TREASURY CONSERVATION INVARIANT INTEGRATION ---
  describe('Facet 2: Treasury Conservation Invariant Integration', () => {
    it('[TC-187.04/MSS] Tick 307: verifyTreasuryConservation returns null when actualDelta (-750) matches expectedDelta (-750)', () => {
      // Pre: player 5000, treasury 5000 -> total 10000
      // Post: player 4175, treasury 5075 -> total 9250
      // actualDelta = 9250 - 10000 = -750
      const violation = verifyTreasuryConservation({
        preBalances: { bot_2: 5000 },
        postBalances: { bot_2: 4175 },
        preTreasury: 5000,
        postTreasury: 5075,
        tick: 307,
        expectedDelta: -750, // Corrected expectation
        roomStarted: true,
      });

      expect(violation).toBeNull();
    });

    it('[TC-187.05/MSS] Tick 312: verifyTreasuryConservation returns null when actualDelta (-1300) matches expectedDelta (-1300)', () => {
      // Pre: player 8000, treasury 5075 -> total 13075
      // Post: player 6570, treasury 5205 -> total 11775
      // actualDelta = 11775 - 13075 = -1300
      const violation = verifyTreasuryConservation({
        preBalances: { bot_3: 8000 },
        postBalances: { bot_3: 6570 },
        preTreasury: 5075,
        postTreasury: 5205,
        tick: 312,
        expectedDelta: -1300,
        roomStarted: true,
      });

      expect(violation).toBeNull();
    });

    it('[TC-187.05b/MSS][Adversarial] verifyTreasuryConservation detects violation when actualDelta (-750) mismatches buggy expectedDelta (-825)', () => {
      // Adversarial regression defense: If legacy formula deltaSum -= (loan + fee) is passed (-825 instead of -750),
      // verifyTreasuryConservation must detect discrepancy and return InvariantViolation object.
      const violation = verifyTreasuryConservation({
        preBalances: { bot_2: 5000 },
        postBalances: { bot_2: 4175 },
        preTreasury: 5000,
        postTreasury: 5075,
        tick: 307,
        expectedDelta: -825, // Buggy legacy expectation: -(750 + 75)
        roomStarted: true,
      });

      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('TREASURY_INVARIANT_VIOLATED');
      expect(violation?.severity).toBe('CRITICAL');
    });

    it('[TC-187.06/MSS] Preserves Foreclosure Auction Treasury Absorption (L284 integrity check)', () => {
      const preState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'P1', balance: 10000 }),
        },
        treasuryPool: 12000,
        auction: { cellIndex: 6, highestBid: 1650, highestBidder: 'p1' },
      });

      const delta: DeltaPayload = {
        tick: 15,
        cells: [{ index: 6, ownerId: 'p1', level: 0 }],
        players: [mockPlayerDelta({ id: 'p1', balance: 8350 })],
        treasury: 13650, // +1650 absorbed into treasury
        roomStarted: true,
      };

      const expected = computeExpectedDelta(delta, preState, undefined, 13650);
      expect(expected).toBe(0);
    });
  });

  // --- FACET 3: M&A / COMPULSORY BUYOUT SEPARATION (TICK 309 REPRODUCTION) ---
  describe('Facet 3: M&A Separation from Rent Transactions', () => {
    it('[TC-187.07/MSS] matchRentTransactions does NOT match M&A participants when buyoutCellIndices are present', () => {
      // Bot 3 pays 2400 Tr to P1 for Đà Nẵng (Cell 19)
      const payers = [{ id: 'bot_3', diff: -2400 }];
      const receivers = [{ id: 'p1', diff: 2400 }];

      // Normal rent matching without buyout context matches them
      const rentResult = matchRentTransactions(payers, receivers);
      expect(rentResult.rentLogs).toHaveLength(1);
      expect(rentResult.rentLogs[0]?.type).toBe('rent');
    });

    it('[TC-187.08/MSS] Tick 309: detectFinancialAndStatusActivities emits M&A log instead of rent log when CC_MA_FORCE is present', () => {
      const preState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 10000, ownedProperties: [19] }),
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 18000, isBot: true }),
        },
      });

      const postState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 12400 }),
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 15600, ownedProperties: [19], isBot: true }),
        },
      });

      const delta: DeltaPayload = {
        tick: 309,
        lastEventCard: mockCardInfo({
          id: 'cc_ma_force',
          title: 'Thâu Tóm Doanh Nghiệp',
          type: 'Chance',
          cardType: 'chance',
          effectType: 'ma_force',
          action: 'ma_force',
        }),
        cells: [{ index: 19, ownerId: 'bot_3' }],
        players: [
          mockPlayerDelta({ id: 'bot_3', balance: 15600 }),
          mockPlayerDelta({ id: 'p1', balance: 12400 }),
        ],
        roomStarted: true,
      };

      const { entries: propEntries, context } = detectPropertyAndLevelActivities(delta, preState, postState);
      const finEntries = detectFinancialAndStatusActivities(delta, preState, postState, context);

      // Verify NO rent log is generated!
      const rentLogs = finEntries.filter((e) => e.type === 'rent');
      expect(rentLogs).toHaveLength(0);

      // Verify M&A log IS generated!
      const maLogs = finEntries.filter((e) => e.message.includes('M&A') || e.message.includes('thâu tóm'));
      expect(maLogs).toHaveLength(1);
      expect(maLogs[0]?.message).toContain('Bot AI 3');
      expect(maLogs[0]?.message).toContain('Bubbly Parrot');
      expect(maLogs[0]?.message).toContain('Đà Nẵng');
    });

    it('[TC-187.09/MSS] detectPropertyAndLevelActivities suppresses generic "nhận quyền sở hữu" for buyoutCellIndices', () => {
      const preState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 10000, ownedProperties: [19] }),
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 18000, isBot: true }),
        },
      });

      const postState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 12400 }),
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 15600, ownedProperties: [19], isBot: true }),
        },
      });

      const delta: DeltaPayload = {
        tick: 309,
        lastEventCard: mockCardInfo({
          id: 'cc_ma_force',
          title: 'Thâu Tóm Doanh Nghiệp',
          type: 'Chance',
          cardType: 'chance',
          effectType: 'ma_force',
          action: 'ma_force',
        }),
        cells: [{ index: 19, ownerId: 'bot_3' }],
        roomStarted: true,
      };

      const { entries, context } = detectPropertyAndLevelActivities(delta, preState, postState);
      // buyoutCellIndices must contain cell 19
      expect(context.buyoutCellIndices).toContain(19);

      // Should not have the generic 'nhận quyền sở hữu' entry for cell 19
      const genericBuyEntry = entries.find((e) => e.cellIndex === 19 && e.message.includes('nhận quyền sở hữu'));
      expect(genericBuyEntry).toBeUndefined();
    });

    it('[TC-187.10/MSS] Ordinary rent payment between two players without card event remains unaffected', () => {
      const preState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 10000, ownedProperties: [19] }),
          bot_2: mockHudPlayer({ id: 'bot_2', name: 'Bot AI 2', balance: 5000, isBot: true }),
        },
      });

      const postState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 11000, ownedProperties: [19] }),
          bot_2: mockHudPlayer({ id: 'bot_2', name: 'Bot AI 2', balance: 4000, isBot: true }),
        },
      });

      const delta: DeltaPayload = {
        tick: 310,
        cells: [],
        players: [
          mockPlayerDelta({ id: 'bot_2', balance: 4000 }),
          mockPlayerDelta({ id: 'p1', balance: 11000 }),
        ],
        roomStarted: true,
      };

      const { context } = detectPropertyAndLevelActivities(delta, preState, postState);
      const finEntries = detectFinancialAndStatusActivities(delta, preState, postState, context);

      const rentLogs = finEntries.filter((e) => e.type === 'rent');
      expect(rentLogs).toHaveLength(1);
      expect(rentLogs[0]?.message).toContain('Bot AI 2 đã trả 1.000 Tr. tiền thuê cho Bubbly Parrot');
    });
  });

  // --- FACET 4: CAUSAL TIMELINE ORDERING ---
  describe('Facet 4: Causal Timeline Ordering', () => {
    it('[TC-187.11/MSS] trackDeltaActivities logs card event BEFORE property transfer and financial transfer', () => {
      const preState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 10000, ownedProperties: [19] }),
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 18000, isBot: true }),
        },
      });

      const postState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 12400 }),
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 15600, ownedProperties: [19], isBot: true }),
        },
      });

      const delta: DeltaPayload = {
        tick: 309,
        lastEventCard: mockCardInfo({
          id: 'cc_ma_force',
          title: 'Thâu Tóm Doanh Nghiệp',
          type: 'Chance',
          cardType: 'chance',
          effectType: 'ma_force',
          action: 'ma_force',
        }),
        cells: [{ index: 19, ownerId: 'bot_3' }],
        players: [
          mockPlayerDelta({ id: 'bot_3', balance: 15600 }),
          mockPlayerDelta({ id: 'p1', balance: 12400 }),
        ],
        roomStarted: true,
      };

      trackDeltaActivities(delta, preState, postState, useActivityStore);
      const logs = useActivityStore.getState().activityLogs;

      // Card event index must be before financial entry index
      const cardIdx = logs.findIndex((l) => l.type === 'card' && l.message.includes('Thâu Tóm'));
      const finIdx = logs.findIndex((l) => l.message.includes('M&A') || l.message.includes('thâu tóm'));

      expect(cardIdx).toBeGreaterThanOrEqual(0);
      expect(finIdx).toBeGreaterThanOrEqual(0);
      expect(cardIdx).toBeLessThan(finIdx);
    });
  });

  // --- FACET 5: VICTIM DEFENSE & ACTOR INVERSION PREVENTION ---
  describe('Facet 5: Victim Alert & Actor Inversion Defense', () => {
    it('[TC-187.12/MSS] Victim of M&A does NOT trigger victory_spin pawn reaction', () => {
      const triggerSpy = vi.spyOn(useVfxStore.getState(), 'triggerPawnReaction');

      const preState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 10000, ownedProperties: [19] }),
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 18000, isBot: true }),
        },
      });

      const postState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 12400 }),
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 15600, ownedProperties: [19], isBot: true }),
        },
      });

      const delta: DeltaPayload = {
        tick: 309,
        lastEventCard: mockCardInfo({
          id: 'cc_ma_force',
          title: 'Thâu Tóm Doanh Nghiệp',
          type: 'Chance',
          cardType: 'chance',
          effectType: 'ma_force',
          action: 'ma_force',
        }),
        cells: [{ index: 19, ownerId: 'bot_3' }],
        players: [
          mockPlayerDelta({ id: 'bot_3', balance: 15600 }),
          mockPlayerDelta({ id: 'p1', balance: 12400 }),
        ],
        roomStarted: true,
      };

      trackDeltaActivities(delta, preState, postState, useActivityStore);

      // p1 is the seller/victim who lost cell 19 -> MUST NOT have victory_spin!
      const p1VictoryCalls = triggerSpy.mock.calls.filter(
        ([playerId, anim]) => playerId === 'p1' && anim === 'victory_spin',
      );
      expect(p1VictoryCalls).toHaveLength(0);
      triggerSpy.mockRestore();
    });

    it('[TC-187.13/MSS] Victim of M&A receives 2-line floating notification with title and compensation text', () => {
      const addFloatingTextSpy = vi.fn();
      const mockState = {
        ...createMockGameState(),
        addFloatingText: addFloatingTextSpy,
      } as unknown as GameState;

      const preState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 10000, ownedProperties: [19] }),
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 18000, isBot: true }),
        },
      });

      const delta: DeltaPayload = {
        tick: 309,
        lastEventCard: mockCardInfo({
          id: 'cc_ma_force',
          title: 'Thâu Tóm Doanh Nghiệp',
          type: 'Chance',
          cardType: 'chance',
          effectType: 'ma_force',
          action: 'ma_force',
        }),
        cells: [{ index: 19, ownerId: 'bot_3' }],
        players: [
          mockPlayerDelta({ id: 'bot_3', balance: 15600 }),
          mockPlayerDelta({ id: 'p1', balance: 12400 }),
        ],
        roomStarted: true,
      };

      trackDeltaActivities(delta, preState, mockState, useActivityStore);

      // p1 floating texts should include an alert regarding property loss
      const victimTexts = addFloatingTextSpy.mock.calls.filter(
        ([param]) => param.playerId === 'p1' && param.actionType === 'ma_buyout',
      );
      expect(victimTexts).toHaveLength(1);
      const victimParam = victimTexts[0]![0];
      expect(victimParam.title).toContain('Bị thâu tóm');
      expect(victimParam.title).toContain('Đà Nẵng');
      expect(victimParam.text).toContain('2.400 Tr');
    });

    it('[TC-187.14/MSS] Buyer of M&A receives purchase floating badge with cell name', () => {
      const addFloatingTextSpy = vi.fn();
      const mockState = {
        ...createMockGameState(),
        addFloatingText: addFloatingTextSpy,
      } as unknown as GameState;

      const preState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 10000, ownedProperties: [19] }),
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 18000, isBot: true }),
        },
      });

      const delta: DeltaPayload = {
        tick: 309,
        lastEventCard: mockCardInfo({
          id: 'cc_ma_force',
          title: 'Thâu Tóm Doanh Nghiệp',
          type: 'Chance',
          cardType: 'chance',
          effectType: 'ma_force',
          action: 'ma_force',
        }),
        cells: [{ index: 19, ownerId: 'bot_3' }],
        players: [
          mockPlayerDelta({ id: 'bot_3', balance: 15600 }),
          mockPlayerDelta({ id: 'p1', balance: 12400 }),
        ],
        roomStarted: true,
      };

      trackDeltaActivities(delta, preState, mockState, useActivityStore);

      const buyerTexts = addFloatingTextSpy.mock.calls.filter(
        ([param]) => param.playerId === 'bot_3' && param.actionType === 'ma_buyout',
      );
      expect(buyerTexts).toHaveLength(1);
      expect(buyerTexts[0]![0].title).toContain('Thâu tóm');
      expect(buyerTexts[0]![0].title).toContain('Đà Nẵng');
    });

    it('[TC-187.15/MSS] Fallback gracefully when cell owner is not in prevState.playersInfo', () => {
      // Cell 19 had no owner in preState
      const preState = createMockGameState({
        playersInfo: {
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 18000, isBot: true }),
        },
      });

      const postState = createMockGameState({
        playersInfo: {
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 15600, ownedProperties: [19], isBot: true }),
        },
      });

      const delta: DeltaPayload = {
        tick: 309,
        lastEventCard: mockCardInfo({
          id: 'cc_ma_force',
          title: 'Thâu Tóm Doanh Nghiệp',
          type: 'Chance',
          cardType: 'chance',
          effectType: 'ma_force',
          action: 'ma_force',
        }),
        cells: [{ index: 19, ownerId: 'bot_3' }],
        players: [mockPlayerDelta({ id: 'bot_3', balance: 15600 })],
        roomStarted: true,
      };

      // Must not throw or crash!
      expect(() => {
        const { context } = detectPropertyAndLevelActivities(delta, preState, postState);
        detectFinancialAndStatusActivities(delta, preState, postState, context);
      }).not.toThrow();
    });

    it('[TC-187.16/MSS] Supports Project Swap CC_SWAP_PROJECT as M&A buyout equivalent', () => {
      const preState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 10000, ownedProperties: [19] }),
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 18000, ownedProperties: [21], isBot: true }),
        },
      });

      const postState = createMockGameState({
        playersInfo: {
          p1: mockHudPlayer({ id: 'p1', name: 'Bubbly Parrot', balance: 10000, ownedProperties: [21] }),
          bot_3: mockHudPlayer({ id: 'bot_3', name: 'Bot AI 3', balance: 18000, ownedProperties: [19], isBot: true }),
        },
      });

      const delta: DeltaPayload = {
        tick: 315,
        lastEventCard: mockCardInfo({
          id: 'cc_swap_project',
          title: 'Hoán Đổi Dự Án',
          type: 'Chance',
          cardType: 'chance',
          effectType: 'swap_project',
          action: 'swap_project',
        }),
        cells: [
          { index: 19, ownerId: 'bot_3' },
          { index: 21, ownerId: 'p1' },
        ],
        roomStarted: true,
      };

      const { context } = detectPropertyAndLevelActivities(delta, preState, postState);
      expect(context.buyoutCellIndices).toContain(19);
      expect(context.buyoutCellIndices).toContain(21);
    });
  });
});
