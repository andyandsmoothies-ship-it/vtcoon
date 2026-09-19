// [UC-BOT-03/MSS][IMP-58/MSS] Autonomous Mortgage Redemption Engine
// Domain-only module: does not import Server or Client

import type { Player, Room } from '../room';
import { BOARD_CONFIG } from '../board_config';
import { PROPERTY_DEEDS, type PropertyRegistry, type PropertyStateMap } from '../property_data';
import { resolveRent } from '../property_rent';
import { BotPersonality } from './bot_types';
import { calculateThreatHorizon } from './threat_forecaster';

interface RedeemCandidate {
  readonly cellIndex: number;
  readonly isMonopoly: boolean;
  readonly rent: number;
  readonly cost: number;
}

function isMonopolyGroup(cellIndex: number, botId: string, registry: PropertyRegistry): boolean {
  const cell = BOARD_CONFIG[cellIndex];
  if (!cell?.colorGroup) return false;
  const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
  return groupCells.length > 0 && groupCells.every((c) => registry.get(c.index) === botId);
}

function getRedeemCost(cellIndex: number, bot: Player): number {
  const deed = PROPERTY_DEEDS.get(cellIndex);
  const price = deed?.price ?? 0;
  const loan = bot.mortgageLoans?.[cellIndex] ?? Math.floor(price * 0.5);
  return Math.floor(loan * 1.1);
}

function collectMortgagedCells(bot: Player, registry: PropertyRegistry, stateMap: PropertyStateMap): number[] {
  const source = bot.mortgagedProperties ?? [];
  const list: number[] = [];
  for (const idx of source) {
    if (registry.get(idx) === bot.id && stateMap.get(idx)?.isMortgaged !== false && !list.includes(idx)) {
      list.push(idx);
    }
  }
  return list;
}

function compareRedeemCandidates(a: RedeemCandidate, b: RedeemCandidate): number {
  if (a.isMonopoly !== b.isMonopoly) return a.isMonopoly ? -1 : 1;
  if (a.rent !== b.rent) return b.rent - a.rent;
  if (a.cost !== b.cost) return a.cost - b.cost;
  return a.cellIndex - b.cellIndex;
}

function toRedeemCandidate(
  cellIndex: number,
  bot: Player,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  requiredSafety: number,
): RedeemCandidate | null {
  const cost = getRedeemCost(cellIndex, bot);
  if (bot.balance - cost < requiredSafety) return null;

  const cell = BOARD_CONFIG[cellIndex];
  const rent = cell ? resolveRent(cell, cellIndex, bot.id, registry, stateMap) : 0;
  const isMono = isMonopolyGroup(cellIndex, bot.id, registry);

  return { cellIndex, isMonopoly: isMono, rent, cost };
}

/**
 * Tim o dat the chap phu hop nhat de chuoc lai theo 3 tang uu tien:
 * 1. O thuoc bo mau doc quyen (khoi phuc quyen thu thue x2/x3).
 * 2. O co tien thue cao nhat.
 * 3. O co chi phi chuoc thap nhat.
 * Dieu kien: bot.balance - cost >= safetyBuffer * bufferMultiplier.
 */
export function findEligibleRedeemCell(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality?: BotPersonality,
): number | null {
  const mortgaged = collectMortgagedCells(bot, registry, stateMap);
  if (mortgaged.length === 0) return null;

  const threat = calculateThreatHorizon(bot, room, registry, stateMap, personality);
  const bufferMult = personality === BotPersonality.Aggressive ? 1.0 : 1.2;
  const requiredSafety = Math.round(threat.safetyBuffer * bufferMult);

  const candidates: RedeemCandidate[] = [];
  for (const cellIndex of mortgaged) {
    const candidate = toRedeemCandidate(cellIndex, bot, registry, stateMap, requiredSafety);
    if (candidate) candidates.push(candidate);
  }

  if (candidates.length === 0) return null;
  candidates.sort(compareRedeemCandidates);
  return candidates[0]!.cellIndex;
}

/**
 * Lựa chọn ô đất thế chấp để chuộc lại, ưu tiên hàng đầu cho ô thuộc bộ màu độc quyền.
 */
export function selectMortgageToRedeem(
  bot: Player,
  stateMap: PropertyStateMap,
  registry: PropertyRegistry,
  minBuffer: number = 300,
): number | undefined {
  const mortgaged = collectMortgagedCells(bot, registry, stateMap);
  if (mortgaged.length === 0) return undefined;

  const candidates: RedeemCandidate[] = [];
  for (const cellIndex of mortgaged) {
    const candidate = toRedeemCandidate(cellIndex, bot, registry, stateMap, minBuffer);
    if (candidate) candidates.push(candidate);
  }

  if (candidates.length === 0) return undefined;
  candidates.sort(compareRedeemCandidates);
  return candidates[0]?.cellIndex;
}
