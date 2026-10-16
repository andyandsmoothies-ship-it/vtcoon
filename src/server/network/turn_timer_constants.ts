// [IMP-423] Turn Timer Constants Seam
import { TurnPhase } from '../../domain/room.js';

export const PHASE_TIMEOUTS_MS: Record<TurnPhase, number> = {
  [TurnPhase.WaitingRoll]: 25_000,
  [TurnPhase.ActionPhase]: 35_000,
  [TurnPhase.AuctionPhase]: 20_000,
  [TurnPhase.PropertyManagement]: 30_000,
  [TurnPhase.InsolvencyPhase]: 45_000,
  [TurnPhase.HosePhase]: 25_000,
  [TurnPhase.BankruptcyCheck]: 10_000,
  [TurnPhase.TurnEnd]: 5_000,
};

export const HUMAN_PHASE_TIMEOUTS_MS: Record<TurnPhase, number> = {
  ...PHASE_TIMEOUTS_MS,
  [TurnPhase.WaitingRoll]: 45_000,
};

export const AUCTION_SETTLE_DELAY_MS = 2500;
