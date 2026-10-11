import React from 'react';
import { formatCurrency } from './ui_helpers';

export interface PlayerNetWorthBadgeProps {
  readonly netWorth: number;
}

export function PlayerNetWorthBadge({ netWorth }: PlayerNetWorthBadgeProps): React.ReactElement {
  return (
    <span
      className="inline-flex items-center text-[10px] sm:text-[11px] text-slate-500 sm:text-slate-700 font-semibold sm:font-black tabular-nums shrink-0"
      data-testid="player-net-worth"
      title="Tài sản ròng"
    >
      ({formatCurrency(netWorth)})
    </span>
  );
}
