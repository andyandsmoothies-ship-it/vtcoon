import React from 'react';
import { useGameStore, type PlayerHudInfo } from '../store/game_store';
import { formatCurrency, calculatePlayerNetWorth, formatShortPlayerName } from './ui_helpers';
import { BOARD_CONFIG, ColorGroup } from '../../domain/board_config';
import { COLOR_GROUP_HEX } from '../../domain/theme';
import { getEmoteDef } from '../../domain/emotes';
import { getPawnConfigBySlot } from '../3d/luxury_pawn_models';

const PROPERTY_COLOR_GROUP_ORDER: readonly ColorGroup[] = [
  ColorGroup.Nau,
  ColorGroup.XanhDaTroi,
  ColorGroup.Hong,
  ColorGroup.Cam,
  ColorGroup.Do,
  ColorGroup.Vang,
  ColorGroup.XanhLa,
  ColorGroup.Tim,
];

export const PROPERTY_CLUSTERS: readonly {
  readonly group: ColorGroup;
  readonly cells: readonly { readonly index: number; readonly name: string }[];
}[] = PROPERTY_COLOR_GROUP_ORDER.map((group) => ({
  group,
  cells: BOARD_CONFIG.filter((c) => c.colorGroup === group).map((c) => ({
    index: c.index,
    name: c.name,
  })),
}));

interface PlayerCardProps {
  readonly player: PlayerHudInfo;
  readonly isCurrentTurn: boolean;
  readonly levelMap: Record<number, 0 | 1 | 2 | 3>;
  readonly slotIndex?: number;
}

function getSlotFromPlayer(player: PlayerHudInfo, explicitSlot?: number): number {
  if (typeof explicitSlot === 'number') return explicitSlot;
  if (typeof player.pawnSlot === 'number') return player.pawnSlot;
  if (typeof player.ownerSlot === 'number') return player.ownerSlot;
  if (player.id === 'p1' || player.id.includes('p1')) return 0;
  if (player.id.includes('bot_3') || player.id === 'p4' || player.id.includes('player_4')) return 3;
  if (player.id.includes('bot_2') || player.id === 'p3' || player.id.includes('player_3')) return 2;
  if (player.id.includes('bot_1') || player.id === 'p2' || player.id.includes('player_2')) return 1;
  if (player.id.includes('4')) return 3;
  if (player.id.includes('3')) return 2;
  if (player.id.includes('2')) return 1;
  return 0;
}

export function PlayerCard({
  player,
  isCurrentTurn,
  levelMap,
  slotIndex,
}: PlayerCardProps): React.ReactElement {
  const activeEmote = useGameStore((state) => state.activeEmotes[player.id]);
  const resolvedSlot = getSlotFromPlayer(player, slotIndex);
  const pawnConfig = getPawnConfigBySlot(resolvedSlot);

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

  return (
    <div
      data-testid="player-ribbon"
      className={`pointer-events-auto relative flex flex-col gap-1.5 p-2.5 sm:p-3 rounded-xl border-2 border-slate-900 bg-[#FFFDF8] text-slate-900 transition-all duration-200 w-full ${
        isCurrentTurn
          ? 'ring-2 ring-amber-400 shadow-[0_6px_0_0_#0f172a]'
          : 'shadow-[0_4px_0_0_#0f172a]'
      } ${player.bankrupt ? 'opacity-50 grayscale' : ''}`}
      role="region"
      aria-label={`Thông tin ${player.name}`}
    >
      {/* Huy hiệu LƯỢT nổi bật trên đỉnh thẻ (Corner Tab) */}
      {isCurrentTurn && (
        <span
          className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-200 text-amber-950 border border-amber-400 shadow-xs animate-pulse select-none uppercase tracking-wider z-10"
        >
          LƯỢT
        </span>
      )}

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

      {/* Dòng 1 (Header): Token avatar, Tên, Badges */}
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div
            data-testid={`player-pawn-badge-${player.id}`}
            data-legacy-size="w-8 h-8"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-sm sm:text-base shadow-xs shrink-0 select-none leading-none"
            style={{ backgroundColor: player.tokenColor || '#38BDF8' }}
            title={pawnConfig.name}
            aria-label={`Linh vật: ${pawnConfig.name}`}
          >
            <span role="img" aria-hidden="true">
              {pawnConfig.icon}
            </span>
          </div>
          <span
            className="text-xs sm:text-sm font-bold text-slate-900 truncate"
            title={player.name}
          >
            {formatShortPlayerName(player.name)}
          </span>
        </div>

        {/* Badges: BOT, Phá Sản, Kiểm Toán */}
        <div className="flex items-center gap-1 shrink-0">
          {player.isBot && (
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-cyan-100 text-cyan-900 border border-cyan-300">
              BOT
            </span>
          )}
          {player.bankrupt && (
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300">
              Phá Sản
            </span>
          )}
          {player.inAudit && !player.bankrupt && (
            <span
              className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center leading-none"
              title="Kiểm Toán"
              aria-label="Kiểm Toán"
            >
              <span role="img" aria-hidden="true">⚖️</span>
            </span>
          )}
        </div>
      </div>

      {/* Dòng 2: Dữ liệu tài chính & BĐS gọn gàng, không để trống bên phải */}
      <div className="flex items-center justify-between gap-1 text-xs">
        <div className="flex items-center gap-1 min-w-0">
          <span className={`tabular-nums text-xs ${balanceColorClass}`}>
            {formatCurrency(player.balance)}
          </span>
          {isNegativeBalance && (
            <span
              className="text-[9px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded shrink-0"
              title={`Thấu chi: còn ${player.overdraftRoundsLeft ?? 3} vòng`}
            >
              <span className="inline sm:hidden">Nợ {player.overdraftRoundsLeft ?? 3}v</span>
              <span className="hidden sm:inline">Thấu chi: còn {player.overdraftRoundsLeft ?? 3} vòng</span>
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1 shrink-0 pr-0.5" data-testid="player-net-worth">
          <span className="text-[10px] text-slate-500 font-semibold tabular-nums" title="Tài sản ròng">
            ({formatCurrency(netWorth)})
          </span>
        </div>
      </div>

      {/* Dòng 3: Dải 22 chấm BĐS trải đều 100% bề ngang theo 8 cụm màu */}
      <span className="sr-only">BĐS:</span>
      <div
        className="flex items-center justify-between w-full pt-1.5 pb-0.5 border-t border-slate-300 select-none"
        data-testid="player-property-clusters"
      >
        {PROPERTY_CLUSTERS.map(({ group, cells }) => (
          <div
            key={group}
            className="flex items-center gap-[1px] sm:gap-[1.5px] shrink-0"
            data-testid={`cluster-${group}`}
          >
            {cells.map((cell) => {
              const isOwned = Boolean(player.ownedProperties?.includes(cell.index));
              return (
                <span
                  key={cell.index}
                  data-testid={`dot-cell-${cell.index}`}
                  data-owned={isOwned ? 'true' : 'false'}
                  className={`w-1 h-1 sm:w-[5.5px] sm:h-[5.5px] md:w-2 md:h-2 rounded-full transition-all shrink-0 ${
                    isOwned
                      ? 'border border-slate-900/50 shadow-2xs'
                      : 'border border-slate-300 bg-slate-100/70'
                  }`}
                  style={isOwned ? { backgroundColor: COLOR_GROUP_HEX[group] } : undefined}
                  title={`${cell.name}: ${isOwned ? 'Đã sở hữu' : 'Chưa sở hữu'}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
