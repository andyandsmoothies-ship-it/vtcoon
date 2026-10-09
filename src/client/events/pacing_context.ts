// [IMP-333] Pacing Context Adapter — Canonical SSOT for Kinematic Delays & Presentation Timing
import { useGameStore, type GameState } from '../store/game_store.js';
import { checkPassedGo } from '../../domain/room.js';

export interface PacingConfig {
  readonly stepMs?: number;
  readonly botStepMs?: number;
  readonly rollLeadMs?: number;
}

export const DEFAULT_PACING_CONFIG: PacingConfig = { stepMs: 230, botStepMs: 200, rollLeadMs: 1200 };

export interface PacingContext {
  getPawnLandingDelay(playerId?: string): number;
  getPawnPassGoDelay(playerId?: string): number;
  scheduleAction(action: () => void, delayMs: number): ReturnType<typeof setTimeout> | null;
  clearPendingTimers(): void;
}

export const pendingPacingTimers = new Set<ReturnType<typeof setTimeout>>();

export function clearPendingPacingTimers(): void {
  for (const t of pendingPacingTimers) clearTimeout(t);
  pendingPacingTimers.clear();
}

function getAnimLead(anim: GameState['activePawnAnimation'], config: PacingConfig): number {
  if (!anim || !anim.waypoints?.length) return 0;
  const steps = Math.max(1, anim.waypoints.length - (anim.currentIndex ?? 0));
  const ms = anim.isBot ? (config.botStepMs ?? 200) : (config.stepMs ?? 230);
  return Math.round(steps * ms);
}

export function getPawnLandingDelay(
  playerId?: string,
  storeState?: GameState,
  config: PacingConfig = DEFAULT_PACING_CONFIG,
): number {
  if (!playerId) return 0;
  const state = storeState ?? useGameStore.getState();
  const humanMs = config.stepMs ?? 230;
  const botMs = config.botStepMs ?? 200;
  const rollLead = config.rollLeadMs ?? 1200;

  if (state.pendingPawnMove && state.pendingPawnMove.playerId === playerId) {
    const rawDiff = (state.pendingPawnMove.targetCell - (state.pendingPawnMove.fromCell ?? 0)) % 40;
    const steps = ((rawDiff % 40) + 40) % 40;
    const stepMs = state.pendingPawnMove.isBot ? botMs : humanMs;
    return Math.round((state.isRolling ? rollLead : 0) + steps * stepMs);
  }
  const anim = state.activePawnAnimation;
  const activeRemainingMs = getAnimLead(anim, config);
  if (anim && anim.playerId === playerId && anim.waypoints?.length) return activeRemainingMs;

  const queued = state.pawnAnimationQueue?.find((t) => t.playerId === playerId);
  if (queued) {
    const steps = (((queued.targetCell - (queued.fromCell ?? 0)) % 40) + 40) % 40;
    const stepMs = queued.isBot ? botMs : humanMs;
    return Math.round(activeRemainingMs + steps * stepMs);
  }
  return 0;
}

export function getPawnPassGoDelay(
  playerId?: string,
  storeState?: GameState,
  config: PacingConfig = DEFAULT_PACING_CONFIG,
): number {
  if (!playerId) return 0;
  const state = storeState ?? useGameStore.getState();
  const humanMs = config.stepMs ?? 230;
  const botMs = config.botStepMs ?? 200;
  const rollLead = state.isRolling ? (config.rollLeadMs ?? 1200) : 0;

  if (state.pendingPawnMove && state.pendingPawnMove.playerId === playerId) {
    const fromCell = state.pendingPawnMove.fromCell ?? 0;
    if (checkPassedGo(fromCell, state.pendingPawnMove.targetCell)) {
      const stepMs = state.pendingPawnMove.isBot ? botMs : humanMs;
      return Math.round(rollLead + ((40 - fromCell) % 40) * stepMs);
    }
  }
  const anim = state.activePawnAnimation;
  const activeRemainingMs = getAnimLead(anim, config);
  if (anim && anim.playerId === playerId && anim.waypoints?.length) {
    const fromCell = anim.fromCell;
    const targetCell = anim.targetCell ?? anim.waypoints[anim.waypoints.length - 1] ?? 0;
    if (checkPassedGo(fromCell, targetCell)) {
      const stepMs = anim.isBot ? botMs : humanMs;
      return Math.round(Math.max(0, ((40 - fromCell) % 40) - (anim.currentIndex ?? 0)) * stepMs);
    }
  }
  const queued = state.pawnAnimationQueue?.find((t) => t.playerId === playerId);
  if (queued && checkPassedGo(queued.fromCell ?? 0, queued.targetCell)) {
    const stepMs = queued.isBot ? botMs : humanMs;
    return Math.round(activeRemainingMs + ((40 - (queued.fromCell ?? 0)) % 40) * stepMs);
  }
  return 0;
}

export function createDefaultPacingContext(
  gameStore?: typeof useGameStore,
  config: PacingConfig = DEFAULT_PACING_CONFIG,
): PacingContext {
  const store = gameStore ?? useGameStore;
  return {
    getPawnLandingDelay: (playerId?: string) => getPawnLandingDelay(playerId, store.getState(), config),
    getPawnPassGoDelay: (playerId?: string) => getPawnPassGoDelay(playerId, store.getState(), config),
    scheduleAction: (action, delayMs) => {
      if (delayMs <= 0) {
        action();
        return null;
      }
      const timer = setTimeout(() => {
        pendingPacingTimers.delete(timer);
        action();
      }, delayMs);
      pendingPacingTimers.add(timer);
      return timer;
    },
    clearPendingTimers: clearPendingPacingTimers,
  };
}
