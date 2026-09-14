// [UC-GAME-005/MSS][UC-GAME-008/MSS][IMP-50] Bot Turn Scheduler (Compatibility Adapter)
// Ủy quyền điều phối tới Unified TurnOrchestrator, bảo tồn tương thích ngược 100%
import type { RoomManager } from '../room_manager.js';
import type { IntentMutex } from './intent_mutex.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
import { TurnOrchestrator } from './turn_orchestrator.js';

export interface BotTurnSchedulerOptions {
  readonly rooms: RoomManager;
  readonly intentMutex: IntentMutex;
  readonly broadcaster: DeltaBroadcaster;
  readonly onGameOver: (roomCode: string) => void;
  readonly onScheduleTurnTimeout?: (roomCode: string) => void;
  readonly botTurnDelayMs?: number;
}

export class BotTurnScheduler {
  private readonly orchestrator: TurnOrchestrator;

  constructor(optionsOrOrchestrator: BotTurnSchedulerOptions | TurnOrchestrator) {
    if (optionsOrOrchestrator instanceof TurnOrchestrator) {
      this.orchestrator = optionsOrOrchestrator;
    } else {
      this.orchestrator = new TurnOrchestrator({
        rooms: optionsOrOrchestrator.rooms,
        intentMutex: optionsOrOrchestrator.intentMutex,
        broadcaster: optionsOrOrchestrator.broadcaster,
        onGameOver: optionsOrOrchestrator.onGameOver,
        onScheduleTurnTimeout: optionsOrOrchestrator.onScheduleTurnTimeout,
        botTurnDelayMs: optionsOrOrchestrator.botTurnDelayMs ?? 100,
      });
    }
  }

  scheduleBotTurn(roomCode: string): void {
    this.orchestrator.orchestrate(roomCode);
  }
}
