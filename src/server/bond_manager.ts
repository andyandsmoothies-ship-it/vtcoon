// [UC-IMP192C] Corporate Bond Manager — Phát Hành, Đáo Hạn & Sàn Phát Mãi
import { TurnPhase, type Room, type Player } from '../domain/room';
import { ActionRejectReason } from '../domain/action_reasons';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../domain/property_manager';
import { calculateNetWorth } from './insolvency_manager';
import type { AuctionSession } from './auction_manager';
import {
  type BondContract,
  BondTrancheId,
  type BondTrancheConfig,
  BOND_TRANCHES,
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
  trancheId?: BondTrancheId,
): { valid: boolean; reason?: string; principal?: number; collateralCells?: number[]; tranche?: BondTrancheConfig } {
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

  // Legacy Fallback khi trancheId === undefined (bảo toàn 100% hợp đồng TC-192C)
  if (!trancheId) {
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

  const tranche = BOND_TRANCHES[trancheId] ?? BOND_TRANCHES[BondTrancheId.WORKING_CAPITAL];
  const principal = Math.floor(netWorth * tranche.loanRatio);

  if (trancheId === BondTrancheId.ALL_IN) {
    const totalCollateralValue = unmortgagedCells.reduce(
      (sum, cell) => sum + (PROPERTY_DEEDS.get(cell)?.price ?? 0),
      0,
    );
    if (totalCollateralValue < principal * tranche.collateralRatio) {
      return { valid: false, reason: ActionRejectReason.BOND_NOT_ELIGIBLE };
    }
    return { valid: true, principal, collateralCells: unmortgagedCells, tranche };
  }

  // Sắp xếp các ô đất tăng dần theo giá trị niêm yết
  const sortedCells = [...unmortgagedCells].sort((a, b) => {
    const priceA = PROPERTY_DEEDS.get(a)?.price ?? 0;
    const priceB = PROPERTY_DEEDS.get(b)?.price ?? 0;
    return priceA - priceB;
  });

  const requiredCollateralValue = Math.floor(principal * tranche.collateralRatio);
  let accumulatedValue = 0;
  const selectedCollaterals: number[] = [];

  for (const cell of sortedCells) {
    selectedCollaterals.push(cell);
    accumulatedValue += PROPERTY_DEEDS.get(cell)?.price ?? 0;
    if (accumulatedValue >= requiredCollateralValue && selectedCollaterals.length >= BOND_MIN_PROPERTIES) {
      break;
    }
  }

  if (accumulatedValue < requiredCollateralValue || selectedCollaterals.length < BOND_MIN_PROPERTIES) {
    return { valid: false, reason: ActionRejectReason.BOND_NOT_ELIGIBLE };
  }

  return { valid: true, principal, collateralCells: selectedCollaterals, tranche };
}

export function handleIssueBond(
  room: Room,
  playerId: string,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  trancheId?: BondTrancheId,
): { success: boolean; reason?: string; bondContract?: BondContract } {
  const validation = validateIssueBond(room, playerId, registry, stateMap, trancheId);
  if (!validation.valid || validation.principal === undefined || !validation.collateralCells) {
    return { success: false, reason: validation.reason };
  }

  const player = room.players.find((p) => p.id === playerId)!;
  player.balance += validation.principal;

  const interestRate = validation.tranche ? validation.tranche.interestRate : BOND_INTEREST_RATE;
  const durationRounds = validation.tranche ? validation.tranche.durationRounds : BOND_DURATION_ROUNDS;

  const contract: BondContract = {
    trancheId: validation.tranche?.id,
    principal: validation.principal,
    repayAmount: Math.floor(validation.principal * (1 + interestRate)),
    roundsLeft: durationRounds,
    collateralCells: validation.collateralCells,
    isActive: true,
  };
  player.bondContract = contract;

  if (
    room.phase === TurnPhase.InsolvencyPhase &&
    room.players[room.currentPlayerIndex]?.id === player.id &&
    player.balance >= 0
  ) {
    room.phase = TurnPhase.PropertyManagement;
  }

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
  const interestPaid = Math.max(0, player.bondContract.repayAmount - player.bondContract.principal);
  room.treasury = (room.treasury ?? 0) + interestPaid;
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
    insolvencyPlayerId: bankruptPlayerId,
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

  // Nhánh 1: Chưa đến hạn tất toán (roundsLeft > 1) -> Đếm lùi 1 vòng
  if (player.bondContract.roundsLeft > 1) {
    player.bondContract = { ...player.bondContract, roundsLeft: player.bondContract.roundsLeft - 1 };
    return;
  }

  // Nhánh 2: Đáo hạn (roundsLeft === 1) và đủ tiền tất toán
  if (player.balance >= player.bondContract.repayAmount) {
    player.balance -= player.bondContract.repayAmount;
    const interestPaid = Math.max(0, player.bondContract.repayAmount - player.bondContract.principal);
    room.treasury = (room.treasury ?? 0) + interestPaid;
    player.bondContract = null;
    return;
  }

  // Nhánh 3: Đáo hạn (roundsLeft === 1) nhưng không đủ tiền -> VỠ NỢ TRÁI PHIẾU
  const cash = Math.min(Math.max(0, player.balance), player.bondContract.repayAmount);
  player.balance -= cash;
  room.treasury = (room.treasury ?? 0) + cash;

  const cells = [...player.bondContract.collateralCells];
  for (const cell of cells) {
    registry.delete(cell);
    stateMap.delete(cell);
  }

  room.fireSaleQueue = cells;
  room.fireSaleDebtorId = player.id;
  player.bondContract = null;

  // Bắn Event thông báo biến cố vỡ nợ đồng thời chuyển pha sang Đấu Giá Phát Mãi
  room.lastEventCard = {
    id: 'EVENT_BOND_DEFAULT',
    type: 'Market',
    title: 'VỠ NỢ TRÁI PHIẾU',
    description: `Người chơi ${player.name} không đủ tiền tất toán trái phiếu. Tiền mặt bị thu hồi và ${cells.length} BĐS thế chấp được chuyển vào danh mục phát mãi!`,
    playerId: player.id,
  };

  if (room.fireSaleQueue.length > 0) {
    const first = room.fireSaleQueue.shift()!;
    handleStartFireSaleAuction(room, first, auctions, roomCode ?? room.roomCode, player.id);
  }
}
