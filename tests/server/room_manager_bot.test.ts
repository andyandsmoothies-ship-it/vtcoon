// [TC-06.8/MSS] RoomManager Bot Integration Tests
// [UC-GAME-005/MSS][UC-GAME-008/MSS]
// Traceability: GAME-S06 TASK 5 · runBotTurn [NEW method on RoomManager]
//
// NOTE: RoomManager.runBotTurn() DOES NOT EXIST YET.
// These tests MUST FAIL with: expect(received).toBe('function') — received: 'undefined'
// That is the expected RED phase for TDD.

import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';

// Helper: Bam gio xac dinh; RoomManager nhan rng de ket qua tung xac xac det (khong Random.random())
function setup() {
  const rm = new RoomManager(() => 0.1); // PRNG det: dice = floor(6*0.1)+1 = 1 ? total 2
  const room = rm.createRoom('P-HOST');
  rm.joinRoom(room.roomCode, 'P-GUEST');
  rm.startGame(room.roomCode);
  return { rm, room };
}

describe('TC-06.8 RoomManager Bot Integration — Auto-play khong deadlock', () => {
  it('[TC-06.8-INT-1] runBotTurn ton tai tren RoomManager instance', () => {
    // Arrange
    const rm = new RoomManager();

    // Assert — Consumer: phuong thuc phai ton tai tren class
    // Se FAIL vi runBotTurn chua duoc implement: expected 'undefined' to be 'function'
    expect(typeof rm.runBotTurn).toBe('function');
  });

  it('[TC-06.8-INT-2] Bot isBot=true: FSM chuyen dung sau runBotTurn (khong deadlock)', () => {
    // Arrange
    const { rm, room } = setup();
    const code = room.roomCode;

    // Dat player 0 la bot voi balance du de mua
    room.players[0]!.isBot = true;
    room.players[0]!.balance = 20_000;

    // Act — runBotTurn phai hoan thanh (khong treo, khong nem exception)
    // Se FAIL vi runBotTurn chua ton tai: TypeError: rm.runBotTurn is not a function
    expect(() => rm.runBotTurn(code)).not.toThrow();
  });

  it('[TC-06.8-INT-3] runBotTurn voi room khong hop le: khong nem exception (graceful no-op)', () => {
    // Arrange
    const rm = new RoomManager();
    const INVALID_CODE = 'XXXXXX'; // Room code khong ton tai

    // Act & Assert — Phai xu ly graceful (khong crash khi room khong hop le)
    // Se FAIL vi runBotTurn chua ton tai
    expect(() => rm.runBotTurn(INVALID_CODE)).not.toThrow();
  });

  it('[TC-06.8-INT-4] Player khong phai Bot (isBot=false): runBotTurn la no-op (khong tac dong)', () => {
    // Arrange
    const { rm, room } = setup();
    const code = room.roomCode;

    // Xac nhan player 0 la HUMAN (isBot=false theo mac dinh)
    expect(room.players[0]!.isBot).toBe(false);
    const phaseBefore = room.phase;

    // Act — runBotTurn phai la no-op vi current player khong phai bot
    // Se FAIL vi runBotTurn chua ton tai
    expect(() => rm.runBotTurn(code)).not.toThrow();

    // Assert phase khong thay doi (no-op voi human player)
    expect(room.phase).toBe(phaseBefore);
  });

  it('[TC-06.8-INT-5] 10 luot Bot lien tuc: khong infinite loop (safety counter kiem soat)', () => {
    // Arrange: 2 bot choi voi nhau
    const rm = new RoomManager(() => 0.1); // PRNG det
    const room = rm.createRoom('Bot-Alpha');
    rm.joinRoom(room.roomCode, 'Bot-Beta');
    rm.startGame(room.roomCode);
    const code = room.roomCode;

    // Dat ca 2 player la bot voi balance du de mua
    room.players.forEach((p) => {
      p.isBot = true;
      p.balance = 20_000;
    });

    // Act — Chay 10 luot bot lien tuc phai hoan thanh trong thoi gian hop li
    // Se FAIL vi runBotTurn chua ton tai: TypeError: rm.runBotTurn is not a function
    expect(() => {
      for (let i = 0; i < 10; i++) {
        rm.runBotTurn(code);
      }
    }).not.toThrow();
  });
});
