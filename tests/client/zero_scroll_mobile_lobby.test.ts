// [TC-ZSCROLL/MSS][UI-S02/MSS][BR-UI-002]
// Contract Test Suite: Zero-Scroll Mobile Lobby & Viewport Fold Ergonomics
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PreMatchDeck } from '../../src/client/ui/lobby/pre_match_deck';
import { PlayerSlotCard } from '../../src/client/ui/lobby/player_slot_card';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import type { LobbySlot } from '../../src/client/store/lobby_types';

describe('[IMP-ZSCROLL] Zero-Scroll Mobile Lobby & Viewport Fold Invariants', () => {
  it('[TC-ZSCROLL.01/MSS] PreMatchDeck root container does not use min-h-screen (prevents Chrome mobile toolbar vertical overflow)', () => {
    useLobbyStore.getState().initLobby('VT6888', 'p1', true, 'Đại Gia');
    const html = renderToStaticMarkup(React.createElement(PreMatchDeck, { isHost: true }));
    expect(html).not.toContain('min-h-screen');
    expect(html).toContain('h-full');
  });

  it('[TC-ZSCROLL.02/MSS] PreMatchDeck aside uses compact top-3 on mobile instead of excessive top-24 dead space', () => {
    useLobbyStore.getState().initLobby('VT6888', 'p1', true, 'Đại Gia');
    const html = renderToStaticMarkup(React.createElement(PreMatchDeck, { isHost: true }));
    const asideMatch = html.match(/<aside[^>]*data-testid="pre-match-deck"[^>]*>/)?.[0] ?? '';

    expect(asideMatch).toContain('top-3');
    expect(asideMatch).toContain('md:top-6');
    expect(asideMatch).not.toContain('top-24');
  });

  it('[TC-ZSCROLL.03/MSS] PreMatchDeck aside bounds to max-h-[calc(100dvh-1.5rem)] on mobile to fit within initial viewport', () => {
    useLobbyStore.getState().initLobby('VT6888', 'p1', true, 'Đại Gia');
    const html = renderToStaticMarkup(React.createElement(PreMatchDeck, { isHost: true }));
    const asideMatch = html.match(/<aside[^>]*data-testid="pre-match-deck"[^>]*>/)?.[0] ?? '';

    expect(asideMatch).toContain('max-h-[calc(100dvh-1.5rem)]');
  });

  it('[TC-ZSCROLL.04/MSS] PlayerSlotCard empty slot uses compact height min-h-[50px] or min-h-[54px] on mobile to preserve vertical space', () => {
    const emptySlot: LobbySlot = {
      slotIndex: 1,
      playerId: null,
      isOccupied: false,
      tokenColor: '#DC2626',
      playerName: '',
      isHost: false,
      isReady: false,
      isBot: false,
    };
    const html = renderToStaticMarkup(
      React.createElement(PlayerSlotCard, {
        slot: emptySlot,
        isHostViewer: true,
      })
    );
    const slotContainer = html.match(/<div[^>]*data-testid="lobby-slot-1-empty"[^>]*>/)?.[0] ?? '';

    expect(slotContainer).toMatch(/min-h-\[(50|52|54)px\]/);
    expect(slotContainer).not.toContain('min-h-[68px]');
  });

  it('[TC-ZSCROLL.05/MSS] All primary action buttons maintain accessible touch targets min-h-[44px] on mobile', () => {
    useLobbyStore.getState().initLobby('VT6888', 'p1', true, 'Đại Gia');
    const html = renderToStaticMarkup(React.createElement(PreMatchDeck, { isHost: true }));

    const startBtn = html.match(/<button[^>]*data-testid="start-game-btn"[^>]*>/)?.[0] ?? '';
    const copyBtn = html.match(/<button[^>]*data-testid="copy-room-code-btn"[^>]*>/)?.[0] ?? '';
    const rulesBtn = html.match(/<button[^>]*data-testid="open-game-rules-btn"[^>]*>/)?.[0] ?? '';
    const backBtn = html.match(/<button[^>]*data-testid="back-to-hub-btn"[^>]*>/)?.[0] ?? '';

    expect(startBtn).toContain('min-h-[44px]');
    expect(copyBtn).toContain('min-h-[44px]');
    expect(rulesBtn).toContain('min-h-[44px]');
    expect(backBtn).toContain('min-h-[44px]');
  });
});
