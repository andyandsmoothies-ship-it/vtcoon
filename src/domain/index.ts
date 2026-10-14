// [IMP-395] Core Domain Public Facade (Cluster C2 Deep Module)
export { ActionRejectReason } from './action_reasons.js';
export { BOARD_CONFIG, CellType, ColorGroup, type BoardCell } from './board_config.js';
export {
  BondTrancheId, BOND_TRANCHES, BOND_MIN_NET_WORTH, BOND_MIN_PROPERTIES,
  BOND_LOAN_RATIO, BOND_INTEREST_RATE, BOND_DURATION_ROUNDS, BOND_MIN_COLLATERAL_RATIO,
  type BondTrancheConfig, type BondContract,
} from './bond_types.js';
export { mulberry32, rollDice, type DiceResult } from './dice.js';
export {
  EmoteId, SOCIAL_EMOTES, EMOTE_DISPLAY_DURATION_MS, EMOTE_COOLDOWN_MS,
  isValidEmoteId, getEmoteDef, type SocialEmoteDef,
} from './emotes.js';
export {
  createMarketDeck, createChanceDeck, resolveHoseInvestment,
  drawMarketCard, drawChanceCard, decayModifiers,
} from './event_card_engine.js';
export {
  CHANCE_CARD_DETAILS, MARKET_CARD_DETAILS, getChanceCardInfo, getMarketCardInfo, type CardDetail,
} from './event_card_metadata.js';
export {
  MarketCardId, ChanceCardId, RESORT_CELLS, COASTAL_CELLS, SERVICE_CELLS,
  INFRA_CELLS, HANOI_HCMC_CELLS, LAND_FEVER_CELLS, HOSE_OUTCOMES, type MarketModifier,
} from './event_card_types.js';
export { vi } from './i18n/vi.js';
export { evaluateMacroCycle } from './macro_cycle_engine.js';
export {
  MacroCycleType, MACRO_CYCLE_LENGTH, MACRO_FEVER_ROUNDS, MACRO_FREEZE_ROUNDS,
  MACRO_FEVER_RENT_MULT, MACRO_FREEZE_RENT_MULT, MACRO_FEVER_UPGRADE_COST_MULT, MACRO_UPGRADE_COST_FLOOR,
} from './macro_cycle_types.js';
export {
  MORTGAGE_DEFAULT_INTEREST_RATE, MORTGAGE_RATE_HIKE_INTEREST_RATE,
  MORTGAGE_LOAN_RATE, URBAN_PLANNING_MORTGAGE_RATE, MORTGAGE_REDEEM_FEE_RATE,
} from './mortgage_constants.js';
export { generateRandomAnimalName } from './name_generator.js';
export { hashSeed, assignRandomPlayerPawns, type PawnAssignmentResult } from './pawn_assignment.js';
export { LUXURY_PAWN_CONFIGS, getPawnConfigBySlot, type LuxuryPawnConfig } from './pawn_configs.js';
export {
  PROPERTY_DEEDS, LEVEL_MULTIPLIER, P2P_TAX_RATE, P2P_ANTI_SPECULATE_TAX,
  RAILROAD_CELLS, RAILROAD_FEES, UTILITY_CELLS, ETC_COST_PER_CELL, UTILITY_UPGRADE_COST,
  isPurchasable, calculateCellNetWorth,
  type PropertyDeed, type PropertyRegistry, type PropertyState, type PropertyStateMap,
} from './property_data.js';
export { LandingResult, BuyResult, buyProperty, handleLanding, type LandingDetails } from './property_manager.js';
export {
  GO_PROPERTY_TAX_CAP, TELECOM_DATA_FEE, MIN_BAIL_AMOUNT, ESCALATING_BAIL_TIERS,
  MAX_BAIL_AMOUNT, BAIL_NET_WORTH_RATIO, calculateBailAmount, calculateRent,
  resolveRent, calculateElectricBill, calculateGoPropertyTax,
} from './property_rent.js';
export {
  DOWNGRADE_REFUND_RATE, hasMonopoly, checkEvenBuilding, checkEvenDowngrading,
  calculateUpgradeCost, upgradeProperty, downgradeProperty, upgradeETC, upgradeUtilityFull,
  type UpgradeCostModifier, type DowngradeOptions,
} from './property_upgrade.js';
export {
  BOARD_SIZE, GO_BONUS, INITIAL_BALANCE, ROOM_CODE_LENGTH, MAX_ROUNDS,
  INITIAL_BALANCE_BY_PLAYERS, TurnPhase, calculateGoSalary, getInitialBalanceForPlayerCount,
  generateRoomCode, createPlayer, createRoom, checkPassedGo, isRoomGameOver,
  type Player, type Room, type CurrentAuctionState, type EventCardInfo, type HoseResultInfo,
  type BuyoutTargetOption, type PendingBuyoutSession, type PendingTradeOfferInfo,
  type MaBuyoutResult, type TradeResultInfo, type BondRepaidServerEvent, type BondDefaultServerEvent,
  type HoseSettledServerEvent, type AuctionWonServerEvent, type AuctionBidServerEvent, type ServerDomainEvent,
} from './room.js';
export { BOARD_SURFACE, PLAYER_TOKEN_PALETTE, COLOR_GROUP_HEX, TABLETOP_THEME } from './theme.js';
export {
  TransitWheelOutcome, TRANSIT_WHEEL_CONFIGS, getWheelTargetDeg,
  evaluateTransitWheelOutcome, findSafeHaven, formatTransitWheelBroadcast,
  type TransitWheelConfig, type TransitWheelBroadcastParams,
} from './transit_wheel.js';
export {
  TREASURY_STIMULUS_THRESHOLD, TREASURY_STIMULUS_RATE, ENABLE_TREASURY_STIMULUS,
  processTreasuryStimulus, type TreasuryRecipient, type TreasuryStimulusResult,
} from './treasury_stimulus.js';
