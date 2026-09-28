// [IMP-216] Telemetry Expected Delta Engine — Pure Invariant Delta Modeling
import type { DeltaPayload, CellDelta, PlayerDelta } from '../../server/session_manager.js';
import type { GameState } from '../store/game_store.js';
import {
  PROPERTY_DEEDS,
  type PropertyDeed,
  type PropertyRegistry,
  type PropertyStateMap,
  type PropertyState,
} from '../../domain/property_data.js';
import { calculateUpgradeCost } from '../../domain/property_upgrade.js';
import { BOARD_CONFIG, CellType } from '../../domain/board_config.js';
import { calculateGoPropertyTax, GO_PROPERTY_TAX_CAP } from '../../domain/property_rent.js';
import { SERVICE_CELLS as DOMAIN_SERVICE_CELLS } from '../../domain/event_card_types.js';
import { TurnPhase, calculateGoSalary } from '../../domain/room.js';
import { useActivityStore } from '../store/activity_store.js';

export const AIRPORT_CELLS = new Set<number>([5, 15, 25, 35]);
export const SERVICE_CELLS = new Set<number>(DOMAIN_SERVICE_CELLS);
const JAIL_CELL = 10;
const CHANCE_MARKET_CELLS = new Set<number>([2, 7, 17, 22, 33, 36]);
const MOVEMENT_PHASES = new Set<TurnPhase>([
  TurnPhase.WaitingRoll, TurnPhase.ActionPhase, TurnPhase.PropertyManagement,
  TurnPhase.HosePhase, TurnPhase.AuctionPhase, TurnPhase.InsolvencyPhase,
]);
const EVENT_CELL_TYPES = new Set<CellType>([
  CellType.Chance, CellType.Market, CellType.Tax, CellType.TaxOrder, CellType.Hose, CellType.Audit,
]);

export function calculateTickRate(deltaTimes: number[]): number {
  if (!deltaTimes || deltaTimes.length === 0) return 0;
  const avgDt = deltaTimes.reduce((sum, dt) => sum + Math.max(16, dt), 0) / deltaTimes.length;
  if (!Number.isFinite(avgDt) || avgDt <= 0) return 0;
  const rate = 1000 / avgDt;
  return Number.isFinite(rate) ? rate : 0;
}

export function checkIsTeleport(
  fromPos: number, toPos: number, isTurnPlayer: boolean, phase?: TurnPhase, hasEventCard?: boolean
): boolean {
  if (!isTurnPlayer || hasEventCard) return true;
  if (phase !== TurnPhase.PropertyManagement && CHANCE_MARKET_CELLS.has(fromPos)) return true;
  if ((AIRPORT_CELLS.has(fromPos) || fromPos === 22) && AIRPORT_CELLS.has(toPos)) return true;
  if (toPos === JAIL_CELL || SERVICE_CELLS.has(toPos)) return true;
  if (toPos === 0 && fromPos >= 35 && fromPos <= 39) return true;
  return Boolean(phase && !MOVEMENT_PHASES.has(phase));
}

export function detectMovement(
  delta: DeltaPayload, prePositions: Record<string, number>
): { fromPosition: number; toPosition: number; dice?: readonly [number, number]; isTeleport?: boolean } | undefined {
  if (!delta.players || delta.roomStarted === false) return undefined;
  for (const p of delta.players) {
    const fromPos = prePositions[p.id];
    if (fromPos !== undefined && fromPos !== p.position) {
      const isRoller = delta.diceRollerId !== undefined
        ? delta.diceRollerId === p.id
        : (!delta.currentTurnPlayerId || delta.currentTurnPlayerId === p.id);
      const isMovementPhase = !delta.turnPhase || MOVEMENT_PHASES.has(delta.turnPhase);
      const diceSum = delta.dice ? delta.dice[0] + delta.dice[1] : 0;
      const isExactDiceMove = Boolean(
        isRoller && delta.dice && ((fromPos + diceSum) % 40 === p.position || (fromPos + diceSum * 2) % 40 === p.position)
      );
      const isTeleport = isExactDiceMove ? false : checkIsTeleport(fromPos, p.position, isRoller, delta.turnPhase, Boolean(delta.lastEventCard));
      return { fromPosition: fromPos, toPosition: p.position, dice: isMovementPhase && isRoller ? delta.dice : undefined, isTeleport };
    }
  }
  return undefined;
}

export function isAuctionPurchase(
  cell: CellDelta,
  preState: GameState,
  delta?: DeltaPayload,
  lastAuctionBid?: { cellIndex?: number } | null
): boolean {
  const storeBid = lastAuctionBid !== undefined ? lastAuctionBid : useActivityStore.getState().lastAuctionBid;
  const modalPayload = preState.activeModal === 'auction' && preState.modalPayload && 'cellIndex' in preState.modalPayload
    ? (preState.modalPayload as { cellIndex?: number })
    : undefined;
  return Boolean(
    delta?.auction?.cellIndex === cell.index ||
    preState.auction?.cellIndex === cell.index ||
    modalPayload?.cellIndex === cell.index ||
    storeBid?.cellIndex === cell.index
  );
}

export function resolvePurchaseCost(cell: CellDelta, deed: PropertyDeed, preState: GameState, delta?: DeltaPayload): number {
  if (!cell.ownerId) return deed.price;
  const buyerPre = preState.playersInfo[cell.ownerId];
  const buyerDelta = delta?.players?.find((p) => p.id === cell.ownerId);
  const buyerSpent = buyerPre && buyerDelta?.balance !== undefined && buyerPre.balance > buyerDelta.balance
    ? buyerPre.balance - buyerDelta.balance
    : undefined;
  return buyerSpent ?? deed.price;
}

export function computeCellDelta(
  cells: readonly CellDelta[],
  preState: GameState,
  delta?: DeltaPayload,
  lastAuctionBid?: { cellIndex?: number } | null
): number {
  let deltaSum = 0;
  const activeMods = delta?.activeModifiers ?? preState.activeModifiers;
  for (const cell of cells) {
    const deed = PROPERTY_DEEDS.get(cell.index);
    if (!deed) continue;

    const oldLevel = preState.levelMap[cell.index] ?? 0;
    const costs: readonly number[] = deed.upgradeCosts ?? [];
    if (cell.level !== undefined && cell.level > oldLevel && deed.upgradeCosts) {
      const upgraderId = cell.ownerId ?? delta?.currentTurnPlayerId ?? Object.entries(preState.playersInfo).find(([_, p]) => p.ownedProperties.includes(cell.index))?.[0];
      const upgraderPre = upgraderId ? preState.playersInfo[upgraderId] : undefined;
      const upgraderDelta = upgraderId ? delta?.players?.find((p) => p.id === upgraderId) : undefined;
      const upgraderSpent = (upgraderPre && upgraderDelta?.balance !== undefined && upgraderPre.balance > upgraderDelta.balance)
        ? upgraderPre.balance - upgraderDelta.balance
        : undefined;
      for (let lvl = oldLevel; lvl < cell.level; lvl++) {
        let cost = calculateUpgradeCost(cell.index, lvl, activeMods);
        if (cost === 0 && costs[lvl] !== undefined) cost = costs[lvl]!;
        if (upgraderSpent !== undefined && (upgraderSpent === cost || ((activeMods?.length ?? 0) > 0 && Math.abs(upgraderSpent - cost) <= 2))) {
          cost = upgraderSpent;
        }
        deltaSum -= cost;
      }
    }
    if (cell.level !== undefined && cell.level < oldLevel && deed.upgradeCosts) {
      for (let lvl = cell.level; lvl < oldLevel; lvl++) {
        const c = costs[lvl];
        if (c !== undefined) deltaSum += Math.floor(c * 0.5);
      }
    }
    const prevOwner = Object.values(preState.playersInfo).find((p) => p.ownedProperties.includes(cell.index));
    if (cell.ownerId && !prevOwner) {
      if (isAuctionPurchase(cell, preState, delta, lastAuctionBid)) {
        const buyerPre = preState.playersInfo[cell.ownerId];
        const buyerDelta = delta?.players?.find((p) => p.id === cell.ownerId);
        const buyerSpent = buyerPre && buyerDelta?.balance !== undefined && buyerPre.balance > buyerDelta.balance
          ? buyerPre.balance - buyerDelta.balance
          : undefined;
        const storeBid = lastAuctionBid !== undefined ? lastAuctionBid : useActivityStore.getState().lastAuctionBid;
        const modalPayload = preState.activeModal === 'auction' && preState.modalPayload && 'cellIndex' in preState.modalPayload
          ? (preState.modalPayload as { cellIndex?: number; currentBid?: number; highestBid?: number })
          : undefined;
        const bidAmount = delta?.auction?.finalPrice ??
          (storeBid?.cellIndex === cell.index && 'currentBid' in storeBid ? (storeBid as { currentBid?: number }).currentBid : undefined) ??
          buyerSpent ??
          delta?.auction?.currentBid ??
          preState.auction?.highestBid ?? preState.auction?.currentBid ??
          modalPayload?.highestBid ?? modalPayload?.currentBid ?? deed.price;
        deltaSum -= bidAmount;
        continue;
      }
      deltaSum -= resolvePurchaseCost(cell, deed, preState, delta);
    }
    const mortgagedOwner = Object.values(preState.playersInfo).find((p) => p.mortgagedProperties?.includes(cell.index));
    const wasMortgaged = Boolean(mortgagedOwner);
    if (cell.isMortgaged === true && !wasMortgaged) {
      deltaSum += Math.floor(deed.price * 0.5);
    } else if (cell.isMortgaged === false && wasMortgaged) {
      const loan = mortgagedOwner?.mortgageLoans?.[cell.index] ?? Math.floor(deed.price * 0.5);
      deltaSum -= loan;
    }
  }
  return deltaSum;
}

export function computeOverdraftDelta(players: readonly PlayerDelta[], preState: GameState): number {
  let loan = 0;
  for (const p of players) {
    const preP = preState.playersInfo[p.id];
    if (p.overdraftRoundsLeft !== undefined && (!preP?.overdraftRoundsLeft || preP.overdraftRoundsLeft === 0)) {
      loan += 3000;
    }
    const isExpired = preP?.overdraftRoundsLeft === 1 && (p.overdraftRoundsLeft === 0 || p.overdraftRoundsLeft === undefined);
    if (isExpired) loan -= 3300;
  }
  return loan;
}

export function computeAuditBailDelta(
  players: readonly PlayerDelta[], preState: GameState, treasuryGain = 0
): number | null {
  let bail: number | null = null;
  for (const p of players) {
    const preP = preState.playersInfo[p.id];
    if (preP && (preP.inAudit || (preP.auditTurnsLeft && preP.auditTurnsLeft > 0))) {
      const leftAudit = (p.inAudit === false || !p.inAudit) && (p.auditTurnsLeft === 0 || p.auditTurnsLeft === undefined);
      if (leftAudit && p.balance !== undefined && preP.balance > p.balance) {
        const spent = preP.balance - p.balance;
        const absorbed = Math.min(Math.max(0, treasuryGain), spent);
        bail = (bail ?? 0) + (-spent + absorbed);
      }
    }
  }
  return bail;
}

export function isUnmodeledEvent(delta: DeltaPayload, preState: GameState): boolean {
  if (preState.activeModal === 'insolvency' || delta.turnPhase === TurnPhase.InsolvencyPhase) return true;
  if (delta.lastEventCard || delta.players?.some((p) => p.bankrupt === true || p.bondContract !== undefined)) return true;
  if (!delta.players) return false;

  for (const p of delta.players) {
    const preP = preState.playersInfo[p.id];
    if (preP && preP.balance !== p.balance) {
      const wasInAudit = Boolean(preP.inAudit || (preP.auditTurnsLeft && preP.auditTurnsLeft > 0));
      const nowLeftAudit = (p.inAudit === false || !p.inAudit) && (p.auditTurnsLeft === 0 || p.auditTurnsLeft === undefined);
      if (wasInAudit && nowLeftAudit) continue;

      const cell = BOARD_CONFIG[p.position];
      if (cell && EVENT_CELL_TYPES.has(cell.type)) {
        if ((cell.type === CellType.Chance || cell.type === CellType.Market) && !delta.lastEventCard) continue;
        if (cell.type === CellType.Audit && !p.inAudit && !(p.auditTurnsLeft && p.auditTurnsLeft > 0) && p.balance > preP.balance) continue;
        return true;
      }
    }
  }
  return false;
}

function resolveGoTax(preState: GameState, activeId: string): number {
  const registry: PropertyRegistry = new Map<number, string>();
  for (const [id, info] of Object.entries(preState.playersInfo)) {
    for (const c of info.ownedProperties) registry.set(c, id);
  }
  const stateMap: PropertyStateMap = new Map<number, PropertyState>();
  for (const [c, lvl] of Object.entries(preState.levelMap)) {
    stateMap.set(Number(c), { level: lvl });
  }
  return Math.min(calculateGoPropertyTax(activeId, registry, stateMap), GO_PROPERTY_TAX_CAP);
}

export function computeExpectedDelta(
  delta: DeltaPayload, preState: GameState,
  movement?: { fromPosition: number; toPosition: number; dice?: readonly [number, number]; isTeleport?: boolean },
  postTreasury?: number
): number | null {
  if (delta.lastHoseResult || delta.lastEventCard || delta.players?.some((p) => p.bankrupt === true)) return null;

  const treasuryGain = postTreasury !== undefined
    ? Math.max(0, postTreasury - preState.treasuryPool)
    : (delta.treasury !== undefined ? Math.max(0, delta.treasury - preState.treasuryPool) : 0);

  let expected = 0;

  if (movement?.dice) {
    const diceSum = movement.dice[0] + movement.dice[1];
    const isDoubleDiceMove = (movement.fromPosition + diceSum * 2) % 40 === movement.toPosition;
    const effectiveSteps = isDoubleDiceMove ? diceSum * 2 : diceSum;
    const isSentToAudit = Boolean(delta.players?.some((p) => p.inAudit === true || (p.auditTurnsLeft && p.auditTurnsLeft > 0)));
    const isPassingGo = (movement.fromPosition + effectiveSteps >= 40) ||
      (movement.toPosition <= movement.fromPosition && movement.fromPosition !== movement.toPosition && !isSentToAudit);
    const isExactDiceMove = (movement.fromPosition + diceSum) % 40 === movement.toPosition || isDoubleDiceMove;
    if ((!movement.isTeleport || isExactDiceMove) && isPassingGo && !isSentToAudit) {
      const round = delta.roundNumber ?? preState.roundNumber ?? 1;
      const baseSalary = calculateGoSalary(round);
      const activeId = delta.currentTurnPlayerId ?? Object.keys(preState.playersInfo)[0] ?? '';
      const tax = resolveGoTax(preState, activeId);
      const isRoundBoundary = delta.roundNumber !== undefined && delta.roundNumber > (preState.roundNumber ?? 1);
      const absorbedTax = isRoundBoundary ? tax : Math.min(Math.max(0, treasuryGain), tax);
      expected += (baseSalary - tax) + absorbedTax;
    }
  }

  if (delta.cells && delta.cells.length > 0) {
    const cellDelta = computeCellDelta(delta.cells, preState, delta);
    // [IMP-216/I3] Reconcile internal transfers to Treasury (Auctions):
    // In a closed system session (when Treasury is tracked via postTreasury or delta.treasury),
    // property auction proceeds are deposited directly into room.treasury (or loan payoff).
    // They do not deplete total system money. We absorb auction outflows up to the deficit.
    const hasTreasuryContext = postTreasury !== undefined || delta.treasury !== undefined;
    let absorbedTreasury = 0;
    if (cellDelta < 0 && hasTreasuryContext && treasuryGain > 0) {
      const hasAuction = delta.cells.some((c) => isAuctionPurchase(c, preState, delta));
      if (hasAuction) {
        absorbedTreasury = Math.abs(cellDelta);
      } else if (treasuryGain === -cellDelta) {
        absorbedTreasury = treasuryGain;
      }
    }
    expected += cellDelta + absorbedTreasury;
  }

  if (delta.players && delta.players.length > 0) {
    const overdraft = computeOverdraftDelta(delta.players, preState);
    if (overdraft !== 0) expected += overdraft;
    const auditBail = computeAuditBailDelta(delta.players, preState, treasuryGain);
    if (auditBail !== null && auditBail !== 0) expected += auditBail;
  }

  return isUnmodeledEvent(delta, preState) ? null : expected;
}
