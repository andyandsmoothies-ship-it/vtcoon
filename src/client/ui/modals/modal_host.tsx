// [UI-S04/MSS][UI-S05/MSS] ModalHost — Switchboard for business modals with SFX integration
import React, { useEffect, useRef } from 'react';
import { useGameStore, ModalPayloadMap, type ActiveModalType } from '../../store/game_store';
import { ModalBackdrop } from './modal_backdrop';
import { DeedModalHost } from './hosts/deed_modal_host';
import { PortfolioModalHost } from './hosts/portfolio_modal_host';
import { AuctionModalHost } from './hosts/auction_modal_host';
import { TradeModalHost } from './hosts/trade_modal_host';
import { TransitWheelModal } from './transit_wheel_modal';
import { EventCardModal } from './event_card_modal';
import { HoseModal } from './hose_modal';
import { InsolvencyBanner } from './insolvency_banner';
import { GameOverModal } from './game_over_modal';
import { GameRulesModal } from './game_rules_modal';
import { MasterplanModal } from './masterplan_modal';
import { BotTradeOfferModal } from './bot_trade_offer_modal';
import { CompulsoryBuyoutModal } from './compulsory_buyout_modal';
import { AudioEngine } from '../../audio/audio_engine';
import { SoundEffect } from '../../audio/audio_types';
import type { PlayerIntent } from '../../../server/intent_dispatcher';
import { isAuctionDismissible } from './modal_helpers';
import { useLobbyStore } from '../../store/lobby_store';

export interface ModalHostProps {
  readonly activeModal?: ActiveModalType;
  readonly modalPayload?: ModalPayloadMap[keyof ModalPayloadMap] | null;
  readonly onIntent?: (intent: PlayerIntent) => void;
  readonly localPlayerId?: string;
}

export const ModalHost: React.FC<ModalHostProps> = (props = {}) => {
  const { activeModal: propActiveModal, modalPayload: propModalPayload, onIntent } = props;
  const storeActiveModal = useGameStore((state) => state.activeModal) ?? useGameStore.getState().activeModal;
  const storeModalPayload = useGameStore((state) => state.modalPayload) ?? useGameStore.getState().modalPayload;
  const activeModal = propActiveModal !== undefined ? propActiveModal : storeActiveModal;
  const modalPayload = propModalPayload !== undefined ? propModalPayload : storeModalPayload;
  const closeModal = useGameStore((state) => state.closeModal);
  const updateModalPayload = useGameStore((state) => state.updateModalPayload);
  const hookPlayers = useGameStore((state) => state.playersInfo);
  const playersInfo = Object.keys(hookPlayers).length > 0 ? hookPlayers : useGameStore.getState().playersInfo;
  const currentTurnPlayerId = useGameStore((state) => state.currentTurnPlayerId);
  const activeModifiers = useGameStore((state) => state.activeModifiers);
  const isTradeFrozen = Boolean(activeModifiers?.some((m) => m.type === 'MC_FREEZE_TRADE' && m.remainingRounds > 0));
  const hoseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hoseTimerRef.current) clearTimeout(hoseTimerRef.current);
    };
  }, []);

  // SFX khi mở thẻ sự kiện hoặc đề xuất mua đất từ Bot / mua lại C0
  useEffect(() => {
    if (activeModal === 'event' || activeModal === 'bot_trade_offer' || activeModal === 'compulsory_buyout') {
      AudioEngine.playSfx(SoundEffect.CARD_DRAW);
    }
  }, [activeModal]);

  if (!activeModal) {
    return null;
  }

  if (activeModal === 'rules') {
    return (
      <GameRulesModal
        isOpen={true}
        onClose={closeModal}
        initialTab={(modalPayload as ModalPayloadMap['rules'])?.initialTab}
      />
    );
  }

  if (activeModal === 'masterplan') {
    const payload = (modalPayload as ModalPayloadMap['masterplan']) || {};
    return (
      <ModalBackdrop
        onClose={closeModal}
        center={true}
        dismissible={true}
      >
        <MasterplanModal
          initialTab={payload.initialTab}
          selectedCellIndex={payload.selectedCellIndex}
          onClose={closeModal}
        />
      </ModalBackdrop>
    );
  }

  if (!modalPayload && activeModal !== 'portfolio') {
    return null;
  }

  const lobbyPid = useLobbyStore.getState().myPlayerId;
  const myId = props.localPlayerId || (lobbyPid && lobbyPid.length > 0 ? lobbyPid : undefined) || 'p1';
  const myPlayer = playersInfo[myId];

  const isBuyModal = activeModal === 'deed' && Boolean((modalPayload as ModalPayloadMap['deed'])?.canBuy);
  const isAuctionActive = activeModal === 'auction';
  const isCriticalDecision = isBuyModal || (isAuctionActive && !isAuctionDismissible(modalPayload as ModalPayloadMap['auction'], myId, myPlayer)) || activeModal === 'insolvency' || activeModal === 'compulsory_buyout' || activeModal === 'transit_wheel';

  const handleBackdropClose = () => {
    if (isAuctionActive && modalPayload && 'cellIndex' in modalPayload) {
      useGameStore.getState().dismissAuction((modalPayload as ModalPayloadMap['auction']).cellIndex);
    } else if (activeModal === 'event') {
      const pb = useGameStore.getState().pendingBuyout;
      const myPid = useLobbyStore.getState().myPlayerId;
      if (pb && pb.buyerId === myPid) {
        useGameStore.getState().openModal('compulsory_buyout', pb);
      } else {
        closeModal();
      }
    } else {
      closeModal();
    }
  };

  return (
    <ModalBackdrop
      onClose={handleBackdropClose}
      center={activeModal !== 'deed'}
      dismissible={!isCriticalDecision}
    >
      {activeModal === 'deed' && modalPayload && (
        <DeedModalHost
          payload={modalPayload as ModalPayloadMap['deed']}
          myId={myId}
          myPlayer={myPlayer}
          playersInfo={playersInfo}
          onIntent={onIntent}
          closeModal={closeModal}
          updateModalPayload={updateModalPayload}
        />
      )}

      {activeModal === 'transit_wheel' && modalPayload && (
        <TransitWheelModal
          cellIndex={(modalPayload as ModalPayloadMap['transit_wheel']).cellIndex}
          payload={modalPayload as ModalPayloadMap['transit_wheel']}
          onSpin={() => onIntent?.({ type: 'INTENT_SPIN_TRANSIT_WHEEL' })}
          onClose={closeModal}
        />
      )}

      {activeModal === 'portfolio' && (
        <PortfolioModalHost
          myId={myId}
          myPlayer={myPlayer}
          playersInfo={playersInfo}
          isTradeFrozen={isTradeFrozen}
          activeModifiers={activeModifiers}
          currentTurnPlayerId={currentTurnPlayerId}
          onIntent={onIntent}
          closeModal={closeModal}
        />
      )}

      {activeModal === 'auction' && modalPayload && (
        <AuctionModalHost
          payload={modalPayload as ModalPayloadMap['auction']}
          myId={myId}
          myPlayer={myPlayer}
          playersInfo={playersInfo}
          onIntent={onIntent}
          onClose={closeModal}
          updateModalPayload={updateModalPayload}
        />
      )}

      {activeModal === 'trade' && modalPayload && (
        <TradeModalHost
          payload={modalPayload as ModalPayloadMap['trade']}
          myId={myId}
          myPlayer={myPlayer}
          playersInfo={playersInfo}
          onIntent={onIntent}
          closeModal={closeModal}
          updateModalPayload={updateModalPayload}
        />
      )}

      {activeModal === 'event' && (() => {
        const handleEventModalClose = () => {
          const pb = useGameStore.getState().pendingBuyout;
          const myPid = useLobbyStore.getState().myPlayerId;
          if (pb && pb.buyerId === myPid) {
            useGameStore.getState().openModal('compulsory_buyout', pb);
          } else {
            closeModal();
          }
        };

        return (
          <EventCardModal
            cardType={(modalPayload as ModalPayloadMap['event']).cardType}
            cardId={(modalPayload as ModalPayloadMap['event']).cardId}
            title={(modalPayload as ModalPayloadMap['event']).title}
            description={(modalPayload as ModalPayloadMap['event']).description}
            effectDelta={(modalPayload as ModalPayloadMap['event']).effectDelta}
            targetScope={(modalPayload as ModalPayloadMap['event']).targetScope}
            effectDetail={(modalPayload as ModalPayloadMap['event']).effectDetail}
            duration={(modalPayload as ModalPayloadMap['event']).duration}
            destination={(modalPayload as ModalPayloadMap['event']).destination}
            onConfirm={handleEventModalClose}
            onClose={handleEventModalClose}
          />
        );
      })()}

      {activeModal === 'hose' && (
        <HoseModal
          myBalance={myPlayer?.balance}
          defaultStake={(modalPayload as ModalPayloadMap['hose']).currentStake ?? 500}
          lastDiceRoll={(modalPayload as ModalPayloadMap['hose']).lastDiceRoll}
          lastPayout={(modalPayload as ModalPayloadMap['hose']).lastPayout}
          isReviewingResult={(modalPayload as ModalPayloadMap['hose']).isReviewingResult}
          onInvest={(stake) => {
            AudioEngine.playSfx(SoundEffect.DICE_ROLL);
            const chosenStake = stake ?? 500;
            updateModalPayload<'hose'>({ isReviewingResult: true });
            onIntent?.({ type: 'INTENT_INVEST', stake: chosenStake });
            if (hoseTimerRef.current) clearTimeout(hoseTimerRef.current);
            hoseTimerRef.current = setTimeout(() => {
              closeModal();
            }, 6000);
          }}
          onConfirm={closeModal}
          onSkip={() => {
            onIntent?.({ type: 'INTENT_SKIP' });
            closeModal();
          }}
          onClose={closeModal}
        />
      )}

      {activeModal === 'insolvency' && (
        <InsolvencyBanner
          playerId={(modalPayload as ModalPayloadMap['insolvency']).playerId}
          playerName={playersInfo[(modalPayload as ModalPayloadMap['insolvency']).playerId]?.name}
          deficit={(modalPayload as ModalPayloadMap['insolvency']).deficit}
          onAutoSolvency={() => onIntent?.({ type: 'INTENT_AUTO_SOLVENCY' })}
          onManageProperties={() => useGameStore.getState().openModal('portfolio', {})}
          onDeclareBankruptcy={() => {
            AudioEngine.playSfx(SoundEffect.BANKRUPT);
            onIntent?.({ type: 'INTENT_BANKRUPTCY' });
            closeModal();
          }}
          onClose={closeModal}
        />
      )}

      {activeModal === 'game_over' && (
        <GameOverModal
          leaderboard={(modalPayload as ModalPayloadMap['game_over'])?.leaderboard}
          onClose={() => { closeModal(); if (typeof window !== 'undefined') window.location.reload(); }}
          onPlayAgain={() => { closeModal(); if (typeof window !== 'undefined') window.location.reload(); }}
        />
      )}

      {activeModal === 'bot_trade_offer' && modalPayload && (() => {
        const p = modalPayload as ModalPayloadMap['bot_trade_offer'];
        return (
          <BotTradeOfferModal
            offerId={p.offerId}
            cellIndex={p.cellIndex}
            price={p.price}
            buyerId={p.buyerId}
            sellerId={p.sellerId}
            expiresAt={p.expiresAt}
            offeredCellIndex={p.offeredCellIndex}
            onAccept={(offerId) => { AudioEngine.playSfx(SoundEffect.BUY_PROPERTY); onIntent?.({ type: 'INTENT_RESPOND_TRADE_OFFER', offerId, accept: true }); useGameStore.getState().setPendingTradeOffer(null); closeModal(); }}
            onReject={(offerId) => { AudioEngine.playSfx(SoundEffect.CARD_FLIP); onIntent?.({ type: 'INTENT_RESPOND_TRADE_OFFER', offerId, accept: false }); useGameStore.getState().setPendingTradeOffer(null); closeModal(); }}
            onClose={() => { onIntent?.({ type: 'INTENT_RESPOND_TRADE_OFFER', offerId: p.offerId, accept: false }); useGameStore.getState().setPendingTradeOffer(null); closeModal(); }}
          />
        );
      })()}

      {activeModal === 'compulsory_buyout' && modalPayload && (() => {
        const p = modalPayload as ModalPayloadMap['compulsory_buyout'];
        return (
          <CompulsoryBuyoutModal
            buyerId={p.buyerId}
            sellerId={p.sellerId}
            cellIndex={p.cellIndex}
            cost={p.cost}
            basePrice={p.basePrice}
            expiresAt={p.expiresAt} eligibleTargets={p.eligibleTargets}
            onBuyout={(cellIndex) => { AudioEngine.playSfx(SoundEffect.BUY_PROPERTY); onIntent?.({ type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT', cellIndex }); closeModal(); }}
            onDecline={() => { AudioEngine.playSfx(SoundEffect.CARD_FLIP); onIntent?.({ type: 'INTENT_DECLINE_COMPULSORY_BUYOUT' }); closeModal(); }}
            onClose={() => { onIntent?.({ type: 'INTENT_DECLINE_COMPULSORY_BUYOUT' }); closeModal(); }}
          />
        );
      })()}
    </ModalBackdrop>
  );
};
