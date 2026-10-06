// @vitest-environment happy-dom
// [CONTRACT TEST] IMP-279: Presentation Staging & Transit Wheel Sync
// Traceability Tags: [TC-279.01/MSS] .. [TC-279.07/MSS], [TC-279.08/A1], [TC-279.09/A2], [TC-279.10/A3] & [UC-IMP279]
// Invariant Reference: docs/domain/gotchas/fsm_lifecycle.md, testing_traps.md, .agents/plans/PLAN_IMP_279_PRESENTATION_STAGING_AND_TRANSIT_WHEEL_SYNC.md

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { TurnPhase, createPlayer } from '../../src/domain/room.js';
import { TransitWheelOutcome } from '../../src/domain/transit_wheel.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import {
  applyDeltaToStore,
  consumeStagedTransitWheel,
  resetStagedTransitWheel,
} from '../../src/client/network/apply_delta.js';
import { useAppSession } from '../../src/client/network/use_app_session.js';
import { PawnAnimator } from '../../src/client/3d/pawn_animator.js';
import { TransitWheelModal } from '../../src/client/ui/modals/transit_wheel_modal.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types.js';

// Setup React act testing environment flag
declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Mock R3F and Drei for headless testing of 3D pawn components
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

vi.mock('../../src/client/assets/tile_assets.js', () => ({
  preloadBaseTileImages: vi.fn(),
}));

interface MockComponentProps {
  readonly children?: React.ReactNode;
  readonly follow?: boolean | number;
  readonly [key: string]: unknown;
}

vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    Billboard: ({ children, follow = true, ...props }: MockComponentProps) =>
      React.createElement('billboard', { follow: String(follow), ...props }, children),
  };
});

// Module augmentation for extended signature in Task 1
declare module '../../src/client/network/apply_delta.js' {
  export interface StagedTransitWheel {
    readonly playerId: string;
    readonly cellIndex: number;
    readonly timestamp: number;
  }
  export function consumeStagedTransitWheel(
    targetCellIndex?: number,
    targetPlayerId?: string,
  ): StagedTransitWheel | null;
  export function resetStagedTransitWheel(): void;
}

interface GroupContainerProps {
  readonly children?: React.ReactNode;
}

interface StaticPawnChildProps {
  readonly currentPos?: number;
}

function createTestHudPlayer(id: string, name: string): PlayerHudInfo {
  return {
    id,
    name,
    balance: 5000,
    tokenColor: '#38BDF8',
    ownedProperties: [],
    mortgagedProperties: [],
    mortgageLoans: {},
    isBot: false,
    bankrupt: false,
    inAudit: false,
    auditTurnsLeft: 0,
    consecutiveDoubles: 0,
    skipNextTurn: false,
  };
}

function SessionLandingHarness(): null {
  useAppSession(
    null,
    'p1',
    true,
    [],
    true,
    useGameStore.getState().openModal,
    useGameStore.getState().triggerEmote,
    useGameStore.getState().currentTurnPlayerId,
    useGameStore.getState().setPlayersInfo,
    useGameStore.getState().setCurrentTurnPlayerId,
    useGameStore.getState().setTreasuryPool,
    useGameStore.getState().setPlayerPositions,
    useLobbyStore.getState().initLobby,
    () => {},
  );
  return null;
}

describe('IMP-279: Presentation Staging & Transit Wheel Sync Contract Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useGameStore.getState().resetGameState();
    useLobbyStore.getState().resetLobby();
    resetStagedTransitWheel();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    useGameStore.getState().resetGameState();
    useLobbyStore.getState().resetLobby();
    resetStagedTransitWheel();
  });

  it('[TC-279.01][UC-IMP279/MSS] Given isRolling is true, When delta.pendingTransitWheel arrives, Then activeModal remains null and wheel is staged', () => {
    useLobbyStore.getState().setMyPlayerId('p1');
    useGameStore.setState({
      isRolling: true,
      activeModal: null,
      playersInfo: { p1: createTestHudPlayer('p1', 'Người Chơi 1') },
    });

    const delta: DeltaPayload = {
      roomCode: 'VTTEST',
      tick: 1,
      cells: [],
      pendingTransitWheel: { playerId: 'p1', cellIndex: 5, timestamp: 1000 },
    };
    applyDeltaToStore(delta);

    expect(useGameStore.getState().activeModal).toBeNull();
    const staged = consumeStagedTransitWheel();
    expect(staged).toEqual({ playerId: 'p1', cellIndex: 5, timestamp: 1000 });
  });

  it('[TC-279.02][UC-IMP279/MSS] Given activePawnAnimation.isAnimating is true, When delta.pendingTransitWheel arrives, Then stagedTransitWheel is preserved', () => {
    useLobbyStore.getState().setMyPlayerId('p1');
    useGameStore.setState({
      isRolling: false,
      activeModal: null,
      activePawnAnimation: {
        playerId: 'p1',
        fromCell: 0,
        waypoints: [1, 2, 3, 4, 5],
        currentIndex: 2,
        isAnimating: true,
      },
      playersInfo: { p1: createTestHudPlayer('p1', 'Người Chơi 1') },
    });

    const delta: DeltaPayload = {
      roomCode: 'VTTEST',
      tick: 2,
      cells: [],
      pendingTransitWheel: { playerId: 'p1', cellIndex: 5, timestamp: 2000 },
    };
    applyDeltaToStore(delta);

    expect(useGameStore.getState().activeModal).toBeNull();
    const staged = consumeStagedTransitWheel();
    expect(staged).toEqual({ playerId: 'p1', cellIndex: 5, timestamp: 2000 });
  });

  it('[TC-279.03][UC-IMP279/MSS] Given staged transit wheel, When lastLandedPawn triggers at matched station cell, Then activeModal transitions to transit_wheel', () => {
    useLobbyStore.getState().setMyPlayerId('p1');
    useGameStore.setState({
      isRolling: true,
      activeModal: null,
      playersInfo: { p1: createTestHudPlayer('p1', 'Người Chơi 1') },
    });

    const delta: DeltaPayload = {
      roomCode: 'VTTEST',
      tick: 3,
      cells: [],
      pendingTransitWheel: { playerId: 'p1', cellIndex: 5, timestamp: 3000 },
    };
    applyDeltaToStore(delta);

    // Assert that activeModal remained null prior to pawn landing
    expect(useGameStore.getState().activeModal).toBeNull();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      act(() => {
        root.render(React.createElement(SessionLandingHarness));
      });

      act(() => {
        useGameStore.setState({
          lastLandedPawn: { playerId: 'p1', cellIndex: 5, timestamp: 3001 },
        });
      });

      expect(useGameStore.getState().activeModal).toBe('transit_wheel');
    } finally {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  });

  it('[TC-279.04][UC-IMP279/MSS] Given isMoving is false on full sync or unowned station purchase, When delta.pendingTransitWheel arrives, Then openModal transit_wheel executes immediately', () => {
    useLobbyStore.getState().setMyPlayerId('p1');
    useGameStore.setState({
      isRolling: false,
      activePawnAnimation: null,
      activeModal: null,
      playersInfo: { p1: createTestHudPlayer('p1', 'Người Chơi 1') },
    });

    const delta: DeltaPayload = {
      roomCode: 'VTTEST',
      tick: 4,
      cells: [],
      pendingTransitWheel: { playerId: 'p1', cellIndex: 15, timestamp: 4000 },
    };
    applyDeltaToStore(delta);

    expect(useGameStore.getState().activeModal).toBe('transit_wheel');
    const staged = consumeStagedTransitWheel();
    expect(staged).toBeNull();
  });

  it('[TC-279.05][UC-IMP279/MSS] Given activeModal is transit_wheel, When setIsRolling false executes, Then pendingPawnMove is not consumed', () => {
    useGameStore.setState({
      activeModal: 'transit_wheel',
      isRolling: true,
      pendingPawnMove: { playerId: 'p1', fromCell: 5, targetCell: 8, isBot: false },
    });

    useGameStore.getState().setIsRolling(false);

    expect(useGameStore.getState().pendingPawnMove).not.toBeNull();
    expect(useGameStore.getState().pendingPawnMove?.targetCell).toBe(8);
  });

  it('[TC-279.06][UC-IMP279/MSS] Given activeModal is transit_wheel, When pendingPawnMove is active, Then pawn position resolves strictly to fromCell', () => {
    const testPlayer = createPlayer('p1');
    testPlayer.position = 25;

    useGameStore.setState({
      activeModal: 'transit_wheel',
      playerPositions: { p1: 25 },
      visualPositions: { p1: 25 },
      pendingPawnMove: { playerId: 'p1', fromCell: 5, targetCell: 25 },
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      const pawnRef: { current: React.ReactNode } = { current: null };
      function VdomReader(): null {
        const tree = PawnAnimator({ players: [testPlayer] });
        if (React.isValidElement<GroupContainerProps>(tree)) {
          const children = React.Children.toArray(tree.props.children);
          pawnRef.current = children[0];
        }
        return null;
      }

      act(() => {
        root.render(React.createElement(VdomReader));
      });

      const target = pawnRef.current;
      expect(React.isValidElement<StaticPawnChildProps>(target)).toBe(true);
      if (React.isValidElement<StaticPawnChildProps>(target)) {
        expect(target.props.currentPos).toBe(5);
      }
    } finally {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  });

  it('[TC-279.07][UC-IMP279/MSS] Given activeModal is transit_wheel, When handleDismiss triggers, Then startPawnMove is dispatched and modal closes', () => {
    useGameStore.setState({
      activeModal: 'transit_wheel',
      modalPayload: {
        cellIndex: 5,
        outcome: TransitWheelOutcome.SPEED_BOOST,
        targetCell: 8,
      },
      pendingPawnMove: { playerId: 'p1', fromCell: 5, targetCell: 8 },
      playerPositions: { p1: 5 },
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      act(() => {
        root.render(
          React.createElement(TransitWheelModal, {
            cellIndex: 5,
            payload: {
              cellIndex: 5,
              outcome: TransitWheelOutcome.SPEED_BOOST,
              targetCell: 8,
            },
            onSpin: () => {},
            onClose: () => useGameStore.getState().closeModal(),
          }),
        );
      });

      act(() => {
        vi.advanceTimersByTime(3500);
      });

      const buttons = container.querySelectorAll('button');
      const dismissBtn = buttons[buttons.length - 1];
      act(() => {
        dismissBtn?.click();
      });

      expect(useGameStore.getState().pendingPawnMove).toBeNull();
      expect(useGameStore.getState().activeModal).toBeNull();
      const nextTarget =
        useGameStore.getState().activePawnAnimation?.waypoints.slice(-1)[0] ??
        useGameStore.getState().pawnAnimationQueue?.[0]?.targetCell;
      expect(nextTarget).toBe(8);
    } finally {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  });

  it('[TC-279.08][UC-IMP279/A1] Given activeModal is transit_wheel, When delta.pendingTransitWheel is null, Then activeModal remains open and stagedTransitWheel is cleared', () => {
    useGameStore.setState({
      activeModal: 'transit_wheel',
      modalPayload: { cellIndex: 5 },
    });

    const delta: DeltaPayload = {
      roomCode: 'VTTEST',
      tick: 5,
      cells: [],
      pendingTransitWheel: null,
    };
    applyDeltaToStore(delta);

    expect(useGameStore.getState().activeModal === 'transit_wheel').toBe(true);
    expect(useGameStore.getState().activeModal).toBe('transit_wheel');
    const staged = consumeStagedTransitWheel();
    expect(staged).toBeNull();
  });

  it('[TC-279.09][UC-IMP279/A2] Given activeModal is transit_wheel, When phase transitions away from PropertyManagement, Then modal closes and pendingPawnMove is cleared', () => {
    useGameStore.setState({
      activeModal: 'transit_wheel',
      pendingPawnMove: { playerId: 'p1', fromCell: 5, targetCell: 15 },
      turnPhase: TurnPhase.PropertyManagement,
    });

    const delta: DeltaPayload = {
      roomCode: 'VTTEST',
      tick: 6,
      cells: [],
      turnPhase: TurnPhase.WaitingRoll,
    };
    applyDeltaToStore(delta);

    expect(useGameStore.getState().activeModal).toBeNull();
    expect(useGameStore.getState().pendingPawnMove).toBeNull();
  });

  it('[TC-279.10][UC-IMP279/A3] Given mismatched lastLandedPawn cellIndex, When landing handled, Then staged wheel is not consumed by incorrect cell', () => {
    useLobbyStore.getState().setMyPlayerId('p1');
    useGameStore.setState({
      isRolling: true,
      activeModal: null,
      playersInfo: { p1: createTestHudPlayer('p1', 'Người Chơi 1') },
    });

    const delta: DeltaPayload = {
      roomCode: 'VTTEST',
      tick: 7,
      cells: [],
      pendingTransitWheel: { playerId: 'p1', cellIndex: 5, timestamp: 7000 },
    };
    applyDeltaToStore(delta);

    // Assert that activeModal remained null prior to pawn landing
    expect(useGameStore.getState().activeModal).toBeNull();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    try {
      act(() => {
        root.render(React.createElement(SessionLandingHarness));
      });

      // Pawn lands on cell 4 instead of 5
      act(() => {
        useGameStore.setState({
          lastLandedPawn: { playerId: 'p1', cellIndex: 4, timestamp: 7001 },
        });
      });

      expect(useGameStore.getState().activeModal).toBeNull();
      const preservedStaged = consumeStagedTransitWheel(5, 'p1');
      expect(preservedStaged).toEqual({ playerId: 'p1', cellIndex: 5, timestamp: 7000 });
    } finally {
      act(() => {
        root.unmount();
      });
      container.remove();
    }
  });
});
