// [IMP-175/MSS][UC-IMP175] Supabase Cloud Log Sync & Auto-Backfill Engine
// Synchronizes archived room logs and manifest catalog to Supabase Cloud Storage

import fs from 'node:fs';
import path from 'node:path';
import type { AdminArchivedRoomSummary } from '../network/admin_types.js';
import type { ISupabaseStorageService } from './supabase_storage.js';

export interface SyncCloudLogsOptions {
  readonly logDir: string;
  readonly storageService?: unknown;
  readonly bucket?: string;
  readonly force?: boolean;
  readonly chunkSize?: number;
  readonly manifest?: Map<string, AdminArchivedRoomSummary> | AdminArchivedRoomSummary[];
}

export interface SyncCloudLogsResult {
  readonly success: boolean;
  readonly uploadedCount: number;
  readonly totalCount: number;
  readonly totalLocalRooms?: number;
  readonly skippedCount?: number;
  readonly failedCount?: number;
  readonly bucket: string;
  readonly error?: string;
  readonly reason?: string;
}

interface ResolvedSyncParams {
  readonly logDir: string;
  readonly storage?: ISupabaseStorageService;
  readonly bucket: string;
  readonly chunkSize: number;
  readonly manifestData?: Map<string, AdminArchivedRoomSummary> | AdminArchivedRoomSummary[];
}

function resolveSyncParams(
  optionsOrLogDir: SyncCloudLogsOptions | string,
  manifestOrStorage?: Map<string, AdminArchivedRoomSummary> | ISupabaseStorageService,
  storageArg?: ISupabaseStorageService,
  defaultBucketArg = 'game-logs',
): ResolvedSyncParams {
  if (typeof optionsOrLogDir === 'object' && optionsOrLogDir !== null) {
    const storage = optionsOrLogDir.storageService as ISupabaseStorageService | undefined;
    return {
      logDir: optionsOrLogDir.logDir,
      storage,
      bucket: optionsOrLogDir.bucket ?? storage?.defaultBucket ?? 'game-logs',
      chunkSize: optionsOrLogDir.chunkSize ?? 1,
      manifestData: optionsOrLogDir.manifest,
    };
  }

  const isStorage = manifestOrStorage && 'isConfigured' in manifestOrStorage;
  const storage = isStorage ? (manifestOrStorage as ISupabaseStorageService) : storageArg;
  const manifestData = isStorage
    ? undefined
    : (manifestOrStorage as Map<string, AdminArchivedRoomSummary> | undefined);

  return {
    logDir: optionsOrLogDir,
    storage,
    bucket: defaultBucketArg || storage?.defaultBucket || 'game-logs',
    chunkSize: 3,
    manifestData,
  };
}

function getFinishedRooms(
  logDir: string,
  manifestData?: Map<string, AdminArchivedRoomSummary> | AdminArchivedRoomSummary[],
): AdminArchivedRoomSummary[] {
  let allRooms: AdminArchivedRoomSummary[] = [];
  if (manifestData instanceof Map) {
    allRooms = Array.from(manifestData.values());
  } else if (Array.isArray(manifestData)) {
    allRooms = manifestData;
  } else {
    const manifestPath = path.join(logDir, 'rooms_manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        const raw = fs.readFileSync(manifestPath, 'utf8');
        const parsed = JSON.parse(raw);
        allRooms = Array.isArray(parsed) ? parsed : Object.values(parsed);
      } catch {
        allRooms = [];
      }
    }
  }

  return allRooms.filter(
    (r) => r.status === 'FINISHED' || r.status === 'TERMINATED',
  );
}

async function uploadSingleLog(
  room: AdminArchivedRoomSummary,
  logDir: string,
  bucket: string,
  storage: ISupabaseStorageService,
): Promise<{ ok: boolean; authError?: string }> {
  const fileName = path.basename(room.logFilePath);
  const filePath = path.isAbsolute(room.logFilePath)
    ? room.logFilePath
    : path.join(logDir, fileName);

  if (!fs.existsSync(filePath)) {
    return { ok: false };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  try {
    const ok = await storage.uploadFile(bucket, fileName, content, 'application/jsonl');
    return { ok };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    if (/401|403|accessdenied|unauthorized/i.test(errMsg)) {
      return { ok: false, authError: errMsg };
    }
    return { ok: false };
  }
}

async function uploadManifest(
  logDir: string,
  bucket: string,
  storage: ISupabaseStorageService,
): Promise<string | null> {
  const manifestPath = path.join(logDir, 'rooms_manifest.json');
  if (!fs.existsSync(manifestPath)) return null;

  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    await storage.uploadFile(
      bucket,
      '_manifest/rooms_manifest.json',
      manifestContent,
      'application/json',
    );
    return null;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return /401|403|accessdenied|unauthorized/i.test(errMsg) ? errMsg : null;
  }
}

interface BatchUploadResult {
  readonly uploadedCount: number;
  readonly failedCount: number;
  readonly authError?: string;
}

async function uploadAllBatches(
  finishedRooms: AdminArchivedRoomSummary[],
  chunkSize: number,
  logDir: string,
  bucket: string,
  storage: ISupabaseStorageService,
): Promise<BatchUploadResult> {
  let uploadedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < finishedRooms.length; i += chunkSize) {
    const chunk = finishedRooms.slice(i, i + chunkSize);
    const results = await Promise.all(
      chunk.map((room) => uploadSingleLog(room, logDir, bucket, storage)),
    );

    for (const r of results) {
      if (r.authError) {
        return { uploadedCount, failedCount, authError: r.authError };
      }
      if (r.ok) {
        uploadedCount++;
      } else {
        failedCount++;
      }
    }
  }

  return { uploadedCount, failedCount };
}

function makeAuthError(
  error: string,
  uploaded: number,
  total: number,
  bucket: string,
  failed = 0,
): SyncCloudLogsResult {
  return {
    success: false,
    reason: 'AUTH_ERROR',
    error,
    uploadedCount: uploaded,
    totalCount: total,
    totalLocalRooms: total,
    bucket,
    failedCount: failed,
  };
}

export async function syncAllLocalLogsToCloud(
  optionsOrLogDir: SyncCloudLogsOptions | string,
  manifestOrStorage?: Map<string, AdminArchivedRoomSummary> | ISupabaseStorageService,
  storageArg?: ISupabaseStorageService,
  defaultBucketArg = 'game-logs',
): Promise<SyncCloudLogsResult> {
  const params = resolveSyncParams(optionsOrLogDir, manifestOrStorage, storageArg, defaultBucketArg);
  const { logDir, storage, bucket, chunkSize, manifestData } = params;

  const isConfigured = Boolean(
    storage &&
    (typeof storage.isConfigured === 'function' ? storage.isConfigured() : storage.isConfigured),
  );

  if (!isConfigured || !storage) {
    return {
      success: true,
      reason: 'STORAGE_NOT_CONFIGURED',
      uploadedCount: 0,
      totalCount: 0,
      totalLocalRooms: 0,
      bucket,
    };
  }

  const finishedRooms = getFinishedRooms(logDir, manifestData);
  const batchRes = await uploadAllBatches(finishedRooms, chunkSize, logDir, bucket, storage);
  if (batchRes.authError) {
    return makeAuthError(batchRes.authError, batchRes.uploadedCount, finishedRooms.length, bucket, batchRes.failedCount);
  }

  const manifestError = await uploadManifest(logDir, bucket, storage);
  if (manifestError) {
    return makeAuthError(manifestError, batchRes.uploadedCount, finishedRooms.length, bucket);
  }

  return {
    success: true,
    uploadedCount: batchRes.uploadedCount,
    totalCount: finishedRooms.length,
    totalLocalRooms: finishedRooms.length,
    bucket,
  };
}

export async function autoBackfillCloudLogs(
  optionsOrLogDir?: SyncCloudLogsOptions | string,
  manifest?: Map<string, AdminArchivedRoomSummary>,
  storage?: ISupabaseStorageService,
  force = false,
): Promise<SyncCloudLogsResult> {
  const isForce =
    typeof optionsOrLogDir === 'object' && optionsOrLogDir !== null
      ? (optionsOrLogDir.force ?? false)
      : force;

  if (process.env['NODE_ENV'] === 'test' && !isForce) {
    const bucket =
      (typeof optionsOrLogDir === 'object' && optionsOrLogDir?.bucket) ||
      storage?.defaultBucket ||
      'game-logs';
    return {
      success: true,
      uploadedCount: 0,
      totalCount: 0,
      totalLocalRooms: 0,
      bucket,
    };
  }

  if (typeof optionsOrLogDir === 'object' && optionsOrLogDir !== null) {
    return syncAllLocalLogsToCloud(optionsOrLogDir);
  }
  return syncAllLocalLogsToCloud(optionsOrLogDir ?? '', manifest, storage, 'game-logs');
}
