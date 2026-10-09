// [IMP-335] TradeModalHost — Extracted sub-host for player-to-player trade modal
import React from 'react';
import type { PlayerHudInfo } from '../../../store/game_store_types';
import type { PlayerIntent } from '../../../../server/intent_dispatcher';
import type { ModalPayloadMap } from '../../../store/game_store';
import { useLobbyStore } from '../../../store/lobby_store';
import { AudioEngine } from '../../../audio/audio_engine';
import { SoundEffect } from '../../../audio/audio_types';
import { TradeModal } from '../trade_modal';

export interface TradeModalHostProps {
  readonly payload: ModalPayloadMap['trade'];
  readonly myId: string;
  readonly myPlayer?: PlayerHudInfo | null;
  readonly playersInfo: Record<string, PlayerHudInfo>;
  readonly onIntent?: (intent: PlayerIntent) => void;
  readonly closeModal: () => void;
  readonly updateModalPayload: <K extends keyof ModalPayloadMap>(payload: Partial<ModalPayloadMap[K]>) => void;
}

export function buildTradeOfferIntent(
  myId: string,
  tradeData?: {
    targetPlayerId: string;
    offeredProperties: readonly number[];
    requestedProperties: readonly number[];
    cashOffer?: number;
    cashRequest?: number;
  }
): PlayerIntent | null {
  if (!tradeData) return null;
  const off0 = tradeData.offeredProperties[0];
  const req0 = tradeData.requestedProperties[0];
  if (off0 !== undefined && req0 !== undefined) {
    return {
      type: 'INTENT_TRADE_OFFER',
      sellerId: tradeData.targetPlayerId,
      buyerId: myId,
      cellIndex: req0,
      offeredCellIndex: off0,
      price: (tradeData.cashOffer || 0) - (tradeData.cashRequest || 0),
    };
  }
  if (off0 !== undefined) {
    return {
      type: 'INTENT_TRADE_OFFER',
      sellerId: myId,
      buyerId: tradeData.targetPlayerId,
      cellIndex: off0,
      price: tradeData.cashRequest || tradeData.cashOffer || 1000,
    };
  }
  if (req0 !== undefined) {
    return {
      type: 'INTENT_TRADE_OFFER',
      sellerId: tradeData.targetPlayerId,
      buyerId: myId,
      cellIndex: req0,
      price: tradeData.cashOffer || tradeData.cashRequest || 1000,
    };
  }
  return null;
}

export function resolveAvailableTradePartners(
  myId: string,
  playersInfo: Record<string, PlayerHudInfo>,
  slots?: readonly { playerId?: string | null; botPersonality?: string }[]
): Array<{
  id: string;
  name: string;
  balance: number;
  isBot: boolean;
  personality?: string;
  properties: readonly number[];
}> {
  return Object.keys(playersInfo)
    .filter((id) => id !== myId)
    .map((id) => {
      const p = playersInfo[id];
      const slot = slots?.find((s) => s.playerId === id);
      return {
        id,
        name: p?.name ?? id,
        balance: p?.balance ?? 0,
        isBot: Boolean(p?.isBot),
        personality: p?.personality ?? slot?.botPersonality,
        properties: p?.ownedProperties ?? [],
      };
    });
}

export function TradeModalHost(props: TradeModalHostProps): React.ReactElement {
  const { payload, myId, myPlayer, playersInfo, onIntent, closeModal, updateModalPayload } = props;
  const currentTargetId = payload.targetPlayerId;
  const slots = useLobbyStore.getState().slots;
  const availablePartners = resolveAvailableTradePartners(myId, playersInfo, slots);
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
      initialOffered={payload.offeredProperties}
      initialRequested={payload.requestedProperties}
      initialCashOffer={payload.cashOffer}
      initialCashRequest={payload.cashRequest}
      onSubmitTrade={(tradeData) => {
        AudioEngine.playSfx(SoundEffect.TRADE_SUCCESS);
        const intent = buildTradeOfferIntent(myId, tradeData);
        if (intent) {
          onIntent?.(intent);
        }
        closeModal();
      }}
      onClose={closeModal}
    />
  );
}
