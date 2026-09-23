// [TC-IMP40/MSS] Telemetry Watchdog Real Gameplay Invariants & Edge Case Suite
import { describe, it, expect, beforeEach } from 'vitest';
import { handleDeltaTelemetry } from '../../src/client/telemetry/telemetry_delta_hook.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';
import { watchdogMonitor } from '../../src/client/telemetry/watchdog_monitor.js';
import type { GameState } from '../../src/client/store/game_store.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { TurnPhase } from '../../src/domain/room.js';

describe('[TC-IMP40/MSS] Telemetry Watchdog Gameplay Invariants Suite', () => {
  beforeEach(() => {
    useTelemetryStore.getState().reset();
    watchdogMonitor.reset();
  });

  const createTestState = (overrides?: {
    readonly p1Balance?: number;
    readonly bot2Balance?: number;
    readonly p1Pos?: number;
    readonly bot2Pos?: number;
    readonly p1Props?: readonly number[];
    readonly bot2Props?: readonly number[];
    readonly p1Mortgaged?: readonly number[];
    readonly bot2Mortgaged?: readonly number[];
    readonly roundNumber?: number;
    readonly treasuryPool?: number;
    readonly levels?: Record<number, number>;
  }): GameState =>
    ({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Player 1',
          balance: overrides?.p1Balance ?? 15_000,
          tokenColor: '#ff0000',
          ownedProperties: overrides?.p1Props ? [...overrides.p1Props] : [],
          mortgagedProperties: overrides?.p1Mortgaged ? [...overrides.p1Mortgaged] : [],
        },
        bot_2: {
          id: 'bot_2',
          name: 'Bot 2',
          balance: overrides?.bot2Balance ?? 15_000,
          tokenColor: '#00ff00',
          ownedProperties: overrides?.bot2Props ? [...overrides.bot2Props] : [],
          mortgagedProperties: overrides?.bot2Mortgaged ? [...overrides.bot2Mortgaged] : [],
        },
      },
      playerPositions: {
        p1: overrides?.p1Pos ?? 0,
        bot_2: overrides?.bot2Pos ?? 0,
      },
      levelMap: overrides?.levels ? { ...overrides.levels } : {},
      treasuryPool: overrides?.treasuryPool ?? 2_000,
      roundNumber: overrides?.roundNumber ?? 1,
      activeModal: null,
      currentTurnPlayerId: 'p1',
      turnTimeRemaining: 30,
    } as unknown as GameState);

  // === FACET 1: BOUNDARY (Teleport & Movement Edge Cases) ===

  it('[TC-IMP40.1/MSS] dịch chuyển sân bay (ô 22 tới 35) không kích hoạt INVALID_POSITION_STEP', () => {
    const pre = createTestState({ p1Pos: 22 });
    const post = createTestState({ p1Pos: 35 });

    const delta: DeltaPayload = {
      tick: 16,
      currentTurnPlayerId: 'p1',
      dice: [3, 4], // Xúc xắc cũ còn lưu từ lượt trước
      cells: [],
      players: [{ id: 'p1', position: 35, balance: 15_000 }],
      turnPhase: TurnPhase.ActionPhase,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
    expect(violations.length).toBe(0);
  });

  it('[TC-IMP40.2/MSS] thẻ Đại Nhạc Hội dịch chuyển tới ô dịch vụ 39 không kích hoạt INVALID_POSITION_STEP', () => {
    const pre = createTestState({ bot2Pos: 19 });
    const post = createTestState({ bot2Pos: 39 });

    const delta: DeltaPayload = {
      tick: 28,
      currentTurnPlayerId: 'p1',
      dice: [4, 6], // Xúc xắc của p1, không phải bot_2
      cells: [],
      players: [{ id: 'bot_2', position: 39, balance: 15_000 }],
      turnPhase: TurnPhase.ActionPhase,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
    expect(violations.length).toBe(0);
  });

  it('[TC-IMP40.3/MSS] rơi vào ô Lệnh Thanh Tra (ô 30 tới 10) không kích hoạt INVALID_POSITION_STEP', () => {
    const pre = createTestState({ p1Pos: 30 });
    const post = createTestState({ p1Pos: 10 });

    const delta: DeltaPayload = {
      tick: 30,
      currentTurnPlayerId: 'p1',
      dice: [5, 5],
      cells: [],
      players: [{ id: 'p1', position: 10, balance: 15_000 }],
      turnPhase: TurnPhase.ActionPhase,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
    expect(violations.length).toBe(0);
  });

  it('[TC-IMP40.4/MSS] di chuyển ngoài RollPhase không bị gán nhầm xúc xắc cũ', () => {
    const pre = createTestState({ p1Pos: 5 });
    const post = createTestState({ p1Pos: 15 });

    const delta: DeltaPayload = {
      tick: 31,
      currentTurnPlayerId: 'p1',
      dice: [1, 2], // Xúc xắc cũ 3 không khớp với bước nhảy 10
      cells: [],
      players: [{ id: 'p1', position: 15, balance: 15_000 }],
      turnPhase: TurnPhase.AuctionPhase, // Không phải RollPhase
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
    expect(violations.length).toBe(0);
  });

  // === FACET 2: STATE REACTIVITY (Mortgage, Downgrade & Credit) ===

  it('[TC-IMP40.5/MSS] thế chấp ô 32 giải ngân vốn vay +1500 Tr không kích hoạt TREASURY_INVARIANT_VIOLATED', () => {
    const pre = createTestState({ p1Props: [32], p1Balance: 15_000 });
    const post = createTestState({ p1Props: [32], p1Balance: 16_500 }); // Nhận vay 50% giá đất ô 32 (3000 * 0.5 = 1500)

    const delta: DeltaPayload = {
      tick: 12,
      currentTurnPlayerId: 'p1',
      cells: [{ index: 32, ownerId: 'p1', isMortgaged: true }],
      players: [{ id: 'p1', position: 0, balance: 16_500 }],
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
    expect(violations.length).toBe(0);
  });

  it('[TC-IMP40.6/MSS] hạ cấp công trình ô 21 nhận hoàn tiền không kích hoạt TREASURY_INVARIANT_VIOLATED', () => {
    const pre = createTestState({ p1Props: [21], levels: { 21: 2 }, p1Balance: 15_000 });
    const post = createTestState({ p1Props: [21], levels: { 21: 1 }, p1Balance: 15_770 }); // Hoàn tiền hạ cấp 770 Tr (50% của 1540)

    const delta: DeltaPayload = {
      tick: 13,
      currentTurnPlayerId: 'p1',
      cells: [{ index: 21, ownerId: 'p1', level: 1 }],
      players: [{ id: 'p1', position: 0, balance: 15_770 }],
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
    expect(violations.length).toBe(0);
  });

  it('[TC-IMP40.7/MSS] thẻ Vay Thấu Chi CC_OVERDRAFT (+3000 Tr) không gây báo động giả', () => {
    const pre = createTestState({ p1Balance: 15_000 });
    const post = createTestState({ p1Balance: 18_000 });

    const delta: DeltaPayload = {
      tick: 2,
      currentTurnPlayerId: 'p1',
      cells: [],
      players: [{ id: 'p1', position: 7, balance: 18_000, overdraftRoundsLeft: 3 }],
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
    expect(violations.length).toBe(0);
  });

  // === FACET 3: RESOURCE DISPOSAL (Taxes & Deductions) ===

  it('[TC-IMP40.8/MSS] qua GO bị trừ thuế đất đai tích lũy tính ròng chính xác', () => {
    const pre = createTestState({ p1Props: [1, 3, 6, 8], p1Pos: 38, p1Balance: 15_000 });
    const post = createTestState({ p1Props: [1, 3, 6, 8], p1Pos: 2, p1Balance: 16_400 }); // Net delta: 2000 - 600 = +1400 Tr

    const delta: DeltaPayload = {
      tick: 21,
      currentTurnPlayerId: 'p1',
      dice: [2, 2],
      cells: [],
      players: [{ id: 'p1', position: 2, balance: 16_400 }],
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
    expect(violations.length).toBe(0);
  });

  it('[TC-IMP40.9/MSS] giao dịch tiền tệ chuyển nhượng nội bộ (thuê đất) bảo toàn 100% tiền tệ', () => {
    const pre = createTestState({ p1Balance: 15_000, bot2Balance: 15_000 });
    const post = createTestState({ p1Balance: 14_000, bot2Balance: 16_000 });

    const delta: DeltaPayload = {
      tick: 22,
      currentTurnPlayerId: 'p1',
      cells: [],
      players: [
        { id: 'p1', position: 5, balance: 14_000 },
        { id: 'bot_2', position: 0, balance: 16_000 },
      ],
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
    expect(violations.length).toBe(0);
  });

  it('[TC-IMP40.10/MSS] khấu trừ thuế hoặc phí không rõ nguồn gốc không báo động nếu delta chưa định danh', () => {
    const pre = createTestState({ p1Balance: 15_000 });
    const post = createTestState({ p1Balance: 13_500 }); // Khấu trừ 1500 Tr (phạt hợp đồng hoặc lãi vay tại cell Audit)

    const delta: DeltaPayload = {
      tick: 35,
      currentTurnPlayerId: 'p1',
      cells: [],
      players: [{ id: 'p1', position: 10, balance: 13_500 }],
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
    expect(violations.length).toBe(0);
  });

  // === FACET 4: ERROR DEFENSE (Real Cheating & Defects Must Still Be Caught) ===

  it('[TC-IMP40.11/MSS] gian lận bước nhảy thật trong WaitingRoll (lắc 5 nhảy 17 ô) VẪN PHẢI BỊ BẮT', () => {
    const pre = createTestState({ p1Pos: 0 });
    const post = createTestState({ p1Pos: 17 }); // Nhảy 17 ô trong khi xúc xắc 2+3=5

    const delta: DeltaPayload = {
      tick: 100,
      currentTurnPlayerId: 'p1',
      dice: [2, 3],
      cells: [],
      players: [{ id: 'p1', position: 17, balance: 15_000 }],
      turnPhase: TurnPhase.WaitingRoll,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
    expect(violations.length).toBe(1);
    expect(violations[0]?.details.expected).toBe(5);
    expect(violations[0]?.details.to).toBe(17);
  });

  it('[TC-IMP40.12/MSS] sở hữu ô đất đặc biệt trái phép VẪN PHẢI BỊ BẮT', () => {
    const pre = createTestState();
    const post = createTestState();

    const delta: DeltaPayload = {
      tick: 101,
      currentTurnPlayerId: 'p1',
      cells: [{ index: 0, ownerId: 'p1' }], // Ô 0 là GO, không thể sở hữu
      players: [],
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'PROPERTY_OWNERSHIP_CORRUPTED');
    expect(violations.length).toBe(1);
  });

  it('[TC-IMP40.13/MSS] nâng cấp công trình vượt ngưỡng cấp 3 VẪN PHẢI BỊ BẮT', () => {
    const pre = createTestState();
    const post = createTestState();

    const delta: DeltaPayload = {
      tick: 102,
      currentTurnPlayerId: 'p1',
      cells: [{ index: 1, level: 4 }], // Cấp 4 vượt trần 3
      players: [],
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'PROPERTY_OWNERSHIP_CORRUPTED');
    expect(violations.length).toBe(1);
  });

  it('[TC-IMP40.14/MSS] số dư âm ngoài trạng thái vỡ nợ VẪN PHẢI BỊ BẮT', () => {
    const pre = createTestState();
    const post = createTestState({ p1Balance: -100 });

    const delta: DeltaPayload = {
      tick: 103,
      currentTurnPlayerId: 'p1',
      cells: [],
      players: [{ id: 'p1', position: 0, balance: -100 }],
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY');
    expect(violations.length).toBe(1);
  });

  it('[TC-IMP40.15/MSS] đấu giá thất bại (mọi người bỏ qua) không gây bất kỳ vi phạm nào', () => {
    const pre = createTestState();
    const post = createTestState();

    const delta: DeltaPayload = {
      tick: 104,
      currentTurnPlayerId: 'p1',
      cells: [],
      players: [],
      auction: {
        cellIndex: 25,
        currentBid: 1400,
        highestBidderId: null,
        timeRemaining: 0,
        hasPassed: true,
      },
    };

    handleDeltaTelemetry(delta, pre, post);
    expect(useTelemetryStore.getState().violations.length).toBe(0);
  });

  it('[TC-IMP40.16/MSS] telemetry store lưu đầy đủ snapshot lịch sử cho mỗi delta', () => {
    const pre = createTestState();
    const post = createTestState();

    const delta: DeltaPayload = {
      tick: 105,
      currentTurnPlayerId: 'p1',
      cells: [],
      players: [{ id: 'p1', position: 2, balance: 15_000 }],
    };

    handleDeltaTelemetry(delta, pre, post);
    expect(useTelemetryStore.getState().snapshots.length).toBe(1);
  });

  // === FACET 5: DYNAMIC ROUND GO SALARY & UNMORTGAGE HARDENING ===

  it('[TC-IMP40.17/MSS] nhận lương qua ô GO tại Vòng 21-30 (+1.500 Tr.) không báo TREASURY_INVARIANT_VIOLATED', () => {
    const pre = createTestState({ p1Pos: 38, p1Balance: 10_000, roundNumber: 21 });
    const post = createTestState({ p1Pos: 2, p1Balance: 11_500, roundNumber: 21 });

    const delta: DeltaPayload = {
      tick: 311,
      currentTurnPlayerId: 'p1',
      roundNumber: 21,
      dice: [2, 2],
      cells: [],
      players: [{ id: 'p1', position: 2, balance: 11_500 }],
      turnPhase: TurnPhase.ActionPhase,
      roomStarted: true,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
    expect(violations.length).toBe(0);
  });

  it('[TC-IMP40.18/MSS] nhận lương qua ô GO tại Vòng 31+ (+1.000 Tr.) không báo TREASURY_INVARIANT_VIOLATED', () => {
    const pre = createTestState({ p1Pos: 37, p1Balance: 8_000, roundNumber: 31 });
    const post = createTestState({ p1Pos: 1, p1Balance: 9_000, roundNumber: 31 });

    const delta: DeltaPayload = {
      tick: 405,
      currentTurnPlayerId: 'p1',
      roundNumber: 31,
      dice: [2, 2],
      cells: [],
      players: [{ id: 'p1', position: 1, balance: 9_000 }],
      turnPhase: TurnPhase.ActionPhase,
      roomStarted: true,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
    expect(violations.length).toBe(0);
  });

  it('[TC-IMP40.19/MSS] chuộc thế chấp bất động sản (ô 16 giá 1.800 Tr., nợ 900, phí kho bạc 90) không báo TREASURY_INVARIANT_VIOLATED', () => {
    // Cell 16 (Hải Phòng) giá 1.800 Tr. Loan: 900 Tr. Fee: 90 Tr. Tổng trả: 990 Tr.
    // bot_2 balance: 2167 -> 1177 (-990). Kho bạc: 10796 -> 10886 (+90). Net actual delta: -900 Tr.
    const pre = createTestState({
      bot2Balance: 2167,
      bot2Props: [16],
      bot2Mortgaged: [16],
      treasuryPool: 10796,
      roundNumber: 21,
    });
    const post = createTestState({
      bot2Balance: 1177,
      bot2Props: [16],
      bot2Mortgaged: [],
      treasuryPool: 10886,
      roundNumber: 21,
    });

    const delta: DeltaPayload = {
      tick: 314,
      currentTurnPlayerId: 'bot_2',
      roundNumber: 21,
      cells: [{ index: 16, ownerId: 'bot_2', level: 0, isMortgaged: false }],
      players: [{ id: 'bot_2', position: 10, balance: 1177 }],
      treasury: 10886,
      roomStarted: true,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
    expect(violations.length).toBe(0);
  });

  it('[TC-IMP40.20/MSS] delta gửi lại isMortgaged: true khi ô đã thế chấp không bị cộng dồn trùng lặp delta', () => {
    const pre = createTestState({
      bot2Balance: 5000,
      bot2Props: [16],
      bot2Mortgaged: [16], // Đã thế chấp từ trước
      treasuryPool: 2000,
    });
    const post = createTestState({
      bot2Balance: 5000,
      bot2Props: [16],
      bot2Mortgaged: [16],
      treasuryPool: 2000,
    });

    const delta: DeltaPayload = {
      tick: 320,
      currentTurnPlayerId: 'bot_2',
      cells: [{ index: 16, ownerId: 'bot_2', level: 0, isMortgaged: true }],
      players: [{ id: 'bot_2', position: 10, balance: 5000 }],
      roomStarted: true,
    };

    handleDeltaTelemetry(delta, pre, post);
    const violations = useTelemetryStore.getState().violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
    expect(violations.length).toBe(0);
  });

  // === FACET 6: ROOM RESET & LOBBY MOVEMENT SUPPRESSION ===

  it('[TC-IMP40.21/MSS] reset phòng về sảnh chờ (roomStarted: false, vị trí nhảy 27 -> 0 không có xúc xắc) KHÔNG báo INVALID_POSITION_STEP', () => {
    // Tình huống phòng VTHUQQ: người chơi AFK 3 phút, server reset phòng về sảnh chờ
    const pre = createTestState({ p1Pos: 27, p1Balance: 11_000, roundNumber: 7 });
    const post = createTestState({ p1Pos: 0, p1Balance: 15_000, roundNumber: 1 });

    const delta: DeltaPayload = {
      tick: 1,
      currentTurnPlayerId: 'p1',
      roundNumber: 1,
      cells: Array.from({ length: 40 }, (_, index) => ({ index, ownerId: null })),
      players: [{ id: 'p1', position: 0, balance: 15_000 }],
      turnPhase: TurnPhase.WaitingRoll,
      roomStarted: false,
    };

    handleDeltaTelemetry(delta, pre, post);
    const moveViolations = useTelemetryStore.getState().violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
    expect(moveViolations.length).toBe(0);
  });

  it('[TC-IMP40.22/MSS] verifyMovementStep trả về null khi roomStarted là false', async () => {
    const { verifyMovementStep } = await import('../../src/client/telemetry/invariant_checker.js');
    const result = verifyMovementStep({
      fromPosition: 27,
      toPosition: 0,
      tick: 1,
      roomStarted: false,
    });
    expect(result).toBeNull();
  });
});
