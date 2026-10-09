// [UC-GAME-005/MSS][UC-GAME-008/MSS][IMP-50] Unified Turn Orchestrator
// Hợp nhất Bot AI Scheduler và Turn Timeout Scheduler thành một bộ điều phối duy nhất
import type { RoomManager } from '../room_manager.js';
import type { IntentMutex } from './intent_mutex.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
import { TurnPhase, isRoomGameOver, type Room } from '../../domain/room.js';
import { executeSafeAfkAction as executeSafeAfkActionHelper } from './afk_recovery.js';

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

export const AUCTION_SETTLE_DELAY_MS = 2500;
export {
  calculateBotStepDelay,
  AUCTION_BOT_STEP_DELAY_MS,
  BOT_UPGRADE_OBSERVATION_DELAY_MS,
  BOT_TRANSIT_OBSERVATION_DELAY_MS,
  TurnBotTimerScheduler,
  type TurnBotSchedulerDelegate,
} from './turn_bot_timer_scheduler.js';
import {
  AUCTION_BOT_STEP_DELAY_MS,
  TurnBotTimerScheduler,
} from './turn_bot_timer_scheduler.js';

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
  public static readonly AUCTION_SETTLE_DELAY_MS = AUCTION_SETTLE_DELAY_MS;
  public static readonly AUCTION_BOT_STEP_DELAY_MS = AUCTION_BOT_STEP_DELAY_MS;

  readonly rooms: RoomManager;
  readonly intentMutex: IntentMutex;
  readonly broadcaster: DeltaBroadcaster;
  readonly onGameOver: (roomCode: string) => void;
  readonly onScheduleTurnTimeout?: (roomCode: string) => void;
  readonly onScheduleBotTurn?: (roomCode: string) => void;
  readonly botTurnDelayMs: number;
  private readonly defaultTimeoutMs: number;
  private readonly customDefaultTimeoutMs?: number;
  private readonly activeTimers = new Map<string, NodeJS.Timeout>();
  private readonly deadlines = new Map<string, number>();
  private readonly auctionSettleTimers = new Map<string, { timer: NodeJS.Timeout; auctionKey: string }>();
  private readonly botScheduler: TurnBotTimerScheduler;

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
    this.botScheduler = new TurnBotTimerScheduler(this);
  }

  public get botJustUpgraded(): Map<string, boolean> {
    return this.botScheduler.botJustUpgraded;
  }

  registerActiveTimer(roomCode: string, timer: NodeJS.Timeout, deadline: number): void {
    this.deadlines.set(roomCode, deadline);
    this.activeTimers.set(roomCode, timer);
    this.rooms.registerTimer(roomCode, timer);
  }

  clearActiveTimer(roomCode: string): void {
    this.deadlines.delete(roomCode);
    this.activeTimers.delete(roomCode);
  }

  setDeadline(roomCode: string, deadline: number): void {
    if (deadline <= 0) return;
    this.deadlines.set(roomCode, deadline);
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

  clearAuctionSettleTimer(roomCode: string): void {
    const existing = this.auctionSettleTimers.get(roomCode);
    if (existing) {
      clearTimeout(existing.timer);
      this.auctionSettleTimers.delete(roomCode);
    }
  }

  destroyRoom(roomCode: string): void {
    this.clearRoom(roomCode);
    this.clearAuctionSettleTimer(roomCode);
    this.activeTimers.delete(roomCode);
    this.deadlines.delete(roomCode);
    this.auctionSettleTimers.delete(roomCode);
    this.botScheduler.clearUpgradeFlag(roomCode);
  }

  scheduleAuctionSettle(roomCode: string, auctionKey?: string): void {
    this.clearAuctionSettleTimer(roomCode);
    const currentRes = this.rooms.getLastAuctionResult(roomCode);
    const effectiveKey =
      auctionKey ??
      (currentRes
        ? `${currentRes.cellIndex}:${currentRes.winnerId}:${currentRes.winningBid}`
        : 'unknown');

    this.deadlines.set(roomCode, Date.now() + AUCTION_SETTLE_DELAY_MS + 500);

    const timer = setTimeout(() => {
      this.auctionSettleTimers.delete(roomCode);
      const latestRes = this.rooms.getLastAuctionResult(roomCode);
      const latestKey = latestRes
        ? `${latestRes.cellIndex}:${latestRes.winnerId}:${latestRes.winningBid}`
        : 'unknown';
      if (auctionKey !== undefined && auctionKey !== latestKey) {
        return;
      }
      this.rooms.settleAuction(roomCode);
      this.orchestrate(roomCode);
      this.broadcaster.broadcastRoomDelta(roomCode);
    }, AUCTION_SETTLE_DELAY_MS);

    this.auctionSettleTimers.set(roomCode, { timer, auctionKey: effectiveKey });
  }

  hasEligibleAuctionBot(room: Room): boolean {
    const session = this.rooms.getAuctionSession(room.roomCode) ?? room.currentAuction;
    const declinedId = session?.declinedPlayerId;
    const passed = session?.passedPlayers;
    const highestBidder = session?.highestBidder;
    return room.players.some(
      (p) => p.isBot && !p.bankrupt && p.id !== declinedId && p.id !== highestBidder && !passed?.has(p.id),
    );
  }

  orchestrate(roomCode: string, customTimeoutMs?: number): void {
    this.clearRoom(roomCode);

    const room = this.rooms.getRoom(roomCode);
    if (!room?.started) return;

    // [IMP-227] Transient Settle Guard: Nếu phiên đấu giá vừa đóng đồng bộ và có lastAuctionResult chưa settle,
    // tự động gắn bộ định thời thanh toán (settle timer) để dọn sạch state và phát sóng tombstone.
    // Đã kiểm chứng: clearRoom() không xóa auctionSettleTimers, scheduleAuctionSettle có tính idempotent.
    if (room.lastAuctionResult && !this.auctionSettleTimers.has(roomCode)) {
      this.scheduleAuctionSettle(roomCode);
    }

    if (room.phase === TurnPhase.AuctionPhase) {
      if (this.hasEligibleAuctionBot(room)) {
        this.botScheduler.scheduleBotStep(roomCode);
      } else {
        this.onScheduleTurnTimeout?.(roomCode);
        const timeoutMs = customTimeoutMs && customTimeoutMs > 5000 ? customTimeoutMs : undefined;
        this.scheduleAuctionTimeoutStep(roomCode, timeoutMs);
      }
      return;
    }

    if (room.phase === TurnPhase.InsolvencyPhase) {
      const debtor = room.pendingInsolvencyDebtorId
        ? room.players.find((p) => p.id === room.pendingInsolvencyDebtorId)
        : room.players[room.currentPlayerIndex];
      if (debtor && !debtor.isBot && !debtor.bankrupt) {
        this.botScheduler.clearUpgradeFlag(roomCode);
        this.onScheduleTurnTimeout?.(roomCode);
        this.scheduleHumanTimeoutStep(roomCode, customTimeoutMs);
        return;
      }
    }

    const current = room.players[room.currentPlayerIndex];
    if (!current || current.bankrupt) return;

    if (current.isBot) {
      this.botScheduler.scheduleBotStep(roomCode);
      return;
    }
    this.botScheduler.clearUpgradeFlag(roomCode);
    this.onScheduleTurnTimeout?.(roomCode);
    this.scheduleHumanTimeoutStep(roomCode, customTimeoutMs);
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

  // Bot step scheduling delegated to TurnBotTimerScheduler

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
          this.clearAuctionSettleTimer(roomCode);
          this.onGameOver(roomCode);
          return;
        }

        this.rooms.handleAuctionClose(roomCode);
        this.scheduleAuctionSettle(roomCode);
        const rMid = this.rooms.getRoom(roomCode);
        const curr = rMid?.players[rMid.currentPlayerIndex];
        if (rMid?.phase === TurnPhase.PropertyManagement && curr?.isBot) {
          this.rooms.handleEndTurn(roomCode, curr.id);
        }

        const rAfter = this.rooms.getRoom(roomCode);
        if (rAfter && isRoomGameOver(rAfter)) {
          this.clearAuctionSettleTimer(roomCode);
          this.onGameOver(roomCode);
        } else {
          this.orchestrate(roomCode);
          this.broadcaster.broadcastRoomDelta(roomCode);
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
          this.clearAuctionSettleTimer(roomCode);
          this.onGameOver(roomCode);
          return;
        }

        const targetPlayer = r.phase === TurnPhase.InsolvencyPhase && r.pendingInsolvencyDebtorId
          ? r.players.find((p) => p.id === r.pendingInsolvencyDebtorId)
          : r.players[r.currentPlayerIndex];
        if (!targetPlayer || targetPlayer.isBot || targetPlayer.bankrupt) return;

        this.executeSafeAfkAction(roomCode, r.phase, targetPlayer.id);

        const rAfter = this.rooms.getRoom(roomCode);
        if (rAfter && isRoomGameOver(rAfter)) {
          this.clearAuctionSettleTimer(roomCode);
          this.onGameOver(roomCode);
        } else {
          this.orchestrate(roomCode);
          this.broadcaster.broadcastRoomDelta(roomCode);
        }
      });
    }, ms);

    this.activeTimers.set(roomCode, timer);
    this.rooms.registerTimer(roomCode, timer);
  }

  executeSafeAfkAction(roomCode: string, phase: TurnPhase, playerId: string): void {
    executeSafeAfkActionHelper(this.rooms, roomCode, phase, playerId, (rc) => this.scheduleAuctionSettle(rc));
  }
}
