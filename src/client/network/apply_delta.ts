// [UC-GAME-009/MSS][TC-NET03.1/MSS][TC-NET03.2/MSS][UC-GAME-008/MSS]
// Đồng bộ hóa DeltaPayload (kể cả Sparse Diff) vào Zustand useGameStore
// [IMP-64] Player & Cell sections extracted to apply_delta_players.ts and apply_delta_cells.ts
import { useGameStore, type GameState } from '../store/game_store.js';
import { useLobbyStore } from '../store/lobby_store.js';
import { BOARD_SIZE, TurnPhase } from '../../domain/room.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import { AudioEngine } from '../audio/audio_engine.js';
import { SoundEffect } from '../audio/audio_types.js';
import { trackDeltaActivities } from './activity_tracker.js';
import { handleDeltaTelemetry } from '../telemetry/telemetry_delta_hook.js';
import { HapticEngine } from '../haptics/haptic_engine.js';

import { applyPlayerDeltas, initPlayersInfoMap } from './apply_delta_players.js';
import { applyCellDeltas } from './apply_delta_cells.js';
export { applyPlayerDeltas, initPlayersInfoMap, applyCellDeltas };

export function isGameRunningDelta(delta: DeltaPayload): boolean {
  if (delta.roomStarted !== undefined) return delta.roomStarted;
  return (
    delta.tick > 0 ||
    Boolean(delta.players?.some((p) => p.position > 0 || p.balance !== 15000)) ||
    Boolean(delta.cells?.some((c) => c.ownerId || (c.level !== undefined && c.level > 0)))
  );
}

function isDiceRollDuplicate(delta: DeltaPayload, state: GameState): boolean {
  if (delta.diceSeq !== undefined) {
    return state.lastDiceSeq !== undefined && delta.diceSeq <= state.lastDiceSeq;
  }
  if (state.hasRolledThisTurn && state.dice[0] === delta.dice?.[0] && state.dice[1] === delta.dice?.[1]) {
    return true;
  }
  return false;
}

function syncDiceRoll(delta: DeltaPayload, state: GameState): void {
  const dice = delta.dice;
  if (!dice || (dice[0] === 0 && dice[1] === 0)) return;
  if (isDiceRollDuplicate(delta, state)) return;

  state.triggerDiceRoll([dice[0], dice[1]], delta.diceSeq);
  try { AudioEngine.playSfx(SoundEffect.DICE_ROLL); } catch (err) { console.warn('[applyDelta] AudioEngine.playSfx error:', err); }
}

function resolveTurnPlayerId(delta: DeltaPayload): string | undefined {
  if (delta.currentTurnPlayerId) return delta.currentTurnPlayerId;
  return delta.currentPlayerIndex !== undefined ? delta.players?.[delta.currentPlayerIndex]?.id : undefined;
}

function syncTurnAndTimer(delta: DeltaPayload, state: GameState): void {
  const turnPlayerId = resolveTurnPlayerId(delta);
  if (turnPlayerId && state.currentTurnPlayerId !== turnPlayerId) {
    const myPid = useLobbyStore.getState().myPlayerId;
    const isBankrupt = Boolean(state.playersInfo[myPid]?.bankrupt);
    if (myPid && turnPlayerId === myPid && !isBankrupt) {
      try { HapticEngine.turnAlert(); } catch { /* Haptic trigger safe fallback */ }
    }
    state.setCurrentTurnPlayerId(turnPlayerId);
    state.setTurnTimeRemaining(delta.timeRemaining ?? 60);
    state.setHasRolledThisTurn(false); // [IMP-182] Triệt tiêu Turn N+1 Leak
    state.setHasUserCustomCamera?.(false); // [IMP-190] Reset camera custom orbit on new player turn
  } else if (delta.timeRemaining !== undefined) {
    state.setTurnTimeRemaining(delta.timeRemaining);
  }
  if (delta.turnPhase !== undefined) {
    state.setTurnPhase(delta.turnPhase);
    if (delta.turnPhase === TurnPhase.WaitingRoll) {
      state.setHasRolledThisTurn(false);
    }
  }
}

function syncTreasuryPool(delta: DeltaPayload, state: GameState): void {
  if (delta.treasury !== undefined) {
    state.setTreasuryPool(delta.treasury);
  }
}

function syncRoundAndModifiers(delta: DeltaPayload, state: GameState): void {
  if (delta.roundNumber !== undefined) {
    state.setRoundNumber(delta.roundNumber);
  }
  if (delta.activeModifiers !== undefined) {
    state.setActiveModifiers(delta.activeModifiers);
  }
}

import type { ModalPayloadMap } from '../store/game_store_types.js';

let lastDismissedAuctionKey: string | null = null;

function syncBusinessModals(delta: DeltaPayload, state: GameState): void {
  // [IMP-50] Trụ Cột 3: UI as Pure Projection — Modal chỉ đóng khi server phát delta.auction === null hoặc phase thay đổi
  if (delta.auction) {
    const isConcluded = Boolean(delta.auction.isConcluded);
    const auctionKey = `${delta.auction.cellIndex}:${delta.auction.winnerId}:${delta.auction.finalPrice ?? delta.auction.currentBid}`;
    const isWaitingOrAction = delta.turnPhase === TurnPhase.WaitingRoll || delta.turnPhase === TurnPhase.ActionPhase;

    if (isConcluded && isWaitingOrAction) {
      // KHÔNG mở lại modal state.openModal('auction')
    } else if (isConcluded && lastDismissedAuctionKey === auctionKey && state.activeModal !== 'auction') {
      // KHÔNG mở lại modal
    } else {
      if (isConcluded) {
        lastDismissedAuctionKey = auctionKey;
      } else {
        lastDismissedAuctionKey = null;
      }
      const myPid = useLobbyStore.getState().myPlayerId;
      const prevPayload = state.activeModal === 'auction' ? state.modalPayload as { hasPassed?: boolean } | null : null;
      const hasPassed = Boolean(
        prevPayload?.hasPassed ||
        (myPid && delta.auction.passedPlayerIds?.includes(myPid))
      );
      state.openModal('auction', {
        ...delta.auction,
        ...(hasPassed ? { hasPassed: true } : {}),
      });
    }
  } else if (delta.auction === null) {
    lastDismissedAuctionKey = null;
    if (state.activeModal === 'auction') {
      state.closeModal();
    }
  } else if (
    delta.turnPhase !== undefined &&
    delta.turnPhase !== TurnPhase.AuctionPhase &&
    state.activeModal === 'auction'
  ) {
    const currentPayload = state.modalPayload as { isConcluded?: boolean } | null;
    if (!currentPayload?.isConcluded) {
      state.closeModal();
    }
  }

  // [IMP-142] Bot Trade Offer Modal — mở khi offer gửi cho mình, đóng khi offer là null
  if (delta.pendingTradeOffer) {
    const myPid = useLobbyStore.getState().myPlayerId;
    if (delta.pendingTradeOffer.sellerId === myPid) {
      state.openModal('bot_trade_offer', delta.pendingTradeOffer);
    }
  } else if (delta.pendingTradeOffer === null && state.activeModal === 'bot_trade_offer') {
    state.closeModal();
  }

  // [IMP-145] Compulsory Buyout Modal — mở khi người chơi là bên mua (buyerId), đóng khi pendingBuyout là null
  if (delta.pendingBuyout !== undefined) {
    state.setPendingBuyout(delta.pendingBuyout);
    if (delta.pendingBuyout) {
      const myPid = useLobbyStore.getState().myPlayerId;
      if (delta.pendingBuyout.buyerId === myPid) {
        state.openModal('compulsory_buyout', delta.pendingBuyout);
      }
    } else if (delta.pendingBuyout === null && state.activeModal === 'compulsory_buyout') {
      state.closeModal();
    }
  }

  if (delta.lastHoseResult === null && state.activeModal === 'hose') {
    state.closeModal();
  } else if (delta.lastHoseResult && state.activeModal === 'hose') {
    const hr = delta.lastHoseResult;
    const myPid = useLobbyStore.getState().myPlayerId;
    const isTarget = !myPid || hr.playerId === myPid || hr.playerId === state.currentTurnPlayerId;
    if (isTarget) {
      state.updateModalPayload<'hose'>({
        lastDiceRoll: hr.roll,
        lastPayout: hr.payout,
        lastMultiplier: hr.multiplier,
        lastProfit: hr.profit,
        currentStake: hr.stake,
        isReviewingResult: true,
      });
    }
  }

  if (delta.turnPhase !== undefined) {
    if (
      state.activeModal === 'deed' &&
      delta.turnPhase !== TurnPhase.ActionPhase &&
      delta.turnPhase !== TurnPhase.PropertyManagement
    ) {
      state.closeModal();
    } else if (state.activeModal === 'insolvency' && delta.turnPhase !== TurnPhase.InsolvencyPhase) {
      state.closeModal();
    } else if (
      state.activeModal === 'hose' &&
      delta.turnPhase !== TurnPhase.HosePhase &&
      !(state.modalPayload as ModalPayloadMap['hose'])?.isReviewingResult
    ) {
      state.closeModal();
    }
  }
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
    trackDeltaActivities(delta, state, store.getState());
    handleDeltaTelemetry(delta, state, store.getState());
  } catch {
    // safe fallback: Telemetry and activity tracking must never break game store state
  }
}

function syncEventCard(card: DeltaPayload['lastEventCard'], state: GameState): void {
  if (card !== undefined) {
    state.setLastEventCard(card ?? null);
  }
}

export function applyPhaseAndTimerDeltas(delta: DeltaPayload, prevState: GameState, store: typeof useGameStore): void {
  const currentState = store.getState();
  syncTurnAndTimer(delta, currentState);
  syncTreasuryPool(delta, currentState);
  syncRoundAndModifiers(delta, currentState);
  syncBusinessModals(delta, currentState);
  syncEventCard(delta.lastEventCard, currentState);
  syncGameStarted(delta, currentState);
  syncTelemetryAndActivities(delta, prevState, store);
}

export function applyDeltaToStore(delta: DeltaPayload, store: typeof useGameStore = useGameStore): void {
  const state = store.getState();
  const isFullSync = Boolean(delta.cells && delta.cells.length === BOARD_SIZE);
  if (isFullSync) {
    state.clearActivePawnAnimation();
    state.setIsRolling(false);
    if (delta.diceSeq !== undefined) state.setLastDiceSeq(delta.diceSeq);
    if (delta.dice && delta.dice[0] > 0 && delta.dice[1] > 0) {
      state.setDice([delta.dice[0], delta.dice[1]]);
    }
    state.setHasRolledThisTurn(false);
  } else {
    // [IMP-112] Đồng bộ xúc xắc TRƯỚC KHI xử lý di chuyển quân cờ.
    // Nếu delta mang kết quả xúc xắc mới, triggerDiceRoll sẽ kích hoạt isRolling: true.
    // Nhờ đó applyPlayerDeltas sẽ đưa bước di chuyển vào pendingPawnMove thay vì chạy trước xúc xắc.
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
