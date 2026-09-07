// [TC-01.1/MSS][TC-01.4/MSS] Room & Player Domain — Acceptance Test Contracts
// Traceability: UC-GAME-001/MSS, UC-GAME-008/MSS

import { describe, test, expect } from 'vitest';
import {
  createRoom,
  createPlayer,
  checkPassedGo,
  generateRoomCode,
  GO_BONUS,
  ROOM_CODE_LENGTH,
  BOARD_SIZE,
  INITIAL_BALANCE,
  TurnPhase,
} from '../../src/domain/room';

describe('[UC-GAME-001/MSS] TC-01.1 createRoom', () => {
  test('tra ve phong voi roomCode dai 6 ky tu', () => {
    const room = createRoom('host-1');
    expect(room.roomCode).toHaveLength(ROOM_CODE_LENGTH);
  });

  test('hostId khop dung voi nguoi tao', () => {
    const room = createRoom('host-abc');
    expect(room.hostId).toBe('host-abc');
  });

  test('phong moi chua bat dau (started = false)', () => {
    const room = createRoom('host-1');
    expect(room.started).toBe(false);
  });

  test('phong moi co dung 1 nguoi choi la host', () => {
    const room = createRoom('host-1');
    expect(room.players).toHaveLength(1);
    expect(room.players[0]?.id).toBe('host-1');
  });

  test('phase ban dau la WaitingRoll', () => {
    const room = createRoom('host-1');
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });
});

describe('[UC-GAME-001/MSS] generateRoomCode', () => {
  test('ma phong chi chua chu hoa A-Z va so 0-9', () => {
    const code = generateRoomCode();
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });

  test('ma phong co dung ROOM_CODE_LENGTH ky tu', () => {
    expect(generateRoomCode()).toHaveLength(ROOM_CODE_LENGTH);
    expect(ROOM_CODE_LENGTH).toBe(6);
  });
});

describe('[UC-GAME-001/MSS] createPlayer', () => {
  test('nguoi choi moi bat dau tai o 0', () => {
    const p = createPlayer('p1');
    expect(p.position).toBe(0);
  });

  test('nguoi choi moi co so du khoi diem 15.000 Tr. VND', () => {
    const p = createPlayer('p1');
    expect(p.balance).toBe(INITIAL_BALANCE);
    expect(INITIAL_BALANCE).toBe(15_000);
  });

  test('id nguoi choi khop dung', () => {
    const p = createPlayer('player-99');
    expect(p.id).toBe('player-99');
  });
});

describe('[UC-GAME-008/MSS] TC-01.4 checkPassedGo', () => {
  test('vi tri 38 -> 2 (vuot qua GO) -> true', () => {
    expect(checkPassedGo(38, 2)).toBe(true);
  });

  test('vi tri 5 -> 10 (tien binh thuong) -> false', () => {
    expect(checkPassedGo(5, 10)).toBe(false);
  });

  test('vi tri 36 -> 0 (dung dung o GO) -> true', () => {
    expect(checkPassedGo(36, 0)).toBe(true);
  });

  test('vi tri 0 -> 0 (khong di chuyen) -> false', () => {
    expect(checkPassedGo(0, 0)).toBe(false);
  });
});

describe('[UC-GAME-001/MSS][UC-GAME-008/MSS] Hang so domain', () => {
  test('BOARD_SIZE = 40', () => {
    expect(BOARD_SIZE).toBe(40);
  });

  test('GO_BONUS = 2000', () => {
    expect(GO_BONUS).toBe(2_000);
  });
});
