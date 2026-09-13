// [IMP-24/MSS] Forensic Flight Recorder — Repro Code & Diagnostic JSON Generator
import type { FlightRecorderDump } from './telemetry_types.js';

/**
 * Sinh mã nguồn TypeScript/Vitest test case hoàn chỉnh có thể chạy độc lập
 */
export function generateVitestReproCode(dump: FlightRecorderDump): string {
  const safeSeed = Number.isFinite(dump.seed) ? dump.seed : 12345;
  const safeRoom = dump.roomCode.replace(/[^a-zA-Z0-9]/g, '_');
  const serializedIntents = JSON.stringify(dump.recordedIntents, null, 2);
  const violationSummary = dump.violations.map((v) => `// [${v.severity}] ${v.type}: ${v.message}`).join('\n');

  return `// [TC-REPRO-${safeRoom}/MSS] Auto-Generated Forensic Test Case from Flight Recorder
// Exported at: ${new Date(dump.exportedAt).toISOString()}
// Room: ${dump.roomCode} | Seed: ${safeSeed}
${violationSummary}

import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { dispatchPlayerIntent, type PlayerIntent } from '../../src/server/intent_dispatcher.js';

describe('Forensic Replay for Room ${safeRoom}', () => {
  it('reproduces recorded intent sequence from seed ${safeSeed}', () => {
    const seed = ${safeSeed};
    const mgr = new RoomManager(seed);
    const room = mgr.createRoom('p1');
    const roomCode = room.roomCode;
    mgr.startGame(roomCode);

    const recordedIntents = ${serializedIntents};
    expect(Array.isArray(recordedIntents)).toBe(true);

    for (const record of recordedIntents) {
      if (record.intent) {
        const result = dispatchPlayerIntent(mgr, roomCode, record.playerId, record.intent as PlayerIntent);
        expect(result).toBeDefined();
      }
    }
  });
});
`;
}

/**
 * Xuất dữ liệu chẩn đoán dạng JSON
 */
export function generateDiagnosticJson(dump: FlightRecorderDump): string {
  return JSON.stringify(dump, null, 2);
}

/**
 * Tải tệp Hộp Đen chẩn đoán JSON về máy (Chỉ chạy trên môi trường Browser)
 */
export function downloadDiagnosticDump(dump: FlightRecorderDump): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const jsonStr = generateDiagnosticJson(dump);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeRoom = dump.roomCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  anchor.href = url;
  anchor.download = `vtcoon_flight_recorder_${safeRoom}_${dump.exportedAt}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Sao chép chuỗi văn bản vào bộ nhớ đệm (Clipboard) an toàn
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* safe-ignore: clipboard permission denied or insecure context */
    return false;
  }
}
