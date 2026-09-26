// [IMP-64] Extracted player delta functions from apply_delta.ts
// ZERO LOGIC CHANGE — code moved verbatim from apply_delta.ts L26–L184
import { type GameState, type PlayerHudInfo, type PawnMoveTask, FloatingTextType, type FloatingActionType } from '../store/game_store.js';
import { calculatePathWaypoints, calculateJailFlightWaypoints } from '../3d/pawn_path.js';
import { useLobbyStore } from '../store/lobby_store.js';
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import { formatCurrency } from '../ui/ui_helpers.js';

function initPlayersInfoMap(
  state: GameState,
  isFullSync: boolean,
  deltaPlayers?: DeltaPayload['players'],
): Record<string, PlayerHudInfo> {
  const map: Record<string, PlayerHudInfo> = {};
  const shouldPrune = isFullSync && Array.isArray(deltaPlayers);
  const allowedIds = shouldPrune ? new Set(deltaPlayers.map((p) => p.id)) : null;

  for (const [id, info] of Object.entries(state.playersInfo)) {
    if (allowedIds && !allowedIds.has(id)) continue;
    map[id] = {
      ...info,
      ownedProperties: isFullSync ? [] : (info.ownedProperties ? [...info.ownedProperties] : []),
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
    state.setPendingPawnMove({
      playerId: task.playerId,
      targetCell: task.targetCell,
      fromCell: task.fromCell,
      ...(task.isJailFlight ? { isJailFlight: true, isBot: Boolean(task.isBot) } : {}),
    });
  } else if (state.enqueuePawnMove) {
    state.enqueuePawnMove(task);
  } else {
    state.startPawnMove?.(task.playerId, task.targetCell, task.fromCell, Boolean(task.isBot), task.isJailFlight);
  }
}

export interface BalanceChangeContext {
  readonly isPassingGo?: boolean;
  readonly cellIndex?: number;
  readonly isBail?: boolean;
  readonly targetPlayerName?: string;
  readonly actionType?: FloatingActionType;
  readonly title?: string;
}

export function notifyBalanceChange(
  state: GameState,
  playerId: string,
  diff: number,
  oldBalance: number,
  newBalance: number,
  context?: BalanceChangeContext,
): void {
  if (diff > 0) {
    if (oldBalance < 0 && newBalance >= 0) {
      if (state.activeModal === 'insolvency') state.closeModal();
      state.addFloatingText({
        text: `+${formatCurrency(diff)}`,
        type: FloatingTextType.Reward,
        playerId,
        actionType: 'debt_relief',
        title: 'Thoát vỡ nợ thành công! Hãy bấm Hết Lượt.',
      });
      return;
    }
    const isSalary = context?.isPassingGo || context?.actionType === 'salary' || diff === 2000;
    const actionType: FloatingActionType = context?.actionType ?? (isSalary ? 'salary' : 'general');
    const title = context?.title ?? (isSalary ? 'Lương Vượt GO' : undefined);
    state.addFloatingText({
      text: `+${formatCurrency(diff)}`,
      type: FloatingTextType.Reward,
      playerId,
      actionType,
      title,
      cellIndex: context?.cellIndex,
      targetPlayerName: context?.targetPlayerName,
    });
  } else if (diff < 0) {
    const isBail = context?.isBail;
    const isTax = context?.cellIndex === 4;
    const actionType: FloatingActionType = context?.actionType ?? (isBail ? 'bail' : isTax ? 'tax' : 'general');
    const title = context?.title ?? (isBail ? 'Bảo Lãnh Kiểm Toán' : isTax ? 'Lệ Phí Đất Đai' : undefined);
    state.addFloatingText({
      text: formatCurrency(diff),
      type: FloatingTextType.Penalty,
      playerId,
      actionType,
      title,
      cellIndex: context?.cellIndex,
      targetPlayerName: context?.targetPlayerName,
    });
  }
}

type DeltaPlayer = NonNullable<DeltaPayload['players']>[number];

const OPTIONAL_PLAYER_KEYS = [
  'bankrupt', 'overdraftRoundsLeft', 'inAudit',
  'auditTurnsLeft', 'skipNextTurn', 'consecutiveDoubles', 'extraTurns',
  'bondContract', 'hand',
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
    return assignPlayerOptionalFlags({ ...existing, balance: p.balance, isBot: Boolean(p.isBot) }, p);
  }
  const slot = getLobbySlot(p.id);
  return assignPlayerOptionalFlags({
    id: p.id,
    name: resolvePlayerName(p, pIdx, slot?.playerName),
    balance: p.balance,
    tokenColor: resolvePlayerColor(pIdx, slot?.tokenColor),
    ownedProperties: [],
    mortgagedProperties: [],
    isBot: Boolean(p.isBot),
    pawnSlot: slot?.pawnSlot,
    mascotIcon: slot?.mascotIcon,
    hand: p.hand ?? [],
  }, p);
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

  const existingInfo = state.playersInfo?.[p.id];
  const existingWasInAudit = Boolean(existingInfo?.inAudit || (existingInfo?.auditTurnsLeft && existingInfo.auditTurnsLeft > 0));
  const isGoingToAudit = p.position === 10 && Boolean(p.inAudit || (p.auditTurnsLeft && p.auditTurnsLeft > 0)) && !existingWasInAudit;

  if (!isFullSync && fromCell !== p.position) {
    const isJailFlight = isGoingToAudit && p.position === 10;
    const waypoints = isJailFlight ? calculateJailFlightWaypoints(p.position) : calculatePathWaypoints(fromCell, p.position);
    if (waypoints.length > 0) {
      dispatchPawnMove(state, {
        playerId: p.id,
        fromCell,
        targetCell: p.position,
        waypoints,
        isBot: Boolean(p.isBot),
        ...(isJailFlight ? { isJailFlight: true } : {}),
      }, state.isRolling);
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
  const diff = p.balance - existing.balance;
  const prevPos = state.playerPositions[p.id] ?? 0;
  const isPassingGo = prevPos > (p.position ?? prevPos) || p.position === 0;
  const isDebtRelief = existing.balance < 0 && p.balance >= 0;
  const isSalary = isPassingGo || diff === 2000;

  // [IMP-122][IMP-191] Không sinh badge generic trùng lặp khi biến động tài chính đã được
  // activity_tracker (rent, buy, upgrade, tax, bail, auction) gắn pop-up ngữ cảnh chuyên biệt.
  if (!isDebtRelief && !isSalary) {
    return;
  }

  notifyBalanceChange(state, p.id, diff, existing.balance, p.balance, { cellIndex: p.position, isPassingGo });
}

function syncFinalPositions(state: GameState, nextPositions: Record<string, number>, hasPosChange: boolean, isFullSync: boolean): void {
  if (!hasPosChange && !isFullSync) return;
  state.setPlayerPositions(nextPositions);
  if (isFullSync) state.setVisualPositions?.(nextPositions);
}

export { initPlayersInfoMap };

export function applyPlayerDeltas(
  delta: DeltaPayload, state: GameState, playersInfoMap: Record<string, PlayerHudInfo>, isFullSync: boolean,
): boolean {
  const players = delta.players;
  if (!players || players.length === 0) return false;
  const nextPositions = { ...state.playerPositions };
  let hasPosChange = false;

  if (isFullSync && Array.isArray(players)) {
    const allowedIds = new Set(players.map((p) => p.id));
    for (const id of Object.keys(nextPositions)) {
      if (!allowedIds.has(id)) {
        delete nextPositions[id];
        hasPosChange = true;
      }
    }
  }

  players.forEach((p, pIdx) => {
    if (processSinglePlayerPosition(state, p, nextPositions, isFullSync)) hasPosChange = true;
    const existing = playersInfoMap[p.id];
    syncPlayerBalanceDiff(state, p, existing, isFullSync);
    if (p.bankrupt === true && state.activeModal === 'insolvency') {
      const modalPlayerId = (state.modalPayload as Record<string, unknown> | undefined)?.playerId;
      if (!modalPlayerId || modalPlayerId === p.id) state.closeModal();
    }
    playersInfoMap[p.id] = updatePlayerHudRecord(existing, p, pIdx);
  });

  syncFinalPositions(state, nextPositions, hasPosChange, isFullSync);
  return true;
}
