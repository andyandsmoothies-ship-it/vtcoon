/**
 * Client Events Subsystem Facade
 * Single authoritative public gateway for game event bus, synthesized events,
 * and presentation dispatchers.
 */

// Bus and Dispatch Orchestration
export {
  GameEventBus,
  getGlobalGameEventBus,
  registerSubscriber,
  dispatchGameEvents,
  clearGameEventListeners,
  registerDefaultSubscribers,
  ensureDefaultSubscribers,
  type DefaultSubscriberOptions,
} from './game_event_bus.js';

export type {
  GameEventContext,
  GameEventListener,
} from './game_event_bus_types.js';

// Event Models & Enums
export {
  SynthesizedGameEventType,
} from './game_event_types.js';

export type {
  SynthesizedGameEvent,
  RentPaidEvent,
  PartialRentEvent,
  PortSplitRentEvent,
  GoSalaryEvent,
  FeePaidEvent,
  DiplomaticWaiverEvent,
  BondRepaidEvent,
  BondIssuedEvent,
  BondDefaultEvent,
  CompulsoryBuyoutEvent,
  HoseSettledEvent,
  PropertyBoughtEvent,
  PropertyUpgradedEvent,
  PropertyMortgagedEvent,
  PropertyUnmortgagedEvent,
  TradeCompletedEvent,
  AuctionWonEvent,
  AuctionBidPlacedEvent,
  DiceRolledEvent,
  PawnMovedEvent,
  EventCardDrawnEvent,
  TransitWheelLandedEvent,
} from './game_event_types.js';

// Synthesizers
export { synthesizeGameEvents } from './game_event_synthesizer.js';
export { synthesizeFinancialEvents } from './game_event_financial_synthesizer.js';
export { synthesizePropertyAndMarketEvents } from './game_event_property_synthesizer.js';

// Pacing & Context
export {
  createDefaultPacingContext,
  clearPendingPacingTimers,
  type PacingContext,
} from './pacing_context.js';

// Event Card Helpers
export { isBoardWideCard } from './event_card_constants.js';

// Helpers
export { resetHoseEventTracker, extractHoseEvents } from './game_event_hose_helpers.js';
export { extractBondEvents } from './game_event_bond_helpers.js';

// Subscribers Subsystem
export * from './subscribers/index.js';
