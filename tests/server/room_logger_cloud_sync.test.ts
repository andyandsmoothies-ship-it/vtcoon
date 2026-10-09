// [IMP-300] Living Contract Tests for RoomLoggerCloudSync & Modular PersistentRoomLogger
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  RoomLoggerCloudSync,
  isStorageConfigured,
} from '../../src/server/logging/room_logger_cloud_sync.js';
import { PersistentRoomLogger } from '../../src/server/logging/persistent_room_logger.js';
import type { ISupabaseStorageService } from '../../src/server/storage/supabase_storage.js';
import type { AdminArchivedRoomSummary } from '../../src/server/network/admin_types.js';

describe('RoomLoggerCloudSync Contract Suites', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rl-sync-test-'));
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      /* safe-ignore */
    }
  });

  it('TC-RL-SYNC.01 [UC-RL-SYNC/MSS]: Given unconfigured storage, When calling isStorageConfigured(undefined), Then returns false', () => {
    const result = isStorageConfigured(undefined);
    expect(result).toBe(false);
  });

  it('TC-RL-SYNC.02 [UC-RL-SYNC/MSS]: Given configured storage with isConfigured fn, When calling isStorageConfigured(storage), Then returns true', () => {
    const mockStorage: ISupabaseStorageService = {
      isConfigured: () => true,
      uploadFile: async () => true,
      downloadFile: async () => null,
    };
    const falseStorage: ISupabaseStorageService = {
      isConfigured: () => false,
      uploadFile: async () => true,
      downloadFile: async () => null,
    };
    expect(isStorageConfigured(mockStorage)).toBe(true);
    expect(isStorageConfigured(falseStorage)).toBe(false);
  });

  it('TC-RL-SYNC.03 [UC-RL-SYNC/MSS]: Given unconfigured storage, When calling finalizeRoomArchive, Then local manifest is updated and no upload queued', () => {
    const cloudSync = new RoomLoggerCloudSync(undefined);
    const manifest = new Map<string, AdminArchivedRoomSummary>();
    manifest.set('room-1.jsonl', {
      logFilePath: 'room-1.jsonl',
      roomCode: 'ROOM1',
      startTime: 1000,
      endTime: 0,
      winner: '',
      status: 'ACTIVE',
      playerCount: 4,
      fileSizeBytes: 0,
      totalEvents: 0,
    });

    let saved = false;
    cloudSync.finalizeRoomArchive({
      logDir: tempDir,
      fileName: 'room-1.jsonl',
      manifest,
      summary: { status: 'TERMINATED', winner: 'Player 1', endTime: 2000, playerCount: 4 },
      saveManifest: () => { saved = true; },
      getArchivedRoomsList: () => Array.from(manifest.values()),
    });

    expect(manifest.get('room-1.jsonl')?.status).toBe('TERMINATED');
    expect(manifest.get('room-1.jsonl')?.winner).toBe('Player 1');
    expect(saved).toBe(true);
    expect(cloudSync.pendingUploads.length).toBe(0);
  });

  it('TC-RL-SYNC.04 [UC-RL-SYNC/MSS]: Given configured storage, When calling finalizeRoomArchive, Then log file and manifest upload are queued', () => {
    let uploadCount = 0;
    const mockStorage: ISupabaseStorageService = {
      isConfigured: () => true,
      defaultBucket: 'game-logs',
      uploadFile: async () => {
        uploadCount++;
        return true;
      },
      downloadFile: async () => null,
    };

    const cloudSync = new RoomLoggerCloudSync(mockStorage);
    const manifest = new Map<string, AdminArchivedRoomSummary>();
    manifest.set('room-1.jsonl', {
      logFilePath: 'room-1.jsonl',
      roomCode: 'ROOM1',
      startTime: 1000,
      endTime: 0,
      winner: '',
      status: 'ACTIVE',
      playerCount: 4,
      fileSizeBytes: 0,
      totalEvents: 0,
    });

    fs.writeFileSync(path.join(tempDir, 'room-1.jsonl'), '{"type":"GAME_START"}\n', 'utf8');

    cloudSync.finalizeRoomArchive({
      logDir: tempDir,
      fileName: 'room-1.jsonl',
      manifest,
      summary: { status: 'TERMINATED', winner: 'Player 1', endTime: 2000, playerCount: 4 },
      saveManifest: () => {},
      getArchivedRoomsList: () => Array.from(manifest.values()),
    });

    expect(cloudSync.pendingUploads.length).toBe(1);
    expect(manifest.get('room-1.jsonl')?.status).toBe('TERMINATED');
  });

  it('TC-RL-SYNC.05 [UC-RL-SYNC/MSS]: Given HTTP 500 on manifest download, When finalizeRoomArchive executes, Then fail-safe triggers and skips manifest upload', async () => {
    let manifestUploaded = false;
    let logUploaded = false;
    const mockStorage: ISupabaseStorageService = {
      isConfigured: () => true,
      defaultBucket: 'game-logs',
      uploadFile: async (_bucket, uploadPath) => {
        if (uploadPath.includes('_manifest')) manifestUploaded = true;
        else logUploaded = true;
        return true;
      },
      downloadFile: async () => null,
      downloadFileWithStatus: async () => ({ data: null, status: 500 }),
    };

    const cloudSync = new RoomLoggerCloudSync(mockStorage);
    const manifest = new Map<string, AdminArchivedRoomSummary>();
    manifest.set('room-5.jsonl', {
      logFilePath: 'room-5.jsonl',
      roomCode: 'ROOM5',
      startTime: 1000,
      endTime: 0,
      winner: '',
      status: 'ACTIVE',
      playerCount: 4,
      fileSizeBytes: 0,
      totalEvents: 0,
    });
    fs.writeFileSync(path.join(tempDir, 'room-5.jsonl'), '{"type":"EVENT"}\n', 'utf8');

    cloudSync.finalizeRoomArchive({
      logDir: tempDir,
      fileName: 'room-5.jsonl',
      manifest,
      summary: { status: 'TERMINATED', endTime: 2000 },
      saveManifest: () => {},
      getArchivedRoomsList: () => Array.from(manifest.values()),
    });

    await Promise.all(cloudSync.pendingUploads);

    expect(logUploaded).toBe(true);
    expect(manifestUploaded).toBe(false);
  });

  it('TC-RL-SYNC.06 [UC-RL-SYNC/MSS]: Given HTTP 404 on manifest download, When finalizeRoomArchive executes, Then manifest is created and uploaded', async () => {
    let manifestUploaded = false;
    const mockStorage: ISupabaseStorageService = {
      isConfigured: () => true,
      defaultBucket: 'game-logs',
      uploadFile: async (_bucket, uploadPath) => {
        if (uploadPath.includes('_manifest')) manifestUploaded = true;
        return true;
      },
      downloadFile: async () => null,
      downloadFileWithStatus: async () => ({ data: null, status: 404 }),
    };

    const cloudSync = new RoomLoggerCloudSync(mockStorage);
    const manifest = new Map<string, AdminArchivedRoomSummary>();
    manifest.set('room-6.jsonl', {
      logFilePath: 'room-6.jsonl',
      roomCode: 'ROOM6',
      startTime: 1000,
      endTime: 0,
      winner: '',
      status: 'ACTIVE',
      playerCount: 4,
      fileSizeBytes: 0,
      totalEvents: 0,
    });
    fs.writeFileSync(path.join(tempDir, 'room-6.jsonl'), '{"type":"EVENT"}\n', 'utf8');

    cloudSync.finalizeRoomArchive({
      logDir: tempDir,
      fileName: 'room-6.jsonl',
      manifest,
      summary: { status: 'TERMINATED', endTime: 2000 },
      saveManifest: () => {},
      getArchivedRoomsList: () => Array.from(manifest.values()),
    });

    await Promise.all(cloudSync.pendingUploads);

    expect(manifestUploaded).toBe(true);
  });

  it('TC-RL-SYNC.07 [UC-RL-SYNC/MSS]: Given HTTP 200 on manifest download, When finalizeRoomArchive executes, Then cloud manifest is merged locally', async () => {
    const remoteManifestPayload = JSON.stringify([
      {
        fileName: 'remote-7.jsonl',
        logFilePath: 'remote-7.jsonl',
        roomCode: 'REMOTE7',
        startTime: 500,
        endTime: 1500,
        winner: 'Bot 1',
        status: 'TERMINATED',
        playerCount: 2,
        fileSizeBytes: 120,
        totalEvents: 5,
      },
    ]);

    const mockStorage: ISupabaseStorageService = {
      isConfigured: () => true,
      defaultBucket: 'game-logs',
      uploadFile: async () => true,
      downloadFile: async () => remoteManifestPayload,
      downloadFileWithStatus: async () => ({ data: remoteManifestPayload, status: 200 }),
    };

    const cloudSync = new RoomLoggerCloudSync(mockStorage);
    const manifest = new Map<string, AdminArchivedRoomSummary>();
    manifest.set('room-7.jsonl', {
      logFilePath: 'room-7.jsonl',
      roomCode: 'ROOM7',
      startTime: 1000,
      endTime: 0,
      winner: '',
      status: 'ACTIVE',
      playerCount: 4,
      fileSizeBytes: 0,
      totalEvents: 0,
    });
    fs.writeFileSync(path.join(tempDir, 'room-7.jsonl'), '{"type":"EVENT"}\n', 'utf8');

    cloudSync.finalizeRoomArchive({
      logDir: tempDir,
      fileName: 'room-7.jsonl',
      manifest,
      summary: { status: 'TERMINATED', endTime: 2000 },
      saveManifest: () => {},
      getArchivedRoomsList: () => Array.from(manifest.values()),
    });

    await Promise.all(cloudSync.pendingUploads);

    expect(manifest.has('remote-7.jsonl')).toBe(true);
    expect(manifest.get('remote-7.jsonl')?.winner).toBe('Bot 1');
  });

  it('TC-RL-SYNC.08 [UC-RL-SYNC/MSS]: Given unconfigured storage, When calling syncCloudManifest, Then completes without calling downloadFile', async () => {
    const cloudSync = new RoomLoggerCloudSync(undefined);
    const manifest = new Map<string, AdminArchivedRoomSummary>();
    let saved = false;

    let err: unknown = null;
    try {
      await cloudSync.syncCloudManifest(manifest, () => { saved = true; });
    } catch (e) {
      err = e;
    }

    expect(err).toBeNull();
    expect(saved).toBe(false);
  });

  it('TC-RL-SYNC.09 [UC-RL-SYNC/MSS]: Given configured storage with valid remote manifest, When calling syncCloudManifest, Then saveManifest called and data merged', async () => {
    const remoteManifestPayload = JSON.stringify([
      {
        fileName: 'synced-room.jsonl',
        logFilePath: 'synced-room.jsonl',
        roomCode: 'SYNCED',
        startTime: 100,
        endTime: 200,
        winner: 'Winner',
        status: 'TERMINATED',
        playerCount: 2,
        fileSizeBytes: 50,
        totalEvents: 2,
      },
    ]);

    const mockStorage: ISupabaseStorageService = {
      isConfigured: () => true,
      defaultBucket: 'game-logs',
      uploadFile: async () => true,
      downloadFile: async () => remoteManifestPayload,
      downloadFileWithStatus: async () => ({ data: remoteManifestPayload, status: 200 }),
    };

    const cloudSync = new RoomLoggerCloudSync(mockStorage);
    const manifest = new Map<string, AdminArchivedRoomSummary>();
    let saved = false;

    await cloudSync.syncCloudManifest(manifest, () => { saved = true; });

    expect(saved).toBe(true);
    expect(manifest.has('synced-room.jsonl')).toBe(true);
  });

  it('TC-RL-SYNC.10 [UC-RL-SYNC/MSS]: Given local log file exists on disk, When calling fetchRemoteLog, Then returns local content without cloud fetch', async () => {
    let cloudDownloadCalled = false;
    const mockStorage: ISupabaseStorageService = {
      isConfigured: () => true,
      uploadFile: async () => true,
      downloadFile: async () => {
        cloudDownloadCalled = true;
        return 'remote_data';
      },
    };

    const cloudSync = new RoomLoggerCloudSync(mockStorage);
    const manifest = new Map<string, AdminArchivedRoomSummary>();
    const localContent = '{"event":"LOCAL_EVENT"}\n';
    fs.writeFileSync(path.join(tempDir, 'LOCAL_100.jsonl'), localContent, 'utf8');

    manifest.set('LOCAL_100.jsonl', {
      logFilePath: 'LOCAL_100.jsonl',
      roomCode: 'LOCAL',
      startTime: 100,
      endTime: 200,
      winner: '',
      status: 'TERMINATED',
      playerCount: 2,
      fileSizeBytes: localContent.length,
      totalEvents: 1,
    });

    const result = await cloudSync.fetchRemoteLog({
      roomCode: 'LOCAL',
      timestamp: 100,
      logDir: tempDir,
      manifest,
      ensureDir: () => {},
      saveManifest: () => {},
    });

    expect(result).toBe(localContent);
    expect(cloudDownloadCalled).toBe(false);
  });

  it('TC-RL-SYNC.11 [UC-RL-SYNC/MSS]: Given log missing on disk but present on cloud, When calling fetchRemoteLog, Then caches to disk and returns content', async () => {
    const remoteContent = '{"event":"CLOUD_EVENT"}\n';
    const mockStorage: ISupabaseStorageService = {
      isConfigured: () => true,
      defaultBucket: 'game-logs',
      uploadFile: async () => true,
      downloadFile: async () => remoteContent,
    };

    const cloudSync = new RoomLoggerCloudSync(mockStorage);
    const manifest = new Map<string, AdminArchivedRoomSummary>();

    let saved = false;
    const result = await cloudSync.fetchRemoteLog({
      roomCode: 'REMOTE11',
      timestamp: 1100,
      logDir: tempDir,
      manifest,
      ensureDir: () => {},
      saveManifest: () => { saved = true; },
    });

    expect(result).toBe(remoteContent);
    expect(saved).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'REMOTE11_1100.jsonl'))).toBe(true);
  });

  it('TC-RL-SYNC.12 [UC-RL-SYNC/MSS]: Given remote storage does not have file, When calling fetchRemoteLog, Then returns null safely', async () => {
    const mockStorage: ISupabaseStorageService = {
      isConfigured: () => true,
      uploadFile: async () => true,
      downloadFile: async () => null,
    };

    const cloudSync = new RoomLoggerCloudSync(mockStorage);
    const unconfiguredSync = new RoomLoggerCloudSync(undefined);
    const manifest = new Map<string, AdminArchivedRoomSummary>();

    const result = await cloudSync.fetchRemoteLog({
      roomCode: 'UNKNOWN',
      logDir: tempDir,
      manifest,
      ensureDir: () => {},
      saveManifest: () => {},
    });
    const unconfResult = await unconfiguredSync.fetchRemoteLog({
      roomCode: 'ANY',
      logDir: tempDir,
      manifest,
      ensureDir: () => {},
      saveManifest: () => {},
    });

    expect(result).toBeNull();
    expect(unconfResult).toBeNull();
  });

  it('TC-RL-SYNC.13 [UC-RL-SYNC/MSS]: Given pending uploads in progress, When calling stop(), Then all uploads complete and pendingUploads empty', async () => {
    const cloudSync = new RoomLoggerCloudSync(undefined);
    let resolved = false;
    const slowUpload = new Promise<void>((resolve) => {
      setTimeout(() => {
        resolved = true;
        resolve();
      }, 10);
    });

    cloudSync.pendingUploads.push(slowUpload);

    await cloudSync.stop();

    expect(resolved).toBe(true);
    expect(cloudSync.pendingUploads.length).toBe(0);
  });

  it('TC-RL-SYNC.14 [UC-RL-SYNC/MSS]: Given PersistentRoomLogger initialized, When checking pendingUploads and cloudSync, Then pendingUploads shares array reference with cloudSync', () => {
    const logger = new PersistentRoomLogger({ logDir: tempDir });
    expect(logger.cloudSync).toBeDefined();
    expect(logger.pendingUploads).toBe(logger.cloudSync.pendingUploads);
  });
});
