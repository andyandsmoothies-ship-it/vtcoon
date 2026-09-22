// [IMP-28/MSS] Persistent Room Logger — Real-Time Crash-Resilient Event Logging
import fs from 'node:fs';
import path from 'node:path';
import type { AdminRoomLogEntry, AdminArchivedRoomSummary, ArchivedRoomStatus } from '../network/admin_types.js';

export interface PersistentRoomLoggerOptions {
  readonly logDir?: string;
  readonly flushIntervalMs?: number;
}

export interface RoomLogMeta {
  readonly hostId?: string;
  readonly playerCount?: number;
  readonly timestamp?: number;
}

export interface RoomFinishSummary {
  readonly status?: ArchivedRoomStatus;
  readonly winner?: string;
  readonly endTime?: number;
  readonly playerCount?: number;
}

export class PersistentRoomLogger {
  private readonly logDir: string;
  private readonly manifestFile: string;
  private readonly flushIntervalMs: number;
  private readonly manifest = new Map<string, AdminArchivedRoomSummary>();
  private readonly activeRoomFiles = new Map<string, string>();
  private readonly writeBuffer = new Map<string, string[]>();
  private flushTimer?: NodeJS.Timeout;

  constructor(options?: PersistentRoomLoggerOptions) {
    this.logDir = options?.logDir ?? path.resolve(process.cwd(), 'server_logs', 'rooms');
    this.manifestFile = path.join(this.logDir, 'rooms_manifest.json');
    this.flushIntervalMs = options?.flushIntervalMs ?? (process.env.NODE_ENV === 'test' ? 0 : 500);
    this.ensureDir();
    this.loadManifest();
  }

  get storageDir(): string {
    return this.logDir;
  }

  private ensureDir(): void {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch {
      /* safe-ignore */
    }
  }

  private loadManifest(): void {
    try {
      if (!fs.existsSync(this.manifestFile)) return;
      const raw = fs.readFileSync(this.manifestFile, 'utf8');
      const list = JSON.parse(raw) as AdminArchivedRoomSummary[];
      for (const item of list) {
        this.manifest.set(item.logFilePath, item);
        if (item.status === 'ACTIVE') {
          this.activeRoomFiles.set(item.roomCode.trim().toUpperCase(), item.logFilePath);
        }
      }
    } catch {
      /* safe-ignore */
    }
  }

  saveManifest(): void {
    try {
      this.ensureDir();
      const list = Array.from(this.manifest.values());
      fs.writeFileSync(this.manifestFile, JSON.stringify(list, null, 2), 'utf8');
    } catch {
      /* safe-ignore */
    }
  }

  initRoomLog(roomCode: string, meta?: RoomLogMeta): string {
    const norm = roomCode.trim().toUpperCase();
    const startTime = meta?.timestamp ?? Date.now();
    const fileName = `${norm}_${startTime}.jsonl`;
    const fullPath = path.join(this.logDir, fileName);

    try {
      this.ensureDir();
      if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, '', 'utf8');
      }
    } catch {
      /* safe-ignore */
    }

    const summary: AdminArchivedRoomSummary = {
      roomCode: norm,
      startTime,
      playerCount: meta?.playerCount ?? 1,
      logFilePath: fileName,
      status: 'ACTIVE',
      totalEvents: 0,
      fileSizeBytes: 0,
    };

    this.manifest.set(fileName, summary);
    this.activeRoomFiles.set(norm, fileName);
    this.saveManifest();
    return fileName;
  }

  appendEvent(roomCode: string, entry: AdminRoomLogEntry): void {
    const norm = roomCode.trim().toUpperCase();
    let fileName = this.activeRoomFiles.get(norm);
    if (!fileName) {
      fileName = this.initRoomLog(norm, { timestamp: entry.timestamp });
    }

    const fullPath = path.join(this.logDir, fileName);
    const line = JSON.stringify(entry) + '\n';

    if (this.flushIntervalMs <= 0) {
      try {
        fs.appendFileSync(fullPath, line, 'utf8');
      } catch {
        /* safe-ignore */
      }
    } else {
      let buf = this.writeBuffer.get(fullPath);
      if (!buf) {
        buf = [];
        this.writeBuffer.set(fullPath, buf);
      }
      buf.push(line);
      this.scheduleFlush();
    }

    const existing = this.manifest.get(fileName);
    if (existing) {
      const updated: AdminArchivedRoomSummary = {
        ...existing,
        totalEvents: existing.totalEvents + 1,
        fileSizeBytes: (existing.fileSizeBytes ?? 0) + Buffer.byteLength(line, 'utf8'),
      };
      this.manifest.set(fileName, updated);
      // In-memory catalog is updated without synchronous disk rewrite on every single event
    }
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = undefined;
      void this.flush();
    }, this.flushIntervalMs);
    this.flushTimer.unref?.();
  }

  async flush(): Promise<void> {
    if (this.writeBuffer.size === 0) return;
    const entries = Array.from(this.writeBuffer.entries());
    this.writeBuffer.clear();
    for (const [fullPath, lines] of entries) {
      if (lines.length === 0) continue;
      try {
        await fs.promises.appendFile(fullPath, lines.join(''), 'utf8');
      } catch {
        /* safe-ignore */
      }
    }
  }

  flushSync(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }
    if (this.writeBuffer.size === 0) return;
    const entries = Array.from(this.writeBuffer.entries());
    this.writeBuffer.clear();
    for (const [fullPath, lines] of entries) {
      if (lines.length === 0) continue;
      try {
        fs.appendFileSync(fullPath, lines.join(''), 'utf8');
      } catch {
        /* safe-ignore */
      }
    }
  }

  stop(): void {
    this.flushSync();
  }

  finishRoomLog(roomCode: string, summary?: RoomFinishSummary): void {
    this.flushSync();
    const norm = roomCode.trim().toUpperCase();
    const fileName = this.activeRoomFiles.get(norm) ?? this.resolveLogFileName(norm);
    if (!fileName) return;

    const existing = this.manifest.get(fileName);
    if (existing) {
      const updated: AdminArchivedRoomSummary = {
        ...existing,
        endTime: summary?.endTime ?? Date.now(),
        winner: summary?.winner ?? existing.winner,
        status: summary?.status ?? 'TERMINATED',
        playerCount: summary?.playerCount ?? existing.playerCount,
      };
      this.manifest.set(fileName, updated);
      this.saveManifest();
    }
    this.activeRoomFiles.delete(norm);
  }

  getArchivedRoomsList(): AdminArchivedRoomSummary[] {
    return Array.from(this.manifest.values()).sort((a, b) => b.startTime - a.startTime);
  }

  getRoomFullLog(roomCode: string, timestamp?: number): AdminRoomLogEntry[] {
    this.flushSync();
    const norm = roomCode.trim().toUpperCase();
    const targetFile = this.resolveLogFileName(norm, timestamp);
    if (!targetFile) return [];

    const fullPath = path.join(this.logDir, path.basename(targetFile));
    try {
      if (!fs.existsSync(fullPath)) return [];
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      const entries: AdminRoomLogEntry[] = [];
      for (const rawLine of lines) {
        const trimmed = rawLine.trim();
        if (!trimmed) continue;
        try {
          entries.push(JSON.parse(trimmed) as AdminRoomLogEntry);
        } catch {
          /* safe-ignore corrupted line from unexpected process crash */
        }
      }
      return entries;
    } catch {
      /* safe-ignore */
      return [];
    }
  }

  private resolveLogFileName(norm: string, timestamp?: number): string | undefined {
    if (timestamp !== undefined) {
      const numTs = Number(timestamp);
      for (const item of this.manifest.values()) {
        if (item.roomCode === norm && item.startTime === numTs) {
          return item.logFilePath;
        }
      }
    }
    let latest: AdminArchivedRoomSummary | undefined;
    for (const item of this.manifest.values()) {
      if (item.roomCode === norm) {
        if (!latest || item.startTime > latest.startTime) {
          latest = item;
        }
      }
    }
    return latest?.logFilePath;
  }
}
