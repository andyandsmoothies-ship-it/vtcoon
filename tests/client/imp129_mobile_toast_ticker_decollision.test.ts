// [IMP-129] Mobile Toast & Market Event Ticker De-Collision Tests
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & Dynamic Offsets): Viewport top boundary spacing based on activeModifiers count
// Facet 2 (State Reactivity): Reactive repositioning when milestone banners and regular toasts co-exist
// Facet 3 (Resource Disposal & Fallback): Graceful reversion to default top-[4.25rem] when events expire

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type FloatingActionType,
} from '../../src/client/store/game_store.js';
import { FloatingNumbersOverlay } from '../../src/client/ui/floating_numbers.js';
import { MarketCardId } from '../../src/domain/event_card_types.js';

describe('[IMP-129] Mobile Toast & Market Event Ticker De-Collision', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [
        {
          id: 'ft_test_1',
          text: '-1.000 Tr.',
          type: FloatingTextType.Penalty,
          playerId: 'p1',
          actionType: 'upgrade',
          title: 'Xây C3 Đồng Nai',
          timestamp: Date.now(),
        },
      ],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Bot AI 3 (Balanced)',
          balance: 15000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
        },
      },
      activeModifiers: [],
    });
  });

  it('[TC-IMP129.01/MSS][Facet-1/Boundary] Khi không có sự kiện thị trường, mobile container định vị ở top-20', () => {
    useGameStore.setState({ activeModifiers: [] });
    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    const mobileMatch = html.match(/<div[^>]*class="[^"]*(?:md:hidden|md:max-w-md|fixed\s+top-)[^"]*"[^>]*>/);
    expect(mobileMatch).not.toBeNull();
    expect(mobileMatch![0]).toContain('top-20');
  });

  it('[TC-IMP129.02/MSS][Facet-1/Boundary] Khi có 1 sự kiện thị trường, mobile container định vị an toàn ở top-[10.5rem] tránh đè MarketEventTicker', () => {
    useGameStore.setState({
      activeModifiers: [
        { type: MarketCardId.MC_ANTI_SPECULATE, remainingRounds: 1 },
      ],
    });
    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    const mobileMatch = html.match(/<div[^>]*class="[^"]*(?:md:hidden|md:max-w-md|fixed\s+top-)[^"]*"[^>]*>/);
    expect(mobileMatch).not.toBeNull();
    expect(mobileMatch![0]).toContain('top-[10.5rem]');
    expect(mobileMatch![0]).not.toContain('top-20');
  });

  it('[TC-IMP129.03/MSS][Facet-1/Boundary] Khi có >= 2 sự kiện thị trường, mobile container dịch chuyển sâu hơn xuống top-[15.5rem]', () => {
    useGameStore.setState({
      activeModifiers: [
        { type: MarketCardId.MC_PEAK_TOURISM, remainingRounds: 1 },
        { type: MarketCardId.MC_RATE_HIKE, remainingRounds: 2 },
      ],
    });
    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    const mobileMatch = html.match(/<div[^>]*class="[^"]*(?:md:hidden|md:max-w-md|fixed\s+top-)[^"]*"[^>]*>/);
    expect(mobileMatch).not.toBeNull();
    expect(mobileMatch![0]).toContain('top-[15.5rem]');
  });

  it('[TC-IMP129.04/MSS][Facet-2/Reactivity] Khi có sự kiện thị trường và milestone banner cùng lúc, milestone banner nằm trong unified stack ở top-[10.5rem]', () => {
    useGameStore.setState({
      activeModifiers: [
        { type: MarketCardId.MC_PEAK_TOURISM, remainingRounds: 1 },
      ],
      floatingTexts: [
        {
          id: 'ft_milestone',
          text: '+1.000 Tr.',
          type: FloatingTextType.Reward,
          playerId: 'p1',
          actionType: 'chance' as unknown as FloatingActionType,
          title: 'Cơ Hội: Hoàn Thuế',
          timestamp: Date.now(),
        },
        {
          id: 'ft_regular',
          text: '-1.000 Tr.',
          type: FloatingTextType.Penalty,
          playerId: 'p1',
          actionType: 'upgrade',
          title: 'Xây C3 Đồng Nai',
          timestamp: Date.now(),
        },
      ],
    });
    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    const stackMatch = html.match(/<div[^>]*class="[^"]*(?:md:max-w-md|fixed\s+top-)[^"]*"[^>]*>/);
    expect(stackMatch).not.toBeNull();
    expect(stackMatch![0]).toContain('top-[10.5rem]');
    expect(html).toContain('data-testid="milestone-banner-container"');
    expect(html).toContain('data-testid="contextual-transaction-badge"');
  });

  it('[TC-IMP129.05/MSS][Facet-3/Disposal] Khi sự kiện thị trường hết hiệu lực (remainingRounds=0), mobile container tự động hoàn nguyên về top-20', () => {
    useGameStore.setState({
      activeModifiers: [
        { type: MarketCardId.MC_ANTI_SPECULATE, remainingRounds: 0 },
      ],
    });
    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    const mobileMatch = html.match(/<div[^>]*class="[^"]*(?:md:hidden|md:max-w-md|fixed\s+top-)[^"]*"[^>]*>/);
    expect(mobileMatch).not.toBeNull();
    expect(mobileMatch![0]).toContain('top-20');
  });
});
