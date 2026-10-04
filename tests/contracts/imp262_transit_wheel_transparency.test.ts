// [CONTRACT TEST] IMP-262: Transit Wheel Transparency and Second-Hop Consequence Suite
// Traceability Tags: [TC-262.01/MSS..TC-262.16/A4] & [UC-IMP262]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TransitWheelOutcome,
  formatTransitWheelBroadcast,
} from '../../src/domain/transit_wheel.js';
import {
  createRoom,
  createPlayer,
  TurnPhase,
  ActionRejectReason,
  calculateGoSalary,
  type Room,
  type Player,
} from '../../src/domain/room.js';
import {
  handleSpinTransitWheel,
} from '../../src/server/transit_wheel_handler.js';
import {
  buyProperty,
  BuyResult,
  type PropertyRegistry,
} from '../../src/domain/property_manager.js';
import type { PropertyStateMap } from '../../src/domain/property_data.js';
import {
  useActivityStore,
  type ActivityLogEntry,
} from '../../src/client/store/activity_store.js';
import {
  useGameStore,
  FloatingTextType,
  type GameState,
} from '../../src/client/store/game_store.js';
import { useLobbyStore } from '../../src/client/store/lobby_store.js';
import {
  detectTransitActivities,
  resetTransitActivityTracker,
} from '../../src/client/network/activity_tracker.js';
import {
  handleTransitBadge,
  dispatchActivityFloatingBadges,
} from '../../src/client/network/activity_badge_dispatcher.js';
import {
  calculateBotStepDelay,
} from '../../src/server/network/turn_orchestrator.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

// Station 1 Domain Model Augmentation for IMP-262
declare module '../../src/domain/room.js' {
  interface Player {
    hasSpunTransitThisTurn?: boolean;
  }
  interface Room {
    pendingTransitWheel?: { playerId: string; cellIndex: number; timestamp: number } | null;
    lastTransitResult?: {
      playerId: string;
      cellIndex: number;
      outcome: string;
      targetCell?: number;
      payout?: number;
      boostSteps?: number;
    } | null;
  }
}

function setupContractRoom(playerId = 'p1', startCell = 5, startBalance = 1000): {
  room: Room;
  player: Player;
  registry: PropertyRegistry;
  stateMap: PropertyStateMap;
} {
  const room = createRoom(playerId, 'ROOM_IMP262');
  room.started = true;
  room.phase = TurnPhase.PropertyManagement;
  room.treasury = 1000;
  room.roundCount = 1;

  const player = room.players[0]!;
  player.position = startCell;
  player.balance = startBalance;
  player.hasSpunTransitThisTurn = false;

  room.pendingTransitWheel = {
    playerId: player.id,
    cellIndex: startCell,
    timestamp: Date.now(),
  };

  const registry: PropertyRegistry = new Map<number, string>();
  const stateMap: PropertyStateMap = new Map();

  return { room, player, registry, stateMap };
}

function createMockGameState(overrides?: Partial<GameState>): GameState {
  const base = useGameStore.getState();
  return {
    ...base,
    playerPositions: { p1: 0, p2: 0 },
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
    treasuryPool: 2000,
    roundNumber: 1,
    ...overrides,
  };
}

describe('[CONTRACT] IMP-262: Transit Wheel Transparency and Second-Hop Consequence Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useActivityStore.setState({
      activityLogs: [],
      isActivityFeedOpen: false,
      unreadCount: 0,
      activeFilter: 'all',
    });
    useGameStore.setState({
      activeModal: null,
      isOfflineMode: false,
    });
    useLobbyStore.setState({
      myPlayerId: 'p1',
    });
  });

  // =========================================================================
  // FACET 1: Boundary & Range (Format String Validation & Messaging Contracts)
  // =========================================================================

  it('[TC-262.01/MSS][UC-IMP262/MSS] formatTransitWheelBroadcast: dinh dang tieng Viet chinh xac cho SPEED_BOOST co so buoc va ten o den', () => {
    const message = formatTransitWheelBroadcast({
      outcome: TransitWheelOutcome.SPEED_BOOST,
      playerName: 'Đại Gia Sài Gòn',
      stationName: 'Ga Sài Gòn',
      targetCellName: 'Hà Nội',
      boostSteps: 4,
    });
    expect(message).toBe('⚡ Đại Gia Sài Gòn quay trúng Tốc Hành! Bay thêm 4 ô tới Hà Nội.');
  });

  it('[TC-262.02/MSS][UC-IMP262/MSS] formatTransitWheelBroadcast: dinh dang tieng Viet chinh xac cho SAFE_HAVEN khi co BDS muc tieu', () => {
    const message = formatTransitWheelBroadcast({
      outcome: TransitWheelOutcome.SAFE_HAVEN,
      playerName: 'Đại Gia Sài Gòn',
      stationName: 'Ga Sài Gòn',
      targetCellName: 'Bến Thành',
    });
    expect(message).toBe('🛡️ Đại Gia Sài Gòn kích hoạt Vé VIP Hồi Hương! Bay về BĐS an toàn tại Bến Thành.');
  });

  it('[TC-262.04/MSS][UC-IMP262/MSS] formatTransitWheelBroadcast: dinh dang tieng Viet chinh xac cho CASH_BACK hien thi so tien hoan cuoc', () => {
    const message = formatTransitWheelBroadcast({
      outcome: TransitWheelOutcome.CASH_BACK,
      playerName: 'Đại Gia Sài Gòn',
      stationName: 'Ga Sài Gòn',
      payout: 300,
    });
    expect(message).toBe('💰 Đại Gia Sài Gòn quay trúng Hoàn Cước Cảng! Nhận hoàn tiền +300 Tr. từ Kho Bạc.');
  });

  it('[TC-262.06/MSS][UC-IMP262/MSS] formatTransitWheelBroadcast: dinh dang tieng Viet chinh xac cho FLIGHT_DELAY giu nguyen vi tri', () => {
    const message = formatTransitWheelBroadcast({
      outcome: TransitWheelOutcome.FLIGHT_DELAY,
      playerName: 'Đại Gia Sài Gòn',
      stationName: 'Ga Hải Phòng',
    });
    expect(message).toBe('⏳ Chuyến bay của Đại Gia Sài Gòn bị hoãn (Delay)! Quân cờ giữ nguyên tại Ga Hải Phòng.');
  });

  // =========================================================================
  // FACET 2: State Reactivity & Cycle Teardown (Activity Logging & Deduplication)
  // =========================================================================

  it('[TC-262.07/MSS][UC-IMP262/MSS] detectTransitActivities: tao ActivityLogEntry chuan type transit, icon 🚊 va nap vao activity store', () => {
    const prevState = createMockGameState();
    const nextState = createMockGameState();
    const delta: DeltaPayload = {
      tick: 15,
      cells: [],
      lastTransitResult: {
        playerId: 'p1',
        cellIndex: 5,
        outcome: TransitWheelOutcome.SPEED_BOOST,
        targetCell: 9,
        boostSteps: 4,
      },
    };

    const logs: ActivityLogEntry[] = detectTransitActivities(delta, prevState, nextState, useActivityStore);
    expect(logs).toHaveLength(1);
    expect(logs[0]?.type).toBe('transit');
    expect(logs[0]?.cellIndex).toBe(9);
    expect(logs[0]?.message).toBe('⚡ Đại Gia Sài Gòn quay trúng Tốc Hành! Bay thêm 4 ô tới Bà Rịa - Vũng Tàu.');
  });

  it('[TC-262.08/A2][UC-IMP262/A2] detectTransitActivities: co che Idempotent Deduplication ngan chan nhan ban nhat ky cung ket qua quay', () => {
    resetTransitActivityTracker();
    const prevState = createMockGameState();
    const nextState = createMockGameState();
    const delta: DeltaPayload = {
      tick: 20,
      roundNumber: 2,
      cells: [],
      lastTransitResult: {
        playerId: 'p1',
        cellIndex: 15,
        outcome: TransitWheelOutcome.FLIGHT_DELAY,
        targetCell: 15,
      },
    };

    const firstLogs: ActivityLogEntry[] = detectTransitActivities(delta, prevState, nextState, useActivityStore);
    expect(firstLogs).toHaveLength(1);

    const secondLogs: ActivityLogEntry[] = detectTransitActivities(delta, prevState, nextState, useActivityStore);
    expect(secondLogs).toHaveLength(0);

    resetTransitActivityTracker();
    const thirdLogs: ActivityLogEntry[] = detectTransitActivities(delta, prevState, nextState, useActivityStore);
    expect(thirdLogs).toHaveLength(1);
  });

  // =========================================================================
  // FACET 3: Resource Disposal & Timer Isolation (Badges & Bot Pacing Delays)
  // =========================================================================

  it('[TC-262.09/MSS][UC-IMP262/MSS] handleTransitBadge: [ADV-03] phat hanh actionType transit voi tieu de VONG XOAY VAN TAI', () => {
    const mockAddFloatingText = vi.fn();
    const mockState = {
      ...createMockGameState(),
      addFloatingText: mockAddFloatingText,
    };
    const act: ActivityLogEntry = {
      id: 'transit_test_1',
      timestamp: Date.now(),
      type: 'transit',
      message: '⚡ Đại Gia Sài Gòn quay trúng Tốc Hành! Bay thêm 3 ô.',
      playerId: 'p1',
      cellIndex: 8,
    };

    handleTransitBadge(act, mockState);

    expect(mockAddFloatingText).toHaveBeenCalledTimes(1);
    const calledPayload = mockAddFloatingText.mock.calls[0]?.[0];
    expect(calledPayload?.actionType).toBe('transit');
    expect(calledPayload?.title).toBe('VÒNG XOAY VẬN TẢI');
    expect(calledPayload?.durationMs).toBe(4000);
  });

  it('[TC-262.10/A3][UC-IMP262/A3] dispatchActivityFloatingBadges: su kien transit co amount <= 0 khong bi bo loc so du loai bo', () => {
    const mockAddFloatingText = vi.fn();
    const mockState = {
      ...createMockGameState(),
      addFloatingText: mockAddFloatingText,
    };
    const actZeroAmount: ActivityLogEntry = {
      id: 'transit_zero_amt',
      timestamp: Date.now(),
      type: 'transit',
      message: '⏳ Chuyến bay của Đại Gia Sài Gòn bị hoãn (Delay)! Quân cờ giữ nguyên tại Ga Hải Phòng.',
      playerId: 'p1',
      amount: 0,
      cellIndex: 25,
    };

    dispatchActivityFloatingBadges([actZeroAmount], mockState);

    expect(mockAddFloatingText).toHaveBeenCalledTimes(1);
    const badge = mockAddFloatingText.mock.calls[0]?.[0];
    expect(badge?.actionType).toBe('transit');
    expect(badge?.type).toBe(FloatingTextType.Penalty);
  });

  it('[TC-262.11/MSS][UC-IMP262/MSS] calculateBotStepDelay: [ADV-04] keo dai delay trong PropertyManagement nhung khong keo dai sang AuctionPhase', () => {
    const { room } = setupContractRoom('bot1', 5, 2000);
    room.phase = TurnPhase.PropertyManagement;
    room.lastTransitResult = {
      playerId: 'bot1',
      cellIndex: 5,
      outcome: TransitWheelOutcome.SPEED_BOOST,
      targetCell: 9,
      boostSteps: 4,
    };

    // Trong PropertyManagement: 1200 + 4 * 350 + 2000 = 4600ms
    const delayPM = calculateBotStepDelay(room, 1500);
    expect(delayPM).toBe(4600);

    // Trong AuctionPhase: Không kéo dãn delay của Vòng Xoay, giữ nguyên baseDelayMs (1500ms)
    room.phase = TurnPhase.AuctionPhase;
    const delayAuction = calculateBotStepDelay(room, 1500);
    expect(delayAuction).toBe(1500);
  });

  // =========================================================================
  // FACET 4: Error Defense & Terminal Invariants (Defenses, Payout & Spectator)
  // =========================================================================

  it('[TC-262.03/A1][UC-IMP262/A1] handleSpinTransitWheel: [ADV-01] SAFE_HAVEN khi 0 BDS o lai tram an toan, khong bi tru tien thue dup', () => {
    const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 1000);
    // Ga Sài Gòn (cell 5) thuộc về p2
    registry.set(5, 'p2');
    player.ownedProperties = [];

    // Spin SAFE_HAVEN (roll 0.45)
    const result = handleSpinTransitWheel(room, 'p1', registry, stateMap, () => 0.45);

    expect(result.success).toBe(true);
    expect(player.position).toBe(5);
    // [ADV-01] Không gọi lại resolveSecondHopLanding trên trạm -> số dư giữ nguyên 1000, không bị trừ tiền thuê đúp
    expect(player.balance).toBe(1000);
  });

  it('[TC-262.05/MSS][UC-IMP262/MSS] handleSpinTransitWheel: [ADV-02] PASS_GO_FLIGHT bay ve GO luu dung payout vao lastTransitResult va broadcast', () => {
    const { room, registry, stateMap } = setupContractRoom('p1', 15, 1000);
    room.roundCount = 1;
    room.passedGoSalary = undefined;

    // Spin PASS_GO_FLIGHT (roll 0.80)
    const result = handleSpinTransitWheel(room, 'p1', registry, stateMap, () => 0.80);
    const expectedSalary = calculateGoSalary(1);

    expect(result.success).toBe(true);
    expect(room.lastTransitResult?.payout).toBe(expectedSalary);
    const message = formatTransitWheelBroadcast({
      outcome: TransitWheelOutcome.PASS_GO_FLIGHT,
      playerName: 'Đại Gia Sài Gòn',
      stationName: 'Ga Nha Trang',
      payout: room.lastTransitResult?.payout,
    });
    expect(message).toBe(`✈️ Đại Gia Sài Gòn quay trúng Bay Xuyên Việt! Bay thẳng về ô Khởi Hành (GO) nhận thưởng (+${expectedSalary} Tr.).`);
  });

  it('[TC-262.15/MSS][UC-IMP262/MSS] handleSpinTransitWheel: bao toan cellIndex la tram xuat phat va targetCell la dich den kem boostSteps', () => {
    const { room, registry, stateMap } = setupContractRoom('p1', 5, 2000);

    let callCount = 0;
    const scriptedRng = () => {
      callCount++;
      if (callCount === 1) return 0.1; // outcome: SPEED_BOOST
      return 0.4; // boost 1D6: Math.floor(0.4 * 6) + 1 = 3 -> (5 + 3) = 8
    };

    const spinResult = handleSpinTransitWheel(room, 'p1', registry, stateMap, scriptedRng);

    expect(spinResult.success).toBe(true);
    // cellIndex phải là trạm xuất phát (5), targetCell là đích đến (8), boostSteps là 3
    expect(room.lastTransitResult?.cellIndex).toBe(5);
    expect(room.lastTransitResult?.targetCell).toBe(8);
    expect(room.lastTransitResult?.boostSteps).toBe(3);
  });

  it('[TC-262.16/A4][UC-IMP262/A4] applyDeltaToStore: [ADV-05] nguoi xem chua co PID khong bi ep mo modal popup transit_wheel', () => {
    useLobbyStore.setState({ myPlayerId: '' }); // Spectator không có myPlayerId
    useGameStore.setState({ activeModal: null, isOfflineMode: false });

    const delta: DeltaPayload = {
      tick: 25,
      cells: [],
      pendingTransitWheel: {
        playerId: 'p1',
        cellIndex: 5,
        timestamp: Date.now(),
      },
    };

    applyDeltaToStore(delta, useGameStore);

    // Khán giả (myPlayerId = '', isOfflineMode = false) không bị ép mở modal transit_wheel
    expect(useGameStore.getState().activeModal).toBeNull();
  });

  // =========================================================================
  // FACET 5: Cross-Coupling Blast Radius & Exceptional Lifecycles (Second Hop)
  // =========================================================================

  it('[TC-262.12a/MSS][UC-IMP262/MSS] handleSpinTransitWheel: he qua buoc 2 bay den dat trong chuyen phong sang ActionPhase', () => {
    const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 5000);
    // Ô số 6 là đất trống (chưa có trong registry)
    registry.delete(6);

    let callCount = 0;
    const scriptedRng = () => {
      callCount++;
      if (callCount === 1) return 0.1; // outcome: SPEED_BOOST
      return 0.0; // boost 1D6: Math.floor(0.0 * 6) + 1 = 1 -> targetCell = 6
    };

    const spinResult = handleSpinTransitWheel(room, 'p1', registry, stateMap, scriptedRng);

    expect(spinResult.success).toBe(true);
    expect(player.position).toBe(6);
    expect(room.phase).toBe(TurnPhase.ActionPhase);
  });

  it('[TC-262.12b/MSS][UC-IMP262/MSS] handleSpinTransitWheel: nguoi choi o ActionPhase sau buoc 2 co the mua BDS thanh cong', () => {
    const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 5000);
    registry.delete(6);

    let callCount = 0;
    const scriptedRng = () => {
      callCount++;
      if (callCount === 1) return 0.1; // outcome: SPEED_BOOST
      return 0.0; // boost 1D6: Math.floor(0.0 * 6) + 1 = 1 -> targetCell = 6
    };

    handleSpinTransitWheel(room, 'p1', registry, stateMap, scriptedRng);

    const buyResult = buyProperty(player, 6, registry);
    expect(buyResult.result).toBe(BuyResult.Success);
    expect(registry.get(6)).toBe('p1');
  });

  it('[TC-262.13/MSS][UC-IMP262/MSS] handleSpinTransitWheel: he qua buoc 2 bay den dat doi thu tru tien thue', () => {
    const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 5000);
    const player2 = createPlayer('p2');
    player2.name = 'Tỷ Phú Hà Nội';
    player2.balance = 5000;
    player2.position = 0;
    player2.bankrupt = false;
    player2.ownedProperties = [6];
    player2.mortgagedProperties = [];
    room.players.push(player2);
    registry.set(6, 'p2');

    let callCount = 0;
    const scriptedRng = () => {
      callCount++;
      if (callCount === 1) return 0.1; // outcome: SPEED_BOOST
      return 0.0; // boost 1D6: 1 -> ô 6
    };

    const spinResult = handleSpinTransitWheel(room, 'p1', registry, stateMap, scriptedRng);

    expect(spinResult.success).toBe(true);
    expect(player.position).toBe(6);
    expect(player.balance).toBeLessThan(5000);
    expect(player2.balance).toBeGreaterThan(5000);
  });

  it('[TC-262.14/MSS][UC-IMP262/MSS] handleSpinTransitWheel: he qua buoc 2 bay qua GO cong luong vong', () => {
    const { room, player, registry, stateMap } = setupContractRoom('p1', 35, 1000);
    room.roundCount = 1;
    room.passedGoSalary = undefined;

    let callCount = 0;
    const scriptedRng = () => {
      callCount++;
      if (callCount === 1) return 0.1; // outcome: SPEED_BOOST
      return 0.99; // boost 1D6: Math.floor(0.99 * 6) + 1 = 6 -> (35 + 6) % 40 = 1
    };

    const spinResult = handleSpinTransitWheel(room, 'p1', registry, stateMap, scriptedRng);

    expect(spinResult.success).toBe(true);
    expect(player.position).toBe(1);
    expect(player.balance).toBe(3000);
    expect(room.passedGoSalary).toBe(2000);
  });

  it('[TC-262.17/A5][UC-IMP262/A5] handleSpinTransitWheel: SAFE_HAVEN di chuyen den BDS so huu khi ownedProperties co phan tu', () => {
    const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 1000);
    player.ownedProperties = [12];

    const result = handleSpinTransitWheel(room, 'p1', registry, stateMap, () => 0.45);

    expect(result.success).toBe(true);
    expect(player.position).toBe(12);
  });

  it('[TC-262.18/A6][UC-IMP262/A6] handleSpinTransitWheel: SAFE_HAVEN fallback sang registry khi ownedProperties rong', () => {
    const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 1000);
    player.ownedProperties = [];
    registry.set(12, 'p1');

    const result = handleSpinTransitWheel(room, 'p1', registry, stateMap, () => 0.45);

    expect(result.success).toBe(true);
    expect(player.position).toBe(12);
  });

  it('[TC-262.19/A7][UC-IMP262/A7] handleSpinTransitWheel: tu choi luot quay khi phong chua khoi dong', () => {
    const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 1000);
    room.started = false;

    const result = handleSpinTransitWheel(room, 'p1', registry, stateMap);

    expect(result.success).toBe(false);
    expect(result.reason).toBe(ActionRejectReason.INVALID_ROOM);
  });

  it('[TC-262.20a/A8][UC-IMP262/A8] handleSpinTransitWheel: CASH_BACK hoan cuoc cong so du nguoi choi', () => {
    const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 1000);
    room.treasury = 1000;

    const result = handleSpinTransitWheel(room, 'p1', registry, stateMap, () => 0.60);

    expect(result.success).toBe(true);
    expect(result.payout).toBe(300);
    expect(player.balance).toBe(1300);
  });

  it('[TC-262.20b/A8][UC-IMP262/A8] handleSpinTransitWheel: CASH_BACK hoan cuoc tru quy kho bac va dong bo broadcast', () => {
    const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 1000);
    room.treasury = 1000;

    handleSpinTransitWheel(room, 'p1', registry, stateMap, () => 0.60);

    expect(room.treasury).toBe(700);
    expect(room.lastTransitResult?.payout).toBe(300);
  });
});
