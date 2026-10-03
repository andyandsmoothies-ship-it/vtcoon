import type {
  TurnPhase,
  EventCardInfo,
  HoseResultInfo,
  MarketModifier,
  PendingBuyoutSession,
  BondContract,
} from '../domain/room.js';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager.js';
export type { PropertyRegistry, PropertyStateMap };
import type { ChanceCardId } from '../domain/event_card_engine.js';
import type { TransitWheelOutcome } from '../domain/transit_wheel.js';

export interface CellDelta {
  readonly index: number;
  readonly ownerId?: string | null;
  readonly level?: number;
  readonly isETC?: boolean;
  readonly isUpgradedUtility?: boolean;
  readonly isMortgaged?: boolean;
  readonly unbuiltRounds?: number;
}

export interface DiplomaticEventDelta {
  readonly playerId: string;
  readonly landlordId: string;
  readonly cellIndex: number;
  readonly savedRent: number;
}

export interface PlayerDelta {
  readonly id: string;
  readonly position: number;
  readonly balance: number;
  readonly bankrupt?: boolean;
  readonly isBot?: boolean;
  readonly overdraftRoundsLeft?: number;
  readonly inAudit?: boolean;
  readonly auditTurnsLeft?: number;
  readonly auditCount?: number;
  readonly skipNextTurn?: boolean;
  readonly consecutiveDoubles?: number;
  readonly extraTurns?: number;
  readonly bondContract?: BondContract | null;
  readonly hand?: readonly ChanceCardId[];
}

export interface AuctionPayload {
  readonly cellIndex: number;
  readonly currentBid: number;
  readonly highestBidderId: string | null;
  readonly timeRemaining: number;
  readonly declinedPlayerId?: string;
  readonly hasPassed?: boolean;
  readonly passedPlayerIds?: readonly string[];
  readonly insolvencyPlayerId?: string;
  readonly isForeclosure?: boolean;
  readonly startingBid?: number;
  readonly isFireSale?: boolean;
  isConcluded?: boolean;
  winnerId?: string | null;
  finalPrice?: number;
}

export type AuctionDelta = AuctionPayload;

export interface PendingTradeOfferDelta {
  readonly offerId: string;
  readonly cellIndex: number;
  readonly price: number;
  readonly buyerId: string;
  readonly sellerId: string;
  readonly expiresAt: number;
  readonly offeredCellIndex?: number;
  readonly requesterId?: string;
  readonly targetPlayerId?: string;
}

export interface DeltaPayload {
  readonly roomCode?:            string;
  readonly tick:                 number;
  readonly cells:                ReadonlyArray<CellDelta>;
  readonly players?:             ReadonlyArray<PlayerDelta>;
  readonly currentPlayerIndex?:  number;
  readonly currentTurnPlayerId?: string;
  readonly dice?:                readonly [number, number];
  readonly diceRollerId?:        string;
  readonly diceSeq?:             number;
  readonly auction?:             AuctionPayload | null;
  readonly pendingTradeOffer?:   PendingTradeOfferDelta | null;
  readonly pendingBuyout?:       PendingBuyoutSession | null;
  readonly roomStarted?:         boolean;
  readonly turnPhase?:           TurnPhase;
  readonly timeRemaining?:       number;
  readonly lastEventCard?:       EventCardInfo | null;
  readonly lastHoseResult?:      HoseResultInfo | null;
  readonly roundNumber?:         number;
  readonly treasury?:            number;
  readonly activeModifiers?:     ReadonlyArray<MarketModifier>;
  readonly lastDiplomaticEvent?:  DiplomaticEventDelta | null;
  readonly passedGoSalary?:       number;
  readonly pendingTransitWheel?:  { playerId: string; cellIndex: number; timestamp: number } | null;
  readonly lastTransitResult?:    { playerId: string; cellIndex: number; outcome: TransitWheelOutcome | string; targetCell?: number; payout?: number } | null;
}

export interface DeltaPayloadOptions {
  tick: number;
  cells: ReadonlyArray<CellDelta>;
  players?: ReadonlyArray<PlayerDelta>;
  currentPlayerIndex?: number;
  currentTurnPlayerId?: string;
  dice?: readonly [number, number];
  diceRollerId?: string;
  diceSeq?: number;
  auction?: AuctionPayload | null;
  pendingTradeOffer?: PendingTradeOfferDelta | null;
  pendingBuyout?: PendingBuyoutSession | null;
  roomStarted?: boolean;
  turnPhase?: TurnPhase;
  timeRemaining?: number;
  lastEventCard?: EventCardInfo | null;
  lastHoseResult?: HoseResultInfo | null;
  roundNumber?: number;
  treasury?: number;
  activeModifiers?: ReadonlyArray<MarketModifier>;
  lastDiplomaticEvent?: DiplomaticEventDelta | null;
  passedGoSalary?: number;
  pendingTransitWheel?: { playerId: string; cellIndex: number; timestamp: number } | null;
  lastTransitResult?: { playerId: string; cellIndex: number; outcome: TransitWheelOutcome | string; targetCell?: number; payout?: number } | null;
}
