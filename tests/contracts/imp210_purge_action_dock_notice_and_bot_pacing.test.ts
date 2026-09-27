// [TC-210.01/MSS..TC-210.06/MSS][UC-IMP210]
// Contract Test Suite: Purge ActionDock Guidance Chip & Bot Pacing Notice (IMP-210)
// Scope: Tối ưu không gian hiển thị Mobile, loại bỏ triệt để notice chip 'Đứng tại...' và 'Lượt Bot...' phía trên ActionDock.

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { ActionDock } from '../../src/client/ui/action_dock.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { TurnPhase } from '../../src/domain/room.js';

describe('[TC-210.01/MSS..TC-210.06/MSS][UC-IMP210] Purge ActionDock Notice Chip Contract Suite', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
    useGameStore.setState({
      roundNumber: 1,
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      isRolling: false,
      dice: [1, 2],
      activeModal: null,
      playerPositions: { p1: 1, p2: 0, p3: 0, p4: 0 },
      turnPhase: TurnPhase.ActionPhase,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          position: 1,
          balance: 2000,
          ownedProperties: [],
          mortgagedProperties: [],
          bankrupt: false,
          isBot: false,
        } as any,
        p2: {
          id: 'p2',
          name: 'Bot AI 2',
          position: 0,
          balance: 2000,
          ownedProperties: [],
          mortgagedProperties: [],
          bankrupt: false,
          isBot: true,
        } as any,
      },
    });
  });

  it('[TC-210.01/MSS][UC-IMP210] Khi isStandingOnBuyable = true, ActionDock KHÔNG render notice chip Đứng tại... Bấm Mua Đất để chốt', () => {
    useGameStore.setState({
      activeModal: null,
      currentTurnPlayerId: 'p1',
      playerPositions: { p1: 1 },
      turnPhase: TurnPhase.ActionPhase,
      hasRolledThisTurn: true,
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    expect(html).not.toContain('buy_opportunity-notice-chip');
    expect(html).not.toContain('Đứng tại');
    expect(html).not.toContain('Bấm Mua Đất để chốt');
    expect(html).toContain('Mua Đất');
  });

  it('[TC-210.02/MSS][UC-IMP210] Khi đến lượt Bot, ActionDock KHÔNG render bot-pacing-chip và KHÔNG hiển thị Lượt Bot', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p2',
      turnPhase: TurnPhase.WaitingRoll,
      hasRolledThisTurn: false,
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: false })
    );

    expect(html).not.toContain('data-testid="bot-pacing-chip"');
    expect(html).not.toContain('Lượt Bot');
    expect(html).not.toContain('bot-pacing-chip');
  });

  it('[TC-210.03/MSS][UC-IMP210] Khi inAudit = true, ActionDock KHÔNG render audit-notice-chip phía trên thanh điều khiển', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      playerPositions: { p1: 10 },
      turnPhase: TurnPhase.WaitingRoll,
      hasRolledThisTurn: false,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          position: 10,
          balance: 2000,
          ownedProperties: [],
          mortgagedProperties: [],
          bankrupt: false,
          isBot: false,
          inAudit: true,
          auditTurnsLeft: 2,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    expect(html).not.toContain('data-testid="audit-notice-chip"');
    expect(html).not.toContain('audit-notice-chip');
  });

  it('[TC-210.04/MSS][UC-IMP210] Khi isInsolvent = true (âm vốn), ActionDock KHÔNG render insolvent-notice-chip', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          position: 1,
          balance: -500,
          ownedProperties: [],
          mortgagedProperties: [],
          bankrupt: false,
          isBot: false,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    expect(html).not.toContain('data-testid="insolvent-notice-chip"');
    expect(html).not.toContain('insolvent-notice-chip');
    expect(html).not.toContain('Âm vốn');
  });

  it('[TC-210.05/MSS][UC-IMP210] Khi bị mất lượt (skipNextTurn), ActionDock KHÔNG render skip-turn-notice-chip', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      turnPhase: TurnPhase.PropertyManagement,
      hasRolledThisTurn: false,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          position: 1,
          balance: 2000,
          ownedProperties: [],
          mortgagedProperties: [],
          bankrupt: false,
          isBot: false,
          skipNextTurn: true,
        } as any,
      },
    });

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    expect(html).not.toContain('data-testid="skip-turn-notice-chip"');
    expect(html).not.toContain('skip-turn-notice-chip');
  });

  it('[TC-210.06/MSS][UC-IMP210] ActionDock vẫn render thanh <nav> điều khiển tác vụ với đầy đủ độ tin cậy', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true })
    );

    expect(html).toContain('<nav');
    expect(html).toContain('aria-label="Thanh điều khiển tác vụ"');
  });
});
