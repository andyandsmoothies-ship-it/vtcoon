// [IMP-380] Game Event HOSE Helpers — Dedicated HOSE trading event synthesis with lifecycle reset
import type { DeltaPayload } from '../../server/session_manager.js';
import {
  type HoseSettledEvent,
  SynthesizedGameEventType,
} from './game_event_types.js';
import {
  type InternalBalanceDelta,
  deductInflowFromDeltas,
} from './game_event_financial_helpers.js';

let lastProcessedHoseKey: string | null = null;

export function resetHoseEventTracker(): void {
  lastProcessedHoseKey = null;
}

export function extractHoseEvents(
  delta: DeltaPayload,
  payers: InternalBalanceDelta[],
  receivers: InternalBalanceDelta[],
  timestamp: number,
): HoseSettledEvent[] {
  if (!delta.lastHoseResult) {
    lastProcessedHoseKey = null;
    return [];
  }

  const hr = delta.lastHoseResult;
  const hoseKey = `${hr.playerId}_${hr.timestamp}_${hr.roll}_${hr.diceSeq ?? 0}`;
  if (lastProcessedHoseKey === hoseKey) return [];
  lastProcessedHoseKey = hoseKey;

  const event: HoseSettledEvent = {
    type: SynthesizedGameEventType.HOSE_SETTLED,
    timestamp,
    playerId: hr.playerId,
    stake: hr.stake,
    roll: hr.roll,
    payout: hr.payout,
    multiplier: hr.multiplier,
    profit: hr.profit,
  };

  if (hr.profit < 0) {
    const payIdx = payers.findIndex((py) => py.id === hr.playerId);
    if (payIdx !== -1) {
      payers[payIdx]!.diff += Math.abs(hr.profit);
      if (payers[payIdx]!.diff === 0) payers.splice(payIdx, 1);
    }
  } else if (hr.profit > 0) {
    deductInflowFromDeltas(hr.playerId, hr.profit, undefined, undefined, payers, receivers);
  }

  return [event];
}
