// [UC-GAME-009/MSS][TC-NET03.1/MSS][TC-NET03.2/MSS][UC-GAME-008/MSS]
// Đồng bộ hóa DeltaPayload (kể cả Sparse Diff) vào Zustand useGameStore
// [IMP-64] Player & Cell sections extracted to apply_delta_players.ts and apply_delta_cells.ts
import { useGameStore, type GameState, FloatingTextType } from '../store/game_store.js';
import { useActivityStore } from '../store/activity_store.js';
import { useLobbyStore } from '../store/lobby_store.js';
import { BOARD_SIZE, TurnPhase } from '../../domain/room.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import { AudioEngine } from '../audio/audio_engine.js';
import { SoundEffect } from '../audio/audio_types.js';
import { trackDeltaActivities } from './activity_tracker.js';
import { handleDeltaTelemetry } from '../telemetry/telemetry_delta_hook.js';
import { HapticEngine } from '../haptics/haptic_engine.js';
import { purgeClientMatchSession } from './client_session_purger.js';
import { synthesizeGameEvents } from '../events/game_event_synthesizer.js';
import { dispatchGameEvents, ensureDefaultSubscribers } from '../events/game_event_bus.js';

import { applyPlayerDeltas, initPlayersInfoMap } from './apply_delta_players.js';
import { applyCellDeltas } from './apply_delta_cells.js';
export { applyPlayerDeltas, initPlayersInfoMap, applyCellDeltas };

import {
  consumeStagedTransitWheel,
  resetStagedTransitWheel,
  syncBusinessModals,
} from './apply_delta_modals.js';
export {
  consumeStagedTransitWheel,
  resetStagedTransitWheel,
  syncBusinessModals,
};

export function isGameRunningDelta(delta: DeltaPayload): boolean {
  if (delta.roomStarted !== undefined) return delta.roomStarted;
  return (
    delta.tick > 0 ||
    Boolean(delta.players?.some((p) => p.position > 0 || p.balance !== 15000)) ||
    Boolean(delta.cells?.some((c) => c.ownerId || (c.level !== undefined && c.level > 0)))
  );
}

function isDiceRollDuplicate(delta: DeltaPayload, state: GameState): boolean {
  if (delta.diceSeq !== undefined) return state.lastDiceSeq !== undefined && delta.diceSeq <= state.lastDiceSeq;
  return Boolean(state.hasRolledThisTurn && state.dice[0] === delta.dice?.[0] && state.dice[1] === delta.dice?.[1]);
}

function syncDiceRoll(delta: DeltaPayload, state: GameState): void {
  const dice = delta.dice;
  if (!dice || (dice[0] === 0 && dice[1] === 0) || isDiceRollDuplicate(delta, state)) return;

  state.triggerDiceRoll([dice[0], dice[1]], delta.diceSeq);
  try { AudioEngine.playSfx(SoundEffect.DICE_ROLL); } catch (err) { console.warn('[applyDelta] AudioEngine.playSfx error:', err); }
}

function resolveTurnPlayerId(delta: DeltaPayload, state?: GameState): string | undefined {
  if (delta.currentTurnPlayerId) return delta.currentTurnPlayerId;
  if (delta.currentPlayerIndex !== undefined) {
    const playerAtIndex = delta.players?.[delta.currentPlayerIndex];
    if (playerAtIndex?.id) return playerAtIndex.id;
    if (state?.playersInfo) {
      const fallbackId = Object.keys(state.playersInfo)[delta.currentPlayerIndex];
      if (fallbackId) return fallbackId;
    }
  }
  return undefined;
}

function syncTurnAndTimer(delta: DeltaPayload, state: GameState): void {
  const turnPlayerId = resolveTurnPlayerId(delta, state);
  if (turnPlayerId && state.currentTurnPlayerId !== turnPlayerId) {
    const myPid = useLobbyStore.getState().myPlayerId;
    const isBankrupt = Boolean(state.playersInfo[myPid]?.bankrupt);
    if (myPid && turnPlayerId === myPid && !isBankrupt) {
      try { HapticEngine.turnAlert(); } catch { /* Haptic trigger safe fallback */ }
    }
    state.setCurrentTurnPlayerId(turnPlayerId);
    state.setTurnTimeRemaining(delta.timeRemaining && delta.timeRemaining > 0 ? delta.timeRemaining : 60);
    state.setHasRolledThisTurn(false); // [IMP-182] Triệt tiêu Turn N+1 Leak
    state.setHasUserCustomCamera?.(false); // [IMP-190] Reset camera custom orbit on new player turn
    if (state.activeModal === 'transit_wheel') {
      state.setPendingPawnMove?.(null);
      state.closeModal();
    }
  } else if (delta.timeRemaining !== undefined) {
    const isPhaseChange = delta.turnPhase !== undefined && delta.turnPhase !== state.turnPhase;
    const isNewDiceRoll = delta.diceSeq !== undefined && delta.diceSeq !== state.lastDiceSeq;
    const isTurnReset = isPhaseChange || isNewDiceRoll;

    // [IMP-207] Monotonic countdown guard: chong hien tuong rung giat (41s -> 42s -> 41s)
    // Bao toan 100% reset 60s khi do Doi (Doubles) hoac chuyen Phase
    if (
      delta.timeRemaining > 0 &&
      (isTurnReset ||
        delta.timeRemaining <= state.turnTimeRemaining ||
        delta.timeRemaining - state.turnTimeRemaining > 2)
    ) {
      state.setTurnTimeRemaining(delta.timeRemaining);
    }
  }
  if (delta.turnPhase !== undefined) {
    state.setTurnPhase(delta.turnPhase);
    if (delta.turnPhase === TurnPhase.WaitingRoll) {
      state.setHasRolledThisTurn(false);
    }
    const effectiveTurnPlayerId = turnPlayerId || state.currentTurnPlayerId;
    if (
      (delta.turnPhase === TurnPhase.ActionPhase || delta.turnPhase === TurnPhase.PropertyManagement) &&
      effectiveTurnPlayerId &&
      effectiveTurnPlayerId === (useLobbyStore.getState().myPlayerId || 'p1') &&
      (delta.diceRollerId === effectiveTurnPlayerId || (delta.dice && (delta.dice[0] > 0 || delta.dice[1] > 0)))
    ) {
      state.setHasRolledThisTurn(true);
    }
  }
}

function syncTreasuryPool(delta: DeltaPayload, state: GameState): void {
  if (delta.treasury !== undefined) state.setTreasuryPool(delta.treasury);
}

function syncRoundAndModifiers(delta: DeltaPayload, state: GameState): void {
  if (delta.roundNumber !== undefined) state.setRoundNumber(delta.roundNumber);
  if (delta.activeModifiers !== undefined) state.setActiveModifiers(delta.activeModifiers);
}


function syncGameStarted(delta: DeltaPayload, state: GameState): void {
  if (delta.roomStarted !== undefined) {
    try {
      useLobbyStore.getState().setGameStarted(delta.roomStarted);
      if (!delta.roomStarted) {
        state.resetGameState?.();
        useLobbyStore.getState().resetBotSlots?.();
      }
    } catch (err) {
      console.warn('[applyDelta] setGameStarted error:', err);
    }
    return;
  }
  if (!isGameRunningDelta(delta)) return;
  try { useLobbyStore.getState().setGameStarted(true); } catch (err) { console.warn('[applyDelta] setGameStarted error:', err); }
}

function syncTelemetryAndActivities(delta: DeltaPayload, state: GameState, store: typeof useGameStore): void {
  try {
    ensureDefaultSubscribers();
    const isFullSync = Boolean(delta.cells && delta.cells.length === BOARD_SIZE);
    const nextState = store.getState();
    if (!isFullSync) {
      const events = synthesizeGameEvents(state, nextState, delta);
      if (events.length > 0) {
        dispatchGameEvents(events, {
          prevState: state,
          nextState,
          delta,
        });
      }
    }
    trackDeltaActivities(delta, state, nextState, useActivityStore, { suppressFinancialAndProperty: true });
    handleDeltaTelemetry(delta, state, nextState);
  } catch {
    // safe fallback: Telemetry and activity tracking must never break game store state
  }
}


export const BOARD_WIDE_CARDS: ReadonlySet<string> = new Set([
  'MC_MEGA_CONCERT', 'MC_FIRE_INSPECTION', 'MC_RATE_HIKE',
  'MC_FREEZE_TRADE', 'MC_ANTI_SPECULATE', 'MC_FUEL_SURGE',
  'MC_CREDIT_STIMULUS', 'MC_PUBLIC_INVEST', 'MC_COASTAL_STORM',
  'MC_PEAK_TOURISM', 'MC_CASINO_PILOT', 'MC_NIGHT_ECONOMY',
  'MC_ALCOHOL_CHECK', 'MC_LAND_FEVER', 'MC_URBAN_PLANNING',
  'MC_UTILITY_DOUBLE',
  'CC_FRANCHISE', 'CC_CONTRACT_PENALTY', 'CC_PORT_EXCLUSIVE',
  'CC_MA_FORCE', 'CC_SWAP_PROJECT',
]);

export function isBoardWideCard(cardId?: string): boolean {
  return Boolean(cardId && BOARD_WIDE_CARDS.has(cardId));
}

export function syncEventCard(
  cardOrDelta: DeltaPayload['lastEventCard'] | DeltaPayload,
  state: GameState,
  deltaPayload?: DeltaPayload
): void {
  const isDelta = Boolean(cardOrDelta && typeof cardOrDelta === 'object' && 'roomCode' in cardOrDelta);
  const delta = isDelta ? (cardOrDelta as DeltaPayload) : deltaPayload;
  const card = isDelta ? (cardOrDelta as DeltaPayload).lastEventCard : (cardOrDelta as DeltaPayload['lastEventCard']);
  const prevCard = state.lastEventCard;
  if (card !== undefined) state.setLastEventCard(card ?? null);

  if (card && card.cardId && card.cardId !== prevCard?.cardId) {
    const myPid = useLobbyStore.getState().myPlayerId || 'p1';
    const turnPlayerId = card.drawnBy ?? card.playerId ?? delta?.currentTurnPlayerId ?? delta?.diceRollerId ?? state.currentTurnPlayerId ?? myPid;
    const isBoardWide = isBoardWideCard(card.cardId);
    if (isBoardWide || turnPlayerId !== myPid) {
      state.addFloatingText({
        actionType: card.cardType ?? 'chance',
        playerId: turnPlayerId,
        title: card.title,
        text: card.effectDetail || card.description || '',
        type: (card.effectDelta ?? 0) >= 0 ? FloatingTextType.Bonus : FloatingTextType.Penalty,
        durationMs: isBoardWide ? 5000 : 2500,
        isBoardWide,
      });
    }
  }
}

export function applyPhaseAndTimerDeltas(delta: DeltaPayload, prevState: GameState, store: typeof useGameStore): void {
  const currentState = store.getState();
  syncTurnAndTimer(delta, currentState);
  syncTreasuryPool(delta, currentState);
  syncRoundAndModifiers(delta, currentState);
  syncBusinessModals(delta, currentState);
  syncEventCard(delta.lastEventCard, currentState, delta);
  syncGameStarted(delta, currentState);
  syncTelemetryAndActivities(delta, prevState, store);
}

export function applyDeltaToStore(delta: DeltaPayload, store: typeof useGameStore = useGameStore): void {
  if (delta.tick <= 1) resetStagedTransitWheel();
  const state = store.getState();
  const isFullSync = Boolean(delta.cells && delta.cells.length === BOARD_SIZE);
  if (isFullSync) {
    if (delta.tick <= 1) purgeClientMatchSession({ clearGameStore: false });
    state.clearActivePawnAnimation();
    state.setIsRolling(false);
    if (delta.diceSeq !== undefined) state.setLastDiceSeq(delta.diceSeq);
    if (delta.dice && delta.dice[0] > 0 && delta.dice[1] > 0) state.setDice([delta.dice[0], delta.dice[1]]);
    state.setHasRolledThisTurn(false);
    state.setDismissedAuctionCellIndex?.(null);
  } else {
    syncDiceRoll(delta, state);
  }

  const currentState = store.getState();
  const playersInfoMap = initPlayersInfoMap(currentState, isFullSync, delta.players);
  let hasPlayerInfoChange = isFullSync && Object.keys(playersInfoMap).length > 0;

  if (applyPlayerDeltas(delta, currentState, playersInfoMap, isFullSync)) hasPlayerInfoChange = true;
  if (applyCellDeltas(delta, currentState, playersInfoMap, isFullSync)) hasPlayerInfoChange = true;

  if (hasPlayerInfoChange) currentState.setPlayersInfo(playersInfoMap);
  applyPhaseAndTimerDeltas(delta, state, store);
}

export { applyDeltaToStore as applyDelta };
