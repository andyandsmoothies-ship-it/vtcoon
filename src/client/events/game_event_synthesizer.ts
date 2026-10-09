// [IMP-330][IMP-331] Game Event Narrative Synthesizer
// Lightweight composite façade combining financial and property/market narrative synthesis
import type { GameState } from '../store/game_store.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import type { SynthesizedGameEvent, SynthesizerOptions } from './game_event_types.js';
import { synthesizeFinancialEvents } from './game_event_financial_synthesizer.js';
import { synthesizePropertyAndMarketEvents } from './game_event_property_synthesizer.js';
import { synthesizeKinematicEvents } from './game_event_kinematics_synthesizer.js';

export { synthesizeFinancialEvents, synthesizePropertyAndMarketEvents, synthesizeKinematicEvents };
export * from './game_event_types.js';

/**
 * Synthesizes typed domain events from network state deltas in causal temporal order:
 * Kinematics (Dice, Moves, Cards, Transit) -> Financial (Waiver, Salary, Fees, Rent) -> Property/Market (Trades, Auctions, Purchases, Upgrades, Mortgages).
 */
export function synthesizeGameEvents(
  prevState: GameState,
  nextState: GameState,
  delta: DeltaPayload,
  options?: SynthesizerOptions,
): readonly SynthesizedGameEvent[] {
  const kinematicEvents = synthesizeKinematicEvents(prevState, nextState, delta, options);
  const financialEvents = synthesizeFinancialEvents(prevState, nextState, delta, options);
  const propertyEvents = synthesizePropertyAndMarketEvents(prevState, nextState, delta, options);

  return [...kinematicEvents, ...financialEvents, ...propertyEvents];
}
