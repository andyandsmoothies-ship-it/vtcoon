// [UC-GAME-047/MSS] Audit Manager — Trạm Kiểm Toán & Thanh Tra Logic
import { TurnPhase } from '../domain/room';
import type { Room, Player } from '../domain/room';
import { ChanceCardId } from '../domain/event_card_engine';

export function sendToAudit(room: Room, playerId: string): void {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return;
  player.position = 10;
  player.auditTurnsLeft = 3;
  player.consecutiveDoubles = 0;
  room.phase = TurnPhase.PropertyManagement;
}

export function handleTurnStart(room: Room | undefined, playerId: string): { canRoll: boolean; reason?: string } {
  if (!room?.started) return { canRoll: false, reason: 'INVALID_PLAYER' };
  const current = room.players[room.currentPlayerIndex];
  if (current?.id !== playerId) return { canRoll: false, reason: 'INVALID_PLAYER' };
  if (current.skipNextTurn) {
    current.skipNextTurn = false;
    room.phase = TurnPhase.PropertyManagement;
    return { canRoll: false, reason: 'SKIPPED_BY_SERVICE_C3' };
  }
  if (current.auditTurnsLeft > 0) {
    room.phase = TurnPhase.PropertyManagement;
    return { canRoll: false, reason: 'IN_AUDIT' };
  }
  return { canRoll: true };
}

export function handleBailOut(
  room: Room | undefined,
  playerId: string,
  rolledThisTurn: boolean,
): { success: boolean; reason?: string } {
  if (!room?.started) return { success: false, reason: 'INVALID_PLAYER' };
  const current = room.players[room.currentPlayerIndex];
  if (current?.id !== playerId) return { success: false, reason: 'INVALID_PLAYER' };
  if (current.auditTurnsLeft <= 0) return { success: false, reason: 'NOT_IN_AUDIT' };
  if (current.balance < 500) return { success: false, reason: 'INSUFFICIENT_FUNDS' };
  current.balance -= 500;
  current.auditTurnsLeft = 0;
  room.phase = rolledThisTurn ? TurnPhase.PropertyManagement : TurnPhase.WaitingRoll;
  return { success: true };
}

export function handleUseDiplomatic(
  player: Player,
  chanceDiscard: ChanceCardId[],
): { success: boolean; reason?: string } {
  const idx = player.hand.indexOf(ChanceCardId.CC_DIPLOMATIC);
  if (idx === -1) return { success: false, reason: 'NO_DIPLOMATIC_CARD' };
  player.hand.splice(idx, 1);
  chanceDiscard.push(ChanceCardId.CC_DIPLOMATIC);
  return { success: true };
}

export function processRollDoubles(
  room: Room,
  current: Player,
  dice: { die1: number; die2: number; total: number; isDouble: boolean },
): { stopped: boolean; result?: { dice: typeof dice; player: { id: string; position: number; balance: number }; passedGo: boolean; rentCharged: number } } {
  if (current.auditTurnsLeft > 0) {
    if (!dice.isDouble) {
      room.phase = TurnPhase.PropertyManagement;
      return { stopped: true };
    }
    current.auditTurnsLeft = 0;
    current.consecutiveDoubles = 0;
  } else if (dice.isDouble) {
    current.consecutiveDoubles += 1;
    if (current.consecutiveDoubles >= 3) {
      sendToAudit(room, current.id);
      current.consecutiveDoubles = 0;
      return {
        stopped: true,
        result: {
          dice,
          player: { id: current.id, position: current.position, balance: current.balance },
          passedGo: false,
          rentCharged: 0,
        },
      };
    }
  } else {
    current.consecutiveDoubles = 0;
  }
  return { stopped: false };
}

export class AuditManager {
  sendToAudit(room: Room, playerId: string): void {
    sendToAudit(room, playerId);
  }

  handleTurnStart(room: Room | undefined, playerId: string): { canRoll: boolean; reason?: string } {
    return handleTurnStart(room, playerId);
  }

  handleBailOut(
    room: Room | undefined,
    playerId: string,
    rolledThisTurn: boolean,
  ): { success: boolean; reason?: string } {
    return handleBailOut(room, playerId, rolledThisTurn);
  }

  handleUseDiplomatic(
    player: Player,
    chanceDiscard: ChanceCardId[],
  ): { success: boolean; reason?: string } {
    return handleUseDiplomatic(player, chanceDiscard);
  }
}
