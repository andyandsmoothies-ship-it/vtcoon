// [UC-GAME-005/MSS][UC-GAME-008/MSS] Bot Turn Scheduler
// Điều phối và lập lịch lượt chơi tự động cho Bot AI qua IntentMutex
import type { RoomManager } from '../room_manager.js';
import type { IntentMutex } from './intent_mutex.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
import { TurnPhase, isRoomGameOver } from '../../domain/room.js';

export interface BotTurnSchedulerOptions {
  readonly rooms: RoomManager;
  readonly intentMutex: IntentMutex;
  readonly broadcaster: DeltaBroadcaster;
  readonly onGameOver: (roomCode: string) => void;
  readonly onScheduleTurnTimeout?: (roomCode: string) => void;
}

export class BotTurnScheduler {
  private readonly rooms: RoomManager;
  private readonly intentMutex: IntentMutex;
  private readonly broadcaster: DeltaBroadcaster;
  private readonly onGameOver: (roomCode: string) => void;
  private readonly onScheduleTurnTimeout?: (roomCode: string) => void;

  constructor(options: BotTurnSchedulerOptions) {
    this.rooms = options.rooms;
    this.intentMutex = options.intentMutex;
    this.broadcaster = options.broadcaster;
    this.onGameOver = options.onGameOver;
    this.onScheduleTurnTimeout = options.onScheduleTurnTimeout;
  }

  scheduleBotTurn(roomCode: string): void {
    const room = this.rooms.getRoom(roomCode);
    const current = room?.players[room.currentPlayerIndex];
    const isAuctionWithBots = room?.phase === TurnPhase.AuctionPhase &&
      room.players.some((p) => p.isBot && !p.bankrupt && p.id !== room.currentAuction?.declinedPlayerId && !room.currentAuction?.passedPlayers?.has(p.id));
    if (!room?.started || (!current?.isBot && !isAuctionWithBots) || (current?.bankrupt && !isAuctionWithBots)) return;

    this.rooms.clearRoomTimers(roomCode);

    const timer = setTimeout(() => {
      void this.intentMutex.runExclusive(roomCode, async () => {
        const r = this.rooms.getRoom(roomCode);
        const curr = r?.players[r.currentPlayerIndex];
        const hasAuctionBots = r?.phase === TurnPhase.AuctionPhase &&
          r.players.some((p) => p.isBot && !p.bankrupt && p.id !== r.currentAuction?.declinedPlayerId && !r.currentAuction?.passedPlayers?.has(p.id));
        if (!r?.started || (!curr?.isBot && !hasAuctionBots) || (curr?.bankrupt && !hasAuctionBots)) return;

        this.rooms.runBotTurn(roomCode);
        const rAfter = this.rooms.getRoom(roomCode);
        if (rAfter && isRoomGameOver(rAfter)) {
          this.onGameOver(roomCode);
        } else {
          this.broadcaster.broadcastRoomDelta(roomCode);
          const next = rAfter?.players[rAfter.currentPlayerIndex];
          if (next?.isBot && !next.bankrupt) {
            this.scheduleBotTurn(roomCode);
          } else if (next && !next.isBot && !next.bankrupt) {
            this.onScheduleTurnTimeout?.(roomCode);
          }
        }
      });
    }, 800);

    this.rooms.registerTimer(roomCode, timer);
  }
}
