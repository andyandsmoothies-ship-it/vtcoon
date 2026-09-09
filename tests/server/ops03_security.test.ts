// [UC-SEC-001/MSS][UC-SEC-002/MSS][UC-SEC-003/MSS] OPS-03 Security, Rate Limiting & Anti-Cheat Test Suite
// TC-OPS03.1: Intent ngoài lượt bị reject 100%, game state bất biến sau adversarial test.
// TC-OPS03.2: Rate limiter khóa socket sau 10 msg/s, kick sau 3 vi phạm.
// TC-OPS03.3: Malformed JSON hoặc giá trị âm trả về INVALID_ENVELOPE / INVALID_VALUE an toàn.
// TC-OPS03.4: Server không crash sau 1.000 malformed messages gửi liên tục.
// TC-OPS03.5: Ghi nhận structured logs cho các sự kiện bảo mật.

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { WssServer } from '../../src/server/network/wss_server.js';
import { RateLimiter } from '../../src/server/security/rate_limiter.js';
import { EnvelopeValidator } from '../../src/server/security/envelope_validator.js';
import { IntentGuard } from '../../src/server/security/intent_guard.js';
import { createRoom, createPlayer, type Room } from '../../src/domain/room.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

const TEST_PORT = 3108;
let server: WssServer;

beforeAll(() => {
  server = new WssServer({
    port: TEST_PORT,
    rateLimiterOptions: {
      maxRequestsPerWindow: 10,
      windowMs: 1000,
      lockoutDurationMs: 300,
      maxViolations: 3,
      violationWindowMs: 60000,
    },
  });
});

afterAll(async () => {
  await server.close();
});

function openSocket(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
    ws.once('open', () => resolve(ws));
    ws.once('error', reject);
  });
}

function collectMessages(socket: WebSocket, count: number, timeoutMs = 3000): Promise<WsServerMessage[]> {
  return new Promise((resolve, reject) => {
    const msgs: WsServerMessage[] = [];
    const timer = setTimeout(() => reject(new Error(`Timeout: nhận ${msgs.length}/${count} messages`)), timeoutMs);
    const onMsg = (data: Buffer | string): void => {
      msgs.push(JSON.parse(data.toString()) as WsServerMessage);
      if (msgs.length === count) {
        clearTimeout(timer);
        socket.off('message', onMsg);
        resolve(msgs);
      }
    };
    socket.on('message', onMsg);
  });
}

async function sendRaw(socket: WebSocket, raw: string, timeoutMs = 3000): Promise<WsServerMessage> {
  const pending = collectMessages(socket, 1, timeoutMs);
  socket.send(raw);
  const [msg] = await pending;
  if (!msg) throw new Error('Không nhận được phản hồi');
  return msg;
}

function snapshotRoom(room: Room): string {
  return JSON.stringify({
    players: room.players.map((p) => ({
      id: p.id,
      balance: p.balance,
      position: p.position,
      bankrupt: p.bankrupt,
      mortgaged: [...p.mortgagedProperties],
    })),
    currentPlayerIndex: room.currentPlayerIndex,
    phase: room.phase,
    started: room.started,
    treasury: room.treasury,
  });
}

describe('[Slice OPS-03] Bảo Mật, Rate Limiting & Chống Gian Lận', () => {

  // =========================================================================
  // TC-OPS03.1: Intent ngoài lượt bị chặn 100%, game state bất biến
  // =========================================================================
  describe('TC-OPS03.1: Out-of-Turn Intent Guard & State Invariant', () => {
    it('[TC-OPS03.1/MSS] [UC-SEC-001/MSS] Intent ngoai luot bi reject voi OUT_OF_TURN, game state bat bien', async () => {
      const wsHost = await openSocket();
      const wsGuest = await openSocket();

      const hostInit = collectMessages(wsHost, 2);
      wsHost.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'host-sec1' }));
      const [created] = await hostInit;
      if (created?.type !== 'ROOM_CREATED') throw new Error('ROOM_CREATED expected');
      const rc = created.roomCode;

      const guestJoin = collectMessages(wsGuest, 2);
      wsGuest.send(JSON.stringify({ type: 'JOIN_ROOM', playerId: 'guest-sec1', roomCode: rc }));
      await guestJoin;

      const rm = server.getRoomManager();
      rm.startGame(rc);
      const room = rm.getRoom(rc)!;
      expect(room.currentPlayerIndex).toBe(0); // host turn

      const stateBefore = snapshotRoom(room);

      // Guest cố tình gửi INTENT_BUY trong lượt của Host
      const rejectPending = collectMessages(wsGuest, 1);
      wsGuest.send(JSON.stringify({
        type: 'INTENT',
        roomCode: rc,
        playerId: 'guest-sec1',
        intent: { type: 'INTENT_BUY' },
      }));

      const [reply] = await rejectPending;
      expect(reply?.type).toBe('INTENT_REJECTED');
      if (reply && 'reasonCode' in reply) {
        expect(reply.reasonCode).toBe('OUT_OF_TURN');
      }

      // Adversarial Inversion: game state bất biến 100%
      const stateAfter = snapshotRoom(room);
      expect(stateAfter).toEqual(stateBefore);

      wsHost.close();
      wsGuest.close();
    });

    it('[TC-OPS03.1-bot/MSS] [UC-SEC-001/A1] Bot AI gui intent ngoai luot bi chan OUT_OF_TURN', () => {
      const guard = new IntentGuard();
      const room = createRoom('host-bot');
      room.started = true;
      const bot = createPlayer('bot-ai-1');
      bot.isBot = true;
      room.players.push(bot);
      room.currentPlayerIndex = 0; // Host turn

      const result = guard.validate(room, 'bot-ai-1', { type: 'INTENT_BUY' });
      expect(result.allowed).toBe(false);
      expect(result.reasonCode).toBe('OUT_OF_TURN');
      expect(result.playerId).toBe('bot-ai-1');
    });

    it('[TC-OPS03.1-bankrupt/MSS] Nguoi choi pha san bi chan tat ca intent voi OUT_OF_TURN', () => {
      const guard = new IntentGuard();
      const room = createRoom('host-bk');
      room.started = true;
      room.players[0]!.bankrupt = true;
      const res = guard.validate(room, room.players[0]!.id, { type: 'INTENT_ROLL' });
      expect(res.allowed).toBe(false);
      expect(res.reasonCode).toBe('OUT_OF_TURN');
    });
  });

  // =========================================================================
  // TC-OPS03.2: Rate limiter khóa socket sau 10 msg/s, kick sau 3 vi phạm
  // =========================================================================
  describe('TC-OPS03.2: Rate Limiter & Abuse Kick', () => {
    it('[TC-OPS03.2/MSS] [UC-SEC-002/MSS] Rate limiter chan sau 10 msg/s va khoa socket', () => {
      const limiter = new RateLimiter({ maxRequestsPerWindow: 10, windowMs: 1000, lockoutDurationMs: 5000, maxViolations: 3 });
      const now = 1000000;

      for (let i = 0; i < 10; i++) {
        const res = limiter.checkLimit('sock-1', now + i);
        expect(res.allowed).toBe(true);
      }

      // Message thứ 11 trong cùng 1s -> Bị chặn với RATE_LIMIT_EXCEEDED
      const overflow = limiter.checkLimit('sock-1', now + 15);
      expect(overflow.allowed).toBe(false);
      expect(overflow.reasonCode).toBe('RATE_LIMIT_EXCEEDED');

      // Trong thời gian khóa 5s -> Vẫn bị chặn
      const locked = limiter.checkLimit('sock-1', now + 2000);
      expect(locked.allowed).toBe(false);
      expect(locked.reasonCode).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('[TC-OPS03.2-kick/MSS] [UC-SEC-002/MSS] 3 lan vi pham dan den ABUSE_DETECTED va kick', () => {
      const limiter = new RateLimiter({ maxRequestsPerWindow: 10, windowMs: 1000, lockoutDurationMs: 200, maxViolations: 3, violationWindowMs: 60000 });
      let now = 1000000;

      // Vi phạm 1
      for (let i = 0; i < 10; i++) limiter.checkLimit('sock-abuse', now++);
      const v1 = limiter.checkLimit('sock-abuse', now++);
      expect(v1.reasonCode).toBe('RATE_LIMIT_EXCEEDED');
      expect(v1.kick).toBeFalsy();

      // Đợi hết window 1000ms và lockout 200ms -> Vi phạm 2
      now += 1200;
      for (let i = 0; i < 10; i++) limiter.checkLimit('sock-abuse', now++);
      const v2 = limiter.checkLimit('sock-abuse', now++);
      expect(v2.reasonCode).toBe('RATE_LIMIT_EXCEEDED');
      expect(v2.kick).toBeFalsy();

      // Đợi hết window 1000ms và lockout 200ms -> Vi phạm 3 -> ABUSE_DETECTED & kick
      now += 1200;
      for (let i = 0; i < 10; i++) limiter.checkLimit('sock-abuse', now++);
      const v3 = limiter.checkLimit('sock-abuse', now++);
      expect(v3.reasonCode).toBe('ABUSE_DETECTED');
      expect(v3.kick).toBe(true);

      // Message gửi tiếp sau kick vẫn bị từ chối với ABUSE_DETECTED và kick: true
      const v4 = limiter.checkLimit('sock-abuse', now++);
      expect(v4.reasonCode).toBe('ABUSE_DETECTED');
      expect(v4.kick).toBe(true);
    });

    it('[TC-OPS03.2-ws/MSS] [UC-SEC-002/MSS] WSS Server tra RATE_LIMIT_EXCEEDED khi client spam', async () => {
      const ws = await openSocket();
      const responses: WsServerMessage[] = [];

      // Mở listener lắng nghe tất cả responses
      ws.on('message', (d) => responses.push(JSON.parse(d.toString()) as WsServerMessage));

      // Gửi 15 messages liên tục
      for (let i = 0; i < 15; i++) {
        ws.send(JSON.stringify({ type: 'PONG', playerId: `p-${i}`, roomCode: 'ROOM01' }));
      }

      await new Promise((r) => setTimeout(r, 100));

      const rateLimitErrors = responses.filter(
        (r) => 'reasonCode' in r && r.reasonCode === 'RATE_LIMIT_EXCEEDED',
      );
      expect(rateLimitErrors.length).toBeGreaterThanOrEqual(1);

      ws.close();
    });
  });

  // =========================================================================
  // TC-OPS03.3: Malformed JSON / Giá trị âm / Thiếu trường
  // =========================================================================
  describe('TC-OPS03.3: Envelope Validation & Value Sanity', () => {
    it('[TC-OPS03.3-json/MSS] [UC-SEC-003/MSS] Malformed JSON tra INVALID_ENVELOPE va server tiep tuc chay', async () => {
      const ws = await openSocket();
      const reply = await sendRaw(ws, '{ invalid json syntax }');

      expect('reasonCode' in reply && reply.reasonCode).toBe('INVALID_ENVELOPE');
      expect(server.isRunning).toBe(true);

      ws.close();
    });

    it('[TC-OPS03.3-neg/MSS] [UC-SEC-003/MSS] Payload co gia tri am tra INVALID_VALUE', async () => {
      const ws = await openSocket();
      const reply = await sendRaw(ws, JSON.stringify({
        type: 'INTENT',
        roomCode: 'TEST01',
        playerId: 'p1',
        intent: { type: 'INTENT_BID', amount: -500 },
      }));

      expect('reasonCode' in reply && reply.reasonCode).toBe('INVALID_VALUE');
      ws.close();
    });

    it('[TC-OPS03.3-cell/MSS] [UC-SEC-003/MSS] cellIndex ngoai pham vi [0, 39] tra INVALID_VALUE', async () => {
      const ws = await openSocket();
      const reply = await sendRaw(ws, JSON.stringify({
        type: 'INTENT',
        roomCode: 'TEST01',
        playerId: 'p1',
        intent: { type: 'INTENT_UPGRADE', cellIndex: 42 },
      }));

      expect('reasonCode' in reply && reply.reasonCode).toBe('INVALID_VALUE');
      ws.close();
    });

    it('[TC-OPS03.3-missing/MSS] [UC-SEC-003/MSS] Thieu truong bat buoc tra INVALID_ENVELOPE', async () => {
      const ws = await openSocket();
      const reply = await sendRaw(ws, JSON.stringify({
        type: 'JOIN_ROOM',
        playerId: 'p1',
        // thieu roomCode
      }));

      expect('reasonCode' in reply && reply.reasonCode).toBe('INVALID_ENVELOPE');
      ws.close();
    });

    it('[TC-OPS03.3-intent-schema/MSS] [UC-SEC-003/MSS] Kiem chuan schema PlayerIntent: thieu truong, sai so, intent la', async () => {
      const ws = await openSocket();
      // Thiếu cellIndex trong INTENT_UPGRADE -> INVALID_ENVELOPE
      const reply1 = await sendRaw(ws, JSON.stringify({
        type: 'INTENT', roomCode: 'TEST01', playerId: 'p1', intent: { type: 'INTENT_UPGRADE' },
      }));
      expect('reasonCode' in reply1 && reply1.reasonCode).toBe('INVALID_ENVELOPE');

      // cellIndex là số lẻ không nguyên -> INVALID_VALUE
      const reply2 = await sendRaw(ws, JSON.stringify({
        type: 'INTENT', roomCode: 'TEST01', playerId: 'p1', intent: { type: 'INTENT_UPGRADE', cellIndex: 12.5 },
      }));
      expect('reasonCode' in reply2 && reply2.reasonCode).toBe('INVALID_VALUE');

      // Intent type không tồn tại -> INVALID_INTENT
      const reply3 = await sendRaw(ws, JSON.stringify({
        type: 'INTENT', roomCode: 'TEST01', playerId: 'p1', intent: { type: 'INVALID_HACK' },
      }));
      expect('reasonCode' in reply3 && reply3.reasonCode).toBe('INVALID_INTENT');
      ws.close();
    });
  });

  // =========================================================================
  // TC-OPS03.4: Server không crash sau 1.000 malformed messages
  // =========================================================================
  describe('TC-OPS03.4: 1.000 Malformed Messages Flood Defense', () => {
    it('[TC-OPS03.4/MSS] Server khong crash sau 1.000 malformed messages gui lien tuc', async () => {
      const ws = await openSocket();

      // Gửi 1.000 malformed messages
      for (let i = 0; i < 1000; i++) {
        ws.send(`{ bad_packet_${i}: unclosed string`);
      }

      await new Promise((r) => setTimeout(r, 150));

      expect(server.isRunning).toBe(true);

      // Chứng minh server vẫn tiếp nhận và xử lý kết nối bình thường
      const wsNew = await openSocket();
      const initPending = collectMessages(wsNew, 2);
      wsNew.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'alive-player' }));
      const [created] = await initPending;

      expect(created?.type).toBe('ROOM_CREATED');
      expect(server.isRunning).toBe(true);

      ws.close();
      wsNew.close();
    });
  });

  // =========================================================================
  // TC-OPS03.5: Structured logs cho các sự kiện bảo mật
  // =========================================================================
  describe('TC-OPS03.5: Structured Security Observability', () => {
    it('[TC-OPS03.5/MSS] Emit structured logs cho SECURITY_OUT_OF_TURN, RATE_LIMIT_HIT, ABUSE_DETECTED', () => {
      const warnLogs: string[] = [];
      const spy = vi.spyOn(console, 'warn').mockImplementation((msg) => {
        warnLogs.push(String(msg));
      });

      try {
        // 1. Out of turn
        const guard = new IntentGuard();
        const room = createRoom('log-room');
        room.players.push(createPlayer('guest-player'));
        room.started = true;
        room.currentPlayerIndex = 0; // host's turn
        guard.validate(room, 'guest-player', { type: 'INTENT_BUY' });

        expect(warnLogs.some((l) => l.includes('SECURITY_OUT_OF_TURN') && l.includes('guest-player') && l.includes(room.roomCode))).toBe(true);

        // 2. Rate limit hit & abuse
        const limiter = new RateLimiter({ maxRequestsPerWindow: 2, lockoutDurationMs: 10, maxViolations: 2, violationWindowMs: 5000 });
        limiter.checkLimit('test-sock', 1000);
        limiter.checkLimit('test-sock', 1001);
        limiter.checkLimit('test-sock', 1002); // hit 1
        expect(warnLogs.some((l) => l.includes('RATE_LIMIT_HIT') && l.includes('test-sock'))).toBe(true);

        limiter.checkLimit('test-sock', 1100);
        limiter.checkLimit('test-sock', 1101);
        limiter.checkLimit('test-sock', 1102); // hit 2 -> abuse
        expect(warnLogs.some((l) => l.includes('ABUSE_DETECTED') && l.includes('test-sock'))).toBe(true);

        // 3. Envelope validator
        const validator = new EnvelopeValidator();
        validator.parseAndValidate('{ malformed json');
        expect(warnLogs.some((l) => l.includes('SECURITY_MALFORMED_JSON'))).toBe(true);

        validator.validateEnvelope({ type: 'INTENT', roomCode: 'R1', playerId: 'p1', intent: { type: 'INTENT_BID', amount: -10 } });
        expect(warnLogs.some((l) => l.includes('SECURITY_INVALID_VALUE'))).toBe(true);
      } finally {
        spy.mockRestore();
      }
    });
  });
});
