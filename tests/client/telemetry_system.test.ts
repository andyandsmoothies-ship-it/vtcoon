// [TC-IMP24/MSS] Telemetry, Invariant Watchdog & Forensic Tracer Living Contract Tests
import { describe, it, expect, beforeEach } from 'vitest';
import {
  verifyTreasuryConservation,
  verifyMovementStep,
  verifyNonNegativeBalance,
  verifyPropertyOwnership,
  verifyAllInvariants,
} from '../../src/client/telemetry/invariant_checker.js';
import { watchdogMonitor } from '../../src/client/telemetry/watchdog_monitor.js';
import {
  generateVitestReproCode,
  generateDiagnosticJson,
} from '../../src/client/telemetry/repro_generator.js';
import {
  useTelemetryStore,
  MAX_AUDIT_ENTRIES,
  MAX_SNAPSHOT_ENTRIES,
} from '../../src/client/telemetry/telemetry_store.js';
import { handleDeltaTelemetry } from '../../src/client/telemetry/telemetry_delta_hook.js';
import type { GameState } from '../../src/client/store/game_store.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

describe('[TC-IMP24/MSS] Telemetry & Invariant Watchdog Suite', () => {
  beforeEach(() => {
    useTelemetryStore.getState().reset();
    watchdogMonitor.reset();
  });

  it('[TC-IMP24.1/MSS] phát hiện thất thoát tiền tệ vô cớ (Treasury Conservation Invariant)', () => {
    const preBalances = { p1: 15_000, p2: 15_000 };
    const postBalances = { p1: 14_500, p2: 15_000 }; // Hụt 500 Tr
    const preTreasury = 2_000;
    const postTreasury = 2_000;

    const violation = verifyTreasuryConservation({
      preBalances,
      postBalances,
      preTreasury,
      postTreasury,
      tick: 4,
    });

    expect(violation).not.toBeNull();
    expect(violation?.type).toBe('TREASURY_INVARIANT_VIOLATED');
    expect(violation?.severity).toBe('CRITICAL');
    expect(violation?.details.actualDelta).toBe(-500);
  });

  it('[TC-IMP24.2/MSS] phát hiện quân cờ dịch chuyển sai bước xúc xắc (Movement Step Consistency)', () => {
    const violation = verifyMovementStep({
      fromPosition: 0,
      toPosition: 15, // Nhảy 15 ô trong khi xúc xắc 2+3=5
      dice: [2, 3],
      tick: 5,
    });

    expect(violation).not.toBeNull();
    expect(violation?.type).toBe('INVALID_POSITION_STEP');
    expect(violation?.details.expected).toBe(5);
    expect(violation?.details.to).toBe(15);
  });

  it('[TC-IMP24.3/MSS] phát hiện số dư âm ngoài trạng thái vỡ nợ (Non-Negative Balance Guard)', () => {
    const violation = verifyNonNegativeBalance({
      players: [
        { id: 'p1', balance: 10_000 },
        { id: 'p2', balance: -500, bankrupt: false, overdraftRoundsLeft: 0 },
      ],
      isInInsolvency: false,
      tick: 8,
    });

    expect(violation).not.toBeNull();
    expect(violation?.type).toBe('NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY');
    expect(violation?.details.playerId).toBe('p2');
    expect(violation?.details.balance).toBe(-500);
  });

  it('[TC-IMP24.4/MSS] phát hiện ô đặc biệt bị gán chủ hoặc cấp nhà vượt ngưỡng 0-3', () => {
    // Ô 0 (Khởi Hành GO) là ô đặc biệt không thể mua
    const violationOwner = verifyPropertyOwnership({
      cells: [{ index: 0, ownerId: 'cheater_p1' }],
      tick: 10,
    });
    expect(violationOwner).not.toBeNull();
    expect(violationOwner?.type).toBe('PROPERTY_OWNERSHIP_CORRUPTED');

    // Cấp nhà 4 vượt giới hạn tối đa 3
    const violationLevel = verifyPropertyOwnership({
      cells: [{ index: 1, level: 4 }],
      tick: 11,
    });
    expect(violationLevel).not.toBeNull();
    expect(violationLevel?.type).toBe('PROPERTY_OWNERSHIP_CORRUPTED');
  });

  it('[TC-IMP24.5/MSS] Watchdog phát hiện kẹt lượt chơi quá 45 giây', () => {
    const violation = watchdogMonitor.checkTurnStall({
      currentTurnPlayerId: 'player_slow',
      timeRemaining: 0,
      elapsedTurnMs: 46_000,
      tick: 15,
    });

    expect(violation).not.toBeNull();
    expect(violation?.type).toBe('TURN_STALLED');
    expect(violation?.severity).toBe('WARNING');
  });

  it('[TC-IMP24.6/MSS] Watchdog phát hiện Bot spam thao tác lặp vô tận (> 8 actions / 300ms)', () => {
    const now = Date.now();
    let violation = null;

    for (let i = 0; i < 9; i++) {
      violation = watchdogMonitor.recordBotAction('bot_1', now + i * 10, 20);
    }

    expect(violation).not.toBeNull();
    expect(violation?.type).toBe('BOT_INFINITE_LOOP');
    expect(violation?.severity).toBe('CRITICAL');
  });

  it('[TC-IMP24.7/MSS] Repro Generator sinh mã Vitest và JSON chẩn đoán chính xác', () => {
    const dump = {
      exportedAt: 1726000000000,
      roomCode: 'VT-TEST',
      seed: 99999,
      metrics: {
        fps: 59.8,
        frameTimeMs: 16.7,
        drawCalls: 45,
        triangles: 35000,
        pingRttMs: 18,
        deltaBytes: 512,
        tickRate: 1,
      },
      violations: [
        {
          id: 'v1',
          timestamp: 1726000000000,
          tick: 3,
          type: 'TREASURY_INVARIANT_VIOLATED' as const,
          severity: 'CRITICAL' as const,
          message: 'Lỗi tiền tệ',
          details: {},
        },
      ],
      snapshots: [],
      auditLogs: [],
      recordedIntents: [
        { playerId: 'p1', intent: { type: 'INTENT_ROLL' }, timestamp: 1726000000000 },
      ],
    };

    const reproCode = generateVitestReproCode(dump);
    expect(reproCode).toContain("describe('Forensic Replay for Room VT_TEST'");
    expect(reproCode).toContain('const seed = 99999;');
    expect(reproCode).toContain('"type": "INTENT_ROLL"');
    expect(reproCode).toContain("import { RoomManager } from '../../src/server/room_manager.js';");
    expect(reproCode).toContain("dispatchPlayerIntent(mgr, roomCode, record.playerId, record.intent as PlayerIntent)");

    const jsonDump = generateDiagnosticJson(dump);
    expect(jsonDump).toContain('"roomCode": "VT-TEST"');
    expect(jsonDump).toContain('"seed": 99999');
  });

  it('[TC-IMP24.8/MSS] TelemetryStore duy trì Ring Buffer và kích hoạt Debug Auto-Freeze', () => {
    const store = useTelemetryStore.getState();

    // Thêm 105 log -> giới hạn MAX_AUDIT_ENTRIES = 100
    for (let i = 0; i < 105; i++) {
      store.addAuditLog({
        tick: i,
        source: 'SYSTEM',
        action: 'TEST',
        payloadSummary: `Item ${i}`,
      });
    }
    expect(useTelemetryStore.getState().auditLogs.length).toBe(MAX_AUDIT_ENTRIES);

    // Thêm 25 snapshot -> giới hạn MAX_SNAPSHOT_ENTRIES = 20
    for (let i = 0; i < 25; i++) {
      store.addSnapshot({
        tick: i,
        timestamp: Date.now(),
        preStateSummary: {},
        postStateSummary: {},
      });
    }
    expect(useTelemetryStore.getState().snapshots.length).toBe(MAX_SNAPSHOT_ENTRIES);

    // Auto-Freeze khi gặp lỗi CRITICAL
    store.setAutoFreezeEnabled(true);
    store.reportViolation({
      tick: 50,
      type: 'TREASURY_INVARIANT_VIOLATED',
      severity: 'CRITICAL',
      message: 'Critical error',
      details: {},
    });

    expect(useTelemetryStore.getState().isFrozen).toBe(true);
  });

  it('[TC-IMP24.9/MSS] handleDeltaTelemetry tích hợp bắt lỗi và lưu snapshot', () => {
    const preState = {
      playersInfo: {
        p1: { id: 'p1', name: 'P1', balance: 15_000, tokenColor: '#fff', ownedProperties: [] },
      },
      playerPositions: { p1: 0 },
      levelMap: {},
      treasuryPool: 2_000,
      activeModal: null,
    } as unknown as GameState;

    const postState = {
      playersInfo: {
        p1: { id: 'p1', name: 'P1', balance: 14_000, tokenColor: '#fff', ownedProperties: [] }, // hụt 1000 vô cớ
      },
      playerPositions: { p1: 0 },
      levelMap: {},
      treasuryPool: 2_000,
      activeModal: null,
    } as unknown as GameState;

    const delta: DeltaPayload = { tick: 1, cells: [], players: [{ id: 'p1', position: 0, balance: 14_000 }] };
    handleDeltaTelemetry(delta, preState, postState);

    const storeState = useTelemetryStore.getState();
    expect(storeState.violations.length).toBeGreaterThan(0);
    expect(storeState.violations[0]?.type).toBe('TREASURY_INVARIANT_VIOLATED');
    expect(storeState.snapshots.length).toBe(1);
    expect(storeState.auditLogs.length).toBe(1);
  });

  it('[TC-IMP24.10/MSS] handleDeltaTelemetry không báo động nhầm giao dịch hợp lệ', () => {
    // Mua ô Cần Thơ (ô 1, giá 600 Tr): Tiền giảm 600 Tr đi kèm cell sở hữu mới
    const preBuy = {
      playersInfo: { p1: { id: 'p1', name: 'P1', balance: 15_000, tokenColor: '#fff', ownedProperties: [] } },
      playerPositions: { p1: 1 },
      levelMap: {},
      treasuryPool: 2_000,
      activeModal: null,
    } as unknown as GameState;

    const postBuy = {
      playersInfo: { p1: { id: 'p1', name: 'P1', balance: 14_400, tokenColor: '#fff', ownedProperties: [1] } },
      playerPositions: { p1: 1 },
      levelMap: { 1: 0 },
      treasuryPool: 2_000,
      activeModal: null,
    } as unknown as GameState;

    const deltaBuy: DeltaPayload = {
      tick: 2,
      cells: [{ index: 1, ownerId: 'p1', level: 0 }],
      players: [{ id: 'p1', position: 1, balance: 14_400 }],
    };

    useTelemetryStore.getState().reset();
    handleDeltaTelemetry(deltaBuy, preBuy, postBuy);
    const buyViolations = useTelemetryStore.getState().violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
    expect(buyViolations.length).toBe(0);

    // Đi qua GO (Nhận lương 2000 Tr): Tiền tăng 2000 Tr
    const preGo = {
      playersInfo: { p1: { id: 'p1', name: 'P1', balance: 14_000, tokenColor: '#fff', ownedProperties: [1] } },
      playerPositions: { p1: 38 },
      levelMap: { 1: 0 },
      treasuryPool: 2_000,
      activeModal: null,
    } as unknown as GameState;

    const postGo = {
      playersInfo: { p1: { id: 'p1', name: 'P1', balance: 16_000, tokenColor: '#fff', ownedProperties: [1] } },
      playerPositions: { p1: 3 },
      levelMap: { 1: 0 },
      treasuryPool: 2_000,
      activeModal: null,
    } as unknown as GameState;

    const deltaGo: DeltaPayload = {
      tick: 3,
      dice: [2, 3],
      cells: [],
      players: [{ id: 'p1', position: 3, balance: 16_000 }],
    };

    useTelemetryStore.getState().reset();
    handleDeltaTelemetry(deltaGo, preGo, postGo);
    const goViolations = useTelemetryStore.getState().violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
    expect(goViolations.length).toBe(0);
  });
});
