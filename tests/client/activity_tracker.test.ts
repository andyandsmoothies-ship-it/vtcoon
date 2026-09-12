// [TC-UI06.2/MSS] Test Suite ActivityTracker — Event Extraction from DeltaPayload & GameState
import { describe, it, expect, beforeEach } from 'vitest';
import {
  trackDeltaActivities,
  detectDiceActivity,
  detectMoveActivities,
  detectPropertyAndLevelActivities,
  detectFinancialAndStatusActivities,
  detectAuctionActivities,
} from '../../src/client/network/activity_tracker';
import { useActivityStore } from '../../src/client/store/activity_store';
import { useGameStore, type GameState } from '../../src/client/store/game_store';
import { applyDeltaToStore } from '../../src/client/network/apply_delta';
import type { DeltaPayload } from '../../src/server/session_manager';
import { BOARD_SIZE } from '../../src/domain/room';

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    levelMap: {},
    playerPositions: { p1: 0, p2: 0 },
    dice: [1, 1],
    playersInfo: {
      p1: {
        id: 'p1',
        name: 'Đại Gia Sài Gòn',
        balance: 15000,
        tokenColor: '#38BDF8',
        ownedProperties: [],
        mortgagedProperties: [],
      },
      p2: {
        id: 'p2',
        name: 'Tỷ Phú Hà Nội',
        balance: 15000,
        tokenColor: '#F59E0B',
        ownedProperties: [],
        mortgagedProperties: [],
      },
    },
    currentTurnPlayerId: 'p1',
    turnTimeRemaining: 60,
    treasuryPool: 2000,
    roundNumber: 1,
    maxRounds: 30,
    ...overrides,
  };
}

describe('[TC-ACT02/MSS] ActivityTracker Unit Tests', () => {
  beforeEach(() => {
    useActivityStore.setState({
      activityLogs: [],
      isActivityFeedOpen: false,
      unreadCount: 0,
      activeFilter: 'all',
    });
  });

  it('Trich xuat su kien xuc xac: Thuong va Do Doi', () => {
    const nextState = createMockGameState();
    const deltaNormal: DeltaPayload = {
      tick: 1,
      cells: [],
      dice: [3, 4],
      currentTurnPlayerId: 'p1',
    };
    const logNormal = detectDiceActivity(deltaNormal, nextState);
    expect(logNormal).not.toBeNull();
    expect(logNormal?.type).toBe('dice');
    expect(logNormal?.message).toContain('Đại Gia Sài Gòn đã gieo xúc xắc được 3 + 4 = 7 điểm');
    expect(logNormal?.message).not.toContain('Đổ đôi');

    const deltaDouble: DeltaPayload = {
      tick: 2,
      cells: [],
      dice: [5, 5],
      currentTurnPlayerId: 'p1',
    };
    const logDouble = detectDiceActivity(deltaDouble, nextState);
    expect(logDouble?.message).toContain('Đổ đôi! 🎉');
  });

  it('Trich xuat su kien di chuyen quan co', () => {
    const prevState = createMockGameState({ playerPositions: { p1: 0, p2: 0 } });
    const nextState = createMockGameState({ playerPositions: { p1: 1, p2: 0 } });
    const delta: DeltaPayload = {
      tick: 3,
      cells: [],
      players: [{ id: 'p1', position: 1, balance: 15000 }],
    };

    const moveLogs = detectMoveActivities(delta, prevState, nextState);
    expect(moveLogs).toHaveLength(1);
    expect(moveLogs[0]?.type).toBe('move');
    expect(moveLogs[0]?.message).toContain('Đại Gia Sài Gòn đã di chuyển đến');
    expect(moveLogs[0]?.cellIndex).toBe(1);
  });

  it('Trich xuat su kien mua bat dong san moi tu Ngan Hang', () => {
    const prevState = createMockGameState();
    const nextState = createMockGameState({
      playersInfo: {
        ...prevState.playersInfo,
        p1: { ...prevState.playersInfo.p1!, ownedProperties: [1] },
      },
    });
    const delta: DeltaPayload = {
      tick: 4,
      cells: [{ index: 1, ownerId: 'p1' }],
    };

    const { entries } = detectPropertyAndLevelActivities(delta, prevState, nextState);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.type).toBe('buy');
    expect(entries[0]?.message).toContain('Đại Gia Sài Gòn đã mua');
    expect(entries[0]?.amount).toBeLessThan(0);
    expect(entries[0]?.cellIndex).toBe(1);
  });

  it('Trich xuat su kien nang cap cong trinh tu C0 len C1, C2, C3', () => {
    const prevState = createMockGameState({
      levelMap: { 1: 0 },
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Gòn',
          balance: 15000,
          tokenColor: '#38BDF8',
          ownedProperties: [1],
        },
      },
    });
    const nextState = createMockGameState({
      levelMap: { 1: 1 },
      playersInfo: prevState.playersInfo,
    });
    const delta: DeltaPayload = {
      tick: 5,
      cells: [{ index: 1, level: 1, ownerId: 'p1' }],
    };

    const { entries } = detectPropertyAndLevelActivities(delta, prevState, nextState);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.type).toBe('upgrade');
    expect(entries[0]?.message).toContain('Đại Gia Sài Gòn đã nâng cấp');
    expect(entries[0]?.message).toContain('C1 (Nhà Phố)');
  });

  it('Trich xuat su kien the chap va chuoc the chap bat dong san', () => {
    const prevState = createMockGameState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Gòn',
          balance: 5000,
          tokenColor: '#38BDF8',
          ownedProperties: [1],
          mortgagedProperties: [],
        },
      },
    });
    const deltaMortgage: DeltaPayload = {
      tick: 6,
      cells: [{ index: 1, isMortgaged: true, ownerId: 'p1' }],
    };
    const { entries: mortgageEntries } = detectPropertyAndLevelActivities(
      deltaMortgage,
      prevState,
      prevState,
    );
    expect(mortgageEntries[0]?.type).toBe('mortgage');
    expect(mortgageEntries[0]?.message).toContain('đã thế chấp');

    // Chuoc the chap
    const prevMortgagedState = createMockGameState({
      playersInfo: {
        p1: {
          ...prevState.playersInfo.p1!,
          mortgagedProperties: [1],
        },
      },
    });
    const deltaUnmortgage: DeltaPayload = {
      tick: 7,
      cells: [{ index: 1, isMortgaged: false, ownerId: 'p1' }],
    };
    const { entries: unmortgageEntries } = detectPropertyAndLevelActivities(
      deltaUnmortgage,
      prevMortgagedState,
      prevMortgagedState,
    );
    expect(unmortgageEntries[0]?.type).toBe('mortgage');
    expect(unmortgageEntries[0]?.message).toContain('đã chuộc lại');
  });

  it('Trich xuat su kien tra tien thue giua 2 nguoi choi', () => {
    const prevState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Đại Gia Sài Gòn', balance: 15000, tokenColor: '#38BDF8', ownedProperties: [] },
        p2: { id: 'p2', name: 'Tỷ Phú Hà Nội', balance: 15000, tokenColor: '#F59E0B', ownedProperties: [1] },
      },
    });
    const nextState = createMockGameState({
      playersInfo: {
        p1: { ...prevState.playersInfo.p1!, balance: 14200 },
        p2: { ...prevState.playersInfo.p2!, balance: 15800 },
      },
    });
    const delta: DeltaPayload = {
      tick: 8,
      cells: [],
      players: [
        { id: 'p1', position: 1, balance: 14200 },
        { id: 'p2', position: 0, balance: 15800 },
      ],
    };

    const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.type).toBe('rent');
    expect(entries[0]?.message).toContain('Đại Gia Sài Gòn đã trả 800 Tr. tiền thuê cho Tỷ Phú Hà Nội');
    expect(entries[0]?.amount).toBe(-800);
  });

  it('Trich xuat su kien nop thue/nop phat va nhan thuong', () => {
    const prevState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Đại Gia Sài Gòn', balance: 15000, tokenColor: '#38BDF8', ownedProperties: [] },
      },
    });
    const nextState = createMockGameState({
      playersInfo: {
        p1: { ...prevState.playersInfo.p1!, balance: 14500 },
      },
    });
    // Nop thue
    const deltaTax: DeltaPayload = {
      tick: 9,
      cells: [],
      players: [{ id: 'p1', position: 4, balance: 14500 }],
    };
    const taxEntries = detectFinancialAndStatusActivities(deltaTax, prevState, nextState, []);
    expect(taxEntries[0]?.type).toBe('tax');
    expect(taxEntries[0]?.message).toContain('đã nộp phí / nộp thuế 500 Tr.');

    // Nhan thuong
    const deltaReward: DeltaPayload = {
      tick: 10,
      cells: [],
      players: [{ id: 'p1', position: 0, balance: 17000 }],
    };
    const rewardEntries = detectFinancialAndStatusActivities(
      deltaReward,
      prevState,
      createMockGameState({
        playersInfo: { p1: { ...prevState.playersInfo.p1!, balance: 17000 } },
      }),
      [],
    );
    expect(rewardEntries[0]?.type).toBe('system');
    expect(rewardEntries[0]?.message).toContain('đã nhận được 2.000 Tr. tiền thưởng');
  });

  it('Trich xuat su kien tuyen bo pha san', () => {
    const prevState = createMockGameState({
      playersInfo: {
        p1: { id: 'p1', name: 'Đại Gia Sài Gòn', balance: -500, tokenColor: '#38BDF8', ownedProperties: [] },
      },
    });
    const nextState = createMockGameState({
      playersInfo: {
        p1: { ...prevState.playersInfo.p1!, bankrupt: true },
      },
    });
    const delta: DeltaPayload = {
      tick: 11,
      cells: [],
      players: [{ id: 'p1', position: 1, balance: -500, bankrupt: true }],
    };

    const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
    expect(entries.some((e) => e.type === 'bankrupt')).toBe(true);
    const bankruptEntry = entries.find((e) => e.type === 'bankrupt');
    expect(bankruptEntry?.message).toContain('🚨 Đại Gia Sài Gòn đã tuyên bố PHÁ SẢN');
  });

  it('Trich xuat su kien dau gia', () => {
    const nextState = createMockGameState();
    const delta: DeltaPayload = {
      tick: 12,
      cells: [],
      auction: {
        cellIndex: 1,
        currentBid: 1200,
        highestBidderId: 'p1',
        timeRemaining: 15,
      },
    };

    const entries = detectAuctionActivities(delta, nextState);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.type).toBe('auction');
    expect(entries[0]?.message).toContain('Đại Gia Sài Gòn đã đặt giá 1.200 Tr.');
  });

  it('[Adversarial Guard] Full Sync (cells.length === BOARD_SIZE) khong duoc sinh ra spam log', () => {
    const prevState = createMockGameState();
    const nextState = createMockGameState();
    const fullCells = Array.from({ length: BOARD_SIZE }, (_, i) => ({
      index: i,
      ownerId: 'p1',
      level: 1,
    }));
    const deltaFullSync: DeltaPayload = {
      tick: 0,
      cells: fullCells,
      players: [{ id: 'p1', position: 5, balance: 12000 }],
    };

    trackDeltaActivities(deltaFullSync, prevState, nextState, useActivityStore);
    expect(useActivityStore.getState().activityLogs).toHaveLength(0);
  });

  it('[Integration] applyDeltaToStore tu dong kich hoat trackDeltaActivities va ghi log vao useActivityStore', () => {
    useGameStore.setState({
      playersInfo: {
        p1: { id: 'p1', name: 'Đại Gia Sài Gòn', balance: 15000, tokenColor: '#38BDF8', ownedProperties: [] },
      },
      playerPositions: { p1: 0 },
      currentTurnPlayerId: 'p1',
    });

    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      dice: [2, 3],
      players: [{ id: 'p1', position: 5, balance: 15000 }],
      currentTurnPlayerId: 'p1',
    };

    applyDeltaToStore(delta, useGameStore);

    const logs = useActivityStore.getState().activityLogs;
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs.some((l) => l.type === 'dice')).toBe(true);
    expect(logs.some((l) => l.type === 'move')).toBe(true);
  });

  it('[Adversarial Bug 1] Khong spam log xuc xac khi delta dinh ky giu nguyen dice trong cung luot', () => {
    const prevState = createMockGameState({
      dice: [3, 4],
      hasRolledThisTurn: true,
      currentTurnPlayerId: 'p1',
    });
    const nextState = createMockGameState({
      dice: [3, 4],
      hasRolledThisTurn: true,
      currentTurnPlayerId: 'p1',
    });
    const deltaTick: DeltaPayload = {
      tick: 2,
      cells: [],
      dice: [3, 4],
      currentTurnPlayerId: 'p1',
      timeRemaining: 59,
    };

    trackDeltaActivities(deltaTick, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;
    expect(logs.filter((l) => l.type === 'dice')).toHaveLength(0);
  });

  it('[Adversarial Bug 2] Khong spam log dau gia khi chua co bid moi tu delta dinh ky', () => {
    const prevState = createMockGameState({
      activeModal: 'auction',
      modalPayload: {
        cellIndex: 1,
        currentBid: 1200,
        highestBidderId: 'p1',
        timeRemaining: 15,
      },
    });
    const nextState = createMockGameState({
      activeModal: 'auction',
      modalPayload: {
        cellIndex: 1,
        currentBid: 1200,
        highestBidderId: 'p1',
        timeRemaining: 14,
      },
    });
    const deltaPeriodicTick: DeltaPayload = {
      tick: 13,
      cells: [],
      auction: {
        cellIndex: 1,
        currentBid: 1200,
        highestBidderId: 'p1',
        timeRemaining: 14,
      },
    };

    trackDeltaActivities(deltaPeriodicTick, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;
    expect(logs.filter((l) => l.type === 'auction')).toHaveLength(0);
  });

  it('[Adversarial Bug 3] Nang cap C1 khong duoc bi coi la nop thue / nop phat, dong thoi upgrade log mang chi phi am', () => {
    // Ô 1 (Nâu): price = 600, upgradeCosts = [300, 450, 600]
    const prevState = createMockGameState({
      levelMap: { 1: 0 },
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Gòn',
          balance: 15000,
          tokenColor: '#38BDF8',
          ownedProperties: [1],
          mortgagedProperties: [],
        },
      },
    });
    const nextState = createMockGameState({
      levelMap: { 1: 1 },
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Gòn',
          balance: 14700, // trừ 300 tiền nâng cấp C1
          tokenColor: '#38BDF8',
          ownedProperties: [1],
          mortgagedProperties: [],
        },
      },
    });
    const delta: DeltaPayload = {
      tick: 20,
      cells: [{ index: 1, level: 1, ownerId: 'p1' }],
      players: [{ id: 'p1', position: 1, balance: 14700 }],
    };

    trackDeltaActivities(delta, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;

    // Phải có log upgrade mang amount = -300
    const upLog = logs.find((l) => l.type === 'upgrade');
    expect(upLog).toBeDefined();
    expect(upLog?.amount).toBe(-300);

    // Tuyệt đối KHÔNG được sinh ra log "tax" (nộp thuế / nộp phạt) cho tiền xây nhà
    const taxLogs = logs.filter((l) => l.type === 'tax');
    expect(taxLogs).toHaveLength(0);
  });

  it('[Adversarial Bug 4] The chap bat dong san nhan tien tu Ngan Hang khong duoc ghi la tien thuong, dong thoi log mang loan duong', () => {
    // Ô 1: price = 600 -> Vay thế chấp 50% = 300
    const prevState = createMockGameState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Gòn',
          balance: 1000,
          tokenColor: '#38BDF8',
          ownedProperties: [1],
          mortgagedProperties: [],
        },
      },
    });
    const nextState = createMockGameState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Gòn',
          balance: 1300, // nhận 300 từ thế chấp
          tokenColor: '#38BDF8',
          ownedProperties: [1],
          mortgagedProperties: [1],
        },
      },
    });
    const delta: DeltaPayload = {
      tick: 21,
      cells: [{ index: 1, isMortgaged: true, ownerId: 'p1' }],
      players: [{ id: 'p1', position: 1, balance: 1300 }],
    };

    trackDeltaActivities(delta, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;

    const mortLog = logs.find((l) => l.type === 'mortgage');
    expect(mortLog).toBeDefined();
    expect(mortLog?.amount).toBe(300);

    // Tuyệt đối KHÔNG sinh log system reward ("tiền thưởng")
    const rewardLogs = logs.filter((l) => l.type === 'system');
    expect(rewardLogs).toHaveLength(0);
  });

  it('[Adversarial Bug 5] Chuoc the chap khong duoc ghi la nop thue / nop phat', () => {
    // Ô 1: Chuộc thế chấp trả 330 (55% = 300 + 10% lãi = 330)
    const prevState = createMockGameState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Gòn',
          balance: 2000,
          tokenColor: '#38BDF8',
          ownedProperties: [1],
          mortgagedProperties: [1],
        },
      },
    });
    const nextState = createMockGameState({
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Sài Gòn',
          balance: 1670, // trả 330
          tokenColor: '#38BDF8',
          ownedProperties: [1],
          mortgagedProperties: [],
        },
      },
    });
    const delta: DeltaPayload = {
      tick: 22,
      cells: [{ index: 1, isMortgaged: false, ownerId: 'p1' }],
      players: [{ id: 'p1', position: 1, balance: 1670 }],
    };

    trackDeltaActivities(delta, prevState, nextState, useActivityStore);
    const logs = useActivityStore.getState().activityLogs;

    const unmortLog = logs.find((l) => l.type === 'mortgage');
    expect(unmortLog).toBeDefined();
    expect(unmortLog?.amount).toBe(-330);

    const taxLogs = logs.filter((l) => l.type === 'tax');
    expect(taxLogs).toHaveLength(0);
  });
});
