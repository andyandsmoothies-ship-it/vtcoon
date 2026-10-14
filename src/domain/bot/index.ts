// [IMP-395] Autonomous Bot Brain Public Facade (Cluster C3 Deep Module)
export {
  BotPersonality,
  BotPosture,
  type BotConfig,
  type BotIntent,
  type TileValuation,
  type BotTradeDecision,
  type BotTradeIntent,
  type BotSwapTradeIntent,
} from './bot_types.js';

export {
  decideBotIntent,
  decideAuctionPhaseIntent,
  findEligibleBotTrade,
  evaluateBotTradeAcceptance,
  takeover,
  BotEngine,
} from './bot_engine.js';

export {
  evaluateBotTradeDecision,
  recordTradeRejection,
  clearTradeRejectionForCell,
  type BotNegotiationContext,
  type BotNegotiationDecision,
} from './bot_negotiation_brain.js';

export { evaluatePlayerNetWorth } from './bot_posture.js';
