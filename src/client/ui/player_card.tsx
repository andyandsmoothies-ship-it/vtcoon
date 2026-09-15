import React from 'react';
import { useGameStore, type PlayerHudInfo } from '../store/game_store';
import { formatCurrency, calculatePlayerNetWorth, getOwnedColorGroups } from './ui_helpers';
import { COLOR_GROUP_HEX } from '../../domain/theme';
import { getEmoteDef } from '../../domain/emotes';

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
  const activeEmote = useGameStore((state) => state.activeEmotes[player.id]);

  const netWorth = calculatePlayerNetWorth(
    player.balance,
    player.ownedProperties ?? [],
    levelMap,
    player.mortgagedProperties ?? [],
    player.mortgageLoans
  );

  const isNegativeBalance = player.balance < 0;
  const balanceColorClass = isNegativeBalance
    ? 'text-rose-700 font-black'
    : 'text-emerald-700 font-black';

  const ownedGroups = getOwnedColorGroups(player.ownedProperties ?? []);

  return (
    <div
      className={`pointer-events-auto relative flex flex-col gap-1.5 p-3 rounded-2xl border-2 border-slate-900 bg-[#FFFDF8] text-slate-900 transition-all duration-200 w-[220px] sm:w-[240px] ${
        isCurrentTurn
          ? 'ring-2 ring-amber-400 shadow-[0_6px_0_0_#0f172a]'
          : 'shadow-[0_4px_0_0_#0f172a]'
      } ${player.bankrupt ? 'opacity-50 grayscale' : ''}`}
      role="region"
      aria-label={`Thông tin ${player.name}`}
    >
      {/* Emote Bubble Popover trên Avatar (3 giây) */}
      {activeEmote && (
        <div
          className="absolute -top-6 -right-2 z-30 animate-emote-pop pointer-events-none flex items-center justify-center bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl p-1 px-2.5 shadow-md text-slate-900"
          role="status"
          aria-label={`${player.name} gửi biểu cảm ${getEmoteDef(activeEmote.emoteId)?.label ?? activeEmote.emoteId}`}
        >
          <span className="text-2xl drop-shadow-md" aria-hidden="true">
            {getEmoteDef(activeEmote.emoteId)?.icon ?? '💬'}
          </span>
          <div className="absolute -bottom-1 left-4 w-2 h-2 bg-[#FFFDF8] border-r-2 border-b-2 border-slate-900 rotate-45" />
        </div>
      )}
      {/* Header: Token avatar, Tên, Badges */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-4 h-4 rounded-full border border-slate-900 shadow-sm shrink-0"
            style={{ backgroundColor: player.tokenColor || '#38BDF8' }}
            aria-hidden="true"
          />
          <span className="text-sm font-bold text-slate-900 truncate">
            {player.name}
          </span>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1 shrink-0">
          {player.isBot && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-300">
              BOT
            </span>
          )}
          {player.bankrupt && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
              Phá Sản
            </span>
          )}
          {player.inAudit && !player.bankrupt && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Kiểm Toán
            </span>
          )}
          {isCurrentTurn && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
              LƯỢT
            </span>
          )}
        </div>
      </div>

      {/* Dữ liệu tài chính: Tiền mặt + Net Worth */}
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-600 uppercase font-semibold">Tiền mặt</span>
          <span className={`tabular-nums ${balanceColorClass}`}>
            {formatCurrency(player.balance)}
          </span>
          {isNegativeBalance && (
            <span className="text-[10px] text-rose-700 font-semibold mt-0.5">
              Thấu chi: còn {player.overdraftRoundsLeft ?? 3} vòng
            </span>
          )}
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-slate-600 uppercase font-semibold">Tài sản ròng</span>
          <span className="font-bold text-slate-900 tabular-nums">
            {formatCurrency(netWorth)}
          </span>
        </div>
      </div>

      {/* Dải chấm màu nhóm đất sở hữu */}
      {ownedGroups.length > 0 && (
        <div className="flex items-center gap-1 pt-1 border-t border-slate-300">
          <span className="text-[9px] text-slate-600 uppercase tracking-tighter mr-0.5 font-bold">
            BĐS:
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {ownedGroups.map((group) => (
              <span
                key={group}
                className="w-2.5 h-2.5 rounded-full border border-slate-900/40 shadow-xs"
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
