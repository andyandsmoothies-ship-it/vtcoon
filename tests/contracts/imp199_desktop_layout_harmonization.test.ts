// [TC-199.01/MSS..TC-199.18/MSS][UC-IMP199] Comprehensive Desktop Layout Harmonization & Zero-Clipping Notice Architecture Contract Suite
// Universal 5-Facet Behavioral Matrix:
// Facet 1: Zero-Clipping Notice Architecture (TC-199.01 - TC-199.04)
// Facet 2: Floating Numbers Decollision & Stepped Top Offsets (TC-199.05 - TC-199.08)
// Facet 3: Camera Pills Vertical Clearance (TC-199.09 - TC-199.11)
// Facet 4: TopBar Utilities Box-Sizing & Z-30 Layering (TC-199.12 - TC-199.14)
// Facet 5: Viewport Ergonomics Triad & Drawer Backdrop (TC-199.15 - TC-199.18)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';

import { ActionDock } from '../../src/client/ui/action_dock';
import { HudContainer } from '../../src/client/ui/hud_container';
import { FloatingNumbersOverlay } from '../../src/client/ui/floating_numbers';
import { TopBar } from '../../src/client/ui/top_bar';
import { ActivityFeedSidebar } from '../../src/client/ui/activity_feed_sidebar';
import { CompulsoryBuyoutModal } from '../../src/client/ui/modals/compulsory_buyout_modal';
import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal';
import { useGameStore, FloatingTextType } from '../../src/client/store/game_store';
import { MarketCardId } from '../../src/domain/event_card_types';

describe('[TC-199.01/MSS..TC-199.18/MSS][UC-IMP199] Comprehensive Desktop Layout Harmonization & Zero-Clipping Notice Architecture', () => {
  beforeEach(() => {
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 25,
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Sài Thành',
          balance: 20000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: false,
        },
      },
      playerPositions: { p1: 0 },
      treasuryPool: 500,
      pendingTradeOffer: null,
      activeModal: null,
      activeModifiers: [],
      floatingTexts: [],
    });
  });

  // =========================================================================
  // FACET 1: Zero-Clipping Notice Architecture (TC-199.01 - 04)
  // =========================================================================
  describe('Facet 1: Zero-Clipping Notice Architecture', () => {
    it('[TC-199.01/MSS][UC-IMP199] ActionDock renders outer container with relative flex flex-col items-center and without overflow-x-auto', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActionDock, {
          isMyTurn: true,
          localPlayerId: 'p1',
        })
      );
      const rootTag = html.match(/^<([a-z0-9]+)[^>]*class="([^"]*)"[^>]*>/);

      expect(rootTag?.[1]).toBe('div');
      expect(rootTag?.[2]).toContain('relative flex flex-col items-center');
      expect(rootTag?.[2]).not.toContain('overflow-x-auto');
    });

    it('[TC-199.02/MSS][UC-IMP199] ActionDock <nav> is nested inside outer wrapper preserving relative and overflow-x-auto no-scrollbar', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActionDock, {
          isMyTurn: true,
          localPlayerId: 'p1',
        })
      );
      const navTag = html.match(/<nav[^>]*class="([^"]*)"[^>]*aria-label="Thanh điều khiển tác vụ"/);

      expect(navTag).not.toBeNull();
      expect(navTag?.[1]).toContain('relative');
      expect(navTag?.[1]).toContain('overflow-x-auto no-scrollbar');
      expect(html).toMatch(/^<div[^>]*>[\s\S]*<nav/);
    });

    it('[TC-199.03/MSS][UC-IMP199] When inAudit is true, ActionDock renders audit-notice-chip outside <nav> element in unclipped outer wrapper', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Sài Thành',
            balance: 1000,
            inAudit: true,
            auditTurnsLeft: 2,
            isBot: false,
          } as any,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(ActionDock, {
          localPlayerId: 'p1',
          isMyTurn: true,
        })
      );

      const navContent = html.match(/<nav[\s\S]*?<\/nav>/)?.[0] ?? '';
      expect(html).toContain('data-testid="audit-notice-chip"');
      expect(navContent).not.toContain('data-testid="audit-notice-chip"');
      expect(html.indexOf('data-testid="audit-notice-chip"')).toBeLessThan(html.indexOf('<nav'));
    });

    it('[TC-199.04/MSS][UC-IMP199] When isMyTurn is false and bot is acting, ActionDock renders bot-pacing-chip outside <nav> element', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'bot1',
        turnPhase: 'Roll' as any,
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Sài Thành',
            balance: 1000,
            isBot: false,
          } as any,
          bot1: {
            id: 'bot1',
            name: 'Bot Chiến Thuật',
            balance: 2000,
            isBot: true,
          } as any,
        },
      });

      const html = renderToStaticMarkup(
        React.createElement(ActionDock, {
          localPlayerId: 'p1',
          isMyTurn: false,
        })
      );

      const navContent = html.match(/<nav[\s\S]*?<\/nav>/)?.[0] ?? '';
      expect(html).toContain('data-testid="bot-pacing-chip"');
      expect(navContent).not.toContain('data-testid="bot-pacing-chip"');
      expect(html.indexOf('data-testid="bot-pacing-chip"')).toBeLessThan(html.indexOf('<nav'));
    });
  });

  // =========================================================================
  // FACET 2: Floating Numbers Decollision & Stepped Top Offsets (TC-199.05 - 08)
  // =========================================================================
  describe('Facet 2: Floating Numbers Decollision & Stepped Top Offsets', () => {
    it('[TC-199.05/MSS][UC-IMP199] FloatingNumbersOverlay container applies top-20 sm:top-20 offset when activeMarketCount === 0', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [],
        floatingTexts: [
          {
            id: 'ft_rent_0',
            playerId: 'p1',
            text: '+1.500',
            type: FloatingTextType.Reward,
            actionType: 'rent_receive',
            timestamp: Date.now(),
          },
        ],
      });

      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('top-20 sm:top-20');
    });

    it('[TC-199.06/MSS][UC-IMP199] FloatingNumbersOverlay container applies top-28 sm:top-28 offset when activeMarketCount === 1', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [
          { type: MarketCardId.MC_NIGHT_ECONOMY, remainingRounds: 2, label: 'Kinh Tế Ban Đêm' } as any,
        ],
        floatingTexts: [
          {
            id: 'ft_rent_1',
            playerId: 'p1',
            text: '+1.500',
            type: FloatingTextType.Reward,
            actionType: 'rent_receive',
            timestamp: Date.now(),
          },
        ],
      });

      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('top-28 sm:top-28');
    });

    it('[TC-199.07/MSS][UC-IMP199] FloatingNumbersOverlay container applies top-36 sm:top-36 offset when activeMarketCount === 2 preventing 44px desktop collision under 140px ticker', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [
          { type: MarketCardId.MC_NIGHT_ECONOMY, remainingRounds: 2, label: 'Kinh Tế Ban Đêm' } as any,
          { type: MarketCardId.MC_MEGA_CONCERT, remainingRounds: 1, label: 'Đại Nhạc Hội' } as any,
        ],
        floatingTexts: [
          {
            id: 'ft_rent_2',
            playerId: 'p1',
            text: '+1.500',
            type: FloatingTextType.Reward,
            actionType: 'rent_receive',
            timestamp: Date.now(),
          },
        ],
      });

      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('top-36 sm:top-36');
    });

    it('[TC-199.08/MSS][UC-IMP199] FloatingNumbersOverlay container applies top-44 sm:top-44 offset when activeMarketCount >= 3', () => {
      useGameStore.setState({
        activeModal: null,
        activeModifiers: [
          { type: MarketCardId.MC_NIGHT_ECONOMY, remainingRounds: 2, label: 'Kinh Tế Ban Đêm' } as any,
          { type: MarketCardId.MC_MEGA_CONCERT, remainingRounds: 1, label: 'Đại Nhạc Hội' } as any,
          { type: MarketCardId.MC_ALCOHOL_CHECK, remainingRounds: 3, label: 'Kiểm Tra Nồng Độ Cồn' } as any,
        ],
        floatingTexts: [
          {
            id: 'ft_rent_3',
            playerId: 'p1',
            text: '+1.500',
            type: FloatingTextType.Reward,
            actionType: 'rent_receive',
            timestamp: Date.now(),
          },
        ],
      });

      const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
      expect(html).toContain('top-44 sm:top-44');
    });
  });

  // =========================================================================
  // FACET 3: Camera Pills Vertical Clearance (TC-199.09 - 11)
  // =========================================================================
  describe('Facet 3: Camera Pills Vertical Clearance', () => {
    it('[TC-199.09/MSS][UC-IMP199] HudContainer camera navigation cluster renders with bottom-28 for mobile vertical clearance over notice chip', () => {
      const html = renderToStaticMarkup(React.createElement(HudContainer));
      const cameraCluster = html.match(/<div[^>]*class="[^"]*fixed[^"]*left-1\/2 -translate-x-1\/2[^"]*"[^>]*>/)?.[0] ?? '';

      expect(cameraCluster).toContain('bottom-28');
    });

    it('[TC-199.10/MSS][UC-IMP199] HudContainer camera navigation cluster renders with sm:bottom-32 for desktop vertical clearance over ActionDock and strip', () => {
      const html = renderToStaticMarkup(React.createElement(HudContainer));
      const cameraCluster = html.match(/<div[^>]*class="[^"]*fixed[^"]*left-1\/2 -translate-x-1\/2[^"]*"[^>]*>/)?.[0] ?? '';

      expect(cameraCluster).toContain('sm:bottom-32');
    });

    it('[TC-199.11/MSS][UC-IMP199] HudContainer camera navigation cluster enforces clean responsive scale and omits redundant md:bottom-32 token', () => {
      const html = renderToStaticMarkup(React.createElement(HudContainer));
      const cameraCluster = html.match(/<div[^>]*class="[^"]*fixed[^"]*left-1\/2 -translate-x-1\/2[^"]*"[^>]*>/)?.[0] ?? '';

      expect(cameraCluster).toContain('bottom-28 sm:bottom-32');
      expect(cameraCluster).not.toContain('md:bottom-32');
    });
  });

  // =========================================================================
  // FACET 4: TopBar Utilities Box-Sizing & Z-30 Layering (TC-199.12 - 14)
  // =========================================================================
  describe('Facet 4: TopBar Utilities Box-Sizing & Z-30 Layering', () => {
    it('[TC-199.12/MSS][UC-IMP199] TopBar utility buttons cluster omits sm:min-h-[44px] to prevent boundary clipping and box-sizing overflow', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar, { onLeaveRoom: () => {} }));
      const clusterMatch = html.match(/<div[^>]*data-testid="hud-utilities-cluster"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';

      expect(clusterMatch).not.toContain('sm:min-h-[44px]');
    });

    it('[TC-199.13/MSS][UC-IMP199] TopBar utility buttons cluster renders with sm:h-8 and sm:min-w-[36px] providing tactile padding inside container', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar, { onLeaveRoom: () => {} }));
      const clusterMatch = html.match(/<div[^>]*data-testid="hud-utilities-cluster"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';

      expect(clusterMatch).toContain('sm:h-8');
      expect(clusterMatch).toContain('sm:min-w-[36px]');
    });

    it('[TC-199.14/MSS][UC-IMP199] HudContainer wraps TopBar in a relative z-30 container floating above drawer backdrop', () => {
      const html = renderToStaticMarkup(React.createElement(HudContainer));
      const topBarWrap = html.match(/<div[^>]*class="[^"]*relative z-30[^"]*"[^>]*>[\s\S]*?<header[^>]*data-testid="top-bar"/);

      expect(topBarWrap).not.toBeNull();
    });
  });

  // =========================================================================
  // FACET 5: Viewport Ergonomics Triad & Drawer Backdrop (TC-199.15 - 18)
  // =========================================================================
  describe('Facet 5: Viewport Ergonomics Triad & Drawer Backdrop', () => {
    it('[TC-199.15/MSS][UC-IMP199] CompulsoryBuyoutModal container enforces max-h-[90dvh] and overflow-y-auto preventing viewport overflow', () => {
      const html = renderToStaticMarkup(
        React.createElement(CompulsoryBuyoutModal, {
          buyerId: 'p1',
          sellerId: 'p2',
          cellIndex: 1,
          cost: 500,
          basePrice: 400,
          expiresAt: Date.now() + 15000,
          onBuyout: () => {},
          onDecline: () => {},
        })
      );
      const modalContainer = html.match(/<div[^>]*data-testid="compulsory-buyout-modal"[^>]*>/)?.[0] ?? '';

      expect(modalContainer).toContain('max-h-[90dvh]');
      expect(modalContainer).toContain('overflow-y-auto');
    });

    it('[TC-199.16/MSS][UC-IMP199] PropertyPortfolioModal and EventCardModal use max-h-[90dvh] and purge legacy max-h-[90vh]', () => {
      const htmlPortfolio = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties: [1],
          onClose: () => {},
        })
      );
      const htmlEvent = renderToStaticMarkup(
        React.createElement(EventCardModal, {
          cardType: 'market',
          cardId: MarketCardId.MC_NIGHT_ECONOMY,
        })
      );
      const portfolioModal = htmlPortfolio.match(/<div[^>]*data-testid="property-portfolio-modal"[^>]*>/)?.[0] ?? '';
      const eventModal = htmlEvent.match(/<div[^>]*data-testid="event-card-modal"[^>]*>/)?.[0] ?? '';

      expect(portfolioModal).toContain('max-h-[90dvh]');
      expect(portfolioModal).not.toContain('max-h-[90vh]');
      expect(eventModal).toContain('max-h-[90dvh]');
      expect(eventModal).not.toContain('max-h-[90vh]');
    });

    it('[TC-199.17/MSS][UC-IMP199] ActivityFeedSidebar renders backdrop with z-20 and omits md:hidden enabling desktop click-outside closing', () => {
      const html = renderToStaticMarkup(
        React.createElement(ActivityFeedSidebar, {
          isOpen: true,
        })
      );
      const backdrop = html.match(/<div[^>]*data-testid="activity-feed-backdrop"[^>]*>/)?.[0] ?? '';

      expect(backdrop).toContain('z-20');
      expect(backdrop).not.toContain('md:hidden');
    });

    it('[TC-199.18/MSS][UC-IMP199] action_dock.tsx strictly adheres to Tier 1 LOC budget <= 400 lines', () => {
      const actionDockPath = path.resolve(process.cwd(), 'src/client/ui/action_dock.tsx');
      const fileContent = fs.readFileSync(actionDockPath, 'utf8');
      const lineCount = fileContent.split('\n').length;

      expect(lineCount).toBeLessThanOrEqual(400);
    });
  });
});
