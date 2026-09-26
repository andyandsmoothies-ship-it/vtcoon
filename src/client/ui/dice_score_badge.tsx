// [UI-S02/MSS][IMP-196] 2D HUD Dice Score Callout Badge
import React from 'react';
import { TurnPhase } from '../../domain/room.js';

export interface DiceScoreBadgeProps {
  readonly dice: readonly [number, number];
  readonly isRolling?: boolean;
  readonly isVisible?: boolean;
  readonly hasRolledThisTurn?: boolean;
  readonly turnPhase?: TurnPhase;
}

export function DiceScoreBadge({
  dice,
  isRolling = false,
  isVisible = true,
  hasRolledThisTurn = false,
  turnPhase,
}: DiceScoreBadgeProps): React.ReactElement | null {
  if (
    !isVisible ||
    !hasRolledThisTurn ||
    turnPhase === TurnPhase.WaitingRoll ||
    isRolling ||
    dice[0] <= 0 ||
    dice[1] <= 0
  ) {
    return null;
  }

  const sum = dice[0] + dice[1];
  const isDoubles = dice[0] === dice[1];

  return (
    <div
      data-testid="dice-score-badge"
      className="pointer-events-none select-none px-3 py-1 rounded-full border-2 border-slate-900 bg-[#FFFDF8] text-slate-900 text-xs sm:text-sm font-extrabold shadow-[0_3px_0_0_#0f172a] flex items-center justify-center gap-1.5"
    >
      <span>
        🎲 {dice[0]} + {dice[1]} = {sum}{isDoubles ? ' (Đôi! 🎉)' : ''}
      </span>
    </div>
  );
}

export default DiceScoreBadge;
