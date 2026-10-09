// [IMP-304] Client Delta Modal Synchronization & Staged Transit Wheel
import type { GameState } from '../store/game_store.js';
import type { ModalPayloadMap } from '../store/game_store_types.js';
import { useLobbyStore } from '../store/lobby_store.js';
import { TurnPhase } from '../../domain/room.js';
import type { DeltaPayload } from '../../server/session_manager.js';

let stagedTransitWheel: { playerId: string; cellIndex: number; timestamp: number } | null = null;

export function consumeStagedTransitWheel(
  targetCellIndex?: number,
  targetPlayerId?: string,
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

export function syncAuctionModal(delta: DeltaPayload, state: GameState): void {
  if (delta.auction) {
    const isConcluded = Boolean(delta.auction.isConcluded);
    const myPid = useLobbyStore.getState().myPlayerId;
    const prevPayload = (state.activeModal === 'auction' ? state.modalPayload : state.auction) as ModalPayloadMap['auction'] | null;
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
      // KHONG mo lai modal khi luot choi da chuyen sang do xuc xac
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

export function syncOtherModals(delta: DeltaPayload, state: GameState): void {
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
          boostSteps: delta.lastTransitResult.boostSteps,
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
      const myPid = useLobbyStore.getState().myPlayerId;
      const modalPayload = state.modalPayload as ModalPayloadMap['insolvency'] | null;
      const debtorId = myPid || modalPayload?.playerId;
      const debtor = debtorId ? state.playersInfo[debtorId] : undefined;
      if (!debtor || debtor.balance >= 0 || debtor.bankrupt) state.closeModal();
    } else if (state.activeModal === 'hose' && delta.turnPhase !== TurnPhase.HosePhase && !(state.modalPayload as ModalPayloadMap['hose'])?.isReviewingResult) {
      state.closeModal();
    } else if (state.activeModal === 'transit_wheel' && delta.turnPhase !== TurnPhase.PropertyManagement && delta.turnPhase !== TurnPhase.ActionPhase) {
      state.setPendingPawnMove?.(null);
      state.closeModal();
    }
  }
}

export function syncBusinessModals(delta: DeltaPayload, state: GameState): void {
  syncAuctionModal(delta, state);
  syncOtherModals(delta, state);
}
