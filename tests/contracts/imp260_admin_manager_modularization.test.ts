// [TC-260.01/MSS..TC-260.17/MSS][UC-ADM-MOD/MSS] IMP-260: Modularize Admin Manager Coordinator Contract Test Suite
import { describe, it, expect, vi } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import { RoomManager } from '../../src/server/room_manager.js';
import { PersistentRoomLogger } from '../../src/server/logging/persistent_room_logger.js';
import type { ISupabaseStorageService } from '../../src/server/storage/supabase_storage.js';
import * as SupabaseLogSync from '../../src/server/storage/supabase_log_sync.js';
import { collectServerVitals } from '../../src/server/network/admin_vitals.js';
import { syncAdminCloudLogs } from '../../src/server/network/admin_cloud_sync.js';
import { AdminEventStore } from '../../src/server/network/admin_event_store.js';
import { AdminManager } from '../../src/server/network/admin_manager.js';

// Real ephemeral WebSocket fixture on port: 0 for zero-cast, live TCP testing
async function createLiveSocketPair(): Promise<{
  wss: WebSocketServer;
  serverSocket: WebSocket;
  clientSocket: WebSocket;
  cleanup: () => Promise<void>;
}> {
  const wss = new WebSocketServer({ port: 0 });
  await new Promise<void>((resolve) => wss.once('listening', resolve));
  const port = (wss.address() as { port: number }).port;

  const [serverSocket, clientSocket] = await Promise.all([
    new Promise<WebSocket>((resolve) => wss.once('connection', resolve)),
    new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}`);
      ws.once('open', () => resolve(ws));
      ws.once('error', reject);
    }),
  ]);

  const cleanup = async () => {
    try { clientSocket.terminate(); } catch {}
    try { serverSocket.terminate(); } catch {}
    await new Promise<void>((resolve) => wss.close(() => resolve()));
  };

  return { wss, serverSocket, clientSocket, cleanup };
}

describe('[IMP-260/MSS][UC-ADM-MOD/MSS] Admin Manager Coordinator Modularization Contract Suite', () => {
  it('[TC-260.01/MSS][UC-ADM-MOD/MSS] collectServerVitals tính toán chính xác chỉ số bộ nhớ RAM, uptime và số lượng phòng live/lobby', () => {
    const roomManager = new RoomManager();
    const liveRoom = roomManager.createRoom('HOST1', 'Host Live');
    liveRoom.started = true;
    const lobbyRoom = roomManager.createRoom('HOST2', 'Host Lobby');
    lobbyRoom.started = false;

    const roomLogger = new PersistentRoomLogger({ logDir: './server_logs/test_imp260_vitals' });
    const vitals = collectServerVitals(roomManager, roomLogger);

    expect(vitals.totalRooms).toBe(2);
    expect(vitals.liveRooms).toBe(1);
    expect(vitals.lobbyRooms).toBe(1);
    expect(vitals.memoryRssMb).toBeGreaterThan(0);
  });

  it('[TC-260.02/MSS][UC-ADM-MOD/MSS] collectServerVitals phản ánh đúng trạng thái cấu hình của Supabase storage provider', () => {
    const customStorage: ISupabaseStorageService = {
      isConfigured: () => true,
      defaultBucket: 'production-audit-logs',
      keyType: 'JWT',
      uploadFile: vi.fn(),
      downloadFile: vi.fn(),
    };
    const roomLogger = new PersistentRoomLogger({
      logDir: './server_logs/test_imp260_storage',
      supabaseStorage: customStorage,
    });
    const vitals = collectServerVitals(new RoomManager(), roomLogger);

    expect(vitals.storageStatus?.configured).toBe(true);
    expect(vitals.storageStatus?.bucket).toBe('production-audit-logs');
    expect(vitals.storageStatus?.keyType).toBe('JWT');
    expect(vitals.storageStatus?.provider).toBe('supabase');
  });

  it('[TC-260.03/MSS][UC-ADM-MOD/MSS] syncAdminCloudLogs gọi flushSync trên PersistentRoomLogger trước khi tiến hành quét đồng bộ file', async () => {
    const roomLogger = new PersistentRoomLogger({ logDir: './server_logs/test_imp260_sync' });
    const flushSpy = vi.spyOn(roomLogger, 'flushSync');
    vi.spyOn(SupabaseLogSync, 'syncAllLocalLogsToCloud').mockResolvedValueOnce({
      success: true,
      uploadedCount: 0,
      totalCount: 0,
      bucket: 'game-logs',
    });

    await syncAdminCloudLogs(roomLogger);

    expect(flushSpy).toHaveBeenCalledTimes(1);
  });

  it('[TC-260.04/MSS][UC-ADM-MOD/MSS] syncAdminCloudLogs chuyển giao kết quả đồng bộ từ syncAllLocalLogsToCloud và bọc ngoại lệ thành SYNC_EXCEPTION', async () => {
    const roomLogger = new PersistentRoomLogger({ logDir: './server_logs/test_imp260_sync_err' });
    vi.spyOn(SupabaseLogSync, 'syncAllLocalLogsToCloud').mockRejectedValueOnce(new Error('NETWORK_CRASH'));

    const result = await syncAdminCloudLogs(roomLogger);
    expect(result.success).toBe(false);
    expect(result.reason).toBe('SYNC_EXCEPTION');
    expect(result.error).toBe('NETWORK_CRASH');
  });

  it('[TC-260.05/MSS][UC-ADM-MOD/MSS] AdminEventStore.recordRoomEvent lưu trữ log vào bộ nhớ đệm và ghi file nhật ký qua PersistentRoomLogger', () => {
    const roomLogger = new PersistentRoomLogger({ logDir: './server_logs/test_imp260_store' });
    const appendSpy = vi.spyOn(roomLogger, 'appendEvent');
    const store = new AdminEventStore(roomLogger);

    const entry = store.recordRoomEvent('room_alpha', {
      source: 'SERVER',
      action: 'GAME_START',
      payloadSummary: 'Game session initialized',
    });

    expect(appendSpy).toHaveBeenCalledWith('ROOM_ALPHA', expect.objectContaining({
      roomCode: 'ROOM_ALPHA',
      action: 'GAME_START',
    }));
    expect(store.getRecentLogs('room_alpha')).toEqual([entry]);
    expect(entry.roomCode).toBe('ROOM_ALPHA');
  });

  it('[TC-260.06/MSS][UC-ADM-MOD/MSS] AdminEventStore.recordViolation ghi nhận vi phạm vào mảng roomViolations mà không làm hỏng cấu trúc event', () => {
    const roomLogger = new PersistentRoomLogger({ logDir: './server_logs/test_imp260_violation' });
    const store = new AdminEventStore(roomLogger);

    store.recordViolation('ROOM_BETA', 'NEGATIVE_BALANCE', 'Balance dropped below zero outside insolvency');
    const violations = store.getViolations('ROOM_BETA');

    expect(violations).toHaveLength(1);
    expect(violations?.[0]?.type).toBe('NEGATIVE_BALANCE');
    expect(violations?.[0]?.message).toBe('Balance dropped below zero outside insolvency');
    expect(store.getRecentLogs('ROOM_BETA')).toEqual([]);
  });

  it('[TC-260.07/MSS][UC-ADM-MOD/MSS] AdminManager.getServerVitals ủy quyền sang collectServerVitals và trả về kết quả tương thích 100%', () => {
    const roomManager = new RoomManager();
    const admin = new AdminManager({ roomManager, secret: 'test-admin-secret', loggerDir: './server_logs/test_imp260_facade' });

    const vitals = admin.getServerVitals();

    expect(vitals.totalRooms).toBe(0);
    expect(vitals.storageStatus?.provider).toBe('supabase');
    expect(vitals.memoryRssMb).toBeGreaterThan(0);
    expect(vitals.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(admin.getRoomsSummary()).toEqual([]);
  });

  it('[TC-260.08/MSS][UC-ADM-MOD/MSS] AdminManager.syncCloudLogs thiết lập cờ mutex isSyncingCloud thành true trong quá trình đồng bộ và từ chối lời gọi đồng thời với ALREADY_SYNCING', async () => {
    const roomManager = new RoomManager();
    const admin = new AdminManager({ roomManager, secret: 'test-admin-secret', loggerDir: './server_logs/test_imp260_mutex' });

    let resolveSync!: (value: SupabaseLogSync.SyncCloudLogsResult) => void;
    const pendingPromise = new Promise<SupabaseLogSync.SyncCloudLogsResult>((resolve) => {
      resolveSync = resolve;
    });
    vi.spyOn(SupabaseLogSync, 'syncAllLocalLogsToCloud').mockReturnValueOnce(pendingPromise);

    const firstCallPromise = admin.syncCloudLogs();
    expect(admin.isSyncing).toBe(true);

    const concurrentCallResult = await admin.syncCloudLogs();
    expect(concurrentCallResult).toEqual({ success: false, reason: 'ALREADY_SYNCING' });

    resolveSync({ success: true, uploadedCount: 0, totalCount: 0, bucket: 'game-logs' });
    await firstCallPromise;
    expect(admin.isSyncing).toBe(false);
  });

  it('[TC-260.09/MSS][UC-ADM-MOD/MSS] AdminManager.syncCloudLogs giải phóng cờ mutex isSyncingCloud thành false trong khối finally kể cả khi có ngoại lệ phát sinh', async () => {
    const roomManager = new RoomManager();
    const admin = new AdminManager({ roomManager, secret: 'test-admin-secret', loggerDir: './server_logs/test_imp260_mutex_err' });

    vi.spyOn(SupabaseLogSync, 'syncAllLocalLogsToCloud').mockRejectedValueOnce(new Error('FATAL_IO_FAULT'));

    const res = await admin.syncCloudLogs();
    expect(res.success).toBe(false);
    expect(res.reason).toBe('SYNC_EXCEPTION');
    expect(admin.isSyncing).toBe(false);
  });

  it('[TC-260.10/MSS][UC-ADM-MOD/MSS] AdminManager.recordRoomEvent phát sóng ADMIN_ROOM_LOG tới toàn bộ WebSocket đã đăng ký phòng', async () => {
    const { serverSocket, clientSocket, cleanup } = await createLiveSocketPair();
    const { serverSocket: closedServer, clientSocket: closedClient, cleanup: closedCleanup } = await createLiveSocketPair();
    try {
      const roomManager = new RoomManager();
      const room = roomManager.createRoom('HOST1', 'Player Host');
      const admin = new AdminManager({ roomManager, secret: 'test-admin-secret', loggerDir: './server_logs/test_imp260_bcast' });

      expect(admin.authenticate(serverSocket, 'test-admin-secret')).toBe(true);
      admin.subscribeRoom(serverSocket, room.roomCode);

      expect(admin.authenticate(closedServer, 'test-admin-secret')).toBe(true);
      admin.subscribeRoom(closedServer, room.roomCode);
      // Terminate client to transition closedServer to CLOSED
      closedClient.terminate();
      await new Promise((r) => setTimeout(r, 20));

      const messagePromise = new Promise<string>((resolve) => {
        clientSocket.once('message', (data) => resolve(data.toString()));
      });

      admin.recordRoomEvent(room.roomCode, {
        source: 'SYSTEM',
        action: 'TURN_TIMEOUT',
        payloadSummary: 'Turn expired after 60s',
      });

      const raw = await messagePromise;
      const sentPayload = JSON.parse(raw);
      expect(sentPayload.type).toBe('ADMIN_ROOM_LOG');
      expect(sentPayload.log.action).toBe('TURN_TIMEOUT');
      expect(sentPayload.roomCode).toBe(room.roomCode);

      // Closed socket is pruned from authenticatedSockets (kills || mutant)
      expect(admin.isAuthenticated(closedServer)).toBe(false);
    } finally {
      await cleanup();
      await closedCleanup();
    }
  });

  it('[TC-260.11/MSS][UC-ADM-MOD/MSS] AdminManager.recordRoomViolation gọi qua recordRoomEvent bảo toàn chuỗi gọi hàm và phát sóng thông điệp INVARIANT_VIOLATION', async () => {
    const { serverSocket, clientSocket, cleanup } = await createLiveSocketPair();
    try {
      const roomManager = new RoomManager();
      const room = roomManager.createRoom('HOST1', 'Player Host');
      const admin = new AdminManager({ roomManager, secret: 'test-admin-secret', loggerDir: './server_logs/test_imp260_violation_chain' });

      const eventSpy = vi.spyOn(admin, 'recordRoomEvent');
      expect(admin.authenticate(serverSocket, 'test-admin-secret')).toBe(true);
      admin.subscribeRoom(serverSocket, room.roomCode);

      const messagePromise = new Promise<string>((resolve) => {
        clientSocket.once('message', (data) => resolve(data.toString()));
      });

      admin.recordRoomViolation(room.roomCode, 'INVARIANT_BROKEN', 'Treasury sum mismatch');

      expect(eventSpy).toHaveBeenCalledWith(room.roomCode, expect.objectContaining({
        source: 'SYSTEM',
        action: 'INVARIANT_VIOLATION',
        payloadSummary: '[INVARIANT_BROKEN] Treasury sum mismatch',
      }));

      const raw = await messagePromise;
      const sentPayload = JSON.parse(raw);
      expect(sentPayload.log.action).toBe('INVARIANT_VIOLATION');
    } finally {
      await cleanup();
    }
  });

  it('[TC-260.12/MSS][UC-ADM-MOD/MSS] AdminManager.clearRoom dọn sạch nhật ký sự kiện và danh sách vi phạm khi phòng kết thúc', () => {
    const roomManager = new RoomManager();
    const room = roomManager.createRoom('HOST1', 'Player Host');
    const admin = new AdminManager({ roomManager, secret: 'test-admin-secret', loggerDir: './server_logs/test_imp260_clear' });

    admin.recordRoomViolation(room.roomCode, 'TEST_VIO', 'Violation before teardown');
    expect(admin.getRecentLogs(room.roomCode).length).toBeGreaterThan(0);

    admin.handleRoomClosed(room.roomCode);

    expect(admin.getRecentLogs(room.roomCode)).toEqual([]);
    expect(admin.getDiagnosticDump(room.roomCode)?.violations).toEqual([]);
  });

  it('[TC-260.13/MSS][UC-ADM-MOD/MSS] AdminManager.getRecentLogs hỗ trợ lọc theo playerId và trả về toàn bộ log khi không truyền playerId', () => {
    const roomManager = new RoomManager();
    const room = roomManager.createRoom('HOST1', 'Player Host');
    const admin = new AdminManager({ roomManager, secret: 'test-admin-secret', loggerDir: './server_logs/test_imp260_logs_filter' });

    admin.recordRoomEvent(room.roomCode, {
      source: 'PLAYER',
      action: 'INTENT_BUY',
      payloadSummary: 'Player 1 bought property',
      playerId: 'player_001',
    });
    admin.recordRoomEvent(room.roomCode, {
      source: 'PLAYER',
      action: 'INTENT_PASS',
      payloadSummary: 'Player 2 passed turn',
      playerId: 'player_002',
    });

    const allLogs = admin.getRecentLogs(room.roomCode);
    const filteredLogs = admin.getRecentLogs(room.roomCode, 'player_001');

    expect(allLogs).toHaveLength(2);
    expect(filteredLogs).toHaveLength(1);
    expect(filteredLogs[0]?.playerId).toBe('player_001');
  });

  it('[TC-260.14/MSS][UC-ADM-MOD/MSS] AdminManager.evaluateRoomHealth đánh giá tình trạng phòng dựa trên vi phạm lấy từ AdminEventStore', () => {
    const roomManager = new RoomManager();
    const room = roomManager.createRoom('HOST1', 'Player Host');
    const admin = new AdminManager({ roomManager, secret: 'test-admin-secret', loggerDir: './server_logs/test_imp260_health' });

    const initialHealth = admin.evaluateRoomHealth(room);
    expect(initialHealth.status).toBe('NORMAL');

    admin.recordRoomViolation(room.roomCode, 'ILLEGAL_STATE', 'State desync detected');
    const degradedHealth = admin.evaluateRoomHealth(room);

    expect(degradedHealth.status).toBe('CRITICAL');
    expect(degradedHealth.warningReason).toBe('[ILLEGAL_STATE] State desync detected');
  });

  it('[TC-260.15/MSS][UC-ADM-MOD/MSS] AdminManager.getRoomDetail và getRoomsSummary tích hợp đầy đủ danh sách vi phạm từ AdminEventStore', () => {
    const roomManager = new RoomManager();
    const room = roomManager.createRoom('HOST1', 'Player Host');
    const admin = new AdminManager({ roomManager, secret: 'test-admin-secret', loggerDir: './server_logs/test_imp260_summary' });

    admin.recordRoomViolation(room.roomCode, 'DESYNC_ALERT', 'Position jump alert');

    const detail = admin.getRoomDetail(room.roomCode);
    const summaryList = admin.getRoomsSummary();
    expect(summaryList).toHaveLength(1);
    const roomSummary = summaryList.find((s) => s.roomCode === room.roomCode);

    expect(detail?.status).toBe('CRITICAL');
    expect(detail?.warningReason).toBe('[DESYNC_ALERT] Position jump alert');
    expect(roomSummary?.status).toBe('CRITICAL');
    expect(roomSummary?.warningReason).toBe('[DESYNC_ALERT] Position jump alert');
  });

  it('[TC-260.16/MSS][UC-ADM-MOD/MSS] AdminManager.subscribeRoom kiểm tra guard ADMIN_UNAUTHORIZED và ADMIN_ROOM_NOT_FOUND trước khi gán socket vào danh sách theo dõi', async () => {
    const { serverSocket, cleanup } = await createLiveSocketPair();
    try {
      const roomManager = new RoomManager();
      const admin = new AdminManager({ roomManager, secret: 'test-admin-secret', loggerDir: './server_logs/test_imp260_subscribe' });

      const unauthResult = admin.subscribeRoom(serverSocket, 'ROOM_X');
      expect(unauthResult).toEqual({ success: false, reason: 'ADMIN_UNAUTHORIZED' });

      // Wrong secret fails (kills && mutant)
      expect(admin.authenticate(serverSocket, 'wrong-secret')).toBe(false);

      // Correct secret succeeds and attaches listener once (kills !this.authenticatedSockets.has mutant)
      expect(admin.authenticate(serverSocket, 'test-admin-secret')).toBe(true);
      expect(serverSocket.listenerCount('error')).toBe(1);
      expect(admin.authenticate(serverSocket, 'test-admin-secret')).toBe(true);
      expect(serverSocket.listenerCount('error')).toBe(1);

      const notFoundResult = admin.subscribeRoom(serverSocket, 'NON_EXISTENT_ROOM');
      expect(notFoundResult).toEqual({ success: false, reason: 'ADMIN_ROOM_NOT_FOUND' });

      // Subscribing to an existing room with logs returns recent logs (kills > mutant)
      const liveRoom = roomManager.createRoom('HOST_SUB', 'Host Sub');
      admin.recordRoomViolation(liveRoom.roomCode, 'VIO', 'Test Vio');
      vi.spyOn(admin.logger, 'getRoomFullLog').mockReturnValueOnce([{
        id: 'archival_log_1',
        roomCode: liveRoom.roomCode,
        timestamp: Date.now(),
        source: 'SYSTEM',
        action: 'ARCHIVAL_SNAPSHOT',
        payloadSummary: 'Archival snapshot',
      }]);
      const subResult = admin.subscribeRoom(serverSocket, liveRoom.roomCode);
      expect(subResult.success).toBe(true);
      expect(subResult.recentLogs?.[0]?.action).toBe('ARCHIVAL_SNAPSHOT');
    } finally {
      await cleanup();
    }
  });

  it('[TC-260.17/MSS][UC-ADM-MOD/MSS] AdminManager khởi tạo an toàn khi thiếu secret ở môi trường non-production và từ chối xác thực', async () => {
    const { serverSocket, cleanup } = await createLiveSocketPair();
    const originalEnv = process.env['NODE_ENV'];
    const originalSecret = process.env['VTCOON_ADMIN_SECRET'];
    const originalLegacy = process.env['ADMIN_SECRET'];
    try {
      delete process.env['VTCOON_ADMIN_SECRET'];
      delete process.env['ADMIN_SECRET'];
      process.env['NODE_ENV'] = 'test';
      const adminNoSecret = new AdminManager({ roomManager: new RoomManager() });
      expect(adminNoSecret.authenticate(serverSocket, 'any-secret')).toBe(false);
    } finally {
      process.env['NODE_ENV'] = originalEnv;
      if (originalSecret) process.env['VTCOON_ADMIN_SECRET'] = originalSecret;
      if (originalLegacy) process.env['ADMIN_SECRET'] = originalLegacy;
      await cleanup();
    }
  });
});
