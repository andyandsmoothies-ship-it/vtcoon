// [UC-GAME-045/MSS] HOSE Actions — Sàn Giao Dịch Chứng Khoán
import type { Room, Player, HoseResultInfo } from '../domain/room';
import { TurnPhase } from '../domain/room';
import { resolveHoseInvestment } from '../domain/event_card_engine';
import { HOSE_OUTCOMES } from '../domain/event_card_types';
import { ActionRejectReason } from '../domain/action_reasons';

export function handleHoseInvest(
  room: Room | undefined,
  current: Player | undefined,
  rng: () => number,
  stake: number,
): { success: boolean; reason?: string } {
  if (!current || !room || room.phase !== TurnPhase.HosePhase) return { success: false, reason: 'INVALID_PHASE' };
  if (!Number.isInteger(stake) || stake < 500 || stake > 3000) return { success: false, reason: 'INVALID_STAKE' };
  if (current.balance < stake) return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  const face = Math.floor(rng() * 6) + 1;
  const multiplier = HOSE_OUTCOMES[face] ?? 1.0;
  const payout = resolveHoseInvestment(stake, face);
  const profit = payout - stake;
  current.balance = current.balance - stake + payout;
  const hoseResult: HoseResultInfo = {
    playerId: current.id,
    stake,
    roll: face,
    payout,
    multiplier,
    profit,
    timestamp: Date.now(),
    diceSeq: (room.diceSeq ?? 0) + 1,
  };
  room.lastHoseResult = hoseResult;
  room.diceSeq = hoseResult.diceSeq;
  room.phase = TurnPhase.PropertyManagement;
  return { success: true };
}

export function handleHoseSkip(
  room: Room | undefined,
  current: Player | undefined,
): { success: boolean; reason?: string } {
  if (!current || !room || room.phase !== TurnPhase.HosePhase) return { success: false, reason: 'INVALID_PHASE' };
  room.phase = TurnPhase.PropertyManagement;
  return { success: true };
}
