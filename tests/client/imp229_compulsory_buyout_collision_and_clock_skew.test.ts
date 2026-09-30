// [CONTRACT TEST] IMP-229: Khắc Phục Lỗi Xung Đột Modal & Tự Động Kết Thúc Của Phiếu Cơ Hội "Mua Lại Dự Án Tiềm Năng"
// Universal 5-Facet Behavioral Matrix & Detroit Style
// Traceability Tags: [TC-229.01/MSS..TC-229.16/MSS] & [UC-IMP229]
// Architecture: Modal Sequencing, Clock Skew Resilience, Zero Auto-Decline, Buyer Identity Isolation & Commercial Affordance

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { applyDelta } from '../../src/client/network/apply_delta.js';
import { ModalHost } from '../../src/client/ui/modals/modal_host.js';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal.js';
import { CompulsoryBuyoutModal } from '../../src/client/ui/modals/compulsory_buyout_modal.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';

// VDOM traversal helper (defined outside it() to enforce Detroit style: zero loops in it())
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

// React 19 SSR effect execution harness for headless Node testing
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

describe('[IMP-229][Trạm 1 RED] Compulsory Buyout Modal Collision & Clock Skew Contract Suite', () => {
  const sampleBuyoutSession = {
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
      roomCode: 'VT229A',
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
  // FACET 1: Tuần Tự Hóa & Chống Va Chạm Modal (Modal Sequencing & Collision Defense)
  // =========================================================================
  describe('Facet 1: Tuần Tự Hóa & Chống Va Chạm Modal (Modal Sequencing & Collision Defense)', () => {
    it('[TC-229.01/MSS][UC-IMP229][Facet-1/NoModalCollisionOnEventCard] Khi nhận delta.pendingBuyout kèm delta.lastEventCard hoặc khi cờ đang di chuyển (isRolling = true), apply_delta KHÔNG cướp modal, activeModal không bị đổi thành compulsory_buyout', () => {
      useGameStore.setState({
        activeModal: 'event',
        modalPayload: sampleEventCardPayload,
        isRolling: true,
      });

      applyDelta({
        pendingBuyout: sampleBuyoutSession,
        lastEventCard: sampleEventCardPayload,
      } as any);

      expect(useGameStore.getState().activeModal).toBe('event');
      expect(useGameStore.getState().activeModal).not.toBe('compulsory_buyout');
    });

    it('[TC-229.02/MSS][UC-IMP229][Facet-1/PendingBuyoutSavedToStore] Mặc dù không cướp modal, pendingBuyout vẫn được lưu đầy đủ vào gameStore.pendingBuyout', () => {
      useGameStore.setState({
        activeModal: 'event',
        modalPayload: sampleEventCardPayload,
        isRolling: true,
      });

      applyDelta({
        pendingBuyout: sampleBuyoutSession,
        lastEventCard: sampleEventCardPayload,
      } as any);

      const storedBuyout = useGameStore.getState().pendingBuyout;
      expect(storedBuyout).not.toBeNull();
      expect(storedBuyout?.buyerId).toBe('player_alpha');
      expect(storedBuyout?.cellIndex).toBe(6);
    });

    it('[TC-229.03/MSS][UC-IMP229][Facet-1/SequentialTransitionOnConfirm] Khi người chơi bấm xác nhận trên EventCardModal trong ModalHost, modal event đóng lại và modal compulsory_buyout mở ra ngay lập tức với đúng payload từ pendingBuyout', () => {
      useGameStore.setState({
        activeModal: 'event',
        modalPayload: sampleEventCardPayload,
        pendingBuyout: sampleBuyoutSession,
      });

      let hostVNode: any;
      function TestHostWrapper() {
        hostVNode = ModalHost({});
        return hostVNode;
      }
      renderToStaticMarkup(React.createElement(TestHostWrapper));

      const eventCardNode = findVNode(hostVNode, (n) => n?.type === EventCardModal);
      expect(eventCardNode).not.toBeNull();

      eventCardNode.props.onConfirm();

      expect(useGameStore.getState().activeModal).toBe('compulsory_buyout');
      expect(useGameStore.getState().modalPayload).toEqual(sampleBuyoutSession);
    });

    it('[TC-229.04/MSS][UC-IMP229][Facet-1/SequentialTransitionOnBackdrop] Khi người chơi click backdrop hoặc Esc trên EventCardModal trong ModalHost khi có pendingBuyout thuộc về mình, hệ thống chuyển tiếp mở compulsory_buyout thay vì đóng hẳn, chống deadlock kẹt lượt', () => {
      useGameStore.setState({
        activeModal: 'event',
        modalPayload: sampleEventCardPayload,
        pendingBuyout: sampleBuyoutSession,
      });

      let hostVNode: any;
      function TestHostWrapper() {
        hostVNode = ModalHost({});
        return hostVNode;
      }
      renderToStaticMarkup(React.createElement(TestHostWrapper));

      expect(hostVNode?.props?.onClose).toBeDefined();
      hostVNode.props.onClose();

      expect(useGameStore.getState().activeModal).toBe('compulsory_buyout');
      expect(useGameStore.getState().modalPayload).toEqual(sampleBuyoutSession);
    });
  });

  // =========================================================================
  // FACET 2: Phòng Vệ Lệch Đồng Hồ & Đếm Ngược Tương Đối (Clock Skew Resilience)
  // =========================================================================
  describe('Facet 2: Phòng Vệ Lệch Đồng Hồ & Đếm Ngược Tương Đối (Clock Skew Resilience)', () => {
    it('[TC-229.05/MSS][UC-IMP229][Facet-2/ClockSkewFallbackTo15s] Khi expiresAt <= Date.now() (lệch giờ máy tính so với server), CompulsoryBuyoutModal tự động fallback về 15.000ms (15s), không bị hiển thị 0s hay đóng tức thì', () => {
      const pastExpiresAt = Date.now() - 5000; // Client clock is 5 seconds behind server
      const html = renderToStaticMarkup(
        React.createElement(CompulsoryBuyoutModal, {
          buyerId: 'player_alpha',
          sellerId: 'player_beta',
          cellIndex: 6,
          cost: 1300,
          basePrice: 1000,
          expiresAt: pastExpiresAt,
          onBuyout: vi.fn(),
          onDecline: vi.fn(),
        })
      );

      expect(html).toContain('15s');
      expect(html).not.toContain('>0s<');
    });

    it('[TC-229.06/MSS][UC-IMP229][Facet-2/RelativeTickDecrement] Đếm ngược tương đối giảm chính xác theo nhịp timer mà không phụ thuộc vào Date.now() (dùng vi.useFakeTimers())', () => {
      let tickFn: (() => void) | undefined;
      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval').mockImplementation(((fn: any) => {
        tickFn = fn;
        return 888 as any;
      }) as any);

      const harness = renderWithEffects(
        React.createElement(CompulsoryBuyoutModal, {
          buyerId: 'player_alpha',
          sellerId: 'player_beta',
          cellIndex: 6,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: vi.fn(),
          onDecline: vi.fn(),
        })
      );

      setIntervalSpy.mockRestore();

      expect(typeof tickFn).toBe('function');
      tickFn?.();

      const lastArg = harness.getLastStateUpdateArg();
      expect(typeof lastArg).toBe('function');
      expect(lastArg(15000)).toBe(14900);
    });

    it('[TC-229.07/MSS][UC-IMP229][Facet-2/ZeroAutoDeclineOnZero] Khi timer đếm về 0ms, onDecline TUYỆT ĐỐI KHÔNG được gọi (spy onDecline có toHaveBeenCalledTimes(0))', () => {
      const onDeclineSpy = vi.fn();
      let tickFn: (() => void) | undefined;

      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval').mockImplementation(((fn: any) => {
        tickFn = fn;
        return 999 as any;
      }) as any);

      renderWithEffects(
        React.createElement(CompulsoryBuyoutModal, {
          buyerId: 'player_alpha',
          sellerId: 'player_beta',
          cellIndex: 6,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now(), // Expires right now
          onBuyout: vi.fn(),
          onDecline: onDeclineSpy,
        })
      );

      setIntervalSpy.mockRestore();

      expect(typeof tickFn).toBe('function');
      tickFn?.();

      expect(onDeclineSpy).toHaveBeenCalledTimes(0);
    });
  });

  // =========================================================================
  // FACET 3: Cách Ly Danh Tính Người Chơi (Buyer Identification & Attribution)
  // =========================================================================
  describe('Facet 3: Cách Ly Danh Tính Người Chơi (Buyer Identification & Attribution)', () => {
    it('[TC-229.08/MSS][UC-IMP229][Facet-3/ThirdPartyPlayerNoModal] Người chơi khác trong phòng (myPlayerId !== buyerId) nhận pendingBuyout nhưng KHÔNG mở modal compulsory_buyout', () => {
      useLobbyStore.setState({ myPlayerId: 'player_gamma' });
      useGameStore.setState({ activeModal: null });

      applyDelta({
        pendingBuyout: sampleBuyoutSession,
      } as any);

      expect(useGameStore.getState().activeModal).toBeNull();
    });

    it('[TC-229.09/MSS][UC-IMP229][Facet-3/DirectModalOpenOnReconnect] Khi nhận delta.pendingBuyout mà không có hoạt cảnh/thẻ sự kiện (activeModal === null, reconnect), modal compulsory_buyout mở trực tiếp bình thường', () => {
      useGameStore.setState({
        activeModal: null,
        isRolling: false,
        activePawnAnimation: null,
        lastEventCard: null,
      });

      applyDelta({
        pendingBuyout: sampleBuyoutSession,
      } as any);

      expect(useGameStore.getState().activeModal).toBe('compulsory_buyout');
      expect(useGameStore.getState().modalPayload).toEqual(sampleBuyoutSession);
    });

    it('[TC-229.10/MSS][UC-IMP229][Facet-3/StandardEventModalClosesNormally] Thẻ sự kiện thông thường không có pendingBuyout đóng bình thường mà không mở modal nào khác', () => {
      const standardMarketCard = {
        cardType: 'market' as const,
        cardId: 'MC_BOOM_TIMES',
        title: 'Thị Trường Bùng Nổ',
        description: 'Giá đất toàn thị trường tăng trưởng mạnh.',
      };

      useGameStore.setState({
        activeModal: 'event',
        modalPayload: standardMarketCard,
        pendingBuyout: null,
      });

      let hostVNode: any;
      function TestHostWrapper() {
        hostVNode = ModalHost({});
        return hostVNode;
      }
      renderToStaticMarkup(React.createElement(TestHostWrapper));

      const eventCardNode = findVNode(hostVNode, (n) => n?.type === EventCardModal);
      expect(eventCardNode).not.toBeNull();

      eventCardNode.props.onConfirm();

      expect(useGameStore.getState().activeModal).toBeNull();
      expect(useGameStore.getState().modalPayload).toBeNull();
    });
  });

  // =========================================================================
  // FACET 4: Dọn Dẹp Trạng Thái & Teardown Khép Kín (Lifecycle Teardown)
  // =========================================================================
  describe('Facet 4: Dọn Dẹp Trạng Thái & Teardown Khép Kín (Lifecycle Teardown)', () => {
    it('[TC-229.11/MSS][UC-IMP229][Facet-4/ServerDeltaNullClosesModal] Khi server gửi delta.pendingBuyout = null, apply_delta đóng modal compulsory_buyout sạch sẽ', () => {
      useGameStore.setState({
        activeModal: 'compulsory_buyout',
        modalPayload: sampleBuyoutSession,
        pendingBuyout: sampleBuyoutSession,
      });

      applyDelta({
        pendingBuyout: null,
      } as any);

      expect(useGameStore.getState().activeModal).toBeNull();
      expect(useGameStore.getState().pendingBuyout).toBeNull();
    });

    it('[TC-229.12/MSS][UC-IMP229][Facet-4/UnmountClearsInterval] Component CompulsoryBuyoutModal unmount dọn sạch clearInterval (zero timer leak)', () => {
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

      const harness = renderWithEffects(
        React.createElement(CompulsoryBuyoutModal, {
          buyerId: 'player_alpha',
          sellerId: 'player_beta',
          cellIndex: 6,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: vi.fn(),
          onDecline: vi.fn(),
        })
      );

      expect(typeof harness.cleanup).toBe('function');
      harness.cleanup?.();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('[TC-229.13/MSS][UC-IMP229][Facet-4/ManualDeclineEmitsIntent] Khi người chơi bấm "✕ Từ Chối Mua", onDecline được gọi đúng 1 lần', () => {
      const onDeclineSpy = vi.fn();
      let vdom: any;

      function TestWrapper() {
        vdom = CompulsoryBuyoutModal({
          buyerId: 'player_alpha',
          sellerId: 'player_beta',
          cellIndex: 6,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: vi.fn(),
          onDecline: onDeclineSpy,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const declineBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'buyout-decline-btn');
      expect(declineBtn).not.toBeNull();
      declineBtn.props.onClick();

      expect(onDeclineSpy).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // FACET 5: Khả Năng Mua & Bảo Toàn Giao Diện (Commercial Affordance & UI)
  // =========================================================================
  describe('Facet 5: Khả Năng Mua & Bảo Toàn Giao Diện (Commercial Affordance & UI)', () => {
    it('[TC-229.14/MSS][UC-IMP229][Facet-5/ManualBuyoutEmitsIntent] Khi người chơi đủ tiền bấm "Mua Lại", onBuyout được gọi với đúng cellIndex', () => {
      const onBuyoutSpy = vi.fn();
      let vdom: any;

      function TestWrapper() {
        vdom = CompulsoryBuyoutModal({
          buyerId: 'player_alpha',
          sellerId: 'player_beta',
          cellIndex: 6,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: onBuyoutSpy,
          onDecline: vi.fn(),
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const confirmBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'buyout-confirm-btn');
      expect(confirmBtn).not.toBeNull();
      confirmBtn.props.onClick();

      expect(onBuyoutSpy).toHaveBeenCalledTimes(1);
      expect(onBuyoutSpy).toHaveBeenCalledWith(6);
    });

    it('[TC-229.15/MSS][UC-IMP229][Facet-5/BuyoutDisabledOnTimeExpiry] Khi remainingMs <= 0, nút Mua Lại bị disabled và chuyển nhãn thành "Hết Thời Gian Mua"', () => {
      let vdom: any;

      function TestWrapper() {
        vdom = CompulsoryBuyoutModal({
          buyerId: 'player_alpha',
          sellerId: 'player_beta',
          cellIndex: 6,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: vi.fn(),
          onDecline: vi.fn(),
        });
        return vdom;
      }

      const harness = renderWithEffects(React.createElement(TestWrapper), { mockRemainingMs: 0 });

      const confirmBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'buyout-confirm-btn');
      expect(confirmBtn).not.toBeNull();
      expect(confirmBtn.props.disabled).toBe(true);
      expect(harness.html).toContain('Hết Thời Gian Mua');
    });

    it('[TC-229.16/MSS][UC-IMP229][Facet-5/ShortfallNoticeIntegrity] Khi người chơi thiếu tiền, hiển thị đầy đủ thông báo thiếu tiền và vô hiệu hóa nút mua', () => {
      useGameStore.setState({
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Chủ Tịch Hải Phòng',
            balance: 500, // Shortfall: 1300 - 500 = 800
          } as any,
          player_beta: {
            id: 'player_beta',
            name: 'Đại Gia Phố Cổ',
            balance: 20000,
          } as any,
        },
      });

      let vdom: any;
      function TestWrapper() {
        vdom = CompulsoryBuyoutModal({
          buyerId: 'player_alpha',
          sellerId: 'player_beta',
          cellIndex: 6,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: vi.fn(),
          onDecline: vi.fn(),
        });
        return vdom;
      }
      const html = renderToStaticMarkup(React.createElement(TestWrapper));

      const confirmBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'buyout-confirm-btn');
      expect(confirmBtn).not.toBeNull();
      expect(confirmBtn.props.disabled).toBe(true);

      expect(html).toContain('data-testid="buyout-shortfall-notice"');
      expect(html).toContain('Thiếu: 800');
    });
  });
});
