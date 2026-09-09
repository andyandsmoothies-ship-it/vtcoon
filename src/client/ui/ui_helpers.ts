// [UI-S03/MSS] Pure UI helpers — Currency, countdown timer, net worth calculations & dock states
import { PROPERTY_DEEDS } from '../../domain/property_data';
import { BOARD_CONFIG, ColorGroup } from '../../domain/board_config';

const LEVEL_MULTIPLIER: Record<number, number> = { 0: 1, 1: 1.5, 2: 2.5, 3: 4 };

/**
 * Format currency to Vietnamese standard abbreviation ("12.500 Tr." or "-1.200 Tr.")
 * Clamps negative rounding to zero (e.g. -0.2 -> "0 Tr.") to prevent "-0 Tr."
 */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '0 Tr.';
  }
  const absVal = Math.abs(Math.round(amount));
  const isNegative = amount < 0 && absVal > 0;
  const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${isNegative ? '-' : ''}${formatted} Tr.`;
}

/**
 * Format remaining turn seconds to MM:SS string ("00:45", "01:15")
 * Automatically clamps negative or non-finite values to "00:00".
 */
export function formatTimeRemaining(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '00:00';
  }
  const totalSec = Math.floor(seconds);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  const mm = mins.toString().padStart(2, '0');
  const ss = secs.toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

/**
 * Calculate player Net Worth = Cash + Property values (with upgrades) - Mortgage loans
 * Mortgaged properties deduct loan amount (from mortgageLoans map or default 50% base price).
 * Safely deduplicates owned cells and handles undefined inputs.
 */
export function calculatePlayerNetWorth(
  cash: number,
  ownedCellIndices: readonly number[] = [],
  levelMap: Record<number, 0 | 1 | 2 | 3> = {},
  mortgagedCellIndices: readonly number[] = [],
  mortgageLoans?: Record<number, number>
): number {
  let worth = Number.isFinite(cash) ? Math.round(cash) : 0;
  const mortgagedSet = new Set(mortgagedCellIndices ?? []);
  const uniqueOwned = Array.from(new Set(ownedCellIndices ?? []));

  for (const cellIndex of uniqueOwned) {
    const deed = PROPERTY_DEEDS.get(cellIndex);
    if (!deed) continue;

    const level = (levelMap ?? {})[cellIndex] ?? 0;
    const mult = LEVEL_MULTIPLIER[level] ?? 1;
    worth += Math.floor(deed.price * mult);

    if (mortgagedSet.has(cellIndex)) {
      const loan = mortgageLoans?.[cellIndex] ?? Math.floor(deed.price * 0.5);
      worth -= loan;
    }
  }

  return worth;
}

/**
 * Get unique color groups owned by player for HUD visual dots
 */
export function getOwnedColorGroups(ownedCellIndices: readonly number[] = []): readonly ColorGroup[] {
  const groups = new Set<ColorGroup>();
  const list = ownedCellIndices ?? [];
  for (const idx of list) {
    const cell = BOARD_CONFIG[idx];
    if (cell?.colorGroup) {
      groups.add(cell.colorGroup);
    }
  }
  return Array.from(groups);
}

export interface ActionDockButtonStateParams {
  readonly isRolling: boolean;
  readonly isPawnMoving: boolean;
  readonly isMyTurn: boolean;
  readonly isBankrupt?: boolean;
}

/**
 * TC-UI03.5: Pure logic checking whether roll dice action is disabled
 */
export function isRollActionDisabled(params: ActionDockButtonStateParams): boolean {
  return (
    params.isRolling ||
    params.isPawnMoving ||
    !params.isMyTurn ||
    Boolean(params.isBankrupt)
  );
}

/**
 * Pure logic checking whether end turn action is disabled
 */
export function isEndTurnDisabled(params: ActionDockButtonStateParams): boolean {
  return (
    !params.isMyTurn ||
    params.isRolling ||
    params.isPawnMoving ||
    Boolean(params.isBankrupt)
  );
}
