import { describe, it, expect } from 'vitest';
import { recordAdvancedGameSession } from './advanced_game_session_recorder';
import { BotPersonality } from '../../src/domain/bot/bot_engine';
import * as fs from 'fs';
import * as path from 'path';

const UAT_DIR = path.resolve(process.cwd(), 'docs/reports/uat');

describe('Advanced Interactive Features & Random Distributions UAT Suites', () => {
  it('Case 2 Players (Interactive Features & Probabilities)', () => {
    if (!fs.existsSync(UAT_DIR)) {
      fs.mkdirSync(UAT_DIR, { recursive: true });
    }

    const result = recordAdvancedGameSession(
      2,
      [
        { id: 'p1_ba', name: 'Bác Ba (Thực dụng / Aggressive)', personality: BotPersonality.Aggressive },
        { id: 'p2_sau', name: 'Chú Sáu (Cân bằng / Balanced)', personality: BotPersonality.Balanced },
      ],
      9920262,
      30,
      300,
    );

    const targetFile = path.join(UAT_DIR, 'uat_advanced_features_2_players.md');
    fs.writeFileSync(targetFile, result.markdownReport, 'utf-8');

    console.log(`[Advanced 2 Players] Lượt: ${result.totalTurns}, Vòng: ${result.totalRounds}`);
    console.log(`[Advanced 2 Players] Vô địch: ${result.winner.name} (Net Worth: ${result.winner.netWorth.toLocaleString('vi-VN')} Tr.)`);
    console.log(`[Advanced 2 Players] HOSE: ${result.featureUsageStats.totalHoseInvestments} phiên, P2P Trades: ${result.featureUsageStats.totalTradesExecuted}`);
    console.log(`[Advanced 2 Players] Đã lưu báo cáo tại: ${targetFile}`);

    expect(result.totalTurns).toBeGreaterThan(10);
    expect(result.turns.length).toBe(result.totalTurns);
    expect(result.featureUsageStats.invariantsPassed).toBe(true);
    expect(fs.existsSync(targetFile)).toBe(true);
  });

  it('Case 3 Players (Interactive Features & Probabilities)', () => {
    if (!fs.existsSync(UAT_DIR)) {
      fs.mkdirSync(UAT_DIR, { recursive: true });
    }

    const result = recordAdvancedGameSession(
      3,
      [
        { id: 'p1_ba', name: 'Bác Ba (Thực dụng / Aggressive)', personality: BotPersonality.Aggressive },
        { id: 'p2_sau', name: 'Chú Sáu (Cân bằng / Balanced)', personality: BotPersonality.Balanced },
        { id: 'p3_tu', name: 'Cô Tư (Thận trọng / Passive)', personality: BotPersonality.Passive },
      ],
      9920263,
      30,
      300,
    );

    const targetFile = path.join(UAT_DIR, 'uat_advanced_features_3_players.md');
    fs.writeFileSync(targetFile, result.markdownReport, 'utf-8');

    console.log(`[Advanced 3 Players] Lượt: ${result.totalTurns}, Vòng: ${result.totalRounds}`);
    console.log(`[Advanced 3 Players] Vô địch: ${result.winner.name} (Net Worth: ${result.winner.netWorth.toLocaleString('vi-VN')} Tr.)`);
    console.log(`[Advanced 3 Players] HOSE: ${result.featureUsageStats.totalHoseInvestments} phiên, P2P Trades: ${result.featureUsageStats.totalTradesExecuted}`);
    console.log(`[Advanced 3 Players] Đã lưu báo cáo tại: ${targetFile}`);

    expect(result.totalTurns).toBeGreaterThan(10);
    expect(result.turns.length).toBe(result.totalTurns);
    expect(result.featureUsageStats.invariantsPassed).toBe(true);
    expect(fs.existsSync(targetFile)).toBe(true);
  });

  it('Case 4 Players (Interactive Features & Probabilities)', () => {
    if (!fs.existsSync(UAT_DIR)) {
      fs.mkdirSync(UAT_DIR, { recursive: true });
    }

    const result = recordAdvancedGameSession(
      4,
      [
        { id: 'p1_ba', name: 'Bác Ba (Thực dụng / Aggressive)', personality: BotPersonality.Aggressive },
        { id: 'p2_sau', name: 'Chú Sáu (Cân bằng / Balanced)', personality: BotPersonality.Balanced },
        { id: 'p3_tu', name: 'Cô Tư (Thận trọng / Passive)', personality: BotPersonality.Passive },
        { id: 'p4_bo', name: 'Bé Bo (Cạnh tranh / Aggressive)', personality: BotPersonality.Aggressive },
      ],
      9920264,
      30,
      300,
    );

    const targetFile = path.join(UAT_DIR, 'uat_advanced_features_4_players.md');
    fs.writeFileSync(targetFile, result.markdownReport, 'utf-8');

    console.log(`[Advanced 4 Players] Lượt: ${result.totalTurns}, Vòng: ${result.totalRounds}`);
    console.log(`[Advanced 4 Players] Vô địch: ${result.winner.name} (Net Worth: ${result.winner.netWorth.toLocaleString('vi-VN')} Tr.)`);
    console.log(`[Advanced 4 Players] HOSE: ${result.featureUsageStats.totalHoseInvestments} phiên, P2P Trades: ${result.featureUsageStats.totalTradesExecuted}`);
    console.log(`[Advanced 4 Players] Đã lưu báo cáo tại: ${targetFile}`);

    expect(result.totalTurns).toBeGreaterThan(10);
    expect(result.turns.length).toBe(result.totalTurns);
    expect(result.featureUsageStats.invariantsPassed).toBe(true);
    expect(fs.existsSync(targetFile)).toBe(true);
  });
});
