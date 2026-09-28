export enum BondTrancheId {
  WORKING_CAPITAL = 'WORKING_CAPITAL',
  EXPANSION = 'EXPANSION',
  ALL_IN = 'ALL_IN',
}

export interface BondTrancheConfig {
  readonly id: BondTrancheId;
  readonly name: string;
  readonly loanRatio: number;
  readonly durationRounds: number;
  readonly interestRate: number;
  readonly collateralRatio: number;
}

export const BOND_TRANCHES: Record<BondTrancheId, BondTrancheConfig> = {
  [BondTrancheId.WORKING_CAPITAL]: {
    id: BondTrancheId.WORKING_CAPITAL,
    name: 'Tín Dụng Lưu Động',
    loanRatio: 0.20,
    durationRounds: 2,
    interestRate: 0.08,
    collateralRatio: 1.00,
  },
  [BondTrancheId.EXPANSION]: {
    id: BondTrancheId.EXPANSION,
    name: 'Đầu Tư Tăng Tốc',
    loanRatio: 0.40,
    durationRounds: 3,
    interestRate: 0.15,
    collateralRatio: 1.20,
  },
  [BondTrancheId.ALL_IN]: {
    id: BondTrancheId.ALL_IN,
    name: 'Thâu Tóm Tất Tay',
    loanRatio: 0.60,
    durationRounds: 3,
    interestRate: 0.20,
    collateralRatio: 0.50,
  },
};

export interface BondContract {
  readonly trancheId?: BondTrancheId;
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
