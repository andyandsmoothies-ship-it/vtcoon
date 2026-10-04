// [DEFECT-FIX] Transit Wheel Tick Inflation & Milestone Banner Modal Decoupling Contract Suite
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  detectTransitActivities,
  resetTransitActivityTracker,
} from '../../src/client/network/activity_transit_tracker.js';
import {
  useGameStore,
  FloatingTextType,
  type FloatingTextItem,
  type GameState,
} from '../../src/client/store/game_store.js';
import { FloatingNumbersOverlay } from '../../src/client/ui/floating_numbers.js';
import { TransitWheelOutcome } from '../../src/domain/transit_wheel.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    playersInfo: {
      p1: {
        id: 'p1',
        name: 'Đại Gia Sài Gòn',
        balance: 10000,
        tokenColor: '#38BDF8',
        ownedProperties: [],
      },
    },
    floatingTexts: [],
    activeModal: null,
    activeModifiers: [],
    currentTurnPlayerId: 'p1',
    ...overrides,
  };
}

describe('[TRANSIT-FIX] Transit Wheel Defect Mitigation Contract Suite', () => {
  beforeEach(() => {
    resetTransitActivityTracker();
    useGameStore.setState({
      activeModal: null,
      floatingTexts: [],
      activeModifiers: [],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Gòn',
          balance: 10000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
        },
      },
    });
  });

  it('[TC-FIX-TRANSIT.01/MSS] detectTransitActivities: mien nhiem voi Tick Inflation khi delta.tick tang trong cung mot luot', () => {
    const prevState = createMockGameState();
    const nextState = createMockGameState();

    const transitResult = {
      playerId: 'p1',
      cellIndex: 5,
      outcome: TransitWheelOutcome.SPEED_BOOST,
      targetCell: 9,
      boostSteps: 4,
    };

    // Tick 10: Quay xong
    const deltaTick10: DeltaPayload = {
      tick: 10,
      roundNumber: 1,
      cells: [],
      lastTransitResult: transitResult,
    };

    const firstLogs = detectTransitActivities(deltaTick10, prevState, nextState);
    expect(firstLogs).toHaveLength(1);
    expect(firstLogs[0]?.type).toBe('transit');

    // Tick 11: Quan co di chuyen buoc 2 (cung mot ket qua quay, nhung tick da tang)
    const deltaTick11: DeltaPayload = {
      tick: 11,
      roundNumber: 1,
      cells: [],
      lastTransitResult: transitResult,
    };

    const secondLogs = detectTransitActivities(deltaTick11, prevState, nextState);
    expect(secondLogs).toHaveLength(0);
  });

  it('[TC-FIX-TRANSIT.02/MSS] detectTransitActivities: reset key khi delta.lastTransitResult === null va cho phep ghi nhan o luot tiep theo', () => {
    const prevState = createMockGameState();
    const nextState = createMockGameState();

    const transitResult = {
      playerId: 'p1',
      cellIndex: 5,
      outcome: TransitWheelOutcome.SPEED_BOOST,
      targetCell: 9,
      boostSteps: 4,
    };

    // Reset khi server gui delta.lastTransitResult === null
    const deltaNull: DeltaPayload = {
      tick: 12,
      roundNumber: 1,
      cells: [],
      lastTransitResult: null,
    };
    const nullLogs = detectTransitActivities(deltaNull, prevState, nextState);
    expect(nullLogs).toHaveLength(0);

    // Luot tiep theo (Round 2): Quay lai cung ket qua thi duoc ghi nhan hop le
    const deltaRound2: DeltaPayload = {
      tick: 20,
      roundNumber: 2,
      cells: [],
      lastTransitResult: transitResult,
    };
    const round2Logs = detectTransitActivities(deltaRound2, prevState, nextState);
    expect(round2Logs).toHaveLength(1);
  });

  it('[TC-FIX-TRANSIT.03/MSS] FloatingNumbersOverlay: hien thi MilestoneBanner khi activeModal === deed va an cac badge thuong', () => {
    const transitMilestone: FloatingTextItem = {
      id: 'ft_transit_milestone',
      text: 'Tốc Hành: Bay 4 ô',
      type: FloatingTextType.Reward,
      playerId: 'p1',
      actionType: 'transit',
      title: 'VÒNG XOAY VẬN TẢI',
      timestamp: Date.now(),
    };

    const regularToast: FloatingTextItem = {
      id: 'ft_regular_cash',
      text: '-500 Tr.',
      type: FloatingTextType.Penalty,
      playerId: 'p1',
      actionType: 'rent',
      title: 'Trả tiền thuê',
      timestamp: Date.now(),
    };

    useGameStore.setState({
      activeModal: 'deed',
      floatingTexts: [transitMilestone, regularToast],
    });

    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    // Milestone banner phai hien thi de nguoi quay quan sat duoc ket qua
    expect(html).toContain('data-testid="milestone-banner-container"');
    expect(html).toContain('VÒNG XOAY VẬN TẢI');
    // Mobile container phai chuyen len top-14 de khong va cham voi DeedModal o day man hinh
    expect(html).toContain('top-14');
    // Cac toast bien dong tien te thong thuong phai bi an khi dang mo modal
    expect(html).not.toContain('Trả tiền thuê');
  });

  it('[TC-FIX-TRANSIT.04/MSS] FloatingNumbersOverlay: tra ve null khi activeModal !== null va chi co regular toast (bao toan khoang cach modal)', () => {
    const regularToast: FloatingTextItem = {
      id: 'ft_regular_only',
      text: '-1.000 Tr.',
      type: FloatingTextType.Penalty,
      playerId: 'p1',
      actionType: 'buy',
      title: 'Mua BĐS',
      timestamp: Date.now(),
    };

    useGameStore.setState({
      activeModal: 'deed',
      floatingTexts: [regularToast],
    });

    const html = renderToStaticMarkup(React.createElement(FloatingNumbersOverlay));
    expect(html).toBe('');
  });
});
