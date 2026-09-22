// [IMP-169/MSS] Self-Healing Room Logger Re-indexer
// Scans local disk for uncataloged .jsonl log files and reconstructs metadata
import fs from 'node:fs';
import path from 'node:path';
import type { AdminArchivedRoomSummary, ArchivedRoomStatus, AdminRoomLogEntry } from '../network/admin_types.js';

export function reindexLocalLogs(
  logDir: string,
  manifest: Map<string, AdminArchivedRoomSummary>,
): boolean {
  try {
    if (!fs.existsSync(logDir)) return false;
    const files = fs.readdirSync(logDir);
    let healed = false;

    for (const file of files) {
      if (!file.endsWith('.jsonl') || manifest.has(file)) continue;
      const match = file.match(/^(.+)_(\d+)\.jsonl$/);
      if (!match) continue;

      const roomCode = match[1]!.trim().toUpperCase();
      const startTime = Number(match[2]!);
      const fullPath = path.join(logDir, file);

      try {
        const stat = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n').filter((l) => l.trim().length > 0);
        let status: ArchivedRoomStatus = 'TERMINATED';
        let winner: string | undefined;
        let playerCount = 1;
        let endTime: number | undefined;

        for (const line of lines) {
          try {
            const entry = JSON.parse(line) as Record<string, unknown>;
            if (
              entry['action'] === 'FINISH_GAME' ||
              entry['action'] === 'GAME_FINISHED' ||
              entry['action'] === 'FINISH_ROOM' ||
              entry['status'] === 'FINISHED'
            ) {
              status = 'FINISHED';
            }
            if (entry['winner']) winner = String(entry['winner']);
            if (entry['playerCount'] && Number(entry['playerCount']) > playerCount) {
              playerCount = Number(entry['playerCount']);
            }
            if (entry['timestamp']) endTime = Number(entry['timestamp']);
          } catch {
            /* safe-ignore */
          }
        }

        const summary: AdminArchivedRoomSummary = {
          roomCode,
          startTime,
          endTime,
          playerCount,
          logFilePath: file,
          status,
          totalEvents: lines.length,
          fileSizeBytes: stat.size,
          ...(winner ? { winner } : {}),
        };

        manifest.set(file, summary);
        healed = true;
      } catch {
        /* safe-ignore */
      }
    }

    return healed;
  } catch {
    return false;
  }
}

export function parseLogEntries(content: string): AdminRoomLogEntry[] {
  const lines = content.split('\n');
  const entries: AdminRoomLogEntry[] = [];
  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;
    try {
      entries.push(JSON.parse(trimmed) as AdminRoomLogEntry);
    } catch {
      /* safe-ignore */
    }
  }
  return entries;
}

