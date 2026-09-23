// [UC-GAME-028/MSS][IMP-155] Station 1 Contract Tests: Bot Auction Pacing & Transparency Banner
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase, type Room } from '../../src/domain/room.js';
import { PROPERTY_DEEDS } from '../../src/domain/property_manager.js';
import { buildDeltaFromRoom, type AuctionPayload } from '../../src/server/session_manager.js';
import { TurnOrchestrator } from '../../src/server/network/turn_orchestrator.js';
import { BotPersonality } from '../../src/domain/bot/bot_engine.js';

declare module '../../src/server/room_manager.js' {
  interface RoomManager {
    stepAuctionBot(roomCode: string): { changed: boolean; finished: boolean };
    getLastAuctionResult(roomCode: string): {
      winnerId: string | null;
      winningBid: number;
      finalPrice?: number;
      isForeclosure?: boolean;
      cellIndex?: number;
    } | undefined;
    clearLastAuctionResult(roomCode: string): void;
  }
}

declare module '../../src/domain/room.js' {
  interface Room {
    lastAuctionResult?: {
      winnerId: string | null;
      winningBid: number;
      finalPrice?: number;
      isForeclosure?: boolean;
      cellIndex?: number;
    } | null;
  }
}

declare module '../../src/server/session_manager.js' {
  interface AuctionPayload {
    isConcluded?: boolean;
    winnerId?: string | null;
    finalPrice?: number;
  }
}

describe('[TC-IMP155] Bot Action Pacing & Auction Transparency Contract Suite', () => {
  // ==========================================
  // FACET 1: BOUNDARY & RANGE
  // ==========================================

  it('[TC-IMP155.01/MSS][UC-GAME-028] (Boundary) Khởi điểm đấu giá bảo toàn chính xác 50% giá niêm yết BĐS', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    mgr.addBot(room.roomCode, 'bot_trader', BotPersonality.Aggressive);
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 39; // Tràng Tiền: giá gốc 4.000 Tr.
    room.phase = TurnPhase.ActionPhase;

    const deed = PROPERTY_DEEDS.get(39)!;
    const declineRes = mgr.handlePlayerIntent(room.roomCode, 'p1_human', { type: 'INTENT_DECLINE' });
    expect(declineRes.success).toBe(true);

    const session = mgr.getAuctionSession(room.roomCode);
    expect(session).toBeDefined();
    expect(session?.startingBid).toBe(Math.floor(deed.price * 0.50));
    expect(session?.highestBid).toBe(2000);
  });

  it('[TC-IMP155.06/MSS][UC-GAME-028] (Boundary) Khi bot cuối cùng pass, stepAuctionBot trả về finished: true', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    const bot = mgr.addBot(room.roomCode, 'bot_solo', BotPersonality.Passive)!;
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 3; // Hàng Than: giá 600, khởi điểm 300
    room.phase = TurnPhase.ActionPhase;
    bot.balance = 0; // Bot không đủ tiền tham gia, buộc phải Pass

    mgr.handlePlayerIntent(room.roomCode, 'p1_human', { type: 'INTENT_DECLINE' });
    const stepRes = mgr.stepAuctionBot(room.roomCode);

    expect(stepRes.finished).toBe(true);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('[TC-IMP155.07/MSS][UC-GAME-028] (Boundary) roomManager lưu giữ kết quả lastAuctionResult sau khi phiên đấu giá kết thúc thành công', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    mgr.joinRoom(room.roomCode, 'bot_winner');
    mgr.joinRoom(room.roomCode, 'bot_loser');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 3; // Giá 600
    room.phase = TurnPhase.ActionPhase;
    mgr.handlePlayerIntent(room.roomCode, 'p1_human', { type: 'INTENT_DECLINE' });

    mgr.handleAuctionBid(room.roomCode, 'bot_winner', 400);
    mgr.handleAuctionPass(room.roomCode, 'bot_loser');

    const lastResult = mgr.getLastAuctionResult(room.roomCode);
    expect(lastResult).toBeDefined();
    expect(lastResult?.winnerId).toBe('bot_winner');
    expect(lastResult?.winningBid).toBe(400);
  });

  it('[TC-IMP155.10/MSS][UC-GAME-028] (Boundary) Toàn bộ người chơi cùng Pass (Zero-Bid Foreclosure), lastAuctionResult ghi nhận isForeclosure: true và winnerId: null', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    mgr.joinRoom(room.roomCode, 'bot_alpha');
    mgr.joinRoom(room.roomCode, 'bot_beta');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 39; // Tràng Tiền 4000
    room.phase = TurnPhase.ActionPhase;
    mgr.handlePlayerIntent(room.roomCode, 'p1_human', { type: 'INTENT_DECLINE' });

    mgr.handleAuctionPass(room.roomCode, 'bot_alpha');
    mgr.handleAuctionPass(room.roomCode, 'bot_beta');

    const lastResult = mgr.getLastAuctionResult(room.roomCode);
    expect(lastResult).toBeDefined();
    expect(lastResult?.isForeclosure).toBe(true);
    expect(lastResult?.winnerId).toBeNull();
  });

  it('[TC-IMP155.11/MSS][UC-GAME-028] (Boundary) buildDeltaFromRoom cho phiên đấu giá bất thành sinh ra delta.auction với isConcluded: true, isForeclosure: true, winnerId: null', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    room.phase = TurnPhase.PropertyManagement;
    room.lastAuctionResult = {
      cellIndex: 39,
      winnerId: null,
      winningBid: 0,
      finalPrice: 0,
      isForeclosure: true,
    };

    const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1, new Map());
    expect(delta.auction).not.toBeNull();
    expect(delta.auction?.isConcluded).toBe(true);
    expect(delta.auction?.isForeclosure).toBe(true);
    expect(delta.auction?.winnerId).toBeNull();
  });

  it('[TC-IMP155.15/MSS][UC-GAME-028] (Boundary) AuctionPayload contract hỗ trợ đầy đủ isConcluded, winnerId, finalPrice', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    room.phase = TurnPhase.PropertyManagement;
    room.lastAuctionResult = {
      cellIndex: 1,
      winnerId: 'bot_champion',
      winningBid: 550,
      finalPrice: 550,
      isForeclosure: false,
    };

    const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1, new Map());
    const auction = delta.auction as AuctionPayload | null;
    expect(auction?.isConcluded).toBe(true);
    expect(auction?.winnerId).toBe('bot_champion');
    expect(auction?.finalPrice).toBe(550);
  });

  // ==========================================
  // FACET 2: STATE REACTIVITY
  // ==========================================

  it('[TC-IMP155.02/MSS][UC-GAME-028] (Reactivity) Phương thức roomManager.stepAuctionBot tồn tại và trả về { changed: boolean, finished: boolean } cho duy nhất 1 bot', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    mgr.addBot(room.roomCode, 'bot_alpha', BotPersonality.Aggressive);
    mgr.addBot(room.roomCode, 'bot_beta', BotPersonality.Balanced);
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 3;
    room.phase = TurnPhase.ActionPhase;
    mgr.handlePlayerIntent(room.roomCode, 'p1_human', { type: 'INTENT_DECLINE' });

    const stepRes = mgr.stepAuctionBot(room.roomCode);
    expect(stepRes).toBeDefined();
    expect(typeof stepRes.changed).toBe('boolean');
    expect(typeof stepRes.finished).toBe('boolean');
  });

  it('[TC-IMP155.03/MSS][UC-GAME-028] (Reactivity) stepAuctionBot trên phòng có 3 bot cạnh tranh không giải quyết hết toàn bộ phiên đấu giá trong 1 nhịp duy nhất', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    mgr.addBot(room.roomCode, 'bot_1', BotPersonality.Aggressive);
    mgr.addBot(room.roomCode, 'bot_2', BotPersonality.Aggressive);
    mgr.addBot(room.roomCode, 'bot_3', BotPersonality.Balanced);
    mgr.startGame(room.roomCode);

    for (let i = 1; i <= 3; i++) {
      room.players[i]!.balance = 20_000;
    }

    room.players[0]!.position = 3; // Giá 600
    room.phase = TurnPhase.ActionPhase;
    mgr.handlePlayerIntent(room.roomCode, 'p1_human', { type: 'INTENT_DECLINE' });

    const stepRes = mgr.stepAuctionBot(room.roomCode);
    expect(stepRes.finished).toBe(false);
    expect(room.phase).toBe(TurnPhase.AuctionPhase);
    expect(mgr.getAuctionSession(room.roomCode)).toBeDefined();
  });

  it('[TC-IMP155.04/MSS][UC-GAME-028] (Reactivity) Mỗi nhịp bid hợp lệ của bot tự động gia hạn session.endTime thêm 10.000ms, ngăn chặn AUCTION_EXPIRED', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    mgr.addBot(room.roomCode, 'bot_alpha', BotPersonality.Aggressive);
    mgr.addBot(room.roomCode, 'bot_beta', BotPersonality.Aggressive);
    mgr.startGame(room.roomCode);

    room.players[1]!.balance = 20_000;
    room.players[2]!.balance = 20_000;
    room.players[0]!.position = 3;
    room.phase = TurnPhase.ActionPhase;
    mgr.handlePlayerIntent(room.roomCode, 'p1_human', { type: 'INTENT_DECLINE' });

    const session = mgr.getAuctionSession(room.roomCode)!;
    const initialEndTime = Date.now() + 5000;
    session.endTime = initialEndTime;

    const stepRes = mgr.stepAuctionBot(room.roomCode);
    expect(stepRes.changed).toBe(true);
    expect(session.endTime).toBeGreaterThanOrEqual(initialEndTime + 10_000);
  });

  it('[TC-IMP155.05/MSS][UC-GAME-028] (Reactivity) Mỗi nhịp pass hợp lệ của bot cũng gia hạn session.endTime thêm 10.000ms', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    const botPoor = mgr.addBot(room.roomCode, 'bot_poor', BotPersonality.Passive)!;
    mgr.addBot(room.roomCode, 'bot_rich', BotPersonality.Aggressive);
    mgr.startGame(room.roomCode);

    botPoor.balance = 0; // Buộc phải Pass vì không đủ tiền
    room.players[0]!.position = 3;
    room.phase = TurnPhase.ActionPhase;
    mgr.handlePlayerIntent(room.roomCode, 'p1_human', { type: 'INTENT_DECLINE' });

    const session = mgr.getAuctionSession(room.roomCode)!;
    const initialEndTime = Date.now() + 5000;
    session.endTime = initialEndTime;

    const stepRes = mgr.stepAuctionBot(room.roomCode);
    expect(stepRes.changed).toBe(false);
    expect(session.endTime).toBeGreaterThanOrEqual(initialEndTime + 10_000);
  });

  it('[TC-IMP155.08/MSS][UC-GAME-028] (Reactivity) buildDeltaFromRoom sinh ra delta.auction mang isConcluded: true, winnerId, finalPrice khi vừa kết thúc phiên đấu giá', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    room.phase = TurnPhase.PropertyManagement;
    room.lastAuctionResult = {
      cellIndex: 3,
      winnerId: 'bot_alpha',
      winningBid: 450,
      finalPrice: 450,
      isForeclosure: false,
    };

    const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1, new Map());
    expect(delta.auction).not.toBeNull();
    expect(delta.auction?.isConcluded).toBe(true);
    expect(delta.auction?.winnerId).toBe('bot_alpha');
    expect(delta.auction?.finalPrice).toBe(450);
  });

  it('[TC-IMP155.14/MSS][UC-GAME-028] (Reactivity) TurnOrchestrator có hằng số AUCTION_SETTLE_DELAY_MS = 2500 để đệm trước khi chuyển lượt', () => {
    const delay = (TurnOrchestrator as unknown as { AUCTION_SETTLE_DELAY_MS?: number }).AUCTION_SETTLE_DELAY_MS;
    expect(delay).toBe(2500);
  });

  // ==========================================
  // FACET 3: RESOURCE DISPOSAL
  // ==========================================

  it('[TC-IMP155.09/MSS][UC-GAME-028] (Disposal) clearLastAuctionResult xóa kết quả để các delta sau đó có delta.auction === null', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    mgr.joinRoom(room.roomCode, 'bot_alpha');
    mgr.startGame(room.roomCode);

    room.phase = TurnPhase.PropertyManagement;
    room.lastAuctionResult = {
      cellIndex: 3,
      winnerId: 'bot_alpha',
      winningBid: 450,
      finalPrice: 450,
      isForeclosure: false,
    };

    mgr.clearLastAuctionResult(room.roomCode);
    const resultAfter = mgr.getLastAuctionResult(room.roomCode);
    const deltaAfter = mgr.createDelta(room.roomCode, 2);

    expect(resultAfter).toBeUndefined();
    expect(deltaAfter?.auction).toBeNull();
  });

  it('[TC-IMP155.16/MSS][UC-GAME-028] (Disposal) Khi phòng đóng (closeRoom), lastAuctionResult của phòng được giải phóng triệt để khỏi bộ nhớ', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    const roomCode = room.roomCode;
    mgr.joinRoom(roomCode, 'bot_alpha');
    mgr.startGame(roomCode);

    room.lastAuctionResult = {
      cellIndex: 3,
      winnerId: 'bot_alpha',
      winningBid: 400,
      finalPrice: 400,
    };

    mgr.closeRoom(roomCode);
    expect(mgr.hasRoom(roomCode)).toBe(false);
    expect(mgr.getLastAuctionResult(roomCode)).toBeUndefined();
  });

  // ==========================================
  // FACET 4: ERROR DEFENSE
  // ==========================================

  it('[TC-IMP155.12/MSS][UC-GAME-028] (Error Defense) stepAuctionBot trên phòng không ở TurnPhase.AuctionPhase trả về { changed: false, finished: true }', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    mgr.addBot(room.roomCode, 'bot_alpha', BotPersonality.Aggressive);
    mgr.startGame(room.roomCode);

    room.phase = TurnPhase.WaitingRoll; // Không phải AuctionPhase
    const stepRes = mgr.stepAuctionBot(room.roomCode);

    expect(stepRes.changed).toBe(false);
    expect(stepRes.finished).toBe(true);
  });

  it('[TC-IMP155.13/MSS][UC-GAME-028] (Error Defense) stepAuctionBot trên phòng không có bot nào hợp lệ trả về { changed: false, finished: false } khi người chơi thật chưa pass', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1_human');
    mgr.joinRoom(room.roomCode, 'p2_human'); // Chỉ toàn người chơi thật
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 3;
    room.phase = TurnPhase.ActionPhase;
    mgr.handlePlayerIntent(room.roomCode, 'p1_human', { type: 'INTENT_DECLINE' });

    const stepRes = mgr.stepAuctionBot(room.roomCode);
    expect(stepRes.changed).toBe(false);
    expect(stepRes.finished).toBe(false);
  });

  it('[TC-IMP155.17/MSS][UC-GAME-028] (Error Defense) stepAuctionBot với mã phòng không tồn tại trả về { changed: false, finished: true } an toàn', () => {
    const mgr = new RoomManager(42);
    const stepRes = mgr.stepAuctionBot('NON_EXISTENT_ROOM');

    expect(stepRes.changed).toBe(false);
    expect(stepRes.finished).toBe(true);
  });
});
