// [IMP-175/MSS][UC-IMP175] Auto Cloud Log Backfill, JWT-First Priority Resolution & Admin Portal 1-Click Sync
// Station 1 Adversarial RED Contract Test Suite
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type { WebSocket } from 'ws';
import { PersistentRoomLogger } from '../../src/server/logging/persistent_room_logger.js';
import { AdminManager } from '../../src/server/network/admin_manager.js';
import { RoomManager } from '../../src/server/room_manager.js';
import * as AdminMessageHandler from '../../src/server/network/admin_message_handler.js';
import type { AdminArchivedRoomSummary } from '../../src/server/network/admin_types.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

export interface KeyResolutionResult {
  readonly key: string;
  readonly keyType: 'JWT' | 'OPAQUE' | 'NONE';
}

export interface SyncCloudLogsOptions {
  readonly logDir: string;
  readonly storageService?: unknown;
  readonly bucket?: string;
  readonly force?: boolean;
  readonly chunkSize?: number;
}

export interface SyncCloudLogsResult {
  readonly success: boolean;
  readonly uploadedCount: number;
  readonly totalCount: number;
  readonly skippedCount?: number;
  readonly failedCount?: number;
  readonly bucket: string;
  readonly error?: string;
  readonly reason?: string;
}

let supabaseStorageMod: Record<string, any> | null = null;
let supabaseLogSyncMod: Record<string, any> | null = null;

beforeAll(async () => {
  try {
    // @ts-ignore - TS2307: Module will be updated in Station 2 (Implementation)
    supabaseStorageMod = await import('../../src/server/storage/supabase_storage.js');
  } catch {
    supabaseStorageMod = null;
  }
  try {
    // @ts-ignore - TS2307: Module will be created in Station 2 (Implementation)
    supabaseLogSyncMod = await import('../../src/server/storage/supabase_log_sync.js');
  } catch {
    supabaseLogSyncMod = null;
  }
});

function getResolveSupabaseKey(): (candidates?: Record<string, string | undefined> | string) => KeyResolutionResult {
  expect(
    supabaseStorageMod?.resolveSupabaseKey,
    'resolveSupabaseKey must be exported from src/server/storage/supabase_storage.js',
  ).toBeDefined();
  return supabaseStorageMod!.resolveSupabaseKey;
}

function getSyncAllLocalLogsToCloud(): (options: SyncCloudLogsOptions) => Promise<SyncCloudLogsResult> {
  expect(
    supabaseLogSyncMod?.syncAllLocalLogsToCloud,
    'syncAllLocalLogsToCloud must be exported from src/server/storage/supabase_log_sync.js',
  ).toBeDefined();
  return supabaseLogSyncMod!.syncAllLocalLogsToCloud;
}

function getAutoBackfillCloudLogs(): (options?: SyncCloudLogsOptions) => Promise<SyncCloudLogsResult> {
  expect(
    supabaseLogSyncMod?.autoBackfillCloudLogs,
    'autoBackfillCloudLogs must be exported from src/server/storage/supabase_log_sync.js',
  ).toBeDefined();
  return supabaseLogSyncMod!.autoBackfillCloudLogs;
}

const createdTempDirs: string[] = [];

function createTempLogDir(prefix: string): string {
  const dir = path.resolve(
    process.cwd(),
    '.agents',
    'tmp',
    `test_logs_imp175_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  );
  fs.mkdirSync(dir, { recursive: true });
  createdTempDirs.push(dir);
  return dir;
}

function createDummyRoomLog(
  dir: string,
  roomCode: string,
  startTime: number,
  status: 'ACTIVE' | 'FINISHED' | 'TERMINATED' = 'FINISHED',
): AdminArchivedRoomSummary {
  const fileName = `${roomCode}_${startTime}.jsonl`;
  const filePath = path.join(dir, fileName);
  const content = JSON.stringify({
    id: `ev_${roomCode}_1`,
    roomCode,
    timestamp: startTime + 100,
    source: 'PLAYER',
    action: 'INIT_GAME',
    payloadSummary: `Khởi tạo bàn cờ ${roomCode}`,
  }) + '\n';
  fs.writeFileSync(filePath, content, 'utf8');

  return {
    roomCode,
    startTime,
    playerCount: 4,
    logFilePath: fileName,
    status,
    totalEvents: 1,
    fileSizeBytes: Buffer.byteLength(content, 'utf8'),
  };
}

describe('[IMP-175][Facet A: Boundary & Priority] resolveSupabaseKey & Key Resolution Contracts', () => {
  const SAMPLE_JWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Y29vbi1kZXYiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjIwMDAwMDAwMDB9.signature_jwt_secret';
  const SAMPLE_OPAQUE_PUBLISHABLE = 'sb_publishable_v1_live_abc123456789';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('[TC-IMP175.01/MSS][UC-IMP175] JWT Priority: prefers RFC 7515 Compact JWS token over opaque publishable key', () => {
    const resolve = getResolveSupabaseKey();
    const result = resolve({
      SUPABASE_KEY: SAMPLE_OPAQUE_PUBLISHABLE,
      SUPABASE_SERVICE_ROLE_KEY: SAMPLE_JWT,
    });

    expect(result.key).toBe(SAMPLE_JWT);
    expect(result.keyType).toBe('JWT');
  });

  it('[TC-IMP175.02a/Boundary][UC-IMP175] Quote Stripping: strips double quotes wrapping URL or JWT key', () => {
    const resolve = getResolveSupabaseKey();
    const quotedJwt = `"${SAMPLE_JWT}"`;
    const result = resolve({ SUPABASE_SERVICE_ROLE_KEY: quotedJwt });

    expect(result.key).toBe(SAMPLE_JWT);
    expect(result.keyType).toBe('JWT');
  });

  it('[TC-IMP175.02b/Boundary][UC-IMP175] Quote Stripping: strips single quotes and surrounding whitespace', () => {
    const resolve = getResolveSupabaseKey();
    const wrappedOpaque = `  '${SAMPLE_OPAQUE_PUBLISHABLE}'  `;
    const result = resolve({ SUPABASE_KEY: wrappedOpaque });

    expect(result.key).toBe(SAMPLE_OPAQUE_PUBLISHABLE);
    expect(result.keyType).toBe('OPAQUE');
  });

  it('[TC-IMP175.03a/Boundary][UC-IMP175] Opaque Fallback: falls back to opaque key when no JWT key is present', () => {
    const resolve = getResolveSupabaseKey();
    const result = resolve({ SUPABASE_KEY: SAMPLE_OPAQUE_PUBLISHABLE });

    expect(result.key).toBe(SAMPLE_OPAQUE_PUBLISHABLE);
    expect(result.keyType).toBe('OPAQUE');
  });

  it('[TC-IMP175.03b/Boundary][UC-IMP175] Missing Keys: returns empty string and NONE keyType when no keys are defined', () => {
    const resolve = getResolveSupabaseKey();
    const result = resolve({});

    expect(result.key).toBe('');
    expect(result.keyType).toBe('NONE');
  });
});

describe('[IMP-175][Facet B: Core Flow & Safety] syncAllLocalLogsToCloud & autoBackfillCloudLogs', () => {
  afterEach(() => {
    for (const dir of createdTempDirs) {
      try {
        if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
      } catch {
        /* safe-ignore */
      }
    }
    createdTempDirs.length = 0;
    vi.restoreAllMocks();
  });

  it('[TC-IMP175.04/MSS][UC-IMP175] Backfill Un-uploaded Logs: uploads finished and terminated rooms with x-upsert header', async () => {
    const testDir = createTempLogDir('backfill_unuploaded');
    const item1 = createDummyRoomLog(testDir, 'HANOI_1700', 1700000000000, 'FINISHED');
    const item2 = createDummyRoomLog(testDir, 'DANANG_1701', 1700000010000, 'ACTIVE');
    const manifestPath = path.join(testDir, 'rooms_manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify([item1, item2], null, 2), 'utf8');

    const mockUpload = vi.fn().mockResolvedValue(true);
    const mockStorage = {
      isConfigured: true,
      defaultBucket: 'game-logs',
      uploadFile: mockUpload,
      downloadFile: vi.fn(),
    };

    const syncAll = getSyncAllLocalLogsToCloud();
    const result = await syncAll({ logDir: testDir, storageService: mockStorage, force: true });

    expect(result.success).toBe(true);
    expect(result.uploadedCount).toBe(1);
    expect(mockUpload).toHaveBeenCalledWith(
      'game-logs',
      'HANOI_1700_1700000000000.jsonl',
      expect.any(String),
      'application/jsonl',
    );
  });

  it('[TC-IMP175.05/MSS][UC-IMP175] Upload Manifest After Logs: uploads rooms_manifest.json as final step after logs', async () => {
    const testDir = createTempLogDir('manifest_sequence');
    const item = createDummyRoomLog(testDir, 'SAIGON_1702', 1700000020000, 'FINISHED');
    fs.writeFileSync(path.join(testDir, 'rooms_manifest.json'), JSON.stringify([item], null, 2), 'utf8');

    const uploadOrder: string[] = [];
    const mockUpload = vi.fn().mockImplementation((_bucket: string, targetPath: string) => {
      uploadOrder.push(targetPath);
      return Promise.resolve(true);
    });
    const mockStorage = {
      isConfigured: true,
      defaultBucket: 'game-logs',
      uploadFile: mockUpload,
      downloadFile: vi.fn(),
    };

    const syncAll = getSyncAllLocalLogsToCloud();
    await syncAll({ logDir: testDir, storageService: mockStorage, force: true });

    expect(uploadOrder.length).toBe(2);
    expect(uploadOrder[uploadOrder.length - 1]).toBe('_manifest/rooms_manifest.json');
  });

  it('[TC-IMP175.06/Boundary][UC-IMP175] Chunking: uploads in batches with maximum concurrency <= 3', async () => {
    const testDir = createTempLogDir('chunking_batch');
    const items: AdminArchivedRoomSummary[] = [
      createDummyRoomLog(testDir, 'ROOM_CHUNK_01', 1700000030001, 'FINISHED'),
      createDummyRoomLog(testDir, 'ROOM_CHUNK_02', 1700000030002, 'FINISHED'),
      createDummyRoomLog(testDir, 'ROOM_CHUNK_03', 1700000030003, 'FINISHED'),
      createDummyRoomLog(testDir, 'ROOM_CHUNK_04', 1700000030004, 'FINISHED'),
      createDummyRoomLog(testDir, 'ROOM_CHUNK_05', 1700000030005, 'FINISHED'),
      createDummyRoomLog(testDir, 'ROOM_CHUNK_06', 1700000030006, 'FINISHED'),
      createDummyRoomLog(testDir, 'ROOM_CHUNK_07', 1700000030007, 'FINISHED'),
    ];
    fs.writeFileSync(path.join(testDir, 'rooms_manifest.json'), JSON.stringify(items, null, 2), 'utf8');

    let inFlight = 0;
    let maxInFlight = 0;
    const mockUpload = vi.fn().mockImplementation(async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 20));
      inFlight--;
      return true;
    });
    const mockStorage = {
      isConfigured: true,
      defaultBucket: 'game-logs',
      uploadFile: mockUpload,
      downloadFile: vi.fn(),
    };

    const syncAll = getSyncAllLocalLogsToCloud();
    await syncAll({ logDir: testDir, storageService: mockStorage, force: true, chunkSize: 3 });

    expect(maxInFlight).toBeLessThanOrEqual(3);
    expect(maxInFlight).toBeGreaterThanOrEqual(1);
  });

  it('[TC-IMP175.07/Adversarial][UC-IMP175] Fail-fast on 401/403: aborts subsequent uploads on authorization error and returns diagnostic error', async () => {
    const testDir = createTempLogDir('fail_fast');
    const items: AdminArchivedRoomSummary[] = [
      createDummyRoomLog(testDir, 'ERR_ROOM_01', 1700000040001, 'FINISHED'),
      createDummyRoomLog(testDir, 'ERR_ROOM_02', 1700000040002, 'FINISHED'),
    ];
    fs.writeFileSync(path.join(testDir, 'rooms_manifest.json'), JSON.stringify(items, null, 2), 'utf8');

    const mockUpload = vi.fn().mockRejectedValue(new Error('HTTP 403: Invalid Compact JWS - AccessDenied'));
    const mockStorage = {
      isConfigured: true,
      defaultBucket: 'game-logs',
      uploadFile: mockUpload,
      downloadFile: vi.fn(),
    };

    const syncAll = getSyncAllLocalLogsToCloud();
    const result = await syncAll({ logDir: testDir, storageService: mockStorage, force: true });

    expect(result.success).toBe(false);
    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(result.error).toMatch(/403|AccessDenied/i);
  });

  it('[TC-IMP175.08/Disposal][UC-IMP175] Test Environment Safety: autoBackfillCloudLogs is no-op in test environment without force flag', async () => {
    const testDir = createTempLogDir('env_safety');
    const item = createDummyRoomLog(testDir, 'SAFE_ROOM_01', 1700000050000, 'FINISHED');
    fs.writeFileSync(path.join(testDir, 'rooms_manifest.json'), JSON.stringify([item], null, 2), 'utf8');

    const prevEnv = process.env['NODE_ENV'];
    process.env['NODE_ENV'] = 'test';
    const mockUpload = vi.fn();
    const mockStorage = {
      isConfigured: true,
      defaultBucket: 'game-logs',
      uploadFile: mockUpload,
      downloadFile: vi.fn(),
    };

    try {
      const autoBackfill = getAutoBackfillCloudLogs();
      const res = await autoBackfill({ logDir: testDir, storageService: mockStorage });

      expect(res.uploadedCount).toBe(0);
      expect(mockUpload).not.toHaveBeenCalled();
    } finally {
      process.env['NODE_ENV'] = prevEnv;
    }
  });
});

describe('[IMP-175][Facet C: Reactivity & Mutex] AdminManager Sync Mutex & Server Vitals', () => {
  afterEach(() => {
    for (const dir of createdTempDirs) {
      try {
        if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
      } catch {
        /* safe-ignore */
      }
    }
    createdTempDirs.length = 0;
    vi.restoreAllMocks();
  });

  it('[TC-IMP175.09/Reactivity][UC-IMP175] Mutex isSyncingCloud: concurrent sync invocation returns ALREADY_SYNCING', async () => {
    const testDir = createTempLogDir('mutex_test');
    const admin = new AdminManager({
      roomManager: new RoomManager(),
      secret: 'admin_mutex_secret_175',
      loggerDir: testDir,
    });

    expect(
      typeof (admin as any).syncCloudLogs,
      'AdminManager must provide syncCloudLogs method',
    ).toBe('function');

    let resolveSlowSync: ((value: any) => void) | null = null;
    const slowSyncPromise = new Promise((resolve) => {
      resolveSlowSync = resolve;
    });

    vi.spyOn(admin as any, 'syncCloudLogs').mockImplementationOnce(async () => {
      (admin as any).isSyncingCloud = true;
      await slowSyncPromise;
      (admin as any).isSyncingCloud = false;
      return { success: true, uploadedCount: 1, bucket: 'game-logs' };
    });

    const run1 = (admin as any).syncCloudLogs({ force: true });
    const run2 = await (admin as any).syncCloudLogs({ force: true });

    expect(run2).toEqual(expect.objectContaining({ success: false, reason: 'ALREADY_SYNCING' }));

    resolveSlowSync!({ success: true });
    await run1;
  });

  it('[TC-IMP175.10/MSS][UC-IMP175] FlushSync Before Sync: calls logger.flushSync to commit memory buffers before scanning', async () => {
    const testDir = createTempLogDir('flush_before_sync');
    const admin = new AdminManager({
      roomManager: new RoomManager(),
      secret: 'admin_flush_secret_175',
      loggerDir: testDir,
    });

    expect(
      typeof (admin as any).syncCloudLogs,
      'AdminManager must provide syncCloudLogs method',
    ).toBe('function');

    const flushSpy = vi.spyOn(admin.logger, 'flushSync');
    await (admin as any).syncCloudLogs({ force: true });

    expect(flushSpy).toHaveBeenCalled();
  });

  it('[TC-IMP175.11/MSS][UC-IMP175] ServerVitals Storage Status: getServerVitals includes storage provider and key type', () => {
    const testDir = createTempLogDir('vitals_storage');
    const admin = new AdminManager({
      roomManager: new RoomManager(),
      secret: 'admin_vitals_secret_175',
      loggerDir: testDir,
    });

    const vitals = admin.getServerVitals();
    const storageStatus = (vitals as any).storageStatus;

    expect(storageStatus, 'ServerVitals must include storageStatus object').toBeDefined();
    expect(storageStatus.provider).toBe('supabase');
    expect(['JWT', 'OPAQUE', 'NONE']).toContain(storageStatus.keyType);
  });

  it('[TC-IMP175.14/Reactivity][UC-IMP175] Mutex Release On Completion: resets isSyncingCloud to false so future syncs succeed', async () => {
    const testDir = createTempLogDir('mutex_release');
    const admin = new AdminManager({
      roomManager: new RoomManager(),
      secret: 'admin_release_secret_175',
      loggerDir: testDir,
    });

    expect(
      typeof (admin as any).syncCloudLogs,
      'AdminManager must provide syncCloudLogs method',
    ).toBe('function');

    await (admin as any).syncCloudLogs({ force: true });
    expect((admin as any).isSyncingCloud).toBe(false);
  });
});

describe('[IMP-175][Facet D: Error Defense & Dispatcher] WebSocket Protocol & Message Handler', () => {
  afterEach(() => {
    for (const dir of createdTempDirs) {
      try {
        if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
      } catch {
        /* safe-ignore */
      }
    }
    createdTempDirs.length = 0;
    vi.restoreAllMocks();
  });

  it('[TC-IMP175.12/MSS][UC-IMP175] ADMIN_SYNC_CLOUD_STORAGE Handler: dispatches 1-click sync and returns ADMIN_SYNC_CLOUD_RESULT', async () => {
    const testDir = createTempLogDir('ws_sync_success');
    const admin = new AdminManager({
      roomManager: new RoomManager(),
      secret: 'admin_ws_secret_175',
      loggerDir: testDir,
    });

    const mockSocket = { readyState: 1, send: vi.fn() } as unknown as WebSocket;
    admin.authenticate(mockSocket, 'admin_ws_secret_175');

    const sentMessages: WsServerMessage[] = [];
    const sendSafe = (_s: WebSocket, m: WsServerMessage): void => {
      sentMessages.push(m);
    };

    const handleAdminClientMessage = (AdminMessageHandler as Record<string, any>).handleAdminClientMessage;
    await handleAdminClientMessage(
      admin,
      mockSocket,
      { type: 'ADMIN_SYNC_CLOUD_STORAGE' as any },
      sendSafe,
    );

    expect(sentMessages.length).toBeGreaterThanOrEqual(1);
    expect(sentMessages).toContainEqual(
      expect.objectContaining({
        type: 'ADMIN_SYNC_CLOUD_RESULT',
        success: true,
        uploadedCount: expect.any(Number),
        bucket: expect.any(String),
      }),
    );
  });

  it('[TC-IMP175.13/Adversarial][UC-IMP175] Unauthorized Sync Rejected: rejects unauthenticated sync request with ADMIN_UNAUTHORIZED', async () => {
    const testDir = createTempLogDir('ws_sync_unauth');
    const admin = new AdminManager({
      roomManager: new RoomManager(),
      secret: 'admin_ws_secret_175',
      loggerDir: testDir,
    });

    const unauthSocket = { readyState: 1, send: vi.fn() } as unknown as WebSocket;

    const sentMessages: WsServerMessage[] = [];
    const sendSafe = (_s: WebSocket, m: WsServerMessage): void => {
      sentMessages.push(m);
    };

    const handleAdminClientMessage = (AdminMessageHandler as Record<string, any>).handleAdminClientMessage;
    await handleAdminClientMessage(
      admin,
      unauthSocket,
      { type: 'ADMIN_SYNC_CLOUD_STORAGE' as any },
      sendSafe,
    );

    expect(sentMessages).toContainEqual({
      type: 'ERROR',
      reasonCode: 'ADMIN_UNAUTHORIZED',
    });
  });
});
