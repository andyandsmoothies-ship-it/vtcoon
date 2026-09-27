// [UC-BOT-06/MSS][IMP-203] Bot Monopoly Gap Detection Utilities (Zero-Dependency Leaf Module)
import { BOARD_CONFIG, ColorGroup } from '../board_config.js';
import type { PropertyRegistry, PropertyStateMap } from '../property_data.js';
import type { Player, Room } from '../room.js';

export interface MonopolyGap {
  readonly cellIndex: number;
  readonly targetOwnerId: string;
  readonly isMortgaged?: boolean;
  readonly mortgageLoan?: number;
}

/**
 * Quét các nhóm màu có khả năng xây dựng, phát hiện nhóm màu mà Bot đang sở hữu N-1 ô.
 * Ô còn thiếu (gapCell) phải thuộc người chơi khác, không cầm cố và chưa có công trình.
 */
export function findAllMonopolyGaps(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): MonopolyGap[] {
  const gaps: MonopolyGap[] = [];
  for (const group of Object.values(ColorGroup)) {
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === group);
    const totalCount = groupCells.length;
    if (totalCount < 2) continue;

    const botOwned = groupCells.filter((c) => registry.get(c.index) === bot.id);
    if (botOwned.length === totalCount - 1) {
      const gapCell = groupCells.find((c) => registry.get(c.index) !== bot.id);
      if (!gapCell) continue;

      const targetOwnerId = registry.get(gapCell.index);
      if (!targetOwnerId || targetOwnerId === bot.id) continue;

      const targetOwner = room.players.find((p) => p.id === targetOwnerId);
      if (!targetOwner || targetOwner.bankrupt) continue;

      const state = stateMap.get(gapCell.index);
      if ((state?.level ?? 0) > 0) continue; // Ô đất đã có công trình, không thể giao dịch

      const isMortgaged = Boolean(
        state?.isMortgaged || targetOwner.mortgagedProperties?.includes(gapCell.index),
      );
      const loan = targetOwner.mortgageLoans?.[gapCell.index];
      const gap: MonopolyGap = {
        cellIndex: gapCell.index,
        targetOwnerId,
      };
      if (isMortgaged) {
        Object.defineProperty(gap, 'isMortgaged', { value: true, enumerable: false, configurable: true, writable: true });
      }
      if (loan !== undefined) {
        Object.defineProperty(gap, 'mortgageLoan', { value: loan, enumerable: false, configurable: true, writable: true });
      }
      gaps.push(gap);
    }
  }

  return gaps;
}

export function findMonopolyGap(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): MonopolyGap | null {
  return findAllMonopolyGaps(bot, room, registry, stateMap).find((g) => !g.isMortgaged) ?? null;
}

