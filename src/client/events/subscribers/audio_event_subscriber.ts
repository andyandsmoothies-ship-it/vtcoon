// [IMP-333] Audio Event Subscriber — Tactical acoustic feedback for synthesized game events
import { SoundEngine as DefaultSoundEngine, type SoundEngineImpl } from '../../audio/sound_engine.js';
import type { GameEventListener } from '../game_event_bus.js';
import type { PacingContext } from '../pacing_context.js';
import {
  SynthesizedGameEventType,
  type SynthesizedGameEvent,
} from '../game_event_types.js';

export interface AudioSubscriberOptions {
  readonly throttleMs?: number;
}

export function createAudioEventSubscriber(
  soundEngine?: SoundEngineImpl,
  pacingContext?: PacingContext,
  options?: AudioSubscriberOptions,
): GameEventListener {
  const engine = soundEngine ?? DefaultSoundEngine;
  const throttleMs = options?.throttleMs ?? 150;
  const lastPlayed = new Map<string, number>();

  function playThrottled(sfxKey: string, fn: () => void): void {
    const now = Date.now();
    const lastTime = lastPlayed.get(sfxKey) ?? 0;
    if (now - lastTime < throttleMs) {
      return;
    }
    lastPlayed.set(sfxKey, now);
    try {
      fn();
    } catch (err) {
      console.warn(`[AudioEventSubscriber] Error playing SFX '${sfxKey}':`, err);
    }
  }

  function scheduleOrPlay(delayMs: number, sfxKey: string, fn: () => void): void {
    const execute = () => playThrottled(sfxKey, fn);
    if (pacingContext && delayMs > 0) {
      pacingContext.scheduleAction(execute, delayMs);
    } else {
      execute();
    }
  }

  function handleEvent(event: SynthesizedGameEvent): void {
    switch (event.type) {
      case SynthesizedGameEventType.RENT_PAID: {
        const delay = pacingContext?.getPawnLandingDelay(event.payerId) ?? 0;
        scheduleOrPlay(delay, 'slump_thud', () => engine.playSlumpThud());
        scheduleOrPlay(delay, 'victory_chime', () => engine.playVictoryChime());
        break;
      }

      case SynthesizedGameEventType.PARTIAL_RENT: {
        const delay = pacingContext?.getPawnLandingDelay(event.payerId) ?? 0;
        scheduleOrPlay(delay, 'slump_thud', () => engine.playSlumpThud());
        scheduleOrPlay(delay, 'victory_chime', () => engine.playVictoryChime());
        break;
      }

      case SynthesizedGameEventType.PORT_SPLIT_RENT: {
        const delay = pacingContext?.getPawnLandingDelay(event.payerId) ?? 0;
        scheduleOrPlay(delay, 'slump_thud', () => engine.playSlumpThud());
        for (const _recId of event.receiverIds) {
          scheduleOrPlay(delay, 'victory_chime', () => engine.playVictoryChime());
        }
        break;
      }

      case SynthesizedGameEventType.GO_SALARY: {
        const delay = pacingContext?.getPawnPassGoDelay(event.playerId) ?? 0;
        scheduleOrPlay(delay, 'victory_chime', () => engine.playVictoryChime());
        break;
      }

      case SynthesizedGameEventType.AUCTION_WON: {
        scheduleOrPlay(0, 'victory_chime', () => engine.playVictoryChime());
        break;
      }

      case SynthesizedGameEventType.PROPERTY_UPGRADED: {
        scheduleOrPlay(0, 'construction_slam', () => engine.playConstructionSlam());
        break;
      }

      case SynthesizedGameEventType.TRADE_COMPLETED: {
        scheduleOrPlay(0, 'victory_chime', () => engine.playVictoryChime());
        break;
      }

      case SynthesizedGameEventType.FEE_PAID: {
        const delay = pacingContext?.getPawnLandingDelay(event.payerId) ?? 0;
        scheduleOrPlay(delay, 'slump_thud', () => engine.playSlumpThud());
        break;
      }

      case SynthesizedGameEventType.DIPLOMATIC_WAIVER: {
        const delay = pacingContext?.getPawnLandingDelay(event.payerId) ?? 0;
        scheduleOrPlay(delay, 'victory_chime', () => engine.playVictoryChime());
        scheduleOrPlay(delay, 'slump_thud', () => engine.playSlumpThud());
        break;
      }

      default:
        break;
    }
  }

  return (events) => {
    for (const event of events) {
      try {
        handleEvent(event);
      } catch (err) {
        console.warn('[AudioEventSubscriber] Error handling event:', err);
      }
    }
  };
}
