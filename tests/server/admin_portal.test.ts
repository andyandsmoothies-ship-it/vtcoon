// [IMP-25/MSS] Admin Central Portal & Multi-Room Monitoring Tests
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { WebSocket } from 'ws';
import { WssServer } from '../../src/server/network/wss_server.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

const TEST_PORT = 3205;
let server: WssServer;
const activeSockets: WebSocket[] = [];

beforeAll(() => {
  server = new WssServer({ port: TEST_PORT });
});

afterEach(() => {
  for (const ws of activeSockets) {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  }
  activeSockets.length = 0;
});

afterAll(async () => {
  await server.close();
});

function openSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    activeSockets.push(ws);
    ws.once('open', () => resolve(ws));
    ws.once('error', reject);
  });
}

function collectN(socket: WebSocket, n: number): Promise<WsServerMessage[]> {
  return new Promise((resolve, reject) => {
    const msgs: WsServerMessage[] = [];
    const timer = setTimeout(
      () => reject(new Error(`timeout: nhận ${msgs.length}/${n} messages`)),
      4_000,
    );
    const onMsg = (data: Buffer | string): void => {
      msgs.push(JSON.parse(data.toString()) as WsServerMessage);
      if (msgs.length === n) {
        clearTimeout(timer);
        socket.off('message', onMsg);
        resolve(msgs);
      }
    };
    socket.on('message', onMsg);
  });
}

async function sendRecv(socket: WebSocket, payload: object): Promise<WsServerMessage> {
  const pending = collectN(socket, 1);
  socket.send(JSON.stringify(payload));
  const [msg] = await pending;
  if (!msg) throw new Error('Không nhận được message');
  return msg;
}

describe('[IMP-25/MSS] Admin Central Portal Tests', () => {
  it('[TC-ADM01.1-inv/Adversarial] ADMIN_AUTH từ chối khi nhập sai secret key', async () => {
    const ws = await openSocket();
    const res = await sendRecv(ws, { type: 'ADMIN_AUTH', secret: 'sai-mat-ma-9999' });
    expect(res.type).toBe('ADMIN_AUTH_FAILED');
    if (res.type === 'ADMIN_AUTH_FAILED') {
      expect(res.reason).toContain('Sai mã bí mật');
    }
    ws.close();
  });

  it('[TC-ADM01.2/MSS] ADMIN_AUTH thành công với secret mặc định vtcoon-admin-2026', async () => {
    const ws = await openSocket();
    const pending = collectN(ws, 2); // ADMIN_AUTH_SUCCESS + ADMIN_ROOM_LIST
    ws.send(JSON.stringify({ type: 'ADMIN_AUTH', secret: 'vtcoon-admin-2026' }));
    const [msgSuccess, msgList] = await pending;

    expect(msgSuccess?.type).toBe('ADMIN_AUTH_SUCCESS');
    expect(msgList?.type).toBe('ADMIN_ROOM_LIST');
    expect(server.admin.authenticatedCount).toBeGreaterThanOrEqual(1);
    ws.close();
  });

  it('[TC-ADM01.3-inv/Adversarial] ADMIN_GET_ROOMS từ chối khi socket chưa xác thực', async () => {
    const ws = await openSocket();
    const res = await sendRecv(ws, { type: 'ADMIN_GET_ROOMS' });
    expect(res.type).toBe('ERROR');
    if (res.type === 'ERROR') {
      expect(res.reasonCode).toBe('ADMIN_UNAUTHORIZED');
    }
    ws.close();
  });

  it('[TC-ADM01.4/MSS] Tổng hợp danh sách phòng và nhận diện tức thì trạng thái NORMAL vs CRITICAL', async () => {
    const roomMgr = server.getRoomManager();
    // Tạo phòng bình thường
    const r1 = roomMgr.createRoom('host_normal', 'NORM01');
    r1.started = true;

    // Tạo phòng có sự cố số dư âm ngoài Insolvency
    const r2 = roomMgr.createRoom('host_glitch', 'GLIT01');
    r2.started = true;
    const pCheater = r2.players.find((p) => p.id === 'host_glitch');
    if (pCheater) pCheater.balance = -999; // Lỗi vi phạm tiền âm

    const ws = await openSocket();
    const authPending = collectN(ws, 2);
    ws.send(JSON.stringify({ type: 'ADMIN_AUTH', secret: 'vtcoon-admin-2026' }));
    await authPending;

    const listRes = await sendRecv(ws, { type: 'ADMIN_GET_ROOMS' });
    expect(listRes.type).toBe('ADMIN_ROOM_LIST');
    if (listRes.type === 'ADMIN_ROOM_LIST') {
      const normRoom = listRes.rooms.find((r) => r.roomCode === 'NORM01');
      const glitchRoom = listRes.rooms.find((r) => r.roomCode === 'GLIT01');

      expect(normRoom).toBeDefined();
      expect(normRoom?.status).toBe('NORMAL');

      expect(glitchRoom).toBeDefined();
      expect(glitchRoom?.status).toBe('CRITICAL');
      expect(glitchRoom?.warningReason).toContain('Số dư âm ngoài vỡ nợ');
    }

    ws.close();
  });

  it('[TC-ADM01.5/MSS] ADMIN_SUBSCRIBE_ROOM nhận chi tiết phòng và nhận live stream nhật ký sự kiện', async () => {
    const ws = await openSocket();
    const authPending = collectN(ws, 2);
    ws.send(JSON.stringify({ type: 'ADMIN_AUTH', secret: 'vtcoon-admin-2026' }));
    await authPending;

    // Đăng ký theo dõi phòng NORM01
    const subPending = collectN(ws, 1);
    ws.send(JSON.stringify({ type: 'ADMIN_SUBSCRIBE_ROOM', roomCode: 'NORM01' }));
    const [subDetail] = await subPending;

    expect(subDetail?.type).toBe('ADMIN_ROOM_DETAIL');
    if (subDetail?.type === 'ADMIN_ROOM_DETAIL') {
      expect(subDetail.roomCode).toBe('NORM01');
      expect(subDetail.detail.hostId).toBe('host_normal');
    }

    // Bàn cờ phát sinh sự kiện -> Admin nhận Live Stream tức thì
    const logPending = collectN(ws, 1);
    server.admin.recordRoomEvent('NORM01', {
      source: 'PLAYER',
      action: 'INTENT_ROLL',
      payloadSummary: 'Người chơi gieo xúc xắc [3, 4] tiến 7 ô',
    });
    const [streamMsg] = await logPending;

    expect(streamMsg?.type).toBe('ADMIN_ROOM_LOG');
    if (streamMsg?.type === 'ADMIN_ROOM_LOG') {
      expect(streamMsg.roomCode).toBe('NORM01');
      expect(streamMsg.log.action).toBe('INTENT_ROLL');
      expect(streamMsg.log.payloadSummary).toContain('tiến 7 ô');
    }

    ws.close();
  });

  it('[TC-ADM01.6/MSS] ADMIN_TERMINATE_ROOM cưỡng chế đóng bàn chơi khẩn cấp và giải phóng tài nguyên', async () => {
    const ws = await openSocket();
    const authPending = collectN(ws, 2);
    ws.send(JSON.stringify({ type: 'ADMIN_AUTH', secret: 'vtcoon-admin-2026' }));
    await authPending;

    expect(server.getRoomManager().hasRoom('GLIT01')).toBe(true);

    const termPending = collectN(ws, 1);
    ws.send(JSON.stringify({
      type: 'ADMIN_TERMINATE_ROOM',
      roomCode: 'GLIT01',
      reason: 'Phát hiện glitch tiền âm bất thường',
    }));
    const [termRes] = await termPending;

    expect(termRes?.type).toBe('ADMIN_ACTION_SUCCESS');
    if (termRes?.type === 'ADMIN_ACTION_SUCCESS') {
      expect(termRes.action).toBe('TERMINATE_ROOM');
      expect(termRes.roomCode).toBe('GLIT01');
    }

    expect(server.getRoomManager().hasRoom('GLIT01')).toBe(false);
    ws.close();
  });

  it('[TC-ADM01.7/MSS] Trích xuất Hộp Đen chẩn đoán JSON hoàn chỉnh từ Admin Manager', () => {
    const dump = server.admin.getDiagnosticDump('NORM01');
    expect(dump).toBeDefined();
    expect(dump?.roomCode).toBe('NORM01');
    expect(dump?.metrics).toBeDefined();
    expect(Array.isArray(dump?.players)).toBe(true);
    expect(Array.isArray(dump?.auditLogs)).toBe(true);
  });

  it('[TC-ADM01.8-inv/Adversarial] ADMIN_SUBSCRIBE_ROOM từ chối với ADMIN_ROOM_NOT_FOUND khi phòng không tồn tại', async () => {
    const ws = await openSocket();
    const authPending = collectN(ws, 2);
    ws.send(JSON.stringify({ type: 'ADMIN_AUTH', secret: 'vtcoon-admin-2026' }));
    await authPending;

    const res = await sendRecv(ws, { type: 'ADMIN_SUBSCRIBE_ROOM', roomCode: 'PHONG_MA' });
    expect(res.type).toBe('ERROR');
    if (res.type === 'ERROR') {
      expect(res.reasonCode).toBe('ADMIN_ROOM_NOT_FOUND');
    }
    ws.close();
  });

  it('[TC-ADM01.9/MSS] server.closeRoom tự động dọn dẹp nhật ký và hủy đăng ký theo dõi phòng tránh rò rỉ bộ nhớ', async () => {
    const roomMgr = server.getRoomManager();
    const rTemp = roomMgr.createRoom('host_temp', 'TEMP99');
    server.admin.recordRoomEvent('TEMP99', {
      source: 'SYSTEM',
      action: 'INIT',
      payloadSummary: 'Tạo phòng tạm thời',
    });
    server.admin.recordRoomViolation('TEMP99', 'TEST_VIOLATION', 'Test violation');

    expect(server.admin.getRecentLogs('TEMP99').length).toBeGreaterThan(0);

    const ws = await openSocket();
    const authPending = collectN(ws, 2);
    ws.send(JSON.stringify({ type: 'ADMIN_AUTH', secret: 'vtcoon-admin-2026' }));
    await authPending;

    // Admin đăng ký theo dõi TEMP99
    await sendRecv(ws, { type: 'ADMIN_SUBSCRIBE_ROOM', roomCode: 'TEMP99' });

    // Đóng phòng theo quy trình chuẩn
    server.closeRoom(rTemp.roomCode);

    expect(server.admin.getRecentLogs('TEMP99').length).toBe(0);
    expect(server.admin.getDiagnosticDump('TEMP99')).toBeUndefined();
    ws.close();
  });
});
