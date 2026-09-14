// [IMP-24/MSS] Telemetry Delta Hook — Bridges applyDelta to Invariant Verifiers & Flight Recorder
import type { DeltaPayload, CellDelta, PlayerDelta } from '../../server/session_manager.js';
import type { GameState, PlayerHudInfo } from '../store/game_store.js';
import {
  PROPERTY_DEEDS,
  type PropertyRegistry,
  type PropertyStateMap,
  type PropertyState,
} from '../../domain/property_data.js';
import { BOARD_CONFIG, CellType } from '../../domain/board_config.js';
import { calculateGoPropertyTax } from '../../domain/property_rent.js';
import { TurnPhase } from '../../domain/room.js';
import { verifyAllInvariants } from './invariant_checker.js';
import { watchdogMonitor } from './watchdog_monitor.js';
import { useTelemetryStore } from './telemetry_store.js';
import type { InvariantViolation } from './telemetry_types.js';

export const AIRPORT_CELLS = new Set<number>([5, 15, 25, 35]);
const JAIL_CELL = 10;
const TAX_ORDER_CELL = 30;
const SERVICE_CELLS = new Set<number>([12, 28, 39]);
const EVENT_CELL_TYPES = new Set<CellType>([
  CellType.Chance,
  CellType.Market,
  CellType.Tax,
  CellType.TaxOrder,
  CellType.Hose,
  CellType.Audit,
]);

function extractBalances(playersInfo: Record<string, PlayerHudInfo>): Record<string, number> {
  const map: Record<string, number> = {};
  for (const [id, info] of Object.entries(playersInfo)) {
    map[id] = info.balance;
  }
  return map;
}

export function checkIsTeleport(fromPos: number, toPos: number, isTurnPlayer: boolean, phase?: TurnPhase): boolean {
  if (!isTurnPlayer) return true;
  if ((AIRPORT_CELLS.has(fromPos) || fromPos === 22) && AIRPORT_CELLS.has(toPos)) return true;
  if (fromPos === TAX_ORDER_CELL && toPos === JAIL_CELL) return true;
  if (
    SERVICE_CELLS.has(toPos) &&
    phase !== TurnPhase.WaitingRoll &&
    phase !== TurnPhase.ActionPhase &&
    phase !== TurnPhase.PropertyManagement
  ) {
    return true;
  }
  if (
    phase &&
    phase !== TurnPhase.WaitingRoll &&
    phase !== TurnPhase.ActionPhase &&
    phase !== TurnPhase.PropertyManagement
  ) {
    return true;
  }
  return false;
}

function detectMovement(
  delta: DeltaPayload,
  prePositions: Record<string, number>
): { fromPosition: number; toPosition: number; dice?: readonly [number, number]; isTeleport?: boolean } | undefined {
  if (!delta.players) return undefined;
  for (const p of delta.players) {
    const fromPos = prePositions[p.id];
    if (fromPos !== undefined && fromPos !== p.position) {
      const isTurnPlayer = !delta.currentTurnPlayerId || delta.currentTurnPlayerId === p.id;
      const isMovementPhase =
        delta.turnPhase === TurnPhase.WaitingRoll ||
        delta.turnPhase === TurnPhase.ActionPhase ||
        delta.turnPhase === TurnPhase.PropertyManagement ||
        delta.turnPhase === undefined;
      const isTeleport = checkIsTeleport(fromPos, p.position, isTurnPlayer, delta.turnPhase);

      return {
        fromPosition: fromPos,
        toPosition: p.position,
        dice: isMovementPhase && isTurnPlayer ? delta.dice : undefined,
        isTeleport,
      };
    }
  }
  return undefined;
}

function calculateGoSalary(preState: GameState, activeId: string): number {
  const registry: PropertyRegistry = new Map<number, string>();
  for (const [id, info] of Object.entries(preState.playersInfo)) {
    for (const c of info.ownedProperties) registry.set(c, id);
  }
  const stateMap: PropertyStateMap = new Map<number, PropertyState>();
  for (const [c, lvl] of Object.entries(preState.levelMap)) {
    stateMap.set(Number(c), { level: lvl });
  }
  const tax = calculateGoPropertyTax(activeId, registry, stateMap);
  return 2000 - tax;
}

function computeCellDelta(cells: readonly CellDelta[], preState: GameState): number {
  let deltaSum = 0;
  for (const cell of cells) {
    const deed = PROPERTY_DEEDS.get(cell.index);
    if (!deed) continue;

    const oldLevel = preState.levelMap[cell.index] ?? 0;
    const costs: readonly number[] = deed.upgradeCosts ?? [];
    if (cell.level !== undefined && cell.level > oldLevel && deed.upgradeCosts) {
      for (let lvl = oldLevel; lvl < cell.level; lvl++) {
        const c = costs[lvl];
        if (c !== undefined) deltaSum -= c;
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
      const preAuction = preState.auction;
      const auctionPayload =
        preState.activeModal === 'auction' && preState.modalPayload && 'cellIndex' in preState.modalPayload
          ? (preState.modalPayload as { cellIndex?: number; currentBid?: number; highestBid?: number })
          : undefined;
      const isAuction = preAuction?.cellIndex === cell.index || auctionPayload?.cellIndex === cell.index;
      const highestBid = isAuction
        ? (preAuction?.highestBid ?? preAuction?.currentBid ?? auctionPayload?.highestBid ?? auctionPayload?.currentBid)
        : undefined;

      deltaSum -= highestBid !== undefined ? highestBid : deed.price;
    }
    if (cell.isMortgaged === true) {
      deltaSum += Math.floor(deed.price * 0.5);
    }
  }
  return deltaSum;
}

function computeOverdraftDelta(players: readonly PlayerDelta[], preState: GameState): number {
  let loan = 0;
  for (const p of players) {
    const preP = preState.playersInfo[p.id];
    if (p.overdraftRoundsLeft !== undefined && (!preP?.overdraftRoundsLeft || preP.overdraftRoundsLeft === 0)) {
      loan += 3000;
    }
  }
  return loan;
}

function isUnmodeledEvent(delta: DeltaPayload, preState: GameState): boolean {
  if (preState.activeModal === 'insolvency' || delta.turnPhase === TurnPhase.InsolvencyPhase) {
    return true;
  }
  if (!delta.players) return false;
  for (const p of delta.players) {
    const preP = preState.playersInfo[p.id];
    if (preP && preP.balance !== p.balance) {
      const cell = BOARD_CONFIG[p.position];
      if (cell && EVENT_CELL_TYPES.has(cell.type)) return true;
    }
  }
  return false;
}

function computeAuditBailDelta(players: readonly PlayerDelta[], preState: GameState): number {
  let bail = 0;
  for (const p of players) {
    const preP = preState.playersInfo[p.id];
    if (preP && (preP.inAudit || (preP.auditTurnsLeft && preP.auditTurnsLeft > 0))) {
      const leftAudit = p.inAudit === false || p.auditTurnsLeft === 0;
      if (leftAudit && p.balance !== undefined && preP.balance - p.balance === 500) {
        bail -= 500;
      }
    }
  }
  return bail;
}

export function computeExpectedDelta(
  delta: DeltaPayload,
  preState: GameState,
  movement?: { fromPosition: number; toPosition: number; dice?: readonly [number, number]; isTeleport?: boolean }
): number | null {
  let expected = 0;
  let hasKnown = false;

  if (movement?.dice && !movement.isTeleport) {
    const diceSum = movement.dice[0] + movement.dice[1];
    if (movement.fromPosition + diceSum >= 40) {
      const activeId = delta.currentTurnPlayerId ?? Object.keys(preState.playersInfo)[0] ?? '';
      expected += calculateGoSalary(preState, activeId);
      hasKnown = true;
    }
  }

  if (delta.cells && delta.cells.length > 0) {
    expected += computeCellDelta(delta.cells, preState);
    hasKnown = true;
  }

  if (delta.players && delta.players.length > 0) {
    const overdraft = computeOverdraftDelta(delta.players, preState);
    if (overdraft > 0) {
      expected += overdraft;
      hasKnown = true;
    }
    const auditBail = computeAuditBailDelta(delta.players, preState);
    if (auditBail !== 0) {
      expected += auditBail;
      hasKnown = true;
    }
  }

  if (isUnmodeledEvent(delta, preState)) {
    return hasKnown ? expected : null;
  }

  return expected;
}

function recordTurnStallAndBotWatchdog(
  postState: GameState,
  delta: DeltaPayload,
  violations: InvariantViolation[]
): void {
  if (postState.currentTurnPlayerId) {
    const stallViolation = watchdogMonitor.checkTurnStall({
      currentTurnPlayerId: postState.currentTurnPlayerId,
      timeRemaining: postState.turnTimeRemaining,
      tick: delta.tick,
    });
    if (stallViolation) violations.push(stallViolation);
  }

  if (delta.currentTurnPlayerId) {
    const activeInfo = postState.playersInfo[delta.currentTurnPlayerId];
    if (activeInfo?.isBot) {
      const botViolation = watchdogMonitor.recordBotAction(activeInfo.id, Date.now(), delta.tick);
      if (botViolation) violations.push(botViolation);
    }
  }
}

export function handleDeltaTelemetry(
  delta: DeltaPayload,
  preState: GameState,
  postState: GameState
): void {
  const preBalances = extractBalances(preState.playersInfo);
  const postBalances = extractBalances(postState.playersInfo);
  const movement = detectMovement(delta, preState.playerPositions);
  const expectedMoneyDelta = computeExpectedDelta(delta, preState, movement);

  const violations = verifyAllInvariants({
    preBalances,
    postBalances,
    preTreasury: preState.treasuryPool,
    postTreasury: postState.treasuryPool,
    expectedMoneyDelta,
    movement,
    players: Object.values(postState.playersInfo),
    isInInsolvency: postState.activeModal === 'insolvency',
    cells: delta.cells,
    tick: delta.tick,
  });

  recordTurnStallAndBotWatchdog(postState, delta, violations);

  const store = useTelemetryStore.getState();
  for (const v of violations) store.reportViolation(v);

  store.addSnapshot({
    tick: delta.tick,
    timestamp: Date.now(),
    preStateSummary: { balances: preBalances, positions: preState.playerPositions, treasury: preState.treasuryPool },
    postStateSummary: { balances: postBalances, positions: postState.playerPositions, treasury: postState.treasuryPool },
    triggerDelta: delta,
  });

  store.addAuditLog({
    tick: delta.tick,
    source: 'SERVER',
    action: 'STATE_DELTA',
    payloadSummary: `Tick #${delta.tick} | ${delta.players?.length ?? 0} players | ${delta.cells?.length ?? 0} cells`,
  });
}
