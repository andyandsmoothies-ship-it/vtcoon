import { describe, it, expect, vi } from 'vitest';
import { TurnTimeoutScheduler } from '../../src/server/network/turn_timeout_scheduler.js';
import { BotTurnScheduler } from '../../src/server/network/bot_turn_scheduler.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase } from '../../src/domain/room.js';
import { WssServer } from '../../src/server/network/wss_server.js';

describe('[TC-AUCTION-RECURSION] Bất biến phi đệ quy khi chuyển sang TurnPhase.AuctionPhase', () => {
  it('[Facet 1: Recursion Freedom] scheduleTurnTimeout không gây ra Maximum call stack size exceeded khi vào AuctionPhase có Bot', () => {
    const rooms = new RoomManager(1234);
    const room = rooms.createRoom('p1');
    rooms.addBot(room.roomCode, 'bot_2');
    rooms.startGame(room.roomCode);

    const intentMutex: any = { runExclusive: (_rc: any, fn: any) => fn() };
    const broadcaster: any = { broadcastRoomDelta: vi.fn(), setTimeRemainingProvider: vi.fn() };

    let turnTimeoutScheduler: TurnTimeoutScheduler;
    const botScheduler = new BotTurnScheduler({
      rooms,
      intentMutex,
      broadcaster,
      onGameOver: vi.fn(),
      onScheduleTurnTimeout: (rc) => turnTimeoutScheduler.scheduleTurnTimeout(rc),
      botTurnDelayMs: 10,
    });

    turnTimeoutScheduler = new TurnTimeoutScheduler({
      rooms,
      intentMutex,
      broadcaster,
      onGameOver: vi.fn(),
      onScheduleBotTurn: (rc) => botScheduler.scheduleBotTurn(rc),
    });

    room.players[0]!.position = 1;
    room.phase = TurnPhase.ActionPhase;
    rooms.handleDecline(room.roomCode, 'p1');
    expect(room.phase).toBe(TurnPhase.AuctionPhase);

    expect(() => {
      turnTimeoutScheduler.scheduleTurnTimeout(room.roomCode);
    }).not.toThrow();
  });

  it('[Facet 2: WssServer Integration] WssServer turnTimeoutScheduler không đệ quy vô hạn khi vào AuctionPhase', () => {
    const server = new WssServer({ port: 0 }); // ephemeral port
    try {
      const roomMgr = server.getRoomManager();
      const room = roomMgr.createRoom('p1');
      roomMgr.addBot(room.roomCode, 'bot_2');
      roomMgr.startGame(room.roomCode);

      // P1 di chuyển đến ô 1 (BĐS) và từ chối mua -> mở Auction
      room.players[0]!.position = 1;
      room.phase = TurnPhase.ActionPhase;
      roomMgr.handleDecline(room.roomCode, 'p1');
      expect(room.phase).toBe(TurnPhase.AuctionPhase);

      // TimeoutScheduler của WssServer chạy scheduleTurnTimeout không bị văng RangeError
      expect(() => {
        (server as any).turnTimeoutScheduler.scheduleTurnTimeout(room.roomCode);
      }).not.toThrow();
    } finally {
      server.close();
    }
  });
});
