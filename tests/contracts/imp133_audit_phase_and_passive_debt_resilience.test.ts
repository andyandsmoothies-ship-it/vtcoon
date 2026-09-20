// [TC-133.01/MSS..TC-133.24/A4][UC-IMP133]
// Contract Test Suite: IMP-133 Audit Phase Resolution & Passive Debt Insolvency Resilience
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Boundary & Audit Turn Depletion Invariants (Cell 10 audit depletion, 500 Tr penalty, insolvency on negative balance)
// Facet 2: Reactivity & Bailout/Roll Coexistence (INTENT_BAIL_OUT, roll dice, doubles release, non-doubles retention)
// Facet 3: Liquidity, Preemption & Turn Transition to Insolvent Player (passive debt handover, priority over audit/skip, extraTurns)
// Facet 4: Telemetry Watchdog Precision & Invariant Verification (verifyNonNegativeBalance with currentTurnPlayerId, handleDeltaTelemetry)

import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher';
import { TurnPhase } from '../../src/domain/room';
import { verifyNonNegativeBalance } from '../../src/client/telemetry/invariant_checker';
import { handleDeltaTelemetry } from '../../src/client/telemetry/telemetry_delta_hook';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store';
import { watchdogMonitor } from '../../src/client/telemetry/watchdog_monitor';
import type { GameState } from '../../src/client/store/game_store';
import type { DeltaPayload } from '../../src/server/session_manager';

function setupRoom(customRng?: () => number) {
  let seq = 0;
  // Default RNG returns die1 = 1, die2 = 5 (non-double, total 6)
  const defaultRng = () => (seq++ % 2 === 0 ? 0.1 : 0.8);
  const mgr = new RoomManager(customRng ?? defaultRng);
  const room = mgr.createRoom('p1');
  mgr.joinRoom(room.roomCode, 'p2');
  mgr.startGame(room.roomCode);
  return { mgr, room, roomCode: room.roomCode };
}

const createTestGameState = (overrides?: {
  readonly p1Balance?: number;
  readonly bot2Balance?: number;
  readonly currentTurn?: string;
  readonly phase?: TurnPhase;
}): GameState =>
  ({
    playersInfo: {
      p1: {
        id: 'p1',
        name: 'Player 1',
        balance: overrides?.p1Balance ?? 15_000,
        tokenColor: '#ff0000',
        ownedProperties: [],
      },
      bot_2: {
        id: 'bot_2',
        name: 'Bot 2',
        balance: overrides?.bot2Balance ?? 15_000,
        tokenColor: '#00ff00',
        ownedProperties: [],
      },
    },
    playerPositions: {
      p1: 10,
      bot_2: 0,
    },
    levelMap: {},
    treasuryPool: 2_000,
    activeModal: null,
    currentTurnPlayerId: overrides?.currentTurn ?? 'p1',
    turnPhase: overrides?.phase ?? TurnPhase.WaitingRoll,
    turnTimeRemaining: 30,
  } as unknown as GameState);

describe('IMP-133 Audit Phase Resolution & Passive Debt Resilience Contract Suite', () => {
  // =========================================================================
  // FACET 1: BOUNDARY & AUDIT TURN DEPLETION INVARIANTS
  // =========================================================================
  describe('Facet 1: Boundary & Audit Turn Depletion Invariants', () => {
    it('[TC-133.01/MSS][UC-IMP133] Người chơi ở Ô 10 (auditTurnsLeft: 3) bấm INTENT_END_TURN ở đầu lượt (chưa đổ xúc xắc) được server chấp thuận', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      p1.position = 10;
      p1.auditTurnsLeft = 3;
      room.phase = TurnPhase.WaitingRoll;

      const res = dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_END_TURN' });

      expect(res.success).toBe(true);
      expect(res.reason).toBeUndefined();
    });

    it('[TC-133.02/MSS][UC-IMP133] Kết thúc lượt ở đầu turn tại Ô 10 làm giảm auditTurnsLeft từ 3 về 2', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      p1.position = 10;
      p1.auditTurnsLeft = 3;
      room.phase = TurnPhase.WaitingRoll;

      dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_END_TURN' });

      expect(p1.auditTurnsLeft).toBe(2);
    });

    it('[TC-133.03/MSS][UC-IMP133] Kết thúc lượt tại Ô 10 chuyển lượt sang người chơi tiếp theo (p2)', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      p1.position = 10;
      p1.auditTurnsLeft = 3;
      room.phase = TurnPhase.WaitingRoll;

      dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_END_TURN' });

      expect(room.currentPlayerIndex).toBe(1);
      expect(room.players[room.currentPlayerIndex]?.id).toBe('p2');
    });

    it('[TC-133.04/MSS][UC-IMP133] Ở vòng tiếp theo, INTENT_END_TURN tại Ô 10 giảm auditTurnsLeft từ 2 về 1', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      p1.position = 10;
      p1.auditTurnsLeft = 2;
      room.phase = TurnPhase.WaitingRoll;
      room.currentPlayerIndex = 0;

      const res = dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_END_TURN' });

      expect(res.success).toBe(true);
      expect(p1.auditTurnsLeft).toBe(1);
    });

    it('[TC-133.05/MSS][UC-IMP133] Ở vòng thứ 3, INTENT_END_TURN giảm auditTurnsLeft từ 1 về 0', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      p1.position = 10;
      p1.auditTurnsLeft = 1;
      p1.balance = 5_000;
      room.phase = TurnPhase.WaitingRoll;
      room.currentPlayerIndex = 0;

      const res = dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_END_TURN' });

      expect(res.success).toBe(true);
      expect(p1.auditTurnsLeft).toBe(0);
    });

    it('[TC-133.06/MSS][UC-IMP133] Khi auditTurnsLeft về 0 ở vòng thứ 3, người chơi bị trừ 500 Tr. phạt nộp vào Kho Bạc', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      p1.position = 10;
      p1.auditTurnsLeft = 1;
      p1.balance = 2_000;
      room.treasury = 500;
      room.phase = TurnPhase.WaitingRoll;
      room.currentPlayerIndex = 0;

      dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_END_TURN' });

      expect(p1.balance).toBe(1_500);
      expect(room.treasury).toBe(1_000);
    });

    it('[TC-133.07/MSS][UC-IMP133] Khi người chơi không đủ 500 Tr. nộp phạt ở vòng 3, số dư chuyển sang âm (balance < 0)', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      p1.position = 10;
      p1.auditTurnsLeft = 1;
      p1.balance = 200;
      room.phase = TurnPhase.WaitingRoll;
      room.currentPlayerIndex = 0;

      dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_END_TURN' });

      expect(p1.balance).toBe(-300);
    });

    it('[TC-133.08/MSS][UC-IMP133] Khi bị âm tiền do phạt kiểm toán ở vòng 3, FSM tự động kích hoạt InsolvencyPhase và giữ lượt', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      p1.position = 10;
      p1.auditTurnsLeft = 1;
      p1.balance = 200;
      room.phase = TurnPhase.WaitingRoll;
      room.currentPlayerIndex = 0;

      dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_END_TURN' });

      expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
      expect(room.currentPlayerIndex).toBe(0);
    });
  });

  // =========================================================================
  // FACET 2: REACTIVITY & BAILOUT / ROLL COEXISTENCE
  // =========================================================================
  describe('Facet 2: Reactivity & Bailout/Roll Coexistence', () => {
    it('[TC-133.09/MSS][UC-IMP133] Người chơi ở Ô 10 (auditTurnsLeft: 2) nộp bảo lãnh INTENT_BAIL_OUT trừ 500 Tr. vào Kho Bạc', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      p1.position = 10;
      p1.auditTurnsLeft = 2;
      p1.balance = 1_500;
      room.treasury = 300;
      room.phase = TurnPhase.WaitingRoll;

      const res = dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_BAIL_OUT' });

      expect(res.success).toBe(true);
      expect(p1.balance).toBe(1_000);
      expect(room.treasury).toBe(800);
    });

    it('[TC-133.10/MSS][UC-IMP133] INTENT_BAIL_OUT ở đầu lượt xóa án kiểm toán (auditTurnsLeft: 0) và giữ phase WaitingRoll', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      p1.position = 10;
      p1.auditTurnsLeft = 2;
      p1.balance = 1_500;
      room.phase = TurnPhase.WaitingRoll;

      dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_BAIL_OUT' });

      expect(p1.auditTurnsLeft).toBe(0);
      expect(room.phase).toBe(TurnPhase.WaitingRoll);
    });

    it('[TC-133.11/MSS][UC-IMP133] Sau khi nộp bảo lãnh ở đầu lượt, người chơi được phép gọi handleRollDice và di chuyển bình thường', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      p1.position = 10;
      p1.auditTurnsLeft = 2;
      p1.balance = 1_500;
      room.phase = TurnPhase.WaitingRoll;

      dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_BAIL_OUT' });
      const rollRes = mgr.handleRollDice(roomCode, 'p1');

      expect(rollRes).toBeDefined();
      expect(p1.position).toBe(16); // 10 + (1 + 5)
    });

    it('[TC-133.12/MSS][UC-IMP133] Người chơi ở Ô 10 tại WaitingRoll đổ ra xúc xắc đôi (3, 3) được phóng thích và di chuyển tiếp', () => {
      // RNG returns die1 = 3 (0.4), die2 = 3 (0.4) -> double 6
      const doublesRng = () => 0.4;
      const { mgr, room, roomCode } = setupRoom(doublesRng);
      const p1 = room.players[0]!;
      p1.position = 10;
      p1.auditTurnsLeft = 2;
      room.phase = TurnPhase.WaitingRoll;

      const rollRes = mgr.handleRollDice(roomCode, 'p1');

      expect(rollRes).toBeDefined();
      expect(p1.auditTurnsLeft).toBe(0);
      expect(p1.position).toBe(16); // 10 + 6
    });

    it('[TC-133.13/MSS][UC-IMP133] Người chơi ở Ô 10 tại WaitingRoll đổ không ra đôi bị giữ lại, phase chuyển sang PropertyManagement', () => {
      // Default RNG: die1 = 1, die2 = 5 -> not double
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      p1.position = 10;
      p1.auditTurnsLeft = 2;
      room.phase = TurnPhase.WaitingRoll;

      const rollRes = mgr.handleRollDice(roomCode, 'p1');

      expect(rollRes).toBeDefined();
      expect(p1.position).toBe(10);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
    });

    it('[TC-133.14/MSS][UC-IMP133] Sau khi đổ không ra đôi, người chơi bấm INTENT_END_TURN giảm 1 lượt án và chuyển lượt', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      p1.position = 10;
      p1.auditTurnsLeft = 2;
      room.phase = TurnPhase.WaitingRoll;

      mgr.handleRollDice(roomCode, 'p1');
      const endRes = dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_END_TURN' });

      expect(endRes.success).toBe(true);
      expect(p1.auditTurnsLeft).toBe(1);
      expect(room.currentPlayerIndex).toBe(1);
    });
  });

  // =========================================================================
  // FACET 3: LIQUIDITY, PREEMPTION & TURN TRANSITION TO INSOLVENT PLAYER
  // =========================================================================
  describe('Facet 3: Liquidity, Preemption & Turn Transition to Insolvent Player', () => {
    it('[TC-133.15/MSS][UC-IMP133] Khi p2 bị âm tiền thụ động ngoài lượt (balance: -300), kết thúc lượt p1 chuyển ngay sang InsolvencyPhase', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      const p2 = room.players[1]!;

      // p1 thực hiện lượt
      mgr.handleRollDice(roomCode, 'p1');
      // p2 bị trừ tiền thụ động do sự kiện ngoài lượt
      p2.balance = -300;

      dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_END_TURN' });

      expect(room.currentPlayerIndex).toBe(1);
      expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    });

    it('[TC-133.16/MSS][UC-IMP133] FSM không được đặt phase WaitingRoll cho người chơi kế tiếp khi người đó đang có số dư âm', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      const p2 = room.players[1]!;

      mgr.handleRollDice(roomCode, 'p1');
      p2.balance = -450;

      dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_END_TURN' });

      expect(room.phase).not.toBe(TurnPhase.WaitingRoll);
      expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    });

    it('[TC-133.17/MSS][UC-IMP133] Khi p2 vừa bị âm tiền vừa có auditTurnsLeft > 0, ưu tiên số 1 vẫn là InsolvencyPhase', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      const p2 = room.players[1]!;

      mgr.handleRollDice(roomCode, 'p1');
      p2.balance = -300;
      p2.position = 10;
      p2.auditTurnsLeft = 2;

      dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_END_TURN' });

      expect(room.currentPlayerIndex).toBe(1);
      expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    });

    it('[TC-133.18/MSS][UC-IMP133] Khi p2 vừa bị âm tiền vừa có skipNextTurn = true, ưu tiên số 1 vẫn là InsolvencyPhase', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;
      const p2 = room.players[1]!;

      mgr.handleRollDice(roomCode, 'p1');
      p2.balance = -600;
      p2.skipNextTurn = true;

      dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_END_TURN' });

      expect(room.currentPlayerIndex).toBe(1);
      expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    });

    it('[TC-133.19/MSS][UC-IMP133] Khi người chơi có extraTurns > 0 nhưng bị âm tiền, FSM chuyển sang InsolvencyPhase thay vì WaitingRoll', () => {
      const { mgr, room, roomCode } = setupRoom();
      const p1 = room.players[0]!;

      mgr.handleRollDice(roomCode, 'p1');
      p1.extraTurns = 1;
      p1.balance = -250;

      dispatchPlayerIntent(mgr, roomCode, 'p1', { type: 'INTENT_END_TURN' });

      expect(room.currentPlayerIndex).toBe(0);
      expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    });
  });

  // =========================================================================
  // FACET 4: TELEMETRY WATCHDOG PRECISION & INVARIANT VERIFICATION
  // =========================================================================
  describe('Facet 4: Telemetry Watchdog Precision & Invariant Verification', () => {
    beforeEach(() => {
      useTelemetryStore.getState().reset();
      watchdogMonitor.reset();
    });

    it('[TC-133.20/MSS][UC-IMP133] verifyNonNegativeBalance trả về null cho p1 (balance: -374) khi currentTurnPlayerId là bot_2 (nợ ngoài lượt)', () => {
      const violation = verifyNonNegativeBalance({
        players: [
          { id: 'p1', balance: -374 },
          { id: 'bot_2', balance: 14_000 },
        ],
        isInInsolvency: false,
        tick: 85,
        currentTurnPlayerId: 'bot_2',
      } as any);

      expect(violation).toBeNull();
    });

    it('[TC-133.21/MSS][UC-IMP133] verifyNonNegativeBalance báo NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY khi p1 âm tiền trong chính lượt p1 mà không ở Insolvency', () => {
      const violation = verifyNonNegativeBalance({
        players: [
          { id: 'p1', balance: -374 },
          { id: 'bot_2', balance: 14_000 },
        ],
        isInInsolvency: false,
        tick: 86,
        currentTurnPlayerId: 'p1',
      } as any);

      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY');
      expect(violation?.details?.playerId).toBe('p1');
    });

    it('[TC-133.22/MSS][UC-IMP133] verifyNonNegativeBalance trả về null khi p1 âm tiền trong chính lượt p1 nhưng đang ở InsolvencyPhase', () => {
      const violation = verifyNonNegativeBalance({
        players: [
          { id: 'p1', balance: -374 },
          { id: 'bot_2', balance: 14_000 },
        ],
        isInInsolvency: true,
        tick: 87,
        currentTurnPlayerId: 'p1',
      } as any);

      expect(violation).toBeNull();
    });

    it('[TC-133.23/MSS][UC-IMP133] handleDeltaTelemetry KHÔNG ghi nhận vi phạm khi delta chứa người chơi âm tiền ngoài lượt (currentTurnPlayerId: bot_2)', () => {
      const preState = createTestGameState({
        p1Balance: 500,
        bot2Balance: 12_000,
        currentTurn: 'bot_2',
        phase: TurnPhase.WaitingRoll,
      });
      const postState = createTestGameState({
        p1Balance: -374,
        bot2Balance: 12_000,
        currentTurn: 'bot_2',
        phase: TurnPhase.WaitingRoll,
      });

      const delta: DeltaPayload = {
        tick: 88,
        currentTurnPlayerId: 'bot_2',
        currentPlayerIndex: 1,
        players: [
          { id: 'p1', balance: -374, position: 10 },
          { id: 'bot_2', balance: 12_000, position: 0 },
        ],
        cells: [],
        turnPhase: TurnPhase.WaitingRoll,
        roomStarted: true,
      };

      handleDeltaTelemetry(delta, preState, postState);

      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY');

      expect(violations.length).toBe(0);
    });

    it('[TC-133.24/MSS][UC-IMP133] handleDeltaTelemetry ghi nhận vi phạm khi người chơi có số dư âm trong chính lượt của mình ngoài Insolvency', () => {
      const preState = createTestGameState({
        p1Balance: 500,
        bot2Balance: 12_000,
        currentTurn: 'p1',
        phase: TurnPhase.PropertyManagement,
      });
      const postState = createTestGameState({
        p1Balance: -374,
        bot2Balance: 12_000,
        currentTurn: 'p1',
        phase: TurnPhase.PropertyManagement,
      });

      const delta: DeltaPayload = {
        tick: 89,
        currentTurnPlayerId: 'p1',
        currentPlayerIndex: 0,
        players: [
          { id: 'p1', balance: -374, position: 10 },
          { id: 'bot_2', balance: 12_000, position: 0 },
        ],
        cells: [],
        turnPhase: TurnPhase.PropertyManagement,
        roomStarted: true,
      };

      handleDeltaTelemetry(delta, preState, postState);

      const violations = useTelemetryStore
        .getState()
        .violations.filter((v) => v.type === 'NEGATIVE_BALANCE_OUTSIDE_INSOLVENCY');

      expect(violations.length).toBe(1);
      expect(violations[0]?.details?.playerId).toBe('p1');
    });
  });
});
