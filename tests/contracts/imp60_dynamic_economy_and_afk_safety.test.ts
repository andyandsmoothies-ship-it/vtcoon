// [IMP-60] Dynamic Player Economy Scaling, Pacing Normalization & Fail-Safe Auto-Action Alignment
// Contract test suite enforcing the 4-Facet Behavioral Matrix and Atomic Test Mandate
import { describe, it, expect } from 'vitest';
import {
  INITIAL_BALANCE_BY_PLAYERS,
  getInitialBalanceForPlayerCount,
  TurnPhase,
} from '../../src/domain/room';
import { GO_PROPERTY_TAX_CAP } from '../../src/domain/property_rent';
import { RoomManager } from '../../src/server/room_manager';
import { PHASE_TIMEOUTS_MS, TurnOrchestrator } from '../../src/server/network/turn_orchestrator';
import { TurnWatchdog } from '../../src/server/network/turn_watchdog';
import { IntentMutex } from '../../src/server/network/intent_mutex';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster';
import { SessionManager } from '../../src/server/session_manager';
import { executeInsolvencyAfkRecovery } from '../../src/server/network/afk_recovery';

describe('[IMP-60] Dynamic Player Economy & AFK Safety Contracts', () => {
  // --- Facet 1: Boundary Tests ---
  describe('Facet 1: Boundary & Pacing Normalization', () => {
    it.each([
      [1, 25_000],
      [2, 25_000],
      [3, 20_000],
      [4, 18_000],
      [5, 18_000],
    ])('[TC-60.01/MSS] getInitialBalanceForPlayerCount(%i) returns %i', (count, expected) => {
      expect(getInitialBalanceForPlayerCount(count)).toBe(expected);
    });

    it('[TC-60.02/MSS] INITIAL_BALANCE_BY_PLAYERS map matches specification', () => {
      expect(INITIAL_BALANCE_BY_PLAYERS[2]).toBe(25_000);
      expect(INITIAL_BALANCE_BY_PLAYERS[3]).toBe(20_000);
      expect(INITIAL_BALANCE_BY_PLAYERS[4]).toBe(18_000);
    });

    it('[TC-60.03/MSS] GO_PROPERTY_TAX_CAP is exactly 1.000 Tr.', () => {
      expect(GO_PROPERTY_TAX_CAP).toBe(1_000);
    });

    it('[TC-60.04/MSS] PHASE_TIMEOUTS_MS WaitingRoll and ActionPhase pacing', () => {
      expect(PHASE_TIMEOUTS_MS[TurnPhase.WaitingRoll]).toBe(25_000);
      expect(PHASE_TIMEOUTS_MS[TurnPhase.ActionPhase]).toBe(35_000);
    });

    it('[TC-60.05/MSS] PHASE_TIMEOUTS_MS HosePhase, PropertyManagement, AuctionPhase pacing', () => {
      expect(PHASE_TIMEOUTS_MS[TurnPhase.HosePhase]).toBe(25_000);
      expect(PHASE_TIMEOUTS_MS[TurnPhase.PropertyManagement]).toBe(30_000);
      expect(PHASE_TIMEOUTS_MS[TurnPhase.AuctionPhase]).toBe(20_000);
    });

    it('[TC-60.06/MSS] PHASE_TIMEOUTS_MS InsolvencyPhase pacing is 45s', () => {
      expect(PHASE_TIMEOUTS_MS[TurnPhase.InsolvencyPhase]).toBe(45_000);
    });
  });

  // --- Facet 2: State Reactivity & Dynamic Economy ---
  describe('Facet 2: State Reactivity & Dynamic Economy Scaling', () => {
    it('[TC-60.07/MSS] 2-player room sets initial balance to 25.000 Tr. upon startGame', () => {
      const mgr = new RoomManager(1);
      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'p2');
      mgr.startGame(room.roomCode);

      expect(room.players[0]!.balance).toBe(25_000);
      expect(room.players[1]!.balance).toBe(25_000);
    });

    it('[TC-60.08/MSS] 3-player room sets initial balance to 20.000 Tr. upon startGame', () => {
      const mgr = new RoomManager(1);
      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'p2');
      mgr.joinRoom(room.roomCode, 'p3');
      mgr.startGame(room.roomCode);

      expect(room.players[0]!.balance).toBe(20_000);
      expect(room.players[1]!.balance).toBe(20_000);
      expect(room.players[2]!.balance).toBe(20_000);
    });

    it('[TC-60.09/MSS] 4-player room sets initial balance to 18.000 Tr. upon startGame', () => {
      const mgr = new RoomManager(1);
      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'p2');
      mgr.joinRoom(room.roomCode, 'p3');
      mgr.joinRoom(room.roomCode, 'p4');
      mgr.startGame(room.roomCode);

      expect(room.players[0]!.balance).toBe(18_000);
      expect(room.players[1]!.balance).toBe(18_000);
      expect(room.players[2]!.balance).toBe(18_000);
      expect(room.players[3]!.balance).toBe(18_000);
    });

    it('[TC-60.10/MSS] Passing GO with >= 7 properties caps tax at 1.000 Tr. ensuring net >= +1.000 Tr.', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'p2');
      mgr.startGame(room.roomCode);

      const reg = mgr.getRegistry(room.roomCode)!;
      // Gán 8 ô đất cho p1 (tổng thuế gộp = 8 * 400 = 3200 Tr. > 2000 Tr.)
      [1, 3, 6, 8, 9, 11, 13, 14].forEach((cell) => reg.set(cell, 'p1'));

      const p1 = room.players[0]!;
      p1.position = 38;
      const initialBalance = p1.balance;

      const rollRes = mgr.handleRollDice(room.roomCode, 'p1');
      expect(rollRes?.passedGo).toBe(true);
      // Net cash nhận được tối thiểu là +1000 Tr. (2000 - 1000 = 1000)
      expect(p1.balance).toBeGreaterThanOrEqual(initialBalance + 1_000);
      expect(room.treasury).toBe(1_000);
    });
  });

  // --- Facet 3: Resource Disposal & AFK Safety ---
  describe('Facet 3: Safe AFK Auto-Mortgage in InsolvencyPhase', () => {
    it('[TC-60.11/MSS] Rescues negative balance by mortgaging cheapest property first', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'p2');
      mgr.startGame(room.roomCode);

      const reg = mgr.getRegistry(room.roomCode)!;
      reg.set(1, 'p1'); // Cell 1: price 600, loan 300
      reg.set(6, 'p1'); // Cell 6: price 1000, loan 500

      const p1 = room.players[0]!;
      p1.balance = -200;
      room.phase = TurnPhase.InsolvencyPhase;

      const result = executeInsolvencyAfkRecovery(mgr, room.roomCode, 'p1');
      expect(result.rescued).toBe(true);
      expect(result.bankrupt).toBe(false);
      expect(p1.balance).toBe(100); // -200 + 300 = 100
      expect(p1.mortgagedProperties).toEqual([1]);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
    });

    it('[TC-60.12/MSS] Mortgages multiple properties until balance >= 0 and stops', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'p2');
      mgr.startGame(room.roomCode);

      const reg = mgr.getRegistry(room.roomCode)!;
      reg.set(1, 'p1');  // price 600 -> +300
      reg.set(3, 'p1');  // price 600 -> +300
      reg.set(39, 'p1'); // price 4000 -> +2000

      const p1 = room.players[0]!;
      p1.balance = -500;
      room.phase = TurnPhase.InsolvencyPhase;

      const result = executeInsolvencyAfkRecovery(mgr, room.roomCode, 'p1');
      expect(result.rescued).toBe(true);
      expect(p1.balance).toBe(100); // -500 + 300 + 300 = 100
      expect(p1.mortgagedProperties).toEqual([1, 3]);
      expect(p1.mortgagedProperties).not.toContain(39);
    });

    it('[TC-60.13/MSS] TurnOrchestrator safe AFK action rescues player and ends turn', () => {
      const mgr = new RoomManager(42);
      const sessions = new SessionManager();
      const intentMutex = new IntentMutex();
      const broadcaster = new DeltaBroadcaster(mgr, sessions);
      const orchestrator = new TurnOrchestrator({
        rooms: mgr,
        intentMutex,
        broadcaster,
        onGameOver: () => {},
      });

      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'p2');
      mgr.startGame(room.roomCode);

      const reg = mgr.getRegistry(room.roomCode)!;
      reg.set(6, 'p1'); // price 1000 -> loan 500

      const p1 = room.players[0]!;
      p1.balance = -300;
      room.phase = TurnPhase.InsolvencyPhase;

      // Gọi AFK action trực tiếp qua hàm private bằng call/apply
      (orchestrator as any).executeSafeAfkAction(room.roomCode, TurnPhase.InsolvencyPhase, 'p1');

      expect(p1.bankrupt).toBe(false);
      expect(p1.balance).toBe(200);
      expect(room.currentPlayerIndex).toBe(1); // Turn passed to p2
    });

    it('[TC-60.17/MSS] Rescues negative balance by downgrading improved property first before mortgaging', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'p2');
      mgr.startGame(room.roomCode);

      const reg = mgr.getRegistry(room.roomCode)!;
      const sm = mgr.getPropertyStates(room.roomCode)!;
      reg.set(16, 'p1');
      sm.set(16, { level: 1 });

      const p1 = room.players[0]!;
      p1.balance = -300;
      room.phase = TurnPhase.InsolvencyPhase;

      const result = executeInsolvencyAfkRecovery(mgr, room.roomCode, 'p1');
      expect(result.rescued).toBe(true);
      expect(p1.balance).toBe(105); // -300 + 405 (refund for cost 810) = 105
      expect(sm.get(16)?.level).toBe(0);
      expect(p1.mortgagedProperties).toEqual([]);
    });

    it('[TC-60.18/MSS] Downgrades improved property to level 0 then mortgages it when downgrade alone is insufficient', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'p2');
      mgr.startGame(room.roomCode);

      const reg = mgr.getRegistry(room.roomCode)!;
      const sm = mgr.getPropertyStates(room.roomCode)!;
      reg.set(16, 'p1');
      sm.set(16, { level: 1 });

      const p1 = room.players[0]!;
      p1.balance = -1000;
      room.phase = TurnPhase.InsolvencyPhase;

      const result = executeInsolvencyAfkRecovery(mgr, room.roomCode, 'p1');
      expect(result.rescued).toBe(true);
      expect(p1.balance).toBe(305); // -1000 + 405 (refund) + 900 (loan) = 305
      expect(sm.get(16)?.level).toBe(0);
      expect(p1.mortgagedProperties).toContain(16);
    });
  });

  // --- Facet 4: Error Defense & Fallback ---
  describe('Facet 4: Error Defense & Bankruptcy Fallback', () => {
    it('[TC-60.14/MSS] Dispatches bankruptcy if all properties are already mortgaged and balance < 0', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'p2');
      mgr.startGame(room.roomCode);

      const reg = mgr.getRegistry(room.roomCode)!;
      reg.set(1, 'p1');

      const p1 = room.players[0]!;
      p1.balance = -500;
      p1.mortgagedProperties = [1]; // Already mortgaged
      room.phase = TurnPhase.InsolvencyPhase;

      const result = executeInsolvencyAfkRecovery(mgr, room.roomCode, 'p1');
      expect(result.rescued).toBe(false);
      expect(result.bankrupt).toBe(true);
      expect(p1.bankrupt).toBe(true);
    });

    it('[TC-60.15/MSS] Dispatches bankruptcy if player has no properties at all and balance < 0', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'p2');
      mgr.startGame(room.roomCode);

      const p1 = room.players[0]!;
      p1.balance = -500;
      room.phase = TurnPhase.InsolvencyPhase;

      const result = executeInsolvencyAfkRecovery(mgr, room.roomCode, 'p1');
      expect(result.rescued).toBe(false);
      expect(result.bankrupt).toBe(true);
      expect(p1.bankrupt).toBe(true);
    });

    it('[TC-60.16/MSS] TurnWatchdog maxTurnStallMs default is 60_000ms', () => {
      const mgr = new RoomManager(42);
      const sessions = new SessionManager();
      const intentMutex = new IntentMutex();
      const broadcaster = new DeltaBroadcaster(mgr, sessions);
      const watchdog = new TurnWatchdog({
        rooms: mgr,
        intentMutex,
        broadcaster,
        onGameOver: () => {},
        onScheduleNextTurn: () => {},
      });

      expect((watchdog as any).maxTurnStallMs).toBe(60_000);
    });
  });
});
