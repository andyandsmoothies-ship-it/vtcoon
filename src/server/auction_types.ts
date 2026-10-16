// [IMP-423] Auction Types & Session Contracts
export interface AuctionSession {
  readonly cellIndex: number;
  readonly declinedPlayerId: string;
  highestBid: number;
  startingBid?: number;
  currentBid?: number;
  highestBidder?: string;
  passedPlayers?: Set<string>;
  insolvencyPlayerId?: string;
  endTime?: number;
  isFireSale?: boolean;
}

export interface AuctionResult {
  cellIndex?: number;
  winnerId: string | null;
  winningBid: number;
  finalPrice?: number;
  isForeclosure?: boolean;
}
