// [IMP-330][IMP-331] Synthesized Game Event Types
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
  | AuctionBidPlacedEvent;
