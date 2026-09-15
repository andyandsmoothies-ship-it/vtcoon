// [UC-BOT-01/MSS][UC-GAME-047/MSS][IMP-58/MSS] Stage-Aware Tactical Audit Bailout Engine
// Domain-only module: does not import Server or Client

import type { Player, Room } from '../room';
import { BOARD_CONFIG } from '../board_config';
import { isPurchasable, type PropertyRegistry, type PropertyStateMap } from '../property_data';
import { BotPersonality, DEFAULT_MIN_SAFETY_BUFFER } from './bot_types';
import { calculateThreatHorizon } from './threat_forecaster';

export const BAIL_OUT_FINE = 500;
export const UNCLAIMED_EARLY_GAME_THRESHOLD = 8;
export const AUDIT_CELL_INDEX = 10;

function countUnclaimedProperties(registry: PropertyRegistry): number {
  let count = 0;
  for (const cell of BOARD_CONFIG) {
    if (isPurchasable(cell.index) && !registry.has(cell.index)) {
      count++;
    }
  }
  return count;
}

/**
 * Quyet dinh co nop tien bao lanh (INTENT_BAIL_OUT) hay o lai trong tu tru an.
 * Dau tran (unclaimed >= 8): Ra tu ngay de tranh gianh quyen mua dat (neu du dem an toan minBuffer).
 * Cuoi tran (unclaimed < 8): O lai tru an neu phia truoc co nguy co mat tien thue (threat.dangerTilesCount > 0).
 */
export function decideAuditBailout(
  bot: Player,
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  personality?: BotPersonality,
): boolean {
  if (bot.auditTurnsLeft <= 0 || bot.balance < BAIL_OUT_FINE) return false;

  const auditBot = bot.position === AUDIT_CELL_INDEX ? bot : { ...bot, position: AUDIT_CELL_INDEX };
  const threat = calculateThreatHorizon(auditBot, room, registry, stateMap, personality);
  const minBuffer = threat?.safetyBuffer ?? DEFAULT_MIN_SAFETY_BUFFER;

  if (bot.balance - BAIL_OUT_FINE < minBuffer) return false;

  const unclaimedCount = countUnclaimedProperties(registry);
  if (unclaimedCount >= UNCLAIMED_EARLY_GAME_THRESHOLD) return true;

  return threat.dangerTilesCount === 0;
}
