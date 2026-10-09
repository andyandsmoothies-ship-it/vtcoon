// [IMP-306] Living Contract Tests: Game Store Pawn Actions
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../src/client/store/game_store.js';
import { createPawnActions } from '../../src/client/store/game_store_pawn_actions.js';

describe('Station 1 Contract Tests: GameStorePawnActions', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
  });

  it('TC-GSPA.01 [UC-GSPA/MSS] setDice clamps values to [1, 6] range', () => {
    const store = useGameStore.getState();
    store.setDice([0, 9]);
    expect(useGameStore.getState().dice[0]).toBe(1);
    expect(useGameStore.getState().dice[1]).toBe(6);
  });

  it('TC-GSPA.02 [UC-GSPA/MSS] triggerDiceRoll activates rolling state and updates dice', () => {
    const store = useGameStore.getState();
    store.triggerDiceRoll([3, 4], 10);
    expect(useGameStore.getState().isRolling).toBe(true);
    expect(useGameStore.getState().hasRolledThisTurn).toBe(true);
    expect(useGameStore.getState().lastDiceSeq).toBe(10);
  });

  it('TC-GSPA.03 [UC-GSPA/MSS] triggerDiceRoll rejects obsolete diceSeq', () => {
    const store = useGameStore.getState();
    store.triggerDiceRoll([5, 5], 20);
    store.triggerDiceRoll([1, 1], 15);
    expect(useGameStore.getState().lastDiceSeq).toBe(20);
    expect(useGameStore.getState().dice[0]).toBe(5);
  });

  it('TC-GSPA.04 [UC-GSPA/MSS] startPawnMove ignores invalid target cells', () => {
    const store = useGameStore.getState();
    store.startPawnMove('p1', -5, 0);
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
    store.startPawnMove('p1', 100, 0);
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
  });

  it('TC-GSPA.05 [UC-GSPA/MSS] startPawnMove ignores move when fromCell equals targetCell', () => {
    const store = useGameStore.getState();
    store.startPawnMove('p1', 5, 5);
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
  });

  it('TC-GSPA.06 [UC-GSPA/MSS] canonical sequence: triggerDiceRoll -> startPawnMove sets animation', () => {
    const store = useGameStore.getState();
    store.triggerDiceRoll([2, 3], 1);
    store.setIsRolling(false);
    store.startPawnMove('p1', 5, 0);
    const anim = useGameStore.getState().activePawnAnimation;
    expect(anim?.playerId).toBe('p1');
    expect(anim?.isAnimating).toBe(true);
    expect(anim?.waypoints.length).toBe(5);
  });

  it('TC-GSPA.07 [UC-GSPA/MSS] completePawnMove lands pawn on target cell and records lastLandedPawn', () => {
    const store = useGameStore.getState();
    store.startPawnMove('p1', 5, 0);
    store.completePawnMove('p1');
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
    expect(useGameStore.getState().playerPositions['p1']).toBe(5);
    expect(useGameStore.getState().visualPositions['p1']).toBe(5);
    expect(useGameStore.getState().lastLandedPawn?.cellIndex).toBe(5);
  });

  it('TC-GSPA.08 [UC-GSPA/MSS] clearActivePawnAnimation flushes queue and resets visual positions', () => {
    const store = useGameStore.getState();
    store.setPlayerPositions({ p1: 10 });
    store.startPawnMove('p1', 15, 10);
    store.clearActivePawnAnimation();
    expect(useGameStore.getState().activePawnAnimation).toBeNull();
    expect(useGameStore.getState().pawnAnimationQueue?.length ?? 0).toBe(0);
    expect(useGameStore.getState().visualPositions['p1']).toBe(10);
  });

  it('TC-GSPA.09 [UC-GSPA/MSS] enqueuePawnMove queues moves when an animation is already active', () => {
    const store = useGameStore.getState();
    store.startPawnMove('p1', 4, 0);
    store.enqueuePawnMove({
      playerId: 'p2',
      fromCell: 0,
      targetCell: 3,
      waypoints: [1, 2, 3],
    });
    expect(useGameStore.getState().pawnAnimationQueue?.length).toBe(1);
    expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('p1');
  });

  it('TC-GSPA.10 [UC-GSPA/MSS] setPendingPawnMove is triggered when rolling ends', () => {
    const store = useGameStore.getState();
    store.setIsRolling(true);
    store.setPendingPawnMove({
      playerId: 'p1',
      fromCell: 0,
      targetCell: 6,
    });
    store.setIsRolling(false);
    expect(useGameStore.getState().pendingPawnMove).toBeNull();
    expect(useGameStore.getState().activePawnAnimation?.playerId).toBe('p1');
  });

  it('TC-GSPA.11 [UC-GSPA/MSS] startPawnMove handles jail flight as direct waypoint', () => {
    const store = useGameStore.getState();
    store.startPawnMove('p1', 10, 0, false, true);
    const anim = useGameStore.getState().activePawnAnimation;
    expect(anim?.isJailFlight).toBe(true);
    expect(anim?.waypoints).toEqual([10]);
  });

  it('TC-GSPA.12 [UC-GSPA/MSS] createPawnActions creates actions map directly', () => {
    const actions = createPawnActions(
      useGameStore.setState,
      useGameStore.getState,
    );
    expect(typeof actions.startPawnMove).toBe('function');
    expect(typeof actions.triggerDiceRoll).toBe('function');
  });
});
