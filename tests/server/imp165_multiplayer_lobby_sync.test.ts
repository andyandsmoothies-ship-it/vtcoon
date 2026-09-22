// [TC-IMP165/MSS][UC-GAME-001/MSS][UC-GAME-003/MSS]
// Contract Tests RED — IMP-165: Dynamic Room Allocation, Server Slot Assignment & Lobby Sync
// Tất cả tests trong file này PHẢI FAIL trên code hiện tại (RED phase).
// Đây là bộ kiểm thử hợp đồng — TUYỆT ĐỐI không sửa assertions để match code hiện tại.

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { WebSocket } from 'ws';
import { WssServer } from '../../src/server/network/wss_server.js';
import { doJoinRoom, doStartGame } from '../../src/server/room_manager_lifecycle.js';
import { handleJoinRoom } from '../../src/server/network/wss_lobby_handlers.js';
import { getInitialLobbyConfig, createNewRoomConfig } from '../../src/client/offline_landing.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import { createPlayer, createRoom } from '../../src/domain/room.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

// ─────────────────────────────────────────────────────────────────
// Hạ tầng test dùng chung
// ─────────────────────────────────────────────────────────────────

const TEST_PORT = 3165;
let server: WssServer;
const openSockets: WebSocket[] = [];

beforeAll(() => {
  server = new WssServer({ port: TEST_PORT, gracePeriodMs: 100 });
});

afterEach(() => {
  for (const ws of openSockets) {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  }
  openSockets.length = 0;
  useLobbyStore.getState().resetLobby();
  vi.restoreAllMocks();
  // Restore window if mocked
  if ((globalThis as Record<string, unknown>)['_originalWindow'] !== undefined) {
    (globalThis as Record<string, unknown>)['window'] = (globalThis as Record<string, unknown>)['_originalWindow'];
    delete (globalThis as Record<string, unknown>)['_originalWindow'];
  }
});

afterAll(async () => {
  await server.close();
});

function openSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    openSockets.push(ws);
    ws.once('open', () => resolve(ws));
    ws.once('error', reject);
  });
}

function collectMessages(socket: WebSocket, count: number, timeoutMs = 4000): Promise<WsServerMessage[]> {
  return new Promise((resolve, reject) => {
    const msgs: WsServerMessage[] = [];
    const timer = setTimeout(() => {
      reject(new Error(`Timeout: nhận được ${msgs.length}/${count} messages`));
    }, timeoutMs);
    const onMsg = (data: Buffer | string): void => {
      msgs.push(JSON.parse(data.toString()) as WsServerMessage);
      if (msgs.length >= count) {
        clearTimeout(timer);
        socket.off('message', onMsg);
        resolve(msgs);
      }
    };
    socket.on('message', onMsg);
  });
}

async function createRoomViaWs(ws: WebSocket, playerId: string, roomCode?: string): Promise<string> {
  const pending = collectMessages(ws, 2);
  ws.send(JSON.stringify({ type: 'CREATE_ROOM', playerId, ...(roomCode ? { roomCode } : {}) }));
  const [created] = await pending;
  if (created?.type !== 'ROOM_CREATED') throw new Error(`Expected ROOM_CREATED, got ${created?.type}`);
  return created.roomCode;
}

function mockWindow(overrides: {
  search?: string;
  href?: string;
  replaceState?: (...args: unknown[]) => void;
  sessionStorageGetItem?: (key: string) => string | null;
}): void {
  const replaceState = overrides.replaceState ?? vi.fn();
  const getItem = overrides.sessionStorageGetItem ?? (() => null);
  const g = globalThis as Record<string, unknown>;
  g['_originalWindow'] = g['window'];
  g['window'] = {
    location: { search: overrides.search ?? '', href: overrides.href ?? 'http://localhost/' },
    history: { replaceState },
    sessionStorage: { setItem: vi.fn(), getItem },
  };
}

function restoreWindow(): void {
  const g = globalThis as Record<string, unknown>;
  if (g['_originalWindow'] !== undefined) {
    g['window'] = g['_originalWindow'];
    delete g['_originalWindow'];
  }
}

// ─────────────────────────────────────────────────────────────────
// NHÓM 1: Boundary & Range — Mã phòng động & cấp Slot Server
// ─────────────────────────────────────────────────────────────────

describe('[IMP-165] Boundary & Range — Mã phòng động & Slot Assignment', () => {

  /**
   * [TC-IMP165.01/MSS] Reconciled IMP-168:
   * getInitialLobbyConfig() không ?room= → trả về roomCode: null
   * createNewRoomConfig() → sinh mã ngẫu nhiên VTxxxx khớp /^[A-Z0-9]{6}$/
   */
  it('[TC-IMP165.01/MSS] getInitialLobbyConfig() không ?room= → roomCode: null; createNewRoomConfig() → sinh mã ngẫu nhiên khớp /^[A-Z0-9]{6}$/', () => {
    const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;
    mockWindow({ search: '', href: 'http://localhost/' });
    try {
      const config = getInitialLobbyConfig();
      expect(config.roomCode).toBeNull();
      expect(config.playerId).toBe('');
      expect(config.isHost).toBe(false);

      const created = createNewRoomConfig(true);
      expect(created.roomCode).toMatch(ROOM_CODE_REGEX);
      expect(created.roomCode).not.toBe('VT8888');
      expect(created.playerId).toBe('p1');
      expect(created.isHost).toBe(true);
    } finally {
      restoreWindow();
    }
  });

  /**
   * [TC-IMP165.02/MSS] Khách đầu tiên JOIN khi p1 đã có → server cấp slot 'p2'
   * BUG HIỆN TẠI: Không có server slot assignment — dùng thẳng msg.playerId từ client.
   * ROOM_JOINED phải chứa playerId được SERVER cấp (không phải echo lại client input).
   */
  it('[TC-IMP165.02/MSS] JOIN_ROOM khi p1 tồn tại → ROOM_JOINED với playerId = p2 (server-cấp)', async () => {
    const wsHost = await openSocket();
    const rc = await createRoomViaWs(wsHost, 'p1');

    const wsGuest = await openSocket();
    const pending = collectMessages(wsGuest, 1);
    wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: rc, playerId: 'p2' }));
    const [reply] = await pending;

    expect(reply?.type).toBe('ROOM_JOINED');
    if (reply?.type !== 'ROOM_JOINED') return;
    // Contract: server phải cấp đúng slot 'p2' (first available)
    expect(reply.playerId).toBe('p2');
    // Contract: ROOM_JOINED có playerId — đây là slot ĐƯỢC CẤP bởi server
    // (Hiện tại đây là echo, nhưng phải xác nhận đúng là 'p2')
    expect(reply.playerCount).toBe(2);
  });

  /**
   * [TC-IMP165.03/MSS] Khách 2 gửi playerId 'p2' khi p2 đã bị chiếm → server cấp 'p3'
   * BUG HIỆN TẠI: doJoinRoom không kiểm tra duplicate — sẽ thêm p2 trùng vào phòng.
   */
  it('[TC-IMP165.03/MSS] Khách 2 gửi p2 khi p2 đã chiếm → server tự cấp p3', async () => {
    const wsHost = await openSocket();
    const rc = await createRoomViaWs(wsHost, 'p1');

    // Khách 1 vào, nhận slot p2
    const wsGuest1 = await openSocket();
    const join1 = collectMessages(wsGuest1, 1);
    wsGuest1.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: rc, playerId: 'p2' }));
    await join1;

    // Khách 2 cũng gửi p2 → phải nhận p3
    const wsGuest2 = await openSocket();
    const join2 = collectMessages(wsGuest2, 1);
    wsGuest2.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: rc, playerId: 'p2' }));
    const [reply2] = await join2;

    expect(reply2?.type).toBe('ROOM_JOINED');
    if (reply2?.type !== 'ROOM_JOINED') return;
    // Contract: server cấp p3, KHÔNG được cấp p2 đã bị chiếm
    expect(reply2.playerId).toBe('p3');
  });

  /**
   * [TC-IMP165.04/MSS] Khách 3 JOIN (p2, p3 đã chiếm) → server cấp 'p4'
   */
  it('[TC-IMP165.04/MSS] Khách 3 JOIN (p2, p3 đã chiếm) → server cấp p4', async () => {
    const wsHost = await openSocket();
    const rc = await createRoomViaWs(wsHost, 'p1');

    // Thêm khách vào p2 và p3
    for (const pid of ['p2', 'p3']) {
      const ws = await openSocket();
      const pending = collectMessages(ws, 1);
      ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: rc, playerId: pid }));
      await pending;
    }

    // Khách 3 gửi p2 (đã chiếm) → phải nhận p4
    const wsGuest4 = await openSocket();
    const join4 = collectMessages(wsGuest4, 1);
    wsGuest4.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: rc, playerId: 'p2' }));
    const [reply4] = await join4;

    expect(reply4?.type).toBe('ROOM_JOINED');
    if (reply4?.type !== 'ROOM_JOINED') return;
    // Contract: server cấp p4 — slot còn lại duy nhất
    expect(reply4.playerId).toBe('p4');
  });

  /**
   * [TC-IMP165.05/MSS] Phòng đủ 4 → Khách thứ 5 nhận ERROR ROOM_FULL (không phải ROOM_NOT_FOUND)
   * BUG HIỆN TẠI (P2.3): doJoinRoom trả undefined khi players.length >= 4,
   * handler bắt !joined → trả ROOM_NOT_FOUND thay vì ROOM_FULL.
   */
  it('[TC-IMP165.05/MSS] [UC-GAME-001/A2] Phòng đủ 4 → Khách 5 nhận ERROR ROOM_FULL', async () => {
    const wsHost = await openSocket();
    const rc = await createRoomViaWs(wsHost, 'p1');

    for (let i = 2; i <= 4; i++) {
      const ws = await openSocket();
      const pending = collectMessages(ws, 1);
      ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: rc, playerId: `p${i}` }));
      await pending;
    }

    const wsExtra = await openSocket();
    const extraPending = collectMessages(wsExtra, 1);
    wsExtra.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: rc, playerId: 'p5' }));
    const [reply] = await extraPending;

    expect(reply?.type).toBe('ERROR');
    if (reply?.type !== 'ERROR') return;
    // Contract: ROOM_FULL — không phải ROOM_NOT_FOUND
    expect(reply.reasonCode).toBe('ROOM_FULL');
    expect(reply.reasonCode).not.toBe('ROOM_NOT_FOUND');
  });
});

// ─────────────────────────────────────────────────────────────────
// NHÓM 2: Reactivity & State Sync — LOBBY_UPDATE Broadcast & Store
// ─────────────────────────────────────────────────────────────────

describe('[IMP-165] Reactivity & State Sync — LOBBY_UPDATE & Store Actions', () => {

  /**
   * [TC-IMP165.06/MSS] handleJoinRoom phải broadcast LOBBY_UPDATE đến tất cả socket trong phòng
   * BUG HIỆN TẠI: Không có broadcast LOBBY_UPDATE trong handleJoinRoom.
   */
  it('[TC-IMP165.06/MSS] JOIN_ROOM → server broadcast LOBBY_UPDATE đến host socket', async () => {
    const wsHost = await openSocket();
    const rc = await createRoomViaWs(wsHost, 'host-165-06');

    // Host đăng ký listener TRƯỚC khi khách join
    const hostUpdate = collectMessages(wsHost, 1, 3000);

    const wsGuest = await openSocket();
    const guestPending = collectMessages(wsGuest, 1);
    wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: rc, playerId: 'guest-p2' }));
    await guestPending;

    // Contract: Host phải nhận LOBBY_UPDATE
    const [updateMsg] = await hostUpdate;
    expect(updateMsg?.type).toBe('LOBBY_UPDATE');
    if (updateMsg?.type !== 'LOBBY_UPDATE') return;
    expect(updateMsg.roomCode).toBe(rc);
    expect(Array.isArray(updateMsg.players)).toBe(true);
    expect(updateMsg.players.length).toBeGreaterThanOrEqual(2);
  });

  /**
   * [TC-IMP165.06u/MSS] Unit: handleJoinRoom gọi ctx.broadcast với payload LOBBY_UPDATE
   * BUG HIỆN TẠI: Không có lệnh gọi broadcast LOBBY_UPDATE trong handleJoinRoom.
   */
  it('[TC-IMP165.06u/MSS] handleJoinRoom (unit) gọi ctx.broadcast với type LOBBY_UPDATE', () => {
    const room = createRoom('p1', 'VTB001');
    const rooms = new Map([['VTB001', room]]);

    const broadcastSpy = vi.fn();
    const sendSafeSpy = vi.fn();

    const mockCtx = {
      rooms: {
        getRoom: (code: string) => rooms.get(code),
        joinRoom: (code: string, pid: string) => {
          const r = rooms.get(code);
          if (r) r.players.push(createPlayer(pid));
          return r;
        },
      },
      sessions: { addSession: vi.fn() },
      reconnects: { cancelGracePeriod: vi.fn() },
      sockets: { getPlayerSocket: vi.fn(() => undefined), register: vi.fn() },
      broadcaster: { broadcastRoomDelta: vi.fn() },
      adminManager: {
        recordRoomEvent: vi.fn(),
        broadcastRoomListToAdmins: vi.fn(),
      },
      sendSafe: sendSafeSpy,
      broadcast: broadcastSpy,
      sendSessionInit: vi.fn(),
      bindSocket: vi.fn(),
      scheduleBotTurn: vi.fn(),
      closeRoom: vi.fn(),
    };

    const mockSocket = { readyState: WebSocket.OPEN } as unknown as WebSocket;
    const msg = { type: 'JOIN_ROOM' as const, roomCode: 'VTB001', playerId: 'p2' };

    handleJoinRoom(mockCtx as never, mockSocket, msg);

    // Contract: phải có ít nhất 1 lần gọi broadcast với type LOBBY_UPDATE
    const lobbyCall = broadcastSpy.mock.calls.find(([, payload]) => payload?.type === 'LOBBY_UPDATE');
    expect(lobbyCall).toBeDefined();
    if (lobbyCall) {
      expect(lobbyCall[0]).toBe('VTB001');
      expect(Array.isArray(lobbyCall[1].players)).toBe(true);
    }
  });

  /**
   * [TC-IMP165.07/MSS] syncLobbySlots kế thừa pawnSlot và tokenColor từ slot template
   * BUG HIỆN TẠI: Không có action syncLobbySlots trong useLobbyStore.
   */
  it('[TC-IMP165.07/MSS] syncLobbySlots kế thừa pawnSlot & tokenColor từ template 3D', () => {
    const store = useLobbyStore.getState();
    store.initLobby('VT9999', 'p1', true, 'Chủ Phòng');

    const slot1Before = useLobbyStore.getState().slots[1]!;
    const originalPawnSlot = slot1Before.pawnSlot;
    const originalTokenColor = slot1Before.tokenColor;

    // Contract: syncLobbySlots phải tồn tại trong store
    const hasSyncAction = typeof useLobbyStore.getState().syncLobbySlots === 'function';
    expect(hasSyncAction).toBe(true);

    // Gọi syncLobbySlots với danh sách players từ server
    useLobbyStore.getState().syncLobbySlots([
      { id: 'p1', isHost: true, slotIndex: 0, name: 'Chủ Phòng' },
      { id: 'p2', isHost: false, slotIndex: 1, name: 'Khách Mời' },
    ]);

    const slot1After = useLobbyStore.getState().slots[1]!;

    // Contract: pawnSlot và tokenColor phải được kế thừa (không reset về default)
    expect(slot1After.pawnSlot).toBe(originalPawnSlot);
    expect(slot1After.tokenColor).toBe(originalTokenColor);
    // Contract: slot phải được đánh dấu occupied
    expect(slot1After.isOccupied).toBe(true);
    expect(slot1After.playerId).toBe('p2');
  });

  /**
   * [TC-IMP165.08/MSS] setMyPlayerId cập nhật myPlayerId khi server cấp slot mới
   * BUG HIỆN TẠI: Không có action setMyPlayerId trong useLobbyStore.
   */
  it('[TC-IMP165.08/MSS] setMyPlayerId cập nhật myPlayerId — chống socket flapping', () => {
    useLobbyStore.getState().initLobby('VT7777', 'p2', false, 'Khách');
    expect(useLobbyStore.getState().myPlayerId).toBe('p2');

    // Contract: setMyPlayerId phải tồn tại
    const hasSetMyPlayerId = typeof useLobbyStore.getState().setMyPlayerId === 'function';
    expect(hasSetMyPlayerId).toBe(true);

    // Server cấp lại p3 vì p2 đã bị chiếm
    useLobbyStore.getState().setMyPlayerId('p3');

    // Contract: myPlayerId phải được cập nhật thành p3
    expect(useLobbyStore.getState().myPlayerId).toBe('p3');
  });

  /**
   * [TC-IMP165.09/MSS] canStartGame() trả { canStart: true } khi có 2 người occupied & sẵn sàng
   * (Đây là test verify behavior hiện tại — nếu logic sẵn sàng thì pass, nếu không thì RED)
   */
  it('[TC-IMP165.09/MSS] canStartGame() → { canStart: true } khi host + 1 guest đều ready', () => {
    useLobbyStore.getState().initLobby('VT6543', 'p1', true, 'Chủ Phòng');
    useLobbyStore.getState().addGuestPlayer('p2', 'Khách Mời');
    useLobbyStore.getState().setPlayerReady('p2', true);

    const result = useLobbyStore.getState().canStartGame();
    // Contract: Với 2 người (host + 1 guest ready), canStart phải là true
    expect(result.canStart).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────
// NHÓM 3: Disposal & Teardown — Leave Room & Grace Expired
// ─────────────────────────────────────────────────────────────────

describe('[IMP-165] Disposal & Teardown — Leave Room, Grace Period', () => {

  /**
   * [TC-IMP165.10/MSS] Khách rời phòng trước trận → host nhận LOBBY_UPDATE, danh sách rút ngắn
   * BUG HIỆN TẠI: handleLeaveRoom không broadcast LOBBY_UPDATE (chỉ broadcastRoomDelta).
   */
  it('[TC-IMP165.10/MSS] LEAVE_ROOM trước trận → host nhận LOBBY_UPDATE với danh sách cập nhật', async () => {
    const wsHost = await openSocket();
    const rc = await createRoomViaWs(wsHost, 'host-165-10');

    const wsGuest = await openSocket();
    const guestJoinPending = collectMessages(wsGuest, 1);
    wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: rc, playerId: 'guest-leave' }));
    const [joinReply] = await guestJoinPending;
    const assignedPid = joinReply?.type === 'ROOM_JOINED' ? joinReply.playerId : 'guest-leave';

    // Host đăng ký listener TRƯỚC khi khách gửi LEAVE_ROOM
    const hostUpdate = collectMessages(wsHost, 1, 3000);

    wsGuest.send(JSON.stringify({ type: 'LEAVE_ROOM', roomCode: rc, playerId: assignedPid }));

    // Contract: Host nhận LOBBY_UPDATE
    const [updateMsg] = await hostUpdate;
    expect(updateMsg?.type).toBe('LOBBY_UPDATE');
    if (updateMsg?.type !== 'LOBBY_UPDATE') return;
    // Contract: Danh sách players chỉ còn 1 (host)
    expect(updateMsg.players).toHaveLength(1);
  });

  /**
   * [TC-IMP165.11/MSS] Grace expired trước khi trận bắt đầu → rút khỏi phòng, KHÔNG BotEngine.takeover
   * BUG HIỆN TẠI (P1.3): handleGraceExpired gọi BotEngine.takeover kể cả khi !room.started.
   */
  it('[TC-IMP165.11/MSS] [UC-GAME-008/MSS] Grace expired pre-game → player bị rút, KHÔNG trở thành Bot', async () => {
    const wsHost = await openSocket();
    const rc = await createRoomViaWs(wsHost, 'host-165-11');

    const wsGuest = await openSocket();
    const guestJoinPending = collectMessages(wsGuest, 1);
    wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: rc, playerId: 'guest-grace' }));
    const [joinReply] = await guestJoinPending;
    const assignedPid = joinReply?.type === 'ROOM_JOINED' ? joinReply.playerId : 'guest-grace';

    // Đăng ký listener cho host trước khi terminate
    const hostNextMsg = collectMessages(wsHost, 1, 2000);

    // Khách đột ngột đóng kết nối (không gửi LEAVE_ROOM)
    wsGuest.terminate();

    // Đợi grace period (100ms) + buffer
    await new Promise<void>((r) => setTimeout(r, 400));

    const room = server.getRoomManager().getRoom(rc);

    // Contract: Sau grace expired, khách phải bị RÚT khỏi room.players
    const playerStillInRoom = room?.players.some((p) => p.id === assignedPid);
    expect(playerStillInRoom).toBe(false);

    // Contract: Không có ghost Bot với id của khách (không gọi takeover)
    const ghostBot = room?.players.find((p) => p.id === assignedPid && p.isBot === true);
    expect(ghostBot).toBeUndefined();

    // Contract: Host nhận LOBBY_UPDATE, KHÔNG nhận PLAYER_BOT_TAKEOVER
    const [hostMsg] = await hostNextMsg;
    expect(hostMsg?.type).toBe('LOBBY_UPDATE');
    expect(hostMsg?.type).not.toBe('PLAYER_BOT_TAKEOVER');
  });
});

// ─────────────────────────────────────────────────────────────────
// NHÓM 4: Error Defense & Role Symmetry
// ─────────────────────────────────────────────────────────────────

describe('[IMP-165] Error Defense & Role Symmetry', () => {

  /**
   * [TC-IMP165.12/MSS] Host F5 với ?room= + sessionStorage flag → isHost: true
   * BUG HIỆN TẠI (P2.1): Không check sessionStorage — Host F5 sẽ bị nhận diện là khách p2.
   */
  it('[TC-IMP165.12/MSS] Host F5 với ?room=VT3819 + sessionStorage flag → isHost: true, playerId: p1', () => {
    const roomCode = 'VT3819';
    mockWindow({
      search: `?room=${roomCode}`,
      href: `http://localhost/?room=${roomCode}`,
      sessionStorageGetItem: (key: string) => (key === `vtcoon_host_${roomCode}` ? 'true' : null),
    });
    try {
      const config = getInitialLobbyConfig();
      // Contract: sessionStorage flag phải bảo toàn quyền Host khi F5
      expect(config.isHost).toBe(true);
      expect(config.playerId).toBe('p1');
      expect(config.roomCode).toBe(roomCode);
    } finally {
      restoreWindow();
    }
  });

  /**
   * [TC-IMP165.13/MSS] Admin URL /?admin=true → replaceState KHÔNG được gọi
   * BUG HIỆN TẠI (P2.4): Không có Admin guard — Admin URL bị đè bởi replaceState.
   */
  it('[TC-IMP165.13/MSS] Admin URL /?admin=true → window.history.replaceState KHÔNG được gọi', () => {
    const replaceStateSpy = vi.fn();
    mockWindow({
      search: '?admin=true',
      href: 'http://localhost/?admin=true',
      replaceState: replaceStateSpy,
    });
    try {
      getInitialLobbyConfig();
      // Contract: Admin URL không được kích hoạt replaceState sinh mã phòng
      expect(replaceStateSpy).not.toHaveBeenCalled();
    } finally {
      restoreWindow();
    }
  });

  /**
   * [TC-IMP165.14/MSS] Người chơi thật đè Bot AI cục bộ trong syncLobbySlots
   * BUG HIỆN TẠI (P2.2): Không có syncLobbySlots — Bot tranh chấp với người thật.
   */
  it('[TC-IMP165.14/MSS] syncLobbySlots — người chơi thật đè Bot AI cục bộ ở cùng slot', () => {
    useLobbyStore.getState().initLobby('VT4455', 'p1', true, 'Chủ Phòng');
    // Host thêm Bot vào slot 1
    useLobbyStore.getState().toggleBotSlot(1, 'Balanced' as never);
    expect(useLobbyStore.getState().slots[1]?.isBot).toBe(true);

    // Contract: syncLobbySlots phải tồn tại
    const hasSyncAction = typeof useLobbyStore.getState().syncLobbySlots === 'function';
    expect(hasSyncAction).toBe(true);

    // Server thông báo người thật (p2) vào slot 1
    useLobbyStore.getState().syncLobbySlots([
      { id: 'p1', isHost: true, slotIndex: 0, name: 'Chủ Phòng' },
      { id: 'p2', isHost: false, slotIndex: 1, name: 'Khách Thật' },
    ]);

    const slot1After = useLobbyStore.getState().slots[1]!;
    // Contract: Bot bị đè — slot phải là người thật
    expect(slot1After.isBot).toBe(false);
    expect(slot1After.isOccupied).toBe(true);
    expect(slot1After.playerId).toBe('p2');
  });

  /**
   * [TC-IMP165.15/MSS] JOIN phòng không tồn tại → ROOM_NOT_FOUND
   */
  it('[TC-IMP165.15/MSS] [UC-GAME-001/A3] JOIN phòng không tồn tại → ERROR ROOM_NOT_FOUND', async () => {
    const ws = await openSocket();
    const pending = collectMessages(ws, 1);
    ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: 'ZZZZZZ', playerId: 'intruder' }));
    const [reply] = await pending;

    expect(reply?.type).toBe('ERROR');
    if (reply?.type !== 'ERROR') return;
    expect(reply.reasonCode).toBe('ROOM_NOT_FOUND');
  });

  /**
   * [TC-IMP165.15b/MSS] JOIN phòng đã started → ROOM_STARTED
   * BUG HIỆN TẠI: doJoinRoom trả undefined khi room.started → handler trả ROOM_NOT_FOUND.
   */
  it('[TC-IMP165.15b/MSS] [UC-GAME-001/A4] JOIN phòng đã started → ERROR ROOM_STARTED', async () => {
    const wsHost = await openSocket();
    const rc = await createRoomViaWs(wsHost, 'host-165-15b');

    const startPending = collectMessages(wsHost, 2);
    wsHost.send(JSON.stringify({
      type: 'START_GAME',
      roomCode: rc,
      playerId: 'host-165-15b',
      bots: [{ id: 'bot_2', personality: 'Balanced' }],
    }));
    await startPending;

    const wsLate = await openSocket();
    const latePending = collectMessages(wsLate, 1);
    wsLate.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode: rc, playerId: 'late-comer' }));
    const [lateReply] = await latePending;

    expect(lateReply?.type).toBe('ERROR');
    if (lateReply?.type !== 'ERROR') return;
    // Contract: phải là ROOM_STARTED, không phải ROOM_NOT_FOUND
    expect(lateReply.reasonCode).toBe('ROOM_STARTED');
  });

  /**
   * [TC-IMP165.16/MSS] 4 người thật bắt đầu → doStartGame cấp balance = 18000 mỗi người
   */
  it('[TC-IMP165.16/MSS] [UC-GAME-002/MSS] doStartGame 4 người thật → balance = 18000 / người', () => {
    const rooms = new Map<string, ReturnType<typeof createRoom>>();
    const botPersonalities = new Map<string, string>();
    const room = createRoom('p1', 'VT1234');
    room.players.push(createPlayer('p2'));
    room.players.push(createPlayer('p3'));
    room.players.push(createPlayer('p4'));
    rooms.set('VT1234', room);

    const touchFn = vi.fn();
    const started = doStartGame(rooms as never, botPersonalities as never, 'VT1234', undefined, touchFn);

    expect(started).toBeDefined();
    expect(started?.started).toBe(true);
    expect(started?.players).toHaveLength(4);
    // Contract: vốn ban đầu với 4 người là 18000 Tr.
    expect(started?.players[0]?.balance).toBe(18000);
    expect(started?.players[1]?.balance).toBe(18000);
    expect(started?.players[2]?.balance).toBe(18000);
    expect(started?.players[3]?.balance).toBe(18000);
  });
});

// ─────────────────────────────────────────────────────────────────
// NHÓM 5: Unit Tests doJoinRoom — Slot Assignment & Validation Logic
// ─────────────────────────────────────────────────────────────────

describe('[IMP-165] doJoinRoom — Server Slot Assignment (Unit)', () => {

  /**
   * [TC-IMP165.02u/MSS] doJoinRoom không cho thêm duplicate playerId
   * BUG HIỆN TẠI: Không kiểm tra duplicate — có thể thêm 2 player cùng id.
   */
  it('[TC-IMP165.02u/MSS] doJoinRoom từ chối duplicate playerId → max 1 player/id', () => {
    const rooms = new Map<string, ReturnType<typeof createRoom>>();
    const room = createRoom('p1', 'VTA002');
    rooms.set('VTA002', room);
    const touchFn = vi.fn();

    doJoinRoom(rooms as never, 'VTA002', 'p2', touchFn);
    doJoinRoom(rooms as never, 'VTA002', 'p2', touchFn); // duplicate

    // Contract: Không được có 2 player với cùng id 'p2'
    const duplicates = rooms.get('VTA002')?.players.filter((p) => p.id === 'p2');
    expect(duplicates?.length).toBeLessThanOrEqual(1);
  });

  /**
   * [TC-IMP165.05u/MSS] doJoinRoom phòng đầy 4 người → trả về undefined
   * BUG HIỆN TẠI: doJoinRoom không chặn players.length >= 4.
   */
  it('[TC-IMP165.05u/MSS] doJoinRoom phòng đủ 4 người → trả về undefined (không thêm)', () => {
    const rooms = new Map<string, ReturnType<typeof createRoom>>();
    const room = createRoom('p1', 'VTA003');
    room.players.push(createPlayer('p2'));
    room.players.push(createPlayer('p3'));
    room.players.push(createPlayer('p4'));
    rooms.set('VTA003', room);
    const touchFn = vi.fn();

    const result = doJoinRoom(rooms as never, 'VTA003', 'p5', touchFn);

    // Contract: phải trả về undefined khi phòng đầy
    expect(result).toBeUndefined();
    // Contract: phòng vẫn chỉ có 4 người, không tăng thêm
    expect(room.players).toHaveLength(4);
  });

  /**
   * [TC-IMP165.15u/MSS] doJoinRoom phòng đã started → trả về undefined → handler cần báo ROOM_STARTED
   */
  it('[TC-IMP165.15u/MSS] doJoinRoom phòng đã started → trả undefined (cần phân biệt với ROOM_NOT_FOUND)', () => {
    const rooms = new Map<string, ReturnType<typeof createRoom>>();
    const botPersonalities = new Map<string, string>();
    const room = createRoom('p1', 'VTA004');
    room.players.push(createPlayer('p2'));
    rooms.set('VTA004', room);
    const touchFn = vi.fn();

    doStartGame(rooms as never, botPersonalities as never, 'VTA004', [], touchFn);

    // Phòng đã started
    const startedRoom = rooms.get('VTA004');
    expect(startedRoom?.started).toBe(true);

    // Contract: doJoinRoom trả undefined khi phòng đã started
    const result = doJoinRoom(rooms as never, 'VTA004', 'p3', touchFn);
    expect(result).toBeUndefined();
    // Handler phải phân biệt: đây là ROOM_STARTED, không phải ROOM_NOT_FOUND
    // (Logic phân tầng cần ở handleJoinRoom chứ không phải doJoinRoom)
    expect(startedRoom?.players).toHaveLength(2); // Không thêm p3
  });
});
