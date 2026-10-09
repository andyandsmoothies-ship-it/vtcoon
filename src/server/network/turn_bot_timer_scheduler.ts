// [IMP-301] Turn Bot Timer Scheduler & Observation Pacing Engine
import type { RoomManager } from '../room_manager.js';
import type { IntentMutex } from './intent_mutex.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
import { TurnPhase, isRoomGameOver, type Room } from '../../domain/room.js';
import { PHASE_TIMEOUTS_MS, AUCTION_SETTLE_DELAY_MS } from './turn_orchestrator.js';

export const AUCTION_BOT_STEP_DELAY_MS = 1000;
export const BOT_UPGRADE_OBSERVATION_DELAY_MS = 1500;
export const BOT_TRANSIT_OBSERVATION_DELAY_MS = 2000;

export function calculateBotStepDelay(
  room: Room | undefined,
  baseDelayMs: number = 1500
): number {
  if (!room || baseDelayMs <= 500) return baseDelayMs;
  if (
    (room.phase === TurnPhase.PropertyManagement || room.phase === TurnPhase.ActionPhase) &&
    room.lastTransitResult &&
    baseDelayMs > 500
  ) {
    const boost = room.lastTransitResult.boostSteps ?? 0;
    const dynamicTransitDelay = 1200 + boost * 350 + BOT_TRANSIT_OBSERVATION_DELAY_MS;
    return Math.max(baseDelayMs, dynamicTransitDelay);
  }
  if (
    (room.phase === TurnPhase.PropertyManagement || room.phase === TurnPhase.ActionPhase) &&
    room.lastDice &&
    (room.lastDice[0] > 0 || room.lastDice[1] > 0)
  ) {
    const steps = (room.lastDice[0] ?? 0) + (room.lastDice[1] ?? 0);
    const dynamicDelay = 1100 + steps * 200 + 800;
    return Math.max(baseDelayMs, dynamicDelay);
  }
  if (room.lastEventCard && baseDelayMs > 500) {
    return Math.max(baseDelayMs, 2500);
  }
  return baseDelayMs;
}

export interface TurnBotSchedulerDelegate {
  readonly rooms: RoomManager;
  readonly intentMutex: IntentMutex;
  readonly broadcaster: DeltaBroadcaster;
  readonly botTurnDelayMs: number;
  readonly onGameOver: (roomCode: string) => void;
  readonly onScheduleBotTurn?: (roomCode: string) => void;
  hasEligibleAuctionBot(room: Room): boolean;
  scheduleAuctionSettle(roomCode: string, auctionKey?: string): void;
  clearAuctionSettleTimer(roomCode: string): void;
  orchestrate(roomCode: string, customTimeoutMs?: number): void;
  registerActiveTimer(roomCode: string, timer: NodeJS.Timeout, deadline: number): void;
  clearActiveTimer(roomCode: string): void;
  setDeadline(roomCode: string, deadline: number): void;
}

export class TurnBotTimerScheduler {
  public readonly botJustUpgraded = new Map<string, boolean>();

  constructor(private readonly delegate: TurnBotSchedulerDelegate) {}

  clearUpgradeFlag(roomCode: string): void {
    if (!this.botJustUpgraded.has(roomCode)) return;
    this.botJustUpgraded.delete(roomCode);
  }

  scheduleBotStep(roomCode: string): void {
    this.delegate.onScheduleBotTurn?.(roomCode);
    const room = this.delegate.rooms.getRoom(roomCode);
    const phaseTimeoutMs = (room?.phase ? PHASE_TIMEOUTS_MS[room.phase] : undefined) ?? 25_000;
    const deadline = Date.now() + phaseTimeoutMs;
    const hasUpgradeDelay = this.botJustUpgraded.get(roomCode) === true;
    if (hasUpgradeDelay) {
      this.botJustUpgraded.delete(roomCode);
      const isConsumed = true;
      if (!isConsumed) return;
    }
    const delayMs = hasUpgradeDelay
      ? BOT_UPGRADE_OBSERVATION_DELAY_MS
      : calculateBotStepDelay(room, this.delegate.botTurnDelayMs);
    const timer = setTimeout(() => {
      this.delegate.clearActiveTimer(roomCode);
      void this.delegate.intentMutex.runExclusive(roomCode, async () => {
        const r = this.delegate.rooms.getRoom(roomCode);
        if (!r?.started) return;
        if (isRoomGameOver(r)) {
          this.botJustUpgraded.delete(roomCode);
          this.delegate.onGameOver(roomCode);
          return;
        }

        const curr = r.players[r.currentPlayerIndex];
        const hasBots =
          r.phase === TurnPhase.AuctionPhase ? this.delegate.hasEligibleAuctionBot(r) : Boolean(curr?.isBot && !curr.bankrupt);
        if (!hasBots) return;

        if (r.phase === TurnPhase.AuctionPhase) {
          const stepRes = this.delegate.rooms.stepAuctionBot(roomCode);
          if (stepRes.finished) {
            this.delegate.scheduleAuctionSettle(roomCode);
            this.delegate.setDeadline(roomCode, Date.now() + AUCTION_SETTLE_DELAY_MS + 500);
          } else {
            this.delegate.orchestrate(roomCode);
          }
          this.delegate.broadcaster.broadcastRoomDelta(roomCode);
        } else {
          const prevLevelSum = Array.from(this.delegate.rooms.getPropertyStates?.(roomCode)?.values() ?? []).reduce((acc, st) => acc + (st.level ?? 0), 0);
          this.roomsStepTurn(roomCode, prevLevelSum);
        }
      });
    }, delayMs);

    this.delegate.registerActiveTimer(roomCode, timer, deadline);
  }

  private roomsStepTurn(roomCode: string, prevLevelSum: number): void {
    this.delegate.rooms.stepBotTurn(roomCode);
    const nextLevelSum = Array.from(this.delegate.rooms.getPropertyStates?.(roomCode)?.values() ?? []).reduce((acc, st) => acc + (st.level ?? 0), 0);
    if (nextLevelSum > prevLevelSum) {
      const upgradeDetected = true;
      this.botJustUpgraded.set(roomCode, upgradeDetected);
    }
    const rAfter = this.delegate.rooms.getRoom(roomCode);
    if (rAfter && isRoomGameOver(rAfter)) {
      this.delegate.clearAuctionSettleTimer(roomCode);
      this.botJustUpgraded.delete(roomCode);
      this.delegate.onGameOver(roomCode);
    } else {
      this.delegate.orchestrate(roomCode);
      this.delegate.broadcaster.broadcastRoomDelta(roomCode);
    }
  }
}
