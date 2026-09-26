// [TC-203.01..06/MSS][UC-IMP203] Contract tests verifying Bankruptcy notification isolation from Debt Relief
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useGameStore, FloatingTextType } from '../../src/client/store/game_store.js';
import { applyPlayerDeltas } from '../../src/client/network/apply_delta_players.js';
import { MilestoneBanner } from '../../src/client/ui/floating_numbers.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

describe('IMP-203: Bankruptcy vs Debt Relief Notification Contract Tests', () => {
  beforeEach(() => {
    useGameStore.getState().resetGameState();
    useGameStore.setState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Hà Nội',
          balance: -2000,
          bankrupt: false,
          tokenColor: '#EF4444',
          ownedProperties: [],
          mortgagedProperties: [],
        },
        p2: {
          id: 'p2',
          name: 'Đại Gia Sài Gòn',
          balance: 5000,
          bankrupt: false,
          tokenColor: '#3B82F6',
          ownedProperties: [],
          mortgagedProperties: [],
        },
      },
      playerPositions: { p1: 10, p2: 0 },
      floatingTexts: [],
    });
  });

  it('[TC-203.01/MSS][UC-IMP203] Bankruptcy delta (negative balance -> 0 with bankrupt: true) does NOT produce debt_relief notification', () => {
    const state = useGameStore.getState();
    const playersInfoMap = { ...state.playersInfo };
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      players: [
        { id: 'p1', balance: 0, bankrupt: true, position: 10 },
      ],
    };

    applyPlayerDeltas(delta, state, playersInfoMap, false);

    const debtReliefItem = useGameStore.getState().floatingTexts.find((t) => t.actionType === 'debt_relief');
    expect(debtReliefItem).toBeUndefined();
  });

  it('[TC-203.02/MSS][UC-IMP203] Bankruptcy delta produces bankrupt notification with actionType = "bankrupt"', () => {
    const state = useGameStore.getState();
    const playersInfoMap = { ...state.playersInfo };
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      players: [
        { id: 'p1', balance: 0, bankrupt: true, position: 10 },
      ],
    };

    applyPlayerDeltas(delta, state, playersInfoMap, false);

    const bankruptItem = useGameStore.getState().floatingTexts.find((t) => t.actionType === 'bankrupt');
    expect(bankruptItem).toBeDefined();
    expect(bankruptItem?.type).toBe(FloatingTextType.Penalty);
    expect(bankruptItem?.title).toContain('phá sản');
  });

  it('[TC-203.03/MSS][UC-IMP203] Genuine debt relief (negative balance -> positive with bankrupt: false) produces debt_relief notification', () => {
    const state = useGameStore.getState();
    const playersInfoMap = { ...state.playersInfo };
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      players: [
        { id: 'p1', balance: 1500, bankrupt: false, position: 10 },
      ],
    };

    applyPlayerDeltas(delta, state, playersInfoMap, false);

    const debtReliefItem = useGameStore.getState().floatingTexts.find((t) => t.actionType === 'debt_relief');
    expect(debtReliefItem).toBeDefined();
    expect(debtReliefItem?.type).toBe(FloatingTextType.Reward);

    const bankruptItem = useGameStore.getState().floatingTexts.find((t) => t.actionType === 'bankrupt');
    expect(bankruptItem).toBeUndefined();
  });

  it('[TC-203.04/MSS][UC-IMP203] game_store.updatePlayerInfo with bankrupt: true does NOT trigger "Thoát vỡ nợ thành công!"', () => {
    useGameStore.getState().updatePlayerInfo('p1', { balance: 0, bankrupt: true });

    const debtReliefToast = useGameStore.getState().floatingTexts.find((t) => t.text.includes('Thoát vỡ nợ'));
    expect(debtReliefToast).toBeUndefined();
  });

  it('[TC-203.05/MSS][UC-IMP203] MilestoneBanner renders bankrupt actionType with rose border styling and alert icon', () => {
    const html = renderToStaticMarkup(
      React.createElement(MilestoneBanner, {
        item: {
          id: 'ft_bankrupt_1',
          timestamp: Date.now(),
          text: 'Tài sản đã thanh lý',
          title: 'ĐÃ PHÁ SẢN',
          actionType: 'bankrupt',
          playerId: 'p1',
          type: FloatingTextType.Penalty,
        },
      }),
    );

    expect(html).toContain('border-rose-500');
    expect(html).toContain('🚨');
    expect(html).toContain('ĐÃ PHÁ SẢN');
  });

  it('[TC-203.06/MSS][UC-IMP203] FullSync delta does NOT emit duplicate bankrupt notification toast', () => {
    const state = useGameStore.getState();
    const playersInfoMap = { ...state.playersInfo };
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      players: [
        { id: 'p1', balance: 0, bankrupt: true, position: 10 },
      ],
    };

    applyPlayerDeltas(delta, state, playersInfoMap, true);

    const items = useGameStore.getState().floatingTexts.filter((t) => t.actionType === 'bankrupt');
    expect(items.length).toBe(0);
  });
});
