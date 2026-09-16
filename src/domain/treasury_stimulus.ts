// [UC-IMP114/MSS] Treasury Public Stimulus & Macro Fiscal Policy
import type { Room } from './room.js';

export interface TreasuryRecipient {
  readonly playerId: string;
  readonly amount: number;
}

export interface TreasuryStimulusResult {
  readonly activated: boolean;
  readonly amount: number;
  readonly recipients: readonly TreasuryRecipient[];
}

export function processTreasuryStimulus(room: Room): TreasuryStimulusResult | null {
  if (!room || (room.treasury ?? 0) < 10_000) return null;

  const activePlayers = room.players.filter((p) => !p.bankrupt);
  if (activePlayers.length === 0) return null;

  const totalDisbursement = Math.floor((room.treasury ?? 0) * 0.2);
  if (totalDisbursement <= 0) return null;

  activePlayers.sort((a, b) => a.balance - b.balance);
  const count = Math.min(2, activePlayers.length);
  const amountPerPlayer = Math.floor(totalDisbursement / count);
  const actualDisbursed = amountPerPlayer * count;

  room.treasury = Math.max(0, (room.treasury ?? 0) - actualDisbursed);

  const recipients: TreasuryRecipient[] = [];
  for (let i = 0; i < count; i++) {
    const p = activePlayers[i]!;
    p.balance += amountPerPlayer;
    recipients.push({ playerId: p.id, amount: amountPerPlayer });
  }

  return { activated: true, amount: actualDisbursed, recipients };
}
