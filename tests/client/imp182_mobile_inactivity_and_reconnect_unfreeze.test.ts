// [TC-IMP182/MSS][UC-IMP182]
// Universal Contract Test Suite: Mobile Tab Inactivity / Background Resilience, Reconnect Unfreeze & Full-Sync Telemetry Invariant Calibration
// Traceability: docs/plans/improvements/IMP-182-mobile-inactivity-and-reconnect-unfreeze_plan.md
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useGameStore, type GameState, type PlayerHudInfo } from '../../src/client/store/game_store.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { useGameWs } from '../../src/client/network/use_game_ws.js';
import { ActionDock } from '../../src/client/ui/action_dock.js';
import {
  handleDeltaTelemetry,
  computeExpectedDelta,
} from '../../src/client/telemetry/telemetry_delta_hook.js';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store.js';
import { AudioEngine } from '../../src/client/audio/audio_engine.js';
import { TurnPhase } from '../../src/domain/room.js';
import { MarketCardId } from '../../src/domain/event_card_types.js';
import type { DeltaPayload, CellDelta } from '../../src/server/session_manager.js';

interface MockSocket {
  readyState: number;
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  onopen: ((event: unknown) => void) | null;
  onmessage: ((event: { data: string }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onclose: ((event: unknown) => void) | null;
}

function createMockSocket(initialState: number = 0): MockSocket {
  return {
    readyState: initialState,
    send: vi.fn(),
    close: vi.fn(),
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
  };
}

function create40Cells(): CellDelta[] {
  const cells: CellDelta[] = [];
  cells.push({ index: 0, level: 0 });
  cells.push({ index: 1, level: 0 });
  cells.push({ index: 2, level: 0 });
  cells.push({ index: 3, level: 0 });
  cells.push({ index: 4, level: 0 });
  cells.push({ index: 5, level: 0 });
  cells.push({ index: 6, level: 0 });
  cells.push({ index: 7, level: 0 });
  cells.push({ index: 8, level: 0 });
  cells.push({ index: 9, level: 0 });
  cells.push({ index: 10, level: 0 });
  cells.push({ index: 11, level: 0 });
  cells.push({ index: 12, level: 0 });
  cells.push({ index: 13, level: 0 });
  cells.push({ index: 14, level: 0 });
  cells.push({ index: 15, level: 0 });
  cells.push({ index: 16, level: 0 });
  cells.push({ index: 17, level: 0 });
  cells.push({ index: 18, level: 0 });
  cells.push({ index: 19, level: 0 });
  cells.push({ index: 20, level: 0 });
  cells.push({ index: 21, level: 0 });
  cells.push({ index: 22, level: 0 });
  cells.push({ index: 23, level: 0 });
  cells.push({ index: 24, level: 0 });
  cells.push({ index: 25, level: 0 });
  cells.push({ index: 26, level: 0 });
  cells.push({ index: 27, level: 0 });
  cells.push({ index: 28, level: 0 });
  cells.push({ index: 29, level: 0 });
  cells.push({ index: 30, level: 0 });
  cells.push({ index: 31, level: 0 });
  cells.push({ index: 32, level: 0 });
  cells.push({ index: 33, level: 0 });
  cells.push({ index: 34, level: 0 });
  cells.push({ index: 35, level: 0 });
  cells.push({ index: 36, level: 0 });
  cells.push({ index: 37, level: 0 });
  cells.push({ index: 38, level: 0 });
  cells.push({ index: 39, level: 0 });
  return cells;
}

function renderHookInHarness<T>(hookFn: () => T): T {
  let captured: T | undefined;
  function TestHarness() {
    captured = hookFn();
    return null;
  }
  renderToStaticMarkup(React.createElement(TestHarness));
  return captured as T;
}

describe('[TC-IMP182/MSS][UC-IMP182] Mobile Tab Inactivity & Reconnect Unfreeze Contract', () => {
  let docListeners: Record<string, ((event?: unknown) => void)[]>;
  let winListeners: Record<string, ((event?: unknown) => void)[]>;
  let playSfxSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    useGameStore.getState().resetGameState();
    useTelemetryStore.getState().reset();

    docListeners = {};
    winListeners = {};

    vi.stubGlobal('document', {
      visibilityState: 'visible',
      addEventListener: (type: string, handler: (e?: unknown) => void) => {
        docListeners[type] = docListeners[type] || [];
        docListeners[type].push(handler);
      },
      removeEventListener: (type: string, handler: (e?: unknown) => void) => {
        if (docListeners[type]) {
          docListeners[type] = docListeners[type].filter((h) => h !== handler);
        }
      },
    });

    vi.stubGlobal('window', {
      location: {
        search: '',
        protocol: 'http:',
        host: 'localhost:3000',
        hostname: 'localhost',
      },
      addEventListener: (type: string, handler: (e?: unknown) => void) => {
        winListeners[type] = winListeners[type] || [];
        winListeners[type].push(handler);
      },
      removeEventListener: (type: string, handler: (e?: unknown) => void) => {
        if (winListeners[type]) {
          winListeners[type] = winListeners[type].filter((h) => h !== handler);
        }
      },
    });

    vi.spyOn(React, 'useEffect').mockImplementation((effect) => {
      effect();
    });

    playSfxSpy = vi.spyOn(AudioEngine, 'playSfx').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (FULL SYNC 40 CELLS VS PARTIAL SYNC < 40 CELLS)
  // =========================================================================
  describe('Facet 1: Boundary & Range', () => {
    it('[TC-IMP182.01/MSS][UC-IMP182] Boundary: Delta với đủ 40 ô đất là Full Sync, bỏ qua syncDiceRoll và không kích hoạt isRolling', () => {
      useGameStore.setState({ isRolling: false, lastDiceSeq: 10 });
      const fullDelta: DeltaPayload = {
        roomCode: 'VTM1RJ',
        tick: 159,
        dice: [3, 4],
        diceSeq: 11,
        cells: create40Cells(),
      };

      applyDeltaToStore(fullDelta);

      expect(useGameStore.getState().isRolling).toBe(false);
      expect(useGameStore.getState().dice).toEqual([3, 4]);
    });

    it('[TC-IMP182.02/MSS][UC-IMP182] Boundary: Delta với < 40 ô đất (Partial Sync, ví dụ 1 ô) kèm xúc xắc mới thì vẫn kích hoạt isRolling bình thường', () => {
      useGameStore.setState({ isRolling: false, lastDiceSeq: 10 });
      const partialDelta: DeltaPayload = {
        roomCode: 'VTM1RJ',
        tick: 160,
        dice: [5, 2],
        diceSeq: 11,
        cells: [{ index: 1, level: 1 }],
      };

      applyDeltaToStore(partialDelta);

      expect(useGameStore.getState().isRolling).toBe(true);
      expect(useGameStore.getState().dice).toEqual([5, 2]);
    });

    it('[TC-IMP182.03/MSS][UC-IMP182] Boundary: Delta với 40 ô đất (Full Sync) không phát âm thanh DICE_ROLL qua AudioEngine', () => {
      const fullDelta: DeltaPayload = {
        roomCode: 'VTM1RJ',
        tick: 159,
        dice: [6, 1],
        diceSeq: 20,
        cells: create40Cells(),
      };

      applyDeltaToStore(fullDelta);

      expect(playSfxSpy).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // FACET 2: REACTIVITY & LIFECYCLE (VISIBILITY CHANGE & STORE UNFREEZE)
  // =========================================================================
  describe('Facet 2: State Reactivity & Multi-Turn Teardown', () => {
    it('[TC-IMP182.04/MSS][UC-IMP182] Reactivity: Khi sự kiện visibilitychange chuyển sang visible, dọn dẹp isRolling về false', () => {
      useGameStore.setState({ isRolling: true });
      renderHookInHarness(() =>
        useGameWs({
          roomCode: 'VTM1RJ',
          playerId: 'p1-investor',
          autoConnect: false,
          webSocketFactory: () => createMockSocket(1),
        })
      );

      const visibilityHandler = docListeners['visibilitychange']?.[0];
      expect(visibilityHandler).toBeDefined();
      visibilityHandler?.();
      vi.advanceTimersByTime(200);

      expect(useGameStore.getState().isRolling).toBe(false);
    });

    it('[TC-IMP182.05/MSS][UC-IMP182] Reactivity: Khi sự kiện visibilitychange chuyển sang visible, dọn dẹp activePawnAnimation về null', () => {
      useGameStore.setState({
        activePawnAnimation: {
          playerId: 'p1-investor',
          fromCell: 0,
          waypoints: [1, 2, 3],
          currentIndex: 1,
          isAnimating: true,
        },
      });
      renderHookInHarness(() =>
        useGameWs({
          roomCode: 'VTM1RJ',
          playerId: 'p1-investor',
          autoConnect: false,
          webSocketFactory: () => createMockSocket(1),
        })
      );

      const visibilityHandler = docListeners['visibilitychange']?.[0];
      expect(visibilityHandler).toBeDefined();
      visibilityHandler?.();
      vi.advanceTimersByTime(200);

      expect(useGameStore.getState().activePawnAnimation).toBeNull();
    });

    it('[TC-IMP182.06/MSS][UC-IMP182] Reactivity: Khi sự kiện visibilitychange chuyển sang visible, dọn dẹp pawnAnimationQueue về rỗng []', () => {
      useGameStore.setState({
        pawnAnimationQueue: [
          { playerId: 'p2-tycoon', fromCell: 5, targetCell: 10, waypoints: [6, 7, 8, 9, 10] },
        ],
      });
      renderHookInHarness(() =>
        useGameWs({
          roomCode: 'VTM1RJ',
          playerId: 'p1-investor',
          autoConnect: false,
          webSocketFactory: () => createMockSocket(1),
        })
      );

      const visibilityHandler = docListeners['visibilitychange']?.[0];
      expect(visibilityHandler).toBeDefined();
      visibilityHandler?.();
      vi.advanceTimersByTime(200);

      expect(useGameStore.getState().pawnAnimationQueue).toEqual([]);
    });

    it('[TC-IMP182.07/MSS][UC-IMP182] Reactivity: Khi sự kiện visibilitychange chuyển sang visible, dọn dẹp pendingPawnMove về null', () => {
      useGameStore.setState({
        pendingPawnMove: { playerId: 'p1-investor', targetCell: 24, fromCell: 17 },
      });
      renderHookInHarness(() =>
        useGameWs({
          roomCode: 'VTM1RJ',
          playerId: 'p1-investor',
          autoConnect: false,
          webSocketFactory: () => createMockSocket(1),
        })
      );

      const visibilityHandler = docListeners['visibilitychange']?.[0];
      expect(visibilityHandler).toBeDefined();
      visibilityHandler?.();
      vi.advanceTimersByTime(200);

      expect(useGameStore.getState().pendingPawnMove).toBeNull();
    });

    it('[TC-IMP182.08/MSS][UC-IMP182] Reactivity: ActionDock đăng ký lắng nghe visibilitychange để reset isRollPending = false khi tab quay lại foreground', () => {
      renderToStaticMarkup(
        React.createElement(ActionDock, { localPlayerId: 'p1-investor', isMyTurn: true })
      );

      const actionDockVisibilityListeners = docListeners['visibilitychange'] ?? [];
      expect(actionDockVisibilityListeners.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // FACET 3: CONCURRENCY, DEBOUNCE & ZOMBIE SOCKET (RESOURCE & TIMERS)
  // =========================================================================
  describe('Facet 3: Concurrency, Debounce & Zombie Socket', () => {
    it('[TC-IMP182.09/MSS][UC-IMP182] Concurrency: connect() không tạo WebSocket mới khi socket đang ở readyState === 0 (CONNECTING)', () => {
      let createdCount = 0;
      const wsHarness = renderHookInHarness(() =>
        useGameWs({
          roomCode: 'VTM1RJ',
          playerId: 'p1-investor',
          autoConnect: false,
          webSocketFactory: () => {
            createdCount++;
            return createMockSocket(0); // CONNECTING
          },
        })
      );

      wsHarness.connect();
      wsHarness.connect();

      expect(createdCount).toBe(1);
    });

    it('[TC-IMP182.10/MSS][UC-IMP182] Concurrency: connect() không tạo WebSocket mới khi socket đang ở readyState === 1 (OPEN)', () => {
      let createdCount = 0;
      const wsHarness = renderHookInHarness(() =>
        useGameWs({
          roomCode: 'VTM1RJ',
          playerId: 'p1-investor',
          autoConnect: false,
          webSocketFactory: () => {
            createdCount++;
            return createMockSocket(1); // OPEN
          },
        })
      );

      wsHarness.connect();
      wsHarness.connect();

      expect(createdCount).toBe(1);
    });

    it('[TC-IMP182.11/MSS][UC-IMP182] Debounce: Bão sự kiện visibilitychange + focus + pageshow trong < 200ms được debounce 200ms thành đúng 1 lần gọi', () => {
      const socket = createMockSocket(1);
      renderHookInHarness(() =>
        useGameWs({
          roomCode: 'VTM1RJ',
          playerId: 'p1-investor',
          autoConnect: true,
          webSocketFactory: () => socket,
        })
      );

      socket.onopen?.({});
      socket.send.mockClear();

      // Event storm in 5ms
      docListeners['visibilitychange']?.[0]?.();
      winListeners['focus']?.[0]?.();
      winListeners['pageshow']?.[0]?.();

      vi.advanceTimersByTime(190);
      expect(socket.send).toHaveBeenCalledTimes(0);

      vi.advanceTimersByTime(10);
      expect(socket.send).toHaveBeenCalledTimes(1);
    });

    it('[TC-IMP182.12/MSS][UC-IMP182] Zombie Socket Watchdog: Khi readyState === 1, gửi requestResync() kích hoạt watchdog 2.5s; nếu quá 2.5s không phản hồi thì đóng socket cũ và kết nối lại', () => {
      let socketCount = 0;
      let activeSocket: MockSocket | null = null;
      renderHookInHarness(() =>
        useGameWs({
          roomCode: 'VTM1RJ',
          playerId: 'p1-investor',
          autoConnect: true,
          webSocketFactory: () => {
            socketCount++;
            activeSocket = createMockSocket(1);
            return activeSocket;
          },
        })
      );

      activeSocket!.onopen?.({});
      expect(socketCount).toBe(1);

      // Wakeup triggers requestResync
      docListeners['visibilitychange']?.[0]?.();
      vi.advanceTimersByTime(200);

      // 2.5s timeout elapses without any incoming server messages
      vi.advanceTimersByTime(2500);

      expect(activeSocket!.close).toHaveBeenCalled();
      expect(socketCount).toBe(2);
    });

    it('[TC-IMP182.13/MSS][UC-IMP182] Zombie Socket Watchdog: Nhận được message từ server trong vòng 2.5s sẽ hủy watchdog, socket không bị đóng', () => {
      let socketCount = 0;
      let activeSocket: MockSocket | null = null;
      renderHookInHarness(() =>
        useGameWs({
          roomCode: 'VTM1RJ',
          playerId: 'p1-investor',
          autoConnect: true,
          webSocketFactory: () => {
            socketCount++;
            activeSocket = createMockSocket(1);
            return activeSocket;
          },
        })
      );

      activeSocket!.onopen?.({});
      docListeners['visibilitychange']?.[0]?.();
      vi.advanceTimersByTime(200);

      // Incoming message arrives before 2.5s
      vi.advanceTimersByTime(1000);
      activeSocket!.onmessage?.({
        data: JSON.stringify({ type: 'STATE_DELTA', tick: 170, roomCode: 'VTM1RJ' }),
      });

      // Advance past the original 2.5s threshold
      vi.advanceTimersByTime(1600);

      expect(activeSocket!.close).not.toHaveBeenCalled();
      expect(socketCount).toBe(1);
    });
  });

  // =========================================================================
  // FACET 4: STATE ISOLATION & TURN N+1 (UNCONDITIONAL TEARDOWN & PURGE)
  // =========================================================================
  describe('Facet 4: State Isolation & Turn N+1', () => {
    it('[TC-IMP182.14/MSS][UC-IMP182] State Isolation: Nhận Full Sync delta (40 ô) dọn dẹp vô điều kiện activePawnAnimation về null', () => {
      useGameStore.setState({
        activePawnAnimation: {
          playerId: 'p1-investor',
          fromCell: 10,
          waypoints: [11, 12],
          currentIndex: 0,
          isAnimating: true,
        },
      });

      applyDeltaToStore({
        roomCode: 'VTM1RJ',
        tick: 180,
        cells: create40Cells(),
      });

      expect(useGameStore.getState().activePawnAnimation).toBeNull();
    });

    it('[TC-IMP182.15/MSS][UC-IMP182] State Isolation: Nhận Full Sync delta (40 ô) dọn dẹp vô điều kiện isRolling về false', () => {
      useGameStore.setState({ isRolling: true });

      applyDeltaToStore({
        roomCode: 'VTM1RJ',
        tick: 180,
        cells: create40Cells(),
      });

      expect(useGameStore.getState().isRolling).toBe(false);
    });

    it('[TC-IMP182.16/MSS][UC-IMP182] State Isolation: Nhận Full Sync delta (40 ô) dọn dẹp pawnAnimationQueue về rỗng [] và pendingPawnMove về null', () => {
      useGameStore.setState({
        pawnAnimationQueue: [
          { playerId: 'p1-investor', fromCell: 0, targetCell: 5, waypoints: [1, 2, 3, 4, 5] },
        ],
        pendingPawnMove: { playerId: 'p1-investor', targetCell: 5, fromCell: 0 },
      });

      applyDeltaToStore({
        roomCode: 'VTM1RJ',
        tick: 180,
        cells: create40Cells(),
      });

      expect(useGameStore.getState().pawnAnimationQueue).toEqual([]);
      expect(useGameStore.getState().pendingPawnMove).toBeNull();
    });

    it('[TC-IMP182.17/MSS][UC-IMP182] Turn N+1 Isolation: hasRolledThisTurn được reset về false khi currentTurnPlayerId chuyển sang người chơi khác', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1-investor',
        hasRolledThisTurn: true,
      });

      applyDeltaToStore({
        roomCode: 'VTM1RJ',
        tick: 181,
        cells: [],
        currentTurnPlayerId: 'p2-tycoon',
      });

      expect(useGameStore.getState().currentTurnPlayerId).toBe('p2-tycoon');
      expect(useGameStore.getState().hasRolledThisTurn).toBe(false);
    });

    it('[TC-IMP182.18/MSS][UC-IMP182] Turn N+1 Isolation: hasRolledThisTurn được reset về false khi nhận Full Sync delta (40 ô)', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1-investor',
        hasRolledThisTurn: true,
      });

      applyDeltaToStore({
        roomCode: 'VTM1RJ',
        tick: 182,
        cells: create40Cells(),
      });

      expect(useGameStore.getState().hasRolledThisTurn).toBe(false);
    });
  });

  // =========================================================================
  // FACET 5: TELEMETRY INVARIANT CALIBRATION (TICKS 159, 226, 243, 247)
  // =========================================================================
  describe('Facet 5: Telemetry Invariant Calibration', () => {
    function createPreGameState(): GameState {
      const defaultInfo: Record<string, PlayerHudInfo> = {
        'p1-investor': {
          id: 'p1-investor',
          name: 'Investor P1',
          balance: 14000,
          tokenColor: '#ef4444',
          ownedProperties: [1],
          bankrupt: false,
          inAudit: false,
        },
        'p2-tycoon': {
          id: 'p2-tycoon',
          name: 'Tycoon P2',
          balance: 16000,
          tokenColor: '#3b82f6',
          ownedProperties: [],
          bankrupt: false,
          inAudit: false,
        },
      };

      return {
        playersInfo: defaultInfo,
        playerPositions: { 'p1-investor': 17, 'p2-tycoon': 0 },
        treasuryPool: 1000,
        activeModal: null,
        levelMap: { 1: 0 },
        auction: null,
        modalPayload: null,
        turnPhase: TurnPhase.WaitingRoll,
        turnTimeRemaining: 60,
        currentTurnPlayerId: 'p1-investor',
        isRolling: false,
        hasRolledThisTurn: false,
        activeModifiers: [],
      } as unknown as GameState;
    }

    it('[TC-IMP182.19/MSS][UC-IMP182] Telemetry Calibration (Tick 159): Full Sync với 40 ô đất và chênh lệch kho bạc không sinh ra vi phạm TREASURY_INVARIANT_VIOLATED', () => {
      const preState = createPreGameState();
      const postState: GameState = {
        ...preState,
        treasuryPool: 2550, // Treasury shifted during AFK
      };

      const fullDelta: DeltaPayload = {
        roomCode: 'VTM1RJ',
        tick: 159,
        roomStarted: true,
        treasury: 2550,
        cells: create40Cells(),
      };

      handleDeltaTelemetry(fullDelta, preState, postState);

      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
      expect(violations).toHaveLength(0);
    });

    it('[TC-IMP182.20/MSS][UC-IMP182] Telemetry Calibration (Tick 226): computeExpectedDelta trả về null khi isUnmodeledEvent là true ngay cả khi hasKnown === true (vượt GO + vỡ nợ)', () => {
      const preState = createPreGameState();
      const deltaWithPassGoAndInsolvency: DeltaPayload = {
        roomCode: 'VTM1RJ',
        tick: 226,
        currentTurnPlayerId: 'p1-investor',
        turnPhase: TurnPhase.InsolvencyPhase,
        cells: [],
        dice: [3, 4],
        players: [
          { id: 'p1-investor', position: 2, balance: -500 }, // Passed GO from cell 36 to cell 2, but became insolvent
        ],
      };

      const movement = {
        fromPosition: 36,
        toPosition: 2,
        dice: [3, 4] as const,
        isTeleport: false,
      };

      const expected = computeExpectedDelta(deltaWithPassGoAndInsolvency, preState, movement);

      expect(expected).toBeNull();
    });

    it('[TC-IMP182.21/MSS][UC-IMP182] Telemetry Calibration (Tick 243): Full Sync với 40 ô đất và quân cờ đổi vị trí từ 17 sang 24 trong PropertyManagement không sinh ra INVALID_POSITION_STEP', () => {
      const preState = createPreGameState();
      const postState: GameState = {
        ...preState,
        playerPositions: { 'p1-investor': 24, 'p2-tycoon': 0 },
      };

      const fullDelta: DeltaPayload = {
        roomCode: 'VTM1RJ',
        tick: 243,
        roomStarted: true,
        currentTurnPlayerId: 'p1-investor',
        turnPhase: TurnPhase.PropertyManagement,
        players: [{ id: 'p1-investor', position: 24, balance: 14000 }],
        cells: create40Cells(),
      };

      handleDeltaTelemetry(fullDelta, preState, postState);

      const stepViolations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'INVALID_POSITION_STEP');
      expect(stepViolations).toHaveLength(0);
    });

    it('[TC-IMP182.22/MSS][UC-IMP182] Telemetry Calibration (Tick 243): Full Sync với 40 ô đất và quân cờ đổi vị trí từ 17 sang 24 không sinh ra TREASURY_INVARIANT_VIOLATED', () => {
      const preState = createPreGameState();
      const postState: GameState = {
        ...preState,
        playerPositions: { 'p1-investor': 24, 'p2-tycoon': 0 },
        treasuryPool: 1265, // Discrepancy during background
      };

      const fullDelta: DeltaPayload = {
        roomCode: 'VTM1RJ',
        tick: 243,
        roomStarted: true,
        treasury: 1265,
        players: [{ id: 'p1-investor', position: 24, balance: 14000 }],
        cells: create40Cells(),
      };

      handleDeltaTelemetry(fullDelta, preState, postState);

      const treasuryViolations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
      expect(treasuryViolations).toHaveLength(0);
    });

    it('[TC-IMP182.23/MSS][UC-IMP182] Telemetry Calibration (Tick 247): Khi MC_CREDIT_STIMULUS đang hiệu lực, nâng cấp ô đất được tính chiết khấu 20% (Math.floor(rawCost * 0.8)), không sinh ra TREASURY_INVARIANT_VIOLATED', () => {
      const preState: GameState = {
        ...createPreGameState(),
        levelMap: { 1: 0 }, // Cell 1 Bến Vân Đồn level 0
        activeModifiers: [
          {
            type: MarketCardId.MC_CREDIT_STIMULUS,
            remainingRounds: 2,
            affectedCells: [],
          },
        ],
      };

      // Cell 1 raw upgrade cost is 1260 Tr. With 20% discount: 1260 * 0.8 = 1008 Tr.
      const postState: GameState = {
        ...preState,
        levelMap: { 1: 1 },
        playersInfo: {
          ...preState.playersInfo,
          'p1-investor': {
            ...preState.playersInfo['p1-investor']!,
            balance: 14000 - 1008, // Paid discounted 1008 Tr.
          },
        },
      };

      const upgradeDelta: DeltaPayload = {
        roomCode: 'VTM1RJ',
        tick: 247,
        roomStarted: true,
        currentTurnPlayerId: 'p1-investor',
        cells: [{ index: 1, level: 1 }],
        players: [{ id: 'p1-investor', balance: 14000 - 1008, position: 1 }],
        activeModifiers: [
          {
            type: MarketCardId.MC_CREDIT_STIMULUS,
            remainingRounds: 2,
            affectedCells: [],
          },
        ],
      };

      handleDeltaTelemetry(upgradeDelta, preState, postState);

      const treasuryViolations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'TREASURY_INVARIANT_VIOLATED');
      expect(treasuryViolations).toHaveLength(0);
    });
  });

  // =========================================================================
  // FACET 6: ACTION DOCK AVAILABILITY & ERGONOMICS
  // =========================================================================
  describe('Facet 6: ActionDock Availability & Ergonomics', () => {
    it('[TC-IMP182.24/MSS][UC-IMP182] ActionDock Ergonomics: Nút Đổ Xúc Xắc có disabled: false khi nhận Full Sync ở pha WaitingRoll (kèm static dice)', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1-investor',
        hasRolledThisTurn: false,
        isRolling: false,
        activePawnAnimation: null,
        pawnAnimationQueue: [],
        pendingPawnMove: null,
        turnPhase: TurnPhase.WaitingRoll,
        playersInfo: {
          'p1-investor': {
            id: 'p1-investor',
            name: 'Investor P1',
            balance: 15000,
            tokenColor: '#ef4444',
            ownedProperties: [],
            bankrupt: false,
            inAudit: false,
          },
        },
      });

      // Apply full sync delta with static dice (should NOT trigger isRolling: true)
      applyDeltaToStore({
        roomCode: 'VTM1RJ',
        tick: 250,
        dice: [4, 2],
        turnPhase: TurnPhase.WaitingRoll,
        currentTurnPlayerId: 'p1-investor',
        cells: create40Cells(),
      });

      const markup = renderToStaticMarkup(
        React.createElement(ActionDock, {
          localPlayerId: 'p1-investor',
          isMyTurn: true,
          ssrState: useGameStore.getState(),
        })
      );

      // Roll button should not be disabled
      const rollBtnTag = markup.match(/<button[^>]*data-testid="roll-dice-btn"[^>]*>/)?.[0] ?? '';
      expect(rollBtnTag).not.toBe('');
      expect(rollBtnTag).not.toContain('disabled');
    });

    it('[TC-IMP182.25/MSS][UC-IMP182] ActionDock Layout: Container <nav> của ActionDock có class overflow-x-auto để chống tràn bố cục trên mobile 360px', () => {
      const markup = renderToStaticMarkup(
        React.createElement(ActionDock, { localPlayerId: 'p1-investor' })
      );

      expect(markup).toMatch(/<nav[^>]*class="[^"]*overflow-x-auto/);
    });
  });
});
