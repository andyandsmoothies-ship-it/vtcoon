// [TC-228/CONTRACT] Zero-Delta Suppression & Audit Teleportation Immunity Contract Tests
// Traceability: GEMINI.md (Core Domain & Architectural Invariants) & docs/domain/gotchas.md (Invariant #13)

import { describe, it, expect } from 'vitest';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import {
  useGameStore,
  type GameState,
} from '../../src/client/store/game_store.js';
import { detectFinancialAndStatusActivities } from '../../src/client/network/activity_financial_tracker.js';
import {
  processPayerFee,
  processReceiverReward,
  type BalanceDelta,
  type PropertyFinancialContext,
} from '../../src/client/network/activity_rent_matcher.js';

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    levelMap: {},
    playerPositions: { p1: 1, bot_2: 22, bot_3: 10, bot_4: 28 },
    playersInfo: {
      p1: { id: 'p1', name: 'Người chơi 1', balance: 3940, tokenColor: '#38BDF8', isBot: false, ownedProperties: [], mortgagedProperties: [] },
      bot_2: { id: 'bot_2', name: 'Bot 2', balance: 3312, tokenColor: '#F59E0B', isBot: true, ownedProperties: [], mortgagedProperties: [] },
      bot_3: { id: 'bot_3', name: 'Bot 3', balance: 5135, tokenColor: '#10B981', isBot: true, ownedProperties: [], mortgagedProperties: [] },
      bot_4: { id: 'bot_4', name: 'Bot 4', balance: 3598, tokenColor: '#EC4899', isBot: true, ownedProperties: [], mortgagedProperties: [] },
    },
    treasuryPool: 12487,
    roundNumber: 17,
    ...overrides,
  };
}

const emptyContext: PropertyFinancialContext = {
  boughtCellIndices: [],
  buyoutCellIndices: [],
  upgradedCells: [],
  mortgagedCells: [],
  unmortgagedCells: [],
};

describe('[TC-228/CONTRACT] Zero-Delta Suppression & Audit Teleportation Immunity', () => {
  describe('1. Adversarial Non-Linear Teleportation (Bị bắt vào tù không kích hoạt Vượt GO / Nộp phí 0đ)', () => {
    it('[TC-228.01/MSS][UC-GAME-020] Quân cờ ở Ô 28 bị đưa vào Ô 10 (Trạm Kiểm Toán) với diff = 0 -> Tuyệt đối không phát sinh log nộp phí 0đ', () => {
      const prevState = createMockGameState();
      const nextState = createMockGameState({
        playerPositions: { ...prevState.playerPositions, bot_4: 10 },
        playersInfo: {
          ...prevState.playersInfo,
          bot_4: { ...prevState.playersInfo.bot_4!, inAudit: true, auditTurnsLeft: 3 },
        },
      });

      const delta: DeltaPayload = {
        tick: 316,
        cells: [],
        players: [
          { id: 'bot_4', position: 10, balance: 3598, inAudit: true, auditTurnsLeft: 3, auditCount: 3 },
        ],
        currentPlayerIndex: 3,
        currentTurnPlayerId: 'bot_4',
        dice: [1, 1],
      };

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, emptyContext);
      
      // Khẳng định bất biến: Không phát sinh bất kỳ log tài chính ma nào
      expect(entries).toHaveLength(0);
      expect(entries.some((e) => e.message.includes('0'))).toBe(false);
      expect(entries.some((e) => e.type === 'tax')).toBe(false);
    });

    it('[TC-228.02/MSS][UC-GAME-020] Tái hiện chính xác Snapshot Tick #316 của ván đấu thực tế -> 0 log ma nộp phí', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 1, bot_2: 22, bot_3: 10, bot_4: 28 },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 1, bot_2: 22, bot_3: 10, bot_4: 10 },
        playersInfo: {
          ...prevState.playersInfo,
          bot_4: { ...prevState.playersInfo.bot_4!, inAudit: true, auditTurnsLeft: 3 },
        },
      });
      const delta: DeltaPayload = {
        tick: 316,
        cells: [],
        players: [{ id: 'bot_4', position: 10, balance: 3598, inAudit: true, auditTurnsLeft: 3 }],
      };

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, emptyContext);
      expect(entries).toEqual([]);
    });
  });

  describe('2. Zero-Delta Suppression Invariant (Chặn đứng hoàn toàn biến động rỗng tại cửa ngõ)', () => {
    it('[TC-228.03/MSS][UC-GAME-020] processPayerFee khi nhận vào payer có diff = 0 -> Bắt buộc trả về null', () => {
      const payer: BalanceDelta = {
        id: 'bot_4',
        diff: 0,
        cellIndex: 10,
        pInfo: { id: 'bot_4', name: 'Bot 4', balance: 3598, isBot: true, tokenColor: '#EC4899', ownedProperties: [] },
      };

      const result = processPayerFee(payer, emptyContext);
      expect(result).toBeNull();
    });

    it('[TC-228.04/MSS][UC-GAME-020] processReceiverReward khi nhận vào receiver có diff = 0 -> Bắt buộc trả về null', () => {
      const receiver: BalanceDelta = {
        id: 'bot_4',
        diff: 0,
        cellIndex: 10,
        pInfo: { id: 'bot_4', name: 'Bot 4', balance: 3598, isBot: true, tokenColor: '#EC4899', ownedProperties: [] },
      };

      const result = processReceiverReward(receiver, emptyContext);
      expect(result).toBeNull();
    });
  });

  describe('3. Zero-Regression Gate (Bảo toàn 100% hợp đồng Vượt GO hòa tiền TC-225.03)', () => {
    it('[TC-228.05/MSS][UC-GAME-020] Đi bộ bình thường qua GO (+2.000) và dẫm BĐS đối thủ (-2.000) -> Net diff = 0 -> Vẫn phát sinh đủ 2 log Lương và Thuê', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 38, bot_2: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Người chơi 1', balance: 10000, tokenColor: '#38BDF8', isBot: false, ownedProperties: [], mortgagedProperties: [] },
          bot_2: { id: 'bot_2', name: 'Bot 2', balance: 10000, tokenColor: '#F59E0B', isBot: true, ownedProperties: [3], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 3, bot_2: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 10000 },
          bot_2: { ...prevState.playersInfo.bot_2!, balance: 12000 },
        },
      });
      const delta: DeltaPayload = {
        tick: 100,
        cells: [],
        players: [
          { id: 'p1', position: 3, balance: 10000 },
          { id: 'bot_2', position: 0, balance: 12000 },
        ],
      };

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, emptyContext);
      const salaryLog = entries.find((e) => e.type === 'salary');
      const rentLog = entries.find((e) => e.type === 'rent');

      expect(salaryLog).toBeDefined();
      expect(salaryLog?.amount).toBe(2000);
      expect(rentLog).toBeDefined();
      expect(rentLog?.amount).toBe(-2000);
      expect(rentLog?.targetPlayerId).toBe('bot_2');
    });
  });
});
