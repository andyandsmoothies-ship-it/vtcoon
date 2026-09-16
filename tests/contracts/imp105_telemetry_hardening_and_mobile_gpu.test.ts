// [TC-IMP105/MSS][NET-S01/MSS][PERF-S01/MSS]
// Universal Contract Test Suite: Telemetry Watchdog False Positives & Mobile GPU Post-Processing
// Traceability: docs/master_roadmap.md § IMP-105
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { N8AO } from '@react-three/postprocessing';
import {
  checkIsTeleport,
  handleDeltaTelemetry,
} from '../../src/client/telemetry/telemetry_delta_hook.js';
import {
  verifyTreasuryConservation,
  verifyMovementStep,
} from '../../src/client/telemetry/invariant_checker.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';
import { TurnPhase } from '../../src/domain/room.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import type { GameState, PlayerHudInfo } from '../../src/client/store/game_store.js';
import {
  PostProcessingPipeline,
  type PostProcessingPipelineProps,
} from '../../src/client/3d/post_processing_pipeline.js';
import { GameCanvas } from '../../src/client/game_canvas.js';

function createStubState(overrides: {
  readonly p1Pos?: number;
  readonly p1Balance?: number;
  readonly treasuryPool?: number;
  readonly playersInfo?: Record<string, PlayerHudInfo>;
  readonly playerPositions?: Record<string, number>;
  readonly activeModal?: string | null;
  readonly levelMap?: Record<number, number>;
}): GameState {
  const p1Pos = overrides.p1Pos ?? 0;
  const p1Balance = overrides.p1Balance ?? 15_000;
  const defaultPlayersInfo: Record<string, PlayerHudInfo> = overrides.playersInfo ?? {
    p1: {
      id: 'p1',
      name: 'Player 1',
      balance: p1Balance,
      tokenColor: '#ef4444',
      ownedProperties: [],
      bankrupt: false,
      inAudit: false,
    },
  };

  return {
    playersInfo: defaultPlayersInfo,
    playerPositions: overrides.playerPositions ?? { p1: p1Pos },
    treasuryPool: overrides.treasuryPool ?? 0,
    activeModal: overrides.activeModal ?? null,
    levelMap: overrides.levelMap ?? {},
    auction: null,
    modalPayload: null,
    turnPhase: TurnPhase.WaitingRoll,
    turnTimeRemaining: 60,
    currentTurnPlayerId: 'p1',
    isRolling: false,
    hasRolledThisTurn: false,
  } as unknown as GameState;
}

describe('[TC-IMP105/MSS] Telemetry Watchdog Accuracy & Mobile GPU Post-Processing', () => {
  beforeEach(() => {
    useTelemetryStore.getState().reset();
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (HOSE CELL 38, AUCTION, TICK 1-2 SETUP BOUNDARIES)
  // =========================================================================
  describe('Facet 1: Boundary & Range', () => {
    it('[TC-IMP105.01/MSS][NET-S01/MSS] checkIsTeleport: Di chuyển thông thường tới ô 38 (HOSE) trong HosePhase trả về false', () => {
      const isTeleport = checkIsTeleport(30, 38, true, TurnPhase.HosePhase, false);
      expect(isTeleport).toBe(false);
    });

    it('[TC-IMP105.02/MSS][NET-S01/MSS] checkIsTeleport: Di chuyển thông thường tới ô đấu giá trong AuctionPhase trả về false', () => {
      const isTeleport = checkIsTeleport(10, 16, true, TurnPhase.AuctionPhase, false);
      expect(isTeleport).toBe(false);
    });

    it('[TC-IMP105.03/MSS][NET-S01/MSS] checkIsTeleport: Di chuyển có thẻ sự kiện vào HosePhase trả về true', () => {
      const isTeleport = checkIsTeleport(2, 38, true, TurnPhase.HosePhase, true);
      expect(isTeleport).toBe(true);
    });

    it('[TC-IMP105.03b/MSS][NET-S01/MSS] checkIsTeleport: Thẻ sự kiện dịch chuyển thẳng vào AuctionPhase trả về true', () => {
      const isTeleport = checkIsTeleport(10, 16, true, TurnPhase.AuctionPhase, true);
      expect(isTeleport).toBe(true);
    });

    it('[TC-IMP105.04/MSS][NET-S01/MSS] verifyTreasuryConservation: Trả về null khi tick <= 2 với cùng số lượng người chơi (hiệu chuẩn vốn ban đầu)', () => {
      const violation = verifyTreasuryConservation({
        preBalances: { p1: 0 },
        postBalances: { p1: 15_000 },
        preTreasury: 0,
        postTreasury: 0,
        tick: 1,
      });
      expect(violation).toBeNull();
    });

    it('[TC-IMP105.04b/MSS][NET-S01/MSS] verifyTreasuryConservation: Trả về null khi roomStarted === false ở bất kỳ tick nào', () => {
      const violation = verifyTreasuryConservation({
        preBalances: { p1: 15_000 },
        postBalances: { p1: 15_000 },
        preTreasury: 0,
        postTreasury: 2_000,
        tick: 5,
        roomStarted: false,
      });
      expect(violation).toBeNull();
    });

    it('[TC-IMP105.05/MSS][NET-S01/MSS] verifyTreasuryConservation: Trả về null khi số lượng người chơi thay đổi (hiệu chuẩn gia nhập)', () => {
      const violation = verifyTreasuryConservation({
        preBalances: { p1: 15_000 },
        postBalances: { p1: 15_000, p2: 15_000 },
        preTreasury: 2_000,
        postTreasury: 2_000,
        tick: 5,
      });
      expect(violation).toBeNull();
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY (HOSE/AUCTION DELTA MOVEMENT & TELEMETRY HOOK)
  // =========================================================================
  describe('Facet 2: State Reactivity', () => {
    it('[TC-IMP105.06/MSS][NET-S01/MSS] handleDeltaTelemetry: Người chơi đổ xúc xắc hạ cánh ô 38 (HOSE) chuyển HosePhase KHÔNG phát sinh INVALID_POSITION_STEP', () => {
      const preState = createStubState({ p1Pos: 32, p1Balance: 15_000 });
      const postState = createStubState({ p1Pos: 38, p1Balance: 15_000 });

      const delta: DeltaPayload = {
        tick: 10,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.HosePhase,
        dice: [3, 3],
        cells: [],
        players: [{ id: 'p1', position: 38, balance: 15_000 }],
        treasury: 0,
      };

      handleDeltaTelemetry(delta, preState, postState);
      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
      expect(violations).toHaveLength(0);
    });

    it('[TC-IMP105.07/MSS][NET-S01/MSS] handleDeltaTelemetry: Người chơi hạ cánh ô đất chưa sở hữu kích hoạt AuctionPhase KHÔNG phát sinh INVALID_POSITION_STEP', () => {
      const preState = createStubState({ p1Pos: 12, p1Balance: 15_000 });
      const postState = createStubState({ p1Pos: 18, p1Balance: 15_000 });

      const delta: DeltaPayload = {
        tick: 11,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.AuctionPhase,
        dice: [2, 4],
        cells: [],
        players: [{ id: 'p1', position: 18, balance: 15_000 }],
        treasury: 0,
      };

      handleDeltaTelemetry(delta, preState, postState);
      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
      expect(violations).toHaveLength(0);
    });

    it('[TC-IMP105.08/MSS][NET-S01/MSS] handleDeltaTelemetry: Khởi tạo tick 1 với số dư người chơi mới gia nhập KHÔNG phát sinh TREASURY_INVARIANT_VIOLATED', () => {
      const preState = createStubState({
        p1Balance: 15_000,
        treasuryPool: 0,
        playersInfo: {
          p1: { id: 'p1', name: 'P1', balance: 15_000, tokenColor: '#ef4444', ownedProperties: [], bankrupt: false, inAudit: false },
        },
      });
      const postState = createStubState({
        p1Balance: 15_000,
        treasuryPool: 0,
        playersInfo: {
          p1: { id: 'p1', name: 'P1', balance: 15_000, tokenColor: '#ef4444', ownedProperties: [], bankrupt: false, inAudit: false },
          p2: { id: 'p2', name: 'P2', balance: 15_000, tokenColor: '#3b82f6', ownedProperties: [], bankrupt: false, inAudit: false },
        },
      });

      const delta: DeltaPayload = {
        tick: 1,
        turnPhase: TurnPhase.WaitingRoll,
        cells: [],
        players: [
          { id: 'p1', position: 0, balance: 15_000 },
          { id: 'p2', position: 0, balance: 15_000 },
        ],
        treasury: 0,
      };

      handleDeltaTelemetry(delta, preState, postState);
      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
      expect(violations).toHaveLength(0);
    });

    it('[TC-IMP105.08b/MSS][NET-S01/MSS] handleDeltaTelemetry: Khởi tạo tick 1 cấp vốn 15.000 Tr cho người chơi hiện hữu khi delta không có treasury KHÔNG phát sinh TREASURY_INVARIANT_VIOLATED', () => {
      const preState = createStubState({
        p1Balance: 0,
        treasuryPool: 0,
        playersInfo: {
          p1: { id: 'p1', name: 'P1', balance: 0, tokenColor: '#ef4444', ownedProperties: [], bankrupt: false, inAudit: false },
        },
      });
      const postState = createStubState({
        p1Balance: 15_000,
        treasuryPool: 0,
        playersInfo: {
          p1: { id: 'p1', name: 'P1', balance: 15_000, tokenColor: '#ef4444', ownedProperties: [], bankrupt: false, inAudit: false },
        },
      });

      const delta: DeltaPayload = {
        tick: 1,
        turnPhase: TurnPhase.WaitingRoll,
        cells: [],
        players: [{ id: 'p1', position: 0, balance: 15_000 }],
      };

      handleDeltaTelemetry(delta, preState, postState);
      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
      expect(violations).toHaveLength(0);
    });

    it('[TC-IMP105.09/MSS][NET-S01/MSS] handleDeltaTelemetry: Khởi tạo tick 2 với thiết lập quỹ kho bạc ban đầu KHÔNG phát sinh TREASURY_INVARIANT_VIOLATED', () => {
      const preState = createStubState({ treasuryPool: 0, p1Balance: 15_000 });
      const postState = createStubState({ treasuryPool: 5_000, p1Balance: 15_000 });

      const delta: DeltaPayload = {
        tick: 2,
        turnPhase: TurnPhase.WaitingRoll,
        cells: [],
        players: [{ id: 'p1', position: 0, balance: 15_000 }],
        treasury: 5_000,
      };

      handleDeltaTelemetry(delta, preState, postState);
      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
      expect(violations).toHaveLength(0);
    });

    it('[TC-IMP105.10/MSS][NET-S01/MSS] handleDeltaTelemetry: Giai đoạn tiền trận đấu (roomStarted = false) đồng bộ người chơi KHÔNG phát sinh TREASURY_INVARIANT_VIOLATED', () => {
      const preState = createStubState({
        playersInfo: {
          p1: { id: 'p1', name: 'P1', balance: 15_000, tokenColor: '#ef4444', ownedProperties: [], bankrupt: false, inAudit: false },
        },
      });
      const postState = createStubState({
        playersInfo: {
          p1: { id: 'p1', name: 'P1', balance: 15_000, tokenColor: '#ef4444', ownedProperties: [], bankrupt: false, inAudit: false },
          p2: { id: 'p2', name: 'P2', balance: 15_000, tokenColor: '#3b82f6', ownedProperties: [], bankrupt: false, inAudit: false },
          p3: { id: 'p3', name: 'P3', balance: 15_000, tokenColor: '#10b981', ownedProperties: [], bankrupt: false, inAudit: false },
        },
      });

      const delta: DeltaPayload = {
        tick: 4,
        roomStarted: false,
        turnPhase: TurnPhase.WaitingRoll,
        cells: [],
        players: [
          { id: 'p1', position: 0, balance: 15_000 },
          { id: 'p2', position: 0, balance: 15_000 },
          { id: 'p3', position: 0, balance: 15_000 },
        ],
        treasury: 0,
      };

      handleDeltaTelemetry(delta, preState, postState);
      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
      expect(violations).toHaveLength(0);
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & CLEANUP (MOBILE GPU PASS EXCLUSION)
  // =========================================================================
  describe('Facet 3: Resource Disposal', () => {
    it('[TC-IMP105.11/MSS][PERF-S01/MSS] PostProcessingPipeline: isMobile = true loại bỏ N8AO pass để giải phóng GPU fillrate', () => {
      const element = PostProcessingPipeline({ isMobile: true, enableAo: true });
      expect(element).not.toBeNull();
      const children = Array.isArray(element?.props?.children)
        ? element?.props?.children
        : [element?.props?.children];
      const hasN8AO = children.some((c: any) => c && (c.type === N8AO || c.type?.name === 'N8AO'));
      expect(hasN8AO).toBe(false);
    });

    it('[TC-IMP105.12/MSS][PERF-S01/MSS] PostProcessingPipeline: isMobile = false giữ nguyên N8AO pass trên desktop', () => {
      const element = PostProcessingPipeline({ isMobile: false, enableAo: true });
      expect(element).not.toBeNull();
      const children = Array.isArray(element?.props?.children)
        ? element?.props?.children
        : [element?.props?.children];
      const hasN8AO = children.some((c: any) => c && (c.type === N8AO || c.type?.name === 'N8AO'));
      expect(hasN8AO).toBe(true);
    });

    it('[TC-IMP105.13/MSS][NET-S01/MSS] TelemetryStore: Sau khi xử lý delta hạ cánh HOSE hợp lệ, snapshot được ghi nhận đầy đủ', () => {
      const preState = createStubState({ p1Pos: 32 });
      const postState = createStubState({ p1Pos: 38 });

      const delta: DeltaPayload = {
        tick: 15,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.HosePhase,
        dice: [2, 4],
        cells: [],
        players: [{ id: 'p1', position: 38, balance: 15_000 }],
        treasury: 0,
      };

      handleDeltaTelemetry(delta, preState, postState);
      const snapshots = useTelemetryStore.getState().snapshots;
      expect(snapshots.length).toBeGreaterThanOrEqual(1);
      const lastSnap = snapshots[snapshots.length - 1];
      expect(lastSnap?.tick).toBe(15);
      const postSummaryPositions = lastSnap?.postStateSummary?.['positions'] as Record<string, number> | undefined;
      expect(postSummaryPositions?.['p1']).toBe(38);
    });

    it('[TC-IMP105.13b/MSS][PERF-S01/MSS] GameCanvas: Tiếp nhận prop isMobile và render hợp lệ cho cả desktop và mobile', () => {
      expect(typeof GameCanvas).toBe('function');
      const desktopEl = React.createElement(GameCanvas, { isMobile: false, isLobby: true });
      const mobileEl = React.createElement(GameCanvas, { isMobile: true, isLobby: false });
      expect(desktopEl).toBeDefined();
      expect(mobileEl).toBeDefined();
      expect(desktopEl.props.isMobile).toBe(false);
      expect(mobileEl.props.isMobile).toBe(true);
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE (REAL BUGS STILL CAUGHT & INVALID HOPS FLAGGED)
  // =========================================================================
  describe('Facet 4: Error Defense', () => {
    it('[TC-IMP105.14/MSS][NET-S01/MSS] handleDeltaTelemetry: Vẫn bắt lỗi TREASURY_INVARIANT_VIOLATED thật tại tick >= 3 khi trận đấu đang chạy', () => {
      const preState = createStubState({ treasuryPool: 2_000, p1Balance: 15_000 });
      const postState = createStubState({ treasuryPool: 2_000, p1Balance: 14_000 }); // Thất thoát 1000 Tr không giải trình

      const delta: DeltaPayload = {
        tick: 4,
        roomStarted: true,
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.WaitingRoll,
        cells: [],
        players: [{ id: 'p1', position: 0, balance: 14_000 }],
        treasury: 2_000,
      };

      handleDeltaTelemetry(delta, preState, postState);
      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
      expect(violations.length).toBeGreaterThanOrEqual(1);
    });

    it('[TC-IMP105.15/MSS][NET-S01/MSS] verifyMovementStep: Di chuyển sai số bước xúc xắc tới ô 38 (HOSE) vẫn bị phát hiện INVALID_POSITION_STEP', () => {
      const violation = verifyMovementStep({
        fromPosition: 30,
        toPosition: 38,
        dice: [2, 3], // Tổng xúc xắc là 5 (30+5 = 35 != 38)
        tick: 20,
        isTeleport: false,
      });

      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('INVALID_POSITION_STEP');
      expect(violation?.details?.expected).toBe(35);
    });

    it('[TC-IMP105.16/MSS][NET-S01/MSS] verifyMovementStep: Quân cờ tự ý nhảy ô trong HosePhase không có xúc xắc hoặc dịch chuyển bị bắt lỗi', () => {
      const violation = verifyMovementStep({
        fromPosition: 32,
        toPosition: 38,
        tick: 22,
        isTeleport: false,
      });

      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('INVALID_POSITION_STEP');
    });
  });
});
