import { describe, it, expect } from 'vitest';
import { recordFullGameSession } from './game_session_recorder';
import { BotPersonality } from '../../src/domain/bot/bot_engine';
import * as fs from 'fs';
import * as path from 'path';

const UAT_DIR = path.resolve(process.cwd(), 'docs/reports/uat');

describe('Full Game Step-by-Step UAT Recording Suites', () => {
  it('Case 2 Players: Ván đấu 2 người chơi ghi nhận step-by-step từ đầu đến Game Over', () => {
    if (!fs.existsSync(UAT_DIR)) {
      fs.mkdirSync(UAT_DIR, { recursive: true });
    }

    const result = recordFullGameSession(
      2,
      [
        { id: 'p1_ba', name: 'Bác Ba (Thực dụng / Aggressive)', personality: BotPersonality.Aggressive },
        { id: 'p2_sau', name: 'Chú Sáu (Cân bằng / Balanced)', personality: BotPersonality.Balanced },
      ],
      202602,
      30,
      300,
    );

    const targetFile = path.join(UAT_DIR, 'uat_game_2_players_step_by_step.md');
    fs.writeFileSync(targetFile, result.markdownReport, 'utf-8');

    console.log(`[Case 2 Players] Hoàn tất ${result.totalTurns} lượt qua ${result.totalRounds} vòng.`);
    console.log(`[Case 2 Players] Người chiến thắng: ${result.winner.name} (Tài sản: ${result.winner.netWorth.toLocaleString('vi-VN')} Tr. VNĐ)`);
    console.log(`[Case 2 Players] Đã lưu báo cáo tại: ${targetFile}`);

    expect(result.totalTurns).toBeGreaterThan(10);
    expect(result.turns.length).toBe(result.totalTurns);
    expect(result.aggregateStats.invariantsPassed).toBe(true);
    expect(fs.existsSync(targetFile)).toBe(true);
  });

  it('Case 3 Players: Ván đấu 3 người chơi ghi nhận step-by-step từ đầu đến Game Over', () => {
    if (!fs.existsSync(UAT_DIR)) {
      fs.mkdirSync(UAT_DIR, { recursive: true });
    }

    const result = recordFullGameSession(
      3,
      [
        { id: 'p1_ba', name: 'Bác Ba (Thực dụng / Aggressive)', personality: BotPersonality.Aggressive },
        { id: 'p2_sau', name: 'Chú Sáu (Cân bằng / Balanced)', personality: BotPersonality.Balanced },
        { id: 'p3_tu', name: 'Cô Tư (Thận trọng / Passive)', personality: BotPersonality.Passive },
      ],
      202603,
      30,
      300,
    );

    const targetFile = path.join(UAT_DIR, 'uat_game_3_players_step_by_step.md');
    fs.writeFileSync(targetFile, result.markdownReport, 'utf-8');

    console.log(`[Case 3 Players] Hoàn tất ${result.totalTurns} lượt qua ${result.totalRounds} vòng.`);
    console.log(`[Case 3 Players] Người chiến thắng: ${result.winner.name} (Tài sản: ${result.winner.netWorth.toLocaleString('vi-VN')} Tr. VNĐ)`);
    console.log(`[Case 3 Players] Đã lưu báo cáo tại: ${targetFile}`);

    expect(result.totalTurns).toBeGreaterThan(10);
    expect(result.turns.length).toBe(result.totalTurns);
    expect(result.aggregateStats.invariantsPassed).toBe(true);
    expect(fs.existsSync(targetFile)).toBe(true);
  });

  it('Case 4 Players: Ván đấu 4 người chơi ghi nhận step-by-step từ đầu đến Game Over', () => {
    if (!fs.existsSync(UAT_DIR)) {
      fs.mkdirSync(UAT_DIR, { recursive: true });
    }

    const result = recordFullGameSession(
      4,
      [
        { id: 'p1_ba', name: 'Bác Ba (Thực dụng / Aggressive)', personality: BotPersonality.Aggressive },
        { id: 'p2_sau', name: 'Chú Sáu (Cân bằng / Balanced)', personality: BotPersonality.Balanced },
        { id: 'p3_tu', name: 'Cô Tư (Thận trọng / Passive)', personality: BotPersonality.Passive },
        { id: 'p4_bo', name: 'Bé Bo (Cạnh tranh / Aggressive)', personality: BotPersonality.Aggressive },
      ],
      202604,
      30,
      300,
    );

    const targetFile = path.join(UAT_DIR, 'uat_game_4_players_step_by_step.md');
    fs.writeFileSync(targetFile, result.markdownReport, 'utf-8');

    console.log(`[Case 4 Players] Hoàn tất ${result.totalTurns} lượt qua ${result.totalRounds} vòng.`);
    console.log(`[Case 4 Players] Người chiến thắng: ${result.winner.name} (Tài sản: ${result.winner.netWorth.toLocaleString('vi-VN')} Tr. VNĐ)`);
    console.log(`[Case 4 Players] Đã lưu báo cáo tại: ${targetFile}`);

    expect(result.totalTurns).toBeGreaterThan(10);
    expect(result.turns.length).toBe(result.totalTurns);
    expect(result.aggregateStats.invariantsPassed).toBe(true);
    expect(fs.existsSync(targetFile)).toBe(true);
  });
});
