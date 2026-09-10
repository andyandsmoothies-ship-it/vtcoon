// [UC-GAME-045/MSS][UC-GAME-052/MSS][DEBT-S06-02] Rate Hike, HOSE Stock Market & Overdraft Test Suite
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types';
import { getMortgageInterestRate, collectMortgageInterest } from '../../src/server/mortgage_manager';
import { handleHoseInvest, handleHoseSkip } from '../../src/server/hose_actions';
import { resolveHoseInvestment } from '../../src/domain/event_card_engine';

function setup(rng = () => 0) {
  const mgr = new RoomManager(rng);
  const room = mgr.createRoom('p1');
  mgr.joinRoom(room.roomCode, 'p2');
  mgr.startGame(room.roomCode);
  const reg = (mgr as any).registries.get(room.roomCode) as Map<number, string>;
  const sm = (mgr as any).propertyStates.get(room.roomCode) as Map<number, { level: number }>;
  return { mgr, room, reg, sm };
}

describe('[UC-GAME-052/MSS] MC_RATE_HIKE Lãi Suất Thế Chấp Vĩ Mô', () => {
  it('Lãi suất thế chấp bình thường là 5%, khi có MC_RATE_HIKE tự động tăng lên 10%', () => {
    const { room } = setup();
    expect(getMortgageInterestRate(room), 'Lãi suất mặc định là 5%').toBe(0.05);

    // Kích hoạt thẻ vĩ mô MC_RATE_HIKE
    room.activeModifiers = [
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 1 },
    ];
    expect(getMortgageInterestRate(room), 'Khi có MC_RATE_HIKE, lãi suất tăng vọt lên 10%').toBe(0.10);
  });

  it('Thu lãi suất thế chấp khi vượt GO: trích đúng 10% tổng dư nợ thế chấp nộp vào Kho Bạc', () => {
    const { room } = setup();
    const p1 = room.players[0]!;

    // P1 thế chấp Ô 39 (Tràng Tiền, giá 4000, giá trị thế chấp 2000)
    p1.mortgagedProperties = [39];
    p1.mortgageLoans = { 39: 2000 };
    p1.balance = 5000;
    room.treasury = 2000;

    // Kích hoạt thẻ MC_RATE_HIKE (10% lãi suất)
    room.activeModifiers = [
      { type: MarketCardId.MC_RATE_HIKE, affectedCells: [], remainingRounds: 1 },
    ];

    collectMortgageInterest(room, 'p1');

    // Dư nợ 2000 * 10% = 200 Tr.
    expect(p1.balance, 'Bị trừ đúng 200 Tr. tiền lãi thế chấp: 5000 - 200 = 4800').toBe(4800);
    expect(room.treasury, 'Kho Bạc nhận đủ 200 Tr. tiền lãi: 2000 + 200 = 2200').toBe(2200);
  });
});

describe('[UC-GAME-045/MSS] Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)', () => {
  it('Mặt 1: Cú sốc sụp đổ sàn chứng khoán — Giảm sàn kịch biên độ 50% vốn đầu tư', () => {
    const { room } = setup();
    const p1 = room.players[0]!;
    p1.balance = 10000;
    room.phase = TurnPhase.HosePhase;

    // rng trả về 0 -> floor(0 * 6) + 1 = Mặt 1 (0.50x)
    const rng = () => 0;
    const res = handleHoseInvest(room, p1, rng, 2000);

    expect(res.success, 'Khớp lệnh đặt cược thành công').toBe(true);
    expect(resolveHoseInvestment(2000, 1), 'Mặt 1 thu về 50% vốn = 1000 Tr.').toBe(1000);
    expect(p1.balance, 'Số dư giảm 1000 Tr. do lỗ sàn: 10000 - 2000 + 1000 = 9000 Tr.').toBe(9000);
    expect(room.phase, 'FSM hoàn tất đầu tư và chuyển về PropertyManagement').toBe(TurnPhase.PropertyManagement);
  });

  it('Mặt 6: Thị trường bùng nổ — Nhân đôi tài khoản 200% (+100% lãi)', () => {
    const { room } = setup();
    const p1 = room.players[0]!;
    p1.balance = 10000;
    room.phase = TurnPhase.HosePhase;

    // rng trả về 0.99 -> floor(0.99 * 6) + 1 = Mặt 6 (2.00x)
    const rng = () => 0.99;
    const res = handleHoseInvest(room, p1, rng, 1000);

    expect(res.success).toBe(true);
    expect(resolveHoseInvestment(1000, 6), 'Mặt 6 thu về 200% vốn = 2000 Tr.').toBe(2000);
    expect(p1.balance, 'Số dư tăng 1000 Tr.: 10000 - 1000 + 2000 = 11000 Tr.').toBe(11000);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('Người chơi có quyền Bỏ Qua (handleHoseSkip) không tham gia lướt sóng', () => {
    const { room } = setup();
    const p1 = room.players[0]!;
    p1.balance = 10000;
    room.phase = TurnPhase.HosePhase;

    const res = handleHoseSkip(room, p1);
    expect(res.success).toBe(true);
    expect(p1.balance, 'Số dư giữ nguyên 10000 Tr.').toBe(10000);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('[Adversarial Inversion] Từ chối khi sai phase hoặc mức cược không hợp lệ', () => {
    const { room } = setup();
    const p1 = room.players[0]!;
    room.phase = TurnPhase.WaitingRoll;

    // Sai phase
    const wrongPhase = handleHoseInvest(room, p1, () => 0, 1000);
    expect(wrongPhase.success).toBe(false);
    expect(wrongPhase.reason).toBe('INVALID_PHASE');

    // Mức cược quá thấp (< 500) hoặc quá cao (> 3000)
    room.phase = TurnPhase.HosePhase;
    const tooLow = handleHoseInvest(room, p1, () => 0, 300);
    expect(tooLow.success).toBe(false);
    expect(tooLow.reason).toBe('INVALID_STAKE');

    const tooHigh = handleHoseInvest(room, p1, () => 0, 5000);
    expect(tooHigh.success).toBe(false);
    expect(tooHigh.reason).toBe('INVALID_STAKE');

    // Cược vượt quá số dư tiền mặt
    p1.balance = 600;
    const overBalance = handleHoseInvest(room, p1, () => 0, 1000);
    expect(overBalance.success).toBe(false);
    expect(overBalance.reason).toBe('INSUFFICIENT_FUNDS');
  });
});
