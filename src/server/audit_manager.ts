// [UC-GAME-047/MSS] Audit Manager — Trạm Kiểm Toán & Thanh Tra Logic
import { TurnPhase } from '../domain/room';
import type { Room, Player } from '../domain/room';
import type { DiceResult } from '../domain/dice';
import { ChanceCardId } from '../domain/event_card_types';
import { ActionRejectReason } from '../domain/action_reasons';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager';
import { calculateNetWorth } from './insolvency_manager';

const turnStartedInAudit = new Map<string, boolean>();

export function setTurnStartedInAudit(roomCode: string, value: boolean): void {
  turnStartedInAudit.set(roomCode, value);
}

export function getTurnStartedInAudit(roomCode: string): boolean | undefined {
  return turnStartedInAudit.get(roomCode);
}

export function hasTurnStartedInAudit(roomCode: string): boolean {
  return turnStartedInAudit.has(roomCode);
}

export function deleteTurnStartedInAudit(roomCode: string): void {
  turnStartedInAudit.delete(roomCode);
}

export function sendToAudit(room: Room, playerId: string): void {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return;
  player.position = 10;
  player.auditTurnsLeft = 3;
  player.consecutiveDoubles = 0;
  room.phase = TurnPhase.PropertyManagement;
  if (room.roomCode) {
    turnStartedInAudit.set(room.roomCode, false);
  }
}

export function handleTurnStart(room: Room | undefined, playerId: string): { canRoll: boolean; reason?: string } {
  if (!room?.started) return { canRoll: false, reason: ActionRejectReason.INVALID_PLAYER };
  const current = room.players[room.currentPlayerIndex];
  if (current?.id !== playerId) return { canRoll: false, reason: ActionRejectReason.INVALID_PLAYER };
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

function hasOwnedProperties(playerId: string, registry?: PropertyRegistry): boolean {
  if (!registry) return false;
  for (const owner of registry.values()) {
    if (owner === playerId) return true;
  }
  return false;
}

export function handleBailOut(
  room: Room | undefined,
  playerId: string,
  rolledThisTurn: boolean,
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
): { success: boolean; reason?: string } {
  if (!room?.started) return { success: false, reason: ActionRejectReason.INVALID_PLAYER };
  const current = room.players[room.currentPlayerIndex];
  if (current?.id !== playerId) return { success: false, reason: ActionRejectReason.INVALID_PLAYER };
  if (current.auditTurnsLeft <= 0) return { success: false, reason: 'NOT_IN_AUDIT' };

  const netWorth = (registry && stateMap && room && hasOwnedProperties(current.id, registry))
    ? calculateNetWorth(current.id, registry, stateMap, room.players)
    : 0;
  const bailAmount = Math.max(500, Math.floor(netWorth * 0.10));

  if (current.balance < bailAmount) return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  current.balance -= bailAmount;
  room.treasury = (room.treasury ?? 0) + bailAmount;
  current.auditTurnsLeft = 0;
  if (current.inAudit) current.inAudit = false;
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

export interface RollDoublesResult {
  stopped: boolean;
  result?: { dice: DiceResult; player: { id: string; position: number; balance: number }; passedGo: boolean; rentCharged: number };
}

export function processRollDoubles(room: Room, current: Player, dice: DiceResult): RollDoublesResult {
  if (current.auditTurnsLeft > 0) {
    if (!dice.isDouble) {
      room.phase = TurnPhase.PropertyManagement;
      const player = { id: current.id, position: current.position, balance: current.balance };
      return { stopped: true, result: { dice, player, passedGo: false, rentCharged: 0 } };
    }
    current.auditTurnsLeft = 0;
    current.consecutiveDoubles = 0;
    return { stopped: false };
  }
  if (!dice.isDouble) {
    current.consecutiveDoubles = 0;
    return { stopped: false };
  }
  current.consecutiveDoubles += 1;
  if (current.consecutiveDoubles < 3) return { stopped: false };

  sendToAudit(room, current.id);
  current.consecutiveDoubles = 0;
  const player = { id: current.id, position: current.position, balance: current.balance };
  return { stopped: true, result: { dice, player, passedGo: false, rentCharged: 0 } };
}

export function handleAuditTurnTransition(
  room: Room,
  player: Player,
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
): void {
  if (player.auditTurnsLeft > 0) {
    player.auditTurnsLeft -= 1;
    if (player.auditTurnsLeft === 0) {
      if (player.inAudit) player.inAudit = false;
      const netWorth = (registry && stateMap && hasOwnedProperties(player.id, registry))
        ? calculateNetWorth(player.id, registry, stateMap, room.players)
        : 0;
      const penaltyAmount = Math.max(500, Math.floor(netWorth * 0.10));
      player.balance -= penaltyAmount;
      room.treasury = (room.treasury ?? 0) + penaltyAmount;
    }
  }
}

