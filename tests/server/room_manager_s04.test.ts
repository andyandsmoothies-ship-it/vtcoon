// [TC-04.1..TC-04.4/MSS] RoomManager Acceptance Tests — Slice 04
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';
import { MarketCardId, ChanceCardId, RESORT_CELLS, COASTAL_CELLS } from '../../src/domain/event_card_engine';

function setup(rng = () => 0) {
  const mgr = new RoomManager(rng);
  const room = mgr.createRoom('p1');
  mgr.joinRoom(room.roomCode, 'p2'); mgr.joinRoom(room.roomCode, 'p3');
  mgr.startGame(room.roomCode);
  const reg = (mgr as any).registries.get(room.roomCode) as Map<number, string>;
  const sm = (mgr as any).propertyStates.get(room.roomCode) as Map<number, { level: number }>;
  return { mgr, room, reg, sm };
}

describe('[TC-04.1/MSS] MC_FIRE_INSPECTION (Thanh Tra PCCC)', () => {
  it('rút MC_FIRE_INSPECTION trừ tiền công trình của B, không trừ A và C, đẩy thẻ vào discard', () => {
    const { mgr, room, reg, sm } = setup(() => 0); // dice=2 -> dừng ô 02 (Market)
    room.marketDeck = [MarketCardId.MC_FIRE_INSPECTION, ...room.marketDeck.filter((c) => c !== MarketCardId.MC_FIRE_INSPECTION)];
    reg.set(1, 'p2'); sm.set(1, { level: 1 }); reg.set(3, 'p2'); sm.set(3, { level: 1 }); reg.set(6, 'p2'); sm.set(6, { level: 2 });
    mgr.handleRollDice(room.roomCode, 'p1');
    expect(room.marketDeck).toHaveLength(15);
    expect(room.marketDiscard).toContain(MarketCardId.MC_FIRE_INSPECTION);
    expect(room.players[0]!.balance).toBe(15000); expect(room.players[2]!.balance).toBe(15000);
    expect(room.players[1]!.balance).toBe(15000 - 800); // 2*200 + 1*400 = 800
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });
});

describe('[TC-04.2/MSS] Ma Trận Ưu Tiên Modifier (Mùa Du Lịch & Bão Duyên Hải)', () => {
  it('Kịch bản A: MC_PEAK_TOURISM nhân đôi tiền thuê ô 11, tự xóa khi hoàn thành 1 round', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(11, 'p1'); sm.set(11, { level: 1 }); // rent1 = 420
    room.activeModifiers = [{ type: MarketCardId.MC_PEAK_TOURISM, remainingRounds: 1, affectedCells: RESORT_CELLS, multiplier: 2 }];
    room.currentPlayerIndex = 1; room.players[1]!.position = 9; room.players[1]!.balance = 10000;
    mgr.handleRollDice(room.roomCode, 'p2');
    expect(room.players[1]!.balance).toBe(10000 - 840);
    // P2 hết lượt -> chuyển sang P3 (chưa hết round) -> modifier vẫn còn hiệu lực
    mgr.handleEndTurn(room.roomCode, 'p2');
    expect(room.currentPlayerIndex).toBe(2);
    expect(room.activeModifiers).toHaveLength(1);

    // P3 hết lượt -> quay lại P1 (hoàn thành 1 round) -> modifier hết hạn
    room.phase = TurnPhase.PropertyManagement;
    mgr.handleEndTurn(room.roomCode, 'p3');
    expect(room.currentPlayerIndex).toBe(0);
    expect(room.activeModifiers).toHaveLength(0);
  });
  it('Kịch bản B: MC_COASTAL_STORM miễn phí thuê ô 14 duyên hải (chủ nhà không nhận tiền)', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(14, 'p1'); sm.set(14, { level: 2 }); // rent2 = 1280
    room.activeModifiers = [{ type: MarketCardId.MC_COASTAL_STORM, remainingRounds: 1, affectedCells: COASTAL_CELLS, multiplier: 0 }];
    room.currentPlayerIndex = 1; room.players[1]!.position = 12; room.players[1]!.balance = 8000;
    mgr.handleRollDice(room.roomCode, 'p2');
    expect(room.players[1]!.balance).toBe(8000); expect(room.players[0]!.balance).toBe(15000);
  });
  it('Kịch bản C: xung đột đồng thời tại ô 11 -> Zero-rent thắng tuyệt đối', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(11, 'p1'); sm.set(11, { level: 1 });
    room.activeModifiers = [
      { type: MarketCardId.MC_PEAK_TOURISM, remainingRounds: 1, affectedCells: RESORT_CELLS, multiplier: 2 },
      { type: MarketCardId.MC_COASTAL_STORM, remainingRounds: 1, affectedCells: COASTAL_CELLS, multiplier: 0 },
    ];
    room.currentPlayerIndex = 1; room.players[1]!.position = 9; room.players[1]!.balance = 10000;
    mgr.handleRollDice(room.roomCode, 'p2');
    expect(room.players[1]!.balance).toBe(10000); expect(room.players[0]!.balance).toBe(15000);
  });
});

describe('[TC-04.3/MSS] Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)', () => {
  it('Kịch bản A, B, C, D, E: tỷ lệ lời/lỗ và kiểm tra biên cược HOSE', () => {
    let rngVal = 0.05; // face = 1 (x0.50)
    const { mgr, room } = setup(() => rngVal);
    room.phase = TurnPhase.HosePhase; room.players[0]!.balance = 5000;
    mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_INVEST', stake: 2000 });
    expect(room.players[0]!.balance).toBe(4000); // 5000 - 2000 + 1000
    rngVal = 0.95; room.phase = TurnPhase.HosePhase; room.players[0]!.balance = 5000; // face = 6 (x2.00)
    mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_INVEST', stake: 2000 });
    expect(room.players[0]!.balance).toBe(7000); // 5000 - 2000 + 4000
    room.phase = TurnPhase.HosePhase;
    expect(mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_INVEST', stake: 400 })).toMatchObject({ success: false, reason: 'INVALID_STAKE' }); expect(room.phase).toBe(TurnPhase.HosePhase);
    expect(mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_INVEST', stake: 3500 })).toMatchObject({ success: false, reason: 'INVALID_STAKE' });
    room.players[0]!.balance = 1500;
    expect(mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_INVEST', stake: 2000 })).toMatchObject({ success: false, reason: 'INSUFFICIENT_FUNDS' });
  });
});

describe('[TC-04.4/MSS] Rút Phiếu Cơ Hội & Hiệu Ứng Cá Nhân', () => {
  it('Kịch bản A (CC_STOCK_PROFIT) & Kịch bản B (CC_DIPLOMATIC)', () => {
    const { mgr, room } = setup(); // roll 2 -> ô 07
    room.chanceDeck = [ChanceCardId.CC_STOCK_PROFIT, ...room.chanceDeck.filter((c) => c !== ChanceCardId.CC_STOCK_PROFIT)];
    room.players[0]!.position = 5; room.players[0]!.balance = 5000;
    mgr.handleRollDice(room.roomCode, 'p1');
    expect(room.players[0]!.balance).toBe(7500); expect(room.chanceDeck).toHaveLength(19);
    expect(room.chanceDiscard).toContain(ChanceCardId.CC_STOCK_PROFIT);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);

    room.chanceDeck = [ChanceCardId.CC_DIPLOMATIC, ...room.chanceDeck.filter((c) => c !== ChanceCardId.CC_DIPLOMATIC)];
    room.players[0]!.position = 20; room.phase = TurnPhase.WaitingRoll;
    mgr.handleRollDice(room.roomCode, 'p1');
    expect(room.players[0]!.position).toBe(22);
    expect(room.players[0]!.hand).toContain(ChanceCardId.CC_DIPLOMATIC);
    expect(room.players[0]!.balance).toBe(7500); expect(room.chanceDeck).toHaveLength(18);
    expect(room.chanceDiscard).not.toContain(ChanceCardId.CC_DIPLOMATIC);
  });

  it('Kịch bản C (CC_TAX_AUDIT): Phạt 200 Tr./ô đất trống Cấp 0, không bắt vào Trạm Kiểm Toán', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(1, 'p1'); // ô 1 Cấp 0
    reg.set(3, 'p1'); sm.set(3, { level: 1 }); // ô 3 Cấp 1 (đã xây, không phạt)
    reg.set(6, 'p1'); // ô 6 Cấp 0 -> tổng 2 ô Cấp 0 phạt 400 Tr.
    room.chanceDeck = [ChanceCardId.CC_TAX_AUDIT, ...room.chanceDeck.filter((c) => c !== ChanceCardId.CC_TAX_AUDIT)];
    room.players[0]!.position = 5; room.players[0]!.balance = 10000;
    mgr.handleRollDice(room.roomCode, 'p1');
    expect(room.players[0]!.position).toBe(7); // Dừng tại ô 7 (Chance)
    expect(room.players[0]!.auditTurnsLeft).toBe(0); // Không bị tống giam
    expect(room.players[0]!.balance).toBe(10000 - 400);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('Kịch bản D & E: CC_OVERDRAFT (+3.000) & CC_FREE_CREDIT (+2.000) cộng tiền mặt và lưu pendingDebts', () => {
    const { mgr, room } = setup();
    room.chanceDeck = [ChanceCardId.CC_OVERDRAFT, ...room.chanceDeck.filter((c) => c !== ChanceCardId.CC_OVERDRAFT)];
    room.players[0]!.position = 5; room.players[0]!.balance = 5000;
    mgr.handleRollDice(room.roomCode, 'p1');
    expect(room.players[0]!.balance).toBe(8000); // 5000 + 3000
    expect(room.players[0]!.pendingDebts).toContain(ChanceCardId.CC_OVERDRAFT);

    room.chanceDeck = [ChanceCardId.CC_FREE_CREDIT, ...room.chanceDeck.filter((c) => c !== ChanceCardId.CC_FREE_CREDIT)];
    room.players[0]!.position = 20; room.phase = TurnPhase.WaitingRoll;
    mgr.handleRollDice(room.roomCode, 'p1');
    expect(room.players[0]!.balance).toBe(10000); // 8000 + 2000
    expect(room.players[0]!.pendingDebts).toContain(ChanceCardId.CC_FREE_CREDIT);
    expect(room.players[0]!.pendingDebts).toHaveLength(2);
  });

  it('Kịch bản F: Dẫm BĐS đối thủ với CC_DIPLOMATIC trong hand -> miễn 100% tiền thuê, thẻ vào discard', () => {
    const { mgr, room, reg, sm } = setup();
    reg.set(11, 'p2'); sm.set(11, { level: 2 }); // rent2 = 1120
    room.players[0]!.hand = [ChanceCardId.CC_DIPLOMATIC];
    room.players[0]!.position = 9; room.players[0]!.balance = 10000;
    const p2Start = room.players[1]!.balance;

    mgr.handleRollDice(room.roomCode, 'p1'); // 9 + 2 = 11
    expect(room.players[0]!.position).toBe(11);
    expect(room.players[0]!.balance).toBe(10000); // Không mất tiền
    expect(room.players[1]!.balance).toBe(p2Start); // Chủ nhà không nhận tiền
    expect(room.players[0]!.hand).not.toContain(ChanceCardId.CC_DIPLOMATIC);
    expect(room.chanceDiscard).toContain(ChanceCardId.CC_DIPLOMATIC);
  });
});

describe('[TC-04.5/EDGE] Tái Thiết Lập Deck Khi Rỗng Từ Discard Pile (Fisher-Yates)', () => {
  it('marketDeck rỗng -> tái tạo và xáo trộn từ marketDiscard', () => {
    const { mgr, room } = setup(); // roll 2 -> ô 02 (Market)
    room.marketDeck = [];
    room.marketDiscard = [MarketCardId.MC_PEAK_TOURISM, MarketCardId.MC_COASTAL_STORM, MarketCardId.MC_FIRE_INSPECTION];
    mgr.handleRollDice(room.roomCode, 'p1');
    // Đã rút 1 thẻ từ discard, deck còn lại 2 thẻ
    expect(room.marketDeck).toHaveLength(2);
    expect(room.marketDiscard).toHaveLength(1);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('chanceDeck rỗng -> tái tạo và xáo trộn từ chanceDiscard', () => {
    const { mgr, room } = setup(); // roll 2 -> ô 07 (Chance khi pos=5)
    room.players[0]!.position = 5;
    room.chanceDeck = [];
    room.chanceDiscard = [ChanceCardId.CC_STOCK_PROFIT, ChanceCardId.CC_TAX_AUDIT];
    mgr.handleRollDice(room.roomCode, 'p1');
    expect(room.chanceDeck).toHaveLength(1);
    expect(room.chanceDiscard).toHaveLength(1);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });
});

describe('[TC-04.6/EDGE] Nhiều Đối Thủ Dẫm Liên Tiếp BĐS Dịch Vụ C2', () => {
  it('nhiều người dẫm ô Dịch vụ C2 lần lượt: chẵn nộp phụ phí 200, lẻ không phụ thu', () => {
    let rngVal = 0.2; // die = 2, total = 4; C2 1D6 = 2 (chẵn -> +200)
    const { mgr, room, reg, sm } = setup(() => rngVal);

    // P1 sở hữu ô 6 cấp 2 (Oriental Avenue, Service, rent2 = 1000)
    reg.set(6, 'p1');
    sm.set(6, { level: 2 });
    const p1Start = room.players[0]!.balance; // 15000

    // P2 bắt đầu từ ô 2, đổ xúc xắc total = 4 -> dừng tại ô 6
    room.currentPlayerIndex = 1;
    room.players[1]!.position = 2;
    room.players[1]!.balance = 10000;
    mgr.handleRollDice(room.roomCode, 'p2');
    // Rent2 = 1000, surcharge = 200 (chẵn) -> trừ 1200
    expect(room.players[1]!.balance).toBe(10000 - 1200);
    expect(room.players[0]!.balance).toBe(p1Start + 1200);

    // P2 kết thúc lượt -> FSM chuyển sang P3 ở WaitingRoll
    mgr.handleEndTurn(room.roomCode, 'p2');
    expect(room.currentPlayerIndex).toBe(2);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);

    // P3: rngVal = 0.4 -> die = 3, total = 6; C2 1D6 = 3 (lẻ -> không phụ phí)
    rngVal = 0.4;
    room.players[2]!.position = 0; // 0 + 6 = 6
    room.players[2]!.balance = 10000;
    mgr.handleRollDice(room.roomCode, 'p3');
    // Rent2 = 1000, surcharge = 0 (lẻ) -> trừ 1000
    expect(room.players[2]!.balance).toBe(10000 - 1000);
    expect(room.players[0]!.balance).toBe(p1Start + 1200 + 1000);
  });
});

