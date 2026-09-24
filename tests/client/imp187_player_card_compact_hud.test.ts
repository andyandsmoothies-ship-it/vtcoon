// [TC-187/MSS][IMP-187] Contract Test Suite: Compact PlayerCard HUD & Zero-Waste Layout
// Verifies 2-row compact structure, single-line micro-clusters, and inline property count
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayerCard } from '../../src/client/ui/player_card';
import type { PlayerHudInfo } from '../../src/client/store/game_store';

const mockPlayer: PlayerHudInfo = {
  id: 'p1',
  name: 'Chubby Hippo',
  balance: 10020,
  tokenColor: '#DC2626',
  ownedProperties: [1, 16, 18, 19], // 4 BĐS
  isBot: false,
};

const mockOverdraftPlayer: PlayerHudInfo = {
  id: 'p2',
  name: 'Bot AI 2',
  balance: -500,
  tokenColor: '#38BDF8',
  ownedProperties: [],
  isBot: true,
  overdraftRoundsLeft: 2,
};

describe('[TC-187/MSS][IMP-187] Compact PlayerCard HUD & Zero-Waste Layout', () => {
  it('[TC-187.01/MSS] PlayerCard renders property count pill with data-testid="player-property-count"', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    expect(html).toContain('data-testid="player-property-count"');
    expect(html).toContain('4');
  });

  it('[TC-187.02/MSS] Property clusters container uses flex-nowrap to guarantee single-line micro-bar', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: false, levelMap: {}, slotIndex: 0 })
    );
    const clusterContainer = html.match(/<div[^>]*data-testid="player-property-clusters"[^>]*>/);
    expect(clusterContainer).not.toBeNull();
    // Must prevent multi-row wrapping (prohibit flex-wrap, enforce flex-nowrap or single row)
    expect(clusterContainer![0]).not.toContain('flex-wrap');
  });

  it('[TC-187.03/MSS] In-turn badge LƯỢT is rendered as sleek corner tab when isCurrentTurn is true', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    expect(html).toContain('LƯỢT');
    expect(html).toContain('absolute -top-2.5 right-3');
  });

  it('[TC-187.04/MSS] Property dots use micro size to fit within single line without overflow', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: false, levelMap: {}, slotIndex: 0 })
    );
    const dotMatch = html.match(/<span[^>]*data-testid="dot-cell-1"[^>]*>/);
    expect(dotMatch).not.toBeNull();
    expect(dotMatch![0]).toMatch(/w-1\.5|w-2/);
  });

  it('[TC-187.05/MSS] Overdraft status is rendered compactly without blowing up vertical space', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockOverdraftPlayer, isCurrentTurn: false, levelMap: {}, slotIndex: 1 })
    );
    expect(html).toContain('Nợ 2v');
  });
});
