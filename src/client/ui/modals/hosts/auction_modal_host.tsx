// [IMP-335] AuctionModalHost — Extracted sub-host for real-time auction modal
import React, { useEffect } from 'react';
import { useGameStore, type PlayerHudInfo, type ModalPayloadMap } from '../../../store/index.js';
import type { PlayerIntent } from '../../../../domain/protocol/index.js';

import { calculateAuctionTimeRemaining } from '../modal_helpers';
import { audio, SoundEffect } from '../../../audio/index.js';
import { AuctionModal } from '../auction_modal';

export interface AuctionModalHostProps {
  readonly payload: ModalPayloadMap['auction'];
  readonly myId: string;
  readonly myPlayer?: PlayerHudInfo | null;
  readonly playersInfo: Record<string, PlayerHudInfo>;
  readonly onIntent?: (intent: PlayerIntent) => void;
  readonly onClose?: () => void;
  readonly updateModalPayload: <K extends keyof ModalPayloadMap>(payload: Partial<ModalPayloadMap[K]>) => void;
}

function isAuctionPayload(p: unknown): p is ModalPayloadMap['auction'] {
  return typeof p === 'object' && p !== null && 'cellIndex' in p;
}

export function AuctionModalHost(props: AuctionModalHostProps): React.ReactElement {
  const { payload, myId, myPlayer, playersInfo, onIntent, onClose, updateModalPayload } = props;

  useEffect(() => {
    const timer = setInterval(() => {
      const state = useGameStore.getState();
      if (state.activeModal !== 'auction') return;
      if (!isAuctionPayload(state.modalPayload)) return;
      const targetTime = calculateAuctionTimeRemaining(state.modalPayload);
      if (targetTime !== state.modalPayload.timeRemaining) {
        state.updateModalPayload<'auction'>({ timeRemaining: targetTime });
      }
    }, 250);
    return () => clearInterval(timer);
  }, []);

  return (
    <AuctionModal
      cellIndex={payload.cellIndex}
      currentBid={payload.currentBid ?? 0}
      startingBid={payload.startingBid}
      highestBidderId={payload.highestBidderId ?? null}
      timeRemaining={payload.timeRemaining ?? 15}
      hasPassed={payload.hasPassed}
      passedPlayerIds={payload.passedPlayerIds}
      declinedPlayerId={payload.declinedPlayerId}
      isDeclinedPlayer={payload.declinedPlayerId === myId || payload.insolvencyPlayerId === myId}
      bidderName={payload.highestBidderId ? playersInfo[payload.highestBidderId]?.name : undefined}
      myBalance={myPlayer?.balance}
      myId={myId}
      isConcluded={payload.isConcluded}
      winnerId={payload.winnerId}
      finalPrice={payload.finalPrice}
      isForeclosure={payload.isForeclosure}
      isFireSale={payload.isFireSale}
      insolvencyPlayerId={payload.insolvencyPlayerId}
      isBankrupt={myPlayer?.bankrupt}
      onClose={() => {
        useGameStore.getState().dismissAuction(payload.cellIndex);
        onClose?.();
      }}
      onBid={(amount) => {
        audio.playSfx(SoundEffect.AUCTION_BID);
        onIntent?.({ type: 'INTENT_BID', amount });
        const curTime = payload.timeRemaining ?? 15;
        const nextTime = curTime <= 3 ? curTime + 3 : curTime;
        const nextDeadline = Date.now() + nextTime * 1000;
        updateModalPayload<'auction'>({
          currentBid: amount,
          highestBidderId: myId,
          timeRemaining: nextTime,
          deadline: nextDeadline,
        });
      }}
      onPass={() => {
        onIntent?.({ type: 'INTENT_AUCTION_PASS' });
        updateModalPayload<'auction'>({ hasPassed: true });
      }}
    />
  );
}
