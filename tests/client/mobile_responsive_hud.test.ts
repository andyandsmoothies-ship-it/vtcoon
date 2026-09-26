// [TC-MOB01/MSS][UC-MOB-01][UC-MOB-02][UC-MOB-03] Contract Test Suite: Mobile Responsive HUD Standards
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): Touch targets (min-h-[40px], min-h-[42px], min-w-[44px], min-h-[44px]), compact heights, responsive widths (w-36, sm:w-48, w-full), whitespace-nowrap
// Facet 2 (State Reactivity): Ready 3D embossed shadow, warm amber bot button palette, mobile HUD toggle button, mini audit icon ⚖️, modal backdrop blur & scrim
// Facet 3 (Resource Disposal): Clean lifecycle transitions, empty state DOM pruning, zero dangling state
// Facet 4 (Error Defense): WCAG AA contrast for disabled buttons (text-slate-600/500), debt bounds, bankruptcy dimming

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { PreMatchDeck } from '../../src/client/ui/lobby/pre_match_deck';
import { PlayerSlotCard } from '../../src/client/ui/lobby/player_slot_card';
import { PlayerHudList } from '../../src/client/ui/player_hud_list';
import { PlayerCard } from '../../src/client/ui/player_card';
import { TopBar } from '../../src/client/ui/top_bar';
import { ModalBackdrop } from '../../src/client/ui/modals/modal_backdrop';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import { ActionDock } from '../../src/client/ui/action_dock';
import { HudContainer } from '../../src/client/ui/hud_container';
import { TelemetryBadge } from '../../src/client/ui/telemetry/telemetry_badge';
import { useGameStore, type PlayerHudInfo } from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import { useAudioStore } from '../../src/client/store/audio_store';
import { useActivityStore } from '../../src/client/store/activity_store';
import { useEnvironmentStore } from '../../src/client/store/environment_store';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store';
import { BotPersonality, type LobbySlot } from '../../src/client/store/lobby_types';

describe('[TC-MOB01/MSS] Mobile Responsive HUD Quality Standards Contract Suite', () => {
  beforeEach(() => {
    // Ensure Zustand hooks use current state snapshots in Node.js SSR test environment
    useGameStore.getInitialState = useGameStore.getState;
    useLobbyStore.getInitialState = useLobbyStore.getState;
    useAudioStore.getInitialState = useAudioStore.getState;
    useActivityStore.getInitialState = useActivityStore.getState;
    useEnvironmentStore.getInitialState = useEnvironmentStore.getState;
    useTelemetryStore.getInitialState = useTelemetryStore.getState;

    // Reset Lobby Store to known baseline
    useLobbyStore.getState().resetLobby();

    // Reset Game Store to clean baseline with active players
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 30,
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 15000,
          tokenColor: '#ef4444',
          ownedProperties: [],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: false,
        },
        p2: {
          id: 'p2',
          name: 'CEO Lan',
          balance: 12000,
          tokenColor: '#3b82f6',
          ownedProperties: [],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: true,
          bankrupt: false,
          inAudit: false,
        },
      },
      treasuryPool: 2500,
      isRolling: false,
      hasRolledThisTurn: false,
      activeEmotes: {},
      levelMap: {},
      playerPositions: { p1: 0, p2: 0 },
    });

    // Reset Auxiliary Stores
    useAudioStore.setState({ isMuted: false });
    useActivityStore.setState({ isActivityFeedOpen: false, unreadCount: 0 });
    useEnvironmentStore.setState({ mode: 'auto', phase: 'day' });
    useTelemetryStore.setState({
      metrics: {
        fps: 60,
        pingRttMs: 25,
        drawCalls: 100,
        triangles: 30000,
        frameTimeMs: 16.6,
        deltaBytes: 500,
        tickRate: 20,
      },
      violations: [],
      isConsoleOpen: false,
    });
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (DIMENSIONS, TOUCH TARGETS & FORMAT BOUNDS)
  // =========================================================================

  it('[TC-MOB01.01/MSS] [UC-MOB-01] PreMatchDeck aside uses mobile separation top-24 instead of sticky top-4', () => {
    useLobbyStore.getState().initLobby('VT8888', 'p1', true, 'Chủ Tịch Hưng');
    const html = renderToStaticMarkup(React.createElement(PreMatchDeck, { isHost: true }));
    const asideMatch = html.match(/<aside[^>]*data-testid="pre-match-deck"[^>]*>/)?.[0] ?? '';

    expect(asideMatch).toContain('top-24');
    expect(asideMatch).not.toMatch(/\babsolute top-4\b/);
  });

  it('[TC-MOB01.02/MSS] [UC-MOB-01] PreMatchDeck Copy Room Code button fulfills minimum touch height min-h-[44px]', () => {
    useLobbyStore.getState().initLobby('VT8888', 'p1', true, 'Chủ Tịch Hưng');
    const html = renderToStaticMarkup(React.createElement(PreMatchDeck, { isHost: true }));
    const copyBtnMatch = html.match(/<button[^>]*data-testid="copy-room-code-btn"[^>]*>/)?.[0] ?? '';

    expect(copyBtnMatch).toContain('min-h-[44px]');
  });

  it('[TC-MOB01.03/MSS] [UC-MOB-01] PreMatchDeck Game Rules button fulfills minimum touch height min-h-[44px]', () => {
    useLobbyStore.getState().initLobby('VT8888', 'p1', true, 'Chủ Tịch Hưng');
    const html = renderToStaticMarkup(React.createElement(PreMatchDeck, { isHost: true }));
    const rulesBtnMatch = html.match(/<button[^>]*data-testid="open-game-rules-btn"[^>]*>/)?.[0] ?? '';

    expect(rulesBtnMatch).toContain('min-h-[44px]');
  });

  it('[TC-MOB01.04/MSS] [UC-MOB-01] PreMatchDeck QR Code button fulfills minimum touch height min-h-[44px]', () => {
    useLobbyStore.getState().initLobby('VT8888', 'p1', true, 'Chủ Tịch Hưng');
    const html = renderToStaticMarkup(React.createElement(PreMatchDeck, { isHost: true }));
    const qrBtnMatch = html.match(/<button[^>]*aria-label="[^"]*mã QR[^"]*"[^>]*>/i)?.[0] ?? '';

    expect(qrBtnMatch).toContain('min-h-[44px]');
  });

  it('[TC-MOB01.05/MSS] [UC-MOB-01] PlayerSlotCard empty slot bounds uses compact height min-h-[68px] or min-h-[72px]', () => {
    const emptySlot: LobbySlot = {
      slotIndex: 1,
      playerId: null,
      isOccupied: false,
      tokenColor: '#3b82f6',
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

    expect(slotContainer).toMatch(/min-h-\[(68|72)px\]/);
    expect(slotContainer).not.toContain('min-h-[92px]');
  });

  it('[TC-MOB01.06/MSS] [UC-MOB-02] PlayerHudList responsive width bounds to w-36 or sm:w-48 instead of fixed w-60', () => {
    const html = renderToStaticMarkup(React.createElement(PlayerHudList));
    const asideMatch = html.match(/<aside[^>]*aria-label="Danh sách người chơi"[^>]*>/)?.[0] ?? '';

    expect(asideMatch).toMatch(/\b(w-36|sm:w-48)\b/);
    expect(asideMatch).not.toMatch(/\bpointer-events-none flex flex-col gap-2\.5 w-60\b/);
  });

  it('[TC-MOB01.07/MSS] [UC-MOB-02] PlayerCard applies full responsive width w-full instead of fixed w-[220px]', () => {
    const player: PlayerHudInfo = {
      id: 'p1',
      name: 'Chủ Tịch Hưng',
      balance: 15000,
      tokenColor: '#ef4444',
      ownedProperties: [],
    };
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: true,
        levelMap: {},
        slotIndex: 0,
      })
    );
    const cardMatch = html.match(/<div[^>]*data-testid="player-ribbon"[^>]*>/)?.[0] ?? '';

    expect(cardMatch).toContain('w-full');
    expect(cardMatch).not.toContain('w-[220px]');
  });

  it('[TC-MOB01.08/MSS] [UC-MOB-02] PlayerCard applies compact mobile padding p-2', () => {
    const player: PlayerHudInfo = {
      id: 'p1',
      name: 'Chủ Tịch Hưng',
      balance: 15000,
      tokenColor: '#ef4444',
      ownedProperties: [],
    };
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 0,
      })
    );
    const cardMatch = html.match(/<div[^>]*data-testid="player-ribbon"[^>]*>/)?.[0] ?? '';

    expect(cardMatch).toMatch(/\bp-2\b/);
  });

  it('[TC-MOB01.09/MSS] [UC-MOB-03] TopBar treasury fund capsule enforces whitespace-nowrap against currency line-break', () => {
    useGameStore.setState({ treasuryPool: 4500 });
    const html = renderToStaticMarkup(React.createElement(TopBar));
    const matchCapsule = html.match(/<div[^>]*data-testid="match-info-capsule"[\s\S]*?<\/div>\s*<\/div>/)?.[0] ?? html;

    expect(matchCapsule).toContain('whitespace-nowrap');
  });

  it('[TC-MOB01.10/MSS] [UC-MOB-03] ActionDock Property Management sub-button enforces min-w-[44px] and min-h-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1' })
    );
    const btnMatch = html.match(/<button[^>]*aria-label="Quản lý và nâng cấp bất động sản"[^>]*>/)?.[0] ?? '';

    expect(btnMatch).toContain('min-w-[44px]');
    expect(btnMatch).toContain('min-h-[44px]');
  });

  it('[TC-MOB01.11/MSS] [UC-MOB-03] ActionDock Trade sub-button enforces min-w-[44px] and min-h-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1' })
    );
    const btnMatch = html.match(/<button[^>]*aria-label="Đàm phán thương lượng"[^>]*>/)?.[0] ?? '';

    expect(btnMatch).toContain('min-w-[44px]');
    expect(btnMatch).toContain('min-h-[44px]');
  });

  it('[TC-MOB01.12/MSS] [UC-MOB-03] ActionDock End Turn sub-button enforces min-w-[44px] and min-h-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1' })
    );
    const btnMatch = html.match(/<button[^>]*aria-label="Kết thúc lượt"[^>]*>/)?.[0] ?? '';

    expect(btnMatch).toContain('min-w-[44px]');
    expect(btnMatch).toContain('min-h-[44px]');
  });

  it('[TC-MOB01.13/MSS] [UC-MOB-03] HudContainer footer enforces mobile centered layout justify-center sm:justify-between', () => {
    const html = renderToStaticMarkup(
      React.createElement(HudContainer, { localPlayerId: 'p1' })
    );
    const footerMatch = html.match(/<footer[^>]*>/)?.[0] ?? '';

    expect(footerMatch).toContain('justify-center');
    expect(footerMatch).toContain('sm:justify-between');
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY (INTERACTION TRANSITIONS & VISUAL FEEDBACK)
  // =========================================================================

  it('[TC-MOB01.14/MSS] [UC-MOB-01] PreMatchDeck Start button in ready state renders 3D tactile embossed shadow', () => {
    useLobbyStore.getState().initLobby('VT8888', 'p1', true, 'Chủ Tịch Hưng');
    useLobbyStore.getState().toggleBotSlot(1, BotPersonality.Balanced);
    const html = renderToStaticMarkup(React.createElement(PreMatchDeck, { isHost: true }));
    const startBtnMatch = html.match(/<button[^>]*data-testid="start-game-btn"[^>]*>/)?.[0] ?? '';

    expect(startBtnMatch).toMatch(/shadow-\[0_[3-6]px_0_0/);
    expect(startBtnMatch).not.toContain('shadow-sm');
  });

  it('[TC-MOB01.15/MSS] [UC-MOB-01] PlayerSlotCard Add Bot AI button applies warm amber cream styling without harsh black border', () => {
    const emptySlot: LobbySlot = {
      slotIndex: 1,
      playerId: null,
      isOccupied: false,
      tokenColor: '#3b82f6',
      playerName: '',
      isHost: false,
      isReady: false,
      isBot: false,
    };
    const html = renderToStaticMarkup(
      React.createElement(PlayerSlotCard, {
        slot: emptySlot,
        isHostViewer: true,
        onToggleBot: () => {},
      })
    );
    const addBotBtn = html.match(/<button[^>]*data-testid="add-bot-slot-1-btn"[^>]*>/)?.[0] ?? '';

    expect(addBotBtn).toMatch(/bg-amber-100|from-amber-100/);
    expect(addBotBtn).not.toContain('bg-amber-400');
    expect(addBotBtn).not.toContain('border-slate-900');
  });

  it('[TC-MOB01.16/MSS] [UC-MOB-02] PlayerHudList provides mobile toggle button to collapse and expand player list', () => {
    const html = renderToStaticMarkup(React.createElement(PlayerHudList));

    expect(html).toContain('data-testid="toggle-player-hud-btn"');
  });

  it('[TC-MOB01.17/MSS] [UC-MOB-02] PlayerCard in audit state switches from text label to compact balance scale icon ⚖️', () => {
    const player: PlayerHudInfo = {
      id: 'p1',
      name: 'Chủ Tịch Hưng',
      balance: 15000,
      tokenColor: '#ef4444',
      ownedProperties: [],
      inAudit: true,
      bankrupt: false,
    };
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 0,
      })
    );

    expect(html).toContain('⚖️');
    expect(html).not.toMatch(/>\s*Kiểm Toán\s*</);
  });

  it('[TC-MOB01.18/MSS] [UC-MOB-02] PlayerCard current turn state highlights with active ring and elevation', () => {
    const player: PlayerHudInfo = {
      id: 'p1',
      name: 'Chủ Tịch Hưng',
      balance: 15000,
      tokenColor: '#ef4444',
      ownedProperties: [],
    };
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: true,
        levelMap: {},
        slotIndex: 0,
      })
    );
    const cardMatch = html.match(/<div[^>]*data-testid="player-ribbon"[^>]*>/)?.[0] ?? '';

    expect(cardMatch).toContain('ring-amber-400');
    expect(cardMatch).toContain('shadow-[0_6px_0_0_#0f172a]');
  });

  it('[TC-MOB01.19/MSS] [UC-MOB-03] ModalBackdrop applies heavy scrim bg-slate-950/60 and backdrop-blur isolation', () => {
    const html = renderToStaticMarkup(
      React.createElement(ModalBackdrop, { center: true }, React.createElement('div', null, 'Hộp thoại xác nhận'))
    );
    const backdropMatch = html.match(/<div[^>]*role="dialog"[^>]*>/)?.[0] ?? '';

    expect(backdropMatch).toContain('bg-slate-950/60');
    expect(backdropMatch).toMatch(/backdrop-blur/);
    expect(backdropMatch).not.toContain('bg-slate-900/15');
  });

  it('[TC-MOB01.20/MSS] [UC-MOB-03] TitleDeedModal Pass button renders tactile physical shadow shadow-[0_4px_0_0] without dull silver', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
      })
    );
    const passBtnMatch = html.match(/<button[^>]*>[^<]*Bỏ Qua[^<]*<\/button>/i)?.[0] ?? '';

    expect(passBtnMatch).toMatch(/shadow-\[0_4px_0_0/);
    expect(passBtnMatch).not.toContain('bg-slate-200 text-slate-900');
    expect(passBtnMatch).not.toMatch(/\bbg-slate-200\b/);
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & CLEAN LIFECYCLE
  // =========================================================================

  it('[TC-MOB01.21/MSS] [UC-MOB-02] PlayerHudList renders null when player dictionary is empty (zero dangling DOM nodes)', () => {
    useGameStore.setState({ playersInfo: {} });
    const html = renderToStaticMarkup(React.createElement(PlayerHudList));

    expect(html).toBe('');
  });

  it('[TC-MOB01.22/MSS] [UC-MOB-01] PreMatchDeck preserves clean DOM footprint without lingering QR card when closed', () => {
    useLobbyStore.getState().initLobby('VT8888', 'p1', true, 'Chủ Tịch Hưng');
    const html = renderToStaticMarkup(React.createElement(PreMatchDeck, { isHost: true }));

    expect(html).not.toContain('Mã QR Mời Bạn Bè');
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & ACCESSIBILITY (WCAG AA & EDGE SAFETY)
  // =========================================================================

  it('[TC-MOB01.23/MSS] [UC-MOB-01] PreMatchDeck Start button disabled state achieves WCAG AA contrast (text-slate-500 or text-slate-600)', () => {
    useLobbyStore.getState().initLobby('VT8888', 'p1', true, 'Chủ Tịch Hưng');
    const html = renderToStaticMarkup(React.createElement(PreMatchDeck, { isHost: true }));
    const startBtnMatch = html.match(/<button[^>]*data-testid="start-game-btn"[^>]*>/)?.[0] ?? '';

    expect(startBtnMatch).not.toContain('text-slate-400');
    expect(startBtnMatch).toMatch(/text-slate-(500|600)/);
  });

  it('[TC-MOB01.24/MSS] [UC-MOB-03] ActionDock Roll Dice button disabled state uses soft slate (text-slate-400, bg-slate-100)', () => {
    useGameStore.setState({ currentTurnPlayerId: 'p2' });
    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1' })
    );
    const rollBtnMatch = html.match(/<button[^>]*aria-label="Đổ xúc xắc"[^>]*>/)?.[0] ?? '';

    expect(rollBtnMatch).toContain('text-slate-400');
    expect(rollBtnMatch).toContain('bg-slate-100');
  });

  it('[TC-MOB01.25/MSS] [UC-MOB-02] PlayerCard defends against negative debt balance displaying overdraft warning cleanly', () => {
    const player: PlayerHudInfo = {
      id: 'p1',
      name: 'Chủ Tịch Hưng',
      balance: -2500,
      tokenColor: '#ef4444',
      ownedProperties: [],
    };
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 0,
      })
    );

    expect(html).toContain('text-rose-700');
    expect(html).toContain('-2.500');
  });

  it('[TC-MOB01.26/MSS] [UC-MOB-02] PlayerCard bankrupt state dims cleanly with grayscale and reduced opacity', () => {
    const player: PlayerHudInfo = {
      id: 'p2',
      name: 'CEO Lan',
      balance: 0,
      tokenColor: '#3b82f6',
      ownedProperties: [],
      bankrupt: true,
    };
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 1,
      })
    );
    const cardMatch = html.match(/<div[^>]*data-testid="player-ribbon"[^>]*>/)?.[0] ?? '';

    expect(cardMatch).toContain('grayscale');
    expect(cardMatch).toContain('opacity-50');
  });

  it('[TC-MOB01.27/MSS] [UC-MOB-02] TopBar match-info-capsule hides static text labels on mobile to prevent horizontal overflow', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar));
    // Verify that static labels 'Thời gian:' and 'Kho Bạc:' are marked hidden on mobile (hidden sm:inline)
    expect(html).toContain('hidden sm:inline text-xs text-slate-600 font-semibold">Thời gian:</span>');
    expect(html).toContain('hidden sm:inline text-xs text-slate-600 font-semibold">Kho Bạc:</span>');
  });

  it('[TC-MOB01.28/MSS] [UC-MOB-02] TopBar renders activity-feed-toggle-button (Log) within compact mobile utilities cluster', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar));
    expect(html).toContain('data-testid="activity-feed-toggle-button"');
    expect(html).toContain('data-testid="hud-utilities-cluster"');
  });

  it('[TC-MOB01.29/MSS] [UC-MOB-02] TopBar renders mobile-fps-badge with live FPS indicator for small screens', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar));
    expect(html).toContain('data-testid="mobile-fps-badge"');
    expect(html).toContain('FPS</span>');
    expect(html).toContain('sm:hidden');
  });

  it('[TC-MOB01.30/MSS] [UC-MOB-02] HudContainer footer preserves desktop TelemetryBadge with hidden sm:block', () => {
    const html = renderToStaticMarkup(React.createElement(HudContainer));
    const telemetryMatch = html.match(/<div[^>]*>\s*<button[^>]*data-testid="telemetry-badge"[^>]*>/)?.[0] ?? '';
    expect(telemetryMatch).toContain('hidden sm:block');
  });
});

