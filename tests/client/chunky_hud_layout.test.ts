// [TC-CHUNKY-HUD/MSS] Test Suite Slice HUD-CHUNKY: 2D Chunky Toy Tabletop HUD Layout
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useGameStore, type PlayerHudInfo } from '../../src/client/store/game_store';
import { ActionDock } from '../../src/client/ui/action_dock';
import { PlayerCard } from '../../src/client/ui/player_card';
import { TopBar } from '../../src/client/ui/top_bar';

describe('[TC-CHUNKY-HUD.1/MSS] Facet 1: Boundary & Range (Format & Edge Display)', () => {
  beforeEach(() => {
    useGameStore.setState({
      playersInfo: {},
      currentTurnPlayerId: 'p1',
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 60,
      treasuryPool: 0,
      isRolling: false,
      activePawnAnimation: null,
      pawnAnimationQueue: [],
    });
  });

  it('[TC-CHUNKY-HUD.1/MSS] [UC-HUD-01] Player Ribbon formats standard positive cash and net worth with thousand separators', () => {
    const player: PlayerHudInfo = {
      id: 'p1',
      name: 'Chủ Tịch Hưng',
      balance: 15000,
      tokenColor: '#ef4444',
      ownedProperties: [1, 3],
    };
    const levelMap = { 1: 0 as const, 3: 0 as const };
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: true,
        levelMap,
        slotIndex: 0,
      })
    );

    expect(html).toContain('15.000');
    expect(html).toContain('16.200');
  });

  it('[TC-CHUNKY-HUD.2/MSS] [UC-HUD-01] Player Ribbon handles zero cash boundary safely without displaying negative zero', () => {
    const player: PlayerHudInfo = {
      id: 'p2',
      name: 'CEO Lan',
      balance: 0,
      tokenColor: '#3b82f6',
      ownedProperties: [],
    };
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 1,
      })
    );

    expect(html).toContain('0');
    expect(html).not.toMatch(/>\s*-\s*0\s*</);
  });

  it('[TC-CHUNKY-HUD.3/MSS] [UC-HUD-01] Player Ribbon formats high-tier billionaire net worth without layout breakage', () => {
    const player: PlayerHudInfo = {
      id: 'p1',
      name: 'Shark Bình',
      balance: 1000000,
      tokenColor: '#10b981',
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

    expect(html).toContain('1.000.000');
  });

  it('[TC-CHUNKY-HUD.4/MSS] [UC-HUD-01] Match Info Capsule formats round progression at start boundary (1/30)', () => {
    useGameStore.setState({ roundNumber: 1, maxRounds: 30 });
    const html = renderToStaticMarkup(React.createElement(TopBar));

    expect(html).toContain('1');
    expect(html).toContain('/30');
  });

  it('[TC-CHUNKY-HUD.5/MSS] [UC-HUD-01] Match Info Capsule formats round progression at final round boundary (30/30)', () => {
    useGameStore.setState({ roundNumber: 30, maxRounds: 30 });
    const html = renderToStaticMarkup(React.createElement(TopBar));

    expect(html).toContain('30');
    expect(html).toContain('/30');
  });

  it('[TC-CHUNKY-HUD.6/MSS] [UC-HUD-01] Turn Timer Capsule formats regular time boundary in MM:SS (45s -> 00:45)', () => {
    useGameStore.setState({ turnTimeRemaining: 45 });
    const html = renderToStaticMarkup(React.createElement(TopBar));

    expect(html).toContain('00:45');
    expect(html).toContain('text-emerald-700');
  });

  it('[TC-CHUNKY-HUD.7/MSS] [UC-HUD-01] Turn Timer Capsule formats critical low time boundary (5s -> 00:05) with alert styling', () => {
    useGameStore.setState({ turnTimeRemaining: 5 });
    const html = renderToStaticMarkup(React.createElement(TopBar));

    expect(html).toContain('00:05');
    expect(html).toContain('text-rose-600');
  });

  it('[TC-CHUNKY-HUD.8/MSS] [UC-HUD-01] Treasury Pool Capsule formats accumulated national treasury funds', () => {
    useGameStore.setState({ treasuryPool: 25000 });
    const html = renderToStaticMarkup(React.createElement(TopBar));

    expect(html).toContain('25.000');
  });
});

describe('[TC-CHUNKY-HUD.2/MSS] Facet 2: State Reactivity (Chunky Toy Tabletop UI & Mechanics)', () => {
  beforeEach(() => {
    useGameStore.setState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 10000,
          tokenColor: '#ef4444',
          ownedProperties: [1],
        },
        p2: {
          id: 'p2',
          name: 'CEO Lan',
          balance: 8000,
          tokenColor: '#3b82f6',
          ownedProperties: [],
        },
      },
      currentTurnPlayerId: 'p1',
      isRolling: false,
      activePawnAnimation: null,
      pawnAnimationQueue: [],
    });
  });

  it('[TC-CHUNKY-HUD.9/MSS] [UC-HUD-02] ActionDock buttons adhere to 3D tactile chunky round geometry (rounded-full, shadow-[0_4px_0_0_#0f172a], active:translate-y-[3px])', () => {
    const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));

    expect(html).toContain('rounded-full');
    expect(html).toContain('shadow-[0_4px_0_0_#0f172a]');
    expect(html).toContain('active:translate-y-[3px]');
  });

  it('[TC-CHUNKY-HUD.10/MSS] [UC-HUD-02] ActionDock Roll Dice button pulses with golden aura when active on player turn', () => {
    const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true }));

    expect(html).toContain('animate-pulse');
    expect(html).toContain('ring-amber-400');
  });

  it('[TC-CHUNKY-HUD.11/MSS] [UC-HUD-02] ActionDock Roll Dice button removes animate-pulse and locks button when not player turn', () => {
    useGameStore.setState({ currentTurnPlayerId: 'p2' });
    const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: false }));

    expect(html).not.toContain('animate-pulse');
    expect(html).toContain('cursor-not-allowed');
  });

  it('[TC-CHUNKY-HUD.12/MSS] [UC-HUD-02] ActionDock Roll Dice button transitions to "Đổ Tiếp (Đôi)" when doubles are rolled', () => {
    useGameStore.setState({
      dice: [4, 4],
      hasRolledThisTurn: true,
    });
    const html = renderToStaticMarkup(
      React.createElement(ActionDock, {
        localPlayerId: 'p1',
        isMyTurn: true,
        canRollAgain: true,
        hasRolledThisTurn: true,
      })
    );

    expect(html).toContain('Đổ Tiếp (Đôi)');
  });

  it('[TC-CHUNKY-HUD.13/MSS] [UC-HUD-02] PlayerCard renders as fishtail ribbon with data-testid="player-ribbon"', () => {
    const player = useGameStore.getState().playersInfo['p1']!;
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: true,
        levelMap: {},
        slotIndex: 0,
      })
    );

    expect(html).toContain('data-testid="player-ribbon"');
  });

  it('[TC-CHUNKY-HUD.14/MSS] [UC-HUD-02] PlayerCard token avatar renders as chunky circular piece with rounded-full', () => {
    const player = useGameStore.getState().playersInfo['p1']!;
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: true,
        levelMap: {},
        slotIndex: 0,
      })
    );

    expect(html).toContain('data-testid="player-pawn-badge-p1"');
    expect(html).toMatch(/data-testid="player-pawn-badge-p1"[^>]*rounded-full/);
  });

  it('[TC-CHUNKY-HUD.15/MSS] [UC-HUD-02] PlayerCard activates turn highlight badge and ring accent when isCurrentTurn is true', () => {
    const player = useGameStore.getState().playersInfo['p1']!;
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: true,
        levelMap: {},
        slotIndex: 0,
      })
    );

    expect(html).toContain('LƯỢT');
    expect(html).toContain('ring-amber-400');
  });

  it('[TC-CHUNKY-HUD.16/MSS] [UC-HUD-02] PlayerCard hides turn highlight badge when isCurrentTurn is false', () => {
    const player = useGameStore.getState().playersInfo['p2']!;
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 1,
      })
    );

    expect(html).not.toContain('LƯỢT');
  });

  it('[TC-CHUNKY-HUD.17/MSS] [UC-HUD-02] TopBar splits layout into compact match info capsule without monolithic full-screen banner', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar));

    expect(html).toContain('data-testid="match-info-capsule"');
  });

  it('[TC-CHUNKY-HUD.18/MSS] [UC-HUD-02] TopBar renders separated compact utility button cluster', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar));

    expect(html).toContain('data-testid="hud-utilities-cluster"');
  });
});

describe('[TC-CHUNKY-HUD.3/MSS] Facet 3: Resource Disposal & Accessibility', () => {
  it('[TC-CHUNKY-HUD.19/MSS] [UC-HUD-03] ActionDock enforces accessibility role and descriptive aria-labels across chunky buttons', () => {
    const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));

    expect(html).toContain('aria-label="Thanh điều khiển tác vụ"');
    expect(html).toContain('aria-label="Đổ xúc xắc"');
    expect(html).toContain('aria-label="Kết thúc lượt"');
  });

  it('[TC-CHUNKY-HUD.20/MSS] [UC-HUD-03] TopBar match capsules enforce role="timer" and aria-live="polite" for assistive tech', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar));

    expect(html).toContain('role="timer"');
    expect(html).toContain('aria-live="polite"');
  });

  it('[TC-CHUNKY-HUD.21/MSS] [UC-HUD-03] PlayerCard ribbon provides accessible region role and localized label', () => {
    const player: PlayerHudInfo = {
      id: 'p1',
      name: 'Chủ Tịch Hưng',
      balance: 10000,
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

    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Thông tin Chủ Tịch Hưng"');
  });

  it('[TC-CHUNKY-HUD.22/MSS] [UC-HUD-03] HUD components mount and unmount cleanly across multiple renders without leaks or crashes', () => {
    const player: PlayerHudInfo = {
      id: 'p1',
      name: 'KTS An',
      balance: 12000,
      tokenColor: '#10b981',
      ownedProperties: [1, 2],
    };

    expect(() => {
      renderToStaticMarkup(React.createElement(PlayerCard, { player, isCurrentTurn: true, levelMap: {}, slotIndex: 0 }));
      renderToStaticMarkup(React.createElement(TopBar));
      renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
    }).not.toThrow();
  });
});

describe('[TC-CHUNKY-HUD.4/MSS] Facet 4: Error Defense & Exceptional States', () => {
  it('[TC-CHUNKY-HUD.23/MSS] [UC-HUD-04] PlayerCard applies grayscale and opacity-50 with "Phá Sản" badge when bankrupt', () => {
    const player: PlayerHudInfo = {
      id: 'p3',
      name: 'Thương Gia Vũ',
      balance: 0,
      tokenColor: '#6b7280',
      ownedProperties: [],
      bankrupt: true,
    };
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 2,
      })
    );

    expect(html).toContain('grayscale');
    expect(html).toContain('opacity-50');
    expect(html).toContain('Phá Sản');
  });

  it('[TC-CHUNKY-HUD.24/MSS] [UC-HUD-04] ActionDock disables roll action and displays bankrupt text when active player is bankrupt', () => {
    useGameStore.setState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 0,
          tokenColor: '#ef4444',
          ownedProperties: [],
          bankrupt: true,
        },
      },
      currentTurnPlayerId: 'p1',
    });
    const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true }));

    expect(html).toContain('Đã Phá Sản');
    expect(html).toContain('disabled=""');
  });

  it('[TC-CHUNKY-HUD.25/MSS] [UC-HUD-04] PlayerCard displays "Kiểm Toán" badge when player is detained in audit station', () => {
    const player: PlayerHudInfo = {
      id: 'p1',
      name: 'Chủ Tịch Hưng',
      balance: 5000,
      tokenColor: '#ef4444',
      ownedProperties: [],
      inAudit: true,
      auditTurnsLeft: 2,
    };
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 0,
      })
    );

    expect(html).toContain('Kiểm Toán');
  });

  it('[TC-CHUNKY-HUD.26/MSS] [UC-HUD-04] PlayerCard formats negative cash balance with warning text and overdraft countdown', () => {
    const player: PlayerHudInfo = {
      id: 'p1',
      name: 'Chủ Tịch Hưng',
      balance: -2500,
      tokenColor: '#ef4444',
      ownedProperties: [],
      overdraftRoundsLeft: 2,
    };
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 0,
      })
    );

    expect(html).toContain('-2.500');
    expect(html).toContain('text-rose-700');
    expect(html).toContain('Thấu chi: còn 2 vòng');
  });

  it('[TC-CHUNKY-HUD.27/MSS] [UC-HUD-04] ActionDock locks End Turn button when player is insolvent with negative cash balance', () => {
    useGameStore.setState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: -1500,
          tokenColor: '#ef4444',
          ownedProperties: [],
        },
      },
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: true,
    });
    const html = renderToStaticMarkup(
      React.createElement(ActionDock, {
        localPlayerId: 'p1',
        isMyTurn: true,
        hasRolledThisTurn: true,
      })
    );

    expect(html).toContain('cursor-not-allowed');
    expect(html).toContain('Bạn đang bị âm tiền');
  });
});
