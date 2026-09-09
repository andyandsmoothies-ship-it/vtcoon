// [UC-SEC-001/MSS] Intent Guard — Kiểm Tra Quyền Sở Hữu Lượt & Chống Gian Lận (Turn Ownership Guard)
import { TurnPhase, type Room } from '../../domain/room.js';
import type { PlayerIntent } from '../intent_dispatcher.js';
import type { ReasonCode } from '../network/network_types.js';

export interface IntentGuardResult {
  readonly allowed: boolean;
  readonly reasonCode?: ReasonCode;
  readonly playerId: string;
}

export class IntentGuard {
  validate(
    room: Room,
    playerId: string,
    intent: PlayerIntent,
  ): IntentGuardResult {
    const player = room.players.find((p) => p.id === playerId);
    if (!player) {
      return { allowed: false, reasonCode: 'ROOM_NOT_FOUND', playerId };
    }

    if (!room.started || player.bankrupt) {
      this.logOutOfTurn(room.roomCode, playerId);
      return { allowed: false, reasonCode: 'OUT_OF_TURN', playerId };
    }

    if (this.isPhaseSpecificAllowed(room, playerId, intent)) {
      return { allowed: true, playerId };
    }

    const currentTurnPlayer = room.players[room.currentPlayerIndex];
    const isCurrentTurn = currentTurnPlayer?.id === playerId;

    if (!isCurrentTurn) {
      this.logOutOfTurn(room.roomCode, playerId);
      return { allowed: false, reasonCode: 'OUT_OF_TURN', playerId };
    }

    return { allowed: true, playerId };
  }

  private isPhaseSpecificAllowed(room: Room, playerId: string, intent: PlayerIntent): boolean {
    if (intent.type === 'INTENT_BANKRUPTCY') {
      return true;
    }
    if (room.phase === TurnPhase.AuctionPhase) {
      if (intent.type === 'INTENT_BID' || intent.type === 'INTENT_AUCTION_PASS') {
        return true;
      }
    }
    if (intent.type === 'INTENT_TRADE_OFFER') {
      if (playerId === intent.sellerId || playerId === intent.buyerId) {
        return true;
      }
    }
    return false;
  }

  private logOutOfTurn(roomCode: string, playerId: string): void {
    console.warn(JSON.stringify({
      event: 'SECURITY_OUT_OF_TURN',
      correlationId: roomCode,
      playerId,
      timestamp: Date.now(),
    }));
  }
}
