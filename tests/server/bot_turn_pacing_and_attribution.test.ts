// [UC-GAME-005/MSS][UC-GAME-008/MSS][UI-S06/MSS]
// Contract tests for Bot turn pacing, dice attribution, and sequence integrity
import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from '../../src/server/room_manager.js';
import { TurnPhase, createPlayer } from '../../src/domain/room.js';
import { executeTurnRoll, executeTurnEnd } from '../../src/server/turn_loop.js';
import { buildDeltaFromRoom } from '../../src/server/session_manager.js';
import { buildSparseDelta } from '../../src/server/network/delta_broadcaster.js';
import { stepBotTurn } from '../../src/server/room_bot_coordinator.js';
import { detectDiceActivity, trackDeltaActivities } from '../../src/client/network/activity_tracker.js';
import { useGameStore, type GameState } from '../../src/client/store/game_store.js';
import { useActivityStore } from '../../src/client/store/activity_store.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';

describe('Bot Turn Pacing & Dice Attribution Contract Tests', () => {
  let rm: RoomManager;
  const roomCode = 'PACE01';

  beforeEach(() => {
    rm = new RoomManager();
    rm.createRoom('p1', roomCode);
    useActivityStore.getState().clearLogs();
  });

  // ==========================================
  // FACET 1: BOUNDARY & LIFECYCLE TESTS
  // ==========================================
  describe('Facet 1: Boundary & Lifecycle Tests', () => {
    it('[TC-PACE-01] executeTurnRoll assigns room.lastDiceRollerId matching current player', () => {
      const room = rm.getRoom(roomCode)!;
      rm.addBot(roomCode, 'bot_1');
      rm.startGame(roomCode);
      const player = room.players[0]!;

      executeTurnRoll(room, player, new Map(), new Map(), () => 0.5, () => 0.5, new Map(), roomCode);
      expect((room as unknown as { lastDiceRollerId?: string }).lastDiceRollerId).toBe(player.id);
    });

    it('[TC-PACE-02] executeTurnEnd preserves room.lastDiceRollerId of the rolling player across turn transition', () => {
      const room = rm.getRoom(roomCode)!;
      rm.addBot(roomCode, 'bot_1');
      rm.startGame(roomCode);
      const player = room.players[0]!;
      room.lastDice = [3, 4];
      (room as unknown as { lastDiceRollerId?: string }).lastDiceRollerId = player.id;

      executeTurnEnd(room, player, true, false, roomCode, new Map());
      expect((room as unknown as { lastDiceRollerId?: string }).lastDiceRollerId).toBe(player.id);
    });

    it('[TC-PACE-03] detectDiceActivity ignores previous player dice when turn transitions to next player', () => {
      const prevDelta = {
        tick: 1,
        cells: [],
        currentTurnPlayerId: 'p1',
        diceRollerId: 'p1',
        dice: [3, 4] as const,
      };
      const nextDelta = {
        tick: 2,
        cells: [],
        currentTurnPlayerId: 'bot_1',
        diceRollerId: 'p1',
        dice: [3, 4] as const,
        turnPhase: TurnPhase.WaitingRoll,
      };
      const mockState = {
        currentTurnPlayerId: 'bot_1',
        hasRolledThisTurn: false,
        dice: [3, 4],
        playersInfo: { p1: { name: 'P1', id: 'p1' }, bot_1: { name: 'Bot 1', id: 'bot_1' } },
      } as unknown as GameState;

      const entry = detectDiceActivity(nextDelta as unknown as Parameters<typeof detectDiceActivity>[0], mockState);
      expect(entry).toBeNull();
    });

    it('[TC-PACE-04] buildDeltaFromRoom includes diceRollerId matching room.lastDiceRollerId', () => {
      const room = rm.getRoom(roomCode)!;
      rm.addBot(roomCode, 'bot_1');
      rm.startGame(roomCode);
      (room as unknown as { lastDiceRollerId?: string }).lastDiceRollerId = 'p1';
      room.lastDice = [5, 6];

      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 1);
      expect((delta as unknown as { diceRollerId?: string }).diceRollerId).toBe('p1');
    });

    it('[TC-PACE-05] buildDeltaFromRoom sets dice to undefined when room.lastDice is cleared', () => {
      const room = rm.getRoom(roomCode)!;
      rm.addBot(roomCode, 'bot_1');
      rm.startGame(roomCode);
      room.lastDice = undefined;

      const delta = buildDeltaFromRoom(room, new Map(), new Map(), 2);
      expect(delta.dice).toBeUndefined();
    });
  });

  // ==========================================
  // FACET 2: STATE REACTIVITY & ATTRIBUTION
  // ==========================================
  describe('Facet 2: State Reactivity & Attribution', () => {
    it('[TC-PACE-06] detectDiceActivity credits dice roll to delta.diceRollerId over currentTurnPlayerId', () => {
      const delta = {
        tick: 1,
        cells: [],
        currentTurnPlayerId: 'p1',
        diceRollerId: 'bot_2',
        dice: [6, 5] as const,
      };
      const mockState = {
        currentTurnPlayerId: 'p1',
        playersInfo: {
          p1: { name: 'Player 1', id: 'p1' },
          bot_2: { name: 'Bot AI 2', id: 'bot_2' },
        },
      } as unknown as GameState;

      const entry = detectDiceActivity(delta as unknown as Parameters<typeof detectDiceActivity>[0], mockState);
      expect(entry?.playerId).toBe('bot_2');
      expect(entry?.message).toContain('Bot AI 2 đã gieo xúc xắc');
    });

    it('[TC-PACE-07] detectDiceActivity returns null when delta.dice is undefined', () => {
      const delta = {
        tick: 2,
        cells: [],
        currentTurnPlayerId: 'p1',
      };
      const mockState = { currentTurnPlayerId: 'p1', playersInfo: {} } as unknown as GameState;

      const entry = detectDiceActivity(delta as unknown as Parameters<typeof detectDiceActivity>[0], mockState);
      expect(entry).toBeNull();
    });

    it('[TC-PACE-08] detectDiceActivity returns null when delta.dice is [0, 0]', () => {
      const delta = {
        tick: 3,
        cells: [],
        currentTurnPlayerId: 'p1',
        dice: [0, 0] as const,
      };
      const mockState = { currentTurnPlayerId: 'p1', playersInfo: {} } as unknown as GameState;

      const entry = detectDiceActivity(delta as unknown as Parameters<typeof detectDiceActivity>[0], mockState);
      expect(entry).toBeNull();
    });

    it('[TC-PACE-09] buildSparseDelta preserves diceRollerId in sparse payload', () => {
      const prev = { tick: 1, cells: [] };
      const next = { tick: 2, cells: [], diceRollerId: 'bot_2', dice: [3, 4] as const };

      const sparse = buildSparseDelta(prev as unknown as Parameters<typeof buildSparseDelta>[0], next as unknown as Parameters<typeof buildSparseDelta>[1]);
      expect((sparse as unknown as { diceRollerId?: string }).diceRollerId).toBe('bot_2');
    });

    it('[TC-PACE-10] detectDiceActivity formats double roll indicator correctly', () => {
      const delta = {
        tick: 4,
        cells: [],
        diceRollerId: 'bot_1',
        dice: [4, 4] as const,
      };
      const mockState = {
        currentTurnPlayerId: 'bot_1',
        playersInfo: { bot_1: { name: 'Bot AI 1', id: 'bot_1' } },
      } as unknown as GameState;

      const entry = detectDiceActivity(delta as unknown as Parameters<typeof detectDiceActivity>[0], mockState);
      expect(entry?.message).toContain('Đổ đôi! 🎉');
    });
  });

  // ==========================================
  // FACET 3: BOT PACING & PHASED EXECUTION
  // ==========================================
  describe('Facet 3: Bot Pacing & Phased Execution', () => {
    it('[TC-PACE-11] stepBotTurn executes single roll step when bot is in WaitingRoll', () => {
      const room = rm.getRoom(roomCode)!;
      rm.addBot(roomCode, 'bot_1');
      rm.startGame(roomCode);
      room.currentPlayerIndex = 1; // Bot turn
      room.phase = TurnPhase.WaitingRoll;

      const stepped = stepBotTurn(rm, roomCode);
      expect(stepped).toBe(true);
      expect(room.phase).not.toBe(TurnPhase.WaitingRoll);
    });

    it('[TC-PACE-12] stepBotTurn executes buy or decline step when bot is in ActionPhase', () => {
      const room = rm.getRoom(roomCode)!;
      rm.addBot(roomCode, 'bot_1');
      rm.startGame(roomCode);
      room.currentPlayerIndex = 1; // Bot turn
      room.phase = TurnPhase.ActionPhase;
      const bot = room.players[1]!;
      bot.position = 1; // Unowned property cell 1

      const stepped = stepBotTurn(rm, roomCode);
      expect(stepped).toBe(true);
      expect(room.phase).not.toBe(TurnPhase.ActionPhase);
    });

    it('[TC-PACE-13] stepBotTurn executes end turn step when bot is in PropertyManagement', () => {
      const room = rm.getRoom(roomCode)!;
      rm.addBot(roomCode, 'bot_1');
      rm.startGame(roomCode);
      room.currentPlayerIndex = 1; // Bot turn
      room.phase = TurnPhase.PropertyManagement;

      const stepped = stepBotTurn(rm, roomCode);
      expect(stepped).toBe(true);
      expect(room.currentPlayerIndex).toBe(0); // Returned to P1
    });

    it('[TC-PACE-14] stepBotTurn returns false when active player is not a bot', () => {
      const room = rm.getRoom(roomCode)!;
      rm.addBot(roomCode, 'bot_1');
      rm.startGame(roomCode);
      room.currentPlayerIndex = 0; // Human player P1

      const stepped = stepBotTurn(rm, roomCode);
      expect(stepped).toBe(false);
    });

    it('[TC-PACE-15] stepBotTurn returns false if room is not started', () => {
      const stepped = stepBotTurn(rm, roomCode);
      expect(stepped).toBe(false);
    });
  });

  // ==========================================
  // FACET 4: ERROR DEFENSE & SEQUENCE INVARIANCE
  // ==========================================
  describe('Facet 4: Error Defense & Sequence Invariance', () => {
    it('[TC-PACE-16] Zero phantom dice roll logs emitted when turn passes to next player', () => {
      // Step 1: P1 rolls
      const deltaRollP1 = {
        tick: 1,
        cells: [],
        currentTurnPlayerId: 'p1',
        diceRollerId: 'p1',
        dice: [2, 3] as const,
      };
      trackDeltaActivities(
        deltaRollP1 as unknown as Parameters<typeof trackDeltaActivities>[0],
        { currentTurnPlayerId: 'p1', playersInfo: { p1: { name: 'P1', id: 'p1' }, bot_1: { name: 'Bot 1', id: 'bot_1' } } } as unknown as GameState,
        { currentTurnPlayerId: 'p1', playersInfo: { p1: { name: 'P1', id: 'p1' }, bot_1: { name: 'Bot 1', id: 'bot_1' } } } as unknown as GameState,
      );

      // Step 2: P1 ends turn (dice cleared to undefined)
      const deltaEndP1 = {
        tick: 2,
        cells: [],
        currentTurnPlayerId: 'bot_1',
        turnPhase: TurnPhase.WaitingRoll,
      };
      trackDeltaActivities(
        deltaEndP1 as unknown as Parameters<typeof trackDeltaActivities>[0],
        { currentTurnPlayerId: 'p1', playersInfo: { p1: { name: 'P1', id: 'p1' }, bot_1: { name: 'Bot 1', id: 'bot_1' } } } as unknown as GameState,
        { currentTurnPlayerId: 'bot_1', playersInfo: { p1: { name: 'P1', id: 'p1' }, bot_1: { name: 'Bot 1', id: 'bot_1' } } } as unknown as GameState,
      );

      const logs = useActivityStore.getState().activityLogs;
      const diceLogs = logs.filter((l) => l.type === 'dice');
      expect(diceLogs.length).toBe(1);
      expect(diceLogs[0]?.playerId).toBe('p1');
    });

    it('[TC-PACE-17] Sequential activity tracking guarantees strict order: Roll precedes Move precedes Buy', () => {
      const delta = {
        tick: 10,
        cells: [{ index: 5, ownerId: 'bot_1', level: 0 }],
        players: [{ id: 'bot_1', position: 5, balance: 13000, isBot: true }],
        currentTurnPlayerId: 'bot_1',
        diceRollerId: 'bot_1',
        dice: [1, 4] as const,
      };
      const prevState = {
        currentTurnPlayerId: 'bot_1',
        playerPositions: { bot_1: 0 },
        levelMap: {},
        playersInfo: { bot_1: { name: 'Bot AI 1', id: 'bot_1', balance: 15000, ownedProperties: [] } },
      } as unknown as GameState;
      const nextState = {
        currentTurnPlayerId: 'bot_1',
        playerPositions: { bot_1: 5 },
        levelMap: { 5: 0 },
        playersInfo: { bot_1: { name: 'Bot AI 1', id: 'bot_1', balance: 13000, ownedProperties: [5] } },
      } as unknown as GameState;

      trackDeltaActivities(delta as unknown as Parameters<typeof trackDeltaActivities>[0], prevState, nextState);
      const logs = useActivityStore.getState().activityLogs;

      expect(logs.length).toBeGreaterThanOrEqual(3);
      expect(logs[0]?.type).toBe('dice');
      expect(logs[1]?.type).toBe('move');
      expect(logs[2]?.type).toBe('buy');
    });

    it('[TC-PACE-18] detectDiceActivity captures bot auto-roll when turn completes and transitions to next player (WaitingRoll)', () => {
      // In auto mode, bot rolls 3+4, moves, buys, and ends turn.
      // Server broadcasts delta with turnPhase = WaitingRoll (for P1), but diceRollerId is bot_1 and diceSeq is 1.
      const delta = {
        tick: 5,
        cells: [{ index: 15, ownerId: 'bot_1' }],
        players: [{ id: 'bot_1', position: 15, balance: 13000, isBot: true }],
        currentTurnPlayerId: 'p1',
        diceRollerId: 'bot_1',
        dice: [3, 4] as const,
        diceSeq: 1,
        turnPhase: TurnPhase.WaitingRoll,
      };
      const prevState = {
        currentTurnPlayerId: 'bot_1',
        playerPositions: { bot_1: 8, p1: 0 },
        playersInfo: {
          p1: { name: 'Đại Gia Chủ Sảnh (P1)', id: 'p1', ownedProperties: [] },
          bot_1: { name: 'Bot AI 1 (Aggressive)', id: 'bot_1', ownedProperties: [] },
        },
      } as unknown as GameState;
      const nextState = {
        currentTurnPlayerId: 'p1',
        playerPositions: { bot_1: 15, p1: 0 },
        playersInfo: {
          p1: { name: 'Đại Gia Chủ Sảnh (P1)', id: 'p1', ownedProperties: [] },
          bot_1: { name: 'Bot AI 1 (Aggressive)', id: 'bot_1', ownedProperties: [15] },
        },
      } as unknown as GameState;

      trackDeltaActivities(delta as unknown as Parameters<typeof trackDeltaActivities>[0], prevState, nextState);
      const logs = useActivityStore.getState().activityLogs;
      const diceLogs = logs.filter((l) => l.type === 'dice');

      expect(diceLogs.length).toBe(1);
      expect(diceLogs[0]?.playerId).toBe('bot_1');
      expect(diceLogs[0]?.message).toContain('Bot AI 1 (Aggressive) đã gieo xúc xắc được 3 + 4 = 7 điểm');
    });

    it('[TC-PACE-19] detectDiceActivity captures human AFK timeout auto-roll when turn completes to WaitingRoll', () => {
      // P1 times out in WaitingRoll, lands on Tax Audit (Cell 10), turn ends automatically to Bot 1 in WaitingRoll.
      const delta = {
        tick: 8,
        cells: [],
        players: [{ id: 'p1', position: 10, balance: 14500, inAudit: true }],
        currentTurnPlayerId: 'bot_1',
        diceRollerId: 'p1',
        dice: [5, 2] as const,
        diceSeq: 2,
        turnPhase: TurnPhase.WaitingRoll,
      };
      const prevState = {
        currentTurnPlayerId: 'p1',
        playerPositions: { p1: 3, bot_1: 15 },
        playersInfo: {
          p1: { name: 'Đại Gia Chủ Sảnh (P1)', id: 'p1' },
          bot_1: { name: 'Bot AI 1 (Aggressive)', id: 'bot_1' },
        },
      } as unknown as GameState;
      const nextState = {
        currentTurnPlayerId: 'bot_1',
        playerPositions: { p1: 10, bot_1: 15 },
        playersInfo: {
          p1: { name: 'Đại Gia Chủ Sảnh (P1)', id: 'p1' },
          bot_1: { name: 'Bot AI 1 (Aggressive)', id: 'bot_1' },
        },
      } as unknown as GameState;

      trackDeltaActivities(delta as unknown as Parameters<typeof trackDeltaActivities>[0], prevState, nextState);
      const logs = useActivityStore.getState().activityLogs;
      const diceLogs = logs.filter((l) => l.type === 'dice');

      expect(diceLogs.length).toBe(1);
      expect(diceLogs[0]?.playerId).toBe('p1');
      expect(diceLogs[0]?.message).toContain('Đại Gia Chủ Sảnh (P1) đã gieo xúc xắc được 5 + 2 = 7 điểm');
    });

    it('[TC-PACE-20] diceSeq monotonic deduplication prevents duplicate logs across multiple deltas', () => {
      const delta = {
        tick: 12,
        cells: [],
        currentTurnPlayerId: 'bot_1',
        diceRollerId: 'bot_1',
        dice: [6, 4] as const,
        diceSeq: 3,
        turnPhase: TurnPhase.ActionPhase,
      };
      const state = {
        currentTurnPlayerId: 'bot_1',
        playersInfo: { bot_1: { name: 'Bot 1', id: 'bot_1' } },
      } as unknown as GameState;

      // First broadcast
      trackDeltaActivities(delta as unknown as Parameters<typeof trackDeltaActivities>[0], state, state);
      // Subsequent broadcast with same diceSeq (e.g. while deciding buy)
      trackDeltaActivities(delta as unknown as Parameters<typeof trackDeltaActivities>[0], state, state);

      const diceLogs = useActivityStore.getState().activityLogs.filter((l) => l.type === 'dice');
      expect(diceLogs.length).toBe(1);
    });
  });
});
