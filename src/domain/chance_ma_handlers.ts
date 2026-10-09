// [IMP-309] Corporate M&A and Compulsory Buyout Chance Card Handlers
import type { Player, Room, BuyoutTargetOption } from './room.js';
import type { PropertyRegistry, PropertyStateMap } from './property_data.js';
import { PROPERTY_DEEDS } from './property_data.js';
import { BOARD_CONFIG, CellType } from './board_config.js';
import {
  calculateCompulsoryBuyoutCost,
  isEligibleForCompulsoryBuyout,
} from './compulsory_buyout.js';

export function applyCompensatorySubsidy(player: Player, room?: Room, amount = 800): void {
  player.balance += amount;
  if (room) room.treasury = Math.max(0, (room.treasury ?? 0) - amount);
}

export function handleMaForce(
  player: Player,
  players: Player[],
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
  room?: Room,
): void {
  if (!registry) return;

  const isCellMortgaged = (cell: number, ownerId: string): boolean => {
    if (stateMap?.get(cell)?.isMortgaged) return true;
    const p = room?.players.find((pl) => pl.id === ownerId) ?? players.find((pl) => pl.id === ownerId);
    return Boolean(p?.mortgagedProperties?.includes(cell));
  };

  for (const [cellIndex, ownerId] of registry) {
    if (ownerId !== player.id && !isCellMortgaged(cellIndex, ownerId)) {
      const seller = room?.players.find((p) => p.id === ownerId) ?? players.find((p) => p.id === ownerId);
      if (!seller || seller.bankrupt) continue;
      const isProperty = BOARD_CONFIG[cellIndex]?.type === CellType.Property;
      const level = stateMap?.get(cellIndex)?.level ?? 0;
      if (isProperty && level === 0) {
        const deed = PROPERTY_DEEDS.get(cellIndex);
        const cost = deed ? Math.floor(deed.price * 1.2) : 0;
        if (player.balance >= cost) {
          player.balance -= cost;
          seller.balance += cost;
          registry.set(cellIndex, player.id);
          if (room) {
            const cellName = BOARD_CONFIG[cellIndex]?.name ?? `Ô #${cellIndex}`;
            const sellerName = seller.name ?? `Người chơi ${seller.id}`;
            room.lastMaBuyout = { cellIndex, cellName, sellerId: seller.id, sellerName, cost };
          }
          return;
        }
      }
    }
  }

  // Fallback: Không có ô C0 đối thủ hoặc người chơi không đủ tiền mua lại
  // Nhận trợ cấp M&A từ Kho Bạc Nhà Nước: 800 Tr.
  player.balance += 800;
  if (room) {
    room.treasury = Math.max(0, (room.treasury ?? 0) - 800);
    room.lastMaBuyout = undefined;
  }
}

export function handleSwapProject(
  player: Player,
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
  room?: Room,
  players?: Player[],
): void {
  if (!registry) return;

  const oppC0Cells: { cell: number; owner: string }[] = [];
  for (const [cell, owner] of registry.entries()) {
    if (owner !== player.id && isEligibleForCompulsoryBuyout(cell, owner, registry, stateMap, room, players)) {
      oppC0Cells.push({ cell, owner });
    }
  }

  if (oppC0Cells.length === 0) {
    applyCompensatorySubsidy(player, room, 1000);
    return;
  }

  const eligibleTargets: BuyoutTargetOption[] = oppC0Cells.map((opp) => ({
    cellIndex: opp.cell,
    sellerId: opp.owner,
    cost: calculateCompulsoryBuyoutCost(opp.cell),
    basePrice: PROPERTY_DEEDS.get(opp.cell)?.price ?? 1000,
  }));

  const minCost = Math.min(...eligibleTargets.map((t) => t.cost));
  const defaultTarget = eligibleTargets.find((t) => player.balance >= t.cost) ?? eligibleTargets[0]!;

  if (!player.isBot) {
    if (player.balance < minCost) {
      applyCompensatorySubsidy(player, room, 800);
      return;
    }
    if (!room) {
      player.balance -= defaultTarget.cost;
      const seller = players?.find((p) => p.id === defaultTarget.sellerId);
      if (seller) seller.balance += defaultTarget.cost;
      registry.set(defaultTarget.cellIndex, player.id);
      return;
    }
    room.pendingBuyout = {
      buyerId: player.id,
      sellerId: defaultTarget.sellerId,
      cellIndex: defaultTarget.cellIndex,
      cost: defaultTarget.cost,
      basePrice: defaultTarget.basePrice,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30_000,
      eligibleTargets,
    };
    return;
  }

  // Bot path: Ưu tiên ô an toàn (balance - cost >= 1000)
  const botTarget = eligibleTargets.find((t) => player.balance - t.cost >= 1000);
  if (!botTarget) {
    applyCompensatorySubsidy(player, room, 800);
    return;
  }
  player.balance -= botTarget.cost;
  const seller = room?.players.find((p) => p.id === botTarget.sellerId) ?? players?.find((p) => p.id === botTarget.sellerId);
  if (seller) seller.balance += botTarget.cost;
  registry.set(botTarget.cellIndex, player.id);
  if (room) room.pendingBuyout = null;
}
