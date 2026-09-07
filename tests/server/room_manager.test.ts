// [TC-01.1..TC-01.5/MSS] RoomManager FSM — Acceptance Test Contracts
// Traceability: UC-GAME-001..003, UC-GAME-005, UC-GAME-007, UC-GAME-008 / MSS

import { describe, test, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase, BOARD_SIZE, GO_BONUS, INITIAL_BALANCE } from '../../src/domain/room';

describe('[UC-GAME-001/MSS] TC-01.1 createRoom', () => {
  test('tao phong tra ve roomCode dai 6 ky tu', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('host-1');
    expect(room.roomCode).toHaveLength(6);
  });

  test('hostId khop dung nguoi tao phong', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('host-abc');
    expect(room.hostId).toBe('host-abc');
  });

  test('phong tao xong co the lay lai bang getRoom', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('host-1');
    expect(mgr.getRoom(room.roomCode)).toBeDefined();
    expect(mgr.getRoom(room.roomCode)?.roomCode).toBe(room.roomCode);
  });
});

describe('[UC-GAME-002/MSS] TC-01.2 joinRoom', () => {
  test('nguoi choi thu 2 gia nhap thanh cong, playerCount tang len 2', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('host');
    const updated = mgr.joinRoom(room.roomCode, 'player-2');
    expect(updated?.players).toHaveLength(2);
    expect(updated?.players[1]?.id).toBe('player-2');
  });

  test('gia nhap phong khong ton tai tra ve undefined', () => {
    const mgr = new RoomManager(42);
    expect(mgr.joinRoom('XXXXXX', 'p1')).toBeUndefined();
  });

  test('khong the gia nhap phong da bat dau', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('host');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    expect(mgr.joinRoom(room.roomCode, 'p3')).toBeUndefined();
  });
});

describe('[UC-GAME-003/MSS] startGame', () => {
  test('startGame voi 2 nguoi choi → started = true', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('host');
    mgr.joinRoom(room.roomCode, 'p2');
    const started = mgr.startGame(room.roomCode);
    expect(started?.started).toBe(true);
  });

  test('startGame voi chi 1 nguoi choi → tra ve undefined', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('host');
    expect(mgr.startGame(room.roomCode)).toBeUndefined();
  });

  test('sau startGame, phase = WaitingRoll va currentPlayerIndex = 0', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('host');
    mgr.joinRoom(room.roomCode, 'p2');
    const started = mgr.startGame(room.roomCode);
    expect(started?.phase).toBe(TurnPhase.WaitingRoll);
    expect(started?.currentPlayerIndex).toBe(0);
  });
});

describe('[UC-GAME-005,007/MSS] TC-01.3 handleRollDice — di chuyen', () => {
  test('do xuc xac dung luot → total in [2..12], vi tri moi dung', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    const result = mgr.handleRollDice(room.roomCode, 'p1');
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.dice.total).toBeGreaterThanOrEqual(2);
    expect(result.dice.total).toBeLessThanOrEqual(12);
    expect(result.player.position).toBe(result.dice.total % BOARD_SIZE);
  });

  test('do xuc xac sai luot → tra ve undefined, state khong thay doi', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    const result = mgr.handleRollDice(room.roomCode, 'p2');
    expect(result).toBeUndefined();
  });

  test('do xuc xac khi game chua bat dau → tra ve undefined', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    const result = mgr.handleRollDice(room.roomCode, 'p1');
    expect(result).toBeUndefined();
  });
});

describe('[UC-GAME-008/MSS] TC-01.4 handleRollDice — vuot o GO', () => {
  test('vuot qua GO → passedGo = true va balance tang dung GO_BONUS', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    const r = mgr.getRoom(room.roomCode);
    expect(r).toBeDefined();
    if (r === undefined) return;
    const player0 = r.players[0];
    expect(player0).toBeDefined();
    if (player0 === undefined) return;
    player0.position = 38;

    const result = mgr.handleRollDice(room.roomCode, 'p1');
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.passedGo).toBe(true);
    expect(result.player.balance).toBe(INITIAL_BALANCE + GO_BONUS);
  });

  test('di chuyen binh thuong, khong vuot GO → passedGo = false, balance khong doi', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    const result = mgr.handleRollDice(room.roomCode, 'p1');
    expect(result).toBeDefined();
    if (result === undefined) return;
    expect(result.passedGo).toBe(false);
    expect(result.player.balance).toBe(INITIAL_BALANCE);
  });
});

describe('[UC-GAME-003/MSS] TC-01.5 xoay luot', () => {
  test('sau khi p1 do xuc xac, currentPlayerIndex chuyen sang p2', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    mgr.handleRollDice(room.roomCode, 'p1');
    const updated = mgr.getRoom(room.roomCode);
    expect(updated).toBeDefined();
    if (updated === undefined) return;
    expect(updated.currentPlayerIndex).toBe(1);
    expect(updated.phase).toBe(TurnPhase.WaitingRoll);
  });

  test('xoay vong dung cach khi 3 nguoi choi', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.joinRoom(room.roomCode, 'p3');
    mgr.startGame(room.roomCode);

    mgr.handleRollDice(room.roomCode, 'p1');
    mgr.handleRollDice(room.roomCode, 'p2');
    mgr.handleRollDice(room.roomCode, 'p3');
    const r = mgr.getRoom(room.roomCode);
    expect(r).toBeDefined();
    if (r === undefined) return;
    expect(r.currentPlayerIndex).toBe(0);
  });
});
