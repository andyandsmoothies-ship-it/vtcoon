// [IMP-24/MSS] Telemetry Delta Hook — Bridges applyDelta to Invariant Verifiers & Flight Recorder
import type { DeltaPayload } from '../../server/session_manager.js';
import type { GameState, PlayerHudInfo } from '../store/game_store.js';
import { PROPERTY_DEEDS } from '../../domain/property_data.js';
import { verifyAllInvariants } from './invariant_checker.js';
import { watchdogMonitor } from './watchdog_monitor.js';
import { useTelemetryStore } from './telemetry_store.js';

function extractBalances(playersInfo: Record<string, PlayerHudInfo>): Record<string, number> {
  const map: Record<string, number> = {};
  for (const [id, info] of Object.entries(playersInfo)) {
    map[id] = info.balance;
  }
  return map;
}

function detectMovement(
  delta: DeltaPayload,
  prePositions: Record<string, number>
): { fromPosition: number; toPosition: number; dice?: readonly [number, number] } | undefined {
  if (!delta.players || !delta.dice) return undefined;
  for (const p of delta.players) {
    const fromPos = prePositions[p.id];
    if (fromPos !== undefined && fromPos !== p.position) {
      return { fromPosition: fromPos, toPosition: p.position, dice: delta.dice };
    }
  }
  return undefined;
}

function computeExpectedDelta(
  delta: DeltaPayload,
  preState: GameState,
  movement?: { fromPosition: number; toPosition: number; dice?: readonly [number, number] }
): number | undefined {
  let expected = 0;
  let hasKnownTransaction = false;

  if (movement?.dice) {
    const diceSum = movement.dice[0] + movement.dice[1];
    if (movement.fromPosition + diceSum >= 40) {
      expected += 2000;
      hasKnownTransaction = true;
    }
  }

  if (delta.cells && delta.cells.length > 0) {
    for (const cell of delta.cells) {
      const deed = PROPERTY_DEEDS.get(cell.index);
      if (!deed) continue;

      const oldLevel = preState.levelMap[cell.index] ?? 0;
      if (cell.level !== undefined && cell.level > oldLevel && deed.upgradeCosts) {
        const costs: readonly number[] = deed.upgradeCosts;
        for (let lvl = oldLevel; lvl < cell.level; lvl++) {
          expected -= costs[lvl] ?? 0;
        }
        hasKnownTransaction = true;
      }

      const prevOwner = Object.values(preState.playersInfo).find((p) =>
        p.ownedProperties.includes(cell.index)
      );
      if (cell.ownerId && !prevOwner) {
        expected -= deed.price;
        hasKnownTransaction = true;
      }
    }
  }

  return hasKnownTransaction ? expected : 0;
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
