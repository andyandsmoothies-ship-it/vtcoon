// [CONTRACT TEST] IMP-231: Mua Lại Dự Án Tiềm Năng (Chọn Ô Đất Mục Tiêu, Xếp Hàng Tuần Tự & Server-Authoritative Clock)
// Universal 5-Facet Behavioral Matrix & Detroit Style
// Traceability Tags: [TC-231.01/MSS..TC-231.16/MSS] & [UC-IMP231]
// Architecture: Domain Multi-Target Gathering, Sequential Handover, Interactive Property Selector, Dynamic Solvency Affordance, Robustness & Regression Guard

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { BotPersonality } from '../../src/domain/bot/bot_types.js';
import { ChanceCardId } from '../../src/domain/event_card_types.js';
import { executeChanceCard } from '../../src/domain/chance_card_handlers.js';
import { isEligibleForCompulsoryBuyout } from '../../src/domain/compulsory_buyout.js';
import { coordExecuteCompulsoryBuyout } from '../../src/server/room_property_coordinator.js';
import { getCardCtaButtonText } from '../../src/client/ui/modals/event_card_visuals.js';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal.js';
import { ModalHost } from '../../src/client/ui/modals/modal_host.js';
import { CompulsoryBuyoutModal } from '../../src/client/ui/modals/compulsory_buyout_modal.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';

export interface BuyoutTargetOption {
  readonly cellIndex: number;
  readonly sellerId: string;
  readonly cost: number;
  readonly basePrice: number;
}

export interface PendingBuyoutSessionWithTargets {
  readonly buyerId: string;
  readonly sellerId: string;
  readonly cellIndex: number;
  readonly cost: number;
  readonly basePrice: number;
  readonly createdAt: number;
  readonly expiresAt: number;
  readonly eligibleTargets?: readonly BuyoutTargetOption[];
}

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
  const html = renderToStaticMarkup(React.createElement(EffectHarness));
  return { html };
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
        internals.H.useSyncExternalStore = (_subscribe: any, getSnapshot: any) => getSnapshot();
      }
      currentVNode = (CompulsoryBuyoutModal as any)(props);
      return currentVNode;
    }
    currentHtml = renderToStaticMarkup(React.createElement(InteractiveHarness));
  }
  renderPass();

  return {
    getVNode: () => currentVNode,
    getHtml: () => currentHtml,
    findTestId: (testId: string) => findVNode(currentVNode, (n) => n?.props?.['data-testid'] === testId),
    clickTestId: (testId: string) => {
      const node = findVNode(currentVNode, (n) => n?.props?.['data-testid'] === testId);
      if (!node) throw new Error(`Element with data-testid="${testId}" not found`);
      if (typeof node.props?.onClick === 'function') {
        node.props.onClick({ preventDefault: () => {}, stopPropagation: () => {} });
      }
    },
  };
}

function setupBuyoutRoom(opts?: { humanBalance?: number; opponentBalance?: number; roundCount?: number }) {
  const mgr = new RoomManager(23101);
  const room = mgr.createRoom('player_alpha');
  mgr.addBot(room.roomCode, 'player_beta', BotPersonality.Balanced);
  mgr.startGame(room.roomCode);
  room.roundCount = opts?.roundCount ?? 5;
  room.phase = TurnPhase.PropertyManagement;

  const human = room.players.find((p) => p.id === 'player_alpha')!;
  const opponent = room.players.find((p) => p.id === 'player_beta')!;
  human.isBot = false;
  human.name = 'Chủ Tịch Hải Phòng';
  human.balance = opts?.humanBalance ?? 15_000;
  opponent.isBot = true;
  opponent.name = 'Đại Gia Phố Cổ';
  opponent.balance = opts?.opponentBalance ?? 5_000;

  const reg = mgr.getRegistry(room.roomCode)!;
  const sm = mgr.getPropertyStates(room.roomCode)!;
  return { mgr, room, human, opponent, reg, sm };
}

describe('[IMP-231][Trạm 1 RED] Compulsory Buyout Property Selection & Sequential Handover Contract Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    if (typeof globalThis.window === 'undefined') {
      (globalThis as any).window = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
    }
    useLobbyStore.setState({ myPlayerId: 'player_alpha', roomCode: 'VT231A' });
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
        player_gamma: { id: 'player_gamma', name: 'Tài Phiệt Bến Nghé', balance: 25000, tokenColor: '#F59E0B', ownedProperties: [8], mortgagedProperties: [], isBot: false, bankrupt: false } as any,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: Thu Thập & Đa Mục Tiêu Phía Server (Domain & Multi-Target Gathering)
  // =========================================================================
  describe('Facet 1: Thu Thập & Đa Mục Tiêu Phía Server (Domain & Multi-Target Gathering)', () => {
    it('[TC-231.01/MSS][UC-IMP231][Facet-1/GatherAllEligibleC0Targets] handleSwapProject thu thập đầy đủ toàn bộ các ô C0 đủ điều kiện của đối thủ vào mảng eligibleTargets', () => {
      const { room, human, opponent, reg, sm } = setupBuyoutRoom({ humanBalance: 15000, opponentBalance: 5000 });
      reg.set(1, opponent.id);
      sm.set(1, { level: 0, isMortgaged: false });
      reg.set(6, opponent.id);
      sm.set(6, { level: 0, isMortgaged: false });
      reg.set(8, opponent.id);
      sm.set(8, { level: 0, isMortgaged: false });

      executeChanceCard(ChanceCardId.CC_SWAP_PROJECT, human.id, room.players, room.activeModifiers, reg, sm, undefined, room);

      const session = room.pendingBuyout as PendingBuyoutSessionWithTargets | null | undefined;
      expect(session).toBeDefined();
      expect(session?.eligibleTargets).toBeDefined();
      expect(session?.eligibleTargets).toHaveLength(3);
      const cellIndices = (session?.eligibleTargets ?? []).map((t) => t.cellIndex);
      expect(cellIndices).toEqual(expect.arrayContaining([1, 6, 8]));
    });

    it('[TC-231.02/MSS][UC-IMP231][Facet-1/DefaultTargetIsAffordable] defaultTarget trong pendingBuyout ưu tiên chọn ô đất vừa túi tiền của người chơi thay vì gán mù quáng ô đầu tiên đắt tiền', () => {
      const { room, human, opponent, reg, sm } = setupBuyoutRoom({ humanBalance: 1000, opponentBalance: 5000 });
      reg.set(6, opponent.id);
      sm.set(6, { level: 0, isMortgaged: false });
      reg.set(1, opponent.id);
      sm.set(1, { level: 0, isMortgaged: false });

      executeChanceCard(ChanceCardId.CC_SWAP_PROJECT, human.id, room.players, room.activeModifiers, reg, sm, undefined, room);

      expect(room.pendingBuyout).not.toBeNull();
      expect(room.pendingBuyout?.cellIndex).toBe(1);
      expect(room.pendingBuyout?.cost).toBe(780);
      expect(human.balance).toBe(1000);
    });

    it('[TC-231.03/MSS][UC-IMP231][Facet-1/CoordExecutesSelectedCell] coordExecuteCompulsoryBuyout thực thi thành công việc chuyển nhượng cho ô thứ 2 hoặc thứ 3 trong eligibleTargets khi người chơi gửi intent kèm cellIndex đó', () => {
      const { mgr, room, human, opponent, reg, sm } = setupBuyoutRoom({ humanBalance: 15000, opponentBalance: 5000 });
      reg.set(1, opponent.id);
      sm.set(1, { level: 0, isMortgaged: false });
      reg.set(6, opponent.id);
      sm.set(6, { level: 0, isMortgaged: false });

      room.pendingBuyout = {
        buyerId: human.id,
        sellerId: opponent.id,
        cellIndex: 1,
        cost: 780,
        basePrice: 600,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30_000,
        eligibleTargets: [
          { cellIndex: 1, sellerId: opponent.id, cost: 780, basePrice: 600 },
          { cellIndex: 6, sellerId: opponent.id, cost: 1300, basePrice: 1000 },
        ],
      } as any;

      const initialTreasury = room.treasury;
      const res = coordExecuteCompulsoryBuyout(mgr.getContext(room.roomCode), human.id, 6);
      expect(res.success).toBe(true);
      expect(reg.get(6)).toBe(human.id);
      expect({ buyer: human.balance, seller: opponent.balance }).toEqual({ buyer: 15000 - 1300, seller: 5000 + 1300 });
      expect(room.treasury).toBe(initialTreasury);
    });

    it('[TC-231.04/MSS][UC-IMP231][Facet-1/CoordRejectsUnlistedCell] coordExecuteCompulsoryBuyout từ chối với INVALID_BUYOUT_SESSION nếu gửi lên cellIndex không nằm trong eligibleTargets', () => {
      const { mgr, room, human, opponent, reg, sm } = setupBuyoutRoom({ humanBalance: 15000, opponentBalance: 5000 });
      reg.set(1, opponent.id);
      sm.set(1, { level: 0, isMortgaged: false });
      reg.set(8, opponent.id);
      sm.set(8, { level: 0, isMortgaged: false });

      room.pendingBuyout = {
        buyerId: human.id,
        sellerId: opponent.id,
        cellIndex: 1,
        cost: 780,
        basePrice: 600,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30_000,
        eligibleTargets: [{ cellIndex: 1, sellerId: opponent.id, cost: 780, basePrice: 600 }],
      } as any;

      const res = coordExecuteCompulsoryBuyout(mgr.getContext(room.roomCode), human.id, 8);
      expect(res.success).toBe(false);
      expect(res.reason).toBe('INVALID_BUYOUT_SESSION');
      expect(reg.get(8)).toBe(opponent.id);
      expect(human.balance).toBe(15000);
    });
  });

  // =========================================================================
  // FACET 2: Trải Nghiệm Xếp Hàng Tuần Tự & Nhãn CTA (Sequential Handover & CTA)
  // =========================================================================
  describe('Facet 2: Trải Nghiệm Xếp Hàng Tuần Tự & Nhãn CTA (Sequential Handover & CTA)', () => {
    it('[TC-231.05/MSS][UC-IMP231][Facet-2/CtaButtonTextIsTienHanhMuaLai] getCardCtaButtonText cho ChanceCardId.CC_SWAP_PROJECT trả về chính xác chuỗi Tiến Hành Mua Lại 🤝', () => {
      const ctaText = getCardCtaButtonText(ChanceCardId.CC_SWAP_PROJECT);
      expect(ctaText).toBe('Tiến Hành Mua Lại 🤝');
    });

    it('[TC-231.06/MSS][UC-IMP231][Facet-2/EventModalHoldsUntilPlayerClicks] Bảng 1 EventCardModal giữ nguyên không bị đếm ngược giục giã và chỉ chuyển tiếp mở Bảng 2 khi người chơi bấm nút CTA', () => {
      vi.useFakeTimers();
      try {
        const onConfirmSpy = vi.fn();
        let vdom: any;
        function Wrapper() {
          vdom = EventCardModal({
            cardType: 'chance',
            cardId: ChanceCardId.CC_SWAP_PROJECT,
            title: 'Mua Lại Dự Án Tiềm Năng',
            description: 'Nhận quyền thu hồi và mua lại 01 BĐS của đối thủ với giá đền bù 130%.',
            onConfirm: onConfirmSpy,
            onClose: vi.fn(),
          });
          return vdom;
        }
        const html = renderToStaticMarkup(React.createElement(Wrapper));
        expect(html).not.toContain('data-testid="buyout-timer"');

        vi.advanceTimersByTime(30000);
        expect(onConfirmSpy).toHaveBeenCalledTimes(0);

        const confirmBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'event-card-confirm-btn');
        expect(confirmBtn).not.toBeNull();
        confirmBtn.props.onClick();
        expect(onConfirmSpy).toHaveBeenCalledTimes(1);
      } finally {
        vi.useRealTimers();
      }
    });

    it('[TC-231.07/MSS][UC-IMP231][Facet-2/BackdropCloseAlsoTransitions] (Interactive mount test) Bấm backdrop trên EventCardModal trong ModalHost chuyển tiếp an toàn sang compulsory_buyout, chống deadlock kẹt lượt', () => {
      const sampleBuyout = {
        buyerId: 'player_alpha',
        sellerId: 'player_beta',
        cellIndex: 6,
        cost: 1300,
        basePrice: 1000,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30000,
        eligibleTargets: [{ cellIndex: 6, sellerId: 'player_beta', cost: 1300, basePrice: 1000 }],
      };

      useLobbyStore.setState({ myPlayerId: 'player_alpha' });
      useGameStore.setState({
        activeModal: 'event',
        modalPayload: {
          cardType: 'chance',
          cardId: ChanceCardId.CC_SWAP_PROJECT,
          title: 'Mua Lại Dự Án Tiềm Năng',
          description: 'Nhận quyền thu hồi và mua lại 01 BĐS của đối thủ với giá đền bù 130%.',
        },
        pendingBuyout: sampleBuyout,
      });

      let hostVNode: any;
      renderToStaticMarkup(React.createElement(() => {
        hostVNode = ModalHost({});
        return hostVNode;
      }));

      expect(hostVNode?.props?.onClose).toBeDefined();
      hostVNode.props.onClose();

      expect(useGameStore.getState().activeModal).toBe('compulsory_buyout');
      expect(useGameStore.getState().modalPayload).toEqual(sampleBuyout);
    });
  });

  // =========================================================================
  // FACET 3: Bộ Chọn Ô Đất Trên UI (Interactive Property Selector UI)
  // =========================================================================
  describe('Facet 3: Bộ Chọn Ô Đất Trên UI (Interactive Property Selector UI)', () => {
    it('[TC-231.08/MSS][UC-IMP231][Facet-3/SingleTargetHidesSelector] Khi eligibleTargets có <= 1 ô, component CompulsoryBuyoutModal không render khối selector để giữ giao diện tinh gọn', () => {
      const htmlSingle = renderToStaticMarkup(React.createElement(() => (CompulsoryBuyoutModal as any)({
        buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 6, cost: 1300, basePrice: 1000, expiresAt: Date.now() + 30000,
        eligibleTargets: [{ cellIndex: 6, sellerId: 'player_beta', cost: 1300, basePrice: 1000 }],
        onBuyout: vi.fn(), onDecline: vi.fn(),
      })));
      expect(htmlSingle).not.toContain('data-testid="buyout-cell-selector"');

      const htmlUndefined = renderToStaticMarkup(React.createElement(() => (CompulsoryBuyoutModal as any)({
        buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 6, cost: 1300, basePrice: 1000, expiresAt: Date.now() + 30000,
        eligibleTargets: undefined,
        onBuyout: vi.fn(), onDecline: vi.fn(),
      })));
      expect(htmlUndefined).not.toContain('data-testid="buyout-cell-selector"');
    });

    it('[TC-231.09/MSS][UC-IMP231][Facet-3/MultiTargetRendersSelector] Khi eligibleTargets có >= 2 ô, component render khối selector data-testid="buyout-cell-selector" với đầy đủ các nút bấm cho từng ô', () => {
      const multiTargets = [
        { cellIndex: 1, sellerId: 'player_beta', cost: 780, basePrice: 600 },
        { cellIndex: 6, sellerId: 'player_beta', cost: 1300, basePrice: 1000 },
        { cellIndex: 8, sellerId: 'player_gamma', cost: 1300, basePrice: 1000 },
      ];

      const html = renderToStaticMarkup(React.createElement(() => (CompulsoryBuyoutModal as any)({
        buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 1, cost: 780, basePrice: 600, expiresAt: Date.now() + 30000,
        eligibleTargets: multiTargets, onBuyout: vi.fn(), onDecline: vi.fn(),
      })));

      expect(html).toContain('data-testid="buyout-cell-selector"');
      expect(html).toContain('data-testid="buyout-target-option-1"');
      expect(html).toContain('data-testid="buyout-target-option-6"');
      expect(html).toContain('data-testid="buyout-target-option-8"');
    });

    it('[TC-231.10/MSS][UC-IMP231][Facet-3/SwitchingCellUpdatesPriceAndSeller] (Interactive mount test) Click chọn ô khác lập tức cập nhật giá 130%, tên ô đất và tên chủ sở hữu tương ứng trong modal', () => {
      useGameStore.setState({
        playersInfo: {
          player_alpha: { id: 'player_alpha', name: 'Chủ Tịch Hải Phòng', balance: 20000 } as any,
          player_beta: { id: 'player_beta', name: 'Đại Gia Phố Cổ', balance: 10000 } as any,
          player_gamma: { id: 'player_gamma', name: 'Tài Phiệt Bến Nghé', balance: 15000 } as any,
        },
      });

      const targets = [
        { cellIndex: 1, sellerId: 'player_beta', cost: 780, basePrice: 600 },
        { cellIndex: 8, sellerId: 'player_gamma', cost: 1560, basePrice: 1200 },
      ];

      const harness = renderInteractiveBuyoutModal({
        buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 1, cost: 780, basePrice: 600, expiresAt: Date.now() + 30000,
        eligibleTargets: targets, onBuyout: vi.fn(), onDecline: vi.fn(),
      });

      expect(harness.getHtml()).toContain('Đại Gia Phố Cổ');
      expect(harness.getHtml()).toContain('780');

      harness.clickTestId('buyout-target-option-8');

      expect(harness.getHtml()).toContain('Tài Phiệt Bến Nghé');
      expect(harness.getHtml()).toContain('1.560');
    });
  });

  // =========================================================================
  // FACET 4: Khả Năng Thanh Toán Theo Từng Ô (Dynamic Solvency Affordance)
  // =========================================================================
  describe('Facet 4: Khả Năng Thanh Toán Theo Từng Ô (Dynamic Solvency Affordance)', () => {
    it('[TC-231.11/MSS][UC-IMP231][Facet-4/AffordanceTogglesPerCell] (Interactive mount test) Nếu người chơi đủ tiền mua ô rẻ nhưng thiếu tiền mua ô đắt, nút Mua tự động chuyển giữa enabled và disabled khi click chọn qua lại giữa 2 ô', () => {
      useGameStore.setState({
        playersInfo: {
          player_alpha: { id: 'player_alpha', name: 'Chủ Tịch Hải Phòng', balance: 1000 } as any,
          player_beta: { id: 'player_beta', name: 'Đại Gia Phố Cổ', balance: 10000 } as any,
        },
      });

      const targets = [
        { cellIndex: 1, sellerId: 'player_beta', cost: 780, basePrice: 600 },
        { cellIndex: 6, sellerId: 'player_beta', cost: 1300, basePrice: 1000 },
      ];

      const harness = renderInteractiveBuyoutModal({
        buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 1, cost: 780, basePrice: 600, expiresAt: Date.now() + 30000,
        eligibleTargets: targets, onBuyout: vi.fn(), onDecline: vi.fn(),
      });

      const confirmBtn1 = harness.findTestId('buyout-confirm-btn');
      expect(confirmBtn1?.props?.disabled).toBe(false);

      harness.clickTestId('buyout-target-option-6');
      const confirmBtn6 = harness.findTestId('buyout-confirm-btn');
      expect(confirmBtn6?.props?.disabled).toBe(true);

      harness.clickTestId('buyout-target-option-1');
      const confirmBtn1Again = harness.findTestId('buyout-confirm-btn');
      expect(confirmBtn1Again?.props?.disabled).toBe(false);
    });

    it('[TC-231.12/MSS][UC-IMP231][Facet-4/ShortfallNoticeUpdatesDynamically] Thông báo thiếu tiền tự động cập nhật số tiền thiếu theo ô đất đang được chọn', () => {
      useGameStore.setState({
        playersInfo: {
          player_alpha: { id: 'player_alpha', name: 'Chủ Tịch Hải Phòng', balance: 500 } as any,
          player_beta: { id: 'player_beta', name: 'Đại Gia Phố Cổ', balance: 10000 } as any,
        },
      });

      const targets = [
        { cellIndex: 1, sellerId: 'player_beta', cost: 780, basePrice: 600 },
        { cellIndex: 6, sellerId: 'player_beta', cost: 1300, basePrice: 1000 },
      ];

      const harness = renderInteractiveBuyoutModal({
        buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 6, cost: 1300, basePrice: 1000, expiresAt: Date.now() + 30000,
        eligibleTargets: targets, onBuyout: vi.fn(), onDecline: vi.fn(),
      });

      expect(harness.getHtml()).toContain('Thiếu: 800');
      harness.clickTestId('buyout-target-option-1');
      expect(harness.getHtml()).toContain('Thiếu: 280');
    });

    it('[TC-231.13/MSS][UC-IMP231][Facet-4/BuyoutEmitsSelectedCellIndex] (Interactive mount test) Bấm nút Mua Lại kích hoạt onBuyout với đúng selectedCellIndex đã chọn', () => {
      useGameStore.setState({
        playersInfo: {
          player_alpha: { id: 'player_alpha', name: 'Chủ Tịch Hải Phòng', balance: 20000 } as any,
          player_beta: { id: 'player_beta', name: 'Đại Gia Phố Cổ', balance: 10000 } as any,
        },
      });

      const onBuyoutSpy = vi.fn();
      const targets = [
        { cellIndex: 1, sellerId: 'player_beta', cost: 780, basePrice: 600 },
        { cellIndex: 6, sellerId: 'player_beta', cost: 1300, basePrice: 1000 },
      ];

      const harness = renderInteractiveBuyoutModal({
        buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 1, cost: 780, basePrice: 600, expiresAt: Date.now() + 30000,
        eligibleTargets: targets, onBuyout: onBuyoutSpy, onDecline: vi.fn(),
      });

      harness.clickTestId('buyout-target-option-6');
      harness.clickTestId('buyout-confirm-btn');

      expect(onBuyoutSpy).toHaveBeenCalledTimes(1);
      expect(onBuyoutSpy).toHaveBeenCalledWith(6);
      expect(onBuyoutSpy).not.toHaveBeenCalledWith(1);
    });
  });

  // =========================================================================
  // FACET 5: Độ Bền Vững & Hồi Quy (Robustness & Regression Guard)
  // =========================================================================
  describe('Facet 5: Độ Bền Vững & Hồi Quy (Robustness & Regression Guard)', () => {
    it('[TC-231.14/MSS][UC-IMP231][Facet-5/ServerAuthoritativeZeroAutoDecline] Khi timer đếm về 0, onDecline không được gọi, nút Mua bị khóa thành Hết Thời Gian Mua', () => {
      const onDeclineSpy = vi.fn();
      let vdom: any;

      function Wrapper() {
        vdom = CompulsoryBuyoutModal({
          buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 6, cost: 1300, basePrice: 1000, expiresAt: Date.now() - 5000,
          onBuyout: vi.fn(), onDecline: onDeclineSpy,
        });
        return vdom;
      }

      const harness = renderWithRemainingMs(React.createElement(Wrapper), 0);
      expect(onDeclineSpy).toHaveBeenCalledTimes(0);
      const confirmBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'buyout-confirm-btn');
      expect(confirmBtn?.props?.disabled).toBe(true);
      expect(harness.html).toContain('Hết Thời Gian Mua');
    });

    it('[TC-231.15/MSS][UC-IMP231][Facet-5/SSRHeadlessRenderSafety] Kết xuất SSR CompulsoryBuyoutModal với eligibleTargets đa dạng chạy trơn tru 100% không lỗi', () => {
      const html1 = renderToStaticMarkup(React.createElement(CompulsoryBuyoutModal, {
        buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 6, cost: 1300, basePrice: 1000, expiresAt: Date.now() + 30000,
        onBuyout: vi.fn(), onDecline: vi.fn(),
      }));
      expect(html1).toContain('data-testid="compulsory-buyout-modal"');

      const html2 = renderToStaticMarkup(React.createElement(CompulsoryBuyoutModal as any, {
        buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 6, cost: 1300, basePrice: 1000, expiresAt: Date.now() + 30000,
        eligibleTargets: [], onBuyout: vi.fn(), onDecline: vi.fn(),
      }));
      expect(html2).toContain('data-testid="compulsory-buyout-modal"');

      const html3 = renderToStaticMarkup(React.createElement(CompulsoryBuyoutModal as any, {
        buyerId: 'player_alpha', sellerId: 'player_beta', cellIndex: 6, cost: 1300, basePrice: 1000, expiresAt: Date.now() + 30000,
        eligibleTargets: [
          { cellIndex: 1, sellerId: 'player_beta', cost: 780, basePrice: 600 },
          { cellIndex: 6, sellerId: 'player_beta', cost: 1300, basePrice: 1000 },
        ],
        onBuyout: vi.fn(), onDecline: vi.fn(),
      }));
      expect(html3).toContain('data-testid="compulsory-buyout-modal"');
    });

    it('[TC-231.16/MSS][UC-IMP231][Facet-5/BondCollateralFilterGuard] Các ô đất đang bị khóa thế chấp trái phiếu của đối thủ bị isEligibleForCompulsoryBuyout loại trừ 100% khỏi danh sách mua lại', () => {
      const { room, opponent, reg, sm } = setupBuyoutRoom();
      reg.set(6, opponent.id);
      sm.set(6, { level: 0, isMortgaged: false });

      (opponent as any).bondContract = {
        isActive: true,
        collateralCells: [6],
        borrowedAmount: 2000,
        dueRound: 10,
      };

      const eligible = isEligibleForCompulsoryBuyout(6, opponent.id, reg, sm, room, room.players);
      expect(eligible).toBe(false);
    });
  });
});
