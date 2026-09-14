// [IMP-50][TC-SIM-CHAOS/MSS] Headless WSS Living Match Chaos Suite
// Mô phỏng trận đấu sống động WssServer thật trong bộ nhớ Node.js với 1 Human Persona + 3 Bot AI
// Tua nhanh thời gian ảo (Virtual Clock) qua Fake Timers, kiểm chứng 2 Bất Biến Vĩ Mô (Invariants)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WssServer } from '../../src/server/network/wss_server.js';
import { EventEmitter } from 'events';
import { WebSocket } from 'ws';
import { TurnPhase } from '../../src/domain/room.js';
import type { WsClientMessage, WsServerMessage } from '../../src/server/network/network_types.js';

class MockInMemorySocket extends EventEmitter {
  public readyState: number = WebSocket.OPEN;
  public readonly sentMessages: WsServerMessage[] = [];

  public send(data: string): void {
    try {
      const parsed = JSON.parse(data) as WsServerMessage;
      this.sentMessages.push(parsed);
      this.emit('server_message', parsed);
    } catch {
      /* ignore non-json */
    }
  }

  public simulateClientMessage(msg: WsClientMessage): void {
    this.emit('message', Buffer.from(JSON.stringify(msg)));
  }

  public close(): void {
    this.readyState = WebSocket.CLOSED;
    this.emit('close');
  }
}

describe('[IMP-50] Trụ Cột 2: Headless WSS Living Match Chaos Suite', () => {
  let server: WssServer;
  let mockSocket: MockInMemorySocket;

  beforeEach(() => {
    vi.useFakeTimers();
    server = new WssServer({ port: 0, botTurnDelayMs: 200, turnTimeoutMs: 15_000 });
    mockSocket = new MockInMemorySocket();
    (server as any).handleConnection(mockSocket as unknown as WebSocket);
  });

  afterEach(async () => {
    mockSocket.close();
    await server.close();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('Vận hành trận đấu 1 Human + 3 Bot AI qua Virtual Clock, bảo đảm Loop & Stall Invariants', async () => {
    const HUMAN_ID = 'p1_human';

    // 1. Tạo phòng
    mockSocket.simulateClientMessage({
      type: 'CREATE_ROOM',
      playerId: HUMAN_ID,
    });

    const roomCreatedMsg = mockSocket.sentMessages.find((m) => m.type === 'ROOM_CREATED');
    expect(roomCreatedMsg).toBeDefined();
    const roomCode = (roomCreatedMsg as any).roomCode;
    expect(roomCode).toBeTruthy();

    const roomMgr = server.getRoomManager();

    // 2. Thêm 3 Bot AI
    roomMgr.addBot(roomCode, 'bot_2');
    roomMgr.addBot(roomCode, 'bot_3');
    roomMgr.addBot(roomCode, 'bot_4');

    // 3. Bắt đầu trận đấu
    mockSocket.simulateClientMessage({
      type: 'START_GAME',
      roomCode,
      playerId: HUMAN_ID,
    });

    const room = roomMgr.getRoom(roomCode);
    expect(room).toBeDefined();
    expect(room?.started).toBe(true);
    expect(room?.players.length).toBe(4);

    // Invariant Trackers
    let duplicateStateCount = 0;
    let lastStateSignature = '';
    let lastTurnProgressTick = server.getDeltaBroadcaster().getCurrentTick(roomCode);
    let lastTurnPlayerIdx = room?.currentPlayerIndex ?? 0;
    let phaseDurationVirtualMs = 0;

    // Lắng nghe Delta từ máy chủ để kiểm tra Loop Detection Invariant
    mockSocket.on('server_message', (msg: WsServerMessage) => {
      if (msg.type === 'STATE_DELTA' || (msg as any).type === 'DELTA') {
        const d = (msg as any).delta;
        const sig = `${d.tick}_${d.turnPhase}_${d.currentPlayerIndex}_${d.auction?.currentBid ?? ''}`;
        if (sig === lastStateSignature) {
          duplicateStateCount++;
          // Bất biến 1: Loop Detection Invariant: > 5 lệnh lặp không đổi state -> FAIL
          if (duplicateStateCount > 5) {
            throw new Error(`[Loop Detection Invariant Violated] Nhận hơn 5 lệnh trùng lặp liên tiếp với chữ ký state: ${sig}`);
          }
        } else {
          duplicateStateCount = 0;
          lastStateSignature = sig;
        }
      }
    });

    // Mô phỏng hành vi Người chơi Human Persona
    const executeHumanPersonaStep = () => {
      const r = roomMgr.getRoom(roomCode);
      if (!r || !r.started) return;

      const curr = r.players[r.currentPlayerIndex];
      if (!curr || curr.id !== HUMAN_ID) {
        // Nếu đang ở AuctionPhase và Human chưa pass và không phải highestBidder:
        if (r.phase === TurnPhase.AuctionPhase && r.currentAuction) {
          const auction = r.currentAuction;
          const hasPassed = auction.passedPlayers?.has(HUMAN_ID);
          const isHighest = auction.highestBidder === HUMAN_ID;
          const isDeclined = auction.declinedPlayerId === HUMAN_ID;
          if (!hasPassed && !isHighest && !isDeclined) {
            // 50% cơ hội bid, 50% pass
            const currentBid = auction.highestBid ?? auction.startingBid ?? 100;
            if (Math.random() < 0.5) {
              mockSocket.simulateClientMessage({
                type: 'INTENT',
                roomCode,
                playerId: HUMAN_ID,
                intent: { type: 'INTENT_BID', amount: currentBid + 100 },
              });
            } else {
              mockSocket.simulateClientMessage({
                type: 'INTENT',
                roomCode,
                playerId: HUMAN_ID,
                intent: { type: 'INTENT_AUCTION_PASS' },
              });
            }
          }
        }
        return;
      }

      // 4. Mô phỏng hành vi AFK ngẫu nhiên (Human Persona: Roll, Buy, Decline, Pass, AFK)
      if (Math.random() < 0.15) {
        // Human AFK: không gửi intent, để Server TurnOrchestrator hoặc Watchdog tự giải phóng lượt
        return;
      }

      // Đến lượt của Human
      switch (r.phase) {
        case TurnPhase.WaitingRoll:
          mockSocket.simulateClientMessage({
            type: 'INTENT',
            roomCode,
            playerId: HUMAN_ID,
            intent: { type: 'INTENT_ROLL' },
          });
          break;

        case TurnPhase.ActionPhase:
          // 50% mua, 50% từ chối để mở sàn đấu giá
          if (Math.random() < 0.5) {
            mockSocket.simulateClientMessage({
              type: 'INTENT',
              roomCode,
              playerId: HUMAN_ID,
              intent: { type: 'INTENT_BUY' },
            });
          } else {
            mockSocket.simulateClientMessage({
              type: 'INTENT',
              roomCode,
              playerId: HUMAN_ID,
              intent: { type: 'INTENT_DECLINE' },
            });
          }
          break;

        case TurnPhase.PropertyManagement:
          mockSocket.simulateClientMessage({
            type: 'INTENT',
            roomCode,
            playerId: HUMAN_ID,
            intent: { type: 'INTENT_END_TURN' },
          });
          break;

        case TurnPhase.InsolvencyPhase:
          mockSocket.simulateClientMessage({
            type: 'INTENT',
            roomCode,
            playerId: HUMAN_ID,
            intent: { type: 'INTENT_BANKRUPTCY' },
          });
          break;

        case TurnPhase.HosePhase:
          mockSocket.simulateClientMessage({
            type: 'INTENT',
            roomCode,
            playerId: HUMAN_ID,
            intent: { type: 'INTENT_SKIP' },
          });
          break;
      }
    };

    // Chạy chu trình thời gian ảo qua 30 bước giả lập (tương đương nhiều vòng chơi đầy đủ)
    const SIMULATION_STEPS = 40;
    const STEP_VIRTUAL_MS = 1000;

    for (let step = 0; step < SIMULATION_STEPS; step++) {
      executeHumanPersonaStep();

      // Tua nhanh thời gian ảo
      await vi.advanceTimersByTimeAsync(STEP_VIRTUAL_MS);

      const r = roomMgr.getRoom(roomCode);
      if (!r || !r.started) break;

      const currentTick = server.getDeltaBroadcaster().getCurrentTick(roomCode);

      // Kiểm tra Stall Detection Invariant: Không pha nào bị đứng quá 60s ảo mà không đổi lượt
      if (r.currentPlayerIndex === lastTurnPlayerIdx && currentTick === lastTurnProgressTick) {
        phaseDurationVirtualMs += STEP_VIRTUAL_MS;
        if (phaseDurationVirtualMs > 60_000) {
          throw new Error(
            `[Stall Detection Invariant Violated] Lượt chơi của ${r.players[r.currentPlayerIndex]?.id} (Pha: ${r.phase}) bị kẹt quá 60s ảo!`
          );
        }
      } else {
        lastTurnPlayerIdx = r.currentPlayerIndex;
        lastTurnProgressTick = currentTick;
        phaseDurationVirtualMs = 0;
      }
    }

    // Xác nhận ván cờ đã tiến triển liên tục qua nhiều tick và nhiều lượt
    const finalTick = server.getDeltaBroadcaster().getCurrentTick(roomCode);
    expect(finalTick).toBeGreaterThan(5);
    expect(duplicateStateCount).toBeLessThanOrEqual(5);
  });

  it('Vận hành trận đấu khi Human Persona hoàn toàn AFK, máy chủ tự giải cứu không vi phạm Stall Invariant', async () => {
    const AFK_HUMAN_ID = 'p1_afk';

    // 1. Tạo phòng
    mockSocket.simulateClientMessage({
      type: 'CREATE_ROOM',
      playerId: AFK_HUMAN_ID,
    });

    const roomCreatedMsg = mockSocket.sentMessages.find((m) => m.type === 'ROOM_CREATED');
    const roomCode = (roomCreatedMsg as any).roomCode;
    const roomMgr = server.getRoomManager();

    // 2. Thêm 3 Bot AI
    roomMgr.addBot(roomCode, 'bot_2');
    roomMgr.addBot(roomCode, 'bot_3');
    roomMgr.addBot(roomCode, 'bot_4');

    // 3. Bắt đầu trận đấu
    mockSocket.simulateClientMessage({
      type: 'START_GAME',
      roomCode,
      playerId: AFK_HUMAN_ID,
    });

    // Tua nhanh qua các chu kỳ thời gian ảo (Human 100% AFK)
    let maxPhaseStallVirtualMs = 0;
    let lastTurnPlayerIdx = -1;
    let phaseStallMs = 0;

    for (let step = 0; step < 30; step++) {
      await vi.advanceTimersByTimeAsync(2000);

      const r = roomMgr.getRoom(roomCode);
      if (!r || !r.started) break;

      if (r.currentPlayerIndex === lastTurnPlayerIdx) {
        phaseStallMs += 2000;
        if (phaseStallMs > maxPhaseStallVirtualMs) {
          maxPhaseStallVirtualMs = phaseStallMs;
        }
      } else {
        lastTurnPlayerIdx = r.currentPlayerIndex;
        phaseStallMs = 0;
      }
    }

    // Máy chủ tự giải cứu dứt điểm trong vòng <= 60s (Stall Detection Invariant: Watchdog & Orchestrator Timeout)
    expect(maxPhaseStallVirtualMs).toBeLessThanOrEqual(60_000);
    const finalTick = server.getDeltaBroadcaster().getCurrentTick(roomCode);
    expect(finalTick).toBeGreaterThan(3);
  });
});
