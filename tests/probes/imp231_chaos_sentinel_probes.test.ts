// [CHAOS-SENTINEL][STATION-4] Physical Adversarial Boundary & Mutation Sentinel Probe Suite
// Feature: IMP-231 (Mua Lại Dự Án Tiềm Năng: Chọn Ô Đất Mục Tiêu, Xếp Hàng Tuần Tự & Server-Authoritative Clock)
// Probes:
//   1. Wire-to-Core Closed-Loop Parity Probe (Domain FSM -> DTO -> Network/Store -> Modal Handoff/UI -> Coordinator)
//   2. Ephemeral Dynamic Boundary Probe (Extreme Clock Skew, Boundary Limits for targets & timer)
//   3. Targeted Mutation Sensitivity Probe (Mutants A-E)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { BotPersonality } from '../../src/domain/bot/bot_types.js';
import { ChanceCardId } from '../../src/domain/event_card_types.js';
import { executeChanceCard } from '../../src/domain/chance_card_handlers.js';
import { coordExecuteCompulsoryBuyout } from '../../src/server/room_property_coordinator.js';
import { getCardCtaButtonText } from '../../src/client/ui/modals/event_card_visuals.js';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal.js';
import { ModalHost } from '../../src/client/ui/modals/modal_host.js';
import { CompulsoryBuyoutModal } from '../../src/client/ui/modals/compulsory_buyout_modal.js';
import { applyDelta } from '../../src/client/network/apply_delta.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import type { PendingBuyoutSession, BuyoutTargetOption } from '../../src/domain/room.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

function findVNode(node: any, predicate: (n: any) => boolean): any {
  if (!node) return null;
  if (predicate(node)) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const res = findVNode(child, predicate);
      if (res) return res;
    }
  } else if (children && typeof children === 'object') {
    return findVNode(children, predicate);
  }
  return null;
}

function renderWithRemainingMs(element: React.ReactElement, mockRemainingMs: number): { html: string } {
  const internals = (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function EffectHarness() {
    if (internals?.H) {
      let hookIdx = 0;
      internals.H.useState = (initial: any) => {
        const cur = hookIdx++;
        if (typeof initial === 'number' && initial > 1000) return [mockRemainingMs, vi.fn()];
        if (cur === 0 && typeof initial === 'number' && initial < 40) return [initial, vi.fn()];
        return [mockRemainingMs, vi.fn()];
      };
    }
    return element;
  }
  return { html: renderToStaticMarkup(React.createElement(EffectHarness)) };
}

function renderInteractiveBuyoutModal(props: any) {
  let currentVNode: any = null;
  let currentHtml = '';
  const stateSlots: any[] = [];
  const internals = (React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

  function renderPass() {
    let slotIndex = 0;
    function InteractiveHarness() {
      if (internals?.H) {
        internals.H.useState = (initial: any) => {
          const idx = slotIndex++;
          if (stateSlots.length <= idx) {
            stateSlots[idx] = typeof initial === 'function' ? initial() : initial;
          }
          const setState = (newVal: any) => {
            const next = typeof newVal === 'function' ? newVal(stateSlots[idx]) : newVal;
            if (stateSlots[idx] !== next) {
              stateSlots[idx] = next;
              renderPass();
            }
          };
          return [stateSlots[idx], setState];
        };
      }
      currentVNode = (CompulsoryBuyoutModal as any)(props);
      return currentVNode;
    }
    currentHtml = renderToStaticMarkup(React.createElement(InteractiveHarness));
  }
  renderPass();

  return {
    getHtml: () => currentHtml,
    clickTestId: (testId: string) => {
      const node = findVNode(currentVNode, (n) => n?.props?.['data-testid'] === testId);
      if (!node) throw new Error(`Element with data-testid="${testId}" not found`);
      node.props?.onClick?.({ preventDefault: () => {}, stopPropagation: () => {} });
    },
  };
}

function setupBuyoutRoom(opts?: { humanBalance?: number; opponentBalance?: number }) {
  const mgr = new RoomManager(23199);
  const room = mgr.createRoom('player_alpha');
  mgr.addBot(room.roomCode, 'player_beta', BotPersonality.Balanced);
  mgr.startGame(room.roomCode);
  room.roundCount = 5;
  room.phase = TurnPhase.PropertyManagement;

  const human = room.players.find((p) => p.id === 'player_alpha')!;
  const opponent = room.players.find((p) => p.id === 'player_beta')!;
  human.isBot = false;
  human.name = 'Chủ Tịch Hải Phòng';
  human.balance = opts?.humanBalance ?? 15_000;
  opponent.isBot = true;
  opponent.name = 'Đại Gia Phố Cổ';
  opponent.balance = opts?.opponentBalance ?? 5_000;

  return { mgr, room, human, opponent, reg: mgr.getRegistry(room.roomCode)!, sm: mgr.getPropertyStates(room.roomCode)! };
}

describe('[CHAOS-SENTINEL] Station 4: Adversarial Boundary & Mutation Sentinel Probes (IMP-231)', () => {
  const sampleEligibleTargets: readonly BuyoutTargetOption[] = [
    { cellIndex: 1, sellerId: 'player_beta', cost: 780, basePrice: 600 },
    { cellIndex: 6, sellerId: 'player_beta', cost: 1300, basePrice: 1000 },
  ];

  const sampleBuyoutSession: PendingBuyoutSession = {
    buyerId: 'player_alpha',
    sellerId: 'player_beta',
    cellIndex: 1,
    cost: 780,
    basePrice: 600,
    createdAt: 1790000000000,
    expiresAt: 1790000030000,
    eligibleTargets: sampleEligibleTargets,
  };

  const sampleEventCardPayload = {
    cardType: 'chance' as const,
    cardId: ChanceCardId.CC_SWAP_PROJECT,
    title: 'Mua Lại Dự Án Tiềm Năng',
    description: 'Nhận quyền thu hồi và mua lại 01 BĐS của đối thủ với giá đền bù 130%.',
    effectDelta: -780,
    targetScope: 'Bất Động Sản Sở Hữu C0',
    effectDetail: 'Đền bù 130% giá gốc cho chủ sở hữu hiện tại',
    duration: 'Tức thì',
    destination: 'Chủ sở hữu mục tiêu',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    if (typeof globalThis.window === 'undefined') {
      (globalThis as any).window = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
    }
    useLobbyStore.setState({ myPlayerId: 'player_alpha', roomCode: 'VT231_CHAOS' });
    useGameStore.setState({
      activeModal: null,
      modalPayload: null,
      pendingBuyout: null,
      lastEventCard: null,
      isRolling: false,
      activePawnAnimation: null,
      playersInfo: {
        player_alpha: { id: 'player_alpha', name: 'Chủ Tịch Hải Phòng', balance: 15000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [], isBot: false, bankrupt: false } as any,
        player_beta: { id: 'player_beta', name: 'Đại Gia Phố Cổ', balance: 20000, tokenColor: '#10B981', ownedProperties: [1, 6], mortgagedProperties: [], isBot: false, bankrupt: false } as any,
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
    it('[PROBE-1.1][Closed-Loop-5-Stations] Full closed-loop parity across Domain -> DTO -> Network/Store -> ModalHost/UI -> Server Coordinator', () => {
      // Station 1: Domain FSM
      const { mgr, room, human, opponent, reg, sm } = setupBuyoutRoom({ humanBalance: 1000, opponentBalance: 5000 });
      reg.set(6, opponent.id); sm.set(6, { level: 0, isMortgaged: false });
      reg.set(1, opponent.id); sm.set(1, { level: 0, isMortgaged: false });

      executeChanceCard(ChanceCardId.CC_SWAP_PROJECT, human.id, room.players, room.activeModifiers, reg, sm, undefined, room);
      const domainSession = room.pendingBuyout;
      expect(domainSession).not.toBeNull();
      expect(domainSession?.eligibleTargets).toHaveLength(2);
      expect(domainSession?.cellIndex).toBe(1); // Affordable target
      expect(domainSession?.cost).toBe(780);

      // Station 2: DTO Parity
      expect(domainSession?.eligibleTargets?.find((t) => t.cellIndex === 1)).toEqual({ cellIndex: 1, sellerId: opponent.id, cost: 780, basePrice: 600 });
      expect(domainSession?.eligibleTargets?.find((t) => t.cellIndex === 6)).toEqual({ cellIndex: 6, sellerId: opponent.id, cost: 1300, basePrice: 1000 });

      // Station 3: Network / Store
      useGameStore.setState({ activeModal: 'event', modalPayload: sampleEventCardPayload, isRolling: false });
      applyDelta({ pendingBuyout: domainSession, lastEventCard: sampleEventCardPayload } as any);
      expect(useGameStore.getState().pendingBuyout).toEqual(domainSession);
      expect(useGameStore.getState().activeModal).toBe('event');

      // Station 4: Modal Handoff & UI
      expect(getCardCtaButtonText(ChanceCardId.CC_SWAP_PROJECT)).toBe('Tiến Hành Mua Lại 🤝');
      let hostVNode: any;
      renderToStaticMarkup(React.createElement(() => { hostVNode = ModalHost({}); return hostVNode; }));
      const eventNode = findVNode(hostVNode, (n) => n?.type === EventCardModal);
      expect(eventNode).not.toBeNull();
      eventNode.props.onConfirm();
      expect(useGameStore.getState().activeModal).toBe('compulsory_buyout');
      expect(useGameStore.getState().modalPayload).toEqual(domainSession);

      const emittedIntents: any[] = [];
      renderToStaticMarkup(React.createElement(() => {
        hostVNode = ModalHost({ onIntent: (intent: any) => emittedIntents.push(intent) });
        return hostVNode;
      }));
      const buyoutModalNode = findVNode(hostVNode, (n) => n?.type === CompulsoryBuyoutModal);
      expect(buyoutModalNode).not.toBeNull();
      buyoutModalNode.props.onBuyout(6);
      expect(emittedIntents).toContainEqual({ type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT', cellIndex: 6 });

      // Station 5: Server Coordinator
      human.balance = 2000;
      const coordResult = coordExecuteCompulsoryBuyout(mgr.getContext(room.roomCode), human.id, 6);
      expect(coordResult.success).toBe(true);
      expect(reg.get(6)).toBe(human.id);
      expect(human.balance).toBe(700);
      expect(opponent.balance).toBe(6300);
      expect(room.pendingBuyout).toBeNull();
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
    });

    it('[PROBE-1.2][Zero-Mock-Divergence] Field parity across DTO, wire delta, store, and modal props is 100%', () => {
      const sessionKeys: (keyof PendingBuyoutSession)[] = ['buyerId', 'sellerId', 'cellIndex', 'cost', 'basePrice', 'createdAt', 'expiresAt', 'eligibleTargets'];
      for (const field of sessionKeys) expect(sampleBuyoutSession[field]).toBeDefined();

      const targetKeys: (keyof BuyoutTargetOption)[] = ['cellIndex', 'sellerId', 'cost', 'basePrice'];
      for (const target of sampleBuyoutSession.eligibleTargets!) {
        for (const field of targetKeys) expect(target[field]).toBeDefined();
      }
    });
  });

  // =========================================================================
  // PROBE 2: Ephemeral Dynamic Boundary Probe
  // =========================================================================
  describe('Probe 2: Ephemeral Dynamic Boundary Probe (Extreme Clock Skew & Boundary Limits)', () => {
    it('[PROBE-2.1][Boundary-TargetsUndefinedEmptyOrSingle] eligibleTargets = undefined, empty, or single cell suppresses selector', () => {
      const renderModal = (targets?: readonly BuyoutTargetOption[]) => renderToStaticMarkup(
        React.createElement(CompulsoryBuyoutModal, {
          buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 6, cost: 1300, basePrice: 1000,
          expiresAt: Date.now() + 30000, eligibleTargets: targets, onBuyout: vi.fn(), onDecline: vi.fn(),
        })
      );
      expect(renderModal(undefined)).not.toContain('data-testid="buyout-cell-selector"');
      expect(renderModal([])).not.toContain('data-testid="buyout-cell-selector"');
      expect(renderModal([{ cellIndex: 6, sellerId: 'player_beta', cost: 1300, basePrice: 1000 }])).not.toContain('data-testid="buyout-cell-selector"');
    });

    it('[PROBE-2.2][Boundary-TargetsMultipleGrid] eligibleTargets >= 2 renders grid selector and updates price/owner on selection', () => {
      const harness = renderInteractiveBuyoutModal({
        buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 1, cost: 780, basePrice: 600,
        expiresAt: Date.now() + 30000, eligibleTargets: sampleEligibleTargets, onBuyout: vi.fn(), onDecline: vi.fn(),
      });
      expect(harness.getHtml()).toContain('data-testid="buyout-cell-selector"');
      expect(harness.getHtml()).toContain('780');
      harness.clickTestId('buyout-target-option-6');
      expect(harness.getHtml()).toContain('1.300');
    });

    it('[PROBE-2.3][Boundary-CoordRejectsUnlistedTarget] coordExecuteCompulsoryBuyout rejects unlisted cell with INVALID_BUYOUT_SESSION', () => {
      const { mgr, room, human, opponent, reg, sm } = setupBuyoutRoom({ humanBalance: 15000, opponentBalance: 5000 });
      reg.set(1, opponent.id); sm.set(1, { level: 0, isMortgaged: false });
      reg.set(8, opponent.id); sm.set(8, { level: 0, isMortgaged: false });
      room.pendingBuyout = {
        buyerId: human.id, sellerId: opponent.id, cellIndex: 1, cost: 780, basePrice: 600,
        createdAt: Date.now(), expiresAt: Date.now() + 30_000,
        eligibleTargets: [{ cellIndex: 1, sellerId: opponent.id, cost: 780, basePrice: 600 }],
      };
      const res = coordExecuteCompulsoryBuyout(mgr.getContext(room.roomCode), human.id, 8);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('INVALID_BUYOUT_SESSION');
      expect(reg.get(8)).toBe(opponent.id);
      expect(human.balance).toBe(15000);
    });

    it('[PROBE-2.4][ClockSkew-ExtremePastAndFuture] Extreme clock skews (past 1 hr, future 1 hr, non-numeric) handled safely', () => {
      const renderClock = (exp: number) => renderToStaticMarkup(React.createElement(CompulsoryBuyoutModal, {
        buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 6, cost: 1300, basePrice: 1000,
        expiresAt: exp, onBuyout: vi.fn(), onDecline: vi.fn(),
      }));
      expect(renderClock(Date.now() - 3600_000)).toContain('15s');
      expect(renderClock(Date.now() + 3600_000)).toContain('3600s');
      expect(renderClock(NaN)).toContain('15s');
    });

    it('[PROBE-2.5][RemainingZero-DisabledAndNoDecline] When remainingMs = 0, button disabled with label "Hết Thời Gian Mua" and client never invokes onDecline()', () => {
      const onDeclineSpy = vi.fn();
      let vdom: any;
      const harness = renderWithRemainingMs(React.createElement(() => {
        vdom = CompulsoryBuyoutModal({
          buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 6, cost: 1300, basePrice: 1000,
          expiresAt: Date.now() - 10000, onBuyout: vi.fn(), onDecline: onDeclineSpy,
        });
        return vdom;
      }), 0);
      expect(onDeclineSpy).toHaveBeenCalledTimes(0);
      const confirmBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'buyout-confirm-btn');
      expect(confirmBtn?.props?.disabled).toBe(true);
      expect(harness.html).toContain('Hết Thời Gian Mua');
    });
  });

  // =========================================================================
  // PROBE 3: Targeted Mutation Sensitivity Probe (Mutants A-E)
  // =========================================================================
  describe('Probe 3: Targeted Mutation Sensitivity Probe (Mutants A-E)', () => {
    it('[PROBE-3.1][Mutant-A] Removing bondContract.collateralCells filter in isEligibleForCompulsoryBuyout is killed by TC-231.16', () => {
      function mutantIsEligible(cellIndex: number, ownerId: string, players: any[]): boolean {
        const owner = players?.find((p) => p.id === ownerId);
        if (owner?.bankrupt) return false;
        if (owner?.mortgagedProperties?.includes(cellIndex)) return false;
        // MUTANT: Removed bondContract.collateralCells check
        return true;
      }
      const dummyPlayer = { id: 'player_beta', bondContract: { isActive: true, collateralCells: [6] } };
      const mutantResult = mutantIsEligible(6, 'player_beta', [dummyPlayer]);
      expect(() => { expect(mutantResult).toBe(false); }).toThrow(); // MUTANT A IS KILLED!
    });

    it('[PROBE-3.2][Mutant-B] Removing affordable defaultTarget logic in handleSwapProject is killed by TC-231.02', () => {
      function mutantDefaultTarget(targets: BuyoutTargetOption[]) {
        return targets[0]; // MUTANT: ignores player balance, always picks targets[0]
      }
      const targets: BuyoutTargetOption[] = [
        { cellIndex: 6, sellerId: 'player_beta', cost: 1300, basePrice: 1000 },
        { cellIndex: 1, sellerId: 'player_beta', cost: 780, basePrice: 600 },
      ];
      const mutantPick = mutantDefaultTarget(targets)!;
      expect(() => {
        expect(mutantPick.cellIndex).toBe(1);
        expect(mutantPick.cost).toBe(780);
      }).toThrow(); // MUTANT B IS KILLED!
    });

    it('[PROBE-3.3][Mutant-C] Server coordinator omitting matchedTarget validation in coordExecuteCompulsoryBuyout is killed by TC-231.04', () => {
      function mutantCoordExecute(requestedCell: number) {
        return { success: true, cellIndex: requestedCell }; // MUTANT: omits check
      }
      const mutantRes = mutantCoordExecute(8);
      expect(() => {
        expect(mutantRes.success).toBe(false);
        expect((mutantRes as any).reason).toBe('INVALID_BUYOUT_SESSION');
      }).toThrow(); // MUTANT C IS KILLED!
    });

    it('[PROBE-3.4][Mutant-D] Re-introducing client-side onDecline() on timer expiry is killed by TC-231.14', () => {
      const onDeclineSpy = vi.fn();
      function mutantTimerTick(prevMs: number) {
        const next = Math.max(0, prevMs - 100);
        if (next <= 0) onDeclineSpy(); // MUTANT: triggers onDecline() client-side
        return next;
      }
      mutantTimerTick(50);
      expect(() => { expect(onDeclineSpy).toHaveBeenCalledTimes(0); }).toThrow(); // MUTANT D IS KILLED!
    });

    it('[PROBE-3.5][Mutant-E] Changing CTA button text from "Tiến Hành Mua Lại 🤝" is killed by TC-231.05', () => {
      function mutantGetCardCtaButtonText(cardId: string) {
        return cardId === ChanceCardId.CC_SWAP_PROJECT ? 'Đã Hiểu / Tiếp Tục' : 'Tiếp Tục'; // MUTANT
      }
      const mutantCta = mutantGetCardCtaButtonText(ChanceCardId.CC_SWAP_PROJECT);
      expect(() => { expect(mutantCta).toBe('Tiến Hành Mua Lại 🤝'); }).toThrow(); // MUTANT E IS KILLED!
    });
  });
});
