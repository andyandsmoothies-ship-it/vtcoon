// [UI-S04/MSS][UI-S05/MSS] ModalHost — Switchboard for business modals with SFX integration
import React, { useEffect, useRef } from 'react';
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
import { formatCurrency } from '../ui_helpers';
import type { PlayerIntent } from '../../../server/intent_dispatcher';
import { getDeedDisplayInfo } from './modal_helpers';
import { resolveHoseInvestment } from '../../../domain/event_card_engine';
import { BOARD_CONFIG } from '../../../domain/board_config';

export interface ModalHostProps {
  readonly activeModal?: ActiveModalType;
  readonly modalPayload?: ModalPayloadMap[keyof ModalPayloadMap] | null;
  readonly onIntent?: (intent: PlayerIntent) => void;
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
          hasPassed={(modalPayload as ModalPayloadMap['auction']).hasPassed || (modalPayload as ModalPayloadMap['auction']).declinedPlayerId === myId}
          bidderName={(modalPayload as ModalPayloadMap['auction']).highestBidderId ? playersInfo[(modalPayload as ModalPayloadMap['auction']).highestBidderId!]?.name : undefined}
          myBalance={myPlayer?.balance}
          myId={myId}
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
            const tradePayload = modalPayload as ModalPayloadMap['trade'];
            if (tradePayload.offeredProperties[0] !== undefined) {
              onIntent?.({
                type: 'INTENT_TRADE_OFFER',
                sellerId: myId,
                buyerId: tradePayload.targetPlayerId,
                cellIndex: tradePayload.offeredProperties[0],
                price: tradePayload.cashRequest || 1000,
              });
            }
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
          onInvest={(stake) => {
            AudioEngine.playSfx(SoundEffect.DICE_ROLL);
            const chosenStake = stake ?? 500;
            const roll = Math.floor(Math.random() * 6) + 1;
            const payout = resolveHoseInvestment(chosenStake, roll);
            updateModalPayload<'hose'>({ lastDiceRoll: roll, lastPayout: payout });
            onIntent?.({ type: 'INTENT_INVEST', stake: chosenStake });
            if (hoseTimerRef.current) clearTimeout(hoseTimerRef.current);
            hoseTimerRef.current = setTimeout(() => {
              closeModal();
            }, 1500);
          }}
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
          onManageProperties={closeModal}
          onDeclareBankruptcy={() => {
            AudioEngine.playSfx(SoundEffect.BANKRUPT);
            onIntent?.({ type: 'INTENT_BANKRUPTCY' });
            closeModal();
          }}
          onClose={closeModal}
        />
      )}

      {activeModal === 'game_over' && (
        <div className="w-full max-w-md bg-slate-900 border border-amber-500/60 rounded-2xl shadow-2xl p-6 text-center" data-testid="game-over-modal">
          <div className="text-4xl mb-2" aria-hidden="true">🏆</div>
          <h2 className="text-xl font-black text-amber-400 uppercase tracking-wide">
            VÁN ĐẤU KẾT THÚC
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-4">Bảng Xếp Hạng Đại Gia Địa Ốc</p>
          <div className="space-y-2 mb-6">
            {(modalPayload as ModalPayloadMap['game_over'])?.leaderboard?.map((entry, idx) => (
              <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-200'}`}>
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-100">{playersInfo[entry.id]?.name ?? entry.id}</span>
                </div>
                <span className="font-bold text-emerald-400 tabular-nums">{formatCurrency(entry.netWorth)}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              closeModal();
              if (typeof window !== 'undefined') window.location.reload();
            }}
            className="w-full min-h-[44px] py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            Về Sảnh Chờ
          </button>
        </div>
      )}
    </ModalBackdrop>
  );
};
