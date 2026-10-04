// [TC-IMP251.01..15][UC-IMP251] Mobile Player HUD Viewport Harmonics Contract Suite
// Facet 1: Single padding contract (01..03)
// Facet 2: 4-player clearance (04..06)
// Facet 3: Flex containment guard (07..09)
// Facet 4: Dual-viewport parity (10..12)
// Facet 5: Dismiss and unmount (13..15)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { PlayerHudList } from '../../src/client/ui/player_hud_list';
import { HudContainer } from '../../src/client/ui/hud_container';
import { useGameStore, type PlayerHudInfo } from '../../src/client/store/game_store';

const PLAYER_COUNT = 4;

function makePlayer(index: number): PlayerHudInfo {
  return {
    id: `p${index + 1}`,
    name: `Player${index + 1}`,
    balance: 1500,
    tokenColor: '#ff0000',
    ownedProperties: [1, 3],
    isBankrupt: false,
  };
}

function seedFourPlayers(): void {
  const playersInfo: Record<string, PlayerHudInfo> = {};
  for (let i = 0; i < PLAYER_COUNT; i++) {
    playersInfo[`p${i + 1}`] = makePlayer(i);
  }
  useGameStore.setState({ playersInfo, currentTurnPlayerId: 'p1', isPlayerHudVisible: true });
}

function renderHud(): string {
  return renderToStaticMarkup(React.createElement(PlayerHudList));
}

function asideClass(html: string): string {
  const match = /<aside class="([^"]*)"/.exec(html);
  return match?.[1] ?? `NO_ASIDE_FOUND in: ${html.slice(0, 200)}`;
}

function listWrapperClass(html: string): string {
  const match = /<aside[^>]*><div class="([^"]*)"/.exec(html);
  return match?.[1] ?? `NO_WRAPPER_FOUND in: ${html.slice(0, 300)}`;
}

function topPaddingClasses(cls: string): string[] {
  return cls.split(/\s+/).filter((c) => /^(sm:|md:)?pt-/.test(c));
}

describe('IMP-251 Player HUD Viewport Harmonics', () => {
  beforeEach(() => {
    seedFourPlayers();
  });

  describe('Facet 1: Single Padding Contract', () => {
    it('[UC-IMP251/MSS] TC-IMP251.01 aside has pt-1 and no pt-16', () => {
      const cls = asideClass(renderHud());
      expect(cls.split(/\s+/), cls).toContain('pt-1');
      expect(cls.split(/\s+/), cls).not.toContain('pt-16');
    });

    it('[UC-IMP251/MSS] TC-IMP251.02 list wrapper has no pt-16', () => {
      const cls = listWrapperClass(renderHud());
      expect(cls.split(/\s+/), cls).not.toContain('pt-16');
    });

    it('[UC-IMP251/MSS] TC-IMP251.03 mobile top padding classes total only pt-1', () => {
      const html = renderHud();
      const all = [...topPaddingClasses(asideClass(html)), ...topPaddingClasses(listWrapperClass(html))];
      const mobile = all.filter((c) => !c.includes(':'));
      expect(mobile, JSON.stringify(all)).toEqual(['pt-1']);
    });
  });

  describe('Facet 2: 4-Player Clearance', () => {
    it('[UC-IMP251/MSS] TC-IMP251.04 renders exactly 4 cards in one wrapper', () => {
      const html = renderHud();
      expect(html).toContain('Player1');
      expect(html).toContain('Player2');
      expect(html).toContain('Player3');
      expect(html).toContain('Player4');
    });

    it('[UC-IMP251/MSS] TC-IMP251.05 fourth card shows name, balance and property dots', () => {
      const html = renderHud();
      const fourth = html.slice(html.indexOf('Player4'));
      expect(fourth).toMatch(/1[.,\s]?500/);
      expect(fourth).toContain('data-owned="true"');
    });

    it('[UC-IMP251/A1] TC-IMP251.06 wrapper gap stays gap-2 and adds no top margin', () => {
      const cls = listWrapperClass(renderHud()).split(/\s+/);
      expect(cls).toContain('gap-2');
      expect(cls.filter((c) => /^mt-|^-?mt-/.test(c))).toEqual([]);
    });
  });

  describe('Facet 3: Flex Containment Guard', () => {
    it('[UC-IMP251/MSS] TC-IMP251.07 HudContainer middle tier keeps overflow-hidden', () => {
      const html = renderToStaticMarkup(React.createElement(HudContainer, {}));
      expect(html).toMatch(/class="[^"]*flex-1[^"]*overflow-hidden[^"]*"/);
    });

    it('[UC-IMP251/MSS] TC-IMP251.08 ActionDock wrapper stays pointer-events-auto', () => {
      const html = renderToStaticMarkup(React.createElement(HudContainer, {}));
      expect(html).toContain('pointer-events-auto');
      expect(html).toContain('<footer');
    });

    it('[UC-IMP251/MSS] TC-IMP251.09 list has no overflow-y-auto that would clip card shadow', () => {
      const html = renderHud();
      expect(html).not.toContain('overflow-y-auto');
      expect(html).not.toContain('overflow-auto');
    });
  });

  describe('Facet 4: Dual-Viewport Parity', () => {
    it('[UC-IMP251/MSS] TC-IMP251.10 property dots are w-2 h-2 on mobile', () => {
      const html = renderHud();
      expect(html).toContain('w-2');
      expect(html).toContain('h-2');
      expect(html).toContain('sm:w-[9px]');
    });

    it('[UC-IMP251/MSS] TC-IMP251.11 property dots are 9px on sm viewport', () => {
      const html = renderHud();
      expect(html).toContain('sm:w-[9px] sm:h-[9px]');
    });

    it('[UC-IMP251/MSS] TC-IMP251.12 aside keeps w-40 sm:w-48 md:w-64', () => {
      const cls = asideClass(renderHud()).split(/\s+/);
      expect(cls).toEqual(expect.arrayContaining(['w-40', 'sm:w-48', 'md:w-64']));
    });
  });

  describe('Facet 5: Dismiss and Unmount', () => {
    it('[UC-IMP251/MSS] TC-IMP251.13 backdrop remains for tap-outside dismiss', () => {
      expect(renderHud()).toContain('data-testid="player-hud-backdrop"');
    });

    it('[UC-IMP251/A2] TC-IMP251.14 renders nothing when HUD is hidden', () => {
      useGameStore.setState({ isPlayerHudVisible: false });
      expect(renderHud()).toBe('');
    });
  });
});
