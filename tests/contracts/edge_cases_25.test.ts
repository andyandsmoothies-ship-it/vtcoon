// [UC-GAME-001..057/MSS][TC-EC01..25] 25 Kịch Bản Biên & Bất Biến Kinh Tế (Edge Cases Hardening)
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase, GO_BONUS, type Room } from '../../src/domain/room';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher';
import { ActionRejectReason } from '../../src/domain/action_reasons';
import {
  handleLanding, type PropertyRegistry, type PropertyStateMap,
} from '../../src/domain/property_manager';
import { CellType } from '../../src/domain/board_config';
import { handleSpecialCell } from '../../src/server/special_cell_handler';
import { collectMortgageInterest, redeemProperty, mortgageProperty } from '../../src/server/mortgage_manager';
import { handleBailOut, processRollDoubles, handleAuditTurnTransition } from '../../src/server/audit_manager';
import { declareBankruptcy, calculateRankings } from '../../src/server/insolvency_manager';
import { buildDeltaFromRoom } from '../../src/server/session_manager';
import { handleAuctionBid, handleAuctionClose, type AuctionSession } from '../../src/server/auction_manager';
import { executeTurnRoll } from '../../src/server/turn_loop';
import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types';
import { executeMarketCard } from '../../src/domain/market_card_handlers';
import { applyDeltaToStore } from '../../src/client/network/apply_delta';
import { useGameStore } from '../../src/client/store/game_store';

function createTestRoom(numPlayers = 3): {
  mgr: RoomManager;
  room: Room;
  reg: PropertyRegistry;
  sm: PropertyStateMap;
} {
  const mgr = new RoomManager(42);
  const room = mgr.createRoom('P1');
  for (let i = 2; i <= numPlayers; i++) {
    mgr.joinRoom(room.roomCode, `P${i}`);
  }
  mgr.startGame(room.roomCode);
  const reg = mgr.getRegistry(room.roomCode)!;
  const sm = mgr.getPropertyStates(room.roomCode)!;
  return { mgr, room, reg, sm };
}

describe('[TC-EC01..25] 25 Kịch Bản Biên Toàn Diện (Edge Cases Hardening)', () => {
  // [TC-EC01] Chuỗi đổ đôi: gieo tiếp khi ra đôi, đôi lần 3 vào Ô 10
  it('[TC-EC01] Chuỗi đổ đôi: gieo tiếp khi ra đôi, đôi lần 3 vào Ô 10', () => {
    const { room } = createTestRoom(2);
    const p1 = room.players[0]!;
    // Đôi lần 1
    const res1 = processRollDoubles(room, p1, { die1: 2, die2: 2, total: 4, isDouble: true });
    expect(res1.stopped).toBe(false);
    expect(p1.consecutiveDoubles).toBe(1);

    // Đôi lần 2
    const res2 = processRollDoubles(room, p1, { die1: 3, die2: 3, total: 6, isDouble: true });
    expect(res2.stopped).toBe(false);
    expect(p1.consecutiveDoubles).toBe(2);

    // Đôi lần 3 -> vào Trạm Kiểm Toán Ô 10
    const res3 = processRollDoubles(room, p1, { die1: 4, die2: 4, total: 8, isDouble: true });
    expect(res3.stopped).toBe(true);
    expect(p1.position).toBe(10);
    expect(p1.auditTurnsLeft).toBe(3);
    expect(p1.consecutiveDoubles).toBe(0);
  });

  // [TC-EC02] Vượt ô GO: nhận thưởng GO_BONUS trừ thuế đất nộp vào room.treasury
  it('[TC-EC02] Vượt ô GO: nhận thưởng GO_BONUS trừ thuế đất nộp vào room.treasury', () => {
    const { room, reg, sm } = createTestRoom(2);
    const p1 = room.players[0]!;
    p1.position = 38;
    // Sở hữu 4 BĐS -> calculateGoPropertyTax = 150 * 4 = 600 > 0
    reg.set(1, 'P1');
    reg.set(3, 'P1');
    reg.set(6, 'P1');
    reg.set(8, 'P1');
    room.treasury = 0;
    const initialBal = p1.balance;

    const rolledMap = new Map<string, boolean>();
    const res = executeTurnRoll(room, p1, reg, sm, () => 0.16, () => 0, rolledMap, room.roomCode);
    expect(res?.passedGo).toBe(true);
    expect(room.treasury).toBe(600);
    expect(p1.balance).toBe(initialBal + GO_BONUS - 600);
  });

  // [TC-EC03] Phá sản nợ người chơi: sang tên toàn bộ đất cho chủ nợ
  it('[TC-EC03] Phá sản nợ người chơi: sang tên toàn bộ đất cho chủ nợ', () => {
    const { room, reg, sm } = createTestRoom(3);
    const p1 = room.players[0]!;
    const p2 = room.players[1]!;
    p1.balance = 500;
    p2.balance = 2000;
    reg.set(1, 'P1');
    reg.set(3, 'P1');
    p1.mortgagedProperties = [3];
    p1.mortgageLoans = { 3: 300 };

    declareBankruptcy(room, 'P1', reg, sm, 'P2');
    expect(p1.bankrupt).toBe(true);
    expect(p1.balance).toBe(0);
    expect(p2.balance).toBe(2500);
    expect(reg.get(1)).toBe('P2');
    expect(reg.get(3)).toBe('P2');
    expect(p2.mortgagedProperties).toContain(3);
    expect(p2.mortgageLoans?.[3]).toBe(300);
    expect(p1.mortgagedProperties).toHaveLength(0);
  });

  // [TC-EC04] Phá sản nợ ngân hàng: đưa đất vào đấu giá phát mãi 70%
  it('[TC-EC04] Phá sản nợ ngân hàng: đưa đất vào đấu giá phát mãi 70%', () => {
    const { mgr, room, reg, sm } = createTestRoom(3);
    reg.set(1, 'P1');
    const auctions = mgr.auctionsMap;
    room.treasury = 0;
    room.players[0]!.balance = 0;

    declareBankruptcy(room, 'P1', reg, sm, 'BANK', auctions, room.roomCode);
    expect(room.players[0]!.bankrupt).toBe(true);
    expect(reg.has(1)).toBe(false);

    const session = auctions.get(room.roomCode);
    expect(session).toBeDefined();
    expect(session?.cellIndex).toBe(1);
    expect(session?.highestBid).toBe(420); // 600 * 0.70
    expect(session?.declinedPlayerId).toBe('P1');
    expect(room.phase).toBe(TurnPhase.AuctionPhase);

    handleAuctionBid(room, session, 'P2', 420);
    handleAuctionClose(room, session, reg, auctions, room.roomCode);

    expect(room.treasury).toBe(420);
    expect(room.players[0]!.balance).toBeLessThanOrEqual(0);
    expect(room.players[room.currentPlayerIndex]!.id).not.toBe('P1');
    expect(reg.get(1)).toBe('P2');
  });

  // [TC-EC05] Đẳng thức bảo toàn quỹ Kho Bạc: Tiền tệ toàn hệ thống không bị rò rỉ
  it('[TC-EC05] Đẳng thức bảo toàn quỹ Kho Bạc: Tiền tệ toàn hệ thống không bị rò rỉ', () => {
    const { mgr, room, reg, sm } = createTestRoom(2);
    room.treasury = 0;
    const p1 = room.players[0]!;
    const p2 = room.players[1]!;
    p1.balance = 10000;
    p2.balance = 10000;

    const initialTotal = p1.balance + p2.balance + room.treasury;

    // 1. Phạt thuế qua Ô Tax (special_cell_handler) -> nộp vào treasury
    handleSpecialCell(room, p1, CellType.Tax, reg, sm, () => 0);
    expect(p1.balance).toBe(9000);
    expect(room.treasury).toBe(1000);
    expect(p1.balance + p2.balance + room.treasury).toBe(initialTotal);

    // 2. Nộp bảo lãnh ra tù Ô 10 (audit_manager) -> nộp vào treasury
    p1.auditTurnsLeft = 2;
    handleBailOut(room, p1.id, false);
    expect(p1.balance).toBe(8500);
    expect(room.treasury).toBe(1500);
    expect(p1.balance + p2.balance + room.treasury).toBe(initialTotal);

    // 3. Thế chấp, thu lãi và chuộc BĐS: Lãi và phí 10% nạp vào treasury
    reg.set(1, p1.id);
    room.phase = TurnPhase.PropertyManagement;
    mortgageProperty(room, p1.id, 1, reg, sm);
    collectMortgageInterest(room, p1.id);
    redeemProperty(room, p1.id, 1, reg);
    expect(p1.balance + p2.balance + room.treasury).toBe(initialTotal);

    // 4. Chuyển nhượng P2P 1.000 Tr.: Thuế 5% (50 Tr.) nạp Kho bạc
    const tradeRes = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
      type: 'INTENT_TRADE_OFFER',
      sellerId: 'P1', buyerId: 'P2', cellIndex: 1, price: 1000,
    });
    expect(tradeRes.success).toBe(true);
    expect(p1.balance + p2.balance + room.treasury).toBe(initialTotal);
  });

  // [TC-EC06] Không in tiền ảo khi người chơi mất khả năng thanh toán tiền thuê
  it('[TC-EC06] Không in tiền ảo khi người chơi mất khả năng thanh toán tiền thuê', () => {
    const { room, reg, sm } = createTestRoom(2);
    const tenant = room.players[0]!;
    const landlord = room.players[1]!;
    tenant.balance = 200;
    landlord.balance = 1000;
    reg.set(1, landlord.id);
    sm.set(1, { level: 3 });

    handleLanding(tenant, 1, reg, room.players, sm);
    expect(landlord.balance).toBe(1200); // 1000 + 200 actualPaid
    expect(tenant.balance).toBeLessThan(0);

    // C2 surcharge trên ô Dịch vụ khi tenant âm tiền: không in tiền ảo cho landlord
    reg.set(12, landlord.id);
    sm.set(12, { level: 2 });
    const landlordBefore = landlord.balance;
    handleLanding(tenant, 12, reg, room.players, sm, 4, undefined, () => 0.1);
    expect(landlord.balance).toBe(landlordBefore);
  });

  // [TC-EC07] Lãi vay, thuế ô 4, phí bảo lãnh đều nộp vào room.treasury
  it('[TC-EC07] Lãi vay, thuế ô 4, phí bảo lãnh đều nộp vào room.treasury', () => {
    const { room, reg, sm } = createTestRoom(2);
    room.treasury = 0;
    const p1 = room.players[0]!;

    p1.balance = 10000;
    handleSpecialCell(room, p1, CellType.Tax, reg, sm, () => 0);
    expect(room.treasury).toBe(1000);

    p1.auditTurnsLeft = 2;
    handleBailOut(room, p1.id, false);
    expect(room.treasury).toBe(1500);

    room.phase = TurnPhase.PropertyManagement;
    reg.set(1, p1.id);
    mortgageProperty(room, p1.id, 1, reg, sm);
    collectMortgageInterest(room, p1.id);
    expect(room.treasury).toBeGreaterThan(1500);
  });

  // [TC-EC08] Ô 10 không ném lỗi CANNOT_ROLL khi gieo không ra đôi; thu 500 Tr. sau 3 lượt
  it('[TC-EC08] Ô 10 không ném lỗi CANNOT_ROLL khi gieo không ra đôi; thu 500 Tr. sau 3 lượt', () => {
    const { mgr, room } = createTestRoom(2);
    const p1 = room.players[0]!;
    p1.position = 10;
    p1.auditTurnsLeft = 3;
    room.treasury = 0;

    const rollRes = dispatchPlayerIntent(mgr, room.roomCode, 'P1', { type: 'INTENT_ROLL' });
    expect(rollRes.success).toBe(true);
    expect(rollRes.reason).toBeUndefined();

    handleAuditTurnTransition(room, p1);
    handleAuditTurnTransition(room, p1);
    handleAuditTurnTransition(room, p1);
    expect(p1.auditTurnsLeft).toBe(0);
    expect(room.treasury).toBe(500);
  });

  // [TC-EC09] VSC: PlayerDelta mang đầy đủ thông tin cờ trạng thái inAudit, skipNextTurn, consecutiveDoubles
  it('[TC-EC09] VSC: PlayerDelta mang đầy đủ thông tin cờ trạng thái inAudit, skipNextTurn, consecutiveDoubles', () => {
    const { room, reg, sm } = createTestRoom(2);
    const p1 = room.players[0]!;
    p1.auditTurnsLeft = 2;
    p1.skipNextTurn = true;
    p1.consecutiveDoubles = 2;

    const delta = buildDeltaFromRoom(room, reg, sm, 1);
    const p1Delta = delta.players?.find((p) => p.id === p1.id);
    expect(p1Delta).toBeDefined();
    expect(p1Delta?.inAudit).toBe(true);
    expect(p1Delta?.auditTurnsLeft).toBe(2);
    expect(p1Delta?.skipNextTurn).toBe(true);
    expect(p1Delta?.consecutiveDoubles).toBe(2);
  });

  // [TC-EC10] Sàn đấu giá Anti-sniping: +3 giây khi đặt giá ở 3 giây cuối
  it('[TC-EC10] Sàn đấu giá Anti-sniping: +3 giây khi đặt giá ở 3 giây cuối', () => {
    const { room } = createTestRoom(3);
    room.phase = TurnPhase.AuctionPhase;
    const now = Date.now();
    const session: AuctionSession = {
      cellIndex: 1,
      declinedPlayerId: 'P1',
      highestBid: 300,
      endTime: now + 2_000,
      passedPlayers: new Set<string>(),
    };

    const res = handleAuctionBid(room, session, 'P2', 400);
    expect(res.success).toBe(true);
    expect(session.endTime).toBeGreaterThanOrEqual(now + 5_000);
  });

  // [TC-EC11] Auction Bidder Self-Exclusion: người từ chối không được bid
  it('[TC-EC11] Auction Bidder Self-Exclusion: người từ chối không được bid', () => {
    const { room } = createTestRoom(3);
    room.phase = TurnPhase.AuctionPhase;
    const session: AuctionSession = {
      cellIndex: 1,
      declinedPlayerId: 'P1',
      highestBid: 300,
      passedPlayers: new Set<string>(),
    };

    const res = handleAuctionBid(room, session, 'P1', 400);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.DECLINED_PLAYER_CANNOT_BID);
  });

  // [TC-EC12] Auction Overbid Guard: không được bid quá số dư
  it('[TC-EC12] Auction Overbid Guard: không được bid quá số dư', () => {
    const { room } = createTestRoom(3);
    room.phase = TurnPhase.AuctionPhase;
    room.players[1]!.balance = 500;
    const session: AuctionSession = {
      cellIndex: 1,
      declinedPlayerId: 'P1',
      highestBid: 300,
      passedPlayers: new Set<string>(),
    };

    const res = handleAuctionBid(room, session, 'P2', 600);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
  });

  // [TC-EC13] Phí giải chấp 10% nạp vào Kho Bạc
  it('[TC-EC13] Phí giải chấp 10% nạp vào Kho Bạc', () => {
    const { room, reg, sm } = createTestRoom(2);
    room.phase = TurnPhase.PropertyManagement;
    room.treasury = 0;
    const p1 = room.players[0]!;
    reg.set(1, p1.id);
    mortgageProperty(room, p1.id, 1, reg, sm);
    expect(p1.mortgagedProperties).toContain(1);

    redeemProperty(room, p1.id, 1, reg);
    expect(p1.mortgagedProperties).not.toContain(1);
    expect(room.treasury).toBe(30);
  });

  // [TC-EC14] Illegal P2P Trade Guard: cấm giao dịch BĐS có công trình
  it('[TC-EC14] Illegal P2P Trade Guard: cấm giao dịch BĐS có công trình', () => {
    const { mgr, room, reg, sm } = createTestRoom(2);
    reg.set(1, 'P1');
    sm.set(1, { level: 1 });

    const tradeRes = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
      type: 'INTENT_TRADE_OFFER',
      sellerId: 'P1', buyerId: 'P2', cellIndex: 1, price: 1000,
    });
    expect(tradeRes.success).toBe(false);
    expect(tradeRes.reason).toBe(ActionRejectReason.PROPERTY_HAS_BUILDING);
  });

  // [TC-EC15] Khấu trừ thuế chuyển nhượng P2P 5% vào Kho Bạc
  it('[TC-EC15] Khấu trừ thuế chuyển nhượng P2P 5% vào Kho Bạc', () => {
    const { mgr, room, reg } = createTestRoom(2);
    reg.set(1, 'P1');
    room.treasury = 0;
    const p1Before = room.players[0]!.balance;
    const p2Before = room.players[1]!.balance;

    const res = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
      type: 'INTENT_TRADE_OFFER',
      sellerId: 'P1', buyerId: 'P2', cellIndex: 1, price: 1000,
    });
    expect(res.success).toBe(true);
    expect(room.treasury).toBe(50);
    expect(room.players[0]!.balance).toBe(p1Before + 950);
    expect(room.players[1]!.balance).toBe(p2Before - 1000);
  });

  // [TC-EC16] HOSE Casino Loss Solvency: Mặt 1 hệ số 0.30 không gây âm tiền
  it('[TC-EC16] HOSE Casino Loss Solvency: Mặt 1 hệ số 0.30 không gây âm tiền', () => {
    const { mgr, room } = createTestRoom(2);
    room.phase = TurnPhase.HosePhase;
    room.players[0]!.balance = 500;

    const res = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
      type: 'INTENT_INVEST', stake: 500,
    });
    expect(res.success).toBe(true);
    expect(room.players[0]!.balance).toBeGreaterThanOrEqual(0);
  });

  // [TC-EC17] Miễn trừ tiền thuê bằng thẻ Ngoại Giao (CC_DIPLOMATIC)
  it('[TC-EC17] Miễn trừ tiền thuê bằng thẻ Ngoại Giao (CC_DIPLOMATIC)', () => {
    const { room, reg, sm } = createTestRoom(2);
    const p1 = room.players[0]!;
    const p2 = room.players[1]!;
    p1.hand = [ChanceCardId.CC_DIPLOMATIC];
    reg.set(1, p2.id);
    sm.set(1, { level: 2 });
    const p1Cash = p1.balance;

    const landing = handleLanding(p1, 1, reg, room.players, sm, undefined, undefined, undefined, room.chanceDiscard);
    expect(landing.rentAmount).toBe(0);
    expect(p1.balance).toBe(p1Cash);
    expect(p1.hand).not.toContain(ChanceCardId.CC_DIPLOMATIC);
    expect(room.chanceDiscard).toContain(ChanceCardId.CC_DIPLOMATIC);
  });

  // [TC-EC18] Zero-Rent Immunity khi có bão (MC_COASTAL_STORM)
  it('[TC-EC18] Zero-Rent Immunity khi có bão (MC_COASTAL_STORM)', () => {
    const { room, reg, sm } = createTestRoom(2);
    const p1 = room.players[0]!;
    const p2 = room.players[1]!;
    reg.set(16, p2.id);
    room.activeModifiers = [{
      type: MarketCardId.MC_COASTAL_STORM,
      affectedCells: [16],
      remainingRounds: 2,
    }];

    const landing = handleLanding(p1, 16, reg, room.players, sm, undefined, room.activeModifiers);
    expect(landing.rentAmount).toBe(0);
  });

  // [TC-EC19] Phạt PCCC theo cấp công trình (MC_FIRE_INSPECTION)
  it('[TC-EC19] Phạt PCCC theo cấp công trình (MC_FIRE_INSPECTION)', () => {
    const { room, reg, sm } = createTestRoom(2);
    const p1 = room.players[0]!;
    reg.set(1, p1.id);
    sm.set(1, { level: 1 });
    reg.set(3, p1.id);
    sm.set(3, { level: 2 });
    p1.balance = 5000;

    executeMarketCard(MarketCardId.MC_FIRE_INSPECTION, room.activeModifiers, room.players, reg, sm);
    expect(p1.balance).toBe(5000 - 600);
  });

  // [TC-EC20] Hạ cấp công trình (INTENT_DOWNGRADE) hoàn 50% chi phí
  it('[TC-EC20] Hạ cấp công trình (INTENT_DOWNGRADE) hoàn 50% chi phí', () => {
    const { mgr, room, reg, sm } = createTestRoom(2);
    room.phase = TurnPhase.PropertyManagement;
    reg.set(1, 'P1');
    sm.set(1, { level: 1 });
    const beforeBal = room.players[0]!.balance;

    const res = dispatchPlayerIntent(mgr, room.roomCode, 'P1', {
      type: 'INTENT_DOWNGRADE', cellIndex: 1,
    });
    expect(res.success).toBe(true);
    expect(sm.get(1)?.level).toBe(0);
    expect(room.players[0]!.balance).toBe(beforeBal + 150);
  });

  // [TC-EC21] Tín dụng thấu chi (CC_OVERDRAFT): thu hồi khi hết hạn
  it('[TC-EC21] Tín dụng thấu chi (CC_OVERDRAFT): thu hồi khi hết hạn', () => {
    const { room, reg, sm } = createTestRoom(2);
    const p1 = room.players[0]!;
    p1.overdraftRoundsLeft = 1;
    p1.pendingDebts = [ChanceCardId.CC_OVERDRAFT];
    p1.balance = 5000;
    p1.position = 38;

    const rolledMap = new Map<string, boolean>();
    executeTurnRoll(room, p1, reg, sm, () => 0.16, () => 0, rolledMap, room.roomCode);
    expect(p1.overdraftRoundsLeft).toBe(0);
    expect(p1.pendingDebts).not.toContain(ChanceCardId.CC_OVERDRAFT);
  });

  // [TC-EC22] Bỏ qua người chơi đã phá sản trong vòng lặp lượt
  it('[TC-EC22] Bỏ qua người chơi đã phá sản trong vòng lặp lượt', () => {
    const { mgr, room } = createTestRoom(3);
    room.players[1]!.bankrupt = true;
    room.currentPlayerIndex = 0;
    room.phase = TurnPhase.PropertyManagement;

    mgr.handleEndTurn(room.roomCode, 'P1');
    expect(room.currentPlayerIndex).toBe(2);
  });

  // [TC-EC23] Cấm thế chấp BĐS đang có công trình
  it('[TC-EC23] Cấm thế chấp BĐS đang có công trình', () => {
    const { room, reg, sm } = createTestRoom(2);
    room.phase = TurnPhase.PropertyManagement;
    reg.set(1, 'P1');
    sm.set(1, { level: 1 });

    const res = mortgageProperty(room, 'P1', 1, reg, sm);
    expect(res.success).toBe(false);
    expect(res.reason).toBe(ActionRejectReason.HAS_BUILDING);
  });

  // [TC-EC24] Quyết toán Net Worth & Tie-breaker: người sống xếp trên người phá sản
  it('[TC-EC24] Quyết toán Net Worth & Tie-breaker: người sống xếp trên người phá sản', () => {
    const { room, reg, sm } = createTestRoom(2);
    room.players[0]!.balance = 1000;
    room.players[0]!.bankrupt = true;
    room.players[1]!.balance = 1000;
    room.players[1]!.bankrupt = false;

    const rankings = calculateRankings(room, reg, sm);
    expect(rankings[0]!.id).toBe('P2');
    expect(rankings[1]!.id).toBe('P1');
  });

  // [TC-EC25] VSC Sparse Diff Client Sync: applyDeltaToStore cập nhật chính xác các trường
  it('[TC-EC25] VSC Sparse Diff Client Sync: applyDeltaToStore cập nhật chính xác các trường', () => {
    const store = useGameStore;
    store.getState().setPlayersInfo({
      P1: {
        id: 'P1',
        name: 'Player 1',
        balance: 10000,
        tokenColor: '#ff0000',
        ownedProperties: [],
      },
    });

    applyDeltaToStore(
      {
        tick: 1,
        cells: [],
        players: [
          {
            id: 'P1',
            position: 10,
            balance: 9500,
            inAudit: true,
            auditTurnsLeft: 3,
            skipNextTurn: true,
            consecutiveDoubles: 2,
          },
        ],
      },
      store,
    );

    const info = store.getState().playersInfo['P1'];
    expect(info?.balance).toBe(9500);
    expect(info?.inAudit).toBe(true);
    expect(info?.auditTurnsLeft).toBe(3);
    expect(info?.skipNextTurn).toBe(true);
    expect(info?.consecutiveDoubles).toBe(2);
  });
});
