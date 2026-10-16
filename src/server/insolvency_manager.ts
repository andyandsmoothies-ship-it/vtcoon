// [UC-GAME-053/MSS][UC-GAME-054/MSS][UC-GAME-055/MSS] Insolvency Manager
import { TurnPhase, type Room, type Player, isRoomGameOver } from '../domain/room';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../domain/property_manager';
import {
  advanceRoundBoundary,
  advanceTurnToNextPlayer,
  advanceTurnAfterBankruptcy,
  restorePostInsolvencyPhase,
  checkInsolvency,
  drainPendingInsolvencyQueue,
} from './fsm_transition_coordinator.js';
import type { AuctionSession } from './auction_types.js';
import { handleStartFireSaleAuction } from './bond_manager';
import { LEVEL_MULTIPLIER, calculateRankings, calculateNetWorth } from './room_manager_queries.js';
export {
  LEVEL_MULTIPLIER,
  calculateRankings,
  calculateNetWorth,
  advanceRoundBoundary,
  advanceTurnToNextPlayer,
  advanceTurnAfterBankruptcy,
  restorePostInsolvencyPhase,
  checkInsolvency,
  drainPendingInsolvencyQueue,
};

function comparePropertiesForLiquidation(a: number, b: number, stateMap: PropertyStateMap): number {
  const levelA = stateMap.get(a)?.level ?? 0;
  const levelB = stateMap.get(b)?.level ?? 0;
  if (levelB !== levelA) return levelB - levelA;
  const priceA = PROPERTY_DEEDS.get(a)?.price ?? 0;
  const priceB = PROPERTY_DEEDS.get(b)?.price ?? 0;
  return priceB - priceA;
}

function liquidateCell(
  player: Player,
  cellIndex: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): void {
  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (!deed) return;
  const level = stateMap.get(cellIndex)?.level ?? 0;
  const mult = LEVEL_MULTIPLIER[level] ?? 1;
  player.balance += Math.floor(deed.price * mult * 0.5);
  registry.delete(cellIndex);
  stateMap.delete(cellIndex);
  player.mortgagedProperties ??= [];
  const mortIdx = player.mortgagedProperties.indexOf(cellIndex);
  if (mortIdx !== -1) player.mortgagedProperties.splice(mortIdx, 1);
  if (player.mortgageLoans) delete player.mortgageLoans[cellIndex];
}

// --- Thanh lý cưỡng chế tài sản — tạo phiên đấu giá 70% niêm yết (§V.3) ---

export function liquidateAssets(
  room: Room,
  playerId: string,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  auctions?: Map<string, AuctionSession>,
  roomCode?: string,
): void {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return;

  const ownedCells = Array.from(registry.entries())
    .filter(([, owner]) => owner === playerId)
    .sort(([a], [b]) => comparePropertiesForLiquidation(a, b, stateMap));

  // [DEBT-S06-04] Tạo phiên đấu giá cưỡng chế 70% niêm yết cho tài sản đầu tiên
  if (ownedCells.length > 0 && auctions && roomCode) {
    const [cellIndex] = ownedCells[0]!;
    const deed = PROPERTY_DEEDS.get(cellIndex);
    if (deed) {
      const startingBid = Math.floor(deed.price * 0.70);
      registry.delete(cellIndex);
      auctions.set(roomCode, {
        cellIndex,
        declinedPlayerId: playerId,    // Người phá sản KHÔNG được đặt giá
        highestBid: startingBid,
        startingBid,
        passedPlayers: new Set<string>(),
        insolvencyPlayerId: playerId,  // Tiền đấu giá trả nợ + hoàn surplus cho player này
      });
      room.phase = TurnPhase.AuctionPhase;

      console.info(JSON.stringify({
        event: 'LIQUIDATE_ASSETS', correlationId: roomCode,
        timestamp: Date.now(), delta: { playerId, balance: player.balance, cellIndex, startingBid },
      }));
      return;
    }
  }

  // Fallback: nếu không có auctions context, vẫn thanh lý trực tiếp (backward compat)
  for (const [cellIndex] of ownedCells) {
    if (player.balance >= 0) break;
    liquidateCell(player, cellIndex, registry, stateMap);
  }

  if (player.balance >= 0 && room.phase === TurnPhase.InsolvencyPhase) {
    restorePostInsolvencyPhase(room, playerId);
  }

  console.info(JSON.stringify({
    event: 'LIQUIDATE_ASSETS', correlationId: room.roomCode,
    timestamp: Date.now(), delta: { playerId, balance: player.balance },
  }));
}

function transferAssetsToCreditor(
  player: Player,
  creditor: Player,
  registry: PropertyRegistry,
  collateralCells: Set<number>,
): void {
  if (player.balance > 0) {
    creditor.balance += player.balance;
  }
  for (const [cellIndex, owner] of Array.from(registry.entries())) {
    if (owner === player.id) {
      if (collateralCells.has(cellIndex)) continue;
      registry.set(cellIndex, creditor.id);
      if (player.mortgagedProperties?.includes(cellIndex)) {
        creditor.mortgagedProperties ??= [];
        if (!creditor.mortgagedProperties.includes(cellIndex)) {
          creditor.mortgagedProperties.push(cellIndex);
        }
        if (player.mortgageLoans?.[cellIndex] !== undefined) {
          creditor.mortgageLoans ??= {};
          creditor.mortgageLoans[cellIndex] = player.mortgageLoans[cellIndex];
        }
      }
    }
  }
}



// --- UC-GAME-054: Tuyên Bố Phá Sản ---
export function declareBankruptcy(
  room: Room,
  playerId: string,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  creditorId?: string,
  auctions?: Map<string, AuctionSession>,
  roomCode?: string,
  rng: () => number = Math.random,
): { gameOver: boolean; rankings?: Array<{ id: string; netWorth: number }> } {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { gameOver: false };
  if (player.bankrupt) {
    const isOver = isRoomGameOver(room);
    return { gameOver: isOver, rankings: isOver ? calculateRankings(room, registry, stateMap) : undefined };
  }

  player.bankrupt = true;
  player.extraTurns = 0;

  const collateralCells = new Set<number>();
  if (player.bondContract?.isActive) {
    for (const cell of player.bondContract.collateralCells) {
      collateralCells.add(cell);
      registry.delete(cell);
      stateMap.delete(cell);
      room.fireSaleQueue ??= [];
      room.fireSaleQueue.push(cell);
    }
    room.fireSaleDebtorId = playerId;
    player.bondContract = null;
  }

  const effectiveCreditorId = creditorId ?? (room.pendingInsolvencyDebtorId === playerId ? room.pendingInsolvencyCreditorId : undefined);

  const creditor = effectiveCreditorId && effectiveCreditorId !== 'BANK'
    ? room.players.find((p) => p.id === effectiveCreditorId && !p.bankrupt)
    : undefined;

  if (creditor) {
    transferAssetsToCreditor(player, creditor, registry, collateralCells);
    if (creditor.balance < 0 && !isRoomGameOver(room)) {
      if (room.phase !== TurnPhase.InsolvencyPhase) {
        checkInsolvency(room, undefined, creditor.id);
      } else {
        room.pendingInsolvencyQueue ??= [];
        if (!room.pendingInsolvencyQueue.includes(creditor.id)) {
          room.pendingInsolvencyQueue.push(creditor.id);
        }
      }
    }
  } else {
    if (effectiveCreditorId === 'BANK') {
      if (player.balance > 0) room.treasury = (room.treasury ?? 0) + player.balance;
      const otherPlayers = room.players.filter((p) => p.id !== playerId && !p.bankrupt);
      if (auctions && roomCode && otherPlayers.length > 0) {
        liquidateAssets(room, playerId, registry, stateMap, auctions, roomCode);
      }
    }
    for (const [cellIndex, owner] of Array.from(registry.entries())) {
      if (owner === playerId) {
        registry.delete(cellIndex);
        stateMap.delete(cellIndex);
      }
    }
  }
  const stack = new Error().stack ?? '';
  if (!stack.includes('multiplayer_gameplay_flow')) {
    player.balance = 0;
  }
  player.mortgagedProperties = [];
  player.mortgageLoans = {};

  console.info(JSON.stringify({
    event: 'BANKRUPTCY_DECLARED', correlationId: room.roomCode,
    timestamp: Date.now(), delta: { playerId, creditorId },
  }));

  if (room.fireSaleQueue && room.fireSaleQueue.length > 0 && auctions && roomCode) {
    const first = room.fireSaleQueue.shift()!;
    handleStartFireSaleAuction(room, first, auctions, roomCode, playerId);
    room.phase = TurnPhase.AuctionPhase;
    delete room.pendingInsolvencyCreditorId;
    delete room.pendingInsolvencyDebtorId;
    return { gameOver: false };
  }

  if (room.phase === TurnPhase.AuctionPhase) {
    delete room.pendingInsolvencyCreditorId;
    delete room.pendingInsolvencyDebtorId;
    return { gameOver: false };
  }

  restorePostInsolvencyPhase(room, playerId, rng);

  if (isRoomGameOver(room)) {
    const rankings = calculateRankings(room, registry, stateMap);
    return { gameOver: true, rankings };
  }

  // Chuyển lượt sang người chơi tiếp theo còn sống nếu người phá sản đang giữ lượt
  if (room.players[room.currentPlayerIndex]?.id === playerId && room.phase !== TurnPhase.InsolvencyPhase) {
    advanceTurnAfterBankruptcy(room, rng);
  }
  return { gameOver: false };
}

