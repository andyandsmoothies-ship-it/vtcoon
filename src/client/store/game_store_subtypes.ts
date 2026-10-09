// [IMP-298] Game Store Subsystem Types & DTO Definitions (Station 1 Stub)
import { TurnPhase, type EventCardInfo, type MarketModifier, type PendingBuyoutSession } from '../../domain/room.js';
import type { PendingTradeOfferDelta, DiplomaticEventDelta } from '../../server/session_manager.js';
import type { BotPersonality } from '../../domain/bot/bot_types.js';
import type { BondContract } from '../../domain/bond_types.js';
import type { ChanceCardId } from '../../domain/event_card_engine.js';
import type { TransitWheelOutcome } from '../../domain/transit_wheel.js';

export interface PawnAnimationState {
  readonly playerId: string;
  readonly fromCell: number;
  readonly targetCell?: number;
  readonly waypoints: readonly number[];
  readonly currentIndex?: number;
  readonly isAnimating: boolean;
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

export interface PawnMoveTask {
  readonly playerId: string;
  readonly fromCell: number;
  readonly targetCell: number;
  readonly waypoints: readonly number[];
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

export interface PlayerHudInfo {
  readonly id: string;
  readonly name: string;
  readonly balance: number;
  readonly tokenColor: string;
  readonly ownedProperties: readonly number[];
  readonly mortgagedProperties?: readonly number[];
  readonly mortgageLoans?: Record<number, number>;
  readonly inAudit?: boolean;
  readonly auditTurnsLeft?: number;
  readonly auditCount?: number;
  readonly skipNextTurn?: boolean;
  readonly consecutiveDoubles?: number;
  readonly extraTurns?: number;
  readonly bankrupt?: boolean;
  readonly isBankrupt?: boolean;
  readonly personality?: BotPersonality;
  readonly isBot?: boolean;
  readonly overdraftRoundsLeft?: number;
  readonly pawnSlot?: number;
  readonly ownerSlot?: number;
  readonly mascotIcon?: string;
  readonly mascotName?: string;
  readonly avatar?: string;
  readonly bondContract?: BondContract | null;
  readonly hand?: readonly ChanceCardId[];
}

export type PlayerInfo = PlayerHudInfo;

export interface ActiveEmote {
  readonly playerId: string;
  readonly emoteId: string;
  readonly timestamp: number;
}

export enum FloatingTextType {
  Reward = 'reward',
  Bonus = 'reward',
  Penalty = 'penalty',
}

export type FloatingActionType =
  | 'buy'
  | 'upgrade'
  | 'rent'
  | 'rent_pay'
  | 'rent_receive'
  | 'tax'
  | 'bail'
  | 'salary'
  | 'monopoly'
  | 'debt_relief'
  | 'bankrupt'
  | 'stimulus'
  | 'chance'
  | 'market'
  | 'auction_win'
  | 'hose'
  | 'teleport'
  | 'audit_jail'
  | 'ma_buyout'
  | 'mortgage'
  | 'unmortgage'
  | 'diplomatic'
  | 'trade'
  | 'decline_auction'
  | 'transit'
  | 'general';

export interface FloatingTextItem {
  readonly id: string;
  readonly text: string;
  readonly type?: FloatingTextType;
  readonly playerId: string;
  readonly timestamp: number;
  readonly durationMs?: number;
  readonly actionType?: FloatingActionType;
  readonly title?: string;
  readonly cellIndex?: number;
  readonly targetPlayerId?: string;
  readonly targetPlayerName?: string;
  readonly formula?: string;
  readonly bailKind?: 'voluntary' | 'forced' | 'doubles';
  readonly groupId?: string;
}

export type ActiveModalType = 'deed' | 'portfolio' | 'auction' | 'trade' | 'event' | 'hose' | 'insolvency' | 'game_over' | 'rules' | 'masterplan' | 'bot_trade_offer' | 'compulsory_buyout' | 'transit_wheel' | null;

export interface ModalPayloadMap {
  deed: { cellIndex: number; canBuy?: boolean; ownedProperties?: readonly number[]; isBuyOpportunity?: boolean };
  portfolio: {
    playerId?: string;
    targetPurchaseCellIndex?: number;
  };
  auction: {
    cellIndex: number;
    currentBid?: number;
    highestBidderId?: string | null;
    timeRemaining?: number;
    deadline?: number;
    hasPassed?: boolean;
    passedPlayerIds?: readonly string[];
    declinedPlayerId?: string;
    isConcluded?: boolean;
    winnerId?: string | null;
    finalPrice?: number;
    insolvencyPlayerId?: string;
    isForeclosure?: boolean;
    isFireSale?: boolean;
    startingBid?: number;
    highestBid?: number;
    highestBidder?: string;
  };
  trade: {
    targetPlayerId: string;
    offeredProperties: number[];
    requestedProperties: number[];
    cashOffer: number;
    cashRequest: number;
  };
  event: {
    cardType: 'chance' | 'market';
    cardId: string;
    title: string;
    description: string;
    effectDelta?: number;
    targetScope?: string;
    effectDetail?: string;
    duration?: string;
    destination?: string;
  };
  hose: {
    minStake?: number;
    maxStake?: number;
    currentStake?: number;
    lastDiceRoll?: number;
    lastPayout?: number;
    lastMultiplier?: number;
    lastProfit?: number;
    isReviewingResult?: boolean;
  };
  insolvency: {
    playerId: string;
    deficit: number;
  };
  game_over: {
    leaderboard: ReadonlyArray<{ readonly id: string; readonly netWorth: number }>;
  };
  rules: {
    initialTab?: 'core' | 'cards' | 'mechanics';
  };
  masterplan: {
    initialTab?: 'blueprint' | 'districts';
    selectedCellIndex?: number;
  };
  bot_trade_offer: {
    offerId: string;
    cellIndex: number;
    price: number;
    buyerId: string;
    sellerId: string;
    expiresAt: number;
    offeredCellIndex?: number;
  };
  compulsory_buyout: PendingBuyoutSession;
  transit_wheel: { cellIndex: number; playerId?: string; outcome?: TransitWheelOutcome | string; targetCell?: number; payout?: number; boostSteps?: number };
}

export interface PendingPawnMove {
  readonly playerId: string;
  readonly targetCell: number;
  readonly fromCell: number;
  readonly isBot?: boolean;
  readonly isJailFlight?: boolean;
}

export interface LastLandedPawn {
  readonly playerId: string;
  readonly cellIndex: number;
  readonly timestamp: number;
}

export type ClientMarketModifier = MarketModifier | {
  readonly type: MarketModifier['type'] | string;
  readonly remainingRounds: number;
  readonly affectedCells?: readonly number[];
  readonly multiplier?: number;
  readonly beneficiaryId?: string;
};
