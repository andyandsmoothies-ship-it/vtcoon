// [UI-S04/MSS][UI-S05/MSS] ModalHost — Switchboard for business modals with SFX integration
import React, { useEffect } from 'react';
import { useGameStore, ModalPayloadMap, type ActiveModalType } from '../../store/game_store';
import { ModalBackdrop } from './modal_backdrop';
import { TitleDeedModal } from './title_deed_modal';
import { AuctionModal } from './auction_modal';
import { TradeModal } from './trade_modal';
import { EventCardModal } from './event_card_modal';
import { HoseModal } from './hose_modal';
import { InsolvencyBanner } from './insolvency_banner';
import { AudioEngine } from '../../audio/audio_engine';
import { SoundEffect } from '../../audio/audio_types';

export interface ModalHostProps {
  readonly activeModal?: ActiveModalType;
  readonly modalPayload?: ModalPayloadMap[keyof ModalPayloadMap] | null;
}

export const ModalHost: React.FC<ModalHostProps> = (props = {}) => {
  const { activeModal: propActiveModal, modalPayload: propModalPayload } = props;
  const storeActiveModal = useGameStore((state) => state.activeModal);
  const storeModalPayload = useGameStore((state) => state.modalPayload);
  const activeModal = propActiveModal !== undefined ? propActiveModal : storeActiveModal;
  const modalPayload = propModalPayload !== undefined ? propModalPayload : storeModalPayload;
  const closeModal = useGameStore((state) => state.closeModal);
  const updateModalPayload = useGameStore((state) => state.updateModalPayload);
  const playersInfo = useGameStore((state) => state.playersInfo);
  const currentTurnPlayerId = useGameStore((state) => state.currentTurnPlayerId);

  // [UC-GAME-022] Đồng hồ đếm ngược 15s sàn đấu giá tự động
  useEffect(() => {
    if (activeModal !== 'auction') return;
    const timer = setInterval(() => {
      const state = useGameStore.getState();
      if (state.activeModal !== 'auction') return;
      const payload = state.modalPayload as ModalPayloadMap['auction'] | null;
      if (!payload) return;
      if (payload.timeRemaining <= 1) {
        state.closeModal();
      } else {
        state.updateModalPayload<'auction'>({ timeRemaining: payload.timeRemaining - 1 });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeModal]);

  // SFX khi mở thẻ sự kiện
  useEffect(() => {
    if (activeModal === 'event') {
      AudioEngine.playSfx(SoundEffect.CARD_DRAW);
    }
  }, [activeModal]);

  if (!activeModal || !modalPayload) {
    return null;
  }

  const myId = currentTurnPlayerId ?? Object.keys(playersInfo)[0] ?? 'p1';
  const myPlayer = playersInfo[myId];

  return (
    <ModalBackdrop onClose={closeModal}>
      {activeModal === 'deed' && (() => {
        const payload = modalPayload as ModalPayloadMap['deed'];
        const ownerId = Object.keys(playersInfo).find((id) => playersInfo[id]?.ownedProperties?.includes(payload.cellIndex));
        const owner = ownerId ? playersInfo[ownerId] : undefined;
        return (
          <TitleDeedModal
            cellIndex={payload.cellIndex}
            canBuy={payload.canBuy ?? (!owner && myPlayer ? myPlayer.balance >= 600 : true)}
            isOwned={Boolean(owner)}
            ownerName={owner?.name}
            onBuy={() => {
              AudioEngine.playSfx(SoundEffect.BUY_PROPERTY);
              closeModal();
            }}
            onPass={closeModal}
            onClose={closeModal}
          />
        );
      })()}

      {activeModal === 'auction' && (
        <AuctionModal
          cellIndex={(modalPayload as ModalPayloadMap['auction']).cellIndex}
          currentBid={(modalPayload as ModalPayloadMap['auction']).currentBid}
          highestBidderId={(modalPayload as ModalPayloadMap['auction']).highestBidderId}
          timeRemaining={(modalPayload as ModalPayloadMap['auction']).timeRemaining}
          hasPassed={(modalPayload as ModalPayloadMap['auction']).hasPassed}
          bidderName={(modalPayload as ModalPayloadMap['auction']).highestBidderId ? playersInfo[(modalPayload as ModalPayloadMap['auction']).highestBidderId!]?.name : undefined}
          myBalance={myPlayer?.balance}
          myId={myId}
          onBid={(amount) => {
            AudioEngine.playSfx(SoundEffect.AUCTION_BID);
            updateModalPayload<'auction'>({ currentBid: amount, highestBidderId: myId, timeRemaining: 15 });
          }}
          onPass={() => updateModalPayload<'auction'>({ hasPassed: true })}
          onClose={closeModal}
        />
      )}

      {activeModal === 'trade' && (
        <TradeModal
          targetPlayerId={(modalPayload as ModalPayloadMap['trade']).targetPlayerId}
          myProperties={myPlayer?.ownedProperties ?? []}
          targetProperties={playersInfo[(modalPayload as ModalPayloadMap['trade']).targetPlayerId]?.ownedProperties ?? []}
          myMortgagedProperties={myPlayer?.mortgagedProperties ?? []}
          targetMortgagedProperties={playersInfo[(modalPayload as ModalPayloadMap['trade']).targetPlayerId]?.mortgagedProperties ?? []}
          myBalance={myPlayer?.balance ?? 0}
          targetPlayerName={playersInfo[(modalPayload as ModalPayloadMap['trade']).targetPlayerId]?.name}
          initialOffered={(modalPayload as ModalPayloadMap['trade']).offeredProperties}
          initialRequested={(modalPayload as ModalPayloadMap['trade']).requestedProperties}
          initialCashOffer={(modalPayload as ModalPayloadMap['trade']).cashOffer}
          initialCashRequest={(modalPayload as ModalPayloadMap['trade']).cashRequest}
          onSubmitTrade={() => {
            AudioEngine.playSfx(SoundEffect.TRADE_SUCCESS);
            closeModal();
          }}
          onClose={closeModal}
        />
      )}

      {activeModal === 'event' && (
        <EventCardModal
          cardType={(modalPayload as ModalPayloadMap['event']).cardType}
          cardId={(modalPayload as ModalPayloadMap['event']).cardId}
          title={(modalPayload as ModalPayloadMap['event']).title}
          description={(modalPayload as ModalPayloadMap['event']).description}
          effectDelta={(modalPayload as ModalPayloadMap['event']).effectDelta}
          onConfirm={closeModal}
          onClose={closeModal}
        />
      )}

      {activeModal === 'hose' && (
        <HoseModal
          myBalance={myPlayer?.balance}
          defaultStake={(modalPayload as ModalPayloadMap['hose']).currentStake ?? 500}
          lastDiceRoll={(modalPayload as ModalPayloadMap['hose']).lastDiceRoll}
          lastPayout={(modalPayload as ModalPayloadMap['hose']).lastPayout}
          onInvest={(_stake) => {
            AudioEngine.playSfx(SoundEffect.DICE_ROLL);
            closeModal();
          }}
          onSkip={closeModal}
          onClose={closeModal}
        />
      )}

      {activeModal === 'insolvency' && (
        <InsolvencyBanner
          playerId={(modalPayload as ModalPayloadMap['insolvency']).playerId}
          playerName={playersInfo[(modalPayload as ModalPayloadMap['insolvency']).playerId]?.name}
          deficit={(modalPayload as ModalPayloadMap['insolvency']).deficit}
          onManageProperties={closeModal}
          onDeclareBankruptcy={() => {
            AudioEngine.playSfx(SoundEffect.BANKRUPT);
            closeModal();
          }}
          onClose={closeModal}
        />
      )}
    </ModalBackdrop>
  );
}
