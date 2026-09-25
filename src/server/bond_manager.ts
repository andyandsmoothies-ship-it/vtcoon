// [UC-IMP192C] Corporate Bond Manager — Phát Hành, Đáo Hạn & Sàn Phát Mãi
import { TurnPhase, type Room, type Player } from '../domain/room';
import { ActionRejectReason } from '../domain/action_reasons';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../domain/property_manager';
import { calculateNetWorth } from './insolvency_manager';
import type { AuctionSession } from './auction_manager';
import {
  type BondContract,
  BOND_MIN_NET_WORTH,
  BOND_MIN_PROPERTIES,
  BOND_LOAN_RATIO,
  BOND_INTEREST_RATE,
  BOND_DURATION_ROUNDS,
  BOND_MIN_COLLATERAL_RATIO,
} from '../domain/bond_types';

export function validateIssueBond(
  room: Room,
  playerId: string,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): { valid: boolean; reason?: string; principal?: number; collateralCells?: number[] } {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { valid: false, reason: ActionRejectReason.INVALID_PLAYER };
  if (player.bondContract?.isActive) {
    return { valid: false, reason: ActionRejectReason.BOND_NOT_ELIGIBLE };
  }

  const netWorth = calculateNetWorth(playerId, registry, stateMap, room.players);
  if (netWorth < BOND_MIN_NET_WORTH) {
    return { valid: false, reason: ActionRejectReason.BOND_NOT_ELIGIBLE };
  }

  const unmortgagedCells: number[] = [];
  for (const [cellIndex, owner] of registry) {
    if (owner === playerId && !player.mortgagedProperties?.includes(cellIndex)) {
      unmortgagedCells.push(cellIndex);
    }
  }

  if (unmortgagedCells.length < BOND_MIN_PROPERTIES) {
    return { valid: false, reason: ActionRejectReason.BOND_NOT_ELIGIBLE };
  }

  const principal = Math.floor(netWorth * BOND_LOAN_RATIO);
  const totalCollateralValue = unmortgagedCells.reduce(
    (sum, cell) => sum + (PROPERTY_DEEDS.get(cell)?.price ?? 0),
    0,
  );

  if (totalCollateralValue < principal * BOND_MIN_COLLATERAL_RATIO) {
    return { valid: false, reason: ActionRejectReason.BOND_NOT_ELIGIBLE };
  }

  return { valid: true, principal, collateralCells: unmortgagedCells };
}

export function handleIssueBond(
  room: Room,
  playerId: string,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): { success: boolean; reason?: string; bondContract?: BondContract } {
  const validation = validateIssueBond(room, playerId, registry, stateMap);
  if (!validation.valid || validation.principal === undefined || !validation.collateralCells) {
    return { success: false, reason: validation.reason };
  }

  const player = room.players.find((p) => p.id === playerId)!;
  player.balance += validation.principal;
  const contract: BondContract = {
    principal: validation.principal,
    repayAmount: Math.floor(validation.principal * (1 + BOND_INTEREST_RATE)),
    roundsLeft: BOND_DURATION_ROUNDS,
    collateralCells: validation.collateralCells,
    isActive: true,
  };
  player.bondContract = contract;
  return { success: true, bondContract: contract };
}

export function handleRepayBond(
  room: Room,
  playerId: string,
): { success: boolean; reason?: string } {
  const player = room.players.find((p) => p.id === playerId);
  if (!player?.bondContract?.isActive) {
    return { success: false, reason: ActionRejectReason.BOND_NOT_ELIGIBLE };
  }
  if (player.balance < player.bondContract.repayAmount) {
    return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }
  player.balance -= player.bondContract.repayAmount;
  room.treasury = (room.treasury ?? 0) + Math.floor(player.bondContract.principal * BOND_INTEREST_RATE);
  player.bondContract = null;
  return { success: true };
}

export function handleStartFireSaleAuction(
  room: Room,
  cellIndex: number,
  auctions?: Map<string, AuctionSession>,
  roomCode?: string,
  bankruptPlayerId?: string,
): void {
  const code = roomCode ?? room.roomCode;
  const session: AuctionSession = {
    cellIndex,
    declinedPlayerId: bankruptPlayerId ?? '',
    highestBid: 0,
    startingBid: 0,
    currentBid: 0,
    passedPlayers: new Set<string>(),
    endTime: Date.now() + 10_000,
    isFireSale: true,
  };
  if (auctions) auctions.set(code, session);
  room.phase = TurnPhase.AuctionPhase;
  room.currentAuction = {
    cellIndex,
    declinedPlayerId: bankruptPlayerId ?? '',
    highestBid: 0,
    startingBid: 0,
    passedPlayers: session.passedPlayers,
    bidIncrement: 50,
  };
}

export function processBondTurnTransition(
  room: Room,
  player: Player,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  auctions?: Map<string, AuctionSession>,
  roomCode?: string,
): void {
  if (!player.bondContract?.isActive) return;

  if (player.bondContract.roundsLeft > 1) {
    player.bondContract = { ...player.bondContract, roundsLeft: player.bondContract.roundsLeft - 1 };
    return;
  }

  // roundsLeft === 1
  if (player.balance >= player.bondContract.repayAmount) {
    player.balance -= player.bondContract.repayAmount;
    room.treasury = (room.treasury ?? 0) + Math.floor(player.bondContract.principal * BOND_INTEREST_RATE);
    player.bondContract = null;
    return;
  }

  // Vỡ nợ trái phiếu
  const cash = Math.min(Math.max(0, player.balance), player.bondContract.repayAmount);
  player.balance -= cash;
  room.treasury = (room.treasury ?? 0) + cash;

  const cells = [...player.bondContract.collateralCells];
  for (const cell of cells) {
    registry.delete(cell);
    stateMap.delete(cell);
  }

  room.fireSaleQueue = cells;
  player.bondContract = null;

  if (room.fireSaleQueue.length > 0) {
    const first = room.fireSaleQueue.shift()!;
    handleStartFireSaleAuction(room, first, auctions, roomCode ?? room.roomCode, player.id);
  }
}
