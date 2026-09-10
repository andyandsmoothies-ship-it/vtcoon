// [TC-GAME-001..003/MSS] Doubles Rule & FSM Auto-transition Tests
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';

describe('[TC-GAME-001..003/MSS] Doubles Rule & FSM Auto-transition', () => {
  it('đổ đôi lần 1: tăng consecutiveDoubles lên 1 và cho phép tung xúc xắc tiếp sau khi mua đất', () => {
    // Luôn ra 1-1 (tổng 2, đôi)
    let rollCount = 0;
    // Lần 1: ra 2-2 (tổng 4) -> Ô 4 (Lệ phí đất đai / Tax) -> phase là PropertyManagement
    // Lần 2: ra 2-2 (tổng 4) -> Ô 8 (Đồng Nai) -> unowned -> ActionPhase -> mua đất -> PropertyManagement
    const diceSequence = [
      0.2, 0.2, // 2, 2 -> tổng 4
      0.2, 0.2, // 2, 2 -> tổng 4
    ];
    const rng = () => diceSequence[rollCount++] ?? 0.2;
    const mgr = new RoomManager(rng);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    const roll1 = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll1).toBeDefined();
    expect(roll1?.dice.isDouble).toBe(true);
    expect(roll1?.dice.total).toBe(4);
    expect(room.players[0]!.consecutiveDoubles).toBe(1);
    expect(room.players[0]!.position).toBe(4);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    // Có thể tung tiếp lượt thứ 2 do đổ đôi và phase là PropertyManagement
    const roll2 = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll2).toBeDefined();
    expect(roll2?.dice.isDouble).toBe(true);
    expect(room.players[0]!.consecutiveDoubles).toBe(2);
    expect(room.players[0]!.position).toBe(8);
  });

  it('đổ đôi 3 lần liên tiếp: tống vào Ô 10 (Trạm Kiểm Toán) và phong tỏa lượt', () => {
    // 3 lần đổ đôi:
    // Lần 1: ra 2-2 (tổng 4) -> Ô 4 (Tax, PropertyManagement)
    // Lần 2: ra 3-3 (tổng 6) -> Ô 10 (Ghé thăm Trạm kiểm toán bình thường -> PropertyManagement)
    // Lần 3: ra 1-1 (tổng 2) -> Đổ đôi lần 3 -> Bị tống giam vào Ô 10, auditTurnsLeft = 3
    const diceValues = [
      0.2, 0.2, // die1=2, die2=2 (tổng 4)
      0.4, 0.4, // die1=3, die2=3 (tổng 6)
      0.0, 0.0, // die1=1, die2=1 (tổng 2)
    ];
    let diceActive = false;
    let idx = 0;
    const rng = () => {
      if (!diceActive) return 0.5;
      return diceValues[idx++] ?? 0.0;
    };
    const mgr = new RoomManager(rng);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    diceActive = true;

    // Lần 1
    const r1 = mgr.handleRollDice(room.roomCode, 'p1');
    expect(r1?.dice.isDouble).toBe(true);
    expect(room.players[0]!.position).toBe(4);
    expect(room.players[0]!.consecutiveDoubles).toBe(1);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    // Lần 2
    const r2 = mgr.handleRollDice(room.roomCode, 'p1');
    expect(r2?.dice.isDouble).toBe(true);
    expect(room.players[0]!.position).toBe(10);
    expect(room.players[0]!.consecutiveDoubles).toBe(2);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    // Lần 3 -> Đổ đôi lần 3: tống vào Trạm Kiểm Toán Ô 10
    const r3 = mgr.handleRollDice(room.roomCode, 'p1');
    expect(r3).toBeDefined();
    expect(r3?.dice.isDouble).toBe(true);
    expect(room.players[0]!.position).toBe(10);
    expect(room.players[0]!.auditTurnsLeft).toBe(3);
    expect(room.players[0]!.consecutiveDoubles).toBe(0);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    // Không thể tung tiếp lần thứ 4
    const r4 = mgr.handleRollDice(room.roomCode, 'p1');
    expect(r4).toBeUndefined();
  });

  it('đang ở Trạm Kiểm Toán: đổ ra xúc xắc đôi -> tự động rời trạm và di chuyển', () => {
    // Luôn ra 1-1 (đôi)
    const rng = () => 0;
    const mgr = new RoomManager(rng);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 10;
    room.players[0]!.auditTurnsLeft = 3;

    // Tung xúc xắc trong Trạm khi đang ở WaitingRoll
    const roll = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll).toBeDefined();
    expect(roll?.dice.isDouble).toBe(true);
    expect(room.players[0]!.auditTurnsLeft).toBe(0);
    expect(room.players[0]!.consecutiveDoubles).toBe(0);
    // Ô 10 + 2 = Ô 12 (EVN)
    expect(room.players[0]!.position).toBe(12);
  });

  it('đang ở Trạm Kiểm Toán: đổ không ra đôi -> bị giữ lại, trả về undefined, chuyển sang PropertyManagement', () => {
    // Seed 42 không ra đôi
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 10;
    room.players[0]!.auditTurnsLeft = 2;

    const roll = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll).toBeDefined();
    expect(roll?.player.position).toBe(10);
    expect(room.players[0]!.position).toBe(10);
    expect(room.players[0]!.auditTurnsLeft).toBe(2);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    // Sau đó kết thúc lượt -> giảm còn 1
    mgr.handleEndTurn(room.roomCode, 'p1');
    expect(room.players[0]!.auditTurnsLeft).toBe(1);
  });

  it('Auto-transition: người chơi có skipNextTurn=true tự động chuyển sang PropertyManagement', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    // Cài đặt P2 có skipNextTurn = true
    room.players[1]!.skipNextTurn = true;

    // P1 roll và kết thúc lượt
    mgr.handleRollDice(room.roomCode, 'p1');
    mgr.handleEndTurn(room.roomCode, 'p1');

    // Tới lượt P2: skipNextTurn phải tự động reset về false và phase thành PropertyManagement
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.players[1]!.skipNextTurn).toBe(false);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    // P2 cố tình gọi handleRollDice -> bị chặn tuyệt đối (trả về undefined)
    const illegalRoll = mgr.handleRollDice(room.roomCode, 'p2');
    expect(illegalRoll).toBeUndefined();

    // P2 kết thúc lượt hợp lệ
    const nextTurn = mgr.handleEndTurn(room.roomCode, 'p2');
    expect(nextTurn).toBeDefined();
    expect(room.currentPlayerIndex).toBe(0);
  });

  it('đổ đôi: kết thúc quản lý tài sản với continueDoubles chuyển về WaitingRoll cho cùng người chơi, khi đổ không đôi mới đổi lượt', () => {
    let diceActive = false;
    let rollCount = 0;
    // Roll 1: 0.2, 0.2 -> 2, 2 (tổng 4, Ô 4 Lệ phí đất đai)
    // Roll 2: 0.2, 0.5 -> 2, 4 (tổng 6, Ô 10 Trạm kiểm toán)
    const diceVals = [0.2, 0.2, 0.2, 0.5];
    const rng = () => {
      if (!diceActive) return 0.5;
      return diceVals[rollCount++] ?? 0.5;
    };
    const mgr = new RoomManager(rng);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    diceActive = true;

    mgr.handleRollDice(room.roomCode, 'p1');
    expect(room.players[0]!.consecutiveDoubles).toBe(1);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    // Sau khi kết thúc giai đoạn quản lý tài sản, chuyển về WaitingRoll cho lượt phụ
    mgr.handleEndTurn(room.roomCode, 'p1', true);
    expect(room.currentPlayerIndex).toBe(0);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
    expect(room.players[0]!.consecutiveDoubles).toBe(1);

    // p1 thực hiện lượt phụ: đổ không ra đôi -> consecutiveDoubles về 0
    const roll2 = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll2?.dice.isDouble).toBe(false);
    expect(room.players[0]!.consecutiveDoubles).toBe(0);

    // p1 kết thúc lượt -> chuyển sang p2
    mgr.handleEndTurn(room.roomCode, 'p1');
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });
});
