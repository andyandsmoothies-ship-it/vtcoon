// [UI-S02/MSS][TC-DSB] DiceScoreBadge & HudContainer Visibility Contract Tests
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, beforeEach } from 'vitest';
import { DiceScoreBadge } from '../../src/client/ui/dice_score_badge';
import { HudContainer } from '../../src/client/ui/hud_container';
import { useGameStore } from '../../src/client/store/game_store';
import { INITIAL_GAME_STATE } from '../../src/client/store/game_store_types';
import { TurnPhase } from '../../src/domain/room';

describe('[UC-IMP196-BUGFIX] DiceScoreBadge Visibility & Entry Guard Tests', () => {
  beforeEach(() => {
    useGameStore.setState({
      ...INITIAL_GAME_STATE,
      hasRolledThisTurn: false,
      turnPhase: TurnPhase.WaitingRoll,
      dice: [1, 1],
      isRolling: false,
    });
  });

  // --------------------------------------------------------------------------
  // Unit Contract: DiceScoreBadge Direct Guard Invariants
  // --------------------------------------------------------------------------
  it('[TC-DSB.01/MSS] Ẩn badge khi hasRolledThisTurn = false dù dice mặc định là [1, 1]', () => {
    const html = renderToStaticMarkup(
      React.createElement(DiceScoreBadge, {
        dice: [1, 1],
        isRolling: false,
        isVisible: true,
        hasRolledThisTurn: false,
        turnPhase: TurnPhase.WaitingRoll,
      })
    );
    expect(html).toBe('');
  });

  it('[TC-DSB.02/MSS] Default prop hasRolledThisTurn là false (opt-in display) — ẩn khi consumer không truyền prop', () => {
    const htmlDefault = renderToStaticMarkup(
      React.createElement(DiceScoreBadge, {
        dice: [2, 5],
        isRolling: false,
        isVisible: true,
      })
    );
    expect(htmlDefault).toBe('');
  });

  it('[TC-DSB.03/MSS] Ẩn badge khi turnPhase = WaitingRoll (chờ người chơi đổ lượt mới)', () => {
    const html = renderToStaticMarkup(
      React.createElement(DiceScoreBadge, {
        dice: [2, 5],
        isRolling: false,
        isVisible: true,
        hasRolledThisTurn: false,
        turnPhase: TurnPhase.WaitingRoll,
      })
    );
    expect(html).toBe('');
  });

  it('[TC-DSB.04/MSS] Ẩn badge khi isRolling = true (xúc xắc đang xoay 3D)', () => {
    const html = renderToStaticMarkup(
      React.createElement(DiceScoreBadge, {
        dice: [3, 4],
        isRolling: true,
        isVisible: true,
        hasRolledThisTurn: true,
        turnPhase: TurnPhase.ActionPhase,
      })
    );
    expect(html).toBe('');
  });

  it('[TC-DSB.05/MSS] Ẩn badge khi isVisible = false', () => {
    const html = renderToStaticMarkup(
      React.createElement(DiceScoreBadge, {
        dice: [4, 4],
        isRolling: false,
        isVisible: false,
        hasRolledThisTurn: true,
        turnPhase: TurnPhase.ActionPhase,
      })
    );
    expect(html).toBe('');
  });

  it('[TC-DSB.06/MSS] Ẩn badge khi mặt xúc xắc <= 0', () => {
    const html = renderToStaticMarkup(
      React.createElement(DiceScoreBadge, {
        dice: [0, 0],
        isRolling: false,
        isVisible: true,
        hasRolledThisTurn: true,
        turnPhase: TurnPhase.ActionPhase,
      })
    );
    expect(html).toBe('');
  });

  it('[TC-DSB.07/MSS] Hiển thị điểm số khi hasRolledThisTurn = true và phase khác WaitingRoll', () => {
    const html = renderToStaticMarkup(
      React.createElement(DiceScoreBadge, {
        dice: [2, 4],
        isRolling: false,
        isVisible: true,
        hasRolledThisTurn: true,
        turnPhase: TurnPhase.ActionPhase,
      })
    );
    expect(html).toContain('🎲 2 + 4 = 6');
    expect(html).not.toContain('Đôi!');
  });

  it('[TC-DSB.08/MSS] Hiển thị huy hiệu Đôi khi hai mặt xúc xắc bằng nhau', () => {
    const html = renderToStaticMarkup(
      React.createElement(DiceScoreBadge, {
        dice: [3, 3],
        isRolling: false,
        isVisible: true,
        hasRolledThisTurn: true,
        turnPhase: TurnPhase.ActionPhase,
      })
    );
    expect(html).toContain('🎲 3 + 3 = 6 (Đôi! 🎉)');
  });

  // --------------------------------------------------------------------------
  // Integration Contract: HudContainer Initial State & Mobile Entry Safety
  // --------------------------------------------------------------------------
  it('[TC-DSB.09/MSS] HudContainer: Vừa vào phòng (INITIAL_GAME_STATE), KHÔNG hiển thị 1 + 1 = 2 đôi', () => {
    useGameStore.setState({
      ...INITIAL_GAME_STATE,
      hasRolledThisTurn: false,
      turnPhase: TurnPhase.WaitingRoll,
      dice: [1, 1],
      isRolling: false,
    });

    const html = renderToStaticMarkup(React.createElement(HudContainer, { localPlayerId: 'p1' }));
    expect(html).not.toContain('data-testid="dice-score-badge"');
    expect(html).not.toContain('1 + 1 = 2');
    expect(html).not.toContain('(Đôi! 🎉)');
  });

  it('[TC-DSB.10/MSS] HudContainer: Sau khi gieo xúc xắc thành công trong ActionPhase, hiển thị huy hiệu điểm số', () => {
    useGameStore.setState({
      ...INITIAL_GAME_STATE,
      hasRolledThisTurn: true,
      turnPhase: TurnPhase.ActionPhase,
      dice: [4, 5],
      isRolling: false,
    });

    const html = renderToStaticMarkup(React.createElement(HudContainer, { localPlayerId: 'p1' }));
    expect(html).toContain('data-testid="dice-score-badge"');
    expect(html).toContain('🎲 4 + 5 = 9');
  });

  it('[TC-DSB.11/MSS] HudContainer: Chuyển sang lượt mới WaitingRoll, badge tự động ẩn', () => {
    useGameStore.setState({
      ...INITIAL_GAME_STATE,
      hasRolledThisTurn: false,
      turnPhase: TurnPhase.WaitingRoll,
      dice: [4, 5],
      isRolling: false,
    });

    const html = renderToStaticMarkup(React.createElement(HudContainer, { localPlayerId: 'p1' }));
    expect(html).not.toContain('data-testid="dice-score-badge"');
  });
});
