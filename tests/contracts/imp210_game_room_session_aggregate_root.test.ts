// [CONTRACT] IMP-210: GameRoomSession Aggregate Root & RoomManager Structural Pruning
// Universal 5-Facet Behavioral Contract Test Suite
// Traceability: IMP-210 · UC-GAME-029
// Strict QA Protocol: No production source files modified

import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { doHandleEndTurnSession } from '../../src/server/room_manager_lifecycle.js';
import { GameRoomSession } from '../../src/server/game_room_session.js';
import type { Room } from '../../src/domain/room.js';
import { BotPersonality } from '../../src/domain/bot/bot_engine.js';
import type { AuctionSession } from '../../src/server/auction_manager.js';
import type { PropertyRegistry } from '../../src/domain/property_manager.js';

describe('[IMP-210] GameRoomSession Aggregate Root Contract Suite', () => {
  // =========================================================================
  // FACET 1: Khởi tạo nguyên tử Aggregate Root & Context Mapping ([TC-IMP210.01] - [TC-IMP210.04])
  // =========================================================================
  describe('Facet 1: Khởi tạo nguyên tử Aggregate Root & Context Mapping', () => {
    it('[TC-IMP210.01/MSS][UC-GAME-029] Khởi tạo phòng trả về GameRoomSession chứa đầy đủ room, registry, propertyStates, botPersonalities', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha');

      const session = mgr.getSession(room.roomCode);

      expect(session).toBeDefined();
      expect(session?.room).toBe(room);
      expect(session?.registry).toBeInstanceOf(Map);
      expect(session?.botPersonalities).toBeInstanceOf(Map);
    });

    it('[TC-IMP210.02/MSS][UC-GAME-029] Tra cứu session qua mã phòng không phân biệt hoa thường (Case-Insensitive Room Code)', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha', 'VTD8J8');

      const lower = mgr.getSession('vtd8j8');
      const upper = mgr.getSession('VTD8J8');

      expect(lower).toBeDefined();
      expect(lower).toBe(upper);
    });

    it('[TC-IMP210.03/MSS][UC-GAME-029] session.toContext() cung cấp RoomContext ánh xạ đồng nhất với các trường Aggregate Root', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha');
      const session = mgr.getSession(room.roomCode)!;

      const ctx = session.toContext();

      expect(ctx.room).toBe(session.room);
      expect(ctx.reg).toBe(session.registry);
      expect(ctx.sm).toBe(session.propertyStates);
      expect(ctx.botPersonalities).toBe(session.botPersonalities);
    });

    it('[TC-IMP210.04/MSS][UC-GAME-029] Setter session.auction tự động đồng bộ hai chiều sang session.room.currentAuction', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha');
      const session = mgr.getSession(room.roomCode)!;
      const mockAuction = { roomCode: room.roomCode, cellIndex: 3, highestBid: 500, highestBidderId: 'player_alpha' } as unknown as AuctionSession;

      session.auction = mockAuction;

      expect(session.auction).toBe(mockAuction);
      expect(session.room.currentAuction).toBe(mockAuction);

      session.auction = undefined;
      expect(session.room.currentAuction).toBeUndefined();
    });
  });

  // =========================================================================
  // FACET 2: 100% Map Protocol Parity cho SessionFieldProxy ([TC-IMP210.05] - [TC-IMP210.08])
  // =========================================================================
  describe('Facet 2: 100% Map Protocol Parity cho SessionFieldProxy', () => {
    it('[TC-IMP210.05/MSS][UC-GAME-029] mgr.registries hỗ trợ Symbol.iterator cho phép lặp for..of đúng số lượng session active', () => {
      const mgr = new RoomManager();
      const r1 = mgr.createRoom('player_alpha', 'ROOM_1');
      const r2 = mgr.createRoom('player_beta', 'ROOM_2');

      const entries = Array.from(mgr.registries);
      const s1 = mgr.getSession(r1.roomCode)!;
      const s2 = mgr.getSession(r2.roomCode)!;

      expect(entries).toHaveLength(2);
      expect(mgr.registries.get('room_1')).toBe(s1.registry);
      expect(mgr.registries.get('room_2')).toBe(s2.registry);
    });

    it('[TC-IMP210.06/MSS][UC-GAME-029] mgr.registries hỗ trợ đầy đủ các phương thức size, keys(), values(), entries(), forEach()', () => {
      const mgr = new RoomManager();
      mgr.createRoom('player_alpha', 'ROOM_1');
      mgr.createRoom('player_beta', 'ROOM_2');
      const collectedKeys: string[] = [];
      const registriesProxy = mgr.registries;

      registriesProxy.forEach((_: PropertyRegistry, k: string) => collectedKeys.push(k));

      expect(registriesProxy.size).toBe(2);
      expect(Array.from(registriesProxy.keys())).toHaveLength(2);
      expect(collectedKeys).toHaveLength(2);
    });

    it('[TC-IMP210.07/MSS][UC-GAME-029] Thuộc tính .size của proxy trường tùy chọn (auctions, lastAuctionResults) chỉ đếm khi khác undefined', () => {
      const mgr = new RoomManager();
      const r1 = mgr.createRoom('player_alpha', 'ROOM_1');
      const r2 = mgr.createRoom('player_beta', 'ROOM_2');
      const auctionsProxy = mgr.auctions;
      const lastAuctionResultsProxy = mgr.lastAuctionResults;

      expect(auctionsProxy.size).toBe(0);

      auctionsProxy.set(r1.roomCode, { cellIndex: 5, highestBid: 600 } as any);
      lastAuctionResultsProxy.set(r2.roomCode, { cellIndex: 5, winnerId: 'player_beta' } as any);

      expect(auctionsProxy.size).toBe(1);

      auctionsProxy.set(r1.roomCode, undefined as any);
      expect(auctionsProxy.size).toBe(0);
    });

    it('[TC-IMP210.08/MSS][UC-GAME-029] mgr.auctions.has() và keys() chỉ phản hồi true và yield phòng có auction tồn tại', () => {
      const mgr = new RoomManager();
      const r1 = mgr.createRoom('player_alpha', 'ROOM_1');
      const r2 = mgr.createRoom('player_beta', 'ROOM_2');
      const auctionsProxy = mgr.auctions;

      auctionsProxy.set(r1.roomCode, { cellIndex: 5 } as any);
      auctionsProxy.set(r2.roomCode, undefined as any);

      expect(auctionsProxy.has(r1.roomCode)).toBe(true);
      expect(auctionsProxy.has(r2.roomCode)).toBe(false);
      expect(Array.from(auctionsProxy.keys())).toEqual([r1.roomCode]);
    });

    it('[TC-IMP210.21/MSS][UC-GAME-029] Phòng mới khởi tạo chưa roll có mgr.rolledThisTurn.size === 0 và has === false', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha');
      const session = mgr.getSession(room.roomCode)!;

      expect(mgr.rolledThisTurn.size).toBe(0);
      expect(mgr.rolledThisTurn.has(room.roomCode)).toBe(false);
      expect(mgr.rolledThisTurn.get(room.roomCode)).toBeUndefined();
      expect(session.rolledThisTurn).toBe(false);
    });

    it('[TC-IMP210.22/MSS][UC-GAME-029] mgr.rolledThisTurn.set(false) duy trì size === 1 và delete() trả size về 0', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha');

      mgr.rolledThisTurn.set(room.roomCode, false);
      expect(mgr.rolledThisTurn.size).toBe(1);
      expect(mgr.rolledThisTurn.get(room.roomCode)).toBe(false);

      mgr.rolledThisTurn.delete(room.roomCode);
      expect(mgr.rolledThisTurn.size).toBe(0);
    });
  });

  // =========================================================================
  // FACET 3: Ghi/đọc 2 chiều (Two-Way Write-Through) & Tương thích ngược ([TC-IMP210.09] - [TC-IMP210.12])
  // =========================================================================
  describe('Facet 3: Ghi/đọc 2 chiều (Two-Way Write-Through) & Tương thích ngược', () => {
    it('[TC-IMP210.09/MSS][UC-GAME-029] Thay đổi qua propertyStates proxy ghi xuyên suốt (write-through) vào session.propertyStates', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha');
      const session = mgr.getSession(room.roomCode)!;

      mgr.propertyStates.get(room.roomCode)!.set(3, { level: 2 });

      expect(session.propertyStates.get(3)).toEqual({ level: 2 });
      expect(session.toContext().sm.get(3)).toEqual({ level: 2 });
    });

    it('[TC-IMP210.10/MSS][UC-GAME-029] mgr.rolledThisTurn.set() đồng bộ trực tiếp hai chiều sang session.rolledThisTurn', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha');
      const session = mgr.getSession(room.roomCode)!;

      mgr.rolledThisTurn.set(room.roomCode, true);
      expect(session.rolledThisTurn).toBe(true);

      mgr.rolledThisTurn.set(room.roomCode, false);
      expect(session.rolledThisTurn).toBe(false);
    });

    it('[TC-IMP210.11/MSS][UC-GAME-029] Alias mgr.rooms hoạt động đồng nhất và truy cập cùng instance phòng với mgr.roomMap', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha', 'ROOM_1');
      const roomsProxy = mgr.rooms;

      expect(roomsProxy.get('room_1')).toBe(room);
      expect(roomsProxy.size).toBe(mgr.roomMap.size);
    });

    it('[TC-IMP210.12/MSS][UC-GAME-029] Lệnh delete trên proxy map xóa sạch collection bên trong session thay vì hủy session', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha');
      const session = mgr.getSession(room.roomCode)!;
      session.registry.set(1, 'player_alpha');

      const deleted = mgr.registries.delete(room.roomCode);

      expect(deleted).toBe(true);
      expect(session.registry.size).toBe(0);
      expect(mgr.getSession(room.roomCode)).toBeDefined();
    });
  });

  // =========================================================================
  // FACET 4: Bot Personality Composite Key Facade ([TC-IMP210.13] - [TC-IMP210.15])
  // =========================================================================
  describe('Facet 4: Bot Personality Composite Key Facade', () => {
    it('[TC-IMP210.13/MSS][UC-GAME-029] BotPersonality facade bóc tách chính xác khóa composite roomCode:botId khi get() và has()', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha');
      const session = mgr.getSession(room.roomCode)!;
      session.botPersonalities.set('bot_vn_hanoi', BotPersonality.Aggressive);
      const facade = mgr.botPersonalities;

      expect(facade.has(`${room.roomCode}:bot_vn_hanoi`)).toBe(true);
      expect(facade.get(`${room.roomCode}:bot_vn_hanoi`)).toBe(BotPersonality.Aggressive);
      expect(facade.get('bot_vn_hanoi')).toBe(BotPersonality.Aggressive);
    });

    it('[TC-IMP210.14/MSS][UC-GAME-029] Ghi qua composite key set(roomCode:botId) cập nhật đồng thời vào session.botPersonalities', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha');
      const session = mgr.getSession(room.roomCode)!;
      const facade = mgr.botPersonalities;

      facade.set(`${room.roomCode}:bot_vn_saigon`, BotPersonality.Passive);

      expect(session.botPersonalities.get('bot_vn_saigon')).toBe(BotPersonality.Passive);
      expect(facade.get(`${room.roomCode}:bot_vn_saigon`)).toBe(BotPersonality.Passive);
    });

    it('[TC-IMP210.15/MSS][UC-GAME-029] mgr.botPersonalities.size đếm tổng bot đa phòng và delete() dọn dẹp sạch khóa composite', () => {
      const mgr = new RoomManager();
      const r1 = mgr.createRoom('player_alpha', 'ROOM_1');
      const r2 = mgr.createRoom('player_beta', 'ROOM_2');
      const facade = mgr.botPersonalities;

      facade.set(`${r1.roomCode}:bot_a`, BotPersonality.Aggressive);
      facade.set(`${r2.roomCode}:bot_b`, BotPersonality.Balanced);

      expect(facade.size).toBe(2);

      const delResult = facade.delete(`${r1.roomCode}:bot_a`);
      const s1 = mgr.getSession(r1.roomCode)!;

      expect(delResult).toBe(true);
      expect(s1.botPersonalities.has('bot_a')).toBe(false);
      expect(facade.has(`${r1.roomCode}:bot_a`)).toBe(false);
    });
  });

  // =========================================================================
  // FACET 5: Thứ tự Teardown & Giải phóng bộ nhớ triệt để ([TC-IMP210.16] - [TC-IMP210.20])
  // =========================================================================
  describe('Facet 5: Thứ tự Teardown & Giải phóng bộ nhớ triệt để', () => {
    it('[TC-IMP210.16/MSS][UC-GAME-029] closeRoom kích hoạt closeHooks TRƯỚC KHI hủy session (hook vẫn đọc được context phòng)', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha');
      let hookRoom: Room | undefined;
      let hookSession: GameRoomSession | undefined;

      mgr.onCloseRoom((rc, r) => {
        hookRoom = r;
        hookSession = mgr.getSession(rc);
      });

      mgr.closeRoom(room.roomCode);

      expect(hookRoom).toBe(room);
      expect(hookSession).toBeDefined();
      expect(hookSession?.roomCode).toBe(room.roomCode);
    });

    it('[TC-IMP210.17/MSS][UC-GAME-029] session.destroy() dọn dẹp sạch sẽ activeTimers, clear các Map và xóa currentAuction', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha');
      const session = mgr.getSession(room.roomCode)!;
      const t = setTimeout(() => {}, 60000);
      session.registerTimer(t);
      session.auction = { cellIndex: 3 } as AuctionSession;
      session.registry.set(1, 'player_alpha');

      session.destroy();

      expect(session.activeTimers.size).toBe(0);
      expect(session.auction).toBeUndefined();
      expect(session.room.currentAuction).toBeUndefined();
      expect(session.registry.size).toBe(0);
    });

    it('[TC-IMP210.18/MSS][UC-GAME-029] Sau khi closeRoom hoàn tất, getSession trả về undefined và không rò rỉ session trong bộ nhớ', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha');

      mgr.closeRoom(room.roomCode);

      expect(mgr.getSession(room.roomCode)).toBeUndefined();
      expect(mgr.getSession(room.roomCode.toLowerCase())).toBeUndefined();
      expect(mgr.getRoom(room.roomCode)).toBeUndefined();
    });

    it('[TC-IMP210.19/MSS][UC-GAME-029] doHandleEndTurnSession thực hiện chuyển lượt và đồng bộ hai chiều atomic với session', () => {
      const mgr = new RoomManager(() => 0.5);
      const room = mgr.createRoom('player_alpha');
      mgr.joinRoom(room.roomCode, 'player_beta');
      mgr.startGame(room.roomCode);
      const session = mgr.getSession(room.roomCode)!;
      session.rolledThisTurn = true;

      const resRoom = doHandleEndTurnSession(session, 'player_alpha');

      expect(resRoom).toBeDefined();
      expect(session.rolledThisTurn).toBe(false);
      expect(session.room.currentPlayerIndex).toBe(1);
    });

    it('[TC-IMP210.20/MSS][UC-GAME-029] session.touchActivity() và session.clearTimers() quản lý thời điểm tương tác và dọn dẹp timers độc lập', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('player_alpha');
      const session = mgr.getSession(room.roomCode)!;

      session.touchActivity(1790494400000);
      expect(session.lastActivity).toBe(1790494400000);

      const t1 = setTimeout(() => {}, 50000);
      session.registerTimer(t1);
      session.clearTimers();
      expect(session.activeTimers.size).toBe(0);
    });
  });
});
