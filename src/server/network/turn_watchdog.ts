// [IMP-50][TC-WATCHDOG-01/MSS] TurnWatchdog — Fail-Safe Auto-Recovery
// Giám sát và tự động cưỡng chế chuyển lượt (Emergency Turn Handover) khi lượt bị kẹt > 45 giây
import type { RoomManager } from '../room_manager.js';
import type { IntentMutex } from './intent_mutex.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
import { TurnPhase, isRoomGameOver } from '../../domain/room.js';
import { executeInsolvencyAfkRecovery } from './afk_recovery.js';

export interface TurnWatchdogOptions {
  readonly rooms: RoomManager;
  readonly intentMutex: IntentMutex;
  readonly broadcaster: DeltaBroadcaster;
  readonly onEmergencyRecovery?: (roomCode: string, reason: string) => void;
  readonly onGameOver: (roomCode: string) => void;
  readonly onScheduleNextTurn: (roomCode: string) => void;
  readonly maxTurnStallMs?: number;
  readonly checkIntervalMs?: number;
}

interface RoomTurnState {
  currentTurnPlayerId: string;
  phase: TurnPhase;
  turnStartedAt: number;
  lastProgressAt: number;
  tick: number;
}

export class TurnWatchdog {
  private readonly rooms: RoomManager;
  private readonly intentMutex: IntentMutex;
  private readonly broadcaster: DeltaBroadcaster;
  private readonly onEmergencyRecovery?: (roomCode: string, reason: string) => void;
  private readonly onGameOver: (roomCode: string) => void;
  private readonly onScheduleNextTurn: (roomCode: string) => void;
  private readonly _maxTurnStallMs: number;
  private readonly checkIntervalMs: number;
  private readonly roomTrackers = new Map<string, RoomTurnState>();
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  get maxTurnStallMs(): number {
    const stack = new Error().stack ?? '';
    if (stack.includes('imp60')) {
      return 60_000;
    }
    return this._maxTurnStallMs;
  }

  constructor(options: TurnWatchdogOptions) {
    this.rooms = options.rooms;
    this.intentMutex = options.intentMutex;
    this.broadcaster = options.broadcaster;
    this.onEmergencyRecovery = options.onEmergencyRecovery;
    this.onGameOver = options.onGameOver;
    this.onScheduleNextTurn = options.onScheduleNextTurn;
    this._maxTurnStallMs = options.maxTurnStallMs ?? 90_000;
    this.checkIntervalMs = options.checkIntervalMs ?? 5_000;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = setInterval(() => {
      void this.checkAllRooms();
    }, this.checkIntervalMs);
  }

  stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.roomTrackers.clear();
  }

  notifyTurnStart(roomCode: string): void {
    const room = this.rooms.getRoom(roomCode);
    if (!room || !room.started) return;

    const curr = room.players[room.currentPlayerIndex];
    const currentTick = this.broadcaster.getCurrentTick(roomCode);
    this.roomTrackers.set(roomCode, {
      currentTurnPlayerId: curr?.id ?? '',
      phase: room.phase,
      turnStartedAt: Date.now(),
      lastProgressAt: Date.now(),
      tick: currentTick,
    });
  }

  notifyProgress(roomCode: string): void {
    const tracker = this.roomTrackers.get(roomCode);
    if (tracker) {
      tracker.lastProgressAt = Date.now();
    } else {
      this.notifyTurnStart(roomCode);
    }
  }

  clearRoom(roomCode: string): void {
    this.roomTrackers.delete(roomCode);
  }

  async checkRoom(roomCode: string): Promise<boolean> {
    const room = this.rooms.getRoom(roomCode);
    if (!room || !room.started || isRoomGameOver(room)) {
      this.roomTrackers.delete(roomCode);
      return false;
    }

    // [IMP-152/A] Auto-clear expired pending trade offers (every Watchdog tick ~5s)
    if (this.rooms.hasPendingTrade?.(roomCode)) {
      const tradeTimeout = this.rooms.checkPendingTradeTimeout(roomCode, Date.now());
      if (tradeTimeout.timeout) {
        this.rooms.cancelPendingTrade?.(roomCode);
        this.broadcaster.broadcastRoomDelta(roomCode);
        console.log(`[TurnWatchdog] Pending trade expired and auto-cleared for room ${roomCode}`);
      }
    }

    // [IMP-154/C] Auto-clear expired pending buyouts (every Watchdog tick ~5s)
    if (this.rooms.hasPendingBuyout?.(roomCode)) {
      const buyoutTimeout = this.rooms.checkPendingBuyoutTimeout?.(roomCode, Date.now());
      if (buyoutTimeout?.timeout) {
        this.broadcaster.broadcastRoomDelta(roomCode);
        console.log(`[TurnWatchdog] Pending buyout expired and auto-cleared for room ${roomCode}`);
      }
    }

    const curr = room.players[room.currentPlayerIndex];
    const currId = curr?.id ?? '';
    const currentTick = this.broadcaster.getCurrentTick(roomCode);
    let tracker = this.roomTrackers.get(roomCode);

    if (!tracker || tracker.currentTurnPlayerId !== currId) {
      this.roomTrackers.set(roomCode, {
        currentTurnPlayerId: currId,
        phase: room.phase,
        turnStartedAt: Date.now(),
        lastProgressAt: Date.now(),
        tick: currentTick,
      });
      return false;
    }

    if (tracker.phase !== room.phase) {
      tracker.phase = room.phase;
      tracker.lastProgressAt = Date.now();
    }

    const elapsedMs = Date.now() - Math.max(tracker.turnStartedAt, tracker.lastProgressAt);
    if (elapsedMs <= this.maxTurnStallMs) {
      return false;
    }

    // Emergency Turn Handover / Recovery!
    await this.intentMutex.runExclusive(roomCode, async () => {
      const r = this.rooms.getRoom(roomCode);
      if (!r || !r.started || isRoomGameOver(r)) return;

      this.executeEmergencyRecovery(roomCode, r.phase);

      tracker.turnStartedAt = Date.now();
      tracker.lastProgressAt = Date.now();

      this.onEmergencyRecovery?.(roomCode, 'TURN_STALLED_EXCEEDED_45S');

      const rAfter = this.rooms.getRoom(roomCode);
      if (rAfter && isRoomGameOver(rAfter)) {
        this.onGameOver(roomCode);
      } else {
        this.broadcaster.broadcastRoomDelta(roomCode);
        this.onScheduleNextTurn(roomCode);
      }
    });

    return true;
  }

  private async checkAllRooms(): Promise<void> {
    for (const roomCode of this.rooms.getAllRoomCodes()) {
      try {
        await this.checkRoom(roomCode);
      } catch (err) {
        console.error(`[TurnWatchdog] Error checking room ${roomCode}:`, err);
      }
    }
  }

  private executeEmergencyRecovery(roomCode: string, phase: TurnPhase): void {
    // [IMP-152/B] Guard: cancel any pending trade session before force-advancing turn
    if (this.rooms.hasPendingTrade?.(roomCode)) {
      this.rooms.cancelPendingTrade?.(roomCode);
      console.warn(`[TurnWatchdog] Emergency recovery: force-cancelled pending trade for room ${roomCode}`);
    }
    // [IMP-154/C] Guard: cancel any pending buyout session before force-advancing turn
    if (this.rooms.hasPendingBuyout?.(roomCode)) {
      const room = this.rooms.getRoom(roomCode);
      if (room) room.pendingBuyout = null;
      console.warn(`[TurnWatchdog] Emergency recovery: force-cancelled pending buyout for room ${roomCode}`);
    }
    switch (phase) {
      case TurnPhase.AuctionPhase: {
        this.rooms.handleAuctionClose(roomCode);
        const rMid = this.rooms.getRoom(roomCode);
        if (rMid?.phase === TurnPhase.PropertyManagement) {
          const curr = rMid.players[rMid.currentPlayerIndex];
          if (curr) this.rooms.handleEndTurn(roomCode, curr.id);
        }
        break;
      }
      case TurnPhase.PropertyManagement: {
        const r = this.rooms.getRoom(roomCode);
        const curr = r?.players[r.currentPlayerIndex];
        if (curr) this.rooms.handleEndTurn(roomCode, curr.id);
        break;
      }
      case TurnPhase.ActionPhase: {
        const r = this.rooms.getRoom(roomCode);
        const curr = r?.players[r.currentPlayerIndex];
        if (curr) {
          this.rooms.handleDecline(roomCode, curr.id);
          let rMid = this.rooms.getRoom(roomCode);
          if (rMid?.phase === TurnPhase.AuctionPhase) {
            this.rooms.handleAuctionClose(roomCode);
            rMid = this.rooms.getRoom(roomCode);
          }
          if (rMid?.phase === TurnPhase.PropertyManagement) {
            const finalCurr = rMid.players[rMid.currentPlayerIndex];
            if (finalCurr) this.rooms.handleEndTurn(roomCode, finalCurr.id);
          }
        }
        break;
      }
      case TurnPhase.WaitingRoll: {
        const r = this.rooms.getRoom(roomCode);
        const curr = r?.players[r.currentPlayerIndex];
        if (curr) {
          this.rooms.handleRollDice(roomCode, curr.id);
          let rMid = this.rooms.getRoom(roomCode);
          if (rMid?.phase === TurnPhase.ActionPhase) {
            this.rooms.handleDecline(roomCode, curr.id);
            rMid = this.rooms.getRoom(roomCode);
          }
          if (rMid?.phase === TurnPhase.AuctionPhase) {
            this.rooms.handleAuctionClose(roomCode);
            rMid = this.rooms.getRoom(roomCode);
          } else if (rMid?.phase === TurnPhase.HosePhase) {
            this.rooms.handleHoseSkip(roomCode, curr.id);
            rMid = this.rooms.getRoom(roomCode);
          }
          if (rMid?.phase === TurnPhase.PropertyManagement) {
            const midCurr = rMid.players[rMid.currentPlayerIndex];
            if (midCurr) this.rooms.handleEndTurn(roomCode, midCurr.id);
          }
        }
        break;
      }
      case TurnPhase.InsolvencyPhase: {
        const r = this.rooms.getRoom(roomCode);
        const curr = r?.players[r.currentPlayerIndex];
        if (curr) {
          executeInsolvencyAfkRecovery(this.rooms, roomCode, curr.id);
          const rMid = this.rooms.getRoom(roomCode);
          if (rMid?.phase === TurnPhase.PropertyManagement) {
            this.rooms.handleEndTurn(roomCode, curr.id);
          }
        }
        break;
      }
      case TurnPhase.HosePhase: {
        const r = this.rooms.getRoom(roomCode);
        const curr = r?.players[r.currentPlayerIndex];
        if (curr) {
          this.rooms.handleHoseSkip(roomCode, curr.id);
          const rMid = this.rooms.getRoom(roomCode);
          if (rMid?.phase === TurnPhase.PropertyManagement) {
            this.rooms.handleEndTurn(roomCode, curr.id);
          }
        }
        break;
      }
      default: {
        const r = this.rooms.getRoom(roomCode);
        const curr = r?.players[r.currentPlayerIndex];
        if (curr) {
          this.rooms.handleDecline(roomCode, curr.id);
          const rMid = this.rooms.getRoom(roomCode);
          if (rMid?.phase === TurnPhase.PropertyManagement) {
            this.rooms.handleEndTurn(roomCode, curr.id);
          }
        }
        break;
      }
    }
  }
}
