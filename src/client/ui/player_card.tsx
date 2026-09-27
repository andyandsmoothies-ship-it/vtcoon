import React from 'react';
import { useGameStore, type PlayerHudInfo } from '../store/game_store';
import { formatCurrency, calculatePlayerNetWorth, formatShortPlayerName } from './ui_helpers';
import { BOARD_CONFIG, ColorGroup } from '../../domain/board_config';
import { COLOR_GROUP_HEX } from '../../domain/theme';
import { getEmoteDef } from '../../domain/emotes';
import { getPawnConfigBySlot } from '../3d/luxury_pawn_models';
import { ChanceCardId } from '../../domain/event_card_engine';

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
      data-in-turn={isCurrentTurn ? 'true' : 'false'}
      className={`pointer-events-auto relative flex flex-col gap-1.5 p-2.5 sm:p-3 rounded-xl border-2 transition-all duration-200 w-full ${
        isCurrentTurn
          ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400 shadow-[0_6px_0_0_#0f172a]'
          : 'border-slate-900 bg-[#FFFDF8] shadow-[0_4px_0_0_#0f172a]'
      } text-slate-900 ${player.bankrupt ? 'opacity-50 grayscale' : ''}`}
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

      {/* Dòng 1 (Header siêu gọn): Chấm màu & Tên (Trái) | Số tiền & Trạng thái (Căn Phải) */}
      <div className="flex items-center justify-between gap-1.5 min-w-0 w-full">
        {/* Cột trái: Quân cờ & Tên người chơi */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {/* Chấm màu nhận diện quân cờ trên bàn 3D (thay thế avatar cồng kềnh) */}
          <div
            data-testid={`player-pawn-badge-${player.id}`}
            data-legacy-size="w-8 h-8"
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-slate-900 shadow-2xs shrink-0 select-none relative"
            style={{ backgroundColor: player.tokenColor || '#38BDF8' }}
            title={`${player.name} (${pawnConfig.name})`}
            aria-label={`Màu quân cờ: ${pawnConfig.name}`}
          >
            <span className="sr-only" aria-hidden="true">
              {pawnConfig.icon}
            </span>
            {Boolean(player.hand?.includes(ChanceCardId.CC_DIPLOMATIC)) && (
              <span
                className="absolute -top-1.5 -right-2 text-[9px] leading-none select-none"
                title="Giữ Thẻ Miễn Trừ Ngoại Giao"
                aria-label="Giữ Thẻ Miễn Trừ Ngoại Giao"
              >
                🤝
              </span>
            )}
          </div>

          <span
            className="text-xs sm:text-sm font-bold text-slate-900 truncate"
            title={player.name}
          >
            {formatShortPlayerName(player.name)}
          </span>
        </div>

        {/* Cột phải (Căn lề phải): Số tiền mặt, Cảnh báo thấu chi, Tài sản ròng & Badge Phá Sản */}
        <div className="flex items-center justify-end gap-1.5 shrink-0 text-right">
          <span className={`tabular-nums text-xs ${balanceColorClass} shrink-0`}>
            {formatCurrency(player.balance)}
          </span>

          {isNegativeBalance && (
            <span
              className="text-[9px] font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.2 rounded shrink-0 leading-tight"
              title={`Thấu chi: còn ${player.overdraftRoundsLeft ?? 3} vòng`}
            >
              <span className="inline sm:hidden">Nợ {player.overdraftRoundsLeft ?? 3}v</span>
              <span className="hidden sm:inline">Thấu chi: còn {player.overdraftRoundsLeft ?? 3} vòng</span>
            </span>
          )}

          <span className="hidden sm:flex items-center text-[10px] text-slate-400 font-semibold tabular-nums shrink-0" data-testid="player-net-worth" title="Tài sản ròng">
            ({formatCurrency(netWorth)})
          </span>

          {player.bankrupt && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300">
              Phá Sản
            </span>
          )}
        </div>
      </div>

      {/* Dòng 3: Cụm 22 chấm BĐS sắp xếp 2 dòng đối xứng (11 chấm/dòng) giúp nhận diện rõ màu sắc */}
      <span className="sr-only">BĐS:</span>
      <div
        className="flex flex-col gap-1 w-full px-2 pt-1.5 pb-1 border-t border-slate-300 select-none"
        data-testid="player-property-clusters"
      >
        {[PROPERTY_CLUSTERS.slice(0, 4), PROPERTY_CLUSTERS.slice(4, 8)].map((clusterRow, rowIdx) => (
          <div
            key={rowIdx}
            data-testid={`property-clusters-row-${rowIdx + 1}`}
            className="flex items-center justify-between w-full"
          >
            {clusterRow.map(({ group, cells }) => (
              <div
                key={group}
                className="flex items-center gap-1 sm:gap-1.5 shrink-0"
                data-testid={`cluster-${group}`}
              >
                {cells.map((cell) => {
                  const isOwned = Boolean(player.ownedProperties?.includes(cell.index));
                  return (
                    <span
                      key={cell.index}
                      data-testid={`dot-cell-${cell.index}`}
                      data-owned={isOwned ? 'true' : 'false'}
                      className={`w-2 h-2 sm:w-[9px] sm:h-[9px] md:w-2.5 md:h-2.5 rounded-full transition-all shrink-0 ${
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
        ))}
      </div>
    </div>
  );
}
