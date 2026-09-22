// [TC-SIM165/MSS][UC-GAME-001/MSS][UC-GAME-003/MSS][UC-GAME-028/MSS]
// Simulation Test: 4-Player Real-Time Gameplay Lifecycle & Synchronization
// Kiểm chứng vòng đời trận đấu 4 người chơi thật qua WebSocket WssServer:
// 1. Tạo phòng, 3 khách tham gia, bắt đầu trận không kèm bot, nhận đủ vốn ban đầu (18.000 Tr theo SSOT IMP-60).
// 2. Sàn đấu giá khi từ chối mua BĐS: 2 người chơi khác gửi AuctionBid tăng dần chuẩn xác.
// 3. Vỡ nợ (Bankruptcy): Người chơi âm tiền tuyên bố phá sản, các vòng sau FSM tự động bỏ qua.
// 4. Giả lập vòng lặp 15 vòng chơi liên tục: Lượt đi tuần tự vòng tròn, zero deadlock, zero stall.

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { WebSocket } from 'ws';
import { WssServer } from '../../src/server/network/wss_server.js';
import { TurnPhase, getInitialBalanceForPlayerCount } from '../../src/domain/room.js';
import { MarketCardId } from '../../src/domain/event_card_types.js';
import type { WsServerMessage, WsClientMessage } from '../../src/server/network/network_types.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

const TEST_PORT = 3169;
let server: WssServer;
const activeSockets: WebSocket[] = [];

interface ClientHandle {
  readonly ws: WebSocket;
  readonly playerId: string;
  readonly inbox: WsServerMessage[];
  send: (msg: WsClientMessage) => void;
  sendAndWait: <T extends WsServerMessage>(
    msg: WsClientMessage,
    pred: (m: WsServerMessage) => boolean,
    timeoutMs?: number,
  ) => Promise<T>;
  waitFor: <T extends WsServerMessage>(pred: (m: WsServerMessage) => boolean, timeoutMs?: number) => Promise<T>;
  clearInbox: () => void;
  close: () => void;
}

function createClientHandle(port: number, playerId: string): Promise<ClientHandle> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    activeSockets.push(ws);
    const inbox: WsServerMessage[] = [];
    const listeners: Array<(m: WsServerMessage) => boolean> = [];

    ws.on('open', () => {
      const handle: ClientHandle = {
        ws,
        playerId,
        inbox,
        send: (msg: WsClientMessage) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(msg));
          }
        },
        sendAndWait: <T extends WsServerMessage>(
          msg: WsClientMessage,
          pred: (m: WsServerMessage) => boolean,
          timeoutMs = 10_000,
        ): Promise<T> => {
          return new Promise<T>((res, rej) => {
            const intentName = (msg as { intent?: { type?: string } }).intent?.type ?? msg.type;
            const timer = setTimeout(() => {
              const idx = listeners.indexOf(listener);
              if (idx !== -1) listeners.splice(idx, 1);
              rej(new Error(`[${playerId}] Timeout (${timeoutMs}ms) waiting for response to ${intentName}`));
            }, timeoutMs);

            const listener = (m: WsServerMessage): boolean => {
              if (m.type === 'INTENT_REJECTED' || m.type === 'ERROR') {
                clearTimeout(timer);
                rej(new Error(`[${playerId}] Intent ${intentName} was rejected: ${JSON.stringify(m)}`));
                return true;
              }
              if (pred(m)) {
                clearTimeout(timer);
                res(m as T);
                return true;
              }
              return false;
            };
            listeners.push(listener);

            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(msg));
            } else {
              clearTimeout(timer);
              const idx = listeners.indexOf(listener);
              if (idx !== -1) listeners.splice(idx, 1);
              rej(new Error(`[${playerId}] WebSocket is not open`));
            }
          });
        },
        waitFor: <T extends WsServerMessage>(pred: (m: WsServerMessage) => boolean, timeoutMs = 10_000): Promise<T> => {
          const existingIdx = inbox.findIndex(pred);
          if (existingIdx !== -1) {
            const found = inbox.splice(existingIdx, 1)[0] as T;
            return Promise.resolve(found);
          }
          return new Promise<T>((res, rej) => {
            const timer = setTimeout(() => {
              const idx = listeners.indexOf(listener);
              if (idx !== -1) listeners.splice(idx, 1);
              rej(new Error(`[${playerId}] Timeout (${timeoutMs}ms) waiting for message`));
            }, timeoutMs);

            const listener = (m: WsServerMessage): boolean => {
              if (pred(m)) {
                clearTimeout(timer);
                res(m as T);
                return true;
              }
              return false;
            };
            listeners.push(listener);
          });
        },
        clearInbox: () => {
          inbox.length = 0;
        },
        close: () => {
          try {
            ws.close();
          } catch {
            /* safe-ignore */
          }
        },
      };

      ws.on('message', (raw) => {
        try {
          const parsed = JSON.parse(raw.toString()) as WsServerMessage;
          for (let i = 0; i < listeners.length; i++) {
            const l = listeners[i]!;
            if (l(parsed)) {
              listeners.splice(i, 1);
              return;
            }
          }
          inbox.push(parsed);
        } catch {
          /* safe-ignore */
        }
      });

      resolve(handle);
    });

    ws.on('error', reject);
  });
}

beforeAll(() => {
  server = new WssServer({
    port: TEST_PORT,
    botTurnDelayMs: 60_000,
    turnTimeoutMs: 60_000,
    gracePeriodMs: 5_000,
    rateLimiterOptions: {
      maxRequestsPerWindow: 50_000,
      windowMs: 1_000,
    },
  });
});

afterEach(() => {
  for (const s of activeSockets) {
    try {
      s.removeAllListeners();
      if (s.readyState === WebSocket.OPEN || s.readyState === WebSocket.CONNECTING) {
        s.close();
      }
    } catch {
      /* safe-ignore */
    }
  }
  activeSockets.length = 0;
});

afterAll(async () => {
  await server.close();
});

describe('[SIM-IMP165] Vòng Đời Trận Đấu 4 Người Chơi Thật (4-Player Gameplay Sync Simulation)', () => {
  it('[TC-SIM165.01/MSS] 4 người chơi thật (p1 Host, p2, p3, p4 khách) tạo phòng, kết nối WSS, bắt đầu trận không kèm bot và nhận đủ vốn ban đầu', async () => {
    const p1 = await createClientHandle(TEST_PORT, 'p1');
    p1.send({ type: 'CREATE_ROOM', playerId: 'p1' });
    const created = await p1.waitFor<{ type: 'ROOM_CREATED'; roomCode: string; playerId: string }>((m) => m.type === 'ROOM_CREATED');
    const roomCode = created.roomCode;
    expect(roomCode).toMatch(/^[A-Z0-9]{6}$|^VT[A-Z0-9]{4}$/);

    const p2 = await createClientHandle(TEST_PORT, 'p2');
    const p3 = await createClientHandle(TEST_PORT, 'p3');
    const p4 = await createClientHandle(TEST_PORT, 'p4');

    p2.send({ type: 'JOIN_ROOM', roomCode, playerId: 'p2' });
    p3.send({ type: 'JOIN_ROOM', roomCode, playerId: 'p3' });
    p4.send({ type: 'JOIN_ROOM', roomCode, playerId: 'p4' });

    await p1.waitFor((m) => m.type === 'LOBBY_UPDATE' && m.players.length === 4);
    await p4.waitFor((m) => m.type === 'LOBBY_UPDATE' && m.players.length === 4);

    // Host gửi START_GAME không kèm bot
    p1.send({ type: 'START_GAME', roomCode, playerId: 'p1' });

    const expectedInitialBalance = getInitialBalanceForPlayerCount(4);
    expect(expectedInitialBalance).toBe(18_000);

    const clients = [p1, p2, p3, p4];
    for (const c of clients) {
      const startedMsg = await c.waitFor<{ type: 'ROOM_STARTED'; roomCode: string }>((m) => m.type === 'ROOM_STARTED');
      expect(startedMsg.type).toBe('ROOM_STARTED');

      const deltaMsg = await c.waitFor<{ type: 'STATE_DELTA'; delta: DeltaPayload }>((m) => m.type === 'STATE_DELTA');
      expect(deltaMsg.delta.players).toHaveLength(4);

      for (const pl of deltaMsg.delta.players!) {
        expect(pl.balance).toBe(expectedInitialBalance);
        expect(pl.bankrupt).toBeFalsy();
        expect(pl.isBot).toBeFalsy();
      }
    }

    const room = server.getRoomManager().getRoom(roomCode);
    expect(room?.started).toBe(true);
    expect(room?.players.every((p) => !p.isBot)).toBe(true);
  }, 30_000);

  it('[TC-SIM165.02/MSS] Sàn đấu giá kích hoạt khi từ chối mua BĐS: 2 người chơi khác gửi AuctionBid tăng dần chuẩn xác', async () => {
    const p1 = await createClientHandle(TEST_PORT, 'p1');
    p1.send({ type: 'CREATE_ROOM', playerId: 'p1' });
    const { roomCode } = await p1.waitFor<{ type: 'ROOM_CREATED'; roomCode: string; playerId: string }>((m) => m.type === 'ROOM_CREATED');

    const p2 = await createClientHandle(TEST_PORT, 'p2');
    const p3 = await createClientHandle(TEST_PORT, 'p3');
    const p4 = await createClientHandle(TEST_PORT, 'p4');

    p2.send({ type: 'JOIN_ROOM', roomCode, playerId: 'p2' });
    p3.send({ type: 'JOIN_ROOM', roomCode, playerId: 'p3' });
    p4.send({ type: 'JOIN_ROOM', roomCode, playerId: 'p4' });
    await p4.waitFor((m) => m.type === 'LOBBY_UPDATE' && m.players.length === 4);

    p1.send({ type: 'START_GAME', roomCode, playerId: 'p1' });
    await p1.waitFor((m) => m.type === 'ROOM_STARTED');

    // Thiết lập p1 dừng tại Ô 1 (Cần Thơ, giá gốc 600, chưa có chủ)
    const room = server.getRoomManager().getRoom(roomCode)!;
    room.players[0]!.position = 1;
    room.phase = TurnPhase.ActionPhase;

    // p1 gửi INTENT_DECLINE từ chối mua
    p1.send({ type: 'INTENT', roomCode, playerId: 'p1', intent: { type: 'INTENT_DECLINE' } });

    // Cả 4 người nhận STATE_DELTA kích hoạt phiên đấu giá
    const auctionDelta = await p2.waitFor<{ type: 'STATE_DELTA'; delta: DeltaPayload }>(
      (m) => m.type === 'STATE_DELTA' && m.delta.auction !== null && m.delta.auction !== undefined,
    );
    const auction = auctionDelta.delta.auction!;
    expect(auction.cellIndex).toBe(1);
    expect(auction.currentBid).toBe(300); // 50% giá gốc 600 Tr.

    // Người chơi p2 đặt giá 400 Tr.
    p2.send({ type: 'INTENT', roomCode, playerId: 'p2', intent: { type: 'INTENT_BID', amount: 400 } });
    const bid1Delta = await p3.waitFor<{ type: 'STATE_DELTA'; delta: DeltaPayload }>(
      (m) => m.type === 'STATE_DELTA' && m.delta.auction?.highestBidderId === 'p2',
    );
    expect(bid1Delta.delta.auction?.currentBid).toBe(400);

    // Người chơi p3 nâng giá lên 500 Tr.
    p3.send({ type: 'INTENT', roomCode, playerId: 'p3', intent: { type: 'INTENT_BID', amount: 500 } });
    const bid2Delta = await p1.waitFor<{ type: 'STATE_DELTA'; delta: DeltaPayload }>(
      (m) => m.type === 'STATE_DELTA' && m.delta.auction?.highestBidderId === 'p3',
    );
    expect(bid2Delta.delta.auction?.currentBid).toBe(500);

    // p2 và p4 bỏ cuộc (PASS) để chốt sàn đấu giá
    p2.send({ type: 'INTENT', roomCode, playerId: 'p2', intent: { type: 'INTENT_AUCTION_PASS' } });
    p4.send({ type: 'INTENT', roomCode, playerId: 'p4', intent: { type: 'INTENT_AUCTION_PASS' } });

    // Kiểm tra Ô 1 được trao quyền sở hữu cho p3 với giá 500 Tr.
    await p3.waitFor<{ type: 'STATE_DELTA'; delta: DeltaPayload }>(
      (m) => m.type === 'STATE_DELTA' && m.delta.cells?.some((c) => c.index === 1 && c.ownerId === 'p3'),
    );
    const registry = server.getRoomManager().getRegistry(roomCode);
    expect(registry?.get(1)).toBe('p3');
    expect(room.players.find((p) => p.id === 'p3')?.balance).toBe(18_000 - 500);
  }, 30_000);

  it('[TC-SIM165.03/MSS] Vỡ nợ (Bankruptcy): Người chơi âm tiền gửi INTENT_BANKRUPTCY nhận bankrupt=true và FSM tự động bỏ qua ở các lượt kế tiếp', async () => {
    const p1 = await createClientHandle(TEST_PORT, 'p1');
    p1.send({ type: 'CREATE_ROOM', playerId: 'p1' });
    const { roomCode } = await p1.waitFor<{ type: 'ROOM_CREATED'; roomCode: string; playerId: string }>((m) => m.type === 'ROOM_CREATED');

    const p2 = await createClientHandle(TEST_PORT, 'p2');
    const p3 = await createClientHandle(TEST_PORT, 'p3');
    const p4 = await createClientHandle(TEST_PORT, 'p4');

    p2.send({ type: 'JOIN_ROOM', roomCode, playerId: 'p2' });
    p3.send({ type: 'JOIN_ROOM', roomCode, playerId: 'p3' });
    p4.send({ type: 'JOIN_ROOM', roomCode, playerId: 'p4' });
    await p4.waitFor((m) => m.type === 'LOBBY_UPDATE' && m.players.length === 4);

    p1.send({ type: 'START_GAME', roomCode, playerId: 'p1' });
    await p1.waitFor((m) => m.type === 'ROOM_STARTED');
    await p2.waitFor((m) => m.type === 'ROOM_STARTED');
    await p3.waitFor((m) => m.type === 'ROOM_STARTED');
    await p4.waitFor((m) => m.type === 'ROOM_STARTED');

    const room = server.getRoomManager().getRoom(roomCode)!;

    // Giả lập p4 bị âm tiền nặng (-2.000 Tr) và gửi INTENT_BANKRUPTCY
    const player4 = room.players.find((p) => p.id === 'p4')!;
    player4.balance = -2_000;

    await p4.sendAndWait(
      { type: 'INTENT', roomCode, playerId: 'p4', intent: { type: 'INTENT_BANKRUPTCY' } },
      (m) => m.type === 'STATE_DELTA' && Boolean(m.delta.players?.some((p) => p.id === 'p4' && p.bankrupt === true)),
    );
    expect(player4.bankrupt).toBe(true);

    // Chạy lượt từ p1 -> p2 -> p3 -> p1 để chứng minh p4 bị bỏ qua hoàn toàn
    // Lượt 1: p1 chơi đến khi chuyển lượt sang p2
    while (room.players[room.currentPlayerIndex]?.id === 'p1') {
      if (room.phase === TurnPhase.WaitingRoll) {
        await p1.sendAndWait(
          { type: 'INTENT', roomCode, playerId: 'p1', intent: { type: 'INTENT_ROLL' } },
          (m) => m.type === 'STATE_DELTA',
        );
      }
      await p1.sendAndWait(
        { type: 'INTENT', roomCode, playerId: 'p1', intent: { type: 'INTENT_END_TURN' } },
        (m) => m.type === 'STATE_DELTA',
      );
    }
    expect(room.players[room.currentPlayerIndex]?.id).toBe('p2');

    // Lượt 2: p2 chơi đến khi chuyển lượt sang p3
    while (room.players[room.currentPlayerIndex]?.id === 'p2') {
      if (room.phase === TurnPhase.WaitingRoll) {
        await p2.sendAndWait(
          { type: 'INTENT', roomCode, playerId: 'p2', intent: { type: 'INTENT_ROLL' } },
          (m) => m.type === 'STATE_DELTA',
        );
      }
      await p2.sendAndWait(
        { type: 'INTENT', roomCode, playerId: 'p2', intent: { type: 'INTENT_END_TURN' } },
        (m) => m.type === 'STATE_DELTA',
      );
    }
    expect(room.players[room.currentPlayerIndex]?.id).toBe('p3');

    // Lượt 3: p3 chơi đến khi kết thúc -> FSM phải quay về p1 (bỏ qua p4 hoàn toàn)
    while (room.players[room.currentPlayerIndex]?.id === 'p3') {
      if (room.phase === TurnPhase.WaitingRoll) {
        await p3.sendAndWait(
          { type: 'INTENT', roomCode, playerId: 'p3', intent: { type: 'INTENT_ROLL' } },
          (m) => m.type === 'STATE_DELTA',
        );
      }
      await p3.sendAndWait(
        { type: 'INTENT', roomCode, playerId: 'p3', intent: { type: 'INTENT_END_TURN' } },
        (m) => m.type === 'STATE_DELTA',
      );
    }

    // FSM phải lập tức quay về p1, bỏ qua p4
    expect(room.players[room.currentPlayerIndex]?.id).toBe('p1');
    expect(room.currentPlayerIndex).not.toBe(3);
  }, 30_000);

  it('[TC-SIM165.04/MSS] Giả lập vòng lặp 15 vòng chơi liên tục (60 lượt): Lượt đi tuần tự vòng tròn, zero deadlock, zero stall', async () => {
    const p1 = await createClientHandle(TEST_PORT, 'p1');
    p1.send({ type: 'CREATE_ROOM', playerId: 'p1' });
    const { roomCode } = await p1.waitFor<{ type: 'ROOM_CREATED'; roomCode: string; playerId: string }>((m) => m.type === 'ROOM_CREATED');

    const p2 = await createClientHandle(TEST_PORT, 'p2');
    const p3 = await createClientHandle(TEST_PORT, 'p3');
    const p4 = await createClientHandle(TEST_PORT, 'p4');

    p2.send({ type: 'JOIN_ROOM', roomCode, playerId: 'p2' });
    p3.send({ type: 'JOIN_ROOM', roomCode, playerId: 'p3' });
    p4.send({ type: 'JOIN_ROOM', roomCode, playerId: 'p4' });
    await p4.waitFor((m) => m.type === 'LOBBY_UPDATE' && m.players.length === 4);

    p1.send({ type: 'START_GAME', roomCode, playerId: 'p1' });
    await p1.waitFor((m) => m.type === 'ROOM_STARTED');
    await p2.waitFor((m) => m.type === 'ROOM_STARTED');
    await p3.waitFor((m) => m.type === 'ROOM_STARTED');
    await p4.waitFor((m) => m.type === 'ROOM_STARTED');

    const clientsMap = new Map<string, ClientHandle>([
      ['p1', p1],
      ['p2', p2],
      ['p3', p3],
      ['p4', p4],
    ]);

    const room = server.getRoomManager().getRoom(roomCode)!;
    const turnOrderSequence: string[] = [];
    const TARGET_ROUNDS = 15;
    let turnCount = 0;
    const MAX_SAFETY_TURNS = 300;

    while ((room.roundCount ?? 1) <= TARGET_ROUNDS && turnCount < MAX_SAFETY_TURNS) {
      turnCount++;
      const activePlayer = room.players[room.currentPlayerIndex]!;
      const client = clientsMap.get(activePlayer.id)!;
      turnOrderSequence.push(activePlayer.id);

      // 1. Nếu đang trong diện Kiểm toán (Audit) và có đủ tiền bảo lãnh -> nộp bảo lãnh để gieo xúc xắc
      if (activePlayer.auditTurnsLeft > 0 && room.phase === TurnPhase.WaitingRoll) {
        if (activePlayer.balance >= 500) {
          await client.sendAndWait(
            { type: 'INTENT', roomCode, playerId: activePlayer.id, intent: { type: 'INTENT_BAIL_OUT' } },
            (m) => m.type === 'STATE_DELTA',
          );
        }
      }

      // 2. Gieo xúc xắc nếu đang ở WaitingRoll
      if (room.phase === TurnPhase.WaitingRoll) {
        await client.sendAndWait(
          { type: 'INTENT', roomCode, playerId: activePlayer.id, intent: { type: 'INTENT_ROLL' } },
          (m) => m.type === 'STATE_DELTA',
        );
      }

      // 3. Xử lý sau gieo xúc xắc:
      // A. Mất khả năng thanh toán (Insolvency)
      if (room.phase === TurnPhase.InsolvencyPhase) {
        await client.sendAndWait(
          { type: 'INTENT', roomCode, playerId: activePlayer.id, intent: { type: 'INTENT_BANKRUPTCY' } },
          (m) => m.type === 'STATE_DELTA',
        );
        continue;
      }

      // B. Ô BĐS trống trong ActionPhase -> mua đất nếu đủ tiền (giữ buffer an toàn để duy trì 15 vòng)
      if (room.phase === TurnPhase.ActionPhase) {
        const isFrozen = Boolean(room.activeModifiers?.some((m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0));
        const reg = server.getRoomManager().getRegistry(roomCode);
        const pos = activePlayer.position;
        if (pos > 0 && !reg?.has(pos) && activePlayer.balance >= 8_000 && !isFrozen) {
          await client.sendAndWait(
            { type: 'INTENT', roomCode, playerId: activePlayer.id, intent: { type: 'INTENT_BUY' } },
            (m) => m.type === 'STATE_DELTA',
          );
        } else {
          await client.sendAndWait(
            { type: 'INTENT', roomCode, playerId: activePlayer.id, intent: { type: 'INTENT_DECLINE' } },
            (m) => m.type === 'STATE_DELTA',
          );
        }
      }

      // C. Sàn đấu giá kích hoạt -> tất cả người chơi đủ điều kiện pass để đóng sàn
      if (room.phase === TurnPhase.AuctionPhase) {
        const session = server.getRoomManager().getAuctionSession(roomCode);
        for (const p of room.players) {
          if (room.phase !== TurnPhase.AuctionPhase) break;
          if (!p.bankrupt && p.id !== session?.declinedPlayerId) {
            const cl = clientsMap.get(p.id)!;
            await cl.sendAndWait(
              { type: 'INTENT', roomCode, playerId: p.id, intent: { type: 'INTENT_AUCTION_PASS' } },
              (m) => m.type === 'STATE_DELTA',
            ).catch(() => {});
          }
        }
      }

      // C1. Sự kiện Đầu tư HOSE -> Bỏ qua để duy trì vốn
      if (room.phase === TurnPhase.HosePhase) {
        await client.sendAndWait(
          { type: 'INTENT', roomCode, playerId: activePlayer.id, intent: { type: 'INTENT_SKIP' } },
          (m) => m.type === 'STATE_DELTA',
        ).catch(() => {});
      }

      // C2. Thâu tóm bắt buộc (Compulsory Buyout) -> Bỏ qua nếu có để tiếp tục vòng lặp
      if (room.pendingBuyout && room.pendingBuyout.buyerId === activePlayer.id) {
        await client.sendAndWait(
          { type: 'INTENT', roomCode, playerId: activePlayer.id, intent: { type: 'INTENT_DECLINE_COMPULSORY_BUYOUT' } },
          (m) => m.type === 'STATE_DELTA',
        ).catch(() => {});
      }

      // D. Kết thúc lượt
      const currentActive = room.players[room.currentPlayerIndex];
      if (currentActive && !currentActive.bankrupt && (room.phase === TurnPhase.ActionPhase || room.phase === TurnPhase.PropertyManagement)) {
        const activeCl = clientsMap.get(currentActive.id)!;
        await activeCl.sendAndWait(
          { type: 'INTENT', roomCode, playerId: currentActive.id, intent: { type: 'INTENT_END_TURN' } },
          (m) => m.type === 'STATE_DELTA',
        );
      }
    }

    // Xác nhận tiến trình ván đấu đạt tối thiểu 15 vòng
    expect(room.roundCount).toBeGreaterThanOrEqual(TARGET_ROUNDS);
    expect(turnCount).toBeGreaterThanOrEqual(15 * 4 - 4); // Ít nhất 56 lượt

    // Kiểm tra tính tuần hoàn của lượt đi: các vòng tròn luân chuyển đều đặn
    expect(turnOrderSequence.length).toBeGreaterThanOrEqual(56);
    // Bỏ qua các lượt lặp liên tiếp do đổ xúc xắc đôi
    const distinctTurns = turnOrderSequence.filter((pid, idx) => pid !== turnOrderSequence[idx - 1]);
    expect(distinctTurns[0]).toBe('p1');
    expect(distinctTurns[1]).toBe('p2');
    expect(distinctTurns[2]).toBe('p3');
    expect(distinctTurns[3]).toBe('p4');
    expect(distinctTurns[4]).toBe('p1');

    // Không có tình trạng deadlock FSM
    expect(room.phase).not.toBe('STALLED');
  }, 45_000);
});
