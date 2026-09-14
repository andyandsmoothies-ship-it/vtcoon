// [UC-GAME-008/MSS][UAT-44][EC-04][IMP-50] Turn Timeout Scheduler (Compatibility Adapter)
// Ủy quyền điều phối tới Unified TurnOrchestrator, bảo tồn tương thích ngược 100%
import type { RoomManager } from '../room_manager.js';
import type { IntentMutex } from './intent_mutex.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
import { TurnOrchestrator, PHASE_TIMEOUTS_MS } from './turn_orchestrator.js';

export { PHASE_TIMEOUTS_MS };

export interface TurnTimeoutSchedulerOptions {
  readonly rooms: RoomManager;
  readonly intentMutex: IntentMutex;
  readonly broadcaster: DeltaBroadcaster;
  readonly onGameOver: (roomCode: string) => void;
  readonly onScheduleBotTurn?: (roomCode: string) => void;
  readonly defaultTimeoutMs?: number;
}

export class TurnTimeoutScheduler {
  private readonly orchestrator: TurnOrchestrator;

  constructor(optionsOrOrchestrator: TurnTimeoutSchedulerOptions | TurnOrchestrator) {
    if (optionsOrOrchestrator instanceof TurnOrchestrator) {
      this.orchestrator = optionsOrOrchestrator;
    } else {
      this.orchestrator = new TurnOrchestrator({
        rooms: optionsOrOrchestrator.rooms,
        intentMutex: optionsOrOrchestrator.intentMutex,
        broadcaster: optionsOrOrchestrator.broadcaster,
        onGameOver: optionsOrOrchestrator.onGameOver,
        onScheduleBotTurn: optionsOrOrchestrator.onScheduleBotTurn,
        defaultTimeoutMs: optionsOrOrchestrator.defaultTimeoutMs,
      });
    }
  }

  getTimeRemaining(roomCode: string): number {
    return this.orchestrator.getTimeRemaining(roomCode);
  }

  clearTimeout(roomCode: string): void {
    this.orchestrator.clearRoom(roomCode);
  }

  scheduleTurnTimeout(roomCode: string, customTimeoutMs?: number): void {
    this.orchestrator.orchestrate(roomCode, customTimeoutMs);
  }
}
