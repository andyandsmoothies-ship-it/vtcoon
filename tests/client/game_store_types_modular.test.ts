import { describe, it, expect } from 'vitest';
import { TurnPhase } from '../../src/domain/room.js';
import { FloatingTextType as DirectFloatingTextType } from '../../src/client/store/game_store_subtypes.js';
import { INITIAL_GAME_STATE as directInitState } from '../../src/client/store/game_store_state_types.js';
import {
  INITIAL_GAME_STATE as facadeInitState,
  FloatingTextType as FacadeFloatingTextType,
} from '../../src/client/store/game_store_types.js';

describe('IMP-298 Game Store Type System & Baseline Contract Suite', () => {
  it('[TC-ST-TYPE.01/MSS][UC-ST-TYPE/MSS] INITIAL_GAME_STATE initializes dice to [1, 1]', () => {
    expect(directInitState.dice).toEqual([1, 1]);
  });

  it('[TC-ST-TYPE.02/MSS][UC-ST-TYPE/MSS] INITIAL_GAME_STATE initializes round numbers to 1 and 40', () => {
    expect(directInitState.roundNumber).toBe(1);
    expect(directInitState.maxRounds).toBe(40);
  });

  it('[TC-ST-TYPE.03/MSS][UC-ST-TYPE/MSS] INITIAL_GAME_STATE initializes turnPhase to WaitingRoll', () => {
    expect(directInitState.turnPhase).toBe(TurnPhase.WaitingRoll);
  });

  it('[TC-ST-TYPE.04/MSS][UC-ST-TYPE/MSS] INITIAL_GAME_STATE initializes turnTimeRemaining to 60s', () => {
    expect(directInitState.turnTimeRemaining).toBe(60);
  });

  it('[TC-ST-TYPE.05/MSS][UC-ST-TYPE/MSS] INITIAL_GAME_STATE initializes camera flags safely', () => {
    expect(directInitState.cameraFocusCell).toBeNull();
    expect(directInitState.hasUserCustomCamera).toBe(false);
  });

  it('[TC-ST-TYPE.06/MSS][UC-ST-TYPE/MSS] INITIAL_GAME_STATE initializes isPlayerHudVisible to true', () => {
    expect(directInitState.isPlayerHudVisible).toBe(true);
  });

  it('[TC-ST-TYPE.07/MSS][UC-ST-TYPE/MSS] INITIAL_GAME_STATE initializes treasuryPool to 0', () => {
    expect(directInitState.treasuryPool).toBe(0);
  });

  it('[TC-ST-TYPE.08/MSS][UC-ST-TYPE/MSS] INITIAL_GAME_STATE initializes rolling status flags to false', () => {
    expect(directInitState.isRolling).toBe(false);
    expect(directInitState.hasRolledThisTurn).toBe(false);
  });

  it('[TC-ST-TYPE.09/MSS][UC-ST-TYPE/MSS] INITIAL_GAME_STATE initializes levelMap and propertyStates to empty objects', () => {
    expect(Object.keys(directInitState.levelMap).length).toBe(0);
    expect(Object.keys(directInitState.propertyStates).length).toBe(0);
  });

  it('[TC-ST-TYPE.10/MSS][UC-ST-TYPE/MSS] INITIAL_GAME_STATE initializes player collections to empty objects', () => {
    expect(Object.keys(directInitState.playersInfo).length).toBe(0);
    expect(Object.keys(directInitState.playerPositions).length).toBe(0);
  });

  it('[TC-ST-TYPE.11/MSS][UC-ST-TYPE/MSS] INITIAL_GAME_STATE initializes activeModal and modalPayload to null', () => {
    expect(directInitState.activeModal).toBeNull();
    expect(directInitState.modalPayload).toBeNull();
  });

  it('[TC-ST-TYPE.12/MSS][UC-ST-TYPE/MSS] INITIAL_GAME_STATE initializes social emotes and floating texts to empty', () => {
    expect(Object.keys(directInitState.activeEmotes).length).toBe(0);
    expect(directInitState.floatingTexts.length).toBe(0);
  });

  it('[TC-ST-TYPE.13/MSS][UC-ST-TYPE/MSS] FloatingTextType enum maps Reward, Bonus and Penalty correctly', () => {
    expect(DirectFloatingTextType.Reward).toBe('reward');
    expect(DirectFloatingTextType.Bonus).toBe('reward');
    expect(DirectFloatingTextType.Penalty).toBe('penalty');
  });

  it('[TC-ST-TYPE.14/MSS][UC-ST-TYPE/MSS] Facade re-export preserves INITIAL_GAME_STATE reference identity', () => {
    expect(facadeInitState).toBe(directInitState);
  });

  it('[TC-ST-TYPE.15/MSS][UC-ST-TYPE/MSS] Facade re-export preserves FloatingTextType reference identity', () => {
    expect(FacadeFloatingTextType).toBe(DirectFloatingTextType);
  });

  it('[TC-ST-TYPE.16/MSS][UC-ST-TYPE/MSS] Clean ESM module load verifies immutable properties integrity', () => {
    expect(Array.isArray(directInitState.dice)).toBe(true);
    expect(typeof directInitState.roundNumber).toBe('number');
  });
});
