// [TC-05.8/MSS] [DEBT-05] Vertical Slice Completeness (VSC) test suite for DeltaPayload
import { describe, it, expect, beforeEach } from 'vitest';
import {
  SessionManager,
  buildDeltaPayload,
  type DeltaPayload,
  type CellDelta,
  type PlayerDelta,
} from '../../src/server/session_manager';

describe('[TC-05.8/MSS] DeltaPayload VSC 3D Synchronization', () => {
  let sessionMgr: SessionManager;

  beforeEach(() => {
    sessionMgr = new SessionManager();
    sessionMgr.addSession('player-session-1');
  });

  describe('[MSS] Thuộc tính chi tiết ô tài sản (level & isETC)', () => {
    it('[TC-05.8/MSS] lưu trữ và hoàn trả đầy đủ index, ownerId, level, isETC trong DeltaPayload', () => {
      const cell: CellDelta = {
        index: 1,
        ownerId: 'player-1',
        level: 2,
        isETC: true,
      };
      const delta: DeltaPayload = {
        tick: 10,
        cells: [cell],
      };

      sessionMgr.broadcastDelta(delta);
      const last = sessionMgr.getLastDelta();

      expect(last).toBeDefined();
      expect(last?.tick).toBe(10);
      expect(last?.cells).toHaveLength(1);
      expect(last?.cells[0]).toEqual({
        index: 1,
        ownerId: 'player-1',
        level: 2,
        isETC: true,
      });
      expect(last?.cells[0]?.level).toBe(2);
      expect(last?.cells[0]?.isETC).toBe(true);
    });
  });

  describe('[VSC] Vertical Slice Completeness - Bảo toàn cấu trúc dữ liệu', () => {
    it('[TC-05.8/VSC] bảo toàn 100% CellDelta và PlayerDelta qua broadcastDelta và getLastDelta', () => {
      const cells: CellDelta[] = [
        { index: 1, ownerId: 'p1', level: 0, isETC: false },
        { index: 3, ownerId: 'p1', level: 3, isETC: true },
        { index: 5, ownerId: 'p2', level: 1, isETC: false },
      ];
      const players: PlayerDelta[] = [
        { id: 'p1', position: 3, balance: 1500 },
        { id: 'p2', position: 5, balance: 2400 },
      ];
      const delta: DeltaPayload = {
        tick: 42,
        cells,
        players,
      };

      sessionMgr.broadcastDelta(delta);
      const last = sessionMgr.getLastDelta();

      expect(last).toBeDefined();
      expect(last?.cells).toEqual(cells);
      expect(last?.players).toEqual(players);
      expect(last?.cells[1]?.level).toBe(3);
      expect(last?.cells[1]?.isETC).toBe(true);
      expect(last?.players?.[0]?.balance).toBe(1500);
    });

    it('[TC-05.8/VSC] buildDeltaPayload hỗ trợ cả positional arguments và options object', () => {
      const cells: CellDelta[] = [
        { index: 6, ownerId: 'p1', level: 1, isETC: true },
      ];
      const players: PlayerDelta[] = [
        { id: 'p1', position: 6, balance: 1800 },
      ];

      // Kiểu 1: Positional arguments
      const payloadPositional = buildDeltaPayload(100, cells, players);
      expect(payloadPositional.tick).toBe(100);
      expect(payloadPositional.cells).toEqual(cells);
      expect(payloadPositional.players).toEqual(players);

      // Kiểu 2: Options object
      const payloadOptions = buildDeltaPayload({ tick: 200, cells, players });
      expect(payloadOptions.tick).toBe(200);
      expect(payloadOptions.cells).toEqual(cells);
      expect(payloadOptions.players).toEqual(players);

      // Kiểu 3: Omit players
      const payloadNoPlayers = buildDeltaPayload(300, cells);
      expect(payloadNoPlayers.players).toBeUndefined();
    });

    it('[TC-05.8/VSC] bảo vệ tham chiếu chống đột biến ngoại vi (reference immutability)', () => {
      const originalCells: CellDelta[] = [
        { index: 1, ownerId: 'p1', level: 1, isETC: false },
      ];
      const originalPlayers: PlayerDelta[] = [
        { id: 'p1', position: 2, balance: 5000 },
      ];

      sessionMgr.broadcastDelta({ tick: 50, cells: originalCells, players: originalPlayers });

      // Đột biến mảng và object phía ngoài
      (originalCells as any)[0].level = 3;
      (originalCells as any)[0].isETC = true;
      (originalPlayers as any)[0].balance = 0;
      originalCells.push({ index: 2, ownerId: 'p2', level: 0, isETC: false });

      const last = sessionMgr.getLastDelta();
      expect(last?.cells).toHaveLength(1);
      expect(last?.cells[0]?.level).toBe(1);
      expect(last?.cells[0]?.isETC).toBe(false);
      expect(last?.players?.[0]?.balance).toBe(5000);

      // Kiểm tra buildDeltaPayload cũng bảo vệ tham chiếu
      const sourceCells: CellDelta[] = [{ index: 5, level: 0 }];
      const payload = buildDeltaPayload(1, sourceCells);
      (sourceCells as any)[0].level = 2;
      expect(payload.cells[0]?.level).toBe(0);
    });
  });

  describe('[NFR] NFR Baseline - Kích thước tuần tự hóa JSON < 10KB', () => {
    it('[TC-05.8/NFR] kích thước JSON của DeltaPayload đủ 40 ô và 4 người chơi < 10.240 bytes', () => {
      const cells: CellDelta[] = Array.from({ length: 40 }, (_, i) => ({
        index: i,
        ownerId: i % 3 === 0 ? `player-${(i % 4) + 1}` : null,
        level: (i % 4),
        isETC: i % 2 === 0,
      }));
      const players: PlayerDelta[] = [
        { id: 'player-1', position: 10, balance: 15000 },
        { id: 'player-2', position: 20, balance: 8500 },
        { id: 'player-3', position: 30, balance: 200 },
        { id: 'player-4', position: 0, balance: 4000 },
      ];

      const fullDelta: DeltaPayload = {
        tick: 999999,
        cells,
        players,
      };

      const serialized = JSON.stringify(fullDelta);
      const sizeBytes = new TextEncoder().encode(serialized).length;

      expect(sizeBytes).toBeLessThan(10_240);
      expect(sizeBytes).toBeLessThan(3_000);
    });
  });

  describe('[Adversarial] Ca đối kháng và biên an toàn', () => {
    it('[TC-05.8/Adversarial] các ô không sở hữu hoặc ô đặc biệt trả về ownerId null/undefined và không có level/isETC', () => {
      const specialCells: CellDelta[] = [
        { index: 0, ownerId: null },
        { index: 10, ownerId: null },
        { index: 20, ownerId: null },
        { index: 30, ownerId: null },
      ];

      const delta: DeltaPayload = {
        tick: 1,
        cells: specialCells,
      };

      sessionMgr.broadcastDelta(delta);
      const last = sessionMgr.getLastDelta();

      expect(last?.cells[0]?.ownerId).toBeNull();
      expect(last?.cells[0]?.level).toBeUndefined();
      expect(last?.cells[0]?.isETC).toBeUndefined();
    });

    it('[TC-05.8/Adversarial] kiểm tra miền giá trị level từ 0 đến 3 (C0 đến C3) và cờ isETC boolean', () => {
      const boundaryCells: CellDelta[] = [
        { index: 1, ownerId: 'p1', level: 0, isETC: false },
        { index: 2, ownerId: 'p1', level: 1, isETC: true },
        { index: 3, ownerId: 'p1', level: 2, isETC: false },
        { index: 4, ownerId: 'p1', level: 3, isETC: true },
      ];

      sessionMgr.broadcastDelta({ tick: 2, cells: boundaryCells });
      const last = sessionMgr.getLastDelta();

      expect(last?.cells[0]?.level).toBe(0);
      expect(last?.cells[0]?.isETC).toBe(false);
      expect(last?.cells[1]?.level).toBe(1);
      expect(last?.cells[1]?.isETC).toBe(true);
      expect(last?.cells[2]?.level).toBe(2);
      expect(last?.cells[2]?.isETC).toBe(false);
      expect(last?.cells[3]?.level).toBe(3);
      expect(last?.cells[3]?.isETC).toBe(true);
    });

    it('[TC-05.8/Adversarial] idempotency khi phát broadcast liên tiếp với các tick khác nhau', () => {
      const delta1: DeltaPayload = {
        tick: 1,
        cells: [{ index: 1, ownerId: 'p1', level: 1, isETC: false }],
      };
      const delta2: DeltaPayload = {
        tick: 2,
        cells: [{ index: 1, ownerId: 'p1', level: 2, isETC: true }],
      };

      sessionMgr.broadcastDelta(delta1);
      expect(sessionMgr.getLastDelta()?.cells[0]?.level).toBe(1);

      sessionMgr.broadcastDelta(delta2);
      expect(sessionMgr.getLastDelta()?.cells[0]?.level).toBe(2);
      expect(sessionMgr.getLastDelta()?.cells[0]?.isETC).toBe(true);
      expect(sessionMgr.getLastDelta()?.tick).toBe(2);
    });

    it('[TC-05.8/Adversarial] an toàn khi delta không truyền players (optional)', () => {
      const delta: DeltaPayload = {
        tick: 3,
        cells: [{ index: 5, ownerId: 'p2' }],
      };

      sessionMgr.broadcastDelta(delta);
      const last = sessionMgr.getLastDelta();
      expect(last?.players).toBeUndefined();
    });
  });
});
