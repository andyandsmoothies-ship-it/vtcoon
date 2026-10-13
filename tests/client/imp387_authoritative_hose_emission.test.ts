// [IMP-387] Living Contract Tests: Authoritative HOSE Stock Trading Emission & Client Zero-Heuristic Financial Dispatch
// Station 1: Contract RED Specification & Call-Site Wiring Verification
// Covers Server Authoritative Emission (handleHoseInvest & handleHoseSkip),
// Client Direct Dispatch (extractHoseEvents), Composite Netting Collision Defense,
// Idempotent Stream Deduplication, and Presentation Wiring (Activity Log & Floating Badge).

import { describe, it, expect, beforeEach } from 'vitest';
import { handleHoseInvest, handleHoseSkip } from '../../src/server/hose_actions.js';
import {
  type Room,
  type Player,
  TurnPhase,
  type ServerDomainEvent,
} from '../../src/domain/room.js';
import {
  SynthesizedGameEventType,
  type HoseSettledEvent,
  type SynthesizedGameEvent,
} from '../../src/client/events/game_event_types.js';
import { extractHoseEvents, resetHoseEventTracker } from '../../src/client/events/game_event_hose_helpers.js';
import type { InternalBalanceDelta } from '../../src/client/events/game_event_financial_helpers.js';
import { synthesizeFinancialEvents } from '../../src/client/events/game_event_financial_synthesizer.js';
import { createBadgeEventSubscriber } from '../../src/client/events/subscribers/badge_event_subscriber.js';
import { createActivityLogSubscriber } from '../../src/client/events/subscribers/activity_log_subscriber.js';
import { useGameStore, type GameState, type PlayerHudInfo, type FloatingTextItem } from '../../src/client/store/game_store.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

function createMockRoom(): Room {
  const p1: Player = {
    id: 'p1',
    name: 'Player 1',
    balance: 10_000,
    position: 15,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    consecutiveDoubles: 0,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
    bankrupt: false,
  };

  return {
    roomCode: 'TEST_HOSE',
    hostId: 'p1',
    players: [p1],
    currentPlayerIndex: 0,
    phase: TurnPhase.HosePhase,
    started: true,
    activeModifiers: [],
    marketDeck: [],
    marketDiscard: [],
    chanceDeck: [],
    chanceDiscard: [],
    permanentRentBonus: {},
    treasury: 50_000,
    roundCount: 1,
    pendingDomainEvents: [],
  };
}

function createMockPlayer(overrides: Partial<PlayerHudInfo> & { id: string }): PlayerHudInfo {
  return {
    name: overrides.id.toUpperCase(),
    balance: 5000,
    tokenColor: '#38BDF8',
    isBot: false,
    ownedProperties: [],
    mortgagedProperties: [],
    ...overrides,
  };
}

function createMockGameState(
  playersInfo: Record<string, Partial<PlayerHudInfo>>,
): GameState {
  const defaultPlayers: Record<string, PlayerHudInfo> = {};
  for (const [id, p] of Object.entries(playersInfo)) {
    defaultPlayers[id] = createMockPlayer({ id, ...p });
  }

  return {
    ...useGameStore.getState(),
    playersInfo: defaultPlayers,
  };
}

function createMockDelta(overrides?: Partial<DeltaPayload>): DeltaPayload {
  return {
    tick: 100,
    cells: [],
    ...overrides,
  };
}

describe('IMP-387: Authoritative HOSE Stock Trading Emission & Client Dispatch', () => {
  beforeEach(() => {
    resetHoseEventTracker();
    useActivityStore.setState({ activityLogs: [] });
    useGameStore.setState({ floatingTexts: [] });
  });

  describe('Server Authoritative Emission', () => {
    it('TC-387.01 [UC-HOSE-INVEST-SERVER-EMISSION/MSS] handleHoseInvest pushes canonical HOSE_SETTLED to pendingDomainEvents', () => {
      const room = createMockRoom();
      const player = room.players[0]!;
      // Deterministic PRNG returning 0.5 -> roll = Math.floor(0.5 * 6) + 1 = 4 (multiplier = 1.0)
      const mockRng = () => 0.5;

      const result = handleHoseInvest(room, player, mockRng, 1000);

      expect(result.success).toBe(true);
      expect(room.pendingDomainEvents).toBeDefined();
      const hoseEvent = room.pendingDomainEvents?.find((e: ServerDomainEvent) => e.type === 'HOSE_SETTLED');
      expect(hoseEvent).toBeDefined();
      expect(hoseEvent?.playerId).toBe('p1');
    });

    it('TC-387.02 [UC-HOSE-SKIP-ZERO-EMISSION/MSS] handleHoseSkip transitions phase without emitting HOSE_SETTLED', () => {
      const room = createMockRoom();
      const player = room.players[0]!;

      const result = handleHoseSkip(room, player);

      expect(result.success).toBe(true);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      expect(room.pendingDomainEvents?.length ?? 0).toBe(0);
    });
  });

  describe('Client Direct Dispatch & Netting Collision Defense', () => {
    it('TC-387.03 [UC-CLIENT-DIRECT-HOSE-DISPATCH/MSS] extractHoseEvents directly consumes HOSE_SETTLED from delta.domainEvents', () => {
      const delta = createMockDelta({
        domainEvents: [
          {
            type: 'HOSE_SETTLED',
            playerId: 'p1',
            stake: 1000,
            roll: 6,
            payout: 2500,
            multiplier: 2.5,
            profit: 1500,
            diceSeq: 1,
            timestamp: 1000,
          },
        ],
      });
      const payers: InternalBalanceDelta[] = [];
      const receivers: InternalBalanceDelta[] = [{ id: 'p1', diff: 1500, hasPassedGo: false, isSentToAudit: false }];

      const events = extractHoseEvents(delta, payers, receivers, 1000);

      expect(events.length).toBe(1);
      expect(events[0]?.type).toBe(SynthesizedGameEventType.HOSE_SETTLED);
      expect(events[0]?.profit).toBe(1500);
      expect(receivers.length).toBe(0);
    });

    it('TC-387.04 [UC-HOSE-LOSS-NETTING-COLLISION-DEFENSE/MSS] restores loss diff symmetrically via restoreDeltaOutflow preserving GO salary', () => {
      // Net change = -1000 (HOSE loss) + 2000 (GO salary) = +1000 in receivers
      // However, if initial net delta was negative (-500) and restored by loss of 1000 -> newDiff = +500
      const payers: InternalBalanceDelta[] = [
        { id: 'p1', diff: -500, cellIndex: 0, hasPassedGo: true, isSentToAudit: false },
      ];
      const receivers: InternalBalanceDelta[] = [];
      const delta = createMockDelta({
        domainEvents: [
          {
            type: 'HOSE_SETTLED',
            playerId: 'p1',
            stake: 1000,
            roll: 1,
            payout: 0,
            multiplier: 0,
            profit: -1000,
            diceSeq: 2,
            timestamp: 2000,
          },
        ],
      });

      const events = extractHoseEvents(delta, payers, receivers, 2000);

      expect(events.length).toBe(1);
      expect(payers.length).toBe(0);
      expect(receivers.length).toBe(1);
      expect(receivers[0]?.diff).toBe(500);
    });

    it('TC-387.05 [UC-HOSE-WIN-PROFIT-DEDUCTION/MSS] deducts winning inflow from balance deltas cleanly', () => {
      const payers: InternalBalanceDelta[] = [];
      const receivers: InternalBalanceDelta[] = [
        { id: 'p1', diff: 3000, cellIndex: 15, hasPassedGo: false, isSentToAudit: false },
      ];
      const delta = createMockDelta({
        domainEvents: [
          {
            type: 'HOSE_SETTLED',
            playerId: 'p1',
            stake: 1000,
            roll: 5,
            payout: 3000,
            multiplier: 3.0,
            profit: 2000,
            diceSeq: 3,
            timestamp: 3000,
          },
        ],
      });

      const events = extractHoseEvents(delta, payers, receivers, 3000);

      expect(events.length).toBe(1);
      expect(events[0]?.profit).toBe(2000);
      expect(receivers[0]?.diff).toBe(1000);
    });

    it('TC-387.06 [UC-HOSE-IDEMPOTENT-STREAM-IMMUNITY/MSS] deduplicates and returns empty array on repeated execution', () => {
      const delta = createMockDelta({
        domainEvents: [
          {
            type: 'HOSE_SETTLED',
            playerId: 'p1',
            stake: 1000,
            roll: 4,
            payout: 1000,
            multiplier: 1.0,
            profit: 0,
            diceSeq: 4,
            timestamp: 4000,
          },
        ],
      });
      const payers: InternalBalanceDelta[] = [];
      const receivers: InternalBalanceDelta[] = [];

      const pass1 = extractHoseEvents(delta, payers, receivers, 4000);
      const pass2 = extractHoseEvents(delta, payers, receivers, 4000);

      expect(pass1.length).toBe(1);
      expect(pass2.length).toBe(0);
    });

    it('TC-387.07 [UC-HOSE-PRESENTATION-WIRE/MSS] activity log and badge subscribers dispatch Vietnamese narrative and floating badge', () => {
      const prevState = createMockGameState({ p1: { balance: 10000 } });
      const nextState = createMockGameState({ p1: { balance: 11500 } });
      const delta = createMockDelta({
        players: [{ id: 'p1', balance: 11500, position: 15 }],
        domainEvents: [
          {
            type: 'HOSE_SETTLED',
            playerId: 'p1',
            stake: 1000,
            roll: 6,
            payout: 2500,
            multiplier: 2.5,
            profit: 1500,
            diceSeq: 5,
            timestamp: 5000,
          },
        ],
      });

      const events = synthesizeFinancialEvents(prevState, nextState, delta, { baseTimestamp: 5000 });
      const badgeSub = createBadgeEventSubscriber(useGameStore);
      const logSub = createActivityLogSubscriber(useActivityStore);

      badgeSub(events, { delta, prevState, nextState });
      logSub(events, { delta, prevState, nextState });

      const logs = useActivityStore.getState().activityLogs;
      const floating = useGameStore.getState().floatingTexts;

      expect(logs.some((l) => l.message.includes('khớp lệnh') || l.message.includes('HOSE'))).toBe(true);
      expect(floating.some((f: FloatingTextItem) => f.actionType === 'hose' || f.title?.includes('HOSE'))).toBe(true);
    });

    it('TC-387.08 [UC-HOSE-MULTI-TICK-STALE-RESULT-IMMUNITY/MSS] Tick 1 domainEvents + lastHoseResult does not double-emit on Tick 2 stale lastHoseResult', () => {
      const hoseResult = {
        playerId: 'p1',
        stake: 1000,
        roll: 3,
        payout: 500,
        multiplier: 0.5,
        profit: -500,
        diceSeq: 6,
        timestamp: 6000,
      };

      const { diceSeq, ...eventWithoutSeq } = hoseResult;

      const tick1Delta = createMockDelta({
        domainEvents: [
          {
            type: 'HOSE_SETTLED',
            ...eventWithoutSeq,
          },
        ],
        lastHoseResult: hoseResult,
      });

      const tick2Delta = createMockDelta({
        domainEvents: undefined,
        lastHoseResult: hoseResult,
      });

      const p1Payers: InternalBalanceDelta[] = [{ id: 'p1', diff: -500, hasPassedGo: false, isSentToAudit: false }];
      const p1Receivers: InternalBalanceDelta[] = [];
      const tick1Events = extractHoseEvents(tick1Delta, p1Payers, p1Receivers, 6000);

      const p2Payers: InternalBalanceDelta[] = [];
      const p2Receivers: InternalBalanceDelta[] = [];
      const tick2Events = extractHoseEvents(tick2Delta, p2Payers, p2Receivers, 6001);

      expect(tick1Events.length).toBe(1);
      expect(tick2Events.length).toBe(0);
    });
  });
});
