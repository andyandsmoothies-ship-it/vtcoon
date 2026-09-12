// [TC-UI-IMP/MSS] Verification of P1-P7 Impeccable Tactile UX & Physical Realism
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TradeModal } from '../../src/client/ui/modals/trade_modal';
import { EventCardModal } from '../../src/client/ui/modals/event_card_modal';
import { GameOverModal } from '../../src/client/ui/modals/game_over_modal';
import { InsolvencyBanner } from '../../src/client/ui/modals/insolvency_banner';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';

describe('[IMP-P1/P2] TradeModal Responsive Bounds & Tactile Shadows', () => {
  it('P1: TradeModal has responsive fallback max-w-md lg:max-w-lg and max-h-[90vh] overflow-y-auto', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'p2',
        myProperties: [1],
        targetProperties: [3],
        myBalance: 5000,
      })
    );
    expect(html).toContain('max-w-md lg:max-w-lg');
    expect(html).toContain('max-h-[90vh] overflow-y-auto');
    expect(html).toContain('data-testid="trade-modal"');
    expect(html).toContain('sticky top-0 z-10 shrink-0');
    expect(html).toContain('sticky bottom-0 z-10 shrink-0');
  });

  it('P2: TradeModal action buttons use tactile shadows instead of active:scale-95', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'p2',
        myProperties: [1],
        targetProperties: [3],
        myBalance: 5000,
        initialOffered: [1],
        initialRequested: [3],
        onClose: () => {},
      })
    );
    expect(html).not.toContain('active:scale-95');
    expect(html).toContain('shadow-[0_4px_0_0_#064e3b]');
    expect(html).toContain('active:shadow-[0_1px_0_0_#064e3b]');
    expect(html).toContain('active:translate-y-[3px]');
    expect(html).toContain('shadow-[0_4px_0_0_#020617]');
  });
});

describe('[IMP-P2/P7] EventCardModal Tactile Shadows & Dong Son Drum Vector', () => {
  it('P2: EventCardModal button uses tactile shadow instead of active:scale-95', () => {
    const htmlMarket = renderToStaticMarkup(
      React.createElement(EventCardModal, {
        cardType: 'market',
        cardId: 'MC_01',
        description: 'Tin vĩ mô thị trường',
      })
    );
    expect(htmlMarket).not.toContain('active:scale-95');
    expect(htmlMarket).toContain('shadow-[0_4px_0_0_#78350f]');
    expect(htmlMarket).toContain('active:shadow-[0_1px_0_0_#78350f]');
    expect(htmlMarket).toContain('active:translate-y-[3px]');

    const htmlChance = renderToStaticMarkup(
      React.createElement(EventCardModal, {
        cardType: 'chance',
        cardId: 'CC_01',
        description: 'Cơ hội may mắn',
      })
    );
    expect(htmlChance).not.toContain('active:scale-95');
    expect(htmlChance).toContain('shadow-[0_4px_0_0_#155e75]');
    expect(htmlChance).toContain('active:shadow-[0_1px_0_0_#155e75]');
  });

  it('P7: EventCardModal renders sunken Dong Son drum vector overlay with opacity-10', () => {
    const html = renderToStaticMarkup(
      React.createElement(EventCardModal, {
        cardType: 'chance',
        cardId: 'CC_01',
        description: 'Thử nghiệm hoa văn Trống Đồng',
      })
    );
    expect(html).toContain('opacity-10');
    expect(html).toContain('pointer-events-none');
    expect(html).toContain('viewBox="0 0 400 400"');
    expect(html).toContain('text-amber-300');
  });
});

describe('[IMP-P2] GameOverModal Tactile Shadows & Touch Targets', () => {
  it('P2: GameOverModal action button uses tactile shadow instead of active:scale-95', () => {
    const html = renderToStaticMarkup(
      React.createElement(GameOverModal, {
        leaderboard: [{ id: 'p1', netWorth: 25000 }],
        onClose: () => {},
      })
    );
    expect(html).not.toContain('active:scale-95');
    expect(html).toContain('shadow-[0_4px_0_0_#b45309]');
    expect(html).toContain('active:shadow-[0_1px_0_0_#b45309]');
    expect(html).toContain('active:translate-y-[3px]');
  });

  it('GameOverModal segmented tab buttons satisfy min-h-[44px] touch target with focus ring', () => {
    const html = renderToStaticMarkup(
      React.createElement(GameOverModal, {
        leaderboard: [{ id: 'p1', netWorth: 25000 }],
        onClose: () => {},
      })
    );
    expect(html).toContain('min-h-[44px] text-xs font-bold rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400');
  });
});

describe('[IMP-P3] InsolvencyBanner Touch Target & Focus Ring', () => {
  it('P3: InsolvencyBanner close button satisfies 44x44px min target and focus-visible ring', () => {
    const html = renderToStaticMarkup(
      React.createElement(InsolvencyBanner, {
        playerId: 'p1',
        deficit: 500,
        onClose: () => {},
      })
    );
    expect(html).toContain('min-h-[44px]');
    expect(html).toContain('min-w-[44px]');
    expect(html).toContain('focus-visible:ring-2');
    expect(html).toContain('focus-visible:ring-amber-400');
  });

  it('InsolvencyBanner action buttons satisfy min-h-[44px], tactile shadows, and focus rings', () => {
    const html = renderToStaticMarkup(
      React.createElement(InsolvencyBanner, {
        playerId: 'p1',
        deficit: 500,
        onManageProperties: () => {},
        onDeclareBankruptcy: () => {},
      })
    );
    expect(html).toContain('w-full min-h-[44px]');
    expect(html).toContain('shadow-[0_4px_0_0_#b45309]');
    expect(html).toContain('active:shadow-[0_1px_0_0_#b45309]');
    expect(html).toContain('shadow-[0_4px_0_0_#4c0519]');
    expect(html).toContain('active:shadow-[0_1px_0_0_#4c0519]');
  });
});

describe('[IMP-P4/P5/P6] TitleDeedModal Grid, High-Contrast Mortgage & Compact Header', () => {
  it('P4: TitleDeedModal footer uses 2-column grid layout grid-cols-2 gap-2 with responsive padding', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('grid grid-cols-2 gap-2');
    expect(html).toContain('px-3.5 sm:px-6');
  });

  it('P5: Mortgage button uses text-amber-950 font-black with amber tactile shadow', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: true,
        isMortgaged: false,
        onMortgage: () => {},
      })
    );
    expect(html).toContain('text-amber-950');
    expect(html).toContain('font-black');
    expect(html).toContain('shadow-[0_4px_0_0_#b45309]');
    expect(html).toContain('active:shadow-[0_1px_0_0_#b45309]');
  });

  it('P6: Ribbon header uses compact px-3 py-1 padding and h2 tracking-wide text-xs sm:text-sm font-black', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('px-3 py-1 text-center relative border border-amber-400/60');
    expect(html).toContain('tracking-wide text-xs sm:text-sm font-black uppercase text-white');
  });
});
