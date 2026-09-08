// [TC-AUDIT-001..008/MSS] Milestone Deep Audit Hotfix Verification Test Suite
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { createPlayer, TurnPhase, createRoom, GO_BONUS } from '../../src/domain/room';
import {
  buyProperty, BuyResult, upgradeProperty, handleLanding, LandingResult,
  calculateGoPropertyTax, type PropertyRegistry, type PropertyStateMap,
} from '../../src/domain/property_manager';
import { executeChanceCard } from '../../src/domain/card_handlers';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_engine';

describe('[AUDIT-HOTFIX-01] Ô 04 Lệ Phí Đất Đai', () => {
  it('Dừng chân Ô 04 khi balance=15_000 -> nộp 10% (1.500 Tr.) và chuyển PropertyManagement', () => {
    // Ép vị trí trước khi roll: từ ô 2 đi 2 bước đến ô 4
    const rollRng = () => 0.05; // Math.floor(0.05*6)+1 = 1 -> die1=1, die2=1 -> total=2
    const mgrRoll = new RoomManager(rollRng);
    const r2 = mgrRoll.createRoom('pA');
    mgrRoll.joinRoom(r2.roomCode, 'pB');
    mgrRoll.startGame(r2.roomCode);

    const cur = r2.players[0]!;
    cur.position = 2;
    cur.balance = 15_000;

    const res = mgrRoll.handleRollDice(r2.roomCode, 'pA');
    expect(res).toBeDefined();
    expect(res?.player.position).toBe(4);
    // 10% của 15_000 là 1.500 <= 2.000 -> nộp 1.500
    expect(cur.balance).toBe(13_500);
    expect(r2.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('Dừng chân Ô 04 khi balance=30_000 -> nộp kịch trần 2.000 Tr.', () => {
    const rollRng = () => 0.05; // total = 2
    const mgrRoll = new RoomManager(rollRng);
    const room = mgrRoll.createRoom('pA');
    mgrRoll.joinRoom(room.roomCode, 'pB');
    mgrRoll.startGame(room.roomCode);

    const cur = room.players[0]!;
    cur.position = 2;
    cur.balance = 30_000;

    const res = mgrRoll.handleRollDice(room.roomCode, 'pA');
    expect(res?.player.position).toBe(4);
    // 10% của 30_000 là 3.000 > 2.000 -> cap 2.000 -> balance còn 28.000
    expect(cur.balance).toBe(28_000);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });

  it('Dừng chân Ô 04 khi balance=0 -> nộp 0đ', () => {
    const rollRng = () => 0.05; // total = 2
    const mgrRoll = new RoomManager(rollRng);
    const room = mgrRoll.createRoom('pA');
    mgrRoll.joinRoom(room.roomCode, 'pB');
    mgrRoll.startGame(room.roomCode);

    const cur = room.players[0]!;
    cur.position = 2;
    cur.balance = 0;

    const res = mgrRoll.handleRollDice(room.roomCode, 'pA');
    expect(res?.player.position).toBe(4);
    expect(cur.balance).toBe(0);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
  });
});

describe('[AUDIT-HOTFIX-02] Thuế Tài Sản Lũy Tiến tại Ô GO', () => {
  it('calculateGoPropertyTax: 1-3 ô BĐS -> Miễn thuế (0đ)', () => {
    const reg: PropertyRegistry = new Map([[1, 'p1'], [3, 'p1'], [6, 'p1']]);
    const tax = calculateGoPropertyTax('p1', reg, new Map());
    expect(tax).toBe(0);
  });

  it('calculateGoPropertyTax: 4-6 ô BĐS -> 150 Tr. x số ô', () => {
    const reg: PropertyRegistry = new Map([[1, 'p1'], [3, 'p1'], [6, 'p1'], [8, 'p1'], [9, 'p1']]);
    const tax = calculateGoPropertyTax('p1', reg, new Map());
    expect(tax).toBe(150 * 5); // 750
  });

  it('calculateGoPropertyTax: >= 7 ô BĐS -> 400 Tr. x số ô + 300 Tr. x công trình C2, C3', () => {
    const reg: PropertyRegistry = new Map([
      [1, 'p1'], [3, 'p1'], [6, 'p1'], [8, 'p1'], [9, 'p1'], [11, 'p1'], [13, 'p1'],
    ]);
    const sm: PropertyStateMap = new Map([
      [1, { level: 1 }], // C1
      [3, { level: 2 }], // C2 (+300)
      [6, { level: 3 }], // C3 (+300)
      [8, { level: 2 }], // C2 (+300)
    ]);
    // 7 ô x 400 = 2.800; 3 công trình C2/C3 x 300 = 900 -> Tổng = 3.700
    const tax = calculateGoPropertyTax('p1', reg, sm);
    expect(tax).toBe(3_700);
  });

  it('Qua ô GO: cộng 2.000 Tr. trừ thuế tài sản lũy tiến trên room_manager', () => {
    const rollRng = () => 0.05; // total = 2
    const mgr = new RoomManager(rollRng);
    const room = mgr.createRoom('pA');
    mgr.joinRoom(room.roomCode, 'pB');
    mgr.startGame(room.roomCode);

    // Gán 5 ô đất cho pA
    const reg = (mgr as any).registries.get(room.roomCode) as PropertyRegistry;
    reg.set(1, 'pA'); reg.set(3, 'pA'); reg.set(6, 'pA'); reg.set(8, 'pA'); reg.set(9, 'pA');

    const cur = room.players[0]!;
    cur.position = 39;
    cur.balance = 10_000;

    // Vượt ô 0: từ 39 đi 2 bước -> đến ô 1. Passed GO!
    const res = mgr.handleRollDice(room.roomCode, 'pA');
    expect(res?.passedGo).toBe(true);
    // balance = 10_000 + 2_000 (GO) - 750 (tax: 5 x 150) = 11_250
    expect(cur.balance).toBe(11_250);
  });
});

describe('[AUDIT-HOTFIX-03] Đấu Giá: Cấm người từ chối tham gia đặt giá', () => {
  it('Người chơi gửi INTENT_DECLINE bị từ chối khi gửi INTENT_BID', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('pA');
    mgr.joinRoom(room.roomCode, 'pB');
    mgr.joinRoom(room.roomCode, 'pC');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 3;
    room.phase = TurnPhase.ActionPhase;

    // pA từ chối mua
    const decline = mgr.handlePlayerIntent(room.roomCode, 'pA', { type: 'INTENT_DECLINE' });
    expect(decline.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.AuctionPhase);

    // pA cố gắng bid -> Phải bị từ chối
    const bidA = mgr.handleAuctionBid(room.roomCode, 'pA', 400);
    expect(bidA.success).toBe(false);
    expect(bidA.reason).toBe('DECLINED_PLAYER_CANNOT_BID');

    // pB bid -> Thành công
    const bidB = mgr.handleAuctionBid(room.roomCode, 'pB', 400);
    expect(bidB.success).toBe(true);
  });
});

describe('[AUDIT-HOTFIX-04] Đấu Giá: Khắc phục bế tắc Runtime (INTENT_AUCTION_PASS)', () => {
  it('Toàn bộ người chơi hợp lệ đều PASS -> Đóng phiên đấu giá, về PropertyManagement, không ai thắng', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('pA');
    mgr.joinRoom(room.roomCode, 'pB');
    mgr.joinRoom(room.roomCode, 'pC');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 3;
    room.phase = TurnPhase.ActionPhase;

    mgr.handlePlayerIntent(room.roomCode, 'pA', { type: 'INTENT_DECLINE' });
    expect(room.phase).toBe(TurnPhase.AuctionPhase);

    // pA không được pass (đã decline)
    const passA = mgr.handlePlayerIntent(room.roomCode, 'pA', { type: 'INTENT_AUCTION_PASS' });
    expect(passA.success).toBe(false);

    // pB pass
    const passB = mgr.handlePlayerIntent(room.roomCode, 'pB', { type: 'INTENT_AUCTION_PASS' });
    expect(passB.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.AuctionPhase); // pC chưa pass

    // pC pass -> Toàn bộ người hợp lệ đã pass -> Tự động đóng phiên
    const passC = mgr.handlePlayerIntent(room.roomCode, 'pC', { type: 'INTENT_AUCTION_PASS' });
    expect(passC.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
    expect((mgr as any).auctions.get(room.roomCode)).toBeUndefined();
  });

  it('Có người đặt giá và người còn lại PASS -> Người đặt giá cao nhất thắng cuộc ngay lập tức', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('pA');
    mgr.joinRoom(room.roomCode, 'pB');
    mgr.joinRoom(room.roomCode, 'pC');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 3;
    room.phase = TurnPhase.ActionPhase;

    mgr.handlePlayerIntent(room.roomCode, 'pA', { type: 'INTENT_DECLINE' });

    // pB đặt giá 400
    mgr.handlePlayerIntent(room.roomCode, 'pB', { type: 'INTENT_BID', amount: 400 });

    // pB không thể pass vì đang là highest bidder
    const passB = mgr.handlePlayerIntent(room.roomCode, 'pB', { type: 'INTENT_AUCTION_PASS' });
    expect(passB.success).toBe(false);
    expect(passB.reason).toBe('HIGHEST_BIDDER_CANNOT_PASS');

    // pC pass -> Mọi người khác ngoài highest bidder đều đã pass -> Auto close!
    const passC = mgr.handlePlayerIntent(room.roomCode, 'pC', { type: 'INTENT_AUCTION_PASS' });
    expect(passC.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
    expect(room.players[1]!.balance).toBe(15_000 - 400);
    expect((mgr as any).registries.get(room.roomCode).get(3)).toBe('pB');
  });

  it('Người chơi PASS trước, người còn lại BID -> Tự động chốt phiên ngay lập tức', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('pA');
    mgr.joinRoom(room.roomCode, 'pB');
    mgr.joinRoom(room.roomCode, 'pC');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 3;
    room.phase = TurnPhase.ActionPhase;

    mgr.handlePlayerIntent(room.roomCode, 'pA', { type: 'INTENT_DECLINE' });

    // pB pass trước
    const passB = mgr.handlePlayerIntent(room.roomCode, 'pB', { type: 'INTENT_AUCTION_PASS' });
    expect(passB.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.AuctionPhase);

    // pB không thể pass lần 2
    const passB2 = mgr.handlePlayerIntent(room.roomCode, 'pB', { type: 'INTENT_AUCTION_PASS' });
    expect(passB2.success).toBe(false);
    expect(passB2.reason).toBe('PLAYER_ALREADY_PASSED');

    // pC đặt giá 400 -> Vì pB đã pass, pC thắng ngay lập tức!
    const bidC = mgr.handlePlayerIntent(room.roomCode, 'pC', { type: 'INTENT_BID', amount: 400 });
    expect(bidC.success).toBe(true);
    expect(room.phase).toBe(TurnPhase.PropertyManagement);
    expect(room.players[2]!.balance).toBe(15_000 - 400);
    expect((mgr as any).registries.get(room.roomCode).get(3)).toBe('pC');
  });
});

describe('[AUDIT-HOTFIX-05] Thẻ MC_FREEZE_TRADE cấm mua đất', () => {
  it('buyProperty từ chối với BuyResult.TradeFrozen khi MC_FREEZE_TRADE kích hoạt', () => {
    const player = createPlayer('p1');
    const registry: PropertyRegistry = new Map();
    const modifiers = [{
      type: MarketCardId.MC_FREEZE_TRADE,
      affectedCells: [] as readonly number[],
      remainingRounds: 1,
    }];

    const res = buyProperty(player, 1, registry, modifiers);
    expect(res.result).toBe(BuyResult.TradeFrozen);
    expect(registry.has(1)).toBe(false);
    expect(player.balance).toBe(15_000);
  });

  it('INTENT_BUY từ chối qua RoomManager khi MC_FREEZE_TRADE kích hoạt', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('pA');
    mgr.joinRoom(room.roomCode, 'pB');
    mgr.startGame(room.roomCode);

    room.players[0]!.position = 1;
    room.phase = TurnPhase.ActionPhase;
    room.activeModifiers.push({
      type: MarketCardId.MC_FREEZE_TRADE,
      affectedCells: [],
      remainingRounds: 1,
    });

    const buyRes = mgr.handlePlayerIntent(room.roomCode, 'pA', { type: 'INTENT_BUY' });
    expect(buyRes.success).toBe(false);
    expect(buyRes.reason).toBe(BuyResult.TradeFrozen);
    expect(room.phase).toBe(TurnPhase.ActionPhase);
  });
});

describe('[AUDIT-HOTFIX-06] Thẻ MC_CREDIT_STIMULUS giảm 20% chi phí xây dựng', () => {
  it('upgradeProperty giảm 20% chi phí khi MC_CREDIT_STIMULUS kích hoạt', () => {
    const player = createPlayer('p1');
    // Cần Thơ (ô 1) & Châu Đốc (ô 3) thuộc nhóm Nâu
    const registry: PropertyRegistry = new Map([[1, 'p1'], [3, 'p1']]);
    const stateMap: PropertyStateMap = new Map();
    const modifiers = [{
      type: MarketCardId.MC_CREDIT_STIMULUS,
      affectedCells: [] as readonly number[],
      remainingRounds: 2,
    }];

    // Chi phí C1 ô 1 là 300 -> Giảm 20% còn 240
    const res = upgradeProperty(player, 1, registry, stateMap, modifiers);
    expect(res.success).toBe(true);
    expect(player.balance).toBe(15_000 - 240);
    expect(stateMap.get(1)?.level).toBe(1);
  });

  it('INTENT_UPGRADE giảm 20% chi phí qua RoomManager khi MC_CREDIT_STIMULUS kích hoạt', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('pA');
    mgr.joinRoom(room.roomCode, 'pB');
    mgr.startGame(room.roomCode);

    const reg = (mgr as any).registries.get(room.roomCode) as PropertyRegistry;
    reg.set(1, 'pA');
    reg.set(3, 'pA');

    room.phase = TurnPhase.PropertyManagement;
    room.activeModifiers.push({
      type: MarketCardId.MC_CREDIT_STIMULUS,
      affectedCells: [],
      remainingRounds: 2,
    });

    const upRes = mgr.handlePlayerIntent(room.roomCode, 'pA', { type: 'INTENT_UPGRADE', cellIndex: 1 });
    expect(upRes.success).toBe(true);
    // Chi phí C1 gốc là 300 -> giảm 20% còn 240 -> 15.000 - 240 = 14.760
    expect(room.players[0]!.balance).toBe(15_000 - 240);
  });
});

describe('[AUDIT-HOTFIX-07] Thẻ CC_PLATE_AUCTION (+1 lượt) & CC_CONCERT_SPONSOR (x2 xúc)', () => {
  it('CC_PLATE_AUCTION trừ 500 Tr., đặt extraTurns += 1, handleEndTurn đi tiếp lượt', () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('pA');
    mgr.joinRoom(room.roomCode, 'pB');
    mgr.startGame(room.roomCode);

    const cur = room.players[0]!;
    executeChanceCard(ChanceCardId.CC_PLATE_AUCTION, 'pA', [cur]);
    expect(cur.balance).toBe(15_000 - 500);
    expect(cur.extraTurns).toBe(1);

    // Roll dice rồi end turn
    mgr.handleRollDice(room.roomCode, 'pA');
    const end = mgr.handlePlayerIntent(room.roomCode, 'pA', { type: 'INTENT_END_TURN' });
    expect(end.success).toBe(true);
    // Vẫn là pA! extraTurns về 0, phase chuyển về WaitingRoll
    expect(room.currentPlayerIndex).toBe(0);
    expect(cur.extraTurns).toBe(0);
    expect(room.phase).toBe(TurnPhase.WaitingRoll);

    // Lần 2 roll và end turn -> Chuyển sang pB
    mgr.handleRollDice(room.roomCode, 'pA');
    const end2 = mgr.handlePlayerIntent(room.roomCode, 'pA', { type: 'INTENT_END_TURN' });
    expect(end2.success).toBe(true);
    expect(room.currentPlayerIndex).toBe(1);
  });

  it('CC_CONCERT_SPONSOR trừ 600 Tr., đặt doubleNextDice=true, handleRollDice nhân đôi xúc xắc', () => {
    const rollRng = () => 0.05; // die1=1, die2=1, total=2 bình thường
    const mgr = new RoomManager(rollRng);
    const room = mgr.createRoom('pA');
    mgr.joinRoom(room.roomCode, 'pB');
    mgr.startGame(room.roomCode);

    const cur = room.players[0]!;
    cur.position = 0;
    executeChanceCard(ChanceCardId.CC_CONCERT_SPONSOR, 'pA', [cur]);
    expect(cur.balance).toBe(15_000 - 600);
    expect(cur.doubleNextDice).toBe(true);

    const res = mgr.handleRollDice(room.roomCode, 'pA');
    // (1 + 1) * 2 = 4
    expect(res?.dice.total).toBe(4);
    expect(cur.position).toBe(4);
    expect(cur.doubleNextDice).toBe(false);
  });
});

describe('[AUDIT-HOTFIX-08] Đồng bộ sự kiện Dịch vụ C2 (rentAmount += 200)', () => {
  it('Khi dẫm ô Dịch vụ C2 số xúc xắc chẵn, rentAmount trả về bao gồm cả 200 Tr. phụ thu', () => {
    const tenant = createPlayer('tenant');
    const landlord = createPlayer('landlord');
    const registry: PropertyRegistry = new Map([[6, 'landlord']]);
    const stateMap: PropertyStateMap = new Map([[6, { level: 2 }]]); // C2

    // rng trả về số chẵn cho C2 (ví dụ mặt xúc xắc 2: 0.2 -> Math.floor(0.2*6)+1 = 2)
    const evenRng = () => 0.2;
    // Giá thuê C2 ô 6 là 1000 Tr. Phụ thu 200 Tr. Tổng là 1200 Tr.
    const res = handleLanding(tenant, 6, registry, [tenant, landlord], stateMap, 7, undefined, evenRng);
    expect(res.result).toBe(LandingResult.RentPaid);
    expect(res.rentAmount).toBe(1200);
    expect(tenant.balance).toBe(15_000 - 1200);
    expect(landlord.balance).toBe(15_000 + 1200);
  });
});
