// [UC-GAME-009/MSS][TC-NET03.1/MSS][TC-NET03.2/MSS][UC-GAME-008/MSS]
// Đồng bộ hóa DeltaPayload (kể cả Sparse Diff) vào Zustand useGameStore
// [IMP-64] Player & Cell sections extracted to apply_delta_players.ts and apply_delta_cells.ts
import { useGameStore, type GameState, FloatingTextType } from '../store/game_store.js';
import type { ModalPayloadMap } from '../store/game_store_types.js';
import { useLobbyStore } from '../store/lobby_store.js';
import { BOARD_SIZE, TurnPhase } from '../../domain/room.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import { AudioEngine } from '../audio/audio_engine.js';
import { SoundEffect } from '../audio/audio_types.js';
import { trackDeltaActivities } from './activity_tracker.js';
import { handleDeltaTelemetry } from '../telemetry/telemetry_delta_hook.js';
import { HapticEngine } from '../haptics/haptic_engine.js';
import { purgeClientMatchSession } from './client_session_purger.js';

import { applyPlayerDeltas, initPlayersInfoMap } from './apply_delta_players.js';
import { applyCellDeltas } from './apply_delta_cells.js';
export { applyPlayerDeltas, initPlayersInfoMap, applyCellDeltas };

let stagedTransitWheel: { playerId: string; cellIndex: number; timestamp: number } | null = null;

export function consumeStagedTransitWheel(
  targetCellIndex?: number,
  targetPlayerId?: string
): { playerId: string; cellIndex: number; timestamp: number } | null {
  if (!stagedTransitWheel) return null;
  if (targetCellIndex !== undefined && stagedTransitWheel.cellIndex !== targetCellIndex) return null;
  if (targetPlayerId !== undefined && stagedTransitWheel.playerId !== targetPlayerId) return null;
  const staged = stagedTransitWheel;
  stagedTransitWheel = null;
  return staged;
}

export function resetStagedTransitWheel(): void {
  stagedTransitWheel = null;
}

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

function syncAuctionModal(delta: DeltaPayload, state: GameState): void {
  // [IMP-50][IMP-200] Trụ Cột 3: UI as Pure Projection — Đồng bộ auction state & bảo vệ dismiss state (Zustand SSOT)
  if (delta.auction) {
    const isConcluded = Boolean(delta.auction.isConcluded);
    const myPid = useLobbyStore.getState().myPlayerId;
    const prevPayload = state.activeModal === 'auction' ? state.modalPayload as ModalPayloadMap['auction'] | null : null;
    const isSameAuction = prevPayload?.cellIndex === delta.auction.cellIndex && !prevPayload?.isConcluded;
    const hasPassed = Boolean(
      (isSameAuction && prevPayload?.hasPassed) ||
      (myPid && delta.auction.passedPlayerIds?.includes(myPid))
    );

    const deadline = delta.auction.timeRemaining !== undefined
      ? Date.now() + delta.auction.timeRemaining * 1000
      : undefined;

    const auctionData: ModalPayloadMap['auction'] = {
      ...delta.auction,
      ...(deadline !== undefined ? { deadline } : {}),
      ...(hasPassed ? { hasPassed: true } : {}),
    };

    state.setAuction?.(auctionData);

    // Fire Sale Queue Defense: Sang ô đất mới thì tự động reset cờ dismiss của ô cũ
    if (state.dismissedAuctionCellIndex !== null && state.dismissedAuctionCellIndex !== delta.auction.cellIndex) {
      state.setDismissedAuctionCellIndex?.(null);
    }

    const isDismissed = state.dismissedAuctionCellIndex === delta.auction.cellIndex;
    const isWaitingOrAction = delta.turnPhase === TurnPhase.WaitingRoll || delta.turnPhase === TurnPhase.ActionPhase;

    if (isDismissed) {
      if (state.activeModal === 'auction') {
        state.updateModalPayload<'auction'>(auctionData);
      }
    } else if (isConcluded && isWaitingOrAction) {
      // KHÔNG mở lại modal khi lượt chơi đã chuyển sang đổ xúc xắc
    } else {
      state.openModal('auction', auctionData);
    }
  } else if (delta.auction === null) {
    state.setAuction?.(null);
    if (state.activeModal === 'auction') state.closeModal();
    state.setDismissedAuctionCellIndex?.(null);
  } else if (delta.turnPhase !== undefined && delta.turnPhase !== TurnPhase.AuctionPhase) {
    state.setAuction?.(null);
    if (state.activeModal === 'auction') {
      const currentPayload = state.modalPayload as { isConcluded?: boolean } | null;
      if (!currentPayload?.isConcluded) state.closeModal();
    }
    state.setDismissedAuctionCellIndex?.(null);
  }
}

function syncOtherModals(delta: DeltaPayload, state: GameState): void {
  // [IMP-142][IMP-195][IMP-200] Trade Offer — lưu vào store pendingTradeOffer cho InlineBotTradeStrip (chống tự nhận & hỗ trợ targetPlayerId)
  if (delta.pendingTradeOffer !== undefined) {
    const myPid = useLobbyStore.getState().myPlayerId;
    const offer = delta.pendingTradeOffer;
    const isTargetedToMe = Boolean(
      offer && myPid && offer.requesterId !== myPid &&
      (offer.targetPlayerId ? offer.targetPlayerId === myPid : offer.sellerId === myPid)
    );
    state.setPendingTradeOffer(isTargetedToMe ? offer : null);
    if (delta.pendingTradeOffer === null && state.activeModal === 'bot_trade_offer') state.closeModal();
  }

  // [IMP-145][IMP-229] Compulsory Buyout Modal — Lưu store, chỉ mở ngay trên FullSync/Reconnect nếu không có hoạt cảnh
  if (delta.pendingBuyout !== undefined) {
    state.setPendingBuyout(delta.pendingBuyout);
    if (delta.pendingBuyout) {
      const myPid = useLobbyStore.getState().myPlayerId;
      const isCardFlow = Boolean(delta.lastEventCard || state.lastEventCard?.cardId === 'CC_SWAP_PROJECT');
      const isMoving = Boolean(state.activePawnAnimation?.isAnimating || state.isRolling);
      if (delta.pendingBuyout.buyerId === myPid && !isCardFlow && !isMoving && state.activeModal === null) {
        state.openModal('compulsory_buyout', delta.pendingBuyout);
      }
    } else if (state.activeModal === 'compulsory_buyout') {
      state.closeModal();
    }
  }

  if (delta.pendingTransitWheel !== undefined) {
    if (delta.pendingTransitWheel) {
      const myPid = useLobbyStore.getState().myPlayerId;
      const isTarget = myPid ? delta.pendingTransitWheel.playerId === myPid : Boolean(state.isOfflineMode);
      if (isTarget) {
        const isMoving = Boolean(state.activePawnAnimation?.isAnimating || state.isRolling);
        if (!isMoving && state.activeModal === null) {
          state.openModal('transit_wheel', delta.pendingTransitWheel);
          stagedTransitWheel = null;
        } else {
          stagedTransitWheel = delta.pendingTransitWheel;
        }
      }
    } else {
      stagedTransitWheel = null;
    }
  }

  if (delta.lastTransitResult !== undefined) {
    if (delta.lastTransitResult) {
      const myPid = useLobbyStore.getState().myPlayerId;
      const isTarget = myPid ? delta.lastTransitResult.playerId === myPid : Boolean(state.isOfflineMode);
      if (isTarget) {
        state.updateModalPayload<'transit_wheel'>({
          outcome: delta.lastTransitResult.outcome,
          targetCell: delta.lastTransitResult.targetCell,
          payout: delta.lastTransitResult.payout,
        });
      }
    } else if (state.activeModal === 'transit_wheel') {
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
    if (state.activeModal === 'deed' && delta.turnPhase !== TurnPhase.ActionPhase && delta.turnPhase !== TurnPhase.PropertyManagement) {
      state.closeModal();
    } else if (state.activeModal === 'insolvency' && delta.turnPhase !== TurnPhase.InsolvencyPhase) {
      state.closeModal();
    } else if (state.activeModal === 'hose' && delta.turnPhase !== TurnPhase.HosePhase && !(state.modalPayload as ModalPayloadMap['hose'])?.isReviewingResult) {
      state.closeModal();
    } else if (state.activeModal === 'transit_wheel' && delta.turnPhase !== TurnPhase.PropertyManagement && delta.turnPhase !== TurnPhase.ActionPhase) {
      state.setPendingPawnMove?.(null);
      state.closeModal();
    }
  }
}

function syncBusinessModals(delta: DeltaPayload, state: GameState): void {
  syncAuctionModal(delta, state);
  syncOtherModals(delta, state);
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
    const turnPlayerId = card.drawnBy ?? card.playerId ?? delta?.currentTurnPlayerId ?? delta?.diceRollerId ?? state.currentTurnPlayerId;
    if (turnPlayerId && turnPlayerId !== myPid) {
      state.addFloatingText({
        actionType: card.cardType ?? 'chance',
        playerId: turnPlayerId,
        title: card.title,
        text: card.description || card.effectDetail || '',
        type: (card.effectDelta ?? 0) >= 0 ? FloatingTextType.Bonus : FloatingTextType.Penalty,
        durationMs: 2500,
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
