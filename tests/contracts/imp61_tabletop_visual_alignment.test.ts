// [IMP-61] Tabletop Visual Alignment Contract Test Suite
// Contract & Interface Verification: Purge Dark Mode, Cardboard Deeds, Felt Mats, Toy Markets & TABLETOP_THEME SSOT
// Standardized Traceability: [TC-61.xx/MSS] & [UC-UI-61]

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Domain Theme & Tokens
import * as ThemeModule from '../../src/domain/theme';
const { TABLETOP_THEME } = ThemeModule as unknown as {
  TABLETOP_THEME?: {
    cardBg?: string;
    cardBgWarm?: string;
    cardBorder?: string;
    textInkDark?: string;
    btnEmerald?: {
      bg?: string;
      text?: string;
      shadow?: string;
      border?: string;
    };
  };
};

// UI Components under contract
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import { HoseModal } from '../../src/client/ui/modals/hose_modal';
import { TradeModal } from '../../src/client/ui/modals/trade_modal';
import { InsolvencyBanner } from '../../src/client/ui/modals/insolvency_banner';
import { GameOverModal } from '../../src/client/ui/modals/game_over_modal';
import { ActivityFeedSidebar } from '../../src/client/ui/activity_feed_sidebar';

// Client Stores for clean state isolation
import { useGameStore } from '../../src/client/store/game_store';
import { useActivityStore } from '../../src/client/store/activity_store';

// Bright paper & tabletop felt regex palette SSOT
const BRIGHT_PAPER_OR_FELT_REGEX =
  /(#FFFDF8|#F7F2E7|#FFFBEB|#FEF3C7|#FFEDD5|#FBF7EE|bg-amber-50|bg-\[#FFFDF8\]|bg-\[#F7F2E7\]|bg-\[#FFFBEB\]|bg-\[#FEF3C7\]|bg-\[#FFEDD5\]|bg-\[#FBF7EE\])/i;

type ComponentFactory = {
  readonly name: string;
  readonly render: () => React.ReactElement;
};

const MODAL_AND_SIDEBAR_FACTORIES: readonly ComponentFactory[] = [
  {
    name: 'TitleDeedModal',
    render: () => React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true }),
  },
  {
    name: 'EventCardModal',
    render: () =>
      React.createElement(EventCardModal, {
        cardType: 'chance',
        cardId: 'CC_01',
        description: 'Thẻ cơ hội khảo sát quy hoạch',
      }),
  },
  {
    name: 'AuctionModal',
    render: () =>
      React.createElement(AuctionModal, {
        cellIndex: 1,
        currentBid: 600,
        highestBidderId: 'player1',
        timeRemaining: 15,
        bidderName: 'Đại Gia Hà Nội',
        myBalance: 5000,
        myId: 'player2',
      }),
  },
  {
    name: 'HoseModal',
    render: () =>
      React.createElement(HoseModal, {
        myBalance: 15000,
        defaultStake: 500,
        onInvest: () => {},
        onSkip: () => {},
        onClose: () => {},
      }),
  },
  {
    name: 'TradeModal',
    render: () =>
      React.createElement(TradeModal, {
        targetPlayerId: 'bot1',
        myProperties: [1, 3],
        targetProperties: [6, 8],
        myBalance: 5000,
        targetPlayerName: 'Bot Thủ Đức',
      }),
  },
  {
    name: 'InsolvencyBanner',
    render: () =>
      React.createElement(InsolvencyBanner, {
        playerId: 'player1',
        playerName: 'Nguyễn Văn A',
        deficit: 500,
      }),
  },
  {
    name: 'GameOverModal',
    render: () =>
      React.createElement(GameOverModal, {
        leaderboard: [
          { id: 'player1', netWorth: 25000 },
          { id: 'bot1', netWorth: 12000 },
        ],
        onClose: () => {},
      }),
  },
  {
    name: 'ActivityFeedSidebar',
    render: () => React.createElement(ActivityFeedSidebar, { isOpen: true }),
  },
] as const;

describe('[IMP-61] Tabletop Visual Alignment Contract Test Suite', () => {
  beforeEach(() => {
    useActivityStore.setState({
      activityLogs: [
        {
          id: 'log-1',
          timestamp: Date.now(),
          type: 'buy',
          playerId: 'player1',
          cellIndex: 1,
          amount: 600,
          message: 'P1 mua Cần Thơ Cái Răng',
        },
      ],
      isActivityFeedOpen: true,
      unreadCount: 0,
      activeFilter: 'all',
    });

    useGameStore.setState({
      playersInfo: {
        player1: {
          id: 'player1',
          name: 'Nguyễn Văn A',
          balance: 15000,
          netWorth: 25000,
          color: '#c0392b',
          ownedProperties: [1],
        } as any,
        player2: {
          id: 'player2',
          name: 'Trần Thị B',
          balance: 8000,
          netWorth: 14000,
          color: '#2980b9',
          ownedProperties: [3],
        } as any,
        bot1: {
          id: 'bot1',
          name: 'Bot Thủ Đức',
          balance: 5000,
          netWorth: 10000,
          color: '#8e44ad',
          ownedProperties: [6, 8],
        } as any,
      },
      roundNumber: 2,
      maxRounds: 30,
      turnTimeRemaining: 45,
      treasuryPool: 2500,
    });
  });

  // =========================================================================
  // FACET 1: DARK MODE PURGE CONTRACT (BOUNDARY & RANGE)
  // =========================================================================
  describe('Facet 1: Dark Mode Purge Contract (Boundary & Container Backgrounds)', () => {
    it.each(MODAL_AND_SIDEBAR_FACTORIES)(
      '[TC-61.01/MSS][UC-UI-61] $name root container purges legacy dark class "bg-slate-950"',
      ({ render }) => {
        const markup = renderToStaticMarkup(render());
        expect(markup).not.toContain('bg-slate-950');
      }
    );

    it.each(MODAL_AND_SIDEBAR_FACTORIES)(
      '[TC-61.02/MSS][UC-UI-61] $name container transitions to bright paper or tabletop felt palette',
      ({ render }) => {
        const markup = renderToStaticMarkup(render());
        expect(markup).toMatch(BRIGHT_PAPER_OR_FELT_REGEX);
      }
    );
  });

  // =========================================================================
  // FACET 2: TITLE DEED CARDBOARD & MONOPOLY STRUCTURE (STATE REACTIVITY & ANATOMY)
  // =========================================================================
  describe('Facet 2: Title Deed Cardboard & Monopoly Structure (Visual Anatomy)', () => {
    it('[TC-61.03/MSS][UC-UI-61] TitleDeedModal renders solid header color band with local property color', () => {
      const markup = renderToStaticMarkup(
        React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true })
      );
      // Header must feature solid background color styling and ribbon structure
      expect(markup).toMatch(/background-color:\s*#[0-9a-fA-F]{6}|backgroundColor/i);
    });

    it('[TC-61.04/MSS][UC-UI-61] TitleDeedModal header title is bold uppercase with text-white contrast', () => {
      const markup = renderToStaticMarkup(
        React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true })
      );
      expect(markup).toContain('text-white');
      expect(markup).toContain('uppercase');
    });

    it('[TC-61.05/MSS][UC-UI-61] TitleDeedModal rent breakdown C0-C3 uses dark ink typography on bright card', () => {
      const markup = renderToStaticMarkup(
        React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true })
      );
      const hasDarkInkTier =
        markup.includes('text-slate-900') ||
        markup.includes('text-[#0F172A]') ||
        markup.includes('text-[#0f172a]');
      expect(hasDarkInkTier).toBe(true);
    });

    it('[TC-61.06/MSS][UC-UI-61] TitleDeedModal card frame enforces 2px black ink border and cardboard tactile shadow', () => {
      const markup = renderToStaticMarkup(
        React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true })
      );
      expect(markup).toContain('border-2');
      expect(markup).toContain('border-slate-900');
      expect(markup).toContain('shadow-[0_6px_0_0_#0f172a]');
    });

    it('[TC-61.07/MSS][UC-UI-61] TitleDeedModal Buy action button adopts toy tactile press shadow', () => {
      const markup = renderToStaticMarkup(
        React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true })
      );
      const hasTactileBuyButton =
        markup.includes('shadow-[0_4px_0_0_#065f46]') ||
        markup.includes('bg-emerald-500');
      expect(hasTactileBuyButton).toBe(true);
      expect(markup).toContain('Mua');
    });
  });

  // =========================================================================
  // FACET 3: TRADE MODAL TABLETOP FELT MATS (STATE REACTIVITY & REPRESENTATION)
  // =========================================================================
  describe('Facet 3: Trade Modal Tabletop Felt Mats (State Reactivity & Representation)', () => {
    it('[TC-61.08/MSS][UC-UI-61] TradeModal purges crude native checkbox inputs completely', () => {
      const markup = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot1',
          myProperties: [1, 3],
          targetProperties: [6, 8],
          myBalance: 5000,
        })
      );
      expect(markup).not.toContain('type="checkbox"');
      expect(markup).not.toContain("type='checkbox'");
    });

    it('[TC-61.09/MSS][UC-UI-61] TradeModal renders 2 distinct negotiation tabletop felt mats', () => {
      const markup = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot1',
          myProperties: [1, 3],
          targetProperties: [6, 8],
          myBalance: 5000,
        })
      );
      // Player felt mat has blue/navy tone, opponent felt mat has red/rose/amber tone
      const hasPlayerMatTone = /bg-(blue|slate|sky)-[89]00|bg-\[#0[Aa]1[0-9A-Fa-f]{3}\]|border-blue/i.test(markup);
      const hasOpponentMatTone = /bg-(rose|red|amber)-[89]00|bg-\[#[1-9A-Fa-f]{6}\]|border-(rose|red|amber)/i.test(markup);
      expect(hasPlayerMatTone).toBe(true);
      expect(hasOpponentMatTone).toBe(true);
    });

    it('[TC-61.10/MSS][UC-UI-61] TradeModal properties are represented as mini Title Deed cards with color ribbons', () => {
      const markup = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot1',
          myProperties: [1, 3],
          targetProperties: [6, 8],
          myBalance: 5000,
        })
      );
      expect(markup).toMatch(/background-color:\s*#[0-9a-fA-F]{6}|backgroundColor/i);
    });

    it('[TC-61.11/MSS][UC-UI-61] TradeModal displays toy play money cash with quick increment buttons (+100, +500)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(TradeModal, {
          targetPlayerId: 'bot1',
          myProperties: [1, 3],
          targetProperties: [6, 8],
          myBalance: 5000,
        })
      );
      expect(markup).toContain('+100');
      expect(markup).toContain('+500');
    });
  });

  // =========================================================================
  // FACET 4: TOY MARKET ARENAS & BANK NOTICES (ERROR DEFENSE & TACTILE ELEMENTS)
  // =========================================================================
  describe('Facet 4: Toy Market Arenas & Bank Notices (Error Defense & Tactile Elements)', () => {
    it('[TC-61.12/MSS][UC-UI-61] AuctionModal renders bright cream fairground auction podium (#FFFBEB or bg-amber-50)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: 'player1',
          timeRemaining: 15,
        })
      );
      const hasCreamPodium = markup.includes('#FFFBEB') || markup.includes('bg-amber-50') || markup.includes('bg-[#FFFBEB]');
      expect(hasCreamPodium).toBe(true);
    });

    it('[TC-61.13/MSS][UC-UI-61] AuctionModal features prominent retro flip counter for bid price display', () => {
      const markup = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: 'player1',
          timeRemaining: 15,
        })
      );
      expect(markup).toMatch(/(tracking-widest|font-mono|font-black text-[2-4]xl|data-testid="flip-counter")/);
    });

    it('[TC-61.14/MSS][UC-UI-61] AuctionModal quick bid increment buttons feature toy tactile press shadows', () => {
      const markup = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 1,
          currentBid: 600,
          highestBidderId: 'player1',
          timeRemaining: 15,
        })
      );
      expect(markup).toContain('+100 Tr.');
      expect(markup).toContain('+200 Tr.');
      expect(markup).toContain('+500 Tr.');
      expect(markup).toMatch(/shadow-\[0_4px_0_0_#[0-9a-fA-F]{6}\]|shadow-\[0_3px_0_0_#[0-9a-fA-F]{6}\]/);
    });

    it('[TC-61.15/MSS][UC-UI-61] HoseModal adopts retro old-town board paper or felt background', () => {
      const markup = renderToStaticMarkup(
        React.createElement(HoseModal, {
          myBalance: 15000,
          onInvest: () => {},
          onSkip: () => {},
          onClose: () => {},
        })
      );
      expect(markup).not.toContain('bg-slate-950');
      expect(markup).toMatch(BRIGHT_PAPER_OR_FELT_REGEX);
    });

    it('[TC-61.16/MSS][UC-UI-61] HoseModal displays candy-red 1D6 dice with distinct red styling', () => {
      const markup = renderToStaticMarkup(
        React.createElement(HoseModal, {
          myBalance: 15000,
          onInvest: () => {},
          onSkip: () => {},
          onClose: () => {},
        })
      );
      const hasCandyRedDice =
        markup.includes('text-rose-') ||
        markup.includes('text-red-') ||
        markup.includes('bg-rose-') ||
        markup.includes('bg-red-') ||
        markup.includes('#e11d48') ||
        markup.includes('#c0392b');
      expect(hasCandyRedDice).toBe(true);
    });

    it('[TC-61.17/MSS][UC-UI-61] HoseModal displays clear order-matching badge with dark ink labels', () => {
      const markup = renderToStaticMarkup(
        React.createElement(HoseModal, {
          myBalance: 15000,
          lastPayout: 1000,
          defaultStake: 500,
          onInvest: () => {},
          onSkip: () => {},
          onClose: () => {},
        })
      );
      expect(markup).toContain('Khớp Lệnh');
    });

    it('[TC-61.18/MSS][UC-UI-61] InsolvencyBanner renders banking warning envelope with red-and-white postal stripe border', () => {
      const markup = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, {
          playerId: 'player1',
          deficit: 500,
        })
      );
      const hasPostalStripe =
        markup.includes('border-dashed') ||
        markup.includes('repeating-linear-gradient') ||
        markup.includes('airmail') ||
        markup.includes('border-red-500');
      expect(hasPostalStripe).toBe(true);
    });

    it('[TC-61.19/MSS][UC-UI-61] InsolvencyBanner renders exact subtitle "Cảnh Báo Thanh Khoản Doanh Nghiệp"', () => {
      const markup = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, {
          playerId: 'player1',
          deficit: 500,
        })
      );
      expect(markup).toContain('Cảnh Báo Thanh Khoản Doanh Nghiệp');
    });

    it('[TC-61.20/MSS][UC-UI-61] ActivityFeedSidebar renders bright kraft paper ledger (#FBF7EE or translucent parchment)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(ActivityFeedSidebar, { isOpen: true })
      );
      const hasKraftLedger =
        markup.includes('#FBF7EE') ||
        markup.includes('bg-[#FBF7EE]') ||
        markup.includes('bg-amber-50') ||
        markup.includes('backdrop-blur');
      expect(hasKraftLedger).toBe(true);
    });

    it('[TC-61.21/MSS][UC-UI-61] ActivityFeedSidebar logs print with high-contrast dark ink typography', () => {
      const markup = renderToStaticMarkup(
        React.createElement(ActivityFeedSidebar, { isOpen: true })
      );
      const hasDarkInk =
        markup.includes('text-slate-900') ||
        markup.includes('text-[#0F172A]') ||
        markup.includes('text-slate-800');
      expect(hasDarkInk).toBe(true);
    });
  });

  // =========================================================================
  // FACET 5: TABLETOP_THEME TOKENS SSOT (CONTRACT ALIGNMENT)
  // =========================================================================
  describe('Facet 5: TABLETOP_THEME Tokens SSOT (Contract Alignment)', () => {
    it('[TC-61.22/MSS][UC-UI-61] TABLETOP_THEME.cardBg is calibrated to #FFFDF8', () => {
      expect(TABLETOP_THEME?.cardBg).toBe('#FFFDF8');
    });

    it('[TC-61.23/MSS][UC-UI-61] TABLETOP_THEME.cardBgWarm is calibrated to #F7F2E7', () => {
      expect(TABLETOP_THEME?.cardBgWarm).toBe('#F7F2E7');
    });

    it('[TC-61.24/MSS][UC-UI-61] TABLETOP_THEME.cardBorder matches #1E293B or #0F172A', () => {
      expect(['#1E293B', '#0F172A']).toContain(TABLETOP_THEME?.cardBorder);
    });

    it('[TC-61.25/MSS][UC-UI-61] TABLETOP_THEME.textInkDark is calibrated to #0F172A', () => {
      expect(TABLETOP_THEME?.textInkDark).toBe('#0F172A');
    });

    it('[TC-61.26/MSS][UC-UI-61] TABLETOP_THEME.btnEmerald defines complete tactile token set (bg, text, shadow, border)', () => {
      expect(TABLETOP_THEME?.btnEmerald).toMatchObject({
        bg: expect.any(String),
        text: expect.any(String),
        shadow: expect.any(String),
        border: expect.any(String),
      });
    });
  });
});
