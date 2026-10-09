// [IMP-330][IMP-331] Game Event Narrative Synthesizer
// Lightweight composite façade combining financial and property/market narrative synthesis
import type { GameState } from '../store/game_store.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import type { SynthesizedGameEvent, SynthesizerOptions } from './game_event_types.js';
import { synthesizeFinancialEvents } from './game_event_financial_synthesizer.js';
import { synthesizePropertyAndMarketEvents } from './game_event_property_synthesizer.js';

export { synthesizeFinancialEvents, synthesizePropertyAndMarketEvents };
export * from './game_event_types.js';

/**
 * Synthesizes typed domain events from network state deltas in causal temporal order:
 * Financial events (Waiver, Salary, Fees, Rent) precede Property/Market events (Trades, Auctions, Purchases, Upgrades, Mortgages).
 */
export function synthesizeGameEvents(
  prevState: GameState,
  nextState: GameState,
  delta: DeltaPayload,
  options?: SynthesizerOptions,
): readonly SynthesizedGameEvent[] {
  const financialEvents = synthesizeFinancialEvents(prevState, nextState, delta, options);
  const propertyEvents = synthesizePropertyAndMarketEvents(prevState, nextState, delta, options);

  return [...financialEvents, ...propertyEvents];
}
