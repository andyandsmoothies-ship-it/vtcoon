// [IMP-64] Extracted cell delta functions from apply_delta.ts
// ZERO LOGIC CHANGE — code moved verbatim from apply_delta.ts L186–L318
import { type GameState, type PlayerHudInfo, FloatingTextType } from '../store/game_store.js';
import { BOARD_CONFIG } from '../../domain/board_config.js';
import { AudioEngine } from '../audio/audio_engine.js';
import { SoundEffect } from '../audio/audio_types.js';
import { useVfxStore } from '../store/vfx_store.js';
import type { DeltaPayload } from '../../server/session_manager.js';

type DeltaCell = NonNullable<DeltaPayload['cells']>[number];

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
