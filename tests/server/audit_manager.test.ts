// [DEBT-03/MSS] Unit Tests & Contract Tests for AuditManager Dead Code Removal
import { describe, it, expect } from 'vitest';
import * as AuditModule from '../../src/server/audit_manager';
import {
  sendToAudit,
  handleTurnStart,
  handleBailOut,
  handleUseDiplomatic,
  processRollDoubles,
} from '../../src/server/audit_manager';
import { createRoom, createPlayer, TurnPhase } from '../../src/domain/room';
import { ChanceCardId } from '../../src/domain/event_card_types';

describe('[DEBT-03/MSS] AuditManager Dead Code Removal & Standalone Functions Contract', () => {
  it('Không còn export class AuditManager trong audit_manager.ts', () => {
    expect((AuditModule as any).AuditManager).toBeUndefined();
  });

  it('Xuất khẩu đầy đủ 5 standalone pure functions', () => {
    expect(typeof AuditModule.sendToAudit).toBe('function');
    expect(typeof AuditModule.handleTurnStart).toBe('function');
    expect(typeof AuditModule.handleBailOut).toBe('function');
    expect(typeof AuditModule.handleUseDiplomatic).toBe('function');
    expect(typeof AuditModule.processRollDoubles).toBe('function');
  });
});

describe('[UC-GAME-047/MSS] sendToAudit', () => {
  it('đưa người chơi đến trạm kiểm toán ô 10, phạt 3 lượt và chuyển phase', () => {
    const room = createRoom('p1');
    const player = room.players[0]!;
    player.position = 30;
    player.consecutiveDoubles = 2;
    room.phase = TurnPhase.WaitingRoll;

    sendToAudit(room, 'p1');

    expect(player.position).toBe(10);
    expect(player.auditTurnsLeft).toBe(3);
    expect(player.consecutiveDoubles).toBe(0);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('không văng lỗi khi playerId không tồn tại', () => {
    const room = createRoom('p1');
    expect(() => sendToAudit(room, 'p_unknown')).not.toThrow();
  });
});

describe('[UC-GAME-047/MSS] handleTurnStart', () => {
  it('từ chối khi phòng chưa bắt đầu hoặc sai người chơi', () => {
    const room = createRoom('p1');
    expect(handleTurnStart(undefined, 'p1')).toEqual({ canRoll: false, reason: 'INVALID_PLAYER' });
    expect(handleTurnStart(room, 'p1')).toEqual({ canRoll: false, reason: 'INVALID_PLAYER' });

    room.started = true;
    expect(handleTurnStart(room, 'p2')).toEqual({ canRoll: false, reason: 'INVALID_PLAYER' });
  });

  it('xử lý skipNextTurn từ dịch vụ C3', () => {
    const room = createRoom('p1');
    room.started = true;
    const player = room.players[0]!;
    player.skipNextTurn = true;

    const res = handleTurnStart(room, 'p1');
    expect(res).toEqual({ canRoll: false, reason: 'SKIPPED_BY_SERVICE_C3' });
    expect(player.skipNextTurn).toBe(false);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('chặn lắc xúc xắc khi đang trong trạm kiểm toán (auditTurnsLeft > 0)', () => {
    const room = createRoom('p1');
    room.started = true;
    const player = room.players[0]!;
    player.auditTurnsLeft = 2;

    const res = handleTurnStart(room, 'p1');
    expect(res).toEqual({ canRoll: false, reason: 'IN_AUDIT' });
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('cho phép lắc xúc xắc khi trạng thái bình thường', () => {
    const room = createRoom('p1');
    room.started = true;
    expect(handleTurnStart(room, 'p1')).toEqual({ canRoll: true });
  });

  it('từ chối khi currentPlayerIndex trỏ ngoài danh sách người chơi', () => {
    const room = createRoom('p1');
    room.started = true;
    room.currentPlayerIndex = 99;
    expect(handleTurnStart(room, 'p1')).toEqual({ canRoll: false, reason: 'INVALID_PLAYER' });
  });
});

describe('[UC-GAME-047/MSS] handleBailOut', () => {
  it('từ chối khi phòng chưa bắt đầu hoặc không phải người chơi hiện tại', () => {
    const room = createRoom('p1');
    expect(handleBailOut(undefined, 'p1', false)).toEqual({ success: false, reason: 'INVALID_PLAYER' });
    expect(handleBailOut(room, 'p1', false)).toEqual({ success: false, reason: 'INVALID_PLAYER' });
    room.started = true;
    expect(handleBailOut(room, 'p2', false)).toEqual({ success: false, reason: 'INVALID_PLAYER' });
  });

  it('từ chối khi không bị phạt kiểm toán (auditTurnsLeft <= 0)', () => {
    const room = createRoom('p1');
    room.started = true;
    expect(handleBailOut(room, 'p1', false)).toEqual({ success: false, reason: 'NOT_IN_AUDIT' });
  });

  it('từ chối khi không đủ 500 Tr. nộp bảo lãnh', () => {
    const room = createRoom('p1');
    room.started = true;
    const player = room.players[0]!;
    player.auditTurnsLeft = 2;
    player.balance = 400;

    expect(handleBailOut(room, 'p1', false)).toEqual({ success: false, reason: 'INSUFFICIENT_FUNDS' });
    expect(player.auditTurnsLeft).toBe(2);
    expect(player.balance).toBe(400);
  });

  it('nộp 500 Tr. thành công: trừ tiền, giải phóng kiểm toán, chuyển WaitingRoll nếu chưa roll', () => {
    const room = createRoom('p1');
    room.started = true;
    const player = room.players[0]!;
    player.auditTurnsLeft = 2;
    player.balance = 1000;

    const res = handleBailOut(room, 'p1', false);
    expect(res).toEqual({ success: true });
    expect(player.balance).toBe(500);
    expect(player.auditTurnsLeft).toBe(0);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });

  it('nộp 500 Tr. thành công sau khi đã roll: chuyển PropertyManagement', () => {
    const room = createRoom('p1');
    room.started = true;
    const player = room.players[0]!;
    player.auditTurnsLeft = 2;
    player.balance = 1000;

    const res = handleBailOut(room, 'p1', true);
    expect(res).toEqual({ success: true });
    expect(player.balance).toBe(500);
    expect(player.auditTurnsLeft).toBe(0);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });
});

describe('[UC-GAME-047/MSS] handleUseDiplomatic', () => {
  it('từ chối khi người chơi không có thẻ CC_DIPLOMATIC', () => {
    const player = createPlayer('p1');
    const discard: ChanceCardId[] = [];
    expect(handleUseDiplomatic(player, discard)).toEqual({ success: false, reason: 'NO_DIPLOMATIC_CARD' });
    expect(discard.length).toBe(0);
  });

  it('sử dụng thẻ thành công: loại khỏi tay, đưa vào discard pile', () => {
    const player = createPlayer('p1');
    player.hand.push(ChanceCardId.CC_DIPLOMATIC);
    const discard: ChanceCardId[] = [];

    const res = handleUseDiplomatic(player, discard);
    expect(res).toEqual({ success: true });
    expect(player.hand).not.toContain(ChanceCardId.CC_DIPLOMATIC);
    expect(discard).toContain(ChanceCardId.CC_DIPLOMATIC);
  });

  it('khi có nhiều thẻ trên tay: chỉ loại bỏ đúng 1 thẻ CC_DIPLOMATIC và bảo toàn thẻ khác', () => {
    const player = createPlayer('p1');
    player.hand = [ChanceCardId.CC_STOCK_PROFIT, ChanceCardId.CC_DIPLOMATIC, ChanceCardId.CC_STOCK_PROFIT];
    const discard: ChanceCardId[] = [];

    const res = handleUseDiplomatic(player, discard);
    expect(res).toEqual({ success: true });
    expect(player.hand).toEqual([ChanceCardId.CC_STOCK_PROFIT, ChanceCardId.CC_STOCK_PROFIT]);
    expect(discard).toEqual([ChanceCardId.CC_DIPLOMATIC]);
  });
});

describe('[UC-GAME-047/MSS] processRollDoubles', () => {
  it('trong trạm kiểm toán: roll không double -> giữ nguyên kiểm toán, stopped=true', () => {
    const room = createRoom('p1');
    const player = room.players[0]!;
    player.auditTurnsLeft = 2;

    const res = processRollDoubles(room, player, { die1: 1, die2: 2, total: 3, isDouble: false });
    expect(res.stopped).toBe(true);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
    expect(player.auditTurnsLeft).toBe(2);
  });

  it('trong trạm kiểm toán: roll double -> giải phóng kiểm toán, stopped=false', () => {
    const room = createRoom('p1');
    const player = room.players[0]!;
    player.auditTurnsLeft = 2;

    const res = processRollDoubles(room, player, { die1: 3, die2: 3, total: 6, isDouble: true });
    expect(res.stopped).toBe(false);
    expect(player.auditTurnsLeft).toBe(0);
    expect(player.consecutiveDoubles).toBe(0);
  });

  it('ngoài trạm kiểm toán: roll double 1 lần và 2 lần -> tăng consecutiveDoubles, stopped=false', () => {
    const room = createRoom('p1');
    const player = room.players[0]!;

    const res1 = processRollDoubles(room, player, { die1: 2, die2: 2, total: 4, isDouble: true });
    expect(res1.stopped).toBe(false);
    expect(player.consecutiveDoubles).toBe(1);

    const res2 = processRollDoubles(room, player, { die1: 4, die2: 4, total: 8, isDouble: true });
    expect(res2.stopped).toBe(false);
    expect(player.consecutiveDoubles).toBe(2);
  });

  it('ngoài trạm kiểm toán: roll non-double -> reset consecutiveDoubles về 0', () => {
    const room = createRoom('p1');
    const player = room.players[0]!;
    player.consecutiveDoubles = 2;

    const res = processRollDoubles(room, player, { die1: 1, die2: 3, total: 4, isDouble: false });
    expect(res.stopped).toBe(false);
    expect(player.consecutiveDoubles).toBe(0);
  });

  it('ngoài trạm kiểm toán: roll double lần thứ 3 -> bị tống vào kiểm toán, stopped=true', () => {
    const room = createRoom('p1');
    const player = room.players[0]!;
    player.position = 15;
    player.consecutiveDoubles = 2;

    const res = processRollDoubles(room, player, { die1: 5, die2: 5, total: 10, isDouble: true });
    expect(res.stopped).toBe(true);
    expect(player.position).toBe(10);
    expect(player.auditTurnsLeft).toBe(3);
    expect(player.consecutiveDoubles).toBe(0);
    expect(res.result).toBeDefined();
    expect(res.result?.player.position).toBe(10);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
    expect(res.result?.passedGo).toBe(false);
    expect(res.result?.rentCharged).toBe(0);
  });
});
