import { useActivityStore, type ActivityLogEntry } from '../../store/activity_store.js';
import type { SynthesizedGameEvent } from '../game_event_types.js';
import type { GameEventContext, GameEventListener } from '../game_event_bus_types.js';
import {
  mapKinematicEventToActivityLog,
  mapFinancialEventToActivityLog,
  mapPropertyEventToActivityLog,
  mapMarketEventToActivityLog,
} from './activity_log_mappers.js';

// Re-export mappers for backward-compatible living tests and callers
export {
  getCellName,
  resolvePlayerName,
  resolvePlayerTokenColor,
  createFinancialLogEntry,
  mapFinancialEventToActivityLog,
  mapPropertyEventToActivityLog,
  mapMarketEventToActivityLog,
  mapKinematicEventToActivityLog,
} from './activity_log_mappers.js';

let activitySequence = 0;

export function mapEventToActivityLog(
  event: SynthesizedGameEvent,
  context: GameEventContext,
): ActivityLogEntry | null {
  const timestamp = event.timestamp ? event.timestamp : Date.now();
  const id = `act_${event.type}_${timestamp}_${++activitySequence}`;

  const kinematicEntry = mapKinematicEventToActivityLog(event, context, id, timestamp);
  if (kinematicEntry) return kinematicEntry;

  const financialEntry = mapFinancialEventToActivityLog(event, context, id, timestamp);
  if (financialEntry) return financialEntry;

  const propertyEntry = mapPropertyEventToActivityLog(event, context, id, timestamp);
  if (propertyEntry) return propertyEntry;

  return mapMarketEventToActivityLog(event, context, id, timestamp);
}

export function createActivityLogSubscriber(
  store?: typeof useActivityStore,
): GameEventListener {
  const targetStore = store ?? useActivityStore;
  return (events: readonly SynthesizedGameEvent[], context: GameEventContext) => {
    if (!events || events.length === 0) return;
    for (const ev of events) {
      try {
        const entry = mapEventToActivityLog(ev, context);
        if (entry) {
          targetStore.getState().addActivityLog(entry);
        }
      } catch (err) {
        console.warn('[ActivityLogSubscriber] Per-event mapping error isolated:', err);
      }
    }
  };
}
