// [TC-287.01/MSS..TC-287.09/MSS][UC-IMP287] Out-of-Turn Debtor Intent Whitelist Contract Suite
// SSOT: .agents/plans/PLAN_IMP_287_OUT_OF_TURN_DEBTOR_INTENT_WHITELIST.md
// Invariant Reference: docs/domain/gotchas/fsm_lifecycle.md

import { describe, it, expect } from 'vitest';
import { TurnPhase, ActionRejectReason } from '../../src/domain/room.js';
import { IntentGuard } from '../../src/server/security/intent_guard.js';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { mortgageProperty } from '../../src/server/mortgage_manager.js';

function setupTestRoom(numPlayers = 3) {
  const mgr = new RoomManager(42);
  const room = mgr.createRoom('p1_alice');
  if (numPlayers >= 2) mgr.joinRoom(room.roomCode, 'p2_bob');
  if (numPlayers >= 3) mgr.joinRoom(room.roomCode, 'p3_charlie');
  mgr.startGame(room.roomCode);
  const reg = mgr.getRegistry(room.roomCode)!;
  const sm = mgr.getPropertyStates(room.roomCode)!;
  return { mgr, room, reg, sm };
}

describe('[TC-287.01/MSS..TC-287.09/MSS][UC-IMP287] Out-of-Turn Debtor Intent Whitelist Contract Suite', () => {
  it('[TC-287.01/MSS][UC-IMP287] Given phòng ở InsolvencyPhase và con nợ ngoài lượt tại pendingInsolvencyDebtorId, When IntentGuard validate INTENT_AUTO_SOLVENCY của con nợ ngoài lượt, Then allowed là true', () => {
    const { room } = setupTestRoom(2);
    const bob = room.players[1]!;
    bob.balance = -300;
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = bob.id;

    const guard = new IntentGuard();
    const result = guard.validate(room, bob.id, { type: 'INTENT_AUTO_SOLVENCY' });

    expect(result.allowed).toBe(true);
    expect(result.playerId).toBe(bob.id);
  });

  it('[TC-287.02/MSS][UC-IMP287] Given phòng ở InsolvencyPhase và con nợ ngoài lượt tại pendingInsolvencyDebtorId, When IntentGuard validate INTENT_MORTGAGE của con nợ ngoài lượt, Then allowed là true', () => {
    const { room } = setupTestRoom(2);
    const bob = room.players[1]!;
    bob.balance = -300;
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = bob.id;

    const guard = new IntentGuard();
    const result = guard.validate(room, bob.id, { type: 'INTENT_MORTGAGE', cellIndex: 1 });

    expect(result.allowed).toBe(true);
    expect(result.playerId).toBe(bob.id);
  });

  it('[TC-287.03/MSS][UC-IMP287] Given phòng ở InsolvencyPhase, When IntentGuard validate INTENT_AUTO_SOLVENCY của người chơi khác không nợ và ngoài lượt, Then allowed là false với reasonCode OUT_OF_TURN', () => {
    const { room } = setupTestRoom(3);
    const bob = room.players[1]!;
    const charlie = room.players[2]!;
    bob.balance = -300;
    charlie.balance = 500;
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = bob.id;

    const guard = new IntentGuard();
    const result = guard.validate(room, charlie.id, { type: 'INTENT_AUTO_SOLVENCY' });

    expect(result.allowed).toBe(false);
    expect(result.reasonCode).toBe('OUT_OF_TURN');
  });

  it('[TC-287.04/MSS][UC-IMP287] Given phòng ở InsolvencyPhase với con nợ ngoài lượt, When dispatchPlayerIntent gửi INTENT_AUTO_SOLVENCY cho con nợ ngoài lượt, Then lệnh không bị chặn NOT_YOUR_TURN và xử lý giải cứu thành công', () => {
    const { mgr, room, reg, sm } = setupTestRoom(2);
    const bob = room.players[1]!;
    bob.balance = -200;
    reg.set(1, bob.id);
    sm.set(1, { level: 0, isMortgaged: false });
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = bob.id;

    const result = dispatchPlayerIntent(mgr, room.roomCode, bob.id, { type: 'INTENT_AUTO_SOLVENCY' });

    expect(result.success).toBe(true);
    expect(result.reason).not.toBe(ActionRejectReason.NOT_YOUR_TURN);
  });

  it('[TC-287.05/MSS][UC-IMP287] Given phòng ở InsolvencyPhase với con nợ ngoài lượt có nhà cấp 2, When dispatchPlayerIntent gửi INTENT_DOWNGRADE cho con nợ ngoài lượt, Then hạ cấp thành công và số dư được hoàn lại', () => {
    const { mgr, room, reg, sm } = setupTestRoom(2);
    const bob = room.players[1]!;
    bob.balance = -100;
    reg.set(1, bob.id);
    sm.set(1, { level: 2 });
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = bob.id;

    const result = dispatchPlayerIntent(mgr, room.roomCode, bob.id, { type: 'INTENT_DOWNGRADE', cellIndex: 1 });

    expect(result.success).toBe(true);
    expect(sm.get(1)?.level).toBe(1);
    expect(bob.balance).toBeGreaterThan(-100);
  });

  it('[TC-287.06/MSS][UC-IMP287] Given phòng ở InsolvencyPhase với con nợ ngoài lượt sở hữu đất chưa cắm cọc, When dispatchPlayerIntent gửi INTENT_MORTGAGE cho con nợ ngoài lượt, Then cắm cọc thành công và nhận tiền vay', () => {
    const { mgr, room, reg, sm } = setupTestRoom(2);
    const bob = room.players[1]!;
    bob.balance = -100;
    reg.set(1, bob.id);
    sm.set(1, { level: 0, isMortgaged: false });
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = bob.id;

    const result = dispatchPlayerIntent(mgr, room.roomCode, bob.id, { type: 'INTENT_MORTGAGE', cellIndex: 1 });

    expect(result.success).toBe(true);
    expect(sm.get(1)?.isMortgaged).toBe(true);
    expect(bob.balance).toBeGreaterThan(-100);
  });

  it('[TC-287.07/MSS][UC-IMP287] Given phòng ở InsolvencyPhase với con nợ ngoài lượt, When người chơi khác ngoài lượt không nợ gửi INTENT_MORTGAGE, Then bị từ chối với reason NOT_YOUR_TURN', () => {
    const { mgr, room, reg, sm } = setupTestRoom(3);
    const bob = room.players[1]!;
    const charlie = room.players[2]!;
    bob.balance = -200;
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = bob.id;

    reg.set(3, charlie.id);
    sm.set(3, { level: 0, isMortgaged: false });

    const result = dispatchPlayerIntent(mgr, room.roomCode, charlie.id, { type: 'INTENT_MORTGAGE', cellIndex: 3 });

    expect(result.success).toBe(false);
    expect(result.reason).toBe(ActionRejectReason.NOT_YOUR_TURN);
  });

  it('[TC-287.08/MSS][UC-IMP287] Given con nợ ngoài lượt sau khi cắm cọc có số dư balance >= 0, When hoàn tất xử lý cắm cọc, Then pendingInsolvencyDebtorId được xóa và room.phase phục hồi về PropertyManagement', () => {
    const { room, reg, sm } = setupTestRoom(2);
    const bob = room.players[1]!;
    bob.balance = -20;
    reg.set(1, bob.id);
    sm.set(1, { level: 0, isMortgaged: false });
    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = bob.id;

    const result = mortgageProperty(room, bob.id, 1, reg, sm);

    expect(result.success).toBe(true);
    expect(bob.balance).toBeGreaterThanOrEqual(0);
    expect(room.pendingInsolvencyDebtorId).toBeUndefined();
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('[TC-287.09/MSS][UC-IMP287] Given phòng ở InsolvencyPhase có nhiều con nợ trong pendingInsolvencyQueue, When con nợ hiện tại cắm cọc đưa số dư balance >= 0, Then pendingInsolvencyDebtorId chuyển sang con nợ kế tiếp và phase vẫn là InsolvencyPhase', () => {
    const { room, reg, sm } = setupTestRoom(3);
    const bob = room.players[1]!;
    const charlie = room.players[2]!;
    bob.balance = -20;
    charlie.balance = -500;
    reg.set(1, bob.id);
    sm.set(1, { level: 0, isMortgaged: false });

    room.phase = TurnPhase.InsolvencyPhase;
    room.pendingInsolvencyDebtorId = bob.id;
    room.pendingInsolvencyQueue = [bob.id, charlie.id];

    const result = mortgageProperty(room, bob.id, 1, reg, sm);

    expect(result.success).toBe(true);
    expect(bob.balance).toBeGreaterThanOrEqual(0);
    expect(room.pendingInsolvencyDebtorId).toBe(charlie.id);
    expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
  });
});
