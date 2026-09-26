// [UC-BOT-06/MSS][IMP-203] Bot Monopoly Gap Detection Utilities (Zero-Dependency Leaf Module)
import { BOARD_CONFIG, ColorGroup } from '../board_config.js';
import type { PropertyRegistry, PropertyStateMap } from '../property_data.js';
import type { Player, Room } from '../room.js';

export interface MonopolyGap {
  readonly cellIndex: number;
  readonly targetOwnerId: string;
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
      if (isMortgaged) continue; // Ô đất đang bị cầm cố

      gaps.push({ cellIndex: gapCell.index, targetOwnerId });
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
  return findAllMonopolyGaps(bot, room, registry, stateMap)[0] ?? null;
}
