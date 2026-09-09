// [UI-S03/MSS] PlayerCard Component — Individual player stats, balance, net worth, assets
import React from 'react';
import type { PlayerHudInfo } from '../store/game_store';
import { formatCurrency, calculatePlayerNetWorth, getOwnedColorGroups } from './ui_helpers';
import { COLOR_GROUP_HEX } from '../../domain/theme';

interface PlayerCardProps {
  readonly player: PlayerHudInfo;
  readonly isCurrentTurn: boolean;
  readonly levelMap: Record<number, 0 | 1 | 2 | 3>;
}

export function PlayerCard({
  player,
  isCurrentTurn,
  levelMap,
}: PlayerCardProps): React.ReactElement {
  const netWorth = calculatePlayerNetWorth(
    player.balance,
    player.ownedProperties ?? [],
    levelMap,
    player.mortgagedProperties ?? [],
    player.mortgageLoans
  );

  const isNegativeBalance = player.balance < 0;
  const balanceColorClass = isNegativeBalance
    ? 'text-rose-400 font-bold'
    : 'text-emerald-400 font-semibold';

  const ownedGroups = getOwnedColorGroups(player.ownedProperties ?? []);

  return (
    <div
      className={`pointer-events-auto relative flex flex-col gap-1.5 p-3 rounded-xl border backdrop-blur-md transition-all duration-200 shadow-lg ${
        isCurrentTurn
          ? 'bg-slate-900/95 border-amber-400/80 ring-2 ring-amber-400 shadow-amber-500/20'
          : 'bg-slate-900/75 border-slate-700/50 hover:border-slate-600/80'
      } ${player.bankrupt ? 'opacity-50 grayscale' : ''}`}
      role="region"
      aria-label={`Thông tin ${player.name}`}
    >
      {/* Header: Token avatar, Tên, Badges */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-4 h-4 rounded-full border border-white/40 shadow-sm shrink-0"
            style={{ backgroundColor: player.tokenColor || '#38BDF8' }}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-slate-100 truncate">
            {player.name}
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1 shrink-0">
          {player.bankrupt && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
              Phá Sản
            </span>
          )}
          {player.inAudit && !player.bankrupt && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
              Kiểm Toán
            </span>
          )}
          {isCurrentTurn && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/50 animate-pulse">
              LƯỢT
            </span>
          )}
        </div>
      </div>

      {/* Dữ liệu tài chính: Tiền mặt + Net Worth */}
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase">Tiền mặt</span>
          <span className={`tabular-nums ${balanceColorClass}`}>
            {formatCurrency(player.balance)}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-slate-400 uppercase">Tài sản ròng</span>
          <span className="font-medium text-slate-200 tabular-nums">
            {formatCurrency(netWorth)}
          </span>
        </div>
      </div>

      {/* Dải chấm màu nhóm đất sở hữu */}
      {ownedGroups.length > 0 && (
        <div className="flex items-center gap-1 pt-1 border-t border-slate-800/80">
          <span className="text-[9px] text-slate-500 uppercase tracking-tighter mr-0.5">
            BĐS:
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {ownedGroups.map((group) => (
              <span
                key={group}
                className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-xs"
                style={{ backgroundColor: COLOR_GROUP_HEX[group] }}
                title={group}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
