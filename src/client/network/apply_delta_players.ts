// [IMP-64] Extracted player delta functions from apply_delta.ts
// ZERO LOGIC CHANGE — code moved verbatim from apply_delta.ts L26–L184
import { type GameState, type PlayerHudInfo, type PawnMoveTask, FloatingTextType } from '../store/game_store.js';
import { calculatePathWaypoints } from '../3d/pawn_path.js';
import { useLobbyStore } from '../store/lobby_store.js';
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import { formatCurrency } from '../ui/ui_helpers.js';

function initPlayersInfoMap(state: GameState, isFullSync: boolean): Record<string, PlayerHudInfo> {
  const map: Record<string, PlayerHudInfo> = {};
  for (const [id, info] of Object.entries(state.playersInfo)) {
    map[id] = {
      ...info,
      ownedProperties: isFullSync ? [] : [...info.ownedProperties],
      mortgagedProperties: isFullSync ? [] : (info.mortgagedProperties ? [...info.mortgagedProperties] : []),
    };
  }
  return map;
}

function determineFromCell(state: GameState, playerId: string, currentPos: number): number {
  const queue = state.pawnAnimationQueue ?? [];
  const pTasks = queue.filter((t) => t.playerId === playerId);
  if (pTasks.length > 0) return pTasks[pTasks.length - 1]!.targetCell;

  const anim = state.activePawnAnimation;
  if (anim?.playerId === playerId && anim.waypoints.length > 0) {
    return anim.waypoints[anim.waypoints.length - 1]!;
  }
  const isBusy = Boolean(anim?.isAnimating) || queue.length > 0;
  const visualPos = state.visualPositions?.[playerId];
  return (isBusy && visualPos !== undefined) ? visualPos : currentPos;
}

function dispatchPawnMove(state: GameState, task: PawnMoveTask, isRolling: boolean): void {
  if (isRolling && state.setPendingPawnMove) {
    state.setPendingPawnMove({ playerId: task.playerId, targetCell: task.targetCell, fromCell: task.fromCell });
  } else if (state.enqueuePawnMove) {
    state.enqueuePawnMove(task);
  } else {
    state.startPawnMove?.(task.playerId, task.targetCell, task.fromCell, Boolean(task.isBot));
  }
}

function notifyBalanceChange(state: GameState, playerId: string, diff: number, oldBalance: number, newBalance: number): void {
  if (diff > 0) {
    state.addFloatingText({ text: `+${formatCurrency(diff)}`, type: FloatingTextType.Reward, playerId });
    if (oldBalance < 0 && newBalance >= 0) {
      if (state.activeModal === 'insolvency') state.closeModal();
      state.addFloatingText({ text: '🎉 Thoát vỡ nợ thành công! Hãy bấm Hết Lượt.', type: FloatingTextType.Reward, playerId });
    }
  } else if (diff < 0) {
    state.addFloatingText({ text: formatCurrency(diff), type: FloatingTextType.Penalty, playerId });
  }
}

type DeltaPlayer = NonNullable<DeltaPayload['players']>[number];

const OPTIONAL_PLAYER_KEYS = [
  'bankrupt', 'overdraftRoundsLeft', 'inAudit',
  'auditTurnsLeft', 'skipNextTurn', 'consecutiveDoubles',
] as const;

function assignPlayerOptionalFlags(target: PlayerHudInfo, p: DeltaPlayer): PlayerHudInfo {
  const patch: Record<string, unknown> = {};
  for (const key of OPTIONAL_PLAYER_KEYS) {
    if (p[key] !== undefined) patch[key] = p[key];
  }
  return { ...target, ...patch };
}

function resolvePlayerName(p: DeltaPlayer, pIdx: number, lobbyName?: string): string {
  if (lobbyName) return lobbyName;
  if (p.isBot) {
    const num = p.id.replace(/\D/g, '');
    return `Bot AI ${num || pIdx + 1}`;
  }
  return `Người Chơi (${p.id.toUpperCase()})`;
}

function resolvePlayerColor(pIdx: number, lobbyColor?: string): string {
  if (lobbyColor) return lobbyColor;
  return PLAYER_TOKEN_PALETTE[pIdx % PLAYER_TOKEN_PALETTE.length] ?? '#38BDF8';
}

function getLobbySlot(playerId: string): { playerName?: string; tokenColor?: string; pawnSlot?: number; mascotIcon?: string } | undefined {
  try {
    return useLobbyStore.getState().slots?.find((s) => s.playerId === playerId);
  } catch {
    /* safe-ignore: test fallback */
    return undefined;
  }
}

function updatePlayerHudRecord(existing: PlayerHudInfo | undefined, p: DeltaPlayer, pIdx: number): PlayerHudInfo {
  if (existing) {
    const updated: PlayerHudInfo = { ...existing, balance: p.balance, isBot: Boolean(p.isBot) };
    return assignPlayerOptionalFlags(updated, p);
  }
  const slot = getLobbySlot(p.id);
  const created: PlayerHudInfo = {
    id: p.id,
    name: resolvePlayerName(p, pIdx, slot?.playerName),
    balance: p.balance,
    tokenColor: resolvePlayerColor(pIdx, slot?.tokenColor),
    ownedProperties: [],
    mortgagedProperties: [],
    isBot: Boolean(p.isBot),
    pawnSlot: slot?.pawnSlot,
    mascotIcon: slot?.mascotIcon,
  };
  return assignPlayerOptionalFlags(created, p);
}

function processSinglePlayerPosition(
  state: GameState,
  p: DeltaPlayer,
  nextPositions: Record<string, number>,
  isFullSync: boolean,
): boolean {
  if (nextPositions[p.id] === p.position) return false;
  const fromCell = determineFromCell(state, p.id, nextPositions[p.id] ?? 0);
  nextPositions[p.id] = p.position;
  if (!isFullSync && fromCell !== p.position) {
    const waypoints = calculatePathWaypoints(fromCell, p.position);
    if (waypoints.length > 0) {
      dispatchPawnMove(state, { playerId: p.id, fromCell, targetCell: p.position, waypoints, isBot: Boolean(p.isBot) }, state.isRolling);
    }
  }
  return true;
}

function syncPlayerBalanceDiff(
  state: GameState,
  p: DeltaPlayer,
  existing: PlayerHudInfo | undefined,
  isFullSync: boolean,
): void {
  if (isFullSync || !existing || existing.balance === p.balance) return;
  notifyBalanceChange(state, p.id, p.balance - existing.balance, existing.balance, p.balance);
}

function syncFinalPositions(state: GameState, nextPositions: Record<string, number>, hasPosChange: boolean, isFullSync: boolean): void {
  if (!hasPosChange) return;
  state.setPlayerPositions(nextPositions);
  if (isFullSync && state.setVisualPositions) {
    state.setVisualPositions(nextPositions);
  }
}

export { initPlayersInfoMap };

export function applyPlayerDeltas(
  delta: DeltaPayload, state: GameState, playersInfoMap: Record<string, PlayerHudInfo>, isFullSync: boolean,
): boolean {
  const players = delta.players;
  if (!players || players.length === 0) return false;
  const nextPositions = { ...state.playerPositions };
  let hasPosChange = false;

  players.forEach((p, pIdx) => {
    if (processSinglePlayerPosition(state, p, nextPositions, isFullSync)) hasPosChange = true;
    const existing = playersInfoMap[p.id];
    syncPlayerBalanceDiff(state, p, existing, isFullSync);
    playersInfoMap[p.id] = updatePlayerHudRecord(existing, p, pIdx);
  });

  syncFinalPositions(state, nextPositions, hasPosChange, isFullSync);
  return true;
}
