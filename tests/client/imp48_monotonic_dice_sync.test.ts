// [TC-IMP48/MSS][UC-IMP48] Contract Test Suite: Monotonic Dice Sync & Camera Stabilization
// Universal 4-Facet Behavioral Matrix Verification:
// Facet 1: Monotonic Sequence Boundary (undefined, initial seq, duplicate seq, out-of-order seq)
// Facet 2: State Reactivity & Camera Invariant (buy/upgrade/mortgage deltas preserve isRolling=false & camera='tile_focus')
// Facet 3: Error Defense & Fallback (zero dice, missing dice, fallback duplicate suppression)
// Facet 4: Resource Disposal & Match Reset (reset session clears lastDiceSeq safely)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../../src/client/store/game_store.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { resolveCameraMode } from '../../src/client/3d/camera_state_machine.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

describe('[TC-IMP48/MSS][UC-IMP48] Monotonic Dice Sync & Camera Stabilization Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      dice: [1, 1],
      isRolling: false,
      hasRolledThisTurn: false,
      currentTurnPlayerId: 'p1',
      playerPositions: { p1: 3 },
      levelMap: {},
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Người Chơi 1',
          balance: 15000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
          mortgagedProperties: [],
        },
      },
      activeModal: null,
      modalPayload: null,
      lastDiceSeq: undefined,
    });
  });

  // ===========================================================================
  // FACET 1: Monotonic Sequence Boundary
  // ===========================================================================

  it('[TC-IMP48.01/MSS][Facet1-Boundary] Nhận diceSeq = 1 đầu tiên khi lastDiceSeq = undefined kích hoạt gieo xúc xắc', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      dice: [3, 4],
      diceSeq: 1,
      currentTurnPlayerId: 'p1',
    };

    applyDeltaToStore(delta);

    expect(useGameStore.getState().isRolling).toBe(true);
    expect(useGameStore.getState().dice).toEqual([3, 4]);
    expect(useGameStore.getState().lastDiceSeq).toBe(1);
  });

  it('[TC-IMP48.02/MSS][Facet1-Boundary] Nhận lại diceSeq = 1 khi lastDiceSeq = 1 không kích hoạt lại gieo xúc xắc', () => {
    useGameStore.setState({
      dice: [3, 4],
      isRolling: false,
      hasRolledThisTurn: true,
      lastDiceSeq: 1,
    });

    const delta: DeltaPayload = {
      tick: 2,
      cells: [{ index: 3, ownerId: 'p1', level: 0 }],
      dice: [3, 4],
      diceSeq: 1,
      currentTurnPlayerId: 'p1',
    };

    applyDeltaToStore(delta);

    expect(useGameStore.getState().isRolling).toBe(false);
    expect(useGameStore.getState().lastDiceSeq).toBe(1);
  });

  it('[TC-IMP48.03/MSS][Facet1-Boundary] Nhận diceSeq = 2 lớn hơn lastDiceSeq = 1 kích hoạt lượt gieo xúc xắc mới', () => {
    useGameStore.setState({
      dice: [3, 4],
      isRolling: false,
      hasRolledThisTurn: true,
      lastDiceSeq: 1,
    });

    const delta: DeltaPayload = {
      tick: 3,
      cells: [],
      dice: [5, 6],
      diceSeq: 2,
      currentTurnPlayerId: 'p1',
    };

    applyDeltaToStore(delta);

    expect(useGameStore.getState().isRolling).toBe(true);
    expect(useGameStore.getState().dice).toEqual([5, 6]);
    expect(useGameStore.getState().lastDiceSeq).toBe(2);
  });

  it('[TC-IMP48.04/MSS][Facet1-Boundary] Nhận diceSeq = 1 đến trễ khi lastDiceSeq = 2 bị từ chối kích hoạt', () => {
    useGameStore.setState({
      dice: [5, 6],
      isRolling: false,
      hasRolledThisTurn: true,
      lastDiceSeq: 2,
    });

    const staleDelta: DeltaPayload = {
      tick: 4,
      cells: [],
      dice: [3, 4],
      diceSeq: 1,
      currentTurnPlayerId: 'p1',
    };

    applyDeltaToStore(staleDelta);

    expect(useGameStore.getState().isRolling).toBe(false);
    expect(useGameStore.getState().dice).toEqual([5, 6]);
    expect(useGameStore.getState().lastDiceSeq).toBe(2);
  });

  it('[TC-IMP48.05/MSS][Facet1-Boundary] Khởi tạo diceSeq = 0 được chấp nhận và lưu trữ chính xác', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      dice: [2, 3],
      diceSeq: 0,
      currentTurnPlayerId: 'p1',
    };

    applyDeltaToStore(delta);

    expect(useGameStore.getState().lastDiceSeq).toBe(0);
    expect(useGameStore.getState().isRolling).toBe(true);
  });

  // ===========================================================================
  // FACET 2: State Reactivity & Camera Invariant
  // ===========================================================================

  it('[TC-IMP48.06/MSS][Facet2-Reactivity] Gói tin Delta Mua Đất với cùng diceSeq giữ nguyên isRolling = false', () => {
    useGameStore.setState({
      dice: [4, 2],
      isRolling: false,
      hasRolledThisTurn: true,
      lastDiceSeq: 5,
      currentTurnPlayerId: 'p1',
    });

    const buyPropertyDelta: DeltaPayload = {
      tick: 10,
      cells: [{ index: 3, ownerId: 'p1', level: 0 }],
      players: [{ id: 'p1', balance: 13500, position: 3 }],
      dice: [4, 2],
      diceSeq: 5,
      currentTurnPlayerId: 'p1',
    };

    applyDeltaToStore(buyPropertyDelta);

    expect(useGameStore.getState().isRolling).toBe(false);
  });

  it('[TC-IMP48.07/MSS][Facet2-Reactivity] Gói tin Delta Mua Đất bảo toàn góc nhìn Camera tile_focus không bị giật về overview', () => {
    useGameStore.setState({
      dice: [4, 2],
      isRolling: false,
      hasRolledThisTurn: true,
      lastDiceSeq: 5,
      currentTurnPlayerId: 'p1',
    });

    const buyPropertyDelta: DeltaPayload = {
      tick: 10,
      cells: [{ index: 3, ownerId: 'p1', level: 0 }],
      dice: [4, 2],
      diceSeq: 5,
      currentTurnPlayerId: 'p1',
    };

    applyDeltaToStore(buyPropertyDelta);

    const storeState = useGameStore.getState();
    const cameraMode = resolveCameraMode({
      isRolling: storeState.isRolling,
      isPawnAnimating: false,
      activeModal: null,
      hasRolledThisTurn: storeState.hasRolledThisTurn,
      hasTargetTile: true,
    });

    expect(cameraMode).toBe('tile_focus');
  });

  it('[TC-IMP48.08/MSS][Facet2-Reactivity] Gói tin Delta Nâng Cấp Công Trình C1 giữ nguyên isRolling = false', () => {
    useGameStore.setState({
      dice: [1, 2],
      isRolling: false,
      hasRolledThisTurn: true,
      lastDiceSeq: 7,
    });

    const upgradeDelta: DeltaPayload = {
      tick: 15,
      cells: [{ index: 3, level: 1 }],
      dice: [1, 2],
      diceSeq: 7,
      currentTurnPlayerId: 'p1',
    };

    applyDeltaToStore(upgradeDelta);

    expect(useGameStore.getState().isRolling).toBe(false);
  });

  it('[TC-IMP48.09/MSS][Facet2-Reactivity] Gói tin Delta Thế Chấp BĐS giữ nguyên isRolling = false', () => {
    useGameStore.setState({
      dice: [3, 3],
      isRolling: false,
      hasRolledThisTurn: true,
      lastDiceSeq: 8,
    });

    const mortgageDelta: DeltaPayload = {
      tick: 20,
      cells: [{ index: 3, isMortgaged: true }],
      dice: [3, 3],
      diceSeq: 8,
      currentTurnPlayerId: 'p1',
    };

    applyDeltaToStore(mortgageDelta);

    expect(useGameStore.getState().isRolling).toBe(false);
  });

  it('[TC-IMP48.10/MSS][Facet2-Reactivity] Gói tin tung xúc xắc lượt kế tiếp với diceSeq mới chuyển isRolling = true', () => {
    useGameStore.setState({
      dice: [3, 3],
      isRolling: false,
      hasRolledThisTurn: false,
      lastDiceSeq: 8,
    });

    const nextRollDelta: DeltaPayload = {
      tick: 25,
      cells: [],
      dice: [6, 1],
      diceSeq: 9,
      currentTurnPlayerId: 'p1',
    };

    applyDeltaToStore(nextRollDelta);

    expect(useGameStore.getState().isRolling).toBe(true);
    expect(useGameStore.getState().lastDiceSeq).toBe(9);
  });

  // ===========================================================================
  // FACET 3: Error Defense & Fallback
  // ===========================================================================

  it('[TC-IMP48.11/MSS][Facet3-Defense] delta.dice = [0, 0] không kích hoạt triggerDiceRoll', () => {
    useGameStore.setState({
      dice: [2, 4],
      isRolling: false,
      lastDiceSeq: 10,
    });

    const zeroDiceDelta: DeltaPayload = {
      tick: 30,
      cells: [],
      dice: [0, 0],
      diceSeq: 11,
    };

    applyDeltaToStore(zeroDiceDelta);

    expect(useGameStore.getState().isRolling).toBe(false);
    expect(useGameStore.getState().dice).toEqual([2, 4]);
  });

  it('[TC-IMP48.12/MSS][Facet3-Defense] delta.dice = undefined an toàn bỏ qua không ném ngoại lệ', () => {
    useGameStore.setState({
      dice: [5, 5],
      isRolling: false,
      lastDiceSeq: 12,
    });

    const noDiceDelta: DeltaPayload = {
      tick: 35,
      cells: [],
    };

    expect(() => applyDeltaToStore(noDiceDelta)).not.toThrow();
    expect(useGameStore.getState().isRolling).toBe(false);
    expect(useGameStore.getState().lastDiceSeq).toBe(12);
  });

  it('[TC-IMP48.13/MSS][Facet3-Defense] Fallback khi diceSeq = undefined: cùng xúc xắc trong lượt không kích hoạt lại', () => {
    useGameStore.setState({
      dice: [4, 4],
      isRolling: false,
      hasRolledThisTurn: true,
      lastDiceSeq: undefined,
    });

    const fallbackDelta: DeltaPayload = {
      tick: 40,
      cells: [{ index: 1, ownerId: 'p1' }],
      dice: [4, 4],
      turnPhase: 'ActionPhase' as any,
    };

    applyDeltaToStore(fallbackDelta);

    expect(useGameStore.getState().isRolling).toBe(false);
  });

  it('[TC-IMP48.14/MSS][Facet3-Defense] Fallback khi diceSeq = undefined: đổi giá trị xúc xắc kích hoạt gieo xúc xắc', () => {
    useGameStore.setState({
      dice: [1, 2],
      isRolling: false,
      hasRolledThisTurn: false,
      lastDiceSeq: undefined,
    });

    const fallbackNewDiceDelta: DeltaPayload = {
      tick: 45,
      cells: [],
      dice: [3, 5],
    };

    applyDeltaToStore(fallbackNewDiceDelta);

    expect(useGameStore.getState().isRolling).toBe(true);
    expect(useGameStore.getState().dice).toEqual([3, 5]);
  });

  // ===========================================================================
  // FACET 4: Resource Disposal & Match Reset
  // ===========================================================================

  it('[TC-IMP48.15/MSS][Facet4-Disposal] setLastDiceSeq cập nhật độc lập trạng thái chuỗi xúc xắc', () => {
    useGameStore.getState().setLastDiceSeq(99);
    expect(useGameStore.getState().lastDiceSeq).toBe(99);

    useGameStore.getState().setLastDiceSeq(undefined as any);
    expect(useGameStore.getState().lastDiceSeq).toBeUndefined();
  });

  it('[TC-IMP48.16/MSS][Facet4-Disposal] Full Sync đồng bộ chuỗi xúc xắc mới nhất', () => {
    const cells40 = Array.from({ length: 40 }, (_, idx) => ({ index: idx }));
    const fullSyncDelta: DeltaPayload = {
      tick: 50,
      cells: cells40,
      dice: [6, 6],
      diceSeq: 100,
      currentTurnPlayerId: 'p1',
    };

    applyDeltaToStore(fullSyncDelta);

    expect(useGameStore.getState().lastDiceSeq).toBe(100);
    expect(useGameStore.getState().dice).toEqual([6, 6]);
  });
});
