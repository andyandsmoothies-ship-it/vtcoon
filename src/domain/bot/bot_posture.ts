// [UC-BOT-05/MSS][IMP-120/MSS] Bot Posture, Net Worth Evaluation, Ambush Calculation & Proactive Mortgage
// Domain-only module: does not import Server or Client

import type { Player, Room } from '../room';
import { BOARD_SIZE } from '../room';
import { BOARD_CONFIG, CellType } from '../board_config';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../property_data';
import { hasMonopoly } from '../property_upgrade';
import { BotPosture, DICE_2D6_PROBABILITIES } from './bot_types';

const LEVEL_MULTIPLIER: Record<number, number> = { 0: 1, 1: 1.5, 2: 2.5, 3: 4 };

/**
 * Lấy danh sách các nhóm màu đã hoàn thành độc quyền và đủ điều kiện xây dựng (không có ô nào bị thế chấp).
 */
export function getBuildableGroups(
  botId: string,
  mortgagedProperties: readonly number[] | undefined,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): Set<string> {
  const isMortgaged = (idx: number) =>
    Boolean(mortgagedProperties?.includes(idx) || stateMap.get(idx)?.isMortgaged);

  const ownedGroups = new Set<string>();
  for (const cell of BOARD_CONFIG) {
    if (cell.colorGroup && hasMonopoly(botId, cell.index, registry, stateMap)) {
      const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
      const hasMortgaged = groupCells.some((c) => isMortgaged(c.index));
      if (!hasMortgaged) ownedGroups.add(cell.colorGroup);
    }
  }
  return ownedGroups;
}

/**
 * Tính toán chính xác tổng tài sản ròng (Net Worth) của một người chơi:
 * Tiền mặt + Giá trị các ô đất sở hữu (50% nếu đang thế chấp) + Giá trị theo cấp công trình (C0..C3).
 */
export function evaluatePlayerNetWorth(
  playerId: string,
  players: readonly Player[],
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): number {
  const p = players.find((x) => x.id === playerId);
  if (!p || p.bankrupt) return 0;

  let total = p.balance;
  for (const [cellIdx, ownerId] of registry.entries()) {
    if (ownerId !== playerId) continue;
    const deed = PROPERTY_DEEDS.get(cellIdx);
    if (!deed) continue;

    const isMortgaged = Boolean(
      p.mortgagedProperties?.includes(cellIdx) || stateMap.get(cellIdx)?.isMortgaged,
    );

    if (isMortgaged) {
      total += Math.floor(deed.price * 0.5);
    } else {
      const level = stateMap.get(cellIdx)?.level ?? 0;
      const mult = LEVEL_MULTIPLIER[level] ?? 1;
      total += Math.floor(deed.price * mult);
    }
  }

  return total;
}

/**
 * Kiểm tra xem một người chơi có đang là Kẻ Dẫn Đầu (Leading Player) áp đảo hay không.
 */
export function isLeadingPlayer(
  playerId: string,
  players: readonly Player[],
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): boolean {
  const active = players.filter((p) => !p.bankrupt);
  if (active.length === 0) return false;

  const ranks = active
    .map((p) => ({ id: p.id, nw: evaluatePlayerNetWorth(p.id, players, registry, stateMap) }))
    .sort((a, b) => b.nw - a.nw);

  const top = ranks[0];
  if (!top || top.id !== playerId) return false;
  if (ranks.length === 1) return true;

  const secondNw = ranks[1]?.nw ?? 0;
  return top.nw >= 18000 && (top.nw >= secondNw * 1.3 || top.nw >= secondNw + 5000);
}

/**
 * Đánh giá vị thế (Posture) của Bot tại thời điểm hiện tại:
 * - Leading: Top 1 tài sản vượt trội
 * - Trailing: Thua kém sâu tài sản hoặc đứng nhóm dưới ở nửa sau trận đấu
 * - Parity: Tranh chấp cân bằng ở nhóm giữa
 */
export function evaluateBotPosture(
  botId: string,
  players: readonly Player[],
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  round = 1,
): BotPosture {
  const active = players.filter((p) => !p.bankrupt);
  if (active.length <= 1) return BotPosture.Parity;

  const ranks = active
    .map((p) => ({ id: p.id, nw: evaluatePlayerNetWorth(p.id, players, registry, stateMap) }))
    .sort((a, b) => b.nw - a.nw);

  const top = ranks[0]!;
  const myRankIdx = ranks.findIndex((r) => r.id === botId);
  const myNw = ranks[myRankIdx]?.nw ?? 0;

  if (top.id === botId && myNw >= (ranks[1]?.nw ?? 0) * 1.25) {
    return BotPosture.Leading;
  }

  if (myRankIdx >= 2 || (top.nw >= myNw * 1.4 && round >= 15)) {
    return BotPosture.Trailing;
  }

  return BotPosture.Parity;
}

/**
 * Tính toán Ambush Score (Điểm bẫy đón đầu) cho một ô đất dựa trên vị trí đối thủ trong tầm xúc xắc 2D6.
 * Bước 5..9 có xác suất cao nhất. Tăng 1.5x nếu đối thủ là Người chơi thật hoặc Kẻ dẫn đầu.
 */
export function calculateAmbushScore(
  cellIndex: number,
  players: readonly Player[],
  currentBotId: string,
): number {
  let score = 0;

  for (const p of players) {
    if (p.id === currentBotId || p.bankrupt) continue;

    const botPos = Number.isFinite(p.position)
      ? ((Math.trunc(p.position) % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE
      : 0;

    const step = ((cellIndex - botPos) % BOARD_SIZE + BOARD_SIZE) % BOARD_SIZE;
    if (step >= 4 && step <= 10) {
      const prob = DICE_2D6_PROBABILITIES[step] ?? 0;
      const weight = !p.isBot ? 1.5 : 1.0;
      score += prob * weight;
    }
  }

  return score;
}

/**
 * Tìm ô đất C0 lẻ vô dụng để thế chấp chủ động (Proactive Mortgage),
 * lấy vốn nâng cấp ngay cho ô đất thuộc bộ màu độc quyền.
 */
export function findEligibleProactiveMortgage(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): number | null {
  const ownedGroups = getBuildableGroups(bot.id, bot.mortgagedProperties, registry, stateMap);
  if (ownedGroups.size === 0) return null;

  const candidateCells: number[] = [];
  for (const [cellIdx, ownerId] of registry.entries()) {
    if (ownerId !== bot.id) continue;
    const isMortgaged = Boolean(
      bot.mortgagedProperties?.includes(cellIdx) || stateMap.get(cellIdx)?.isMortgaged,
    );
    if (isMortgaged) continue;

    const cell = BOARD_CONFIG[cellIdx];
    if (!cell || cell.type !== CellType.Property) continue;
    if (ownedGroups.has(cell.colorGroup!)) continue;

    const state = stateMap.get(cellIdx) ?? { level: 0 };
    if (state.level > 0) continue;

    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
    const opponentOwned = groupCells.some((c) => {
      const o = registry.get(c.index);
      return o && o !== bot.id;
    });

    if (opponentOwned) {
      candidateCells.push(cellIdx);
    }
  }

  if (candidateCells.length === 0) return null;

  candidateCells.sort((a, b) => {
    const pA = PROPERTY_DEEDS.get(a)?.price ?? 0;
    const pB = PROPERTY_DEEDS.get(b)?.price ?? 0;
    return pB - pA;
  });

  return candidateCells[0] ?? null;
}
