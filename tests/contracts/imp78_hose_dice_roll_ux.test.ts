// [TC-IMP78/MSS] Contract Tests for IMP-78: HOSE 1D6 Dice Roll & Result UX
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TurnPhase, type Room, type Player } from '../../src/domain/room';
import { handleHoseInvest } from '../../src/server/hose_actions';
import { buildDeltaFromRoom, type DeltaPayload } from '../../src/server/session_manager';
import { HOSE_OUTCOMES } from '../../src/domain/event_card_types';
import { HoseModal } from '../../src/client/ui/modals/hose_modal';
import { detectFinancialAndStatusActivities } from '../../src/client/network/activity_financial_tracker';
import type { GameState } from '../../src/client/store/game_store';

function createMockRoom(phase: TurnPhase = TurnPhase.HosePhase): { room: Room; player: Player } {
  const player: Player = {
    id: 'p1',
    position: 38,
    balance: 15_000,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    consecutiveDoubles: 0,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
    bankrupt: false,
    isBot: false,
  };
  const room: Room = {
    roomCode: 'TEST01',
    hostId: 'p1',
    players: [player],
    currentPlayerIndex: 0,
    phase,
    started: true,
    activeModifiers: [],
    marketDeck: [],
    marketDiscard: [],
    chanceDeck: [],
    chanceDiscard: [],
    permanentRentBonus: {},
    treasury: 10_000,
    diceSeq: 10,
  };
  return { room, player };
}

describe('[TC-IMP78.1/MSS] Server-Authoritative HOSE Result (SSOT)', () => {
  it('handleHoseInvest ghi nhận đầy đủ cấu trúc lastHoseResult vào room', () => {
    const { room, player } = createMockRoom();
    const rng = () => 0.5; // face = 4 (1.20x)
    const res = handleHoseInvest(room, player, rng, 1000);

    expect(res.success).toBe(true);
    expect(room.lastHoseResult).toBeDefined();
    expect(room.lastHoseResult?.playerId).toBe('p1');
    expect(room.lastHoseResult?.stake).toBe(1000);
    expect(room.lastHoseResult?.roll).toBe(4);
    expect(room.lastHoseResult?.multiplier).toBe(HOSE_OUTCOMES[4]);
    expect(room.lastHoseResult?.payout).toBe(1200);
    expect(room.lastHoseResult?.profit).toBe(200);
    expect(room.lastHoseResult?.diceSeq).toBeGreaterThan(10);
  });

  it('buildDeltaFromRoom đồng bộ lastHoseResult từ Room sang DeltaPayload', () => {
    const { room, player } = createMockRoom();
    const rng = () => 0.0; // face = 1 (0.50x)
    handleHoseInvest(room, player, rng, 2000);

    const delta = buildDeltaFromRoom(room, new Map() as any, new Map() as any, 1);
    expect(delta.lastHoseResult).toBeDefined();
    expect(delta.lastHoseResult?.roll).toBe(1);
    expect(delta.lastHoseResult?.multiplier).toBe(0.50);
    expect(delta.lastHoseResult?.payout).toBe(1000);
    expect(delta.lastHoseResult?.profit).toBe(-1000);
  });
});

describe('[TC-IMP78.2/MSS] HoseModal Result Presentation & Confirmation', () => {
  it('Khi isReviewingResult=true, hiển thị nút Tiếp Tục data-testid="hose-confirm-btn"', () => {
    const html = renderToStaticMarkup(
      React.createElement(HoseModal, {
        myBalance: 15000,
        defaultStake: 1000,
        lastDiceRoll: 6,
        lastPayout: 2000,
        isReviewingResult: true,
        onInvest: () => {},
        onSkip: () => {},
        onClose: () => {},
        onConfirm: () => {},
      })
    );

    expect(html).toContain('data-testid="hose-confirm-btn"');
    expect(html).toContain('Tiếp Tục');
  });

  it('Ô tỷ lệ tương ứng trên ma trận 1D6 được kích hoạt highlight nổi bật', () => {
    const html = renderToStaticMarkup(
      React.createElement(HoseModal, {
        myBalance: 15000,
        defaultStake: 500,
        lastDiceRoll: 5,
        lastPayout: 750,
        isReviewingResult: true,
        onInvest: () => {},
        onSkip: () => {},
        onClose: () => {},
      })
    );

    expect(html).toContain('data-testid="hose-outcome-5"');
    expect(html).toContain('ring-4');
  });
});

describe('[TC-IMP78.3/MSS] Activity Log Định Danh Sự Kiện HOSE', () => {
  it('Khi delta có lastHoseResult, tạo log HOSE chi tiết và triệt tiêu log tiền thưởng mơ hồ', () => {
    const prevState: Partial<GameState> = {
      playersInfo: {
        p1: { id: 'p1', name: 'Đại Gia Chủ Sảnh', balance: 15000, netWorth: 15000, color: '#0284c7' } as any,
      },
    };
    const nextState: Partial<GameState> = {
      playersInfo: {
        p1: { id: 'p1', name: 'Đại Gia Chủ Sảnh', balance: 15600, netWorth: 15600, color: '#0284c7' } as any,
      },
    };
    const delta: Partial<DeltaPayload> = {
      players: [{ id: 'p1', balance: 15600, position: 38 }],
      lastHoseResult: {
        playerId: 'p1',
        stake: 500,
        roll: 4,
        multiplier: 1.20,
        payout: 600,
        profit: 100,
        timestamp: Date.now(),
        diceSeq: 11,
      },
    };

    const logs = detectFinancialAndStatusActivities(
      delta as DeltaPayload,
      prevState as GameState,
      nextState as GameState,
      [],
    );

    const hoseLog = logs.find((l) => l.message.includes('HOSE'));
    expect(hoseLog).toBeDefined();
    expect(hoseLog?.message).toContain('Đại Gia Chủ Sảnh');
    expect(hoseLog?.message).toContain('500');
    expect(hoseLog?.message).toContain('Mặt 4');
    expect(hoseLog?.message).toContain('600');

    const genericRewardLog = logs.find((l) => l.message.includes('tiền thưởng'));
    expect(genericRewardLog).toBeUndefined();
  });
});
