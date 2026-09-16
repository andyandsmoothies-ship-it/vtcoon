// [UC-GAME-038..041/MSS] Chance Card Handlers — 20 Chance Cards
// Extracted from card_handlers.ts — Slice 06 refactor (DEBT-S06-06)

import type { Player, MarketModifier, Room } from './room';
import type { PropertyRegistry, PropertyStateMap } from './property_data';
import { PROPERTY_DEEDS } from './property_data';
import { BOARD_CONFIG, CellType } from './board_config';
import {
  MarketCardId,
  ChanceCardId,
  SERVICE_CELLS,
  INFRA_CELLS,
} from './event_card_types';

const DEBT_AMOUNTS: Readonly<Record<string, number>> = {
  [ChanceCardId.CC_OVERDRAFT]: 3000,
  [ChanceCardId.CC_FREE_CREDIT]: 2000,
};

function handleTaxAudit(player: Player, registry?: PropertyRegistry, stateMap?: PropertyStateMap, room?: Room): void {
  if (!registry) return;
  let unbuiltCount = 0;
  for (const [cellIndex, ownerId] of registry) {
    if (ownerId === player.id) {
      const isProperty = BOARD_CONFIG[cellIndex]?.type === CellType.Property;
      if (isProperty && (stateMap?.get(cellIndex)?.level ?? 0) === 0) unbuiltCount++;
    }
  }
  const penalty = unbuiltCount * 500;
  player.balance -= penalty;
  if (room) room.treasury = (room.treasury ?? 0) + penalty;
}

function handleContractPenalty(player: Player, players: Player[]): void {
  player.balance -= 1000;
  const opponents = players.filter((p) => p.id !== player.id);
  if (opponents.length === 0) return;
  let poorest = opponents[0]!;
  for (let i = 1; i < opponents.length; i++) {
    if (opponents[i]!.balance < poorest.balance) poorest = opponents[i]!;
  }
  poorest.balance += 1000;
}

function handleFranchise(player: Player, players: Player[]): void {
  for (const p of players) {
    if (p.id !== player.id) {
      p.balance -= 800;
      player.balance += 800;
    }
  }
}

function handleLandReclaim(player: Player, registry?: PropertyRegistry, stateMap?: PropertyStateMap): void {
  if (!registry) return;
  for (const [cellIndex, ownerId] of registry) {
    if (ownerId === player.id) {
      const isProperty = BOARD_CONFIG[cellIndex]?.type === CellType.Property;
      const level = stateMap?.get(cellIndex)?.level ?? 0;
      if (isProperty && level === 0) {
        const price = PROPERTY_DEEDS.get(cellIndex)?.price ?? 0;
        registry.delete(cellIndex);
        player.balance += Math.floor(price * 1.5);
        return;
      }
    }
  }
}

function handleMaForce(player: Player, players: Player[], registry?: PropertyRegistry, stateMap?: PropertyStateMap): void {
  if (!registry) return;
  const opponents = players.filter((p) => p.id !== player.id && p.balance < player.balance);
  for (const opp of opponents) {
    for (const [cellIndex, ownerId] of registry) {
      if (ownerId === opp.id) {
        const isProperty = BOARD_CONFIG[cellIndex]?.type === CellType.Property;
        const level = stateMap?.get(cellIndex)?.level ?? 0;
        if (isProperty && level === 0) {
          const deed = PROPERTY_DEEDS.get(cellIndex);
          const cost = deed ? Math.floor(deed.price * 1.2) : 0;
          if (player.balance >= cost) {
            player.balance -= cost;
            opp.balance += cost;
            registry.set(cellIndex, player.id);
            return;
          }
        }
      }
    }
  }
}

function handleSwapProject(
  player: Player,
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
  room?: Room,
  players?: Player[],
): void {
  if (!registry) return;

  const isCellMortgaged = (cell: number, ownerId: string): boolean => {
    if (stateMap?.get(cell)?.isMortgaged) return true;
    const p = room?.players.find((pl) => pl.id === ownerId) ?? players?.find((pl) => pl.id === ownerId);
    return Boolean(p?.mortgagedProperties?.includes(cell));
  };

  // 1. Tìm ô C0 của player (chưa thế chấp)
  const playerC0Cells: number[] = [];
  for (const [cell, owner] of registry.entries()) {
    if (owner === player.id && (stateMap?.get(cell)?.level ?? 0) === 0 && !isCellMortgaged(cell, owner)) {
      playerC0Cells.push(cell);
    }
  }

  // 2. Tìm ô C0 của đối thủ (chưa thế chấp)
  const oppC0Cells: { cell: number; owner: string }[] = [];
  for (const [cell, owner] of registry.entries()) {
    if (owner !== player.id && (stateMap?.get(cell)?.level ?? 0) === 0 && !isCellMortgaged(cell, owner)) {
      oppC0Cells.push({ cell, owner });
    }
  }

  // Trường hợp 1: Hoán đổi chuẩn (cả 2 đều có C0 chưa thế chấp)
  if (playerC0Cells.length > 0 && oppC0Cells.length > 0) {
    const c1 = playerC0Cells[0]!;
    const c2 = oppC0Cells[0]!;
    registry.set(c1, c2.owner);
    registry.set(c2.cell, player.id);
    return;
  }

  // Fallback A: Người rút có C0, nhưng đối thủ không có C0
  if (playerC0Cells.length > 0 && oppC0Cells.length === 0) {
    const targetCell = playerC0Cells[0]!;
    const state = stateMap?.get(targetCell);
    if (state) {
      state.level = 1;
    }
    return;
  }

  // Fallback B: Đối thủ có C0, nhưng người rút không có C0
  if (playerC0Cells.length === 0 && oppC0Cells.length > 0) {
    const target = oppC0Cells[0]!;
    const deed = PROPERTY_DEEDS.get(target.cell);
    const basePrice = deed?.price ?? 1000;
    const compulsoryCost = Math.floor(basePrice * 1.3);

    if (player.balance >= compulsoryCost) {
      player.balance -= compulsoryCost;
      const seller = room?.players.find((p) => p.id === target.owner) ?? players?.find((p) => p.id === target.owner);
      if (seller) {
        seller.balance += compulsoryCost;
      }
      registry.set(target.cell, player.id);
    } else {
      player.balance += 800;
      if (room) room.treasury = Math.max(0, (room.treasury ?? 0) - 800);
    }
    return;
  }

  // Fallback C: Cả 2 đều không có C0 hợp lệ
  player.balance += 1000;
  if (room) room.treasury = Math.max(0, (room.treasury ?? 0) - 1000);
}

// Command Dispatcher — giảm CC từ 22 xuống ≤ 5
type ChanceHandler = (
  player: Player,
  players: Player[],
  playerId: string,
  activeModifiers?: MarketModifier[],
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
  permanentRentBonus?: Record<number, number>,
  room?: Room,
) => void;

const CHANCE_HANDLERS: Partial<Record<ChanceCardId, ChanceHandler>> = {
  [ChanceCardId.CC_STOCK_PROFIT]: (player) => { player.balance += 2500; },
  [ChanceCardId.CC_DIPLOMATIC]:   (player) => { player.hand.push(ChanceCardId.CC_DIPLOMATIC); },
  [ChanceCardId.CC_TAX_AUDIT]:    (player, _players, _id, _mods, registry, stateMap, _bonus, room) => handleTaxAudit(player, registry, stateMap, room),
  [ChanceCardId.CC_OVERDRAFT]: (player) => {
    // [DEBT-S06-01] +3.000 Tr., bộ đếm 3 vòng, ghi vào pendingDebts
    player.balance += 3_000;
    player.overdraftRoundsLeft = 3;
    if (!player.pendingDebts.includes(ChanceCardId.CC_OVERDRAFT)) {
      player.pendingDebts.push(ChanceCardId.CC_OVERDRAFT);
    }
  },
  [ChanceCardId.CC_FREE_CREDIT]: (player) => {
    // [DEBT-S06-02] +2.000 Tr., thẻ vào hand[] (KHÔNG vào pendingDebts)
    player.balance += 2_000;
    if (!player.hand.includes(ChanceCardId.CC_FREE_CREDIT)) {
      player.hand.push(ChanceCardId.CC_FREE_CREDIT);
    }
  },
  [ChanceCardId.CC_PLATE_AUCTION]: (player) => {
    player.balance -= 500;
    player.extraTurns += 1;
  },
  [ChanceCardId.CC_CONTRACT_PENALTY]: (player, players) => handleContractPenalty(player, players),
  [ChanceCardId.CC_LAND_CHANGE]: (player, _players, _id, _mods, registry, stateMap, permanentRentBonus) => {
    // Trừ 800 Tr và tăng vĩnh viễn +50% thu phí của 1 ô đất trống tùy chọn đang sở hữu
    player.balance -= 800;
    if (registry && permanentRentBonus) {
      const ownedEmpty = Array.from(registry.entries()).find(
        ([c, o]) => o === player.id &&
          BOARD_CONFIG[c]?.type === CellType.Property &&
          (stateMap?.get(c)?.level ?? 0) === 0 &&
          !(permanentRentBonus[c]),
      );
      if (ownedEmpty) permanentRentBonus[ownedEmpty[0]] = 0.5;
    }
  },
  [ChanceCardId.CC_BUILD_HALT]: (player, _players, _id, activeModifiers, registry, _sm, _bonus, room) => {
    player.balance -= 800;
    if (room) room.treasury = (room.treasury ?? 0) + 800;
    if (registry && activeModifiers) {
      const owned = Array.from(registry.entries()).find(([c, o]) => o === player.id && BOARD_CONFIG[c]?.type === CellType.Property);
      if (owned) activeModifiers.push({ type: MarketCardId.MC_COASTAL_STORM, affectedCells: [owned[0]], remainingRounds: 2, multiplier: 0 });
    }
  },
  [ChanceCardId.CC_MA_FORCE]: (player, players, _id, _mods, registry, stateMap) => handleMaForce(player, players, registry, stateMap),
  [ChanceCardId.CC_COPYRIGHT]:  (player, _players, _id, _mods, _reg, _sm, _bonus, room) => {
    player.balance -= 1200;
    if (room) room.treasury = (room.treasury ?? 0) + 1200;
  },
  [ChanceCardId.CC_JUNK_STOCK]: (player) => { player.balance -= 1500; },
  [ChanceCardId.CC_FRANCHISE]: (player, players) => handleFranchise(player, players),
  [ChanceCardId.CC_LAND_RECLAIM]: (player, _players, _id, _mods, registry, stateMap) => handleLandReclaim(player, registry, stateMap),
  [ChanceCardId.CC_VENUE_INCIDENT]: (player, _players, _id, _mods, registry, _sm, _bonus, room) => {
    const ownsService = registry
      ? Array.from(registry.entries()).some(
          ([c, o]) => o === player.id && (SERVICE_CELLS as readonly number[]).includes(c),
        )
      : false;
    if (ownsService) {
      player.balance -= 1200;
      if (room) room.treasury = (room.treasury ?? 0) + 1200;
    } else {
      player.balance -= 600;
      if (room) room.treasury = (room.treasury ?? 0) + 600;
    }
  },
  [ChanceCardId.CC_CONCERT_SPONSOR]: (player) => {
    player.balance -= 600;
    player.doubleNextDice = true;
  },
  [ChanceCardId.CC_PORT_EXCLUSIVE]: (player, _players, playerId, activeModifiers, _reg, _sm, _bonus, room) => {
    player.balance += 1000;
    if (room) room.treasury = Math.max(0, (room.treasury ?? 0) - 1000);
    if (activeModifiers) {
      activeModifiers.push({
        type: ChanceCardId.CC_PORT_EXCLUSIVE,
        affectedCells: INFRA_CELLS,
        remainingRounds: 2,
        multiplier: 0.5,
        beneficiaryId: playerId,
      });
    }
  },
  [ChanceCardId.CC_SLOW_BUILD]: (player, _players, _id, _mods, registry, stateMap) => {
    // [DEBT-S06-03] Bắt đầu đếm 3 vòng — KHÔNG xóa registry ngay
    if (!registry || !stateMap) return;
    for (const [cellIndex, ownerId] of registry.entries()) {
      if (ownerId !== player.id) continue;
      const state = stateMap.get(cellIndex);
      if (!state || state.level !== 0) continue;
      stateMap.set(cellIndex, { ...state, unbuiltRounds: 1 });
      break;
    }
  },
  [ChanceCardId.CC_MEDIA_CRISIS]: (player, _players, _id, activeModifiers, registry, _sm, _bonus, room) => {
    player.balance -= 800;
    if (room) room.treasury = (room.treasury ?? 0) + 800;
    if (registry && activeModifiers) {
      const sCell = Array.from(registry.entries()).find(([c, o]) => o === player.id && (SERVICE_CELLS as readonly number[]).includes(c))
        ?? Array.from(registry.entries()).find(([c, o]) => o === player.id && BOARD_CONFIG[c]?.type === CellType.Property);
      if (sCell) activeModifiers.push({ type: MarketCardId.MC_COASTAL_STORM, affectedCells: [sCell[0]], remainingRounds: 2, multiplier: 0 });
    }
  },
  [ChanceCardId.CC_SWAP_PROJECT]: (player, players, _id, _mods, registry, stateMap, _bonus, room) =>
    handleSwapProject(player, registry, stateMap, room, players),
};

export function executeChanceCard(
  card: ChanceCardId,
  playerId: string,
  players: Player[],
  activeModifiers?: MarketModifier[],
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
  permanentRentBonus?: Record<number, number>,
  room?: Room,
): Record<string, never> {
  const player = players.find((p) => p.id === playerId);
  if (!player) return {};
  const handler = CHANCE_HANDLERS[card];
  if (handler) handler(player, players, playerId, activeModifiers, registry, stateMap, permanentRentBonus, room);
  return {};
}
