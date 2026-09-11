// [UC-GAME-008/MSS][UAT-44][EC-04] Turn Timeout Scheduler
// Quản lý bộ đếm timeout phân đoạn vi pha (Phase-Specific Timeout) trên Server cho người chơi Human qua IntentMutex
import type { RoomManager } from '../room_manager.js';
import type { IntentMutex } from './intent_mutex.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
import { TurnPhase } from '../../domain/room.js';

export const PHASE_TIMEOUTS_MS: Record<TurnPhase, number> = {
  [TurnPhase.WaitingRoll]: 15_000,
  [TurnPhase.ActionPhase]: 20_000,
  [TurnPhase.AuctionPhase]: 15_000,
  [TurnPhase.PropertyManagement]: 20_000,
  [TurnPhase.InsolvencyPhase]: 25_000,
  [TurnPhase.HosePhase]: 15_000,
  [TurnPhase.BankruptcyCheck]: 10_000,
  [TurnPhase.TurnEnd]: 5_000,
};

export interface TurnTimeoutSchedulerOptions {
  readonly rooms: RoomManager;
  readonly intentMutex: IntentMutex;
  readonly broadcaster: DeltaBroadcaster;
  readonly onGameOver: (roomCode: string) => void;
  readonly onScheduleBotTurn: (roomCode: string) => void;
  readonly defaultTimeoutMs?: number;
}

export class TurnTimeoutScheduler {
  private readonly rooms: RoomManager;
  private readonly intentMutex: IntentMutex;
  private readonly broadcaster: DeltaBroadcaster;
  private readonly onGameOver: (roomCode: string) => void;
  private readonly onScheduleBotTurn: (roomCode: string) => void;
  private readonly customDefaultTimeoutMs?: number;
  private readonly timeoutMs: number;
  private readonly activeTimers = new Map<string, NodeJS.Timeout>();
  private readonly deadlines = new Map<string, number>();

  constructor(options: TurnTimeoutSchedulerOptions) {
    this.rooms = options.rooms;
    this.intentMutex = options.intentMutex;
    this.broadcaster = options.broadcaster;
    this.onGameOver = options.onGameOver;
    this.onScheduleBotTurn = options.onScheduleBotTurn;
    this.customDefaultTimeoutMs = options.defaultTimeoutMs;
    this.timeoutMs = options.defaultTimeoutMs ?? 60_000;
  }

  getTimeRemaining(roomCode: string): number {
    const deadline = this.deadlines.get(roomCode);
    if (!deadline) return 0;
    return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  }

  clearTimeout(roomCode: string): void {
    const timer = this.activeTimers.get(roomCode);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(roomCode);
    }
    this.deadlines.delete(roomCode);
  }

  scheduleTurnTimeout(roomCode: string, customTimeoutMs?: number): void {
    this.clearTimeout(roomCode);

    const room = this.rooms.getRoom(roomCode);
    if (!room?.started) return;

    const current = room.players[room.currentPlayerIndex];
    if (room.phase !== TurnPhase.AuctionPhase) {
      if (!current || current.isBot || current.bankrupt) return;
    }

    const ms = customTimeoutMs ?? this.customDefaultTimeoutMs ?? PHASE_TIMEOUTS_MS[room.phase] ?? this.timeoutMs;
    const deadline = Date.now() + ms;
    this.deadlines.set(roomCode, deadline);

    const timer = setTimeout(() => {
      this.deadlines.delete(roomCode);
      this.activeTimers.delete(roomCode);

      void this.intentMutex.runExclusive(roomCode, async () => {
        const r = this.rooms.getRoom(roomCode);
        if (!r?.started) return;

        const curr = r.players[r.currentPlayerIndex];
        if (r.phase !== TurnPhase.AuctionPhase && (!curr || curr.isBot || curr.bankrupt)) return;

        // Tự động xử lý hành động an toàn theo từng vi pha khi người chơi AFK
        switch (r.phase) {
          case TurnPhase.WaitingRoll: {
            if (curr) {
              this.rooms.handleRollDice(roomCode, curr.id);
              const rMid = this.rooms.getRoom(roomCode);
              if (rMid?.phase === TurnPhase.PropertyManagement) {
                this.rooms.handleEndTurn(roomCode, curr.id);
              } else if (rMid?.phase === TurnPhase.HosePhase) {
                this.rooms.handleHoseSkip(roomCode, curr.id);
                this.rooms.handleEndTurn(roomCode, curr.id);
              }
            }
            break;
          }
          case TurnPhase.ActionPhase: {
            if (curr) {
              this.rooms.handleDecline(roomCode, curr.id);
              const rMid = this.rooms.getRoom(roomCode);
              if (rMid?.phase === TurnPhase.PropertyManagement) {
                this.rooms.handleEndTurn(roomCode, curr.id);
              }
            }
            break;
          }
          case TurnPhase.AuctionPhase: {
            this.rooms.handleAuctionClose(roomCode);
            const rMid = this.rooms.getRoom(roomCode);
            if (rMid?.phase === TurnPhase.PropertyManagement && curr && !curr.isBot) {
              this.rooms.handleEndTurn(roomCode, curr.id);
            }
            break;
          }
          case TurnPhase.PropertyManagement: {
            if (curr) {
              this.rooms.handleEndTurn(roomCode, curr.id);
            }
            break;
          }
          case TurnPhase.InsolvencyPhase: {
            if (curr) {
              this.rooms.handlePlayerIntent(roomCode, curr.id, { type: 'INTENT_BANKRUPTCY' });
            }
            break;
          }
          case TurnPhase.HosePhase: {
            if (curr) {
              this.rooms.handleHoseSkip(roomCode, curr.id);
              this.rooms.handleEndTurn(roomCode, curr.id);
            }
            break;
          }
          default: {
            if (curr) {
              this.rooms.handleDecline(roomCode, curr.id);
              this.rooms.handleEndTurn(roomCode, curr.id);
            }
            break;
          }
        }

        const rAfter = this.rooms.getRoom(roomCode);
        if (rAfter && rAfter.started && rAfter.players.filter((p) => !p.bankrupt).length <= 1) {
          this.onGameOver(roomCode);
        } else {
          this.broadcaster.broadcastRoomDelta(roomCode);
          const next = rAfter?.players[rAfter.currentPlayerIndex];
          if (next?.isBot && !next.bankrupt) {
            this.onScheduleBotTurn(roomCode);
          } else if (next && !next.isBot && !next.bankrupt) {
            this.scheduleTurnTimeout(roomCode);
          }
        }
      });
    }, ms);

    this.activeTimers.set(roomCode, timer);
  }
}
