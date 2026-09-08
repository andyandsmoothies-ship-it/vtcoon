// [UC-GAME-020,027/MSS] Property Actions — Buy & Upgrades
import type { Room, Player, MarketModifier } from '../domain/room';
import { TurnPhase } from '../domain/room';
import {
  buyProperty, BuyResult, upgradeProperty, upgradeETC, upgradeUtilityFull,
  type PropertyRegistry, type PropertyStateMap,
} from '../domain/property_manager';

export function handleBuyProperty(
  room: Room | undefined,
  current: Player | undefined,
  registry: PropertyRegistry | undefined,
): { result: BuyResult } | undefined {
  if (!current || !room || room.phase !== TurnPhase.ActionPhase || !registry) return undefined;
  const res = buyProperty(current, current.position, registry, room.activeModifiers);
  if (res.result === BuyResult.Success) room.phase = TurnPhase.PropertyManagement;
  return res;
}

export function handleUpgradeETC(
  current: Player | undefined,
  phase: TurnPhase | undefined,
  registry: PropertyRegistry | undefined,
  stateMap: PropertyStateMap | undefined,
): { success: boolean; reason?: string } {
  if (!current || phase !== TurnPhase.PropertyManagement) return { success: false, reason: 'INVALID_PHASE' };
  if (!registry || !stateMap) return { success: false, reason: 'INVALID_ROOM' };
  return upgradeETC(current, registry, stateMap);
}

export function handleUpgradeUtility(
  current: Player | undefined,
  phase: TurnPhase | undefined,
  cellIndex: number,
  registry: PropertyRegistry | undefined,
  stateMap: PropertyStateMap | undefined,
): { success: boolean; reason?: string } {
  if (!current || phase !== TurnPhase.PropertyManagement) return { success: false, reason: 'INVALID_PHASE' };
  if (!registry || !stateMap) return { success: false, reason: 'INVALID_ROOM' };
  return upgradeUtilityFull(current, cellIndex, registry, stateMap);
}

export function handleUpgrade(
  current: Player | undefined,
  phase: TurnPhase | undefined,
  cellIndex: number,
  registry: PropertyRegistry | undefined,
  stateMap: PropertyStateMap | undefined,
  modifiers?: readonly MarketModifier[],
): { success: boolean; reason?: string } {
  if (!current || phase !== TurnPhase.PropertyManagement) return { success: false, reason: 'INVALID_PHASE' };
  if (!registry || !stateMap) return { success: false, reason: 'INVALID_ROOM' };
  return upgradeProperty(current, cellIndex, registry, stateMap, modifiers);
}
