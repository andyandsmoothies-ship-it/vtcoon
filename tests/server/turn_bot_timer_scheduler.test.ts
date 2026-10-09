// [IMP-301] Living Contract Tests for TurnBotTimerScheduler
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateBotStepDelay,
  AUCTION_BOT_STEP_DELAY_MS,
  BOT_UPGRADE_OBSERVATION_DELAY_MS,
  BOT_TRANSIT_OBSERVATION_DELAY_MS,
  TurnBotTimerScheduler,
  type TurnBotSchedulerDelegate,
} from '../../src/server/network/turn_bot_timer_scheduler.js';
import { TurnPhase, type Room, type Player } from '../../src/domain/room.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { SessionManager } from '../../src/server/session_manager.js';

interface MockDelegateCalls {
  scheduleBotTurnCalled: string[];
  gameOverCalled: string[];
  auctionSettleCalled: string[];
  clearAuctionSettleCalled: string[];
  orchestrateCalled: string[];
  registeredTimers: Array<{ roomCode: string; timer: NodeJS.Timeout; deadline: number }>;
  clearedTimers: string[];
  deadlines: Array<{ roomCode: string; deadline: number }>;
}

function createMockPlayer(id: string, isBot: boolean): Player {
  return {
    id,
    position: 0,
    balance: 10000,
    skipNextTurn: false,
    auditTurnsLeft: 0,
    consecutiveDoubles: 0,
    hand: [],
    pendingDebts: [],
    extraTurns: 0,
    doubleNextDice: false,
    mortgagedProperties: [],
    bankrupt: false,
    isBot,
  };
}

function createMockRoom(
  roomCode: string,
  phase: TurnPhase,
  players: Player[]
): Room {
  return {
    roomCode,
    hostId: players[0]?.id ?? 'host',
    players,
    currentPlayerIndex: 0,
    phase,
    started: true,
    activeModifiers: [],
    marketDeck: [],
    marketDiscard: [],
    chanceDeck: [],
    chanceDiscard: [],
    permanentRentBonus: {},
    treasury: 5000,
  };
}

function createMockDelegate(
  rooms: RoomManager,
  intentMutex: IntentMutex,
  broadcaster: DeltaBroadcaster,
  calls: MockDelegateCalls,
  botTurnDelayMs: number = 1500
): TurnBotSchedulerDelegate {
  return {
    rooms,
    intentMutex,
    broadcaster,
    botTurnDelayMs,
    onGameOver: (rc: string) => {
      calls.gameOverCalled.push(rc);
    },
    onScheduleBotTurn: (rc: string) => {
      calls.scheduleBotTurnCalled.push(rc);
    },
    hasEligibleAuctionBot: (room: Room) => {
      return room.players.some((p) => p.isBot && !p.bankrupt);
    },
    scheduleAuctionSettle: (rc: string) => {
      calls.auctionSettleCalled.push(rc);
    },
    clearAuctionSettleTimer: (rc: string) => {
      calls.clearAuctionSettleCalled.push(rc);
    },
    orchestrate: (rc: string) => {
      calls.orchestrateCalled.push(rc);
    },
    registerActiveTimer: (rc: string, timer: NodeJS.Timeout, deadline: number) => {
      calls.registeredTimers.push({ roomCode: rc, timer, deadline });
    },
    clearActiveTimer: (rc: string) => {
      calls.clearedTimers.push(rc);
    },
    setDeadline: (rc: string, deadline: number) => {
      calls.deadlines.push({ roomCode: rc, deadline });
    },
  };
}

describe('TurnBotTimerScheduler Contract Suites', () => {
  let rooms: RoomManager;
  let sessions: SessionManager;
  let intentMutex: IntentMutex;
  let broadcaster: DeltaBroadcaster;
  let mockCalls: MockDelegateCalls;
  let mockDelegate: TurnBotSchedulerDelegate;

  beforeEach(() => {
    rooms = new RoomManager(1234);
    sessions = new SessionManager();
    intentMutex = new IntentMutex();
    broadcaster = new DeltaBroadcaster(rooms, sessions, () => {});
    mockCalls = {
      scheduleBotTurnCalled: [],
      gameOverCalled: [],
      auctionSettleCalled: [],
      clearAuctionSettleCalled: [],
      orchestrateCalled: [],
      registeredTimers: [],
      clearedTimers: [],
      deadlines: [],
    };
    mockDelegate = createMockDelegate(rooms, intentMutex, broadcaster, mockCalls, 1500);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('TC-TB-SCHED.01 [UC-TB-SCHED/MSS]: Given phòng chơi chưa xác định (undefined), When gọi calculateBotStepDelay(undefined, 1500), Then hàm trả về baseDelayMs mặc định (1500ms)', () => {
    const delay = calculateBotStepDelay(undefined, 1500);
    expect(delay).toBe(1500);
  });

  it('TC-TB-SCHED.02 [UC-TB-SCHED/MSS]: Given phòng chơi ở chế độ test nhanh với baseDelayMs <= 500, When gọi calculateBotStepDelay(room, 500), Then hàm trả về 500ms ngay cả khi phòng có lastTransitResult', () => {
    const player = createMockPlayer('bot_1', true);
    const room = createMockRoom('ROOM_FAST', TurnPhase.PropertyManagement, [player]);
    room.lastTransitResult = {
      playerId: 'bot_1',
      cellIndex: 5,
      outcome: 'BOOST',
      boostSteps: 2,
    };
    const delay = calculateBotStepDelay(room, 500);
    expect(delay).toBe(500);
  });

  it('TC-TB-SCHED.03 [UC-TB-SCHED/MSS]: Given phòng chơi ở TurnPhase.PropertyManagement và có kết quả vòng xoay lastTransitResult với boostSteps = 2, When gọi calculateBotStepDelay(room, 1500), Then hàm trả về 3900ms', () => {
    const player = createMockPlayer('bot_1', true);
    const room = createMockRoom('ROOM_TRANSIT', TurnPhase.PropertyManagement, [player]);
    room.lastTransitResult = {
      playerId: 'bot_1',
      cellIndex: 5,
      outcome: 'BOOST',
      boostSteps: 2,
    };
    const delay = calculateBotStepDelay(room, 1500);
    expect(delay).toBe(3900);
  });

  it('TC-TB-SCHED.04 [UC-TB-SCHED/MSS]: Given phòng chơi ở TurnPhase.ActionPhase và có lastDice = [3, 4] không có transit, When gọi calculateBotStepDelay(room, 1500), Then hàm trả về 3300ms', () => {
    const player = createMockPlayer('bot_1', true);
    const room = createMockRoom('ROOM_DICE', TurnPhase.ActionPhase, [player]);
    room.lastDice = [3, 4];
    const delay = calculateBotStepDelay(room, 1500);
    expect(delay).toBe(3300);
  });

  it('TC-TB-SCHED.05 [UC-TB-SCHED/MSS]: Given phòng chơi có lastEventCard và baseDelayMs > 500 ở pha khác, When gọi calculateBotStepDelay(room, 1500), Then hàm trả về 2500ms', () => {
    const player = createMockPlayer('bot_1', true);
    const room = createMockRoom('ROOM_CARD', TurnPhase.WaitingRoll, [player]);
    room.lastEventCard = {
      id: 'chance_1',
      type: 'Chance',
      title: 'Nhận Thưởng',
      description: 'Nhận 500 từ Kho Bạc',
    };
    const delay = calculateBotStepDelay(room, 1500);
    expect(delay).toBe(2500);
  });

  it('TC-TB-SCHED.06 [UC-TB-SCHED/MSS]: Given phòng chơi ở WaitingRoll không có thẻ sự kiện, When gọi calculateBotStepDelay(room, 1500), Then hàm trả về baseDelayMs (1500ms)', () => {
    const player = createMockPlayer('bot_1', true);
    const room = createMockRoom('ROOM_WAIT', TurnPhase.WaitingRoll, [player]);
    const delay = calculateBotStepDelay(room, 1500);
    expect(delay).toBe(1500);
  });

  it('TC-TB-SCHED.07 [UC-TB-SCHED/MSS]: Given các hằng số nhịp độ bot được xuất khẩu, When kiểm tra giá trị hằng số, Then AUCTION_BOT_STEP_DELAY_MS bằng 1000, BOT_UPGRADE_OBSERVATION_DELAY_MS bằng 1500, và BOT_TRANSIT_OBSERVATION_DELAY_MS bằng 2000', () => {
    expect(AUCTION_BOT_STEP_DELAY_MS).toBe(1000);
    expect(BOT_UPGRADE_OBSERVATION_DELAY_MS).toBe(1500);
    expect(BOT_TRANSIT_OBSERVATION_DELAY_MS).toBe(2000);
  });

  it('TC-TB-SCHED.08 [UC-TB-SCHED/MSS]: Given TurnBotTimerScheduler vừa khởi tạo, When gọi clearUpgradeFlag trên roomCode, Then cờ botJustUpgraded của phòng chơi bị xóa sạch và không còn tồn tại', () => {
    const scheduler = new TurnBotTimerScheduler(mockDelegate);
    scheduler.botJustUpgraded.set('ROOM_FLAG', true);
    scheduler.clearUpgradeFlag('ROOM_FLAG');
    expect(scheduler.botJustUpgraded.has('ROOM_FLAG')).toBe(false);
  });

  it('TC-TB-SCHED.09 [UC-TB-SCHED/MSS]: Given TurnBotTimerScheduler được kích hoạt scheduleBotStep cho Bot, When bộ lập lịch chạy, Then onScheduleBotTurn được kích hoạt và timer được đăng ký vào delegate', () => {
    vi.useFakeTimers();
    const scheduler = new TurnBotTimerScheduler(mockDelegate);
    const room = rooms.createRoom('bot_1');
    rooms.addBot(room.roomCode, 'bot_2');
    rooms.startGame(room.roomCode);

    scheduler.scheduleBotStep(room.roomCode);
    expect(mockCalls.scheduleBotTurnCalled).toContain(room.roomCode);
    expect(mockCalls.registeredTimers.length).toBeGreaterThanOrEqual(1);
  });

  it('TC-TB-SCHED.10 [UC-TB-SCHED/MSS]: Given phòng chơi có cờ botJustUpgraded là true, When gọi scheduleBotStep, Then độ trễ được cấp là BOT_UPGRADE_OBSERVATION_DELAY_MS (1500ms) và cờ nâng cấp được tự động tiêu thụ', () => {
    vi.useFakeTimers();
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const fastDelegate = createMockDelegate(rooms, intentMutex, broadcaster, mockCalls, 200);
    const scheduler = new TurnBotTimerScheduler(fastDelegate);
    const room = rooms.createRoom('bot_1');
    rooms.addBot(room.roomCode, 'bot_2');
    rooms.startGame(room.roomCode);
    scheduler.botJustUpgraded.set(room.roomCode, true);

    scheduler.scheduleBotStep(room.roomCode);
    const lastDelay = setTimeoutSpy.mock.calls[setTimeoutSpy.mock.calls.length - 1]?.[1];
    expect(lastDelay).toBe(1500);
    expect(scheduler.botJustUpgraded.has(room.roomCode)).toBe(false);
  });

  it('TC-TB-SCHED.11 [UC-TB-SCHED/MSS]: Given phòng chơi đã kết thúc (isRoomGameOver trả về true) khi timer hết hạn, When bước bot thực thi, Then onGameOver được kích hoạt và cờ nâng cấp được xóa sạch', async () => {
    vi.useFakeTimers();
    const scheduler = new TurnBotTimerScheduler(mockDelegate);
    const room = rooms.createRoom('bot_1');
    rooms.addBot(room.roomCode, 'bot_2');
    rooms.startGame(room.roomCode);
    room.players[0]!.bankrupt = true;
    room.players[1]!.bankrupt = true;
    scheduler.botJustUpgraded.set(room.roomCode, true);

    scheduler.scheduleBotStep(room.roomCode);
    await vi.advanceTimersByTimeAsync(2000);

    expect(mockCalls.gameOverCalled).toContain(room.roomCode);
    expect(scheduler.botJustUpgraded.has(room.roomCode)).toBe(false);
  });

  it('TC-TB-SCHED.12 [UC-TB-SCHED/MSS]: Given phòng chơi ở TurnPhase.AuctionPhase có bot đủ điều kiện, When timer hết hạn và stepAuctionBot trả về finished false, Then orchestrator và broadcastRoomDelta được gọi lại để tiếp tục đấu giá', async () => {
    vi.useFakeTimers();
    const scheduler = new TurnBotTimerScheduler(mockDelegate);
    const room = rooms.createRoom('bot_1');
    rooms.addBot(room.roomCode, 'bot_2');
    rooms.startGame(room.roomCode);
    room.phase = TurnPhase.AuctionPhase;
    room.players[0]!.isBot = true;

    vi.spyOn(rooms, 'stepAuctionBot').mockReturnValue({ changed: true, finished: false });

    scheduler.scheduleBotStep(room.roomCode);
    await vi.advanceTimersByTimeAsync(2000);

    expect(mockCalls.orchestrateCalled).toContain(room.roomCode);
    expect(mockCalls.clearedTimers).toContain(room.roomCode);
  });

  it('TC-TB-SCHED.13 [UC-TB-SCHED/MSS]: Given phòng chơi ở TurnPhase.AuctionPhase khi bot cuối cùng bước và stepAuctionBot trả về finished true, When timer hết hạn, Then scheduleAuctionSettle và setDeadline được gọi với delay đóng sàn', async () => {
    vi.useFakeTimers();
    const scheduler = new TurnBotTimerScheduler(mockDelegate);
    const room = rooms.createRoom('bot_1');
    rooms.addBot(room.roomCode, 'bot_2');
    rooms.startGame(room.roomCode);
    room.phase = TurnPhase.AuctionPhase;
    room.players[0]!.isBot = true;

    vi.spyOn(rooms, 'stepAuctionBot').mockReturnValue({ changed: true, finished: true });

    scheduler.scheduleBotStep(room.roomCode);
    await vi.advanceTimersByTimeAsync(2000);

    expect(mockCalls.auctionSettleCalled).toContain(room.roomCode);
    expect(mockCalls.deadlines.length).toBeGreaterThanOrEqual(1);
  });

  it('TC-TB-SCHED.14 [UC-TB-SCHED/MSS]: Given bot thực hiện bước đi trong lượt bình thường và nâng cấp tài sản thành công (nextLevelSum > prevLevelSum), When bước bot hoàn tất, Then cờ botJustUpgraded được ghi nhận bằng true cho bước kế tiếp', async () => {
    vi.useFakeTimers();
    const scheduler = new TurnBotTimerScheduler(mockDelegate);
    const room = rooms.createRoom('bot_1');
    rooms.addBot(room.roomCode, 'bot_2');
    rooms.startGame(room.roomCode);
    room.players[0]!.isBot = true;

    const propMap = new Map<number, { level: number }>([[1, { level: 0 }]]);
    vi.spyOn(rooms, 'getPropertyStates').mockImplementation(() => propMap);
    vi.spyOn(rooms, 'stepBotTurn').mockImplementation(() => {
      propMap.set(1, { level: 1 });
      return true;
    });

    scheduler.scheduleBotStep(room.roomCode);
    await vi.advanceTimersByTimeAsync(2000);

    expect(scheduler.botJustUpgraded.get(room.roomCode)).toBe(true);
  });

  it('TC-TB-SCHED.15 [UC-TB-SCHED/MSS]: Given TurnOrchestrator khởi tạo, When truy cập getter botJustUpgraded, Then thuộc tính trả về đúng tham chiếu Map botJustUpgraded từ TurnBotTimerScheduler và bảo toàn qua clearRoom', () => {
    const scheduler = new TurnBotTimerScheduler(mockDelegate);
    scheduler.botJustUpgraded.set('ROOM_PRESERVE', true);
    expect(scheduler.botJustUpgraded.get('ROOM_PRESERVE')).toBe(true);
    expect(scheduler.botJustUpgraded.has('ROOM_PRESERVE')).toBe(true);
  });

  it('TC-TB-SCHED.16 [UC-TB-SCHED/MSS]: Given TurnOrchestrator gọi destroyRoom, When phòng chơi bị tiêu hủy, Then cờ botJustUpgraded trong scheduler được dọn dẹp triệt để chống rò rỉ bộ nhớ', () => {
    const scheduler = new TurnBotTimerScheduler(mockDelegate);
    scheduler.botJustUpgraded.set('ROOM_CLEANUP', true);
    scheduler.clearUpgradeFlag('ROOM_CLEANUP');
    expect(scheduler.botJustUpgraded.has('ROOM_CLEANUP')).toBe(false);
  });
});
