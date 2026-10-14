// [IMP-380] Game Event HOSE Helpers — Dedicated HOSE trading event synthesis with lifecycle reset
import type { DeltaPayload } from '../../domain/protocol/index.js';
import {
  type HoseSettledEvent,
  SynthesizedGameEventType,
} from './game_event_types.js';
import type { HoseSettledServerEvent } from '../../domain/room.js';
import {
  type InternalBalanceDelta,
  deductInflowFromDeltas,
  restoreDeltaOutflow,
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
  const serverEvents = (delta.domainEvents ?? []).filter(
    (e): e is HoseSettledServerEvent => e.type === 'HOSE_SETTLED',
  );
  if (serverEvents.length > 0) {
    const events: HoseSettledEvent[] = [];
    for (const ev of serverEvents) {
      const hoseKey = `${ev.playerId}_${ev.timestamp}_${ev.roll}_${ev.diceSeq ?? 0}`;
      if (lastProcessedHoseKey === hoseKey) continue;
      lastProcessedHoseKey = hoseKey;

      events.push({
        type: SynthesizedGameEventType.HOSE_SETTLED,
        timestamp: ev.timestamp ?? timestamp,
        playerId: ev.playerId,
        stake: ev.stake,
        roll: ev.roll,
        payout: ev.payout,
        multiplier: ev.multiplier,
        profit: ev.profit,
      });

      if (ev.profit < 0) {
        restoreDeltaOutflow(ev.playerId, Math.abs(ev.profit), payers, receivers);
      } else if (ev.profit > 0) {
        deductInflowFromDeltas(ev.playerId, ev.profit, undefined, undefined, payers, receivers);
      }
    }
    if (delta.lastHoseResult) {
      const hr = delta.lastHoseResult;
      lastProcessedHoseKey = `${hr.playerId}_${hr.timestamp}_${hr.roll}_${hr.diceSeq ?? 0}`;
    }
    return events;
  }

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
    restoreDeltaOutflow(hr.playerId, Math.abs(hr.profit), payers, receivers);
  } else if (hr.profit > 0) {
    deductInflowFromDeltas(hr.playerId, hr.profit, undefined, undefined, payers, receivers);
  }

  return [event];
}
