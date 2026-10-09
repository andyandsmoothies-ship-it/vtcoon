// [IMP-332] Game Event Bus — Central decoupled in-process event distribution
import type { GameState } from '../store/game_store.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import type { SynthesizedGameEvent } from './game_event_types.js';
import { createActivityLogSubscriber } from './subscribers/activity_log_subscriber.js';
import { createBadgeEventSubscriber } from './subscribers/badge_event_subscriber.js';
import { createAudioEventSubscriber } from './subscribers/audio_event_subscriber.js';
import { createDefaultPacingContext, type PacingContext } from './pacing_context.js';
import { useActivityStore } from '../store/activity_store.js';
import { useGameStore } from '../store/game_store.js';
import { useVfxStore } from '../store/vfx_store.js';
import { SoundEngine, type SoundEngineImpl } from '../audio/sound_engine.js';

export interface GameEventContext {
  readonly prevState: GameState;
  readonly nextState: GameState;
  readonly delta: DeltaPayload;
}

export type GameEventListener = (
  events: readonly SynthesizedGameEvent[],
  context: GameEventContext,
) => void;

export class GameEventBus {
  private readonly listeners = new Map<string, GameEventListener>();

  public registerSubscriber(key: string, listener: GameEventListener): () => void {
    this.listeners.set(key, listener);
    return () => {
      this.listeners.delete(key);
    };
  }

  public dispatchGameEvents(events: readonly SynthesizedGameEvent[], context: GameEventContext): void {
    if (!events || events.length === 0) return;
    for (const [key, listener] of this.listeners.entries()) {
      try {
        listener(events, context);
      } catch (err) {
        console.warn(`[GameEventBus] Error in subscriber '${key}':`, err);
      }
    }
  }

  public clearListeners(): void {
    this.listeners.clear();
  }

  public hasSubscriber(key: string): boolean {
    return this.listeners.has(key);
  }

  public getListenerCount(): number {
    return this.listeners.size;
  }
}

const globalBus = new GameEventBus();

export function getGlobalGameEventBus(): GameEventBus {
  return globalBus;
}

export function registerSubscriber(key: string, listener: GameEventListener): () => void {
  return globalBus.registerSubscriber(key, listener);
}

export function dispatchGameEvents(events: readonly SynthesizedGameEvent[], context: GameEventContext): void {
  globalBus.dispatchGameEvents(events, context);
}

export function clearGameEventListeners(): void {
  globalBus.clearListeners();
}

export interface DefaultSubscriberOptions {
  readonly activityStore?: typeof useActivityStore;
  readonly gameStore?: typeof useGameStore;
  readonly vfxStore?: typeof useVfxStore;
  readonly pacingContext?: PacingContext;
  readonly soundEngine?: SoundEngineImpl;
}

export function registerDefaultSubscribers(options?: DefaultSubscriberOptions): void {
  const actStore = options?.activityStore ?? useActivityStore;
  const gStore = options?.gameStore ?? useGameStore;
  const vStore = options?.vfxStore ?? useVfxStore;
  const pacing = options?.pacingContext ?? createDefaultPacingContext(gStore);
  const sfxEngine = options?.soundEngine ?? SoundEngine;

  registerSubscriber('activity_log', createActivityLogSubscriber(actStore));
  registerSubscriber('badge_presentation', createBadgeEventSubscriber(gStore, pacing, vStore));
  registerSubscriber('audio_presentation', createAudioEventSubscriber(sfxEngine, pacing));
}

export function ensureDefaultSubscribers(options?: DefaultSubscriberOptions): void {
  if (
    !globalBus.hasSubscriber('activity_log') ||
    !globalBus.hasSubscriber('badge_presentation') ||
    !globalBus.hasSubscriber('audio_presentation')
  ) {
    registerDefaultSubscribers(options);
  }
}

// Auto-register default presentation subscribers in production runtime
registerDefaultSubscribers();

