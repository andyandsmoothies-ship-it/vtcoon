// [IMP-330][IMP-331] Synthesized Game Event Types
import type { TransitWheelOutcome } from '../../domain/transit_wheel.js';

export enum SynthesizedGameEventType {
  RENT_PAID = 'RENT_PAID',
  GO_SALARY = 'GO_SALARY',
  DIPLOMATIC_WAIVER = 'DIPLOMATIC_WAIVER',
  FEE_PAID = 'FEE_PAID',
  PARTIAL_RENT = 'PARTIAL_RENT',
  PORT_SPLIT_RENT = 'PORT_SPLIT_RENT',
  PROPERTY_BOUGHT = 'PROPERTY_BOUGHT',
  PROPERTY_UPGRADED = 'PROPERTY_UPGRADED',
  PROPERTY_MORTGAGED = 'PROPERTY_MORTGAGED',
  PROPERTY_UNMORTGAGED = 'PROPERTY_UNMORTGAGED',
  TRADE_COMPLETED = 'TRADE_COMPLETED',
  AUCTION_WON = 'AUCTION_WON',
  AUCTION_BID_PLACED = 'AUCTION_BID_PLACED',
  DICE_ROLLED = 'DICE_ROLLED',
  PAWN_MOVED = 'PAWN_MOVED',
  EVENT_CARD_DRAWN = 'EVENT_CARD_DRAWN',
  TRANSIT_WHEEL_LANDED = 'TRANSIT_WHEEL_LANDED',
}

export interface BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType;
  readonly timestamp: number;
}

export interface RentPaidEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.RENT_PAID;
  readonly payerId: string;
  readonly receiverId: string;
  readonly cellIndex: number;
  readonly amount: number;
}

export interface GoSalaryDeductions {
  readonly propertyTax?: number;
  readonly mortgageInterest?: number;
  readonly overdraft?: number;
  readonly creditFee?: number;
}

export interface GoSalaryEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.GO_SALARY;
  readonly playerId: string;
  readonly grossSalary: number;
  readonly deductions?: GoSalaryDeductions;
  readonly taxDeduction: number;
  readonly netAmount: number;
}

export interface DiplomaticWaiverEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.DIPLOMATIC_WAIVER;
  readonly payerId: string;
  readonly landlordId: string;
  readonly cellIndex: number;
  readonly waivedAmount: number;
}

export interface FeePaidEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.FEE_PAID;
  readonly payerId: string;
  readonly feeType: 'LAND_TAX' | 'BAIL' | 'CARD_PENALTY' | 'TELECOM_DATA' | string;
  readonly amount: number;
  readonly receiverId?: string;
  readonly cellIndex?: number;
}

export interface PartialRentEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.PARTIAL_RENT;
  readonly payerId: string;
  readonly receiverId: string;
  readonly paidAmount: number;
  readonly remainingDebt: number;
  readonly cellIndex?: number;
}

export interface PortSplitRentEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.PORT_SPLIT_RENT;
  readonly payerId: string;
  readonly receiverIds: readonly [string, string];
  readonly cellIndex: number;
  readonly totalAmount: number;
  readonly amountPerReceiver: number;
}

export interface PropertyBoughtEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.PROPERTY_BOUGHT;
  readonly cellIndex: number;
  readonly buyerId: string;
  readonly price: number;
}

export interface PropertyUpgradedEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.PROPERTY_UPGRADED;
  readonly cellIndex: number;
  readonly ownerId: string;
  readonly targetLevel: 1 | 2 | 3;
  readonly cost: number;
}

export interface PropertyMortgagedEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.PROPERTY_MORTGAGED;
  readonly cellIndex: number;
  readonly ownerId: string;
  readonly loanAmount: number;
}

export interface PropertyUnmortgagedEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.PROPERTY_UNMORTGAGED;
  readonly cellIndex: number;
  readonly ownerId: string;
  readonly cost: number;
}

export interface TradeCompletedEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.TRADE_COMPLETED;
  readonly sellerId: string;
  readonly buyerId: string;
  readonly cellIndex: number;
  readonly offeredCellIndex?: number;
  readonly price: number;
  readonly taxAmount: number;
}

export interface AuctionWonEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.AUCTION_WON;
  readonly cellIndex: number;
  readonly winnerId: string;
  readonly winningBid: number;
}

export interface AuctionBidPlacedEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.AUCTION_BID_PLACED;
  readonly cellIndex: number;
  readonly bidderId: string;
  readonly bidAmount: number;
}

export interface DiceRolledEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.DICE_ROLLED;
  readonly playerId: string;
  readonly dice: readonly [number, number];
  readonly total: number;
  readonly isDouble: boolean;
}

export interface PawnMovedEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.PAWN_MOVED;
  readonly playerId: string;
  readonly fromCell: number;
  readonly toCell: number;
}

export interface EventCardDrawnEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.EVENT_CARD_DRAWN;
  readonly playerId: string;
  readonly cardId: string;
  readonly cardType: 'chance' | 'market' | string;
  readonly title: string;
  readonly description: string;
  readonly effectDelta?: number;
}

export interface TransitWheelLandedEvent extends BaseSynthesizedEvent {
  readonly type: SynthesizedGameEventType.TRANSIT_WHEEL_LANDED;
  readonly playerId: string;
  readonly cellIndex: number;
  readonly outcome: TransitWheelOutcome | string;
  readonly targetCell?: number;
  readonly payout?: number;
  readonly boostSteps?: number;
}

export interface SynthesizerOptions {
  readonly baseTimestamp?: number;
}

export type SynthesizedGameEvent =
  | RentPaidEvent
  | GoSalaryEvent
  | DiplomaticWaiverEvent
  | FeePaidEvent
  | PartialRentEvent
  | PortSplitRentEvent
  | PropertyBoughtEvent
  | PropertyUpgradedEvent
  | PropertyMortgagedEvent
  | PropertyUnmortgagedEvent
  | TradeCompletedEvent
  | AuctionWonEvent
  | AuctionBidPlacedEvent
  | DiceRolledEvent
  | PawnMovedEvent
  | EventCardDrawnEvent
  | TransitWheelLandedEvent;
