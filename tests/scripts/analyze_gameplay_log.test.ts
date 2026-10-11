import { describe, it, expect } from 'vitest';
import { getCellLabel, BOARD_CELL_NAMES } from '../../scripts/log_analyzer/board_cell_names.mjs';
import { analyzeFlightRecorder, formatConsoleReport } from '../../scripts/log_analyzer/flight_recorder_analyzer.mjs';

describe('Gameplay Log Analyzer Toolchain Test Suite', () => {
  describe('Board Cell Names Mapping', () => {
    it('[TC-LOG.01/MSS] maps cell 0 to Khởi Hành (GO)', () => {
      expect(BOARD_CELL_NAMES.length).toBe(40);
      expect(getCellLabel(0)).toBe('Ô #00 (Khởi Hành (GO))');
    });

    it('[TC-LOG.02/MSS] maps key properties correctly with zero padding', () => {
      expect(getCellLabel(3)).toBe('Ô #03 (An Giang (Châu Đốc))');
      expect(getCellLabel(26)).toBe('Ô #26 (Hải Phòng (Phố Ẩm Thực & Kinh Tế Đêm))');
    });

    it('[TC-LOG.03/A1] handles out of bounds cell index gracefully', () => {
      expect(getCellLabel(-1)).toBe('Ô #-1');
      expect(getCellLabel(99)).toBe('Ô #99');
    });
  });

  describe('Flight Recorder Analysis Engine', () => {
    const mockDump = {
      roomCode: 'TEST_ROOM',
      seed: 98765,
      exportedAt: 1791627000000,
      metrics: { fps: 60.0, drawCalls: 100, triangles: 5000, pingRttMs: 25 },
      violations: [],
      recordedIntents: [
        { playerId: 'p1', intent: { type: 'INTENT_ROLL' }, timestamp: 1791627000100 },
        { playerId: 'p1', intent: { type: 'INTENT_UPGRADE' }, timestamp: 1791627000200 },
      ],
      auditLogs: [],
      snapshots: [
        {
          tick: 10,
          preStateSummary: { balances: { p1: 1000, bot_1: 500 }, positions: { p1: 0, bot_1: 5 } },
          postStateSummary: { balances: { p1: 1500, bot_1: -200 }, positions: { p1: 0, bot_1: 10 } },
          triggerDelta: {
            cells: [{ index: 3, ownerId: 'p1', level: 1 }],
          },
        },
        {
          tick: 11,
          preStateSummary: { balances: { p1: 1500, bot_1: -200 }, positions: { p1: 0, bot_1: 10 } },
          postStateSummary: { balances: { p1: 1500, bot_1: 100 }, positions: { p1: 0, bot_1: 10 } },
          triggerDelta: {
            cells: [{ index: 5, ownerId: 'bot_1', level: 0 }],
          },
        },
      ],
    };

    it('[TC-LOG.04/MSS] extracts match overview and metrics correctly', () => {
      const result = analyzeFlightRecorder(mockDump);
      expect(result.overview.roomCode).toBe('TEST_ROOM');
      expect(result.overview.seed).toBe(98765);
      expect(result.overview.fps).toBe('60.0');
    });

    it('[TC-LOG.05/MSS] computes player balance changes and insolvency states', () => {
      const result = analyzeFlightRecorder(mockDump);
      expect(result.players.length).toBe(2);
      const p1 = result.players.find((p) => p.id === 'p1');
      const bot1 = result.players.find((p) => p.id === 'bot_1');
      expect(p1?.netChange).toBe(500);
      expect(bot1?.status).toContain('SOLVENT');
    });

    it('[TC-LOG.06/MSS] detects rent transfer and insolvency alert events', () => {
      const result = analyzeFlightRecorder(mockDump);
      expect(result.bankruptcyInvestigations.length).toBe(1);
      expect(result.bankruptcyInvestigations[0]?.debtor).toBe('bot_1');
      expect(result.bankruptcyInvestigations[0]?.creditor).toBe('p1');
    });

    it('[TC-LOG.07/MSS] records property upgrade and downgrade events', () => {
      const result = analyzeFlightRecorder(mockDump);
      expect(result.propertyEvents.length).toBe(2);
      expect(result.propertyEvents[0]?.cellIndex).toBe(3);
      expect(result.propertyEvents[0]?.level).toBe(1);
    });

    it('[TC-LOG.08/MSS] formats console report with key sections', () => {
      const result = analyzeFlightRecorder(mockDump);
      const report = formatConsoleReport(result);
      expect(report).toContain('TEST_ROOM');
      expect(report).toContain('BẢNG TỔNG KẾT TÀI CHÍNH');
      expect(report).toContain('CẢNH BÁO VỠ NỢ');
    });

    it('[TC-LOG.09/A1] throws on invalid or empty dump object', () => {
      expect(() => analyzeFlightRecorder(null)).toThrow();
    });
  });
});
