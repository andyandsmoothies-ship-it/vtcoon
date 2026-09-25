export interface BondContract {
  readonly principal: number;
  readonly repayAmount: number;
  readonly roundsLeft: number;
  readonly collateralCells: readonly number[];
  readonly isActive: boolean;
}

export const BOND_MIN_NET_WORTH = 3_000;
export const BOND_MIN_PROPERTIES = 2;
export const BOND_LOAN_RATIO = 0.80;
export const BOND_INTEREST_RATE = 0.20;
export const BOND_DURATION_ROUNDS = 3;
export const BOND_MIN_COLLATERAL_RATIO = 0.50;
