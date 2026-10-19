// [TC-445.01..05/MSS][IMP-445] Station 1/2 Contract Tests: Collapsible Mini Player HUD & Board Visibility Rail
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { useGameStore, type GameState } from '../../src/client/store/game_store.js';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types.js';
import {
  formatCompactBalance,
  getPlayerMonogram,
  PlayerHudMiniChips,
  type PlayerHudMiniChipsProps,
} from '../../src/client/ui/player_hud_mini_chips.js';
import { PlayerHudList } from '../../src/client/ui/player_hud_list.js';

// Type-safe extension interfaces for store contracts without dirty casts
interface CompactHudStorePatch {
  isPlayerHudCompact?: boolean;
  togglePlayerHudCompact?: () => void;
  playersInfo?: Record<string, PlayerHudInfo>;
  currentTurnPlayerId?: string | null;
  isPlayerHudVisible?: boolean;
}

interface CompactHudStoreState extends GameState {
  readonly isPlayerHudCompact?: boolean;
  readonly togglePlayerHudCompact?: () => void;
}

const setStoreState: (patch: Partial<GameState> & CompactHudStorePatch) => void = useGameStore.setState;
const getStoreState: () => CompactHudStoreState = useGameStore.getState;

const mockPlayer1: PlayerHudInfo = {
  id: 'p1',
  name: 'Đại Gia Sài Gòn',
  balance: 13_200_000,
  tokenColor: '#38BDF8',
  ownedProperties: [1, 3],
  isBot: false,
};

const mockPlayer2: PlayerHudInfo = {
  id: 'p2',
  name: 'Tỷ Phú Hà Nội',
  balance: 120_000,
  tokenColor: '#F59E0B',
  ownedProperties: [6],
  isBot: true,
};

const mockBankruptPlayer: PlayerHudInfo = {
  id: 'p3',
  name: 'Con Nợ Vỡ Nợ',
  balance: -50_000,
  tokenColor: '#EF4444',
  ownedProperties: [],
  isBot: true,
  bankrupt: true,
};

describe('IMP-445: Collapsible Mini Player HUD & Board Visibility Rail', () => {
  beforeEach(() => {
    setStoreState({
      playersInfo: {
        p1: mockPlayer1,
        p2: mockPlayer2,
        p3: mockBankruptPlayer,
      },
      currentTurnPlayerId: 'p1',
      isPlayerHudVisible: true,
      isPlayerHudCompact: false,
    });
  });

  // [ADV-02] Mandate store state cleanup after each test to prevent singleton pollution in CI
  afterEach(() => {
    setStoreState({ isPlayerHudCompact: false });
  });

  // =========================================================================
  // FACET 1: Reactive Store Wire & Deterministic Toggle (TC-445.01)
  // =========================================================================
  describe('FACET 1: Store Slice & State Toggle Actions (TC-445.01)', () => {
    it('[TC-445.01a/MSS][UC-STORE-COMPACT-TOGGLE] INITIAL_GAME_STATE defaults isPlayerHudCompact to false', () => {
      const state = getStoreState();
      expect(state.isPlayerHudCompact).toBe(false);
    });

    it('[TC-445.01b/MSS][UC-STORE-COMPACT-TOGGLE] togglePlayerHudCompact flips isPlayerHudCompact from false to true', () => {
      const state = getStoreState();
      expect(typeof state.togglePlayerHudCompact).toBe('function');
      state.togglePlayerHudCompact?.();
      expect(getStoreState().isPlayerHudCompact).toBe(true);
    });

    it('[TC-445.01c/MSS][UC-STORE-COMPACT-TOGGLE] togglePlayerHudCompact called twice returns isPlayerHudCompact to false', () => {
      const state = getStoreState();
      state.togglePlayerHudCompact?.();
      state.togglePlayerHudCompact?.();
      expect(getStoreState().isPlayerHudCompact).toBe(false);
    });

    it('[TC-445.01d/MSS][UC-STORE-COMPACT-TOGGLE] setStoreState allows direct deterministic setting of isPlayerHudCompact', () => {
      setStoreState({ isPlayerHudCompact: true });
      expect(getStoreState().isPlayerHudCompact).toBe(true);
      setStoreState({ isPlayerHudCompact: false });
      expect(getStoreState().isPlayerHudCompact).toBe(false);
    });
  });

  // =========================================================================
  // FACET 2: Player HUD Rail Responsive Layout & Tailwind Invariant (TC-445.02)
  // =========================================================================
  describe('FACET 2: Rail Responsive Layout & Tailwind Rules (TC-445.02)', () => {
    it('[TC-445.02a/MSS][UC-PLAYER-HUD-RAIL-WIDTH] PlayerHudList in full mode renders container with wide responsive classes', () => {
      setStoreState({ isPlayerHudCompact: false });
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));
      expect(html).toContain('w-44');
      expect(html).toContain('sm:w-48');
      expect(html).toContain('md:w-64');
    });

    it('[TC-445.02b/MSS][UC-PLAYER-HUD-RAIL-WIDTH] PlayerHudList in compact mode renders container with narrow responsive rail classes', () => {
      setStoreState({ isPlayerHudCompact: true });
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));
      expect(html).toContain('w-14');
      expect(html).toContain('sm:w-16');
      expect(html).not.toContain('md:w-64');
    });

    it('[TC-445.02c/MSS][UC-PLAYER-HUD-RAIL-WIDTH] [ADV-04] PlayerHudList never contains Tailwind fixed class in full or compact modes', () => {
      setStoreState({ isPlayerHudCompact: false });
      const fullHtml = renderToStaticMarkup(React.createElement(PlayerHudList));
      setStoreState({ isPlayerHudCompact: true });
      const compactHtml = renderToStaticMarkup(React.createElement(PlayerHudList));
      expect(fullHtml).not.toMatch(/\bfixed\b/);
      expect(compactHtml).not.toMatch(/\bfixed\b/);
    });

    it('[TC-445.02d/MSS][UC-PLAYER-HUD-RAIL-WIDTH] PlayerHudList in compact mode mounts PlayerHudMiniChips instead of full PlayerCards', () => {
      setStoreState({ isPlayerHudCompact: true });
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));
      expect(html).toContain('data-testid="player-hud-mini-chips-container"');
      expect(html).not.toContain('data-testid="player-ribbon"');
    });
  });

  // =========================================================================
  // FACET 3: Mini Avatar Chips Rendering & Accessible Financial Affordance (TC-445.03)
  // =========================================================================
  describe('FACET 3: Mini Avatar Chips Rendering & Affordance (TC-445.03)', () => {
    it('[TC-445.03a/MSS][UC-MINI-CHIPS-RENDERING] formatCompactBalance formats millions with 1 decimal digit', () => {
      expect(formatCompactBalance(13_200_000)).toBe('13.2M');
      expect(formatCompactBalance(1_000_000)).toBe('1.0M');
    });

    it('[TC-445.03b/MSS][UC-MINI-CHIPS-RENDERING] formatCompactBalance formats thousands and negative balances correctly', () => {
      expect(formatCompactBalance(120_000)).toBe('120k');
      expect(formatCompactBalance(-50_000)).toBe('-50k');
      expect(formatCompactBalance(0)).toBe('0k');
    });

    it('[TC-445.03c/MSS][UC-MINI-CHIPS-RENDERING] PlayerHudMiniChips renders container and mini chip for each player', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerHudMiniChips, {
          playerList: [mockPlayer1, mockPlayer2],
          currentTurnPlayerId: 'p1',
        })
      );
      expect(html).toContain('data-testid="player-hud-mini-chips-container"');
      expect(html).toContain('data-testid="player-mini-chip-p1"');
      expect(html).toContain('data-testid="player-mini-chip-p2"');
    });

    it('[TC-445.03d/MSS][UC-MINI-CHIPS-RENDERING] [ADV-01] PlayerHudMiniChips applies player.tokenColor to avatar circle with fallback', () => {
      const customPlayer: PlayerHudInfo = { ...mockPlayer1, id: 'p_custom', tokenColor: '#10B981' };
      const fallbackPlayer: PlayerHudInfo = { ...mockPlayer2, id: 'p_fallback', tokenColor: '' };
      const html = renderToStaticMarkup(
        React.createElement(PlayerHudMiniChips, {
          playerList: [customPlayer, fallbackPlayer],
        })
      );
      expect(html).toMatch(/background-color:\s*#10B981/i);
      expect(html).toMatch(/background-color:\s*#38BDF8/i);
    });

    it('[TC-445.03e/MSS][UC-MINI-CHIPS-RENDERING] [ADV-06] Bankrupt player displays skull icon and grayscale opacity styling', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerHudMiniChips, {
          playerList: [mockBankruptPlayer],
        })
      );
      expect(html).toContain('💀');
      expect(html).toContain('opacity-40 grayscale');
      expect(html).toContain('đã phá sản');
    });

    it('[TC-445.03f/MSS][UC-MINI-CHIPS-RENDERING] Active turn player receives highlight border styling', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerHudMiniChips, {
          playerList: [mockPlayer1, mockPlayer2],
          currentTurnPlayerId: 'p1',
        })
      );
      expect(html).toContain('border-amber-400');
      expect(html).toContain('border-slate-700');
    });

    it('[TC-445.03g/MSS][UC-MINI-CHIPS-RENDERING] Clicking a mini chip invokes onExpand callback', () => {
      const onExpandSpy = vi.fn();
      const props: PlayerHudMiniChipsProps = {
        playerList: [mockPlayer1],
        onExpand: onExpandSpy,
      };
      const vnode = PlayerHudMiniChips(props);
      expect(vnode).not.toBeNull();
      if (vnode && React.isValidElement<{ children?: React.ReactNode }>(vnode)) {
        const firstChild = React.Children.toArray(vnode.props.children)[0];
        if (React.isValidElement<{ onClick?: () => void }>(firstChild)) {
          firstChild.props.onClick?.();
        }
      }
      expect(onExpandSpy).toHaveBeenCalledTimes(1);
    });

    it('[TC-445.03h/MSS][UC-MINI-CHIPS-RENDERING] [ADV-03] Mini chips satisfy Pillar V touch target floor >= 44px', () => {
      const html = renderToStaticMarkup(
        React.createElement(PlayerHudMiniChips, {
          playerList: [mockPlayer1],
        })
      );
      expect(html).toContain('min-h-[44px]');
      expect(html).toContain('min-w-[44px]');
    });

    it('[TC-445.03i/MSS][UC-MINI-CHIPS-RENDERING] getPlayerMonogram generates distinct monograms for AI bots and players without BO collision', () => {
      expect(getPlayerMonogram('Bot AI 1')).toBe('B1');
      expect(getPlayerMonogram('Bot AI 2')).toBe('B2');
      expect(getPlayerMonogram('Tester')).toBe('TE');
      expect(getPlayerMonogram('')).toBe('??');
    });
  });

  // =========================================================================
  // FACET 4: Collapse Button Affordance, Ergonomics & Chevron Mapping (TC-445.04)
  // =========================================================================
  describe('FACET 4: Collapse Button Affordance & Touch Ergonomics (TC-445.04)', () => {
    it('[TC-445.04a/MSS][UC-COLLAPSE-AFFORDANCE] PlayerHudList renders collapse toggle button with testid', () => {
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));
      expect(html).toContain('data-testid="player-hud-collapse-btn"');
    });

    it('[TC-445.04b/MSS][UC-COLLAPSE-AFFORDANCE] [ADV-03] Collapse button enforces Pillar V minimum touch target >= 44px', () => {
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));
      expect(html).toContain('min-h-[44px]');
      expect(html).toContain('min-w-[44px]');
    });

    it('[TC-445.04c/MSS][UC-COLLAPSE-AFFORDANCE] [ADV-05] Collapse button has pointer-events-auto to prevent 3D canvas click pass-through', () => {
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));
      const match = html.match(/<button[^>]*data-testid="player-hud-collapse-btn"[^>]*class="([^"]*)"/);
      expect(match).not.toBeNull();
      expect(match?.[1]).toContain('pointer-events-auto');
    });

    it('[TC-445.04d/MSS][UC-COLLAPSE-AFFORDANCE] [ADV-07] In full mode, collapse button displays ▶ chevron with aria-expanded true', () => {
      setStoreState({ isPlayerHudCompact: false });
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));
      expect(html).toContain('▶');
      expect(html).toContain('aria-expanded="true"');
      expect(html).toContain('aria-label="Thu gọn bảng điểm"');
    });

    it('[TC-445.04e/MSS][UC-COLLAPSE-AFFORDANCE] [ADV-07] In compact mode, collapse button displays ◀ chevron with aria-expanded false', () => {
      setStoreState({ isPlayerHudCompact: true });
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));
      expect(html).toContain('◀');
      expect(html).toContain('aria-expanded="false"');
      expect(html).toContain('aria-label="Mở rộng bảng điểm"');
    });
  });

  // =========================================================================
  // FACET 5: Relational Width Covariance & Space Saving (TC-445.05)
  // =========================================================================
  describe('FACET 5: Relational Width Covariance & Space Saving (TC-445.05)', () => {
    const TAILWIND_WIDTH_PX: Record<string, number> = {
      'w-14': 56,     // 3.5rem = 56px (Mobile compact rail)
      'sm:w-16': 64,  // 4rem = 64px (Desktop/Tablet compact rail)
      'w-44': 176,    // 11rem = 176px (Mobile full HUD)
      'sm:w-48': 192, // 12rem = 192px (Tablet full HUD)
      'md:w-64': 256, // 16rem = 256px (Desktop full HUD)
    };

    function extractAsideClasses(isCompact: boolean): string[] {
      setStoreState({ isPlayerHudCompact: isCompact });
      const html = renderToStaticMarkup(React.createElement(PlayerHudList));
      const match = html.match(/<aside[^>]*class="([^"]*)"/);
      expect(match).not.toBeNull();
      return (match?.[1] || '').split(/\s+/);
    }

    it('[TC-445.05a/MSS][UC-RELATIONAL-WIDTH-AND-SPACE-SAVING] Desktop space saving: compact rail classes free >= 190px derived from rendered markup', () => {
      const fullClasses = extractAsideClasses(false);
      const compactClasses = extractAsideClasses(true);

      const desktopFullToken = fullClasses.find((c) => c === 'md:w-64');
      const desktopCompactToken = compactClasses.find((c) => c === 'sm:w-16');
      expect(desktopFullToken).toBe('md:w-64');
      expect(desktopCompactToken).toBe('sm:w-16');

      const desktopFullWidthPx = TAILWIND_WIDTH_PX[desktopFullToken!] ?? 0;
      const desktopCompactWidthPx = TAILWIND_WIDTH_PX[desktopCompactToken!] ?? 0;
      const freedHorizontalSpacePx = desktopFullWidthPx - desktopCompactWidthPx;
      expect(freedHorizontalSpacePx).toBe(192);
      expect(freedHorizontalSpacePx).toBeGreaterThanOrEqual(190);
    });

    it('[TC-445.05b/MSS][UC-RELATIONAL-WIDTH-AND-SPACE-SAVING] Mobile space saving: compact rail classes free >= 120px derived from rendered markup', () => {
      const fullClasses = extractAsideClasses(false);
      const compactClasses = extractAsideClasses(true);

      const mobileFullToken = fullClasses.find((c) => c === 'w-44');
      const mobileCompactToken = compactClasses.find((c) => c === 'w-14');
      expect(mobileFullToken).toBe('w-44');
      expect(mobileCompactToken).toBe('w-14');

      const mobileFullWidthPx = TAILWIND_WIDTH_PX[mobileFullToken!] ?? 0;
      const mobileCompactWidthPx = TAILWIND_WIDTH_PX[mobileCompactToken!] ?? 0;
      const freedHorizontalSpacePx = mobileFullWidthPx - mobileCompactWidthPx;
      expect(freedHorizontalSpacePx).toBe(120);
      expect(freedHorizontalSpacePx).toBeGreaterThanOrEqual(120);
    });

    it('[TC-445.05c/MSS][UC-RELATIONAL-WIDTH-AND-SPACE-SAVING] Compact rail width ceiling & smooth transition: rail <= 64px with transition-[width] animation', () => {
      const compactClasses = extractAsideClasses(true);
      const mobileCompactToken = compactClasses.find((c) => c === 'w-14');
      const desktopCompactToken = compactClasses.find((c) => c === 'sm:w-16');

      const mobileWidth = TAILWIND_WIDTH_PX[mobileCompactToken!] ?? 0;
      const desktopWidth = TAILWIND_WIDTH_PX[desktopCompactToken!] ?? 0;
      expect(mobileWidth).toBeLessThanOrEqual(64);
      expect(desktopWidth).toBeLessThanOrEqual(64);

      // Verify smooth transition classes to prevent layout pop/snap
      expect(compactClasses).toContain('transition-[width]');
      expect(compactClasses).toContain('duration-300');
    });
  });
});
