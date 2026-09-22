// [TC-IMP164/MSS][UC-GAME-008][UC-GAME-009][UC-GAME-028][UC-GAME-056][UC-BOT-06]
// Contract Test Suite for IMP-164: Extra Turn State Sync, Event Card Lifecycle Purge, Insolvent Buyer Protection & Bot Trade Anti-Harassment
import { describe, it, expect, beforeEach } from 'vitest';
import { TurnPhase, createPlayer, createRoom, type Room, type EventCardInfo, ActionRejectReason } from '../../src/domain/room.js';
import { executeTurnEnd, executeTurnRoll } from '../../src/server/turn_loop.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { buildSparseDelta } from '../../src/server/network/delta_broadcaster.js';
import type { DeltaPayload } from '../../src/server/session_manager.js';
import { applyDeltaToStore } from '../../src/client/network/apply_delta.js';
import { applyPlayerDeltas } from '../../src/client/network/apply_delta_players.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import { isRollActionDisabled, isEndTurnDisabled } from '../../src/client/ui/ui_helpers.js';
import { coordTrade, coordRespondTradeOffer, type RoomContext } from '../../src/server/room_property_coordinator.js';
import { pendingTradeManager } from '../../src/server/pending_trade_manager.js';
import { findEligibleBotTrade } from '../../src/domain/bot/bot_trade.js';
import { BotPersonality } from '../../src/domain/bot/bot_types.js';
import { declareBankruptcy } from '../../src/server/insolvency_manager.js';

describe('[TC-IMP164/MSS] IMP-164: Turn Sync, Card Purge & Bot Trade Anti-Harassment Contract Suite', () => {
  beforeEach(() => {
    pendingTradeManager.clearSession('ROOM01');
    pendingTradeManager.clearSession('VT8888');
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      turnPhase: TurnPhase.WaitingRoll,
      lastEventCard: null,
      isRolling: false,
      pawnAnimationQueue: [],
      activePawnAnimation: null,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Player 1',
          balance: 15000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
          mortgagedProperties: [],
          isBot: false,
        },
      },
    });
  });

  // =========================================================================
  // FACET 1: Boundary & Range (State Bounds, Broadcaster Diff & Solvency Guards)
  // =========================================================================
  describe('Facet 1: Boundary & Range', () => {
    it('[TC-IMP164.01/MSS][UC-GAME-009] apply_delta resets hasRolledThisTurn = false when receiving turnPhase: WaitingRoll with same currentTurnPlayerId', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        hasRolledThisTurn: true,
        turnPhase: TurnPhase.PropertyManagement,
      });

      applyDeltaToStore({
        tick: 2,
        cells: [],
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.WaitingRoll,
      }, useGameStore);

      expect(useGameStore.getState().hasRolledThisTurn).toBe(false);
      expect(useGameStore.getState().turnPhase).toBe(TurnPhase.WaitingRoll);
    });

    it('[TC-IMP164.02/MSS][UC-GAME-009] isPlayerEqual in delta_broadcaster detects changes in extraTurns', () => {
      const prev: DeltaPayload = {
        tick: 1,
        cells: [],
        players: [
          { id: 'p1', position: 0, balance: 15000, extraTurns: 1 } as any,
        ],
      };
      const next: DeltaPayload = {
        tick: 2,
        cells: [],
        players: [
          { id: 'p1', position: 0, balance: 15000, extraTurns: 0 } as any,
        ],
      };

      const sparse = buildSparseDelta(prev, next);
      expect(sparse.players).toBeDefined();
      expect(sparse.players).toHaveLength(1);
      expect(sparse.players?.[0]?.extraTurns).toBe(0);
    });

    it.each([
      { price: 0, swap: true, desc: 'swap (price = 0)' },
      { price: 1000, swap: false, desc: 'cash purchase (price > 0)' },
    ])('[TC-IMP164.03/MSS][UC-GAME-056] coordTrade returns INSUFFICIENT_FUNDS when buyer.balance < 0 for $desc', ({ price, swap }) => {
      const room = createRoom('p1', 'ROOM01');
      room.started = true;
      const p1 = room.players[0]!;
      const p2 = createPlayer('p2');
      room.players.push(p2);
      const reg = new Map<number, string>([[6, 'p2'], [8, 'p1']]);
      const sm = new Map<number, any>();
      const ctx: RoomContext = { room, reg, sm };

      p1.balance = -500;
      p2.balance = 15000;

      const result = coordTrade(ctx, 'p1', 'p2', 'p1', 6, price, swap ? 8 : undefined);

      expect(result.success).toBe(false);
      expect(result.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
    });

    it.each([
      { price: 2000, swap: false, expectedSuccess: true, desc: 'selling property for cash (price > 0) to rescue debt' },
      { price: 0, swap: true, expectedSuccess: false, desc: 'property swap (price = 0) with zero cash infusion' },
    ])('[TC-IMP164.04/MSS][UC-GAME-056] coordTrade seller debt handling: $desc', ({ price, swap, expectedSuccess }) => {
      const room = createRoom('p1', 'ROOM01');
      room.started = true;
      const p1 = room.players[0]!;
      const p2 = createPlayer('p2');
      room.players.push(p2);
      const reg = new Map<number, string>([[6, 'p1'], [8, 'p2']]);
      const sm = new Map<number, any>();
      const ctx: RoomContext = { room, reg, sm };

      p1.balance = -500;
      p2.balance = 15000;

      const result = coordTrade(ctx, 'p1', 'p1', 'p2', 6, price, swap ? 8 : undefined);

      if (expectedSuccess) {
        expect(result.success).toBe(true);
      } else {
        expect(result.success).toBe(false);
        expect(result.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
      }
    });

    it.each([
      { buyerBalance: -200, sellerBalance: 15000, price: 0, desc: 'buyer balance is negative' },
      { buyerBalance: 15000, sellerBalance: -300, price: 0, desc: 'seller balance is negative and price <= 0' },
    ])('[TC-IMP164.05/MSS][UC-GAME-056] coordRespondTradeOffer rejects when $desc', ({ buyerBalance, sellerBalance, price }) => {
      const room = createRoom('p1', 'ROOM01');
      room.started = true;
      const p1 = room.players[0]!;
      const p2 = createPlayer('p2');
      room.players.push(p2);
      p1.balance = sellerBalance;
      p2.balance = buyerBalance;
      const reg = new Map<number, string>([[6, 'p1'], [8, 'p2']]);
      const sm = new Map<number, any>();
      const ctx: RoomContext = { room, reg, sm };

      const session = pendingTradeManager.createSession(
        room.roomCode,
        'p2',
        'p1',
        6,
        price,
        1000,
        15000,
        8,
      );

      const res = coordRespondTradeOffer(ctx, 'p1', session.offerId, true);
      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
    });
  });

  // =========================================================================
  // FACET 2: State Reactivity & Multi-Turn Teardown (FSM Loops & Cooldowns)
  // =========================================================================
  describe('Facet 2: State Reactivity & Multi-Turn Teardown', () => {
    it('[TC-IMP164.06/MSS][UC-GAME-008] Sequential extra turn consumption: extraTurns = 1 transitions to WaitingRoll, rolledThisTurn = false, extraTurns = 0', () => {
      const room = createRoom('p1', 'ROOM01');
      room.started = true;
      const p1 = room.players[0]!;
      const p2 = createPlayer('p2');
      room.players.push(p2);
      p1.extraTurns = 1;
      room.phase = TurnPhase.PropertyManagement;
      const rolledThisTurnMap = new Map<string, boolean>([[room.roomCode, true]]);

      const nextRoom = executeTurnEnd(room, p1, true, false, room.roomCode, rolledThisTurnMap);

      expect(nextRoom).toBeDefined();
      expect(room.phase).toBe(TurnPhase.WaitingRoll);
      expect(p1.extraTurns).toBe(0);
      expect(room.currentPlayerIndex).toBe(0);
    });

    it('[TC-IMP164.07/MSS][UC-GAME-009] Receiving delta with turnPhase = WaitingRoll on client enables roll action and disables end turn', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        hasRolledThisTurn: true,
        turnPhase: TurnPhase.PropertyManagement,
        isRolling: false,
        pawnAnimationQueue: [],
        activePawnAnimation: null,
      });

      applyDeltaToStore({
        tick: 10,
        cells: [],
        currentTurnPlayerId: 'p1',
        turnPhase: TurnPhase.WaitingRoll,
      }, useGameStore);

      const rollDisabled = isRollActionDisabled({
        isRolling: false,
        isPawnMoving: false,
        isMyTurn: true,
        hasRolledThisTurn: useGameStore.getState().hasRolledThisTurn,
        turnPhase: useGameStore.getState().turnPhase,
      });

      const endDisabled = isEndTurnDisabled({
        isRolling: false,
        isPawnMoving: false,
        isMyTurn: true,
        hasRolledThisTurn: useGameStore.getState().hasRolledThisTurn,
        turnPhase: useGameStore.getState().turnPhase,
      });

      expect(useGameStore.getState().hasRolledThisTurn).toBe(false);
      expect(rollDisabled).toBe(false);
      expect(endDisabled).toBe(true);
    });

    it('[TC-IMP164.08/MSS][UC-GAME-008] Dispatched INTENT_ROLL after consuming extraTurns succeeds without INVALID_PHASE', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('p1');
      mgr.addBot(room.roomCode, 'bot_2');
      mgr.startGame(room.roomCode);

      const p1 = room.players[0]!;
      p1.extraTurns = 1;

      mgr.handleRollDice(room.roomCode, 'p1');
      const endRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_END_TURN' });
      expect(endRes.success).toBe(true);
      expect(room.phase).toBe(TurnPhase.WaitingRoll);

      const rollRes = mgr.handlePlayerIntent(room.roomCode, 'p1', { type: 'INTENT_ROLL' });
      expect(rollRes.success).toBe(true);
      expect(rollRes.reason).toBeUndefined();
    });

    it('[TC-IMP164.09/MSS][UC-GAME-028] executeTurnEnd sets room.lastEventCard = null and Sparse Delta broadcasts tombstone', () => {
      const room = createRoom('p1', 'ROOM01');
      room.started = true;
      const p1 = room.players[0]!;
      const eventCard: EventCardInfo = {
        id: 'CC_PLATE_AUCTION',
        type: 'Chance',
        title: 'Đấu Giá Biển Số',
        description: 'Cộng thêm 1 lượt',
      };
      room.lastEventCard = eventCard;
      room.phase = TurnPhase.PropertyManagement;
      const rolledThisTurnMap = new Map<string, boolean>([[room.roomCode, true]]);

      executeTurnEnd(room, p1, true, false, room.roomCode, rolledThisTurnMap);
      expect(room.lastEventCard).toBeNull();

      const prev: DeltaPayload = { tick: 1, cells: [], lastEventCard: eventCard };
      const next: DeltaPayload = { tick: 2, cells: [], lastEventCard: room.lastEventCard };
      const sparse = buildSparseDelta(prev, next);
      expect(sparse.lastEventCard).toBeNull();
    });

    it('[TC-IMP164.10/MSS][UC-GAME-028] executeTurnRoll clears room.lastEventCard = null at start of new roll', () => {
      const room = createRoom('p1', 'ROOM01');
      room.started = true;
      const p1 = room.players[0]!;
      const eventCard: EventCardInfo = {
        id: 'CC_PLATE_AUCTION',
        type: 'Chance',
        title: 'Đấu Giá Biển Số',
        description: 'Thẻ chưa dọn',
      };
      room.lastEventCard = eventCard;
      room.phase = TurnPhase.WaitingRoll;
      const reg = new Map<number, string>();
      const sm = new Map<number, any>();
      const rolledThisTurn = new Map<string, boolean>();

      executeTurnRoll(room, p1, reg, sm, () => 0.5, () => 0.5, rolledThisTurn, room.roomCode);

      expect(room.lastEventCard).toBeNull();
    });

    it('[TC-IMP164.11/MSS][UC-GAME-009] apply_delta receives lastEventCard: null and updates store to null', () => {
      const activeCard: EventCardInfo = {
        id: 'CC_PLATE_AUCTION',
        type: 'Chance',
        title: 'Đấu Giá Biển Số',
        description: 'Thẻ đang hiển thị',
      };
      useGameStore.setState({ lastEventCard: activeCard });
      expect(useGameStore.getState().lastEventCard).toEqual(activeCard);

      applyDeltaToStore({
        tick: 5,
        cells: [],
        lastEventCard: null,
      }, useGameStore);

      expect(useGameStore.getState().lastEventCard).toBeNull();
    });

    it('[TC-IMP164.12/MSS][UC-BOT-06] Room-level target cooldown blocks Bot 3 from targeting P1 in same round 5 after Bot 2 targeted P1', () => {
      const room = createRoom('p1', 'ROOM01');
      room.started = true;
      const p1 = room.players[0]!;
      const bot2 = createPlayer('bot_2');
      bot2.isBot = true;
      const bot3 = createPlayer('bot_3');
      bot3.isBot = true;
      room.players.push(bot2, bot3);

      const reg = new Map<number, string>([[1, 'bot_3'], [3, 'p1']]);
      const sm = new Map<number, any>();

      (room as any).lastTargetTradeOfferRound = { p1: 5 };

      const intent = findEligibleBotTrade(bot3, room, reg, sm, BotPersonality.Balanced, 5);

      expect(intent).toBeNull();
    });

    it('[TC-IMP164.13/MSS][UC-BOT-06] In round 6, Bot 3 is allowed to send trade offer to P1 after round 5 cooldown expires', () => {
      const room = createRoom('p1', 'ROOM01');
      room.started = true;
      const p1 = room.players[0]!;
      const bot2 = createPlayer('bot_2');
      bot2.isBot = true;
      const bot3 = createPlayer('bot_3');
      bot3.isBot = true;
      room.players.push(bot2, bot3);

      const reg = new Map<number, string>([[1, 'bot_3'], [3, 'p1']]);
      const sm = new Map<number, any>();

      (room as any).lastTargetTradeOfferRound = { p1: 5 };

      const intent = findEligibleBotTrade(bot3, room, reg, sm, BotPersonality.Balanced, 6);

      expect(intent).not.toBeNull();
      expect(intent?.targetPlayerId).toBe('p1');
      expect(intent?.cellIndex).toBe(3);
    });

    it('[TC-IMP164.14/MSS][UC-BOT-06] Persistent Rejection (rejections >= 2) enforces 4-round cooldown on cell', () => {
      const room = createRoom('p1', 'ROOM01');
      room.started = true;
      const p1 = room.players[0]!;
      const bot2 = createPlayer('bot_2');
      bot2.isBot = true;
      room.players.push(bot2);

      const reg = new Map<number, string>([[1, 'bot_2'], [3, 'p1']]);
      const sm = new Map<number, any>();

      bot2.cellTradeRejections = { 3: 2 };
      bot2.cellLastRejectedRound = { 3: 5 };

      const intentBlocked = findEligibleBotTrade(bot2, room, reg, sm, BotPersonality.Balanced, 7);
      expect(intentBlocked).toBeNull();

      const intentAllowed = findEligibleBotTrade(bot2, room, reg, sm, BotPersonality.Balanced, 9);
      expect(intentAllowed).not.toBeNull();
      expect(intentAllowed?.cellIndex).toBe(3);
    });
  });

  // =========================================================================
  // FACET 3: Resource Disposal & Timer Isolation (Tombstones & Flag Mappings)
  // =========================================================================
  describe('Facet 3: Resource Disposal & Timer Isolation', () => {
    it('[TC-IMP164.15/MSS][UC-GAME-028] Normal turn end advancing to next player clears room.lastEventCard to null', () => {
      const room = createRoom('p1', 'ROOM01');
      room.started = true;
      const p1 = room.players[0]!;
      const p2 = createPlayer('p2');
      room.players.push(p2);
      const eventCard: EventCardInfo = {
        id: 'MC_MARKET_BOOM',
        type: 'Market',
        title: 'Thị Trường Khởi Sắc',
        description: 'Tăng giá đất',
      };
      room.lastEventCard = eventCard;
      room.phase = TurnPhase.PropertyManagement;
      const rolledThisTurnMap = new Map<string, boolean>([[room.roomCode, true]]);

      executeTurnEnd(room, p1, true, false, room.roomCode, rolledThisTurnMap);

      expect(room.currentPlayerIndex).toBe(1);
      expect(room.lastEventCard).toBeNull();
    });

    it('[TC-IMP164.16/MSS][UC-GAME-009] apply_delta_players maps extraTurns from PlayerDelta to playersInfo via OPTIONAL_PLAYER_KEYS', () => {
      const state = useGameStore.getState();
      const playersInfoMap = { ...state.playersInfo };

      applyPlayerDeltas(
        {
          tick: 1,
          cells: [],
          players: [
            { id: 'p1', position: 0, balance: 15000, extraTurns: 2 } as any,
          ],
        },
        state,
        playersInfoMap,
        false,
      );

      expect(playersInfoMap['p1']?.extraTurns).toBe(2);
    });

    it('[TC-IMP164.17/MSS][UC-GAME-056] Successful trade clears cellTradeRejections and cellLastRejectedRound for the traded cell', () => {
      const room = createRoom('p1', 'ROOM01');
      room.started = true;
      const p1 = room.players[0]!;
      const bot = createPlayer('bot_2');
      bot.isBot = true;
      room.players.push(bot);

      const reg = new Map<number, string>([[6, 'p1']]);
      const sm = new Map<number, any>();
      const ctx: RoomContext = { room, reg, sm };

      bot.cellTradeRejections = { 6: 2 };
      bot.cellLastRejectedRound = { 6: 5 };

      const session = pendingTradeManager.createSession(
        room.roomCode,
        bot.id,
        p1.id,
        6,
        1500,
        1000,
        15000,
      );

      const res = coordRespondTradeOffer(ctx, p1.id, session.offerId, true);

      expect(res.success).toBe(true);
      expect(bot.cellTradeRejections?.[6]).toBeUndefined();
      expect(bot.cellLastRejectedRound?.[6]).toBeUndefined();
    });
  });

  // =========================================================================
  // FACET 4: Error Defense & Terminal Invariants (Solvency, Bankruptcy & Zero Leak)
  // =========================================================================
  describe('Facet 4: Error Defense & Terminal Invariants', () => {
    it('[TC-IMP164.18/MSS][UC-GAME-053] Bankruptcy with extraTurns > 0 cleans up extraTurns = 0 (zero phantom turns)', () => {
      const room = createRoom('p1', 'ROOM01');
      room.started = true;
      const p1 = room.players[0]!;
      const p2 = createPlayer('p2');
      room.players.push(p2);
      p1.extraTurns = 2;

      declareBankruptcy(room, 'p1', new Map(), new Map());

      expect(p1.bankrupt).toBe(true);
      expect(p1.extraTurns).toBe(0);
    });

    it('[TC-IMP164.19/MSS][UC-BOT-06] Bot-to-Bot trade validates that buyer cannot have negative balance', () => {
      const room = createRoom('bot_1', 'ROOM01');
      room.started = true;
      const bot1 = room.players[0]!;
      bot1.isBot = true;
      const bot2 = createPlayer('bot_2');
      bot2.isBot = true;
      room.players.push(bot2);

      const reg = new Map<number, string>([[6, 'bot_2'], [8, 'bot_1']]);
      const sm = new Map<number, any>();
      const botPersonalities = new Map<string, BotPersonality>([
        ['bot_1', BotPersonality.Aggressive],
        ['bot_2', BotPersonality.Aggressive],
      ]);
      const ctx: RoomContext = { room, reg, sm, botPersonalities };

      bot1.balance = -500;
      bot2.balance = 15000;

      const res = coordTrade(ctx, 'bot_1', 'bot_2', 'bot_1', 6, 0, 8);

      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.INSUFFICIENT_FUNDS);
    });
  });
});
