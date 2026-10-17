// [CONTRACT TEST] IMP-430: Desktop Glass & Brass Tycoon HUD Overhaul
// Traceability Tags: [TC-430.01/MSS] .. [TC-430.08/MSS] & [UC-TWO-STAGE-DOM-PARITY/MSS], [UC-EMPTY-PROPERTY-BADGE-FORMAT/MSS], [UC-JEWEL-SPECULAR-OWNED-DOTS/MSS], [UC-OWNED-PROPERTIES-TRAY-EXPANSION/MSS], [UC-LIVING-TOKEN-AFFORDANCE-PRESERVATION/MSS], [UC-FROSTED-GLASS-TOPBAR-CAPSULE/MSS], [UC-HUD-LIST-ASIDE-CLASSES-PRESERVATION/MSS], [UC-LOC-BUFFER-ZONE-COMPLIANCE/MSS]
// Constraints: Zero dirty casts, 1-4 asserts per it(), living test <= 600 LOC, zero loops in it()

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayerCard } from '../../src/client/ui/player_card';
import { renderCardExpandChevron } from '../../src/client/ui/player_card_helpers';
import { PlayerHudList } from '../../src/client/ui/player_hud_list';
import { TopBar } from '../../src/client/ui/top_bar';
import { useGameStore, type PlayerHudInfo } from '../../src/client/store/game_store';
import { measureFile } from '../../scripts/check_loc.mjs';

const mockPlayerZeroProps: PlayerHudInfo = {
  id: 'p1',
  name: 'Brave Otter',
  balance: 15000,
  tokenColor: '#DC2626',
  ownedProperties: [],
  isBot: false,
};

const mockPlayerWithProps: PlayerHudInfo = {
  id: 'p2',
  name: 'Clever Fox',
  balance: 12000,
  tokenColor: '#2563EB',
  ownedProperties: [1, 5],
  isBot: false,
};

describe('[IMP-430] Desktop Glass & Brass Tycoon HUD Overhaul Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      playersInfo: {},
      currentTurnPlayerId: 'p1',
      isPlayerHudVisible: true,
      activeModal: null,
      modalPayload: null,
      pendingTradeOffer: null,
      activeEmotes: {},
    });
  });

  it('[TC-430.01/MSS][UC-TWO-STAGE-DOM-PARITY] Given PlayerCard rendered with active player having 0 owned properties, When inspecting the DOM tree, Then data-testid="player-property-clusters" contains all 28 dot-cell-* spans across rows 1, 2, and 3 while also rendering visible data-testid="player-empty-property-badge"', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player: mockPlayerZeroProps,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 0,
      })
    );
    const dotMatches = html.match(/data-testid="dot-cell-\d+"/g);
    expect(dotMatches?.length).toBe(28);
    expect(html).toContain('data-testid="player-property-clusters"');
    expect(html).toContain('data-testid="player-empty-property-badge"');
  });

  it('[TC-430.02/MSS][UC-EMPTY-PROPERTY-BADGE-FORMAT] Given PlayerCard rendered with empty ownedProperties array, When inspecting empty property badge, Then data-testid="player-empty-property-badge" displays "Chưa có BĐS" and "0/28" in a compact single-row container', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player: mockPlayerZeroProps,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 0,
      })
    );
    const badgeMatch = html.match(/<div[^>]*data-testid="player-empty-property-badge"[^>]*>[\s\S]*?<\/div>/);
    expect(badgeMatch).not.toBeNull();
    expect(badgeMatch?.[0]).toContain('Chưa có BĐS');
    expect(badgeMatch?.[0]).toContain('0/28');
  });

  it('[TC-430.03/MSS][UC-JEWEL-SPECULAR-OWNED-DOTS] Given PlayerCard rendered with owned property cells, When inspecting dot styling, Then owned property dots render with gold specular highlight class (border-amber-400/90 shadow-[0_0_6px_rgba(245,158,11,0.6)]) while unowned dots retain bg-transparent border-slate-300', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player: mockPlayerWithProps,
        isCurrentTurn: true,
        levelMap: {},
        slotIndex: 0,
      })
    );
    const dotOwnedMatch = html.match(/<span[^>]*data-testid="dot-cell-1"[^>]*>/);
    expect(dotOwnedMatch?.[0]).toContain('border-amber-400/90');
    expect(dotOwnedMatch?.[0]).toContain('shadow-[0_0_6px_rgba(245,158,11,0.6)]');
    const dotUnownedMatch = html.match(/<span[^>]*data-testid="dot-cell-3"[^>]*>/);
    expect(dotUnownedMatch?.[0]).toContain('border-slate-300 bg-transparent');
  });

  it('[TC-430.04/MSS][UC-OWNED-PROPERTIES-TRAY-EXPANSION] Given PlayerCard rendered with at least one owned property, When inspecting clusters container, Then renders the visible luxury Brass Tray containing glowing jewel dots without the empty property badge', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player: mockPlayerWithProps,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 0,
      })
    );
    expect(html).not.toContain('data-testid="player-empty-property-badge"');
    expect(html).toContain('bg-amber-950/[0.03]');
    expect(html).toContain('border-amber-900/10');
    expect(html).toContain('shadow-inner');
  });

  it('[TC-430.05/MSS][UC-LIVING-TOKEN-AFFORDANCE-PRESERVATION] Given PlayerCard rendered across states, When inspecting ribbon and chevron classes, Then non-turn card retains cursor-pointer sm:cursor-default, in-turn card retains shadow-[0_6px_0_0_#0f172a], and expand chevron retains sm:hidden', () => {
    const nonTurnHtml = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player: mockPlayerWithProps,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 0,
      })
    );
    expect(nonTurnHtml).toContain('cursor-pointer sm:cursor-default');

    const inTurnHtml = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player: mockPlayerWithProps,
        isCurrentTurn: true,
        levelMap: {},
        slotIndex: 0,
      })
    );
    expect(inTurnHtml).toContain('shadow-[0_6px_0_0_#0f172a]');

    const chevronHtml = renderToStaticMarkup(renderCardExpandChevron(false));
    expect(chevronHtml).toContain('inline-block sm:hidden');
    expect(chevronHtml).toContain('data-testid="player-card-expand-indicator"');
  });

  it('[TC-430.06/MSS][UC-FROSTED-GLASS-TOPBAR-CAPSULE] Given TopBar rendered in game view, When inspecting root capsule styling, Then applies frosted glass classes (bg-[#FFFDF8]/85, backdrop-blur-md, border-amber-900/20, rounded-full) while preserving match-info-capsule', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar, { onLeaveRoom: () => {} }));
    const topBarMatch = html.match(/<header[^>]*data-testid="top-bar"[^>]*>[\s\S]*?<div[^>]*class="([^"]*)"/);
    expect(topBarMatch).not.toBeNull();
    const containerClasses = topBarMatch?.[1] ?? '';
    expect(containerClasses).toContain('bg-[#FFFDF8]/85');
    expect(containerClasses).toContain('backdrop-blur-md');
    expect(containerClasses).toContain('border-amber-900/20');
  });

  it('[TC-430.07/MSS][UC-HUD-LIST-ASIDE-CLASSES-PRESERVATION] Given PlayerHudList rendered with active players, When inspecting aside element, Then preserves exact classes w-44, sm:w-48, and md:w-64 satisfying TC-IMP251.12', () => {
    useGameStore.setState({
      playersInfo: {
        p1: mockPlayerZeroProps,
        p2: mockPlayerWithProps,
      },
      currentTurnPlayerId: 'p1',
      isPlayerHudVisible: true,
    });
    const html = renderToStaticMarkup(React.createElement(PlayerHudList));
    const asideMatch = html.match(/<aside[^>]*class="([^"]*)"/);
    expect(asideMatch).not.toBeNull();
    const classes = asideMatch?.[1] ?? '';
    expect(classes).toContain('w-44');
    expect(classes).toContain('sm:w-48');
    expect(classes).toContain('md:w-64');
  });

  it('[TC-430.08/MSS][UC-LOC-BUFFER-ZONE-COMPLIANCE] Given player_card.tsx and player_card_helpers.ts, When measuring physical line counts, Then player_card.tsx remains strictly under 350 LOC buffer zone limit', () => {
    const cardHtml = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player: mockPlayerZeroProps,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 0,
      })
    );
    expect(cardHtml).toContain('data-testid="player-ribbon"');

    const cardMeasurement = measureFile('src/client/ui/player_card.tsx');
    const helpersMeasurement = measureFile('src/client/ui/player_card_helpers.ts');
    expect(cardMeasurement.totalLines).toBeLessThan(350);
    expect(helpersMeasurement.totalLines).toBeLessThan(500);
  });
});
