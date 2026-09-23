// [IMP-180] Contract Test Suite: Match Start Bot Count & Zombie State Purge
// Universal 4-Facet Matrix: Boundary, Reactivity, Disposal & Teardown, Error Defense
// Traceability: [TC-180.xx/MSS], [UC-IMP180], [UC-START-GAME]
import { describe, it, expect, beforeEach } from 'vitest';
import { applyDeltaToStore } from '../../src/client/network/apply_delta';
import { useGameStore } from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import { createEmptySlot } from '../../src/client/store/lobby_types';
import { TurnPhase } from '../../src/domain/room';
import type { DeltaPayload } from '../../src/server/session_manager';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types';

function createMockPlayer(id: string, name: string, balance = 15_000): PlayerHudInfo {
  return {
    id,
    name,
    balance,
    tokenColor: id === 'p1' ? '#ef4444' : id === 'bot_2' ? '#3b82f6' : id === 'bot_3' ? '#10b981' : '#f59e0b',
    ownedProperties: [],
    mortgagedProperties: [],
  };
}

function createFullSyncCells(): DeltaPayload['cells'] {
  return Array.from({ length: 40 }, (_, index) => ({ index, ownerId: null }));
}

describe('[IMP-180] Match Start Bot Count & Zombie State Purge Contract', () => {
  beforeEach(() => {
    useLobbyStore.setState({
      roomCode: 'VTK180',
      myPlayerId: 'p1',
      isHost: true,
      gameStarted: true,
      slots: [
        { slotIndex: 0, playerId: 'p1', playerName: 'Chủ Phòng Hải', isHost: true, isReady: true, isBot: false, isOccupied: true, tokenColor: '#ef4444' },
        createEmptySlot(1),
        createEmptySlot(2),
        createEmptySlot(3),
      ],
    });

    useGameStore.setState({
      playersInfo: {
        p1: createMockPlayer('p1', 'Chủ Phòng Hải'),
        bot_2: createMockPlayer('bot_2', 'Bot AI 2 (Balanced)'),
        bot_3: createMockPlayer('bot_3', 'Bot AI 3 (Aggressive)'),
        bot_4: createMockPlayer('bot_4', 'Bot AI 4 (Passive)'),
      },
      playerPositions: { p1: 0, bot_2: 0, bot_3: 0, bot_4: 0 },
      visualPositions: { p1: 0, bot_2: 0, bot_3: 0, bot_4: 0 },
      levelMap: {},
      isRolling: false,
      hasRolledThisTurn: false,
      activeModal: null,
      modalPayload: null,
    });
  });

  // ==========================================
  // FACET 1: BOUNDARY & RANGE
  // ==========================================

  it('[TC-180.01/MSS][UC-IMP180] Bắt đầu ván với 2 Bot (1 Host + 2 Bot) -> sau full sync, playersInfo có chính xác 3 người chơi', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: createFullSyncCells(),
      players: [
        { id: 'p1', position: 0, balance: 15_000 },
        { id: 'bot_2', position: 0, balance: 15_000 },
        { id: 'bot_3', position: 0, balance: 15_000 },
      ],
      turnPhase: TurnPhase.WaitingRoll,
      roomStarted: true,
    };

    applyDeltaToStore(delta, useGameStore);

    const keys = Object.keys(useGameStore.getState().playersInfo).sort();
    expect(keys).toHaveLength(3);
    expect(keys).toEqual(['bot_2', 'bot_3', 'p1']);
  });

  it('[TC-180.02/MSS][UC-IMP180] Bắt đầu ván với 2 Bot -> playerPositions có chính xác 3 keys', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: createFullSyncCells(),
      players: [
        { id: 'p1', position: 0, balance: 15_000 },
        { id: 'bot_2', position: 0, balance: 15_000 },
        { id: 'bot_3', position: 0, balance: 15_000 },
      ],
      turnPhase: TurnPhase.WaitingRoll,
      roomStarted: true,
    };

    applyDeltaToStore(delta, useGameStore);

    const keys = Object.keys(useGameStore.getState().playerPositions).sort();
    expect(keys).toHaveLength(3);
    expect(keys).toEqual(['bot_2', 'bot_3', 'p1']);
  });

  it('[TC-180.03/MSS][UC-IMP180] Bắt đầu ván với 1 Bot (1 Host + 1 Bot) -> playersInfo có chính xác 2 người chơi', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: createFullSyncCells(),
      players: [
        { id: 'p1', position: 0, balance: 15_000 },
        { id: 'bot_2', position: 0, balance: 15_000 },
      ],
      turnPhase: TurnPhase.WaitingRoll,
      roomStarted: true,
    };

    applyDeltaToStore(delta, useGameStore);

    const keys = Object.keys(useGameStore.getState().playersInfo).sort();
    expect(keys).toHaveLength(2);
    expect(keys).toEqual(['bot_2', 'p1']);
  });

  it('[TC-180.04/MSS][UC-IMP180] Bắt đầu ván với 1 Bot -> playerPositions có chính xác 2 keys', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: createFullSyncCells(),
      players: [
        { id: 'p1', position: 0, balance: 15_000 },
        { id: 'bot_2', position: 0, balance: 15_000 },
      ],
      turnPhase: TurnPhase.WaitingRoll,
      roomStarted: true,
    };

    applyDeltaToStore(delta, useGameStore);

    const keys = Object.keys(useGameStore.getState().playerPositions).sort();
    expect(keys).toHaveLength(2);
    expect(keys).toEqual(['bot_2', 'p1']);
  });

  it('[TC-180.05/MSS][UC-IMP180] Bắt đầu ván với 3 Bot (1 Host + 3 Bot) -> playersInfo có đủ 4 người chơi', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: createFullSyncCells(),
      players: [
        { id: 'p1', position: 0, balance: 15_000 },
        { id: 'bot_2', position: 0, balance: 15_000 },
        { id: 'bot_3', position: 0, balance: 15_000 },
        { id: 'bot_4', position: 0, balance: 15_000 },
      ],
      turnPhase: TurnPhase.WaitingRoll,
      roomStarted: true,
    };

    applyDeltaToStore(delta, useGameStore);

    const keys = Object.keys(useGameStore.getState().playersInfo).sort();
    expect(keys).toHaveLength(4);
    expect(keys).toEqual(['bot_2', 'bot_3', 'bot_4', 'p1']);
  });

  // ==========================================
  // FACET 2: STATE REACTIVITY & PRUNING
  // ==========================================

  it('[TC-180.06/MSS][UC-IMP180] Store chứa 4 người chơi, nhận full sync chỉ mang p1, bot_2, bot_3 -> bot_4 lập tức bị prune khỏi playersInfo', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: createFullSyncCells(),
      players: [
        { id: 'p1', position: 0, balance: 15_000 },
        { id: 'bot_2', position: 0, balance: 15_000 },
        { id: 'bot_3', position: 0, balance: 15_000 },
      ],
      turnPhase: TurnPhase.WaitingRoll,
    };

    applyDeltaToStore(delta, useGameStore);

    expect(useGameStore.getState().playersInfo['bot_4']).toBeUndefined();
    expect(useGameStore.getState().playersInfo['p1']).toBeDefined();
  });

  it('[TC-180.07/MSS][UC-IMP180] Nhận full sync chỉ mang p1, bot_2, bot_3 -> bot_4 lập tức bị prune khỏi playerPositions', () => {
    useGameStore.setState({
      playerPositions: { p1: 0, bot_2: 5, bot_3: 10, bot_4: 36 },
    });

    const delta: DeltaPayload = {
      tick: 1,
      cells: createFullSyncCells(),
      players: [
        { id: 'p1', position: 0, balance: 15_000 },
        { id: 'bot_2', position: 5, balance: 15_000 },
        { id: 'bot_3', position: 10, balance: 15_000 },
      ],
      turnPhase: TurnPhase.WaitingRoll,
    };

    applyDeltaToStore(delta, useGameStore);

    expect(useGameStore.getState().playerPositions['bot_4']).toBeUndefined();
    expect(useGameStore.getState().playerPositions['bot_2']).toBe(5);
  });

  it('[TC-180.08/MSS][UC-IMP180] Nhận full sync chỉ mang p1, bot_2, bot_3 -> bot_4 lập tức bị prune khỏi visualPositions', () => {
    useGameStore.setState({
      playerPositions: { p1: 0, bot_2: 5, bot_3: 10, bot_4: 36 },
      visualPositions: { p1: 0, bot_2: 5, bot_3: 10, bot_4: 36 },
    });

    const delta: DeltaPayload = {
      tick: 1,
      cells: createFullSyncCells(),
      players: [
        { id: 'p1', position: 0, balance: 15_000 },
        { id: 'bot_2', position: 5, balance: 15_000 },
        { id: 'bot_3', position: 10, balance: 15_000 },
      ],
      turnPhase: TurnPhase.WaitingRoll,
    };

    applyDeltaToStore(delta, useGameStore);

    expect(useGameStore.getState().visualPositions['bot_4']).toBeUndefined();
    expect(useGameStore.getState().visualPositions['bot_3']).toBe(10);
  });

  it('[TC-180.09/MSS][UC-IMP180] Full sync thu hẹp danh sách từ 4 xuống 2 người chơi (p1, bot_2) -> cả bot_3 và bot_4 đều bị prune khỏi playersInfo', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: createFullSyncCells(),
      players: [
        { id: 'p1', position: 0, balance: 15_000 },
        { id: 'bot_2', position: 0, balance: 15_000 },
      ],
      turnPhase: TurnPhase.WaitingRoll,
    };

    applyDeltaToStore(delta, useGameStore);

    expect(useGameStore.getState().playersInfo['bot_3']).toBeUndefined();
    expect(useGameStore.getState().playersInfo['bot_4']).toBeUndefined();
  });

  it('[TC-180.10/MSS][UC-IMP180] Full sync thu hẹp danh sách -> currentState.playersInfo thực sự được set vào Zustand store', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: createFullSyncCells(),
      players: [
        { id: 'p1', position: 0, balance: 15_000 },
        { id: 'bot_2', position: 0, balance: 15_000 },
      ],
      turnPhase: TurnPhase.WaitingRoll,
    };

    applyDeltaToStore(delta, useGameStore);

    const keys = Object.keys(useGameStore.getState().playersInfo).sort();
    expect(keys).toEqual(['bot_2', 'p1']);
  });

  // ==========================================
  // FACET 3: DISPOSAL & TEARDOWN
  // ==========================================

  it('[TC-180.11/MSS][UC-IMP180] Gọi resetGameState() xóa sạch playersInfo thành {}', () => {
    useGameStore.setState({
      playersInfo: {
        p1: createMockPlayer('p1', 'Chủ Phòng Hải'),
        bot_2: createMockPlayer('bot_2', 'Bot AI 2'),
      },
    });

    useGameStore.getState().resetGameState?.();

    expect(useGameStore.getState().playersInfo).toEqual({});
  });

  it('[TC-180.12/MSS][UC-IMP180] Gọi resetGameState() xóa sạch playerPositions và visualPositions thành {}', () => {
    useGameStore.setState({
      playerPositions: { p1: 12, bot_2: 15 },
      visualPositions: { p1: 12, bot_2: 15 },
    });

    useGameStore.getState().resetGameState?.();

    expect(useGameStore.getState().playerPositions).toEqual({});
    expect(useGameStore.getState().visualPositions).toEqual({});
  });

  it('[TC-180.13/MSS][UC-IMP180] Gọi resetGameState() xóa sạch levelMap thành {}', () => {
    useGameStore.setState({
      levelMap: { 1: 2, 3: 1, 5: 3 },
    });

    useGameStore.getState().resetGameState?.();

    expect(useGameStore.getState().levelMap).toEqual({});
  });

  it('[TC-180.14/MSS][UC-IMP180] lobby_store có action resetBotSlots(): biến các slot bot (isBot: true) thành empty slot', () => {
    useLobbyStore.setState({
      slots: [
        { slotIndex: 0, playerId: 'p1', playerName: 'Chủ Phòng Hải', isHost: true, isReady: true, isBot: false, isOccupied: true, tokenColor: '#ef4444' },
        { slotIndex: 1, playerId: 'bot_2', playerName: 'Bot AI 2', isHost: false, isReady: true, isBot: true, isOccupied: true, tokenColor: '#3b82f6' },
        { slotIndex: 2, playerId: 'bot_3', playerName: 'Bot AI 3', isHost: false, isReady: true, isBot: true, isOccupied: true, tokenColor: '#10b981' },
        createEmptySlot(3),
      ],
    });

    const lobby = useLobbyStore.getState() as unknown as { resetBotSlots: () => void };
    lobby.resetBotSlots();

    const slots = useLobbyStore.getState().slots;
    expect(slots[1]?.isBot).toBe(false);
    expect(slots[1]?.isOccupied).toBe(false);
    expect(slots[2]?.isBot).toBe(false);
  });

  it('[TC-180.15/MSS][UC-IMP180] resetBotSlots() bảo toàn nguyên vẹn roomCode, myPlayerId, isHost và slot Host người thật', () => {
    useLobbyStore.setState({
      roomCode: 'VTK888',
      myPlayerId: 'p1',
      isHost: true,
      slots: [
        { slotIndex: 0, playerId: 'p1', playerName: 'Chủ Phòng Hải', isHost: true, isReady: true, isBot: false, isOccupied: true, tokenColor: '#ef4444' },
        { slotIndex: 1, playerId: 'bot_2', playerName: 'Bot AI 2', isHost: false, isReady: true, isBot: true, isOccupied: true, tokenColor: '#3b82f6' },
        createEmptySlot(2),
        createEmptySlot(3),
      ],
    });

    const lobby = useLobbyStore.getState() as unknown as { resetBotSlots: () => void };
    lobby.resetBotSlots();

    expect(useLobbyStore.getState().roomCode).toBe('VTK888');
    expect(useLobbyStore.getState().myPlayerId).toBe('p1');
    expect(useLobbyStore.getState().isHost).toBe(true);
    expect(useLobbyStore.getState().slots[0]?.isOccupied).toBe(true);
  });

  it('[TC-180.16/MSS][UC-IMP180] Nhận delta với roomStarted: false kích hoạt resetGameState dọn sạch playersInfo về {}', () => {
    useGameStore.setState({
      playersInfo: {
        p1: createMockPlayer('p1', 'Chủ Phòng Hải'),
        bot_2: createMockPlayer('bot_2', 'Bot AI 2'),
      },
    });

    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      roomStarted: false,
      turnPhase: TurnPhase.WaitingRoll,
    };

    applyDeltaToStore(delta, useGameStore);

    expect(useGameStore.getState().playersInfo).toEqual({});
  });

  it('[TC-180.17/MSS][UC-IMP180] Nhận delta với roomStarted: false tự động gọi resetBotSlots() dọn sạch slot bot cũ trong sảnh', () => {
    useLobbyStore.setState({
      slots: [
        { slotIndex: 0, playerId: 'p1', playerName: 'Chủ Phòng Hải', isHost: true, isReady: true, isBot: false, isOccupied: true, tokenColor: '#ef4444' },
        { slotIndex: 1, playerId: 'bot_2', playerName: 'Bot AI 2', isHost: false, isReady: true, isBot: true, isOccupied: true, tokenColor: '#3b82f6' },
        { slotIndex: 2, playerId: 'bot_3', playerName: 'Bot AI 3', isHost: false, isReady: true, isBot: true, isOccupied: true, tokenColor: '#10b981' },
        createEmptySlot(3),
      ],
    });

    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      roomStarted: false,
      turnPhase: TurnPhase.WaitingRoll,
    };

    applyDeltaToStore(delta, useGameStore);

    const slots = useLobbyStore.getState().slots;
    expect(slots[1]?.isBot).toBe(false);
    expect(slots[1]?.isOccupied).toBe(false);
  });

  // ==========================================
  // FACET 4: ERROR DEFENSE & INVARIANTS
  // ==========================================

  it('[TC-180.18/MSS][UC-IMP180] Sparse delta (cells: [], isFullSync = false) với delta.players chỉ mang 1 player KHÔNG được prune các người chơi khác', () => {
    useGameStore.setState({
      playersInfo: {
        p1: createMockPlayer('p1', 'Chủ Phòng Hải'),
        bot_2: createMockPlayer('bot_2', 'Bot AI 2'),
        bot_3: createMockPlayer('bot_3', 'Bot AI 3'),
      },
      playerPositions: { p1: 0, bot_2: 5, bot_3: 10 },
    });

    const sparseDelta: DeltaPayload = {
      tick: 2,
      cells: [],
      players: [{ id: 'p1', position: 5, balance: 14_000 }],
      turnPhase: TurnPhase.WaitingRoll,
    };

    applyDeltaToStore(sparseDelta, useGameStore);

    expect(useGameStore.getState().playersInfo['bot_2']).toBeDefined();
    expect(useGameStore.getState().playersInfo['bot_3']).toBeDefined();
  });

  it('[TC-180.19/MSS][UC-IMP180] Full sync (cells.length === 40) nhưng delta.players là undefined KHÔNG được prune hay xóa sạch người chơi hiện hữu', () => {
    useGameStore.setState({
      playersInfo: {
        p1: createMockPlayer('p1', 'Chủ Phòng Hải'),
        bot_2: createMockPlayer('bot_2', 'Bot AI 2'),
        bot_3: createMockPlayer('bot_3', 'Bot AI 3'),
      },
      playerPositions: { p1: 0, bot_2: 5, bot_3: 10 },
    });

    const fullSyncNoPlayersDelta: DeltaPayload = {
      tick: 3,
      cells: createFullSyncCells(),
      players: undefined,
      turnPhase: TurnPhase.WaitingRoll,
    };

    applyDeltaToStore(fullSyncNoPlayersDelta, useGameStore);

    expect(useGameStore.getState().playersInfo['bot_2']).toBeDefined();
    expect(useGameStore.getState().playersInfo['bot_3']).toBeDefined();
  });
});
