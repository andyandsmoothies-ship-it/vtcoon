// [CONTRACT TEST] IMP-248: Transit Wheel / Flight Navigator (Vòng Xoay Hành Trình 4 Trạm Hạ Tầng)
// Traceability Tags: [TC-TW01.01/MSS..TC-TW05.06/MSS] & [UC-IMP248]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Verification

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoom, TurnPhase, ActionRejectReason, calculateGoSalary, type Room, type Player } from '../../src/domain/room.js';
import type { PropertyRegistry } from '../../src/domain/property_manager.js';
import type { PropertyStateMap } from '../../src/domain/property_data.js';
import { executeTurnEnd } from '../../src/server/turn_loop.js';
import { handleAuctionClose, type AuctionSession } from '../../src/server/auction_manager.js';
import { EnvelopeValidator } from '../../src/server/security/envelope_validator.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { runBotTurn } from '../../src/server/room_bot_coordinator.js';
import { applyPlayerDeltas } from '../../src/client/network/apply_delta_players.js';
import type { GameState, PlayerHudInfo } from '../../src/client/store/game_store.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';

// Station 1 Domain Model Augmentation for IMP-248
declare module '../../src/domain/room.js' {
  interface Player {
    hasSpunTransitThisTurn?: boolean;
  }
  interface Room {
    pendingTransitWheel?: { playerId: string; cellIndex: number; timestamp: number } | null;
    lastTransitResult?: { playerId: string; cellIndex: number; outcome: string; targetCell?: number; payout?: number; boostSteps?: number } | null;
  }
}

// Station 1 Contract Interfaces for Pending Source Files
interface TransitWheelModule {
  evaluateTransitWheelOutcome?: (random01: number) => string;
  findSafeHaven?: (currentCell: number, ownedProperties?: readonly number[]) => number;
  TRANSIT_WHEEL_CONFIGS?: readonly { readonly outcome: string; readonly weight: number }[];
}

interface SpinTransitResult {
  readonly success: boolean;
  readonly reason?: string;
  readonly outcome?: string;
  readonly targetCell?: number;
  readonly payout?: number;
}

interface TransitHandlerModule {
  handleSpinTransitWheel?: (
    room: Room | undefined,
    playerId: string,
    registry?: PropertyRegistry,
    stateMap?: PropertyStateMap,
    rng?: () => number,
  ) => SpinTransitResult;
}

// Station 1 Dynamic Path Resolution: Prevents TS2307/TS2664 compile failures prior to Task 3 file creation
const TRANSIT_WHEEL_PATH: string = '../../src/domain/transit_wheel.js';
const TRANSIT_HANDLER_PATH: string = '../../src/server/transit_wheel_handler.js';

const transitWheelMod: TransitWheelModule = await import(TRANSIT_WHEEL_PATH).catch(() => ({}));
const transitHandlerMod: TransitHandlerModule = await import(TRANSIT_HANDLER_PATH).catch(() => ({}));

const { findSafeHaven, TRANSIT_WHEEL_CONFIGS } = transitWheelMod;
const { handleSpinTransitWheel } = transitHandlerMod;

function setupContractRoom(playerId = 'p1', startCell = 5, startBalance = 1000): {
  room: Room;
  player: Player;
  registry: PropertyRegistry;
  stateMap: PropertyStateMap;
} {
  const room = createRoom(playerId, 'ROOM_IMP248');
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

describe('[CONTRACT] IMP-248: Transit Wheel / Flight Navigator Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: Outcome Mechanics & Weights ([TC-TW01.01/MSS] .. [TC-TW01.06/MSS])
  // =========================================================================
  describe('Facet 1: Outcome Mechanics & Weights', () => {
    it('[TC-TW01.01/MSS][UC-IMP248] Bảng cấu hình vòng xoay gồm 5 kết quả (không còn NEXT_PORT) với tổng trọng số 100', () => {
      const configs = TRANSIT_WHEEL_CONFIGS ?? [];
      const outcomes = configs.map((c) => c.outcome);
      const totalWeight = configs.reduce((acc, c) => acc + c.weight, 0);

      expect(outcomes).not.toContain('NEXT_PORT');
      expect(outcomes).toHaveLength(5);
      expect(totalWeight).toBe(100);
    });

    it('[TC-TW01.02/MSS][UC-IMP248] SPEED_BOOST gieo xúc xắc 1D6 và cho phép quân cờ tiến 1..6 ô từ trạm hiện tại', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 1000);
      let rngStep = 0;
      const customRng = () => {
        rngStep++;
        return rngStep === 1 ? 0.15 : 0.50; // SPEED_BOOST & 4 on 1D6
      };

      const result = handleSpinTransitWheel!(room, player.id, registry, stateMap, customRng);

      expect(result.outcome).toBe('SPEED_BOOST');
      expect(room.players[0]!.position).toBe(9);
    });

    it('[TC-TW01.03/MSS][UC-IMP248] SAFE_HAVEN đưa quân cờ về BĐS gần nhất sở hữu, hoặc an toàn tại chỗ nếu chưa sở hữu BĐS nào', () => {
      const targetWithProperties = findSafeHaven!(5, [12, 28]);
      const targetWithoutProperties = findSafeHaven!(5, []);

      expect(targetWithProperties).toBe(12);
      expect(targetWithoutProperties).toBe(5);
    });

    it('[TC-TW01.04/MSS][UC-IMP248] CASH_BACK hoàn tiền dịch vụ cảng từ Kho Bạc lên tới 300 Tr. và giữ nguyên vị trí quân cờ', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 1000);
      room.treasury = 500;
      const rngCashBack = () => 0.60;

      const result = handleSpinTransitWheel!(room, player.id, registry, stateMap, rngCashBack);

      expect(result.payout).toBe(300);
      expect(room.players[0]!.position).toBe(5);
    });

    it('[TC-TW01.05/MSS][UC-IMP248] PASS_GO_FLIGHT đưa quân cờ bay thẳng về ô Khởi Hành 0 (GO) và cấp lương vòng đấu', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 25, 1000);
      room.roundCount = 1;
      room.passedGoSalary = undefined;
      const rngPassGo = () => 0.75;

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngPassGo);

      expect(room.players[0]!.position).toBe(0);
      expect(room.passedGoSalary).toBe(calculateGoSalary(1));
    });

    it('[TC-TW01.06/MSS][UC-IMP248] FLIGHT_DELAY hoãn chuyến bay do thời tiết xấu, quân cờ giữ nguyên vị trí và không thưởng phạt', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 15, 1000);
      const rngDelay = () => 0.95;

      const result = handleSpinTransitWheel!(room, player.id, registry, stateMap, rngDelay);

      expect(result.outcome).toBe('FLIGHT_DELAY');
      expect(room.players[0]!.position).toBe(15);
      expect(room.players[0]!.balance).toBe(1000);
    });
  });

  // =========================================================================
  // FACET 2: Anti-Inflation & Single GO Salary Cap ([TC-TW02.01/MSS] .. [TC-TW02.03/MSS])
  // =========================================================================
  describe('Facet 2: Anti-Inflation & Single GO Salary Cap', () => {
    it('[TC-TW02.01/MSS][UC-IMP248] Chuyến bay vượt GO lần đầu trong lượt nhận đủ lương GO theo vòng đấu khi room.passedGoSalary là undefined', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 35, 1000);
      room.roundCount = 1;
      room.passedGoSalary = undefined;
      const rngPassGoFlight = () => 0.75;

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngPassGoFlight);

      expect(room.players[0]!.balance).toBe(3000);
      expect(room.passedGoSalary).toBe(2000);
    });

    it('[TC-TW02.02/MSS][UC-IMP248] Chuyến bay vượt GO lần hai trong lượt chỉ nhận trợ cấp cố định 500 Tr. VNĐ từ Kho Bạc thay vì x2 lương', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 35, 1000);
      room.roundCount = 1;
      room.passedGoSalary = 2000;
      room.treasury = 2000;
      const rngPassGoFlight = () => 0.75;

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngPassGoFlight);

      expect(room.players[0]!.balance).toBe(1500);
      expect(room.passedGoSalary).toBe(2000);
    });

    it('[TC-TW02.03/MSS][UC-IMP248] Trợ cấp vượt GO lần hai bị khống chế theo quỹ Kho Bạc khả dụng Math.min(500, room.treasury)', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 35, 1000);
      room.passedGoSalary = 2000;
      room.treasury = 200;
      const rngPassGoFlight = () => 0.75;

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngPassGoFlight);

      expect(room.players[0]!.balance).toBe(1200);
      expect(room.treasury).toBe(0);
    });
  });

  // =========================================================================
  // FACET 3: Invariant Protection & Recursion Defense ([TC-TW03.01/MSS] .. [TC-TW03.02/MSS])
  // =========================================================================
  describe('Facet 3: Invariant Protection & Recursion Defense', () => {
    it('[TC-TW03.01/MSS][UC-IMP248] Khóa hasSpunTransitThisTurn ngăn chặn mở vòng xoay lần hai khi bay sang ga hạ tầng kế tiếp', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 1000);
      const rngNextPort = () => 0.10;

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngNextPort);

      expect(room.players[0]!.hasSpunTransitThisTurn).toBe(true);
      expect(room.pendingTransitWheel).toBeNull();
    });

    it('[TC-TW03.02/MSS][UC-IMP248] executeTurnEnd tự động reset cờ hasSpunTransitThisTurn về false khi bắt đầu lượt mới', () => {
      const { room, player } = setupContractRoom('p1', 5, 1000);
      player.hasSpunTransitThisTurn = true;
      const rolledMap = new Map<string, boolean>();

      executeTurnEnd(room, player, true, false, room.roomCode, rolledMap);

      expect(player.hasSpunTransitThisTurn).toBe(false);
    });
  });

  // =========================================================================
  // FACET 4: Treasury Conservation & Deficit Guards ([TC-TW04.01/MSS] .. [TC-TW04.03/MSS])
  // =========================================================================
  describe('Facet 4: Treasury Conservation & Deficit Guards', () => {
    it('[TC-TW04.01/MSS][UC-IMP248] CASH_BACK khi Kho Bạc >= 300 Tr. cộng đúng 300 Tr. cho người chơi và trừ 300 Tr. Kho Bạc (delta = 0)', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 2000);
      room.treasury = 1000;
      const rngCashBack = () => 0.60;

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngCashBack);

      expect(room.players[0]!.balance).toBe(2300);
      expect(room.treasury).toBe(700);
    });

    it('[TC-TW04.02/MSS][UC-IMP248] CASH_BACK khi Kho Bạc = 100 Tr. chỉ cộng 100 Tr. cho người chơi và đưa Kho Bạc về 0', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 2000);
      room.treasury = 100;
      const rngCashBack = () => 0.60;

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngCashBack);

      expect(room.players[0]!.balance).toBe(2100);
      expect(room.treasury).toBe(0);
    });

    it('[TC-TW04.03/MSS][UC-IMP248] CASH_BACK khi Kho Bạc = 0 Tr. cộng 0 Tr. cho người chơi và bảo toàn Kho Bạc không bị âm tiền', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 2000);
      room.treasury = 0;
      const rngCashBack = () => 0.60;

      handleSpinTransitWheel!(room, player.id, registry, stateMap, rngCashBack);

      expect(room.players[0]!.balance).toBe(2000);
      expect(room.treasury).toBe(0);
    });
  });

  // =========================================================================
  // FACET 5: Boundary & Subsystem Integration ([TC-TW05.01/MSS] .. [TC-TW05.06/MSS])
  // =========================================================================
  describe('Facet 5: Boundary & Subsystem Integration', () => {
    it('[TC-TW05.01/MSS][UC-IMP248] Teardown N+1 xóa sạch pendingTransitWheel và lastTransitResult trong executeTurnEnd', () => {
      const { room, player } = setupContractRoom('p1', 5, 1000);
      room.pendingTransitWheel = { playerId: player.id, cellIndex: 5, timestamp: Date.now() };
      room.lastTransitResult = { playerId: player.id, cellIndex: 15, outcome: 'SPEED_BOOST' };
      const rolledMap = new Map<string, boolean>();

      executeTurnEnd(room, player, true, false, room.roomCode, rolledMap);

      expect(room.pendingTransitWheel).toBeNull();
      expect(room.lastTransitResult).toBeNull();
    });

    it('[TC-TW05.02/MSS][UC-IMP248] handleAuctionClose hóa giải hố đen đấu giá bằng cách mở pendingTransitWheel cho người từ chối mua ga', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 5, 1000);
      room.phase = TurnPhase.AuctionPhase;
      const targetRoom: Room = room;
      targetRoom.pendingTransitWheel = null;

      const session: AuctionSession = {
        cellIndex: 5,
        declinedPlayerId: player.id,
        highestBid: 200,
        startingBid: 200,
        currentBid: 200,
        endTime: Date.now() + 10000,
        passedPlayers: new Set<string>(),
      };
      const auctions = new Map<string, AuctionSession>([[room.roomCode, session]]);

      handleAuctionClose(targetRoom, session, registry, auctions, room.roomCode, stateMap);

      interface PendingTransitWheelRef {
        readonly playerId?: string;
        readonly cellIndex?: number;
        readonly timestamp?: number;
      }
      const pendingWheel = targetRoom.pendingTransitWheel as PendingTransitWheelRef | null | undefined;

      expect(pendingWheel?.playerId).toBe(player.id);
      expect(pendingWheel?.cellIndex).toBe(5);
    });

    it('[TC-TW05.03/MSS][UC-IMP248] EnvelopeValidator chấp thuận gói tin mang intent INTENT_SPIN_TRANSIT_WHEEL', () => {
      const validator = new EnvelopeValidator();
      const message = {
        type: 'INTENT',
        payload: {
          type: 'INTENT_SPIN_TRANSIT_WHEEL',
        },
      };

      const result = validator.validateEnvelope(message);

      expect(result.success).toBe(true);
    });

    it('[TC-TW05.04/MSS][UC-IMP248] Rào chắn con nợ thâm hụt số dư âm (current.balance < 0) từ chối xoay vòng với INSUFFICIENT_FUNDS', () => {
      const { room, player, registry, stateMap } = setupContractRoom('p1', 5, -300);

      const result = handleSpinTransitWheel!(room, player.id, registry, stateMap);

      expect(result.success).toBe(false);
      expect(result.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
    });

    it('[TC-TW05.05/MSS][UC-IMP248] Bot tự động kích hoạt intent xoay vòng trong runBotTurn mà không bị treo lượt', () => {
      const mgr = new RoomManager();
      const room = mgr.createRoom('host1', 'ROOM_BOT_TW');
      mgr.joinRoom(room.roomCode, 'bot1');
      mgr.startGame(room.roomCode);

      const bot = room.players.find((p) => p.id === 'bot1')!;
      bot.isBot = true;
      room.currentPlayerIndex = room.players.indexOf(bot);
      room.phase = TurnPhase.PropertyManagement;
      room.pendingTransitWheel = {
        playerId: bot.id,
        cellIndex: 5,
        timestamp: Date.now(),
      };

      const intentSpy = vi.spyOn(mgr, 'handlePlayerIntent');
      runBotTurn(mgr, room.roomCode);

      expect(intentSpy).toHaveBeenCalledWith(
        room.roomCode,
        bot.id,
        expect.objectContaining({ type: 'INTENT_SPIN_TRANSIT_WHEEL' }),
      );
    });

    it('[TC-TW05.06/MSS][UC-IMP248] Tạm giữ quân cờ trong pendingPawnMove khi activeModal là transit_wheel dù isRolling là false', () => {
      const mockSetPending = vi.fn();
      const mockEnqueue = vi.fn();

      const fakeState: GameState = {
        activeModal: 'transit_wheel',
        isRolling: false,
        playerPositions: { p1: 5 },
        playersInfo: {
          p1: { id: 'p1', name: 'Player 1', balance: 1000, tokenColor: '#2563EB', ownedProperties: [], mortgagedProperties: [], isBot: false },
        },
        setPendingPawnMove: mockSetPending,
        enqueuePawnMove: mockEnqueue,
      } as unknown as GameState; // Exception: Partial mock of GameState for isolated applyPlayerDeltas contract test

      const delta: DeltaPayload = {
        tick: 1,
        cells: [],
        players: [{ id: 'p1', position: 15, balance: 1000 }],
      };

      const hudMap: Record<string, PlayerHudInfo> = {
        p1: { id: 'p1', name: 'Player 1', balance: 1000, tokenColor: '#2563EB', ownedProperties: [], mortgagedProperties: [], isBot: false },
      };

      applyPlayerDeltas(delta, fakeState, hudMap, false);

      expect(mockSetPending).toHaveBeenCalledWith(
        expect.objectContaining({
          playerId: 'p1',
          targetCell: 15,
          fromCell: 5,
        }),
      );
    });
  });
});
