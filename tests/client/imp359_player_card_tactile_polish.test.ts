// [TC-359/MSS][IMP-359] Contract Test Suite: Player Card Tactile Polish, TopBar Leave Clearance & Net Worth
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayerCard } from '../../src/client/ui/player_card';
import { PlayerNetWorthBadge } from '../../src/client/ui/player_net_worth_badge';
import { TopBar } from '../../src/client/ui/top_bar';
import type { PlayerHudInfo } from '../../src/client/store/game_store';

const mockPlayer: PlayerHudInfo = {
  id: 'p1',
  name: 'Brave Otter',
  balance: 18000,
  tokenColor: '#DC2626',
  ownedProperties: [],
  isBot: false,
};

describe('[TC-359/MSS][IMP-359] Player Card Tactile Polish & Dot Contrast Parity', () => {
  it('[TC-359.01/MSS] PlayerCard in active turn uses #FFFDF8 card base and amber ring without chromatic tint', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    expect(html).toContain('bg-[#FFFDF8]');
    expect(html).not.toContain('bg-amber-50/70');
    expect(html).toContain('ring-amber-400');
  });

  it('[TC-359.02/MSS] PlayerCard displays Net Worth with parenthesized format on desktop', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: false, levelMap: {}, slotIndex: 0 })
    );
    expect(html).toContain('data-testid="player-net-worth"');
    expect(html).toContain('(18.000)');
  });

  it('[TC-359.03/MSS] Unowned property dots render with bg-transparent and border-slate-300 for crisp hollow contrast', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    const dotCell1Match = html.match(/<span[^>]*data-testid="dot-cell-1"[^>]*>/);
    expect(dotCell1Match).not.toBeNull();
    expect(dotCell1Match![0]).toContain('bg-transparent');
    expect(dotCell1Match![0]).toContain('border-slate-300');
    expect(dotCell1Match![0]).not.toContain('bg-slate-100/70');
  });

  it('[TC-359.04/MSS] Unowned railroad and utility dots render with bg-transparent hollow style', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    // Ô 5 (Ga Hàng Cỏ - Railroad)
    const dotRailMatch = html.match(/<span[^>]*data-testid="dot-cell-5"[^>]*>/);
    expect(dotRailMatch).not.toBeNull();
    expect(dotRailMatch![0]).toContain('bg-transparent');

    // Ô 12 (EVN - Utility)
    const dotUtilMatch = html.match(/<span[^>]*data-testid="dot-cell-12"[^>]*>/);
    expect(dotUtilMatch).not.toBeNull();
    expect(dotUtilMatch![0]).toContain('bg-transparent');
  });

  it('[TC-359.05/MSS] PlayerNetWorthBadge renders formatted net worth inline on both mobile and desktop', () => {
    const html = renderToStaticMarkup(React.createElement(PlayerNetWorthBadge, { netWorth: 18000 }));
    expect(html).toContain('data-testid="player-net-worth"');
    expect(html).toContain('(18.000)');
    expect(html).toContain('inline-flex');
  });

  it('[TC-359.06/MSS] TopBar quick-rules button collapses gracefully on narrow mobile (<400px) with hidden min-[400px]:inline-flex', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar, { onLeaveRoom: () => {} }));
    const rulesBtnMatch = html.match(/<button[^>]*data-testid="quick-rules-topbar-btn"[^>]*>/);
    expect(rulesBtnMatch).not.toBeNull();
    expect(rulesBtnMatch![0]).toContain('hidden min-[400px]:inline-flex');
    expect(rulesBtnMatch![0]).toContain('sm:inline-flex');
  });

  it('[TC-359.07/MSS] TopBar container enforces symmetric horizontal padding min-[360px]:px-2 preventing right-side button drift', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar, { onLeaveRoom: () => {} }));
    const topBarMatch = html.match(/<header[^>]*data-testid="top-bar"[^>]*>[\s\S]*?<div[^>]*class="([^"]*)"/);
    expect(topBarMatch).not.toBeNull();
    const containerClasses = topBarMatch![1];
    expect(containerClasses).toContain('min-[360px]:px-2');
    expect(containerClasses).toContain('sm:px-4');
  });

  it('[TC-359.08/MSS] TopBar leave-room-button emoji icon preserves shrink-0 to prevent narrow viewport distortion', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar, { onLeaveRoom: () => {} }));
    const leaveBtnMatch = html.match(/<button[^>]*data-testid="leave-room-button"[^>]*>[\s\S]*?<\/button>/);
    expect(leaveBtnMatch).not.toBeNull();
    const doorSpanMatch = leaveBtnMatch![0].match(/<span[^>]*>🚪<\/span>/);
    expect(doorSpanMatch).not.toBeNull();
    expect(doorSpanMatch![0]).toContain('shrink-0');
  });

  it('[TC-359.09/MSS] TopBar container enforces desktop max-width sm:max-w-5xl fully enclosing leave-room-button within capsule', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar, { onLeaveRoom: () => {} }));
    const topBarMatch = html.match(/<header[^>]*data-testid="top-bar"[^>]*>[\s\S]*?<div[^>]*class="([^"]*)"/);
    expect(topBarMatch).not.toBeNull();
    expect(topBarMatch![1]).toContain('sm:max-w-5xl');
  });
});
