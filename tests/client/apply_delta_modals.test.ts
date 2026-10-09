// [IMP-304] Living Contract Tests: Apply Delta Modals
import { describe, it, expect, beforeEach } from 'vitest';
import {
  consumeStagedTransitWheel,
  resetStagedTransitWheel,
  syncAuctionModal,
  syncOtherModals,
  syncBusinessModals,
} from '../../src/client/network/apply_delta_modals.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { TurnPhase } from '../../src/domain/room.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

describe('Station 1 Contract Tests: ApplyDeltaModals', () => {
  beforeEach(() => {
    resetStagedTransitWheel();
    useGameStore.getState().closeModal();
    useLobbyStore.getState().setMyPlayerId('p1');
  });

  it('TC-ADM-MOD.01 [UC-ADM-MOD/MSS] consumeStagedTransitWheel returns null when nothing is staged', () => {
    expect(consumeStagedTransitWheel()).toBeNull();
  });

  it('TC-ADM-MOD.02 [UC-ADM-MOD/MSS] consumeStagedTransitWheel stages wheel when player is moving', () => {
    useGameStore.getState().setIsRolling(true);
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      pendingTransitWheel: { playerId: 'p1', cellIndex: 5, timestamp: 12345 },
    };
    syncOtherModals(delta, useGameStore.getState());
    expect(consumeStagedTransitWheel(99, 'p1')).toBeNull();
    const staged = consumeStagedTransitWheel(5, 'p1');
    expect(staged?.cellIndex).toBe(5);
  });

  it('TC-ADM-MOD.03 [UC-ADM-MOD/MSS] consumeStagedTransitWheel consumes and clears staging', () => {
    useGameStore.getState().setIsRolling(true);
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      pendingTransitWheel: { playerId: 'p1', cellIndex: 5, timestamp: 12345 },
    };
    syncOtherModals(delta, useGameStore.getState());
    consumeStagedTransitWheel(5, 'p1');
    expect(consumeStagedTransitWheel(5, 'p1')).toBeNull();
  });

  it('TC-ADM-MOD.04 [UC-ADM-MOD/MSS] resetStagedTransitWheel explicitly zeroes staged wheel', () => {
    useGameStore.getState().setIsRolling(true);
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      pendingTransitWheel: { playerId: 'p1', cellIndex: 5, timestamp: 12345 },
    };
    syncOtherModals(delta, useGameStore.getState());
    resetStagedTransitWheel();
    expect(consumeStagedTransitWheel()).toBeNull();
  });

  it('TC-ADM-MOD.05 [UC-ADM-MOD/MSS] syncAuctionModal opens auction modal when auction payload is present', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      auction: { cellIndex: 12, currentBid: 1000, highestBidderId: 'bot_2', timeRemaining: 15 },
    };
    syncAuctionModal(delta, useGameStore.getState());
    expect(useGameStore.getState().activeModal).toBe('auction');
    const deadline = (useGameStore.getState().modalPayload as { deadline?: number })?.deadline;
    expect(deadline).toBeGreaterThan(Date.now() - 1000);
  });

  it('TC-ADM-MOD.06 [UC-ADM-MOD/MSS] syncAuctionModal closes auction modal when auction is null', () => {
    useGameStore.getState().openModal('auction', { cellIndex: 12, currentBid: 1000, highestBidderId: null, timeRemaining: 10 });
    const delta: DeltaPayload = { tick: 1, cells: [], auction: null };
    syncAuctionModal(delta, useGameStore.getState());
    expect(useGameStore.getState().activeModal).toBeNull();
  });

  it('TC-ADM-MOD.07 [UC-ADM-MOD/MSS] syncAuctionModal respects dismissedAuctionCellIndex', () => {
    useGameStore.getState().setDismissedAuctionCellIndex?.(12);
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      auction: { cellIndex: 12, currentBid: 1000, highestBidderId: null, timeRemaining: 10 },
    };
    syncAuctionModal(delta, useGameStore.getState());
    expect(useGameStore.getState().activeModal).toBeNull();
  });

  it('TC-ADM-MOD.08 [UC-ADM-MOD/MSS] syncOtherModals handles pendingTradeOffer for target player', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      pendingTradeOffer: {
        offerId: 'offer_1',
        cellIndex: 3,
        price: 1000,
        buyerId: 'bot_2',
        sellerId: 'p1',
        targetPlayerId: 'p1',
        requesterId: 'bot_2',
        expiresAt: Date.now() + 10000,
      },
    };
    syncOtherModals(delta, useGameStore.getState());
    expect(useGameStore.getState().pendingTradeOffer?.offerId).toBe('offer_1');
  });

  it('TC-ADM-MOD.09 [UC-ADM-MOD/MSS] syncOtherModals opens compulsory_buyout when not moving and buyer is me', () => {
    useGameStore.getState().setIsRolling(false);
    useGameStore.getState().clearActivePawnAnimation();
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      pendingBuyout: {
        cellIndex: 5,
        buyerId: 'p1',
        sellerId: 'bot_2',
        cost: 1500,
        basePrice: 1000,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10000,
      },
    };
    syncOtherModals(delta, useGameStore.getState());
    expect(useGameStore.getState().activeModal).toBe('compulsory_buyout');
  });

  it('TC-ADM-MOD.10 [UC-ADM-MOD/MSS] syncOtherModals updates lastHoseResult in active modal', () => {
    useGameStore.getState().openModal('hose', {});
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      lastHoseResult: { playerId: 'p1', roll: 5, payout: 200, multiplier: 2, profit: 100, stake: 100, timestamp: Date.now() },
    };
    syncOtherModals(delta, useGameStore.getState());
    const payload = useGameStore.getState().modalPayload as { lastDiceRoll?: number } | null;
    expect(payload?.lastDiceRoll).toBe(5);
  });

  it('TC-ADM-MOD.11 [UC-ADM-MOD/MSS] syncOtherModals closes deed modal when turnPhase leaves ActionPhase', () => {
    useGameStore.getState().openModal('deed', { cellIndex: 1 });
    const delta: DeltaPayload = { tick: 1, cells: [], turnPhase: TurnPhase.WaitingRoll };
    syncOtherModals(delta, useGameStore.getState());
    expect(useGameStore.getState().activeModal).toBeNull();
  });

  it('TC-ADM-MOD.12 [UC-ADM-MOD/MSS] syncBusinessModals orchestrates both auction and other modals', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      auction: { cellIndex: 8, currentBid: 500, highestBidderId: null, timeRemaining: 10 },
    };
    syncBusinessModals(delta, useGameStore.getState());
    expect(useGameStore.getState().activeModal).toBe('auction');
  });

  it('TC-ADM-MOD.13 [UC-ADM-MOD/MSS] syncOtherModals closes insolvency modal when debtor is solvent', () => {
    useGameStore.getState().openModal('insolvency', { playerId: 'p1', deficit: 500 });
    useGameStore.setState({
      playersInfo: {
        p1: { id: 'p1', name: 'P1', balance: 500, bankrupt: false, tokenColor: '#ff0000', ownedProperties: [] },
      },
    });
    const delta: DeltaPayload = { tick: 1, cells: [], turnPhase: TurnPhase.WaitingRoll };
    syncOtherModals(delta, useGameStore.getState());
    expect(useGameStore.getState().activeModal).toBeNull();
  });

  it('TC-ADM-MOD.14 [UC-ADM-MOD/MSS] syncOtherModals updates transit wheel outcome for player', () => {
    useGameStore.getState().openModal('transit_wheel', { playerId: 'p1', cellIndex: 10 });
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      lastTransitResult: { playerId: 'p1', cellIndex: 10, outcome: 'payout', payout: 300 },
    };
    syncOtherModals(delta, useGameStore.getState());
    const payload = useGameStore.getState().modalPayload as { outcome?: string; payout?: number } | null;
    expect(payload?.outcome).toBe('payout');
    expect(payload?.payout).toBe(300);
  });

  it('TC-ADM-MOD.15 [UC-ADM-MOD/MSS] syncAuctionModal sets hasPassed when player is in passedPlayerIds', () => {
    useLobbyStore.getState().setMyPlayerId('p1');
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      auction: {
        cellIndex: 12,
        currentBid: 1000,
        highestBidderId: 'bot_2',
        passedPlayerIds: ['p1'],
        timeRemaining: 15,
      },
    };
    syncAuctionModal(delta, useGameStore.getState());
    const payload = useGameStore.getState().modalPayload as { hasPassed?: boolean } | null;
    expect(payload?.hasPassed).toBe(true);
  });

  it('TC-ADM-MOD.16 [UC-ADM-MOD/MSS] syncAuctionModal retains hasPassed from prevPayload across updates', () => {
    useLobbyStore.getState().setMyPlayerId('p1');
    useGameStore.getState().openModal('auction', {
      cellIndex: 12,
      currentBid: 1000,
      highestBidderId: 'bot_2',
      hasPassed: true,
      timeRemaining: 10,
    });
    const delta: DeltaPayload = {
      tick: 2,
      cells: [],
      auction: {
        cellIndex: 12,
        currentBid: 1200,
        highestBidderId: 'bot_3',
        passedPlayerIds: [],
        timeRemaining: 8,
      },
    };
    syncAuctionModal(delta, useGameStore.getState());
    const payload = useGameStore.getState().modalPayload as { hasPassed?: boolean } | null;
    expect(payload?.hasPassed).toBe(true);
  });

  it('TC-ADM-MOD.17 [UC-ADM-MOD/MSS] syncOtherModals suppresses compulsory_buyout modal during card flow', () => {
    useLobbyStore.getState().setMyPlayerId('p1');
    useGameStore.getState().closeModal();
    useGameStore.getState().setIsRolling(false);
    useGameStore.getState().clearActivePawnAnimation();
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      lastEventCard: {
        id: 'c1',
        type: 'Chance',
        title: 'Card',
        description: 'Test card',
      },
      pendingBuyout: {
        cellIndex: 5,
        buyerId: 'p1',
        sellerId: 'bot_2',
        cost: 1500,
        basePrice: 1000,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10000,
      },
    };
    syncOtherModals(delta, useGameStore.getState());
    expect(useGameStore.getState().activeModal).toBeNull();
  });
});
