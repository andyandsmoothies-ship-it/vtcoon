// @vitest-environment happy-dom
// [CONTRACT TEST] IMP-229: Khắc Phục Lỗi Xung Đột Modal & Tự Động Kết Thúc Của Phiếu Cơ Hội "Mua Lại Dự Án Tiềm Năng"
// Universal 5-Facet Behavioral Matrix & Detroit Style
// Traceability Tags: [TC-229.01/MSS..TC-229.16/MSS] & [UC-IMP229]
// Architecture: Modal Sequencing, Clock Skew Resilience, Zero Auto-Decline, Buyer Identity Isolation & Commercial Affordance

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { applyDelta } from '../../src/client/network/apply_delta.js';
import { ModalHost } from '../../src/client/ui/modals/modal_host.js';
import { CompulsoryBuyoutModal } from '../../src/client/ui/modals/compulsory_buyout_modal.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import type { DeltaPayload } from '../../src/server/delta_types.js';
import type { PendingBuyoutSession, EventCardInfo } from '../../src/domain/room.js';

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

interface MountResult {
  readonly container: HTMLDivElement;
  readonly unmount: () => void;
}

const activeMounts: MountResult[] = [];

function mountComponent(element: React.ReactElement): MountResult {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);
  act(() => {
    root.render(element);
  });
  const res: MountResult = {
    container,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
  activeMounts.push(res);
  return res;
}

function applyDeltaTest(delta: Partial<DeltaPayload>): void {
  applyDelta({
    tick: 1,
    cells: [],
    ...delta,
  });
}

describe('[IMP-229][Trạm 1 RED] Compulsory Buyout Modal Collision & Clock Skew Contract Suite', () => {
  const sampleBuyoutSession: PendingBuyoutSession = {
    buyerId: 'player_alpha',
    sellerId: 'player_beta',
    cellIndex: 6, // Hải Phòng
    cost: 1300,
    basePrice: 1000,
    createdAt: 1790000000000,
    expiresAt: 1790000015000,
  };

  const sampleEventCardPayload: EventCardInfo = {
    id: 'CC_SWAP_PROJECT',
    type: 'Chance',
    cardType: 'chance',
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
        },
        player_beta: {
          id: 'player_beta',
          name: 'Đại Gia Phố Cổ',
          balance: 20000,
          tokenColor: '#10B981',
          ownedProperties: [6],
          mortgagedProperties: [],
          isBot: false,
          bankrupt: false,
        },
      },
    });
  });

  afterEach(() => {
    while (activeMounts.length > 0) {
      activeMounts.pop()?.unmount();
    }
    vi.restoreAllMocks();
    vi.useRealTimers();
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

      applyDeltaTest({
        pendingBuyout: sampleBuyoutSession,
        lastEventCard: sampleEventCardPayload,
      });

      expect(useGameStore.getState().activeModal).toBe('event');
      expect(useGameStore.getState().activeModal).not.toBe('compulsory_buyout');
    });

    it('[TC-229.02/MSS][UC-IMP229][Facet-1/PendingBuyoutSavedToStore] Mặc dù không cướp modal, pendingBuyout vẫn được lưu đầy đủ vào gameStore.pendingBuyout', () => {
      useGameStore.setState({
        activeModal: 'event',
        modalPayload: sampleEventCardPayload,
        isRolling: true,
      });

      applyDeltaTest({
        pendingBuyout: sampleBuyoutSession,
        lastEventCard: sampleEventCardPayload,
      });

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

      const mounted = mountComponent(React.createElement(ModalHost));

      const confirmBtn = mounted.container.querySelector('button[data-testid="event-card-confirm-btn"]');
      expect(confirmBtn).not.toBeNull();

      act(() => {
        confirmBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(useGameStore.getState().activeModal).toBe('compulsory_buyout');
      expect(useGameStore.getState().modalPayload).toEqual(sampleBuyoutSession);
    });

    it('[TC-229.04/MSS][UC-IMP229][Facet-1/SequentialTransitionOnBackdrop] Khi người chơi click backdrop hoặc Esc trên EventCardModal trong ModalHost khi có pendingBuyout thuộc về mình, hệ thống chuyển tiếp mở compulsory_buyout thay vì đóng hẳn, chống deadlock kẹt lượt', () => {
      useGameStore.setState({
        activeModal: 'event',
        modalPayload: sampleEventCardPayload,
        pendingBuyout: sampleBuyoutSession,
      });

      const mounted = mountComponent(React.createElement(ModalHost));

      const closeBtn = mounted.container.querySelector('button[aria-label="Đóng thẻ sự kiện"]');
      expect(closeBtn).not.toBeNull();

      act(() => {
        closeBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

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
      const mounted = mountComponent(
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

      const timerEl = mounted.container.querySelector('[data-testid="buyout-timer"]');
      expect(timerEl?.textContent).toContain('15s');
      expect(timerEl?.textContent).not.toContain('0s');
    });

    it('[TC-229.06/MSS][UC-IMP229][Facet-2/RelativeTickDecrement] Đếm ngược tương đối giảm chính xác theo nhịp timer mà không phụ thuộc vào Date.now() (dùng vi.useFakeTimers())', () => {
      vi.useFakeTimers();
      const mounted = mountComponent(
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

      const timerEl = mounted.container.querySelector('[data-testid="buyout-timer"]');
      expect(timerEl?.textContent).toContain('15s');

      act(() => {
        vi.advanceTimersByTime(1100);
      });

      expect(timerEl?.textContent).toContain('14s');
    });

    it('[TC-229.07/MSS][UC-IMP229][Facet-2/ZeroAutoDeclineOnZero] Khi timer đếm về 0ms, onDecline TUYỆT ĐỐI KHÔNG được gọi (spy onDecline có toHaveBeenCalledTimes(0))', () => {
      vi.useFakeTimers();
      const onDeclineSpy = vi.fn();

      mountComponent(
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

      act(() => {
        vi.advanceTimersByTime(16000);
      });

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

      applyDeltaTest({
        pendingBuyout: sampleBuyoutSession,
      });

      expect(useGameStore.getState().activeModal).toBeNull();
    });

    it('[TC-229.09/MSS][UC-IMP229][Facet-3/DirectModalOpenOnReconnect] Khi nhận delta.pendingBuyout mà không có hoạt cảnh/thẻ sự kiện (activeModal === null, reconnect), modal compulsory_buyout mở trực tiếp bình thường', () => {
      useGameStore.setState({
        activeModal: null,
        isRolling: false,
        activePawnAnimation: null,
        lastEventCard: null,
      });

      applyDeltaTest({
        pendingBuyout: sampleBuyoutSession,
      });

      expect(useGameStore.getState().activeModal).toBe('compulsory_buyout');
      expect(useGameStore.getState().modalPayload).toEqual(sampleBuyoutSession);
    });

    it('[TC-229.10/MSS][UC-IMP229][Facet-3/StandardEventModalClosesNormally] Thẻ sự kiện thông thường không có pendingBuyout đóng bình thường mà không mở modal nào khác', () => {
      const standardMarketCard: EventCardInfo = {
        id: 'MC_BOOM_TIMES',
        type: 'Market',
        cardType: 'market',
        cardId: 'MC_BOOM_TIMES',
        title: 'Thị Trường Bùng Nổ',
        description: 'Giá đất toàn thị trường tăng trưởng mạnh.',
      };

      useGameStore.setState({
        activeModal: 'event',
        modalPayload: standardMarketCard,
        pendingBuyout: null,
      });

      const mounted = mountComponent(React.createElement(ModalHost));

      const confirmBtn = mounted.container.querySelector('button[data-testid="event-card-confirm-btn"]');
      expect(confirmBtn).not.toBeNull();

      act(() => {
        confirmBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

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

      applyDeltaTest({
        pendingBuyout: null,
      });

      expect(useGameStore.getState().activeModal).toBeNull();
      expect(useGameStore.getState().pendingBuyout).toBeNull();
    });

    it('[TC-229.12/MSS][UC-IMP229][Facet-4/UnmountClearsInterval] Component CompulsoryBuyoutModal unmount dọn sạch clearInterval (zero timer leak)', () => {
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

      const mounted = mountComponent(
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

      mounted.unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('[TC-229.13/MSS][UC-IMP229][Facet-4/ManualDeclineEmitsIntent] Khi người chơi bấm "✕ Từ Chối Mua", onDecline được gọi đúng 1 lần', () => {
      const onDeclineSpy = vi.fn();
      const mounted = mountComponent(
        React.createElement(CompulsoryBuyoutModal, {
          buyerId: 'player_alpha',
          sellerId: 'player_beta',
          cellIndex: 6,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: vi.fn(),
          onDecline: onDeclineSpy,
        })
      );

      const declineBtn = mounted.container.querySelector('button[data-testid="buyout-decline-btn"]');
      expect(declineBtn).not.toBeNull();

      act(() => {
        declineBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(onDeclineSpy).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // FACET 5: Khả Năng Mua & Bảo Toàn Giao Diện (Commercial Affordance & UI)
  // =========================================================================
  describe('Facet 5: Khả Năng Mua & Bảo Toàn Giao Diện (Commercial Affordance & UI)', () => {
    it('[TC-229.14/MSS][UC-IMP229][Facet-5/ManualBuyoutEmitsIntent] Khi người chơi đủ tiền bấm "Mua Lại", onBuyout được gọi với đúng cellIndex', () => {
      const onBuyoutSpy = vi.fn();
      const mounted = mountComponent(
        React.createElement(CompulsoryBuyoutModal, {
          buyerId: 'player_alpha',
          sellerId: 'player_beta',
          cellIndex: 6,
          cost: 1300,
          basePrice: 1000,
          expiresAt: Date.now() + 15000,
          onBuyout: onBuyoutSpy,
          onDecline: vi.fn(),
        })
      );

      const confirmBtn = mounted.container.querySelector('button[data-testid="buyout-confirm-btn"]');
      expect(confirmBtn).not.toBeNull();

      act(() => {
        confirmBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(onBuyoutSpy).toHaveBeenCalledTimes(1);
      expect(onBuyoutSpy).toHaveBeenCalledWith(6);
    });

    it('[TC-229.15/MSS][UC-IMP229][Facet-5/BuyoutDisabledOnTimeExpiry] Khi remainingMs <= 0, nút Mua Lại bị disabled và chuyển nhãn thành "Hết Thời Gian Mua"', () => {
      vi.useFakeTimers();
      const mounted = mountComponent(
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

      act(() => {
        vi.advanceTimersByTime(15500);
      });

      const confirmBtn = mounted.container.querySelector('button[data-testid="buyout-confirm-btn"]');
      expect(confirmBtn).not.toBeNull();
      expect(confirmBtn?.hasAttribute('disabled')).toBe(true);
      expect(confirmBtn?.textContent).toContain('Hết Thời Gian Mua');
    });

    it('[TC-229.16/MSS][UC-IMP229][Facet-5/ShortfallNoticeIntegrity] Khi người chơi thiếu tiền, hiển thị đầy đủ thông báo thiếu tiền và vô hiệu hóa nút mua', () => {
      useGameStore.setState({
        playersInfo: {
          player_alpha: {
            id: 'player_alpha',
            name: 'Chủ Tịch Hải Phòng',
            balance: 500, // Shortfall: 1300 - 500 = 800
            tokenColor: '#38BDF8',
            ownedProperties: [],
          },
          player_beta: {
            id: 'player_beta',
            name: 'Đại Gia Phố Cổ',
            balance: 20000,
            tokenColor: '#10B981',
            ownedProperties: [6],
          },
        },
      });

      const mounted = mountComponent(
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

      const confirmBtn = mounted.container.querySelector('button[data-testid="buyout-confirm-btn"]');
      expect(confirmBtn).not.toBeNull();
      expect(confirmBtn?.hasAttribute('disabled')).toBe(true);

      const shortfallNotice = mounted.container.querySelector('[data-testid="buyout-shortfall-notice"]');
      expect(shortfallNotice).not.toBeNull();
      expect(shortfallNotice?.textContent).toContain('Thiếu: 800');
    });
  });
});
