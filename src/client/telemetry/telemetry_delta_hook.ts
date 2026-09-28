// [IMP-216] Telemetry Delta Hook — Bridges applyDelta to Invariant Verifiers & Flight Recorder
import type { DeltaPayload } from '../../server/session_manager.js';
import type { GameState, PlayerHudInfo } from '../store/game_store.js';
import { BOARD_SIZE, TurnPhase } from '../../domain/room.js';
import { verifyAllInvariants } from './invariant_checker.js';
import { watchdogMonitor } from './watchdog_monitor.js';
import { useTelemetryStore } from './telemetry_store.js';
import type { InvariantViolation } from './telemetry_types.js';
import {
  detectMovement,
  computeExpectedDelta,
} from './telemetry_expected_delta.js';

// Re-export toàn bộ API công khai phục vụ kiểm thử và module ngoài (C2)
export {
  AIRPORT_CELLS,
  SERVICE_CELLS,
  checkIsTeleport,
  detectMovement,
  computeExpectedDelta,
  computeAuditBailDelta,
  computeOverdraftDelta,
  computeCellDelta,
  resolvePurchaseCost,
  calculateTickRate,
  isAuctionPurchase,
  isUnmodeledEvent,
} from './telemetry_expected_delta.js';

function extractBalances(playersInfo: Record<string, PlayerHudInfo>): Record<string, number> {
  const map: Record<string, number> = {};
  for (const [id, info] of Object.entries(playersInfo)) {
    map[id] = info.balance;
  }
  return map;
}

function recordTurnStallAndBotWatchdog(
  postState: GameState,
  delta: DeltaPayload,
  violations: InvariantViolation[],
  preBalances?: Record<string, number>
): void {
  if (postState.currentTurnPlayerId) {
    const hasProgress = Boolean(
      (delta.cells && delta.cells.length > 0) ||
      (delta.players && delta.players.length > 0) ||
      delta.auction !== undefined
    );
    const isInAuction = Boolean(
      delta.auction ||
      postState.auction ||
      (delta.turnPhase ?? postState.turnPhase) === TurnPhase.AuctionPhase
    );
    const stallViolation = watchdogMonitor.checkTurnStall({
      currentTurnPlayerId: postState.currentTurnPlayerId,
      timeRemaining: postState.turnTimeRemaining,
      turnPhase: delta.turnPhase ?? postState.turnPhase,
      hasProgress,
      tick: delta.tick,
      isInAuction,
    });
    if (stallViolation) violations.push(stallViolation);
  }

  // Bắt bot tới lượt có hành động thực tế (không đếm tick mạng thuần)
  if (delta.currentTurnPlayerId) {
    const activeInfo = postState.playersInfo[delta.currentTurnPlayerId];
    if (activeInfo?.isBot) {
      const hasBotAction = Boolean(
        (delta.dice && delta.diceRollerId === activeInfo.id) ||
        (delta.cells && delta.cells.length > 0) ||
        (preBalances && preBalances[activeInfo.id] !== undefined && preBalances[activeInfo.id] !== activeInfo.balance)
      );
      if (hasBotAction) {
        const botViolation = watchdogMonitor.recordBotAction(activeInfo.id, Date.now(), delta.tick);
        if (botViolation) violations.push(botViolation);
      }
    }
  }

  // [P3 / ACTOR-INVERSION] Bắt hành động đặt giá của Bot ngoài lượt trong phiên đấu giá
  if (delta.auction?.highestBidderId) {
    const bidder = postState.playersInfo[delta.auction.highestBidderId];
    if (bidder?.isBot) {
      const botViolation = watchdogMonitor.recordBotAction(bidder.id, Date.now(), delta.tick);
      if (botViolation) violations.push(botViolation);
    }
  }
}

export function handleDeltaTelemetry(delta: DeltaPayload, preState: GameState, postState: GameState): void {
  const preBalances = extractBalances(preState.playersInfo);
  const postBalances = extractBalances(postState.playersInfo);
  const isFullSync = Boolean(delta.cells && delta.cells.length === BOARD_SIZE);
  const movement = delta.roomStarted === false || isFullSync ? undefined : detectMovement(delta, preState.playerPositions);
  const expectedMoneyDelta = computeExpectedDelta(delta, preState, movement, postState.treasuryPool);

  const isInitialSetupOrCalibration =
    delta.roomStarted === false ||
    isFullSync ||
    Object.keys(postBalances).length !== Object.keys(preBalances).length ||
    (delta.tick <= 2 && (
      preState.treasuryPool !== postState.treasuryPool ||
      delta.treasury !== undefined ||
      Object.entries(postBalances).some(([id, b]) => (preBalances[id] === undefined || preBalances[id] === 0) && b === 15_000)
    ));

  const violations = verifyAllInvariants({
    preBalances,
    postBalances,
    preTreasury: isInitialSetupOrCalibration ? postState.treasuryPool : preState.treasuryPool,
    postTreasury: postState.treasuryPool,
    expectedMoneyDelta: isInitialSetupOrCalibration ? null : expectedMoneyDelta,
    movement,
    players: Object.values(postState.playersInfo),
    isInInsolvency: delta.turnPhase === TurnPhase.InsolvencyPhase || postState.activeModal === 'insolvency',
    cells: delta.cells,
    tick: delta.tick,
    roomStarted: delta.roomStarted,
    currentTurnPlayerId: delta.currentTurnPlayerId ?? postState.currentTurnPlayerId,
  });

  recordTurnStallAndBotWatchdog(postState, delta, violations, preBalances);

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
