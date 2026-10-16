import { BOARD_CONFIG, ColorGroup } from '../../domain/board_config';
import type { PropertyStateMap } from '../../domain/property_data';
import type { ActiveSlam } from '../store/vfx_store';

export interface MonopolyGroupInfo {
  readonly colorGroup: ColorGroup;
  readonly ownerId: string;
  readonly ownerColor: string;
  readonly ownerName: string;
  readonly cells: readonly number[];
}

export interface PlayerMonopolyInfo {
  id: string;
  name?: string;
  tokenColor?: string;
  balance?: number;
  ownedProperties?: readonly number[];
  mortgagedProperties?: readonly number[];
}

const ALL_COLOR_GROUPS: readonly ColorGroup[] = [
  ColorGroup.Nau,
  ColorGroup.XanhDaTroi,
  ColorGroup.Hong,
  ColorGroup.Cam,
  ColorGroup.Do,
  ColorGroup.Vang,
  ColorGroup.XanhLa,
  ColorGroup.Tim,
];

export function getMonopolyColorGroupCells(colorGroup: ColorGroup | string): readonly number[] {
  if (!colorGroup || typeof colorGroup !== 'string') return [];
  return BOARD_CONFIG.filter((c) => c.colorGroup === colorGroup).map((c) => c.index);
}

function isPropertyStateMap(val: unknown): val is PropertyStateMap {
  return typeof val === 'object' && val !== null && 'get' in val;
}

function isGroupMortgaged(
  cells: readonly number[],
  playerMortgaged?: readonly number[],
  externalMortgaged?: readonly number[] | PropertyStateMap | null
): boolean {
  if (playerMortgaged?.some((c) => cells.includes(c))) return true;
  if (!externalMortgaged) return false;
  if (isPropertyStateMap(externalMortgaged)) {
    return cells.some((c) => externalMortgaged.get(c)?.isMortgaged);
  }
  return externalMortgaged.some((c) => cells.includes(c));
}

function findGroupOwner(
  cells: readonly number[],
  players: readonly PlayerMonopolyInfo[]
): PlayerMonopolyInfo | undefined {
  return players.find((p) => cells.every((c) => p.ownedProperties?.includes(c)));
}

export function detectPlayerMonopolies(
  playersInfo?: Record<string, PlayerMonopolyInfo> | null,
  mortgagedProperties?: readonly number[] | PropertyStateMap | null
): Record<string, MonopolyGroupInfo> {
  if (!playersInfo || Object.keys(playersInfo).length === 0) return {};

  const players = Object.values(playersInfo).filter(Boolean);
  const result: Record<string, MonopolyGroupInfo> = {};

  for (const group of ALL_COLOR_GROUPS) {
    const cells = getMonopolyColorGroupCells(group);
    if (cells.length === 0) continue;

    const owner = findGroupOwner(cells, players);
    if (!owner) continue;

    if (isGroupMortgaged(cells, owner.mortgagedProperties, mortgagedProperties)) continue;

    result[group] = {
      colorGroup: group,
      ownerId: owner.id,
      ownerColor: owner.tokenColor || '#EF4444',
      ownerName: owner.name || owner.id,
      cells,
    };
  }

  return result;
}

export function isCellInMonopolyGroup(
  cellIndex: number,
  monopolyMap?: Record<string, MonopolyGroupInfo> | null
): boolean {
  if (typeof cellIndex !== 'number' || Number.isNaN(cellIndex) || cellIndex < 0 || cellIndex >= 40 || !monopolyMap) {
    return false;
  }
  return Object.values(monopolyMap).some((g) => g.cells.includes(cellIndex));
}

export function hasNewMonopolyGroup(
  previousMonopolies?: Record<string, MonopolyGroupInfo> | null,
  currentMonopolies?: Record<string, MonopolyGroupInfo> | null
): boolean {
  if (!currentMonopolies) return false;
  if (!previousMonopolies) return Object.keys(currentMonopolies).length > 0;
  return Object.keys(currentMonopolies).some((k) => !(k in previousMonopolies));
}

const BOARD_TILE_COUNT = 40;

export interface DominoRippleOptions {
  readonly waveDelayPerCellMs?: number;
  readonly maxDistanceInCells?: number;
  readonly ttlMs?: number;
  readonly baseAmplitudeY?: number;
  readonly basePitchRad?: number;
  readonly angularFrequency?: number;
  readonly dampingRatio?: number;
}

export interface DominoRippleTransform {
  readonly yOffset: number;
  readonly scaleY: number;
  readonly pitchRad: number;
  readonly isSettled: boolean;
}

export function getCircularCellDistance(cellA: number, cellB: number): number {
  const validA = typeof cellA === 'number' && Number.isFinite(cellA) && cellA >= 0 && cellA < BOARD_TILE_COUNT;
  const validB = typeof cellB === 'number' && Number.isFinite(cellB) && cellB >= 0 && cellB < BOARD_TILE_COUNT;
  if (!validA || !validB) return Infinity;
  const diff = Math.abs(Math.floor(cellA) - Math.floor(cellB));
  return Math.min(diff, BOARD_TILE_COUNT - diff);
}

export function calculateDominoRippleTransform(
  distanceInCells: number,
  elapsedMs: number,
  options?: DominoRippleOptions
): DominoRippleTransform {
  const waveDelayPerCellMs = options?.waveDelayPerCellMs ?? 65;
  const maxDistanceInCells = options?.maxDistanceInCells ?? 4;
  const ttlMs = options?.ttlMs ?? 900;
  const baseAmplitudeY = options?.baseAmplitudeY ?? 0.14;
  const basePitchRad = options?.basePitchRad ?? 0.09;
  const angularFrequency = options?.angularFrequency ?? 0.022;
  const dampingRatio = options?.dampingRatio ?? 0.0055;

  if (!Number.isFinite(distanceInCells) || distanceInCells <= 0 || distanceInCells > maxDistanceInCells || !Number.isFinite(elapsedMs) || elapsedMs >= ttlMs) {
    return { yOffset: 0, scaleY: 1, pitchRad: 0, isSettled: true };
  }
  const delayMs = distanceInCells * waveDelayPerCellMs;
  if (elapsedMs < delayMs) {
    return { yOffset: 0, scaleY: 1, pitchRad: 0, isSettled: false };
  }
  const localT = elapsedMs - delayMs;
  const distFactor = 1 / (1 + 0.35 * (distanceInCells - 1));
  const decay = Math.exp(-dampingRatio * localT);
  if (decay < 0.005) {
    return { yOffset: 0, scaleY: 1, pitchRad: 0, isSettled: true };
  }
  const waveSin = Math.sin(angularFrequency * localT);
  const waveCos = Math.cos(angularFrequency * localT * 0.9);
  const yOffset = Number(Math.max(0, baseAmplitudeY * distFactor * decay * waveSin).toFixed(5));
  const scaleY = Number((1 + yOffset * 0.85).toFixed(5));
  const pitchRad = Number((basePitchRad * distFactor * decay * waveCos).toFixed(5));
  return { yOffset, scaleY, pitchRad, isSettled: false };
}

export function resolveMobilePoolDominoSlam(
  cellIndex: number | undefined,
  activeSlams: Readonly<Record<number, ActiveSlam>> | null | undefined,
  nowMs = Date.now()
): { readonly slam: ActiveSlam; readonly distanceInCells: number } | null {
  if (cellIndex === undefined || !activeSlams) return null;
  let bestCandidate: { readonly slam: ActiveSlam; readonly distanceInCells: number } | null = null;
  for (const key in activeSlams) {
    const slam = activeSlams[Number(key)];
    if (!slam) continue;
    const d = getCircularCellDistance(cellIndex, slam.cellIndex);
    if (d < 1 || d > 4) continue;
    const elapsedSinceImpact = nowMs - (slam.startTime + slam.impactTimeMs);
    if (elapsedSinceImpact >= 900) continue;
    if (!bestCandidate || slam.startTime > bestCandidate.slam.startTime || (slam.startTime === bestCandidate.slam.startTime && d < bestCandidate.distanceInCells)) {
      bestCandidate = { slam, distanceInCells: d };
    }
  }
  return bestCandidate;
}

export function resolveNeighborDominoSlam(
  cellIndex: number | undefined,
  activeSlams: Readonly<Record<number, ActiveSlam>> | null | undefined,
  isMobile = false,
  nowMs = Date.now()
): { readonly slam: ActiveSlam; readonly distanceInCells: number } | null {
  if (isMobile) return null;
  return resolveMobilePoolDominoSlam(cellIndex, activeSlams, nowMs);
}
