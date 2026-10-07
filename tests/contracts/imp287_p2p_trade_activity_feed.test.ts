// [TC-287.01..06/MSS][TC-287.07..08/A1..A2][UC-IMP287] P2P Trade Activity Feed Contract Suite
// Traceability Tags: [TC-287.01][UC-IMP287/MSS] .. [TC-287.06][UC-IMP287/MSS], [TC-287.07][UC-IMP287/A1], [TC-287.08][UC-IMP287/A2]
// SSOT Reference: .agents/plans/PLAN_IMP_287_P2P_TRADE_ACTIVITY_FEED.md, docs/domain/gotchas/fsm_lifecycle.md

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  detectPropertyAndLevelActivities,
  getCellName,
} from '../../src/client/network/activity_property_tracker.js';
import {
  trackDeltaActivities,
  resetTransitActivityTracker,
  resetEventCardActivityTracker,
  resetAuctionActivityTracker,
  resetHoseActivityTracker,
} from '../../src/client/network/activity_tracker.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import { useGameStore, type GameState, type PlayerHudInfo } from '../../src/client/store/game_store.js';
import type { DeltaPayload, PlayerDelta, CellDelta } from '../../src/server/delta_types.js';

function createMockPlayerHudInfo(overrides: Partial<PlayerHudInfo> & { id: string }): PlayerHudInfo {
  return {
    name: overrides.name ?? overrides.id.toUpperCase(),
    balance: 15_000,
    tokenColor: '#38BDF8',
    ownedProperties: [],
    ...overrides,
  };
}

function createMockPlayerDelta(overrides: Partial<PlayerDelta> & { id: string }): PlayerDelta {
  return {
    position: 0,
    balance: 15_000,
    ...overrides,
  };
}

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    playerPositions: { p1: 0, p2: 0 },
    playersInfo: {
      p1: createMockPlayerHudInfo({ id: 'p1', name: 'Người chơi 1', tokenColor: '#EF4444', ownedProperties: [1] }),
      p2: createMockPlayerHudInfo({ id: 'p2', name: 'Người chơi 2', tokenColor: '#3B82F6', ownedProperties: [3] }),
    },
    ...overrides,
  };
}

function createMockDelta(overrides: Partial<DeltaPayload> = {}): DeltaPayload {
  return {
    tick: 1,
    cells: [],
    ...overrides,
  };
}

describe('IMP-287 Contract Tests: P2P Trade Activity Feed & Causal Financial Projection', () => {
  beforeEach(() => {
    useActivityStore.setState({
      activityLogs: [],
      isActivityFeedOpen: false,
      unreadCount: 0,
      activeFilter: 'all',
      lastDiceSeq: undefined,
      lastAuctionBid: undefined,
    });
    resetTransitActivityTracker();
    resetEventCardActivityTracker();
    resetHoseActivityTracker();
    resetAuctionActivityTracker();
  });

  afterEach(() => {
    useActivityStore.setState({
      activityLogs: [],
      isActivityFeedOpen: false,
      unreadCount: 0,
      activeFilter: 'all',
      lastDiceSeq: undefined,
      lastAuctionBid: undefined,
    });
  });

  // [TC-287.01][UC-IMP287/MSS]
  it('[TC-287.01][UC-IMP287/MSS] Given delta chứa lastTradeResult mua bán BĐS bằng tiền thuần, When detectPropertyAndLevelActivities thực thi, Then nhật ký ghi nhận định dạng Chuyển Nhượng kèm đầy đủ tên người mua người bán tên ô đất và giá tiền', () => {
    const prevState = createMockGameState();
    const nextState = createMockGameState({
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', name: 'Người chơi 1', tokenColor: '#EF4444', ownedProperties: [] }),
        p2: createMockPlayerHudInfo({ id: 'p2', name: 'Người chơi 2', tokenColor: '#3B82F6', ownedProperties: [1, 3] }),
      },
    });
    const cellDelta: CellDelta = { index: 1, ownerId: 'p2' };
    const delta = createMockDelta({
      cells: [cellDelta],
      lastTradeResult: {
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 1,
        price: 1000,
        taxAmount: 50,
        timestamp: 1700000000000,
      },
    });

    const { entries } = detectPropertyAndLevelActivities(delta, prevState, nextState);
    const entry = entries[0];
    const cellName = getCellName(1);

    expect(entry?.type).toBe('trade');
    expect(entry?.message).toContain('🤝 [Chuyển Nhượng]');
    expect(entry?.message).toContain(`Người chơi 2 đã mua ${cellName} từ Người chơi 1 với giá 1.000`);
  });

  // [TC-287.02][UC-IMP287/MSS]
  it('[TC-287.02][UC-IMP287/MSS] Given delta chứa lastTradeResult có thuế chuyển nhượng 5 phần trăm, When detectPropertyAndLevelActivities thực thi, Then chuỗi message chứa thông tin Thuế kho bạc tương ứng', () => {
    const prevState = createMockGameState();
    const nextState = createMockGameState({
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', name: 'Người chơi 1', tokenColor: '#EF4444', ownedProperties: [] }),
        p2: createMockPlayerHudInfo({ id: 'p2', name: 'Người chơi 2', tokenColor: '#3B82F6', ownedProperties: [1, 3] }),
      },
    });
    const delta = createMockDelta({
      cells: [{ index: 1, ownerId: 'p2' }],
      lastTradeResult: {
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 1,
        price: 1000,
        taxAmount: 50,
        timestamp: 1700000000000,
      },
    });

    const { entries } = detectPropertyAndLevelActivities(delta, prevState, nextState);
    const entry = entries[0];

    expect(entry?.message).toContain('(Thuế kho bạc: 50)');
    expect(entry?.targetPlayerId).toBe('p1');
  });

  // [TC-287.03][UC-IMP287/MSS]
  it('[TC-287.03][UC-IMP287/MSS] Given delta chứa lastTradeResult có giá tiền price lớn hơn 0, When detectPropertyAndLevelActivities thực thi, Then thuộc tính amount của entry mang giá trị âm trừ price của người mua', () => {
    const prevState = createMockGameState();
    const nextState = createMockGameState({
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', name: 'Người chơi 1', tokenColor: '#EF4444', ownedProperties: [] }),
        p2: createMockPlayerHudInfo({ id: 'p2', name: 'Người chơi 2', tokenColor: '#3B82F6', ownedProperties: [1, 3] }),
      },
    });
    const delta = createMockDelta({
      cells: [{ index: 1, ownerId: 'p2' }],
      lastTradeResult: {
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 1,
        price: 1000,
        taxAmount: 50,
        timestamp: 1700000000000,
      },
    });

    const { entries } = detectPropertyAndLevelActivities(delta, prevState, nextState);
    const entry = entries[0];

    expect(entry?.amount).toBe(-1000);
  });

  // [TC-287.04][UC-IMP287/MSS]
  it('[TC-287.04][UC-IMP287/MSS] Given delta chứa lastTradeResult là giao dịch hoán đổi BĐS kèm tiền bù, When detectPropertyAndLevelActivities thực thi, Then nhật ký ghi nhận định dạng Hoán Đổi với cả 2 ô đất và số tiền bù', () => {
    const prevState = createMockGameState();
    const nextState = createMockGameState({
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', name: 'Người chơi 1', tokenColor: '#EF4444', ownedProperties: [3] }),
        p2: createMockPlayerHudInfo({ id: 'p2', name: 'Người chơi 2', tokenColor: '#3B82F6', ownedProperties: [1] }),
      },
    });
    const delta = createMockDelta({
      cells: [
        { index: 1, ownerId: 'p2' },
        { index: 3, ownerId: 'p1' },
      ],
      lastTradeResult: {
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 1,
        offeredCellIndex: 3,
        price: 500,
        taxAmount: 25,
        timestamp: 1700000000000,
      },
    });

    const { entries } = detectPropertyAndLevelActivities(delta, prevState, nextState);
    const entry = entries[0];
    const cell1Name = getCellName(1);
    const cell2Name = getCellName(3);

    expect(entry?.message).toContain('🤝 [Hoán Đổi]');
    expect(entry?.message).toContain(`${cell1Name} ⇄ ${cell2Name}`);
    expect(entry?.message).toContain('kèm bù 500');
    expect(entry?.message).toContain('Thuế kho bạc: 25');
  });

  // [TC-287.05][UC-IMP287/MSS]
  it('[TC-287.05][UC-IMP287/MSS] Given giao dịch hoán đổi BĐS có cả 2 ô đất cùng đổi chủ trong delta cells, When detectPropertyAndLevelActivities thực thi, Then chỉ tạo đúng 1 bản ghi hoán đổi duy nhất', () => {
    const prevState = createMockGameState();
    const nextState = createMockGameState({
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', name: 'Người chơi 1', tokenColor: '#EF4444', ownedProperties: [3] }),
        p2: createMockPlayerHudInfo({ id: 'p2', name: 'Người chơi 2', tokenColor: '#3B82F6', ownedProperties: [1] }),
      },
    });
    const delta = createMockDelta({
      cells: [
        { index: 1, ownerId: 'p2' },
        { index: 3, ownerId: 'p1' },
      ],
      lastTradeResult: {
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 1,
        offeredCellIndex: 3,
        price: 500,
        taxAmount: 25,
        timestamp: 1700000000000,
      },
    });

    const { entries } = detectPropertyAndLevelActivities(delta, prevState, nextState);

    expect(entries).toHaveLength(1);
  });

  // [TC-287.06][UC-IMP287/MSS]
  it('[TC-287.06][UC-IMP287/MSS] Given giao dịch hoán đổi BĐS ngang giá price bằng 0, When detectPropertyAndLevelActivities thực thi, Then nhật ký ghi nhận hoán đổi không kèm tiền bù', () => {
    const prevState = createMockGameState();
    const nextState = createMockGameState({
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', name: 'Người chơi 1', tokenColor: '#EF4444', ownedProperties: [3] }),
        p2: createMockPlayerHudInfo({ id: 'p2', name: 'Người chơi 2', tokenColor: '#3B82F6', ownedProperties: [1] }),
      },
    });
    const delta = createMockDelta({
      cells: [
        { index: 1, ownerId: 'p2' },
        { index: 3, ownerId: 'p1' },
      ],
      lastTradeResult: {
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 1,
        offeredCellIndex: 3,
        price: 0,
        taxAmount: 0,
        timestamp: 1700000000000,
      },
    });

    const { entries } = detectPropertyAndLevelActivities(delta, prevState, nextState);
    const entry = entries[0];

    expect(entry?.message).toContain('🤝 [Hoán Đổi]');
    expect(entry?.message).toContain('hoán đổi quyền sở hữu');
    expect(entry?.message).not.toContain('kèm bù');
  });

  // [TC-287.07][UC-IMP287/A1]
  it('[TC-287.07][UC-IMP287/A1] Given delta không có lastTradeResult nhưng có ô đất đổi chủ cũ sang chủ mới, When detectPropertyAndLevelActivities thực thi, Then hàm fallback về thông báo chuyển nhượng cơ bản an toàn', () => {
    const prevState = createMockGameState();
    const nextState = createMockGameState({
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', name: 'Người chơi 1', tokenColor: '#EF4444', ownedProperties: [] }),
        p2: createMockPlayerHudInfo({ id: 'p2', name: 'Người chơi 2', tokenColor: '#3B82F6', ownedProperties: [1, 3] }),
      },
    });
    const delta = createMockDelta({
      cells: [{ index: 1, ownerId: 'p2' }],
      lastTradeResult: undefined,
    });

    const { entries } = detectPropertyAndLevelActivities(delta, prevState, nextState);
    const entry = entries[0];
    const cellName = getCellName(1);

    expect(entries).toHaveLength(1);
    expect(entry?.type).toBe('trade');
    expect(entry?.message).toBe(`Người chơi 2 đã nhận chuyển nhượng ${cellName} từ Người chơi 1`);
    expect(entry?.amount).toBeUndefined();
  });

  // [TC-287.08][UC-IMP287/A2]
  it('[TC-287.08][UC-IMP287/A2] Given giao dịch P2P hoàn tất, When trackDeltaActivities thực thi toàn diện, Then không sinh log thanh toán số dư rác từ extractMiscellaneousBalances', () => {
    const prevState = createMockGameState({
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', name: 'Người chơi 1', balance: 10_000, ownedProperties: [1] }),
        p2: createMockPlayerHudInfo({ id: 'p2', name: 'Người chơi 2', balance: 10_000, ownedProperties: [] }),
      },
    });
    const nextState = createMockGameState({
      playersInfo: {
        p1: createMockPlayerHudInfo({ id: 'p1', name: 'Người chơi 1', balance: 10_950, ownedProperties: [] }),
        p2: createMockPlayerHudInfo({ id: 'p2', name: 'Người chơi 2', balance: 9_000, ownedProperties: [1] }),
      },
    });
    const delta = createMockDelta({
      tick: 2,
      cells: [],
      players: [
        createMockPlayerDelta({ id: 'p1', balance: 10_950 }),
        createMockPlayerDelta({ id: 'p2', balance: 9_000 }),
      ],
      lastTradeResult: {
        sellerId: 'p1',
        buyerId: 'p2',
        cellIndex: 1,
        price: 1000,
        taxAmount: 50,
        timestamp: 1700000000000,
      },
    });

    trackDeltaActivities(delta, prevState, nextState, useActivityStore);

    const logs = useActivityStore.getState().activityLogs;
    const junkLogs = logs.filter(
      (l) => l.type === 'tax' || l.type === 'bail' || (l.type === 'system' && l.message.includes('tiền thưởng')),
    );

    expect(junkLogs).toHaveLength(0);
  });
});
