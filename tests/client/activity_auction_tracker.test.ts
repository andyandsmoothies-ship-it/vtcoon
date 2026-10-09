// [IMP-313] Living Contract Tests: Activity Auction Tracker Subsystem
import { describe, it, expect, beforeEach } from 'vitest';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { useGameStore, type GameState } from '../../src/client/store/game_store.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import {
  detectAuctionActivities,
  resetAuctionActivityTracker,
} from '../../src/client/network/activity_auction_tracker.js';

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    playersInfo: {
      p1: {
        id: 'p1',
        name: 'Đại Gia Sài Gòn',
        balance: 15000,
        tokenColor: '#dc2626',
        ownedProperties: [],
        mortgagedProperties: [],
        isBot: false,
      },
      bot_1: {
        id: 'bot_1',
        name: 'Bot Hà Nội',
        balance: 15000,
        tokenColor: '#2563eb',
        ownedProperties: [],
        mortgagedProperties: [],
        isBot: true,
      },
    },
    auction: null,
    currentTurnPlayerId: 'p1',
    ...overrides,
  };
}

describe('Station 1 Contract Tests: Activity Auction Tracker', () => {
  beforeEach(() => {
    resetAuctionActivityTracker(useActivityStore);
  });

  it('TC-AAT-WIN.01 [UC-AAT/MSS] Given delta.auction null and prior lastAuctionBid, When detected, Then logs hammer win entry and clears cache', () => {
    useActivityStore.getState().setLastAuctionBid({
      cellIndex: 5,
      currentBid: 2500,
      highestBidderId: 'p1',
    });

    const state = createMockGameState();
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      auction: null,
    };

    const entries = detectAuctionActivities(delta, state, state, useActivityStore);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.type).toBe('auction');
    expect(entries[0]?.message.includes('Búa gõ thành công!')).toBe(true);
    expect(entries[0]?.amount).toBe(-2500);
  });

  it('TC-AAT-WIN.02 [UC-AAT/MSS] Given delta.auction null and prior lastAuctionBid, When detected, Then clears lastAuctionBid from store', () => {
    useActivityStore.getState().setLastAuctionBid({
      cellIndex: 5,
      currentBid: 2500,
      highestBidderId: 'p1',
    });

    const state = createMockGameState();
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      auction: null,
    };

    detectAuctionActivities(delta, state, state, useActivityStore);

    expect(useActivityStore.getState().lastAuctionBid).toBeUndefined();
  });

  it('TC-AAT-WIN.03 [UC-AAT/MSS] Given delta.auction null but lastAuctionBid has null highestBidderId, When detected, Then returns empty array', () => {
    useActivityStore.getState().setLastAuctionBid({
      cellIndex: 5,
      currentBid: 0,
      highestBidderId: '',
    });

    const state = createMockGameState();
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      auction: null,
    };

    const entries = detectAuctionActivities(delta, state, state, useActivityStore);

    expect(entries).toHaveLength(0);
  });

  it('TC-AAT-DEC.01 [UC-AAT/MSS] Given bot declinedPlayerId opening new auction, When detected, Then logs decline-to-auction activity', () => {
    const state = createMockGameState();
    const delta: DeltaPayload = {
      tick: 2,
      cells: [],
      auction: {
        cellIndex: 8,
        currentBid: 0,
        highestBidderId: null,
        timeRemaining: 15,
        declinedPlayerId: 'bot_1',
      },
    };

    const entries = detectAuctionActivities(delta, state, state, useActivityStore);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.message.includes('Mở Đấu Giá')).toBe(true);
    expect(entries[0]?.playerId).toBe('bot_1');
  });

  it('TC-AAT-DEC.02 [UC-AAT/MSS] Given prevState.auction on different cell, When bot declines new cell, Then logs decline activity', () => {
    const prevState = createMockGameState({
      auction: {
        cellIndex: 3,
        currentBid: 500,
        highestBidderId: 'p1',
        timeRemaining: 5,
      },
    });
    const nextState = createMockGameState();
    const delta: DeltaPayload = {
      tick: 2,
      cells: [],
      auction: {
        cellIndex: 8,
        currentBid: 0,
        highestBidderId: null,
        timeRemaining: 15,
        declinedPlayerId: 'bot_1',
      },
    };

    const entries = detectAuctionActivities(delta, prevState, nextState, useActivityStore);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.cellIndex).toBe(8);
  });

  it('TC-AAT-BID.01 [UC-AAT/MSS] Given new valid bid in delta.auction, When detected, Then logs bid activity and updates store', () => {
    const state = createMockGameState();
    const delta: DeltaPayload = {
      tick: 3,
      cells: [],
      auction: {
        cellIndex: 8,
        currentBid: 1200,
        highestBidderId: 'p1',
        timeRemaining: 12,
      },
    };

    const entries = detectAuctionActivities(delta, state, state, useActivityStore);

    expect(entries).toHaveLength(1);
    expect(entries[0]?.message.includes('đã đặt giá')).toBe(true);
    expect(entries[0]?.amount).toBe(-1200);
    expect(useActivityStore.getState().lastAuctionBid?.currentBid).toBe(1200);
  });

  it('TC-AAT-DUP.01 [UC-AAT/MSS] Given duplicate auction bid identical to lastAuctionBid, When detected, Then returns empty array', () => {
    useActivityStore.getState().setLastAuctionBid({
      cellIndex: 8,
      currentBid: 1200,
      highestBidderId: 'p1',
    });

    const state = createMockGameState();
    const delta: DeltaPayload = {
      tick: 4,
      cells: [],
      auction: {
        cellIndex: 8,
        currentBid: 1200,
        highestBidderId: 'p1',
        timeRemaining: 10,
      },
    };

    const entries = detectAuctionActivities(delta, state, state, useActivityStore);

    expect(entries).toHaveLength(0);
  });

  it('TC-AAT-RST.01 [UC-AAT/MSS] Given populated bid state, When resetAuctionActivityTracker is called, Then clears lastAuctionBid', () => {
    useActivityStore.getState().setLastAuctionBid({
      cellIndex: 12,
      currentBid: 3000,
      highestBidderId: 'p1',
    });

    resetAuctionActivityTracker(useActivityStore);

    expect(useActivityStore.getState().lastAuctionBid).toBeUndefined();
  });
});
