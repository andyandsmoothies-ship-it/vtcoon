// [TC-173/MSS][IMP-173] Contract Test Suite: PlayerCard Property Clusters (Option A)
// Verifies 22 property dots arranged into 8 color group clusters with filled vs hollow state
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayerCard } from '../../src/client/ui/player_card';
import { ColorGroup } from '../../src/domain/board_config';
import { COLOR_GROUP_HEX } from '../../src/domain/theme';
import type { PlayerHudInfo } from '../../src/client/store/game_store';

const mockPlayer: PlayerHudInfo = {
  id: 'p1',
  name: 'Fancy Hedgehog',
  balance: 11198,
  tokenColor: '#DC2626',
  ownedProperties: [1, 16, 18, 19], // Ô 1 (Cần Thơ - Nâu), Ô 16, 18, 19 (Cam - Trọn bộ độc quyền)
  isBot: false,
};

describe('[TC-173/MSS][IMP-173] PlayerCard Option A: 22 Property Dots in 8 Color Clusters', () => {
  it('[TC-173.01/MSS][IMP-173] PlayerCard renders container data-testid="player-property-clusters"', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    expect(html).toContain('data-testid="player-property-clusters"');
  });

  it.each([
    ColorGroup.Nau,
    ColorGroup.XanhDaTroi,
    ColorGroup.Hong,
    ColorGroup.Cam,
    ColorGroup.Do,
    ColorGroup.Vang,
    ColorGroup.XanhLa,
    ColorGroup.Tim,
  ])('[TC-173.02/MSS][IMP-173] PlayerCard renders cluster for %s group', (group) => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    expect(html).toContain(`data-testid="cluster-${group}"`);
  });

  it('[TC-173.03/MSS][IMP-173] PlayerCard renders exactly 22 individual property dots', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    const matches = html.match(/data-testid="dot-cell-\d+"/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(22);
  });

  it('[TC-173.04/MSS][IMP-173] Owned property cell (e.g. cell 1) is marked data-owned="true" and has group backgroundColor', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    const cell1Match = html.match(/<span[^>]*data-testid="dot-cell-1"[^>]*>/);
    expect(cell1Match).not.toBeNull();
    expect(cell1Match![0]).toContain('data-owned="true"');
    expect(cell1Match![0]).toContain(COLOR_GROUP_HEX[ColorGroup.Nau]);
  });

  it('[TC-173.05/MSS][IMP-173] Unowned property cell (e.g. cell 3) is marked data-owned="false" and has hollow border style', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    const cell3Match = html.match(/<span[^>]*data-testid="dot-cell-3"[^>]*>/);
    expect(cell3Match).not.toBeNull();
    expect(cell3Match![0]).toContain('data-owned="false"');
    expect(cell3Match![0]).toContain('border-slate-300');
  });

  it('[TC-173.06/MSS][IMP-173] Monopoly group (Cam: cells 16, 18, 19) all have data-owned="true"', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    for (const cellIndex of [16, 18, 19]) {
      const match = html.match(new RegExp(`<span[^>]*data-testid="dot-cell-${cellIndex}"[^>]*>`));
      expect(match).not.toBeNull();
      expect(match![0]).toContain('data-owned="true"');
      expect(match![0]).toContain(COLOR_GROUP_HEX[ColorGroup.Cam]);
    }
  });

  it('[TC-173.07/MSS][IMP-173] Dots provide tooltip title with cell name and ownership status', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    expect(html).toContain('title="Cần Thơ (Cái Răng): Đã sở hữu"');
    expect(html).toContain('title="An Giang (Châu Đốc): Chưa sở hữu"');
  });

  it('[TC-173.08/MSS][IMP-173] Clusters use shrink-0 to prevent individual dots from separating on wrap', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, { player: mockPlayer, isCurrentTurn: true, levelMap: {}, slotIndex: 0 })
    );
    const clusterMatch = html.match(/<div[^>]*data-testid="cluster-Cam"[^>]*>/);
    expect(clusterMatch).not.toBeNull();
    expect(clusterMatch![0]).toContain('shrink-0');
  });
});
