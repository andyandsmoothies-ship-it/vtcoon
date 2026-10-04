// [UC-GAME-020,027/MSS][UC-GAME-057/MSS] Property Actions — Buy, Upgrades, Downgrade
import type { Room, Player, MarketModifier } from '../domain/room';
import { TurnPhase } from '../domain/room';
import {
  buyProperty, BuyResult, upgradeProperty, upgradeETC, upgradeUtilityFull,
  downgradeProperty,
  type PropertyRegistry, type PropertyStateMap,
} from '../domain/property_manager';
import { PROPERTY_DEEDS } from '../domain/property_manager';
import { ActionRejectReason } from '../domain/action_reasons';
import { UTILITY_CELLS } from '../domain/property_data';

export function handleBuyProperty(
  room: Room | undefined,
  current: Player | undefined,
  registry: PropertyRegistry | undefined,
): { result: BuyResult } | undefined {
  if (!room || !current || !registry) return undefined;
  if (room.phase !== TurnPhase.ActionPhase) return undefined;
  const res = buyProperty(current, current.position, registry, room.activeModifiers);
  if (res.result === BuyResult.Success) {
    room.phase = TurnPhase.PropertyManagement;
    if ([5, 15, 25, 35].includes(current.position) && !current.hasSpunTransitThisTurn && current.balance >= 0) {
      room.pendingTransitWheel = { playerId: current.id, cellIndex: current.position, timestamp: Date.now() };
    }
  }
  return res;
}

export function handleUpgradeETC(
  current: Player | undefined,
  phase: TurnPhase | undefined,
  registry: PropertyRegistry | undefined,
  stateMap: PropertyStateMap | undefined,
  room?: Room,
): { success: boolean; reason?: string } {
  if (!current || phase !== TurnPhase.PropertyManagement) return { success: false, reason: ActionRejectReason.INVALID_PHASE };
  if (!registry || !stateMap) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  const etcIndices = [5, 15, 25, 35];
  if (room?.pendingTradeOffer && (etcIndices.includes(room.pendingTradeOffer.cellIndex) || (room.pendingTradeOffer.offeredCellIndex !== undefined && etcIndices.includes(room.pendingTradeOffer.offeredCellIndex)))) {
    return { success: false, reason: ActionRejectReason.ASSET_LOCKED };
  }
  return upgradeETC(current, registry, stateMap);
}

export function handleUpgradeUtility(
  current: Player | undefined,
  phase: TurnPhase | undefined,
  cellIndex: number,
  registry: PropertyRegistry | undefined,
  stateMap: PropertyStateMap | undefined,
  room?: Room,
): { success: boolean; reason?: string } {
  if (!current || phase !== TurnPhase.PropertyManagement) return { success: false, reason: ActionRejectReason.INVALID_PHASE };
  if (!registry || !stateMap) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  if (room?.pendingTradeOffer && (UTILITY_CELLS.some((c) => c === room.pendingTradeOffer?.cellIndex || c === room.pendingTradeOffer?.offeredCellIndex))) {
    return { success: false, reason: ActionRejectReason.ASSET_LOCKED };
  }
  return upgradeUtilityFull(current, cellIndex, registry, stateMap);
}

export function handleUpgrade(
  current: Player | undefined,
  phase: TurnPhase | undefined,
  cellIndex: number,
  registry: PropertyRegistry | undefined,
  stateMap: PropertyStateMap | undefined,
  modifiers?: readonly MarketModifier[],
  room?: Room,
): { success: boolean; reason?: string } {
  if (!current || phase !== TurnPhase.PropertyManagement) return { success: false, reason: ActionRejectReason.INVALID_PHASE };
  if (!registry || !stateMap) return { success: false, reason: ActionRejectReason.INVALID_ROOM };
  if (room?.pendingTradeOffer && (room.pendingTradeOffer.cellIndex === cellIndex || room.pendingTradeOffer.offeredCellIndex === cellIndex)) {
    return { success: false, reason: ActionRejectReason.ASSET_LOCKED };
  }
  return upgradeProperty(current, cellIndex, registry, stateMap, modifiers, { enforceEvenBuilding: true });
}

// --- DEBT-02: INTENT_DOWNGRADE (UC-GAME-057) ---

function isDowngradePhaseValid(phase?: TurnPhase): boolean {
  return (
    phase === TurnPhase.PropertyManagement ||
    phase === TurnPhase.InsolvencyPhase ||
    phase === TurnPhase.ActionPhase
  );
}

function checkDowngradeContext(
  current?: Player,
  phase?: TurnPhase,
  registry?: PropertyRegistry,
  stateMap?: PropertyStateMap,
): ActionRejectReason | undefined {
  if (!current || !isDowngradePhaseValid(phase)) return ActionRejectReason.INVALID_PHASE;
  if (!registry || !stateMap) return ActionRejectReason.INVALID_ROOM;
  return undefined;
}

function checkDowngradeTarget(
  playerId: string,
  cellIndex: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): ActionRejectReason | undefined {
  if (registry.get(cellIndex) !== playerId) return ActionRejectReason.NOT_OWNER;
  const deed = PROPERTY_DEEDS.get(cellIndex);
  const state = stateMap.get(cellIndex);
  const hasUpgrade = Boolean(deed?.upgradeCosts && state && state.level >= 1);
  if (!hasUpgrade) return ActionRejectReason.NOT_UPGRADEABLE;
  return undefined;
}

type DowngradeValidation =
  | { valid: false; reason: ActionRejectReason }
  | {
      valid: true;
      reason?: undefined;
      current: Player;
      stateMap: PropertyStateMap;
    };

function validateDowngrade(
  current: Player | undefined,
  phase: TurnPhase | undefined,
  cellIndex: number,
  registry: PropertyRegistry | undefined,
  stateMap: PropertyStateMap | undefined,
): DowngradeValidation {
  const ctxReason = checkDowngradeContext(current, phase, registry, stateMap);
  if (ctxReason) return { valid: false, reason: ctxReason };

  const targetReason = checkDowngradeTarget(current!.id, cellIndex, registry!, stateMap!);
  if (targetReason) return { valid: false, reason: targetReason };

  return { valid: true, current: current!, stateMap: stateMap! };
}

export function handleDowngrade(
  current: Player | undefined,
  phase: TurnPhase | undefined,
  cellIndex: number,
  registry: PropertyRegistry | undefined,
  stateMap: PropertyStateMap | undefined,
  roomCode?: string,
  options?: import('../domain/property_upgrade').DowngradeOptions,
  room?: Room,
): { success: boolean; reason?: ActionRejectReason; refund?: number; newLevel?: number } {
  if (room?.pendingTradeOffer && (room.pendingTradeOffer.cellIndex === cellIndex || room.pendingTradeOffer.offeredCellIndex === cellIndex)) {
    return { success: false, reason: ActionRejectReason.ASSET_LOCKED as ActionRejectReason };
  }
  const v = validateDowngrade(current, phase, cellIndex, registry, stateMap);
  if (!v.valid) return { success: false, reason: v.reason };

  const result = downgradeProperty(cellIndex, v.stateMap, options);
  if (!result.success) return { success: false, reason: result.reason as ActionRejectReason };

  v.current.balance += result.refund;
  console.info(JSON.stringify({
    event: 'DOWNGRADE_PROPERTY', correlationId: roomCode ?? v.current.id,
    timestamp: Date.now(), delta: { cellIndex, refund: result.refund, playerId: v.current.id, newLevel: result.newLevel },
  }));
  return { success: true, refund: result.refund, newLevel: result.newLevel };
}

