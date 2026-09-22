// [UI-S04/MSS][UI-S05/MSS] ModalHost — Switchboard for business modals with SFX integration
import React, { useEffect, useRef } from 'react';
import { useGameStore, ModalPayloadMap, type ActiveModalType } from '../../store/game_store';
import { ModalBackdrop } from './modal_backdrop';
import { TitleDeedModal } from './title_deed_modal';
import { PropertyPortfolioModal } from './property_portfolio_modal';
import { AuctionModal } from './auction_modal';
import { TradeModal } from './trade_modal';
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
import { formatCurrency } from '../ui_helpers';
import type { PlayerIntent } from '../../../server/intent_dispatcher';
import { getDeedDisplayInfo } from './modal_helpers';
import { resolveHoseInvestment } from '../../../domain/event_card_engine';
import { BOARD_CONFIG } from '../../../domain/board_config';
import { useLobbyStore } from '../../store/lobby_store';

export interface ModalHostProps {
  readonly activeModal?: ActiveModalType;
  readonly modalPayload?: ModalPayloadMap[keyof ModalPayloadMap] | null;
  readonly onIntent?: (intent: PlayerIntent) => void;
  readonly localPlayerId?: string;
}

export const ModalHost: React.FC<ModalHostProps> = (props = {}) => {
  const { activeModal: propActiveModal, modalPayload: propModalPayload, onIntent } = props;
  const storeActiveModal = useGameStore((state) => state.activeModal);
  const storeModalPayload = useGameStore((state) => state.modalPayload);
  const activeModal = propActiveModal !== undefined ? propActiveModal : storeActiveModal;
  const modalPayload = propModalPayload !== undefined ? propModalPayload : storeModalPayload;
  const closeModal = useGameStore((state) => state.closeModal);
  const updateModalPayload = useGameStore((state) => state.updateModalPayload);
  const playersInfo = useGameStore((state) => state.playersInfo);
  const currentTurnPlayerId = useGameStore((state) => state.currentTurnPlayerId);
  const hoseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hoseTimerRef.current) clearTimeout(hoseTimerRef.current);
    };
  }, []);

  // [UC-GAME-022] Đồng hồ đếm ngược 15s sàn đấu giá tự động
  useEffect(() => {
    if (activeModal !== 'auction') return;
    const timer = setInterval(() => {
      const state = useGameStore.getState();
      if (state.activeModal !== 'auction') return;
      const payload = state.modalPayload as ModalPayloadMap['auction'] | null;
      if (!payload) return;
      if (payload.timeRemaining > 0) {
        state.updateModalPayload<'auction'>({ timeRemaining: payload.timeRemaining - 1 });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeModal]);

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

  if (!modalPayload) {
    return null;
  }

  const lobbyPid = useLobbyStore.getState().myPlayerId;
  const myId = props.localPlayerId || (lobbyPid && lobbyPid.length > 0 ? lobbyPid : undefined) || 'p1';
  const myPlayer = playersInfo[myId];

  const isBuyModal = activeModal === 'deed' && Boolean((modalPayload as ModalPayloadMap['deed'])?.canBuy);
  const isCriticalDecision = isBuyModal || activeModal === 'auction' || activeModal === 'insolvency' || activeModal === 'compulsory_buyout';

  return (
    <ModalBackdrop
      onClose={closeModal}
      center={activeModal === 'auction' || activeModal === 'event'}
      dismissible={!isCriticalDecision}
    >
      {activeModal === 'deed' && (() => {
        const payload = modalPayload as ModalPayloadMap['deed'];
        const ownerId = Object.keys(playersInfo).find((id) => playersInfo[id]?.ownedProperties?.includes(payload.cellIndex));
        const owner = ownerId ? playersInfo[ownerId] : undefined;
        const isOwner = ownerId === myId;
        const isMortgaged = Boolean(owner?.mortgagedProperties?.includes(payload.cellIndex));
        const deed = getDeedDisplayInfo(payload.cellIndex);
        const currentLevel = (useGameStore.getState().levelMap[payload.cellIndex] ?? 0) as 0 | 1 | 2 | 3;
        const upgradeCost = deed && currentLevel < 3 ? deed.upgradeCosts[currentLevel as 0 | 1 | 2] : 0;

        // Monopoly & Even-building calculation
        const colorGroup = deed?.colorGroup;
        const groupCells = colorGroup ? BOARD_CONFIG.filter((c) => c.colorGroup === colorGroup).map((c) => c.index) : [];
        const hasAllProperties = Boolean(owner && groupCells.length > 0 && groupCells.every((idx) => owner.ownedProperties?.includes(idx)));
        const hasAnyGroupMortgaged = Boolean(owner && groupCells.some((idx) => owner.mortgagedProperties?.includes(idx)));
        const hasMonopoly = hasAllProperties && !hasAnyGroupMortgaged;

        let upgradeBlockedReason: string | undefined = undefined;
        if (isOwner && deed && !isMortgaged) {
          if (!hasAllProperties) {
            upgradeBlockedReason = 'Cần sở hữu trọn bộ màu trước khi nâng cấp';
          } else if (hasAnyGroupMortgaged) {
            upgradeBlockedReason = 'Không thể nâng cấp khi nhóm có ô thế chấp';
          } else if (currentLevel < 3 && groupCells.length > 0) {
            const levelMap = useGameStore.getState().levelMap;
            const targetLevel = currentLevel + 1;
            const laggingCells = groupCells
              .filter((idx) => idx !== payload.cellIndex)
              .filter((idx) => (levelMap[idx] ?? 0) < targetLevel - 1);
            if (laggingCells.length > 0) {
              const names = laggingCells.map((idx) => BOARD_CONFIG[idx]?.name ?? `Ô ${idx}`).join(', ');
              upgradeBlockedReason = `Quy tắc xây dựng đều tay: Cần nâng cấp ${names} lên C${targetLevel - 1} trước khi xây C${targetLevel}`;
            }
          }
        }

        let downgradeBlockedReason: string | undefined = undefined;
        if (isOwner && !isMortgaged && (currentLevel ?? 0) > 0 && groupCells.length > 0) {
          const levelMap = useGameStore.getState().levelMap;
          const higherCells = groupCells
            .filter((idx) => idx !== payload.cellIndex)
            .filter((idx) => (levelMap[idx] ?? 0) > (currentLevel ?? 0));
          if (higherCells.length > 0) {
            const names = higherCells.map((idx) => BOARD_CONFIG[idx]?.name ?? `Ô ${idx}`).join(', ');
            downgradeBlockedReason = `Quy tắc hạ cấp đều tay: Cần hạ cấp ${names} trước khi hạ tiếp ô này`;
          }
        }

        return (
          <TitleDeedModal
            cellIndex={payload.cellIndex}
            canBuy={payload.canBuy ?? (!owner && myPlayer ? myPlayer.balance >= 600 : true)}
            isOwned={Boolean(owner)}
            isOwner={isOwner}
            isMortgaged={isMortgaged}
            ownerName={owner?.name}
            currentLevel={currentLevel}
            upgradeCost={upgradeCost}
            hasMonopoly={hasMonopoly}
            upgradeBlockedReason={upgradeBlockedReason}
            downgradeBlockedReason={downgradeBlockedReason}
            onBuy={() => {
              AudioEngine.playSfx(SoundEffect.BUY_PROPERTY);
              onIntent?.({ type: 'INTENT_BUY_PROPERTY' });
              closeModal();
            }}
            onUpgrade={() => {
              onIntent?.({ type: 'INTENT_UPGRADE', cellIndex: payload.cellIndex });
              closeModal();
            }}
            onDowngrade={() => {
              onIntent?.({ type: 'INTENT_DOWNGRADE', cellIndex: payload.cellIndex });
              closeModal();
            }}
            onMortgage={() => {
              onIntent?.({ type: 'INTENT_MORTGAGE', cellIndex: payload.cellIndex });
              closeModal();
            }}
            onRedeem={() => {
              onIntent?.({ type: 'INTENT_REDEEM', cellIndex: payload.cellIndex });
              closeModal();
            }}
            onPass={() => {
              onIntent?.({ type: 'INTENT_DECLINE' });
              closeModal();
            }}
            ownedProperties={myPlayer?.ownedProperties}
            onSelectCell={(nextIdx) => updateModalPayload<'deed'>({ cellIndex: nextIdx })}
            onClose={closeModal}
          />
        );
      })()}

      {activeModal === 'portfolio' && (
        <PropertyPortfolioModal
          ownedProperties={myPlayer?.ownedProperties ?? []}
          propertyStates={Object.fromEntries(
            (myPlayer?.ownedProperties ?? []).map((idx) => [
              idx,
              {
                ownerId: myId,
                level: useGameStore.getState().levelMap[idx] ?? 0,
                isMortgaged: Boolean(myPlayer?.mortgagedProperties?.includes(idx)),
              },
            ])
          )}
          currentBalance={myPlayer?.balance ?? 0}
          isInInsolvency={useGameStore.getState().activeModal === 'insolvency' || (myPlayer?.balance ?? 0) < 0}
          isMyTurn={currentTurnPlayerId === myId}
          turnPhase={useGameStore.getState().turnPhase}
          allPlayers={playersInfo}
          onQuickTrade={(targetPlayerId, targetPropertyIndex) => {
            closeModal();
            useGameStore.getState().openModal('trade', {
              targetPlayerId,
              offeredProperties: [],
              requestedProperties: [targetPropertyIndex],
              cashOffer: 0,
              cashRequest: 0,
            });
          }}
          onViewVacantCell={(cellIndex) => {
            closeModal();
            useGameStore.getState().setCameraFocusCell(cellIndex);
            useGameStore.getState().openModal('deed', {
              cellIndex,
              canBuy: false,
              ownedProperties: myPlayer?.ownedProperties,
            });
          }}
          onUpgrade={(cellIndex) => {
            onIntent?.({ type: 'INTENT_UPGRADE', cellIndex });
          }}
          onHoverCell={(cellIndex) => {
            useGameStore.getState().setCameraFocusCell(cellIndex);
          }}
          onSelectDeed={(cellIndex) => {
            closeModal();
            useGameStore.getState().openModal('deed', {
              cellIndex,
              canBuy: false,
              ownedProperties: myPlayer?.ownedProperties,
            });
          }}
          onMortgage={(cellIndex) => {
            onIntent?.({ type: 'INTENT_MORTGAGE', cellIndex });
          }}
          onRedeem={(cellIndex) => {
            onIntent?.({ type: 'INTENT_REDEEM', cellIndex });
          }}
          onDowngrade={(cellIndex) => {
            onIntent?.({ type: 'INTENT_DOWNGRADE', cellIndex });
          }}
          onClose={() => {
            useGameStore.getState().setCameraFocusCell(null);
            closeModal();
          }}
        />
      )}

      {activeModal === 'auction' && (
        <AuctionModal
          cellIndex={(modalPayload as ModalPayloadMap['auction']).cellIndex}
          currentBid={(modalPayload as ModalPayloadMap['auction']).currentBid}
          startingBid={(modalPayload as ModalPayloadMap['auction']).startingBid}
          highestBidderId={(modalPayload as ModalPayloadMap['auction']).highestBidderId}
          timeRemaining={(modalPayload as ModalPayloadMap['auction']).timeRemaining}
          hasPassed={(modalPayload as ModalPayloadMap['auction']).hasPassed}
          isDeclinedPlayer={(modalPayload as ModalPayloadMap['auction']).declinedPlayerId === myId}
          bidderName={(modalPayload as ModalPayloadMap['auction']).highestBidderId ? playersInfo[(modalPayload as ModalPayloadMap['auction']).highestBidderId!]?.name : undefined}
          myBalance={myPlayer?.balance}
          myId={myId}
          isConcluded={(modalPayload as ModalPayloadMap['auction']).isConcluded}
          winnerId={(modalPayload as ModalPayloadMap['auction']).winnerId}
          finalPrice={(modalPayload as ModalPayloadMap['auction']).finalPrice}
          isForeclosure={(modalPayload as ModalPayloadMap['auction']).isForeclosure}
          insolvencyPlayerId={(modalPayload as ModalPayloadMap['auction']).insolvencyPlayerId}
          onClose={closeModal}
          onBid={(amount) => {
            AudioEngine.playSfx(SoundEffect.AUCTION_BID);
            onIntent?.({ type: 'INTENT_BID', amount });
            const curTime = (modalPayload as ModalPayloadMap['auction']).timeRemaining;
            const nextTime = curTime <= 3 ? curTime + 3 : curTime;
            updateModalPayload<'auction'>({ currentBid: amount, highestBidderId: myId, timeRemaining: nextTime });
          }}
          onPass={() => {
            onIntent?.({ type: 'INTENT_AUCTION_PASS' });
            updateModalPayload<'auction'>({ hasPassed: true });
          }}
        />
      )}

      {activeModal === 'trade' && (() => {
        const tradePayload = modalPayload as ModalPayloadMap['trade'];
        const currentTargetId = tradePayload.targetPlayerId;
        const slots = useLobbyStore.getState().slots;
        const availablePartners = Object.keys(playersInfo)
          .filter((id) => id !== myId)
          .map((id) => {
            const slot = slots?.find((s) => s.playerId === id);
            return {
              id,
              name: playersInfo[id]?.name ?? id,
              balance: playersInfo[id]?.balance ?? 0,
              isBot: Boolean(playersInfo[id]?.isBot),
              personality: playersInfo[id]?.personality ?? slot?.botPersonality,
            };
          });
        const targetPlayer = playersInfo[currentTargetId];

        return (
          <TradeModal
            targetPlayerId={currentTargetId}
            myProperties={myPlayer?.ownedProperties ?? []}
            targetProperties={targetPlayer?.ownedProperties ?? []}
            myMortgagedProperties={myPlayer?.mortgagedProperties ?? []}
            targetMortgagedProperties={targetPlayer?.mortgagedProperties ?? []}
            myBalance={myPlayer?.balance ?? 0}
            targetPlayerName={targetPlayer?.name}
            targetBalance={targetPlayer?.balance ?? 0}
            availablePartners={availablePartners}
            onSelectPartner={(partnerId) => {
              updateModalPayload<'trade'>({
                targetPlayerId: partnerId,
                requestedProperties: [],
                cashRequest: 0,
              });
            }}
            initialOffered={tradePayload.offeredProperties}
            initialRequested={tradePayload.requestedProperties}
            initialCashOffer={tradePayload.cashOffer}
            initialCashRequest={tradePayload.cashRequest}
            onSubmitTrade={(tradeData) => {
              AudioEngine.playSfx(SoundEffect.TRADE_SUCCESS);
              if (tradeData) {
                const off0 = tradeData.offeredProperties[0];
                const req0 = tradeData.requestedProperties[0];
                if (off0 !== undefined && req0 !== undefined) {
                  onIntent?.({
                    type: 'INTENT_TRADE_OFFER',
                    sellerId: tradeData.targetPlayerId,
                    buyerId: myId,
                    cellIndex: req0,
                    offeredCellIndex: off0,
                    price: (tradeData.cashOffer || 0) - (tradeData.cashRequest || 0),
                  });
                } else if (off0 !== undefined) {
                  onIntent?.({
                    type: 'INTENT_TRADE_OFFER',
                    sellerId: myId,
                    buyerId: tradeData.targetPlayerId,
                    cellIndex: off0,
                    price: tradeData.cashRequest || tradeData.cashOffer || 1000,
                  });
                } else if (req0 !== undefined) {
                  onIntent?.({
                    type: 'INTENT_TRADE_OFFER',
                    sellerId: tradeData.targetPlayerId,
                    buyerId: myId,
                    cellIndex: req0,
                    price: tradeData.cashOffer || tradeData.cashRequest || 1000,
                  });
                }
              }
              closeModal();
            }}
            onClose={closeModal}
          />
        );
      })()}

      {activeModal === 'event' && (
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
            onAccept={(offerId) => { AudioEngine.playSfx(SoundEffect.BUY_PROPERTY); onIntent?.({ type: 'INTENT_RESPOND_TRADE_OFFER', offerId, accept: true }); closeModal(); }}
            onReject={(offerId) => { AudioEngine.playSfx(SoundEffect.CARD_FLIP); onIntent?.({ type: 'INTENT_RESPOND_TRADE_OFFER', offerId, accept: false }); closeModal(); }}
            onClose={() => { onIntent?.({ type: 'INTENT_RESPOND_TRADE_OFFER', offerId: p.offerId, accept: false }); closeModal(); }}
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
            expiresAt={p.expiresAt}
            onBuyout={(cellIndex) => { AudioEngine.playSfx(SoundEffect.BUY_PROPERTY); onIntent?.({ type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT', cellIndex }); closeModal(); }}
            onDecline={() => { AudioEngine.playSfx(SoundEffect.CARD_FLIP); onIntent?.({ type: 'INTENT_DECLINE_COMPULSORY_BUYOUT' }); closeModal(); }}
            onClose={() => { onIntent?.({ type: 'INTENT_DECLINE_COMPULSORY_BUYOUT' }); closeModal(); }}
          />
        );
      })()}
    </ModalBackdrop>
  );
};
