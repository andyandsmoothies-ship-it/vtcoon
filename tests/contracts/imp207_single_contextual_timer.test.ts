// [TC-207.01..08/MSS][UC-IMP207] Single Contextual Timer & Monotonic Countdown Invariant
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TopBar } from '../../src/client/ui/top_bar';
import { useGameStore } from '../../src/client/store/game_store';
import { useEnvironmentStore } from '../../src/client/store/environment_store';
import { TurnPhase } from '../../src/domain/room';
import { applyDeltaToStore } from '../../src/client/network/apply_delta';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types';

describe('IMP-207: Single Contextual Timer & Monotonic Countdown Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 40,
      turnTimeRemaining: 45,
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      turnPhase: TurnPhase.WaitingRoll,
      auction: undefined,
      pendingTradeOffer: null,
      pendingBuyout: null,
      lastDiceSeq: 10,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Player One',
          balance: 10_000,
          tokenColor: '#DC2626',
          ownedProperties: [],
          isBot: false,
        } as PlayerHudInfo,
        p2: {
          id: 'p2',
          name: 'Player Two',
          balance: 10_000,
          tokenColor: '#2563EB',
          ownedProperties: [],
          isBot: false,
        } as PlayerHudInfo,
      },
    });
    useEnvironmentStore.setState({
      mode: 'auto',
      phase: 'day',
      isAuto: true,
    });
  });

  it('[TC-207.01/MSS][UC-IMP207] Ở lượt bình thường không có sự kiện phụ, TopBar hiển thị role="timer" với icon ⏱️ và chuỗi "Thời gian: 00:45"', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar));
    const timerSection = html.match(/<div[^>]*role="timer"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';

    expect(timerSection).toContain('⏱️');
    expect(timerSection).toContain('Thời gian:');
    expect(timerSection).toContain('00:45');
    expect(html).not.toContain('topbar-subphase-indicator');
  });

  it('[TC-207.02/MSS][UC-IMP207] Khi phiên đấu giá đang diễn ra, TopBar ẩn role="timer" và hiển thị badge tĩnh "Đấu giá" không chứa số giây đếm lùi', () => {
    useGameStore.setState({
      turnPhase: TurnPhase.AuctionPhase,
      auction: {
        cellIndex: 5,
        currentBid: 500,
        highestBidderId: 'p1',
        timeRemaining: 14,
        isConcluded: false,
      },
    });

    const html = renderToStaticMarkup(React.createElement(TopBar));
    expect(html).not.toContain('role="timer"');
    expect(html).toContain('data-testid="topbar-subphase-indicator"');
    expect(html).toContain('🏛️');
    expect(html).toContain('Đấu giá');
    expect(html).not.toContain('00:45');
    expect(html).not.toContain('14');
  });

  it('[TC-207.03/MSS][UC-IMP207] Khi có đề nghị thương lượng Bot, TopBar ẩn role="timer" và hiển thị badge tĩnh "Thương lượng"', () => {
    useGameStore.setState({
      pendingTradeOffer: {
        offerId: 'trade_123',
        sellerId: 'p1',
        buyerId: 'bot_alpha',
        cellIndex: 3,
        price: 1200,
        expiresAt: Date.now() + 15000,
      },
    });

    const html = renderToStaticMarkup(React.createElement(TopBar));
    expect(html).not.toContain('role="timer"');
    expect(html).toContain('data-testid="topbar-subphase-indicator"');
    expect(html).toContain('🤝');
    expect(html).toContain('Thương lượng');
  });

  it('[TC-207.04/MSS][UC-IMP207] Khi có sự kiện Mua Đứt Cưỡng Chế 130%, TopBar ẩn role="timer" và hiển thị badge tĩnh "Mua đứt"', () => {
    useGameStore.setState({
      pendingBuyout: {
        buyerId: 'p2',
        sellerId: 'p1',
        cellIndex: 7,
        cost: 2600,
        basePrice: 2000,
        createdAt: Date.now(),
        expiresAt: Date.now() + 15000,
      },
    });

    const html = renderToStaticMarkup(React.createElement(TopBar));
    expect(html).not.toContain('role="timer"');
    expect(html).toContain('data-testid="topbar-subphase-indicator"');
    expect(html).toContain('🏢');
    expect(html).toContain('Mua đứt');
  });

  it('[TC-207.05/MSS][UC-IMP207] Khi đấu giá kết thúc (auction.isConcluded === true), TopBar tự động phục hồi role="timer" và đồng hồ đếm lượt', () => {
    useGameStore.setState({
      turnPhase: TurnPhase.AuctionPhase,
      auction: {
        cellIndex: 5,
        currentBid: 800,
        highestBidderId: 'p1',
        timeRemaining: 0,
        isConcluded: true,
      },
    });

    const html = renderToStaticMarkup(React.createElement(TopBar));
    expect(html).toContain('role="timer"');
    expect(html).not.toContain('data-testid="topbar-subphase-indicator"');
    expect(html).toContain('00:45');
  });

  it('[TC-207.06/MSS][UC-IMP207] Monotonic Guard tại apply_delta.ts chặn bước nhảy tiến 1s (41s -> 42s) nhưng bảo toàn 100% reset 60s khi đổi Phase hoặc gieo Đôi', () => {
    useGameStore.setState({
      turnTimeRemaining: 41,
      currentTurnPlayerId: 'p1',
      turnPhase: TurnPhase.WaitingRoll,
      lastDiceSeq: 10,
    });

    // 1. Delta cùng phase, cùng diceSeq với timeRemaining = 42s (do lệch pha làm tròn ceil) -> BỊ CHẶN, giữ nguyên 41s
    applyDeltaToStore({
      tick: 101,
      cells: [],
      timeRemaining: 42,
      currentTurnPlayerId: 'p1',
      turnPhase: TurnPhase.WaitingRoll,
      diceSeq: 10,
    });
    expect(useGameStore.getState().turnTimeRemaining).toBe(41);

    // 2. Delta đếm lùi tự nhiên (<= 41s) -> ĐƯỢC CHẤP NHẬN
    applyDeltaToStore({
      tick: 102,
      cells: [],
      timeRemaining: 40,
      currentTurnPlayerId: 'p1',
      turnPhase: TurnPhase.WaitingRoll,
      diceSeq: 10,
    });
    expect(useGameStore.getState().turnTimeRemaining).toBe(40);

    // 3. Delta chuyển phase (WaitingRoll -> ActionPhase) -> BẮT BUỘC ĐƯỢC RESET
    applyDeltaToStore({
      tick: 103,
      cells: [],
      timeRemaining: 42,
      currentTurnPlayerId: 'p1',
      turnPhase: TurnPhase.ActionPhase,
      diceSeq: 10,
    });
    expect(useGameStore.getState().turnTimeRemaining).toBe(42);

    // 4. Delta gieo xúc xắc mới/gieo Đôi (diceSeq: 10 -> 11) -> BẮT BUỘC ĐƯỢC RESET
    useGameStore.setState({ turnTimeRemaining: 59, lastDiceSeq: 10 });
    applyDeltaToStore({
      tick: 104,
      cells: [],
      timeRemaining: 60,
      currentTurnPlayerId: 'p1',
      turnPhase: TurnPhase.ActionPhase,
      diceSeq: 11,
    });
    expect(useGameStore.getState().turnTimeRemaining).toBe(60);
  });

  it('[TC-207.07/MSS][UC-IMP207] Nút time-of-day-toggle-button đổi sang "Ánh sáng:" và không chứa từ "thời gian" trong cả title lẫn aria-label', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar));
    const btnMatch = html.match(/<button[^>]*data-testid="time-of-day-toggle-button"[^>]*>[\s\S]*?<\/button>/)?.[0] ?? '';

    expect(btnMatch).toContain('title="Ánh sáng:');
    expect(btnMatch).toContain('aria-label="Chuyển chu kỳ ánh sáng');
    expect(btnMatch.toLowerCase()).not.toContain('thời gian');
  });

  it('[TC-207.08/MSS][UC-IMP207] resolveTurnPlayerId fallback sang state.playersInfo khi delta.players bị khuyết trong sparse delta', () => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      turnTimeRemaining: 15,
      playersInfo: {
        p1: { id: 'p1', name: 'Player 1' } as any,
        p2: { id: 'p2', name: 'Player 2' } as any,
      },
    });

    // Sparse delta chỉ gửi currentPlayerIndex: 1, khuyết delta.players và currentTurnPlayerId
    applyDeltaToStore({
      tick: 200,
      cells: [],
      currentPlayerIndex: 1,
    });

    expect(useGameStore.getState().currentTurnPlayerId).toBe('p2');
    expect(useGameStore.getState().turnTimeRemaining).toBe(60);
  });
});
