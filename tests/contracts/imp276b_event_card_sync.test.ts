// @vitest-environment happy-dom
// [CONTRACT TEST] IMP-276B: Đồng Bộ Hiển Thị Event Card Modal, Ticker & Visual Badges Cho Thẻ MC_RATE_HIKE
// Traceability Tags: [TC-276B.01/MSS..TC-276B.10/MSS], [TC-276B.09/A1] & [UC-IMP276B]

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MarketCardId } from '../../src/domain/event_card_types.js';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal.js';
import {
  MarketEventTicker,
  resolveMarketEffectSummary,
  resolveMarketCompactFormula,
} from '../../src/client/ui/market_event_ticker.js';
import { resolvePunchyEventSummary } from '../../src/client/ui/event_card_punchy_summaries.js';
import { getCardHeroStat } from '../../src/client/ui/modals/event_card_visuals.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import type { ClientMarketModifier } from '../../src/client/store/game_store_types.js';

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

describe('[IMP-276B] Event Card Modal, Ticker & Visual Badges Sync for MC_RATE_HIKE', () => {
  beforeEach(() => {
    useGameStore.setState({ activeModifiers: [] });
  });

  afterEach(() => {
    while (activeMounts.length > 0) {
      const mount = activeMounts.pop();
      if (mount) {
        mount.unmount();
      }
    }
    useGameStore.setState({ activeModifiers: [] });
    vi.restoreAllMocks();
  });

  it('[TC-276B.01/MSS][UC-IMP276B] Given cardId là MarketCardId.MC_RATE_HIKE, When render EventCardModal không truyền props targetScope, Then giao diện hiển thị phạm vi Toàn bộ thị trường', () => {
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_RATE_HIKE,
      })
    );
    expect(container.textContent).toContain('Toàn bộ thị trường');
  });

  it('[TC-276B.02/MSS][UC-IMP276B] Given cardId là MarketCardId.MC_RATE_HIKE, When render EventCardModal, Then Single-Truth description chứa thông tin tăng 20% chi phí xây dựng C1-C3 và tăng lãi suất thế chấp 10%', () => {
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_RATE_HIKE,
      })
    );
    expect(container.textContent).toContain('Tăng 20% chi phí xây dựng công trình C1-C3');
    expect(container.textContent).toContain('tăng lãi suất vay thế chấp lên 10% khi vượt GO trong 2 vòng');
  });

  it('[TC-276B.03/MSS][UC-IMP276B] Given cardId là MarketCardId.MC_RATE_HIKE, When render EventCardModal, Then badge thời hạn hiển thị 2 vòng chơi', () => {
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_RATE_HIKE,
      })
    );
    expect(container.textContent).toContain('2 vòng chơi');
  });

  it('[TC-276B.04/MSS][UC-IMP276B] Given MarketCardId.MC_RATE_HIKE, When gọi getCardHeroStat, Then trả về nhãn THẮT CHẶT TIỀN TỆ và giá trị +20% XÂY • 10% QUA GO với variant warning', () => {
    const heroStat = getCardHeroStat(MarketCardId.MC_RATE_HIKE);
    expect(heroStat.label).toBe('THẮT CHẶT TIỀN TỆ');
    expect(heroStat.value).toBe('+20% XÂY • 10% QUA GO');
    expect(heroStat.variant).toBe('warning');
  });

  it('[TC-276B.05/MSS][UC-IMP276B] Given MarketCardId.MC_RATE_HIKE, When gọi resolveMarketEffectSummary, Then trả về chuỗi Tăng 20% chi phí xây nhà C1-C3 và thu lãi vay thế chấp 10% khi qua GO.', () => {
    const summary = resolveMarketEffectSummary(MarketCardId.MC_RATE_HIKE);
    expect(summary).toBe('Tăng 20% chi phí xây nhà C1-C3 và thu lãi vay thế chấp 10% khi qua GO.');
  });

  it('[TC-276B.06/MSS][UC-IMP276B] Given MarketCardId.MC_RATE_HIKE, When gọi resolveMarketCompactFormula, Then trả về chuỗi Xây nhà +20%, Lãi vay 10%', () => {
    const formula = resolveMarketCompactFormula(MarketCardId.MC_RATE_HIKE);
    expect(formula).toBe('Xây nhà +20%, Lãi vay 10%');
  });

  it('[TC-276B.07/MSS][UC-IMP276B] Given MarketCardId.MC_RATE_HIKE, When gọi resolvePunchyEventSummary, Then trả về chuỗi Tăng 20% xây nhà & thu lãi vay 10% tại GO', () => {
    const punchy = resolvePunchyEventSummary(MarketCardId.MC_RATE_HIKE);
    expect(punchy).toBe('Tăng 20% xây nhà & thu lãi vay 10% tại GO');
  });

  it('[TC-276B.08/MSS][UC-IMP276B] Given cardId là MarketCardId.MC_RATE_HIKE nhưng có props targetScope tùy chỉnh, When render EventCardModal, Then ưu tiên hiển thị props targetScope tùy chỉnh', () => {
    const customScope = 'Phạm vi kiểm thử';
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_RATE_HIKE,
        targetScope: customScope,
      })
    );
    expect(container.textContent).toContain(customScope);
    expect(container.textContent).not.toContain('Toàn bộ thị trường');
  });

  it('[TC-276B.09/A1][UC-IMP276B] Given multi-event mode với activeModifiers chứa MC_RATE_HIKE, When render EventCardModal ở chế độ multi-event, Then hiển thị đúng targetScope và description của từng sự kiện con', () => {
    const multiModifiers: readonly ClientMarketModifier[] = [
      {
        type: MarketCardId.MC_RATE_HIKE,
        remainingRounds: 2,
      },
      {
        type: MarketCardId.MC_PUBLIC_INVEST,
        remainingRounds: 1,
      },
    ];
    useGameStore.setState({ activeModifiers: multiModifiers });

    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_RATE_HIKE,
      })
    );

    expect(container.querySelector('[data-testid="event-card-carousel-nav"]')).not.toBeNull();
    expect(container.textContent).toContain('Toàn bộ thị trường');
    expect(container.textContent).toContain('Tăng 20% chi phí xây dựng công trình C1-C3');
  });

  it('[TC-276B.10/MSS][UC-IMP276B] Given activeModifiers chứa MC_RATE_HIKE, When render MarketEventTicker, Then thanh ticker hiển thị item chứa công thức Xây nhà +20%, Lãi vay 10%', () => {
    const { container } = mountComponent(
      React.createElement(MarketEventTicker, {
        activeModifiers: [
          {
            type: MarketCardId.MC_RATE_HIKE,
            remainingRounds: 2,
          },
        ],
      })
    );
    const ticker = container.querySelector('[data-testid="market-event-ticker"]');
    expect(ticker).not.toBeNull();
    expect(ticker?.textContent).toContain('Xây nhà +20%, Lãi vay 10%');
  });
});
