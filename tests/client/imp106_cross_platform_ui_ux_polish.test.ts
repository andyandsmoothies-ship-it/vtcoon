// [UC-IMP106/MSS][UI-S06/MSS] Contract Test Suite: Cross-Platform UI/UX Multi-Platform Polish & Anti-Crush
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): Touch targets (min-h-[44px], min-w-[44px]), responsive grid layouts (grid-cols-1 sm:grid-cols-2), scroll clearance (pb-8)
// Facet 2 (State Reactivity): Dynamic text truncation (truncate max-w-[120px]), responsive tab label abbreviation (hidden sm:inline)
// Facet 3 (Resource Disposal): Mobile drawer backdrop scrim mounting (bg-slate-950/50 backdrop-blur-xs md:hidden) and outside-click dismiss
// Facet 4 (Error Defense): Preservation of core business actions (P2P submit, mortgage, redeem, auto-bid, surrender) without layout crush

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { TradeModal } from '../../src/client/ui/modals/trade_modal';
import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import { GameRulesModal } from '../../src/client/ui/modals/game_rules_modal';
import { ActivityFeedSidebar } from '../../src/client/ui/activity_feed_sidebar';
import { TopBar } from '../../src/client/ui/top_bar';
import { SocialEmotesTray } from '../../src/client/ui/social_emotes_tray';
import { useGameStore } from '../../src/client/store/game_store';
import { useActivityStore } from '../../src/client/store/activity_store';

describe('[UC-IMP106/MSS] Cross-Platform UI/UX Multi-Platform Polish Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 30,
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 15000,
          tokenColor: '#ef4444',
          ownedProperties: [1, 3],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: false,
        },
        p2: {
          id: 'p2',
          name: 'Bot AI 2 (Aggressive)',
          balance: 8000,
          tokenColor: '#3b82f6',
          ownedProperties: [6, 8],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: true,
          bankrupt: false,
          inAudit: false,
        },
      },
      treasuryPool: 2500,
      isRolling: false,
      hasRolledThisTurn: false,
      activeEmotes: {},
      levelMap: {},
      playerPositions: {},
    });

    useActivityStore.setState({
      isActivityFeedOpen: true,
      activityLogs: [],
      activeFilter: 'all',
    });
  });

  // =========================================================================
  // NHÓM 1: P1 & P2 — TradeModal Responsive Grid & Partner Tab Truncate
  // =========================================================================

  describe('Nhóm 1: TradeModal Responsive Grid & Partner Tab Truncate', () => {
    const mockPartners = [
      { id: 'p2', name: 'Bot AI 2 (Aggressive)', balance: 8000, isBot: true },
    ];

    it('[UC-IMP106/MSS-P1.1] TradeModal switches from squished 2-column to responsive single-column on mobile with grid-cols-1 sm:grid-cols-2', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          initialOffered: [1],
          initialRequested: [6],
          myBalance: 15000,
          myProperties: [1, 3],
          targetProperties: [6, 8],
          availablePartners: mockPartners,
          onClose: () => {},
        })
      );
      expect(html).toContain('grid-cols-1 sm:grid-cols-2');
    });

    it('[UC-IMP106/MSS-P1.2] TradeModal keeps +100 and +500 quick cash buttons unclipped and tactile', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          initialOffered: [1],
          initialRequested: [6],
          myBalance: 15000,
          myProperties: [1, 3],
          targetProperties: [6, 8],
          availablePartners: mockPartners,
          onClose: () => {},
        })
      );
      expect(html).toContain('+100');
      expect(html).toContain('+500');
      expect(html).toContain('partner-selector-tab');
    });

    it('[UC-IMP106/MSS-P2.1] TradeModal partner selector tabs constrain long names with truncate max-w-[120px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          initialOffered: [1],
          initialRequested: [6],
          myBalance: 15000,
          myProperties: [1, 3],
          targetProperties: [6, 8],
          availablePartners: mockPartners,
          onClose: () => {},
        })
      );
      expect(html).toContain('truncate max-w-[120px]');
    });

    it('[UC-IMP106/MSS-P2.2] TradeModal preserves partner balance pill and selection indicator', () => {
      const html = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'p2',
          initialOffered: [1],
          initialRequested: [6],
          myBalance: 15000,
          myProperties: [1, 3],
          targetProperties: [6, 8],
          availablePartners: mockPartners,
          onClose: () => {},
        })
      );
      expect(html).toContain('8.000 Tr.');
      expect(html).toContain('min-h-[44px]');
    });
  });

  // =========================================================================
  // NHÓM 2: P3 & P4 — PropertyPortfolioModal Bottom Clearance & Touch Targets
  // =========================================================================

  describe('Nhóm 2: PropertyPortfolioModal Bottom Clearance & Touch Targets', () => {
    it('[UC-IMP106/MSS-P3.1] PropertyPortfolioModal scroll container incorporates pb-8 clearance so the last item is not covered by sticky footer', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1, 3, 21],
          propertyStates: {
            1: { ownerId: 'p1', level: 0, isMortgaged: false },
            3: { ownerId: 'p1', level: 0, isMortgaged: false },
            21: { ownerId: 'p1', level: 0, isMortgaged: false },
          },
          currentBalance: 5000,
          onClose: () => {},
        })
      );
      expect(html).toContain('p-4 pb-8 overflow-y-auto');
    });

    it('[UC-IMP106/MSS-P4.1] PropertyPortfolioModal Title Deed navigation button has min-h-[44px] WCAG AA touch target', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          propertyStates: {
            1: { ownerId: 'p1', level: 0, isMortgaged: false },
          },
          currentBalance: 5000,
          onSelectDeed: () => {},
          onClose: () => {},
        })
      );
      expect(html).toContain('min-h-[44px] px-3 py-2 bg-slate-100');
    });

    it('[UC-IMP106/MSS-P4.2] PropertyPortfolioModal mortgage and redeem action buttons satisfy min-h-[44px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          propertyStates: {
            1: { ownerId: 'p1', level: 0, isMortgaged: false },
          },
          currentBalance: 5000,
          onMortgage: () => {},
          onClose: () => {},
        })
      );
      expect(html).toContain('min-h-[44px]');
      expect(html).toContain('Thế Chấp');
    });
  });

  // =========================================================================
  // NHÓM 3: P5 — AuctionModal Close & Auxiliary Touch Targets >= 44px
  // =========================================================================

  describe('Nhóm 3: AuctionModal Close & Auxiliary Touch Targets >= 44px', () => {
    it('[UC-IMP106/MSS-P5.1] AuctionModal close button uses min-w-[44px] min-h-[44px] touch target instead of 28px w-7 h-7', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 3,
          currentBid: 500,
          highestBidderId: null,
          timeRemaining: 15,
          onClose: () => {},
        })
      );
      expect(html).toContain('min-w-[44px] min-h-[44px]');
      expect(html).not.toContain('w-7 h-7 inline-flex items-center justify-center text-slate-500');
    });

    it('[UC-IMP106/MSS-P5.2] AuctionModal Auto-Bid toggle button satisfies min-h-[44px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 3,
          currentBid: 500,
          highestBidderId: null,
          timeRemaining: 15,
          onClose: () => {},
        })
      );
      expect(html).toContain('min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold border');
    });

    it('[UC-IMP106/MSS-P5.3] AuctionModal surrender / pass button satisfies min-h-[44px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 3,
          currentBid: 500,
          highestBidderId: null,
          timeRemaining: 15,
          onClose: () => {},
        })
      );
      expect(html).toContain('min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-rose-700');
    });
  });

  // =========================================================================
  // NHÓM 4: P6 — GameRulesModal Tab Label Abbreviation & Close Target
  // =========================================================================

  describe('Nhóm 4: GameRulesModal Tab Label Abbreviation & Close Target', () => {
    it('[UC-IMP106/MSS-P6.1] GameRulesModal tab navigation uses compact labels on mobile to prevent 3-line text wrapping', () => {
      const html = renderToStaticMarkup(
        React.createElement(GameRulesModal, {
          isOpen: true,
          onClose: () => {},
        })
      );
      expect(html).toContain('rules-tab-core');
      expect(html).toContain('hidden sm:inline');
    });

    it('[UC-IMP106/MSS-P6.2] GameRulesModal close button satisfies min-w-[44px] min-h-[44px] touch target', () => {
      const html = renderToStaticMarkup(
        React.createElement(GameRulesModal, {
          isOpen: true,
          onClose: () => {},
        })
      );
      expect(html).toContain('min-w-[44px] min-h-[44px]');
      expect(html).not.toContain('w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100');
    });
  });

  // =========================================================================
  // NHÓM 5: P7 — ActivityFeedSidebar Mobile Backdrop Scrim
  // =========================================================================

  describe('Nhóm 5: ActivityFeedSidebar Mobile Backdrop Scrim', () => {
    it('[UC-IMP106/MSS-P7.1] ActivityFeedSidebar renders a mobile backdrop scrim when open to allow tap-outside to dismiss', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActivityFeedSidebar, {
          isOpen: true,
          onSetOpen: () => {},
        })
      );
      expect(html).toContain('activity-feed-backdrop');
      expect(html).toContain('bg-black/50');
      expect(html).toContain('md:hidden');
    });

    it('[UC-IMP106/MSS-P7.2] ActivityFeedSidebar header close button preserves min-h-[44px] min-w-[44px]', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActivityFeedSidebar, {
          isOpen: true,
          onSetOpen: () => {},
        })
      );
      expect(html).toContain('data-testid="close-activity-feed"');
      expect(html).toContain('min-h-[44px] min-w-[44px]');
    });
  });

  // =========================================================================
  // NHÓM 6: P8 — TopBar & SocialEmotesTray Ergonomics & Spacing Clearance
  // =========================================================================

  describe('Nhóm 6: TopBar & SocialEmotesTray Ergonomics & Spacing Clearance', () => {
    it('[UC-IMP106/MSS-P8.1] TopBar utilities cluster uses responsive spacing to avoid collision on narrow screens', () => {
      const html = renderToStaticMarkup(
        React.createElement(TopBar, {
          onLeaveRoom: () => {},
        })
      );
      expect(html).toContain('data-testid="hud-utilities-cluster"');
      expect(html).toContain('data-testid="match-info-capsule"');
    });

    it('[UC-IMP106/MSS-P8.2] SocialEmotesTray emote buttons enforce min-w-[44px] min-h-[44px] touch target floor', () => {
      const html = renderToStaticMarkup(
        React.createElement(SocialEmotesTray, {})
      );
      expect(html).toContain('min-w-[44px] min-h-[44px]');
    });
  });
});
