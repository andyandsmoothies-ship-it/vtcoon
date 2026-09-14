// [UC-GAME-009/MSS][TC-NET03.1/MSS][TC-NET03.2/MSS][UC-GAME-008/MSS]
// Đồng bộ hóa DeltaPayload (kể cả Sparse Diff) vào Zustand useGameStore
import { useGameStore, type PlayerHudInfo, type PawnMoveTask, FloatingTextType, type GameState } from '../store/game_store.js';
import { calculatePathWaypoints } from '../3d/pawn_path.js';
import { useLobbyStore } from '../store/lobby_store.js';
import { useVfxStore } from '../store/vfx_store.js';
import { BOARD_SIZE, TurnPhase } from '../../domain/room.js';
import { BOARD_CONFIG } from '../../domain/board_config.js';
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import { formatCurrency } from '../ui/ui_helpers.js';
import { AudioEngine } from '../audio/audio_engine.js';
import { SoundEffect } from '../audio/audio_types.js';
import { trackDeltaActivities } from './activity_tracker.js';
import { handleDeltaTelemetry } from '../telemetry/telemetry_delta_hook.js';

export function isGameRunningDelta(delta: DeltaPayload): boolean {
  if (delta.roomStarted !== undefined) return delta.roomStarted;
  return (
    delta.tick > 0 ||
    Boolean(delta.players?.some((p) => p.position > 0 || p.balance !== 15000)) ||
    Boolean(delta.cells?.some((c) => c.ownerId || (c.level !== undefined && c.level > 0)))
  );
}

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
type DeltaCell = NonNullable<DeltaPayload['cells']>[number];

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

function getLobbySlot(playerId: string): { playerName?: string; tokenColor?: string } | undefined {
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

function triggerCellLevelEffects(cellIndex: number, targetLevel: number, oldLevel: number): void {
  try {
    if (targetLevel > oldLevel && targetLevel >= 1) {
      useVfxStore.getState().triggerConstructionSlam(cellIndex, targetLevel as 1 | 2 | 3);
    }
    if (targetLevel === 3 && oldLevel < 3) {
      AudioEngine.playSfx(SoundEffect.UPGRADE_C3);
    }
  } catch {
    /* safe-ignore: test fallback */
  }
}

function updateCellLevel(
  cell: DeltaCell,
  state: GameState,
  nextLevelMap: Record<number, 0 | 1 | 2 | 3>,
  isFullSync: boolean,
): boolean {
  if (cell.level === undefined) return false;
  const oldLevel = state.levelMap[cell.index] ?? 0;
  const targetLevel = Math.max(0, Math.min(3, cell.level)) as 0 | 1 | 2 | 3;
  nextLevelMap[cell.index] = targetLevel;
  if (!isFullSync) triggerCellLevelEffects(cell.index, targetLevel, oldLevel);
  return true;
}

function checkMonopolyReward(cellIndex: number, ownerId: string, owner: PlayerHudInfo, state: GameState): void {
  const bCell = BOARD_CONFIG[cellIndex];
  if (!bCell?.colorGroup) return;
  const group = BOARD_CONFIG.filter((c) => c.colorGroup === bCell.colorGroup).map((c) => c.index);
  const hadAllBefore = group.every((idx) => owner.ownedProperties.includes(idx));
  const hasAllNow = group.every((idx) => owner.ownedProperties.includes(idx) || idx === cellIndex);
  if (!hadAllBefore && hasAllNow) {
    state.addFloatingText({
      text: `🎉 ĐỘC QUYỀN ${bCell.colorGroup.toUpperCase()}! Phí thuê cơ bản x2!`,
      type: FloatingTextType.Reward,
      playerId: ownerId,
    });
  }
}

function ensurePlayerRecord(playerId: string, playersInfoMap: Record<string, PlayerHudInfo>): void {
  if (playersInfoMap[playerId]) return;
  playersInfoMap[playerId] = {
    id: playerId,
    name: `Người Chơi (${playerId.toUpperCase()})`,
    balance: 15000,
    tokenColor: '#38BDF8',
    ownedProperties: [],
    mortgagedProperties: [],
    isBot: false,
  };
}

function removeCellFromPreviousOwners(cellIndex: number, newOwnerId: string | null | undefined, playersInfoMap: Record<string, PlayerHudInfo>): void {
  for (const [id, pInfo] of Object.entries(playersInfoMap)) {
    if (id === newOwnerId) continue;
    const owned = pInfo.ownedProperties.includes(cellIndex);
    const mortgaged = Boolean(pInfo.mortgagedProperties?.includes(cellIndex));
    if (!owned && !mortgaged) continue;
    playersInfoMap[id] = {
      ...pInfo,
      ownedProperties: owned ? pInfo.ownedProperties.filter((i) => i !== cellIndex) : pInfo.ownedProperties,
      mortgagedProperties: mortgaged ? (pInfo.mortgagedProperties ?? []).filter((i) => i !== cellIndex) : pInfo.mortgagedProperties,
    };
  }
}

function transferCellOwnership(
  cellIndex: number,
  newOwnerId: string | null | undefined,
  playersInfoMap: Record<string, PlayerHudInfo>,
  state: GameState,
  isFullSync: boolean,
): boolean {
  if (newOwnerId === undefined) return false;
  removeCellFromPreviousOwners(cellIndex, newOwnerId, playersInfoMap);
  if (!newOwnerId) return true;
  ensurePlayerRecord(newOwnerId, playersInfoMap);
  const owner = playersInfoMap[newOwnerId]!;
  if (!owner.ownedProperties.includes(cellIndex)) {
    if (!isFullSync) checkMonopolyReward(cellIndex, newOwnerId, owner, state);
    playersInfoMap[newOwnerId] = { ...owner, ownedProperties: [...owner.ownedProperties, cellIndex] };
  }
  return true;
}

function applyMortgageFlag(cellIndex: number, ownerId: string | undefined, playersInfoMap: Record<string, PlayerHudInfo>): boolean {
  const resolved = ownerId ?? Object.keys(playersInfoMap).find((id) => playersInfoMap[id]?.ownedProperties.includes(cellIndex));
  const owner = resolved ? playersInfoMap[resolved] : undefined;
  if (!owner || owner.mortgagedProperties?.includes(cellIndex)) return false;
  playersInfoMap[resolved!] = { ...owner, mortgagedProperties: [...(owner.mortgagedProperties ?? []), cellIndex] };
  return true;
}

function clearMortgageFlag(cellIndex: number, playersInfoMap: Record<string, PlayerHudInfo>): boolean {
  let changed = false;
  for (const [id, pInfo] of Object.entries(playersInfoMap)) {
    if (pInfo.mortgagedProperties?.includes(cellIndex)) {
      playersInfoMap[id] = { ...pInfo, mortgagedProperties: pInfo.mortgagedProperties.filter((idx) => idx !== cellIndex) };
      changed = true;
    }
  }
  return changed;
}

function updateCellMortgage(cell: DeltaCell, playersInfoMap: Record<string, PlayerHudInfo>, isFullSync: boolean): boolean {
  if (cell.isMortgaged === true) return applyMortgageFlag(cell.index, cell.ownerId ?? undefined, playersInfoMap);
  if (cell.isMortgaged === false || isFullSync) return clearMortgageFlag(cell.index, playersInfoMap);
  return false;
}

export function applyCellDeltas(
  delta: DeltaPayload,
  state: GameState,
  playersInfoMap: Record<string, PlayerHudInfo>,
  isFullSync: boolean,
): boolean {
  if (!delta.cells || delta.cells.length === 0) return false;
  const nextLevelMap = { ...state.levelMap };
  let hasLevelChange = false;
  let hasInfoChange = false;

  for (const cell of delta.cells) {
    if (updateCellLevel(cell, state, nextLevelMap, isFullSync)) hasLevelChange = true;
    if (transferCellOwnership(cell.index, cell.ownerId, playersInfoMap, state, isFullSync)) hasInfoChange = true;
    if (updateCellMortgage(cell, playersInfoMap, isFullSync)) hasInfoChange = true;
  }

  if (hasLevelChange) state.setLevelMap(nextLevelMap);
  return hasInfoChange;
}

function isDiceRollDuplicate(delta: DeltaPayload, state: GameState): boolean {
  if (delta.diceSeq !== undefined) {
    return state.lastDiceSeq !== undefined && delta.diceSeq <= state.lastDiceSeq;
  }
  if (state.hasRolledThisTurn && state.dice[0] === delta.dice?.[0] && state.dice[1] === delta.dice?.[1]) {
    return true;
  }
  return false;
}

function syncDiceRoll(delta: DeltaPayload, state: GameState): void {
  const dice = delta.dice;
  if (!dice || (dice[0] === 0 && dice[1] === 0)) return;
  if (isDiceRollDuplicate(delta, state)) return;

  state.triggerDiceRoll([dice[0], dice[1]], delta.diceSeq);
  try { AudioEngine.playSfx(SoundEffect.DICE_ROLL); } catch { /* safe-ignore: test fallback */ }
}

function resolveTurnPlayerId(delta: DeltaPayload): string | undefined {
  if (delta.currentTurnPlayerId) return delta.currentTurnPlayerId;
  return delta.currentPlayerIndex !== undefined ? delta.players?.[delta.currentPlayerIndex]?.id : undefined;
}

function syncTurnAndTimer(delta: DeltaPayload, state: GameState): void {
  const turnPlayerId = resolveTurnPlayerId(delta);
  if (turnPlayerId && state.currentTurnPlayerId !== turnPlayerId) {
    state.setCurrentTurnPlayerId(turnPlayerId);
    state.setTurnTimeRemaining(delta.timeRemaining ?? 60);
  } else if (delta.timeRemaining !== undefined) {
    state.setTurnTimeRemaining(delta.timeRemaining);
  }
}

function syncTreasuryPool(state: GameState): void {
  if (state.treasuryPool === 0) state.setTreasuryPool(2000);
}

function syncBusinessModals(delta: DeltaPayload, state: GameState): void {
  // [IMP-50] Trụ Cột 3: UI as Pure Projection — Modal chỉ đóng khi server phát delta.auction === null hoặc phase thay đổi
  if (delta.auction) {
    state.openModal('auction', delta.auction);
  } else if (
    (delta.auction === null || (delta.turnPhase !== undefined && delta.turnPhase !== TurnPhase.AuctionPhase)) &&
    state.activeModal === 'auction'
  ) {
    state.closeModal();
  }

  if (delta.turnPhase !== undefined) {
    if (
      state.activeModal === 'deed' &&
      delta.turnPhase !== TurnPhase.ActionPhase &&
      delta.turnPhase !== TurnPhase.PropertyManagement
    ) {
      state.closeModal();
    } else if (state.activeModal === 'insolvency' && delta.turnPhase !== TurnPhase.InsolvencyPhase) {
      state.closeModal();
    } else if (state.activeModal === 'hose' && delta.turnPhase !== TurnPhase.HosePhase) {
      state.closeModal();
    }
  }
}

function syncGameStarted(delta: DeltaPayload): void {
  if (!isGameRunningDelta(delta)) return;
  try { useLobbyStore.getState().setGameStarted(true); } catch { /* safe-ignore: test fallback */ }
}

function syncTelemetryAndActivities(delta: DeltaPayload, state: GameState, store: typeof useGameStore): void {
  try {
    trackDeltaActivities(delta, state, store.getState());
    handleDeltaTelemetry(delta, state, store.getState());
  } catch {
    /* safe-ignore: test fallback */
  }
}

function syncEventCard(card: DeltaPayload['lastEventCard'], state: GameState): void {
  if (card !== undefined) {
    state.setLastEventCard(card ?? null);
  }
}

export function applyPhaseAndTimerDeltas(delta: DeltaPayload, state: GameState, store: typeof useGameStore): void {
  syncDiceRoll(delta, state);
  syncTurnAndTimer(delta, state);
  syncTreasuryPool(state);
  syncBusinessModals(delta, state);
  syncEventCard(delta.lastEventCard, state);
  syncGameStarted(delta);
  syncTelemetryAndActivities(delta, state, store);
}

export function applyDeltaToStore(delta: DeltaPayload, store: typeof useGameStore = useGameStore): void {
  const state = store.getState();
  const isFullSync = Boolean(delta.cells && delta.cells.length === BOARD_SIZE);
  if (isFullSync && state.activePawnAnimation) state.clearActivePawnAnimation();
  if (isFullSync && delta.diceSeq !== undefined) state.setLastDiceSeq(delta.diceSeq);
  if (isFullSync && delta.dice && delta.dice[0] > 0 && delta.dice[1] > 0) {
    state.setDice([delta.dice[0], delta.dice[1]]);
  }

  const playersInfoMap = initPlayersInfoMap(state, isFullSync);
  let hasPlayerInfoChange = isFullSync && Object.keys(playersInfoMap).length > 0;

  if (applyPlayerDeltas(delta, state, playersInfoMap, isFullSync)) hasPlayerInfoChange = true;
  if (applyCellDeltas(delta, state, playersInfoMap, isFullSync)) hasPlayerInfoChange = true;

  if (hasPlayerInfoChange) state.setPlayersInfo(playersInfoMap);
  applyPhaseAndTimerDeltas(delta, state, store);
}
