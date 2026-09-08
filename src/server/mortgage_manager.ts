// [UC-GAME-051/MSS][UC-GAME-052/MSS] Mortgage Manager — Cam Co & Tin Dung
import type { Room, Player } from '../domain/room';
import { TurnPhase } from '../domain/room';
import { MarketCardId } from '../domain/event_card_types';
import { PROPERTY_DEEDS } from '../domain/property_manager';
import type { PropertyRegistry, PropertyStateMap, PropertyState } from '../domain/property_manager';
import { ActionRejectReason } from '../domain/action_reasons';

const MORTGAGE_RATE         = 0.5;
const REDEEM_FEE_RATE       = 1.1;
const DEFAULT_INTEREST_RATE = 0.05;
const RATE_HIKE_RATE        = 0.10;

function getPlayer(room: Room, playerId: string): Player | undefined {
  return room.players.find((p) => p.id === playerId);
}

function isCurrentPlayer(room: Room, playerId: string): boolean {
  return room.players[room.currentPlayerIndex]?.id === playerId;
}

export function getMortgageInterestRate(room: Room): number {
  const mods = room.activeModifiers ?? [];
  const stimulusActive = mods.some(
    (m) => m.type === MarketCardId.MC_CREDIT_STIMULUS && m.remainingRounds > 0,
  );
  if (stimulusActive) return 0;
  const hikeActive = mods.some(
    (m) => m.type === MarketCardId.MC_RATE_HIKE && m.remainingRounds > 0,
  );
  return hikeActive ? RATE_HIKE_RATE : DEFAULT_INTEREST_RATE;
}

export function calcTotalMortgageDebt(player: Player): number {
  return (player.mortgagedProperties ?? []).reduce((sum, cell) => {
    const deed = PROPERTY_DEEDS.get(cell);
    return sum + (deed ? Math.floor(deed.price * MORTGAGE_RATE) : 0);
  }, 0);
}

export function isMortgaged(player: Player, cellIndex: number): boolean {
  return (player.mortgagedProperties ?? []).includes(cellIndex);
}

function isTradeFrozen(room: Room): boolean {
  return (room.activeModifiers ?? []).some(
    (m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0,
  );
}

function isMortgagePhaseValid(phase: TurnPhase): boolean {
  return phase === TurnPhase.PropertyManagement || phase === TurnPhase.InsolvencyPhase;
}

function checkMortgageRoomState(room: Room, playerId: string): ActionRejectReason | undefined {
  if (!room.started) return ActionRejectReason.GAME_NOT_STARTED;
  if (!isCurrentPlayer(room, playerId)) return ActionRejectReason.NOT_YOUR_TURN;
  if (!isMortgagePhaseValid(room.phase)) return ActionRejectReason.INVALID_PHASE;
  if (isTradeFrozen(room)) return ActionRejectReason.FREEZE_ACTIVE;
  return undefined;
}

function hasBuildingOrUpgrade(state?: PropertyState): boolean {
  return (state?.level ?? 0) > 0 || Boolean(state?.isETC) || Boolean(state?.isUpgradedUtility);
}

function checkMortgageProperty(
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  cellIndex: number,
  playerId: string,
): ActionRejectReason | undefined {
  if (registry.get(cellIndex) !== playerId) return ActionRejectReason.NOT_OWNER;
  if (hasBuildingOrUpgrade(stateMap.get(cellIndex))) return ActionRejectReason.HAS_BUILDING;
  return undefined;
}

export type MortgageValidation =
  | { valid: false; reason: ActionRejectReason }
  | { valid: true; reason?: undefined; player: Player; loan: number };

function checkMortgagePlayer(
  room: Room,
  playerId: string,
  cellIndex: number,
): MortgageValidation {
  const player = getPlayer(room, playerId);
  if (!player) return { valid: false, reason: ActionRejectReason.PLAYER_NOT_FOUND };

  player.mortgagedProperties ??= [];
  if (player.mortgagedProperties.includes(cellIndex)) {
    return { valid: false, reason: ActionRejectReason.ALREADY_MORTGAGED };
  }

  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (!deed) return { valid: false, reason: ActionRejectReason.NOT_MORTGAGEABLE };

  const loan = Math.floor(deed.price * MORTGAGE_RATE);
  return { valid: true, player, loan };
}

export function validateMortgage(
  room: Room,
  playerId: string,
  cellIndex: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): MortgageValidation {
  const roomErr = checkMortgageRoomState(room, playerId);
  if (roomErr) return { valid: false, reason: roomErr };

  const propErr = checkMortgageProperty(registry, stateMap, cellIndex, playerId);
  if (propErr) return { valid: false, reason: propErr };

  return checkMortgagePlayer(room, playerId, cellIndex);
}

export function mortgageProperty(
  room: Room,
  playerId: string,
  cellIndex: number,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
): { success: boolean; reason?: ActionRejectReason } {
  const v = validateMortgage(room, playerId, cellIndex, registry, stateMap);
  if (!v.valid) return { success: false, reason: v.reason };

  v.player.balance += v.loan;
  v.player.mortgagedProperties.push(cellIndex);

  console.info(JSON.stringify({
    event: 'MORTGAGE_PROPERTY', correlationId: room.roomCode,
    timestamp: Date.now(), delta: { cellIndex, loan: v.loan, playerId },
  }));
  return { success: true };
}

function checkRedeemRoomState(room: Room, playerId: string): ActionRejectReason | undefined {
  if (!room.started) return ActionRejectReason.GAME_NOT_STARTED;
  if (!isCurrentPlayer(room, playerId)) return ActionRejectReason.NOT_YOUR_TURN;
  if (room.phase !== TurnPhase.PropertyManagement) return ActionRejectReason.INVALID_PHASE;
  return undefined;
}

export type RedeemValidation =
  | { valid: false; reason: ActionRejectReason }
  | { valid: true; reason?: undefined; player: Player; repay: number; idx: number };

function checkRedeemPlayerFunds(
  room: Room,
  playerId: string,
  cellIndex: number,
): RedeemValidation {
  const player = getPlayer(room, playerId);
  if (!player) return { valid: false, reason: ActionRejectReason.PLAYER_NOT_FOUND };

  player.mortgagedProperties ??= [];
  const idx = player.mortgagedProperties.indexOf(cellIndex);
  if (idx === -1) return { valid: false, reason: ActionRejectReason.NOT_MORTGAGED };

  const deed = PROPERTY_DEEDS.get(cellIndex);
  if (!deed) return { valid: false, reason: ActionRejectReason.NOT_MORTGAGEABLE };

  const loan  = Math.floor(deed.price * MORTGAGE_RATE);
  const repay = Math.floor(loan * REDEEM_FEE_RATE);
  if (player.balance < repay) return { valid: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };

  return { valid: true, player, repay, idx };
}

export function validateRedeem(
  room: Room,
  playerId: string,
  cellIndex: number,
  registry: PropertyRegistry,
): RedeemValidation {
  const roomErr = checkRedeemRoomState(room, playerId);
  if (roomErr) return { valid: false, reason: roomErr };
  if (registry.get(cellIndex) !== playerId) return { valid: false, reason: ActionRejectReason.NOT_OWNER };

  return checkRedeemPlayerFunds(room, playerId, cellIndex);
}

export function redeemProperty(
  room: Room,
  playerId: string,
  cellIndex: number,
  registry: PropertyRegistry,
): { success: boolean; reason?: ActionRejectReason } {
  const v = validateRedeem(room, playerId, cellIndex, registry);
  if (!v.valid) return { success: false, reason: v.reason };

  v.player.balance -= v.repay;
  v.player.mortgagedProperties.splice(v.idx, 1);

  console.info(JSON.stringify({
    event: 'REDEEM_PROPERTY', correlationId: room.roomCode,
    timestamp: Date.now(), delta: { cellIndex, repay: v.repay, playerId },
  }));
  return { success: true };
}

export function collectMortgageInterest(room: Room, playerId: string): void {
  const player = getPlayer(room, playerId);
  if (!player || (player.mortgagedProperties ?? []).length === 0) return;

  const rate      = getMortgageInterestRate(room);
  const totalDebt = calcTotalMortgageDebt(player);
  const interest  = Math.floor(totalDebt * rate);
  if (interest === 0) return;

  player.balance -= interest;

  console.info(JSON.stringify({
    event: 'MORTGAGE_INTEREST', correlationId: room.roomCode,
    timestamp: Date.now(), delta: { playerId, totalDebt, interest, rate },
  }));
}
