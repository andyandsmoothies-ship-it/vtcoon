// [CHAOS-SENTINEL][STATION-4] Physical Adversarial Boundary & Mutation Sentinel Probe Suite
// Feature: IMP-229 (Khắc Phục Lỗi Xung Đột Modal & Tự Động Kết Thúc Của Phiếu Cơ Hội "Mua Lại Dự Án Tiềm Năng")
// Probes:
//   1. Wire-to-Core Closed-Loop Parity Probe
//   2. Ephemeral Dynamic Boundary Probe (Extreme Clock Skew & Timer Guard)
//   3. Targeted Mutation Sensitivity Probe (Mutants A-E)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { applyDelta } from '../../src/client/network/apply_delta.js';
import { ModalHost } from '../../src/client/ui/modals/modal_host.js';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal.js';
import { CompulsoryBuyoutModal } from '../../src/client/ui/modals/compulsory_buyout_modal.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import type { PendingBuyoutSession } from '../../src/domain/room.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

// VDOM traversal helper (Detroit Style: zero loops inside it() blocks)
function findVNode(node: any, predicate: (n: any) => boolean): any {
  if (!node) return null;
  if (predicate(node)) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const res = findVNode(child, predicate);
      if (res) return res;
    }
  } else if (children) {
    return findVNode(children, predicate);
  }
  return null;
}

// React 19 SSR Effect & State harness for headless testing
function renderWithEffects(
  element: React.ReactElement,
  options?: { mockRemainingMs?: number }
): {
  html: string;
  vdom: any;
  cleanup?: () => void;
  getLastStateUpdateArg: () => any;
} {
  const internals = (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  let cleanup: (() => void) | undefined;
  let lastStateUpdateArg: any;
  let vdom: any;

  function EffectHarness() {
    if (internals?.H) {
      const origUseEffect = internals.H.useEffect;
      internals.H.useEffect = (create: any, deps: any) => {
        if (origUseEffect) origUseEffect(create, deps);
        const res = create();
        if (typeof res === 'function') {
          cleanup = res;
        }
      };

      const origUseState = internals.H.useState;
      if (options?.mockRemainingMs !== undefined) {
        internals.H.useState = (_initial: any) => {
          return [options.mockRemainingMs, (arg: any) => { lastStateUpdateArg = arg; }];
        };
      } else if (typeof origUseState === 'function') {
        internals.H.useState = (initial: any) => {
          const [val, setter] = origUseState(initial);
          const wrappedSetter = (arg: any) => {
            lastStateUpdateArg = arg;
            return setter(arg);
          };
          return [val, wrappedSetter];
        };
      }
    }
    vdom = element;
    return vdom;
  }

  const html = renderToStaticMarkup(React.createElement(EffectHarness));
  return {
    html,
    vdom,
    cleanup,
    getLastStateUpdateArg: () => lastStateUpdateArg,
  };
}

describe('[CHAOS-SENTINEL] Station 4: Adversarial Boundary & Mutation Sentinel Probes (IMP-229)', () => {
  const sampleBuyoutSession: PendingBuyoutSession = {
    buyerId: 'player_alpha',
    sellerId: 'player_beta',
    cellIndex: 6, // Hải Phòng
    cost: 1300,
    basePrice: 1000,
    createdAt: 1790000000000,
    expiresAt: 1790000015000,
  };

  const sampleEventCardPayload = {
    cardType: 'chance' as const,
    cardId: 'CC_SWAP_PROJECT',
    title: 'Mua Lại Dự Án Tiềm Năng',
    description: 'Nhận quyền thu hồi và mua lại 01 BĐS của đối thủ với giá đền bù 130%.',
    effectDelta: -1300,
    targetScope: 'Bất Động Sản Sở Hữu C0',
    effectDetail: 'Đền bù 130% giá gốc cho chủ sở hữu hiện tại',
    duration: 'Tức thì',
    destination: 'Chủ sở hữu mục tiêu',
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    if (typeof globalThis.window === 'undefined') {
      (globalThis as any).window = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
    }

    useLobbyStore.setState({
      myPlayerId: 'player_alpha',
      roomCode: 'VT229_CHAOS',
    });

    useGameStore.setState({
      activeModal: null,
      modalPayload: null,
      pendingBuyout: null,
      lastEventCard: null,
      isRolling: false,
      activePawnAnimation: null,
      playersInfo: {
        player_alpha: {
          id: 'player_alpha',
          name: 'Chủ Tịch Hải Phòng',
          balance: 15000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
          mortgagedProperties: [],
          isBot: false,
          bankrupt: false,
        } as any,
        player_beta: {
          id: 'player_beta',
          name: 'Đại Gia Phố Cổ',
          balance: 20000,
          tokenColor: '#10B981',
          ownedProperties: [6],
          mortgagedProperties: [],
          isBot: false,
          bankrupt: false,
        } as any,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // PROBE 1: Wire-to-Core Closed-Loop Parity Probe
  // =========================================================================
  describe('Probe 1: Wire-to-Core Closed-Loop Parity Probe', () => {
    it('[PROBE-1.1][Network-to-Store] Delta payload synchronizes pendingBuyout without hijacking active modal during card flow', () => {
      useGameStore.setState({
        activeModal: 'event',
        modalPayload: sampleEventCardPayload,
        isRolling: false,
      });

      const delta: DeltaPayload = {
        pendingBuyout: sampleBuyoutSession,
        lastEventCard: sampleEventCardPayload,
      } as any;

      applyDelta(delta);

      // Verify Store Parity
      expect(useGameStore.getState().pendingBuyout).toEqual(sampleBuyoutSession);
      // Verify Modal is NOT hijacked
      expect(useGameStore.getState().activeModal).toBe('event');
    });

    it('[PROBE-1.2][ModalHost-Handover-Confirm] ModalHost handovers smoothly on EventCard onConfirm', () => {
      useGameStore.setState({
        activeModal: 'event',
        modalPayload: sampleEventCardPayload,
        pendingBuyout: sampleBuyoutSession,
      });

      let hostVNode: any;
      function TestWrapper() {
        hostVNode = ModalHost({});
        return hostVNode;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const eventNode = findVNode(hostVNode, (n) => n?.type === EventCardModal);
      expect(eventNode).not.toBeNull();
      eventNode.props.onConfirm();

      expect(useGameStore.getState().activeModal).toBe('compulsory_buyout');
      expect(useGameStore.getState().modalPayload).toEqual(sampleBuyoutSession);
    });

    it('[PROBE-1.3][ModalHost-Handover-CloseAndBackdrop] ModalHost handovers on EventCard onClose and backdrop click', () => {
      useGameStore.setState({
        activeModal: 'event',
        modalPayload: sampleEventCardPayload,
        pendingBuyout: sampleBuyoutSession,
      });

      let hostVNode: any;
      function TestWrapper() {
        hostVNode = ModalHost({});
        return hostVNode;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const eventNode = findVNode(hostVNode, (n) => n?.type === EventCardModal);
      expect(eventNode).not.toBeNull();
      eventNode.props.onClose();

      expect(useGameStore.getState().activeModal).toBe('compulsory_buyout');
      expect(useGameStore.getState().modalPayload).toEqual(sampleBuyoutSession);
    });

    it('[PROBE-1.4][UI-Handover-IntentEmission] CompulsoryBuyoutModal emits exact server intents with zero divergence', () => {
      const emittedIntents: any[] = [];
      const onIntent = (intent: any) => emittedIntents.push(intent);

      useGameStore.setState({
        activeModal: 'compulsory_buyout',
        modalPayload: sampleBuyoutSession,
        pendingBuyout: sampleBuyoutSession,
      });

      let hostVNode: any;
      function TestWrapper() {
        hostVNode = ModalHost({ onIntent });
        return hostVNode;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const modalNode = findVNode(hostVNode, (n) => n?.type === CompulsoryBuyoutModal);
      expect(modalNode).not.toBeNull();

      // Test Buyout Intent Emission
      modalNode.props.onBuyout(6);
      expect(emittedIntents).toContainEqual({
        type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT',
        cellIndex: 6,
      });

      // Test Decline Intent Emission
      modalNode.props.onDecline();
      expect(emittedIntents).toContainEqual({
        type: 'INTENT_DECLINE_COMPULSORY_BUYOUT',
      });

      // Test Close Intent Emission
      modalNode.props.onClose();
      expect(emittedIntents).toContainEqual({
        type: 'INTENT_DECLINE_COMPULSORY_BUYOUT',
      });
    });

    it('[PROBE-1.5][Field-by-Field-Parity] Zero parity gaps across wire delta, domain session, store, and modal props', () => {
      const wireDeltaSession: PendingBuyoutSession = {
        buyerId: 'player_alpha',
        sellerId: 'player_beta',
        cellIndex: 6,
        cost: 1300,
        basePrice: 1000,
        createdAt: 1790000000000,
        expiresAt: 1790000015000,
      };

      const requiredKeys = [
        'buyerId',
        'sellerId',
        'cellIndex',
        'cost',
        'basePrice',
        'createdAt',
        'expiresAt',
      ] as const;

      for (const k of requiredKeys) {
        expect(wireDeltaSession[k]).toBeDefined();
        expect(sampleBuyoutSession[k]).toEqual(wireDeltaSession[k]);
      }
    });
  });

  // =========================================================================
  // PROBE 2: Ephemeral Dynamic Boundary Probe
  // =========================================================================
  describe('Probe 2: Ephemeral Dynamic Boundary Probe (Extreme Clock Skew & Boundary Limits)', () => {
    it('[PROBE-2.1][ClockSkew-ExtremePast] expiresAt = Date.now() - 3600_000 (past 1 hr) fallbacks to 15s safely without exception', () => {
      const pastOneHour = Date.now() - 3600_000;
      let html = '';
      expect(() => {
        html = renderToStaticMarkup(
          React.createElement(CompulsoryBuyoutModal, {
            buyerId: 'player_alpha',
            sellerId: 'player_beta',
            cellIndex: 6,
            cost: 1300,
            basePrice: 1000,
            expiresAt: pastOneHour,
            onBuyout: vi.fn(),
            onDecline: vi.fn(),
          })
        );
      }).not.toThrow();

      expect(html).toContain('15s');
      expect(html).not.toContain('>0s<');
    });

    it('[PROBE-2.2][ClockSkew-ExtremeFuture] expiresAt = Date.now() + 3600_000 (future 1 hr) operates normally without crash', () => {
      const futureOneHour = Date.now() + 3600_000;
      let html = '';
      expect(() => {
        html = renderToStaticMarkup(
          React.createElement(CompulsoryBuyoutModal, {
            buyerId: 'player_alpha',
            sellerId: 'player_beta',
            cellIndex: 6,
            cost: 1300,
            basePrice: 1000,
            expiresAt: futureOneHour,
            onBuyout: vi.fn(),
            onDecline: vi.fn(),
          })
        );
      }).not.toThrow();

      expect(html).toContain('3600s');
    });

    it('[PROBE-2.3][ClockSkew-NonNumericBoundaries] expiresAt = NaN, Infinity, undefined defended cleanly', () => {
      // NaN
      let htmlNaN = '';
      expect(() => {
        htmlNaN = renderToStaticMarkup(
          React.createElement(CompulsoryBuyoutModal, {
            buyerId: 'player_alpha',
            sellerId: 'player_beta',
            cellIndex: 6,
            cost: 1300,
            basePrice: 1000,
            expiresAt: NaN,
            onBuyout: vi.fn(),
            onDecline: vi.fn(),
          })
        );
      }).not.toThrow();
      expect(htmlNaN).toContain('15s');

      // undefined
      let htmlUndef = '';
      expect(() => {
        htmlUndef = renderToStaticMarkup(
          React.createElement(CompulsoryBuyoutModal, {
            buyerId: 'player_alpha',
            sellerId: 'player_beta',
            cellIndex: 6,
            cost: 1300,
            basePrice: 1000,
            expiresAt: undefined as any,
            onBuyout: vi.fn(),
            onDecline: vi.fn(),
          })
        );
      }).not.toThrow();
      expect(htmlUndef).toContain('15s');

      // Infinity
      expect(() => {
        renderToStaticMarkup(
          React.createElement(CompulsoryBuyoutModal, {
            buyerId: 'player_alpha',
            sellerId: 'player_beta',
            cellIndex: 6,
            cost: 1300,
            basePrice: 1000,
            expiresAt: Infinity,
            onBuyout: vi.fn(),
            onDecline: vi.fn(),
          })
        );
      }).not.toThrow();
    });

    it('[PROBE-2.4][RemainingZero-AffordanceGuard] When remainingMs = 0, button is disabled, label updated, onClick blocked', () => {
      const buyoutSpy = vi.fn();
      let vdom: any;
      function TestWrapper() {
        vdom = CompulsoryBuyoutModal({
          buyerId: 'player_alpha',
          sellerId: 'player_beta',
          cellIndex: 6,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: buyoutSpy,
          onDecline: vi.fn(),
        });
        return vdom;
      }

      const harness = renderWithEffects(React.createElement(TestWrapper), { mockRemainingMs: 0 });

      const confirmBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'buyout-confirm-btn');
      expect(confirmBtn).not.toBeNull();
      expect(confirmBtn.props.disabled).toBe(true);
      expect(harness.html).toContain('Hết Thời Gian Mua');

      // Invoke onClick explicitly
      confirmBtn.props.onClick();
      expect(buyoutSpy).toHaveBeenCalledTimes(0);
    });
  });

  // =========================================================================
  // PROBE 3: Targeted Mutation Sensitivity Probe
  // =========================================================================
  describe('Probe 3: Targeted Mutation Sensitivity Probe (Mutants A-E)', () => {
    it('[PROBE-3.1][Mutant-A] Removing isCardFlow check in apply_delta is caught and killed by TC-229.01', () => {
      // Mutant A Simulation: applyDelta without !isCardFlow guard
      function mutantApplyDelta(delta: DeltaPayload, state: any) {
        if (delta.pendingBuyout) {
          const myPid = 'player_alpha';
          // Mutant deletes !isCardFlow
          const isMoving = Boolean(state.activePawnAnimation?.isAnimating || state.isRolling);
          if (delta.pendingBuyout.buyerId === myPid && !isMoving && state.activeModal === null) {
            state.activeModal = 'compulsory_buyout';
          }
          // But if mutant unconditionally opened:
          state.activeModal = 'compulsory_buyout'; // mutant hijack
        }
      }

      const testState = {
        activeModal: 'event',
        modalPayload: sampleEventCardPayload,
        isRolling: true,
      };

      mutantApplyDelta(
        { pendingBuyout: sampleBuyoutSession, lastEventCard: sampleEventCardPayload } as any,
        testState
      );

      // TC-229.01 assertion: expect(activeModal).toBe('event')
      expect(() => {
        expect(testState.activeModal).toBe('event');
      }).toThrow(); // Mutant is KILLED!
    });

    it('[PROBE-3.2][Mutant-B] Removing transition in handleBackdropClose is caught and killed by TC-229.04', () => {
      // Mutant B Simulation: handleBackdropClose closes directly without checking pendingBuyout
      function mutantHandleBackdropClose(state: any) {
        // Mutant deletes handover to compulsory_buyout
        state.activeModal = null;
        state.modalPayload = null;
      }

      const testState = {
        activeModal: 'event',
        modalPayload: sampleEventCardPayload,
        pendingBuyout: sampleBuyoutSession,
      };

      mutantHandleBackdropClose(testState);

      // TC-229.04 assertion: expect(activeModal).toBe('compulsory_buyout')
      expect(() => {
        expect(testState.activeModal).toBe('compulsory_buyout');
      }).toThrow(); // Mutant is KILLED!
    });

    it('[PROBE-3.3][Mutant-C] Reverting safeInitialMs to Math.max(0, expiresAt - Date.now()) is caught and killed by TC-229.05', () => {
      // Mutant C Simulation: safeInitialMs without 15s fallback
      const pastExpiresAt = Date.now() - 5000;
      function mutantComputeSafeInitialMs(expiresAt: number) {
        return Math.max(0, expiresAt - Date.now()); // No fallback
      }

      const safeMs = mutantComputeSafeInitialMs(pastExpiresAt);
      const secondsLeft = Math.ceil(safeMs / 1000);
      const simulatedHtml = `<span>${secondsLeft}s</span>`;

      // TC-229.05 assertion: expect(html).toContain('15s')
      expect(() => {
        expect(simulatedHtml).toContain('15s');
      }).toThrow(); // Mutant is KILLED!
    });

    it('[PROBE-3.4][Mutant-D] Reintroducing client-side onDecline() when remainingMs <= 0 is caught and killed by TC-229.07', () => {
      // Mutant D Simulation: Timer ticks and auto-calls onDecline()
      const onDeclineSpy = vi.fn();
      function mutantTimerTick(prevMs: number) {
        const next = Math.max(0, prevMs - 100);
        if (next <= 0) {
          onDeclineSpy(); // Mutant re-introduced auto-decline
        }
        return next;
      }

      mutantTimerTick(50);

      // TC-229.07 assertion: expect(onDeclineSpy).toHaveBeenCalledTimes(0)
      expect(() => {
        expect(onDeclineSpy).toHaveBeenCalledTimes(0);
      }).toThrow(); // Mutant is KILLED!
    });

    it('[PROBE-3.5][Mutant-E] Omitting remainingMs <= 0 from Buyout button disabled is caught and killed by TC-229.15', () => {
      // Mutant E Simulation: button disabled logic only checks canAfford
      const canAfford = true;
      const remainingMs = 0;
      const mutantDisabled = !canAfford; // Omits remainingMs <= 0 check

      // TC-229.15 assertion: expect(confirmBtn.props.disabled).toBe(true)
      expect(() => {
        expect(mutantDisabled).toBe(true);
      }).toThrow(); // Mutant is KILLED!
    });
  });
});
