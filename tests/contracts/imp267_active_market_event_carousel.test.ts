// @vitest-environment happy-dom
// [CONTRACT TEST] IMP-267: Modal Carousel Lật Thẻ Đa Sự Kiện Thị Trường & Dynamic Derivation
// Architecture: Single-row compact carousel nav, zero props stale shadowing, Detroit classical state seeding
// Traceability Tags: [TC-267.01/MSS..TC-267.10/MSS], [TC-267.09/A1] & [UC-IMP267]

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal.js';
import { MarketEventTicker } from '../../src/client/ui/market_event_ticker.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import type { ClientMarketModifier } from '../../src/client/store/game_store_types.js';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';
import { MacroCycleType } from '../../src/domain/macro_cycle_types.js';

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

describe('[IMP-267] Modal Carousel Lật Thẻ Đa Sự Kiện Thị Trường & Dynamic Derivation', () => {
  const threeActiveModifiers: readonly ClientMarketModifier[] = [
    {
      type: MarketCardId.MC_PUBLIC_INVEST,
      remainingRounds: 2,
      affectedCells: [5, 15, 25, 35],
    },
    {
      type: MacroCycleType.MACRO_LIQUIDITY_FREEZE,
      remainingRounds: 2,
    },
    {
      type: MarketCardId.MC_COASTAL_STORM,
      remainingRounds: 3,
    },
  ];

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

  it('[TC-267.01/MSS][UC-IMP267] Store chỉ có 1 active modifier -> render EventCardModal không chứa carousel nav', () => {
    useGameStore.setState({
      activeModifiers: [
        {
          type: MarketCardId.MC_PUBLIC_INVEST,
          remainingRounds: 2,
        },
      ],
    });
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_PUBLIC_INVEST,
      })
    );
    expect(container.querySelector('[data-testid="event-card-carousel-nav"]')).toBeNull();
  });

  it('[TC-267.02/MSS][UC-IMP267] cardType === "chance" -> render EventCardModal không chứa carousel nav', () => {
    useGameStore.setState({ activeModifiers: threeActiveModifiers });
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'chance',
        cardId: ChanceCardId.CC_TAX_AUDIT,
      })
    );
    expect(container.querySelector('[data-testid="event-card-carousel-nav"]')).toBeNull();
  });

  it('[TC-267.03/MSS][UC-IMP267] Store có 3 active modifiers -> render EventCardModal chứa carousel nav và nút điều hướng', () => {
    useGameStore.setState({ activeModifiers: threeActiveModifiers });
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_PUBLIC_INVEST,
      })
    );
    expect(container.querySelector('[data-testid="event-card-carousel-nav"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="carousel-prev-btn"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="carousel-next-btn"]')).not.toBeNull();
  });

  it('[TC-267.04/MSS][UC-IMP267] Mở modal với cardId là sự kiện thứ 2 -> khởi tạo activeIdx = 1 mà không kẹt ở index 0', () => {
    useGameStore.setState({ activeModifiers: threeActiveModifiers });
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MacroCycleType.MACRO_LIQUIDITY_FREEZE,
      })
    );
    const titleHeading = container.querySelector('h2');
    expect(titleHeading?.textContent).toContain('Đóng Băng Thanh Khoản');
    expect(titleHeading?.textContent).not.toContain('Đẩy Mạnh Đầu Tư Công');
  });

  it('[TC-267.05/MSS][UC-IMP267] Bấm nút Next -> chuyển sang sự kiện 2, cập nhật động tiêu đề và không bị bóng ma props', () => {
    useGameStore.setState({ activeModifiers: threeActiveModifiers });
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_PUBLIC_INVEST,
        title: 'BÓNG MA TIÊU ĐỀ PROPS',
        description: 'Bóng ma mô tả props',
      })
    );
    const nextBtn = container.querySelector<HTMLButtonElement>('[data-testid="carousel-next-btn"]');
    expect(nextBtn).toBeDefined();
    act(() => {
      nextBtn?.click();
    });
    const titleHeading = container.querySelector('h2');
    expect(titleHeading?.textContent).toContain('Đóng Băng Thanh Khoản');
    expect(titleHeading?.textContent).not.toContain('BÓNG MA TIÊU ĐỀ PROPS');
  });

  it('[TC-267.06/MSS][UC-IMP267] Bấm nút Prev -> vòng khép kín sang sự kiện thứ 3', () => {
    useGameStore.setState({ activeModifiers: threeActiveModifiers });
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_PUBLIC_INVEST,
      })
    );
    const prevBtn = container.querySelector<HTMLButtonElement>('[data-testid="carousel-prev-btn"]');
    expect(prevBtn).toBeDefined();
    act(() => {
      prevBtn?.click();
    });
    const titleHeading = container.querySelector('h2');
    expect(titleHeading?.textContent).toContain('Bão Lũ Duyên Hải');
  });

  it('[TC-267.07/MSS][UC-IMP267] Bấm tab pill thứ 3 -> nhảy trực tiếp sang sự kiện thứ 3', () => {
    useGameStore.setState({ activeModifiers: threeActiveModifiers });
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_PUBLIC_INVEST,
      })
    );
    const tabPill3 = container.querySelector<HTMLButtonElement>('[data-testid="carousel-tab-pill-2"]');
    expect(tabPill3).toBeDefined();
    act(() => {
      tabPill3?.click();
    });
    const titleHeading = container.querySelector('h2');
    expect(titleHeading?.textContent).toContain('Bão Lũ Duyên Hải');
  });

  it('[TC-267.08/MSS][UC-IMP267] Bấm CTA ở thẻ 1 -> chuyển sang thẻ 2, không gọi onConfirm/onClose', () => {
    useGameStore.setState({ activeModifiers: threeActiveModifiers });
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_PUBLIC_INVEST,
        onConfirm,
        onClose,
      })
    );
    const ctaBtn = container.querySelector<HTMLButtonElement>('[data-testid="event-card-confirm-btn"]');
    expect(ctaBtn).toBeDefined();
    act(() => {
      ctaBtn?.click();
    });
    const titleHeading = container.querySelector('h2');
    expect(titleHeading?.textContent).toContain('Đóng Băng Thanh Khoản');
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('[TC-267.09/A1][UC-IMP267] Bấm CTA ở thẻ cuối cùng 3/3 -> gọi onConfirm / onClose', () => {
    useGameStore.setState({ activeModifiers: threeActiveModifiers });
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_COASTAL_STORM,
        onConfirm,
        onClose,
      })
    );
    const ctaBtn = container.querySelector<HTMLButtonElement>('[data-testid="event-card-confirm-btn"]');
    expect(ctaBtn).toBeDefined();
    act(() => {
      ctaBtn?.click();
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('[TC-267.10/MSS][UC-IMP267] MarketEventTicker với 3 active modifiers -> hiển thị tooltip xem toàn bộ và badge +2 sự kiện', () => {
    useGameStore.setState({ activeModifiers: threeActiveModifiers });
    const { container } = mountComponent(
      React.createElement(MarketEventTicker, {
        activeModifiers: threeActiveModifiers,
      })
    );
    const firstTicker = container.querySelector('[data-testid="market-ticker-item-MC_PUBLIC_INVEST"]');
    expect(firstTicker?.getAttribute('title')).toContain('Bấm xem toàn bộ 3 sự kiện');
    expect(container.textContent).toContain('+2 sự kiện');
  });

  it('[TC-267.11/MSS][UC-IMP267] Dynamic modifier addition while mounted -> renders carousel without React hook count mismatch error', () => {
    useGameStore.setState({
      activeModifiers: [
        {
          type: MarketCardId.MC_PUBLIC_INVEST,
          remainingRounds: 2,
        },
      ],
    });
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_PUBLIC_INVEST,
      })
    );
    expect(container.querySelector('[data-testid="event-card-carousel-nav"]')).toBeNull();

    act(() => {
      useGameStore.setState({ activeModifiers: threeActiveModifiers });
    });

    expect(container.querySelector('[data-testid="event-card-carousel-nav"]')).not.toBeNull();
    expect(container.textContent).toContain('Đẩy Mạnh Đầu Tư Công');
  });

  it('[TC-267.12/MSS][UC-IMP267] A11y keyboard arrow navigation -> ArrowRight and ArrowLeft cycle through active modifiers', () => {
    useGameStore.setState({ activeModifiers: threeActiveModifiers });
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_PUBLIC_INVEST,
      })
    );
    expect(container.textContent).toContain('Đẩy Mạnh Đầu Tư Công');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    expect(container.textContent).toContain('Đóng Băng Thanh Khoản');

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    });
    expect(container.textContent).toContain('Đẩy Mạnh Đầu Tư Công');
  });

  it('[TC-267.13/MSS][UC-IMP267] Fast Dismiss affordance -> clicking event-skip-all-btn invokes onConfirm callback immediately', () => {
    useGameStore.setState({ activeModifiers: threeActiveModifiers });
    const onConfirm = vi.fn();
    const { container } = mountComponent(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: MarketCardId.MC_PUBLIC_INVEST,
        onConfirm,
      })
    );
    const skipBtn = container.querySelector<HTMLButtonElement>('[data-testid="event-skip-all-btn"]');
    expect(skipBtn).not.toBeNull();
    act(() => {
      skipBtn?.click();
    });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
