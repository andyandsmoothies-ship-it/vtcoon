// [IMP-28/MSS] Persistent Room Logger — Real-Time Crash-Resilient Event Logging
import fs from 'node:fs';
import path from 'node:path';
import type { AdminRoomLogEntry, AdminArchivedRoomSummary, ArchivedRoomStatus } from '../network/admin_types.js';
import {
  type ISupabaseStorageService,
  SupabaseStorageService,
} from '../storage/supabase_storage.js';
import {
  reindexLocalLogs,
  parseLogEntries,
  resolveLogFileName,
  resolveLogDir,
} from './room_logger_reindexer.js';
import { RoomLoggerCloudSync } from './room_logger_cloud_sync.js';

export interface PersistentRoomLoggerOptions {
  readonly logDir?: string;
  readonly flushIntervalMs?: number;
  readonly supabaseStorage?: ISupabaseStorageService;
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
  public readonly pendingUploads: Promise<unknown>[];
  public readonly supabaseStorage?: ISupabaseStorageService;
  public readonly cloudSync: RoomLoggerCloudSync;
  private flushTimer?: NodeJS.Timeout;

  constructor(options?: PersistentRoomLoggerOptions) {
    this.logDir = resolveLogDir(options?.logDir);
    this.manifestFile = path.join(this.logDir, 'rooms_manifest.json');
    this.flushIntervalMs = options?.flushIntervalMs ?? (process.env['NODE_ENV'] === 'test' ? 0 : 500);
    this.supabaseStorage = options?.supabaseStorage ?? new SupabaseStorageService();
    this.cloudSync = new RoomLoggerCloudSync(this.supabaseStorage);
    this.pendingUploads = this.cloudSync.pendingUploads;
    this.ensureDir();
    this.loadManifest();
  }

  get storageDir(): string {
    return this.logDir;
  }

  get manifestCatalog(): Map<string, AdminArchivedRoomSummary> {
    return this.manifest;
  }

  private ensureDir(): void {
    try {
      if (!fs.existsSync(this.logDir)) fs.mkdirSync(this.logDir, { recursive: true });
    } catch { /* safe-ignore */ }
  }

  private loadManifest(): void {
    try {
      if (fs.existsSync(this.manifestFile)) {
        const raw = fs.readFileSync(this.manifestFile, 'utf8');
        const list = JSON.parse(raw) as AdminArchivedRoomSummary[];
        for (const item of list) {
          this.manifest.set(item.logFilePath, item);
          if (item.status === 'ACTIVE') {
            this.activeRoomFiles.set(item.roomCode.trim().toUpperCase(), item.logFilePath);
          }
        }
      }
    } catch { /* safe-ignore */ }

    if (reindexLocalLogs(this.logDir, this.manifest)) {
      this.saveManifest();
    }
  }

  saveManifest(): void {
    try {
      this.ensureDir();
      const list = Array.from(this.manifest.values());
      fs.writeFileSync(this.manifestFile, JSON.stringify(list, null, 2), 'utf8');
    } catch { /* safe-ignore */ }
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

  async stop(): Promise<void> {
    this.flushSync();
    await this.cloudSync.stop();
  }

  finishRoomLog(roomCode: string, summary?: RoomFinishSummary): void {
    this.flushSync();
    const norm = roomCode.trim().toUpperCase();
    const fileName = this.activeRoomFiles.get(norm) ?? resolveLogFileName(this.manifest, norm);
    if (!fileName) return;

    this.cloudSync.finalizeRoomArchive({
      logDir: this.logDir,
      fileName,
      manifest: this.manifest,
      summary,
      saveManifest: () => this.saveManifest(),
      getArchivedRoomsList: () => this.getArchivedRoomsList(),
    });
    this.activeRoomFiles.delete(norm);
  }

  getArchivedRoomsList(): AdminArchivedRoomSummary[] {
    return Array.from(this.manifest.values()).sort((a, b) => b.startTime - a.startTime);
  }

  async syncCloudManifest(): Promise<void> {
    await this.cloudSync.syncCloudManifest(this.manifest, () => this.saveManifest());
  }

  getRoomFullLog(roomCode: string, timestamp?: number): AdminRoomLogEntry[] {
    this.flushSync();
    const norm = roomCode.trim().toUpperCase();
    const targetFile = resolveLogFileName(this.manifest, norm, timestamp);
    if (!targetFile) return [];

    const fullPath = path.join(this.logDir, path.basename(targetFile));
    try {
      if (!fs.existsSync(fullPath)) return [];
      const content = fs.readFileSync(fullPath, 'utf8');
      return parseLogEntries(content);
    } catch {
      /* safe-ignore */
      return [];
    }
  }

  async getRoomFullLogAsync(roomCode: string, timestamp?: number): Promise<AdminRoomLogEntry[]> {
    this.flushSync();
    const norm = roomCode.trim().toUpperCase();
    const targetFile = resolveLogFileName(this.manifest, norm, timestamp);

    if (targetFile) {
      const fullPath = path.join(this.logDir, path.basename(targetFile));
      if (fs.existsSync(fullPath)) {
        return this.getRoomFullLog(norm, timestamp);
      }
    }

    const remoteContent = await this.cloudSync.fetchRemoteLog({
      roomCode: norm,
      timestamp,
      logDir: this.logDir,
      manifest: this.manifest,
      ensureDir: () => this.ensureDir(),
      saveManifest: () => this.saveManifest(),
    });

    return remoteContent ? parseLogEntries(remoteContent) : [];
  }
}
