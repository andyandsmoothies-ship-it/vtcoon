// [TC-261.01/MSS..TC-261.16/A3][UC-ADM-SEC/MSS][UC-ADM-SEC/A1..A3] IMP-261: Admin Security & Resilience Hardening Contract Test Suite
import { describe, it, expect, vi } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import { normalizeRoomCode, timingSafeStringCompare } from '../../src/server/network/admin_security.js';
import { AdminManager } from '../../src/server/network/admin_manager.js';
import { AdminEventStore } from '../../src/server/network/admin_event_store.js';
import { syncAdminCloudLogs } from '../../src/server/network/admin_cloud_sync.js';
import { handleAdminClientMessage } from '../../src/server/network/admin_message_handler.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { PersistentRoomLogger } from '../../src/server/logging/persistent_room_logger.js';
import * as SupabaseLogSync from '../../src/server/storage/supabase_log_sync.js';
import { MAX_ROOM_LOGS } from '../../src/server/network/admin_types.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

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

describe('[IMP-261/MSS][UC-ADM-SEC/MSS][UC-ADM-SEC/A1..A3] Admin Security & Resilience Hardening Contract Suite', () => {
  it('[TC-261.01/MSS][UC-ADM-SEC/MSS] normalizeRoomCode chuẩn hóa chuỗi thường và cắt tỉa khoảng trắng đầu cuối thành chữ hoa chuẩn', () => {
    expect(normalizeRoomCode('  room_alpha  ')).toBe('ROOM_ALPHA');
    expect(normalizeRoomCode('  room-123\t')).toBe('ROOM-123');
    expect(normalizeRoomCode('')).toBe('');
  });

  it('[TC-261.02/MSS][UC-ADM-SEC/MSS] timingSafeStringCompare so sánh hằng thời gian trả về true cho hai secret trùng khớp và false an toàn không ném RangeError khi độ dài lệch', () => {
    expect(timingSafeStringCompare('secret-key-xyz', 'secret-key-xyz')).toBe(true);
    expect(timingSafeStringCompare('secret-key-xyz', 'secret-key-abc')).toBe(false);
    expect(timingSafeStringCompare('short', 'much-longer-secret-token')).toBe(false);
  });

  it('[TC-261.03/MSS][UC-ADM-SEC/MSS] AdminManager constructor cắt tỉa secret trước khi qua guard rỗng, ném FATAL trong production nếu secret chỉ chứa khoảng trắng', () => {
    const originalEnv = process.env['NODE_ENV'];
    try {
      process.env['NODE_ENV'] = 'production';
      expect(() => new AdminManager({ roomManager: new RoomManager(), secret: '   ' })).toThrow(
        'FATAL: VTCOON_ADMIN_SECRET must be configured in production mode',
      );
    } finally {
      process.env['NODE_ENV'] = originalEnv;
    }
  });

  it('[TC-261.04/MSS][UC-ADM-SEC/MSS] AdminManager.authenticate xác thực thành công qua timingSafeStringCompare và chỉ đăng ký listener socket error một lần duy nhất chống rò rỉ listener', async () => {
    const roomManager = new RoomManager();
    const admin = new AdminManager({ roomManager, secret: 'test-secret', loggerDir: './server_logs/test_imp261_auth' });
    const { serverSocket, cleanup } = await createLiveSocketPair();

    try {
      // 0. Unconfigured secret must return false and not authenticate
      const noSecretAdmin = new AdminManager({ roomManager });
      expect(noSecretAdmin.authenticate(serverSocket, 'any-secret')).toBe(false);
      expect(noSecretAdmin.isAuthenticated(serverSocket)).toBe(false);

      // 1. Invalid secret must return false, not authenticate, and not attach listener
      expect(admin.authenticate(serverSocket, 'wrong-secret')).toBe(false);
      expect(admin.isAuthenticated(serverSocket)).toBe(false);
      expect(serverSocket.listenerCount('error')).toBe(0);

      // 2. Valid secret authenticates and registers error listener exactly once
      expect(admin.authenticate(serverSocket, 'test-secret')).toBe(true);
      expect(admin.isAuthenticated(serverSocket)).toBe(true);
      expect(serverSocket.listenerCount('error')).toBe(1);

      // 3. Re-authenticate on same socket: idempotent, preserves single listener
      expect(admin.authenticate(serverSocket, 'test-secret')).toBe(true);
      expect(serverSocket.listenerCount('error')).toBe(1);
    } finally {
      await cleanup();
    }
  });

  it('[TC-261.05/MSS][UC-ADM-SEC/MSS] AdminEventStore.getRecentLogs trả về bản sao phòng vệ, bảo vệ mảng log gốc khỏi đột biến bên ngoài', () => {
    const roomLogger = new PersistentRoomLogger({ logDir: './server_logs/test_imp261_defensive_logs' });
    const store = new AdminEventStore(roomLogger);

    const entry = store.recordRoomEvent('ROOM_DEF', {
      source: 'SYSTEM',
      action: 'INIT_STATE',
      payloadSummary: 'Initial state established',
    });

    const logs1 = store.getRecentLogs('ROOM_DEF');
    expect(logs1).toEqual([entry]);

    logs1.push({
      id: 'poison_id',
      roomCode: 'ROOM_DEF',
      timestamp: 0,
      source: 'SYSTEM',
      action: 'POISON_EVENT',
      payloadSummary: 'External mutation attempt',
    });

    const logs2 = store.getRecentLogs('ROOM_DEF');
    expect(logs2).toHaveLength(1);
    expect(logs2[0]?.action).toBe('INIT_STATE');
  });

  it('[TC-261.06/MSS][UC-ADM-SEC/MSS] AdminEventStore.getViolations trả về bản sao phòng vệ của danh sách vi phạm, chống đột biến ring buffer', () => {
    const roomLogger = new PersistentRoomLogger({ logDir: './server_logs/test_imp261_defensive_vio' });
    const store = new AdminEventStore(roomLogger);

    store.recordViolation('ROOM_VIO', 'ILLEGAL_ACTION', 'Action out of order');

    const v1 = store.getViolations('ROOM_VIO');
    expect(v1).toHaveLength(1);

    v1?.push({
      type: 'INJECTED_VIOLATION',
      message: 'External mutation attempt',
      timestamp: 0,
    });

    const v2 = store.getViolations('ROOM_VIO');
    expect(v2).toHaveLength(1);
    expect(v2?.[0]?.type).toBe('ILLEGAL_ACTION');
  });

  it('[TC-261.07/MSS][UC-ADM-SEC/MSS] AdminEventStore.recordViolation áp dụng trần MAX_ROOM_LOGS loại bỏ vi phạm cũ nhất theo thứ tự FIFO khi bị spam vi phạm', () => {
    const roomLogger = new PersistentRoomLogger({ logDir: './server_logs/test_imp261_store_cap' });
    const store = new AdminEventStore(roomLogger);

    Array.from({ length: MAX_ROOM_LOGS + 1 }, (_, i) => {
      store.recordViolation('ROOM_CAP', 'SPAM_ALERT', `violation-${i}`);
    });

    const violations = store.getViolations('ROOM_CAP');
    expect(violations).toHaveLength(MAX_ROOM_LOGS);
    expect(violations?.[0]?.message).toBe('violation-1');
    expect(violations?.[MAX_ROOM_LOGS - 1]?.message).toBe(`violation-${MAX_ROOM_LOGS}`);
  });

  it('[TC-261.08/MSS][UC-ADM-SEC/MSS] admin_message_handler.handleSubscribe trả về ADMIN_ROOM_DETAIL mang roomCode đã qua normalizeRoomCode, ngăn chặn UI client bỏ rơi live log', async () => {
    const roomManager = new RoomManager();
    const room = roomManager.createRoom('HOST_SUB', 'Host Sub');
    const admin = new AdminManager({ roomManager, secret: 'test-secret', loggerDir: './server_logs/test_imp261_sub_norm' });
    const { serverSocket, cleanup } = await createLiveSocketPair();

    try {
      expect(admin.authenticate(serverSocket, 'test-secret')).toBe(true);

      const sentMessages: WsServerMessage[] = [];
      handleAdminClientMessage(
        admin,
        serverSocket,
        { type: 'ADMIN_SUBSCRIBE_ROOM', roomCode: `  ${room.roomCode.toLowerCase()}  ` },
        (_sock, msg) => { sentMessages.push(msg); },
      );

      expect(sentMessages).toHaveLength(1);
      expect(sentMessages[0]).toEqual(expect.objectContaining({
        type: 'ADMIN_ROOM_DETAIL',
        roomCode: room.roomCode,
      }));

      // Verify fullLogs branch when full log has distinct archival entries
      vi.spyOn(admin['roomLogger'], 'getRoomFullLog').mockReturnValueOnce([
        { id: 'full_1', roomCode: room.roomCode, timestamp: 1, source: 'SYSTEM', action: 'FROM_FULL_LOG', payloadSummary: 'disk' },
      ]);
      const subResFull = admin.subscribeRoom(serverSocket, room.roomCode);
      expect(subResFull.recentLogs).toHaveLength(1);
      expect(subResFull.recentLogs?.[0]?.action).toBe('FROM_FULL_LOG');
    } finally {
      await cleanup();
    }
  });

  it('[TC-261.09/MSS][UC-ADM-SEC/MSS] AdminManager.broadcastToAdmins cắt tỉa socket CLOSING hoặc CLOSED khỏi authenticatedSockets qua sendAndPrune', async () => {
    const roomManager = new RoomManager();
    const admin = new AdminManager({ roomManager, secret: 'test-secret', loggerDir: './server_logs/test_imp261_bcast_prune' });
    const p1 = await createLiveSocketPair();
    const p2 = await createLiveSocketPair();
    const p3 = await createLiveSocketPair();

    try {
      admin.authenticate(p1.serverSocket, 'test-secret');
      admin.authenticate(p2.serverSocket, 'test-secret');
      admin.authenticate(p3.serverSocket, 'test-secret');

      // Transition p2 and p3 sockets to dead states via client terminate
      p2.clientSocket.terminate();
      p3.clientSocket.terminate();
      await new Promise((r) => setTimeout(r, 30));

      admin.broadcastToAdmins({ type: 'ADMIN_AUTH_SUCCESS', message: 'PING' });

      expect(admin.authenticatedCount).toBe(1);
      expect(admin.isAuthenticated(p1.serverSocket)).toBe(true);
      expect(admin.isAuthenticated(p2.serverSocket)).toBe(false);
      expect(admin.isAuthenticated(p3.serverSocket)).toBe(false);
    } finally {
      await Promise.all([p1.cleanup(), p2.cleanup(), p3.cleanup()]);
    }
  });

  it('[TC-261.10/MSS][UC-ADM-SEC/MSS] AdminManager.sendAndPrune truyền error callback cho sock.send, tự động dọn dẹp socket khi ghi TCP bất đồng bộ thất bại mà không crash tiến trình', async () => {
    const roomManager = new RoomManager();
    const admin = new AdminManager({ roomManager, secret: 'test-secret', loggerDir: './server_logs/test_imp261_send_err' });
    const { serverSocket, clientSocket, cleanup } = await createLiveSocketPair();

    try {
      admin.authenticate(serverSocket, 'test-secret');
      expect(admin.authenticatedCount).toBe(1);

      // Abrupt drop on client side triggers TCP write failure on server send
      clientSocket.terminate();
      await new Promise((r) => setTimeout(r, 30));

      // broadcast triggers send with error callback
      admin.broadcastToAdmins({ type: 'ADMIN_AUTH_SUCCESS', message: 'PING' });
      await new Promise((r) => setTimeout(r, 30));

      expect(admin.isAuthenticated(serverSocket)).toBe(false);
      expect(admin.authenticatedCount).toBe(0);
    } finally {
      await cleanup();
    }
  });

  it('[TC-261.11/MSS][UC-ADM-SEC/MSS] AdminManager.broadcastToRoomSubscribers dọn dẹp socket chết khỏi danh sách đăng ký phòng', async () => {
    const roomManager = new RoomManager();
    const room = roomManager.createRoom('HOST_DEAD', 'Host Dead');
    const admin = new AdminManager({ roomManager, secret: 'test-secret', loggerDir: './server_logs/test_imp261_room_prune' });
    const { serverSocket, clientSocket, cleanup } = await createLiveSocketPair();

    try {
      admin.authenticate(serverSocket, 'test-secret');
      admin.subscribeRoom(serverSocket, room.roomCode);
      expect(admin.isAuthenticated(serverSocket)).toBe(true);

      // Abruptly terminate client
      clientSocket.terminate();
      await new Promise((r) => setTimeout(r, 30));

      admin.recordRoomEvent(room.roomCode, {
        source: 'SYSTEM',
        action: 'DISCONNECT_TEST',
        payloadSummary: 'Testing dead socket eviction',
      });
      await new Promise((r) => setTimeout(r, 30));

      expect(admin.isAuthenticated(serverSocket)).toBe(false);
    } finally {
      await cleanup();
    }
  });

  it('[TC-261.12/MSS][UC-ADM-SEC/MSS] syncAdminCloudLogs bắt ngoại lệ I/O hoặc mạng và trả về đối tượng có cấu trúc với reason SYNC_EXCEPTION và chi tiết error', async () => {
    const roomLogger = new PersistentRoomLogger({ logDir: './server_logs/test_imp261_sync_err' });
    vi.spyOn(roomLogger, 'flushSync').mockImplementationOnce(() => {});
    vi.spyOn(SupabaseLogSync, 'syncAllLocalLogsToCloud').mockRejectedValueOnce(new Error('SUPABASE_NETWORK_TIMEOUT'));

    const result = await syncAdminCloudLogs(roomLogger);

    expect(result.success).toBe(false);
    expect(result.reason).toBe('SYNC_EXCEPTION');
    expect(result.error).toBe('SUPABASE_NETWORK_TIMEOUT');
  });

  it('[TC-261.13/MSS][UC-ADM-SEC/MSS] admin_message_handler.handleSyncCloudStorage bảo toàn cả reason và error message trong ADMIN_SYNC_CLOUD_RESULT', async () => {
    const roomManager = new RoomManager();
    const admin = new AdminManager({ roomManager, secret: 'test-secret', loggerDir: './server_logs/test_imp261_sync_msg' });
    const { serverSocket, cleanup } = await createLiveSocketPair();

    try {
      admin.authenticate(serverSocket, 'test-secret');

      vi.spyOn(admin, 'syncCloudLogs').mockResolvedValueOnce({
        success: false,
        reason: 'SYNC_EXCEPTION',
        error: 'STORAGE_UNAVAILABLE',
      });

      const sentMessages: WsServerMessage[] = [];
      await handleAdminClientMessage(
        admin,
        serverSocket,
        { type: 'ADMIN_SYNC_CLOUD_STORAGE' },
        (_sock, msg) => { sentMessages.push(msg); },
      );

      expect(sentMessages).toHaveLength(2);
      expect(sentMessages[0]).toEqual(expect.objectContaining({
        type: 'ADMIN_SYNC_CLOUD_RESULT',
        success: false,
        reason: 'SYNC_EXCEPTION',
        error: 'STORAGE_UNAVAILABLE',
      }));
      expect(sentMessages[1]?.type).toBe('ADMIN_ROOM_LIST');
    } finally {
      await cleanup();
    }
  });

  it('[TC-261.14/A1][UC-ADM-SEC/A1] Ngoại lệ A1: admin_message_handler từ chối ADMIN_UNSUBSCRIBE_ROOM từ socket chưa xác thực bằng mã lỗi ADMIN_UNAUTHORIZED', async () => {
    const roomManager = new RoomManager();
    const admin = new AdminManager({ roomManager, secret: 'test-secret', loggerDir: './server_logs/test_imp261_unsub_guard' });
    const { serverSocket, cleanup } = await createLiveSocketPair(); // Unauthenticated socket

    try {
      const sentMessages: WsServerMessage[] = [];
      handleAdminClientMessage(admin, serverSocket, { type: 'ADMIN_UNSUBSCRIBE_ROOM', roomCode: 'ROOM_ALPHA' }, (_sock, msg) => {
        sentMessages.push(msg);
      });

      expect(sentMessages).toHaveLength(1);
      expect(sentMessages[0]).toEqual({ type: 'ERROR', reasonCode: 'ADMIN_UNAUTHORIZED' });
    } finally {
      await cleanup();
    }
  });

  it('[TC-261.15/A2][UC-ADM-SEC/A2] Ngoại lệ A2: admin_message_handler.handleTerminate thực thi terminateRoom trước khi gửi ACK và xử lý ngoại lệ an toàn', async () => {
    const roomManager = new RoomManager();
    const room = roomManager.createRoom('HOST_TERM', 'Host Terminate');
    const admin = new AdminManager({ roomManager, secret: 'test-secret', loggerDir: './server_logs/test_imp261_term_order' });
    const { serverSocket, cleanup } = await createLiveSocketPair();

    try {
      admin.authenticate(serverSocket, 'test-secret');

      // 1. Non-existent room check
      const sentErrors: WsServerMessage[] = [];
      handleAdminClientMessage(admin, serverSocket, { type: 'ADMIN_TERMINATE_ROOM', roomCode: '  non_existent_room  ' }, (_sock, msg) => {
        sentErrors.push(msg);
      });
      expect(sentErrors[0]).toEqual({ type: 'ADMIN_ERROR', reasonCode: 'ADMIN_ROOM_NOT_FOUND', message: 'Phòng không tồn tại' });
      expect(admin.terminateRoom('NON_EXISTENT_ROOM')).toBe(false);

      // 2. Existing room order check (Termination happens BEFORE ACK is sent)
      const callSequence: string[] = [];
      const trackingSendSafe = (_sock: WebSocket, msg: WsServerMessage): void => {
        if (msg.type === 'ADMIN_ACTION_SUCCESS') {
          callSequence.push(`ACK_${msg.roomCode}`);
        }
      };
      vi.spyOn(admin, 'terminateRoom').mockImplementationOnce(() => {
        callSequence.push('TERMINATE');
        return true;
      });

      handleAdminClientMessage(
        admin,
        serverSocket,
        { type: 'ADMIN_TERMINATE_ROOM', roomCode: `  ${room.roomCode.toLowerCase()}  ` },
        trackingSendSafe,
      );

      // TERMINATE must strictly execute BEFORE ACK
      expect(callSequence).toEqual(['TERMINATE', `ACK_${room.roomCode}`]);

      // 3. Exception in terminateRoom: should send ADMIN_ERROR instead of false ACK
      const failMessages: WsServerMessage[] = [];
      vi.spyOn(admin, 'terminateRoom').mockImplementationOnce(() => {
        throw new Error('DATABASE_CONNECTION_LOST');
      });

      handleAdminClientMessage(
        admin,
        serverSocket,
        { type: 'ADMIN_TERMINATE_ROOM', roomCode: room.roomCode },
        (_sock, msg) => { failMessages.push(msg); },
      );

      expect(failMessages).toHaveLength(1);
      expect(failMessages[0]).toEqual({
        type: 'ADMIN_ERROR',
        reasonCode: 'ACTION_REJECTED',
        message: 'DATABASE_CONNECTION_LOST',
      });
    } finally {
      await cleanup();
    }
  });

  it('[TC-261.16/A3][UC-ADM-SEC/A3] Ngoại lệ A3: AdminManager getRoomDetail, getDiagnosticDump, hasRoom chuẩn hóa mã phòng có khoảng trắng và truy xuất chính xác dữ liệu phòng', () => {
    const roomManager = new RoomManager();
    const room = roomManager.createRoom('HOST_NORM', 'Host Normalized');
    const admin = new AdminManager({ roomManager, secret: 'test-secret', loggerDir: './server_logs/test_imp261_ingress_norm' });

    const paddedInput = `  ${room.roomCode.toLowerCase()}  `;

    expect(admin.hasRoom(paddedInput)).toBe(true);
    expect(admin.getRoomDetail(paddedInput)?.roomCode).toBe(room.roomCode);
    expect(admin.getDiagnosticDump(paddedInput)?.['roomCode']).toBe(room.roomCode);
    expect(admin.getRoomsSummary()).toHaveLength(1);
  });
});
