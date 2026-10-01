// [TC-225/CONTRACT] Universal 5-Facet Behavioral Contract: Financial Activity Log & Pass GO Collision Resilience
// Architecture Reference: docs/plans/improvements/IMP-225-financial-activity-log-and-pass-go-collision_plan.md
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import {
  useGameStore,
  type GameState,
  FloatingTextType,
} from '../../src/client/store/game_store.js';
import {
  useActivityStore,
  type ActivityLogEntry,
  type ActivityLogType,
} from '../../src/client/store/activity_store.js';
import { detectFinancialAndStatusActivities } from '../../src/client/network/activity_financial_tracker.js';
import {
  dispatchActivityFloatingBadges,
  clearPendingBadgeTimers,
} from '../../src/client/network/activity_badge_dispatcher.js';

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    levelMap: {},
    playerPositions: { p1: 0, p2: 0, p3: 0 },
    dice: [1, 1],
    playersInfo: {
      p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [], isBot: false },
      p2: { id: 'p2', name: 'Bot AI 3', balance: 10_000, tokenColor: '#F59E0B', ownedProperties: [], mortgagedProperties: [], isBot: true },
      p3: { id: 'p3', name: 'Tỷ Phú Ba Son', balance: 10_000, tokenColor: '#10B981', ownedProperties: [], mortgagedProperties: [], isBot: false },
    },
    currentTurnPlayerId: 'p1',
    turnTimeRemaining: 60,
    treasuryPool: 2_000,
    roundNumber: 1,
    maxRounds: 30,
    activePawnAnimation: null,
    pendingPawnMove: null,
    isRolling: false,
    addFloatingText: vi.fn(),
    ...overrides,
  } as unknown as GameState;
}

function createDelta(tick: number, players: { id: string; position: number; balance: number }[]): DeltaPayload {
  return { tick, cells: [], players };
}

describe('[CONTRACT] IMP-225: Financial Activity Log & Pass GO Collision Suite', () => {
  beforeEach(() => {
    clearPendingBadgeTimers();
    useActivityStore.setState({
      activityLogs: [],
      isActivityFeedOpen: false,
      unreadCount: 0,
      activeFilter: 'all',
    });
    useGameStore.setState({
      activePawnAnimation: null,
      pendingPawnMove: null,
      isRolling: false,
    });
  });

  // =========================================================================
  // FACET 1: PASS GO & RENT COLLISION (BIÊN & VA CHẠM DÒNG TIỀN VƯỢT GO)
  // =========================================================================
  describe('Facet 1: Pass GO & Rent Collision', () => {
    it('[TC-225.01/MSS][UC-GAME-020] Vượt GO (+2.000) và dẫm vào BĐS đối thủ (-3.750) -> Phát sinh đủ 2 log: Lương GO và Tiền thuê', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 38, p2: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
          p2: { id: 'p2', name: 'Bot AI 3', balance: 10_000, tokenColor: '#F59E0B', ownedProperties: [6], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 6, p2: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 8_250 },
          p2: { ...prevState.playersInfo.p2!, balance: 13_750 },
        },
      });
      const delta = createDelta(1, [{ id: 'p1', position: 6, balance: 8_250 }, { id: 'p2', position: 0, balance: 13_750 }]);

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const salaryLog = entries.find((e) => e.type === 'salary');
      const rentLog = entries.find((e) => e.type === 'rent');

      expect(salaryLog).toBeDefined();
      expect(salaryLog?.amount).toBe(2_000);
      expect(rentLog).toBeDefined();
      expect(rentLog?.amount).toBe(-3_750);
    });

    it('[TC-225.02/MSS][UC-GAME-020] Vượt GO (+2.000) dẫm BĐS tiền thuê nhỏ hơn (-800) -> Net diff +1.200 -> Phát sinh đủ 2 log Lương và Thuê', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 37, p2: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
          p2: { id: 'p2', name: 'Bot AI 3', balance: 10_000, tokenColor: '#F59E0B', ownedProperties: [1], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 1, p2: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 11_200 },
          p2: { ...prevState.playersInfo.p2!, balance: 10_800 },
        },
      });
      const delta = createDelta(2, [{ id: 'p1', position: 1, balance: 11_200 }, { id: 'p2', position: 0, balance: 10_800 }]);

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const salaryLog = entries.find((e) => e.type === 'salary');
      const rentLog = entries.find((e) => e.type === 'rent');

      expect(salaryLog?.amount).toBe(2_000);
      expect(rentLog?.amount).toBe(-800);
      expect(rentLog?.targetPlayerId).toBe('p2');
      expect(entries.some((e) => e.type === 'system' && e.amount === 1_200)).toBe(false);
    });

    it('[TC-225.03/MSS][UC-GAME-020] Vượt GO (+2.000) dẫm BĐS tiền thuê đúng bằng lương (-2.000) -> Net diff 0 -> Vẫn phát sinh đủ 2 log Lương và Thuê', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 38, p2: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
          p2: { id: 'p2', name: 'Bot AI 3', balance: 10_000, tokenColor: '#F59E0B', ownedProperties: [3], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 3, p2: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 10_000 },
          p2: { ...prevState.playersInfo.p2!, balance: 12_000 },
        },
      });
      const delta = createDelta(3, [{ id: 'p1', position: 3, balance: 10_000 }, { id: 'p2', position: 0, balance: 12_000 }]);

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const salaryLog = entries.find((e) => e.type === 'salary');
      const rentLog = entries.find((e) => e.type === 'rent');

      expect(salaryLog?.amount).toBe(2_000);
      expect(rentLog?.amount).toBe(-2_000);
      expect(rentLog?.targetPlayerId).toBe('p2');
    });

    it('[TC-225.04/MSS][UC-GAME-020] Vượt GO vào ô đất trống -> Phát sinh log Lương GO chuẩn xác mang nhãn 🏁, không dùng từ tiền thưởng', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 39, p2: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 2, p2: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 12_000 },
        },
      });
      const delta = createDelta(4, [{ id: 'p1', position: 2, balance: 12_000 }]);

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const salaryLog = entries.find((e) => e.type === 'salary');

      expect(entries).toHaveLength(1);
      expect(salaryLog?.amount).toBe(2_000);
      expect(salaryLog?.message).toContain('🏁');
      expect(salaryLog?.message).not.toContain('tiền thưởng');
    });
  });

  // =========================================================================
  // FACET 2: SPECIAL RENT MODIFIERS (HIỆU ỨNG BẤT ĐỘNG SẢN ĐẶC BIỆT)
  // =========================================================================
  describe('Facet 2: Special Rent Modifiers', () => {
    it('[TC-225.05/A1][UC-GAME-027] Thẻ CC_PORT_EXCLUSIVE chia đôi phí cảng 50/50 -> Phát sinh log phí cảng chia đều cho 2 bên', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 0, p2: 0, p3: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
          p2: { id: 'p2', name: 'Bot AI 3', balance: 10_000, tokenColor: '#F59E0B', ownedProperties: [5], mortgagedProperties: [] },
          p3: { id: 'p3', name: 'Tỷ Phú Ba Son', balance: 10_000, tokenColor: '#10B981', ownedProperties: [], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 5, p2: 0, p3: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 8_000 },
          p2: { ...prevState.playersInfo.p2!, balance: 11_000 },
          p3: { ...prevState.playersInfo.p3!, balance: 11_000 },
        },
      });
      const delta = createDelta(5, [
        { id: 'p1', position: 5, balance: 8_000 },
        { id: 'p2', position: 0, balance: 11_000 },
        { id: 'p3', position: 0, balance: 11_000 },
      ]);

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const portLog = entries.find((e) => e.type === 'rent');

      expect(portLog).toBeDefined();
      expect(portLog?.amount).toBe(-2_000);
      expect(portLog?.message).toContain('⚓');
      expect(portLog?.message).toContain('chia đều');
    });

    it('[TC-225.06/A2][UC-GAME-020] Con nợ âm vốn chỉ trả được một phần tiền thuê -> Khớp đúng khoản thực nhận của chủ đất, không quy thành thuế', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 0, p2: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 600, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
          p2: { id: 'p2', name: 'Bot AI 3', balance: 10_000, tokenColor: '#F59E0B', ownedProperties: [8], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 8, p2: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: -900 },
          p2: { ...prevState.playersInfo.p2!, balance: 10_600 },
        },
      });
      const delta = createDelta(6, [
        { id: 'p1', position: 8, balance: -900 },
        { id: 'p2', position: 0, balance: 10_600 },
      ]);

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const rentLog = entries.find((e) => e.type === 'rent');

      expect(rentLog).toBeDefined();
      expect(rentLog?.amount).toBe(-600);
      expect(rentLog?.message).toContain('mất thanh khoản');
      expect(entries.some((e) => e.type === 'tax')).toBe(false);
    });

    it('[TC-225.07/MSS][UC-GAME-020] Lô đất Dịch vụ C2 xúc xắc mặt chẵn thu phụ phí +200 Tr. -> Tiền thuê tổng hợp được nhận diện đầy đủ', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 0, p2: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
          p2: { id: 'p2', name: 'Bot AI 3', balance: 10_000, tokenColor: '#F59E0B', ownedProperties: [14], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 14, p2: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 9_200 },
          p2: { ...prevState.playersInfo.p2!, balance: 10_800 },
        },
      });
      const delta = createDelta(7, [
        { id: 'p1', position: 14, balance: 9_200 },
        { id: 'p2', position: 0, balance: 10_800 },
      ]);

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const rentLog = entries.find((e) => e.type === 'rent');

      expect(rentLog).toBeDefined();
      expect(rentLog?.amount).toBe(-800);
      expect(rentLog?.targetPlayerId).toBe('p2');
      expect(rentLog?.message).toContain('800');
    });

    it('[TC-225.08/MSS][UC-GAME-020] BĐS chịu ảnh hưởng MACRO_LAND_FEVER x2.5 -> Khớp số tiền thuê sau nhân x2.5 chuẩn xác', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 0, p2: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
          p2: { id: 'p2', name: 'Bot AI 3', balance: 10_000, tokenColor: '#F59E0B', ownedProperties: [24], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 24, p2: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 7_500 },
          p2: { ...prevState.playersInfo.p2!, balance: 12_500 },
        },
      });
      const delta = createDelta(8, [
        { id: 'p1', position: 24, balance: 7_500 },
        { id: 'p2', position: 0, balance: 12_500 },
      ]);

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const rentLog = entries.find((e) => e.type === 'rent');

      expect(rentLog).toBeDefined();
      expect(rentLog?.amount).toBe(-2_500);
      expect(rentLog?.targetPlayerId).toBe('p2');
      expect(rentLog?.message).toContain('2.500');
    });
  });

  // =========================================================================
  // FACET 3: UTILITIES & SPECIALIZED FEES (TIỆN ÍCH & BIỂU PHÍ ĐẶC THÙ)
  // =========================================================================
  describe('Facet 3: Utilities & Specialized Fees', () => {
    it('[TC-225.09/MSS][UC-GAME-020] Dẫm ô Tiện ích EVN (12) biểu phí phẳng 1.000 Tr. -> Khớp tiền thuê tiện ích chuẩn', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 0, p2: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
          p2: { id: 'p2', name: 'Bot AI 3', balance: 10_000, tokenColor: '#F59E0B', ownedProperties: [12], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 12, p2: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 9_000 },
          p2: { ...prevState.playersInfo.p2!, balance: 11_000 },
        },
      });
      const delta = createDelta(9, [
        { id: 'p1', position: 12, balance: 9_000 },
        { id: 'p2', position: 0, balance: 11_000 },
      ]);

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const rentLog = entries.find((e) => e.type === 'rent');

      expect(rentLog).toBeDefined();
      expect(rentLog?.amount).toBe(-1_000);
      expect(rentLog?.targetPlayerId).toBe('p2');
      expect(entries.some((e) => e.type === 'tax')).toBe(false);
    });

    it('[TC-225.10/MSS][UC-GAME-027] Rút thẻ sự kiện phát sinh cước Viettel 150 Tr. -> Log ghi nhận Cước data viễn thông Viettel, không dùng tiền thưởng', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 7, p2: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
          p2: { id: 'p2', name: 'Bot AI 3', balance: 10_000, tokenColor: '#F59E0B', ownedProperties: [28], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 7, p2: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 9_850 },
          p2: { ...prevState.playersInfo.p2!, balance: 10_150 },
        },
      });
      const delta = createDelta(10, [
        { id: 'p1', position: 7, balance: 9_850 },
        { id: 'p2', position: 0, balance: 10_150 },
      ]);

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const viettelLog = entries.find((e) => e.message.includes('cước data viễn thông Viettel'));

      expect(viettelLog).toBeDefined();
      expect(viettelLog?.message).toContain('📡');
      expect(viettelLog?.amount).toBe(-150);
      expect(entries.some((e) => e.message.includes('tiền thưởng'))).toBe(false);
    });

    it('[TC-225.11/MSS][UC-GAME-020] Vượt GO chịu thuế đất Lệ Phí Đăng Ký Đất Đai -> Lương và thuế được ghi nhận tách bạch minh bạch', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 39, p2: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [1, 3, 6, 8], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 4, p2: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 11_400 },
        },
      });
      const delta = createDelta(11, [{ id: 'p1', position: 4, balance: 11_400 }]);

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const salaryLog = entries.find((e) => e.type === 'salary');
      const taxLog = entries.find((e) => e.type === 'tax');

      expect(salaryLog?.amount).toBe(2_000);
      expect(taxLog?.amount).toBe(-600);
      expect(taxLog?.message).toContain('Lệ Phí Đăng Ký Đất Đai');
      expect(entries.filter((e) => e.type === 'salary' || e.type === 'tax')).toHaveLength(2);
    });

    it('[TC-225.12/MSS][UC-GAME-020] Ga hàng không có ETC (+50% phí) -> Khớp phí dịch vụ chính xác', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 0, p2: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
          p2: { id: 'p2', name: 'Bot AI 3', balance: 10_000, tokenColor: '#F59E0B', ownedProperties: [5], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 5, p2: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 8_500 },
          p2: { ...prevState.playersInfo.p2!, balance: 11_500 },
        },
      });
      const delta = createDelta(12, [
        { id: 'p1', position: 5, balance: 8_500 },
        { id: 'p2', position: 0, balance: 11_500 },
      ]);

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const rentLog = entries.find((e) => e.type === 'rent');

      expect(rentLog).toBeDefined();
      expect(rentLog?.amount).toBe(-1_500);
      expect(rentLog?.targetPlayerId).toBe('p2');
      expect(rentLog?.message).toContain('1.500');
    });
  });

  // =========================================================================
  // FACET 4: TREASURY MACRO FISCAL DISAMBIGUATION (CHÍNH SÁCH TÀI KHÓA KHO BẠC)
  // =========================================================================
  describe('Facet 4: Treasury Macro Fiscal Disambiguation', () => {
    it('[TC-225.13/MSS][UC-GAME-027] Gói Kích Cầu Kho Bạc giải ngân -> Log mang nhãn 🏛️ [Kích Cầu Kho Bạc] trợ cấp phục hồi kinh tế', () => {
      const prevState = createMockGameState({
        treasuryPool: 5_000,
        playerPositions: { p1: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        treasuryPool: 3_000,
        playerPositions: { p1: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 12_000 },
        },
      });
      const delta: DeltaPayload = {
        tick: 13,
        cells: [],
        treasury: 3_000,
        players: [{ id: 'p1', position: 0, balance: 12_000 }],
      };

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const stimulusLog = entries.find((e) => e.message.includes('[Kích Cầu Kho Bạc]'));

      expect(stimulusLog).toBeDefined();
      expect(stimulusLog?.type).toBe('system');
      expect(stimulusLog?.message).toContain('🏛️ [Kích Cầu Kho Bạc]');
      expect(stimulusLog?.message).toContain('trợ cấp phục hồi kinh tế');
    });

    it('[TC-225.14/MSS][UC-GAME-020] Gói kích cầu xảy ra đồng thời với lượt trả tiền thuê -> Tách biệt 2 giao dịch, không bị nuốt số dư', () => {
      const prevState = createMockGameState({
        treasuryPool: 5_000,
        playerPositions: { p1: 0, p2: 0, p3: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
          p2: { id: 'p2', name: 'Bot AI 3', balance: 10_000, tokenColor: '#F59E0B', ownedProperties: [1], mortgagedProperties: [] },
          p3: { id: 'p3', name: 'Tỷ Phú Ba Son', balance: 10_000, tokenColor: '#10B981', ownedProperties: [], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        treasuryPool: 3_500,
        playerPositions: { p1: 1, p2: 0, p3: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 9_000 },
          p2: { ...prevState.playersInfo.p2!, balance: 11_000 },
          p3: { ...prevState.playersInfo.p3!, balance: 11_500 },
        },
      });
      const delta: DeltaPayload = {
        tick: 14,
        cells: [],
        treasury: 3_500,
        players: [
          { id: 'p1', position: 1, balance: 9_000 },
          { id: 'p2', position: 0, balance: 11_000 },
          { id: 'p3', position: 0, balance: 11_500 },
        ],
      };

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const rentLog = entries.find((e) => e.type === 'rent');
      const stimulusLog = entries.find((e) => e.message.includes('[Kích Cầu Kho Bạc]'));

      expect(rentLog?.amount).toBe(-1_000);
      expect(rentLog?.targetPlayerId).toBe('p2');
      expect(stimulusLog?.playerId).toBe('p3');
      expect(stimulusLog?.amount).toBe(1_500);
    });
  });

  // =========================================================================
  // FACET 5: VISUAL BADGE, AUDIO & COMPLEX FLOW (HUY HIỆU & ĐA SỰ KIỆN)
  // =========================================================================
  describe('Facet 5: Visual Badge, Audio & Complex Flow', () => {
    it('[TC-225.15/MSS][UC-GAME-020] Va chạm Vượt GO + Trả thuê -> FloatingBadge phát đủ cả Badge Lương và Badge Trả Thuê', () => {
      const addFloatingTextMock = vi.fn();
      const mockState = createMockGameState({
        addFloatingText: addFloatingTextMock,
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 8_250, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
          p2: { id: 'p2', name: 'Bot AI 3', balance: 13_750, tokenColor: '#F59E0B', ownedProperties: [6], mortgagedProperties: [] },
        },
      });
      const activities: ActivityLogEntry[] = [
        {
          id: 'salary_test_1',
          timestamp: Date.now(),
          type: 'salary' as unknown as ActivityLogType,
          message: '🏁 Spunky Hamster đã vượt qua ô Bắt Đầu và nhận 2.000 tiền lương',
          playerId: 'p1',
          playerName: 'Spunky Hamster',
          amount: 2_000,
        },
        {
          id: 'rent_test_1',
          timestamp: Date.now(),
          type: 'rent',
          message: 'Spunky Hamster đã trả 3.750 tiền thuê cho Bot AI 3',
          playerId: 'p1',
          playerName: 'Spunky Hamster',
          targetPlayerId: 'p2',
          targetPlayerName: 'Bot AI 3',
          amount: -3_750,
          cellIndex: 6,
        },
      ];

      dispatchActivityFloatingBadges(activities, mockState);

      expect(addFloatingTextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'salary',
          type: FloatingTextType.Reward,
          text: '+2.000',
        }),
      );
      expect(addFloatingTextMock).toHaveBeenCalledWith(
        expect.objectContaining({
          actionType: 'rent_pay',
          type: FloatingTextType.Penalty,
          text: '-3.750',
        }),
      );
      expect(addFloatingTextMock).toHaveBeenCalledTimes(3);
    });

    it('[TC-225.16/MSS][UC-GAME-020] Vượt GO (+2.000), thu nợ thấu chi CC_OVERDRAFT (-3.300) và trả thuê (-1.500) -> Tách đủ 3 log độc lập', () => {
      const prevState = createMockGameState({
        playerPositions: { p1: 38, p2: 0 },
        playersInfo: {
          p1: { id: 'p1', name: 'Spunky Hamster', balance: 10_000, tokenColor: '#38BDF8', ownedProperties: [], mortgagedProperties: [] },
          p2: { id: 'p2', name: 'Bot AI 3', balance: 10_000, tokenColor: '#F59E0B', ownedProperties: [6], mortgagedProperties: [] },
        },
      });
      const nextState = createMockGameState({
        playerPositions: { p1: 6, p2: 0 },
        playersInfo: {
          p1: { ...prevState.playersInfo.p1!, balance: 7_200 },
          p2: { ...prevState.playersInfo.p2!, balance: 11_500 },
        },
      });
      const delta: DeltaPayload = {
        tick: 16,
        cells: [],
        players: [
          { id: 'p1', position: 6, balance: 7_200 },
          { id: 'p2', position: 0, balance: 11_500 },
        ],
      };

      const entries = detectFinancialAndStatusActivities(delta, prevState, nextState, []);
      const salaryLog = entries.find((e) => e.type === 'salary');
      const rentLog = entries.find((e) => e.type === 'rent');
      const debtLog = entries.find(
        (e) => (e.type === 'tax' || e.type === 'system') && Math.abs(e.amount ?? 0) === 3_300,
      );

      expect(salaryLog?.amount).toBe(2_000);
      expect(rentLog?.amount).toBe(-1_500);
      expect(debtLog).toBeDefined();
      expect(entries.filter((e) => e.playerId === 'p1')).toHaveLength(3);
    });
  });
});
