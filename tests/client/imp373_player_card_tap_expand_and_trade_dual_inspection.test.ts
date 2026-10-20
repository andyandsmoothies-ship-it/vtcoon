// @vitest-environment happy-dom
// [CONTRACT TEST] IMP-373: Player Card Tap-to-Expand & Dual-Party Trade Inspection
// Traceability Tags: [TC-373.01/MSS..TC-373.06/MSS] & [UC-TAP-EXPAND/MSS], [UC-CHEVRON-AFFORDANCE/MSS], [UC-DUAL-TRADE-EXPAND/MSS], [UC-UNINVOLVED-COLLAPSED/MSS], [UC-BANKRUPT-IMMUNE/MSS], [UC-TURN-RESET/MSS]
// Constraints: Zero dirty casts, 1-4 asserts per test, zero loops in it(), living test <= 600 LOC

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useGameStore, type PlayerHudInfo } from '../../src/client/store/game_store.js';
import type { PendingTradeOfferDelta } from '../../src/server/delta_types.js';
import { PlayerCard } from '../../src/client/ui/player_card.js';

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

const emptyLevelMap: Record<number, 0 | 1 | 2 | 3> = {};

const mockPlayerNonTurn: PlayerHudInfo = {
  id: 'p2',
  name: 'Bot 1 (Hà Đông)',
  balance: 12000,
  tokenColor: '#EC4899',
  ownedProperties: [6, 8, 9],
  isBot: true,
};

const mockPlayerUninvolved: PlayerHudInfo = {
  id: 'p3',
  name: 'Bot 2 (Cầu Giấy)',
  balance: 9500,
  tokenColor: '#F59E0B',
  ownedProperties: [11, 13],
  isBot: true,
};

const mockPlayerBankrupt: PlayerHudInfo = {
  id: 'p4',
  name: 'Bot 3 (Phá Sản)',
  balance: 0,
  tokenColor: '#94A3B8',
  ownedProperties: [],
  bankrupt: true,
  isBankrupt: true,
  isBot: true,
};

const mockTradeOffer: PendingTradeOfferDelta = {
  offerId: 'trade_imp373',
  cellIndex: 6,
  price: 2000,
  buyerId: 'p1',
  sellerId: 'p2',
  expiresAt: Date.now() + 60000,
  offeredCellIndex: 1,
};

describe('[IMP-373] Player Card Tap-to-Expand & Dual-Party Trade Inspection', () => {
  beforeEach(() => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      activeModal: null,
      modalPayload: null,
      pendingTradeOffer: null,
      activeEmotes: {},
    });
  });

  afterEach(() => {
    while (activeMounts.length > 0) {
      const mount = activeMounts.pop();
      mount?.unmount();
    }
    useGameStore.setState({
      pendingTradeOffer: null,
      activeModal: null,
      modalPayload: null,
      currentTurnPlayerId: 'p1',
    });
  });

  it('[TC-373.01/MSS][UC-TAP-EXPAND] Given non-turn PlayerCard on mobile, When user triggers tap/click interaction, Then toggles isUserExpanded and reveals player-property-clusters (changes from hidden sm:flex to flex)', () => {
    const { container } = mountComponent(
      React.createElement(PlayerCard, {
        player: mockPlayerNonTurn,
        isCurrentTurn: false,
        levelMap: emptyLevelMap,
        slotIndex: 1,
      })
    );
    const card = container.querySelector<HTMLElement>('[data-testid="player-ribbon"]');
    const clusters = container.querySelector<HTMLElement>('[data-testid="player-property-clusters"]');

    expect(clusters?.className).toContain('hidden');
    expect(clusters?.className).not.toContain('sm:flex');

    act(() => {
      card?.click();
    });

    expect(clusters?.className).not.toContain('hidden');
    expect(clusters?.className).toContain('flex');
  });

  it('[TC-373.02/MSS][UC-CHEVRON-AFFORDANCE] Given PlayerCard on mobile, When rendered, Then displays visual affordance indicator chevron down ("▼") when collapsed and up ("▲") when expanded', () => {
    const { container } = mountComponent(
      React.createElement(PlayerCard, {
        player: mockPlayerNonTurn,
        isCurrentTurn: false,
        levelMap: emptyLevelMap,
        slotIndex: 1,
      })
    );
    const card = container.querySelector<HTMLElement>('[data-testid="player-ribbon"]');
    const indicatorCollapsed = container.querySelector<HTMLElement>('[data-testid="player-card-expand-indicator"]');

    expect(indicatorCollapsed?.textContent?.trim()).toBe('▼');

    act(() => {
      card?.click();
    });

    const indicatorExpanded = container.querySelector<HTMLElement>('[data-testid="player-card-expand-indicator"]');
    expect(indicatorExpanded?.textContent?.trim()).toBe('▲');
  });

  it('[TC-373.03/MSS][UC-DUAL-TRADE-EXPAND] Given pendingTradeOffer active where PlayerCard belongs to sellerId or buyerId, When rendered with isCurrentTurn false, Then collapses property clusters until user tap to prevent viewport clipping', () => {
    useGameStore.setState({
      pendingTradeOffer: mockTradeOffer,
    });

    const { container } = mountComponent(
      React.createElement(PlayerCard, {
        player: mockPlayerNonTurn,
        isCurrentTurn: false,
        levelMap: emptyLevelMap,
        slotIndex: 1,
      })
    );
    const card = container.querySelector<HTMLElement>('[data-testid="player-ribbon"]');
    const clusters = container.querySelector<HTMLElement>('[data-testid="player-property-clusters"]');

    expect(clusters?.className).toContain('hidden');

    act(() => {
      card?.click();
    });

    expect(clusters?.className).not.toContain('hidden');
    expect(clusters?.className).toContain('flex');
  });

  it('[TC-373.04/MSS][UC-UNINVOLVED-COLLAPSED] Given trade offer active between two players, When uninvolved third-party PlayerCard is rendered, Then maintains collapsed state on mobile', () => {
    useGameStore.setState({
      pendingTradeOffer: mockTradeOffer,
    });

    const { container } = mountComponent(
      React.createElement(PlayerCard, {
        player: mockPlayerUninvolved,
        isCurrentTurn: false,
        levelMap: emptyLevelMap,
        slotIndex: 2,
      })
    );
    const card = container.querySelector<HTMLElement>('[data-testid="player-ribbon"]');
    const clusters = container.querySelector<HTMLElement>('[data-testid="player-property-clusters"]');
    const indicator = container.querySelector<HTMLElement>('[data-testid="player-card-expand-indicator"]');

    expect(clusters?.className).toContain('hidden');
    expect(clusters?.className).not.toContain('sm:flex');
    expect(indicator?.textContent?.trim()).toBe('▼');
    expect(card?.className).toContain('cursor-pointer sm:cursor-default');
  });

  it('[TC-373.05/MSS][UC-BANKRUPT-IMMUNE] Given bankrupt PlayerCard, When tap is triggered, Then ignores expansion and retains opacity-50 collapsed styling', () => {
    const { container } = mountComponent(
      React.createElement(PlayerCard, {
        player: mockPlayerBankrupt,
        isCurrentTurn: false,
        levelMap: emptyLevelMap,
        slotIndex: 3,
      })
    );
    const card = container.querySelector<HTMLElement>('[data-testid="player-ribbon"]');

    act(() => {
      card?.click();
    });

    expect(card?.className).toContain('opacity-50');
    expect(card?.getAttribute('aria-expanded')).toBe('false');
    expect(card?.getAttribute('tabindex')).toBe('-1');
    expect(container.querySelector('[data-testid="player-card-expand-indicator"]')).toBeNull();
  });

  it('[TC-373.06/MSS][UC-TURN-RESET] Given manually expanded PlayerCard, When currentTurnPlayerId transitions, Then resets isUserExpanded to false to prevent visual clutter', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
    });

    const { container } = mountComponent(
      React.createElement(PlayerCard, {
        player: mockPlayerNonTurn,
        isCurrentTurn: false,
        levelMap: emptyLevelMap,
        slotIndex: 1,
      })
    );
    const card = container.querySelector<HTMLElement>('[data-testid="player-ribbon"]');
    const clusters = container.querySelector<HTMLElement>('[data-testid="player-property-clusters"]');

    act(() => {
      card?.click();
    });
    expect(clusters?.className).not.toContain('hidden');

    act(() => {
      useGameStore.setState({ currentTurnPlayerId: 'p3' });
    });

    expect(clusters?.className).toContain('hidden');
    expect(clusters?.className).not.toContain('sm:flex');
    const indicator = container.querySelector<HTMLElement>('[data-testid="player-card-expand-indicator"]');
    expect(indicator?.textContent?.trim()).toBe('▼');
  });
});
