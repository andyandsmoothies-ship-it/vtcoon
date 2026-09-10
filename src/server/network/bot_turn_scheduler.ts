// [UC-GAME-005/MSS][UC-GAME-008/MSS] Bot Turn Scheduler
// Điều phối và lập lịch lượt chơi tự động cho Bot AI qua IntentMutex
import type { RoomManager } from '../room_manager.js';
import type { IntentMutex } from './intent_mutex.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';

export interface BotTurnSchedulerOptions {
  readonly rooms: RoomManager;
  readonly intentMutex: IntentMutex;
  readonly broadcaster: DeltaBroadcaster;
  readonly onGameOver: (roomCode: string) => void;
}

export class BotTurnScheduler {
  private readonly rooms: RoomManager;
  private readonly intentMutex: IntentMutex;
  private readonly broadcaster: DeltaBroadcaster;
  private readonly onGameOver: (roomCode: string) => void;

  constructor(options: BotTurnSchedulerOptions) {
    this.rooms = options.rooms;
    this.intentMutex = options.intentMutex;
    this.broadcaster = options.broadcaster;
    this.onGameOver = options.onGameOver;
  }

  scheduleBotTurn(roomCode: string): void {
    const room = this.rooms.getRoom(roomCode);
    const current = room?.players[room.currentPlayerIndex];
    if (!room?.started || !current?.isBot || current.bankrupt) return;

    this.rooms.clearRoomTimers(roomCode);

    const timer = setTimeout(() => {
      void this.intentMutex.runExclusive(roomCode, async () => {
        const r = this.rooms.getRoom(roomCode);
        const curr = r?.players[r.currentPlayerIndex];
        if (!r?.started || !curr?.isBot || curr.bankrupt) return;

        this.rooms.runBotTurn(roomCode);
        const rAfter = this.rooms.getRoom(roomCode);
        if (rAfter && rAfter.started && rAfter.players.filter((p) => !p.bankrupt).length <= 1) {
          this.onGameOver(roomCode);
        } else {
          this.broadcaster.broadcastRoomDelta(roomCode);
          const next = rAfter?.players[rAfter.currentPlayerIndex];
          if (next?.isBot && !next.bankrupt) {
            this.scheduleBotTurn(roomCode);
          }
        }
      });
    }, 800);

    this.rooms.registerTimer(roomCode, timer);
  }
}
