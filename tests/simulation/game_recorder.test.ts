import { describe, it, expect } from 'vitest';
import { recordFullGameSession } from './game_session_recorder';
import { BotPersonality } from '../../src/domain/bot/bot_engine';

describe('Game Session Recorder Smoke Verification', () => {
  it('thực thi ghi nhận ván cờ 2 người chơi trọn vẹn từ đầu đến cuối', () => {
    const res = recordFullGameSession(
      2,
      [
        { id: 'p1', name: 'Bác Ba (Thực dụng)', personality: BotPersonality.Aggressive },
        { id: 'p2', name: 'Chú Sáu (Cân bằng)', personality: BotPersonality.Balanced },
      ],
      12345,
      30,
      300,
    );

    expect(res.totalTurns).toBeGreaterThan(10);
    expect(res.turns.length).toBe(res.totalTurns);
    expect(res.winner.name).toBeDefined();
    expect(res.markdownReport.length).toBeGreaterThan(500);
    expect(res.aggregateStats.invariantsPassed).toBe(true);
  });
});
