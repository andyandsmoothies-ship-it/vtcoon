// [IMP-169/MSS][UC-IMP169] Supabase Cloud Log Persistence, Self-Healing Re-indexer & Test Isolation
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
import type {
  AdminRoomLogEntry,
  AdminArchivedRoomSummary,
} from '../../src/server/network/admin_types.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

export interface SupabaseStorageConfig {
  readonly url?: string;
  readonly key?: string;
  readonly defaultBucket?: string;
}

export interface ISupabaseStorageService {
  readonly isConfigured: boolean | (() => boolean);
  uploadFile(bucket: string, path: string, content: string | Buffer, contentType?: string): Promise<boolean>;
  downloadFile(bucket: string, path: string): Promise<string | null>;
}

type SupabaseStorageCtor = new (config?: SupabaseStorageConfig) => ISupabaseStorageService;

let SupabaseStorageService: SupabaseStorageCtor | null = null;

beforeAll(async () => {
  try {
    // @ts-ignore - TS2307: Module will be created in Station 2 (Implementation)
    const mod = await import('../../src/server/storage/supabase_storage.js');
    SupabaseStorageService = mod.SupabaseStorageService ?? null;
  } catch {
    SupabaseStorageService = null;
  }
});

function getStorageServiceClass(): SupabaseStorageCtor {
  expect(SupabaseStorageService, 'SupabaseStorageService must be exported from src/server/storage/supabase_storage.js').toBeDefined();
  expect(SupabaseStorageService).not.toBeNull();
  return SupabaseStorageService!;
}

const createdTempDirs: string[] = [];

function createTempLogDir(prefix: string): string {
  const dir = path.resolve(
    process.cwd(),
    '.agents',
    'tmp',
    `test_logs_imp169_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  );
  fs.mkdirSync(dir, { recursive: true });
  createdTempDirs.push(dir);
  return dir;
}

describe('[IMP-169][Contract A] SupabaseStorageService Contract Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('[TC-IMP169.01a/MSS][UC-IMP169] isConfigured returns true when both url and key are provided', () => {
    const ServiceClass = getStorageServiceClass();
    const service = new ServiceClass({
      url: 'https://test-project.supabase.co',
      key: 'sb-valid-service-role-key-secret',
    });
    const configured = typeof service.isConfigured === 'function' ? service.isConfigured() : service.isConfigured;
    expect(configured).toBe(true);
  });

  it.each([
    { label: 'empty url', url: '', key: 'valid-key' },
    { label: 'empty key', url: 'https://test.supabase.co', key: '' },
    { label: 'missing url', url: undefined, key: 'valid-key' },
    { label: 'missing key', url: 'https://test.supabase.co', key: undefined },
    { label: 'whitespace url', url: '   ', key: 'valid-key' },
    { label: 'whitespace key', url: 'https://test.supabase.co', key: '   ' },
  ])('[TC-IMP169.01b/MSS][UC-IMP169] isConfigured returns false when credentials are invalid: $label', ({ url, key }) => {
    const ServiceClass = getStorageServiceClass();
    const service = new ServiceClass({ url, key });
    const configured = typeof service.isConfigured === 'function' ? service.isConfigured() : service.isConfigured;
    expect(configured).toBe(false);
  });

  it('[TC-IMP169.02/MSS][UC-IMP169] uploadFile sends POST request to /storage/v1/object/${bucket}/${path} with auth headers and x-upsert', async () => {
    const ServiceClass = getStorageServiceClass();
    const service = new ServiceClass({
      url: 'https://test-project.supabase.co',
      key: 'sb-test-key-123',
    });

    const mockFetch = vi.fn().mockResolvedValue(new Response('{"Key":"room-logs/ROOM01_1700.jsonl"}', { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);

    const ok = await service.uploadFile('room-logs', 'ROOM01_1700.jsonl', '{"action":"START"}', 'application/jsonl');

    expect(ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://test-project.supabase.co/storage/v1/object/room-logs/ROOM01_1700.jsonl',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          apikey: 'sb-test-key-123',
          Authorization: 'Bearer sb-test-key-123',
          'x-upsert': 'true',
          'Content-Type': 'application/jsonl',
        }),
        body: '{"action":"START"}',
      }),
    );
  });

  it('[TC-IMP169.03a/Adversarial][UC-IMP169] uploadFile returns false without throwing uncaught exception on HTTP 500 error', async () => {
    const ServiceClass = getStorageServiceClass();
    const service = new ServiceClass({
      url: 'https://test-project.supabase.co',
      key: 'sb-test-key-123',
    });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Internal Server Error', { status: 500 })));

    const result = await service.uploadFile('room-logs', 'ERR_500.jsonl', 'content');
    expect(result).toBe(false);
  });

  it('[TC-IMP169.03b/Adversarial][UC-IMP169] uploadFile returns false without throwing uncaught exception on network timeout/rejection', async () => {
    const ServiceClass = getStorageServiceClass();
    const service = new ServiceClass({
      url: 'https://test-project.supabase.co',
      key: 'sb-test-key-123',
    });

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ETIMEDOUT: Connection timed out')));

    const result = await service.uploadFile('room-logs', 'ERR_TIMEOUT.jsonl', 'content');
    expect(result).toBe(false);
  });

  it('[TC-IMP169.04/MSS][UC-IMP169] downloadFile sends GET request with auth headers and returns string content on HTTP 200', async () => {
    const ServiceClass = getStorageServiceClass();
    const service = new ServiceClass({
      url: 'https://test-project.supabase.co',
      key: 'sb-test-key-123',
    });

    const mockContent = '{"roomCode":"TEST01","events":[]}';
    const mockFetch = vi.fn().mockResolvedValue(new Response(mockContent, { status: 200 }));
    vi.stubGlobal('fetch', mockFetch);

    const data = await service.downloadFile('room-logs', '_manifest/rooms_manifest.json');

    expect(data).toBe(mockContent);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://test-project.supabase.co/storage/v1/object/room-logs/_manifest/rooms_manifest.json',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          apikey: 'sb-test-key-123',
          Authorization: 'Bearer sb-test-key-123',
        }),
      }),
    );
  });

  it('[TC-IMP169.05a/Adversarial][UC-IMP169] downloadFile returns null without crash when target file does not exist (HTTP 404)', async () => {
    const ServiceClass = getStorageServiceClass();
    const service = new ServiceClass({
      url: 'https://test-project.supabase.co',
      key: 'sb-test-key-123',
    });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Object not found', { status: 404 })));

    const data = await service.downloadFile('room-logs', 'nonexistent.jsonl');
    expect(data).toBeNull();
  });

  it('[TC-IMP169.05b/Adversarial][UC-IMP169] downloadFile returns null without crash when network connection fails', async () => {
    const ServiceClass = getStorageServiceClass();
    const service = new ServiceClass({
      url: 'https://test-project.supabase.co',
      key: 'sb-test-key-123',
    });

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ENOTFOUND: Supabase host unreachable')));

    const data = await service.downloadFile('room-logs', 'offline.jsonl');
    expect(data).toBeNull();
  });
});

describe('[IMP-169][Contract B] PersistentRoomLogger Self-Healing, Isolation & Cloud Sync', () => {
  afterEach(() => {
    for (const dir of createdTempDirs) {
      try {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      } catch {
        /* safe-ignore */
      }
    }
    createdTempDirs.length = 0;
    vi.restoreAllMocks();
  });

  it('[TC-IMP169.06/MSS][UC-IMP169] Test Isolation: NODE_ENV=test without logDir points to .agents/tmp/test_logs and never touches server_logs/rooms/', () => {
    const prevEnv = process.env['NODE_ENV'];
    process.env['NODE_ENV'] = 'test';
    try {
      const logger = new PersistentRoomLogger();
      const storageDir = logger.storageDir;
      logger.stop();

      expect(storageDir).toMatch(/[\\/]\.agents[\\/]tmp[\\/]test_logs/);
      expect(storageDir).not.toContain(path.join('server_logs', 'rooms'));
    } finally {
      process.env['NODE_ENV'] = prevEnv;
    }
  });

  it('[TC-IMP169.07/MSS][UC-IMP169] Self-Healing Re-indexer: restores manifest catalog and saves to disk when rooms_manifest.json is missing', () => {
    const testDir = createTempLogDir('reindex');
    const manifestPath = path.join(testDir, 'rooms_manifest.json');
    if (fs.existsSync(manifestPath)) fs.unlinkSync(manifestPath);

    const logFileName = 'HEAL_ROOM_1700000000000.jsonl';
    const logFilePath = path.join(testDir, logFileName);
    const ev1: AdminRoomLogEntry = {
      id: 'h_1',
      roomCode: 'HEAL_ROOM',
      timestamp: 1700000000100,
      source: 'PLAYER',
      action: 'CREATE_ROOM',
      payloadSummary: 'Tạo phòng',
    };
    const ev2: AdminRoomLogEntry = {
      id: 'h_2',
      roomCode: 'HEAL_ROOM',
      timestamp: 1700000000200,
      source: 'PLAYER',
      action: 'FINISH_GAME',
      payloadSummary: 'Kết thúc ván',
    };
    fs.writeFileSync(logFilePath, JSON.stringify(ev1) + '\n' + JSON.stringify(ev2) + '\n', 'utf8');

    const logger = new PersistentRoomLogger({ logDir: testDir });
    const list = logger.getArchivedRoomsList();

    expect(list.length).toBe(1);
    expect(list[0]?.roomCode).toBe('HEAL_ROOM');
    expect(list[0]?.totalEvents).toBe(2);
    expect(fs.existsSync(manifestPath)).toBe(true);

    logger.stop();
  });

  it('[TC-IMP169.08/MSS][UC-IMP169] finishRoomLog trigger Cloud Upload: adds .jsonl and manifest uploads to pendingUploads', () => {
    const testDir = createTempLogDir('upload');
    const mockUpload = vi.fn().mockReturnValue(new Promise((resolve) => setTimeout(() => resolve(true), 100)));
    const mockStorage = {
      isConfigured: true,
      uploadFile: mockUpload,
      downloadFile: vi.fn(),
    };

    const logger = new PersistentRoomLogger({
      logDir: testDir,
      supabaseStorage: mockStorage,
    } as any);

    logger.initRoomLog('CLOUD_UP', { timestamp: 1700000010000 });
    logger.appendEvent('CLOUD_UP', {
      id: 'cup_1',
      roomCode: 'CLOUD_UP',
      timestamp: 1700000010100,
      source: 'PLAYER',
      action: 'START_GAME',
      payloadSummary: 'Bắt đầu',
    });

    logger.finishRoomLog('CLOUD_UP', { status: 'FINISHED' });

    const pending = (logger as any).pendingUploads;
    expect(Array.isArray(pending) && pending.length > 0).toBe(true);
    expect(mockUpload).toHaveBeenCalled();

    logger.stop();
  });

  it('[TC-IMP169.09/Disposal][UC-IMP169] stop() Graceful Exit: awaits all pendingUploads to settle before exiting', async () => {
    const testDir = createTempLogDir('stop_exit');
    let uploadSettled = false;
    const mockUpload = vi.fn().mockImplementation(() => new Promise<boolean>((resolve) => {
      setTimeout(() => {
        uploadSettled = true;
        resolve(true);
      }, 50);
    }));
    const mockStorage = {
      isConfigured: true,
      uploadFile: mockUpload,
      downloadFile: vi.fn(),
    };

    const logger = new PersistentRoomLogger({
      logDir: testDir,
      supabaseStorage: mockStorage,
    } as any);

    logger.initRoomLog('STOP_ROOM', { timestamp: 1700000020000 });
    logger.finishRoomLog('STOP_ROOM', { status: 'FINISHED' });

    expect(uploadSettled).toBe(false);
    await (logger as any).stop();

    expect(uploadSettled).toBe(true);
    expect(((logger as any).pendingUploads ?? []).length).toBe(0);
  });

  it('[TC-IMP169.10/MSS][UC-IMP169] getRoomFullLogAsync Local Cache: returns data immediately from disk without hitting cloud', async () => {
    const testDir = createTempLogDir('local_cache');
    const mockDownload = vi.fn();
    const mockStorage = {
      isConfigured: true,
      uploadFile: vi.fn(),
      downloadFile: mockDownload,
    };

    const logger = new PersistentRoomLogger({
      logDir: testDir,
      supabaseStorage: mockStorage,
    } as any);

    logger.initRoomLog('CACHE_ROOM', { timestamp: 1700000030000 });
    logger.appendEvent('CACHE_ROOM', {
      id: 'cr_1',
      roomCode: 'CACHE_ROOM',
      timestamp: 1700000030100,
      source: 'PLAYER',
      action: 'ROLL_DICE',
      payloadSummary: 'Xí ngầu 4-2',
    });

    const logs = await (logger as any).getRoomFullLogAsync('CACHE_ROOM');

    expect(logs.length).toBe(1);
    expect(logs[0]?.action).toBe('ROLL_DICE');
    expect(mockDownload).not.toHaveBeenCalled();

    logger.stop();
  });

  it('[TC-IMP169.11/MSS][UC-IMP169] getRoomFullLogAsync Cloud Fetch: downloads from cloud, caches to disk, and returns logs when missing locally', async () => {
    const testDir = createTempLogDir('cloud_fetch');
    const cloudEntry: AdminRoomLogEntry = {
      id: 'cf_1',
      roomCode: 'REMOTE_ROOM',
      timestamp: 1700000040100,
      source: 'BOT',
      action: 'BUY_LAND',
      payloadSummary: 'Mua ô 5',
    };
    const mockDownload = vi.fn().mockResolvedValue(JSON.stringify(cloudEntry) + '\n');
    const mockStorage = {
      isConfigured: true,
      uploadFile: vi.fn(),
      downloadFile: mockDownload,
    };

    const logger = new PersistentRoomLogger({
      logDir: testDir,
      supabaseStorage: mockStorage,
    } as any);

    const logs = await (logger as any).getRoomFullLogAsync('REMOTE_ROOM', 1700000040000);

    expect(logs.length).toBe(1);
    expect(logs[0]?.action).toBe('BUY_LAND');
    expect(mockDownload).toHaveBeenCalled();
    const cachedFilePath = path.join(testDir, 'REMOTE_ROOM_1700000040000.jsonl');
    expect(fs.existsSync(cachedFilePath)).toBe(true);

    logger.stop();
  });

  it('[TC-IMP169.12/Adversarial][UC-IMP169] getRoomFullLogAsync Graceful: returns empty array without error when file missing on disk and cloud', async () => {
    const testDir = createTempLogDir('nonexistent');
    const mockDownload = vi.fn().mockResolvedValue(null);
    const mockStorage = {
      isConfigured: true,
      uploadFile: vi.fn(),
      downloadFile: mockDownload,
    };

    const logger = new PersistentRoomLogger({
      logDir: testDir,
      supabaseStorage: mockStorage,
    } as any);

    const logs = await (logger as any).getRoomFullLogAsync('UNKNOWN_ROOM_999');

    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBe(0);

    logger.stop();
  });

  it('[TC-IMP169.13/MSS][UC-IMP169] syncCloudManifest: downloads _manifest/rooms_manifest.json from cloud and populates in-memory catalog', async () => {
    const testDir = createTempLogDir('sync_manifest');
    const cloudManifestData: AdminArchivedRoomSummary[] = [
      {
        roomCode: 'SYNC_ROOM_88',
        startTime: 1700000050000,
        playerCount: 3,
        logFilePath: 'SYNC_ROOM_88_1700000050000.jsonl',
        status: 'FINISHED',
        totalEvents: 42,
        fileSizeBytes: 2048,
      },
    ];
    const mockDownload = vi.fn().mockResolvedValue(JSON.stringify(cloudManifestData));
    const mockStorage = {
      isConfigured: true,
      uploadFile: vi.fn(),
      downloadFile: mockDownload,
    };

    const logger = new PersistentRoomLogger({
      logDir: testDir,
      supabaseStorage: mockStorage,
    } as any);

    expect(logger.getArchivedRoomsList().length).toBe(0);
    await (logger as any).syncCloudManifest();

    const list = logger.getArchivedRoomsList();
    expect(list.length).toBe(1);
    expect(list[0]?.roomCode).toBe('SYNC_ROOM_88');
    expect(list[0]?.totalEvents).toBe(42);

    logger.stop();
  });
});

describe('[IMP-169][Contract C] AdminManager & Message Handler Async Pipeline', () => {
  afterEach(() => {
    for (const dir of createdTempDirs) {
      try {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      } catch {
        /* safe-ignore */
      }
    }
    createdTempDirs.length = 0;
    vi.restoreAllMocks();
  });

  it('[TC-IMP169.14/MSS][UC-IMP169] handleAdminClientMessage ADMIN_GET_ARCHIVED_LOGS: calls async pipeline and sends ADMIN_ARCHIVED_LOG_DATA with logs', async () => {
    const testDir = createTempLogDir('admin_logs');
    const admin = new AdminManager({
      roomManager: new RoomManager(),
      secret: 'test-admin-secret-169',
      loggerDir: testDir,
    });

    const mockSocket = { readyState: 1, send: vi.fn() } as unknown as WebSocket;
    admin.authenticate(mockSocket, 'test-admin-secret-169');

    admin.logger.initRoomLog('ARCHIVE_ASYNC_01', { timestamp: 1700000060000 });
    admin.logger.appendEvent('ARCHIVE_ASYNC_01', {
      id: 'adm_ev_1',
      roomCode: 'ARCHIVE_ASYNC_01',
      timestamp: 1700000060100,
      source: 'PLAYER',
      action: 'BUILD_HOUSE',
      payloadSummary: 'Xây khách sạn',
    });
    admin.logger.finishRoomLog('ARCHIVE_ASYNC_01', { status: 'FINISHED' });

    const sentMessages: WsServerMessage[] = [];
    const sendSafe = (_s: WebSocket, m: WsServerMessage): void => {
      sentMessages.push(m);
    };

    const handleAdminClientMessage = (AdminMessageHandler as Record<string, any>).handleAdminClientMessage;
    expect(handleAdminClientMessage, 'handleAdminClientMessage must be exported from admin_message_handler.ts').toBeDefined();

    expect(typeof (admin as any).getRoomFullLogAsync, 'AdminManager must provide getRoomFullLogAsync').toBe('function');
    const getLogAsyncSpy = vi.spyOn(admin as any, 'getRoomFullLogAsync');

    await handleAdminClientMessage(admin, mockSocket, {
      type: 'ADMIN_GET_ARCHIVED_LOGS',
      roomCode: 'ARCHIVE_ASYNC_01',
    }, sendSafe);

    expect(sentMessages.length).toBe(1);
    expect(sentMessages[0]?.type).toBe('ADMIN_ARCHIVED_LOG_DATA');
    expect(getLogAsyncSpy).toHaveBeenCalled();
  });

  it('[TC-IMP169.15/MSS][UC-IMP169] handleAdminClientMessage ADMIN_GET_ARCHIVED_ROOMLIST: calls async pipeline and returns archived room list with metadata', async () => {
    const testDir = createTempLogDir('admin_roomlist');
    const admin = new AdminManager({
      roomManager: new RoomManager(),
      secret: 'test-admin-secret-169',
      loggerDir: testDir,
    });

    const mockSocket = { readyState: 1, send: vi.fn() } as unknown as WebSocket;
    admin.authenticate(mockSocket, 'test-admin-secret-169');

    admin.logger.initRoomLog('ARCHIVE_ASYNC_02', { timestamp: 1700000070000, playerCount: 3 });
    admin.logger.finishRoomLog('ARCHIVE_ASYNC_02', { status: 'FINISHED', winner: 'player_winner_1' });

    const sentMessages: WsServerMessage[] = [];
    const sendSafe = (_s: WebSocket, m: WsServerMessage): void => {
      sentMessages.push(m);
    };

    const handleAdminClientMessage = (AdminMessageHandler as Record<string, any>).handleAdminClientMessage;
    expect(handleAdminClientMessage, 'handleAdminClientMessage must be exported from admin_message_handler.ts').toBeDefined();

    // Supports both ADMIN_GET_ARCHIVED_ROOMLIST and ADMIN_GET_ARCHIVED_ROOMS
    await handleAdminClientMessage(admin, mockSocket, {
      type: 'ADMIN_GET_ARCHIVED_ROOMLIST' as any,
    }, sendSafe);

    expect(sentMessages.length).toBe(1);
    expect(sentMessages[0]?.type).toBe('ADMIN_ARCHIVED_ROOM_LIST');
    const roomListMsg = sentMessages[0] as { type: 'ADMIN_ARCHIVED_ROOM_LIST'; rooms: AdminArchivedRoomSummary[] };
    expect(roomListMsg.rooms.length).toBe(1);
    expect(roomListMsg.rooms[0]?.roomCode).toBe('ARCHIVE_ASYNC_02');
  });
});
