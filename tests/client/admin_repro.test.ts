// [IMP-25/MSS] Admin Forensic Helpers Tests
import { describe, it, expect } from 'vitest';
import { buildReproCode } from '../../src/client/ui/admin/admin_repro.js';
import type { AdminRoomDetail, AdminRoomLogEntry } from '../../src/server/network/admin_manager.js';

describe('[IMP-25/MSS] Admin Repro Code Generator', () => {
  it('sinh mã nguồn Vitest hợp lệ từ dữ liệu phòng và nhật ký sự kiện', () => {
    const mockRoom: AdminRoomDetail = {
      roomCode: 'TEST99',
      hostId: 'host_player',
      started: true,
      phase: 'WaitingRoll',
      round: 3,
      playerCount: 2,
      players: [
        {
          id: 'host_player',
          balance: 14000,
          position: 4,
          isBot: false,
          bankrupt: false,
          propertyCount: 1,
          netWorth: 15000,
        },
      ],
      treasuryPool: 2500,
      status: 'CRITICAL',
      warningReason: 'Phát hiện lỗi kẹt lượt',
      lastActivity: Date.now(),
      activeTimersCount: 1,
      hasAuction: false,
      propertyStates: { 4: { ownerId: 'host_player', level: 0, isMortgaged: false } },
      chanceDiscardCount: 1,
      marketDiscardCount: 0,
    };

    const mockLogs: AdminRoomLogEntry[] = [
      {
        id: 'l1',
        roomCode: 'TEST99',
        timestamp: Date.now(),
        source: 'PLAYER',
        action: 'INTENT_ROLL',
        payloadSummary: 'Gieo xúc xắc [2, 2]',
      },
    ];

    const code = buildReproCode(mockRoom, mockLogs);
    expect(typeof code).toBe('string');
    expect(code).toContain('TC-REPRO-TEST99');
    expect(code).toContain('RoomManager');
    expect(code).toContain('Phát hiện lỗi kẹt lượt');
    expect(code).toContain('Số lần gieo xúc xắc ghi nhận: 1');
    expect(code).toContain("mgr.addBot(r.roomCode, 'bot_repro')");
  });

  it('sinh mã nguồn có đầy đủ các người chơi khi phòng có từ 2 người trở lên', () => {
    const multiRoom: AdminRoomDetail = {
      roomCode: 'MULTI4',
      hostId: 'p1',
      started: true,
      phase: 'WaitingRoll',
      round: 1,
      playerCount: 3,
      players: [
        { id: 'p1', balance: 15000, position: 0, isBot: false, bankrupt: false, propertyCount: 0, netWorth: 15000 },
        { id: 'p2', balance: 15000, position: 0, isBot: false, bankrupt: false, propertyCount: 0, netWorth: 15000 },
        { id: 'bot_3', balance: 15000, position: 0, isBot: true, bankrupt: false, propertyCount: 0, netWorth: 15000 },
      ],
      treasuryPool: 0,
      status: 'NORMAL',
      lastActivity: Date.now(),
      activeTimersCount: 0,
      hasAuction: false,
      propertyStates: {},
      chanceDiscardCount: 0,
      marketDiscardCount: 0,
    };

    const code = buildReproCode(multiRoom, []);
    expect(code).toContain("mgr.joinRoom(r.roomCode, 'p2')");
    expect(code).toContain("mgr.addBot(r.roomCode, 'bot_3')");
  });
});
