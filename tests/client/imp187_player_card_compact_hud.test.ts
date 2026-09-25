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
  it('[TC-187.01/MSS] PlayerCard removes redundant text property count and displays net worth cleanly', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    // Redundant text count 1/22 is removed in favor of direct dot counting
    expect(html).not.toContain('data-testid="player-property-count"');
    expect(html).toContain('data-testid="player-net-worth"');
  });

  it('[TC-187.02/MSS] Property clusters container organizes 22 dots into 2 balanced rows of 11 dots each with w-2 h-2 size', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: false, levelMap: {}, slotIndex: 0 })
    );
    const clusterContainer = html.match(/<div[^>]*data-testid="player-property-clusters"[^>]*>/);
    expect(clusterContainer).not.toBeNull();
    expect(clusterContainer![0]).not.toContain('flex-wrap');

    // 2 dòng đối xứng 11 chấm mỗi dòng
    const row1Segment = html.split('data-testid="property-clusters-row-1"')[1]?.split('data-testid="property-clusters-row-2"')[0] ?? '';
    const row2Segment = html.split('data-testid="property-clusters-row-2"')[1] ?? '';
    expect(row1Segment.match(/data-testid="dot-cell-\d+"/g)?.length).toBe(11);
    expect(row2Segment.match(/data-testid="dot-cell-\d+"/g)?.length).toBe(11);

    // Kích thước chấm tối thiểu 8px (w-2 h-2) trên mobile giúp thấy rõ màu sắc
    const dotCell1 = html.match(/<span[^>]*data-testid="dot-cell-1"[^>]*>/);
    expect(dotCell1).not.toBeNull();
    expect(dotCell1![0]).toContain('w-2 h-2');
  });

  it('[TC-187.03/MSS] In-turn badge LƯỢT is rendered as sleek corner tab when isCurrentTurn is true', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    expect(html).toContain('LƯỢT');
    expect(html).toContain('absolute -top-2.5 right-3');
  });

  it('[TC-187.04/MSS] Property dots span 100% width without redundant BDS: label', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: false, levelMap: {}, slotIndex: 0 })
    );
    // Redundant 'BĐS:' label is removed to give full width to 22 dots
    const clusterSection = html.match(/<div[^>]*data-testid="player-property-clusters"[^>]*>[\s\S]*?<\/div>/);
    expect(clusterSection).not.toBeNull();
    expect(clusterSection![0]).not.toContain('BĐS:');
    const dotMatch = html.match(/<span[^>]*data-testid="dot-cell-1"[^>]*>/);
    expect(dotMatch).not.toBeNull();
  });

  it('[TC-187.05/MSS] Overdraft status is rendered compactly without blowing up vertical space', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockOverdraftPlayer, isCurrentTurn: false, levelMap: {}, slotIndex: 1 })
    );
    expect(html).toContain('Nợ 2v');
  });
});
