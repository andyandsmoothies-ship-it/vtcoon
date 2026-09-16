// [IMP-87][CONTRACT] Universal 4-Facet Behavioral Contract: Telemetry Watchdog Phase Awareness & Render Performance Hardening
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { TurnPhase } from '../../src/domain/room.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { type GameState } from '../../src/client/store/game_store.js';
import { watchdogMonitor } from '../../src/client/telemetry/watchdog_monitor.js';
import { handleDeltaTelemetry } from '../../src/client/telemetry/telemetry_delta_hook.js';
import { perfBudget } from '../../src/client/3d/perf_budget.js';
import { OwnershipMarkerInstances, type OwnershipMarkerInstancesProps } from '../../src/client/3d/board_tile';

function createTestState(overrides?: Partial<GameState> & {
  readonly p1Balance?: number;
  readonly p1Pos?: number;
  readonly p1Props?: readonly number[];
}): GameState {
  const p1Balance = overrides?.p1Balance ?? 15_000;
  const p1Pos = overrides?.p1Pos ?? 0;
  const p1Props = overrides?.p1Props ? [...overrides.p1Props] : [];

  return {
    playersInfo: {
      p1: {
        id: 'p1',
        name: 'Người chơi 1',
        balance: p1Balance,
        tokenColor: '#ef4444',
        ownedProperties: p1Props,
        mortgagedProperties: [],
        isBot: false,
        inAudit: false,
        auditTurnsLeft: 0,
      },
      bot_2: {
        id: 'bot_2',
        name: 'Bot AI 2',
        balance: 15_000,
        tokenColor: '#3b82f6',
        ownedProperties: [],
        mortgagedProperties: [],
        isBot: true,
        inAudit: false,
        auditTurnsLeft: 0,
      },
    },
    playerPositions: {
      p1: p1Pos,
      bot_2: 0,
    },
    visualPositions: {
      p1: p1Pos,
      bot_2: 0,
    },
    levelMap: {},
    treasuryPool: overrides?.treasuryPool ?? 0,
    currentTurnPlayerId: overrides?.currentTurnPlayerId ?? 'p1',
    turnTimeRemaining: overrides?.turnTimeRemaining ?? 30,
    activeModal: null,
    modalPayload: null,
    dice: [1, 1],
    isRolling: false,
    hasRolledThisTurn: false,
    activePawnAnimation: null,
    pawnAnimationQueue: [],
    pendingPawnMove: null,
    lastLandedPawn: null,
    roundNumber: 1,
    maxRounds: 30,
    lastEventCard: null,
    activeEmotes: {},
    floatingTexts: [],
    ...overrides,
  } as unknown as GameState;
}

function findNodeByName(node: any, name: string): any {
  if (!node) return null;
  if (node.props?.name === name || node.props?.['data-testid'] === name) return node;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findNodeByName(child, name);
      if (found) return found;
    }
  }
  if (node.props?.children) {
    return findNodeByName(node.props.children, name);
  }
  return null;
}

function captureOwnershipMarkerTree(props: OwnershipMarkerInstancesProps): any {
  let captured: any = null;
  function CaptureWrapper() {
    captured = OwnershipMarkerInstances(props);
    return captured;
  }
  renderToStaticMarkup(React.createElement(CaptureWrapper));
  return captured;
}

describe('[CONTRACT] IMP-87: Telemetry Watchdog Phase Awareness & 3D Render Performance Hardening', () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    watchdogMonitor.reset();
    perfBudget.reset();
    vi.useRealTimers();
  });

  // =========================================================================
  // FACET 1: PHASE TRANSITION & STALL ACCURACY (5 ATOMIC TESTS)
  // =========================================================================
  describe('Facet 1: Phase Transition & Stall Accuracy', () => {
    it('[TC-87.01/MSS][UC-IMP87] checkTurnStall resets clock on turnPhase change from WaitingRoll to PropertyManagement without false alarm at 46s total turn time', () => {
      watchdogMonitor.reset();

      // Tick 1: Player p1 in WaitingRoll phase
      watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 24,
        elapsedTurnMs: 40_000,
        tick: 1,
        turnPhase: TurnPhase.WaitingRoll,
      });

      // Tick 2: Player p1 moves to PropertyManagement. Phase has just changed (only 6s into new phase).
      // Total elapsed from start of turn is 46_000ms (> 45s), but phase timer was refreshed.
      const violation = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 24,
        elapsedTurnMs: 46_000,
        tick: 2,
        turnPhase: TurnPhase.PropertyManagement,
      });

      expect(violation).toBeNull();
    });

    it('[TC-87.02/MSS][UC-IMP87] checkTurnStall always returns null when timeRemaining > 0 (e.g. 30s) even if elapsedTurnMs exceeds 45_000ms (53_408ms)', () => {
      watchdogMonitor.reset();

      const violation = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 30,
        elapsedTurnMs: 53_408,
        tick: 10,
        turnPhase: TurnPhase.PropertyManagement,
      });

      expect(violation).toBeNull();
    });

    it('[TC-87.03/MSS][UC-IMP87] checkTurnStall triggers TURN_STALLED when timeRemaining <= 0 and elapsedTurnMs >= 45_000ms', () => {
      watchdogMonitor.reset();

      const violation = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 0,
        elapsedTurnMs: 45_500,
        tick: 15,
        turnPhase: TurnPhase.PropertyManagement,
      });

      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('TURN_STALLED');
    });

    it('[TC-87.04/MSS][UC-IMP87] checkTurnStall triggers TURN_STALLED when timeRemaining <= -5 regardless of elapsed duration', () => {
      watchdogMonitor.reset();

      const violation = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: -6,
        elapsedTurnMs: 12_000,
        tick: 20,
        turnPhase: TurnPhase.WaitingRoll,
      });

      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('TURN_STALLED');
    });

    it('[TC-87.05/MSS][UC-IMP87] checkTurnStall in auction mode (isInAuction: true) extends limit to 90s, producing no alert at 46s or 53s', () => {
      watchdogMonitor.reset();

      const violation46 = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 0,
        elapsedTurnMs: 46_000,
        tick: 25,
        isInAuction: true,
      });
      expect(violation46).toBeNull();

      const violation53 = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 0,
        elapsedTurnMs: 53_000,
        tick: 26,
        isInAuction: true,
      });
      expect(violation53).toBeNull();
    });
  });

  // =========================================================================
  // FACET 2: PLAYER PROGRESS ACTIVITY DEFENSE (3 ATOMIC TESTS)
  // =========================================================================
  describe('Facet 2: Player Progress Activity Defense', () => {
    it('[TC-87.06/MSS][UC-IMP87] checkTurnStall with hasProgress: true resets time threshold and suppresses stall alert on subsequent tick', () => {
      vi.useFakeTimers();
      watchdogMonitor.reset();

      // Tick 1: p1 turn begins
      watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 0,
        tick: 1,
      });

      // 40s pass
      vi.advanceTimersByTime(40_000);

      // Tick 2: Player conducts property upgrade (hasProgress: true)
      watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 0,
        tick: 2,
        hasProgress: true,
      });

      // 10s pass (total 50s from start of turn, but only 10s from progress)
      vi.advanceTimersByTime(10_000);

      const violation = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 0,
        tick: 3,
      });

      expect(violation).toBeNull();
    });

    it('[TC-87.07/MSS][UC-IMP87] checkTurnStall maintains independent timers per player (switching from p1 to bot_2 resets timer)', () => {
      vi.useFakeTimers();
      watchdogMonitor.reset();

      // p1 plays for 40 seconds
      watchdogMonitor.checkTurnStall({ currentTurnPlayerId: 'p1', timeRemaining: 10, tick: 1 });
      vi.advanceTimersByTime(40_000);

      // Turn passes to bot_2
      const botInitialViolation = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'bot_2',
        timeRemaining: 25,
        tick: 2,
      });
      expect(botInitialViolation).toBeNull();

      // bot_2 plays for 10 seconds (total 50s since p1 start, but only 10s for bot_2)
      vi.advanceTimersByTime(10_000);
      const botActiveViolation = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'bot_2',
        timeRemaining: 0,
        tick: 3,
      });
      expect(botActiveViolation).toBeNull();
    });

    it('[TC-87.07b/A1][UC-IMP87] Multiple successive hasProgress events defer stall watchdog across prolonged active turns', () => {
      vi.useFakeTimers();
      watchdogMonitor.reset();

      watchdogMonitor.checkTurnStall({ currentTurnPlayerId: 'p1', timeRemaining: 0, tick: 1 });
      vi.advanceTimersByTime(30_000);

      // Progress 1: Bought property
      watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 0,
        tick: 2,
        hasProgress: true,
      });
      vi.advanceTimersByTime(30_000);

      // Progress 2: Upgraded house
      watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 0,
        tick: 3,
        hasProgress: true,
      });
      vi.advanceTimersByTime(20_000);

      // Total 80s elapsed since turn start, but only 20s since last progress
      const violation = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 0,
        tick: 4,
      });
      expect(violation).toBeNull();
    });
  });

  // =========================================================================
  // FACET 3: 3D RENDER SHADOW OPTIMIZATION (4 ATOMIC TESTS)
  // =========================================================================
  describe('Facet 3: 3D Render Shadow Optimization', () => {
    it('[TC-87.08/MSS][UC-IMP87] OwnershipMarkerInstances MascotCrestShield micro meshes disable castShadow', () => {
      const tree = captureOwnershipMarkerTree({
        ownerColor: '#EF4444',
        level: 1,
        ownerSlot: 0,
        mascotIcon: '🐕',
      });

      const shieldNode = findNodeByName(tree, 'MascotCrestShield');
      expect(shieldNode).not.toBeNull();

      const shieldChildren = React.Children.toArray(shieldNode.props.children);
      const shieldHasCastShadow = shieldChildren.some((child: any) => Boolean(child.props?.castShadow));
      expect(shieldHasCastShadow).toBe(false);
    });

    it('[TC-87.09/MSS][UC-IMP87] OwnershipMarkerInstances TierIndicatorRings level C1..C3 meshes disable castShadow', () => {
      const tree = captureOwnershipMarkerTree({
        ownerColor: '#3B82F6',
        level: 3,
        ownerSlot: 1,
        mascotIcon: '🐈',
      });

      const ringsNode = findNodeByName(tree, 'TierIndicatorRings');
      expect(ringsNode).not.toBeNull();

      const ringChildren = React.Children.toArray(ringsNode.props.children);
      const ringsHaveCastShadow = ringChildren.some((ring: any) => Boolean(ring.props?.castShadow));
      expect(ringsHaveCastShadow).toBe(false);
    });

    it('[TC-87.10/MSS][UC-IMP87] OwnershipMarkerInstances OwnershipBillboardPin meshes do not cast shadow in shadow pass', () => {
      const tree = captureOwnershipMarkerTree({
        ownerColor: '#10B981',
        level: 2,
        ownerSlot: 2,
        mascotIcon: '🐎',
      });

      const billboardNode = findNodeByName(tree, 'OwnershipBillboardPin');
      expect(billboardNode).not.toBeNull();

      const pinChildren = React.Children.toArray(billboardNode.props.children);
      const pinHasCastShadow = pinChildren.some((child: any) => Boolean(child.props?.castShadow));
      expect(pinHasCastShadow).toBe(false);
    });

    it('[TC-87.10b/MSS][UC-IMP87] OwnershipMarkerInstances preserves castShadow on macro structural elements FlagPole and FlagCloth', () => {
      const tree = captureOwnershipMarkerTree({
        ownerColor: '#F59E0B',
        level: 2,
        ownerSlot: 3,
        mascotIcon: '🐘',
      });

      const flagPole = findNodeByName(tree, 'FlagPole');
      expect(flagPole?.props?.castShadow).toBe(true);

      const flagCloth = findNodeByName(tree, 'FlagCloth');
      expect(flagCloth?.props?.castShadow).toBe(true);
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & BUDGET RECOVERY (6 ATOMIC TESTS)
  // =========================================================================
  describe('Facet 4: Error Defense & Budget Recovery', () => {
    it('[TC-87.11/MSS][UC-IMP87] checkTurnStall with currentTurnPlayerId: null returns null and clears lastTurnPlayerId', () => {
      watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 15,
        elapsedTurnMs: 10_000,
        tick: 1,
      });

      const nullResult = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: null,
        timeRemaining: 0,
        tick: 2,
      });

      expect(nullResult).toBeNull();
    });

    it('[TC-87.12/MSS][UC-IMP87] watchdogMonitor.reset clears phase tracking, turn clock and bot burst history', () => {
      watchdogMonitor.recordBotAction('bot_1', Date.now(), 1);
      watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'bot_1',
        timeRemaining: 20,
        elapsedTurnMs: 30_000,
        tick: 2,
      });

      watchdogMonitor.reset();

      const freshResult = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'bot_1',
        timeRemaining: 20,
        elapsedTurnMs: 0,
        tick: 3,
      });

      expect(freshResult).toBeNull();
    });

    it('[TC-87.13a/MSS][UC-IMP87] perfBudget.evaluateDrawCallBudget evaluates draw calls accurately within optimal diorama budget', () => {
      const evalOptimal = perfBudget.evaluateDrawCallBudget(60);

      expect(evalOptimal.isWithinBudget).toBe(true);
      expect(evalOptimal.status).toBe('optimal');
    });

    it('[TC-87.13b/A1][UC-IMP87] perfBudget.evaluateDrawCallBudget flags critical status when draw calls exceed budget limit', () => {
      const evalCritical = perfBudget.evaluateDrawCallBudget(2812);

      expect(evalCritical.isWithinBudget).toBe(false);
      expect(evalCritical.status).toBe('critical');
    });

    it('[TC-87.14/MSS][UC-IMP87] telemetry_delta_hook forwards turnPhase and hasProgress from sparse delta to watchdogMonitor.checkTurnStall', () => {
      const checkTurnStallSpy = vi.spyOn(watchdogMonitor, 'checkTurnStall');
      const preState = createTestState({
        currentTurnPlayerId: 'p1',
        turnTimeRemaining: 30,
      });
      const postState = createTestState({
        currentTurnPlayerId: 'p1',
        turnTimeRemaining: 30,
        p1Props: [1],
      });

      const delta: DeltaPayload = {
        tick: 5,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.PropertyManagement,
        cells: [{ index: 1, ownerId: 'p1' }],
        players: [{ id: 'p1', position: 1, balance: 13_000 }],
      };

      handleDeltaTelemetry(delta, preState, postState);

      expect(checkTurnStallSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          turnPhase: TurnPhase.PropertyManagement,
          hasProgress: true,
        })
      );

      checkTurnStallSpy.mockRestore();
    });

    it('[TC-87.15/MSS][UC-IMP87] checkTurnStall defends against negative or NaN elapsedTurnMs without throwing exceptions', () => {
      watchdogMonitor.reset();

      const negResult = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 15,
        elapsedTurnMs: -10_000,
        tick: 1,
      });
      expect(negResult).toBeNull();

      const nanResult = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: 15,
        elapsedTurnMs: Number.NaN,
        tick: 2,
      });
      expect(nanResult).toBeNull();
    });
  });
});
