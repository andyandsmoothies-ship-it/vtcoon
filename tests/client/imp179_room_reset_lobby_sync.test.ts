// [TC-IMP179/MSS] Contract Test Suite: Room Reset Lobby Sync & Anti-Zombie In-Game UI
// Verifies applyDeltaToStore accurately synchronizes roomStarted: false,
// switching UI from In-Game HUD back to PreMatchDeck (Lobby) and resetting game state.
import { describe, it, expect, beforeEach } from 'vitest';
import { applyDeltaToStore } from '../../src/client/network/apply_delta';
import { useGameStore } from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import { TurnPhase } from '../../src/domain/room';
import type { DeltaPayload } from '../../src/server/session_manager';

describe('[TC-IMP179/MSS] Room Reset Lobby Sync & Anti-Zombie In-Game UI', () => {
  beforeEach(() => {
    useLobbyStore.setState({ gameStarted: true });
    useGameStore.setState({
      activeModal: 'auction',
      isRolling: true,
      hasRolledThisTurn: true,
      cameraFocusCell: 27,
    });
  });

  it('[TC-179.01/MSS] delta mang roomStarted: false cập nhật useLobbyStore gameStarted về false', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: Array.from({ length: 40 }, (_, index) => ({ index, ownerId: null })),
      players: [{ id: 'p1', position: 0, balance: 15_000 }],
      roomStarted: false,
      turnPhase: TurnPhase.WaitingRoll,
    };

    applyDeltaToStore(delta, useGameStore);
    expect(useLobbyStore.getState().gameStarted).toBe(false);
  });

  it('[TC-179.02/MSS] delta mang roomStarted: false kích hoạt resetGameState dọn sạch modal và cờ đang đổ', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: Array.from({ length: 40 }, (_, index) => ({ index, ownerId: null })),
      players: [{ id: 'p1', position: 0, balance: 15_000 }],
      roomStarted: false,
      turnPhase: TurnPhase.WaitingRoll,
    };

    applyDeltaToStore(delta, useGameStore);
    const gameState = useGameStore.getState();
    expect(gameState.activeModal).toBeNull();
    expect(gameState.isRolling).toBe(false);
    expect(gameState.hasRolledThisTurn).toBe(false);
    expect(gameState.cameraFocusCell).toBeNull();
  });

  it('[TC-179.03/MSS] delta mang roomStarted: true cập nhật useLobbyStore gameStarted thành true', () => {
    useLobbyStore.setState({ gameStarted: false });
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      players: [{ id: 'p1', position: 0, balance: 15_000 }],
      roomStarted: true,
      turnPhase: TurnPhase.WaitingRoll,
    };

    applyDeltaToStore(delta, useGameStore);
    expect(useLobbyStore.getState().gameStarted).toBe(true);
  });
});
