// [UC-GAME-005/MSS][UC-GAME-008/MSS][IMP-50] Unified Turn Orchestrator
// Hợp nhất Bot AI Scheduler và Turn Timeout Scheduler thành một bộ điều phối duy nhất
import type { RoomManager } from '../room_manager.js';
import type { IntentMutex } from './intent_mutex.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
import { TurnPhase, isRoomGameOver, type Room } from '../../domain/room.js';
import { executeInsolvencyAfkRecovery } from './afk_recovery.js';

export const PHASE_TIMEOUTS_MS: Record<TurnPhase, number> = {
  [TurnPhase.WaitingRoll]: 25_000,
  [TurnPhase.ActionPhase]: 35_000,
  [TurnPhase.AuctionPhase]: 20_000,
  [TurnPhase.PropertyManagement]: 30_000,
  [TurnPhase.InsolvencyPhase]: 45_000,
  [TurnPhase.HosePhase]: 25_000,
  [TurnPhase.BankruptcyCheck]: 10_000,
  [TurnPhase.TurnEnd]: 5_000,
};

export const HUMAN_PHASE_TIMEOUTS_MS: Record<TurnPhase, number> = {
  ...PHASE_TIMEOUTS_MS,
  [TurnPhase.WaitingRoll]: 45_000,
};

export function calculateBotStepDelay(
  room: Room | undefined,
  baseDelayMs: number = 1500
): number {
  if (!room || baseDelayMs <= 500) return baseDelayMs;
  if (
    (room.phase === TurnPhase.PropertyManagement || room.phase === TurnPhase.ActionPhase) &&
    room.lastDice &&
    (room.lastDice[0] > 0 || room.lastDice[1] > 0)
  ) {
    const steps = (room.lastDice[0] ?? 0) + (room.lastDice[1] ?? 0);
    const dynamicDelay = 1100 + steps * 200 + 800;
    return Math.max(baseDelayMs, dynamicDelay);
  }
  return baseDelayMs;
}

export interface TurnOrchestratorOptions {
  readonly rooms: RoomManager;
  readonly intentMutex: IntentMutex;
  readonly broadcaster: DeltaBroadcaster;
  readonly onGameOver: (roomCode: string) => void;
  readonly onScheduleTurnTimeout?: (roomCode: string) => void;
  readonly onScheduleBotTurn?: (roomCode: string) => void;
  readonly botTurnDelayMs?: number;
  readonly defaultTimeoutMs?: number;
}

export class TurnOrchestrator {
  private readonly rooms: RoomManager;
  private readonly intentMutex: IntentMutex;
  private readonly broadcaster: DeltaBroadcaster;
  private readonly onGameOver: (roomCode: string) => void;
  private readonly onScheduleTurnTimeout?: (roomCode: string) => void;
  private readonly onScheduleBotTurn?: (roomCode: string) => void;
  private readonly botTurnDelayMs: number;
  private readonly defaultTimeoutMs: number;
  private readonly customDefaultTimeoutMs?: number;
  private readonly activeTimers = new Map<string, NodeJS.Timeout>();
  private readonly deadlines = new Map<string, number>();

  constructor(options: TurnOrchestratorOptions) {
    this.rooms = options.rooms;
    this.intentMutex = options.intentMutex;
    this.broadcaster = options.broadcaster;
    this.onGameOver = options.onGameOver;
    this.onScheduleTurnTimeout = options.onScheduleTurnTimeout;
    this.onScheduleBotTurn = options.onScheduleBotTurn;
    this.botTurnDelayMs = options.botTurnDelayMs ?? 1500;
    this.customDefaultTimeoutMs = options.defaultTimeoutMs;
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 60_000;
  }

  getTimeRemaining(roomCode: string): number {
    const deadline = this.deadlines.get(roomCode);
    if (!deadline) return 0;
    return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  }

  clearRoom(roomCode: string): void {
    const timer = this.activeTimers.get(roomCode);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(roomCode);
    }
    this.deadlines.delete(roomCode);
    this.rooms.clearRoomTimers(roomCode);
  }

  clearTimeout(roomCode: string): void {
    this.clearRoom(roomCode);
  }

  hasEligibleAuctionBot(room: Room): boolean {
    const declinedId = room.currentAuction?.declinedPlayerId;
    const passed = room.currentAuction?.passedPlayers;
    const highestBidder = room.currentAuction?.highestBidder;
    return room.players.some(
      (p) => p.isBot && !p.bankrupt && p.id !== declinedId && p.id !== highestBidder && !passed?.has(p.id),
    );
  }

  orchestrate(roomCode: string, customTimeoutMs?: number): void {
    this.clearRoom(roomCode);

    const room = this.rooms.getRoom(roomCode);
    if (!room?.started) return;

    if (room.phase === TurnPhase.AuctionPhase) {
      if (this.hasEligibleAuctionBot(room)) {
        this.scheduleBotStep(roomCode);
      } else {
        this.onScheduleTurnTimeout?.(roomCode);
        this.scheduleAuctionTimeoutStep(roomCode, customTimeoutMs);
      }
      return;
    }

    const current = room.players[room.currentPlayerIndex];
    if (!current || current.bankrupt) return;

    if (current.isBot) {
      this.scheduleBotStep(roomCode);
    } else {
      this.onScheduleTurnTimeout?.(roomCode);
      this.scheduleHumanTimeoutStep(roomCode, customTimeoutMs);
    }
  }

  scheduleTurn(roomCode: string): void {
    this.orchestrate(roomCode);
  }

  scheduleBotTurn(roomCode: string): void {
    this.orchestrate(roomCode);
  }

  scheduleTurnTimeout(roomCode: string, customTimeoutMs?: number): void {
    this.orchestrate(roomCode, customTimeoutMs);
  }

  private scheduleBotStep(roomCode: string): void {
    this.onScheduleBotTurn?.(roomCode);
    const room = this.rooms.getRoom(roomCode);
    const delayMs = calculateBotStepDelay(room, this.botTurnDelayMs);
    const timer = setTimeout(() => {
      this.activeTimers.delete(roomCode);
      void this.intentMutex.runExclusive(roomCode, async () => {
        const r = this.rooms.getRoom(roomCode);
        if (!r?.started) return;
        if (isRoomGameOver(r)) {
          this.onGameOver(roomCode);
          return;
        }

        const curr = r.players[r.currentPlayerIndex];
        const hasBots =
          r.phase === TurnPhase.AuctionPhase ? this.hasEligibleAuctionBot(r) : Boolean(curr?.isBot && !curr.bankrupt);
        if (!hasBots) return;

        if (r.phase === TurnPhase.AuctionPhase) {
          this.rooms.resolveAuctionBots(roomCode);
        } else {
          this.rooms.stepBotTurn(roomCode);
        }
        const rAfter = this.rooms.getRoom(roomCode);
        if (rAfter && isRoomGameOver(rAfter)) {
          this.onGameOver(roomCode);
        } else {
          this.broadcaster.broadcastRoomDelta(roomCode);
          this.orchestrate(roomCode);
        }
      });
    }, delayMs);

    this.activeTimers.set(roomCode, timer);
    this.rooms.registerTimer(roomCode, timer);
  }

  private scheduleAuctionTimeoutStep(roomCode: string, customTimeoutMs?: number): void {
    const ms = customTimeoutMs ?? this.customDefaultTimeoutMs ?? PHASE_TIMEOUTS_MS[TurnPhase.AuctionPhase];
    const deadline = Date.now() + ms;
    this.deadlines.set(roomCode, deadline);

    const timer = setTimeout(() => {
      this.deadlines.delete(roomCode);
      this.activeTimers.delete(roomCode);

      void this.intentMutex.runExclusive(roomCode, async () => {
        const r = this.rooms.getRoom(roomCode);
        if (!r?.started || r.phase !== TurnPhase.AuctionPhase) return;
        if (isRoomGameOver(r)) {
          this.onGameOver(roomCode);
          return;
        }

        this.rooms.handleAuctionClose(roomCode);
        const rMid = this.rooms.getRoom(roomCode);
        const curr = rMid?.players[rMid.currentPlayerIndex];
        if (rMid?.phase === TurnPhase.PropertyManagement && curr?.isBot) {
          this.rooms.handleEndTurn(roomCode, curr.id);
        }

        const rAfter = this.rooms.getRoom(roomCode);
        if (rAfter && isRoomGameOver(rAfter)) {
          this.onGameOver(roomCode);
        } else {
          this.broadcaster.broadcastRoomDelta(roomCode);
          this.orchestrate(roomCode);
        }
      });
    }, ms);

    this.activeTimers.set(roomCode, timer);
    this.rooms.registerTimer(roomCode, timer);
  }

  private scheduleHumanTimeoutStep(roomCode: string, customTimeoutMs?: number): void {
    const room = this.rooms.getRoom(roomCode);
    if (!room) return;

    const ms =
      customTimeoutMs ??
      this.customDefaultTimeoutMs ??
      HUMAN_PHASE_TIMEOUTS_MS[room.phase] ??
      PHASE_TIMEOUTS_MS[room.phase] ??
      this.defaultTimeoutMs;
    const deadline = Date.now() + ms;
    this.deadlines.set(roomCode, deadline);

    const timer = setTimeout(() => {
      this.deadlines.delete(roomCode);
      this.activeTimers.delete(roomCode);

      void this.intentMutex.runExclusive(roomCode, async () => {
        const r = this.rooms.getRoom(roomCode);
        if (!r?.started) return;
        if (isRoomGameOver(r)) {
          this.onGameOver(roomCode);
          return;
        }

        const curr = r.players[r.currentPlayerIndex];
        if (!curr || curr.isBot || curr.bankrupt) return;

        this.executeSafeAfkAction(roomCode, r.phase, curr.id);

        const rAfter = this.rooms.getRoom(roomCode);
        if (rAfter && isRoomGameOver(rAfter)) {
          this.onGameOver(roomCode);
        } else {
          this.broadcaster.broadcastRoomDelta(roomCode);
          this.orchestrate(roomCode);
        }
      });
    }, ms);

    this.activeTimers.set(roomCode, timer);
    this.rooms.registerTimer(roomCode, timer);
  }

  private executeSafeAfkAction(roomCode: string, phase: TurnPhase, playerId: string): void {
    switch (phase) {
      case TurnPhase.WaitingRoll: {
        const room = this.rooms.getRoom(roomCode);
        const player = room?.players.find((p) => p.id === playerId);
        if (player && player.wasInAudit === true) {
          player.wasInAudit = false;
          return;
        }
        this.rooms.handleRollDice(roomCode, playerId);
        const rMid = this.rooms.getRoom(roomCode);
        if (rMid?.phase === TurnPhase.PropertyManagement) {
          this.rooms.handleEndTurn(roomCode, playerId);
        } else if (rMid?.phase === TurnPhase.HosePhase) {
          this.rooms.handleHoseSkip(roomCode, playerId);
          this.rooms.handleEndTurn(roomCode, playerId);
        } else if (rMid?.phase === TurnPhase.ActionPhase) {
          this.rooms.handleDecline(roomCode, playerId);
          const rAfterDecline = this.rooms.getRoom(roomCode);
          if (rAfterDecline?.phase === TurnPhase.PropertyManagement) {
            this.rooms.handleEndTurn(roomCode, playerId);
          }
        }
        break;
      }
      case TurnPhase.ActionPhase: {
        this.rooms.handleDecline(roomCode, playerId);
        const rMid = this.rooms.getRoom(roomCode);
        if (rMid?.phase === TurnPhase.PropertyManagement) {
          this.rooms.handleEndTurn(roomCode, playerId);
        }
        break;
      }
      case TurnPhase.AuctionPhase: {
        this.rooms.handleAuctionClose(roomCode);
        const rMid = this.rooms.getRoom(roomCode);
        if (rMid?.phase === TurnPhase.PropertyManagement) {
          this.rooms.handleEndTurn(roomCode, playerId);
        }
        break;
      }
      case TurnPhase.PropertyManagement: {
        this.rooms.handleEndTurn(roomCode, playerId);
        break;
      }
      case TurnPhase.InsolvencyPhase: {
        executeInsolvencyAfkRecovery(this.rooms, roomCode, playerId);
        const rMid = this.rooms.getRoom(roomCode);
        if (rMid?.phase === TurnPhase.PropertyManagement) {
          this.rooms.handleEndTurn(roomCode, playerId);
        }
        break;
      }
      case TurnPhase.HosePhase: {
        this.rooms.handleHoseSkip(roomCode, playerId);
        this.rooms.handleEndTurn(roomCode, playerId);
        break;
      }
      default: {
        this.rooms.handleDecline(roomCode, playerId);
        this.rooms.handleEndTurn(roomCode, playerId);
        break;
      }
    }
  }
}
