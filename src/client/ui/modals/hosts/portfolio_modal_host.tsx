// [IMP-335] PortfolioModalHost — Extracted sub-host for player property & bond portfolio modal
import React from 'react';
import type { PlayerHudInfo } from '../../../store/game_store_types';
import type { PlayerIntent } from '../../../../server/intent_dispatcher';
import type { ClientMarketModifier } from '../../../store/game_store_subtypes';
import { useGameStore } from '../../../store/game_store';
import { PropertyPortfolioModal } from '../property_portfolio_modal';
import { calculatePlayerNetWorth } from '../../ui_helpers';

export interface PortfolioModalHostProps {
  readonly myId: string;
  readonly myPlayer?: PlayerHudInfo | null;
  readonly playersInfo: Record<string, PlayerHudInfo>;
  readonly isTradeFrozen?: boolean;
  readonly activeModifiers?: ReadonlyArray<ClientMarketModifier>;
  readonly currentTurnPlayerId?: string | null;
  readonly onIntent?: (intent: PlayerIntent) => void;
  readonly closeModal: () => void;
}

export function PortfolioModalHost(props: PortfolioModalHostProps): React.ReactElement {
  const { myId, myPlayer, playersInfo, isTradeFrozen, activeModifiers, currentTurnPlayerId, onIntent, closeModal } = props;
  const store = useGameStore.getState();
  const owned = myPlayer?.ownedProperties ?? [];
  const unmortgagedCount = owned.filter((idx) => !myPlayer?.mortgagedProperties?.includes(idx)).length;
  const playerNW = calculatePlayerNetWorth(
    myPlayer?.balance ?? 0,
    owned,
    store.levelMap,
    myPlayer?.mortgagedProperties ?? [],
    myPlayer?.mortgageLoans,
  );
  const propertyStates = Object.fromEntries(
    owned.map((idx) => [
      idx,
      {
        ownerId: myId,
        level: store.levelMap[idx] ?? 0,
        isMortgaged: Boolean(myPlayer?.mortgagedProperties?.includes(idx)),
      },
    ])
  );

  const handleClose = () => {
    useGameStore.getState().setCameraFocusCell(null);
    closeModal();
  };

  return React.createElement(
    'div',
    {
      'data-testid': 'portfolio-modal-host',
      'data-player-name': myPlayer?.name,
      className: 'contents',
      onClose: handleClose,
    },
    myPlayer?.name ? React.createElement('span', { className: 'sr-only' }, myPlayer.name) : null,
    React.createElement(PropertyPortfolioModal, {
      ownedProperties: owned,
      isTradeFrozen,
      activeModifiers,
      propertyStates,
      currentBalance: myPlayer?.balance ?? 0,
      playerNetWorth: playerNW,
      unmortgagedPropertiesCount: unmortgagedCount,
      bondContract: myPlayer?.bondContract,
      isInInsolvency: store.activeModal === 'insolvency' || (myPlayer?.balance ?? 0) < 0,
      isMyTurn: currentTurnPlayerId === myId,
      turnPhase: store.turnPhase,
      allPlayers: playersInfo,
      onIssueBond: (trancheId) => onIntent?.({ type: 'INTENT_ISSUE_BOND', trancheId }),
      onRepayBond: () => onIntent?.({ type: 'INTENT_REPAY_BOND' }),
      onQuickTrade: (targetPlayerId, targetPropertyIndex) => {
        closeModal();
        useGameStore.getState().openModal('trade', {
          targetPlayerId,
          offeredProperties: [],
          requestedProperties: [targetPropertyIndex],
          cashOffer: 0,
          cashRequest: 0,
        });
      },
      onViewVacantCell: (cellIndex) => {
        closeModal();
        useGameStore.getState().setCameraFocusCell(cellIndex);
        useGameStore.getState().openModal('deed', {
          cellIndex,
          canBuy: false,
          ownedProperties: myPlayer?.ownedProperties,
        });
      },
      onUpgrade: (cellIndex) => onIntent?.({ type: 'INTENT_UPGRADE', cellIndex }),
      onHoverCell: (cellIndex) => useGameStore.getState().setCameraFocusCell(cellIndex),
      onSelectDeed: (cellIndex) => {
        closeModal();
        useGameStore.getState().openModal('deed', {
          cellIndex,
          canBuy: false,
          ownedProperties: myPlayer?.ownedProperties,
        });
      },
      onMortgage: (cellIndex) => onIntent?.({ type: 'INTENT_MORTGAGE', cellIndex }),
      onRedeem: (cellIndex) => onIntent?.({ type: 'INTENT_REDEEM', cellIndex }),
      onDowngrade: (cellIndex) => onIntent?.({ type: 'INTENT_DOWNGRADE', cellIndex }),
      onAutoSolvency: () => onIntent?.({ type: 'INTENT_AUTO_SOLVENCY' }),
      onClose: handleClose,
    })
  );
}
