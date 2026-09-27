// [TC-206.01..06/MSS][UC-IMP206] TopBar Bot Turn Declutter — Elimination of Bot Icon and "Đang tính" String
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TopBar } from '../../src/client/ui/top_bar';
import { useGameStore } from '../../src/client/store/game_store';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types';

describe('TopBar Bot Turn Declutter (IMP-206 Contract Suite)', () => {
  beforeEach(() => {
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 40,
      turnTimeRemaining: 45,
      currentTurnPlayerId: 'bot_alpha',
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Player One',
          balance: 10_000,
          tokenColor: '#DC2626',
          ownedProperties: [],
          isBot: false,
        } as PlayerHudInfo,
        bot_alpha: {
          id: 'bot_alpha',
          name: 'Bot Sài Gòn',
          balance: 10_000,
          tokenColor: '#2563EB',
          ownedProperties: [],
          isBot: true,
        } as PlayerHudInfo,
      },
    });
  });

  it('[TC-206.01/MSS][UC-IMP206] Khi là lượt Bot, role="timer" hiển thị icon ⏱️ và tuyệt đối không hiển thị icon 🤖', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar));
    const timerSection = html.match(/<div[^>]*role="timer"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';

    expect(timerSection).toContain('⏱️');
    expect(timerSection).not.toContain('🤖');
  });

  it('[TC-206.02/MSS][UC-IMP206] Khi là lượt Bot, role="timer" hiển thị nhãn "Thời gian:" và không hiển thị "Lượt Bot:"', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar));
    const timerSection = html.match(/<div[^>]*role="timer"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';

    expect(timerSection).toContain('Thời gian:');
    expect(timerSection).not.toContain('Lượt Bot:');
  });

  it('[TC-206.03/MSS][UC-IMP206] Khi là lượt Bot, role="timer" hiển thị đếm ngược thời gian (00:45) thay vì "Đang tính"', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar));
    const timerSection = html.match(/<div[^>]*role="timer"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';

    expect(timerSection).toContain('00:45');
    expect(timerSection).not.toContain('Đang tính');
  });

  it('[TC-206.04/MSS][UC-IMP206] Khi là lượt Bot và turnTimeRemaining <= 10, hiển thị class cảnh báo text-rose-600 animate-pulse', () => {
    useGameStore.setState({ turnTimeRemaining: 8 });
    const html = renderToStaticMarkup(React.createElement(TopBar));
    const timerSection = html.match(/<div[^>]*role="timer"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';

    expect(timerSection).toContain('00:08');
    expect(timerSection).toContain('text-rose-600');
    expect(timerSection).toContain('animate-pulse');
  });

  it('[TC-206.05/MSS][UC-IMP206] Khi là lượt Bot và turnTimeRemaining > 10, hiển thị class text-emerald-700 font-bold', () => {
    useGameStore.setState({ turnTimeRemaining: 30 });
    const html = renderToStaticMarkup(React.createElement(TopBar));
    const timerSection = html.match(/<div[^>]*role="timer"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';

    expect(timerSection).toContain('00:30');
    expect(timerSection).toContain('text-emerald-700');
    expect(timerSection).not.toContain('text-amber-700');
  });

  it('[TC-206.06/MSS][UC-IMP206] Trên toàn bộ match-info-capsule, không còn chuỗi "Đang tính" nào tồn tại', () => {
    const html = renderToStaticMarkup(React.createElement(TopBar));
    const capsuleSection = html.match(/<div[^>]*data-testid="match-info-capsule"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';

    expect(capsuleSection).not.toContain('Đang tính');
  });
});
