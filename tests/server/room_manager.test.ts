// [TC-01.1..TC-01.5/MSS] RoomManager FSM — Acceptance Test Contracts
// Traceability: UC-GAME-001..003, UC-GAME-005, UC-GAME-007, UC-GAME-008 / MSS

import { describe, test, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase, BOARD_SIZE, GO_BONUS, INITIAL_BALANCE } from '../../src/domain/room';
import { MarketCardId, ChanceCardId, RESORT_CELLS } from '../../src/domain/event_card_engine';

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

    // Khong the ket thuc luot khi chua do xuc xac (phase = WaitingRoll)
    expect(mgr.handleEndTurn(room.roomCode, 'p1')).toBeUndefined();

    // p1 do xuc xac: currentPlayerIndex van la 0, phase dung o ActionPhase hoac PropertyManagement
    const rollRes = mgr.handleRollDice(room.roomCode, 'p1');
    expect(rollRes).toBeDefined();
    expect(room.currentPlayerIndex).toBe(0);
    expect(
      room.phase === TurnPhase.ActionPhase || room.phase === TurnPhase.PropertyManagement
    ).toBe(true);

    // p2 khong the ket thuc luot thay p1
    expect(mgr.handleEndTurn(room.roomCode, 'p2')).toBeUndefined();

    // p1 ket thuc luot hop le: chuyen sang p2, phase tro lai WaitingRoll
    const updated = mgr.handleEndTurn(room.roomCode, 'p1');
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
    mgr.handleEndTurn(room.roomCode, 'p1');
    mgr.handleRollDice(room.roomCode, 'p2');
    mgr.handleEndTurn(room.roomCode, 'p2');
    mgr.handleRollDice(room.roomCode, 'p3');
    mgr.handleEndTurn(room.roomCode, 'p3');
    const r = mgr.getRoom(room.roomCode);
    expect(r).toBeDefined();
    if (r === undefined) return;
    expect(r.currentPlayerIndex).toBe(0);
  });
});

describe('[TC-04.T5/MSS] Server Handlers: HOSE, Trạm Kiểm Toán & Tile Landing', () => {
  test('[TC-04.T5/MSS] handleRollDice dừng tại ô 38 -> room.phase chuyển sang HosePhase', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.players[0]!.position = 31; // 31 + 7 = 38 (Hose)
    mgr.handleRollDice(room.roomCode, 'p1');
    expect(room.players[0]!.position).toBe(38);
    expect(room.phase).toBe(TurnPhase.HosePhase);
  });

  test('[TC-04.T5/MSS] INTENT_INVEST stake=2000, face=6 -> balance tăng đúng tỷ lệ x2.00', () => {
    const mgr = new RoomManager(() => 0.99); // face = floor(0.99*6)+1 = 6
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.phase = TurnPhase.HosePhase;
    const initialBalance = room.players[0]!.balance;
    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_INVEST', stake: 2000 });
    expect(res.success).toBe(true);
    expect(room.players[0]!.balance).toBe(initialBalance + 2000);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  test('[TC-04.T5/MSS] INTENT_INVEST stake=400 -> từ chối INVALID_STAKE', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.phase = TurnPhase.HosePhase;
    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_INVEST', stake: 400 });
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_STAKE');
    expect(room.phase).toBe(TurnPhase.HosePhase);
  });

  test('[TC-04.T5/MSS] INTENT_INVEST stake=3500 -> từ chối INVALID_STAKE', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.phase = TurnPhase.HosePhase;
    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_INVEST', stake: 3500 });
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_STAKE');
    expect(room.phase).toBe(TurnPhase.HosePhase);
  });

  test('[TC-04.T5/MSS] INTENT_INVEST balance=1500, stake=2000 -> từ chối INSUFFICIENT_FUNDS', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.phase = TurnPhase.HosePhase;
    room.players[0]!.balance = 1500;
    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_INVEST', stake: 2000 });
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INSUFFICIENT_FUNDS');
  });

  test('[TC-04.T5/MSS] INTENT_SKIP tại HosePhase -> chuyển sang PropertyManagement', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.phase = TurnPhase.HosePhase;
    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_SKIP' });
    expect(res.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  test('[TC-04.T5/MSS] handleRollDice dừng ô 30 (TaxOrder) -> chuyển đến ô 10, auditTurnsLeft=3', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.players[0]!.position = 23; // 23 + 7 = 30 (TaxOrder)
    const result = mgr.handleRollDice(room.roomCode, 'p1');
    expect(result?.player.position).toBe(10);
    expect(room.players[0]!.position).toBe(10);
    expect(room.players[0]!.auditTurnsLeft).toBe(3);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  test('[TC-04.T5/MSS] INTENT_BAIL_OUT balance=600 -> trừ 500, auditTurnsLeft=0', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.players[0]!.auditTurnsLeft = 3;
    room.players[0]!.balance = 600;
    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_BAIL_OUT' });
    expect(res.success).toBe(true);
    expect(room.players[0]!.balance).toBe(100);
    expect(room.players[0]!.auditTurnsLeft).toBe(0);
  });

  test('[TC-04.T5/MSS] INTENT_BAIL_OUT balance=400 -> từ chối INSUFFICIENT_FUNDS', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.players[0]!.auditTurnsLeft = 3;
    room.players[0]!.balance = 400;
    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_BAIL_OUT' });
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INSUFFICIENT_FUNDS');
    expect(room.players[0]!.balance).toBe(400);
    expect(room.players[0]!.auditTurnsLeft).toBe(3);
  });

  test('[TC-04.T5/MSS] handleTurnStart khi skipNextTurn=true -> reset false, canRoll=false', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.players[0]!.skipNextTurn = true;
    const res = mgr.handleTurnStart(room.roomCode, 'p1');
    expect(res.canRoll).toBe(false);
    expect(res.reason).toBe('SKIPPED_BY_SERVICE_C3');
    expect(room.players[0]!.skipNextTurn).toBe(false);
  });

  test('[TC-04.T5/MSS] handleEndTurn gọi decayModifiers khi hoàn thành trọn vẹn 1 vòng (Round) và giảm auditTurnsLeft', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.players[0]!.auditTurnsLeft = 3;
    room.activeModifiers = [
      { type: MarketCardId.MC_PEAK_TOURISM, affectedCells: RESORT_CELLS, remainingRounds: 1 },
    ];
    room.phase = TurnPhase.PropertyManagement;
    mgr.handleEndTurn(room.roomCode, 'p1');
    expect(room.players[0]!.auditTurnsLeft).toBe(2);
    // P1 hết lượt -> lượt sang P2 (chưa hết 1 Round) -> modifier vẫn còn hiệu lực
    expect(room.activeModifiers).toHaveLength(1);
    expect(room.currentPlayerIndex).toBe(1);

    // P2 hết lượt -> quay lại index 0 (kết thúc 1 Round) -> decayModifiers được kích hoạt
    room.phase = TurnPhase.PropertyManagement;
    mgr.handleEndTurn(room.roomCode, 'p2');
    expect(room.currentPlayerIndex).toBe(0);
    expect(room.activeModifiers).toHaveLength(0);
  });

  test('[TC-04.T5/MSS] Thẻ CC_DIPLOMATIC miễn tiền thuê BĐS đối thủ khi dẫm vào qua handleRollDice', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    const reg = (mgr as any).registries.get(room.roomCode) as Map<number, string>;
    const sm = (mgr as any).propertyStates.get(room.roomCode) as Map<number, { level: number }>;
    // P2 sở hữu ô 1 Cần Thơ (Cấp 1 Shophouse, rent1 = 210)
    reg.set(1, 'p2');
    sm.set(1, { level: 1 });
    // P1 có CC_DIPLOMATIC trên tay
    room.players[0]!.hand = [ChanceCardId.CC_DIPLOMATIC];
    room.players[0]!.position = 34; // roll 7 -> pos 1
    const p1Bal = room.players[0]!.balance;
    const rollRes = mgr.handleRollDice(room.roomCode, 'p1');
    expect(rollRes?.player.position).toBe(1);
    expect(rollRes?.rentCharged).toBe(0);
    expect(room.players[0]!.hand).not.toContain(ChanceCardId.CC_DIPLOMATIC);
    expect(room.chanceDiscard).toContain(ChanceCardId.CC_DIPLOMATIC);
    // Nhận 2000 GO bonus, không bị trừ 210 tiền thuê
    expect(room.players[0]!.balance).toBe(p1Bal + 2000);
  });

  test('[TC-04.T5/MSS] Thẻ CC_DIPLOMATIC không bị tiêu thụ khi dẫm vào Hạ tầng Giao thông (Railroad) đối thủ', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    const reg = (mgr as any).registries.get(room.roomCode) as Map<number, string>;
    // P2 sở hữu ô 5 Reading Railroad (fee = 500)
    reg.set(5, 'p2');
    // P1 có CC_DIPLOMATIC trên tay
    room.players[0]!.hand = [ChanceCardId.CC_DIPLOMATIC];
    room.players[0]!.position = 38; // roll 7 -> pos 5 (38+7)%40 = 5
    const p1Bal = room.players[0]!.balance;
    const rollRes = mgr.handleRollDice(room.roomCode, 'p1');
    expect(rollRes?.player.position).toBe(5);
    expect(rollRes?.rentCharged).toBe(500);
    // CC_DIPLOMATIC vẫn còn trên tay, không bị đẩy vào chanceDiscard
    expect(room.players[0]!.hand).toContain(ChanceCardId.CC_DIPLOMATIC);
    expect(room.chanceDiscard).not.toContain(ChanceCardId.CC_DIPLOMATIC);
    // Nhận 2000 GO bonus, trừ 500 phí lưu thông
    expect(room.players[0]!.balance).toBe(p1Bal + 2000 - 500);
  });
});

describe('[TC-04.T5-UC047/MSS] Trạm Kiểm Toán Visiting & Turn Start Contract', () => {
  test('[TC-04.T5-UC047/MSS] handleRollDice dừng tại ô 10 khi auditTurnsLeft=0 -> visiting only, canRoll=true', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.players[0]!.position = 3; // 3 + 7 = 10 (Audit)
    room.players[0]!.auditTurnsLeft = 0;
    const result = mgr.handleRollDice(room.roomCode, 'p1');
    expect(result?.player.position).toBe(10);
    expect(room.players[0]!.auditTurnsLeft).toBe(0);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
    const turnStart = mgr.handleTurnStart(room.roomCode, 'p1');
    expect(turnStart.canRoll).toBe(true);
  });

  test('[TC-04.T5-UC047/MSS] handleTurnStart khi auditTurnsLeft=0 -> canRoll=true', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.players[0]!.auditTurnsLeft = 0;
    const res = mgr.handleTurnStart(room.roomCode, 'p1');
    expect(res.canRoll).toBe(true);
  });

  test('[TC-04.T5/MSS] handleTurnStart khi skipNextTurn=true -> phase chuyển sang PropertyManagement và kết thúc lượt thành công', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.players[0]!.skipNextTurn = true;
    const res = mgr.handleTurnStart(room.roomCode, 'p1');
    expect(res.canRoll).toBe(false);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
    const endRes = mgr.handleEndTurn(room.roomCode, 'p1');
    expect(endRes).toBeDefined();
    expect(room.currentPlayerIndex).toBe(1);
  });

  test('[TC-04.T5/MSS] handleTurnStart khi auditTurnsLeft>0 -> phase chuyển sang PropertyManagement và phục vụ thụ án thụ động', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.players[0]!.auditTurnsLeft = 2;
    const startRes = mgr.handleTurnStart(room.roomCode, 'p1');
    expect(startRes.canRoll).toBe(false);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
    const endRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_END_TURN' });
    expect(endRes.success).toBe(true);
    expect(room.players[0]!.auditTurnsLeft).toBe(1);
  });

  test('[TC-04.T5/MSS] handleRollDice bị phong tỏa (trả về undefined) khi auditTurnsLeft>0 hoặc skipNextTurn=true', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.players[0]!.auditTurnsLeft = 2;
    const roll1 = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll1).toBeUndefined();

    room.players[0]!.auditTurnsLeft = 0;
    room.players[0]!.skipNextTurn = true;
    const roll2 = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll2).toBeUndefined();
  });

  test('[TC-04.T5/MSS] INTENT_BAIL_OUT thành công -> phase chuyển sang WaitingRoll để có thể tung xúc xắc', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.players[0]!.auditTurnsLeft = 3;
    room.players[0]!.balance = 600;
    mgr.handleTurnStart(room.roomCode, 'p1');
    const bailRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_BAIL_OUT' });
    expect(bailRes.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
    const roll = mgr.handleRollDice(room.roomCode, 'p1');
    expect(roll).toBeDefined();
  });

  test('[TC-04.T5/MSS] INTENT_BAIL_OUT là phương thức duy nhất để giải cứu Trạm Kiểm Toán đầu lượt', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.players[0]!.auditTurnsLeft = 2;
    room.players[0]!.balance = 10000;
    mgr.handleTurnStart(room.roomCode, 'p1');
    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_BAIL_OUT' });
    expect(res.success).toBe(true);
    expect(room.players[0]!.balance).toBe(10000 - 500);
    expect(room.players[0]!.auditTurnsLeft).toBe(0);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });

  test('[TC-04.T5/MSS] INTENT_INVEST stake không phải số nguyên -> từ chối INVALID_STAKE', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.phase = TurnPhase.HosePhase;
    const res = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_INVEST', stake: 1000.5 });
    expect(res.success).toBe(false);
    expect(res.reason).toBe('INVALID_STAKE');
  });

  test('[TC-04.T5/MSS] INTENT_BAIL_OUT trong lượt sau khi dẫm ô TaxOrder -> chuyển PropertyManagement và cho phép INTENT_END_TURN', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);
    room.players[0]!.position = 23;
    mgr.handleRollDice(room.roomCode, 'p1');
    expect(room.players[0]!.position).toBe(10);
    expect(room.players[0]!.auditTurnsLeft).toBe(3);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    const bailRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_BAIL_OUT' });
    expect(bailRes.success).toBe(true);
    expect(room.players[0]!.auditTurnsLeft).toBe(0);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    const rollAgain = mgr.handleRollDice(room.roomCode, 'p1');
    expect(rollAgain).toBeUndefined();

    const endRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_END_TURN' });
    expect(endRes.success).toBe(true);
    expect(room.currentPlayerIndex).toBe(1);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);
  });
});

