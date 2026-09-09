// [TC-06.1..TC-06.4/MSS] Debt Mechanics RED Tests — GAME-S06 TASK 4
// Traceability: DEBT-S06-01..04 · UC-GAME-058 · UC-GAME-056
// QA Phase: RED — All tests expected to FAIL (logic not yet implemented)
// DO NOT MODIFY src/ — tests only

import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase, GO_BONUS } from '../../src/domain/room';
import { ChanceCardId } from '../../src/domain/event_card_types';
import { executeChanceCard } from '../../src/domain/card_handlers';
import { PROPERTY_DEEDS } from '../../src/domain/property_manager';

// ────────────────────────────────────────────────────────────────────────────
// Helper — build a room with 2 players, game started, fixed rng
// ────────────────────────────────────────────────────────────────────────────
function setup(rng = () => 0) {
  const mgr  = new RoomManager(rng);
  const room = mgr.createRoom('P1');
  mgr.joinRoom(room.roomCode, 'P2');
  mgr.startGame(room.roomCode);
  // Access private internals for direct state injection (test-only)
  const reg = (mgr as any).registries.get(room.roomCode) as Map<number, string>;
  const sm  = (mgr as any).propertyStates.get(room.roomCode) as Map<number, { level: number; unbuiltRounds?: number }>;
  return { mgr, room, reg, sm };
}

// Helper — force P1 to pass GO by positioning near end of board and rolling
function forcePassGo(mgr: RoomManager, roomCode: string, playerId: string): void {
  const room = mgr.getRoom(roomCode)!;
  const player = room.players.find(p => p.id === playerId)!;
  // rng=0 always gives dice total of 2 (1+1), so position 39 → (39+2)%40 = 1 → passes GO
  player.position = 39;
  room.phase = TurnPhase.WaitingRoll;
  mgr.handleRollDice(roomCode, playerId);
}

// ============================================================
// TC-06.1 — CC_OVERDRAFT: Bộ Đếm 3 Vòng, Thu Hồi 3.300 Tr.
// [DEBT-S06-01][UC-GAME-058/MSS]
// Consumer assertion: balance reduced at CONSUMPTION (GO pass),
// NOT just checking pendingDebts array.
// ============================================================
describe('[TC-06.1/MSS][DEBT-S06-01] CC_OVERDRAFT — Bộ đếm 3 vòng thu hồi 3.300 Tr.', () => {
  let mgr: RoomManager;
  let roomCode: string;

  beforeEach(() => {
    const s = setup();
    mgr      = s.mgr;
    roomCode = s.room.roomCode;
  });

  it('[TC-06.1a] Rút thẻ CC_OVERDRAFT: P1 nhận +3.000 Tr. VÀ overdraftRoundsLeft = 3', () => {
    // SPEC: handler CC_OVERDRAFT → balance += 3000, overdraftRoundsLeft = 3
    const room = mgr.getRoom(roomCode)!;
    const p1   = room.players[0]!;
    const balanceBefore = p1.balance;

    executeChanceCard(ChanceCardId.CC_OVERDRAFT, p1.id, room.players);

    // Balance assertion (passes - current handler does this)
    expect(p1.balance).toBe(balanceBefore + 3_000);

    // [DEBT-S06-01] overdraftRoundsLeft = 3 after drawing
    // ❌ BUSINESS RED: current handler only pushes to pendingDebts, never sets overdraftRoundsLeft
    expect(p1.overdraftRoundsLeft).toBe(3);
  });

  it('[TC-06.1b] Vòng 1 qua GO: overdraftRoundsLeft 3→2, balance KHÔNG bị trừ 3.300', () => {
    // Setup: manually inject state as if handler already ran correctly
    const room = mgr.getRoom(roomCode)!;
    const p1   = room.players[0]!;
    p1.balance += 3_000;
    p1.pendingDebts.push(ChanceCardId.CC_OVERDRAFT);
    p1.overdraftRoundsLeft = 3;

    const balanceBefore = p1.balance;
    // Trigger GO pass for P1 — processPendingDebts must be called inside roll logic
    // SPEC: overdraftRoundsLeft -= 1 on GO, no deduction yet
    forcePassGo(mgr, roomCode, p1.id);

    // ❌ BUSINESS RED: processPendingDebts not implemented — overdraftRoundsLeft unchanged (stays 3)
    expect(p1.overdraftRoundsLeft).toBe(2);
    // Balance should only change by GO_BONUS (2000), no 3300 deduction
    expect(p1.balance).toBe(balanceBefore + GO_BONUS);
  });

  it('[TC-06.1c] Vòng 3 qua GO: tự động khấu trừ 3.300 Tr., overdraftRoundsLeft = 0', () => {
    // SPEC: on final round, balance -= 3300, overdraftRoundsLeft resets to 0
    const room = mgr.getRoom(roomCode)!;
    const p1   = room.players[0]!;
    p1.balance += 3_000;
    p1.pendingDebts.push(ChanceCardId.CC_OVERDRAFT);
    p1.overdraftRoundsLeft = 1; // Last round remaining

    const balanceBefore = p1.balance;
    forcePassGo(mgr, roomCode, p1.id);

    // Consumer assertion: verify EFFECT at consumption point
    // ❌ BUSINESS RED: processPendingDebts not implemented
    expect(p1.overdraftRoundsLeft).toBe(0);
    // Net: GO_BONUS (+2000) - overdraft_repayment (-3300)
    expect(p1.balance).toBe(balanceBefore + GO_BONUS - 3_300);
  });

  it('[TC-06.1d] CC_OVERDRAFT bị xóa khỏi pendingDebts sau khi thu hồi vòng 3', () => {
    const room = mgr.getRoom(roomCode)!;
    const p1   = room.players[0]!;
    p1.balance += 3_000;
    p1.pendingDebts.push(ChanceCardId.CC_OVERDRAFT);
    p1.overdraftRoundsLeft = 1;

    forcePassGo(mgr, roomCode, p1.id);

    // ❌ BUSINESS RED: cleanup logic does not exist
    expect(p1.pendingDebts).not.toContain(ChanceCardId.CC_OVERDRAFT);
  });

  it('[TC-06.1e] [Adversarial] overdraftRoundsLeft=2: bị trừ ở vòng 2, không phải vòng 3', () => {
    // Adversarial: starting at rounds=2, deduction happens at round 2 (not round 3)
    const room = mgr.getRoom(roomCode)!;
    const p1   = room.players[0]!;
    p1.balance += 3_000;
    p1.pendingDebts.push(ChanceCardId.CC_OVERDRAFT);
    p1.overdraftRoundsLeft = 2;

    const balanceBefore = p1.balance;

    // First GO pass: rounds 2→1, no deduction
    forcePassGo(mgr, roomCode, p1.id);
    // ❌ BUSINESS RED: counter never decrements
    expect(p1.overdraftRoundsLeft).toBe(1);
    expect(p1.balance).toBe(balanceBefore + GO_BONUS); // only GO bonus, no deduction

    // Reset phase for second pass
    const room2 = mgr.getRoom(roomCode)!;
    // Second GO pass: rounds 1→0, DEDUCTION happens
    const p1Again = room2.players[0]!;
    const balanceBeforeSecond = p1Again.balance;
    forcePassGo(mgr, roomCode, p1.id);
    // Consumer assertion: net = GO_BONUS - 3300
    // ❌ BUSINESS RED: no deduction occurs
    expect(p1Again.balance).toBe(balanceBeforeSecond + GO_BONUS - 3_300);
  });
});

// ============================================================
// TC-06.2 — CC_FREE_CREDIT: Trích Lãi 400 Tr./Vòng Qua GO
// [DEBT-S06-02][UC-GAME-058/MSS]
// Consumer assertion: treasury INCREASES and net balance = +1600 not +2000
// ============================================================
describe('[TC-06.2/MSS][DEBT-S06-02] CC_FREE_CREDIT — Lãi 400 Tr. vào Kho bạc mỗi vòng GO', () => {
  let mgr: RoomManager;
  let roomCode: string;

  beforeEach(() => {
    const s = setup();
    mgr      = s.mgr;
    roomCode = s.room.roomCode;
  });

  it('[TC-06.2a] Rút CC_FREE_CREDIT: P1 nhận +2.000 Tr. VÀ thẻ vào hand[] (KHÔNG vào pendingDebts)', () => {
    // SPEC: handler adds card to hand[], NOT pendingDebts
    const room = mgr.getRoom(roomCode)!;
    const p1   = room.players[0]!;
    const balanceBefore = p1.balance;

    executeChanceCard(ChanceCardId.CC_FREE_CREDIT, p1.id, room.players);

    // Balance increases (current handler does give +2000 — but via pendingDebts route)
    expect(p1.balance).toBe(balanceBefore + 2_000);

    // ❌ BUSINESS RED: current handler pushes CC_FREE_CREDIT to pendingDebts, NOT hand
    expect(p1.hand).toContain(ChanceCardId.CC_FREE_CREDIT);
    expect(p1.pendingDebts).not.toContain(ChanceCardId.CC_FREE_CREDIT);
  });

  it('[TC-06.2b] Qua GO với CC_FREE_CREDIT trong hand: treasury += 400, net balance = +1.600', () => {
    // SPEC: interest deducted BEFORE GO bonus added; treasury receives 400
    const room = mgr.getRoom(roomCode)!;
    const p1   = room.players[0]!;
    // Pre-state: card in hand (correct state after proper handler)
    p1.hand.push(ChanceCardId.CC_FREE_CREDIT);
    p1.balance += 2_000; // initial credit received

    const treasuryBefore = room.treasury;
    const balanceBefore  = p1.balance;

    forcePassGo(mgr, roomCode, p1.id);

    // ❌ BUSINESS RED: no CC_FREE_CREDIT GO interest logic implemented
    // treasury must receive 400 interest
    expect(room.treasury).toBe(treasuryBefore + 400);
    // Net effect: GO_BONUS (+2000) - interest (-400) = +1600
    expect(p1.balance).toBe(balanceBefore + 1_600);
  });

  it('[TC-06.2c] Thẻ CC_FREE_CREDIT KHÔNG bị xóa khỏi hand[] sau vòng GO (hiệu lực suốt trận)', () => {
    // SPEC: card persists in hand throughout game (permanent recurring interest)
    const room = mgr.getRoom(roomCode)!;
    const p1   = room.players[0]!;
    p1.hand.push(ChanceCardId.CC_FREE_CREDIT);

    forcePassGo(mgr, roomCode, p1.id);

    // Card must remain in hand after GO pass
    // ❌ BUSINESS RED: even if GO logic were added, card must NOT be removed
    expect(p1.hand).toContain(ChanceCardId.CC_FREE_CREDIT);
  });

  it('[TC-06.2d] [Adversarial] Nếu không trừ lãi: balance tăng đúng 2.000 (sai spec — phải là 1.600)', () => {
    // Adversarial: if interest NOT deducted, balance = +GO_BONUS = +2000 — that's the WRONG behavior
    // This test asserts the CORRECT net is 1600; if it fails, interest logic is missing
    const room = mgr.getRoom(roomCode)!;
    const p1   = room.players[0]!;
    p1.hand.push(ChanceCardId.CC_FREE_CREDIT);
    const balanceBefore = p1.balance;

    forcePassGo(mgr, roomCode, p1.id);

    // MUST NOT be +2000 (no-interest scenario) — must be +1600 (with-interest scenario)
    // ❌ BUSINESS RED: currently no interest logic → balance IS +2000 → this assertion FAILS
    expect(p1.balance).not.toBe(balanceBefore + GO_BONUS);
  });
});

// ============================================================
// TC-06.3 — CC_SLOW_BUILD: unbuiltRounds > 2 → Auto-Auction
// [DEBT-S06-03][UC-GAME-058/MSS]
// Consumer assertion: property registry cleared + AuctionSession created
// ============================================================
describe('[TC-06.3/MSS][DEBT-S06-03] CC_SLOW_BUILD — C0 quá 2 vòng → Auto-Auction', () => {
  let mgr: RoomManager;
  let roomCode: string;
  let reg: Map<number, string>;
  let sm: Map<number, { level: number; unbuiltRounds?: number }>;

  beforeEach(() => {
    const s = setup();
    mgr      = s.mgr;
    roomCode = s.room.roomCode;
    reg      = s.reg;
    sm       = s.sm;
  });

  it('[TC-06.3a] CC_SLOW_BUILD handler: sets stateMap[cellIndex].unbuiltRounds = 1 (KHÔNG xóa ngay)', () => {
    // SPEC: handler sets unbuiltRounds = 1 on player's C0 property (countdown starts)
    // Current behavior: handler DELETES registry entry immediately (wrong!)
    const room = mgr.getRoom(roomCode)!;
    const p1   = room.players[0]!;
    reg.set(1, p1.id);
    sm.set(1, { level: 0 }); // C0

    executeChanceCard(ChanceCardId.CC_SLOW_BUILD, p1.id, room.players, undefined, reg, sm);

    // ❌ BUSINESS RED: current handler calls registry.delete(cellIndex) immediately
    // Property still belongs to P1 (not seized yet)
    expect(reg.get(1)).toBe(p1.id);
    // unbuiltRounds countdown begins
    expect(sm.get(1)?.unbuiltRounds).toBe(1);
  });

  it('[TC-06.3b] Sau 3 lượt không nâng cấp: ô đất bị thu hồi, auction được mở (startingBid = 50%)', () => {
    // SPEC: after unbuiltRounds > 2 in executeTurnEnd, property seized and auction triggered
    const room = mgr.getRoom(roomCode)!;
    const p1   = room.players[0]!;
    // Pre-state: unbuiltRounds = 2 (one more endTurn will push it to 3 → > 2 → trigger)
    reg.set(1, p1.id);
    sm.set(1, { level: 0, unbuiltRounds: 2 });

    room.phase = TurnPhase.PropertyManagement;
    mgr.handleEndTurn(roomCode, p1.id);

    // Consumer assertion: registry entry removed (land seized)
    // ❌ BUSINESS RED: executeTurnEnd has no unbuiltRounds counter logic
    expect(reg.get(1)).toBeUndefined();

    // Auction session created with 50% starting bid (standard auction, NOT insolvency 70%)
    const auction = (mgr as any).auctions.get(roomCode);
    const deed    = PROPERTY_DEEDS.get(1);
    expect(auction).toBeDefined();
    expect(auction?.cellIndex).toBe(1);
    expect(auction?.highestBid).toBe(Math.floor((deed?.price ?? 0) * 0.50));
  });

  it('[TC-06.3c] Tất cả players (kể cả cựu chủ P1) đều đủ điều kiện đặt giá', () => {
    // SPEC: unlike insolvency auction, CC_SLOW_BUILD auction allows ALL players to bid
    const room = mgr.getRoom(roomCode)!;
    const p1   = room.players[0]!;
    reg.set(1, p1.id);
    sm.set(1, { level: 0, unbuiltRounds: 2 });

    room.phase = TurnPhase.PropertyManagement;
    mgr.handleEndTurn(roomCode, p1.id);

    // ❌ BUSINESS RED: no auction created
    const auction = (mgr as any).auctions.get(roomCode);
    expect(auction).toBeDefined();

    // The former owner P1 should be allowed to bid (declinedPlayerId should NOT be P1)
    expect(auction?.declinedPlayerId).not.toBe(p1.id);
  });

  it('[TC-06.3d] Nâng cấp C1 reset unbuiltRounds = 0, không có auction', () => {
    // SPEC: upgrade clears unbuiltRounds — no auction fires
    const room = mgr.getRoom(roomCode)!;
    const p1   = room.players[0]!;
    reg.set(1, p1.id);
    // Simulate: player upgraded BEFORE this turn ends (level=1, unbuiltRounds=0)
    sm.set(1, { level: 1, unbuiltRounds: 0 });

    room.phase = TurnPhase.PropertyManagement;
    mgr.handleEndTurn(roomCode, p1.id);

    // Property still owned, no auction (upgrade cancelled the threat)
    expect(reg.get(1)).toBe(p1.id);
    const auction = (mgr as any).auctions.get(roomCode);
    expect(auction).toBeUndefined(); // ✓ This may already pass since no logic creates auction
  });

  it('[TC-06.3e] [Adversarial] unbuiltRounds không tăng → auction không mở (đếm là bắt buộc)', () => {
    // Adversarial: proves counter INCREMENT in executeTurnEnd is mandatory
    // If counter stays 0, auction NEVER fires — confirming the logic gap
    const room = mgr.getRoom(roomCode)!;
    const p1   = room.players[0]!;
    reg.set(1, p1.id);
    sm.set(1, { level: 0, unbuiltRounds: 0 }); // Counting never started

    // End P1's turn 3 times without any unbuiltRounds increment logic
    for (let i = 0; i < 3; i++) {
      const currentRoom = mgr.getRoom(roomCode)!;
      if (currentRoom.players[currentRoom.currentPlayerIndex]?.id === p1.id) {
        currentRoom.phase = TurnPhase.PropertyManagement;
        mgr.handleEndTurn(roomCode, p1.id);
      }
    }

    // ❌ BUSINESS RED: without increment logic, unbuiltRounds stays 0 — no auction
    // This test asserts THAT the counter was incremented (to prove the logic gap)
    const currentUnbuilt = sm.get(1)?.unbuiltRounds ?? 0;
    expect(currentUnbuilt).toBeGreaterThan(0); // ❌ stays 0 → FAILS confirming missing logic
  });
});

// ============================================================
// TC-06.4 — Auto-Auction InsolvencyManager: 70% giá niêm yết
// [DEBT-S06-04][UC-GAME-056/MSS]
// Consumer assertion: startingBid = price * 0.70, insolvent player excluded
// ============================================================
describe('[TC-06.4/MSS][DEBT-S06-04] InsolvencyManager — Auto-Auction khởi điểm 70% niêm yết', () => {
  let mgr: RoomManager;
  let roomCode: string;
  let reg: Map<number, string>;
  let sm: Map<number, { level: number; unbuiltRounds?: number }>;

  beforeEach(() => {
    const s = setup();
    mgr      = s.mgr;
    roomCode = s.room.roomCode;
    reg      = s.reg;
    sm       = s.sm;
  });

  it('[TC-06.4a] Cưỡng chế thanh lý: startingBid = listPrice * 0.70 (không phải 0.50)', () => {
    // SPEC §V.3: forced liquidation auction starts at 70% of list price
    // Current liquidateAssets() sells directly at 50% value — no auction created at all
    const room    = mgr.getRoom(roomCode)!;
    const p1      = room.players[0]!;
    const cellIdx = 1;

    reg.set(cellIdx, p1.id);
    sm.set(cellIdx, { level: 0 });
    p1.balance = -100; // Insolvent
    room.phase = TurnPhase.InsolvencyPhase;

    mgr.handleLiquidate(roomCode, p1.id);

    // ❌ BUSINESS RED: liquidateAssets sells directly (no auction), and at 50% not 70%
    const auction = (mgr as any).auctions.get(roomCode);
    const deed    = PROPERTY_DEEDS.get(cellIdx);

    expect(auction).toBeDefined();
    expect(auction?.highestBid).toBe(Math.floor((deed?.price ?? 0) * 0.70));
  });

  it('[TC-06.4b] Người phá sản P1 KHÔNG được phép đặt giá trong phiên cưỡng chế', () => {
    // SPEC: eligibleBidders = all players EXCEPT insolvent P1
    const room    = mgr.getRoom(roomCode)!;
    const p1      = room.players[0]!;
    const cellIdx = 1;

    reg.set(cellIdx, p1.id);
    sm.set(cellIdx, { level: 0 });
    p1.balance = -100;
    room.phase = TurnPhase.InsolvencyPhase;

    mgr.handleLiquidate(roomCode, p1.id);

    // ❌ BUSINESS RED: no auction created at all
    const auction = (mgr as any).auctions.get(roomCode);
    expect(auction).toBeDefined();

    // Attempt P1 bid — must be rejected
    const deed = PROPERTY_DEEDS.get(cellIdx)!;
    const bidAmount = Math.floor(deed.price * 0.70) + 100;
    const bidResult = mgr.handleAuctionBid(roomCode, p1.id, bidAmount);
    expect(bidResult.success).toBe(false);
  });

  it('[TC-06.4c] [Adversarial] startingBid = 0.50 adalah SALAH — phải fail khi assert 70%', () => {
    // Adversarial: confirms 70% check is specific; 50% must produce wrong result
    const room    = mgr.getRoom(roomCode)!;
    const p1      = room.players[0]!;
    const cellIdx = 1;

    reg.set(cellIdx, p1.id);
    sm.set(cellIdx, { level: 0 });
    p1.balance = -100;
    room.phase = TurnPhase.InsolvencyPhase;

    mgr.handleLiquidate(roomCode, p1.id);

    const auction = (mgr as any).auctions.get(roomCode);
    const deed    = PROPERTY_DEEDS.get(cellIdx);

    // ❌ BUSINESS RED: auction doesn't exist yet
    expect(auction).toBeDefined();
    // Must NOT be 50% (wrong per §V.3)
    expect(auction?.highestBid).not.toBe(Math.floor((deed?.price ?? 0) * 0.50));
    // Must be 70%
    expect(auction?.highestBid).toBe(Math.floor((deed?.price ?? 0) * 0.70));
  });

  it('[TC-06.4d] Tiền đấu giá thanh toán nợ P1; phần dư (nếu có) được trả lại P1', () => {
    // SPEC: after forced auction closes, debt paid from proceeds; surplus returned to P1
    const room    = mgr.getRoom(roomCode)!;
    const p1      = room.players[0]!;
    const p2      = room.players[1]!;
    const cellIdx = 1;
    const deed    = PROPERTY_DEEDS.get(cellIdx)!;

    reg.set(cellIdx, p1.id);
    sm.set(cellIdx, { level: 0 });
    const debtAmount = 300;
    p1.balance = -debtAmount; // Owe 300
    room.phase = TurnPhase.InsolvencyPhase;

    mgr.handleLiquidate(roomCode, p1.id);

    // ❌ BUSINESS RED: no auction created
    const auction = (mgr as any).auctions.get(roomCode);
    expect(auction).toBeDefined();

    // P2 wins auction at starting bid + 200
    const startingBid = Math.floor(deed.price * 0.70);
    const bidAmount   = startingBid + 200;
    room.phase = TurnPhase.AuctionPhase;
    const bidRes = mgr.handleAuctionBid(roomCode, p2.id, bidAmount);
    expect(bidRes.success).toBe(true);

    mgr.handleAuctionClose(roomCode);

    // P1's debt cleared, surplus returned: bidAmount - debtAmount > 0
    expect(p1.balance).toBeGreaterThanOrEqual(0);
    expect(p1.balance).toBe(bidAmount - debtAmount); // surplus back to P1
  });
});
