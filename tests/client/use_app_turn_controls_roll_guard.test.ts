// [TC-ROLL-GUARD/MSS] Contract Test: Optimistic Roll Guard on Disconnected / Handshaking WebSocket
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useGameStore } from '../../src/client/store/game_store';
import { useAppTurnControls } from '../../src/client/network/use_app_turn_controls';

describe('useAppTurnControls roll guard contract', () => {
  beforeEach(() => {
    useGameStore.setState({
      dice: [1, 1],
      isRolling: false,
      activePawnAnimation: null,
      pawnAnimationQueue: [],
      hasRolledThisTurn: false,
    });
  });

  function setupHook(sendIntentMock: (intent: any) => boolean) {
    let handlers: ReturnType<typeof useAppTurnControls> | null = null;
    function Harness() {
      handlers = useAppTurnControls(
        false,
        'VTTEST',
        'p1',
        'p1',
        true,
        vi.fn(),
        vi.fn(),
        sendIntentMock,
        vi.fn(),
        vi.fn(),
        { current: null },
      );
      return null;
    }
    renderToStaticMarkup(React.createElement(Harness));
    return handlers!;
  }

  it('[TC-ROLL-GUARD.01/MSS] does NOT set isRolling to true when sendIntent returns false', () => {
    const sendIntent = vi.fn().mockReturnValue(false);
    const { handleRollDice } = setupHook(sendIntent);

    const result = handleRollDice();

    expect(sendIntent).toHaveBeenCalledWith({ type: 'INTENT_ROLL' });
    expect(useGameStore.getState().isRolling).toBe(false);
    expect(result).toBe(false);
  });

  it('[TC-ROLL-GUARD.02/MSS] sets isRolling to true when sendIntent succeeds', () => {
    const sendIntent = vi.fn().mockReturnValue(true);
    const { handleRollDice } = setupHook(sendIntent);

    const result = handleRollDice();

    expect(sendIntent).toHaveBeenCalledWith({ type: 'INTENT_ROLL' });
    expect(useGameStore.getState().isRolling).toBe(true);
    expect(result).toBe(true);
  });

  it('[TC-ROLL-GUARD.03/Boundary] does not invoke sendIntent if already rolling or animating', () => {
    useGameStore.setState({ isRolling: true });
    const sendIntent = vi.fn().mockReturnValue(true);
    const { handleRollDice } = setupHook(sendIntent);

    const result = handleRollDice();

    expect(sendIntent).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
