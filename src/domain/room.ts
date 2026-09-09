// [UC-GAME-001/MSS][UC-GAME-008/MSS] Room & Player Domain Types
import type { MarketCardId, ChanceCardId } from './event_card_engine';
export { ActionRejectReason } from './action_reasons';

export const BOARD_SIZE       = 40;
export const GO_BONUS         = 2_000;
export const INITIAL_BALANCE  = 15_000;
export const ROOM_CODE_LENGTH = 6;

export enum TurnPhase {
  WaitingRoll        = 'WaitingRoll',
  ActionPhase        = 'ActionPhase',
  AuctionPhase       = 'AuctionPhase',
  PropertyManagement = 'PropertyManagement',
  InsolvencyPhase    = 'InsolvencyPhase',
  BankruptcyCheck    = 'BankruptcyCheck',
  TurnEnd            = 'TurnEnd',
  HosePhase          = 'HosePhase',
}

export interface MarketModifier {
  readonly type: MarketCardId | ChanceCardId;
  readonly affectedCells: readonly number[];
  remainingRounds: number;
  readonly multiplier?: number;
  readonly beneficiaryId?: string;
}

export interface Player {
  readonly id:          string;
  position:             number;
  balance:              number;
  skipNextTurn:         boolean;
  auditTurnsLeft:       number;
  consecutiveDoubles:   number;
  hand:                 ChanceCardId[];
  pendingDebts:         string[];
  extraTurns:           number;
  doubleNextDice:       boolean;
  mortgagedProperties:  number[];
  bankrupt:             boolean;
  mortgageLoans?:       Record<number, number>;
}

export interface Room {
  readonly roomCode:      string;
  readonly hostId:        string;
  players:               Player[];
  currentPlayerIndex:    number;
  phase:                 TurnPhase;
  started:               boolean;
  activeModifiers:       MarketModifier[];
  marketDeck:            MarketCardId[];
  marketDiscard:         MarketCardId[];
  chanceDeck:            ChanceCardId[];
  chanceDiscard:         ChanceCardId[];
  permanentRentBonus:    Record<number, number>;
  treasury:              number;
}


const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return code;
}

export function createPlayer(id: string): Player {
  return {
    id, position: 0, balance: INITIAL_BALANCE,
    skipNextTurn: false, auditTurnsLeft: 0, consecutiveDoubles: 0,
    hand: [], pendingDebts: [],
    extraTurns: 0, doubleNextDice: false,
    mortgagedProperties: [], bankrupt: false,
    mortgageLoans: {},
  };
}

export function createRoom(hostId: string): Room {
  return {
    roomCode:           generateRoomCode(),
    hostId,
    players:            [createPlayer(hostId)],
    currentPlayerIndex: 0,
    phase:              TurnPhase.WaitingRoll,
    started:            false,
    activeModifiers:    [],
    marketDeck:         [],
    marketDiscard:      [],
    chanceDeck:         [],
    chanceDiscard:      [],
    permanentRentBonus: {},
    treasury:           0,
  };
}


/**
 * Tra true neu quan co da vuot qua hoac dung dung o GO (index 0).
 * Dieu kien: vi tri moi nho hon hoac bang vi tri cu VA khong trung vi tri cu.
 */
export function checkPassedGo(oldPos: number, newPos: number): boolean {
  return newPos <= oldPos && oldPos !== newPos;
}
