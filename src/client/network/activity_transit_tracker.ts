// [IMP-262] ActivityTransitTracker — Trích xuất nhật ký & thông báo Vòng Xoay Vận Tải
import type { DeltaPayload } from '../../server/session_manager.js';
import type { GameState } from '../store/game_store.js';
import { useActivityStore, type ActivityLogEntry } from '../store/activity_store.js';
import { formatTransitWheelBroadcast } from '../../domain/transit_wheel.js';
import { getCellName } from './activity_property_tracker.js';
import { getPlayerName } from './activity_rent_matcher.js';

let lastProcessedTransitKey: string | null = null;

export function resetTransitActivityTracker(): void {
  lastProcessedTransitKey = null;
}

export function detectTransitActivities(
  delta: DeltaPayload,
  _prevState: GameState,
  nextState: GameState,
  _activityStore: typeof useActivityStore = useActivityStore,
): ActivityLogEntry[] {
  const result = delta.lastTransitResult;
  if (!result || !result.playerId || !result.outcome) {
    return [];
  }

  // [GRILL-01] Gắn tick và roundNumber vào key để không nuốt sự kiện giống hệt ở vòng đấu sau
  const tickPrefix = delta.tick ?? delta.roundNumber ?? '';
  const key = `${tickPrefix}:${result.playerId}:${result.cellIndex}:${result.outcome}:${result.targetCell ?? ''}:${result.payout ?? 0}:${result.boostSteps ?? ''}`;
  if (key === lastProcessedTransitKey) {
    return [];
  }
  lastProcessedTransitKey = key;

  const pInfo = nextState.playersInfo[result.playerId];
  const playerName = getPlayerName(pInfo, result.playerId);
  const stationName = getCellName(result.cellIndex);
  const targetCellName = result.targetCell !== undefined ? getCellName(result.targetCell) : undefined;

  const message = formatTransitWheelBroadcast({
    outcome: result.outcome,
    playerName,
    stationName,
    targetCellName,
    payout: result.payout,
    boostSteps: result.boostSteps,
  });

  const entry: ActivityLogEntry = {
    id: `transit_${Date.now()}_${result.playerId}`,
    timestamp: Date.now(),
    type: 'transit',
    message,
    playerId: result.playerId,
    playerName,
    ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
    ...(result.payout && result.payout > 0 ? { amount: result.payout } : {}),
    cellIndex: result.targetCell ?? result.cellIndex,
  };

  return [entry];
}
