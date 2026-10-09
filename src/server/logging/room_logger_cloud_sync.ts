// [IMP-300] Room Logger Cloud Sync Manager
// Extracted from persistent_room_logger.ts to isolate cloud network I/O and manifest synchronization.
import fs from 'node:fs';
import path from 'node:path';
import type { AdminArchivedRoomSummary } from '../network/admin_types.js';
import {
  type ISupabaseStorageService,
} from '../storage/supabase_storage.js';
import {
  parseLogEntries,
  mergeCloudManifest,
  reindexLocalLogs,
  resolveLogFileName,
} from './room_logger_reindexer.js';
import type { RoomFinishSummary } from './persistent_room_logger.js';

export function isStorageConfigured(storage?: ISupabaseStorageService): boolean {
  if (!storage) return false;
  return typeof storage.isConfigured === 'function'
    ? storage.isConfigured()
    : Boolean(storage.isConfigured);
}

export interface FinalizeArchiveParams {
  logDir: string;
  fileName: string;
  manifest: Map<string, AdminArchivedRoomSummary>;
  summary?: RoomFinishSummary;
  saveManifest: () => void;
  getArchivedRoomsList: () => AdminArchivedRoomSummary[];
}

export interface FetchRemoteParams {
  roomCode: string;
  timestamp?: number;
  logDir: string;
  manifest: Map<string, AdminArchivedRoomSummary>;
  ensureDir: () => void;
  saveManifest: () => void;
}

export class RoomLoggerCloudSync {
  public readonly pendingUploads: Promise<unknown>[] = [];
  public readonly supabaseStorage?: ISupabaseStorageService;
  private manifestSyncQueue: Promise<void> = Promise.resolve();

  constructor(supabaseStorage?: ISupabaseStorageService) {
    this.supabaseStorage = supabaseStorage;
  }

  finalizeRoomArchive(params: FinalizeArchiveParams): void {
    const fullPath = path.join(params.logDir, params.fileName);
    let size = 0;
    let events = 0;
    try {
      if (fs.existsSync(fullPath)) {
        size = fs.statSync(fullPath).size;
        const content = fs.readFileSync(fullPath, 'utf8');
        events = parseLogEntries(content).length;
      }
    } catch {
      /* safe-ignore */
    }

    const existing = params.manifest.get(params.fileName);
    if (existing) {
      const updated: AdminArchivedRoomSummary = {
        ...existing,
        endTime: params.summary?.endTime ?? Date.now(),
        winner: params.summary?.winner ?? existing.winner,
        status: params.summary?.status ?? 'TERMINATED',
        playerCount: params.summary?.playerCount ?? existing.playerCount,
        fileSizeBytes: size,
        totalEvents: events,
      };
      params.manifest.set(params.fileName, updated);
      params.saveManifest();
    }

    if (!isStorageConfigured(this.supabaseStorage)) return;

    const bucket = this.supabaseStorage?.defaultBucket ?? 'game-logs';
    let logContent = '';
    try {
      if (fs.existsSync(fullPath)) {
        logContent = fs.readFileSync(fullPath, 'utf8');
      }
    } catch {
      /* safe-ignore */
    }

    // 1. Kick off .jsonl upload synchronously
    const jsonlUploadPromise = this.supabaseStorage!.uploadFile(bucket, params.fileName, logContent, 'application/x-ndjson');

    const syncTask = async () => {
      await jsonlUploadPromise;

      // 2. Download cloud manifest with status check
      let cloudData: string | null = null;
      let cloudStatus = 200;
      try {
        if (typeof this.supabaseStorage?.downloadFileWithStatus === 'function') {
          const res = await this.supabaseStorage.downloadFileWithStatus(bucket, '_manifest/rooms_manifest.json');
          cloudData = res.data;
          cloudStatus = res.status;
        } else {
          cloudData = await this.supabaseStorage!.downloadFile(bucket, '_manifest/rooms_manifest.json');
          cloudStatus = cloudData ? 200 : 404;
        }
      } catch {
        cloudStatus = 500;
      }

      // Fail-safe: Nếu gặp lỗi mạng / 5xx / timeout (không phải 404), KHÔNG ghi đè manifest
      if (cloudStatus !== 200 && cloudStatus !== 404) {
        return;
      }

      // Merge cloud manifest:
      if (cloudData && mergeCloudManifest(params.manifest, cloudData)) {
        params.saveManifest();
      }

      // 3. Upload merged master manifest
      const manifestList = params.getArchivedRoomsList();
      const manifestContent = JSON.stringify(manifestList, null, 2);
      await this.supabaseStorage!.uploadFile(bucket, '_manifest/rooms_manifest.json', manifestContent, 'application/json');
    };

    const chained = this.manifestSyncQueue.then(syncTask).catch(() => {});
    this.manifestSyncQueue = chained;
    this.pendingUploads.push(chained);
  }

  async syncCloudManifest(
    manifest: Map<string, AdminArchivedRoomSummary>,
    saveManifest: () => void
  ): Promise<void> {
    if (!isStorageConfigured(this.supabaseStorage)) return;
    const bucket = this.supabaseStorage?.defaultBucket ?? 'game-logs';
    try {
      const raw = await this.supabaseStorage!.downloadFile(bucket, '_manifest/rooms_manifest.json');
      if (raw && mergeCloudManifest(manifest, raw)) {
        saveManifest();
      }
    } catch {
      /* safe-ignore */
    }
  }

  async fetchRemoteLog(params: FetchRemoteParams): Promise<string | null> {
    if (!isStorageConfigured(this.supabaseStorage)) {
      return null;
    }

    const norm = params.roomCode.trim().toUpperCase();
    const targetFile = resolveLogFileName(params.manifest, norm, params.timestamp);
    let fileName = targetFile;
    if (!fileName) {
      if (params.timestamp !== undefined) {
        fileName = `${norm}_${params.timestamp}.jsonl`;
      } else {
        fileName = `${norm}.jsonl`;
      }
    }

    const cachedPath = path.join(params.logDir, fileName);
    if (fs.existsSync(cachedPath)) {
      try {
        return fs.readFileSync(cachedPath, 'utf8');
      } catch {
        /* safe-ignore */
      }
    }

    const bucket = this.supabaseStorage?.defaultBucket ?? 'game-logs';
    const remoteContent = await this.supabaseStorage!.downloadFile(bucket, fileName);
    if (!remoteContent) {
      return null;
    }

    try {
      params.ensureDir();
      fs.writeFileSync(cachedPath, remoteContent, 'utf8');
      if (!params.manifest.has(fileName)) {
        if (reindexLocalLogs(params.logDir, params.manifest)) {
          params.saveManifest();
        }
      }
    } catch {
      /* safe-ignore */
    }

    return remoteContent;
  }

  async stop(): Promise<void> {
    if (this.pendingUploads.length > 0) {
      await Promise.allSettled(this.pendingUploads);
      this.pendingUploads.length = 0;
    }
  }
}
