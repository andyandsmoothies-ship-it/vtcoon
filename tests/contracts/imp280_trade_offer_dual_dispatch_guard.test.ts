// @vitest-environment happy-dom
// [CONTRACT TEST] IMP-280: Khóa Đồng Thuận Phản Hồi Đề Xuất Giao Dịch Bot (Trade Offer Dual-Dispatch & Resolution Sentinel Guard)
// Traceability Tags: [TC-280.01/MSS..TC-280.11/MSS] & [UC-IMP280]
// Universal 5-Facet Behavioral Matrix & Anti-TIDD SSOT Enforcement
// Exactly 11 Atomic Tests (1-4 assertions/test, zero loops in it(), zero dirty casts)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import {
  InlineBotTradeStrip,
  markTradeOfferResolved,
  resetTradeOfferResolutions,
} from '../../src/client/ui/modals/bot_trade_offer_strip.js';
import { purgeClientMatchSession } from '../../src/client/network/client_session_purger.js';
import { BotTradeOfferModal } from '../../src/client/ui/modals/bot_trade_offer_modal.js';
import {
  resolveActionableNotification,
  formatServerErrorMessage,
} from '../../src/client/ui/actionable_notification.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import type { PlayerIntent } from '../../src/server/intent_dispatcher.js';


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

// Helper outside it() to safely populate sentinel cache
function populateOffers(prefix: string, count: number): string[] {
  if (count <= 0) return [];
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const id = `${prefix}_${i}`;
    ids.push(id);
    markTradeOfferResolved?.(id);
  }
  return ids;
}

describe('[CONTRACT-TEST][TC-280/MSS][UC-IMP280] Trade Offer Dual-Dispatch & Resolution Sentinel Guard Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetTradeOfferResolutions?.();

    useLobbyStore.setState({ myPlayerId: 'p1' });
    useGameStore.setState({
      activeModal: null,
      modalPayload: null,
      pendingTradeOffer: null,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Sài Thành',
          balance: 10000,
          tokenColor: '#38BDF8',
          ownedProperties: [1],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: false,
        },
        bot1: {
          id: 'bot1',
          name: 'Bot Tỷ Phú',
          balance: 30000,
          tokenColor: '#F59E0B',
          ownedProperties: [3],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: true,
          bankrupt: false,
          inAudit: false,
        },
      },
    });
  });

  afterEach(() => {
    while (activeMounts.length > 0) {
      const mount = activeMounts.pop();
      if (mount) {
        mount.unmount();
      }
    }
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: Boundary & Range (TC-280.01 .. TC-280.03)
  // =========================================================================
  it('[TC-280.01/MSS][UC-IMP280] markTradeOfferResolved trả về true khi đăng ký đề xuất mới lần đầu', () => {
    const isNew = markTradeOfferResolved?.('offer_unit_01');
    const isDuplicate = markTradeOfferResolved?.('offer_unit_01');

    expect(isNew).toBe(true);
    expect(isDuplicate).toBe(false);
  });

  it('[TC-280.02/MSS][UC-IMP280] markTradeOfferResolved trả về false khi gọi lặp lại cho đề xuất đã giải quyết', () => {
    markTradeOfferResolved?.('offer_unit_02');
    const isDuplicate = markTradeOfferResolved?.('offer_unit_02');

    expect(isDuplicate).toBe(false);
  });

  it('[TC-280.03/MSS][UC-IMP280] Registry FIFO-100 thu hồi đề xuất cũ nhất khi ghi nhận đề xuất thứ 101', () => {
    populateOffers('fifo_seed', 100);
    markTradeOfferResolved?.('fifo_seed_100');

    expect(markTradeOfferResolved?.('fifo_seed_0')).toBe(true);
    expect(markTradeOfferResolved?.('fifo_seed_100')).toBe(false);
  });

  // =========================================================================
  // FACET 2: State Reactivity & Cross-Component Sentinel (TC-280.04 .. TC-280.06)
  // =========================================================================
  it('[TC-280.04/MSS][UC-IMP280] InlineBotTradeStrip không phát thêm intent từ chối khi đề xuất đã được giải quyết ở Modal và timer về 0ms', () => {
    const onIntentSpy = vi.fn();
    const offerId = 'offer_modal_resolved_01';

    markTradeOfferResolved?.(offerId);

    useGameStore.setState({
      activeModal: null,
      pendingTradeOffer: {
        offerId,
        cellIndex: 1,
        price: 2500,
        buyerId: 'bot1',
        sellerId: 'p1',
        expiresAt: Date.now() - 50,
      },
    });

    mountComponent(
      React.createElement(InlineBotTradeStrip, {
        onIntent: onIntentSpy,
        localPlayerId: 'p1',
      })
    );

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onIntentSpy).not.toHaveBeenCalled();
  });

  it('[TC-280.05/MSS][UC-IMP280] BotTradeOfferModal chặn intent chấp thuận khi đề xuất đã được đánh dấu giải quyết từ trước', () => {
    const onAcceptSpy = vi.fn();
    const offerId = 'offer_strip_rejected_01';

    markTradeOfferResolved?.(offerId);

    const { container } = mountComponent(
      React.createElement(BotTradeOfferModal, {
        offerId,
        cellIndex: 1,
        price: 2000,
        buyerId: 'bot1',
        sellerId: 'p1',
        expiresAt: Date.now() + 15000,
        onAccept: onAcceptSpy,
        onReject: vi.fn(),
      })
    );

    const acceptBtn = container.querySelector<HTMLButtonElement>('[data-testid="accept-trade-btn"]');
    act(() => {
      acceptBtn?.click();
    });

    expect(onAcceptSpy).not.toHaveBeenCalled();
  });

  it('[TC-280.06/MSS][UC-IMP280] BotTradeOfferModal kiểm tra khả chi canAccept trước và không khóa nhầm sentinel khi người chơi thiếu tiền', () => {
    const onAcceptSpy = vi.fn();
    const offerId = 'offer_shortfall_guard_01';

    const { container } = mountComponent(
      React.createElement(BotTradeOfferModal, {
        offerId,
        cellIndex: 1,
        price: -25000,
        buyerId: 'bot1',
        sellerId: 'p1',
        offeredCellIndex: 3,
        expiresAt: Date.now() + 15000,
        onAccept: onAcceptSpy,
        onReject: vi.fn(),
      })
    );

    const acceptBtn = container.querySelector<HTMLButtonElement>('[data-testid="accept-trade-btn"]');
    act(() => {
      acceptBtn?.click();
    });

    expect(onAcceptSpy).not.toHaveBeenCalled();
    expect(markTradeOfferResolved?.(offerId)).toBe(true);
  });

  // =========================================================================
  // FACET 3: Error Defense & Actionable Notifications (TC-280.07 .. TC-280.09)
  // =========================================================================
  it('[TC-280.07/MSS][UC-IMP280] resolveActionableNotification trả về icon 🤝 và tiêu đề Đề Xuất Đã Giải Quyết cho mã lỗi OFFER_ALREADY_RESOLVED', () => {
    const notif = resolveActionableNotification('OFFER_ALREADY_RESOLVED');

    expect(notif.icon).toBe('🤝');
    expect(notif.title).toBe('Đề Xuất Đã Giải Quyết');
    expect(notif.tone).toBe('warning');
  });

  it('[TC-280.08/MSS][UC-IMP280] resolveActionableNotification trả về icon 🚨 và tiêu đề Đã Tuyên Bố Phá Sản cho BANKRUPT và alias PLAYER_BANKRUPT', () => {
    const notifBankrupt = resolveActionableNotification('BANKRUPT');
    const notifPlayerBankrupt = resolveActionableNotification('PLAYER_BANKRUPT');

    expect(notifBankrupt.icon).toBe('🚨');
    expect(notifBankrupt.title).toBe('Đã Tuyên Bố Phá Sản');
    expect(notifPlayerBankrupt.title).toBe('Đã Tuyên Bố Phá Sản');
  });

  it('[TC-280.09/MSS][UC-IMP280] formatServerErrorMessage không sinh chuỗi fallback chứa mã lỗi trần dạng (REASON_CODE)', () => {
    const msgOffer = formatServerErrorMessage('OFFER_ALREADY_RESOLVED');
    const msgBankrupt = formatServerErrorMessage('BANKRUPT');
    const msgAlias = formatServerErrorMessage('PLAYER_BANKRUPT');

    expect(msgOffer).not.toContain('(OFFER_ALREADY_RESOLVED)');
    expect(msgBankrupt).not.toContain('(BANKRUPT)');
    expect(msgAlias).not.toContain('(PLAYER_BANKRUPT)');
  });

  // =========================================================================
  // FACET 4: Dual-Mount & Modal Teardown Lifecycle (TC-280.10)
  // =========================================================================
  it('[TC-280.10/MSS][UC-IMP280] Dual-Mount Guard: Strip không gửi intent từ chối trùng sau khi Modal đóng lại', () => {
    const stripIntentSpy = vi.fn();
    const offerId = 'offer_dual_mount_01';

    useGameStore.setState({
      activeModal: 'bot_trade_offer',
      pendingTradeOffer: {
        offerId,
        cellIndex: 1,
        price: 1500,
        buyerId: 'bot1',
        sellerId: 'p1',
        expiresAt: Date.now() - 100,
      },
    });

    const modalMount = mountComponent(
      React.createElement(BotTradeOfferModal, {
        offerId,
        cellIndex: 1,
        price: 1500,
        buyerId: 'bot1',
        sellerId: 'p1',
        expiresAt: Date.now() - 100,
        onAccept: vi.fn(),
        onReject: (id: string) => {
          markTradeOfferResolved?.(id);
          useGameStore.setState({ activeModal: null });
        },
      })
    );

    const rejectBtn = modalMount.container.querySelector<HTMLButtonElement>('[data-testid="reject-trade-btn"]');
    act(() => {
      rejectBtn?.click();
    });
    modalMount.unmount();

    mountComponent(
      React.createElement(InlineBotTradeStrip, {
        onIntent: (intent: PlayerIntent) => stripIntentSpy(intent),
        localPlayerId: 'p1',
      })
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(stripIntentSpy).not.toHaveBeenCalled();
  });

  // =========================================================================
  // FACET 5: Helper Adversarial Gate (TC-280.11)
  // =========================================================================
  it('[TC-280.11/MSS][UC-IMP280] Helper Adversarial Gate: populateOffers xử lý an toàn input biên và purgeClientMatchSession dọn sạch khoá', () => {
    const emptyResult = populateOffers('adversarial_test', 0);
    markTradeOfferResolved?.('adversarial_test_0');
    purgeClientMatchSession();

    expect(emptyResult).toEqual([]);
    expect(markTradeOfferResolved?.('adversarial_test_0')).toBe(true);
  });
});
