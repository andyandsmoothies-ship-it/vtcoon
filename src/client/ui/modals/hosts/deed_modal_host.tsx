// [IMP-248] Extracted DeedModalHost from modal_host.tsx to respect Tier 2 LOC ceiling (<= 400 LOC)
import React from 'react';
import { TitleDeedModal } from '../title_deed_modal';
import { resolveTitleDeedModalState } from '../title_deed_affordance';
import { useGameStore, type ModalPayloadMap } from '../../../store/game_store';
import type { PlayerHudInfo } from '../../../store/game_store_types';
import { AudioEngine } from '../../../audio/audio_engine';
import { SoundEffect } from '../../../audio/audio_types';
import type { PlayerIntent } from '../../../../server/intent_dispatcher';

export interface DeedModalHostProps {
  readonly payload: ModalPayloadMap['deed'];
  readonly myId: string;
  readonly myPlayer?: PlayerHudInfo | null;
  readonly playersInfo: Record<string, PlayerHudInfo>;
  readonly onIntent?: (intent: PlayerIntent) => void;
  readonly closeModal: () => void;
  readonly updateModalPayload: <K extends keyof ModalPayloadMap>(payload: Partial<ModalPayloadMap[K]>) => void;
}

let isBuySubmitting = false;

export function resetBuySubmitting(): void {
  isBuySubmitting = false;
}

export function canAffordDeedPurchase(canBuy: boolean, isSubmitting: boolean): boolean {
  return canBuy && !isSubmitting;
}

export function DeedModalHost({
  payload,
  myId,
  myPlayer,
  playersInfo,
  onIntent,
  closeModal,
  updateModalPayload,
}: DeedModalHostProps): React.ReactElement {
  const deedState = resolveTitleDeedModalState({
    cellIndex: payload.cellIndex,
    canBuyOverride: payload.canBuy,
    isBuyOpportunityOverride: payload.isBuyOpportunity,
    myId,
    myPlayer,
    playersInfo,
    levelMap: useGameStore.getState().levelMap,
    propertyStates: useGameStore.getState().propertyStates,
    activeModifiers: useGameStore.getState().activeModifiers,
    turnPhase: useGameStore.getState().turnPhase,
    currentTurnPlayerId: useGameStore.getState().currentTurnPlayerId,
  });

  return (
    <TitleDeedModal
      cellIndex={payload.cellIndex}
      canBuy={canAffordDeedPurchase(deedState.canBuy, isBuySubmitting)}
      isBuyOpportunity={deedState.isBuyOpportunity}
      shortfall={deedState.shortfall}
      canCoverWithMortgage={deedState.canCoverWithMortgage}
      totalMortgageCapacity={deedState.totalMortgageCapacity}
      onOpenMortgage={() => useGameStore.getState().openModal('portfolio', { playerId: myId, targetPurchaseCellIndex: payload.cellIndex })}
      isOwned={Boolean(deedState.owner)}
      isOwner={deedState.isOwner}
      isMortgaged={deedState.isMortgaged}
      ownerName={deedState.ownerName}
      currentLevel={deedState.currentLevel}
      upgradeCost={deedState.upgradeCost}
      hasMonopoly={deedState.hasMonopoly}
      upgradeBlockedReason={deedState.upgradeBlockedReason}
      downgradeBlockedReason={deedState.downgradeBlockedReason}
      isUpgradedUtility={deedState.isUpgradedUtility}
      isETC={deedState.isETC}
      buyerBalance={myPlayer?.balance ?? 0}
      buyerId={myId}
      allPlayers={playersInfo}
      onBuy={() => {
        if (isBuySubmitting) return;
        isBuySubmitting = true;
        AudioEngine.playSfx(SoundEffect.BUY_PROPERTY);
        onIntent?.({ type: 'INTENT_BUY_PROPERTY' });
        closeModal();
        setTimeout(() => { isBuySubmitting = false; }, 300);
      }}
      onUpgrade={() => {
        if (deedState.isUtility) {
          onIntent?.({ type: 'INTENT_UPGRADE_UTILITY', cellIndex: payload.cellIndex });
        } else if (deedState.isRailroad) {
          onIntent?.({ type: 'INTENT_UPGRADE_ETC', cellIndex: payload.cellIndex });
        } else {
          onIntent?.({ type: 'INTENT_UPGRADE', cellIndex: payload.cellIndex });
        }
        closeModal();
      }}
      onDowngrade={() => { onIntent?.({ type: 'INTENT_DOWNGRADE', cellIndex: payload.cellIndex }); closeModal(); }}
      onMortgage={() => { onIntent?.({ type: 'INTENT_MORTGAGE', cellIndex: payload.cellIndex }); closeModal(); }}
      onRedeem={() => { onIntent?.({ type: 'INTENT_REDEEM', cellIndex: payload.cellIndex }); closeModal(); }}
      onPass={() => { onIntent?.({ type: 'INTENT_DECLINE' }); closeModal(); }}
      ownedProperties={myPlayer?.ownedProperties}
      onSelectCell={(nextIdx) => updateModalPayload<'deed'>({ cellIndex: nextIdx })}
      onClose={closeModal}
    />
  );
};
