// [UC-GAME-008/MSS][UAT-44] Turn Timeout Scheduler Unit & Integration Tests
import { describe, it, expect, vi } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { IntentMutex } from '../../src/server/network/intent_mutex';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster';
import { SessionManager } from '../../src/server/session_manager';
import { TurnTimeoutScheduler, PHASE_TIMEOUTS_MS } from '../../src/server/network/turn_timeout_scheduler';
import { TurnPhase } from '../../src/domain/room';

function setup(timeoutMs = 50) {
  const rooms = new RoomManager();
  const sessions = new SessionManager();
  const intentMutex = new IntentMutex();
  const broadcastCalls: any[] = [];
  const broadcaster = new DeltaBroadcaster(rooms, sessions, (rc, msg) => {
    broadcastCalls.push({ rc, msg });
  });

  const botTurnsScheduled: string[] = [];
  const gamesOver: string[] = [];

  const scheduler = new TurnTimeoutScheduler({
    rooms,
    intentMutex,
    broadcaster,
    defaultTimeoutMs: timeoutMs,
    onGameOver: (rc) => gamesOver.push(rc),
    onScheduleBotTurn: (rc) => botTurnsScheduled.push(rc),
  });

  const room = rooms.createRoom('p1');
  rooms.joinRoom(room.roomCode, 'p2');
  rooms.startGame(room.roomCode);

  return { rooms, scheduler, room, botTurnsScheduled, gamesOver, broadcastCalls };
}

describe('[Server][UAT-44] TurnTimeoutScheduler', () => {
  it('Khi human player ở PropertyManagement mà AFK hết thời gian, Server tự động chuyển sang lượt tiếp theo', async () => {
    const { rooms, scheduler, room, broadcastCalls } = setup(30);
    const p1 = room.players[0]!;
    room.phase = TurnPhase.PropertyManagement;

    scheduler.scheduleTurnTimeout(room.roomCode, 30);

    // Cho timeout kích hoạt voi retry vi.waitFor tranh race condition duoi CPU load cao
    await vi.waitFor(() => {
      expect(room.currentPlayerIndex).toBe(1);
      expect(room.phase).toBe(TurnPhase.WaitingRoll);
    }, { timeout: 500 });
    expect(broadcastCalls.length).toBeGreaterThan(0);
  });

  it('Khi human player ở WaitingRoll mà AFK, Server tự động đổ xúc xắc và giải phóng lượt', async () => {
    const { rooms, scheduler, room } = setup(30);
    expect(room.currentPlayerIndex).toBe(0);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);

    scheduler.scheduleTurnTimeout(room.roomCode, 30);

    await vi.waitFor(() => {
      expect(room.currentPlayerIndex === 1 || room.phase !== TurnPhase.WaitingRoll).toBe(true);
    }, { timeout: 500 });
  });

  it('Nếu người chơi kịp thao tác trước khi hết thời gian, clearTimeout hủy bỏ timer', async () => {
    const { rooms, scheduler, room } = setup(50);
    room.phase = TurnPhase.PropertyManagement;

    scheduler.scheduleTurnTimeout(room.roomCode, 50);

    // Người chơi bấm kết thúc lượt ở ms 10
    rooms.handleEndTurn(room.roomCode, 'p1');
    scheduler.clearTimeout(room.roomCode);

    expect(room.currentPlayerIndex).toBe(1);

    // Chờ qua mốc 70ms, đảm bảo không bị double turn transition
    await new Promise((resolve) => setTimeout(resolve, 70));
    expect(room.currentPlayerIndex).toBe(1);
  });

  it('[EC-04] Cấu hình PHASE_TIMEOUTS_MS khớp 100% đặc tả thiết kế phân đoạn vi pha', () => {
    expect(PHASE_TIMEOUTS_MS[TurnPhase.WaitingRoll]).toBe(15_000);
    expect(PHASE_TIMEOUTS_MS[TurnPhase.ActionPhase]).toBe(20_000);
    expect(PHASE_TIMEOUTS_MS[TurnPhase.AuctionPhase]).toBe(15_000);
    expect(PHASE_TIMEOUTS_MS[TurnPhase.PropertyManagement]).toBe(20_000);
    expect(PHASE_TIMEOUTS_MS[TurnPhase.InsolvencyPhase]).toBe(25_000);
    expect(PHASE_TIMEOUTS_MS[TurnPhase.HosePhase]).toBe(15_000);
  });

  it('[EC-04] getTimeRemaining trả về số giây còn lại chính xác và về 0 khi clearTimeout', () => {
    const { scheduler, room } = setup(5000);
    scheduler.scheduleTurnTimeout(room.roomCode, 5000);

    const remaining = scheduler.getTimeRemaining(room.roomCode);
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(5);

    scheduler.clearTimeout(room.roomCode);
    expect(scheduler.getTimeRemaining(room.roomCode)).toBe(0);
  });

  it('[EC-04] Khi human player AFK ở InsolvencyPhase, Server tự động tuyên bố phá sản', async () => {
    const { rooms, scheduler, room } = setup(30);
    room.phase = TurnPhase.InsolvencyPhase;
    room.players[0]!.balance = -1000;

    scheduler.scheduleTurnTimeout(room.roomCode, 30);
    await new Promise((resolve) => setTimeout(resolve, 60));

    expect(room.players[0]!.bankrupt).toBe(true);
  });

  it('[EC-04] Khi human player AFK ở ActionPhase, Server tự động từ chối mua và kích hoạt đấu giá', async () => {
    const { rooms, scheduler, room } = setup(30);
    room.phase = TurnPhase.ActionPhase;
    room.players[0]!.position = 1; // Ô 1 là đất mua được

    scheduler.scheduleTurnTimeout(room.roomCode, 30);
    await new Promise((resolve) => setTimeout(resolve, 60));

    // Server đã xử lý decline, phòng chuyển sang AuctionPhase hoặc kết thúc lượt
    const currentPhase = rooms.getRoom(room.roomCode)?.phase;
    expect(currentPhase === TurnPhase.AuctionPhase || room.currentPlayerIndex === 1).toBe(true);
  });

  it('[EC-04] DeltaBroadcaster truyền timeRemaining và turnPhase qua State Delta', () => {
    const { rooms, scheduler, room } = setup(5000);
    scheduler.scheduleTurnTimeout(room.roomCode, 5000);

    const sessions = new SessionManager();
    const broadcaster = new DeltaBroadcaster(rooms, sessions);
    broadcaster.setTimeRemainingProvider((rc) => scheduler.getTimeRemaining(rc));

    const result = broadcaster.broadcastRoomDelta(room.roomCode);
    expect(result).toBeDefined();
    expect(result?.delta.turnPhase).toBe(TurnPhase.WaitingRoll);
    expect(result?.delta.timeRemaining).toBeGreaterThan(0);
  });
});
