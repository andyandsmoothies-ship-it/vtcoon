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

export function mergeCloudManifest(
  manifest: Map<string, AdminArchivedRoomSummary>,
  cloudData: string,
): boolean {
  try {
    const list = JSON.parse(cloudData) as AdminArchivedRoomSummary[];
    if (!Array.isArray(list)) return false;
    let changed = false;
    for (const item of list) {
      if (!item || !item.logFilePath) continue;
      const local = manifest.get(item.logFilePath);
      if (!local) {
        manifest.set(item.logFilePath, item);
        changed = true;
      } else if (local.status === 'ACTIVE' && (item.status === 'FINISHED' || item.status === 'TERMINATED')) {
        manifest.set(item.logFilePath, { ...local, ...item });
        changed = true;
      }
    }
    return changed;
  } catch {
    return false;
  }
}

export function resolveLogFileName(
  manifest: Map<string, AdminArchivedRoomSummary>,
  norm: string,
  timestamp?: number,
): string | undefined {
  if (timestamp !== undefined) {
    const numTs = Number(timestamp);
    for (const item of manifest.values()) {
      if (item.roomCode === norm && item.startTime === numTs) {
        return item.logFilePath;
      }
    }
  }
  let latest: AdminArchivedRoomSummary | undefined;
  for (const item of manifest.values()) {
    if (item.roomCode === norm) {
      if (!latest || item.startTime > latest.startTime) {
        latest = item;
      }
    }
  }
  return latest?.logFilePath;
}

export function resolveLogDir(optionsLogDir?: string): string {
  if (optionsLogDir) return optionsLogDir;
  if (process.env['NODE_ENV'] === 'test') {
    return path.resolve(
      process.cwd(),
      '.agents',
      'tmp',
      'test_logs',
      `worker_${process.env['VITEST_POOL_ID'] || process.pid}`,
    );
  }
  return path.resolve(process.cwd(), 'server_logs', 'rooms');
}

