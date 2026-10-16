// [IMP-422] Game Event Bus Types Seam
import type { GameState } from '../store/game_store.js';
import type { DeltaPayload } from '../../domain/protocol/index.js';
import type { SynthesizedGameEvent } from './game_event_types.js';

export interface GameEventContext {
  readonly prevState: GameState;
  readonly nextState: GameState;
  readonly delta: DeltaPayload;
  readonly myPlayerId?: string;
}

export type GameEventListener = (
  events: readonly SynthesizedGameEvent[],
  context: GameEventContext,
) => void;
