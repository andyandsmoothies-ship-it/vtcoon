import { BOARD_CONFIG, ColorGroup } from '../../domain/board_config';
import type { PropertyStateMap } from '../../domain/property_data';

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
